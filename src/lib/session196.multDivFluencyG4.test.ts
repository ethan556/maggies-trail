import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, columnCalcReachable, columnCalcTruth, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS } from "./variants";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solve: solveG4 } = require2("./g4Independent.cjs");

/** S196 — mult-div-fluency-g4 (4.NBT.B.5, 4.NBT.B.6), Batch E course 1/5. Zero new generator code.
 *
 *  Family: g4-multiply, backed by the COMPUTATIONAL solver g4Independent.cjs. Every route it uses
 *  reads `ns` POSITIONALLY (ns[0]*ns[1], ns[0]/ns[1], ns[0]−ns[1]*ns[2], ceil(ns[0]/ns[1])), so a
 *  prompt that mentions any other number first silently routes to the wrong operands. Each graded
 *  answer is re-derived through the shipped solver here, and the positional shape is pinned
 *  separately, so an edit that breaks either fails in this file rather than in a lesson.
 *
 *  Two engine contracts are re-proven against the real schema helpers rather than the factory's
 *  ports, so the two cannot drift:
 *   - columnCalc(multiply) shares the ADD recursion with base = digit * b, which makes its
 *     reachable set far sparser than addition's (213 × 4 reaches only {842, 852}). Three trap
 *     sets were rejected on the first build for exactly this reason.
 *   - areaModel + requireFactors grades EITHER orientation, so the transpose must also fit the
 *     slider range, and factorFeedback is mandatory — without it a right-area/wrong-factors build
 *     falls through to lowFeedback/highFeedback, which describe being off on AREA and would be
 *     untrue. A legibility bound (side <= 30) is also asserted: the division lessons first
 *     generated a 312-wide grid, unreadable at 360px. */

const DIR = join(__dirname, "../../content/courses/mult-div-fluency-g4");
const FAMILY = "g4-multiply";
const registered = new Set(
  (VARIANT_GENERATORS.find((g) => g.tag === FAMILY)?.forms ?? []) as string[]
);
const CAPS = JSON.parse(
  readFileSync(join(__dirname, "../../scripts/engine-capabilities.json"), "utf8")
).types as Record<string, { manip: number }>;

describe("S196 mult-div-fluency-g4 — course shape and family reuse", () => {
  it("grade 4, 3 chapters sized 6/5/5, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(4);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([6, 5, 5]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(16);
    expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
  });

  it("declares only g4-multiply, every form registered", () => {
    expect(registered.size).toBeGreaterThan(0);
    for (const file of readdirSync(join(DIR, "lessons"))) {
      const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
      for (const s of lesson.steps as Array<{ id: string; variant?: { gen: string; form: string } }>) {
        if (!s.variant) continue;
        expect(s.variant.gen).toBe(FAMILY);
        expect(registered.has(s.variant.form),
          `${lesson.id}/${s.id}: ${FAMILY}/${s.variant.form} NOT registered`).toBe(true);
      }
    }
  });

  it("every interactive step uses an engine rated manip >= 2", () => {
    for (const file of readdirSync(join(DIR, "lessons"))) {
      const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
      for (const s of lesson.steps as Array<{ id: string; kind: string; widget?: { type: string } }>) {
        if (s.kind !== "interactive" || !s.widget) continue;
        const manip = CAPS[s.widget.type]?.manip ?? 0;
        expect(manip, `${lesson.id}/${s.id}: ${s.widget.type} rates manip ${manip}`).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe("S196 mult-div-fluency-g4 — routes re-derived, engine contracts held", () => {
  for (const file of readdirSync(join(DIR, "lessons")).sort()) {
    const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
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

        if (w.type === "columnCalc") {
          const reach = columnCalcReachable(w.op, w.a, w.b);
          const truth = columnCalcTruth(w.op, w.a, w.b);
          expect(reach.has(truth)).toBe(true);
          expect(reach.size, `${lesson.id}/${s.id}: no regrouping decision`).toBeGreaterThanOrEqual(2);
          expect(w.commonResults.length).toBeGreaterThanOrEqual(1);
          for (const t of w.commonResults) {
            expect(t.value, `${lesson.id}/${s.id}: trap equals truth`).not.toBe(truth);
            expect(reach.has(t.value),
              `${lesson.id}/${s.id}: trap ${t.value} unreachable — dead feedback`).toBe(true);
          }
          if (w.op === "multiply") {
            expect(w.b, `${lesson.id}/${s.id}: multiply needs a single-digit multiplier`).toBeGreaterThanOrEqual(2);
            expect(w.b).toBeLessThanOrEqual(9);
          }
        }
        if (w.type === "areaModel" && w.requireFactors) {
          const { w: fw, h: fh } = w.requireFactors;
          expect(fw * fh, `${lesson.id}/${s.id}: factors must build the area`).toBe(w.targetArea);
          // grading accepts either orientation, so BOTH sliders must reach both factors
          expect(fw).toBeLessThanOrEqual(w.wMax);
          expect(fh).toBeLessThanOrEqual(w.hMax);
          expect(fh, `${lesson.id}/${s.id}: transpose must fit wMax`).toBeLessThanOrEqual(w.wMax);
          expect(fw, `${lesson.id}/${s.id}: transpose must fit hMax`).toBeLessThanOrEqual(w.hMax);
          expect(w.factorFeedback, `${lesson.id}/${s.id}: requireFactors needs factorFeedback`).toBeTruthy();
          expect(Math.max(fw, fh), `${lesson.id}/${s.id}: side too wide to read at 360px`).toBeLessThanOrEqual(30);
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
          // pin the POSITIONAL shape each route depends on
          if (["mbMultiplyTensNumeric", "mbAreaModel1DigitNumeric", "mbAreaModel2DigitNumeric"].includes(f)) {
            expect(n[0] * n[1], `${lesson.id}/${s.id} ${f}: first two numbers are the factors`).toBe(w.answer);
          }
          if (f === "mbDivideBigNumeric") expect(n[0] / n[1]).toBe(w.answer);
          if (f === "mbRemaindersNumeric") {
            expect(n[0] - n[1] * n[2]).toBe(w.answer);
            expect(w.answer, `${lesson.id}/${s.id}: remainder must sit under the divisor`).toBeLessThan(n[1]);
            expect(w.answer).toBeGreaterThanOrEqual(0);
          }
          if (f === "mbInterpretRemaindersNumeric") expect(Math.ceil(n[0] / n[1])).toBe(w.answer);
          if (f === "mbMultiStepNumeric") expect(n[0] * n[1] - n[2]).toBe(w.answer);

          const vals = w.commonErrors.map((e) => e.value);
          expect(new Set(vals).size, `${lesson.id}/${s.id} duplicate traps`).toBe(vals.length);
          for (const e of w.commonErrors) {
            expect(e.value, `${lesson.id}/${s.id} trap equals answer`).not.toBe(w.answer);
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
          // solver-backed MCQs must also agree with the shipped solver
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
