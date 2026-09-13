'use client';

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
          checklist: checklistItems.map((text, idx) => ({ id: `c_${Date.now()}_${idx}`, text, completed: false })),
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
