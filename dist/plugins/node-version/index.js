import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { colors } from '../../lib/constant.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load default config
const defaultConfig = JSON.parse(readFileSync(join(__dirname, 'default.json'), 'utf-8'));
export default {
    name: 'node-version',
    execute(context, userConfig) {
        try {
            // Merge default config with user config
            const config = { ...defaultConfig, ...userConfig };
            const options = config.options;
            const nodeVersion = process.version;
            const displayVersion = options?.format === 'short' ? nodeVersion.replace(/^v/, '') : nodeVersion;
            const colorCode = colors[config.color];
            const content = `${colorCode}${config.prefix} ${displayVersion}${colors.reset}`;
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
