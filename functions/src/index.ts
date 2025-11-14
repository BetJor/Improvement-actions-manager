
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { checkDueDates } from "../../src/ai/flows/check-due-dates-flow";

admin.initializeApp();

const db = admin.firestore();

// Scheduled function to run every day at 9:00 AM.
export const checkDueDatesScheduled = functions
  .region('europe-west1')
  .pubsub.schedule('every day 09:00')
  .onRun(async (context) => {
    console.log('Starting scheduled check for due dates...');

    try {
        const actionsSnapshot = await db.collection('actions').get();
        const allActions = actionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const result = await checkDueDates({ actions: allActions, isDryRun: false });

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
