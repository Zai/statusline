import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { colors } from "../../lib/constant.js";
import { parseTranscript } from "./transcript-parser.js";
import { deepMerge } from "../../lib/merge.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load default config
const defaultConfig = JSON.parse(readFileSync(join(__dirname, "default.json"), "utf-8"));
function formatCompactTokens(tokens) {
    if (tokens >= 1_000_000) {
        return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}m`;
    }
    return `${(tokens / 1000).toFixed(1)}k`;
}
function formatTokenContent(usedTokens, maxTokens, percentage, showCount, showPercentage, format) {
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
    }
    else {
        // compact format
        if (showCount && showPercentage && maxTokens > 0) {
            result += ` ${formatCompactTokens(usedTokens)}/${formatCompactTokens(maxTokens)} (${percentage}%)`;
        }
        else if (showCount) {
            result += ` ${formatCompactTokens(usedTokens)}`;
        }
        else if (showPercentage && maxTokens > 0) {
            result += ` ${percentage}%`;
        }
    }
    return result;
}
export default {
    name: "claude-tokens",
    execute(context, userConfig) {
        try {
            // Merge default config with user config
            const config = deepMerge(defaultConfig, userConfig);
            const options = config.options;
            let usedTokens = 0;
            let maxTokens = 0;
            let percentage = "0";
            // Try to read transcript if available
            if (context.input.transcript_path) {
                const tokenUsage = parseTranscript(context.input.transcript_path, context.input.model?.id);
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
            const colorCode = colors[config.color];
            const tokenContent = formatTokenContent(usedTokens, maxTokens, percentage, options.showCount, options.showPercentage, options.format);
            const content = `${colorCode}${config.prefix}${tokenContent}${colors.reset}`;
            return { content };
        }
        catch (error) {
            return {
                content: "",
                error: error instanceof Error
                    ? error.message
                    : "Unknown error in claude-tokens plugin",
            };
        }
    },
};
