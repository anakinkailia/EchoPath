import { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  Download,
  Filter,
  GitBranch,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { ButtonLink, ExperienceCard, Tags, useApp } from "./ui";
import {
  displayName,
  experienceTypes,
  filterExperiences,
  insightSchema,
  split,
  submissionSchema,
  type Experience,
  type Submission,
} from "./domain";
import { live, submitExperience, track } from "./store";
import { demoExperiences } from "./data";
import {
  experiencePlaybooks,
  publicInsiderAccounts,
} from "./experience-playbooks";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
    </div>
  );
}
function LoadState() {
  const { error, refresh } = useApp();
  return error ? (
    <div role="alert" className="empty">
      <h3>We couldn’t load the library</h3>
      <p>{error}</p>
      <button className="button" onClick={() => void refresh()}>
        Try again
      </button>
    </div>
  ) : (
    <div
      className="card-grid"
      aria-label="Loading experiences"
      aria-busy="true"
    >
      {[1, 2, 3].map((n) => (
        <div key={n} className="skeleton" />
      ))}
    </div>
  );
}
export function Library() {
  const { experiences, loading, error } = useApp();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const filters = Object.fromEntries(
    ["experience_type", "industry", "role_category", "skills", "year"].map(
      (k) => [k, params.get(k) ?? ""],
    ),
  );
  const sort = params.get("sort") ?? "recent";
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  useEffect(() => {
    if (q) {
      const t = setTimeout(() => track("experience_search"), 600);
      return () => clearTimeout(t);
    }
  }, [q]);
  const results = filterExperiences(experiences, q, filters, sort);
  const active = !!q || Object.values(filters).some(Boolean);
  const options = (key: keyof Experience) =>
    [...new Set(experiences.map((e) => String(e[key])))].sort();
  // Feeds the panel height to CSS so the sticky filter panel can sit centred in the viewport.
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const measure = () =>
      el.parentElement?.style.setProperty("--panel-h", `${el.offsetHeight}px`);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="container page library-page">
      <div className="page-heading">
        <Eyebrow>LEARN FROM WHAT CAME BEFORE</Eyebrow>
        <h1>Find a path that inspires yours.</h1>
        <p>
          Go inside the work: daily routines, technical SOPs, sample outputs,
          and the details MSBA students need before day one.
        </p>
      </div>
      <div className="library-layout">
        <div className="filter-rail">
          <aside className="filter-panel" ref={panel}>
            <div className="section-heading">
              <strong>
                <Filter size={17} /> Refine your search
              </strong>
              {active && (
                <button className="text-link" onClick={() => setParams({})}>
                  Reset
                </button>
              )}
            </div>
            {[
              ["experience_type", "Experience type", [...experienceTypes]],
              ["industry", "Industry", options("industry")],
              ["role_category", "Role category", options("role_category")],
              [
                "skills",
                "Skills",
                [
                  ...new Set(
                    experiences.flatMap((e) =>
                      split(e.tools + ";" + e.valuable_skills),
                    ),
                  ),
                ].sort(),
              ],
              ["year", "Year", options("year").reverse()],
            ].map(([key, label, values]) => (
              <label key={String(key)}>
                {String(label)}
                <select
                  value={filters[String(key)]}
                  onChange={(e) => update(String(key), e.target.value)}
                >
                  <option value="">
                    All {String(label).toLowerCase()}
                    {key === "industry" ? " categories" : ""}
                  </option>
                  {(values as string[]).map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            ))}
            <div className="filter-help">
              <Compass size={24} />
              <h4>Make it your next step.</h4>
              <p>
                Found an interesting path? Turn its lessons into your
                preparation plan.
              </p>
              <Link to="/roadmap">
                Build a skill calendar <ArrowRight size={15} />
              </Link>
            </div>
          </aside>
        </div>
        <div className="library-results">
          <div className="search-box">
            <Search size={21} />
            <input
              aria-label="Search experiences"
              placeholder="Search roles, skills, daily tasks, or deliverables…"
              value={q}
              onChange={(e) => update("q", e.target.value)}
            />
            {q && (
              <button aria-label="Clear search" onClick={() => update("q", "")}>
                <X size={18} />
              </button>
            )}
            <kbd>EXPLORE</kbd>
          </div>
          <div className="results-toolbar">
            <p>
              <strong>{results.length}</strong>{" "}
              {results.length === 1 ? "experience" : "experiences"}
              {!live && <span> · Demo library</span>}
            </p>
            <label>
              Sort by{" "}
              <select
                aria-label="Sort experiences"
                value={sort}
                onChange={(e) => update("sort", e.target.value)}
              >
                <option value="recent">Most recent</option>
                <option value="company">Company name</option>
                <option value="role">Role title</option>
              </select>
            </label>
          </div>
          {loading || error ? (
            <LoadState />
          ) : results.length ? (
            <div className="card-grid library-cards">
              {results.map((e) => (
                <ExperienceCard key={e.id} e={e} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <Search size={35} />
              <h2>No paths found just yet.</h2>
              <p>Try another skill or broaden your filters.</p>
              <button
                className="button secondary"
                onClick={() => setParams({})}
              >
                Reset search & filters
              </button>
            </div>
          )}
        </div>
      </div>
      <section
        className="section public-accounts"
        aria-labelledby="public-accounts-title"
      >
        <Eyebrow>FROM REAL TEAMS</Eyebrow>
        <h2 id="public-accounts-title">Public insider accounts</h2>
        <p>
          Published accounts with named sources. Read the originals for context;
          these are external references, not EchoPath student submissions.
        </p>
        <div className="public-accounts-grid">
          {publicInsiderAccounts.map((account) => (
            <article className="public-account" key={account.url}>
              <span className="badge">Public source</span>
              <h3>{account.title}</h3>
              <p className="source-attribution">{account.attribution}</p>
              <p>{account.summary}</p>
              <a
                className="text-link"
                href={account.url}
                target="_blank"
                rel="noreferrer"
              >
                Read the original account <ArrowUpRight size={15} />
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function InsightPanel({ e }: { e: Experience }) {
  const parsed = insightSchema.safeParse(e.insights);
  if (!parsed.success)
    return (
      <div className="insight-panel">
        <Sparkles />
        <h3>Insights are not available yet</h3>
        <p>
          The original contribution is preserved. The project team can retry
          processing securely.
        </p>
      </div>
    );
  const template = e.model_version === "demo-template";
  return (
    <div className="insight-panel">
      <div className="eyebrow">
        <Sparkles size={17} />
        {template ? "TEMPLATE-EXTRACTED INSIGHTS" : "AI-EXTRACTED INSIGHTS"}
      </div>
      <h3>The takeaways, at a glance.</h3>
      <p>
        {template
          ? "Deterministic organization of the written contribution. No AI was used."
          : "AI extraction from this contribution. Check the original account for context."}
      </p>
      {[
        ["Technical skills", parsed.data.technical_skills],
        ["Business skills", parsed.data.business_skills],
        ["Key lessons", parsed.data.key_lessons],
        ["Suggested preparation", parsed.data.preparation_recommendations],
      ].map(([title, items]) => (
        <div key={String(title)}>
          <h4>{String(title)}</h4>
          <ul>
            {(items as string[]).map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
export function Detail() {
  const { id } = useParams();
  const { experiences, loading, error } = useApp();
  const e = experiences.find((e) => e.id === id);
  useEffect(() => {
    if (e) track("experience_detail_view");
  }, [e]);
  if (loading || error)
    return (
      <div className="container page">
        <LoadState />
      </div>
    );
  if (!e)
    return (
      <div className="container empty">
        <h1>Experience not found</h1>
        <p>
          It may not be published yet, or this browser doesn’t have that local
          submission.
        </p>
        <ButtonLink to="/experiences">Return to the library</ButtonLink>
      </div>
    );
  const related = experiences
    .filter((other) => other.id !== e.id)
    .sort((a, b) => relatedScore(b, e) - relatedScore(a, e))
    .slice(0, 3);
  const playbook =
    e.provenance === "fictional" ? experiencePlaybooks[e.id] : undefined;
  return (
    <div className="container page">
      <Link className="back-link" to="/experiences">
        <ArrowLeft size={16} />
        Back to the library
      </Link>
      <div className="detail-heading">
        <div className={`company-icon large tone-${e.company.length % 4}`}>
          {e.company
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <Tags
            values={[
              e.experience_type,
              e.provenance === "fictional"
                ? "Fictional example"
                : e.provenance === "local"
                  ? "Browser-local submission"
                  : "Published community contribution",
            ]}
          />
          <h1>{e.role_title}</h1>
          <p>
            {e.company} <span>· {e.industry}</span>
          </p>
        </div>
      </div>
      <div className="detail-meta">
        <span>
          <Clock3 size={17} />
          {e.year} · {e.duration}
        </span>
        <span>
          <MapPin size={17} />
          {e.work_arrangement || "Arrangement not provided"}
        </span>
        <span>
          <BookOpen size={17} />
          {displayName(e)}
          {e.provenance === "fictional" ? " · fictional persona" : ""}
        </span>
      </div>
      {playbook && (
        <div className="notice experience-context">
          <BookOpen size={19} />
          <p>
            <strong>Illustrative work, transparent sources.</strong> This
            employer, persona, and routine are fictional. Work samples use
            invented data. Technical references explain the methods; they do not
            verify this as a student’s internship account.{" "}
            <a className="text-link" href="#work-sample-title">
              Open the work sample <ArrowRight size={13} />
            </a>
          </p>
        </div>
      )}
      <div className="detail-grid">
        <article>
          {[
            [
              "What I actually did",
              [
                ["Main responsibilities", e.responsibilities],
                ["Projects & daily outputs", e.projects],
                ["A typical day or week · daily SOP", e.typical_day],
              ],
            ],
            [
              "Tools & skills",
              [
                ["Tools and technologies", e.tools],
                ["Skills that mattered", e.valuable_skills],
              ],
            ],
            [
              "Challenges & how I worked through them",
              [
                ["The challenge", e.challenges],
                ["The approach", e.solutions],
              ],
            ],
            ["Lessons learned", [["What I wish I knew", e.lessons_learned]]],
            ["Advice for future students", [["Start here", e.advice]]],
          ].map(([title, sections]) => (
            <section className="detail-section" key={String(title)}>
              <h2>{String(title)}</h2>
              {(sections as string[][]).map(([label, value]) => (
                <div key={label}>
                  <h4>{label}</h4>
                  <p>{value}</p>
                </div>
              ))}
            </section>
          ))}
          {playbook && (
            <section
              className="detail-section work-sample"
              aria-labelledby="work-sample-title"
            >
              <div className="eyebrow">OPEN THE DELIVERABLE</div>
              <h2 id="work-sample-title">{playbook.title}</h2>
              <span className="badge">Original sample · synthetic data</span>
              <p>{playbook.description}</p>
              <div className="sample-check">
                <h4>What a reviewer should check</h4>
                <p>{playbook.reviewCheck}</p>
              </div>
              <details>
                <summary>Preview {playbook.filename}</summary>
                <pre
                  tabIndex={0}
                  aria-label={`${playbook.title} sample content`}
                >
                  <code>{playbook.content}</code>
                </pre>
              </details>
              <a
                className="button secondary"
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(playbook.content)}`}
                download={playbook.filename}
              >
                <Download size={16} /> Download {playbook.filename}
              </a>
              {playbook.references.length > 0 && (
                <div className="workflow-references">
                  <h4>Technical references</h4>
                  <ul>
                    {playbook.references.map((reference) => (
                      <li key={reference.url}>
                        <a
                          href={reference.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {reference.title} <ArrowUpRight size={13} />
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p>
                    Reference links checked October 20, 2026. Adapt syntax and
                    definitions to your team’s environment.
                  </p>
                </div>
              )}
            </section>
          )}
        </article>
        <aside>
          <InsightPanel e={e} />
          <div className="roadmap-cta">
            <Compass size={30} />
            <h3>Turn insight into action.</h3>
            <p>
              Use this experience to inform a plan for your next opportunity.
            </p>
            <ButtonLink to={`/roadmap?source=${e.id}`}>
              Build my preparation roadmap
            </ButtonLink>
          </div>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="section">
          <h2>Keep exploring.</h2>
          <div className="card-grid">
            {related.map((r) => (
              <ExperienceCard key={r.id} e={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
function relatedScore(a: Experience, b: Experience) {
  return (
    Number(a.industry === b.industry) * 3 +
    Number(a.role_category === b.role_category) * 3 +
    split(a.tools).filter((s) => split(b.tools).includes(s)).length
  );
}

type Draft = Omit<Submission, "consent_to_publish"> & {
  consent_to_publish: boolean;
};
const emptyDraft: Draft = {
  experience_type: "Internship",
  role_title: "",
  company: "",
  industry: "",
  role_category: "Analytics",
  year: 2026,
  duration: "",
  work_arrangement: "Hybrid",
  responsibilities: "",
  projects: "",
  typical_day: "",
  tools: "",
  challenges: "",
  solutions: "",
  valuable_skills: "",
  lessons_learned: "",
  advice: "",
  contributor_display_name: "",
  anonymity_preference: "Anonymous",
  consent_to_publish: false,
};
const fieldsByStep = [
  [
    "experience_type",
    "role_title",
    "company",
    "industry",
    "role_category",
    "year",
    "duration",
    "work_arrangement",
  ],
  ["responsibilities", "projects", "typical_day", "tools"],
  ["challenges", "solutions", "valuable_skills", "lessons_learned", "advice"],
  ["anonymity_preference", "contributor_display_name", "consent_to_publish"],
];
const fieldLabels: Record<string, string> = {
  experience_type: "Experience type",
  role_title: "Role title",
  company: "Company or organization",
  industry: "Industry",
  role_category: "Role category",
  year: "Year",
  duration: "Duration",
  work_arrangement: "Work arrangement",
  responsibilities: "What were your main responsibilities?",
  projects: "What projects and daily outputs did you produce?",
  typical_day: "What was your daily or weekly SOP?",
  tools: "What tools and technical methods did you use?",
  challenges: "What was your biggest challenge?",
  solutions: "How did you overcome it?",
  valuable_skills: "What skills were most valuable?",
  lessons_learned: "What do you wish you had known before starting?",
  advice:
    "What advice would you give someone preparing for a similar opportunity?",
};
const fieldPrompts: Record<string, string> = {
  responsibilities:
    "Who used your analysis, what decision did it support, and what did you personally own? Distinguish your work from the team’s work.",
  projects:
    "Name the deliverable (query, notebook, dashboard, report), its grain and metric definition, how often you produced it, and what your reviewer checked. You can paste a short work sample you have permission to share, or recreate it with synthetic data.",
  typical_day:
    "Walk through the day in order: trigger or time → input → exact tool/operation → quality check → output → handoff. Include refresh checks, meetings, blockers, and review cadence.",
  tools:
    "Include methods, not just tool names: e.g. SQL — ROW_NUMBER, LEFT JOIN, cohort windows; pandas — merge validation; Power BI — DAX DISTINCTCOUNT and filter context.",
  challenges:
    "Describe one specific failure or ambiguity: duplicate join keys, late events, leakage, conflicting definitions, or a stakeholder constraint. How did you notice it?",
  solutions:
    "Give the diagnostic steps, exact fix, validation, and remaining limitation. Separate observed results from estimates and hypotheses.",
  valuable_skills:
    "Which technical and business skills did you use repeatedly, and for what task? Say what you needed on day one versus what you learned during the internship.",
  lessons_learned:
    "What did the job description leave out? Share a metric trap, access dependency, review expectation, or handoff detail that would have saved you time.",
  advice:
    "Give a practice task with a specific output and acceptance check. Which SQL operations, Python/R methods, BI calculations, or domain concepts should an MSBA student learn first?",
};
export function Share() {
  const { refresh, toast } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [success, setSuccess] = useState<{
    id: string;
    processing: string;
  } | null>(null);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const lock = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    track("submission_start");
  }, []);
  function update(key: string, value: unknown) {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }
  function validate() {
    const parsed = submissionSchema.safeParse(draft);
    const next: Record<string, string> = {};
    if (!parsed.success)
      parsed.error.issues.forEach((i) => {
        const key = String(i.path[0]);
        if (fieldsByStep[step].includes(key)) next[key] = i.message;
      });
    setErrors(next);
    return !Object.keys(next).length;
  }
  function move(n: number) {
    setStep(n);
    setErrors({});
    setTimeout(() => titleRef.current?.focus(), 0);
  }
  async function submit() {
    if (lock.current) return;
    if (!validate()) return;
    const result = submissionSchema.safeParse(draft);
    if (!result.success) {
      setFailure(
        "Some required fields are missing. Return to the previous steps and review your answers.",
      );
      return;
    }
    lock.current = true;
    setBusy(true);
    setFailure("");
    try {
      const saved = await submitExperience(result.data, requestId);
      track("submission_success");
      setSuccess(saved);
      await refresh();
      toast(
        live
          ? "Submission saved for private moderation."
          : "Experience saved to this browser.",
      );
    } catch (e) {
      setFailure((e as Error).message);
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  if (success)
    return (
      <div className="container page narrow">
        <div className="success-panel">
          <CheckCircle2 size={48} />
          <Eyebrow>YOUR EXPERIENCE CAN MAKE A DIFFERENCE</Eyebrow>
          <h1>
            {live
              ? "Thanks for paying it forward."
              : "Your local demo submission is saved."}
          </h1>
          <p>
            {live
              ? "Your contribution was saved to the database and is awaiting moderation. It will appear in the library after the project team publishes it."
              : "This submission is stored only in this browser. It has not been shared with a server or other students."}
          </p>
          <div className="notice">Processing: {success.processing}</div>
          {!live && (
            <ButtonLink to={`/experiences/${success.id}`}>
              See experience & template insights
            </ButtonLink>
          )}
          {live && (
            <ButtonLink to="/experiences">
              Explore published experiences
            </ButtonLink>
          )}
          <button
            className="text-link"
            onClick={() => {
              setDraft(emptyDraft);
              setSuccess(null);
              setRequestId(crypto.randomUUID());
              move(0);
            }}
          >
            Share another experience <Plus size={16} />
          </button>
        </div>
      </div>
    );
  return (
    <div className="container page">
      <div className="page-heading">
        <Eyebrow>PAY YOUR EXPERIENCE FORWARD</Eyebrow>
        <h1>Your story. Someone’s head start.</h1>
        <p>
          Share your routine, daily outputs, technical methods, and the details
          you wish you’d had before your first day.
        </p>
      </div>
      <div className="share-layout">
        <aside className="share-sidebar">
          <div className="form-steps">
            {[
              "The basics",
              "Your experience",
              "Lessons & advice",
              "Privacy & preview",
            ].map((label, i) => (
              <div
                key={label}
                className={i === step ? "current" : i < step ? "done" : ""}
              >
                <span>{i < step ? <Check size={17} /> : i + 1}</span>
                <div>
                  <small>STEP {i + 1}</small>
                  <strong>{label}</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="notice">
            <ShieldCheck size={23} />
            <strong>Share insight, protect privacy.</strong>
            <p>
              Leave out confidential employer information, private client data,
              trade secrets, and personal information about others.
            </p>
          </div>
          {!live && (
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                const {
                  id: _id,
                  created_at: _at,
                  status: _status,
                  insights: _insights,
                  model_version: _model,
                  provenance: _provenance,
                  ...sample
                } = demoExperiences[0];
                void [_id, _at, _status, _insights, _model, _provenance];
                setDraft({ ...sample, consent_to_publish: false });
                setErrors({});
                toast(
                  "Fictional example filled. Review it and choose consent before submitting.",
                );
              }}
            >
              Fill fictional demo example <Sparkles size={15} />
            </button>
          )}
        </aside>
        <form
          className="form-card"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 3) {
              if (validate()) move(step + 1);
            } else void submit();
          }}
        >
          <div className="form-heading">
            <span>STEP {step + 1} OF 4</span>
            <h2 ref={titleRef} tabIndex={-1}>
              {
                [
                  "Let’s start with the basics.",
                  "What did the work really look like?",
                  "The lessons that stay with you.",
                  "Make it yours. Then pay it forward.",
                ][step]
              }
            </h2>
            <p>
              {
                [
                  "Give future students a little context.",
                  "The practical details make all the difference.",
                  "Your honest perspective is the most useful part.",
                  "Choose how you appear, review your story, and give permission to share.",
                ][step]
              }
            </p>
          </div>
          <div className={step === 0 ? "form-grid" : "form-fields"}>
            {step < 3 ? (
              fieldsByStep[step].map((key) => {
                const options =
                  key === "experience_type"
                    ? [...experienceTypes]
                    : key === "work_arrangement"
                      ? ["Hybrid", "Remote", "On-site"]
                      : key === "role_category"
                        ? [
                            "Analytics",
                            "Consulting",
                            "Data Science",
                            "Product",
                            "Marketing",
                            "Business Intelligence",
                            "Operations",
                            "Other",
                          ]
                        : null;
                return (
                  <label key={key}>
                    {fieldLabels[key]}
                    {key !== "work_arrangement" && (
                      <span className="required"> *</span>
                    )}
                    {options ? (
                      <select
                        value={String(draft[key as keyof Draft])}
                        onChange={(e) => update(key, e.target.value)}
                      >
                        {options.map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    ) : step === 0 ? (
                      <input
                        type={key === "year" ? "number" : "text"}
                        min={key === "year" ? 2000 : undefined}
                        max={key === "year" ? 2100 : undefined}
                        maxLength={key === "duration" ? 80 : 120}
                        value={String(draft[key as keyof Draft])}
                        onChange={(e) =>
                          update(
                            key,
                            key === "year"
                              ? Number(e.target.value)
                              : e.target.value,
                          )
                        }
                        aria-invalid={!!errors[key]}
                        aria-describedby={
                          errors[key] ? `${key}-error` : undefined
                        }
                        placeholder={
                          key === "duration"
                            ? "e.g. 12 weeks"
                            : key === "role_title"
                              ? "e.g. Business Analytics Intern"
                              : undefined
                        }
                      />
                    ) : (
                      <textarea
                        value={String(draft[key as keyof Draft])}
                        maxLength={5000}
                        rows={
                          key === "tools" || key === "valuable_skills" ? 2 : 4
                        }
                        onChange={(e) => update(key, e.target.value)}
                        aria-invalid={!!errors[key]}
                        aria-describedby={
                          errors[key] ? `${key}-error` : undefined
                        }
                        placeholder={fieldPrompts[key]}
                      />
                    )}
                    {errors[key] && (
                      <small className="error" id={`${key}-error`}>
                        {errors[key]}
                      </small>
                    )}
                  </label>
                );
              })
            ) : (
              <>
                <fieldset>
                  <legend>How would you like to appear?</legend>
                  <div className="radio-options">
                    {["Anonymous", "First name only", "Display name"].map(
                      (v) => (
                        <label key={v}>
                          <input
                            type="radio"
                            name="privacy"
                            checked={draft.anonymity_preference === v}
                            onChange={() => update("anonymity_preference", v)}
                          />
                          {v}
                        </label>
                      ),
                    )}
                  </div>
                </fieldset>
                {draft.anonymity_preference !== "Anonymous" && (
                  <label>
                    {draft.anonymity_preference === "First name only"
                      ? "First name"
                      : "Display name"}
                    <input
                      maxLength={80}
                      value={draft.contributor_display_name}
                      onChange={(e) =>
                        update("contributor_display_name", e.target.value)
                      }
                      aria-invalid={!!errors.contributor_display_name}
                    />
                    {errors.contributor_display_name && (
                      <small className="error">
                        {errors.contributor_display_name}
                      </small>
                    )}
                  </label>
                )}
                <div className="submission-preview">
                  <div className="eyebrow">YOUR CONTRIBUTION PREVIEW</div>
                  <h3>{draft.role_title}</h3>
                  <p>
                    {draft.company} · {draft.industry} · {draft.year} ·{" "}
                    {draft.duration}
                  </p>
                  <p className="muted">
                    {draft.experience_type} · {draft.work_arrangement} ·{" "}
                    {draft.role_category}
                  </p>
                  {fieldsByStep[1].concat(fieldsByStep[2]).map((k) => (
                    <div key={k}>
                      <h4>{fieldLabels[k]}</h4>
                      <p>{String(draft[k as keyof Draft])}</p>
                    </div>
                  ))}
                  <p>
                    <strong>Shared by:</strong>{" "}
                    {draft.anonymity_preference === "Anonymous"
                      ? "Anonymous contributor"
                      : draft.anonymity_preference === "First name only"
                        ? draft.contributor_display_name.split(/\s+/)[0]
                        : draft.contributor_display_name}
                  </p>
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={draft.consent_to_publish}
                    onChange={(e) =>
                      update("consent_to_publish", e.target.checked)
                    }
                  />
                  <span>
                    I consent to sharing this content with EchoPath users
                    {!live ? " in this local demo" : ""}. I have removed
                    confidential information and other people’s personal
                    details.
                  </span>
                </label>
                {errors.consent_to_publish && (
                  <small className="error" role="alert">
                    {errors.consent_to_publish}
                  </small>
                )}
                <div className="notice">
                  {live
                    ? "Your submission will be stored privately until reviewed and published by the project team. AI processing, when enabled, sends the experience text to OpenAI."
                    : "Demo mode: the experience and template insights will be saved only in this browser. No real AI processing takes place."}
                </div>
              </>
            )}
          </div>
          {failure && (
            <p role="alert" className="error">
              {failure}
            </p>
          )}
          <div className="form-actions">
            <button
              className="text-link"
              type="button"
              onClick={() => (step ? move(step - 1) : navigate("/experiences"))}
            >
              <ArrowLeft size={17} />
              {step ? "Back" : "Cancel"}
            </button>
            <button className="button" disabled={busy}>
              {busy
                ? "Saving submission…"
                : step === 3
                  ? "Submit experience"
                  : "Continue"}
              <ArrowRight size={17} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function About() {
  return (
    <div className="container page about-page">
      <Eyebrow>THE STORY BEHIND ECHOPATH</Eyebrow>
      <h1>
        Good advice shouldn’t
        <br />
        depend on who you know.
      </h1>
      <p className="lead">
        The most useful career insights often live in a conversation you never
        had. We’re creating a place where those lessons can travel further.
      </p>
      <div className="about-grid">
        <div>
          <h2>From scattered stories to shared knowledge.</h2>
          <p>
            Job descriptions tell you the title. They rarely tell you which
            tools you’ll open on Monday, what will be difficult, or what you’ll
            wish you had practiced.
          </p>
          <p>
            EchoPath helps the USC Marshall MS Business Analytics community
            share practical internship, consulting project, and early-career
            experiences. Contributors preserve the original story. Future
            students can search it, learn from it, and prepare with more
            context.
          </p>
          <h2>AI with a clear purpose.</h2>
          <p>
            When configured, OpenAI organizes contributions into structured
            skills, challenges, lessons, and preparation advice. Roadmaps use
            the selected published experiences as context. References show which
            records informed a task; general preparation suggestions are labeled
            separately. AI output can contain mistakes and should be checked
            against the original account.
          </p>
          <p>
            Without an AI connection, deterministic templates provide an
            explicitly labeled alternative. Demo organizations and experiences
            are fictional. They are not research findings, alumni testimony, or
            verified outcomes.
          </p>
          <h2>Your experience, shared thoughtfully.</h2>
          <p>
            Choose anonymity, a first name, or a display name. Contributions
            require consent and should never include employer secrets, client
            data, or personal details about others. Persistent submissions await
            trusted moderation before publication. The project team can manage
            deletion requests through its database administration process;
            contact the team that shared this prototype.
          </p>
          <p>
            In community mode, submitted experience text may be sent to OpenAI
            if processing is enabled. Feedback is private to the project team.
            Personal roadmaps and task progress stay in your browser.
            Lightweight event counts stay in your browser too, with separate
            demo and live labels, and do not include search text or personal
            identifiers.
          </p>
          <p>
            Browser-local content is accessible to people who use the same
            browser profile. You can remove it through your browser’s site-data
            settings. Export local feedback and event records using the footer’s
            report action.
          </p>
        </div>
        <aside>
          <div className="insight-panel">
            <GitBranch size={36} />
            <h3>
              Real experiences.
              <br />
              Smarter next steps.
            </h3>
            <p>
              Built as a student-developed prototype for the 2026 USC Marshall
              Global MS Business Analytics AI Case Competition.
            </p>
            <p>
              EchoPath is an independent student project and is not an official
              USC service or endorsed university platform.
            </p>
            <ButtonLink to="/share">Add your perspective</ButtonLink>
          </div>
          <div className="notice">
            <ShieldCheck size={25} />
            <h3>Collect less. Explain more.</h3>
            <p>
              No account required. No public feedback feed. No invented user
              statistics. Clear sources and clear limits.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
