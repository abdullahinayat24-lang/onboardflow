import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Sidebar } from '@/components/dashboard/sidebar';
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

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased">
      <Sidebar agency={agency} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
