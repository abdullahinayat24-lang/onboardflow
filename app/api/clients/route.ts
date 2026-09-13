import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientSchema } from '@/lib/validations/client';
import { generateOnboardingToken, generateShareToken } from '@/lib/utils';
import { sendClientInvitationEmail } from '@/lib/email/resend';
import { localStore } from '@/lib/store';
import { Client } from '@/types';

const isUUID = (str?: string | null) =>
  !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    let agencyId: string | null = null;
    if (user) {
      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('owner_user_id', user.id)
        .single();
      if (agency) agencyId = agency.id;
    }

    if (!agencyId) {
      const { data: firstAgency } = await admin.from('agencies').select('id').limit(1).single();
      if (firstAgency) agencyId = firstAgency.id;
    }

    const { searchParams } = new URL(request.url);
    const showArchived = searchParams.get('archived') === 'true';

    if (agencyId) {
      let query = admin
        .from('clients')
        .select(`
          *,
          agency:agencies(*),
          brief:project_briefs(*),
          responses:questionnaire_responses(*),
          checklist_status:client_checklist_status(*),
          uploads(*)
        `)
        .eq('agency_id', agencyId);

      if (showArchived) {
        query = query.eq('is_archived', true);
      } else {
        query = query.or('is_archived.is.null,is_archived.eq.false');
      }

      const { data: clients, error } = await query.order('created_at', { ascending: false });

      if (!error && clients && clients.length > 0) {
        return NextResponse.json({ clients });
      }
    }

    // Local in-memory fallback
    const allLocalClients = Array.from(localStore.clients.values())
      .filter((c) => (showArchived ? !!c.is_archived : !c.is_archived))
      .map((c) => localStore.getClientWithDetails(c.id));

    return NextResponse.json({ clients: allLocalClients });
  } catch (err: unknown) {
    const { searchParams } = new URL(request.url);
    const showArchived = searchParams.get('archived') === 'true';
    const allLocalClients = Array.from(localStore.clients.values())
      .filter((c) => (showArchived ? !!c.is_archived : !c.is_archived))
      .map((c) => localStore.getClientWithDetails(c.id));
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

    let clientPayload: Client = {
      id: `client_${Date.now()}`,
      agency_id: agencyId || localStore.agency.id,
      name: validated.name,
      email: validated.email,
      phone: validated.phone || null,
      website: validated.website || null,
      company: validated.company || null,
      service_category: (validated.service_category as any) || 'general',
      status: 'invited',
      project_status: 'pending_onboarding',
      onboarding_token: onboardingToken,
      package_share_token: packageShareToken,
      questionnaire_template_id: validated.questionnaire_template_id || 'tpl_social_media',
      checklist_template_id: validated.checklist_template_id || 'demo-c-001',
      manager_id: validated.manager_id || null,
      assigned_staff_ids: validated.assigned_staff_ids || [],
      is_archived: false,
      last_activity_at: new Date().toISOString(),
      completed_at: null,
      is_starred: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try persisting to Supabase
    try {
      const dbPayload: any = {
        agency_id: agencyId || localStore.agency.id,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        website: validated.website || null,
        company: validated.company || null,
        status: 'invited',
        project_status: 'pending_onboarding',
        manager_id: isUUID(validated.manager_id) ? validated.manager_id : null,
        assigned_staff_ids: validated.assigned_staff_ids || [],
        is_archived: false,
        onboarding_token: onboardingToken,
        package_share_token: packageShareToken,
        questionnaire_template_id: isUUID(validated.questionnaire_template_id)
          ? validated.questionnaire_template_id
          : null,
        checklist_template_id: isUUID(validated.checklist_template_id)
          ? validated.checklist_template_id
          : null,
        last_activity_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: newClient, error: insertErr } = await admin
        .from('clients')
        .insert(dbPayload)
        .select('*')
        .single();

      if (!insertErr && newClient) {
        clientPayload = {
          ...clientPayload,
          id: newClient.id,
        };
      } else if (insertErr) {
        console.warn('Supabase client insert notice:', insertErr);
      }
    } catch (e) {
      console.warn('Supabase client insert exception:', e);
    }

    // Store in localStore
    localStore.clients.set(clientPayload.id, clientPayload);

    // Log Activity
    localStore.logActivity({
      id: `act_${Date.now()}`,
      agency_id: clientPayload.agency_id,
      actor_name: 'Agency Admin',
      action: 'client_created',
      entity_type: 'client',
      entity_id: clientPayload.id,
      entity_title: clientPayload.name,
      metadata: { company: clientPayload.company, service: clientPayload.service_category },
      created_at: new Date().toISOString(),
    });

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
      }).catch((e) => console.warn('Email dispatch warning:', e));
    }

    return NextResponse.json({ client: clientPayload }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
