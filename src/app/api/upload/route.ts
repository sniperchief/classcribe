import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/upload - Upload audio file to Supabase Storage
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const title = formData.get('title') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
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

  // Validate file type - 4 standard audio formats
  const allowedTypes = [
    'audio/mpeg',      // MP3
    'audio/wav',       // WAV
    'audio/x-m4a',     // M4A
    'audio/mp4',       // M4A variant
    'video/mp4',       // MP4
  ];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Please upload MP3, WAV, M4A, or MP4.' },
      { status: 400 }
    );
  }

  // Validate file size (50MB max)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: 'File too large. Maximum size is 50MB.' },
      { status: 400 }
    );
  }

  // Generate unique filename
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'mp3';
  const fileName = `${user.id}/${timestamp}.${extension}`;

  try {
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('audio').getPublicUrl(fileName);

    // Create lecture record
    const lectureTitle = title || file.name.replace(/\.[^/.]+$/, '');
    const { data: lecture, error: insertError } = await supabase
      .from('lectures')
      .insert({
        user_id: user.id,
        title: lectureTitle,
        audio_url: urlData.publicUrl,
        status: 'uploading',
      })
      .select()
      .single();

    if (insertError) {
      // Clean up uploaded file if lecture creation fails
      await supabase.storage.from('audio').remove([fileName]);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ lecture }, { status: 201 });
  } catch (error) {
    console.error('Upload failed:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';

    // User-friendly error message
    let userMessage = message;
    if (message.includes('fetch failed') || message.includes('ECONNRESET') || message.includes('Bad Gateway')) {
      userMessage = 'Network error during upload. Please check your connection and try again.';
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
