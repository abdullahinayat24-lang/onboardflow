import { NextRequest, NextResponse } from 'next/server';
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
      id: `staff_${Date.now()}`,
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
      id: `act_${Date.now()}`,
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
