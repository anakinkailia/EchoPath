// Vercel Function: turns a resume or write-up into a library post with Claude via Poe.
// action "analyze": source text → experiences found + follow-up questions.
// action "compose": chosen experience + answers + extra details → post draft.
import {
  ANALYZE_SYSTEM,
  analyzePrompt,
  analyzeRequestSchema,
  COMPOSE_SYSTEM,
  composePrompt,
  composeRequestSchema,
  parseAnalyzeReply,
  parseComposeReply,
  redactContact,
} from "../src/experience-ai.js";
import {
  askPoe,
  json,
  poeKey,
  poeModel,
  PoeError,
  replyJson,
  sameOrigin,
} from "./_poe.js";

export const config = { maxDuration: 120 };

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return json({ error: "Requests must come from the EchoPath site." }, 403);
  if (!poeKey())
    return json({ error: "AI drafting is not configured on the server." }, 503);

  let input: { action?: string };
  try {
    input = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  try {
    if (input?.action === "analyze") {
      const parsed = analyzeRequestSchema.safeParse(input);
      if (!parsed.success)
        return json(
          {
            error:
              parsed.error.issues[0]?.message === "Add a little more text."
                ? "There isn't enough text to analyze. Add more detail or upload a fuller resume."
                : "The text is too long. Keep it under 30,000 characters.",
          },
          400,
        );
      // Redact again on the server in case a client skipped it.
      const experiences = await askPoe({
        system: ANALYZE_SYSTEM,
        user: analyzePrompt(redactContact(parsed.data.text)),
        maxTokens: 4000,
        temperature: 0.2,
        unusable:
          "The AI couldn't read experiences from this text. Please try again.",
        parse: (reply) => parseAnalyzeReply(replyJson(reply)),
      });
      return json({ experiences, model: poeModel() });
    }
    if (input?.action === "compose") {
      const parsed = composeRequestSchema.safeParse(input);
      if (!parsed.success)
        return json({ error: "Please check the experience details." }, 400);
      const draft = await askPoe({
        system: COMPOSE_SYSTEM,
        user: composePrompt(parsed.data),
        maxTokens: 4000,
        temperature: 0.4,
        unusable: "The AI couldn't write the post. Please try again.",
        parse: (reply) => parseComposeReply(replyJson(reply), parsed.data),
      });
      return json({ draft, model: poeModel() });
    }
    return json({ error: "Unknown action." }, 400);
  } catch (e) {
    return json(
      {
        error:
          e instanceof PoeError
            ? e.message
            : "The AI request failed. Please try again.",
      },
      502,
    );
  }
}
