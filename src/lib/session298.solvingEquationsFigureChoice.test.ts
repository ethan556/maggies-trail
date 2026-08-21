import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

type RawStep = { id: string; kind: string; body?: string; narration?: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[] };
const directory = path.join(process.cwd(), "content", "courses", "solving-equations", "lessons");
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const figureBody = "One move breaks the pattern: **multiplying or dividing by a negative flips the inequality**. Solve −3x < 9 by dividing by −3 — and the `<` becomes `>`: **x > −3**. The number line mirrors across zero, so the direction reverses.";
const figureNarration = "One move breaks the pattern: multiplying or dividing by a negative flips the inequality. Solve negative three x less than nine by dividing by negative three — and the less-than becomes greater-than: x greater than negative three. The number line mirrors across zero, so the direction reverses.";

async function load(id: string) { return JSON.parse(await readFile(path.join(directory, `${id}.json`), "utf8")) as RawLesson; }
function step(current: RawLesson, id: string) { const found = current.steps.find((entry) => entry.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }
function evaluator(widget: { prompt?: string; options: Array<{ label: string; [key: string]: unknown }>; [key: string]: unknown }) { const { prompt: _prompt, options, ...rest } = widget; return { ...rest, options: options.map(({ label: _label, ...option }) => option) }; }

describe("S298 solving-equations figure and choice truth", () => {
  it("fails closed on the source-controlled flip-arrow binding without changing its instructional or accessible explanation", async () => {
    const concept = step(await load("alg1-04-02"), "c1");
    expect(concept).toMatchObject({ kind: "concept", body: figureBody, narration: figureNarration });
    expect(concept.figure).toBeUndefined();
    expect(concept.widget).toBeUndefined();
  });

  it("makes the balance MCQ labels parallel while preserving evaluator, feedback, and correctness", async () => {
    const current = step(await load("alg1-01-02"), "k3");
    const rawWidget = current.widget as { prompt?: string; options: Array<{ label: string; feedback?: string; [key: string]: unknown }>; [key: string]: unknown };
    expect(hash(evaluator(rawWidget))).toBe("f05bbd793ee51cae36bbebefd448dedce6134b0e6939bddc332b178ffa8a219c");
    expect(hash(rawWidget.options.map((option) => [option.id, option.feedback ?? null]))).toBe("a2a69371e00bce5f13db659c7ab8c842631136bb355714925b15f13be4421329");
    const widget = WidgetSpec.parse(current.widget);
    expect(widget.type).toBe("mcq");
    if (widget.type !== "mcq") throw new Error("expected MCQ");
    expect(widget.options.map((option) => option.label)).toEqual(["Both sides must stay equal", "3x has to be negative", "One side can change alone"]);
    expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["a"]);
    for (const option of widget.options) expect(evaluate(widget, option.id).correct).toBe(option.correct);
    const correctLength = widget.options.find((option) => option.correct)?.label.length ?? 0;
    const longestWrong = Math.max(...widget.options.filter((option) => !option.correct).map((option) => option.label.length));
    expect(correctLength).toBeLessThanOrEqual(longestWrong * 1.25);
  });

  it("keeps all twelve course lessons schema-valid", async () => {
    const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort();
    expect(files).toHaveLength(12);
    for (const file of files) {
      const raw = JSON.parse(await readFile(path.join(directory, file), "utf8")) as RawLesson;
      expect(file).toBe(`${raw.id}.json`);
      expect(raw.courseId).toBe("solving-equations");
      Lesson.parse(raw);
    }
  });
});
