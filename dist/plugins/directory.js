import { colors } from '../lib/constant.js';
export const directoryPlugin = {
    name: 'directory',
    execute(context, options) {
        try {
            const icon = options?.icon || '📁';
            const color = options?.color || 'blue';
            const showFullPath = options?.showFullPath || false;
            const displayPath = showFullPath ? context.currentDir : context.dirName;
            const colorCode = colors[color] || colors.blue;
            const content = `${colors.bright}${colorCode}${icon} ${displayPath}${colors.reset}`;
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
