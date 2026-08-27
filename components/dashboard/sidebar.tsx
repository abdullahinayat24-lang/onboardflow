'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Sparkles,
  Layers,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Agency } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  agency?: Agency | null;
}

export function Sidebar({ agency }: SidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const brandColor = agency?.brand_color || '#3B82F6';

  const navItems = [
    {
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      label: 'Clients',
      href: '/clients',
      icon: Users,
      active: pathname.startsWith('/clients'),
    },
    {
      label: 'Templates',
      href: '/templates',
      icon: Layers,
      active: pathname.startsWith('/templates'),
    },
    {
      label: 'Agency Settings',
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings'),
    },
  ];

  const handleSignOut = async () => {
    document.cookie = 'demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs"
            style={{ backgroundColor: brandColor }}
          >
            {agency?.logo_url ? (
              <img
                src={agency.logo_url}
                alt={agency.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              (agency?.name || 'OF').substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
              {agency?.name || 'OnboardFlow'}
            </h1>
            <p className="text-xs text-zinc-500 truncate">Agency Workspace</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-1.5">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  item.active
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    item.active
                      ? 'text-white dark:text-zinc-900'
                      : 'text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / Quick Actions */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-3 border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            AI Brief Assistant
          </div>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Automated executive briefs generated for each client intake.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
