# 🚀 OnboardFlow — Marketplace Listing Kit & Deliverable Package

> Ready-to-copy listing descriptions, pricing configurations, and buyer transfer files for **AppSumo**, **Acquire.com**, and **Flippa**.

---

## 🎟️ Part 1: AppSumo Partner Submission Guide

### 1. Listing Basics
- **Product Name:** OnboardFlow
- **Category:** Client Management / Project Management / AI Tools / Productivity
- **Tagline (Under 100 characters):**  
  *Automated white-label client onboarding & AI project brief synthesizer for agencies and creators.*
- **Website URL:** `https://your-domain.vercel.app`
- **Redemption / Activation URL:** `https://your-domain.vercel.app/redeem`

### 2. Short Description (Pitch)
> Stop chasing client logos, passwords, questionnaire answers, and signed contracts across WhatsApp and email threads. OnboardFlow gives your agency **1 branded, zero-login link** that collects all client intake data, files, and deposit payments — and automatically synthesizes a **structured AI Project Brief** for your delivery team in seconds.

### 3. Key Feature Bullets (For AppSumo Listing)
- 🤖 **Instant AI Project Briefs:** Automatically extracts primary goals, target audience, deliverable scope, and missing gaps from client submissions into a clean executive brief.
- 🎨 **100% White-Label Client Experience:** Use your agency logo, brand colors, and custom subdomains with zero client login required.
- 🔐 **Social Media & Cloud Access Locker:** Collect Meta Business IDs, Instagram handles, Google Drive/Dropbox links, and CMS credentials securely.
- ⚡ **AI Industry Template Generator:** Generate custom onboarding questionnaires for any niche (Accounting, Social Media, Suppliers, Legal, Real Estate, etc.) in 2 seconds.
- 💳 **Stripe Retainer & Deposit Collection:** Collect kickoff payments directly inside the onboarding flow.
- 💬 **WhatsApp & Slack Instant Webhook Alerts:** Get notified the second a client finishes their intake.
- 🔄 **Automated Inactivity Reminders:** Nudge clients automatically via email if they pause halfway through.

### 4. AppSumo Deal Structure
| Tier | Price | Normal Value | Entitlements |
| :--- | :--- | :--- | :--- |
| **Tier 1 Code** | **\$49** (One-time) | \$348 | Lifetime access, 15 Active Clients at a time, 100 AI Briefs/mo, Custom Branding, All Future Updates |
| **Tier 2 Code (Stack 2)** | **\$99** (One-time) | \$948 | **Unlimited Lifetime Access**, UNLIMITED Active Clients, UNLIMITED AI Briefs, 100% White-Label (no badge), Webhooks & Stripe checkout |

---

## 💼 Part 2: Acquire.com & Flippa Listing Guide

### 1. Listing Title
> **OnboardFlow — B2B Client Onboarding & AI Project Brief SaaS (98% Gross Margins, Full IP)**

### 2. Asking Price & Valuation Recommendation
- **Recommended Listing Price:** **\$2,500 – \$15,000** (depending on whether sold as a turnkey code asset or launched with initial revenue).
- **Gross Profit Margin:** **98%** (Running cost is only ~\$0.002 per AI brief and free/starter tier hosting on Vercel & Supabase).

### 3. What is Included in the Sale
1. **100% Exclusive Source Code & IP:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Supabase PostgreSQL DB with automated migrations.
2. **AI Synthesis Engine:** Dual-provider support (Anthropic Claude 3.5 Sonnet + OpenAI GPT-4o + zero-dependency fallback synthesizer).
3. **Turnkey Buyer Handoff Manual:** Complete [`BUYER_HANDOFF.md`](./BUYER_HANDOFF.md) documentation.
4. **Automated Licensing System:** Built-in AppSumo license key redemption engine and Stripe subscription infrastructure.
5. **Marketing Assets:** Landing pages, pricing tables, feature graphics, and cold outreach scripts.

---

## 📦 Part 3: What to Put in the Uploading File (The Buyer ZIP Package)

When a buyer purchases your software on Flippa, Acquire.com, or directly, package the repository into a single `.zip` file containing:

```text
📁 onboardflow-source-v1.0.zip
├── 📁 app/                    (All Next.js 16 App Router pages & API routes)
├── 📁 components/             (UI components, onboarding wizard, marketing site, dashboard)
├── 📁 lib/                    (AI engine, Supabase clients, billing/licensing, validations)
├── 📁 supabase/migrations/    (PostgreSQL schema & RLS migrations)
├── 📁 types/                  (Complete TypeScript domain types)
├── 📄 BUYER_HANDOFF.md        (Complete operational and technical manual for the new owner)
├── 📄 MARKETPLACE_LISTING_KIT.md (Marketing copy and launch playbook)
├── 📄 README.md               (Local setup and quickstart instructions)
├── 📄 .env.example            (Pre-configured template with all environment variables)
├── 📄 package.json            (Dependencies and scripts)
├── 📄 tsconfig.json           (TypeScript configuration)
└── 📄 vercel.json             (Vercel deployment & daily cron settings)
```

> **Note:** Exclude the `node_modules` folder and `.env.local` from the ZIP file (the buyer runs `npm install` and creates their own `.env.local` using `.env.example`).
