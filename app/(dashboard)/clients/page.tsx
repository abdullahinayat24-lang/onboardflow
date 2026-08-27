'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { ClientTable } from '@/components/dashboard/client-table';
import { ClientModal } from '@/components/dashboard/client-modal';
import { Tabs } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ClientWithDetails, QuestionnaireTemplate, ChecklistTemplate, Agency } from '@/types';
import { Plus, Search, Filter } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [questionnaireTemplates, setQuestionnaireTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([]);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();
        if (data.clients) {
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

            return {
              ...c,
              completion_percentage: percent,
            };
          });
          setClients(clientsWithPercent);
        }
      } catch (err) {
        console.warn('Error fetching clients:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadClients();
  }, []);

  const filteredClients = clients.filter((c) => {
    const matchesTab = activeTab === 'all' || c.status === activeTab;
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
    invited: clients.filter((c) => c.status === 'invited').length,
    in_progress: clients.filter((c) => c.status === 'in_progress').length,
    completed: clients.filter((c) => c.status === 'completed').length,
  };

  const tabs = [
    { id: 'all', label: 'All Clients', count: tabCounts.all },
    { id: 'invited', label: 'Invited', count: tabCounts.invited },
    { id: 'in_progress', label: 'In Progress', count: tabCounts.in_progress },
    { id: 'completed', label: 'Completed', count: tabCounts.completed },
  ];

  return (
    <div>
      <Header
        title="Clients Directory"
        description="Track all onboarding invitations, client deliverables, and kickoff status"
        agency={agency}
        onNewClient={() => setIsModalOpen(true)}
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Controls: Search & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <Input
              placeholder="Search by name, company, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {/* Client Table */}
        <ClientTable clients={filteredClients} />
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        questionnaireTemplates={questionnaireTemplates}
        checklistTemplates={checklistTemplates}
        onClientCreated={(newClient) => {
          setClients((prev) => [
            { ...newClient, completion_percentage: 0 },
            ...prev,
          ]);
        }}
      />
    </div>
  );
}
