import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS, variantForGenForm } from "./variants";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solve: solveG4 } = require2("./g4Independent.cjs");

/** S196 — measure-problems-g4 (4.MD.A.1, 4.MD.A.2), Batch E course 4/5. Zero new generator code.
 *
 *  NO CONVERSION FAMILY IS USED, deliberately. Every conversion-flavoured family in the registry
 *  (metric-convert, rect-measure, measure-word, volume, mass) is backed by
 *  authoredTemplateIndependent.cjs — a LOOKUP TABLE keyed to exact authored prompts that throws on
 *  anything it has not seen, so none can carry a new lesson. A Grade-4 conversion IS multiplying
 *  or dividing by the conversion factor, so the arithmetic rides g4-multiply and the conceptual
 *  work (which direction, and why a bigger unit gives a smaller number) sits in prose and MCQs.
 *
 *  Both arithmetic routes read ns POSITIONALLY, so each conversion prompt must state the QUANTITY
 *  first and the FACTOR second. That ordering is asserted per step, and the direction is checked
 *  against unit size: multiplying must go to the smaller unit, dividing to the bigger one. */

const DIR = join(__dirname, "../../content/courses/measure-problems-g4");
const FAMILIES = ["g4-multiply", "g4-measure"] as const;
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

describe("S196 measure-problems-g4 — course shape and family reuse", () => {
  it("grade 4, 3 chapters sized 4/4/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(4);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 4, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(12);
    expect(lessons.map((l) => l.id)).toEqual(declared);
  });

  it("declares only the two computational families, every form registered, both used", () => {
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

  it("no authored-template (lookup-table) family is declared anywhere", () => {
    const LOOKUP = new Set(["metric-convert", "rect-measure", "measure-word", "volume", "mass"]);
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ id: string; variant?: { gen: string } }>) {
        if (!s.variant) continue;
        expect(LOOKUP.has(s.variant.gen),
          `${lesson.id}/${s.id}: ${s.variant.gen} is lookup-table backed and cannot carry new prompts`).toBe(false);
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
      const v = variantForGenForm(gen, form, `s196-surface-${form}`, "core");
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

describe("S196 measure-problems-g4 — routes re-derived, conversion direction pinned", () => {
  // a bigger unit must always yield the smaller number
  const FACTORS: Record<string, number> = { meter: 100, kilometer: 1000, kilogram: 1000, liter: 1000, hour: 60, minute: 60 };

  for (const lesson of lessons) {
    it(`${lesson.id}: A-tier shape, solver agreement, widget contracts`, () => {
      expect(lesson.steps.map((s: { kind: string }) => s.kind)).toEqual(
        ["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]
      );
      const [i1] = lesson.steps.filter((s: { kind: string }) => s.kind === "interactive");
      expect(i1.predict).toBeDefined();
      expect(i1.predict.options.some((o: { id: string }) => o.id === i1.predict.outcomeId)).toBe(true);

      for (const s of lesson.steps) {
        if (!s.widget) continue;
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);

        if (w.type === "numberLineHop") {
          const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
          expect(land).toBeGreaterThanOrEqual(w.min);
          expect(land).toBeLessThanOrEqual(w.max);
          for (const t of w.commonLandings ?? []) expect(t.value).not.toBe(land);
        }
        if (w.type === "barBuilder") {
          expect(w.categories.length).toBe(w.target.length);
          expect(Math.max(...w.target)).toBeLessThanOrEqual(w.maxVal);
        }
        if (w.type === "estimateSlider") {
          expect(w.min).toBeLessThan(w.target);
          expect(w.target).toBeLessThan(w.max);
        }
        if (w.type === "numberLinePlace" && w.fractionDen !== undefined) {
          expect(w.min).toBe(0);
          expect(w.max).toBe(w.fractionDen);
          expect(w.step).toBe(1);
          expect(w.tickStep).toBe(1);
        }
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          const derived = solveG4(s.variant.form, { prompt: w.prompt, options: [] });
          expect(derived, `${lesson.id}/${s.id} ${s.variant.form}: ${w.prompt}`).toBe(w.answer);
          expect(evaluate(w, w.answer).correct).toBe(true);

          const n = (w.prompt.match(/\d+/g) ?? []).map(Number);
          const f = s.variant.form as string;
          if (f === "mbMultiplyTensNumeric") {
            expect(n[0] * n[1], `${lesson.id}/${s.id}: quantity FIRST, factor second`).toBe(w.answer);
            // multiplying converts DOWN, so the answer must exceed the quantity
            expect(w.answer).toBeGreaterThan(n[0]);
            // word boundary matters: "kilometers," CONTAINS "meters," and would pick the wrong factor
            const big = Object.keys(FACTORS).find((u) => new RegExp(`\\b${u}s,`).test(w.prompt));
            if (big) expect(n[1], `${lesson.id}/${s.id}: wrong factor for ${big}`).toBe(FACTORS[big]);
          }
          if (f === "mbDivideBigNumeric") {
            expect(n[0] / n[1], `${lesson.id}/${s.id}: total FIRST, factor second`).toBe(w.answer);
            // dividing converts UP, so the answer must be smaller than the total
            expect(w.answer).toBeLessThan(n[0]);
          }
          if (f === "mbMultiStepNumeric") expect(n[0] * n[1] - n[2]).toBe(w.answer);
          if (f === "mbInterpretRemaindersNumeric") expect(Math.ceil(n[0] / n[1])).toBe(w.answer);
          if (f === "mcFractionMeasurementNumeric") expect(n[0] / 4).toBe(w.answer);

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
