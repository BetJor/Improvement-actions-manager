
'use server';
/**
 * @fileOverview A service for handling notifications.
 * This service uses Nodemailer with an Ethereal test account to send emails.
 */

import { ImprovementAction, User } from '@/lib/types';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import nodemailer from 'nodemailer';

interface EmailDetails {
  action: ImprovementAction;
  oldStatus: string;
  newStatus: string;
}

// Cached transporter object.
let transporter: nodemailer.Transporter | null = null;

/**
 * Creates and caches a Nodemailer transporter using a test Ethereal account.
 * This prevents creating a new account for every email sent.
 */
async function getTestEmailTransporter(): Promise<nodemailer.Transporter> {
    if (transporter) {
        return transporter;
    }

    try {
        const testAccount = await nodemailer.createTestAccount();
        console.log('[NotificationService] Created Ethereal test account:', testAccount.user);

        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        
        return transporter;
    } catch (error) {
        console.error('[NotificationService] Failed to create Ethereal test account:', error);
        throw error;
    }
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
 * Sends an email notification about a state change using a test Ethereal account.
 */
export async function sendStateChangeEmail(details: EmailDetails): Promise<void> {
  const { action, newStatus } = details;
  
  if (!action.responsibleGroupId) {
    console.warn(`[NotificationService] Action ${action.actionId} has no responsible person/group assigned. No email will be sent.`);
    await addSystemComment(action.id, `No se ha podido enviar la notificación por correo porque no hay ningún responsable asignado.`);
    return;
  }

  const mailTransporter = await getTestEmailTransporter();
  const recipient = action.responsibleGroupId;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  const actionUrl = `${appUrl}/actions/${action.id}`;

  const emailHtml = `
    <h1>Notificación de Acción de Mejora</h1>
    <p>Hola,</p>
    <p>Se te ha asignado una nueva tarea en la acción de mejora <strong>${action.actionId}: ${action.title}</strong>.</p>
    <p>El estado ha cambiado a: <strong>${newStatus}</strong></p>
    <hr>
    <h3>Detalles:</h3>
    <ul>
      <li><strong>ID:</strong> ${action.actionId}</li>
      <li><strong>Título:</strong> ${action.title}</li>
      <li><strong>Creado por:</strong> ${action.creator.name}</li>
    </ul>
    <p>Por favor, accede a la plataforma para revisar los detalles y realizar las acciones oportunas.</p>
    <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Acción</a>
    <hr>
    <p style="font-size: 0.8em; color: #888;">Este es un mensaje automático. Por favor, no respondas a este correo.</p>
  `;

  try {
    const info = await mailTransporter.sendMail({
      from: '"Gestor de Acciones" <no-reply@example.com>',
      to: recipient,
      subject: `Nueva tarea asignada en Acción de Mejora: ${action.actionId}`,
      html: emailHtml,
    });
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[NotificationService] Email sent successfully to ${recipient}.`);
    console.log(`[NotificationService] Preview URL: ${previewUrl}`);

    await addSystemComment(action.id, `Notificación enviada a ${recipient}. Previsualización: ${previewUrl}`);

  } catch (error) {
    console.error(`[NotificationService] Failed to send email to ${recipient}:`, error);
    await addSystemComment(action.id, `ERROR: No se pudo enviar la notificación por correo a ${recipient}.`);
    // We don't re-throw the error to avoid blocking the main application flow.
  }
}
