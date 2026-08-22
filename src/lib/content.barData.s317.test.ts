/* S317 — the corpus contract for the display-only `barData` block.
 *
 * THE DEFECT (`reports/closure/S316_LANEB_MEASUREMENT_DATA_ASSESSMENT.md`). `md-03-02` (Scaled
 * Bar Graphs) and `md-03-03` (Asking the Graph Questions) narrate specific bar-graph category and
 * value data in prose — "A bar graph shows: dogs 8, cats 6, fish 3, birds 5" — and render nothing:
 * `plotData` covers line/dot plots, but no schema field let a `numeric`, `mcq`, `matchPairs`,
 * `dragOrder`, or `dragBucket` step draw the bar chart its own prompt already describes. The only
 * figure in either lesson was the generic, non-data-synced `md3-bargraph` SVG on the concept steps.
 *
 * WHAT THIS GATE PINS, modelled on `content.plotData.s237.test.ts`:
 *
 *   1. EXACTLY the measured set declares the field — a step deleted, a location added without a
 *      decision, a lesson reworded — fails loudly here instead of silently changing feature size.
 *   2. THE CHART IS THE GRADED (OR TRUE-STATEMENT) DATASET. Every declared step's answer/verdict
 *      is RE-DERIVED from the drawn `barData` alone, by a route that never reads the authored
 *      `answer`/`correct` fields — reading the PROMPT's own words to decide which categories the
 *      question is about, then computing purely from `barData.values`. A transposed value or a
 *      swapped category fails here even if the prose were transcribed identically.
 *   3. DISPLAY ONLY. Declaring it left the answer, the tolerance, and every trap untouched.
 *   4. THE REST OF THE CORPUS DRAWS NOTHING. The regression guard for every other step.
 *
 * EVERY REJECTION IS PAIRED WITH A NEAR-IDENTICAL ACCEPTANCE, mirroring the plotData gate's
 * discipline: a derivation route that always returns null, or an equality check that never
 * disagrees, would pass a gate written only in the positive direction.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { barDataParts, widgetIntegrityErrors, WidgetSpec, type TWidget, type TBarData } from "./schema";
import { describeWidgetState } from "./describeState";

const COURSES = join(process.cwd(), "content", "courses");

type Step = { id: string; widget?: Record<string, unknown> };
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

const declared = allLessons().flatMap((l) =>
  everyStep(l)
    .filter((s) => s.widget?.barData !== undefined)
    .map((s) => ({
      lesson: l.id,
      step: s.id,
      w: s.widget as Record<string, unknown>,
      bar: s.widget!.barData as TBarData
    }))
);

/* ------------------------------------------------------------------ *
 * The independent route: find the category (or categories) a PROMPT
 * names, and derive the answer from `barData.values` alone.
 * ------------------------------------------------------------------ */

/** Case-insensitive: does `text` contain `category` as a substring? Category labels in this
 * corpus are always distinct enough (see the "no two categories collide" test below) that a
 * substring match cannot pick the wrong one. */
function valueOf(bar: TBarData, category: string): number | null {
  const i = bar.categories.findIndex((c) => c.toLowerCase() === category.toLowerCase());
  return i === -1 ? null : bar.values[i];
}

/** Re-derives the numeric answer a `numeric` step's own prompt demands, computed ONLY from
 * `bar.values` — never from the authored `answer` field. Returns null when the prompt is not one
 * of the shapes this route recognises (a rejection, not a skip). */
function answerFromBarData(prompt: string, bar: TBarData): number | null {
  // "How many MORE <a> than <b>?" / "how many MORE votes does <a> have than <b>?" — a gap.
  const moreHave = /how many more \S+ does (.+?) have than (.+?)\?/i.exec(prompt);
  if (moreHave) {
    const a = valueOf(bar, moreHave[1].trim());
    const b = valueOf(bar, moreHave[2].trim());
    return a === null || b === null ? null : a - b;
  }
  const moreThan = /how many more (\w+) than (\w+)\?/i.exec(prompt);
  if (moreThan) {
    const a = valueOf(bar, moreThan[1].trim());
    const b = valueOf(bar, moreThan[2].trim());
    return a === null || b === null ? null : a - b;
  }
  // "How many <unit> in ALL?" — the sum of every drawn bar.
  if (/\bin ALL\?/.test(prompt)) return bar.values.reduce((s, v) => s + v, 0);
  // "<a> and <b> TOGETHER?" — the sum of the two named bars.
  const together = /(\w+) and (\w+) TOGETHER\?/i.exec(prompt);
  if (together) {
    const a = valueOf(bar, together[1].trim());
    const b = valueOf(bar, together[2].trim());
    return a === null || b === null ? null : a + b;
  }
  // "How many MORE votes did the games (<a> + <b>) get than the playground (<c> + <d>)?" —
  // a difference of two GROUP sums, each group a parenthesised "+"-joined category list.
  const groupCompare = /\(([^)]+)\) get than the playground \(([^)]+)\)\?/i.exec(prompt);
  if (groupCompare) {
    const sumGroup = (raw: string): number | null => {
      const names = raw.split("+").map((s) => s.trim());
      let total = 0;
      for (const n of names) {
        const v = valueOf(bar, n);
        if (v === null) return null;
        total += v;
      }
      return total;
    };
    const g1 = sumGroup(groupCompare[1]);
    const g2 = sumGroup(groupCompare[2]);
    return g1 === null || g2 === null ? null : g1 - g2;
  }
  return null;
}

/** For a boolean/tie-style `mcq` or `dragBucket` claim about a bar chart, checks the claim
 * directly against `bar.values` — never against the authored `correct`/`bucketId` field. Returns
 * null when the claim shape is not recognised. */
function claimTrueFromBarData(claim: string, bar: TBarData): boolean | null {
  // "<a> and <b> tie" — equal values.
  const tie = /(\w+) and (\w+) tie/i.exec(claim);
  if (tie) {
    const a = valueOf(bar, tie[1]);
    const b = valueOf(bar, tie[2]);
    return a === null || b === null ? null : a === b;
  }
  // "<a> are the most popular" / "<a> beat <b>" — comparisons against the rest / another bar.
  const mostPopular = /(\w+) (?:are|is) the most popular/i.exec(claim);
  if (mostPopular) {
    const a = valueOf(bar, mostPopular[1]);
    if (a === null) return null;
    return a === Math.max(...bar.values);
  }
  const beats = /(\w+) beat (\w+)/i.exec(claim);
  if (beats) {
    const a = valueOf(bar, beats[1]);
    const b = valueOf(bar, beats[2]);
    return a === null || b === null ? null : a > b;
  }
  // "Four fruits means four votes" / "N <plural> means N votes" — false unless the category
  // count equals the value sum (it never does for this corpus's authored rows).
  const countMeansVotes = /means \w+ votes/i.exec(claim);
  if (countMeansVotes) return bar.categories.length === bar.values.reduce((s, v) => s + v, 0);
  return null;
}

describe("barData — the corpus contract", () => {
  it("is declared on exactly the 9 measured steps of the measurement-data ch3 bar-graph family", () => {
    // S317 wired the two `measurement-data` lessons the S316 Lane B assessment named:
    // md-03-02 (Scaled Bar Graphs: i1, k1, i2, ch1 — k2 excluded, see below) and md-03-03 (Asking
    // the Graph Questions: k1, k2, i2, k3, ch1, all five named steps).
    expect(declared.map((d) => `${d.lesson}/${d.step}`).sort()).toEqual([
      "md-03-02/ch1",
      "md-03-02/i1",
      "md-03-02/i2",
      "md-03-02/k1",
      "md-03-03/ch1",
      "md-03-03/i2",
      "md-03-03/k1",
      "md-03-03/k2",
      "md-03-03/k3"
    ]);
  });

  it("valueLabels: exactly md-03-02/i1 and ch1 are \"none\" (the answer-leak the S317 batch-1 independent verifier flagged) — every other declared step keeps \"all\"", () => {
    // S317_BATCH1_VERIFICATION.md's md-03-02 section: `i1` (matchPairs) grades deriving each
    // bar's value from line-count x scale-step, and `ch1` (numeric) grades the un-stated halfway
    // height of Bar B — printing either bar's literal value moots the check it exists to run.
    // Every OTHER declared step's own prompt text already states every value drawn (verified
    // below by an independent numeral-presence scan, not by trusting the flag), so charting the
    // identical numbers there adds no new leak and `valueLabels` is correctly left unset ("all").
    const NONE_MODE = new Set(["md-03-02/i1", "md-03-02/ch1"]);
    for (const d of declared) {
      const key = `${d.lesson}/${d.step}`;
      const flag = (d.bar as { valueLabels?: "all" | "none" }).valueLabels ?? "all";
      expect(flag, key).toBe(NONE_MODE.has(key) ? "none" : "all");
    }
    // Independent cross-check for the "all" set: every value the chart draws is already a numeral
    // written somewhere else in the step's own widget text (its `prompt`, or — for i2's dragOrder
    // — its item labels), so restating it on a synced chart cannot be a NEW leak. Deliberately
    // strips `barData` itself out of the haystack first: searching the un-stripped widget would
    // trivially "find" every value inside its own barData block and pass vacuously.
    for (const d of declared) {
      const key = `${d.lesson}/${d.step}`;
      if (NONE_MODE.has(key)) continue;
      const { barData: _barData, ...withoutBarData } = d.w;
      const haystack = JSON.stringify(withoutBarData);
      for (const v of d.bar.values) {
        const asWritten = String(v);
        expect(haystack.includes(asWritten), `${key}: value ${asWritten} is not already written anywhere outside barData — "all" mode may be leaking it`).toBe(true);
      }
    }
  });

  it("md-03-02/k2 is DELIBERATELY excluded — its step narrates only ONE bar, below the 2-bar schema floor", () => {
    // The S316 contract lists k2 ("the soccer bar stops exactly halfway between the 4-line and
    // the 6-line") among the steps needing a figure, but its own step narrates no second
    // category — inventing a companion bar to satisfy BarDataSpec's `min(2)` would not be
    // "truthful" data drawn from what THIS step states. Fail-closed rather than fabricated.
    const lesson = allLessons().find((l) => l.id === "md-03-02")!;
    const k2 = lesson.steps.find((s) => s.id === "k2")! as unknown as { widget: { prompt: string; barData?: unknown } };
    expect(k2.widget.barData).toBeUndefined();
    // Confirms the reason still holds: exactly one NAMED bar ("the soccer bar") in the prompt —
    // "a bar graph's scale" is the graph itself, not a second data bar.
    const namedBars = new Set((k2.widget.prompt.match(/\bthe (\w+) bar\b/gi) ?? []).map((s) => s.toLowerCase()));
    expect(namedBars.size, "if this step now names a second bar, k2 should be re-evaluated for barData").toBe(1);
  });

  it("no two categories in any declared barData collide under case-insensitive comparison", () => {
    // A precondition for `valueOf`'s substring/equality lookups below: if two categories were
    // spelled the same (case aside), the independent route could silently pick the wrong one.
    for (const d of declared) {
      const lower = d.bar.categories.map((c) => c.toLowerCase());
      expect(new Set(lower).size, `${d.lesson}/${d.step}`).toBe(lower.length);
    }
  });

  it("every declared barData is drawable, and passes the shared integrity rules", () => {
    for (const d of declared) {
      const spec = WidgetSpec.parse(d.w) as TWidget;
      expect(widgetIntegrityErrors(spec), `${d.lesson}/${d.step}`).toEqual([]);
      const parts = barDataParts({ barData: d.bar });
      expect(parts, `${d.lesson}/${d.step}: declared a chart the renderer would not draw`).not.toBeNull();
      expect(parts!.categories).toEqual(d.bar.categories);
      expect(parts!.values).toEqual(d.bar.values);
    }
  });

  it("numeric steps: the drawn chart is the dataset the FROZEN ANSWER comes from (re-derived, never read)", () => {
    const NUMERIC_STEPS = ["md-03-02/ch1", "md-03-03/k1", "md-03-03/k2", "md-03-03/k3", "md-03-03/ch1"];
    let checked = 0;
    for (const d of declared) {
      const key = `${d.lesson}/${d.step}`;
      if (!NUMERIC_STEPS.includes(key)) continue;
      expect(d.w.type, key).toBe("numeric");
      const fromBar = answerFromBarData(String(d.w.prompt), d.bar);
      expect(fromBar, `${key}: no answer shape recognised in "${d.w.prompt}"`).not.toBeNull();
      expect(fromBar, `${key}: the drawn chart implies a different answer than the authored one`).toBe(d.w.answer);
      checked++;
    }
    expect(checked).toBe(NUMERIC_STEPS.length);
  });

  it("md-03-02/k1 (mcq): the chart's own tallest bar(s) are exactly the tie the correct option names", () => {
    const d = declared.find((x) => x.lesson === "md-03-02" && x.step === "k1")!;
    expect(d.w.type).toBe("mcq");
    const max = Math.max(...d.bar.values);
    const tallest = d.bar.categories.filter((_, i) => d.bar.values[i] === max);
    expect(tallest.sort()).toEqual(["Tue", "Wed"]);
    const options = d.w.options as Array<{ label: string; correct?: boolean }>;
    const correct = options.find((o) => o.correct)!;
    for (const cat of tallest) expect(correct.label, `${cat} must be named in the keyed option`).toContain(cat);
    // Near-identical rejection: a category NOT among the tallest must not be the sole tie member.
    expect(tallest).not.toContain("Mon");
  });

  it("md-03-02/i1 (matchPairs): every left item's matched right VALUE equals the chart's own bar for that item", () => {
    const d = declared.find((x) => x.lesson === "md-03-02" && x.step === "i1")!;
    expect(d.w.type).toBe("matchPairs");
    const left = d.w.left as Array<{ id: string; label: string }>;
    const right = d.w.right as Array<{ id: string; label: string }>;
    const pairs = d.w.pairs as Record<string, string>;
    let checked = 0;
    for (const l of left) {
      // The chart's category IS the left item's own label (authored verbatim), so this is
      // exact-equality, not a fuzzy match — the strongest form of the independent route.
      const barValue = valueOf(d.bar, l.label);
      expect(barValue, `${l.id}: "${l.label}" is not one of the chart's own categories`).not.toBeNull();
      const rightId = pairs[l.id];
      const rightOption = right.find((r) => r.id === rightId)!;
      expect(Number(rightOption.label), `${l.id}: matched option "${rightOption.label}" vs chart value ${barValue}`).toBe(barValue);
      checked++;
    }
    expect(checked).toBe(3);
    // Near-identical rejection: a DELIBERATELY wrong pairing must disagree with the chart.
    expect(Number(right.find((r) => r.id === "v20")!.label)).not.toBe(valueOf(d.bar, "Bar reaching the 2nd line"));
  });

  it("md-03-02/i2 (dragOrder): the authored SHORTEST-to-tallest order matches the chart's own values, sorted", () => {
    const d = declared.find((x) => x.lesson === "md-03-02" && x.step === "i2")!;
    expect(d.w.type).toBe("dragOrder");
    const items = d.w.items as Array<{ id: string; label: string }>;
    const correctOrder = d.w.correctOrder as string[];
    // The chart's own categories ARE the item labels (authored verbatim) — exact equality.
    const byId = new Map(items.map((it) => [it.id, it.label]));
    const orderedValues = correctOrder.map((id) => valueOf(d.bar, byId.get(id)!));
    expect(orderedValues.every((v) => v !== null), "every ordered item must resolve to a chart bar").toBe(true);
    const sorted = [...(orderedValues as number[])].sort((a, b) => a - b);
    expect(orderedValues, "the authored order is not the chart's values sorted ascending").toEqual(sorted);
    // Near-identical rejection: the REVERSE order must not already be ascending (real bars differ).
    expect([...orderedValues].reverse()).not.toEqual(sorted);
  });

  it("md-03-03/i2 (dragBucket): every claim's True/False bucket matches what the chart's own values say", () => {
    const d = declared.find((x) => x.lesson === "md-03-03" && x.step === "i2")!;
    expect(d.w.type).toBe("dragBucket");
    const items = d.w.items as Array<{ id: string; label: string; bucketId: string }>;
    let checked = 0;
    for (const it of items) {
      const truth = claimTrueFromBarData(it.label, d.bar);
      expect(truth, `${it.id}: no claim shape recognised in "${it.label}"`).not.toBeNull();
      expect(truth ? "true" : "false", `${it.id}: "${it.label}"`).toBe(it.bucketId);
      checked++;
    }
    expect(checked).toBe(4);
  });

  it("declaring barData left grading alone — the traps and the answer are untouched", () => {
    for (const d of declared) {
      if (d.w.type === "numeric") {
        expect(d.w.tolerance, `${d.lesson}/${d.step}`).toBe(0);
        for (const t of (d.w.commonErrors ?? []) as Array<{ value: number; feedback: string }>) {
          expect(t.value).not.toBe(d.w.answer);
          expect(t.feedback.length).toBeGreaterThanOrEqual(20);
        }
      } else if (d.w.type === "mcq") {
        const options = d.w.options as Array<{ correct?: boolean; feedback: string }>;
        expect(options.filter((o) => o.correct).length, `${d.lesson}/${d.step}`).toBe(1);
      } else if (d.w.type === "matchPairs") {
        const left = d.w.left as Array<{ id: string }>;
        const pairs = d.w.pairs as Record<string, string>;
        expect(Object.keys(pairs).sort(), `${d.lesson}/${d.step}`).toEqual(left.map((l) => l.id).sort());
      } else if (d.w.type === "dragOrder") {
        const items = d.w.items as Array<{ id: string }>;
        const correctOrder = d.w.correctOrder as string[];
        expect([...correctOrder].sort(), `${d.lesson}/${d.step}`).toEqual(items.map((i) => i.id).sort());
      } else if (d.w.type === "dragBucket") {
        const items = d.w.items as Array<{ bucketId: string }>;
        const buckets = new Set((d.w.buckets as Array<{ id: string }>).map((b) => b.id));
        for (const it of items) expect(buckets.has(it.bucketId), `${d.lesson}/${d.step}`).toBe(true);
      }
    }
  });

  it("no step outside the declared set acquired a barData — the whole-corpus guard", () => {
    let checked = 0;
    for (const l of allLessons()) {
      for (const s of everyStep(l)) {
        if (!s.widget || s.widget.barData !== undefined) continue;
        expect(barDataParts(s.widget as { barData?: TBarData }), `${l.id}/${s.id}`).toBeNull();
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(10000);
  });
});

/* ------------------------------------------------------------------ *
 * The independent derivation routes are real detectors, not rubber
 * stamps: exercised directly, off the corpus, with paired
 * accept/reject cases.
 * ------------------------------------------------------------------ */

describe("answerFromBarData and claimTrueFromBarData are real detectors", () => {
  const BAR: TBarData = { categories: ["Dogs", "Cats", "Fish", "Birds"], values: [8, 6, 3, 5] };

  it("reads 'how many more A than B', and disagrees when the chart's values change", () => {
    expect(answerFromBarData("A bar graph shows: dogs 8, cats 6, fish 3, birds 5. How many MORE dogs than fish?", BAR)).toBe(5);
    expect(answerFromBarData("How many MORE dogs than fish?", { ...BAR, values: [8, 6, 4, 5] })).toBe(4);
    expect(answerFromBarData("How many MORE dogs than fish?", { ...BAR, values: [8, 6, 8, 5] })).toBe(0);
  });

  it("reads 'in ALL' as a full sum, and 'A and B TOGETHER' as a two-bar sum", () => {
    const days: TBarData = { categories: ["Mon", "Tue", "Wed", "Thu"], values: [4, 7, 7, 2] };
    expect(answerFromBarData("How many books in ALL?", days)).toBe(20);
    expect(answerFromBarData("how many cats and birds TOGETHER?", BAR)).toBe(11);
    expect(answerFromBarData("how many cats and birds TOGETHER?", { ...BAR, values: [8, 5, 3, 5] })).toBe(10);
  });

  it("reads the grouped-comparison shape, and rejects an unmatched category name", () => {
    const recess: TBarData = { categories: ["Soccer", "Tag", "Swings", "Slide"], values: [9, 6, 4, 5] };
    const prompt = "How many MORE votes did the games (soccer + tag) get than the playground (swings + slide)?";
    expect(answerFromBarData(prompt, recess)).toBe(6);
    expect(answerFromBarData(prompt, { ...recess, values: [9, 6, 4, 4] })).toBe(7);
    expect(answerFromBarData(prompt.replace("soccer", "hockey"), recess)).toBeNull();
  });

  it("rejects a sentence with no recognised shape", () => {
    expect(answerFromBarData("What is 3 + 4?", BAR)).toBeNull();
  });

  it("claim reader: ties, 'most popular', 'beat', and the bars-vs-votes trap", () => {
    const fruit: TBarData = { categories: ["Apples", "Bananas", "Grapes", "Pears"], values: [5, 8, 5, 2] };
    expect(claimTrueFromBarData("Bananas are the most popular", fruit)).toBe(true);
    expect(claimTrueFromBarData("Apples are the most popular", fruit)).toBe(false);
    expect(claimTrueFromBarData("Apples and grapes tie", fruit)).toBe(true);
    expect(claimTrueFromBarData("Bananas and grapes tie", fruit)).toBe(false);
    expect(claimTrueFromBarData("Pears beat apples", fruit)).toBe(false);
    expect(claimTrueFromBarData("Apples beat pears", fruit)).toBe(true);
    expect(claimTrueFromBarData("Four fruits means four votes", fruit)).toBe(false);
    expect(claimTrueFromBarData("nonsense claim shape", fruit)).toBeNull();
  });
});

/* ------------------------------------------------------------------ *
 * describeWidgetState — scatterFit residual/metric parity (S317 round 2,
 * bv-05-03, `S317_BATCH1_VERIFICATION.md`'s bv-05-03 section).
 *
 * THE GAP THIS CLOSES. `ScatterFitW` (widgets.tsx) already speaks per-point residuals and the
 * scored mean-squared-residual (MSE) metric in its own SVG aria-label and a visible
 * `sf-residual-readout` line (S317 round 1). The reopenCondition
 * (`S247-BV-bv-05-03-OLS-SUPERSESSION[-lfnorm]`) names TWO surfaces that must carry this state:
 * the widget's own SVG, and the corpus-wide "Describe this model" `describeWidgetState` panel
 * (`describeState.ts`) `WidgetRenderer` builds for every widget type. Round 1 fixed only the
 * first; this rebuilds `scatterFit`'s `describeWidgetState` case to compute and state the
 * IDENTICAL formula, so the two surfaces the reopenCondition names can no longer disagree.
 * ------------------------------------------------------------------ */

describe("describeWidgetState — scatterFit states residuals and the MSE metric (S317 round 2)", () => {
  // bv-05-03's own authored spec (points, tolerance) — same numbers `ScatterFitW`'s own S317
  // round-1 comment independently verified (SSE 0.70 over 4 points = MSE 0.175, under tolerance
  // 0.176), so this test's expectations are cross-checked against the lesson's own signed rationale.
  const spec = WidgetSpec.parse({
    type: "scatterFit",
    prompt: "Fit the line so the misses are small and balanced: data (1,3), (2,6), (3,7), (4,9).",
    points: [[1, 3], [2, 6], [3, 7], [4, 9]],
    xMin: 0, xMax: 5, yMin: 0, yMax: 11,
    tolerance: 0.176,
    successFeedback: "ok",
    slopeFeedback: "s",
    offsetFeedback: "o"
  }) as TWidget;

  it("no fit line set yet: unchanged from before this fix (nothing to compute residuals against)", () => {
    expect(describeWidgetState(spec, null)).toBe(
      "4 data points are scattered from (1, 3) to (4, 9). No fit line has been set yet."
    );
  });

  // Independent re-formatter, deliberately re-typed rather than imported from `describeState.ts`
  // (that file does not export its internal `fmt`) — matches its documented rounding exactly
  // (`Number.isInteger(n) ? String(n) : String(+n.toFixed(2))`), so a test failure here means the
  // PANEL'S numbers disagree with an independently recomputed one, not a copy-paste of the same code.
  const fmtIndependent = (n: number): string => (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)));

  /** Independently recomputes what the panel's residual/MSE sentence must say for a given (m, b),
   * straight from `spec.points` — never by reading `describeState.ts`'s own internals — so this is
   * a real cross-check, not a restatement of the implementation. */
  function expectedResidualAndMse(m: number, b: number): { residualSummary: string; mse: number } {
    const pts = spec.type === "scatterFit" ? spec.points : [];
    const residuals = pts.map(([px, py]) => py - (m * px + b));
    const residualSummary = pts
      .map(([px, py], i) => `(${fmtIndependent(px)}, ${fmtIndependent(py)}) residual ${residuals[i] >= 0 ? "+" : "−"}${fmtIndependent(Math.abs(residuals[i]))}`)
      .join(", ");
    const mse = pts.reduce((acc, [px, py]) => acc + (py - (m * px + b)) ** 2, 0) / pts.length;
    return { residualSummary, mse };
  }

  it("states the SAME per-point residuals and MSE the widget's own SVG aria-label and visible readout compute", () => {
    // m = 1.9, b = 1.5 — the lesson's own signed-off best fit (SSE 0.70 over 4 points = MSE 0.175,
    // under tolerance 0.176; both display as "0.18" here — `fmt` rounds to 2 dp, and 0.175/0.176
    // as IEEE-754 floats round up the same way). Expectations below are recomputed independently
    // from `spec.points`, not hard-coded strings, so this test cannot pass by accident of a
    // matching literal — including the tolerance comparison itself (`mse <= spec.tolerance`,
    // exact numbers, before either is rounded for display).
    const d = describeWidgetState(spec, { m: 1.9, b: 1.5 })!;
    const { residualSummary, mse } = expectedResidualAndMse(1.9, 1.5);
    expect(mse).toBeCloseTo(0.175, 6);
    expect(mse).toBeLessThanOrEqual(0.176); // within tolerance — matches evaluate.ts's grading verdict
    expect(d).toContain("Your fit line is y = 1.9x + 1.5");
    expect(d).toContain(`Residuals: ${residualSummary}`);
    expect(d).toContain(`Mean squared residual (MSE): ${fmtIndependent(mse)}`);
    expect(d).toContain("at or under the target tolerance of 0.18");
  });

  it("reports \"above\" the tolerance for a poor fit — a near-identical case that disagrees", () => {
    // m = 0, b = 0: a flat line far from every point — MSE must be large and reported as "above".
    const d = describeWidgetState(spec, { m: 0, b: 0 })!;
    const { residualSummary, mse } = expectedResidualAndMse(0, 0);
    expect(mse).toBeGreaterThan(0.176);
    expect(d).toContain(`Residuals: ${residualSummary}`);
    expect(d).toContain(`Mean squared residual (MSE): ${fmtIndependent(mse)}`);
    expect(d).toContain("above the target tolerance of 0.18");
  });
});
