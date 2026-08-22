import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

type RawStep = { id: string; kind: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[] };
const course = path.join(process.cwd(), "content", "courses", "polar-parametric");
const directory = path.join(course, "lessons");
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const choices = [
  ["pp-02-03", "k3", "bd8b842d18a14d8a1f9ba567b213f888cf9bd4f2c18c498e3a8b21e17c2ea556", ["Convex limaçon; a/b = 2.5 means no dimple.", "Dimpled limaçon; this needs 1 < a/b < 2.", "Cardioid; this needs a/b to equal 1 exactly."]],
  ["pp-03-03", "k2", "135fb39d3a05d29384471a10f6a4cda524d4ee41c402fd3112776c08c2b7536f", ["2, the real cube root of 8 when k = 0.", "8, the original value rather than a cube root.", "4, whose cube is 64 rather than 8."]],
  ["pp-04-01", "k3", "1bfcddc9883a26f0eb0a4b0a532c211ce028251b35acda198f0f4091c0e86214", ["Two t-values share x but give different y-values.", "Squaring t makes x nonnegative, not multivalued.", "It passes the vertical-line test as one y for each x."]],
  ["pp-05-03", "k1", "1a3ed6c3966985a333a88597306d5eac0bffc481bc5c465810b404793fd4b417", ["Downward-opening parabola; its x² coefficient is negative.", "Straight line; it would have no x² coefficient.", "Upward-opening parabola; its x² coefficient is positive."]],
] as const;

async function load(id: string) { return JSON.parse(await readFile(path.join(directory, `${id}.json`), "utf8")) as RawLesson; }
function step(current: RawLesson, id: string) { const found = current.steps.find((entry) => entry.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }
function maskedContract(widget: unknown) { const copy = JSON.parse(JSON.stringify(widget)) as { options: Array<{ label: string }> }; for (const option of copy.options) option.label = "__LABEL__"; return copy; }

describe("S315 Polar & Parametric choice parity", () => {
  it("preserves every non-label MCQ contract and answer evaluation", async () => { for (const [lessonId, stepId, contractHash, labels] of choices) { const current = step(await load(lessonId), stepId); expect(current.kind).toBe("check"); const rawWidget = current.widget as { type?: string; options?: Array<{ id: string; label: string; correct: boolean }> }; expect(rawWidget.type).toBe("mcq"); if (!rawWidget.options) throw new Error(`${lessonId}/${stepId}: missing options`); expect(hash(maskedContract(rawWidget))).toBe(contractHash); const widget = WidgetSpec.parse(rawWidget); expect(widget.type).toBe("mcq"); if (widget.type !== "mcq") throw new Error(`${lessonId}/${stepId}: expected MCQ`); expect(widget.options.map((option) => option.id)).toEqual(["o1", "o2", "o3"]); expect(widget.options.map((option) => option.label)).toEqual(labels); expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["o1"]); for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct); const lengths = widget.options.map((option) => option.label.length); expect(Math.max(...lengths) - Math.min(...lengths), `${lessonId}/${stepId}`).toBeLessThanOrEqual(12); } });
  it("keeps the complete course manifest and valid lesson schemas", async () => { const manifest = JSON.parse(await readFile(path.join(course, "course.json"), "utf8")) as { chapters: Array<{ lessonIds: string[] }> }; const declared = manifest.chapters.flatMap((chapter) => chapter.lessonIds).sort(); const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort(); expect(files.map((file) => file.replace(/\.json$/, ""))).toEqual(declared); for (const file of files) { const raw = JSON.parse(await readFile(path.join(directory, file), "utf8")) as RawLesson; expect(file).toBe(`${raw.id}.json`); expect(raw.courseId).toBe("polar-parametric"); Lesson.parse(raw); } });
});
