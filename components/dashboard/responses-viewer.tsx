import React from 'react';
import { QuestionnaireQuestion, QuestionnaireResponse } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

interface ResponsesViewerProps {
  questions: QuestionnaireQuestion[];
  responses: QuestionnaireResponse[];
}

export function ResponsesViewer({ questions, responses }: ResponsesViewerProps) {
  const responseMap: Record<string, string> = {};
  responses.forEach((r) => {
    responseMap[r.question_id] = r.answer || '';
  });

  return (
    <Card className="shadow-xs bg-white">
      <CardHeader className="pb-3 border-b border-zinc-100">
        <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          Client Questionnaire Responses ({responses.length} / {questions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 divide-y divide-zinc-100">
        {questions.map((q, idx) => {
          const answer = responseMap[q.id];
          return (
            <div key={q.id} className="py-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400">Q{idx + 1}.</span>
                <h4 className="text-xs font-semibold text-zinc-900">{q.label}</h4>
                {q.required && (
                  <span className="text-[10px] text-rose-500 font-medium">*required</span>
                )}
              </div>

              {q.description && (
                <p className="text-[11px] text-zinc-500 pl-5">{q.description}</p>
              )}

              <div className="pl-5 pt-1">
                {answer ? (
                  <p className="text-xs text-zinc-800 bg-zinc-50 p-3 rounded-lg border border-zinc-200 whitespace-pre-wrap">
                    {answer}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 italic bg-zinc-50/50 p-2.5 rounded-lg border border-dashed border-zinc-200">
                    No answer provided yet
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
