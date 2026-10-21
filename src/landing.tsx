import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Sparkles,
} from "lucide-react";
import { ExperienceCard, useApp } from "./ui";
import { split } from "./domain";
import { live } from "./store";
import "./landing.css";

const reducedMotion = () =>
  typeof window === "undefined" ||
  !window.matchMedia ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Adds .in to every [data-reveal] element once it scrolls into view.
function useReveal(root: React.RefObject<HTMLElement | null>, deps: unknown[]) {
  useEffect(() => {
    const items = root.current?.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!items?.length) return;
    if (!("IntersectionObserver" in window) || reducedMotion()) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.18 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !("IntersectionObserver" in window)) {
      setShown(value);
      return;
    }
    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 1400);
        setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return <span ref={ref}>{shown}</span>;
}

// Slowly rising, twinkling motes of light behind the hero copy.
function Particles() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current;
    if (!c || navigator.userAgent.includes("jsdom")) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const still = reducedMotion();
    let w = 0;
    let h = 0;
    let frame = 0;
    const dots = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.00035 + 0.0001,
      phase: Math.random() * Math.PI * 2,
    }));
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        if (!still) {
          d.y -= d.speed;
          if (d.y < -0.02) {
            d.y = 1.02;
            d.x = Math.random();
          }
        }
        // brighter near the spotlight in the top centre
        const focus = 1 - Math.min(1, Math.abs(d.x - 0.5) * 1.6);
        const twinkle = 0.55 + 0.45 * Math.sin(time / 900 + d.phase);
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(206, 186, 255, ${(0.15 + 0.6 * focus) * twinkle})`;
        ctx.shadowColor = "rgba(167, 139, 250, 0.9)";
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      if (!still) frame = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvas} className="lp-particles" aria-hidden="true" />;
}

const tokens: [string, number, number, number, boolean?][] = [
  // label, left %, top %, depth, boxed
  ["SQL", 9, 30, 0.6],
  ["Python", 15, 58, 1.1, true],
  ["A/B", 6, 76, 0.4],
  ["Σ x̄", 24, 20, 0.3],
  ["Tableau", 82, 26, 0.8],
  ["12 wks", 88, 52, 1.2, true],
  ["Δ +18%", 78, 74, 0.5],
  ["Case", 70, 14, 0.35, true],
  ["→", 93, 82, 0.7],
];

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const words = ["Learn", "from", "the", "paths"];
  const glow = ["already", "taken."];
  return (
    <section
      ref={ref}
      className="lp-hero"
      onPointerMove={(e) => {
        if (reducedMotion() || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        ref.current.style.setProperty(
          "--mx",
          String((e.clientX - r.left) / r.width - 0.5),
        );
        ref.current.style.setProperty(
          "--my",
          String((e.clientY - r.top) / r.height - 0.5),
        );
      }}
    >
      <div className="lp-spot" aria-hidden="true" />
      <div className="lp-beam" aria-hidden="true" />
      <div className="lp-grid" aria-hidden="true" />
      <Particles />
      <div className="lp-tokens" aria-hidden="true">
        {tokens.map(([label, x, y, depth, boxed], i) => (
          <span
            key={label}
            className={boxed ? "boxed" : ""}
            style={
              {
                left: `${x}%`,
                top: `${y}%`,
                "--d": depth,
                "--i": i,
              } as React.CSSProperties
            }
          >
            {label}
          </span>
        ))}
      </div>
      <div className="lp-hero-copy">
        <div
          className="lp-pill lp-fade"
          style={{ "--i": 0 } as React.CSSProperties}
        >
          <span className="lp-pill-dot" />
          Built for the USC Marshall MSBA community
          <span className="lp-pill-tag">Beta</span>
        </div>
        <h1>
          <span className="lp-line">
            {words.map((w, i) => (
              <React.Fragment key={w}>
                <span
                  className="lp-word"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {w}
                </span>{" "}
              </React.Fragment>
            ))}
          </span>
          <span className="lp-line">
            {glow.map((w, i) => (
              <React.Fragment key={w}>
                <span
                  className="lp-word lp-glow"
                  style={{ "--i": i + words.length } as React.CSSProperties}
                >
                  {w}
                </span>
                {i < glow.length - 1 ? " " : ""}
              </React.Fragment>
            ))}
          </span>
        </h1>
        <p className="lp-fade" style={{ "--i": 7 } as React.CSSProperties}>
          Real internship and consulting project experiences from students
          who’ve been there — turned into a preparation plan you can follow.
        </p>
        <ul
          className="lp-checks lp-fade"
          style={{ "--i": 8 } as React.CSSProperties}
        >
          {["Real student stories", "Skills & lessons", "Weekly roadmap"].map(
            (t) => (
              <li key={t}>
                <Check size={13} />
                {t}
              </li>
            ),
          )}
        </ul>
        <div
          className="lp-actions lp-fade"
          style={{ "--i": 9 } as React.CSSProperties}
        >
          <Link className="lp-cta" to="/experiences">
            Explore experiences
            <span className="lp-cta-icon">
              <ArrowRight size={16} />
            </span>
          </Link>
          <Link className="lp-ghost" to="/share">
            Share yours
          </Link>
        </div>
      </div>
      <div className="lp-hero-foot" aria-hidden="true">
        <span>Real experiences. Smarter next steps.</span>
        <span>
          Scroll to explore <ArrowDown size={13} />
        </span>
      </div>
    </section>
  );
}

function Helix() {
  return (
    <div className="lp-helix" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <div
          key={i}
          className="lp-strand"
          style={{ "--i": i } as React.CSSProperties}
        >
          <span />
          <i />
          <span />
        </div>
      ))}
    </div>
  );
}

export function Home() {
  const { experiences, loading, error } = useApp();
  const page = useRef<HTMLDivElement>(null);
  useReveal(page, [loading]);
  const industries = new Set(experiences.map((e) => e.industry)).size;
  const skills = new Set(
    experiences.flatMap((e) =>
      split(`${e.tools},${e.valuable_skills}`).map((s) => s.toLowerCase()),
    ),
  ).size;
  const stats: [number, string, string][] = [
    [experiences.length, "", "experiences in the library"],
    [industries, "", "industries represented"],
    [skills, "+", "tools & skills mentioned"],
    [12, " wks", "maximum roadmap length"],
  ];
  return (
    <div className="lp" ref={page}>
      <Hero />

      <section className="lp-stats">
        <div className="lp-container">
          <h2 data-reveal>
            Every path leaves a trail.
            <br />
            <span>Follow the ones that lead somewhere.</span>
          </h2>
          <p className="lp-sub" data-reveal>
            {live
              ? "Counts below come from published community submissions."
              : "Counts below come from this prototype’s fictional demo library."}
          </p>
          <div className="lp-stat-grid">
            {stats.map(([n, suffix, label], i) => (
              <div
                key={label}
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
              >
                <strong>
                  {loading ? "—" : <CountUp value={n} />}
                  <em>{suffix}</em>
                </strong>
                <span>{label}</span>
              </div>
            ))}
            <div className="lp-stat-glow" aria-hidden="true" />
          </div>
        </div>
      </section>

      <div className="lp-marquee" aria-hidden="true">
        <div>
          {[0, 1].map((k) => (
            <span key={k}>
              Internships ✦ Consulting projects ✦ Case interviews ✦ Analytics
              roles ✦ Product data ✦&nbsp;
            </span>
          ))}
        </div>
      </div>

      <section className="lp-stack">
        <div className="lp-container lp-stack-inner">
          <div className="lp-stack-copy" data-reveal>
            <h2>
              Stop guessing what the job is <span>really</span> like.
            </h2>
            <p>
              Go beyond the title. See the tools, the challenges and the honest
              takeaways — then turn them into weekly steps toward your goal.
            </p>
            <div className="lp-actions">
              <Link className="lp-cta" to="/roadmap">
                Build my roadmap
                <span className="lp-cta-icon">
                  <Compass size={16} />
                </span>
              </Link>
            </div>
          </div>
          <div className="lp-stack-words" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} style={{ "--i": i } as React.CSSProperties}>
                Next step
              </span>
            ))}
            <Helix />
          </div>
        </div>
      </section>

      <section className="lp-steps lp-container">
        {(
          [
            [
              BookOpen,
              "01",
              "Explore real experiences",
              "Find roles, industries and projects that match your curiosity.",
            ],
            [
              Sparkles,
              "02",
              "Discover skills & lessons",
              "Understand the tools, challenges and takeaways behind each role.",
            ],
            [
              Compass,
              "03",
              "Build your roadmap",
              "Turn what you learn into practical, weekly preparation steps.",
            ],
          ] as const
        ).map(([Icon, n, title, body], i) => (
          <article
            key={n}
            data-reveal
            style={{ "--i": i } as React.CSSProperties}
          >
            <div className="lp-step-head">
              <Icon size={20} />
              <span>{n}</span>
            </div>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="lp-library lp-container">
        <div className="lp-library-head" data-reveal>
          <div>
            <span className="lp-kicker">The experience library</span>
            <h2>A look inside someone’s next step.</h2>
          </div>
          <Link className="lp-link" to="/experiences">
            View all experiences <ArrowRight size={16} />
          </Link>
        </div>
        {loading || error ? (
          <div className="card-grid" aria-busy={loading}>
            {error ? (
              <p role="alert">{error}</p>
            ) : (
              [1, 2, 3].map((n) => <div key={n} className="skeleton" />)
            )}
          </div>
        ) : (
          <div className="card-grid" data-reveal>
            {experiences.slice(0, 3).map((e) => (
              <ExperienceCard key={e.id} e={e} />
            ))}
          </div>
        )}
        {!live && (
          <p className="sample-note">
            Explore fictional examples created for this prototype. These are not
            verified student or alumni accounts.
          </p>
        )}
      </section>

      <section className="lp-horizon">
        <div className="lp-horizon-copy" data-reveal>
          <span className="lp-kicker">Your experience has a next chapter</span>
          <h2>
            You’ve been there.
            <br />
            Help someone get there.
          </h2>
          <Link className="lp-cta" to="/share">
            Share your experience
            <span className="lp-cta-icon">
              <ArrowRight size={16} />
            </span>
          </Link>
        </div>
        <div className="lp-planet" aria-hidden="true" />
      </section>
    </div>
  );
}
