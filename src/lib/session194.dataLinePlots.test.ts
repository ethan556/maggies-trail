import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, dotPlotLabel, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS } from "./variants";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solvePrompt: solveG2 } = require2("./g2Independent.cjs");

/** S194 — data-line-plots-g2 (2.MD.D.9/D.10), Batch C course 6/6. Zero new generator code.
 *  Graph-reading routes are all positional: LinePlot/BarGraph/PictureGraph take the prompt's
 *  FIRST number, GraphCompare and RulerSubtract take n[1]−n[0] (smaller first), and
 *  put-together questions ride the cross-family Add2Digit arithmetic route. The dotPlot
 *  widget is READ-ONLY by lint contract (given === target, asked stack non-empty, an
 *  alternative stack reachable) and renders whole-number labels through GCD reduction —
 *  both invariants are asserted here so a future edit cannot silently break them. */

const DIR = join(__dirname, "../../content/courses/data-line-plots-g2");
const FAMILIES = ["g2-measure-money-time", "g2-add-subtract-100"] as const;
const registered: Record<string, Set<string>> = {};
for (const tag of FAMILIES) {
  registered[tag] = new Set(
    (VARIANT_GENERATORS.find((g) => g.tag === tag)?.forms ?? []) as string[]
  );
}

describe("S194 data-line-plots-g2 — course shape and cross-family reuse", () => {
  it("grade 2, 3 chapters sized 5/4/3, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(2);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([5, 4, 3]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(12);
    expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
  });

  it("declares only the two known families, every form registered, both used", () => {
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

describe("S194 data-line-plots-g2 — graph routes re-derived, display contracts held", () => {
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

        if (w.type === "dotPlot") {
          expect(w.given, `${lesson.id}/${s.id} dotPlot must be read-only (given === target)`).toEqual(w.target);
          const ask = w.askIndex ?? 0;
          expect(w.target[ask], `${lesson.id}/${s.id} asked stack must be non-empty`).toBeGreaterThan(0);
          expect(w.target.filter((_, i) => i !== ask).some((c) => c > 0),
            `${lesson.id}/${s.id} an alternative non-empty stack must exist`).toBe(true);
          for (const v of w.values) {
            const label = dotPlotLabel(v, w.denominator);
            expect(label, `${lesson.id}/${s.id} label ${v}/${w.denominator} must reduce to a whole number`)
              .not.toContain("/");
          }
          expect(Math.max(...w.target)).toBeLessThanOrEqual(w.maxPerValue);
        }
        if (w.type === "barBuilder") {
          expect(["bar", "tally", "pictograph"]).toContain(w.display);
          expect(w.categories.length).toBe(w.target.length);
          expect(Math.max(...w.target)).toBeLessThanOrEqual(w.maxVal);
        }
        if (w.type === "graphRead") {
          expect(["picture", "bar", "tally"]).toContain(w.mode);
          expect(w.drawn).toBeLessThanOrEqual(w.scaleMax);
          for (const t of w.commonResults) expect(t.value).not.toBe(w.drawn);
        }
        if (w.type === "unitRuler") {
          expect(w.objectEnd - w.objectStart).toBe(w.requiredPlacements * w.targetUnitSize);
        }
      }

      const buildDisplays = new Set<string>();
      for (const s of lesson.steps) {
        if (s.widget?.type === "barBuilder") buildDisplays.add(s.widget.display);
      }
      if (lesson.id === "g2g-01-02") expect(buildDisplays.has("tally")).toBe(true);
      if (lesson.id === "g2g-02-01") expect(buildDisplays.has("pictograph")).toBe(true);
      if (lesson.id === "g2g-02-03") expect(buildDisplays.has("bar")).toBe(true);

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          const derived = solveG2(s.variant.form, w.prompt);
          expect(derived, `${lesson.id}/${s.id} ${s.variant.gen}/${s.variant.form}: ${w.prompt}`).toBe(w.answer);
          expect(evaluate(w, w.answer).correct).toBe(true);
          const nums = (w.prompt.match(/\d+/g) ?? []).map(Number);
          const f = s.variant.form;
          if (f === "MmtLinePlotNumeric" || f === "MmtBarGraphNumeric" || f === "MmtPictureGraphNumeric") {
            expect(nums[0], `${lesson.id}/${s.id} ${f}: first number is the answer`).toBe(w.answer);
          }
          if (f === "MmtGraphCompareNumeric" || f === "MmtRulerSubtractNumeric") {
            expect(nums[1] - nums[0], `${lesson.id}/${s.id} ${f}: n1−n0 order`).toBe(w.answer);
            expect(nums[1]).toBeGreaterThan(nums[0]);
          }
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
