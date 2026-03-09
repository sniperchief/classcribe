import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Generate a short unique share code
function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /api/challenges - Create a new challenge
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { materialId, challengeType, score, totalQuestions } = await request.json();

  if (!materialId || !challengeType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!['mcqs', 'quiz', 'flashcards'].includes(challengeType)) {
    return NextResponse.json({ error: 'Invalid challenge type' }, { status: 400 });
  }

  // Verify the material belongs to the user
  const { data: material, error: materialError } = await supabase
    .from('materials')
    .select('id')
    .eq('id', materialId)
    .eq('user_id', user.id)
    .single();

  if (materialError || !material) {
    return NextResponse.json({ error: 'Material not found' }, { status: 404 });
  }

  // Check if challenge already exists for this material and type
  const adminClient = createAdminClient();

  const { data: existingChallenge } = await adminClient
    .from('quiz_challenges')
    .select('share_code')
    .eq('material_id', materialId)
    .eq('challenge_type', challengeType)
    .eq('created_by', user.id)
    .single();

  if (existingChallenge) {
    // Update creator's score if provided
    if (score !== undefined && totalQuestions !== undefined) {
      await adminClient
        .from('quiz_challenges')
        .update({
          creator_score: score,
          creator_total: totalQuestions,
        })
        .eq('material_id', materialId)
        .eq('challenge_type', challengeType)
        .eq('created_by', user.id);
    }

    const challengeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/challenge/${existingChallenge.share_code}`;
    return NextResponse.json({
      shareCode: existingChallenge.share_code,
      challengeUrl,
      isExisting: true,
    });
  }

  // Create new challenge
  const shareCode = generateShareCode();

  const { data: newChallenge, error: insertError } = await adminClient
    .from('quiz_challenges')
    .insert({
      material_id: materialId,
      share_code: shareCode,
      challenge_type: challengeType,
      created_by: user.id,
      creator_score: score,
      creator_total: totalQuestions,
    })
    .select()
    .single();

  console.log('[Challenge] Created:', newChallenge, 'Error:', insertError);

  if (insertError) {
    console.error('Error creating challenge:', insertError);
    return NextResponse.json({ error: 'Failed to create challenge', details: insertError.message }, { status: 500 });
  }

  const challengeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/challenge/${shareCode}`;

  return NextResponse.json({
    shareCode,
    challengeUrl,
    isExisting: false,
  });
}
