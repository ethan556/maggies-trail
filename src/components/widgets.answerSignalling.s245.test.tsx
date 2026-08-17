// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  WidgetSpec,
  compoundEventChoiceCorrect,
  shapeHierarchyChoiceCorrect,
  shapeHierarchyChoiceEvidence,
  shapeHierarchyTriangleLabels,
  type TCompoundEventLab,
  type TShapeHierarchyLab,
  type TWidget,
} from "@/lib/schema";
import { actionsFor, describeWidgetState } from "@/lib/describeState";
import { evaluate } from "@/lib/evaluate";
import { WidgetRenderer, type StageTone } from "./widgets";

const compound = WidgetSpec.parse({
  type: "compoundEventLab",
  prompt: "Flip heads and roll an even number.",
  mode: "probability",
  stages: [
    { label: "Coin", outcomes: ["H", "T"], favourable: [0] },
    { label: "Die", outcomes: ["1", "2", "3", "4", "5", "6"], favourable: [1, 3, 5] },
  ],
  choices: [
    { id: "fraction-quarter", label: "1/4", num: 1, den: 4, feedback: "correct" },
    { id: "fraction-half", label: "1/2", num: 1, den: 2, feedback: "one event only" },
    { id: "fraction-twelfth", label: "1/12", num: 1, den: 12, feedback: "one pair only" },
  ],
  fallbackFeedback: "Use favourable over total.",
  successFeedback: "correct",
});
if (compound.type !== "compoundEventLab") throw new Error("bad compound fixture");

const hierarchy = WidgetSpec.parse({
  type: "shapeHierarchyLab",
  prompt: "A rectangle is a square. Always, sometimes, or never?",
  mode: "verdict",
  nodes: [
    { id: "rectangle", label: "rectangle", attributes: ["4 right angles"] },
    { id: "square", label: "square", attributes: ["4 equal sides"] },
  ],
  edges: [],
  relation: "overlap",
  subjectLabel: "rectangle",
  predicateLabel: "square",
  witness: "A 4-by-4 rectangle is a square.",
  counterexample: "A 5-by-2 rectangle is not a square.",
  choices: [
    { id: "verdict-sometimes", label: "Sometimes", claim: "sometimes", feedback: "correct", evidenceKind: "example", evidenceText: "A square is both, but a long rectangle is not.", highlightNodeIds: ["rectangle", "square"] },
    { id: "verdict-always", label: "Always", claim: "always", feedback: "counterexample", evidenceKind: "counterexample", evidenceText: "A 5-by-2 rectangle breaks this claim.", highlightNodeIds: ["rectangle"] },
    { id: "verdict-never", label: "Never", claim: "never", feedback: "witness", evidenceKind: "example", evidenceText: "A 4-by-4 rectangle breaks this claim.", highlightNodeIds: ["square"] },
  ],
  fallbackFeedback: "Test both examples.",
  successFeedback: "correct",
});
if (hierarchy.type !== "shapeHierarchyLab") throw new Error("bad hierarchy fixture");

function Harness({ spec, tone = "neutral", onEvent = vi.fn(), onValue = vi.fn(), seed }: {
  spec: TCompoundEventLab | TShapeHierarchyLab;
  tone?: StageTone;
  onEvent?: (event: unknown) => void;
  onValue?: (value: unknown) => void;
  seed?: string;
}) {
  const [value, setValue] = useState<unknown>();
  return <WidgetRenderer spec={spec} value={value} disabled={false} tone={tone} seed={seed} onEvent={onEvent} onChange={(next) => { setValue(next); onValue(next); }} />;
}

function authoredLabs(): Array<TCompoundEventLab | TShapeHierarchyLab> {
  const found: Array<TCompoundEventLab | TShapeHierarchyLab> = [];
  const walkValue = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    if (record.type === "compoundEventLab" || record.type === "shapeHierarchyLab") {
      const parsed = WidgetSpec.parse(record);
      if (parsed.type === "compoundEventLab" || parsed.type === "shapeHierarchyLab") found.push(parsed);
    }
    for (const child of Object.values(record)) walkValue(child);
  };
  const walkDir = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walkDir(path);
      else if (path.endsWith(".json")) walkValue(JSON.parse(readFileSync(path, "utf8")));
    }
  };
  walkDir("content/courses");
  return found;
}

afterEach(cleanup);

describe("S245 P0 answer-signalling canaries", () => {
  it("keeps compound-event derived values and correctness events out of active work", () => {
    const onEvent = vi.fn();
    const onValue = vi.fn();
    render(<Harness spec={compound} onEvent={onEvent} onValue={onValue} />);
    expect(screen.getByTestId("cel-derived-readout").textContent).toContain("2 × 6 = ?");
    expect(screen.getByTestId("cel-derived-readout").textContent).not.toContain("3/12");
    expect(screen.getByRole("img", { name: /marked for you to count/i }).getAttribute("aria-label")).not.toMatch(/12|3 favourable/i);
    fireEvent.click(screen.getByRole("button", { name: "1/12" }));
    expect(onValue).toHaveBeenLastCalledWith("fraction-twelfth");
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ control: "claim", dir: "neutral", state: { choice: "fraction-twelfth", mode: "probability" } }));
    const spoken = describeWidgetState(compound, "fraction-twelfth", "neutral") ?? "";
    expect(spoken).not.toMatch(/12 ordered|3 satisfy|matches the model|does not match/i);
    expect(actionsFor("compoundEventLab")).toMatch(/computed total and probability appear after the answer is settled/i);
  });

  it("reveals the compound-event derivation and evaluator-aligned claim only after settlement", () => {
    render(<Harness spec={compound} tone="info" />);
    fireEvent.click(screen.getByRole("button", { name: "1/12" }));
    expect(screen.getByTestId("cel-derived-readout").textContent).toContain("2 × 6 = 12");
    expect(screen.getByTestId("cel-derived-readout").textContent).toContain("3/12");
    expect(screen.getByTestId("cel-ghost").textContent).toContain("1/4");
    expect(describeWidgetState(compound, "fraction-twelfth", "info")).toMatch(/12 ordered outcomes; 3 satisfy.*does not match/i);
  });

  it("keeps hierarchy evidence, truth styling and event direction neutral before Check", () => {
    const onEvent = vi.fn();
    const onValue = vi.fn();
    render(<Harness spec={hierarchy} onEvent={onEvent} onValue={onValue} />);
    expect(document.body.textContent).not.toContain(hierarchy.witness);
    expect(document.body.textContent).not.toContain(hierarchy.counterexample);
    fireEvent.click(screen.getByRole("button", { name: /Always/ }));
    expect(onValue).toHaveBeenLastCalledWith("verdict-always");
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ control: "shape-claim", dir: "neutral", state: { claim: "always" } }));
    const evidence = screen.getByTestId("sh-evidence");
    expect(evidence.textContent).toContain("Build your claim from the fixed givens");
    expect(evidence.textContent).not.toContain("5-by-2");
    expect(evidence.className).not.toMatch(/leaf|berry/);
    expect(describeWidgetState(hierarchy, "verdict-always", "neutral")).not.toContain("5-by-2");
    expect(actionsFor("shapeHierarchyLab")).toMatch(/exact evidence waits until the answer is settled/i);
  });

  it("reveals hierarchy evidence and the evaluator-backed answer after settlement", () => {
    render(<Harness spec={hierarchy} tone="info" />);
    fireEvent.click(screen.getByRole("button", { name: /Always/ }));
    expect(screen.getByTestId("sh-evidence").textContent).toContain("5-by-2 rectangle breaks this claim");
    expect(screen.getByTestId("sh-evidence").className).toContain("berry");
    expect(screen.getByTestId("shlab-ghost").textContent).toContain("Sometimes");
    expect(screen.getByTestId("sh-verdict-evidence").textContent).toContain(hierarchy.witness);
    expect(describeWidgetState(hierarchy, "verdict-always", "info")).toContain("5-by-2 rectangle breaks this claim");
  });

  it("uses deterministic per-question option order while preserving authored choice IDs", () => {
    for (const spec of [compound, hierarchy]) {
      const orderFor = (seed: string) => {
        const view = render(<Harness spec={spec} seed={seed} />);
        const order = Array.from(view.container.querySelectorAll<HTMLElement>("[data-choice-id]"), (node) => node.dataset.choiceId).join("|");
        view.unmount();
        return order;
      };
      expect(orderFor("same-question")).toBe(orderFor("same-question"));
      expect(new Set(Array.from({ length: 8 }, (_, index) => orderFor(`question-${index}`))).size).toBeGreaterThan(1);
    }
  });

  it("audits all 34 authored placements and keeps helper, evaluator and feedback truth aligned", () => {
    const labs = authoredLabs();
    expect(labs).toHaveLength(34);
    expect(labs.filter((lab) => lab.type === "shapeHierarchyLab")).toHaveLength(26);
    expect(labs.filter((lab) => lab.type === "compoundEventLab")).toHaveLength(8);
    for (const lab of labs) {
      if (lab.type === "compoundEventLab") {
        expect(lab.choices.filter((choice) => compoundEventChoiceCorrect(lab, choice)), `${lab.type}: ${lab.prompt}`).toHaveLength(1);
        for (const choice of lab.choices) {
          const result = evaluate(lab as TWidget, choice.id);
          expect(result.correct, `${lab.type}: ${lab.prompt} / ${choice.id}`).toBe(compoundEventChoiceCorrect(lab, choice));
          expect(result.feedback.trim().length).toBeGreaterThan(0);
        }
      } else {
        expect(lab.choices.filter((choice) => shapeHierarchyChoiceCorrect(lab, choice)), `${lab.type}: ${lab.prompt}`).toHaveLength(1);
        for (const choice of lab.choices) {
          const result = evaluate(lab as TWidget, choice.id);
          expect(result.correct, `${lab.type}: ${lab.prompt} / ${choice.id}`).toBe(shapeHierarchyChoiceCorrect(lab, choice));
          expect(result.feedback.trim().length).toBeGreaterThan(0);
          if (lab.mode === "triangle") {
            const evidence = shapeHierarchyChoiceEvidence(lab, choice);
            for (const label of shapeHierarchyTriangleLabels(lab)) expect(evidence).toContain(label);
            if (!result.correct && choice.claim.split("+").some((label) => shapeHierarchyTriangleLabels(lab).includes(label))) {
              expect(evidence).not.toMatch(/contradicts? the .* claim/i);
            }
          }
        }
      }
    }
  });
});
