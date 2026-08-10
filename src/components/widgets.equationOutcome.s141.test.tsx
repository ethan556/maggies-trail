// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { WidgetRenderer as WidgetView } from "./widgets";

const spec = {
  type: "equationOutcomeLab" as const, prompt: "Classify.",
  leftDisplay: "2x + 5", rightDisplay: "2x + 1", leftCoeff: 2, leftConstant: 5, rightCoeff: 2, rightConstant: 1,
  choices: [
    { id: "a", label: "No solution", outcome: "none" as const, feedback: "False residue." },
    { id: "b", label: "One solution", outcome: "one" as const, feedback: "Variable remains." },
    { id: "c", label: "Infinitely many", outcome: "infinite" as const, feedback: "Identity required." }
  ],
  // S141 grew this spec with Zod-defaulted fields, which are REQUIRED on the parsed output
  // type this fixture is assigned to. These are the schema's own defaults, so the rendered
  // behaviour under test is unchanged.
  mode: "classify" as const, answerMode: "outcome" as const, relation: "eq" as const,
  variable: "x", operations: [], correctOrder: [], requiredMoves: 1,
  numericErrors: [], tolerance: 0,
  explorationFeedback: "Apply the same legal operation to both sides and inspect the new relation.",
  fallbackFeedback: "Inspect residue.", successFeedback: "No solution."
};

describe("equationOutcomeLab renderer", () => {
  it("exposes the residue and native 44px claim controls", () => {
    const onChange=vi.fn(); render(<WidgetView spec={spec} value={null} onChange={onChange} disabled={false} tone="neutral" />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/5 = 1/);
    const button=screen.getByRole("button",{name:"No solution"});
    expect(button.className).toMatch(/min-h-11/); fireEvent.click(button); expect(onChange).toHaveBeenCalledWith("a");
  });
  it("preserves the learner claim and shows a separate reveal ghost", () => {
    render(<WidgetView spec={spec} value="b" onChange={()=>{}} disabled={false} tone="info" />);
    expect(screen.getByText("Your claim: One solution")).toBeTruthy();
    expect(screen.getByTestId("eol-ghost").textContent).toMatch(/No solution/);
  });
});
