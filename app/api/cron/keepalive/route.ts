import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const admin = createAdminClient();
    
    // Send a lightweight query to Supabase to keep the project active and reset the 7-day inactivity timer
    const { data: agency, error } = await admin
      .from('agencies')
      .select('id, name, updated_at')
      .limit(1)
      .single();

    if (error) {
      console.warn('Supabase keepalive ping notice:', error.message);
    }

    return NextResponse.json({
      status: 'active',
      timestamp: new Date().toISOString(),
      agency_connected: !!agency,
      agency_name: agency?.name || 'Local',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Keepalive error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
