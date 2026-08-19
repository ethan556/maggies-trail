import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type Step = { id: string; figure?: string; body?: string; narration?: string };
type Lesson = { steps: Step[] };
const lesson = JSON.parse(readFileSync(join(process.cwd(), "content", "courses", "add-subtract-20", "lessons", "as-04-01.json"), "utf8")) as Lesson;

describe("S272 Add/Subtract within 20 figure truth", () => {
  it("names the exact six-seven-thirteen fact family in visible and narrated copy", () => {
    const c2 = lesson.steps.find((step) => step.id === "c2");
    expect(c2).toMatchObject({ figure: "as-fact-family" });
    expect(c2?.body).toMatch(/6 \+ 7 = 13.*13 − 6 = 7/i);
    expect(c2?.narration).toMatch(/six plus seven.*thirteen minus seven/i);
  });
});
