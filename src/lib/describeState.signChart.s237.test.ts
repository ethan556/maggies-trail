import { describe, expect, it } from "vitest";
import { describeWidgetState } from "./describeState";
import { signChartCuts } from "./evaluate";
import type { TWidget } from "./schema";

/**
 * S237. The accessible description for `signChart` must describe the SAME model the widget draws.
 *
 * The widget cuts the number line with `signChartCuts(spec.roots, spec.poles)`
 * (src/components/widgets.tsx). A sign chart for a rational function is cut by its poles just as
 * much as by its roots — a pole of odd order flips the sign exactly like an odd root does. A
 * description built from `spec.roots` alone therefore narrates a different picture than the one on
 * screen, and when a spec has poles but no roots it indexes an empty array.
 *
 * Both specs below are authored content, not fixtures: `rf-01-03` (no roots, one pole) and
 * `rf-01-01`-shaped (one root, one pole).
 */

/** Authored: content/courses/rational-functions/lessons/rf-01-03.json — (4 − x)/(x² − 16). */
const noRootsOnePole = {
  type: "signChart",
  prompt: "Build the sign chart for (4 − x)/(x² − 16), which simplifies to −1/(x + 4).",
  roots: [],
  poles: [{ x: -4, mult: 1 }],
  holes: [4],
  leadingPositive: false,
  successFeedback:
    "Positive left of −4, negative right of it — and nothing happens at the hole. Both are excluded values; only one changes the shape.",
  crossFeedback: "The pole at −4 has odd order, so the sign changes across it. Nothing changes at the hole.",
  bounceFeedback: "A sign that holds across a cut belongs to an even multiplicity, but (x + 4) appears once.",
} as unknown as TWidget;

const oneRootOnePole = {
  type: "signChart",
  prompt: "Build the sign chart.",
  roots: [{ x: 1, mult: 1 }],
  poles: [{ x: -2, mult: 1 }],
  leadingPositive: true,
  successFeedback: "The sign flips at the root and at the pole, because each appears an odd number of times.",
  crossFeedback: "An odd multiplicity flips the sign across that cut.",
  bounceFeedback: "An even multiplicity holds the sign across that cut.",
} as unknown as TWidget;

/** The count the widget actually renders: one more interval than there are cuts. */
const drawnIntervalCount = (spec: TWidget): number => {
  const s = spec as unknown as { roots: Array<{ x: number; mult: number }>; poles?: Array<{ x: number; mult: number }> };
  return signChartCuts(s.roots, s.poles).length + 1;
};

describe("S237 signChart accessible description", () => {
  it("does not throw when the spec has poles but no roots", () => {
    expect(() => describeWidgetState(noRootsOnePole, null)).not.toThrow();
  });

  it("never emits `undefined` or `NaN` as a boundary", () => {
    for (const spec of [noRootsOnePole, oneRootOnePole]) {
      const text = describeWidgetState(spec, null) ?? "";
      expect(text).not.toMatch(/undefined|NaN/);
    }
  });

  it("counts the same intervals the widget draws, so poles are cuts", () => {
    for (const spec of [noRootsOnePole, oneRootOnePole]) {
      const text = describeWidgetState(spec, null) ?? "";
      const drawn = drawnIntervalCount(spec);
      // 2 cuts -> "3 intervals". The narrated count must equal the drawn count.
      expect(text).toMatch(new RegExp(`into ${drawn} intervals?\\b`));
    }
  });

  it("names the pole as a boundary of the chart", () => {
    const text = describeWidgetState(noRootsOnePole, null) ?? "";
    expect(text).toMatch(/-4|−4/);
  });

  it("reports the rightmost sign from the leading term, counting poles as sign flips", () => {
    // −1/(x + 4) → 0 from below as x → +∞, so the rightmost interval is negative; the odd pole at
    // −4 flips it, making the left interval positive (at x = −5 the value is +1). Hand-checked.
    const text = describeWidgetState(noRootsOnePole, null) ?? "";
    expect(text).toMatch(/rightmost interval is - because/);
  });
});
