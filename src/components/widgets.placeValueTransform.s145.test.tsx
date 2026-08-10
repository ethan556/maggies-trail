// @vitest-environment jsdom
import {describe,expect,it,vi} from "vitest";
import {fireEvent,render,screen} from "@testing-library/react";
import { WidgetRenderer as WidgetView } from "./widgets";

const numericSpec={
 type:"placeValueTransformLab" as const,task:"round" as const,answerMode:"numeric" as const,prompt:"Round 12.86 to the nearest tenth.",values:[12.86],targetExponent:-1,
 choices:[],numericErrors:[{value:12.8,feedback:"That truncates the decimal instead of rounding."}],exponentOps:[],requiredExplorations:3,tolerance:0,successFeedback:"12.86 rounds to 12.9.",explorationFeedback:"Inspect all three places.",fallbackFeedback:"Use the hundredths digit."
};
const choiceSpec={
 ...numericSpec,task:"compare" as const,answerMode:"choice" as const,prompt:"Compare 0.409 and 0.41.",values:[0.409,0.41],targetExponent:undefined,numericErrors:[],requiredExplorations:2,
 choices:[{id:"lt",label:"<",claim:"relation:lt",feedback:"The hundredths place decides."},{id:"gt",label:">",claim:"relation:gt",feedback:"That reverses the first unequal place."}],successFeedback:"0.409 is less than 0.41."
};

describe("placeValueTransformLab renderer",()=>{
 it("does not reveal derived stage values or the final answer initially",()=>{
  render(<WidgetView spec={numericSpec} value={{revealed:[]}} onChange={()=>{}} disabled={false} tone="neutral"/>);
  expect(screen.getAllByText("Inspect this stage")).toHaveLength(3);
  expect(screen.queryByText("12.9")).toBeNull();
  expect(screen.getByRole("table",{name:"Aligned place-value digits"})).toBeTruthy();
 });
 it("uses native keyboard-reachable stage and answer controls",()=>{
  const onChange=vi.fn();render(<WidgetView spec={choiceSpec} value={{revealed:[]}} onChange={onChange} disabled={false} tone="neutral"/>);
  const stage=screen.getByRole("button",{name:/Inspect stage 1:/});expect(stage.getAttribute("type")).toBe("button");fireEvent.keyDown(stage,{key:"Enter"});fireEvent.click(stage);expect(onChange).toHaveBeenCalledWith({revealed:["place:0"]});
  fireEvent.click(screen.getByRole("button",{name:"<"}));expect(onChange).toHaveBeenCalledWith({revealed:[],choiceId:"lt"});
 });
 it("keeps learner work intact when reveal evidence appears",()=>{
  const onChange=vi.fn();const state={revealed:["round:exact","round:target","round:decider"],numeric:12.8};
  const {rerender}=render(<WidgetView spec={numericSpec} value={state} onChange={onChange} disabled={false} tone="neutral"/>);
  expect((screen.getByRole("spinbutton",{name:"Enter place-value answer"}) as HTMLInputElement).value).toBe(String(12.8));
  rerender(<WidgetView spec={numericSpec} value={state} onChange={onChange} disabled={false} tone="info"/>);
  expect(screen.getByTestId("pvtl-ghost").textContent).toMatch(/12\.9/);expect((screen.getByRole("spinbutton",{name:"Enter place-value answer"}) as HTMLInputElement).value).toBe(String(12.8));expect(onChange).not.toHaveBeenCalled();
 });
 it("carries semantics in headers, labels, digits, and pressed state rather than color alone",()=>{
  render(<WidgetView spec={choiceSpec} value={{revealed:["place:0","place:-1"],choiceId:"lt"}} onChange={()=>{}} disabled={false} tone="neutral"/>);
  expect(screen.getByRole("group",{name:"Build the place-value reasoning chain"})).toBeTruthy();
  expect(screen.getByRole("group",{name:"Choose the place-value conclusion"})).toBeTruthy();
  expect(screen.getByRole("button",{name:"<"}).getAttribute("aria-pressed")).toBe("true");
 });
});
