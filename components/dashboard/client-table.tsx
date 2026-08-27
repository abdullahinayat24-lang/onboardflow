'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ClientWithDetails } from '@/types';
import { getStatusBadgeVariant, formatDate } from '@/lib/utils';
import { Copy, Check, ExternalLink, Sparkles, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/toast';

interface ClientTableProps {
  clients: ClientWithDetails[];
}

export function ClientTable({ clients }: ClientTableProps) {
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
      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/30">
        <FileText className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">No clients found</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
          Create your first client to generate a branded onboarding link and test the automated flow.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
          <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4 sm:px-6">Client / Company</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 min-w-[140px]">Onboarding Progress</th>
              <th className="py-3.5 px-4">AI Brief</th>
              <th className="py-3.5 px-4">Created</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {clients.map((client) => {
              const badge = getStatusBadgeVariant(client.status);
              const percent = client.completion_percentage || 0;
              const hasBrief = !!client.brief;

              return (
                <tr
                  key={client.id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                  onClick={() => {
                    window.location.href = `/clients/${client.id}`;
                  }}
                >
                  <td className="py-4 px-4 sm:px-6">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                      {client.name}
                    </div>
                    <div className="text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      {client.company ? <span>{client.company} &bull;</span> : null}
                      <span>{client.email}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                      {badge.label}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                      <span className="text-zinc-800 dark:text-zinc-200">{percent}% complete</span>
                    </div>
                    <Progress
                      value={percent}
                      indicatorColor={
                        percent === 100
                          ? 'bg-emerald-500'
                          : percent > 40
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }
                    />
                  </td>

                  <td className="py-4 px-4">
                    {hasBrief ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        {client.brief?.status === 'final' ? 'Final Brief' : 'Draft Brief'}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-xs">Pending intake</span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-zinc-400">
                    {formatDate(client.created_at)}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleCopy(e, client.onboarding_token, client.id)}
                        className="h-7 text-xs px-2 gap-1 text-zinc-600 hover:text-zinc-900"
                        title="Copy branded onboarding URL"
                      >
                        {copiedId === client.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">Link</span>
                      </Button>

                      <Link href={`/clients/${client.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
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
