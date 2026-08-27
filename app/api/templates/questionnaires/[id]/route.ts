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

    const { title, description, questions } = body;

    // 1. Update template
    const { data: updatedTemplate, error: tErr } = await admin
      .from('questionnaire_templates')
      .update({
        title,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateId)
      .select('*')
      .single();

    if (tErr) throw tErr;

    // 2. Update questions (delete existing and insert new order)
    if (Array.isArray(questions)) {
      await admin
        .from('questionnaire_questions')
        .delete()
        .eq('template_id', templateId);

      const questionsToInsert = questions.map((q: any, idx: number) => ({
        template_id: templateId,
        label: q.label,
        description: q.description || null,
        placeholder: q.placeholder || null,
        type: q.type,
        options: q.options || [],
        required: !!q.required,
        order_index: idx + 1,
      }));

      if (questionsToInsert.length > 0) {
        await admin.from('questionnaire_questions').insert(questionsToInsert);
      }
    }

    const { data: fullTemplate } = await admin
      .from('questionnaire_templates')
      .select('*, questions:questionnaire_questions(*)')
      .eq('id', templateId)
      .single();

    return NextResponse.json({ template: fullTemplate || updatedTemplate });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
