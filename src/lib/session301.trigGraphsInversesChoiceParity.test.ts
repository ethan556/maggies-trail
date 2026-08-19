import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

type RawStep = { id: string; kind: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[] };
const course = path.join(process.cwd(), "content", "courses", "trig-graphs-inverses");
const directory = path.join(course, "lessons");
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const choices = [
  ["tg-02-01", "k2", "check", "59e9f0fcd34becc3c7e4650330689322372cb0451c05b61521f9cbf3923dad56", "92f8877eea3f89a0f9830fe7d34dd328d0328ef409a9a54a31e5616b6bf1d718", ["x = π/2; the curve crosses the midline while falling.", "x = 0; that point is the cosine graph’s peak.", "x = π; that point is the cosine graph’s trough."]],
  ["tg-02-03", "k3", "check", "0cce71e89f9eb1e502a48c128c5eacbad96735b8a08572f1c7d80a08be979644", "71c45af3d4ada2fc297dc60307be048ea02f531b60582bad230f1e5e0c407756", ["They give 2 and −2, so the graphs are reflections.", "They both give 2, so the graphs are the same.", "They both give 0, so the graphs are the same."]],
  ["tg-03-03", "k2", "check", "6e7a3c5e55e1272bcce8ee4673457817cbbad16f8fbc8b6d4a0d13aa7ae2fa2c", "8a565db456dc7bfd14bbb7f5a840641b5d33add76927f406ec0d1fe7fa05482c", ["It steepens each branch; tangent still has no maximum.", "It sets a maximum height of 3 on every branch.", "It changes the period so each cycle lasts π/3."]],
  ["tg-04-01", "k1", "check", "6c65f6daa76f57d5119fbf651707462a2ba11329ab31bbf23341287f983bc374", "24de5f39d452640a978bddcf2807ff91a7405a728cee692984f24270cb265ec4", ["Its angle is outside arcsin’s branch [−π/2, π/2].", "Because 5π/6 is negative, outside arcsin’s branch.", "It is valid because arcsin returns both matching angles."]],
  ["tg-04-01", "k3", "check", "3b223778ddf42bb136dded855c8ad8e26177d68a64270f422857886ba3e7bb5e", "a55309591e9faf303903642012e704c1daf471be9f971aedd62c23b48e91d31a", ["Undefined: no angle has sine equal to 2.", "π/2: sine reaches its largest value there.", "About 1.09 radians, the angle with sine 2."]],
  ["tg-04-02", "ch1", "challenge", "72d00c35957a6ec9b6bbbcfcb89ecd6f7f12c6dddde1326ac2a348ee60f61419", "a4dd59489cf51bf5d1551d49387af479ead5f5d76856cfd5b648b9bced44cc34", ["It approaches π/2; that value is a horizontal asymptote.", "It grows without bound as x continues to increase.", "It reaches π/2 at a finite input such as x = 1000."]],
  ["tg-04-02", "k1", "check", "e674f188e8f023332a76fad20dc8102b72d8d8b4101db4b588619c3e5e6f8c28", "002a6a1c35fb5b6700e7933f9c9ae63b32df47b33a813cbf7d47083a2a366d3b", ["It repeats cosine outputs on both sides of the peak at 0.", "Cosine is undefined for negative angles on that branch.", "That branch contains only positive cosine values."]],
  ["tg-05-02", "k2", "check", "73e4f4d2378a0c0c0a74d4c9a4685ab5f564a49a53f7ed711b5d3df14be22d14", "f738ba7af83232d17d3643243c77d93be93e9ee2b59e3bdfa811aaa60fae274c", ["+4/5: arcsin’s branch has nonnegative cosine.", "−4/5: a negative sine requires a negative cosine.", "−3/5: the input remains the cosine value."]],
] as const;

async function load(id: string) { return JSON.parse(await readFile(path.join(directory, `${id}.json`), "utf8")) as RawLesson; }
function step(current: RawLesson, id: string) { const found = current.steps.find((entry) => entry.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }
function evaluator(widget: { prompt?: string; options: Array<{ label: string; [key: string]: unknown }>; [key: string]: unknown }) { const { prompt: _prompt, options, ...rest } = widget; return { ...rest, options: options.map(({ label: _label, ...option }) => option) }; }

describe("S301 Trig Graphs & Inverses choice parity", () => {
  it("preserves evaluator, feedback, identity, and answer contracts for all eight rows", async () => {
    for (const [lessonId, stepId, kind, evaluatorHash, feedbackHash, labels] of choices) {
      const current = step(await load(lessonId), stepId);
      expect(current.kind).toBe(kind);
      const rawWidget = current.widget as { type?: string; prompt?: string; options?: Array<{ id: string; label: string; correct: boolean; feedback?: string; [key: string]: unknown }>; [key: string]: unknown };
      expect(rawWidget.type).toBe("mcq");
      if (!rawWidget.options) throw new Error(`${lessonId}/${stepId}: missing options`);
      expect(hash(evaluator(rawWidget as Required<typeof rawWidget>))).toBe(evaluatorHash);
      expect(hash(rawWidget.options.map((option) => [option.id, option.feedback ?? null]))).toBe(feedbackHash);
      const widget = WidgetSpec.parse(current.widget);
      expect(widget.type).toBe("mcq");
      if (widget.type !== "mcq") throw new Error(`${lessonId}/${stepId}: expected MCQ`);
      expect(widget.options.map((option) => option.id)).toEqual(["o1", "o2", "o3"]);
      expect(widget.options.map((option) => option.label)).toEqual(labels);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["o1"]);
      expect(widget.options.every((option) => typeof option.feedback === "string" && option.feedback.length > 0)).toBe(true);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct);
      const lengths = widget.options.map((option) => option.label.length);
      expect(Math.max(...lengths) - Math.min(...lengths), `${lessonId}/${stepId}`).toBeLessThanOrEqual(12);
    }
  });

  it("keeps the complete fifteen-lesson course manifest and valid schemas", async () => {
    const manifest = JSON.parse(await readFile(path.join(course, "course.json"), "utf8")) as { chapters: Array<{ lessonIds: string[] }> };
    const declared = manifest.chapters.flatMap((chapter) => chapter.lessonIds).sort();
    const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort();
    expect(files.map((file) => file.replace(/\.json$/, ""))).toEqual(declared);
    expect(files).toHaveLength(15);
    for (const file of files) {
      const raw = JSON.parse(await readFile(path.join(directory, file), "utf8")) as RawLesson;
      expect(file).toBe(`${raw.id}.json`);
      expect(raw.courseId).toBe("trig-graphs-inverses");
      Lesson.parse(raw);
    }
  });
});
