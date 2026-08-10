import { expect, test, type Page } from "@playwright/test";

const AS100 = {
  id: "as100-01-01",
  stepIds: ["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"]
} as const;
const FNA = {
  id: "fna-03-02",
  stepIds: ["c1", "i1", "c2", "k1", "k2", "k3", "ch1", "r1"]
} as const;

const baseProfile = {
  xp: 0,
  activity: { active: [], frozen: [] },
  review: [],
  lessons: {},
  badges: []
};

async function seedResume(
  page: Page,
  lesson: { id: string; stepIds: readonly string[] },
  index: number,
  profile: Record<string, unknown> = baseProfile
): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.evaluate(
    ({ lessonId, stepIds, index, profile }) => {
      window.localStorage.setItem(
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
          savedAt: "2026-07-28T12:00:00.000Z"
        })
      );
      window.localStorage.setItem("numera:profile:v1:c1", JSON.stringify(profile));
    },
    { lessonId: lesson.id, stepIds: [...lesson.stepIds], index, profile }
  );
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    innerWidth: window.innerWidth
  }));
  expect(geometry.scrollWidth, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.clientWidth + 1);
  expect(geometry.bodyScrollWidth, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.innerWidth + 1);
}

async function visibleTargetSizes(page: Page) {
  return page.locator(".lesson-trail-shell").evaluate((root) => {
    const candidates = [...root.querySelectorAll<HTMLElement>("button, a[href], input, [role='radio']")];
    return candidates
      .filter((el) => {
        const cs = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return cs.display !== "none" && cs.visibility !== "hidden" && rect.width > 0 && rect.height > 0 && !el.hasAttribute("disabled");
      })
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          label: el.getAttribute("aria-label") ?? el.textContent?.trim().replace(/\s+/g, " ") ?? el.tagName,
          width: rect.width,
          height: rect.height
        };
      });
  });
}

test.describe("lesson-player viewport contract", () => {
  test("prediction and navigation controls remain 44px targets with no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.goto(`/learn/${AS100.id}`);
    // The global Enter listener attaches on hydration, after goto resolves — a single
    // immediate keypress races it (it landed on some viewports and died on others in the
    // first executed run). Retry the press until the listener is live; the contract under
    // test is unchanged: global Enter (never a click) advances to the prediction card.
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
    await expect(async () => {
      await page.keyboard.press("Enter");
      await expect(page.getByText("Make a prediction first")).toBeVisible({ timeout: 750 });
    }).toPass({ timeout: 10_000 });

    await expectNoHorizontalOverflow(page);
    const targets = await visibleTargetSizes(page);
    expect(targets.length).toBeGreaterThan(3);
    for (const target of targets) {
      expect(target.width, `${target.label} width`).toBeGreaterThanOrEqual(43.5);
      expect(target.height, `${target.label} height`).toBeGreaterThanOrEqual(43.5);
    }
  });

  test("retry feedback stays contained, the action remains visible, and the learner input is not occluded", async ({ page }) => {
    await seedResume(page, AS100, 2);
    await page.goto(`/learn/${AS100.id}`);

    const input = page.getByRole("textbox", { name: "8 + 8 = ?" });
    await input.fill("15");
    await page.getByRole("button", { name: "Check" }).click();
    await expect(page.locator("[data-player-phase='retry']")).toBeVisible();

    await input.scrollIntoViewIfNeeded();
    // The retry feedback panel animates its height (motion settle ~200ms). Sampling
    // elementFromPoint mid-transition measures a transient frame, not occlusion — at
    // short-landscape the race lost ~1 run in 3. Wait until the settled layout actually owns the
    // input's center; a PERMANENTLY occluded input never satisfies this and still fails here.
    await page.waitForFunction(() => {
      const el = document.querySelector<HTMLInputElement>("input[aria-label='8 + 8 = ?']");
      if (!el) return false;
      const b = el.getBoundingClientRect();
      const at = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      return at === el || el.contains(at);
    }, undefined, { timeout: 3000 });
    await expectNoHorizontalOverflow(page);
    const geometry = await page.evaluate(() => {
      const input = document.querySelector<HTMLInputElement>("input[aria-label='8 + 8 = ?']")!;
      const footer = document.querySelector<HTMLElement>(".trail-action-dock")!;
      const action = document.querySelector<HTMLElement>(".trail-primary-action")!;
      const feedback = document.querySelector<HTMLElement>("[data-testid='feedback-scroll']")!;
      const inputBox = input.getBoundingClientRect();
      const footerBox = footer.getBoundingClientRect();
      const actionBox = action.getBoundingClientRect();
      const atCenter = document.elementFromPoint(inputBox.left + inputBox.width / 2, inputBox.top + inputBox.height / 2);
      return {
        viewportHeight: window.innerHeight,
        footerTop: footerBox.top,
        footerBottom: footerBox.bottom,
        actionWidth: actionBox.width,
        actionHeight: actionBox.height,
        feedbackHeight: feedback.getBoundingClientRect().height,
        inputCenterOwned: atCenter === input || input.contains(atCenter),
        inputDisabled: input.disabled
      };
    });

    expect(geometry.footerBottom).toBeLessThanOrEqual(geometry.viewportHeight + 1);
    expect(geometry.actionWidth).toBeGreaterThanOrEqual(43.5);
    expect(geometry.actionHeight).toBeGreaterThanOrEqual(43.5);
    expect(geometry.feedbackHeight).toBeLessThanOrEqual(geometry.viewportHeight * 0.42 + 2);
    expect(geometry.inputCenterOwned).toBe(true);
    expect(geometry.inputDisabled).toBe(false);
  });

  test("the dock reveal is minimal and conditional: it moves the page only far enough to clear the dock", async ({ page }) => {
    await seedResume(page, AS100, 2);
    await page.goto(`/learn/${AS100.id}`);

    const input = page.getByRole("textbox", { name: "8 + 8 = ?" });
    const before = await page.evaluate(() => window.scrollY);
    await input.fill("15");
    await page.getByRole("button", { name: "Check" }).click();
    await expect(page.locator("[data-player-phase='retry']")).toBeVisible();
    // No scrollIntoViewIfNeeded here on purpose: the app itself must guarantee the invariant,
    // not the test's scrolling. Allow the smooth nudge to settle.
    await page.waitForTimeout(600);

    const geometry = await page.evaluate(() => {
      const el = document.querySelector<HTMLInputElement>("input[aria-label='8 + 8 = ?']")!;
      const dock = document.querySelector<HTMLElement>(".trail-action-dock")!;
      const box = el.getBoundingClientRect();
      const at = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return {
        scrollY: window.scrollY,
        maxScroll: document.documentElement.scrollHeight - window.innerHeight,
        gapAboveDock: dock.getBoundingClientRect().top - box.bottom,
        centerOwned: at === el || el.contains(at),
        promptVisible: (document.querySelector("main h1, main h2, main p")?.getBoundingClientRect().bottom ?? 0) > -1
      };
    });

    // The learner's own control is never buried, at any of the six viewport classes.
    expect(geometry.centerOwned).toBe(true);
    expect(geometry.gapAboveDock).toBeGreaterThanOrEqual(0);
    if (geometry.scrollY > before + 1) {
      // It scrolled — so it scrolled BECAUSE of an overlap, and stopped as soon as the control
      // cleared: a nudge, not a jump to the bottom of the document.
      expect(geometry.gapAboveDock).toBeLessThanOrEqual(28);
      expect(geometry.scrollY).toBeLessThanOrEqual(geometry.maxScroll);
    } else {
      // A tall viewport has no overlap, so the page must not move at all.
      expect(geometry.scrollY).toBeLessThanOrEqual(before + 1);
    }
  });

  test("long misconception feedback at XL text keeps its action reachable in a short viewport", async ({ page }) => {
    await seedResume(page, FNA, 6, { ...baseProfile, textScale: "xl" });
    await page.goto(`/learn/${FNA.id}`);

    const input = page.getByRole("textbox", { name: "For what x does p(x) = 9? (Enter the only valid solution.)" });
    await input.fill("4");
    await page.getByRole("button", { name: "Check" }).click();
    await expect(page.getByText(/candidate must satisfy the condition/)).toBeVisible();

    const feedback = page.getByTestId("feedback-scroll");
    const action = page.getByRole("button", { name: "Try again" });
    await expect(feedback).toBeVisible();
    await expect(action).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const geometry = await page.evaluate(() => {
      const footer = document.querySelector<HTMLElement>(".trail-action-dock")!.getBoundingClientRect();
      const feedback = document.querySelector<HTMLElement>("[data-testid='feedback-scroll']")!;
      const action = document.querySelector<HTMLElement>(".trail-primary-action")!.getBoundingClientRect();
      return {
        viewportHeight: window.innerHeight,
        footerBottom: footer.bottom,
        feedbackClientHeight: feedback.clientHeight,
        feedbackScrollHeight: feedback.scrollHeight,
        actionTop: action.top,
        actionBottom: action.bottom
      };
    });

    expect(geometry.footerBottom).toBeLessThanOrEqual(geometry.viewportHeight + 1);
    expect(geometry.feedbackClientHeight).toBeLessThanOrEqual(geometry.viewportHeight * 0.42 + 2);
    expect(geometry.actionTop).toBeGreaterThanOrEqual(0);
    expect(geometry.actionBottom).toBeLessThanOrEqual(geometry.viewportHeight + 1);
  });
});
