import { colors } from '../lib/constant.js';
import { parseTranscript } from '../lib/transcript-parser.js';
export const claudeTokensPlugin = {
    name: 'claude-tokens',
    execute(context, options) {
        try {
            const showPercentage = options?.showPercentage ?? true;
            const showCount = options?.showCount ?? true;
            const color = options?.color || 'cyan';
            const icon = options?.icon || '🔵';
            const format = options?.format || 'compact';
            // Essayer de lire le transcript si disponible
            if (context.input.transcript_path) {
                const tokenUsage = parseTranscript(context.input.transcript_path);
                if (tokenUsage) {
                    const usedTokens = tokenUsage.totalTokens;
                    const maxTokens = tokenUsage.maxTokens;
                    const percentage = tokenUsage.percentage.toFixed(1);
                    const colorCode = colors[color] || colors.cyan;
                    let content = ` ${colorCode}${icon}`;
                    if (format === 'full') {
                        if (showCount) {
                            content += ` ${usedTokens.toLocaleString()}`;
                            if (maxTokens > 0) {
                                content += `/${maxTokens.toLocaleString()}`;
                            }
                        }
                        if (showPercentage && maxTokens > 0) {
                            content += ` (${percentage}%)`;
                        }
                    }
                    else {
                        // compact format
                        if (showCount && showPercentage && maxTokens > 0) {
                            content += ` ${(usedTokens / 1000).toFixed(1)}k/${(maxTokens / 1000).toFixed(0)}k (${percentage}%)`;
                        }
                        else if (showCount) {
                            content += ` ${(usedTokens / 1000).toFixed(1)}k`;
                        }
                        else if (showPercentage && maxTokens > 0) {
                            content += ` ${percentage}%`;
                        }
                    }
                    content += colors.reset;
                    return { content };
                }
            }
            // Fallback: essayer les anciennes méthodes si transcript n'est pas disponible
            let usedTokens = 0;
            let maxTokens = 0;
            if (context.input.context) {
                usedTokens = context.input.context.used_tokens || 0;
                maxTokens = context.input.context.max_tokens || 0;
            }
            else if (context.input.usage) {
                usedTokens = context.input.usage.total_tokens || 0;
                maxTokens = 200000;
            }
            // Si pas de données disponibles, ne rien afficher
            if (usedTokens === 0 && maxTokens === 0) {
                return { content: '' };
            }
            const percentage = maxTokens > 0 ? ((usedTokens / maxTokens) * 100).toFixed(1) : '0';
            const colorCode = colors[color] || colors.cyan;
            let content = ` ${colorCode}${icon}`;
            if (format === 'full') {
                if (showCount) {
                    content += ` ${usedTokens.toLocaleString()}`;
                    if (maxTokens > 0) {
                        content += `/${maxTokens.toLocaleString()}`;
                    }
                }
                if (showPercentage && maxTokens > 0) {
                    content += ` (${percentage}%)`;
                }
            }
            else {
                // compact format
                if (showCount && showPercentage && maxTokens > 0) {
                    content += ` ${(usedTokens / 1000).toFixed(1)}k/${(maxTokens / 1000).toFixed(0)}k (${percentage}%)`;
                }
                else if (showCount) {
                    content += ` ${(usedTokens / 1000).toFixed(1)}k`;
                }
                else if (showPercentage && maxTokens > 0) {
                    content += ` ${percentage}%`;
                }
            }
            content += colors.reset;
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
