import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const COURSE = join(ROOT, "content", "courses", "transformations-measurement");
const LESSONS = join(COURSE, "lessons");
const WITHHOLDS = [
  ["tm-03-03", "c1", "352d6e3a07e0e0b2bca84ed906949b1854f219f24ddf725f9e5921cf94f81458"],
  ["tm-04-02", "c2", "7fc190a54c8648d2bb0fb2af12780fc6b92989ad3e010827e651a9cd80598d7b"],
  ["tm-05-02", "c2", "0fdcb9ab0e30397a70efc2b92222f628365b3f8c6d94e18f806a3e18ba0fc30f"],
  ["tm-05-03", "c2", "491e414873e4c2eaeac812a62fd76d9329c51923b5130ffcea3bb5829d511617"],
] as const;
const MCQS = [
  ["tm-01-01", "k2", "a", "d8f8302a00697170f07ca871150de2c8d2822b7fe1d11928add483f52fa19132", "dd485d866607b08cef85248ad6575fb66dc327e2a2b5f669e624b81675cf7571"],
  ["tm-02-01", "k1", "a", "3418b55aa1cb49ea07f5111bce6ea0f27a286db03446fd1e6a42fdb24831b07a", "2100bfaa9160bb69419a2e26711afe5a46e244bc0db776df308948c8125c76dc"],
  ["tm-05-03", "i2", "a", "b59278b9bb68870356f9c7a844d42a1527ac8d8465891412915786405b075099", "c3271fccf22e6a653cc255b045058cba8579151c0a79c7fc41244fc552c65106"],
] as const;
type Widget = { type?: string; prompt?: string; options?: Array<{ id: string; label: string; correct: boolean; feedback?: string }> };
type Step = { id: string; body?: string; figure?: string; widget?: Widget };
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
function step(lessonId: string, stepId: string): Step {
  const lesson = JSON.parse(readFileSync(join(LESSONS, `${lessonId}.json`), "utf8")) as { steps: Step[] };
  const source = lesson.steps.find((candidate) => candidate.id === stepId);
  if (!source) throw new Error(`missing ${lessonId}/${stepId}`);
  return source;
}

describe("S291 transformations-measurement figure truth and choice repair", () => {
  it("keeps the complete course manifest", () => {
    const course = JSON.parse(readFileSync(join(COURSE, "course.json"), "utf8")) as { chapters: Array<{ lessonIds: string[] }> };
    const declared = course.chapters.flatMap((chapter) => chapter.lessonIds).sort();
    const actual = readdirSync(LESSONS).filter((file) => file.endsWith(".json")).map((file) => file.replace(/\.json$/, "")).sort();
    expect(actual).toEqual(declared);
  });

  it("withholds fixed mismatches and retains the exact triangle-sum model", () => {
    for (const [lessonId, stepId, bodySeal] of WITHHOLDS) {
      const source = step(lessonId, stepId);
      expect(Object.hasOwn(source, "figure")).toBe(false);
      expect(hash(source.body)).toBe(bodySeal);
    }
    const triangle = step("tm-03-02", "c2");
    expect(triangle.figure).toBe("tm-right-triangle-90-35-55");
    expect(hash(triangle.body)).toBe("67cedceffcd1021f2592262b8a3144cb6369dfe3f479d3b831f89939e9791282");
  });

  it("preserves all three evaluators and feedback while closing choice-length leaks", () => {
    for (const [lessonId, stepId, correctId, evaluatorHash, labelsHash] of MCQS) {
      const widget = step(lessonId, stepId).widget;
      expect(widget?.type).toBe("mcq");
      const options = widget?.options ?? [];
      expect(options.map((option) => option.id).sort()).toEqual(["a", "b", "c", "d"]);
      expect(options.filter((option) => option.correct).map((option) => option.id)).toEqual([correctId]);
      expect(options.every((option) => typeof option.feedback === "string" && option.feedback.length > 0)).toBe(true);
      const correct = options.find((option) => option.correct);
      if (!correct) throw new Error(`missing correct ${lessonId}/${stepId}`);
      const longestWrong = Math.max(...options.filter((option) => !option.correct).map((option) => option.label.length));
      expect(correct.label.length > longestWrong * 1.5 && correct.label.length - longestWrong >= 12).toBe(false);
      const { prompt: _prompt, options: evaluatorOptions, ...evaluator } = widget ?? {};
      expect(hash({ ...evaluator, options: evaluatorOptions?.map(({ label: _label, ...option }) => option) })).toBe(evaluatorHash);
      expect(hash(options.map((option) => [option.id, option.label]))).toBe(labelsHash);
    }
  });
});
