import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lintLesson } from "./pedagogy";
import { Lesson } from "./schema";

const dir = join(process.cwd(), "content/courses/coordinate-geometry/lessons");
const lessons = Object.fromEntries(
  readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const lesson = JSON.parse(readFileSync(join(dir, file), "utf8")) as { id: string; steps: Array<Record<string, unknown>> };
      return [lesson.id, lesson];
    }),
);

function step(lessonId: string, stepId: string) {
  const found = lessons[lessonId]!.steps.find((candidate) => candidate.id === stepId);
  if (!found) throw new Error(`${lessonId}/${stepId} is missing`);
  return found;
}

describe("S279 Coordinate Geometry P1 source packet", () => {
  it("keeps a parallel, diagnostic trapezoid choice surface with stable contracts", () => {
    const widget = step("cg-03-02", "k2").widget as { type: string; options: Array<{ id: string; label: string; correct?: boolean; feedback: string }> };
    expect(widget.type).toBe("mcq");
    expect(widget.options.map((option) => option.id)).toEqual(["a", "b", "c"]);
    expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["a"]);
    const lengths = widget.options.map((option) => option.label.length);
    expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(12);
    expect(widget.options.find((option) => option.id === "b")?.feedback).toContain("at least one pair");
    expect(widget.options.find((option) => option.id === "c")?.feedback).toContain("Side lengths aren't the test");
  });

  it("turns the vertical distance repetition into evidence-based claim checking without changing its evaluator", () => {
    const check = step("cg-01-02", "k3") as { body: string; widget: Record<string, unknown> };
    expect(check.body).toBe("Audit a vertical distance claim.");
    expect(check.widget.type).toBe("pointSetReasoningLab");
    expect(check.widget.answerMode).toBe("numeric");
    expect(check.widget.task).toBe("axisDistance");
    expect(check.widget.prompt).toContain("classmate says");
    expect(check.widget.prompt).toContain("Use the evidence");
    expect(check.widget.successFeedback).toContain("claim checks out");
  });

  it("keeps every current course lesson schema- and pedagogy-clean", () => {
    for (const lesson of Object.values(lessons)) {
      expect(lintLesson(Lesson.parse(lesson)), lesson.id).toEqual([]);
    }
  });
});
