/**
 * S241 / PG-06 — SPEC-INTEGRITY RULES FOR THE STATISTICAL-DISPLAY ENGINES.
 *
 * FOUR GATE GAPS, ONE SHAPE. Each of these is a field relationship that is correct throughout the
 * corpus today and enforced by nothing — the class where "all authored specs happen to comply" is
 * the entire safety argument, and the next authored step or the next generator is one edit from
 * breaking it silently.
 *
 *   GG-05  barBuilder drops its true ceiling when `maxVal % step !== 0`. For `maxVal: 45,
 *          step: 10` the gridlines and labels stop at 40 while `hScale` runs to 45 — against the
 *          engine's own S237b comment, "the axis always states its ceiling". Every authored spec
 *          is currently divisible (70 of 70, steps of 1 and 5).
 *   GG-06  boxPlot has NO `widgetIntegrityErrors` branch at all: five unconstrained ints for the
 *          targets and five for the starts, no ordering refine, no bounds-vs-axis check, no
 *          start ≠ target check. A mis-ordered target set makes the step UNWINNABLE — the grader
 *          (`evaluate.ts:758`) requires exact equality on all five handles. All 5 authored specs
 *          are ordered and in-axis.
 *   GG-14  `DotPlotBuildW` ignores `denominator` while read mode formats with it, so a build-mode
 *          dotPlot authored with `denominator: 2` would label its axis 12/14/16 instead of 6/7/8.
 *          All 5 authored build specs omit it; the read-mode authoring pattern is live (9 specs).
 *   GG-15  `plotData` lays values out in equal-width columns (`repeat(values.length, 1fr)`) while
 *          build-mode dotPlot uses a true `linScale`. The schema requires strictly increasing
 *          values but not UNIFORM ones, so the legal `values: [1, 2, 4]` would draw 2→4 the same
 *          width as 1→2 — a distorted number line. All 19 authored blocks and both emitters are
 *          currently consecutive.
 *
 * Plus one containment lint that is not in the gap list under its own number but is the honest
 * green half of GG-04:
 *   GG-04  graphRead bar mode prints raw tick values while the aria says "each gridline standing
 *          for ${unitValue}" and the grader computes `drawn × unitValue`. Every authored spec
 *          uses `unitValue: 1`, so the axis lie is LATENT — "one authored edit from live". The
 *          engine fix is PG-07 territory and cannot land here; what CAN land is a lint that keeps
 *          the hazard unreachable, so the combination that would lie has to be introduced
 *          deliberately, past a red gate, rather than by an ordinary authoring edit.
 *
 * WHY A TEST AND NOT A `widgetIntegrityErrors` BRANCH. These belong in `schema.ts` — that is where
 * `lint:pedagogy` and the variant sweep would pick them up automatically for every future
 * generator. This file states them at the same strength over the same corpora (authored steps,
 * REMEDIAL steps, and generated output) without touching engine or schema source, which is the
 * boundary this task works inside. Porting them into `widgetIntegrityErrors` later is a
 * simplification, not a change of meaning: the assertions transfer verbatim.
 *
 * NOT ASSERTED HERE, and why:
 *   TODO(D-22): sequenceBuild's dial invites negative partial sums (`slider min=-5`,
 *     `widgets.tsx:4039`) and the clamps flatten every negative bar to a 1px sliver at a wrong
 *     position or clip it off-canvas. The PG-06 clause is "control domain within drawable range";
 *     it cannot be asserted until the engine draws negative bars from a zero baseline, because
 *     the authored specs REACH those states through the control.
 *   TODO(D-14): boxPlot's engine defects (no tick strokes, no visible handle readouts, aria
 *     vocabulary that says "lower-mid" where the lesson says Q1) are render-level and belong to
 *     PG-05/PG-12. The spec-integrity half is what this file covers.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetSpec, dotPlotLabel, widgetIntegrityErrors, type TWidget } from "./schema";
import { VARIANT_GENERATORS, variantFor, variantForGenForm } from "./variants";

/* ------------------------------------------------------------------ *
 * The two corpora these rules run over. Authored INCLUDES remedials —
 * a remedial check is a servable step, and `lint:pedagogy` already walks
 * them, so a rule that stopped at `lesson.steps` would be weaker than
 * the lint it is meant to join.
 * ------------------------------------------------------------------ */

type Spec = { widget: TWidget; where: string };

function authoredSpecs(): Spec[] {
  const out: Spec[] = [];
  const courses = join(process.cwd(), "content", "courses");
  for (const course of readdirSync(courses)) {
    const dir = join(courses, course, "lessons");
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
        id: string;
        steps?: Array<{ id: string; widget?: Record<string, unknown> }>;
        remedials?: Array<{ check?: { id: string; widget?: Record<string, unknown> }; concept?: { id: string; widget?: Record<string, unknown> } }>;
      };
      const all = [
        ...(lesson.steps ?? []),
        ...(lesson.remedials ?? []).flatMap((r) => [r.check, r.concept]).filter((s): s is NonNullable<typeof s> => Boolean(s))
      ];
      for (const s of all) if (s.widget?.type) out.push({ widget: s.widget as TWidget, where: `${lesson.id}/${s.id}` });
    }
  }
  return out;
}

function generatedSpecs(): Spec[] {
  const out: Spec[] = [];
  for (const g of VARIANT_GENERATORS) {
    const forms: (string | undefined)[] = [...(g.declarationOnly ? [] : [undefined]), ...(g.forms ?? [])];
    for (const form of forms) {
      for (const band of ["support", "core", "stretch"] as const) {
        for (let s = 0; s < 12; s++) {
          const v =
            form === undefined ? variantFor(g.tag, `integrity-${s}`, band) : variantForGenForm(g.tag, form, `integrity-${s}`, band);
          if (v === null) continue;
          out.push({ widget: v.widget, where: `${g.tag}@${form ?? "default"}@${band} seed integrity-${s}` });
        }
      }
    }
  }
  return out;
}

const AUTHORED = authoredSpecs();
const GENERATED = generatedSpecs();
const ALL = [...AUTHORED, ...GENERATED];

const pick = <K extends TWidget["type"]>(set: Spec[], type: K) =>
  set.filter((s) => s.widget.type === type) as Array<{ widget: Extract<TWidget, { type: K }>; where: string }>;

describe("S241 PG-06 — the walks are real", () => {
  it("covers the authored corpus including remedials, and the generated one", () => {
    expect(AUTHORED.length).toBeGreaterThan(10_000);
    expect(GENERATED.length).toBeGreaterThan(10_000);
  });
});

/* ------------------------------------------------------------------ *
 * GG-05 — a bar chart's axis states the ceiling it actually scales to.
 * ------------------------------------------------------------------ */

describe("S241 GG-05 — barBuilder's gridline ladder reaches its own ceiling", () => {
  it("every barBuilder spec has maxVal divisible by step", () => {
    // `maxVal: 45, step: 10` labels 0/10/20/30/40 while the bars scale to 45: the top of the
    // chart is a value the axis never names, so a bar drawn at 45 reads as "somewhere past 40".
    // The engine's own comment says the axis always states its ceiling; nothing enforced it.
    const specs = pick(ALL, "barBuilder");
    expect(specs.length, "no barBuilder spec found").toBeGreaterThan(50);
    const bad = specs
      .filter(({ widget: w }) => w.maxVal % w.step !== 0)
      .map(({ widget: w, where }) => `${where}: maxVal ${w.maxVal} is not a whole number of ${w.step}-steps`);
    expect(bad).toEqual([]);
  });

  it("and every target bar is reachable on that ladder", () => {
    // The companion failure: a ceiling the axis states but a target the step cannot land on.
    const bad: string[] = [];
    for (const { widget: w, where } of pick(ALL, "barBuilder")) {
      for (const t of w.target) {
        if (t < 0 || t > w.maxVal) bad.push(`${where}: target ${t} sits outside 0…${w.maxVal}`);
        if (t % w.step !== 0) bad.push(`${where}: target ${t} is not on the ${w.step} step lattice`);
      }
    }
    expect(bad).toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * GG-06 — a box plot the learner can actually win.
 * ------------------------------------------------------------------ */

describe("S241 GG-06 — boxPlot specs are ordered, bounded, and winnable", () => {
  const specs = pick(ALL, "boxPlot");

  it("finds the boxPlot corpus", () => {
    expect(specs.length, "no boxPlot spec found — the branch would be vacuous").toBeGreaterThan(0);
  });

  it("the five target handles are in non-decreasing order", () => {
    // The grader demands exact equality on all five (`evaluate.ts:758`), and the SVG draws a box
    // from Q1 to Q3. A target set with Q3 < Q1 is a picture that cannot be made and a step that
    // cannot be passed — the definition of unwinnable.
    const bad: string[] = [];
    for (const { widget: w, where } of specs) {
      const five = [w.targetMin, w.targetQ1, w.targetMed, w.targetQ3, w.targetMax];
      if (five.some((v, i) => i > 0 && five[i - 1] > v))
        bad.push(`${where}: targets ${five.join(" ≤ ")} are out of order`);
    }
    expect(bad).toEqual([]);
  });

  it("the five START handles are in non-decreasing order too", () => {
    // The start state is what the learner is handed. An out-of-order start draws an inverted box
    // before they have touched anything, and the "order" feedback path fires on their first check
    // for a mistake they did not make.
    const bad: string[] = [];
    for (const { widget: w, where } of specs) {
      const five = [w.startMin, w.startQ1, w.startMed, w.startQ3, w.startMax];
      if (five.some((v, i) => i > 0 && five[i - 1] > v))
        bad.push(`${where}: starts ${five.join(" ≤ ")} are out of order`);
    }
    expect(bad).toEqual([]);
  });

  it("the axis runs the right way and every handle sits on it", () => {
    const bad: string[] = [];
    for (const { widget: w, where } of specs) {
      if (w.axisMin >= w.axisMax) bad.push(`${where}: axis ${w.axisMin}…${w.axisMax} does not increase`);
      const named: Array<[string, number]> = [
        ["targetMin", w.targetMin], ["targetQ1", w.targetQ1], ["targetMed", w.targetMed],
        ["targetQ3", w.targetQ3], ["targetMax", w.targetMax],
        ["startMin", w.startMin], ["startQ1", w.startQ1], ["startMed", w.startMed],
        ["startQ3", w.startQ3], ["startMax", w.startMax]
      ];
      for (const [name, v] of named)
        if (v < w.axisMin || v > w.axisMax) bad.push(`${where}: ${name} ${v} is off the ${w.axisMin}…${w.axisMax} axis`);
    }
    expect(bad).toEqual([]);
  });

  it("the step does not begin already solved", () => {
    // A start equal to the target grades correct before the learner drags anything.
    const bad = specs
      .filter(({ widget: w }) =>
        w.startMin === w.targetMin && w.startQ1 === w.targetQ1 && w.startMed === w.targetMed &&
        w.startQ3 === w.targetQ3 && w.startMax === w.targetMax)
      .map(({ where }) => `${where}: the start state IS the target`);
    expect(bad).toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * GG-14 — the two dot-plot modes agree about what a value means.
 * ------------------------------------------------------------------ */

describe("S249 GG-14 — both dotPlot modes honour the same fractional value formatter", () => {
  it("read and build modes both support authored fractional axes", () => {
    // S249 repaired build mode to use the same dotPlotLabel formatter as read mode, its controls,
    // and its accessible name. Fractional build plots are now a live, supported authoring pattern.
    const specs = pick(ALL, "dotPlot");
    expect(specs.length, "no dotPlot spec found").toBeGreaterThan(5);
    const build = specs.filter(({ widget: w }) => w.given === undefined);
    const read = specs.filter(({ widget: w }) => w.given !== undefined);
    expect(build.length, "no BUILD-mode dotPlot in the corpus").toBeGreaterThan(0);
    expect(read.length, "no READ-mode dotPlot in the corpus").toBeGreaterThan(0);
    const fractionalBuild = build.filter(({ widget: w }) => w.denominator !== undefined);
    expect(fractionalBuild.length, "the repaired fractional BUILD pattern has disappeared").toBeGreaterThan(0);
    for (const { widget: w, where } of fractionalBuild) {
      expect(w.values.map((value) => dotPlotLabel(value, w.denominator)), where).not.toEqual(w.values.map(String));
    }
  });

  it("read mode's fractional axis is still authored and still allowed", () => {
    // Paired acceptance: this rule must not be satisfiable by deleting `denominator` everywhere.
    // The fractional READ axis is a live, correct authoring pattern (vm-02-01, the g2g halves).
    const withDen = pick(ALL, "dotPlot").filter(({ widget: w }) => w.given !== undefined && w.denominator !== undefined);
    expect(withDen.length, "the fractional read-mode pattern has disappeared").toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------ *
 * GG-15 — plotData draws a number line, so its columns are a number line.
 * ------------------------------------------------------------------ */

/** Every `plotData` block anywhere in a spec — the field is shared by numeric, fractionEntry and mcq. */
function plotDataBlocks(set: Spec[]): Array<{ values: number[]; counts: number[]; where: string }> {
  const out: Array<{ values: number[]; counts: number[]; where: string }> = [];
  for (const { widget, where } of set) {
    const pd = (widget as { plotData?: { values: number[]; counts: number[] } }).plotData;
    if (pd) out.push({ values: pd.values, counts: pd.counts, where: `${where} (${widget.type})` });
  }
  return out;
}

describe("S241 GG-15 — plotData column widths tell the truth about the gaps between values", () => {
  it("every plotData block steps its values uniformly", () => {
    // The renderer lays the columns out as `repeat(values.length, 1fr)`: every gap is drawn the
    // same width. That is only honest when every gap IS the same. `values: [1, 2, 4]` is legal per
    // schema (strictly increasing) and would draw 2→4 as wide as 1→2 — a number line that lies
    // about distance, on a display whose point is where the data sits.
    const blocks = plotDataBlocks(ALL);
    expect(blocks.length, "no plotData block found — the rule would be vacuous").toBeGreaterThan(20);
    const bad: string[] = [];
    for (const { values, where } of blocks) {
      const gaps = values.slice(1).map((v, i) => v - values[i]);
      if (gaps.some((g) => g !== gaps[0])) bad.push(`${where}: values ${JSON.stringify(values)} step ${JSON.stringify(gaps)}`);
    }
    expect(bad).toEqual([]);
  });

  it("and the generated emitters obey it too, not just the authored blocks", () => {
    // Both plotData emitters are generators; if only the authored corpus were checked, the rule
    // would be a content lint rather than a system one.
    const generated = plotDataBlocks(GENERATED);
    expect(generated.length, "no GENERATED plotData block was reached").toBeGreaterThan(0);
    const bad = generated
      .filter(({ values }) => values.slice(1).some((v, i) => v - values[i] !== values[1] - values[0]))
      .map(({ values, where }) => `${where}: ${JSON.stringify(values)}`);
    expect(bad).toEqual([]);
  });

  it("every plotData block still passes the integrity rules that DO exist", () => {
    // The new rule sits alongside `plotDataIntegrityErrors`, it does not replace it.
    const bad: string[] = [];
    for (const { widget, where } of ALL) {
      if (!(widget as { plotData?: unknown }).plotData) continue;
      const parsed = WidgetSpec.safeParse(widget);
      if (!parsed.success) continue; // parse failures are PG-01's finding, not this one's
      const errs = widgetIntegrityErrors(parsed.data as TWidget);
      if (errs.length) bad.push(`${where}: ${errs.join("; ")}`);
    }
    expect(bad).toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * GG-04 — the latent graphRead axis lie stays unreachable.
 * ------------------------------------------------------------------ */

describe("S241 GG-04 — graphRead's bar axis cannot be authored into lying", () => {
  it("no bar-mode spec scales its gridlines by more than one", () => {
    /* THE LATENT DEFECT this contains. In bar mode the tick text is the raw loop index `t`
     * (`widgets.tsx:8523`), while the accessible name says "each gridline standing for
     * ${spec.unitValue}" and `graphReadAnswer` computes `drawn × unitValue`. At `unitValue: 2` a
     * bar reaching the gridline labelled 6 is worth 12: the picture and the grading disagree, and
     * the picture is the thing the learner is asked to read.
     *
     * Every authored spec uses `unitValue: 1`, which is why nothing is wrong today — and the
     * scaled-bar skill (2.MD) is on the roadmap, so the single edit that makes it wrong is a
     * planned one. This lint makes that edit fail here first.
     *
     * TODO(GG-04 / PG-07): once the bar branch prints `t × unitValue`, DELETE this test and
     * replace it with the render-honesty assert — mount `unitValue: 2` and `unitValue: 5`
     * fixtures and require the drawn tick text to equal `t × unitValue`, so scaled bars become
     * authorable instead of merely forbidden. */
    const specs = pick(ALL, "graphRead");
    expect(specs.length, "no graphRead spec found").toBeGreaterThan(20);
    const bars = specs.filter(({ widget: w }) => w.mode === "bar");
    expect(bars.length, "no BAR-mode graphRead — the rule would be vacuous").toBeGreaterThan(0);
    const bad = bars
      .filter(({ widget: w }) => w.unitValue !== 1)
      .map(({ widget: w, where }) => `${where}: bar mode with unitValue ${w.unitValue} — the gridline labels print ${w.unitValue}× less than they are worth`);
    expect(bad).toEqual([]);
  });

  it("picture and tally modes keep their scaling freedom", () => {
    // Paired acceptance and a boundary statement: the restriction is about the BAR branch, whose
    // ticks are drawn from a raw index. A pictograph key is drawn per icon and is free to scale —
    // the rule must not quietly become "unitValue is always 1 everywhere".
    const specs = pick(ALL, "graphRead");
    const scalable = specs.filter(({ widget: w }) => w.mode !== "bar");
    expect(scalable.length).toBeGreaterThan(0);
    const bad = scalable
      .filter(({ widget: w }) => !Number.isInteger(w.unitValue) || w.unitValue < 1)
      .map(({ widget: w, where }) => `${where}: unitValue ${w.unitValue}`);
    expect(bad).toEqual([]);
  });

  it("the bar the spec draws fits the scale the spec declares", () => {
    // A `drawn` above `scaleMax` runs the bar off the top of a viewBox sized `(scaleMax + 1) × 12`
    // — the same clipping class as D-09's dot piles, stated where it can be checked cheaply.
    const bad: string[] = [];
    for (const { widget: w, where } of pick(ALL, "graphRead")) {
      if (w.drawn > w.scaleMax) bad.push(`${where}: drawn ${w.drawn} exceeds scaleMax ${w.scaleMax}`);
    }
    expect(bad).toEqual([]);
  });
});
