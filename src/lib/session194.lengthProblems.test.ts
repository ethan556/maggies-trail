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

/** S194 — length-problems-g2 (2.MD.A.4/B.5), Batch C course 5/6. Zero new generator code.
 *  Three distinct numeric route SHAPES coexist here and the REAL solver re-derives all of them:
 *  positional n0−n1 (length difference: larger length must lead the prose), positional n1−n0
 *  (ruler marks: smaller mark leads), and symbolic arithmetic / n0−n1+n2 (joins, two-step).
 *  MmtLengthCompareMcq's tuple-parsing route is exercised through the solver's || envelope.
 *  Manipulative field sets were templated from the shipped measure-length-g1 corpus at build
 *  time; this test proves the adapted widgets still parse and stay internally coherent. */

const DIR = join(__dirname, "../../content/courses/length-problems-g2");
const FAMILIES = ["g2-measure-money-time", "g2-add-subtract-100"] as const;
const registered: Record<string, Set<string>> = {};
for (const tag of FAMILIES) {
  registered[tag] = new Set(
    (VARIANT_GENERATORS.find((g) => g.tag === tag)?.forms ?? []) as string[]
  );
}

describe("S194 length-problems-g2 — course shape and cross-family reuse", () => {
  it("grade 2, 3 chapters sized 3/3/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(2);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([3, 3, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(10);
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

describe("S194 length-problems-g2 — three route shapes re-derived by the REAL solver", () => {
  for (const file of readdirSync(join(DIR, "lessons")).sort()) {
    const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
    it(`${lesson.id}: A-tier shape, solver agreement across positional and symbolic routes`, () => {
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

        if (w.type === "lengthCompare") {
          const byId = Object.fromEntries(w.items.map((it) => [it.id, it.length]));
          const longest = w.items.reduce((a, b) => (a.length >= b.length ? a : b)).id;
          expect(w.answerId, `${lesson.id}/${s.id} lengthCompare answer must be the longer item`).toBe(longest);
          expect(byId[w.answerId]).toBeGreaterThan(
            Math.min(...w.items.map((it) => it.length)));
        }
        if (w.type === "unitRuler") {
          expect(w.objectEnd - w.objectStart,
            `${lesson.id}/${s.id} placements must tile the object`).toBe(w.requiredPlacements * w.targetUnitSize);
          expect(w.allowedUnitSizes).toContain(w.targetUnitSize);
        }
        if (w.type === "numberLineHop") {
          const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
          expect(land >= w.min && land <= w.max, `${lesson.id}/${s.id} landing out of range`).toBe(true);
        }
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          // Signed PROGRESSION-g2p-02-02 (S318 PROG lane, verified S318-V2-g2p-02-02)
          // rewrote k2/ch1 as three-addend leg sums (15+12+9=36, 40+15+9=64, both
          // hand-verified) that no registered form derives; their variant declarations
          // were withdrawn with the rewrite. Ratchet: withdrawn steps stay withdrawn,
          // every other numeric still re-derives via its declared form (S326-R1).
          if (lesson.id === "g2p-02-02" && (s.id === "k2" || s.id === "ch1")) {
            expect(s.variant, `${lesson.id}/${s.id} signed as pool-withdrawn`).toBeUndefined();
          } else {
            const derived = solveG2(s.variant.form, w.prompt);
            expect(derived, `${lesson.id}/${s.id} ${s.variant.gen}/${s.variant.form}: ${w.prompt}`).toBe(w.answer);
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
