import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; body?: string; widget?: { prompt?: string } };
type RawLesson = { id: string; steps: RawStep[] };
type Contract = {
  rootCause: string;
  lessonId: string;
  stepId: string;
  body: string;
  prompt: string;
  answer?: number;
};

const lessonDirectory = join(process.cwd(), "content", "courses", "patterns-factors-g4", "lessons");
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const load = (lessonId: string) => JSON.parse(readFileSync(join(lessonDirectory, `${lessonId}.json`), "utf8")) as RawLesson;

const contracts: Contract[] = [
  {
    rootCause: "PROGRESSION-g4p-01-01", lessonId: "g4p-01-01", stepId: "k3", body: "Complete a factor-pair record.",
    prompt: "A factor-pair record for 40 includes 1 × 40, 2 × 20, 4 × 10, and 5 × ?. Which number completes the last pair?", answer: 8,
  },
  {
    rootCause: "PROGRESSION-g4p-01-02", lessonId: "g4p-01-02", stepId: "k3", body: "Use a factor-pair record.",
    prompt: "A factor-pair record for 60 begins 1 × 60, 2 × ?. Which number completes the pair?",
  },
  {
    rootCause: "PROGRESSION-g4p-01-03", lessonId: "g4p-01-03", stepId: "k2", body: "Check equal groups.",
    prompt: "Which total could be packed into equal groups of 7 with none left over?",
  },
  {
    rootCause: "PROGRESSION-g4p-01-04", lessonId: "g4p-01-04", stepId: "k3", body: "Check a packing claim.",
    prompt: "Which total can be packed into equal groups of 8 with none left over?",
  },
  {
    rootCause: "PROGRESSION-g4p-02-01", lessonId: "g4p-02-01", stepId: "k3", body: "Use a factor pair as evidence.",
    prompt: "A number has the factor pair 3 × 7 = 21. Is that number prime or composite?",
  },
  {
    rootCause: "PROGRESSION-g4p-02-01", lessonId: "g4p-02-01", stepId: "ch1", body: "Rule out a nontrivial factor pair.",
    prompt: "Only 1 × 11 builds 11. Is 11 prime or composite?",
  },
  {
    rootCause: "PROGRESSION-g4p-03-02", lessonId: "g4p-03-02", stepId: "i2", body: "Test a proposed constant-increase rule.",
    prompt: "A teammate says this shape pattern adds 4 squares each step. Build four steps to test it: 4, 8, 12, 16.",
  },
  {
    rootCause: "PROGRESSION-g4p-03-03", lessonId: "g4p-03-03", stepId: "i2", body: "Check a classmate's claim against the terms.",
    prompt: "A classmate says every visible feature must be written in the rule. For 'add 5' from 5: 5, 10, 15, 20, 25, tap the features the rule never states.",
  },
  {
    rootCause: "PROGRESSION-g4p-03-04", lessonId: "g4p-03-04", stepId: "i2", body: "Verify a doubling claim from its starting value.",
    prompt: "A teammate claims that doubling from 3 gives 3, 6, 12, 24. Build the four terms to test the claim.",
  },
];

const nonPermittedHashes: Record<string, string> = {
  "g4p-01-01": "557a3288cf7452458de82bec3d64ac0fec7f046047e1e01cef849c36e67e5ed4",
  "g4p-01-02": "fc309374cdb0fc36f54bac6b628b59803cbd2f35ac86a72b70e75a366fa64f17",
  "g4p-01-03": "29bce81b0ebf1118c818e3a7d5a77536a07a7f7dc597e85201d96173aca6eb35",
  "g4p-01-04": "4f27524a3ef52df7d470724e34d67d608a51df9ab71d9312cf84a20527edbba9",
  "g4p-02-01": "960b76b6ead87d72ec097e52a440297d288328bbf87f1a23997dc8d6c14eddaa",
  "g4p-03-02": "6b1524a3aef2d3f16e578d179b81f4b4d8ce01c8e13a5f1b1c4be9b0ca45764f",
  "g4p-03-03": "9d8c958a50155ec9fd3a202f9d67eeae978c472cac7da2a1dee333e775a070f0",
  "g4p-03-04": "f1cb2dcd24b20699d522465179b3086ce2532e9c23978f7b4cfedfe64d660914",
};

function selectedStep(lessonId: string, stepId: string) {
  const step = load(lessonId).steps.find((candidate) => candidate.id === stepId);
  if (!step?.widget) throw new Error(`missing ${lessonId}/${stepId}`);
  return step;
}

function nonPermittedHash(lesson: RawLesson) {
  const copy = structuredClone(lesson);
  for (const contract of contracts) if (contract.lessonId === copy.id) {
    const step = copy.steps.find((candidate) => candidate.id === contract.stepId)!;
    delete step.body;
    delete step.widget?.prompt;
  }
  return sha256(JSON.stringify(copy));
}

describe("S303 patterns-factors-g4 P1 progression repair", () => {
  it("covers all eight signed roots in the complete ten-lesson course", () => {
    expect(readdirSync(lessonDirectory).filter((file) => file.endsWith(".json"))).toHaveLength(10);
    expect(new Set(contracts.map((contract) => contract.rootCause)).size).toBe(8);
    expect(contracts).toHaveLength(9);
  });

  it("gives every flagged surface a distinct, explicit learner job", () => {
    for (const contract of contracts) {
      const step = selectedStep(contract.lessonId, contract.stepId);
      expect(step.body).toBe(contract.body);
      expect(step.widget?.prompt).toBe(contract.prompt);
      expect(step.body).not.toBe("");
      expect(step.body).not.toBe("One more, for the road.");
    }
  });

  it("retains all evaluator, answer, option, and interaction contracts", () => {
    for (const contract of contracts) {
      const step = selectedStep(contract.lessonId, contract.stepId);
      const widget = WidgetSpec.parse(step.widget);
      expect(widgetIntegrityErrors(widget), `${contract.lessonId}/${contract.stepId}`).toEqual([]);
      if (widget.type === "numeric") {
        expect(widget.answer).toBe(contract.answer);
        expect(evaluate(widget, widget.answer).correct).toBe(true);
      }
      if (widget.type === "mcq") {
        expect(widget.options.map((option) => option.id)).toEqual(widget.options.map((_, index) => `o${index}`));
        expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
        expect(widget.options.find((option) => option.correct)?.id).toBe("o0");
        expect(evaluate(widget, "o0").correct).toBe(true);
      }
      if (widget.type === "barBuilder") {
        expect(widget.target).toEqual(contract.lessonId === "g4p-03-02" ? [4, 8, 12, 16] : [3, 6, 12, 24]);
      }
      if (widget.type === "tapDiagram") expect(widget.hotspots.filter((hotspot) => hotspot.correct)).toHaveLength(2);
    }
  });

  it("hash-locks every field other than the nine declared bodies and prompts", () => {
    for (const [lessonId, expectedHash] of Object.entries(nonPermittedHashes)) {
      expect(nonPermittedHash(load(lessonId)), lessonId).toBe(expectedHash);
    }
  });
});
