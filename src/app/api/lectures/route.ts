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

// POST /api/lectures - Create a new lecture record
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
