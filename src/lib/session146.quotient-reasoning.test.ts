import { describe, expect, it } from "vitest";
import { evaluate, canCheck } from "./evaluate";
import { QuotientReasoningLabSpec, WidgetSpec, quotientReasoningTruth, quotientReasoningExplorationKeys, widgetIntegrityErrors } from "./schema";

const base = {
  type:"quotientReasoningLab" as const, task:"remainderContext" as const, answerMode:"numeric" as const,
  prompt:"100 riders use buses that hold 15. How many buses are needed?",
  dividend:{num:100,den:1}, divisor:{num:15,den:1}, candidates:[], contextPolicy:"roundUp" as const,
  choices:[], numericErrors:[{value:6,feedback:"Six buses leave ten riders without a seat."}], fractionErrors:[], authoredStages:[],
  requiredExplorations:4, tolerance:0, successFeedback:"The remainder requires one more bus, so 7.",
  explorationFeedback:"Inspect the quotient, product, remainder, and policy.", fallbackFeedback:"Interpret the remainder in context."
};

describe("quotientReasoningLab truth and integrity", () => {
  it("remains a plain ZodObject discriminated-union member", () => {
    expect(QuotientReasoningLabSpec._def.typeName).toBe("ZodObject");
    expect(WidgetSpec.safeParse(base).success).toBe(true);
  });
  it("derives the context answer from quotient, product, remainder, and policy", () => {
    const truth=quotientReasoningTruth(base);
    expect(truth.answerNumber).toBe(7);
    expect(truth.integerQuotient).toBe(6);
    expect(truth.remainder).toBe(10);
    expect(truth.stages.map((stage)=>stage.key)).toEqual(["integer:estimate","integer:product","integer:remainder","integer:policy"]);
  });
  it("filters fabricated exploration keys before grading", () => {
    expect(canCheck(base,{revealed:["fake:1","fake:2","fake:3","fake:4"],numeric:7})).toBe(false);
    expect(evaluate(base,{revealed:["fake:1","fake:2","fake:3","fake:4"],numeric:7}).correct).toBe(false);
    const revealed=quotientReasoningExplorationKeys(base);
    expect(evaluate(base,{revealed,numeric:7}).correct).toBe(true);
  });
  it("rejects impossible and ambiguous quotient states", () => {
    expect(widgetIntegrityErrors({...base,requiredExplorations:5})).toContainEqual(expect.stringContaining("exceeds"));
    const choice={...base,answerMode:"choice" as const,task:"remainderPolicy" as const,choices:[
      {id:"a",label:"Round up",claim:"policy:roundUp",feedback:"All riders need a seat."},
      {id:"b",label:"Also round up",claim:"policy:roundUp",feedback:"Duplicate claim."}
    ],numericErrors:[]};
    expect(widgetIntegrityErrors(choice)).toContain("quotientReasoningLab: mathematical choice claims must be unique");
  });
  it("derives recurring decimal fractions exactly", () => {
    const truth=quotientReasoningTruth({task:"repeatToFraction",repeatBlock:"45"});
    expect(truth.answerFraction).toEqual({num:5,den:11});
    expect(truth.stages).toHaveLength(4);
  });
});
