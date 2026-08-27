-- ==============================================================================
-- OnboardFlow Database Schema & Migration
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Agencies Table (Tied to Supabase Auth User)
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'My Agency',
    slug TEXT UNIQUE,
    logo_url TEXT,
    brand_color TEXT NOT NULL DEFAULT '#3B82F6', -- Default Tailwind Blue-500
    website TEXT,
    support_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_agency_owner UNIQUE (owner_user_id)
);

-- 2. Questionnaire Templates
CREATE TABLE IF NOT EXISTS public.questionnaire_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Standard Client Questionnaire',
    description TEXT DEFAULT 'Default intake questionnaire for new project onboarding.',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Questionnaire Questions
CREATE TABLE IF NOT EXISTS public.questionnaire_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.questionnaire_templates(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    description TEXT,
    placeholder TEXT,
    type TEXT NOT NULL CHECK (type IN ('short_text', 'long_text', 'single_choice', 'multiple_choice', 'number', 'url', 'file')),
    options JSONB DEFAULT '[]'::jsonb,
    required BOOLEAN NOT NULL DEFAULT false,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Checklist Templates
CREATE TABLE IF NOT EXISTS public.checklist_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Standard Onboarding Checklist',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Checklist Template Items
CREATE TABLE IF NOT EXISTS public.checklist_template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('questionnaire', 'contract', 'asset', 'access', 'general')),
    required BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'in_progress', 'completed')),
    onboarding_token TEXT NOT NULL UNIQUE,
    package_share_token TEXT NOT NULL UNIQUE,
    questionnaire_template_id UUID REFERENCES public.questionnaire_templates(id) ON DELETE SET NULL,
    checklist_template_id UUID REFERENCES public.checklist_templates(id) ON DELETE SET NULL,
    last_activity_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_onboarding_token ON public.clients(onboarding_token);
CREATE INDEX IF NOT EXISTS idx_clients_package_share_token ON public.clients(package_share_token);
CREATE INDEX IF NOT EXISTS idx_clients_agency_id ON public.clients(agency_id);

-- 7. Client Questionnaire Responses
CREATE TABLE IF NOT EXISTS public.questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questionnaire_questions(id) ON DELETE CASCADE,
    answer TEXT,
    answer_json JSONB,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_client_question_response UNIQUE (client_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_responses_client_id ON public.questionnaire_responses(client_id);

-- 8. Client Checklist Status
CREATE TABLE IF NOT EXISTS public.client_checklist_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    checklist_item_id UUID NOT NULL REFERENCES public.checklist_template_items(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    CONSTRAINT unique_client_checklist_item UNIQUE (client_id, checklist_item_id)
);

CREATE INDEX IF NOT EXISTS idx_checklist_status_client_id ON public.client_checklist_status(client_id);

-- 9. Uploads & Files Table
CREATE TABLE IF NOT EXISTS public.uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'asset' CHECK (category IN ('contract', 'asset', 'brand', 'other')),
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT,
    file_size BIGINT,
    mime_type TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_uploads_client_id ON public.uploads(client_id);

-- 10. AI Project Briefs Table
CREATE TABLE IF NOT EXISTS public.project_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE UNIQUE,
    ai_summary TEXT,
    ai_brief TEXT,
    goals JSONB DEFAULT '[]'::jsonb,
    scope JSONB DEFAULT '[]'::jsonb,
    key_assets JSONB DEFAULT '[]'::jsonb,
    open_gaps JSONB DEFAULT '[]'::jsonb,
    next_steps JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_briefs_client_id ON public.project_briefs(client_id);

-- 11. Reminder Settings
CREATE TABLE IF NOT EXISTS public.reminder_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE UNIQUE,
    days_before_reminder INT NOT NULL DEFAULT 3,
    max_reminders INT NOT NULL DEFAULT 3,
    enabled BOOLEAN NOT NULL DEFAULT true,
    custom_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Reminder Logs
CREATE TABLE IF NOT EXISTS public.reminder_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL DEFAULT 'gentle_nudge',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    recipient_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_reminder_log_client_id ON public.reminder_log(client_id);

-- ==============================================================================
-- Auto-provisioning Trigger: Initialize Agency + Default Templates on User Signup
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_agency_signup()
RETURNS TRIGGER AS $$
DECLARE
    new_agency_id UUID;
    q_template_id UUID;
    c_template_id UUID;
    user_agency_name TEXT;
BEGIN
    user_agency_name := COALESCE(NEW.raw_user_meta_data->>'agency_name', split_part(NEW.email, '@', 1) || ' Agency');

    -- 1. Create Agency Profile
    INSERT INTO public.agencies (owner_user_id, name, brand_color)
    VALUES (NEW.id, user_agency_name, '#3B82F6')
    RETURNING id INTO new_agency_id;

    -- 2. Create Default Reminder Settings
    INSERT INTO public.reminder_settings (agency_id, days_before_reminder, max_reminders, enabled)
    VALUES (new_agency_id, 3, 3, true);

    -- 3. Create Default Questionnaire Template
    INSERT INTO public.questionnaire_templates (agency_id, title, description, is_default)
    VALUES (new_agency_id, 'Standard Project Intake', 'Covers core project goals, audience, timeline, and key requirements.', true)
    RETURNING id INTO q_template_id;

    -- 4. Seed Standard Questions
    INSERT INTO public.questionnaire_questions (template_id, label, description, type, required, order_index)
    VALUES 
    (q_template_id, 'What are the top 3 goals of this project?', 'Be as specific as possible about what success looks like.', 'long_text', true, 1),
    (q_template_id, 'Who is your primary target audience?', 'Describe your ideal customer, user demographics, and pain points.', 'long_text', true, 2),
    (q_template_id, 'What is your target launch date or critical deadline?', 'Mention any fixed events or marketing launches.', 'short_text', true, 3),
    (q_template_id, 'Please provide links to competitor or inspirational websites/products', 'Paste URLs and mention what you like/dislike about them.', 'long_text', false, 4),
    (q_template_id, 'Who is the primary point of contact & decision maker?', 'Name, role, and preferred communication channel.', 'short_text', true, 5),
    (q_template_id, 'Do you have existing brand guidelines & color palettes?', 'Specify whether you will provide assets or need new branding created.', 'single_choice', true, 6);

    UPDATE public.questionnaire_questions 
    SET options = '["Yes, we have complete brand guidelines ready", "We have some logos/colors but need guidance", "No, we need brand assets created from scratch"]'::jsonb
    WHERE template_id = q_template_id AND order_index = 6;

    -- 5. Create Default Checklist Template
    INSERT INTO public.checklist_templates (agency_id, title, is_default)
    VALUES (new_agency_id, 'Standard Onboarding Checklist', true)
    RETURNING id INTO c_template_id;

    -- 6. Seed Standard Checklist Items
    INSERT INTO public.checklist_template_items (template_id, label, description, category, required, order_index)
    VALUES
    (c_template_id, 'Complete Intake Questionnaire', 'Answer project goals, audience, and timeline questions.', 'questionnaire', true, 1),
    (c_template_id, 'Upload Signed Contract / Agreement', 'Provide signed client service agreement or MSA.', 'contract', true, 2),
    (c_template_id, 'Upload Brand Assets & Logos', 'Vector logos (.SVG, .AI), high-res images, and typography files.', 'asset', true, 3),
    (c_template_id, 'Provide Required Account Logins / Access', 'Domain registrar, CMS, analytics, or hosting credentials.', 'access', false, 4);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on Supabase auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_agency_signup();

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_checklist_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies are viewable by their owner" ON public.agencies FOR SELECT USING (auth.uid() = owner_user_id);
CREATE POLICY "Agencies are updatable by their owner" ON public.agencies FOR UPDATE USING (auth.uid() = owner_user_id);
CREATE POLICY "Public can view basic agency branding" ON public.agencies FOR SELECT USING (true);

CREATE POLICY "Agency owners can manage their questionnaire templates" ON public.questionnaire_templates FOR ALL USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()));
CREATE POLICY "Public can view questionnaire templates" ON public.questionnaire_templates FOR SELECT USING (true);

CREATE POLICY "Agency owners can manage their questionnaire questions" ON public.questionnaire_questions FOR ALL USING (template_id IN (
    SELECT qt.id FROM public.questionnaire_templates qt JOIN public.agencies a ON a.id = qt.agency_id WHERE a.owner_user_id = auth.uid()
));
CREATE POLICY "Public can view questionnaire questions" ON public.questionnaire_questions FOR SELECT USING (true);

CREATE POLICY "Agency owners can manage their checklist templates" ON public.checklist_templates FOR ALL USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()));
CREATE POLICY "Public can view checklist templates" ON public.checklist_templates FOR SELECT USING (true);

CREATE POLICY "Agency owners can manage checklist template items" ON public.checklist_template_items FOR ALL USING (template_id IN (
    SELECT ct.id FROM public.checklist_templates ct JOIN public.agencies a ON a.id = ct.agency_id WHERE a.owner_user_id = auth.uid()
));
CREATE POLICY "Public can view checklist template items" ON public.checklist_template_items FOR SELECT USING (true);

CREATE POLICY "Agency owners can manage their clients" ON public.clients FOR ALL USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()));
CREATE POLICY "Public can view client via token" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Public can update client status" ON public.clients FOR UPDATE USING (true);

CREATE POLICY "Agency owners can manage client questionnaire responses" ON public.questionnaire_responses FOR ALL USING (client_id IN (
    SELECT c.id FROM public.clients c JOIN public.agencies a ON a.id = c.agency_id WHERE a.owner_user_id = auth.uid()
));
CREATE POLICY "Public can insert/update client questionnaire responses" ON public.questionnaire_responses FOR ALL USING (true);

CREATE POLICY "Agency owners can manage client checklist status" ON public.client_checklist_status FOR ALL USING (client_id IN (
    SELECT c.id FROM public.clients c JOIN public.agencies a ON a.id = c.agency_id WHERE a.owner_user_id = auth.uid()
));
CREATE POLICY "Public can insert/update client checklist status" ON public.client_checklist_status FOR ALL USING (true);

CREATE POLICY "Agency owners can manage client uploads" ON public.uploads FOR ALL USING (client_id IN (
    SELECT c.id FROM public.clients c JOIN public.agencies a ON a.id = c.agency_id WHERE a.owner_user_id = auth.uid()
));
CREATE POLICY "Public can insert/view client uploads" ON public.uploads FOR ALL USING (true);

CREATE POLICY "Agency owners can manage project briefs" ON public.project_briefs FOR ALL USING (client_id IN (
    SELECT c.id FROM public.clients c JOIN public.agencies a ON a.id = c.agency_id WHERE a.owner_user_id = auth.uid()
));
CREATE POLICY "Public can view project briefs" ON public.project_briefs FOR SELECT USING (true);

CREATE POLICY "Agency owners can manage reminder settings" ON public.reminder_settings FOR ALL USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()));

CREATE POLICY "Agency owners can view reminder logs" ON public.reminder_log FOR SELECT USING (client_id IN (
    SELECT c.id FROM public.clients c JOIN public.agencies a ON a.id = c.agency_id WHERE a.owner_user_id = auth.uid()
));
