// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { WidgetRenderer as WidgetView } from "./widgets";

const spec = {
  type: "conditionalTableLab" as const, mode: "read" as const, prompt: "What percent of children prefer dogs?",
  rowLabels: ["child", "adult"] as [string,string], colLabels: ["dog", "cat"] as [string,string], counts: [20,10,5,15] as [number,number,number,number],
  targetCondition: "row0" as const, targetCell: "r0c0" as const, startCondition: "col0" as const, requiredSwitches: 1,
  readMetric: "relativeRow" as const,
  answerChoices: [
    {id:"a",label:"66.67%",value:66.6667,feedback:"Correct."},
    {id:"b",label:"40%",value:40,feedback:"Whole-table denominator."},
    {id:"c",label:"80%",value:80,feedback:"Column denominator."}
  ], successFeedback:"20 out of 30.", explorationFeedback:"Choose.", conditionFeedback:"Use row.", cellFeedback:"Use cell."
};

describe("conditionalTableLab read renderer", () => {
  it("draws the fixed table, denominator pattern, and 44px native claims", () => {
    const onChange=vi.fn(); render(<WidgetView spec={spec} value={null} onChange={onChange} disabled={false} tone="neutral" />);
    expect(screen.getByText(/numerator 20/)).toBeTruthy();
    const button=screen.getByRole("button",{name:"66.67%"});
    expect(button.className).toMatch(/min-h-12/); fireEvent.click(button); expect(onChange).toHaveBeenCalledWith("a");
  });
  it("preserves the learner claim and renders a separate reveal target", () => {
    render(<WidgetView spec={spec} value="b" onChange={()=>{}} disabled={false} tone="info" />);
    expect(screen.getByRole("button",{name:"40%"}).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("ct-read-ghost").textContent).toMatch(/66.67%/);
  });
});
