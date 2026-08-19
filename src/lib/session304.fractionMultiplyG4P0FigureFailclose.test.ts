import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; steps: RawStep[]; remedials?: Array<{ concept?: RawStep; check?: RawStep }> };
type Target = { workId: string; lessonId: string; surface: "step" | "remedial"; stepId: string; withheldFigure: string };

const lessonDirectory = join(process.cwd(), "content", "courses", "fraction-multiply-g4", "lessons");
const load = (lessonId: string) => JSON.parse(readFileSync(join(lessonDirectory, `${lessonId}.json`), "utf8")) as RawLesson;
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const targets: Target[] = [
  { workId: "VIS-g4x-01-01-c1-fa-repeated-add", lessonId: "g4x-01-01", surface: "step", stepId: "c1", withheldFigure: "fa-repeated-add" },
  { workId: "VIS-g4x-01-01-c2-fa-add-like", lessonId: "g4x-01-01", surface: "step", stepId: "c2", withheldFigure: "fa-add-like" },
  { workId: "VIS-g4x-01-02-c1-fa-repeated-add", lessonId: "g4x-01-02", surface: "step", stepId: "c1", withheldFigure: "fa-repeated-add" },
  { workId: "VIS-g4x-01-02-c2-fm-groups", lessonId: "g4x-01-02", surface: "step", stepId: "c2", withheldFigure: "fm-groups" },
  { workId: "VIS-g4x-01-02-rem-g4x-as-mult-c-fm-groups", lessonId: "g4x-01-02", surface: "remedial", stepId: "concept", withheldFigure: "fm-groups" },
  { workId: "VIS-g4x-01-03-c1-frac-unit-fourth", lessonId: "g4x-01-03", surface: "step", stepId: "c1", withheldFigure: "frac-unit-fourth" },
  { workId: "VIS-g4x-01-03-c2-fa-repeated-add", lessonId: "g4x-01-03", surface: "step", stepId: "c2", withheldFigure: "fa-repeated-add" },
  { workId: "VIS-g4x-01-04-rem-g4x-general-c-fa-repeated-add", lessonId: "g4x-01-04", surface: "remedial", stepId: "concept", withheldFigure: "fa-repeated-add" },
  { workId: "VIS-g4x-02-01-rem-g4x-line-model-c-fa-repeated-add", lessonId: "g4x-02-01", surface: "remedial", stepId: "concept", withheldFigure: "fa-repeated-add" },
  { workId: "VIS-g4x-02-02-c1-fm-groups", lessonId: "g4x-02-02", surface: "step", stepId: "c1", withheldFigure: "fm-groups" },
  { workId: "VIS-g4x-02-02-c2-fa-repeated-add", lessonId: "g4x-02-02", surface: "step", stepId: "c2", withheldFigure: "fa-repeated-add" },
  { workId: "VIS-g4x-02-03-c2-fa-improper-mixed", lessonId: "g4x-02-03", surface: "step", stepId: "c2", withheldFigure: "fa-improper-mixed" },
  { workId: "VIS-g4x-02-03-rem-g4x-past-one-c-fa-improper-mixed", lessonId: "g4x-02-03", surface: "remedial", stepId: "concept", withheldFigure: "fa-improper-mixed" },
  { workId: "VIS-g4x-02-04-c2-fa-mixed-improper", lessonId: "g4x-02-04", surface: "step", stepId: "c2", withheldFigure: "fa-mixed-improper" },
  { workId: "VIS-g4x-02-04-rem-g4x-mixed-answer-c-fa-improper-mixed", lessonId: "g4x-02-04", surface: "remedial", stepId: "concept", withheldFigure: "fa-improper-mixed" },
  { workId: "VIS-g4x-03-01-c1-fm-groups", lessonId: "g4x-03-01", surface: "step", stepId: "c1", withheldFigure: "fm-groups" },
  { workId: "VIS-g4x-03-01-c2-fa-repeated-add", lessonId: "g4x-03-01", surface: "step", stepId: "c2", withheldFigure: "fa-repeated-add" },
  { workId: "VIS-g4x-03-02-c1-fm-groups", lessonId: "g4x-03-02", surface: "step", stepId: "c1", withheldFigure: "fm-groups" },
  { workId: "VIS-g4x-03-03-c1-number-line-jumps", lessonId: "g4x-03-03", surface: "step", stepId: "c1", withheldFigure: "number-line-jumps" },
  { workId: "VIS-g4x-03-04-c2-fa-repeated-add", lessonId: "g4x-03-04", surface: "step", stepId: "c2", withheldFigure: "fa-repeated-add" },
];

const nonPermittedHashes: Record<string, string> = {
  "g4x-01-01": "9d95a31f04652b9391e774a29bd85e77d69bc03e83036a96a0bd3c82232ce8a6",
  "g4x-01-02": "a0904f5e7ca9147cf222e383ff54fc4da799e2350670b239e41e8835bb6c6a1f",
  "g4x-01-03": "f28c93968e3316de3257665fe823376c0d4dd7050a577b15e273d0980a4e72b9",
  "g4x-01-04": "4c293818c350527f50f468cabc767c5f266595ea6ded9930926395e78146b812",
  "g4x-02-01": "dcfc51a86dcea60a2d3f41bd24c95d18e957e66211c1d0ee4f32c717f1978eb4",
  "g4x-02-02": "c135ee74fdbfe7aed1e3644ac6694901cfc0499c0ffbb6c5c140778f2db328c8",
  "g4x-02-03": "c473e1db6459f012bc13f4e6c4fe5c6f211432222a6f6d49e8ed23d5afff550a",
  "g4x-02-04": "f824d1be57d460454d054d97e312274bbf0b38fc37ed52bf3eb0b04912498a5b",
  "g4x-03-01": "93eb156641d44b43590d114322d3b362d97fcd17f73a07f3142ac9d3d031d990",
  "g4x-03-02": "ac141cf5dbaefaaf91f8389271ffdef7eb181cd3b1cb0cf910858a6a8caa0a19",
  "g4x-03-03": "106229ad10c15736b820637110c3b4e6b9bcf542f67213d3894ba7767536d666",
  "g4x-03-04": "aa18bb548a718a5b1866cd8ffc0ced0650017192888b4832e625446801d01aa5",
};

function targetStep(lesson: RawLesson, target: Target) {
  const step = target.surface === "step" ? lesson.steps.find((candidate) => candidate.id === target.stepId) : lesson.remedials?.[0]?.concept;
  if (!step) throw new Error(`missing ${target.workId}`);
  return step;
}

function nonPermittedHash(lesson: RawLesson) {
  const copy = structuredClone(lesson);
  for (const target of targets.filter((candidate) => candidate.lessonId === copy.id)) {
    const step = targetStep(copy, target);
    delete step.figure;
    delete step.body;
    delete step.narration;
  }
  return sha256(JSON.stringify(copy));
}

describe("S304 fraction-multiply-g4 P0 exact figure fail-close", () => {
  it("fails closed at all 20 authoritative withheld placements", () => {
    expect(targets).toHaveLength(20);
    for (const target of targets) {
      const step = targetStep(load(target.lessonId), target);
      expect(step.figure, target.workId).toBeUndefined();
      expect(step.body, target.workId).not.toMatch(/The figure\b/i);
      expect(step.narration, target.workId).toBe(step.body);
    }
  });

  it("retains only registered non-flagged figures and all evaluator contracts", () => {
    const lessonIds = readdirSync(lessonDirectory).filter((name) => name.endsWith(".json")).sort();
    expect(lessonIds).toHaveLength(12);
    for (const file of lessonIds) {
      const raw = JSON.parse(readFileSync(join(lessonDirectory, file), "utf8")) as RawLesson;
      const lesson = Lesson.parse(raw);
      for (const step of [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter(Boolean))]) {
        if (step.figure) expect(FIGURE_IDS.has(step.figure), `${lesson.id}/${step.id}`).toBe(true);
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        expect(widgetIntegrityErrors(widget), `${lesson.id}/${step.id}`).toEqual([]);
        if (widget.type === "numeric") expect(evaluate(widget, widget.answer).correct).toBe(true);
        if (widget.type === "mcq") for (const option of widget.options) expect(evaluate(widget, option.id).correct).toBe(option.correct);
      }
    }
  });

  it("hash-locks every field outside the 20 declared fail-closed visual placements", () => {
    for (const [lessonId, expectedHash] of Object.entries(nonPermittedHashes)) {
      expect(nonPermittedHash(load(lessonId)), lessonId).toBe(expectedHash);
    }
  });
});
