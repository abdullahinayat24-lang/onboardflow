import { Resend } from 'resend';
import {
  generateInvitationEmailHtml,
  generateReminderEmailHtml,
  generateCompletionNotificationHtml,
  EmailAgencyInfo,
} from './templates';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'OnboardFlow <onboarding@resend.dev>';

const resend = resendApiKey && resendApiKey.trim() !== '' ? new Resend(resendApiKey) : null;

export async function sendClientInvitationEmail(params: {
  recipientEmail: string;
  clientName: string;
  agency: EmailAgencyInfo;
  onboardingUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const html = generateInvitationEmailHtml({
      clientName: params.clientName,
      agency: params.agency,
      onboardingUrl: params.onboardingUrl,
    });

    if (!resend) {
      console.log(`[EMAIL DISPATCH SIMULATION] Sent Invitation to ${params.recipientEmail} with link ${params.onboardingUrl}`);
      return { success: true };
    }

    const { error } = await resend.emails.send({
      from: resendFromEmail,
      to: [params.recipientEmail],
      subject: `Project Onboarding: Welcome to ${params.agency.name}`,
      html,
    });

    if (error) {
      console.error('Failed to send invitation email via Resend:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Email sending exception:', message);
    return { success: false, error: message };
  }
}

export async function sendClientReminderEmail(params: {
  recipientEmail: string;
  clientName: string;
  agency: EmailAgencyInfo;
  onboardingUrl: string;
  customMessage?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const html = generateReminderEmailHtml({
      clientName: params.clientName,
      agency: params.agency,
      onboardingUrl: params.onboardingUrl,
      customMessage: params.customMessage,
    });

    if (!resend) {
      console.log(`[EMAIL DISPATCH SIMULATION] Sent Reminder to ${params.recipientEmail} with link ${params.onboardingUrl}`);
      return { success: true };
    }

    const { error } = await resend.emails.send({
      from: resendFromEmail,
      to: [params.recipientEmail],
      subject: `Action Required: Your project onboarding with ${params.agency.name}`,
      html,
    });

    if (error) {
      console.error('Failed to send reminder email via Resend:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Reminder email exception:', message);
    return { success: false, error: message };
  }
}

export async function sendCompletionNotification(params: {
  recipientEmail: string;
  clientName: string;
  clientCompany?: string | null;
  agencyName: string;
  dashboardUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const html = generateCompletionNotificationHtml(params);

    if (!resend) {
      console.log(`[EMAIL DISPATCH SIMULATION] Sent Completion Alert to ${params.recipientEmail}`);
      return { success: true };
    }

    const { error } = await resend.emails.send({
      from: resendFromEmail,
      to: [params.recipientEmail],
      subject: `🎉 Onboarding Completed: ${params.clientName} ${params.clientCompany ? `(${params.clientCompany})` : ''}`,
      html,
    });

    if (error) {
      console.error('Failed to send completion alert via Resend:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Completion notification exception:', message);
    return { success: false, error: message };
  }
}
