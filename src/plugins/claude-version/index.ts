import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { colors } from "../../lib/constant.js";
import {
  Plugin,
  PluginConfig,
  PluginContext,
  PluginResult,
} from "../../types/plugin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load default config
const defaultConfig: PluginConfig = JSON.parse(
  readFileSync(join(__dirname, "default.json"), "utf-8")
);

export default {
  name: "claude-version",

  execute(context: PluginContext, userConfig: PluginConfig): PluginResult {
    try {
      // Merge default config with user config
      const config = { ...defaultConfig, ...userConfig };

      // Get version from input
      const version = context.input.version;

      if (!version) {
        return { content: "" };
      }

      const colorCode = colors[config.color as keyof typeof colors];
      const content = `${colorCode}${config.prefix} ${version}${colors.reset}`;

      return { content };
    } catch (error) {
      return {
        content: "",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error in claude-version plugin",
      };
    }
  },
} as Plugin;
