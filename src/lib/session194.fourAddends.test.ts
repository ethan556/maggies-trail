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

/** S194 — four-addends-g2 (2.NBT.B.6), Batch C course 3/6. Zero new generator code.
 *  Every staged pair-sum prompt is re-derived by the REAL solver — which enforces the deepest
 *  design rule of this course: arithmetic() reads only the FIRST "a + b", so the first pair in
 *  every prompt must BE the intended computation (context lives in a trailing parenthetical).
 *  Add2DigitMcq's route is exercised too: the solver must pick the exact split-by-place label. */

const DIR = join(__dirname, "../../content/courses/four-addends-g2");
const registered = new Set(
  (VARIANT_GENERATORS.find((g) => g.tag === "g2-add-subtract-100")?.forms ?? []) as string[]
);

describe("S194 four-addends-g2 — course shape and generator reuse", () => {
  it("grade 2, 3 chapters sized 3/3/2, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(2);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([3, 3, 2]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(8);
    expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
  });

  it("declares only registered g2-add-subtract-100 forms — no new generator tag", () => {
    expect(registered.size).toBeGreaterThan(0);
    let declared = 0;
    for (const file of readdirSync(join(DIR, "lessons"))) {
      const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
      for (const s of lesson.steps as Array<{ id: string; variant?: { gen: string; form: string } }>) {
        if (!s.variant) continue;
        declared++;
        expect(s.variant.gen, `${lesson.id}/${s.id} new generator tag`).toBe("g2-add-subtract-100");
        expect(registered.has(s.variant.form), `${lesson.id}/${s.id}: ${s.variant.form} NOT registered`).toBe(true);
      }
    }
    expect(declared).toBeGreaterThan(20);
  });
});

describe("S194 four-addends-g2 — staged sums re-derived by the REAL solver", () => {
  for (const file of readdirSync(join(DIR, "lessons")).sort()) {
    const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
    it(`${lesson.id}: A-tier shape, first-pair prompts agree with the solver`, () => {
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

        if (w.type === "tapDiagram") {
          const nc = w.hotspots.filter((h) => h.correct).length;
          expect(nc).toBeGreaterThanOrEqual(1);
          if (w.mode === "selectOne") expect(nc).toBe(1);
          const dfb = w.hotspots.filter((h) => !h.correct).map((h) => h.feedback);
          expect(new Set(dfb).size, `${lesson.id}/${s.id} distractor feedback distinct`).toBe(dfb.length);
        }
        if (w.type === "numberLineHop") {
          const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
          expect(land >= w.min && land <= w.max, `${lesson.id}/${s.id} landing out of range`).toBe(true);
        }
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          const derived = solveG2(s.variant.form, w.prompt);
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
          expect(w.options[0].correct, `${lesson.id}/${s.id} correct not at index 0`).toBe(true);
          if (s.variant) {
            const derived = solveG2(s.variant.form,
              w.prompt + "||" + w.options.map((o) => o.label).join(";;"));
            expect(derived, `${lesson.id}/${s.id} ${s.variant.form} route disagrees`).toBe(correct[0].label);
          }
          const wrongFb = w.options.filter((o) => !o.correct).map((o) => o.feedback);
          expect(new Set(wrongFb).size).toBe(wrongFb.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
        }
      }
    });
  }
});
