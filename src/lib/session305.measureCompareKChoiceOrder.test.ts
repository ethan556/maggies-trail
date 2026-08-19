import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

const directory = join(process.cwd(), "content", "courses", "measure-compare-k", "lessons");
const lessons = readdirSync(directory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));

const contracts = [
  ["kmd-01-01", "k1", null, "2d2d5be962d3ee36e2af0aafb06585f3a012e3eb144f09eedf42ef8c2961e8a7", "f7e2dc3a31de62bf7b3e9fbe49eb1acaa54d57ac30685eee673fc922b2350531"],
  ["kmd-01-01", "k3", null, "b16e180be7fc73416eaef4dc4fd456a3a68ed3a526b756cda6fd61486cd4ebe8", "331c79a09fd272473ea513edabaadc0da6f69e98aaf599620ff1f91e97de38d0"],
  ["kmd-01-01", "ch1", null, "8c5e176a3ee7195f93ba1ed402c9ff5f0a192c9e8eef71916d887fbfabac043b", "061998a65c49af96978358036948aff3088205092b0a9f5384974c90d4d3b4e4"],
  ["kmd-01-02", "k1", null, "154715abe2489b5027d03f891c2ae1d12b06846b6b5d06abae6b3b966ad62be7", "67f6962147a7b2bdcae5624434498c498fbe711566a69a71f39f4e35daa888a1"],
  ["kmd-01-03", "k1", null, "68cab8a4f7bf7e9437cd37605709cd1db5375e87951546d1195420118f8ab3dd", "8070f13ab992407700f7000ca75cd5bf6d47730e8a84a436796abe0eb90dfce5"],
  ["kmd-01-03", "k3", null, "7eeb4af55450e37cd156be48f077d780ed6d8228d7b746aa31b2a7a3080002f0", "d0760b63c6b68e81054ea69baa2d97e86712e4ab6b524e1f2639960b416043f7"],
  ["kmd-01-03", "ch1", null, "7f245788014aa127a655af8c595436902b4be8aca1f34cd1fb4ca7fd985ead16", "b3aef0e9fa0fa830d24a69881a58fa3cd11682c9daf82affd3c297205b3cb06c"],
  ["kmd-01-04", "k1", null, "2ab299a870180f600c2575b951231a9d060450b69d31791afc5fa300c54545d4", "426c2b1bd475a8cfbf0828c0169cd8778ede7c866122788eb78701e1ed73731a"],
  ["kmd-01-04", "ch1", null, "b16e180be7fc73416eaef4dc4fd456a3a68ed3a526b756cda6fd61486cd4ebe8", "331c79a09fd272473ea513edabaadc0da6f69e98aaf599620ff1f91e97de38d0"],
  ["kmd-02-01", "k3", null, "e097de9a09636062739866923f53772584bfcc1c78f2cd8fdb681a3c1ccf2538", "4ca8a17701842e246102367814fd1a5bb22a79c91870529a2fe05a4f04149456"],
  ["kmd-02-02", "k2", null, "7f245788014aa127a655af8c595436902b4be8aca1f34cd1fb4ca7fd985ead16", "b3aef0e9fa0fa830d24a69881a58fa3cd11682c9daf82affd3c297205b3cb06c"],
  ["kmd-02-02", "k3", null, "7eeb4af55450e37cd156be48f077d780ed6d8228d7b746aa31b2a7a3080002f0", "d0760b63c6b68e81054ea69baa2d97e86712e4ab6b524e1f2639960b416043f7"],
  ["kmd-02-02", "ch1", null, "68cab8a4f7bf7e9437cd37605709cd1db5375e87951546d1195420118f8ab3dd", "8070f13ab992407700f7000ca75cd5bf6d47730e8a84a436796abe0eb90dfce5"],
  ["kmd-02-03", "k2", null, "e097de9a09636062739866923f53772584bfcc1c78f2cd8fdb681a3c1ccf2538", "4ca8a17701842e246102367814fd1a5bb22a79c91870529a2fe05a4f04149456"],
  ["kmd-02-04", "k2", null, "154715abe2489b5027d03f891c2ae1d12b06846b6b5d06abae6b3b966ad62be7", "67f6962147a7b2bdcae5624434498c498fbe711566a69a71f39f4e35daa888a1"],
  ["kmd-03-01", "k1", null, "10e9b80705fa662a1da63bc66e93eecceb01a3e08932901a80065178c8963030", "2dcaa4901751fa2ed3f02206f925253cff5091ac1dbd28be7739195b69a0a5b3"],
  ["kmd-03-01", "k2", null, "3be57bfc1e5a82a181f2c059da233b35cfd8ccfed8124495adc3e4287c1c7f55", "4e68099d3546762a1597960a4cc56760b4a8e14649475d78c9bce79053193220"],
  ["kmd-03-01", "ch1", null, "151b471a0c41fa45cf5c9ac949fffeda9eb79d1abc41a055899736b95c5712c6", "7dfac59bd9f6db40c45956bf869cd3b464a7690b4b0af08deceeb347d39016fa"],
  ["kmd-03-02", "k1", null, "3be57bfc1e5a82a181f2c059da233b35cfd8ccfed8124495adc3e4287c1c7f55", "4e68099d3546762a1597960a4cc56760b4a8e14649475d78c9bce79053193220"],
  ["kmd-03-02", "ch1", null, "b3dadc80485e1bb1489823ad9657c626cc23cb49d71595802d31104b78c79c4e", "0fa6e5cc47de4c7f0446e7f5750fb8cb5c4c849e8246535a7a8761f85e1adc65"],
  ["kmd-03-03", "k3", null, "5e7707a036e32735a2ccccc673910af41d67888701dab986da0c3d8b9132f8b9", "bc180922852ea229364f7605a3eaa682ce6967d1014329b620df4ec738cf1e81"],
  ["kmd-03-04", "k2", null, "b162b66ae2c9de3580b56a21e5c516cc96d4188a04cafd34c078f12b085c6cfa", "c449f98901cd6132c5a99d7dd5e7bfe2f28fc48d807ed92fda08a9d95cca2f37"],
  ["kmd-03-04", "ch1", null, "5e7707a036e32735a2ccccc673910af41d67888701dab986da0c3d8b9132f8b9", "bc180922852ea229364f7605a3eaa682ce6967d1014329b620df4ec738cf1e81"],
] as const;

const hash = (value: string) => createHash("sha256").update(value).digest("hex");

describe("S305 Measure and Compare Kindergarten choice-order repair", () => {
  it("removes the course-wide fixed-answer position while retaining every semantic and evaluator contract", () => {
    expect(contracts).toHaveLength(23);
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

    expect(correctIndices.filter((index) => index === 1)).toHaveLength(8);
    expect(correctIndices.filter((index) => index === 2)).toHaveLength(8);
    expect(correctIndices.filter((index) => index === 3)).toHaveLength(7);
  });

  it("keeps the full main-sequence MCQ inventory schema-valid", () => {
    expect(lessons).toHaveLength(12);
    const actualKeys = lessons.flatMap((lesson) => lesson.steps
      .filter((step) => step.widget?.type === "mcq")
      .map((step) => `${lesson.id}/${step.id}`));
    expect(actualKeys).toEqual(contracts.map(([lessonId, stepId]) => `${lessonId}/${stepId}`));
  });
});
