'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentInfo, Agency } from '@/types';
import { CreditCard, CheckCircle2, ExternalLink, ShieldCheck, Lock } from 'lucide-react';

interface WizardStepPaymentProps {
  payment: PaymentInfo;
  agency: Agency;
  onPaymentConfirmed: (updated: PaymentInfo) => void;
}

export function WizardStepPayment({ payment, agency, onPaymentConfirmed }: WizardStepPaymentProps) {
  const checkoutUrl =
    payment.stripe_checkout_url ||
    agency.stripe_payment_link ||
    'https://buy.stripe.com/demo_checkout_link';

  const amountDisplay = payment.amount_cents
    ? `$${(payment.amount_cents / 100).toFixed(2)} ${payment.currency || 'USD'}`
    : 'Standard Retainer / Deposit';

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          Step 6 &bull; Kickoff Deposit & Retainer
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
          Project Kickoff Retainer
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Complete your initial onboarding deposit or confirm retainer payment to lock in your production schedule.
        </p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-white/10">
                <CreditCard className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold tracking-wide text-zinc-300">
                SECURE STRIPE CHECKOUT
              </span>
            </div>
            {payment.is_paid ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Deposit Confirmed
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-full">
                Pending Payment
              </span>
            )}
          </div>

          <div>
            <p className="text-xs text-zinc-400">Total Kickoff Amount</p>
            <p className="text-3xl font-extrabold text-white tracking-tight mt-1">
              {amountDisplay}
            </p>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {!payment.is_paid ? (
            <div className="space-y-4">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Click below to pay via Stripe (Credit Card, Apple Pay, Google Pay, or Bank Transfer):
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto flex-1"
                >
                  <Button className="w-full text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md">
                    Pay with Stripe
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onPaymentConfirmed({
                      ...payment,
                      is_paid: true,
                      paid_at: new Date().toISOString(),
                    })
                  }
                  className="w-full sm:w-auto text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer"
                >
                  I have already paid / wire sent &rarr;
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  Payment Confirmed!
                </p>
                <p className="text-[11px] text-zinc-500">
                  Your deposit has been verified for this project.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>256-bit encrypted checkout powered by Stripe.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
