// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { useState } from "react";
import { WidgetRenderer } from "./widgets";
import { PointSetReasoningLabSpec } from "@/lib/schema";
import { canCheck, evaluate } from "@/lib/evaluate";
const spec=PointSetReasoningLabSpec.parse({type:"pointSetReasoningLab",task:"rangeValue",answerMode:"numeric",prompt:"Find range.",xLabel:"value",sets:[{id:"d",label:"data",points:[{id:"a",label:"2",x:2},{id:"b",label:"5",x:5},{id:"c",label:"10",x:10}]}],targetSetId:"d",choices:[],numericErrors:[],authoredStages:[],requiredStageKeys:["range:min","range:max","range:span"],requiredExplorations:3,successFeedback:"8",explorationFeedback:"inspect",fallbackFeedback:"subtract",tolerance:0});
it("completes keyboard-addressable point-set reasoning without reveal overwriting input",()=>{let latest:unknown=null;function Host(){const[v,setV]=useState<unknown>(null);return <WidgetRenderer spec={spec} value={v} disabled={false} tone="info" onChange={x=>{latest=x;setV(x)}}/>}render(<Host/>);for(const b of screen.getAllByRole("button",{name:/Open point-set stage/}))fireEvent.click(b);fireEvent.change(screen.getByRole("spinbutton"),{target:{value:"8"}});expect(canCheck(spec,latest)).toBe(true);expect(evaluate(spec,latest).correct).toBe(true);expect(screen.getByTestId("psr-ghost")).toBeTruthy();expect((latest as {numeric?:number}).numeric).toBe(8)});
