import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";

const dir = "content/courses/expressions-patterns-g5/lessons";
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
const lessons = files.map((name) => JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")));

const expectedFigures = new Map([
  ["g5e-01-01:c1", "dop-precedence"], ["g5e-01-01:c2", "dop-precedence"],
  ["g5e-01-04:c1", "dop-precedence"], ["g5e-01-04:c2", "dop-precedence"],
  ["g5e-02-01:c1", "dop-word-expr"], ["g5e-02-02:c1", "ee-read-aloud-tree"],
  ["g5e-03-02:c1", "cg-pair-terms"], ["g5e-03-02:c2", "cg-pair-terms"],
  ["g5e-03-03:c1", "cg-line-up"], ["g5e-03-03:c2", "cg-line-up"],
  ["g5e-03-04:c1", "cg-pair-terms"],
]);

function step(lessonId: string, stepId: string) {
  const lesson = lessons.find((item) => item.id === lessonId);
  return lesson?.steps.find((item: { id: string }) => item.id === stepId);
}

function assertMcq(widget: any) {
  expect(widget.type).toBe("mcq");
  expect(widget.options).toHaveLength(4);
  expect(new Set(widget.options.map((option: any) => option.id)).size).toBe(4);
  expect(new Set(widget.options.map((option: any) => option.label)).size).toBe(4);
  expect(widget.options.filter((option: any) => option.correct)).toHaveLength(1);
  for (const option of widget.options) expect(option.feedback.trim().length).toBeGreaterThan(20);
}

describe("S261 expressions-patterns-g5 source implementation", () => {
  it("covers all 12 lessons and all 24 queued concept placements", () => {
    expect(files).toHaveLength(12);
    const concepts = lessons.flatMap((lesson) => lesson.steps.filter((item: any) => item.id === "c1" || item.id === "c2"));
    expect(concepts).toHaveLength(24);
  });

  it("uses exactly 11 registered semantic figures and fail-closes the other 13 mismatches", () => {
    let exact = 0;
    let removed = 0;
    for (const lesson of lessons) for (const item of lesson.steps) {
      if (item.id !== "c1" && item.id !== "c2") continue;
      const wanted = expectedFigures.get(`${lesson.id}:${item.id}`);
      if (wanted) {
        expect(item.figure).toBe(wanted);
        expect(FIGURE_IDS.has(item.figure)).toBe(true);
        exact += 1;
      } else {
        expect(item.figure).toBeUndefined();
        removed += 1;
      }
      expect(item.figure).not.toBe("count-on-hops");
    }
    expect({ exact, removed }).toEqual({ exact: 11, removed: 13 });
  });

  it("replaces both normalized repeats with distinct decision and proof jobs", () => {
    const operation = step("g5e-01-04", "i2");
    expect(operation.body).toBe("Choose the valid operation plan before computing.");
    expect(operation.widget.prompt).toBe("Which plan evaluates 7 × 8 − 30 correctly?");
    assertMcq(operation.widget);

    const proof = step("g5e-03-05", "i2");
    expect(proof.body).toBe("Select the structural reason; do not build another term table.");
    expect(proof.widget.prompt).toContain("Which explanation proves");
    assertMcq(proof.widget);
  });

  it("repairs the queued k3 option parity without changing IDs or correctness", () => {
    const options = step("g5e-03-01", "k3").widget.options;
    expect(options.map((option: any) => option.id)).toEqual(["o0", "o1", "o2", "o3"]);
    expect(options.find((option: any) => option.correct)?.id).toBe("o0");
    const lengths = options.map((option: any) => option.label.length);
    expect(Math.max(...lengths) / Math.min(...lengths)).toBeLessThanOrEqual(1.35);
  });

  it("keeps every authored MCQ evaluator unambiguous", () => {
    for (const lesson of lessons) {
      for (const item of lesson.steps) if (item.widget?.type === "mcq") assertMcq(item.widget);
      for (const remedial of lesson.remedials ?? []) if (remedial.check?.widget?.type === "mcq") assertMcq(remedial.check.widget);
    }
  });
});
