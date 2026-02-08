import { createClient, DeepgramClient } from '@deepgram/sdk';

let deepgram: DeepgramClient | null = null;

function getClient(): DeepgramClient {
  if (!deepgram) {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPGRAM_API_KEY environment variable is not set');
    }
    deepgram = createClient(apiKey);
  }
  return deepgram;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  duration: number;
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string
): Promise<TranscriptionResult> {
  const { result, error } = await getClient().listen.prerecorded.transcribeFile(
    audioBuffer,
    {
      // Use nova-2-meeting model - optimized for noisy real-world audio like classrooms
      model: 'nova-2-meeting',
      // Smart formatting for readability
      smart_format: true,
      punctuate: true,
      paragraphs: true,
      utterances: true,
      // Auto-detect language (supports English, Nigerian Pidgin, etc.)
      detect_language: true,
      // Handle multiple speakers (lecturer + students)
      diarize: true,
      // Capture filler words for better context
      filler_words: true,
      // Enhance audio processing
      multichannel: false,
    }
  );

  if (error) {
    throw new Error(`Deepgram transcription failed: ${error.message}`);
  }

  // Get transcript from all channels/alternatives
  const transcript =
    result.results?.channels[0]?.alternatives[0]?.transcript || '';
  const confidence =
    result.results?.channels[0]?.alternatives[0]?.confidence || 0;
  const duration = result.metadata?.duration || 0;
  const detectedLanguage = result.results?.channels[0]?.detected_language || 'en';

  console.log(`Transcription: ${transcript.length} chars, confidence: ${confidence}, language: ${detectedLanguage}`);

  return {
    transcript,
    confidence,
    duration,
  };
}
