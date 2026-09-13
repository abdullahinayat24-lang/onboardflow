const fs = require('fs');
const path = require('path');

function write(relPath, content) {
  const full = path.join(__dirname, '..', relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('Written:', relPath);
}

// 1. /api/staff
write('app/api/staff/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';
import { Staff } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');

    let staffList = localStore.getAllStaff();
    if (department && department !== 'all') {
      staffList = staffList.filter((s) => s.department.toLowerCase() === department.toLowerCase());
    }
    if (status && status !== 'all') {
      staffList = staffList.filter((s) => s.status.toLowerCase() === status.toLowerCase());
    }

    return NextResponse.json({ staff: staffList });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const newStaff: Staff = {
      id: \`staff_\${Date.now()}\`,
      agency_id: localStore.agency.id,
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      role: body.role || 'staff',
      department: body.department || 'SEO & Content',
      status: body.status || 'active',
      is_online: true,
      avatar_url: body.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      active_tasks_count: 0,
      completed_tasks_count: 0,
      overdue_tasks_count: 0,
      assigned_clients_count: 0,
      performance_score: 95,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStore.saveStaff(newStaff);

    try {
      const admin = createAdminClient();
      await admin.from('staff').insert(newStaff);
    } catch {
      // Offline fallback
    }

    localStore.logActivity({
      id: \`act_\${Date.now()}\`,
      agency_id: localStore.agency.id,
      actor_name: 'Agency Admin',
      action: 'staff_added',
      entity_type: 'staff',
      entity_id: newStaff.id,
      entity_title: newStaff.name,
      metadata: { department: newStaff.department, role: newStaff.role },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ staff: newStaff }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
`);

// 2. /api/staff/[id]
write('app/api/staff/[id]/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const staff = localStore.getStaffById(id);
    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const assignedTasks = localStore.getAllTasks({ assignedTo: id });
    const managedTasks = Array.from(localStore.tasks.values()).filter((t) => t.manager_id === id);
    const clients = Array.from(localStore.clients.values()).filter(
      (c) => c.manager_id === id || (c.assigned_staff_ids && c.assigned_staff_ids.includes(id))
    );
    const workLogs = localStore.getStaffWorkLogs().filter((w) => w.staff_id === id);

    return NextResponse.json({ staff, assignedTasks, managedTasks, clients, workLogs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = localStore.getStaffById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const updated = {
      ...existing,
      ...body,
      updated_at: new Date().toISOString(),
    };
    localStore.saveStaff(updated);

    try {
      const admin = createAdminClient();
      await admin.from('staff').update(body).eq('id', id);
    } catch {
      // Offline fallback
    }

    return NextResponse.json({ staff: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    localStore.deleteStaff(id);
    try {
      const admin = createAdminClient();
      await admin.from('staff').delete().eq('id', id);
    } catch {
      // Offline
    }
    return NextResponse.json({ success: true, message: 'Staff member removed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
`);

// 3. /api/tasks
write('app/api/tasks/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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

    const taskId = \`task_\${Date.now()}\`;
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
        id: item.id || \`chk_\${Date.now()}_\${idx}\`,
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
        id: \`notif_\${Date.now()}\`,
        agency_id: localStore.agency.id,
        recipient_id: newTask.assigned_to,
        title: 'New Task Assigned 📋',
        message: \`You were assigned task "\${newTask.title}"\`,
        type: 'task_assigned',
        link: '/tasks',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    localStore.logActivity({
      id: \`act_\${Date.now()}\`,
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
`);

// 4. /api/tasks/[id]
write('app/api/tasks/[id]/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';
import { Task, TaskComment } from '@/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const task = localStore.getTaskById(id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    const comments = localStore.taskComments.get(id) || [];
    return NextResponse.json({ task, comments });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = localStore.tasks.get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if adding a comment
    if (body.add_comment) {
      const comment: TaskComment = {
        id: \`com_\${Date.now()}\`,
        task_id: id,
        author_id: body.add_comment.author_id || 'staff_alex',
        author_name: body.add_comment.author_name || 'Team Member',
        content: body.add_comment.content,
        created_at: new Date().toISOString(),
      };
      localStore.addTaskComment(id, comment);
      return NextResponse.json({ success: true, comment });
    }

    const isCompleting = body.status === 'completed' && existing.status !== 'completed';
    const updated: Task = {
      ...existing,
      ...body,
      completed_at: isCompleting
        ? new Date().toISOString()
        : (body.status && body.status !== 'completed' ? null : existing.completed_at),
      updated_at: new Date().toISOString(),
    };
    localStore.saveTask(updated);

    try {
      const admin = createAdminClient();
      await admin.from('tasks').update(updated).eq('id', id);
    } catch {
      // Offline
    }

    if (isCompleting) {
      localStore.logActivity({
        id: \`act_\${Date.now()}\`,
        agency_id: existing.agency_id,
        actor_name: 'Staff Member',
        action: 'task_completed',
        entity_type: 'task',
        entity_id: id,
        entity_title: existing.title,
        metadata: { completed_at: updated.completed_at },
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ task: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    localStore.deleteTask(id);
    try {
      const admin = createAdminClient();
      await admin.from('tasks').delete().eq('id', id);
    } catch {
      // Offline
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
`);

// 5. /api/workflows
write('app/api/workflows/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');

    let workflows = localStore.getAllWorkflows();
    if (clientId) {
      workflows = workflows.filter((w) => w.client_id === clientId);
    }
    if (status && status !== 'all') {
      workflows = workflows.filter((w) => w.status === status);
    }

    return NextResponse.json({ workflows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
`);

// 6. /api/workflows/[id]
write('app/api/workflows/[id]/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
            id: \`act_\${Date.now()}\`,
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
              id: \`notif_\${Date.now()}\`,
              agency_id: workflow.agency_id,
              recipient_id: nextStage.responsible_staff_id,
              title: \`Workflow Stage Activated: \${nextStage.title}\`,
              message: \`You are assigned to \${nextStage.title} for \${workflow.name}.\`,
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
          id: \`act_\${Date.now()}\`,
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
`);

// 7. /api/projects
write('app/api/projects/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
      id: \`proj_\${Date.now()}\`,
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
`);

// 8. /api/reports
write('app/api/reports/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const reports = localStore.getPerformanceReports();
    const workLogs = localStore.getStaffWorkLogs();
    const tasks = localStore.getAllTasks();
    const staff = localStore.getAllStaff();

    const summary = {
      total_staff: staff.length,
      active_tasks: tasks.filter((t) => t.status !== 'completed').length,
      completed_tasks: tasks.filter((t) => t.status === 'completed').length,
      total_hours_logged: workLogs.reduce((acc, l) => acc + (l.hours_spent || 0), 0),
      average_performance_score: Math.round(
        reports.reduce((acc, r) => acc + (r.performance_score || 0), 0) / (reports.length || 1)
      ),
      department_breakdown: [
        { name: 'SEO & Content', count: staff.filter((s) => s.department === 'SEO & Content').length, active_tasks: tasks.filter((t) => t.department === 'SEO & Content' && t.status !== 'completed').length },
        { name: 'Engineering & Dev', count: staff.filter((s) => s.department === 'Engineering & Dev').length, active_tasks: tasks.filter((t) => t.department === 'Engineering & Dev' && t.status !== 'completed').length },
        { name: 'Design & Creative', count: staff.filter((s) => s.department === 'Design & Creative').length, active_tasks: tasks.filter((t) => t.department === 'Design & Creative' && t.status !== 'completed').length },
        { name: 'Paid Media & Ads', count: staff.filter((s) => s.department === 'Paid Media & Ads').length, active_tasks: tasks.filter((t) => t.department === 'Paid Media & Ads' && t.status !== 'completed').length },
        { name: 'Account Management', count: staff.filter((s) => s.department === 'Account Management').length, active_tasks: tasks.filter((t) => t.department === 'Account Management' && t.status !== 'completed').length },
      ],
    };

    return NextResponse.json({ reports, workLogs, summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
`);

// 9. /api/audit
write('app/api/audit/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
`);

// 10. /api/notifications
write('app/api/notifications/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { localStore } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const notifications = localStore.getAllNotifications();
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    return NextResponse.json({ notifications, unreadCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.all) {
      localStore.notifications.forEach((n) => {
        n.is_read = true;
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }
    if (body.id) {
      localStore.markNotificationAsRead(body.id);
      return NextResponse.json({ success: true, id: body.id });
    }
    return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
`);

// 11. /api/search
write('app/api/search/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
      .map((c) => ({ id: c.id, title: c.company || c.name, subtitle: c.email, type: 'client', link: \`/clients/\${c.id}\` }));

    const staff = Array.from(localStore.staff.values())
      .filter((s) => (s.name && s.name.toLowerCase().includes(q)) || (s.department && s.department.toLowerCase().includes(q)))
      .map((s) => ({ id: s.id, title: s.name, subtitle: \`\${s.role.toUpperCase()} • \${s.department}\`, type: 'staff', link: '/staff' }));

    const tasks = Array.from(localStore.tasks.values())
      .filter((t) => (t.title && t.title.toLowerCase().includes(q)) || (t.description && t.description.toLowerCase().includes(q)) || (t.department && t.department.toLowerCase().includes(q)))
      .map((t) => ({ id: t.id, title: t.title, subtitle: \`Status: \${t.status} • Priority: \${t.priority}\`, type: 'task', link: '/tasks' }));

    const workflows = Array.from(localStore.workflows.values())
      .filter((w) => (w.name && w.name.toLowerCase().includes(q)) || (w.description && w.description.toLowerCase().includes(q)))
      .map((w) => ({ id: w.id, title: w.name, subtitle: \`Stage \${w.current_stage_index || 1} of 5\`, type: 'workflow', link: '/workflows' }));

    const projects = Array.from(localStore.projects.values())
      .filter((p) => (p.title && p.title.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q)))
      .map((p) => ({ id: p.id, title: p.title, subtitle: \`Status: \${p.status}\`, type: 'project', link: '/workflows' }));

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
`);

console.log('All API routes regenerated with exact signatures!');

