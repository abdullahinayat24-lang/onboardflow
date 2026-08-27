# OnboardFlow — Client Onboarding Automation SaaS

> **Positioning:** *"Turn a signed client into a project-ready client automatically."*  
> **Not:** another client portal.

OnboardFlow is a full-stack, production-ready SaaS for agencies and freelancers that replaces chaotic email threads, Google Drive folders, and manual intake forms with a single branded, intelligent onboarding link.

---

## 🚀 Key Features Built in MVP

1. **Agency Authentication & White-Label Branding**
   - Supabase Auth (email/password & agency onboarding).
   - Custom Agency Name, Logo URL, Slug, Support Email, and dynamic Primary Brand Color picker.
   - White-labeled client pages dynamically rendered with the agency's branding.

2. **Template Builders (Questionnaires & Checklists)**
   - **Smart Questionnaire Builder**: Custom intake questions (short text, long text, single choice, multiple choice, number, URL) with required flags and order arrangement.
   - **Deliverables Checklist Builder**: Reusable checklist templates for contracts, assets, access credentials, and custom deliverables.
   - **Auto-Provisioning**: Automatic trigger seeds default high-converting intake templates on signup.

3. **Client Creation & Management Dashboard**
   - Create new client records with auto-generated, high-entropy tokens:
     - `onboarding_token` (e.g. `ob_...`) for client access without login.
     - `package_share_token` (e.g. `pkg_...`) for team handoffs.
   - One-click copy onboarding link + one-click send branded invitation email via Resend.
   - 360-degree Client Detail view with progress tracker (% completed), questionnaire responses, attached assets, and checklist statuses.

4. **Client-Facing Onboarding Wizard (`/onboard/[token]`)**
   - **No Login Required**: Zero friction token-based access.
   - Multi-step interactive flow:
     - **Step 1: Welcome & Overview** — estimated completion time and checklist overview.
     - **Step 2: Smart Questionnaire** — dynamic form rendering with real-time auto-saving.
     - **Step 3: Brand Assets & File Upload** — drag-and-drop file upload with category tagging.
     - **Step 4: Contract Upload & Review** — dedicated agreement/contract uploader.
     - **Step 5: Review & Submit** — live summary of all submitted answers and deliverables.
     - **Step 6: Completion Celebration** — celebratory confetti and next steps guide.

5. **AI Summary & Structured Project Brief Generation (`lib/ai/`)**
   - Supports **Anthropic Claude 3.5 Sonnet** and **OpenAI GPT-4o** (configurable via `AI_PROVIDER` env var).
   - Built-in heuristic synthesizer fallback ensuring zero downtime even without external API keys.
   - Outputs:
     - **Executive Summary**: 2-3 paragraph synthesis of client objectives, urgency, and primary contact.
     - **Structured Project Brief**: Markdown document with Goals, Scope Boundaries, Assets Analysis, Open Gaps/Risks, and Kickoff Action Plan.
   - Editable inside the Agency Dashboard before marking as **Final**.

6. **Shareable Handoff Package (`/package/[shareToken]`)**
   - Read-only, clean handoff page for project managers, designers, and developers.
   - Contains finalized Project Brief, downloadable brand files/agreements, and verified checklist status.
   - Print-optimized CSS (`@media print`) for instant PDF export.

7. **Automated Reminder Engine (`/api/cron/reminders`)**
   - Configurable per agency: days of inactivity delay, max reminders limit, enabled/disabled toggle, and custom nudge copy.
   - Cron-ready API route secured with `CRON_SECRET` for Vercel Cron or scheduled runners.

---

## 🛠 Tech Stack

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Database & Auth:** PostgreSQL via Supabase with Row-Level Security (RLS)
- **Storage:** Supabase Storage (`uploads` and `contracts` buckets)
- **Styling & UI:** Tailwind CSS, Lucide Icons, Canvas Confetti
- **Email:** Resend
- **AI Engine:** Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o with Heuristic Fallback
- **Hosting:** Vercel

---

## 📦 Project Structure

```
onboardflow/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Agency Login
│   │   └── signup/page.tsx          # Agency Registration
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Sidebar & Agency context
│   │   ├── page.tsx                 # KPI Overview Dashboard
│   │   ├── clients/
│   │   │   ├── page.tsx             # Clients Directory & search
│   │   │   └── [id]/page.tsx        # 360 Client View & Brief Editor
│   │   ├── templates/page.tsx       # Questionnaire & Checklist Builder
│   │   └── settings/page.tsx        # Agency Branding & Reminders
│   ├── onboard/[token]/page.tsx     # Public Client Onboarding Flow
│   ├── package/[shareToken]/page.tsx# Shareable / Printable Handoff Package
│   └── api/
│       ├── ai/generate-brief/       # AI Brief Generation endpoint
│       ├── clients/                 # Client CRUD & email invites
│       ├── cron/reminders/          # Automated reminder cron job
│       ├── onboarding/save/         # Client response auto-save
│       ├── onboarding/submit/       # Final submission & brief trigger
│       ├── settings/                # Branding & reminder settings
│       ├── templates/               # Template save handlers
│       └── upload/                  # File & contract uploads
├── components/
│   ├── ui/                          # Button, Card, Dialog, Input, Progress, Toast, Tabs
│   ├── dashboard/                   # Sidebar, Header, StatsCards, ClientTable, BriefEditor
│   ├── onboarding/                  # OnboardingWizard & 6 step components
│   └── templates/                   # QuestionnaireBuilder, ChecklistBuilder
├── lib/
│   ├── ai/                          # Universal LLM Provider & Prompts
│   ├── email/                       # Resend & HTML Email templates
│   ├── supabase/                    # Browser, Server, Admin & Middleware clients
│   ├── validations/                 # Zod validation schemas
│   └── utils.ts                     # Tokens, formatters, progress math
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql   # PostgreSQL tables, triggers, RLS policies
        └── 002_storage_setup.sql    # Storage buckets & policies
```

---

## ⚙️ Environment Variables

Create a `.env.local` file (refer to `.env.example`):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Provider Configuration ("anthropic" or "openai")
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...
# OPENAI_API_KEY=sk-proj-...

# Email Configuration (Resend)
RESEND_API_KEY=re_123456789
RESEND_FROM_EMAIL=OnboardFlow <onboarding@yourdomain.com>

# Cron Security Token
CRON_SECRET=your_super_secret_cron_token_here
```

---

## 🚀 Getting Started Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run database migrations on Supabase:**
   - Go to your Supabase Project Dashboard -> **SQL Editor**.
   - Copy and run `supabase/migrations/001_initial_schema.sql`.
   - Copy and run `supabase/migrations/002_storage_setup.sql`.

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete OnboardFlow SaaS implementation"
   git push origin main
   ```
2. Import the project into **Vercel**.
3. Under **Project Settings -> Environment Variables**, add all variables from `.env.example`.
4. Deploy!

To enable automatic reminder emails on Vercel:
- Add a `vercel.json` cron entry:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/reminders",
        "schedule": "0 9 * * *"
      }
    ]
  }
  ```

---

## 🔮 Phase 2 Roadmap (Explicitly Deferred from MVP)

- Stripe subscription billing & seat pricing tiers
- Zapier / Make / n8n webhook triggers
- Ongoing Client Portal (post-onboarding project tracker)
- Advanced analytics & time-to-onboard reporting
