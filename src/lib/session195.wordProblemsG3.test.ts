import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS } from "./variants";

const require2 = createRequire(import.meta.url);
/* eslint-disable @typescript-eslint/no-var-requires */
const { solvePrompt: solveG2 } = require2("./g2Independent.cjs");
const { solveG3FluencyPrompt: solveG3 } = require2("./g3FluencyIndependent.cjs");
/* eslint-enable @typescript-eslint/no-var-requires */

/** S195 — word-problems-g3 (3.OA.D.8), Batch D course 3/3. Zero new generator code.
 *
 *  No generator produces a two-step word problem, so this course is explicit about where each
 *  part of the reasoning is assessed. TwoStepTradeNumeric is a genuine two-step route
 *  (n0 − n1 + n2); the multiply and divide STEPS ride g3 fluency routes; and the parts no solver
 *  can grade — finding the hidden question, choosing the equation, judging reasonableness,
 *  spotting extra information — are authored MCQs whose distractors each name a real error.
 *
 *  Every graded numeric is re-derived through the shipped independent solver for its family, so
 *  a prompt edit that quietly breaks a positional route fails here rather than in a lesson.
 *
 *  The manipulatives are also pinned: each interactive step must use an engine rated manip >= 2
 *  in scripts/engine-capabilities.json. An earlier draft used dragBucket / matchPairs /
 *  steppedReveal, which rate manip 1 — a sort or a reveal is a pick, not a manipulation — and
 *  capped ten of these twelve lessons at Tier B/C. */

const DIR = join(__dirname, "../../content/courses/word-problems-g3");
const FAMILIES = ["g3-mult-fluency", "g3-div-fluency", "g2-add-subtract-100"] as const;
const G3_FAMILIES = new Set(["g3-mult-fluency", "g3-div-fluency"]);
const registered: Record<string, Set<string>> = {};
for (const tag of FAMILIES) {
  registered[tag] = new Set(
    (VARIANT_GENERATORS.find((g) => g.tag === tag)?.forms ?? []) as string[]
  );
}
const CAPS = JSON.parse(
  readFileSync(join(__dirname, "../../scripts/engine-capabilities.json"), "utf8")
).types as Record<string, { manip: number }>;

describe("S195 word-problems-g3 — course shape and family reuse", () => {
  it("grade 3, 3 chapters sized 4/4/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(3);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 4, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(12);
    expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
  });

  it("declares only the three computational families, every form registered, all used", () => {
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

  it("every interactive step uses an engine rated manip >= 2", () => {
    for (const file of readdirSync(join(DIR, "lessons"))) {
      const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
      for (const s of lesson.steps as Array<{ id: string; kind: string; widget?: { type: string } }>) {
        if (s.kind !== "interactive" || !s.widget) continue;
        const manip = CAPS[s.widget.type]?.manip ?? 0;
        expect(manip, `${lesson.id}/${s.id}: ${s.widget.type} rates manip ${manip}, below the Tier A gate`)
          .toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe("S195 word-problems-g3 — routes re-derived, widget contracts held", () => {
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

        if (w.type === "numberLineHop") {
          const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
          expect(land).toBeGreaterThanOrEqual(w.min);
          expect(land).toBeLessThanOrEqual(w.max);
          for (const t of w.commonLandings ?? []) expect(t.value).not.toBe(land);
        }
        if (w.type === "numberLinePlace") {
          expect(w.fractionDen, `${lesson.id}/${s.id}: integer line must not declare fractionDen`).toBeUndefined();
          expect(w.target).toBeGreaterThanOrEqual(w.min);
          expect(w.target).toBeLessThanOrEqual(w.max);
          for (const t of w.commonPlacements ?? []) expect(t.value).not.toBe(w.target);
        }
        if (w.type === "barBuilder") {
          expect(w.categories.length).toBe(w.target.length);
          expect(Math.max(...w.target)).toBeLessThanOrEqual(w.maxVal);
        }
        if (w.type === "tapDiagram") {
          expect(w.hotspots.some((h) => h.correct)).toBe(true);
          expect(w.hotspots.some((h) => !h.correct)).toBe(true);
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
          const gen = s.variant.gen as string;
          const derived = G3_FAMILIES.has(gen)
            ? solveG3(s.variant.form, w.prompt)
            : solveG2(s.variant.form, w.prompt);
          expect(derived, `${lesson.id}/${s.id} ${gen}/${s.variant.form}: ${w.prompt}`).toBe(w.answer);
          expect(evaluate(w, w.answer).correct).toBe(true);

          const n = (w.prompt.match(/\d+/g) ?? []).map(Number);
          const f = s.variant.form as string;
          // positional routes: pin the shape the solver depends on
          if (/^Mult(Table\d+|MixedSmall|MixedLarge|Squares|RecallSpeed|WholeTable|HardFacts)Numeric$/.test(f)) {
            expect(n[0] * n[1], `${lesson.id}/${s.id} ${f}: first two numbers are the factors`).toBe(w.answer);
          }
          if (f === "TwoStepTradeNumeric") expect(n[0] - n[1] + n[2]).toBe(w.answer);
          if (f === "DivMixedNumeric" || f === "DivThinkMultNumeric") expect(n[0] / n[1]).toBe(w.answer);
          if (f === "MultMissingFactorNumeric") expect(n[1] / n[0]).toBe(w.answer);

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
          const fb = w.options.map((o) => o.feedback);
          expect(new Set(fb).size).toBe(fb.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
        }
      }
    });
  }
});
