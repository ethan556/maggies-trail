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

/** S198 — teen-numbers-k (K.NBT.A.1), Batch G course 3/6. Zero new generator code.
 *
 *  THE COURSE'S CENTRAL CONTRACT, pinned hard here: a tenFrame widget renders exactly one
 *  10-cell grid (TenFrameW, src/components/widgets.tsx) and the schema caps `target` at 10 with
 *  `preFilled` required to be strictly less than `target` (TenFrameSpec, src/lib/schema.ts) — so
 *  it can NEVER render a separately-shown completed ten plus a teen-sized total; every teen frame
 *  in this course starts empty (`preFilled: 0`) and its `target` is the ONES digit (1-9), not the
 *  full teen. A target of the full teen would ask the learner to build ten extra dots and grade
 *  the correct ten-and-ones answer as wrong. Every teen frame in the course is checked for this
 *  target/preFilled agreement, that building `target` dots actually grades correct, and that
 *  traps sit one-off from the ones.
 *
 *  S327/S328 update: earlier drafts of this test also required every tenFrame prompt to match
 *  `/make (\d+)\.$/` and derived "the teen" from that captured number. That regex enshrined the
 *  literal wording of a corpus-wide authored-prompt bug (S327 finding, S328 root-cause fix in
 *  `g0Variants.ts`'s `countTeenFrame`): prompts like "A full group of 10 is already shown. Add the
 *  extra dots needed to make 16." falsely claimed the single-frame widget had a locked ten already
 *  on screen, which `preFilled: 0` never renders. Once that prose was corrected (here and in every
 *  sibling lesson) to stop making that visual-state claim, prompts legitimately stopped ending in
 *  "make <teen>." — some no longer restate the teen number in the prompt at all (e.g. "A teen has
 *  one full ten and six loose dots. Build only the loose part."). The regex-based check is
 *  replaced below with the structural/semantic invariant it was really standing in for:
 *  preFilled===0, target in the valid 1-9 ones range, and `evaluate(widget, widget.target).correct`
 *  — the same grading-correctness check session253's course-integrity test already uses for this
 *  exact scenario. This is *not* a relaxation: a target/preFilled regression is still caught, now
 *  independent of which of the corpus's many accepted authored-prompt phrasings is used.
 *
 *  Solver round-trips: countDecomposeMcq's correct label is the pair that does NOT sum to N
 *  (the inverted question is exactly where an authored "valid split" answer would silently
 *  grade wrong); countMakeTenMcq's correct label sums to 10. Both are re-derived via solveG0
 *  with the `prompt||opt1;;opt2` encoding. Hops are teen-ranged and direction-aware. */

const DIR = join(__dirname, "../../content/courses/teen-numbers-k");
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
const landOf = (w: { direction: string; start: number; hop: number; hops: number }) =>
  w.direction === "back" ? w.start - w.hop * w.hops : w.start + w.hop * w.hops;
// Mirrors g0Independent.cjs's own ONE_WORDS: one hop prompt spells its count as a word.
const ONE_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};
const pairSum = (label: string) =>
  [...label.matchAll(/\d+/g)].map((m) => Number(m[0])).reduce((a, b) => a + b, 0);

describe("S198 teen-numbers-k — course shape and recipe", () => {
  it("grade K, 3 chapters sized 4/4/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(0);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 4, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(12);
    expect(lessons.map((l) => l.id)).toEqual(declared);
  });

  it("only the two K families; every form registered; every form generates its authored surface", () => {
    const seen = new Map<string, { gen: string; type: string }>();
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ id: string; variant?: { gen: string; form: string }; widget?: { type: string } }>) {
        if (!s.variant) continue;
        expect(FAMILIES).toContain(s.variant.gen);
        expect(registered[s.variant.gen].has(s.variant.form),
          `${lesson.id}/${s.id}: ${s.variant.gen}/${s.variant.form} NOT registered`).toBe(true);
        if (s.widget) seen.set(s.variant.form, { gen: s.variant.gen, type: s.widget.type });
      }
    }
    expect(seen.has("countTeenFrame"), "the course's star surface must actually be used").toBe(true);
    for (const [form, { gen, type }] of seen) {
      const v = variantForGenForm(gen, form, `s198-surface3-${form}`, "core");
      expect(v, `${gen}/${form} generated nothing`).toBeTruthy();
      expect(v!.widget.type, `${form} authored as ${type} but generates ${v!.widget.type}`).toBe(type);
    }
  });

  it("the all-A K recipe holds in EVERY lesson (predict + hop + manip>=2 + early cap)", () => {
    for (const lesson of lessons) {
      expect(lesson.steps[1].predict, `${lesson.id}: i1 predict missing`).toBeDefined();
      expect((lesson.steps as Array<{ widget?: { type: string } }>)
        .some((s) => s.widget?.type === "numberLineHop"),
        `${lesson.id}: no numberLineHop (the only adapt-3 K engine)`).toBe(true);
      for (const s of lesson.steps as Array<{ id: string; kind: string; widget?: { type: string } }>) {
        if (s.kind === "interactive" && s.widget) {
          expect(CAPS[s.widget.type]?.manip ?? 0, `${lesson.id}/${s.id}`).toBeGreaterThanOrEqual(2);
        }
      }
      expect(lesson.readingProfile).toBe("early");
      for (const s of lesson.steps as Array<{ id: string; kind: string; body?: string }>) {
        if (s.kind === "concept" && s.body) {
          expect(words(s.body), `${lesson.id}/${s.id} over the 25-word cap`).toBeLessThanOrEqual(25);
        }
      }
    }
  });
});

describe("S198 teen-numbers-k — teen-frame contract and solver round-trips", () => {
  for (const lesson of lessons) {
    it(`${lesson.id}: prompt↔target agreement, decompose/make-ten truth, hops`, () => {
      expect(lesson.steps.map((s: { kind: string }) => s.kind)).toEqual(
        ["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]
      );

      for (const s of lesson.steps) {
        if (!s.widget) continue;
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);

        if (w.type === "tenFrame") {
          // S328: target is the ONES (1-9), the frame always starts empty in this course, and
          // building exactly `target` dots must grade correct — see the file docstring for why
          // this replaced an older regex that matched one specific (now-retired, false-claim)
          // prompt phrasing rather than the underlying target/preFilled invariant.
          expect(w.preFilled, `${lesson.id}/${s.id}: every teen frame in this course starts empty`).toBe(0);
          expect(w.target, `${lesson.id}/${s.id}: teen-frame target must be the ones digit`).toBeGreaterThanOrEqual(1);
          expect(w.target, `${lesson.id}/${s.id}: teen-frame target must be the ones digit`).toBeLessThanOrEqual(9);
          expect(evaluate(w, w.target).correct,
            `${lesson.id}/${s.id}: building exactly target dots must grade correct — a full-teen target would grade the correct ten-and-ones answer as wrong`)
            .toBe(true);
          expect(w.commonCounts.length).toBeGreaterThanOrEqual(2);
          for (const t of w.commonCounts) {
            expect(t.count).not.toBe(w.target);
            expect(Math.abs(t.count - w.target) <= 1 || t.count === 0,
              `${lesson.id}/${s.id}: trap ${t.count} is not a diagnosable near-miss`).toBe(true);
            expect(t.feedback.length).toBeGreaterThanOrEqual(25);
          }
        }

        if (w.type === "mcq") {
          expect(w.options.length).toBeGreaterThanOrEqual(4);
          const correct = w.options.filter((o) => o.correct);
          expect(correct).toHaveLength(1);
          // NOT position-0-pinned: S307 deliberately moved every main-sequence MCQ's correct
          // option off raw index 0 course-wide (see session307.teenNumbersKChoiceOrder.test.ts,
          // which hash-pins the resulting non-zero position distribution). Grading-by-id is what
          // this file verifies; exact authored position is that dedicated suite's contract.
          expect(correct[0].id).toBeTruthy();
          expect(new Set(w.options.map((o) => o.feedback)).size).toBe(w.options.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);

          if (s.variant?.form === "countDecomposeMcq") {
            // independent arithmetic: the correct label is the pair NOT summing to N
            const nm = w.prompt.match(/split of (\d+)\?/) ?? w.prompt.match(/fails to make (\d+)\?/);
            expect(nm, `${lesson.id}/${s.id}: countDecomposeMcq prompt shape unrecognized: ${w.prompt}`).toBeTruthy();
            const n = Number(nm![1]);
            expect(pairSum(correct[0].label),
              `${lesson.id}/${s.id}: the NOT-a-split answer must fail to sum to ${n}`).not.toBe(n);
            for (const o of w.options.filter((x) => !x.correct)) {
              expect(pairSum(o.label),
                `${lesson.id}/${s.id}: distractor "${o.label}" must be a VALID split of ${n}`).toBe(n);
            }
          }
          if (s.variant?.form === "countMakeTenMcq") {
            expect(pairSum(correct[0].label), `${lesson.id}/${s.id}: make-ten pair`).toBe(10);
            for (const o of w.options.filter((x) => !x.correct)) {
              expect(pairSum(o.label)).not.toBe(10);
            }
          }
          if (s.variant) {
            const input = `${w.prompt}||${w.options.map((o) => o.label).join(";;")}`;
            const derived = solveG0(s.variant.form, input);
            expect(String(derived),
              `${lesson.id}/${s.id} ${s.variant.form}: solver disagrees with authored correct label`)
              .toBe(correct[0].label);
          }
        }

        if (w.type === "numberLineHop") {
          const land = landOf(w);
          expect(land).toBeGreaterThan(w.min);
          expect(land).toBeLessThan(w.max);
          expect(w.commonLandings.length).toBeGreaterThanOrEqual(2);
          for (const t of w.commonLandings) {
            expect(t.value).not.toBe(land);
            expect(t.feedback.length).toBeGreaterThanOrEqual(25);
          }
          if (s.variant?.form === "kSeqBeforeHop") {
            expect(w.direction).toBe("back");
            expect(Number(w.prompt.match(/before (\d+)\?/)![1]) - 1).toBe(land);
          }
          if (s.variant?.form === "kSeqNextHop") {
            expect(Number(w.prompt.match(/after (\d+)\?/)![1]) + 1).toBe(land);
          }
          if (s.variant?.form === "kCountFromHop") {
            const m = w.prompt.match(/^Start at (\d+) and count on (\d+)\./);
            if (m) {
              expect(Number(m[1]) + Number(m[2])).toBe(land);
            } else {
              // "Use [word] one-steps from [word] to reach the point that names N." states the
              // same start+hop story with both numbers spelled as words.
              const m2 = w.prompt.match(/^Use (\w+) one-steps from (\w+) to reach the point that names (\d+)/i);
              expect(m2, `${lesson.id}/${s.id}: kCountFromHop prompt shape unrecognized: ${w.prompt}`).toBeTruthy();
              expect(ONE_WORDS[m2![2].toLowerCase()] + ONE_WORDS[m2![1].toLowerCase()]).toBe(land);
            }
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
