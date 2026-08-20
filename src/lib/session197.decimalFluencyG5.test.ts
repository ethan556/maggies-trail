import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, columnCalcReachable, columnCalcTruth, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS, variantForGenForm } from "./variants";

const require2 = createRequire(import.meta.url);
/* eslint-disable @typescript-eslint/no-var-requires */
const { solve: solveG4 } = require2("./g4Independent.cjs");
const { solvePrompt: solveG2 } = require2("./g2Independent.cjs");
/* eslint-enable @typescript-eslint/no-var-requires */

/** S197 — decimal-fluency-g5 (5.NBT.B.7), Batch F course 1/6. Zero new generator code.
 *
 *  FIT-CHECK. Computational per-form solvers exist only for the tag prefixes g0/k0-, g1-, g2-,
 *  g3-mult/div-fluency, g4-, a1-, a2-, g10-, g12-, g13- (see the INDEPENDENT registration loops in
 *  variants.test.ts). There is no g5- family, every decimal-ARITHMETIC family is authored-template
 *  lookup, and g4-decimals covers decimal REPRESENTATION only. So this course splits along what is
 *  actually computable: representation on g4-decimals, add/subtract on g2-place-value-1000, and
 *  multiply/divide on g4-multiply — all computed IN HUNDREDTHS, which is precisely what lesson 9
 *  ("Where Does the Point Go?") teaches.
 *
 *  THE PROMPT HAZARD THIS FILE EXISTS TO PIN. g2Independent.arithmetic() matches the FIRST
 *  /(\d+)\s*\+\s*(\d+)/ anywhere in the prompt. A prompt reading "3.40 + 2.25" matches "40 + 2"
 *  and grades 42. Graded add/subtract prompts therefore carry the hundredths expression ONLY, and
 *  the assertions below re-derive every answer through the shipped solver AND check that no
 *  decimal point precedes the graded expression. Subtract prompts must contain no "+" at all,
 *  because "+" is tried before "−".
 *
 *  ENGINE CONTRACT. columnCalc refuses a problem with no regrouping decision — 340 + 225 carries
 *  nowhere and was rejected at authoring time. Every columnCalc problem here is re-proven against
 *  the real schema helper to have reach.size >= 2 and only reachable traps, and decimals are
 *  add/subtract only. */

const DIR = join(__dirname, "../../content/courses/decimal-fluency-g5");
const FAMILIES = ["g2-place-value-1000", "g4-multiply", "g4-decimals"] as const;
const G2_FAMILIES = new Set(["g2-place-value-1000"]);
const registered: Record<string, Set<string>> = {};
for (const tag of FAMILIES) {
  registered[tag] = new Set(
    (VARIANT_GENERATORS.find((g) => g.tag === tag)?.forms ?? []) as string[]
  );
}
const CAPS = JSON.parse(
  readFileSync(join(__dirname, "../../scripts/engine-capabilities.json"), "utf8")
).types as Record<string, { manip: number }>;
const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);

const lessons = readdirSync(join(DIR, "lessons")).sort()
  .map((f) => JSON.parse(readFileSync(join(DIR, "lessons", f), "utf8")));

/** Independent route for frozen authored-template decimal prose that carries NO usable variant
 * binding (S252/S316 residual fixes removed several mismatched `Pv1000*` variants because that
 * generator only ever emits whole-number "a + b = ?" prompts, not decimal prose — see
 * S316_LANEA_MIXED_REVISION_IMPLEMENTATION.md, decimal-fluency-g5 section). Every pattern below
 * recomputes the answer from the digits actually printed, doing fixed-point (cents/hundredths)
 * integer arithmetic so floating point never masks a wrong parse. Throws for any prompt shape not
 * covered, so a numeric check can never silently skip verification. */
const toHundredths = (s: string): number => Math.round(Number(s) * 100);
const solveDecimalProse = (prompt: string): number | undefined => {
  let m = prompt.match(/^Add ([\d.]+) and ([\d.]+)(?:\. Pad [\d.]+ as [\d.]+ first, so the columns line up)?\. What is the sum\?$/);
  if (m) return (toHundredths(m[1]) + toHundredths(m[2])) / 100;
  m = prompt.match(/^Find the sum of ([\d.]+) and ([\d.]+) in columns\. Since [\d.]+ equals [\d.]+, line up the decimal points before adding\.$/);
  if (m) return (toHundredths(m[1]) + toHundredths(m[2])) / 100;
  m = prompt.match(/^Subtract ([\d.]+) from ([\d.]+)(?:\. Pad [\d.]+ as [\d.]+ first, so the columns line up)?\. What is the difference\?$/);
  if (m) return (toHundredths(m[2]) - toHundredths(m[1])) / 100;
  m = prompt.match(/^Multiply ([\d.]+) and ([\d.]+)\. What is the product\?$/);
  if (m) return (toHundredths(m[1]) * toHundredths(m[2])) / 10000;
  m = prompt.match(/^A wallet holds \$([\d.]+) and a jacket pocket holds \$([\d.]+)\. What is the total, in dollars\?$/);
  if (m) return (toHundredths(m[1]) + toHundredths(m[2])) / 100;
  m = prompt.match(/^You have \$([\d.]+) and spend \$([\d.]+) on lunch\. How much money is left\?$/);
  if (m) return (toHundredths(m[1]) - toHundredths(m[2])) / 100;
  return undefined;
};

describe("S197 decimal-fluency-g5 — course shape and family reuse", () => {
  it("grade 5, 3 chapters sized 6/5/5, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(5);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([6, 5, 5]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(16);
    expect(lessons.map((l) => l.id)).toEqual(declared);
  });

  it("declares only the three computational families, every form registered, all used", () => {
    const used = new Set<string>();
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ id: string; variant?: { gen: string; form: string } }>) {
        if (!s.variant) continue;
        used.add(s.variant.gen);
        expect(FAMILIES).toContain(s.variant.gen);
        expect(registered[s.variant.gen].has(s.variant.form),
          `${lesson.id}/${s.id}: ${s.variant.gen}/${s.variant.form} NOT registered`).toBe(true);
      }
    }
    expect([...used].sort()).toEqual([...FAMILIES].sort());
  });

  it("no lookup-table (authored-template) family is declared anywhere", () => {
    const LOOKUP = new Set(["decimal-align-addsub", "decimal-mul-places", "decimal-shift-divide",
      "decimal-compute", "decimal-place-value", "decimal-representation", "order-decimals", "ladder-shift"]);
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ id: string; variant?: { gen: string } }>) {
        if (!s.variant) continue;
        expect(LOOKUP.has(s.variant.gen),
          `${lesson.id}/${s.id}: ${s.variant.gen} is lookup-backed and cannot carry new prompts`).toBe(false);
      }
    }
  });

  it("every declared form GENERATES the widget surface the step was authored on", () => {
    const seen = new Map<string, { gen: string; type: string }>();
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ variant?: { gen: string; form: string }; widget?: { type: string } }>) {
        if (s.variant && s.widget) seen.set(s.variant.form, { gen: s.variant.gen, type: s.widget.type });
      }
    }
    expect(seen.size).toBeGreaterThan(0);
    for (const [form, { gen, type }] of seen) {
      const v = variantForGenForm(gen, form, `s197-surface-${form}`, "core");
      expect(v, `${gen}/${form} generated nothing`).toBeTruthy();
      expect(v!.widget.type, `${form} is authored as ${type} but GENERATES ${v!.widget.type}`).toBe(type);
    }
  });

  it("every interactive step uses an engine rated manip >= 2", () => {
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ id: string; kind: string; widget?: { type: string } }>) {
        if (s.kind !== "interactive" || !s.widget) continue;
        const manip = CAPS[s.widget.type]?.manip ?? 0;
        expect(manip, `${lesson.id}/${s.id}: ${s.widget.type} rates manip ${manip}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("every lesson has a numeric check AFTER a manipulative — the Tier A formal gate", () => {
    for (const lesson of lessons) {
      let manipSeen = false;
      let entryAfterManip = false;
      for (const s of lesson.steps as Array<{ widget?: { type: string } }>) {
        if (!s.widget) continue;
        if ((CAPS[s.widget.type]?.manip ?? 0) >= 2) manipSeen = true;
        else if (manipSeen && ENTRY.has(s.widget.type)) entryAfterManip = true;
      }
      expect(entryAfterManip, `${lesson.id}: all-MCQ checks score formal 1 and cap at Tier B`).toBe(true);
    }
  });
});

describe("S197 decimal-fluency-g5 — routes re-derived, decimal hazards pinned", () => {
  for (const lesson of lessons) {
    it(`${lesson.id}: A-tier shape, solver agreement, widget contracts`, () => {
      expect(lesson.steps.map((s: { kind: string }) => s.kind)).toEqual(
        ["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]
      );
      const [i1] = lesson.steps.filter((s: { kind: string }) => s.kind === "interactive");
      // S241 WS-E Phase 4: g5d-01-03's i1 prediction gate was REMOVED by the user-ruled thinning
      // policy (g5d-01-05 kept as the family's canonical gate). Every other lesson in this
      // course must still carry a coherent gate — the assertion is conditional, not deleted:
      // a gate that exists must be internally consistent, exactly as before.
      if (lesson.id === "g5d-01-03") {
        expect(i1.predict).toBeUndefined();
      } else {
        expect(i1.predict).toBeDefined();
        expect(i1.predict.options.some((o: { id: string }) => o.id === i1.predict.outcomeId)).toBe(true);
      }

      for (const s of lesson.steps) {
        if (!s.widget) continue;
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);

        if (w.type === "columnCalc") {
          expect(w.op, `${lesson.id}/${s.id}: columnCalc decimals are add/subtract only`).not.toBe("multiply");
          const reach = columnCalcReachable(w.op, w.a, w.b);
          const truth = columnCalcTruth(w.op, w.a, w.b);
          expect(reach.has(truth)).toBe(true);
          expect(reach.size,
            `${lesson.id}/${s.id}: no regrouping decision — the engine refuses a no-carry problem`).toBeGreaterThanOrEqual(2);
          expect(w.commonResults.length).toBeGreaterThanOrEqual(1);
          for (const t of w.commonResults) {
            expect(t.value).not.toBe(truth);
            expect(reach.has(t.value),
              `${lesson.id}/${s.id}: trap ${t.value} unreachable — dead feedback`).toBe(true);
          }
          if (w.op === "subtract") expect(w.a).toBeGreaterThanOrEqual(w.b);
        }
        if (w.type === "estimateSlider") {
          expect(w.min).toBeLessThan(w.target);
          expect(w.target).toBeLessThan(w.max);
        }
        if (w.type === "numberLineHop") {
          const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
          expect(land).toBeGreaterThanOrEqual(w.min);
          expect(land).toBeLessThanOrEqual(w.max);
          for (const t of w.commonLandings ?? []) expect(t.value).not.toBe(land);
        }
        if (w.type === "barBuilder") expect(w.categories.length).toBe(w.target.length);
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          // Frozen authored-template prose (no variant, or a variant whose generator only ever
          // emits a shape the printed prompt no longer matches) is solved by the prose route
          // FIRST — it is independent of whatever tag happens to be declared on the step.
          const prose = solveDecimalProse(w.prompt);
          const gen = s.variant?.gen as string | undefined;
          const derived = prose !== undefined
            ? prose
            : gen && G2_FAMILIES.has(gen)
              ? solveG2(s.variant!.form, w.prompt)
              : gen
                ? solveG4(s.variant!.form, { prompt: w.prompt, options: [] })
                : (() => { throw new Error(`${lesson.id}/${s.id}: no independent route for prompt: ${w.prompt}`); })();
          expect(derived, `${lesson.id}/${s.id} ${gen ? `${gen}/${s.variant!.form}` : "no-variant"}: ${w.prompt}`).toBe(w.answer);
          expect(evaluate(w, w.answer).correct).toBe(true);

          // The Pv1000*/mb* hazard checks below only apply when the step is actually GRADED
          // through that generator's own independent route (prose is a distinct, unrelated route).
          const f = prose === undefined ? (s.variant!.form as string) : undefined;
          if (f === "Pv1000AddTradeNumeric" || f === "Pv1000SubtractTradeNumeric") {
            // decimal notation before the graded expression would hijack arithmetic()'s regex
            expect(/\d\.\d/.test(w.prompt),
              `${lesson.id}/${s.id}: a decimal like "3.40 + 2.25" matches "40 + 2" and grades 42`).toBe(false);
          }
          if (f === "Pv1000SubtractTradeNumeric") {
            expect(/\d\s*\+\s*\d/.test(w.prompt),
              `${lesson.id}/${s.id}: a "+" anywhere routes to the addition branch first`).toBe(false);
          }
          const n = (w.prompt.match(/\d+/g) ?? []).map(Number);
          if (f === "mbMultiplyTensNumeric") expect(n[0] * n[1]).toBe(w.answer);
          if (f === "mbDivideBigNumeric") expect(n[0] / n[1]).toBe(w.answer);
          if (f === "mbMultiStepNumeric") expect(n[0] * n[1] - n[2]).toBe(w.answer);
          // a decimal answer cannot be graded at tolerance 0 in floating point
          if (!Number.isInteger(w.answer)) {
            expect(w.tolerance, `${lesson.id}/${s.id}: decimal answer needs a tolerance`).toBeGreaterThan(0);
          }

          const vals = w.commonErrors.map((e) => e.value);
          expect(new Set(vals).size, `${lesson.id}/${s.id} duplicate traps`).toBe(vals.length);
          for (const e of w.commonErrors) {
            expect(e.value).not.toBe(w.answer);
            expect(evaluate(w, e.value).correct).toBe(false);
            expect(e.feedback.length).toBeGreaterThanOrEqual(25);
          }
        } else if (w.type === "mcq") {
          expect(w.options.length).toBeGreaterThanOrEqual(4);
          const correct = w.options.filter((o) => o.correct);
          expect(correct).toHaveLength(1);
          expect(w.options[0].correct, `${lesson.id}/${s.id} correct not at index 0`).toBe(true);
          const fb = w.options.map((o) => o.feedback);
          expect(new Set(fb).size).toBe(fb.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
        }
      }
    });
  }
});
