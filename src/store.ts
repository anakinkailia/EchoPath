import { createClient } from "@supabase/supabase-js";
import { demoExperiences } from "./data";
import {
  type Experience,
  type Submission,
  type Goal,
  type Roadmap,
  extractTemplate,
  templateRoadmap,
  insightSchema,
  roadmapSchema,
  feedbackSchema,
  submissionSchema,
  savedRoadmapSchema,
} from "./domain";
const url = import.meta.env.VITE_SUPABASE_URL,
  key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const live = Boolean(url || key);
export const db = (() => {
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
})();
function checkConfiguration() {
  if (live && !db)
    throw new Error(
      "Supabase configuration is incomplete or invalid. Check both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the app.",
    );
}
export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`echopath:${key}`);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return Array.isArray(fallback) && !Array.isArray(value)
      ? fallback
      : (value as T);
  } catch {
    return fallback;
  }
}
export function loadRoadmap(): Roadmap | null {
  const parsed = savedRoadmapSchema.safeParse(
    readLocal(live ? "roadmap-live" : "roadmap-demo", null),
  );
  return parsed.success ? parsed.data : null;
}
function localSubmissions(): Experience[] {
  return readLocal<Experience[]>("submissions", []).filter(
    (e) =>
      submissionSchema.safeParse(e).success &&
      typeof e.id === "string" &&
      typeof e.created_at === "string",
  );
}
export function saveLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(`echopath:${key}`, JSON.stringify(value));
  } catch {
    throw new Error(
      "Browser storage is unavailable or full. Allow storage and try again.",
    );
  }
}
export function track(event: string) {
  try {
    const events = readLocal<{ event: string; mode: string; at: string }[]>(
      "events",
      [],
    );
    saveLocal(
      "events",
      [
        ...events,
        { event, mode: live ? "live" : "demo", at: new Date().toISOString() },
      ].slice(-1000),
    );
  } catch {
    /* Analytics must never block product use. */
  }
}
export async function listExperiences(): Promise<Experience[]> {
  checkConfiguration();
  if (!db) return [...localSubmissions(), ...demoExperiences];
  const { data, error } = await db
    .from("experiences")
    .select("*,ai_insights(*)")
    .eq("status", "published")
    .eq("consent_to_publish", true);
  if (error)
    throw new Error(
      "Could not load published experiences. Check your connection and database configuration.",
    );
  return (data ?? []).map(({ ai_insights, ...e }) => {
    // PostgREST infers an object for the unique foreign key; accept an array too.
    const insight = Array.isArray(ai_insights) ? ai_insights[0] : ai_insights;
    const parsed = insightSchema.safeParse(insight);
    return {
      ...e,
      insights: parsed.success ? parsed.data : undefined,
      model_version: insight?.model_version,
      provenance: "published",
    };
  }) as Experience[];
}
async function invoke(action: string, payload: unknown) {
  if (!db) throw new Error("Persistent mode is not configured.");
  const { data, error } = await db.functions.invoke("echopath", {
    body: { action, ...(payload as object) },
  });
  if (error)
    throw new Error(
      "The server could not complete this request. Check your connection or contact the project team.",
    );
  if (data?.error) throw new Error(data.error);
  return data;
}
export async function submitExperience(input: Submission, requestId: string) {
  checkConfiguration();
  const value = submissionSchema.parse(input);
  if (db) {
    return (await invoke("submit", {
      experience: value,
      request_id: requestId,
    })) as { id: string; processing: string };
  }
  const items = localSubmissions();
  const existing = items.find((e) => e.id === requestId);
  if (!existing) {
    const e: Experience = {
      ...value,
      contributor_display_name:
        value.anonymity_preference === "Anonymous"
          ? ""
          : value.anonymity_preference === "First name only"
            ? value.contributor_display_name.split(/\s+/)[0]
            : value.contributor_display_name,
      id: requestId,
      created_at: new Date().toISOString(),
      status: "published",
      insights: extractTemplate(value),
      model_version: "demo-template",
      provenance: "local",
    };
    saveLocal("submissions", [e, ...items]);
  }
  return {
    id: requestId,
    processing: "Template extraction · not AI generated",
  };
}
export async function generateRoadmap(
  goal: Goal,
  sources: Experience[],
): Promise<Roadmap> {
  checkConfiguration();
  if (!db) return templateRoadmap(goal, sources);
  const data = await invoke("roadmap", {
    goal,
    source_ids: sources.map((e) => e.id),
  });
  if (data.mode === "template") return templateRoadmap(goal, sources);
  const content = roadmapSchema.parse(data.roadmap);
  const allowed = new Set(sources.map((e) => e.id));
  if (
    content.tasks.some(
      (t) =>
        t.week_number > goal.weeks ||
        t.source_ids.some((id) => !allowed.has(id)),
    )
  )
    throw new Error(
      "The generated roadmap contained invalid evidence references. Try again.",
    );
  return {
    ...content,
    id: crypto.randomUUID(),
    completed: [],
    source_experience_ids: sources.map((e) => e.id),
    mode: sources.length
      ? "AI generated · selected records supplied as evidence"
      : "AI generated · general suggestions, no experience evidence",
    goal,
  };
}
export async function sendFeedback(input: unknown, requestId: string) {
  checkConfiguration();
  const value = feedbackSchema.parse(input);
  if (db) {
    await invoke("feedback", { feedback: value, request_id: requestId });
    return;
  }
  saveLocal("feedback", [
    ...readLocal<unknown[]>("feedback", []),
    { ...value, id: requestId, at: new Date().toISOString(), mode: "demo" },
  ]);
}
export function exportReport() {
  const blob = new Blob(
    [
      JSON.stringify(
        {
          scope: "This browser only; no shared-server feedback included",
          events: readLocal("events", []),
          feedback: readLocal("feedback", []),
        },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "echopath-local-report.json";
  a.click();
  URL.revokeObjectURL(url);
}
