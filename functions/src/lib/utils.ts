
import { parseISO } from "date-fns"

export const safeParseDate = (date: any): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date === 'string') {
        try {
            return parseISO(date);
        } catch (e) {
            console.warn(`Could not parse date string: ${date}`, e);
            return null;
        }
    }
    if (date && typeof date.toDate === 'function') { // Firebase Timestamp
        return date.toDate();
    }
    return null;
}
