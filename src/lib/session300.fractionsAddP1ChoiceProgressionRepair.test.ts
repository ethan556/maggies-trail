import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { exactNumberExplorationKeys, exactNumberTruth, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawOption = { id: string; label?: string; correct?: boolean };
type RawStep = { id: string; body?: string; widget?: { prompt?: string; options?: RawOption[] } };
type RawLesson = { id: string; steps: RawStep[] };

const lessonDirectory = join(process.cwd(), "content", "courses", "fractions-add", "lessons");
const load = (lessonId: string) => JSON.parse(readFileSync(join(lessonDirectory, `${lessonId}.json`), "utf8")) as RawLesson;
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const choiceContracts = [
  {
    lessonId: "fa-03-01",
    labels: [
      "Sam changed the denominator; the sum is 5/7.",
      "Sam should multiply the numerators, not add them.",
      "Sam should rewrite both fractions as tenths first.",
      "Sam should add each numerator to its denominator.",
    ],
  },
  {
    lessonId: "fa-03-02",
    labels: [
      "Priya changed the denominator; the difference is 5/10.",
      "Priya should make both denominators zero first.",
      "Priya should divide the numerators before subtracting.",
      "Priya should subtract 9 minus 10 before using tenths.",
    ],
  },
  {
    lessonId: "fa-03-03",
    labels: [
      "More than one whole; 11 is greater than 8.",
      "Less than one whole; 5 plus 6 makes 8.",
      "Exactly one whole; matching eighths make a whole.",
      "Fractions cannot name more than one whole amount.",
    ],
  },
] as const;

const progressionContracts = [
  {
    lessonId: "fa-01-01",
    stepId: "ch1",
    body: "Redraw the same amount.",
    prompt: "A shape has 5/6 shaded. Redraw that same amount using 18 equal pieces. How many pieces should be shaded?",
  },
  {
    lessonId: "fa-02-01",
    stepId: "k3",
    body: "Use the count model.",
    prompt: "On a 20-square grid, 11 squares are shaded. Is the shaded part more than, less than, or exactly 1/2?",
  },
  {
    lessonId: "fa-02-02",
    stepId: "k3",
    body: "Predict, then prove.",
    prompt: "First place each fraction relative to 1/2. Then decide which is bigger: 5/11 or 4/7.",
  },
  {
    lessonId: "fa-03-01",
    stepId: "k3",
    body: "Correct the unit-size error.",
    prompt: "A student writes 6/13 + 5/13 = 11/26. What denominator corrects the sum?",
  },
  {
    lessonId: "fa-04-02",
    stepId: "k3",
    body: "Verify a conversion.",
    prompt: "A student writes (3 × 4) + 1 for 3 1/4. What improper-fraction numerator does this make?",
  },
] as const;

const nonPermittedHashes: Record<string, string> = {
  "fa-01-01": "51f7667d969e554a674aba3d59b7fbcd969bb45ce183f54e09ce55969b9d23bd",
  "fa-02-01": "4d7727cbfd05fea67b55ac93dbc635dfc0f628d0fa48020c6dd04adf2a417774",
  "fa-02-02": "34953402403b30f9bbdc19cb02728cd27970b15e44330eec85dcbf63e821f34c",
  "fa-03-01": "ff31cc6255ba7ef733c2e54355effd8d6caaf02f02e9844295f42ea78e7d4a9c",
  "fa-03-02": "b49e597f28fe7a47dd1ae28274e9ff72e4ef0745a796967c79825e9f19d59eeb",
  "fa-03-03": "f5c67ab8a28bdadf6dbe2c01ef7619dfab180b5a05057ae21da80ad21ccfd070",
  "fa-04-02": "ee289c3c09654919acbf13d83dcee8f177b07856c6928ba5ab0c728acfb22d22",
};

function nonPermittedHash(lesson: RawLesson) {
  const copy = structuredClone(lesson);
  const erase = (stepId: string, fields: { bodyPrompt?: boolean; labels?: boolean }) => {
    const step = copy.steps.find((candidate) => candidate.id === stepId)!;
    if (fields.bodyPrompt) {
      delete step.body;
      delete step.widget?.prompt;
    }
    if (fields.labels) for (const option of step.widget?.options ?? []) delete option.label;
  };
  if (copy.id === "fa-01-01") erase("ch1", { bodyPrompt: true });
  if (copy.id === "fa-02-01" || copy.id === "fa-02-02" || copy.id === "fa-04-02") erase("k3", { bodyPrompt: true });
  if (copy.id === "fa-03-01") {
    erase("k2", { labels: true });
    erase("k3", { bodyPrompt: true });
  }
  if (copy.id === "fa-03-02" || copy.id === "fa-03-03") erase("k2", { labels: true });
  return sha256(JSON.stringify(copy));
}

describe("S300 fractions-add P1 choice and progression repair", () => {
  it("keeps the complete fourteen-lesson course available", () => {
    expect(readdirSync(lessonDirectory).filter((file) => file.endsWith(".json"))).toHaveLength(14);
  });

  it("makes all three MCQ surfaces concise and length-parallel without changing IDs or correctness", () => {
    for (const contract of choiceContracts) {
      const step = load(contract.lessonId).steps.find((candidate) => candidate.id === "k2")!;
      const widget = WidgetSpec.parse(step.widget);
      expect(widget.type).toBe("mcq");
      if (widget.type !== "mcq") continue;
      expect(widget.options.map((option) => option.id)).toEqual(["a", "b", "c", "d"]);
      expect(widget.options.map((option) => option.correct === true)).toEqual([true, false, false, false]);
      expect(widget.options.map((option) => option.label)).toEqual(contract.labels);
      const lengths = widget.options.map((option) => option.label.length);
      expect(Math.max(...lengths) / Math.min(...lengths), `${contract.lessonId}/k2`).toBeLessThanOrEqual(1.3);
      expect(evaluate(widget, "a").correct, `${contract.lessonId}/k2`).toBe(true);
    }
  });

  it("gives the five flagged checks distinct application, representation, prediction, or diagnosis jobs", () => {
    for (const contract of progressionContracts) {
      const step = load(contract.lessonId).steps.find((candidate) => candidate.id === contract.stepId)!;
      expect(step.body).toBe(contract.body);
      expect(step.widget?.prompt).toBe(contract.prompt);
      const widget = WidgetSpec.parse(step.widget);
      expect(widgetIntegrityErrors(widget), `${contract.lessonId}/${contract.stepId}`).toEqual([]);
      if (widget.type === "numeric") expect(evaluate(widget, widget.answer).correct).toBe(true);
      if (widget.type === "rationalCompare") expect(evaluate(widget, widget.answer).correct).toBe(true);
      if (widget.type === "exactNumberLab") {
        const truth = exactNumberTruth(widget);
        expect(evaluate(widget, { revealed: exactNumberExplorationKeys(widget), relation: truth.answerRelation }).correct).toBe(true);
      }
    }
  });

  it("locks every field outside the explicitly allowed labels, bodies, and prompts", () => {
    for (const [lessonId, expectedHash] of Object.entries(nonPermittedHashes)) {
      expect(nonPermittedHash(load(lessonId)), lessonId).toBe(expectedHash);
    }
  });
});
