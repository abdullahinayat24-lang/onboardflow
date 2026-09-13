'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, CheckSquare, Menu, Clock, Sparkles } from 'lucide-react';
import { Agency } from '@/types';
import { CreateTaskModal } from '@/components/dashboard/create-task-modal';
import { GlobalSearchModal } from '@/components/dashboard/global-search-modal';
import { NotificationsPopover } from '@/components/dashboard/notifications-popover';

interface TopBarProps {
  agency?: Agency | null;
  onToggleMobileMenu?: () => void;
}

export function TopBar({ agency, onToggleMobileMenu }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }) + ' • ' + now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-14 bg-[#05261d] border-b border-emerald-900/60 sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shadow-xs text-white">
        {/* Left Section: Mobile Menu + Brand / OS Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/50 md:hidden cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-xs group-hover:scale-105 transition-transform">
              {agency?.logo_url ? (
                <img src={agency.logo_url} alt="" className="w-7 h-7 rounded-lg object-cover" />
              ) : (
                'OF'
              )}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-tight text-white">{agency?.name || 'OnboardFlow'}</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                  OS
                </span>
              </div>
            </div>
          </Link>

          {/* + Create Task Global Action */}
          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-xs transition-all cursor-pointer hover:shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline sm:inline">Create Task</span>
          </button>
        </div>

        {/* Center Section: DBA Search Agent */}
        <div className="flex-1 max-w-md mx-1 sm:mx-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full bg-[#083327]/80 hover:bg-[#0c4032] border border-emerald-800/60 hover:border-emerald-600/80 text-emerald-200/80 hover:text-white px-3 py-1.5 rounded-full text-xs flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="truncate font-medium text-[11px] sm:text-xs">DBA Search Agent</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-400 border border-emerald-700/40">
              Ctrl K
            </span>
          </button>
        </div>

        {/* Right Section: My Work + Time + Notifs + Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* My Work Shortcut */}
          <Link
            href="/my-work"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/70 border border-emerald-700/40 text-emerald-100 hover:text-white text-xs font-semibold transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>My Work</span>
          </Link>

          {/* Real-time Clock */}
          {currentTime && (
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-emerald-300/80 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{currentTime}</span>
            </div>
          )}

          {/* Notifications Popover */}
          <NotificationsPopover />

          {/* User Profile Avatar */}
          <Link href="/settings" className="relative cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-emerald-700/60 border border-emerald-500/50 flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:border-emerald-300 transition-colors">
              {agency?.name ? agency.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 border border-[#05261d]" />
          </Link>
        </div>
      </header>

      {/* Global Modals */}
      <CreateTaskModal isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
