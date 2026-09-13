import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();

    if (!q) {
      return NextResponse.json({
        results: { clients: [], staff: [], tasks: [], workflows: [], projects: [] },
        total: 0,
      });
    }

    const clients = Array.from(localStore.clients.values())
      .filter((c) => (c.name && c.name.toLowerCase().includes(q)) || (c.company && c.company.toLowerCase().includes(q)) || (c.email && c.email.toLowerCase().includes(q)))
      .map((c) => ({ id: c.id, title: c.company || c.name, subtitle: c.email, type: 'client', link: `/clients/${c.id}` }));

    const staff = Array.from(localStore.staff.values())
      .filter((s) => (s.name && s.name.toLowerCase().includes(q)) || (s.department && s.department.toLowerCase().includes(q)))
      .map((s) => ({ id: s.id, title: s.name, subtitle: `${s.role.toUpperCase()} • ${s.department}`, type: 'staff', link: '/staff' }));

    const tasks = Array.from(localStore.tasks.values())
      .filter((t) => (t.title && t.title.toLowerCase().includes(q)) || (t.description && t.description.toLowerCase().includes(q)) || (t.department && t.department.toLowerCase().includes(q)))
      .map((t) => ({ id: t.id, title: t.title, subtitle: `Status: ${t.status} • Priority: ${t.priority}`, type: 'task', link: '/tasks' }));

    const workflows = Array.from(localStore.workflows.values())
      .filter((w) => (w.name && w.name.toLowerCase().includes(q)) || (w.description && w.description.toLowerCase().includes(q)))
      .map((w) => ({ id: w.id, title: w.name, subtitle: `Stage ${w.current_stage_index || 1} of 5`, type: 'workflow', link: '/workflows' }));

    const projects = Array.from(localStore.projects.values())
      .filter((p) => (p.title && p.title.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q)))
      .map((p) => ({ id: p.id, title: p.title, subtitle: `Status: ${p.status}`, type: 'project', link: '/workflows' }));

    const total = clients.length + staff.length + tasks.length + workflows.length + projects.length;

    return NextResponse.json({
      results: { clients, staff, tasks, workflows, projects },
      total,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
