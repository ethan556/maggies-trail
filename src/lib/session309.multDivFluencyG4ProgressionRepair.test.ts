import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = {
  id: string;
  kind: string;
  body: string;
  widget?: unknown;
  cml?: { actionGoal?: string };
};

type Repair = {
  lessonId: string;
  answer: number;
  actionGoal: string;
};

const repairs: Repair[] = [
  { lessonId: "g4m-01-01", answer: 1200, actionGoal: "Use place value to scale a basic multiplication fact and check the product." },
  { lessonId: "g4m-01-02", answer: 96, actionGoal: "Calculate and combine both partial products in a place-value split." },
  { lessonId: "g4m-02-01", answer: 2254, actionGoal: "Use a nearby friendly factor, then compensate to calculate an exact product." },
  { lessonId: "g4m-02-02", answer: 282, actionGoal: "Use place-value partial products to check an exact multiplication claim." },
  { lessonId: "g4m-02-05", answer: 24, actionGoal: "Use a large equal-group chunk and subtract it from the dividend before finishing division." },
  { lessonId: "g4m-03-04", answer: 300, actionGoal: "Divide compatible numbers to make and explain a quotient estimate." },
  { lessonId: "g4m-03-05", answer: 654, actionGoal: "Check a division claim by multiplying the proposed quotient by the divisor." },
];

const lesson = (id: string) =>
  JSON.parse(
    readFileSync(
      join(process.cwd(), "content", "courses", "mult-div-fluency-g4", "lessons", `${id}.json`),
      "utf8",
    ),
  ) as { id: string; steps: RawStep[] };

describe("S309 mult-div-fluency-g4 safe progression repair", () => {
  it("gives seven repeated i2 steps distinct evaluator-true learner jobs", () => {
    for (const repair of repairs) {
      const raw = lesson(repair.lessonId);
      expect(Lesson.safeParse(raw).success, repair.lessonId).toBe(true);
      const i1 = raw.steps.find((step) => step.id === "i1")!;
      const i2 = raw.steps.find((step) => step.id === "i2")!;
      const firstWidget = WidgetSpec.parse(i1.widget);
      const secondWidget = WidgetSpec.parse(i2.widget);

      expect(i2.kind).toBe("interactive");
      expect(i2.body.toLowerCase()).toContain("claim");
      expect(secondWidget.type).toBe("numeric");
      if (secondWidget.type !== "numeric") continue;
      expect(secondWidget.answer).toBe(repair.answer);
      expect(evaluate(secondWidget, repair.answer).correct).toBe(true);
      expect(widgetIntegrityErrors(secondWidget)).toEqual([]);
      expect(secondWidget.prompt.toLowerCase()).toContain("claim");
      expect(secondWidget.type).not.toBe(firstWidget.type);
      expect(i2.cml?.actionGoal).toBe(repair.actionGoal);
    }
  });

  it("retains the blocked partial-quotients lesson without pretending its visual is fixed", () => {
    const raw = lesson("g4m-02-04");
    const i2 = raw.steps.find((step) => step.id === "i2")!;
    const widget = WidgetSpec.parse(i2.widget);
    expect(widget.type).toBe("estimateSlider");
    expect(i2.body).toBe("Test the classmate's size claim with the model, then calculate exactly.");
    expect(i2.cml?.actionGoal).toContain("partial quotients");
  });
});
