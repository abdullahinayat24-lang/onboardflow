import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientSchema } from '@/lib/validations/client';
import { generateOnboardingToken, generateShareToken } from '@/lib/utils';
import { sendClientInvitationEmail } from '@/lib/email/resend';
import { localStore } from '@/lib/store';
import { Client } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('owner_user_id', user.id)
        .single();

      if (agency) {
        const { data: clients, error } = await supabase
          .from('clients')
          .select(`
            *,
            brief:project_briefs(*),
            responses:questionnaire_responses(*),
            checklist_status:client_checklist_status(*),
            uploads(*)
          `)
          .eq('agency_id', agency.id)
          .order('created_at', { ascending: false });

        if (!error && clients && clients.length > 0) {
          return NextResponse.json({ clients });
        }
      }
    }

    // Local in-memory fallback
    const allLocalClients = Array.from(localStore.clients.values()).map((c) =>
      localStore.getClientWithDetails(c.id)
    );

    return NextResponse.json({ clients: allLocalClients });
  } catch (err: unknown) {
    const allLocalClients = Array.from(localStore.clients.values()).map((c) =>
      localStore.getClientWithDetails(c.id)
    );
    return NextResponse.json({ clients: allLocalClients });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    let agencyId: string | null = null;
    let agencyRecord: any = null;

    if (user) {
      const { data: agency } = await supabase
        .from('agencies')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();
      if (agency) {
        agencyId = agency.id;
        agencyRecord = agency;
      }
    }

    if (!agencyId) {
      const { data: firstAgency } = await admin.from('agencies').select('*').limit(1).single();
      if (firstAgency) {
        agencyId = firstAgency.id;
        agencyRecord = firstAgency;
      }
    }

    const body = await request.json();
    const validated = createClientSchema.parse(body);

    const onboardingToken = generateOnboardingToken();
    const packageShareToken = generateShareToken();

    const clientPayload: Client = {
      id: `client_${Date.now()}`,
      agency_id: agencyId || localStore.agency.id,
      name: validated.name,
      email: validated.email,
      company: validated.company || null,
      status: 'invited',
      onboarding_token: onboardingToken,
      package_share_token: packageShareToken,
      questionnaire_template_id: validated.questionnaire_template_id || 'demo-q-001',
      checklist_template_id: validated.checklist_template_id || 'demo-c-001',
      last_activity_at: new Date().toISOString(),
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store in localStore
    localStore.clients.set(clientPayload.id, clientPayload);

    // Try persisting to Supabase if connected
    try {
      const { data: newClient, error: insertErr } = await admin
        .from('clients')
        .insert(clientPayload)
        .select('*')
        .single();
      if (!insertErr && newClient) {
        // Successful Supabase insert
      }
    } catch {
      // Offline fallback
    }

    // Dispatch Invitation Email if requested
    const targetAgency = agencyRecord || localStore.agency;
    if (validated.send_invitation_email && targetAgency) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const onboardingUrl = `${appUrl}/onboard/${onboardingToken}`;

      await sendClientInvitationEmail({
        recipientEmail: validated.email,
        clientName: validated.name,
        agency: {
          name: targetAgency.name,
          logoUrl: targetAgency.logo_url,
          brandColor: targetAgency.brand_color,
          supportEmail: targetAgency.support_email,
        },
        onboardingUrl,
      });
    }

    return NextResponse.json({ client: clientPayload }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
