import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { colors } from './constant.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class PluginManager {
    plugins = new Map();
    config;
    loadErrors = new Map();
    constructor(configPath) {
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
    /**
     * Initialize and dynamically load plugins based on config
     */
    async init() {
        const pluginNames = this.config.plugins.map((p) => p.name);
        // Load each plugin dynamically
        for (const pluginName of pluginNames) {
            try {
                // Dynamic import from plugins folder
                const pluginModule = await import(`../plugins/${pluginName}/index.js`);
                const plugin = pluginModule.default;
                // Validate plugin structure
                if (!plugin || !plugin.name || !plugin.execute) {
                    throw new Error(`Invalid plugin structure in ${pluginName}`);
                }
                // Validate plugin name matches
                if (plugin.name !== pluginName) {
                    console.warn(`Warning: Plugin name mismatch. Expected "${pluginName}", got "${plugin.name}"`);
                }
                // Register the plugin
                this.registerPlugin(plugin);
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                this.loadErrors.set(pluginName, errorMsg);
                console.error(`Failed to load plugin "${pluginName}": ${errorMsg}`);
            }
        }
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
            // If plugin failed to load, show error in statusline
            if (!plugin) {
                const loadError = this.loadErrors.get(userPluginConfig.name);
                if (loadError) {
                    // Show visible error in statusline
                    results.push(`${colors.red}❌ ${userPluginConfig.name}${colors.reset}`);
                    errors.push(`Plugin "${userPluginConfig.name}" failed to load: ${loadError}`);
                }
                else {
                    // Plugin not found at all
                    results.push(`${colors.red}❌ ${userPluginConfig.name}${colors.reset}`);
                    errors.push(`Plugin "${userPluginConfig.name}" not found`);
                }
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
