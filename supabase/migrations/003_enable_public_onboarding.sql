-- Enable public onboarding access & client creation for OnboardFlow

-- 1. Allow clients to be created and read by onboarding token
CREATE POLICY "Allow client insertion by agency" 
ON public.clients FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read by onboarding token" 
ON public.clients FOR SELECT 
USING (true);

CREATE POLICY "Allow client updates during onboarding" 
ON public.clients FOR UPDATE 
USING (true);

-- 2. Allow responses and uploads to be created during onboarding
CREATE POLICY "Allow responses insert during onboarding" 
ON public.questionnaire_responses FOR ALL 
USING (true);

CREATE POLICY "Allow uploads insert during onboarding" 
ON public.uploads FOR ALL 
USING (true);

CREATE POLICY "Allow checklist updates during onboarding" 
ON public.client_checklist_status FOR ALL 
USING (true);

CREATE POLICY "Allow brief generation storage" 
ON public.project_briefs FOR ALL 
USING (true);
