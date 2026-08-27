'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Agency, Client } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Sparkles, Calendar, Mail, ShieldCheck } from 'lucide-react';

interface WizardStepCompleteProps {
  agency: Agency;
  client: Client;
}

export function WizardStepComplete({ agency, client }: WizardStepCompleteProps) {
  const brandColor = agency.brand_color || '#3B82F6';

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="space-y-6 max-w-xl mx-auto py-10 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-md animate-in zoom-in-50 duration-300">
        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          You&apos;re All Set, {client.name}! 🎉
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Your onboarding submission has been received by <strong>{agency.name}</strong>.
        </p>
      </div>

      <Card className="shadow-xs border-zinc-200 dark:border-zinc-800 text-left">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            What Happens Next?
          </h3>

          <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-900 dark:text-zinc-100 block">
                  1. Automatic AI Brief Generation
                </strong>
                Our team is synthesizing your requirements and assets into a detailed execution plan.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-900 dark:text-zinc-100 block">
                  2. Project Kickoff Schedule
                </strong>
                Your dedicated project lead from {agency.name} will reach out to confirm your kickoff timeline.
              </div>
            </div>

            {agency.support_email && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-100 block">
                    Have questions in the meantime?
                  </strong>
                  Reach out directly at{' '}
                  <a
                    href={`mailto:${agency.support_email}`}
                    className="font-medium underline"
                    style={{ color: brandColor }}
                  >
                    {agency.support_email}
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-zinc-400">
        You can revisit this page at any time using your unique link to view your submitted details.
      </p>
    </div>
  );
}
