import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Interview } from "./domain";
import type { InterviewResearch } from "./interview-research";

const questionTypeLabels: Record<string, string> = {
  intro: "Intro",
  resume_deep_dive: "Resume deep dive",
  behavioral: "Behavioral",
  technical: "Technical",
  sql: "SQL",
  coding: "Coding",
  case: "Case",
  product: "Product",
  stats: "Statistics",
  other: "Other",
};

export function InterviewLog({
  interview,
  research,
}: {
  interview?: Interview;
  research?: InterviewResearch;
}) {
  const rounds = interview?.rounds.filter((r) => r.questions.length) ?? [];
  const showResearch = !rounds.length && !!research;
  return (
    <section
      className="detail-section interview-log"
      aria-labelledby="interview-title"
    >
      <h2 id="interview-title">The interview</h2>
      {showResearch && (
        <div className="interview-context">
          <span className="q-type">From Nowcoder</span>
          <h3>Interview practice for this role</h3>
          <p>
            Selected questions from public interview reports, paraphrased in
            English. Matched to this fictional position for preparation.
          </p>
        </div>
      )}
      {showResearch ? (
        <ResearchQuestions research={research} />
      ) : rounds.length ? (
        <>
          {rounds.map((r, i) => (
            <div className="interview-round" key={i}>
              <h4>{r.label || `Round ${i + 1}`}</h4>
              <ol>
                {r.questions.map((q, n) => (
                  <li key={n}>
                    <span className="q-type">
                      {questionTypeLabels[q.type] ?? "Other"}
                    </span>
                    <p>{q.q}</p>
                    {q.note && <small>{q.note}</small>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
          {!!interview?.asked_back.length && (
            <div className="interview-round">
              <h4>What I asked the interviewer</h4>
              <ul>
                {interview.asked_back.map((q, n) => (
                  <li key={n}>
                    <p>{q}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {interview?.outcome && (
            <div className="interview-round">
              <h4>Outcome</h4>
              <p>{interview.outcome}</p>
            </div>
          )}
        </>
      ) : (
        <div className="interview-empty">
          <p>No interview questions shared yet.</p>
          <Link className="text-link" to="/share">
            Share the questions from your interview <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </section>
  );
}

function ResearchQuestions({ research }: { research: InterviewResearch }) {
  return (
    <>
      <div className="interview-source">
        <div className="interview-source-heading">
          <div>
            <h3>{research.company}</h3>
            <p>{research.role}</p>
          </div>
          <a
            href={research.url}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            Read on Nowcoder <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
        <p>{research.summary}</p>
        <p className="interview-relevance">{research.relevance}</p>
        <small>
          {research.title} · Source updated {research.date} · Reviewed October
          22, 2026
        </small>
      </div>
      {research.sections.map((section, i) => (
        <div className="interview-round" key={i}>
          <h4>{section.label}</h4>
          <ol>
            {section.questions.map((question, n) => (
              <li key={n}>
                <span className="q-type">
                  {questionTypeLabels[question.type]}
                </span>
                <p>{question.q}</p>
                {question.note && <small>{question.note}</small>}
              </li>
            ))}
          </ol>
        </div>
      ))}
      <p className="interview-footnote">
        Candidate reports are not independently verified. The original employer
        and role are shown above; these are not interviews at the sample
        company.
      </p>
    </>
  );
}
