

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
    const html = `
      <h1>Tarea de Verificación Asignada</h1>
      <p>Se te ha asignado la verificación final de la implementación de la acción de mejora <strong>${action.actionId}: ${action.title}</strong>.</p>
      <p>Tu tarea consiste en comprobar la eficacia de las acciones correctivas una vez estas hayan sido implementadas por sus respectivos responsables.</p>
      <p>Recibirás notificaciones a medida que el estado de las acciones propuestas se actualice. Una vez todas estén completadas, podrás realizar la verificación final desde la plataforma.</p>
      <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Acción de Mejora</a>
    `;
    
    return { recipient: recipientEmail, subject, html, actionUrl };
}

async function getEmailDetailsForProposedAction(action: ImprovementAction, proposedAction: ProposedAction): Promise<EmailInfo> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const actionUrl = `${appUrl}/actions/${action.id}`;

    const recipientEmail = proposedAction.responsibleUserEmail;
    if (!recipientEmail) {
        throw new Error(`La acción propuesta '${proposedAction.description.substring(0, 30)}...' no tiene un email de responsable.`);
    }

    const dueDate = proposedAction.dueDate ? format(safeParseDate(proposedAction.dueDate)!, 'dd/MM/yyyy') : 'N/D';
    
    const subject = `Nueva tarea asignada en la acción de mejora: ${action.actionId}`;
    const html = `
      <h1>Nueva Tarea Asignada</h1>
      <p>Se te ha asignado una nueva tarea dentro de la acción de mejora <strong>${action.actionId}: ${action.title}</strong>.</p>
      <hr>
      <p><strong>Tarea a realizar:</strong></p>
      <p><em>${proposedAction.description}</em></p>
      <p><strong>Fecha límite de implementación:</strong> ${dueDate}</p>
      <hr>
      <p>Por favor, accede a la plataforma para actualizar el estado de la tarea una vez la hayas completado.</p>
      <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Acción de Mejora</a>
    `;

    return { recipient: recipientEmail, subject, html, actionUrl };
}


async function getEmailDetailsForAnalysis(action: ImprovementAction): Promise<EmailInfo> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const actionUrl = `${appUrl}/actions/${action.id}`;

    const recipientEmail = action.responsibleGroupId; // This is the email of the responsible group/person
     if (!recipientEmail) {
        throw new Error("No se ha proporcionado el email del responsable del análisis.");
    }
    
    const subject = `Nueva acción de mejora asignada para análisis: ${action.actionId}`;
    const html = `
      <h1>Nueva Acción Asignada para Análisis</h1>
      <p>Se ha asignado el análisis de la nueva acción de mejora <strong>${action.actionId}: ${action.title}</strong>.</p>
      <p>Por favor, accede a la plataforma para realizar el análisis de causas y proponer un plan de acción.</p>
      <a href="${actionUrl}" style="background-color: #00529B; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Acción</a>
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

        // Email to each person responsible for a proposed action
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

        // Email to the final verifier
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

    let commentText = `${notificationSummary}\n\n`;
    if (successfulSends.length > 0) {
        commentText += `Correctamente a: ${successfulSends.map(r => r.recipient).join(', ')}.\n`;
        successfulSends.forEach(r => {
            commentText += `Previsualización para ${r.recipient}: ${r.url}\n`;
        });
    }
    if (failedSends.length > 0) {
        commentText += `\nFallo de envío a: ${failedSends.map(r => r.recipient).join(', ')}. Revisa la configuración del servidor y los emails.`;
    }

    return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: commentText.trim() };
}
