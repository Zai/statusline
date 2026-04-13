import { readFileSync } from 'fs';
/**
 * Determine the context window size based on model ID.
 * Model IDs ending with [1m] indicate the 1M context variant.
 * Falls back to 200k if the model is unknown.
 */
function getMaxTokensForModel(modelId) {
    if (!modelId)
        return 200_000;
    if (modelId.includes('[1m]')) {
        return 1_000_000;
    }
    return 200_000;
}
export function parseTranscript(transcriptPath, modelId) {
    try {
        const content = readFileSync(transcriptPath, 'utf-8');
        const lines = content.trim().split('\n');
        // Trouver le dernier message assistant avec des informations d'usage
        let lastUsage = null;
        for (const line of lines) {
            try {
                const message = JSON.parse(line);
                // Seuls les messages assistant ont des informations d'usage
                if (message.type === 'assistant' && message.message?.usage) {
                    lastUsage = message.message.usage;
                }
            }
            catch (e) {
                // Ignorer les lignes mal formées
                continue;
            }
        }
        // Si aucun usage trouvé, retourner null
        if (!lastUsage) {
            return null;
        }
        // Le dernier message contient TOUT le contexte:
        // - input_tokens: système + tools + messages précédents (incluant leurs outputs)
        // - output_tokens: la réponse actuelle de l'assistant
        // - cache_*_tokens: tokens en cache
        const totalInputTokens = lastUsage.input_tokens || 0;
        const totalCacheCreationTokens = lastUsage.cache_creation_input_tokens || 0;
        const totalCacheReadTokens = lastUsage.cache_read_input_tokens || 0;
        const totalOutputTokens = lastUsage.output_tokens || 0;
        // Le contexte total = input + cache (sans output, qui sera inclus dans l'input du prochain appel)
        const contextTokens = totalInputTokens +
            totalCacheCreationTokens +
            totalCacheReadTokens;
        const maxTokens = getMaxTokensForModel(modelId);
        const totalTokens = contextTokens;
        const percentage = (totalTokens / maxTokens) * 100;
        return {
            totalInputTokens,
            totalCacheCreationTokens,
            totalCacheReadTokens,
            totalOutputTokens,
            totalTokens,
            maxTokens,
            percentage,
        };
    }
    catch (error) {
        return null;
    }
}
