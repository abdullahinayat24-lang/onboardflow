'use client';

import React from 'react';
import { Agency } from '@/types';
import { Progress } from '@/components/ui/progress';

interface BrandingHeaderProps {
  agency: Agency;
  currentStepIndex: number;
  totalSteps: number;
  stepName: string;
}

export function BrandingHeader({
  agency,
  currentStepIndex,
  totalSteps,
  stepName,
}: BrandingHeaderProps) {
  const brandColor = agency.brand_color || '#3B82F6';
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-30 shadow-xs">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Agency Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0 overflow-hidden"
            style={{ backgroundColor: brandColor }}
          >
            {agency.logo_url ? (
              <img
                src={agency.logo_url}
                alt={agency.name}
                className="w-full h-full object-cover"
              />
            ) : (
              (agency.name || 'AG').substring(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight">
              {agency.name}
            </h1>
            <p className="text-[11px] text-zinc-500">Project Onboarding</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="text-right">
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Step {currentStepIndex + 1} of {totalSteps}
          </p>
          <p className="text-[11px] text-zinc-500">{stepName}</p>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: brandColor,
          }}
        />
      </div>
    </header>
  );
}
