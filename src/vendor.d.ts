// Minimal types for the browser build of mammoth (Word → text).
declare module "mammoth/mammoth.browser.js" {
  export function extractRawText(input: {
    arrayBuffer: ArrayBuffer;
  }): Promise<{ value: string }>;
}
