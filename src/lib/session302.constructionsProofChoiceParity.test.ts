import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

type RawStep = { id: string; kind: string; widget?: unknown };
type RawLesson = { id: string; courseId: string; steps: RawStep[] };
const course = path.join(process.cwd(), "content", "courses", "constructions-and-proof");
const directory = path.join(course, "lessons");
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const choices = [
  ["cp-01-02", "ch", "challenge", "dac754d2675ac36251183047ac538d6ce5ead8279d1802e63eb1acdfaeb6c43b", "3d33e4a0df19e913c768755a35951009f9e5beda5a990bed5bc3af38c24b993b", ["A perpendicular bisector meets the segment at its midpoint.", "Copying the segment onto a new ray gives its midpoint.", "One arc from an endpoint marks the segment’s midpoint.", "A straightedge through the endpoints marks the midpoint."]],
  ["cp-02-01", "k1", "check", "5f29621e4f1a0bae269fad0d105f47b9d24cfdd0f5072a6ac3b341920fe2bcb8", "8271fb2a9d609bd823a38bf33e5bd62f4088d97e7e0e23da09d12ce44448ac20", ["P and Q are equidistant from A and B, so PQ is a perpendicular bisector.", "P and Q were drawn vertical to each other, so PQ must be perpendicular.", "The arcs cross at 90°, so their joining line is perpendicular.", "PA = PB, so angle APQ is a right angle and PQ is perpendicular."]],
  ["cp-02-02", "k1", "check", "5a4e03a4a1227fb02a30ca2d3484cedae1ac164f2bf048eb8b9e4aff20a49e60", "0ba85f4297ce7d71cd6ff2ff0443904e39a8c257683d709ba28f214a10fc5cf7", ["P and E are equidistant from C and D, so PE is their perpendicular bisector.", "P began above CD’s midpoint, so PE meets the original line at a right angle.", "E is P’s reflection over the original line, so PE must meet it at a right angle.", "Any segment from P to the original line makes a right angle with it."]],
  ["cp-03-02", "i3", "interactive", "0784472f6625547b59d2fe14da01a8a740d794de0d81658675a79c1548da3234", "d550f78a936dd5022502e8f845cac45b1b4bef5a4dd046e92a51aa179e7a6776", ["Equal central angles cut equal chords, giving equal sides and angles.", "A compass automatically makes every side and angle equal.", "Every polygon inscribed in a circle is automatically regular.", "Equal central angles force a larger polygon, not a regular one."]],
  ["cp-03-03", "ch", "challenge", "ab0b7dd1cd2d97b81bf728cfda1bd986b67ef4ecbc6844a919246337bd4a7984", "edfbdcf772080a0252a5eb9a5fd084eec2b4563471f9ce34b8a358e2e4134da9", ["A drawing can hide tiny errors; only logic proves every case.", "A precise drawing is always exact enough to prove every construction.", "Measurements turn into proof once the drawing has been checked.", "Measuring several places proves all future construction cases."]],
  ["cp-04-01", "ch", "challenge", "7ce7527a5a61913b50bf066a99bc8265d41cd211f762cd039669939cbcd36acf", "1dccb19a1b7fe1bb2cb4e3f9cac5f89c4e228eac9b83290424432991dd2aaaa1", ["True: (180 − a) − (90 − a) is always 90° for an acute angle.", "False: a 45° angle makes the two angles differ by another amount.", "False: a 30° angle makes the two angles differ by another amount.", "Undecidable: every acute angle needs a separate numerical check."]],
  ["cp-04-01", "k2", "check", "87a68a3dae822a123b5c807740fa9d43e6fde2aadddd627bd6c68293f100b631", "46646615cb68230809c1a4d72b2964b4b1d9c51230a89c95df3f58050f4421ca", ["A single drawing is one case, not proof of a universal claim.", "Drawings never have enough accuracy to support any geometric claim.", "Geometry forbids using any measuring tool on a construction.", "Proofs take fewer marks to draw than a construction does."]],
  ["cp-05-02", "i3", "interactive", "94460804471980ac86429ef358f715e549b8e02af4a4e3cc334e2e2f84b03052", "872d68f7126994f4459c8404bbad157e509e2ca183f9f8cffbfceec3b21c5332", ["Use a vertical-angle fact to link an exterior angle to a corresponding angle.", "Use a linear-pair fact: the exterior angles form supplementary linear pairs.", "Use two vertical-angle facts to link both exterior angles through the intersection.", "Use a perpendicularity fact: the transversal creates equal exterior angles."]],
  ["cp-05-02", "k2", "check", "e2bac45bca81e18854464251d14cc011c09a3560f502a461fa32e6c68fa42750", "a6e7671f6b28094ff571b1f703cac6d2af100155235f9641fa747f26621aeaa9", ["A linear pair: adjacent angles on a straight line sum to 180°.", "Vertical angles: opposite angles made by intersecting lines are equal.", "The reflexive property: every geometric quantity is equal to itself.", "The midpoint definition: it divides a segment into equal lengths."]],
] as const;

async function load(id: string) { return JSON.parse(await readFile(path.join(directory, `${id}.json`), "utf8")) as RawLesson; }
function step(current: RawLesson, id: string) { const found = current.steps.find((entry) => entry.id === id); if (!found) throw new Error(`${current.id}/${id} missing`); return found; }
function evaluator(widget: { prompt?: string; options: Array<{ label: string; [key: string]: unknown }>; [key: string]: unknown }) { const { prompt: _prompt, options, ...rest } = widget; return { ...rest, options: options.map(({ label: _label, ...option }) => option) }; }

describe("S302 Constructions & Proof choice parity", () => {
  it("preserves evaluator, feedback, identity, and answer contracts for all nine rows", async () => {
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
      expect(widget.options.map((option) => option.id)).toEqual(["o1", "o2", "o3", "o4"]);
      expect(widget.options.map((option) => option.label)).toEqual(labels);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id)).toEqual(["o1"]);
      expect(widget.options.every((option) => typeof option.feedback === "string" && option.feedback.length > 0)).toBe(true);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct);
      const lengths = widget.options.map((option) => option.label.length);
      expect(Math.max(...lengths) - Math.min(...lengths), `${lessonId}/${stepId}`).toBeLessThanOrEqual(12);
    }
  });

  it("keeps the complete course manifest and valid lesson schemas", async () => {
    const manifest = JSON.parse(await readFile(path.join(course, "course.json"), "utf8")) as { chapters: Array<{ lessonIds: string[] }> };
    const declared = manifest.chapters.flatMap((chapter) => chapter.lessonIds).sort();
    const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort();
    expect(files.map((file) => file.replace(/\.json$/, ""))).toEqual(declared);
    for (const file of files) {
      const raw = JSON.parse(await readFile(path.join(directory, file), "utf8")) as RawLesson;
      expect(file).toBe(`${raw.id}.json`);
      expect(raw.courseId).toBe("constructions-and-proof");
      Lesson.parse(raw);
    }
  });
});
