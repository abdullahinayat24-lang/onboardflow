'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  User,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  Send,
  Loader2,
  Building2,
  ExternalLink,
  History,
  Timer,
  CheckSquare,
  Sparkles,
  TrendingUp,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CreateTaskModal } from '@/components/dashboard/create-task-modal';
import { Task, Staff, StaffWorkLog, Client, TaskStatus, TaskPriority, TaskComment, ActivityLog } from '@/types';

export default function MyWorkPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [workLogs, setWorkLogs] = useState<StaffWorkLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Operator filter
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'deliverables' | 'monthly_hub' | 'clients' | 'audit'>('deliverables');

  // Deliverables sub-filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Monthly Hub filters
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Modals
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isLogHoursOpen, setIsLogHoursOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskComments, setTaskComments] = useState<TaskComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Log Hours Form state
  const [logForm, setLogForm] = useState({
    staff_id: 'staff_alex',
    task_id: '',
    task_title: '',
    hours_spent: '2.5',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    description: '',
  });
  const [loggingHours, setLoggingHours] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resTasks, resStaff, resClients, resReports, resAudit] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/staff'),
        fetch('/api/clients'),
        fetch('/api/reports'),
        fetch('/api/audit'),
      ]);

      const dataTasks = await resTasks.json();
      const dataStaff = await resStaff.json();
      const dataClients = await resClients.json();
      const dataReports = await resReports.json();
      const dataAudit = await resAudit.json();

      if (Array.isArray(dataTasks)) setTasks(dataTasks);
      if (Array.isArray(dataStaff)) {
        setStaffList(dataStaff);
      }
      if (Array.isArray(dataClients)) setClients(dataClients);
      if (dataReports && Array.isArray(dataReports.workLogs)) setWorkLogs(dataReports.workLogs);
      if (Array.isArray(dataAudit)) setAuditLogs(dataAudit);
    } catch (err) {
      console.error('Failed to load my-work data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on selected operator & status
  const filteredTasks = tasks.filter((t) => {
    if (selectedStaffId !== 'all' && t.assigned_to !== selectedStaffId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchClient = t.client?.company?.toLowerCase().includes(q) || t.client?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchClient) return false;
    }

    if (statusFilter === 'overdue') {
      if (t.status === 'completed' || !t.due_date) return false;
      return new Date(t.due_date).getTime() < Date.now();
    }
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  // Filter work logs for monthly hub
  const filteredWorkLogs = workLogs.filter((w) => {
    if (selectedStaffId !== 'all' && w.staff_id !== selectedStaffId) return false;
    if (selectedMonth && !w.date.startsWith(selectedMonth)) return false;
    if (selectedDepartment !== 'all') {
      const staffMember = staffList.find((s) => s.id === w.staff_id);
      if (staffMember && staffMember.department !== selectedDepartment) return false;
    }
    return true;
  });

  // Assigned Clients for selected operator
  const assignedClients = clients.filter((c) => {
    if (c.is_archived) return false;
    if (selectedStaffId === 'all') return true;
    return c.manager_id === selectedStaffId || (c.assigned_staff_ids || []).includes(selectedStaffId);
  });

  // Operator summary counts
  const operatorTasks = selectedStaffId === 'all' ? tasks : tasks.filter((t) => t.assigned_to === selectedStaffId);
  const todayStr = new Date().toISOString().split('T')[0];
  const dueTodayCount = operatorTasks.filter((t) => t.status !== 'completed' && t.due_date && t.due_date.startsWith(todayStr)).length;
  const overdueCount = operatorTasks.filter((t) => t.status !== 'completed' && t.due_date && new Date(t.due_date).getTime() < Date.now()).length;
  const inProgressCount = operatorTasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = operatorTasks.filter((t) => t.status === 'completed').length;
  const operatorHours = workLogs
    .filter((w) => (selectedStaffId === 'all' ? true : w.staff_id === selectedStaffId))
    .reduce((acc, curr) => acc + (Number(curr.hours_spent) || 0), 0);

  // Status toggle handler
  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: newStatus,
                  completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
                }
              : t
          )
        );
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
                }
              : null
          );
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Checklist item toggle
  const handleToggleChecklist = async (taskId: string, checklistId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.checklist) return;

    const updatedChecklist = task.checklist.map((c) =>
      c.id === checklistId ? { ...c, completed: !c.completed } : c
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: updatedChecklist }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, checklist: updatedChecklist } : t))
        );
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask((prev) => (prev ? { ...prev, checklist: updatedChecklist } : null));
        }
      }
    } catch (err) {
      console.error('Failed to toggle checklist:', err);
    }
  };

  // Open Task modal and load comments
  const handleOpenTask = async (task: Task) => {
    setSelectedTask(task);
    try {
      const res = await fetch(`/api/tasks/${task.id}`);
      if (res.ok) {
        const fullTask = await res.json();
        setTaskComments(fullTask.comments || []);
      }
    } catch {
      setTaskComments([]);
    }
  };

  // Add comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      const author = staffList.find((s) => s.id === selectedStaffId) || staffList[0] || { id: 'staff_alex', name: 'Alex Rivera' };
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_id: author.id,
          author_name: author.name,
          content: newCommentText.trim(),
        }),
      });
      if (res.ok) {
        const newComm = await res.json();
        setTaskComments((prev) => [...prev, newComm]);
        setNewCommentText('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Submit Log Hours
  const handleLogHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.staff_id || !logForm.hours_spent) return;

    setLoggingHours(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logForm),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.workLog) {
          setWorkLogs((prev) => [data.workLog, ...prev]);
        }
        setIsLogHoursOpen(false);
        // Reset form
        setLogForm({
          staff_id: selectedStaffId !== 'all' ? selectedStaffId : 'staff_alex',
          task_id: '',
          task_title: '',
          hours_spent: '2.5',
          date: new Date().toISOString().split('T')[0],
          status: 'present',
          description: '',
        });
      }
    } catch (err) {
      console.error('Failed to log hours:', err);
    } finally {
      setLoggingHours(false);
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-rose-500 text-white font-bold text-[10px]">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-amber-500 text-white font-bold text-[10px]">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-500 text-white font-bold text-[10px]">Medium</Badge>;
      case 'low':
        return <Badge className="bg-zinc-400 text-white font-bold text-[10px]">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Operator Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Briefcase className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Operator Control Center &amp; My Work
            </h1>
          </div>
          <p className="text-xs text-zinc-500">
            Real-time execution dashboard for deliverables, monthly client work logs, and team productivity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Operator Selector */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5">
            <User className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-600">Active Operator:</span>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold text-zinc-900 focus:outline-none cursor-pointer"
            >
              <option value="all">Agency Roster (All Staff)</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.department}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => setIsLogHoursOpen(true)}
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 text-xs font-semibold border-emerald-600 text-emerald-700 hover:bg-emerald-50"
          >
            <Timer className="w-3.5 h-3.5 text-emerald-600" />
            Log Work Hours
          </Button>

          <Button
            onClick={() => setIsCreateTaskOpen(true)}
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Task
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">Due Today</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{dueTodayCount}</p>
          <span className="text-[11px] text-zinc-400 font-medium">Immediate priority</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">Overdue Items</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600">{overdueCount}</p>
          <span className="text-[11px] text-rose-500 font-medium">Requires escalation</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">In Progress</span>
            <RefreshCw className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
          <span className="text-[11px] text-zinc-400 font-medium">Active work</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Delivered</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">Hours Logged</span>
            <Timer className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-700">{operatorHours.toFixed(1)}h</p>
          <span className="text-[11px] text-zinc-400 font-medium">This month</span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-1">
        <button
          onClick={() => setActiveTab('deliverables')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'deliverables'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Deliverables &amp; Action Items ({filteredTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('monthly_hub')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'monthly_hub'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Monthly Work Control Hub
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'clients'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Assigned Clients ({assignedClients.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'audit'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Live Work Audit
        </button>
      </div>

      {/* Tab 1: Operator Deliverables */}
      {activeTab === 'deliverables' && (
        <div className="space-y-4">
          {/* Sub Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {(['all', 'open', 'in_progress', 'completed', 'overdue'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize shrink-0 transition-colors ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {st === 'in_progress' ? 'In Progress' : st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search deliverables & clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>
          </div>

          {/* Deliverables List / Cards */}
          {loading ? (
            <div className="p-12 text-center text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              <p className="text-xs">Loading operator deliverables...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-bold text-zinc-800">No deliverables found</p>
              <p className="text-xs text-zinc-500 mt-1">
                You are all caught up or no tasks match your active filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredTasks.map((task) => {
                const isOverdue =
                  task.status !== 'completed' && task.due_date && new Date(task.due_date).getTime() < Date.now();
                const totalChecklist = task.checklist ? task.checklist.length : 0;
                const completedChecklist = task.checklist ? task.checklist.filter((c) => c.completed).length : 0;

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          {getPriorityBadge(task.priority)}
                          {isOverdue && (
                            <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px] font-bold">
                              Overdue
                            </Badge>
                          )}
                        </div>

                        {/* Status Select */}
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                          className="text-[11px] font-bold rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-700"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="blocked">Review / Blocked</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <h3
                        onClick={() => handleOpenTask(task)}
                        className="text-sm font-bold text-zinc-900 line-clamp-2 hover:text-emerald-600 cursor-pointer transition-colors"
                      >
                        {task.title}
                      </h3>

                      <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                        {task.description || 'No detailed scope provided.'}
                      </p>

                      {/* Client info */}
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-100">
                        <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="font-semibold truncate">
                          {task.client?.company || task.client?.name || 'Internal Agency Task'}
                        </span>
                      </div>

                      {/* Sub-checklists */}
                      {totalChecklist > 0 && (
                        <div className="mt-3 space-y-1.5 pt-2 border-t border-zinc-100">
                          <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                            <span>Checklist Progress</span>
                            <span className="font-bold">{completedChecklist}/{totalChecklist}</span>
                          </div>
                          {task.checklist!.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleToggleChecklist(task.id, item.id)}
                              className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer hover:text-zinc-900"
                            >
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => {}}
                                className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span className={item.completed ? 'line-through text-zinc-400' : ''}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{task.due_date ? task.due_date.split('T')[0] : 'No due date'}</span>
                      </div>

                      <Button
                        onClick={() => handleOpenTask(task)}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 gap-1 px-2"
                      >
                        Details &amp; Chat
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Monthly Work Control Hub */}
      {activeTab === 'monthly_hub' && (
        <div className="space-y-4">
          {/* Monthly Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-zinc-700">Reporting Month:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-900"
                >
                  <option value="2026-09">September 2026</option>
                  <option value="2026-10">October 2026</option>
                  <option value="2026-11">November 2026</option>
                  <option value="2026-08">August 2026</option>
                </select>
              </div>

              {/* Department filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500">Department:</span>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-900"
                >
                  <option value="all">All Departments</option>
                  <option value="SEO & Content">SEO & Content</option>
                  <option value="Engineering & Dev">Engineering & Dev</option>
                  <option value="Design & Creative">Design & Creative</option>
                  <option value="Paid Media & Ads">Paid Media & Ads</option>
                  <option value="Account Management">Account Management</option>
                </select>
              </div>
            </div>

            <Button
              onClick={() => setIsLogHoursOpen(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 gap-1.5 shadow-xs"
            >
              <Timer className="w-3.5 h-3.5" />
              + Add Monthly Work Log
            </Button>
          </div>

          {/* Work Breakdown Table */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Work Logs &amp; Hours Breakdown</h3>
                <p className="text-xs text-zinc-500">
                  Track individual staff time entries, deliverables produced, and attendance status.
                </p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-0 font-bold text-xs">
                {filteredWorkLogs.length} Entries Recorded
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200">
                  <tr>
                    <th className="p-3.5">Staff Member</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Deliverable / Task</th>
                    <th className="p-3.5">Operational Scope</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Hours Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {filteredWorkLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-400">
                        No work log entries found for the selected month/department.
                      </td>
                    </tr>
                  ) : (
                    filteredWorkLogs.map((log) => {
                      const staffObj = staffList.find((s) => s.id === log.staff_id);
                      return (
                        <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-3.5 font-bold text-zinc-900">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                                {(log.staff_name || 'Staff').charAt(0)}
                              </div>
                              <div>
                                <span>{log.staff_name || 'Staff Member'}</span>
                                {staffObj && (
                                  <p className="text-[10px] text-zinc-400 font-normal">
                                    {staffObj.department}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-zinc-600 font-medium whitespace-nowrap">
                            {log.date}
                          </td>
                          <td className="p-3.5 font-semibold text-zinc-800 max-w-xs truncate">
                            {log.task_title || 'Direct Agency Deliverable'}
                          </td>
                          <td className="p-3.5 text-zinc-500 max-w-xs truncate">
                            {log.description || 'Deliverables finalized and checked.'}
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                log.status === 'present'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-bold text-zinc-900">
                            {Number(log.hours_spent).toFixed(1)}h
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-zinc-50 border-t border-zinc-200 font-bold text-xs text-zinc-900">
                  <tr>
                    <td colSpan={5} className="p-3.5 text-right">
                      Total Hours Logged:
                    </td>
                    <td className="p-3.5 text-right text-emerald-700 text-sm font-extrabold">
                      {filteredWorkLogs
                        .reduce((acc, curr) => acc + (Number(curr.hours_spent) || 0), 0)
                        .toFixed(1)}h
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Assigned Clients */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedClients.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {c.service_category?.replace('_', ' ') || 'Retainer'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.project_status === 'ready_for_project' ? 'Ready for Project' : c.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900">{c.company || c.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">Lead Contact: {c.name} ({c.email})</p>

                  <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Account Manager:</span>
                      <span className="font-semibold text-zinc-800">
                        {staffList.find((s) => s.id === c.manager_id)?.name || 'Sarah Chen'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Onboarding Status:</span>
                      <span className="font-semibold text-emerald-700 capitalize">{c.status}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <Link href={`/clients/${c.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1">
                      View Client Portal
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>

                  <Link href={`/workflows`}>
                    <Button size="sm" className="h-8 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800">
                      Workflow Pipeline
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Live Work Audit Stream */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-zinc-900">Agency Operational Audit Trail</h3>
            <p className="text-xs text-zinc-500">
              Complete chronological record of all team task changes, workflow handoffs, and client actions.
            </p>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 flex items-start justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900">{log.actor_name}</span>
                    <span className="text-zinc-400">•</span>
                    <span className="capitalize font-semibold text-emerald-700">
                      {log.action.replace('_', ' ')}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-500">{log.entity_title}</span>
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <p className="text-[11px] text-zinc-400 font-mono">
                      {JSON.stringify(log.metadata)}
                    </p>
                  )}
                </div>

                <span className="text-[11px] text-zinc-400 whitespace-nowrap ml-4">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Details & Comments Modal */}
      <Dialog
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={selectedTask ? selectedTask.title : 'Task Details'}
      >
        {selectedTask && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-500">Status:</span>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value as TaskStatus)}
                  className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-bold"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Review / Blocked</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-500">Priority:</span>
                {getPriorityBadge(selectedTask.priority)}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-500">Client:</span>
                <span className="font-bold text-zinc-900">
                  {selectedTask.client?.company || selectedTask.client?.name || 'Internal'}
                </span>
              </div>
            </div>

            {selectedTask.description && (
              <div className="p-3 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-700">
                <p className="font-bold text-zinc-900 mb-1">Deliverable Scope</p>
                {selectedTask.description}
              </div>
            )}

            {/* Checklist items */}
            {selectedTask.checklist && selectedTask.checklist.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-zinc-900 mb-2">Checklist Items</h4>
                <div className="space-y-1.5">
                  {selectedTask.checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(selectedTask.id, item.id)}
                      className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors flex items-center gap-2.5 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {}}
                        className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className={item.completed ? 'line-through text-zinc-400' : 'text-zinc-800'}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Stream */}
            <div className="pt-2 border-t border-zinc-100 space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                Discussion &amp; Updates ({taskComments.length})
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {taskComments.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="font-bold text-zinc-800">{c.author_name}</span>
                      <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-zinc-700">{c.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input
                  placeholder="Post comment or handoff update..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="text-xs h-9"
                />
                <Button
                  type="submit"
                  disabled={submittingComment || !newCommentText.trim()}
                  size="sm"
                  className="h-9 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 font-semibold"
                >
                  {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </Button>
              </form>
            </div>
          </div>
        )}
      </Dialog>

      {/* Log Work Hours Modal */}
      <Dialog
        isOpen={isLogHoursOpen}
        onClose={() => setIsLogHoursOpen(false)}
        title="Log Work Hours & Deliverable Time"
      >
        <form onSubmit={handleLogHoursSubmit} className="space-y-3.5 pt-2">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Staff Member</label>
            <select
              value={logForm.staff_id}
              onChange={(e) => setLogForm({ ...logForm, staff_id: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium"
              required
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Date</label>
              <Input
                type="date"
                value={logForm.date}
                onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                className="text-xs h-9"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Hours Spent</label>
              <Input
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                value={logForm.hours_spent}
                onChange={(e) => setLogForm({ ...logForm, hours_spent: e.target.value })}
                className="text-xs h-9"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Deliverable / Task Title</label>
            <Input
              placeholder="e.g. Autumn visual graphics layout or Keyword research"
              value={logForm.task_title}
              onChange={(e) => setLogForm({ ...logForm, task_title: e.target.value })}
              className="text-xs h-9"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Operational Description</label>
            <textarea
              placeholder="Summary of work completed and milestones achieved..."
              value={logForm.description}
              onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none min-h-[70px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLogHoursOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loggingHours}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              {loggingHours ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              Save Work Log
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onTaskCreated={() => {
          fetchInitialData();
        }}
      />
    </div>
  );
}

