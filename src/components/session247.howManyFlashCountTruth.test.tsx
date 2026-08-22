// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { evaluate, correctAnswerText } from "../lib/evaluate";
import { lintLesson } from "../lib/pedagogy";
import { Lesson, WidgetSpec, type TSubitizeFlash } from "../lib/schema";
import { variantForGenForm } from "../lib/variants";
import { WidgetRenderer } from "./widgets";

const COURSE = join(process.cwd(), "content", "courses", "how-many-k", "lessons");
const LESSON_IDS = ["khm-03-05", "khm-03-06"] as const;
const EXPECTED: ReadonlyMap<string, {
  count: number;
  arrangement: TSubitizeFlash["arrangement"];
  form: "countObjectsFlash" | "countReadFlash";
}> = new Map([
  ["khm-03-05/k2", { count: 3, arrangement: "dice", form: "countObjectsFlash" }],
  ["khm-03-05/ch1", { count: 4, arrangement: "dice", form: "countObjectsFlash" }],
  ["khm-03-06/k2", { count: 4, arrangement: "tenFrame", form: "countReadFlash" }],
  // Re-pinned count 4 -> 6: signed S319-EARLY-khm-03-06 (verified S319-V2) broke
  // ch1's identical-stimulus duplication of k2 by retargeting the flash to 6
  // (options [5,6,7,8], commonPicks/feedback recomputed). S326-R1 reconcile.
  ["khm-03-06/ch1", { count: 6, arrangement: "tenFrame", form: "countReadFlash" }],
] as const);

const lessons = LESSON_IDS.map((lessonId) => Lesson.parse(JSON.parse(readFileSync(join(COURSE, `${lessonId}.json`), "utf8"))));

const sourceFlashes = lessons.flatMap((lesson) => lesson.steps.flatMap((step) => {
  if (!step.widget || step.widget.type !== "subitizeFlash") return [];
  return [{ lessonId: lesson.id, stepId: step.id, variant: step.variant, widget: step.widget }];
}));

const digits = (text: string) => text.match(/\d+/g) ?? [];

const expectTruthAgreement = (widget: TSubitizeFlash, context: string) => {
  expect(widget.options, context).toContain(widget.count);
  expect(correctAnswerText(widget), context).toBe(String(widget.count));
  expect(evaluate(widget, widget.count), context).toEqual({ correct: true, feedback: widget.successFeedback });
  expect(digits(widget.successFeedback), `${context} success feedback`).toEqual([String(widget.count)]);
  expect(digits(widget.missFeedback), `${context} miss feedback`).toEqual([String(widget.count)]);

  for (const option of widget.options.filter((value) => value !== widget.count)) {
    const result = evaluate(widget, option);
    expect(result.correct, `${context} accepted ${option}`).toBe(false);
    expect(result.feedback, `${context} feedback for ${option}`).toContain(String(widget.count));
  }
};

afterEach(cleanup);

describe("S247 how-many flash-count truth repair", () => {
  it("keeps all four authored visible counts, evaluator targets, and feedback counts identical", () => {
    expect(sourceFlashes.map(({ lessonId, stepId }) => `${lessonId}/${stepId}`)).toEqual([...EXPECTED.keys()]);
    for (const { lessonId, stepId, variant, widget } of sourceFlashes) {
      const key = `${lessonId}/${stepId}`;
      const expected = EXPECTED.get(key);
      expect(expected, key).toBeDefined();
      expect(widget.count, key).toBe(expected!.count);
      expect(widget.arrangement, key).toBe(expected!.arrangement);
      expect(variant, key).toMatchObject({ gen: "g0-counting", form: expected!.form });
      expectTruthAgreement(widget, key);
    }
  });

  it("exposes the same source count through the rendered visual and accessible reveal", () => {
    for (const { lessonId, stepId, widget } of sourceFlashes) {
      const key = `${lessonId}/${stepId}`;
      const view = render(<WidgetRenderer spec={widget} value={widget.count - 1} onChange={() => undefined} disabled={false} tone="info" />);
      const scope = within(view.container);
      expect(scope.getByText(widget.prompt), key).toBeTruthy();
      expect(scope.getByRole("img", { name: `${widget.count} dots` }), key).toBeTruthy();
      expect(scope.getByTestId("szf-ghost").textContent, key).toBe(String(widget.count));
      view.unmount();
    }
  });

  it("preserves prompt-family truth across generated flash variants", () => {
    for (const form of ["countObjectsFlash", "countReadFlash"] as const) {
      for (const band of ["support", "core", "stretch"] as const) {
        for (let seed = 1; seed <= 40; seed += 1) {
          const context = `${form}/${band}/${seed}`;
          const variant = variantForGenForm("g0-counting", form, `s247-${context}`, band);
          expect(variant, context).toBeDefined();
          const widget = WidgetSpec.parse(variant!.widget);
          expect(widget.type, context).toBe("subitizeFlash");
          if (widget.type !== "subitizeFlash") throw new Error(`${context}: expected subitizeFlash`);
          expect(variant!.answer, context).toBe(widget.count);
          expect(widget.prompt, context).toBe(form === "countObjectsFlash"
            ? "A group of dots will flash. Choose the number of dots you see."
            : "Look at the ten-frame flash and choose the matching numeral.");
          expectTruthAgreement(widget, context);
        }
      }
    }
  });

  it("keeps both repaired lessons schema-valid and pedagogy-clean", () => {
    for (const lesson of lessons) expect(lintLesson(lesson), lesson.id).toEqual([]);
  });
});
