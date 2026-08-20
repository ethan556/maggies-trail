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
import { dotPlotLabel, plotDataParts, widgetIntegrityErrors, WidgetSpec, type TWidget, type TPlotData } from "./schema";
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
  // "2½" / "½" — the vulgar half md-03-04's frozen prose writes (S238 wave 9).
  const h = /^(\d*)½$/.exec(label.trim());
  if (h) {
    const scaled = ((h[1] === "" ? 0 : Number(h[1])) + 0.5) * den;
    return Number.isInteger(scaled) ? scaled : null;
  }
  const m = /^(\d+)(?:\/(\d+))?$/.exec(label.trim());
  if (!m) return null;
  const n = Number(m[1]);
  const d = m[2] === undefined ? 1 : Number(m[2]);
  if (d < 1) return null;
  const scaled = (n * den) / d;
  return Number.isInteger(scaled) ? scaled : null;
}

/** The five notations the corpus and the generators actually use to state a plot in words.
 *
 *   marks  "1/4 → XX, 1/2 → XXX, 3/4 → X"      (an em-dash stack is a listed mark with no X's)
 *          "3 marks at 1/4 ft, 2 at 1/2 ft, …"  (the quarterNumerator generator's sentence)
 *          "1/4 ft (2 X's), 1/2 ft (3 X's), …"  (the fractionMode/Total/atOrAbove sentence, S238)
 *          "stacks of 2, 5, 3, and 1 x's above 5, 6, 7, and 8 inches"  (the g2g sentence, S238)
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
  // "1/4 ft (2 X's), 1/2 ft (3 X's), …" — the sentence the fractionMode / fractionTotal /
  // atOrAbove generators print. Value first, count in the parenthesis.
  const ftParen = [...prompt.matchAll(/(\d+(?:\/\d+)?)\s*ft\s*\((\d+)\s*X/g)];
  if (ftParen.length >= 2) {
    const values: number[] = [];
    const counts: number[] = [];
    for (const m of ftParen) {
      const v = numeratorOf(m[1], den);
      if (v === null) return null;
      values.push(v);
      counts.push(Number(m[2]));
    }
    return { kind: "marks", values, counts };
  }
  // "stacks of 2, 5, 3, and 1 x's above 5, 6, 7, and 8 inches" / "A later plot has 6, 2, 3, and 1
  // Xs above 5, 6, 7, and 8 inches" — the g2g family's counts-first sentence. The "stacks of "
  // lead-in is one authored phrasing of this shape, not the shape itself, so it is optional here
  // (g2g-01-05/k3 states the identical shape without it) — counts always come first, values
  // second, and the two lists must pair off exactly either way.
  const stacks = /(?:stacks of )?([\d,\sand]+?) x'?s? above ([\d,\sand]+?) inches/i.exec(prompt);
  if (stacks) {
    const nums = (s: string) => (s.match(/\d+/g) ?? []).map(Number);
    const counts = nums(stacks[1]);
    const rawValues = nums(stacks[2]);
    if (counts.length !== rawValues.length || counts.length < 2) return null;
    const values: number[] = [];
    for (const rv of rawValues) {
      const v = numeratorOf(String(rv), den);
      if (v === null) return null;
      values.push(v);
    }
    return { kind: "marks", values, counts };
  }
  // "above 5, 6, 7, and 8 inches are 2, 5, 3, and 1 Xs" / "…inches have 2, 4, 3, and 1 Xs" /
  // "The counts above 2, 3, 4, and 5 inches are 1, 4, 2, and 3." — the g2g family's values-first
  // sentence (the mirror of the "stacks"/counts-first shape above). Values always come first,
  // counts second; the trailing "Xs" word is optional (g2g-01-05/rem-g2g-mode-k's phrasing omits
  // it and ends the clause on the bare count list instead).
  const inchesAreHave = /above ([\d,\sand]+?) inches (?:are|have) ([\d,\sand]+?)(?:\s*Xs)?[.\n]/i.exec(prompt);
  if (inchesAreHave) {
    const nums = (s: string) => (s.match(/\d+/g) ?? []).map(Number);
    const rawValues = nums(inchesAreHave[1]);
    const counts = nums(inchesAreHave[2]);
    if (counts.length !== rawValues.length || counts.length < 2) return null;
    const values: number[] = [];
    for (const rv of rawValues) {
      const v = numeratorOf(String(rv), den);
      if (v === null) return null;
      values.push(v);
    }
    return { kind: "marks", values, counts };
  }
  // "The record is 4, 4, 5." — g2g-01-03/k3's raw-measurement-list sentence. A tally of the
  // listed values, exactly the same tally dd-02-01/i1's own dedicated route computes from its
  // (external, lesson-body) raw list — here the list is stated directly IN THIS WIDGET'S OWN
  // prompt, so it belongs in the general reader rather than a one-off external route. Raw
  // integers only (no fraction labels in this notation), so only meaningful at den === 1.
  const recordIs = /record is ([\d,\s]+?)\./i.exec(prompt);
  if (recordIs && den === 1) {
    const nums = (recordIs[1].match(/\d+/g) ?? []).map(Number);
    if (nums.length >= 2) {
      const tally = new Map<number, number>();
      for (const n of nums) tally.set(n, (tally.get(n) ?? 0) + 1);
      const values = [...tally.keys()].sort((a, b) => a - b);
      const counts = values.map((v) => tally.get(v)!);
      return { kind: "marks", values, counts };
    }
  }
  // "3 x's above the number 5 and 1 x above the number 6" — mmt-05-03's line-plot-narration
  // sentence (S316 Lane B). Count first, value second, joined by "and"; NO "inches" suffix,
  // which is what distinguishes it from the g2g "stacks of … x's above … inches" shape above.
  const aboveNumber = [...prompt.matchAll(/(\d+)\s+x'?s?\s+above(?:\s+the\s+number)?\s+(\d+(?:\/\d+)?)/gi)];
  if (aboveNumber.length >= 2) {
    const values: number[] = [];
    const counts: number[] = [];
    for (const m of aboveNumber) {
      const v = numeratorOf(m[2], den);
      if (v === null) return null;
      values.push(v);
      counts.push(Number(m[1]));
    }
    return { kind: "marks", values, counts };
  }
  // "(2 → 3 X's, 2½ → 1 X, 3 → 4 X's)" — md-03-04's authored arrow-with-count sentence.
  const arrowCount = [...prompt.matchAll(/(\d*½|\d+(?:\/\d+)?)\s*(?:→|->)\s*(\d+)\s*X/g)];
  if (arrowCount.length >= 2) {
    const values: number[] = [];
    const counts: number[] = [];
    for (const m of arrowCount) {
      const v = numeratorOf(m[1], den);
      if (v === null) return null;
      values.push(v);
      counts.push(Number(m[2]));
    }
    return { kind: "marks", values, counts };
  }
  // "2 (4 X's), 2½ (2 X's), …" — md-03-04/ch1 and the regenerated halfMarks sentence.
  // AFTER the ft-paren pattern above, which owns the "1/4 ft (2 X's)" shape.
  const bareParen = [...prompt.matchAll(/(\d*½|\d+)\s*\((\d+)\s*X/g)];
  if (bareParen.length >= 2) {
    const values: number[] = [];
    const counts: number[] = [];
    for (const m of bareParen) {
      const v = numeratorOf(m[1], den);
      if (v === null) return null;
      values.push(v);
      counts.push(Number(m[2]));
    }
    return { kind: "marks", values, counts };
  }
  // "3 marks at 1/2, 1 mark at 5/8, and 1 mark at 3/4" — mc-05-02's unit-less sentence, and
  // the regenerated mcLinePlotBuildNumeric one. AFTER the ft variant, which owns "at 1/4 ft".
  const atMarksBare = [...prompt.matchAll(/(\d+)\s*marks?\s+at\s+(\d*½|\d+(?:\/\d+)?)/g)];
  if (atMarksBare.length >= 2) {
    const values: number[] = [];
    const counts: number[] = [];
    for (const m of atMarksBare) {
      const v = numeratorOf(m[2], den);
      if (v === null) return null;
      values.push(v);
      counts.push(Number(m[1]));
    }
    return { kind: "marks", values, counts };
  }
  // "3 X's at 2½" — the regenerated default/totalCount sentence, count first.
  const xAt = [...prompt.matchAll(/(\d+)\s*X's at\s+(\d*½|\d+(?:\/\d+)?)/g)];
  if (xAt.length >= 2) {
    const values: number[] = [];
    const counts: number[] = [];
    for (const m of xAt) {
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
 * own denominator. Null when the prompt is not one of the shapes whose answer the plot fixes.
 *
 * Order matters where sentences share words: the S238 shapes that read a COUNT of marks
 * ("or longer", "measured N foot", "in all", split-equally) are matched before the generic
 * total-length shape, because their prompts must never fall through to a Σ value×count. */
function answerFromPlot(prompt: string, plot: TPlotData): number | null {
  const den = plot.denominator ?? 1;
  const present = plot.values.filter((_, i) => plot.counts[i] > 0);
  if (/how much longer is the longest/i.test(prompt)) {
    if (present.length < 2) return null;
    return present[present.length - 1] - present[0];
  }
  // "How many ribbons measured 3/4 foot OR LONGER?" / "How many measurements are 1/2 ft or
  // longer?" — a COUNT of X's at or above the stated threshold.
  const thresh = /(\d+(?:\/\d+)?)\s*(?:foot|ft)\s+or longer/i.exec(prompt);
  if (thresh) {
    const t = numeratorOf(thresh[1], den);
    if (t === null) return null;
    return plot.counts.reduce((s, c, i) => (plot.values[i] >= t ? s + c : s), 0);
  }
  // "how many items measured 1 foot?" — the COUNT of X's at exactly that mark.
  const atValue = /measured (\d+(?:\/\d+)?)\s*(?:foot|ft)\?/i.exec(prompt);
  if (atValue) {
    const t = numeratorOf(atValue[1], den);
    if (t === null) return null;
    const i = plot.values.indexOf(t);
    return i === -1 ? null : plot.counts[i];
  }
  // "How many measurements land on HALF-unit marks?" / "…measured a HALF-inch length
  // (ending in ½)?" — the COUNT of marks at non-whole positions (md-03-04/ch1, halfMarks).
  if (/HALF-unit marks|HALF-inch length/i.test(prompt)) {
    return plot.counts.reduce((s, c, i) => (plot.values[i] % den !== 0 ? s + c : s), 0);
  }
  // "A line plot must contain N data marks. … How many marks are still missing?" — the
  // regenerated mcLinePlotBuildNumeric shape: the stated total minus every drawn mark.
  const mustContain = /must contain (\d+) data marks/i.exec(prompt);
  if (mustContain && /still missing/i.test(prompt)) {
    return Number(mustContain[1]) - plot.counts.reduce((s, c) => s + c, 0);
  }
  // "(Count the dots above 2.)" — the COUNT of marks at exactly that value (dd-02-01/i1,
  // the dot-glyph row). Before the generic shapes for the same reason as the others.
  const dotsAbove = /count the dots above (\d+(?:\/\d+)?)/i.exec(prompt);
  if (dotsAbove) {
    const t = numeratorOf(dotsAbove[1], den);
    if (t === null) return null;
    const i = plot.values.indexOf(t);
    return i === -1 ? null : plot.counts[i];
  }
  // "How many data points are at 5?" — mmt-05-03's line-plot question (S316 Lane B): the COUNT
  // of marks at exactly that value.
  const dataPointsAt = /how many data points are at (\d+(?:\/\d+)?)\?/i.exec(prompt);
  if (dataPointsAt) {
    const t = numeratorOf(dataPointsAt[1], den);
    if (t === null) return null;
    const i = plot.values.indexOf(t);
    return i === -1 ? null : plot.counts[i];
  }
  // "how many ribbons were measured in all?" / "How many measurements are shown in all?" —
  // the COUNT of X's on the whole plot.
  if (/in all/i.test(prompt)) return plot.counts.reduce((s, c) => s + c, 0);
  // "split equally among the 4 cups, how much is in each?" — the plot's total, divided.
  const split = /split equally among the (\d+) cups/i.exec(prompt);
  if (split) {
    const n = Number(split[1]);
    if (n < 1) return null;
    return plot.values.reduce((s, v, i) => s + v * plot.counts[i], 0) / n;
  }
  // "which length is MOST common?" / "Which measurement is most common?" / "Which measurement is
  // UNDER THE TALLEST STACK?" (g2g-01-05/rem-g2g-mode-k's phrasing) — all the same mode's VALUE,
  // demanding a unique tallest stack (a tie would make the authored answer unfixable).
  if (/most common/i.test(prompt) || /tallest stack/i.test(prompt)) {
    const max = Math.max(...plot.counts);
    if (plot.counts.filter((c) => c === max).length !== 1) return null;
    return plot.values[plot.counts.indexOf(max)];
  }
  if (/total length/i.test(prompt) || /what is the numerator/i.test(prompt))
    return plot.values.reduce((s, v, i) => s + v * plot.counts[i], 0);
  return null;
}

/** For an MCQ in this family, the LABEL the plot-derived answer must appear as: the mode's or
 * total's axis label, formatted by the ONE shared formatter, so "6" or "1/2" or "2". The correct
 * option's label must BEGIN with it (labels carry units and rationale tails: "1/2 ft",
 * "6 inches — its stack is tallest"). Boundary-guarded so "6" can never match "60 inches". */
function mcqAnswerLabelFromPlot(prompt: string, plot: TPlotData): string | null {
  const units = answerFromPlot(prompt, plot);
  if (units === null || !Number.isInteger(units)) return null;
  return dotPlotLabel(units, plot.denominator, plot.labelStyle);
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
  it("is declared on exactly the 24 measured steps of the inline-dataset family", () => {
    // S237 wired vm-02-02's four graded steps; S238 extended the field to mcq and wired the
    // rest of the READY family (S237 handover §3.2): vm-02-01 whole, the three g2g mode checks,
    // g2g-03-03's, and vm-02-02's two stragglers (i2, rem-lo-k). The S238 wave-9 rulings
    // (2026-08-12) then closed the family: dd-02-01/i1 (glyph "dot" — its prose SAYS dots),
    // md-03-04's three (labelStyle "mixed" — its prose writes "2½", never "5/2"), and
    // mc-05-02/k2 (its marks reordered to ascend, the axis's own requirement). The ONE row
    // still absent is a decision, not drift: dd-02-01/k2 stays excluded by the mcq LEAKAGE
    // policy — its options ARE datasets, so drawing the dataset would print the answer —
    // regardless of glyph. S316 Lane B then wired mmt-05-03's four bare-numeric line-plot
    // steps (i1, k1, i3, k3), each extended to a truthful 2-stack `plotData` — bringing the
    // family to 23. A follow-up pass then found g2g-01-03/k3 already carrying a truthful,
    // pre-existing `plotData` block ("The record is 4, 4, 5…") that had never been added to
    // this allowlist or given its own independent verification route (both added below), and
    // removed the two mmt-05-03 `variant` declarations (k1, k3) whose generator could not
    // regenerate the plot it was paired with (see the "variant-bearing" list's own comment) —
    // bringing the family to 24, all four mmt-05-03 rows now static.
    expect(declared.map((d) => `${d.lesson}/${d.step}`).sort()).toEqual([
      "dd-02-01/i1",
      "g2g-01-03/k3",
      "g2g-01-05/k1",
      "g2g-01-05/k3",
      "g2g-01-05/rem-g2g-mode-k",
      "g2g-03-03/k3",
      "mc-05-02/k2",
      "md-03-04/ch1",
      "md-03-04/k1",
      "md-03-04/k2",
      "mmt-05-03/i1",
      "mmt-05-03/i3",
      "mmt-05-03/k1",
      "mmt-05-03/k3",
      "vm-02-01/ch1",
      "vm-02-01/k1",
      "vm-02-01/k2",
      "vm-02-01/rem-rl-k",
      "vm-02-02/ch1",
      "vm-02-02/i2",
      "vm-02-02/k1",
      "vm-02-02/k2",
      "vm-02-02/k3",
      "vm-02-02/rem-lo-k"
    ]);
  });

  // dd-02-01/i1's prompt REFERENCES the plot ("In the pets dot plot…") rather than stating it —
  // that absent diagram is the defect the wiring fixes — so its dataset is derived from the
  // lesson's OWN c1 sentence instead, by a dedicated two-route test below.
  const STATED_IN_LESSON_BODY = new Set(["dd-02-01/i1"]);

  it("every declared plot agrees with its OWN prompt, mark for mark and X for X", () => {
    for (const d of declared) {
      if (STATED_IN_LESSON_BODY.has(`${d.lesson}/${d.step}`)) continue;
      expect(disagreements(String(d.w.prompt), d.plot), `${d.lesson}/${d.step}`).toEqual([]);
    }
  });

  it("dd-02-01/i1 draws the pets plot c1 states — raw-list tally and stated heights agree", () => {
    // TWO independent routes through the frozen c1 sentence "The pets data 0,1,1,2,2,2,3,4
    // becomes stacks of height 1,2,3,1,1": tally the raw list, and read the stated heights.
    // Both must agree with each other AND with the declared plot — a transposed stack fails
    // twice.
    const lesson = allLessons().find((l) => l.id === "dd-02-01")!;
    const c1 = lesson.steps.find((s) => s.id === "c1") as unknown as { body: string };
    const m = /pets data ([\d,]+) becomes stacks of height ([\d,]+)/.exec(c1.body);
    expect(m, "c1 no longer states the pets dataset — the derivation route is broken").not.toBeNull();
    const raw = m![1].split(",").map(Number);
    const stated = m![2].split(",").map(Number);
    const tally = new Map<number, number>();
    for (const v of raw) tally.set(v, (tally.get(v) ?? 0) + 1);
    const values = [...tally.keys()].sort((a, b) => a - b);
    expect(values.map((v) => tally.get(v)!), "c1's own two statements disagree").toEqual(stated);
    const d = declared.find((x) => x.lesson === "dd-02-01" && x.step === "i1")!;
    expect(d.plot.values).toEqual(values);
    expect(d.plot.counts).toEqual(stated);
    // …and the near-identical rejection: a plot with one stack transposed must disagree.
    expect([...d.plot.counts].reverse()).not.toEqual(stated);
  });

  it('the glyph is "dot" exactly where the prose says dots, and absent everywhere else', () => {
    for (const d of declared) {
      const expected = STATED_IN_LESSON_BODY.has(`${d.lesson}/${d.step}`) ? "dot" : undefined;
      expect(d.plot.glyph, `${d.lesson}/${d.step}`).toBe(expected);
    }
  });

  it('labelStyle is "mixed" exactly where the prose writes mixed numbers, absent everywhere else', () => {
    // md-03-04's frozen prompts write "2½"; every other wired row's prose writes improper or
    // whole values, which the default formatter already matches.
    for (const d of declared) {
      const expected = d.lesson === "md-03-04" ? "mixed" : undefined;
      expect(d.plot.labelStyle, `${d.lesson}/${d.step}`).toBe(expected);
    }
  });

  it("the drawn plot is the dataset the FROZEN ANSWER comes from", () => {
    for (const d of declared) {
      if (d.w.type === "mcq") continue; // the mcq direction has its own label check below
      const den = d.plot.denominator ?? 1;
      const fromPlot = answerFromPlot(String(d.w.prompt), d.plot);
      expect(fromPlot, `${d.lesson}/${d.step}: no answer shape recognised`).not.toBeNull();
      expect(fromPlot, `${d.lesson}/${d.step}: the drawn plot implies a different answer`).toBe(
        authoredAnswerInUnits(d.w, den)
      );
    }
  });

  // g2g-01-03/k3 asks WHICH STACKS MATCH the record — its correct answer is a whole multi-stack
  // SHAPE, not the single derived number every other mcq row here fixes (a mode, a total, a
  // count-at-value). `mcqAnswerLabelFromPlot` only ever returns one such number, so this row is
  // verified separately, below, by its own dedicated independent route.
  const MULTI_STACK_MCQ = new Set(["g2g-01-03/k3"]);

  it("for the mcq rows, the CORRECT OPTION states the value the drawn plot fixes", () => {
    // The mcq analog of the frozen-answer check: the plot must be the dataset the keyed option
    // comes from. The label check is boundary-guarded — "6" must match "6 inches", never "60".
    let checked = 0;
    for (const d of declared) {
      if (d.w.type !== "mcq") continue;
      if (MULTI_STACK_MCQ.has(`${d.lesson}/${d.step}`)) continue;
      const label = mcqAnswerLabelFromPlot(String(d.w.prompt), d.plot);
      expect(label, `${d.lesson}/${d.step}: no answer shape recognised`).not.toBeNull();
      const options = d.w.options as Array<{ label: string; correct?: boolean }>;
      const correct = options.find((o) => o.correct);
      expect(correct, `${d.lesson}/${d.step}: no keyed option`).toBeDefined();
      expect(
        correct!.label === label || correct!.label.startsWith(`${label} `),
        `${d.lesson}/${d.step}: the plot fixes "${label}" but the keyed option reads "${correct!.label}"`
      ).toBe(true);
      checked++;
    }
    expect(checked).toBe(7);
  });

  it("g2g-01-03/k3: the KEYED option's stacks match the drawn plot, and every other listed option's do not — verified by direct stack-for-stack comparison, never by reading the prompt's own 'record is' list", () => {
    // Independent of `plotStatedIn`/the "record is" reader used above: this route parses each
    // OPTION's own label text ("Two Xs at 4; one at 5") into a {value → count} map using a
    // number-WORD vocabulary (never digits — the options never spell counts as digits, so this
    // route cannot degenerate into the same digit-matching the disagreements test already does),
    // then compares that map directly, entry-for-entry, against the plot's OWN {value → count}
    // map. This is "count matching stacks by direct comparison": it never reads what the PROMPT
    // states, only what the DRAWN PLOT and the OPTION TEXT each independently say.
    const d = declared.find((x) => x.lesson === "g2g-01-03" && x.step === "k3");
    expect(d, "g2g-01-03/k3 must be present in the declared corpus").toBeDefined();
    expect(d!.w.type).toBe("mcq");

    const WORD_TO_COUNT: Record<string, number> = {
      none: 0, zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10
    };
    function stacksFromOptionLabel(label: string): Map<number, number> | null {
      const clauses = [...label.matchAll(/\b(none|zero|one|two|three|four|five|six|seven|eight|nine|ten)\b(?:\s+Xs?)?\s+at\s+(\d+)/gi)];
      if (clauses.length < 2) return null;
      const m = new Map<number, number>();
      for (const c of clauses) {
        const count = WORD_TO_COUNT[c[1].toLowerCase()];
        if (count === undefined) return null;
        m.set(Number(c[2]), count);
      }
      return m;
    }
    function sameStacks(a: Map<number, number>, b: Map<number, number>): boolean {
      if (a.size !== b.size) return false;
      for (const [v, c] of a) if (b.get(v) !== c) return false;
      return true;
    }

    const plotStacks = new Map(d!.plot.values.map((v, i) => [v, d!.plot.counts[i]]));
    const options = d!.w.options as Array<{ id: string; label: string; correct?: boolean }>;
    let matching = 0;
    for (const opt of options) {
      const parsed = stacksFromOptionLabel(opt.label);
      expect(parsed, `g2g-01-03/k3 option ${opt.id}: no word-count "at V" clauses found in "${opt.label}"`).not.toBeNull();
      const matches = sameStacks(parsed!, plotStacks);
      if (matches) matching++;
      expect(
        matches,
        `g2g-01-03/k3 option ${opt.id} (correct=${!!opt.correct}): parsed stacks ${JSON.stringify([...parsed!])} vs drawn plot ${JSON.stringify([...plotStacks])}`
      ).toBe(!!opt.correct);
    }
    expect(matching, "exactly one option's stacks must match the drawn plot").toBe(1);
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
      } else if (d.w.type === "mcq") {
        // Grading reads option ids alone; the field must not have disturbed the key.
        const options = d.w.options as Array<{ label: string; correct?: boolean; feedback: string }>;
        expect(options.filter((o) => o.correct).length, `${d.lesson}/${d.step}`).toBe(1);
        for (const o of options) expect(o.feedback.length, `${d.lesson}/${d.step}`).toBeGreaterThanOrEqual(25);
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
  type PlotWidget = Extract<TWidget, { type: "numeric" | "fractionEntry" | "mcq" }>;
  // Only the steps that can regenerate carry the obligation; the remedials and the two
  // variant-less steps are pinned BY NAME so a variant added later fails loudly here and
  // forces the generator to take the plot with it.
  const withVariant = declared.filter((d) => d.variant !== undefined);
  const withoutVariant = declared.filter((d) => d.variant === undefined);

  it("exactly the 11 variant-bearing steps regenerate; the 13 static rows are the ones expected", () => {
    // S316 Lane B initially added mmt-05-03/k1 and /k3 as variant-bearing (paired with a
    // `g2-measure-money-time`/`MmtLinePlotNumeric` variant) and /i1 and /i3 as static. That
    // generator's shared `num()` builder (src/lib/g2Variants.ts:59) never emits `plotData`, so a
    // variant-bearing plotData step there could never regenerate WITH its plot — a silent
    // mismatch on every re-ask. The `variant` key was removed from k1 and k3 (content change,
    // logged as generator debt for a future forms author to give MmtLinePlotNumeric a real
    // multi-stack plotData-emitting form), so all four mmt-05-03 rows are now static, and the
    // variant-bearing count is back to its original 11. g2g-01-03/k3 (also static — no
    // `variant`) was newly added to the corpus contract, bringing static from 8 to 13.
    expect(withVariant.map((d) => `${d.lesson}/${d.step}`).sort()).toEqual([
      "mc-05-02/k2",
      "md-03-04/ch1",
      "md-03-04/k1",
      "md-03-04/k2",
      "vm-02-01/ch1",
      "vm-02-01/k1",
      "vm-02-01/k2",
      "vm-02-02/ch1",
      "vm-02-02/k1",
      "vm-02-02/k2",
      "vm-02-02/k3"
    ]);
    expect(withoutVariant.map((d) => `${d.lesson}/${d.step}`).sort()).toEqual([
      "dd-02-01/i1",
      "g2g-01-03/k3",
      "g2g-01-05/k1",
      "g2g-01-05/k3",
      "g2g-01-05/rem-g2g-mode-k",
      "g2g-03-03/k3",
      "mmt-05-03/i1",
      "mmt-05-03/i3",
      "mmt-05-03/k1",
      "mmt-05-03/k3",
      "vm-02-01/rem-rl-k",
      "vm-02-02/i2",
      "vm-02-02/rem-lo-k"
    ]);
  });

  it("each variant-bearing step regenerates WITH a plot that agrees with its regenerated prompt", () => {
    for (const d of withVariant) {
      let seen = 0;
      for (let i = 0; i < SEEDS; i++) {
        const v = variantForStep(
          { widget: { type: d.w.type as string }, variant: d.variant! },
          `plot:${d.lesson}:${d.step}:${i}`
        );
        expect(v, `${d.lesson}/${d.step}: generator declined seed ${i}`).not.toBeNull();
        const w = WidgetSpec.parse(v!.widget) as PlotWidget;
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
    for (const d of withVariant) {
      for (let i = 0; i < SEEDS; i++) {
        const v = variantForStep(
          { widget: { type: d.w.type as string }, variant: d.variant! },
          `plotans:${d.lesson}:${d.step}:${i}`
        )!;
        const w = WidgetSpec.parse(v.widget) as PlotWidget;
        if (w.type === "mcq") {
          // The regenerated mcq's KEYED OPTION must state the value the regenerated plot fixes —
          // the same label check the authored rows pass, applied across the seed sweep.
          const label = mcqAnswerLabelFromPlot(w.prompt, w.plotData!);
          expect(label, `${d.lesson}/${d.step} seed ${i}: ${w.prompt}`).not.toBeNull();
          const correct = w.options.find((o) => o.correct)!;
          expect(
            correct.label === label || correct.label.startsWith(`${label} `),
            `${d.lesson}/${d.step} seed ${i}: plot fixes "${label}", keyed option reads "${correct.label}"`
          ).toBe(true);
          continue;
        }
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
    for (const d of withVariant) {
      const seen = new Set<string>();
      for (let i = 0; i < SEEDS; i++) {
        const v = variantForStep(
          { widget: { type: d.w.type as string }, variant: d.variant! },
          `plotfresh:${d.lesson}:${d.step}:${i}`
        )!;
        const w = v.widget as PlotWidget;
        seen.add(JSON.stringify(w.plotData));
      }
      expect(seen.size, `${d.lesson}/${d.step}: the plot ignores the seed`).toBeGreaterThan(3);
    }
  });

  it("k3's regenerated widget keeps its live ?/4 preview as well as its plot", () => {
    // Found by READING the printed output: vm-02-02/k3 carries `previewDenominator: 4`, but the
    // generator that rebuilds it on a re-ask did not, so the live "what you just typed" bar
    // vanished the moment the learner asked for a fresh one. Both display fields must survive.
    const k3 = declared.find((d) => d.lesson === "vm-02-02" && d.step === "k3")!;
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
    for (const d of withVariant) {
      const call = () =>
        (variantForStep({ widget: { type: d.w.type as string }, variant: d.variant! }, `plotdet:${d.step}`)!
          .widget as PlotWidget).plotData;
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

  it("reads the generator's \"N ft (C X's)\" sentence — and REJECTS a single mark (S238)", () => {
    expect(
      plotStatedIn("A line plot shows 1/4 ft (2 X's), 1/2 ft (3 X's), 3/4 ft (1 X), 1 ft (2 X's). Which length is most common?", 4)
    ).toEqual({ kind: "marks", values: [1, 2, 3, 4], counts: [2, 3, 1, 2] });
    expect(plotStatedIn("A line plot shows 1/2 ft (3 X's). Which length is most common?", 4)).toBeNull();
  });

  it("reads the g2g \"stacks of … x's above …\" sentence — and REJECTS unpaired lists (S238)", () => {
    expect(
      plotStatedIn("A line plot shows stacks of 2, 5, 3, and 1 x's above 5, 6, 7, and 8 inches. Which measurement is most common?", 1)
    ).toEqual({ kind: "marks", values: [5, 6, 7, 8], counts: [2, 5, 3, 1] });
    // Three counts against four values is a sentence that states no drawable dataset: pairing
    // them off by position would silently invent a stack.
    expect(
      plotStatedIn("A line plot shows stacks of 2, 5, and 1 x's above 5, 6, 7, and 8 inches. Which measurement is most common?", 1)
    ).toBeNull();
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
