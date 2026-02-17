/**
 * Client for the Railway audio enhancement microservice
 * Sends audio to Railway for FFmpeg-based noise reduction and normalization
 */

const AUDIO_ENHANCER_URL = process.env.AUDIO_ENHANCER_URL;

export async function enhanceAudio(audioBuffer: Buffer, mimeType: string): Promise<Buffer> {
  if (!AUDIO_ENHANCER_URL) {
    console.log('[AudioEnhance] AUDIO_ENHANCER_URL not set, skipping enhancement');
    return audioBuffer;
  }

  console.log(`[AudioEnhance] Sending ${audioBuffer.length} bytes to Railway for enhancement...`);

  const formData = new FormData();
  const uint8Array = new Uint8Array(audioBuffer);
  const blob = new Blob([uint8Array], { type: mimeType });
  formData.append('audio', blob, `audio.${getExtension(mimeType)}`);

  const response = await fetch(`${AUDIO_ENHANCER_URL}/enhance`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Audio enhancement failed: ${error.message || response.statusText}`);
  }

  const processingTime = response.headers.get('X-Processing-Time-Ms');
  console.log(`[AudioEnhance] Enhancement completed in ${processingTime}ms`);

  const enhancedArrayBuffer = await response.arrayBuffer();
  const enhancedBuffer = Buffer.from(enhancedArrayBuffer);

  console.log(`[AudioEnhance] Original: ${audioBuffer.length} bytes, Enhanced: ${enhancedBuffer.length} bytes`);

  return enhancedBuffer;
}

function getExtension(mimeType: string): string {
  if (mimeType.includes('mp3') || mimeType.includes('mpeg')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('m4a')) return 'm4a';
  if (mimeType.includes('mp4')) return 'mp4';
  return 'audio';
}
