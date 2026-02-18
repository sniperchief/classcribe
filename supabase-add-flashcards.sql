-- Add flashcards column to lectures table
-- Run this in your Supabase SQL editor

ALTER TABLE lectures
ADD COLUMN IF NOT EXISTS flashcards JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN lectures.flashcards IS 'JSON array of flashcard objects with front and back properties';
