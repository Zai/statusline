import { colors } from '../../lib/constant.js';
import { parseTranscript } from './transcript-parser.js';
function formatTokenContent(usedTokens, maxTokens, percentage, showCount, showPercentage, format) {
    let result = '';
    if (format === 'full') {
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
            result += ` ${(usedTokens / 1000).toFixed(1)}k/${(maxTokens / 1000).toFixed(0)}k (${percentage}%)`;
        }
        else if (showCount) {
            result += ` ${(usedTokens / 1000).toFixed(1)}k`;
        }
        else if (showPercentage && maxTokens > 0) {
            result += ` ${percentage}%`;
        }
    }
    return result;
}
export const claudeTokensPlugin = {
    name: 'claude-tokens',
    execute(context, config) {
        try {
            // Common options (from config root)
            const prefix = config.prefix || '';
            const suffix = config.suffix || '';
            const icon = config.icon || '🔵';
            const color = config.color || 'cyan';
            // Specific options (from config.options)
            const options = config.options;
            const showPercentage = options?.showPercentage ?? true;
            const showCount = options?.showCount ?? true;
            const format = options?.format || 'compact';
            let usedTokens = 0;
            let maxTokens = 0;
            let percentage = '0';
            // Try to read transcript if available
            if (context.input.transcript_path) {
                const tokenUsage = parseTranscript(context.input.transcript_path);
                if (tokenUsage) {
                    usedTokens = tokenUsage.totalTokens;
                    maxTokens = tokenUsage.maxTokens;
                    percentage = tokenUsage.percentage.toFixed(1);
                }
            }
            // Fallback: try old methods if transcript is not available
            if (usedTokens === 0 && maxTokens === 0) {
                if (context.input.context) {
                    usedTokens = context.input.context.used_tokens || 0;
                    maxTokens = context.input.context.max_tokens || 0;
                }
                else if (context.input.usage) {
                    usedTokens = context.input.usage.total_tokens || 0;
                    maxTokens = 200000;
                }
                percentage = maxTokens > 0 ? ((usedTokens / maxTokens) * 100).toFixed(1) : '0';
            }
            // If no data available, display nothing
            if (usedTokens === 0 && maxTokens === 0) {
                return { content: '' };
            }
            const colorCode = colors[color] || colors.cyan;
            const tokenContent = formatTokenContent(usedTokens, maxTokens, percentage, showCount, showPercentage, format);
            const content = `${prefix}${colorCode}${icon}${tokenContent}${colors.reset}${suffix}`;
            return { content };
        }
        catch (error) {
            return {
                content: '',
                error: error instanceof Error ? error.message : 'Unknown error in claude-tokens plugin',
            };
        }
    },
};
