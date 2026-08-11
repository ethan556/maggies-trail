import { describe, expect, it } from "vitest";
import { PointSetReasoningLabSpec, pointSetReasoningExplorationKeys, pointSetReasoningTruth, widgetIntegrityErrors } from "./schema";
import { evaluate } from "./evaluate";
import { describeWidgetState } from "./describeState";

/**
 * S237 — THE UNIT-RATE TASK ON pointSetReasoningLab.
 *
 * WHY IT EXISTS. 45 authored steps across seven lessons ask a learner to read a rate *from a
 * graph* through a bare `numeric` box with no graph on screen. `pr-03-03` — "Reading a Story from
 * a Graph" — is five of them. Rewording those prompts would make them accurate and teach nothing:
 * "The graphed point (4, 20)" is answerable from the numbers alone, so deleting the word "graphed"
 * would leave a lesson whose stated skill is reading a figure and whose items never show one. The
 * fix has to be the figure, and no engine drew a point on a plane and graded a typed rate.
 *
 * WHAT IS ASSERTED HERE, AND WHY EACH ONE. The rate itself is the least interesting property; a
 * quotient is hard to get wrong. Three others are not:
 *
 *   1. INTEGRITY REJECTS A PICTURE THAT CONTRADICTS THE ANSWER. unitRate is the only task in this
 *      engine whose answer is a relationship BETWEEN the plotted points rather than a reading of
 *      one. Every other task can plot whatever it likes. Here a second point off the line through
 *      the origin would draw a graph the derived rate is false about — strictly worse than the
 *      no-graph state this task was added to end. Asserted as a rejection, not a rendering.
 *   2. THE SELF-CHECK. Each rejection test is paired with a spec that differs in exactly one
 *      number and must be ACCEPTED, so a check that rejected everything could not pass.
 *   3. THE DESCRIPTION MATCHES THE PICTURE. The ray through the origin is what makes this a
 *      proportional graph rather than a lone dot, so the accessible description has to name it.
 */

const carTrip = PointSetReasoningLabSpec.parse({
  type: "pointSetReasoningLab", task: "unitRate", answerMode: "numeric",
  prompt: "The graphed point (4, 20) represents a car trip. What is the rate?",
  xLabel: "hours", yLabel: "miles", answerUnit: "miles per hour",
  sets: [{ id: "trip", label: "the trip", points: [{ id: "p1", label: "the plotted point", x: 4, y: 20 }] }],
  targetSetId: "trip", targetPointId: "p1",
  choices: [], numericErrors: [{ value: 16, feedback: "That is 20 minus 4. The rate is 20 divided by 4." }],
  authoredStages: [], requiredStageKeys: ["point:p1", "rate:unit"], requiredExplorations: 2,
  successFeedback: "Yes — 20 miles over 4 hours is 5 miles per hour.",
  explorationFeedback: "Read the point and divide before checking.",
  fallbackFeedback: "20 divided by 4 is 5.", tolerance: 0,
});

describe("S237 pointSetReasoningLab unitRate", () => {
  it("derives the rate as output per one input", () => {
    expect(pointSetReasoningTruth(carTrip).answerNumber).toBe(5);
  });

  it("names the axes, the point, the origin line and the division", () => {
    expect(pointSetReasoningExplorationKeys(carTrip)).toEqual(["axis:x", "axis:y", "point:p1", "rate:origin", "rate:unit"]);
    const stages = pointSetReasoningTruth(carTrip).stages;
    expect(stages.find((s) => s.key === "rate:unit")?.value).toBe("20 ÷ 4 = 5 miles per hour");
    // The origin stage is the mathematical content of "proportional" — without it the item is a
    // division drill with a picture next to it.
    expect(stages.find((s) => s.key === "rate:origin")?.value).toContain("(0, 0)");
  });

  it("takes its unit phrase from the authored answerUnit and never composes one", () => {
    // The first draft built `${yLabel} per ${xLabel}` and printed "5 miles per hours" — the
    // derived-English defect CLAUDE.md bans. Both branches are pinned so it cannot come back:
    // with a unit, the authored string verbatim; without one, no unit phrase at all.
    const bare = PointSetReasoningLabSpec.parse({ ...carTrip, answerUnit: undefined });
    expect(pointSetReasoningTruth(bare).stages.find((s) => s.key === "rate:unit")?.value).toBe("20 ÷ 4 = 5");
    for (const stage of pointSetReasoningTruth(carTrip).stages) expect(stage.value).not.toContain("per hours");
  });

  it("grades the typed rate and keeps the authored misconception", () => {
    const revealed = pointSetReasoningExplorationKeys(carTrip);
    expect(evaluate(carTrip, { revealed, numeric: 5 }).correct).toBe(true);
    const wrong = evaluate(carTrip, { revealed, numeric: 16 });
    expect(wrong.correct).toBe(false);
    expect(wrong.feedback).toContain("20 minus 4");
    // Exploration is still required: the graph is the point of the item, so answering without
    // reading it is not a pass.
    expect(evaluate(carTrip, { revealed: [], numeric: 5 }).correct).toBe(false);
  });

  it("REJECTS a point off the proportional line, and accepts the same graph corrected", () => {
    const off = PointSetReasoningLabSpec.parse({
      ...carTrip,
      sets: [{ id: "trip", label: "the trip", points: [{ id: "p1", label: "a", x: 4, y: 20 }, { id: "p2", label: "b", x: 6, y: 25 }] }],
    });
    expect(widgetIntegrityErrors(off).some((e) => e.includes("off the proportional line"))).toBe(true);
    const on = PointSetReasoningLabSpec.parse({
      ...off,
      sets: [{ id: "trip", label: "the trip", points: [{ id: "p1", label: "a", x: 4, y: 20 }, { id: "p2", label: "b", x: 6, y: 30 }] }],
    });
    expect(widgetIntegrityErrors(on)).toEqual([]);
  });

  it("REJECTS a zero input, and accepts the origin as a companion point", () => {
    const zero = PointSetReasoningLabSpec.parse({
      ...carTrip,
      sets: [{ id: "trip", label: "the trip", points: [{ id: "p1", label: "a", x: 0, y: 20 }] }],
      requiredStageKeys: [], requiredExplorations: 1,
    });
    expect(widgetIntegrityErrors(zero).some((e) => e.includes("nonzero input"))).toBe(true);
    // (0, 0) is ON every line through the origin, so plotting it must stay legal — a check that
    // treated it as an outlier would forbid the most useful second point an author can draw.
    const withOrigin = PointSetReasoningLabSpec.parse({
      ...carTrip,
      sets: [{ id: "trip", label: "the trip", points: [{ id: "p1", label: "a", x: 4, y: 20 }, { id: "o", label: "start", x: 0, y: 0 }] }],
    });
    expect(widgetIntegrityErrors(withOrigin)).toEqual([]);
  });

  it("REJECTS a missing y-value — a rate cannot be read off a number line", () => {
    const flat = PointSetReasoningLabSpec.parse({
      ...carTrip,
      sets: [{ id: "trip", label: "the trip", points: [{ id: "p1", label: "a", x: 4 }] }],
      requiredStageKeys: [], requiredExplorations: 1,
    });
    expect(widgetIntegrityErrors(flat).some((e) => e.includes("coordinate tasks require y-values"))).toBe(true);
  });

  it("REJECTS a numeric trap that collides with the derived rate", () => {
    const collide = PointSetReasoningLabSpec.parse({
      ...carTrip,
      numericErrors: [{ value: 5, feedback: "This trap is the answer, which would grade a correct learner wrong." }],
    });
    expect(widgetIntegrityErrors(collide).some((e) => e.includes("collides with the correct answer"))).toBe(true);
  });

  it("the description names the origin line, and only for this task", () => {
    const described = describeWidgetState(carTrip, { revealed: [], numeric: null });
    expect(described).toContain("Horizontal axis hours; vertical axis miles.");
    expect(described).toContain("straight line runs from the origin");
    const read = PointSetReasoningLabSpec.parse({ ...carTrip, task: "pointRead", targetAxis: "y", requiredStageKeys: [], requiredExplorations: 1 });
    expect(describeWidgetState(read, { revealed: [], numeric: null })).not.toContain("straight line");
  });

  it("SELF-CHECK: the ten pre-existing tasks are untouched", () => {
    const range = PointSetReasoningLabSpec.parse({
      type: "pointSetReasoningLab", task: "rangeValue", answerMode: "numeric", prompt: "Find the range.",
      xLabel: "value", sets: [{ id: "d", label: "data", points: [{ id: "a", label: "2", x: 2 }, { id: "b", label: "10", x: 10 }] }],
      targetSetId: "d", choices: [], numericErrors: [], authoredStages: [],
      requiredStageKeys: ["range:span"], requiredExplorations: 3,
      successFeedback: "The range is 8.", explorationFeedback: "Inspect the endpoints.", fallbackFeedback: "Subtract.", tolerance: 0,
    });
    expect(pointSetReasoningTruth(range).answerNumber).toBe(8);
    expect(widgetIntegrityErrors(range)).toEqual([]);
  });
});
