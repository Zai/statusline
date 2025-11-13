import { colors } from '../../lib/constant.js';
export const directoryPlugin = {
    name: 'directory',
    execute(context, config) {
        try {
            // Common options (from config root)
            const prefix = config.prefix || '';
            const suffix = config.suffix || '';
            const icon = config.icon || '📁';
            const color = config.color || 'blue';
            // Specific options (from config.options)
            const options = config.options;
            const showFullPath = options?.showFullPath || false;
            const displayPath = showFullPath ? context.currentDir : context.dirName;
            const colorCode = colors[color] || colors.blue;
            const content = `${prefix}${colors.bright}${colorCode}${icon} ${displayPath}${colors.reset}${suffix}`;
            return { content };
        }
        catch (error) {
            return {
                content: '',
                error: error instanceof Error ? error.message : 'Unknown error in directory plugin',
            };
        }
    },
};
