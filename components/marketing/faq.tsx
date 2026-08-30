'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function MarketingFAQ() {
  const faqs = [
    {
      q: 'Do my clients need to create an account or log in to OnboardFlow?',
      a: 'No! OnboardFlow is 100% zero-login for your clients. You generate a secure, unique branded token link and send it over WhatsApp, Email, or Slack. They click and immediately begin filling out their intake.',
    },
    {
      q: 'How does the AI Project Brief generation work?',
      a: 'When a client finishes their questionnaire and file uploads, OnboardFlow sends the full context into Anthropic Claude or OpenAI to automatically extract primary goals, project scope boundaries, asset checklists, and missing risk items into a ready-to-use executive brief.',
    },
    {
      q: 'Can I white-label the onboarding with my own logo and brand colors?',
      a: 'Yes! You can upload your agency logo, pick your primary brand color, and even connect custom webhook notifications so clients experience a seamless, premium intake under your brand.',
    },
    {
      q: 'What if a client leaves halfway through their intake?',
      a: 'All responses are automatically saved in real-time as the client types. Plus, OnboardFlow includes automated email reminder nudges to re-engage inactive clients until they finish.',
    },
    {
      q: 'How does the AppSumo Lifetime Deal work?',
      a: 'You pay once on AppSumo and receive a license code. Enter the code on our /redeem page to unlock lifetime access with all future core updates included and zero recurring monthly fees.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-zinc-950 text-white border-t border-zinc-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
