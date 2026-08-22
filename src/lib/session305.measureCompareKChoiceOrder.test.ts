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
  // Re-pinned: options hash for k1/ch1 updated after S327_ASSESS_A4.md kmd-01-03 "referential-mismatch"
  // fix (o2 label "The bags weigh the same" -> "The two sides weigh the same"; the bear/seesaw scenario
  // never mentions bags — a copy-paste artifact from kmd-01-01/ch1's bag scenario). Prompt unchanged.
  ["kmd-01-03", "k1", null, "68cab8a4f7bf7e9437cd37605709cd1db5375e87951546d1195420118f8ab3dd", "17b416ff21624c63c8307fa5a44fb4c0d2b6e7cf8db079505e9934a0a90ed9c0"],
  ["kmd-01-03", "k3", null, "7eeb4af55450e37cd156be48f077d780ed6d8228d7b746aa31b2a7a3080002f0", "d0760b63c6b68e81054ea69baa2d97e86712e4ab6b524e1f2639960b416043f7"],
  // Re-pinned: same o2 "bags" -> "two sides" fix as k1 above (S327_ASSESS_A4.md kmd-01-03).
  ["kmd-01-03", "ch1", null, "7f245788014aa127a655af8c595436902b4be8aca1f34cd1fb4ca7fd985ead16", "8da393a78e8d92c606219073cb8525fba4752ee6a4dd9f74f91706e00d9b58e9"],
  ["kmd-01-04", "k1", null, "2ab299a870180f600c2575b951231a9d060450b69d31791afc5fa300c54545d4", "426c2b1bd475a8cfbf0828c0169cd8778ede7c866122788eb78701e1ed73731a"],
  // Re-pinned: signed S320-IMPL-kmd-01-04 replaced this ch1 byte-duplicate of
  // kmd-01-01/k3 with a new scale-vs-measuring-cup question (S326-R1 reconcile).
  ["kmd-01-04", "ch1", null, "a82421c71d42d1d332df8cc994cbe23f815a77e88db77a1217e8bc5953a13b0a", "fee9e95bf1c944478e2dd7d06c629818ffa5fd59e5ee362afd0c4794bc8db68c"],
  ["kmd-02-01", "k3", null, "e097de9a09636062739866923f53772584bfcc1c78f2cd8fdb681a3c1ccf2538", "4ca8a17701842e246102367814fd1a5bb22a79c91870529a2fe05a4f04149456"],
  // Re-pinned: signed S320-IMPL-kmd-02-02 dedup rewrite (S326-R1 reconcile).
  ["kmd-02-02", "k2", null, "1ff6fe128cd43778d210a88a0a48c426b3a4d15c6f8b48d94cc6dfc0ee8f88e7", "9a0df8f003d0f5a865163d0725bfae425f63e8cf7a6a52dd9e1b93acbcb4a100"],
  // Re-pinned: signed S320-IMPL-kmd-02-02 dedup rewrite (S326-R1 reconcile).
  ["kmd-02-02", "k3", null, "dd56b3d9ad314600231546172e3d9d0fb68bead1dc33d21b7a5685704b578ef5", "3c9049eb4272c1226dc19b41dfb305a5fecbee67d64654cfa72947de36b4811e"],
  // Re-pinned: signed S320-IMPL-kmd-02-02 dedup rewrite (S326-R1 reconcile).
  ["kmd-02-02", "ch1", null, "4c64229d688ca66a69a8ba393fa3394b3ab0de9c1a745b8f552bf551e3fc0eb9", "9cae5e3fc73efcef31d49c95c87de7809e44cf3c5d9e69d98a50968d1a992f7b"],
  // Re-pinned: signed S320-IMPL-kmd-02-03 dedup rewrite (S326-R1 reconcile).
  ["kmd-02-03", "k2", null, "a9dcef55f52f77ffcf17716c453d06af7420fb40684387ecf0b6573bda2f04c2", "90c169dc1385a794425a782c4a18dc6bc50a5e1c6afb52e6c1f93d562d3967af"],
  // Re-pinned: signed S320-IMPL-kmd-02-04 dedup rewrite (S326-R1 reconcile).
  ["kmd-02-04", "k2", null, "52a63c7ae9d9d1df4b820a3a5bcc180ddb7f1f2680d66e25872e1c03b2e83a9b", "333c6d444339d9cbcdcdd1e11797acfa192214191e03419de18bad4e6ecbe8e2"],
  ["kmd-03-01", "k1", null, "10e9b80705fa662a1da63bc66e93eecceb01a3e08932901a80065178c8963030", "2dcaa4901751fa2ed3f02206f925253cff5091ac1dbd28be7739195b69a0a5b3"],
  ["kmd-03-01", "k2", null, "3be57bfc1e5a82a181f2c059da233b35cfd8ccfed8124495adc3e4287c1c7f55", "4e68099d3546762a1597960a4cc56760b4a8e14649475d78c9bce79053193220"],
  ["kmd-03-01", "ch1", null, "151b471a0c41fa45cf5c9ac949fffeda9eb79d1abc41a055899736b95c5712c6", "7dfac59bd9f6db40c45956bf869cd3b464a7690b4b0af08deceeb347d39016fa"],
  // Re-pinned: S330 backlog triage shortened o1's label "Which pile should end up bigger" ->
  // "Which pile should be bigger" (was the outlier in a cue-resistance choice-length spread of 10;
  // course cap is 8 — see session253.measureCompareKCourseIntegrity.test.tsx). Same misconception,
  // same correctness, same feedback; prompt untouched, so promptHash is unchanged from the prior
  // S320-IMPL-kmd-03-02 dedup rewrite (S326-R1 reconcile) pin.
  ["kmd-03-02", "k1", null, "527088af457f097f94e52460742057a3bb11cfbc2d7a953233f825635c9c0954", "fb67b453f4f4904274c3deaf831231dae14f10cc5fd13ffb2faa36d3101b5732"],
  ["kmd-03-02", "ch1", null, "b3dadc80485e1bb1489823ad9657c626cc23cb49d71595802d31104b78c79c4e", "0fa6e5cc47de4c7f0446e7f5750fb8cb5c4c849e8246535a7a8761f85e1adc65"],
  ["kmd-03-03", "k3", null, "5e7707a036e32735a2ccccc673910af41d67888701dab986da0c3d8b9132f8b9", "bc180922852ea229364f7605a3eaa682ce6967d1014329b620df4ec738cf1e81"],
  ["kmd-03-04", "k2", null, "b162b66ae2c9de3580b56a21e5c516cc96d4188a04cafd34c078f12b085c6cfa", "c449f98901cd6132c5a99d7dd5e7bfe2f28fc48d807ed92fda08a9d95cca2f37"],
  // Re-pinned: signed S320-IMPL-kmd-03-04 dedup rewrite (S326-R1 reconcile).
  ["kmd-03-04", "ch1", null, "9001896876b848fbb24e2d019b9a9e8718f6c08022959cc6529a0b924882ec7a", "541b9f8608f49c0cc11bc4056bcf253a347cd955d04b7b29565a66f3f3468dbc"],
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
