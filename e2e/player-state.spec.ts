import { expect, test, type Page } from "@playwright/test";

const AS100 = {
  id: "as100-01-01",
  stepIds: ["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"]
} as const;

const profile = (extra: Record<string, unknown> = {}) => ({
  xp: 0,
  activity: { active: [], frozen: [] },
  review: [],
  lessons: {},
  badges: [],
  ...extra
});

async function clearStorage(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
}

async function seedResume(
  page: Page,
  lesson: { id: string; stepIds: readonly string[] },
  index: number,
  options: { sessionXp?: number; history?: Array<{ conceptTag: string; correct: boolean; firstTry: boolean }>; profile?: Record<string, unknown> } = {}
): Promise<void> {
  await clearStorage(page);
  await page.evaluate(
    ({ lessonId, stepIds, index, sessionXp, history, storedProfile }) => {
      window.localStorage.setItem(
        `numera:lesson:v1:c1:${lessonId}`,
        JSON.stringify({
          v: 1,
          lessonId,
          stepIds,
          i: index,
          sessionXp,
          history,
          injected: [],
          predictions: [],
          signalCounts: {},
          remediated: [],
          savedAt: "2026-07-28T12:00:00.000Z"
        })
      );
      window.localStorage.setItem("numera:profile:v1:c1", JSON.stringify(storedProfile));
    },
    {
      lessonId: lesson.id,
      stepIds: [...lesson.stepIds],
      index,
      sessionXp: options.sessionXp ?? 0,
      history: options.history ?? [],
      storedProfile: profile(options.profile)
    }
  );
}

function shell(page: Page) {
  return page.locator("[data-player-phase]");
}

test.describe("lesson-player state machine", () => {
  test("Enter advances one legal state, stands down at prediction, and reveals the lab only after commitment", async ({ page }) => {
    await clearStorage(page);
    await page.goto(`/learn/${AS100.id}`);

    await expect(shell(page)).toHaveAttribute("data-step-id", "c1");
    await expect(shell(page)).toHaveAttribute("data-player-phase", "work");

    await page.keyboard.press("Enter");
    await expect(shell(page)).toHaveAttribute("data-step-id", "i1");
    await expect(page.getByText("Make a prediction first")).toBeVisible();
    await expect(page.locator(".trail-clearing-shell")).toHaveCount(0);

    // Pending predictions are a real commitment gate: Enter must not silently skip it.
    await page.keyboard.press("Enter");
    await expect(shell(page)).toHaveAttribute("data-step-id", "i1");
    await expect(page.getByText("Make a prediction first")).toBeVisible();

    await page.getByRole("radio", { name: "14" }).click();
    await expect(page.getByText(/Your prediction:\s*14/)).toBeVisible();
    await expect(page.locator(".trail-clearing-shell")).toBeVisible();
    await expect(page.getByRole("button", { name: "Check" })).toBeVisible();
  });

  test("retry preserves learner work, second miss reveals a contrast, and rapid Enter cannot skip the next concept", async ({ page }) => {
    await seedResume(page, AS100, 2, { sessionXp: 10 });
    await page.goto(`/learn/${AS100.id}`);

    await expect(shell(page)).toHaveAttribute("data-step-id", "k1");
    await expect(page.getByText(/Picked up where you left off — step 3 of 9/)).toBeVisible();

    const answer = page.getByRole("textbox", { name: "8 + 8 = ?" });
    await answer.fill("15");
    await page.getByRole("button", { name: "Check" }).click();

    await expect(shell(page)).toHaveAttribute("data-player-phase", "retry");
    await expect(page.getByText("Almost — keep going")).toBeVisible();
    await expect(page.getByText(/Your work is still on the stage/)).toBeVisible();
    await expect(answer).toHaveValue("15");
    await expect(answer).toBeEnabled();

    await page.getByRole("button", { name: "Try again" }).click();
    await expect(shell(page)).toHaveAttribute("data-player-phase", "work");
    await expect(answer).toHaveValue("15");

    await page.getByRole("button", { name: "Check" }).click();
    await expect(shell(page)).toHaveAttribute("data-player-phase", "revealed");
    await expect(page.getByText("Here's how it works")).toBeVisible();
    await expect(page.getByText("You answered")).toBeVisible();
    await expect(page.getByText("15", { exact: true })).toBeVisible();
    await expect(page.getByText("The answer:")).toBeVisible();
    await expect(page.getByText("16", { exact: true })).toBeVisible();
    await expect(answer).toBeDisabled();

    // The second keypress lands after the first transition. The production latch must absorb it.
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await expect(shell(page)).toHaveAttribute("data-step-id", "c2");
    await expect(shell(page)).toHaveAttribute("data-step-index", "3");
  });

  test("resume restores XP and exact step; Start over clears the durable snapshot", async ({ page }) => {
    await seedResume(page, AS100, 2, { sessionXp: 17 });
    await page.goto(`/learn/${AS100.id}`);

    await expect(shell(page)).toHaveAttribute("data-step-id", "k1");
    await expect(page.getByLabel("17 experience points")).toBeVisible();
    await page.getByRole("button", { name: "Start over" }).click();

    await expect(shell(page)).toHaveAttribute("data-step-id", "c1");
    await expect(page.getByLabel("0 experience points")).toBeVisible();
    await expect(page.getByText(/Picked up where you left off/)).toHaveCount(0);
    expect(
      await page.evaluate(() => window.localStorage.getItem("numera:lesson:v1:c1:as100-01-01"))
    ).toBeNull();

    await page.reload();
    await expect(shell(page)).toHaveAttribute("data-step-id", "c1");
  });

  test("the completion state consolidates the lesson and Enter follows the explicit next route", async ({ page }) => {
    await seedResume(page, AS100, 8, { sessionXp: 42 });
    await page.goto(`/learn/${AS100.id}`);

    await expect(shell(page)).toHaveAttribute("data-step-id", "r1");
    await page.keyboard.press("Enter");
    await expect(shell(page)).toHaveAttribute("data-player-phase", "done");
    await expect(page.getByRole("heading", { name: "Trail complete!" })).toBeVisible();
    await expect(page.getByText("+42 XP earned")).toBeVisible();
    await expect(page.getByRole("link", { name: /Next:/ })).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/learn\/as100-01-02$/);
  });

  test("keyboard focus reaches the primary action with a visible 3px ring", async ({ page }) => {
    await clearStorage(page);
    await page.goto(`/learn/${AS100.id}`);
    // Tabbing during streaming can leave focus on <body>, whose textContent is the raw RSC
    // payload — wait for the rendered footer action before walking the tab order.
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();

    const visited: Array<{ label: string; outline: string; width: string }> = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const active = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return { label: "", outline: "", width: "" };
        const cs = window.getComputedStyle(el);
        return {
          label: el.getAttribute("aria-label") ?? el.textContent?.trim() ?? "",
          outline: cs.outlineStyle,
          width: cs.outlineWidth
        };
      });
      visited.push(active);
      if (active.label.includes("Continue")) break;
    }

    expect(visited[0]?.label).toBe("Exit lesson");
    const primary = visited.find((item) => item.label.includes("Continue"));
    expect(primary, `tab order: ${JSON.stringify(visited)}`).toBeTruthy();
    expect(primary!.outline).not.toBe("none");
    expect(Number.parseFloat(primary!.width)).toBeGreaterThanOrEqual(3);
  });

  test("the in-app reduced-motion preference is applied before paint and leaves the final state visible", async ({ page }) => {
    await clearStorage(page);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.evaluate((storedProfile) => {
      window.localStorage.setItem("numera:profile:v1:c1", JSON.stringify(storedProfile));
    }, profile({ reduceMotion: true }));

    await page.goto(`/learn/${AS100.id}`);
    await expect(page.locator("html")).toHaveAttribute("data-reduce-motion", "true");

    const motion = await page.locator(".trail-step-enter").evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const milliseconds = (value: string) =>
        Math.max(
          ...value.split(",").map((entry) => {
            const v = entry.trim();
            return v.endsWith("ms") ? Number.parseFloat(v) : Number.parseFloat(v) * 1000;
          })
        );
      return {
        animationMs: milliseconds(cs.animationDuration),
        transitionMs: milliseconds(cs.transitionDuration),
        opacity: cs.opacity,
        transform: cs.transform
      };
    });

    expect(motion.animationMs).toBeLessThanOrEqual(0.01);
    expect(motion.transitionMs).toBeLessThanOrEqual(0.01);
    expect(motion.opacity).toBe("1");
    expect(motion.transform).toBe("none");
  });
});
