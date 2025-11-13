import { colors } from '../lib/constant.js';
export const nodeVersionPlugin = {
    name: 'node-version',
    execute(context, options) {
        try {
            const icon = options?.icon || '⬢';
            const format = options?.format || 'short';
            const color = options?.color || 'green';
            const prefix = options?.prefix || '';
            const nodeVersion = process.version;
            const displayVersion = format === 'short' ? nodeVersion.replace(/^v/, '') : nodeVersion;
            const colorCode = colors[color] || colors.green;
            const content = ` ${colorCode}${icon}${prefix}${displayVersion}${colors.reset}`;
            return { content };
        }
        catch (error) {
            return {
                content: '',
                error: error instanceof Error ? error.message : 'Unknown error in node-version plugin',
            };
        }
    },
};
