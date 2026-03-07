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

  // Check lifetime limit for free users (3 materials total)
  if (!isPaidUser) {
    const FREE_MATERIALS_LIMIT = 3;

    // Count total materials ever uploaded by this user
    const { count: totalMaterials } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((totalMaterials || 0) >= FREE_MATERIALS_LIMIT) {
      return NextResponse.json(
        { error: 'Free limit reached. Upgrade to Student plan for unlimited uploads.', limitReached: true },
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
