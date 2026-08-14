/**
 * S117 — the conversion batch's contracts, pinned against REAL ARITHMETIC rather than against the
 * implementations that produced them. Each block asserts the mathematical claim the authored
 * feedback makes, so a future edit that breaks the claim fails here rather than shipping a lesson
 * that says something false.
 *
 * The tg-02-03 block is the important one. S115 built that lab and WITHDREW it, because converting
 * the lesson's only notation-entry step dropped formalization below the acceptance bar. S117
 * resolved that by moving the authored numeric widget verbatim onto a new step AFTER the lab. The
 * ordering — manipulation, then notation — is the contract; a future edit that reorders the steps
 * or converts i1b back would silently undo the fix, so it is asserted directly.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  WidgetSpec,
  widgetIntegrityErrors,
  extraneousCandidates,
  extraneousHolds,
  ucGhostPoint,
  quadName
} from "./schema";
// signChartSigns is owned by evaluate.ts (schema.ts cannot import from it without a cycle).
import { signChartSigns } from "./evaluate";

const lesson = (course: string, id: string) =>
  JSON.parse(readFileSync(join(process.cwd(), "content", "courses", course, "lessons", `${id}.json`), "utf8")) as {
    steps: Array<{ id: string; kind: string; widget?: { type: string } & Record<string, unknown>; predict?: unknown }>;
  };
const step = (course: string, id: string, sid: string) => {
  const s = lesson(course, id).steps.find((x) => x.id === sid);
  if (!s) throw new Error(`${id}/${sid} not found`);
  return s;
};

describe("S117 — every converted step parses and passes its own integrity gate", () => {
  const converted: Array<[string, string, string, string]> = [
    ["radical-functions", "re-04-01", "i1", "extraneousRootLab"],
    ["coordinate-proofs", "cx-03-02", "i1", "quadDrag"],
    ["rational-functions", "rf-02-01", "i1", "signChart"],
    ["trig-graphs-inverses", "tg-02-03", "i1", "unitCircleExplore"],
    ["constructions-and-proof", "cp-01-02", "i1b", "compassConstruct"],
    ["constructions-and-proof", "cp-03-02", "i1b", "compassConstruct"],
    ["constructions-and-proof", "cp-03-03", "i1b", "compassConstruct"],
    ["solid-geometry", "sg-04-01", "i1b", "solidSliceLab"],
    ["rational-functions", "rf-02-02", "i1b", "signChart"]
  ];

  it.each(converted)("%s/%s/%s is a valid %s with a prediction", (course, id, sid, type) => {
    const s = step(course, id, sid);
    expect(s.widget?.type).toBe(type);
    const spec = WidgetSpec.parse(s.widget);
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    // S241 WS-E Phase 4: re-04-01/i1's gate was REMOVED by the ruled thinning policy (see
    // PREDICTION_GATE_ADJUDICATION.csv) — the converted widget itself stays and must remain
    // valid (asserted above); only the commit-first gate is gone for this one step.
    if (!(id === "re-04-01" && sid === "i1")) {
      expect(s.predict, `${id}/${sid} must commit before it manipulates`).toBeTruthy();
    } else {
      expect(s.predict, `${id}/${sid} removed gate must stay removed`).toBeUndefined();
    }
  });
});

describe("S117 — re-04-01: √(x + 6) = x, and which candidate survives", () => {
  const radical = { c: 6, scale: 1 };
  const line = { m: 1, b: 0 };

  it("squaring yields exactly −2 and 3 (x² = x + 6 factors as (x − 3)(x + 2))", () => {
    expect(extraneousCandidates(radical, line).candidates).toEqual([-2, 3]);
  });

  it("only 3 satisfies the ORIGINAL equation — checked by substitution, not by the quadratic", () => {
    expect(extraneousHolds(radical, line, 3)).toBe(true);
    expect(extraneousHolds(radical, line, -2)).toBe(false);
    // The reason, stated arithmetically: at −2 the radical is +2 and the line is −2.
    expect(Math.sqrt(-2 + 6)).toBe(2);
    expect(1 * -2 + 0).toBe(-2);
  });

  it("the authored trueRoot/phantomRoot match that derivation", () => {
    const w = step("radical-functions", "re-04-01", "i1").widget as unknown as { trueRoot: number; phantomRoot: number };
    expect(w.trueRoot).toBe(3);
    expect(w.phantomRoot).toBe(-2);
  });
});

describe("S117 — cx-03-02: four equal sides do NOT make a square", () => {
  const pts: Array<[number, number]> = [
    [0, 0],
    [5, 0],
    [8, 4],
    [3, 4]
  ];

  it("all four sides measure exactly 5", () => {
    for (let i = 0; i < 4; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % 4];
      expect(Math.hypot(bx - ax, by - ay)).toBeCloseTo(5, 12);
    }
  });

  it("the live classifier says rhombus, not square — the lesson's whole verdict", () => {
    expect(quadName(pts)).toBe("a rhombus");
  });

  it("the diagonals are unequal (√80 vs √20), which is WHY it is not a square", () => {
    expect(Math.hypot(8 - 0, 4 - 0) ** 2).toBeCloseTo(80, 9);
    expect(Math.hypot(3 - 5, 4 - 0) ** 2).toBeCloseTo(20, 9);
  });

  it("the authored target is the reachable rhombus vertex", () => {
    const w = step("coordinate-proofs", "cx-03-02", "i1").widget as unknown as {
      targetX: number;
      targetY: number;
      targetName: string;
    };
    expect([w.targetX, w.targetY]).toEqual([3, 4]);
    expect(w.targetName).toBe("a rhombus");
  });
});

describe("S117 — rf-02-01 and rf-02-02: restrictions survive the operation", () => {
  it("rf-02-01: (x+5)/x · x/(x+1) charts as root −5, pole −1, hole 0 — signs match the real function", () => {
    const w = step("rational-functions", "rf-02-01", "i1").widget as unknown as {
      roots: Array<{ x: number; mult: number }>;
      poles: Array<{ x: number; mult: number }>;
      holes: number[];
      leadingPositive: boolean;
    };
    expect(w.holes).toEqual([0]);
    const f = (x: number) => (x + 5) / (x + 1);
    const truth = signChartSigns(w.roots, w.leadingPositive, w.poles);
    expect(truth).toEqual(["+", "-", "+"]);
    expect(Math.sign(f(-6))).toBe(1);
    expect(Math.sign(f(-2))).toBe(-1);
    expect(Math.sign(f(1))).toBe(1);
  });

  it("rf-02-01: the hole is where a cancelled factor was, and the reduced value there is 5 — not zero", () => {
    expect((0 + 5) / (0 + 1)).toBe(5);
  });

  it("rf-02-02: the quotient is 2(x+2)/(x−1), and the ban at x = 1 came from the DIVISOR", () => {
    const w = step("rational-functions", "rf-02-02", "i1b").widget as unknown as {
      roots: Array<{ x: number; mult: number }>;
      poles: Array<{ x: number; mult: number }>;
      leadingPositive: boolean;
    };
    expect(w.poles.map((p) => p.x)).toEqual([1]);
    const g = (x: number) => (2 * (x + 2)) / (x - 1);
    expect(signChartSigns(w.roots, w.leadingPositive, w.poles)).toEqual(["+", "-", "+"]);
    expect(Math.sign(g(-3))).toBe(1);
    expect(Math.sign(g(0))).toBe(-1);
    expect(Math.sign(g(2))).toBe(1);
    // The original numerator, (x + 2)/5, is perfectly defined at x = 1: the restriction is the
    // divisor's alone, which is the lesson's claim.
    expect((1 + 2) / 5).toBe(0.6);
  });
});

describe("S117 — tg-02-03: the half-period slide is the ANTIPODE, and notation follows manipulation", () => {
  it("ghost sum·180 coincides with the direct point at every angle — both coordinates flip", () => {
    for (let th = 0; th < 360; th += 7) {
      const { direct, ghost } = ucGhostPoint(th, "sum", "exact", 180);
      expect(Math.hypot(direct[0] - ghost[0], direct[1] - ghost[1])).toBeLessThan(1e-9);
      // And it really is the antipode of θ, not a reflection of it.
      expect(ghost[0]).toBeCloseTo(-Math.cos((th * Math.PI) / 180), 12);
      expect(ghost[1]).toBeCloseTo(-Math.sin((th * Math.PI) / 180), 12);
    }
  });

  it("the linearity impostor detaches everywhere — coordinates do not add under a rotation", () => {
    let maxGap = 0;
    for (let th = 0; th < 360; th += 7) {
      const { direct, ghost } = ucGhostPoint(th, "sum", "linearity", 180);
      maxGap = Math.max(maxGap, Math.hypot(direct[0] - ghost[0], direct[1] - ghost[1]));
    }
    expect(maxGap).toBeGreaterThan(1e-6);
  });

  it("`negate` would have been the WRONG identity here — it flips only sine", () => {
    const { ghost } = ucGhostPoint(50, "negate", "exact", 0);
    expect(ghost[0]).toBeCloseTo(Math.cos((50 * Math.PI) / 180), 12); // cosine unchanged
    expect(ghost[1]).toBeCloseTo(-Math.sin((50 * Math.PI) / 180), 12);
  });

  it("the target angle lands the direct point on 3π/2, the value the next step formalizes", () => {
    const w = step("trig-graphs-inverses", "tg-02-03", "i1").widget as unknown as { targetAngle: number; ghostAngle: number };
    expect(w.targetAngle + w.ghostAngle).toBe(270);
    expect(Math.sin((270 * Math.PI) / 180)).toBeCloseTo(-1, 12);
  });

  it("ORDERING CONTRACT: the notation entry follows the lab, and keeps its authored answer", () => {
    const steps = lesson("trig-graphs-inverses", "tg-02-03").steps;
    const iLab = steps.findIndex((s) => s.id === "i1");
    const iNum = steps.findIndex((s) => s.id === "i1b");
    expect(iLab).toBeGreaterThanOrEqual(0);
    expect(iNum).toBe(iLab + 1);
    expect(steps[iLab].widget?.type).toBe("unitCircleExplore");
    const num = steps[iNum].widget as unknown as { type: string; answer: number };
    expect(num.type).toBe("numeric");
    expect(num.answer).toBe(-1); // sin(3π/2) = −1 = −sin(π/2)
  });
});

describe("S117 — sg-04-01: the sphere's section reaches πr² at exactly one height", () => {
  // Mirrors solidSectionArea's sphere branch, re-derived here rather than imported, so a change
  // to the renderer's formula fails this test instead of silently agreeing with itself.
  const sectionArea = (r: number, f: number) => {
    const y = -r + 2 * r * f;
    return Math.PI * Math.max(0, r * r - y * y);
  };

  it("at the equator the section equals the authored comparison area, and is strictly smaller elsewhere", () => {
    const w = step("solid-geometry", "sg-04-01", "i1b").widget as unknown as {
      radius: number;
      baseArea: number;
      targetFraction: number;
      fractionStep: number;
      tolerance: number;
    };
    expect(sectionArea(w.radius, w.targetFraction)).toBeCloseTo(w.baseArea, 6);
    expect(w.baseArea).toBeCloseTo(Math.PI * w.radius * w.radius, 6);
    for (let f = 0; f <= 1.0001; f += w.fractionStep) {
      if (Math.abs(f - w.targetFraction) < 1e-9) continue;
      expect(sectionArea(w.radius, f)).toBeLessThan(w.baseArea - 1e-6);
    }
  });

  it("the target sits exactly on the slider lattice, and the tolerance admits no neighbour", () => {
    const w = step("solid-geometry", "sg-04-01", "i1b").widget as unknown as {
      targetFraction: number;
      fractionStep: number;
      tolerance: number;
    };
    expect(Math.abs(w.targetFraction / w.fractionStep - Math.round(w.targetFraction / w.fractionStep))).toBeLessThan(1e-9);
    expect(w.tolerance).toBeLessThan(w.fractionStep);
  });
});

describe("S117 — the cp- lab steps were ADDED, never substituted", () => {
  it.each([
    ["cp-01-02", "steppedReveal"],
    ["cp-03-02", "steppedReveal"],
    ["cp-03-03", "mcq"]
  ])("%s keeps its authored i1 (%s) and gains i1b immediately after", (id, i1Type) => {
    const steps = lesson("constructions-and-proof", id).steps;
    const a = steps.findIndex((s) => s.id === "i1");
    const b = steps.findIndex((s) => s.id === "i1b");
    expect(steps[a].widget?.type).toBe(i1Type);
    expect(b).toBe(a + 1);
    expect(steps[b].widget?.type).toBe("compassConstruct");
  });

  it("each construction's target is the smallest whole radius that clears half the span", () => {
    for (const id of ["cp-01-02", "cp-03-02", "cp-03-03"]) {
      const w = step("constructions-and-proof", id, "i1b").widget as unknown as { span: number; target: number };
      expect(w.target).toBe(Math.floor(w.span / 2) + 1);
      expect(2 * w.target).toBeGreaterThan(w.span); // the arcs actually reach each other
      expect(2 * (w.target - 1)).toBeLessThanOrEqual(w.span); // and one less does not
    }
  });
});
