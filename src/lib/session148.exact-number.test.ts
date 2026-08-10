import { describe, expect, it } from "vitest";
import { ExactNumberLabSpec, WidgetSpec, exactNumberChoiceCorrect, exactNumberExplorationKeys, exactNumberTruth, widgetIntegrityErrors } from "./schema";
import { evaluate } from "./evaluate";

const relation = ExactNumberLabSpec.parse({ type:"exactNumberLab",task:"fractionCompare",answerMode:"relation",prompt:"Compare 2/5 and 3/4.",values:[{id:"a",label:"2/5",kind:"rational",num:2,den:5},{id:"b",label:"3/4",kind:"rational",num:3,den:4}],choices:[],numericErrors:[],authoredStages:[],requiredStageKeys:["benchmark:a","benchmark:b","compare:exact"],requiredExplorations:3,tolerance:0,successFeedback:"3/4 is greater.",explorationFeedback:"Inspect all exact states.",fallbackFeedback:"Compare exactly." });

describe("Session 148 exact-number truth", () => {
  it("remains a plain discriminated-union member", () => expect(WidgetSpec.parse(relation).type).toBe("exactNumberLab"));
  it("derives comparison and blocks fabricated exploration", () => {
    expect(exactNumberTruth(relation).answerRelation).toBe("lt");
    const revealed=exactNumberExplorationKeys(relation);
    expect(evaluate(relation,{revealed,relation:"lt"}).correct).toBe(true);
    expect(evaluate(relation,{revealed:["fake:a","fake:b","fake:c"],relation:"lt"}).correct).toBe(false);
  });
  it("allows repeated operands but rejects duplicate selectable roots", () => {
    const repeated=ExactNumberLabSpec.parse({ ...relation,task:"rationalOperation",answerMode:"numeric",values:[{id:"a",label:"left -7",kind:"rational",num:-7,den:1},{id:"b",label:"right -7",kind:"rational",num:-7,den:1}],operation:"multiply",requiredStageKeys:["rational:normalize","rational:operate"],requiredExplorations:2,numericErrors:[] });
    expect(widgetIntegrityErrors(repeated)).toEqual([]);
    const roots=ExactNumberLabSpec.parse({ ...relation,task:"rootSelect",answerMode:"choice",targetClass:"rational",values:[{id:"a",label:"first",kind:"root",radicand:4},{id:"b",label:"second",kind:"root",radicand:4}],choices:[{id:"ok",label:"sqrt 4",feedback:"yes",source:{id:"c",label:"sqrt 4",kind:"root",radicand:4}},{id:"bad",label:"sqrt 5",feedback:"no",source:{id:"d",label:"sqrt 5",kind:"root",radicand:5}}],requiredStageKeys:["root:a","root:b"],requiredExplorations:2 });
    expect(widgetIntegrityErrors(roots)).toContain("exactNumberLab: selectable mathematical sources must be unique");
  });
  it("uses exactly one typed choice truth carrier", () => {
    const choice=ExactNumberLabSpec.parse({ ...relation,task:"powerCompare",answerMode:"choice",values:[{id:"a",label:"2^3",kind:"power",base:2,exponent:3},{id:"b",label:"3^2",kind:"power",base:3,exponent:2}],choices:[{id:"ok",label:"2^3 < 3^2",feedback:"yes",relation:"lt"},{id:"bad",label:"2^3 > 3^2",feedback:"no",claim:"misconception:compare"}],requiredStageKeys:["power:a:expand","power:a:value","power:b:expand","power:b:value"],requiredExplorations:4 });
    expect(choice.choices.filter(c=>exactNumberChoiceCorrect(choice,c))).toHaveLength(1);
  });
});
