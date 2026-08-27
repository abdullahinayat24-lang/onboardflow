'use client';

import React, { useState } from 'react';
import { ChecklistTemplateItem, ChecklistTemplate } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Plus, Trash2, Save, ArrowUp, ArrowDown } from 'lucide-react';

interface ChecklistBuilderProps {
  template: ChecklistTemplate & { items: ChecklistTemplateItem[] };
  onSaved?: (updated: ChecklistTemplate & { items: ChecklistTemplateItem[] }) => void;
}

export function ChecklistBuilder({ template, onSaved }: ChecklistBuilderProps) {
  const { success, error } = useToast();
  const [title, setTitle] = useState(template.title);
  const [items, setItems] = useState<ChecklistTemplateItem[]>(template.items || []);
  const [isSaving, setIsSaving] = useState(false);

  const addItem = () => {
    const newItem: ChecklistTemplateItem = {
      id: `temp_${Date.now()}`,
      template_id: template.id,
      label: 'New Deliverable Item',
      description: '',
      category: 'general',
      required: true,
      order_index: items.length + 1,
      created_at: new Date().toISOString(),
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<ChecklistTemplateItem>) => {
    setItems(items.map((it, i) => (i === index ? { ...it, ...updates } : it)));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setItems(newItems);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/templates/checklists/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          items: items.map((it, i) => ({
            ...it,
            order_index: i + 1,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save checklist template');

      success('Checklist Saved', 'Checklist template updated successfully');
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
            <CardTitle className="text-base">Checklist Template Settings</CardTitle>
            <Button
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              className="text-xs gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Checklist
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Template Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Standard Agency Onboarding Checklist"
            />
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Checklist Deliverables ({items.length})
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={addItem}
            className="text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Deliverable
          </Button>
        </div>

        {items.map((it, index) => (
          <Card key={it.id || index} className="p-4 shadow-xs space-y-3 border-zinc-200 dark:border-zinc-800">
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
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                  title="Delete Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Deliverable Label
                </label>
                <Input
                  value={it.label}
                  onChange={(e) => updateItem(index, { label: e.target.value })}
                  placeholder="e.g. Upload Signed MSA / Contract"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Category
                </label>
                <select
                  value={it.category}
                  onChange={(e) => updateItem(index, { category: e.target.value as any })}
                  className="w-full h-10 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 shadow-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="questionnaire">Questionnaire</option>
                  <option value="contract">Contract / Agreement</option>
                  <option value="asset">Brand Assets / Files</option>
                  <option value="access">Access / Credentials</option>
                  <option value="general">General Deliverable</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Instruction for Client (Optional)
              </label>
              <Input
                value={it.description || ''}
                onChange={(e) => updateItem(index, { description: e.target.value })}
                placeholder="e.g. Vector .SVG files, fonts, or Google Drive link..."
                className="text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id={`chk_req_${index}`}
                checked={it.required}
                onChange={(e) => updateItem(index, { required: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-zinc-900 focus:ring-zinc-900"
              />
              <label htmlFor={`chk_req_${index}`} className="text-xs text-zinc-600 dark:text-zinc-400">
                Mark as required before project kickoff
              </label>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
