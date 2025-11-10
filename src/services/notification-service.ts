
'use server';
/**
 * @fileOverview A service for handling notifications.
 * This service uses Nodemailer with an Ethereal test account to send emails.
 */
import 'dotenv/config';
import { ImprovementAction, User, ActionComment, ProposedAction } from '@/lib/types';
import { getUserById, getUsers } from './users-service';
import nodemailer from 'nodemailer';
import { format } from 'date-fns';
import { safeParseDate } from '@/lib/utils';

interface EmailInfo {
    recipient: string;
    subject: string;
    html: string;
    actionUrl: string;
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
    // Return a specific string to indicate failure
    return `FALLO_DE_ENVIO: ${error instanceof Error ? error.message : String(error)}`;
  }
}

async function getEmailDetailsForVerification(action: ImprovementAction): Promise<EmailInfo> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const actionUrl = `${appUrl}/actions/${action.id}`;

    const recipientEmail = action.analysis?.verificationResponsibleUserEmail;
    if (!recipientEmail) {
        throw new Error("No se ha proporcionado el email del responsable de verificación.");
    }
    
    const subject = `Asignado como verificador para la acción: ${action.actionId}`;
    
    const proposedActionsHtml = action.analysis?.proposedActions.map(pa => `
        <div style="padding: 10px; border: 1px solid #eee; border-radius: 4px; margin-bottom: 10px;">
            <p style="margin:0; font-weight: bold;">${pa.description}</p>
            <p style="margin:5px 0 0; font-size: 0.9em; color: #555;">Responsable: ${pa.responsibleUserEmail} | Fecha Límite: ${pa.dueDate ? format(safeParseDate(pa.dueDate)!, 'dd/MM/yyyy') : 'N/D'}</p>
        </div>
    `).join('') || '<p>No se han definido acciones.</p>';

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #00529B; border-bottom: 2px solid #00529B; padding-bottom: 10px;">Tarea de Verificación Asignada</h2>
          <p>Se te ha asignado la verificación final de la implementación de la acción de mejora <strong>${action.actionId}: ${action.title}</strong>.</p>
          <p>Tu tarea consiste en comprobar la eficacia del siguiente plan de acción una vez todas las tareas hayan sido implementadas por sus respectivos responsables.</p>
          
           <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #00529B;">Detalles de la Acción Origen</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold; width: 120px;">Creador/a:</td><td>${action.creator.name}</td></tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Ámbito:</td><td>${action.type}</td></tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Origen:</td><td>${action.category}</td></tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Centro:</td><td>${action.center || 'No especificado'}</td></tr>
                </table>
                <h4 style="margin-top: 15px; margin-bottom: 5px; color: #333;">Observaciones:</h4>
                <p style="margin: 0; white-space: pre-wrap; font-style: italic;">${action.description}</p>
            </div>

          <div style="background-color: #f0faff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #00529B;">Plan de Acción a Verificar</h3>
            ${proposedActionsHtml}
          </div>

          <p>Recibirás notificaciones a medida que el estado de las acciones propuestas se actualice. Una vez todas estén completadas, podrás realizar la verificación final desde la plataforma.</p>
          <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; text-align: center;">Ver Acción de Mejora</a>
        </div>
      </div>
    `;
    
    return { recipient: recipientEmail, subject, html, actionUrl };
}

async function getEmailDetailsForProposedAction(action: ImprovementAction, proposedAction: ProposedAction): Promise<EmailInfo> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const actionUrl = `${appUrl}/actions/${action.id}`;

    if (!proposedAction.responsibleUserEmail) {
        throw new Error(`La acción propuesta '${proposedAction.description.substring(0, 30)}...' no tiene un email de responsable.`);
    }
    const recipientEmail = proposedAction.responsibleUserEmail;

    const dueDate = proposedAction.dueDate ? format(safeParseDate(proposedAction.dueDate)!, 'dd/MM/yyyy') : 'N/D';
    
    const subject = `Nueva tarea asignada en la acción de mejora: ${action.actionId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #00529B; border-bottom: 2px solid #00529B; padding-bottom: 10px;">Nueva Tarea Asignada</h2>
          <p>Se te ha asignado una nueva tarea dentro de la acción de mejora <strong>${action.actionId}: ${action.title}</strong>.</p>
          
           <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #00529B;">Detalles de la Acción Origen</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold; width: 120px;">Creador/a:</td><td>${action.creator.name}</td></tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Ámbito:</td><td>${action.type}</td></tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Origen:</td><td>${action.category}</td></tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Centro:</td><td>${action.center || 'No especificado'}</td></tr>
                </table>
                <h4 style="margin-top: 15px; margin-bottom: 5px; color: #333;">Observaciones:</h4>
                <p style="margin: 0; white-space: pre-wrap; font-style: italic;">${action.description}</p>
            </div>

          <div style="background-color: #f0faff; border-left: 4px solid #00529B; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Tu tarea a realizar:</strong></p>
            <p style="margin: 5px 0 0; font-size: 1.1em; font-style: italic;">${proposedAction.description}</p>
             <p style="margin: 10px 0 0; font-size: 0.9em; color: #555;">Fecha límite: <strong>${dueDate}</strong></p>
          </div>
          
          <p>Por favor, accede a la plataforma para actualizar el estado de la tarea una vez la hayas completado.</p>
          <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; text-align: center;">Ver y Actualizar Tarea</a>
        </div>
      </div>
    `;

    return { recipient: recipientEmail, subject, html, actionUrl };
}

async function getEmailDetailsForAnalysis(action: ImprovementAction): Promise<EmailInfo> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const actionUrl = `${appUrl}/actions/${action.id}`;

    const recipientEmail = action.responsibleGroupId;
    if (!recipientEmail) {
        throw new Error("No se ha proporcionado el email del responsable del análisis.");
    }

    const dueDate = action.analysisDueDate ? format(safeParseDate(action.analysisDueDate)!, 'dd/MM/yyyy') : 'No definida';
    
    const subject = `Nueva acción de mejora asignada para análisis: ${action.actionId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #00529B; border-bottom: 2px solid #00529B; padding-bottom: 10px;">Nueva Acción de Mejora para Analizar</h2>
          <p>Se te ha asignado el análisis de la acción de mejora <strong>${action.actionId}: ${action.title}</strong>.</p>
          <p>La fecha límite para completar el análisis es el <strong>${dueDate}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #00529B;">Detalles de la Acción</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold; width: 120px;">Creador/a:</td><td>${action.creator.name}</td></tr>
              <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Ámbito:</td><td>${action.type}</td></tr>
              <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Origen:</td><td>${action.category}</td></tr>
              <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Centro:</td><td>${action.center || 'No especificado'}</td></tr>
            </table>
            <h4 style="margin-top: 15px; margin-bottom: 5px; color: #333;">Observaciones:</h4>
            <p style="margin: 0; white-space: pre-wrap; font-style: italic;">${action.description}</p>
          </div>
          
          <p>Por favor, accede a la plataforma para realizar el análisis de causas y proponer un plan de acción.</p>
          <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; text-align: center;">Realizar Análisis</a>
        </div>
      </div>
    `;

    return { recipient: recipientEmail, subject, html, actionUrl };
}

async function getEmailDetailsForVerificationUpdate(action: ImprovementAction, updatedProposedActionId: string): Promise<EmailInfo> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const actionUrl = `${appUrl}/actions/${action.id}`;
    
    const recipientEmail = action.analysis?.verificationResponsibleUserEmail;
    if (!recipientEmail) {
        throw new Error("No se ha proporcionado el email del responsable de verificación.");
    }
    
    const allActions = action.analysis?.proposedActions || [];
    const updatedAction = allActions.find(pa => pa.id === updatedProposedActionId);
    
    if (!updatedAction) {
        throw new Error("La acción propuesta actualizada no se ha encontrado.");
    }
    
    const allTasksCompleted = allActions.every(pa => pa.status && pa.status !== 'Pendiente');
    
    const subject = `Actualización en el plan de acción de: ${action.actionId}`;
    
    const proposedActionsHtml = allActions.map(pa => {
        const isUpdated = pa.id === updatedProposedActionId;
        const statusColor = pa.status === 'Implementada' ? '#28a745' : pa.status === 'No Implementada' ? '#dc3545' : '#ffc107';
        return `
            <div style="padding: 10px; border: 1px solid ${isUpdated ? '#00529B' : '#eee'}; border-left: 4px solid ${isUpdated ? '#00529B' : '#eee'}; border-radius: 4px; margin-bottom: 10px; background-color: ${isUpdated ? '#f0faff' : 'transparent'};">
                <p style="margin:0; font-weight: bold;">${pa.description}</p>
                <p style="margin:5px 0 0; font-size: 0.9em; color: #555;">
                    Responsable: ${pa.responsibleUserEmail} |
                    Estado: <span style="font-weight: bold; color: ${statusColor};">${pa.status}</span> |
                    Fecha Límite: ${pa.dueDate ? format(safeParseDate(pa.dueDate)!, 'dd/MM/yyyy') : 'N/D'}
                    ${isUpdated ? '(Actualizado Recientemente)' : ''}
                </p>
            </div>
        `;
    }).join('');

    const finalMessage = allTasksCompleted
        ? `<h3 style="color: #28a745;">¡Plan de Acción Completado!</h3>
           <p>Todas las tareas del plan de acción han sido implementadas. Ya puedes proceder a la verificación final de la eficacia.</p>
           <p>Tienes hasta el <strong>${action.verificationDueDate ? format(safeParseDate(action.verificationDueDate)!, 'dd/MM/yyyy') : 'N/D'}</strong> para completarla.</p>`
        : `<p>Una de las tareas ha sido actualizada. Aún quedan tareas pendientes de implementar. Se te notificará de nuevo cuando todo el plan esté completado.</p>`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #00529B; border-bottom: 2px solid #00529B; padding-bottom: 10px;">Actualización del Plan de Acción</h2>
          <p>Se ha actualizado el estado de una de las tareas de la acción de mejora <strong>${action.actionId}: ${action.title}</strong>.</p>
          
           <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #00529B;">Detalles de la Acción Origen</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold; width: 120px;">Creador/a:</td><td>${action.creator.name}</td></tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Ámbito:</td><td>${action.type}</td></tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Origen:</td><td>${action.category}</td></tr>
                    <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Centro:</td><td>${action.center || 'No especificado'}</td></tr>
                </table>
                <h4 style="margin-top: 15px; margin-bottom: 5px; color: #333;">Observaciones:</h4>
                <p style="margin: 0; white-space: pre-wrap; font-style: italic;">${action.description}</p>
            </div>

          <div style="padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #00529B;">Estado del Plan de Acción</h3>
            ${proposedActionsHtml}
          </div>
          
          ${finalMessage}
          
          <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; text-align: center;">Ver Acción de Mejora</a>
        </div>
      </div>
    `;

    return { recipient: recipientEmail, subject, html, actionUrl };
}

/**
 * Handles sending email notifications based on the state change.
 * @returns An ActionComment to be added to the action, or null if no email was sent.
 */
export async function sendStateChangeEmail(details: { action: ImprovementAction, oldStatus: string, newStatus: string }): Promise<ActionComment | null> {
    const { action, newStatus } = details;
    
    let emailTasks: Promise<{ recipient: string, url: string | null }>[] = [];
    let notificationSummary = '';

    if (newStatus === 'Pendiente Análisis') {
        notificationSummary = 'Notificación de análisis enviada a:';
        try {
            const emailInfo = await getEmailDetailsForAnalysis(action);
            emailTasks.push(
                sendEmail(emailInfo.recipient, emailInfo.subject, emailInfo.html).then(url => ({ recipient: emailInfo.recipient, url }))
            );
        } catch (error: any) {
            return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: `Error al preparar la notificación de análisis: ${error.message}` };
        }
    } else if (newStatus === 'Pendiente Comprobación' && action.analysis) {
        notificationSummary = 'Notificaciones de implementación/verificación enviadas a:';
        const uniqueResponsibleEmails = [...new Set(action.analysis.proposedActions.map(pa => pa.responsibleUserEmail))];

        for (const email of uniqueResponsibleEmails) {
            const userFirstAction = action.analysis.proposedActions.find(pa => pa.responsibleUserEmail === email);
            if(userFirstAction) {
                try {
                    const emailInfo = await getEmailDetailsForProposedAction(action, userFirstAction);
                    emailTasks.push(
                        sendEmail(emailInfo.recipient, emailInfo.subject, emailInfo.html).then(url => ({ recipient: emailInfo.recipient, url }))
                    );
                } catch (error: any) {
                     return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: `Error al preparar email de acción propuesta: ${error.message}` };
                }
            }
        }

        if (action.analysis.verificationResponsibleUserEmail) {
            try {
                const verifierEmailInfo = await getEmailDetailsForVerification(action);
                emailTasks.push(
                    sendEmail(verifierEmailInfo.recipient, verifierEmailInfo.subject, verifierEmailInfo.html).then(url => ({ recipient: verifierEmailInfo.recipient, url }))
                );
            } catch (error: any) {
                 return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: `Error al preparar email de verificación: ${error.message}` };
            }
        }
    } else {
        return null;
    }
    
    if (emailTasks.length === 0) {
        return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: 'No se encontraron destinatarios para la notificación.' };
    }

    const results = await Promise.all(emailTasks);
    
    const successfulSends = results.filter(r => r.url && !r.url.startsWith('FALLO_DE_ENVIO'));
    const failedSends = results.filter(r => !r.url || r.url.startsWith('FALLO_DE_ENVIO'));

    let commentText = '';
    if (successfulSends.length > 0) {
        const recipients = successfulSends.map(r => r.recipient).join(', ');
        const previews = successfulSends.map(r => r.url).join(' ');
        commentText = `${notificationSummary} ${recipients}. ${previews}`;
    }
    
    if (failedSends.length > 0) {
        const failedRecipients = failedSends.map(r => r.recipient).join(', ');
        commentText += `\nFallo de envío a: ${failedRecipients}.`;
    }

    return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: commentText.trim() };
}


/**
 * Sends a specific notification when a proposed action's status is updated.
 * @returns An ActionComment to be added to the action, or null if no email was sent.
 */
export async function sendProposedActionUpdateEmail(action: ImprovementAction, updatedProposedActionId: string): Promise<ActionComment | null> {
    let emailTasks: Promise<{ recipient: string, url: string | null }>[] = [];
    let notificationSummary = 'Notificación de actualización de estado enviada a:';

    try {
        const emailInfo = await getEmailDetailsForVerificationUpdate(action, updatedProposedActionId);
        emailTasks.push(
            sendEmail(emailInfo.recipient, emailInfo.subject, emailInfo.html).then(url => ({ recipient: emailInfo.recipient, url }))
        );
    } catch (error: any) {
        return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: `Error al preparar la notificación de actualización: ${error.message}` };
    }
    
    if (emailTasks.length === 0) {
        return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: 'No se encontró el destinatario para la notificación de actualización.' };
    }

    const results = await Promise.all(emailTasks);
    
    const successfulSends = results.filter(r => r.url && !r.url.startsWith('FALLO_DE_ENVIO'));
    const failedSends = results.filter(r => !r.url || r.url.startsWith('FALLO_DE_ENVIO'));

    let commentText = '';
    if (successfulSends.length > 0) {
        const recipients = successfulSends.map(r => r.recipient).join(', ');
        const previews = successfulSends.map(r => r.url).join(' ');
        commentText = `${notificationSummary} ${recipients}. ${previews}`;
    }
    
    if (failedSends.length > 0) {
        const failedRecipients = failedSends.map(r => r.recipient).join(', ');
        commentText += `\nFallo de envío a: ${failedRecipients}.`;
    }

    return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: commentText.trim() };
}
