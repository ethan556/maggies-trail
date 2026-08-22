import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

type Journey = {
  id: string;
  course: string;
  lesson: string;
  stepId: string;
  predictionRequired: boolean;
};

const journeys = (
  JSON.parse(readFileSync("reports/release/V4_CROSS_BAND_JOURNEYS.json", "utf8")) as {
    journeys: Journey[];
  }
).journeys;

// These routes compile large, distinct widget families in development. Serial execution avoids
// turning cold compilation contention into a false journey failure; deployed runs remain fast.
test.describe.configure({ mode: "serial" });
test.setTimeout(90_000);

async function seedJourney(page: Page, journey: Journey) {
  const lesson = JSON.parse(
    readFileSync(
      `content/courses/${journey.course}/lessons/${journey.lesson}.json`,
      "utf8",
    ),
  ) as { steps: Array<{ id: string }> };
  const stepIds = lesson.steps.map(({ id }) => id);
  const index = stepIds.indexOf(journey.stepId);
  expect(index).toBeGreaterThanOrEqual(0);
  await page.addInitScript(
    ({ lessonId, stepIds, index }) => {
      localStorage.setItem(
        `numera:lesson:v1:c1:${lessonId}`,
        JSON.stringify({
          v: 1,
          lessonId,
          stepIds,
          i: index,
          sessionXp: 0,
          history: [],
          injected: [],
          predictions: [],
          signalCounts: {},
          remediated: [],
          savedAt: "2026-08-17T12:00:00.000Z",
        }),
      );
      localStorage.setItem(
        "numera:profile:v1:c1",
        JSON.stringify({
          xp: 0,
          activity: { active: [], frozen: [] },
          review: [],
          lessons: {},
          badges: [],
          reduceMotion: true,
        }),
      );
    },
    { lessonId: journey.lesson, stepIds, index },
  );
}

async function commitPredictionIfPresent(page: Page) {
  const prompt = page.getByText("Make a prediction first").first();
  if (!(await prompt.isVisible().catch(() => false))) return;
  const choice = page.locator('input[type="radio"]').first();
  await expect(choice).toBeVisible();
  await choice.click();
}

for (const journey of journeys) {
  test(`${journey.id} restores and operates its exact authored math stage`, async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("favicon")) {
        consoleErrors.push(message.text());
      }
    });
    await page.setViewportSize({ width: 320, height: 720 });
    await seedJourney(page, journey);

    await page.goto(`/learn/${journey.lesson}`);
    const player = page.locator("[data-player-phase]");
    await expect(player).toHaveAttribute("data-step-id", journey.stepId);
    await expect(page.locator("html")).toHaveAttribute("data-reduce-motion", "true");
    await commitPredictionIfPresent(page);

    const stage = page.locator(".math-stage-shell").first();
    await expect(stage).toBeVisible();
    const control = stage
      .locator('button, input, select, textarea, [role="button"], [tabindex="0"]')
      .first();
    await expect(control).toBeVisible();
    await control.focus();
    await expect(control).toBeFocused();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}
