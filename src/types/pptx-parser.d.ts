declare module 'pptx-parser' {
  interface Slide {
    text: string;
    [key: string]: unknown;
  }

  interface ParseResult {
    slides: Slide[];
    [key: string]: unknown;
  }

  type ParseCallback = (err: Error | null, data: ParseResult) => void;

  class PptxParser {
    parse(buffer: Buffer, callback: ParseCallback): void;
  }

  export = PptxParser;
}
