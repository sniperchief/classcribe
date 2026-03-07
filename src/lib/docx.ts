import mammoth from 'mammoth';

export interface DocxResult {
  text: string;
  html: string;
}

export async function extractTextFromDocx(buffer: Buffer): Promise<DocxResult> {
  console.log('[DOCX] Starting text extraction...');
  console.log('[DOCX] Buffer size:', buffer.length, 'bytes');

  try {
    // Extract raw text
    const textResult = await mammoth.extractRawText({ buffer });

    // Also extract HTML for better formatting awareness
    const htmlResult = await mammoth.convertToHtml({ buffer });

    console.log('[DOCX] Extraction complete');
    console.log('[DOCX] Text length:', textResult.value.length, 'chars');

    // Clean up the extracted text
    const cleanedText = textResult.value
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      text: cleanedText,
      html: htmlResult.value,
    };
  } catch (error) {
    console.error('[DOCX] Extraction error:', error);
    throw new Error('Failed to extract text from Word document: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
