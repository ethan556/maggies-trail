import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";
type RawStep = { id: string; kind: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[] };
const course = path.join(process.cwd(), "content", "courses", "polynomial-rational-analysis");
const directory = path.join(course, "lessons");
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const choices = [
  ["pra-01-01", "k3", "check", "43bbc8a6aab88a271ec350f0b83d2d5ec27cc3a05c2ac2fdea2da060a3960a26", ["Every rational zero is a candidate, though candidates can fail.", "Every rational candidate must be a zero of the polynomial.", "Every irrational zero is also a candidate on the list."]],
  ["pra-03-01", "k3", "check", "12a4102044b48c98a925ddf091013e9da4e1e7e65bf66ceae401299b447faa3a", ["No horizontal or slant asymptote; its quotient is cubic.", "A slant asymptote, because the degree difference is one.", "A horizontal asymptote at y = 1 for large x-values."]],
  ["pra-03-03", "k3", "check", "5f2316674b96b8a9c3cf63953e4908f11152e23be3ae1515115c70a6f6049693", ["Nowhere; the remaining gap −3/(x − 1) never equals zero.", "At x = 1, where the rational expression has a vertical break.", "At x = 2, where the original numerator equals zero."]],
  ["pra-04-03", "k3", "check", "b65f4160475c163d63e283b56f1da0bc2ae14a24af2515f9e83d372b8eaef944", ["The same intervals work, but every endpoint is excluded.", "All endpoints remain included because the sign test stays.", "Only values above 2 work after the strict inequality."]],
  ["pra-05-01", "k3", "check", "8fa0d6ad7fb9e179238cf9479321ab972d3d27b5002a87b47ae92abd999456bd", ["The excluded value 5 also flips the sign, splitting x > 0.", "The zero x = 0 is the only place the sign can change.", "The zero x = 0 should not appear in any sign chart."]],
  ["pra-05-02", "k1", "check", "d7612b1114eee1f923c33379653538cb71274048a4d34de7040536d6188ce6c2", ["Below 2 the multiplier is negative, so the sign must flip.", "Above 2 the multiplier is positive, so the sign must flip.", "The multiplier must be squared before solving the inequality."]],
] as const;
async function load(id: string) { return JSON.parse(await readFile(path.join(directory, `${id}.json`), "utf8")) as RawLesson; }
function step(current: RawLesson, id: string) { const found = current.steps.find((entry) => entry.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }
function maskedContract(widget: unknown) { const copy = JSON.parse(JSON.stringify(widget)) as { options: Array<{ label: string }> }; for (const option of copy.options) option.label = "__LABEL__"; return copy; }
describe("S308 Polynomial & Rational Analysis choice parity", () => {
  it("preserves every non-label MCQ contract and answer evaluation", async () => { for (const [lessonId, stepId, kind, contractHash, labels] of choices) { const current = step(await load(lessonId), stepId); expect(current.kind).toBe(kind); const rawWidget = current.widget as { type?: string; options?: Array<{ id: string; label: string; correct: boolean }> }; expect(rawWidget.type).toBe("mcq"); if (!rawWidget.options) throw new Error(`${lessonId}/${stepId}: missing options`); expect(hash(maskedContract(rawWidget))).toBe(contractHash); const widget = WidgetSpec.parse(rawWidget); expect(widget.type).toBe("mcq"); if (widget.type !== "mcq") throw new Error(`${lessonId}/${stepId}: expected MCQ`); expect(widget.options.map((option) => option.id)).toEqual(["o1", "o2", "o3"]); expect(widget.options.map((option) => option.label)).toEqual(labels); expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["o1"]); for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct); const lengths = widget.options.map((option) => option.label.length); expect(Math.max(...lengths) - Math.min(...lengths), `${lessonId}/${stepId}`).toBeLessThanOrEqual(12); } });
  it("keeps the complete course manifest and valid lesson schemas", async () => { const manifest = JSON.parse(await readFile(path.join(course, "course.json"), "utf8")) as { chapters: Array<{ lessonIds: string[] }> }; const declared = manifest.chapters.flatMap((chapter) => chapter.lessonIds).sort(); const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort(); expect(files.map((file) => file.replace(/\.json$/, ""))).toEqual(declared); for (const file of files) { const raw = JSON.parse(await readFile(path.join(directory, file), "utf8")) as RawLesson; expect(file).toBe(`${raw.id}.json`); expect(raw.courseId).toBe("polynomial-rational-analysis"); Lesson.parse(raw); } });
});
