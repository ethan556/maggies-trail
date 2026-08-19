import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type Step = { id: string; figure?: string; body?: string; narration?: string };
type Lesson = { steps: Step[] };
const lesson = JSON.parse(readFileSync(join(process.cwd(), "content", "courses", "add-subtract-100", "lessons", "as100-03-04.json"), "utf8")) as Lesson;

describe("S272 Add/Subtract within 100 figure truth", () => {
  it("uses the exact one-ten trade shown by the base-ten diagram in visible and narrated copy", () => {
    const c2 = lesson.steps.find((step) => step.id === "c2");
    expect(c2).toMatchObject({ figure: "as100-break-ten" });
    expect(c2?.body).toMatch(/1 ten.*1 fewer ten/i);
    expect(c2?.narration).toMatch(/1 ten.*1 fewer ten/i);
    expect(c2?.body).not.toMatch(/6 tens/i);
  });
});
