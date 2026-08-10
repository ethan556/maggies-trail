import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { GraphStoryLabSpec, graphStoryGeometry, graphStoryTruth, widgetIntegrityErrors } from "./schema";

const build = {
  type: "graphStoryLab" as const, mode: "build" as const,
  prompt: "A car speeds up, stops, then moves steadily.", axisContext: "distanceFromOrigin" as const,
  distanceRule: "awayOnly" as const, xAxisLabel: "time", yAxisLabel: "distance",
  segments: [
    { id:"s1", label:"Speeds up", kind:"riseConcaveUp" as const, meaning:"Distance increases faster and faster." },
    { id:"s2", label:"Stops", kind:"flat" as const, meaning:"Distance stays fixed." },
    { id:"s3", label:"Moves steadily", kind:"riseSteady" as const, meaning:"Distance increases at a constant rate." }
  ], choices: [], bank: [
    { id:"b1", label:"Steepening rise", kind:"riseConcaveUp" as const, meaning:"The positive rate grows." },
    { id:"b2", label:"Flat", kind:"flat" as const, meaning:"No change." },
    { id:"b3", label:"Straight rise", kind:"riseSteady" as const, meaning:"Constant positive rate." },
    { id:"b4", label:"Fall", kind:"fallSteady" as const, meaning:"Distance decreases." },
    { id:"b5", label:"One steep straight rise", kind:"riseSteep" as const, meaning:"A fast but constant positive rate." }
  ], wrongSequences: [
    { label:"Stop first", kinds:["flat","riseConcaveUp","riseSteady"] as const, feedback:"The story begins with speeding up, not with a stopped interval." },
    { label:"Vertical-looking jump", kinds:["riseSteep","flat","riseSteady"] as const, feedback:"Speeding up needs changing steepness, not one constant steep segment." }
  ], answerLabel:"A steepening curve, then flat, then a straight rise",
  successFeedback:"The graph preserves acceleration, the stop, and steady motion in order.",
  explorationFeedback:"Assemble all three stages in story order before checking.",
  fallbackFeedback:"Match each story stage to direction, rate, and order before checking."
};

describe("Session 143 graphStoryLab truth model", () => {
  it("derives geometry, narration, grading, and answer from one ordered segment truth", () => {
    const spec=GraphStoryLabSpec.parse(build);
    const truth=graphStoryTruth(spec);
    expect(truth.targetKinds).toEqual(["riseConcaveUp","flat","riseSteady"]);
    expect(truth.geometry).toEqual(graphStoryGeometry(truth.targetKinds));
    expect(truth.narration).toMatch(/gets steeper.*flat.*straight rising/i);
    expect(evaluate(spec,{segmentIds:["b1","b2","b3"]})).toEqual({correct:true,feedback:build.successFeedback});
  });
  it("keeps stage order and concavity diagnosable", () => {
    const spec=GraphStoryLabSpec.parse(build);
    expect(evaluate(spec,{segmentIds:["b2","b1","b3"]}).feedback).toBe(build.wrongSequences[0].feedback);
    expect(evaluate(spec,{segmentIds:["b1","b3","b2"]}).correct).toBe(false);
  });
  it("rejects an away-only distance truth that slopes down through widget integrity", () => {
    const spec = GraphStoryLabSpec.parse({...build,segments:[{...build.segments[0],kind:"fallSteady"}]});
    expect(widgetIntegrityErrors(spec)).toContain("graphStoryLab: away-only distance graphs cannot fall");
  });
  it("distinguishes concave-up and concave-down curve geometry", () => {
    const up=graphStoryGeometry(["riseConcaveUp"])[0]!.path;
    const down=graphStoryGeometry(["riseConcaveDown"])[0]!.path;
    expect(up).not.toBe(down);
  });
  it("rejects duplicate mathematical identities and target-shaped wrong paths", () => {
    const spec=GraphStoryLabSpec.parse({...build,wrongSequences:[build.wrongSequences[0]]});
    expect(widgetIntegrityErrors({...spec,bank:[spec.bank[0],{...spec.bank[1],id:spec.bank[0].id}]} as typeof spec)).toContain("graphStoryLab: bank ids must be unique");
    expect(widgetIntegrityErrors({...spec,wrongSequences:[{label:"wrong",kinds:spec.segments.map(s=>s.kind),feedback:"This cannot be a wrong route."}]})).toContain("graphStoryLab: wrong sequence duplicates the target truth");
  });
});
