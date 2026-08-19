import { describe, expect, it } from "vitest";
import { WidgetSpec } from "./schema";

const labeledGrid = {
  type: "plotPoint" as const,
  prompt: "Plot the point.",
  cols: 2,
  rows: 2,
  xLabels: ["1", "2"],
  yLabels: ["1", "2"],
  targets: [{ x: 1, y: 1 }],
  missFeedback: "Try again.",
  successFeedback: "Correct.",
};

describe("S282 plotPoint axis-label contract", () => {
  it("requires a complete, non-empty, distinct scale on both axes", () => {
    expect(WidgetSpec.safeParse(labeledGrid).success).toBe(true);
    expect(WidgetSpec.safeParse({ ...labeledGrid, xLabels: undefined }).success).toBe(false);
    expect(WidgetSpec.safeParse({ ...labeledGrid, yLabels: undefined }).success).toBe(false);
    expect(WidgetSpec.safeParse({ ...labeledGrid, xLabels: ["1"] }).success).toBe(false);
    expect(WidgetSpec.safeParse({ ...labeledGrid, yLabels: ["1", "1"] }).success).toBe(false);
    expect(WidgetSpec.safeParse({ ...labeledGrid, yLabels: ["1", " "] }).success).toBe(false);
  });
});
