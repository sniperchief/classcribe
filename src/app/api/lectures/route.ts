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
    .select('subscription_plan, subscription_end_date, lectures_used_this_month, usage_reset_date')
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

  // Check monthly limit for free users
  if (!isPaidUser) {
    const FREE_MONTHLY_LIMIT = 2;
    const today = new Date();
    const resetDate = profile?.usage_reset_date ? new Date(profile.usage_reset_date) : null;

    // Check if we need to reset the counter (new month)
    let currentUsage = profile?.lectures_used_this_month || 0;
    if (resetDate) {
      const resetMonth = resetDate.getMonth();
      const resetYear = resetDate.getFullYear();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // If we're in a new month, usage resets
      if (currentYear > resetYear || (currentYear === resetYear && currentMonth > resetMonth)) {
        currentUsage = 0;
      }
    }

    if (currentUsage >= FREE_MONTHLY_LIMIT) {
      return NextResponse.json(
        { error: 'Monthly limit reached. Upgrade to Student plan for more lectures.' },
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
