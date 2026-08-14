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

/** S198 — compare-numbers-k (K.CC.C.6, K.CC.C.7), Batch G course 2/6. Zero new generator code.
 *
 *  NEW SURFACE CONTRACTS THIS FILE PINS:
 *  - dragOrder (countOrderDrag): correctOrder lists ids in ASCENDING-LABEL order, because the
 *    solver returns the labels sorted ascending. A correctOrder that is right "by id name" but
 *    wrong by label value would grade every learner ordering as incorrect. Round-tripped through
 *    solveG0 with the `prompt||label,label,…` encoding.
 *  - kSeqBeforeHop: direction "back", landing = start − hops. The generic landing formula
 *    start + hop*hops is WRONG for back hops; the direction-aware landing is asserted, and the
 *    prompt shape "right before N" must agree with N − 1.
 *
 *  The all-A K recipe (predict + traps + one numberLineHop per lesson) is asserted per lesson,
 *  as in how-many-k. */

const DIR = join(__dirname, "../../content/courses/compare-numbers-k");
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

describe("S198 compare-numbers-k — course shape and recipe", () => {
  it("grade K, 3 chapters sized 4/4/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(0);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 4, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(12);
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
      const v = variantForGenForm(gen, form, `s198-surface2-${form}`, "core");
      expect(v, `${gen}/${form} generated nothing`).toBeTruthy();
      expect(v!.widget.type, `${form} is authored as ${type} but GENERATES ${v!.widget.type}`).toBe(type);
    }
  });

  it("the all-A K recipe holds in EVERY lesson", () => {
    for (const lesson of lessons) {
      const i1 = lesson.steps[1];
      // S241 WS-E Phase 4: kcm-03-03's i1 gate was REMOVED by the ruled thinning policy
      // (see PREDICTION_GATE_ADJUDICATION.csv); it must stay absent. All other lessons keep the recipe.
      if (lesson.id === "kcm-03-03") {
        expect(i1.predict, `${lesson.id}: removed gate must stay removed`).toBeUndefined();
      } else {
        expect(i1.predict, `${lesson.id}: i1 predict step missing`).toBeDefined();
      }
      const hasHop = (lesson.steps as Array<{ widget?: { type: string } }>)
        .some((s) => s.widget?.type === "numberLineHop");
      expect(hasHop, `${lesson.id}: no numberLineHop (the only adapt-3 K engine)`).toBe(true);
      for (const s of lesson.steps as Array<{ id: string; kind: string; widget?: { type: string } }>) {
        if (s.kind !== "interactive" || !s.widget) continue;
        expect(CAPS[s.widget.type]?.manip ?? 0,
          `${lesson.id}/${s.id}: interactive ${s.widget.type}`).toBeGreaterThanOrEqual(2);
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

describe("S198 compare-numbers-k — surface contracts and solver round-trips", () => {
  for (const lesson of lessons) {
    it(`${lesson.id}: shape, dragOrder ascending, back-hop landings`, () => {
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
          expect(w.options[0].correct).toBe(true);
          const fb = w.options.map((o) => o.feedback);
          expect(new Set(fb).size).toBe(fb.length);
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
          expect(land, `${lesson.id}/${s.id} landing at/below min`).toBeGreaterThan(w.min);
          expect(land, `${lesson.id}/${s.id} landing at/above max`).toBeLessThan(w.max);
          expect(w.commonLandings.length).toBeGreaterThanOrEqual(2);
          for (const t of w.commonLandings) {
            expect(t.value).not.toBe(land);
            expect(t.feedback.length).toBeGreaterThanOrEqual(25);
          }
          if (s.variant?.form === "kSeqBeforeHop") {
            expect(w.direction).toBe("back");
            const m = w.prompt.match(/^What number comes right before (\d+)\?/);
            expect(m, `${lesson.id}/${s.id}: kSeqBeforeHop prompt shape`).toBeTruthy();
            expect(Number(m![1]) - 1, `${lesson.id}/${s.id}: back-hop landing must be N−1`).toBe(land);
          }
          if (s.variant?.form === "kSeqNextHop") {
            const m = w.prompt.match(/^What number comes right after (\d+)\?/);
            expect(m).toBeTruthy();
            expect(Number(m![1]) + 1).toBe(land);
          }
          if (s.variant?.form === "kCountFromHop") {
            const m = w.prompt.match(/^Start at (\d+) and count on (\d+)\./);
            expect(m).toBeTruthy();
            expect(Number(m![1]) + Number(m![2])).toBe(land);
          }
        }

        if (w.type === "dragOrder") {
          const byId = new Map(w.items.map((x) => [x.id, Number(x.label)]));
          const vals = w.correctOrder.map((idd) => byId.get(idd)!);
          for (let i = 1; i < vals.length; i++) {
            expect(vals[i],
              `${lesson.id}/${s.id}: correctOrder not ascending by LABEL — the solver sorts labels, so this would grade every learner ordering wrong`)
              .toBeGreaterThan(vals[i - 1]);
          }
          expect(w.misorderFeedback.length).toBeGreaterThanOrEqual(1);
          for (const mo of w.misorderFeedback) {
            expect(byId.has(mo.first)).toBe(true);
            expect(byId.has(mo.second)).toBe(true);
            expect(byId.get(mo.first)!, `${lesson.id}/${s.id}: misorder pair must actually be misordered`)
              .toBeGreaterThan(byId.get(mo.second)!);
            expect(mo.feedback.length).toBeGreaterThanOrEqual(25);
          }
          if (s.variant) {
            const input = `${w.prompt}||${w.items.map((x) => x.label).join(",")}`;
            const derived = solveG0(s.variant.form, input) as string[];
            expect(derived, `${lesson.id}/${s.id}: solver order`).toEqual(
              [...w.items.map((x) => Number(x.label))].sort((a, b) => a - b).map(String));
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
        }
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        expect(s.hints.length).toBeGreaterThanOrEqual(2);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);
      }
    });
  }
});
