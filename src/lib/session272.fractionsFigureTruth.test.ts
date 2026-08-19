import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "content", "courses", "fractions", "lessons");
type Step = { id: string; figure?: string; body?: string };
type Lesson = { steps: Step[] };
const lesson = JSON.parse(readFileSync(join(ROOT, "fr-03-03.json"), "utf8")) as Lesson;

describe("S272 Fractions figure truth", () => {
  it("keeps a matching 4/4 whole model and withholds it from the distinct 6/3 division example", () => {
    const c1 = lesson.steps.find((step) => step.id === "c1");
    const c2 = lesson.steps.find((step) => step.id === "c2");
    expect(c1).toMatchObject({ figure: "frac-whole-disguise" });
    expect(c1?.body).toMatch(/4\/4.*1 whole/i);
    expect(c2?.figure).toBeUndefined();
    expect(c2?.body).toMatch(/6\/3.*6 ÷ 3 = 2/i);
  });
});
