'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ClientTable } from '@/components/dashboard/client-table';
import { ClientModal } from '@/components/dashboard/client-modal';
import { RightShortcutPanel, RightPanelTab } from '@/components/dashboard/right-shortcut-panel';
import { Button } from '@/components/ui/button';
import { ClientWithDetails, QuestionnaireTemplate, ChecklistTemplate, Agency, Client } from '@/types';
import { ArrowRight, UserPlus, Sparkles } from 'lucide-react';
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

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();
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

