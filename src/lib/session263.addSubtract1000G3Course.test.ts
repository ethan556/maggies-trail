import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";
import { columnCalcReachable } from "@/lib/schema";

type Widget = {
  type: string;
  prompt?: string;
  target?: number;
  missFeedback?: string;
  successFeedback?: string;
  fallbackFeedback?: string;
  a?: number;
  b?: number;
  op?: string;
  start?: number;
  hop?: number;
  hops?: number;
  min?: number;
  max?: number;
  direction?: string;
  commonResults?: { value: number }[];
};
type Step = { id: string; figure?: string; widget?: Widget };
type Lesson = { id: string; steps: Step[] };
type I2Goal = { type: string; target?: number; a?: number; b?: number; op?: string; start?: number; hop?: number; hops?: number; landing?: number };
type CourseManifest = { chapters: { lessonIds: string[] }[] };

const coursePath = "content/courses/add-subtract-1000-g3/course.json";
const dir = "content/courses/add-subtract-1000-g3/lessons";
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
const lessons: Lesson[] = files.map((name) => JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")) as Lesson);

const exactFigures = new Map([
  ["g3a-01-01:c1", "pv1000-decompose"], ["g3a-01-01:c2", "pv1000-decompose"],
  ["g3a-01-02:c1", "pv1000-trade-ones"], ["g3a-01-02:c2", "pv1000-trade-ones"],
  ["g3a-01-03:c1", "pv1000-decompose"], ["g3a-01-03:c2", "pv1000-decompose"],
  ["g3a-01-04:c1", "pv1000-trade-down"], ["g3a-01-04:c2", "pv1000-trade-down"],
  ["g3a-02-01:c1", "pv1000-cascade-down"], ["g3a-02-01:c2", "pv1000-cascade-down"],

  ["g3a-03-02:c1", "as100-choose-steps"], ["g3a-03-02:c2", "as100-choose-steps"],
]);

const i2Goals = new Map([
  ["g3a-01-01", { type: "baseTenCompose", target: 468 }],
  ["g3a-01-02", { type: "columnCalc", a: 286, b: 157, op: "add" }],
  ["g3a-01-03", { type: "baseTenCompose", target: 433 }],
  ["g3a-01-04", { type: "columnCalc", a: 631, b: 257, op: "subtract" }],
  ["g3a-02-01", { type: "columnCalc", a: 704, b: 358, op: "subtract" }],
  ["g3a-02-02", { type: "numberLineHop", start: 246, hop: 100, hops: 3, landing: 546 }],
  ["g3a-02-03", { type: "columnCalc", a: 397, b: 156, op: "add" }],
  ["g3a-03-01", { type: "columnCalc", a: 267, b: 358, op: "add" }],
  ["g3a-03-02", { type: "estimateSlider", target: 560 }],
  ["g3a-03-03", { type: "columnCalc", a: 500, b: 298, op: "subtract" }],
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
  expect(found, `${lesson.id}:${id}`).toBeTruthy();
  if (!found) throw new Error(`${lesson.id}:${id} is required`);
  return found;
}

function requiredNumber(value: number | undefined, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must be a finite number`);
  return value as number;
}

function columnOp(value: string | undefined): "add" | "subtract" | "multiply" {
  if (value !== "add" && value !== "subtract" && value !== "multiply") throw new Error(`unsupported column operation ${value}`);
  return value;
}

function answerFor(widget: Widget): number {
  const a = requiredNumber(widget.a, "column a");
  const b = requiredNumber(widget.b, "column b");
  return columnOp(widget.op) === "add" ? a + b : a - b;
}

describe("S263 add-subtract-1000-g3 source implementation", () => {
  it("covers the manifest's ten source-local lessons without changing their stable step IDs", () => {
    const manifest = JSON.parse(fs.readFileSync(coursePath, "utf8")) as CourseManifest;
    const manifestIds = manifest.chapters.flatMap((chapter) => chapter.lessonIds);
    expect(files).toHaveLength(10);
    expect(manifestIds).toHaveLength(10);
    expect(lessons.map((lesson) => lesson.id)).toEqual(manifestIds.slice().sort());
    for (const lesson of lessons) expect(lesson.steps.map((item) => item.id)).toEqual(["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"]);
  });

  it("keeps only 12 registered, truthful conceptual figures and fail-closes all eight unsafe placements", () => {
    let conceptualPlacements = 0;
    let exactPlacements = 0;
    let withheld = 0;
    for (const lesson of lessons) for (const item of lesson.steps) {
      if (item.figure) expect(FIGURE_IDS.has(item.figure)).toBe(true);
      if (item.id !== "c1" && item.id !== "c2") continue;
      conceptualPlacements += 1;
      const wanted = exactFigures.get(`${lesson.id}:${item.id}`);
      expect(item.figure).not.toBe("count-on-hops");
      if (wanted) {
        expect(item.figure).toBe(wanted);
        exactPlacements += 1;
      } else {
        expect(item.figure).toBeUndefined();
        withheld += 1;
      }
    }
    expect(conceptualPlacements).toBe(20);
    expect(exactPlacements).toBe(12);
    expect(withheld).toBe(8);
  });

  it("gives every formerly repeated i2 evaluator a distinct, internally true transfer task", () => {
    expect(i2Goals.size).toBe(10);
    for (const lesson of lessons) {
      const i1 = step(lesson, "i1").widget;
      const i2 = step(lesson, "i2").widget;
      const goal = i2Goals.get(lesson.id) as I2Goal | undefined;
      if (!i1 || !i2 || !goal) throw new Error(`${lesson.id} must have both evaluators and an i2 goal`);
      expect(i2.type).toBe((goal as I2Goal).type);
      expect(stable(i2)).not.toBe(stable(i1));
      expect(i2.prompt).not.toBe(i1.prompt);
      if (i2.type === "baseTenCompose") {
        expect(i2.target).toBe(goal.target);
        expect(i2.missFeedback).toContain(`match ${goal.target} exactly.`);
        expect(i2.successFeedback).toContain(String(goal.target));
      }
      if (i2.type === "columnCalc") {
        expect(i2.a).toBe(goal.a);
        expect(i2.b).toBe(goal.b);
        expect(i2.op).toBe(goal.op);
      }
      if (i2.type === "numberLineHop") {
        const start = requiredNumber(i2.start, `${lesson.id}:i2 start`);
        const hop = requiredNumber(i2.hop, `${lesson.id}:i2 hop`);
        const hops = requiredNumber(i2.hops, `${lesson.id}:i2 hops`);
        expect(start).toBe(goal.start);
        expect(hop).toBe(goal.hop);
        expect(hops).toBe(goal.hops);
        expect(start + hop * hops).toBe(goal.landing);
        expect(i2.successFeedback).toContain(String(goal.landing));
      }
      if (i2.type === "estimateSlider") {
        expect(i2.target).toBe(goal.target);
        expect(i2.successFeedback).toContain(String(goal.target));
      }
    }
  });

  it("keeps every column calculation, base-ten target, and number-line landing source-true", () => {
    let columns = 0;
    for (const lesson of lessons) for (const item of lesson.steps) {
      const widget = item.widget;
      if (widget?.type === "columnCalc") {
        columns += 1;
        const answer = answerFor(widget);
        const op = columnOp(widget.op);
        const a = requiredNumber(widget.a, `${lesson.id}:${item.id} a`);
        const b = requiredNumber(widget.b, `${lesson.id}:${item.id} b`);
        const symbol = op === "add" ? "+" : "−";
        expect(widget.successFeedback).toContain(`${a} ${symbol} ${b} = ${answer}`);
        expect(widget.fallbackFeedback).toContain(`${a} ${symbol} ${b} = ${answer}`);
        expect(widget.successFeedback).not.toMatch(/35\s*[×x]\s*4|=\s*140/);
        expect(widget.fallbackFeedback).not.toMatch(/35\s*[×x]\s*4|=\s*140/);
        for (const common of widget.commonResults ?? []) {
          expect(common.value).not.toBe(answer);
          expect(columnCalcReachable(op, a, b).has(common.value)).toBe(true);
        }
      }
      if (widget?.type === "baseTenCompose") expect(widget.missFeedback).toContain(`match ${widget.target} exactly.`);
      if (widget?.type === "numberLineHop") {
        const start = requiredNumber(widget.start, `${lesson.id}:${item.id} start`);
        const hop = requiredNumber(widget.hop, `${lesson.id}:${item.id} hop`);
        const hops = requiredNumber(widget.hops, `${lesson.id}:${item.id} hops`);
        const min = requiredNumber(widget.min, `${lesson.id}:${item.id} min`);
        const max = requiredNumber(widget.max, `${lesson.id}:${item.id} max`);
        const landing = start + (widget.direction === "back" ? -1 : 1) * hop * hops;
        expect(landing).toBeGreaterThanOrEqual(min);
        expect(landing).toBeLessThanOrEqual(max);
        expect(widget.successFeedback).toContain(String(landing));
      }
    }
    expect(columns).toBe(12);
  });

  it("eliminates exact, evaluator-signature, and normalised-prompt duplicates within every lesson", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps.filter((item) => item.widget).map((item) => item.widget as Widget);
      const prompts = widgets.map((widget) => widget.prompt).filter((prompt): prompt is string => Boolean(prompt));
      expect(new Set(widgets.map(stable)).size).toBe(widgets.length);
      expect(new Set(prompts).size).toBe(prompts.length);
      expect(new Set(prompts.map(normalisePrompt)).size).toBe(prompts.length);
    }
  });
});