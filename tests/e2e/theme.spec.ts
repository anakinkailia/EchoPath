import { test, expect } from "@playwright/test";

test("theme switch preserves content and type, survives navigation and reload, and fits small screens", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/experiences");
  await expect(page.locator(".experience-card")).toHaveCount(10);
  const initial = await page.locator("html").getAttribute("data-theme");
  const next = initial === "light" ? "dark" : "light";
  const before = await page.locator("main").innerText();
  const font = await page.locator("h1").evaluate((el) => {
    const s = getComputedStyle(el);
    return [s.fontFamily, s.fontSize, s.fontWeight];
  });
  const background = await page
    .locator("body")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  const toggle = page.getByRole("button", { name: `Switch to ${next} theme` });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", next);
  expect(await page.locator("main").innerText()).toBe(before);
  expect(
    await page.locator("h1").evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.fontFamily, s.fontSize, s.fontWeight];
    }),
  ).toEqual(font);
  expect(
    await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).not.toBe(background);
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", next);
  await page.reload();
  await expect(
    page.getByRole("button", { name: `Switch to ${initial} theme` }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", next);
  await page
    .getByRole("button", { name: `Switch to ${initial} theme` })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", initial!);
  for (const width of [320, 390, 414, 768, 820, 1024, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    // The toggle must also fit the floating mobile bar.
    await page.evaluate(() => window.scrollTo(0, 150));
    await expect(page.locator(".topbar")).toHaveClass(/is-floating/);
    const fits = await page.locator(".topbar__inner").evaluate((bar) => {
      const bounds = bar.getBoundingClientRect();
      return [...bar.children]
        .filter(
          (el) =>
            getComputedStyle(el).display !== "none" &&
            getComputedStyle(el).visibility !== "hidden",
        )
        .every((el) => {
          const r = el.getBoundingClientRect();
          return r.left >= bounds.left && r.right <= bounds.right + 1;
        });
    });
    expect(fits, `navigation fits at ${width}px`).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
