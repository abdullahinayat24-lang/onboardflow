'use client';

import React, { useState } from 'react';
import { ProjectBrief, BriefStatus } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import {
  Sparkles,
  Edit3,
  Eye,
  Save,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface BriefEditorProps {
  clientId: string;
  brief: ProjectBrief | null;
  onSaved?: (updatedBrief: ProjectBrief) => void;
}

export function BriefEditor({ clientId, brief, onSaved }: BriefEditorProps) {
  const { success, error } = useToast();
  const [summary, setSummary] = useState(brief?.ai_summary || '');
  const [briefText, setBriefText] = useState(brief?.ai_brief || '');
  const [status, setStatus] = useState<BriefStatus>(brief?.status || 'draft');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (newStatus?: BriefStatus) => {
    setIsSaving(true);
    const targetStatus = newStatus || status;

    try {
      const res = await fetch(`/api/clients/${clientId}/brief`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_summary: summary,
          ai_brief: briefText,
          status: targetStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save project brief');

      setStatus(targetStatus);
      setIsEditing(false);
      if (onSaved) onSaved(data.brief);
      success(
        'Brief Saved',
        targetStatus === 'final' ? 'Marked as Finalized Project Brief' : 'Draft changes updated'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving brief';
      error('Failed to save', msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!brief && !briefText) {
    return (
      <Card className="p-8 text-center border-dashed">
        <Sparkles className="w-10 h-10 text-purple-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-zinc-900">
          No AI Brief Generated Yet
        </h3>
        <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1 mb-4">
          Click &quot;Generate AI Brief&quot; above to synthesize the client&apos;s intake questionnaire, uploaded
          assets, and checklist into a structured project kickoff document.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <Card className="border-purple-200 bg-purple-50/30 shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-purple-950">
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI Executive Summary
            </CardTitle>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                status === 'final'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {status === 'final' ? 'Finalized' : 'Draft'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[100px] text-xs font-sans bg-white"
              placeholder="Executive summary..."
            />
          ) : (
            <p className="text-xs text-zinc-800 whitespace-pre-line leading-relaxed">
              {summary}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main Project Brief Document Card */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-zinc-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-zinc-900">Structured Project Brief</CardTitle>
              <p className="text-xs text-zinc-500">
                Ready for project team kickoff, scope validation, and contractor handoff.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs gap-1.5"
              >
                {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                {isEditing ? 'Preview Mode' : 'Edit Brief'}
              </Button>

              {isEditing && (
                <Button
                  size="sm"
                  onClick={() => handleSave()}
                  isLoading={isSaving}
                  className="text-xs gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Draft
                </Button>
              )}

              {status === 'draft' ? (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleSave('final')}
                  isLoading={isSaving}
                  className="text-xs gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approve as Final
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave('draft')}
                  isLoading={isSaving}
                  className="text-xs gap-1.5 text-zinc-600"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Reopen as Draft
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isEditing ? (
            <Textarea
              value={briefText}
              onChange={(e) => setBriefText(e.target.value)}
              className="min-h-[450px] font-mono text-xs bg-zinc-50 p-4 leading-relaxed text-zinc-900 border-zinc-300"
              placeholder="Markdown project brief..."
            />
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-xl prose-h2:text-base prose-h3:text-sm prose-p:text-xs prose-li:text-xs text-zinc-900">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed bg-transparent p-0 text-zinc-800">
                {briefText}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
