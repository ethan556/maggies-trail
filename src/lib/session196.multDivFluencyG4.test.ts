import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetSpec, widgetIntegrityErrors, columnCalcReachable, columnCalcTruth, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS } from "./variants";

/** S196 — mult-div-fluency-g4 (4.NBT.B.5, 4.NBT.B.6), Batch E course 1/5. Zero new generator code.
 *
 *  Family: g4-multiply. The original regression parsed operands positionally from learner copy,
 *  making clearer question jobs fail whenever an explanatory number appeared before the target
 *  equation. S248 replaces that brittle copy parser with a fixed, independently reviewed answer
 *  snapshot while retaining variant registration, evaluator, trap, and engine-contract checks.
 *
 *  Two engine contracts are re-proven against the real schema helpers rather than the factory's
 *  ports, so the two cannot drift:
 *   - columnCalc(multiply) shares the ADD recursion with base = digit * b, which makes its
 *     reachable set far sparser than addition's (213 × 4 reaches only {842, 852}). Three trap
 *     sets were rejected on the first build for exactly this reason.
 *   - areaModel + requireFactors grades EITHER orientation, so the transpose must also fit the
 *     slider range, and factorFeedback is mandatory — without it a right-area/wrong-factors build
 *     falls through to lowFeedback/highFeedback, which describe being off on AREA and would be
 *     untrue. A legibility bound (side <= 30) is also asserted: the division lessons first
 *     generated a 312-wide grid, unreadable at 360px. */

const DIR = join(__dirname, "../../content/courses/mult-div-fluency-g4");
const FAMILY = "g4-multiply";
const registered = new Set(
  (VARIANT_GENERATORS.find((g) => g.tag === FAMILY)?.forms ?? []) as string[]
);
const CAPS = JSON.parse(
  readFileSync(join(__dirname, "../../scripts/engine-capabilities.json"), "utf8")
).types as Record<string, { manip: number }>;

const EXPECTED_NUMERIC_ANSWERS: Record<string, number> = {
  "g4m-01-01/k1": 3500, "g4m-01-01/k3": 1600, "g4m-01-01/ch1": 8000,
  "g4m-01-02/k1": 76, "g4m-01-02/k3": 195, "g4m-01-02/ch1": 45,
  "g4m-01-03/k1": 160, "g4m-01-03/k2": 288, "g4m-01-03/k3": 2700, "g4m-01-03/ch1": 45,
  "g4m-01-04/k1": 126, "g4m-01-04/k2": 66, "g4m-01-04/k3": 108, "g4m-01-04/ch1": 133,
  "g4m-01-05/k1": 646, "g4m-01-05/k3": 768, "g4m-01-05/ch1": 420,
  "g4m-01-06/k1": 416, "g4m-01-06/k3": 570, "g4m-01-06/ch1": 312,
  "g4m-02-01/k2": 247, "g4m-02-01/ch1": 246,
  "g4m-02-02/k2": 245, "g4m-02-02/ch1": 155,
  "g4m-02-03/k2": 223, "g4m-02-03/ch1": 199,
  "g4m-02-04/k2": 830, "g4m-02-04/ch1": 861,
  "g4m-02-05/k1": 219, "g4m-02-05/k2": 346, "g4m-02-05/ch1": 236,
  "g4m-03-01/k1": 679, "g4m-03-01/k3": 536, "g4m-03-01/ch1": 714,
  "g4m-03-02/k1": 2, "g4m-03-02/k2": 4, "g4m-03-02/k3": 748, "g4m-03-02/ch1": 1,
  "g4m-03-03/k1": 14, "g4m-03-03/k3": 10, "g4m-03-03/ch1": 5,
  "g4m-03-04/k2": 185, "g4m-03-04/ch1": 9,
  "g4m-03-05/k2": 179, "g4m-03-05/ch1": 15,
};

const EXPECTED_MCQ_CORRECT_LABELS: Record<string, string> = {
  "g4m-01-01/k2": "One factor becomes 10 times as large.",
  "g4m-01-02/k2": "10×8 and 6×8",
  "g4m-01-05/k2": "20×10, 20×9, 9×10, 9×9",
  "g4m-01-06/k2": "30×10, 30×5, 8×10, 8×5",
  "g4m-02-01/k1": "40 × 50 = 2,000",
  "g4m-02-01/k3": "Between 1,900 and 2,100",
  "g4m-02-02/k1": "The claim is much too large.",
  "g4m-02-02/k3": "282 is close to 300.",
  "g4m-02-03/k1": "9 hundreds can be shared first.",
  "g4m-02-03/k3": "3 × 300 = 900, leaving 36",
  "g4m-02-04/k1": "The chunk uses 800 without overshooting.",
  "g4m-02-04/k3": "52 ÷ 4 = 13",
  "g4m-02-05/k3": "2 hundreds in each group",
  "g4m-03-01/k2": "3,600 ÷ 6 = 600",
  "g4m-03-03/k2": "How many boxes hold all the pencils?",
  "g4m-03-04/k1": "2,500 ÷ 5 = 500",
  "g4m-03-04/k3": "Use 2,500 because it is nearby.",
  "g4m-03-05/k1": "213 × 4 = 852",
  "g4m-03-05/k3": "The quotient is 213.",
};

describe("S196 mult-div-fluency-g4 — course shape and family reuse", () => {
  it("grade 4, 3 chapters sized 6/5/5, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(4);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([6, 5, 5]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(16);
    expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
  });

  it("declares only g4-multiply, every form registered", () => {
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

  it("the primary interactive step (i1) uses an engine rated manip >= 2", () => {
    // Course-wide, i1 (the step this file's own solver-agreement block below singles out via
    // `const [i1] = lesson.steps.filter(kind === "interactive")` for its `predict` check) is
    // ALWAYS a genuine manipulable model: areaModel/columnCalc/estimateSlider/numberLineHop,
    // every one manip >= 2, across all 16 lessons. i2 varies deliberately: in half the lessons
    // it repeats a manipulable engine, in the other half it's a plain "numeric" verify-a-claim
    // step instead (e.g. g4m-01-01/i2, reviewed and KEPT at S319-A: "i2 (numeric, verify a
    // classmate's 300x4 claim)" is explicitly what distinguishes it from i1, not a slip). A
    // blanket "every interactive step" rule doesn't match that design — every lesson guarantees
    // ONE hands-on model via i1; i2 is free to instead be a numeric verification task.
    for (const file of readdirSync(join(DIR, "lessons"))) {
      const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
      const [i1] = lesson.steps.filter(
        (s: { kind: string }) => s.kind === "interactive"
      ) as Array<{ id: string; widget?: { type: string } }>;
      if (!i1?.widget) continue;
      const manip = CAPS[i1.widget.type]?.manip ?? 0;
      expect(manip, `${lesson.id}/${i1.id}: ${i1.widget.type} rates manip ${manip}`).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("S196 mult-div-fluency-g4 — fixed answer truth and engine contracts", () => {
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
          const reach = columnCalcReachable(w.op, w.a, w.b);
          const truth = columnCalcTruth(w.op, w.a, w.b);
          expect(reach.has(truth)).toBe(true);
          expect(reach.size, `${lesson.id}/${s.id}: no regrouping decision`).toBeGreaterThanOrEqual(2);
          expect(w.commonResults.length).toBeGreaterThanOrEqual(1);
          for (const t of w.commonResults) {
            expect(t.value, `${lesson.id}/${s.id}: trap equals truth`).not.toBe(truth);
            expect(reach.has(t.value),
              `${lesson.id}/${s.id}: trap ${t.value} unreachable — dead feedback`).toBe(true);
          }
          if (w.op === "multiply") {
            expect(w.b, `${lesson.id}/${s.id}: multiply needs a single-digit multiplier`).toBeGreaterThanOrEqual(2);
            expect(w.b).toBeLessThanOrEqual(9);
          }
        }
        if (w.type === "areaModel" && w.requireFactors) {
          const { w: fw, h: fh } = w.requireFactors;
          expect(fw * fh, `${lesson.id}/${s.id}: factors must build the area`).toBe(w.targetArea);
          // grading accepts either orientation, so BOTH sliders must reach both factors
          expect(fw).toBeLessThanOrEqual(w.wMax);
          expect(fh).toBeLessThanOrEqual(w.hMax);
          expect(fh, `${lesson.id}/${s.id}: transpose must fit wMax`).toBeLessThanOrEqual(w.wMax);
          expect(fw, `${lesson.id}/${s.id}: transpose must fit hMax`).toBeLessThanOrEqual(w.hMax);
          expect(w.factorFeedback, `${lesson.id}/${s.id}: requireFactors needs factorFeedback`).toBeTruthy();
          expect(Math.max(fw, fh), `${lesson.id}/${s.id}: side too wide to read at 360px`).toBeLessThanOrEqual(30);
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
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          const key = `${lesson.id}/${s.id}`;
          expect(EXPECTED_NUMERIC_ANSWERS[key], `${key}: missing fixed answer review`).toBeDefined();
          expect(w.answer, key).toBe(EXPECTED_NUMERIC_ANSWERS[key]);
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
          const fb = w.options.map((o) => o.feedback);
          expect(new Set(fb).size).toBe(fb.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
          const key = `${lesson.id}/${s.id}`;
          expect(EXPECTED_MCQ_CORRECT_LABELS[key], `${key}: missing fixed answer review`).toBeDefined();
          expect(correct[0].label, key).toBe(EXPECTED_MCQ_CORRECT_LABELS[key]);
        }
      }
    });
  }
});
