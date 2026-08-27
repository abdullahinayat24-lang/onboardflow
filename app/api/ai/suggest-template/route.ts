import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { QuestionnaireQuestion, TemplateStepConfig, ServiceCategory } from '@/types';

export interface SuggestTemplateResponse {
  title: string;
  description: string;
  service_category: ServiceCategory;
  step_config: TemplateStepConfig;
  questions: Omit<QuestionnaireQuestion, 'id' | 'template_id' | 'created_at'>[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, details } = body;

    if (!industry || typeof industry !== 'string') {
      return NextResponse.json({ error: 'Industry name is required' }, { status: 400 });
    }

    const provider = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    const systemPrompt = `You are a world-class Operations Architect and Onboarding Workflow Expert.
Given a client type or industry (e.g. Accounting, Supplier/Procurement, Social Media, Legal/Government, Construction, Healthcare, E-commerce), generate a tailored onboarding intake schema.

Crucially:
- Tailor the questions specifically to that industry's operations and jargon.
- Determine whether media/video/image uploads and social media handles make sense. For example, Accountants and Suppliers DO NOT need videos/images or Instagram handles, but DO need financial statements, tax IDs, or compliance documents.
- Set appropriate step_config toggles and upload labels.

Return ONLY valid JSON matching this schema:
{
  "title": "Clear template title",
  "description": "Short explanation of what this intake covers",
  "service_category": "social_media" | "brand_design" | "video_production" | "web_dev" | "accounting" | "supplier_vendor" | "legal_government" | "general",
  "step_config": {
    "enable_media_uploads": boolean,
    "enable_contract_upload": boolean,
    "enable_platform_access": boolean,
    "enable_payment_step": boolean,
    "media_upload_label": "e.g. Tax Documents & Financial Statements OR Brand Assets & Logos",
    "contract_upload_label": "e.g. Signed Service Agreement OR Non-Disclosure Agreement (NDA)"
  },
  "questions": [
    {
      "label": "Question text",
      "description": "Helpful subtitle or null",
      "placeholder": "Helpful placeholder",
      "type": "short_text" | "long_text" | "single_choice" | "multiple_choice" | "number" | "url",
      "options": ["Option 1", "Option 2"] or [],
      "required": boolean,
      "order_index": 1
    }
  ]
}`;

    const userPrompt = `Industry / Company Type: ${industry}\nAdditional Details: ${details || 'Standard onboarding requirements'}`;

    // 1. Try Claude
    if ((provider === 'anthropic' || !openaiApiKey) && anthropicApiKey && anthropicApiKey.trim() !== '') {
      try {
        const anthropic = new Anthropic({ apiKey: anthropicApiKey });
        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 3000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        });

        const block = message.content[0];
        if (block && block.type === 'text') {
          const jsonMatch = block.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]) as SuggestTemplateResponse;
            return NextResponse.json({ template: parsed });
          }
        }
      } catch (err) {
        console.warn('Anthropic template suggestion failed, using fallback:', err);
      }
    }

    // 2. Try OpenAI
    if ((provider === 'openai' || !anthropicApiKey) && openaiApiKey && openaiApiKey.trim() !== '') {
      try {
        const openai = new OpenAI({ apiKey: openaiApiKey });
        const res = await openai.chat.completions.create({
          model: 'gpt-4o',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        });

        const content = res.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content) as SuggestTemplateResponse;
          return NextResponse.json({ template: parsed });
        }
      } catch (err) {
        console.warn('OpenAI template suggestion failed, using fallback:', err);
      }
    }

    // 3. Fallback Heuristic Synthesizer (Instant & Reliable)
    const fallbackTemplate = generateFallbackTemplate(industry);
    return NextResponse.json({ template: fallbackTemplate });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function generateFallbackTemplate(industry: string): SuggestTemplateResponse {
  const lower = industry.toLowerCase();

  // Accounting & Tax
  if (lower.includes('account') || lower.includes('tax') || lower.includes('bookkeep') || lower.includes('cpa')) {
    return {
      title: `${industry} Intake & Compliance`,
      description: 'Intake for accounting, tax filing, payroll configuration, and financial records.',
      service_category: 'accounting',
      step_config: {
        enable_media_uploads: true,
        enable_contract_upload: true,
        enable_platform_access: false,
        enable_payment_step: true,
        media_upload_label: 'Prior Year Tax Returns & P&L Financial Statements',
        contract_upload_label: 'Signed Engagement Letter & NDA',
      },
      questions: [
        {
          label: 'What is your primary business structure and Tax ID (EIN / VAT)?',
          description: 'e.g. LLC, S-Corp, C-Corp, Sole Proprietorship.',
          placeholder: 'e.g. S-Corp, EIN: 12-3456789',
          type: 'short_text',
          options: [],
          required: true,
          order_index: 1,
        },
        {
          label: 'What accounting or bookkeeping software do you currently use?',
          description: 'Select your primary financial ledger.',
          placeholder: '',
          type: 'single_choice',
          options: ['QuickBooks Online', 'Xero', 'FreshBooks', 'Excel / Manual Spreadsheets', 'None yet'],
          required: true,
          order_index: 2,
        },
        {
          label: 'What is your estimated annual revenue and number of bank/credit accounts?',
          description: 'Helps us scope monthly reconciliation volume.',
          placeholder: 'e.g. $500k ARR, 2 checking accounts and 1 corporate credit card',
          type: 'short_text',
          options: [],
          required: true,
          order_index: 3,
        },
        {
          label: 'What are your primary tax deadlines or urgent compliance priorities?',
          description: 'List upcoming quarterly filings, back taxes, or payroll setup.',
          placeholder: 'e.g. Q3 Estimated Taxes due next month, need 2025 W-2s filed...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 4,
        },
      ],
    };
  }

  // Suppliers & Vendor Procurement
  if (lower.includes('supplier') || lower.includes('vendor') || lower.includes('manufactur') || lower.includes('procurement')) {
    return {
      title: `${industry} Vendor Onboarding`,
      description: 'Intake for supplier qualification, manufacturing capacity, MOQ, and shipping terms.',
      service_category: 'supplier_vendor',
      step_config: {
        enable_media_uploads: true,
        enable_contract_upload: true,
        enable_platform_access: false,
        enable_payment_step: false,
        media_upload_label: 'Product Catalogs, Spec Sheets & Quality Certifications',
        contract_upload_label: 'Vendor Master Services Agreement & W-9',
      },
      questions: [
        {
          label: 'What is your primary product category and manufacturing lead time?',
          description: 'Specify typical production turnaround and sample delivery times.',
          placeholder: 'e.g. Custom apparel manufacturing, 3 weeks lead time, 5 days samples...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 1,
        },
        {
          label: 'What are your Minimum Order Quantities (MOQ) and tiered price discounts?',
          description: 'Detail MOQ requirements per unit or SKU.',
          placeholder: 'e.g. Minimum 100 units per style, 15% discount for 500+ units...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 2,
        },
        {
          label: 'What shipping Incoterms and payment terms do you operate under?',
          description: 'e.g. FOB, DDP, Net 30, 50% deposit upfront.',
          placeholder: '',
          type: 'single_choice',
          options: ['FOB (Freight On Board)', 'DDP (Delivered Duty Paid)', 'EXW (Ex Works)', 'Net 30 Days', '50% Deposit / 50% on Delivery'],
          required: true,
          order_index: 3,
        },
      ],
    };
  }

  // Legal & Government Compliance
  if (lower.includes('legal') || lower.includes('government') || lower.includes('law') || lower.includes('compliance')) {
    return {
      title: `${industry} Intake & Verification`,
      description: 'Intake for legal representation, regulatory compliance, and statutory filings.',
      service_category: 'legal_government',
      step_config: {
        enable_media_uploads: true,
        enable_contract_upload: true,
        enable_platform_access: false,
        enable_payment_step: true,
        media_upload_label: 'Identity Proof, Business Licenses & Evidence Documents',
        contract_upload_label: 'Signed Retainer Agreement & Power of Attorney',
      },
      questions: [
        {
          label: 'What is the nature of the legal matter or regulatory matter?',
          description: 'Provide an overview of the scope, dispute, or compliance requirement.',
          placeholder: 'e.g. Trademark registration and intellectual property licensing...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 1,
        },
        {
          label: 'Are there pending court dates, regulatory deadlines, or statute of limitations?',
          description: 'Specify any critical calendar cutoffs.',
          placeholder: 'e.g. Response due within 21 days (by November 10th)...',
          type: 'short_text',
          options: [],
          required: true,
          order_index: 2,
        },
      ],
    };
  }

  // Default Generic Industry Generator
  return {
    title: `${industry} Client Onboarding`,
    description: `Specialized onboarding workflow and questionnaire for ${industry}.`,
    service_category: 'general',
    step_config: {
      enable_media_uploads: true,
      enable_contract_upload: true,
      enable_platform_access: false,
      enable_payment_step: true,
      media_upload_label: 'Supporting Files & Deliverable Documents',
      contract_upload_label: 'Signed Client Contract / MSA',
    },
    questions: [
      {
        label: `What are the top 3 goals of this ${industry} project?`,
        description: 'Detail concrete outcomes and success metrics.',
        placeholder: '1. Goal one, 2. Goal two, 3. Goal three...',
        type: 'long_text',
        options: [],
        required: true,
        order_index: 1,
      },
      {
        label: 'What is your target completion date or critical deadline?',
        description: 'Mention any fixed milestones.',
        placeholder: 'e.g. Within 30 days of kickoff',
        type: 'short_text',
        options: [],
        required: true,
        order_index: 2,
      },
      {
        label: 'What resources or existing data will you provide to support this work?',
        description: 'Detail reference materials, files, or background notes.',
        placeholder: 'e.g. Previous audit reports, brand files, customer list...',
        type: 'long_text',
        options: [],
        required: false,
        order_index: 3,
      },
    ],
  };
}
