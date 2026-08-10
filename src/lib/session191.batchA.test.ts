import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solvePrompt: solveG1Prompt } = require2("./g1Independent.cjs");

/** PROTOCOL v2's central claim for S191's two courses: every graded widget was produced by an
 * EXISTING, pre-session-151 generator family (g1-add-subtract for both; unknown-letter joins
 * for equations-unknowns-g1), not a new one. Numeric answers are re-derived by the REAL,
 * already-shipped g1 solver, or — for the two unknown-letter numeric forms, whose routes live
 * inside variants.test.ts and are not importable — by an independent brute-force search over
 * the prompt (never the inverse operation, never the factory's arithmetic). */

// Independent re-derivation for unknown-letter numeric forms: exhaustive search, mirroring the
// method (not the code) of the shipped variants.test.ts routes for these forms.
function solveUnknownLetter(form: string, prompt: string): number {
  if (form === "solveAdd") {
    const m = prompt.match(/x \+ (\d+) = (\d+)/);
    expect(m, `solveAdd shape: ${prompt}`).toBeTruthy();
    const a = Number(m![1]), t = Number(m![2]);
    for (let x = 0; x <= 100; x++) if (x + a === t) return x;
    throw new Error("no add solution");
  }
  if (form === "solveSubtract") {
    const m = prompt.match(/^Solve x − (\d+) = (\d+)\.$/);
    expect(m, `solveSubtract shape: ${prompt}`).toBeTruthy();
    const a = Number(m![1]), r = Number(m![2]);
    for (let x = 0; x <= 100; x++) if (x - a === r) return x;
    throw new Error("no subtract solution");
  }
  throw new Error(`unexpected unknown-letter numeric form ${form}`);
}

const COURSES: Array<{
  slug: string; count: number; chapterSizes: number[]; idPrefix: string;
  reusedTags: Set<string>;
}> = [
  { slug: "properties-strategies-g1", count: 14, chapterSizes: [5, 5, 4], idPrefix: "g1p-",
    reusedTags: new Set(["g1-add-subtract"]) },
  { slug: "equations-unknowns-g1", count: 12, chapterSizes: [5, 4, 3], idPrefix: "g1e-",
    reusedTags: new Set(["g1-add-subtract", "unknown-letter"]) },
];

for (const course of COURSES) {
  const DIR = join(__dirname, `../../content/courses/${course.slug}`);

  describe(`S191 ${course.slug} — course shape`, () => {
    it(`grade 1, 3 chapters sized ${course.chapterSizes.join("/")}, files match course.json`, () => {
      const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
      expect(cj.gradeLevel).toBe(1);
      expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual(course.chapterSizes);
      const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
      expect(declared).toHaveLength(course.count);
      for (const id of declared) expect(id.startsWith(course.idPrefix)).toBe(true);
      expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
    });
  });

  describe(`S191 ${course.slug} — every lesson re-derived, checks via REAL pre-existing solvers`, () => {
    for (const file of readdirSync(join(DIR, "lessons")).sort()) {
      const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
      it(`${lesson.id}: A-tier shape, gradable end to end, only PRE-EXISTING generator tags`, () => {
        expect(lesson.steps.map((s: { kind: string }) => s.kind)).toEqual(
          ["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]
        );
        const [i1] = lesson.steps.filter((s: { kind: string }) => s.kind === "interactive");
        expect(i1.predict).toBeDefined();
        expect(i1.predict.options.some((o: { id: string }) => o.id === i1.predict.outcomeId)).toBe(true);

        for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
          const w = WidgetSpec.parse(s.widget) as TWidget;
          expect(widgetIntegrityErrors(w)).toEqual([]);
          expect(s.hints).toHaveLength(3);
          expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

          // THE CENTRAL CLAIM: no new generator tag was registered for either course.
          expect(s.variant, `${lesson.id}/${s.id} missing variant`).toBeTruthy();
          expect(course.reusedTags.has(s.variant.gen), `${lesson.id}/${s.id} used an unexpected tag ${s.variant.gen}`).toBe(true);

          if (w.type === "numeric") {
            const derived = s.variant.gen === "unknown-letter"
              ? solveUnknownLetter(s.variant.form, w.prompt)
              : solveG1Prompt(s.variant.form, w.prompt);
            expect(derived, `${lesson.id}/${s.id} form ${s.variant.form}`).toBe(w.answer);
            expect(evaluate(w, w.answer).correct).toBe(true);
            const vals = w.commonErrors.map((e) => e.value);
            expect(new Set(vals).size, `${lesson.id}/${s.id} duplicate traps`).toBe(vals.length);
            for (const e of w.commonErrors) {
              expect(e.value, `${lesson.id}/${s.id} trap equals answer`).not.toBe(w.answer);
              expect(evaluate(w, e.value).correct).toBe(false);
              expect(e.feedback.length).toBeGreaterThanOrEqual(25);
            }
          } else if (w.type === "mcq") {
            expect(w.options.length, `${lesson.id}/${s.id} option count (protocol v2 point 4)`).toBeGreaterThanOrEqual(4);
            const correct = w.options.filter((o) => o.correct);
            expect(correct).toHaveLength(1);
            const wrongFb = w.options.filter((o) => !o.correct).map((o) => o.feedback);
            expect(new Set(wrongFb).size).toBe(wrongFb.length);
            expect(evaluate(w, correct[0].id).correct).toBe(true);
          }
        }
      });
    }
  });
}
