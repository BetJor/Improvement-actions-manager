
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
    if (!action.analysis?.verificationResponsibleUserId) {
        console.warn(`[NotificationService] Action ${action.actionId} has no verification responsible.`);
        return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: "No se pudo notificar: no hay responsable de verificación asignado." };
    }
    
    const user = await getUserById(action.analysis.verificationResponsibleUserId);

    if (user?.email) {
      const subject = `Verificación de acción de mejora pendiente: ${action.actionId}`;
      const html = `
        <h1>Tarea de Verificación Asignada</h1>
        <p>Hola ${user.name},</p>
        <p>Se te ha asignado la verificación de la implementación de la acción de mejora <strong>${action.actionId}: ${action.title}</strong>.</p>
        <p>Por favor, accede a la plataforma para revisar el plan de acción y verificar su eficacia.</p>
        <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Acción</a>
      `;
      const previewUrl = await sendEmail(user.email, subject, html);
      
      let commentText = `Notificación de verificación enviada a ${user.email}.`;
      if (previewUrl) {
          commentText += ` Previsualización: ${previewUrl}`;
      } else {
          commentText += ` | ENVÍO FALLÓ.`;
      }
      return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: commentText };

    } else {
         console.warn(`[NotificationService] Could not find user email for verification responsible ID: ${action.analysis.verificationResponsibleUserId}`);
         return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: "No se pudo notificar al responsable de la verificación: usuario no encontrado." };
    }
  }

  // Handle other status changes in the future...
  
  return null;
}
