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

/** Ratchet of numeric check/challenge steps whose `variant` declaration was deliberately
 * withdrawn because a content rewrite changed the prompt SHAPE (not just its numbers) and no
 * registered g2-measure-money-time/g2-add-subtract-100 form produces the new shape. Withdrawn
 * steps stay withdrawn; every other numeric still re-derives via its declared form (S326-R1).
 *
 * g2p-02-02/k2+ch1: Signed PROGRESSION-g2p-02-02 (S318 PROG lane, verified S318-V2-g2p-02-02)
 * rewrote both as three-addend leg sums (15+12+9=36, 40+15+9=64, both hand-verified).
 *
 * g2p-01-01/ch1, g2p-02-01/ch1, g2p-03-02/ch1, g2p-03-03/ch1: Signed PROGRESSION-<lessonId>
 * (S329-PGB, LESSON_PROGRESSION_AND_DUPLICATION lane) closed a number-normalized-template
 * collision between ch1 and an earlier check by changing ch1's task, not just its numbers:
 *   g2p-01-01/ch1 adds a third length and a "shortest of the other two" selection step before
 *     the subtraction (54 − 28 = 26, jump rope 40 cm is the same-shape distractor);
 *   g2p-02-01/ch1 and g2p-03-02/ch1 join a third ribbon piece into the sum (25+23+15=63 and
 *     28+15+9=52) instead of two;
 *   g2p-03-03/ch1 reorders the two-step trade so the purchase happens BEFORE the cut
 *     (50 + 25 − 18 = 57), reversing the surface order every sibling in this lesson shares.
 * None of these four shapes are producible by a registered form; all four are hand-verified
 * here and re-checked below against evaluate()/commonErrors like every other numeric.
 *
 * g2p-02-03/k2: Signed PROGRESSION-g2p-02-03 (S330-G7, LESSON_PROGRESSION_AND_DUPLICATION
 * lane) closed a number-normalized-template collision with k1 (both "the whole trail runs #
 * meters and the first stretch covers # meters...") by flipping k2 to the COMPLEMENTARY
 * direction of the same fact family — given the two stretches, find the whole (35+22=57) —
 * instead of k1's given-the-whole-and-one-stretch, find-the-other (66−36=30). MmtLengthDifferenceNumeric
 * only generates the subtraction/remainder shape, not this addition shape, so the variant was
 * withdrawn rather than left mismatched; the new prompt is hand-verified here like every other
 * numeric. */
const POOL_WITHDRAWN: Record<string, string[]> = {
  "g2p-02-02": ["k2", "ch1"],
  "g2p-01-01": ["ch1"],
  "g2p-02-01": ["ch1"],
  "g2p-02-03": ["k2"],
  "g2p-03-02": ["ch1"],
  "g2p-03-03": ["ch1"],
};

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
          if (POOL_WITHDRAWN[lesson.id]?.includes(s.id)) {
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
