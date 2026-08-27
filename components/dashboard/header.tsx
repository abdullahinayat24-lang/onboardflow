'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { Agency } from '@/types';

interface HeaderProps {
  title: string;
  description?: string;
  agency?: Agency | null;
  onNewClient?: () => void;
  children?: React.ReactNode;
}

export function Header({
  title,
  description,
  agency,
  onNewClient,
  children,
}: HeaderProps) {
  const brandColor = agency?.brand_color || '#3B82F6';

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{title}</h1>
        {description && (
          <p className="text-xs text-zinc-500 hidden sm:block">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {children}
        {onNewClient && (
          <Button
            onClick={onNewClient}
            className="text-xs gap-1.5 shadow-sm"
            style={{ backgroundColor: brandColor }}
          >
            <Plus className="w-4 h-4" />
            New Client
          </Button>
        )}
      </div>
    </header>
  );
}
