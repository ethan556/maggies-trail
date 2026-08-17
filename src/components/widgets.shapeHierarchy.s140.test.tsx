// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WidgetRenderer, type StageTone } from "./widgets";
import { WidgetSpec, type TShapeHierarchyLab } from "@/lib/schema";

function fixture(): TShapeHierarchyLab {
  const parsed = WidgetSpec.parse({
    type: "shapeHierarchyLab", prompt: "A rectangle is a square. Always, sometimes, or never?", mode: "verdict",
    nodes: [{ id: "rectangle", label: "rectangle", attributes: ["4 right angles"] }, { id: "square", label: "square", attributes: ["rectangle + 4 equal sides"] }],
    edges: [["rectangle", "square"]], relation: "overlap", subjectLabel: "rectangle", predicateLabel: "square",
    witness: "A 4-by-4 rectangle is a square.", counterexample: "A 5-by-2 rectangle is not a square.",
    choices: [
      { id: "a", label: "Sometimes", claim: "sometimes", feedback: "correct", evidenceKind: "example", evidenceText: "One example and one counterexample establish overlap.", highlightNodeIds: [] },
      { id: "b", label: "Always", claim: "always", feedback: "always wrong", evidenceKind: "counterexample", evidenceText: "The 5-by-2 rectangle defeats always.", highlightNodeIds: [] },
      { id: "c", label: "Never", claim: "never", feedback: "never wrong", evidenceKind: "example", evidenceText: "The 4-by-4 rectangle defeats never.", highlightNodeIds: [] }
    ], fallbackFeedback: "fallback", successFeedback: "success"
  });
  if (parsed.type !== "shapeHierarchyLab") throw new Error("bad fixture");
  return parsed;
}
function Harness({ tone = "neutral", onEvent = vi.fn() }: { tone?: StageTone; onEvent?: (event: unknown) => void }) {
  const [value, setValue] = useState<unknown>(undefined);
  return <WidgetRenderer spec={fixture()} value={value} onChange={setValue} disabled={false} tone={tone} onEvent={onEvent} />;
}
afterEach(cleanup);

describe("Session 140 shapeHierarchyLab interaction", () => {
  it("renders three keyboard-native 44px claims and evidence that is not color-only", () => {
    render(<Harness />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    for (const button of buttons) expect(button.className).toContain("min-h-14");
    expect(screen.getAllByText("example").length).toBeGreaterThanOrEqual(2); // choices a and c both carry evidenceKind "example"
    expect(screen.getAllByText("counterexample").length).toBeGreaterThanOrEqual(1);
  });

  it("builds the learner's always model without judging it before Check", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: /Always/ }));
    expect(screen.getByRole("img", { name: /Selected verdict always/ })).toBeTruthy();
    expect(screen.getByText("Build your claim from the fixed givens, then check it.")).toBeTruthy();
    expect(screen.queryByText("The 5-by-2 rectangle defeats always.")).toBeNull();
  });

  it("keeps exact stable claim IDs while process direction stays neutral", () => {
    const onEvent = vi.fn();
    render(<Harness onEvent={onEvent} />);
    fireEvent.click(screen.getByRole("button", { name: /Always/ }));
    fireEvent.click(screen.getByRole("button", { name: /Sometimes/ }));
    expect(onEvent).toHaveBeenNthCalledWith(1, expect.objectContaining({ control: "shape-claim", dir: "neutral", state: { claim: "always" } }));
    expect(onEvent).toHaveBeenNthCalledWith(2, expect.objectContaining({ control: "shape-claim", dir: "neutral", state: { claim: "sometimes" } }));
  });

  it("preserves the learner claim on reveal and adds a separate answer ghost", () => {
    render(<Harness tone="info" />);
    fireEvent.click(screen.getByRole("button", { name: /Never/ }));
    expect(screen.getByRole("button", { name: /Never/ }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Evidence-backed answer: Sometimes")).toBeTruthy();
    expect(screen.getByText("The 4-by-4 rectangle defeats never.")).toBeTruthy();
  });
});
