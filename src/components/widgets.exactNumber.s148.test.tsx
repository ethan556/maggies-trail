// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useState } from "react";
import { WidgetRenderer } from "./widgets";
import { ExactNumberLabSpec } from "@/lib/schema";
import { canCheck, evaluate } from "@/lib/evaluate";
const spec=ExactNumberLabSpec.parse({type:"exactNumberLab",task:"fractionCompare",answerMode:"relation",prompt:"Which is bigger?",values:[{id:"a",label:"2/5",kind:"rational",num:2,den:5},{id:"b",label:"3/4",kind:"rational",num:3,den:4}],choices:[],numericErrors:[],authoredStages:[],requiredStageKeys:["benchmark:a","benchmark:b","compare:exact"],requiredExplorations:3,tolerance:0,successFeedback:"3/4 wins.",explorationFeedback:"Inspect the states.",fallbackFeedback:"Compare exactly."});
it("completes keyboard-addressable exact-number reasoning without revealing into state",()=>{let latest:unknown=null;function Host(){const[v,setV]=useState<unknown>(null);return <WidgetRenderer spec={spec} value={v} disabled={false} tone="info" onChange={x=>{latest=x;setV(x)}}/>}render(<Host/>);for(const b of screen.getAllByRole("button",{name:/Open exact-number stage/}))fireEvent.click(b);fireEvent.click(screen.getByRole("button",{name:"<"}));expect(canCheck(spec,latest)).toBe(true);expect(evaluate(spec,latest).correct).toBe(true);expect(screen.getByTestId("enl-ghost")).toBeTruthy();expect((latest as {relation?:string}).relation).toBe("lt")});
