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

/** S196 — multistep-g4 (4.OA.A.3), Batch E course 5/5. Zero new generator code.
 *
 *  Family: g4-multiply (computational). Every route reads `ns` POSITIONALLY, so operand order in
 *  the prose is load-bearing and is pinned per step below rather than trusted.
 *
 *  One route is TYPOGRAPHICALLY sensitive: mbComparisonEquationsMcq matches
 *  /“(\d+) is (\d+) times as many as (\d+)”/ with CURLY quotes. Straight quotes silently fail to
 *  match and the route throws, so the quote characters are asserted.
 *
 *  Tier A also requires `formal: 3` — a numeric check AFTER a manip>=2 step. That is asserted
 *  here and in the factory, because discovering it from a tier run costs a rebuild (three lessons
 *  in patterns-factors-g4 shipped all-MCQ checks and landed at Tier B). */

const DIR = join(__dirname, "../../content/courses/multistep-g4");
const FAMILY = "g4-multiply";
const registered = new Set(
  (VARIANT_GENERATORS.find((g) => g.tag === FAMILY)?.forms ?? []) as string[]
);
const CAPS = JSON.parse(
  readFileSync(join(__dirname, "../../scripts/engine-capabilities.json"), "utf8")
).types as Record<string, { manip: number }>;
const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);

const lessons = readdirSync(join(DIR, "lessons")).sort()
  .map((f) => JSON.parse(readFileSync(join(DIR, "lessons", f), "utf8")));

describe("S196 multistep-g4 — course shape and family reuse", () => {
  it("grade 4, 3 chapters sized 3/3/2, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(4);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([3, 3, 2]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(8);
    expect(lessons.map((l) => l.id)).toEqual(declared);
  });

  it("declares only g4-multiply, every form registered", () => {
    expect(registered.size).toBeGreaterThan(0);
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ id: string; variant?: { gen: string; form: string } }>) {
        if (!s.variant) continue;
        expect(s.variant.gen).toBe(FAMILY);
        expect(registered.has(s.variant.form),
          `${lesson.id}/${s.id}: ${FAMILY}/${s.variant.form} NOT registered`).toBe(true);
      }
    }
  });

  it("every declared form GENERATES the widget surface the step was authored on", () => {
    const seen = new Map<string, string>();
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ variant?: { form: string }; widget?: { type: string } }>) {
        if (s.variant && s.widget) seen.set(s.variant.form, s.widget.type);
      }
    }
    expect(seen.size).toBeGreaterThan(0);
    for (const [form, authoredType] of seen) {
      const v = variantForGenForm(FAMILY, form, `s196-surface-${form}`, "core");
      expect(v, `${FAMILY}/${form} generated nothing`).toBeTruthy();
      expect(v!.widget.type,
        `${form} is authored as ${authoredType} but GENERATES ${v!.widget.type}`).toBe(authoredType);
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

describe("S196 multistep-g4 — routes re-derived, operand order pinned", () => {
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

        if (w.type === "barBuilder") {
          expect(w.categories.length).toBe(w.target.length);
          expect(Math.max(...w.target)).toBeLessThanOrEqual(w.maxVal);
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
        if (w.type === "areaModel" && w.requireFactors) {
          const { w: fw, h: fh } = w.requireFactors;
          expect(fw * fh).toBe(w.targetArea);
          expect(fh).toBeLessThanOrEqual(w.wMax);
          expect(fw).toBeLessThanOrEqual(w.hMax);
          expect(w.factorFeedback).toBeTruthy();
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
          if (f === "mbMultiStepNumeric") expect(n[0] * n[1] - n[2]).toBe(w.answer);
          if (f === "mbComparisonEquationsNumeric") {
            expect(n[0] / n[1]).toBe(w.answer);
            expect(n[0], `${lesson.id}/${s.id}: the LARGER quantity must come first`).toBeGreaterThan(n[1]);
          }
          if (f === "mbAdditiveVsMultiplicativeNumeric") expect(n[0] * n[1] - (n[0] + n[1])).toBe(w.answer);
          if (f === "mbRemaindersNumeric") {
            expect(n[0] - n[1] * n[2]).toBe(w.answer);
            expect(w.answer, `${lesson.id}/${s.id}: remainder must sit under the divisor`).toBeLessThan(n[1]);
          }
          if (f === "mbInterpretRemaindersNumeric") expect(Math.ceil(n[0] / n[1])).toBe(w.answer);
          if (f === "mbFactorsNumeric") expect(n[1] / n[0]).toBe(w.answer);

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

          if (s.variant) {
            if (s.variant.form === "mbComparisonEquationsMcq") {
              // the route's regex uses CURLY quotes; straight quotes make it throw
              expect(/\u201c\d+ is \d+ times as many as \d+\u201d/.test(w.prompt),
                `${lesson.id}/${s.id}: needs curly quotes around the comparison sentence`).toBe(true);
            }
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
