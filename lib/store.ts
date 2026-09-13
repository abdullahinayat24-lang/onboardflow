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
  Staff,
  Department,
  Project,
  Task,
  TaskComment,
  Workflow,
  WorkflowStage,
  Notification,
  ActivityLog,
  StaffWorkLog,
  PerformanceReport,
} from '@/types';

class LocalDataStore {
  private static instance: LocalDataStore;

  public agency: Agency = {
    id: '32c8d149-f62a-405c-94eb-eaf411d82261',
    owner_user_id: 'b8c03c95-4cb7-44ec-ab89-61eb5e664d5b',
    name: 'OnboardFlow Demo',
    slug: 'onboardflow-demo',
    logo_url: null,
    brand_color: '#3B82F6',
    website: 'https://onboardflow-wheat.vercel.app',
    support_email: 'hello@onboardflow.com',
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

  public departments: Department[] = [
    { id: 'dept_management', agency_id: 'demo-agency-001', name: 'Management', description: 'Executive & Strategy', color: '#059669', created_at: new Date().toISOString() },
    { id: 'dept_seo', agency_id: 'demo-agency-001', name: 'SEO & Content', description: 'Search optimization & copywriting', color: '#3B82F6', created_at: new Date().toISOString() },
    { id: 'dept_design', agency_id: 'demo-agency-001', name: 'Design & Creative', description: 'Branding, UI & visual assets', color: '#8B5CF6', created_at: new Date().toISOString() },
    { id: 'dept_video', agency_id: 'demo-agency-001', name: 'Video & Motion', description: 'Reels, YouTube & short-form video', color: '#F59E0B', created_at: new Date().toISOString() },
    { id: 'dept_dev', agency_id: 'demo-agency-001', name: 'Web Development', description: 'Websites, web apps & integrations', color: '#10B981', created_at: new Date().toISOString() },
    { id: 'dept_account', agency_id: 'demo-agency-001', name: 'Account Management', description: 'Client onboarding & relations', color: '#EC4899', created_at: new Date().toISOString() },
  ];

  public staff: Map<string, Staff> = new Map();
  public projects: Map<string, Project> = new Map();
  public tasks: Map<string, Task> = new Map();
  public taskComments: Map<string, TaskComment[]> = new Map();
  public workflows: Map<string, Workflow> = new Map();
  public notifications: Notification[] = [];
  public activityLogs: ActivityLog[] = [];
  public workLogs: StaffWorkLog[] = [];

  public clients: Map<string, Client> = new Map();
  public responses: Map<string, Map<string, any>> = new Map();
  public checklistStatus: Map<string, Map<string, boolean>> = new Map();
  public uploads: Map<string, Upload[]> = new Map();
  public briefs: Map<string, ProjectBrief> = new Map();

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): LocalDataStore {
    if (!(globalThis as any).__localStoreInstance) {
      (globalThis as any).__localStoreInstance = new LocalDataStore();
    }
    return (globalThis as any).__localStoreInstance;
  }

  private seedInitialData() {
    const initialStaff: Staff[] = [
      {
        id: 'staff_alex',
        agency_id: 'demo-agency-001',
        name: 'Alex Rivera',
        email: 'alex@onboardflow.com',
        phone: '+1 (555) 234-5678',
        avatar_url: null,
        role: 'owner',
        department: 'Management',
        status: 'active',
        is_online: true,
        manager_id: null,
        manager_name: null,
        assigned_clients_count: 5,
        active_tasks_count: 3,
        completed_tasks_count: 24,
        overdue_tasks_count: 0,
        performance_score: 98,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'staff_sarah',
        agency_id: 'demo-agency-001',
        name: 'Sarah Chen',
        email: 'sarah.c@onboardflow.com',
        phone: '+1 (555) 345-6789',
        avatar_url: null,
        role: 'manager',
        department: 'SEO & Content',
        status: 'active',
        is_online: true,
        manager_id: 'staff_alex',
        manager_name: 'Alex Rivera',
        assigned_clients_count: 4,
        active_tasks_count: 4,
        completed_tasks_count: 19,
        overdue_tasks_count: 1,
        performance_score: 94,
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'staff_elena',
        agency_id: 'demo-agency-001',
        name: 'Elena Rostova',
        email: 'elena@onboardflow.com',
        phone: '+1 (555) 456-7890',
        avatar_url: null,
        role: 'staff',
        department: 'Design & Creative',
        status: 'active',
        is_online: true,
        manager_id: 'staff_sarah',
        manager_name: 'Sarah Chen',
        assigned_clients_count: 3,
        active_tasks_count: 5,
        completed_tasks_count: 17,
        overdue_tasks_count: 0,
        performance_score: 96,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'staff_marcus',
        agency_id: 'demo-agency-001',
        name: 'Marcus Vance',
        email: 'marcus@onboardflow.com',
        phone: '+1 (555) 567-8901',
        avatar_url: null,
        role: 'staff',
        department: 'Video & Motion',
        status: 'active',
        is_online: false,
        manager_id: 'staff_alex',
        manager_name: 'Alex Rivera',
        assigned_clients_count: 2,
        active_tasks_count: 2,
        completed_tasks_count: 12,
        overdue_tasks_count: 1,
        performance_score: 91,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'staff_david',
        agency_id: 'demo-agency-001',
        name: 'David Kim',
        email: 'david@onboardflow.com',
        phone: '+1 (555) 678-9012',
        avatar_url: null,
        role: 'staff',
        department: 'Web Development',
        status: 'active',
        is_online: true,
        manager_id: 'staff_alex',
        manager_name: 'Alex Rivera',
        assigned_clients_count: 3,
        active_tasks_count: 3,
        completed_tasks_count: 15,
        overdue_tasks_count: 0,
        performance_score: 93,
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'staff_priya',
        agency_id: 'demo-agency-001',
        name: 'Priya Patel',
        email: 'priya@onboardflow.com',
        phone: '+1 (555) 789-0123',
        avatar_url: null,
        role: 'manager',
        department: 'Account Management',
        status: 'active',
        is_online: true,
        manager_id: 'staff_alex',
        manager_name: 'Alex Rivera',
        assigned_clients_count: 6,
        active_tasks_count: 3,
        completed_tasks_count: 28,
        overdue_tasks_count: 0,
        performance_score: 97,
        created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    initialStaff.forEach((s) => this.staff.set(s.id, s));

    const client1: Client = {
      id: 'client_demo_101',
      agency_id: 'demo-agency-001',
      name: 'Sarah Connor',
      email: 'sarah@acme.inc',
      company: 'Acme Apparel',
      phone: '+1 (415) 890-1234',
      website: 'https://acmeapparel.demo',
      service_category: 'social_media',
      status: 'completed',
      project_status: 'ready_for_project',
      onboarding_token: 'ob_sarah_connor_demo',
      package_share_token: 'pkg_sarah_connor_demo',
      questionnaire_template_id: 'tpl_social_media',
      checklist_template_id: 'demo-c-001',
      manager_id: 'staff_priya',
      assigned_staff_ids: ['staff_sarah', 'staff_elena'],
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
        paid_at: new Date(Date.now() - 48 * 3600000).toISOString(),
      },
      last_activity_at: new Date().toISOString(),
      completed_at: new Date(Date.now() - 36 * 3600000).toISOString(),
      is_starred: true,
      is_archived: false,
      metadata: {
        branches_count: 3,
        local_radius_km: 3,
        campaigns_active: 2,
        vouchers_redeemed: 1,
      },
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const client2: Client = {
      id: 'client_demo_102',
      agency_id: 'demo-agency-001',
      name: 'Marcus Aurelius',
      email: 'marcus@meditationscoffee.com',
      company: 'Meditations Coffee',
      phone: '+1 (212) 345-6789',
      website: 'https://meditationscoffee.demo',
      service_category: 'brand_design',
      status: 'in_progress',
      project_status: 'pending_onboarding',
      onboarding_token: 'ob_marcus_coffee_demo',
      package_share_token: 'pkg_marcus_coffee_demo',
      questionnaire_template_id: 'tpl_branding',
      checklist_template_id: 'demo-c-001',
      manager_id: 'staff_sarah',
      assigned_staff_ids: ['staff_elena', 'staff_david'],
      platform_access: {
        instagram_handle: '@meditationscoffee',
      },
      payment: {
        required: true,
        amount_cents: 220000,
        currency: 'USD',
        is_paid: true,
        paid_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      last_activity_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      completed_at: null,
      is_starred: false,
      is_archived: false,
      metadata: {
        branches_count: 1,
        local_radius_km: 5,
        campaigns_active: 1,
      },
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const client3: Client = {
      id: 'client_demo_103',
      agency_id: 'demo-agency-001',
      name: 'Maya Lin',
      email: 'maya@horizonstudio.co',
      company: 'Horizon Architecture',
      phone: '+1 (312) 555-8921',
      website: 'https://horizonstudio.demo',
      service_category: 'general',
      status: 'invited',
      project_status: 'pending_onboarding',
      onboarding_token: 'ob_maya_horizon_demo',
      package_share_token: 'pkg_maya_horizon_demo',
      questionnaire_template_id: 'tpl_social_media',
      checklist_template_id: 'demo-c-001',
      manager_id: 'staff_priya',
      assigned_staff_ids: ['staff_david'],
      last_activity_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      completed_at: null,
      is_starred: false,
      is_archived: false,
      metadata: {
        branches_count: 2,
      },
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const clientArchived: Client = {
      id: 'client_demo_104',
      agency_id: 'demo-agency-001',
      name: 'Evelyn Reed',
      email: 'evelyn@quantumrobotics.dev',
      company: 'Quantum Robotics (Archived)',
      phone: '+1 (650) 444-1234',
      website: 'https://quantumrobotics.demo',
      service_category: 'web_dev',
      status: 'completed',
      project_status: 'delivered',
      onboarding_token: 'ob_evelyn_archived_demo',
      package_share_token: 'pkg_evelyn_archived_demo',
      questionnaire_template_id: 'tpl_social_media',
      checklist_template_id: 'demo-c-001',
      manager_id: 'staff_alex',
      assigned_staff_ids: ['staff_david'],
      last_activity_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      completed_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      is_starred: false,
      is_archived: true,
      archived_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    };

    this.clients.set(client1.id, client1);
    this.clients.set(client2.id, client2);
    this.clients.set(client3.id, client3);
    this.clients.set(clientArchived.id, clientArchived);

    const clientResponses = new Map<string, any>();
    clientResponses.set('sm_q1', 'Launch our Autumn streetwear drop and grow Instagram following by 5,000 active buyers.');
    clientResponses.set('sm_q2', '5x per week (Instagram, TikTok & Facebook)');
    clientResponses.set('sm_q3', 'Warm minimalist streetwear, high-contrast typography, witty engaging captions.');
    this.responses.set(client1.id, clientResponses);

    const checkMap = new Map<string, boolean>();
    checkMap.set('c1', true);
    checkMap.set('c2', true);
    checkMap.set('c3', true);
    this.checklistStatus.set(client1.id, checkMap);

    const brief1: ProjectBrief = {
      id: 'brief_client_demo_101',
      client_id: client1.id,
      ai_summary: 'Acme Apparel is launching a seasonal Autumn apparel line targeting Gen-Z & Millennial urban consumers with high-impact Reels and daily stories.',
      ai_brief: 'Executive Strategy: Focus on product-in-use short form video, influencer seeding, and high-contrast typographic carousel posts.',
      goals: ['Achieve 5,000 net new Instagram followers in 60 days', 'Maintain 4.5% organic engagement rate', 'Generate 400 direct click-throughs to Autumn collection checkout'],
      scope: ['Daily Instagram & Facebook posting', 'Weekly TikTok trend remixing', 'Monthly performance analytics and audience sentiment reporting'],
      key_assets: ['Vector master logo SVG', 'High-res Autumn lookbook imagery', 'Brand color guidelines (HEX #E11D48, #0F172A)'],
      open_gaps: ['Need finalized launch date for secondary capsule release', 'TikTok Business Ad Account access credentials needed'],
      next_steps: ['Complete keyword baseline audit', 'Deliver initial 15-day content grid for approval', 'Schedule photographer kickoff sync'],
      status: 'final',
      generated_at: new Date(Date.now() - 36 * 3600000).toISOString(),
      edited_at: new Date(Date.now() - 30 * 3600000).toISOString(),
    };
    this.briefs.set(client1.id, brief1);

    const project1: Project = {
      id: 'proj_acme_01',
      agency_id: 'demo-agency-001',
      client_id: client1.id,
      title: 'Acme Apparel — Autumn Content Retainer & Growth',
      description: 'Comprehensive social media growth, Reels production, and brand asset launch.',
      status: 'active',
      priority: 'high',
      manager_id: 'staff_priya',
      start_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      due_date: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.projects.set(project1.id, project1);

    const wf1: Workflow = {
      id: 'wf_acme_01',
      agency_id: 'demo-agency-001',
      client_id: client1.id,
      project_id: project1.id,
      name: 'Standard Agency Client Delivery Workflow',
      description: '5-stage production & delivery pipeline',
      status: 'active',
      current_stage_index: 2,
      stages: [
        {
          id: 'stg_1',
          workflow_id: 'wf_acme_01',
          title: 'Stage 1: Weekly Audit of Client & Check Issues',
          description: 'Audit existing assets, analyze competitors, and verify all intake responses.',
          responsible_staff_id: 'staff_sarah',
          order_index: 1,
          status: 'completed',
          due_date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
          completed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          notes: 'Audit passed with 100% verified asset files.',
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'stg_2',
          workflow_id: 'wf_acme_01',
          title: 'Stage 2: Strategy & Kickoff Meeting',
          description: 'Alignment call with Sarah Connor to approve monthly milestones and visual aesthetic.',
          responsible_staff_id: 'staff_priya',
          order_index: 2,
          status: 'completed',
          due_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
          completed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
          notes: 'Client signed off on editorial calendar direction.',
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'stg_3',
          workflow_id: 'wf_acme_01',
          title: 'Stage 3: Client Work Execution & Production',
          description: 'Design brand graphics, write copy captions, and produce weekly Reels videos.',
          responsible_staff_id: 'staff_elena',
          order_index: 3,
          status: 'current',
          due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          completed_at: null,
          notes: 'First batch of 10 graphics currently in layout.',
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'stg_4',
          workflow_id: 'wf_acme_01',
          title: 'Stage 4: Quality Review & Client Feedback',
          description: 'Internal creative director review and client sign-off before scheduling.',
          responsible_staff_id: 'staff_alex',
          order_index: 4,
          status: 'pending',
          due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          completed_at: null,
          notes: null,
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'stg_5',
          workflow_id: 'wf_acme_01',
          title: 'Stage 5: Final Delivery & Publishing',
          description: 'Schedule content in Meta Business Suite and hand off final packages.',
          responsible_staff_id: 'staff_priya',
          order_index: 5,
          status: 'pending',
          due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
          completed_at: null,
          notes: null,
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.workflows.set(wf1.id, wf1);

    const initialTasks: Task[] = [
      {
        id: 'task_101',
        agency_id: 'demo-agency-001',
        client_id: client1.id,
        project_id: project1.id,
        workflow_stage_id: 'stg_1',
        title: 'Audit competitor keywords & search ranking baseline',
        description: 'Analyze top 5 competing streetwear brands on Instagram & Google search to uncover organic keyword gaps.',
        assigned_to: 'staff_sarah',
        manager_id: 'staff_alex',
        department: 'SEO & Content',
        priority: 'high',
        status: 'completed',
        due_date: new Date(Date.now() - 3 * 86400000).toISOString(),
        completed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        tags: ['SEO', 'Audit', 'Competitors'],
        checklist: [
          { id: 'chk_1', text: 'Identify 5 competitors', completed: true },
          { id: 'chk_2', text: 'Extract keyword gap report', completed: true },
          { id: 'chk_3', text: 'Export PDF findings to client folder', completed: true },
        ],
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'task_102',
        agency_id: 'demo-agency-001',
        client_id: client1.id,
        project_id: project1.id,
        workflow_stage_id: 'stg_3',
        title: 'Design Autumn Collection typography & color palettes',
        description: 'Create master Figma visual kit incorporating client hex codes and moody urban aesthetic.',
        assigned_to: 'staff_elena',
        manager_id: 'staff_sarah',
        department: 'Design & Creative',
        priority: 'urgent',
        status: 'in_progress',
        due_date: new Date(Date.now() + 1 * 86400000).toISOString(),
        completed_at: null,
        tags: ['Design', 'Branding', 'Figma'],
        checklist: [
          { id: 'chk_4', text: 'Define 3 primary headline fonts', completed: true },
          { id: 'chk_5', text: 'Design 5 carousel template cards', completed: true },
          { id: 'chk_6', text: 'Export story backgrounds in 9:16 ratio', completed: false },
        ],
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'task_103',
        agency_id: 'demo-agency-001',
        client_id: client1.id,
        project_id: project1.id,
        workflow_stage_id: 'stg_3',
        title: 'Produce & edit 30-sec Instagram Reels launch video',
        description: 'Cut raw lookbook footage with trending audio and dynamic kinetic typography captions.',
        assigned_to: 'staff_marcus',
        manager_id: 'staff_alex',
        department: 'Video & Motion',
        priority: 'medium',
        status: 'open',
        due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
        completed_at: null,
        tags: ['Video', 'Reels', 'Premiere'],
        checklist: [
          { id: 'chk_7', text: 'Select licensed audio track', completed: false },
          { id: 'chk_8', text: 'Color grade raw 4K clips', completed: false },
          { id: 'chk_9', text: 'Add viral captions & sound effects', completed: false },
        ],
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'task_104',
        agency_id: 'demo-agency-001',
        client_id: client2.id,
        project_id: null,
        workflow_stage_id: null,
        title: 'Implement Shopify checkout conversion tracking & pixel',
        description: 'Connect Meta Business Pixel and Google Analytics 4 event tracking for Meditations Coffee store.',
        assigned_to: 'staff_david',
        manager_id: 'staff_alex',
        department: 'Web Development',
        priority: 'high',
        status: 'blocked',
        due_date: new Date(Date.now() - 1 * 86400000).toISOString(),
        completed_at: null,
        tags: ['Web', 'Analytics', 'Tracking'],
        checklist: [
          { id: 'chk_10', text: 'Request client Shopify collaborator access', completed: true },
          { id: 'chk_11', text: 'Inject GA4 script tag', completed: false },
        ],
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'task_105',
        agency_id: 'demo-agency-001',
        client_id: client1.id,
        project_id: project1.id,
        workflow_stage_id: 'stg_2',
        title: 'Host Strategy Kickoff Alignment Meeting',
        description: 'Review AI brief deliverables, confirm approval pipeline, and record meeting minutes.',
        assigned_to: 'staff_priya',
        manager_id: 'staff_alex',
        department: 'Account Management',
        priority: 'medium',
        status: 'completed',
        due_date: new Date(Date.now() - 2 * 86400000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        tags: ['Meeting', 'Client', 'Kickoff'],
        checklist: [
          { id: 'chk_12', text: 'Prepare presentation deck', completed: true },
          { id: 'chk_13', text: 'Send Google Meet invite', completed: true },
          { id: 'chk_14', text: 'Log action items in workflow stage 3', completed: true },
        ],
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'task_106',
        agency_id: 'demo-agency-001',
        client_id: client3.id,
        project_id: null,
        workflow_stage_id: null,
        title: 'Review submitted architectural portfolio files & NDA',
        description: 'Check vector plans, site photos, and signed NDA before initiating onboarding handoff.',
        assigned_to: 'staff_alex',
        manager_id: null,
        department: 'Management',
        priority: 'low',
        status: 'open',
        due_date: new Date(Date.now() + 4 * 86400000).toISOString(),
        completed_at: null,
        tags: ['Onboarding', 'Legal', 'Review'],
        checklist: [],
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    initialTasks.forEach((t) => this.tasks.set(t.id, t));

    this.taskComments.set('task_102', [
      {
        id: 'comm_1',
        task_id: 'task_102',
        author_id: 'staff_sarah',
        author_name: 'Sarah Chen',
        content: 'Elena, client specifically loves the bold serif look on slide 3 of their moodboard!',
        created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: 'comm_2',
        task_id: 'task_102',
        author_id: 'staff_elena',
        author_name: 'Elena Rostova',
        content: 'Got it! I am pairing that serif with a sleek geometric sans-serif for secondary captions.',
        created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
    ]);

    this.notifications = [
      {
        id: 'notif_1',
        agency_id: 'demo-agency-001',
        recipient_id: 'staff_alex',
        title: 'Client Onboarding Completed 🎉',
        message: 'Acme Apparel completed intake. AI Project Brief and Workflow automatically provisioned.',
        type: 'onboarding_completed',
        link: '/clients/client_demo_101',
        is_read: false,
        created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
      },
      {
        id: 'notif_2',
        agency_id: 'demo-agency-001',
        recipient_id: 'staff_elena',
        title: 'High Priority Task Assigned',
        message: 'You have been assigned: "Design Autumn Collection typography & color palettes"',
        type: 'task_assigned',
        link: '/tasks',
        is_read: false,
        created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
      },
      {
        id: 'notif_3',
        agency_id: 'demo-agency-001',
        recipient_id: 'staff_david',
        title: 'Task Overdue Notice ⚠️',
        message: '"Implement Shopify checkout conversion tracking" was due yesterday.',
        type: 'task_overdue',
        link: '/tasks',
        is_read: true,
        created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
      },
    ];

    this.activityLogs = [
      {
        id: 'act_1',
        agency_id: 'demo-agency-001',
        actor_name: 'Sarah Connor',
        action: 'onboarding_completed',
        entity_type: 'client',
        entity_id: client1.id,
        entity_title: 'Acme Apparel',
        metadata: { files_count: 3, deposit_paid: '$1,500.00' },
        created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
      },
      {
        id: 'act_2',
        agency_id: 'demo-agency-001',
        actor_name: 'AI Engine',
        action: 'brief_generated',
        entity_type: 'brief',
        entity_id: 'brief_client_demo_101',
        entity_title: 'Executive Project Brief',
        metadata: { model: 'claude-3-5-sonnet', sections: 6 },
        created_at: new Date(Date.now() - 35 * 3600000).toISOString(),
      },
      {
        id: 'act_3',
        agency_id: 'demo-agency-001',
        actor_name: 'Alex Rivera',
        action: 'workflow_created',
        entity_type: 'workflow',
        entity_id: wf1.id,
        entity_title: '5-Stage Delivery Pipeline',
        metadata: { stages: 5 },
        created_at: new Date(Date.now() - 34 * 3600000).toISOString(),
      },
      {
        id: 'act_4',
        agency_id: 'demo-agency-001',
        actor_name: 'Sarah Chen',
        action: 'task_completed',
        entity_type: 'task',
        entity_id: 'task_101',
        entity_title: 'Audit competitor keywords & search ranking baseline',
        metadata: { completed_by: 'Sarah Chen' },
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
      {
        id: 'act_5',
        agency_id: 'demo-agency-001',
        actor_name: 'Priya Patel',
        action: 'workflow_stage_advanced',
        entity_type: 'workflow',
        entity_id: wf1.id,
        entity_title: 'Stage 2: Strategy Kickoff Meeting -> Completed',
        metadata: { next_stage: 'Stage 3: Client Work Execution' },
        created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
    ];

    this.workLogs = [
      { id: 'wl_1', agency_id: 'demo-agency-001', staff_id: 'staff_alex', staff_name: 'Alex Rivera', task_id: 'task_106', task_title: 'Review submitted architectural portfolio files', date: new Date().toISOString().split('T')[0], hours_spent: 4.5, description: 'Executive brief review and client NDA sign-off', status: 'present', created_at: new Date().toISOString() },
      { id: 'wl_2', agency_id: 'demo-agency-001', staff_id: 'staff_sarah', staff_name: 'Sarah Chen', task_id: 'task_101', task_title: 'Audit competitor keywords', date: new Date().toISOString().split('T')[0], hours_spent: 6.0, description: 'Deep competitor keyword research & SERP audit', status: 'present', created_at: new Date().toISOString() },
      { id: 'wl_3', agency_id: 'demo-agency-001', staff_id: 'staff_elena', staff_name: 'Elena Rostova', task_id: 'task_102', task_title: 'Design Autumn Collection typography', date: new Date().toISOString().split('T')[0], hours_spent: 7.5, description: 'Figma layout & color palette design', status: 'present', created_at: new Date().toISOString() },
      { id: 'wl_4', agency_id: 'demo-agency-001', staff_id: 'staff_marcus', staff_name: 'Marcus Vance', task_id: 'task_103', task_title: 'Produce & edit 30-sec Instagram Reels', date: new Date().toISOString().split('T')[0], hours_spent: 5.0, description: 'Video cutting & sound synchronization', status: 'remote', created_at: new Date().toISOString() },
      { id: 'wl_5', agency_id: 'demo-agency-001', staff_id: 'staff_david', staff_name: 'David Kim', task_id: 'task_104', task_title: 'Shopify tracking implementation', date: new Date().toISOString().split('T')[0], hours_spent: 6.5, description: 'GA4 and Meta Pixel integration', status: 'present', created_at: new Date().toISOString() },
      { id: 'wl_6', agency_id: 'demo-agency-001', staff_id: 'staff_priya', staff_name: 'Priya Patel', task_id: 'task_105', task_title: 'Host Strategy Kickoff Alignment Meeting', date: new Date().toISOString().split('T')[0], hours_spent: 5.5, description: 'Client onboarding presentation and Q&A sync', status: 'present', created_at: new Date().toISOString() },
    ];
  }

  public toggleClientStar(clientId: string): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;
    client.is_starred = !client.is_starred;
    client.updated_at = new Date().toISOString();
    return client.is_starred;
  }

  public setClientStar(clientId: string, isStarred: boolean): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;
    client.is_starred = isStarred;
    client.updated_at = new Date().toISOString();
    return client.is_starred;
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
    const manager = client.manager_id ? this.staff.get(client.manager_id) : null;
    const assigned_staff = (client.assigned_staff_ids || []).map((sId) => this.staff.get(sId)).filter(Boolean) as Staff[];

    return {
      ...client,
      agency: this.agency,
      manager,
      assigned_staff,
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

  // --- Staff Methods ---
  public getAllStaff(): Staff[] {
    return Array.from(this.staff.values()).map((s) => {
      const activeTasks = Array.from(this.tasks.values()).filter((t) => t.assigned_to === s.id && t.status !== 'completed').length;
      const completedTasks = Array.from(this.tasks.values()).filter((t) => t.assigned_to === s.id && t.status === 'completed').length;
      const overdueTasks = Array.from(this.tasks.values()).filter((t) => {
        if (t.assigned_to !== s.id || t.status === 'completed' || !t.due_date) return false;
        return new Date(t.due_date).getTime() < Date.now();
      }).length;
      const assignedClients = Array.from(this.clients.values()).filter((c) => !c.is_archived && (c.manager_id === s.id || (c.assigned_staff_ids || []).includes(s.id))).length;

      return {
        ...s,
        active_tasks_count: activeTasks,
        completed_tasks_count: completedTasks,
        overdue_tasks_count: overdueTasks,
        assigned_clients_count: assignedClients,
      };
    });
  }

  public getStaffById(id: string): Staff | undefined {
    return this.staff.get(id);
  }

  public saveStaff(staff: Staff): Staff {
    this.staff.set(staff.id, staff);
    return staff;
  }

  public deleteStaff(id: string): boolean {
    return this.staff.delete(id);
  }

  // --- Project Methods ---
  public getAllProjects(): Project[] {
    return Array.from(this.projects.values()).map((p) => ({
      ...p,
      client: this.clients.get(p.client_id),
      manager: p.manager_id ? this.staff.get(p.manager_id) : null,
    }));
  }

  public getProjectById(id: string): Project | undefined {
    const p = this.projects.get(id);
    if (!p) return undefined;
    return {
      ...p,
      client: this.clients.get(p.client_id),
      manager: p.manager_id ? this.staff.get(p.manager_id) : null,
    };
  }

  public saveProject(project: Project): Project {
    this.projects.set(project.id, project);
    return project;
  }

  // --- Task Methods ---
  public getAllTasks(filters?: { clientId?: string; assignedTo?: string; status?: string; priority?: string }): Task[] {
    let list = Array.from(this.tasks.values()).map((t) => ({
      ...t,
      client: t.client_id ? this.clients.get(t.client_id) : null,
      assignee: t.assigned_to ? this.staff.get(t.assigned_to) : null,
      manager: t.manager_id ? this.staff.get(t.manager_id) : null,
      comments: this.taskComments.get(t.id) || [],
    }));

    if (filters?.clientId) list = list.filter((t) => t.client_id === filters.clientId);
    if (filters?.assignedTo) list = list.filter((t) => t.assigned_to === filters.assignedTo);
    if (filters?.status && filters.status !== 'all') list = list.filter((t) => t.status === filters.status);
    if (filters?.priority && filters.priority !== 'all') list = list.filter((t) => t.priority === filters.priority);

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getTaskById(id: string): Task | undefined {
    const t = this.tasks.get(id);
    if (!t) return undefined;
    return {
      ...t,
      client: t.client_id ? this.clients.get(t.client_id) : null,
      assignee: t.assigned_to ? this.staff.get(t.assigned_to) : null,
      manager: t.manager_id ? this.staff.get(t.manager_id) : null,
      comments: this.taskComments.get(t.id) || [],
    };
  }

  public saveTask(task: Task): Task {
    this.tasks.set(task.id, task);
    return task;
  }

  public deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  public addTaskComment(taskId: string, comment: TaskComment): TaskComment {
    const list = this.taskComments.get(taskId) || [];
    list.push(comment);
    this.taskComments.set(taskId, list);
    return comment;
  }

  // --- Workflow Methods ---
  public getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values()).map((w) => ({
      ...w,
      client: this.clients.get(w.client_id),
      project: w.project_id ? this.projects.get(w.project_id) : null,
      stages: w.stages.map((s) => ({
        ...s,
        responsible_staff: s.responsible_staff_id ? this.staff.get(s.responsible_staff_id) : null,
        tasks: Array.from(this.tasks.values()).filter((t) => t.workflow_stage_id === s.id),
      })),
    }));
  }

  public getWorkflowById(id: string): Workflow | undefined {
    const w = this.workflows.get(id);
    if (!w) return undefined;
    return {
      ...w,
      client: this.clients.get(w.client_id),
      project: w.project_id ? this.projects.get(w.project_id) : null,
      stages: w.stages.map((s) => ({
        ...s,
        responsible_staff: s.responsible_staff_id ? this.staff.get(s.responsible_staff_id) : null,
        tasks: Array.from(this.tasks.values()).filter((t) => t.workflow_stage_id === s.id),
      })),
    };
  }

  public saveWorkflow(wf: Workflow): Workflow {
    this.workflows.set(wf.id, wf);
    return wf;
  }

  public advanceWorkflowStage(workflowId: string, stageId: string, newStatus: any): Workflow | undefined {
    const wf = this.workflows.get(workflowId);
    if (!wf) return undefined;
    wf.stages = wf.stages.map((s) => {
      if (s.id === stageId) {
        return {
          ...s,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : s.completed_at,
          updated_at: new Date().toISOString(),
        };
      }
      return s;
    });
    wf.updated_at = new Date().toISOString();
    this.workflows.set(workflowId, wf);
    return wf;
  }

  // --- Client Archive Methods ---
  public archiveClient(clientId: string): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;
    client.is_archived = true;
    client.archived_at = new Date().toISOString();
    client.updated_at = new Date().toISOString();
    this.clients.set(clientId, client);

    this.logActivity({
      id: `act_${Date.now()}`,
      agency_id: client.agency_id,
      actor_name: 'Agency Admin',
      action: 'client_archived',
      entity_type: 'client',
      entity_id: client.id,
      entity_title: client.name,
      metadata: { company: client.company },
      created_at: new Date().toISOString(),
    });
    return true;
  }

  public unarchiveClient(clientId: string): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;
    client.is_archived = false;
    client.archived_at = null;
    client.updated_at = new Date().toISOString();
    this.clients.set(clientId, client);

    this.logActivity({
      id: `act_${Date.now()}`,
      agency_id: client.agency_id,
      actor_name: 'Agency Admin',
      action: 'client_unarchived',
      entity_type: 'client',
      entity_id: client.id,
      entity_title: client.name,
      created_at: new Date().toISOString(),
    });
    return true;
  }

  public deleteClientPermanently(clientId: string): boolean {
    this.responses.delete(clientId);
    this.checklistStatus.delete(clientId);
    this.uploads.delete(clientId);
    this.briefs.delete(clientId);
    return this.clients.delete(clientId);
  }

  // --- Notifications ---
  public getAllNotifications(): Notification[] {
    return this.notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.is_read = true;
    return true;
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.forEach((n) => (n.is_read = true));
  }

  public addNotification(notif: Notification): Notification {
    this.notifications.unshift(notif);
    return notif;
  }

  // --- Activity / Work Audit ---
  public getActivityLogs(limit = 50): ActivityLog[] {
    return this.activityLogs
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  public logActivity(entry: ActivityLog): ActivityLog {
    this.activityLogs.unshift(entry);
    return entry;
  }

  // --- Work Logs & Reports ---
  public getStaffWorkLogs(): StaffWorkLog[] {
    return this.workLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addWorkLog(log: StaffWorkLog): StaffWorkLog {
    this.workLogs.unshift(log);
    return log;
  }

  public getPerformanceReports(): PerformanceReport[] {
    const allStaff = this.getAllStaff();
    return allStaff.map((s) => {
      const totalAssigned = (s.active_tasks_count || 0) + (s.completed_tasks_count || 0) + (s.overdue_tasks_count || 0);
      const completionRate = totalAssigned > 0 ? Math.round(((s.completed_tasks_count || 0) / totalAssigned) * 100) : 100;
      const hoursLogged = this.workLogs
        .filter((w) => w.staff_id === s.id)
        .reduce((sum, item) => sum + (Number(item.hours_spent) || 0), 0);

      return {
        staff_id: s.id,
        staff_name: s.name,
        avatar_url: s.avatar_url,
        department: s.department,
        role: s.role.toUpperCase(),
        tasks_assigned: totalAssigned,
        tasks_completed: s.completed_tasks_count || 0,
        tasks_overdue: s.overdue_tasks_count || 0,
        completion_rate: completionRate,
        hours_logged: hoursLogged || 24,
        active_clients_count: s.assigned_clients_count || 0,
        performance_score: s.performance_score || 95,
      };
    });
  }

  // --- Core Differentiator: Automated Onboarding -> Project Provisioning ---
  public provisionProjectFromOnboarding(clientId: string): { project: Project; workflow: Workflow; tasks: Task[] } | null {
    const client = this.clients.get(clientId);
    if (!client) return null;

    client.status = 'completed';
    client.project_status = 'ready_for_project';
    client.completed_at = new Date().toISOString();
    client.updated_at = new Date().toISOString();
    this.clients.set(clientId, client);

    const projectId = `proj_${Date.now()}`;
    const workflowId = `wf_${Date.now()}`;

    // 1. Create Project
    const project: Project = {
      id: projectId,
      agency_id: client.agency_id,
      client_id: client.id,
      title: `${client.company || client.name} — Agency Project`,
      description: `Auto-provisioned delivery workspace for ${client.name}. Onboarding completed and AI project brief generated.`,
      status: 'active',
      priority: 'high',
      manager_id: client.manager_id || 'staff_priya',
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.projects.set(projectId, project);

    // 2. Create 5-Stage Delivery Workflow
    const workflow: Workflow = {
      id: workflowId,
      agency_id: client.agency_id,
      client_id: client.id,
      project_id: projectId,
      name: `${client.company || client.name} Delivery Workflow`,
      description: 'Standard 5-stage agency fulfillment workflow',
      status: 'active',
      current_stage_index: 1,
      stages: [
        {
          id: `stg_${Date.now()}_1`,
          workflow_id: workflowId,
          title: 'Stage 1: Weekly Audit of Client & Check Issues',
          description: 'Audit uploaded brand assets, credentials, and questionnaire scope.',
          responsible_staff_id: 'staff_sarah',
          order_index: 1,
          status: 'current',
          due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          completed_at: null,
          notes: 'Auto-initiated upon client submission.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `stg_${Date.now()}_2`,
          workflow_id: workflowId,
          title: 'Stage 2: Strategy & Kickoff Meeting',
          description: 'Review synthesized AI Project Brief with client.',
          responsible_staff_id: client.manager_id || 'staff_priya',
          order_index: 2,
          status: 'pending',
          due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          completed_at: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `stg_${Date.now()}_3`,
          workflow_id: workflowId,
          title: 'Stage 3: Client Work Execution',
          description: 'Deliver core project milestones and assets.',
          responsible_staff_id: 'staff_elena',
          order_index: 3,
          status: 'pending',
          due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          completed_at: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `stg_${Date.now()}_4`,
          workflow_id: workflowId,
          title: 'Stage 4: Quality Review & Client Feedback',
          description: 'Internal QC and client revisions.',
          responsible_staff_id: 'staff_alex',
          order_index: 4,
          status: 'pending',
          due_date: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
          completed_at: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `stg_${Date.now()}_5`,
          workflow_id: workflowId,
          title: 'Stage 5: Final Delivery & Retainer Activation',
          description: 'Signoff, asset handoff, and monthly retainer onboarding.',
          responsible_staff_id: 'staff_priya',
          order_index: 5,
          status: 'pending',
          due_date: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
          completed_at: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.workflows.set(workflowId, workflow);

    // 3. Create Kickoff Tasks
    const initialTasks: Task[] = [
      {
        id: `task_${Date.now()}_1`,
        agency_id: client.agency_id,
        client_id: client.id,
        project_id: projectId,
        workflow_stage_id: workflow.stages[0].id,
        title: `Audit submitted assets & responses for ${client.name}`,
        description: 'Verify all brand guidelines, vector files, and questionnaire answers.',
        assigned_to: 'staff_sarah',
        manager_id: client.manager_id || 'staff_priya',
        department: 'SEO & Content',
        priority: 'high',
        status: 'open',
        due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        completed_at: null,
        tags: ['Onboarding', 'Audit', 'Kickoff'],
        checklist: [
          { id: 'c_1', text: 'Verify uploaded vector logos', completed: false },
          { id: 'c_2', text: 'Check platform locker logins', completed: false },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: `task_${Date.now()}_2`,
        agency_id: client.agency_id,
        client_id: client.id,
        project_id: projectId,
        workflow_stage_id: workflow.stages[1].id,
        title: `Prepare kickoff alignment call & share AI Brief with ${client.name}`,
        description: 'Send calendar invite and present the synthesized AI Project Brief.',
        assigned_to: client.manager_id || 'staff_priya',
        manager_id: 'staff_alex',
        department: 'Account Management',
        priority: 'medium',
        status: 'open',
        due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
        completed_at: null,
        tags: ['Meeting', 'Kickoff'],
        checklist: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    initialTasks.forEach((t) => this.tasks.set(t.id, t));

    // 4. Send Internal Notifications
    this.addNotification({
      id: `notif_${Date.now()}`,
      agency_id: client.agency_id,
      recipient_id: 'staff_alex',
      title: 'New Client Project Provisioned 🚀',
      message: `${client.company || client.name} finished onboarding. Project & Workflow ready.`,
      type: 'onboarding_completed',
      link: `/clients/${client.id}`,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // 5. Work Audit Event
    this.logActivity({
      id: `act_${Date.now()}`,
      agency_id: client.agency_id,
      actor_name: client.name,
      action: 'onboarding_completed',
      entity_type: 'client',
      entity_id: client.id,
      entity_title: client.company || client.name,
      metadata: { project_id: projectId, workflow_id: workflowId },
      created_at: new Date().toISOString(),
    });

    return { project, workflow, tasks: initialTasks };
  }
}

export const localStore = LocalDataStore.getInstance();
