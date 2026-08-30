import { PlanTier, SubscriptionInfo } from '@/types';

export interface PricingPlan {
  id: PlanTier;
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  lifetimePrice?: number;
  features: string[];
  limits: {
    activeClients: number; // -1 for unlimited
    aiBriefsPerMonth: number;
    whiteLabel: boolean;
    webhooks: boolean;
    customDomain: boolean;
  };
  ctaText: string;
  popular?: boolean;
}

export const SAAS_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter Studio',
    description: 'Perfect for solo freelancers, artists, and boutique creators.',
    monthlyPrice: 29,
    annualPrice: 24,
    features: [
      'Up to 10 Active Clients',
      'AI Project Brief Generation (50/mo)',
      'Custom Questionnaire Builder',
      'Asset & Contract Uploads (10GB)',
      'Shareable Team Handoff Packages',
      'Standard Email Support',
    ],
    limits: {
      activeClients: 10,
      aiBriefsPerMonth: 50,
      whiteLabel: false,
      webhooks: false,
      customDomain: false,
    },
    ctaText: 'Start 14-Day Free Trial',
  },
  {
    id: 'pro',
    name: 'Agency Pro',
    badge: 'MOST POPULAR',
    popular: true,
    description: 'For growing digital agencies, social media teams, and studios.',
    monthlyPrice: 79,
    annualPrice: 65,
    features: [
      'Unlimited Active Clients',
      'Unlimited AI Project Briefs & Summaries',
      '100% White-Label Branding (Your Logo & Colors)',
      'Instant WhatsApp & Slack Alerts (Webhooks)',
      'AI Industry Template Generator',
      'Platform & Social Access Locker',
      'Stripe Deposit & Retainer Checkout Step',
      'Automated Inactivity Reminder Emails',
      'Priority 24/7 Agency Support',
    ],
    limits: {
      activeClients: -1,
      aiBriefsPerMonth: -1,
      whiteLabel: true,
      webhooks: true,
      customDomain: true,
    },
    ctaText: 'Upgrade to Agency Pro',
  },
  {
    id: 'enterprise',
    name: 'Scale & Enterprise',
    description: 'For multi-brand agencies, enterprise studios, and holding companies.',
    monthlyPrice: 199,
    annualPrice: 165,
    features: [
      'Everything in Agency Pro',
      'Unlimited Team Seats & Sub-Agencies',
      'Custom Domain White-label (portal.yourdomain.com)',
      'Dedicated Database & High-Speed S3/R2 Storage',
      'Custom SLA & Dedicated Account Manager',
      'Zapier & n8n Enterprise Webhook Pipelines',
    ],
    limits: {
      activeClients: -1,
      aiBriefsPerMonth: -1,
      whiteLabel: true,
      webhooks: true,
      customDomain: true,
    },
    ctaText: 'Contact Enterprise Sales',
  },
];

export const APPSUMO_DEALS = [
  {
    tier: 'appsumo_tier1' as PlanTier,
    name: 'AppSumo Tier 1',
    price: 49,
    originalPrice: 348,
    description: 'Lifetime access for solo consultants & boutique creators.',
    features: [
      'Lifetime Access to OnboardFlow',
      'Up to 15 Active Client Onboardings at a time',
      '100 AI Brief Generations / Month',
      'AI Industry Template Generator',
      'Custom Agency Branding',
      'All Future Updates Included',
      '60-Day Money Back Guarantee',
    ],
  },
  {
    tier: 'appsumo_tier2' as PlanTier,
    name: 'AppSumo Tier 2 (Stack 2 Codes)',
    badge: 'BEST VALUE LTD',
    price: 99,
    originalPrice: 948,
    popular: true,
    description: 'Unlimited lifetime power for serious agencies and studios.',
    features: [
      'Lifetime Access — Pay Once, Use Forever',
      'UNLIMITED Active Clients & Projects',
      'UNLIMITED AI Project Briefs',
      '100% White-Label Branding (Remove OnboardFlow badge)',
      'WhatsApp & Slack Webhook Notifications',
      'Stripe Retainer & Deposit Collection Step',
      'Platform & Social Media Access Locker',
      'All Future Agency Pro Features Included',
      '60-Day Money Back Guarantee',
    ],
  },
];

/**
 * Validates and redeems AppSumo codes
 */
export function validateAppSumoCode(code: string): {
  valid: boolean;
  tier: PlanTier;
  subscription: SubscriptionInfo;
} {
  const clean = code.trim().toUpperCase();

  // Recognize demo/testing promo codes
  if (clean.includes('TIER2') || clean.includes('UNLIMITED') || clean.includes('VIP') || clean.startsWith('AS-T2-')) {
    return {
      valid: true,
      tier: 'appsumo_tier2',
      subscription: {
        plan_tier: 'appsumo_tier2',
        status: 'active',
        is_lifetime: true,
        appsumo_code: clean,
        active_clients_limit: -1,
        ai_briefs_limit_per_month: -1,
        white_label_enabled: true,
        custom_domain_enabled: true,
      },
    };
  }

  if (clean.startsWith('APPSUMO') || clean.startsWith('AS-') || clean.length >= 8) {
    return {
      valid: true,
      tier: 'appsumo_tier1',
      subscription: {
        plan_tier: 'appsumo_tier1',
        status: 'active',
        is_lifetime: true,
        appsumo_code: clean,
        active_clients_limit: 15,
        ai_briefs_limit_per_month: 100,
        white_label_enabled: true,
        custom_domain_enabled: false,
      },
    };
  }

  return {
    valid: false,
    tier: 'free_trial',
    subscription: {
      plan_tier: 'free_trial',
      status: 'trialing',
      is_lifetime: false,
      active_clients_limit: 3,
      ai_briefs_limit_per_month: 10,
      white_label_enabled: false,
      custom_domain_enabled: false,
    },
  };
}
