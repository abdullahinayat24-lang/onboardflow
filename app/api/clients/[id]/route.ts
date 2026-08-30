import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { updateClientSchema } from '@/lib/validations/client';
import { localStore } from '@/lib/store';
import { Client } from '@/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    try {
      const { data: client, error } = await admin
        .from('clients')
        .select(`
          *,
          agency:agencies(*),
          questionnaire_template:questionnaire_templates(
            *,
            questions:questionnaire_questions(*)
          ),
          checklist_template:checklist_templates(
            *,
            items:checklist_template_items(*)
          ),
          brief:project_briefs(*),
          responses:questionnaire_responses(
            *,
            question:questionnaire_questions(*)
          ),
          checklist_status:client_checklist_status(
            *,
            item:checklist_template_items(*)
          ),
          uploads(*)
        `)
        .eq('id', id)
        .single();

      if (!error && client) {
        return NextResponse.json({ client });
      }
    } catch {
      // Fallback
    }

    // Local in-memory fallback
    const localClient = localStore.getClientWithDetails(id);
    if (localClient) {
      return NextResponse.json({ client: localClient });
    }

    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  } catch (err: unknown) {
    const { id } = await params;
    const localClient = localStore.getClientWithDetails(id);
    if (localClient) {
      return NextResponse.json({ client: localClient });
    }
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    const body = await request.json();
    const validated = updateClientSchema.parse(body);

    const existing = localStore.clients.get(id);
    if (existing) {
      const updated: Client = {
        ...existing,
        ...validated,
        service_category: (validated.service_category as any) || existing.service_category,
        updated_at: new Date().toISOString(),
      };
      localStore.clients.set(id, updated);
    }

    try {
      await admin
        .from('clients')
        .update({
          ...validated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch {
      // Offline
    }

    const fullClient = localStore.getClientWithDetails(id);
    return NextResponse.json({ client: fullClient });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    localStore.clients.delete(id);
    try {
      await admin.from('clients').delete().eq('id', id);
    } catch {
      // Offline
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
