import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { canCheck, correctAnswerText, evaluate, learnerAnswerText } from "./evaluate";
import {
  WidgetSpec,
  scaledCircleChoiceCorrect,
  scaledCircleTarget,
  triangleClosureChoiceCorrect,
  triangleClosureForms,
  triangleClosureSpan,
  triangleClosureTargetAngle,
  widgetIntegrityErrors,
  type TScaledCircleLab,
  type TTriangleClosureLab
} from "./schema";
import { variantForGenForm } from "./variants";

const lessonPath = join(process.cwd(), "content/courses/geometry-g7/lessons/g7-04-03.json");
const lesson = JSON.parse(readFileSync(lessonPath, "utf8")) as {
  steps: Array<{ id: string; widget?: unknown; variant?: { gen: string; form?: string } }>;
};

function parsedById(id: string) {
  const step = lesson.steps.find((candidate) => candidate.id === id);
  if (!step?.widget) throw new Error(`missing widget ${id}`);
  return WidgetSpec.parse(step.widget);
}

const scaledIds = ["i1", "k1", "i2", "ch1"];

function scaledSpecs(): TScaledCircleLab[] {
  return scaledIds.map((id) => {
    const parsed = parsedById(id);
    if (parsed.type !== "scaledCircleLab") throw new Error(`${id}: wrong surface ${parsed.type}`);
    return parsed;
  });
}

function triangleSpec(): TTriangleClosureLab {
  const parsed = parsedById("k3");
  if (parsed.type !== "triangleClosureLab") throw new Error(`k3: wrong surface ${parsed.type}`);
  return parsed;
}

describe("Session 137 geometry-roundup causal surfaces", () => {
  it("converts the six graded claims onto three exact-fit causal surfaces", () => {
    expect(scaledSpecs()).toHaveLength(4);
    expect(parsedById("k2").type).toBe("angleMeasure");
    expect(triangleSpec().type).toBe("triangleClosureLab");
    expect(lesson.steps.find((step) => step.id === "k2")?.variant).toEqual({ gen: "angle-equation", form: "linearPairLab" });
    expect(lesson.steps.find((step) => step.id === "k3")?.variant).toEqual({ gen: "g7-triangle-inequality", form: "frameCheck" });
  });

  it("independently derives every scaled-circle target and preserves each authored wrong value", () => {
    const expected = {
      i1: { target: 6, wrong: [3, 12] },
      k1: { target: 12, wrong: [36, 6] },
      i2: { target: 36, wrong: [12, 6] },
      ch1: { target: 16, wrong: [4, 8] }
    } as const;
    for (const [index, spec] of scaledSpecs().entries()) {
      const id = scaledIds[index] as keyof typeof expected;
      expect(widgetIntegrityErrors(spec)).toEqual([]);
      expect(scaledCircleTarget(spec)).toBe(expected[id].target);
      const correct = spec.choices.filter((choice) => scaledCircleChoiceCorrect(spec, choice));
      expect(correct).toHaveLength(1);
      expect(correct[0]?.value).toBe(expected[id].target);
      expect(spec.choices.filter((choice) => !scaledCircleChoiceCorrect(spec, choice)).map((choice) => choice.value)).toEqual(expected[id].wrong);
      for (const choice of spec.choices) {
        expect(evaluate(spec, choice.id).correct).toBe(scaledCircleChoiceCorrect(spec, choice));
        if (!scaledCircleChoiceCorrect(spec, choice)) expect(evaluate(spec, choice.id).feedback).toBe(choice.feedback);
      }
    }
  });

  it("keeps the linear-pair equation, visual angle, and exact diagnoses on one truth", () => {
    const spec = parsedById("k2");
    if (spec.type !== "angleMeasure") throw new Error("wrong angle surface");
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    expect(spec.linearPair).toEqual({ multiplier: 2, total: 180 });
    expect((1 + spec.linearPair!.multiplier) * spec.targetAngle).toBe(spec.linearPair!.total);
    expect(evaluate(spec, { angle: 60 })).toEqual({ correct: true, feedback: spec.successFeedback });
    for (const wrong of spec.commonAngles ?? []) {
      expect(evaluate(spec, { angle: wrong.angle })).toEqual({ correct: false, feedback: wrong.feedback });
    }
  });

  it("derives strict triangle closure independently and keeps every authored reasoning path reachable", () => {
    const spec = triangleSpec();
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    expect(triangleClosureForms(spec.sides)).toBe(true);
    expect(7 + 8).toBeGreaterThan(12);
    const target = triangleClosureTargetAngle(spec.sides);
    expect(target).not.toBeNull();
    expect(triangleClosureSpan(7, 8, target!)).toBeCloseTo(12, 8);
    expect(canCheck(spec, { angle: 30, moves: 1, choice: "a" })).toBe(false);
    expect(canCheck(spec, { angle: 40, moves: 2, choice: "a" })).toBe(true);
    for (const choice of spec.choices) {
      const result = evaluate(spec, { angle: 40, moves: 2, choice: choice.id });
      expect(result.correct).toBe(triangleClosureChoiceCorrect(spec, choice));
      if (!triangleClosureChoiceCorrect(spec, choice)) expect(result.feedback).toBe(choice.feedback);
    }
    expect(correctAnswerText(spec)).toMatch(/Yes/);
    expect(learnerAnswerText(spec, { angle: 40, moves: 2, choice: "b" })).toMatch(/No/);
  });

  it("rejects false or ambiguous authoring before it reaches a learner", () => {
    const scaled = scaledSpecs()[0]!;
    const badScaled = WidgetSpec.parse({ ...scaled, choices: scaled.choices.map((choice) => ({ ...choice, value: 6 })) });
    expect(widgetIntegrityErrors(badScaled).join("\n")).toMatch(/exactly one correct|choice values must be unique/);

    const triangle = triangleSpec();
    const ambiguous = WidgetSpec.parse({ ...triangle, choices: triangle.choices.map((choice) => ({ ...choice, verdict: "forms" })) });
    expect(widgetIntegrityErrors(ambiguous).join("\n")).toContain("expected exactly one correct authored claim");

    const flat = WidgetSpec.parse({ ...triangle, sides: [3, 4, 7] });
    if (flat.type !== "triangleClosureLab") throw new Error("wrong flat fixture");
    expect(triangleClosureForms(flat.sides)).toBe(false);
    expect(triangleClosureTargetAngle(flat.sides)).toBeNull();
  });

  it("keeps both seeded variant families on their causal surfaces across bands and seeds", () => {
    let valid = 0, invalid = 0;
    for (const band of ["support", "core", "stretch"] as const) {
      for (let seed = 0; seed < 128; seed++) {
        const angle = variantForGenForm("angle-equation", "linearPairLab", `s137:angle:${band}:${seed}`, band);
        expect(angle?.widget.type).toBe("angleMeasure");
        if (angle?.widget.type !== "angleMeasure") throw new Error("angle surface drift");
        expect(angle.widget.linearPair).toBeTruthy();
        expect(widgetIntegrityErrors(angle.widget)).toEqual([]);

        const frame = variantForGenForm("g7-triangle-inequality", "frameCheck", `s137:frame:${band}:${seed}`, band);
        expect(frame?.widget.type).toBe("triangleClosureLab");
        if (frame?.widget.type !== "triangleClosureLab") throw new Error("frame surface drift");
        const closure = frame.widget;
        expect(widgetIntegrityErrors(closure)).toEqual([]);
        triangleClosureForms(closure.sides) ? valid++ : invalid++;
        const correct = closure.choices.filter((choice) => triangleClosureChoiceCorrect(closure, choice));
        expect(correct).toHaveLength(1);
        expect(frame.answer).toEqual(expect.objectContaining({ choice: correct[0]?.id }));
      }
    }
    expect(valid).toBeGreaterThan(0);
    expect(invalid).toBeGreaterThan(0);
  });
});
