import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

type RawStep = { id: string; kind: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[] };
const course = path.join(process.cwd(), "content", "courses", "rational-functions");
const directory = path.join(course, "lessons");
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const choices = [
  ["rf-01-01", "i2", "interactive", "fff433c8203e4f6f88cc5e23bd98506b2e18ec7bdf3e7c87ac3bcfa8263155d3", "1d8190302511ea72c5b3a00ded6e6fe19674d7f4d9cef0acb6bf32915b0e0e33", ["f(6) = 0; the denominator is nonzero there.", "x = 6 is excluded because the denominator becomes zero.", "f(6) is undefined because its numerator becomes zero.", "f(6) = 6 because the input is used as the output."]],
  ["rf-01-01", "k3", "check", "13ef4a490c1a4e2377f8af79c8fb44372739c1b17f98206b93e0f352678bb7d2", "228ffd809545a29876b0317bbbc3124162844e0925d4d0134d87a41af9ed3628", ["None; x² + 4 stays positive for every real x.", "x = 2 and −2; their squares make the denominator zero.", "x = −4; it makes the denominator equal to zero.", "x = 1; it makes the denominator equal to zero."]],
  ["rf-01-02", "k1", "check", "9b232bd672d49cccc53b0e3b5202a75f60328d4ba575acf3c08cd723f54051e8", "a6860479deb2d2a363a0af53b6f5e46b7dcf539530ad7f4ee2c32eb93eb03bb0", ["It is already simplified; no common factor cancels.", "It simplifies to 3 after canceling the variable terms.", "It simplifies to x + 3 after combining the terms.", "It simplifies to x + 4 after combining the terms."]],
  ["rf-04-01", "k1", "check", "1756f5a5cf831c2644cac06c3eb6476c84aa8d8b6bc3ee712bf446ea294cf005", "19e4279380c5aeeecb1c8579e24af557e89e55428302aa7f8583d28d1efd9991", ["The numerator is always 1, so the fraction cannot equal 0.", "x = 0 is excluded, so 1/x cannot ever be zero.", "At very large x, 1/x becomes exactly equal to zero.", "Because 1/x is positive for every allowable input."]],
  ["rf-04-02", "k2", "check", "703b065affe9ef8bb6eb5910e686bf58dca77d8f35db64e3ce83dec0f451ac71", "6bd32341fa2e97b38b20ac83aa8de44b2ad81aedae64c11204adf00807c21406", ["A vertical asymptote at x = 3; a denominator factor remains.", "A hole occurs at x = 3 because the zero factor cancels completely.", "f(3) = 2 because division by zero leaves the numerator unchanged.", "f(3) = 0 because the zero denominator forces a zero output."]],
  ["rf-04-02", "k3", "check", "7e4e78e4b2f54c86ad75ad7897f84634f75815e3747d2e6e951471a3a9eec020", "836596a7b5632e48a0de5a1cb5bb2d4f556cabe95bedb5e1812a443d9cdc9981", ["A vertical asymptote remains because one x − 5 factor stays below.", "A hole remains because both x − 5 factors cancel completely.", "f(5) = 1 because the identical factors cancel at x = 5.", "Nothing special happens because the factors cancel completely."]],
  ["rf-04-03", "i2", "interactive", "66d477ae6f6926e1df3f0899d7ecd5cbd06b2d18f45f8b6adf5667dd1f0c434b", "2b9b025d62d69b380881a646300928f744f6e7f2bfca8dabb739044d35b1b47a", ["No horizontal asymptote; degree top is greater.", "y = 0 because the denominator’s degree is lower.", "y = 1 because leading coefficients are both 1.", "y = 1/2 because the denominator has coefficient 2."]],
  ["rf-05-01", "k3", "check", "756addc8690b5e7c5d06be04eeb29e67904be8ebc7282ce346759869de76eac6", "e0d20ce22f22939ae71419dcc44bca796925e50b5aab3d9bc9aca6a80bf70cfc", ["No solution; the only candidate x = 1 is excluded.", "x = 1 because both sides have the same denominator.", "x = 5 because the numerators become equal at that input.", "x = −2 because it makes the right numerator equal zero."]],
] as const;

async function load(id: string) { return JSON.parse(await readFile(path.join(directory, `${id}.json`), "utf8")) as RawLesson; }
function step(current: RawLesson, id: string) { const found = current.steps.find((entry) => entry.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }
function evaluator(widget: { prompt?: string; options: Array<{ label: string; [key: string]: unknown }>; [key: string]: unknown }) { const { prompt: _prompt, options, ...rest } = widget; return { ...rest, options: options.map(({ label: _label, ...option }) => option) }; }

describe("S304 Rational Functions choice parity", () => {
  it("preserves evaluator, feedback, identity, and answer contracts for all eight rows", async () => {
    for (const [lessonId, stepId, kind, evaluatorHash, feedbackHash, labels] of choices) {
      const current = step(await load(lessonId), stepId); expect(current.kind).toBe(kind);
      const rawWidget = current.widget as { type?: string; prompt?: string; options?: Array<{ id: string; label: string; correct: boolean; feedback?: string; [key: string]: unknown }>; [key: string]: unknown };
      expect(rawWidget.type).toBe("mcq"); if (!rawWidget.options) throw new Error(`${lessonId}/${stepId}: missing options`);
      expect(hash(evaluator(rawWidget as Required<typeof rawWidget>))).toBe(evaluatorHash);
      expect(hash(rawWidget.options.map((option) => [option.id, option.feedback ?? null]))).toBe(feedbackHash);
      const widget = WidgetSpec.parse(current.widget); expect(widget.type).toBe("mcq"); if (widget.type !== "mcq") throw new Error(`${lessonId}/${stepId}: expected MCQ`);
      expect(widget.options.map((option) => option.id)).toEqual(["o1", "o2", "o3", "o4"]); expect(widget.options.map((option) => option.label)).toEqual(labels); expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["o1"]); expect(widget.options.every((option) => typeof option.feedback === "string" && option.feedback.length > 0)).toBe(true);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct);
      const lengths = widget.options.map((option) => option.label.length); expect(Math.max(...lengths) - Math.min(...lengths), `${lessonId}/${stepId}`).toBeLessThanOrEqual(12);
    }
  });

  it("keeps the complete course manifest and valid lesson schemas", async () => {
    const manifest = JSON.parse(await readFile(path.join(course, "course.json"), "utf8")) as { chapters: Array<{ lessonIds: string[] }> }; const declared = manifest.chapters.flatMap((chapter) => chapter.lessonIds).sort(); const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort(); expect(files.map((file) => file.replace(/\.json$/, ""))).toEqual(declared);
    for (const file of files) { const raw = JSON.parse(await readFile(path.join(directory, file), "utf8")) as RawLesson; expect(file).toBe(`${raw.id}.json`); expect(raw.courseId).toBe("rational-functions"); Lesson.parse(raw); }
  });
});
