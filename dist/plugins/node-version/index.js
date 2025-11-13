import { colors } from '../../lib/constant.js';
export const nodeVersionPlugin = {
    name: 'node-version',
    execute(context, config) {
        try {
            // Common options (from config root)
            const prefix = config.prefix || '';
            const suffix = config.suffix || '';
            const icon = config.icon || '⬢';
            const color = config.color || 'green';
            // Specific options (from config.options)
            const options = config.options;
            const format = options?.format || 'short';
            const nodeVersion = process.version;
            const displayVersion = format === 'short' ? nodeVersion.replace(/^v/, '') : nodeVersion;
            const colorCode = colors[color] || colors.green;
            const content = `${prefix}${colorCode}${icon} ${displayVersion}${colors.reset}${suffix}`;
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
