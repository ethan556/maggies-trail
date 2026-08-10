// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { WidgetRenderer as WidgetView } from "./widgets";

const choiceSpec = {
  type:"proportionalReasoningLab" as const, task:"bestRate" as const, answerMode:"choice" as const,
  prompt:"Which deal has the lower cost per notebook?", xLabel:"notebooks", yLabel:"dollars",
  series:[{id:"a",label:"Deal A",pairs:[[4,6] as [number,number]]},{id:"b",label:"Deal B",pairs:[[6,8.4] as [number,number]]}], optimize:"min" as const,
  choices:[{id:"a",label:"Deal A",claim:"series:a",feedback:"Compare dollars per one notebook."},{id:"b",label:"Deal B",claim:"series:b",feedback:"Deal B has the lower normalized cost."}],
  numericErrors:[], tolerance:0, requiredExplorations:2, successFeedback:"Deal B has the lower unit price.", explorationFeedback:"Normalize both deals.", fallbackFeedback:"Compare unit prices."
};

const numericSpec = {
  ...choiceSpec, task:"predictOutput" as const, answerMode:"numeric" as const, prompt:"A machine makes 6 parts in 2 minutes. How many in 4 minutes?",
  xLabel:"minutes", yLabel:"parts", series:[{id:"machine",label:"machine",pairs:[[2,6] as [number,number]]}], targetSeriesId:"machine", targetInput:4,
  optimize:undefined, choices:[], numericErrors:[{value:10,feedback:"That adds the time change instead of scaling by the unit rate."}], answerUnit:"parts", requiredExplorations:2,
  successFeedback:"The rate is 3 parts per minute, so 4 minutes gives 12 parts.", explorationFeedback:"Normalize the rate and build one stage.", fallbackFeedback:"Use parts per one minute."
};

describe("proportionalReasoningLab renderer",()=>{
  it("does not reveal proportionality, the winner, or the final answer in the initial view",()=>{
    render(<WidgetView spec={choiceSpec} value={{revealed:[]}} onChange={()=>{}} disabled={false} tone="neutral"/>);
    expect(screen.queryByText(/row multipliers agree/i)).toBeNull();
    expect(screen.queryByText(/lower normalized cost/i)).toBeNull();
    expect(screen.getAllByText(/inspect 1 more row/i)).toHaveLength(2);
  });

  it("uses keyboard-native row normalization and exact claim controls",()=>{
    const onChange=vi.fn();
    render(<WidgetView spec={choiceSpec} value={{revealed:[]}} onChange={onChange} disabled={false} tone="neutral"/>);
    const row=screen.getByRole("button",{name:"Normalize Deal A row 1 to one notebooks"});
    expect(row.getAttribute("type")).toBe("button");
    fireEvent.keyDown(row,{key:"Enter"}); fireEvent.click(row);
    expect(onChange).toHaveBeenCalledWith({revealed:["a:0"]});
    fireEvent.click(screen.getByRole("button",{name:"Deal B"}));
    expect(onChange).toHaveBeenCalledWith({revealed:[],choiceId:"b"});
  });

  it("supports numeric work without reveal overwriting the learner state",()=>{
    const onChange=vi.fn();
    const {rerender}=render(<WidgetView spec={numericSpec} value={{revealed:["machine:0","stage:0"],numeric:12}} onChange={onChange} disabled={false} tone="neutral"/>);
    expect((screen.getByRole("spinbutton",{name:"Enter answer in parts"}) as HTMLInputElement).value).toBe(String(12));
    rerender(<WidgetView spec={numericSpec} value={{revealed:["machine:0","stage:0"],numeric:12}} onChange={onChange} disabled={false} tone="info"/>);
    expect(screen.getByTestId("prl-ghost").textContent).toMatch(/correct proportional result: 12 parts/i);
    expect((screen.getByRole("spinbutton",{name:"Enter answer in parts"}) as HTMLInputElement).value).toBe(String(12));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("carries meaning in labels and table structure rather than color alone",()=>{
    render(<WidgetView spec={choiceSpec} value={{revealed:["a:0","b:0"]}} onChange={()=>{}} disabled={false} tone="neutral"/>);
    expect(screen.getByRole("group",{name:"Proportional quantity models"})).toBeTruthy();
    expect(screen.getAllByRole("table")).toHaveLength(2);
    expect(screen.getByRole("button",{name:"Deal B"}).getAttribute("aria-pressed")).toBe("false");
  });
});
