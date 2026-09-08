'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Star,
  FileText,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  CheckCircle2,
  Send,
  Building2,
  Mail,
  ArrowUpRight,
} from 'lucide-react';
import { ClientWithDetails, ServiceCategory, Client } from '@/types';
import { useToast } from '@/components/ui/toast';
import { Progress } from '@/components/ui/progress';
import { getStatusBadgeVariant, formatDate } from '@/lib/utils';

export type RightPanelTab = 'add' | 'starred' | 'details';

interface RightShortcutPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: RightPanelTab;
  onTabChange: (tab: RightPanelTab) => void;
  clients: ClientWithDetails[];
  selectedClient: ClientWithDetails | null;
  onSelectClient: (client: ClientWithDetails | null) => void;
  onClientCreated: (client: Client) => void;
  onToggleStar: (clientId: string) => void;
}

export function RightShortcutPanel({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  clients,
  selectedClient,
  onSelectClient,
  onClientCreated,
  onToggleStar,
}: RightShortcutPanelProps) {
  const { success, error } = useToast();

  // Quick Add Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('social_media');
  const [templateId, setTemplateId] = useState('tpl_social_media');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);
  const [createdClientSuccess, setCreatedClientSuccess] = useState<Client | null>(null);

  const starredClients = clients.filter((c) => c.is_starred);

  const handleCopyLink = (token: string, clientId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/onboard/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedClientId(clientId);
    success('Copied!', 'Onboarding link copied to clipboard');
    setTimeout(() => setCopiedClientId(null), 2500);
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      error('Missing Information', 'Client name and email are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || null,
          service_category: serviceCategory,
          questionnaire_template_id: templateId,
          checklist_template_id: 'demo-c-001',
          send_invitation_email: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create client');
      }

      const newClient = data.client;
      onClientCreated(newClient);
      setCreatedClientSuccess(newClient);

      // Automatically copy link to clipboard for ultra-fast workflow
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${origin}/onboard/${newClient.onboarding_token}`;
      navigator.clipboard.writeText(url);
      success('Client Created & Link Copied!', 'Ready to share with client immediately.');

      // Clear inputs
      setName('');
      setEmail('');
      setCompany('');
    } catch (err: any) {
      error('Error', err.message || 'Could not create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceOptions: {
    id: ServiceCategory;
    templateId: string;
    label: string;
  }[] = [
    { id: 'social_media', templateId: 'tpl_social_media', label: 'Social Media & Content' },
    { id: 'accounting', templateId: 'tpl_accounting', label: 'Accounting & Tax Filing' },
    { id: 'supplier_vendor', templateId: 'tpl_supplier', label: 'Supplier Procurement' },
    { id: 'brand_design', templateId: 'tpl_branding', label: 'Brand Design & Artwork' },
    { id: 'video_production', templateId: 'tpl_video', label: 'Video & Reels Editing' },
    { id: 'web_dev', templateId: 'tpl_web', label: 'Web & Digital Dev' },
  ];

  return (
    <div className="flex shrink-0 z-30 h-screen sticky top-0">
      {/* Expanded Panel (Like Gmail Tasks / Keep drawer) */}
      {isOpen && (
        <aside className="w-80 md:w-88 lg:w-96 bg-white border-l border-zinc-200 shadow-xl flex flex-col h-full overflow-hidden transition-all duration-200">
          {/* Panel Header */}
          <div className="h-14 px-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
            <div className="flex items-center gap-2">
              {activeTab === 'add' && (
                <>
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserPlus className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-sm text-zinc-800">Quick Add Client</span>
                </>
              )}
              {activeTab === 'starred' && (
                <>
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  </div>
                  <span className="font-semibold text-sm text-zinc-800">
                    Starred Clients ({starredClients.length})
                  </span>
                </>
              )}
              {activeTab === 'details' && (
                <>
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-sm text-zinc-800 truncate max-w-[180px]">
                    {selectedClient ? selectedClient.name : 'Client Details'}
                  </span>
                </>
              )}
            </div>

            <button
              onClick={onToggle}
              className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-500 transition-colors"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: QUICK ADD CLIENT */}
            {activeTab === 'add' && (
              <div className="space-y-4">
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-800">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Instant Client Intake
                  </p>
                  <p className="text-blue-700/80 mt-0.5 text-[11px] leading-relaxed">
                    Create a client in 5 seconds. Onboarding link is copied to your clipboard immediately!
                  </p>
                </div>

                {createdClientSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Client Created &amp; Link Ready!
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      {createdClientSuccess.name} ({createdClientSuccess.email})
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() =>
                          handleCopyLink(
                            createdClientSuccess.onboarding_token,
                            createdClientSuccess.id
                          )
                        }
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        Copy Link
                      </button>
                      <a
                        href={`/onboard/${createdClientSuccess.onboarding_token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded text-xs font-medium flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open Demo
                      </a>
                    </div>
                  </div>
                )}

                <form onSubmit={handleQuickAdd} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Client Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Miller"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Client Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Company / Brand Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Ventures"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Service / Intake Workflow
                    </label>
                    <select
                      value={serviceCategory}
                      onChange={(e) => {
                        const cat = e.target.value as ServiceCategory;
                        setServiceCategory(cat);
                        const match = serviceOptions.find((o) => o.id === cat);
                        if (match) setTemplateId(match.templateId);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-zinc-800"
                    >
                      {serviceOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {isSubmitting ? (
                      <span className="inline-block animate-spin">⏳</span>
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Create Client &amp; Copy Link
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: STARRED CLIENTS */}
            {activeTab === 'starred' && (
              <div className="space-y-3">
                {starredClients.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                    <Star className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-xs font-medium text-zinc-600">No Starred Clients</p>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                      Click the star icon (⭐) next to any client in the table to pin them here for quick access.
                    </p>
                  </div>
                ) : (
                  starredClients.map((client) => {
                    const badge = getStatusBadgeVariant(client.status);
                    const percent = client.completion_percentage || 0;
                    const isSelected = selectedClient?.id === client.id;

                    return (
                      <div
                        key={client.id}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/50 border-blue-300 shadow-xs'
                            : 'bg-white border-zinc-200 hover:border-blue-200 hover:bg-zinc-50/70'
                        }`}
                        onClick={() => {
                          onSelectClient(client);
                          onTabChange('details');
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-semibold text-xs text-zinc-900 truncate">
                                {client.name}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleStar(client.id);
                                }}
                                className="text-amber-500 hover:text-zinc-400 transition-colors cursor-pointer"
                                title="Unstar client"
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                              </button>
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                              {client.company ? `${client.company} • ` : ''}
                              {client.email}
                            </p>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
                          >
                            {badge.label}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                              <span>Intake</span>
                              <span>{percent}%</span>
                            </div>
                            <Progress value={percent} className="h-1.5" />
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(client.onboarding_token, client.id);
                            }}
                            className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                            title="Copy link"
                          >
                            {copiedClientId === client.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 3: CLIENT DETAILS INSPECTOR */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                {!selectedClient ? (
                  <div className="text-center py-10 px-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                    <FileText className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-xs font-medium text-zinc-600">No Client Selected</p>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                      Click any client row in the table to inspect their intake status, onboarding links, and checklist items here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Header Card */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-zinc-900">
                            {selectedClient.name}
                          </h3>
                          {selectedClient.company && (
                            <p className="text-xs text-zinc-600 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-zinc-400" />
                              {selectedClient.company}
                            </p>
                          )}
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-zinc-400" />
                            {selectedClient.email}
                          </p>
                        </div>

                        <button
                          onClick={() => onToggleStar(selectedClient.id)}
                          className="p-1 rounded-md hover:bg-zinc-200 transition-colors cursor-pointer"
                          title={selectedClient.is_starred ? 'Starred' : 'Star client'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              selectedClient.is_starred
                                ? 'text-amber-500 fill-amber-400'
                                : 'text-zinc-400 hover:text-amber-500'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            getStatusBadgeVariant(selectedClient.status).bgClass
                          } ${getStatusBadgeVariant(selectedClient.status).textClass}`}
                        >
                          {getStatusBadgeVariant(selectedClient.status).label}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Added {formatDate(selectedClient.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Onboarding Link Share Box */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-2">
                      <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                        <span>Onboarding Portal Link</span>
                        <span className="text-[10px] text-emerald-600 font-normal">Active &amp; Ready</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          readOnly
                          value={
                            typeof window !== 'undefined'
                              ? `${window.location.origin}/onboard/${selectedClient.onboarding_token}`
                              : `/onboard/${selectedClient.onboarding_token}`
                          }
                          className="flex-1 bg-zinc-50 text-[11px] text-zinc-600 px-2.5 py-1.5 rounded-lg border border-zinc-200 font-mono select-all truncate"
                        />
                        <button
                          onClick={() =>
                            handleCopyLink(
                              selectedClient.onboarding_token,
                              selectedClient.id
                            )
                          }
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium flex items-center justify-center cursor-pointer transition-colors shrink-0"
                          title="Copy link"
                        >
                          {copiedClientId === selectedClient.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={`/onboard/${selectedClient.onboarding_token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs flex items-center justify-center transition-colors shrink-0"
                          title="Open onboarding page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Progress Overview */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-700">Intake Progress</span>
                        <span className="font-bold text-zinc-900">
                          {selectedClient.completion_percentage || 0}%
                        </span>
                      </div>
                      <Progress
                        value={selectedClient.completion_percentage || 0}
                        className="h-2"
                      />
                    </div>

                    {/* Quick Checklist Snapshot */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-2">
                      <span className="text-xs font-semibold text-zinc-700 block">
                        Checklist Milestone Status
                      </span>
                      <div className="space-y-1.5">
                        {(selectedClient.checklist_status && selectedClient.checklist_status.length > 0
                          ? selectedClient.checklist_status
                          : [
                              { id: '1', checklist_item_id: 'c1', is_completed: true, item: { label: 'Intake Questionnaire Submitted' } },
                              { id: '2', checklist_item_id: 'c2', is_completed: selectedClient.status === 'completed', item: { label: 'Signed Contract / Engagement Letter' } },
                              { id: '3', checklist_item_id: 'c3', is_completed: selectedClient.status === 'completed', item: { label: 'Brand Assets & Media Uploaded' } },
                            ]
                        ).map((chk: any, idx: number) => (
                          <div
                            key={chk.id || idx}
                            className="flex items-center gap-2 text-xs text-zinc-700 py-1 border-b border-zinc-50 last:border-0"
                          >
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                chk.is_completed
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'bg-zinc-100 text-zinc-400'
                              }`}
                            >
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                            <span
                              className={`truncate text-[11px] ${
                                chk.is_completed ? 'line-through text-zinc-400' : 'text-zinc-700'
                              }`}
                            >
                              {chk.item?.label || `Milestone #${idx + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Project Brief Preview */}
                    <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          AI Kickoff Brief
                        </span>
                        {selectedClient.brief ? (
                          <span className="text-[10px] bg-purple-200/80 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                            Generated
                          </span>
                        ) : (
                          <span className="text-[10px] text-purple-500 font-medium">
                            Pending Intake
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-purple-800/80 line-clamp-2">
                        {selectedClient.brief?.ai_summary ||
                          'AI automatically compiles questionnaire answers into a kickoff brief for your agency team.'}
                      </p>
                    </div>

                    {/* Action Button: Full Page */}
                    <Link
                      href={`/clients/${selectedClient.id}`}
                      className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Open Full Client Workspace</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Far Right Icon Rail (Gmail style - Calendar, Keep, Tasks strip) */}
      <div className="w-13 border-l border-zinc-200 bg-white flex flex-col items-center py-3 gap-2 shrink-0">
        {/* Quick Add Client Button */}
        <button
          onClick={() => {
            if (!isOpen) onToggle();
            onTabChange('add');
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isOpen && activeTab === 'add'
              ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500/30'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
          title="Quick Add Client"
        >
          <UserPlus className="w-4 h-4" />
        </button>

        {/* Starred Clients Button */}
        <button
          onClick={() => {
            if (!isOpen) onToggle();
            onTabChange('starred');
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative cursor-pointer ${
            isOpen && activeTab === 'starred'
              ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-500/30'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
          title={`Starred Clients (${starredClients.length})`}
        >
          <Star className={`w-4 h-4 ${starredClients.length > 0 ? 'fill-amber-400 text-amber-500' : ''}`} />
          {starredClients.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        {/* Client Details Button */}
        <button
          onClick={() => {
            if (!isOpen) onToggle();
            onTabChange('details');
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isOpen && activeTab === 'details'
              ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-500/30'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
          title="Inspect Client Details"
        >
          <FileText className="w-4 h-4" />
        </button>

        <div className="w-5 h-px bg-zinc-200 my-1" />

        {/* Toggle Panel Chevron */}
        <button
          onClick={onToggle}
          className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          title={isOpen ? 'Collapse panel' : 'Expand panel'}
        >
          {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
