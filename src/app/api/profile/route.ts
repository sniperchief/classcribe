import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/profile - Get current user's profile
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned (profile doesn't exist yet)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: profile || null });
}

// POST /api/profile - Create a new profile
export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if profile already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Profile already exists' }, { status: 409 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      onboarding_completed: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile }, { status: 201 });
}

// PATCH /api/profile - Update profile (complete onboarding)
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { full_name, country, university, course_of_study, onboarding_completed } = body;

  // Update auth user metadata if full_name is provided (for email personalization)
  if (full_name) {
    await supabase.auth.updateUser({
      data: { full_name },
    });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      full_name: full_name ?? null,
      country: country ?? null,
      university: university ?? null,
      course_of_study: course_of_study ?? null,
      onboarding_completed: onboarding_completed ?? true,
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile });
}
