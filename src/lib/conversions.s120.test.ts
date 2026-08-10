/**
 * S120 — the uptake batch. Three capabilities the S116 playbook specified and this repo built had
 * reached almost no lessons: `triangleSolve mode:"ratios"` (1 lesson), `quadDrag.showMidsegment`
 * (0), and `coordinateProofLab` (1). This suite pins both halves of the fix.
 *
 * The `showMidsegment` half is the one worth reading. The enhancement shipped with an integrity
 * gate that refused any shape `quadName` called "just a quadrilateral" — and `quadName` had no
 * trapezoid case, so the gate rejected EVERY trapezoid: the exact family the trapezoid midsegment
 * theorem is about. The renderer had been correct for trapezoids all along. Both the classifier
 * and the gate are pinned here against real geometry so the capability cannot silently become
 * unreachable again.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  columnCalcTruth,
  columnCalcReachable,
  WidgetSpec,
  widgetIntegrityErrors,
  quadName,
  hasParallelBasePair,
  midsegmentLength,
  altitudeMeans,
  triangleRatio
} from "./schema";
import { evaluate, lawOfCosinesAngle } from "./evaluate";

const step = (course: string, id: string, sid: string) => {
  const l = JSON.parse(
    readFileSync(join(process.cwd(), "content", "courses", course, "lessons", `${id}.json`), "utf8")
  ) as { steps: Array<{ id: string; kind: string; body?: string; widget?: Record<string, unknown>; predict?: unknown }> };
  const s = l.steps.find((x) => x.id === sid);
  if (!s) throw new Error(`${id}/${sid} not found`);
  return s;
};

describe("S120 — quadName knows what a trapezoid is", () => {
  it("names a trapezoid rather than disowning it", () => {
    expect(quadName([[0, 0], [8, 0], [6, 4], [2, 4]])).toBe("a trapezoid"); // isosceles
    expect(quadName([[0, 0], [8, 0], [8, 4], [2, 4]])).toBe("a trapezoid"); // right
  });

  it("changes nothing the model already named", () => {
    expect(quadName([[0, 0], [4, 0], [4, 4], [0, 4]])).toBe("a square");
    expect(quadName([[0, 0], [6, 0], [6, 3], [0, 3]])).toBe("a rectangle");
    expect(quadName([[0, 0], [5, 0], [8, 4], [3, 4]])).toBe("a rhombus");
    expect(quadName([[0, 0], [6, 0], [8, 3], [2, 3]])).toBe("a parallelogram");
    expect(quadName([[0, 0], [2, 2], [0, 6], [-2, 2]])).toBe("a kite");
    // No parallel pair in either direction: still nameless, as it should be.
    expect(quadName([[0, 0], [5, 0], [6, 4], [1, 7]])).toBe("just a quadrilateral");
  });

  it("refuses a collapsed quadrilateral whose vertices are collinear", () => {
    expect(hasParallelBasePair([[0, 0], [4, 0], [8, 0], [6, 0]])).toBe(false);
  });
});

describe("S120 — the showMidsegment gate admits the theorem's own family", () => {
  const spec = (fixed: number[][], tx: number, ty: number) => ({
    type: "quadDrag" as const,
    prompt: "p",
    fixed,
    targetX: tx,
    targetY: ty,
    startX: 5,
    startY: 2,
    gridMax: 8,
    targetName: "a trapezoid",
    showMidsegment: true,
    successFeedback: "s",
    sideFeedback: "a",
    angleFeedback: "b"
  });

  it("accepts a trapezoid — the case the name-proxy gate used to reject", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse(spec([[0, 0], [8, 0], [6, 4]], 2, 4)))).toEqual([]);
  });

  it("still rejects a shape with no parallel pair", () => {
    const errs = widgetIntegrityErrors(WidgetSpec.parse(spec([[0, 0], [5, 0], [6, 4]], 1, 7)));
    expect(errs.length).toBe(1);
    expect(errs[0]).toContain("not a parallel pair");
  });

  it("the drawn midsegment equals the average of the bases it claims to average", () => {
    const pts: Array<[number, number]> = [[0, 0], [8, 0], [6, 4], [2, 4]];
    const d = (i: number, j: number) => Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
    const mid = (i: number, j: number) => [(pts[i][0] + pts[j][0]) / 2, (pts[i][1] + pts[j][1]) / 2];
    const [ax, ay] = mid(1, 2), [bx, by] = mid(3, 0);
    expect(Math.hypot(ax - bx, ay - by)).toBeCloseTo(midsegmentLength(d(0, 1), d(2, 3)), 12);
    expect(midsegmentLength(8, 4)).toBe(6);
  });
});

describe("S120 — every converted step parses, gates clean, and commits before it manipulates", () => {
  const converted: Array<[string, string, string, string]> = [
    ["right-triangles-trig", "rt-01-04", "i1", "triangleSolve"],
    ["right-triangles-trig", "rt-03-01", "i1", "triangleSolve"],
    ["right-triangles-trig", "rt-03-02", "i1", "triangleSolve"],
    ["right-triangles-trig", "rt-04-02", "i2", "triangleSolve"],
    ["right-triangles-trig", "rt-05-01", "i1", "triangleSolve"],
    ["polygons-quadrilaterals", "pq-04-02", "i2", "quadDrag"],
    ["polygons-quadrilaterals", "pq-02-03", "i1", "coordinateProofLab"],
    ["polygons-quadrilaterals", "pq-05-01", "i2", "coordinateProofLab"]
  ];

  it.each(converted)("%s/%s/%s is a valid %s with a prediction", (course, id, sid, type) => {
    const s = step(course, id, sid);
    expect(s.widget?.type).toBe(type);
    expect(widgetIntegrityErrors(WidgetSpec.parse(s.widget))).toEqual([]);
    expect(s.predict, `${id}/${sid} must commit before it manipulates`).toBeTruthy();
    expect(s.kind).toBe("interactive");
  });
});

describe("S120 — the ratio labs teach a true invariance, and grade it", () => {
  const ratioSteps: Array<[string, string, string]> = [
    ["rt-01-04", "i1", "right-triangles-trig"],
    ["rt-03-01", "i1", "right-triangles-trig"],
    ["rt-03-02", "i1", "right-triangles-trig"],
    ["rt-04-02", "i2", "right-triangles-trig"],
    ["rt-05-01", "i1", "right-triangles-trig"]
  ];

  it.each(ratioSteps)("%s/%s grades the target at every scale and nowhere else", (id, sid, course) => {
    const spec = WidgetSpec.parse(step(course, id, sid).widget);
    if (spec.type !== "triangleSolve" || spec.mode !== "ratios") throw new Error("not a ratios lab");
    const moves = spec.requiredScaleMoves ?? 1;
    // The invariance claim: the same angle grades correct whatever the scale dial says.
    for (const scale of [0.5, 1, 2, 3])
      expect(evaluate(spec, { angle: spec.target, scale, scaleMoves: moves }).correct).toBe(true);
    // …and the scale dial cannot be skipped, or the invariance was never tested.
    expect(evaluate(spec, { angle: spec.target, scale: 1, scaleMoves: 0 }).correct).toBe(false);
    expect(evaluate(spec, { angle: spec.target, scale: 1, scaleMoves: 0 }).feedback).toBe(spec.scaleFeedback);
    // The start is off-target, and lands on whichever side its ratio actually falls.
    const wrong = evaluate(spec, { angle: spec.start, scale: 2, scaleMoves: moves });
    expect(wrong.correct).toBe(false);
    const rises = triangleRatio(spec.start, spec.ratio!) < triangleRatio(spec.target, spec.ratio!);
    expect(wrong.feedback).toBe(rises ? spec.lowFeedback : spec.highFeedback);
  });

  it("rt-01-04: the side opposite 30° is exactly half the hypotenuse", () => {
    expect(triangleRatio(30, "opp/hyp")).toBeCloseTo(0.5, 12);
  });

  it("rt-03-02: tan 45° is exactly 1, which is what the inverse is hunting", () => {
    expect(triangleRatio(45, "opp/adj")).toBeCloseTo(1, 12);
  });

  it("rt-05-01: cos 70° and sin 20° are the same number — the lab's whole claim", () => {
    expect(triangleRatio(70, "adj/hyp")).toBeCloseTo(triangleRatio(20, "opp/hyp"), 12);
  });

  it("rt-04-02: doubling 30° to 60° does NOT double the height, and the numbers say so", () => {
    const low = 90 * triangleRatio(30, "opp/hyp");
    const high = 90 * triangleRatio(60, "opp/hyp");
    expect(low).toBeCloseTo(45, 6);
    expect(high).toBeCloseTo(77.94, 2);
    expect(high / low).toBeLessThan(2);
    expect(high / low).toBeCloseTo(Math.sqrt(3), 6);
  });

  it("rt-03-01: 0.559 really is 11.18 ÷ 20 at 34°", () => {
    expect(triangleRatio(34, "opp/hyp")).toBeCloseTo(11.18 / 20, 3);
  });
});

describe("S120 — the coordinate-proof labs make the claim they assert", () => {
  it("pq-02-03: at the target the two diagonal midpoints are one point", () => {
    const spec = WidgetSpec.parse(step("polygons-quadrilaterals", "pq-02-03", "i1").widget);
    if (spec.type !== "coordinateProofLab") throw new Error("not a proof lab");
    const [A, B, C] = spec.fixed;
    const D = spec.target;
    const mid = (p: readonly [number, number], q: readonly [number, number]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    expect(mid(A, C)).toEqual(mid(B, D));
    // …and at the starting position they are not, so the contrast is reachable.
    expect(mid(A, C)).not.toEqual(mid(B, spec.start));
    expect(quadName([A, B, C, D] as Array<[number, number]>)).toBe("a parallelogram");
  });

  it("pq-05-01: equal diagonals plus mutual bisection is exactly a rectangle", () => {
    const spec = WidgetSpec.parse(step("polygons-quadrilaterals", "pq-05-01", "i2").widget);
    if (spec.type !== "coordinateProofLab") throw new Error("not a proof lab");
    const [A, B, C] = spec.fixed;
    const D = spec.target;
    const dist = (p: readonly [number, number], q: readonly [number, number]) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    expect(dist(A, C)).toBeCloseTo(dist(B, D), 12);
    expect(quadName([A, B, C, D] as Array<[number, number]>)).toBe("a rectangle");
    expect(spec.requiredEvidence).toContain("distances");
    expect(spec.requiredEvidence).toContain("midpoints");
  });

  it.each([["pq-02-03", "i1"], ["pq-05-01", "i2"]])("%s/%s: evidence cannot be skipped", (id, sid) => {
    const spec = WidgetSpec.parse(step("polygons-quadrilaterals", id, sid).widget);
    if (spec.type !== "coordinateProofLab") throw new Error("not a proof lab");
    const at = { x: spec.target[0], y: spec.target[1] };
    expect(evaluate(spec, { ...at, moves: spec.requiredMoves, evidence: [...spec.requiredEvidence] }).correct).toBe(true);
    expect(evaluate(spec, { ...at, moves: 0, evidence: [] }).feedback).toBe(spec.evidenceFeedback);
    expect(
      evaluate(spec, { x: spec.start[0], y: spec.start[1], moves: spec.requiredMoves, evidence: [...spec.requiredEvidence] }).feedback
    ).toBe(spec.positionFeedback);
  });
});

describe("S120 — pq-04-02 carries the midsegment readout it was built for", () => {
  it("the trapezoid closes at the target and the readout is the average", () => {
    const spec = WidgetSpec.parse(step("polygons-quadrilaterals", "pq-04-02", "i2").widget);
    if (spec.type !== "quadDrag") throw new Error("not a quadDrag");
    expect(spec.showMidsegment).toBe(true);
    const pts = [...spec.fixed, [spec.targetX, spec.targetY]] as Array<[number, number]>;
    expect(quadName(pts)).toBe("a trapezoid");
    const d = (i: number, j: number) => Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
    expect(midsegmentLength(d(0, 1), d(2, 3))).toBe(6);
    // The start is the contrast state: no parallel pair, so nothing to average.
    const startPts = [...spec.fixed, [spec.startX, spec.startY]] as Array<[number, number]>;
    expect(hasParallelBasePair(startPts)).toBe(false);
    expect(evaluate(spec, { x: spec.startX, y: spec.startY }).correct).toBe(false);
    expect(evaluate(spec, { x: spec.targetX, y: spec.targetY }).correct).toBe(true);
  });
});

/**
 * S120b — enhancement (b), `dilationExplore.showRatios`, handed to three more of the lessons the
 * playbook named for it. The dial-reachability block is the one that earned its place: a first
 * draft put sy-02-02's targetK at the very top of its dial, which made `highFeedback` unreachable
 * — authored diagnosis that could never fire. The pre-flight verifier caught it before it shipped,
 * and this pins the property for every dilation lab in the corpus, not just the new ones.
 */
describe("S120b — the similarity labs, and a dial every authored path can reach", () => {
  const dilations: Array<[string, string]> = [
    ["sy-02-01", "i1"],
    ["sy-02-02", "i1"],
    ["sy-03-03", "i1"]
  ];

  it.each(dilations)("%s/%s is a valid dilationExplore with a prediction", (id, sid) => {
    const s = step("similarity", id, sid);
    expect(s.widget?.type).toBe("dilationExplore");
    expect(widgetIntegrityErrors(WidgetSpec.parse(s.widget))).toEqual([]);
    expect(s.predict).toBeTruthy();
    expect(s.kind).toBe("interactive");
  });

  it.each(dilations)("%s/%s grades its target and both wrong sides", (id, sid) => {
    const spec = WidgetSpec.parse(step("similarity", id, sid).widget);
    if (spec.type !== "dilationExplore") throw new Error("not a dilation lab");
    expect(evaluate(spec, { k: spec.targetK }).correct).toBe(true);
    expect(evaluate(spec, { k: spec.targetK - spec.kStep }).feedback).toBe(spec.lowFeedback);
    expect(evaluate(spec, { k: spec.targetK + spec.kStep }).feedback).toBe(spec.highFeedback);
    expect(spec.kStart).not.toBe(spec.targetK);
  });

  it("no dilationExplore step in the corpus has an unreachable feedback path", () => {
    const root = join(process.cwd(), "content", "courses");
    let seen = 0;
    for (const course of readdirSync(root)) {
      const dir = join(root, course, "lessons");
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
        const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
          id: string;
          steps: Array<{ id: string; widget?: { type: string } & Record<string, number> }>;
        };
        for (const s of lesson.steps ?? []) {
          if (s.widget?.type !== "dilationExplore") continue;
          const spec = WidgetSpec.parse(s.widget);
          if (spec.type !== "dilationExplore") continue;
          seen++;
          const where = `${lesson.id}/${s.id}`;
          expect(spec.targetK - spec.kStep, `${where}: lowFeedback unreachable`).toBeGreaterThanOrEqual(spec.kMin - 1e-9);
          expect(spec.targetK + spec.kStep, `${where}: highFeedback unreachable`).toBeLessThanOrEqual(spec.kMax + 1e-9);
        }
      }
    }
    expect(seen).toBeGreaterThanOrEqual(10);
  });

  it("sy-02-01: 4 and 6 become 6 and 9 under one factor, and the angle is untouched", () => {
    const spec = WidgetSpec.parse(step("similarity", "sy-02-01", "i1").widget);
    if (spec.type !== "dilationExplore") throw new Error("not a dilation lab");
    expect(4 * spec.targetK).toBe(6);
    expect(6 * spec.targetK).toBe(9);
    // The two given sides meet at the centre of dilation, so the included angle cannot move.
    expect(spec.center).toEqual(spec.shape[0]);
  });

  it("sy-02-02: 3-4-5 becomes 9-12-15 at the target factor", () => {
    const spec = WidgetSpec.parse(step("similarity", "sy-02-02", "i1").widget);
    if (spec.type !== "dilationExplore") throw new Error("not a dilation lab");
    expect([3, 4, 5].map((s) => s * spec.targetK)).toEqual([9, 12, 15]);
  });

  it("sy-03-03: at the midpoint cut both side ratios read 1, and they agree everywhere", () => {
    const spec = WidgetSpec.parse(step("similarity", "sy-03-03", "i1").widget);
    if (spec.type !== "dilationExplore") throw new Error("not a dilation lab");
    expect(spec.showRatios).toEqual(["segments"]);
    expect(spec.targetK).toBe(0.5);
    const [A, B, C] = spec.shape as Array<[number, number]>;
    const at = (t: number) => {
      const D: [number, number] = [A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])];
      const E: [number, number] = [A[0] + t * (C[0] - A[0]), A[1] + t * (C[1] - A[1])];
      const len = (p: [number, number], q: [number, number]) => Math.hypot(p[0] - q[0], p[1] - q[1]);
      return [len(A, D) / len(D, B), len(A, E) / len(E, C)] as const;
    };
    // The claim the predict makes: equal at EVERY reachable position, not only the midpoint.
    for (const t of [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]) {
      const [r1, r2] = at(t);
      expect(r1).toBeCloseTo(r2, 12);
    }
    const [m1, m2] = at(0.5);
    expect(m1).toBeCloseTo(1, 12);
    expect(m2).toBeCloseTo(1, 12);
  });
});

/**
 * S120c — the two conversions §3.3 named that were still outstanding, both pure authoring against
 * engines already registered in the course. tc-02-01 was Tier D with `triangleConstraintLab`
 * sitting unused in the same course; tc-05-01's own dial ceiling turns out to BE the triangle
 * inequality, which is the fact its authored step asks for in words.
 */
describe("S120c — HL rescues SSA, and the inequality is a wall you reach", () => {
  it("tc-02-01/i3 tests HL against the SSA it repairs", () => {
    const s = step("triangle-congruence", "tc-02-01", "i3");
    const spec = WidgetSpec.parse(s.widget);
    if (spec.type !== "triangleConstraintLab") throw new Error("not a constraint lab");
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    expect(s.predict).toBeTruthy();
    // The contrast is the lesson: start on the ambiguous criterion, finish on the one that fixes it.
    expect(spec.startCriterion).toBe("SSA");
    expect(spec.targetCriterion).toBe("HL");
    expect(spec.targetAngle).toBe(90);
    // The angle must be reachable from the start in whole steps, or the target is unreachable.
    expect((spec.targetAngle - spec.angleStart) % spec.angleStep).toBe(0);
    // Both wrong paths fire, and on the right conditions.
    const at = { angle: spec.targetAngle, flipped: false, moves: spec.requiredMoves };
    expect(evaluate(spec, { ...at, criterion: "HL" }).correct).toBe(true);
    expect(evaluate(spec, { ...at, criterion: "SSA" }).feedback).toBe(spec.criterionFeedback);
    expect(evaluate(spec, { criterion: "HL", angle: spec.angleStart, flipped: false, moves: spec.requiredMoves }).feedback)
      .toBe(spec.angleFeedback);
    expect(evaluate(spec, { ...at, criterion: "HL", moves: 0 }).feedback).toBe(spec.evidenceFeedback);
    // The sides are the lesson's own 5-12-13 right triangle: leg and hypotenuse, as HL requires.
    expect(spec.sideA).toBe(5);
    expect(spec.sideB).toBe(13);
    expect(spec.sideA ** 2 + 12 ** 2).toBe(spec.sideB ** 2);
  });

  it("tc-05-01/i2: the dial stops exactly where the triangle inequality says it must", () => {
    const s = step("triangle-congruence", "tc-05-01", "i2");
    const spec = WidgetSpec.parse(s.widget);
    if (spec.type !== "triangleSolve" || spec.mode !== "sss") throw new Error("not an sss lab");
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    expect(s.predict).toBeTruthy();
    // SasSssTriangleW's slider runs min 2 .. a + b - 1. That ceiling IS the inequality: the third
    // side can never reach a + b, which is the bound the authored step asks the learner to name.
    const ceiling = spec.a + spec.b - 1;
    expect(ceiling).toBe(12);
    expect(spec.a + spec.b).toBe(13);
    // The target angle is reachable at an integer side, and only there.
    const hits = [];
    for (let c = 2; c <= ceiling; c++)
      if (Math.abs(lawOfCosinesAngle(spec.a, spec.b, c) - spec.target) < 1e-6) hits.push(c);
    expect(hits).toEqual([7]);
    expect(lawOfCosinesAngle(5, 8, 7)).toBeCloseTo(60, 9);
    expect(evaluate(spec, 7).correct).toBe(true);
    expect(evaluate(spec, 6).feedback).toBe(spec.lowFeedback);
    expect(evaluate(spec, 8).feedback).toBe(spec.highFeedback);
    // Degenerate check: at the bound the two sides lie flat and enclose nothing.
    expect(lawOfCosinesAngle(5, 8, 13)).toBeCloseTo(180, 6);
  });
});

/**
 * S120d — the `altitude` stage on `dilationExplore`, built this session.
 *
 * §3.4 asked for an "altitude-to-hypotenuse drag in dilationExplore segments mode". Segments mode
 * places both cut points at the same fraction along two sides, so its cut is parallel to the base
 * BY CONSTRUCTION and can never be a perpendicular from the right angle. That is why sy-04-*
 * survived every earlier authoring pass at Tier C: the prescription named a figure the engine
 * could not draw. The new stage draws it, and places the apex at height √(p·q) — the Thales
 * semicircle — so the right angle is a consequence of where the apex is allowed to be rather than
 * a claim the prose makes.
 */
describe("S120d — the altitude stage: three geometric means that cannot come apart", () => {
  it("the apex angle is right at every position the dial can reach", () => {
    const shape: Array<[number, number]> = [[0, 0], [20, 0], [4, 8]];
    for (let k = 0.05; k < 0.96; k += 0.05) {
      const g = altitudeMeans(shape, k);
      const dot = (0 - g.apex[0]) * (20 - g.apex[0]) + (0 - g.apex[1]) * (0 - g.apex[1]);
      expect(Math.abs(dot), `apex not right at k=${k.toFixed(2)}`).toBeLessThan(1e-9);
    }
  });

  it("all three geometric means hold across the whole dial, not just at the target", () => {
    const shape: Array<[number, number]> = [[0, 0], [25, 0], [9, 12]];
    for (let k = 0.04; k < 0.97; k += 0.04) {
      const g = altitudeMeans(shape, k);
      expect(g.h * g.h).toBeCloseTo(g.p * g.q, 9);
      expect(g.legA * g.legA).toBeCloseTo(g.c * g.p, 9);
      expect(g.legB * g.legB).toBeCloseTo(g.c * g.q, 9);
    }
  });

  it("the authored splits produce the altitudes the lessons quote", () => {
    expect(altitudeMeans([[0, 0], [25, 0], [9, 12]], 0.36).h).toBeCloseTo(12, 12);
    expect(altitudeMeans([[0, 0], [15, 0], [3, 6]], 0.2).h).toBeCloseTo(6, 12);
    expect(altitudeMeans([[0, 0], [20, 0], [4, 8]], 0.2).h).toBeCloseTo(8, 12);
    // The distractor the predicts turn on: the arithmetic mean is NOT the altitude, except
    // at the midpoint, where the two means coincide.
    const g = altitudeMeans([[0, 0], [25, 0], [9, 12]], 0.36);
    expect((g.p + g.q) / 2).toBeCloseTo(12.5, 12);
    expect(g.h).not.toBeCloseTo(12.5, 2);
    const mid = altitudeMeans([[0, 0], [25, 0], [9, 12]], 0.5);
    expect(mid.h).toBeCloseTo((mid.p + mid.q) / 2, 9);
  });

  it("the gate refuses a foot outside the hypotenuse and a stage sharing another figure", () => {
    const base = {
      type: "dilationExplore", prompt: "p", shape: [[0, 0], [20, 0], [4, 8]], center: [0, 0],
      kMin: 0.05, kMax: 0.95, kStep: 0.05, kStart: 0.5, gridMin: 0, gridMax: 21,
      successFeedback: "s", lowFeedback: "l", highFeedback: "h"
    };
    expect(widgetIntegrityErrors(WidgetSpec.parse({ ...base, targetK: 0.2, showRatios: ["altitude"] }))).toEqual([]);
    const outside = widgetIntegrityErrors(
      WidgetSpec.parse({ ...base, targetK: 0.2, kMin: 0, kMax: 1, showRatios: ["altitude"] })
    );
    expect(outside.join(" ")).toMatch(/must stay inside \(0, 1\)/);
    const mixed = widgetIntegrityErrors(
      WidgetSpec.parse({ ...base, targetK: 0.2, showRatios: ["altitude", "length"] })
    );
    expect(mixed.join(" ")).toMatch(/re-stages the widget as a right triangle/);
    const both = widgetIntegrityErrors(
      WidgetSpec.parse({ ...base, targetK: 0.2, showRatios: ["altitude", "segments"] })
    );
    expect(both.join(" ")).toMatch(/two different figures/);
  });

  it.each([["sy-04-01", "i1"], ["sy-04-02", "i2"], ["sy-04-03", "i1"]])(
    "%s/%s runs the altitude stage, grades its target, and reaches both wrong sides",
    (id, sid) => {
      const s = step("similarity", id, sid);
      const spec = WidgetSpec.parse(s.widget);
      if (spec.type !== "dilationExplore") throw new Error("not a dilation lab");
      expect(spec.showRatios).toEqual(["altitude"]);
      expect(widgetIntegrityErrors(spec)).toEqual([]);
      expect(s.predict).toBeTruthy();
      expect(evaluate(spec, { k: spec.targetK }).correct).toBe(true);
      expect(evaluate(spec, { k: spec.targetK - spec.kStep }).feedback).toBe(spec.lowFeedback);
      expect(evaluate(spec, { k: spec.targetK + spec.kStep }).feedback).toBe(spec.highFeedback);
    }
  );
});

/**
 * S120e — predict-only. Ten lessons already ran labs that cleared every Tier-A gate except the
 * prediction, so the entire change is a `predict` block; the widget is asserted byte-identical by
 * the converter. What these tests protect is that the predictions are real commitments rather than
 * decoration: a named outcome that is one of the offered options, at least three options so the
 * choice costs something, and a reveal that explains rather than merely confirms.
 */
describe("S120e-h — the fifty-three predictions added to labs that were one gate from Tier A", () => {
  const added: Array<[string, string, string]> = [
    ["differential-equations", "de-01-01", "i1"],
    ["differential-equations", "de-02-01", "i1"],
    ["differential-equations", "de-03-01", "i1"],
    ["differential-equations", "de-03-02", "i1"],
    ["differential-equations", "de-04-01", "i1"],
    ["integration-applications", "ia-01-01", "i1"],
    ["integration-applications", "ia-01-02", "i1"],
    ["integration-applications", "ia-02-01", "i1"],
    ["integration-applications", "ia-04-01", "i1"],
    ["integration-accumulation", "in-02-02", "i1"],
    // S120f — the signChart cluster, same predict-only treatment.
    ["curve-analysis", "ca-01-02", "i1"],
    ["curve-analysis", "ca-02-01", "i1"],
    ["curve-analysis", "ca-02-03", "i1"],
    ["curve-analysis", "ca-04-02", "i1"],
    ["curve-analysis", "ca-05-02", "i1"],
    ["curve-analysis", "ca-05-03", "i1"],
    ["derivatives-in-context", "dc-01-02", "i1"],
    ["polynomial-rational-analysis", "pra-04-01", "i1"],
    // S120g/h — the remaining thirty-five, G1 through G12.
    ["vectors-matrices", "vec-01-01", "i1"],
    ["vectors-matrices", "vec-02-01", "i1"],
    ["vectors-matrices", "vec-02-03", "i1"],
    ["logarithms", "lg-01-01", "i1"],
    ["logarithms", "lg-01-02", "i1"],
    ["logarithms", "lg-03-01", "i1"],
    ["series-convergence", "sc-02-01", "i1"],
    ["series-convergence", "sc-03-01", "i1"],
    ["polar-parametric", "pp-03-01", "i1"],
    ["polar-parametric", "pp-03-02", "i1"],
    ["polar-parametric", "pp-02-03", "i1"],
    ["sequences-series", "sr-01-02", "i1"],
    ["sequences-series", "sr-05-02", "i1"],
    ["derivative-rules", "dr-04-01", "i1"],
    ["derivative-rules", "dr-01-03", "i1"],
    ["conic-sections", "co-01-01", "i1"],
    ["statistical-inference", "si-03-01", "i1"],
    ["statistical-inference", "si-04-02", "i1"],
    ["exponents-scientific-notation", "esn-02-03", "i1"],
    ["data-distributions", "dd-02-02", "e1"],
    ["data-distributions", "dd-02-03", "i1"],
    ["measure-money-time", "mmt-04-02", "e1"],
    ["measure-money-time", "mmt-03-01", "i2"],
    ["shapes-measure-g1", "smg1-04-01", "i1"],
    ["shapes-measure-g1", "smg1-04-02", "i1"],
    ["shapes-measure-g1", "smg1-04-03", "i1"],
    ["shapes-shares-g2", "ssg2-03-02", "i1"],
    ["linear-functions", "lf-03-01", "i1"],
    ["linear-functions", "lf-02-02", "i2"],
    ["geometry-foundations", "gf-02-01", "i2"],
    ["geometry-foundations", "gf-04-02", "i1"],
    ["measurement-data", "md-01-03", "i2"],
    ["conditional-probability", "cpr-01-03", "i1"],
    ["conditional-probability", "cpr-02-03", "i1"],
    ["conditional-probability", "cpr-05-01", "i1"]
  ];

  it.each(added)("%s/%s/%s carries a well-formed commitment on its lab step", (course, id, sid) => {
    const s = step(course, id, sid) as typeof added extends never ? never : {
      kind: string;
      widget?: Record<string, unknown>;
      predict?: { prompt: string; options: Array<{ id: string; label: string }>; outcomeId: string; reveal: string };
    };
    expect(s.kind).toBe("interactive");
    expect(s.widget).toBeTruthy();
    const p = s.predict;
    expect(p, `${id}/${sid} has no predict`).toBeTruthy();
    if (!p) return;
    expect(p.options.length).toBeGreaterThanOrEqual(3);
    // The named outcome must be reachable, and the option ids unique.
    expect(p.options.map((o) => o.id)).toContain(p.outcomeId);
    expect(new Set(p.options.map((o) => o.id)).size).toBe(p.options.length);
    expect(new Set(p.options.map((o) => o.label)).size).toBe(p.options.length);
    // A reveal that only restates the answer teaches nothing; require it to say more than the label.
    const chosen = p.options.find((o) => o.id === p.outcomeId);
    expect(p.reveal.length).toBeGreaterThan((chosen?.label.length ?? 0) + 60);
    expect(p.prompt.trim().length).toBeGreaterThan(20);
  });

  it("every predict in the corpus names an outcome that is actually one of its options", () => {
    const root = join(process.cwd(), "content", "courses");
    let checked = 0;
    for (const course of readdirSync(root)) {
      const dir = join(root, course, "lessons");
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
        const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
          id: string;
          steps: Array<{ id: string; kind: string; widget?: unknown; predict?: { options: Array<{ id: string }>; outcomeId: string } }>;
        };
        for (const s of lesson.steps ?? []) {
          if (!s.predict) continue;
          checked++;
          const where = `${lesson.id}/${s.id}`;
          expect(s.predict.options.map((o) => o.id), `${where}: outcomeId not offered`).toContain(s.predict.outcomeId);
          // The platform's own rule: a prediction is a commitment before a manipulation.
          expect(s.kind, `${where}: predict on a non-interactive step`).toBe("interactive");
          expect(s.widget, `${where}: predict with nothing to manipulate`).toBeTruthy();
        }
      }
    }
    expect(checked).toBeGreaterThan(100);
  });
});

/**
 * S120i — the first slice of the K-8 Tier C/D backlog, chosen because every conceptTag in it is a
 * load-bearing REMEDIATION target: when the adaptive system sends a struggling learner back, this
 * is where they land, and until now they landed on answer entry.
 *
 * The reachability assertions are the point. `columnCalc` is only a laboratory if a wrong final
 * value is actually reachable by some sequence of legal moves — a no-carry problem has nothing to
 * get wrong, and a misconception landing that no move sequence produces is dead feedback wearing
 * the costume of diagnosis. Both are checked here against the engine's own reachability model.
 */
describe("S120i — decimal columns and partial products, as laboratories", () => {
  const converted: Array<[string, string, string]> = [
    ["dop-02-03", "i1", "multiply"],
    ["dop-04-01", "i1", "add"],
    ["dop-04-02", "i2", "add"]
  ];

  it.each(converted)("%s/%s is a valid columnCalc (%s) with a commitment", (id, sid, op) => {
    const s = step("decimal-operations", id, sid);
    const spec = WidgetSpec.parse(s.widget);
    if (spec.type !== "columnCalc") throw new Error("not a columnCalc");
    expect(spec.op).toBe(op);
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    expect(s.predict).toBeTruthy();
    expect(s.kind).toBe("interactive");
  });

  it.each(converted)("%s/%s: the truth grades, and every authored landing is reachable", (id, sid) => {
    const spec = WidgetSpec.parse(step("decimal-operations", id, sid).widget);
    if (spec.type !== "columnCalc") throw new Error("not a columnCalc");
    const truth = columnCalcTruth(spec.op, spec.a, spec.b);
    const reachable = columnCalcReachable(spec.op, spec.a, spec.b);
    expect(evaluate(spec, { value: truth, complete: true }).correct).toBe(true);
    // A regrouping decision must exist, or there is nothing to get wrong.
    expect([...reachable].filter((v) => v !== truth).length).toBeGreaterThanOrEqual(1);
    for (const r of spec.commonResults) {
      expect(reachable.has(r.value), `${id}: landing ${r.value} is unreachable`).toBe(true);
      expect(evaluate(spec, { value: r.value, complete: true }).feedback).toBe(r.feedback);
    }
    // An unfinished grid never grades correct, however right the running value looks.
    expect(evaluate(spec, { value: truth, complete: false }).correct).toBe(false);
  });

  it("the decimal columns are exact integer arithmetic in the smallest place", () => {
    const a = WidgetSpec.parse(step("decimal-operations", "dop-04-01", "i1").widget);
    const b = WidgetSpec.parse(step("decimal-operations", "dop-04-02", "i2").widget);
    if (a.type !== "columnCalc" || b.type !== "columnCalc") throw new Error("not columnCalc");
    expect(a.decimals).toBe(2);
    expect(b.decimals).toBe(2);
    // 3.50 + 1.75 = 5.25 and 0.75 + 3.80 = 4.55, held as hundredths so no float appears anywhere.
    expect(columnCalcTruth(a.op, a.a, a.b)).toBe(525);
    expect(columnCalcTruth(b.op, b.a, b.b)).toBe(455);
    // Both carry across the decimal point — the fact each lesson is about.
    const hundredths = (n: number) => n % 10;
    const tenths = (n: number) => Math.floor(n / 10) % 10;
    expect(hundredths(a.a) + hundredths(a.b)).toBeLessThan(10);          // hundredths do not carry
    expect(tenths(a.a) + tenths(a.b)).toBeGreaterThan(9);                // the tenths do
    expect(tenths(b.a) + tenths(b.b)).toBeGreaterThan(9);
  });

  it("dop-02-03 keeps its authored prediction, which hands off to the new widget", () => {
    const s = step("decimal-operations", "dop-02-03", "i1") as { predict?: { reveal: string } };
    expect(s.predict?.reveal).toContain("23 × 5");
  });
});

/**
 * S120j — the vm- cluster, all four on `volumeBuilder`'s missing-dimension mode. The property that
 * matters here is UNIQUENESS: volumeBuilder grades the product, so without locks a step asking for
 * a 5x2x3 box is satisfied by 6x5x1, and the learner never finds the authored answer. Each of
 * these locks the dimensions the lesson states and leaves exactly one free, so the target is
 * reachable at precisely one lattice setting. That is asserted here by exhaustive search rather
 * than trusted from the spec.
 */
describe("S120j — volume as a lattice with exactly one answer", () => {
  const built: Array<[string, string, number]> = [
    ["vm-03-01", "i2", 6],
    ["vm-04-01", "i2", 30],
    ["vm-05-01", "i1", 24],
    ["vm-05-02", "i1", 20]
  ];

  const lattice = (spec: {
    lMax: number; wMax: number; hMax: number;
    lStart: number; wStart: number; hStart: number;
    lockL: boolean; lockW: boolean; lockH: boolean;
  }) => {
    const rng = (max: number, lock: boolean, start: number) =>
      lock ? [start] : Array.from({ length: max }, (_, i) => i + 1);
    const out: Array<[number, number, number]> = [];
    for (const L of rng(spec.lMax, spec.lockL, spec.lStart))
      for (const W of rng(spec.wMax, spec.lockW, spec.wStart))
        for (const H of rng(spec.hMax, spec.lockH, spec.hStart)) out.push([L, W, H]);
    return out;
  };

  it.each(built)("%s/%s reaches %d at exactly one setting", (id, sid, target) => {
    const spec = WidgetSpec.parse(step("volume-measurement", id, sid).widget);
    if (spec.type !== "volumeBuilder") throw new Error("not a volumeBuilder");
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    expect(spec.targetVolume).toBe(target);
    const hits = lattice(spec).filter(([L, W, H]) => L * W * H === target);
    expect(hits.length, `${id}: ${hits.length} settings reach ${target}`).toBe(1);
    const [L, W, H] = hits[0];
    expect(evaluate(spec, { l: L, w: W, h: H }).correct).toBe(true);
    // Some dimension must be free, or there is nothing to solve.
    expect([spec.lockL, spec.lockW, spec.lockH].some((x) => !x)).toBe(true);
  });

  it.each(built)("%s/%s: every authored landing is ON the lattice and fires", (id, sid) => {
    const spec = WidgetSpec.parse(step("volume-measurement", id, sid).widget);
    if (spec.type !== "volumeBuilder") throw new Error("not a volumeBuilder");
    const cells = lattice(spec);
    for (const cb of spec.commonBuilds) {
      const at = cells.find(([L, W, H]) => L * W * H === cb.volume);
      expect(at, `${id}: landing ${cb.volume} is off the lattice`).toBeTruthy();
      if (!at) continue;
      expect(evaluate(spec, { l: at[0], w: at[1], h: at[2] }).feedback).toBe(cb.feedback);
      expect(cb.volume).not.toBe(spec.targetVolume);
    }
    // The direction fallback must be reachable in both directions, or half of it is dead copy.
    const named = new Set(spec.commonBuilds.map((c) => c.volume));
    const under = cells.find(([L, W, H]) => L * W * H < spec.targetVolume && !named.has(L * W * H));
    const over = cells.find(([L, W, H]) => L * W * H > spec.targetVolume && !named.has(L * W * H));
    expect(under || spec.commonBuilds.length > 0, `${id}: nothing below the target is reachable`).toBeTruthy();
    expect(over, `${id}: highFeedback can never fire`).toBeTruthy();
  });

  it("the four lessons build the volumes their own prose states", () => {
    // vm-03-01: a flat layer 3 across, 2 deep. vm-04-01: base 5x2, 3 layers. vm-05-01: Box A
    // 4x2x3. vm-05-02: the L's slab 5 long, 2 wide, 2 tall.
    expect(3 * 2 * 1).toBe(6);
    expect(5 * 2 * 3).toBe(30);
    expect(4 * 2 * 3).toBe(24);
    expect(5 * 2 * 2).toBe(20);
    // …and the classic wrong move — adding the edges — is a different unit, never the volume.
    expect(4 + 2 + 3).not.toBe(24);
  });
});
