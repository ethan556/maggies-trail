import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS, variantForGenForm } from "./variants";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solvePrompt: solveG0 } = require2("./g0Independent.cjs");

/** S198 — how-many-k (K.CC.B.4, K.CC.B.5), Batch G course 1/6. Zero new generator code.
 *
 *  THE TIER RECIPE THIS FILE PINS (measured, not assumed). The K threshold is the TOTAL (>=30) and
 *  does NOT require numeric entry: k100-01-01 is Tier A at 31 with formal 1. numberLineHop is the
 *  ONLY K engine rated adapt 3 — tenFrame/tapDiagram/subitizeFlash rate adapt 0, which is why the
 *  flash-heavy counting-to-20-k lessons sat at Tier B. Every lesson here therefore carries a
 *  predict step, two diagnostic traps per graded widget, and at least one numberLineHop. Those
 *  three properties are asserted per lesson, because losing any one silently drops the course
 *  below the threshold.
 *
 *  SOLVER-LABEL CONTRACT: g0Independent's solvePrompt takes `prompt||opt1;;opt2;;…` and returns
 *  the correct LABEL verbatim ("They are equal", "More stars") — the correct option's text is not
 *  free prose. Every solver-backed mcq is round-tripped through the solver here.
 *
 *  READING PROFILE: this course uses readingProfile "early", which caps concept bodies at 25
 *  words. That cap never fires in grades 2-5 ("standard") and bit nine lessons at authoring. */

const DIR = join(__dirname, "../../content/courses/how-many-k");
const FAMILIES = ["g0-counting", "k0-count-100"] as const;
const registered: Record<string, Set<string>> = {};
for (const tag of FAMILIES) {
  registered[tag] = new Set(
    (VARIANT_GENERATORS.find((g) => g.tag === tag)?.forms ?? []) as string[]
  );
}
const CAPS = JSON.parse(
  readFileSync(join(__dirname, "../../scripts/engine-capabilities.json"), "utf8")
).types as Record<string, { manip: number; adapt: number }>;

const lessons = readdirSync(join(DIR, "lessons")).sort()
  .map((f) => JSON.parse(readFileSync(join(DIR, "lessons", f), "utf8")));

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
// Mirrors g0Independent.cjs's own ONE_WORDS/wv: some hop prompts spell a count as a word.
const ONE_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

describe("S198 how-many-k — course shape and family reuse", () => {
  it("grade K, 3 chapters sized 5/5/6, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(0);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([5, 5, 6]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(16);
    expect(lessons.map((l) => l.id)).toEqual(declared);
  });

  it("declares only the two K families, every form registered, both used", () => {
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
      const v = variantForGenForm(gen, form, `s198-surface-${form}`, "core");
      expect(v, `${gen}/${form} generated nothing`).toBeTruthy();
      expect(v!.widget.type, `${form} is authored as ${type} but GENERATES ${v!.widget.type}`).toBe(type);
    }
  });

  it("the all-A K recipe holds in EVERY lesson: predict + hop + interactive manip>=2", () => {
    for (const lesson of lessons) {
      const i1 = lesson.steps[1];
      expect(i1.kind).toBe("interactive");
      expect(i1.predict, `${lesson.id}: i1 predict step missing (+3 prediction lost)`).toBeDefined();
      expect(i1.predict.options.some((o: { id: string }) => o.id === i1.predict.outcomeId)).toBe(true);

      const hasHop = (lesson.steps as Array<{ widget?: { type: string } }>)
        .some((s) => s.widget?.type === "numberLineHop");
      expect(hasHop,
        `${lesson.id}: no numberLineHop — the only K engine rated adapt 3; without it the total drops below 30`)
        .toBe(true);
      expect(CAPS["numberLineHop"].adapt).toBe(3);

      // i1 (already fetched above by position, steps[1]) is ALWAYS a genuine manipulable model —
      // tenFrame or numberLineHop, every one manip >= 2, across all 16 lessons. i2 varies
      // deliberately: usually another manip>=2 engine (tapDiagram), but in 6 lessons it's instead
      // "dragOrder" (manip 1) — sequencing the counting STEPS rather than manipulating a counting
      // MODEL. Reviewed and KEPT at s327-A6-khm-01-03: "i2 (dragOrder: sequence start/touch/stop
      // into a safe counting order) tests procedural sequencing" is explicitly named as one of the
      // lesson's five genuinely distinct jobs, not a manip shortfall. Mirrors the identical i1/i2
      // split already found in mult-div-fluency-g4 (S196) and expressions-patterns-g5 (S197).
      const iw = (i1 as { widget?: { type: string } }).widget;
      if (iw) {
        const manip = CAPS[iw.type]?.manip ?? 0;
        expect(manip, `${lesson.id}/i1: ${iw.type} rates manip ${manip}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("readingProfile 'early' and its 25-word concept cap hold", () => {
    for (const lesson of lessons) {
      expect(lesson.readingProfile).toBe("early");
      for (const s of lesson.steps as Array<{ id: string; kind: string; body?: string }>) {
        if (s.kind !== "concept" || !s.body) continue;
        expect(words(s.body),
          `${lesson.id}/${s.id}: concept body over the 25-word early-profile cap`).toBeLessThanOrEqual(25);
      }
    }
  });
});

describe("S198 how-many-k — solver round-trips and widget contracts", () => {
  for (const lesson of lessons) {
    it(`${lesson.id}: step shape, solver agreement, trap discipline`, () => {
      expect(lesson.steps.map((s: { kind: string }) => s.kind)).toEqual(
        ["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]
      );

      for (const s of lesson.steps) {
        if (!s.widget) continue;
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);

        if (w.type === "mcq") {
          expect(w.options.length).toBeGreaterThanOrEqual(4);
          const correct = w.options.filter((o) => o.correct);
          expect(correct).toHaveLength(1);
          expect(w.options[0].correct, `${lesson.id}/${s.id} correct not at index 0`).toBe(true);
          const fb = w.options.map((o) => o.feedback);
          expect(new Set(fb).size, `${lesson.id}/${s.id} duplicate feedback`).toBe(fb.length);
          for (const o of w.options) expect(o.feedback.length).toBeGreaterThanOrEqual(25);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
          if (s.variant) {
            // the solver returns the correct LABEL, so the authored label must match verbatim
            const input = `${w.prompt}||${w.options.map((o) => o.label).join(";;")}`;
            const derived = solveG0(s.variant.form, input);
            expect(String(derived),
              `${lesson.id}/${s.id} ${s.variant.form}: solver disagrees with authored correct label`)
              .toBe(correct[0].label);
          }
        }

        if (w.type === "numberLineHop") {
          const land = w.start + w.hop * w.hops;
          expect(land, `${lesson.id}/${s.id} landing below the line`).toBeGreaterThan(w.min);
          expect(land, `${lesson.id}/${s.id} landing at/over the top leaves a dead feedback direction`).toBeLessThan(w.max);
          expect(w.commonLandings.length).toBeGreaterThanOrEqual(2);
          for (const t of w.commonLandings) {
            expect(t.value).not.toBe(land);
            expect(t.value).toBeGreaterThanOrEqual(w.min);
            expect(t.value).toBeLessThanOrEqual(w.max);
            expect(t.feedback.length).toBeGreaterThanOrEqual(25);
          }
          if (s.variant) {
            // hop prompts are load-bearing: the solver re-derives the landing from the text
            const f = s.variant.form as string;
            if (f === "countAddLine") {
              const m = w.prompt.match(/^Start at (\d+)\. Hop forward (\d+) times by 1\./);
              expect(m, `${lesson.id}/${s.id}: countAddLine prompt shape`).toBeTruthy();
              expect(Number(m![1]) + Number(m![2])).toBe(land);
            }
            if (f === "kCountFromHop") {
              // Two alternate authored phrasings state the same start+hop story with the hop
              // count spelled as a word, in either sentence order.
              const m = w.prompt.match(/^Start at (\d+) and count on (\d+)\./);
              const m2 = w.prompt.match(/known group of (\d+) gets (\w+) new counters/i);
              const m3 = w.prompt.match(/^(\w+) newcomers join a known group of (\d+)/i);
              if (m) {
                expect(Number(m[1]) + Number(m[2])).toBe(land);
              } else if (m2) {
                expect(Number(m2[1]) + ONE_WORDS[m2[2].toLowerCase()],
                  `${lesson.id}/${s.id}: kCountFromHop prompt shape`).toBe(land);
              } else if (m3) {
                expect(ONE_WORDS[m3[1].toLowerCase()] + Number(m3[2]),
                  `${lesson.id}/${s.id}: kCountFromHop prompt shape`).toBe(land);
              } else {
                expect.fail(`${lesson.id}/${s.id}: kCountFromHop prompt shape unrecognized: ${w.prompt}`);
              }
            }
            if (f === "kSeqNextHop") {
              let m = w.prompt.match(/^What number comes right after (\d+)\?/);
              if (m) {
                expect(Number(m[1]) + 1).toBe(land);
              } else if ((m = w.prompt.match(/row has (\d+) beads\. Add one bead/i))) {
                // "A row has N beads. Add one bead; use the hop to show the new total." — the same
                // +1 hop as the digit form, told as a small story instead of "comes right after".
                expect(Number(m[1]) + 1, `${lesson.id}/${s.id}: kSeqNextHop prompt shape`).toBe(land);
              } else {
                expect.fail(`${lesson.id}/${s.id}: kSeqNextHop prompt shape unrecognized: ${w.prompt}`);
              }
              expect(w.hops).toBe(1);
            }
          }
        }

        if (w.type === "tenFrame") {
          expect(w.target).toBeGreaterThanOrEqual(1);
          expect(w.target).toBeLessThanOrEqual(10);
          expect(w.commonCounts.length).toBeGreaterThanOrEqual(2);
          for (const t of w.commonCounts) {
            expect(t.count).not.toBe(w.target);
            expect(t.count).toBeGreaterThanOrEqual(0);
            expect(t.count).toBeLessThanOrEqual(10);
            expect(t.feedback.length).toBeGreaterThanOrEqual(25);
          }
        }

        if (w.type === "subitizeFlash") {
          expect(w.options).toContain(w.count);
          expect(new Set(w.options).size).toBe(w.options.length);
          expect(w.commonPicks.length).toBeGreaterThanOrEqual(1);
          for (const p of w.commonPicks) {
            expect(p.value).not.toBe(w.count);
            expect(w.options).toContain(p.value);
            expect(p.feedback.length).toBeGreaterThanOrEqual(25);
          }
        }
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        expect(s.hints.length).toBeGreaterThanOrEqual(2);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);
      }
    });
  }
});
