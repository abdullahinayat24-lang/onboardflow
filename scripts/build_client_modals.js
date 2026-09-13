const fs = require('fs');
const path = require('path');

const content = `'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Mail,
  Phone,
  MessageSquare,
  Copy,
  ExternalLink,
  Download,
  FileText,
  MapPin,
  Tag,
  CheckSquare,
  Building2,
  History,
  TrendingUp,
  Edit,
  Calendar,
  Archive,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { ClientWithDetails, Task, ActivityLog } from '@/types';

// 1. Communication Modal
export function ClientCommunicationModal({
  isOpen,
  onClose,
  client,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
}) {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!client) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(client.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Client Communication Hub" description={\`Direct communication channels for \${client.company || client.name}\`} maxWidth="md">
      <div className="space-y-4 pt-2">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span className="flex items-center gap-1 font-medium"><Mail className="w-3.5 h-3.5 text-blue-600" /> Email</span>
              <button onClick={handleCopyEmail} className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs font-bold text-zinc-900 truncate">{client.email}</p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span className="flex items-center gap-1 font-medium"><Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone</span>
              <a href={\`tel:\${client.phone || ''}\`} className="text-emerald-600 hover:text-emerald-800 text-[11px] font-semibold">Call</a>
            </div>
            <p className="text-xs font-bold text-zinc-900 truncate">{client.phone || 'No phone provided'}</p>
          </div>
        </div>

        {/* Quick Email / Message Composer */}
        <form onSubmit={handleSendMessage} className="space-y-3 pt-2 border-t border-zinc-100">
          <p className="text-xs font-bold text-zinc-900">Send Dispatch / Update</p>
          <div>
            <Input
              placeholder="Subject (e.g. Weekly Strategy Sync / Deliverable Review)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>
          <div>
            <textarea
              rows={3}
              placeholder="Type client update message or milestone notice..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <a
              href={\`mailto:\${client.email}?subject=\${encodeURIComponent(subject || 'Project Update')}\`}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Default Mail Client
            </a>

            <Button type="submit" disabled={sending} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <MessageSquare className="w-3.5 h-3.5 mr-1" />}
              {sentSuccess ? 'Dispatched!' : 'Send Dispatch'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

// 2. Assets & Drive Modal
export function ClientAssetsModal({
  isOpen,
  onClose,
  client,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
}) {
  if (!client) return null;
  const uploads = client.uploads || [];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Assets & Drive Locker" description={\`Cloud files, vector assets, and documents for \${client.company || client.name}\`} maxWidth="lg">
      <div className="space-y-4 pt-2">
        {/* Drive & Folder Actions */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              GD
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900">Google Drive Workspace Folder</p>
              <p className="text-[11px] text-blue-700">Dedicated shared agency drive for deliverables</p>
            </div>
          </div>
          <a
            href={client.website ? \`https://drive.google.com/drive/search?q=\${encodeURIComponent(client.company || client.name)}\` : 'https://drive.google.com'}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Drive
          </a>
        </div>

        {/* Uploaded Files List */}
        <div>
          <h3 className="text-xs font-bold text-zinc-900 mb-2">Onboarding Uploads ({uploads.length})</h3>
          {uploads.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {uploads.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 truncate">{file.filename}</p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 font-medium uppercase">
                        {file.category}
                      </span>
                    </div>
                  </div>
                  {file.public_url ? (
                    <a
                      href={file.public_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> View
                    </a>
                  ) : (
                    <span className="text-[11px] text-zinc-400">Stored</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-zinc-200 text-center text-xs text-zinc-500">
              No files uploaded yet. Client receives automated upload link in onboarding wizard.
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}

// 3. Local 3km Modal
export function ClientLocal3kmModal({
  isOpen,
  onClose,
  client,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
}) {
  if (!client) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Local 3km Geo-Grid Audit" description={\`Local search prominence & map pack radius for \${client.company || client.name}\`} maxWidth="md">
      <div className="space-y-4 pt-2">
        {/* Radius Rank Summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <p className="text-[10px] uppercase font-bold text-emerald-700">1km Radius</p>
            <p className="text-lg font-black text-emerald-900 mt-0.5">#1.4</p>
            <span className="text-[10px] text-emerald-600">Top 3 Pack</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-[10px] uppercase font-bold text-blue-700">2km Radius</p>
            <p className="text-lg font-black text-blue-900 mt-0.5">#2.8</p>
            <span className="text-[10px] text-blue-600">Top 5 Pack</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
            <p className="text-[10px] uppercase font-bold text-purple-700">3km Radius</p>
            <p className="text-lg font-black text-purple-900 mt-0.5">#4.2</p>
            <span className="text-[10px] text-purple-600">Expanding</span>
          </div>
        </div>

        {/* GBP Status Card */}
        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> Google Business Profile
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Verified &amp; Optimized
            </span>
          </div>
          <p className="text-xs text-zinc-600">
            Location: {client.company ? \`\${client.company} HQ & Retail\` : 'Primary Agency Target'}
          </p>
          <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-200">
            <span>Primary Category: Retail / Studio</span>
            <span className="text-emerald-700 font-semibold">94% Geo-Relevance</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} className="text-xs bg-zinc-900 hover:bg-black text-white">
            Close Audit
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

// 4. Vouchers Modal
export function ClientVouchersModal({
  isOpen,
  onClose,
  client,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
}) {
  const [vouchers, setVouchers] = useState([
    { code: 'VIP-ONBOARD-2026', discount: '$250 Credit', status: 'Active', validTill: 'Dec 31, 2026' },
    { code: 'RETAINER-UPGRADE-15', discount: '15% Off Retainer', status: 'Available', validTill: 'Ongoing' },
  ]);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');

  if (!client) return null;

  const handleAddVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    setVouchers([...vouchers, { code: newCode.toUpperCase(), discount: newDiscount || '$100 Credit', status: 'Active', validTill: 'Dec 31, 2026' }]);
    setNewCode('');
    setNewDiscount('');
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Client Vouchers & Loyalty Credits" description={\`Active service vouchers and redeemable codes for \${client.company || client.name}\`} maxWidth="md">
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          {vouchers.map((v, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white">
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="font-mono text-xs font-bold text-zinc-900">{v.code}</p>
                  <p className="text-[11px] text-zinc-500">{v.discount} • Valid till {v.validTill}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                {v.status}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddVoucher} className="pt-2 border-t border-zinc-100 flex gap-2">
          <Input placeholder="CODE" value={newCode} onChange={(e) => setNewCode(e.target.value)} className="text-xs h-8 uppercase font-mono" required />
          <Input placeholder="Discount / Credit" value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)} className="text-xs h-8" required />
          <Button type="submit" size="sm" className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
            <Plus className="w-3.5 h-3.5 mr-1" /> Issue
          </Button>
        </form>
      </div>
    </Dialog>
  );
}

// 5. Tasks Modal
export function ClientTasksModal({
  isOpen,
  onClose,
  client,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    if (!isOpen || !client) return;
    setLoading(true);
    fetch(\`/api/tasks?client_id=\${client.id}\`)
      .then((r) => r.json())
      .then((data) => {
        if (data.tasks) setTasks(data.tasks);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [isOpen, client]);

  if (!client) return null;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          client_id: client.id,
          priority: 'medium',
          department: 'Operations',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks([data.task, ...tasks]);
        setNewTaskTitle('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'open' : 'completed';
    try {
      await fetch(\`/api/tasks/\${task.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Client Linked Tasks" description={\`Deliverables and sub-tasks for \${client.company || client.name}\`} maxWidth="lg">
      <div className="space-y-4 pt-2">
        <form onSubmit={handleCreateTask} className="flex gap-2">
          <Input
            placeholder="Add quick deliverable for this client..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="text-xs h-9"
          />
          <Button type="submit" size="sm" className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 font-semibold">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Task
          </Button>
        </form>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-zinc-400">Loading tasks...</div>
          ) : tasks.length > 0 ? (
            tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleTask(t)}
                    className={\`w-4 h-4 rounded flex items-center justify-center cursor-pointer \${
                      t.status === 'completed' ? 'bg-emerald-600 text-white' : 'border border-zinc-300'
                    }\`}
                  >
                    {t.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <div className="min-w-0">
                    <p className={\`text-xs font-semibold truncate \${t.status === 'completed' ? 'line-through text-zinc-400' : 'text-zinc-900'}\`}>
                      {t.title}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {t.department} • Priority: <span className="font-semibold capitalize">{t.priority}</span>
                    </p>
                  </div>
                </div>
                <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize \${
                  t.status === 'completed' ? 'bg-zinc-100 text-zinc-500' : 'bg-emerald-50 text-emerald-800'
                }\`}>
                  {t.status}
                </span>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-zinc-400">No tasks created for this client yet.</div>
          )}
        </div>
      </div>
    </Dialog>
  );
}

// 6. Branches Modal
export function ClientBranchesModal({
  isOpen,
  onClose,
  client,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
}) {
  const [branches, setBranches] = useState([
    { name: 'Headquarters & Studio', address: '100 Innovation Way, Suite 400', phone: '+1 (555) 234-5678', isPrimary: true },
    { name: 'Downtown Showcase', address: '450 Broadway Ave', phone: '+1 (555) 876-5432', isPrimary: false },
  ]);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');

  if (!client) return null;

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    setBranches([...branches, { name: newBranchName, address: newBranchAddress || 'Pending Address', phone: client.phone || '+1 (555) 000-0000', isPrimary: false }]);
    setNewBranchName('');
    setNewBranchAddress('');
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Client Location Branches" description={\`Manage multi-location retail, clinic, or office branches for \${client.company || client.name}\`} maxWidth="md">
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          {branches.map((b, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-zinc-200 bg-white flex items-start justify-between">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-zinc-900">{b.name}</p>
                    {b.isPrimary && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Primary</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{b.address}</p>
                  <p className="text-[10px] text-zinc-400">{b.phone}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddBranch} className="pt-2 border-t border-zinc-100 space-y-2">
          <p className="text-xs font-bold text-zinc-900">Add New Branch Location</p>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Branch Name (e.g. North Hub)" value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} className="text-xs h-8" required />
            <Input placeholder="Street Address" value={newBranchAddress} onChange={(e) => setNewBranchAddress(e.target.value)} className="text-xs h-8" required />
          </div>
          <Button type="submit" size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Location
          </Button>
        </form>
      </div>
    </Dialog>
  );
}

// 7. Work Audit Modal
export function ClientWorkAuditModal({
  isOpen,
  onClose,
  client,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
}) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !client) return;
    setLoading(true);
    fetch(\`/api/audit?client_id=\${client.id}\`)
      .then((r) => r.json())
      .then((data) => {
        if (data.activities) setLogs(data.activities);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, client]);

  if (!client) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Client Work Audit Trail" description={\`Permanent audit record of milestones, completions & actions for \${client.company || client.name}\`} maxWidth="lg">
      <div className="space-y-3 pt-2">
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-zinc-400">Loading audit records...</div>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-emerald-600" />
                    {log.actor_name}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-zinc-700 font-medium">Action: {log.action.replace(/_/g, ' ')}</p>
                {log.entity_title && <p className="text-[11px] text-zinc-500 mt-0.5">Entity: {log.entity_title}</p>}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-zinc-400">No specific audit entries logged for this client yet.</div>
          )}
        </div>
      </div>
    </Dialog>
  );
}

// 8. Campaigns Modal
export function ClientCampaignsModal({
  isOpen,
  onClose,
  client,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
}) {
  if (!client) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Active Client Campaigns" description={\`Paid ad accounts and growth marketing channels for \${client.company || client.name}\`} maxWidth="md">
      <div className="space-y-3 pt-2">
        <div className="p-3 rounded-xl border border-zinc-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Google Search &amp; Performance Max
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Active</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 pt-1 border-t border-zinc-100">
            <span>Budget: <strong>$2,500 / mo</strong></span>
            <span>Target ROAS: <strong>3.8x</strong></span>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-zinc-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Meta Retargeting &amp; Reels
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Active</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 pt-1 border-t border-zinc-100">
            <span>Budget: <strong>$1,800 / mo</strong></span>
            <span>CPA Target: <strong>$22.00</strong></span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

// 9. Edit Modal
export function ClientEditModal({
  isOpen,
  onClose,
  client,
  onClientUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
  onClientUpdated?: (updated: ClientWithDetails) => void;
}) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setCompany(client.company || '');
      setEmail(client.email || '');
      setPhone(client.phone || '');
      setWebsite(client.website || '');
    }
  }, [client]);

  if (!client) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(\`/api/clients/\${client.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company, email, phone, website }),
      });
      if (res.ok) {
        const data = await res.json();
        if (onClientUpdated && data.client) onClientUpdated(data.client);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Client Details" description={\`Update primary profile and account settings for \${client.company || client.name}\`} maxWidth="md">
      <form onSubmit={handleSave} className="space-y-3 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Company / Brand</label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} className="text-xs h-9" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Contact Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="text-xs h-9" required />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-xs h-9" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="text-xs h-9" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Website</label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className="text-xs h-9" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
          <Button type="button" variant="ghost" onClick={onClose} className="text-xs">Cancel</Button>
          <Button type="submit" disabled={saving} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null} Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// 10. Calendar Modal
export function ClientCalendarModal({
  isOpen,
  onClose,
  client,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
}) {
  if (!client) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Client Milestones & Calendar" description={\`Kickoff, deliverables, and review dates for \${client.company || client.name}\`} maxWidth="md">
      <div className="space-y-3 pt-2">
        <div className="space-y-2">
          <div className="p-3 rounded-xl border border-zinc-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-zinc-900">Kickoff Alignment Call</p>
                <p className="text-[11px] text-zinc-500">Scheduled upon onboarding questionnaire completion</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Confirmed
            </span>
          </div>

          <div className="p-3 rounded-xl border border-zinc-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-zinc-900">30-Day Project Handoff</p>
                <p className="text-[11px] text-zinc-500">Asset delivery, brief sign-off, and launch</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Day 30
            </span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

// 11. Archive Confirmation Modal
export function ClientArchiveModal({
  isOpen,
  onClose,
  client,
  onArchived,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
  onArchived: (clientId: string) => void;
}) {
  const [archiving, setArchiving] = useState(false);

  if (!client) return null;

  const handleConfirmArchive = async () => {
    setArchiving(true);
    try {
      const res = await fetch(\`/api/clients/\${client.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', is_archived: true }),
      });
      if (res.ok) {
        onArchived(client.id);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setArchiving(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Archive Client?" description="Move client to Client Archive room" maxWidth="sm">
      <div className="space-y-4 pt-2">
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-900">
            Archiving <strong>{client.company || client.name}</strong> will remove them from the active clients view and place them in the <strong>Client Archive</strong> room. All historical data, briefs, and logs are preserved and can be restored at any time.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} className="text-xs">Cancel</Button>
          <Button onClick={handleConfirmArchive} disabled={archiving} className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold">
            {archiving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Archive className="w-3.5 h-3.5 mr-1" />}
            Confirm Archive
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
`;

fs.writeFileSync('components/dashboard/client-action-modals.tsx', content, 'utf8');
console.log('Written: components/dashboard/client-action-modals.tsx');
