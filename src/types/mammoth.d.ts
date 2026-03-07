declare module 'mammoth' {
  interface ConversionResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }

  interface Input {
    buffer: Buffer;
  }

  function extractRawText(input: Input): Promise<ConversionResult>;
  function convertToHtml(input: Input): Promise<ConversionResult>;

  export { extractRawText, convertToHtml };
  export default { extractRawText, convertToHtml };
}
