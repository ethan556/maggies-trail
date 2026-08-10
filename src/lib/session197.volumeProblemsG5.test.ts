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

/** S197 — volume-problems-g5 (5.MD.C.3/4/5), Batch F course 5/6. Zero new generator code.
 *
 *  WHY NO VOLUME FAMILY IS DECLARED. box-volume and fraction-volume are authored-template LOOKUP
 *  families and cannot carry a new prompt, and no computational route multiplies three numbers.
 *  The course instead uses the standard's own framing, V = B x h (5.MD.C.5b), which decomposes
 *  into two multiplications the solver DOES compute — l x w for one layer, then B x h to stack it.
 *  That decomposition is the pedagogy (every lesson teaches layer-then-stack), not a workaround
 *  bolted on afterwards. The exclusion is asserted so a later edit cannot quietly reintroduce a
 *  family whose solver would throw on any new prompt.
 *
 *  All routes read ns POSITIONALLY across the whole prompt, so each graded answer is re-derived
 *  from ns rather than trusted. */

const DIR = join(__dirname, "../../content/courses/volume-problems-g5");
const FAMILY = "g4-multiply";
const LOOKUP = new Set(["box-volume", "fraction-volume", "prism-surface-area", "box-surface-area", "volume"]);
const registered = new Set(
  (VARIANT_GENERATORS.find((g) => g.tag === FAMILY)?.forms ?? []) as string[]
);
const CAPS = JSON.parse(
  readFileSync(join(__dirname, "../../scripts/engine-capabilities.json"), "utf8")
).types as Record<string, { manip: number }>;
const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);

const lessons = readdirSync(join(DIR, "lessons")).sort()
  .map((f) => JSON.parse(readFileSync(join(DIR, "lessons", f), "utf8")));

describe("S197 volume-problems-g5 — course shape and family reuse", () => {
  it("grade 5, 3 chapters sized 2/3/3, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(5);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([2, 3, 3]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(8);
    expect(lessons.map((l) => l.id)).toEqual(declared);
  });

  it("declares only g4-multiply, and no lookup-backed volume family", () => {
    expect(registered.size).toBeGreaterThan(0);
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ id: string; variant?: { gen: string; form: string } }>) {
        if (!s.variant) continue;
        expect(LOOKUP.has(s.variant.gen),
          `${lesson.id}/${s.id}: ${s.variant.gen} is lookup-backed and throws on any new prompt`).toBe(false);
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

  it("both halves of V = B x h are exercised across the course", () => {
    let layerSteps = 0, stackSteps = 0, recoverSteps = 0;
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ variant?: { form: string }; widget?: { prompt?: string } }>) {
        if (!s.variant || !s.widget?.prompt) continue;
        if (s.variant.form === "mbMultiplyTensNumeric") {
          if (/base area/.test(s.widget.prompt)) layerSteps++; else stackSteps++;
        }
        if (s.variant.form === "mbDivideBigNumeric") recoverSteps++;
      }
    }
    expect(layerSteps + stackSteps, "the two multiply halves must both appear").toBeGreaterThan(0);
    expect(recoverSteps, "recovering a missing dimension by division must appear").toBeGreaterThan(0);
  });
});

describe("S197 volume-problems-g5 — routes re-derived", () => {
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

        if (w.type === "areaModel" && w.requireFactors) {
          const { w: fw, h: fh } = w.requireFactors;
          expect(fw * fh).toBe(w.targetArea);
          expect(fh).toBeLessThanOrEqual(w.wMax);
          expect(fw).toBeLessThanOrEqual(w.hMax);
          expect(w.factorFeedback).toBeTruthy();
          expect(Math.max(fw, fh)).toBeLessThanOrEqual(30);
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
          const derived = solveG4(s.variant.form, { prompt: w.prompt, options: [] });
          expect(derived, `${lesson.id}/${s.id} ${s.variant.form}: ${w.prompt}`).toBe(w.answer);
          expect(evaluate(w, w.answer).correct).toBe(true);

          const n = (w.prompt.match(/\d+/g) ?? []).map(Number);
          const f = s.variant.form as string;
          if (f === "mbMultiplyTensNumeric" || f === "mbTimesAsManyNumeric") {
            expect(n[0] * n[1],
              `${lesson.id}/${s.id}: ns0*ns1 must be the answer — a number in the prose ahead of the expression would hijack it`)
              .toBe(w.answer);
          }
          if (f === "mbDivideBigNumeric") expect(n[0] / n[1]).toBe(w.answer);
          if (f === "mbMultiStepNumeric") expect(n[0] * n[1] - n[2]).toBe(w.answer);

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
          expect(correct, `${lesson.id}/${s.id}: exactly one option may be correct`).toHaveLength(1);
          expect(w.options[0].correct, `${lesson.id}/${s.id} correct not at index 0`).toBe(true);
          const fb = w.options.map((o) => o.feedback);
          expect(new Set(fb).size).toBe(fb.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
        }
      }
    });
  }
});
