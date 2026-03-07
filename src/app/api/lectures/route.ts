import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/lectures - List user's lectures
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: lectures, error } = await supabase
    .from('lectures')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lectures });
}

// POST /api/lectures - Create a new lecture record (after direct upload to storage)
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, audio_url } = body;

  if (!title || !audio_url) {
    return NextResponse.json(
      { error: 'Title and audio_url are required' },
      { status: 400 }
    );
  }

  // Check usage limit for free users
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_end_date')
    .eq('id', user.id)
    .single();

  // Determine if user has active paid subscription
  let isPaidUser = false;
  if (profile?.subscription_plan === 'student') {
    const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    if (endDate && endDate > new Date()) {
      isPaidUser = true;
    }
  }

  // Check lifetime limit for free users (1 audio upload)
  if (!isPaidUser) {
    const FREE_LECTURES_LIMIT = 1;

    // Count total lectures ever uploaded by this user
    const { count: totalLectures } = await supabase
      .from('lectures')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((totalLectures || 0) >= FREE_LECTURES_LIMIT) {
      return NextResponse.json(
        { error: 'Free limit reached. Upgrade to Student plan for unlimited audio uploads.', limitReached: true },
        { status: 403 }
      );
    }
  }

  const { data: lecture, error } = await supabase
    .from('lectures')
    .insert({
      user_id: user.id,
      title,
      audio_url,
      status: 'uploading',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lecture }, { status: 201 });
}
