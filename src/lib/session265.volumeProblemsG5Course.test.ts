import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";

type Option = { id: string; label: string; correct: boolean; feedback: string };
type Factors = { w: number; h: number };
type Widget = {
  type: string;
  prompt?: string;
  targetArea?: number;
  requireFactors?: Factors;
  target?: number | number[];
  categories?: string[];
  options?: Option[];
  answer?: number;
  successFeedback?: string;
};
type Step = { id: string; figure?: string; widget?: Widget };
type Lesson = { id: string; steps: Step[] };
type CourseManifest = { chapters: { lessonIds: string[] }[] };
type I2Goal = { type: "areaModel" | "barBuilder" | "estimateSlider"; target: number | number[]; factors?: [number, number] };

const coursePath = "content/courses/volume-problems-g5/course.json";
const dir = "content/courses/volume-problems-g5/lessons";
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
const lessons: Lesson[] = files.map((name) => JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")) as Lesson);

const exactFigures = new Map([
  ["g5v-01-01:c1", "vm-cube-unit"],
  ["g5v-01-01:c2", "vm-count-cubes"],
  ["g5v-01-02:c1", "vm-slice-layers"],
  ["g5v-02-01:c1", "vm-formula-lwh"],
  ["g5v-02-01:c2", "vm-count-cubes"],
  ["g5v-02-02:c1", "vm-base-height"],
  ["g5v-02-02:c2", "vm-base-height"],
  // S328 (closes S327-A4's visual ESCALATE): the notch-subtraction action had no figure
  // anywhere in the lesson. Bound to both concept steps (fresh 48-15=33 instance, distinct
  // from every worked pair already in this lesson, so it cannot preview i1's predict answer).
  ["g5v-03-01:c1", "vm-notch-block"],
  ["g5v-03-01:c2", "vm-notch-block"],
  ["g5v-03-02:c1", "vm-formula-lwh"],
  // S328 (closes S327-A4's visual ESCALATE): the equal-volumes claim was only ever asserted
  // in feedback prose. Bound to c2 only (whose sentence IS this claim) — deliberately NOT c1,
  // which precedes i1's own predict-before-reveal question and would give its answer away.
  ["g5v-03-03:c2", "vm-equal-volumes-compare"],
]);

const i2Goals = new Map<string, I2Goal>([
  ["g5v-01-01", { type: "areaModel", target: 18, factors: [3, 6] }],
  ["g5v-01-02", { type: "barBuilder", target: [15, 15, 15] }],
  ["g5v-02-01", { type: "areaModel", target: 21, factors: [3, 7] }],
  ["g5v-02-02", { type: "estimateSlider", target: 36 }],
  ["g5v-02-03", { type: "estimateSlider", target: 4 }],
  ["g5v-03-01", { type: "barBuilder", target: [7, 7, 7, 7] }],
  ["g5v-03-02", { type: "estimateSlider", target: 36 }],
  ["g5v-03-03", { type: "estimateSlider", target: 56 }],
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

describe("S265 volume-problems-g5 source implementation", () => {
  it("covers the manifest's eight lessons and preserves every stable step ID", () => {
    const manifest = JSON.parse(fs.readFileSync(coursePath, "utf8")) as CourseManifest;
    const manifestIds = manifest.chapters.flatMap((chapter) => chapter.lessonIds);
    expect(files).toHaveLength(8);
    expect(manifestIds).toHaveLength(8);
    expect(lessons.map((lesson) => lesson.id)).toEqual(manifestIds.slice().sort());
    for (const lesson of lessons) expect(lesson.steps.map((item) => item.id)).toEqual(["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"]);
  });

  it("uses only registered, adjacent-concept figures and fail-closes every unsafe fixed-number placement", () => {
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
    expect(concepts).toBe(16);
    expect(exact).toBe(11);
    expect(withheld).toBe(5);
  });

  it("turns every repeated i2 evaluator into a distinct, source-true transfer without changing its evaluator family", () => {
    expect(i2Goals.size).toBe(8);
    for (const lesson of lessons) {
      const i1 = widgetFor(lesson, "i1");
      const i2 = widgetFor(lesson, "i2");
      const goal = i2Goals.get(lesson.id);
      if (!goal) throw new Error(`${lesson.id}: missing i2 goal`);
      expect(i2.type).toBe(goal.type);
      expect(i2.type).toBe(i1.type);
      expect(i2.prompt).not.toBe(i1.prompt);
      expect(stable(i2)).not.toBe(stable(i1));
      if (goal.type === "areaModel") {
        expect(i2.targetArea).toBe(goal.target);
        expect(i2.requireFactors).toEqual({ w: goal.factors?.[0], h: goal.factors?.[1] });
      } else if (goal.type === "barBuilder") {
        expect(i2.target).toEqual(goal.target);
        expect(i2.categories).toHaveLength((goal.target as number[]).length);
      } else {
        expect(i2.target).toBe(goal.target);
      }
      expect(i2.successFeedback?.trim().length).toBeGreaterThan(20);
    }
  });

  it("preserves valid authored MCQ and numeric correctness contracts", () => {
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

  it("eliminates exact, exact-prompt, and normalized-prompt duplicates within every lesson", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.flatMap((item) => item.widget ? [item.widget] : []);
      const prompts = widgets.map((widget) => widget.prompt).filter((prompt): prompt is string => Boolean(prompt));
      expect(new Set(widgets.map(stable)).size).toBe(widgets.length);
      expect(new Set(prompts).size).toBe(prompts.length);
      expect(new Set(prompts.map(normalisePrompt)).size).toBe(prompts.length);
    }
  });
});
