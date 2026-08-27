import {
  Agency,
  Client,
  QuestionnaireTemplate,
  QuestionnaireQuestion,
  ChecklistTemplate,
  ChecklistTemplateItem,
  Upload,
  ProjectBrief,
  ClientWithDetails,
  ServiceCategory,
} from '@/types';

class LocalDataStore {
  private static instance: LocalDataStore;

  public agency: Agency = {
    id: 'demo-agency-001',
    owner_user_id: 'demo-user-001',
    name: 'Velocity Creative & Professional Studio',
    slug: 'velocity-studio',
    logo_url: null,
    brand_color: '#3B82F6',
    website: 'https://velocitystudio.com',
    support_email: 'hello@velocitystudio.com',
    webhook_url: null,
    whatsapp_webhook_url: null,
    slack_webhook_url: null,
    stripe_payment_link: 'https://buy.stripe.com/demo_checkout_link',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Pre-configured Service & Industry Specific Questionnaire Templates
  public templates: QuestionnaireTemplate[] = [
    {
      id: 'tpl_social_media',
      agency_id: 'demo-agency-001',
      title: 'Social Media Management & Content Retainer',
      description: 'Intake for Instagram, Facebook, TikTok posting and monthly content calendar creation.',
      service_category: 'social_media',
      is_default: true,
      step_config: {
        enable_media_uploads: true,
        enable_contract_upload: true,
        enable_platform_access: true,
        enable_payment_step: true,
        media_upload_label: 'Brand Assets, Vector Logos & Raw Media',
        contract_upload_label: 'Signed Social Media Service Agreement',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [
        {
          id: 'sm_q1',
          template_id: 'tpl_social_media',
          label: 'What is the primary theme or goal for this month’s social media content?',
          description: 'e.g. Promote new spring drop, drive website visits, establish thought leadership.',
          placeholder: 'e.g. Launch our new seasonal product line and increase Instagram engagement...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'sm_q2',
          template_id: 'tpl_social_media',
          label: 'What is your desired posting frequency and target channels?',
          description: 'Select the primary channels you want us to produce graphics and copy for.',
          placeholder: '',
          type: 'single_choice',
          options: [
            '3x per week (Instagram & Facebook)',
            '5x per week (Instagram, TikTok & Facebook)',
            'Daily Stories & Reels (High-growth package)',
          ],
          required: true,
          order_index: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: 'sm_q3',
          template_id: 'tpl_social_media',
          label: 'What tone of voice and aesthetic best describes your brand?',
          description: 'Explain the visual vibe and caption writing style.',
          placeholder: 'e.g. Minimalist, modern luxury, playful, educational, bold...',
          type: 'short_text',
          options: [],
          required: true,
          order_index: 3,
          created_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'tpl_accounting',
      agency_id: 'demo-agency-001',
      title: 'Accounting, Bookkeeping & Tax Filing',
      description: 'Intake for accounting, tax filings, payroll, and financial statements without media clutter.',
      service_category: 'accounting',
      is_default: false,
      step_config: {
        enable_media_uploads: true,
        enable_contract_upload: true,
        enable_platform_access: false,
        enable_payment_step: true,
        media_upload_label: 'Prior Tax Returns, P&L & Bank Statements',
        contract_upload_label: 'Signed Accounting Engagement Letter & NDA',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [
        {
          id: 'ac_q1',
          template_id: 'tpl_accounting',
          label: 'What is your primary entity structure and Tax ID (EIN / VAT)?',
          description: 'e.g. LLC, S-Corp, C-Corp, Sole Proprietorship.',
          placeholder: 'e.g. S-Corp, EIN: 12-3456789',
          type: 'short_text',
          options: [],
          required: true,
          order_index: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'ac_q2',
          template_id: 'tpl_accounting',
          label: 'What accounting or bookkeeping software do you currently use?',
          description: 'Select your primary financial system.',
          placeholder: '',
          type: 'single_choice',
          options: ['QuickBooks Online', 'Xero', 'FreshBooks', 'Excel / Manual Spreadsheets', 'None yet'],
          required: true,
          order_index: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: 'ac_q3',
          template_id: 'tpl_accounting',
          label: 'What are your urgent tax deadlines or compliance priorities?',
          description: 'List upcoming quarterly filings, payroll deadlines, or back tax needs.',
          placeholder: 'e.g. Q3 Estimated Taxes due next month, need 2025 W-2s filed...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 3,
          created_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'tpl_supplier',
      agency_id: 'demo-agency-001',
      title: 'Supplier & Vendor Procurement Intake',
      description: 'Intake for supplier qualification, manufacturing capacity, MOQ, and shipping terms.',
      service_category: 'supplier_vendor',
      is_default: false,
      step_config: {
        enable_media_uploads: true,
        enable_contract_upload: true,
        enable_platform_access: false,
        enable_payment_step: false,
        media_upload_label: 'Product Catalogs, Spec Sheets & Certifications',
        contract_upload_label: 'Vendor Master Services Agreement & W-9',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [
        {
          id: 'sup_q1',
          template_id: 'tpl_supplier',
          label: 'What is your primary product category and manufacturing turnaround time?',
          description: 'Specify typical production turnaround and sample delivery times.',
          placeholder: 'e.g. Custom apparel manufacturing, 3 weeks lead time, 5 days samples...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'sup_q2',
          template_id: 'tpl_supplier',
          label: 'What are your Minimum Order Quantities (MOQ) and tiered price discounts?',
          description: 'Detail MOQ requirements per unit or SKU.',
          placeholder: 'e.g. Minimum 100 units per style, 15% discount for 500+ units...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 2,
          created_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'tpl_branding',
      agency_id: 'demo-agency-001',
      title: 'Brand Identity & Digital Artwork',
      description: 'Intake for custom illustration, logo design, vector branding, and color palettes.',
      service_category: 'brand_design',
      is_default: false,
      step_config: {
        enable_media_uploads: true,
        enable_contract_upload: true,
        enable_platform_access: false,
        enable_payment_step: true,
        media_upload_label: 'Existing Logos, Moodboards & References',
        contract_upload_label: 'Signed Design Agreement',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [
        {
          id: 'br_q1',
          template_id: 'tpl_branding',
          label: 'What emotions or feelings should your brand artwork evoke?',
          description: 'Describe the impression someone should have when seeing your visual identity.',
          placeholder: 'e.g. Premium, trustworthy, futuristic, organic...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 1,
          created_at: new Date().toISOString(),
        },
      ],
    },
  ];

  public checklistItems: ChecklistTemplateItem[] = [
    {
      id: 'c1',
      template_id: 'demo-c-001',
      label: 'Complete Intake Questionnaire',
      description: 'Answer required questions.',
      category: 'questionnaire',
      required: true,
      order_index: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'c2',
      template_id: 'demo-c-001',
      label: 'Upload Signed Contract / Agreement',
      description: 'Provide signed service agreement or engagement letter.',
      category: 'contract',
      required: true,
      order_index: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: 'c3',
      template_id: 'demo-c-001',
      label: 'Upload Required Documents or Assets',
      description: 'Upload required files, tax docs, or brand assets.',
      category: 'asset',
      required: true,
      order_index: 3,
      created_at: new Date().toISOString(),
    },
  ];

  public clients: Map<string, Client> = new Map();
  public responses: Map<string, Map<string, any>> = new Map();
  public checklistStatus: Map<string, Map<string, boolean>> = new Map();
  public uploads: Map<string, Upload[]> = new Map();
  public briefs: Map<string, ProjectBrief> = new Map();

  private constructor() {
    const initialClient: Client = {
      id: 'client_demo_101',
      agency_id: 'demo-agency-001',
      name: 'Sarah Connor',
      email: 'sarah@acme.inc',
      company: 'Acme Apparel',
      service_category: 'social_media',
      status: 'in_progress',
      onboarding_token: 'ob_sarah_connor_demo',
      package_share_token: 'pkg_sarah_connor_demo',
      questionnaire_template_id: 'tpl_social_media',
      checklist_template_id: 'demo-c-001',
      platform_access: {
        instagram_handle: '@acmeapparel_official',
        facebook_page_url: 'https://facebook.com/acmeapparel',
        google_drive_folder_url: 'https://drive.google.com/drive/folders/demo_acme_assets',
      },
      payment: {
        required: true,
        amount_cents: 150000,
        currency: 'USD',
        is_paid: true,
        paid_at: new Date().toISOString(),
      },
      last_activity_at: new Date().toISOString(),
      completed_at: null,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.clients.set(initialClient.id, initialClient);

    const clientResponses = new Map<string, any>();
    clientResponses.set('sm_q1', 'Launch our Autumn collection and grow Instagram following by 5,000 active buyers.');
    clientResponses.set('sm_q2', '5x per week (Instagram, TikTok & Facebook)');
    clientResponses.set('sm_q3', 'Warm minimalist streetwear, high-contrast typography, witty engaging captions.');
    this.responses.set(initialClient.id, clientResponses);

    const checkMap = new Map<string, boolean>();
    checkMap.set('c1', true);
    checkMap.set('c2', true);
    checkMap.set('c3', true);
    this.checklistStatus.set(initialClient.id, checkMap);
  }

  public static getInstance(): LocalDataStore {
    if (!LocalDataStore.instance) {
      LocalDataStore.instance = new LocalDataStore();
    }
    return LocalDataStore.instance;
  }

  public getClientByToken(token: string): Client | undefined {
    for (const client of this.clients.values()) {
      if (client.onboarding_token === token) return client;
    }
    return undefined;
  }

  public getClientByShareToken(shareToken: string): Client | undefined {
    for (const client of this.clients.values()) {
      if (client.package_share_token === shareToken) return client;
    }
    return undefined;
  }

  public getTemplate(id?: string | null): QuestionnaireTemplate {
    if (!id) return this.templates[0];
    const found = this.templates.find((t) => t.id === id);
    return found || this.templates[0];
  }

  public addTemplate(template: QuestionnaireTemplate) {
    this.templates.unshift(template);
  }

  public getClientWithDetails(clientId: string): ClientWithDetails | undefined {
    const client = this.clients.get(clientId);
    if (!client) return undefined;

    const template = this.getTemplate(client.questionnaire_template_id);
    const questions = template.questions || [];

    const respMap = this.responses.get(clientId) || new Map();
    const responses = Array.from(respMap.entries()).map(([qId, ans]) => ({
      id: `resp_${qId}`,
      client_id: clientId,
      question_id: qId,
      answer: typeof ans === 'string' ? ans : JSON.stringify(ans),
      answer_json: typeof ans !== 'string' ? ans : null,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      question: questions.find((q) => q.id === qId) || {
        id: qId,
        template_id: template.id,
        label: 'Intake Question',
        description: null,
        placeholder: null,
        type: 'long_text' as const,
        required: true,
        order_index: 1,
        created_at: new Date().toISOString(),
      },
    }));

    const checkMap = this.checklistStatus.get(clientId) || new Map();
    const checklist_status = Array.from(checkMap.entries()).map(([cId, isCompleted]) => ({
      id: `chk_${cId}`,
      client_id: clientId,
      checklist_item_id: cId,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      notes: null,
      item: this.checklistItems.find((c) => c.id === cId),
    }));

    const uploads = this.uploads.get(clientId) || [];
    const brief = this.briefs.get(clientId) || null;

    return {
      ...client,
      agency: this.agency,
      questionnaire_template: template,
      checklist_template: {
        id: 'demo-c-001',
        agency_id: this.agency.id,
        title: 'Standard Onboarding Checklist',
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: this.checklistItems,
      },
      responses,
      checklist_status,
      uploads,
      brief,
    };
  }
}

export const localStore = LocalDataStore.getInstance();
