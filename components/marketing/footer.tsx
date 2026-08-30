'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap } from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-black text-xs">
              OF
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              Onboard<span className="text-blue-500">Flow</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-medium">
            <Link href="/#features" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/redeem" className="hover:text-white transition-colors flex items-center gap-1 text-amber-400">
              <Zap className="w-3.5 h-3.5" />
              Redeem AppSumo Code
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Agency Sign In
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>&copy; {new Date().getFullYear()} OnboardFlow SaaS. All rights reserved.</p>
          <div className="flex items-center gap-2 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted in transit & at rest</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
