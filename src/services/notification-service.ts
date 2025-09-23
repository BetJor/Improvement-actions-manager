
'use server';
/**
 * @fileOverview A service for handling notifications.
 * This service is currently a placeholder and does not send actual emails.
 */

import { ImprovementAction, User } from '@/lib/types';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface EmailDetails {
  action: ImprovementAction;
  oldStatus: string;
  newStatus: string;
}

async function addSystemComment(actionId: string, text: string) {
    console.log(`[NotificationService] Adding system comment to action ${actionId}: "${text}"`);
    const actionDocRef = doc(db, 'actions', actionId);
    const systemComment = {
        id: crypto.randomUUID(),
        author: { id: 'system', name: 'Sistema' },
        date: new Date().toISOString(),
        text: text,
    };
    try {
        await updateDoc(actionDocRef, { comments: arrayUnion(systemComment) });
        console.log(`[NotificationService] System comment added successfully.`);
    } catch (commentError) {
        console.error(`[NotificationService] Failed to add system comment to action ${actionId}:`, commentError);
    }
}

/**
 * Placeholder function for sending email notifications.
 * This function is currently disabled and will only log to the console.
 */
export async function sendStateChangeEmail(details: EmailDetails): Promise<User | null> {
  console.log('[NotificationService] Email sending is disabled.');
  console.log(`[NotificationService] Pretending to send email for action ${details.action.actionId} state change from ${details.oldStatus} to ${details.newStatus}.`);

  await addSystemComment(details.action.id, `Notificación por correo deshabilitada. Cambio de estado a "${details.newStatus}".`);

  // Return null as no user was actually notified.
  return null;
}

    