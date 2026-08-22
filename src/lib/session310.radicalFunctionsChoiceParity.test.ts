import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";
type RawStep = { id: string; kind: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[] };
const course = path.join(process.cwd(), "content", "courses", "radical-functions");
const directory = path.join(course, "lessons");
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const choices = [
  ["re-04-01", "k3", "check", "d869f5e0b051904e3a9da08c4685f272bc864d2e15aaef8ee0493e33ee8c59ff", ["No solutions; a square root has no negative output.", "One solution, x = 3, after squaring both sides.", "One solution, x = −5, from a negative radicand.", "Two solutions, x = 3 and x = −5, after squaring."]],
  ["re-04-03", "i2", "interactive", "11bf21c87702fccf9420a2faec1ec3204259709673901966784434c23709e384", ["Cubing is one-to-one, so unequal values stay unequal.", "Cube roots accept all real inputs without exclusions.", "Cubing behaves like an even power and erases a sign.", "Cubing can create roots, so every answer needs checking."]],
  ["re-04-03", "k3", "check", "469f03eba6922e0975d7dd9f7d1b82ee7e6159a9d5f389584cacf2777910b317", ["Raise to the fourth power, giving x + 2 = 16.", "Raise to the second power, as for a square root.", "Raise to the one-fourth power, repeating the root.", "Take the fourth root again, keeping the radical form."]],
  ["re-05-02", "k3", "check", "2e11e3c4dbfb222c06a9337721df048a6c94b2816e1d64a15f745987592a6294", ["No real solutions; x^(2/3) cannot be negative.", "One solution, x = −8, after applying the exponent.", "Two solutions, x = ±8, after applying the exponent.", "One solution, x = 8, after applying the exponent."]],
] as const;
async function load(id: string) { return JSON.parse(await readFile(path.join(directory, `${id}.json`), "utf8")) as RawLesson; }
function step(current: RawLesson, id: string) { const found = current.steps.find((entry) => entry.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }
function maskedContract(widget: unknown) { const copy = JSON.parse(JSON.stringify(widget)) as { options: Array<{ label: string }> }; for (const option of copy.options) option.label = "__LABEL__"; return copy; }
describe("S310 Radical Functions choice parity", () => {
  it("preserves every non-label MCQ contract and answer evaluation", async () => { for (const [lessonId, stepId, kind, contractHash, labels] of choices) { const current = step(await load(lessonId), stepId); expect(current.kind).toBe(kind); const rawWidget = current.widget as { type?: string; options?: Array<{ id: string; label: string; correct: boolean }> }; expect(rawWidget.type).toBe("mcq"); if (!rawWidget.options) throw new Error(`${lessonId}/${stepId}: missing options`); expect(hash(maskedContract(rawWidget))).toBe(contractHash); const widget = WidgetSpec.parse(rawWidget); expect(widget.type).toBe("mcq"); if (widget.type !== "mcq") throw new Error(`${lessonId}/${stepId}: expected MCQ`); expect(widget.options.map((option) => option.id)).toEqual(["o1", "o2", "o3", "o4"]); expect(widget.options.map((option) => option.label)).toEqual(labels); expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["o1"]); for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct); const lengths = widget.options.map((option) => option.label.length); expect(Math.max(...lengths) - Math.min(...lengths), `${lessonId}/${stepId}`).toBeLessThanOrEqual(12); } });
  it("keeps the complete course manifest and valid lesson schemas", async () => { const manifest = JSON.parse(await readFile(path.join(course, "course.json"), "utf8")) as { chapters: Array<{ lessonIds: string[] }> }; const declared = manifest.chapters.flatMap((chapter) => chapter.lessonIds).sort(); const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort(); expect(files.map((file) => file.replace(/\.json$/, ""))).toEqual(declared); for (const file of files) { const raw = JSON.parse(await readFile(path.join(directory, file), "utf8")) as RawLesson; expect(file).toBe(`${raw.id}.json`); expect(raw.courseId).toBe("radical-functions"); Lesson.parse(raw); } });
});
