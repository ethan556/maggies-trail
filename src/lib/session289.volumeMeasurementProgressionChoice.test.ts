import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { isFigureTextAligned } from "./figureTextAlignment";

type Option = { id: string; label: string; correct?: boolean; feedback?: string };
type Widget = {
  type?: string;
  prompt?: string;
  answer?: number;
  options?: Option[];
  commonErrors?: Array<{ value: number; feedback: string }>;
  fallbackFeedback?: string;
};
type Step = {
  id: string;
  kind: string;
  body?: string;
  figure?: string;
  hints?: string[];
  explanationVariants?: string[];
  widget?: Widget;
};
type Lesson = {
  id: string;
  courseId: string;
  steps: Step[];
  remedials?: Array<{ concept?: Step; check?: Step }>;
};

const courseDir = path.join(process.cwd(), "content", "courses", "volume-measurement", "lessons");
const sourceClosures = [
  "CHOICE-0281",
  "PROGRESSION-vm-03-02",
  "PROGRESSION-vm-04-02",
  "PROGRESSION-vm-05-01",
] as const;

async function lesson(id: string): Promise<Lesson> {
  return JSON.parse(await readFile(path.join(courseDir, `${id}.json`), "utf8")) as Lesson;
}

function step(current: Lesson, id: string): Step {
  const found = current.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${current.id}/${id} missing`);
  return found;
}

function numeric(current: Lesson, id: string, answer: number): Step {
  const found = step(current, id);
  expect(found.widget?.type, `${current.id}/${id}`).toBe("numeric");
  expect(found.widget?.answer, `${current.id}/${id}`).toBe(answer);
  return found;
}

function mcq(current: Lesson, id: string): Option[] {
  const found = step(current, id);
  expect(found.widget?.type, `${current.id}/${id}`).toBe("mcq");
  const options = found.widget?.options ?? [];
  expect(options.map((option) => option.id), `${current.id}/${id}`).toEqual(["a", "b", "c"]);
  expect(options.filter((option) => option.correct).map((option) => option.id), `${current.id}/${id}`).toEqual(["a"]);
  expect(options.every((option) => option.feedback?.trim()), `${current.id}/${id}`).toBe(true);
  return options;
}

describe("S289 Volume & Measurement progression and choice repair", () => {
  it("closes the four signed source causes with five distinct evaluator-safe jobs", async () => {
    expect(sourceClosures).toHaveLength(4);

    const countCubes = await lesson("vm-03-02");
    const layerDiagnosis = step(countCubes, "ch1");
    expect(layerDiagnosis.body).toBe("Diagnose a missing layer.");
    expect(layerDiagnosis.widget?.prompt).toBe("A builder says a 3 × 3 base stacked 2 layers high has volume 9. What volume should the builder report?");
    expect(layerDiagnosis.hints).toEqual(["A 3 × 3 base has 9 cubes.", "Ask how many equal bases are stacked.", "Two 9-cube layers make 18."]);
    expect(layerDiagnosis.explanationVariants).toEqual([
      "A 3 × 3 base has 9 cubes, but two equal layers give 9 × 2 = 18 cubic units.",
      "The claim stopped at one layer. Two 9-cube layers make 18 cubic units.",
    ]);
    mcq(countCubes, "ch1");

    const formula = await lesson("vm-04-02");
    const secondLayer = numeric(formula, "i2", 28);
    expect(secondLayer.body).toBe("Extend one base through a second layer.");
    expect(secondLayer.widget?.prompt).toBe("A 7-by-2 base holds 14 cubes. A second equal layer is stacked on it. How many cubic units fill the whole box?");
    expect(secondLayer.widget?.commonErrors?.map((error) => error.value)).toEqual([11, 14]);
    expect(secondLayer.widget?.fallbackFeedback).toBe("The 7-by-2 base holds 14 cubes; two equal layers hold 14 × 2 = 28 cubic units.");

    const stoppedProduct = numeric(formula, "k3", 30);
    expect(stoppedProduct.body).toBe("Correct a stopped product.");
    expect(stoppedProduct.widget?.prompt).toBe("A student gets 15 by multiplying 5 × 3 for a 2 × 5 × 3 box, then stops. What total volume should the student report?");
    expect(stoppedProduct.widget?.commonErrors?.map((error) => error.value)).toEqual([10, 15]);
    expect(stoppedProduct.widget?.fallbackFeedback).toBe("Finish the product: 2 × (5 × 3) = 2 × 15 = 30 cubic units.");

    const additive = await lesson("vm-05-01");
    const operationChoice = numeric(additive, "k3", 32);
    expect(operationChoice.body).toBe("Choose the operation after splitting.");
    expect(operationChoice.widget?.prompt).toBe("A student found 24 cubic units and 8 cubic units for two joined boxes, then wrote 24 × 8. What total volume should replace 24 × 8?");
    expect(operationChoice.widget?.commonErrors?.map((error) => error.value)).toEqual([24, 8, 192]);
    expect(operationChoice.widget?.fallbackFeedback).toBe("The pieces do not overlap, so add their volumes: 24 + 8 = 32 cubic units.");

    const splitting = await lesson("vm-05-02");
    const options = mcq(splitting, "i2");
    expect(options.map((option) => option.label)).toEqual([
      "He counted the empty 12-cube notch by treating the L as a full 5 × 2 × 4 box.",
      "He multiplied the two piece-volumes, 20 and 8, instead of adding their totals.",
      "He left out the 2 × 2 × 2 block above the slab when finding the total volume.",
    ]);
    const lengths = options.map((option) => option.label.length);
    expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(1);
    expect(options.every((option) => !(/\b(correct|because)\b/i.test(option.label) || /^right(?:\s|—|!|,|\.)/i.test(option.label)))).toBe(true);
  });

  it("retains all 12 course contracts and registered, text-aligned semantic figures", async () => {
    const files = (await readdir(courseDir)).filter((file) => file.endsWith(".json")).sort();
    expect(files).toHaveLength(12);
    for (const file of files) {
      const current = JSON.parse(await readFile(path.join(courseDir, file), "utf8")) as Lesson;
      expect(file).toBe(`${current.id}.json`);
      expect(current.courseId).toBe("volume-measurement");
      const allSteps = [
        ...current.steps,
        ...(current.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check]),
      ].filter(Boolean) as Step[];
      expect(allSteps.some((candidate) => candidate.widget)).toBe(true);
      for (const candidate of allSteps) {
        if (!candidate.figure) continue;
        expect(FIGURES[candidate.figure], `${current.id}/${candidate.id} must retain a registered figure`).toBeDefined();
        expect(isFigureTextAligned(candidate.figure, candidate.body ?? ""), `${current.id}/${candidate.id} figure text`).toBe(true);
      }
    }
  });
});
