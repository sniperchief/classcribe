import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/guest/claim - Claim a guest lecture after signup
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  // Get the guest lecture
  const { data: guestLecture, error: fetchError } = await adminClient
    .from('guest_lectures')
    .select('*')
    .eq('token', token)
    .eq('claimed', false)
    .single();

  if (fetchError || !guestLecture) {
    return NextResponse.json({ error: 'Guest lecture not found or already claimed' }, { status: 404 });
  }

  // Create a new lecture for the user
  const { data: newLecture, error: insertError } = await adminClient
    .from('lectures')
    .insert({
      user_id: user.id,
      title: guestLecture.title,
      audio_url: guestLecture.audio_url,
      audio_duration: guestLecture.audio_duration,
      transcript: guestLecture.transcript,
      notes: guestLecture.notes,
      status: guestLecture.status,
      error_message: guestLecture.error_message,
    })
    .select()
    .single();

  if (insertError || !newLecture) {
    console.error('Failed to create lecture:', insertError);
    return NextResponse.json({ error: 'Failed to claim lecture' }, { status: 500 });
  }

  // Mark guest lecture as claimed
  await adminClient
    .from('guest_lectures')
    .update({ claimed: true, claimed_by: user.id })
    .eq('token', token);

  return NextResponse.json({
    success: true,
    lectureId: newLecture.id,
    message: 'Lecture claimed successfully'
  });
}
