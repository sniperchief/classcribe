import pdf from 'pdf-parse';

export interface PageData {
  pageNumber: number;
  text: string;
}

export interface PDFResult {
  text: string;
  numPages: number;
  pages: PageData[];
}

export async function extractTextFromPDF(buffer: Buffer): Promise<PDFResult> {
  console.log('[PDF] Starting text extraction...');
  console.log('[PDF] Buffer size:', buffer.length, 'bytes');

  try {
    const pages: PageData[] = [];

    // Custom page render to capture per-page text
    const options = {
      pagerender: function(pageData: { pageIndex: number; getTextContent: () => Promise<{ items: Array<{ str: string }> }> }) {
        return pageData.getTextContent().then(function(textContent) {
          const pageText = textContent.items
            .map((item) => item.str)
            .join(' ')
            .trim();

          pages.push({
            pageNumber: pageData.pageIndex + 1,
            text: pageText
          });

          return pageText;
        });
      }
    };

    const data = await pdf(buffer, options);

    console.log('[PDF] Extraction complete');
    console.log('[PDF] Pages:', data.numpages);
    console.log('[PDF] Text length:', data.text.length, 'chars');

    // Clean up the extracted text
    const cleanedText = data.text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive newlines
      .trim();

    // Sort pages by page number and clean text
    const sortedPages = pages
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .map(page => ({
        ...page,
        text: page.text.replace(/\s+/g, ' ').trim()
      }));

    return {
      text: cleanedText,
      numPages: data.numpages,
      pages: sortedPages,
    };
  } catch (error) {
    console.error('[PDF] Extraction error:', error);
    throw new Error('Failed to extract text from PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Helper to get text from selected pages only
export function getTextFromPages(pages: PageData[], selectedPages: number[]): string {
  return pages
    .filter(page => selectedPages.includes(page.pageNumber))
    .map(page => page.text)
    .join('\n\n');
}
