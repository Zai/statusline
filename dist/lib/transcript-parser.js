import { readFileSync } from 'fs';
export function parseTranscript(transcriptPath) {
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
        // Le contexte total réel = input + output du dernier message + cache
        // (input_tokens inclut déjà système + messages précédents)
        const contextTokens = totalInputTokens +
            totalOutputTokens +
            totalCacheCreationTokens +
            totalCacheReadTokens;
        // Ajouter l'autocompact buffer (constant à ~22.5% de la fenêtre, soit 45k pour 200k)
        // L'autocompact buffer est un espace réservé par Claude Code, non inclus dans l'usage API
        const autocompactBuffer = 45000;
        const totalTokens = contextTokens + autocompactBuffer;
        // Claude Sonnet 4.5 a une fenêtre de contexte de 200k tokens
        const maxTokens = 200000;
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
