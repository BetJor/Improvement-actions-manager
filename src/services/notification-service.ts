

'use server';
/**
 * @fileOverview A service for handling notifications, such as sending emails.
 * This service uses the Google API to send emails via Gmail. It does NOT use Genkit.
 */

import { google } from 'googleapis';
import { ImprovementAction, User } from '@/lib/types';
import { getUserById, getUsers } from './users-service';
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
 * Sends an email notification about a status change in an improvement action.
 * This function authenticates with the Gmail API using a service account.
 * 
 * IMPORTANT: To use this function, you must:
 * 1. Create a Google Cloud Service Account.
 * 2. Enable the Gmail API in your Google Cloud project.
 * 3. Grant Domain-Wide Delegation to the service account in your Google Workspace Admin Console with the scope: `https://www.googleapis.com/auth/gmail.send`
 * 4. Set the following environment variables in your `.env` file:
 *    - `GOOGLE_APPLICATION_CREDENTIALS`: Path to your service account JSON key file.
 *    - `GMAIL_SENDER`: The email address from which the notification will be sent (e.g., 'noreply@yourdomain.com'). This user must exist in your Workspace.
 * 
 * @param details - The details required to build and send the email.
 * @returns The user object of the recipient if the email was sent, otherwise null.
 */
export async function sendStateChangeEmail(details: EmailDetails): Promise<User | null> {
  console.log(`[NotificationService] sendStateChangeEmail called with details:`, details);
  const { action, oldStatus, newStatus } = details;

  const senderEmail = process.env.GMAIL_SENDER;
  if (!senderEmail) {
    console.warn('[NotificationService] GMAIL_SENDER environment variable is not set. Skipping email notification.');
    await addSystemComment(action.id, `Error d'enviament de correu: La variable d'entorn GMAIL_SENDER no està configurada.`);
    return null;
  }
  console.log(`[NotificationService] Sender email is: ${senderEmail}`);
  
  // Determine the recipient
  let recipient: User | null = null;
  const allUsers = await getUsers();

  if (newStatus === 'Pendiente Análisis' && action.responsibleGroupId) {
    recipient = allUsers.find(u => u.email === action.responsibleGroupId) || null;
    console.log(`[NotificationService] Attempting to notify analysis responsible: ${action.responsibleGroupId}. Found user:`, recipient);
  }
  
  // Fallback to creator if no specific recipient is found
  if (!recipient) {
    recipient = await getUserById(action.creator.id);
    console.log(`[NotificationService] Falling back to creator. Found user:`, recipient);
  }

  console.log(`[NotificationService] Determined final recipient:`, recipient);

  if (!recipient || !recipient.email) {
    console.warn(`[NotificationService] No recipient or recipient email found for action ${action.actionId}. Skipping email notification.`);
    await addSystemComment(action.id, `Error d'enviament de correu: No s'ha trobat el destinatari o la seva adreça de correu.`);
    return null;
  }
  const recipientEmail = recipient.email;
  console.log(`[NotificationService] Recipient email is: ${recipientEmail}`);

  try {
    console.log('[NotificationService] Authenticating with Google API...');
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
      // The GOOGLE_APPLICATION_CREDENTIALS env var is automatically used by the library
    });

    const authClient = await auth.getClient();
    
    // The subject to impersonate is the sender email address
    (authClient as any).subject = senderEmail;
    console.log(`[NotificationService] Impersonating sender: ${senderEmail}`);

    const gmail = google.gmail({ version: 'v1', auth: authClient });

    const subject = `Actualització Acció Millora: ${action.actionId} - ${action.title}`;
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: Gestor d'Accions de Millora <${senderEmail}>`,
      `To: ${recipient.name} <${recipientEmail}>`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      `Hola ${recipient.name},`,
      '<br><br>',
      `L'estat de l'acció de millora <strong>${action.actionId}: "${action.title}"</strong> ha canviat.`,
      '<br><br>',
      `Estat anterior: <strong>${oldStatus}</strong>`,
      '<br>',
      `Estat nou: <strong>${newStatus}</strong>`,
      '<br><br>',
      'Pots consultar els detalls a la plataforma.',
      '<br><br>',
      'Gràcies,',
      '<br>',
      "L'equip de Gestió de Qualitat",
    ];
    const message = messageParts.join('\n');
    console.log('[NotificationService] Email message constructed.');

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log('[NotificationService] Sending message via Gmail API...');
    await gmail.users.messages.send({
      userId: 'me', // 'me' refers to the impersonated user (GMAIL_SENDER)
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`[NotificationService] Email sent successfully to ${recipientEmail} for action ${action.actionId}`);
    await addSystemComment(action.id, `S'ha enviat una notificació de canvi d'estat a ${recipient.name} (${recipient.email}).`);
    return recipient;

  } catch (error: any) {
    console.error('[NotificationService] Error sending email:', error);
    await addSystemComment(action.id, `Error en l'enviament de correu a ${recipientEmail}: ${error.message}`);
    // In a real application, you might want to throw the error or handle it differently
    return null;
  }
}
