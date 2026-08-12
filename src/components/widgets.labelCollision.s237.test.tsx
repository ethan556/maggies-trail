// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
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

/* ------------------------------------------------------------------ *
 * S238 — unitChain: 82 of the 267 S237-measured pairs lived here.
 * ------------------------------------------------------------------ */

const chain = (extra: Record<string, unknown>): Record<string, unknown> => ({
  type: "unitChain", prompt: "p",
  startValue: 1, startUnit: "kg", targetUnit: "g",
  hops: [{ from: "kg", to: "g", factor: 1000, bigger: "from" }],
  fallbackFeedback: "walk the crossings again, one hop at a time — say which unit is bigger first",
  successFeedback: "crossed the whole chain correctly, hop by hop", ...extra
});

/** The ruler labels derive from the LEARNER'S value, so the colliding states are learner
 * states, not just authored specs. Each case names the value that produces it. */
const UC_STATES: Array<{ name: string; spec: Record<string, unknown>; value: unknown }> = [
  // THE REPORTED CASE: mc-01-01 at its start state. value 1 puts "1.333333" on the t=0.88
  // tick, which sat ON the "ruler counts in kg" caption before S238 separated the bands.
  { name: "mc-01-01/k1 start — 1.333333 over the caption", spec: chain({}),
    value: { unitIdx: 0, value: 1, dirs: [] } },
  { name: "correct crossing — 1000 g", spec: chain({}),
    value: { unitIdx: 1, value: 1000, dirs: ["mul"] } },
  { name: "the WRONG crossing — 0.001, every label a long decimal", spec: chain({}),
    value: { unitIdx: 1, value: 0.001, dirs: ["div"] } },
  // mc-01-03/k3 multiplied where a division was asked: 4,000,000 g — the widest labels the
  // authored corpus can reach, wider than the tick spacing itself.
  { name: "mc-01-03/k3 wrong crossing — 4,000,000, labels wider than the tick gap",
    spec: chain({ startValue: 4000, startUnit: "g", targetUnit: "kg",
      hops: [{ from: "g", to: "kg", factor: 1000, bigger: "to" }] }),
    value: { unitIdx: 1, value: 4000000, dirs: ["mul"] } },
  // vm-01-03/k1 two wrong crossings compound: 2 km ÷1000 ÷100 = 0.00002.
  { name: "vm-01-03/k1 double-wrong — 0.00002, ten-character decimals",
    spec: chain({ startValue: 2, startUnit: "km", targetUnit: "cm",
      hops: [{ from: "km", to: "m", factor: 1000, bigger: "from" }, { from: "m", to: "cm", factor: 100, bigger: "from" }] }),
    value: { unitIdx: 2, value: 0.00002, dirs: ["div", "div"] } },
  { name: "vm-01-01/k1 — a decimal start (1.5 m)", spec: chain({ startValue: 1.5, startUnit: "m", targetUnit: "cm",
      hops: [{ from: "m", to: "cm", factor: 100, bigger: "from" }] }),
    value: { unitIdx: 0, value: 1.5, dirs: [] } },
  { name: "long unit words in the caption — gallons", spec: chain({ startValue: 1.5, startUnit: "gallons", targetUnit: "cups",
      hops: [{ from: "gallons", to: "cups", factor: 16, bigger: "from" }] }),
    value: { unitIdx: 0, value: 1.5, dirs: [] } }
];

function ucBoxesOf(raw: Record<string, unknown>, value: unknown, tone: "neutral" | "info"): { boxes: TextBox[]; skipped: string[] } {
  const spec = WidgetSpec.parse(raw) as TWidget;
  const { container } = render(
    <WidgetRenderer spec={spec} value={value} onChange={() => {}} disabled={false} tone={tone} />
  );
  const svg = container.querySelector("svg");
  expect(svg, "unitChain must draw its ruler SVG").toBeTruthy();
  const scan = scanTextBoxes(svg!);
  cleanup();
  return scan;
}

describe("S238 label collisions — unitChain", () => {
  it("no two labels overlap, for any learner-reachable state exercised", () => {
    for (const c of UC_STATES) {
      for (const tone of ["neutral", "info"] as const) {
        const { boxes, skipped } = ucBoxesOf(c.spec, c.value, tone);
        expect(skipped, `${c.name} [${tone}] — unmodellable labels`).toEqual([]);
        expect(boxes.length, `${c.name} [${tone}] — drew no labels at all`).toBeGreaterThan(1);
        const hits = collisions(boxes);
        expect(
          hits.map(describeCollision),
          `${c.name} [${tone}]\n  ${hits.map(describeCollision).join("\n  ")}`
        ).toEqual([]);
      }
    }
  });

  it("the ruler still reads as a ruler — marker value, zero end, and the caption all present", () => {
    // The paired acceptance: suppression may drop redundant intermediate text, never the
    // reading itself. At the benign start state the full five-label scale survives.
    const start = ucBoxesOf(UC_STATES[0].spec, UC_STATES[0].value, "neutral");
    expect(texts(start.boxes)).toContain("0");        // the ruler's zero end
    expect(texts(start.boxes)).toContain("1");        // the marker — the current reading
    expect(texts(start.boxes)).toContain("1.333333"); // t=0.88 kept: nothing overlaps at value 1
    expect(texts(start.boxes).join(" ")).toContain("ruler counts in kg");
    expect(numbers(start.boxes).length, "a scale, not a lone number").toBeGreaterThanOrEqual(4);

    // The extreme state keeps the invariants even while intermediates are dropped.
    const wide = ucBoxesOf(UC_STATES[3].spec, UC_STATES[3].value, "neutral");
    expect(texts(wide.boxes)).toContain("0");
    expect(texts(wide.boxes)).toContain("4000000");   // the marker reading survives
    expect(texts(wide.boxes).join(" ")).toContain("ruler counts in kg");
  });

  it("every tick MARK stays even where its label is dropped — the scale is never eaten", () => {
    const spec = WidgetSpec.parse(UC_STATES[3].spec) as TWidget;
    const { container } = render(
      <WidgetRenderer spec={spec} value={UC_STATES[3].value} onChange={() => {}} disabled={false} />
    );
    // The axis line plus all five tick lines are drawn regardless of which labels survive.
    expect(container.querySelectorAll("svg line").length).toBeGreaterThanOrEqual(6);
    cleanup();
  });
});

describe("S238 unitChain — the whole authored corpus, every reachable crossing state", () => {
  // The hand-picked cases above explain the failure classes; this sweep is the completeness
  // claim behind "82 → 0": every authored unitChain spec, at every state a learner can reach
  // by crossing hops in either direction (≤ 2^3 sequences, hops caps at 3), both tones.
  it("no authored spec can reach a state where two labels overlap", () => {
    const courses = join(process.cwd(), "content", "courses");
    type Hop = { from: string; to: string; factor: number; bigger: "from" | "to" };
    let specs = 0, states = 0;
    for (const course of readdirSync(courses)) {
      const dir = join(courses, course, "lessons");
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        if (!f.endsWith(".json")) continue;
        const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
          id: string;
          steps: Array<{ id: string; widget?: Record<string, unknown> }>;
          remedials?: Array<{ check?: { id: string; widget?: Record<string, unknown> }; concept?: { id: string; widget?: Record<string, unknown> } }>;
        };
        const all = [...lesson.steps, ...(lesson.remedials ?? []).flatMap((r) => [r.check, r.concept]).filter((s): s is NonNullable<typeof s> => Boolean(s))];
        for (const step of all) {
          if (step.widget?.type !== "unitChain") continue;
          specs++;
          const w = step.widget as { startValue: number; hops: Hop[] };
          // Every dir-sequence prefix: at depth d the learner has crossed d hops, each mul or div.
          const reachable: Array<{ unitIdx: number; value: number; dirs: Array<"mul" | "div"> }> = [
            { unitIdx: 0, value: w.startValue, dirs: [] }
          ];
          for (let d = 0; d < w.hops.length; d++) {
            for (const st of [...reachable]) {
              if (st.unitIdx !== d) continue;
              for (const dir of ["mul", "div"] as const) {
                reachable.push({
                  unitIdx: d + 1,
                  value: dir === "mul" ? st.value * w.hops[d].factor : st.value / w.hops[d].factor,
                  dirs: [...st.dirs, dir]
                });
              }
            }
          }
          for (const st of reachable) {
            for (const tone of ["neutral", "info"] as const) {
              states++;
              const { boxes, skipped } = ucBoxesOf(step.widget, st, tone);
              const where = `${lesson.id}/${step.id} value=${st.value} dirs=[${st.dirs}] [${tone}]`;
              expect(skipped, `${where} — unmodellable labels`).toEqual([]);
              const hits = collisions(boxes);
              expect(hits.map(describeCollision), where).toEqual([]);
            }
          }
        }
      }
    }
    // The corpus this sweep claims to cover: the 19 authored unitChain specs, counted from
    // disk (4+4+2 in volume-measurement, 3+3+3 in measure-convert).
    expect(specs).toBe(19);
    expect(states).toBeGreaterThanOrEqual(19 * 3 * 2);
  });
});

/* ------------------------------------------------------------------ *
 * S238 — distributionCompareLab: 48 of the S237-measured pairs.
 *
 * The labels are data-driven three ways: the group tags sit under the MEANS (sp-02-01/i2
 * authors meanA = meanB, so the tags printed on each other); the measure-mode reveal ghost
 * shared the tags' baseline band; and judge-mode's two evidence lines ("gap ≈ …",
 * "overlap ≈ …") centered on the same midpoint in one band and collided whenever both drew.
 * The SVG text depends on spec × tone only (the learner's value moves rects, not text), so
 * spec × {neutral, error, info} with value null IS the reachable label space.
 * ------------------------------------------------------------------ */

const dcl = (extra: Record<string, unknown>): Record<string, unknown> => ({
  type: "distributionCompareLab", prompt: "p", mode: "measure",
  meanA: 20, meanB: 8, variability: 4, answer: 3, tolerance: 0.01,
  measureChoices: [
    { value: 3, feedback: "Three variability-widths separate the means — count them on the tape." },
    { value: 12, feedback: "12 is the raw gap in data units, not in variability-widths." }
  ],
  successFeedback: "Three variability-widths — a separation the overlap cannot explain away.",
  ...extra
});

const DCL_CASES: Case[] = [
  // THE NAMED TRIGGER, verbatim data from sp-02-01/i2: the means coincide, the markers share
  // one x, and the two group tags drew on top of each other.
  { name: "sp-02-01/i2 — meanA = meanB, coinciding markers",
    spec: dcl({ meanA: 12, meanB: 12, variability: 2, answer: 0 }) },
  { name: "sp-02-03/i2 — gap 0.25, tags one marker-width apart",
    spec: dcl({ meanA: 82, meanB: 80, variability: 8, answer: 0.25 }) },
  { name: "sp-02b-03 — named groups, gap 3", spec: dcl({ meanA: 13.2, meanB: 12, variability: 0.4,
    answer: 3, groupALabel: "Service Y", groupBLabel: "Service X" }) },
  { name: "dm-03-01/i2 — gap 15, the widest authored separation",
    spec: dcl({ meanA: 240, meanB: 90, variability: 10, answer: 15 }) },
  { name: "sp-02-02/i1 — judge, gap 0.4 (both evidence lines draw at error/info)",
    spec: dcl({ mode: "judge", meanA: undefined, meanB: undefined, variability: undefined,
      answer: undefined, measureChoices: [], gapUnits: 0.4,
      judgeOptions: [
        { id: "o", label: "Overlap dominates", correct: true, feedback: "Under half a variability-width cannot separate the groups." },
        { id: "d", label: "Clearly different", feedback: "The curves share most of their area at this gap." }
      ] }) },
  { name: "si-03-03/i1 — judge, long group names at gap 1",
    spec: dcl({ mode: "judge", meanA: undefined, meanB: undefined, variability: undefined,
      answer: undefined, measureChoices: [], gapUnits: 1,
      groupALabel: "Candidate A", groupBLabel: "Candidate B",
      judgeOptions: [
        { id: "o", label: "The bands overlap", correct: true, feedback: "A lead smaller than the margin is not a lead — it is a headline." },
        { id: "a", label: "A is ahead", feedback: "The gap sits inside the margin, so the poll cannot say that." }
      ] }) }
];

describe("S238 label collisions — distributionCompareLab", () => {
  it("no two labels overlap, at any authored shape, at every tone that draws text", () => {
    for (const c of DCL_CASES) {
      for (const tone of ["neutral", "error", "info"] as const) {
        const spec = WidgetSpec.parse(c.spec) as TWidget;
        const { container } = render(
          <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone={tone} />
        );
        const svg = container.querySelector("svg");
        expect(svg, `${c.name} [${tone}]`).toBeTruthy();
        const { boxes, skipped } = scanTextBoxes(svg!);
        cleanup();
        expect(skipped, `${c.name} [${tone}] — unmodellable labels`).toEqual([]);
        expect(boxes.length, `${c.name} [${tone}] — drew no labels at all`).toBeGreaterThan(0);
        const hits = collisions(boxes);
        expect(
          hits.map(describeCollision),
          `${c.name} [${tone}]\n  ${hits.map(describeCollision).join("\n  ")}`
        ).toEqual([]);
      }
    }
  });

  it("coinciding means still NAME both groups — merged into one honest tag, not dropped", () => {
    const spec = WidgetSpec.parse(DCL_CASES[0].spec) as TWidget;
    const { container } = render(
      <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone="neutral" />
    );
    const { boxes } = scanTextBoxes(container.querySelector("svg")!);
    const joined = texts(boxes).join(" | ");
    expect(joined).toContain("Group A ○ · Group B ◇");
    cleanup();
    // …and separated means keep two separate tags — merging is geometry, not policy.
    const wide = WidgetSpec.parse(DCL_CASES[3].spec) as TWidget;
    const { container: c2 } = render(
      <WidgetRenderer spec={wide} value={null} onChange={() => {}} disabled={false} tone="neutral" />
    );
    const wideTexts = texts(scanTextBoxes(c2.querySelector("svg")!).boxes);
    expect(wideTexts).toContain("Group A ○");
    expect(wideTexts).toContain("Group B ◇");
    cleanup();
  });

  it("judge evidence still states BOTH deciding quantities at retry and reveal", () => {
    for (const tone of ["error", "info"] as const) {
      const spec = WidgetSpec.parse(DCL_CASES[4].spec) as TWidget;
      const { container } = render(
        <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone={tone} />
      );
      const said = texts(scanTextBoxes(container.querySelector("svg")!).boxes).join(" | ");
      expect(said, tone).toContain("gap ≈");
      expect(said, tone).toContain("overlap ≈");
      cleanup();
    }
  });

  it("the measure reveal still names its target, clear of the group tags", () => {
    const spec = WidgetSpec.parse(DCL_CASES[0].spec) as TWidget;
    const { container } = render(
      <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone="info" />
    );
    const { boxes } = scanTextBoxes(container.querySelector("svg")!);
    expect(texts(boxes).some((t) => t.startsWith("target ")), "the reveal ghost").toBe(true);
    expect(collisions(boxes)).toEqual([]);
    cleanup();
  });
});

describe("S238 distributionCompareLab — the whole authored corpus", () => {
  // The completeness claim behind "48 → 0": every authored spec × every tone that changes the
  // drawn text. SVG text here depends on spec × tone only (value moves rects), so this IS the
  // reachable label space, corpus-wide.
  it("no authored spec draws overlapping labels at any tone", () => {
    const courses = join(process.cwd(), "content", "courses");
    let specs = 0;
    for (const course of readdirSync(courses)) {
      const dir = join(courses, course, "lessons");
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        if (!f.endsWith(".json")) continue;
        const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
          id: string;
          steps: Array<{ id: string; widget?: Record<string, unknown> }>;
          remedials?: Array<{ check?: { id: string; widget?: Record<string, unknown> }; concept?: { id: string; widget?: Record<string, unknown> } }>;
        };
        const all = [...lesson.steps, ...(lesson.remedials ?? []).flatMap((r) => [r.check, r.concept]).filter((s): s is NonNullable<typeof s> => Boolean(s))];
        for (const step of all) {
          if (step.widget?.type !== "distributionCompareLab") continue;
          specs++;
          for (const tone of ["neutral", "error", "info"] as const) {
            const spec = WidgetSpec.parse(step.widget) as TWidget;
            const { container } = render(
              <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone={tone} />
            );
            const { boxes, skipped } = scanTextBoxes(container.querySelector("svg")!);
            cleanup();
            const where = `${lesson.id}/${step.id} [${tone}]`;
            expect(skipped, `${where} — unmodellable labels`).toEqual([]);
            expect(collisions(boxes).map(describeCollision), where).toEqual([]);
          }
        }
      }
    }
    // Counted from disk: 33 authored distributionCompareLab steps across 9 lessons.
    expect(specs).toBe(33);
  });
});

/* ------------------------------------------------------------------ *
 * S238 — slopeTriangle: 25 of the S237-measured pairs, and the worst
 * was the START STATE of every authored lesson: each begins at run 1,
 * so "run 1" printed on "A (1, 1)" the moment the step opened
 * (fg-02-02, the reported case). Labels here are anchored to geometry
 * the learner drags, so the sweep drives VALUE STATES, not just specs.
 * ------------------------------------------------------------------ */

function stBoxesOf(raw: Record<string, unknown>, value: unknown, tone: "neutral" | "info"): { boxes: TextBox[]; skipped: string[] } {
  const spec = WidgetSpec.parse(raw) as TWidget;
  const { container } = render(
    <WidgetRenderer spec={spec} value={value} onChange={() => {}} disabled={false} tone={tone} />
  );
  const svg = container.querySelector("svg");
  expect(svg, "slopeTriangle must draw its grid SVG").toBeTruthy();
  const scan = scanTextBoxes(svg!);
  cleanup();
  return scan;
}

const FG0202 = {
  type: "slopeTriangle", prompt: "p", ax: 1, ay: 1, bx: 4, by: 7,
  gridMax: 10, legMax: 9, runStart: 1, riseStart: 0,
  successFeedback: "Run 3 and rise 6 — the triangle's line lands exactly on B.",
  fallbackFeedback: "Extend the legs until the line through A points straight at B."
} as const;

describe("S238 label collisions — slopeTriangle", () => {
  it("the reported start state no longer overprints A, and the solved state is clean", () => {
    for (const [value, name] of [
      [{ run: 1, rise: 0 }, "the authored start (run 1) — the reported collision"],
      [{ run: 3, rise: 6 }, "the solved triangle"],
      [{ run: 1, rise: 1 }, "both legs tiny"],
      [{ run: -2, rise: -3 }, "legs pointing away from B"],
      [{ run: 9, rise: 9 }, "legs at legMax"]
    ] as const) {
      for (const tone of ["neutral", "info"] as const) {
        const { boxes, skipped } = stBoxesOf(FG0202, value, tone);
        expect(skipped, `${name} [${tone}]`).toEqual([]);
        const hits = collisions(boxes);
        expect(hits.map(describeCollision), `${name} [${tone}]`).toEqual([]);
      }
    }
  });

  it("every label is still THERE — flipped to a clear corner, never dropped", () => {
    const { boxes } = stBoxesOf(FG0202, { run: 1, rise: 0 }, "neutral");
    const t = texts(boxes);
    expect(t).toContain("A (1, 1)");
    expect(t).toContain("B (4, 7)");
    expect(t.some((s) => s.startsWith("run ")), "the run reading").toBe(true);
    expect(t.some((s) => s.startsWith("rise ")), "the rise reading").toBe(true);
  });

  it("the whole authored corpus, across a targeted state grid", () => {
    const courses = join(process.cwd(), "content", "courses");
    let specs = 0;
    for (const course of readdirSync(courses)) {
      const dir = join(courses, course, "lessons");
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        if (!f.endsWith(".json")) continue;
        const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
          id: string;
          steps: Array<{ id: string; widget?: Record<string, unknown> }>;
          remedials?: Array<{ check?: { id: string; widget?: Record<string, unknown> }; concept?: { id: string; widget?: Record<string, unknown> } }>;
        };
        const all = [...lesson.steps, ...(lesson.remedials ?? []).flatMap((r) => [r.check, r.concept]).filter((s): s is NonNullable<typeof s> => Boolean(s))];
        for (const step of all) {
          if (step.widget?.type !== "slopeTriangle") continue;
          specs++;
          const w = step.widget as { ax: number; ay: number; bx: number; by: number; legMax: number; runStart: number; riseStart: number };
          // The states a learner actually passes through: the authored start, the solved
          // triangle (B − A), tiny legs in all four directions, and both extremes.
          const states = [
            { run: w.runStart, rise: w.riseStart },
            { run: w.bx - w.ax, rise: w.by - w.ay },
            { run: 1, rise: 1 }, { run: -1, rise: 1 }, { run: 1, rise: -1 }, { run: -1, rise: -1 },
            { run: w.legMax, rise: w.legMax }, { run: -w.legMax, rise: -w.legMax }
          ].map((s) => ({
            run: Math.max(-w.legMax, Math.min(w.legMax, s.run)),
            rise: Math.max(-w.legMax, Math.min(w.legMax, s.rise))
          }));
          for (const st of states) {
            for (const tone of ["neutral", "info"] as const) {
              const { boxes, skipped } = stBoxesOf(step.widget, st, tone);
              const where = `${lesson.id}/${step.id} run=${st.run} rise=${st.rise} [${tone}]`;
              expect(skipped, `${where} — unmodellable labels`).toEqual([]);
              expect(collisions(boxes).map(describeCollision), where).toEqual([]);
            }
          }
        }
      }
    }
    // Counted from disk: 10 authored slopeTriangle steps (fg-02-02 + lf-01-02/lf-01-03).
    expect(specs).toBe(10);
  });
});

/* ------------------------------------------------------------------ *
 * S238 — samplingBiasLab: 14 of the S237-measured pairs, all ONE
 * defect: "population 50%" and the "50" axis tick share x = 200 and
 * printed on top of each other in every render of every authored spec.
 * The tick yields (the caption names that position); 0/25/75/100 stay.
 * ------------------------------------------------------------------ */

describe("S238 label collisions — samplingBiasLab", () => {
  it("every authored spec is clean at both tones, and the scale still reads", () => {
    const courses = join(process.cwd(), "content", "courses");
    let specs = 0;
    for (const course of readdirSync(courses)) {
      const dir = join(courses, course, "lessons");
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        if (!f.endsWith(".json")) continue;
        const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
          id: string;
          steps: Array<{ id: string; widget?: Record<string, unknown> }>;
          remedials?: Array<{ check?: { id: string; widget?: Record<string, unknown> }; concept?: { id: string; widget?: Record<string, unknown> } }>;
        };
        const all = [...lesson.steps, ...(lesson.remedials ?? []).flatMap((r) => [r.check, r.concept]).filter((s): s is NonNullable<typeof s> => Boolean(s))];
        for (const step of all) {
          if (step.widget?.type !== "samplingBiasLab") continue;
          specs++;
          for (const tone of ["neutral", "info"] as const) {
            const spec = WidgetSpec.parse(step.widget) as TWidget;
            const { container } = render(
              <WidgetRenderer spec={spec} value={{ method: "convenience", size: 30, draws: 4 }} onChange={() => {}} disabled={false} tone={tone} />
            );
            const svg = container.querySelector("svg");
            expect(svg, `${lesson.id}/${step.id}`).toBeTruthy();
            const { boxes, skipped } = scanTextBoxes(svg!);
            const where = `${lesson.id}/${step.id} [${tone}]`;
            expect(skipped, `${where} — unmodellable labels`).toEqual([]);
            expect(collisions(boxes).map(describeCollision), where).toEqual([]);
            // Paired acceptance: the population marker still names its position, and the
            // remaining scale numbers are all there — suppression took ONE redundant tick.
            const t = texts(boxes);
            expect(t, where).toContain("population 50%");
            for (const nTick of ["0", "25", "75", "100"]) expect(t, where).toContain(nTick);
            cleanup();
          }
        }
      }
    }
    // Counted from disk: 7 authored samplingBiasLab steps.
    expect(specs).toBe(7);
  });
});

/* ------------------------------------------------------------------ *
 * S238 — pointSetReasoningLab (10 pairs: dd-04-01's two sets share
 * values, so the 1D axis printed the same number once PER SET at one
 * x) and signChart (8 pairs: pf-02-03's close roots overprinted their
 * value/kind tags). Both engines' SVG text depends on spec × tone only
 * (the learner's value drives buttons and HTML readouts), so spec ×
 * {neutral, info} with value null IS the reachable label space.
 * ------------------------------------------------------------------ */

function corpusSweep(widgetType: string, expectedSpecs: number, extraAccept?: (t: string[], where: string) => void) {
  const courses = join(process.cwd(), "content", "courses");
  let specs = 0;
  for (const course of readdirSync(courses)) {
    const dir = join(courses, course, "lessons");
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
        id: string;
        steps: Array<{ id: string; widget?: Record<string, unknown> }>;
        remedials?: Array<{ check?: { id: string; widget?: Record<string, unknown> }; concept?: { id: string; widget?: Record<string, unknown> } }>;
      };
      const all = [...lesson.steps, ...(lesson.remedials ?? []).flatMap((r) => [r.check, r.concept]).filter((s): s is NonNullable<typeof s> => Boolean(s))];
      for (const step of all) {
        if (step.widget?.type !== widgetType) continue;
        specs++;
        for (const tone of ["neutral", "info"] as const) {
          const spec = WidgetSpec.parse(step.widget) as TWidget;
          const { container } = render(
            <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone={tone} />
          );
          const svg = container.querySelector("svg");
          expect(svg, `${lesson.id}/${step.id}`).toBeTruthy();
          const { boxes, skipped } = scanTextBoxes(svg!);
          const where = `${lesson.id}/${step.id} [${tone}]`;
          // The rotated y-axis caption is the ONE transform this model refuses; everything
          // else must be measurable.
          expect(skipped.filter((s) => !s.includes("non-translate transform")), `${where} — unmodellable labels`).toEqual([]);
          expect(collisions(boxes).map(describeCollision), where).toEqual([]);
          extraAccept?.(texts(boxes), where);
          cleanup();
        }
      }
    }
  }
  expect(specs).toBe(expectedSpecs);
}

describe("S238 label collisions — pointSetReasoningLab", () => {
  it("all 23 authored specs are clean at both tones, and every distinct value keeps a label", () => {
    corpusSweep("pointSetReasoningLab", 23);
  });

  it("dd-04-01/k2 verbatim: duplicated values get ONE axis label, not one per dot or set", () => {
    // The named trigger, read off disk: set 1 stacks three 6's and set 2 repeats set 1's 2 —
    // before S238 the axis printed "6" three times and "2" twice at identical positions.
    const lesson = JSON.parse(
      readFileSync(join(process.cwd(), "content/courses/data-distributions/lessons/dd-04-01.json"), "utf8")
    ) as { steps: Array<{ id: string; widget?: Record<string, unknown> }> };
    const raw = lesson.steps.find((s) => s.id === "k2")!.widget!;
    const spec = WidgetSpec.parse(raw) as TWidget;
    const { container } = render(
      <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone="neutral" />
    );
    const { boxes } = scanTextBoxes(container.querySelector("svg")!);
    expect(collisions(boxes)).toEqual([]);
    // ONE label per distinct value — and every distinct value still named.
    for (const xv of ["2", "3", "5", "6", "10"]) {
      expect(texts(boxes).filter((t) => t === xv), `axis value ${xv}`).toHaveLength(1);
    }
    cleanup();
  });
});

describe("S238 label collisions — signChart", () => {
  it("all 28 authored specs are clean at both tones", () => {
    corpusSweep("signChart", 28);
  });

  it("pf-02-03's shape: close roots stagger their tags onto a second row, both still named", () => {
    const spec = WidgetSpec.parse({
      type: "signChart", prompt: "p", leadingPositive: true,
      roots: [{ x: -1, mult: 1 }, { x: 0, mult: 1 }],
      successFeedback: "Both crossings flip the sign, exactly as the factors demand.",
      crossFeedback: "An odd-multiplicity root crosses the axis, so the sign flips there.",
      bounceFeedback: "An even-multiplicity root touches and turns back, so the sign holds."
    }) as TWidget;
    const { container } = render(
      <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone="neutral" />
    );
    const { boxes } = scanTextBoxes(container.querySelector("svg")!);
    expect(collisions(boxes)).toEqual([]);
    const t = texts(boxes);
    expect(t).toContain("-1");
    expect(t).toContain("0");
    expect(t.filter((s) => s === "cross"), "both kind tags survive").toHaveLength(2);
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
