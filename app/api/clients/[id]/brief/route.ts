import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';
import { ProjectBrief } from '@/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: clientId } = await params;
    const admin = createAdminClient();
    const body = await request.json();

    const { ai_summary, ai_brief, status, goals, scope, key_assets, open_gaps, next_steps } = body;

    const briefRecord: ProjectBrief = {
      id: `brief_${clientId}`,
      client_id: clientId,
      ai_summary: ai_summary || null,
      ai_brief: ai_brief || null,
      status: status || 'draft',
      goals: goals || [],
      scope: scope || [],
      key_assets: key_assets || [],
      open_gaps: open_gaps || [],
      next_steps: next_steps || [],
      generated_at: new Date().toISOString(),
      edited_at: new Date().toISOString(),
    };

    localStore.briefs.set(clientId, briefRecord);

    try {
      await admin
        .from('project_briefs')
        .upsert(briefRecord, { onConflict: 'client_id' });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ brief: briefRecord });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
