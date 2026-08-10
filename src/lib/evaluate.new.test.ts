import { describe, expect, it } from "vitest";
import { accumAreaAt, accumFnAt, canCheck, taylorFn, taylorPartial, taylorTerm, fieldSlope, sliceEstimate, sliceExact, sliceMeasure, circleMeasureReadout, circleReadout, compassSteps, complexProduct, correctAnswerText, dotProduct, evalRule, evaluate, exactArea, expLogReadout, lawOfCosinesAngle, lawOfCosinesSide, quadName, riemannEstimate, rosePetals, secantSlopeOver, signChartSigns, snap2sf, traceSlopeAt } from "./evaluate";
import { WidgetSpec, type TWidget } from "./schema";
import { SAMPLES } from "@/components/widgetSamples";

const specs = SAMPLES.map((s) => WidgetSpec.parse(s));
const byType = <T extends TWidget["type"]>(t: T) =>
  specs.find((s) => s.type === t) as Extract<TWidget, { type: T }>;

describe("evaluate — new widget wrong paths stay diagnostic", () => {
  it("lineExplore: exact line wins; slope-off and intercept-off get their own diagnosis", () => {
    const s = byType("lineExplore"); // target y = 2x − 1
    expect(evaluate(s, { m: 2, b: -1 }).correct).toBe(true);
    const slopeOff = evaluate(s, { m: 1, b: -1 });
    expect(slopeOff.correct).toBe(false);
    expect(slopeOff.feedback).toBe(s.slopeFeedback);
    const interceptOff = evaluate(s, { m: 2, b: 3 });
    expect(interceptOff.correct).toBe(false);
    expect(interceptOff.feedback).toBe(s.interceptFeedback);
    expect(canCheck(s, { m: 0, b: 0 })).toBe(true);
    expect(correctAnswerText(s)).toBe("y = 2x − 1");
  });

  it("fractionBar: any equivalent fraction wins; short vs long bars split low/high", () => {
    const s = byType("fractionBar"); // target 1/2
    expect(evaluate(s, { n: 2, d: 4 }).correct).toBe(true); // 2/4 = 1/2
    expect(evaluate(s, { n: 3, d: 6 }).correct).toBe(true); // 3/6 = 1/2
    const low = evaluate(s, { n: 1, d: 4 }); // 1/4 < 1/2
    expect(low.correct).toBe(false);
    expect(low.feedback).toBe(s.lowFeedback);
    const high = evaluate(s, { n: 3, d: 4 }); // 3/4 > 1/2
    expect(high.feedback).toBe(s.highFeedback);
    expect(correctAnswerText(s)).toContain("equal to 1/2");
  });

  it("quadraticExplore: exact a,h,k wins; shape-off vs vertex-off diagnose separately", () => {
    const s = byType("quadraticExplore"); // target 2(x−1)²−2
    expect(evaluate(s, { a: 2, h: 1, k: -2 }).correct).toBe(true);
    const shapeOff = evaluate(s, { a: 1, h: 1, k: -2 });
    expect(shapeOff.correct).toBe(false);
    expect(shapeOff.feedback).toBe(s.shapeFeedback);
    const vertexOff = evaluate(s, { a: 2, h: 0, k: -2 });
    expect(vertexOff.correct).toBe(false);
    expect(vertexOff.feedback).toBe(s.vertexFeedback);
  });

  it("unitCircleExplore: exact angle wins; under/over-rotation get directional feedback", () => {
    const s = byType("unitCircleExplore"); // target 60°
    expect(evaluate(s, { angle: 60 }).correct).toBe(true);
    expect(evaluate(s, { angle: 30 }).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, { angle: 90 }).feedback).toBe(s.highFeedback);
    expect(correctAnswerText(s)).toBe("θ = 60°");
  });

  it("systemsExplore: only the intersection wins; on-one-line vs on-neither diagnose separately", () => {
    const s = byType("systemsExplore"); // y=x+1, y=−x+5 → (2,3)
    expect(evaluate(s, { x: 2, y: 3 }).correct).toBe(true);
    const onOne = evaluate(s, { x: 0, y: 1 }); // on line 1 only
    expect(onOne.correct).toBe(false);
    expect(onOne.feedback).toBe(s.offLine2Feedback);
    const onNeither = evaluate(s, { x: 5, y: 1 });
    expect(onNeither.feedback).toBe(s.offLine1Feedback);
    expect(correctAnswerText(s)).toBe("(2, 3)");
  });

  it("numberLinePlace: exact target wins; left/right of target get directional feedback", () => {
    const s = byType("numberLinePlace"); // target −3
    expect(evaluate(s, -3).correct).toBe(true);
    expect(evaluate(s, -7).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, 0).feedback).toBe(s.highFeedback);
    expect(correctAnswerText(s)).toBe("-3");
  });

  it("functionMachine: reaching the target output wins; under/over get their own feedback", () => {
    const s = byType("functionMachine"); // 2x+1, target 13
    expect(evaluate(s, { input: 6 }).correct).toBe(true);
    expect(evaluate(s, { input: 3 }).feedback).toBe(s.lowFeedback); // 7 < 13
    expect(evaluate(s, { input: 9 }).feedback).toBe(s.highFeedback); // 19 > 13
    expect(correctAnswerText(s)).toContain("input = 6");
  });

  it("probabilityArea: any shading equal to the target wins; too-little vs too-much split", () => {
    const s = byType("probabilityArea"); // 2×3 grid, target 1/2
    expect(evaluate(s, 3).correct).toBe(true);
    expect(evaluate(s, 1).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, 5).feedback).toBe(s.highFeedback);
    expect(correctAnswerText(s)).toBe("shade 3 of 6");
  });

  it("transformExplore: exact image wins; wrong-position vs wrong-flip diagnose separately", () => {
    const s = byType("transformExplore"); // reflect y + up 2
    expect(evaluate(s, { dx: 0, dy: 2, reflect: "y" }).correct).toBe(true);
    const misplaced = evaluate(s, { dx: 1, dy: 2, reflect: "y" }); // right flip, shifted
    expect(misplaced.correct).toBe(false);
    expect(misplaced.feedback).toBe(s.offsetFeedback);
    const wrongFlip = evaluate(s, { dx: 0, dy: 2, reflect: "none" }); // orientation off
    expect(wrongFlip.feedback).toBe(s.reflectFeedback);
  });

  it("angleMeasure: exact angle wins; too-narrow vs too-wide get directional feedback", () => {
    const s = byType("angleMeasure"); // target 60
    expect(evaluate(s, { angle: 60 }).correct).toBe(true);
    expect(evaluate(s, { angle: 30 }).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, { angle: 90 }).feedback).toBe(s.highFeedback);
    expect(correctAnswerText(s)).toBe("60°");
  });

  it("dilationExplore: exact k wins; too-small vs too-large split", () => {
    const s = byType("dilationExplore"); // target k=2
    expect(evaluate(s, { k: 2 }).correct).toBe(true);
    expect(evaluate(s, { k: 1 }).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, { k: 3 }).feedback).toBe(s.highFeedback);
    expect(correctAnswerText(s)).toBe("k = 2");
  });

  it("barBuilder: all bars matching wins; any mismatch gives the partial feedback", () => {
    const s = byType("barBuilder"); // [15,25,10]
    expect(evaluate(s, [15, 25, 10]).correct).toBe(true);
    expect(evaluate(s, [15, 20, 10]).feedback).toBe(s.partialFeedback);
    expect(correctAnswerText(s)).toContain("Tue: 25");
  });

  it("dotPlot: matching every stack wins; any mismatch gives partial feedback", () => {
    const s = byType("dotPlot"); // [2,4,3,1]
    expect(evaluate(s, [2, 4, 3, 1]).correct).toBe(true);
    expect(evaluate(s, [2, 4, 3, 0]).feedback).toBe(s.partialFeedback);
    expect(correctAnswerText(s)).toContain("2: 4");
  });

  it("boxPlot: exact summary wins; out-of-order vs ordered-but-wrong split", () => {
    const s = byType("boxPlot"); // min2,q1 4,med6,q3 9,max12
    expect(evaluate(s, { min: 2, q1: 4, med: 6, q3: 9, max: 12 }).correct).toBe(true);
    expect(evaluate(s, { min: 5, q1: 4, med: 6, q3: 9, max: 12 }).feedback).toBe(s.orderFeedback); // 5>4
    expect(evaluate(s, { min: 1, q1: 4, med: 6, q3: 9, max: 12 }).feedback).toBe(s.valueFeedback); // ordered, wrong
    expect(correctAnswerText(s)).toContain("median 6");
  });

  it("areaModel: any factor pair reaching the area wins; under/over split", () => {
    const s = byType("areaModel"); // target 24
    expect(evaluate(s, { w: 6, h: 4 }).correct).toBe(true);
    expect(evaluate(s, { w: 8, h: 3 }).correct).toBe(true); // another factor pair
    expect(evaluate(s, { w: 3, h: 4 }).feedback).toBe(s.lowFeedback); // 12
    expect(evaluate(s, { w: 8, h: 4 }).feedback).toBe(s.highFeedback); // 32
    expect(correctAnswerText(s)).toBe("area = 24");
  });

  it("doubleNumberLine: the ratio-consistent value wins; under/over split", () => {
    const s = byType("doubleNumberLine"); // 3 apples : $2 → 6 apples : $4
    expect(evaluate(s, 4).correct).toBe(true);
    expect(evaluate(s, 2).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, 6).feedback).toBe(s.highFeedback);
    expect(correctAnswerText(s)).toBe("4");
  });

  it("scatterFit: a close-enough line wins; wrong-tilt vs wrong-height diagnose separately", () => {
    const s = byType("scatterFit"); // best fit ~ y = 1.46x + 1.4; on-grid 1.5x + 1 (mse 0.125)
    expect(evaluate(s, { m: 1.5, b: 1 }).correct).toBe(true);
    // right tilt, line sits too high — a better intercept WOULD fit, so it's an offset miss
    expect(evaluate(s, { m: 1.5, b: 4 }).feedback).toBe(s.offsetFeedback);
    // wrong tilt — no intercept can rescue it
    expect(evaluate(s, { m: 0.5, b: 4 }).feedback).toBe(s.slopeFeedback);
    expect(evaluate(s, { m: -2, b: 8 }).feedback).toBe(s.slopeFeedback);
  });

  it("percentBar: the target percent wins; under/over split", () => {
    const s = byType("percentBar"); // 25% of 80 = 20
    expect(evaluate(s, 25).correct).toBe(true);
    expect(evaluate(s, 10).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, 50).feedback).toBe(s.highFeedback);
    expect(correctAnswerText(s)).toBe("25% = 20");
  });

  it("integerChips: any chip combo summing to the target wins (zero pairs cancel)", () => {
    const s = byType("integerChips"); // target -3
    expect(evaluate(s, { pos: 0, neg: 3 }).correct).toBe(true);
    expect(evaluate(s, { pos: 4, neg: 7 }).correct).toBe(true); // 4 zero pairs cancel, -3 remains
    expect(evaluate(s, { pos: 0, neg: 8 }).feedback).toBe(s.lowFeedback); // -8
    expect(evaluate(s, { pos: 5, neg: 1 }).feedback).toBe(s.highFeedback); // +4
  });

  it("volumeBuilder: any dimension triple hitting the volume wins", () => {
    const s = byType("volumeBuilder"); // target 24
    expect(evaluate(s, { l: 2, w: 3, h: 4 }).correct).toBe(true);
    expect(evaluate(s, { l: 1, w: 4, h: 6 }).correct).toBe(true); // another triple
    expect(evaluate(s, { l: 2, w: 2, h: 2 }).feedback).toBe(s.lowFeedback); // 8
    expect(evaluate(s, { l: 5, w: 5, h: 2 }).feedback).toBe(s.highFeedback); // 50
  });

  it("netFold: surface area of the unfolded prism; under/over split", () => {
    const s = byType("netFold"); // target 52 → 4x3x2
    expect(evaluate(s, { l: 4, w: 3, h: 2 }).correct).toBe(true);
    expect(evaluate(s, { l: 2, w: 2, h: 2 }).feedback).toBe(s.lowFeedback); // 24
    expect(evaluate(s, { l: 6, w: 6, h: 6 }).feedback).toBe(s.highFeedback); // 216
    expect(correctAnswerText(s)).toBe("surface area = 52");
  });

  it("elapsedTime: the right duration wins; too-short vs too-long split", () => {
    const s = byType("elapsedTime"); // 2:15 + 45min = 3:00
    expect(evaluate(s, 45).correct).toBe(true);
    expect(evaluate(s, 30).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, 60).feedback).toBe(s.highFeedback);
    expect(correctAnswerText(s)).toBe("0h 45min");
  });

  it("distanceGrid: only the target point wins (3-4-5 triangle)", () => {
    const s = byType("distanceGrid"); // (2,3) → (6,6): legs 4,3 → 5
    expect(evaluate(s, { x: 6, y: 6 }).correct).toBe(true);
    expect(evaluate(s, { x: 5, y: 6 }).feedback).toBe(s.wrongPointFeedback);
    expect(correctAnswerText(s)).toBe("(6, 6)");
  });

  it("treeDiagram: branch counts must match; leaf-count drives the direction", () => {
    const s = byType("treeDiagram"); // 3 × 4 = 12
    expect(evaluate(s, { a: 3, b: 4 }).correct).toBe(true);
    expect(evaluate(s, { a: 2, b: 2 }).feedback).toBe(s.lowFeedback); // 4 leaves
    expect(evaluate(s, { a: 5, b: 5 }).feedback).toBe(s.highFeedback); // 25 leaves
    expect(correctAnswerText(s)).toBe("3 × 4 = 12");
  });

  it("slopeField: the equilibria are exactly where the field is flat, at every x", () => {
    const s = byType("slopeField"); // logistic, carrying capacity 4
    expect(evaluate(s, 4).correct).toBe(true);
    expect(evaluate(s, 1).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, 6).feedback).toBe(s.highFeedback);
    // an equilibrium is a y where the slope is zero for EVERY x — not just at one point
    for (const x of [-3, 0, 2.5]) {
      expect(fieldSlope("logistic", x, 4)).toBeCloseTo(0, 10);
      expect(fieldSlope("logistic", x, 0)).toBeCloseTo(0, 10);
      expect(fieldSlope("exponential", x, 0)).toBeCloseTo(0, 10);
    }
    expect(fieldSlope("logistic", 0, 1)).toBeGreaterThan(0); // below the ceiling: pushed UP
    expect(fieldSlope("logistic", 0, 6)).toBeLessThan(0); // above it: pushed back DOWN
    // dy/dx = x depends on x ALONE, so every curve is a vertical shift of every other
    expect(fieldSlope("linear", 2, 0)).toBe(fieldSlope("linear", 2, 7));
    expect(correctAnswerText(s)).toBe("a starting value of y = 4");
  });

  it("taylorApprox: the polynomial hugs eˣ forever, and PEELS AWAY from 1/(1−x) at the radius", () => {
    const s = byType("taylorApprox"); // eˣ at x = 1, tolerance 0.01 -> smallest n is 4
    expect(evaluate(s, 4).correct).toBe(true);
    expect(evaluate(s, 3).feedback).toBe(s.lowFeedback); // error 0.0516, still outside
    expect(evaluate(s, 6).feedback).toBe(s.highFeedback); // works, but more terms than needed
    expect(Math.abs(taylorPartial("exp", 4, 1) - Math.E)).toBeLessThan(0.01);
    expect(Math.abs(taylorPartial("exp", 3, 1) - Math.E)).toBeGreaterThan(0.01);
    // the radius, made numeric: the terms of 1/(1−x) shrink strictly inside |x| = 1 and NOT outside
    for (const x of [0.5, 0.9]) {
      expect(Math.abs(taylorTerm("geometric", 8, x))).toBeLessThan(Math.abs(taylorTerm("geometric", 7, x)));
    }
    expect(Math.abs(taylorTerm("geometric", 8, 1))).toBe(Math.abs(taylorTerm("geometric", 7, 1))); // dead level
    expect(Math.abs(taylorTerm("geometric", 8, 1.2))).toBeGreaterThan(Math.abs(taylorTerm("geometric", 7, 1.2)));
    expect(taylorFn("geometric", 0.5)).toBeCloseTo(2, 10);
    expect(correctAnswerText(s)).toBe("4 terms");
  });

  it("sliceSum: one idea in three modes — slice it, measure the slice, add them up", () => {
    const s = byType("sliceSum"); // area between y = x and y = x² on [0,1]
    expect(sliceExact("areaBetween")).toBeCloseTo(1 / 6, 10);
    expect(sliceExact("disc")).toBeCloseTo((8 * Math.PI) / 3, 10); // the cone
    expect(sliceExact("washer")).toBeCloseTo((2 * Math.PI) / 15, 10);
    // the slice's MEASUREMENT is what changes between modes — the summing never does
    expect(sliceMeasure("areaBetween", 0.5)).toBeCloseTo(0.25, 10); // top − bottom
    expect(sliceMeasure("disc", 1)).toBeCloseTo(Math.PI, 10); // πr² with r = 1
    expect(sliceMeasure("washer", 1)).toBeCloseTo(0, 10); // R = r there, so the washer has no meat
    // the fourth mode: a polar slice is a TRIANGLE, so its measurement carries a ½ that no other mode has
    expect(sliceExact("sector")).toBeCloseTo(Math.PI / 2, 10); // ∫₀^{π/2} 2cos²θ dθ — a half-disc of radius 1
    expect(sliceMeasure("sector", 0)).toBeCloseTo(2, 10); // ½(2cos0)² = ½·4 = 2
    expect(sliceMeasure("sector", Math.PI / 2)).toBeCloseTo(0, 10); // the wedge closes to nothing
    // r shrinks across the interval, so LEFT overshoots and RIGHT undershoots — both wrong paths live
    expect(sliceEstimate("sector", 12, "left")).toBeGreaterThan(Math.PI / 2);
    expect(sliceEstimate("sector", 12, "right")).toBeLessThan(Math.PI / 2);
    // and the sums converge on the exact value from both sides
    expect(sliceEstimate("disc", 24, "left")).toBeLessThan((8 * Math.PI) / 3);
    expect(sliceEstimate("disc", 24, "right")).toBeGreaterThan((8 * Math.PI) / 3);
    expect(evaluate(s, { n: 24, rule: "left" }).correct).toBe(true);
    expect(evaluate(s, { n: 1, rule: "left" }).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, { n: 1, rule: "right" }).feedback).toBe(s.lowFeedback);
  });

  it("riemannSum: left UNDERSHOOTS and right OVERSHOOTS, so the truth is trapped between them", () => {
    const s = byType("riemannSum"); // ∫₀² x² dx = 8/3, tolerance 0.1
    expect(exactArea("square", 0, 2)).toBeCloseTo(8 / 3, 10);
    for (const n of [4, 8, 16]) {
      const left = riemannEstimate("square", 0, 2, n, "left");
      const right = riemannEstimate("square", 0, 2, n, "right");
      expect(left).toBeLessThan(8 / 3); // rising curve: the left rule can only undershoot
      expect(right).toBeGreaterThan(8 / 3); // and the right rule can only overshoot
      expect(right - left).toBeCloseTo(8 / n, 10); // the trap closes like 1/n
    }
    expect(riemannEstimate("line", 0, 3, 1, "trap")).toBeCloseTo(9, 10); // trapezoid is EXACT on a line
    expect(evaluate(s, { n: 12, rule: "mid" }).correct).toBe(true);
    expect(evaluate(s, { n: 2, rule: "left" }).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, { n: 2, rule: "right" }).feedback).toBe(s.highFeedback);
  });

  it("accumulateArea: the slope of the accumulation IS the height of the function (A′ = f)", () => {
    const s = byType("accumulateArea"); // f = 2x, so A = x²; sweep to area 4
    expect(evaluate(s, 2).correct).toBe(true);
    expect(evaluate(s, 1).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, 3).feedback).toBe(s.highFeedback);
    // the theorem itself, checked numerically for every function in the widget's library
    const h = 1e-6;
    for (const fn of ["const", "line", "square", "shifted"] as const) {
      for (const x of [0.5, 1.5, 3]) {
        const slopeOfA = (accumAreaAt(fn, x + h) - accumAreaAt(fn, x - h)) / (2 * h);
        expect(slopeOfA).toBeCloseTo(accumFnAt(fn, x), 4);
      }
    }
    expect(accumFnAt("shifted", 2)).toBe(0); // f crosses zero...
    expect(accumAreaAt("shifted", 2)).toBe(-2); // ...and that is exactly where A is flat
    expect(correctAnswerText(s)).toBe("an accumulated area of 4");
  });

  it("derivativeTrace: f′ is a FUNCTION, and it does not exist at a corner", () => {
    const s = byType("derivativeTrace"); // f = x², find x with f′(x) = 6
    expect(evaluate(s, 3).correct).toBe(true);
    expect(evaluate(s, 1).feedback).toBe(s.lowFeedback); // slope 2
    expect(evaluate(s, 4).feedback).toBe(s.highFeedback); // slope 8
    expect(traceSlopeAt("square", 3)).toBe(6);
    expect(traceSlopeAt("cubic", 2)).toBe(12);
    expect(traceSlopeAt("abs", 0)).toBeNull(); // the corner: no tangent, no derivative
    expect(traceSlopeAt("abs", -2)).toBe(-1);
    expect(traceSlopeAt("abs", 2)).toBe(1); // the jump from −1 to +1 IS why f′(0) cannot exist
    expect(correctAnswerText(s)).toBe("an x where f′(x) = 6");
  });

  it("compassConstruct: arcs that cannot reach and a radius overshot diagnose separately", () => {
    const s = byType("compassConstruct"); // AB = 8, smallest whole radius that meets is 5
    expect(evaluate(s, 5).correct).toBe(true);
    expect(evaluate(s, 3).feedback).toBe(s.lowFeedback); // 2×3 < 8: the arcs never touch
    expect(evaluate(s, 8).feedback).toBe(s.highFeedback); // meets, but not the smallest
    expect(compassSteps(6, 6)).toBeCloseTo(6, 10); // the hexagon: radius steps round exactly six times
    expect(correctAnswerText(s)).toBe("a compass radius of 5");
  });

  it("quadDrag: the shape names itself, and the hierarchy is honoured", () => {
    const s = byType("quadDrag"); // (0,0) (6,0) (6,4) + the learner's corner
    expect(evaluate(s, { x: 0, y: 4 }).correct).toBe(true);
    // both wrong paths must be REACHABLE: with three vertices pinned, "parallelogram but not the
    // target" cannot occur, so the split is by axis — off to the side vs right column, wrong height
    expect(evaluate(s, { x: 1, y: 4 }).feedback).toBe(s.sideFeedback); // not in A's column at all
    expect(evaluate(s, { x: 0, y: 6 }).feedback).toBe(s.angleFeedback); // right column, wrong height
    expect(quadName([[0, 0], [4, 0], [4, 4], [0, 4]])).toBe("a square");
    expect(quadName([[0, 0], [6, 0], [6, 4], [0, 4]])).toBe("a rectangle");
    expect(quadName([[0, 0], [5, 0], [8, 4], [3, 4]])).toBe("a rhombus"); // every side 5, diagonals unequal
    expect(quadName([[0, 0], [5, 0], [6, 3], [1, 3]])).toBe("a parallelogram");
  });

  it("radicalCheck: the extraneous root gets its own diagnosis, not a generic miss", () => {
    const s = byType("radicalCheck"); // √(x+2) = x -> true root 2, phantom −1
    expect(evaluate(s, 2).correct).toBe(true);
    expect(evaluate(s, -1).feedback).toBe(s.extraneousFeedback); // passes the SQUARED eq, fails the original
    expect(evaluate(s, 5).feedback).toBe(s.missFeedback); // not a root of anything
    expect(correctAnswerText(s)).toBe("x = 2");
  });

  it("sequenceBuild: a ceiling too low and too high diagnose separately", () => {
    const s = byType("sequenceBuild"); // 4, forever-sum must be 8 -> r = 0.5
    expect(evaluate(s, 5).correct).toBe(true);
    expect(evaluate(s, 2).feedback).toBe(s.lowFeedback); // 4/0.8 = 5, ceiling too low
    expect(evaluate(s, 8).feedback).toBe(s.highFeedback); // 4/0.2 = 20, ceiling too high
    expect(correctAnswerText(s)).toBe("r = 0.5");
  });

  it("triangleSolve: a third side too short and too long diagnose separately", () => {
    const s = byType("triangleSolve"); // sides 5 and 8; third side must be 7
    expect(evaluate(s, 60).correct).toBe(true);
    expect(evaluate(s, 30).feedback).toBe(s.lowFeedback); // narrow angle -> short third side
    expect(evaluate(s, 120).feedback).toBe(s.highFeedback);
    expect(lawOfCosinesSide(5, 8, 60)).toBeCloseTo(7, 10);
    expect(lawOfCosinesAngle(5, 8, 7)).toBeCloseTo(60, 8); // the two are inverse readings of one triangle
    expect(lawOfCosinesSide(3, 4, 90)).toBeCloseTo(5, 10); // Pythagoras is the right-angled special case
    expect(correctAnswerText(s)).toBe("7 (the third side)");
  });

  it("signChart: flipping at a double root is diagnosed differently from missing a crossing", () => {
    const s = byType("signChart"); // (x+2)(x−1)²(x−3), leading +
    expect(signChartSigns(s.roots, s.leadingPositive)).toEqual(["+", "-", "-", "+"]);
    expect(evaluate(s, ["+", "-", "-", "+"]).correct).toBe(true);
    // flipped across the DOUBLE root at 1 — the bounce mistaken for a crossing
    expect(evaluate(s, ["+", "-", "+", "-"]).feedback).toBe(s.bounceFeedback);
    // no flip across the single root at −2 (and correctly no flip at the double root) — a missed crossing
    expect(evaluate(s, ["+", "+", "+", "-"]).feedback).toBe(s.crossFeedback);
    expect(canCheck(s, null)).toBe(false);
    expect(correctAnswerText(s)).toBe("+ - - +");
  });

  it("polarTrace: the petal rule is not monotonic in n, and the feedback tracks PETALS not n", () => {
    const s = byType("polarTrace"); // 4 petals wanted
    expect(evaluate(s, 2).correct).toBe(true); // even n -> 2n petals
    expect(evaluate(s, 1).feedback).toBe(s.lowFeedback); // 1 petal
    expect(evaluate(s, 3).feedback).toBe(s.lowFeedback); // 3 petals — a BIGGER n with FEWER petals
    expect(evaluate(s, 4).feedback).toBe(s.highFeedback); // 8 petals
    expect(rosePetals(3)).toBe(3);
    expect(rosePetals(4)).toBe(8);
    expect(correctAnswerText(s)).toBe("4 petals");
  });

  it("circleMeasureExplore: a chord too short and too long diagnose separately", () => {
    const s = byType("circleMeasureExplore"); // r = 5, chord must reach 8
    expect(evaluate(s, 3).correct).toBe(true); // 2√(25−9) = 8
    expect(evaluate(s, 4).feedback).toBe(s.lowFeedback); // chord 6, too far out
    expect(evaluate(s, 0).feedback).toBe(s.highFeedback); // chord 10, the diameter
    expect(circleMeasureReadout("chordDistance", 5, 3)).toBeCloseTo(8, 10);
    expect(circleMeasureReadout("tangentLength", 5, 13)).toBeCloseTo(12, 10); // 5-12-13
    expect(circleMeasureReadout("arcSector", 6, 60)).toBe(60);
    expect(correctAnswerText(s)).toBe("a length of 8");
  });

  it("vectorExplore: a positive and a negative dot product diagnose separately", () => {
    const s = byType("vectorExplore"); // u = (3,4), steer the dot product to 0
    expect(evaluate(s, { vx: 4, vy: -3 }).correct).toBe(true);
    expect(evaluate(s, { vx: -4, vy: 3 }).correct).toBe(true); // the OTHER perpendicular is also right
    expect(evaluate(s, { vx: 3, vy: 0 }).feedback).toBe(s.highFeedback); // dot 9 > 0, still leaning together
    expect(evaluate(s, { vx: -3, vy: 0 }).feedback).toBe(s.lowFeedback); // dot −9 < 0, leaning apart
    expect(dotProduct(3, 4, 4, -3)).toBe(0);
    expect(dotProduct(3, 4, 3, 4)).toBe(25); // u · u = |u|²
    expect(correctAnswerText(s)).toBe("a v with u · v = 0");
  });

  it("argandExplore: a wrong real part and a wrong imaginary part diagnose separately", () => {
    const s = byType("argandExplore"); // multiply by i; product must be −2
    expect(evaluate(s, { re: 0, im: 2 }).correct).toBe(true); // 2i × i = −2
    expect(evaluate(s, { re: 1, im: 0 }).feedback).toBe(s.realFeedback); // 1 × i = i → real part 0, not −2
    expect(evaluate(s, { re: -1, im: 2 }).feedback).toBe(s.imagFeedback); // (−1+2i)i = −2 − i → real right, imag wrong
    expect(correctAnswerText(s)).toBe("a z whose product is -2 + 0i");
    // multiplication by i is a quarter turn, and twice round is a half turn
    expect(complexProduct(1, 0, 0, 1)).toEqual([0, 1]);
    expect(complexProduct(0, 1, 0, 1)).toEqual([-1, 0]); // i² = −1
    expect(complexProduct(2, 3, 2, -3)).toEqual([13, 0]); // z × conjugate is real: |z|²
  });

  it("secantSlope: a gap of zero and a gap left too wide diagnose separately", () => {
    const s = byType("secantSlope"); // limit mode, a = 3 on y = x², squeeze to 0.1
    expect(evaluate(s, 0.1).correct).toBe(true);
    expect(evaluate(s, 0).feedback).toBe(s.lowFeedback); // 0/0 — not the limit, the death of the quotient
    expect(evaluate(s, 1.5).feedback).toBe(s.highFeedback); // still a chord, not a tangent
    expect(secantSlopeOver("square", 3, 0)).toBeNull(); // the quotient does not exist at h = 0
    expect(secantSlopeOver("square", 3, 1)).toBeCloseTo(7, 10); // (16 − 9)/1
    expect(secantSlopeOver("square", 3, 0.001)).toBeCloseTo(6.001, 6); // converging on 2a = 6
    expect(correctAnswerText(s)).toBe("squeeze the gap to 0.1 or less (slope → 6)");
  });

  it("expLogExplore: too-small and too-large bases diagnose separately, and log is exp read backwards", () => {
    const s = byType("expLogExplore"); // b^3 = 8 -> base 2
    expect(evaluate(s, 2).correct).toBe(true);
    expect(evaluate(s, 1.5).feedback).toBe(s.lowFeedback); // 1.5^3 = 3.375 < 8
    expect(evaluate(s, 3).feedback).toBe(s.highFeedback); // 3^3 = 27 > 8
    expect(correctAnswerText(s)).toBe("base 2");
    // the two readouts are inverse statements of the same fact
    expect(expLogReadout("exponential", 2, 3)).toBeCloseTo(8, 10);
    expect(expLogReadout("logarithm", 2, 8)).toBeCloseTo(3, 10);
    expect(expLogReadout("logarithm", 1, 8)).toBeNull(); // base 1 has no logarithm
  });

  it("graphZoom: looking too little and judging wrongly diagnose separately", () => {
    const s = byType("graphZoom"); // removable hole at x=2, limit 4, requiredZoom 3
    expect(evaluate(s, { zoom: 3, verdict: "limit-exists" }).correct).toBe(true);
    expect(evaluate(s, { zoom: 1, verdict: "limit-exists" }).feedback).toBe(s.moreZoomFeedback); // right call, never looked
    expect(evaluate(s, { zoom: 5, verdict: "no-limit" }).feedback).toBe(s.wrongVerdictFeedback); // looked, wrong call
    expect(canCheck(s, { zoom: 5, verdict: null })).toBe(false); // no verdict => cannot check
    expect(correctAnswerText(s)).toBe("the limit exists (it is 4)");
  });

  it("circleAngleExplore: the readout is half the arc, and too-small/too-big diagnose separately", () => {
    const s = byType("circleAngleExplore"); // inscribed, target 40 -> arc 80
    expect(evaluate(s, 80).correct).toBe(true);
    expect(evaluate(s, 60).feedback).toBe(s.lowFeedback); // 30° at P
    expect(evaluate(s, 120).feedback).toBe(s.highFeedback); // 60° at P
    expect(correctAnswerText(s)).toBe("40°");
    // the readout helper is the single source of truth for all four modes
    expect(circleReadout("central", 80)).toBe(80);
    expect(circleReadout("inscribed", 80)).toBe(40);
    expect(circleReadout("tangentChord", 80)).toBe(40);
    expect(circleReadout("cyclic", 140)).toBe(110); // opposite angle = 180 - 70
  });

  it("sampleSim: wrong sample size and too-few draws diagnose separately", () => {
    const s = byType("sampleSim"); // n = 100, 20 draws
    expect(evaluate(s, { size: 100, draws: 20 }).correct).toBe(true);
    expect(evaluate(s, { size: 10, draws: 40 }).feedback).toBe(s.wrongSizeFeedback); // drew plenty, wrong n
    expect(evaluate(s, { size: 100, draws: 3 }).feedback).toBe(s.moreDrawsFeedback); // right n, too few
    expect(canCheck(s, { size: 100, draws: 0 })).toBe(true); // the widget always has a value; evaluate gates it
    expect(evaluate(s, { size: 100, draws: 0 }).correct).toBe(false);
    expect(correctAnswerText(s)).toBe("samples of 100, at least 20 of them");
  });

  it("ciCapture: wrong level and too-few intervals diagnose separately", () => {
    const s = byType("ciCapture"); // 95%, 20 intervals
    expect(evaluate(s, { level: 95, drawn: 20 }).correct).toBe(true);
    expect(evaluate(s, { level: 80, drawn: 30 }).feedback).toBe(s.wrongLevelFeedback);
    expect(evaluate(s, { level: 95, drawn: 4 }).feedback).toBe(s.moreIntervalsFeedback);
    expect(correctAnswerText(s)).toBe("95% intervals, at least 20 of them");
  });

  it("shuffleTest: simulating too little and judging wrongly diagnose separately", () => {
    const s = byType("shuffleTest"); // 20 shuffles, verdict "real"
    expect(evaluate(s, { shuffles: 20, verdict: "real" }).correct).toBe(true);
    expect(evaluate(s, { shuffles: 2, verdict: "real" }).feedback).toBe(s.moreShufflesFeedback); // right call, no evidence
    expect(evaluate(s, { shuffles: 40, verdict: "chance" }).feedback).toBe(s.wrongVerdictFeedback); // evidence, wrong call
    expect(canCheck(s, { shuffles: 40, verdict: null })).toBe(false); // no verdict => cannot check
    expect(correctAnswerText(s)).toBe("bigger than chance alone tends to produce");
  });

  it("spinnerSim: the right number of winning sectors wins", () => {
    const s = byType("spinnerSim"); // 3 of 8
    expect(evaluate(s, 3).correct).toBe(true);
    expect(evaluate(s, 1).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, 6).feedback).toBe(s.highFeedback);
    expect(correctAnswerText(s)).toBe("3 of 8");
  });

  it("algebraTiles: wrong-x vs wrong-constant diagnose separately", () => {
    const s = byType("algebraTiles"); // −3x + 5x = 2x, no constant
    expect(evaluate(s, { x: 2, c: 0 }).correct).toBe(true);
    expect(evaluate(s, { x: 8, c: 0 }).feedback).toBe(s.xFeedback);
    expect(evaluate(s, { x: 2, c: 3 }).feedback).toBe(s.constFeedback); // x right, constant wrong
    expect(correctAnswerText(s)).toBe("2x + 0");
  });

  it("ratioTable: the equivalent-ratio value wins; under/over split", () => {
    const s = byType("ratioTable"); // 3:2 → 12:8
    expect(evaluate(s, 8).correct).toBe(true);
    expect(evaluate(s, 5).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, 11).feedback).toBe(s.highFeedback);
    expect(correctAnswerText(s)).toBe("8");
  });

  it("fractionOfSet: the right count wins (fraction of the set); under/over split", () => {
    const s = byType("fractionOfSet"); // 3/4 of 12 = 9
    expect(evaluate(s, 9).correct).toBe(true);
    expect(evaluate(s, 6).feedback).toBe(s.lowFeedback);
    expect(evaluate(s, 12).feedback).toBe(s.highFeedback);
    expect(correctAnswerText(s)).toBe("9");
  });

  it("barBuilder histogram mode: same check, contiguous bins", () => {
    const hist = (SAMPLES as TWidget[]).find((x): x is Extract<TWidget, { type: "barBuilder" }> => x.type === "barBuilder" && x.histogram);
    expect(hist).toBeTruthy();
    if (hist) {
      expect(evaluate(hist, [...hist.target]).correct).toBe(true);
      expect(evaluate(hist, [0, 0, 0, 0]).feedback).toBe(hist.partialFeedback);
    }
  });

  it("placeValue: any equal-value block combo wins (10 ones = 1 ten); under/over split", () => {
    const s = byType("placeValue"); // target 234
    expect(evaluate(s, { h: 2, t: 3, o: 4 }).correct).toBe(true);
    expect(evaluate(s, { h: 2, t: 2, o: 14 }).correct).toBe(true); // 200+20+14 = 234, non-standard
    expect(evaluate(s, { h: 2, t: 3, o: 0 }).feedback).toBe(s.lowFeedback); // 230
    expect(evaluate(s, { h: 3, t: 0, o: 0 }).feedback).toBe(s.highFeedback); // 300
    expect(correctAnswerText(s)).toBe("234");
  });

  it("clockSet: exact time wins; wrong hour vs wrong minute diagnose separately", () => {
    const s = byType("clockSet"); // 3:15
    expect(evaluate(s, { hour: 3, minute: 15 }).correct).toBe(true);
    expect(evaluate(s, { hour: 4, minute: 15 }).feedback).toBe(s.hourFeedback);
    expect(evaluate(s, { hour: 3, minute: 30 }).feedback).toBe(s.minuteFeedback);
    expect(correctAnswerText(s)).toBe("3:15");
  });

  it("balanceScale: the balancing x wins; light vs heavy left pan split", () => {
    const s = byType("balanceScale"); // 2x+3=11 → x=4
    expect(evaluate(s, { x: 4 }).correct).toBe(true);
    expect(evaluate(s, { x: 2 }).feedback).toBe(s.lowFeedback); // 7 < 11
    expect(evaluate(s, { x: 6 }).feedback).toBe(s.highFeedback); // 15 > 11
    expect(correctAnswerText(s)).toBe("x = 4");
  });

  it("dragOrder: anticipated transposition gets its own feedback; other misses fall back", () => {
    const s = byType("dragOrder");
    const r = evaluate(s, ["n20", "n15", "n10", "n5"]);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("20 landed before 5");
    const r2 = evaluate(s, ["n5", "n15", "n10", "n20"]);
    expect(r2.feedback).toContain("Start at the smallest");
  });

  it("dragBucket: misplaced item surfaces ITS diagnosis plus a running score", () => {
    const s = byType("dragBucket");
    const r = evaluate(s, { s1: "add", s2: "add", s3: "mul" });
    expect(r.correct).toBe(false);
    expect(r.score).toBeCloseTo(2 / 3);
    expect(r.feedback).toContain("2 of 3 sorted right");
    expect(r.feedback).toContain("equal groups call for multiplying");
  });

  it("matchPairs: anticipated wrong link diagnoses the groups-first mixup", () => {
    const s = byType("matchPairs");
    const r = evaluate(s, { l1: "r1", l2: "r3", l3: "r2" });
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("2 nests of 3 reads groups-first");
  });

  it("buildExpression: the + build is diagnosed; commutative build is accepted", () => {
    const s = byType("buildExpression");
    expect(evaluate(s, ["t5", "tp", "t3"]).feedback).toContain("equal groups need ×");
    expect(evaluate(s, ["t3", "tx", "t5"]).correct).toBe(true);
  });

  it("plotPoint: wrong-column dot gets the anticipated feedback and partial credit", () => {
    const s = byType("plotPoint");
    const r = evaluate(s, [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 1 }
    ]);
    expect(r.correct).toBe(false);
    expect(r.score).toBeCloseTo(2 / 3);
    expect(r.feedback).toContain("Dog column");
  });

  it("toggleExplore: half-solved state hits its commonStates diagnosis; rule tree evaluates", () => {
    const s = byType("toggleExplore");
    const r = evaluate(s, { sw1: true, sw2: false });
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("BOTH");
    expect(evalRule({ op: "not", args: [{ op: "or", args: ["a", "b"] }] }, { a: false, b: false })).toBe(true);
  });

  it("steppedReveal: partial reveal nudges forward; full reveal succeeds", () => {
    const s = byType("steppedReveal");
    expect(evaluate(s, 1).correct).toBe(false);
    expect(evaluate(s, 3).correct).toBe(true);
  });

  it("estimateSlider: accepts within ×2, splits low/high outside it", () => {
    const s = byType("estimateSlider");
    expect(evaluate(s, 600).correct).toBe(true);
    expect(evaluate(s, 2000).correct).toBe(true);
    expect(evaluate(s, 100).feedback).toContain("Slide up");
    expect(evaluate(s, 9000).feedback).toContain("Ease back down");
  });
});

describe("canCheck gates incomplete states", () => {
  it("dragBucket requires every item placed", () => {
    const s = byType("dragBucket");
    expect(canCheck(s, { s1: "mul" })).toBe(false);
    expect(canCheck(s, { s1: "mul", s2: "add", s3: "mul" })).toBe(true);
  });
  it("matchPairs requires every left linked", () => {
    const s = byType("matchPairs");
    expect(canCheck(s, { l1: "r3" })).toBe(false);
  });
  it("steppedReveal stays locked until all panels are seen", () => {
    const s = byType("steppedReveal");
    expect(canCheck(s, 2)).toBe(false);
    expect(canCheck(s, 3)).toBe(true);
  });
  it("buildExpression and plotPoint need at least one placement", () => {
    expect(canCheck(byType("buildExpression"), [])).toBe(false);
    expect(canCheck(byType("plotPoint"), [])).toBe(false);
  });
});

describe("reveal text", () => {
  it("renders human-readable answers per type", () => {
    expect(correctAnswerText(byType("dragOrder"))).toBe("5 → 10 → 15 → 20");
    expect(correctAnswerText(byType("buildExpression"))).toBe("5 × 3");
    expect(correctAnswerText(byType("toggleExplore"))).toContain("Turn both switches on");
    expect(correctAnswerText(byType("plotPoint"))).toBe("(1, 1), (1, 2), (1, 3)");
  });
});

describe("snap2sf", () => {
  it("keeps two significant figures across magnitudes", () => {
    expect(snap2sf(1234)).toBe(1200);
    expect(snap2sf(987)).toBe(990);
    expect(snap2sf(43)).toBe(43);
    expect(snap2sf(9.6)).toBeCloseTo(9.6);
  });
});

describe("evaluate — G1–G2 manipulatives", () => {
  it("tenFrame: exact fill succeeds; anticipated miscount diagnoses; direction hint otherwise", () => {
    const s = byType("tenFrame");
    expect(evaluate(s, 10).correct).toBe(true);
    expect(evaluate(s, 8).feedback).toContain("One tap isn't enough");
    expect(evaluate(s, 9)).toMatchObject({ correct: false });
    expect(evaluate(s, 9).feedback).toContain("Add more dots");
  });

  it("numberLineHop: landing on start+hop*hops wins; backward and short hops each diagnosed", () => {
    const s = byType("numberLineHop");
    expect(evaluate(s, 8).correct).toBe(true);
    expect(evaluate(s, 3).feedback).toContain("backward");
    expect(evaluate(s, 7).feedback).toContain("only 2 hops");
  });

  it("baseTenCompose: standard form required; digit-flip and total-mismatch each caught", () => {
    const s = byType("baseTenCompose");
    expect(evaluate(s, { tens: 2, ones: 4 }).correct).toBe(true);
    expect(evaluate(s, { tens: 4, ones: 2 }).feedback).toContain("flipped");
    expect(evaluate(s, { tens: 1, ones: 0 }).feedback).toContain("not 24");
  });

  it("subitizeFlash: right count wins; near-miss picks get their own diagnosis", () => {
    const s = byType("subitizeFlash");
    expect(evaluate(s, 5).correct).toBe(true);
    expect(evaluate(s, 4).feedback).toContain("center");
    expect(evaluate(s, 6).feedback).toContain("One too many");
  });

  it("canCheck gates interaction: baseTenCompose needs a placement; others need a value", () => {
    expect(canCheck(byType("baseTenCompose"), { tens: 0, ones: 0 })).toBe(false);
    expect(canCheck(byType("baseTenCompose"), { tens: 2, ones: 4 })).toBe(true);
    expect(canCheck(byType("tenFrame"), undefined)).toBe(false);
    expect(canCheck(byType("numberLineHop"), 8)).toBe(true);
  });

  it("reveal text reads naturally for early-math widgets", () => {
    expect(correctAnswerText(byType("tenFrame"))).toBe("10 in the frame");
    expect(correctAnswerText(byType("numberLineHop"))).toBe("land on 8");
    expect(correctAnswerText(byType("baseTenCompose"))).toBe("2 tens and 4 ones");
    expect(correctAnswerText(byType("subitizeFlash"))).toBe("5");
  });
});

/* ---------------- matrixTransform: each wrong path gets its OWN diagnosis ---------------- */

describe("matrixTransform diagnosis", () => {
  const s = byType("matrixTransform"); // target: 90° CCW rotation [[0 −1],[1 0]]

  it("the exact rotation matrix is correct, and the reveal names both columns", () => {
    expect(evaluate(s, { a: 0, b: -1, c: 1, d: 0 }).correct).toBe(true);
    expect(correctAnswerText(s)).toContain("î ↦ (0, 1)");
    expect(correctAnswerText(s)).toContain("ĵ ↦ (-1, 0)");
  });

  it("the column swap (transpose) is diagnosed as rows/columns confusion, not a generic miss", () => {
    // swapping the columns of [[0 −1],[1 0]] gives [[−1 0],[0 1]]… careful: swap means
    // learner entered î's image (0,1) in column 2 and ĵ's image (−1,0) in column 1.
    const r = evaluate(s, { a: -1, b: 0, c: 0, d: 1 });
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("Columns are destinations");
  });

  it("the off-diagonal sign flip is diagnosed as the wrong rotation direction", () => {
    const r = evaluate(s, { a: 0, b: 1, c: -1, d: 0 }); // 90° clockwise
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("other way round");
  });

  it("any other matrix gets the follow-one-basis-vector fallback", () => {
    const r = evaluate(s, { a: 2, b: 0, c: 0, d: 2 }); // a dilation, not a rotation
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("one basis vector at a time");
  });

  it("canCheck follows the explore-widget contract (self-initializing, always checkable) and evaluate stays null-safe", () => {
    expect(canCheck(s, { a: 1, b: 0, c: 0, d: 1 })).toBe(true);
    // The component initializes value on mount; if a null ever reaches evaluate anyway, it must
    // coach rather than crash.
    expect(evaluate(s, null).correct).toBe(false);
    expect(evaluate(s, null).feedback).toContain("Step the matrix entries");
  });
});

/* ---------------- baseTenCompose hundreds extension ---------------- */

describe("baseTenCompose with a hundreds place", () => {
  const spec = {
    type: "baseTenCompose",
    prompt: "Build 246.",
    target: 246,
    requireStandard: true,
    maxHundreds: 9,
    maxTens: 19,
    maxOnes: 20,
    commonBuilds: [
      { hundreds: 2, tens: 6, ones: 4, feedback: "That builds 264 — the tens and ones digits swapped jobs. In 246 the 4 counts rods and the 6 counts cubes." }
    ],
    missFeedback: "Read the digits left to right: 2 flats, 4 rods, 6 cubes.",
    successFeedback: "2 hundreds, 4 tens, 6 ones — 246."
  } as TWidget;

  it("grades the standard three-place build, and names the answer with hundreds", () => {
    expect(evaluate(spec, { hundreds: 2, tens: 4, ones: 6 }).correct).toBe(true);
    expect(correctAnswerText(spec)).toBe("2 hundreds, 4 tens and 6 ones");
  });

  it("the digit-swap misconception gets its authored diagnosis, not a generic miss", () => {
    expect(evaluate(spec, { hundreds: 2, tens: 6, ones: 4 }).feedback).toContain("swapped jobs");
  });

  it("a wrong total names the number actually built", () => {
    expect(evaluate(spec, { hundreds: 1, tens: 4, ones: 6 }).feedback).toContain("That builds 146, not 246");
  });

  it("a correct total in non-standard form is coached toward standard form (with hundreds)", () => {
    expect(evaluate(spec, { hundreds: 1, tens: 14, ones: 6 }).feedback).toContain(
      "standard form: 2 hundreds, 4 tens and 6 ones"
    );
  });

  it("regroup practice (requireStandard false) accepts any trade landing on the target", () => {
    const free = { ...spec, requireStandard: false } as TWidget;
    expect(evaluate(free, { hundreds: 1, tens: 14, ones: 6 }).correct).toBe(true);
    expect(evaluate(free, { hundreds: 2, tens: 3, ones: 16 }).correct).toBe(true);
  });

  it("canCheck counts hundreds as a placement; legacy two-place values still work", () => {
    expect(canCheck(spec, { hundreds: 1, tens: 0, ones: 0 })).toBe(true);
    expect(canCheck(spec, { tens: 0, ones: 0 })).toBe(false);
    expect(evaluate({ ...spec, target: 46, maxHundreds: 0 } as TWidget, { tens: 4, ones: 6 }).correct).toBe(true);
  });
});
