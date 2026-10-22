// Shared helpers for Vercel Functions that call Claude through Poe.
// Files starting with "_" are not deployed as routes.
// POE_API_KEY lives only in server environment variables; it never reaches the browser.

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });

// Only accept browser calls from this site; other origins are refused.
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return Boolean(origin && host && new URL(origin).host === host);
}

// Strip terminal escape codes or whitespace that can sneak in when pasting.
export function poeKey() {
  return (
    (process.env.POE_API_KEY ?? "")
      // eslint-disable-next-line no-control-regex
      .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, "")
      .replace(/[^\x21-\x7e]/g, "")
  );
}

export const poeModel = () => process.env.POE_MODEL || "claude-sonnet-5.5";

export class PoeError extends Error {}

// Calls the model and hands the reply to `parse`; retries once on a bad reply
// or transient error. Throws PoeError with a user-facing message.
export async function askPoe<T>({
  system,
  user,
  maxTokens,
  temperature = 0.4,
  parse,
  unusable,
}: {
  system: string;
  user: string;
  maxTokens: number;
  temperature?: number;
  parse: (reply: string) => T;
  unusable: string;
}): Promise<T> {
  const key = poeKey();
  const body = JSON.stringify({
    model: poeModel(),
    max_tokens: maxTokens,
    temperature,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const deadline = Date.now() + 110_000;
  let lastError = unusable;
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
        lastError = "The AI service is unavailable right now.";
        if (res.status === 401 || res.status === 403) {
          lastError =
            "The server's Poe API key was rejected. Check POE_API_KEY.";
          break;
        }
        if (res.status === 402 || res.status === 429) {
          lastError =
            "The Poe account is out of points or rate-limited. Try again later.";
          break;
        }
        continue;
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return parse(data.choices?.[0]?.message?.content ?? "");
    } catch (e) {
      const err = e as Error;
      console.error(`AI request failed (attempt ${attempt}):`, err.message);
      if (
        err.name === "TypeError" &&
        /header/i.test(String(err.cause ?? err.message))
      ) {
        lastError =
          "The server's Poe API key is malformed. Re-run scripts/set-poe-key.sh.";
        break;
      }
      lastError =
        err.name === "TimeoutError"
          ? "The AI took too long. Please try again."
          : unusable;
      if (err.name === "TimeoutError") break;
    }
  }
  throw new PoeError(lastError);
}

// Extracts the outermost JSON object from a model reply.
export function replyJson(reply: string): unknown {
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON in reply.");
  return JSON.parse(reply.slice(start, end + 1));
}
