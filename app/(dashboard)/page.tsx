'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ClientTable } from '@/components/dashboard/client-table';
import { ClientModal } from '@/components/dashboard/client-modal';
import { RightShortcutPanel, RightPanelTab } from '@/components/dashboard/right-shortcut-panel';
import { Button } from '@/components/ui/button';
import { ClientWithDetails, QuestionnaireTemplate, ChecklistTemplate, Agency, Client } from '@/types';
import { ArrowRight, UserPlus, Sparkles, CheckSquare, Layers, Timer, History, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverviewPage() {
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [questionnaireTemplates, setQuestionnaireTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([]);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Right Shortcut Panel State
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('add');
  const [selectedClient, setSelectedClient] = useState<ClientWithDetails | null>(null);

  // Operational OS State
  const [tasksSummary, setTasksSummary] = useState({ active: 0, overdue: 0, completed: 0 });
  const [workflowsSummary, setWorkflowsSummary] = useState({ total: 0, active: 0 });
  const [recentAudit, setRecentAudit] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [resClients, resTasks, resWf, resAudit] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/tasks').catch(() => null),
          fetch('/api/workflows').catch(() => null),
          fetch('/api/audit').catch(() => null),
        ]);

        const data = await resClients.json();
        if (data.clients) {
          let savedStarred: Record<string, boolean> = {};
          try {
            const raw = localStorage.getItem('onboardflow_starred_ids');
            if (raw) savedStarred = JSON.parse(raw);
          } catch {
            // ignore
          }

          const clientsWithPercent = data.clients.map((c: any) => {
            const respCount = (c.responses || []).length;
            const checkCount = (c.checklist_status || []).filter((s: any) => s.is_completed).length;
            const hasContract = (c.uploads || []).some((u: any) => u.category === 'contract');
            
            let percent = 0;
            if (c.status === 'completed') {
              percent = 100;
            } else if (c.status === 'in_progress') {
              percent = Math.min(90, Math.max(25, respCount * 15 + checkCount * 15 + (hasContract ? 20 : 0)));
            } else {
              percent = 0;
            }

            const isStarred = savedStarred[c.id] !== undefined ? savedStarred[c.id] : !!c.is_starred;

            return {
              ...c,
              is_starred: isStarred,
              completion_percentage: percent,
            };
          });
          setClients(clientsWithPercent);
          if (clientsWithPercent.length > 0 && !selectedClient) {
            setSelectedClient(clientsWithPercent[0]);
          }
        }

        if (resTasks && resTasks.ok) {
          const tasksData = await resTasks.json();
          if (Array.isArray(tasksData)) {
            const active = tasksData.filter((t: any) => t.status !== 'completed').length;
            const completed = tasksData.filter((t: any) => t.status === 'completed').length;
            const overdue = tasksData.filter((t: any) => {
              if (t.status === 'completed' || !t.due_date) return false;
              return new Date(t.due_date).getTime() < Date.now();
            }).length;
            setTasksSummary({ active, overdue, completed });
          }
        }

        if (resWf && resWf.ok) {
          const wfData = await resWf.json();
          if (wfData.workflows && Array.isArray(wfData.workflows)) {
            setWorkflowsSummary({
              total: wfData.workflows.length,
              active: wfData.workflows.filter((w: any) => w.status === 'active').length,
            });
          }
        }

        if (resAudit && resAudit.ok) {
          const auditData = await resAudit.json();
          if (Array.isArray(auditData)) {
            setRecentAudit(auditData.slice(0, 5));
          }
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleToggleStar = (clientId: string) => {
    setClients((prev) => {
      const updated = prev.map((c) => {
        if (c.id === clientId) {
          const nextVal = !c.is_starred;
          try {
            const raw = localStorage.getItem('onboardflow_starred_ids') || '{}';
            const parsed = JSON.parse(raw);
            parsed[clientId] = nextVal;
            localStorage.setItem('onboardflow_starred_ids', JSON.stringify(parsed));
          } catch {
            // ignore
          }

          fetch(`/api/clients/${clientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_starred: nextVal }),
          }).catch(() => {});

          return { ...c, is_starred: nextVal };
        }
        return c;
      });

      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient({
          ...selectedClient,
          is_starred: !selectedClient.is_starred,
        });
      }

      return updated;
    });
  };

  const handleSelectClient = (client: ClientWithDetails | null) => {
    setSelectedClient(client);
    if (client) {
      setRightPanelTab('details');
      setIsRightPanelOpen(true);
    }
  };

  const handleClientCreated = (newClient: Client) => {
    const fullNewClient: ClientWithDetails = {
      ...newClient,
      completion_percentage: 0,
      is_starred: false,
    };
    setClients((prev) => [fullNewClient, ...prev]);
    setSelectedClient(fullNewClient);
  };

  const filteredClients = clients.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q))
    );
  });

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status !== 'completed').length;
  const completedClients = clients.filter((c) => c.status === 'completed').length;
  const generatedBriefs = clients.filter((c) => !!c.brief).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fc]">
      <Header
        title="Agency Dashboard"
        description="Overview of your client onboarding pipeline & kickoff briefs"
        agency={agency}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewClient={() => {
          setRightPanelTab('add');
          setIsRightPanelOpen(true);
        }}
        onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
        isRightPanelOpen={isRightPanelOpen}
      />

      <div className="flex flex-1 min-w-0">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-7">
          {/* KPI Metrics */}
          <StatsCards
            totalClients={totalClients}
            activeClients={activeClients}
            completedClients={completedClients}
            generatedBriefs={generatedBriefs}
          />

          {/* Agency Operations Engine Quick Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 5-Stage Workflows */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <Layers className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {workflowsSummary.active} Active Pipelines
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-900">5-Stage Delivery Pipelines</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Weekly Audit → Strategy Kickoff → Execution → QA Review → Retainer Delivery.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100">
                <Link href="/workflows">
                  <Button variant="ghost" size="sm" className="w-full justify-between h-7 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2">
                    Inspect Pipelines
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Task Management */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
                    <CheckSquare className="w-4 h-4" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {tasksSummary.overdue > 0 && (
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        {tasksSummary.overdue} Overdue
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      {tasksSummary.active} Open
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-zinc-900">Work &amp; Task Management</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Kanban board, deliverable checklists, ticket comments, and team work dispatch.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100">
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="w-full justify-between h-7 text-xs font-bold text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-2">
                    Open Kanban &amp; Tickets
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* My Work & Operator Hub */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-800">
                    <Timer className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                    Control Center
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-900">My Work &amp; Operator Hub</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Today&apos;s deliverables, monthly work hours logs, and operator execution center.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100">
                <Link href="/my-work">
                  <Button variant="ghost" size="sm" className="w-full justify-between h-7 text-xs font-bold text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 px-2">
                    Go to My Work
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Client Pipeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  Recent Client Onboardings
                </h2>
                <p className="text-xs text-zinc-500">
                  Click any client to inspect details in the right shortcut panel or star high priority clients.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/clients">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 rounded-full px-3.5">
                    View All Clients
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <ClientTable
              clients={filteredClients.slice(0, 8)}
              selectedClientId={selectedClient?.id}
              onSelectClient={handleSelectClient}
              onToggleStar={handleToggleStar}
            />
          </div>

          {/* Live Operational Audit Feed */}
          {recentAudit.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-zinc-900">Live Agency Work Audit Feed</h3>
                </div>
                <Link href="/reports">
                  <Button variant="ghost" size="sm" className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 h-7 px-2 gap-1">
                    Full Audit Trail
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-zinc-100">
                {recentAudit.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold text-zinc-900">{log.actor_name}</span>
                        <span className="text-zinc-400 mx-1.5">•</span>
                        <span className="font-semibold text-emerald-700 capitalize">
                          {log.action.replace('_', ' ')}
                        </span>
                        <span className="text-zinc-400 mx-1.5">•</span>
                        <span className="text-zinc-600">{log.entity_title}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-400 whitespace-nowrap ml-4">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <RightShortcutPanel
          isOpen={isRightPanelOpen}
          onToggle={() => setIsRightPanelOpen(!isRightPanelOpen)}
          activeTab={rightPanelTab}
          onTabChange={setRightPanelTab}
          clients={clients}
          selectedClient={selectedClient}
          onSelectClient={handleSelectClient}
          onClientCreated={handleClientCreated}
          onToggleStar={handleToggleStar}
        />
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        questionnaireTemplates={questionnaireTemplates}
        checklistTemplates={checklistTemplates}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
}

