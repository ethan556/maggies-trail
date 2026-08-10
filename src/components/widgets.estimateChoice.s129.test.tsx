// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer, type StageTone } from "./widgets";
import { WidgetSpec, type TEstimateSlider } from "@/lib/schema";

const spec = WidgetSpec.parse({
  type: "estimateSlider",
  prompt: "A book is about 9 inches long. Which is the best estimate?",
  min: 0,
  max: 20,
  target: 9,
  unitLabel: "inches",
  choices: [
    { value: 8, label: "8 inches", correct: true, feedback: "8 is only 1 inch away." },
    { value: 20, label: "20 inches", feedback: "20 is much too long." },
    { value: 1, label: "1 inch", feedback: "1 inch is much too short." }
  ],
  lowFeedback: "too short",
  highFeedback: "too long",
  successFeedback: "8 is only 1 inch away."
});
if (spec.type !== "estimateSlider") throw new Error("bad fixture");

function Harness({ tone = "neutral" }: { tone?: StageTone }) {
  const [value, setValue] = useState<unknown>(undefined);
  return <WidgetRenderer spec={spec as TEstimateSlider} value={value} onChange={setValue} disabled={false} tone={tone} />;
}

afterEach(cleanup);

describe("estimateSlider exact-choice mode", () => {
  it("starts unselected and draws a comparison only after a native candidate button is pressed", () => {
    render(<Harness />);
    expect(screen.getByTestId("estimate-choice-actual")).toBeTruthy();
    expect(screen.queryByTestId("estimate-choice-selected")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "20 inches" }));
    expect(screen.getByTestId("estimate-choice-selected")).toBeTruthy();
    expect(screen.getByTestId("estimate-choice-gap")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("11 inches from");
  });

  it("uses shape-and-label semantics alongside state color", () => {
    render(<Harness tone="error" />);
    fireEvent.click(screen.getByRole("button", { name: "1 inch" }));
    expect(screen.getByRole("button", { name: /1 inch × Too far/ })).toBeTruthy();
    expect(screen.getByText("stated actual length")).toBeTruthy();
    expect(screen.getByText("your estimate")).toBeTruthy();
    expect(screen.getByText("distance between them")).toBeTruthy();
  });

  it("reveals the correct authored candidate as a dashed answer ghost without replacing learner work", () => {
    render(<Harness tone="info" />);
    fireEvent.click(screen.getByRole("button", { name: "20 inches" }));
    expect(screen.getByTestId("estimate-choice-selected")).toBeTruthy();
    expect(screen.getByTestId("estimate-choice-answer-ghost")).toBeTruthy();
    expect(screen.getByRole("button", { name: /8 inches — answer/ })).toBeTruthy();
  });
});
