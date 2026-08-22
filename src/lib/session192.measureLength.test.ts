import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS } from "./variants";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solvePrompt: solveG1Prompt } = require2("./g1Independent.cjs");

/** S192 — measure-length-g1. Claims proven against shipped code:
 *  1. No new generator tag: every declared variant is g1-shapes-measure, and every declared form
 *     is REGISTERED (S191 lesson — solvePrompt's permissive fallback makes solver agreement alone
 *     insufficient evidence).
 *  2. Every numeric answer re-derived by the REAL shipped solver from the authored prompt.
 *  3. The manipulatives are internally consistent: unitRuler placements must exactly tile the
 *     object span, and lengthCompare's answerId must be the genuinely longer item — a wrong
 *     answerId would teach the misconception the lesson exists to correct. */

const DIR = join(__dirname, "../../content/courses/measure-length-g1");
const registered = new Set(
  (VARIANT_GENERATORS.find((g) => g.tag === "g1-shapes-measure")?.forms ?? []) as string[]
);

describe("S192 measure-length-g1 — course shape and generator reuse", () => {
  it("grade 1, 3 chapters sized 4/3/3, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(1);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 3, 3]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(10);
    expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
  });

  it("declares only registered g1-shapes-measure forms — no new generator tag", () => {
    expect(registered.size).toBeGreaterThan(0);
    let declared = 0;
    for (const file of readdirSync(join(DIR, "lessons"))) {
      const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
      for (const s of lesson.steps as Array<{ id: string; variant?: { gen: string; form: string } }>) {
        if (!s.variant) continue;
        declared++;
        expect(s.variant.gen, `${lesson.id}/${s.id} new generator tag`).toBe("g1-shapes-measure");
        expect(registered.has(s.variant.form), `${lesson.id}/${s.id}: ${s.variant.form} NOT registered`).toBe(true);
      }
    }
    expect(declared).toBeGreaterThan(0);
  });
});

describe("S192 measure-length-g1 — gradable, re-derived, manipulatives coherent", () => {
  for (const file of readdirSync(join(DIR, "lessons")).sort()) {
    const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
    it(`${lesson.id}: A-tier shape, real-solver re-derivation, coherent manipulatives`, () => {
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

        if (w.type === "unitRuler") {
          // The count the learner is asked to produce must actually tile the object exactly.
          expect(w.requiredPlacements * w.targetUnitSize,
            `${lesson.id}/${s.id}: ${w.requiredPlacements} x ${w.targetUnitSize} must equal the span`)
            .toBe(w.objectEnd - w.objectStart);
          expect(w.allowedUnitSizes).toContain(w.targetUnitSize);
          // The starting unit must differ from the target, or choosing the unit teaches nothing.
          expect(w.startUnitSize).not.toBe(w.targetUnitSize);
        }
        if (w.type === "lengthCompare") {
          const answer = w.items.find((it) => it.id === w.answerId);
          expect(answer, `${lesson.id}/${s.id} answerId not among items`).toBeTruthy();
          const longest = [...w.items].sort((a, b) => b.length - a.length)[0];
          expect(answer!.id, `${lesson.id}/${s.id}: answerId is not the longer item`).toBe(longest.id);
          // A shifted start is the whole point: without an offset the align step is vacuous.
          expect(w.items.some((it) => (it.startOffset ?? 0) > 0)).toBe(true);
        }
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          const derived = solveG1Prompt(s.variant.form, w.prompt);
          expect(derived, `${lesson.id}/${s.id} ${s.variant.form}: ${w.prompt}`).toBe(w.answer);
          expect(evaluate(w, w.answer).correct).toBe(true);
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
          // NOT position-0-pinned here, unlike this file's sibling S192 courses: S314 deliberately
          // moved every main-sequence MCQ's correct option off raw index 0 course-wide (the
          // "fixed-answer-position" repair — see session314.measureLengthG1ChoiceOrder.test.ts,
          // which hash-pins the resulting non-zero position distribution). Grading-by-id is what
          // this file verifies; exact authored position is that dedicated suite's contract, not
          // this one's.
          const wrongFb = w.options.filter((o) => !o.correct).map((o) => o.feedback);
          expect(new Set(wrongFb).size).toBe(wrongFb.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
        }
      }
    });
  }
});
