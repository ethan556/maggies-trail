// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describeWidgetState } from "@/lib/describeState";
import { WidgetRenderer } from "@/components/widgets";
import type { TWidget } from "@/lib/schema";

afterEach(cleanup);

const matrix = {
  type: "matrixTransform",
  prompt: "Stretch the square.",
  ta: 2, tb: 0, tc: 0, td: 1,
  sa: 1, sb: 0, sc: 0, sd: 1,
  targetName: "the wide slab",
  successFeedback: "ok", swappedFeedback: "s", signFeedback: "g", fallbackFeedback: "f"
} as TWidget;

describe("describeWidgetState — the labs' text twin", () => {
  it("matrixTransform narrates columns, landing spots, and signed area from the SAME numbers the grader uses", () => {
    const d = describeWidgetState(matrix, { a: 2, b: 0, c: 0, d: 1 })!;
    expect(d).toContain("î lands at (2, 0)");
    expect(d).toContain("ĵ lands at (0, 1)");
    expect(d).toContain("signed area 2");
    expect(d).toContain("wants î at (2, 0)");
  });

  it("matrixTransform flags a flip and a flattening", () => {
    expect(describeWidgetState(matrix, { a: 0, b: 1, c: 1, d: 0 })).toContain("orientation is flipped");
    expect(describeWidgetState(matrix, { a: 1, b: 1, c: 1, d: 1 })).toContain("flattened to a line");
  });

  it("systemsExplore names which line(s) the point sits on, with the miss distances visible", () => {
    const spec = {
      type: "systemsExplore", prompt: "p", m1: 1, b1: 0, m2: -1, b2: 4,
      xMin: -5, xMax: 5, yMin: -5, yMax: 5, xStart: 0, yStart: 0,
      successFeedback: "s", offLine1Feedback: "o1", offLine2Feedback: "o2"
    } as TWidget;
    expect(describeWidgetState(spec, { x: 2, y: 2 })).toContain("on BOTH lines");
    expect(describeWidgetState(spec, { x: 1, y: 1 })).toContain("on the first line only");
    expect(describeWidgetState(spec, { x: 0, y: 2 })).toContain("on neither line");
  });

  it("riemannSum reports the live estimate against the true area", () => {
    const spec = {
      type: "riemannSum", prompt: "p", fn: "square", a: 0, b: 3, tolerance: 0.5,
      nStart: 4, ruleStart: "left", successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as TWidget;
    const d = describeWidgetState(spec, { n: 4, rule: "left" })!;
    expect(d).toContain("4 strips");
    expect(d).toContain("left-endpoint");
    expect(d).toContain("true area of 9");
  });

  it("secantSlope guards the h = 0 degeneracy instead of printing NaN", () => {
    const spec = {
      type: "secantSlope", prompt: "p", curve: "square", mode: "limit", a: 1,
      targetH: 0.1, startH: 1.5, successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as TWidget;
    expect(describeWidgetState(spec, 0)).toContain("undefined");
    expect(describeWidgetState(spec, 2)).toContain("slope 4");
  });

  it("returns null for widgets whose controls already narrate themselves", () => {
    const numeric = { type: "numeric", prompt: "p", answer: 3, tolerance: 0, commonErrors: [], fallbackFeedback: "f" } as TWidget;
    expect(describeWidgetState(numeric, 3)).toBeNull();
  });
});

describe("the on-screen panel", () => {
  it("renders as a collapsed details block for dense labs and tracks the value", () => {
    const { rerender } = render(
      <WidgetRenderer spec={matrix} value={{ a: 2, b: 0, c: 0, d: 1 }} onChange={() => {}} disabled={false} />
    );
    const summary = screen.getByText("Describe this model");
    expect(summary).toBeTruthy();
    fireEvent.click(summary);
    expect(screen.getByText(/signed area 2/)).toBeTruthy();
    rerender(<WidgetRenderer spec={matrix} value={{ a: 3, b: 0, c: 0, d: 1 }} onChange={() => {}} disabled={false} />);
    expect(screen.getByText(/signed area 3/)).toBeTruthy();
  });

  it("does not render for self-narrating widgets", () => {
    const numeric = { type: "numeric", prompt: "p", answer: 3, tolerance: 0, commonErrors: [], fallbackFeedback: "f" } as TWidget;
    render(<WidgetRenderer spec={numeric} value={null} onChange={() => {}} disabled={false} />);
    expect(screen.queryByText("Describe this model")).toBeNull();
  });
});

describe("follow-on labs", () => {
  it("quadDrag names the pinned corners, the live corner, and the target", () => {
    const spec = {
      type: "quadDrag", prompt: "p", fixed: [[0,0],[4,0],[4,3]], targetX: 0, targetY: 3,
      startX: 1, startY: 1, gridMax: 8, targetName: "a rectangle",
      successFeedback: "s", missFeedback: "m"
    } as unknown as TWidget;
    const d = describeWidgetState(spec, { x: 2, y: 2 })!;
    expect(d).toContain("(0, 0), (4, 0), (4, 3)");
    expect(d).toContain("currently at (2, 2)");
    expect(d).toContain("target corner is (0, 3)");
  });

  it("slopeField describes the field's rule and both launch heights", () => {
    const spec = {
      type: "slopeField", prompt: "p", equation: "decay", targetY0: 4, startY0: 1,
      successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as TWidget;
    const d = describeWidgetState(spec, 2)!;
    expect(d).toContain("decay proportional to y");
    expect(d).toContain("y(0) = 2");
    expect(d).toContain("target launch height is y(0) = 4");
  });

  it("polarTrace applies the odd/even petal rule the grader uses", () => {
    const spec = {
      type: "polarTrace", prompt: "p", mode: "rose", targetPetals: 8, targetA: 2, start: 1,
      successFeedback: "s", lowFeedback: "l"
    } as unknown as TWidget;
    expect(describeWidgetState(spec, 3)).toContain("draws 3 petals");
    expect(describeWidgetState(spec, 4)).toContain("draws 8 petals");
  });

  it("polarTrace classifies the limaçon by a", () => {
    const spec = {
      type: "polarTrace", prompt: "p", mode: "limacon", targetPetals: 4, targetA: 2, start: 1,
      successFeedback: "s", lowFeedback: "l"
    } as unknown as TWidget;
    expect(describeWidgetState(spec, 1)).toContain("cardioid");
    expect(describeWidgetState(spec, 3)).toContain("convex");
  });
});

describe("full-coverage tranche", () => {
  it("plotPoint reports progress without naming the unmarked targets", () => {
    const spec = {
      type: "plotPoint", prompt: "p", cols: 5, rows: 5,
      targets: [{ x: 1, y: 2 }, { x: 4, y: 4 }],
      pointErrors: [], missFeedback: "m", successFeedback: "s"
    } as unknown as TWidget;
    const empty = describeWidgetState(spec, [])!;
    expect(empty).toContain("No cells are marked yet");
    expect(empty).toContain("0 of 2 targets");
    // The unmarked target (4, 4) must never be disclosed.
    expect(empty).not.toContain("(4, 4)");

    const partial = describeWidgetState(spec, [{ x: 1, y: 2 }, { x: 3, y: 3 }])!;
    expect(partial).toContain("(1, 2)");
    expect(partial).toContain("1 of 2 targets");
    expect(partial).toContain("1 of them is not a target");
    expect(partial).not.toContain("(4, 4)");
  });

  it("inversePipeline speaks the forward chain and the built track, never the answer order", () => {
    const spec = {
      type: "inversePipeline", prompt: "p",
      forward: [{ id: "f1", op: "mul", n: 3 }, { id: "f2", op: "add", n: 5 }],
      tray: [
        { id: "t1", op: "sub", n: 5 }, { id: "t2", op: "div", n: 3 },
        { id: "t3", op: "add", n: 5 }, { id: "t4", op: "mul", n: 3 }
      ],
      answer: ["t1", "t2"],
      successFeedback: "s", forwardOrderFeedback: "fo", unflippedFeedback: "uf", missFeedback: "m"
    } as unknown as TWidget;
    const empty = describeWidgetState(spec, [])!;
    expect(empty).toContain("multiply by 3, then add 5");
    expect(empty).toContain("track is empty");
    expect(empty).toContain("4 cards");

    const partial = describeWidgetState(spec, ["t1"])!;
    expect(partial).toContain("subtract 5");
    expect(partial).toContain("1 of 2 slots filled");
  });

  it("inversePipeline (property pin): an empty track's description never spells the answer sequence", () => {
    // Wording-agnostic: whatever the narration says, at an EMPTY state it must mention the forward
    // chain and must NOT contain the correct inverse ordering. This deliberately does not pin
    // phrasing — it pins the leak boundary, so a reword cannot silently start disclosing.
    const spec = {
      type: "inversePipeline", prompt: "p",
      forward: [{ id: "f1", op: "mul", n: 3 }, { id: "f2", op: "add", n: 5 }],
      tray: [{ id: "t1", op: "sub", n: 5 }, { id: "t2", op: "div", n: 3 }, { id: "t3", op: "add", n: 5 }],
      answer: ["t1", "t2"],
      successFeedback: "s", forwardOrderFeedback: "fo", unflippedFeedback: "uf", missFeedback: "m"
    } as unknown as TWidget;
    const empty = describeWidgetState(spec, [])!;
    expect(empty).toContain("multiply by 3, then add 5");
    expect(empty).not.toContain("subtract 5, then divide by 3");
    const partial = describeWidgetState(spec, ["t1"])!;
    expect(partial).toContain("subtract 5"); // the learner's OWN placed card is spoken
  });

  it("plotPoint (property pin): unmarked target coordinates never appear in the description", () => {
    const spec = {
      type: "plotPoint", prompt: "p", cols: 5, rows: 4,
      targets: [{ x: 2, y: 3 }, { x: 4, y: 1 }],
      pointErrors: [], missFeedback: "m", successFeedback: "s"
    } as unknown as TWidget;
    const d = describeWidgetState(spec, [{ x: 1, y: 1 }])!;
    expect(d).toContain("(1, 1)"); // the learner's own mark is spoken
    expect(d).not.toContain("(2, 3)"); // unmarked target — must never be disclosed
    expect(d).not.toContain("(4, 1)");
  });

  it("solveBalance reads the pans as they stand and never computes the solution", () => {
    // 2x + 3 = 11 → x = 4. The description of the START state must narrate the pans, not the 4.
    const spec = {
      type: "solveBalance", prompt: "p", a: 2, b: 3, c: 11,
      successFeedback: "s", unbalancedFeedback: "u", notIsolatedFeedback: "n", offFeedback: "o"
    } as unknown as TWidget;
    const d = describeWidgetState(spec, null)!;
    expect(d).toContain("2 x-tiles and 3 unit tiles");
    expect(d).toContain("11 unit tiles");
    expect(d).toContain("equals");
    expect(d).not.toContain("4");
    // An inequality relation is spoken as the claim it makes.
    const ineq = describeWidgetState({ ...(spec as object), relation: "lt" } as TWidget, { leftX: 1, leftUnits: 0, rightUnits: 4 })!;
    expect(ineq).toContain("is less than");
  });

  it("solveBalance narrates the GROUP and PARTIAL states from the same pan counts the renderer draws", () => {
    // −3(x + 2) = 9. Start: three negated unopened groups. `partial: 1` marks the distribute-x-only
    // misconception — it is DIAGNOSTIC metadata, not extra tiles: after distributeXOnly the pans
    // hold exactly leftX/leftUnits (widgets.tsx distributeXOnly: leftX += groups·sign·x,
    // leftUnits += sign·unit, groups: 0). The description must narrate those counts and nothing
    // else, so it can never disagree with the picture.
    const spec = {
      type: "solveBalance", prompt: "p", a: -3, b: -6, c: 9,
      groups: { count: -3, x: 1, unit: 2 },
      successFeedback: "s", unbalancedFeedback: "u", notIsolatedFeedback: "n", offFeedback: "o"
    } as unknown as TWidget;
    const atStart = describeWidgetState(spec, null)!;
    expect(atStart).toContain("3 unopened groups of (1x + 2), each negated");
    // distribute-x-only landing: leftX = 0 + 3·(−1)·1 = −3, leftUnits = 0 + (−1)·2 = −2, groups 0.
    const partial = describeWidgetState(spec, { leftX: -3, leftUnits: -2, rightUnits: 9, groups: 0, partial: 1 })!;
    expect(partial).toContain("-3 x-tiles");
    expect(partial).toContain("-2 unit tiles");
    expect(partial).not.toContain("unopened");
  });

  it("rotationLab reads the image off the SAME rotation the grader uses, in both modes", () => {
    const coord = {
      type: "rotationLab", mode: "coordinateRule", prompt: "p",
      point: [3, 5], centre: [0, 0], targetAngle: 180, angleStart: 0, angleStep: 90, gridMax: 8,
      commonTurns: [], successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as unknown as TWidget;
    // 90° counterclockwise sends (x, y) to (−y, x): (3, 5) → (−5, 3). Computed here by hand,
    // not by calling the implementation under test.
    expect(describeWidgetState(coord, { angle: 90 })).toContain("image reads (-5, 3)");
    expect(describeWidgetState(coord, { angle: 180 })).toContain("image reads (-3, -5)");

    const sym = {
      type: "rotationLab", mode: "symmetryOrder", prompt: "p",
      shape: [[2, 2], [-2, 2], [-2, -2], [2, -2]], centre: [0, 0],
      targetAngle: 90, angleStart: 0, angleStep: 15, gridMax: 6,
      commonTurns: [], successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as unknown as TWidget;
    expect(describeWidgetState(sym, { angle: 90 })).toContain("lands exactly back on itself");
    expect(describeWidgetState(sym, { angle: 45 })).toContain("does not land back on itself");
    expect(describeWidgetState(sym, { angle: 45 })).toContain("4-vertex shape");
  });

  it("rotationLab does NOT speak the target angle — parity means the same task, not an easier one", () => {
    const sym = {
      type: "rotationLab", mode: "symmetryOrder", prompt: "p",
      shape: [[2, 2], [-2, 2], [-2, -2], [2, -2]], centre: [0, 0],
      targetAngle: 90, angleStart: 0, angleStep: 15, gridMax: 6,
      commonTurns: [], successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as unknown as TWidget;
    // At a turn that is NOT the answer, nothing in the description may disclose 90.
    const d = describeWidgetState(sym, { angle: 15 })!;
    expect(d).toContain("15°");
    expect(d).not.toContain("90");
  });

  it("balanceScale reports live pan weights from the grader's own arithmetic", () => {
    const spec = {
      type: "balanceScale", prompt: "p", a: 2, b: 3, c: 11, xMin: 0, xMax: 8, xStart: 1,
      successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as TWidget;
    expect(describeWidgetState(spec, { x: 1 })).toContain("lighter by 6");
    expect(describeWidgetState(spec, { x: 4 })).toContain("the pans are level");
  });

  it("triangleSolve reads the law-of-cosines third side at the current hinge", () => {
    const spec = {
      type: "triangleSolve", prompt: "p", mode: "sas", a: 3, b: 4, target: 5, start: 30,
      successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as TWidget;
    expect(describeWidgetState(spec, 90)).toContain("third side 5");
  });

  it("argandExplore computes the live product in multiply mode", () => {
    const spec = {
      type: "argandExplore", prompt: "p", mode: "multiply", mulRe: 0, mulIm: 1,
      targetRe: -2, targetIm: 0, reStart: 1, imStart: 0, gridMax: 5,
      successFeedback: "s", missFeedback: "m"
    } as unknown as TWidget;
    const d = describeWidgetState(spec, { re: 0, im: 2 })!; // 2i · i = −2
    expect(d).toContain("lands the product at -2 + 0i");
  });

  it("distanceGrid reports run, rise, and the live distance", () => {
    const spec = {
      type: "distanceGrid", prompt: "p", anchor: [2, 3], targetPoint: [6, 6],
      gridMin: 0, gridMax: 8, startX: 2, startY: 3, successFeedback: "s", missFeedback: "m"
    } as unknown as TWidget;
    expect(describeWidgetState(spec, { x: 6, y: 6 })).toContain("distance of 5");
  });

  it("circleAngleExplore uses the grader's readout rule per mode", () => {
    const base = { type: "circleAngleExplore", prompt: "p", targetAngle: 55, startArc: 100, successFeedback: "s", lowFeedback: "l", highFeedback: "h" };
    expect(describeWidgetState({ ...base, mode: "inscribed" } as TWidget, 110)).toContain("reads 55°");
    expect(describeWidgetState({ ...base, mode: "central" } as TWidget, 110)).toContain("reads 110°");
  });

  it("derivativeTrace guards the |x| corner", () => {
    const spec = {
      type: "derivativeTrace", prompt: "p", fn: "abs", mode: "point", targetSlope: 0, targetX: 2, start: -3,
      successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as TWidget;
    expect(describeWidgetState(spec, 0)).toContain("no single tangent slope");
    expect(describeWidgetState(spec, 2)).toContain("slope is 1");
  });
});

describe("audited dense-lab tranche", () => {
  it("taylorApprox reports partial sum vs truth from the grader's own series helpers", () => {
    const spec = {
      type: "taylorApprox", prompt: "p", fn: "exp", mode: "terms", atX: 1, tolerance: 0.01,
      targetN: 5, nStart: 1, xStart: 1, targetXTenths: 5,
      successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as unknown as TWidget;
    const d = describeWidgetState(spec, 2)!; // 1 + x + x²/2 at x=1 → 2.5
    expect(d).toContain("through degree 2");
    expect(d).toContain("partial sum reads 2.5");
    expect(d).toContain("true value 2.72");
  });

  it("signChart names bounce vs cross per root and pins the rightmost interval", () => {
    const spec = {
      type: "signChart", prompt: "p",
      roots: [{ x: -1, mult: 1 }, { x: 2, mult: 2 }], leadingPositive: true,
      successFeedback: "s", missFeedback: "m"
    } as unknown as TWidget;
    const d = describeWidgetState(spec, ["+", "-"] as unknown)!;
    expect(d).toContain("-1 (multiplicity 1, cross)");
    expect(d).toContain("2 (multiplicity 2, bounce)");
    expect(d).toContain("The rightmost interval is +");
  });

  it("netFold computes the three face-pairs and total surface area live", () => {
    const spec = {
      type: "netFold", prompt: "p", targetSurfaceArea: 52, lMax: 6, wMax: 6, hMax: 6,
      lStart: 1, wStart: 1, hStart: 1, successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as unknown as TWidget;
    const d = describeWidgetState(spec, { l: 2, w: 3, h: 4 })!;
    expect(d).toContain("6, 8 and 12 squares");
    expect(d).toContain("surface area of 52");
  });

  it("circleMeasureExplore reads the chord length through the grader's readout", () => {
    const spec = {
      type: "circleMeasureExplore", prompt: "p", mode: "chordDistance", radius: 5,
      targetLength: 8, targetAngle: 0, start: 0, successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as unknown as TWidget;
    expect(describeWidgetState(spec, 3)).toContain("has length 8"); // 2√(25−9)
  });

  it("shuffleTest computes the observed difference from the spec's own data", () => {
    const spec = {
      type: "shuffleTest", prompt: "p", groupALabel: "Tutored", groupBLabel: "Control",
      groupA: [8, 9, 10], groupB: [5, 6, 7], requiredShuffles: 20,
      successFeedback: "s", missFeedback: "m"
    } as unknown as TWidget;
    const d = describeWidgetState(spec, { shuffles: 0, verdict: null })!;
    expect(d).toContain("observed mean difference is 3");
    expect(d).toContain("none yet");
  });
});

describe("numberLineRay", () => {
  // A fixed frame (spec.start/window/step never move); only `value` — the persisted mathematical
  // claim {coeff, constant, relation, inclusive} — varies across the four states below.
  const spec = {
    type: "numberLineRay", prompt: "p", variable: "x",
    start: { coeff: { n: 1, d: 1 }, constant: { n: 0, d: 1 }, relation: "gt", inclusive: false },
    window: { min: { n: -6, d: 1 }, max: { n: 6, d: 1 }, tickStep: { n: 1, d: 1 } },
    step: { n: 1, d: 1 }, outOfRange: "clamp", offLattice: "snap", transforms: []
  } as unknown as TWidget;
  const at = (relation: "lt" | "gt", inclusive: boolean) => ({
    coeff: { n: 1, d: 1 }, constant: { n: 3, d: 1 }, relation, inclusive
  });

  it("states the relation and its solution set across open/closed and both directions", () => {
    // x > 3 — open, greater.
    const gtOpen = describeWidgetState(spec, at("gt", false))!;
    expect(gtOpen).toContain("x > 3");
    expect(gtOpen).toContain("greater than 3");
    expect(gtOpen).toContain("3 not included");

    // x ≥ 3 — closed, greater.
    const gtClosed = describeWidgetState(spec, at("gt", true))!;
    expect(gtClosed).toContain("x ≥ 3");
    expect(gtClosed).toContain("greater than or equal to 3");
    expect(gtClosed).toContain("3 included");

    // x < 3 — open, less.
    const ltOpen = describeWidgetState(spec, at("lt", false))!;
    expect(ltOpen).toContain("x < 3");
    expect(ltOpen).toContain("less than 3");
    expect(ltOpen).toContain("3 not included");

    // x ≤ 3 — closed, less.
    const ltClosed = describeWidgetState(spec, at("lt", true))!;
    expect(ltClosed).toContain("x ≤ 3");
    expect(ltClosed).toContain("less than or equal to 3");
    expect(ltClosed).toContain("3 included");
  });

  it("falls back to the authored start state when no value is persisted yet", () => {
    const untouched = describeWidgetState(spec, null)!;
    expect(untouched).toContain("x > 0");
  });

  it("speaks the relation exactly as WRITTEN even when a negative coefficient reverses the drawn direction", () => {
    // −2x > −6 written; solved, that is x < 3 — the reversal this engine exists to teach. The
    // written form must still be spoken as written, not silently re-expressed as "x < 3" only.
    const reversed = describeWidgetState(spec, { coeff: { n: -2, d: 1 }, constant: { n: -6, d: 1 }, relation: "gt", inclusive: false })!;
    expect(reversed).toContain("−2x > −6");
    expect(reversed).toContain("less than 3");
    expect(reversed).toContain("3 not included");
  });
});
