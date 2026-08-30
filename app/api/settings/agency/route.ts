import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { updateAgencyBrandingSchema } from '@/lib/validations/agency';
import { localStore } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    let agency: any = null;

    if (user) {
      const { data } = await supabase
        .from('agencies')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();
      if (data) agency = data;
    }

    if (!agency) {
      const { data: firstAgency } = await admin.from('agencies').select('*').limit(1).single();
      if (firstAgency) agency = firstAgency;
    }

    if (!agency) {
      agency = localStore.agency;
    }

    return NextResponse.json({ agency });
  } catch (err: unknown) {
    return NextResponse.json({ agency: localStore.agency });
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const validated = updateAgencyBrandingSchema.parse(body);

    const updatePayload = {
      name: validated.name,
      slug: validated.slug || localStore.agency.slug || 'my-agency',
      logo_url: validated.logo_url || null,
      brand_color: validated.brand_color,
      website: validated.website || null,
      support_email: validated.support_email || null,
      whatsapp_webhook_url: body.whatsapp_webhook_url || null,
      slack_webhook_url: body.slack_webhook_url || null,
      webhook_url: body.webhook_url || null,
      stripe_payment_link: body.stripe_payment_link || null,
      updated_at: new Date().toISOString(),
    };

    // Update local store instance
    localStore.agency = {
      ...localStore.agency,
      ...updatePayload,
    };

    let updatedRecord = localStore.agency;

    if (agencyId) {
      try {
        const { data: updated, error } = await admin
          .from('agencies')
          .update(updatePayload)
          .eq('id', agencyId)
          .select('*')
          .single();

        if (!error && updated) {
          updatedRecord = updated;
        }
      } catch {
        // Offline fallback
      }
    }

    return NextResponse.json({ agency: updatedRecord });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
