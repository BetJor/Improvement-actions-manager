
'use server';
/**
 * @fileOverview A service for handling notifications.
 * This service uses Nodemailer with an Ethereal test account to send emails.
 */
import 'dotenv/config';
import { ImprovementAction, User, ActionComment, ProposedAction } from '@/lib/types';
import { getUserById, getUsers } from './users-service';
import { addCommentToAction } from './actions-service';
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
        const responsibleUser = await getUserById(proposedAction.responsibleUserId);
        if(!responsibleUser || !responsibleUser.email) {
            throw new Error(`La acción propuesta '${proposedAction.description.substring(0, 30)}...' no tiene un responsable con email.`);
        }
        proposedAction.responsibleUserEmail = responsibleUser.email;
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

async function getEmailDetailsForClosure(action: ImprovementAction): Promise<EmailInfo> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const actionUrl = `${appUrl}/actions/${action.id}`;

    const recipientEmail = action.creator.email;
    if (!recipientEmail) {
        throw new Error(`No se pudo encontrar el email del creador para la acción ${action.actionId}.`);
    }

    const dueDate = action.closureDueDate ? format(safeParseDate(action.closureDueDate)!, 'dd/MM/yyyy') : 'No definida';
    
    const subject = `Acción pendiente de cierre: ${action.actionId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #00529B; border-bottom: 2px solid #00529B; padding-bottom: 10px;">Acción de Mejora Pendiente de Cierre</h2>
          <p>La acción de mejora <strong>${action.actionId}: ${action.title}</strong> que creaste ha sido completamente verificada y está lista para su cierre final.</p>
          <p>La fecha límite para completar el cierre es el <strong>${dueDate}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #00529B;">Resumen de la Verificación</h3>
            <p style="margin-top: 10px;"><strong>Verificado por:</strong> ${action.verification?.verificationResponsible.name || 'N/D'}</p>
            <p><strong>Fecha de Verificación:</strong> ${action.verification?.verificationDate ? format(safeParseDate(action.verification.verificationDate)!, 'dd/MM/yyyy') : 'N/D'}</p>
            <h4 style="margin-top: 15px; margin-bottom: 5px; color: #333;">Observaciones de la Verificación:</h4>
            <p style="margin: 0; white-space: pre-wrap; font-style: italic;">${action.verification?.notes || 'Sin observaciones.'}</p>
          </div>
          
          <p>Por favor, accede a la plataforma para revisar la verificación y proceder con el cierre conforme o no conforme de la acción.</p>
          <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; text-align: center;">Cerrar Acción</a>
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
    let emailInfoGenerator: ((action: ImprovementAction) => Promise<EmailInfo>) | null = null;
    let recipients: string[] = [];

    switch (newStatus) {
        case 'Pendiente Análisis':
            notificationSummary = 'Notificación de análisis enviada a:';
            emailInfoGenerator = getEmailDetailsForAnalysis;
            recipients = [action.responsibleGroupId];
            break;
        case 'Pendiente Comprobación':
             notificationSummary = 'Notificaciones de implementación/verificación enviadas a:';
            if (action.analysis) {
                const responsibleEmails = [...new Set(action.analysis.proposedActions.map(pa => pa.responsibleUserEmail))];
                recipients.push(...responsibleEmails);

                let verifierEmail = action.analysis.verificationResponsibleUserEmail;
                 if (!verifierEmail && action.analysis.verificationResponsibleUserId) {
                    const verifier = await getUserById(action.analysis.verificationResponsibleUserId);
                    if (verifier?.email) recipients.push(verifier.email);
                } else if(verifierEmail) {
                    recipients.push(verifierEmail);
                }
            }
            break;
        case 'Pendiente de Cierre':
            notificationSummary = 'Notificación de acción pendiente de cierre enviada a:';
            emailInfoGenerator = getEmailDetailsForClosure;
            if (action.creator.email) {
                recipients = [action.creator.email];
            }
            break;
        default:
            return null;
    }
     
    if (newStatus === 'Pendiente Comprobación' && action.analysis) {
        for (const email of [...new Set(recipients)]) {
            const userFirstAction = action.analysis.proposedActions.find(pa => pa.responsibleUserEmail === email);
            if (userFirstAction) {
                try {
                    const emailInfo = await getEmailDetailsForProposedAction(action, userFirstAction);
                    emailTasks.push(sendEmail(emailInfo.recipient, emailInfo.subject, emailInfo.html).then(url => ({ recipient: emailInfo.recipient, url })));
                } catch (error: any) { return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: `Error al preparar email de acción propuesta: ${error.message}` }; }
            } else if (email === action.analysis.verificationResponsibleUserEmail) {
                 try {
                    const emailInfo = await getEmailDetailsForVerification(action);
                    emailTasks.push(sendEmail(emailInfo.recipient, emailInfo.subject, emailInfo.html).then(url => ({ recipient: emailInfo.recipient, url })));
                } catch (error: any) { return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: `Error al preparar email de verificación: ${error.message}` }; }
            }
        }
    } else if (emailInfoGenerator && recipients.length > 0) {
        for (const recipient of recipients) {
             try {
                const emailInfo = await emailInfoGenerator(action);
                emailTasks.push(sendEmail(recipient, emailInfo.subject, emailInfo.html).then(url => ({ recipient, url })));
            } catch (error: any) {
                return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: `Error al preparar la notificación: ${error.message}` };
            }
        }
    }
    
    if (emailTasks.length === 0) {
        return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: 'No se encontraron destinatarios para la notificación.' };
    }

    const results = await Promise.all(emailTasks);
    
    const successfulSends = results.filter(r => r.url && !r.url.startsWith('FALLO_DE_ENVIO'));
    const failedSends = results.filter(r => !r.url || r.url.startsWith('FALLO_DE_ENVIO'));

    let commentText = '';
    if (successfulSends.length > 0) {
        const uniqueRecipients = [...new Set(successfulSends.map(r => r.recipient))];
        const previews = successfulSends.map(r => r.url).join(' ');
        commentText = `${notificationSummary} ${uniqueRecipients.join(', ')}. ${previews}`;
    }
    
    if (failedSends.length > 0) {
        const failedRecipients = failedSends.map(r => r.recipient).join(', ');
        commentText += `\nFallo de envío a: ${failedRecipients}.`;
    }

    return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: commentText.trim() };
}


/**
 * Sends a notification email when a proposed action's status is updated.
 */
export async function sendProposedActionUpdateEmail(
    action: ImprovementAction,
    updatedProposedActionId: string,
    verifierEmail: string
): Promise<ActionComment | null> {
    const updatedAction = action.analysis?.proposedActions.find(p => p.id === updatedProposedActionId);
    if (!updatedAction || !action.analysis) {
        return null; // Should not happen
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const actionUrl = `${appUrl}/actions/${action.id}`;
    
    const subject = `Actualización de tarea en la acción de mejora: ${action.actionId}`;
    
    const allActionsCompleted = action.analysis.proposedActions.every(pa => pa.status === 'Implementada');

    const statusListHtml = action.analysis.proposedActions.map(pa => {
        const isUpdated = pa.id === updatedProposedActionId;
        const dueDate = pa.dueDate ? format(safeParseDate(pa.dueDate)!, 'dd/MM/yyyy') : 'N/D';
        return `
            <li style="margin-bottom: 8px; ${isUpdated ? 'font-weight: bold;' : ''}">
                ${pa.description} - 
                Responsable: ${pa.responsibleUserEmail || 'N/D'} | 
                Fecha Límite: ${dueDate} |
                Estado: ${pa.status || 'Pendiente'} ${isUpdated ? '(Actualizado recientemente)' : ''}
            </li>
        `;
    }).join('');

    let additionalInfo = '';
    if (allActionsCompleted) {
        additionalInfo = `<p style="margin-top: 20px; font-weight: bold; color: #28a745;">¡Todas las acciones propuestas han sido implementadas! Ya puedes proceder a la verificación final.</p>`;
    } else {
        additionalInfo = `<p style="margin-top: 20px;">Todavía quedan acciones pendientes en este plan.</p>`;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #00529B; border-bottom: 2px solid #00529B; padding-bottom: 10px;">Actualización de Progreso en Acción de Mejora</h2>
          <p>Hola, se ha actualizado el estado de una de las tareas del plan de acción que estás verificando para la acción <strong>${action.actionId}: ${action.title}</strong>.</p>
          
          <div style="background-color: #f0faff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #00529B;">Estado Actual del Plan de Acción</h3>
            <ul style="padding-left: 20px;">
                ${statusListHtml}
            </ul>
          </div>
          
          ${additionalInfo}

          <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; text-align: center; margin-top: 10px;">Revisar Acción de Mejora</a>
        </div>
      </div>
    `;

    const previewUrl = await sendEmail(verifierEmail, subject, html);
    const paIndex = action.analysis.proposedActions.findIndex(p => p.id === updatedProposedActionId) + 1;
    
    if (previewUrl && !previewUrl.startsWith('FALLO_DE_ENVIO')) {
        return {
            id: crypto.randomUUID(),
            author: { id: 'system', name: 'Sistema' },
            date: new Date().toISOString(),
            text: `Notificación de actualización de estado de la acción propuesta ${paIndex} enviada a: ${verifierEmail}. ${previewUrl}`
        };
    } else {
         return {
            id: crypto.randomUUID(),
            author: { id: 'system', name: 'Sistema' },
            date: new Date().toISOString(),
            text: `Fallo al enviar notificación de actualización de estado a: ${verifierEmail}.`
        };
    }
}


export async function sendBisCreationNotificationEmail(bisAction: ImprovementAction, originalAction: ImprovementAction): Promise<void> {
    const recipientEmail = bisAction.creator.email;
    if (!recipientEmail) {
        console.warn(`[sendBisCreationNotificationEmail] No se pudo encontrar el email del creador para la nueva acción BIS ${bisAction.actionId}.`);
        return;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const newActionUrl = `${appUrl}/actions/${bisAction.id}`;
    const originalActionUrl = `${appUrl}/actions/${originalAction.id}`;

    const subject = `Se ha creado una nueva Acción de Mejora (BIS) para tu revisión: ${bisAction.actionId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #00529B; border-bottom: 2px solid #00529B; padding-bottom: 10px;">Nueva Acción BIS en Borrador</h2>
          <p>Hola ${bisAction.creator.name},</p>
          <p>Se ha creado una nueva acción de mejora (BIS) en estado <strong>"Borrador"</strong> a partir del cierre no conforme de la acción <a href="${originalActionUrl}">${originalAction.actionId}</a>.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #00529B;">Nueva Acción BIS: ${bisAction.actionId}</h3>
             <p style="margin: 0; white-space: pre-wrap; font-style: italic;">${bisAction.description}</p>
          </div>
          
          <p>Por favor, accede a la plataforma para revisar los detalles de esta nueva acción, completarla si es necesario y enviarla para su análisis.</p>
          <a href="${newActionUrl}" style="background-color: #00529B; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; text-align: center; margin-top: 10px;">Revisar Acción BIS</a>
        </div>
      </div>
    `;

    const previewUrl = await sendEmail(recipientEmail, subject, html);
    const commentText = previewUrl && !previewUrl.startsWith('FALLO_DE_ENVIO')
        ? `Notificación de creación de acción BIS (${bisAction.actionId}) enviada a: ${recipientEmail}. ${previewUrl}`
        : `Fallo al enviar notificación de creación de acción BIS a: ${recipientEmail}.`;

    const comment: ActionComment = {
        id: crypto.randomUUID(),
        author: { id: 'system', name: 'Sistema' },
        date: new Date().toISOString(),
        text: commentText,
    };
    
    // Add the comment to the ORIGINAL action to keep track of the event
    await addCommentToAction(originalAction.id, comment);
}
