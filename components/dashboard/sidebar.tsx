'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Archive,
  CheckSquare,
  Briefcase,
  Layers,
  BarChart3,
  Settings,
  Sparkles,
  Zap,
  LogOut,
  Plus,
  X,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Agency } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  agency?: Agency | null;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ agency, isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const brandColor = agency?.brand_color || '#059669';
  const sub = agency?.subscription;

  const navItems = [
    {
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      label: 'Staff / Managers',
      href: '/staff',
      icon: UserCheck,
      active: pathname === '/staff',
    },
    {
      label: 'Clients',
      href: '/clients',
      icon: Users,
      active: pathname.startsWith('/clients') && !pathname.includes('/archive'),
    },
    {
      label: 'Client Archive',
      href: '/archive',
      icon: Archive,
      active: pathname === '/archive',
    },
    {
      label: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      active: pathname === '/tasks',
    },
    {
      label: 'My Work',
      href: '/my-work',
      icon: Briefcase,
      active: pathname === '/my-work',
    },
    {
      label: 'Workflows',
      href: '/workflows',
      icon: Layers,
      active: pathname === '/workflows',
    },
    {
      label: 'Reports & Logs',
      href: '/reports',
      icon: BarChart3,
      active: pathname === '/reports',
    },
    {
      label: 'Templates & AI',
      href: '/templates',
      icon: Sparkles,
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

  const getTierLabel = () => {
    if (!sub || sub.plan_tier === 'appsumo_tier2') return 'AppSumo Tier 2 Lifetime';
    if (sub.plan_tier === 'appsumo_tier1') return 'AppSumo Tier 1 Lifetime';
    if (sub.plan_tier === 'pro') return 'Agency Pro Plan';
    if (sub.plan_tier === 'enterprise') return 'Enterprise Studio';
    return 'Agency OS Pro (VIP)';
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-white dark:bg-zinc-950">
      <div>
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
              style={{ backgroundColor: brandColor }}
            >
              {agency?.logo_url ? (
                <img src={agency.logo_url} alt={agency.name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                (agency?.name || 'OF').substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-xs text-zinc-900 dark:text-white truncate">
                {agency?.name || 'OnboardFlow'}
              </h2>
              <p className="text-[10px] text-zinc-500 truncate">Agency Operations SaaS</p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick New Client Action */}
        <div className="px-3 pt-3 pb-2">
          <Link
            href="/clients?action=new"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors border border-emerald-200/80 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>+ New Client Intake</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 py-1 space-y-0.5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 my-1.5">
            Operations &amp; Work
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  item.active
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold border-l-3 border-emerald-600'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    item.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Tier Badge & Sign out */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-2.5 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {getTierLabel()}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-zinc-500">All Operations Modules Unlocked</p>
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 border-r border-zinc-200 dark:border-zinc-800 shrink-0 h-[calc(100vh-3.5rem)] sticky top-14 z-20 flex-col overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
