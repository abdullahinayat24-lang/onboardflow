import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: templateId } = await params;
    const admin = createAdminClient();
    const body = await request.json();

    const { title, items } = body;

    // 1. Update checklist template
    const { data: updatedTemplate, error: tErr } = await admin
      .from('checklist_templates')
      .update({
        title,
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateId)
      .select('*')
      .single();

    if (tErr) throw tErr;

    // 2. Update checklist template items
    if (Array.isArray(items)) {
      await admin
        .from('checklist_template_items')
        .delete()
        .eq('template_id', templateId);

      const itemsToInsert = items.map((it: any, idx: number) => ({
        template_id: templateId,
        label: it.label,
        description: it.description || null,
        category: it.category || 'general',
        required: !!it.required,
        order_index: idx + 1,
      }));

      if (itemsToInsert.length > 0) {
        await admin.from('checklist_template_items').insert(itemsToInsert);
      }
    }

    const { data: fullTemplate } = await admin
      .from('checklist_templates')
      .select('*, items:checklist_template_items(*)')
      .eq('id', templateId)
      .single();

    return NextResponse.json({ template: fullTemplate || updatedTemplate });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
