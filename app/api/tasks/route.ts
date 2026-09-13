import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';
import { Task } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assigned_to = searchParams.get('assigned_to') || undefined;
    const client_id = searchParams.get('client_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;

    const tasks = localStore.getAllTasks({ assignedTo: assigned_to, clientId: client_id, status, priority });
    return NextResponse.json({ tasks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const taskId = `task_${Date.now()}`;
    const newTask: Task = {
      id: taskId,
      agency_id: localStore.agency.id,
      client_id: body.client_id || null,
      project_id: body.project_id || null,
      workflow_stage_id: body.workflow_stage_id || null,
      title: body.title,
      description: body.description || '',
      assigned_to: body.assigned_to || null,
      manager_id: body.manager_id || null,
      department: body.department || 'Operations',
      priority: body.priority || 'medium',
      status: body.status || 'open',
      due_date: body.due_date || new Date(Date.now() + 7 * 86400000).toISOString(),
      completed_at: null,
      tags: body.tags || [],
      checklist: (body.checklist || []).map((item: any, idx: number) => ({
        id: item.id || `chk_${Date.now()}_${idx}`,
        text: typeof item === 'string' ? item : item.text,
        completed: typeof item === 'object' ? !!item.completed : false,
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStore.saveTask(newTask);

    try {
      const admin = createAdminClient();
      await admin.from('tasks').insert(newTask);
    } catch {
      // Offline
    }

    if (newTask.assigned_to) {
      localStore.addNotification({
        id: `notif_${Date.now()}`,
        agency_id: localStore.agency.id,
        recipient_id: newTask.assigned_to,
        title: 'New Task Assigned 📋',
        message: `You were assigned task "${newTask.title}"`,
        type: 'task_assigned',
        link: '/tasks',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    localStore.logActivity({
      id: `act_${Date.now()}`,
      agency_id: localStore.agency.id,
      actor_name: 'Agency Admin',
      action: 'task_created',
      entity_type: 'task',
      entity_id: newTask.id,
      entity_title: newTask.title,
      metadata: { priority: newTask.priority, department: newTask.department, assigned_to: newTask.assigned_to },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
