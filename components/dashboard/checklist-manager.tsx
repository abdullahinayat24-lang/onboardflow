'use client';

import React, { useState } from 'react';
import { ChecklistTemplateItem, ClientChecklistStatus } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, AlertTriangle, FileText, Check } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface ChecklistManagerProps {
  clientId: string;
  items: ChecklistTemplateItem[];
  statusMap: Record<string, boolean>;
  onStatusChange?: (itemId: string, completed: boolean) => void;
}

export function ChecklistManager({
  clientId,
  items,
  statusMap: initialStatusMap,
  onStatusChange,
}: ChecklistManagerProps) {
  const { success, error } = useToast();
  const [statusMap, setStatusMap] = useState<Record<string, boolean>>(initialStatusMap);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const completedCount = items.filter((item) => statusMap[item.id]).length;
  const totalCount = items.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = async (itemId: string) => {
    const nextState = !statusMap[itemId];
    setLoadingItemId(itemId);

    try {
      const res = await fetch(`/api/clients/${clientId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist_item_id: itemId,
          is_completed: nextState,
        }),
      });

      if (!res.ok) throw new Error('Failed to update checklist item');

      setStatusMap((prev) => ({ ...prev, [itemId]: nextState }));
      if (onStatusChange) onStatusChange(itemId, nextState);
      success('Checklist updated', nextState ? 'Marked as completed' : 'Marked as pending');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating';
      error('Failed to update', msg);
    } finally {
      setLoadingItemId(null);
    }
  };

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Onboarding Deliverables Checklist
            </CardTitle>
            <p className="text-xs text-zinc-500 mt-1">
              Required items tracked automatically as the client completes the intake wizard.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-700 dark:text-zinc-300">
            {completedCount} of {totalCount} Completed ({percent}%)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {items.map((item) => {
            const isCompleted = !!statusMap[item.id];
            const isLoading = loadingItemId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className="py-3 px-2 flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-lg cursor-pointer transition-colors select-none"
              >
                <button
                  type="button"
                  disabled={isLoading}
                  className="mt-0.5 shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-xs font-semibold ${
                        isCompleted
                          ? 'line-through text-zinc-400 dark:text-zinc-500'
                          : 'text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {item.label}
                    </p>
                    {item.required && (
                      <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-900">
                        Required
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
                      ({item.category})
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-zinc-500 mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
