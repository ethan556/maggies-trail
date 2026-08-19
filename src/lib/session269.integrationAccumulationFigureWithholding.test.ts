import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "content", "courses", "integration-accumulation", "lessons");
const CASES = [
  ["in-04-03", "c2", /∫ e\^\(kx\) dx = e\^\(kx\)\/k \+ C/i],
  ["in-05-01", "c2", /x\(x² \+ 1\)³.*du\/2/i],
  ["in-05-02", "c2", /∫ cos\(3x\) dx.*sin\(3x\)\/3/i],
] as const;

type Lesson = { steps: Array<{ id: string; kind: string; figure?: string; body?: string }> };
const lesson = (id: string) => JSON.parse(readFileSync(join(ROOT, `${id}.json`), "utf8")) as Lesson;

describe("S269 Integration & Accumulation fixed-exemplar withholding", () => {
  it("keeps each substitution claim but never renders an unrelated 3-by-5 gear derivative", () => {
    for (const [lessonId, stepId, claim] of CASES) {
      const step = lesson(lessonId).steps.find((candidate) => candidate.id === stepId);
      expect(step).toMatchObject({ kind: "concept" });
      expect(step?.figure).toBeUndefined();
      expect(step?.body).toMatch(claim);
    }
  });
});
