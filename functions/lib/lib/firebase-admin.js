"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const admin = require("firebase-admin");
// Since initializeApp() is called in index.ts, we can safely get the firestore instance here.
// This module acts as a singleton for the db instance.
exports.db = admin.firestore();
//# sourceMappingURL=firebase-admin.js.map