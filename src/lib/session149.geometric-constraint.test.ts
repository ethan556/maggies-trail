import { describe, expect, it } from "vitest";
import { GeometricConstraintLabSpec, WidgetSpec, geometricConstraintChoiceCorrect, geometricConstraintExplorationKeys, geometricConstraintTruth, widgetIntegrityErrors } from "./schema";
import { evaluate } from "./evaluate";

const perimeter = GeometricConstraintLabSpec.parse({ type:"geometricConstraintLab",task:"perimeterMissing",answerMode:"numeric",prompt:"A rectangle has perimeter 26 and two length sides of 8.",perimeter:{shape:"rectangle",perimeter:26,knownSides:[8,8],unknownMultiplicity:2},choices:[],numericErrors:[{value:10,feedback:"That is both widths together."}],authoredStages:[],requiredStageKeys:["perimeter:total","perimeter:known","perimeter:remaining","perimeter:split"],requiredExplorations:4,tolerance:0,successFeedback:"Each width is 5.",explorationFeedback:"Inspect all constraints.",fallbackFeedback:"Subtract and split." });

describe("Session 149 geometric-constraint truth", () => {
  it("remains a plain discriminated-union member", () => expect(WidgetSpec.parse(perimeter).type).toBe("geometricConstraintLab"));
  it("derives the missing side and blocks fabricated exploration", () => {
    expect(geometricConstraintTruth(perimeter).answerNumber).toBe(5);
    const revealed=geometricConstraintExplorationKeys(perimeter);
    expect(evaluate(perimeter,{revealed,numeric:5}).correct).toBe(true);
    expect(evaluate(perimeter,{revealed:["fake:a","fake:b","fake:c","fake:d"],numeric:5}).correct).toBe(false);
  });
  it("squares a length scale for area", () => {
    const scale=GeometricConstraintLabSpec.parse({...perimeter,task:"scaledArea",scale:{drawingArea:6,lengthScale:4,target:"realArea"},perimeter:undefined,requiredStageKeys:["scale:length","scale:area-factor","scale:drawing-area","scale:real-area"],requiredExplorations:4,numericErrors:[]});
    expect(geometricConstraintTruth(scale).answerNumber).toBe(96);
  });
  it("distinguishes vertical equality from adjacent supplements", () => {
    const angle=GeometricConstraintLabSpec.parse({...perimeter,task:"angleCrossing",answerMode:"choice",perimeter:undefined,angle:{knownAngle:62,target:"whyVertical"},choices:[{id:"ok",label:"Both supplement the same adjacent angle",feedback:"yes",claim:"angle:shared-supplement"},{id:"bad",label:"They are adjacent",feedback:"no",claim:"misconception:adjacent"}],numericErrors:[],requiredStageKeys:["angle:vertical","angle:adjacent"],requiredExplorations:2});
    expect(angle.choices.filter(c=>geometricConstraintChoiceCorrect(angle,c))).toHaveLength(1);
  });
  it("rejects coordinate dimensions that disagree with plotted points", () => {
    const coordinate=GeometricConstraintLabSpec.parse({...perimeter,task:"coordinateArea",perimeter:undefined,coordinate:{pieces:[{id:"r",label:"rectangle",kind:"rectangle",x:0,y:0,width:5,height:3,operation:"add",points:[[0,0],[4,0],[4,3],[0,3]]}],target:"piece",targetPieceId:"r"},requiredStageKeys:["coordinate:r:dimensions","coordinate:r:area"],requiredExplorations:2,numericErrors:[]});
    expect(widgetIntegrityErrors(coordinate)).toContain("geometricConstraintLab: coordinate piece r dimensions disagree with its points");
  });
});
