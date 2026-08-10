/**
 * S119 — `quadraticExplore` roots form: y = a(x − r1)(x − r2).
 *
 * The eight Tier-D `qu-` solving lessons are all about where a parabola MEETS THE AXIS, and vertex
 * form cannot pose them: x² + 5x + 6 has vertex (−2.5, −0.25) and `hMin`/`hMax` are integers. In
 * roots form the two things dragged ARE the two solutions.
 *
 * The case carrying the most weight is ORDER-INSENSITIVITY: (x−2)(x−3) and (x−3)(x−2) are the same
 * parabola, and grading them differently would teach a distinction that does not exist. Every
 * expansion below is computed by hand in the test, never from `rootsFormCoefs`.
 */
import { describe, it, expect } from "vitest";
import { WidgetSpec, widgetIntegrityErrors, rootsFormCoefs, rootsFormDiscriminant, type TWidget } from "./schema";
import { evaluate } from "./evaluate";

const base = {
  type: "quadraticExplore" as const,
  prompt: "p",
  form: "roots" as const,
  targetA: 1,
  targetH: 0,
  targetK: 0,
  targetR1: 3,
  targetR2: -2,
  rMin: -9,
  rMax: 9,
  aMin: -3,
  aMax: 3,
  aStart: 1,
  r1Start: 0,
  r2Start: 0,
  gridMax: 9,
  successFeedback: "ok",
  shapeFeedback: "wrong shape",
  vertexFeedback: "wrong roots"
};
const spec = (o: Record<string, unknown> = {}) => WidgetSpec.parse({ ...base, ...o }) as TWidget;

describe("rootsFormCoefs — expansion checked against hand arithmetic", () => {
  it("(x − 3)(x + 2) = x² − x − 6", () => {
    // by hand: x² + 2x − 3x − 6
    expect(rootsFormCoefs(1, 3, -2)).toEqual({ a: 1, b: -1, c: -6 });
  });
  it("(x + 2)(x + 3) = x² + 5x + 6 — the factoring lesson vertex form cannot reach", () => {
    expect(rootsFormCoefs(1, -2, -3)).toEqual({ a: 1, b: 5, c: 6 });
  });
  it("(x − 3)(x + 3) = x² − 9, the difference of squares", () => {
    expect(rootsFormCoefs(1, 3, -3)).toEqual({ a: 1, b: 0, c: -9 });
  });
  it("a scales every coefficient", () => {
    expect(rootsFormCoefs(2, 3, -2)).toEqual({ a: 2, b: -2, c: -12 });
    expect(rootsFormCoefs(-1, 3, -2)).toEqual({ a: -1, b: 1, c: 6 });
  });
  it("expansion is order-insensitive, as multiplication is", () => {
    expect(rootsFormCoefs(1, 3, -2)).toEqual(rootsFormCoefs(1, -2, 3));
  });
  it("covers each lesson's own equation", () => {
    expect(rootsFormCoefs(1, 5, -8)).toEqual({ a: 1, b: 3, c: -40 }); // qu-04-02/i1
    expect(rootsFormCoefs(1, 5, -9)).toEqual({ a: 1, b: 4, c: -45 }); // qu-04-03/i2
    expect(rootsFormCoefs(1, 2, 3)).toEqual({ a: 1, b: -5, c: 6 }); // qu-03-02/i1
    expect(rootsFormCoefs(1, 4, 3)).toEqual({ a: 1, b: -7, c: 12 }); // qu-02-02/i3
  });
});

describe("rootsFormDiscriminant", () => {
  it("is a²(r1 − r2)², computed independently", () => {
    for (const [a, r1, r2] of [[1, 3, -2], [2, 5, 1], [-1, 4, 4], [1, 0, 7]] as const)
      expect(rootsFormDiscriminant(a, r1, r2)).toBe(a * a * (r1 - r2) * (r1 - r2));
  });
  it("is ZERO exactly when the roots coincide — the repeated-root case", () => {
    expect(rootsFormDiscriminant(1, 2, 2)).toBe(0);
    expect(rootsFormDiscriminant(1, 2, 3)).toBeGreaterThan(0);
    // qu-04-03/i3: x² − 4x + 4 = 0 has one repeated solution
    expect(rootsFormCoefs(1, 2, 2)).toEqual({ a: 1, b: -4, c: 4 });
  });
  it("can NEVER be negative in roots form — which is why 'no real solutions' needs vertex form", () => {
    for (let r1 = -9; r1 <= 9; r1++)
      for (let r2 = -9; r2 <= 9; r2++)
        for (const a of [-3, -1, 1, 3]) expect(rootsFormDiscriminant(a, r1, r2)).toBeGreaterThanOrEqual(0);
  });
});

describe("ORDER — the same parabola must not be graded two ways", () => {
  const s = spec({ targetR1: 3, targetR2: -2 });
  it("accepts the roots in the authored order", () => {
    expect(evaluate(s, { a: 1, r1: 3, r2: -2 }).correct).toBe(true);
  });
  it("accepts them SWAPPED — it is the same parabola", () => {
    expect(evaluate(s, { a: 1, r1: -2, r2: 3 }).correct).toBe(true);
    // and the expansion confirms they are the same curve
    expect(rootsFormCoefs(1, 3, -2)).toEqual(rootsFormCoefs(1, -2, 3));
  });
  it("rejects a wrong root even when one is right", () => {
    expect(evaluate(s, { a: 1, r1: 3, r2: -3 }).correct).toBe(false);
    expect(evaluate(s, { a: 1, r1: 3, r2: -3 }).feedback).toBe("wrong roots");
  });
  it("diagnoses a wrong leading coefficient separately from wrong roots", () => {
    expect(evaluate(s, { a: 2, r1: 3, r2: -2 }).feedback).toBe("wrong shape");
  });
  it("refuses to grade an unset state", () => {
    expect(evaluate(s, null).correct).toBe(false);
    expect(evaluate(s, { a: 1, r1: 3 }).correct).toBe(false);
  });
});

describe("backward compatibility — vertex form is untouched", () => {
  const vertex = {
    type: "quadraticExplore" as const,
    prompt: "p",
    targetA: 1,
    targetH: 2,
    targetK: -3,
    successFeedback: "ok",
    shapeFeedback: "shape",
    vertexFeedback: "vertex"
  };
  it("defaults to vertex form with no roots fields injected", () => {
    const p = WidgetSpec.parse(vertex) as Record<string, unknown>;
    expect(p.form).toBe("vertex");
    expect("targetR1" in p).toBe(false);
  });
  it("still grades on a, h, k", () => {
    const s = WidgetSpec.parse(vertex) as TWidget;
    expect(evaluate(s, { a: 1, h: 2, k: -3 }).correct).toBe(true);
    expect(evaluate(s, { a: 1, h: 2, k: -2 }).correct).toBe(false);
  });
  it("still passes its own integrity gate", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse(vertex) as TWidget)).toEqual([]);
  });
});

describe("integrity gate", () => {
  it("accepts a well-formed roots lab", () => {
    expect(widgetIntegrityErrors(spec())).toEqual([]);
  });
  it("refuses roots form with no roots stated", () => {
    expect(widgetIntegrityErrors(spec({ targetR1: undefined, targetR2: undefined })).join(" ")).toMatch(
      /needs targetR1 and targetR2/
    );
  });
  it("refuses a root outside the draggable range", () => {
    expect(widgetIntegrityErrors(spec({ targetR2: -12 })).join(" ")).toMatch(/outside the draggable range/);
  });
  it("REFUSES a start position that is already the answer", () => {
    expect(widgetIntegrityErrors(spec({ r1Start: 3, r2Start: -2 })).join(" ")).toMatch(/start position IS the answer/);
  });
  it("catches the swapped start too — same set, same problem", () => {
    expect(widgetIntegrityErrors(spec({ r1Start: -2, r2Start: 3 })).join(" ")).toMatch(/start position IS the answer/);
  });
  it("refuses roots fields in vertex form as dead configuration", () => {
    expect(widgetIntegrityErrors(spec({ form: "vertex" })).join(" ")).toMatch(/unreachable in vertex form/);
  });
});
