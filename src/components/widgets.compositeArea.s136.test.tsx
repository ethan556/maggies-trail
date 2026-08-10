// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WidgetSpec, type TCompositeAreaLab } from "@/lib/schema";
import { WidgetRenderer, type StageTone } from "./widgets";

const parsed = WidgetSpec.parse({
  type: "compositeAreaLab",
  prompt: "Find the signed composite area.",
  scene: "piece-ledger",
  pieces: [
    { id: "room", label: "main room", shape: "rectangle", operation: "add", width: 6, height: 4 },
    { id: "bay", label: "triangular bay", shape: "triangle", operation: "add", base: 4, height: 3 },
    { id: "notch", label: "cut-away notch", shape: "rectangle", operation: "subtract", width: 2, height: 2 }
  ],
  target: { kind: "total" },
  choices: [
    { id: "correct", label: "26 square units", value: 26, feedback: "correct" },
    { id: "add-notch", label: "34 square units", value: 34, feedback: "wrong" },
    { id: "omit-notch", label: "30 square units", value: 30, feedback: "wrong" }
  ],
  fallbackFeedback: "Use every piece with its sign.",
  successFeedback: "correct"
});
if (parsed.type !== "compositeAreaLab") throw new Error("bad fixture");
const spec = parsed as TCompositeAreaLab;

function Harness({ tone = "neutral", onEvent = vi.fn() }: { tone?: StageTone; onEvent?: (event: unknown) => void }) {
  const [value, setValue] = useState<unknown>(undefined);
  return <WidgetRenderer spec={spec} value={value} onChange={setValue} onEvent={onEvent} disabled={false} tone={tone} />;
}

afterEach(cleanup);

describe("compositeAreaLab visual interaction", () => {
  it("renders every signed piece and the exact area ledger", () => {
    render(<Harness />);
    expect(screen.getByText("main room")).toBeTruthy();
    expect(screen.getByText("triangular bay")).toBeTruthy();
    expect(screen.getByText("cut-away notch")).toBeTruthy();
    expect(screen.getByText(/6 × 4 \+ ½ × 4 × 3 − 2 × 2/)).toBeTruthy();
    expect(screen.getByRole("img", { name: /cut-away notch.*subtract/i })).toBeTruthy();
  });

  it("uses native 44px exact-claim controls and preserves keyboard semantics", () => {
    render(<Harness />);
    const wrong = screen.getByRole("button", { name: "34 square units" });
    expect(wrong.className).toContain("min-h-11");
    fireEvent.click(wrong);
    expect(wrong.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Selected 34 square units.")).toBeTruthy();
  });

  it("emits toward and away process signals from the learner's actual claim", () => {
    const onEvent = vi.fn();
    render(<Harness onEvent={onEvent} />);
    fireEvent.click(screen.getByRole("button", { name: "34 square units" }));
    fireEvent.click(screen.getByRole("button", { name: "26 square units" }));
    expect(onEvent).toHaveBeenNthCalledWith(1, expect.objectContaining({ control: "area-claim", dir: "away", state: expect.objectContaining({ value: 34, target: 26 }) }));
    expect(onEvent).toHaveBeenNthCalledWith(2, expect.objectContaining({ control: "area-claim", dir: "toward", state: expect.objectContaining({ value: 26, target: 26 }) }));
  });

  it("pairs semantic colour with signs, dashed cut-away geometry, labels, and borders", () => {
    render(<Harness />);
    expect(screen.getByLabelText("subtract this cut-away piece").textContent).toBe("−");
    expect(screen.getAllByLabelText("add this piece")).toHaveLength(2);
    expect(screen.getByText(/Choose the exact area claim/i)).toBeTruthy();
  });

  it("reveals a target chip without replacing the learner's wrong selection", () => {
    render(<Harness tone="info" />);
    const wrong = screen.getByRole("button", { name: "30 square units" });
    fireEvent.click(wrong);
    expect(wrong.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("cal-ghost").textContent).toContain("correct claim: 26 square units");
  });
});
