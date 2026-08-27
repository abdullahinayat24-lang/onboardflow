import React from 'react';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { localStore } from '@/lib/store';
import {
  Sparkles,
  Download,
  FileText,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { formatFileSize, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SharePackagePageProps {
  params: Promise<{ shareToken: string }>;
}

export default async function SharePackagePage({ params }: SharePackagePageProps) {
  const { shareToken } = await params;
  const supabase = createAdminClient();

  let client: any = null;

  try {
    const { data: dbClient } = await supabase
      .from('clients')
      .select(`
        *,
        agency:agencies(*),
        brief:project_briefs(*),
        uploads(*)
      `)
      .eq('package_share_token', shareToken)
      .single();
    if (dbClient) client = dbClient;
  } catch {
    // Offline
  }

  if (!client) {
    const localClient = localStore.getClientByShareToken(shareToken);
    if (localClient) {
      client = localStore.getClientWithDetails(localClient.id);
    }
  }

  if (!client) {
    if (shareToken.startsWith('pkg_demo') || shareToken.startsWith('pkg_')) {
      const demoClient = localStore.getClientWithDetails('client_demo_101');
      if (demoClient) client = demoClient;
    }
  }

  if (!client) {
    return notFound();
  }

  const agency = client.agency || localStore.agency;
  const brief = client.brief;
  const uploads = client.uploads || [];
  const contracts = uploads.filter((u: any) => u.category === 'contract');
  const assets = uploads.filter((u: any) => u.category !== 'contract');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 print:bg-white print:text-black py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top bar with Print/Handoff button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Project Handoff Package
              </h1>
              <p className="text-xs text-zinc-500">
                Prepared by {agency?.name || 'Agency'} for the project delivery team
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Client & Project Overview Metadata Header */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                Verified Kickoff Package
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2 tracking-tight">
                {client.name} {client.company ? `(${client.company})` : ''}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Client Contact: {client.email} &bull; Onboarding Status:{' '}
                <span className="capitalize font-semibold text-zinc-800 dark:text-zinc-200">{client.status}</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold text-zinc-400">AGENCY PARTNER</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{agency?.name}</p>
            </div>
          </div>

          {/* AI Executive Summary */}
          {brief?.ai_summary && (
            <div className="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
              <h3 className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Executive Summary
              </h3>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                {brief.ai_summary}
              </p>
            </div>
          )}
        </div>

        {/* Structured Project Brief Document */}
        {brief?.ai_brief && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              Detailed Project Scope & Execution Plan
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed bg-transparent p-0">
                {brief.ai_brief}
              </pre>
            </div>
          </div>
        )}

        {/* Uploaded Files & Signed Contracts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contracts */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Signed Agreements ({contracts.length})
            </h3>
            {contracts.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No contract files attached</p>
            ) : (
              <div className="space-y-2">
                {contracts.map((c: any) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {c.filename}
                      </p>
                      <p className="text-[10px] text-zinc-400">{formatFileSize(c.file_size)}</p>
                    </div>
                    <a href={c.file_url} target="_blank" rel="noreferrer" download>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brand Assets */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Brand Assets & Deliverables ({assets.length})
            </h3>
            {assets.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No additional asset files</p>
            ) : (
              <div className="space-y-2">
                {assets.map((a: any) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {a.filename}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {formatFileSize(a.file_size)} &bull; {a.category}
                      </p>
                    </div>
                    <a href={a.file_url} target="_blank" rel="noreferrer" download>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-xs text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
          Generated automatically by OnboardFlow for {agency?.name} &bull; Confidential
        </div>
      </div>
    </div>
  );
}
