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

describe("CL-P1-010 (S330): the 14 high-use spatial manipulatives", () => {
  it("slider narrates the current value and unit, withholding the target until tone info", () => {
    const spec = {
      type: "slider", prompt: "p", min: 0, max: 10, step: 1, start: 2, target: 7, visual: "numberline",
      unitLabel: "cm", lowFeedback: "l", highFeedback: "h", successFeedback: "s"
    } as unknown as TWidget;
    const plain = describeWidgetState(spec, 4)!;
    expect(plain).toContain("4 cm");
    expect(plain).not.toContain("7"); // the target must not leak at the default tone
    const revealed = describeWidgetState(spec, 4, "info")!;
    expect(revealed).toContain("Target: 7 cm");
    expect(describeWidgetState(spec, 7, "info")!).not.toContain("Target"); // arrival: nothing left to reveal
  });

  it("tapDiagram lists hotspots and selection, revealing the correct set only at tone info when wrong", () => {
    const spec = {
      type: "tapDiagram", prompt: "p", mode: "selectAll", canvas: { w: 4, h: 3},
      hotspots: [
        { id: "a", x: 10, y: 10, label: "Basket A", icon: "🍎", count: 2, correct: true },
        { id: "b", x: 50, y: 50, label: "Basket B", icon: "🍎", count: 3, correct: false }
      ],
      missFeedback: "m", successFeedback: "s"
    } as unknown as TWidget;
    const plain = describeWidgetState(spec, ["b"])!;
    expect(plain).toContain("Basket A");
    expect(plain).toContain("Basket B (selected)");
    expect(plain).not.toContain("Correct:");
    expect(describeWidgetState(spec, ["b"], "info")!).toContain("Correct: Basket A");
    expect(describeWidgetState(spec, ["a"], "info")!).not.toContain("Correct:"); // already right: nothing to reveal
  });

  it("baseTenCompose reflects the built columns and reveals the standard build only when wrong at info", () => {
    const spec = {
      type: "baseTenCompose", prompt: "p", target: 34, requireStandard: true, maxHundreds: 0, maxTens: 9, maxOnes: 20,
      missFeedback: "m", successFeedback: "s"
    } as unknown as TWidget;
    const plain = describeWidgetState(spec, { tens: 2, ones: 9 })!;
    expect(plain).toContain("2 tens, 9 ones, total 29");
    expect(plain).not.toContain("Standard build");
    expect(describeWidgetState(spec, { tens: 2, ones: 9 }, "info")!).toContain("Standard build: 3 tens, 4 ones");
    expect(describeWidgetState(spec, { tens: 3, ones: 4 }, "info")!).not.toContain("Standard build"); // correct: silent
  });

  it("lengthCompare: pick mode never reveals (parity — the renderer has no ghost there either)", () => {
    const spec = {
      type: "lengthCompare", prompt: "p", mode: "pick", unitLabel: "cm",
      items: [{ id: "a", label: "Pencil", length: 5 }, { id: "b", label: "Eraser", length: 3 }],
      answerId: "a", missFeedback: "m", successFeedback: "s"
    } as unknown as TWidget;
    expect(describeWidgetState(spec, "b", "info")!).not.toContain("Correct answer");
    expect(describeWidgetState(spec, "b", "info")!).toContain("You picked Eraser");
  });

  it("lengthCompare: align mode reveals the answer only at info while misaligned or wrong", () => {
    const spec = {
      type: "lengthCompare", prompt: "p", mode: "align", unitLabel: "cm",
      items: [
        { id: "a", label: "Ribbon A", length: 5, startOffset: 2 },
        { id: "b", label: "Ribbon B", length: 7, startOffset: 0 }
      ],
      answerId: "b", missFeedback: "m", successFeedback: "s", unalignedFeedback: "u"
    } as unknown as TWidget;
    const misaligned = describeWidgetState(spec, { offsets: { a: 2, b: 0 }, picked: null }, "info")!;
    expect(misaligned).toContain("not lined up yet");
    expect(misaligned).toContain("Correct answer: Ribbon B");
    const aligned = describeWidgetState(spec, { offsets: { a: 0, b: 0 }, picked: "b" }, "info")!;
    expect(aligned).toContain("lined up");
    expect(aligned).not.toContain("Correct answer"); // right pick, aligned: nothing left to reveal
  });

  it("lengthCompare: difference mode states both lengths but only the overhang at info", () => {
    const spec = {
      type: "lengthCompare", prompt: "p", mode: "difference", unitLabel: "clips",
      items: [{ id: "a", label: "Pencil", length: 5 }, { id: "b", label: "Eraser", length: 3 }],
      answerId: "a", targetDifference: 2, missFeedback: "m", successFeedback: "s"
    } as unknown as TWidget;
    const plain = describeWidgetState(spec, 0)!;
    expect(plain).toContain("Pencil is 5 clips and Eraser is 3 clips");
    expect(plain).not.toContain("overhang is");
    expect(describeWidgetState(spec, 0, "info")!).toContain("The overhang is 2 clips");
    expect(describeWidgetState(spec, 2, "info")!).not.toContain("overhang is"); // correct count: silent
  });

  it("numberLinePlace states the marker position and reveals the target only at info", () => {
    const spec = {
      type: "numberLinePlace", prompt: "p", min: -5, max: 5, step: 1, tickStep: 1, target: 3, start: 0,
      lowFeedback: "l", highFeedback: "h", successFeedback: "s"
    } as unknown as TWidget;
    expect(describeWidgetState(spec, -2)!).toContain("Marker currently at −2");
    expect(describeWidgetState(spec, -2)!).not.toContain("Target");
    expect(describeWidgetState(spec, -2, "info")!).toContain("Target: 3");
  });

  it("hundredthsGrid states the shaded count and reveals the target only at info", () => {
    const spec = {
      type: "hundredthsGrid", prompt: "p", mode: "hundredths", target: 47, prefilled: 0, showDecimal: true,
      successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as unknown as TWidget;
    const plain = describeWidgetState(spec, 30)!;
    expect(plain).toContain("30 are shaded");
    expect(plain).toContain("0.30");
    expect(plain).not.toContain("Target");
    expect(describeWidgetState(spec, 30, "info")!).toContain("Target: 47 of 100");
  });

  it("barBuilder states the built heights and reveals the target counts only at info", () => {
    const spec = {
      type: "barBuilder", prompt: "p", categories: ["Cats", "Dogs"], target: [3, 5], maxVal: 10,
      successFeedback: "s", partialFeedback: "p"
    } as unknown as TWidget;
    const plain = describeWidgetState(spec, [1, 1])!;
    expect(plain).toContain("Cats: 1, Dogs: 1");
    expect(plain).not.toContain("Target counts");
    expect(describeWidgetState(spec, [1, 1], "info")!).toContain("Target counts: 3, 5");
    expect(describeWidgetState(spec, [3, 5], "info")!).not.toContain("Target counts"); // matched: silent
  });

  it("clockSet states the current time and reveals the target only at info", () => {
    const spec = {
      type: "clockSet", prompt: "p", targetHour: 4, targetMinute: 15,
      successFeedback: "s", hourFeedback: "h", minuteFeedback: "m"
    } as unknown as TWidget;
    expect(describeWidgetState(spec, { hour: 2, minute: 30 })!).toContain("showing 2:30");
    expect(describeWidgetState(spec, { hour: 2, minute: 30 })!).not.toContain("Target");
    expect(describeWidgetState(spec, { hour: 2, minute: 30 }, "info")!).toContain("Target: 4:15");
  });

  it("volumeBuilder (prism) states the built box and reveals the target only at info", () => {
    const spec = {
      type: "volumeBuilder", prompt: "p", targetVolume: 60, lMax: 6, wMax: 6, hMax: 6, solid: "prism",
      successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as unknown as TWidget;
    const plain = describeWidgetState(spec, { l: 2, w: 2, h: 2 })!;
    expect(plain).toContain("Volume 8");
    expect(plain).not.toContain("must hold");
    expect(describeWidgetState(spec, { l: 2, w: 2, h: 2 }, "info")!).toContain("must hold 60 cubes");
  });

  it("volumeBuilder (round) reports the exact π-multiple volume and reveals the target only at info", () => {
    const spec = {
      type: "volumeBuilder", prompt: "p", targetVolume: 36, solid: "cylinder", rMax: 6, hMax: 6,
      successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as unknown as TWidget;
    const plain = describeWidgetState(spec, { r: 3, h: 4 })!;
    expect(plain).toContain("Volume 36π");
    expect(plain).not.toContain("must hold");
    expect(describeWidgetState(spec, { r: 2, h: 4 }, "info")!).toContain("must hold 36π");
  });

  it("algebraTiles reflects the net tiles through the SAME canonical model the renderer uses, and never states the target", () => {
    const spec = {
      type: "algebraTiles", prompt: "p", targetX: 2, targetConst: -3,
      successFeedback: "s", xFeedback: "x", constFeedback: "c"
    } as unknown as TWidget;
    const plain = describeWidgetState(spec, { x: 2, c: -3 })!;
    expect(plain).toContain("2 x");
    expect(plain).toContain("-3");
    // Parity with the renderer's own aria-label, which never prints targetX/targetConst either —
    // not even at tone "info" (algebraTiles has no numeric reveal-ghost).
    expect(describeWidgetState(spec, { x: 0, c: 0 }, "info")!).not.toMatch(/target/i);
  });

  it("columnCalc tracks worked-out columns without ever stating the true total", () => {
    const spec = {
      type: "columnCalc", prompt: "p", op: "add", a: 48, b: 27,
      fallbackFeedback: "f", successFeedback: "s"
    } as unknown as TWidget;
    const fresh = describeWidgetState(spec, null)!;
    expect(fresh).toContain("48 plus 27");
    expect(fresh).toContain("0 of 2 columns worked out");
    const partial = describeWidgetState(spec, { written: [5, null] })!;
    expect(partial).toContain("1 of 2 columns worked out");
    expect(partial).not.toContain("75"); // the true sum is never stated outright
  });

  it("numberLineHop (landing mode) reveals the target landing only at tone info", () => {
    const spec = {
      type: "numberLineHop", prompt: "p", min: 0, max: 20, start: 4, hop: 3, hops: 2, direction: "forward",
      missFeedback: "m", successFeedback: "s"
    } as unknown as TWidget;
    expect(describeWidgetState(spec, null)!).not.toContain("Target landing");
    expect(describeWidgetState(spec, null, "info")!).toContain("Target landing: 10");
    expect(describeWidgetState(spec, 10, "info")!).not.toContain("Target landing"); // landed: nothing left
  });

  it("numberLineHop (hop-size / GCF mode) never reveals the stride answer — the renderer has no ghost there", () => {
    const spec = {
      type: "numberLineHop", prompt: "p", min: 0, max: 20, start: 0, hops: 1,
      hopSizeTargets: [8, 12], hopSizeMin: 1, hopSizeMax: 12,
      missFeedback: "m", successFeedback: "s"
    } as unknown as TWidget;
    const d = describeWidgetState(spec, 4, "info")!;
    expect(d).toContain("Current stride: 4");
    expect(d).toContain("8 landed on");
    expect(d).toContain("12 landed on");
    expect(d).not.toMatch(/target/i); // the GCF (4) is never named as "the answer"
  });

  it("tenFrame states the fill count and reveals the target only at info", () => {
    const spec = {
      type: "tenFrame", prompt: "p", target: 8, preFilled: 3,
      missFeedback: "m", successFeedback: "s"
    } as unknown as TWidget;
    const plain = describeWidgetState(spec, 5)!;
    expect(plain).toContain("5 are currently filled");
    expect(plain).toContain("3 of them locked in already");
    expect(plain).not.toContain("Target");
    expect(describeWidgetState(spec, 5, "info")!).toContain("Target: 8");
  });

  it("fractionBar reveals the target only when the lesson authors showTarget — never by tone", () => {
    const hidden = {
      type: "fractionBar", prompt: "p", targetNum: 1, targetDen: 2, showTarget: false,
      successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    } as unknown as TWidget;
    expect(describeWidgetState(hidden, { n: 1, d: 4 }, "info")!).not.toContain("Target"); // authored hidden: info tone does not override it
    const shown = { ...hidden, showTarget: true } as unknown as TWidget;
    const plain = describeWidgetState(shown, { n: 1, d: 4 })!; // no tone at all — showTarget alone governs
    expect(plain).toContain("1 of 4 equal parts");
    expect(plain).toContain("Target: 1/2");
  });
});
