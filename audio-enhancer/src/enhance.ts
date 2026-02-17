import ffmpeg from 'fluent-ffmpeg';
import { Readable, PassThrough } from 'stream';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

// Verify FFmpeg is available on startup
async function checkFFmpeg(): Promise<void> {
  try {
    await execAsync('ffmpeg -version');
    console.log('FFmpeg is available');
  } catch {
    console.error('FFmpeg is not installed or not in PATH');
    process.exit(1);
  }
}

checkFFmpeg();

/**
 * Enhance audio quality using FFmpeg filters optimized for speech/lecture audio
 *
 * Filters applied:
 * 1. highpass=f=80 - Remove very low frequency rumble (below 80Hz)
 * 2. lowpass=f=8000 - Keep frequencies up to 8kHz (covers speech range)
 * 3. afftdn=nf=-25 - FFT-based noise reduction
 * 4. loudnorm - EBU R128 loudness normalization
 * 5. compand - Dynamic range compression to make quiet speech louder
 */
export async function enhanceAudio(inputBuffer: Buffer, mimeType: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const inputStream = Readable.from(inputBuffer);
    const outputChunks: Buffer[] = [];
    const outputStream = new PassThrough();

    outputStream.on('data', (chunk: Buffer) => {
      outputChunks.push(chunk);
    });

    outputStream.on('end', () => {
      resolve(Buffer.concat(outputChunks));
    });

    outputStream.on('error', reject);

    // Determine input format from mimetype
    let inputFormat: string | undefined;
    if (mimeType.includes('mp3') || mimeType.includes('mpeg')) {
      inputFormat = 'mp3';
    } else if (mimeType.includes('wav')) {
      inputFormat = 'wav';
    } else if (mimeType.includes('m4a') || mimeType.includes('mp4')) {
      inputFormat = 'mp4';
    }

    const command = ffmpeg(inputStream);

    if (inputFormat) {
      command.inputFormat(inputFormat);
    }

    command
      .audioFilters([
        // High-pass filter: remove low-frequency rumble (AC hum, traffic, etc.)
        'highpass=f=80',

        // Low-pass filter: remove high-frequency noise while keeping speech clarity
        'lowpass=f=8000',

        // FFT-based noise reduction - very effective for consistent background noise
        // nf=-25 is the noise floor in dB (adjust if needed: -20 for more aggressive, -30 for lighter)
        'afftdn=nf=-25',

        // EBU R128 loudness normalization
        // I=-16 is the target integrated loudness
        // LRA=11 is the loudness range
        // TP=-1.5 is the true peak limit
        'loudnorm=I=-16:LRA=11:TP=-1.5',

        // Dynamic range compression - makes quiet parts louder, loud parts quieter
        // This helps with variable recording levels (e.g., student questions)
        'compand=attacks=0.1:decays=0.3:points=-80/-80|-45/-45|-27/-20|-10/-10|0/-5:gain=2'
      ])
      // Output as 16kHz mono WAV - optimal for speech recognition
      .audioFrequency(16000)
      .audioChannels(1)
      .audioCodec('pcm_s16le')
      .format('wav')
      .on('error', (err) => {
        console.error('FFmpeg error:', err.message);
        reject(new Error(`FFmpeg processing failed: ${err.message}`));
      })
      .on('end', () => {
        console.log('FFmpeg processing completed');
      })
      .pipe(outputStream, { end: true });
  });
}
