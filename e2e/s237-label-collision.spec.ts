import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * S237b — DO THE LABELS ACTUALLY OVERLAP? MEASURED IN A REAL BROWSER.
 *
 * Two learner reports, both from a phone-width screen:
 *
 *   g3w-01-02/i1 — a 0…60 number line hopped in sevens rendered `78 10`, `221`, `2830`, `4042`,
 *   `490`. Two label layers shared one baseline (the unit ruler and the tappable choices), and two
 *   choice labels one unit apart also overprinted each other.
 *
 *   g3w-01-01/i1 — "4 boxes hold 6 pencils each…" read as TWO unlabelled sliders, because a
 *   decorative track carried a round ringed dot the exact size of a range thumb, directly under a
 *   real range input, and nothing named the quantity either one set.
 *
 * WHY THIS FILE EXISTS ALONGSIDE THE UNIT GATE. `widgets.labelCollision.s237.test.tsx` models
 * label boxes arithmetically because jsdom has no layout — a good approximation, and stated as
 * one. THIS spec asks the browser for the boxes it actually painted, at the width the report came
 * from. That is the evidence class that would have caught the original defect, and the only one
 * that can see a font metric, a wrapped line or a CSS transform.
 *
 * Captures land in S237_SCREENSHOTS/ — never in WAVE04_SCREENSHOTS/, which is a sealed set.
 */

const LESSONS = {
  hop: { id: "g3w-01-02", stepIds: ["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"] },
  slider: { id: "g3w-01-01", stepIds: ["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"] }
} as const;

async function seedResume(page: Page, lessonId: string, stepIds: readonly string[], index: number): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.evaluate(
    ({ lessonId, stepIds, i }) => {
      window.localStorage.setItem(
        `numera:lesson:v1:c1:${lessonId}`,
        JSON.stringify({
          v: 1, lessonId, stepIds, i,
          sessionXp: 0, history: [], injected: [], predictions: [],
          signalCounts: {}, remediated: [], savedAt: "2026-08-12T12:00:00.000Z"
        })
      );
      window.localStorage.setItem(
        "numera:profile:v1:c1",
        JSON.stringify({ xp: 0, activity: { active: [], frozen: [] }, review: [], lessons: {}, badges: [] })
      );
    },
    { lessonId, stepIds: [...stepIds], i: index }
  );
}

/**
 * Both reported steps are PREDICT-first: the player hides the manipulative behind "Make a
 * prediction first", so a spec that navigates straight to the step sees a radiogroup and no
 * widget. Committing any prediction reveals it — the prediction itself is ungraded and costs
 * nothing ("No points on the line for this"), so the first option is chosen deliberately: the
 * widget must render the same way whichever prediction the learner made.
 */
async function commitPredictionIfPending(page: Page): Promise<void> {
  const pending = page.getByText(/Make a prediction first/);
  if ((await pending.count()) === 0) return;
  await page.locator('[role="radiogroup"]').first().getByRole("radio").first().click();
  await expect(pending).toHaveCount(0);
}

type Box = { text: string; x: number; y: number; w: number; h: number };

/** Every painted label in the widget stage, with the box the browser gave it. */
async function labelBoxes(page: Page, selector: string): Promise<Box[]> {
  return page.locator(selector).evaluateAll((els) =>
    els
      .map((e) => {
        const r = e.getBoundingClientRect();
        return { text: (e.textContent ?? "").trim(), x: r.x, y: r.y, w: r.width, h: r.height };
      })
      // A zero-area node paints nothing and cannot collide with anything.
      .filter((b) => b.text !== "" && b.w > 0 && b.h > 0)
  );
}

/** Overlapping pairs, with a 0.5px slack so labels that merely abut are not reported. */
function overlaps(boxes: Box[], slack = 0.5): string[] {
  const out: string[] = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const dx = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const dy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (dx > slack && dy > slack) {
        out.push(
          `"${a.text}" [${a.x.toFixed(1)},${a.y.toFixed(1)} ${a.w.toFixed(1)}×${a.h.toFixed(1)}] ` +
            `overlaps "${b.text}" [${b.x.toFixed(1)},${b.y.toFixed(1)} ${b.w.toFixed(1)}×${b.h.toFixed(1)}] ` +
            `by ${dx.toFixed(1)}×${dy.toFixed(1)}px`
        );
      }
    }
  }
  return out;
}

const WIDTHS = [390, 360] as const;

for (const width of WIDTHS) {
  test(`g3w-01-02/i1 number-line labels do not overlap at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await seedResume(page, LESSONS.hop.id, LESSONS.hop.stepIds, 1);
    await page.goto(`/learn/${LESSONS.hop.id}`);
    await page.waitForLoadState("networkidle");
    await commitPredictionIfPending(page);

    /* PREFIX MATCH, and the reason matters. This spec was written on 2026-08-12 against
     * `aria-label="Number line"`. On 2026-08-15 the graph-defect wave replaced that with a
     * descriptive, STATEFUL label — "Number line from 0 to 60. Start marked at 0. No hop made
     * yet." — which is a real improvement for a screen-reader user and which an exact-match
     * selector cannot survive. Nothing caught the break because the CSP had the whole browser
     * layer dark for three days; this spec was silently unrunnable, not passing.
     *
     * So the selector matches the stem the label is guaranteed to open with, rather than a full
     * string that is designed to change as the learner hops. It is no looser about what it then
     * measures: the same element, the same boxes, the same overlap arithmetic. */
    const line = page.locator('svg[aria-label^="Number line"]');
    await expect(line).toBeVisible();

    const boxes = await labelBoxes(page, 'svg[aria-label^="Number line"] text');
    // eslint-disable-next-line no-console
    console.log(`[${width}] number line: ${boxes.length} labels — ${boxes.map((b) => b.text).join(" ")}`);

    // The line must still be labelled — this is the half of the fix that is easy to lose.
    expect(boxes.length, "the ruler and the choices both label the line").toBeGreaterThanOrEqual(9);
    for (const n of ["0", "7", "8", "14", "56"]) {
      expect(boxes.map((b) => b.text), `position ${n} is named`).toContain(n);
    }
    // Rows: the choice lattice, the staggered trap landing, and the ruler's own baseline.
    const rows = new Set(boxes.map((b) => Math.round(b.y)));
    expect(rows.size, "labels are spread over separate baselines, not stacked on one").toBeGreaterThan(1);

    const hits = overlaps(boxes);
    expect(hits, `overlapping labels:\n  ${hits.join("\n  ")}`).toEqual([]);

    // And the SVG is not clipping the row it grew for.
    const clipped = await line.evaluate((svg) => {
      const box = svg.getBoundingClientRect();
      return Array.from(svg.querySelectorAll("text")).filter((t) => {
        const r = t.getBoundingClientRect();
        return r.height > 0 && (r.bottom > box.bottom + 0.5 || r.top < box.top - 0.5);
      }).map((t) => t.textContent);
    });
    expect(clipped, "a label is painted outside the viewBox").toEqual([]);

    mkdirSync("S237_SCREENSHOTS", { recursive: true });
    await page.screenshot({ path: `S237_SCREENSHOTS/g3w-01-02-i1-numberline-${width}.png`, fullPage: false });
  });

  test(`g3w-01-01/i1 estimate slider is one labelled control at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await seedResume(page, LESSONS.slider.id, LESSONS.slider.stepIds, 1);
    await page.goto(`/learn/${LESSONS.slider.id}`);
    await page.waitForLoadState("networkidle");
    await commitPredictionIfPending(page);

    const sliders = page.getByRole("slider");
    await expect(sliders).toHaveCount(1);
    const slider = sliders.first();

    // NAMED, and named by something a sighted learner can read. The reported defect was a control
    // whose accessible name was the whole word problem and whose visible name did not exist.
    const name = await slider.evaluate((el) => {
      const id = el.getAttribute("id");
      const label = (id ? document.querySelector(`label[for="${id}"]`) : null) ?? el.closest("label");
      return { aria: el.getAttribute("aria-label"), label: label?.textContent?.trim() ?? null };
    });
    // eslint-disable-next-line no-console
    console.log(`[${width}] slider name: aria=${name.aria} label=${name.label}`);
    expect(name.label, "a visible <label> names the slider").toBeTruthy();
    expect(name.label!, "…and it names the quantity the content states").toContain("pencils");
    expect(name.label!.length, "…without restating the prompt").toBeLessThan(60);
    await expect(page.getByText(name.label!, { exact: true })).toBeVisible();

    // ONE INSTRUMENT. Nothing else in the stage may paint a range thumb: a small round disc with a
    // ring. Measured from computed style, not from class names.
    const thumbLike = await page.locator(".lesson-stage *").evaluateAll((els) =>
      els
        .filter((e) => {
          const r = e.getBoundingClientRect();
          const cs = getComputedStyle(e);
          const round = cs.borderRadius.includes("9999") || cs.borderRadius.includes("50%");
          const ringed = cs.boxShadow !== "none" && cs.boxShadow !== "";
          return round && ringed && r.width > 8 && r.width < 26 && Math.abs(r.width - r.height) < 3;
        })
        .map((e) => e.className)
    );
    expect(thumbLike, "something still paints like a second slider thumb").toEqual([]);

    // The scale's landmarks are laid out, visible, and do not collide with each other.
    const ticks = await labelBoxes(page, ".lesson-stage span.absolute");
    // eslint-disable-next-line no-console
    console.log(`[${width}] scale landmarks: ${ticks.map((t) => t.text).join(" ")}`);
    expect(ticks.map((t) => t.text)).toEqual(["4", "122", "240"]);
    const hits = overlaps(ticks);
    expect(hits, `overlapping scale labels:\n  ${hits.join("\n  ")}`).toEqual([]);

    // Landmarks stay inside the card that holds the slider — a centred label at 0%/100% used to
    // hang half of itself outside.
    const card = (await slider.evaluate((el) => {
      const r = (el.closest("label")?.parentElement ?? el.parentElement!).getBoundingClientRect();
      return { left: r.left, right: r.right };
    }))!;
    for (const t of ticks) {
      expect(t.x, `landmark ${t.text} spills off the left of the control`).toBeGreaterThanOrEqual(card.left - 1);
      expect(t.x + t.w, `landmark ${t.text} spills off the right of the control`).toBeLessThanOrEqual(card.right + 1);
    }

    mkdirSync("S237_SCREENSHOTS", { recursive: true });
    await page.screenshot({ path: `S237_SCREENSHOTS/g3w-01-01-i1-estimateslider-${width}.png`, fullPage: false });
  });
}
