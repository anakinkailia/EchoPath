import { describe, expect, it } from "vitest";
import {
  buildPrompt,
  parsePlanReply,
  planBodySchema,
  studyDates,
  templatePlan,
  toIcs,
  weekdayIndex,
  type PlanRequest,
} from "../src/calendar-plan";
import { POST } from "../api/plan";

const req: PlanRequest = {
  skill: "SQL",
  scenario: "Technical interview",
  scenarioDetail: "",
  level: "Beginner",
  intensity: "steady",
  start: "2026-10-20",
};

describe("skill calendar plans", () => {
  it("places study sessions on the intensity's weekdays within four weeks", () => {
    const dates = studyDates(req.start, "steady");
    expect(dates).toHaveLength(16);
    expect(dates[0]).toBe("2026-10-20"); // Tuesday
    expect(dates.at(-1)! <= "2026-11-16").toBe(true);
    expect(new Set(dates.map(weekdayIndex))).toEqual(new Set([0, 1, 3, 5]));
    expect(studyDates(req.start, "light")).toHaveLength(12);
  });
  it("prompts with every study date and never asks for URLs", () => {
    const prompt = buildPrompt(req, studyDates(req.start, "steady"));
    expect(prompt).toContain("2026-11-14");
    expect(prompt).toContain("Never invent URLs");
  });
  it("accepts a valid model reply, keeps only scheduled dates and sorts them", () => {
    const dates = ["2026-10-20", "2026-10-22", "2026-10-24", "2026-10-26"];
    const day = (date: string) => ({
      date,
      type: "learn",
      title: "SELECT basics",
      minutes: 60,
      tasks: ["Write five SELECT queries"],
      resource: "SQLBolt",
    });
    const reply = `Here you go:\n${JSON.stringify({
      title: "SQL month",
      summary: "Build SQL skills for interviews. Finish with a mock.",
      weeks: Array(4).fill({ theme: "Basics", goal: "Learn the basics" }),
      days: [
        day("2026-10-24"),
        day("2026-10-20"),
        day("2026-10-22"),
        day("2026-10-26"),
        day("2030-01-01"),
      ],
    })}`;
    const plan = parsePlanReply(reply, dates);
    expect(plan.days.map((d) => d.date)).toEqual(dates);
  });
  it("repairs small slips instead of discarding the plan", () => {
    const dates = ["2026-10-20", "2026-10-22", "2026-10-24", "2026-10-26"];
    const reply =
      "```json\n" +
      JSON.stringify({
        title: "SQL month",
        summary: "Build SQL skills for interviews. Finish with a mock.",
        weeks: Array(5).fill({ theme: "Basics", goal: "Learn the basics" }),
        days: dates.map((date) => ({
          date,
          type: "Rest",
          title: "A".repeat(140),
          minutes: "75",
          tasks: ["one", "two", "three", "four", "five", "x"],
          resource: "R".repeat(300),
        })),
      }) +
      "\n```";
    const plan = parsePlanReply(reply, dates);
    expect(plan.weeks).toHaveLength(4);
    expect(plan.days[0]).toMatchObject({ type: "practice", minutes: 75 });
    expect(plan.days[0].title).toHaveLength(90);
    expect(plan.days[0].tasks).toEqual(["one", "two", "three", "four"]);
    expect(plan.days[0].resource).toHaveLength(160);
  });
  it("rejects replies that skip most study days or are malformed", () => {
    expect(() => parsePlanReply("no json here", ["2026-10-20"])).toThrow();
    expect(() =>
      parsePlanReply(JSON.stringify({ title: "x", days: [] }), ["2026-10-20"]),
    ).toThrow();
  });
  it("builds a labeled template plan and a valid calendar file", () => {
    const plan = templatePlan(req);
    expect(plan.source).toBe("template");
    expect(planBodySchema.safeParse(plan).success).toBe(true);
    expect(plan.days.at(-1)!.type).toBe("checkpoint");
    const ics = toIcs(plan);
    expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(plan.days.length);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261020");
  });
});

describe("/api/plan", () => {
  const call = (headers: Record<string, string>, body: unknown = req) =>
    POST(
      new Request("http://echopath.test/api/plan", {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify(body),
      }),
    );
  it("refuses requests from other origins", async () => {
    const res = await call({
      origin: "https://evil.example",
      host: "echopath.test",
    });
    expect(res.status).toBe(403);
  });
  it("reports missing server configuration without leaking details", async () => {
    const saved = process.env.POE_API_KEY;
    delete process.env.POE_API_KEY;
    const res = await call({
      origin: "http://echopath.test",
      host: "echopath.test",
    });
    expect(res.status).toBe(503);
    if (saved) process.env.POE_API_KEY = saved;
  });
});
