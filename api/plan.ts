// Vercel Function: generates a monthly skill calendar with a Claude Sonnet model via Poe.
// POE_API_KEY lives only in server environment variables; it never reaches the browser.
import {
  buildPrompt,
  intensities,
  parsePlanReply,
  planRequestSchema,
  studyDates,
  type CalendarPlan,
} from "../src/calendar-plan.js";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });

export async function POST(request: Request) {
  // Only accept browser calls from this site; other origins are refused.
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host)
    return json({ error: "Requests must come from the EchoPath site." }, 403);

  const key = process.env.POE_API_KEY;
  if (!key)
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
  const model = process.env.POE_MODEL || "claude-sonnet-5.5";

  const body = JSON.stringify({
    model,
    max_tokens: 8000,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content:
          "You are a practical learning coach for business analytics graduate students. You design realistic, specific study calendars and reply with valid JSON only.",
      },
      { role: "user", content: buildPrompt(req, dates) },
    ],
  });
  const deadline = Date.now() + 110_000;
  let lastError = "The AI returned an unusable plan. Please try again.";
  // One retry: occasional malformed replies usually succeed on a second attempt.
  for (
    let attempt = 1;
    attempt <= 2 && Date.now() < deadline - 20_000;
    attempt++
  ) {
    try {
      const res = await fetch("https://api.poe.com/v1/chat/completions", {
        method: "POST",
        headers: {
          authorization: `Bearer ${key}`,
          "content-type": "application/json",
        },
        body,
        signal: AbortSignal.timeout(deadline - Date.now()),
      });
      if (!res.ok) {
        console.error(
          `Poe error (attempt ${attempt})`,
          res.status,
          (await res.text()).slice(0, 300),
        );
        lastError = "The AI service could not create a plan right now.";
        if (res.status === 401 || res.status === 402 || res.status === 403)
          break;
        continue;
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string }; finish_reason?: string }[];
      };
      const choice = data.choices?.[0];
      const plan: CalendarPlan = {
        ...parsePlanReply(
          choice?.message?.content ?? "",
          dates,
          intensities[req.intensity].minutes,
        ),
        request: req,
        source: "ai",
        model,
        created_at: new Date().toISOString(),
      };
      return json(plan);
    } catch (e) {
      const err = e as Error;
      console.error(
        `Plan generation failed (attempt ${attempt}):`,
        err.message,
      );
      lastError =
        err.name === "TimeoutError"
          ? "The AI took too long. Please try again."
          : "The AI returned an unusable plan. Please try again.";
      if (err.name === "TimeoutError") break;
    }
  }
  return json({ error: lastError }, 502);
}
