import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { directoryPlugin } from '../plugins/directory/index.js';
import { gitPlugin } from '../plugins/git/index.js';
import { nodeVersionPlugin } from '../plugins/node-version/index.js';
import { claudeTokensPlugin } from '../plugins/claude-tokens/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class PluginManager {
    plugins = new Map();
    config;
    constructor(configPath) {
        // Register available plugins
        this.registerPlugin(directoryPlugin);
        this.registerPlugin(gitPlugin);
        this.registerPlugin(nodeVersionPlugin);
        this.registerPlugin(claudeTokensPlugin);
        // Load user configuration (optional)
        const defaultConfigPath = join(__dirname, '../../config.json');
        const actualConfigPath = configPath || defaultConfigPath;
        let userConfig = null;
        if (existsSync(actualConfigPath)) {
            try {
                const configContent = readFileSync(actualConfigPath, 'utf-8');
                userConfig = JSON.parse(configContent);
            }
            catch (error) {
                console.error(`Warning: Failed to load user config from ${actualConfigPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        // Merge configurations
        this.config = this.mergeConfigs(userConfig);
    }
    mergeConfigs(userConfig) {
        // Merge root-level config
        const defaultRootConfig = { separator: ' ', plugins: [] };
        const rootConfig = { ...defaultRootConfig, ...userConfig };
        return {
            separator: rootConfig.separator,
            plugins: rootConfig.plugins
        };
    }
    registerPlugin(plugin) {
        this.plugins.set(plugin.name, plugin);
    }
    async execute(context) {
        const results = [];
        const errors = [];
        // Execute each plugin in order (order = array position)
        for (const userPluginConfig of this.config.plugins) {
            const plugin = this.plugins.get(userPluginConfig.name);
            if (!plugin) {
                errors.push(`Plugin "${userPluginConfig.name}" not found`);
                continue;
            }
            try {
                const result = await Promise.resolve(plugin.execute(context, userPluginConfig));
                if (result.error) {
                    errors.push(`${userPluginConfig.name}: ${result.error}`);
                }
                if (result.content) {
                    results.push(result.content);
                }
            }
            catch (error) {
                errors.push(`${userPluginConfig.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        // Log errors if any (but don't block display)
        if (errors.length > 0 && process.env.DEBUG) {
            console.error('Plugin errors:', errors);
        }
        // Assemble results with separator
        return results.join(this.config.separator);
    }
    getConfig() {
        return this.config;
    }
    getPlugin(name) {
        return this.plugins.get(name);
    }
    listPlugins() {
        return Array.from(this.plugins.keys());
    }
}
