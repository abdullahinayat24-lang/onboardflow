// Core Domain Types for OnboardFlow

export type ClientStatus = 'invited' | 'in_progress' | 'completed';
export type BriefStatus = 'draft' | 'approved' | 'final';
export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'number'
  | 'url';

export type ServiceCategory =
  | 'social_media'
  | 'brand_design'
  | 'video_production'
  | 'web_dev'
  | 'accounting'
  | 'supplier_vendor'
  | 'legal_government'
  | 'general';

export type PlanTier =
  | 'free_trial'
  | 'starter'
  | 'pro'
  | 'appsumo_tier1'
  | 'appsumo_tier2'
  | 'enterprise';

export interface SubscriptionInfo {
  plan_tier: PlanTier;
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  is_lifetime: boolean;
  appsumo_code?: string | null;
  active_clients_limit: number; // e.g. 10 or Infinity (-1)
  ai_briefs_limit_per_month: number;
  white_label_enabled: boolean;
  custom_domain_enabled: boolean;
  renews_at?: string | null;
}

export interface TemplateStepConfig {
  enable_media_uploads: boolean;
  enable_contract_upload: boolean;
  enable_platform_access: boolean;
  enable_payment_step: boolean;
  media_upload_label?: string;
  contract_upload_label?: string;
}

export interface Agency {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  brand_color: string;
  website: string | null;
  support_email: string | null;
  webhook_url?: string | null;
  whatsapp_webhook_url?: string | null;
  slack_webhook_url?: string | null;
  stripe_payment_link?: string | null;
  subscription?: SubscriptionInfo;
  created_at: string;
  updated_at: string;
}

export interface PlatformAccessLocker {
  instagram_handle?: string | null;
  facebook_page_url?: string | null;
  meta_business_id?: string | null;
  google_drive_folder_url?: string | null;
  dropbox_folder_url?: string | null;
  canva_or_figma_link?: string | null;
  login_credentials_notes?: string | null;
}

export interface PaymentInfo {
  required: boolean;
  amount_cents?: number;
  currency?: string;
  stripe_checkout_url?: string | null;
  is_paid: boolean;
  paid_at?: string | null;
}

export interface Client {
  id: string;
  agency_id: string;
  name: string;
  email: string;
  company: string | null;
  service_category?: ServiceCategory;
  status: ClientStatus;
  onboarding_token: string;
  package_share_token: string;
  questionnaire_template_id: string | null;
  checklist_template_id: string | null;
  platform_access?: PlatformAccessLocker | null;
  payment?: PaymentInfo | null;
  last_activity_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireTemplate {
  id: string;
  agency_id: string;
  title: string;
  description: string | null;
  service_category?: ServiceCategory;
  step_config?: TemplateStepConfig;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  questions?: QuestionnaireQuestion[];
}

export interface QuestionnaireQuestion {
  id: string;
  template_id: string;
  label: string;
  description: string | null;
  placeholder: string | null;
  type: QuestionType;
  options?: string[];
  required: boolean;
  order_index: number;
  created_at: string;
}

export interface ChecklistTemplate {
  id: string;
  agency_id: string;
  title: string;
  service_category?: ServiceCategory;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  items?: ChecklistTemplateItem[];
}

export interface ChecklistTemplateItem {
  id: string;
  template_id: string;
  label: string;
  description: string | null;
  category: 'questionnaire' | 'contract' | 'asset' | 'access' | 'other' | 'general';
  required: boolean;
  order_index: number;
  created_at: string;
}

export interface QuestionnaireResponse {
  id: string;
  client_id: string;
  question_id: string;
  answer: string | null;
  answer_json: any | null;
  submitted_at: string;
  updated_at: string;
  question?: QuestionnaireQuestion;
}

export interface ClientChecklistStatus {
  id: string;
  client_id: string;
  checklist_item_id: string;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
  item?: ChecklistTemplateItem;
}

export interface Upload {
  id: string;
  client_id: string;
  category: string;
  filename: string;
  file_url: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface ProjectBrief {
  id: string;
  client_id: string;
  ai_summary: string | null;
  ai_brief: string | null;
  status: BriefStatus;
  goals?: string[];
  scope?: string[];
  key_assets?: string[];
  open_gaps?: string[];
  next_steps?: string[];
  generated_at: string;
  edited_at: string;
}

export interface AIGeneratedBriefOutput {
  ai_summary: string;
  ai_brief: string;
  goals: string[];
  scope: string[];
  key_assets: string[];
  open_gaps: string[];
  next_steps: string[];
}

export interface ReminderSetting {
  id: string;
  agency_id: string;
  inactivity_delay_hours: number;
  max_reminders: number;
  is_active: boolean;
  email_subject: string | null;
  email_body_template: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientWithDetails extends Client {
  agency?: Agency;
  questionnaire_template?: QuestionnaireTemplate;
  checklist_template?: ChecklistTemplate;
  brief?: ProjectBrief | null;
  responses?: QuestionnaireResponse[];
  checklist_status?: ClientChecklistStatus[];
  uploads?: Upload[];
  completion_percentage?: number;
}
