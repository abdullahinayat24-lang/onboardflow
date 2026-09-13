'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/dashboard/top-bar';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Agency } from '@/types';

interface DashboardShellProps {
  agency?: Agency | null;
  children: React.ReactNode;
}

export function DashboardShell({ agency, children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-zinc-900 antialiased font-sans">
      <TopBar agency={agency} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <div className="flex flex-1 min-h-[calc(100vh-3.5rem)]">
        <Sidebar
          agency={agency}
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 min-w-0 pb-16 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
