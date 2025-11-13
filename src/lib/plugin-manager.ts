import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Plugin, PluginConfig, PluginContext, PluginResult } from '../types/plugin.js';
import { colors } from './constant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Config {
  separator?: string;
  plugins: PluginConfig[];
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private config: Config;
  private loadErrors: Map<string, string> = new Map();

  constructor(configPath?: string) {
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

  /**
   * Initialize and dynamically load plugins based on config
   */
  public async init(): Promise<void> {
    const pluginNames = this.config.plugins.map((p) => p.name);

    // Load each plugin dynamically
    for (const pluginName of pluginNames) {
      try {
        // Dynamic import from plugins folder
        const pluginModule = await import(`../plugins/${pluginName}/index.js`);
        const plugin = pluginModule.default as Plugin;

        // Validate plugin structure
        if (!plugin || !plugin.name || !plugin.execute) {
          throw new Error(`Invalid plugin structure in ${pluginName}`);
        }

        // Validate plugin name matches
        if (plugin.name !== pluginName) {
          console.warn(
            `Warning: Plugin name mismatch. Expected "${pluginName}", got "${plugin.name}"`
          );
        }

        // Register the plugin
        this.registerPlugin(plugin);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        this.loadErrors.set(pluginName, errorMsg);
        console.error(`Failed to load plugin "${pluginName}": ${errorMsg}`);
      }
    }
  }

  private mergeConfigs(userConfig: Config | null): Config {
    // Merge root-level config
    const defaultRootConfig = { separator: ' ', plugins: [] };
    const rootConfig = { ...defaultRootConfig, ...userConfig };

    return {
      separator: rootConfig.separator,
      plugins: rootConfig.plugins
    };
  }

  private registerPlugin(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  public async execute(context: PluginContext): Promise<string> {
    const results: string[] = [];
    const errors: string[] = [];

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
        } else {
          // Plugin not found at all
          results.push(`${colors.red}❌ ${userPluginConfig.name}${colors.reset}`);
          errors.push(`Plugin "${userPluginConfig.name}" not found`);
        }
        continue;
      }

      try {
        const result: PluginResult = await Promise.resolve(
          plugin.execute(context, userPluginConfig)
        );

        if (result.error) {
          errors.push(`${userPluginConfig.name}: ${result.error}`);
        }

        if (result.content) {
          results.push(result.content);
        }
      } catch (error) {
        errors.push(
          `${userPluginConfig.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Log errors if any (but don't block display)
    if (errors.length > 0 && process.env.DEBUG) {
      console.error('Plugin errors:', errors);
    }

    // Assemble results with separator
    return results.join(this.config.separator);
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
