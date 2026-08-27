'use client';

import React, { useState } from 'react';
import { QuestionnaireQuestion, QuestionnaireTemplate } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Check,
  HelpCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface QuestionnaireBuilderProps {
  template: QuestionnaireTemplate & { questions: QuestionnaireQuestion[] };
  onSaved?: (updated: QuestionnaireTemplate & { questions: QuestionnaireQuestion[] }) => void;
}

export function QuestionnaireBuilder({ template, onSaved }: QuestionnaireBuilderProps) {
  const { success, error } = useToast();
  const [title, setTitle] = useState(template.title);
  const [description, setDescription] = useState(template.description || '');
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>(
    template.questions || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = () => {
    const newQuestion: QuestionnaireQuestion = {
      id: `temp_${Date.now()}`,
      template_id: template.id,
      label: 'New Question',
      description: '',
      placeholder: '',
      type: 'short_text',
      options: [],
      required: true,
      order_index: questions.length + 1,
      created_at: new Date().toISOString(),
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updates: Partial<QuestionnaireQuestion>) => {
    setQuestions(
      questions.map((q, i) => (i === index ? { ...q, ...updates } : q))
    );
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/templates/questionnaires/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          questions: questions.map((q, i) => ({
            ...q,
            order_index: i + 1,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save template');

      success('Template Saved', 'Questionnaire template updated successfully');
      if (onSaved) onSaved(data.template);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving';
      error('Failed to save', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Template Details</CardTitle>
            <Button
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              className="text-xs gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Template Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Intake Questionnaire"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Description (Shown to client on intake page)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief explanation for the client..."
              className="min-h-[70px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Intake Questions ({questions.length})
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={addQuestion}
            className="text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Question
          </Button>
        </div>

        {questions.map((q, index) => (
          <Card key={q.id || index} className="p-4 shadow-xs space-y-3 border-zinc-200 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-xs font-semibold text-zinc-400">Order #{index + 1}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveQuestion(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveQuestion(index, 'down')}
                  disabled={index === questions.length - 1}
                  className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                  title="Delete Question"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Question Label / Prompt
                </label>
                <Input
                  value={q.label}
                  onChange={(e) => updateQuestion(index, { label: e.target.value })}
                  placeholder="e.g. What is your target launch date?"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Answer Input Type
                </label>
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(index, { type: e.target.value as any })}
                  className="w-full h-10 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 shadow-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="short_text">Short Text (Single line)</option>
                  <option value="long_text">Long Text (Paragraph)</option>
                  <option value="single_choice">Single Choice (Radio/Dropdown)</option>
                  <option value="multiple_choice">Multiple Choice (Checkboxes)</option>
                  <option value="number">Number</option>
                  <option value="url">Website / URL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Help text / instructions (Optional)
              </label>
              <Input
                value={q.description || ''}
                onChange={(e) => updateQuestion(index, { description: e.target.value })}
                placeholder="e.g. Be as specific as possible..."
                className="text-xs"
              />
            </div>

            {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
              <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Options (Comma separated)
                </label>
                <Input
                  value={Array.isArray(q.options) ? (q.options as string[]).join(', ') : ''}
                  onChange={(e) =>
                    updateQuestion(index, {
                      options: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Option 1, Option 2, Option 3"
                  className="text-xs"
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id={`req_${index}`}
                checked={q.required}
                onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-zinc-900 focus:ring-zinc-900"
              />
              <label htmlFor={`req_${index}`} className="text-xs text-zinc-600 dark:text-zinc-400">
                Require client to answer before final submission
              </label>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
