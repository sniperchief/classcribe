import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const GUEST_QUESTION_LIMIT = 10;

// GET /api/challenges/[code] - Get challenge details and content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const adminClient = createAdminClient();
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // Get challenge with material data
  const { data: challenge, error: challengeError } = await adminClient
    .from('quiz_challenges')
    .select(`
      *,
      materials (
        id,
        title,
        mcqs,
        quiz,
        flashcards
      ),
      profiles:created_by (
        full_name
      )
    `)
    .eq('share_code', code)
    .single();

  if (challengeError || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  }

  const material = challenge.materials;
  if (!material) {
    return NextResponse.json({ error: 'Material not found' }, { status: 404 });
  }

  // Get content based on challenge type
  let content;
  let totalQuestions = 0;

  switch (challenge.challenge_type) {
    case 'mcqs':
      content = material.mcqs || [];
      totalQuestions = content.length;
      // Limit for guests
      if (!isAuthenticated && content.length > GUEST_QUESTION_LIMIT) {
        content = content.slice(0, GUEST_QUESTION_LIMIT);
      }
      break;
    case 'quiz':
      content = material.quiz || [];
      totalQuestions = content.length;
      if (!isAuthenticated && content.length > GUEST_QUESTION_LIMIT) {
        content = content.slice(0, GUEST_QUESTION_LIMIT);
      }
      break;
    case 'flashcards':
      content = material.flashcards || [];
      totalQuestions = content.length;
      if (!isAuthenticated && content.length > GUEST_QUESTION_LIMIT) {
        content = content.slice(0, GUEST_QUESTION_LIMIT);
      }
      break;
    default:
      return NextResponse.json({ error: 'Invalid challenge type' }, { status: 400 });
  }

  // Get leaderboard
  const { data: leaderboard } = await adminClient
    .from('challenge_scores')
    .select('*')
    .eq('challenge_id', challenge.id)
    .order('percentage', { ascending: false })
    .limit(10);

  return NextResponse.json({
    challenge: {
      id: challenge.id,
      shareCode: challenge.share_code,
      challengeType: challenge.challenge_type,
      creatorName: challenge.profiles?.full_name || 'Anonymous',
      creatorScore: challenge.creator_score,
      creatorTotal: challenge.creator_total,
      createdAt: challenge.created_at,
    },
    material: {
      id: material.id,
      title: material.title,
    },
    content,
    totalQuestions,
    isLimited: !isAuthenticated && totalQuestions > GUEST_QUESTION_LIMIT,
    questionsShown: content.length,
    isAuthenticated,
    leaderboard: leaderboard || [],
  });
}

// POST /api/challenges/[code] - Submit a score
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const adminClient = createAdminClient();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { score, totalQuestions, guestName } = await request.json();

  if (score === undefined || !totalQuestions) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Get challenge
  const { data: challenge, error: challengeError } = await adminClient
    .from('quiz_challenges')
    .select('id')
    .eq('share_code', code)
    .single();

  if (challengeError || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  }

  const percentage = Math.round((score / totalQuestions) * 100 * 100) / 100;

  // Insert score
  const { data: newScore, error: insertError } = await adminClient
    .from('challenge_scores')
    .insert({
      challenge_id: challenge.id,
      user_id: user?.id || null,
      guest_name: user ? null : (guestName || 'Guest'),
      score,
      total_questions: totalQuestions,
      percentage,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error submitting score:', insertError);
    return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 });
  }

  // Get updated leaderboard
  const { data: leaderboard } = await adminClient
    .from('challenge_scores')
    .select('*')
    .eq('challenge_id', challenge.id)
    .order('percentage', { ascending: false })
    .limit(10);

  // Find user's rank
  const { count } = await adminClient
    .from('challenge_scores')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', challenge.id)
    .gt('percentage', percentage);

  const rank = (count || 0) + 1;

  return NextResponse.json({
    success: true,
    score: newScore,
    rank,
    leaderboard: leaderboard || [],
  });
}
