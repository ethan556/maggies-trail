import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS, variantForGenForm } from "./variants";
import { factDrillFor, parseFamily, sumFamilyKey } from "./factFluency";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solvePrompt: solveG2Prompt } = require2("./g2Independent.cjs");

const DIR = join(__dirname, "../../content/courses/fluency-20-g2");
const TAG = "g2-fluency";

describe("S188 fluency-20-g2 — course shape", () => {
  it("3 chapters (4/4/6), ids sequential, files match course.json, grade 2", () => {
    const course = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(course.gradeLevel).toBe(2);
    expect(course.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 4, 6]);
    const declared = course.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(14);
    const files = readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""));
    expect(files).toEqual(declared);
  });
});

describe("S188 fluency-20-g2 — every lesson re-derived from disk", () => {
  for (const file of readdirSync(join(DIR, "lessons")).sort()) {
    const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
    it(`${lesson.id}: A-tier shape, additive tagging, gradable end to end`, () => {
      expect(lesson.steps.map((s: { kind: string }) => s.kind)).toEqual(
        ["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]
      );
      expect(lesson.readingProfile).toBe("early");

      const [i1, i2] = lesson.steps.filter((s: { kind: string }) => s.kind === "interactive");
      expect(i1.predict).toBeDefined();
      expect(i1.predict.options.some((o: { id: string }) => o.id === i1.predict.outcomeId)).toBe(true);
      expect(i2.predict).toBeUndefined();

      // interactive manipulatives must be ADDITIVE engines, and must grade at their solution
      for (const s of [i1, i2]) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);
        expect(["tenFrame", "numberLineHop"]).toContain(w.type);
        if (w.type === "tenFrame") {
          expect(w.preFilled).toBeLessThan(w.target);
          expect(evaluate(w, w.target).correct).toBe(true);
          expect(evaluate(w, w.target - 1).correct).toBe(false);
        } else if (w.type === "numberLineHop") {
          const landing = w.direction === "back" ? w.start - w.hop * w.hops : w.start + w.hop * w.hops;
          expect(landing).toBeGreaterThanOrEqual(w.min);
          expect(landing).toBeLessThanOrEqual(w.max);
          expect(evaluate(w, landing).correct).toBe(true);
          expect(evaluate(w, landing + 1).correct).toBe(false);
          for (const t of w.commonLandings) expect(t.value).not.toBe(landing);
        }
      }

      let tagged = 0;
      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);
        expect(s.variant?.gen).toBe(TAG);
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          // independent solver, not the generator
          expect(solveG2Prompt(s.variant.form, w.prompt)).toBe(w.answer);
          expect(evaluate(w, w.answer).correct).toBe(true);
          const vals = w.commonErrors.map((e) => e.value);
          expect(new Set(vals).size).toBe(vals.length);
          for (const e of w.commonErrors) {
            expect(e.value).not.toBe(w.answer);
            expect(e.value).toBeGreaterThanOrEqual(0); // a trap must be typeable
            expect(evaluate(w, e.value).correct).toBe(false);
            expect(e.feedback.length).toBeGreaterThanOrEqual(25);
          }
        }

        // the family must be ADDITIVE, canonical, within 20, and match the prompt's arithmetic
        const key = s.variant.factFamily;
        expect(key, `${lesson.id}/${s.id} missing factFamily`).toBeDefined();
        tagged++;
        const { op, lo, hi, result } = parseFamily(key);
        expect(op).toBe("+");
        expect(lo).toBeLessThanOrEqual(hi);
        expect(result).toBeLessThanOrEqual(20);
        expect(sumFamilyKey(hi, lo)).toBe(key); // commutative round-trip
        const nums = [...String(w.prompt).matchAll(/\d+/g)].map((m) => Number(m[0]));
        expect(nums.includes(result) || (nums.includes(lo) && nums.includes(hi)),
          `${lesson.id}/${s.id}: family ${key} unrelated to prompt "${w.prompt}"`).toBe(true);
      }
      expect(tagged).toBe(4); // every graded step in a fluency lesson is a fact drill

      const rw = WidgetSpec.parse(lesson.remedials[0].check.widget) as TWidget;
      expect(["numeric", "mcq"]).toContain(rw.type);
      expect(widgetIntegrityErrors(rw)).toEqual([]);
    });
  }
});

describe("S188 g2-fluency generator — independent agreement and additive keys", () => {
  const gen = VARIANT_GENERATORS.find((g) => g.tag === TAG)!;

  it("declares 14 forms, one per lesson", () => {
    expect(gen).toBeDefined();
    expect([...(gen.forms ?? [])]).toHaveLength(14);
  });

  it("every form x band x 40 seeds: parses, self-grades, independent solver agrees, traps typeable", () => {
    for (const form of [...(gen.forms ?? [])]) {
      for (const band of ["support", "core", "stretch"] as const) {
        for (let seed = 1; seed <= 40; seed++) {
          const v = variantForGenForm(TAG, form, `s188-${form}-${band}-${seed}`, band)! as
            { widget: unknown; answer: number; factFamily?: string };
          const w = WidgetSpec.parse(v.widget) as TWidget;
          expect(widgetIntegrityErrors(w)).toEqual([]);
          if (w.type === "numeric") {
            expect(solveG2Prompt(form, w.prompt), `${form} seed ${seed}: ${w.prompt}`).toBe(w.answer);
            expect(w.answer).toBeGreaterThanOrEqual(0);
            expect(w.answer).toBeLessThanOrEqual(20);
            for (const e of w.commonErrors) {
              expect(e.value).not.toBe(w.answer);
              expect(e.value).toBeGreaterThanOrEqual(0);
            }
          }
        }
      }
    }
  });

  it("every emitted family is ADDITIVE, canonical, within 20, and survives the review drill path", () => {
    const fams = new Set<string>();
    for (const form of [...(gen.forms ?? [])]) {
      for (let seed = 1; seed <= 30; seed++) {
        const v = variantForGenForm(TAG, form, `s188-fam-${form}-${seed}`, "core")! as { factFamily?: string };
        if (v.factFamily) fams.add(v.factFamily);
      }
    }
    expect(fams.size).toBeGreaterThan(20);
    for (const key of fams) {
      const { op, lo, hi, result } = parseFamily(key);
      expect(op).toBe("+");
      expect(lo).toBeLessThanOrEqual(hi);
      expect(result).toBeLessThanOrEqual(20);
      // REGRESSION GUARD: this is the exact call ReviewClient makes. Before S188 an additive
      // family threw here, crashing the review page for Grade-2 fluency learners.
      const drill = factDrillFor(key, 0);
      expect(drill.widget.answer).toBeGreaterThanOrEqual(0);
      expect(drill.widget.type).toBe("numeric");
    }
  });

  it("determinism: identical seeds reproduce identical variants", () => {
    for (const form of [...(gen.forms ?? [])]) {
      const a = variantForGenForm(TAG, form, "s188-det", "core");
      const b = variantForGenForm(TAG, form, "s188-det", "core");
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });
});
