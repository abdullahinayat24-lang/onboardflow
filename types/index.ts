import { Database } from './database';

export type Agency = Database['public']['Tables']['agencies']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type QuestionnaireTemplate = Database['public']['Tables']['questionnaire_templates']['Row'];
export type QuestionnaireQuestion = Database['public']['Tables']['questionnaire_questions']['Row'];
export type QuestionnaireResponse = Database['public']['Tables']['questionnaire_responses']['Row'];
export type ChecklistTemplate = Database['public']['Tables']['checklist_templates']['Row'];
export type ChecklistTemplateItem = Database['public']['Tables']['checklist_template_items']['Row'];
export type ClientChecklistStatus = Database['public']['Tables']['client_checklist_status']['Row'];
export type Upload = Database['public']['Tables']['uploads']['Row'];
export type ProjectBrief = Database['public']['Tables']['project_briefs']['Row'];
export type ReminderSetting = Database['public']['Tables']['reminder_settings']['Row'];
export type ReminderLog = Database['public']['Tables']['reminder_log']['Row'];

export type ClientStatus = 'invited' | 'in_progress' | 'completed';

export interface ClientWithDetails extends Client {
  agency?: Agency;
  questionnaire_template?: QuestionnaireTemplate & {
    questions: QuestionnaireQuestion[];
  };
  checklist_template?: ChecklistTemplate & {
    items: ChecklistTemplateItem[];
  };
  responses?: (QuestionnaireResponse & { question?: QuestionnaireQuestion })[];
  checklist_status?: (ClientChecklistStatus & { item?: ChecklistTemplateItem })[];
  uploads?: Upload[];
  brief?: ProjectBrief | null;
  completion_percentage?: number;
}

export interface ClientOnboardingData {
  client: Client;
  agency: Agency;
  questions: QuestionnaireQuestion[];
  checklist_items: ChecklistTemplateItem[];
  responses: Record<string, string | string[]>;
  checklist_status: Record<string, boolean>;
  uploads: Upload[];
  is_completed: boolean;
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

export type OnboardingWizardStep = 
  | 'welcome'
  | 'questionnaire'
  | 'assets'
  | 'contract'
  | 'checklist'
  | 'completed';
