import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK. This must be done once.
admin.initializeApp();

import * as functions from "firebase-functions";
import { checkDueDates as checkDueDatesFlow } from "./services/due-dates-service";
import { db } from './lib/firebase-admin';


// Exported Cloud Function
export const checkDueDatesScheduled = functions
  .region('europe-west1')
  .pubsub.schedule('every day 09:00')
  .onRun(async (context) => {
    console.log('Starting scheduled check for due dates...');

    try {
        // Fetch all actions from Firestore using the pre-initialized db instance.
        const actionsSnapshot = await db.collection('actions').get();
        const allActions = actionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Call the core logic, passing the db instance, and allowing it to write to the database.
        const result = await checkDueDatesFlow({ actions: allActions, isDryRun: false });

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
