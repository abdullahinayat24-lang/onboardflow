import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { submitOnboardingSchema } from '@/lib/validations/onboarding';
import { generateProjectBrief } from '@/lib/ai';
import { BriefGenerationContext } from '@/lib/ai/prompts';
import { sendCompletionNotification } from '@/lib/email/resend';
import { dispatchAgencyWebhooks } from '@/lib/notifications/webhook';
import { localStore } from '@/lib/store';
import { ProjectBrief } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const admin = createAdminClient();
    const body = await request.json();
    const validated = submitOnboardingSchema.parse(body);

    let client: any = localStore.getClientByToken(validated.token);

    try {
      const { data: dbClient } = await admin
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
        `)
        .eq('onboarding_token', validated.token)
        .single();
      if (dbClient) client = dbClient;
    } catch {
      // Offline fallback
    }

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Save final responses to localStore
    if (validated.responses) {
      const respMap = localStore.responses.get(client.id) || new Map<string, any>();
      Object.entries(validated.responses).forEach(([qId, val]) => {
        respMap.set(qId, val);
      });
      localStore.responses.set(client.id, respMap);
    }

    // Update client status to completed
    const completedAt = new Date().toISOString();
    const clientRecord = localStore.clients.get(client.id);
    if (clientRecord) {
      clientRecord.status = 'completed';
      clientRecord.completed_at = completedAt;
      clientRecord.last_activity_at = completedAt;
      if (body.platform_access) clientRecord.platform_access = body.platform_access;
      if (body.payment) clientRecord.payment = body.payment;
      localStore.clients.set(client.id, clientRecord);
    }

    // Prepare AI Context
    const fullClient: any = localStore.getClientWithDetails(client.id) || client;
    const questionAnswers = (fullClient.responses || []).map((r: any) => ({
      question: r.question?.label || 'Intake Question',
      answer: typeof r.answer === 'string' ? r.answer : JSON.stringify(r.answer_json || ''),
      required: !!r.question?.required,
    }));

    const uploadedFiles = (fullClient.uploads || []).map((u: any) => ({
      filename: u.filename,
      category: u.category,
    }));

    const completedChecklistItems = (fullClient.checklist_status || [])
      .filter((c: any) => c.is_completed)
      .map((c: any) => c.item?.label || 'Completed item');

    const briefContext: BriefGenerationContext = {
      agencyName: fullClient.agency?.name || localStore.agency.name,
      clientName: fullClient.name,
      clientCompany: fullClient.company,
      clientEmail: fullClient.email,
      questionAnswers,
      uploadedFiles,
      completedChecklistItems,
    };

    const aiOutput = await generateProjectBrief(briefContext);

    const savedBrief: ProjectBrief = {
      id: `brief_${fullClient.id}`,
      client_id: fullClient.id,
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

    localStore.briefs.set(fullClient.id, savedBrief);

    // Try persisting to Supabase if connected
    try {
      await admin
        .from('clients')
        .update({
          status: 'completed',
          completed_at: completedAt,
          last_activity_at: completedAt,
        })
        .eq('id', fullClient.id);

      await admin.from('project_briefs').upsert(savedBrief, { onConflict: 'client_id' });
    } catch {
      // Offline fallback
    }

    // Trigger Webhook & WhatsApp/Slack alerts
    const targetAgency = fullClient.agency || localStore.agency;
    dispatchAgencyWebhooks(
      targetAgency,
      fullClient,
      savedBrief,
      uploadedFiles.length
    ).catch((e) => console.warn('Webhook dispatch alert notice:', e));

    return NextResponse.json({ success: true, completed_at: completedAt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
