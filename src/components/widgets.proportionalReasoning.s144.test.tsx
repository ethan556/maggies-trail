// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { WidgetRenderer as WidgetView } from "./widgets";
import { canCheck, evaluate } from "@/lib/evaluate";

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

describe("proportionalReasoningLab renderer", () => {
  it("requires learner-produced unit rates and does not reveal them", () => {
    render(<WidgetView spec={choiceSpec} value={{revealed:[]}} onChange={() => {}} disabled={false} tone="neutral"/>);
    expect(screen.getByText(/unit-rate checks: 0 of 2 verified/i)).toBeTruthy();
    expect(screen.getAllByRole("button", {name:/Check unit rate for Deal/})).toHaveLength(2);
    expect(screen.getByRole("button", {name:"Deal B"}).hasAttribute("disabled")).toBe(true);
    expect(screen.queryByText(/unit rates 1\.5/i)).toBeNull();
    expect(screen.queryByText(/unit rates 1\.4/i)).toBeNull();
  });

  it("uses keyboard-native inputs and checks an entered rate without printing the answer", () => {
    const onChange = vi.fn();
    const { rerender } = render(<WidgetView spec={choiceSpec} value={{revealed:[]}} onChange={onChange} disabled={false} tone="neutral"/>);
    const input = screen.getByRole("spinbutton", {name:"Enter unit rate for Deal A row 1 in dollars per 1 notebooks"});
    fireEvent.change(input, {target:{value:"1.5"}});
    expect(onChange).toHaveBeenLastCalledWith({revealed:[], unitRates:{"a:0":1.5}, verifiedUnitRates:[], unitRateStatus:{}});
    rerender(<WidgetView spec={choiceSpec} value={{revealed:[], unitRates:{"a:0":1.5}, verifiedUnitRates:[], unitRateStatus:{}}} onChange={onChange} disabled={false} tone="neutral"/>);
    const check = screen.getByRole("button", {name:"Check unit rate for Deal A row 1"});
    expect(check.getAttribute("type")).toBe("button");
    fireEvent.keyDown(check, {key:"Enter"}); fireEvent.click(check);
    expect(onChange).toHaveBeenLastCalledWith({revealed:[], unitRates:{"a:0":1.5}, verifiedUnitRates:["a:0"], unitRateStatus:{"a:0":"correct"}});
    expect(screen.queryByText(/unit rates 1\.5/i)).toBeNull();
  });

  it("keeps learner numeric work intact after a checked unit rate", () => {
    const onChange = vi.fn();
    const completed = {revealed:["stage:0"], unitRates:{"machine:0":3}, verifiedUnitRates:["machine:0"], unitRateStatus:{"machine:0":"correct"}, numeric:12};
    const {rerender} = render(<WidgetView spec={numericSpec} value={completed} onChange={onChange} disabled={false} tone="neutral"/>);
    expect((screen.getByRole("spinbutton", {name:"Enter answer in parts"}) as HTMLInputElement).value).toBe("12");
    rerender(<WidgetView spec={numericSpec} value={completed} onChange={onChange} disabled={false} tone="info"/>);
    expect(screen.getByTestId("prl-ghost").textContent).toMatch(/correct proportional result: 12 parts/i);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("locks the final answer until every unit rate is verified", () => {
    const independentAnswer = {revealed:[], numeric:12};
    expect(canCheck(numericSpec, independentAnswer)).toBe(false);
    expect(evaluate(numericSpec, independentAnswer)).toMatchObject({correct:false, feedback:numericSpec.explorationFeedback});
    const spoofedAnswer = {revealed:[], unitRates:{"machine:0":2}, verifiedUnitRates:["machine:0"], unitRateStatus:{"machine:0":"correct"}, numeric:12};
    expect(canCheck(numericSpec, spoofedAnswer)).toBe(false);
    expect(evaluate(numericSpec, spoofedAnswer)).toMatchObject({correct:false, feedback:numericSpec.explorationFeedback});
    const normalizedAnswer = {revealed:[], unitRates:{"machine:0":3}, verifiedUnitRates:["machine:0"], unitRateStatus:{"machine:0":"correct"}, numeric:12};
    expect(canCheck(numericSpec, normalizedAnswer)).toBe(true);
    expect(evaluate(numericSpec, normalizedAnswer)).toMatchObject({correct:true});
    render(<WidgetView spec={numericSpec} value={independentAnswer} onChange={() => {}} disabled={false} tone="neutral"/>);
    expect(screen.getByRole("spinbutton", {name:"Enter answer in parts"}).hasAttribute("disabled")).toBe(true);
  });

  it("carries meaning in labels and table structure rather than color alone", () => {
    render(<WidgetView spec={choiceSpec} value={{revealed:[], unitRates:{"a:0":1.5,"b:0":1.4}, verifiedUnitRates:["a:0","b:0"], unitRateStatus:{"a:0":"correct","b:0":"correct"}}} onChange={() => {}} disabled={false} tone="neutral"/>);
    expect(screen.getByRole("group", {name:"Proportional quantity models"})).toBeTruthy();
    expect(screen.getAllByRole("table")).toHaveLength(2);
    expect(screen.getByRole("button", {name:"Deal B"}).hasAttribute("disabled")).toBe(false);
  });
});