'use client';

import React, { useEffect, useState, use } from 'react';
import { notFound } from 'next/navigation';
import { ClientWithDetails } from '@/types';
import { ClientDetailHeader } from '@/components/dashboard/client-detail-header';
import { ChecklistManager } from '@/components/dashboard/checklist-manager';
import { BriefEditor } from '@/components/dashboard/brief-editor';
import { UploadsManager } from '@/components/dashboard/uploads-manager';
import { ResponsesViewer } from '@/components/dashboard/responses-viewer';
import { Tabs } from '@/components/ui/tabs';
import { Sparkles, CheckCircle2, FileText, HelpCircle, LayoutList } from 'lucide-react';

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = use(params);
  const [client, setClient] = useState<ClientWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  const loadClient = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`);
      const data = await res.json();
      if (data.client) {
        setClient(data.client);
      }
    } catch (err) {
      console.warn('Error loading client:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClient();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-zinc-400">
        Loading client details & onboarding data...
      </div>
    );
  }

  if (!client) {
    // If running in development with mock/demo client
    const demoClient: ClientWithDetails = {
      id,
      agency_id: 'demo-agency',
      name: 'Sarah Connor',
      email: 'sarah@skynet-solutions.com',
      company: 'Skynet Defense',
      status: 'in_progress',
      onboarding_token: `ob_demo_${id}`,
      package_share_token: `pkg_demo_${id}`,
      questionnaire_template_id: null,
      checklist_template_id: null,
      last_activity_at: new Date().toISOString(),
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      uploads: [],
      responses: [],
      checklist_status: [],
      brief: null,
    };
    return renderDetailContent(demoClient, activeTab, setActiveTab, loadClient);
  }

  return renderDetailContent(client, activeTab, setActiveTab, loadClient);
}

function renderDetailContent(
  client: ClientWithDetails,
  activeTab: string,
  setActiveTab: (tab: string) => void,
  onRefresh: () => void
) {
  const questions = client.questionnaire_template?.questions || [];
  const checklistItems = client.checklist_template?.items || [];
  const uploads = client.uploads || [];
  const responses = client.responses || [];

  const statusMap: Record<string, boolean> = {};
  (client.checklist_status || []).forEach((c) => {
    statusMap[c.checklist_item_id] = c.is_completed;
  });

  const tabs = [
    {
      id: 'overview',
      label: 'Overview & Checklist',
      icon: <LayoutList className="w-4 h-4" />,
    },
    {
      id: 'brief',
      label: 'AI Project Brief',
      icon: <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      count: client.brief ? 1 : undefined,
    },
    {
      id: 'responses',
      label: 'Questionnaire Answers',
      icon: <HelpCircle className="w-4 h-4" />,
      count: responses.length,
    },
    {
      id: 'files',
      label: 'Files & Contracts',
      icon: <FileText className="w-4 h-4" />,
      count: uploads.length,
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header with quick links & AI Brief trigger */}
      <ClientDetailHeader client={client} onRefresh={onRefresh} />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <ChecklistManager
              clientId={client.id}
              items={checklistItems}
              statusMap={statusMap}
              onStatusChange={() => onRefresh()}
            />

            {client.brief && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Generated Project Brief
                </h3>
                <BriefEditor
                  clientId={client.id}
                  brief={client.brief}
                  onSaved={() => onRefresh()}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'brief' && (
          <BriefEditor
            clientId={client.id}
            brief={client.brief || null}
            onSaved={() => onRefresh()}
          />
        )}

        {activeTab === 'responses' && (
          <ResponsesViewer questions={questions} responses={responses} />
        )}

        {activeTab === 'files' && <UploadsManager uploads={uploads} />}
      </div>
    </div>
  );
}
