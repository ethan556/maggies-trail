import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import {
  ProportionalReasoningLabSpec,
  proportionalReasoningChoiceCorrect,
  proportionalReasoningExplorationKeys,
  proportionalReasoningTruth,
  widgetIntegrityErrors,
} from "./schema";
import fs from "node:fs";
import path from "node:path";

const base = ProportionalReasoningLabSpec.parse({
  type: "proportionalReasoningLab", task: "bestRate", answerMode: "choice",
  prompt: "Which deal has the lower cost per notebook?", xLabel: "notebooks", yLabel: "dollars",
  series: [
    { id: "a", label: "Deal A", pairs: [[4, 6]] },
    { id: "b", label: "Deal B", pairs: [[6, 8.4]] },
  ], optimize: "min",
  choices: [
    { id: "a", label: "Deal A", claim: "series:a", feedback: "That compares the sticker totals rather than dollars per one notebook." },
    { id: "b", label: "Deal B", claim: "series:b", feedback: "Deal B has the smaller normalized cost per notebook." },
  ], requiredExplorations: 2,
  successFeedback: "Deal B has the lower unit price.",
  explorationFeedback: "Normalize both deals before choosing.",
  fallbackFeedback: "Compare dollars per one notebook, not the sticker totals.",
});

const targetLessons = [
  "content/courses/ratios-rates/lessons/rr-03-02.json",
  "content/courses/ratios-rates/lessons/rr-03-03.json",
  "content/courses/ratios-rates/lessons/rr-05-03.json",
  "content/courses/proportional-relationships/lessons/pr-02-01.json",
  "content/courses/proportional-relationships/lessons/pr-02-03.json",
];

describe("Session 144 proportionalReasoningLab truth model", () => {
  it("derives unit rate, comparison, prediction, percent, and discount from one multiplicative model", () => {
    expect(proportionalReasoningTruth(base).answerClaim).toBe("series:b");
    const prediction = ProportionalReasoningLabSpec.parse({ ...base, task:"predictOutput", answerMode:"numeric", series:[{id:"r",label:"rate",pairs:[[3,12]]}], targetSeriesId:"r", targetInput:8, choices:[], numericErrors:[], answerUnit:"items", requiredExplorations:2 });
    expect(proportionalReasoningTruth(prediction).answerNumber).toBe(32);
    const percent = ProportionalReasoningLabSpec.parse({ ...prediction, task:"percentOf", series:[{id:"p",label:"percent",pairs:[[100,25]]}], targetSeriesId:"p", targetInput:80, percent:25 });
    expect(proportionalReasoningTruth(percent).answerNumber).toBe(20);
    const discount = ProportionalReasoningLabSpec.parse({ ...prediction, task:"discount", series:[{id:"p",label:"price",pairs:[[1,5]]}], targetSeriesId:"p", targetInput:8, percent:25, requiredExplorations:3 });
    expect(proportionalReasoningTruth(discount).answerNumber).toBe(30);
  });

  it("counts only truth-model exploration keys and rejects fabricated bypass state", () => {
    const keys=proportionalReasoningExplorationKeys(base);
    expect(keys).toEqual(["a:0","b:0","stage:0"]);
    expect(evaluate(base,{verifiedUnitRates:["fake:0","fake:1"],choiceId:"b"})).toEqual({correct:false,feedback:base.explorationFeedback});
    expect(evaluate(base,{unitRates:{"a:0":1.5,"b:0":1.4},verifiedUnitRates:["a:0","b:0"],choiceId:"b"})).toEqual({correct:true,feedback:base.successFeedback});
  });

  it("rejects collisions, impossible prediction truth, and overclaimed exploration", () => {
    expect(widgetIntegrityErrors({...base,series:[base.series[0],{...base.series[1],id:"a"}]} as typeof base)).toContain("proportionalReasoningLab: series ids must be unique");
    expect(widgetIntegrityErrors({...base,choices:[base.choices[0],{...base.choices[1],claim:"series:a"}]} as typeof base)).toContain("proportionalReasoningLab: mathematical choice claims must be unique");
    const broken=ProportionalReasoningLabSpec.parse({...base,task:"predictOutput",answerMode:"numeric",series:[{id:"t",label:"table",pairs:[[1,2],[2,5]]}],targetSeriesId:"t",targetInput:3,optimize:undefined,choices:[],numericErrors:[],requiredExplorations:2});
    expect(widgetIntegrityErrors(broken)).toContain("proportionalReasoningLab: predictOutput requires a constant target ratio");
    expect(widgetIntegrityErrors({...base,requiredExplorations:4})).toContain("proportionalReasoningLab: requiredExplorations 4 exceeds 3 inspectable states");
  });

  it("derives exactly one choice rather than trusting an authored correctness flag", () => {
    expect(base.choices.filter((choice)=>proportionalReasoningChoiceCorrect(base,choice)).map((choice)=>choice.id)).toEqual(["b"]);
  });

  it("parses and independently validates all 38 converted authored surfaces", () => {
    let surfaces=0;
    for(const rel of targetLessons){
      const lesson=JSON.parse(fs.readFileSync(path.join(process.cwd(),rel),"utf8"));
      const steps=[...lesson.steps.filter((step: {widget?:unknown})=>step.widget),...lesson.remedials.map((r:{check:unknown})=>r.check).filter((step:{widget?:unknown})=>step.widget)];
      for(const step of steps){
        const spec=ProportionalReasoningLabSpec.parse(step.widget);
        expect(widgetIntegrityErrors(spec),`${lesson.id}/${step.id}`).toEqual([]);
        surfaces++;
      }
    }
    expect(surfaces).toBe(38);
  });
});
