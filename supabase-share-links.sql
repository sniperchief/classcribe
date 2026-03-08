-- Share Links Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS share_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_code VARCHAR(12) NOT NULL UNIQUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_share_links_code ON share_links(share_code);
CREATE INDEX IF NOT EXISTS idx_share_links_material ON share_links(material_id);
CREATE INDEX IF NOT EXISTS idx_share_links_user ON share_links(user_id);

-- RLS Policies
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- Users can create share links for their own materials
CREATE POLICY "Users can create share links for own materials"
ON share_links FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can view their own share links
CREATE POLICY "Users can view own share links"
ON share_links FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can delete their own share links
CREATE POLICY "Users can delete own share links"
ON share_links FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Public can view share links (for the public share page)
CREATE POLICY "Public can view share links by code"
ON share_links FOR SELECT
TO anon
USING (true);

-- Update view count (allow service role only)
CREATE POLICY "Service role can update view count"
ON share_links FOR UPDATE
TO service_role
USING (true);
