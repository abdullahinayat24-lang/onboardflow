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
  phone?: string | null;
  website?: string | null;
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
  is_starred?: boolean;
  is_archived?: boolean;
  archived_at?: string | null;
  manager_id?: string | null;
  manager?: Staff | null;
  assigned_staff_ids?: string[];
  assigned_staff?: Staff[];
  project_status?: 'pending_onboarding' | 'ready_for_project' | 'in_progress' | 'delivered' | 'retainer';
  metadata?: Record<string, any>;
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

// -----------------------------------------------------------------------------
// Agency Operating System & Work Management Types
// -----------------------------------------------------------------------------

export type StaffRole = 'owner' | 'admin' | 'manager' | 'staff';
export type StaffStatus = 'active' | 'inactive' | 'on_leave';

export interface Staff {
  id: string;
  agency_id: string;
  user_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: StaffRole;
  department: string;
  status: StaffStatus;
  is_online: boolean;
  manager_id?: string | null;
  manager_name?: string | null;
  assigned_clients_count?: number;
  active_tasks_count?: number;
  completed_tasks_count?: number;
  overdue_tasks_count?: number;
  performance_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  agency_id: string;
  name: string;
  description?: string | null;
  color: string;
  created_at: string;
}

export interface Project {
  id: string;
  agency_id: string;
  client_id: string;
  client?: Client;
  title: string;
  description?: string | null;
  status: 'planning' | 'active' | 'in_review' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  manager_id?: string | null;
  manager?: Staff | null;
  start_date?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'open' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size?: number;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id?: string | null;
  author_name: string;
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  agency_id: string;
  client_id?: string | null;
  client?: Client | null;
  project_id?: string | null;
  project?: Project | null;
  workflow_stage_id?: string | null;
  title: string;
  description?: string | null;
  assigned_to?: string | null;
  assignee?: Staff | null;
  manager_id?: string | null;
  manager?: Staff | null;
  department?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  completed_at?: string | null;
  tags?: string[];
  checklist?: TaskChecklistItem[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  created_at: string;
  updated_at: string;
}

export type WorkflowStageStatus = 'pending' | 'current' | 'completed' | 'blocked' | 'overdue';

export interface WorkflowStage {
  id: string;
  workflow_id: string;
  title: string;
  description?: string | null;
  responsible_staff_id?: string | null;
  responsible_staff?: Staff | null;
  order_index: number;
  status: WorkflowStageStatus;
  due_date?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  tasks?: Task[];
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  agency_id: string;
  client_id: string;
  client?: Client | null;
  project_id?: string | null;
  project?: Project | null;
  name: string;
  description?: string | null;
  status: 'active' | 'completed' | 'paused';
  stages: WorkflowStage[];
  current_stage_index?: number;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'task_assigned'
  | 'task_overdue'
  | 'onboarding_completed'
  | 'stage_assigned'
  | 'workflow_advanced'
  | 'info';

export interface Notification {
  id: string;
  agency_id: string;
  recipient_id?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  agency_id: string;
  actor_id?: string | null;
  actor_name: string;
  action: string;
  entity_type: 'client' | 'task' | 'project' | 'workflow' | 'staff' | 'brief';
  entity_id: string;
  entity_title?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface StaffWorkLog {
  id: string;
  agency_id: string;
  staff_id: string;
  staff_name?: string;
  task_id?: string | null;
  task_title?: string;
  date: string;
  hours_spent: number;
  description?: string | null;
  status: 'present' | 'remote' | 'half_day' | 'absent';
  created_at: string;
}

export interface PerformanceReport {
  staff_id: string;
  staff_name: string;
  avatar_url?: string | null;
  department: string;
  role: string;
  tasks_assigned: number;
  tasks_completed: number;
  tasks_overdue: number;
  completion_rate: number;
  hours_logged: number;
  active_clients_count: number;
  performance_score: number;
}

