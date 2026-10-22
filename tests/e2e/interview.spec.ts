import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("sample roles show sourced interviews across themes and screen sizes", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (let i = 1; i <= 10; i++) {
    await page.goto(`/experiences/demo-${i}`);
    const section = page.getByRole("region", {
      name: "The interview",
      exact: true,
    });
    await expect(
      section.getByRole("heading", {
        name: "Interview practice for this role",
      }),
    ).toBeVisible();
    await expect(section.locator(".interview-round li")).not.toHaveCount(0);
    await expect(
      section.getByRole("link", { name: "Read on Nowcoder" }),
    ).toHaveAttribute("href", /^https:\/\/www\.nowcoder\.com\//);
    await expect(section).not.toContainText(
      "No interview questions shared yet",
    );
  }
  await page.goto("/experiences/demo-7");
  const section = page.getByRole("region", {
    name: "The interview",
    exact: true,
  });
  await expect(
    section.getByRole("heading", { name: "Meituan", exact: true }),
  ).toBeVisible();
  await section.scrollIntoViewIfNeeded();
  await expect(
    section.getByRole("link", { name: "Read on Nowcoder" }),
  ).toBeVisible();
  const violations = await new AxeBuilder({ page })
    .include(".interview-log")
    .analyze();
  expect(violations.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await section.screenshot({
    path: `test-results/interview-${info.project.name}.png`,
    // Exclude the sticky navigation from the section-only review image.
    style: ".topbar { visibility: hidden; }",
  });
});
