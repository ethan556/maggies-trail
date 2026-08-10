import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, columnCalcReachable, columnCalcTruth, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS } from "./variants";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solvePrompt: solveG2 } = require2("./g2Independent.cjs");

/** S195 — add-subtract-1000-g3 (3.NBT.A.2), Batch D course 1/3. Zero new generator code.
 *
 *  CROSS-BAND REUSE. 3.NBT.A.2 is "fluently add and subtract within 1000", mathematically the
 *  same domain as g2-place-value-1000, which has a COMPUTATIONAL independent solver. The
 *  authored-template families used by the shipped g3 `place-value` course are backed by a
 *  LOOKUP-TABLE solver keyed to exact authored prompts and cannot carry new prompts at all.
 *  Precedent for declaring another band's family: g6 expressions-equations declares
 *  g7-tse-inequality-build. Every graded answer below is re-derived through the shipped
 *  solver, so the cross-band claim is proven per step rather than asserted.
 *
 *  The solver's arithmetic() tries "+" across the WHOLE prompt before it tries "−", so a
 *  subtract prompt containing any "+" would silently route to the wrong branch. That trap is
 *  asserted explicitly. columnCalc's reachability contract is re-proven here against the real
 *  schema helper (not the factory's port) so the two can never drift apart. */

const DIR = join(__dirname, "../../content/courses/add-subtract-1000-g3");
const FAMILIES = ["g2-place-value-1000", "g2-add-subtract-100"] as const;
const registered: Record<string, Set<string>> = {};
for (const tag of FAMILIES) {
  registered[tag] = new Set(
    (VARIANT_GENERATORS.find((g) => g.tag === tag)?.forms ?? []) as string[]
  );
}

describe("S195 add-subtract-1000-g3 — course shape and cross-band reuse", () => {
  it("grade 3, 3 chapters sized 4/3/3, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(3);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 3, 3]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(10);
    expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
  });

  it("declares only the two computational families, every form registered, both used", () => {
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
});

describe("S195 add-subtract-1000-g3 — routes re-derived, laboratory contracts held", () => {
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
          // re-proven against the REAL schema helper, so factory and schema cannot drift
          const reach = columnCalcReachable(w.op, w.a, w.b);
          const truth = columnCalcTruth(w.op, w.a, w.b);
          expect(reach.has(truth)).toBe(true);
          expect(reach.size, `${lesson.id}/${s.id}: no regrouping decision`).toBeGreaterThanOrEqual(2);
          expect(w.commonResults.length, `${lesson.id}/${s.id}: needs a diagnosable wrong path`).toBeGreaterThanOrEqual(1);
          for (const t of w.commonResults) {
            expect(t.value, `${lesson.id}/${s.id}: trap equals truth`).not.toBe(truth);
            expect(reach.has(t.value), `${lesson.id}/${s.id}: trap ${t.value} unreachable — dead feedback`).toBe(true);
          }
          if (w.op === "subtract") expect(w.a).toBeGreaterThanOrEqual(w.b);
        }
        if (w.type === "numberLineHop") {
          const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
          expect(land).toBeGreaterThanOrEqual(w.min);
          expect(land).toBeLessThanOrEqual(w.max);
          for (const t of w.commonLandings ?? []) expect(t.value).not.toBe(land);
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
          const derived = solveG2(s.variant.form, w.prompt);
          expect(derived, `${lesson.id}/${s.id} ${s.variant.gen}/${s.variant.form}: ${w.prompt}`).toBe(w.answer);
          expect(evaluate(w, w.answer).correct).toBe(true);

          const f = s.variant.form;
          // the solver tries "+" across the whole prompt BEFORE "−": a stray plus would hijack it
          if (f === "Pv1000SubtractByPlaceNumeric" || f === "Pv1000SubtractTradeNumeric") {
            expect(/\d\s*\+\s*\d/.test(w.prompt),
              `${lesson.id}/${s.id}: a "+" in a subtract prompt would route to the wrong branch`).toBe(false);
          }
          if (f === "TwoStepTradeNumeric") {
            const n = (w.prompt.match(/\d+/g) ?? []).map(Number);
            expect(n[0] - n[1] + n[2]).toBe(w.answer);
          }
          if (f === "Pv1000SkipHundredsNumeric") {
            const n = (w.prompt.match(/\d+/g) ?? []).map(Number);
            expect(n[n.length - 1] + 100).toBe(w.answer);
          }

          const vals = w.commonErrors.map((e) => e.value);
          expect(new Set(vals).size, `${lesson.id}/${s.id} duplicate traps`).toBe(vals.length);
          for (const e of w.commonErrors) {
            expect(e.value, `${lesson.id}/${s.id} trap equals answer`).not.toBe(w.answer);
            expect(evaluate(w, e.value).correct).toBe(false);
            expect(e.feedback.length).toBeGreaterThanOrEqual(25);
          }
        } else if (w.type === "mcq") {
          expect(w.options.length).toBeGreaterThanOrEqual(3);
          const correct = w.options.filter((o) => o.correct);
          expect(correct).toHaveLength(1);
          expect(w.options[0].correct, `${lesson.id}/${s.id} correct not at index 0`).toBe(true);
          const fb = w.options.map((o) => o.feedback);
          expect(new Set(fb).size).toBe(fb.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
          // solver-backed MCQs must also agree with the shipped solver
          if (s.variant) {
            const envelope = `${w.prompt}||${w.options.map((o) => o.label).join(";;")}`;
            const derived = solveG2(s.variant.form, envelope);
            expect(derived, `${lesson.id}/${s.id} ${s.variant.form}`).toBe(correct[0].label);
          }
        }
      }
    });
  }
});
