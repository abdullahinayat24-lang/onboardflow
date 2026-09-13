import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';
import { Project } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const projects = localStore.getAllProjects();
    const enriched = projects.map((p) => {
      const client = p.client_id ? localStore.clients.get(p.client_id) : null;
      const manager = p.manager_id ? localStore.getStaffById(p.manager_id) : null;
      const workflow = Array.from(localStore.workflows.values()).find((w) => w.project_id === p.id);
      const tasks = localStore.getAllTasks({ clientId: p.client_id || undefined });
      return {
        ...p,
        client,
        manager,
        workflow,
        task_count: tasks.length,
        completed_task_count: tasks.filter((t) => t.status === 'completed').length,
      };
    });
    return NextResponse.json({ projects: enriched });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      agency_id: localStore.agency.id,
      client_id: body.client_id,
      title: body.title,
      description: body.description || '',
      status: body.status || 'active',
      priority: body.priority || 'medium',
      manager_id: body.manager_id || null,
      start_date: body.start_date || new Date().toISOString().split('T')[0],
      due_date: body.due_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStore.saveProject(newProject);
    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
