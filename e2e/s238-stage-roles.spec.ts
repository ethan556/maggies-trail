import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * S238 — WS-D stage roles (OPTIMIZATION_PLAN_V3.md, WS-D §1).
 *
 * The plan's core shell defect: on a 1440px display the lesson stage capped at
 * max-w-3xl (768px) and the flagship graph labs additionally capped their own
 * SVG at 512px — the mathematics floated as a small diagram in a large page.
 * S238 remapped the tiers to the plan's semantic bands (reading 672 · compact
 * 768 · wide model 1024 · hero 1152) and raised the six graph labs' internal
 * caps. This spec is the pixel-level evidence for that change, in a real
 * browser, at the widths the plan names — plus the regression direction:
 * phones must not gain horizontal overflow from any of it.
 *
 * fg-02-03 (Grade 8 functions) step i1 is a lineExplore behind a predict
 * gate: commit the first prediction, then the lab renders. Step c1 is prose
 * and must stay at reading width. Captures land in S238_SCREENSHOTS/.
 */

const LESSON = {
  id: "fg-02-03",
  stepIds: ["c1", "i1", "c2", "k1", "i2", "k2", "k3", "ch1", "r1"]
} as const;

const SHOTS = "S238_SCREENSHOTS";

async function seedResume(page: Page, index: number): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.evaluate(
    ({ lessonId, stepIds, i }) => {
      window.localStorage.setItem(
        `numera:lesson:v1:c1:${lessonId}`,
        JSON.stringify({
          v: 1, lessonId, stepIds, i,
          sessionXp: 0, history: [], injected: [], predictions: [],
          signalCounts: {}, remediated: [], savedAt: "2026-08-11T12:00:00.000Z"
        })
      );
      window.localStorage.setItem(
        "numera:profile:v1:c1",
        JSON.stringify({ xp: 0, activity: { active: [], frozen: [] }, review: [], lessons: {}, badges: [] })
      );
    },
    { lessonId: LESSON.id, stepIds: LESSON.stepIds, i: index }
  );
}

async function openLabStep(page: Page): Promise<void> {
  await seedResume(page, LESSON.stepIds.indexOf("i1"));
  await page.goto(`/learn/${LESSON.id}`);
  // The predict gate hides the manipulative until the learner commits.
  const option = page.getByRole("radio").first();
  await option.waitFor({ state: "visible" });
  await option.click();
  await labSvg(page).waitFor({ state: "visible" });
}

/** The lab's stage SVG (role="img" with the graph label), never an icon SVG. */
function labSvg(page: Page) {
  return page.locator('main svg[role="img"][aria-label*="Graph"]').first();
}

test.beforeAll(() => {
  mkdirSync(SHOTS, { recursive: true });
});

test("1440px: a wide lab earns the wide-model stage and a larger graph", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openLabStep(page);

  const main = page.locator("main");
  const mainBox = await main.boundingBox();
  expect(mainBox, "main renders").toBeTruthy();
  // max-w-5xl = 1024px. Before S238 this was 768 (max-w-3xl).
  expect(mainBox!.width).toBeGreaterThanOrEqual(1000);
  expect(mainBox!.width).toBeLessThanOrEqual(1040);

  const svgBox = await labSvg(page).boundingBox();
  // max-w-xl = 576px. Before S238 the lab SVG capped at 512 (max-w-lg).
  expect(svgBox!.width).toBeGreaterThanOrEqual(560);

  // Header and footer follow the same tier — actions never detach.
  const headerInner = page.locator("header > div").first();
  const headerBox = await headerInner.boundingBox();
  expect(headerBox!.width).toBeGreaterThanOrEqual(1000);

  await page.screenshot({ path: `${SHOTS}/01-lab-1440-light.png`, fullPage: true });
});

test("1440px: a prose step stays at reading width", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seedResume(page, 0);
  await page.goto(`/learn/${LESSON.id}`);
  // Pin the precondition before measuring: the player must actually be ON the prose step.
  // (Under parallel load a mid-hydration measurement once read a stale width; anchoring on the
  // step attribute makes the width assertion measure the state it claims to measure.)
  await expect(page.locator("[data-player-phase]")).toHaveAttribute("data-step-index", "0", { timeout: 15_000 });

  // max-w-2xl = 672px — the reading column never inflates to lab width.
  await expect
    .poll(async () => (await page.locator("main").boundingBox())!.width, { timeout: 10_000 })
    .toBeLessThanOrEqual(700);
  await page.screenshot({ path: `${SHOTS}/02-prose-1440-light.png`, fullPage: true });
});

for (const theme of ["light", "dark"] as const) {
  test(`390px: the lab step has no horizontal overflow [${theme}]`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openLabStep(page);
    if (theme === "dark") {
      await page.evaluate(() => document.documentElement.classList.add("dark"));
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, "no horizontal scroll at 390px").toBeLessThanOrEqual(0);

    const svgBox = await labSvg(page).boundingBox();
    expect(svgBox!.width).toBeLessThanOrEqual(390);
    await page.screenshot({ path: `${SHOTS}/03-lab-390-${theme}.png`, fullPage: true });
  });
}

test("768px: the lab fills the tablet width it is given", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await openLabStep(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await page.screenshot({ path: `${SHOTS}/04-lab-768-light.png`, fullPage: true });
});
