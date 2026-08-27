export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          slug: string | null;
          logo_url: string | null;
          brand_color: string;
          website: string | null;
          support_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          name?: string;
          slug?: string | null;
          logo_url?: string | null;
          brand_color?: string;
          website?: string | null;
          support_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_user_id?: string;
          name?: string;
          slug?: string | null;
          logo_url?: string | null;
          brand_color?: string;
          website?: string | null;
          support_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      questionnaire_templates: {
        Row: {
          id: string;
          agency_id: string;
          title: string;
          description: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          title?: string;
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          title?: string;
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      questionnaire_questions: {
        Row: {
          id: string;
          template_id: string;
          label: string;
          description: string | null;
          placeholder: string | null;
          type: 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice' | 'number' | 'url' | 'file';
          options: Json | null;
          required: boolean;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          label: string;
          description?: string | null;
          placeholder?: string | null;
          type: 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice' | 'number' | 'url' | 'file';
          options?: Json | null;
          required?: boolean;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          label?: string;
          description?: string | null;
          placeholder?: string | null;
          type?: 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice' | 'number' | 'url' | 'file';
          options?: Json | null;
          required?: boolean;
          order_index?: number;
          created_at?: string;
        };
      };
      checklist_templates: {
        Row: {
          id: string;
          agency_id: string;
          title: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          title?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          title?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      checklist_template_items: {
        Row: {
          id: string;
          template_id: string;
          label: string;
          description: string | null;
          category: 'questionnaire' | 'contract' | 'asset' | 'access' | 'general';
          required: boolean;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          label: string;
          description?: string | null;
          category?: 'questionnaire' | 'contract' | 'asset' | 'access' | 'general';
          required?: boolean;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          label?: string;
          description?: string | null;
          category?: 'questionnaire' | 'contract' | 'asset' | 'access' | 'general';
          required?: boolean;
          order_index?: number;
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          agency_id: string;
          name: string;
          email: string;
          company: string | null;
          status: 'invited' | 'in_progress' | 'completed';
          onboarding_token: string;
          package_share_token: string;
          questionnaire_template_id: string | null;
          checklist_template_id: string | null;
          last_activity_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          name: string;
          email: string;
          company?: string | null;
          status?: 'invited' | 'in_progress' | 'completed';
          onboarding_token: string;
          package_share_token: string;
          questionnaire_template_id?: string | null;
          checklist_template_id?: string | null;
          last_activity_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          name?: string;
          email?: string;
          company?: string | null;
          status?: 'invited' | 'in_progress' | 'completed';
          onboarding_token?: string;
          package_share_token?: string;
          questionnaire_template_id?: string | null;
          checklist_template_id?: string | null;
          last_activity_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      questionnaire_responses: {
        Row: {
          id: string;
          client_id: string;
          question_id: string;
          answer: string | null;
          answer_json: Json | null;
          submitted_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          question_id: string;
          answer?: string | null;
          answer_json?: Json | null;
          submitted_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          question_id?: string;
          answer?: string | null;
          answer_json?: Json | null;
          submitted_at?: string;
          updated_at?: string;
        };
      };
      client_checklist_status: {
        Row: {
          id: string;
          client_id: string;
          checklist_item_id: string;
          is_completed: boolean;
          completed_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          checklist_item_id: string;
          is_completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          checklist_item_id?: string;
          is_completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
        };
      };
      uploads: {
        Row: {
          id: string;
          client_id: string;
          category: 'contract' | 'asset' | 'brand' | 'other';
          filename: string;
          file_url: string;
          storage_path: string | null;
          file_size: number | null;
          mime_type: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          category?: 'contract' | 'asset' | 'brand' | 'other';
          filename: string;
          file_url: string;
          storage_path?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          category?: 'contract' | 'asset' | 'brand' | 'other';
          filename?: string;
          file_url?: string;
          storage_path?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          uploaded_at?: string;
        };
      };
      project_briefs: {
        Row: {
          id: string;
          client_id: string;
          ai_summary: string | null;
          ai_brief: string | null;
          goals: Json | null;
          scope: Json | null;
          key_assets: Json | null;
          open_gaps: Json | null;
          next_steps: Json | null;
          status: 'draft' | 'final';
          generated_at: string;
          edited_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          ai_summary?: string | null;
          ai_brief?: string | null;
          goals?: Json | null;
          scope?: Json | null;
          key_assets?: Json | null;
          open_gaps?: Json | null;
          next_steps?: Json | null;
          status?: 'draft' | 'final';
          generated_at?: string;
          edited_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          ai_summary?: string | null;
          ai_brief?: string | null;
          goals?: Json | null;
          scope?: Json | null;
          key_assets?: Json | null;
          open_gaps?: Json | null;
          next_steps?: Json | null;
          status?: 'draft' | 'final';
          generated_at?: string;
          edited_at?: string;
        };
      };
      reminder_settings: {
        Row: {
          id: string;
          agency_id: string;
          days_before_reminder: number;
          max_reminders: number;
          enabled: boolean;
          custom_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          days_before_reminder?: number;
          max_reminders?: number;
          enabled?: boolean;
          custom_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          days_before_reminder?: number;
          max_reminders?: number;
          enabled?: boolean;
          custom_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reminder_log: {
        Row: {
          id: string;
          client_id: string;
          reminder_type: string;
          sent_at: string;
          recipient_email: string;
          status: 'sent' | 'failed';
        };
        Insert: {
          id?: string;
          client_id: string;
          reminder_type?: string;
          sent_at?: string;
          recipient_email: string;
          status?: 'sent' | 'failed';
        };
        Update: {
          id?: string;
          client_id?: string;
          reminder_type?: string;
          sent_at?: string;
          recipient_email?: string;
          status?: 'sent' | 'failed';
        };
      };
    };
  };
}
