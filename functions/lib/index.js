"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDueDatesScheduled = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const due_dates_service_1 = require("./services/due-dates-service");
admin.initializeApp();
const db = admin.firestore();
// Exported Cloud Function
exports.checkDueDatesScheduled = functions
    .region('europe-west1')
    .pubsub.schedule('every day 09:00')
    .onRun(async (context) => {
    console.log('Starting scheduled check for due dates...');
    try {
        // Fetch all actions from Firestore.
        // We use the Admin SDK here, which bypasses security rules.
        const actionsSnapshot = await db.collection('actions').get();
        const allActions = actionsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // Call the core logic, allowing it to write to the database.
        const result = await (0, due_dates_service_1.checkDueDates)({ actions: allActions, isDryRun: false });
        console.log(`Scheduled check finished. Checked ${result.checkedActions} actions.`);
        if (result.sentEmails.length > 0) {
            console.log(`Successfully sent ${result.sentEmails.length} reminder emails.`);
            result.sentEmails.forEach(email => {
                console.log(`  - To: ${email.recipient} for action ${email.actionId}`);
            });
        }
        if (result.errors.length > 0) {
            console.error(`Encountered ${result.errors.length} errors during the process:`);
            result.errors.forEach(error => console.error(`  - ${error}`));
        }
        return null;
    }
    catch (error) {
        console.error('Fatal error during scheduled due date check:', error);
        return null;
    }
});
//# sourceMappingURL=index.js.map