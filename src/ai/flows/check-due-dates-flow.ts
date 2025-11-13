
'use server';
/**
 * @fileOverview A flow to check for upcoming due dates and send reminder notifications.
 *
 * - checkDueDates - The main function to trigger the check.
 * - getDueDateSettings - Retrieves the configuration for the check.
 * - updateDueDateSettings - Updates the configuration.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, getDocs, query, where, updateDoc, doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ImprovementAction, User, ActionComment } from '@/lib/types';
import { differenceInDays, isFuture, parseISO } from 'date-fns';
import { sendDueDateReminderEmail } from '@/services/notification-service';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


const DueDateSettingsSchema = z.object({
  daysUntilDue: z.number().int().positive().default(10),
});
export type DueDateSettings = z.infer<typeof DueDateSettingsSchema>;

const LogEntrySchema = z.object({
  step: z.string(),
  status: z.enum(['success', 'failure', 'info']),
  details: z.string().optional(),
});

const ImprovementActionSchema = z.any(); // Use z.any() to pass raw action data

const CheckDueDatesInputSchema = z.object({
    callingUser: z.object({
        email: z.string(),
        name: z.string(),
    }).optional(),
    actions: z.array(ImprovementActionSchema).describe("The list of actions to process."),
});


const CheckDueDatesOutputSchema = z.object({
  checkedActions: z.number(),
  remindersSent: z.number(),
  errors: z.array(z.string()),
  log: z.array(z.infer<typeof LogEntrySchema>),
});


export async function getDueDateSettings(): Promise<DueDateSettings> {
    return getDueDateSettingsFlow();
}

export async function updateDueDateSettings(settings: DueDateSettings): Promise<void> {
    return updateDueDateSettingsFlow(settings);
}

export async function checkDueDates(input: z.infer<typeof CheckDueDatesInputSchema>): Promise<z.infer<typeof CheckDueDatesOutputSchema>> {
    return checkDueDatesFlow(input);
}


const getDueDateSettingsFlow = ai.defineFlow(
    {
        name: 'getDueDateSettingsFlow',
        inputSchema: z.void(),
        outputSchema: DueDateSettingsSchema,
    },
    async () => {
        const docRef = doc(db, 'app_settings', 'due_date_reminders');
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return DueDateSettingsSchema.parse(docSnap.data());
            }
        } catch (serverError) {
             const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        }
        return { daysUntilDue: 10 }; // Default
    }
);

const updateDueDateSettingsFlow = ai.defineFlow(
    {
        name: 'updateDueDateSettingsFlow',
        inputSchema: DueDateSettingsSchema,
        outputSchema: z.void(),
    },
    async (settings) => {
        const docRef = doc(db, 'app_settings', 'due_date_reminders');
        await setDoc(docRef, settings, { merge: true }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: settings,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
    }
);


const checkDueDatesFlow = ai.defineFlow(
  {
    name: 'checkDueDatesFlow',
    inputSchema: CheckDueDatesInputSchema,
    outputSchema: CheckDueDatesOutputSchema,
  },
  async (input) => {
    const callingUserEmail = input.callingUser?.email || "Usuario de servidor desconocido";
    const log: z.infer<typeof LogEntrySchema>[] = [{ step: 'Inicio del Proceso', status: 'info', details: `Ejecutando como '${callingUserEmail}'` }];
    
    let settings;
    try {
        log.push({ step: 'Obteniendo configuración', status: 'info' });
        settings = await getDueDateSettingsFlow();
        log.push({ step: 'Configuración obtenida', status: 'success', details: `Se notificará a los ${settings.daysUntilDue} días.` });
    } catch (e: any) {
        log.push({ step: 'Error al obtener configuración', status: 'failure', details: e.message });
        return { checkedActions: 0, remindersSent: 0, errors: [e.message], log };
    }

    const statusesToCkeck: ImprovementAction['status'][] = [
        'Pendiente Análisis', 
        'Pendiente Comprobación', 
        'Pendiente de Cierre'
    ];
    
    let remindersSent = 0;
    const errors: string[] = [];
    
    const actionsToProcess = input.actions.filter(action => statusesToCkeck.includes(action.status));
    log.push({ step: 'Procesando acciones', status: 'info', details: `Se revisarán ${actionsToProcess.length} acciones.` });

    for (const action of actionsToProcess) {
        try {
            const sentCount = await processAction(action, settings);
            remindersSent += sentCount;
        } catch(e: any) {
            console.error(`[checkDueDates] Error processing action ${action.actionId}:`, e);
            errors.push(`Acción ${action.actionId}: ${e.message}`);
        }
    }
    
    log.push({ step: 'Proceso finalizado', status: 'info', details: `Se enviaron ${remindersSent} recordatorios.` });
    return { checkedActions: actionsToProcess.length, remindersSent, errors, log };
  }
);


async function processAction(action: ImprovementAction, settings: DueDateSettings): Promise<number> {
    let sentCount = 0;
    const remindersSent = action.remindersSent || { analysis: false, verification: false, closure: false, proposedActions: {} };
    const updates: any = {};
    const commentsToAdd: ActionComment[] = [];

    const checkAndNotify = async (
        dueDateStr: string | undefined,
        reminderType: 'analysis' | 'verification' | 'closure' | `proposedActions.${string}`,
        recipient: string | undefined,
        taskDescription: string,
    ) => {
        if (!recipient) {
            console.warn(`[processAction] No recipient email for ${reminderType} on action ${action.actionId}. Skipping notification.`);
            return;
        }
        if (!dueDateStr || !isFuture(parseISO(dueDateStr))) return;

        const reminderKey = reminderType.toString();
        
        let wasSent = false;
        if (reminderKey.startsWith('proposedActions.')) {
            const paId = reminderKey.split('.')[1];
            wasSent = remindersSent.proposedActions?.[paId] ?? false;
        } else {
            wasSent = remindersSent[reminderType as keyof typeof remindersSent] ?? false;
        }

        if (wasSent) return;

        const daysLeft = differenceInDays(parseISO(dueDateStr), new Date());
        if (daysLeft <= settings.daysUntilDue) {
            console.log(`[processAction] Sending reminder for ${reminderType} on action ${action.actionId} to ${recipient}`);
            
            const notificationComment = await sendDueDateReminderEmail(action, taskDescription, dueDateStr, recipient);
            
            if (notificationComment) {
                commentsToAdd.push(notificationComment);
            }
            
            if (reminderKey.startsWith('proposedActions.')) {
                if (!updates['remindersSent.proposedActions']) updates['remindersSent.proposedActions'] = {};
                updates[`remindersSent.proposedActions.${reminderKey.split('.')[1]}`] = true;
            } else {
                 updates[`remindersSent.${reminderKey}`] = true;
            }
            sentCount++;
        }
    };
    
    switch (action.status) {
        case 'Pendiente Análisis':
            await checkAndNotify(action.analysisDueDate, 'analysis', action.responsibleGroupId, 'completar el Análisis de Causas');
            break;
        case 'Pendiente Comprobación':
            if(action.analysis?.verificationResponsibleUserEmail) {
                await checkAndNotify(action.verificationDueDate, 'verification', action.analysis.verificationResponsibleUserEmail, 'realizar la Verificación de la Implantación');
            }
            if (action.analysis?.proposedActions) {
                for (const pa of action.analysis.proposedActions) {
                    if (pa.status !== 'Implementada') {
                         await checkAndNotify(pa.dueDate as string, `proposedActions.${pa.id}`, pa.responsibleUserEmail, `implementar la acción: "${pa.description}"`);
                    }
                }
            }
            break;
        case 'Pendiente de Cierre':
             await checkAndNotify(action.closureDueDate, 'closure', action.creator.email, 'realizar el Cierre Final de la acción');
            break;
    }

    if (sentCount > 0) {
        const actionRef = doc(db, 'actions', action.id);
        const finalUpdates: { [key: string]: any } = { ...updates };
        if (commentsToAdd.length > 0) {
            finalUpdates.comments = arrayUnion(...commentsToAdd);
        }
        
        await updateDoc(actionRef, finalUpdates).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: actionRef.path,
                operation: 'update',
                requestResourceData: finalUpdates,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
    }

    return sentCount;
}
