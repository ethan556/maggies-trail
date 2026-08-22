import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const COURSE = join(ROOT, "content", "courses", "right-triangles-trig");
const LESSONS = join(COURSE, "lessons");
const FIGURES = [
  ["rt-01-04", "c1", "ce662830e0370e7994a3a0e9db31d84108158c3dc1ccd3c1136113418b12feb5"],
  ["rt-03-01", "c1", "ebcfb3eea95605c7adbd833ba9df8738c93c2a50ab3704a8755b6077640e42f4"],
  ["rt-03-02", "c2", "be27324028d0494666c884e1cce67c4e4c24de9d9b553fe3a255f29c074bc09a"],
  ["rt-03-03", "c1", "98412ccc6b61515131315332fd2f74c726ee0d397661a48f2e210239ef196275"],
  ["rt-04-03", "c2", "d3ada7cb5e44436ec81ae22329a2557d23abf79396a4430faf219f950fbadda0"],
] as const;
const MCQS = [
  ["rt-01-04", "i2", "o1", "f33018bda620877218ce2e7556bbd0defb2bf72a4574fb608762e6c6d0ef9bac", "6ede72d1798b9fcd3bce559b48c3a223afbed4bdf432801fdd3e1d08b4d913e0"],
  ["rt-04-01", "i1", "o1", "64245b030e38bc4c45f38744a90a3cd34baf1510cfa85a691bc7ac0c4b5f25d9", "64d83fcb766bd80858604ef337d5f27226d2c3632e4a9c9c533db168c5a579b1"],
  ["rt-04-01", "k2", "o1", "93995bb016a28870f82ca24c57f0db40c86ff6c0b26eb20970669831173dcded", "967c588cf9a1e803abb55eedfa64b4e48fc3077f708e20f2f69b36a09212b158"],
  ["rt-04-02", "i1", "o1", "f23ca4e8d8fc6817e5a5109883aeb067276276abca66890e7485d9c132f363f6", "a6e3ffbe314ca8a21a9eb85e54bfff3be52f060046852a4555272941f6702105"],
  ["rt-04-03", "i1", "o1", "959fde3f8246730cbf10fa156e8916a25d2fe98a18703c3e00528807a36d62ef", "502dab9967efc4de31865b5380cd669b6c97d0bf1755b15713b56aa5f3aed1b3"],
  ["rt-05-03", "k3", "o1", "c77068175efeb13aa1347a1dea6a951f4b5e7bf18d222eece8280c7d88c9a451", "584ede7ad12a5aff3a6cb2e8fac1c2b48a4c4d44573f47df0a59ffe8c040e938"],
  ["rt-05-04", "i1", "o1", "c771b8fbc024bca06efd37db4e78583230b848770dfe279d3f8e01d7d25b1b82", "47b56e897196fca06d9133e25d9341b909077623933eb1c9105928d7d230bfaa"],
] as const;

type Widget = { type?: string; prompt?: string; options?: Array<{ id: string; label: string; correct: boolean; feedback?: string }> };
type Step = { id: string; body?: string; figure?: string; widget?: Widget };
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
function step(lessonId: string, stepId: string): Step {
  const lesson = JSON.parse(readFileSync(join(LESSONS, `${lessonId}.json`), "utf8")) as { steps: Step[] };
  const source = lesson.steps.find((candidate) => candidate.id === stepId);
  if (!source) throw new Error(`missing ${lessonId}/${stepId}`);
  return source;
}
function evaluatorSeal(widget: Widget) {
  const { prompt: _prompt, options, ...rest } = widget;
  return hash({ ...rest, options: options?.map(({ label: _label, ...option }) => option) });
}

describe("S288 Right Triangles figure fail-close and choice repair", () => {
  it("keeps the full course manifest", () => {
    const course = JSON.parse(readFileSync(join(COURSE, "course.json"), "utf8")) as { chapters: Array<{ lessonIds: string[] }> };
    const declared = course.chapters.flatMap((chapter) => chapter.lessonIds).sort();
    const actual = readdirSync(LESSONS).filter((file) => file.endsWith(".json")).map((file) => file.replace(/\.json$/, "")).sort();
    expect(declared).toHaveLength(15);
    expect(actual).toEqual(declared);
  });

  it("withholds all five stale fixed-number figures while retaining their exact instructional text", () => {
    for (const [lessonId, stepId, bodySeal] of FIGURES) {
      const source = step(lessonId, stepId);
      expect(Object.hasOwn(source, "figure")).toBe(false);
      expect(hash(source.body)).toBe(bodySeal);
    }
  });

  it("preserves evaluators and feedback while closing all seven choice-length leaks", () => {
    for (const [lessonId, stepId, correctId, evaluatorHash, labelsHash] of MCQS) {
      const widget = step(lessonId, stepId).widget;
      expect(widget?.type).toBe("mcq");
      const options = widget?.options ?? [];
      expect(options).toHaveLength(4);
      expect(options.filter((option) => option.correct).map((option) => option.id)).toEqual([correctId]);
      expect(options.every((option) => typeof option.feedback === "string" && option.feedback.length > 0)).toBe(true);
      const correct = options.find((option) => option.correct);
      if (!correct) throw new Error(`missing correct ${lessonId}/${stepId}`);
      const longestWrong = Math.max(...options.filter((option) => !option.correct).map((option) => option.label.length));
      expect(correct.label.length > longestWrong * 1.5 && correct.label.length - longestWrong >= 12).toBe(false);
      expect(evaluatorSeal(widget ?? {})).toBe(evaluatorHash);
      expect(hash(options.map((option) => [option.id, option.label]))).toBe(labelsHash);
    }
  });
});
