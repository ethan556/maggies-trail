import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

type RawStep = { id: string; kind: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[] };
const course = path.join(process.cwd(), "content", "courses", "integration-accumulation");
const directory = path.join(course, "lessons");
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const choices = [
  ["in-01-01", "k1", "6133d1379b43536e895b0ff29e3e3ace9e8e623ddb656de13e4c1cfc001e7548", "e61b8d0614b567860b2b6b8a4b15941daa78de313be15e1f0cfbdcdc0d06f369", ["Left heights are lowest, so rectangles stay below.", "Every rectangle is smaller than a curved area.", "Too few rectangles always makes an estimate too small.", "Either endpoint rule must underestimate a rising curve."]],
  ["in-01-01", "k2", "2cbc7c8b7d96f24ce2a12f4b2c0d9312ac4970ec054ffb4a08bcfdbff079503b", "b1cd14882c36dff030271cff10c2b6b184cb501926d864a1d37a0fef4099602e", ["Trapezoid rule: its top matches the straight line.", "Left rule: it uses the line’s lower endpoint.", "Right rule: it uses the line’s upper endpoint.", "No rule can be exact with a single strip."]],
  ["in-01-02", "k1", "e1cc09ccd9d10abd077e3f06980d3dc67e599490fffcf3ae3228d725867b94a6", "fc8e28055af8b1783c4fa69b502637d382349a20f6a7e13cde271f9dcb870dde", ["h tends to 0 while f(b) − f(a) stays fixed.", "f(b) − f(a) tends to 0 as n increases.", "The rectangles become perfect at a finite n.", "The gap never vanishes; it only shrinks."]],
  ["in-02-01", "k2", "fb503f54da2d9e0b7c912e19f671c66f73cee98e51782aa711d5c0f8e64d6764", "c33786c8bc72ec7955b25703a9f30b93c7c7ab14c178186ec6bb6a6321794a01", ["A dummy variable used only inside the integral.", "The output value of the accumulated area.", "A constant that stays fixed during integration.", "The width of each approximation rectangle."]],
  ["in-02-03", "k2", "1e6332e1f06a1fc50fa0d179f9773f5d8541488578cf9ff5524c9cb66651f701", "bdb7687364037f6df2d2946ee241b1a6c97919bd4e870b6f09caed4c17768f44", ["Net displacement is 2 miles; total distance is 8 miles.", "Net displacement is 8 miles; total distance is 2 miles.", "The runner traveled 2 miles and stopped at 8 miles.", "The integrals conflict because velocity changed direction."]],
  ["in-03-01", "k2", "b4d4886eec071bf49a0c92aa112e553ffec7502f7d424b982dbe4d510abde37b", "947bede3574c9e4ad55268d3f232c125133f6c13f089fd85c7ee80f3a6ad236d", ["They are both x³; changing a lower limit adds a constant.", "The first derivative is 4 larger than the second.", "The lower limit makes the second derivative larger.", "They cannot be compared without evaluating each integral."]],
  ["in-03-02", "k2", "506c73db3aa2d6c87f35431c88dc8ecdd3d9ce245de60ee2256af46cddcb3aba", "b873bd235e17d0d65985ecb4c98036f7ccbe5bf458b5af08aedece32ae0957c2", ["Their constant difference cancels in F(b) − F(a).", "All antiderivatives of f are exactly the same function.", "The constant C is too small to affect an integral.", "A definite integral has no need for an antiderivative."]],
  ["in-04-01", "k3", "d78864052959ce93cc228db400539aa28ff7f12dcee45f44225a98ecc2fb7cc1", "597ed1eb5b5bbd6548fec197f219ee711e2523b5820c2cd230c2a8f327f8d18f", ["In an indefinite integral; a definite integral cancels it.", "For a definite integral because the endpoints are fixed.", "Never; it is only a notation convention in calculus.", "Only when its numerical value is larger than 1."]],
  ["in-04-03", "k2", "0d1cabb9d04e95c62de6a3c317881b402595409e725f7f52b7a1bee2952dd30f", "946156f51db802fa66e3a4d0bac5db6375ac4761ae91e928c5c76a1c750c93c7", ["At n = −1, the rule divides by n + 1 = 0.", "Negative powers cannot be integrated with any method.", "The exception is only a historical convention.", "The function 1/x has no antiderivative at all."]],
  ["in-05-01", "k1", "1213edb82f16ebd2323fbf82158b4d88c8d472bb02dbf8b8beacc99ab5131370", "58ce48d607330cdf9eaf185b23024663d07389b6d8ee8abc25f84366555287f8", ["u = x² + 1; its derivative 2x is the remaining factor.", "u = 2x; its derivative provides the outside factor.", "u = (x² + 1)³; the whole power should be substituted.", "u = x; its derivative accounts for the coefficient."]],
  ["in-05-03", "k1", "a4a30c1e818a8dc8273e9f6df14b9bce86622245ce02a53390dfdd4448b2ad62", "ccfbffa88d1233e16374d961d2dc9d947b4cb5fd48e78372f8dab52389849b27", ["u = x³ + 1; du = 3x² dx supplies the x² factor.", "u = x²; its derivative supplies the x² factor.", "u = x³; its derivative makes the power disappear.", "No substitution can match both the factor and the power."]],
] as const;

async function load(id: string) { return JSON.parse(await readFile(path.join(directory, `${id}.json`), "utf8")) as RawLesson; }
function step(current: RawLesson, id: string) { const found = current.steps.find((entry) => entry.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }
function evaluator(widget: { prompt?: string; options: Array<{ label: string; [key: string]: unknown }>; [key: string]: unknown }) { const { prompt: _prompt, options, ...rest } = widget; return { ...rest, options: options.map(({ label: _label, ...option }) => option) }; }

describe("S299 Integration & Accumulation choice parity", () => {
  it("preserves every evaluator, feedback surface, option identity, and answer", async () => {
    for (const [lessonId, stepId, evaluatorHash, feedbackHash, labels] of choices) {
      const current = step(await load(lessonId), stepId);
      expect(current.kind).toBe("check");
      const rawWidget = current.widget as { type?: string; prompt?: string; options?: Array<{ id: string; label: string; correct: boolean; feedback?: string; [key: string]: unknown }>; [key: string]: unknown };
      expect(rawWidget.type).toBe("mcq");
      if (!rawWidget.options) throw new Error(`${lessonId}/${stepId}: missing options`);
      expect(hash(evaluator(rawWidget as Required<typeof rawWidget>))).toBe(evaluatorHash);
      expect(hash(rawWidget.options.map((option) => [option.id, option.feedback ?? null]))).toBe(feedbackHash);
      const widget = WidgetSpec.parse(current.widget);
      expect(widget.type).toBe("mcq");
      if (widget.type !== "mcq") throw new Error(`${lessonId}/${stepId}: expected MCQ`);
      expect(widget.options.map((option) => option.id)).toEqual(["o1", "o2", "o3", "o4"]);
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
      expect(raw.courseId).toBe("integration-accumulation");
      Lesson.parse(raw);
    }
  });
});
