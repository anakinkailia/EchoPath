// Reads text from an uploaded resume or write-up entirely in the browser.
// PDF and Word parsers are loaded only when such a file is picked.
export const resumeAccept =
  ".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown";
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export async function extractText(file: File): Promise<string> {
  if (file.size > MAX_RESUME_BYTES)
    throw new Error(
      "That file is over 5 MB. Upload a smaller resume or paste the text.",
    );
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() })
      .promise;
    const pages: string[] = [];
    for (let i = 1; i <= Math.min(doc.numPages, 10); i++) {
      const content = await (await doc.getPage(i)).getTextContent();
      let line = "";
      const lines: string[] = [];
      for (const item of content.items) {
        if (!("str" in item)) continue;
        line += item.str;
        if (item.hasEOL) {
          lines.push(line);
          line = "";
        } else line += " ";
      }
      lines.push(line);
      pages.push(lines.map((l) => l.replace(/\s+/g, " ").trim()).join("\n"));
    }
    return clean(pages.join("\n\n"));
  }
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth/mammoth.browser.js");
    const { value } = await mammoth.extractRawText({
      arrayBuffer: await file.arrayBuffer(),
    });
    return clean(value);
  }
  if (name.endsWith(".doc"))
    throw new Error(
      "Old .doc files aren't supported. Save it as .docx or PDF, or paste the text.",
    );
  if (
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    file.type.startsWith("text/")
  )
    return clean(await file.text());
  throw new Error("Upload a PDF, Word (.docx) or text file.");
}

function clean(text: string) {
  const out = text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (out.length < 80)
    throw new Error(
      "We couldn't find much text in that file. If it's a scanned PDF, paste the text instead.",
    );
  return out;
}
