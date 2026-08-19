import { expect, test, type Page } from "@playwright/test";

const CP = {
  id: "cp-01-01",
  stepIds: ["c1", "i1", "k1", "c2", "i2", "i2b", "k2", "c3", "i3", "ch", "r1"]
} as const;
const AS100 = {
  id: "as100-01-01",
  stepIds: ["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"]
} as const;

async function seedResume(page: Page, lesson: { id: string; stepIds: readonly string[] }, index: number) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.evaluate(({ lessonId, stepIds, index }) => {
    window.localStorage.setItem(`numera:lesson:v1:c1:${lessonId}`, JSON.stringify({
      v: 1, lessonId, stepIds, i: index, sessionXp: 0, history: [], injected: [],
      predictions: [], signalCounts: {}, remediated: [], savedAt: "2026-08-19T00:00:00.000Z"
    }));
    window.localStorage.setItem("numera:profile:v1:c1", JSON.stringify({ xp: 0, activity: { active: [], frozen: [] }, review: [], lessons: {}, badges: [] }));
  }, { lessonId: lesson.id, stepIds: [...lesson.stepIds], index });
}

async function expectStrip(page: Page, expected: { total: number; current: number; completed: number; remaining: number }) {
  const strip = page.locator("[data-progress-strip]");
  await expect(strip).toHaveCount(1);
  await expect(strip).toHaveAttribute("data-progress-total", String(expected.total));
  await expect(strip).toHaveAttribute("data-progress-current", String(expected.current));
  await expect(strip).toHaveAttribute("data-progress-completed", String(expected.completed));
  await expect(strip).toHaveAttribute("data-progress-remaining", String(expected.remaining));
  await expect(strip.locator("[data-progress-state]")).toHaveCount(expected.total);
  await expect(strip.locator('[data-progress-state="current"]')).toHaveCount(1);
}

test.describe("lesson progress strip", () => {
  test("eleven-item and final states agree with the numeric header without clipping", async ({ page }) => {
    await seedResume(page, CP, 4);
    await page.goto(`/learn/${CP.id}`);
    await expect(page.getByText("5/11", { exact: true })).toBeVisible();
    await expectStrip(page, { total: 11, current: 5, completed: 4, remaining: 6 });

    await seedResume(page, CP, 10);
    await page.goto(`/learn/${CP.id}`);
    await expect(page.getByText("11/11", { exact: true })).toBeVisible();
    await expectStrip(page, { total: 11, current: 11, completed: 10, remaining: 0 });
    const width = await page.locator(".trail-player-header").evaluate((header) => ({ client: header.clientWidth, scroll: header.scrollWidth }));
    expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
  });

  test("retry keeps the learner on the one current segment", async ({ page }) => {
    await seedResume(page, AS100, 2);
    await page.goto(`/learn/${AS100.id}`);
    await page.getByRole("textbox", { name: "Your answer" }).fill("15");
    await page.getByRole("button", { name: "Check" }).click();
    await expect(page.locator("[data-player-phase='retry']")).toBeVisible();
    await expectStrip(page, { total: 9, current: 3, completed: 2, remaining: 6 });
  });
});