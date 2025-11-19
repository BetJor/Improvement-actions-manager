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

    // Regex to find all {{...}} placeholders
    const placeholders = pattern.match(/\{\{([^}]+)\}\}/g) || [];
    
    // Find the first placeholder that resolves to an array
    const arrayPlaceholder = placeholders.find(p => {
        const path = p.replace(/[{}]/g, '').trim();
        const value = getProperty(data, path);
        return Array.isArray(value);
    });

    if (arrayPlaceholder) {
        const path = arrayPlaceholder.replace(/[{}]/g, '').trim();
        const arrayValue = getProperty(data, path);
        // Create a new pattern for each item in the array
        patternsToProcess = arrayValue.map((item: any) => pattern.replace(arrayPlaceholder, String(item)));
    }
    
    patternsToProcess.forEach(p => {
        let hasUnresolvedPlaceholders = false;
        // Regex to find all {{...}} placeholders
        const evaluatedString = p.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            // Trim whitespace from the path inside the braces
            const cleanPath = path.trim();
            
            // Resolve the value from the data object
            const value = getProperty(data, cleanPath);
            
            if (value !== undefined) {
                return String(value);
            } else {
                hasUnresolvedPlaceholders = true;
                return match; // Keep the original placeholder if value not found
            }
        });

        // Only add to results if all placeholders were resolved
        if (!hasUnresolvedPlaceholders) {
            finalResults.push(evaluatedString);
        }
    });

    // If there were no placeholders at all, the original pattern is a valid static email
    if (placeholders.length === 0 && pattern.includes('@')) {
        finalResults.push(pattern);
    }

    return [...new Set(finalResults)];
}
