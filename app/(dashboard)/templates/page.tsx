'use client';

import React, { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { QuestionnaireBuilder } from '@/components/templates/questionnaire-builder';
import { ChecklistBuilder } from '@/components/templates/checklist-builder';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { localStore } from '@/lib/store';
import {
  QuestionnaireTemplate,
  QuestionnaireQuestion,
  ChecklistTemplate,
  ChecklistTemplateItem,
  TemplateStepConfig,
  ServiceCategory,
} from '@/types';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  HelpCircle,
  Plus,
  Share2,
  FileSpreadsheet,
  PackageCheck,
  Palette,
  Scale,
  Sliders,
  Check,
} from 'lucide-react';

export default function TemplatesPage() {
  const { success, error, info } = useToast();
  const [allTemplates, setAllTemplates] = useState<QuestionnaireTemplate[]>(localStore.templates);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(localStore.templates[0].id);

  // Active template
  const currentTemplate =
    allTemplates.find((t) => t.id === activeTemplateId) || allTemplates[0];

  // AI Generator Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [industryPrompt, setIndustryPrompt] = useState('');
  const [industryDetails, setIndustryDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Step config for active template
  const stepConfig: TemplateStepConfig = currentTemplate.step_config || {
    enable_media_uploads: true,
    enable_contract_upload: true,
    enable_platform_access: true,
    enable_payment_step: true,
    media_upload_label: 'Brand Assets & Media',
    contract_upload_label: 'Signed Agreement & Contract',
  };

  const handleUpdateStepConfig = (key: keyof TemplateStepConfig, val: any) => {
    const updated = {
      ...currentTemplate,
      step_config: {
        ...stepConfig,
        [key]: val,
      },
    };
    setAllTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    localStore.addTemplate(updated);
    success('Step Settings Saved', 'Onboarding wizard steps updated for this template.');
  };

  const handleGenerateWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industryPrompt.trim()) return;

    setIsGenerating(true);
    info('AI Architect Active', `Drafting onboarding workflow for ${industryPrompt}...`);

    try {
      const res = await fetch('/api/ai/suggest-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: industryPrompt,
          details: industryDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      const newTpl: QuestionnaireTemplate = {
        id: `tpl_ai_${Date.now()}`,
        agency_id: 'demo-agency-001',
        title: data.template.title,
        description: data.template.description,
        service_category: data.template.service_category || 'general',
        step_config: data.template.step_config,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        questions: data.template.questions.map((q: any, idx: number) => ({
          id: `q_ai_${Date.now()}_${idx}`,
          template_id: `tpl_ai_${Date.now()}`,
          label: q.label,
          description: q.description || null,
          placeholder: q.placeholder || null,
          type: q.type || 'short_text',
          options: q.options || [],
          required: q.required !== false,
          order_index: idx + 1,
          created_at: new Date().toISOString(),
        })),
      };

      setAllTemplates((prev) => [newTpl, ...prev]);
      setActiveTemplateId(newTpl.id);
      localStore.addTemplate(newTpl);
      setIsAiModalOpen(false);
      setIndustryPrompt('');
      setIndustryDetails('');
      success('Template Created! 🎉', `AI generated ${newTpl.questions?.length} tailored questions and step rules.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating template';
      error('Generation Failed', msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryIcon = (category?: ServiceCategory) => {
    switch (category) {
      case 'social_media':
        return <Share2 className="w-4 h-4 text-pink-500" />;
      case 'accounting':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case 'supplier_vendor':
        return <PackageCheck className="w-4 h-4 text-blue-500" />;
      case 'brand_design':
        return <Palette className="w-4 h-4 text-purple-500" />;
      case 'legal_government':
        return <Scale className="w-4 h-4 text-amber-500" />;
      default:
        return <Layers className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div>
      <Header
        title="Onboarding Templates & AI Generator"
        description="Create, customize, and AI-generate tailored client workflows for any industry (Accounting, Suppliers, Social Media, etc.)"
      />

      <div className="p-8 space-y-8 max-w-6xl mx-auto">
        {/* Template Selector & AI Generation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-zinc-500" />
              Service & Industry Templates ({allTemplates.length})
            </h2>
            <p className="text-xs text-zinc-500">
              Select a template to customize questions and toggle required onboarding steps.
            </p>
          </div>

          <Button
            onClick={() => setIsAiModalOpen(true)}
            className="text-xs font-bold gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white cursor-pointer shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            ✨ Generate Template with AI
          </Button>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allTemplates.map((tpl) => {
            const isSelected = tpl.id === activeTemplateId;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setActiveTemplateId(tpl.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-zinc-900 bg-zinc-100/90 dark:border-zinc-100 dark:bg-zinc-800 ring-2 ring-zinc-900/10'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      {getCategoryIcon(tpl.service_category)}
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {tpl.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 line-clamp-2">{tpl.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>{tpl.questions?.length || 0} Questions</span>
                  <span>{tpl.step_config?.enable_media_uploads ? 'Media' : 'Docs only'}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Step Toggles & Customization Bar */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              Dynamic Wizard Steps for: <span className="text-zinc-900 dark:text-zinc-100">{currentTemplate.title}</span>
            </CardTitle>
            <p className="text-xs text-zinc-500">
              Toggle which steps your client sees. (e.g. Accountants & Suppliers only need document uploads without social media or video clutter).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Media Uploads Toggle */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 flex flex-col justify-between space-y-2">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Media & File Uploads
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {stepConfig.enable_media_uploads ? 'Active' : 'Disabled (No media needed)'}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-400">Step 3</span>
                  <input
                    type="checkbox"
                    checked={stepConfig.enable_media_uploads !== false}
                    onChange={(e) => handleUpdateStepConfig('enable_media_uploads', e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 cursor-pointer"
                  />
                </div>
              </div>

              {/* Signed Contract Toggle */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 flex flex-col justify-between space-y-2">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Agreement / Contract
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {stepConfig.enable_contract_upload ? 'Active (Upload PDF)' : 'Disabled'}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-400">Step 4</span>
                  <input
                    type="checkbox"
                    checked={stepConfig.enable_contract_upload !== false}
                    onChange={(e) => handleUpdateStepConfig('enable_contract_upload', e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 cursor-pointer"
                  />
                </div>
              </div>

              {/* Social Media & Cloud Access Locker */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 flex flex-col justify-between space-y-2">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Social & Platform Access
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {stepConfig.enable_platform_access ? 'Active (Instagram/Meta)' : 'Disabled (e.g. Accountants)'}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-400">Step 5</span>
                  <input
                    type="checkbox"
                    checked={stepConfig.enable_platform_access !== false}
                    onChange={(e) => handleUpdateStepConfig('enable_platform_access', e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 cursor-pointer"
                  />
                </div>
              </div>

              {/* Retainer Payment Step */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 flex flex-col justify-between space-y-2">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Deposit / Retainer Payment
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {stepConfig.enable_payment_step ? 'Active (Stripe)' : 'Disabled (Invoiced later)'}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-400">Step 6</span>
                  <input
                    type="checkbox"
                    checked={stepConfig.enable_payment_step !== false}
                    onChange={(e) => handleUpdateStepConfig('enable_payment_step', e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Custom Upload Labels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Custom Upload Title for Files
                </label>
                <Input
                  value={stepConfig.media_upload_label || ''}
                  onChange={(e) => handleUpdateStepConfig('media_upload_label', e.target.value)}
                  placeholder="e.g. Tax Documents & Financial Records OR Brand Assets"
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Custom Upload Title for Agreement
                </label>
                <Input
                  value={stepConfig.contract_upload_label || ''}
                  onChange={(e) => handleUpdateStepConfig('contract_upload_label', e.target.value)}
                  placeholder="e.g. Signed Engagement Letter OR NDA"
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Question Builder for the selected template */}
        <QuestionnaireBuilder
          key={currentTemplate.id}
          template={currentTemplate as any}
          onSaved={(updated) => {
            setAllTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            localStore.addTemplate(updated);
          }}
        />
      </div>

      {/* AI Generate Template Modal */}
      <Dialog
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="✨ Generate Onboarding Template with AI"
        description="Type any industry or company type. AI will create hyper-relevant questions, document checklists, and step rules automatically."
      >
        <form onSubmit={handleGenerateWithAI} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Industry or Company Type <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              placeholder="e.g. Accounting Firm, Overseas Apparel Supplier, Real Estate Brokerage, Dental Clinic"
              value={industryPrompt}
              onChange={(e) => setIndustryPrompt(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Special Requirements or Notes (Optional)
            </label>
            <Input
              placeholder="e.g. We need their Tax ID, previous year return, and monthly revenue. No videos needed."
              value={industryDetails}
              onChange={(e) => setIndustryDetails(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Quick Examples Badges */}
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 mb-1.5">Quick Inspiration Examples:</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Accounting & Tax Prep',
                'E-commerce Product Supplier',
                'Legal & NDA Compliance',
                'Real Estate Brokerage',
                'Video Production & Reels',
                'Fitness & Coaching',
              ].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setIndustryPrompt(ex)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                >
                  + {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAiModalOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white cursor-pointer font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Generate Workflow &rarr;
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
