import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";
type RawStep = { id: string; kind: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[] };
const course = path.join(process.cwd(), "content", "courses", "trig-identities-equations");
const directory = path.join(course, "lessons");
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const choices = [
  ["ti-01-01", "k3", "check", "35719699de3b73ecba99fc7e5c58d490e27eb6b13ce9ec07e823277d67d1382d", ["x = π/3 + 2πk or x = 5π/3 + 2πk; both cosine branches.", "x = π/3 + 2πk; it names only one cosine branch.", "x = π/3 + πk; it includes angles where cosine is −1/2."]],
  ["ti-01-02", "k2", "check", "69f305ae27513733acdcce00b1fc06e559120bef40b6d1e00b581053ce167f97", ["x = πk; this single family includes every sine zero.", "x = 2πk; it keeps only the even multiples of π.", "x = π/2 + πk; it lists cosine zeros instead."]],
  ["ti-02-02", "k3", "check", "08d0f85a000eb01c4d32d003415b7b56f8bcaa58b13e3e00a942d19f17e8b6b6", ["1, after converting cot²θ to csc²θ and simplifying.", "sin²θ, after stopping before the cotangent term.", "cot²θ, after dropping the sine-squared factor."]],
  ["ti-02-03", "k1", "check", "071b1776013d0469b748032d2b0d90675a5afbf5b70bf2cf5c7d16785f2efd58", ["sin θ, after cancelling cos θ on the stated domain.", "sin θ·cos²θ, after multiplying instead of cancelling.", "tan θ, after leaving the original quotient unsimplified."]],
  // ti-03-02/k3 o1 label rewritten by S327 (reports/closure/S327_FIX_PG6.md, CHOICE-0059) to drop
  // a "since"-qualifier rationale-leak trigger word and disambiguate "the sine term"; contract hash unchanged.
  ["ti-03-02", "k3", "check", "6c092fa92716f1b73d5e66d462211f69b2cb377a8e3c710c0ec9c45052e70b93", ["cos θ — sin 90° = 1 survives; cos 90° = 0 vanishes.", "sin θ, if the cofunction relation is reversed.", "1 − sin θ, if the subtraction formula is misread."]],
] as const;
async function load(id: string) { return JSON.parse(await readFile(path.join(directory, `${id}.json`), "utf8")) as RawLesson; }
function step(current: RawLesson, id: string) { const found = current.steps.find((entry) => entry.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }
function maskedContract(widget: unknown) { const copy = JSON.parse(JSON.stringify(widget)) as { options: Array<{ label: string }> }; for (const option of copy.options) option.label = "__LABEL__"; return copy; }
describe("S309 Trig Identities & Equations choice parity", () => {
  it("preserves every non-label MCQ contract and answer evaluation", async () => { for (const [lessonId, stepId, kind, contractHash, labels] of choices) { const current = step(await load(lessonId), stepId); expect(current.kind).toBe(kind); const rawWidget = current.widget as { type?: string; options?: Array<{ id: string; label: string; correct: boolean }> }; expect(rawWidget.type).toBe("mcq"); if (!rawWidget.options) throw new Error(`${lessonId}/${stepId}: missing options`); expect(hash(maskedContract(rawWidget))).toBe(contractHash); const widget = WidgetSpec.parse(rawWidget); expect(widget.type).toBe("mcq"); if (widget.type !== "mcq") throw new Error(`${lessonId}/${stepId}: expected MCQ`); expect(widget.options.map((option) => option.id)).toEqual(["o1", "o2", "o3"]); expect(widget.options.map((option) => option.label)).toEqual(labels); expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["o1"]); for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct); const lengths = widget.options.map((option) => option.label.length); expect(Math.max(...lengths) - Math.min(...lengths), `${lessonId}/${stepId}`).toBeLessThanOrEqual(12); } });
  it("keeps the complete course manifest and valid lesson schemas", async () => { const manifest = JSON.parse(await readFile(path.join(course, "course.json"), "utf8")) as { chapters: Array<{ lessonIds: string[] }> }; const declared = manifest.chapters.flatMap((chapter) => chapter.lessonIds).sort(); const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort(); expect(files.map((file) => file.replace(/\.json$/, ""))).toEqual(declared); for (const file of files) { const raw = JSON.parse(await readFile(path.join(directory, file), "utf8")) as RawLesson; expect(file).toBe(`${raw.id}.json`); expect(raw.courseId).toBe("trig-identities-equations"); Lesson.parse(raw); } });
});
