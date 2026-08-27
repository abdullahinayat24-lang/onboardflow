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
    name: 'Velocity Creative Studio',
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

  // Pre-configured Service-Specific Questionnaire Templates
  public templates: QuestionnaireTemplate[] = [
    {
      id: 'tpl_social_media',
      agency_id: 'demo-agency-001',
      title: 'Social Media Management & Content Retainer',
      description: 'Intake for Instagram, Facebook, TikTok posting and monthly content calendar creation.',
      service_category: 'social_media',
      is_default: true,
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
        {
          id: 'sm_q4',
          template_id: 'tpl_social_media',
          label: 'Are there specific hashtags, brand taglines, or topics to avoid?',
          description: 'List any mandatory keywords or sensitive topics.',
          placeholder: 'e.g. Always use #AcmeStyle, never mention competitor brands...',
          type: 'long_text',
          options: [],
          required: false,
          order_index: 4,
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
        {
          id: 'br_q2',
          template_id: 'tpl_branding',
          label: 'Do you have existing color palettes or hex codes?',
          description: 'List your hex codes or describe color preferences.',
          placeholder: 'e.g. Deep Navy #0F172A, Gold #EAB308, Off-white #F8FAFC...',
          type: 'short_text',
          options: [],
          required: false,
          order_index: 2,
          created_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'tpl_video',
      agency_id: 'demo-agency-001',
      title: 'Video Production & Reel Editing',
      description: 'Intake for short-form Reels, TikToks, YouTube, and promotional video edits.',
      service_category: 'video_production',
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [
        {
          id: 'vd_q1',
          template_id: 'tpl_video',
          label: 'What video formats and aspect ratios do you need?',
          description: 'Select all required export formats.',
          placeholder: '',
          type: 'single_choice',
          options: [
            'Vertical 9:16 (Instagram Reels & TikTok)',
            'Horizontal 16:9 (YouTube & Website)',
            'Both Vertical (9:16) and Horizontal (16:9)',
          ],
          required: true,
          order_index: 1,
          created_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'tpl_web',
      agency_id: 'demo-agency-001',
      title: 'Website & App Development',
      description: 'Intake for web design, landing pages, Next.js, and web application projects.',
      service_category: 'web_dev',
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [
        {
          id: 'wb_q1',
          template_id: 'tpl_web',
          label: 'What are the top 3 functionalities required on your site?',
          description: 'e.g. Lead generation forms, stripe checkout, client portal, blog.',
          placeholder: 'e.g. 1. Fast landing page, 2. Online booking system, 3. SEO optimization...',
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
      description: 'Answer project vision, goals, and audience questions.',
      category: 'questionnaire',
      required: true,
      order_index: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'c2',
      template_id: 'demo-c-001',
      label: 'Upload Signed Contract / Agreement',
      description: 'Provide signed service agreement or MSA.',
      category: 'contract',
      required: true,
      order_index: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: 'c3',
      template_id: 'demo-c-001',
      label: 'Upload Brand Assets & Raw Photos',
      description: 'Vector SVG/PNG logos, product photos, and design files.',
      category: 'asset',
      required: true,
      order_index: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: 'c4',
      template_id: 'demo-c-001',
      label: 'Share Platform & Social Media Access',
      description: 'Instagram handle, Meta Business ID, or Google Drive folder.',
      category: 'access',
      required: false,
      order_index: 4,
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
    checkMap.set('c3', true);
    checkMap.set('c4', true);
    this.checklistStatus.set(initialClient.id, checkMap);

    this.uploads.set(initialClient.id, [
      {
        id: 'up_1',
        client_id: initialClient.id,
        category: 'brand',
        filename: 'acme-primary-logo.svg',
        file_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
        storage_path: 'uploads/acme-primary-logo.svg',
        file_size: 245800,
        mime_type: 'image/svg+xml',
        uploaded_at: new Date().toISOString(),
      },
    ]);
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
        title: 'Standard Creative Onboarding Checklist',
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
