// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "./widgets";
import { evaluate } from "@/lib/evaluate";
import type { TQuotientReasoningLab } from "@/lib/schema";

const spec:TQuotientReasoningLab={type:"quotientReasoningLab",task:"remainderContext",answerMode:"numeric",prompt:"100 riders use buses that hold 15. How many buses are needed?",dividend:{num:100,den:1},divisor:{num:15,den:1},candidates:[],contextPolicy:"roundUp",choices:[],numericErrors:[{value:6,feedback:"Six buses leave ten riders without a seat."}],fractionErrors:[],authoredStages:[],requiredExplorations:4,tolerance:0,successFeedback:"The remainder requires one more bus, so 7.",explorationFeedback:"Inspect all exact states.",fallbackFeedback:"Interpret the remainder in context."};
function Host({holder}:{holder:{value:unknown}}){const [value,setValue]=useState<unknown>(null);return <WidgetRenderer spec={spec} value={value} disabled={false} onChange={(next)=>{holder.value=next;setValue(next)}}/>}
describe("quotientReasoningLab renderer",()=>{
 it("uses labelled native controls and never reveals the answer before learner action",()=>{
  const holder={value:null as unknown};render(<Host holder={holder}/>);
  expect(screen.queryByText(/Correct quotient result/)).toBeNull();
  const stages=screen.getAllByRole("button",{name:/Open quotient stage/});expect(stages).toHaveLength(4);
  stages.forEach((button)=>{expect(button.className).toContain("min-h-14");fireEvent.click(button)});
  const answer=screen.getByRole("spinbutton",{name:/Enter quotient answer/});expect(answer.className).toContain("min-h-12");fireEvent.change(answer,{target:{value:"7"}});
  expect(evaluate(spec,holder.value).correct).toBe(true);
 });
 it("keeps stage meaning in accessible names without color-only semantics",()=>{
  render(<WidgetRenderer spec={spec} value={{revealed:["integer:estimate"]}} disabled={false} onChange={()=>{}}/>);
  expect(screen.getByRole("button",{name:/largest full-group count: 6/}).getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByText(/multiply back/)).toBeTruthy();
 });
});
