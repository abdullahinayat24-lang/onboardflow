import React from 'react';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import { localStore } from '@/lib/store';
import {
  Agency,
  Client,
  QuestionnaireQuestion,
  ChecklistTemplateItem,
  Upload,
} from '@/types';

interface OnboardingPageProps {
  params: Promise<{ token: string }>;
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { token } = await params;
  const supabase = createAdminClient();

  let client: any = null;

  try {
    const { data: dbClient } = await supabase
      .from('clients')
      .select(`
        *,
        agency:agencies(*)
      `)
      .eq('onboarding_token', token)
      .single();
    if (dbClient) client = dbClient;
  } catch {
    // Offline
  }

  if (!client) {
    client = localStore.getClientByToken(token);
  }

  if (!client) {
    if (token.startsWith('ob_demo') || token.startsWith('ob_')) {
      return renderDemoOnboarding(token);
    }
    return notFound();
  }

  const agency: Agency = client.agency || localStore.agency;

  // Fetch Questions
  let questions: QuestionnaireQuestion[] = [];
  try {
    if (client.questionnaire_template_id) {
      const { data: qData } = await supabase
        .from('questionnaire_questions')
        .select('*')
        .eq('template_id', client.questionnaire_template_id)
        .order('order_index', { ascending: true });
      if (qData && qData.length > 0) questions = qData;
    }
  } catch {
    // Offline
  }
  if (questions.length === 0) {
    questions = localStore.getTemplate(client.questionnaire_template_id).questions || [];
  }

  // Fetch Checklist Items
  let checklistItems: ChecklistTemplateItem[] = [];
  try {
    if (client.checklist_template_id) {
      const { data: cData } = await supabase
        .from('checklist_template_items')
        .select('*')
        .eq('template_id', client.checklist_template_id)
        .order('order_index', { ascending: true });
      if (cData && cData.length > 0) checklistItems = cData;
    }
  } catch {
    // Offline
  }
  if (checklistItems.length === 0) {
    checklistItems = localStore.checklistItems;
  }

  // Fetch Existing Responses
  const initialResponses: Record<string, any> = {};
  const localRespMap = localStore.responses.get(client.id);
  if (localRespMap) {
    localRespMap.forEach((val, key) => {
      initialResponses[key] = val;
    });
  }

  try {
    const { data: responsesData } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('client_id', client.id);

    if (responsesData) {
      responsesData.forEach((r: any) => {
        initialResponses[r.question_id] = r.answer_json || r.answer || '';
      });
    }
  } catch {
    // Offline
  }

  // Fetch Uploads
  let uploads: Upload[] = localStore.uploads.get(client.id) || [];
  try {
    const { data: uploadsData } = await supabase
      .from('uploads')
      .select('*')
      .eq('client_id', client.id);
    if (uploadsData && uploadsData.length > 0) uploads = uploadsData;
  } catch {
    // Offline
  }

  return (
    <OnboardingWizard
      token={token}
      agency={agency}
      client={client}
      questions={questions}
      checklistItems={checklistItems}
      initialResponses={initialResponses}
      initialUploads={uploads}
      isInitiallyCompleted={client.status === 'completed'}
    />
  );
}

function renderDemoOnboarding(token: string) {
  return (
    <OnboardingWizard
      token={token}
      agency={localStore.agency}
      client={{
        id: 'demo_client_preview',
        agency_id: localStore.agency.id,
        name: 'Alex Mercer',
        email: 'alex@acme.inc',
        company: 'Acme Technologies',
        status: 'in_progress',
        onboarding_token: token,
        package_share_token: 'pkg_demo_123',
        questionnaire_template_id: 'demo-q-001',
        checklist_template_id: 'demo-c-001',
        last_activity_at: new Date().toISOString(),
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }}
      questions={localStore.templates[0].questions || []}
      checklistItems={localStore.checklistItems}
      initialResponses={{}}
      initialUploads={[]}
      isInitiallyCompleted={false}
    />
  );
}
