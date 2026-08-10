import { describe, it, expect } from "vitest";
import {
  RotationLabSpec,
  rotationLabImage,
  rotationLabMapsOntoSelf,
  widgetIntegrityErrors
} from "@/lib/schema";

/**
 * S204C — rotationLab's mathematics, tested directly rather than through a lesson.
 *
 * The engine exists because nothing in the corpus could turn anything (transformExplore does
 * translation and reflection only; dilationExplore scales). Its two claims are therefore worth
 * pinning independently of any content that happens to use them: the coordinate rules must be
 * EXACT at the quarter turns, and "smallest self-mapping turn" must actually mean smallest.
 */

const base = {
  type: "rotationLab" as const,
  prompt: "p",
  successFeedback: "s",
  lowFeedback: "l",
  highFeedback: "h"
};

describe("rotationLab — coordinate rules are computed, not recalled", () => {
  it("reproduces the three quarter-turn rules exactly, with no floating-point dust", () => {
    // 90: (x, y) -> (-y, x) · 180: (x, y) -> (-x, -y) · 270: (x, y) -> (y, -x)
    expect(rotationLabImage([3, 5], [0, 0], 90)).toEqual([-5, 3]);
    expect(rotationLabImage([3, 5], [0, 0], 180)).toEqual([-3, -5]);
    expect(rotationLabImage([3, 5], [0, 0], 270)).toEqual([5, -3]);
    expect(rotationLabImage([5, 2], [0, 0], 90)).toEqual([-2, 5]);
  });

  it("composes: two quarter turns are one half turn", () => {
    const once = rotationLabImage([5, 2], [0, 0], 90);
    const twice = rotationLabImage([once[0], once[1]], [0, 0], 90);
    expect(twice).toEqual(rotationLabImage([5, 2], [0, 0], 180));
  });

  it("turns about a centre that is not the origin", () => {
    // (4, 2) a half turn about (3, 2) lands on (2, 2) — the centre's other side, same distance.
    expect(rotationLabImage([4, 2], [3, 2], 180)).toEqual([2, 2]);
  });

  it("a full turn is the identity", () => {
    expect(rotationLabImage([-7, 4], [1, 1], 360)).toEqual([-7, 4]);
  });
});

describe("rotationLab — symmetry means SMALLEST, and the gate enforces it", () => {
  const square: Array<[number, number]> = [
    [2, 2],
    [-2, 2],
    [-2, -2],
    [2, -2]
  ];
  const parallelogram: Array<[number, number]> = [
    [-3, -1],
    [1, -1],
    [3, 1],
    [-1, 1]
  ];

  it("recognises which turns map a square onto itself", () => {
    expect(rotationLabMapsOntoSelf(square, [0, 0], 90)).toBe(true);
    expect(rotationLabMapsOntoSelf(square, [0, 0], 180)).toBe(true);
    expect(rotationLabMapsOntoSelf(square, [0, 0], 45)).toBe(false);
  });

  it("a non-special parallelogram turns onto itself ONLY at a half turn", () => {
    expect(rotationLabMapsOntoSelf(parallelogram, [0, 0], 180)).toBe(true);
    expect(rotationLabMapsOntoSelf(parallelogram, [0, 0], 90)).toBe(false);
  });

  it("REJECTS a target that is not the smallest self-mapping turn", () => {
    // 180 does map the square onto itself — but 90 already did, so 180 is a wrong answer.
    const errs = widgetIntegrityErrors({
      ...base,
      mode: "symmetryOrder",
      shape: square,
      centre: [0, 0] as [number, number],
      targetAngle: 180,
      angleStart: 0,
      angleStep: 90,
      gridMax: 6,
      commonTurns: []
    });
    expect(errs.some((e) => e.includes("not the SMALLEST"))).toBe(true);
  });

  it("REJECTS a target that does not map the shape onto itself at all", () => {
    // The failure that actually fired while authoring gf-04-03: an "octagon" with integer
    // vertices is not regular, so 45 degrees does not land it on itself.
    const fakeOctagon: Array<[number, number]> = [
      [4, 0],
      [3, 3],
      [0, 4],
      [-3, 3],
      [-4, 0],
      [-3, -3],
      [0, -4],
      [3, -3]
    ];
    const errs = widgetIntegrityErrors({
      ...base,
      mode: "symmetryOrder",
      shape: fakeOctagon,
      centre: [0, 0] as [number, number],
      targetAngle: 45,
      angleStart: 0,
      angleStep: 15,
      gridMax: 6,
      commonTurns: []
    });
    expect(errs.some((e) => e.includes("does not land it on itself"))).toBe(true);
  });
});

describe("rotationLab — reachability and mode hygiene", () => {
  it("REJECTS a target off the step lattice", () => {
    const errs = widgetIntegrityErrors({
      ...base,
      mode: "coordinateRule",
      point: [3, 5] as [number, number],
      centre: [0, 0] as [number, number],
      targetAngle: 90,
      angleStart: 0,
      angleStep: 60,
      gridMax: 8,
      commonTurns: []
    });
    expect(errs.some((e) => e.includes("not reachable"))).toBe(true);
  });

  it("REJECTS a non-quarter turn in coordinateRule — only those have integer rules", () => {
    const errs = widgetIntegrityErrors({
      ...base,
      mode: "coordinateRule",
      point: [3, 5] as [number, number],
      centre: [0, 0] as [number, number],
      targetAngle: 45,
      angleStart: 0,
      angleStep: 15,
      gridMax: 8,
      commonTurns: []
    });
    expect(errs.some((e) => e.includes("not a quarter turn"))).toBe(true);
  });

  it("REJECTS a wrong-path landing that collides with the answer", () => {
    const errs = widgetIntegrityErrors({
      ...base,
      mode: "coordinateRule",
      point: [3, 5] as [number, number],
      centre: [0, 0] as [number, number],
      targetAngle: 90,
      angleStart: 0,
      angleStep: 90,
      gridMax: 8,
      commonTurns: [{ angle: 90, feedback: "collides" }]
    });
    expect(errs.some((e) => e.includes("collides with targetAngle"))).toBe(true);
  });

  it("REJECTS an image that falls off the rendered grid", () => {
    const errs = widgetIntegrityErrors({
      ...base,
      mode: "coordinateRule",
      point: [7, 2] as [number, number],
      centre: [0, 0] as [number, number],
      targetAngle: 90,
      angleStart: 0,
      angleStep: 90,
      gridMax: 4,
      commonTurns: []
    });
    expect(errs.some((e) => e.includes("outside gridMax"))).toBe(true);
  });

  it("REJECTS mode/field mismatches in both directions", () => {
    const shapeInRuleMode = widgetIntegrityErrors({
      ...base,
      mode: "coordinateRule",
      point: [1, 1] as [number, number],
      shape: [
        [1, 1],
        [2, 1],
        [1, 2]
      ] as Array<[number, number]>,
      centre: [0, 0] as [number, number],
      targetAngle: 90,
      angleStart: 0,
      angleStep: 90,
      gridMax: 8,
      commonTurns: []
    });
    expect(shapeInRuleMode.some((e) => e.includes("shape belongs to symmetryOrder"))).toBe(true);
  });

  it("accepts the two shipped samples", () => {
    for (const spec of [
      {
        ...base,
        mode: "coordinateRule" as const,
        point: [3, 5] as [number, number],
        centre: [0, 0] as [number, number],
        targetAngle: 180,
        angleStart: 0,
        angleStep: 90,
        gridMax: 8,
        commonTurns: [{ angle: 90, feedback: "quarter turn" }]
      },
      {
        ...base,
        mode: "symmetryOrder" as const,
        shape: [
          [2, 2],
          [-2, 2],
          [-2, -2],
          [2, -2]
        ] as Array<[number, number]>,
        centre: [0, 0] as [number, number],
        targetAngle: 90,
        angleStart: 0,
        angleStep: 15,
        gridMax: 6,
        commonTurns: [{ angle: 180, feedback: "not smallest" }]
      }
    ]) {
      expect(RotationLabSpec.safeParse(spec).success).toBe(true);
      expect(widgetIntegrityErrors(spec)).toEqual([]);
    }
  });
});
