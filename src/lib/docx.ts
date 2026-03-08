import mammoth from 'mammoth';

export interface SectionData {
  sectionNumber: number;
  text: string;
}

export interface DocxResult {
  text: string;
  html: string;
  sections: SectionData[];
  sectionCount: number;
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

    // Split into sections (by double newlines or ~500 words per section)
    // Since DOCX doesn't have true pages, we create logical sections
    const paragraphs = textResult.value.split(/\n\n+/).filter(p => p.trim());
    const sections: SectionData[] = [];
    let currentSection = '';
    let sectionNumber = 1;
    const WORDS_PER_SECTION = 300; // Approximate words per "page"

    for (const paragraph of paragraphs) {
      currentSection += (currentSection ? '\n\n' : '') + paragraph;
      const wordCount = currentSection.split(/\s+/).length;

      if (wordCount >= WORDS_PER_SECTION) {
        sections.push({
          sectionNumber,
          text: currentSection.replace(/\s+/g, ' ').trim()
        });
        sectionNumber++;
        currentSection = '';
      }
    }

    // Add remaining content as last section
    if (currentSection.trim()) {
      sections.push({
        sectionNumber,
        text: currentSection.replace(/\s+/g, ' ').trim()
      });
    }

    console.log('[DOCX] Sections created:', sections.length);

    return {
      text: cleanedText,
      html: htmlResult.value,
      sections,
      sectionCount: sections.length,
    };
  } catch (error) {
    console.error('[DOCX] Extraction error:', error);
    throw new Error('Failed to extract text from Word document: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Helper to get text from selected sections only
export function getTextFromSections(sections: SectionData[], selectedSections: number[]): string {
  return sections
    .filter(section => selectedSections.includes(section.sectionNumber))
    .map(section => section.text)
    .join('\n\n');
}
