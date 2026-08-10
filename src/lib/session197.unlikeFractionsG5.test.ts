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

/** S197 — unlike-fractions-g5 (5.NF.A.1, 5.NF.A.2), Batch F course 2/6. Zero new generator code.
 *
 *  TWO FAILURE MODES THIS FILE EXISTS TO PIN, both of which bit during authoring:
 *
 *  1. faLikeDenomWordNumeric ADDS the two numerators — unless the prompt contains the phrase
 *     "were available", which flips it to SUBTRACT. That phrase is the only thing separating an
 *     addition lesson from a subtraction one. Deleting it in a prose edit would silently invert
 *     six graded steps while every other gate stayed green, so the direction is re-derived here
 *     from the prompt text itself.
 *
 *  2. A fractionBar trap that equals the TARGET'S VALUE is silently dropped by the engine's
 *     filter, not flagged. In the simplify lesson both proposed traps (4/6 and 8/12) ARE 2/3, so
 *     the lesson shipped with no diagnosable wrong build at all. Traps that are mathematically
 *     related to the target are exactly the ones at risk, so every trap is checked for
 *     cross-multiplied equality AND each widget is required to retain at least one.
 *
 *  fractionBar sliders run 1..12; targets and traps outside that range are unreachable by the
 *  learner even though the schema accepts them. */

const DIR = join(__dirname, "../../content/courses/unlike-fractions-g5");
const FAMILY = "g4-fractions";
const registered = new Set(
  (VARIANT_GENERATORS.find((g) => g.tag === FAMILY)?.forms ?? []) as string[]
);
const CAPS = JSON.parse(
  readFileSync(join(__dirname, "../../scripts/engine-capabilities.json"), "utf8")
).types as Record<string, { manip: number }>;
const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);

const lessons = readdirSync(join(DIR, "lessons")).sort()
  .map((f) => JSON.parse(readFileSync(join(DIR, "lessons", f), "utf8")));

describe("S197 unlike-fractions-g5 — course shape and family reuse", () => {
  it("grade 5, 3 chapters sized 5/5/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(5);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([5, 5, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(14);
    expect(lessons.map((l) => l.id)).toEqual(declared);
  });

  it("declares only g4-fractions, every form registered", () => {
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
      const v = variantForGenForm(FAMILY, form, `s197-surface-${form}`, "core");
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

  it("both directions of the phrase-triggered route are actually used", () => {
    let adds = 0, subs = 0;
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ variant?: { form: string }; widget?: { prompt?: string } }>) {
        if (s.variant?.form !== "faLikeDenomWordNumeric" || !s.widget?.prompt) continue;
        if (s.widget.prompt.includes("were available")) subs++; else adds++;
      }
    }
    expect(adds, "no addition-direction steps — the route would be untested in that branch").toBeGreaterThan(0);
    expect(subs, "no subtraction-direction steps — the 'were available' branch would be untested").toBeGreaterThan(0);
  });
});

describe("S197 unlike-fractions-g5 — routes re-derived, trap survival proven", () => {
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
          expect(w.targetNum).toBeGreaterThanOrEqual(w.numMin);
          expect(w.targetNum).toBeLessThanOrEqual(w.numMax);
          expect(w.targetDen).toBeGreaterThanOrEqual(w.denMin);
          expect(w.targetDen).toBeLessThanOrEqual(w.denMax);
          // a trap equal to the target's VALUE is dropped silently, leaving no wrong path
          for (const t of w.commonFractions) {
            expect(t.num).toBeLessThanOrEqual(w.numMax);
            expect(t.den).toBeLessThanOrEqual(w.denMax);
            expect(t.num * w.targetDen,
              `${lesson.id}/${s.id}: trap ${t.num}/${t.den} EQUALS the target's value and would be filtered out`)
              .not.toBe(t.den * w.targetNum);
          }
          expect(w.commonFractions.length,
            `${lesson.id}/${s.id}: every trap was filtered — the widget has no diagnosable wrong build`)
            .toBeGreaterThanOrEqual(1);
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
          if (f === "faLikeDenomWordNumeric") {
            // re-derive the DIRECTION from the prompt text, not from the authored answer
            const nums = (w.prompt.match(/(\d+)\/(\d+)/g) ?? []).map((x) => Number(x.split("/")[0]));
            expect(nums.length).toBeGreaterThanOrEqual(2);
            const subtracting = w.prompt.includes("were available");
            const expected = subtracting ? nums[0] - nums[1] : nums[0] + nums[1];
            expect(expected,
              `${lesson.id}/${s.id}: "were available" flips this route to subtraction — prompt and answer disagree`)
              .toBe(w.answer);
          }
          if (f === "faEquivalenceRecapNumeric") {
            const m = w.prompt.match(/(\d+)\/(\d+) = \?\/(\d+)/);
            expect(m).toBeTruthy();
            expect((Number(m![1]) * Number(m![3])) % Number(m![2])).toBe(0);
            expect((Number(m![1]) * Number(m![3])) / Number(m![2])).toBe(w.answer);
          }
          if (f === "faMixedToImproperNumeric") {
            const m = w.prompt.match(/Convert (\d+) (\d+)\/(\d+)/);
            expect(m).toBeTruthy();
            expect(Number(m![1]) * Number(m![3]) + Number(m![2])).toBe(w.answer);
          }
          if (f === "faImproperToMixedNumeric") {
            const m = w.prompt.match(/Convert (\d+)\/(\d+)/);
            expect(m).toBeTruthy();
            expect(Math.floor(Number(m![1]) / Number(m![2]))).toBe(w.answer);
          }

          const vals = w.commonErrors.map((e) => e.value);
          expect(new Set(vals).size, `${lesson.id}/${s.id} duplicate traps`).toBe(vals.length);
          for (const e of w.commonErrors) {
            expect(e.value).not.toBe(w.answer);
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
