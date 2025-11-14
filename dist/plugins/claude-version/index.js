import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { colors } from "../../lib/constant.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load default config
const defaultConfig = JSON.parse(readFileSync(join(__dirname, "default.json"), "utf-8"));
export default {
    name: "claude-version",
    execute(context, userConfig) {
        try {
            // Merge default config with user config
            const config = { ...defaultConfig, ...userConfig };
            // Get version from input
            const version = context.input.version;
            if (!version) {
                return { content: "" };
            }
            const colorCode = colors[config.color];
            const content = `${colorCode}${config.prefix} ${version}${colors.reset}`;
            return { content };
        }
        catch (error) {
            return {
                content: "",
                error: error instanceof Error
                    ? error.message
                    : "Unknown error in claude-version plugin",
            };
        }
    },
};
