import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const workflow = localStore.getWorkflowById(id);
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    const client = workflow.client_id ? localStore.clients.get(workflow.client_id) : null;
    return NextResponse.json({ workflow, client });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const workflow = localStore.workflows.get(id);
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Action: Advance to next stage or update stage status
    if (body.action === 'advance_stage') {
      const currentIdx = workflow.current_stage_index || 1;
      const stageIdx = currentIdx - 1;

      if (stageIdx >= 0 && stageIdx < workflow.stages.length) {
        workflow.stages[stageIdx].status = 'completed';
        workflow.stages[stageIdx].completed_at = new Date().toISOString();
        if (body.notes) {
          workflow.stages[stageIdx].notes = body.notes;
        }
      }

      if (currentIdx < workflow.stages.length) {
        workflow.current_stage_index = currentIdx + 1;
        const nextStage = workflow.stages[workflow.current_stage_index - 1];
        if (nextStage) {
          nextStage.status = 'current';

          localStore.logActivity({
            id: `act_${Date.now()}`,
            agency_id: workflow.agency_id,
            actor_name: 'Workflow Engine',
            action: 'workflow_stage_advanced',
            entity_type: 'workflow',
            entity_id: workflow.id,
            entity_title: workflow.name,
            metadata: { new_stage: nextStage.title, stage_index: workflow.current_stage_index },
            created_at: new Date().toISOString(),
          });

          if (nextStage.responsible_staff_id) {
            localStore.addNotification({
              id: `notif_${Date.now()}`,
              agency_id: workflow.agency_id,
              recipient_id: nextStage.responsible_staff_id,
              title: `Workflow Stage Activated: ${nextStage.title}`,
              message: `You are assigned to ${nextStage.title} for ${workflow.name}.`,
              type: 'workflow_advanced',
              link: '/workflows',
              is_read: false,
              created_at: new Date().toISOString(),
            });
          }
        }
      } else {
        workflow.status = 'completed';
        localStore.logActivity({
          id: `act_${Date.now()}`,
          agency_id: workflow.agency_id,
          actor_name: 'Workflow Engine',
          action: 'workflow_completed',
          entity_type: 'workflow',
          entity_id: workflow.id,
          entity_title: workflow.name,
          metadata: { completed_at: new Date().toISOString() },
          created_at: new Date().toISOString(),
        });
      }

      workflow.updated_at = new Date().toISOString();
      localStore.saveWorkflow(workflow);

      return NextResponse.json({ workflow, message: 'Workflow advanced successfully' });
    }

    // Direct update
    const updated = {
      ...workflow,
      ...body,
      updated_at: new Date().toISOString(),
    };
    localStore.saveWorkflow(updated);
    return NextResponse.json({ workflow: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
