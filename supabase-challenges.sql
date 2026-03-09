-- Quiz Challenges table for viral sharing
CREATE TABLE IF NOT EXISTS quiz_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  share_code VARCHAR(8) UNIQUE NOT NULL,
  challenge_type VARCHAR(20) NOT NULL CHECK (challenge_type IN ('mcqs', 'quiz', 'flashcards')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_score INTEGER,
  creator_total INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge scores/leaderboard table
CREATE TABLE IF NOT EXISTS challenge_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES quiz_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name VARCHAR(100),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_share_code ON quiz_challenges(share_code);
CREATE INDEX IF NOT EXISTS idx_challenges_material_id ON quiz_challenges(material_id);
CREATE INDEX IF NOT EXISTS idx_challenge_scores_challenge_id ON challenge_scores(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_scores_percentage ON challenge_scores(percentage DESC);

-- RLS policies
ALTER TABLE quiz_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can view challenges (for sharing)
CREATE POLICY "Challenges are viewable by everyone"
  ON quiz_challenges FOR SELECT
  USING (true);

-- Users can create challenges for their own materials
CREATE POLICY "Users can create challenges for their materials"
  ON quiz_challenges FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM materials WHERE id = material_id AND user_id = auth.uid()
    )
  );

-- Users can delete their own challenges
CREATE POLICY "Users can delete their own challenges"
  ON quiz_challenges FOR DELETE
  USING (auth.uid() = created_by);

-- Anyone can view leaderboard scores
CREATE POLICY "Challenge scores are viewable by everyone"
  ON challenge_scores FOR SELECT
  USING (true);

-- Anyone can submit scores (for guests too, handled by API)
CREATE POLICY "Anyone can submit challenge scores"
  ON challenge_scores FOR INSERT
  WITH CHECK (true);
