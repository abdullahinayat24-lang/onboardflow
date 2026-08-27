import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { updateReminderSettingsSchema } from '@/lib/validations/agency';

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

    if (!agencyId) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = updateReminderSettingsSchema.parse(body);

    const { data: updated, error } = await admin
      .from('reminder_settings')
      .upsert(
        {
          agency_id: agencyId,
          days_before_reminder: validated.days_before_reminder,
          max_reminders: validated.max_reminders,
          enabled: validated.enabled,
          custom_message: validated.custom_message || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'agency_id' }
      )
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ settings: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
