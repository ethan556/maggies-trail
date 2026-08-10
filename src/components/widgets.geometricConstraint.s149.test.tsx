// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { useState } from "react";
import { WidgetRenderer } from "./widgets";
import { GeometricConstraintLabSpec } from "@/lib/schema";
import { canCheck, evaluate } from "@/lib/evaluate";
const spec=GeometricConstraintLabSpec.parse({type:"geometricConstraintLab",task:"perimeterMissing",answerMode:"numeric",prompt:"Find the missing width.",perimeter:{shape:"rectangle",perimeter:26,knownSides:[8,8],unknownMultiplicity:2},choices:[],numericErrors:[],authoredStages:[],requiredStageKeys:["perimeter:total","perimeter:known","perimeter:remaining","perimeter:split"],requiredExplorations:4,tolerance:0,successFeedback:"5",explorationFeedback:"Inspect every stage.",fallbackFeedback:"Subtract and split."});
it("completes keyboard-addressable geometric reasoning without reveal overwriting learner state",()=>{let latest:unknown=null;function Host(){const[v,setV]=useState<unknown>(null);return <WidgetRenderer spec={spec} value={v} disabled={false} tone="info" onChange={x=>{latest=x;setV(x)}}/>}render(<Host/>);for(const b of screen.getAllByRole("button",{name:/Open geometric constraint stage/}))fireEvent.click(b);fireEvent.change(screen.getByRole("spinbutton"),{target:{value:"5"}});expect(canCheck(spec,latest)).toBe(true);expect(evaluate(spec,latest).correct).toBe(true);expect(screen.getByTestId("gcl-ghost")).toBeTruthy();expect((latest as {numeric?:number}).numeric).toBe(5)});
