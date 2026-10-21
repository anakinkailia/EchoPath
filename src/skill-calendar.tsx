import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarDays,
  Check,
  Download,
  ExternalLink,
  FileCode2,
  MessageSquare,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useApp } from "./ui";
import { split, type Experience } from "./domain";
import { readLocal, saveLocal, track } from "./store";
import {
  addDays,
  intensities,
  levels,
  PLAN_DAYS,
  studyDates,
  templatePlan,
  toIcs,
  weekdayIndex,
  planBodySchema,
  planRequestSchema,
  type CalendarPlan,
  type Intensity,
  type PlanDay,
  type PlanRequest,
} from "./calendar-plan";
import "./skill-calendar.css";

const PLAN_KEY = "skill-plan";
const PROGRESS_KEY = "skill-plan-progress";
const steps = ["Skill", "Scenario", "Calendar"];
const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const presetScenarios = [
  [
    Briefcase,
    "Starting an internship",
    "Be productive in your first weeks on the job.",
  ],
  [
    MessageSquare,
    "Technical interview",
    "Answer live questions and explain your reasoning out loud.",
  ],
  [
    FileCode2,
    "Take-home assignment",
    "Deliver a clean, documented analysis on a deadline.",
  ],
  [
    Users,
    "Class or team project",
    "Own your part of a group analytics project.",
  ],
  [Trophy, "Case competition", "Turn messy data into a recommendation, fast."],
  [
    Zap,
    "Everyday speed",
    "Work faster day to day with shortcuts, templates and habits.",
  ],
] as const;

type Scenario = { label: string; detail: string };
type Settings = Pick<PlanRequest, "level" | "intensity" | "start" | "notes">;
const noteIdeas = [
  "I learn best from videos",
  "Focus on interview-style questions",
  "Include one small portfolio project",
  "Keep Saturday sessions light",
];
type SkillOption = { name: string; count: number; kind: "Tool" | "Skill" };

function loadPlan(): CalendarPlan | null {
  const value = readLocal<CalendarPlan | null>(PLAN_KEY, null);
  return value &&
    planBodySchema.safeParse(value).success &&
    planRequestSchema.safeParse(value.request).success
    ? value
    : null;
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const uses = (e: Experience, skill: string) =>
  split(`${e.tools},${e.valuable_skills}`).some(
    (s) => s.toLowerCase() === skill.toLowerCase(),
  );

function skillOptions(experiences: Experience[]): SkillOption[] {
  const map = new Map<string, SkillOption>();
  for (const e of experiences)
    for (const [list, kind] of [
      [e.tools, "Tool"],
      [e.valuable_skills, "Skill"],
    ] as const)
      for (const name of split(list)) {
        const key = name.toLowerCase();
        const current = map.get(key);
        map.set(key, {
          name: current?.name ?? name,
          kind: current?.kind ?? kind,
          count: (current?.count ?? 0) + 1,
        });
      }
  if (!map.has("excel shortcuts"))
    map.set("excel shortcuts", {
      name: "Excel shortcuts",
      kind: "Tool",
      count: 0,
    });
  const featured = ["python", "sql", "excel shortcuts"];
  return [...map.entries()]
    .sort(
      ([a, x], [b, y]) =>
        (featured.includes(a) ? featured.indexOf(a) : 99) -
          (featured.includes(b) ? featured.indexOf(b) : 99) ||
        y.count - x.count ||
        x.name.localeCompare(y.name),
    )
    .map(([, v]) => v);
}

export function Stepper({
  step,
  max,
  go,
  labels = steps,
}: {
  step: number;
  max: number;
  go: (n: number) => void;
  labels?: string[];
}) {
  return (
    <ol
      className="sc-stepper"
      style={{ "--fill": step / (labels.length - 1) } as React.CSSProperties}
    >
      {labels.map((label, i) => (
        <li key={label} className={i === step ? "now" : i < step ? "done" : ""}>
          <button
            type="button"
            disabled={i > max || i === step}
            onClick={() => go(i)}
            aria-current={i === step ? "step" : undefined}
          >
            <span>{i < step ? <Check size={14} /> : i + 1}</span>
            {label}
          </button>
        </li>
      ))}
    </ol>
  );
}

function SkillStep({
  options,
  skill,
  setSkill,
  next,
  total,
}: {
  options: SkillOption[];
  skill: string;
  setSkill: (s: string) => void;
  next: () => void;
  total: number;
}) {
  const [filter, setFilter] = useState("");
  const [custom, setCustom] = useState("");
  const [all, setAll] = useState(false);
  const max = Math.max(1, ...options.map((o) => o.count));
  const matches = options.filter((o) =>
    o.name.toLowerCase().includes(filter.trim().toLowerCase()),
  );
  const shown = all || filter ? matches : matches.slice(0, 15);
  return (
    <>
      <header className="sc-head">
        <span className="sc-kicker">Step 1 · Choose a skill</span>
        <h1 className="page-title">
          Which skill do you want to grow this month?
        </h1>
        <p>
          Drawn from the tools and skills mentioned across {total} experiences
          in the library.
        </p>
      </header>
      <label className="sc-filter">
        <Search size={17} aria-hidden="true" />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter skills"
          aria-label="Filter skills"
        />
      </label>
      <div className="sc-skill-grid">
        {shown.map((o, i) => (
          <button
            key={o.name}
            type="button"
            className="sc-skill"
            aria-pressed={skill === o.name}
            onClick={() => setSkill(o.name)}
            onDoubleClick={() => {
              setSkill(o.name);
              next();
            }}
            style={{ "--i": i, "--w": o.count / max } as React.CSSProperties}
          >
            <small>{o.kind}</small>
            <strong>{o.name}</strong>
            <span>
              {o.count
                ? `in ${o.count} experience${o.count > 1 ? "s" : ""}`
                : "core analyst skill"}
            </span>
            <i aria-hidden="true" />
          </button>
        ))}
        {!shown.length && <p className="sc-empty">No match. Add it below.</p>}
        {shown.length < matches.length && (
          <button
            type="button"
            className="sc-more"
            onClick={() => setAll(true)}
          >
            Show all {matches.length} skills
          </button>
        )}
      </div>
      <form
        className="sc-custom"
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim().length >= 2) {
            setSkill(custom.trim());
            next();
          }
        }}
      >
        <input
          value={custom}
          maxLength={60}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Something else? e.g. Power Query, A/B testing"
          aria-label="Add your own skill"
        />
        <button className="sc-ghost" disabled={custom.trim().length < 2}>
          Use this skill
        </button>
      </form>
      <footer className="sc-foot">
        <span>
          {skill ? (
            <>
              Selected: <b>{skill}</b>
            </>
          ) : (
            "Pick one skill to continue."
          )}
        </span>
        <button
          className="lp-cta"
          type="button"
          disabled={!skill}
          onClick={next}
        >
          Choose a scenario
          <span className="lp-cta-icon">
            <ArrowRight size={16} />
          </span>
        </button>
      </footer>
    </>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="sc-seg">
      <legend>{label}</legend>
      <div>
        {options.map((o) => (
          <label key={o.value} className={value === o.value ? "on" : ""}>
            <input
              type="radio"
              name={label}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            {o.label}
            {o.hint && <small>{o.hint}</small>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ScenarioStep({
  skill,
  experiences,
  scenario,
  setScenario,
  req,
  setReq,
  back,
  create,
}: {
  skill: string;
  experiences: Experience[];
  scenario: Scenario | null;
  setScenario: (s: Scenario) => void;
  req: Settings;
  setReq: (r: Settings) => void;
  back: () => void;
  create: () => void;
}) {
  const related = experiences.filter((e) => uses(e, skill)).slice(0, 3);
  const sessions = studyDates(req.start || today(), req.intensity).length;
  return (
    <>
      <header className="sc-head">
        <span className="sc-kicker">Step 2 · Pick the scenario</span>
        <h1 className="page-title">
          Where will you use <em>{skill}</em>?
        </h1>
        <p>
          Your calendar is shaped around the situation you’re preparing for.
        </p>
      </header>
      <div className="sc-scenarios">
        {presetScenarios.map(([Icon, label, detail], i) => (
          <button
            key={label}
            type="button"
            className="sc-scenario"
            aria-pressed={scenario?.label === label}
            onClick={() => setScenario({ label, detail })}
            style={{ "--i": i } as React.CSSProperties}
          >
            <Icon size={20} aria-hidden="true" />
            <strong>{label}</strong>
            <span>{detail}</span>
          </button>
        ))}
      </div>
      {related.length > 0 && (
        <>
          <h2 className="sc-sub">From the experience library</h2>
          <div className="sc-scenarios">
            {related.map((e, i) => {
              const label = `Like a ${e.role_title} at ${e.company}`;
              return (
                <button
                  key={e.id}
                  type="button"
                  className="sc-scenario library"
                  aria-pressed={scenario?.label === label}
                  onClick={() =>
                    setScenario({
                      label,
                      detail:
                        `${e.projects} Typical day: ${e.typical_day} Challenge: ${e.challenges} Solution: ${e.solutions}`.slice(
                          0,
                          1500,
                        ),
                    })
                  }
                  style={{ "--i": i + 6 } as React.CSSProperties}
                >
                  <Target size={20} aria-hidden="true" />
                  <strong>{label}</strong>
                  <span>{e.projects}</span>
                  <small>{e.industry}</small>
                </button>
              );
            })}
          </div>
        </>
      )}
      <div className="sc-settings">
        <Segmented
          label="Current level"
          value={req.level}
          options={levels.map((l) => ({ value: l, label: l }))}
          onChange={(level) => setReq({ ...req, level })}
        />
        <Segmented
          label="Intensity"
          value={req.intensity}
          options={(Object.keys(intensities) as Intensity[]).map((k) => ({
            value: k,
            label: intensities[k].label,
            hint: `${intensities[k].weekdays.length}×/wk · ${intensities[k].minutes} min`,
          }))}
          onChange={(intensity) => setReq({ ...req, intensity })}
        />
        <label className="sc-date">
          Start date
          <input
            type="date"
            value={req.start}
            min={today()}
            required
            onChange={(e) => setReq({ ...req, start: e.target.value })}
          />
        </label>
      </div>
      <div className="sc-notes">
        <label htmlFor="sc-notes-input">
          Extra instructions for the AI <small>Optional</small>
        </label>
        <textarea
          id="sc-notes-input"
          rows={3}
          maxLength={600}
          value={req.notes}
          onChange={(e) => setReq({ ...req, notes: e.target.value })}
          placeholder="e.g. I already know basic SELECT queries. Focus on window functions and timed interview practice, and suggest video courses where possible."
          aria-describedby="sc-notes-help"
        />
        <div className="sc-notes-foot">
          <div className="sc-note-ideas" aria-label="Add a suggestion">
            {noteIdeas.map((idea) => (
              <button
                key={idea}
                type="button"
                disabled={req.notes.includes(idea)}
                onClick={() =>
                  setReq({
                    ...req,
                    notes: (req.notes.trim()
                      ? `${req.notes.trim().replace(/[.]?$/, ".")} ${idea}.`
                      : `${idea}.`
                    ).slice(0, 600),
                  })
                }
              >
                + {idea}
              </button>
            ))}
          </div>
          <small id="sc-notes-help">
            {req.notes.length}/600 · used by the AI planner, not the template
          </small>
        </div>
      </div>
      <footer className="sc-foot">
        <button className="sc-ghost" type="button" onClick={back}>
          <ArrowLeft size={16} /> Back
        </button>
        <span>{sessions} sessions over 4 weeks</span>
        <button
          className="lp-cta"
          type="button"
          disabled={!scenario || !req.start}
          onClick={create}
        >
          Create my calendar
          <span className="lp-cta-icon">
            <Sparkles size={16} />
          </span>
        </button>
      </footer>
    </>
  );
}

const monthName = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });

function CalendarGrid({
  start,
  plan,
  selected,
  setSelected,
  done,
  idle,
}: {
  idle: boolean;
  start: string;
  plan: CalendarPlan | null;
  selected: string;
  setSelected: (d: string) => void;
  done: Record<string, boolean>;
}) {
  const first = addDays(start, -weekdayIndex(start));
  const end = addDays(start, PLAN_DAYS - 1);
  const cells = Array.from(
    { length: Math.ceil((weekdayIndex(start) + PLAN_DAYS) / 7) * 7 },
    (_, i) => addDays(first, i),
  );
  const byDate = new Map(plan?.days.map((d) => [d.date, d]));
  const now = today();
  return (
    <div className={`sc-cal ${plan ? "ready" : idle ? "" : "loading"}`}>
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <div key={d} className="sc-dow" aria-hidden="true">
          {d}
        </div>
      ))}
      {cells.map((date, i) => {
        const day = byDate.get(date);
        const inRange = date >= start && date <= end;
        const doneCount =
          day?.tasks.filter((_, t) => done[`${date}#${t}`]).length ?? 0;
        const label = `${monthName(date)} ${Number(date.slice(8))}`;
        const style = {
          "--i": i,
          "--row": Math.floor(i / 7),
        } as React.CSSProperties;
        if (!day)
          return (
            <div
              key={date}
              className={`sc-cell ${inRange ? "rest" : "out"} ${date === now ? "today" : ""}`}
              style={style}
            >
              <time dateTime={date}>
                {date.endsWith("-01") || i === 0
                  ? label
                  : Number(date.slice(8))}
              </time>
              {inRange && plan && <small>Rest</small>}
            </div>
          );
        return (
          <button
            key={date}
            type="button"
            className={`sc-cell study t-${day.type} ${selected === date ? "sel" : ""} ${date === now ? "today" : ""} ${doneCount === day.tasks.length ? "complete" : ""}`}
            style={style}
            onClick={() => setSelected(date)}
            aria-label={`${label}: ${day.title}, ${day.minutes} minutes, ${doneCount} of ${day.tasks.length} tasks done`}
          >
            <time dateTime={date}>
              {date.endsWith("-01") || i === 0 ? label : Number(date.slice(8))}
            </time>
            <strong>{day.title}</strong>
            <span>
              {day.minutes} min · {day.type}
            </span>
            <i
              aria-hidden="true"
              style={
                {
                  "--done": doneCount / day.tasks.length,
                } as React.CSSProperties
              }
            />
          </button>
        );
      })}
    </div>
  );
}

const loadingLines = [
  "Reading the scenario…",
  "Sequencing four weeks of practice…",
  "Placing sessions on your calendar…",
  "Writing concrete tasks for each day…",
];

function CalendarStep({
  plan,
  pending,
  failure,
  retry,
  useTemplate,
  restart,
}: {
  plan: CalendarPlan | null;
  pending: PlanRequest;
  failure: string;
  retry: () => void;
  useTemplate: () => void;
  restart: () => void;
}) {
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    readLocal(PROGRESS_KEY, {}),
  );
  const [selected, setSelected] = useState("");
  const [line, setLine] = useState(0);
  useEffect(() => {
    if (plan || failure) return;
    const t = setInterval(
      () => setLine((l) => (l + 1) % loadingLines.length),
      2600,
    );
    return () => clearInterval(t);
  }, [plan, failure]);
  const day =
    plan?.days.find((d) => d.date === selected) ??
    plan?.days.find((d) => d.date >= today()) ??
    plan?.days[0];
  const total = plan?.days.reduce((n, d) => n + d.tasks.length, 0) ?? 0;
  const finished = plan
    ? plan.days.reduce(
        (n, d) => n + d.tasks.filter((_, t) => done[`${d.date}#${t}`]).length,
        0,
      )
    : 0;
  const toggle = (key: string) => {
    const next = { ...done, [key]: !done[key] };
    setDone(next);
    saveLocal(PROGRESS_KEY, next);
  };
  const req = plan?.request ?? pending;
  const kit = useMemo(() => {
    const map = new Map<
      string,
      { link: PlanDay["links"][number]; sessions: number }
    >();
    for (const d of plan?.days ?? [])
      for (const link of d.links ?? [])
        map.set(link.id, {
          link,
          sessions: (map.get(link.id)?.sessions ?? 0) + 1,
        });
    return [...map.values()].sort((a, b) => b.sessions - a.sessions);
  }, [plan]);
  const ics = useMemo(
    () =>
      plan
        ? URL.createObjectURL(
            new Blob([toIcs(plan)], { type: "text/calendar" }),
          )
        : "",
    [plan],
  );
  useEffect(() => () => URL.revokeObjectURL(ics), [ics]);
  return (
    <>
      <header className="sc-head sc-plan-head">
        <div>
          <span className="sc-kicker">
            Step 3 · Your calendar
            {plan && (
              <b className={`sc-badge ${plan.source}`}>
                {plan.source === "ai"
                  ? `AI generated · ${plan.model}`
                  : "Template · not AI generated"}
              </b>
            )}
          </span>
          <h1 className="page-title">
            {plan
              ? plan.title
              : failure
                ? "We couldn’t build your calendar."
                : `Building your ${req.skill} month…`}
          </h1>
          {plan?.request.notes && (
            <p className="sc-your-notes">
              <b>Your instructions</b> {plan.request.notes}
            </p>
          )}
          <p aria-live="polite">
            {plan ? plan.summary : failure ? "" : loadingLines[line]}
          </p>
        </div>
        {plan && (
          <div
            className="sc-ring"
            style={
              { "--p": total ? finished / total : 0 } as React.CSSProperties
            }
            role="img"
            aria-label={`${finished} of ${total} tasks done`}
          >
            <strong>{Math.round((total ? finished / total : 0) * 100)}%</strong>
            <span>
              {finished}/{total} tasks
            </span>
          </div>
        )}
      </header>
      {failure && (
        <div className="sc-error" role="alert">
          <p>{failure}</p>
          <div>
            <button className="lp-cta" type="button" onClick={retry}>
              Try again
              <span className="lp-cta-icon">
                <RotateCcw size={15} />
              </span>
            </button>
            <button className="sc-ghost" type="button" onClick={useTemplate}>
              Use a template plan instead
            </button>
          </div>
        </div>
      )}
      {plan && (
        <ol className="sc-weeks">
          {plan.weeks.map((w, i) => (
            <li key={i} style={{ "--i": i } as React.CSSProperties}>
              <small>Week {i + 1}</small>
              <strong>{w.theme}</strong>
              <span>{w.goal}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="sc-board">
        <CalendarGrid
          start={req.start}
          plan={plan}
          selected={day?.date ?? ""}
          setSelected={setSelected}
          done={done}
          idle={Boolean(failure)}
        />
        {plan && day && (
          <aside className="sc-day" key={day.date}>
            <small>
              {new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </small>
            <h2>{day.title}</h2>
            <span className={`sc-type t-${day.type}`}>
              {day.type} · {day.minutes} min
            </span>
            <ul>
              {day.tasks.map((t, i) => {
                const key = `${day.date}#${i}`;
                return (
                  <li key={key}>
                    <label>
                      <input
                        type="checkbox"
                        checked={Boolean(done[key])}
                        onChange={() => toggle(key)}
                      />
                      <span>{t}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            {(day.links ?? []).length > 0 ? (
              <div className="sc-links">
                <b>Free resources for this session</b>
                {day.links.map((l) => (
                  <a key={l.id} href={l.url} target="_blank" rel="noreferrer">
                    <span>
                      <strong>{l.title}</strong>
                      <small>
                        {l.provider} · {l.kind}
                      </small>
                      {l.focus && <em>{l.focus}</em>}
                    </span>
                    <ExternalLink size={15} aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ))}
              </div>
            ) : (
              day.resource && (
                <p className="sc-resource">
                  <b>Resource</b> {day.resource}
                </p>
              )
            )}
          </aside>
        )}
      </div>
      {kit.length > 0 && (
        <section className="sc-kit" aria-labelledby="sc-kit-title">
          <h2 id="sc-kit-title">Your free resource kit</h2>
          <p>
            Every course and practice site used in this plan. All free; some
            Coursera courses are free to audit.
          </p>
          <ul>
            {kit.map(({ link, sessions }, i) => (
              <li key={link.id} style={{ "--i": i } as React.CSSProperties}>
                <a href={link.url} target="_blank" rel="noreferrer">
                  <small>{link.kind}</small>
                  <strong>{link.title}</strong>
                  <span>
                    {link.provider} · used in {sessions} session
                    {sessions > 1 ? "s" : ""}
                  </span>
                  <ExternalLink size={15} aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {plan && (
        <footer className="sc-foot sc-actions">
          <button className="sc-ghost" type="button" onClick={restart}>
            <RotateCcw size={16} /> New plan
          </button>
          <span>
            {req.skill} · {req.scenario}
          </span>
          <button
            className="sc-ghost"
            type="button"
            onClick={() => window.print()}
          >
            <Printer size={16} /> Print
          </button>
          <a
            className="lp-cta"
            href={ics}
            download={`echopath-${req.skill.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`}
            onClick={() => track("skill_plan_ics")}
          >
            Add to my calendar
            <span className="lp-cta-icon">
              <Download size={16} />
            </span>
          </a>
        </footer>
      )}
    </>
  );
}

export function SkillCalendar() {
  const { experiences, loading } = useApp();
  const [params] = useSearchParams();
  const [saved] = useState(loadPlan);
  const [step, setStep] = useState(saved ? 2 : 0);
  const [max, setMax] = useState(saved ? 2 : 0);
  const [leaving, setLeaving] = useState<"" | "fwd" | "back">("");
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [picked, setSkill] = useState(saved?.request.skill ?? "");
  const [scenario, setScenario] = useState<Scenario | null>(
    saved
      ? { label: saved.request.scenario, detail: saved.request.scenarioDetail }
      : null,
  );
  const [settings, setSettings] = useState({
    level: saved?.request.level ?? ("Beginner" as PlanRequest["level"]),
    intensity: saved?.request.intensity ?? ("steady" as Intensity),
    start: today(),
    notes: saved?.request.notes ?? "",
  });
  const [plan, setPlan] = useState<CalendarPlan | null>(saved);
  const [failure, setFailure] = useState("");
  const options = useMemo(() => skillOptions(experiences), [experiences]);
  const source = experiences.find((e) => e.id === params.get("source"));
  // Arriving from an experience page preselects that experience's first tool.
  const skill = picked || (source ? (split(source.tools)[0] ?? "") : "");

  function go(n: number) {
    if (n === step) return;
    const d = n > step ? "fwd" : "back";
    setDir(d);
    if (reduced()) {
      setStep(n);
      return;
    }
    setLeaving(d);
    setTimeout(() => {
      setLeaving("");
      setStep(n);
    }, 420);
  }
  const request: PlanRequest = {
    skill,
    scenario: scenario?.label ?? "",
    scenarioDetail: scenario?.detail ?? "",
    ...settings,
  };
  async function create() {
    setPlan(null);
    setFailure("");
    setMax(2);
    if (step !== 2) go(2);
    track("skill_plan_attempt");
    const started = Date.now();
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(body.error ?? "The planner is unavailable right now.");
      // keep the build-up animation on screen for at least a moment
      await new Promise((r) =>
        setTimeout(r, Math.max(0, 1200 - (Date.now() - started))),
      );
      setPlan(body);
      saveLocal(PLAN_KEY, body);
      saveLocal(PROGRESS_KEY, {});
      track("skill_plan_success");
    } catch (e) {
      setFailure(
        (e as Error).message === "Failed to fetch"
          ? "Couldn’t reach the planner. Check your connection and try again."
          : (e as Error).message,
      );
    }
  }
  function useTemplate() {
    const value = templatePlan(request);
    setFailure("");
    setPlan(value);
    saveLocal(PLAN_KEY, value);
    saveLocal(PROGRESS_KEY, {});
  }
  function restart() {
    setPlan(null);
    setFailure("");
    setScenario(null);
    setMax(1);
    saveLocal(PLAN_KEY, null);
    go(0);
  }
  return (
    <div className="sc-page lp">
      <div className="sc-glow" aria-hidden="true" />
      <div className="sc-wrap">
        <div className="sc-top">
          <span className="sc-title">
            <CalendarDays size={18} /> Skill calendar
          </span>
          <Stepper step={step} max={max} go={go} />
        </div>
        <section
          key={step}
          className={`sc-stage ${dir} ${leaving ? `leave ${leaving}` : ""}`}
          aria-label={`Step ${step + 1} of 3: ${steps[step]}`}
        >
          {step === 0 &&
            (loading ? (
              <div className="skeleton" />
            ) : (
              <SkillStep
                options={options}
                skill={skill}
                setSkill={setSkill}
                total={experiences.length}
                next={() => {
                  setMax((m) => Math.max(m, 1));
                  go(1);
                }}
              />
            ))}
          {step === 1 && (
            <ScenarioStep
              skill={skill}
              experiences={
                source
                  ? [source, ...experiences.filter((e) => e !== source)]
                  : experiences
              }
              scenario={scenario}
              setScenario={setScenario}
              req={settings}
              setReq={setSettings}
              back={() => go(0)}
              create={create}
            />
          )}
          {step === 2 && (
            <CalendarStep
              plan={plan}
              pending={request}
              failure={failure}
              retry={create}
              useTemplate={useTemplate}
              restart={restart}
            />
          )}
        </section>
      </div>
    </div>
  );
}
