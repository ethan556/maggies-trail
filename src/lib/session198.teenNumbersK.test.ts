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
 *  THE COURSE'S CENTRAL CONTRACT, pinned hard here: countTeenFrame renders the completed ten
 *  separately and its `target` is the ONES — so a frame whose prompt says "make 1X" MUST carry
 *  target = X, not X+10. A target of the full teen would ask the learner to build ten extra
 *  dots and grade the correct ten-and-ones answer as wrong. Every teen frame in the course is
 *  checked for prompt↔target agreement, and traps are checked to sit one-off from the ones.
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
          // target is the ONES: "make 1X" must mean target === X
          const m = w.prompt.match(/make (\d+)\.$/);
          expect(m, `${lesson.id}/${s.id}: teen frame prompt must end in "make <teen>."`).toBeTruthy();
          const teen = Number(m![1]);
          expect(teen).toBeGreaterThanOrEqual(11);
          expect(teen).toBeLessThanOrEqual(19);
          expect(w.target,
            `${lesson.id}/${s.id}: target must be the ONES (teen−10), not the full teen — a full-teen target grades the correct ten-and-ones answer as wrong`)
            .toBe(teen - 10);
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
          expect(w.options[0].correct).toBe(true);
          expect(new Set(w.options.map((o) => o.feedback)).size).toBe(w.options.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);

          if (s.variant?.form === "countDecomposeMcq") {
            // independent arithmetic: the correct label is the pair NOT summing to N
            const n = Number(w.prompt.match(/split of (\d+)\?/)![1]);
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
            const m = w.prompt.match(/^Start at (\d+) and count on (\d+)\./)!;
            expect(Number(m[1]) + Number(m[2])).toBe(land);
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
