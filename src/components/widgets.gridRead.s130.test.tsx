// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer, type StageTone } from "./widgets";
import { WidgetSpec, type TAreaModel } from "@/lib/schema";

const parsed = WidgetSpec.parse({
  type: "areaModel",
  prompt: "Count a 3 by 4 fixed grid.",
  targetArea: 12,
  wMax: 4,
  hMax: 3,
  wStart: 4,
  hStart: 3,
  countGrid: true,
  commonCounts: [
    { count: 7, feedback: "That adds rows and columns." },
    { count: 4, feedback: "That counts one row only." }
  ],
  successFeedback: "All 12 squares are counted.",
  lowFeedback: "Keep counting.",
  highFeedback: "The fixed grid has only 12 squares."
});
if (parsed.type !== "areaModel") throw new Error("bad fixture");
const spec = parsed as TAreaModel;

function Harness({ tone = "neutral" }: { tone?: StageTone }) {
  const [value, setValue] = useState<unknown>(undefined);
  return <WidgetRenderer spec={spec} value={value} onChange={setValue} disabled={false} tone={tone} />;
}

afterEach(cleanup);

describe("areaModel fixed-grid counting mode", () => {
  it("keeps the given grid fixed while row and square controls advance the count", () => {
    render(<Harness />);
    expect(screen.getByTestId("area-count-grid")).toBeTruthy();
    expect(screen.getByText("Counted: 0 squares")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Count next row" }));
    expect(screen.getByText("Counted: 4 squares")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "+1 square" }));
    expect(screen.getByText("Counted: 5 squares")).toBeTruthy();
    expect(screen.getAllByTestId(/area-count-cell-/)).toHaveLength(12);
  });

  it("supports reversible counting with native 44px controls", () => {
    render(<Harness />);
    const add = screen.getByRole("button", { name: "+1 square" });
    expect(add.className).toContain("min-h-11");
    fireEvent.click(add);
    fireEvent.click(add);
    fireEvent.click(screen.getByRole("button", { name: "−1 square" }));
    expect(screen.getByText("Counted: 1 square")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("Counted: 0 squares")).toBeTruthy();
  });

  it("reveals a dashed complete-grid ghost without replacing learner work", () => {
    render(<Harness tone="info" />);
    fireEvent.click(screen.getByRole("button", { name: "+1 square" }));
    expect(screen.getByText("Counted: 1 square")).toBeTruthy();
    expect(screen.getByTestId("area-count-answer-ghost")).toBeTruthy();
    expect(screen.getAllByTestId("area-count-ghost-cell")).toHaveLength(11);
    expect(screen.getByText("correct count: 12 unit squares")).toBeTruthy();
  });
});
