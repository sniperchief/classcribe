-- =====================================================
-- Materials Table Setup for Classcribe
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create the materials table
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'pptx', 'image')),
    output_type TEXT CHECK (output_type IN ('summary', 'flashcards', 'mcqs', 'quiz')),
    content TEXT,
    generated_content TEXT,
    flashcards JSONB,
    status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'generating', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If table already exists, add new columns
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS output_type TEXT CHECK (output_type IN ('summary', 'flashcards', 'mcqs', 'quiz'));
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS generated_content TEXT;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS flashcards JSONB;
-- Rename summary to generated_content if needed (optional migration)
-- UPDATE public.materials SET generated_content = summary WHERE generated_content IS NULL AND summary IS NOT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_materials_user_id ON public.materials(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_status ON public.materials(status);

-- Enable Row Level Security
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own materials
CREATE POLICY "Users can view their own materials"
    ON public.materials
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own materials
CREATE POLICY "Users can insert their own materials"
    ON public.materials
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own materials
CREATE POLICY "Users can update their own materials"
    ON public.materials
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own materials
CREATE POLICY "Users can delete their own materials"
    ON public.materials
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Storage Bucket Setup
-- You need to create this manually in Supabase Dashboard:
-- 1. Go to Storage in your Supabase project
-- 2. Click "New bucket"
-- 3. Name it "documents"
-- 4. Make it PUBLIC (for simplicity, like your audio bucket)
-- 5. Add these policies (or use the UI):
-- =====================================================

-- If you prefer SQL for storage policies, run these after creating the bucket:

-- Allow authenticated users to upload to their own folder
-- CREATE POLICY "Users can upload documents"
--     ON storage.objects
--     FOR INSERT
--     TO authenticated
--     WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to read their own documents
-- CREATE POLICY "Users can read own documents"
--     ON storage.objects
--     FOR SELECT
--     TO authenticated
--     USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access (if bucket is public)
-- CREATE POLICY "Public read access for documents"
--     ON storage.objects
--     FOR SELECT
--     TO public
--     USING (bucket_id = 'documents');
