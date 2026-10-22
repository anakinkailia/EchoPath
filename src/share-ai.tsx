import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Paperclip,
  Plus,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { ButtonLink, useApp } from "./ui";
import {
  experienceTypes,
  interviewQuestionTypes,
  split,
  submissionSchema,
  type Interview,
  type Submission,
} from "./domain";
import { live, submitExperience, track } from "./store";
import { Stepper } from "./skill-calendar";
import {
  demoResume,
  MAX_SAMPLE_BYTES,
  MAX_SOURCE_CHARS,
  redactContact,
  roleCategories,
  type FoundExperience,
  type PostDraft,
} from "./experience-ai";
import { extractText, resumeAccept } from "./extract-text";
import { formatBytes, saveSample } from "./work-samples";
import "./skill-calendar.css";
import "./share-ai.css";

type Draft = Omit<Submission, "consent_to_publish"> & {
  consent_to_publish: boolean;
};
const labels = ["Your write-up", "Questions", "Review & publish"];
const sections: [keyof PostDraft, string][] = [
  ["responsibilities", "What I owned"],
  ["projects", "Projects & deliverables"],
  ["typical_day", "A typical day or week"],
  ["challenges", "Biggest challenge"],
  ["solutions", "How I solved it"],
  ["advice", "Advice for the next student"],
];
const emptyInterview: Interview = { rounds: [], asked_back: [], outcome: "" };

// Drops blank rows the author left behind before validating or publishing.
function tidy(draft: Draft): Draft {
  const iv = draft.interview ?? emptyInterview;
  return {
    ...draft,
    interview: {
      rounds: iv.rounds
        .map((r) => ({
          ...r,
          questions: r.questions.filter((q) => q.q.trim().length >= 3),
        }))
        .filter((r) => r.questions.length),
      asked_back: iv.asked_back.map((q) => q.trim()).filter(Boolean),
      outcome: iv.outcome.trim(),
    },
  };
}

function TagField({
  label,
  hint,
  value,
  onChange,
  invalid,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: string;
}) {
  const tags = split(value);
  return (
    <label className="sh-section sh-tags">
      <span>{label}</span>
      <small className="sh-note">{hint}</small>
      <input
        value={value}
        maxLength={600}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!invalid}
      />
      {tags.length > 0 && (
        <ul className="skill-tags" aria-label={`${label} preview`}>
          {tags.map((t) => (
            <li key={t}>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
      {invalid && <small className="error">{invalid}</small>}
    </label>
  );
}

function InterviewEditor({
  value,
  onChange,
}: {
  value: Interview;
  onChange: (v: Interview) => void;
}) {
  const setRound = (i: number, r: Interview["rounds"][number]) =>
    onChange({
      ...value,
      rounds: value.rounds.map((x, n) => (n === i ? r : x)),
    });
  return (
    <fieldset className="sh-section sh-interview">
      <legend>The interview</legend>
      <small className="sh-note">
        Only questions you were really asked. Fix the wording, change the type,
        or add any the AI missed. Empty rows are dropped.
      </small>
      {value.rounds.map((r, i) => (
        <div className="sh-round" key={i}>
          <div className="sh-round-head">
            <input
              value={r.label}
              maxLength={160}
              placeholder={`Round ${i + 1} · 30 min · Video`}
              aria-label={`Round ${i + 1} label`}
              onChange={(e) => setRound(i, { ...r, label: e.target.value })}
            />
            <button
              type="button"
              className="sh-icon"
              aria-label={`Remove round ${i + 1}`}
              onClick={() =>
                onChange({
                  ...value,
                  rounds: value.rounds.filter((_, n) => n !== i),
                })
              }
            >
              <X size={16} />
            </button>
          </div>
          {r.questions.map((q, n) => (
            <div className="sh-q-row" key={n}>
              <select
                value={q.type}
                aria-label={`Round ${i + 1} question ${n + 1} type`}
                onChange={(e) =>
                  setRound(i, {
                    ...r,
                    questions: r.questions.map((x, k) =>
                      k === n
                        ? { ...x, type: e.target.value as typeof q.type }
                        : x,
                    ),
                  })
                }
              >
                {interviewQuestionTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <textarea
                rows={2}
                maxLength={500}
                value={q.q}
                aria-label={`Round ${i + 1} question ${n + 1}`}
                onChange={(e) =>
                  setRound(i, {
                    ...r,
                    questions: r.questions.map((x, k) =>
                      k === n ? { ...x, q: e.target.value } : x,
                    ),
                  })
                }
              />
              <button
                type="button"
                className="sh-icon"
                aria-label={`Remove round ${i + 1} question ${n + 1}`}
                onClick={() =>
                  setRound(i, {
                    ...r,
                    questions: r.questions.filter((_, k) => k !== n),
                  })
                }
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {r.questions.length < 15 && (
            <button
              type="button"
              className="sh-add"
              onClick={() =>
                setRound(i, {
                  ...r,
                  questions: [
                    ...r.questions,
                    { q: "", type: "technical", note: "" },
                  ],
                })
              }
            >
              <Plus size={14} /> Add a question
            </button>
          )}
        </div>
      ))}
      {value.rounds.length < 6 && (
        <button
          type="button"
          className="sh-add"
          onClick={() =>
            onChange({
              ...value,
              rounds: [
                ...value.rounds,
                {
                  label: "",
                  questions: [{ q: "", type: "technical", note: "" }],
                },
              ],
            })
          }
        >
          <Plus size={14} /> Add a round
        </button>
      )}
      <label className="sh-sub">
        What you asked the interviewer <small>One per line</small>
        <textarea
          rows={2}
          value={value.asked_back.join("\n")}
          onChange={(e) =>
            onChange({ ...value, asked_back: e.target.value.split("\n") })
          }
        />
      </label>
      <label className="sh-sub">
        Outcome or feedback <small>Optional</small>
        <input
          maxLength={500}
          value={value.outcome}
          onChange={(e) => onChange({ ...value, outcome: e.target.value })}
        />
      </label>
    </fieldset>
  );
}
const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

async function callAI<T>(body: object): Promise<T> {
  let res: Response;
  try {
    res = await fetch("/api/experience", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Couldn’t reach the AI. Check your connection and try again.",
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data.error ?? "The AI is unavailable right now.");
  return data as T;
}

function SourceStep({
  text,
  setText,
  sourceName,
  setSourceName,
  busy,
  analyze,
}: {
  text: string;
  setText: (t: string) => void;
  sourceName: string;
  setSourceName: (n: string) => void;
  busy: boolean;
  analyze: () => void;
}) {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [reading, setReading] = useState(false);
  const [problem, setProblem] = useState("");
  const [over, setOver] = useState(false);
  const redacted = redactContact(text);
  async function read(file: File | undefined) {
    if (!file) return;
    setProblem("");
    setReading(true);
    try {
      setText((await extractText(file)).slice(0, MAX_SOURCE_CHARS));
      setSourceName(file.name);
      track("share_resume_read");
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setReading(false);
    }
  }
  return (
    <>
      <header className="sc-head">
        <span className="sc-kicker">Step 1 · Your write-up</span>
        <h1>Start from your resume.</h1>
        <p>
          Upload a resume or paste an experience write-up. AI finds your
          experiences, asks a few questions, and drafts a post you can edit.
        </p>
      </header>
      <div
        className="sh-tabs"
        role="tablist"
        aria-label="How to add your write-up"
      >
        {(["upload", "paste"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
          >
            {m === "upload" ? "Upload a file" : "Paste text"}
          </button>
        ))}
      </div>
      {mode === "upload" ? (
        <label
          className={`sh-drop ${over ? "over" : ""} ${text ? "has-file" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            void read(e.dataTransfer.files[0]);
          }}
        >
          <input
            type="file"
            accept={resumeAccept}
            onChange={(e) => void read(e.target.files?.[0])}
            aria-describedby="sh-drop-help"
          />
          <span className="sh-drop-icon" aria-hidden="true">
            {text ? <FileText size={26} /> : <Upload size={26} />}
          </span>
          {reading ? (
            <strong>Reading your file…</strong>
          ) : text ? (
            <>
              <strong>{sourceName}</strong>
              <span>
                {text.length.toLocaleString()} characters read · drop another
                file to replace it
              </span>
            </>
          ) : (
            <>
              <strong>Drop your resume here, or click to browse</strong>
              <span id="sh-drop-help">
                PDF, Word (.docx) or text · up to 5 MB
              </span>
            </>
          )}
        </label>
      ) : (
        <textarea
          className="sh-paste"
          rows={10}
          maxLength={MAX_SOURCE_CHARS}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSourceName("Pasted text");
          }}
          placeholder="Paste your resume, or describe an internship or project in your own words: the role, company, dates, what you worked on, and the tools you used."
          aria-label="Paste your resume or experience write-up"
        />
      )}
      {problem && (
        <p className="sh-problem" role="alert">
          {problem}
        </p>
      )}
      {!live && !text && (
        <button
          type="button"
          className="sh-demo"
          onClick={() => {
            setText(demoResume);
            setSourceName("Fictional demo resume");
          }}
        >
          <Sparkles size={15} /> Try it with a fictional demo resume
        </button>
      )}
      <div className="sh-privacy">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <strong>Your contact details stay out.</strong> Emails, phone numbers
          and links are removed before the text is sent to the AI. The text is
          used only to draft your post and isn’t stored on a server.
          {text && (
            <details>
              <summary>See exactly what the AI will receive</summary>
              <pre>{redacted}</pre>
            </details>
          )}
        </div>
      </div>
      <footer className="sc-foot">
        <span>
          {text
            ? `${redacted.length.toLocaleString()} characters ready`
            : "Add a resume or write-up to continue."}
        </span>
        <button
          className="lp-cta"
          type="button"
          disabled={busy || reading || text.trim().length < 80}
          onClick={analyze}
        >
          {busy ? "Finding your experiences…" : "Analyze with AI"}
          <span className={`lp-cta-icon ${busy ? "sh-spin" : ""}`}>
            <Sparkles size={16} />
          </span>
        </button>
      </footer>
    </>
  );
}

function QuestionStep({
  experiences,
  picked,
  setPicked,
  answers,
  setAnswer,
  extra,
  setExtra,
  sample,
  setSample,
  busy,
  back,
  compose,
}: {
  experiences: FoundExperience[];
  picked: string;
  setPicked: (k: string) => void;
  answers: Record<string, string>;
  setAnswer: (k: string, v: string) => void;
  extra: string;
  setExtra: (v: string) => void;
  sample: File | null;
  setSample: (f: File | null) => void;
  busy: boolean;
  back: () => void;
  compose: () => void;
}) {
  const [problem, setProblem] = useState("");
  const current = experiences.find((e) => e.key === picked);
  return (
    <>
      <header className="sc-head">
        <span className="sc-kicker">Step 2 · A few questions</span>
        <h1>
          {experiences.length > 1
            ? "Which experience should we post?"
            : "A few questions about this role."}
        </h1>
        <p>
          The AI found {experiences.length} experience
          {experiences.length > 1 ? "s" : ""}. Your answers turn a resume line
          into something a future student can actually learn from.
        </p>
      </header>
      <div className="sh-found">
        {experiences.map((e, i) => (
          <button
            key={e.key}
            type="button"
            className="sc-scenario"
            aria-pressed={picked === e.key}
            onClick={() => setPicked(e.key)}
            style={{ "--i": i } as React.CSSProperties}
          >
            <small>
              {e.experience_type} · {e.duration || e.year}
            </small>
            <strong>{e.role_title}</strong>
            <span className="sh-company">{e.company}</span>
            <span>{e.summary}</span>
          </button>
        ))}
      </div>
      {current && (
        <section
          className="sh-questions"
          key={current.key}
          aria-label="Follow-up questions"
        >
          {current.questions.map((q, i) => (
            <label key={q.id} style={{ "--i": i } as React.CSSProperties}>
              <span className="sh-q">
                <b>{i + 1}</b>
                {q.question}
              </span>
              <textarea
                rows={3}
                maxLength={2000}
                value={answers[`${current.key}:${q.id}`] ?? ""}
                onChange={(e) =>
                  setAnswer(`${current.key}:${q.id}`, e.target.value)
                }
                placeholder={q.hint || "Optional — a few sentences is plenty."}
              />
            </label>
          ))}
          <label className="sh-extra">
            <span className="sh-q">
              <b>
                <Plus size={13} />
              </b>
              Anything else you want in the post?
              <small>Optional</small>
            </span>
            <textarea
              rows={3}
              maxLength={2000}
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="Extra details, context or advice the questions didn’t cover."
            />
          </label>
          <div className="sh-sample">
            <span className="sh-q">
              <b>
                <Paperclip size={13} />
              </b>
              Work sample
              <small>Optional · under 10 MB</small>
            </span>
            {sample ? (
              <div className="sh-file">
                <FileText size={18} aria-hidden="true" />
                <span>
                  <strong>{sample.name}</strong>
                  <small>{formatBytes(sample.size)}</small>
                </span>
                <button
                  type="button"
                  onClick={() => setSample(null)}
                  aria-label={`Remove ${sample.name}`}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="sh-attach">
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    if (f.size > MAX_SAMPLE_BYTES) {
                      setProblem(
                        `${f.name} is ${formatBytes(f.size)}. Work samples must be under 10 MB.`,
                      );
                      return;
                    }
                    setProblem("");
                    setSample(f);
                  }}
                />
                <Upload size={16} aria-hidden="true" /> Attach a demo of your
                output: a screenshot, PDF, notebook, query or deck
              </label>
            )}
            {problem && (
              <p className="sh-problem" role="alert">
                {problem}
              </p>
            )}
            <small className="sh-note">
              Only share work you have permission to share, or a recreation with
              synthetic data.{" "}
              {live ? "" : "In this demo the file stays in your browser."}
            </small>
          </div>
        </section>
      )}
      <footer className="sc-foot">
        <button className="sc-ghost" type="button" onClick={back}>
          <ArrowLeft size={16} /> Back
        </button>
        <span>
          {current
            ? `${current.questions.filter((q) => (answers[`${current.key}:${q.id}`] ?? "").trim()).length} of ${current.questions.length} answered`
            : "Pick an experience to continue."}
        </span>
        <button
          className="lp-cta"
          type="button"
          disabled={!current || busy}
          onClick={compose}
        >
          {busy ? "Writing your post…" : "Write my post"}
          <span className={`lp-cta-icon ${busy ? "sh-spin" : ""}`}>
            <Sparkles size={16} />
          </span>
        </button>
      </footer>
    </>
  );
}

function ReviewStep({
  draft,
  update,
  sample,
  busy,
  failure,
  back,
  publish,
}: {
  draft: Draft;
  update: (k: keyof Draft, v: unknown) => void;
  sample: File | null;
  busy: boolean;
  failure: string;
  back: () => void;
  publish: () => void;
}) {
  const issues = submissionSchema.safeParse(tidy(draft));
  const problems = issues.success
    ? {}
    : Object.fromEntries(
        issues.error.issues.map((i) => [String(i.path[0]), i.message]),
      );
  return (
    <>
      <header className="sc-head">
        <span className="sc-kicker">Step 3 · Review & publish</span>
        <h1>Make it yours.</h1>
        <p>
          Check every section: fix anything the AI got wrong and remove anything
          confidential. Then choose how you appear.
        </p>
      </header>
      <div className="sh-review">
        <div className="sh-basics">
          {(
            [
              ["role_title", "Role title"],
              ["company", "Company or organization"],
              ["industry", "Industry"],
              ["duration", "Duration"],
            ] as const
          ).map(([k, label]) => (
            <label key={k}>
              {label}
              <input
                value={String(draft[k])}
                maxLength={120}
                onChange={(e) => update(k, e.target.value)}
                aria-invalid={!!problems[k]}
              />
            </label>
          ))}
          <label>
            Year
            <input
              type="number"
              min={2000}
              max={2100}
              value={draft.year}
              onChange={(e) => update("year", Number(e.target.value))}
            />
          </label>
          <label>
            Type
            <select
              value={draft.experience_type}
              onChange={(e) => update("experience_type", e.target.value)}
            >
              {experienceTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Role category
            <select
              value={draft.role_category}
              onChange={(e) => update("role_category", e.target.value)}
            >
              {[...new Set([draft.role_category, ...roleCategories])].map(
                (t) => (
                  <option key={t}>{t}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Work arrangement
            <select
              value={draft.work_arrangement}
              onChange={(e) => update("work_arrangement", e.target.value)}
            >
              <option value="">Not specified</option>
              {["Hybrid", "Remote", "On-site"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        {sections.map(([k, label], i) => (
          <label
            key={k}
            className="sh-section"
            style={{ "--i": i } as React.CSSProperties}
          >
            <span>{label}</span>
            <textarea
              value={String(draft[k as keyof Draft])}
              rows={k === "tools" || k === "valuable_skills" ? 2 : 4}
              maxLength={5000}
              onChange={(e) => update(k as keyof Draft, e.target.value)}
              aria-invalid={!!problems[k]}
            />
            {problems[k] && <small className="error">{problems[k]}</small>}
          </label>
        ))}
        <TagField
          label="Tools & methods"
          hint="Short tags separated by commas. Each becomes a block with a Train this skill link."
          value={draft.tools}
          onChange={(v) => update("tools", v)}
          invalid={problems.tools}
        />
        <TagField
          label="Skills that mattered"
          hint="Abilities and practices, separated by commas."
          value={draft.valuable_skills}
          onChange={(v) => update("valuable_skills", v)}
          invalid={problems.valuable_skills}
        />
        <InterviewEditor
          value={draft.interview ?? emptyInterview}
          onChange={(v) => update("interview", v)}
        />
        {sample && (
          <div className="sh-file sh-file-review">
            <Paperclip size={18} aria-hidden="true" />
            <span>
              <strong>{sample.name}</strong>
              <small>
                Work sample · {formatBytes(sample.size)}
                {live ? "" : " · saved in this browser with your post"}
              </small>
            </span>
          </div>
        )}
        <fieldset className="sh-privacy-choice">
          <legend>How would you like to appear?</legend>
          <div>
            {(["Anonymous", "First name only", "Display name"] as const).map(
              (v) => (
                <label
                  key={v}
                  className={draft.anonymity_preference === v ? "on" : ""}
                >
                  <input
                    type="radio"
                    name="anonymity"
                    checked={draft.anonymity_preference === v}
                    onChange={() => update("anonymity_preference", v)}
                  />
                  {v}
                </label>
              ),
            )}
          </div>
          {draft.anonymity_preference !== "Anonymous" && (
            <label className="sh-name">
              {draft.anonymity_preference === "First name only"
                ? "First name"
                : "Display name"}
              <input
                maxLength={80}
                value={draft.contributor_display_name}
                onChange={(e) =>
                  update("contributor_display_name", e.target.value)
                }
                aria-invalid={!!problems.contributor_display_name}
              />
              {problems.contributor_display_name && (
                <small className="error">
                  {problems.contributor_display_name}
                </small>
              )}
            </label>
          )}
        </fieldset>
        <label className="sh-consent">
          <input
            type="checkbox"
            checked={draft.consent_to_publish}
            onChange={(e) => update("consent_to_publish", e.target.checked)}
          />
          <span>
            I reviewed this AI draft and consent to sharing it with EchoPath
            users{live ? "" : " in this local demo"}. I removed confidential
            information and other people’s personal details.
          </span>
        </label>
      </div>
      {failure && (
        <p className="sh-problem" role="alert">
          {failure}
        </p>
      )}
      <footer className="sc-foot">
        <button className="sc-ghost" type="button" onClick={back}>
          <ArrowLeft size={16} /> Back
        </button>
        <span>
          {issues.success
            ? "Ready to publish."
            : draft.consent_to_publish
              ? "Fix the highlighted fields to publish."
              : "Tick the consent box to publish."}
        </span>
        <button
          className="lp-cta"
          type="button"
          disabled={busy || !issues.success}
          onClick={publish}
        >
          {busy ? "Publishing…" : "Publish experience"}
          <span className="lp-cta-icon">
            <ArrowRight size={16} />
          </span>
        </button>
      </footer>
    </>
  );
}

export function ShareAI() {
  const { refresh, toast } = useApp();
  const [step, setStep] = useState(0);
  const [max, setMax] = useState(0);
  const [leaving, setLeaving] = useState<"" | "fwd" | "back">("");
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [text, setText] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [experiences, setExperiences] = useState<FoundExperience[]>([]);
  const [picked, setPicked] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [extra, setExtra] = useState("");
  const [sample, setSample] = useState<File | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [model, setModel] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [done, setDone] = useState<{ id: string; processing: string } | null>(
    null,
  );
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => track("submission_start"), []);

  function go(n: number) {
    if (n === step) return;
    const d = n > step ? "fwd" : "back";
    setDir(d);
    setMax((m) => Math.max(m, n));
    const swap = () => {
      setLeaving("");
      setStep(n);
      top.current?.scrollIntoView({ block: "start" });
    };
    if (reduced()) return swap();
    setLeaving(d);
    setTimeout(swap, 420);
  }
  async function analyze() {
    setBusy(true);
    setFailure("");
    try {
      const data = await callAI<{
        experiences: FoundExperience[];
        model: string;
      }>({
        action: "analyze",
        text: redactContact(text),
      });
      setExperiences(data.experiences);
      setPicked(data.experiences[0]?.key ?? "");
      setModel(data.model);
      setDraft(null);
      track("share_analyze_success");
      go(1);
    } catch (e) {
      setFailure((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function compose() {
    const experience = experiences.find((e) => e.key === picked);
    if (!experience) return;
    setBusy(true);
    setFailure("");
    try {
      const data = await callAI<{ draft: PostDraft; model: string }>({
        action: "compose",
        experience,
        answers: experience.questions.map((q) => ({
          question: q.question,
          answer: answers[`${experience.key}:${q.id}`] ?? "",
        })),
        extra,
        sample: sample?.name ?? "",
      });
      setDraft({
        ...data.draft,
        contributor_display_name: draft?.contributor_display_name ?? "",
        anonymity_preference: draft?.anonymity_preference ?? "Anonymous",
        consent_to_publish: false,
      });
      setModel(data.model);
      track("share_compose_success");
      go(2);
    } catch (e) {
      setFailure((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    if (!draft) return;
    const parsed = submissionSchema.safeParse(tidy(draft));
    if (!parsed.success) return;
    setBusy(true);
    setFailure("");
    try {
      const saved = await submitExperience(parsed.data, requestId);
      if (sample) {
        try {
          await saveSample(saved.id, sample);
        } catch {
          toast(
            "Your post was saved, but the work sample couldn’t be stored in this browser.",
          );
        }
      }
      track("submission_success");
      await refresh();
      setDone({
        ...saved,
        processing: `AI drafted (${model}) · reviewed by you`,
      });
    } catch (e) {
      setFailure((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="sc-page lp">
        <div className="sc-glow" aria-hidden="true" />
        <div className="sc-wrap sh-done">
          <CheckCircle2 size={44} aria-hidden="true" />
          <h1>
            {live
              ? "Thanks for paying it forward."
              : "Your experience is posted."}
          </h1>
          <p>
            {live
              ? "Your post is saved and waiting for moderation. It will appear in the library once the project team publishes it."
              : "It’s saved in this browser and appears in your Explore Experiences library. It hasn’t been shared with a server or other students."}
          </p>
          <div className="sh-done-actions">
            {!live && (
              <ButtonLink to={`/experiences/${done.id}`}>
                See your post
              </ButtonLink>
            )}
            <button
              className="sc-ghost"
              type="button"
              onClick={() => {
                setDone(null);
                setDraft(null);
                setAnswers({});
                setExtra("");
                setSample(null);
                setRequestId(crypto.randomUUID());
                setMax(experiences.length ? 1 : 0);
                setStep(experiences.length ? 1 : 0);
              }}
            >
              <Plus size={16} /> Post another experience
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="sc-page lp" ref={top}>
      <div className="sc-glow" aria-hidden="true" />
      <div className="sc-wrap">
        <div className="sc-top">
          <span className="sc-title">
            <Sparkles size={18} /> Share an experience
          </span>
          <Stepper step={step} max={max} go={go} labels={labels} />
        </div>
        <section
          key={step}
          className={`sc-stage ${dir} ${leaving ? `leave ${leaving}` : ""}`}
          aria-label={`Step ${step + 1} of 3: ${labels[step]}`}
        >
          {step === 0 && (
            <SourceStep
              text={text}
              setText={setText}
              sourceName={sourceName}
              setSourceName={setSourceName}
              busy={busy}
              analyze={analyze}
            />
          )}
          {step === 1 && (
            <QuestionStep
              experiences={experiences}
              picked={picked}
              setPicked={setPicked}
              answers={answers}
              setAnswer={(k, v) => setAnswers((a) => ({ ...a, [k]: v }))}
              extra={extra}
              setExtra={setExtra}
              sample={sample}
              setSample={setSample}
              busy={busy}
              back={() => go(0)}
              compose={compose}
            />
          )}
          {step === 2 && draft && (
            <ReviewStep
              draft={draft}
              update={(k, v) => setDraft((d) => (d ? { ...d, [k]: v } : d))}
              sample={sample}
              busy={busy}
              failure={failure}
              back={() => go(1)}
              publish={publish}
            />
          )}
          {failure && step < 2 && (
            <p className="sh-problem" role="alert">
              {failure}
            </p>
          )}
        </section>
        {step < 2 && (
          <p className="sh-footnote">
            <Check size={14} aria-hidden="true" /> Nothing is published until
            you review the draft and give consent.
          </p>
        )}
      </div>
    </div>
  );
}
