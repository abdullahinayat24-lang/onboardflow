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
  Zap,
  CreditCard,
  Globe,
  Star,
  Plus,
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
  const sub = agency?.subscription;

  const navItems = [
    {
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      label: 'All Clients',
      href: '/clients',
      icon: Users,
      active: pathname === '/clients',
    },
    {
      label: 'Starred Clients',
      href: '/clients?tab=starred',
      icon: Star,
      active: pathname === '/clients' && typeof window !== 'undefined' && window.location.search.includes('starred'),
    },
    {
      label: 'Templates & AI',
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

  const getTierLabel = () => {
    if (!sub || sub.plan_tier === 'appsumo_tier2') return 'AppSumo Tier 2 Lifetime';
    if (sub.plan_tier === 'appsumo_tier1') return 'AppSumo Tier 1 Lifetime';
    if (sub.plan_tier === 'pro') return 'Agency Pro Plan';
    if (sub.plan_tier === 'enterprise') return 'Enterprise Studio';
    return 'Agency Pro (Lifetime)';
  };

  return (
    <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 gap-3">
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
            <h1 className="font-semibold text-sm text-zinc-900 truncate">
              {agency?.name || 'OnboardFlow'}
            </h1>
            <p className="text-xs text-zinc-500 truncate">Agency Workspace</p>
          </div>
        </div>

        {/* Gmail-Style Floating Compose / + New Client Pill */}
        <div className="px-4 pt-4 pb-2">
          <Link
            href="/clients?action=new"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#c2e7ff] hover:bg-[#b3d7ef] text-[#001d35] font-semibold text-sm shadow-xs hover:shadow-sm transition-all duration-150 group cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-white/80 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span>New Client</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="px-3 py-2 space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Mail &amp; Workflows
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all group',
                  item.active
                    ? 'bg-[#d3e3fd] text-[#041e49] font-semibold'
                    : 'text-zinc-700 hover:bg-[#f0f4f9] hover:text-zinc-900'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    item.active
                      ? 'text-[#041e49]'
                      : 'text-zinc-500 group-hover:text-zinc-800'
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / License Badge & Quick Actions */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        {/* Tier License Badge */}
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-3 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {getTierLabel()}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Unlimited AI Briefs &amp; White-label Active.
          </p>
          <div className="pt-1 flex items-center gap-2 text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
            <Link href="/pricing" className="hover:underline">
              View Plans
            </Link>
            <span>&bull;</span>
            <Link href="/redeem" className="hover:underline">
              Redeem Code
            </Link>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
