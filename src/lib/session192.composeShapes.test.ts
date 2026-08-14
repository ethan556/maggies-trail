import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS } from "./variants";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solvePrompt: solveG1Prompt } = require2("./g1Independent.cjs");

/** S192 — compose-shapes-g1. The factory computes sides/corners/faces from truth tables MIRRORED
 *  from g1Independent.cjs. A mirror can drift from the thing it mirrors, so every numeric answer
 *  is re-derived here by the REAL shipped solver: if the mirror is wrong, this fails.
 *  Also asserts (S191 lesson) that every declared form is REGISTERED — solvePrompt's permissive
 *  fallback means solver agreement alone is not sufficient evidence. */

const DIR = join(__dirname, "../../content/courses/compose-shapes-g1");
const registered = new Set(
  (VARIANT_GENERATORS.find((g) => g.tag === "g1-shapes-measure")?.forms ?? []) as string[]
);

describe("S192 compose-shapes-g1 — shape and generator reuse", () => {
  it("grade 1, 3 chapters sized 3/4/3, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(1);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([3, 4, 3]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(10);
    expect(readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""))).toEqual(declared);
  });

  it("declares only registered g1-shapes-measure forms — no new generator tag, no g0 cross-band reuse", () => {
    expect(registered.size).toBeGreaterThan(0);
    for (const file of readdirSync(join(DIR, "lessons"))) {
      const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
      for (const s of lesson.steps as Array<{ id: string; variant?: { gen: string; form: string } }>) {
        if (!s.variant) continue;
        expect(s.variant.gen, `${lesson.id}/${s.id} unexpected generator tag`).toBe("g1-shapes-measure");
        expect(registered.has(s.variant.form), `${lesson.id}/${s.id}: ${s.variant.form} NOT registered`).toBe(true);
      }
    }
  });
});

describe("S192 compose-shapes-g1 — numerics re-derived by the REAL solver", () => {
  for (const file of readdirSync(join(DIR, "lessons")).sort()) {
    const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
    it(`${lesson.id}: A-tier shape, mirrored truth tables verified against shipped solver`, () => {
      expect(lesson.steps.map((s: { kind: string }) => s.kind)).toEqual(
        ["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]
      );
      const [i1] = lesson.steps.filter((s: { kind: string }) => s.kind === "interactive");
      // S241 WS-E Phase 4: some i1 prediction gates in this course were REMOVED by explicit
      // user ruling (REMOVE verdicts + the ruled repetition-thinning policy; see
      // PREDICTION_GATE_ADJUDICATION.csv). For those lessons the gate must be ABSENT; every
      // other lesson's gate must still be present and internally coherent — same rigor, new truth.
      const S241_REMOVED = new Set(["g1s-01-01", "g1s-01-02"]);
      if (S241_REMOVED.has(lesson.id)) {
        expect(i1.predict).toBeUndefined();
      } else {
        expect(i1.predict).toBeDefined();
        expect(i1.predict.options.some((o: { id: string }) => o.id === i1.predict.outcomeId)).toBe(true);
      }

      for (const s of lesson.steps) {
        if (!s.widget) continue;
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);
        if (w.type === "tapDiagram") {
          expect(w.hotspots.filter((h) => h.correct).length,
            `${lesson.id}/${s.id} tapDiagram must have exactly one correct hotspot`).toBe(1);
          for (const h of w.hotspots.filter((x) => !x.correct)) {
            expect(h.feedback, `${lesson.id}/${s.id} distractor ${h.id} lacks feedback`).toBeTruthy();
          }
        }
        if (w.type === "dragBucket") {
          // Both buckets must be used, or the sort is vacuous — everything goes one place.
          expect(new Set(w.items.map((it) => it.bucketId)).size,
            `${lesson.id}/${s.id} dragBucket must use both buckets`).toBe(2);
          for (const it of w.items) expect(it.feedback.length).toBeGreaterThanOrEqual(25);
        }
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          const derived = solveG1Prompt(s.variant.form, w.prompt);
          expect(derived, `${lesson.id}/${s.id} ${s.variant.form}: ${w.prompt}`).toBe(w.answer);
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
          expect(w.options.length).toBeGreaterThanOrEqual(4);
          const correct = w.options.filter((o) => o.correct);
          expect(correct).toHaveLength(1);
          expect(w.options[0].correct, `${lesson.id}/${s.id} correct not at index 0`).toBe(true);
          const wrongFb = w.options.filter((o) => !o.correct).map((o) => o.feedback);
          expect(new Set(wrongFb).size).toBe(wrongFb.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);
        }
      }
    });
  }
});
