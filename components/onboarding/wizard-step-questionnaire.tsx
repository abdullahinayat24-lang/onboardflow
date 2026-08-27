'use client';

import React, { useState } from 'react';
import { QuestionnaireQuestion, Agency } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface WizardStepQuestionnaireProps {
  agency: Agency;
  questions: QuestionnaireQuestion[];
  initialResponses: Record<string, any>;
  onSaveAndNext: (responses: Record<string, any>) => void;
  onBack: () => void;
}

export function WizardStepQuestionnaire({
  agency,
  questions,
  initialResponses,
  onSaveAndNext,
  onBack,
}: WizardStepQuestionnaireProps) {
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const brandColor = agency.brand_color || '#3B82F6';

  const handleTextChange = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const handleSingleChoice = (questionId: string, option: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: option }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const handleMultiChoice = (questionId: string, option: string) => {
    const current: string[] = Array.isArray(responses[questionId]) ? responses[questionId] : [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setResponses((prev) => ({ ...prev, [questionId]: next }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const handleNext = () => {
    // Validate required questions
    const newErrors: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.required) {
        const ans = responses[q.id];
        if (
          !ans ||
          (typeof ans === 'string' && ans.trim() === '') ||
          (Array.isArray(ans) && ans.length === 0)
        ) {
          newErrors[q.id] = 'This question is required.';
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(`q_${firstErrorKey}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onSaveAndNext(responses);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Project Intake Questionnaire
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Tell us about your project vision, target audience, and priorities.
        </p>
      </div>

      <div className="space-y-5">
        {questions.map((q, idx) => {
          const answer = responses[q.id];
          const hasError = !!errors[q.id];
          const options: string[] = Array.isArray(q.options) ? (q.options as string[]) : [];

          return (
            <Card
              key={q.id}
              id={`q_${q.id}`}
              className={`shadow-xs border transition-all ${
                hasError
                  ? 'border-rose-300 dark:border-rose-900 bg-rose-50/10'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      <span className="text-zinc-400 font-bold mr-1.5">{idx + 1}.</span>
                      {q.label}
                      {q.required && <span className="text-rose-500 ml-1 font-bold">*</span>}
                    </label>
                    {q.description && (
                      <p className="text-xs text-zinc-500 mt-1 leading-normal">{q.description}</p>
                    )}
                  </div>
                </div>

                {/* Question Input Type Handling */}
                {q.type === 'long_text' && (
                  <Textarea
                    placeholder={q.placeholder || 'Type your detailed answer here...'}
                    value={answer || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    className="min-h-[100px] text-xs"
                  />
                )}

                {q.type === 'short_text' && (
                  <Input
                    placeholder={q.placeholder || 'Your answer...'}
                    value={answer || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    className="text-xs"
                  />
                )}

                {q.type === 'url' && (
                  <Input
                    type="url"
                    placeholder={q.placeholder || 'https://example.com'}
                    value={answer || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    className="text-xs font-mono"
                  />
                )}

                {q.type === 'number' && (
                  <Input
                    type="number"
                    placeholder={q.placeholder || '0'}
                    value={answer || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    className="text-xs"
                  />
                )}

                {q.type === 'single_choice' && (
                  <div className="space-y-2 pt-1">
                    {options.map((opt, optIdx) => {
                      const isSelected = answer === opt;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSingleChoice(q.id, opt)}
                          className={`p-3 rounded-lg border text-xs flex items-center gap-3 cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-zinc-900 bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-100 font-semibold text-zinc-900 dark:text-zinc-100'
                              : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-zinc-900 dark:border-zinc-100' : 'border-zinc-400'
                            }`}
                          >
                            {isSelected && (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: brandColor }}
                              />
                            )}
                          </div>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === 'multiple_choice' && (
                  <div className="space-y-2 pt-1">
                    {options.map((opt, optIdx) => {
                      const isSelected = Array.isArray(answer) && answer.includes(opt);
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleMultiChoice(q.id, opt)}
                          className={`p-3 rounded-lg border text-xs flex items-center gap-3 cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-zinc-900 bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-100 font-semibold text-zinc-900 dark:text-zinc-100'
                              : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              isSelected ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'border-zinc-400'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {hasError && <p className="text-[11px] text-rose-600 font-medium">{errors[q.id]}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="text-xs gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          className="text-xs gap-1.5 font-semibold text-white px-6"
          style={{ backgroundColor: brandColor }}
        >
          Save & Next: Upload Assets
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
