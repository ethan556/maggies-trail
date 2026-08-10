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

/** S198 — measure-compare-k (K.MD.A.1/2, K.MD.B.3), Batch G course 5/6. Zero new generator code.
 *
 *  TIER CORRECTION PINNED HERE (measured, contradicts earlier session notes): numberLineHop is
 *  NOT the only adapt-3 K engine. unitRuler rates all 3s and balanceScale rates conseq 3 /
 *  adapt 3 — so this course's tier engines are its SUBJECT engines: unitRuler for length,
 *  balanceScale for weight, hops only for the two category-counting lessons. The test asserts
 *  each lesson carries at least one adapt-3 engine (ruler / balance / hop) OR is one of the two
 *  named exact-30 sorting lessons, so a refactor cannot silently drop a course back to Tier B.
 *
 *  K BALANCE CONTRACT: a=1, b=0 (plain weight, no algebra), target strictly interior to the
 *  slider range — otherwise one tilt-feedback direction is unreachable.
 *  RULER CONTRACT: objectEnd − objectStart === requiredPlacements at unit size 1.
 *  LENGTH-COMPARE CONTRACT: the solver returns the LONGEST item's label and breaks ties toward
 *  the FIRST item, so answerId must be the strictly longest item.
 *  subitizeFlash is BANNED course-wide (a11y 2 sinks the exact-30 lessons and pays nothing). */

const DIR = join(__dirname, "../../content/courses/measure-compare-k");
const FAMILIES = ["g0-shapes-sorting", "g0-counting", "k0-count-100"] as const;
const registered: Record<string, Set<string>> = {};
for (const tag of FAMILIES) {
  registered[tag] = new Set(
    (VARIANT_GENERATORS.find((g) => g.tag === tag)?.forms ?? []) as string[]
  );
}
const EXACT30 = new Set(["kmd-03-01", "kmd-03-02"]); // sorting lessons: predict+traps carry them to 30

const lessons = readdirSync(join(DIR, "lessons")).sort()
  .map((f) => JSON.parse(readFileSync(join(DIR, "lessons", f), "utf8")));
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const landOf = (w: { direction: string; start: number; hop: number; hops: number }) =>
  w.direction === "back" ? w.start - w.hop * w.hops : w.start + w.hop * w.hops;

describe("S198 measure-compare-k — course shape and tier-engine recipe", () => {
  it("grade K, 3 chapters sized 4/4/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(0);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 4, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(12);
    expect(lessons.map((l) => l.id)).toEqual(declared);
  });

  it("every declared form is registered and generates its authored surface type", () => {
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
    expect(seen.has("shapeLengthCompare"), "length lessons must ride the lengthCompare surface").toBe(true);
    expect(seen.has("shapeWeightMcq"), "weight lessons must ride the weight surfaces").toBe(true);
    for (const [form, { gen, type }] of seen) {
      const v = variantForGenForm(gen, form, `s198-surface5-${form}`, "core");
      expect(v, `${gen}/${form} generated nothing`).toBeTruthy();
      expect(v!.widget.type, `${form} authored as ${type} but GENERATES ${v!.widget.type}`).toBe(type);
    }
  });

  it("every lesson carries an adapt-3 engine (ruler/balance/hop) or is a named exact-30 lesson; no flash anywhere", () => {
    for (const lesson of lessons) {
      expect(lesson.steps[1].predict, `${lesson.id}: i1 predict step missing`).toBeDefined();
      const types = new Set((lesson.steps as Array<{ widget?: { type: string } }>)
        .filter((s) => s.widget).map((s) => s.widget!.type));
      expect(types.has("subitizeFlash"),
        `${lesson.id}: subitizeFlash is banned in this course (a11y 2 sinks the exact-30 lessons)`).toBe(false);
      const hasAdapt3 = types.has("unitRuler") || types.has("balanceScale") || types.has("numberLineHop");
      expect(hasAdapt3 || EXACT30.has(lesson.id),
        `${lesson.id}: no adapt-3 engine and not a named exact-30 lesson — the course would slip to Tier B`).toBe(true);
      expect(lesson.readingProfile).toBe("early");
      for (const s of lesson.steps as Array<{ id: string; kind: string; body?: string }>) {
        if (s.kind === "concept" && s.body) {
          expect(words(s.body), `${lesson.id}/${s.id} over the 25-word cap`).toBeLessThanOrEqual(25);
        }
      }
    }
  });
});

describe("S198 measure-compare-k — engine contracts and solver round-trips", () => {
  for (const lesson of lessons) {
    it(`${lesson.id}: ruler/balance/lengthCompare contracts, shapes solver agreement`, () => {
      expect(lesson.steps.map((s: { kind: string }) => s.kind)).toEqual(
        ["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]
      );

      for (const s of lesson.steps) {
        if (!s.widget) continue;
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);

        if (w.type === "unitRuler") {
          expect(w.objectEnd - w.objectStart,
            `${lesson.id}/${s.id}: ruler span must equal requiredPlacements at unit 1 — otherwise a correct covering is graded wrong`)
            .toBe(w.requiredPlacements);
          expect(w.allowedUnitSizes).toContain(w.targetUnitSize);
          expect(w.targetUnitSize).toBe(1);
          for (const f of [w.alignFeedback, w.gapOverlapFeedback, w.unitFeedback]) {
            expect(f.length).toBeGreaterThanOrEqual(25);
          }
        }

        if (w.type === "balanceScale") {
          expect(w.a, `${lesson.id}/${s.id}: K balance must be plain weight (a=1)`).toBe(1);
          expect(w.b, `${lesson.id}/${s.id}: K balance must be plain weight (b=0)`).toBe(0);
          expect(w.c).toBeGreaterThan(w.xMin);
          expect(w.c, `${lesson.id}/${s.id}: target at the slider edge kills one tilt-feedback direction`).toBeLessThan(w.xMax);
          expect(w.lowFeedback.length).toBeGreaterThanOrEqual(25);
          expect(w.highFeedback.length).toBeGreaterThanOrEqual(25);
        }

        if (w.type === "lengthCompare") {
          const ans = w.items.find((x) => x.id === w.answerId)!;
          expect(ans).toBeTruthy();
          for (const it of w.items) {
            if (it.id !== w.answerId) {
              expect(ans.length,
                `${lesson.id}/${s.id}: answer must be STRICTLY longest — the solver breaks ties toward the first item`)
                .toBeGreaterThan(it.length);
            }
          }
          if (s.variant?.form === "shapeLengthCompare") {
            const derived = solveG0("shapeLengthCompare",
              `${w.prompt}||${JSON.stringify({ items: w.items })}`);
            expect(String(derived), `${lesson.id}/${s.id}: solver must name the answer item`).toBe(ans.label);
          }
        }

        if (w.type === "mcq") {
          expect(w.options.length).toBeGreaterThanOrEqual(4);
          const correct = w.options.filter((o) => o.correct);
          expect(correct).toHaveLength(1);
          expect(w.options[0].correct).toBe(true);
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

        if (w.type === "tapDiagram") {
          const correct = w.hotspots.filter((h) => h.correct);
          expect(correct).toHaveLength(1);
          for (const h of w.hotspots) {
            expect(h.label.includes(",")).toBe(false);
            if (!h.correct) expect((h.feedback ?? "").length).toBeGreaterThanOrEqual(25);
          }
          if (s.variant?.form === "shapeWeightTap") {
            const derived = solveG0("shapeWeightTap",
              `${w.prompt}||${w.hotspots.map((h) => h.label).join(",")}`) as string[];
            expect(derived, `${lesson.id}/${s.id}: solver must tap the sunken side`).toEqual([correct[0].label]);
          }
          if (s.variant?.form === "shapeSortTap") {
            // labels carry no digits, so counts must travel as JSON state
            const derived = solveG0("shapeSortTap",
              `${w.prompt}||${JSON.stringify({ hotspots: w.hotspots.map((h) => ({ label: h.label, count: h.count })) })}`) as string[];
            expect(derived, `${lesson.id}/${s.id}: solver must tap the max-count group`).toEqual([correct[0].label]);
            const counts = w.hotspots.map((h) => h.count);
            expect(new Set(counts).size, `${lesson.id}/${s.id}: sortTap counts must be distinct`).toBe(counts.length);
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
        }

        if (w.type === "tenFrame") {
          expect(w.target).toBeGreaterThanOrEqual(1);
          expect(w.target).toBeLessThanOrEqual(10);
          expect(w.commonCounts.length).toBeGreaterThanOrEqual(2);
          for (const t of w.commonCounts) expect(t.count).not.toBe(w.target);
        }
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        expect(s.hints.length).toBeGreaterThanOrEqual(2);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);
      }
    });
  }
});

describe("S198 measure-compare-k — capability-table insurance and the two contract corners", () => {
  it("the adapt-3 arithmetic this course's tier rests on holds in engine-capabilities.json", () => {
    // A capabilities edit demoting any of these silently collapses the course to Tier B.
    const CAPS = JSON.parse(
      readFileSync(join(__dirname, "../../scripts/engine-capabilities.json"), "utf8")
    ).types as Record<string, { manip: number; adapt: number }>;
    expect(CAPS["unitRuler"].adapt).toBe(3);
    expect(CAPS["unitRuler"].manip).toBe(3);
    expect(CAPS["balanceScale"].adapt).toBe(3);
    expect(CAPS["numberLineHop"].adapt).toBe(3);
  });

  it("shapeSortFrame: target is the prompt's LAST number (the TOTAL, preFilled included) and the solver agrees", () => {
    let seen = 0;
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ id: string; variant?: { form: string }; widget?: TWidget }>) {
        if (s.variant?.form !== "shapeSortFrame" || !s.widget || s.widget.type !== "tenFrame") continue;
        seen++;
        const w = s.widget;
        const nums = (w.prompt.match(/\d+/g) ?? []).map(Number);
        expect(nums[nums.length - 1],
          `${lesson.id}/${s.id}: shapeSortFrame target must be the prompt's last number — the OPPOSITE of countTeenFrame's teen−10`)
          .toBe(w.target);
        expect(w.preFilled).toBeLessThan(w.target);
        expect(Number(solveG0("shapeSortFrame", w.prompt))).toBe(w.target);
      }
    }
    expect(seen, "the course must actually exercise shapeSortFrame").toBeGreaterThan(0);
  });

  it("lengthCompare align mode: a staggered item plus unalignedFeedback (the procedure IS the graded content)", () => {
    let seen = 0;
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ id: string; widget?: TWidget }>) {
        const w = s.widget;
        if (!w || w.type !== "lengthCompare" || w.mode !== "align") continue;
        seen++;
        expect(w.items.some((x: { startOffset?: number }) => (x.startOffset ?? 0) > 0),
          `${lesson.id}/${s.id}: align mode without a staggered item grades nothing`).toBe(true);
        expect((w.unalignedFeedback ?? "").length).toBeGreaterThanOrEqual(10);
        const ans = w.items.find((x: { id: string }) => x.id === w.answerId);
        expect(ans).toBeTruthy();
        expect(ans!.length).toBe(Math.max(...w.items.map((x: { length: number }) => x.length)));
      }
    }
    expect(seen, "the align-ends lesson must actually use align mode").toBeGreaterThan(0);
  });
});
