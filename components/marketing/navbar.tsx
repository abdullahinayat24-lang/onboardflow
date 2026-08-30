'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-black text-sm shadow-md">
              OF
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              Onboard<span className="text-blue-500">Flow</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
            <Link href="/#features" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link
              href="/redeem"
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Redeem AppSumo Code
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="text-xs font-bold gap-1.5 bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer shadow-sm"
            >
              Get Started Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
