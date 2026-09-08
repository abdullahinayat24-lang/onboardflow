'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SAAS_PLANS, APPSUMO_DEALS } from '@/lib/billing/plans';
import { Check, Zap, Sparkles, ShieldCheck, HelpCircle, ArrowRight, ExternalLink } from 'lucide-react';

type PricingTab = 'subscription' | 'appsumo' | 'comparison';

export function PricingCards() {
  const [activeTab, setActiveTab] = useState<PricingTab>('subscription');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const comparisonFeatures = [
    { name: 'Active Client Intake Pipelines', starter: 'Up to 10', pro: 'Unlimited', enterprise: 'Unlimited', appsumo1: 'Up to 15', appsumo2: 'Unlimited' },
    { name: 'AI Project Kickoff Briefs', starter: '50 / mo', pro: 'Unlimited', enterprise: 'Unlimited', appsumo1: '100 / mo', appsumo2: 'Unlimited' },
    { name: 'Custom Questionnaire Builder', starter: '✓', pro: '✓', enterprise: '✓', appsumo1: '✓', appsumo2: '✓' },
    { name: 'Contract & Asset Uploads', starter: '10 GB', pro: '50 GB', enterprise: 'Unlimited', appsumo1: '25 GB', appsumo2: 'Unlimited' },
    { name: 'White-Label Agency Branding', starter: '—', pro: '✓ (Logo & Colors)', enterprise: '✓ (Custom Domain)', appsumo1: '✓', appsumo2: '✓' },
    { name: 'Instant Webhook Notifications (Slack / WhatsApp)', starter: '—', pro: '✓', enterprise: '✓', appsumo1: '✓', appsumo2: '✓' },
    { name: 'Client Platform Credential Locker', starter: '—', pro: '✓', enterprise: '✓', appsumo1: '✓', appsumo2: '✓' },
    { name: 'Automated Inactivity Reminder Emails', starter: '—', pro: '✓', enterprise: '✓', appsumo1: '—', appsumo2: '✓' },
    { name: 'Stripe Deposit / Retainer Step', starter: '—', pro: '✓', enterprise: '✓', appsumo1: '—', appsumo2: '✓' },
    { name: 'Shareable Team Kickoff Packages', starter: '✓', pro: '✓', enterprise: '✓', appsumo1: '✓', appsumo2: '✓' },
    { name: 'Dedicated Support & SLA', starter: 'Email', pro: 'Priority 24/7', enterprise: 'Dedicated Manager', appsumo1: 'Standard', appsumo2: 'Priority' },
  ];

  return (
    <section id="pricing" className="py-20 bg-[#f8fafc] text-zinc-900 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Simple, Transparent Pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900">
            Choose the plan that fits your agency
          </h1>
          <p className="text-sm sm:text-base text-zinc-600">
            Start with our 14-day free trial or grab our limited-time <strong>AppSumo Lifetime Deal</strong>.
          </p>

          {/* Main Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            <button
              type="button"
              onClick={() => setActiveTab('subscription')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                activeTab === 'subscription'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              ⚡ Monthly &amp; Annual Plans
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('appsumo')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                activeTab === 'appsumo'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              AppSumo Lifetime Deal (Pay Once)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('comparison')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                activeTab === 'comparison'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              📊 Compare All Features
            </button>
          </div>

          {/* Billing Toggle (Shown when on Subscription tab) */}
          {activeTab === 'subscription' && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <div className="bg-zinc-200/80 p-1 rounded-full flex items-center shadow-inner">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-zinc-900 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    billingCycle === 'annual'
                      ? 'bg-white text-zinc-900 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.2 rounded-full font-bold">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TAB 1: STANDARD SUBSCRIPTION PLANS */}
        {activeTab === 'subscription' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {SAAS_PLANS.map((plan) => {
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              const isPro = plan.popular;

              return (
                <div
                  key={plan.id}
                  className={`p-8 rounded-3xl flex flex-col justify-between transition-all relative bg-white ${
                    isPro
                      ? 'border-2 border-blue-600 shadow-xl shadow-blue-500/10 ring-4 ring-blue-500/5'
                      : 'border border-zinc-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-sm">
                      {plan.badge}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900">{plan.name}</h3>
                      <p className="text-xs text-zinc-500 mt-1">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-zinc-900">${price}</span>
                      <span className="text-xs text-zinc-500 font-medium">/ month</span>
                      {billingCycle === 'annual' && (
                        <span className="ml-2 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Billed annually
                        </span>
                      )}
                    </div>

                    <ul className="space-y-3 text-xs text-zinc-700 pt-4 border-t border-zinc-100">
                      {plan.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8">
                    <Link
                      href={
                        plan.id === 'enterprise'
                          ? 'mailto:hello@onboardflow.com?subject=Enterprise%20Plan%20Inquiry'
                          : `/signup?plan=${plan.id}`
                      }
                      className="w-full block"
                    >
                      <Button
                        className={`w-full text-xs font-bold h-11 cursor-pointer rounded-xl transition-all shadow-xs ${
                          isPro
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                            : plan.id === 'enterprise'
                            ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300'
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
        )}

        {/* TAB 2: APPSUMO LIFETIME DEALS */}
        {activeTab === 'appsumo' && (
          <div className="space-y-8 pt-2">
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-50 via-white to-blue-50 border border-amber-300 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold mb-2">
                    <Zap className="w-3.5 h-3.5 fill-current text-amber-600" />
                    AppSumo Lifetime Special
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-zinc-900">
                    Buy once, use forever. No monthly subscriptions.
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-xl">
                    Purchased a license code on AppSumo or Gumroad? Redeem it instantly below to unlock lifetime agency access.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link href="/redeem">
                    <Button
                      size="lg"
                      className="bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs px-6 h-11 shadow-sm cursor-pointer rounded-xl"
                    >
                      <Zap className="w-4 h-4 mr-1.5" />
                      Redeem License Code &rarr;
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {APPSUMO_DEALS.map((deal) => (
                  <div
                    key={deal.tier}
                    className="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between space-y-6 relative hover:border-amber-400 transition-colors"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-zinc-900">{deal.name}</h3>
                        {deal.badge && (
                          <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-zinc-950 px-2.5 py-0.5 rounded-full">
                            {deal.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-zinc-900">${deal.price}</span>
                        <span className="text-xs text-zinc-400 line-through">${deal.originalPrice}</span>
                        <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          One-time payment
                        </span>
                      </div>

                      <p className="text-xs text-zinc-600">{deal.description}</p>

                      <ul className="space-y-2 text-xs text-zinc-700 pt-3 border-t border-zinc-100">
                        {deal.features.map((f, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 pt-4">
                      <Link href="/redeem" className="w-full block">
                        <Button className="w-full text-xs font-bold h-11 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-xs cursor-pointer">
                          Redeem License Code &rarr;
                        </Button>
                      </Link>

                      <a
                        href="https://inayat18.gumroad.com/l/onboardflow"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full block text-center py-2 px-4 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                      >
                        Buy Lifetime License on Gumroad (${deal.price}) &rarr;
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FEATURE COMPARISON TABLE */}
        {activeTab === 'comparison' && (
          <div className="pt-4 space-y-6">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 bg-[#f8fafc] text-zinc-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-4 px-6 min-w-[200px]">Feature Matrix</th>
                      <th className="py-4 px-4 text-center">Starter ($29)</th>
                      <th className="py-4 px-4 text-center text-blue-600 bg-blue-50/50">Agency Pro ($79)</th>
                      <th className="py-4 px-4 text-center">Enterprise ($199)</th>
                      <th className="py-4 px-4 text-center text-amber-700 bg-amber-50/30">AppSumo LTD ($49+)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {comparisonFeatures.map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-zinc-900">{row.name}</td>
                        <td className="py-3.5 px-4 text-center">{row.starter}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-blue-700 bg-blue-50/30">{row.pro}</td>
                        <td className="py-3.5 px-4 text-center">{row.enterprise}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-amber-800 bg-amber-50/20">{row.appsumo1} / {row.appsumo2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link href="/signup">
                <Button className="text-xs font-bold px-6 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer">
                  Start Your 14-Day Free Trial &rarr;
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
