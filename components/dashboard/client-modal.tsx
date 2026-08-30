'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { QuestionnaireTemplate, ChecklistTemplate, Client, ServiceCategory } from '@/types';
import {
  Copy,
  Check,
  Sparkles,
  Share2,
  Palette,
  Video,
  Globe,
  FileSpreadsheet,
  PackageCheck,
  Scale,
  Building,
  Phone,
} from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaireTemplates?: QuestionnaireTemplate[];
  checklistTemplates?: ChecklistTemplate[];
  onClientCreated?: (client: Client) => void;
}

export function ClientModal({
  isOpen,
  onClose,
  questionnaireTemplates = [],
  checklistTemplates = [],
  onClientCreated,
}: ClientModalProps) {
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('social_media');
  const [questionnaireTemplateId, setQuestionnaireTemplateId] = useState<string>('tpl_social_media');
  const [sendInvite, setSendInvite] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [createdClient, setCreatedClient] = useState<Client | null>(null);
  const [copied, setCopied] = useState(false);

  const serviceOptions: {
    id: ServiceCategory;
    templateId: string;
    label: string;
    icon: any;
    desc: string;
  }[] = [
    {
      id: 'social_media',
      templateId: 'tpl_social_media',
      label: 'Social Media & Content',
      icon: Share2,
      desc: 'Instagram, TikTok, Facebook posting & monthly calendar',
    },
    {
      id: 'accounting',
      templateId: 'tpl_accounting',
      label: 'Accounting & Tax Filing',
      icon: FileSpreadsheet,
      desc: 'P&L statements, tax returns & financial ledger setup',
    },
    {
      id: 'supplier_vendor',
      templateId: 'tpl_supplier',
      label: 'Supplier & Procurement',
      icon: PackageCheck,
      desc: 'MOQ, catalogs, lead times & vendor agreement',
    },
    {
      id: 'brand_design',
      templateId: 'tpl_branding',
      label: 'Brand Design & Artwork',
      icon: Palette,
      desc: 'Logos, vector illustration, style guides & colors',
    },
    {
      id: 'video_production',
      templateId: 'tpl_video',
      label: 'Video & Reel Editing',
      icon: Video,
      desc: 'Short-form Reels, TikToks & promotional video cuts',
    },
    {
      id: 'web_dev',
      templateId: 'tpl_web',
      label: 'Web & Digital Dev',
      icon: Globe,
      desc: 'Landing pages, web applications & CMS setup',
    },
  ];

  const handleSelectService = (service: typeof serviceOptions[0]) => {
    setServiceCategory(service.id);
    setQuestionnaireTemplateId(service.templateId);
  };

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
          service_category: serviceCategory,
          questionnaire_template_id: questionnaireTemplateId || 'tpl_social_media',
          checklist_template_id: 'demo-c-001',
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
    setWebsite('');
    setPhone('');
    setCreatedClient(null);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleReset}
      title={createdClient ? 'Client Onboarding Ready 🎉' : 'Create New Client Intake'}
      description={
        createdClient
          ? 'Share this unique branded onboarding link with your client or let OnboardFlow email it directly.'
          : 'Choose the service template and enter your client & company details.'
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
                className="shrink-0 gap-1.5 cursor-pointer"
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
            <p>1. Client opens the link without logging in.</p>
            <p>2. Fills out intake, uploads raw assets & gives platform access.</p>
            <p>3. AI automatically drafts your team&apos;s project brief.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="primary" onClick={handleReset} className="cursor-pointer">
              Done & View Client
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Service Category Template Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Select Service Intake Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {serviceOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = serviceCategory === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectService(opt)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-100/90 dark:border-zinc-100 dark:bg-zinc-800'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-zinc-500 line-clamp-1">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Client Contact Name <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Asif Dublin"
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
                placeholder="asif@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Company / Brand Name
              </label>
              <Input
                placeholder="Acme Apparel Ltd"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Company Website / URL
              </label>
              <Input
                type="url"
                placeholder="https://acme.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
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
            <Button type="button" variant="outline" onClick={handleReset} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="cursor-pointer">
              Create &amp; Generate Link
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
