'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              OF
            </div>
            <span className="font-extrabold text-base tracking-tight text-zinc-900">
              Onboard<span className="text-blue-600">Flow</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-600">
            <Link href="/#features" className="hover:text-zinc-900 transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="hover:text-zinc-900 transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="hover:text-blue-600 transition-colors text-blue-600 font-bold">
              Pricing
            </Link>
            <Link
              href="/redeem"
              className="text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Redeem AppSumo Code
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="text-xs font-bold gap-1.5 bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer shadow-xs rounded-xl"
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
