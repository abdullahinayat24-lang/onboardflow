import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const staff = localStore.getStaffById(body.staff_id);
    const staffName = staff ? staff.name : (body.staff_name || 'Staff Member');

    const newLog = {
      id: `wl_${Date.now()}`,
      agency_id: body.agency_id || 'demo-agency-001',
      staff_id: body.staff_id || 'staff_alex',
      staff_name: staffName,
      task_id: body.task_id || null,
      task_title: body.task_title || 'General Agency Operations',
      date: body.date || new Date().toISOString().split('T')[0],
      hours_spent: Number(body.hours_spent) || 1.0,
      description: body.description || '',
      status: body.status || 'present',
      created_at: new Date().toISOString(),
    };

    localStore.addWorkLog(newLog);

    localStore.logActivity({
      id: `act_${Date.now()}`,
      agency_id: newLog.agency_id,
      actor_name: staffName,
      action: 'hours_logged',
      entity_type: 'staff',
      entity_id: newLog.staff_id,
      entity_title: `${newLog.hours_spent} hrs on ${newLog.task_title}`,
      metadata: { date: newLog.date, description: newLog.description },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, workLog: newLog }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
