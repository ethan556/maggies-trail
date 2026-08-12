// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { collisions, describeCollision, scanTextBoxes, type TextBox } from "./textBoxes.testkit";

/**
 * S237b — NO TWO LABELS MAY OVERLAP. A PROPERTY, NOT TWO INSTANCES.
 *
 * THE DEFECT (reported from the running app, with a screenshot). g3w-01-02/i1 draws a 0…60 number
 * line hopped in sevens. `numberLineHop` printed TWO label layers at the same baseline y = 86 —
 * the unit ruler added by the earlier "the line is unlabelled" fix, and the choice ticks — so the
 * learner read `78 10`, `221`, `2830`, `4042`, `490`. Two of those (`78`) were two CHOICE labels
 * colliding with each other: an authored trap landing at 8 sits one unit from the lattice landing
 * at 7. One fix could not have closed both; see the layout comment in HopLandingW.
 *
 * WHAT IS PINNED, AND WHY THIS SHAPE. Not "the ruler sits at y = 98" — that pins a coordinate a
 * future layout change would have to break to improve anything. The property is the thing a
 * learner actually needs: **no two rendered <text> boxes may overlap**, for ANY spec the engine
 * accepts. Label positions here are computed from authored numbers (min, max, hop, tickStep,
 * maxVal), so a collision exists for SOME inputs and not others — which is exactly why one
 * hand-picked example, or one screenshot, cannot stand in for the rule. Every engine below is
 * driven with several inputs, including the exact case from the report.
 *
 * HOW OVERLAP IS COMPUTED. jsdom does no layout — `getBBox()` is not implemented and every text
 * node reports a zero-size box — so boxes are MODELLED from the attributes the renderer wrote
 * (x, y, font-size, text-anchor) and the string length, at 0.72em per character and 1.26em per
 * line. Those two numbers were MEASURED in Chromium, after the first draft of this gate assumed
 * 0.62em × 1.0em and passed a layout the browser spec then failed by 2.8×1.3px. The model, its
 * conservatism and everything it refuses to place are documented in `textBoxes.testkit.ts`. Two
 * consequences worth stating plainly:
 *   · a green run means "nothing overlaps among the boxes this model can place";
 *   · the constants fit DIGITS with a little room to spare and under-estimate a wide proportional
 *     word, so numeric labels are measured strictly and word labels optimistically.
 * `e2e/s237-label-collision.spec.ts` measures the same two lessons with REAL laid-out boxes in
 * Chromium, which is the evidence class that would have caught this originally.
 *
 * EVERY REJECTION IS PAIRED WITH AN ACCEPTANCE. A gate that only ever says "no" can be satisfied
 * by drawing nothing, so each engine also asserts the labels that must still be THERE — the
 * unit ruler that the earlier fix existed to add, the range a number line states, the ceiling of a
 * bar chart's axis. Suppression that eats the scale is a different defect, not a fix.
 */

afterEach(cleanup);

type Case = { name: string; spec: Record<string, unknown> };

const hop = (extra: Record<string, unknown>): Record<string, unknown> => ({
  type: "numberLineHop", prompt: "p", direction: "forward", commonLandings: [],
  successFeedback: "y", missFeedback: "z", ...extra
});

const trap = (value: number) => ({ value, feedback: "a computed misconception, named in full" });

const HOP_CASES: Case[] = [
  // THE REPORTED CASE, verbatim from content/courses/word-problems-g3/lessons/g3w-01-02.json.
  { name: "g3w-01-02/i1 — 0…60, hops of 7, trap landings 28 and 8",
    spec: hop({ min: 0, max: 60, start: 0, hop: 7, hops: 5, commonLandings: [trap(28), trap(8)] }) },
  { name: "g3w-02-01/i1 — 0…50, hops of 7, trap landings 25 and 30",
    spec: hop({ min: 0, max: 50, start: 0, hop: 7, hops: 5, commonLandings: [trap(25), trap(30)] }) },
  { name: "as100-02-01 shape — a wide line with an off-lattice start",
    spec: hop({ min: 0, max: 100, start: 30, hop: 34, hops: 1 }) },
  { name: "the earlier defect — 0…20, start 9, one hop of 9 (few choices, ruler must show)",
    spec: hop({ min: 0, max: 20, start: 9, hop: 9, hops: 1 }) },
  { name: "count by tens — every choice is a round number",
    spec: hop({ min: 0, max: 100, start: 0, hop: 10, hops: 3 }) },
  { name: "backwards, with the reveal ghost drawn",
    spec: hop({ min: 0, max: 20, start: 17, hop: 3, hops: 2, direction: "back" }) },
  { name: "a rational lattice — sixths",
    spec: hop({ min: 0, max: 8, start: 0, hop: 1, hops: 3, denom: 6 }) },
  { name: "negatives across zero",
    spec: hop({ min: -10, max: 10, start: 0, hop: 3, hops: 2 }) },
  { name: "a thousand-wide line",
    spec: hop({ min: 0, max: 1000, start: 0, hop: 125, hops: 4 }) },
  { name: "adjacent trap landings — three labels inside one label width",
    spec: hop({ min: 0, max: 60, start: 0, hop: 7, hops: 5, commonLandings: [trap(8), trap(9)] }) }
];

const PLACE_CASES: Case[] = [
  // ns-04-01/e1 and ns-05-01/i1: 21 ticks across 280 units, and "−10" is 20 units wide.
  { name: "ns-04-01/e1 — −10…10 ticked every 1",
    spec: { type: "numberLinePlace", prompt: "p", min: -10, max: 10, tickStep: 1, step: 1, start: 0,
      target: -5, successFeedback: "y", lowFeedback: "low", highFeedback: "high" } },
  { name: "0…100 ticked every 5",
    spec: { type: "numberLinePlace", prompt: "p", min: 0, max: 100, tickStep: 5, step: 5, start: 0,
      target: 40, successFeedback: "y", lowFeedback: "low", highFeedback: "high" } },
  { name: "0…1 in sixths — interior ticks stay unlabelled by design",
    spec: { type: "numberLinePlace", prompt: "p", min: 0, max: 6, tickStep: 1, step: 1, start: 0,
      target: 4, fractionDen: 6, successFeedback: "y", lowFeedback: "low", highFeedback: "high" } },
  { name: "a decimal line ticked every 0.1",
    spec: { type: "numberLinePlace", prompt: "p", min: 0, max: 1, tickStep: 0.1, step: 0.1, start: 0,
      target: 0.7, successFeedback: "y", lowFeedback: "low", highFeedback: "high" } }
];

const bars = (extra: Record<string, unknown>): Record<string, unknown> => ({
  type: "barBuilder", prompt: "p", categories: ["A", "B"], target: [3, 2], maxVal: 6, step: 1,
  successFeedback: "y", partialFeedback: "keep building", ...extra
});

const BAR_CASES: Case[] = [
  // g5d-01-01/i1: 46 gridlines into a 162-unit column, in a 9px font.
  { name: "g5d-01-01/i1 — maxVal 45, step 1", spec: bars({ categories: ["0.40", "0.25"], target: [40, 25], maxVal: 45 }) },
  { name: "maxVal 47, step 1 — the axis floor must survive", spec: bars({ target: [40, 25], maxVal: 47 }) },
  { name: "maxVal 8, step 1 — a small chart labels every line", spec: bars({ target: [5, 3], maxVal: 8 }) },
  { name: "maxVal 100, step 5", spec: bars({ target: [60, 35], maxVal: 100, step: 5 }) },
  // dd-02-02: a histogram whose bin names sit between the bars and an axis caption.
  { name: "dd-02-02 — histogram bins under an axis caption",
    spec: bars({ categories: ["0–9", "10–19", "20–29", "30–39"], target: [2, 5, 3, 1], maxVal: 6,
      histogram: true, axisLabel: "minutes read" }) },
  { name: "eight named columns — the names must shrink to fit, not overlap",
    spec: bars({ categories: ["Pack 1", "Pack 2", "Pack 3", "Pack 4", "Pack 5", "Pack 6", "Pack 7", "Pack 8"],
      target: [1, 2, 3, 4, 5, 6, 7, 8], maxVal: 8, axisLabel: "packs" }) }
];

function boxesOf(raw: Record<string, unknown>, tone: "neutral" | "info"): { boxes: TextBox[]; skipped: string[] } {
  const spec = WidgetSpec.parse(raw) as TWidget;
  const { container } = render(
    <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone={tone} />
  );
  const svg = container.querySelector("svg");
  expect(svg, "the engine must draw an SVG").toBeTruthy();
  const scan = scanTextBoxes(svg!);
  cleanup();
  return scan;
}

const texts = (boxes: TextBox[]) => boxes.map((b) => b.text);
const numbers = (boxes: TextBox[]) => boxes.map((b) => Number(b.text)).filter((n) => Number.isFinite(n));

function expectNoCollisions(cases: Case[]) {
  for (const c of cases) {
    for (const tone of ["neutral", "info"] as const) {
      const { boxes, skipped } = boxesOf(c.spec, tone);
      // A widget must not go quiet by becoming unmeasurable: these engines write font-size and
      // plain translate()s only, so nothing here may be skipped.
      expect(skipped, `${c.name} [${tone}] — unmodellable labels`).toEqual([]);
      expect(boxes.length, `${c.name} [${tone}] — drew no labels at all`).toBeGreaterThan(1);
      const hits = collisions(boxes);
      expect(
        hits.map(describeCollision),
        `${c.name} [${tone}]\n  ${hits.map(describeCollision).join("\n  ")}`
      ).toEqual([]);
    }
  }
}

describe("S237b label collisions — numberLineHop", () => {
  it("no two labels overlap, for any of ten specs the engine accepts", () => {
    expectNoCollisions(HOP_CASES);
  });

  it("SELF-CHECK: the detector fires on both shapes the report showed", () => {
    // A gate that passes because it measures nothing is worse than no gate. These are the two
    // pre-fix geometries, taken from the reported line (0…60, so 4.8 units per number), each
    // asserted to be CAUGHT and each paired with the near-identical layout that must be ACCEPTED.
    const svgOf = (markup: string) => {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      el.innerHTML = markup;
      return el;
    };
    const at = (label: string, x: number, y: number, fs: number) =>
      `<text x="${x}" y="${y}" text-anchor="middle" font-size="${fs}">${label}</text>`;

    // (1) RULER vs CHOICE — the two layers that shared y = 86. `221` in the screenshot.
    const rulerOnChoice = scanTextBoxes(svgOf(at("20", 112, 86, 9) + at("21", 116.8, 86, 11)));
    expect(rulerOnChoice.boxes).toHaveLength(2);
    expect(collisions(rulerOnChoice.boxes)).toHaveLength(1);
    // ACCEPTED: the same two labels once the ruler has its own baseline below the choices.
    expect(collisions(scanTextBoxes(svgOf(at("20", 112, 116, 9) + at("21", 116.8, 86, 11))).boxes)).toEqual([]);

    // (2) CHOICE vs CHOICE — an authored trap landing one unit from a lattice landing. `78`.
    const choiceOnChoice = scanTextBoxes(svgOf(at("7", 49.6, 86, 11) + at("8", 54.4, 86, 11)));
    expect(collisions(choiceOnChoice.boxes)).toHaveLength(1);
    // ACCEPTED: staggered onto the second choice row.
    expect(collisions(scanTextBoxes(svgOf(at("7", 49.6, 86, 11) + at("8", 54.4, 101, 11))).boxes)).toEqual([]);
    // ACCEPTED: and two labels that merely sit close on one row are NOT reported — 7 and 9 are
    // 9.6 units apart, which clears both boxes. The gate must not flag a legible tight layout.
    expect(collisions(scanTextBoxes(svgOf(at("7", 49.6, 86, 11) + at("9", 59.2, 86, 11))).boxes)).toEqual([]);
  });

  it("still labels the scale when there are few choices — the earlier fix is not regressed", () => {
    // 0…20 with one hop of 9 offers three tappable positions. The ruler is the ONLY thing that
    // makes the hop countable, and it was added because this exact line rendered unlabelled.
    const { boxes } = boxesOf(hop({ min: 0, max: 20, start: 9, hop: 9, hops: 1 }), "neutral");
    const nums = numbers(boxes);
    expect(nums, "the ends of the line").toEqual(expect.arrayContaining([0, 20]));
    expect(nums.filter((n) => n > 9 && n < 18).length, "something between start and landing").toBeGreaterThan(0);
    // Ten or more marks read off the ruler, not three answer slots.
    expect(nums.length).toBeGreaterThanOrEqual(10);
  });

  it("every tappable choice is named, and the reported line reads correctly", () => {
    const { boxes } = boxesOf(HOP_CASES[0].spec, "neutral");
    // The lattice, both authored trap landings, and nothing invented.
    for (const n of [0, 7, 8, 14, 21, 28, 35, 42, 49, 56]) {
      expect(texts(boxes), `choice ${n} must be labelled`).toContain(String(n));
    }
    // CORRECTED, and stricter than the row COUNT this used to assert. It pinned "three distinct
    // baselines" — two choice rows plus a ruler row — which described the layout at the time
    // rather than the property. On this line suppression leaves exactly ONE ruler label (`60`),
    // and one label is not a scale: it rendered alone on a third row under a line already numbered
    // 0..56 and read as a stray number. A row count cannot tell that apart from a healthy layout.
    // What must hold is stated directly instead: labels occupy more than one baseline (the whole
    // point of the fix), no two overlap, and a ruler row appears only when it carries a real scale.
    const rows = new Set(boxes.map((b) => Math.round(b.y1)));
    expect(rows.size, "labels must not share one baseline").toBeGreaterThan(1);
    expect(collisions(boxes), "and none of them may overlap").toEqual([]);
    // The orphan is gone: nothing is drawn below the choice rows on this line.
    expect(texts(boxes)).not.toContain("60");
    const choiceRows = [...rows].sort((a, b) => a - b).slice(0, 2);
    expect(boxes.every((b) => choiceRows.includes(Math.round(b.y1))),
      "every surviving label sits on a choice row").toBe(true);
  });

  it("a ruler row is drawn when it carries a real scale, and suppressed when it carries one label", () => {
    // The paired acceptance for the rule above, so it cannot pass by simply never drawing a ruler.
    const few = boxesOf(hop({ min: 0, max: 20, start: 9, hop: 9, hops: 1 }), "neutral");
    const fewRows = new Set(few.boxes.map((b) => Math.round(b.y1)));
    expect(fewRows.size, "few choices: the ruler keeps its own row").toBeGreaterThan(1);
    expect(numbers(few.boxes).length, "and it is a scale, not an orphan").toBeGreaterThanOrEqual(10);
  });

  it("keeps the ruler's TICK MARKS even where its label is dropped", () => {
    // Suppression removes redundant TEXT only. The 0…60 line ticks every 2 units: 31 scale marks,
    // plus one per choice, plus the axis itself.
    const spec = WidgetSpec.parse(HOP_CASES[0].spec) as TWidget;
    const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />);
    const lines = container.querySelectorAll("svg line").length;
    expect(lines, "axis + 31 unit marks + 10 choice marks").toBeGreaterThanOrEqual(40);
    cleanup();
  });
});

describe("S237b label collisions — numberLinePlace", () => {
  it("no two tick labels overlap, at any tick step", () => {
    expectNoCollisions(PLACE_CASES);
  });

  it("the line still states its own range, and keeps every tick mark", () => {
    const spec = WidgetSpec.parse(PLACE_CASES[0].spec) as TWidget;
    const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />);
    const { boxes } = scanTextBoxes(container.querySelector("svg")!);
    expect(texts(boxes)).toContain("-10");
    expect(texts(boxes)).toContain("10");
    expect(numbers(boxes).length, "a thinned scale, not two lonely ends").toBeGreaterThanOrEqual(7);
    // 21 tick marks + the axis + the marker's stem are all still drawn.
    expect(container.querySelectorAll("svg line").length).toBeGreaterThanOrEqual(22);
    cleanup();
  });
});

describe("S237b label collisions — barBuilder", () => {
  it("no two axis labels overlap, at any maxVal/step", () => {
    expectNoCollisions(BAR_CASES);
  });

  it("the axis still states its floor and its ceiling, and keeps every gridline", () => {
    for (const c of BAR_CASES) {
      const spec = WidgetSpec.parse(c.spec) as TWidget;
      const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />);
      const { boxes } = scanTextBoxes(container.querySelector("svg")!);
      const max = (spec as { maxVal: number }).maxVal;
      expect(texts(boxes), `${c.name}: the axis ceiling`).toContain(String(max));
      expect(texts(boxes), `${c.name}: the axis floor`).toContain("0");
      expect(numbers(boxes).length, `${c.name}: a readable number of labels`).toBeGreaterThanOrEqual(4);
      for (const cat of (spec as { categories: string[] }).categories)
        expect(texts(boxes), `${c.name}: every column keeps its name`).toContain(cat);
      const step = (spec as { step: number }).step;
      // Every gridline survives — only the labels thin out.
      expect(container.querySelectorAll("svg line").length).toBeGreaterThanOrEqual(Math.floor(max / step) + 1);
      cleanup();
    }
  });
});
