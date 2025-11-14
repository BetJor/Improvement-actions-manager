
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { checkDueDates as checkDueDatesFlow } from "./services/due-dates-service";

admin.initializeApp();
const db = admin.firestore();

// Exported Cloud Function
export const checkDueDatesScheduled = functions
  .region('europe-west1')
  .pubsub.schedule('every day 09:00')
  .onRun(async (context) => {
    console.log('Starting scheduled check for due dates...');

    try {
        // Fetch all actions from Firestore.
        // We use the Admin SDK here, which bypasses security rules.
        const actionsSnapshot = await db.collection('actions').get();
        const allActions = actionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Call the core logic, passing the db instance, and allowing it to write to the database.
        const result = await checkDueDatesFlow(db, { actions: allActions, isDryRun: false });

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

    } catch (error) {
        console.error('Fatal error during scheduled due date check:', error);
        return null;
    }
});
