-- ==============================================================================
-- OnboardFlow Supabase Storage Buckets & Policies
-- ==============================================================================

-- 1. Create storage buckets for uploads & contracts if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('uploads', 'uploads', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf', 'application/zip', 'application/x-zip-compressed', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'text/csv']),
  ('contracts', 'contracts', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies for 'uploads' bucket
CREATE POLICY "Allow public uploads to uploads bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow public read of uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

CREATE POLICY "Allow authenticated owners to delete uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- 3. Storage Policies for 'contracts' bucket
CREATE POLICY "Allow public uploads to contracts bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Allow public read of contracts"
ON storage.objects FOR SELECT
USING (bucket_id = 'contracts');

CREATE POLICY "Allow authenticated owners to delete contracts"
ON storage.objects FOR DELETE
USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');
