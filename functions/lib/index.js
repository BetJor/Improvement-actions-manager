"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDueDatesScheduled = void 0;
const admin = require("firebase-admin");
// Initialize Firebase Admin SDK. This must be done once.
admin.initializeApp();
const functions = require("firebase-functions");
const due_dates_service_1 = require("./services/due-dates-service");
const firebase_admin_1 = require("./lib/firebase-admin");
// Exported Cloud Function
exports.checkDueDatesScheduled = functions
    .region('europe-west1')
    .pubsub.schedule('every day 09:00')
    .onRun(async (context) => {
    console.log('Starting scheduled check for due dates...');
    try {
        // Fetch all actions from Firestore using the pre-initialized db instance.
        const actionsSnapshot = await firebase_admin_1.db.collection('actions').get();
        const allActions = actionsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // Call the core logic, passing the db instance, and allowing it to write to the database.
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