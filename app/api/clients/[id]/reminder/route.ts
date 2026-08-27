import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendClientReminderEmail } from '@/lib/email/resend';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: clientId } = await params;
    const admin = createAdminClient();

    // Fetch Client with Agency and Reminder Settings
    const { data: client, error: clientErr } = await admin
      .from('clients')
      .select(`
        *,
        agency:agencies(
          *,
          reminder_settings(*)
        )
      `)
      .eq('id', clientId)
      .single();

    if (clientErr || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const agency = client.agency;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const onboardingUrl = `${appUrl}/onboard/${client.onboarding_token}`;
    const customMessage = agency.reminder_settings?.custom_message || null;

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
      customMessage,
    });

    // Log reminder in DB
    await admin.from('reminder_log').insert({
      client_id: client.id,
      reminder_type: 'manual_nudge',
      recipient_email: client.email,
      status: emailResult.success ? 'sent' : 'failed',
    });

    return NextResponse.json({ success: true, emailResult });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
