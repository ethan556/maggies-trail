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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solve: solveG4 } = require2("./g4Independent.cjs");

/** S195 — fractions-deeper-g3 (3.NF.A.1/2/3), Batch D course 2/3. Zero new generator code.
 *
 *  The shipped g3 `fractions` course rides AUTHORED-TEMPLATE families whose solver is a lookup
 *  table keyed to exact authored prompts — it cannot carry one new prompt. This course therefore
 *  reuses the two COMPUTATIONAL fraction families instead, and every graded answer below is
 *  re-derived through the shipped solver for whichever family the step declares:
 *    g2-shapes-shares -> g2Independent.solvePrompt(form, "prompt||label;;label")
 *    g4-fractions     -> g4Independent.solve(form, widget)
 *  Two route traps are asserted explicitly because they fail silently rather than loudly:
 *  faLikeDenomWordNumeric flips to SUBTRACTION when the prompt contains "were available", and
 *  faEquivalenceRecapNumeric requires the scaled numerator to divide evenly. */

const DIR = join(__dirname, "../../content/courses/fractions-deeper-g3");
const FAMILIES = ["g2-shapes-shares", "g4-fractions"] as const;
const registered: Record<string, Set<string>> = {};
for (const tag of FAMILIES) {
  registered[tag] = new Set(
    (VARIANT_GENERATORS.find((g) => g.tag === tag)?.forms ?? []) as string[]
  );
}
const solveFor = (gen: string, form: string, w: TWidget & { prompt: string; options?: Array<{ label: string }> }) => {
  if (gen === "g4-fractions") return solveG4(form, w);
  const envelope = w.options ? `${w.prompt}||${w.options.map((o) => o.label).join(";;")}` : w.prompt;
  return solveG2(form, envelope);
};

describe("S195 fractions-deeper-g3 — course shape and computational-family reuse", () => {
  it("grade 3, 3 chapters sized 5/5/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(3);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([5, 5, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(14);
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

describe("S195 fractions-deeper-g3 — routes re-derived, widget contracts held", () => {
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

        if (w.type === "fractionBar") {
          for (const t of w.commonFractions) {
            expect(t.num * w.targetDen, `${lesson.id}/${s.id}: trap ${t.num}/${t.den} equals the target VALUE`)
              .not.toBe(t.den * w.targetNum);
            expect(t.num).toBeGreaterThanOrEqual(w.numMin);
            expect(t.num).toBeLessThanOrEqual(w.numMax);
            expect(t.den).toBeGreaterThanOrEqual(w.denMin);
            expect(t.den).toBeLessThanOrEqual(w.denMax);
          }
        }
        if (w.type === "numberLinePlace" && w.fractionDen !== undefined) {
          // fraction lines must be authored in JUMP units, not coordinates
          expect([w.min, w.max, w.step, w.tickStep]).toEqual([0, w.fractionDen, 1, 1]);
          expect(w.target).toBeGreaterThanOrEqual(0);
          expect(w.target).toBeLessThanOrEqual(w.fractionDen);
          for (const t of w.commonPlacements ?? []) expect(t.value).not.toBe(w.target);
        }
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          const derived = solveFor(s.variant.gen, s.variant.form, w as never);
          expect(derived, `${lesson.id}/${s.id} ${s.variant.gen}/${s.variant.form}: ${w.prompt}`).toBe(w.answer);
          expect(evaluate(w, w.answer).correct).toBe(true);

          const f = s.variant.form;
          if (f === "faLikeDenomWordNumeric") {
            expect(w.prompt.includes("were available"),
              `${lesson.id}/${s.id}: "were available" silently flips this route to subtraction`).toBe(false);
          }
          if (f === "faEquivalenceRecapNumeric") {
            const m = w.prompt.match(/(\d+)\/(\d+) = \?\/(\d+)/);
            expect(m, `${lesson.id}/${s.id}: equivalence prompt shape`).toBeTruthy();
            expect((+m![1] * +m![3]) % +m![2], `${lesson.id}/${s.id}: scaled numerator must be whole`).toBe(0);
          }
          if (f === "Ssg2ThirdsCountNumeric") expect(w.answer).toBe(3);

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
          if (s.variant) {
            const derived = solveFor(s.variant.gen, s.variant.form, w as never);
            expect(derived, `${lesson.id}/${s.id} ${s.variant.form}`).toBe(correct[0].label);
          }
        }
      }
    });
  }
});
