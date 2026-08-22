// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  WidgetSpec,
  signedFractionChoiceCorrect,
  triangleClosureChoiceCorrect,
  type TWidget,
} from "@/lib/schema";
import { actionsFor, describeWidgetState } from "@/lib/describeState";
import { evaluate } from "@/lib/evaluate";
import { WidgetRenderer, type StageTone } from "./widgets";

const signed = WidgetSpec.parse({
  type: "signedFractionLab", prompt: "−3/4 ÷ 1/2 = ?", operation: "divide",
  left: { sign: -1, num: 3, den: 4 }, right: { sign: 1, num: 1, den: 2 }, form: "any",
  choices: [
    { id: "correct", label: "−3/2", sign: -1, num: 3, den: 2, path: "correct", feedback: "Correct." },
    { id: "sign", label: "3/2", sign: 1, num: 3, den: 2, path: "wrongSign", feedback: "Check the signs." },
    { id: "kept", label: "−3/8", sign: -1, num: 3, den: 8, path: "keptDivisor", feedback: "Use the reciprocal." },
  ], fallbackFeedback: "Check both channels.", successFeedback: "Correct.",
});

const closure = WidgetSpec.parse({
  type: "triangleClosureLab", prompt: "Can these beams close?", sides: [7, 8, 12], angleStart: 30, angleStep: 5, requiredMoves: 2,
  choices: [
    { id: "forms", label: "Yes", verdict: "forms", feedback: "Correct." },
    { id: "too-long", label: "No, the longest beam is too long", verdict: "does-not-form", feedback: "Compare the sums." },
    { id: "different", label: "No, the lengths differ", verdict: "does-not-form", feedback: "Different lengths can form a triangle." },
  ], fallbackFeedback: "Compare the beams.", successFeedback: "Correct.",
});

const slope = WidgetSpec.parse({
  type: "slopeTriangle", prompt: "Build a matching slope triangle.", ax: 2, ay: 1, bx: 6, by: 9,
  runStart: 2, riseStart: 4, gridMax: 10, legMax: 8,
  fallbackFeedback: "Compare rise over run.", successFeedback: "Correct.",
});

const constraint = WidgetSpec.parse({
  type: "triangleConstraintLab", prompt: "Which givens lock one triangle?", targetCriterion: "SAS", startCriterion: "SSA",
  sideA: 5, sideB: 8, targetAngle: 60, angleStart: 60, angleStep: 5, requiredMoves: 2,
  fallbackFeedback: "Test the givens.", successFeedback: "Correct.", criterionFeedback: "Check the criterion.",
  angleFeedback: "Check the angle.", evidenceFeedback: "Run another experiment.",
});

function Harness({ spec, tone = "neutral", seed, initialValue, onEvent = vi.fn() }: {
  spec: TWidget; tone?: StageTone; seed?: string; initialValue?: unknown; onEvent?: (event: unknown) => void;
}) {
  const [value, setValue] = useState<unknown>(initialValue);
  return <WidgetRenderer spec={spec} value={value} disabled={false} tone={tone} seed={seed} onEvent={onEvent} onChange={setValue} />;
}

function authoredLabs(): Array<{ spec: TWidget; path: string }> {
  const found: Array<{ spec: TWidget; path: string }> = [];
  const wanted = new Set(["signedFractionLab", "slopeTriangle", "triangleClosureLab", "triangleConstraintLab"]);
  const walkValue = (value: unknown, path: string) => {
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    if (typeof record.type === "string" && wanted.has(record.type)) found.push({ spec: WidgetSpec.parse(record), path });
    for (const child of Object.values(record)) walkValue(child, path);
  };
  const walkDir = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walkDir(path);
      else if (path.endsWith(".json")) walkValue(JSON.parse(readFileSync(path, "utf8")), path);
    }
  };
  walkDir("content/courses");
  return found;
}

afterEach(cleanup);

describe("S245 remaining P0 answer-signalling canaries", () => {
  it("keeps signed-fraction diagnosis and event direction hidden until settlement", () => {
    const onEvent = vi.fn();
    const view = render(<Harness spec={signed} seed="signed-a" onEvent={onEvent} />);
    fireEvent.click(screen.getByRole("button", { name: "3/2" }));
    expect(screen.getAllByText(/work out the result sign/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Your claim uses a positive sign/).className).not.toMatch(/leaf|berry/);
    expect(screen.queryByText(/expected negative|does not follow|not lowest terms/i)).toBeNull();
    expect(screen.getByRole("img", { name: /Numerators/ }).getAttribute("aria-label")).not.toMatch(/expected|result sign is negative/i);
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ control: "signed-fraction-claim", dir: "neutral" }));
    expect(describeWidgetState(signed, "sign", "neutral")).not.toMatch(/negative sign|magnitude 3\/2/i);
    view.unmount();
    render(<Harness spec={signed} tone="info" initialValue="sign" />);
    expect(screen.getByText(/Your claim uses a positive sign/).className).toMatch(/berry/);
    expect(screen.getByTestId("sfl-ghost").textContent).toContain("−3/2");
    expect(describeWidgetState(signed, "sign", "info")).toMatch(/negative sign and magnitude 3\/2/i);
  });

  it("keeps triangle-closure truth, target angle and process direction hidden until settlement", () => {
    const onEvent = vi.fn();
    const view = render(<Harness spec={closure} seed="closure-a" onEvent={onEvent} />);
    fireEvent.click(screen.getByRole("button", { name: /longest beam/ }));
    expect(document.body.textContent).not.toMatch(/non-flat closure exists/i);
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ control: "frame-claim", dir: "neutral" }));
    expect(describeWidgetState(closure, { angle: 30, moves: 2, choice: "too-long" }, "neutral")).not.toMatch(/can form|cannot form|matching the side-length test/i);
    view.unmount();
    render(<Harness spec={closure} tone="info" initialValue={{ angle: 30, moves: 2, choice: "too-long" }} />);
    expect(document.body.textContent).toMatch(/non-flat closure exists/i);
    expect(screen.getByTestId("tcl-ghost").textContent).toContain("Yes");
  });

  it("keeps slope verdicts out of active-work text and accessibility while preserving the geometry", () => {
    const onEvent = vi.fn();
    const view = render(<Harness spec={slope} onEvent={onEvent} />);
    expect(screen.getByText(/^slope = rise/).textContent).toContain("compare the tip with B");
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("Compare its tip with point B");
    expect(screen.getByRole("img").getAttribute("aria-label")).not.toMatch(/passes through|misses/i);
    expect(describeWidgetState(slope, { run: 2, rise: 4 }, "neutral")).toContain("ending at (4, 5); compare that tip");
    fireEvent.click(screen.getByRole("button", { name: /Increase rise/ }));
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ control: "slope-triangle-legs", dir: "neutral" }));
    view.unmount();
    render(<Harness spec={slope} tone="success" initialValue={{ run: 2, rise: 4 }} />);
    expect(screen.getByText(/^slope = rise/).textContent).toContain("passes through B");
    expect(describeWidgetState(slope, { run: 2, rise: 4 }, "success")).toMatch(/travels 4 right and 8 up.*passes through B/i);
  });

  it("keeps triangle-constraint target guidance and event direction hidden until settlement", () => {
    const ready = { criterion: "SAS", angle: 60, flipped: false, moves: 2 };
    const onEvent = vi.fn();
    const view = render(<Harness spec={constraint} initialValue={ready} onEvent={onEvent} />);
    expect(document.body.textContent).not.toMatch(/uniqueness guarantee/i);
    fireEvent.click(screen.getByRole("button", { name: "SSA" }));
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ control: "criterion", dir: "neutral", state: { criterion: "SSA" } }));
    view.unmount();
    render(<Harness spec={constraint} tone="success" initialValue={ready} />);
    expect(document.body.textContent).toMatch(/uniqueness guarantee/i);
  });

  it("uses deterministic option order with stable IDs for both unordered choice families", () => {
    for (const spec of [signed, closure]) {
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

  it("audits all 35 authored placements across 17 files and keeps helper, evaluator and feedback truth aligned", () => {
    const labs = authoredLabs();
    expect(labs).toHaveLength(35);
    expect(new Set(labs.map(({ path }) => path)).size).toBe(17);
    expect(labs.filter(({ spec }) => spec.type === "signedFractionLab")).toHaveLength(9);
    expect(labs.filter(({ spec }) => spec.type === "slopeTriangle")).toHaveLength(10);
    expect(labs.filter(({ spec }) => spec.type === "triangleClosureLab")).toHaveLength(2);
    expect(labs.filter(({ spec }) => spec.type === "triangleConstraintLab")).toHaveLength(14);
    for (const { spec, path } of labs) {
      if (spec.type === "signedFractionLab") {
        expect(spec.choices.filter((choice) => signedFractionChoiceCorrect(spec, choice)), path).toHaveLength(1);
        for (const choice of spec.choices) {
          const result = evaluate(spec, choice.id);
          expect(result.correct, `${path}: ${choice.id}`).toBe(signedFractionChoiceCorrect(spec, choice));
          expect(result.feedback.trim().length).toBeGreaterThan(0);
        }
      } else if (spec.type === "triangleClosureLab") {
        expect(spec.choices.filter((choice) => triangleClosureChoiceCorrect(spec, choice)), path).toHaveLength(1);
        for (const choice of spec.choices) {
          const result = evaluate(spec, { angle: spec.angleStart, moves: spec.requiredMoves, choice: choice.id });
          expect(result.correct, `${path}: ${choice.id}`).toBe(triangleClosureChoiceCorrect(spec, choice));
          expect(result.feedback.trim().length).toBeGreaterThan(0);
        }
      } else if (spec.type === "slopeTriangle") {
        const correct = { run: spec.bx - spec.ax, rise: spec.by - spec.ay };
        expect(evaluate(spec, correct).correct, path).toBe(true);
        expect(evaluate(spec, correct).feedback.trim().length).toBeGreaterThan(0);
      } else if (spec.type === "triangleConstraintLab") {
        const result = evaluate(spec, { criterion: spec.targetCriterion, angle: spec.targetAngle, flipped: false, moves: spec.requiredMoves });
        expect(result.correct, path).toBe(true);
        expect(result.feedback.trim().length).toBeGreaterThan(0);
      } else {
        throw new Error(`unexpected audited widget type: ${spec.type}`);
      }
    }
    expect(actionsFor("signedFractionLab")).toMatch(/selected path remains visible on reveal/i);
    expect(actionsFor("triangleClosureLab")).toMatch(/frame claim/i);
  });
});
