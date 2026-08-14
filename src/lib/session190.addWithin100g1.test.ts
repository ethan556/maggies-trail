import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solvePrompt: solveG1Prompt } = require2("./g1Independent.cjs");

const DIR = join(__dirname, "../../content/courses/add-within-100-g1");

/** PROTOCOL v2's central claim for this course: every graded widget was produced by an
 * EXISTING, pre-session-151 generator (g1-add-subtract / g1-tens-ones), not a new one. This
 * test proves it two ways: (1) the widget passes the REAL, already-shipped independent solver
 * for its declared form — the same solver that gated these forms before this course existed —
 * and (2) no lesson references a generator tag this course did not inherit. */
describe("S190 add-within-100-g1 — course shape", () => {
  it("grade 1, 3 chapters sized 4/6/4, files match course.json", () => {
    const course = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(course.gradeLevel).toBe(1);
    expect(course.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 6, 4]);
    const declared = course.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(14);
    expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
  });
});

describe("S190 add-within-100-g1 — every lesson re-derived, every check via the REAL pre-existing solver", () => {
  const REUSED_TAGS = new Set(["g1-add-subtract", "g1-tens-ones"]);
  for (const file of readdirSync(join(DIR, "lessons")).sort()) {
    const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
    it(`${lesson.id}: A-tier shape, gradable end to end, only PRE-EXISTING generator tags`, () => {
      expect(lesson.steps.map((s: { kind: string }) => s.kind)).toEqual(
        ["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]
      );
      const [i1] = lesson.steps.filter((s: { kind: string }) => s.kind === "interactive");
      // S241 WS-E Phase 4: g1a-01-01's i1 prediction gate was REMOVED by the user-ruled thinning
      // policy (g1a-02-03 kept as the family's canonical gate). Every other lesson in this
      // course must still carry a coherent gate — the assertion is conditional, not deleted:
      // a gate that exists must be internally consistent, exactly as before.
      if (lesson.id === "g1a-01-01") {
        expect(i1.predict).toBeUndefined();
      } else {
        expect(i1.predict).toBeDefined();
        expect(i1.predict.options.some((o: { id: string }) => o.id === i1.predict.outcomeId)).toBe(true);
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        // THE CENTRAL CLAIM: no new generator tag was registered for this course.
        expect(s.variant, `${lesson.id}/${s.id} missing variant`).toBeTruthy();
        expect(REUSED_TAGS.has(s.variant.gen), `${lesson.id}/${s.id} used an unexpected tag ${s.variant.gen}`).toBe(true);

        if (w.type === "numeric") {
          // the REAL, already-shipped solver — not the factory's mirror — must reproduce the
          // authored answer. This is the actual proof of reuse: if the mirror had drifted from
          // the true generator, this is where it would be caught.
          expect(solveG1Prompt(s.variant.form, w.prompt), `${lesson.id}/${s.id} form ${s.variant.form}`).toBe(w.answer);
          expect(evaluate(w, w.answer).correct).toBe(true);
          const vals = w.commonErrors.map((e) => e.value);
          expect(new Set(vals).size, `${lesson.id}/${s.id} duplicate traps`).toBe(vals.length);
          for (const e of w.commonErrors) {
            expect(e.value, `${lesson.id}/${s.id} trap equals answer`).not.toBe(w.answer);
            expect(evaluate(w, e.value).correct).toBe(false);
            expect(e.feedback.length).toBeGreaterThanOrEqual(25);
          }
        } else if (w.type === "mcq") {
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
