"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeParseDate = void 0;
const date_fns_1 = require("date-fns");
const safeParseDate = (date) => {
    if (!date)
        return null;
    if (date instanceof Date)
        return date;
    if (typeof date === 'string') {
        try {
            return (0, date_fns_1.parseISO)(date);
        }
        catch (e) {
            console.warn(`Could not parse date string: ${date}`, e);
            return null;
        }
    }
    if (date && typeof date.toDate === 'function') { // Firebase Timestamp
        return date.toDate();
    }
    return null;
};
exports.safeParseDate = safeParseDate;
//# sourceMappingURL=utils.js.map