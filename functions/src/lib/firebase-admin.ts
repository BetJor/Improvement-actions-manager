import * as admin from 'firebase-admin';

// Since initializeApp() is called in index.ts, we can safely get the firestore instance here.
// This module acts as a singleton for the db instance.
export const db = admin.firestore();
