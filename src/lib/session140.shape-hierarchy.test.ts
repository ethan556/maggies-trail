import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WidgetSpec, shapeHierarchyChoiceCorrect, shapeHierarchyTriangleLabels, widgetIntegrityErrors, type TShapeHierarchyLab } from "./schema";
import { canCheck, correctAnswerText, evaluate } from "./evaluate";
import { variantForGenForm } from "./variants";

const verdictFixture = (overrides: Partial<TShapeHierarchyLab> = {}): TShapeHierarchyLab => WidgetSpec.parse({
  type: "shapeHierarchyLab",
  prompt: "A rectangle is a square. Always, sometimes, or never?",
  mode: "verdict",
  nodes: [{ id: "rectangle", label: "rectangle", attributes: ["4 right angles"] }, { id: "square", label: "square", attributes: ["rectangle + 4 equal sides"] }],
  edges: [["rectangle", "square"]],
  relation: "overlap",
  subjectLabel: "rectangle",
  predicateLabel: "square",
  witness: "A 4-by-4 rectangle is a square.",
  counterexample: "A 5-by-2 rectangle is not a square.",
  choices: [
    { id: "a", label: "Sometimes", claim: "sometimes", feedback: "correct", evidenceKind: "example", evidenceText: "One example and one counterexample establish overlap.", highlightNodeIds: [] },
    { id: "b", label: "Always", claim: "always", feedback: "always wrong", evidenceKind: "counterexample", evidenceText: "The 5-by-2 rectangle defeats always.", highlightNodeIds: [] },
    { id: "c", label: "Never", claim: "never", feedback: "never wrong", evidenceKind: "example", evidenceText: "The 4-by-4 rectangle defeats never.", highlightNodeIds: [] }
  ],
  fallbackFeedback: "fallback",
  successFeedback: "success",
  ...overrides
}) as TShapeHierarchyLab;

const lesson = (id: string) => JSON.parse(readFileSync(join(process.cwd(), `content/courses/coordinate-geometry/lessons/${id}.json`), "utf8"));

describe("Session 140 shapeHierarchyLab mathematical contract", () => {
  it("derives verdict truth from subset, overlap, and disjoint relations", () => {
    const overlap = verdictFixture();
    expect(overlap.choices.filter((choice) => shapeHierarchyChoiceCorrect(overlap, choice))).toHaveLength(1);
    expect(evaluate(overlap, "a")).toEqual({ correct: true, feedback: "success" });
    expect(evaluate(overlap, "b")).toEqual({ correct: false, feedback: "always wrong" });
    expect(canCheck(overlap, "a")).toBe(true);
    expect(canCheck(overlap, "missing")).toBe(false);
    expect(correctAnswerText(overlap)).toBe("Sometimes");

    const subset = verdictFixture({ relation: "subset", witness: "Every square has four equal sides.", counterexample: undefined, choices: [
      { id: "a", label: "Always", claim: "always", feedback: "correct", evidenceKind: "path", evidenceText: "The subject set is contained in the predicate set.", highlightNodeIds: [] },
      { id: "b", label: "Sometimes", claim: "sometimes", feedback: "wrong", evidenceKind: "counterexample", evidenceText: "No subject counterexample exists.", highlightNodeIds: [] },
      { id: "c", label: "Never", claim: "never", feedback: "wrong", evidenceKind: "path", evidenceText: "The family path proves membership.", highlightNodeIds: [] }
    ] });
    expect(subset.choices.find((choice) => shapeHierarchyChoiceCorrect(subset, choice))?.claim).toBe("always");

    const disjoint = verdictFixture({ relation: "disjoint", witness: undefined, counterexample: undefined, blocker: "Three 60° angles cannot include 90°.", choices: [
      { id: "a", label: "Never", claim: "never", feedback: "correct", evidenceKind: "blocker", evidenceText: "The defining angle conditions conflict.", highlightNodeIds: [] },
      { id: "b", label: "Sometimes", claim: "sometimes", feedback: "wrong", evidenceKind: "counterexample", evidenceText: "Scaling preserves the blocker.", highlightNodeIds: [] },
      { id: "c", label: "Always", claim: "always", feedback: "wrong", evidenceKind: "blocker", evidenceText: "The blocker excludes every example.", highlightNodeIds: [] }
    ] });
    expect(disjoint.choices.find((choice) => shapeHierarchyChoiceCorrect(disjoint, choice))?.claim).toBe("never");
  });

  it("independently classifies side, angle, inclusive, and dual triangle families", () => {
    expect(shapeHierarchyTriangleLabels({ triangleSides: [5, 5, 8], triangleQuestion: "side" })).toEqual(["isosceles"]);
    expect(shapeHierarchyTriangleLabels({ triangleAngles: [90, 45, 45], triangleQuestion: "angle" })).toEqual(["right"]);
    expect(shapeHierarchyTriangleLabels({ triangleSides: [7, 7, 7], triangleQuestion: "sideInclusive" })).toEqual(["equilateral", "isosceles"]);
    expect(shapeHierarchyTriangleLabels({ triangleSides: [3, 4, 5], triangleAngles: [30, 60, 90], triangleQuestion: "dual" })).toEqual(["right", "scalene"]);
  });

  it("rejects degenerate triangles, bad angle sums, duplicate claims, missing evidence, and invalid family edges", () => {
    const triangle = WidgetSpec.parse({ type: "shapeHierarchyLab", prompt: "classify", mode: "triangle", nodes: [{ id: "t", label: "triangle", attributes: [] }], edges: [], triangleSides: [2, 3, 5], triangleQuestion: "side", choices: [
      { id: "a", label: "scalene", claim: "scalene", feedback: "a", evidenceKind: "classification", evidenceText: "a", highlightNodeIds: [] },
      { id: "b", label: "isosceles", claim: "isosceles", feedback: "b", evidenceKind: "counterexample", evidenceText: "b", highlightNodeIds: [] },
      { id: "c", label: "equilateral", claim: "equilateral", feedback: "c", evidenceKind: "counterexample", evidenceText: "c", highlightNodeIds: [] }
    ], fallbackFeedback: "fallback", successFeedback: "success" });
    expect(widgetIntegrityErrors(triangle).join(" ")).toMatch(/non-degenerate triangle/);

    const badAngles = WidgetSpec.parse({ ...triangle, triangleSides: undefined, triangleAngles: [90, 60, 40], triangleQuestion: "angle" });
    expect(widgetIntegrityErrors(badAngles).join(" ")).toMatch(/sum to 180/);

    const missingWitness = verdictFixture({ relation: "subset", witness: undefined, counterexample: undefined });
    expect(widgetIntegrityErrors(missingWitness).join(" ")).toMatch(/witness is required/);

    const badEdge = verdictFixture({ edges: [["rectangle", "missing"]] });
    expect(widgetIntegrityErrors(badEdge).join(" ")).toMatch(/references a missing node/);
  });

  it("converts exactly nineteen classification experiences while preserving the two arithmetic steps", () => {
    const docs = [lesson("cg-03-01"), lesson("cg-03-03"), lesson("cg-04-02")];
    const causal = docs.flatMap((doc) => [...doc.steps, ...doc.remedials.map((route: { check: unknown }) => route.check)]).filter((step: { widget?: { type?: string } }) => step.widget?.type === "shapeHierarchyLab");
    expect(causal).toHaveLength(19);
    for (const step of causal) {
      const spec = WidgetSpec.parse(step.widget);
      expect(spec.type).toBe("shapeHierarchyLab");
      expect(widgetIntegrityErrors(spec)).toEqual([]);
      if (spec.type === "shapeHierarchyLab") expect(spec.choices.filter((choice) => shapeHierarchyChoiceCorrect(spec, choice))).toHaveLength(1);
    }
    expect(docs[0].steps.find((step: { id: string }) => step.id === "i2").widget.type).toBe("numeric");
    expect(docs[1].steps.find((step: { id: string }) => step.id === "k2").widget.type).toBe("numeric");
  });

  it("keeps all ten seeded forms on the causal surface across bands", () => {
    const forms = [
      ["shape-hierarchy", "cgInheritProperty"], ["shape-hierarchy", "cgInheritanceDirection"], ["shape-hierarchy", "cgInheritanceChain"],
      ["attributes", "cgTriangleAngleFamily"], ["attributes", "cgTriangleSideHierarchy"], ["attributes", "cgTriangleDualLabel"], ["attributes", "cgEquilateralRightNever"],
      ["shape-hierarchy", "cgSquareRhombusAlways"], ["shape-hierarchy", "cgParallelogramTrapezoidVerdict"], ["shape-hierarchy", "cgRhombusRectangleSometimes"]
    ] as const;
    for (const [gen, form] of forms) for (const band of ["support", "core", "stretch"] as const) for (let seed = 0; seed < 24; seed += 1) {
      const problem = variantForGenForm(gen, form, `s140-${seed}`, band);
      expect(problem?.widget.type).toBe("shapeHierarchyLab");
      if (!problem || problem.widget.type !== "shapeHierarchyLab") continue;
      const lab = problem.widget;
      expect(widgetIntegrityErrors(lab)).toEqual([]);
      expect(lab.choices.filter((choice) => shapeHierarchyChoiceCorrect(lab, choice))).toHaveLength(1);
    }
  });
});
