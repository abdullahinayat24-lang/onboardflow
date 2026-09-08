'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, SlidersHorizontal, PanelRight, X } from 'lucide-react';
import { Agency } from '@/types';

interface HeaderProps {
  title: string;
  description?: string;
  agency?: Agency | null;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onNewClient?: () => void;
  onToggleRightPanel?: () => void;
  isRightPanelOpen?: boolean;
  children?: React.ReactNode;
}

export function Header({
  title,
  description,
  agency,
  searchQuery,
  onSearchChange,
  onNewClient,
  onToggleRightPanel,
  isRightPanelOpen,
  children,
}: HeaderProps) {
  const brandColor = agency?.brand_color || '#2563eb';

  return (
    <header className="h-16 border-b border-zinc-200 bg-white sticky top-0 z-20 px-6 sm:px-8 flex items-center justify-between gap-4">
      {/* Title & context */}
      <div className="shrink-0">
        <h1 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-zinc-500 hidden md:block">{description}</p>
        )}
      </div>

      {/* Gmail-Style Rounded Search Capsule */}
      {onSearchChange !== undefined && (
        <div className="flex-1 max-w-xl mx-2 sm:mx-4 relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search clients, email, or company..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#f1f3f4] hover:bg-[#e8eaed] focus:bg-white text-xs text-zinc-800 placeholder-zinc-500 pl-10 pr-9 py-2.5 rounded-full border border-transparent focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-zinc-400 hover:text-zinc-600 p-0.5 rounded-full"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 absolute right-3 pointer-events-none" />
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {children}

        {/* Active Workspace Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active</span>
        </div>

        {onNewClient && (
          <Button
            onClick={onNewClient}
            className="text-xs gap-1.5 rounded-full px-4 h-9 shadow-xs font-semibold cursor-pointer"
            style={{ backgroundColor: brandColor }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Client</span>
          </Button>
        )}

        {onToggleRightPanel && (
          <button
            onClick={onToggleRightPanel}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isRightPanelOpen
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
            title="Toggle Right Shortcut Panel"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
