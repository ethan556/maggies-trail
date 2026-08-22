import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "content", "courses", "area-surface-volume", "lessons");
const CASES = [
  ["asv-05-02", "c1", /3 × 2 × 3\/2.*72\/8.*9/i],
  ["asv-05-02", "c2", /3½ = 7\/2.*28/i],
  ["asv-05-03", "c1", /aquarium.*planter.*moving van/i],
] as const;

type Lesson = { steps: Array<{ id: string; kind: string; figure?: string; body?: string }> };
const lesson = (id: string) => JSON.parse(readFileSync(join(ROOT, `${id}.json`), "utf8")) as Lesson;

describe("S269 Area & Surface Volume fixed-exemplar withholding", () => {
  it("retains each specific volume claim without a contradictory fixed diagram", () => {
    for (const [lessonId, stepId, claim] of CASES) {
      const step = lesson(lessonId).steps.find((candidate) => candidate.id === stepId);
      expect(step).toMatchObject({ kind: "concept" });
      expect(step?.figure, `${lessonId}/${stepId} fixed diagram`).toBeUndefined();
      expect(step?.body, `${lessonId}/${stepId} claim`).toMatch(claim);
    }
  });
});
