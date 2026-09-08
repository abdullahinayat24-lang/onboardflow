'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ClientWithDetails } from '@/types';
import { getStatusBadgeVariant, formatDate } from '@/lib/utils';
import {
  Copy,
  Check,
  Sparkles,
  FileText,
  ChevronRight,
  Star,
  PanelRight,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/toast';

interface ClientTableProps {
  clients: ClientWithDetails[];
  selectedClientId?: string | null;
  onSelectClient?: (client: ClientWithDetails) => void;
  onToggleStar?: (clientId: string) => void;
}

export function ClientTable({
  clients,
  selectedClientId,
  onSelectClient,
  onToggleStar,
}: ClientTableProps) {
  const { success } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, token: string, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/onboard/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    success('Copied!', 'Onboarding link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (clients.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center bg-white">
        <FileText className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-zinc-900">No clients found</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
          Create your first client or star high-priority clients to track them here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-600">
          <thead className="border-b border-zinc-200 bg-[#f8fafc] font-semibold text-zinc-600 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3 w-10 text-center">
                <span className="sr-only">Star</span>
              </th>
              <th className="py-3.5 px-4">Client / Company</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 min-w-[130px]">Onboarding Progress</th>
              <th className="py-3.5 px-4">AI Kickoff Brief</th>
              <th className="py-3.5 px-4">Added</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80">
            {clients.map((client) => {
              const badge = getStatusBadgeVariant(client.status);
              const percent = client.completion_percentage || 0;
              const hasBrief = !!client.brief;
              const isSelected = selectedClientId === client.id;
              const isStarred = !!client.is_starred;

              return (
                <tr
                  key={client.id}
                  className={`transition-colors group cursor-pointer ${
                    isSelected
                      ? 'bg-[#edf2fa]'
                      : 'hover:bg-[#f2f6fc]'
                  }`}
                  onClick={() => {
                    if (onSelectClient) {
                      onSelectClient(client);
                    }
                  }}
                >
                  {/* Gmail Star Column */}
                  <td
                    className="py-4 pl-4 pr-1 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleStar) onToggleStar(client.id);
                    }}
                  >
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-zinc-200/70 transition-colors cursor-pointer"
                      title={isStarred ? 'Unstar client' : 'Star client'}
                    >
                      <Star
                        className={`w-4 h-4 transition-all ${
                          isStarred
                            ? 'text-amber-500 fill-amber-400 scale-105'
                            : 'text-zinc-300 hover:text-amber-400'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Client & Company */}
                  <td className="py-4 px-4">
                    <div className="font-semibold text-zinc-900 text-sm flex items-center gap-2">
                      <span>{client.name}</span>
                      {client.service_category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-normal">
                          {client.service_category.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-400 flex items-center gap-1.5 mt-0.5 text-xs">
                      {client.company ? (
                        <span className="text-zinc-600 font-medium">{client.company} &bull;</span>
                      ) : null}
                      <span>{client.email}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                      {badge.label}
                    </span>
                  </td>

                  {/* Progress */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                      <span className="text-zinc-700">{percent}% complete</span>
                    </div>
                    <Progress
                      value={percent}
                      indicatorColor={
                        percent === 100
                          ? 'bg-emerald-500'
                          : percent > 40
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }
                      className="h-1.5"
                    />
                  </td>

                  {/* AI Kickoff Brief */}
                  <td className="py-4 px-4">
                    {hasBrief ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        {client.brief?.status === 'final' ? 'Final Brief' : 'Draft Brief'}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-xs">Pending intake</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-zinc-400 text-xs whitespace-nowrap">
                    {formatDate(client.created_at)}
                  </td>

                  {/* Quick Action Bar (Gmail style hover actions) */}
                  <td className="py-4 px-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Copy Link Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleCopy(e, client.onboarding_token, client.id)}
                        className="h-7 text-xs px-2.5 gap-1 text-zinc-700 hover:text-blue-600 hover:border-blue-300 rounded-lg cursor-pointer"
                        title="Copy branded onboarding URL"
                      >
                        {copiedId === client.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">Link</span>
                      </Button>

                      {/* Inspect in Side Panel */}
                      {onSelectClient && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onSelectClient(client)}
                          className="h-7 w-7 p-0 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Inspect in right side panel"
                        >
                          <PanelRight className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {/* Open Full Workspace */}
                      <Link href={`/clients/${client.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-900 rounded-lg cursor-pointer"
                          title="Open full client page"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

