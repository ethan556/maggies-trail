import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "content", "courses", "functions-g8", "lessons");
type Step = { id: string; kind: string; figure?: string; body?: string };
type Lesson = { steps: Step[] };
const lesson = (id: string) => JSON.parse(readFileSync(join(ROOT, `${id}.json`), "utf8")) as Lesson;

describe("S272 Functions G8 fixed-exemplar withholding", () => {
  it("keeps the slope reasoning but never shows unrelated 1-over-1 and 3-over-3 triangles", () => {
    const steps = lesson("fg-02-02").steps;
    const c1 = steps.find((step) => step.id === "c1");
    const c2 = steps.find((step) => step.id === "c2");
    expect(c1).toMatchObject({ kind: "concept" });
    expect(c1?.figure).toBeUndefined();
    expect(c1?.body).toMatch(/rise-to-run ratio always comes out equal/i);
    expect(c2).toMatchObject({ kind: "concept" });
    expect(c2?.figure).toBeUndefined();
    expect(c2?.body).toMatch(/\(0,0\) and \(4,8\).*slope is 2/i);
  });
});
