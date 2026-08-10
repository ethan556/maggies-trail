import { expect, test, type Page } from "@playwright/test";

test.setTimeout(60_000);

const profile = { xp: 0, activity: { active: [], frozen: [] }, review: [], lessons: {}, badges: [] };

async function seedStep(page: Page, lessonId: string, stepIds: string[], index: number) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(({ lessonId, stepIds, index, profile }) => {
    window.localStorage.clear();
    window.localStorage.setItem(`numera:lesson:v1:c1:${lessonId}`, JSON.stringify({
      v: 1, lessonId, stepIds, i: index, sessionXp: 0, history: [], injected: [], predictions: [],
      signalCounts: {}, remediated: [], savedAt: "2026-08-10T12:00:00.000Z"
    }));
    window.localStorage.setItem("numera:profile:v1:c1", JSON.stringify(profile));
  }, { lessonId, stepIds, index, profile });
}

test("authored exponent shorthand is visible as KaTeX, never learner-facing carets", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedStep(page, "ep-01-02", ["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"], 1);
  await page.goto("/learn/ep-01-02", { waitUntil: "domcontentloaded" });
  await page.getByRole("radio", { name: /Multiply/ }).click();
  const prompt = page.getByText(/What is the exponent/).last();
  await expect(prompt).toBeVisible();
  await expect(prompt.locator(".katex")).toHaveCount(2);
  await expect(prompt.locator(".katex-html").filter({ hasText: "^" })).toHaveCount(0);
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
  await page.screenshot({ path: "WAVE04_SCREENSHOTS/exponents-katex-390.png", fullPage: true });
});

test("quotient mode is keyboard-operable and exposes signed mathematical state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedStep(page, "dr-03-02", ["c1", "k1", "i1", "k2", "c2", "k3", "ch1", "r1"], 2);
  await page.goto("/learn/dr-03-02", { waitUntil: "domcontentloaded" });
  await page.getByRole("radio", { name: "3·4 − 6·1" }).click();
  const top = page.getByRole("slider", { name: "quotient numerator derivative rate" });
  const bottom = page.getByRole("slider", { name: "quotient denominator derivative rate" });
  await top.focus();
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await bottom.focus();
  await page.keyboard.press("Home");
  await expect(page.getByText("0.375")).toBeVisible();
  await expect(page.getByRole("img", { name: /Quotient derivative model/ })).toHaveAttribute("aria-label", /ordered difference is 6.+denominator is v squared, 16/);
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
  await page.screenshot({ path: "WAVE04_SCREENSHOTS/quotient-mode-390.png", fullPage: true });
});
