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

/** S197 — fraction-division-g5 (5.NF.B.3, 5.NF.B.7), Batch F course 3/6. Zero new generator code.
 *
 *  THE HAZARD THIS FILE PINS. g4-multiply routes read `ns` POSITIONALLY, and `ns` collects EVERY
 *  number in the prompt — including the two halves of a fraction written "1/4". Probed during the
 *  fit-check:
 *
 *      "Dividing by 1/4 asks how many fourths fit. Compute 3 × 4."   ->   graded 4, not 12
 *
 *  because ns became [1, 4, 3, 4] and the route returned ns[0] * ns[1]. The intended operands were
 *  never consumed, and nothing else in the pipeline would have noticed: the widget is well-formed,
 *  the schema is happy, and the authored answer simply disagrees with the solver. Every graded
 *  prompt here leads with its operands, and the check below re-derives the answer from ns[0]/ns[1]
 *  directly rather than trusting the prose. A prose edit that reintroduces a fraction before the
 *  expression fails here.
 *
 *  Also pinned: a fractionBar trap equal to the target's VALUE is dropped silently by the engine's
 *  filter, so each fractionBar must retain at least one wrong build. */

const DIR = join(__dirname, "../../content/courses/fraction-division-g5");
const FAMILIES = ["g4-fractions", "g4-multiply"] as const;
const registered: Record<string, Set<string>> = {};
for (const tag of FAMILIES) {
  registered[tag] = new Set(
    (VARIANT_GENERATORS.find((g) => g.tag === tag)?.forms ?? []) as string[]
  );
}
const CAPS = JSON.parse(
  readFileSync(join(__dirname, "../../scripts/engine-capabilities.json"), "utf8")
).types as Record<string, { manip: number }>;
const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);
const POSITIONAL = new Set(["mbMultiplyTensNumeric", "mbDivideBigNumeric", "mbInterpretRemaindersNumeric"]);

const lessons = readdirSync(join(DIR, "lessons")).sort()
  .map((f) => JSON.parse(readFileSync(join(DIR, "lessons", f), "utf8")));

describe("S197 fraction-division-g5 — course shape and family reuse", () => {
  it("grade 5, 3 chapters sized 4/4/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(5);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 4, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(12);
    expect(lessons.map((l) => l.id)).toEqual(declared);
  });

  it("declares only the two computational families, every form registered, both used", () => {
    const used = new Set<string>();
    for (const lesson of lessons) {
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

  it("every declared form GENERATES the widget surface the step was authored on", () => {
    const seen = new Map<string, { gen: string; type: string }>();
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ variant?: { gen: string; form: string }; widget?: { type: string } }>) {
        if (s.variant && s.widget) seen.set(s.variant.form, { gen: s.variant.gen, type: s.widget.type });
      }
    }
    expect(seen.size).toBeGreaterThan(0);
    for (const [form, { gen, type }] of seen) {
      const v = variantForGenForm(gen, form, `s197-surface-${form}`, "core");
      expect(v, `${gen}/${form} generated nothing`).toBeTruthy();
      expect(v!.widget.type, `${form} is authored as ${type} but GENERATES ${v!.widget.type}`).toBe(type);
    }
  });

  it("no positional prompt mentions a fraction before its graded operands", () => {
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ id: string; variant?: { form: string }; widget?: { type: string; prompt?: string } }>) {
        if (!s.variant || !POSITIONAL.has(s.variant.form) || !s.widget?.prompt) continue;
        const prompt = s.widget.prompt;
        const firstFraction = prompt.search(/\d+\s*\/\s*\d+/);
        const firstOperator = prompt.search(/[×÷]/);
        if (firstFraction >= 0 && firstOperator >= 0) {
          expect(firstFraction,
            `${lesson.id}/${s.id}: a fraction before the operator supplies ns[0]/ns[1] and hijacks the route`)
            .toBeGreaterThan(firstOperator);
        }
      }
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
});

describe("S197 fraction-division-g5 — routes re-derived, operands pinned", () => {
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

        if (w.type === "fractionBar") {
          expect(w.targetNum).toBeLessThanOrEqual(w.numMax);
          expect(w.targetDen).toBeLessThanOrEqual(w.denMax);
          for (const t of w.commonFractions) {
            expect(t.num).toBeLessThanOrEqual(w.numMax);
            expect(t.den).toBeLessThanOrEqual(w.denMax);
            expect(t.num * w.targetDen,
              `${lesson.id}/${s.id}: trap ${t.num}/${t.den} EQUALS the target's value and is filtered out`)
              .not.toBe(t.den * w.targetNum);
          }
          expect(w.commonFractions.length,
            `${lesson.id}/${s.id}: no surviving wrong build`).toBeGreaterThanOrEqual(1);
        }
        if (w.type === "numberLinePlace" && w.fractionDen !== undefined) {
          expect(w.min).toBe(0);
          expect(w.max).toBe(w.fractionDen);
          expect(w.step).toBe(1);
          expect(w.tickStep).toBe(1);
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
          // re-derive from ns POSITIONALLY — this is what caught "…1/4… Compute 3 × 4" grading 4
          if (f === "mbMultiplyTensNumeric") {
            expect(n[0] * n[1],
              `${lesson.id}/${s.id}: ns[0]*ns[1] must be the answer — an earlier fraction would hijack it`)
              .toBe(w.answer);
          }
          if (f === "mbDivideBigNumeric") expect(n[0] / n[1]).toBe(w.answer);
          if (f === "mbInterpretRemaindersNumeric") expect(Math.ceil(n[0] / n[1])).toBe(w.answer);
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
          if (f === "faWholeTimesFractionNumeric") {
            const m = w.prompt.match(/^Compute (\d+) × (\d+)\/(\d+)/);
            expect(m, `${lesson.id}/${s.id}: needs the leading "Compute W × N/D" shape`).toBeTruthy();
            expect(Number(m![1]) * Number(m![2])).toBe(w.answer);
          }

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
          expect(correct).toHaveLength(1);
          expect(w.options[0].correct, `${lesson.id}/${s.id} correct not at index 0`).toBe(true);
          const fb = w.options.map((o) => o.feedback);
          expect(new Set(fb).size).toBe(fb.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
        }
      }
    });
  }
});
