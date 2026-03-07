-- =====================================================
-- Materials Table Update - Add Output Type Columns
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add output_type column to track what type of content was generated
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS output_type TEXT CHECK (output_type IN ('summary', 'flashcards', 'mcqs', 'quiz'));

-- Add generated_content column for summary/MCQs/quiz text content
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS generated_content TEXT;

-- Add flashcards column for flashcard JSON data
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS flashcards JSONB;
