import { Agency, Client, ProjectBrief } from '@/types';

export interface WebhookNotificationPayload {
  event: 'client.onboarding_completed' | 'client.files_uploaded' | 'client.invited';
  timestamp: string;
  client: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    serviceCategory?: string;
  };
  agency: {
    id: string;
    name: string;
  };
  summary?: string | null;
  goals?: string[];
  handoffUrl: string;
  filesCount?: number;
}

/**
 * Dispatches webhook alerts to WhatsApp (via Zapier/Make), Slack, and custom webhook endpoints.
 */
export async function dispatchAgencyWebhooks(
  agency: Agency,
  client: Client,
  brief?: ProjectBrief | null,
  filesCount: number = 0
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const handoffUrl = `${appUrl}/package/${client.package_share_token}`;

  const payload: WebhookNotificationPayload = {
    event: 'client.onboarding_completed',
    timestamp: new Date().toISOString(),
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      company: client.company,
      serviceCategory: client.service_category || 'general',
    },
    agency: {
      id: agency.id,
      name: agency.name,
    },
    summary: brief?.ai_summary,
    goals: brief?.goals || [],
    handoffUrl,
    filesCount,
  };

  const dispatchPromises: Promise<any>[] = [];

  // 1. Generic Webhook (Zapier / Make / n8n / custom server)
  if (agency.webhook_url) {
    dispatchPromises.push(
      fetch(agency.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((e) => console.warn('Generic webhook delivery failed:', e.message))
    );
  }

  // 2. WhatsApp Webhook (Zapier / Make / Twilio WhatsApp relay)
  if (agency.whatsapp_webhook_url) {
    const whatsappMessage = {
      ...payload,
      formattedText: `🎉 *New Client Onboarding Completed!*\n\n*Client:* ${client.name} (${client.company || 'N/A'})\n*Service:* ${client.service_category || 'General'}\n*Files:* ${filesCount} uploads\n\n📋 *Executive Brief:* ${brief?.ai_summary?.substring(0, 150)}...\n\n👉 *View Handoff Package:* ${handoffUrl}`,
    };
    dispatchPromises.push(
      fetch(agency.whatsapp_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whatsappMessage),
      }).catch((e) => console.warn('WhatsApp webhook delivery failed:', e.message))
    );
  }

  // 3. Slack Webhook
  if (agency.slack_webhook_url) {
    const slackPayload = {
      text: `🎉 *${client.name}* (${client.company || 'Client'}) just completed onboarding!`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚀 New Client Project-Ready!',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Client:*\n${client.name} (${client.company || 'N/A'})`,
            },
            {
              type: 'mrkdwn',
              text: `*Service:*\n${client.service_category || 'Creative Retainer'}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*AI Executive Summary:*\n${brief?.ai_summary || 'Intake completed with all assets attached.'}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Handoff Package 📦',
                emoji: true,
              },
              url: handoffUrl,
              style: 'primary',
            },
          ],
        },
      ],
    };

    dispatchPromises.push(
      fetch(agency.slack_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload),
      }).catch((e) => console.warn('Slack webhook delivery failed:', e.message))
    );
  }

  await Promise.allSettled(dispatchPromises);
}
