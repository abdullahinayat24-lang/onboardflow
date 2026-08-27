'use client';

import React from 'react';
import { Agency, Client, ChecklistTemplateItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Clock, CheckCircle2, FileText, ArrowRight, Shield } from 'lucide-react';

interface WizardStepWelcomeProps {
  agency: Agency;
  client: Client;
  checklistItems: ChecklistTemplateItem[];
  onStart: () => void;
}

export function WizardStepWelcome({
  agency,
  client,
  checklistItems,
  onStart,
}: WizardStepWelcomeProps) {
  const brandColor = agency.brand_color || '#3B82F6';

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-6">
      <div className="text-center space-y-3">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-md overflow-hidden mb-4"
          style={{ backgroundColor: brandColor }}
        >
          {agency.logo_url ? (
            <img src={agency.logo_url} alt={agency.name} className="w-full h-full object-cover" />
          ) : (
            (agency.name || 'AG').substring(0, 2).toUpperCase()
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Welcome to {agency.name}!
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Hi <strong>{client.name}</strong>, we are excited to work with you. Let&apos;s get your project
          onboarding completed so our team can immediately start building your deliverables.
        </p>
      </div>

      <Card className="shadow-xs border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
            <Clock className="w-5 h-5 text-zinc-500 shrink-0" />
            <div className="text-xs text-zinc-700 dark:text-zinc-300">
              <strong className="text-zinc-900 dark:text-zinc-100">Estimated time: ~5 minutes.</strong>{' '}
              Your answers are automatically saved as you type. You can return anytime.
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              What We&apos;ll Collect Today:
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-100 block">
                    Project Intake Questionnaire
                  </strong>
                  Your goals, ideal audience, and key timeline requirements.
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-100 block">
                    Brand Assets & Media
                  </strong>
                  Logos, high-res photos, reference documents, or link folders.
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-100 block">
                    Signed Agreement / Contract
                  </strong>
                  Upload your signed service agreement or proposal document.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-center">
            <Button
              size="lg"
              onClick={onStart}
              className="w-full sm:w-auto px-8 gap-2 font-semibold shadow-md text-white"
              style={{ backgroundColor: brandColor }}
            >
              Start Onboarding
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5" />
        Secured token session &bull; No passwords required
      </p>
    </div>
  );
}
