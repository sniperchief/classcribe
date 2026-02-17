import express from 'express';
import multer from 'multer';
import { enhanceAudio } from './enhance';

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for memory storage (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'audio-enhancer' });
});

// Audio enhancement endpoint
app.post('/enhance', upload.single('audio'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log(`Received audio file: ${req.file.originalname}, size: ${req.file.size} bytes, mimetype: ${req.file.mimetype}`);

    const enhancedBuffer = await enhanceAudio(req.file.buffer, req.file.mimetype);

    const processingTime = Date.now() - startTime;
    console.log(`Audio enhanced in ${processingTime}ms. Original: ${req.file.size} bytes, Enhanced: ${enhancedBuffer.length} bytes`);

    // Return enhanced audio as binary
    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': enhancedBuffer.length,
      'X-Processing-Time-Ms': processingTime.toString(),
    });

    res.send(enhancedBuffer);
  } catch (error) {
    console.error('Enhancement failed:', error);
    res.status(500).json({
      error: 'Audio enhancement failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Audio enhancer service running on port ${PORT}`);
});
