import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    let logs = localStore.getActivityLogs(limit);
    if (clientId) {
      logs = logs.filter((l) => l.entity_id === clientId || (l.metadata && l.metadata.client_id === clientId));
    }

    return NextResponse.json({ activities: logs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
