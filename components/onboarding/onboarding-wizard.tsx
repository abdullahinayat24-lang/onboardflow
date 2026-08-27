'use client';

import React, { useState, useMemo } from 'react';
import {
  Agency,
  Client,
  QuestionnaireQuestion,
  ChecklistTemplateItem,
  Upload,
  PlatformAccessLocker,
  PaymentInfo,
  TemplateStepConfig,
} from '@/types';
import { BrandingHeader } from './branding-header';
import { WizardStepWelcome } from './wizard-step-welcome';
import { WizardStepQuestionnaire } from './wizard-step-questionnaire';
import { WizardStepUploads } from './wizard-step-uploads';
import { WizardStepContract } from './wizard-step-contract';
import { WizardStepAccess } from './wizard-step-access';
import { WizardStepPayment } from './wizard-step-payment';
import { WizardStepReview } from './wizard-step-review';
import { WizardStepComplete } from './wizard-step-complete';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export type WizardStepId =
  | 'welcome'
  | 'questionnaire'
  | 'assets'
  | 'contract'
  | 'access'
  | 'payment'
  | 'checklist'
  | 'completed';

interface OnboardingWizardProps {
  token: string;
  agency: Agency;
  client: Client;
  questions: QuestionnaireQuestion[];
  checklistItems: ChecklistTemplateItem[];
  stepConfig?: TemplateStepConfig;
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
  stepConfig,
  initialResponses,
  initialUploads,
  isInitiallyCompleted,
}: OnboardingWizardProps) {
  const { success, error } = useToast();
  
  // Default step configuration if not explicitly provided
  const config: TemplateStepConfig = stepConfig || {
    enable_media_uploads: true,
    enable_contract_upload: true,
    enable_platform_access: true,
    enable_payment_step: true,
    media_upload_label: 'Brand Assets & Media',
    contract_upload_label: 'Signed Agreement & Contract',
  };

  // Build active dynamic steps based on template configuration
  const activeSteps = useMemo(() => {
    const s: { id: WizardStepId; label: string }[] = [
      { id: 'welcome', label: 'Welcome' },
      { id: 'questionnaire', label: 'Intake Questionnaire' },
    ];

    if (config.enable_media_uploads !== false) {
      s.push({ id: 'assets', label: config.media_upload_label || 'Documents & Assets' });
    }

    if (config.enable_contract_upload !== false) {
      s.push({ id: 'contract', label: config.contract_upload_label || 'Agreement & Contract' });
    }

    if (config.enable_platform_access !== false) {
      s.push({ id: 'access', label: 'Platform & Cloud Access' });
    }

    if (config.enable_payment_step !== false) {
      s.push({ id: 'payment', label: 'Kickoff Retainer' });
    }

    s.push({ id: 'checklist', label: 'Review & Submit' });
    s.push({ id: 'completed', label: 'Completed' });

    return s;
  }, [config]);

  const [currentStep, setCurrentStep] = useState<WizardStepId>(
    isInitiallyCompleted ? 'completed' : 'welcome'
  );
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [uploads, setUploads] = useState<Upload[]>(initialUploads);
  const [accessData, setAccessData] = useState<PlatformAccessLocker>(
    client.platform_access || {
      instagram_handle: '',
      facebook_page_url: '',
      google_drive_folder_url: '',
      login_credentials_notes: '',
    }
  );
  const [payment, setPayment] = useState<PaymentInfo>(
    client.payment || {
      required: config.enable_payment_step || false,
      amount_cents: 0,
      currency: 'USD',
      is_paid: false,
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepIndex = activeSteps.findIndex((s) => s.id === currentStep);
  const currentStepName = activeSteps[currentStepIndex]?.label || 'Onboarding';

  // Navigation helpers that jump between dynamically enabled steps
  const goToNextStep = () => {
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStep(activeSteps[currentStepIndex + 1].id);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(activeSteps[currentStepIndex - 1].id);
    }
  };

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
      console.warn('Auto-save notice:', err);
    }
    goToNextStep();
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
          platform_access: accessData,
          payment,
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
          totalSteps={activeSteps.length - 1}
          stepName={currentStepName}
        />

        <main className="px-4 sm:px-6 py-6 sm:py-10 max-w-4xl mx-auto">
          {currentStep === 'welcome' && (
            <WizardStepWelcome
              agency={agency}
              client={client}
              checklistItems={checklistItems}
              onStart={goToNextStep}
            />
          )}

          {currentStep === 'questionnaire' && (
            <WizardStepQuestionnaire
              agency={agency}
              questions={questions}
              initialResponses={responses}
              onSaveAndNext={handleSaveQuestionnaire}
              onBack={goToPrevStep}
            />
          )}

          {currentStep === 'assets' && (
            <WizardStepUploads
              token={token}
              agency={agency}
              uploads={uploads}
              onUploadSuccess={handleUploadSuccess}
              onDeleteUpload={handleDeleteUpload}
              onNext={goToNextStep}
              onBack={goToPrevStep}
            />
          )}

          {currentStep === 'contract' && (
            <WizardStepContract
              token={token}
              agency={agency}
              uploads={uploads}
              onUploadSuccess={handleUploadSuccess}
              onDeleteUpload={handleDeleteUpload}
              onNext={goToNextStep}
              onBack={goToPrevStep}
            />
          )}

          {currentStep === 'access' && (
            <div className="space-y-6">
              <WizardStepAccess
                accessData={accessData}
                onChange={setAccessData}
              />
              <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevStep}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={goToNextStep}
                  className="text-xs gap-1.5 cursor-pointer bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800"
                >
                  Next Step &rarr;
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="space-y-6">
              <WizardStepPayment
                payment={payment}
                agency={agency}
                onPaymentConfirmed={setPayment}
              />
              <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevStep}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={goToNextStep}
                  className="text-xs gap-1.5 cursor-pointer bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800"
                >
                  Next: Final Review &rarr;
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'checklist' && (
            <WizardStepReview
              agency={agency}
              questions={questions}
              responses={responses}
              uploads={uploads}
              checklistItems={checklistItems}
              onSubmit={handleSubmitAll}
              onBack={goToPrevStep}
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
