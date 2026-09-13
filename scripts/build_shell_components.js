const fs = require('fs');
const path = require('path');

function write(relPath, content) {
  const full = path.join(__dirname, '..', relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('Written:', relPath);
}

// 1. components/dashboard/create-task-modal.tsx
write('components/dashboard/create-task-modal.tsx', `'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Loader2, CheckSquare } from 'lucide-react';
import { Task, Client, Staff } from '@/types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: (task: Task) => void;
  defaultClientId?: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
  defaultClientId,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState(defaultClientId || '');
  const [assignedTo, setAssignedTo] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  const [clients, setClients] = useState<Client[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultClientId) setClientId(defaultClientId);
  }, [defaultClientId]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/staff').then((r) => r.json()),
    ])
      .then(([clientsRes, staffRes]) => {
        if (clientsRes.clients) setClients(clientsRes.clients);
        if (staffRes.staff) setStaffList(staffRes.staff);
      })
      .catch((e) => console.error('Failed to load clients/staff for task modal', e))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems([...checklistItems, newChecklistText.trim()]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (idx: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          client_id: clientId || null,
          assigned_to: assignedTo || null,
          department,
          priority,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          checklist: checklistItems.map((text, idx) => ({ id: \`c_\${Date.now()}_\${idx}\`, text, completed: false })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (onTaskCreated) onTaskCreated(data.task);
        // Reset form
        setTitle('');
        setDescription('');
        setClientId('');
        setAssignedTo('');
        setDepartment('Operations');
        setPriority('medium');
        setDueDate('');
        setChecklistItems([]);
        onClose();
      }
    } catch (err) {
      console.error('Failed to create task', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create New Task" description="Assign deliverables, link clients, and define checklists" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Task Title <span className="text-red-500">*</span>
          </label>
          <Input
            required
            placeholder="e.g. Audit competitor backlinks & keyword rankings"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm"
          />
        </div>

        {/* Client & Assignee Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Client (Optional)</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">None / Internal Agency Task</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company || c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Assignee</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Unassigned</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Department, Priority & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
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
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent 🔥</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">Description & Notes</label>
          <textarea
            rows={2}
            placeholder="Specific deliverables, references, links, or instructions..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Checklist Sub-items */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">Checklist Items</label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add actionable sub-task or acceptance criteria..."
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
              className="text-xs h-8"
            />
            <Button type="button" variant="outline" onClick={handleAddChecklistItem} className="h-8 px-3 text-xs shrink-0">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>

          {checklistItems.length > 0 && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto bg-zinc-50 p-2 rounded-lg border border-zinc-200">
              {checklistItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 text-xs text-zinc-700 bg-white px-2.5 py-1.5 rounded border border-zinc-200/80">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckSquare className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(idx)}
                    className="text-zinc-400 hover:text-rose-600 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting} className="text-xs">
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !title.trim()} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Creating...
              </>
            ) : (
              'Create Task'
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
`);

// 2. components/dashboard/global-search-modal.tsx
write('components/dashboard/global-search-modal.tsx', `'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, CheckSquare, Layers, Briefcase, FileText, X, ArrowRight } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'clients' | 'staff' | 'tasks' | 'workflows' | 'projects'>('all');
  const [results, setResults] = useState<{
    clients: any[];
    staff: any[];
    tasks: any[];
    workflows: any[];
    projects: any[];
  }>({
    clients: [],
    staff: [],
    tasks: [],
    workflows: [],
    projects: [],
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ clients: [], staff: [], tasks: [], workflows: [], projects: [] });
      setTotal(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ clients: [], staff: [], tasks: [], workflows: [], projects: [] });
      setTotal(0);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(\`/api/search?q=\${encodeURIComponent(query.trim())}\`)
        .then((r) => r.json())
        .then((data) => {
          if (data.results) {
            setResults(data.results);
            setTotal(data.total || 0);
          }
        })
        .catch((e) => console.error('Search error', e))
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleNavigate = (link: string) => {
    onClose();
    router.push(link);
  };

  const getFilteredItems = () => {
    const list: any[] = [];
    if (activeTab === 'all' || activeTab === 'clients') {
      results.clients.forEach((c) => list.push({ ...c, category: 'Client' }));
    }
    if (activeTab === 'all' || activeTab === 'staff') {
      results.staff.forEach((s) => list.push({ ...s, category: 'Staff Member' }));
    }
    if (activeTab === 'all' || activeTab === 'tasks') {
      results.tasks.forEach((t) => list.push({ ...t, category: 'Task' }));
    }
    if (activeTab === 'all' || activeTab === 'workflows') {
      results.workflows.forEach((w) => list.push({ ...w, category: 'Workflow' }));
    }
    if (activeTab === 'all' || activeTab === 'projects') {
      results.projects.forEach((p) => list.push({ ...p, category: 'Project' }));
    }
    return list;
  };

  const filteredItems = getFilteredItems();

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="DBA Search Agent" description="Instant cross-database index: Clients, Staff, Tasks, Workflows & Projects" maxWidth="xl">
      <div className="space-y-3 pt-1">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type anything to search... (e.g., Acme, Sarah, Backlinks, Stage 3)"
            className="w-full bg-zinc-50 focus:bg-white text-sm text-zinc-900 placeholder-zinc-400 pl-10 pr-9 py-2.5 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 text-zinc-400 hover:text-zinc-600 p-0.5">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-zinc-100">
          {[
            { id: 'all', label: 'All Results', count: total },
            { id: 'clients', label: 'Clients', count: results.clients.length },
            { id: 'staff', label: 'Staff', count: results.staff.length },
            { id: 'tasks', label: 'Tasks', count: results.tasks.length },
            { id: 'workflows', label: 'Workflows', count: results.workflows.length },
            { id: 'projects', label: 'Projects', count: results.projects.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={\`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer \${
                activeTab === tab.id
                  ? 'bg-emerald-100 text-emerald-900 font-semibold'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
              }\`}
            >
              {tab.label} {query && <span className="opacity-70">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-zinc-400">Searching records...</div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleNavigate(item.link)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 group-hover:bg-emerald-100 text-zinc-600 group-hover:text-emerald-800 flex items-center justify-center shrink-0">
                    {item.type === 'client' && <Briefcase className="w-4 h-4" />}
                    {item.type === 'staff' && <User className="w-4 h-4" />}
                    {item.type === 'task' && <CheckSquare className="w-4 h-4" />}
                    {item.type === 'workflow' && <Layers className="w-4 h-4" />}
                    {item.type === 'project' && <FileText className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-zinc-900 truncate">{item.title}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium">
                        {item.category}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-[11px] text-zinc-500 truncate">{item.subtitle}</p>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            ))
          ) : query ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching records found for "{query}". Try checking another tab.
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-400 space-y-1">
              <p className="font-medium text-zinc-600">DBA Search Agent is ready.</p>
              <p>Type keywords to search clients, team members, deliverables, and pipelines.</p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
`);

// 3. components/dashboard/notifications-popover.tsx
write('components/dashboard/notifications-popover.tsx', `'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, CheckCircle2, Clock, AlertTriangle, Layers, UserCheck } from 'lucide-react';
import { Notification } from '@/types';

export function NotificationsPopover() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
        if (typeof data.unreadCount === 'number') setUnreadCount(data.unreadCount);
      })
      .catch((e) => console.error('Error fetching notifications', e));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  const handleItemClick = async (notif: Notification) => {
    if (!notif.is_read) {
      fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notif.id }),
      }).catch(console.error);
      setNotifications(notifications.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
    setIsOpen(false);
    if (notif.link) router.push(notif.link);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/40 text-emerald-200 hover:text-white transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-zinc-200 dark:border-zinc-800 p-3 z-50 text-zinc-900 animate-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1.5">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={\`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer \${
                    notif.is_read
                      ? 'bg-white border-transparent hover:bg-zinc-50 text-zinc-600'
                      : 'bg-emerald-50/50 border-emerald-200/60 hover:bg-emerald-50 text-zinc-900 font-medium'
                  }\`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'task_assigned' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      {notif.type === 'task_overdue' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {notif.type === 'onboarding_completed' && <UserCheck className="w-4 h-4 text-emerald-600" />}
                      {notif.type === 'workflow_advanced' && <Layers className="w-4 h-4 text-indigo-600" />}
                      {(!notif.type || notif.type === 'info') && <Clock className="w-4 h-4 text-zinc-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-xs truncate">{notif.title}</p>
                        {!notif.is_read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-zinc-400">No notifications yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
`);

// 4. components/dashboard/top-bar.tsx
write('components/dashboard/top-bar.tsx', `'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, CheckSquare, Menu, Clock, Sparkles } from 'lucide-react';
import { Agency } from '@/types';
import { CreateTaskModal } from '@/components/dashboard/create-task-modal';
import { GlobalSearchModal } from '@/components/dashboard/global-search-modal';
import { NotificationsPopover } from '@/components/dashboard/notifications-popover';

interface TopBarProps {
  agency?: Agency | null;
  onToggleMobileMenu?: () => void;
}

export function TopBar({ agency, onToggleMobileMenu }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }) + ' • ' + now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-14 bg-[#05261d] border-b border-emerald-900/60 sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shadow-xs text-white">
        {/* Left Section: Mobile Menu + Brand / OS Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/50 md:hidden cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-xs group-hover:scale-105 transition-transform">
              {agency?.logo_url ? (
                <img src={agency.logo_url} alt="" className="w-7 h-7 rounded-lg object-cover" />
              ) : (
                'OF'
              )}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-tight text-white">{agency?.name || 'OnboardFlow'}</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                  OS
                </span>
              </div>
            </div>
          </Link>

          {/* + Create Task Global Action */}
          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-xs transition-all cursor-pointer hover:shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline sm:inline">Create Task</span>
          </button>
        </div>

        {/* Center Section: DBA Search Agent */}
        <div className="flex-1 max-w-md mx-1 sm:mx-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full bg-[#083327]/80 hover:bg-[#0c4032] border border-emerald-800/60 hover:border-emerald-600/80 text-emerald-200/80 hover:text-white px-3 py-1.5 rounded-full text-xs flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="truncate font-medium text-[11px] sm:text-xs">DBA Search Agent</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-400 border border-emerald-700/40">
              Ctrl K
            </span>
          </button>
        </div>

        {/* Right Section: My Work + Time + Notifs + Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* My Work Shortcut */}
          <Link
            href="/my-work"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/70 border border-emerald-700/40 text-emerald-100 hover:text-white text-xs font-semibold transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>My Work</span>
          </Link>

          {/* Real-time Clock */}
          {currentTime && (
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-emerald-300/80 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{currentTime}</span>
            </div>
          )}

          {/* Notifications Popover */}
          <NotificationsPopover />

          {/* User Profile Avatar */}
          <Link href="/settings" className="relative cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-emerald-700/60 border border-emerald-500/50 flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:border-emerald-300 transition-colors">
              {agency?.name ? agency.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 border border-[#05261d]" />
          </Link>
        </div>
      </header>

      {/* Global Modals */}
      <CreateTaskModal isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
`);

// 5. components/dashboard/sidebar.tsx
write('components/dashboard/sidebar.tsx', `'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Archive,
  CheckSquare,
  Briefcase,
  Layers,
  BarChart3,
  Settings,
  Sparkles,
  Zap,
  LogOut,
  Plus,
  X,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Agency } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  agency?: Agency | null;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ agency, isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const brandColor = agency?.brand_color || '#059669';
  const sub = agency?.subscription;

  const navItems = [
    {
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      label: 'Staff / Managers',
      href: '/staff',
      icon: UserCheck,
      active: pathname === '/staff',
    },
    {
      label: 'Clients',
      href: '/clients',
      icon: Users,
      active: pathname.startsWith('/clients') && !pathname.includes('/archive'),
    },
    {
      label: 'Client Archive',
      href: '/archive',
      icon: Archive,
      active: pathname === '/archive',
    },
    {
      label: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      active: pathname === '/tasks',
    },
    {
      label: 'My Work',
      href: '/my-work',
      icon: Briefcase,
      active: pathname === '/my-work',
    },
    {
      label: 'Workflows',
      href: '/workflows',
      icon: Layers,
      active: pathname === '/workflows',
    },
    {
      label: 'Reports & Logs',
      href: '/reports',
      icon: BarChart3,
      active: pathname === '/reports',
    },
    {
      label: 'Templates & AI',
      href: '/templates',
      icon: Sparkles,
      active: pathname.startsWith('/templates'),
    },
    {
      label: 'Agency Settings',
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings'),
    },
  ];

  const handleSignOut = async () => {
    document.cookie = 'demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const getTierLabel = () => {
    if (!sub || sub.plan_tier === 'appsumo_tier2') return 'AppSumo Tier 2 Lifetime';
    if (sub.plan_tier === 'appsumo_tier1') return 'AppSumo Tier 1 Lifetime';
    if (sub.plan_tier === 'pro') return 'Agency Pro Plan';
    if (sub.plan_tier === 'enterprise') return 'Enterprise Studio';
    return 'Agency OS Pro (VIP)';
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-white dark:bg-zinc-950">
      <div>
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
              style={{ backgroundColor: brandColor }}
            >
              {agency?.logo_url ? (
                <img src={agency.logo_url} alt={agency.name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                (agency?.name || 'OF').substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-xs text-zinc-900 dark:text-white truncate">
                {agency?.name || 'OnboardFlow'}
              </h2>
              <p className="text-[10px] text-zinc-500 truncate">Agency Operations SaaS</p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick New Client Action */}
        <div className="px-3 pt-3 pb-2">
          <Link
            href="/clients?action=new"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors border border-emerald-200/80 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>+ New Client Intake</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 py-1 space-y-0.5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 my-1.5">
            Operations &amp; Work
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  item.active
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold border-l-3 border-emerald-600'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    item.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Tier Badge & Sign out */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-2.5 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {getTierLabel()}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-zinc-500">All Operations Modules Unlocked</p>
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 border-r border-zinc-200 dark:border-zinc-800 shrink-0 h-[calc(100vh-3.5rem)] sticky top-14 z-20 flex-col overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
`);

// 6. components/dashboard/dashboard-shell.tsx
write('components/dashboard/dashboard-shell.tsx', `'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/dashboard/top-bar';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Agency } from '@/types';

interface DashboardShellProps {
  agency?: Agency | null;
  children: React.ReactNode;
}

export function DashboardShell({ agency, children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-zinc-900 antialiased font-sans">
      <TopBar agency={agency} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <div className="flex flex-1 min-h-[calc(100vh-3.5rem)]">
        <Sidebar
          agency={agency}
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 min-w-0 pb-16 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
`);

console.log('Shell & Navigation components generated successfully!');
