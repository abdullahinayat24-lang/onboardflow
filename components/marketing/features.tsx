'use client';

import React from 'react';
import {
  Sparkles,
  Layers,
  Palette,
  Key,
  CreditCard,
  BellRing,
  FileCheck2,
  Share2,
} from 'lucide-react';

export function MarketingFeatures() {
  const features = [
    {
      icon: Sparkles,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/40 border-purple-800/60',
      title: 'AI Project Brief Synthesizer',
      description:
        'Transform scattered client answers, uploaded files, and goals into a clean Markdown Executive Brief with scope, deliverables, and next steps ready for your design & engineering teams.',
    },
    {
      icon: Palette,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/40 border-blue-800/60',
      title: '100% White-Label Branding',
      description:
        'Display your agency logo, primary brand colors, and custom subdomains. Clients experience a frictionless, high-end intake that reinforces your premium positioning.',
    },
    {
      icon: Key,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40 border-amber-800/60',
      title: 'Platform & Social Access Locker',
      description:
        'Securely collect Meta Business IDs, Instagram handles, Google Drive/Dropbox folders, and CMS login notes without chaotic email threads or lost passwords.',
    },
    {
      icon: Layers,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40 border-emerald-800/60',
      title: 'AI Industry Template Generator',
      description:
        'Instantly generate tailored intake workflows for any niche — from Social Media & Creative Retainers to Corporate Accounting, Suppliers, Legal, and Real Estate.',
    },
    {
      icon: CreditCard,
      color: 'text-pink-400',
      bgColor: 'bg-pink-950/40 border-pink-800/60',
      title: 'Kickoff Retainer / Stripe Payments',
      description:
        'Collect project deposits or upfront retainer payments seamlessly during the onboarding flow via 1-click Stripe checkout.',
    },
    {
      icon: BellRing,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-950/40 border-indigo-800/60',
      title: 'Instant WhatsApp & Slack Alerts',
      description:
        'Get notified on WhatsApp or in your team Slack channel the exact moment a client finishes onboarding with a direct link to their completed brief.',
    },
  ];

  return (
    <section id="features" className="py-24 bg-zinc-950 text-white border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
            Agency Powerhouse Suite
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Everything your agency needs to onboard clients in record time
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Replace 5 disconnected tools (Typeform, Google Drive, DocuSign, email chains, and manual brief writing) with one unified system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center ${f.bgColor}`}
                  >
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
