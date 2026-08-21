import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

const directory = join(process.cwd(), "content", "courses", "counting-to-20-k", "lessons");
const lessons = readdirSync(directory).filter((file) => file.endsWith(".json")).sort().map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));
const contracts = [
  ["kc-01-01", "k3", null, "d7d2c8a346d71b99c0f6be587020da2510ae560909abb9f28924bb85a151aab6", "bb2a30dc0d0d2b714e5c0f0c9f3fb6e22bb92c9c28b63a51c79070ffc2bc1476"],
  ["kc-01-02", "k1", null, "267f80d5806b854ef0e0d698cdfacbd17d887be28e67448403da69b4991694b1", "a958601a651af0be05fdfc8f2e4f3cf51e4fe8c4e1c52ea744920b8fc15dc10e"],
  ["kc-02-01", "k2", null, "a65e7dbef8aae1a555e60fbbb9f2b08d7e4888eb30eded62d93fbce9e31e95ae", "75ac47f74f249c6e3fe008ea0976ce8c58ec7b4170c096074cad70158efa274e"],
  ["kc-02-02", "k2", null, "facbeaae95d9511341ca521b646d20abf7b1198a94622ec09c441723e0515138", "d4a3e33faed661d2411608cc8cbce1837524e83bc0459c819af8e0785862f034"],
  ["kc-02-03", "k2", null, "7d6ff5b812269bfe6d43fd9367b8c79fac9b1e9cc76f75410e3cc61575f1697d", "7eda6519551e176be5c0f6dccdb5caa114dc69b8d757bac1f8c72c0410a7544f"],
  ["kc-03-03", "k2", null, "3ed73532c29e9e610484ef29048595cd866c8c1af1db9769720d359a1b6e8363", "b478fb1f93e5abb367d0f7d17367ee46a4cb3e2468f800b43c620613e0b49eb4"],
  ["kc-03-03", "ch1", null, "1d494d3af85cfbfb607361f163c96956bfcf53c26b51d3d59ae32bebfdf16455", "676b236dad99a7bcfee3e2d9a98ff914ff1a62424fd251b3852cd7430ce782e0"],
  ["kc-04-01", "k3", null, "c887221d2ad4426e46c2c1ce1933bdd3b0190a301736589d7c965488bfb736b3", "d018a2b25a6ec5b4e03b783d25af551da6801216b3e6186e3439f69c3d8120e2"],
  // Re-pinned: signed S320-IMPL-A5-kc-04-01 fixed option c's backwards feedback
  // (misses the red, not blue); verified S321-V1-kc-04-01 (S326-R1 reconcile).
  ["kc-04-01", "ch1", null, "fe6dd6ec90b9b59ae57619918505fb657eef9e010468ad5b195ebf09a7d45945", "e8f4bde2fc200231e8ac7478589ebb04e54205af593727182f7ae667401724d4"],
  ["kc-04-02", "i2", null, "38a249d615deae13bd5ef7aa52ffa39f3e7536416ab2297ad771ec8e7f576228", "c2aa6ab2f219c6e1088421a63ce6a9742d4e3741c9bfbe908458e16ea47254c4"],
  ["kc-04-02", "k2", null, "16b2f09bec9845d5a954467890f670e6b94b16e8c2862900d8e714334eb51bc4", "de50ca48339f6c035abdf9f888723674a3ee3a3de8a8d3871795ec08126e7cf1"],
  ["kc-04-02", "k3", null, "de143ecfd64a4d60c3be6667f6f5fab631ea2a2b6a9bbae76ad952b80db4e742", "d02abf0679e6c61beb6f317736cbb2cd395a3310cf4676d6a33839f1a5cfe48e"],
  ["kc-04-03", "k2", null, "10d9ca434f7d0896576fd94393f348bf0c9a33299b7896aab87d730b648c3e7f", "96135ee840c1861cb4be8dda69203240616780dcbd15f4dc5f60a5c4306a88f6"],
  ["kc-04-03", "ch1", null, "1f760af301b66d03f6ad60d5888b331ca90c4b91609f5ce1656a14207bd2dc64", "d4f6c62ca99ed1d3f49ecf1f60070cbab42b9aea35c32209987b712a975cbfdd"],
  ["kc-05-01", "ch1", null, "fefc94b008d5dc54d3844e31c72770ae3ce1b550f9aeaae99e9500df39075abe", "2202fff1d809b4870746d2c7d8c94aa5cefff8c6092f10228e8ec25e377ad620"],
] as const;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

describe("S310 Kindergarten Counting choice-order repair", () => {
  it("removes the course-wide fixed-answer position while retaining every semantic and evaluator contract", () => {
    expect(contracts).toHaveLength(15);
    const correctIndices = contracts.map(([lessonId, stepId, figure, promptHash, optionsHash], index) => {
      const lesson = lessons.find((candidate) => candidate.id === lessonId);
      const step = lesson?.steps.find((candidate) => candidate.id === stepId);
      const widget = WidgetSpec.parse(step?.widget);
      expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
      if (widget.type !== "mcq") throw new Error("Expected MCQ");
      expect(step?.figure ?? null, `${lessonId}/${stepId} figure`).toBe(figure);
      expect(hash(widget.prompt), `${lessonId}/${stepId} prompt`).toBe(promptHash);
      expect(hash(JSON.stringify(widget.options.map(({ id, label, correct, feedback }) => ({ id, label, correct, feedback })).sort((left, right) => left.id.localeCompare(right.id)))), `${lessonId}/${stepId} options`).toBe(optionsHash);
      expect(widget.options.map((option) => option.id).sort(), `${lessonId}/${stepId} IDs`).toEqual(["a", "b", "c", "d"]);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id), `${lessonId}/${stepId} correct ID`).toEqual(["a"]);
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct);
      const correctIndex = widget.options.findIndex((option) => option.correct);
      expect(correctIndex, `${lessonId}/${stepId}`).toBe(index % 3 + 1);
      return correctIndex;
    });
    expect(correctIndices.filter((index) => index === 1)).toHaveLength(5);
    expect(correctIndices.filter((index) => index === 2)).toHaveLength(5);
    expect(correctIndices.filter((index) => index === 3)).toHaveLength(5);
  });
  it("keeps the exact full main-sequence MCQ inventory schema-valid", () => {
    expect(lessons).toHaveLength(13);
    const actualKeys = lessons.flatMap((lesson) => lesson.steps.filter((step) => step.widget?.type === "mcq").map((step) => `${lesson.id}/${step.id}`));
    expect(actualKeys).toEqual(contracts.map(([lessonId, stepId]) => `${lessonId}/${stepId}`));
  });
});
