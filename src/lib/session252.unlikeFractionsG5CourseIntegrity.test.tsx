import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { evaluate } from "./evaluate";
import { isFigureTextAligned } from "./figureTextAlignment";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };
const dir = join(process.cwd(), "content", "courses", "unlike-fractions-g5", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const allSteps = (lesson: RawLesson) => [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter((step): step is RawStep => Boolean(step)))];
const normalized = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();

const expectedFigures: Record<string, [string, string]> = {
  "g5u-01-01": ["fm-common-denom", "fm-add-unlike"],
  "g5u-01-02": ["fm-common-denom", "fa-multiplier"],
  "g5u-01-03": ["ns-lcm", "ns-lcm"],
  "g5u-01-04": ["fm-common-denom", "fm-common-denom"],
  "g5u-01-05": ["fm-add-unlike", "fa-add-like"],
  "g5u-02-01": ["fm-subtract-unlike", "fm-subtract-unlike"],
  "g5u-02-02": ["fa-add-like", "fa-improper-mixed"],
  "g5u-02-03": ["fa-subtract-like", "fa-mixed-improper"],
  "g5u-02-04": ["fa-mixed-improper", "fa-mixed-improper"],
  "g5u-02-05": ["fa-simplify", "fa-simplify"],
  "g5u-03-01": ["fa-benchmark-half", "fa-compare-benchmark"],
  "g5u-03-02": ["fm-add-unlike", "fm-add-unlike"],
  "g5u-03-03": ["fm-add-unlike", "fm-subtract-unlike"],
  "g5u-03-04": ["ns-lcm", "ns-lcm"],
};

function evaluatorSignature(widget: ReturnType<typeof WidgetSpec.parse>) {
  const raw = widget as unknown as Record<string, unknown>;
  const signature: Record<string, unknown> = { type: widget.type };
  for (const key of ["answer", "tolerance", "targetNum", "targetDen", "target", "acceptFactor", "min", "max"]) if (key in raw) signature[key] = raw[key];
  if (widget.type === "mcq") signature.options = widget.options.map(({ id, correct }) => ({ id, correct }));
  return signature;
}

describe("S252 unlike-fractions-g5 whole-course repair", () => {
  it("keeps all 14 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(14);
    for (const raw of lessons) {
      const lesson = Lesson.parse(raw);
      expect(lesson.courseId).toBe("unlike-fractions-g5");
      expect(lintLesson(lesson), raw.id).toEqual([]);
      for (const step of allSteps(raw)) if (step.widget) expect(widgetIntegrityErrors(WidgetSpec.parse(step.widget)), `${raw.id}/${step.id}`).toEqual([]);
    }
  });

  it("renders all 28 synchronized semantic concept placements accessibly", () => {
    let count = 0;
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((step) => step.kind === "concept");
      expect(concepts.map((step) => step.figure), lesson.id).toEqual(expectedFigures[lesson.id]);
      for (const concept of concepts) {
        expect(concept.figure, `${lesson.id}/${concept.id}`).not.toBe("count-on-hops");
        expect(isFigureTextAligned(concept.figure!, concept.body ?? ""), `${lesson.id}/${concept.id}/${concept.figure}`).toBe(true);
        const Figure = FIGURES[concept.figure!];
        expect(Figure, `${lesson.id}/${concept.id}/${concept.figure}`).toBeDefined();
        const markup = renderToStaticMarkup(Figure());
        expect(markup).toContain("<title>");
        expect(markup).toContain('role="img"');
        expect(concept.body).toBe(concept.narration);
        count += 1;
      }
    }
    expect(count).toBe(28);
  });

  it("gives every lesson a misconception-repair interaction and eliminates progression collisions", () => {
    for (const lesson of lessons) {
      const lessonWidgets = lesson.steps.filter((step) => step.widget).map((step) => WidgetSpec.parse(step.widget));
      const prompts = lessonWidgets.map((widget) => widget.prompt);
      expect(new Set(prompts).size, `${lesson.id}: exact`).toBe(prompts.length);
      expect(new Set(prompts.map(normalized)).size, `${lesson.id}: number-normalized`).toBe(prompts.length);
      expect(new Set(lessonWidgets.map((widget) => JSON.stringify(widget))).size, `${lesson.id}: payload`).toBe(lessonWidgets.length);

      const i1 = lesson.steps.find((step) => step.id === "i1")!;
      const i2 = lesson.steps.find((step) => step.id === "i2")!;
      expect(i2.body, lesson.id).toBe("Repair the misconception.");
      expect(WidgetSpec.parse(i2.widget).type, lesson.id).toBe(WidgetSpec.parse(i1.widget).type);
      expect(WidgetSpec.parse(i2.widget).prompt, lesson.id).toMatch(/learner/i);
    }
  });

  it("preserves all evaluator IDs and correctness while repairing learner-visible truth", () => {
    const evaluatorRows: unknown[] = [];
    for (const lesson of lessons) for (const step of allSteps(lesson)) {
      if (!step.widget) continue;
      const widget = WidgetSpec.parse(step.widget);
      evaluatorRows.push([lesson.id, step.id, evaluatorSignature(widget)]);
      if (widget.type === "fractionBar") expect(evaluate(widget, { n: widget.targetNum, d: widget.targetDen }).correct, `${lesson.id}/${step.id}`).toBe(true);
      if (widget.type === "numeric") expect(evaluate(widget, widget.answer).correct, `${lesson.id}/${step.id}`).toBe(true);
      if (widget.type === "estimateSlider") expect(evaluate(widget, widget.target).correct, `${lesson.id}/${step.id}`).toBe(true);
      if (widget.type === "mcq") {
        expect(widget.options.filter((option) => option.correct), `${lesson.id}/${step.id}`).toHaveLength(1);
        for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lesson.id}/${step.id}/${option.id}`).toBe(option.correct);
      }
    }
    expect(createHash("sha256").update(JSON.stringify(evaluatorRows)).digest("hex")).toBe("8b35d2905bffc3f060f3653722e4c20f56be47d60233364d3d8a936ba13e4b45");

    const mixed = lessons.find((lesson) => lesson.id === "g5u-02-03")!;
    expect(mixed.steps.find((step) => step.id === "i1")?.widget).not.toEqual(expect.objectContaining({ prompt: expect.stringMatching(/build nineteen eighths/i) }));
    expect(mixed.steps.find((step) => step.id === "i2")?.widget).not.toEqual(expect.objectContaining({ prompt: expect.stringMatching(/build nineteen eighths/i) }));
    const reasonable = lessons.find((lesson) => lesson.id === "g5u-03-02")!;
    for (const id of ["i1", "i2"]) {
      const widget = WidgetSpec.parse(reasonable.steps.find((step) => step.id === id)!.widget);
      expect(widget.type).toBe("estimateSlider");
      if (widget.type === "estimateSlider") expect(widget.highFeedback).toMatch(/1\/3 is not enough to reach one whole/i);
    }
  });

  it("closes all four cue-bearing choice surfaces with parallel options", () => {
    const targets = [["g5u-01-05", "k2"], ["g5u-02-01", "k3"], ["g5u-03-02", "k1"], ["g5u-03-02", "k3"]] as const;
    for (const [lessonId, stepId] of targets) {
      const lesson = lessons.find((entry) => entry.id === lessonId)!;
      const widget = WidgetSpec.parse(lesson.steps.find((step) => step.id === stepId)!.widget);
      expect(widget.type).toBe("mcq");
      if (widget.type !== "mcq") continue;
      expect(widget.options).toHaveLength(4);
      expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
      expect(widget.options.map((option) => option.label).join(" ")).not.toMatch(/yes because/i);
      const lengths = widget.options.map((option) => option.label.length);
      expect(Math.max(...lengths) - Math.min(...lengths), `${lessonId}/${stepId}`).toBeLessThanOrEqual(22);
    }
  });
});
