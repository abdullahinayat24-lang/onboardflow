'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SAAS_PLANS, APPSUMO_DEALS } from '@/lib/billing/plans';
import { Check, Zap, Sparkles, ShieldCheck } from 'lucide-react';

export function PricingCards() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section id="pricing" className="py-24 bg-zinc-950 text-white border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Simple, Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Choose the plan that fits your agency
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Start with our 14-day free trial or grab our limited-time <strong>AppSumo Lifetime Deal</strong>.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Annual Billing
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Standard SaaS Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SAAS_PLANS.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.id}
                className={`p-8 rounded-2xl flex flex-col justify-between transition-all relative ${
                  plan.popular
                    ? 'bg-zinc-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/10'
                    : 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white">${price}</span>
                    <span className="text-xs text-zinc-400">/ month</span>
                  </div>

                  <ul className="space-y-3 text-xs text-zinc-300 pt-4 border-t border-zinc-800">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link href="/signup" className="w-full block">
                    <Button
                      className={`w-full text-xs font-bold h-11 cursor-pointer ${
                        plan.popular
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                      }`}
                    >
                      {plan.ctaText} &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* AppSumo Lifetime Deals Special Banner */}
        <div className="pt-12">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-blue-950/40 border border-amber-500/30 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
                  <Zap className="w-3.5 h-3.5" />
                  AppSumo Lifetime Special
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Buy once, use forever. No monthly subscriptions.
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                  Purchased a code on AppSumo? Redeem it instantly below or grab a lifetime license before the deal ends.
                </p>
              </div>

              <Link href="/redeem">
                <Button
                  size="lg"
                  className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs px-6 h-12 shadow-lg cursor-pointer"
                >
                  <Zap className="w-4 h-4 mr-1.5" />
                  Redeem AppSumo Code &rarr;
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {APPSUMO_DEALS.map((deal) => (
                <div
                  key={deal.tier}
                  className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">{deal.name}</h4>
                      {deal.badge && (
                        <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-zinc-950 px-2.5 py-0.5 rounded-full">
                          {deal.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">${deal.price}</span>
                      <span className="text-xs text-zinc-500 line-through">${deal.originalPrice}</span>
                      <span className="text-xs text-amber-400 font-bold">One-time payment</span>
                    </div>
                    <p className="text-xs text-zinc-400">{deal.description}</p>
                    <ul className="space-y-2 text-xs text-zinc-300 pt-3 border-t border-zinc-800">
                      {deal.features.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href="/redeem" className="w-full block">
                    <Button
                      variant="outline"
                      className="w-full text-xs font-bold border-zinc-700 hover:bg-zinc-800 text-white cursor-pointer"
                    >
                      Redeem License Code
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
