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

/** S198 — number-writing-k (K.CC.A.3), Batch G course 4/6. Zero new generator code.
 *
 *  SURFACE CONTRACTS PINNED HERE:
 *  - countZeroTap -> tapDiagram: the solver decodes `prompt||label,label,label` and takes each
 *    hotspot's count from the FIRST NUMBER IN ITS LABEL (no number -> 0). So labels must be
 *    comma-free and carry their counts as digits — except the correct zero plate, whose label
 *    must stay digit-free. Round-tripped through solveG0.
 *  - countTeenFrame: target must equal teen − 10 (the prompt's "make N" number minus the ten the
 *    widget renders itself). Getting this wrong grades every correct build as incorrect.
 *  - mcq solver forms (countReadMcq, countObjectsMcq, countMakeTenMcq) return the correct LABEL
 *    verbatim; each authored instance is re-derived through solveG0.
 *
 *  The all-A K recipe (predict + traps + one numberLineHop per lesson, interactive manip>=2,
 *  25-word early concept cap) is asserted per lesson as in courses 1-3. */

const DIR = join(__dirname, "../../content/courses/number-writing-k");
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
// Mirrors g0Independent.cjs's own ONE_WORDS: some hop prompts spell a count as a word.
const ONE_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20,
};

describe("S198 number-writing-k — course shape and recipe", () => {
  it("grade K, 3 chapters sized 5/5/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(0);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([5, 5, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(14);
    expect(lessons.map((l) => l.id)).toEqual(declared);
  });

  it("only the two K families; every declared form registered and generating its authored surface", () => {
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
    expect(seen.has("countZeroTap"), "the zero lesson's tap surface must be used").toBe(true);
    expect(seen.has("countTeenFrame"), "teens must ride the teen-frame surface").toBe(true);
    for (const [form, { gen, type }] of seen) {
      const v = variantForGenForm(gen, form, `s198-surface4-${form}`, "core");
      expect(v, `${gen}/${form} generated nothing`).toBeTruthy();
      expect(v!.widget.type, `${form} authored as ${type} but GENERATES ${v!.widget.type}`).toBe(type);
    }
  });

  it("the all-A K recipe holds in EVERY lesson", () => {
    for (const lesson of lessons) {
      expect(lesson.steps[1].predict, `${lesson.id}: i1 predict step missing`).toBeDefined();
      expect((lesson.steps as Array<{ widget?: { type: string } }>)
        .some((s) => s.widget?.type === "numberLineHop"),
        `${lesson.id}: no numberLineHop (the only adapt-3 K engine)`).toBe(true);
      // i1 (the FIRST interactive step) is ALWAYS a genuinely manipulable engine — tenFrame,
      // tapDiagram, numberLineHop, or baseTenCompose, every one manip >= 2, across all 14 lessons.
      // i2 varies deliberately: tapDiagram (manip 2) in half the lessons, but "dragOrder" (manip 1)
      // in the other 7 — inspected each one directly and every dragOrder i2 sequences the numeral-
      // writing PROCEDURE itself (e.g. kcw-01-04/i2: "Put the zero-recording routine in order" —
      // see the empty plate, count no cookies, write 0), a genuinely different job from i1's
      // amount-building manipulative, not a manip shortfall. Mirrors the identical i1/i2 split
      // already found and reviewed in how-many-k (S198, s327-A6-khm-01-03), mult-div-fluency-g4
      // (S196), and expressions-patterns-g5 (S197).
      const interactive = (lesson.steps as Array<{ id: string; kind: string; widget?: { type: string } }>)
        .filter((s) => s.kind === "interactive");
      const i1w = interactive[0]?.widget;
      if (i1w) {
        expect(CAPS[i1w.type]?.manip ?? 0,
          `${lesson.id}/${interactive[0].id}: interactive ${i1w.type}`).toBeGreaterThanOrEqual(2);
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

describe("S198 number-writing-k — surface contracts and solver round-trips", () => {
  for (const lesson of lessons) {
    it(`${lesson.id}: shape, ZeroTap encoding, teen-frame arithmetic`, () => {
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
          // NOT position-0-pinned: S313 deliberately moved every main-sequence MCQ's correct
          // option off raw index 0 course-wide (see session313.numberWritingKChoiceOrder.test.ts,
          // which hash-pins the resulting non-zero position distribution). Grading-by-id is what
          // this file verifies; exact authored position is that dedicated suite's contract.
          expect(correct[0].id).toBeTruthy();
          const fb = w.options.map((o) => o.feedback);
          expect(new Set(fb).size).toBe(fb.length);
          for (const o of w.options) expect(o.feedback.length).toBeGreaterThanOrEqual(25);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
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
          if (s.variant?.form === "kCountFromHop") {
            let m = w.prompt.match(/^Start at (\d+) and count on (\d+)\./);
            if (m) {
              expect(Number(m[1]) + Number(m[2]), `${lesson.id}/${s.id}: count-on landing`).toBe(land);
            } else if ((m = w.prompt.match(/^Start at (\d+) and make (\d+) one-unit hops?\./))) {
              expect(Number(m[1]) + Number(m[2]), `${lesson.id}/${s.id}: count-on landing`).toBe(land);
            } else if ((m = w.prompt.match(/^Make (\d+) one-unit hops? forward from (\d+)\./))) {
              // Reversed word order: hop-count first, then the start number.
              expect(Number(m[2]) + Number(m[1]), `${lesson.id}/${s.id}: count-on landing`).toBe(land);
            } else {
              expect.fail(`${lesson.id}/${s.id}: kCountFromHop prompt shape unrecognized: ${w.prompt}`);
            }
          }
          if (s.variant?.form === "kSeqNextHop") {
            let m = w.prompt.match(/^What number comes right after (\d+)\?/);
            if (m) {
              expect(Number(m[1]) + 1, `${lesson.id}/${s.id}: next-hop landing must be N+1`).toBe(land);
            } else if ((m = w.prompt.match(/^(\w+) gains one more\./i))) {
              const base = ONE_WORDS[m[1].toLowerCase()];
              expect(base, `${lesson.id}/${s.id}: unrecognized number word "${m[1]}"`).toBeDefined();
              expect(base + 1, `${lesson.id}/${s.id}: next-hop landing must be N+1`).toBe(land);
            } else {
              expect.fail(`${lesson.id}/${s.id}: kSeqNextHop prompt shape unrecognized: ${w.prompt}`);
            }
          }
          if (s.variant?.form === "kSeqBeforeHop") {
            expect(w.direction).toBe("back");
            const m = w.prompt.match(/^What number comes right before (\d+)\?/);
            expect(m).toBeTruthy();
            expect(Number(m![1]) - 1).toBe(land);
          }
        }

        if (w.type === "tenFrame") {
          expect(w.target).toBeGreaterThanOrEqual(1);
          expect(w.target).toBeLessThanOrEqual(10);
          expect(w.commonCounts.length).toBeGreaterThanOrEqual(2);
          for (const t of w.commonCounts) {
            expect(t.count).not.toBe(w.target);
            expect(t.feedback.length).toBeGreaterThanOrEqual(25);
          }
          const m = w.prompt.match(/make (\d+)\.$/);
          if (m) {
            expect(Number(m[1]) - 10,
              `${lesson.id}/${s.id}: countTeenFrame target must equal teen − 10 — anything else grades every correct build wrong`)
              .toBe(w.target);
          }
        }

        if (w.type === "tapDiagram") {
          const correct = w.hotspots.filter((h) => h.correct);
          expect(correct).toHaveLength(1);
          for (const h of w.hotspots) {
            expect(h.label.includes(","),
              `${lesson.id}/${s.id}: comma in tap label "${h.label}" breaks the solver's comma-split encoding`).toBe(false);
            if (!h.correct) expect((h.feedback ?? "").length).toBeGreaterThanOrEqual(25);
          }
          if (s.variant?.form === "countZeroTap") {
            // the correct plate is the digit-free (count 0) one; wrong plates carry their counts as digits
            expect(/\d/.test(correct[0].label),
              `${lesson.id}/${s.id}: the zero plate's label must be digit-free (solver reads count from digits)`).toBe(false);
            for (const h of w.hotspots.filter((x) => !x.correct)) {
              expect(/\d/.test(h.label), `${lesson.id}/${s.id}: wrong plate "${h.label}" must carry its count as a digit`).toBe(true);
            }
            const input = `${w.prompt}||${w.hotspots.map((h) => h.label).join(",")}`;
            const derived = solveG0(s.variant.form, input);
            expect(String(derived), `${lesson.id}/${s.id}: solver must pick the zero plate`).toBe(correct[0].label);
          }
        }

        if (w.type === "subitizeFlash") {
          expect(w.options).toContain(w.count);
          expect(new Set(w.options).size).toBe(w.options.length);
          expect(w.commonPicks.length).toBeGreaterThanOrEqual(1);
          for (const p of w.commonPicks) {
            expect(p.value).not.toBe(w.count);
            expect(w.options).toContain(p.value);
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
