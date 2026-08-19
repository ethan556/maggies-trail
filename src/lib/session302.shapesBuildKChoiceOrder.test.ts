import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

const directory = join(process.cwd(), "content", "courses", "shapes-build-k", "lessons");
const lessons = readdirSync(directory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));

const contracts = [
  ["kgb-01-01", "k2", null, "39ca948e58c9dba384cbbd34f3798095797dab8ae9e9cc0a27d06429bf4f25d1", "4c4242c0fdd724e22998e86037db436aef162c4f065d607ce970c11c303bb141"],
  ["kgb-01-02", "ch1", null, "07c2b97a793ede319a780b7c2fc33e4c639af28fbe89abcb790649e1638e8341", "b11971b4f74b7ae30536ca7f07f88b4eba5de984358d7dc0d37c754986a269b7"],
  ["kgb-01-04", "k2", null, "4dfcfa5151f8654c8c49544405278c36ab468aaea91d734296ae417f878d9a6e", "ba2c6327b2989f4e7106df348b1b41bf8ea5546981165abb645f98b9a7ac9302"],
  ["kgb-02-04", "k2", null, "b2b2cb9e5aae9b372dcfe0a2f4102affe14752dcefbd32d9705cdba5dbc7d450", "6a07e90850ad41c645ce409dc0977e7b120c7924d3bac78309732bae3793d769"],
  ["kgb-02-05", "k1", null, "a4d95a1d296839e6a2061957b0a911225427e078c5219e85e6aae5c8951b4145", "42465de5410dde41b82011628d2bd7222b04c10634902cf25975884b92011b07"],
  ["kgb-02-05", "k2", null, "49054e2f5aa5d21efd8c50f583a56a42827be31cd454d4d01b34403b301246cd", "7282ce6bb1ef732871ee1465b917f1ca3fe4cbec34535d3cfa930f4b17e5bc28"],
  ["kgb-03-01", "k1", null, "374455aff44b718e4fba4a0a024152e7583e32d34fed6fa0ee3ff2a2a09c3529", "101b4aa76025cc31b30c422b7338c0dc023c457173229e83840f5dc21cf2b01b"],
  ["kgb-03-01", "k2", null, "cbb6cfff71118c3e564c78811ae235b78e797de81bc59a3f4bd599af4a7b420a", "25830430e7d5788236235648d558e47e90466e4f52b97d52b8d0705289bfc80a"],
  ["kgb-03-02", "k1", null, "792ee2d11e47a6dd196f11bd0780efeb59bfd688ac9bbdc42dfa4d4c1a960ce3", "e29272a84fe075f57aea21b68130c098bc600053399736a760ad64d90bb24fc0"],
] as const;

const hash = (value: string) => createHash("sha256").update(value).digest("hex");

describe("S302 Shapes Build Kindergarten choice-order repair", () => {
  it("distributes correct choices while retaining prompt, option, evaluator, and figure contracts", () => {
    expect(contracts).toHaveLength(9);
    const correctIndices = contracts.map(([lessonId, stepId, figure, promptHash, optionsHash], index) => {
      const lesson = lessons.find((candidate) => candidate.id === lessonId);
      const step = lesson?.steps.find((candidate) => candidate.id === stepId);
      const widget = WidgetSpec.parse(step?.widget);
      expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
      if (widget.type !== "mcq") throw new Error("Expected MCQ");
      expect(step?.figure ?? null, `${lessonId}/${stepId} figure`).toBe(figure);
      expect(hash(widget.prompt), `${lessonId}/${stepId} prompt`).toBe(promptHash);
      expect(hash(JSON.stringify(widget.options.map(({ id, label, correct, feedback }) => ({ id, label, correct, feedback })).sort((left, right) => left.id.localeCompare(right.id)))), `${lessonId}/${stepId} options`).toBe(optionsHash);
      expect(widget.options.map((option) => option.id).sort(), `${lessonId}/${stepId} IDs`).toEqual(["o0", "o1", "o2", "o3"]);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id), `${lessonId}/${stepId} correct ID`).toEqual(["o0"]);
      for (const option of widget.options)
        expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct);
      const correctIndex = widget.options.findIndex((option) => option.correct);
      expect(correctIndex, `${lessonId}/${stepId}`).toBe(index % 3 + 1);
      return correctIndex;
    });

    expect(correctIndices.filter((index) => index === 1)).toHaveLength(3);
    expect(correctIndices.filter((index) => index === 2)).toHaveLength(3);
    expect(correctIndices.filter((index) => index === 3)).toHaveLength(3);
  });

  it("keeps every targeted Shapes Build item schema-valid", () => {
    expect(lessons).toHaveLength(14);
    for (const [lessonId, stepId] of contracts) {
      const step = lessons.find((lesson) => lesson.id === lessonId)?.steps.find((candidate) => candidate.id === stepId);
      expect(step?.widget?.type, `${lessonId}/${stepId}`).toBe("mcq");
    }
  });
});
