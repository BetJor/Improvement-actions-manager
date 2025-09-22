
'use server';
/**
 * @fileOverview A service for handling notifications, such as sending emails.
 * This service uses the Google API to send emails via Gmail. It does NOT use Genkit.
 */

import { google } from 'googleapis';
import { ImprovementAction } from '@/lib/types';
import { getUserById } from './users-service';

interface EmailDetails {
  action: ImprovementAction;
  oldStatus: string;
  newStatus: string;
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
 */
export async function sendStateChangeEmail(details: EmailDetails) {
  const { action, oldStatus, newStatus } = details;

  const senderEmail = process.env.GMAIL_SENDER;
  if (!senderEmail) {
    console.warn('[EmailService] GMAIL_SENDER environment variable is not set. Skipping email notification.');
    return;
  }
  
  // Determine the recipient. For now, let's notify the creator.
  // This could be made more complex, e.g., notifying the responsible person.
  const recipient = await getUserById(action.creator.id);
  const recipientEmail = recipient?.email;

  if (!recipientEmail) {
    console.warn(`[EmailService] No recipient email found for action ${action.actionId}. Skipping email notification.`);
    return;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
      // The GOOGLE_APPLICATION_CREDENTIALS env var is automatically used by the library
    });

    const authClient = await auth.getClient();
    
    // The subject to impersonate is the sender email address
    (authClient as any).subject = senderEmail;

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
      `Hola ${action.creator.name},`,
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

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me', // 'me' refers to the impersonated user (GMAIL_SENDER)
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`[EmailService] Email sent successfully to ${recipientEmail} for action ${action.actionId}`);
  } catch (error) {
    console.error('[EmailService] Error sending email:', error);
    // In a real application, you might want to throw the error or handle it differently
  }
}
