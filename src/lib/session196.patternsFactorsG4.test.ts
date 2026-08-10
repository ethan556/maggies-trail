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

/** S196 — patterns-factors-g4 (4.OA.B.4, 4.OA.C.5), Batch E course 3/5. Zero new generator code.
 *
 *  Family: g4-multiply. Two structural facts are pinned here because both were LEARNED the hard
 *  way earlier in this batch rather than assumed:
 *
 *  1. WIDGET SURFACE. A form named *Mcq does not necessarily GENERATE an mcq — g4-fractions'
 *     faBenchmarkCompareMcq renders an exactNumberLab, and the resolver gates on the surface.
 *     Every form this course declares is generated here and its widget type checked.
 *
 *  2. TIER A NEEDS A NUMERIC CHECK. flagship-tier scores `formal: 3` only when an ENTRY widget
 *     (numeric / fractionEntry / buildExpression / pointEntry) appears AFTER a manip>=2 step.
 *     Three lessons first shipped with all-MCQ checks, scored formal 1, and landed at Tier B.
 *     Every lesson must therefore carry at least one numeric check after its manipulative.
 *
 *  mbPatterns* models MULTIPLICATIVE rules only (the rule is the ratio of the first two numbers),
 *  which is why the additive-pattern lessons use authored MCQs rather than that route. */

const DIR = join(__dirname, "../../content/courses/patterns-factors-g4");
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

describe("S196 patterns-factors-g4 — course shape and family reuse", () => {
  it("grade 4, 3 chapters sized 4/2/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(4);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 2, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(10);
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
      expect(entryAfterManip,
        `${lesson.id}: all-MCQ checks score formal 1 and cap the lesson at Tier B`).toBe(true);
    }
  });
});

describe("S196 patterns-factors-g4 — routes re-derived, widget contracts held", () => {
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

        if (w.type === "areaModel" && w.requireFactors) {
          const { w: fw, h: fh } = w.requireFactors;
          expect(fw * fh).toBe(w.targetArea);
          expect(fh, `${lesson.id}/${s.id}: transpose must fit wMax`).toBeLessThanOrEqual(w.wMax);
          expect(fw, `${lesson.id}/${s.id}: transpose must fit hMax`).toBeLessThanOrEqual(w.hMax);
          expect(w.factorFeedback).toBeTruthy();
          expect(Math.max(fw, fh)).toBeLessThanOrEqual(30);
        }
        if (w.type === "numberLineHop") {
          const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
          expect(land).toBeGreaterThanOrEqual(w.min);
          expect(land).toBeLessThanOrEqual(w.max);
          for (const t of w.commonLandings ?? []) expect(t.value).not.toBe(land);
        }
        if (w.type === "barBuilder") {
          expect(w.categories.length).toBe(w.target.length);
          expect(Math.max(...w.target)).toBeLessThanOrEqual(w.maxVal);
        }
        if (w.type === "tapDiagram") {
          expect(w.hotspots.some((h) => h.correct)).toBe(true);
          expect(w.hotspots.some((h) => !h.correct)).toBe(true);
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
          if (f === "mbFactorsNumeric") expect(n[1] / n[0]).toBe(w.answer);
          if (f === "mbPrimeCompositeNumeric") expect(w.answer).toBe(2);
          if (f === "mbPatternsNumeric") expect(n[n.length - 1] * (n[1] / n[0])).toBe(w.answer);
          if (f === "mbTimesAsManyNumeric") expect(n[0] * n[1]).toBe(w.answer);

          const vals = w.commonErrors.map((e) => e.value);
          expect(new Set(vals).size, `${lesson.id}/${s.id} duplicate traps`).toBe(vals.length);
          for (const e of w.commonErrors) {
            expect(e.value).not.toBe(w.answer);
            expect(evaluate(w, e.value).correct).toBe(false);
            expect(e.feedback.length).toBeGreaterThanOrEqual(25);
          }
        } else if (w.type === "mcq") {
          expect(w.options.length).toBeGreaterThanOrEqual(2);
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
