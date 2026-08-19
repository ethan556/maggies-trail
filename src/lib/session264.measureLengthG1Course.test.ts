import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";

type LengthItem = { id: string; label: string; length: number; startOffset?: number };
type Widget = {
  type: string;
  prompt?: string;
  items?: LengthItem[];
  answerId?: string;
  objectStart?: number;
  objectEnd?: number;
  allowedUnitSizes?: number[];
  targetUnitSize?: number;
  startUnitSize?: number;
  requiredPlacements?: number;
  successFeedback?: string;
  options?: { id: string; label: string; correct: boolean; feedback: string }[];
  answer?: number;
  fallbackFeedback?: string;
};
type Step = { id: string; figure?: string; widget?: Widget };
type Lesson = { id: string; steps: Step[] };
type CourseManifest = { chapters: { lessonIds: string[] }[] };
type I2Goal = { type: "lengthCompare" | "unitRuler"; answerId?: string; lengths?: number[]; start?: number; end?: number; unit?: number; placements?: number };

const coursePath = "content/courses/measure-length-g1/course.json";
const dir = "content/courses/measure-length-g1/lessons";
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
const lessons: Lesson[] = files.map((name) => JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")) as Lesson);

const exactFigures = new Map([
  ["g1m-01-01:c1", "ks-compare-length"],
  ["g1m-01-01:c2", "ks-same-end-fair"],
  ["g1m-01-02:c1", "smg1-three-counts"],
  ["g1m-01-02:c2", "smg1-middle-between"],
]);

const i2Goals = new Map<string, I2Goal>([
  ["g1m-01-01", { type: "lengthCompare", answerId: "top", lengths: [8, 6] }],
  ["g1m-01-02", { type: "lengthCompare", answerId: "bottom", lengths: [4, 7] }],
  ["g1m-01-03", { type: "lengthCompare", answerId: "top", lengths: [7, 5] }],
  ["g1m-01-04", { type: "lengthCompare", answerId: "top", lengths: [8, 3] }],
  ["g1m-02-01", { type: "unitRuler", start: 1, end: 6, unit: 1, placements: 5 }],
  ["g1m-02-02", { type: "unitRuler", start: 2, end: 9, unit: 1, placements: 7 }],
  ["g1m-02-03", { type: "unitRuler", start: 3, end: 9, unit: 1, placements: 6 }],
  ["g1m-03-01", { type: "unitRuler", start: 2, end: 8, unit: 1, placements: 6 }],
  ["g1m-03-02", { type: "unitRuler", start: 2, end: 10, unit: 2, placements: 4 }],
  ["g1m-03-03", { type: "unitRuler", start: 1, end: 7, unit: 2, placements: 3 }],
]);

const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
};

const normalisePrompt = (prompt: string) => prompt
  .toLowerCase()
  .replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#")
  .replace(/\s+/g, " ")
  .trim();

function step(lesson: Lesson, id: string): Step {
  const found = lesson.steps.find((item) => item.id === id);
  if (!found) throw new Error(`${lesson.id}:${id} is required`);
  return found;
}

function widgetFor(lesson: Lesson, id: string): Widget {
  const widget = step(lesson, id).widget;
  if (!widget) throw new Error(`${lesson.id}:${id} needs an evaluator`);
  return widget;
}

function number(value: number | undefined, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
  return value as number;
}

describe("S264 measure-length-g1 source implementation", () => {
  it("covers the manifest's ten lessons and preserves every stable step ID", () => {
    const manifest = JSON.parse(fs.readFileSync(coursePath, "utf8")) as CourseManifest;
    const manifestIds = manifest.chapters.flatMap((chapter) => chapter.lessonIds);
    expect(files).toHaveLength(10);
    expect(manifestIds).toHaveLength(10);
    expect(lessons.map((lesson) => lesson.id)).toEqual(manifestIds.slice().sort());
    for (const lesson of lessons) expect(lesson.steps.map((item) => item.id)).toEqual(["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"]);
  });

  it("uses four registered, exact concept figures and fail-closes the other sixteen unsafe placements", () => {
    let concepts = 0;
    let exact = 0;
    let withheld = 0;
    for (const lesson of lessons) for (const item of lesson.steps) {
      if (item.figure) expect(FIGURE_IDS.has(item.figure)).toBe(true);
      if (item.id !== "c1" && item.id !== "c2") continue;
      concepts += 1;
      const wanted = exactFigures.get(`${lesson.id}:${item.id}`);
      expect(item.figure).not.toBe("count-on-hops");
      if (wanted) {
        expect(item.figure).toBe(wanted);
        exact += 1;
      } else {
        expect(item.figure).toBeUndefined();
        withheld += 1;
      }
    }
    expect(concepts).toBe(20);
    expect(exact).toBe(4);
    expect(withheld).toBe(16);
  });

  it("turns every formerly repeated i2 evaluator into a distinct, source-true transfer while preserving evaluator families", () => {
    expect(i2Goals.size).toBe(10);
    for (const lesson of lessons) {
      const i1 = widgetFor(lesson, "i1");
      const i2 = widgetFor(lesson, "i2");
      const goal = i2Goals.get(lesson.id);
      if (!goal) throw new Error(`${lesson.id} missing i2 goal`);
      expect(i2.type).toBe(goal.type);
      expect(i2.prompt).not.toBe(i1.prompt);
      expect(stable(i2)).not.toBe(stable(i1));
      if (goal.type === "lengthCompare") {
        expect(i2.answerId).toBe(goal.answerId);
        expect(i2.items?.map((item) => item.length)).toEqual(goal.lengths);
        const answer = i2.items?.find((item) => item.id === i2.answerId);
        expect(answer?.length).toBe(Math.max(...(i2.items ?? []).map((item) => item.length)));
        expect(i2.items?.some((item) => (item.startOffset ?? 0) > 0)).toBe(true);
      } else {
        expect(i2.objectStart).toBe(goal.start);
        expect(i2.objectEnd).toBe(goal.end);
        expect(i2.targetUnitSize).toBe(goal.unit);
        expect(i2.requiredPlacements).toBe(goal.placements);
        const start = number(i2.objectStart, `${lesson.id}: start`);
        const end = number(i2.objectEnd, `${lesson.id}: end`);
        const unit = number(i2.targetUnitSize, `${lesson.id}: unit`);
        const placements = number(i2.requiredPlacements, `${lesson.id}: placements`);
        expect(end - start).toBe(unit * placements);
        expect(i2.allowedUnitSizes).toContain(unit);
        expect(i2.allowedUnitSizes).toContain(i2.startUnitSize);
        expect(i2.successFeedback?.trim().length).toBeGreaterThan(20);
      }
    }
  });

  it("keeps all authored choice and numeric evaluator contracts correct and learner-visible", () => {
    for (const lesson of lessons) for (const item of lesson.steps) {
      const widget = item.widget;
      if (!widget) continue;
      if (widget.type === "mcq") {
        expect(widget.options?.map((option) => option.id)).toEqual(["o0", "o1", "o2", "o3"]);
        expect(widget.options?.filter((option) => option.correct)).toHaveLength(1);
        for (const option of widget.options ?? []) expect(option.feedback.trim().length).toBeGreaterThan(20);
      }
      if (widget.type === "numeric") {
        expect(Number.isFinite(widget.answer)).toBe(true);
        expect(widget.successFeedback).toContain(String(widget.answer));
      }
    }
  });

  it("eliminates exact evaluator, exact prompt, and backlog-normalized prompt duplicates within every lesson", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.flatMap((item) => item.widget ? [item.widget] : []);
      const prompts = widgets.map((widget) => widget.prompt).filter((prompt): prompt is string => Boolean(prompt));
      expect(new Set(widgets.map(stable)).size).toBe(widgets.length);
      expect(new Set(prompts).size).toBe(prompts.length);
      expect(new Set(prompts.map(normalisePrompt)).size).toBe(prompts.length);
    }
  });
});