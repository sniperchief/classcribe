-- Storage bucket setup
-- Run this in your Supabase SQL Editor AFTER creating the bucket in the dashboard

-- Create the audio bucket (do this in Supabase Dashboard > Storage > New Bucket)
-- Name: audio
-- Public: true (for easy access to audio files)

-- Storage policies for the 'audio' bucket
-- Users can upload to their own folder
CREATE POLICY "Users can upload audio files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own audio files
CREATE POLICY "Users can view own audio files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own audio files
CREATE POLICY "Users can delete own audio files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access (since bucket is public)
CREATE POLICY "Public read access for audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio');
