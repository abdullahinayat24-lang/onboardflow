import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { localStore } from '@/lib/store';
import { Agency } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let agency: Agency | null = null;

  try {
    const supabase = await createClient();
    const admin = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('agencies')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();
      agency = data;
    }

    if (!agency) {
      const { data: firstAgency } = await admin.from('agencies').select('*').limit(1).single();
      agency = firstAgency;
    }
  } catch (err) {
    console.warn('Dashboard layout session fallback:', err);
  }

  if (!agency) {
    agency = localStore.agency;
  }

  return <DashboardShell agency={agency}>{children}</DashboardShell>;
}
