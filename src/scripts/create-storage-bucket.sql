-- Create storage bucket for EPISODE AUDIO files
INSERT INTO storage.buckets (id, name, public)
VALUES ('episode-audios', 'episode-audios', true)
ON CONFLICT (id) DO NOTHING;

-- Set up policies for EPISODE AUDIO files
-- Allow public uploads
CREATE POLICY "Allow public uploads to audios" ON storage.objects
FOR INSERT TO public WITH CHECK (bucket_id = 'episode-audios');

-- Allow public downloads
CREATE POLICY "Allow public downloads from audios" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'episode-audios');

-- ---------------------------------------------------------------------------

-- Create storage bucket for EPISODE DOCUMENT files
INSERT INTO storage.buckets (id, name, public)
VALUES ('episode-documents', 'episode-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up policies for EPISODE DOCUMENT files
-- Allow public uploads
CREATE POLICY "Allow public uploads to documents" ON storage.objects
FOR INSERT TO public WITH CHECK (bucket_id = 'episode-documents');

-- Allow public downloads
CREATE POLICY "Allow public downloads from documents" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'episode-documents');

-- Allow authenticated users to delete their own documents (optional but good practice)
CREATE POLICY "Allow authenticated delete from documents" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'episode-documents');