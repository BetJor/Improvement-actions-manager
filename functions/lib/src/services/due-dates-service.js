"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDueDateSettings = getDueDateSettings;
exports.updateDueDateSettings = updateDueDateSettings;
exports.checkDueDates = checkDueDates;
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("@/lib/firebase");
const admin = require("firebase-admin");
const zod_1 = require("zod");
const date_fns_1 = require("date-fns");
const notification_service_1 = require("./notification-service");
// Use Admin SDK when running in a server environment (like a Cloud Function)
// and Client SDK when running as a Server Action from the client.
const db = admin.apps.length ? admin.firestore() : firebase_1.db;
// Schemas and Types
const DueDateSettingsSchema = zod_1.z.object({
    daysUntilDue: zod_1.z.number().int().positive().default(10),
});
const CheckDueDatesInputSchema = zod_1.z.object({
    actions: zod_1.z.array(zod_1.z.any()).describe("The list of actions to process."),
    isDryRun: zod_1.z.boolean().optional().default(true).describe("If true, it will not write to the database."),
});
const CheckDueDatesOutputSchema = zod_1.z.object({
    checkedActions: zod_1.z.number(),
    sentEmails: zod_1.z.array(zod_1.z.custom()),
    errors: zod_1.z.array(zod_1.z.string()),
});
// Helper flows
async function getDueDateSettings() {
    const docRef = (0, firestore_1.doc)(db, 'app_settings', 'due_date_reminders');
    const docSnap = await (0, firestore_1.getDoc)(docRef);
    if (docSnap.exists()) {
        return DueDateSettingsSchema.parse(docSnap.data());
    }
    return { daysUntilDue: 10 }; // Default
}
async function updateDueDateSettings(settings) {
    const docRef = (0, firestore_1.doc)(db, 'app_settings', 'due_date_reminders');
    await (0, firestore_1.setDoc)(docRef, settings, { merge: true });
}
async function processAction(action, settings, isDryRun) {
    var _a, _b;
    const sentEmailsForAction = [];
    const checkAndNotify = async (dueDateStr, recipient, taskDescription, reminderKey) => {
        if (!recipient) {
            console.warn(`[processAction] No recipient email for task "${taskDescription}" on action ${action.actionId}. Skipping notification.`);
            return;
        }
        if (!dueDateStr || !(0, date_fns_1.isFuture)((0, date_fns_1.parseISO)(dueDateStr)))
            return;
        // Check if reminder was already sent
        if (action.remindersSent && action.remindersSent[reminderKey]) {
            return;
        }
        const daysLeft = (0, date_fns_1.differenceInDays)((0, date_fns_1.parseISO)(dueDateStr), new Date());
        if (daysLeft <= settings.daysUntilDue) {
            console.log(`[processAction] Sending reminder for task "${taskDescription}" on action ${action.actionId} to ${recipient}`);
            const notificationComment = await (0, notification_service_1.sendDueDateReminderEmail)(action, taskDescription, dueDateStr, recipient);
            if (notificationComment === null || notificationComment === void 0 ? void 0 : notificationComment.text.includes("Fallo de envío")) {
                console.error(`Failed to send email for ${action.actionId}: ${notificationComment.text}`);
            }
            else if (notificationComment) {
                // If it's not a dry run, update the document
                if (!isDryRun) {
                    const actionDocRef = db.collection('actions').doc(action.id);
                    await (0, firestore_1.runTransaction)(db, async (transaction) => {
                        var _a, _b;
                        const freshActionDoc = await transaction.get(actionDocRef);
                        if (!freshActionDoc.exists) {
                            throw "Document does not exist!";
                        }
                        const currentComments = ((_a = freshActionDoc.data()) === null || _a === void 0 ? void 0 : _a.comments) || [];
                        const currentReminders = ((_b = freshActionDoc.data()) === null || _b === void 0 ? void 0 : _b.remindersSent) || {};
                        transaction.update(actionDocRef, {
                            comments: [...currentComments, notificationComment],
                            remindersSent: Object.assign(Object.assign({}, currentReminders), { [reminderKey]: true })
                        });
                    });
                }
                const urlMatch = notificationComment.text.match(/https?:\/\/[^\s]+/);
                const previewUrl = urlMatch ? urlMatch[0] : null;
                sentEmailsForAction.push({
                    actionId: action.actionId,
                    taskDescription,
                    recipient,
                    previewUrl,
                });
            }
        }
    };
    switch (action.status) {
        case 'Pendiente Análisis':
            await checkAndNotify(action.analysisDueDate, action.responsibleGroupId, 'completar el Análisis de Causas', 'analysis');
            break;
        case 'Pendiente Comprobación':
            if ((_a = action.analysis) === null || _a === void 0 ? void 0 : _a.verificationResponsibleUserEmail) {
                await checkAndNotify(action.verificationDueDate, action.analysis.verificationResponsibleUserEmail, 'realizar la Verificación de la Implantación', 'verification');
            }
            if ((_b = action.analysis) === null || _b === void 0 ? void 0 : _b.proposedActions) {
                for (const pa of action.analysis.proposedActions) {
                    if (pa.status !== 'Implementada') {
                        await checkAndNotify(pa.dueDate, pa.responsibleUserEmail, `implementar la acción: "${pa.description}"`, `pa_${pa.id}`);
                    }
                }
            }
            break;
        case 'Pendiente de Cierre':
            await checkAndNotify(action.closureDueDate, action.creator.email, 'realizar el Cierre Final de la acción', 'closure');
            break;
    }
    return sentEmailsForAction;
}
// Main logic
async function checkDueDates(input) {
    let settings;
    try {
        settings = await getDueDateSettings();
    }
    catch (e) {
        console.error(`[checkDueDates] Error getting settings:`, e);
        return { checkedActions: 0, sentEmails: [], errors: [`Error al obtenir la configuració: ${e.message}`] };
    }
    const statusesToCkeck = [
        'Pendiente Análisis',
        'Pendiente Comprobación',
        'Pendiente de Cierre'
    ];
    const sentEmails = [];
    const errors = [];
    const actionsToProcess = input.actions.filter(action => statusesToCkeck.includes(action.status));
    for (const action of actionsToProcess) {
        try {
            const emailsSentForAction = await processAction(action, settings, input.isDryRun);
            sentEmails.push(...emailsSentForAction);
        }
        catch (e) {
            console.error(`[checkDueDates] Error processing action ${action.actionId}:`, e);
            errors.push(`Acción ${action.actionId}: ${e.message}`);
        }
    }
    return { checkedActions: actionsToProcess.length, sentEmails, errors };
}
//# sourceMappingURL=due-dates-service.js.map