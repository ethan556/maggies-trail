/* S237 — the corpus contract for the display-only `plotData` block.
 *
 * THE DEFECT. `vm-02-02` ("Using Line Plot Data") grades four items about a line plot that is
 * never drawn. Each prompt spells the dataset out in ASCII — "the plot (1/4 → XX, 1/2 → XXX,
 * 3/4 → X)" — and the learner sees an entry box and nothing else. Four rows of the S237
 * absent-diagram list are exactly these steps, and the lesson's stated skill is USING LINE-PLOT
 * DATA, so the plot is the instrument.
 *
 * WHAT THIS GATE PINS, and why each is here:
 *
 *   1. EXACTLY the measured set declares the field. A drift — a step deleted, a fifth added
 *      without a decision, a lesson reworded — fails loudly here instead of silently changing
 *      the size of the feature.
 *   2. FIGURE–TEXT ALIGNMENT: every declared plot agrees with its OWN prompt, re-read from the
 *      authored sentence by a parser that never looks at the declared block. This is the property
 *      the repo audits, and a drawn plot that contradicts its prompt is worse than no plot: the
 *      learner would count X's that answer a different question.
 *   3. THE PLOT IS THE GRADED DATASET. Agreement with the prompt's ASCII is not enough — the plot
 *      must be the data the frozen ANSWER comes from. Each question shape is re-derived from the
 *      drawn plot alone (total = Σ value × count, difference = longest − shortest, quarter-sum =
 *      Σ terms) and asserted equal to the authored answer. A transposed or mistyped stack fails
 *      here even if the ASCII were mistyped the same way.
 *   4. DISPLAY ONLY. Declaring it left the answer, the tolerance and every trap untouched.
 *   5. THE OTHER ~19,000 STEPS DRAW NOTHING. The regression guard for the whole corpus.
 *
 * PLUS the generated half, which is the reason this is a field and not a static figure: the four
 * steps declare variants that REBUILD the plot on every re-ask. Each declared generator/form is
 * swept over many seeds and the SAME two properties are re-asserted on the generated widget.
 *
 * EVERY REJECTION IS PAIRED WITH A NEAR-IDENTICAL ACCEPTANCE. A parser that returns null for
 * everything, or an agreement check that never disagrees, would pass a gate written only in the
 * positive direction. Each pair below differs in exactly the one value under test.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { plotDataParts, widgetIntegrityErrors, WidgetSpec, type TWidget, type TPlotData } from "./schema";
import { variantForStep } from "./variants";

const COURSES = join(process.cwd(), "content", "courses");

type Step = { id: string; widget?: Record<string, unknown>; variant?: { gen: string; form?: string } };
type Lesson = { id: string; steps: Step[]; remedials?: Array<{ check?: Step; concept?: Step }> };

function everyStep(l: Lesson): Step[] {
  const out = [...l.steps];
  for (const r of l.remedials ?? []) for (const st of [r.check, r.concept]) if (st) out.push(st);
  return out;
}

function allLessons(): Lesson[] {
  const out: Lesson[] = [];
  for (const course of readdirSync(COURSES)) {
    const dir = join(COURSES, course, "lessons");
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (f.endsWith(".json")) out.push(JSON.parse(readFileSync(join(dir, f), "utf8")) as Lesson);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * The independent route: the dataset a PROMPT states, read from the
 * authored sentence and nothing else.
 * ------------------------------------------------------------------ */

/** A fraction label ("1/4", "3/4", "1") as a numerator over `den`. Returns null when it does not
 * land on an exact numerator — a label the declared denominator cannot express is a disagreement,
 * not something to round into agreement. */
function numeratorOf(label: string, den: number): number | null {
  const m = /^(\d+)(?:\/(\d+))?$/.exec(label.trim());
  if (!m) return null;
  const n = Number(m[1]);
  const d = m[2] === undefined ? 1 : Number(m[2]);
  if (d < 1) return null;
  const scaled = (n * den) / d;
  return Number.isInteger(scaled) ? scaled : null;
}

/** The three notations the corpus and the generators actually use to state a plot in words.
 *
 *   marks  "1/4 → XX, 1/2 → XXX, 3/4 → X"      (an em-dash stack is a listed mark with no X's)
 *          "3 marks at 1/4 ft, 2 at 1/2 ft, …"  (the quarterNumerator generator's sentence)
 *   terms  "2/4 + 6/4 + 3/4 = ?/4"              (each term is one stack ALREADY in fourths)
 *
 * Returns null when the sentence states no dataset at all — which is a REJECTION this gate
 * exercises, not a reason to skip a step. */
function plotStatedIn(prompt: string, den: number):
  | { kind: "marks"; values: number[]; counts: number[] }
  | { kind: "terms"; terms: number[] }
  | null {
  const arrow = [...prompt.matchAll(/(\d+(?:\/\d+)?)\s*(?:→|->)\s*(X+|—)/g)];
  if (arrow.length >= 2) {
    const values: number[] = [];
    const counts: number[] = [];
    for (const m of arrow) {
      const v = numeratorOf(m[1], den);
      if (v === null) return null;
      values.push(v);
      counts.push(m[2] === "—" ? 0 : m[2].length);
    }
    return { kind: "marks", values, counts };
  }
  const atMarks = [...prompt.matchAll(/(\d+)\s+(?:marks?\s+)?at\s+(\d+(?:\/\d+)?)\s*ft/g)];
  if (atMarks.length >= 2) {
    const values: number[] = [];
    const counts: number[] = [];
    for (const m of atMarks) {
      const v = numeratorOf(m[2], den);
      if (v === null) return null;
      values.push(v);
      counts.push(Number(m[1]));
    }
    return { kind: "marks", values, counts };
  }
  const sum = /(\d+\/\d+(?:\s*\+\s*\d+\/\d+)+)\s*=\s*\?\/(\d+)/.exec(prompt);
  if (sum) {
    const over = Number(sum[2]);
    const terms: number[] = [];
    for (const t of sum[1].split("+")) {
      const v = numeratorOf(t, over);
      if (v === null || over !== den) return null;
      terms.push(v);
    }
    return { kind: "terms", terms };
  }
  return null;
}

/** Does the DRAWN plot say what the PROMPT says? Returns the disagreements, so a caller can
 * assert both directions: empty for a plot that agrees, non-empty for one that does not. */
function disagreements(prompt: string, plot: TPlotData): string[] {
  const den = plot.denominator ?? 1;
  const stated = plotStatedIn(prompt, den);
  if (!stated) return [`the prompt states no dataset this reader can find: ${prompt}`];
  const errs: string[] = [];
  if (stated.kind === "marks") {
    if (stated.values.length !== plot.values.length)
      errs.push(`prompt lists ${stated.values.length} marks, the plot draws ${plot.values.length}`);
    stated.values.forEach((v, i) => {
      if (plot.values[i] !== v) errs.push(`mark ${i}: prompt says ${v}/${den}, the plot draws ${plot.values[i]}/${den}`);
      if (plot.counts[i] !== stated.counts[i])
        errs.push(`stack ${i}: prompt says ${stated.counts[i]} X, the plot draws ${plot.counts[i]}`);
    });
    return errs;
  }
  // terms: the i-th printed term is that stack's whole contribution, count × value.
  if (stated.terms.length !== plot.values.length)
    errs.push(`prompt sums ${stated.terms.length} terms, the plot draws ${plot.values.length} marks`);
  stated.terms.forEach((t, i) => {
    const drawn = (plot.counts[i] ?? 0) * (plot.values[i] ?? 0);
    if (drawn !== t) errs.push(`term ${i}: prompt says ${t}/${den}, the plot draws ${plot.counts[i]}×${plot.values[i]}/${den} = ${drawn}/${den}`);
  });
  return errs;
}

/** The value the DRAWN plot implies for each question shape, in numerator units over the plot's
 * own denominator. Null when the prompt is not one of the shapes whose answer the plot fixes. */
function answerFromPlot(prompt: string, plot: TPlotData): number | null {
  const present = plot.values.filter((_, i) => plot.counts[i] > 0);
  if (/how much longer is the longest/i.test(prompt)) {
    if (present.length < 2) return null;
    return present[present.length - 1] - present[0];
  }
  if (/total length/i.test(prompt) || /what is the numerator/i.test(prompt))
    return plot.values.reduce((s, v, i) => s + v * plot.counts[i], 0);
  return null;
}

/* ------------------------------------------------------------------ *
 * The authored corpus
 * ------------------------------------------------------------------ */

const declared = allLessons().flatMap((l) =>
  everyStep(l)
    .filter((s) => s.widget?.plotData !== undefined)
    .map((s) => ({
      lesson: l.id,
      step: s.id,
      variant: s.variant,
      w: s.widget as Record<string, unknown>,
      plot: s.widget!.plotData as TPlotData
    }))
);

/** The graded value of a step, in numerator units over the plot's denominator. `numeric` steps in
 * this family are already counted in those units; `fractionEntry` answers are a mixed number. */
function authoredAnswerInUnits(w: Record<string, unknown>, den: number): number {
  if (w.type === "numeric") return w.answer as number;
  const whole = (w.answerWhole as number) ?? 0;
  const num = w.answerNum as number;
  const d = w.answerDen as number;
  return whole * den + (num * den) / d;
}

describe("plotData — the corpus contract", () => {
  it("is declared on exactly the 4 measured steps, all of them vm-02-02's", () => {
    expect(declared.map((d) => `${d.lesson}/${d.step}`).sort()).toEqual([
      "vm-02-02/ch1",
      "vm-02-02/k1",
      "vm-02-02/k2",
      "vm-02-02/k3"
    ]);
  });

  it("every declared plot agrees with its OWN prompt, mark for mark and X for X", () => {
    for (const d of declared) {
      expect(disagreements(String(d.w.prompt), d.plot), `${d.lesson}/${d.step}`).toEqual([]);
    }
  });

  it("the drawn plot is the dataset the FROZEN ANSWER comes from", () => {
    for (const d of declared) {
      const den = d.plot.denominator ?? 1;
      const fromPlot = answerFromPlot(String(d.w.prompt), d.plot);
      expect(fromPlot, `${d.lesson}/${d.step}: no answer shape recognised`).not.toBeNull();
      expect(fromPlot, `${d.lesson}/${d.step}: the drawn plot implies a different answer`).toBe(
        authoredAnswerInUnits(d.w, den)
      );
    }
  });

  it("every declared plot is drawable, and passes the shared integrity rules", () => {
    for (const d of declared) {
      const spec = WidgetSpec.parse(d.w) as TWidget;
      expect(widgetIntegrityErrors(spec), `${d.lesson}/${d.step}`).toEqual([]);
      const parts = plotDataParts(d.plot === undefined ? {} : { plotData: d.plot });
      expect(parts, `${d.lesson}/${d.step}: declared a plot the renderer would not draw`).not.toBeNull();
      expect(parts!.counts).toEqual(d.plot.counts);
      expect(parts!.labels.length).toBe(d.plot.values.length);
    }
  });

  it("declaring it left grading alone — the traps and the answer are untouched", () => {
    for (const d of declared) {
      if (d.w.type === "numeric") {
        expect(d.w.tolerance, `${d.lesson}/${d.step}`).toBe(0);
        for (const t of (d.w.commonErrors ?? []) as Array<{ value: number; feedback: string }>) {
          expect(t.value).not.toBe(d.w.answer);
          expect(t.feedback.length).toBeGreaterThanOrEqual(25);
        }
      } else {
        for (const t of (d.w.commonEntries ?? []) as Array<{ whole?: number; num: number; den: number; feedback: string }>) {
          expect(t.feedback.length).toBeGreaterThanOrEqual(25);
        }
      }
    }
  });

  it("no step outside the declared set acquired a plot — the whole-corpus guard", () => {
    let checked = 0;
    for (const l of allLessons()) {
      for (const s of everyStep(l)) {
        if (!s.widget || s.widget.plotData !== undefined) continue;
        expect(plotDataParts(s.widget as { plotData?: TPlotData }), `${l.id}/${s.id}`).toBeNull();
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(10000);
  });
});

/* ------------------------------------------------------------------ *
 * The generated half — the plot survives a re-ask
 * ------------------------------------------------------------------ */

describe("plotData survives the re-ask: every declared generator emits it", () => {
  const SEEDS = 40;

  it("each of the 4 steps regenerates WITH a plot that agrees with its regenerated prompt", () => {
    for (const d of declared) {
      expect(d.variant, `${d.lesson}/${d.step}: no variant declared`).toBeDefined();
      let seen = 0;
      for (let i = 0; i < SEEDS; i++) {
        const v = variantForStep(
          { widget: { type: d.w.type as string }, variant: d.variant! },
          `plot:${d.lesson}:${d.step}:${i}`
        );
        expect(v, `${d.lesson}/${d.step}: generator declined seed ${i}`).not.toBeNull();
        const w = WidgetSpec.parse(v!.widget) as Extract<TWidget, { type: "numeric" | "fractionEntry" }>;
        expect(w.plotData, `${d.lesson}/${d.step} seed ${i}: regenerated WITHOUT a plot`).toBeDefined();
        expect(
          disagreements(w.prompt, w.plotData!),
          `${d.lesson}/${d.step} seed ${i}: ${w.prompt}`
        ).toEqual([]);
        expect(widgetIntegrityErrors(w), `${d.lesson}/${d.step} seed ${i}`).toEqual([]);
        seen++;
      }
      expect(seen).toBe(SEEDS);
    }
  });

  it("the regenerated plot is the dataset the regenerated ANSWER comes from", () => {
    for (const d of declared) {
      for (let i = 0; i < SEEDS; i++) {
        const v = variantForStep(
          { widget: { type: d.w.type as string }, variant: d.variant! },
          `plotans:${d.lesson}:${d.step}:${i}`
        )!;
        const w = WidgetSpec.parse(v.widget) as Extract<TWidget, { type: "numeric" | "fractionEntry" }>;
        const den = w.plotData!.denominator ?? 1;
        const fromPlot = answerFromPlot(w.prompt, w.plotData!);
        expect(fromPlot, `${d.lesson}/${d.step} seed ${i}: ${w.prompt}`).not.toBeNull();
        expect(fromPlot, `${d.lesson}/${d.step} seed ${i}: ${w.prompt}`).toBe(
          authoredAnswerInUnits(w as unknown as Record<string, unknown>, den)
        );
      }
    }
  });

  it("the generated plots are FRESH — the picture moves with the seed, not just the sentence", () => {
    for (const d of declared) {
      const seen = new Set<string>();
      for (let i = 0; i < SEEDS; i++) {
        const v = variantForStep(
          { widget: { type: d.w.type as string }, variant: d.variant! },
          `plotfresh:${d.lesson}:${d.step}:${i}`
        )!;
        const w = v.widget as Extract<TWidget, { type: "numeric" | "fractionEntry" }>;
        seen.add(JSON.stringify(w.plotData));
      }
      expect(seen.size, `${d.lesson}/${d.step}: the plot ignores the seed`).toBeGreaterThan(3);
    }
  });

  it("k3's regenerated widget keeps its live ?/4 preview as well as its plot", () => {
    // Found by READING the printed output: vm-02-02/k3 carries `previewDenominator: 4`, but the
    // generator that rebuilds it on a re-ask did not, so the live "what you just typed" bar
    // vanished the moment the learner asked for a fresh one. Both display fields must survive.
    const k3 = declared.find((d) => d.step === "k3")!;
    for (let i = 0; i < SEEDS; i++) {
      const v = variantForStep({ widget: { type: "numeric" }, variant: k3.variant! }, `plotprev:${i}`)!;
      const w = WidgetSpec.parse(v.widget) as Extract<TWidget, { type: "numeric" }>;
      expect(w.previewDenominator, `seed ${i}: the live preview was dropped on re-ask`).toBe(4);
      expect(w.plotData, `seed ${i}`).toBeDefined();
      // The two display fields agree: the plot is in quarters and so is the preview bar.
      expect(w.plotData!.denominator).toBe(w.previewDenominator);
    }
    // Paired acceptance from the other side: the AUTHORED step carries the same pair.
    expect((k3.w as Record<string, unknown>).previewDenominator).toBe(4);
  });

  it("and it is deterministic: one seed rebuilds one plot, forever", () => {
    for (const d of declared) {
      const call = () =>
        (variantForStep({ widget: { type: d.w.type as string }, variant: d.variant! }, `plotdet:${d.step}`)!
          .widget as Extract<TWidget, { type: "numeric" | "fractionEntry" }>).plotData;
      expect(JSON.stringify(call())).toBe(JSON.stringify(call()));
    }
  });
});

/* ------------------------------------------------------------------ *
 * The reader and the agreement check are real detectors
 * ------------------------------------------------------------------ */

describe("the prompt reader ACCEPTS the authored shapes and REJECTS what it must", () => {
  it("reads the arrow notation, an em-dash stack included", () => {
    expect(plotStatedIn("Total length of all ribbons in the plot (1/4 → XX, 1/2 → XXX, 3/4 → X)?", 4)).toEqual({
      kind: "marks",
      values: [1, 2, 3],
      counts: [2, 3, 1]
    });
    // The generators print an EMPTY mark as an em-dash; it is a listed mark with no X's, and
    // reading it as "absent" would silently shrink the plot by a column.
    expect(plotStatedIn("In the plot (1/4 → —, 1/2 → XXX, 3/4 → XX), how much longer…", 4)).toEqual({
      kind: "marks",
      values: [1, 2, 3],
      counts: [0, 3, 2]
    });
  });

  it("reads the generator's \"N marks at\" sentence, singular and plural alike", () => {
    expect(
      plotStatedIn("A line plot has 3 marks at 1/4 ft, 2 at 1/2 ft, and 4 at 3/4 ft. Write the total as ?/4 ft. What is the numerator?", 4)
    ).toEqual({ kind: "marks", values: [1, 2, 3], counts: [3, 2, 4] });
    expect(
      plotStatedIn("A line plot has 1 mark at 1/4 ft, 2 at 1/2 ft, and 1 at 3/4 ft. Write the total as ?/4 ft. What is the numerator?", 4)
    ).toEqual({ kind: "marks", values: [1, 2, 3], counts: [1, 2, 1] });
  });

  it("reads the quarter-sum, and REJECTS the same sum over a different denominator", () => {
    expect(plotStatedIn("Write the plot's total in quarters: 2/4 + 6/4 + 3/4 = ?/4. What is the numerator?", 4)).toEqual({
      kind: "terms",
      terms: [2, 6, 3]
    });
    // A plot declared in EIGHTHS cannot be checked against a sum printed in fourths — agreeing
    // there would mean comparing two different units and calling them equal.
    expect(plotStatedIn("Write the plot's total in quarters: 2/4 + 6/4 + 3/4 = ?/4. What is the numerator?", 8)).toBeNull();
  });

  it("REJECTS a sentence with no dataset — and ACCEPTS the near-identical one that has one", () => {
    expect(plotStatedIn("What is 3 + 4?", 4)).toBeNull();
    expect(plotStatedIn("How many ribbons were measured in all?", 4)).toBeNull();
    // One mark is not a plot, and reading it as one would let a single stack masquerade as data.
    expect(plotStatedIn("In the plot (1/2 → XXX), how many?", 4)).toBeNull();
    expect(plotStatedIn("In the plot (1/2 → XXX, 3/4 → X), how many?", 4)).toEqual({
      kind: "marks",
      values: [2, 3],
      counts: [3, 1]
    });
  });

  it("REJECTS a label the declared denominator cannot express", () => {
    // A plot in QUARTERS cannot draw a 1/3 mark; silently rounding it onto 1/4 would draw a
    // different dataset than the prompt states.
    expect(plotStatedIn("In the plot (1/3 → XX, 1/2 → X), how many?", 4)).toBeNull();
    expect(plotStatedIn("In the plot (1/4 → XX, 1/2 → X), how many?", 4)).toEqual({
      kind: "marks",
      values: [1, 2],
      counts: [2, 1]
    });
  });
});

describe("the agreement check REALLY disagrees — every mutation of the real vm-02-02 data", () => {
  const PROMPT = "Total length of all ribbons in the plot (1/4 → XX, 1/2 → XXX, 3/4 → X)?";
  const TRUE_PLOT: TPlotData = { values: [1, 2, 3], counts: [2, 3, 1], denominator: 4 };

  it("ACCEPTS the plot the prompt states", () => {
    expect(disagreements(PROMPT, TRUE_PLOT)).toEqual([]);
  });

  it("REJECTS one X added to a stack, and one taken away", () => {
    expect(disagreements(PROMPT, { ...TRUE_PLOT, counts: [2, 3, 2] })).not.toEqual([]);
    expect(disagreements(PROMPT, { ...TRUE_PLOT, counts: [2, 3, 0] })).not.toEqual([]);
    expect(disagreements(PROMPT, { ...TRUE_PLOT, counts: [2, 3, 1] })).toEqual([]); // …and back
  });

  it("REJECTS the same counts on the wrong marks (a transposed axis)", () => {
    expect(disagreements(PROMPT, { ...TRUE_PLOT, values: [1, 2, 4] })).not.toEqual([]);
    expect(disagreements(PROMPT, { ...TRUE_PLOT, counts: [1, 3, 2] })).not.toEqual([]);
  });

  it("REJECTS a plot with a mark the prompt does not list", () => {
    expect(disagreements(PROMPT, { values: [1, 2, 3, 4], counts: [2, 3, 1, 1], denominator: 4 })).not.toEqual([]);
    expect(disagreements(PROMPT, { values: [1, 2], counts: [2, 3], denominator: 4 })).not.toEqual([]);
  });

  it("REJECTS a quarter-sum plot whose stacks do not multiply out to the printed terms", () => {
    const sumPrompt = "Write the plot's total in quarters: 2/4 + 6/4 + 3/4 = ?/4. What is the numerator?";
    expect(disagreements(sumPrompt, { values: [1, 2, 3], counts: [2, 3, 1], denominator: 4 })).toEqual([]);
    // 6/4 is THREE half-foot marks, not six: counts[1] = 6 draws twelve quarters where the
    // prompt prints six. This is the mutation a hand transcription is most likely to make.
    expect(disagreements(sumPrompt, { values: [1, 2, 3], counts: [2, 6, 3], denominator: 4 })).not.toEqual([]);
  });

  it("the answer-from-plot route really moves with the plot", () => {
    expect(answerFromPlot(PROMPT, TRUE_PLOT)).toBe(11);
    expect(answerFromPlot(PROMPT, { ...TRUE_PLOT, counts: [2, 3, 2] })).toBe(14);
    const diffPrompt = "In the plot (1/4 → XX, 1/2 → XXX, 3/4 → X), how much longer is the longest ribbon than the shortest?";
    expect(answerFromPlot(diffPrompt, TRUE_PLOT)).toBe(2); // 3/4 − 1/4 = 2/4
    expect(answerFromPlot(diffPrompt, { ...TRUE_PLOT, counts: [0, 3, 1] })).toBe(1); // 3/4 − 1/2
    expect(answerFromPlot("What is 3 + 4?", TRUE_PLOT)).toBeNull();
  });
});
