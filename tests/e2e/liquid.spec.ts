import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("one animated liquid surface becomes the search orbit while scrolling", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const track = page.locator(".liquid-track");
  await expect(track).toHaveAttribute("data-renderer", "webgl");
  await expect(track).toHaveAttribute("data-morph", "0.000");
  const surface = await page.locator(".liquid-canvas").elementHandle();
  const time = () =>
    page.locator(".liquid-canvas").evaluate((canvas: HTMLCanvasElement) => {
      const gl = canvas.getContext("webgl")!;
      const program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram;
      return gl.getUniform(
        program,
        gl.getUniformLocation(program, "uTime")!,
      ) as number;
    });
  const start = await time();
  await expect.poll(time).toBeGreaterThan(start + 0.1);
  await page.locator(".lp-hero").evaluate((el) =>
    el
      .getAnimations({ subtree: true })
      .filter((a) => a.effect?.getTiming().iterations !== Infinity)
      .forEach((a) => a.finish()),
  );
  await page.screenshot({
    path: `test-results/liquid-hero-${info.project.name}.png`,
  });
  await page
    .locator(".lp-search")
    .evaluate((el) =>
      window.scrollTo(
        0,
        el.getBoundingClientRect().top + scrollY - innerHeight * 0.4,
      ),
    );
  await expect
    .poll(async () => Number(await track.getAttribute("data-morph")))
    .toBeGreaterThan(0.2);
  await page.screenshot({
    path: `test-results/liquid-transition-${info.project.name}.png`,
  });
  await page
    .locator(".lp-search")
    .evaluate((el) =>
      window.scrollTo(
        0,
        el.getBoundingClientRect().top + scrollY + innerHeight * 0.5,
      ),
    );
  await expect(track).toHaveAttribute("data-morph", "1.000");
  expect(
    await surface!.evaluate(
      (el) => el === document.querySelector(".liquid-canvas"),
    ),
  ).toBe(true);
  await expect(
    page.getByRole("searchbox", { name: "Search the experience library" }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/liquid-search-${info.project.name}.png`,
  });
  const accessibility = await new AxeBuilder({ page })
    .include(".lp-opening")
    .analyze();
  expect(accessibility.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("searchbox", { name: "Search the experience library" })
    .fill("SQL");
  await page
    .getByRole("search")
    .getByRole("button", { name: "Search", exact: true })
    .click();
  await expect(page).toHaveURL(/\/experiences\?q=SQL/);
  await expect(page.locator(".liquid-canvas")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("reduced motion keeps the form still and search usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const track = page.locator(".liquid-track");
  await expect(track).toHaveAttribute("data-motion", "reduced");
  await expect(track).toHaveAttribute("data-morph", "0.000");
  await expect(track).toHaveAttribute("data-renderer", "webgl");
  const surface = page.locator(".liquid-canvas");
  const frozen = await surface.screenshot();
  await expect
    .poll(async () => (await surface.screenshot()).equals(frozen))
    .toBe(true);
  await page
    .getByRole("searchbox", { name: "Search the experience library" })
    .scrollIntoViewIfNeeded();
  await expect(track).toHaveAttribute("data-morph", "0.000");
  await expect(
    page.getByRole("searchbox", { name: "Search the experience library" }),
  ).toBeVisible();
});

test("an SVG form remains when WebGL is unavailable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl") return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".liquid-fallback")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page
    .getByRole("link", { name: "Explore experiences", exact: true })
    .last()
    .click();
  await expect(page).toHaveURL(/\/experiences$/);
});
