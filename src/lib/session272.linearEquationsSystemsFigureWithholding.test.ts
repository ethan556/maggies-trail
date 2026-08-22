import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "content", "courses", "linear-equations-systems", "lessons");
type Step = { id: string; kind: string; figure?: string; body?: string };
type Lesson = { steps: Step[] };
const lesson = (id: string) => JSON.parse(readFileSync(join(ROOT, `${id}.json`), "utf8")) as Lesson;

describe("S272 Linear Equations & Systems fixed-exemplar withholding", () => {
  it("keeps each back-substitution lesson but never shows x = 2, y = 3 for a different system", () => {
    const first = lesson("les-04-02").steps.find((step) => step.id === "c1");
    const second = lesson("les-04-03").steps.find((step) => step.id === "c2");
    expect(first).toMatchObject({ kind: "concept" });
    expect(first?.figure).toBeUndefined();
    expect(first?.body).toMatch(/solution is a POINT/i);
    expect(second).toMatchObject({ kind: "concept" });
    expect(second?.figure).toBeUndefined();
    expect(second?.body).toMatch(/x = 2 in y = 4x.*y = 8/i);
  });
});
