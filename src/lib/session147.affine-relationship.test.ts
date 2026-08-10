import { describe, expect, it } from "vitest";
import { canCheck, evaluate } from "./evaluate";
import { AffineRelationshipLabSpec, WidgetSpec, affineRelationshipTruth, affineRelationshipExplorationKeys, widgetIntegrityErrors } from "./schema";
import type { AffineRelationshipTruthInput } from "./schema";

/** Fixtures pass full widget specs as fresh literals; `affineRelationshipTruth` reads a subset.
 * Inferring T from the literal keeps excess-property checking honest without
 * widening the helper's own parameter type. */
const affineRelationshipTruthFixture = <T extends AffineRelationshipTruthInput>(s: T) => affineRelationshipTruth(s);


const base={type:"affineRelationshipLab" as const,task:"compareRateAndStart" as const,answerMode:"choice" as const,prompt:"Compare the two relationships.",lines:[{id:"a",label:"A",m:3,b:2,sourceKind:"equation" as const,sourceText:"y = 3x + 2",tablePoints:[]},{id:"b",label:"B",m:2,b:5,sourceKind:"table" as const,sourceText:"(0,5), (1,7)",tablePoints:[[0,5],[1,7]] as [number,number][]}],rateGoal:"greater" as const,choices:[{id:"right",label:"B starts higher, but A grows faster",claim:"compare:rate:a:start:b",feedback:"The rate and initial value are both compared."},{id:"swap",label:"A starts higher and grows faster",claim:"misconception:swap",feedback:"The intercept is the value at x = 0."}],numericErrors:[],pointErrors:[],authoredStages:[],requiredStageKeys:["compare:rates","compare:starts"],requiredExplorations:2,tolerance:0,successFeedback:"A grows faster while B starts higher.",explorationFeedback:"Inspect both comparisons.",fallbackFeedback:"Separate slope from intercept."};

describe("affineRelationshipLab truth and integrity",()=>{
 it("remains a plain ZodObject union member",()=>{expect(AffineRelationshipLabSpec._def.typeName).toBe("ZodObject");expect(WidgetSpec.safeParse(base).success).toBe(true)});
 it("derives rate and start independently",()=>{const t=affineRelationshipTruth(base);expect(t.answerClaim).toBe("compare:rate:a:start:b");expect(t.stages.map(s=>s.key)).toContain("compare:rates");expect(t.stages.map(s=>s.key)).toContain("compare:starts")});
 it("derives evaluation, intersection, and point verification",()=>{expect(affineRelationshipTruthFixture({...base,task:"evaluateAtX",answerMode:"numeric",targetLineId:"a",targetInput:4,choices:[],requiredStageKeys:["evaluate:a:value"]}).answerNumber).toBe(14);const intersection=affineRelationshipTruthFixture({...base,task:"intersectionPoint",answerMode:"point",choices:[],requiredStageKeys:["intersection:verify"]});expect(intersection.answerPoint).toEqual([3,11]);expect(affineRelationshipTruthFixture({...base,task:"verifyPoint",answerMode:"choice",candidatePoint:[3,11],choices:[{id:"yes",label:"Yes",claim:"point:yes",feedback:"Both equations hold."}],requiredStageKeys:["verify:a","verify:b"]}).answerClaim).toBe("point:yes")});
 it("requires exact valid exploration keys",()=>{expect(canCheck(base,{revealed:["fabricated:0","fabricated:1"],choiceId:"right"})).toBe(false);expect(evaluate(base,{revealed:["fabricated:0","fabricated:1"],choiceId:"right"}).correct).toBe(false);const revealed=affineRelationshipExplorationKeys(base);expect(evaluate(base,{revealed,choiceId:"right"}).correct).toBe(true)});
 it("rejects off-line tables, parallel intersections, and duplicate mathematical claims",()=>{expect(widgetIntegrityErrors({...base,lines:[{...base.lines[0],tablePoints:[[0,99]]}]})).toContainEqual(expect.stringContaining("table point"));expect(widgetIntegrityErrors({...base,task:"intersectionPoint",answerMode:"point",lines:[base.lines[0],{...base.lines[1],m:3}],choices:[]})).toContainEqual(expect.stringContaining("nonparallel"));expect(widgetIntegrityErrors({...base,choices:[base.choices[0],{...base.choices[1],claim:base.choices[0].claim}]})).toContain("affineRelationshipLab: mathematical choice claims must be unique")});
});
