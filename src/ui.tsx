import React, { createContext, useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, GitBranch } from "lucide-react";
import { type Experience } from "./domain";
type Context = {
  experiences: Experience[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  toast: (message: string) => void;
};
export const AppContext = createContext<Context>(null!);
export const useApp = () => useContext(AppContext);
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="EchoPath home">
      <span className="brand-icon">
        <GitBranch size={23} />
      </span>
      EchoPath<span className="brand-dot">.</span>
    </Link>
  );
}
export function ButtonLink({
  to,
  children,
  secondary = false,
}: {
  to: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={`button ${secondary ? "secondary" : ""}`} to={to}>
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}
export function Tags({ values }: { values: string[] }) {
  return (
    <div className="tags">
      {values.filter(Boolean).map((v, i) => (
        <span key={`${v}-${i}`}>{v}</span>
      ))}
    </div>
  );
}
export function ExperienceCard({
  e,
  compact = false,
}: {
  e: Experience;
  compact?: boolean;
}) {
  return (
    <Link
      to={`/experiences/${e.id}`}
      className={`experience-card ${compact ? "compact" : ""}`}
    >
      <div className="card-top">
        <span className={`company-icon tone-${e.company.length % 4}`}>
          {e.company
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")}
        </span>
        <span className="badge">{e.experience_type}</span>
        <ArrowUpRight size={19} />
      </div>
      <div className="company-name">
        {e.company} <span>· {e.industry}</span>
      </div>
      <h3>{e.role_title}</h3>
      <p>{e.responsibilities}</p>
      <Tags
        values={e.tools
          .split(",")
          .slice(0, 3)
          .map((s) => s.trim())}
      />
      <div className="card-footer">
        <span>
          {e.provenance === "fictional"
            ? "Fictional example"
            : e.provenance === "local"
              ? "Your local submission"
              : "Community submission"}
        </span>
        <span>
          {e.year} <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}
