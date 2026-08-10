/**
 * S116 — areaModel.requireFactors.
 *
 * areaModel graded on area ALONE, so every factor pair of the target passed. For a lesson whose
 * subject is WHICH factoring ("rewrite 8 + 12 as (GCF) × (sum)"), that marks 1×20 and 2×10 correct
 * when only 4×5 pulls out the greatest common factor — the engine actively teaching against the
 * lesson. This pins the gate and, equally, pins that the ungated behaviour is unchanged.
 */
import { describe, it, expect } from "vitest";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";
import { evaluate } from "./evaluate";

const base = {
  type: "areaModel" as const,
  prompt: "p",
  targetArea: 20,
  wMax: 12,
  hMax: 12,
  wStart: 1,
  hStart: 1,
  requireFactors: { w: 4, h: 5 },
  factorFeedback: "right area, wrong factoring",
  successFeedback: "ok",
  lowFeedback: "lo",
  highFeedback: "hi"
};
const parse = (o: unknown) => WidgetSpec.parse(o);

describe("areaModel requireFactors", () => {
  it("accepts the named pair in EITHER orientation — a rotated rectangle is the same factoring", () => {
    const s = parse(base);
    expect(evaluate(s, { w: 4, h: 5 }).correct).toBe(true);
    expect(evaluate(s, { w: 5, h: 4 }).correct).toBe(true);
  });

  it("rejects every OTHER factor pair of the same area, with its own diagnosis", () => {
    const s = parse(base);
    for (const [w, h] of [[1, 20], [20, 1], [2, 10], [10, 2]]) {
      const r = evaluate(s, { w, h });
      expect(r.correct, `${w}x${h}`).toBe(false);
      // Not the area-direction feedback: the area is exactly right, so "too small"/"too big"
      // would be a false statement about what the learner did.
      expect(r.feedback, `${w}x${h}`).toBe("right area, wrong factoring");
    }
  });

  it("still reports direction when the AREA itself is wrong", () => {
    const s = parse(base);
    expect(evaluate(s, { w: 3, h: 5 }).feedback).toBe("lo");
    expect(evaluate(s, { w: 6, h: 5 }).feedback).toBe("hi");
  });

  it("leaves ungated areaModel behaviour exactly as it was", () => {
    const { requireFactors: _rf, factorFeedback: _ff, ...ungated } = base;
    const s = parse(ungated);
    for (const [w, h] of [[4, 5], [2, 10], [1, 20]]) {
      expect(evaluate(s, { w, h }).correct, `${w}x${h}`).toBe(true);
    }
  });

  it("integrity rejects factors that do not multiply to the target", () => {
    const errs = widgetIntegrityErrors(parse({ ...base, requireFactors: { w: 3, h: 5 } }));
    expect(errs.some((e) => e.includes("not the target area"))).toBe(true);
  });

  it("integrity requires factorFeedback, so no build can fall through to a false message", () => {
    const errs = widgetIntegrityErrors(parse({ ...base, factorFeedback: undefined }));
    expect(errs.some((e) => e.includes("needs factorFeedback"))).toBe(true);
  });

  it("integrity refuses requireFactors together with square", () => {
    const errs = widgetIntegrityErrors(parse({ ...base, square: true }));
    expect(errs.some((e) => e.includes("mutually exclusive"))).toBe(true);
  });

  it("integrity demands BOTH orientations be reachable, since grading accepts both", () => {
    // 4x5 fits, but the accepted transpose 5x4 needs hMax >= 4 and wMax >= 5.
    const errs = widgetIntegrityErrors(parse({ ...base, wMax: 4, hMax: 5 }));
    expect(errs.some((e) => e.includes("transpose"))).toBe(true);
  });

  it("integrity catches a start build that already has the target area", () => {
    const errs = widgetIntegrityErrors(parse({ ...base, wStart: 4, hStart: 5 }));
    expect(errs.some((e) => e.includes("pre-solved"))).toBe(true);
  });
});
