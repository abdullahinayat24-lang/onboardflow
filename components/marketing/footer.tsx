'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap } from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-[#f8fafc] text-zinc-600 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              OF
            </div>
            <span className="font-extrabold text-base tracking-tight text-zinc-900">
              Onboard<span className="text-blue-600">Flow</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-600 font-medium">
            <Link href="/#features" className="hover:text-zinc-900 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="/redeem" className="hover:text-amber-800 transition-colors flex items-center gap-1 text-amber-700">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              Redeem AppSumo Code
            </Link>
            <Link href="/login" className="hover:text-zinc-900 transition-colors">
              Agency Sign In
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>&copy; 2026 OnboardFlow SaaS. All rights reserved.</p>
          <div className="flex items-center gap-2 text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted in transit &amp; at rest</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
