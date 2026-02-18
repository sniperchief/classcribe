import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateFlashcards } from '@/lib/anthropic';

// GET - Retrieve existing flashcards
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the lecture
    const { data: lecture, error: lectureError } = await supabase
      .from('lectures')
      .select('id, user_id, flashcards')
      .eq('id', id)
      .single();

    if (lectureError || !lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    // Verify ownership
    if (lecture.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      flashcards: lecture.flashcards || null,
      hasFlashcards: !!lecture.flashcards,
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 });
  }
}

// POST - Generate flashcards
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has paid plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_end_date')
      .eq('id', user.id)
      .single();

    const isPaidUser = profile?.subscription_plan === 'student' &&
      profile?.subscription_end_date &&
      new Date(profile.subscription_end_date) > new Date();

    if (!isPaidUser) {
      return NextResponse.json({
        error: 'Flashcards are only available for paid users'
      }, { status: 403 });
    }

    // Get the lecture with transcript
    const { data: lecture, error: lectureError } = await supabase
      .from('lectures')
      .select('id, user_id, transcript, flashcards')
      .eq('id', id)
      .single();

    if (lectureError || !lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    // Verify ownership
    if (lecture.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if flashcards already exist
    if (lecture.flashcards) {
      return NextResponse.json({
        flashcards: lecture.flashcards,
        message: 'Flashcards already exist',
      });
    }

    // Check if transcript exists
    if (!lecture.transcript) {
      return NextResponse.json({
        error: 'No transcript available for this lecture'
      }, { status: 400 });
    }

    // Generate flashcards
    console.log('[Flashcards] Generating flashcards for lecture:', id);
    const flashcards = await generateFlashcards(lecture.transcript);

    // Save flashcards to database
    const { error: updateError } = await supabase
      .from('lectures')
      .update({ flashcards })
      .eq('id', id);

    if (updateError) {
      console.error('Error saving flashcards:', updateError);
      return NextResponse.json({ error: 'Failed to save flashcards' }, { status: 500 });
    }

    console.log('[Flashcards] Flashcards saved successfully');
    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}
