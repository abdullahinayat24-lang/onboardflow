import React from 'react';
import { MarketingNavbar } from '@/components/marketing/navbar';
import { PricingCards } from '@/components/marketing/pricing-cards';
import { MarketingFAQ } from '@/components/marketing/faq';
import { MarketingFooter } from '@/components/marketing/footer';

export const metadata = {
  title: 'Pricing & Plans | OnboardFlow SaaS',
  description: 'Affordable monthly, annual, and AppSumo Lifetime Deals for digital agencies and creators.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between">
      <MarketingNavbar />
      <main className="flex-1">
        <PricingCards />
        <MarketingFAQ />
      </main>
      <MarketingFooter />
    </div>
  );
}
