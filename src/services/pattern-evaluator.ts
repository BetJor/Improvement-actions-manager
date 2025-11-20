'use server';

// src/lib/pattern-evaluator.ts

/**
 * Resolves a dot-notation path from an object.
 * e.g., getProperty(action, 'creator.email') returns action.creator.email
 */
function getProperty(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => (o && o[key] !== 'undefined' ? o[key] : undefined), obj);
}

/**
 * Evaluates a pattern string with placeholders like {{object.property}}
 * against a data object.
 * @param pattern The string containing placeholders (e.g., "user-{{creator.id}}@example.com").
 * @param data The data object (e.g., the improvement action object).
 * @returns An array of evaluated strings with placeholders replaced by values.
 */
export function evaluatePattern(pattern: string, data: any): string[] {
    if (!pattern) return [];

    let patternsToProcess = [pattern];
    let finalResults: string[] = [];

    // This logic is now part of the services that call this function,
    // as it's more context-specific. This function will now just resolve patterns.

    patternsToProcess.forEach(p => {
        let hasUnresolvedPlaceholders = false;
        const evaluatedString = p.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const cleanPath = path.trim();
            const value = getProperty(data, cleanPath);
            
            if (value !== undefined) {
                return String(value);
            } else {
                hasUnresolvedPlaceholders = true;
                return match; // Keep placeholder if value not found
            }
        });

        if (!hasUnresolvedPlaceholders) {
            finalResults.push(evaluatedString);
        }
    });

    return [...new Set(finalResults)];
}
