// Shared by the browser and the /api/plan serverless function.
import { z } from "zod";
import {
  checkpointTasks,
  getResource,
  resourcesFor,
  trackFor,
} from "./resources.js";

export const levels = ["Beginner", "Some experience", "Comfortable"] as const;
export const intensities = {
  light: { label: "Light", weekdays: [0, 2, 5], minutes: 45 },
  steady: { label: "Steady", weekdays: [0, 1, 3, 5], minutes: 60 },
  intense: { label: "Intense", weekdays: [0, 1, 2, 3, 5], minutes: 75 },
} as const;
export type Intensity = keyof typeof intensities;
export const dayTypes = [
  "learn",
  "practice",
  "build",
  "review",
  "checkpoint",
] as const;
export const PLAN_DAYS = 28;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");
export const planRequestSchema = z.object({
  skill: z.string().trim().min(2).max(60),
  scenario: z.string().trim().min(3).max(200),
  scenarioDetail: z.string().trim().max(1500).default(""),
  level: z.enum(levels),
  intensity: z.enum(["light", "steady", "intense"]),
  start: isoDate,
});
export type PlanRequest = z.infer<typeof planRequestSchema>;

export const planDaySchema = z.object({
  date: isoDate,
  type: z.enum(dayTypes),
  title: z.string().trim().min(3).max(90),
  minutes: z.number().int().min(10).max(240),
  tasks: z.array(z.string().trim().min(3).max(220)).min(1).max(4),
  // Links always come from the curated catalog in resources.ts.
  links: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        provider: z.string(),
        url: z.url(),
        kind: z.string(),
        focus: z.string().max(140),
      }),
    )
    .max(3)
    .default([]),
  resource: z.string().trim().max(160).nullish(), // plans saved before links existed
});
export const planBodySchema = z.object({
  title: z.string().trim().min(3).max(100),
  summary: z.string().trim().min(10).max(500),
  weeks: z
    .array(
      z.object({
        theme: z.string().trim().min(2).max(60),
        goal: z.string().trim().min(5).max(220),
      }),
    )
    .length(4),
  days: z.array(planDaySchema).min(4).max(PLAN_DAYS),
});
export type PlanDay = z.infer<typeof planDaySchema>;
export type CalendarPlan = z.infer<typeof planBodySchema> & {
  request: PlanRequest;
  source: "ai" | "template";
  model?: string;
  created_at: string;
};

// Dates are handled as UTC calendar days so time zones never shift them.
export function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function weekdayIndex(date: string) {
  return (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday = 0
}
export function studyDates(start: string, intensity: Intensity) {
  const days = intensities[intensity].weekdays as readonly number[];
  return Array.from({ length: PLAN_DAYS }, (_, i) => addDays(start, i)).filter(
    (d) => days.includes(weekdayIndex(d)),
  );
}

export function buildPrompt(req: PlanRequest, dates: string[]) {
  const { minutes, label } = intensities[req.intensity];
  const kit = resourcesFor(req.skill, req.scenario)
    .map((r) => `- ${r.id} | ${r.title} | ${r.provider} | ${r.kind}`)
    .join("\n");
  return `Design a one-month study calendar for a USC Marshall MS Business Analytics student.

Skill to develop: ${req.skill}
Scenario they are preparing for: ${req.scenario}
${req.scenarioDetail ? `Scenario context: ${req.scenarioDetail}\n` : ""}Current level: ${req.level}
Intensity: ${label}, about ${minutes} minutes per session.
Study dates (use every one of these dates exactly once, nothing else): ${dates.join(", ")}

Free resources you may assign (id | title | provider | type):
${kit}

Rules:
- Progress over 4 weeks: foundations → guided practice → applying the skill to the scenario → a small capstone and review.
- Every session has 2-4 concrete, checkable tasks written as imperatives that reference the assigned material (e.g. "Complete SQLBolt lessons 6–8, then write 3 LEFT JOIN queries on a sample orders table").
- Every session lists 1-2 "resources" chosen ONLY from the ids above, each with a "focus" naming the exact lesson, chapter, module or exercise set to use (max 12 words). Never invent ids or URLs.
- Follow a sensible order through courses (e.g. lessons 1-4, then 5-8) instead of repeating the same lesson.
- Tie practice to the scenario; the last date is a "checkpoint" that simulates the scenario.
- "minutes" stays within ±20 of ${minutes}.
- "type" is one of: ${dayTypes.join(", ")}.

Reply with JSON only, no markdown, in exactly this shape:
{"title": string, "summary": string (2 sentences), "weeks": [{"theme": string (max 4 words), "goal": string}] (exactly 4), "days": [{"date": "YYYY-MM-DD", "type": string, "title": string (max 8 words), "minutes": number, "tasks": [string], "resources": [{"id": string, "focus": string}]}]}`;
}

const clip = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max).trim() : v;

// Keeps only ids that exist in the catalog, so every link is a checked URL.
function resolveLinks(list: unknown) {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  return list
    .map((x) => {
      const r = getResource(String(x?.id ?? x));
      if (!r || seen.has(r.id)) return null;
      seen.add(r.id);
      const { id, title, provider, url, kind } = r;
      const focus = typeof x?.focus === "string" ? x.focus : "";
      return {
        id,
        title,
        provider,
        url,
        kind,
        focus: clip(focus, 140) as string,
      };
    })
    .filter((x) => x !== null)
    .slice(0, 3);
}

// Repairs small slips (long text, extra tasks, unknown types) instead of
// discarding an otherwise good plan; structural problems still fail validation.
function normalizeReply(raw: unknown, minutes: number) {
  if (!raw || typeof raw !== "object") return raw;
  const r = raw as Record<string, unknown>;
  return {
    title: clip(r.title, 100),
    summary: clip(r.summary, 500),
    weeks: Array.isArray(r.weeks)
      ? r.weeks.slice(0, 4).map((w) => ({
          theme: clip(w?.theme, 60),
          goal: clip(w?.goal, 220),
        }))
      : r.weeks,
    days: Array.isArray(r.days)
      ? r.days
          .map((d) => ({
            date: typeof d?.date === "string" ? d.date.slice(0, 10) : d?.date,
            type: dayTypes.includes(String(d?.type).toLowerCase() as never)
              ? String(d.type).toLowerCase()
              : "practice",
            title: clip(d?.title, 90),
            minutes: Math.min(
              240,
              Math.max(10, Math.round(Number(d?.minutes) || minutes)),
            ),
            tasks: (Array.isArray(d?.tasks) ? d.tasks : [])
              .map((t: unknown) => clip(t, 220))
              .filter((t: unknown) => typeof t === "string" && t.length >= 3)
              .slice(0, 4),
            links: resolveLinks(d?.resources),
          }))
          .filter((d) => d.tasks.length > 0)
      : r.days,
  };
}

// Pulls the JSON object out of a model reply, repairs it and validates it.
export function parsePlanReply(reply: string, dates: string[], minutes = 60) {
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start < 0 || end <= start)
    throw new Error("The model did not return a plan.");
  let raw: unknown;
  try {
    raw = JSON.parse(reply.slice(start, end + 1));
  } catch {
    throw new Error("The model's plan was not valid JSON.");
  }
  const parsed = planBodySchema.safeParse(normalizeReply(raw, minutes));
  if (!parsed.success)
    throw new Error(
      `The model returned a plan in an unexpected format (${parsed.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}).`,
    );
  const allowed = new Set(dates);
  const seen = new Set<string>();
  const days = parsed.data.days
    .filter((d) => allowed.has(d.date) && !seen.has(d.date) && seen.add(d.date))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (days.length < Math.ceil(dates.length * 0.75))
    throw new Error("The model skipped too many study days.");
  return { ...parsed.data, days };
}

const phases = [
  ["Foundations", "learn"],
  ["Guided practice", "practice"],
  ["Apply it", "build"],
  ["Capstone & review", "review"],
] as const;

// Deterministic fallback built from a curated module track for the skill,
// clearly labeled as a template in the UI.
export function templatePlan(req: PlanRequest): CalendarPlan {
  const dates = studyDates(req.start, req.intensity);
  const { minutes } = intensities[req.intensity];
  const track = trackFor(req.skill);
  const used = new Set<number>();
  const days: PlanDay[] = dates.map((date, i) => {
    const week = Math.min(
      3,
      Math.floor((Date.parse(date) - Date.parse(req.start)) / 6048e5),
    );
    if (i === dates.length - 1)
      return {
        date,
        type: "checkpoint",
        minutes,
        title: `${req.scenario} dry run`.slice(0, 90),
        tasks: checkpointTasks(req.scenario, req.skill),
        links: resolveLinks(
          resourcesFor(req.skill, req.scenario, 2).map((r) => ({
            id: r.id,
            focus: "Keep open as a reference during the dry run",
          })),
        ),
      };
    const index = Math.min(
      track.length - 1,
      Math.floor((i * track.length) / Math.max(1, dates.length - 1)),
    );
    const repeat = used.has(index);
    used.add(index);
    const mod = track[index];
    return {
      date,
      type: repeat ? "practice" : phases[week][1],
      minutes,
      title: (repeat ? `Practice: ${mod.title}` : mod.title).slice(0, 90),
      tasks: repeat
        ? [
            `Redo the hardest exercise from “${mod.title}” without notes`,
            `Apply it to a task like: ${req.scenario}`,
            "Write down one mistake and how to avoid it",
          ]
        : mod.tasks,
      links: resolveLinks(mod.res.map(([id, focus]) => ({ id, focus }))),
    };
  });
  return {
    title: `${req.skill}: a four-week plan`,
    summary: `A curated template that moves from foundations to applying ${req.skill} in “${req.scenario}”, using free courses and practice sites. It is not AI generated.`,
    weeks: phases.map(([theme], w) => {
      const titles = days
        .filter(
          (d) =>
            Math.min(
              3,
              Math.floor((Date.parse(d.date) - Date.parse(req.start)) / 6048e5),
            ) === w && d.type !== "practice",
        )
        .map((d) => d.title);
      return {
        theme,
        goal: (titles.length
          ? titles.join(" · ")
          : `Practice ${req.skill}`
        ).slice(0, 220),
      };
    }),
    days,
    request: req,
    source: "template",
    created_at: new Date().toISOString(),
  };
}

const icsText = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

// All-day events so the plan can be imported into Google, Apple or Outlook calendars.
export function toIcs(plan: CalendarPlan) {
  const stamp =
    new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const events = plan.days.map((d) =>
    [
      "BEGIN:VEVENT",
      `UID:${d.date}-${plan.created_at}@echopath`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d.date.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${addDays(d.date, 1).replace(/-/g, "")}`,
      `SUMMARY:${icsText(`${plan.request.skill}: ${d.title} (${d.minutes} min)`)}`,
      `DESCRIPTION:${icsText(
        [
          ...d.tasks.map((t) => `• ${t}`),
          ...(d.links ?? []).map(
            (l) =>
              `${l.title} (${l.provider})${l.focus ? ` — ${l.focus}` : ""}: ${l.url}`,
          ),
        ].join("\n"),
      )}`,
      "END:VEVENT",
    ].join("\r\n"),
  );
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EchoPath//Skill calendar//EN",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}
