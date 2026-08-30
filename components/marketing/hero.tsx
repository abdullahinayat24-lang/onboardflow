'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, ShieldCheck, Zap, CheckCircle2, Play } from 'lucide-react';

export function MarketingHero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28 text-white">
      {/* Background glowing gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/10 blur-[130px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* AppSumo / Product Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-semibold text-zinc-300 shadow-sm backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-amber-400 font-bold">AppSumo Lifetime Deal Live</span>
          <span className="text-zinc-500">&bull;</span>
          <span>Turn signed clients into project-ready handoffs</span>
        </div>

        {/* Hero Title */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Stop chasing client files.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Automate your entire intake.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-lg text-zinc-400 leading-relaxed">
            Send <strong>1 branded, zero-login link</strong>. Your client completes questionnaire answers, uploads brand assets & contracts, and OnboardFlow automatically synthesizes a <strong>structured AI Project Brief</strong> for your delivery team.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/signup">
            <Button
              size="lg"
              className="w-full sm:w-auto text-sm font-bold gap-2 px-8 h-12 bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer shadow-lg"
            >
              Start Free Trial &rarr;
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-sm font-bold gap-2 px-6 h-12 border-zinc-800 text-white hover:bg-zinc-900 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Get Lifetime Deal ($49)
            </Button>
          </Link>
        </div>

        {/* Social Proof metrics */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-semibold text-zinc-400 border-t border-zinc-900 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Login Required for Clients</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Instant AI Project Briefs</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% White-Label Branding</span>
          </div>
        </div>

        {/* Hero Interactive App Window Preview */}
        <div className="pt-6 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2 sm:p-3 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] font-mono text-zinc-500 ml-2">
                  onboardflow.com/onboard/ob_sarah_connor_demo
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800">
                Live Interactive Intake
              </span>
            </div>

            {/* Mockup UI Inner Content */}
            <div className="bg-zinc-950 rounded-xl p-6 sm:p-8 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    OF
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Velocity Digital Studio</h3>
                    <p className="text-xs text-zinc-400">Client Project Onboarding Wizard</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Auto-Saving Enabled
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Step 1</span>
                  <h4 className="text-xs font-bold text-white">Smart Questionnaire</h4>
                  <p className="text-[11px] text-zinc-400">Goals, deadlines, audience, and campaign themes.</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Step 2</span>
                  <h4 className="text-xs font-bold text-white">Assets & Contracts</h4>
                  <p className="text-[11px] text-zinc-400">Drag & drop logos, signed agreements & raw footage.</p>
                </div>

                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/60 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">Step 3 &bull; AI Magic</span>
                  <h4 className="text-xs font-bold text-white">Instant Project Brief</h4>
                  <p className="text-[11px] text-zinc-300">Executive summary, scope & deliverables ready for team handoff.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
