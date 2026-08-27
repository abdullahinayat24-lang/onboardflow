'use client';

import React, { useState } from 'react';
import {
  Agency,
  Client,
  QuestionnaireQuestion,
  ChecklistTemplateItem,
  Upload,
  OnboardingWizardStep,
} from '@/types';
import { BrandingHeader } from './branding-header';
import { WizardStepWelcome } from './wizard-step-welcome';
import { WizardStepQuestionnaire } from './wizard-step-questionnaire';
import { WizardStepUploads } from './wizard-step-uploads';
import { WizardStepContract } from './wizard-step-contract';
import { WizardStepReview } from './wizard-step-review';
import { WizardStepComplete } from './wizard-step-complete';
import { useToast } from '@/components/ui/toast';

interface OnboardingWizardProps {
  token: string;
  agency: Agency;
  client: Client;
  questions: QuestionnaireQuestion[];
  checklistItems: ChecklistTemplateItem[];
  initialResponses: Record<string, any>;
  initialUploads: Upload[];
  isInitiallyCompleted: boolean;
}

export function OnboardingWizard({
  token,
  agency,
  client,
  questions,
  checklistItems,
  initialResponses,
  initialUploads,
  isInitiallyCompleted,
}: OnboardingWizardProps) {
  const { success, error } = useToast();
  const [currentStep, setCurrentStep] = useState<OnboardingWizardStep>(
    isInitiallyCompleted ? 'completed' : 'welcome'
  );
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [uploads, setUploads] = useState<Upload[]>(initialUploads);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: { id: OnboardingWizardStep; label: string }[] = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'questionnaire', label: 'Intake Questionnaire' },
    { id: 'assets', label: 'Brand Assets' },
    { id: 'contract', label: 'Agreement & Contract' },
    { id: 'checklist', label: 'Review & Submit' },
    { id: 'completed', label: 'Completed' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const currentStepName = steps[currentStepIndex]?.label || 'Onboarding';

  // Save questionnaire responses to server
  const handleSaveQuestionnaire = async (newResponses: Record<string, any>) => {
    setResponses(newResponses);
    try {
      await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          responses: newResponses,
        }),
      });
    } catch (err) {
      console.warn('Silent auto-save notice:', err);
    }
    setCurrentStep('assets');
  };

  const handleUploadSuccess = (newUpload: Upload) => {
    setUploads((prev) => [...prev, newUpload]);
  };

  const handleDeleteUpload = async (uploadId: string) => {
    try {
      const res = await fetch(`/api/upload/${uploadId}?token=${token}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete file');
      setUploads((prev) => prev.filter((u) => u.id !== uploadId));
      success('File removed');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error removing file';
      error('Delete failed', msg);
    }
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          responses,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setCurrentStep('completed');
      success('Onboarding Submitted!', 'Thank you! Your requirements have been received.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting onboarding';
      error('Submission Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between">
      <div>
        <BrandingHeader
          agency={agency}
          currentStepIndex={currentStepIndex}
          totalSteps={steps.length - 1} // Don't count complete as a fractional step
          stepName={currentStepName}
        />

        <main className="px-4 sm:px-6 py-6 sm:py-10">
          {currentStep === 'welcome' && (
            <WizardStepWelcome
              agency={agency}
              client={client}
              checklistItems={checklistItems}
              onStart={() => setCurrentStep('questionnaire')}
            />
          )}

          {currentStep === 'questionnaire' && (
            <WizardStepQuestionnaire
              agency={agency}
              questions={questions}
              initialResponses={responses}
              onSaveAndNext={handleSaveQuestionnaire}
              onBack={() => setCurrentStep('welcome')}
            />
          )}

          {currentStep === 'assets' && (
            <WizardStepUploads
              token={token}
              agency={agency}
              uploads={uploads}
              onUploadSuccess={handleUploadSuccess}
              onDeleteUpload={handleDeleteUpload}
              onNext={() => setCurrentStep('contract')}
              onBack={() => setCurrentStep('questionnaire')}
            />
          )}

          {currentStep === 'contract' && (
            <WizardStepContract
              token={token}
              agency={agency}
              uploads={uploads}
              onUploadSuccess={handleUploadSuccess}
              onDeleteUpload={handleDeleteUpload}
              onNext={() => setCurrentStep('checklist')}
              onBack={() => setCurrentStep('assets')}
            />
          )}

          {currentStep === 'checklist' && (
            <WizardStepReview
              agency={agency}
              questions={questions}
              responses={responses}
              uploads={uploads}
              checklistItems={checklistItems}
              onSubmit={handleSubmitAll}
              onBack={() => setCurrentStep('contract')}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 'completed' && (
            <WizardStepComplete agency={agency} client={client} />
          )}
        </main>
      </div>

      <footer className="py-6 text-center text-xs text-zinc-400 border-t border-zinc-200/60 dark:border-zinc-800/60">
        Powered by <strong>{agency.name}</strong> Client Onboarding Platform
      </footer>
    </div>
  );
}
