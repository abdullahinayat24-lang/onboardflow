'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Folder,
  MapPin,
  Tag,
  CheckSquare,
  Building2,
  History,
  TrendingUp,
  Edit,
  Calendar,
  Archive,
  User,
  ShieldCheck,
} from 'lucide-react';
import { ClientWithDetails } from '@/types';
import {
  ClientCommunicationModal,
  ClientAssetsModal,
  ClientLocal3kmModal,
  ClientVouchersModal,
  ClientTasksModal,
  ClientBranchesModal,
  ClientWorkAuditModal,
  ClientCampaignsModal,
  ClientEditModal,
  ClientCalendarModal,
  ClientArchiveModal,
} from '@/components/dashboard/client-action-modals';

interface ClientCardGridProps {
  clients: ClientWithDetails[];
  onToggleStar: (id: string) => void;
  onClientUpdated?: (client: ClientWithDetails) => void;
  onClientArchived?: (id: string) => void;
}

export function ClientCardGrid({
  clients,
  onToggleStar,
  onClientUpdated,
  onClientArchived,
}: ClientCardGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active modal client state
  const [activeClient, setActiveClient] = useState<ClientWithDetails | null>(null);
  const [modalType, setModalType] = useState<
    | 'comm'
    | 'assets'
    | 'local'
    | 'vouchers'
    | 'tasks'
    | 'branches'
    | 'audit'
    | 'campaigns'
    | 'edit'
    | 'calendar'
    | 'archive'
    | null
  >(null);

  const handleCopyLink = (c: ClientWithDetails) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/onboard/${c.onboarding_token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openAction = (
    c: ClientWithDetails,
    type: 'comm' | 'assets' | 'local' | 'vouchers' | 'tasks' | 'branches' | 'audit' | 'campaigns' | 'edit' | 'calendar' | 'archive'
  ) => {
    setActiveClient(c);
    setModalType(type);
  };

  const getStatusBadge = (status: string, projectStatus?: string) => {
    if (projectStatus === 'ready_for_project' || status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Ready for Project
        </span>
      );
    }
    if (status === 'in_progress') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
        Invited
      </span>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {clients.map((client) => {
          const percent = client.completion_percentage ?? (client.status === 'completed' ? 100 : 35);
          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-zinc-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-4 pb-3 border-b border-zinc-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-zinc-900 truncate group-hover:text-emerald-700 transition-colors">
                        {client.company || client.name}
                      </h3>
                      <button
                        onClick={() => onToggleStar(client.id)}
                        className="text-zinc-300 hover:text-amber-400 transition-colors shrink-0"
                        title={client.is_starred ? 'Starred client' : 'Star client'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            client.is_starred ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      Contact: <span className="font-medium text-zinc-700">{client.name}</span>
                    </p>
                  </div>

                  <div className="shrink-0">{getStatusBadge(client.status, client.project_status)}</div>
                </div>

                {/* Progress Bar & Service Tier */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="font-medium capitalize text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200/50">
                      {client.service_category?.replace(/_/g, ' ') || 'Retainer Growth'}
                    </span>
                    <span className="font-bold text-zinc-700">{percent}% Complete</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-4 py-3 space-y-2 text-xs text-zinc-600 bg-zinc-50/50">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-zinc-500 truncate">
                    <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </span>
                  {client.phone && (
                    <span className="flex items-center gap-1 text-zinc-500 shrink-0">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      {client.phone}
                    </span>
                  )}
                </div>

                {/* Dedicated Manager & AI Brief Pill */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 text-[11px]">
                  <div className="flex items-center gap-1.5 text-zinc-600">
                    <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Manager: <strong>{client.manager?.name || 'Priya Patel'}</strong></span>
                  </div>
                  {client.brief ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <Sparkles className="w-3 h-3" /> Brief Ready
                    </span>
                  ) : (
                    <span className="text-zinc-400">Brief Pending</span>
                  )}
                </div>

                {/* Onboarding Wizard Portal Direct Action */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleCopyLink(client)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer"
                  >
                    {copiedId === client.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" /> Copied Intake Link
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-zinc-500" /> Copy Intake Link
                      </>
                    )}
                  </button>

                  <a
                    href={`/onboard/${client.onboarding_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shrink-0 cursor-pointer"
                    title="Open live onboarding wizard"
                  >
                    <ExternalLink className="w-3 h-3" /> Preview
                  </a>
                </div>
              </div>

              {/* The 11 Action Buttons Matrix (Reference Design Match) */}
              <div className="p-3 bg-white border-t border-zinc-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-1">
                  Operational Controls
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {/* 1. Communication */}
                  <button
                    onClick={() => openAction(client, 'comm')}
                    className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 hover:bg-emerald-50 border border-zinc-200/80 hover:border-emerald-300 text-zinc-700 hover:text-emerald-800 transition-all cursor-pointer group/btn"
                    title="Communication Hub"
                  >
                    <Mail className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-emerald-600 mb-0.5" />
                    <span className="text-[9px] font-medium leading-tight">Comm</span>
                  </button>

                  {/* 2. Assets & Drive */}
                  <button
                    onClick={() => openAction(client, 'assets')}
                    className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 hover:bg-blue-50 border border-zinc-200/80 hover:border-blue-300 text-zinc-700 hover:text-blue-800 transition-all cursor-pointer group/btn"
                    title="Assets & Drive Locker"
                  >
                    <Folder className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-blue-600 mb-0.5" />
                    <span className="text-[9px] font-medium leading-tight">Assets</span>
                  </button>

                  {/* 3. Local 3km */}
                  <button
                    onClick={() => openAction(client, 'local')}
                    className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 hover:bg-purple-50 border border-zinc-200/80 hover:border-purple-300 text-zinc-700 hover:text-purple-800 transition-all cursor-pointer group/btn"
                    title="Local 3km Geo-Grid"
                  >
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-purple-600 mb-0.5" />
                    <span className="text-[9px] font-medium leading-tight">3km Geo</span>
                  </button>

                  {/* 4. Vouchers */}
                  <button
                    onClick={() => openAction(client, 'vouchers')}
                    className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 hover:bg-amber-50 border border-zinc-200/80 hover:border-amber-300 text-zinc-700 hover:text-amber-800 transition-all cursor-pointer group/btn"
                    title="Vouchers & Loyalty Credits"
                  >
                    <Tag className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-amber-600 mb-0.5" />
                    <span className="text-[9px] font-medium leading-tight">Voucher</span>
                  </button>

                  {/* 5. Tasks */}
                  <button
                    onClick={() => openAction(client, 'tasks')}
                    className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 hover:bg-emerald-50 border border-zinc-200/80 hover:border-emerald-300 text-zinc-700 hover:text-emerald-800 transition-all cursor-pointer group/btn"
                    title="Client Linked Tasks"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-emerald-600 mb-0.5" />
                    <span className="text-[9px] font-medium leading-tight">Tasks</span>
                  </button>

                  {/* 6. Branches */}
                  <button
                    onClick={() => openAction(client, 'branches')}
                    className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 hover:bg-indigo-50 border border-zinc-200/80 hover:border-indigo-300 text-zinc-700 hover:text-indigo-800 transition-all cursor-pointer group/btn"
                    title="Location Branches"
                  >
                    <Building2 className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-indigo-600 mb-0.5" />
                    <span className="text-[9px] font-medium leading-tight">Branches</span>
                  </button>

                  {/* 7. Work Audit */}
                  <button
                    onClick={() => openAction(client, 'audit')}
                    className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 hover:bg-cyan-50 border border-zinc-200/80 hover:border-cyan-300 text-zinc-700 hover:text-cyan-800 transition-all cursor-pointer group/btn"
                    title="Work Audit Trail"
                  >
                    <History className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-cyan-600 mb-0.5" />
                    <span className="text-[9px] font-medium leading-tight">Audit</span>
                  </button>

                  {/* 8. Campaigns */}
                  <button
                    onClick={() => openAction(client, 'campaigns')}
                    className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 hover:bg-pink-50 border border-zinc-200/80 hover:border-pink-300 text-zinc-700 hover:text-pink-800 transition-all cursor-pointer group/btn"
                    title="Active Campaigns"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-pink-600 mb-0.5" />
                    <span className="text-[9px] font-medium leading-tight">Ads</span>
                  </button>

                  {/* 9. Edit */}
                  <button
                    onClick={() => openAction(client, 'edit')}
                    className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 hover:border-zinc-300 text-zinc-700 hover:text-zinc-900 transition-all cursor-pointer group/btn"
                    title="Edit Profile"
                  >
                    <Edit className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-zinc-800 mb-0.5" />
                    <span className="text-[9px] font-medium leading-tight">Edit</span>
                  </button>

                  {/* 10. Calendar */}
                  <button
                    onClick={() => openAction(client, 'calendar')}
                    className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 hover:bg-blue-50 border border-zinc-200/80 hover:border-blue-300 text-zinc-700 hover:text-blue-800 transition-all cursor-pointer group/btn"
                    title="Milestones Calendar"
                  >
                    <Calendar className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-blue-600 mb-0.5" />
                    <span className="text-[9px] font-medium leading-tight">Calendar</span>
                  </button>

                  {/* 11. Archive */}
                  <button
                    onClick={() => openAction(client, 'archive')}
                    className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 hover:bg-amber-50 border border-zinc-200/80 hover:border-amber-300 text-zinc-500 hover:text-amber-800 transition-all cursor-pointer group/btn col-span-2 sm:col-span-2"
                    title="Move to Archive Room"
                  >
                    <Archive className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-amber-600 mb-0.5" />
                    <span className="text-[9px] font-semibold leading-tight">Archive</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Modals */}
      <ClientCommunicationModal
        isOpen={modalType === 'comm'}
        onClose={() => setModalType(null)}
        client={activeClient}
      />
      <ClientAssetsModal
        isOpen={modalType === 'assets'}
        onClose={() => setModalType(null)}
        client={activeClient}
      />
      <ClientLocal3kmModal
        isOpen={modalType === 'local'}
        onClose={() => setModalType(null)}
        client={activeClient}
      />
      <ClientVouchersModal
        isOpen={modalType === 'vouchers'}
        onClose={() => setModalType(null)}
        client={activeClient}
      />
      <ClientTasksModal
        isOpen={modalType === 'tasks'}
        onClose={() => setModalType(null)}
        client={activeClient}
      />
      <ClientBranchesModal
        isOpen={modalType === 'branches'}
        onClose={() => setModalType(null)}
        client={activeClient}
      />
      <ClientWorkAuditModal
        isOpen={modalType === 'audit'}
        onClose={() => setModalType(null)}
        client={activeClient}
      />
      <ClientCampaignsModal
        isOpen={modalType === 'campaigns'}
        onClose={() => setModalType(null)}
        client={activeClient}
      />
      <ClientEditModal
        isOpen={modalType === 'edit'}
        onClose={() => setModalType(null)}
        client={activeClient}
        onClientUpdated={(up) => {
          if (onClientUpdated) onClientUpdated(up);
          setActiveClient(up);
        }}
      />
      <ClientCalendarModal
        isOpen={modalType === 'calendar'}
        onClose={() => setModalType(null)}
        client={activeClient}
      />
      <ClientArchiveModal
        isOpen={modalType === 'archive'}
        onClose={() => setModalType(null)}
        client={activeClient}
        onArchived={(id) => {
          if (onClientArchived) onClientArchived(id);
        }}
      />
    </>
  );
}
