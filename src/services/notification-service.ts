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
import { getPermissionRuleForState, resolveRoles } from './permissions-service';
import { getResponsibilityRoles } from './master-data-service';


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
 */
export async function sendStateChangeEmail(details: EmailDetails): Promise<User | null> {
  console.log(`[NotificationService] sendStateChangeEmail called with details:`, details);
  const { action, oldStatus, newStatus } = details;

  const senderEmail = process.env.GMAIL_SENDER;
  if (!senderEmail) {
    console.warn('[NotificationService] GMAIL_SENDER environment variable is not set. Skipping email notification.');
    await addSystemComment(action.id, `Error de envío de correo: La variable de entorno GMAIL_SENDER no está configurada.`);
    return null;
  }
  console.log(`[NotificationService] Sender email is: ${senderEmail}`);
  
  let recipient: Partial<User> | null = null;
  const allUsers = await getUsers();
  const allRoles = await getResponsibilityRoles();

  if (newStatus === 'Pendiente Análisis') {
    console.log('[NotificationService] Status is "Pendiente Análisis". Resolving recipient from permission matrix.');
    const permissionRule = await getPermissionRuleForState(action.typeId, newStatus);
    if (permissionRule && permissionRule.authorRoleIds.length > 0) {
      const recipientEmails = await resolveRoles(permissionRule.authorRoleIds, allRoles, action);
      console.log(`[NotificationService] Resolved author emails from matrix: ${recipientEmails.join(', ')}`);
      if (recipientEmails.length > 0) {
        const firstRecipientEmail = recipientEmails[0];
        recipient = allUsers.find(u => u.email === firstRecipientEmail) || null;
        
        if (recipient) {
            console.log(`[NotificationService] Found matching user in DB:`, recipient);
        } else {
            console.log(`[NotificationService] No user found in DB for email ${firstRecipientEmail}. Creating temporary recipient.`);
            // If no user is found, create a temporary recipient object to send the email anyway.
            recipient = {
                name: firstRecipientEmail.split('@')[0],
                email: firstRecipientEmail
            };
        }
      }
    } else {
        console.log('[NotificationService] No specific permission rule or authors found for this state.');
    }
  }
  
  if (!recipient) {
    recipient = await getUserById(action.creator.id);
    console.log(`[NotificationService] Falling back to creator. Found user:`, recipient);
  }

  console.log(`[NotificationService] Determined final recipient:`, recipient);

  if (!recipient || !recipient.email) {
    console.warn(`[NotificationService] No recipient or recipient email found for action ${action.actionId}. Skipping email notification.`);
    await addSystemComment(action.id, `Error de envío de correo: No se ha encontrado un destinatario válido.`);
    return null;
  }
  const recipientEmail = recipient.email;
  console.log(`[NotificationService] Recipient email is: ${recipientEmail}`);

  try {
    console.log('[NotificationService] Authenticating with Google API...');
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
    });

    const authClient = await auth.getClient();
    
    (authClient as any).subject = senderEmail;
    console.log(`[NotificationService] Impersonating sender: ${senderEmail}`);

    const gmail = google.gmail({ version: 'v1', auth: authClient });

    const subject = `Actualización Acción Mejora: ${action.actionId} - ${action.title}`;
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: Gestor de Acciones de Mejora <${senderEmail}>`,
      `To: ${recipient.name} <${recipientEmail}>`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      `Hola ${recipient.name},`,
      '<br><br>',
      `El estado de la acción de mejora <strong>${action.actionId}: "${action.title}"</strong> ha cambiado.`,
      '<br><br>',
      `Estado anterior: <strong>${oldStatus}</strong>`,
      '<br>',
      `Estado nuevo: <strong>${newStatus}</strong>`,
      '<br><br>',
      'Puedes consultar los detalles en la plataforma.',
      '<br><br>',
      'Gracias,',
      '<br>',
      "El equipo de Gestión de Calidad",
    ];
    const message = messageParts.join('\n');
    console.log('[NotificationService] Email message constructed.');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log('[NotificationService] Sending message via Gmail API...');
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`[NotificationService] Email sent successfully to ${recipientEmail} for action ${action.actionId}`);
    await addSystemComment(action.id, `Se ha enviado una notificación por correo a ${recipient.name} (${recipient.email}) sobre el cambio de estado a "${newStatus}".`);
    return recipient as User;

  } catch (error: any) {
    console.error('[NotificationService] Error sending email:', error);
    const errorMessage = error.response?.data?.error?.message || error.message;
    await addSystemComment(action.id, `Se ha producido un error al intentar enviar la notificación por correo a ${recipientEmail}: ${errorMessage}`);
    return null;
  }
}
