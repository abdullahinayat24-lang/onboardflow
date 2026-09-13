import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');

    let workflows = localStore.getAllWorkflows();
    if (clientId) {
      workflows = workflows.filter((w) => w.client_id === clientId);
    }
    if (status && status !== 'all') {
      workflows = workflows.filter((w) => w.status === status);
    }

    return NextResponse.json({ workflows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
