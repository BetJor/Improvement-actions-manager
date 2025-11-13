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
import type { ImprovementAction, User } from '@/lib/types';
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

const CheckDueDatesOutputSchema = z.object({
  checkedActions: z.number(),
  remindersSent: z.number(),
  errors: z.array(z.string()),
  log: z.array(LogEntrySchema),
});

// --- Wrapper functions for frontend to call flows ---
export async function getDueDateSettings(): Promise<DueDateSettings> {
    return getDueDateSettingsFlow();
}

export async function updateDueDateSettings(settings: DueDateSettings): Promise<void> {
    return updateDueDateSettingsFlow(settings);
}


// --- Admin-privileged flows ---

const getDueDateSettingsFlow = ai.defineFlow(
    {
        name: 'getDueDateSettingsFlow',
        inputSchema: z.void(),
        outputSchema: DueDateSettingsSchema,
        auth: (auth, input) => {
            auth.serviceAccount(); // Run with admin privileges
        }
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
        auth: (auth, input) => {
            auth.serviceAccount(); // Run with admin privileges
        }
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


// --- Main Flow to Check Due Dates ---

export const checkDueDates = ai.defineFlow(
  {
    name: 'checkDuedates',
    inputSchema: z.void(),
    outputSchema: CheckDueDatesOutputSchema,
    auth: (auth, input) => {
        // This policy allows the flow to run with service account credentials
        // Bypassing user-based security rules for this administrative task.
        auth.serviceAccount();
    },
  },
  async () => {
    const log: z.infer<typeof LogEntrySchema>[] = [{ step: 'Inicio del Proceso', status: 'info', details: 'Ejecutando con permisos de administrador.' }];
    
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
    let allUsers: User[] = [];
    let actions: ImprovementAction[] = [];

    try {
        log.push({ step: 'Obteniendo todos los usuarios', status: 'info' });
        const usersSnapshot = await getDocs(collection(db, 'users'));
        allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        log.push({ step: 'Usuarios obtenidos', status: 'success', details: `Se encontraron ${allUsers.length} usuarios.` });
    } catch(e: any) {
        log.push({ step: 'Error al obtener usuarios', status: 'failure', details: e.message });
        return { checkedActions: 0, remindersSent: 0, errors: [e.message], log };
    }
    
    try {
        log.push({ step: 'Consultando acciones pendientes', status: 'info' });
        const q = query(collection(db, 'actions'), where('status', 'in', statusesToCkeck));
        const querySnapshot = await getDocs(q);
        actions = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id })) as ImprovementAction[];
        log.push({ step: 'Acciones obtenidas', status: 'success', details: `Se encontraron ${actions.length} acciones para revisar.` });
    } catch(e: any) {
        log.push({ step: 'Error al obtener acciones', status: 'failure', details: e.message });
        return { checkedActions: 0, remindersSent: 0, errors: [e.message], log };
    }

    for (const action of actions) {
        try {
            const sentCount = await processAction(action, settings, allUsers);
            remindersSent += sentCount;
        } catch(e: any) {
            console.error(`[checkDueDates] Error processing action ${action.actionId}:`, e);
            errors.push(`Acción ${action.actionId}: ${e.message}`);
        }
    }
    
    log.push({ step: 'Proceso finalizado', status: 'info', details: `Se enviaron ${remindersSent} recordatorios.` });
    return { checkedActions: actions.length, remindersSent, errors, log };
  }
);


async function processAction(action: ImprovementAction, settings: DueDateSettings, allUsers: User[]): Promise<number> {
    let sentCount = 0;
    const remindersSent = action.remindersSent || { analysis: false, verification: false, closure: false, proposedActions: {} };
    const updates: any = {};
    const commentsToAdd: any[] = [];

    const getUserById = (userId: string): User | undefined => {
        return allUsers.find(u => u.id === userId);
    };

    const checkAndNotify = async (
        dueDateStr: string,
        reminderType: keyof ImprovementAction['remindersSent'] | `proposedActions.${string}`,
        recipient: string,
        taskDescription: string,
    ) => {
        if (!dueDateStr || !isFuture(parseISO(dueDateStr))) return;

        const reminderKey = reminderType.toString();
        const wasSent = reminderKey.startsWith('proposedActions.') 
            ? remindersSent.proposedActions?.[reminderKey.split('.')[1]] 
            : remindersSent[reminderType as keyof typeof remindersSent];

        if (wasSent) return;

        const daysLeft = differenceInDays(parseISO(dueDateStr), new Date());
        if (daysLeft <= settings.daysUntilDue) {
            console.log(`[processAction] Sending reminder for ${reminderType} on action ${action.actionId} to ${recipient}`);
            
            const notificationComment = await sendDueDateReminderEmail(action, taskDescription, dueDateStr, recipient);
            
            if (notificationComment) {
                commentsToAdd.push(notificationComment);
            }
            
            // Mark as sent
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
            if(action.analysis?.verificationResponsibleUserId) {
                 const verifier = getUserById(action.analysis.verificationResponsibleUserId);
                 if(verifier?.email) {
                    await checkAndNotify(action.verificationDueDate, 'verification', verifier.email, 'realizar la Verificación de la Implantación');
                 }
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
             if (action.creator.email) {
                await checkAndNotify(action.closureDueDate, 'closure', action.creator.email, 'realizar el Cierre Final de la acción');
            }
            break;
    }

    if (sentCount > 0) {
        const actionRef = doc(db, 'actions', action.id);
        const finalUpdates = { ...updates, comments: arrayUnion(...commentsToAdd) };
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
