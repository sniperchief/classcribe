import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/lectures/[id] - Get a single lecture
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: lecture, error } = await supabase
    .from('lectures')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
  }

  return NextResponse.json({ lecture });
}

// DELETE /api/lectures/[id] - Delete a lecture
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get lecture to find audio file path
  const { data: lecture } = await supabase
    .from('lectures')
    .select('audio_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (lecture?.audio_url) {
    // Extract file path from URL and delete from storage
    const filePath = lecture.audio_url.split('/').slice(-2).join('/');
    await supabase.storage.from('audio').remove([filePath]);
  }

  const { error } = await supabase
    .from('lectures')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
