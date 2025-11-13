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
import { parseTranscript } from "./transcript-parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ClaudeTokensOptions {
  showPercentage?: boolean;
  showCount?: boolean;
  format?: "compact" | "full";
}

// Load default config
const defaultConfig: PluginConfig = JSON.parse(
  readFileSync(join(__dirname, "default.json"), "utf-8")
);

function formatTokenContent(
  usedTokens: number,
  maxTokens: number,
  percentage: string,
  showCount: boolean,
  showPercentage: boolean,
  format: "compact" | "full"
): string {
  let result = "";

  if (format === "full") {
    if (showCount) {
      result += ` ${usedTokens.toLocaleString()}`;
      if (maxTokens > 0) {
        result += `/${maxTokens.toLocaleString()}`;
      }
    }
    if (showPercentage && maxTokens > 0) {
      result += ` (${percentage}%)`;
    }
  } else {
    // compact format
    if (showCount && showPercentage && maxTokens > 0) {
      result += ` ${(usedTokens / 1000).toFixed(1)}k/${(
        maxTokens / 1000
      ).toFixed(0)}k (${percentage}%)`;
    } else if (showCount) {
      result += ` ${(usedTokens / 1000).toFixed(1)}k`;
    } else if (showPercentage && maxTokens > 0) {
      result += ` ${percentage}%`;
    }
  }

  return result;
}

export default {
  name: "claude-tokens",

  execute(context: PluginContext, userConfig: PluginConfig): PluginResult {
    try {
      // Merge default config with user config
      const config = { ...defaultConfig, ...userConfig };
      const options = config.options as ClaudeTokensOptions | undefined;

      let usedTokens = 0;
      let maxTokens = 0;
      let percentage = "0";

      // Try to read transcript if available
      if (context.input.transcript_path) {
        const tokenUsage = parseTranscript(context.input.transcript_path);

        if (tokenUsage) {
          usedTokens = tokenUsage.totalTokens;
          maxTokens = tokenUsage.maxTokens;
          percentage = tokenUsage.percentage.toFixed(1);
        }
      }

      // If no data available, display nothing
      if (usedTokens === 0 && maxTokens === 0) {
        return { content: "" };
      }

      const colorCode = colors[config.color as keyof typeof colors];
      const tokenContent = formatTokenContent(
        usedTokens,
        maxTokens,
        percentage,
        options!.showCount!,
        options!.showPercentage!,
        options!.format!
      );

      const content = `${colorCode}${config.icon}${tokenContent}${colors.reset}`;

      return { content };
    } catch (error) {
      return {
        content: "",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error in claude-tokens plugin",
      };
    }
  },
} as Plugin;
