// @vitest-environment jsdom
//
// S237 — the LINE PLOT a prompt describes, DRAWN. (`plotData`, display-only, on `numeric` and
// `fractionEntry`.)
//
// WHAT THIS PINS. `vm-02-02` ("Using Line Plot Data") grades four items about a plot that was
// never drawn: each prompt spelled the dataset out as ASCII — "the plot (1/4 → XX, 1/2 → XXX,
// 3/4 → X)" — and the learner saw an entry box and nothing else. Four rows of the S237
// absent-diagram list are exactly these steps.
//
// THE FIVE THINGS THAT MUST HOLD, and why each is here:
//   1. IT MOUNTS THE REAL CONTENT. Every assertion about what is drawn runs against the authored
//      widget read off disk — not a fixture that could agree with the code and disagree with the
//      lesson. The expected datasets below were read by hand from each authored prompt, so this
//      file is a SECOND route to the same property the corpus gate derives by parser.
//   2. THE DRAWN PLOT IS THE PROMPT'S PLOT. Right number of columns, right stack heights, right
//      axis labels, in the right order.
//   3. IT NEVER PRINTS THE ANSWER. The figure's entire text is X's and the axis labels the prompt
//      already gave away — asserted as an exact string, so anything new appearing there fails.
//   4. IT IS DISPLAY ONLY. `evaluate` and `canCheck` return identical results with and without the
//      field, for the correct answer, a trap, an untrapped wrong and an empty entry.
//   5. A SPEC WITHOUT THE FIELD DRAWS NOTHING. The regression guard for every other numeric and
//      fractionEntry step in the corpus.
//
// PLUS the accessibility half: the plot is aria-hidden like every other figure in this file, so
// `describeWidgetState` speaks the SAME dataset — and the two are resolved from one function, so
// they cannot drift.
//
// PLUS a REUSE check: the same dataset drawn by the interactive `dotPlot` READ engine and by this
// display block must carry byte-identical axis labels and identical stack heights. There is one
// fraction-axis formatter (`dotPlotLabel`) and this proves both pictures still go through it.
//
// EVERY REJECTION IS PAIRED WITH A NEAR-IDENTICAL ACCEPTANCE, differing in exactly the one value
// under test: no field vs field · counts/values mismatched vs matched · axis flat vs increasing ·
// all-empty vs one X · 11 columns vs 8 · a stack of 11 vs 10.

import { cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, dotPlotLabel, plotDataParts, widgetIntegrityErrors, type TWidget } from "@/lib/schema";
import { canCheck, evaluate } from "@/lib/evaluate";
import { describeWidgetState } from "@/lib/describeState";

afterEach(cleanup);

/* ---------------- the real lesson, read off disk ---------------- */

const LESSON = JSON.parse(
  readFileSync(join(process.cwd(), "content/courses/volume-measurement/lessons/vm-02-02.json"), "utf8")
) as { steps: Array<{ id: string; widget?: Record<string, unknown> }> };

const stepWidget = (id: string): Record<string, unknown> => {
  const s = LESSON.steps.find((x) => x.id === id);
  if (!s?.widget) throw new Error(`vm-02-02 has no step ${id} with a widget`);
  return s.widget;
};

/** Read BY HAND from each authored prompt — the second route. If someone edits a prompt without
 * editing its plot (or the reverse), one of these four rows stops matching. */
const EXPECTED: Array<{ id: string; prompt: string; labels: string[]; counts: number[] }> = [
  {
    id: "k1",
    prompt: "Total length of all ribbons in the plot (1/4 → XX, 1/2 → XXX, 3/4 → X)?",
    labels: ["1/4", "1/2", "3/4"],
    counts: [2, 3, 1]
  },
  {
    id: "k2",
    prompt: "In the plot (1/4 → XX, 1/2 → XXX, 3/4 → X), how much longer is the longest ribbon than the shortest?",
    labels: ["1/4", "1/2", "3/4"],
    counts: [2, 3, 1]
  },
  {
    // The sum IS the dataset: 2/4 is two quarter-foot marks, 6/4 is three half-foot marks,
    // 3/4 is one three-quarter mark. Same plot as k1, stated in fourths.
    id: "k3",
    prompt: "Write the plot's total in quarters: 2/4 + 6/4 + 3/4 = ?/4. What is the numerator?",
    labels: ["1/4", "1/2", "3/4"],
    counts: [2, 3, 1]
  },
  {
    id: "ch1",
    prompt: "Total length of the plot 1/4 → X, 1/2 → XX, 3/4 → X?",
    labels: ["1/4", "1/2", "3/4"],
    counts: [1, 2, 1]
  }
];

function mount(spec: TWidget, tone?: "neutral" | "info" | "error" | "success") {
  function Host() {
    const [value, setValue] = useState<unknown>(null);
    return <WidgetRenderer spec={spec} value={value} onChange={setValue} disabled={false} tone={tone} />;
  }
  render(<Host />);
}

const figure = () => document.querySelector("[data-testid='plot-figure']");
const columns = () => Array.from(document.querySelectorAll("[data-testid='plot-column']"));
const drawnCounts = () => columns().map((c) => c.querySelectorAll("[data-testid='plot-x']").length);
const drawnLabels = () =>
  Array.from(document.querySelectorAll("[data-testid='plot-axis-label']")).map((n) => n.textContent);

/* ---------------- 1 + 2. the real content, drawn ---------------- */

describe("the four authored vm-02-02 steps draw the plot their prompt describes", () => {
  for (const e of EXPECTED) {
    it(`${e.id}: ${e.counts.join("/")} X's above ${e.labels.join(", ")}`, () => {
      const w = stepWidget(e.id);
      // The prompt is pinned too: these expectations are only meaningful while they describe the
      // sentence the learner actually reads.
      expect(w.prompt).toBe(e.prompt);
      const spec = WidgetSpec.parse(w) as TWidget;
      expect(widgetIntegrityErrors(spec)).toEqual([]);
      mount(spec);
      expect(figure()).not.toBeNull();
      expect(drawnCounts()).toEqual(e.counts);
      expect(drawnLabels()).toEqual(e.labels);
      // The prompt is still on screen above the figure. Matched on a plain-text fragment because
      // `MathProse` typesets the fractions into their own elements, so the sentence is not one
      // contiguous text node.
      expect(document.body.textContent).toContain(e.prompt.split(/[(:]/)[0].trim());
    });
  }

  it("draws NOTHING but X's and the prompt's own axis labels — no answer reaches the figure", () => {
    for (const e of EXPECTED) {
      const spec = WidgetSpec.parse(stepWidget(e.id)) as TWidget;
      mount(spec);
      const expectedText = e.counts.map((n) => "✗".repeat(n)).join("") + e.labels.join("");
      expect(figure()!.textContent, e.id).toBe(expectedText);
      cleanup();
    }
  });

  it("the figure is aria-hidden, so it adds no second voice over the entry fields", () => {
    mount(WidgetSpec.parse(stepWidget("k1")) as TWidget);
    expect(figure()!.getAttribute("aria-hidden")).toBe("true");
  });

  it("k3 keeps its live entry preview as well — the plot is the given, the bar is the entry", () => {
    // k3 carries BOTH display fields. The plot is the dataset; the partition bar is what the
    // learner just typed. Adding one must not have taken the other away.
    const spec = WidgetSpec.parse(stepWidget("k3")) as TWidget;
    mount(spec);
    expect(figure()).not.toBeNull();
    const box = screen.getByRole("textbox");
    expect(box).toBeTruthy();
    expect(document.querySelectorAll("svg").length).toBe(0); // nothing typed yet
  });
});

/* ---------------- 3. display-only: grading is byte-identical ---------------- */

describe("grading is untouched — plotData never reaches evaluate", () => {
  const stripPlot = (w: Record<string, unknown>): TWidget => {
    const { plotData: _drop, ...rest } = w;
    return WidgetSpec.parse(rest) as TWidget;
  };

  const CASES: Record<string, unknown[]> = {
    // correct · trap · untrapped wrong · nothing entered · a non-value
    k1: [{ whole: 2, num: 3, den: 4 }, { whole: 1, num: 1, den: 2 }, { whole: 9, num: 1, den: 5 }, null, "2 3/4"],
    k2: [{ whole: 0, num: 1, den: 2 }, { whole: 1, num: 0, den: 1 }, { whole: 0, num: 7, den: 8 }, null, 0.5],
    k3: [11, 8, 7, null, "11"],
    ch1: [{ whole: 2, num: 0, den: 1 }, { whole: 1, num: 1, den: 2 }, { whole: 0, num: 5, den: 6 }, null, undefined]
  };

  it("returns identical results with and without the field, for every case on all four steps", () => {
    for (const e of EXPECTED) {
      const withPlot = WidgetSpec.parse(stepWidget(e.id)) as TWidget;
      const without = stripPlot(stepWidget(e.id));
      for (const v of CASES[e.id]) {
        expect(evaluate(withPlot, v), `${e.id} ${JSON.stringify(v)}`).toEqual(evaluate(without, v));
        expect(canCheck(withPlot, v), `${e.id} ${JSON.stringify(v)}`).toBe(canCheck(without, v));
      }
    }
  });

  it("and those results are still the RIGHT ones (not identically broken)", () => {
    const k1 = WidgetSpec.parse(stepWidget("k1")) as TWidget;
    expect(evaluate(k1, { whole: 2, num: 3, den: 4 }).correct).toBe(true);
    expect(evaluate(k1, { whole: 1, num: 1, den: 2 })).toEqual({
      correct: false,
      feedback: "1 1/2 is just the 1/2-foot stack. Add all three stacks: 2 3/4 ft."
    });
    expect(evaluate(k1, { whole: 9, num: 1, den: 5 })).toEqual({
      correct: false,
      feedback: "Add every stack: 1/2 + 1 1/2 + 3/4 = 2 3/4 ft."
    });
    const k3 = WidgetSpec.parse(stepWidget("k3")) as TWidget;
    expect(evaluate(k3, 11).correct).toBe(true);
    expect(evaluate(k3, 8).correct).toBe(false);
    expect(canCheck(k3, null)).toBe(false);
    expect(canCheck(k3, 11)).toBe(true);
  });

  it("the spec minus the field parses without the key at all — and with it, keeps it", () => {
    const plain = stripPlot(stepWidget("k1")) as Extract<TWidget, { type: "fractionEntry" }>;
    expect("plotData" in plain).toBe(false);
    expect(plain.plotData).toBeUndefined();
    const shown = WidgetSpec.parse(stepWidget("k1")) as Extract<TWidget, { type: "fractionEntry" }>;
    expect(shown.plotData).toEqual({ values: [1, 2, 3], counts: [2, 3, 1], denominator: 4 });
  });
});

/* ---------------- 4. the regression guard, from both sides ---------------- */

describe("a spec WITHOUT plotData draws nothing — the whole-corpus guard", () => {
  const stripPlot = (w: Record<string, unknown>): TWidget => {
    const { plotData: _drop, ...rest } = w;
    return WidgetSpec.parse(rest) as TWidget;
  };

  it("no figure, no columns, no labels — while the identical spec WITH it draws all three", () => {
    for (const e of EXPECTED) {
      mount(stripPlot(stepWidget(e.id)));
      expect(figure(), `${e.id} without`).toBeNull();
      expect(columns().length).toBe(0);
      expect(drawnLabels().length).toBe(0);
      cleanup();
      mount(WidgetSpec.parse(stepWidget(e.id)) as TWidget);
      expect(figure(), `${e.id} with`).not.toBeNull();
      expect(columns().length).toBe(3);
      expect(drawnLabels().length).toBe(3);
      cleanup();
    }
  });

  it("the entry fields, the unit and the reveal ghost are untouched by the new field", () => {
    for (const spec of [stripPlot(stepWidget("k1")), WidgetSpec.parse(stepWidget("k1")) as TWidget]) {
      mount(spec, "info");
      expect(screen.getByLabelText("numerator")).toBeTruthy();
      expect(screen.getByLabelText("denominator")).toBeTruthy();
      expect(screen.getByLabelText("whole number")).toBeTruthy();
      expect(screen.getAllByText("ft").length).toBeGreaterThan(0);
      expect(screen.getByTestId("fe-ghost").textContent).toContain("2 3/4 ft");
      cleanup();
    }
  });

  it("a plain numeric and a plain fractionEntry from another lesson still draw no plot", () => {
    // Belt and braces on the ~19,000 steps that never heard of this field.
    const plain = WidgetSpec.parse({
      type: "numeric",
      prompt: "What is 3 + 4?",
      answer: 7,
      fallbackFeedback: "Add the two numbers, then check the count on your fingers."
    }) as TWidget;
    mount(plain);
    expect(figure()).toBeNull();
    expect(describeWidgetState(plain, 7)).toBeNull();
    cleanup();
    const frac = WidgetSpec.parse({
      type: "fractionEntry",
      prompt: "What is 1/4 + 1/4?",
      answerNum: 1,
      answerDen: 2,
      fallbackFeedback: "Add the numerators over the common denominator, then simplify."
    }) as TWidget;
    mount(frac);
    expect(figure()).toBeNull();
    expect(describeWidgetState(frac, { whole: 0, num: 1, den: 2 })).toBeNull();
  });
});

/* ---------------- 5. every refusal, paired with its acceptance ---------------- */

describe("the resolver refuses dishonest data — each rejection beside the case that must draw", () => {
  const base = { type: "numeric", prompt: "p", answer: 1, fallbackFeedback: "Count the X's above each mark and add." };
  const withPlot = (plot: unknown): TWidget => WidgetSpec.parse({ ...base, plotData: plot }) as TWidget;
  const draws = (plot: unknown): boolean => {
    cleanup();
    mount(withPlot(plot));
    return figure() !== null;
  };

  it("REJECTS a count per value missing — ACCEPTS the same data with the count supplied", () => {
    expect(draws({ values: [1, 2, 3], counts: [2, 3], denominator: 4 })).toBe(false);
    expect(draws({ values: [1, 2, 3], counts: [2, 3, 1], denominator: 4 })).toBe(true);
  });

  it("REJECTS an axis that does not increase — ACCEPTS the same marks in order", () => {
    expect(draws({ values: [3, 2, 1], counts: [2, 3, 1], denominator: 4 })).toBe(false);
    expect(draws({ values: [1, 1, 3], counts: [2, 3, 1], denominator: 4 })).toBe(false);
    expect(draws({ values: [1, 2, 3], counts: [2, 3, 1], denominator: 4 })).toBe(true);
  });

  it("REJECTS a plot with no X anywhere — ACCEPTS the same plot with one X on it", () => {
    expect(draws({ values: [1, 2, 3], counts: [0, 0, 0], denominator: 4 })).toBe(false);
    expect(draws({ values: [1, 2, 3], counts: [0, 0, 1], denominator: 4 })).toBe(true);
  });

  it("an EMPTY stack keeps its column and its axis label — the gap is the data", () => {
    // The generators print an unused mark as "1/2 → —", and every `difference` seed with a gap
    // depends on the learner SEEING that the middle mark is empty: the shortest ribbon is then
    // 1/2, not the 1/4 printed on the axis. A column silently dropped would draw a plot that
    // contradicts the prompt and hide the trap the item is built on.
    expect(draws({ values: [1, 2, 3], counts: [2, 0, 2], denominator: 4 })).toBe(true);
    expect(drawnCounts()).toEqual([2, 0, 2]);
    expect(drawnLabels()).toEqual(["1/4", "1/2", "3/4"]);
    expect(columns().length).toBe(3);
    // …paired with the same plot filled in, so this is not passing by columns being absent.
    expect(draws({ values: [1, 2, 3], counts: [2, 1, 2], denominator: 4 })).toBe(true);
    expect(drawnCounts()).toEqual([2, 1, 2]);
    expect(drawnLabels()).toEqual(["1/4", "1/2", "3/4"]);
  });

  it("REJECTS more columns than the plot can show — ACCEPTS the ceiling itself", () => {
    const nine = { values: [1, 2, 3, 4, 5, 6, 7, 8, 9], counts: [1, 1, 1, 1, 1, 1, 1, 1, 1], denominator: 4 };
    const eight = { values: [1, 2, 3, 4, 5, 6, 7, 8], counts: [1, 1, 1, 1, 1, 1, 1, 1], denominator: 4 };
    expect(draws(nine)).toBe(false);
    expect(draws(eight)).toBe(true);
    expect(drawnCounts().length).toBe(8);
  });

  it("REJECTS a stack past the honest ceiling — ACCEPTS the ceiling itself", () => {
    expect(draws({ values: [1, 2], counts: [11, 1], denominator: 4 })).toBe(false);
    expect(draws({ values: [1, 2], counts: [10, 1], denominator: 4 })).toBe(true);
    expect(drawnCounts()).toEqual([10, 1]);
  });

  it("the SCHEMA itself rejects what should never reach the resolver", () => {
    for (const bad of [
      { values: [1], counts: [2], denominator: 4 }, // one mark is not a plot
      { values: [1, 2], counts: [2, -1], denominator: 4 }, // a negative stack
      { values: [1, 2], counts: [2, 1.5], denominator: 4 }, // half an X
      { values: [1, 2], counts: [2, 1], denominator: 1 }, // dotPlot's own denominator floor
      { values: [-1, 2], counts: [2, 1], denominator: 4 } // a mark below the axis origin
    ]) {
      expect(WidgetSpec.safeParse({ ...base, plotData: bad }).success, JSON.stringify(bad)).toBe(false);
    }
    expect(WidgetSpec.safeParse({ ...base, plotData: { values: [1, 2], counts: [2, 1], denominator: 2 } }).success).toBe(true);
    // …and a whole-number axis (no denominator at all) is legitimate, exactly as in dotPlot.
    expect(WidgetSpec.safeParse({ ...base, plotData: { values: [1, 2], counts: [2, 1] } }).success).toBe(true);
  });

  it("integrity reports every refusal as an authoring error — and stays silent on the good data", () => {
    const errsFor = (plot: unknown) => widgetIntegrityErrors(WidgetSpec.parse({ ...base, plotData: plot }) as TWidget);
    expect(errsFor({ values: [1, 2, 3], counts: [2, 3], denominator: 4 }).join(" ")).toMatch(/one count per value/);
    expect(errsFor({ values: [3, 2, 1], counts: [2, 3, 1], denominator: 4 }).join(" ")).toMatch(/increase along the axis/);
    expect(errsFor({ values: [1, 2, 3], counts: [0, 0, 0], denominator: 4 }).join(" ")).toMatch(/no X anywhere/);
    expect(errsFor({ values: [1, 2], counts: [11, 1], denominator: 4 }).join(" ")).toMatch(/exceeds the 10-X ceiling/);
    expect(
      errsFor({ values: [1, 2, 3, 4, 5, 6, 7, 8, 9], counts: [1, 1, 1, 1, 1, 1, 1, 1, 1], denominator: 4 }).join(" ")
    ).toMatch(/draws at most 8/);
    expect(errsFor({ values: [1, 2, 3], counts: [2, 3, 1], denominator: 4 })).toEqual([]);
  });

  it("never throws on hostile data, and draws nothing for any of it", () => {
    for (const plot of [
      { values: [1, 2], counts: [0, 0] },
      { values: [2, 2], counts: [1, 1] },
      { values: [0, 1], counts: [3, 0] }
    ]) {
      expect(() => draws(plot)).not.toThrow();
    }
    expect(draws({ values: [1, 2, 3], counts: [2, 3, 1], denominator: 4 })).toBe(true); // still alive
  });
});

/* ---------------- 6. the spoken equivalent ---------------- */

describe("a screen-reader learner hears the same dataset the figure draws", () => {
  it("speaks every authored plot, stack by stack", () => {
    expect(describeWidgetState(WidgetSpec.parse(stepWidget("k1")) as TWidget, null)).toBe(
      "A line plot with 2 X's above 1/4, 3 X's above 1/2, 1 X above 3/4."
    );
    expect(describeWidgetState(WidgetSpec.parse(stepWidget("ch1")) as TWidget, null)).toBe(
      "A line plot with 1 X above 1/4, 2 X's above 1/2, 1 X above 3/4."
    );
  });

  it("SINGULAR and PLURAL are stored, never derived — and \"no X\" for an empty mark", () => {
    const say = (counts: number[]) =>
      describeWidgetState(
        WidgetSpec.parse({
          type: "numeric",
          prompt: "p",
          answer: 1,
          fallbackFeedback: "Count the X's above each mark and add.",
          plotData: { values: [1, 2, 3], counts, denominator: 4 }
        }) as TWidget,
        null
      )!;
    expect(say([1, 2, 3])).toContain("1 X above 1/4");
    expect(say([1, 2, 3])).not.toContain("1 X's");
    expect(say([1, 2, 3])).toContain("2 X's above 1/2");
    expect(say([1, 2, 3])).not.toContain("2 X above");
    // An empty mark is "no X" — the prompt writes it "3/4 → —", and "0 X's" is not how it reads.
    expect(say([0, 2, 3])).toContain("no X above 1/4");
    expect(say([0, 2, 3])).not.toContain("0 X");
  });

  it("k3 speaks the plot AND the entry, in that order, from the same two resolvers", () => {
    const k3 = WidgetSpec.parse(stepWidget("k3")) as TWidget;
    expect(describeWidgetState(k3, null)).toBe("A line plot with 2 X's above 1/4, 3 X's above 1/2, 1 X above 3/4.");
    expect(describeWidgetState(k3, 11)).toBe(
      "A line plot with 2 X's above 1/4, 3 X's above 1/2, 1 X above 3/4. " +
        "You entered 11 of 4. That is 2 whole bars and 3 of 4 parts of another."
    );
  });

  it("never states the answer — only the dataset the prompt already gave", () => {
    for (const e of EXPECTED) {
      const said = describeWidgetState(WidgetSpec.parse(stepWidget(e.id)) as TWidget, null)!;
      expect(said, e.id).not.toContain("2 3/4");
      expect(said, e.id).not.toContain("11");
      expect(said, e.id).toContain("A line plot with");
    }
  });

  it("appears in the on-screen panel a screen reader reads, beside the aria-hidden figure", () => {
    mount(WidgetSpec.parse(stepWidget("k1")) as TWidget);
    const panel = screen.getByTestId("a11y-panel");
    expect(panel.textContent).toContain("Describe this model");
    expect(panel.textContent).toContain("2 X's above 1/4");
    expect(panel.querySelector("[aria-live]")).toBeNull(); // the no-chatter contract
  });

  it("stays silent exactly when the figure does — every refusal above", () => {
    const say = (plot: unknown) =>
      describeWidgetState(
        WidgetSpec.parse({
          type: "numeric",
          prompt: "p",
          answer: 1,
          fallbackFeedback: "Count the X's above each mark and add.",
          plotData: plot
        }) as TWidget,
        null
      );
    expect(say({ values: [1, 2, 3], counts: [2, 3], denominator: 4 })).toBeNull();
    expect(say({ values: [3, 2, 1], counts: [2, 3, 1], denominator: 4 })).toBeNull();
    expect(say({ values: [1, 2, 3], counts: [0, 0, 0], denominator: 4 })).toBeNull();
    expect(say({ values: [1, 2, 3], counts: [2, 3, 1], denominator: 4 })).not.toBeNull(); // …and the pair
  });
});

/* ---------------- 7. one formatter, one picture ---------------- */

describe("the display plot and the interactive dotPlot draw the SAME picture for the same data", () => {
  const VALUES = [1, 2, 3];
  const COUNTS = [2, 3, 1];
  const DEN = 4;

  it("identical axis labels, through the one shared formatter", () => {
    mount(
      WidgetSpec.parse({
        type: "numeric",
        prompt: "p",
        answer: 1,
        fallbackFeedback: "Count the X's above each mark and add.",
        plotData: { values: VALUES, counts: COUNTS, denominator: DEN }
      }) as TWidget
    );
    const shown = drawnLabels();
    cleanup();
    // dotPlot READ mode, same dataset.
    mount(
      WidgetSpec.parse({
        type: "dotPlot",
        prompt: "How many ribbons measured 1/2 foot? Tap each X you count.",
        values: VALUES,
        target: COUNTS,
        given: COUNTS,
        askIndex: 1,
        maxPerValue: 6,
        denominator: DEN,
        successFeedback: "Right — three X's stand above the 1/2 mark, so three ribbons measured 1/2 foot.",
        partialFeedback: "Keep counting: mark every X in the stack above 1/2 before you check."
      }) as TWidget
    );
    const dotLabels = VALUES.map((v) => dotPlotLabel(v, DEN));
    expect(shown).toEqual(dotLabels);
    for (const l of dotLabels) expect(screen.getAllByText(l).length).toBeGreaterThan(0);
  });

  it("identical stack heights, column for column", () => {
    mount(
      WidgetSpec.parse({
        type: "dotPlot",
        prompt: "How many ribbons measured 1/2 foot? Tap each X you count.",
        values: VALUES,
        target: COUNTS,
        given: COUNTS,
        askIndex: 1,
        maxPerValue: 6,
        denominator: DEN,
        successFeedback: "Right — three X's stand above the 1/2 mark, so three ribbons measured 1/2 foot.",
        partialFeedback: "Keep counting: mark every X in the stack above 1/2 before you check."
      }) as TWidget
    );
    // Buttons only: dotPlot's own group carries an aria-label that names every stack, and
    // counting that container as an X would inflate two of the three columns by one.
    const perStack = VALUES.map(
      (v) => screen.getAllByRole("button", { name: new RegExp(`above ${dotPlotLabel(v, DEN).replace("/", "\\/")},`) }).length
    );
    expect(perStack).toEqual(COUNTS);
    cleanup();
    mount(
      WidgetSpec.parse({
        type: "numeric",
        prompt: "p",
        answer: 1,
        fallbackFeedback: "Count the X's above each mark and add.",
        plotData: { values: VALUES, counts: COUNTS, denominator: DEN }
      }) as TWidget
    );
    expect(drawnCounts()).toEqual(perStack);
  });

  it("one dialect: dotPlot's spoken stack list uses the SAME stored plurals", () => {
    // The display block and the interactive engine describe the same picture, so they must not
    // describe it in two different Englishes. Before S237 the dotPlot branch derived nothing and
    // said "2 X above 1/4" in its first half and "2 X are counted" in its second; both halves now
    // take the shared phrase. Pinned here so a future edit to either branch fails rather than
    // splitting the dialect again.
    const dot = WidgetSpec.parse({
      type: "dotPlot",
      prompt: "How many ribbons measured 1/2 foot? Tap each X you count.",
      values: VALUES,
      target: COUNTS,
      given: COUNTS,
      askIndex: 1,
      maxPerValue: 6,
      denominator: DEN,
      successFeedback: "Right — three X's stand above the 1/2 mark, so three ribbons measured 1/2 foot.",
      partialFeedback: "Keep counting: mark every X in the stack above 1/2 before you check."
    }) as TWidget;
    const said = describeWidgetState(dot, null)!;
    const display = describeWidgetState(
      WidgetSpec.parse({
        type: "numeric",
        prompt: "p",
        answer: 1,
        fallbackFeedback: "Count the X's above each mark and add.",
        plotData: { values: VALUES, counts: COUNTS, denominator: DEN }
      }) as TWidget,
      null
    )!;
    const stacks = "2 X's above 1/4, 3 X's above 1/2, 1 X above 3/4";
    expect(said).toContain(stacks);
    expect(display).toContain(stacks);
    expect(said).not.toContain("2 X above"); // the derived-away plural, from both halves
    expect(describeWidgetState(dot, [0, 2, 0])).toContain("2 X's are counted so far");
    expect(describeWidgetState(dot, [0, 1, 0])).toContain("1 X is counted so far");
    expect(describeWidgetState(dot, [0, 1, 0])).not.toContain("1 X's");
  });

  it("the display block is READ-ONLY: it contributes no button, no tab stop", () => {
    mount(WidgetSpec.parse(stepWidget("k1")) as TWidget);
    expect(figure()!.querySelectorAll("button").length).toBe(0);
    expect(figure()!.querySelectorAll("input, [tabindex]").length).toBe(0);
  });

  it("the resolver is what both the figure and the sentence read", () => {
    const spec = WidgetSpec.parse(stepWidget("k1")) as Extract<TWidget, { type: "fractionEntry" }>;
    expect(plotDataParts(spec)).toEqual({
      values: [1, 2, 3],
      counts: [2, 3, 1],
      labels: ["1/4", "1/2", "3/4"],
      denominator: 4
    });
    expect(plotDataParts({})).toBeNull();
  });
});

/* ------------------------------------------------------------------ *
 * S238 — the SAME block on `mcq`, same figure, same guard rails.
 * ------------------------------------------------------------------ */

// The authored rows, read off disk exactly as the vm-02-02 half does: one fraction-axis mcq
// (vm-02-01/k1) and one whole-number-axis mcq (g2g-01-05/k1). The expected datasets were read
// BY HAND from each authored prompt — the second route beside the corpus gate's parser.
const VM0201 = JSON.parse(
  readFileSync(join(process.cwd(), "content/courses/volume-measurement/lessons/vm-02-01.json"), "utf8")
) as { steps: Array<{ id: string; widget?: Record<string, unknown> }> };
const G2G0105 = JSON.parse(
  readFileSync(join(process.cwd(), "content/courses/data-line-plots-g2/lessons/g2g-01-05.json"), "utf8")
) as { steps: Array<{ id: string; widget?: Record<string, unknown> }> };

const mcqWidget = (lesson: { steps: Array<{ id: string; widget?: Record<string, unknown> }> }, id: string) => {
  const s = lesson.steps.find((x) => x.id === id);
  if (!s?.widget) throw new Error(`no step ${id} with a widget`);
  return s.widget;
};

describe("S238: the authored mcq rows draw the plot their prompt describes", () => {
  it("vm-02-01/k1: 2/3/1/2 X's above 1/4, 1/2, 3/4, 1 — a fraction axis on an mcq", () => {
    mount(WidgetSpec.parse(mcqWidget(VM0201, "k1")) as TWidget);
    expect(figure()).toBeTruthy();
    expect(drawnCounts()).toEqual([2, 3, 1, 2]);
    expect(drawnLabels()).toEqual(["1/4", "1/2", "3/4", "1"]);
    // The options are still there, still buttons, still labelled — the plot displaced nothing.
    expect(screen.getByRole("radio", { name: "1/2 ft" })).toBeTruthy();
    expect(screen.getAllByRole("radio").length).toBe(3);
  });

  it("g2g-01-05/k1: 2/5/3/1 x's above 5, 6, 7, 8 — a whole-number axis, no denominator", () => {
    mount(WidgetSpec.parse(mcqWidget(G2G0105, "k1")) as TWidget);
    expect(figure()).toBeTruthy();
    expect(drawnCounts()).toEqual([2, 5, 3, 1]);
    expect(drawnLabels()).toEqual(["5", "6", "7", "8"]);
  });

  it("the figure is aria-hidden and read-only on mcq exactly as on the entry surfaces", () => {
    mount(WidgetSpec.parse(mcqWidget(VM0201, "k1")) as TWidget);
    expect(figure()!.getAttribute("aria-hidden")).toBe("true");
    expect(figure()!.querySelectorAll("button, input, [tabindex]").length).toBe(0);
  });

  it("grading is untouched: evaluate and canCheck are identical with and without the field", () => {
    const raw = mcqWidget(VM0201, "k1");
    const { plotData: _drop, ...rest } = raw;
    const withPlot = WidgetSpec.parse(raw) as TWidget;
    const without = WidgetSpec.parse(rest) as TWidget;
    // the key · a wrong pick · nothing picked · a non-id
    for (const v of ["a", "b", null, "zz"]) {
      expect(evaluate(withPlot, v), JSON.stringify(v)).toEqual(evaluate(without, v));
      expect(canCheck(withPlot, v), JSON.stringify(v)).toBe(canCheck(without, v));
    }
    expect(evaluate(withPlot, "a").correct).toBe(true); // …and still the RIGHT result
    expect(evaluate(withPlot, "b").correct).toBe(false);
  });

  it("a plain mcq from another lesson still draws no plot — the corpus guard, third surface", () => {
    const plain = WidgetSpec.parse({
      type: "mcq",
      prompt: "Which is larger?",
      options: [
        { id: "a", label: "3/4", correct: true, feedback: "3/4 covers more of the whole than 1/4 does." },
        { id: "b", label: "1/4", feedback: "1/4 is one part of four; 3/4 is three of those same parts." }
      ]
    }) as TWidget;
    mount(plain);
    expect(figure()).toBeNull();
    expect(describeWidgetState(plain, null)).toBeNull();
  });

  it("a screen-reader learner hears the same dataset, in the shared dialect", () => {
    const spec = WidgetSpec.parse(mcqWidget(VM0201, "k1")) as TWidget;
    const said = describeWidgetState(spec, null)!;
    expect(said).toBe("A line plot with 2 X's above 1/4, 3 X's above 1/2, 1 X above 3/4, 2 X's above 1.");
    // Never the answer: the sentence states stacks the prompt already printed, nothing more.
    expect(said).not.toContain("most common");
    expect(said).not.toContain("correct");
  });
});
