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

/** S194 — add-subtract-1000-g2 (2.NBT.B.7/B.8/B.9), Batch C course 1/6.
 *  Zero new generator code: every declared variant is g2-place-value-1000 with a REGISTERED form
 *  (S191 lesson — solver agreement alone is insufficient; the permissive fallback masks unwired
 *  forms), and every numeric answer is re-derived by the REAL shipped solver from the authored
 *  prompt. baseTenCompose traps must be reachable under the widget caps and must not collide
 *  with the target; numberLineHop landings must stay in range. */

const DIR = join(__dirname, "../../content/courses/add-subtract-1000-g2");
const registered = new Set(
  (VARIANT_GENERATORS.find((g) => g.tag === "g2-place-value-1000")?.forms ?? []) as string[]
);

describe("S194 add-subtract-1000-g2 — course shape and generator reuse", () => {
  it("grade 2, 3 chapters sized 5/6/5, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(2);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([5, 6, 5]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(16);
    expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
  });

  it("declares only registered g2-place-value-1000 forms — no new generator tag", () => {
    expect(registered.size).toBeGreaterThan(0);
    let declared = 0;
    for (const file of readdirSync(join(DIR, "lessons"))) {
      const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
      for (const s of lesson.steps as Array<{ id: string; variant?: { gen: string; form: string } }>) {
        if (!s.variant) continue;
        declared++;
        expect(s.variant.gen, `${lesson.id}/${s.id} new generator tag`).toBe("g2-place-value-1000");
        expect(registered.has(s.variant.form), `${lesson.id}/${s.id}: ${s.variant.form} NOT registered`).toBe(true);
      }
    }
    expect(declared).toBeGreaterThan(30);
  });
});

describe("S194 add-subtract-1000-g2 — re-derived numerics, coherent manipulatives", () => {
  for (const file of readdirSync(join(DIR, "lessons")).sort()) {
    const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
    it(`${lesson.id}: A-tier shape, REAL-solver re-derivation, reachable compose traps`, () => {
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

        if (w.type === "baseTenCompose") {
          expect(100 * w.maxHundreds + 10 * w.maxTens + w.maxOnes,
            `${lesson.id}/${s.id}: target unreachable under caps`).toBeGreaterThanOrEqual(w.target);
          for (const b of w.commonBuilds) {
            expect(b.hundreds <= w.maxHundreds && b.tens <= w.maxTens && b.ones <= w.maxOnes,
              `${lesson.id}/${s.id}: trap build exceeds caps (unreachable feedback)`).toBe(true);
            const v = 100 * b.hundreds + 10 * b.tens + b.ones;
            if (!w.requireStandard) {
              expect(v, `${lesson.id}/${s.id}: non-standard trap equals target`).not.toBe(w.target);
            }
            expect(b.feedback.length).toBeGreaterThanOrEqual(25);
          }
        }
        if (w.type === "numberLineHop") {
          const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
          expect(land >= w.min && land <= w.max, `${lesson.id}/${s.id}: landing out of range`).toBe(true);
          for (const t of w.commonLandings ?? []) {
            expect(t.value, `${lesson.id}/${s.id}: hop trap equals landing`).not.toBe(land);
          }
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
          const wrongFb = w.options.filter((o) => !o.correct).map((o) => o.feedback);
          expect(new Set(wrongFb).size).toBe(wrongFb.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
        }
      }
    });
  }
});
