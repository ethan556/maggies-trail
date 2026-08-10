import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { canCheck, correctAnswerText, evaluate, learnerAnswerText } from "./evaluate";
import {
  WidgetSpec,
  compositeAreaChoiceCorrect,
  compositeAreaPieceArea,
  compositeAreaTarget,
  widgetIntegrityErrors,
  type TCompositeAreaLab
} from "./schema";
import { variantForGenForm } from "./variants";

const lessonFiles = [
  join(process.cwd(), "content/courses/area-surface-volume/lessons/asv-01-02.json"),
  join(process.cwd(), "content/courses/area-surface-volume/lessons/asv-02-03.json")
];

function specs(): TCompositeAreaLab[] {
  const out: TCompositeAreaLab[] = [];
  for (const lessonFile of lessonFiles) {
    const lesson = JSON.parse(readFileSync(lessonFile, "utf8")) as {
      steps: Array<{ widget?: unknown }>;
      remedials?: Array<{ check: { widget: unknown } }>;
    };
    for (const step of lesson.steps) {
      if (!step.widget) continue;
      const parsed = WidgetSpec.parse(step.widget);
      if (parsed.type === "compositeAreaLab") out.push(parsed);
    }
    for (const remedial of lesson.remedials ?? []) {
      const parsed = WidgetSpec.parse(remedial.check.widget);
      if (parsed.type === "compositeAreaLab") out.push(parsed);
    }
  }
  return out;
}

function fixture(): TCompositeAreaLab {
  const parsed = WidgetSpec.parse({
    type: "compositeAreaLab",
    prompt: "Find the signed composite area.",
    scene: "piece-ledger",
    pieces: [
      { id: "room", label: "room", shape: "rectangle", operation: "add", width: 6, height: 4 },
      { id: "bay", label: "bay", shape: "triangle", operation: "add", base: 4, height: 3 },
      { id: "notch", label: "notch", shape: "rectangle", operation: "subtract", width: 2, height: 2 }
    ],
    target: { kind: "total" },
    choices: [
      { id: "correct", label: "26 square units", value: 26, feedback: "correct" },
      { id: "add-notch", label: "34 square units", value: 34, feedback: "The notch must be subtracted." },
      { id: "omit-notch", label: "30 square units", value: 30, feedback: "The notch still changes the total." }
    ],
    fallbackFeedback: "Use every piece with its sign.",
    successFeedback: "correct"
  });
  if (parsed.type !== "compositeAreaLab") throw new Error("bad fixture");
  return parsed;
}

describe("Session 136 composite area laboratory", () => {
  it("converts eleven main interactions and both remedial checks without touching the reasoning MCQ", () => {
    const converted = specs();
    expect(converted).toHaveLength(13);
    expect(converted.filter((spec) => spec.scene === "parallelogram-rearrange")).toHaveLength(2);
    expect(converted.filter((spec) => spec.scene === "trapezoid-diagonal")).toHaveLength(4);
    expect(converted.filter((spec) => spec.scene === "piece-ledger")).toHaveLength(7);
    for (const spec of converted) {
      expect(widgetIntegrityErrors(spec)).toEqual([]);
      expect(spec.choices.filter((choice) => compositeAreaChoiceCorrect(spec, choice))).toHaveLength(1);
      expect(spec.choices.filter((choice) => !compositeAreaChoiceCorrect(spec, choice)).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("derives every piece and signed total rather than trusting an authored answer", () => {
    const spec = fixture();
    expect(spec.pieces.map(compositeAreaPieceArea)).toEqual([24, 6, 4]);
    expect(compositeAreaTarget(spec)).toBe(26);
    expect(compositeAreaChoiceCorrect(spec, spec.choices[0])).toBe(true);
    const pieceTarget = WidgetSpec.parse({ ...spec, target: { kind: "piece", pieceId: "bay" }, choices: [
      { id: "correct", label: "6", value: 6, feedback: "correct" },
      { id: "whole", label: "26", value: 26, feedback: "whole" },
      { id: "double", label: "12", value: 12, feedback: "double" }
    ] });
    expect(pieceTarget.type).toBe("compositeAreaLab");
    if (pieceTarget.type === "compositeAreaLab") expect(compositeAreaTarget(pieceTarget)).toBe(6);
  });

  it("grades exact claims and routes every named misconception to its authored diagnosis", () => {
    const spec = fixture();
    expect(canCheck(spec, undefined)).toBe(false);
    expect(canCheck(spec, "add-notch")).toBe(true);
    expect(evaluate(spec, "correct")).toEqual({ correct: true, feedback: "correct" });
    expect(evaluate(spec, "add-notch")).toEqual({ correct: false, feedback: "The notch must be subtracted." });
    expect(evaluate(spec, "omit-notch")).toEqual({ correct: false, feedback: "The notch still changes the total." });
    expect(correctAnswerText(spec)).toBe("26 square units");
    expect(learnerAnswerText(spec, "add-notch")).toBe("34 square units");
  });

  it("rejects ambiguous choices, broken dimensions, missing targets, and dishonest scene structures", () => {
    const spec = fixture();
    const errors = [
      WidgetSpec.parse({ ...spec, choices: spec.choices.map((choice) => ({ ...choice, value: 26 })) }),
      WidgetSpec.parse({ ...spec, pieces: [{ ...spec.pieces[0], width: undefined }, ...spec.pieces.slice(1)] }),
      WidgetSpec.parse({ ...spec, target: { kind: "piece", pieceId: "missing" } }),
      WidgetSpec.parse({ ...spec, scene: "parallelogram-rearrange" }),
      WidgetSpec.parse({ ...spec, scene: "trapezoid-diagonal" })
    ].flatMap(widgetIntegrityErrors).join("\n");
    expect(errors).toContain("choice values must be unique");
    expect(errors).toContain("rectangle room needs width and height");
    expect(errors).toContain("target piece does not exist");
    expect(errors).toContain("requires one added parallelogram piece");
    expect(errors).toContain("requires two added triangle pieces");
  });

  it("preserves every converted wrong path as a reachable exact geometric claim", () => {
    for (const spec of specs()) {
      for (const choice of spec.choices.filter((candidate) => !compositeAreaChoiceCorrect(spec, candidate))) {
        expect(evaluate(spec, choice.id)).toEqual({ correct: false, feedback: choice.feedback });
      }
    }
  });

  it("keeps every declared variant form on the causal surface across bands and seeds", () => {
    const forms = ["default", "parallelogramMcq", "trapezoid", "fromTriangles", "threeRects", "fourPieces"];
    for (const band of ["support", "core", "stretch"] as const) {
      for (let seed = 0; seed < 96; seed++) {
        for (const form of forms) {
          const variant = variantForGenForm("composite-area-lab", form, `s136:${form}:${band}:${seed}`, band);
          expect(variant?.widget.type).toBe("compositeAreaLab");
          if (variant?.widget.type !== "compositeAreaLab") throw new Error("surface drift");
          const lab = variant.widget;
          expect(widgetIntegrityErrors(lab)).toEqual([]);
          const correct = lab.choices.filter((choice) => compositeAreaChoiceCorrect(lab, choice));
          expect(correct).toHaveLength(1);
          expect(variant.answer).toBe(correct[0]?.id);
        }
      }
    }
  });
});
