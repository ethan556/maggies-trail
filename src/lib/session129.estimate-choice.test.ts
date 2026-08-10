import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { canCheck, correctAnswerText, evaluate, learnerAnswerText } from "./evaluate";
import { WidgetSpec, widgetIntegrityErrors, type TEstimateSlider } from "./schema";

const lessonPath = join(
  process.cwd(),
  "content/courses/measure-money-time/lessons/mmt-02-01.json"
);

function convertedSpecs(): TEstimateSlider[] {
  const lesson = JSON.parse(readFileSync(lessonPath, "utf8")) as {
    steps: Array<{ id: string; widget?: unknown }>;
    remedials: Array<{ conceptTag: string; check: { widget: unknown } }>;
  };
  const specs = ["i1", "i2", "i3"].map((id) => {
    const step = lesson.steps.find((candidate) => candidate.id === id);
    if (!step?.widget) throw new Error(`missing ${id}`);
    return WidgetSpec.parse(step.widget);
  });
  const remedial = lesson.remedials.find((route) => route.conceptTag === "mmt-estimate");
  if (!remedial) throw new Error("missing mmt-estimate remedial");
  specs.push(WidgetSpec.parse(remedial.check.widget));
  return specs.map((spec) => {
    if (spec.type !== "estimateSlider") throw new Error("expected estimateSlider");
    return spec;
  });
}

describe("Session 129 exact discrete estimate comparison", () => {
  it("parses all four converted experiences and proves the authored winner is uniquely nearest", () => {
    const specs = convertedSpecs();
    expect(specs).toHaveLength(4);
    for (const spec of specs) {
      expect(spec.choices.length).toBe(3);
      expect(widgetIntegrityErrors(spec)).toEqual([]);
      const correct = spec.choices.find((choice) => choice.correct)!;
      const gap = Math.abs(correct.value - spec.target);
      expect(
        spec.choices
          .filter((choice) => !choice.correct)
          .every((choice) => Math.abs(choice.value - spec.target) > gap)
      ).toBe(true);
    }
  });

  it("requires a real candidate selection before Check can activate", () => {
    const spec = convertedSpecs()[0];
    expect(canCheck(spec, undefined)).toBe(false);
    expect(canCheck(spec, 9)).toBe(false); // the stated actual is not an authored choice
    expect(canCheck(spec, 8)).toBe(true);
  });

  it("routes every authored choice to its exact preserved diagnosis", () => {
    for (const spec of convertedSpecs()) {
      for (const choice of spec.choices) {
        const result = evaluate(spec, choice.value);
        expect(result.correct).toBe(choice.correct);
        expect(result.feedback).toBe(choice.correct ? spec.successFeedback : choice.feedback);
      }
    }
  });

  it("shows the authored choice label on reveal for both learner and answer", () => {
    const spec = convertedSpecs()[0];
    expect(correctAnswerText(spec)).toBe("8 inches");
    expect(learnerAnswerText(spec, 20)).toBe("20 inches");
  });

  it("rejects tied, duplicate, out-of-range, and zero-min continuous authoring", () => {
    const base = convertedSpecs()[0];
    const tied = WidgetSpec.parse({
      ...base,
      choices: base.choices.map((choice) =>
        choice.value === 20 ? { ...choice, value: 10 } : choice
      )
    });
    expect(widgetIntegrityErrors(tied)).toContain(
      "estimateSlider choices: the correct candidate must be uniquely closest to the target"
    );

    const duplicate = WidgetSpec.parse({
      ...base,
      choices: base.choices.map((choice, index) =>
        index === 2 ? { ...choice, value: base.choices[1].value } : choice
      )
    });
    expect(widgetIntegrityErrors(duplicate)).toContain(
      "estimateSlider choices: candidate values must be unique"
    );

    const outOfRange = WidgetSpec.parse({
      ...base,
      max: 10
    });
    expect(widgetIntegrityErrors(outOfRange).some((message) => message.includes("lies outside"))).toBe(true);

    const continuous = WidgetSpec.parse({
      type: "estimateSlider",
      prompt: "Estimate",
      min: 0,
      max: 100,
      target: 10,
      lowFeedback: "too low",
      highFeedback: "too high",
      successFeedback: "good"
    });
    expect(widgetIntegrityErrors(continuous)).toContain(
      "estimateSlider: continuous mode needs 0 < min < target < max"
    );
  });
});
