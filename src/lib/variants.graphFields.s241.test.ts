/**
 * S241 / PG-02 — GENERATED GRAPH SPECS ARE HELD TO THE SAME FIELD RULES AS AUTHORED ONES.
 *
 * WHAT THIS CLOSES. Three gate gaps from GRAPH_DEFECT_INDEX.md, all of the same shape: the
 * output is correct today and NOTHING would notice if it stopped being.
 *
 *   GG-10  Generated `numberLinePlace` tick density is generator-chosen and uncapped. The variant
 *          branch checks that the target is REACHABLE; it says nothing about `tickStep` dividing
 *          the span, about a tick-count ceiling, or about the landmark ladder. `numberLineRay`
 *          got a schema-level 200-tick cap; `numberLinePlace` did not, so nothing stops the next
 *          generator (or the next band) emitting `tickStep: 1` across `0..1000`.
 *   GG-11  The spec-driven axis captions of generated specs are never asserted. The graphStoryLab
 *          branch audits segments, claims and feedback exhaustively and never touches
 *          `xAxisLabel`/`yAxisLabel`/`axisContext` consistency — an `axisContext:
 *          "distanceFromOrigin"` prompt paired with a "speed" y-label would pass every gate in
 *          the repo.
 *   GG-07  Remedial steps sit OUTSIDE the surface-preservation proof (`variants.surface.test.ts`
 *          walks `j.steps` only) while being exactly the steps review refreshes: a remedial check
 *          seeds the review queue and comes back through `variantForStep`. The runtime decline
 *          guard holds; the PROOF that it holds stopped at the lesson's own step list.
 *
 * WHY SPEC-LEVEL AND NOT RENDERED. These are field-fidelity rules — they are about what the
 * generator EMITS, so they can be stated exactly, run in milliseconds and name the offending
 * generator/form/band directly. The rendered half of the generated corpus is
 * `widgets.generatedRender.s241.test.tsx` (PG-01); the two are deliberately separate so a render
 * regression and a field regression never hide behind one another.
 *
 * DELIBERATELY NOT ASSERTED HERE, and why:
 *   · `fractionDen` presence on fraction-framed number lines (D-01/D-02) is already gated by the
 *     "A13 — every generated numberLinePlace whose prompt names a fraction ships fractionDen"
 *     branch in `variants.test.ts`. One rule, one place.
 *   · The 1-2-5-10 LADDER is asserted for GENERATED specs only. The authored corpus carries ruled
 *     off-ladder steps — g3w-03-02 ticks a 0…90 line every 9 and g3w-03-04 ticks 0…60 every 6,
 *     because the lesson IS the skip-count and the ruler must show the multiples being counted.
 *     A human ruled those; a generator choosing 9 has ruled nothing. The density rules (positive
 *     step, integral span, tick ceiling) hold everywhere and are asserted on both corpora.
 *   · "Graphed point" forms shipping a plot path (D-19) and dot-plot-describing line-plot forms
 *     attaching plotData (D-18) are PG-02 assertions this task cannot land: both are live defects.
 *     TODO(D-18): once the eight `line-plot` ddDot… and ddShape… forms attach plotData, assert every
 *     form whose prompt says "A dot plot shows …" carries `plotData` with one count per value.
 *     TODO(D-19): once `pr-graph-rate-g7` default and the graphStoryRead numeric fallback route
 *     through the pointSet wrapper, assert every prompt matching /the graphed point|a dot is at/
 *     carries a plot path (`plotData`) rather than being served as bare numeric.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { VARIANT_GENERATORS, hasVariants, variantFor, variantForGenForm, variantForStep } from "./variants";
import type { TWidget } from "./schema";

/* ------------------------------------------------------------------ *
 * The generated corpus, walked the way the plan specifies: every
 * generator × every reachable form × all three bands. Same shape as
 * `everyGeneratedWidget` in variants.test.ts — a form whose spec depends
 * on the band is the corner where D-03 shipped, so no walk here may run
 * declared forms at one band or the default form at three.
 * ------------------------------------------------------------------ */

const BANDS = ["support", "core", "stretch"] as const;
const SEEDS = 16;

type Emitted = { widget: TWidget; where: string };

function everyGeneratedWidget(): Emitted[] {
  const out: Emitted[] = [];
  for (const g of VARIANT_GENERATORS) {
    const forms: (string | undefined)[] = [...(g.declarationOnly ? [] : [undefined]), ...(g.forms ?? [])];
    for (const form of forms) {
      for (const band of BANDS) {
        for (let s = 0; s < SEEDS; s++) {
          const v =
            form === undefined
              ? variantFor(g.tag, `graphFields-${s}`, band)
              : variantForGenForm(g.tag, form, `graphFields-${s}`, band);
          if (v === null) continue;
          out.push({ widget: v.widget, where: `${g.tag}@${form ?? "default"}@${band} seed graphFields-${s}` });
        }
      }
    }
  }
  return out;
}

const GENERATED = everyGeneratedWidget();
const generatedOf = <K extends TWidget["type"]>(type: K) =>
  GENERATED.filter((e) => e.widget.type === type) as Array<{ widget: Extract<TWidget, { type: K }>; where: string }>;

/* ------------------------------------------------------------------ *
 * The authored corpus INCLUDING remedials — the third of the servable
 * step space `variants.surface.test.ts` never walked.
 * ------------------------------------------------------------------ */

type Step = {
  id?: string;
  kind?: string;
  conceptTag?: string;
  widget?: Record<string, unknown> & { type?: string };
  variant?: { gen: string; form?: string };
};

type Authored = { widget: TWidget; where: string; step: Step; remedial: boolean };

function authoredSteps(): Authored[] {
  const out: Authored[] = [];
  const courses = join(process.cwd(), "content", "courses");
  for (const course of readdirSync(courses)) {
    const dir = join(courses, course, "lessons");
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
        id: string;
        steps?: Step[];
        remedials?: Array<{ check?: Step; concept?: Step }>;
      };
      for (const s of lesson.steps ?? [])
        if (s.widget?.type) out.push({ widget: s.widget as TWidget, where: `${lesson.id}/${s.id}`, step: s, remedial: false });
      for (const r of lesson.remedials ?? [])
        for (const s of [r.check, r.concept])
          if (s?.widget?.type)
            out.push({ widget: s.widget as TWidget, where: `${lesson.id}/${s.id} (remedial)`, step: s, remedial: true });
    }
  }
  return out;
}

const AUTHORED = authoredSteps();
const authoredOf = <K extends TWidget["type"]>(type: K) =>
  AUTHORED.filter((a) => a.widget.type === type).map(({ widget, where }) => ({
    widget: widget as Extract<TWidget, { type: K }>,
    where
  }));

describe("S241 PG-02 — the walks reach what they claim to check", () => {
  it("the generated walk covers every generator across all three bands", () => {
    // Vacuity guard. Every assertion below is "for all emitted specs of type T"; a walk that
    // emits nothing passes all of them silently, which is exactly how a sweep goes blind.
    expect(GENERATED.length).toBeGreaterThan(10_000);
    const tags = new Set(GENERATED.map((e) => e.where.split("@")[0]));
    expect(tags.size).toBe(VARIANT_GENERATORS.length);
  });

  it("the authored walk reaches remedial steps, not just lesson steps", () => {
    expect(AUTHORED.length).toBeGreaterThan(10_000);
    expect(AUTHORED.filter((a) => a.remedial).length, "remedial widget specs").toBeGreaterThan(1_000);
  });
});

/* ------------------------------------------------------------------ *
 * GG-10 — a generated number line is a RULER: its ticks divide its span,
 * they do not out-number what a 334px stage can print, and they land on
 * landmarks a learner counts in.
 * ------------------------------------------------------------------ */

/** Landmark ladder: a tick step of 1, 2 or 5 × any power of ten. The stride a human would pick. */
function onLadder(step: number): boolean {
  if (!(step > 0) || !Number.isFinite(step)) return false;
  let m = step;
  while (m < 1 - 1e-9) m *= 10;
  while (m >= 10 - 1e-9) m /= 10;
  return [1, 2, 5].some((k) => Math.abs(m - k) < 1e-9);
}

/** The most labelled ticks a 334px number-line stage can print without thinning to illegibility.
 * Chosen above every value either corpus reaches (authored max is 20, generated max is 12) so the
 * gate states a ceiling rather than pinning today's maximum. */
const MAX_TICKS = 30;

describe("S241 GG-10 — generated numberLinePlace scale honesty", () => {
  const specs = generatedOf("numberLinePlace");

  it("the sweep reaches generated number lines at all", () => {
    expect(specs.length, "no generated numberLinePlace was reached — the sweep has gone blind").toBeGreaterThan(0);
  });

  it("every tick step is positive and divides the span exactly", () => {
    // A step that does not divide the span leaves a short last interval: the final gap is drawn
    // narrower than every other one, and a learner counting units off the ruler counts wrong.
    const bad: string[] = [];
    for (const { widget: w, where } of specs) {
      if (!(w.tickStep > 0)) {
        bad.push(`${where}: tickStep ${w.tickStep} is not positive`);
        continue;
      }
      const n = (w.max - w.min) / w.tickStep;
      if (Math.abs(n - Math.round(n)) > 1e-9) bad.push(`${where}: (${w.max} − ${w.min}) / ${w.tickStep} = ${n}, not a whole number of ticks`);
    }
    expect(bad).toEqual([]);
  });

  it("no generated line asks the stage to print more ticks than it can", () => {
    const bad = specs
      .map(({ widget: w, where }) => ({ n: (w.max - w.min) / w.tickStep, where, w }))
      .filter(({ n }) => n > MAX_TICKS)
      .map(({ n, where, w }) => `${where}: ${Math.round(n)} ticks across ${w.min}…${w.max} (ceiling ${MAX_TICKS})`);
    expect(bad).toEqual([]);
  });

  it("every generated tick step sits on the 1-2-5-10 landmark ladder", () => {
    // The authored corpus is exempt BY RULING (see the header): g3w-03-02/g3w-03-04 tick in 9s
    // and 6s because the lesson is the skip-count. A generator has no such ruling — a stride of 3
    // on a 0…100 line labels 9/18/27 and reads as noise, which is the defect numberLineScale.s237
    // closed for numberLineHop and never stated for numberLinePlace.
    const off = [...new Set(specs.filter(({ widget: w }) => !onLadder(w.tickStep)).map(({ widget: w, where }) => `${where}: tickStep ${w.tickStep}`))];
    expect(off).toEqual([]);
    // Paired acceptance: the ladder predicate must be capable of rejecting. If it ever accepted
    // everything the assertion above would be decorative.
    expect(onLadder(3)).toBe(false);
    expect(onLadder(9)).toBe(false);
    expect(onLadder(0.05)).toBe(true);
    expect(onLadder(50)).toBe(true);
  });

  it("the marker's target and start are ON the line and ON its step lattice", () => {
    // Density is only half of "a ruler you can use": a target off the lattice is a mark no drag
    // can land on, and a target outside [min, max] is a mark the picture cannot show at all.
    const bad: string[] = [];
    for (const { widget: w, where } of specs) {
      for (const [name, v] of [["target", w.target], ["start", w.start]] as const) {
        if (v === undefined) continue;
        if (v < w.min || v > w.max) bad.push(`${where}: ${name} ${v} sits off the drawn line ${w.min}…${w.max}`);
        const k = (v - w.min) / w.step;
        if (Math.abs(k - Math.round(k)) > 1e-9) bad.push(`${where}: ${name} ${v} is not on the ${w.step} step lattice`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("the density rules hold for the AUTHORED corpus too, remedials included", () => {
    // Same rule, both states. The ladder is the only clause the authored corpus is exempt from.
    const specsA = authoredOf("numberLinePlace");
    expect(specsA.length).toBeGreaterThan(40);
    const bad: string[] = [];
    for (const { widget: w, where } of specsA) {
      if (!(w.tickStep > 0)) bad.push(`${where}: tickStep ${w.tickStep}`);
      const n = (w.max - w.min) / w.tickStep;
      if (Math.abs(n - Math.round(n)) > 1e-9) bad.push(`${where}: span/tickStep = ${n}`);
      if (n > MAX_TICKS) bad.push(`${where}: ${Math.round(n)} ticks`);
    }
    expect(bad).toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * GG-11 — a generated plane names what it measures, and the name agrees
 * with the quantity the spec says it is drawing.
 * ------------------------------------------------------------------ */

/**
 * `axisContext` is not decoration: `graphStoryLab` reads it to decide what a falling segment MEANS
 * (a distance-from-origin story may return toward zero; a height story may not), and
 * `describeState` narrates it. So the y-label and the context are two statements about the same
 * quantity, and they must agree. Only NAMED contexts are constrained — `generic` is the explicit
 * "no promise made" value and every phrasing is legal under it.
 */
const CONTEXT_VOCABULARY: Record<string, readonly string[]> = {
  distanceFromOrigin: ["distance"],
  height: ["height", "elevation", "altitude"],
  temperature: ["temperature", "temp"],
  waterLevel: ["water", "level", "reservoir", "tank"],
  savings: ["savings", "balance", "account", "money"]
};

describe("S241 GG-11 — generated axis captions say what the spec is measuring", () => {
  it("every generated graphStoryLab names both axes", () => {
    const specs = generatedOf("graphStoryLab");
    expect(specs.length, "no generated graphStoryLab was reached — the sweep has gone blind").toBeGreaterThan(0);
    const bare = specs
      .filter(({ widget: w }) => !String(w.xAxisLabel ?? "").trim() || !String(w.yAxisLabel ?? "").trim())
      .map(({ where, widget: w }) => `${where}: x="${w.xAxisLabel}" y="${w.yAxisLabel}"`);
    expect(bare).toEqual([]);
  });

  it("a named axisContext and the y-label describe the same quantity", () => {
    const specs = generatedOf("graphStoryLab");
    const bad: string[] = [];
    let constrained = 0;
    for (const { widget: w, where } of specs) {
      const vocab = CONTEXT_VOCABULARY[w.axisContext];
      if (!vocab) continue; // "generic" promises nothing
      constrained++;
      const y = String(w.yAxisLabel).toLowerCase();
      if (!vocab.some((k) => y.includes(k)))
        bad.push(`${where}: axisContext "${w.axisContext}" but the y-axis reads "${w.yAxisLabel}"`);
    }
    expect(bad).toEqual([]);
    // Vacuity guard: the named contexts must actually be reached, or this test constrains nothing.
    expect(constrained, "no named axisContext was generated").toBeGreaterThan(0);
    const seen = new Set(specs.map(({ widget: w }) => w.axisContext));
    for (const named of ["distanceFromOrigin", "height", "temperature", "waterLevel"])
      expect(seen.has(named as never), `context ${named} never generated`).toBe(true);
  });

  it("the same agreement holds for the authored graphStoryLab corpus", () => {
    const specs = authoredOf("graphStoryLab");
    expect(specs.length).toBeGreaterThan(5);
    const bad: string[] = [];
    for (const { widget: w, where } of specs) {
      if (!String(w.xAxisLabel ?? "").trim() || !String(w.yAxisLabel ?? "").trim()) bad.push(`${where}: bare axis`);
      const vocab = CONTEXT_VOCABULARY[w.axisContext];
      if (vocab && !vocab.some((k) => String(w.yAxisLabel).toLowerCase().includes(k)))
        bad.push(`${where}: axisContext "${w.axisContext}" vs y-axis "${w.yAxisLabel}"`);
    }
    expect(bad).toEqual([]);
  });

  /**
   * pointSetReasoningLab's axis furniture is TASK-SHAPED, and that is the property worth pinning:
   * the `range*` tasks draw a one-dimensional value strip (a range has no second variable), while
   * every other task draws a plane. Asserting "both labels always" would be false; asserting
   * "x always" is too weak to catch a plane losing its y-name. The rule is the split itself.
   */
  const ONE_DIMENSIONAL = new Set(["rangeEndpoints", "rangeValue", "rangeBlindness", "rangeUpdate"]);

  it("every generated pointSetReasoningLab plane names both axes; the 1D strips name one", () => {
    const specs = generatedOf("pointSetReasoningLab");
    expect(specs.length, "no generated pointSetReasoningLab was reached").toBeGreaterThan(0);
    const bad: string[] = [];
    const tasksSeen = new Set<string>();
    for (const { widget: w, where } of specs) {
      tasksSeen.add(w.task);
      if (!String(w.xLabel ?? "").trim()) bad.push(`${where}: no xLabel`);
      const planar = !ONE_DIMENSIONAL.has(w.task);
      const hasY = Boolean(String(w.yLabel ?? "").trim());
      if (planar && !hasY) bad.push(`${where}: task "${w.task}" draws a plane with an unnamed y-axis`);
      if (!planar && hasY) bad.push(`${where}: task "${w.task}" is a 1D strip but names a y-axis "${w.yLabel}"`);
    }
    expect(bad).toEqual([]);
    // Both sides of the split must be reached, or the rule is only half-tested.
    expect([...tasksSeen].some((t) => ONE_DIMENSIONAL.has(t)), "no 1D task generated").toBe(true);
    expect([...tasksSeen].some((t) => !ONE_DIMENSIONAL.has(t)), "no planar task generated").toBe(true);
  });

  it("the authored pointSetReasoningLab corpus obeys the same split", () => {
    const specs = authoredOf("pointSetReasoningLab");
    expect(specs.length).toBeGreaterThan(10);
    const bad: string[] = [];
    for (const { widget: w, where } of specs) {
      const planar = !ONE_DIMENSIONAL.has(w.task);
      const hasY = Boolean(String(w.yLabel ?? "").trim());
      if (planar !== hasY) bad.push(`${where}: task "${w.task}" planar=${planar} but yLabel=${JSON.stringify(w.yLabel)}`);
    }
    expect(bad).toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * GG-07 — the surface-preservation proof, extended to remedials.
 *
 * `variants.surface.test.ts` proves that a refresh never swaps an
 * authored manipulative for a text field. Its walk is `j.steps`, so the
 * proof stops at the lesson's own step list — while `review-steps` seeds
 * the queue from remedial CHECKS and refreshes them through the very same
 * `variantForStep`. This is the identical gate over the identical
 * function, applied to the third of the servable step space it missed.
 * ------------------------------------------------------------------ */

describe("S241 GG-07 — variant substitution preserves the surface of REMEDIAL steps too", () => {
  const remedials = AUTHORED.filter((a) => a.remedial && a.step.conceptTag && a.step.widget?.type);

  it("finds a remedial corpus to check", () => {
    expect(remedials.length).toBeGreaterThan(1_000);
  });

  it("never swaps a remedial widget for a different widget type", () => {
    const bad: string[] = [];
    for (const r of remedials) {
      const v = variantForStep(r.step as Parameters<typeof variantForStep>[0], `gate:${r.where}`);
      if (v && v.widget.type !== r.step.widget!.type) bad.push(`${r.where}: ${r.step.widget!.type} → ${v.widget.type}`);
    }
    expect(bad).toEqual([]);
  });

  it("declines rather than downgrades where a remedial tag's generator has another surface", () => {
    // The load-bearing half: the guard must be doing work on this corpus, not merely never tested.
    const declining = remedials.filter((r) => {
      if (r.step.variant !== undefined) return false;
      if (!hasVariants(r.step.conceptTag!)) return false;
      const raw = variantFor(r.step.conceptTag!, "probe");
      return raw !== null && raw.widget.type !== r.step.widget!.type;
    });
    expect(declining.length, "no remedial step exercises the decline path — say so rather than deleting the check").toBeGreaterThan(0);
    for (const r of declining)
      expect(variantForStep(r.step as Parameters<typeof variantForStep>[0], "probe"), `${r.where} should decline`).toBeNull();
  });

  it("still refreshes the remedial steps whose surfaces agree", () => {
    // Paired acceptance: a guard that declined everything would pass the two tests above and
    // silently switch freshness off for the whole remedial third.
    const refreshed = remedials.filter((r) => variantForStep(r.step as Parameters<typeof variantForStep>[0], `x:${r.where}`) !== null);
    expect(refreshed.length).toBeGreaterThan(50);
  });
});
