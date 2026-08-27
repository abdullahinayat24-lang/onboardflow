'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ClientWithDetails } from '@/types';
import { Button } from '@/components/ui/button';
import { getStatusBadgeVariant } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import {
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Share2,
  Mail,
  ArrowLeft,
} from 'lucide-react';

interface ClientDetailHeaderProps {
  client: ClientWithDetails;
  onRefresh?: () => void;
}

export function ClientDetailHeader({ client, onRefresh }: ClientDetailHeaderProps) {
  const { success, error } = useToast();
  const [copied, setCopied] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  const badge = getStatusBadgeVariant(client.status);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const onboardingUrl = `${origin}/onboard/${client.onboarding_token}`;
  const sharePackageUrl = `${origin}/package/${client.package_share_token}`;

  const handleCopyOnboardingLink = () => {
    navigator.clipboard.writeText(onboardingUrl);
    setCopied(true);
    success('Copied!', 'Client onboarding link copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendReminder = async () => {
    setIsSendingReminder(true);
    try {
      const res = await fetch(`/api/clients/${client.id}/reminder`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reminder');
      success('Reminder Sent!', `Sent email nudge to ${client.email}`);
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error sending reminder';
      error('Failed to send reminder', msg);
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleGenerateAIBrief = async () => {
    setIsGeneratingBrief(true);
    try {
      const res = await fetch('/api/ai/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate brief');
      success('AI Brief Generated!', 'Executive summary and project brief are ready for review.');
      if (onRefresh) onRefresh();
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating brief';
      error('Generation error', msg);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Clients Directory
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {client.name}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
              {badge.label}
            </span>
          </div>

          <p className="text-xs text-zinc-500 mt-1">
            {client.company ? <strong className="text-zinc-700 dark:text-zinc-300">{client.company} &bull; </strong> : null}
            {client.email} &bull; Onboarding Link Token: <span className="font-mono text-zinc-600 dark:text-zinc-400">{client.onboarding_token.substring(0, 10)}...</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyOnboardingLink}
            className="text-xs gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Onboarding Link'}
          </Button>

          <a href={onboardingUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              Preview Client Flow
            </Button>
          </a>

          <a href={sharePackageUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm" className="text-xs gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              Handoff Package
            </Button>
          </a>

          {client.status !== 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendReminder}
              isLoading={isSendingReminder}
              className="text-xs gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              Send Reminder
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleGenerateAIBrief}
            isLoading={isGeneratingBrief}
            className="text-xs gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {client.brief ? 'Regenerate AI Brief' : 'Generate AI Brief'}
          </Button>
        </div>
      </div>
    </div>
  );
}
