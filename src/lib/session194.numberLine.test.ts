import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS } from "./variants";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solvePrompt: solveG2 } = require2("./g2Independent.cjs");

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

/** S194 — number-line-g2 (2.MD.B.6), Batch C course 4/6. Zero new generator code.
 *  numberLineHop's home course: every lesson carries the manipulative, both directions, and every
 *  hop's landing is recomputed from start/hop/hops/direction. Numerics ride TWO families
 *  (cross-family precedent: equations-unknowns-g1) — additions on g2-add-subtract-100 and
 *  subtractions on g2-place-value-1000 — so the registered-form check dispatches per declared gen
 *  instead of assuming one family. */

const DIR = join(__dirname, "../../content/courses/number-line-g2");
const FAMILIES = ["g2-add-subtract-100", "g2-place-value-1000"] as const;
const registered: Record<string, Set<string>> = {};
for (const tag of FAMILIES) {
  registered[tag] = new Set(
    (VARIANT_GENERATORS.find((g) => g.tag === tag)?.forms ?? []) as string[]
  );
}

describe("S194 number-line-g2 — course shape and cross-family reuse", () => {
  it("grade 2, 3 chapters sized 3/3/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(2);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([3, 3, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(10);
    expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
  });

  it("declares only the two known families, every form registered, both families actually used", () => {
    for (const tag of FAMILIES) expect(registered[tag].size).toBeGreaterThan(0);
    const used = new Set<string>();
    for (const file of readdirSync(join(DIR, "lessons"))) {
      const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
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

  it("every lesson's manipulative is a numberLineHop, and at least one lesson hops backward", () => {
    let backLessons = 0;
    for (const file of readdirSync(join(DIR, "lessons"))) {
      const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
      const interactives = lesson.steps.filter((s: { kind: string }) => s.kind === "interactive");
      expect(interactives.length).toBe(2);
      for (const s of interactives) expect(s.widget.type).toBe("numberLineHop");
      if (interactives.some((s: { widget: { direction: string } }) => s.widget.direction === "back")) backLessons++;
    }
    expect(backLessons, "the subtraction lessons must hop backward").toBeGreaterThanOrEqual(2);
  });
});

describe("S194 number-line-g2 — solver-agreed numerics, recomputed landings", () => {
  for (const file of readdirSync(join(DIR, "lessons")).sort()) {
    const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
    it(`${lesson.id}: A-tier shape, hop landings in range, REAL-solver agreement`, () => {
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
          expect(land >= w.min && land <= w.max, `${lesson.id}/${s.id} landing ${land} out of range`).toBe(true);
          for (const t of w.commonLandings ?? []) {
            expect(t.value, `${lesson.id}/${s.id} hop trap equals landing`).not.toBe(land);
            expect(t.feedback.length).toBeGreaterThanOrEqual(25);
          }
        }
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          // A small minority of numeric checks in this course (e.g. a "how many ten-hops"
          // count, or a three-jump running total) ask a question neither g2-add-subtract-100
          // nor g2-place-value-1000 has a registered form for. Re-deriving those through
          // solveG2 would mean inventing a new generator tag, exactly what this file's own
          // docstring says NOT to do — so the two known no-variant prompts get a narrow,
          // test-local re-derivation instead (arithmetic on the matched prompt text, not new
          // generator/production code). Where a variant IS declared, the real solver must still
          // agree. A no-variant widget whose prompt matches neither known pattern throws rather
          // than silently skipping, so a future no-variant addition can't go unverified by accident.
          if (s.variant) {
            const derived = solveG2(s.variant.form, w.prompt);
            expect(derived, `${lesson.id}/${s.id} ${s.variant.gen}/${s.variant.form}: ${w.prompt}`).toBe(w.answer);
          } else {
            const jumpMatch = w.prompt.match(/^Marks sit every (\d+), starting at (\d+)\. After (\w+) jumps?, what mark do you land on\?$/);
            const hopMatch = w.prompt.match(/^Jumping backward by tens, (\d+) lands on (\d+)\. How many ten-hops was that\?$/);
            if (jumpMatch) {
              const step = Number(jumpMatch[1]), start = Number(jumpMatch[2]), n = WORD_NUMBERS[jumpMatch[3]];
              expect(n, `${lesson.id}/${s.id}: unrecognized jump-count word "${jumpMatch[3]}"`).toBeDefined();
              expect(w.answer, `${lesson.id}/${s.id}: ${w.prompt}`).toBe(start + step * n!);
            } else if (hopMatch) {
              const from = Number(hopMatch[1]), to = Number(hopMatch[2]);
              expect((from - to) % 10, `${lesson.id}/${s.id}: ${w.prompt}`).toBe(0);
              expect(w.answer, `${lesson.id}/${s.id}: ${w.prompt}`).toBe((from - to) / 10);
            } else {
              throw new Error(`${lesson.id}/${s.id}: no variant declared and no known no-variant pattern matches prompt "${w.prompt}" — either declare a variant, or add a matching independent re-derivation branch above.`);
            }
          }
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
          // NOT position-0-pinned: S308 deliberately moved every main-sequence MCQ's correct
          // option off raw index 0 course-wide (see session308.numberLineG2ChoiceOrder.test.ts,
          // which hash-pins the resulting non-zero position distribution). Grading-by-id is what
          // this file verifies; exact authored position is that dedicated suite's contract.
          const wrongFb = w.options.filter((o) => !o.correct).map((o) => o.feedback);
          expect(new Set(wrongFb).size).toBe(wrongFb.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
        }
      }
    });
  }
});
