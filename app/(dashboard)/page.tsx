'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ClientTable } from '@/components/dashboard/client-table';
import { ClientModal } from '@/components/dashboard/client-modal';
import { Button } from '@/components/ui/button';
import { ClientWithDetails, QuestionnaireTemplate, ChecklistTemplate, Agency } from '@/types';
import { Plus, Sparkles, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverviewPage() {
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [questionnaireTemplates, setQuestionnaireTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([]);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();
        if (data.clients) {
          // Calculate completion percentage for each client
          const clientsWithPercent = data.clients.map((c: any) => {
            const respCount = (c.responses || []).length;
            const checkCount = (c.checklist_status || []).filter((s: any) => s.is_completed).length;
            const hasContract = (c.uploads || []).some((u: any) => u.category === 'contract');
            
            // Assume 5 standard items if templates aren't fully resolved yet
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
        console.warn('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status !== 'completed').length;
  const completedClients = clients.filter((c) => c.status === 'completed').length;
  const generatedBriefs = clients.filter((c) => !!c.brief).length;

  return (
    <div>
      <Header
        title="Agency Dashboard"
        description="Overview of your client onboarding pipeline & project kickoff briefs"
        agency={agency}
        onNewClient={() => setIsModalOpen(true)}
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
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
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Recent Client Onboardings
              </h2>
              <p className="text-xs text-zinc-500">
                Clients currently in the intake funnel or ready for team handoff.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/clients">
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  View All Clients
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          <ClientTable clients={clients.slice(0, 8)} />
        </div>
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
