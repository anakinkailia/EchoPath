// Turns prompts/experience-post-system.md into src/prompts.generated.ts so both
// the browser build and the Vercel Functions can use the prompt you edit in Markdown.
// Runs before `npm run dev` and `npm run build`; tests check the two stay in sync.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const SOURCE = "prompts/experience-post-system.md";
export const TARGET = "src/prompts.generated.ts";

// The system prompt is everything between the first two "---" lines.
// The follow-up question is the blockquote under "## Companion change",
// and its hint is the italic quoted text after "Hint shown to the student:".
export function extractPrompts(md) {
  const parts = md.replace(/\r\n/g, "\n").split(/\n---\n/);
  if (parts.length < 3)
    throw new Error(`${SOURCE}: expected the prompt between two "---" lines.`);
  const system = parts[1].trim();
  const companion = parts.slice(2).join("\n---\n");
  const quote = [...companion.matchAll(/^>\s?(.*)$/gm)]
    .map((m) => m[1].trim())
    .join(" ")
    .replace(/^"|"$/g, "")
    .trim();
  const hint = companion
    .match(/Hint shown to the student:\s*\*"([\s\S]*?)"\*/)?.[1]
    .replace(/\s+/g, " ")
    .trim();
  if (!system || !quote || !hint)
    throw new Error(
      `${SOURCE}: missing the system prompt, the interview question or its hint.`,
    );
  return { system, interviewQuestion: quote, interviewHint: hint };
}

export function render(md) {
  const p = extractPrompts(md);
  return `// Generated from ${SOURCE} by scripts/build-prompts.mjs. Do not edit here.
export const EXPERIENCE_POST_SYSTEM = ${JSON.stringify(p.system)};
export const INTERVIEW_QUESTION = ${JSON.stringify(p.interviewQuestion)};
export const INTERVIEW_HINT = ${JSON.stringify(p.interviewHint)};
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(TARGET, render(readFileSync(SOURCE, "utf8")));
  console.log(`Wrote ${TARGET} from ${SOURCE}`);
}
