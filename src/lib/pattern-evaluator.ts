// src/lib/pattern-evaluator.ts
import type { ResponsibilityRole } from "./types";

/**
 * Resolves a dot-notation path from an object.
 * e.g., getProperty(action, 'creator.email') returns action.creator.email
 */
function getProperty(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => (o && o[key] !== 'undefined' ? o[key] : undefined), obj);
}

/**
 * Evaluates a role's resolution logic based on its type and pattern.
 * @param role The ResponsibilityRole object to evaluate.
 * @param context The context object containing action and locations data.
 * @returns An array of evaluated email strings.
 */
export function evaluatePattern(role: ResponsibilityRole, context: any): string[] {
    if (!role) return [];

    const { action, locations } = context;

    switch (role.type) {
        case 'Fixed':
            return role.email ? [role.email] : [];
        
        case 'FixedLocation': {
            if (!role.fixedLocationId || !role.locationResponsibleField) return [];
            const location = locations.find((l: any) => l.id === role.fixedLocationId);
            if (location?.responsibles?.[role.locationResponsibleField]) {
                return [location.responsibles[role.locationResponsibleField]];
            }
            return [];
        }

        case 'Location': {
            if (!role.actionFieldSource || !role.locationResponsibleField) return [];
            
            const sourceIds = getProperty(action, role.actionFieldSource);
            const locationIds = Array.isArray(sourceIds) ? sourceIds : [sourceIds].filter(Boolean);
            
            if (!locationIds || locationIds.length === 0) return [];
            
            const emails = locationIds.map(locId => {
                const location = locations.find((l: any) => l.id === locId);
                return location?.responsibles?.[role.locationResponsibleField];
            }).filter(Boolean); // Filter out any undefined emails
            
            return [...new Set(emails)]; // Return unique emails
        }

        default:
            return [];
    }
}
