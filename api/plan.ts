// Vercel Function: generates a monthly skill calendar with a Claude Sonnet model via Poe.
import {
  buildPrompt,
  intensities,
  parsePlanReply,
  planRequestSchema,
  studyDates,
  type CalendarPlan,
} from "../src/calendar-plan.js";
import {
  askPoe,
  json,
  poeKey,
  poeModel,
  PoeError,
  sameOrigin,
} from "./_poe.js";

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return json({ error: "Requests must come from the EchoPath site." }, 403);
  if (!poeKey())
    return json({ error: "AI planning is not configured on the server." }, 503);

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  const parsed = planRequestSchema.safeParse(input);
  if (!parsed.success)
    return json({ error: "Please check the plan details." }, 400);
  const req = parsed.data;
  const dates = studyDates(req.start, req.intensity);

  try {
    const body = await askPoe({
      system:
        "You are a practical learning coach for business analytics graduate students. You design realistic, specific study calendars and reply with valid JSON only.",
      user: buildPrompt(req, dates),
      maxTokens: 8000,
      unusable: "The AI returned an unusable plan. Please try again.",
      parse: (reply) =>
        parsePlanReply(reply, dates, intensities[req.intensity].minutes),
    });
    const plan: CalendarPlan = {
      ...body,
      request: req,
      source: "ai",
      model: poeModel(),
      created_at: new Date().toISOString(),
    };
    return json(plan);
  } catch (e) {
    return json(
      {
        error:
          e instanceof PoeError
            ? e.message
            : "The AI returned an unusable plan. Please try again.",
      },
      502,
    );
  }
}
