'use client';

import React, { useState } from 'react';
import { Agency, QuestionnaireQuestion, ChecklistTemplateItem, Upload } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowLeft,
  Send,
  Loader2,
  Check,
} from 'lucide-react';

interface WizardStepReviewProps {
  agency: Agency;
  questions: QuestionnaireQuestion[];
  responses: Record<string, any>;
  uploads: Upload[];
  checklistItems: ChecklistTemplateItem[];
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function WizardStepReview({
  agency,
  questions,
  responses,
  uploads,
  checklistItems,
  onSubmit,
  onBack,
  isSubmitting,
}: WizardStepReviewProps) {
  const brandColor = agency.brand_color || '#3B82F6';

  const answeredQuestionsCount = questions.filter((q) => {
    const a = responses[q.id];
    return a && (typeof a !== 'string' || a.trim() !== '');
  }).length;

  const hasContract = uploads.some((u) => u.category === 'contract');
  const assetCount = uploads.filter((u) => u.category !== 'contract').length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Review & Complete Onboarding
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Review your deliverables before final submission to {agency.name}&apos;s team.
        </p>
      </div>

      {/* Review Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Questionnaire</p>
          </div>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {answeredQuestionsCount} / {questions.length}
          </p>
          <p className="text-[10px] text-zinc-400">Questions Answered</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Brand Assets</p>
          </div>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{assetCount}</p>
          <p className="text-[10px] text-zinc-400">Files Uploaded</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            {hasContract ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Circle className="w-4 h-4 text-amber-500" />
            )}
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Contract</p>
          </div>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {hasContract ? 'Signed' : 'Pending'}
          </p>
          <p className="text-[10px] text-zinc-400">
            {hasContract ? 'Ready for legal' : 'Upload optional'}
          </p>
        </div>
      </div>

      {/* Checklist items status */}
      <Card className="shadow-xs border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Intake Deliverables Verification
          </h3>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60">
              <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                Intake responses recorded ({answeredQuestionsCount} questions completed)
              </span>
            </div>

            {assetCount > 0 && (
              <div className="flex items-center gap-3 text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60">
                <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {assetCount} brand asset(s) and project file(s) attached
                </span>
              </div>
            )}

            {hasContract && (
              <div className="flex items-center gap-3 text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60">
                <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Signed contract and agreement uploaded
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="text-xs gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>

        <Button
          onClick={onSubmit}
          isLoading={isSubmitting}
          className="text-xs gap-2 font-semibold text-white px-8 shadow-md"
          style={{ backgroundColor: brandColor }}
        >
          <Send className="w-3.5 h-3.5" />
          Submit All & Finish Onboarding
        </Button>
      </div>
    </div>
  );
}
