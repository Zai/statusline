import { Plugin, PluginContext, PluginConfig, PluginResult } from '../../types/plugin.js';
import { colors } from '../../lib/constant.js';

interface DirectoryOptions {
  showFullPath?: boolean;
}

export const directoryPlugin: Plugin = {
  name: 'directory',

  execute(context: PluginContext, config: PluginConfig): PluginResult {
    try {
      // Common options (from config root)
      const prefix = config.prefix || '';
      const suffix = config.suffix || '';
      const icon = config.icon || '📁';
      const color = config.color || 'blue';

      // Specific options (from config.options)
      const options = config.options as DirectoryOptions | undefined;
      const showFullPath = options?.showFullPath || false;

      const displayPath = showFullPath ? context.currentDir : context.dirName;
      const colorCode = colors[color as keyof typeof colors] || colors.blue;

      const content = `${prefix}${colors.bright}${colorCode}${icon} ${displayPath}${colors.reset}${suffix}`;

      return { content };
    } catch (error) {
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error in directory plugin',
      };
    }
  },
};
