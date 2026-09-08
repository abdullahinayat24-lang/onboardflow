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
      a: 'You pay once on AppSumo or Gumroad and receive a license code. Enter the code on our /redeem page to unlock lifetime access with all future core updates included and zero recurring monthly fees.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-white text-zinc-900 border-t border-zinc-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-zinc-200 overflow-hidden transition-all shadow-2xs hover:border-zinc-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer bg-white"
                >
                  <span className="text-sm sm:text-base font-bold text-zinc-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
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
