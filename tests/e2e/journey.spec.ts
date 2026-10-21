import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("complete demo journey: landing, search, detail, roadmap, contribution, feedback", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Learn from the paths/ }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Explore experiences", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "Find a path that inspires yours." }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search experiences" })
    .fill("northstar");
  await expect(page.locator(".experience-card")).toHaveCount(1);
  await page
    .getByRole("combobox", { name: "Industry", exact: true })
    .selectOption("Technology");
  await expect(page.locator(".experience-card")).toHaveCount(1);
  await page.locator(".experience-card").click();
  await expect(
    page.getByRole("heading", {
      name: "Business Analytics Intern",
      level: 1,
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText("TEMPLATE-EXTRACTED INSIGHTS")).toBeVisible();
  await page.getByText("Preview activation_qa.sql", { exact: true }).click();
  await expect(page.locator(".work-sample pre")).toContainText("ROW_NUMBER");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download activation_qa.sql", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("activation_qa.sql");
  expect(await download.failure()).toBeNull();
  await page
    .getByRole("link", { name: "Build my preparation roadmap" })
    .click();
  // The AI planner is mocked as unavailable so the template fallback is exercised offline.
  await page.route("**/api/plan", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: "AI planning is not configured on the server.",
      }),
    }),
  );
  await expect(
    page.getByRole("heading", { name: /Which skill do you want/ }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /^Tool SQL/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Choose a scenario" }).click();
  await page.getByRole("button", { name: /Technical interview/ }).click();
  await page.getByRole("button", { name: "Create my calendar" }).click();
  await expect(page.getByRole("alert")).toContainText("not configured");
  await page
    .getByRole("button", { name: "Use a template plan instead" })
    .click();
  await expect(
    page.getByText("Template · not AI generated", { exact: true }),
  ).toBeVisible();
  await page.locator(".sc-day input").first().check();
  await page.reload();
  await expect(page.locator(".sc-day input").first()).toBeChecked();
  // The AI drafting endpoint is mocked so the share flow runs offline.
  const found = {
    key: "exp-1",
    role_title: "Data Analytics Intern",
    company: "Brightline Retail",
    industry: "Retail",
    experience_type: "Internship",
    role_category: "Analytics",
    year: 2026,
    duration: "Jun–Aug 2026",
    work_arrangement: "Hybrid",
    summary: "Built a weekly store dashboard in Power BI.",
    highlights: ["Power BI dashboard for 40 managers"],
    questions: [
      { id: "q1", question: "What did a typical week look like?", hint: "" },
      { id: "q2", question: "What was the hardest data problem?", hint: "" },
    ],
  };
  await page.route("**/api/experience", async (route) => {
    const body = route.request().postDataJSON();
    expect(body.text ?? "").not.toContain("jordan@example.com");
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(
        body.action === "analyze"
          ? { experiences: [found], model: "test-model" }
          : {
              model: "test-model",
              draft: {
                ...found,
                responsibilities: "I owned the weekly store dashboard.",
                projects: "A Power BI dashboard used by regional managers.",
                typical_day: "Monday refresh checks, Friday review.",
                tools: "SQL, Power BI",
                challenges: "Duplicate SKUs in inventory snapshots.",
                solutions: "Kept the latest snapshot with ROW_NUMBER.",
                valuable_skills: "SQL, communication",
                lessons_learned: "Ask how often each table refreshes.",
                advice: "Practice joins on messy data.",
              },
            },
      ),
    });
  });
  await page.goto("/share");
  await page.getByRole("button", { name: /fictional demo resume/ }).click();
  await page.getByRole("button", { name: /Analyze with AI/ }).click();
  await expect(
    page.getByRole("heading", { name: "A few questions about this role." }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: /typical week/ })
    .fill("Monday refresh, Friday review.");
  await page.locator(".sh-attach input").setInputFiles({
    name: "dashboard.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("store,revenue\nA,100\n"),
  });
  await expect(page.getByText("dashboard.csv").first()).toBeVisible();
  await page.getByRole("button", { name: "Write my post" }).click();
  await expect(
    page.getByRole("heading", { name: "Make it yours." }),
  ).toBeVisible();
  const publish = page.getByRole("button", { name: "Publish experience" });
  await expect(publish).toBeDisabled();
  await page
    .getByRole("checkbox", { name: /I reviewed this AI draft/ })
    .check();
  await publish.click();
  await expect(
    page.getByRole("heading", { name: "Your experience is posted." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "See your post" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Data Analytics Intern",
      level: 1,
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".sample-attachment pre")).toContainText(
    "store,revenue",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Data Analytics Intern",
      level: 1,
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Give feedback" }).click();
  await page.getByLabel("How useful was EchoPath?").selectOption("5");
  await page.getByLabel("Was the information easy to find?").selectOption("4");
  await page
    .getByLabel("What would you improve?")
    .fill("More operations examples");
  await page.getByRole("button", { name: "Send feedback" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("echopath:feedback") || "[]").length,
    ),
  ).toBe(1);
  expect(errors).toEqual([]);
});
test("all fictional detail routes, empty states, about, and responsive layout", async ({
  page,
}) => {
  await page.goto("/experiences");
  await expect(page.locator(".experience-card")).toHaveCount(10);
  await page
    .getByRole("combobox", { name: "Experience type", exact: true })
    .selectOption("Consulting Project");
  await expect(page.locator(".experience-card")).toHaveCount(2);
  await page
    .getByRole("textbox", { name: "Search experiences" })
    .fill("no-such-record");
  await expect(page.getByText("No paths found just yet.")).toBeVisible();
  await page.getByRole("button", { name: "Reset search & filters" }).click();
  await expect(page.locator(".experience-card")).toHaveCount(10);
  for (let i = 1; i <= 10; i++) {
    await page.goto(`/experiences/demo-${i}`);
    await expect(
      page.getByRole("heading", { name: "What I actually did" }),
    ).toBeVisible();
    await expect(page.locator(".work-sample a[download]")).toHaveCount(1);
    await page.locator(".work-sample summary").click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/about");
  await expect(
    page.getByRole("heading", { name: /Good advice shouldn’t/ }),
  ).toBeVisible();
  for (const route of [
    "/",
    "/experiences",
    "/experiences/demo-1",
    "/share",
    "/roadmap",
    "/about",
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/");
  await page.screenshot({
    path: `test-results/landing-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("landing and library pass automated accessibility checks", async ({
  page,
}) => {
  // Assess final readable colors rather than intermediate scroll-reveal opacity.
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [
    "/",
    "/experiences",
    "/experiences/demo-1",
    "/share",
    "/roadmap",
    "/about",
  ]) {
    await page.goto(route);
    await expect(page.locator(".skeleton")).toHaveCount(0);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(",")).join(";")}`,
      ),
    ).toEqual([]);
  }
});
