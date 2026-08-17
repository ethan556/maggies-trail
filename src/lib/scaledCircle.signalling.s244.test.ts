import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { describeWidgetState } from "./describeState";
import { canCheck, correctAnswerText, evaluate, learnerAnswerText } from "./evaluate";
import { WidgetSpec, scaledCircleChoiceCorrect, scaledCircleTarget, widgetIntegrityErrors, type TScaledCircleLab } from "./schema";

function authoredScaledCircles(): Array<{ lesson: string; step: string; spec: TScaledCircleLab }> {
  const coursesRoot = join(process.cwd(), "content", "courses");
  const lessonPaths = readdirSync(coursesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((course) => {
      const lessonsRoot = join(coursesRoot, course.name, "lessons");
      if (!existsSync(lessonsRoot)) return [];
      return readdirSync(lessonsRoot, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map((entry) => join(lessonsRoot, entry.name));
    })
    .sort();
  return lessonPaths.flatMap((path) => {
    const lesson = JSON.parse(readFileSync(path, "utf8")) as {
      id: string;
      steps: Array<{ id: string; widget?: unknown }>;
    };
    return lesson.steps.flatMap((step) => {
      if (!step.widget || (step.widget as { type?: unknown }).type !== "scaledCircleLab") return [];
      const parsed = WidgetSpec.parse(step.widget);
      if (parsed.type !== "scaledCircleLab") throw new Error(`${lesson.id}/${step.id}: wrong widget type`);
      return [{ lesson: lesson.id, step: step.id, spec: parsed }];
    });
  });
}

describe("S244 scaledCircleLab answer-signalling contract", () => {
  it("covers all seven authored uses and every target mode", () => {
    const uses = authoredScaledCircles();
    expect(uses.map(({ lesson, step }) => `${lesson}/${step}`)).toEqual([
      "cr-06-01/i1", "cr-06-01/i2", "cr-06-01/i3",
      "g7-04-03/i1", "g7-04-03/k1", "g7-04-03/i2", "g7-04-03/ch1"
    ]);
    expect(uses.map(({ spec }) => spec.ask).sort()).toEqual([
      "areaCoef", "areaCoef", "areaCoef", "areaCoef",
      "circumferenceCoef", "circumferenceCoef", "realRadius"
    ]);
  });

  it("keeps truth, grading, feedback, learner echo and reveal on one derived target", () => {
    for (const { lesson, step, spec } of authoredScaledCircles()) {
      expect(widgetIntegrityErrors(spec), `${lesson}/${step}`).toEqual([]);
      const target = scaledCircleTarget(spec);
      const correct = spec.choices.filter((choice) => scaledCircleChoiceCorrect(spec, choice));
      const wrong = spec.choices.find((choice) => !scaledCircleChoiceCorrect(spec, choice));
      expect(correct, `${lesson}/${step}`).toHaveLength(1);
      expect(correct[0]?.value).toBe(target);
      expect(wrong).toBeTruthy();
      expect(canCheck(spec, "")).toBe(false);
      expect(canCheck(spec, correct[0]!.id)).toBe(true);
      expect(evaluate(spec, correct[0]!.id)).toEqual({ correct: true, feedback: spec.successFeedback });
      expect(evaluate(spec, wrong!.id)).toEqual({ correct: false, feedback: wrong!.feedback });
      expect(correctAnswerText(spec)).toBe(correct[0]!.label);
      expect(learnerAnswerText(spec, wrong!.id)).toBe(wrong!.label);
    }
  });

  it("rejects a real-radius question that omits the plan givens", () => {
    const source = authoredScaledCircles().find(({ spec }) => spec.ask === "realRadius")!.spec;
    const invalid: TScaledCircleLab = { ...source, drawingRadius: undefined, scale: undefined };
    expect(widgetIntegrityErrors(invalid)).toContain("scaledCircleLab: realRadius questions require drawingRadius and scale givens");
  });

  it("speaks givens and the relationship without judging or revealing until info tone", () => {
    for (const { lesson, step, spec } of authoredScaledCircles()) {
      const correct = spec.choices.find((choice) => scaledCircleChoiceCorrect(spec, choice))!;
      const wrong = spec.choices.find((choice) => !scaledCircleChoiceCorrect(spec, choice))!;
      for (const tone of [undefined, "neutral", "error", "success"] as const) {
        const before = describeWidgetState(spec, wrong.id, tone)!;
        expect(before, `${lesson}/${step}/${tone ?? "undefined"}`).toContain("left for you to calculate");
        expect(before).not.toContain("The revealed");
        expect(before).not.toContain("matching the model");
        expect(before).toContain(`Selected ${wrong.label}.`);
        const unselected = describeWidgetState(spec, undefined, tone)!;
        expect(unselected).toContain("No circle claim selected.");
        expect(unselected).not.toContain("matching the model");
        const selectedCorrect = describeWidgetState(spec, correct.id, tone)!;
        expect(selectedCorrect).toContain(`Selected ${correct.label}.`);
        expect(selectedCorrect).not.toContain("matching the model");
        if (spec.drawingRadius !== undefined && spec.scale !== undefined) {
          expect(before).toContain(`drawing radius is ${spec.drawingRadius}`);
          expect(before).toContain(`scale multiplier is ${spec.scale}`);
          expect(before).not.toContain("given real radius");
        } else {
          expect(before).toContain(`given real radius is ${spec.realRadius}`);
        }
      }
      const revealed = describeWidgetState(spec, wrong.id, "info")!;
      expect(revealed).toContain(`is ${scaledCircleTarget(spec)}`);
      expect(revealed).toContain(`Selected ${wrong.label}, not matching the model.`);
    }
  });
});
