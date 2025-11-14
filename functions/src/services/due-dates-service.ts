
'use server';

import { DocumentData } from 'firebase-admin/firestore';
import * as admin from "firebase-admin";
import { z } from 'zod';
import { differenceInDays, isFuture, parseISO } from 'date-fns';
import type { ImprovementAction, SentEmailInfo } from "../lib/types";
import { sendDueDateReminderEmail } from "./notification-service";

// This file runs ONLY in the Cloud Function environment, so it uses the Admin SDK.
const db = admin.firestore();

// Schemas and Types
const DueDateSettingsSchema = z.object({
  daysUntilDue: z.number().int().positive().default(10),
});
export type DueDateSettings = z.infer<typeof DueDateSettingsSchema>;

const CheckDueDatesInputSchema = z.object({
    actions: z.array(z.any()).describe("The list of actions to process."),
    isDryRun: z.boolean().optional().default(true).describe("If true, it will not write to the database."),
});

const CheckDueDatesOutputSchema = z.object({
  checkedActions: z.number(),
  sentEmails: z.array(z.custom<SentEmailInfo>()),
  errors: z.array(z.string()),
});

// Helper flows
export async function getDueDateSettings(): Promise<DueDateSettings> {
    const docRef = db.doc('app_settings/due_date_reminders');
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        return DueDateSettingsSchema.parse(docSnap.data());
    }
    return { daysUntilDue: 10 }; // Default
}

export async function updateDueDateSettings(settings: DueDateSettings): Promise<void> {
    const docRef = db.doc('app_settings/due_date_reminders');
    await docRef.set(settings, { merge: true });
}

async function processAction(action: ImprovementAction, settings: DueDateSettings, isDryRun: boolean): Promise<SentEmailInfo[]> {
    const sentEmailsForAction: SentEmailInfo[] = [];

    const checkAndNotify = async (
        dueDateStr: string | undefined,
        recipient: string | undefined,
        taskDescription: string,
        reminderKey: string
    ) => {
        if (!recipient) {
            console.warn(`[processAction] No recipient email for task "${taskDescription}" on action ${action.actionId}. Skipping notification.`);
            return;
        }
        if (!dueDateStr || !isFuture(parseISO(dueDateStr))) return;

        // Check if reminder was already sent
        if (action.remindersSent && (action.remindersSent as any)[reminderKey]) {
            return;
        }
        
        const daysLeft = differenceInDays(parseISO(dueDateStr), new Date());

        if (daysLeft <= settings.daysUntilDue) {
            console.log(`[processAction] Sending reminder for task "${taskDescription}" on action ${action.actionId} to ${recipient}`);
            
            const notificationComment = await sendDueDateReminderEmail(action, taskDescription, dueDateStr, recipient);
            
            if (notificationComment?.text.includes("Fallo de envío")) {
                 console.error(`Failed to send email for ${action.actionId}: ${notificationComment.text}`);
            } else if (notificationComment) {
                // If it's not a dry run, update the document
                if (!isDryRun) {
                    const actionDocRef = db.doc(`actions/${action.id}`);
                    await db.runTransaction(async (transaction) => {
                        const freshActionDoc = await transaction.get(actionDocRef);
                        if (!freshActionDoc.exists) { throw "Document does not exist!"; }
                        
                        const currentData: DocumentData = freshActionDoc.data() || {};
                        const currentComments: any[] = currentData.comments || [];
                        const currentReminders: object = currentData.remindersSent || {};

                        transaction.update(actionDocRef, {
                            comments: [...currentComments, notificationComment],
                            remindersSent: { ...currentReminders, [reminderKey]: true }
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
            if(action.analysis?.verificationResponsibleUserEmail) {
                await checkAndNotify(action.verificationDueDate, action.analysis.verificationResponsibleUserEmail, 'realizar la Verificación de la Implantación', 'verification');
            }
            if (action.analysis?.proposedActions) {
                for (const pa of action.analysis.proposedActions) {
                    if (pa.status !== 'Implementada') {
                         await checkAndNotify(pa.dueDate as string, pa.responsibleUserEmail, `implementar la acción: "${pa.description}"`, `pa_${pa.id}`);
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
export async function checkDueDates(input: z.infer<typeof CheckDueDatesInputSchema>): Promise<z.infer<typeof CheckDueDatesOutputSchema>> {
    let settings;
    try {
        settings = await getDueDateSettings();
    } catch (e: any) {
        console.error(`[checkDueDates] Error getting settings:`, e);
        return { checkedActions: 0, sentEmails: [], errors: [`Error al obtenir la configuració: ${e.message}`] };
    }

    const statusesToCkeck: ImprovementAction['status'][] = [
        'Pendiente Análisis', 
        'Pendiente Comprobación', 
        'Pendiente de Cierre'
    ];
    
    const sentEmails: SentEmailInfo[] = [];
    const errors: string[] = [];
    
    const actionsToProcess = input.actions.filter(action => statusesToCkeck.includes(action.status));

    for (const action of actionsToProcess) {
        try {
            const emailsSentForAction = await processAction(action, settings, input.isDryRun);
            sentEmails.push(...emailsSentForAction);
        } catch(e: any) {
            console.error(`[checkDueDates] Error processing action ${action.actionId}:`, e);
            errors.push(`Acción ${action.actionId}: ${e.message}`);
        }
    }
    
    return { checkedActions: actionsToProcess.length, sentEmails, errors };
}
