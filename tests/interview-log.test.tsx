import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it } from "vitest";
import { InterviewLog } from "../src/interview-log";
import { demoExperiences } from "../src/data";
import { interviewSchema } from "../src/domain";
import {
  interviewResearch,
  researchForExperience,
} from "../src/interview-research";

afterEach(cleanup);

it("covers every fictional position with valid, attributed English questions", () => {
  expect(Object.keys(interviewResearch).sort()).toEqual(
    demoExperiences.map((e) => e.id).sort(),
  );
  for (const experience of demoExperiences) {
    const research = researchForExperience(experience)!;
    expect(new URL(research.url).origin).toBe("https://www.nowcoder.com");
    expect(
      research.sections.flatMap((s) => s.questions).length,
    ).toBeGreaterThanOrEqual(3);
    expect(
      interviewSchema.safeParse({ rounds: research.sections }).success,
    ).toBe(true);
    expect(JSON.stringify(research)).not.toMatch(/[\u3400-\u9fff]/);
    // Curated practice must never become a contributor's testimony.
    expect(experience.interview).toBeUndefined();
  }
});

it("shows the source employer and preparation context for a sample position", () => {
  render(<InterviewLog research={interviewResearch["demo-7"]} />);
  expect(
    screen.getByText("Interview practice for this role"),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Meituan" })).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Read on Nowcoder" }),
  ).toHaveAttribute("href", interviewResearch["demo-7"].url);
  expect(
    screen.getByText(/daily order volume in Shanghai/),
  ).toBeInTheDocument();
  expect(
    screen.queryByText("No interview questions shared yet."),
  ).not.toBeInTheDocument();
});

it("preserves actual contributor questions and outcomes over preparation material", () => {
  render(
    <InterviewLog
      research={interviewResearch["demo-1"]}
      interview={{
        rounds: [
          {
            label: "Hiring manager",
            questions: [
              {
                q: "Explain your dashboard.",
                type: "technical",
                note: "Live exercise",
              },
            ],
          },
        ],
        asked_back: ["How does the team review metrics?"],
        outcome: "Awaiting feedback",
      }}
    />,
  );
  expect(screen.getByText("Explain your dashboard.")).toBeInTheDocument();
  expect(screen.getByText("Live exercise")).toBeInTheDocument();
  expect(
    screen.getByText("How does the team review metrics?"),
  ).toBeInTheDocument();
  expect(screen.getByText("Awaiting feedback")).toBeInTheDocument();
  expect(screen.queryByText("From Nowcoder")).not.toBeInTheDocument();
});

it("keeps the empty state and excludes research from real and local posts", () => {
  for (const provenance of ["local", "published", undefined] as const) {
    expect(researchForExperience({ id: "demo-1", provenance })).toBeUndefined();
  }
  render(
    <MemoryRouter>
      <InterviewLog interview={{ rounds: [], asked_back: [], outcome: "" }} />
    </MemoryRouter>,
  );
  expect(
    screen.getByText("No interview questions shared yet."),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Share the questions/ }),
  ).toHaveAttribute("href", "/share");
});
