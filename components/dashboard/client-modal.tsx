'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { QuestionnaireTemplate, ChecklistTemplate, Client } from '@/types';
import { Copy, Check, Send, Sparkles } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaireTemplates: QuestionnaireTemplate[];
  checklistTemplates: ChecklistTemplate[];
  onClientCreated?: (client: Client) => void;
}

export function ClientModal({
  isOpen,
  onClose,
  questionnaireTemplates,
  checklistTemplates,
  onClientCreated,
}: ClientModalProps) {
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [questionnaireTemplateId, setQuestionnaireTemplateId] = useState<string>(
    questionnaireTemplates[0]?.id || ''
  );
  const [checklistTemplateId, setChecklistTemplateId] = useState<string>(
    checklistTemplates[0]?.id || ''
  );
  const [sendInvite, setSendInvite] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [createdClient, setCreatedClient] = useState<Client | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      error('Missing fields', 'Client name and email are required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company: company || undefined,
          questionnaire_template_id: questionnaireTemplateId || null,
          checklist_template_id: checklistTemplateId || null,
          send_invitation_email: sendInvite,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create client');
      }

      setCreatedClient(data.client);
      success('Client Created!', `Onboarding link generated for ${name}`);
      if (onClientCreated) onClientCreated(data.client);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating client';
      error('Failed to create client', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdClient) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/onboard/${createdClient.onboarding_token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    success('Copied!', 'Onboarding link copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setCompany('');
    setCreatedClient(null);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleReset}
      title={createdClient ? 'Client Onboarding Ready 🎉' : 'Create New Client'}
      description={
        createdClient
          ? 'Share this unique branded onboarding link with your client or let OnboardFlow email it directly.'
          : 'Generate a branded, token-secured onboarding link for your new client.'
      }
    >
      {createdClient ? (
        <div className="space-y-5 pt-2">
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Branded Onboarding URL
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/onboard/${createdClient.onboarding_token}`}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-200 truncate focus:outline-none"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0 gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="text-xs text-zinc-500 space-y-1.5 bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40">
            <p className="font-semibold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              What happens next?
            </p>
            <p>1. Client opens the link (no login needed).</p>
            <p>2. Fills out intake questionnaire & uploads assets.</p>
            <p>3. AI automatically drafts your team&apos;s project brief.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="primary" onClick={handleReset}>
              Done & View Client
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Client Name <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              type="email"
              placeholder="sarah@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Company / Organization (Optional)
            </label>
            <Input
              placeholder="Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Questionnaire Template
              </label>
              <select
                value={questionnaireTemplateId}
                onChange={(e) => setQuestionnaireTemplateId(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {questionnaireTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} {t.is_default ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Checklist Template
              </label>
              <select
                value={checklistTemplateId}
                onChange={(e) => setChecklistTemplateId(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {checklistTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} {t.is_default ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="sendInvite"
              checked={sendInvite}
              onChange={(e) => setSendInvite(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <label htmlFor="sendInvite" className="text-xs text-zinc-600 dark:text-zinc-400 select-none">
              Automatically send branded invitation email to client via Resend
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Create & Generate Link
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
