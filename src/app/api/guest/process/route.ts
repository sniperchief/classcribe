import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { transcribeAudio } from '@/lib/deepgram';
import { generateNotes } from '@/lib/anthropic';
import { randomUUID } from 'crypto';

// POST /api/guest/process - Process a lecture for guest users
export async function POST(request: NextRequest) {
  let adminClient;

  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error('Admin client creation error:', error);
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    const title = formData.get('title') as string || 'Untitled Lecture';

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4', 'audio/x-m4a'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidType = allowedTypes.includes(file.type) || ['mp3', 'wav', 'm4a', 'mp4'].includes(fileExtension || '');

    if (!isValidType) {
      return NextResponse.json({ error: 'Invalid file type. Please upload MP3, WAV, or M4A.' }, { status: 400 });
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 });
    }

    // Generate unique token for this guest session
    const token = randomUUID();

    // Upload to Supabase Storage
    const fileName = `guest/${token}/${Date.now()}.${fileExtension || 'mp3'}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await adminClient.storage
      .from('audio')
      .upload(fileName, buffer, {
        contentType: file.type || 'audio/mpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('audio')
      .getPublicUrl(fileName);

    // Create guest lecture record
    const { error: insertError } = await adminClient
      .from('guest_lectures')
      .insert({
        token,
        title,
        audio_url: publicUrl,
        status: 'transcribing',
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create lecture record' }, { status: 500 });
    }

    // Process in background (don't await)
    processGuestLecture(token, buffer, file.type || 'audio/mpeg', adminClient);

    return NextResponse.json({ token, message: 'Processing started' });
  } catch (error) {
    console.error('Guest process error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process' },
      { status: 500 }
    );
  }
}

async function processGuestLecture(
  token: string,
  audioBuffer: Buffer,
  mimeType: string,
  adminClient: ReturnType<typeof createAdminClient>
) {
  try {
    // Transcribe
    console.log(`[Guest] Transcribing audio for token ${token}...`);
    const transcriptionResult = await transcribeAudio(audioBuffer, mimeType);

    if (transcriptionResult.transcript.length < 100) {
      await adminClient
        .from('guest_lectures')
        .update({
          status: 'failed',
          error_message: 'Could not detect enough speech in your audio.',
        })
        .eq('token', token);
      return;
    }

    // Update status
    await adminClient
      .from('guest_lectures')
      .update({
        transcript: transcriptionResult.transcript,
        audio_duration: transcriptionResult.duration,
        status: 'generating',
      })
      .eq('token', token);

    // Generate notes
    console.log(`[Guest] Generating notes for token ${token}...`);
    const notes = await generateNotes(transcriptionResult.transcript, 'free');

    // Mark as completed
    await adminClient
      .from('guest_lectures')
      .update({
        notes,
        status: 'completed',
      })
      .eq('token', token);

    console.log(`[Guest] Processing completed for token ${token}`);
  } catch (error) {
    console.error(`[Guest] Processing failed for token ${token}:`, error);
    await adminClient
      .from('guest_lectures')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Processing failed',
      })
      .eq('token', token);
  }
}
