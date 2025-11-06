
'use server';
/**
 * @fileOverview A service for handling notifications.
 * This service uses Nodemailer with an Ethereal test account to send emails.
 */

import { ImprovementAction, User, ActionComment, ProposedAction } from '@/lib/types';
import { getUserById } from './users-service';
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

/**
 * Sends a single email notification using a test Ethereal account.
 * @returns The preview URL if successful, otherwise null.
 */
async function sendEmail(recipient: string, subject: string, html: string): Promise<string | null> {
  try {
    const mailTransporter = await getTestEmailTransporter();
    
    const info = await mailTransporter.sendMail({
      from: '"Gestor de Acciones" <no-reply@example.com>',
      to: recipient,
      subject: subject,
      html: html,
    });
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[NotificationService] Email sent to ${recipient}. Preview URL: ${previewUrl}`);
    return previewUrl;

  } catch (error) {
    console.error(`[NotificationService] Failed to send email to ${recipient}:`, error);
    return null;
  }
}

/**
 * Handles sending email notifications based on the state change.
 * @returns An ActionComment to be added to the action, or null if no email was sent.
 */
export async function sendStateChangeEmail(details: EmailDetails): Promise<ActionComment | null> {
  const { action, newStatus } = details;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  const actionUrl = `${appUrl}/actions/${action.id}`;

  if (newStatus === 'Pendiente Análisis') {
    if (!action.responsibleGroupId) {
      console.warn(`[NotificationService] Action ${action.actionId} has no responsible group. No email sent.`);
      return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: "No se pudo notificar por email: no hay responsable de análisis asignado." };
    }
    
    const subject = `Nueva tarea asignada en Acción de Mejora: ${action.actionId}`;
    const html = `
      <h1>Tarea de Análisis Asignada</h1>
      <p>Hola,</p>
      <p>Se te ha asignado el análisis de la acción de mejora <strong>${action.actionId}: ${action.title}</strong>.</p>
      <p><strong>Creado por:</strong> ${action.creator.name}</p>
      <p>Por favor, accede a la plataforma para revisar los detalles y realizar el análisis de causas.</p>
      <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Acción</a>
    `;

    const previewUrl = await sendEmail(action.responsibleGroupId, subject, html);
    return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: previewUrl ? `Notificación de análisis enviada a ${action.responsibleGroupId}. Previsualización: ${previewUrl}` : `ERROR: No se pudo enviar la notificación de análisis a ${action.responsibleGroupId}.` };
  
  } else if (newStatus === 'Pendiente Comprobación') {
    if (!action.analysis?.proposedActions || action.analysis.proposedActions.length === 0) {
        console.warn(`[NotificationService] Action ${action.actionId} has no proposed actions.`);
        return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: "No se enviaron notificaciones: no hay acciones propuestas definidas." };
    }
    
    // --- TEMPORARY DEBUGGING STEP: ONLY NOTIFY THE FIRST RESPONSIBLE ---
    const firstProposedAction = action.analysis.proposedActions[0];
    if (!firstProposedAction.responsibleUserId) {
         console.warn(`[NotificationService] First proposed action for ${action.actionId} has no responsible user.`);
         return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: "No se pudo notificar: la primera acción propuesta no tiene responsable asignado." };
    }
    
    const user = await getUserById(firstProposedAction.responsibleUserId);

    if (user?.email) {
      const subject = `Nueva tarea de implementación asignada: ${action.actionId}`;
      const html = `
        <h1>Tarea de Implementación Asignada</h1>
        <p>Hola ${user.name},</p>
        <p>Se te ha asignado la siguiente tarea dentro de la acción de mejora <strong>${action.actionId}: ${action.title}</strong>:</p>
        <blockquote style="border-left: 2px solid #ccc; padding-left: 1em; margin-left: 1em; font-style: italic;">${firstProposedAction.description}</blockquote>
        <p><strong>Fecha de vencimiento:</strong> ${new Date(firstProposedAction.dueDate as string).toLocaleDateString()}</p>
        <p>Por favor, accede a la plataforma para actualizar el estado de la tarea cuando la completes.</p>
        <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Acción</a>
      `;
      const previewUrl = await sendEmail(user.email, subject, html);
      
      let commentText = `Notificación de implementación enviada a ${user.email}.`;
      if (previewUrl) {
          commentText += ` Previsualización: ${previewUrl}`;
      } else {
          commentText += ` | ENVÍO FALLÓ.`;
      }
      return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: commentText };

    } else {
         console.warn(`[NotificationService] Could not find user email for ID: ${firstProposedAction.responsibleUserId}`);
         return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: "No se pudo notificar al responsable de la primera acción: usuario no encontrado." };
    }
  }

  // Handle other status changes in the future...
  
  return null;
}
