import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { evaluate } from "./evaluate";
import { isFigureTextAligned } from "./figureTextAlignment";
import { Lesson, WidgetSpec } from "./schema";

type RawStep = { id: string; kind: string; body?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[] };
const directory = path.join(process.cwd(), "content", "courses", "trig-functions", "lessons");
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const choices = [
  ["tf-03-01", "i3", "e4b38c05713d5f0d845d2c9e43fad22b6a993403bcf55a29af07454e2c48cf84", "20165b07a932aa1062a6991f07dce5a458e88d59587dbe47096e4e08103c01f5", ["Undefined: zero denominator", "1: equal x- and y-values", "0: zero y-coordinate", "90: the input angle"]],
  ["tf-04-01", "i2", "12e6eb5faf35d8fa87752a5c51e6fd9c564076e7f9e9f449d25a0665bedae11b", "a7feb5178f2c6bdfe6e0ad3d4dbb6516ea0be44ca8f2a0cce9caa724c8a85d59", ["sin 0 = 0; cos 0 = 1", "sin 0 = cos 0", "cos 0 = 0; sin 0 = 1", "sin 0 = −1; cos 0 = 1"]],
  ["tf-05-03", "k2", "88d08d84ebb1448c22fe79ed557a8940e92d824333837ac3007e728f04aa27d5", "4faf5e765b16e6c1dd58a04b694d443513ad9bbcfae19167d589cdab9f9fa5e5", ["+0.8 and −0.8 both square to 0.64", "Rounding creates a second value", "The identity only works in QI", "Sine has a second value"]],
] as const;

async function load(id: string) { return JSON.parse(await readFile(path.join(directory, `${id}.json`), "utf8")) as RawLesson; }
function step(current: RawLesson, id: string) { const found = current.steps.find((entry) => entry.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }
function evaluator(widget: { prompt?: string; options: Array<{ label: string; [key: string]: unknown }>; [key: string]: unknown }) { const { prompt: _prompt, options, ...rest } = widget; return { ...rest, options: options.map(({ label: _label, ...option }) => option) }; }

describe("S297 trig-functions figure and choice truth", () => {
  it("binds SOH-CAH-TOA to the exact 3-4-5 triangle rendered", async () => {
    const concept = step(await load("tf-01-01"), "c1");
    expect(concept).toMatchObject({ kind: "concept", figure: "sohcahtoa-triangle" });
    expect(concept.body).toContain("sin θ = 3/5, cos θ = 4/5, tan θ = 3/4");
    expect(FIGURE_IDS.has(concept.figure ?? "")).toBe(true);
    expect(isFigureTextAligned(concept.figure ?? "", concept.body ?? "")).toBe(true);
  });

  it("uses parallel MCQ labels while preserving each evaluator, feedback surface, and correct answer", async () => {
    for (const [lessonId, stepId, evaluatorHash, feedbackHash, labels] of choices) {
      const current = step(await load(lessonId), stepId);
      const widget = WidgetSpec.parse(current.widget);
      expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
      if (widget.type !== "mcq") throw new Error("expected MCQ");
      expect(hash(evaluator(widget))).toBe(evaluatorHash);
      expect(hash(widget.options.map((option) => [option.id, option.feedback ?? null]))).toBe(feedbackHash);
      expect(widget.options.map((option) => option.label)).toEqual(labels);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["o1"]);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct);
      const correctLength = widget.options.find((option) => option.correct)?.label.length ?? 0;
      const longestWrong = Math.max(...widget.options.filter((option) => !option.correct).map((option) => option.label.length));
      expect(correctLength).toBeLessThanOrEqual(longestWrong * 1.25);
    }
  });

  it("keeps all fifteen lesson identities and schemas valid", async () => {
    const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort();
    expect(files).toHaveLength(15);
    for (const file of files) {
      const raw = JSON.parse(await readFile(path.join(directory, file), "utf8")) as RawLesson;
      expect(file).toBe(`${raw.id}.json`);
      expect(raw.courseId).toBe("trig-functions");
      Lesson.parse(raw);
    }
  });
});
