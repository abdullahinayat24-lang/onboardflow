'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { ClientTable } from '@/components/dashboard/client-table';
import { ClientModal } from '@/components/dashboard/client-modal';
import { RightShortcutPanel, RightPanelTab } from '@/components/dashboard/right-shortcut-panel';
import { Tabs } from '@/components/ui/tabs';
import { ClientWithDetails, QuestionnaireTemplate, ChecklistTemplate, Agency, Client } from '@/types';
import { Star, UserPlus, FileText, CheckCircle2, Sparkles, LayoutGrid, List } from 'lucide-react';
import { ClientCardGrid } from '@/components/dashboard/client-card-grid';

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [questionnaireTemplates, setQuestionnaireTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([]);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Right Shortcut Panel State
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('add');
  const [selectedClient, setSelectedClient] = useState<ClientWithDetails | null>(null);

  // Load clients and sync starred from localStorage
  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();
        if (data.clients) {
          // Read persisted stars from localStorage
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

          // Default selected client for inspection
          if (clientsWithPercent.length > 0 && !selectedClient) {
            setSelectedClient(clientsWithPercent[0]);
          }
        }
      } catch (err) {
        console.warn('Error fetching clients:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadClients();
  }, []);

  // Handle URL query actions (e.g. ?tab=starred or ?action=new)
  useEffect(() => {
    const tab = searchParams?.get('tab');
    const action = searchParams?.get('action');
    if (tab === 'starred') {
      setActiveTab('starred');
      setRightPanelTab('starred');
      setIsRightPanelOpen(true);
    }
    if (action === 'new') {
      setRightPanelTab('add');
      setIsRightPanelOpen(true);
    }
  }, [searchParams]);

  const handleToggleStar = async (clientId: string) => {
    setClients((prev) => {
      const updated = prev.map((c) => {
        if (c.id === clientId) {
          const nextVal = !c.is_starred;
          // Persist to localStorage
          try {
            const raw = localStorage.getItem('onboardflow_starred_ids') || '{}';
            const parsed = JSON.parse(raw);
            parsed[clientId] = nextVal;
            localStorage.setItem('onboardflow_starred_ids', JSON.stringify(parsed));
          } catch {
            // ignore
          }

          // Trigger backend update
          fetch(`/api/clients/${clientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_starred: nextVal }),
          }).catch(() => {});

          return { ...c, is_starred: nextVal };
        }
        return c;
      });

      // Also update selected client if matching
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
    let matchesTab = true;
    if (activeTab === 'starred') {
      matchesTab = !!c.is_starred;
    } else if (activeTab !== 'all') {
      matchesTab = c.status === activeTab;
    }

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q));

    return matchesTab && matchesSearch;
  });

  const tabCounts = {
    all: clients.length,
    starred: clients.filter((c) => c.is_starred).length,
    invited: clients.filter((c) => c.status === 'invited').length,
    in_progress: clients.filter((c) => c.status === 'in_progress').length,
    completed: clients.filter((c) => c.status === 'completed').length,
  };

  const tabs = [
    { id: 'all', label: 'All Clients', count: tabCounts.all },
    { id: 'starred', label: '⭐ Starred', count: tabCounts.starred },
    { id: 'in_progress', label: 'In Progress', count: tabCounts.in_progress },
    { id: 'invited', label: 'Invited', count: tabCounts.invited },
    { id: 'completed', label: 'Completed', count: tabCounts.completed },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fc]">
      {/* Gmail-Style Header with Integrated Search Capsule & Toggle */}
      <Header
        title="Clients Directory"
        description="Search, star, and manage automated client onboarding flows"
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

      {/* Main Workspace Layout (Center Table + Right Shortcut Panel) */}
      <div className="flex flex-1 min-w-0">
        {/* Center Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-5">
          {/* Controls: Filter Tabs & View Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-zinc-200 shadow-2xs">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white text-zinc-900 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  title="Card Grid (11 Action Controls)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-zinc-900 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  title="List Table View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setRightPanelTab('add');
                  setIsRightPanelOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border border-emerald-200"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ New Client</span>
              </button>
            </div>
          </div>

          {/* Client Content: Cards View or Table View */}
          {viewMode === 'cards' ? (
            <ClientCardGrid
              clients={filteredClients}
              onToggleStar={handleToggleStar}
              onClientUpdated={(updated) => {
                setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
              }}
              onClientArchived={(archivedId) => {
                setClients((prev) => prev.filter((c) => c.id !== archivedId));
              }}
            />
          ) : (
            <ClientTable
              clients={filteredClients}
              selectedClientId={selectedClient?.id}
              onSelectClient={handleSelectClient}
              onToggleStar={handleToggleStar}
            />
          )}
        </main>

        {/* Gmail-Style Right Shortcut Panel (Tasks/Keep/Details) */}
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

