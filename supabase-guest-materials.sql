-- Create guest_materials table for storing guest document processing results
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS guest_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL UNIQUE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'pptx', 'image')),
  output_type TEXT NOT NULL CHECK (output_type IN ('summary', 'flashcards', 'mcqs', 'quiz')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  quantity INTEGER,
  content TEXT,
  generated_content TEXT,
  flashcards JSONB,
  mcqs JSONB,
  quiz JSONB,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'generating', 'completed', 'failed')),
  error_message TEXT,
  claimed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on token for quick lookups
CREATE INDEX IF NOT EXISTS idx_guest_materials_token ON guest_materials(token);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_guest_materials_status ON guest_materials(status);

-- Enable RLS
ALTER TABLE guest_materials ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do anything (for API calls)
CREATE POLICY "Service role can manage guest_materials" ON guest_materials
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Allow reading unclaimed materials by token (for status checks)
CREATE POLICY "Anyone can read by token" ON guest_materials
  FOR SELECT
  USING (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_guest_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_guest_materials_updated_at
  BEFORE UPDATE ON guest_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_materials_updated_at();

-- Clean up old unclaimed guest materials (older than 7 days)
-- Run this periodically or set up a cron job
-- DELETE FROM guest_materials WHERE claimed_by IS NULL AND created_at < NOW() - INTERVAL '7 days';
