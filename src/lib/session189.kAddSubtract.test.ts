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
const { solvePrompt: solveG0Prompt } = require2("./g0Independent.cjs");

const DIR = join(__dirname, "../../content/courses/add-subtract-10-k");
const TAG = "k0-add-subtract";

/** K.OA.A.5 fluency lessons — the only ones that may carry a fact family. The K.OA.A.1/2
 * lessons are about REPRESENTING a situation; tagging them would put modelling evidence into a
 * recall leech box and corrupt the fluency scheduler's signal. */
const FLUENCY_LESSONS = new Set(["koa-03-06", "koa-03-07", "koa-03-08", "koa-03-09", "koa-03-10"]);

describe("S189 add-subtract-10-k — course shape", () => {
  const course = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
  it("grade 0, 3 chapters sized 5/5/10, files match course.json", () => {
    expect(course.gradeLevel).toBe(0);
    expect(course.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([5, 5, 10]);
    const declared = course.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(20);
    expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
  });
});

describe("S189 add-subtract-10-k — every lesson re-derived from disk", () => {
  for (const file of readdirSync(join(DIR, "lessons")).sort()) {
    const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
    it(`${lesson.id}: A-tier shape, K-range numbers, gradable end to end`, () => {
      expect(lesson.steps.map((s: { kind: string }) => s.kind)).toEqual(
        ["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]
      );
      expect(lesson.readingProfile).toBe("early");

      const [i1, i2] = lesson.steps.filter((s: { kind: string }) => s.kind === "interactive");
      // S241 WS-E Phase 4: some i1 prediction gates in this course were REMOVED by explicit
      // user ruling (REMOVE verdicts + the ruled repetition-thinning policy; see
      // PREDICTION_GATE_ADJUDICATION.csv). For those lessons the gate must be ABSENT; every
      // other lesson's gate must still be present and internally coherent — same rigor, new truth.
      const S241_REMOVED = new Set(["koa-02-03", "koa-02-05", "koa-03-02", "koa-03-04", "koa-03-06", "koa-03-10"]);
      if (S241_REMOVED.has(lesson.id)) {
        expect(i1.predict).toBeUndefined();
      } else {
        expect(i1.predict).toBeDefined();
        expect(i1.predict.options.some((o: { id: string }) => o.id === i1.predict.outcomeId)).toBe(true);
      }
      expect(i2.predict).toBeUndefined();

      for (const s of [i1, i2]) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);
        if (w.type === "tenFrame") {
          // an already-complete frame gives the learner nothing to do
          expect(w.preFilled).toBeLessThan(w.target);
          expect(w.target).toBeLessThanOrEqual(10);
          expect(evaluate(w, w.target).correct).toBe(true);
          expect(evaluate(w, w.target - 1).correct).toBe(false);
        } else if (w.type === "numberLineHop") {
          const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
          expect(land).toBeGreaterThanOrEqual(0);
          expect(land).toBeLessThanOrEqual(10);
          expect(evaluate(w, land).correct).toBe(true);
          expect(evaluate(w, land + 1).correct).toBe(false);
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
          // independent solver, not the generator, must reproduce the authored answer
          expect(solveG0Prompt(s.variant.form, w.prompt)).toBe(w.answer);
          expect(w.answer).toBeGreaterThanOrEqual(0);
          expect(w.answer).toBeLessThanOrEqual(10);
          expect(evaluate(w, w.answer).correct).toBe(true);
          const vals = w.commonErrors.map((e) => e.value);
          expect(new Set(vals).size, `${lesson.id}/${s.id} duplicate traps`).toBe(vals.length);
          for (const e of w.commonErrors) {
            expect(e.value, `${lesson.id}/${s.id} trap equals answer`).not.toBe(w.answer);
            expect(e.value).toBeGreaterThanOrEqual(0);
            expect(evaluate(w, e.value).correct).toBe(false);
            expect(e.feedback.length).toBeGreaterThanOrEqual(25);
          }
        } else if (w.type === "mcq") {
          const correct = w.options.filter((o) => o.correct);
          expect(correct).toHaveLength(1);
          const labels = w.options.map((o) => o.label);
          expect(solveG0Prompt(s.variant.form, `${w.prompt}||${labels.join(";;")}`)).toBe(correct[0].label);
          const wrongFb = w.options.filter((o) => !o.correct).map((o) => o.feedback);
          expect(new Set(wrongFb).size).toBe(wrongFb.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
        }

        if (s.variant.factFamily) {
          tagged++;
          const { op, lo, hi } = parseFamily(s.variant.factFamily);
          expect(op, "K fluency families are ADDITIVE").toBe("+");
          expect(lo).toBeLessThanOrEqual(hi);
          expect(sumFamilyKey(hi, lo)).toBe(s.variant.factFamily); // commutative round-trip
          // the exact call ReviewClient makes must succeed on this family
          expect(factDrillFor(s.variant.factFamily, 0).widget.answer).toBeGreaterThanOrEqual(0);
        }
      }

      // THE BOUNDARY: fluency lessons are tagged, modelling lessons are not.
      if (FLUENCY_LESSONS.has(lesson.id)) {
        expect(tagged, `${lesson.id} is K.OA.A.5 — must feed the leech box`).toBeGreaterThanOrEqual(1);
      } else {
        expect(tagged, `${lesson.id} is modelling — recall evidence must NOT be recorded`).toBe(0);
      }
    });
  }
});

describe("S189 k0-add-subtract generator — independent agreement over every form", () => {
  const gen = VARIANT_GENERATORS.find((g) => g.tag === TAG)!;
  const FLUENCY_FORMS = new Set([
    "KoaSums5Numeric", "KoaDiffs5Numeric", "KoaPlusMinusOneNumeric", "KoaZeroFactNumeric", "KoaSpeedy5Numeric",
  ]);

  it("declares 20 forms, one per authored lesson", () => {
    expect([...(gen.forms ?? [])]).toHaveLength(20);
  });

  it("every form x band x 30 seeds: parses, self-grades, and matches the independent solver", () => {
    for (const form of [...(gen.forms ?? [])]) {
      for (const band of ["support", "core", "stretch"] as const) {
        for (let seed = 1; seed <= 30; seed++) {
          const v = variantForGenForm(TAG, form, `s189-${form}-${band}-${seed}`, band)!;
          const w = WidgetSpec.parse(v.widget) as TWidget;
          expect(widgetIntegrityErrors(w)).toEqual([]);
          if (w.type === "numeric") {
            expect(solveG0Prompt(form, w.prompt), `${form} seed ${seed}`).toBe(w.answer);
            expect(w.answer).toBeGreaterThanOrEqual(0);
            expect(w.answer).toBeLessThanOrEqual(10);
            for (const e of w.commonErrors) {
              expect(e.value).not.toBe(w.answer);
              expect(e.value).toBeGreaterThanOrEqual(0);
            }
          } else if (w.type === "mcq") {
            const labels = w.options.map((o) => o.label);
            const correct = w.options.find((o) => o.correct)!;
            expect(solveG0Prompt(form, `${w.prompt}||${labels.join(";;")}`)).toBe(correct.label);
          }
        }
      }
    }
  });

  it("ONLY the K.OA.A.5 forms emit a fact family, and every one is additive and canonical", () => {
    const fams = new Set<string>();
    for (const form of [...(gen.forms ?? [])]) {
      for (let seed = 1; seed <= 30; seed++) {
        const v = variantForGenForm(TAG, form, `s189-fam-${form}-${seed}`, "core")! as { factFamily?: string };
        if (FLUENCY_FORMS.has(form)) {
          expect(v.factFamily, `${form} is fluency — must be tagged`).toBeTruthy();
          const { op, lo, hi } = parseFamily(v.factFamily!);
          expect(op).toBe("+");
          expect(lo).toBeLessThanOrEqual(hi);
          fams.add(v.factFamily!);
        } else {
          expect(v.factFamily, `${form} is modelling — must NOT be tagged`).toBeUndefined();
        }
      }
    }
    expect(fams.size).toBeGreaterThanOrEqual(10);
    for (const f of fams) expect(factDrillFor(f, 0).widget.answer).toBeGreaterThanOrEqual(0);
  });

  it("determinism: identical seeds reproduce identical variants", () => {
    for (const form of [...(gen.forms ?? [])]) {
      expect(JSON.stringify(variantForGenForm(TAG, form, "s189-det", "core")))
        .toBe(JSON.stringify(variantForGenForm(TAG, form, "s189-det", "core")));
    }
  });
});
