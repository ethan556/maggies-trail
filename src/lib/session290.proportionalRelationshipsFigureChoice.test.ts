import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const COURSE = join(ROOT, "content", "courses", "proportional-relationships");
const LESSONS = join(COURSE, "lessons");
const WITHHOLDS = [
  ["pr-01-02", "c1", "0f4cf2e381c028fda29417853791debb2034b70357ab9b6a858186e2b1369862"],
  ["pr-02-02", "c3", "b876fa8801a5f0295611d71df4f15808b3d12c0db33d366656feac857fb09e1f"],
  ["pr-03b-01", "c1", "f2d8eb9b9cfc940c4754cb020230e84fa07bab75434c112036a02830b2aeb77a"],
  ["pr-04-01", "c3", "8485888b2b7ef72d871462f6339afe0bd75f8a754915e8f101eefc08ba56a3be"],
  ["pr-04-02", "c1", "b359e0f427881e9fe4af7d3bea462e6f5d6a4d55b93b8577d4eef7caeed676e4"],
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

describe("S290 proportional-relationships figure truth and choice repair", () => {
  it("keeps the complete course manifest", () => {
    const course = JSON.parse(readFileSync(join(COURSE, "course.json"), "utf8")) as { chapters: Array<{ lessonIds: string[] }> };
    const declared = course.chapters.flatMap((chapter) => chapter.lessonIds).sort();
    const actual = readdirSync(LESSONS).filter((file) => file.endsWith(".json")).map((file) => file.replace(/\.json$/, "")).sort();
    expect(actual).toEqual(declared);
  });

  it("withholds all mismatched fixed exemplars and retains only the exact markdown model", () => {
    for (const [lessonId, stepId, bodySeal] of WITHHOLDS) {
      const source = step(lessonId, stepId);
      expect(Object.hasOwn(source, "figure")).toBe(false);
      expect(hash(source.body)).toBe(bodySeal);
    }
    const markdown = step("pr-04-02", "c2");
    expect(markdown.figure).toBe("pr-markdown");
    expect(hash(markdown.body)).toBe("5ab34fff9213e03749a6823da212d41027b14bbd114a870a3b019dddc65a3c3a");
  });

  it("preserves the service-fee evaluator while removing the answer-length cue", () => {
    const widget = step("pr-04b-02", "k3").widget;
    expect(widget?.type).toBe("mcq");
    const options = widget?.options ?? [];
    expect(options.map((option) => option.id).sort()).toEqual(["a", "b", "c", "d"]);
    expect(options.filter((option) => option.correct).map((option) => option.id)).toEqual(["a"]);
    expect(options.every((option) => typeof option.feedback === "string" && option.feedback.length > 0)).toBe(true);
    const correct = options.find((option) => option.correct);
    if (!correct) throw new Error("missing correct option");
    const longestWrong = Math.max(...options.filter((option) => !option.correct).map((option) => option.label.length));
    expect(correct.label.length > longestWrong * 1.5 && correct.label.length - longestWrong >= 12).toBe(false);
    const { prompt: _prompt, options: evaluatorOptions, ...evaluator } = widget ?? {};
    expect(hash({ ...evaluator, options: evaluatorOptions?.map(({ label: _label, ...option }) => option) })).toBe("f2ea79921113fbd54d2ccf96919fbec2f12599319bf595afc8f314890859ec89");
    expect(hash(options.map((option) => [option.id, option.label]))).toBe("98af056e4397d72dbf5b2f20dbfacbf0936d6759adaefe2aeda40f33f88666b7");
  });
});
