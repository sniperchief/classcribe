import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { transcribeAudio } from '@/lib/deepgram';
import { generateNotes } from '@/lib/anthropic';
import { enhanceAudio } from '@/lib/audio-enhance';

// Retry helper for external API calls
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  stepName: string = 'operation'
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[${stepName}] Attempt ${attempt + 1}/${maxRetries}...`);
      }
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const isNetworkError =
        lastError.message.includes('fetch failed') ||
        lastError.message.includes('ECONNRESET') ||
        lastError.message.includes('ETIMEDOUT') ||
        lastError.message.includes('ENOTFOUND') ||
        lastError.message.includes('EAI_AGAIN') ||
        lastError.message.includes('Connect Timeout') ||
        lastError.message.includes('socket hang up');

      console.error(`[${stepName}] Attempt ${attempt + 1} failed:`, lastError.message);

      if (!isNetworkError || attempt === maxRetries - 1) {
        throw lastError;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), 30000);
      console.log(`[${stepName}] Retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// POST /api/lectures/[id]/process - Process a lecture (transcribe + generate notes)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the lecture
  console.log(`[Process] Starting processing for lecture ${id}`);
  const { data: lecture, error: fetchError } = await supabase
    .from('lectures')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !lecture) {
    return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
  }

  if (lecture.status === 'completed') {
    return NextResponse.json({ error: 'Lecture already processed' }, { status: 400 });
  }

  // Get user's subscription plan and usage data
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_end_date, lectures_used_this_month, usage_reset_date')
    .eq('id', user.id)
    .single();

  // Determine active plan
  let userPlan: 'free' | 'student' = 'free';
  if (profile?.subscription_plan === 'student') {
    const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    if (endDate && endDate > new Date()) {
      userPlan = 'student';
    }
  }

  try {
    // Update status to transcribing
    console.log('[Process] Step 1: Setting status to transcribing...');
    await supabase
      .from('lectures')
      .update({ status: 'transcribing', updated_at: new Date().toISOString() })
      .eq('id', id);

    // Download audio file from Supabase Storage
    console.log('[Process] Step 2: Downloading audio file...');
    const filePath = lecture.audio_url.split('/storage/v1/object/public/audio/')[1];
    const { data: audioData, error: downloadError } = await adminClient.storage
      .from('audio')
      .download(filePath);

    if (downloadError || !audioData) {
      throw new Error('Failed to download audio file: ' + (downloadError?.message || 'No data'));
    }

    // Convert to buffer
    const arrayBuffer = await audioData.arrayBuffer();
    let audioBuffer: Buffer = Buffer.from(arrayBuffer);

    console.log(`Audio downloaded: ${audioBuffer.length} bytes, type: ${audioData.type}`);

    // Enhance audio quality with FFmpeg (via Railway microservice)
    console.log('[Process] Step 3: Enhancing audio quality...');
    let audioMimeType = audioData.type;
    try {
      audioBuffer = await withRetry(
        () => enhanceAudio(audioBuffer, audioData.type),
        3,
        2000,
        'Enhance audio'
      );
      // Enhanced audio is always WAV
      audioMimeType = 'audio/wav';
      console.log(`[Process] Audio enhanced: ${audioBuffer.length} bytes`);
    } catch (enhanceError) {
      // Log but continue with original audio if enhancement fails
      console.warn('[Process] Audio enhancement failed, continuing with original:', enhanceError);
    }

    // Transcribe with Deepgram (with retry for network issues)
    console.log('[Process] Step 4: Transcribing audio with Deepgram...');
    const transcriptionResult = await withRetry(
      () => transcribeAudio(audioBuffer, audioMimeType),
      5,
      3000,
      'Transcribe audio'
    );

    console.log(`Transcription complete: ${transcriptionResult.transcript.length} chars`);

    // Validate transcript quality
    const minTranscriptLength = 100;
    if (transcriptionResult.transcript.length < minTranscriptLength) {
      throw new Error(
        'We could not detect enough speech in your audio. Please ensure your recording has clear spoken content and try again.'
      );
    }

    // Update with transcript and move to generating status
    console.log('[Process] Step 5: Saving transcript and updating status...');
    const { error: transcriptUpdateError } = await supabase
      .from('lectures')
      .update({
        transcript: transcriptionResult.transcript,
        audio_duration: transcriptionResult.duration,
        status: 'generating',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (transcriptUpdateError) {
      console.error('[Process] Failed to save transcript:', transcriptUpdateError);
      throw new Error('Failed to save transcript: ' + transcriptUpdateError.message);
    }
    console.log('[Process] Transcript saved successfully');

    // Generate notes with Claude (paid users get exam questions)
    console.log('[Process] Step 6: Generating notes with Claude...');
    console.log('[Process] ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);
    console.log('[Process] ANTHROPIC_API_KEY length:', process.env.ANTHROPIC_API_KEY?.length || 0);

    const notes = await withRetry(
      () => generateNotes(transcriptionResult.transcript, userPlan),
      5,
      3000,
      'Generate notes'
    );

    console.log(`Notes generated: ${notes.length} chars`);
    console.log(`Notes preview: ${notes.substring(0, 200)}...`);

    // Save notes and mark as completed
    console.log('[Process] Step 7: Saving notes and marking as completed...');
    const { error: notesUpdateError } = await supabase
      .from('lectures')
      .update({
        notes,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (notesUpdateError) {
      console.error('[Process] Failed to save notes:', notesUpdateError);
      throw new Error('Failed to save notes: ' + notesUpdateError.message);
    }
    console.log('[Process] Notes saved and marked as completed');

    // Increment usage counter for free users
    if (userPlan === 'free') {
      console.log('[Process] Step 8: Updating usage counter...');
      const today = new Date();
      const resetDate = profile?.usage_reset_date ? new Date(profile.usage_reset_date) : null;

      let newUsageCount = (profile?.lectures_used_this_month || 0) + 1;

      // Check if we need to reset (new month)
      if (resetDate) {
        const resetMonth = resetDate.getMonth();
        const resetYear = resetDate.getFullYear();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        if (currentYear > resetYear || (currentYear === resetYear && currentMonth > resetMonth)) {
          newUsageCount = 1;
        }
      }

      await supabase
        .from('profiles')
        .update({
          lectures_used_this_month: newUsageCount,
          usage_reset_date: today.toISOString().split('T')[0],
        })
        .eq('id', user.id);
    }

    console.log('[Process] Processing completed successfully!');

    return NextResponse.json({
      success: true,
      lecture: {
        id,
        transcript: transcriptionResult.transcript,
        notes,
        status: 'completed',
      },
    });
  } catch (error) {
    console.error('Processing error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Determine user-friendly error message
    let userMessage = errorMessage;
    if (errorMessage.includes('fetch failed') ||
        errorMessage.includes('ECONNRESET') ||
        errorMessage.includes('ETIMEDOUT') ||
        errorMessage.includes('ENOTFOUND')) {
      userMessage = 'Network connection error. Please check your internet and try again.';
    } else if (errorMessage.includes('enhancement')) {
      userMessage = 'Audio processing failed. Please try again.';
    } else if (errorMessage.includes('Deepgram')) {
      userMessage = 'Audio transcription failed. Please try again.';
    } else if (errorMessage.includes('Claude') || errorMessage.includes('Anthropic')) {
      userMessage = 'Note generation failed. Please try again.';
    }

    try {
      await supabase
        .from('lectures')
        .update({
          status: 'failed',
          error_message: userMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (updateError) {
      console.error('Failed to update lecture status:', updateError);
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
