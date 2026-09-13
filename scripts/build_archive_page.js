const fs = require('fs');

const content = `'use client';

import React, { useState, useEffect } from 'react';
import {
  Archive,
  RefreshCw,
  Trash2,
  Mail,
  History,
  Search,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { ClientWithDetails } from '@/types';
import { ClientCommunicationModal, ClientWorkAuditModal } from '@/components/dashboard/client-action-modals';

export default function ClientArchivePage() {
  const [archivedClients, setArchivedClients] = useState<ClientWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeClient, setActiveClient] = useState<ClientWithDetails | null>(null);
  const [isCommOpen, setIsCommOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<ClientWithDetails | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchArchived = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients?archived=true');
      const data = await res.json();
      if (data.clients) {
        setArchivedClients(data.clients);
      }
    } catch (e) {
      console.error('Failed to load archived clients', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRestore = async (client: ClientWithDetails) => {
    setRestoringId(client.id);
    try {
      const res = await fetch(\`/api/clients/\${client.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unarchive', is_archived: false }),
      });
      if (res.ok) {
        setArchivedClients(archivedClients.filter((c) => c.id !== client.id));
        showToast(\`\${client.company || client.name} successfully restored to Active Clients!\`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRestoringId(null);
    }
  };

  const handleDeletePermanently = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      const res = await fetch(\`/api/clients/\${deleteCandidate.id}\`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setArchivedClients(archivedClients.filter((c) => c.id !== deleteCandidate.id));
        showToast(\`\${deleteCandidate.company || deleteCandidate.name} permanently deleted.\`);
        setDeleteCandidate(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = archivedClients.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/clients" className="text-zinc-400 hover:text-zinc-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2">
                <Archive className="w-5 h-5 text-amber-600" />
                Client Archive Room
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                {archivedClients.length} Archived
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-1 pl-6">
            Preserved client records, historical deliverables, questionnaires, and synthesized AI briefs. You can restore or permanently remove records here.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <Input
              placeholder="Search archive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 h-9 w-48 sm:w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchArchived} className="h-9 px-3 text-xs">
            <RefreshCw className={\`w-3.5 h-3.5 \${loading ? 'animate-spin' : ''}\`} />
          </Button>
        </div>
      </div>

      {/* Archived Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-zinc-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          <span>Loading client archive vault...</span>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-zinc-200 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">{client.company || client.name}</h3>
                    <p className="text-xs text-zinc-500">{client.name} • {client.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/80">
                    Archived
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
                  <p className="text-[11px] text-zinc-500">
                    Archived on: <strong>{client.archived_at ? new Date(client.archived_at).toLocaleDateString() : 'Historical Archive'}</strong>
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Service Tier: <span className="capitalize">{client.service_category?.replace(/_/g, ' ') || 'Retainer'}</span>
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    AI Project Brief: <strong>{client.brief ? 'Saved in Vault' : 'Not generated'}</strong>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setActiveClient(client);
                      setIsCommOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-emerald-50 text-zinc-600 hover:text-emerald-700 transition-colors cursor-pointer"
                    title="Communication History"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveClient(client);
                      setIsAuditOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-blue-50 text-zinc-600 hover:text-blue-700 transition-colors cursor-pointer"
                    title="Work Audit Log"
                  >
                    <History className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(client)}
                    disabled={restoringId === client.id}
                    className="h-8 px-3 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold"
                  >
                    {restoringId === client.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    )}
                    Restore
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteCandidate(client)}
                    className="h-8 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Archive className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-zinc-900">Archive Vault is Empty</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No clients are currently archived. When you archive completed or inactive clients from the Clients Directory, they will safely reside here.
          </p>
          <Link href="/clients">
            <Button size="sm" className="text-xs bg-zinc-900 hover:bg-black text-white font-semibold mt-2">
              Back to Clients Directory
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Permanently Confirmation Modal */}
      <Dialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Permanently Delete Client?"
        description="Irreversible database deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <p className="text-xs text-rose-900 leading-relaxed">
              Are you sure you want to permanently delete <strong>{deleteCandidate?.company || deleteCandidate?.name}</strong>? All associated questionnaire responses, uploads, checklist items, and project briefs will be deleted permanently. This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button variant="ghost" onClick={() => setDeleteCandidate(null)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleDeletePermanently}
              disabled={deleting}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Trash2 className="w-3.5 h-3.5 mr-1" />}
              Delete Permanently
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Modals */}
      <ClientCommunicationModal
        isOpen={isCommOpen}
        onClose={() => setIsCommOpen(false)}
        client={activeClient}
      />
      <ClientWorkAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        client={activeClient}
      />
    </div>
  );
}
`;

fs.writeFileSync('app/(dashboard)/archive/page.tsx', content, 'utf8');
console.log('Written: app/(dashboard)/archive/page.tsx');
