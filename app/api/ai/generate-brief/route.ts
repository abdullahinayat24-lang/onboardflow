import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateProjectBrief } from '@/lib/ai';
import { BriefGenerationContext } from '@/lib/ai/prompts';
import { localStore } from '@/lib/store';
import { ProjectBrief } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const admin = createAdminClient();
    const body = await request.json();
    const { clientId, token } = body;

    let targetClientId = clientId;
    if (!targetClientId && token) {
      const client = localStore.getClientByToken(token);
      if (client) targetClientId = client.id;
    }

    let client = targetClientId ? localStore.getClientWithDetails(targetClientId) : null;

    // Try Supabase
    try {
      let query = admin
        .from('clients')
        .select(`
          *,
          agency:agencies(*),
          responses:questionnaire_responses(
            *,
            question:questionnaire_questions(*)
          ),
          checklist_status:client_checklist_status(
            *,
            item:checklist_template_items(*)
          ),
          uploads(*)
        `);

      if (targetClientId) {
        query = query.eq('id', targetClientId);
      } else if (token) {
        query = query.eq('onboarding_token', token);
      }

      const { data: dbClient } = await query.single();
      if (dbClient) client = dbClient;
    } catch {
      // Offline
    }

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const questionAnswers = (client.responses || []).map((r: any) => ({
      question: r.question?.label || 'Intake Question',
      answer: typeof r.answer === 'string' ? r.answer : JSON.stringify(r.answer_json || ''),
      required: !!r.question?.required,
    }));

    const uploadedFiles = (client.uploads || []).map((u: any) => ({
      filename: u.filename,
      category: u.category,
    }));

    const completedChecklistItems = (client.checklist_status || [])
      .filter((c: any) => c.is_completed)
      .map((c: any) => c.item?.label || 'Completed item');

    const context: BriefGenerationContext = {
      agencyName: client.agency?.name || localStore.agency.name,
      clientName: client.name,
      clientCompany: client.company,
      clientEmail: client.email,
      questionAnswers,
      uploadedFiles,
      completedChecklistItems,
    };

    const aiOutput = await generateProjectBrief(context);

    const savedBrief: ProjectBrief = {
      id: `brief_${client.id}`,
      client_id: client.id,
      ai_summary: aiOutput.ai_summary,
      ai_brief: aiOutput.ai_brief,
      goals: aiOutput.goals,
      scope: aiOutput.scope,
      key_assets: aiOutput.key_assets,
      open_gaps: aiOutput.open_gaps,
      next_steps: aiOutput.next_steps,
      status: 'draft',
      generated_at: new Date().toISOString(),
      edited_at: new Date().toISOString(),
    };

    localStore.briefs.set(client.id, savedBrief);

    try {
      await admin
        .from('project_briefs')
        .upsert(savedBrief, { onConflict: 'client_id' });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ brief: savedBrief });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
