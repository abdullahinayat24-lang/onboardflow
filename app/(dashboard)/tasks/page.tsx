'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Kanban,
  List,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  LayoutDashboard,
  ArrowRight,
  User,
  Briefcase,
  Trash2,
  MessageSquare,
  Send,
  Loader2,
  ChevronRight,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Task, TaskPriority, TaskStatus, TaskComment } from '@/types';
import { CreateTaskModal } from '@/components/dashboard/create-task-modal';

type ViewMode = 'dashboard' | 'board' | 'list' | 'calendar' | 'timeline';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskComments, setTaskComments] = useState<TaskComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error('Failed to load tasks', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenTicket = async (task: Task) => {
    setSelectedTask(task);
    try {
      const res = await fetch(`/api/tasks/${task.id}`);
      const data = await res.json();
      if (data.comments) setTaskComments(data.comments);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({ ...selectedTask, status: newStatus });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleChecklistItem = async (taskId: string, checkId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.checklist) return;

    const updatedChecklist = task.checklist.map((item) =>
      item.id === checkId ? { ...item, completed: !item.completed } : item
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
          setSelectedTask({ ...selectedTask, checklist: updatedChecklist });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          add_comment: {
            author_id: 'staff_alex',
            author_name: 'Agency Operator',
            content: newCommentText.trim(),
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setTaskComments([...taskComments, data.comment]);
          setNewCommentText('');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedDept !== 'all' && t.department !== selectedDept) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.client && (t.client.name.toLowerCase().includes(q) || (t.client.company && t.client.company.toLowerCase().includes(q))))
      );
    }
    return true;
  });

  const counts = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === 'open').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    urgent: tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed').length,
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">Urgent 🔥</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-medium border border-zinc-200">Low</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & 6-View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            Agency Task Management
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time deliverable execution, multi-stage pipelines, and checklist tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 6 Views Switcher */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'dashboard' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Dashboard KPI View"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">KPIs</span>
            </button>

            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'board' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="List Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'calendar' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Calendar Due-Date View"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>

            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'timeline' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Timeline Gantt-style View"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="h-9 px-3.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <Input
              placeholder="Search deliverables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 h-8 w-44 sm:w-56"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Departments</option>
            <option value="SEO & Content">SEO & Content</option>
            <option value="Engineering & Dev">Engineering & Dev</option>
            <option value="Design & Creative">Design & Creative</option>
            <option value="Paid Media & Ads">Paid Media & Ads</option>
            <option value="Account Management">Account Management</option>
            <option value="Operations">Operations</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent Only</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>{filteredTasks.length} tasks shown</span>
          {counts.urgent > 0 && (
            <span className="text-rose-600 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {counts.urgent} Urgent
            </span>
          )}
        </div>
      </div>

      {/* VIEW 1: DASHBOARD VIEW */}
      {viewMode === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <p className="text-xs text-zinc-500 font-semibold">Total Deliverables</p>
              <p className="text-2xl font-black text-zinc-900 mt-1">{counts.total}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <p className="text-xs text-blue-600 font-semibold">Open / Backlog</p>
              <p className="text-2xl font-black text-blue-900 mt-1">{counts.open}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <p className="text-xs text-purple-600 font-semibold">In Progress</p>
              <p className="text-2xl font-black text-purple-900 mt-1">{counts.in_progress}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <p className="text-xs text-amber-600 font-semibold">Blocked / Review</p>
              <p className="text-2xl font-black text-amber-900 mt-1">{counts.blocked}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <p className="text-xs text-emerald-600 font-semibold">Completed</p>
              <p className="text-2xl font-black text-emerald-900 mt-1">{counts.completed}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-zinc-900">Priority Distribution</h3>
              <div className="space-y-2 text-xs">
                {['urgent', 'high', 'medium', 'low'].map((p) => {
                  const pCount = tasks.filter((t) => t.priority === p).length;
                  const pPct = counts.total > 0 ? Math.round((pCount / counts.total) * 100) : 0;
                  return (
                    <div key={p} className="space-y-1">
                      <div className="flex justify-between capitalize text-zinc-700">
                        <span>{p}</span>
                        <span className="font-semibold">{pCount} ({pPct}%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            p === 'urgent' ? 'bg-rose-500' : p === 'high' ? 'bg-amber-500' : p === 'medium' ? 'bg-blue-500' : 'bg-zinc-400'
                          }`}
                          style={{ width: `${pPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-zinc-900">Recent High Priority Deliverables</h3>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.priority === 'urgent' || t.priority === 'high')
                  .slice(0, 4)
                  .map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleOpenTicket(t)}
                      className="p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-zinc-900 truncate">{t.title}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{t.client?.company || t.client?.name || 'Internal'} • {t.department}</p>
                      </div>
                      <div className="shrink-0">{getPriorityBadge(t.priority)}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: KANBAN BOARD VIEW */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {[
            { id: 'open', label: 'Open / Intake', color: 'border-blue-300 bg-blue-50/40 text-blue-900' },
            { id: 'in_progress', label: 'In Progress', color: 'border-purple-300 bg-purple-50/40 text-purple-900' },
            { id: 'blocked', label: 'In Review / Blocked', color: 'border-amber-300 bg-amber-50/40 text-amber-900' },
            { id: 'completed', label: 'Completed', color: 'border-emerald-300 bg-emerald-50/40 text-emerald-900' },
          ].map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="bg-zinc-100/70 p-3 rounded-2xl border border-zinc-200 flex flex-col space-y-3">
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="text-xs font-bold text-zinc-500">{colTasks.length}</span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2 min-h-[300px]">
                  {colTasks.map((t) => {
                    const chkDone = (t.checklist || []).filter((c) => c.completed).length;
                    const chkTotal = (t.checklist || []).length;
                    return (
                      <div
                        key={t.id}
                        className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer space-y-2.5"
                        onClick={() => handleOpenTicket(t)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 truncate">
                            {t.department}
                          </span>
                          {getPriorityBadge(t.priority)}
                        </div>

                        <p className="text-xs font-bold text-zinc-900 leading-snug line-clamp-2">
                          {t.title}
                        </p>

                        {t.client && (
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 truncate">
                            <Briefcase className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate">{t.client.company || t.client.name}</span>
                          </div>
                        )}

                        {chkTotal > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                            <CheckSquare className="w-3 h-3 text-emerald-600" />
                            <span>{chkDone}/{chkTotal} sub-tasks</span>
                          </div>
                        )}

                        {/* Card Footer: Quick Move Actions */}
                        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                          <span className="text-zinc-400">
                            {t.due_date ? new Date(t.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No date'}
                          </span>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {col.id === 'open' && (
                              <button
                                onClick={() => handleUpdateStatus(t.id, 'in_progress')}
                                className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold cursor-pointer"
                              >
                                Start &rarr;
                              </button>
                            )}
                            {col.id === 'in_progress' && (
                              <button
                                onClick={() => handleUpdateStatus(t.id, 'completed')}
                                className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold cursor-pointer"
                              >
                                Complete &rarr;
                              </button>
                            )}
                            {col.id === 'blocked' && (
                              <button
                                onClick={() => handleUpdateStatus(t.id, 'in_progress')}
                                className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold cursor-pointer"
                              >
                                Resume &rarr;
                              </button>
                            )}
                            {col.id === 'completed' && (
                              <button
                                onClick={() => handleUpdateStatus(t.id, 'open')}
                                className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 hover:bg-zinc-200 font-semibold cursor-pointer"
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: LIST TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 pl-4">Task Deliverable</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTasks.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => handleOpenTicket(t)}
                    className="hover:bg-zinc-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 pl-4 font-bold text-zinc-900 max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="p-3 text-zinc-600 truncate max-w-[150px]">
                      {t.client?.company || t.client?.name || 'Internal'}
                    </td>
                    <td className="p-3 text-zinc-600">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium">
                        {t.department}
                      </span>
                    </td>
                    <td className="p-3">{getPriorityBadge(t.priority)}</td>
                    <td className="p-3 text-zinc-500">
                      {t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateStatus(t.id, e.target.value as TaskStatus)}
                        className="rounded border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="blocked">Review / Blocked</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="p-3 text-right pr-4">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-700 hover:text-emerald-900">
                        Open Ticket &rarr;
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Due This Week', filter: (d: string) => true, color: 'border-emerald-200 bg-emerald-50/30' },
            { title: 'Upcoming Deliverables', filter: (d: string) => true, color: 'border-blue-200 bg-blue-50/30' },
            { title: 'Completed Milestones', filter: (d: string) => true, color: 'border-zinc-200 bg-zinc-50/50' },
          ].map((sec, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border ${sec.color} space-y-3`}>
              <h3 className="font-bold text-xs text-zinc-900 uppercase tracking-wider">{sec.title}</h3>
              <div className="space-y-2">
                {filteredTasks.slice(idx * 3, idx * 3 + 3).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleOpenTicket(t)}
                    className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs hover:shadow-sm cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-zinc-500">{t.due_date ? new Date(t.due_date).toDateString() : 'Ongoing'}</span>
                      {getPriorityBadge(t.priority)}
                    </div>
                    <p className="text-xs font-bold text-zinc-900 truncate">{t.title}</p>
                    <p className="text-[11px] text-zinc-500">{t.client?.company || 'Internal'}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 5: TIMELINE GANTT VIEW */}
      {viewMode === 'timeline' && (
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-zinc-900">Deliverables Timeline &amp; Work Streams</h3>
          <div className="space-y-3">
            {filteredTasks.map((t, idx) => (
              <div key={t.id} className="flex items-center gap-4 text-xs">
                <div className="w-48 truncate font-medium text-zinc-900">{t.title}</div>
                <div className="flex-1 bg-zinc-100 rounded-full h-4 relative overflow-hidden">
                  <div
                    className={`h-4 rounded-full flex items-center px-2 text-[10px] font-bold text-white ${
                      t.status === 'completed' ? 'bg-emerald-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, (idx + 1) * 25)}%` }}
                  >
                    {t.status}
                  </div>
                </div>
                <span className="w-20 text-right text-[11px] text-zinc-400">Day {(idx + 1) * 7}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 6: TICKET VIEW MODAL */}
      <Dialog
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || 'Task Ticket'}
        description={`${selectedTask?.department} • Priority: ${selectedTask?.priority?.toUpperCase()}`}
        maxWidth="lg"
      >
        {selectedTask && (
          <div className="space-y-4 pt-2">
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
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
                <span className="font-semibold text-zinc-500">Client:</span>
                <span className="font-bold text-zinc-900">
                  {selectedTask.client?.company || selectedTask.client?.name || 'Internal'}
                </span>
              </div>
            </div>

            {/* Description */}
            {selectedTask.description && (
              <div className="p-3 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-700 leading-relaxed">
                <p className="font-bold text-zinc-900 mb-1">Scope &amp; Deliverable Details</p>
                {selectedTask.description}
              </div>
            )}

            {/* Sub-task Checklists (Interactive) */}
            <div>
              <h4 className="text-xs font-bold text-zinc-900 mb-2">Checklist Items</h4>
              {selectedTask.checklist && selectedTask.checklist.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedTask.checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklistItem(selectedTask.id, item.id)}
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
              ) : (
                <div className="p-3 text-center text-xs text-zinc-400 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                  No sub-tasks defined for this ticket.
                </div>
              )}
            </div>

            {/* Comments Thread & Composer */}
            <div className="pt-2 border-t border-zinc-100 space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                Comments &amp; Activity ({taskComments.length})
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
                <Button type="submit" disabled={submittingComment || !newCommentText.trim()} size="sm" className="h-9 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 font-semibold">
                  {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </Button>
              </form>
            </div>
          </div>
        )}
      </Dialog>

      {/* Create Task Global Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={() => {
          fetchTasks();
        }}
      />
    </div>
  );
}
