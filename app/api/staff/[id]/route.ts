import { NextRequest, NextResponse } from 'next/server';
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
