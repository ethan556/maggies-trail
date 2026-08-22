// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WidgetSpec, geometricConstraintExplorationKeys, type TGeometricConstraintLab } from "@/lib/schema";
import { WidgetRenderer, type StageTone } from "./widgets";

function gcl(raw:Record<string,unknown>):TGeometricConstraintLab{
  const parsed=WidgetSpec.parse({
    type:"geometricConstraintLab",prompt:"Use the given geometry.",answerMode:"numeric",
    choices:[],numericErrors:[],authoredStages:[],requiredStageKeys:[],requiredExplorations:1,
    tolerance:0,successFeedback:"Correct.",explorationFeedback:"Inspect the geometry.",fallbackFeedback:"Try again.",
    ...raw,
  });
  if(parsed.type!=="geometricConstraintLab")throw new Error("wrong fixture type");
  return parsed;
}

const scale=gcl({task:"scaledArea",scale:{drawingArea:6,lengthScale:4,target:"realArea"},requiredStageKeys:["scale:length","scale:area-factor","scale:drawing-area","scale:real-area"],requiredExplorations:4});
const angle=gcl({task:"angleCrossing",angle:{knownAngle:62,target:"adjacent"},requiredStageKeys:["angle:vertical","angle:adjacent"],requiredExplorations:2});
const aa=gcl({task:"aaSimilarity",answerMode:"choice",aa:{anglesA:[50,60],anglesB:[50,60],target:"similarity"},choices:[
  {id:"yes",label:"Yes, AA applies",claim:"aa:similar",feedback:"Correct."},
  {id:"no",label:"No",claim:"wrong:no",feedback:"No."},
  {id:"maybe",label:"Only at the same size",claim:"wrong:size",feedback:"No."},
  {id:"third",label:"Only after measuring sides",claim:"wrong:sides",feedback:"No."},
],requiredStageKeys:["aa:complete-a","aa:complete-b","aa:compare"],requiredExplorations:3});
const pyth=gcl({task:"pythagoreanArea",pythagorean:{legA:3,legB:4,target:"length"},requiredStageKeys:["pyth:leg-squares","pyth:sum","pyth:identity","pyth:square-root"],requiredExplorations:4});
const partition=gcl({task:"coordinateProof",coordinateProof:{kind:"segmentPartition",points:[{id:"A",label:"A",x:0,y:0},{id:"P",label:"P",x:2,y:2},{id:"B",label:"B",x:6,y:6}],segment:{a:"A",p:"P",b:"B"}},requiredStageKeys:["proof:partition-x","proof:partition-y","proof:partition-ratio"],requiredExplorations:3});
const scaleExplore=gcl({task:"scaledArea",answerMode:"explore",scale:{drawingArea:6,lengthScale:4,target:"realArea"},requiredStageKeys:["scale:length","scale:area-factor","scale:drawing-area","scale:real-area"],requiredExplorations:4});
const missingLeg=gcl({task:"pythagoreanArea",pythagorean:{legA:6,hypotenuse:10,target:"legLength"},requiredStageKeys:["pyth:hyp-square","pyth:leg-square","pyth:subtract","pyth:square-root"],requiredExplorations:4});
const segmentLength=gcl({task:"coordinateProof",coordinateProof:{kind:"segmentLength",points:[{id:"A",label:"A",x:0,y:0},{id:"B",label:"B",x:6,y:8}],span:{a:"A",b:"B"}},requiredStageKeys:["proof:span-runs","proof:span-squares","proof:span-root"],requiredExplorations:3});
const circleLine=gcl({task:"coordinateProof",coordinateProof:{kind:"circleLineIntersection",points:[],circle:{h:0,k:0,r:5},line:{m:1,b:1}},requiredStageKeys:[],requiredExplorations:2,tolerance:.01});
const radical=gcl({task:"coordinateProof",answerMode:"choice",coordinateProof:{kind:"radicalPerimeter",points:[{id:"A",label:"A",x:0,y:0},{id:"B",label:"B",x:3,y:0},{id:"C",label:"C",x:3,y:3},{id:"D",label:"D",x:0,y:3}],sideRadicands:[18,18,18,18]},choices:[{id:"right",label:"12 square root 2",claim:"perimeter:12sqrt2",feedback:"Correct."},{id:"wrong",label:"square root 72",claim:"wrong",feedback:"No."}],requiredStageKeys:["proof:radical-sides","proof:radical-combine"],requiredExplorations:2});
const rectangle=gcl({task:"perimeterMissing",perimeter:{shape:"rectangle",perimeter:18,knownSides:[5,5],unknownMultiplicity:2},requiredStageKeys:["perimeter:total","perimeter:known","perimeter:remaining","perimeter:split"],requiredExplorations:4});

function show(spec:TGeometricConstraintLab,tone:StageTone,value:unknown={revealed:geometricConstraintExplorationKeys(spec)}){
  return render(<WidgetRenderer spec={spec} value={value} onChange={()=>{}} disabled={false} tone={tone}/>);
}

afterEach(cleanup);

describe("S244 geometricConstraintLab visible and accessible answer gate",()=>{
  it("keeps scaled-area givens while withholding the area factor/result from the diagram",()=>{
    const view=show(scale,"neutral");
    const diagram=screen.getByTestId("gcl-diagram");
    expect(diagram.textContent).toContain("drawing area 6");
    expect(diagram.textContent).toContain("real area ?");
    expect(diagram.textContent).not.toContain("area 96");
    expect(diagram.getAttribute("aria-label")).toContain("left to calculate");
    expect(diagram.getAttribute("data-derived-visible")).toBe("false");
    view.rerender(<WidgetRenderer spec={scale} value={{revealed:geometricConstraintExplorationKeys(scale)}} onChange={()=>{}} disabled={false} tone="info"/>);
    expect(screen.getByTestId("gcl-diagram").textContent).toContain("factor 16; area 96");
    expect(screen.getByTestId("gcl-diagram").getAttribute("aria-label")).toContain("real area 96");
  });

  it("withholds computed crossing angles, completed triangle angles, and Pythagorean areas",()=>{
    const angleView=show(angle,"neutral");
    let diagram=screen.getByTestId("gcl-diagram");
    expect(diagram.textContent).toContain("62°");
    expect(diagram.textContent).toContain("adjacent = ?");
    expect(diagram.textContent).not.toContain("118°");
    expect(diagram.getAttribute("aria-label")).not.toContain("118 degrees");
    angleView.rerender(<WidgetRenderer spec={angle} value={{revealed:geometricConstraintExplorationKeys(angle)}} onChange={()=>{}} disabled={false} tone="info"/>);
    expect(screen.getByTestId("gcl-diagram").textContent).toContain("adjacent = 118°");
    cleanup();

    const aaView=show(aa,"neutral");
    diagram=screen.getByTestId("gcl-diagram");
    expect(diagram.textContent).toContain("A: 50°, 60°, ?°");
    expect(diagram.textContent).not.toContain("70°");
    expect(diagram.getAttribute("aria-label")).toContain("similarity conclusion remain to determine");
    aaView.rerender(<WidgetRenderer spec={aa} value={{revealed:geometricConstraintExplorationKeys(aa)}} onChange={()=>{}} disabled={false} tone="info"/>);
    expect(screen.getByTestId("gcl-diagram").textContent).toContain("50°, 60°, 70°");
    cleanup();

    const pythView=show(pyth,"neutral");
    diagram=screen.getByTestId("gcl-diagram");
    expect(diagram.textContent).toContain("side 3");
    expect(diagram.textContent).toContain("side 4");
    expect(diagram.textContent).toContain("target ?");
    expect(diagram.textContent).not.toContain("area 9");
    expect(diagram.textContent).not.toContain("area 16");
    expect(diagram.textContent).not.toContain("hypotenuse = 5");
    expect(diagram.getAttribute("aria-label")).toContain("remain to calculate");
    pythView.rerender(<WidgetRenderer spec={pyth} value={{revealed:geometricConstraintExplorationKeys(pyth)}} onChange={()=>{}} disabled={false} tone="info"/>);
    expect(screen.getByTestId("gcl-diagram").textContent).toContain("area 9");
    expect(screen.getByTestId("gcl-diagram").textContent).toContain("area 16");
    expect(screen.getByTestId("gcl-diagram").textContent).toContain("hypotenuse = 5");
  });

  it("holds the partition target even though it is the left side of a ratio",()=>{
    const value={revealed:geometricConstraintExplorationKeys(partition),numeric:1};
    const view=show(partition,"neutral",value);
    const held=screen.getByRole("button",{name:/Complete the conclusion/i});
    expect(held.textContent).toContain("finish this conclusion yourself");
    expect(held.textContent).not.toContain("1 : 2");
    expect(screen.getByTestId("a11y-panel").textContent).toContain("finish this conclusion yourself");
    expect(screen.getByTestId("a11y-panel").textContent).not.toContain("convert fraction traveled to part ratio: 1 : 2");
    view.rerender(<WidgetRenderer spec={partition} value={value} onChange={()=>{}} disabled={false} tone="info"/>);
    expect(screen.getByRole("button",{name:/convert fraction traveled to part ratio/i}).textContent).toContain("1 : 2");
    expect(screen.getByTestId("a11y-panel").textContent).toContain("convert fraction traveled to part ratio: 1 : 2");
    expect(screen.getByTestId("gcl-ghost").textContent).toContain("1");
  });

  it("lets explore mode reveal its activated teaching stages and diagram progressively",()=>{
    const factorOnly={revealed:["scale:length","scale:area-factor"]};
    const view=show(scaleExplore,"neutral",factorOnly);
    expect(screen.getByTestId("gcl-diagram").textContent).toContain("factor 16; area ?");
    expect(screen.getByRole("button",{name:/square the scale for area/i}).textContent).toContain("area factor = 4² = 16");
    expect(screen.getByTestId("a11y-panel").textContent).toContain("area factor = 4² = 16");
    const complete={revealed:geometricConstraintExplorationKeys(scaleExplore)};
    view.rerender(<WidgetRenderer spec={scaleExplore} value={complete} onChange={()=>{}} disabled={false} tone="success"/>);
    expect(screen.getByTestId("gcl-diagram").textContent).toContain("factor 16; area 96");
    expect(screen.getByRole("button",{name:/apply the squared area factor/i}).textContent).toContain("6 × 16 = 96");
    expect(screen.getByTestId("a11y-panel").textContent).toContain("6 × 16 = 96");
  });

  it("renders primitive givens faithfully without fabricated geometry",()=>{
    const legView=show(missingLeg,"neutral");
    let diagram=screen.getByTestId("gcl-diagram");
    expect(diagram.textContent).toContain("side 6");
    expect(diagram.textContent).toContain("hypotenuse 10; target ?");
    expect(diagram.textContent).not.toContain("side 4");
    expect(diagram.textContent).not.toContain("area 16");
    expect(diagram.textContent).not.toContain("52");
    expect(screen.getByTestId("gcl-leg-square-a").getAttribute("width")).toBe(screen.getByTestId("gcl-leg-square-a").getAttribute("height"));
    expect(screen.getByTestId("gcl-leg-square-b").getAttribute("width")).toBe(screen.getByTestId("gcl-leg-square-b").getAttribute("height"));
    legView.rerender(<WidgetRenderer spec={missingLeg} value={{revealed:geometricConstraintExplorationKeys(missingLeg)}} onChange={()=>{}} disabled={false} tone="info"/>);
    expect(screen.getByTestId("gcl-diagram").textContent).toContain("missing leg = 8");
    cleanup();

    show(segmentLength,"neutral");
    expect(screen.getByTestId("gcl-span")).toBeTruthy();
    expect(screen.getByRole("img",{name:/given segment A to B/i})).toBeTruthy();
    cleanup();

    show(radical,"neutral");
    diagram=screen.getByTestId("gcl-coordinate-proof");
    expect(diagram.textContent?.match(/√18/g)).toHaveLength(4);
    expect(diagram.textContent).not.toContain("(3, 0)");
    expect(diagram.getAttribute("aria-label")).toContain("side measures √18, √18, √18, √18");
    cleanup();

    show(circleLine,"neutral");
    const circle=screen.getByTestId("gcl-circle"),cx=Number(circle.getAttribute("cx")),cy=Number(circle.getAttribute("cy")),r=Number(circle.getAttribute("r"));
    expect(cx-r).toBeGreaterThanOrEqual(0);expect(cx+r).toBeLessThanOrEqual(440);expect(cy-r).toBeGreaterThanOrEqual(0);expect(cy+r).toBeLessThanOrEqual(250);
    expect(screen.getByRole("img",{name:/circle and line intersection.*radius 5.*line y = 1x \+ 1/i})).toBeTruthy();
    expect(screen.getByTestId("a11y-panel").textContent).toContain("circle centre (0, 0) with radius 5");
    expect(screen.getByTestId("a11y-panel").textContent).not.toContain("circleLineIntersection");
  });

  it("places equal rectangle givens on opposite sides and marks the other opposite pair unknown",()=>{
    show(rectangle,"neutral");
    const labels=Array.from(screen.getByTestId("gcl-perimeter").querySelectorAll("text"),node=>node.textContent);
    expect(labels.slice(0,4)).toEqual(["5","?","5","?"]);
    expect(screen.getByRole("img",{name:/Opposite known sides 5 and 5/i})).toBeTruthy();
  });

  it("randomizes choice display reproducibly while preserving IDs and neutral process signals",()=>{
    const onChange=vi.fn(),onEvent=vi.fn();
    const view=render(<WidgetRenderer spec={aa} value={undefined} onChange={onChange} disabled={false} tone="neutral" seed="geometry:a" onEvent={onEvent}/>);
    const order=()=>within(screen.getByRole("group",{name:"Choose the geometry conclusion"})).getAllByRole("button").map(button=>button.textContent);
    const first=order();
    view.rerender(<WidgetRenderer spec={aa} value={undefined} onChange={onChange} disabled={false} tone="success" seed="geometry:a" onEvent={onEvent}/>);
    expect(order()).toEqual(first);
    view.rerender(<WidgetRenderer spec={aa} value={undefined} onChange={onChange} disabled={false} tone="neutral" seed="geometry:b" onEvent={onEvent}/>);
    expect(order()).not.toEqual(first);
    fireEvent.click(screen.getByRole("button",{name:"Yes, AA applies"}));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({choiceId:"yes"}));
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({control:"choice",dir:"neutral",state:{choiceId:"yes"}}));
  });

  it("does not turn numeric edits or stage opening into a correctness oracle",()=>{
    const onEvent=vi.fn(),onChange=vi.fn();
    render(<WidgetRenderer spec={scale} value={{revealed:[]}} onChange={onChange} disabled={false} tone="neutral" onEvent={onEvent}/>);
    fireEvent.click(screen.getAllByRole("button",{name:/Open geometric constraint stage/i})[0]!);
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({control:"reveal",dir:"neutral"}));
    fireEvent.change(screen.getByRole("spinbutton"),{target:{value:"96"}});
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({control:"numeric",dir:"neutral",state:{value:96}}));
  });
});
