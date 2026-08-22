import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type Step = { id: string; figure?: string; body?: string };
type Lesson = { steps: Step[] };
const lesson = JSON.parse(readFileSync(join(process.cwd(), "content", "courses", "statistical-inference", "lessons", "si-02-02.json"), "utf8")) as Lesson;

describe("S272 Statistical Inference figure truth", () => {
  it("uses the exact 10, 40, and 100 sampling-distribution sizes rendered by the figure", () => {
    const c2 = lesson.steps.find((step) => step.id === "c2");
    expect(c2).toMatchObject({ figure: "si-sampling-dist-sizes" });
    expect(c2?.body).toMatch(/n=10.*±31.*n=40.*±16.*n=100.*±10/i);
    expect(c2?.body).not.toMatch(/400 people to 1600/i);
  });
});
