import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";
type RawStep = { id: string; kind: string; figure?: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[] };
const course = path.join(process.cwd(), "content", "courses", "function-transformations");
const directory = path.join(course, "lessons");
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const choices = [
  // ft-03-03/i1 o1 label reworded by S327 (reports/closure/S327_FIX_CH2.md #16, CHOICE-0022): "2 in front"
  // false-matched a units regex (digit-space-"in"-boundary) that no distractor tripped, making the correct
  // option guessable by pattern; contract hash unchanged.
  ["ft-03-03", "i1", "interactive", "91898a18617df5fb0c42c690bca1c244003fa19c1dbbf84d7e23e0a0506562d9", ["The leading −2; its negative sign reflects the parabola.", "The 1 inside; it shifts the parabola horizontally.", "The 8 outside; it shifts the parabola vertically.", "The exponent 2; it sets the graph's quadratic shape."]],
  ["ft-04-01", "k3", "check", "f5cdddddd390882e2687b34b981979a36d33b16eaffd6dc3c32585b9f13f1c8e", ["Evaluate f(x) and g(x), then subtract g(x) from f(x).", "Evaluate g(x), then use its output as f's input value.", "Reverse the subtraction to calculate (g − f)(x) instead.", "Multiply f(x) by g(x), then change the product's sign."]],
] as const;
async function load(id: string) { return JSON.parse(await readFile(path.join(directory, `${id}.json`), "utf8")) as RawLesson; }
function step(current: RawLesson, id: string) { const found = current.steps.find((entry) => entry.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }
function maskedContract(widget: unknown) { const copy = JSON.parse(JSON.stringify(widget)) as { options: Array<{ label: string }> }; for (const option of copy.options) option.label = "__LABEL__"; return copy; }
describe("S312 Function Transformations choice parity", () => {
  it("preserves every non-label MCQ contract and answer evaluation", async () => { for (const [lessonId, stepId, kind, contractHash, labels] of choices) { const current = step(await load(lessonId), stepId); expect(current.kind).toBe(kind); const rawWidget = current.widget as { type?: string; options?: Array<{ id: string; label: string; correct: boolean }> }; expect(rawWidget.type).toBe("mcq"); if (!rawWidget.options) throw new Error(`${lessonId}/${stepId}: missing options`); expect(hash(maskedContract(rawWidget))).toBe(contractHash); const widget = WidgetSpec.parse(rawWidget); expect(widget.type).toBe("mcq"); if (widget.type !== "mcq") throw new Error(`${lessonId}/${stepId}: expected MCQ`); expect(widget.options.map((option) => option.id)).toEqual(["o1", "o2", "o3", "o4"]); expect(widget.options.map((option) => option.label)).toEqual(labels); expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["o1"]); for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct); const lengths = widget.options.map((option) => option.label.length); expect(Math.max(...lengths) - Math.min(...lengths), `${lessonId}/${stepId}`).toBeLessThanOrEqual(12); } });
  it("retains the separately blocklisted fixed-exemplar source binding", async () => { const visual = step(await load("ft-03-02"), "c1"); expect(visual.figure).toBe("stretch-reflect"); });
  it("keeps the complete course manifest and valid lesson schemas", async () => { const manifest = JSON.parse(await readFile(path.join(course, "course.json"), "utf8")) as { chapters: Array<{ lessonIds: string[] }> }; const declared = manifest.chapters.flatMap((chapter) => chapter.lessonIds).sort(); const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort(); expect(files.map((file) => file.replace(/\.json$/, ""))).toEqual(declared); for (const file of files) { const raw = JSON.parse(await readFile(path.join(directory, file), "utf8")) as RawLesson; expect(file).toBe(`${raw.id}.json`); expect(raw.courseId).toBe("function-transformations"); Lesson.parse(raw); } });
});
