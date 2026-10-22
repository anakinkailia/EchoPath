// HTTP integration tests with mocked database/provider transports, not live service verification.
import { insightSchema } from "../_shared/domain.ts";
type Handler = (request: Request) => Promise<Response>;
let handler: Handler;
const serve = Deno.serve;
Deno.env.set("SUPABASE_URL", "https://test.supabase.co");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-secret");
Deno.env.set("ALLOWED_ORIGIN", "https://echopath.test");
Object.defineProperty(Deno, "serve", {
  value: (fn: Handler) => {
    handler = fn;
    return {};
  },
  configurable: true,
  writable: true,
});
await import("./index.ts");
Object.defineProperty(Deno, "serve", {
  value: serve,
  configurable: true,
  writable: true,
});
const experience = {
  experience_type: "Internship",
  role_title: "Analytics Intern",
  company: "Example Organization",
  industry: "Technology",
  role_category: "Analytics",
  year: 2026,
  duration: "12 weeks",
  work_arrangement: "Hybrid",
  responsibilities: "Analyzed product metrics",
  projects: "Built a SQL dashboard",
  typical_day: "Discussed metrics and wrote queries",
  tools: "SQL, Python",
  challenges: "Unclear metric definitions",
  solutions: "Wrote a shared metric dictionary",
  valuable_skills: "Communication",
  lessons_learned: "Define the metric before querying",
  advice: "Practice joins and explain the result",
  contributor_display_name: "Private Name",
  anonymity_preference: "Anonymous",
  consent_to_publish: true,
};
const id = "11111111-1111-4111-8111-111111111111";
const goal = {
  target_role: "Business Analyst",
  target_industry: "Technology",
  existing_skills: "Excel",
  target_skills: "SQL",
  weeks: 2,
};
function assert(value: unknown, message = "Assertion failed"): asserts value {
  if (!value) throw new Error(message);
}
type Call = { url: string; payload: Record<string, unknown> };
async function run(
  action: Record<string, unknown>,
  options: {
    ai?: boolean;
    insertFailure?: boolean;
    aiFailure?: boolean;
    invalidAI?: boolean;
    allowed?: boolean;
    origin?: string;
    sourceAvailable?: boolean;
    roadmap?: unknown;
  } = {},
) {
  Deno.env.set("AI_ENABLED", options.ai ? "true" : "false");
  Deno.env.set("OPENAI_API_KEY", options.ai ? "fake-provider-key" : "");
  const calls: Call[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const req = new Request(input, init);
    const payload = req.body ? await req.json() : {};
    const url = req.url;
    calls.push({ url, payload });
    const json = (value: unknown, status = 200) =>
      new Response(JSON.stringify(value), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    if (url.includes("consume_request")) return json(options.allowed ?? true);
    if (url.includes("api.openai.com")) {
      if (options.aiFailure) return json({ error: "unavailable" }, 503);
      const insights = options.invalidAI
        ? { technical_skills: "invalid" }
        : insightSchema.parse({
            technical_skills: ["SQL"],
            business_skills: ["Communication"],
            tools: ["SQL"],
            main_responsibilities: ["Analyzed product metrics"],
            key_challenges: ["Unclear metric definitions"],
            key_lessons: ["Define the metric before querying"],
            preparation_recommendations: [
              "Practice joins and explain the result",
            ],
          });
      return json({
        status: "completed",
        output: [
          {
            content: [
              {
                type: "output_text",
                text: JSON.stringify(options.roadmap ?? insights),
              },
            ],
          },
        ],
      });
    }
    if (url.includes("/experiences") && req.method === "GET")
      return json(
        options.sourceAvailable
          ? [{ ...experience, id, status: "published" }]
          : [],
      );
    if (
      url.includes("/experiences") &&
      req.method === "POST" &&
      options.insertFailure
    )
      return json({ code: "42501", message: "database rejected insert" }, 403);
    return json(null, 201);
  };
  try {
    const response = await handler(
      new Request("https://test.supabase.co/functions/v1/echopath", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: options.origin ?? "https://echopath.test",
        },
        body: JSON.stringify(action),
      }),
    );
    return { status: response.status, body: await response.json(), calls };
  } finally {
    globalThis.fetch = originalFetch;
  }
}
Deno.test(
  "submission is saved as pending, name sanitized, client status ignored",
  async () => {
    const result = await run({
      action: "submit",
      experience: { ...experience, status: "published" },
      request_id: id,
    });
    assert(result.status === 200);
    const insert = result.calls.find((c) => c.url.includes("/experiences"));
    assert(insert?.payload.status === "pending");
    assert(insert.payload.contributor_display_name === "");
    assert(result.body.processing.includes("Not processed"));
    assert(!result.calls.some((c) => c.url.includes("openai.com")));
  },
);
Deno.test(
  "failed database insert cannot claim success or call AI",
  async () => {
    const result = await run(
      { action: "submit", experience, request_id: id },
      { ai: true, insertFailure: true },
    );
    assert(result.status === 503);
    assert(result.body.error);
    assert(!result.calls.some((c) => c.url.includes("openai.com")));
  },
);
Deno.test(
  "AI failure preserves the saved contribution and reports processing failure",
  async () => {
    const result = await run(
      { action: "submit", experience, request_id: id },
      { ai: true, aiFailure: true },
    );
    assert(result.status === 200);
    assert(result.body.processing.includes("AI extraction failed"));
    assert(
      result.calls.findIndex((c) => c.url.includes("/experiences")) <
        result.calls.findIndex((c) => c.url.includes("openai.com")),
    );
  },
);
Deno.test("invalid extraction cannot be stored as insight", async () => {
  const result = await run(
    { action: "submit", experience, request_id: id },
    { ai: true, invalidAI: true },
  );
  assert(result.body.processing.includes("AI extraction failed"));
  assert(!result.calls.some((c) => c.url.includes("/ai_insights")));
});
Deno.test(
  "AI roadmap reloads published evidence, validates citations, and orders weeks",
  async () => {
    const roadmap = {
      summary: "Selected contribution informs SQL practice.",
      skills: ["SQL"],
      technical_preparation: ["Practice joins"],
      business_preparation: ["Define metrics"],
      practice_projects: ["Build a dashboard"],
      interview_preparation: ["Explain your analysis"],
      tasks: [
        {
          title: "Present your findings",
          description:
            "General recommendation: rehearse a concise project story.",
          week_number: 2,
          source_ids: [],
        },
        {
          title: "Practice SQL joins",
          description:
            "The contributor recommends practicing joins and explaining results.",
          week_number: 1,
          source_ids: [id],
        },
      ],
    };
    const result = await run(
      { action: "roadmap", goal, source_ids: [id] },
      { ai: true, sourceAvailable: true, roadmap },
    );
    assert(result.status === 200 && result.body.mode === "ai");
    assert(result.body.roadmap.tasks[0].week_number === 1);
    const load = result.calls.find((c) => c.url.includes("/experiences"));
    assert(
      load?.url.includes("status=eq.published") &&
        load.url.includes("consent_to_publish=eq.true"),
    );
    const provider = result.calls.find((c) => c.url.includes("openai.com"));
    assert(String(provider?.payload.input).includes(experience.advice));
    const invalid = {
      ...roadmap,
      tasks: roadmap.tasks.map((t) => ({
        ...t,
        source_ids: ["22222222-2222-4222-8222-222222222222"],
      })),
    };
    const rejected = await run(
      { action: "roadmap", goal, source_ids: [id] },
      { ai: true, sourceAvailable: true, roadmap: invalid },
    );
    assert(rejected.status === 502);
  },
);
Deno.test(
  "stale or unpublished selected evidence blocks roadmap generation",
  async () => {
    const result = await run(
      { action: "roadmap", goal, source_ids: [id] },
      { ai: true },
    );
    assert(result.status === 400);
    assert(!result.calls.some((c) => c.url.includes("openai.com")));
  },
);
Deno.test(
  "valid extraction is stored separately using strict structured output",
  async () => {
    const result = await run(
      { action: "submit", experience, request_id: id },
      { ai: true },
    );
    assert(result.body.processing.includes("AI extraction complete"));
    const insight = result.calls.find((c) => c.url.includes("/ai_insights"));
    assert(insight?.payload.experience_id === id);
    const provider = result.calls.find((c) => c.url.includes("openai.com"));
    assert(provider?.payload.store === false);
    const text = provider.payload.text as {
      format: { strict: boolean; type: string };
    };
    assert(text.format.strict && text.format.type === "json_schema");
  },
);
Deno.test("roadmap without AI returns explicit template mode", async () => {
  const result = await run({ action: "roadmap", goal, source_ids: [] });
  assert(result.status === 200 && result.body.mode === "template");
});
Deno.test(
  "invalid roadmap source IDs and missing consent are rejected",
  async () => {
    const roadmap = await run({
      action: "roadmap",
      goal,
      source_ids: ["demo-1"],
    });
    assert(roadmap.status === 400);
    const submission = await run({
      action: "submit",
      experience: { ...experience, consent_to_publish: false },
      request_id: id,
    });
    assert(submission.status === 400);
    assert(!submission.calls.some((c) => c.url.includes("/experiences")));
  },
);
Deno.test(
  "feedback passes only validation-approved fields to private table",
  async () => {
    const result = await run({
      action: "feedback",
      feedback: {
        usefulness: 5,
        findability: 4,
        confusing: "",
        improve: "More examples",
        private_admin: true,
      },
      request_id: id,
    });
    assert(result.status === 200);
    const call = result.calls.find((c) => c.url.includes("/feedback"));
    assert(call?.payload.id === id);
    assert(!("private_admin" in call.payload));
  },
);
Deno.test(
  "rate limit, disallowed origin and unauthenticated retry are rejected",
  async () => {
    const limited = await run(
      { action: "roadmap", goal, source_ids: [] },
      { allowed: false },
    );
    assert(limited.status === 429);
    const origin = await run(
      { action: "feedback" },
      { origin: "https://other.test" },
    );
    assert(origin.status === 403 && origin.calls.length === 0);
    const retry = await run({ action: "retry-extraction", id });
    assert(retry.status === 401);
  },
);
