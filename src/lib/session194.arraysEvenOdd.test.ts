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

/** S194 — arrays-even-odd-g2 (2.OA.C.3/C.4), Batch C course 2/6. Zero new generator code.
 *  Stronger than prior session tests: the REAL solver re-derives not only numerics but every
 *  VARIANT-CARRYING MCQ and pairs widget, exercising the route semantics —
 *    OddEvenMcq -> the even option label, ParitySumMcq -> the literal 'even' label,
 *    DoublesMcq -> the a+a option, OddEvenOddEvenPairs -> 'odd'/'even' from n.
 *  Plus the two pedagogy contracts this course tripped and fixed at source: the pairs widget may
 *  only carry the WRONG parity's feedback slot, and tapDiagram distractor feedback is distinct. */

const DIR = join(__dirname, "../../content/courses/arrays-even-odd-g2");
const registered = new Set(
  (VARIANT_GENERATORS.find((g) => g.tag === "g2-add-subtract-100")?.forms ?? []) as string[]
);

describe("S194 arrays-even-odd-g2 — course shape and generator reuse", () => {
  it("grade 2, 3 chapters sized 4/3/3, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(2);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 3, 3]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(10);
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
    // Re-pinned 32 -> 25 -> exactly 24: signed S318 PROG (g2a-02-03, verified
    // S318-V2-g2a-02-03) and s323-P6 (g2a-01-02/g2a-02-02/g2a-03-03) replaced
    // duplicate/regressive items with scenario- and repeated-sum-specific rewrites
    // that no registered generator form regenerates, withdrawing 7 declarations
    // (see POOL_WITHDRAWN below for the numeric ones). S330-G7 then redesigned
    // g2a-01-03/ch1 from a numeric "9 + 9 = ?" clone of k1/k3 into a hand-authored
    // misconception-comparison mcq (identify which of two even sums is a true
    // double) — a different question job with no matching registered form, so its
    // DoublesNumeric variant was deleted rather than left mismatched; it needs no
    // POOL_WITHDRAWN entry because that set only gates the numeric-widget branch
    // and ch1 is no longer numeric. Withdrawing 1 more declaration. Exact pin
    // ratchets both ways.
    expect(declared).toBe(24);
  });
});

// Signed variant withdrawals on NUMERIC checks (S318 PROG + s323-P6, S326-R1
// reconcile): these five repeated-sum array prompts are hand-verified truthful
// (7*4=28, 5*4=20, 18+6+6=30, 6*4=24, 21+7+7=35) but not derivable by any
// registered g2-add-subtract-100 form, so they are pool-withdrawn by design.
// Every other numeric check must still carry a solver-derivable variant.
const POOL_WITHDRAWN = new Set([
  "g2a-02-02/ch1", "g2a-02-03/k2", "g2a-02-03/ch1", "g2a-03-03/k3", "g2a-03-03/ch1",
]);

describe("S194 arrays-even-odd-g2 — REAL-solver re-derivation across widget kinds", () => {
  for (const file of readdirSync(join(DIR, "lessons")).sort()) {
    const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
    it(`${lesson.id}: A-tier shape, solver-agreed answers, coherent manipulatives`, () => {
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

        if (w.type === "oddEvenPairs") {
          expect(w.answer).toBe(w.n % 2 === 0 ? "even" : "odd");
          // Only the WRONG parity's slot may exist — the answer's own slot can never fire.
          if (w.answer === "even") {
            expect(w.oddFeedback && w.oddFeedback.length >= 25).toBe(true);
            expect((w as { evenFeedback?: string }).evenFeedback).toBeUndefined();
          } else {
            expect((w as { evenFeedback?: string }).evenFeedback!.length).toBeGreaterThanOrEqual(25);
            expect((w as { oddFeedback?: string }).oddFeedback).toBeUndefined();
          }
          if (s.variant) {
            expect(solveG2(s.variant.form, w.prompt), `${lesson.id}/${s.id} pairs solver`).toBe(w.answer);
          }
        }
        if (w.type === "tapDiagram") {
          const nc = w.hotspots.filter((h) => h.correct).length;
          expect(nc, `${lesson.id}/${s.id} needs a correct hotspot`).toBeGreaterThanOrEqual(1);
          if (w.mode === "selectOne") expect(nc).toBe(1);
          const dfb = w.hotspots.filter((h) => !h.correct).map((h) => h.feedback);
          expect(new Set(dfb).size, `${lesson.id}/${s.id} distractor feedback must be distinct`).toBe(dfb.length);
        }
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          if (POOL_WITHDRAWN.has(`${lesson.id}/${s.id}`)) {
            // Ratchet: a withdrawn step must stay withdrawn (no half-declared state).
            expect(s.variant, `${lesson.id}/${s.id} signed as pool-withdrawn`).toBeUndefined();
          } else {
            const derived = solveG2(s.variant.form, w.prompt);
            expect(derived, `${lesson.id}/${s.id} ${s.variant.form}: ${w.prompt}`).toBe(w.answer);
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
          expect(w.options[0].correct, `${lesson.id}/${s.id} correct not at index 0`).toBe(true);
          if (s.variant) {
            // Route-semantics check: the solver must select the authored correct label.
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
