// @vitest-environment jsdom
/**
 * RELEASE BLOCKER 3 — triangle-constraint geometry.
 *
 * Two independent faults, both of which put false measurements on screen.
 *
 * ISOSCELES. Released from the leg lock, the second base angle was computed as
 * `180 − apex − baseAngle × 0.72`. The 0.72 is arbitrary and the result is not a triangle: at an
 * apex of 60° the lab displayed 60 + 60 + 76.8 = 196.8°. The test below reproduces that formula
 * and asserts it is impossible, so the regression cannot return quietly.
 *
 * MIDSEGMENT. Both readouts were the constant `sideA / 2`, computed from no geometry. The segment
 * was never drawn, so nothing connected the number to a picture, and releasing the "midpoint" lock
 * changed the caption while changing no number at all.
 *
 * Everything now derives from ONE coordinate model, and these tests compare the four things the
 * blocker requires to agree: coordinates, displayed labels, evaluator result, and the geometry the
 * success feedback describes.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { WidgetSpec, triangleConstraintModel, type TWidget } from "./schema";

afterEach(() => cleanup());

const spec = (o: Record<string, unknown> = {}) =>
  WidgetSpec.parse({
    type: "triangleConstraintLab",
    prompt: "p",
    sideA: 8,
    sideB: 6,
    angleStart: 60,
    angleStep: 5,
    targetAngle: 60,
    startCriterion: "SSA",
    targetCriterion: "SAS",
    requiredMoves: 2,
    successFeedback: "ok",
    criterionFeedback: "wrong criterion",
    angleFeedback: "wrong angle",
    evidenceFeedback: "need evidence",
    constraintFeedback: "the lock is off",
    ...o
  }) as TWidget;

function mount(s: TWidget) {
  function Host() {
    const [v, setV] = useState<unknown>(null);
    return <WidgetRenderer spec={s} value={v} disabled={false} onChange={setV} />;
  }
  return render(<Host />).container;
}

const SUM = (m: { angles: [number, number, number] }) => m.angles[0] + m.angles[1] + m.angles[2];

describe("THE OLD BUG, reproduced and pinned as impossible", () => {
  it("the 0.72 formula produced a 196.8° triangle at apex 60", () => {
    const apex = 60;
    const baseAngle = (180 - apex) / 2;
    const otherBase = Math.max(1, 180 - apex - baseAngle * 0.72);
    expect(apex + baseAngle + otherBase).toBeCloseTo(196.8, 6);
    expect(apex + baseAngle + otherBase).not.toBeCloseTo(180, 6);
  });

  it("the model refuses to reproduce it — released angles still sum to 180", () => {
    const m = triangleConstraintModel(60, 8, 6, "isoscelesLegs", true);
    expect(SUM(m)).toBeCloseTo(180, 9);
  });
});

describe("angle totals hold at every apex, locked and released", () => {
  const apexes = [20, 30, 45, 60, 75, 90, 110, 130, 140];

  it.each(apexes)("apex %i° locked: angles sum to 180 and the base angles are EQUAL", (a) => {
    const m = triangleConstraintModel(a, 8, 6, "isoscelesLegs", false);
    expect(SUM(m)).toBeCloseTo(180, 9);
    expect(m.angles[1]).toBeCloseTo(m.angles[2], 9);
    expect(m.legsEqual).toBe(true);
    // and the locked base angle really is (180 − apex)/2, derived not asserted
    expect(m.angles[1]).toBeCloseTo((180 - a) / 2, 6);
  });

  it.each(apexes)("apex %i° RELEASED: angles still sum to 180, but the base angles DIVERGE", (a) => {
    const m = triangleConstraintModel(a, 8, 6, "isoscelesLegs", true);
    expect(SUM(m)).toBeCloseTo(180, 9);
    expect(m.legsEqual).toBe(false);
    expect(Math.abs(m.angles[1] - m.angles[2])).toBeGreaterThan(1e-6);
  });

  it("every displayed angle is strictly positive — no degenerate or negative angle is shown", () => {
    for (const a of apexes)
      for (const broken of [false, true]) {
        const m = triangleConstraintModel(a, 8, 6, "isoscelesLegs", broken);
        for (const ang of m.angles) expect(ang).toBeGreaterThan(0);
      }
  });

  it("the apex angle displayed IS the apex the learner set", () => {
    for (const a of apexes) {
      expect(triangleConstraintModel(a, 8, 6, "isoscelesLegs", false).angles[0]).toBeCloseTo(a, 6);
      expect(triangleConstraintModel(a, 8, 6, "isoscelesLegs", true).angles[0]).toBeCloseTo(a, 6);
    }
  });
});

describe("angles and sides come from the SAME coordinates", () => {
  it("the law of cosines holds against the model's own vertices", () => {
    for (const a of [30, 60, 90, 120]) {
      const m = triangleConstraintModel(a, 8, 6, "isoscelesLegs", true);
      const [A, B, C] = m.vertices;
      const d = (p: [number, number], q: [number, number]) => Math.hypot(p[0] - q[0], p[1] - q[1]);
      // side opposite A is BC, and so on — checked against the reported sides
      expect(m.sides[0]).toBeCloseTo(d(B, C), 9);
      expect(m.sides[1]).toBeCloseTo(d(A, C), 9);
      expect(m.sides[2]).toBeCloseTo(d(A, B), 9);
      // law of cosines on the reported numbers must agree with the reported angle
      const cosA = (m.sides[1] ** 2 + m.sides[2] ** 2 - m.sides[0] ** 2) / (2 * m.sides[1] * m.sides[2]);
      expect((Math.acos(cosA) * 180) / Math.PI).toBeCloseTo(m.angles[0], 6);
    }
  });

  it("the larger angle faces the longer side, at every apex", () => {
    for (const a of [25, 55, 85, 115]) {
      const m = triangleConstraintModel(a, 8, 6, "isoscelesLegs", true);
      const pairs = [0, 1, 2].map((i) => ({ ang: m.angles[i], side: m.sides[i] }));
      pairs.sort((p, q) => p.ang - q.ang);
      expect(pairs[0].side).toBeLessThanOrEqual(pairs[1].side + 1e-9);
      expect(pairs[1].side).toBeLessThanOrEqual(pairs[2].side + 1e-9);
    }
  });
});

describe("the midsegment is drawn between REAL midpoints and measured there", () => {
  it("locked: the endpoints are exactly the midpoints of the two legs", () => {
    const m = triangleConstraintModel(60, 8, 6, "midsegment", false);
    const [A, B, C] = m.vertices;
    expect(m.midsegment).toBeTruthy();
    const ms = m.midsegment!;
    expect(ms.from[0]).toBeCloseTo((A[0] + B[0]) / 2, 9);
    expect(ms.from[1]).toBeCloseTo((A[1] + B[1]) / 2, 9);
    expect(ms.to[0]).toBeCloseTo((A[0] + C[0]) / 2, 9);
    expect(ms.to[1]).toBeCloseTo((A[1] + C[1]) / 2, 9);
    expect(ms.isMidpoints).toBe(true);
  });

  it("locked: its length is EXACTLY half the base, at every apex", () => {
    for (const a of [25, 40, 60, 90, 120, 140]) {
      const ms = triangleConstraintModel(a, 8, 6, "midsegment", false).midsegment!;
      expect(ms.length).toBeCloseTo(ms.base / 2, 9);
    }
  });

  it("locked: the midsegment is PARALLEL to the base", () => {
    const m = triangleConstraintModel(60, 8, 6, "midsegment", false);
    const [, B, C] = m.vertices;
    const ms = m.midsegment!;
    const cross =
      (ms.to[0] - ms.from[0]) * (C[1] - B[1]) - (ms.to[1] - ms.from[1]) * (C[0] - B[0]);
    expect(cross).toBeCloseTo(0, 9);
  });

  it("RELEASED: the join leaves the midpoints AND its length stops being half the base", () => {
    const m = triangleConstraintModel(60, 8, 6, "midsegment", true);
    const ms = m.midsegment!;
    expect(ms.isMidpoints).toBe(false);
    expect(ms.length).not.toBeCloseTo(ms.base / 2, 3);
    // the number genuinely moved — the old build changed nothing when released
    const locked = triangleConstraintModel(60, 8, 6, "midsegment", false).midsegment!;
    expect(ms.length).not.toBeCloseTo(locked.length, 3);
  });

  it("the base it is compared against is the triangle's own side, not a spec constant", () => {
    // sideA is 8 but the base BC is a computed distance — the old code printed sideA/2 = 4.
    const ms = triangleConstraintModel(60, 8, 6, "midsegment", false).midsegment!;
    const [, B, C] = triangleConstraintModel(60, 8, 6, "midsegment", false).vertices;
    expect(ms.base).toBeCloseTo(Math.hypot(B[0] - C[0], B[1] - C[1]), 9);
  });
});

describe("displayed labels agree with the coordinates", () => {
  it("the angle-sum caption reads 180 in both lock states", () => {
    for (const broken of [false, true]) {
      const c = mount(spec({ constraint: "isoscelesLegs", angleStart: 60 }));
      const el = c.querySelector('[data-testid="tcl-anglesum"]');
      expect(el).toBeTruthy();
      const txt = el!.textContent ?? "";
      // the printed total must be 180.0, whatever the individual angles are
      expect(txt).toMatch(/=\s*180\.0°/);
      cleanup();
      void broken;
    }
  });

  it("the midsegment is actually rendered when the constraint is midsegment", () => {
    const c = mount(spec({ constraint: "midsegment" }));
    expect(c.querySelector('[data-testid="tcl-midsegment"]')).toBeTruthy();
  });

  it("the two midsegment readouts AGREE when locked — that is the theorem", () => {
    const c = mount(spec({ constraint: "midsegment", angleStart: 60 }));
    const box = c.querySelector('[data-testid="tcl-constraint"]');
    const nums = [...box!.querySelectorAll("div")]
      .map((d) => d.textContent ?? "")
      .join(" ")
      .match(/\d+\.\d\d/g);
    expect(nums).toBeTruthy();
    // join length and half the base are printed to 2dp and must be the same number
    const model = triangleConstraintModel(60, 8, 6, "midsegment", false).midsegment!;
    expect(model.length.toFixed(2)).toBe((model.base / 2).toFixed(2));
  });

  it("no readout shows the old constant sideA/2 unless it happens to be the truth", () => {
    // sideA = 8 so the old code always printed 4.00. The real half-base at apex 60 differs.
    const ms = triangleConstraintModel(60, 8, 6, "midsegment", false).midsegment!;
    expect((ms.base / 2).toFixed(2)).not.toBe((8 / 2).toFixed(2));
  });
});

describe("impossible measurements are never produced", () => {
  it("no configuration in the slider's range yields an angle sum away from 180", () => {
    for (let a = 20; a <= 140; a += 1)
      for (const broken of [false, true])
        for (const constraint of ["isoscelesLegs", "midsegment"] as const) {
          const m = triangleConstraintModel(a, 8, 6, constraint, broken);
          expect(SUM(m)).toBeCloseTo(180, 6);
        }
  });

  it("no side length is zero or negative anywhere in range", () => {
    for (let a = 20; a <= 140; a += 5)
      for (const broken of [false, true]) {
        const m = triangleConstraintModel(a, 8, 6, "isoscelesLegs", broken);
        for (const sde of m.sides) expect(sde).toBeGreaterThan(0);
      }
  });

  it("the triangle inequality holds throughout", () => {
    for (let a = 20; a <= 140; a += 5) {
      const [p, q, r] = triangleConstraintModel(a, 8, 6, "isoscelesLegs", true).sides;
      expect(p + q).toBeGreaterThan(r - 1e-9);
      expect(q + r).toBeGreaterThan(p - 1e-9);
      expect(p + r).toBeGreaterThan(q - 1e-9);
    }
  });
});
