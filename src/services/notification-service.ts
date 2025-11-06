

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
    if (!action.analysis?.proposedActions || !action.analysis.verificationResponsibleUserId) {
        console.warn(`[NotificationService] Action ${action.actionId} is missing proposed actions or a verification responsible.`);
        return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: "No se pudieron enviar todas las notificaciones: faltan responsables de tareas o de verificación." };
    }

    const allUserIds = [
      ...action.analysis.proposedActions.map(pa => pa.responsibleUserId),
      action.analysis.verificationResponsibleUserId
    ];
    const uniqueUserIds = [...new Set(allUserIds)];
    const users = (await Promise.all(uniqueUserIds.map(id => getUserById(id)))).filter((u): u is User => u !== null);

    const emailPromises: Promise<string|null>[] = [];
    const sentTo: string[] = [];

    // Notify proposed action responsibles
    for (const pa of action.analysis.proposedActions) {
      const user = users.find(u => u.id === pa.responsibleUserId);
      if (user?.email) {
        const subject = `Nueva tarea de implementación asignada: ${action.actionId}`;
        const html = `
          <h1>Tarea de Implementación Asignada</h1>
          <p>Hola ${user.name},</p>
          <p>Se te ha asignado la siguiente tarea dentro de la acción de mejora <strong>${action.actionId}: ${action.title}</strong>:</p>
          <blockquote style="border-left: 2px solid #ccc; padding-left: 1em; margin-left: 1em; font-style: italic;">${pa.description}</blockquote>
          <p><strong>Fecha de vencimiento:</strong> ${new Date(pa.dueDate as string).toLocaleDateString()}</p>
          <p>Por favor, accede a la plataforma para actualizar el estado de la tarea cuando la completes.</p>
          <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Acción</a>
        `;
        emailPromises.push(sendEmail(user.email, subject, html));
        sentTo.push(user.email);
      }
    }

    // Notify verification responsible
    const verifier = users.find(u => u.id === action.analysis?.verificationResponsibleUserId);
    if (verifier?.email) {
       const subject = `Asignado como Verificador para la Acción: ${action.actionId}`;
       const html = `
          <h1>Asignado como Verificador</h1>
          <p>Hola ${verifier.name},</p>
          <p>Has sido asignado/a como responsable de verificar la eficacia de la acción de mejora <strong>${action.actionId}: ${action.title}</strong>.</p>
          <p>Se ha notificado a los responsables de las tareas de implementación. Una vez completadas, deberás realizar la verificación desde la plataforma.</p>
          <p>Recibirás notificaciones a medida que se actualice el estado de las tareas.</p>
          <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Acción</a>
       `;
       emailPromises.push(sendEmail(verifier.email, subject, html));
       sentTo.push(verifier.email);
    }
    
    const results = await Promise.all(emailPromises);
    const successfulPreviews = results.filter((url): url is string => url !== null);
    
    let commentText = `Notificaciones de 'Pendiente Comprobación' enviadas a: ${[...new Set(sentTo)].join(', ')}.`;
    if(successfulPreviews.length > 0) {
        commentText += ` Previsualizaciones: ${successfulPreviews.join(' , ')}`;
    }
    if(results.some(r => r === null)) {
        commentText += ` | ALGUNOS ENVÍOS FALLARON.`;
    }

    return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: commentText };
  }

  // Handle other status changes in the future...
  
  return null;
}
