/**
 * Deep merge two objects
 * @param target - The target object (defaults)
 * @param source - The source object (overrides)
 * @returns Merged object
 */
export function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            if (sourceValue &&
                typeof sourceValue === 'object' &&
                !Array.isArray(sourceValue) &&
                targetValue &&
                typeof targetValue === 'object' &&
                !Array.isArray(targetValue)) {
                // Recursively merge nested objects
                result[key] = deepMerge(targetValue, sourceValue);
            }
            else if (sourceValue !== undefined) {
                // Override with source value
                result[key] = sourceValue;
            }
        }
    }
    return result;
}
