// @vitest-environment jsdom
/**
 * S119 — fractionBar renders an improper fraction PAST one whole.
 *
 * The bug: `seg(count, shaded)` drew exactly `count` parts and shaded the first `shaded`, so any
 * numerator above the denominator simply filled every part. 7/4 was four shaded quarters —
 * pixel-identical to 4/4 — while the aria-label truthfully said "7 of 4 parts shaded". Two shipped
 * lessons author improper targets (fa-04-01 at 7/4, ns-01-03 at 7/3), so both were showing a
 * learner a picture of exactly one whole while asking them to reason about more than one.
 *
 * The contract now: the bar spans ceil(n/d) wholes, each cut into d equal parts, with a dashed
 * whole-boundary rule at each crossing. A part keeps its size and meaning; the surplus sticks out.
 * Proper fractions must be untouched — that is asserted first, because it is the regression risk.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { WidgetSpec, type TWidget } from "./schema";

afterEach(() => cleanup());

const spec = (targetNum: number, targetDen: number, numStart: number, denStart: number) =>
  WidgetSpec.parse({
    type: "fractionBar",
    prompt: "p",
    targetNum,
    targetDen,
    numMin: 1,
    numMax: 12,
    denMin: 1,
    denMax: 12,
    numStart,
    denStart,
    commonFractions: [],
    lowFeedback: "lo",
    highFeedback: "hi",
    successFeedback: "ok"
  }) as TWidget;

function mount(s: TWidget) {
  function Host() {
    const [v, setV] = useState<unknown>(null);
    return <WidgetRenderer spec={s} value={v} disabled={false} onChange={setV} />;
  }
  return render(<Host />).container;
}

/** Count only the learner's bar: the rects inside the first .fb-seg group. */
const learnerParts = (c: HTMLElement) => c.querySelectorAll(".fb-seg")[0].querySelectorAll("rect").length;
const shadedParts = (c: HTMLElement) =>
  [...c.querySelectorAll(".fb-seg")[0].querySelectorAll("rect")].filter(
    (r) => (r.getAttribute("fill") ?? "") !== "#fff"
  ).length;
/** Whole-boundary rules on the LEARNER's bar only — `seg` also draws the target bar. */
const wholeMarks = (c: HTMLElement) =>
  c.querySelectorAll(".fb-seg")[0].querySelectorAll('[data-testid="fb-whole-mark"]').length;

describe("fractionBar — proper fractions are unchanged (the regression risk)", () => {
  it("3/4 draws exactly 4 parts with 3 shaded, and no whole-boundary rule", () => {
    const c = mount(spec(3, 4, 3, 4));
    expect(learnerParts(c)).toBe(4);
    expect(shadedParts(c)).toBe(3);
    expect(wholeMarks(c)).toBe(0);
  });

  it("a full whole (4/4) still draws one whole with no boundary rule", () => {
    const c = mount(spec(4, 4, 4, 4));
    expect(learnerParts(c)).toBe(4);
    expect(shadedParts(c)).toBe(4);
    expect(wholeMarks(c)).toBe(0);
  });
});

describe("fractionBar — improper fractions extend past one whole", () => {
  it("7/4 spans two wholes: 8 parts drawn, 7 shaded, one boundary rule", () => {
    const c = mount(spec(7, 4, 7, 4));
    expect(learnerParts(c)).toBe(8); // ceil(7/4) = 2 wholes x 4 parts
    expect(shadedParts(c)).toBe(7);
    expect(wholeMarks(c)).toBe(1);
  });

  it("7/3 spans three wholes: 9 parts drawn, 7 shaded, two boundary rules", () => {
    const c = mount(spec(7, 3, 7, 3));
    expect(learnerParts(c)).toBe(9); // ceil(7/3) = 3 wholes x 3 parts
    expect(shadedParts(c)).toBe(7);
    expect(wholeMarks(c)).toBe(2);
  });

  it("THE BUG, pinned: 7/4 is no longer pixel-identical to 4/4", () => {
    const improper = mount(spec(7, 4, 7, 4));
    const improperParts = learnerParts(improper);
    const improperShaded = shadedParts(improper);
    cleanup();
    const whole = mount(spec(4, 4, 4, 4));
    // Before the fix both rendered 4 parts with 4 shaded. They must now differ.
    expect([improperParts, improperShaded]).not.toEqual([learnerParts(whole), shadedParts(whole)]);
  });

  it("4/3 — the contrast case for scaling — shows a bar visibly longer than one whole", () => {
    const c = mount(spec(4, 3, 4, 3));
    expect(learnerParts(c)).toBe(6);
    expect(shadedParts(c)).toBe(4);
    // 4 shaded of 3-per-whole means the shading crosses the first boundary.
    expect(shadedParts(c)).toBeGreaterThan(3);
    expect(wholeMarks(c)).toBe(1);
  });
});
