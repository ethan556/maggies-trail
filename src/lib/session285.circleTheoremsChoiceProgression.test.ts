import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const COURSE = join(ROOT, "content", "courses", "circle-theorems");
const LESSONS = join(COURSE, "lessons");

const MCQS = [
  ["cr-01-03", "i2", "o1", ["o1", "o2", "o3", "o4"], "4d0084bd48c1f2e0757f508ca068d58f69f7c4590f0ff19039aa0368b2058634", "1802982656daaa09fa19b99a2e2fb3c5079e40269e88db145eafaf97200db473"],
  ["cr-02-02", "k3", "o1", ["o1", "o2", "o3", "o4"], "0ddf85292d6ade4e5e4d755712015e8a8ea5a411af41cd6465c6a4dce75504c0", "91418ac5aefe926feec44e2a6a8a311f6b53303dc34a688220c5b2d50ab3462e"],
  ["cr-04-01", "i1", "o1", ["o1", "o2", "o3", "o4"], "9ede1d2ef81fe73adb8f24c18a313909b7b46b83c9589f6341b13b4501f1c282", "c11789d44288bdce5fabfa7699a34acc50baf9a7bc39bdf7c3e94c345a66ef77"],
  ["cr-04-01", "k3", "o1", ["o1", "o2", "o3", "o4"], "c5e3fbe9de4a53f62dc056cb9fa741c5ba1009d2ce3e2c64da2d13b97f6a8f45", "774662e3e6c1206bed949fffad47183bd4953eb4fee4c8916653fbf730ae709a"],
  ["cr-04-02", "i2", "o1", ["o1", "o2", "o3", "o4"], "872ca234dd67dd4dd1f06767fd5b50faaf9795ceada04c312184c69dba5b90c1", "39481b131ff178136ba9eff03138190d3ee277ded6d56c4ec0f2aae3e37e4a54"],
  ["cr-04-02", "k3", "o1", ["o1", "o2", "o3", "o4"], "1647eb9b73e0b6f470e837c110cab4a0cc43bf53458287213f90515e70f657e1", "2897582044fda8296264ec1785ee667e05f9b39f7e37b9c34bf33e240a0b6cf7"],
  ["cr-04-03", "i1", "o1", ["o1", "o2", "o3", "o4"], "47384e1793a39e0537f1d1a23f6abcf36212ac6e562c7af1a7adf36b36ec6516", "154722d4eee960f5fe6cc5af984814725f150dd5466ccf74499d14a4fc96be84"],
  ["cr-05-03", "k2", "o1", ["o1", "o2", "o3", "o4"], "b656573a8120561801fd7606d24e6601e52e9b32c40994fd2796e85d5326d2b6", "7e750c40381c5aa15c3b54c6a25ec8f86c8feefe575f9a25eb616addc5a6e1bd"],
  ["cr-05-03", "k3", "o1", ["o1", "o2", "o3", "o4"], "a4d52115a3dbf358587d8f299a35b498165eea4ff0f99f6b3d7c3dc0cf37f7ab", "8d5a0db053b4bc3cdd2dbaeb2d4c931f2ee5d17a6bf026a393100537ada1946a"],
  ["cr-06-01", "k2", "a", ["a", "b", "c", "d"], "96a4b2906d35d085a34dc3ff6f278d2ce699ed134b9f39a0eb25f6fdf57856e6", "2303db8620327b9fcc79027d7a81bbff2d1c00e57097da3307fe8d333d4fbb8d"],
] as const;

type Widget = { type?: string; prompt?: string; answer?: number; tolerance?: number; commonErrors?: unknown[]; options?: Array<{ id: string; label: string; correct: boolean; feedback?: string }> };
function widget(lessonId: string, stepId: string): Widget {
  const lesson = JSON.parse(readFileSync(join(LESSONS, `${lessonId}.json`), "utf8")) as { steps: Array<{ id: string; widget?: Widget }> };
  const step = lesson.steps.find((candidate) => candidate.id === stepId);
  if (!step?.widget) throw new Error(`missing ${lessonId}/${stepId}`);
  return step.widget;
}
function hash(value: unknown) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function evaluatorSeal(source: Widget) {
  const { prompt: _prompt, options, ...rest } = source;
  return hash({ ...rest, options: options?.map(({ label: _label, ...option }) => option) });
}

describe("S285 Circle Theorems choice/progression repair", () => {
  it("keeps the complete 16-lesson manifest and every target step identity", () => {
    const manifest = JSON.parse(readFileSync(join(COURSE, "course.json"), "utf8")) as { chapters: Array<{ lessonIds: string[] }> };
    const declared = manifest.chapters.flatMap((chapter) => chapter.lessonIds).sort();
    const actual = readdirSync(LESSONS).filter((file) => file.endsWith(".json")).map((file) => file.replace(/\.json$/, "")).sort();
    expect(declared).toHaveLength(16);
    expect(actual).toEqual(declared);
    for (const [lessonId, stepId] of MCQS) expect(widget(lessonId, stepId).type).toBe("mcq");
  });

  it("keeps evaluator contracts and closes the choice-length leakage for all ten source rows", () => {
    for (const [lessonId, stepId, correctId, optionIds, expectedEvaluatorSeal, expectedLabelSeal] of MCQS) {
      const source = widget(lessonId, stepId);
      const options = source.options ?? [];
      expect(options.map((option) => option.id).sort()).toEqual([...optionIds].sort());
      expect(options.filter((option) => option.correct).map((option) => option.id)).toEqual([correctId]);
      expect(options.every((option) => typeof option.feedback === "string" && option.feedback.length > 0)).toBe(true);
      const correct = options.find((option) => option.correct)!;
      const longestWrong = Math.max(...options.filter((option) => !option.correct).map((option) => option.label.length));
      expect(correct.label.length > longestWrong * 1.5 && correct.label.length - longestWrong >= 12).toBe(false);
      expect(evaluatorSeal(source)).toBe(expectedEvaluatorSeal);
      expect(hash(options.map((option) => [option.id, option.label]))).toBe(expectedLabelSeal);
    }
  });

  it("reframes the repeated sector-area check without changing its numeric evaluator", () => {
    const source = widget("cr-05-02", "k2");
    expect(source).toMatchObject({ type: "numeric", answer: 62.83, tolerance: 0.05 });
    expect(source.commonErrors).toHaveLength(3);
    expect(source.prompt).toBe("A stage light covers a 72° sector of radius 10. Treat it as part of the full area; enter the lit area to 2 decimals.");
    expect(evaluatorSeal(source)).toBe("da60112c7ae27da2c8ce0d165355ae575491bbfc9031a9fa1a1ded92d0d56c93");
  });
});
