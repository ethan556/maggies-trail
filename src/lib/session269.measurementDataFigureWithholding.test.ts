import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "content", "courses", "measurement-data", "lessons");
const CASES = [
  ["md-03-01", "c2", /half.*10.*5/i],
  ["md-03-02", "c1", /0, 2, 4, 6/i],
  ["md-03-03", "c2", /4 bars/i],
  ["md-04-02", "c1", /4 rows.*6.*24/i],
  ["md-04-02", "c2", /4 × 6 = 6 × 4 = 24/i],
] as const;

type Lesson = { steps: Array<{ id: string; kind: string; figure?: string; body?: string }> };
const lesson = (id: string) => JSON.parse(readFileSync(join(ROOT, `${id}.json`), "utf8")) as Lesson;

describe("S269 Measurement Data fixed-exemplar withholding", () => {
  it("never renders a different pictograph, scale, or array beside a named amount", () => {
    expect(CASES).toHaveLength(5);
    for (const [lessonId, stepId, claim] of CASES) {
      const step = lesson(lessonId).steps.find((candidate) => candidate.id === stepId);
      expect(step, `${lessonId}/${stepId}`).toMatchObject({ kind: "concept" });
      expect(step?.figure, `${lessonId}/${stepId} mismatched fixed figure`).toBeUndefined();
      expect(step?.body, `${lessonId}/${stepId} claim`).toMatch(claim);
    }
  });
});
