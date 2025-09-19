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
 * @returns The evaluated string with placeholders replaced by values.
 */
export function evaluatePattern(pattern: string, data: any): string {
    if (!pattern) return '';
    
    // Regex to find all {{...}} placeholders
    return pattern.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        // Trim whitespace from the path inside the braces
        const cleanPath = path.trim();
        
        // Resolve the value from the data object
        const value = getProperty(data, cleanPath);
        
        // If the value is found, return it, otherwise return the original placeholder
        return value !== undefined ? String(value) : match;
    });
}
