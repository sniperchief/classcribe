import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/materials - List user's materials
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: materials, error } = await supabase
    .from('materials')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ materials });
}

// POST /api/materials - Create a new material record
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
  const { title, file_url, file_type } = body;

  if (!title || !file_url || !file_type) {
    return NextResponse.json(
      { error: 'Title, file_url, and file_type are required' },
      { status: 400 }
    );
  }

  // Validate file_type
  const validTypes = ['pdf', 'docx', 'pptx', 'image'];
  if (!validTypes.includes(file_type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Supported: pdf, docx, pptx, image' },
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

  // Check monthly limit for free users (materials count towards same limit as lectures)
  if (!isPaidUser) {
    const FREE_MONTHLY_LIMIT = 100; // TODO: Change back to 2 after testing
    const today = new Date();
    const resetDate = profile?.usage_reset_date ? new Date(profile.usage_reset_date) : null;

    let currentUsage = profile?.lectures_used_this_month || 0;
    if (resetDate) {
      const resetMonth = resetDate.getMonth();
      const resetYear = resetDate.getFullYear();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      if (currentYear > resetYear || (currentYear === resetYear && currentMonth > resetMonth)) {
        currentUsage = 0;
      }
    }

    if (currentUsage >= FREE_MONTHLY_LIMIT) {
      return NextResponse.json(
        { error: 'Monthly limit reached. Upgrade to Student plan for more uploads.' },
        { status: 403 }
      );
    }
  }

  const { data: material, error } = await supabase
    .from('materials')
    .insert({
      user_id: user.id,
      title,
      file_url,
      file_type,
      status: 'uploading',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ material }, { status: 201 });
}
