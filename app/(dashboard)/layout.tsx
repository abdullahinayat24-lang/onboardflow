import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Agency } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let agency: Agency | null = null;

  if (user) {
    const { data } = await supabase
      .from('agencies')
      .select('*')
      .eq('owner_user_id', user.id)
      .single();
    agency = data;
  }

  // Fallback demo agency if running without active user session
  if (!agency) {
    const { data: firstAgency } = await admin.from('agencies').select('*').limit(1).single();
    agency = firstAgency || {
      id: 'demo-agency',
      owner_user_id: 'demo-user',
      name: 'OnboardFlow Studio',
      slug: 'onboardflow-studio',
      logo_url: null,
      brand_color: '#3B82F6',
      website: 'https://onboardflow.com',
      support_email: 'hello@onboardflow.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
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
