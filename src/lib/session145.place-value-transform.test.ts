import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { evaluate } from "./evaluate";
import {
  PlaceValueTransformLabSpec,
  placeValueTransformChoiceCorrect,
  placeValueTransformExplorationKeys,
  placeValueTransformTruth,
  widgetIntegrityErrors,
} from "./schema";
import type { PlaceValueTransformTruthInput } from "./schema";

/** Fixtures pass full widget specs as fresh literals; `placeValueTransformTruth` reads a
 * subset. Inferring T from the literal keeps excess-property checking honest without
 * widening the helper's own parameter type. */
const placeValueTransformTruthFixture = <T extends PlaceValueTransformTruthInput>(s: T) => placeValueTransformTruth(s);

const base=PlaceValueTransformLabSpec.parse({
  type:"placeValueTransformLab",task:"round",answerMode:"numeric",prompt:"Round 12.86 to the nearest tenth.",
  values:[12.86],targetExponent:-1,choices:[],numericErrors:[{value:12.8,feedback:"That truncates instead of using the hundredths digit."}],
  requiredExplorations:3,successFeedback:"The hundredths digit is 6, so 12.86 rounds to 12.9.",explorationFeedback:"Inspect the exact, target, and deciding places.",fallbackFeedback:"Use the digit immediately right of the target place."
});
const targetLessons=[
 "content/courses/place-value-million/lessons/pv2-03-02.json",
 "content/courses/decimal-operations/lessons/dop-05-03.json",
 "content/courses/decimals-place-value/lessons/dpv-01-03.json",
 "content/courses/decimals-place-value/lessons/dpv-03-01.json",
 "content/courses/decimals-place-value/lessons/dpv-04-03.json",
 "content/courses/exponents-scientific-notation/lessons/esn-01-02.json",
 "content/courses/exponents-scientific-notation/lessons/esn-01-03.json",
];

describe("Session 145 placeValueTransformLab truth model",()=>{
 it("derives shifts, comparisons, rounding, division, exponent chains, and scientific form from one base-ten model",()=>{
  expect(placeValueTransformTruthFixture({...base,task:"shift",values:[0.03],shiftExponent:2,targetExponent:undefined}).answerNumber).toBe(3);
  expect(placeValueTransformTruthFixture({...base,task:"compare",answerMode:"choice",values:[0.409,0.41],targetExponent:undefined}).answerClaim).toBe("relation:lt");
  expect(placeValueTransformTruth(base).answerNumber).toBe(12.9);
  expect(placeValueTransformTruthFixture({...base,task:"decimalDivision",values:[1.5,0.5],targetExponent:undefined}).answerNumber).toBe(3);
  expect(placeValueTransformTruthFixture({...base,task:"exponentChain",values:[5,-8,-2],exponentOps:["add","subtract"],targetExponent:undefined}).answerNumber).toBe(-1);
  expect(placeValueTransformTruthFixture({...base,task:"scientificForm",answerMode:"choice",values:[0.007],targetExponent:undefined}).answerClaim).toBe("scientific:7:-3");
 });
 it("counts only derived exploration keys and rejects fabricated bypass state",()=>{
  const keys=placeValueTransformExplorationKeys(base);
  expect(keys).toEqual(["round:exact","round:target","round:decider"]);
  expect(evaluate(base,{revealed:["fake:1","fake:2","fake:3"],numeric:12.9})).toEqual({correct:false,feedback:base.explorationFeedback});
  expect(evaluate(base,{revealed:keys,numeric:12.9})).toEqual({correct:true,feedback:base.successFeedback});
 });
 it("rejects impossible and ambiguous mathematical states",()=>{
  expect(widgetIntegrityErrors({...base,requiredExplorations:4})).toContain("placeValueTransformLab: requiredExplorations 4 exceeds 3 inspectable states");
  const divide=PlaceValueTransformLabSpec.parse({...base,task:"decimalDivision",values:[3.6,0],targetExponent:undefined,requiredExplorations:2});
  expect(widgetIntegrityErrors(divide)).toContain("placeValueTransformLab: decimalDivision cannot divide by zero");
  const choice=PlaceValueTransformLabSpec.parse({...base,task:"compare",answerMode:"choice",values:[0.7,0.68],targetExponent:undefined,numericErrors:[],requiredExplorations:1,choices:[
   {id:"gt",label:">",claim:"relation:gt",feedback:"The tenths place decides."},
   {id:"lt",label:"<",claim:"relation:lt",feedback:"That reverses the first unequal place."},
  ]});
  expect(choice.choices.filter(c=>placeValueTransformChoiceCorrect(choice,c)).map(c=>c.id)).toEqual(["gt"]);
  expect(widgetIntegrityErrors({...choice,choices:[choice.choices[0],{...choice.choices[1],claim:"relation:gt"}]})).toContain("placeValueTransformLab: mathematical choice claims must be unique");
 });
 it("parses and independently validates all 50 converted authored surfaces",()=>{
  let count=0;
  for(const rel of targetLessons){
   const lesson=JSON.parse(fs.readFileSync(path.join(process.cwd(),rel),"utf8"));
   const steps=[...lesson.steps.filter((s:{widget?:unknown})=>s.widget),...lesson.remedials.map((r:{check:unknown})=>r.check).filter((s:{widget?:unknown})=>s.widget)];
   for(const step of steps){const spec=PlaceValueTransformLabSpec.parse(step.widget);expect(widgetIntegrityErrors(spec),`${lesson.id}/${step.id}`).toEqual([]);count++;}
  }
  expect(count).toBe(50);
 });
});
