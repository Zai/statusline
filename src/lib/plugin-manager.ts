import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Plugin, PluginConfig, PluginContext, PluginResult } from '../types/plugin.js';
import { directoryPlugin } from '../plugins/directory/index.js';
import { gitPlugin } from '../plugins/git/index.js';
import { nodeVersionPlugin } from '../plugins/node-version/index.js';
import { claudeTokensPlugin } from '../plugins/claude-tokens/index.js';
import { deepMerge } from './merge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Config {
  plugins: PluginConfig[];
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private pluginDefaults: Map<string, PluginConfig> = new Map();
  private config: Config;

  constructor(configPath?: string) {
    // Register available plugins
    this.registerPlugin(directoryPlugin);
    this.registerPlugin(gitPlugin);
    this.registerPlugin(nodeVersionPlugin);
    this.registerPlugin(claudeTokensPlugin);

    // Load default configurations for each plugin
    this.loadPluginDefaults();

    // Load user configuration (optional)
    const defaultConfigPath = join(__dirname, '../../config.json');
    const actualConfigPath = configPath || defaultConfigPath;

    let userConfig: Config | null = null;
    if (existsSync(actualConfigPath)) {
      try {
        const configContent = readFileSync(actualConfigPath, 'utf-8');
        userConfig = JSON.parse(configContent);
      } catch (error) {
        console.error(
          `Warning: Failed to load user config from ${actualConfigPath}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    // Merge configurations
    this.config = this.mergeConfigs(userConfig);
  }

  private loadPluginDefaults(): void {
    for (const [pluginName] of this.plugins) {
      const configPath = join(__dirname, `../plugins/${pluginName}/config.json`);
      try {
        const configContent = readFileSync(configPath, 'utf-8');
        const defaultConfig: PluginConfig = JSON.parse(configContent);
        this.pluginDefaults.set(pluginName, defaultConfig);
      } catch (error) {
        console.error(
          `Warning: Failed to load default config for plugin "${pluginName}": ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }
  }

  private mergeConfigs(userConfig: Config | null): Config {
    const mergedPlugins: PluginConfig[] = [];

    // For each registered plugin
    for (const [pluginName, defaultConfig] of this.pluginDefaults) {
      // Find user config for this plugin
      const userPluginConfig = userConfig?.plugins.find((p) => p.name === pluginName);

      if (userPluginConfig) {
        // Merge user config with defaults
        const merged = deepMerge(defaultConfig, userPluginConfig);
        mergedPlugins.push(merged);
      } else {
        // Use defaults
        mergedPlugins.push(defaultConfig);
      }
    }

    // Sort by order
    mergedPlugins.sort((a, b) => a.order - b.order);

    return { plugins: mergedPlugins };
  }

  private registerPlugin(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  public async execute(context: PluginContext): Promise<string> {
    const results: Array<{ order: number; content: string }> = [];
    const errors: string[] = [];

    // Filter enabled plugins and sort by order
    const enabledPlugins = this.config.plugins
      .filter((config) => config.enabled)
      .sort((a, b) => a.order - b.order);

    // Execute each plugin
    for (const pluginConfig of enabledPlugins) {
      const plugin = this.plugins.get(pluginConfig.name);

      if (!plugin) {
        errors.push(`Plugin "${pluginConfig.name}" not found`);
        continue;
      }

      try {
        const result: PluginResult = await Promise.resolve(
          plugin.execute(context, pluginConfig)
        );

        if (result.error) {
          errors.push(`${pluginConfig.name}: ${result.error}`);
        }

        if (result.content) {
          results.push({
            order: pluginConfig.order,
            content: result.content,
          });
        }
      } catch (error) {
        errors.push(
          `${pluginConfig.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Log errors if any (but don't block display)
    if (errors.length > 0 && process.env.DEBUG) {
      console.error('Plugin errors:', errors);
    }

    // Assemble results
    return results.map((r) => r.content).join('');
  }

  public getConfig(): Config {
    return this.config;
  }

  public getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  public listPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
}
