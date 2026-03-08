import PptxParser from 'pptx-parser';

export interface SlideData {
  slideNumber: number;
  text: string;
}

export interface PptxResult {
  text: string;
  slideCount: number;
  slides: SlideData[];
}

export async function extractTextFromPptx(buffer: Buffer): Promise<PptxResult> {
  console.log('[PPTX] Starting text extraction...');
  console.log('[PPTX] Buffer size:', buffer.length, 'bytes');

  try {
    const parser = new PptxParser();

    // Parse the PowerPoint file
    const result = await new Promise<{ slides: Array<{ text: string }> }>((resolve, reject) => {
      parser.parse(buffer, (err: Error | null, data: { slides: Array<{ text: string }> }) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    // Extract text from all slides
    const slideTexts: string[] = [];
    const slides: SlideData[] = [];
    let slideCount = 0;

    if (result.slides && Array.isArray(result.slides)) {
      slideCount = result.slides.length;
      result.slides.forEach((slide, index) => {
        const slideText = slide.text ? slide.text.trim() : '';
        slides.push({
          slideNumber: index + 1,
          text: slideText.replace(/\s+/g, ' ').trim()
        });
        if (slideText) {
          slideTexts.push(`--- Slide ${index + 1} ---\n${slideText}`);
        }
      });
    }

    const extractedText = slideTexts.join('\n\n');

    console.log('[PPTX] Extraction complete');
    console.log('[PPTX] Slides:', slideCount);
    console.log('[PPTX] Text length:', extractedText.length, 'chars');

    // Clean up the extracted text
    const cleanedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/---\s+Slide/g, '\n\n--- Slide')
      .trim();

    return {
      text: cleanedText,
      slideCount,
      slides,
    };
  } catch (error) {
    console.error('[PPTX] Extraction error:', error);
    throw new Error('Failed to extract text from PowerPoint: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Helper to get text from selected slides only
export function getTextFromSlides(slides: SlideData[], selectedSlides: number[]): string {
  return slides
    .filter(slide => selectedSlides.includes(slide.slideNumber))
    .map(slide => `--- Slide ${slide.slideNumber} ---\n${slide.text}`)
    .join('\n\n');
}
