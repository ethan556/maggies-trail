import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "content", "courses");
const CASES = [
  ["conic-sections", "co-05-03", "steps.3", /Halley's Comet has e ≈ 0\.97/i],
  ["counting-120", "c120-05-01", "steps.0", /After 45 comes 46/i],
  ["curve-analysis", "ca-03-02", "remedials.0.concept", /compute the secant slope/i],
  ["data-distributions", "dd-04-01", "steps.3", /2, 6, 6, 6, 10/i],
  ["derivative-rules", "dr-04-01", "remedials.0.concept", /differentiate the outer function/i],
] as const;

type Concept = { kind?: string; figure?: string; body?: string };
const atPath = (value: unknown, path: string): Concept | undefined => path.split(".").reduce<unknown>((node, part) => {
  if (node === null || typeof node !== "object") return undefined;
  return /^\d+$/.test(part) && Array.isArray(node)
    ? node[Number(part)]
    : (node as Record<string, unknown>)[part];
}, value) as Concept | undefined;

describe("S272 small P0 fixed-exemplar withholding", () => {
  it("retains every stated idea while never rendering a mismatched fixed example", () => {
    for (const [course, lessonId, path, claim] of CASES) {
      const lesson = JSON.parse(readFileSync(join(ROOT, course, "lessons", `${lessonId}.json`), "utf8"));
      const node = atPath(lesson, path);
      if (!node) throw new Error("expected concept");
      expect(node).toMatchObject({ kind: "concept" });
      expect(node.figure).toBeUndefined();
      expect(node.body).toMatch(claim);
    }
  });
});
