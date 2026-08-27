import {
  Agency,
  Client,
  QuestionnaireQuestion,
  ChecklistTemplateItem,
  Upload,
  ProjectBrief,
  ClientWithDetails,
} from '@/types';

// In-memory data store for seamless local testing & demo mode without live Supabase database
class LocalDataStore {
  private static instance: LocalDataStore;

  public agency: Agency = {
    id: 'demo-agency-001',
    owner_user_id: 'demo-user-001',
    name: 'Velocity Digital Studio',
    slug: 'velocity-studio',
    logo_url: null,
    brand_color: '#3B82F6',
    website: 'https://velocitystudio.com',
    support_email: 'hello@velocitystudio.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  public questions: QuestionnaireQuestion[] = [
    {
      id: 'q1',
      template_id: 'demo-q-001',
      label: 'What are the top 3 goals of this project?',
      description: 'Be as specific as possible about what success looks like.',
      placeholder: 'e.g. 1. Increase conversion rate by 25%, 2. Modernize brand aesthetic...',
      type: 'long_text',
      options: [],
      required: true,
      order_index: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'q2',
      template_id: 'demo-q-001',
      label: 'Who is your primary target audience?',
      description: 'Describe your ideal customer, user demographics, and pain points.',
      placeholder: 'e.g. B2B Founders and Operations Directors managing 10+ employees...',
      type: 'long_text',
      required: true,
      order_index: 2,
      options: [],
      created_at: new Date().toISOString(),
    },
    {
      id: 'q3',
      template_id: 'demo-q-001',
      label: 'What is your target launch date or critical deadline?',
      description: 'Mention any upcoming marketing launches or fixed milestones.',
      placeholder: 'e.g. Q4 Kickoff (November 15th)',
      type: 'short_text',
      required: true,
      order_index: 3,
      options: [],
      created_at: new Date().toISOString(),
    },
    {
      id: 'q4',
      template_id: 'demo-q-001',
      label: 'Do you have existing brand guidelines and color palettes ready?',
      description: 'Choose the option that best reflects your current assets.',
      placeholder: '',
      type: 'single_choice',
      options: [
        'Yes, complete brand guidelines & vector files ready',
        'We have basic logos and colors but need design guidance',
        'No, we need brand assets created from scratch',
      ],
      required: true,
      order_index: 4,
      created_at: new Date().toISOString(),
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
      label: 'Upload Brand Assets & Logos',
      description: 'Vector SVG/PNG logos and guidelines.',
      category: 'asset',
      required: true,
      order_index: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: 'c4',
      template_id: 'demo-c-001',
      label: 'Provide Required Account Logins / Access',
      description: 'Hosting, domain registrar, CMS, or analytics credentials.',
      category: 'access',
      required: false,
      order_index: 4,
      created_at: new Date().toISOString(),
    },
  ];

  public clients: Map<string, Client> = new Map();
  public responses: Map<string, Map<string, any>> = new Map(); // clientId -> (questionId -> answer)
  public checklistStatus: Map<string, Map<string, boolean>> = new Map(); // clientId -> (itemId -> bool)
  public uploads: Map<string, Upload[]> = new Map(); // clientId -> Upload[]
  public briefs: Map<string, ProjectBrief> = new Map(); // clientId -> ProjectBrief

  private constructor() {
    // Seed an initial demo client for quick inspection
    const initialClient: Client = {
      id: 'client_demo_101',
      agency_id: 'demo-agency-001',
      name: 'Sarah Connor',
      email: 'sarah@acme.inc',
      company: 'Acme Corporation',
      status: 'in_progress',
      onboarding_token: 'ob_sarah_connor_demo',
      package_share_token: 'pkg_sarah_connor_demo',
      questionnaire_template_id: 'demo-q-001',
      checklist_template_id: 'demo-c-001',
      last_activity_at: new Date().toISOString(),
      completed_at: null,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.clients.set(initialClient.id, initialClient);

    const clientResponses = new Map<string, any>();
    clientResponses.set('q1', '1. Increase sales conversion by 30%\n2. Redesign customer portal\n3. Launch before Black Friday');
    clientResponses.set('q2', 'Enterprise logistics and supply chain managers in North America.');
    clientResponses.set('q3', 'November 15th, 2026');
    clientResponses.set('q4', 'Yes, complete brand guidelines & vector files ready');
    this.responses.set(initialClient.id, clientResponses);

    const checkMap = new Map<string, boolean>();
    checkMap.set('c1', true);
    checkMap.set('c3', true);
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

  public getClientWithDetails(clientId: string): ClientWithDetails | undefined {
    const client = this.clients.get(clientId);
    if (!client) return undefined;

    const respMap = this.responses.get(clientId) || new Map();
    const responses = Array.from(respMap.entries()).map(([qId, ans]) => ({
      id: `resp_${qId}`,
      client_id: clientId,
      question_id: qId,
      answer: typeof ans === 'string' ? ans : JSON.stringify(ans),
      answer_json: typeof ans !== 'string' ? ans : null,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      question: this.questions.find((q) => q.id === qId),
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
      questionnaire_template: {
        id: 'demo-q-001',
        agency_id: this.agency.id,
        title: 'Standard Project Intake Questionnaire',
        description: 'Default project intake questions.',
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        questions: this.questions,
      },
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
