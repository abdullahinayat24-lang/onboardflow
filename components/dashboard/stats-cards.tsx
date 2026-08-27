import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface StatsCardsProps {
  totalClients: number;
  activeClients: number;
  completedClients: number;
  generatedBriefs: number;
}

export function StatsCards({
  totalClients,
  activeClients,
  completedClients,
  generatedBriefs,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Clients',
      value: totalClients,
      subtext: 'Created in workspace',
      icon: Users,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      label: 'Active Onboardings',
      value: activeClients,
      subtext: 'In progress / Invited',
      icon: Clock,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      label: 'Ready for Kickoff',
      value: completedClients,
      subtext: '100% completed by client',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      label: 'AI Project Briefs',
      value: generatedBriefs,
      subtext: 'Synthesized & ready',
      icon: Sparkles,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-50 dark:bg-purple-950/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="p-5 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {stat.value}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">{stat.subtext}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgClass}`}>
              <Icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
