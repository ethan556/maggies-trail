import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * S237 — does the picture-graph tap scale actually work on a phone?
 *
 * mmt-05-01/ch1 draws 12 apples and offers a tap scale of 0..24. It runs to 24 because the step's
 * AUTHORED doubling trap is 24 ("Each picture equals 1, not 2 — don't double the count"), and
 * carrying every authored trap keeps that misconception reachable and diagnosable instead of
 * deleting authored feedback to shorten a row. That was a judgement made against the JSON. This
 * spec is the check against a real browser at a real phone width, because 25 tap targets is the
 * one place that judgement could be wrong in a way no unit test can see.
 *
 * It asserts the things that would make it wrong: horizontal overflow, targets under the 44px
 * touch minimum, or a scale so tall it pushes the answer off-screen. Captures land in
 * S237_SCREENSHOTS/ — never in WAVE04_SCREENSHOTS/, which is a sealed capture set.
 */

const MMT = {
  id: "mmt-05-01",
  stepIds: ["c1", "i1", "k1", "c2", "i2", "c3", "i3", "k2", "k3", "ch1", "r1"]
} as const;

const CH1_INDEX = MMT.stepIds.indexOf("ch1"); // 9

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
    { lessonId: MMT.id, stepIds: MMT.stepIds, i: index }
  );
}

const SIZES = [
  { label: "phone-360", width: 360, height: 800 },
  { label: "phone-390", width: 390, height: 844 },
  { label: "tablet-768", width: 768, height: 1024 }
] as const;

for (const size of SIZES) {
  for (const theme of ["light", "dark"] as const) {
    test(`mmt-05-01/ch1 tap scale at ${size.label} [${theme}]`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await seedResume(page, CH1_INDEX);
      if (theme === "dark") {
        await page.evaluate(() => document.documentElement.classList.add("dark"));
      }
      await page.goto(`/learn/${MMT.id}`);
      await page.waitForLoadState("networkidle");

      // The graph is drawn — this is the defect the conversion existed to end.
      // NOT `[role="img"]` first — the progress indicator ("Step 10 of 11") is also a role=img.
      const row = page.locator('[role="img"][aria-label^="Picture graph"]');
      await expect(row).toBeVisible();
      const icons = await row.locator('[data-testid="gread-icon"]').count();
      expect(icons, "12 apples drawn").toBe(12);

      // ONE ROW. A picture graph that wraps stops teaching "a longer row means a bigger total",
      // which is this lesson's own concept step c3. Asserted as a geometric property — every icon
      // shares one top edge — rather than trusting the CSS.
      const iconTops = await row.locator('[data-testid="gread-icon"]').evaluateAll((els) =>
        els.map((e) => Math.round(e.getBoundingClientRect().top))
      );
      expect(new Set(iconTops).size, `the 12 pictures wrapped onto ${new Set(iconTops).size} lines`).toBe(1);

      // The tap scale: 0..24 inclusive.
      const scale = page.getByRole("group", { name: /how many votes/i });
      await expect(scale).toBeVisible();
      const taps = scale.getByRole("button");
      expect(await taps.count(), "0..24 inclusive").toBe(25);

      // 1. No horizontal overflow at any width.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `horizontal overflow at ${size.width}px`).toBeLessThanOrEqual(1);

      // 2. Every target meets the 44px touch minimum in BOTH dimensions. A scale that fits by
      //    shrinking its buttons is not a scale that works on a phone.
      const boxes = await taps.evaluateAll((els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return { w: r.width, h: r.height, top: Math.round(r.top), bottom: r.bottom };
        })
      );
      for (const [i, b] of boxes.entries()) {
        expect(b.w, `tap ${i} width`).toBeGreaterThanOrEqual(44);
        expect(b.h, `tap ${i} height`).toBeGreaterThanOrEqual(44);
      }

      // 3. How many rows does it wrap into, and does the whole control still fit the viewport?
      const rows = new Set(boxes.map((b) => b.top)).size;
      const scaleBox = (await scale.boundingBox())!;
      // eslint-disable-next-line no-console
      console.log(
        `[${size.label}/${theme}] 25 taps in ${rows} rows; scale block ${Math.round(scaleBox.height)}px tall of ${size.height}px viewport`
      );
      expect(rows, "the scale must wrap, not scroll sideways").toBeGreaterThan(1);
      expect(scaleBox.height, "the tap scale must not fill the whole screen").toBeLessThan(size.height * 0.55);

      mkdirSync("S237_SCREENSHOTS", { recursive: true });
      await page.screenshot({
        path: `S237_SCREENSHOTS/mmt-05-01-ch1-${size.label}-${theme}.png`,
        fullPage: false
      });
    });
  }
}
