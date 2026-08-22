import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "content", "courses", "derivatives-in-context", "lessons");
const CASES = [
  ["dc-01-02", "c1", /v and a have the SAME sign/i],
  ["dc-02-01", "c1", /time as the hidden variable/i],
  ["dc-02-02", "c1", /10-foot ladder[\s\S]*x² \+ y² = 100/i],
  ["dc-02-03", "c2", /Label lengths x and h, not 6 and 8/i],
] as const;

type Lesson = { steps: Array<{ id: string; kind: string; figure?: string; body?: string }> };
const lesson = (id: string) => JSON.parse(readFileSync(join(ROOT, `${id}.json`), "utf8")) as Lesson;

describe("S269 Derivatives in Context fixed-exemplar withholding", () => {
  it("does not place a different numeric or variable example beside a specific related-rates claim", () => {
    expect(CASES).toHaveLength(4);
    for (const [lessonId, stepId, claim] of CASES) {
      const step = lesson(lessonId).steps.find((candidate) => candidate.id === stepId);
      expect(step, `${lessonId}/${stepId}`).toMatchObject({ kind: "concept" });
      expect(step?.figure, `${lessonId}/${stepId} fixed figure`).toBeUndefined();
      expect(step?.body, `${lessonId}/${stepId} retained claim`).toMatch(claim);
    }
  });
});
