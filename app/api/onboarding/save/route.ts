import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { saveResponsesSchema } from '@/lib/validations/onboarding';
import { localStore } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const admin = createAdminClient();
    const body = await request.json();
    const validated = saveResponsesSchema.parse(body);

    let client: any = localStore.getClientByToken(validated.token);

    try {
      const { data: dbClient } = await admin
        .from('clients')
        .select('id, status')
        .eq('onboarding_token', validated.token)
        .single();
      if (dbClient) client = dbClient;
    } catch {
      // Offline
    }

    if (!client) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    // Update in localStore
    const respMap = localStore.responses.get(client.id) || new Map<string, any>();
    Object.entries(validated.responses).forEach(([qId, val]) => {
      respMap.set(qId, val);
    });
    localStore.responses.set(client.id, respMap);

    const clientRecord = localStore.clients.get(client.id);
    if (clientRecord) {
      clientRecord.status = 'in_progress';
      clientRecord.last_activity_at = new Date().toISOString();
      localStore.clients.set(client.id, clientRecord);
    }

    // Try Supabase
    try {
      await admin
        .from('clients')
        .update({
          status: 'in_progress',
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', client.id);

      for (const [questionId, answerValue] of Object.entries(validated.responses)) {
        await admin.from('questionnaire_responses').upsert(
          {
            client_id: client.id,
            question_id: questionId,
            answer: typeof answerValue === 'string' ? answerValue : JSON.stringify(answerValue),
            answer_json: typeof answerValue !== 'string' ? (answerValue as any) : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'client_id,question_id' }
        );
      }
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
