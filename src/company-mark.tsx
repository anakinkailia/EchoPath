import { useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Cpu,
  Factory,
  FlaskConical,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Hotel,
  Landmark,
  Leaf,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { type Experience } from "./domain";
import "./company-mark.css";

// Confirmed firm identities only; never infer a website from a company name.
const firmLogos: Record<string, string> = {
  google: "/company-logos/google.png",
  "google llc": "/company-logos/google.png",
  microsoft: "/company-logos/microsoft.ico",
  "microsoft corporation": "/company-logos/microsoft.ico",
  amazon: "/company-logos/amazon.ico",
  "amazon com": "/company-logos/amazon.ico",
  "amazon com inc": "/company-logos/amazon.ico",
  uber: "/company-logos/uber.ico",
  "uber technologies": "/company-logos/uber.ico",
  "uber technologies inc": "/company-logos/uber.ico",
};

const industries: { id: string; match: RegExp; Icon: LucideIcon }[] = [
  {
    id: "technology",
    match: /\b(tech|technology|software|saas|it)\b/i,
    Icon: Cpu,
  },
  {
    id: "consulting",
    match: /\b(consulting|advisory|consultancy)\b/i,
    Icon: BriefcaseBusiness,
  },
  {
    id: "healthcare",
    match: /\b(healthcare|health|medical|biotech|pharma)\b/i,
    Icon: HeartPulse,
  },
  { id: "retail", match: /\b(retail|commerce|consumer)\b/i, Icon: Store },
  {
    id: "nonprofit",
    match: /\b(nonprofit|non-profit|charity|community)\b/i,
    Icon: HandHeart,
  },
  {
    id: "logistics",
    match: /\b(logistics|transportation|shipping|supply chain)\b/i,
    Icon: Truck,
  },
  {
    id: "research",
    match: /\b(research|science|laboratory)\b/i,
    Icon: FlaskConical,
  },
  {
    id: "finance",
    match: /\b(finance|financial|banking|investment|insurance)\b/i,
    Icon: Landmark,
  },
  {
    id: "energy",
    match: /\b(energy|sustainability|environment|utilities)\b/i,
    Icon: Leaf,
  },
  {
    id: "manufacturing",
    match: /\b(manufacturing|industrial|automotive)\b/i,
    Icon: Factory,
  },
  {
    id: "education",
    match: /\b(education|university|school)\b/i,
    Icon: GraduationCap,
  },
  {
    id: "hospitality",
    match: /\b(hospitality|hotel|tourism|travel)\b/i,
    Icon: Hotel,
  },
];

export function CompanyMark({
  e,
  large = false,
}: {
  e: Pick<Experience, "company" | "industry" | "provenance">;
  large?: boolean;
}) {
  const [failedSource, setFailedSource] = useState("");
  const firm = e.company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const source =
    e.provenance !== "fictional" && Object.hasOwn(firmLogos, firm)
      ? firmLogos[firm]
      : undefined;
  const showLogo = Boolean(source && source !== failedSource);
  const sector = industries.find(({ match }) => match.test(e.industry));
  const Icon = sector?.Icon ?? Building2;

  return (
    <span
      className={`company-mark${large ? " company-mark--large" : ""}${showLogo ? " company-mark--logo" : ""}`}
      data-industry={sector?.id ?? "other"}
      aria-hidden="true"
    >
      {showLogo ? (
        <img
          src={source}
          alt=""
          width={large ? 44 : 26}
          height={large ? 44 : 26}
          decoding="async"
          onError={() => setFailedSource(source!)}
        />
      ) : (
        <Icon strokeWidth={1.7} />
      )}
    </span>
  );
}
