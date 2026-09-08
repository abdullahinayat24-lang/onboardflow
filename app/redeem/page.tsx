'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/navbar';
import { MarketingFooter } from '@/components/marketing/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Zap, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function RedeemPage() {
  const { success, error } = useToast();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemedData, setRedeemedData] = useState<any>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      error('License Code Required', 'Please enter your AppSumo voucher or license code.');
      return;
    }

    setIsRedeeming(true);
    try {
      const res = await fetch('/api/billing/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to redeem license code');

      setRedeemedData(data);
      success('License Activated! 🎉', data.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid code';
      error('Redemption Failed', msg);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 flex flex-col justify-between">
      <MarketingNavbar />

      <main className="flex-1 max-w-xl mx-auto px-4 py-20 w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            AppSumo &amp; Lifetime Voucher Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
            Redeem Your Lifetime License
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
            Enter your purchase code from AppSumo or Gumroad to instantly activate Lifetime Access for your agency.
          </p>
        </div>

        {redeemedData ? (
          <Card className="bg-white border-emerald-300 shadow-lg p-6 sm:p-8 space-y-6 text-center rounded-3xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900">Congratulations! 🎉</h2>
              <p className="text-sm text-zinc-600">
                Your agency account has been upgraded to{' '}
                <strong className="text-amber-600 uppercase font-black tracking-wide">
                  {redeemedData.tier === 'appsumo_tier2'
                    ? 'AppSumo Tier 2 (Unlimited Lifetime)'
                    : 'AppSumo Tier 1 Lifetime'}
                </strong>
                .
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-left text-xs space-y-2.5">
              <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                Active License Entitlements:
              </p>
              <div className="flex items-center gap-2 text-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">
                  {redeemedData.subscription.active_clients_limit === -1
                    ? 'Unlimited Active Clients & Onboardings'
                    : `${redeemedData.subscription.active_clients_limit} Active Clients`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">AI Project Brief Generator Enabled</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">White-Label Branding &amp; Webhook Alerts</span>
              </div>
            </div>

            <Link href="/" className="block w-full">
              <Button className="w-full font-bold text-xs h-11 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer rounded-xl shadow-sm">
                Go To Agency Dashboard &rarr;
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="bg-white border-zinc-200 shadow-md rounded-3xl">
            <form onSubmit={handleRedeem}>
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    AppSumo / Gumroad License Code <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. APPSUMO-XXXX-XXXX"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono uppercase text-xs tracking-wider bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-amber-500 rounded-xl"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Found in your AppSumo receipt under &quot;Products &amp; Purchases&quot; or Gumroad license email.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Agency Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="you@youragency.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-amber-500 rounded-xl"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    isLoading={isRedeeming}
                    className="w-full text-xs font-bold h-11 bg-amber-500 hover:bg-amber-600 text-zinc-950 cursor-pointer shadow-sm rounded-xl"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1" />
                    Activate Lifetime License &rarr;
                  </Button>
                </div>

                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Backed by our 60-Day Money Back Guarantee</span>
                </div>
              </CardContent>
            </form>
          </Card>
        )}
      </main>

      <MarketingFooter />
    </div>
  );
}
