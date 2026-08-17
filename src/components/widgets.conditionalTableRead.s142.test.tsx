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
  it("shows givens and the relationship without pre-solving the claim", () => {
    const onChange=vi.fn(); render(<WidgetView spec={spec} value={null} onChange={onChange} disabled={false} tone="neutral" />);
    expect(screen.getByTestId("ct-read-relationship").textContent).toContain("target cell ÷ row total × 100");
    expect(screen.queryByTestId("ct-read-answer")).toBeNull();
    expect(screen.getByText(/totals stay yours to calculate/i)).toBeTruthy();
    expect(screen.getAllByText("?")).toHaveLength(5);
    expect(screen.getByTestId("a11y-panel").textContent).not.toContain("20 out of 30");
    expect(screen.getByTestId("a11y-panel").textContent).not.toContain("66.6667 percent");
    const button=screen.getByRole("button",{name:"66.67%"});
    expect(button.className).toMatch(/min-h-12/); fireEvent.click(button); expect(onChange).toHaveBeenCalledWith("a");
  });
  it("preserves the learner claim and renders a separate reveal target", () => {
    render(<WidgetView spec={spec} value="b" onChange={()=>{}} disabled={false} tone="info" />);
    expect(screen.getByRole("button",{name:"40%"}).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("ct-read-answer").textContent).toMatch(/numerator 20.*denominator 30.*66\.6667%/);
    expect(screen.getByTestId("ct-read-ghost").textContent).toMatch(/66.67%/);
    expect(screen.getByTestId("a11y-panel").textContent).toContain("20 out of 30");
    expect(screen.getByTestId("a11y-panel").textContent).toContain("66.6667 percent");
  });
  it("withholds a computed grand total until the explicit reveal", () => {
    const grandSpec = {
      ...spec,
      prompt: "What is the grand total?",
      readMetric: "grandTotal" as const,
      answerChoices: [
        {id:"a",label:"50",value:50,feedback:"Correct."},
        {id:"b",label:"30",value:30,feedback:"One row only."},
        {id:"c",label:"25",value:25,feedback:"One column only."}
      ]
    };
    const view = render(<WidgetView spec={grandSpec} value="b" onChange={()=>{}} disabled={false} tone="neutral" />);
    expect(screen.queryByTestId("ct-read-answer")).toBeNull();
    expect(screen.getAllByText("?")).toHaveLength(5);
    view.rerender(<WidgetView spec={grandSpec} value="b" onChange={()=>{}} disabled={false} tone="error" />);
    expect(screen.queryByTestId("ct-read-answer")).toBeNull();
    view.rerender(<WidgetView spec={grandSpec} value="a" onChange={()=>{}} disabled={false} tone="success" />);
    expect(screen.queryByTestId("ct-read-answer")).toBeNull();
    view.rerender(<WidgetView spec={grandSpec} value="b" onChange={()=>{}} disabled={false} tone="info" />);
    expect(screen.getByTestId("ct-read-answer").textContent).toContain("grand total is 50");
    expect(screen.queryByText("?")).toBeNull();
    view.rerender(<WidgetView spec={grandSpec} value="a" onChange={()=>{}} disabled={false} tone="info" />);
    expect(screen.queryByTestId("ct-read-ghost")).toBeNull();
  });
});
