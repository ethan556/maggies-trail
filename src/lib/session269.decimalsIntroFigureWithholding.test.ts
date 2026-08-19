import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "content", "courses", "decimals-intro-g4", "lessons");
const WITHHELD_FIXED_EXEMPLARS = [
  ["dg4-01-01", "c2"], ["dg4-01-02", "c2"], ["dg4-01-06", "c2"],
  ["dg4-02-01", "c2"], ["dg4-02-02", "c2"], ["dg4-02-03", "c2"],
  ["dg4-02-04", "c1"], ["dg4-02-04", "c2"], ["dg4-02-05", "c2"],
  ["dg4-03-01", "c1"], ["dg4-03-01", "c2"], ["dg4-03-02", "c2"],
  ["dg4-03-03", "c1"], ["dg4-03-04", "c2"], ["dg4-03-05", "c2"],
  ["dg4-03-06", "c2"],
] as const;

type Lesson = { id: string; steps: Array<{ id: string; kind: string; figure?: string; body?: string; narration?: string }> };
const lesson = (id: string) => JSON.parse(readFileSync(join(ROOT, `${id}.json`), "utf8")) as Lesson;

describe("S269 Decimal Intro fixed-exemplar withholding", () => {
  it("withholds every mismatched fixed hundredths grid while retaining the exact learner claim", () => {
    expect(WITHHELD_FIXED_EXEMPLARS).toHaveLength(16);
    for (const [lessonId, stepId] of WITHHELD_FIXED_EXEMPLARS) {
      const step = lesson(lessonId).steps.find((candidate) => candidate.id === stepId);
      expect(step, `${lessonId}/${stepId}`).toMatchObject({ kind: "concept" });
      expect(step?.figure, `${lessonId}/${stepId} fixed grid`).toBeUndefined();
      expect(step?.body?.trim().length, `${lessonId}/${stepId} learner claim`).toBeGreaterThan(20);
      expect(step?.narration, `${lessonId}/${stepId} narration parity`).toBe(step?.body);
    }
  });

  it("retains only generic hundredths-grid bindings and preserves all 18 lesson sources", () => {
    const ids = ["01-01", "01-02", "01-03", "01-04", "01-05", "01-06", "02-01", "02-02", "02-03", "02-04", "02-05", "02-06", "03-01", "03-02", "03-03", "03-04", "03-05", "03-06"]
      .map((suffix) => `dg4-${suffix}`);
    let gridBindings = 0;
    for (const id of ids) {
      const current = lesson(id);
      expect(current.id).toBe(id);
      gridBindings += current.steps.filter((step) => step.figure === "dpv-hundredths-grid").length;
    }
    expect(gridBindings).toBe(20);
  });
});
