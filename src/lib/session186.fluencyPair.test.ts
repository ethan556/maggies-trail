import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS, variantForGenForm } from "./variants";
import { factFamilyKey, parseFactFamily } from "./factFluency";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solveG3FluencyPrompt } = require2("./g3FluencyIndependent.cjs");

const COURSES = [
  { slug: "mult-fluency-g3", prefix: "mf3", per: 6, tag: "g3-mult-fluency" },
  { slug: "division-fluency-g3", prefix: "df3", per: 4, tag: "g3-div-fluency" },
] as const;

/** The one lesson that legitimately carries no fact family: division by zero is not a fact.
 * Mirrors the CONCEPTUAL_NO_FACT allowlist in the factory. */
const NO_FACT_LESSONS = new Set(["df3-03-02"]);

/** Graded steps that legitimately carry no variant: no generator form emits their surface.
 * df3-03-02 is the divide-by-zero lesson (0 ÷ 5 and "which has an answer?" are one-off
 * conceptual items); df3-03-04/ch1 asks the learner to choose the operation AND compute. */
const UNVARIANTED_OK = new Set(["df3-03-02/k2", "df3-03-02/ch1", "df3-03-04/ch1"]);

describe("S186 fluency pair — course shape", () => {
  for (const c of COURSES) {
    it(`${c.slug}: 3 chapters x ${c.per} lessons, ids sequential, files match course.json`, () => {
      const dir = join(__dirname, "../../content/courses", c.slug);
      const course = JSON.parse(readFileSync(join(dir, "course.json"), "utf8"));
      expect(course.gradeLevel).toBe(3);
      expect(course.chapters).toHaveLength(3);
      const declared = course.chapters.flatMap((ch: { lessonIds: string[] }) => ch.lessonIds);
      expect(declared).toHaveLength(3 * c.per);
      const files = readdirSync(join(dir, "lessons")).sort().map((f) => f.replace(/\.json$/, ""));
      expect(files).toEqual(declared);
      for (const ch of course.chapters) expect(ch.lessonIds).toHaveLength(c.per);
    });
  }
});

describe("S186 fluency pair — every lesson re-derived from disk", () => {
  for (const c of COURSES) {
    const dir = join(__dirname, "../../content/courses", c.slug, "lessons");
    for (const file of readdirSync(dir).sort()) {
      const lesson = JSON.parse(readFileSync(join(dir, file), "utf8"));
      it(`${lesson.id}: A-tier shape, gradable end to end, fact tagging canonical`, () => {
        expect(lesson.steps.map((s: { kind: string }) => s.kind)).toEqual(
          ["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]
        );
        const [i1, i2] = lesson.steps.filter((s: { kind: string }) => s.kind === "interactive");
        expect(i1.predict).toBeDefined();
        expect(i1.predict.options.some((o: { id: string }) => o.id === i1.predict.outcomeId)).toBe(true);
        expect(i2.predict).toBeUndefined();

        // interactive widgets grade correctly at their target and reject a perturbation
        for (const s of [i1, i2]) {
          const w = WidgetSpec.parse(s.widget) as TWidget;
          expect(widgetIntegrityErrors(w)).toEqual([]);
          if (w.type === "areaModel" && w.countGrid) {
            // countGrid mode grades a COUNT (a number), not a {w,h} rectangle.
            expect(evaluate(w, w.targetArea).correct).toBe(true);
            expect(evaluate(w, w.targetArea + 1).correct).toBe(false);
            for (const cc of w.commonCounts) expect(cc.count).not.toBe(w.targetArea);
          } else if (w.type === "areaModel") {
            // areaModel grades on targetArea (wMax/hMax are only the slider ceilings), so find a
            // factor pair that actually fits the stage and prove it grades, plus a near miss.
            // When the lesson pins a specific factoring (requireFactors), hitting the area is
            // necessary but not sufficient — the array must show THAT factoring. Honor it.
            let found: { w: number; h: number } | null = null;
            if (w.requireFactors) {
              found = { w: w.requireFactors.w, h: w.requireFactors.h };
            } else {
              for (let a = 1; a <= w.wMax && !found; a++) {
                if (w.targetArea % a !== 0) continue;
                const b = w.targetArea / a;
                if (b <= w.hMax) found = { w: a, h: b };
              }
            }
            expect(found, `${lesson.id}/${s.id}: targetArea ${w.targetArea} unreachable within ${w.wMax}x${w.hMax}`).not.toBeNull();
            expect(evaluate(w, found!).correct).toBe(true);
            expect(evaluate(w, { w: found!.w, h: found!.h + 1 }).correct).toBe(false);
          }
        }

        let tagged = 0;
        for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
          const w = WidgetSpec.parse(s.widget) as TWidget;
          expect(widgetIntegrityErrors(w)).toEqual([]);
          // Variant-backing is the norm, but a few genuinely conceptual steps have no generator
          // form that emits their surface (division by zero; choose-then-compute). Those are
          // allowlisted BY STEP rather than waived wholesale, so a fluency drill that silently
          // loses its variant still fails here.
          if (s.variant) expect(s.variant.gen).toBe(c.tag);
          else expect(UNVARIANTED_OK.has(`${lesson.id}/${s.id}`),
            `${lesson.id}/${s.id} has no variant and is not an allowlisted conceptual step`).toBe(true);
          expect(s.hints).toHaveLength(3);
          expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

          // the authored answer must survive the INDEPENDENT solver, not the generator
          if (w.type === "numeric") {
            if (s.variant) expect(solveG3FluencyPrompt(s.variant.form, w.prompt)).toBe(w.answer);
            expect(evaluate(w, w.answer).correct).toBe(true);
            const vals = w.commonErrors.map((e) => e.value);
            expect(new Set(vals).size).toBe(vals.length);
            for (const e of w.commonErrors) {
              expect(e.value, `${lesson.id}/${s.id} trap equals answer`).not.toBe(w.answer);
              expect(evaluate(w, e.value).correct).toBe(false);
              expect(e.feedback.length).toBeGreaterThanOrEqual(25);
            }
          } else if (w.type === "mcq") {
            const correct = w.options.filter((o) => o.correct);
            expect(correct).toHaveLength(1);
            const wrongFeedback = w.options.filter((o) => !o.correct).map((o) => o.feedback);
            expect(new Set(wrongFeedback).size).toBe(wrongFeedback.length);
            expect(evaluate(w, correct[0].id).correct).toBe(true);
          }

          // fact-family tagging: canonical, and consistent with the prompt's own arithmetic
          if (s.variant?.factFamily) {
            tagged++;
            const { lo, hi, product } = parseFactFamily(s.variant.factFamily);
            expect(lo).toBeLessThanOrEqual(hi);
            expect(factFamilyKey(lo, hi)).toBe(s.variant.factFamily);
            const nums = [...String(w.prompt).matchAll(/\d+/g)].map((m) => Number(m[0]));
            // the family's product or both factors must actually appear in the prompt —
            // a tag that names a fact the learner never sees would corrupt the leech box
            const mentionsProduct = nums.includes(product);
            const mentionsFactors = nums.includes(lo) && nums.includes(hi);
            expect(mentionsProduct || mentionsFactors,
              `${lesson.id}/${s.id}: factFamily ${s.variant.factFamily} unrelated to prompt "${w.prompt}"`).toBe(true);
          }
        }
        if (NO_FACT_LESSONS.has(lesson.id)) expect(tagged).toBe(0);
        else expect(tagged, `${lesson.id} must exercise the fact-grain architecture`).toBeGreaterThanOrEqual(1);
      });
    }
  }
});

describe("S186 fluency generators — independent agreement over every form", () => {
  for (const c of COURSES) {
    const gen = VARIANT_GENERATORS.find((g) => g.tag === c.tag)!;
    it(`${c.tag}: every form x band x 40 seeds parses, self-grades, and matches the independent solver`, () => {
      expect(gen).toBeDefined();
      const forms = [...(gen.forms ?? [])];
      expect(forms.length).toBeGreaterThan(0);
      for (const form of forms) {
        for (const band of ["support", "core", "stretch"] as const) {
          for (let seed = 1; seed <= 40; seed++) {
            const v = variantForGenForm(c.tag, form, `s186-${form}-${band}-${seed}`, band)!;
            const w = WidgetSpec.parse(v.widget) as TWidget;
            expect(widgetIntegrityErrors(w)).toEqual([]);
            if (w.type === "numeric") {
              expect(solveG3FluencyPrompt(form, w.prompt), `${form} seed ${seed}`).toBe(w.answer);
              for (const e of w.commonErrors) expect(e.value).not.toBe(w.answer);
            } else if (w.type === "mcq") {
              const labels = w.options.map((o) => o.label);
              const correct = w.options.find((o) => o.correct)!;
              expect(solveG3FluencyPrompt(form, `${w.prompt}||${labels.join(";;")}`)).toBe(correct.label);
            }
          }
        }
      }
    });
  }

  it("generator-emitted factFamily keys are always canonical", () => {
    for (const c of COURSES) {
      const gen = VARIANT_GENERATORS.find((g) => g.tag === c.tag)!;
      for (const form of [...(gen.forms ?? [])]) {
        for (let seed = 1; seed <= 25; seed++) {
          const v = variantForGenForm(c.tag, form, `s186-canon-${form}-${seed}`, "core")! as { factFamily?: string };
          if (!v.factFamily) continue;
          const { lo, hi } = parseFactFamily(v.factFamily);
          expect(lo).toBeLessThanOrEqual(hi);
          expect(factFamilyKey(hi, lo)).toBe(v.factFamily); // commutative round-trip
        }
      }
    }
  });

  it("determinism: identical seeds reproduce identical variants", () => {
    for (const c of COURSES) {
      const gen = VARIANT_GENERATORS.find((g) => g.tag === c.tag)!;
      for (const form of [...(gen.forms ?? [])]) {
        const a = variantForGenForm(c.tag, form, "s186-det", "core");
        const b = variantForGenForm(c.tag, form, "s186-det", "core");
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
      }
    }
  });
});
