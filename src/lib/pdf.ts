import pdf from 'pdf-parse';

export interface PDFResult {
  text: string;
  numPages: number;
}

export async function extractTextFromPDF(buffer: Buffer): Promise<PDFResult> {
  console.log('[PDF] Starting text extraction...');
  console.log('[PDF] Buffer size:', buffer.length, 'bytes');

  try {
    const data = await pdf(buffer);

    console.log('[PDF] Extraction complete');
    console.log('[PDF] Pages:', data.numpages);
    console.log('[PDF] Text length:', data.text.length, 'chars');

    // Clean up the extracted text
    const cleanedText = data.text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive newlines
      .trim();

    return {
      text: cleanedText,
      numPages: data.numpages,
    };
  } catch (error) {
    console.error('[PDF] Extraction error:', error);
    throw new Error('Failed to extract text from PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
