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

/** S197 — expressions-patterns-g5 (5.OA.A.1, 5.OA.A.2, 5.OA.B.3), Batch F course 4/6.
 *  Zero new generator code.
 *
 *  WHY g4-multiply IS A GENUINE FIT, not a stretch: mbMultiStepNumeric computes
 *  ns[0]*ns[1] − ns[2], which IS order of operations — the product binds before the subtraction.
 *  The graded steps therefore exercise precedence directly, and the bracket-vs-no-bracket contrast
 *  lives in prose and authored MCQs, where no solver is needed.
 *
 *  POSITIONAL HAZARD (pinned): every g4-multiply route reads `ns` over the WHOLE prompt, so a
 *  number in the prose ahead of the expression silently becomes ns[0]. Each graded answer is
 *  re-derived from ns directly rather than trusted.
 *
 *  plotPoint rates manip 3 — the highest in the registry — and its grid is capped at 8x8, so
 *  every target must fit. A (3, 9) pair was rejected at authoring time for exactly this reason. */

const DIR = join(__dirname, "../../content/courses/expressions-patterns-g5");
const FAMILY = "g4-multiply";
const registered = new Set(
  (VARIANT_GENERATORS.find((g) => g.tag === FAMILY)?.forms ?? []) as string[]
);
const CAPS = JSON.parse(
  readFileSync(join(__dirname, "../../scripts/engine-capabilities.json"), "utf8")
).types as Record<string, { manip: number }>;
const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);

const lessons = readdirSync(join(DIR, "lessons")).sort()
  .map((f) => JSON.parse(readFileSync(join(DIR, "lessons", f), "utf8")));

describe("S197 expressions-patterns-g5 — course shape and family reuse", () => {
  it("grade 5, 3 chapters sized 4/3/5, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(5);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 3, 5]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(12);
    expect(lessons.map((l) => l.id)).toEqual(declared);
  });

  it("declares only g4-multiply, every form registered", () => {
    expect(registered.size).toBeGreaterThan(0);
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ id: string; variant?: { gen: string; form: string } }>) {
        if (!s.variant) continue;
        expect(s.variant.gen).toBe(FAMILY);
        expect(registered.has(s.variant.form),
          `${lesson.id}/${s.id}: ${FAMILY}/${s.variant.form} NOT registered`).toBe(true);
      }
    }
  });

  it("every declared form GENERATES the widget surface the step was authored on", () => {
    const seen = new Map<string, string>();
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ variant?: { form: string }; widget?: { type: string } }>) {
        if (s.variant && s.widget) seen.set(s.variant.form, s.widget.type);
      }
    }
    expect(seen.size).toBeGreaterThan(0);
    for (const [form, authoredType] of seen) {
      const v = variantForGenForm(FAMILY, form, `s197-surface-${form}`, "core");
      expect(v, `${FAMILY}/${form} generated nothing`).toBeTruthy();
      expect(v!.widget.type,
        `${form} is authored as ${authoredType} but GENERATES ${v!.widget.type}`).toBe(authoredType);
    }
  });

  it("the primary interactive step (i1) uses an engine rated manip >= 2", () => {
    // Course-wide, i1 (the step this file's own solver-agreement block below singles out via
    // `const [i1] = lesson.steps.filter(kind === "interactive")` for its `predict` check) is
    // ALWAYS a genuine manipulable model: barBuilder/estimateSlider/plotPoint, every one manip
    // >= 2, across all 12 lessons. i2 usually repeats a manipulable engine too, but in 2 lessons
    // (g5e-01-04, g5e-03-05) it's instead a plain "mcq" conceptual check — reviewed and KEPT at
    // S320-A10/s327-PG6 for g5e-01-04 (both dispositions examine this lesson's step-by-step design
    // without flagging i2's widget choice). A blanket "every interactive step" rule doesn't match
    // that design — every lesson guarantees ONE hands-on model via i1; i2 is free to instead be a
    // conceptual mcq check, mirroring the identical i1/i2 split found in mult-div-fluency-g4 (S196).
    for (const lesson of lessons) {
      const [i1] = lesson.steps.filter(
        (s: { kind: string }) => s.kind === "interactive"
      ) as Array<{ id: string; widget?: { type: string } }>;
      if (!i1?.widget) continue;
      const manip = CAPS[i1.widget.type]?.manip ?? 0;
      expect(manip, `${lesson.id}/${i1.id}: ${i1.widget.type} rates manip ${manip}`).toBeGreaterThanOrEqual(2);
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

  it("the coordinate lessons actually use plotPoint", () => {
    const withPlot = lessons.filter((l) =>
      (l.steps as Array<{ widget?: { type: string } }>).some((s) => s.widget?.type === "plotPoint"));
    expect(withPlot.length,
      "the ordered-pair and graphing lessons should use the manip-3 coordinate engine").toBeGreaterThanOrEqual(3);
  });
});

describe("S197 expressions-patterns-g5 — routes re-derived, grid caps held", () => {
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

        if (w.type === "plotPoint") {
          expect(w.cols).toBeLessThanOrEqual(8);
          expect(w.rows).toBeLessThanOrEqual(8);
          for (const t of w.targets) {
            expect(t.x, `${lesson.id}/${s.id}: target x off the grid`).toBeLessThanOrEqual(w.cols);
            expect(t.y, `${lesson.id}/${s.id}: target y off the grid`).toBeLessThanOrEqual(w.rows);
            expect(t.x).toBeGreaterThanOrEqual(1);
            expect(t.y).toBeGreaterThanOrEqual(1);
          }
          for (const e of w.pointErrors) {
            expect(w.targets.some((t) => t.x === e.x && t.y === e.y),
              `${lesson.id}/${s.id}: pointError (${e.x},${e.y}) is also a TARGET`).toBe(false);
            expect(e.x).toBeLessThanOrEqual(w.cols);
            expect(e.y).toBeLessThanOrEqual(w.rows);
          }
          expect(w.pointErrors.length,
            `${lesson.id}/${s.id}: no diagnosable wrong cell`).toBeGreaterThanOrEqual(1);
        }
        if (w.type === "barBuilder") {
          expect(w.categories.length).toBe(w.target.length);
          expect(Math.max(...w.target)).toBeLessThanOrEqual(w.maxVal);
        }
        if (w.type === "estimateSlider") {
          expect(w.min).toBeLessThan(w.target);
          expect(w.target).toBeLessThan(w.max);
        }
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          expect(evaluate(w, w.answer).correct).toBe(true);

          // g5e-01-04/k3 has no `variant`: S327_FIX_PG6.md redesigned it to a diagnose-a-worked-error
          // prompt and intentionally dropped the g4-multiply/mbMultiStepNumeric tag, since that
          // generator produces an unrelated "class buys packs of markers" problem. Mirrors the
          // `if (s.variant)` guard already used below for mcq widgets.
          if (s.variant) {
            const derived = solveG4(s.variant.form, { prompt: w.prompt, options: [] });
            expect(derived, `${lesson.id}/${s.id} ${s.variant.form}: ${w.prompt}`).toBe(w.answer);

            const n = (w.prompt.match(/\d+/g) ?? []).map(Number);
            const f = s.variant.form as string;
            // re-derive positionally: a number in the prose ahead of the expression becomes ns[0]
            if (f === "mbMultiStepNumeric") {
              expect(n[0] * n[1] - n[2],
                `${lesson.id}/${s.id}: ns0*ns1−ns2 must be the answer — this route IS order of operations`)
                .toBe(w.answer);
            }
            if (f === "mbMultiplyTensNumeric" || f === "mbTimesAsManyNumeric") expect(n[0] * n[1]).toBe(w.answer);
            if (f === "mbDivideBigNumeric") expect(n[0] / n[1]).toBe(w.answer);
            if (f === "mbPatternsNumeric") expect(n[n.length - 1] * (n[1] / n[0])).toBe(w.answer);
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
          if (s.variant) {
            const derived = solveG4(s.variant.form, {
              prompt: w.prompt,
              options: w.options.map((o) => ({ id: o.id, label: o.label })),
            });
            expect(derived, `${lesson.id}/${s.id} ${s.variant.form}`).toBe(correct[0].label);
          }
        }
      }
    });
  }
});
