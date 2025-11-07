
'use server';
/**
 * @fileOverview A service for handling notifications.
 * This service uses Nodemailer with an Ethereal test account to send emails.
 */
import 'dotenv/config';
import { ImprovementAction, User, ActionComment, ProposedAction } from '@/lib/types';
import { getUserById, getUsers } from './users-service';
import nodemailer from 'nodemailer';

interface StateChangeDetails {
  action: ImprovementAction;
  analysisData?: {
    verificationResponsibleUserEmail: string;
    // ... other analysis data
  };
}


export interface EmailInfo {
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
    return null;
  }
}

/**
 * Prepares the details for an email notification without sending it.
 * This version uses the email directly from the form data.
 */
export async function getEmailDetailsForStateChange(details: StateChangeDetails): Promise<EmailInfo | null> {
    const { action, analysisData } = details;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const actionUrl = `${appUrl}/actions/${action.id}`;

    if (!analysisData?.verificationResponsibleUserEmail) {
        throw new Error("No se ha proporcionado el email del responsable de verificación.");
    }
    
    const recipientEmail = analysisData.verificationResponsibleUserEmail;

    // We still query users to get the name for a personalized email, but we don't depend on it for the email address.
    const allUsers = await getUsers();
    const userName = allUsers.find(u => u.email === recipientEmail)?.name || 'Usuario';

    const subject = `Verificación de acción de mejora pendiente: ${action.actionId}`;
    const html = `
      <h1>Tarea de Verificación Asignada</h1>
      <p>Hola ${userName},</p>
      <p>Se te ha asignado la verificación de la implementación de la acción de mejora <strong>${action.actionId}: ${action.title}</strong>.</p>
      <p>Por favor, accede a la plataforma para revisar el plan de acción y verificar su eficacia.</p>
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
    
    if (newStatus === 'Pendiente Comprobación') {
        const responsibleEmail = action.analysis?.verificationResponsibleUserEmail;
        if (!responsibleEmail) {
            return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: "No se pudo notificar: no hay responsable de verificación asignado." };
        }
        
        try {
            const emailInfo = await getEmailDetailsForStateChange({ action, analysisData: { verificationResponsibleUserEmail: responsibleEmail } });
            if (!emailInfo) {
                 return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: "No se pudieron preparar los detalles del email de notificación." };
            }

            const previewUrl = await sendEmail(emailInfo.recipient, emailInfo.subject, emailInfo.html);
            
            let commentText = `Notificación de verificación enviada a ${emailInfo.recipient}.`;
            if (previewUrl) {
                commentText += ` Previsualización: ${previewUrl}`;
            } else {
                commentText += ` | ENVÍO FALLÓ.`;
            }
            return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: commentText };

        } catch (error: any) {
            console.error(`[NotificationService] Error in sendStateChangeEmail:`, error);
            return { id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: `Error al intentar notificar: ${error.message}` };
        }
    }

  return null;
}
