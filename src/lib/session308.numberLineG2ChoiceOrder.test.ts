import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

const directory = join(process.cwd(), "content", "courses", "number-line-g2", "lessons");
const lessons = readdirSync(directory).filter((file) => file.endsWith(".json")).sort().map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));
const contracts = [
  ["g2l-01-01", "k1", null, "bb6144ee59e1b4187825649984db98c49e3880f906ab9b3deed6216c119c811d", "7b68e46e883fa2345c2be0bbc7622e456b2a28b1cbbe71bc03a09121a80f2d3b"],
  ["g2l-01-01", "k3", null, "fa49004e4b38bd580777cf4b6c3e1610b9c0d1893914a43821af23cfa8030c71", "9c5b22772dee90d73988f5e9560f7500fb2a369d8f1e24d722b3b20b7f5c870e"],
  ["g2l-01-02", "k1", null, "ecf24446811b4c3689aa8f91f4eaee8390c6479bdadcba6ce75f5a62753d49fe", "3bd16db52ee7ff4640fa1c7dbe78c8f240e79fc553c2bca8bd11c4712a627d3f"],
  ["g2l-01-02", "k3", null, "ac1b23b3ae66641bfe631cc64cb2b65c9edb7ee720068af0f9e2ac76f77ccf2f", "f7198ff30552b982e3a618401d62ec7d9a61136abba4022e8dec893866d69b50"],
  ["g2l-01-03", "k1", null, "050102b9b5f03e28b490b248518d3dac750b3e80994196a798bfba0b06742f14", "afbff423a475686ed4c26b5873e5681227ef1726fbdd6c4efdd03ee4ab4fdc76"],
  ["g2l-01-03", "k3", null, "55b692b690ff10d3c0f6fd937d95ee6b5411bc15ed1400535ee5cc8c07b05172", "470106b46432ef3980cbf153f149fb9bed07d1aaf7688cccf859a5b9e2515786"],
  ["g2l-02-01", "k3", "g2l-choice-add-33-20", "87c2014750f1ef61d0c94d57cfe8f272059927cc65c75e0c6129e8819226eece", "9ed287a742b16f87268634adfc82a28d730b911eb654c2504c84343ad1350636"],
  ["g2l-02-02", "k3", "g2l-choice-gap-54-34", "2da2478409a62cbcd5ecb00f683fa2623f7669ae35f5774a53d83c9132fddd9e", "c27348b58f8dbe12c45cb7c9fd6852c443b9701d923881f3cf1bad948509782a"],
  ["g2l-02-03", "k1", null, "5315844dfa805970105cbfc252a45a1c729ce6ef163231b1cd5b2a40b911825b", "856055f49781763acfc8fc9aa54012e88482b215c849772deea8935ddb86400b"],
  ["g2l-02-03", "ch1", null, "45467dc7a45ab556701db37da984acbefa8ecef126160945ff5609af4a94f708", "00e592deb5b4df05925f2717768cf511924cbc2f25646496c08bf2621ba5cdd1"],
  ["g2l-03-01", "k1", "g2l-choice-add-44-20", "c48c3858078ec4e3922aaa6460b81a7f72e7c44351b92e7df149491b82066117", "9724e3957616bd9748577eb3ee8b954130fbc3bb249042dd37536332908e5879"],
  ["g2l-03-01", "k3", "g2l-choice-add-45-20", "a816718eaabd467ddc630493745e4ca6e03cf6d978b4813d0c4a53bd314c2619", "17cd0c60f3411e1b8cb5b3c1b4bf32336e173d7212434026104d25edc0640001"],
  ["g2l-03-02", "k1", "g2l-choice-gap-53-33", "fb734644438a16181cd33350770bde1da9278a7bfda914e3cd19d835e7172e02", "c27348b58f8dbe12c45cb7c9fd6852c443b9701d923881f3cf1bad948509782a"],
  ["g2l-03-03", "k3", "g2l-choice-gap-43-33", "069463f13c0a1006bae5b1f99b4ee692acd59142b39dcaba7e8a58f18e2636f1", "c27348b58f8dbe12c45cb7c9fd6852c443b9701d923881f3cf1bad948509782a"],
] as const;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

describe("S308 Grade 2 Number Line choice-order repair", () => {
  it("removes the course-wide fixed-answer position while retaining every semantic and evaluator contract", () => {
    expect(contracts).toHaveLength(14);
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
      for (const option of widget.options) expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct);
      const correctIndex = widget.options.findIndex((option) => option.correct);
      expect(correctIndex, `${lessonId}/${stepId}`).toBe(index % 3 + 1);
      return correctIndex;
    });
    expect(correctIndices.filter((index) => index === 1)).toHaveLength(5);
    expect(correctIndices.filter((index) => index === 2)).toHaveLength(5);
    expect(correctIndices.filter((index) => index === 3)).toHaveLength(4);
  });
  it("keeps the exact full main-sequence MCQ inventory schema-valid", () => {
    expect(lessons).toHaveLength(10);
    const actualKeys = lessons.flatMap((lesson) => lesson.steps.filter((step) => step.widget?.type === "mcq").map((step) => `${lesson.id}/${step.id}`));
    expect(actualKeys).toEqual(contracts.map(([lessonId, stepId]) => `${lessonId}/${stepId}`));
  });
});
