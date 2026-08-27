import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendClientReminderEmail } from '@/lib/email/resend';

export async function GET(request: NextRequest) {
  return handleReminders(request);
}

export async function POST(request: NextRequest) {
  return handleReminders(request);
}

async function handleReminders(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const url = new URL(request.url);
    const querySecret = url.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    // Verify cron secret if configured
    if (cronSecret && cronSecret.trim() !== '') {
      const isBearerValid = authHeader === `Bearer ${cronSecret}`;
      const isQueryValid = querySecret === cronSecret;
      if (!isBearerValid && !isQueryValid) {
        return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
      }
    }

    const admin = createAdminClient();

    // 1. Fetch active agencies with reminder settings enabled
    const { data: agencies, error: agencyErr } = await admin
      .from('agencies')
      .select(`
        *,
        reminder_settings(*)
      `);

    if (agencyErr) throw agencyErr;

    let processedCount = 0;
    let sentCount = 0;
    const results: any[] = [];

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    for (const agency of agencies || []) {
      const settings = agency.reminder_settings;
      if (!settings || !settings.enabled) continue;

      const daysDelay = settings.days_before_reminder || 3;
      const maxReminders = settings.max_reminders || 3;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysDelay);

      // 2. Fetch clients who are still incomplete and created before cutoff
      const { data: clients } = await admin
        .from('clients')
        .select(`
          *,
          reminder_log(*)
        `)
        .eq('agency_id', agency.id)
        .in('status', ['invited', 'in_progress'])
        .lt('created_at', cutoffDate.toISOString());

      for (const client of clients || []) {
        processedCount++;
        const sentLogs = (client.reminder_log || []).filter((l: any) => l.status === 'sent');

        // Check max reminders limit
        if (sentLogs.length >= maxReminders) {
          continue;
        }

        // Check if a reminder was sent recently (within daysDelay)
        const lastSentLog = sentLogs[sentLogs.length - 1];
        if (lastSentLog) {
          const lastSentDate = new Date(lastSentLog.sent_at);
          const nextAllowedDate = new Date(lastSentDate);
          nextAllowedDate.setDate(nextAllowedDate.getDate() + daysDelay);
          if (new Date() < nextAllowedDate) {
            continue;
          }
        }

        // Dispatch Reminder Email
        const onboardingUrl = `${appUrl}/onboard/${client.onboarding_token}`;
        const emailResult = await sendClientReminderEmail({
          recipientEmail: client.email,
          clientName: client.name,
          agency: {
            name: agency.name,
            logoUrl: agency.logo_url,
            brandColor: agency.brand_color,
            supportEmail: agency.support_email,
          },
          onboardingUrl,
          customMessage: settings.custom_message,
        });

        // Record log
        await admin.from('reminder_log').insert({
          client_id: client.id,
          reminder_type: `automated_nudge_${sentLogs.length + 1}`,
          recipient_email: client.email,
          status: emailResult.success ? 'sent' : 'failed',
        });

        if (emailResult.success) {
          sentCount++;
          results.push({
            clientId: client.id,
            email: client.email,
            agency: agency.name,
            status: 'sent',
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      sent: sentCount,
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cron error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
