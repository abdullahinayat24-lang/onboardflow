const fs = require('fs');

const content = `'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Mail,
  Phone,
  Shield,
  Loader2,
  ExternalLink,
  Plus,
  X,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Staff, StaffRole, Task, Client, StaffWorkLog } from '@/types';
import { CreateTaskModal } from '@/components/dashboard/create-task-modal';

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Add Staff Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartment, setNewDepartment] = useState('SEO & Content');
  const [newRole, setNewRole] = useState<StaffRole>('staff');
  const [adding, setAdding] = useState(false);

  // Staff Details Inspection Modal
  const [inspectedStaff, setInspectedStaff] = useState<Staff | null>(null);
  const [staffTasks, setStaffTasks] = useState<Task[]>([]);
  const [staffWorkLogs, setStaffWorkLogs] = useState<StaffWorkLog[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Assign Task Modal
  const [assignTaskStaffId, setAssignTaskStaffId] = useState<string | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (data.staff) {
        setStaffList(data.staff);
      }
    } catch (e) {
      console.error('Failed to fetch staff', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    setAdding(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          department: newDepartment,
          role: newRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStaffList([...staffList, data.staff]);
        setIsAddModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handleInspectStaff = async (staff: Staff) => {
    setInspectedStaff(staff);
    setLoadingDetails(true);
    try {
      const res = await fetch(\`/api/staff/\${staff.id}\`);
      const data = await res.json();
      if (data.assignedTasks) setStaffTasks(data.assignedTasks);
      if (data.workLogs) setStaffWorkLogs(data.workLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleStatus = async (staff: Staff) => {
    const nextStatus = staff.status === 'active' ? 'on_leave' : 'active';
    try {
      const res = await fetch(\`/api/staff/\${staff.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setStaffList(staffList.map((s) => (s.id === staff.id ? { ...s, status: nextStatus } : s)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const departments = [
    'all',
    'SEO & Content',
    'Engineering & Dev',
    'Design & Creative',
    'Paid Media & Ads',
    'Account Management',
    'Operations',
  ];

  const filteredStaff = staffList.filter((s) => {
    if (selectedDept !== 'all' && s.department.toLowerCase() !== selectedDept.toLowerCase()) return false;
    if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalActiveTasks = staffList.reduce((acc, s) => acc + (s.active_tasks_count || 0), 0);
  const totalCompletedTasks = staffList.reduce((acc, s) => acc + (s.completed_tasks_count || 0), 0);
  const avgScore = Math.round(
    staffList.reduce((acc, s) => acc + (s.performance_score || 95), 0) / (staffList.length || 1)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* KPI Workload Metrics Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-semibold">Team Members</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 mt-2">{staffList.length}</p>
          <span className="text-[11px] text-emerald-700 font-medium">
            {staffList.filter((s) => s.status === 'active').length} Active On Duty
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-semibold">Active Tasks</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 mt-2">{totalActiveTasks}</p>
          <span className="text-[11px] text-zinc-500">Across {departments.length - 1} Departments</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-semibold">Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 mt-2">{totalCompletedTasks}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Delivered Milestones</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-semibold">Avg Performance</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900 mt-2">{avgScore}%</p>
          <span className="text-[11px] text-purple-700 font-medium">Team Quality Rating</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={\`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer \${
                selectedDept === dept
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }\`}
            >
              {dept === 'all' ? 'All Departments' : dept}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 h-9 w-40 sm:w-56"
            />
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="h-9 px-3.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Staff</span>
          </Button>
        </div>
      </div>

      {/* Staff Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-zinc-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span>Loading staff & managers...</span>
        </div>
      ) : filteredStaff.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredStaff.map((staff) => {
            const score = staff.performance_score || 95;
            return (
              <div
                key={staff.id}
                className="bg-white rounded-2xl border border-zinc-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all p-5 flex flex-col justify-between space-y-4 group"
              >
                {/* Header info */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        {staff.avatar_url ? (
                          <img
                            src={staff.avatar_url}
                            alt={staff.name}
                            className="w-11 h-11 rounded-xl object-cover border border-zinc-200"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                            {staff.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span
                          className={\`w-3 h-3 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5 \${
                            staff.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'
                          }\`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-zinc-900 truncate group-hover:text-emerald-700 transition-colors">
                            {staff.name}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-500 truncate">{staff.email}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                      {staff.role}
                    </span>
                  </div>

                  {/* Department & Contact */}
                  <div className="mt-3.5 flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium text-[11px] border border-emerald-200/60">
                      {staff.department}
                    </span>
                    <span className="text-[11px] text-zinc-500">{staff.phone || 'Internal Team'}</span>
                  </div>

                  {/* Workload Indicator Pills */}
                  <div className="grid grid-cols-4 gap-1.5 mt-3.5 pt-3.5 border-t border-zinc-100 text-center">
                    <div className="p-2 rounded-lg bg-zinc-50">
                      <p className="text-[10px] text-zinc-500 uppercase font-semibold">Active</p>
                      <p className="text-sm font-bold text-zinc-900 mt-0.5">{staff.active_tasks_count || 0}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-50">
                      <p className="text-[10px] text-zinc-500 uppercase font-semibold">Done</p>
                      <p className="text-sm font-bold text-emerald-700 mt-0.5">{staff.completed_tasks_count || 0}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-50">
                      <p className="text-[10px] text-zinc-500 uppercase font-semibold">Overdue</p>
                      <p className={\`text-sm font-bold mt-0.5 \${(staff.overdue_tasks_count || 0) > 0 ? 'text-rose-600 font-extrabold' : 'text-zinc-900'}\`}>
                        {staff.overdue_tasks_count || 0}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-50">
                      <p className="text-[10px] text-zinc-500 uppercase font-semibold">Clients</p>
                      <p className="text-sm font-bold text-zinc-900 mt-0.5">{staff.assigned_clients_count || 0}</p>
                    </div>
                  </div>

                  {/* Performance Score Bar */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Quality Score</span>
                      <span className="font-bold text-zinc-800">{score}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: \`\${score}%\` }} />
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInspectStaff(staff)}
                    className="flex-1 h-8 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                  >
                    View Work &amp; Logs
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAssignTaskStaffId(staff.id)}
                    className="h-8 px-2.5 text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                    title="Assign new task to this staff member"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Assign
                  </Button>

                  <button
                    onClick={() => handleToggleStatus(staff)}
                    className={\`h-8 px-2.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer border \${
                      staff.status === 'active'
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    }\`}
                    title="Toggle active / on leave"
                  >
                    {staff.status === 'active' ? 'Active' : 'On Leave'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-xs text-zinc-500">
          No team members match your selected filter.
        </div>
      )}

      {/* Add Staff Modal */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Team Member / Manager"
        description="Provision agency operator or manager credentials"
        maxWidth="md"
      >
        <form onSubmit={handleAddStaff} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              required
              placeholder="e.g. Jordan Miller"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                required
                placeholder="jordan@agency.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Phone Number</label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Department</label>
              <select
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="SEO & Content">SEO & Content</option>
                <option value="Engineering & Dev">Engineering & Dev</option>
                <option value="Design & Creative">Design & Creative</option>
                <option value="Paid Media & Ads">Paid Media & Ads</option>
                <option value="Account Management">Account Management</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Access Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as StaffRole)}
                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="staff">Staff Operator</option>
                <option value="manager">Account Manager</option>
                <option value="admin">Administrator</option>
                <option value="owner">Agency Owner</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={adding} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              Create Member
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Staff Details & Work Inspection Modal */}
      <Dialog
        isOpen={!!inspectedStaff}
        onClose={() => setInspectedStaff(null)}
        title={inspectedStaff?.name || 'Staff Profile'}
        description={\`\${inspectedStaff?.role.toUpperCase()} • \${inspectedStaff?.department} Department\`}
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2">
          {loadingDetails ? (
            <div className="py-12 text-center text-xs text-zinc-400">Loading work history...</div>
          ) : (
            <>
              {/* Assigned Tasks Section */}
              <div>
                <h4 className="text-xs font-bold text-zinc-900 mb-2 flex items-center justify-between">
                  <span>Assigned Deliverables ({staffTasks.length})</span>
                  <span className="text-[11px] text-zinc-500 font-normal">
                    {staffTasks.filter((t) => t.status === 'completed').length} completed
                  </span>
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {staffTasks.length > 0 ? (
                    staffTasks.map((t) => (
                      <div key={t.id} className="p-2.5 rounded-xl border border-zinc-200 bg-white flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckSquare className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate font-medium text-zinc-900">{t.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-[10px] font-bold capitalize text-zinc-600 shrink-0">
                          {t.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-zinc-200 text-center text-xs text-zinc-400">
                      No active tasks currently assigned.
                    </div>
                  )}
                </div>
              </div>

              {/* Work Logs Section */}
              <div className="pt-2 border-t border-zinc-100">
                <h4 className="text-xs font-bold text-zinc-900 mb-2">
                  Recent Work &amp; Hours Log ({staffWorkLogs.length})
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {staffWorkLogs.length > 0 ? (
                    staffWorkLogs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-zinc-900">{log.task_title || log.description}</p>
                          <p className="text-[11px] text-zinc-500">{log.date} • Status: <span className="capitalize">{log.status}</span></p>
                        </div>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          {log.hours_spent} hrs
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-zinc-200 text-center text-xs text-zinc-400">
                      No work hours logged yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Dialog>

      {/* Assign Task Global Dialog */}
      <CreateTaskModal
        isOpen={!!assignTaskStaffId}
        onClose={() => setAssignTaskStaffId(null)}
        onTaskCreated={() => {
          fetchStaff();
        }}
      />
    </div>
  );
}
`;

fs.writeFileSync('app/(dashboard)/staff/page.tsx', content, 'utf8');
console.log('Written: app/(dashboard)/staff/page.tsx');
