import React, { createContext, useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { type Experience } from "./domain";
import { CompanyMark } from "./company-mark";
type Context = {
  experiences: Experience[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  toast: (message: string) => void;
};
export const AppContext = createContext<Context>(null!);
export const useApp = () => useContext(AppContext);
// The EchoPath mark: an origin dot, two echoes rippling out, and the next
// stop on the path. Same drawing as public/favicon.svg.
export function EchoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="5.5" cy="15.5" r="2.4" fill="currentColor" />
      <path
        d="M9.2 11.4a5.4 5.4 0 0 1 0 8.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M12.6 7.8a10 10 0 0 1 0 15.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M14.5 9.2 C16 6.6 17.6 5.2 19.4 4.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="0.1 3"
        opacity="0.8"
      />
      <circle cx="19.6" cy="4.5" r="2" fill="currentColor" />
    </svg>
  );
}
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="EchoPath home">
      <span className="brand-icon">
        <EchoMark />
      </span>
      <span className="brand-word">
        Echo<span className="brand-path">Path</span>
      </span>
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
      <div className="xc-head">
        <CompanyMark e={e} />
        <span className="xc-org">
          <strong>{e.company}</strong>
          <small>{e.industry}</small>
        </span>
        <span className="xc-arrow" aria-hidden="true">
          <ArrowUpRight size={17} />
        </span>
      </div>
      <h3>{e.role_title}</h3>
      <p>{e.responsibilities}</p>
      <Tags
        values={e.tools
          .split(",")
          .slice(0, 3)
          .map((s) => s.trim())}
      />
      <div className="xc-meta">
        <span className="badge">{e.experience_type}</span>
        <span>{e.year}</span>
      </div>
    </Link>
  );
}
