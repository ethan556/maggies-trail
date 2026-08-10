import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS } from "./variants";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solve: solveG4 } = require2("./g4Independent.cjs");

/** S196 — fraction-multiply-g4 (4.NF.B.4), Batch E course 2/5. Zero new generator code.
 *
 *  Family: g4-fractions, backed by the COMPUTATIONAL solver g4Independent.cjs. Its routes are
 *  literal-text sensitive rather than purely positional — faWholeTimesFractionNumeric matches
 *  /^Compute (\d+) × (\d+)\/(\d+)/, the recipe route matches "(\d+) identical recipes each use
 *  (\d+)/(\d+)", and faLikeDenomWordNumeric SUBTRACTS instead of adding when the prompt contains
 *  "were available". Each of those shapes is pinned below so a prose edit cannot silently reroute
 *  a graded step.
 *
 *  Widget contracts re-proven here: fractionBar traps must sit inside the 1..12 sliders AND must
 *  not equal the target's VALUE (6/10 is a legal trap for 6/5; 12/10 would not be), and a
 *  numberLinePlace fraction line must be authored in JUMP UNITS (min 0, max = fractionDen,
 *  step 1, tickStep 1). Six traps were rejected on the first build for overflowing the sliders. */

const DIR = join(__dirname, "../../content/courses/fraction-multiply-g4");
const FAMILY = "g4-fractions";
const registered = new Set(
  (VARIANT_GENERATORS.find((g) => g.tag === FAMILY)?.forms ?? []) as string[]
);
const CAPS = JSON.parse(
  readFileSync(join(__dirname, "../../scripts/engine-capabilities.json"), "utf8")
).types as Record<string, { manip: number }>;

describe("S196 fraction-multiply-g4 — course shape and family reuse", () => {
  it("grade 4, 3 chapters sized 4/4/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(4);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 4, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(12);
    expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
  });

  it("declares only g4-fractions, every form registered", () => {
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

describe("S196 fraction-multiply-g4 — routes re-derived, widget contracts held", () => {
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
          expect(w.targetNum).toBeLessThanOrEqual(w.numMax);
          expect(w.targetDen).toBeLessThanOrEqual(w.denMax);
          for (const t of w.commonFractions) {
            expect(t.num, `${lesson.id}/${s.id}: trap numerator off the slider`).toBeLessThanOrEqual(w.numMax);
            expect(t.den, `${lesson.id}/${s.id}: trap denominator off the slider`).toBeLessThanOrEqual(w.denMax);
            expect(t.num).toBeGreaterThanOrEqual(w.numMin);
            expect(t.den).toBeGreaterThanOrEqual(w.denMin);
            expect(t.num * w.targetDen,
              `${lesson.id}/${s.id}: trap ${t.num}/${t.den} equals the target's VALUE`).not.toBe(t.den * w.targetNum);
          }
        }
        if (w.type === "numberLinePlace" && w.fractionDen !== undefined) {
          expect(w.min).toBe(0);
          expect(w.max).toBe(w.fractionDen);
          expect(w.step).toBe(1);
          expect(w.tickStep).toBe(1);
          for (const t of w.commonPlacements ?? []) expect(t.value).not.toBe(w.target);
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

          const f = s.variant.form as string;
          // pin the literal shapes these routes match on
          if (f === "faWholeTimesFractionNumeric") {
            const m = w.prompt.match(/^Compute (\d+) × (\d+)\/(\d+)/);
            expect(m, `${lesson.id}/${s.id}: missing the "Compute W × N/D" shape`).toBeTruthy();
            expect(Number(m![1]) * Number(m![2])).toBe(w.answer);
          }
          if (f === "faWholeTimesFractionWordNumeric") {
            const m = w.prompt.match(/(\d+) identical recipes each use (\d+)\/(\d+)/);
            expect(m, `${lesson.id}/${s.id}: missing the recipe shape`).toBeTruthy();
            expect(Number(m![1]) * Number(m![2])).toBe(w.answer);
          }
          if (f === "faLikeDenomWordNumeric") {
            expect(w.prompt.includes("were available"),
              `${lesson.id}/${s.id}: "were available" would flip this route to subtraction`).toBe(false);
          }
          if (f === "faImproperToMixedNumeric") {
            const m = w.prompt.match(/Convert (\d+)\/(\d+)/);
            expect(m).toBeTruthy();
            expect(Math.floor(Number(m![1]) / Number(m![2]))).toBe(w.answer);
          }
          if (f === "faMixedToImproperNumeric") {
            const m = w.prompt.match(/Convert (\d+) (\d+)\/(\d+)/);
            expect(m).toBeTruthy();
            expect(Number(m![1]) * Number(m![3]) + Number(m![2])).toBe(w.answer);
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
