/**
 * S119 — `functionMachine` second stage: composition and combination.
 *
 * ft-04-01/02/03 are all Tier D and all about two functions joined: (f + g)(3), (f · g)(2),
 * f(g(4)), and the formula for f(g(x)). Every one was a numeric box or an mcq beside a single
 * machine that could not represent a second function at all.
 *
 * The case that matters most is ORDER. f(g(x)) is not g(f(x)), and a lesson whose whole point is
 * that asymmetry cannot be graded by an engine that collapses the two. Every expected value below
 * is computed by hand in the test, never from `fmOutput`.
 */
import { describe, it, expect } from "vitest";
import { WidgetSpec, widgetIntegrityErrors, fmStage, fmOutput, type TWidget } from "./schema";
import { evaluate } from "./evaluate";

const base = {
  type: "functionMachine" as const,
  prompt: "p",
  a: 2,
  b: 0,
  inputMin: 0,
  inputMax: 10,
  inputStep: 1,
  inputStart: 0,
  targetOutput: 11,
  successFeedback: "ok",
  lowFeedback: "low",
  highFeedback: "high"
};
const spec = (o: Record<string, unknown> = {}) => WidgetSpec.parse({ ...base, ...o }) as TWidget;

describe("fmStage — one machine, checked against arithmetic here", () => {
  it("a linear stage is a*x + b", () => {
    expect(fmStage(4, 2, 0, false)).toBe(8);
    expect(fmStage(4, 1, 3, false)).toBe(7);
    expect(fmStage(-2, 3, 1, false)).toBe(-5);
  });
  it("a squaring stage squares the INPUT before scaling", () => {
    expect(fmStage(5, 1, 0, true)).toBe(25);
    expect(fmStage(3, 2, 1, true)).toBe(2 * 9 + 1);
    // not (a*x + b) squared — a different function entirely
    expect(fmStage(3, 2, 1, true)).not.toBe(Math.pow(2 * 3 + 1, 2));
  });
});

describe("ORDER — the asymmetry these lessons exist to teach", () => {
  // ft-04-02/i1: g(x) = 2x, f(x) = x + 3, f(g(4)) = f(8) = 11
  const g = { a: 2, b: 0, square: false };
  const f = { a: 1, b: 3, square: false };

  it("f(g(4)) = 11, computed by hand", () => {
    expect(2 * 4).toBe(8);
    expect(8 + 3).toBe(11);
    expect(fmOutput(4, g.a, g.b, g.square, f, "compose")).toBe(11);
  });

  it("g(f(4)) = 14 — a DIFFERENT number, so the engine cannot be order-blind", () => {
    expect(4 + 3).toBe(7);
    expect(2 * 7).toBe(14);
    expect(fmOutput(4, f.a, f.b, f.square, g, "compose")).toBe(14);
    expect(fmOutput(4, g.a, g.b, g.square, f, "compose")).not.toBe(
      fmOutput(4, f.a, f.b, f.square, g, "compose")
    );
  });

  it("ft-04-02/i2: f(x) = x², g(x) = x − 3, f(g(5)) = 4", () => {
    const gg = { a: 1, b: -3, square: false };
    const ff = { a: 1, b: 0, square: true };
    expect(5 - 3).toBe(2);
    expect(2 * 2).toBe(4);
    expect(fmOutput(5, gg.a, gg.b, gg.square, ff, "compose")).toBe(4);
    // the other order is 22, not 4
    expect(fmOutput(5, ff.a, ff.b, ff.square, gg, "compose")).toBe(25 - 3);
  });
});

describe("COMBINATION — both machines fed the same input", () => {
  // ft-04-01: f(x) = x², g(x) = 2x + 1. (f + g)(3) = 9 + 7 = 16; (f · g)(2) = 4 · 5 = 20.
  const f = { a: 1, b: 0, square: true };
  const g = { a: 2, b: 1, square: false };

  it("(f + g)(3) = 16, by hand", () => {
    expect(3 * 3).toBe(9);
    expect(2 * 3 + 1).toBe(7);
    expect(9 + 7).toBe(16);
    expect(fmOutput(3, f.a, f.b, f.square, g, "add")).toBe(16);
  });

  it("(f · g)(2) = 20, by hand", () => {
    expect(2 * 2).toBe(4);
    expect(2 * 2 + 1).toBe(5);
    expect(4 * 5).toBe(20);
    expect(fmOutput(2, f.a, f.b, f.square, g, "multiply")).toBe(20);
  });

  it("add and multiply are genuinely different wirings of the SAME two machines", () => {
    expect(fmOutput(3, f.a, f.b, f.square, g, "add")).not.toBe(
      fmOutput(3, f.a, f.b, f.square, g, "multiply")
    );
  });

  it("combination is symmetric where composition is not — the contrast is real", () => {
    expect(fmOutput(3, f.a, f.b, f.square, g, "add")).toBe(fmOutput(3, g.a, g.b, g.square, f, "add"));
    expect(fmOutput(3, f.a, f.b, f.square, g, "compose")).not.toBe(
      fmOutput(3, g.a, g.b, g.square, f, "compose")
    );
  });
});

describe("backward compatibility — a single machine is untouched", () => {
  it("a one-stage spec parses with no stage2 or join injected", () => {
    const p = WidgetSpec.parse(base) as Record<string, unknown>;
    expect("stage2" in p).toBe(false);
    expect("join" in p).toBe(false);
    expect(p.square).toBe(false);
  });
  it("grades on a*x + b exactly as before", () => {
    const s = spec({ a: 3, b: 2, targetOutput: 11 });
    expect(evaluate(s, { input: 3 }).correct).toBe(true); // 3*3+2
    expect(evaluate(s, { input: 2 }).correct).toBe(false);
  });
});

describe("grading reads the wiring, not a hardcoded formula", () => {
  const s = spec({ a: 2, b: 0, stage2: { a: 1, b: 3, square: false }, join: "compose", targetOutput: 11 });
  it("accepts the input whose COMPOSED output hits the target", () => {
    expect(evaluate(s, { input: 4 }).correct).toBe(true);
  });
  it("rejects the input that would hit it under the WRONG order", () => {
    // g(f(4)) = 14; the input that gives 11 the other way round is not 4.
    expect(evaluate(s, { input: 5 }).correct).toBe(false);
  });
  it("directions are reported against the composed output", () => {
    expect(evaluate(s, { input: 3 }).feedback).toBe("low"); // 2*3=6, 6+3=9 < 11
    expect(evaluate(s, { input: 6 }).feedback).toBe("high"); // 15 > 11
  });
});

describe("integrity gate", () => {
  it("accepts a well-formed chain", () => {
    expect(widgetIntegrityErrors(spec({ stage2: { a: 1, b: 3, square: false }, join: "compose" }))).toEqual([]);
  });
  it("refuses a second machine with no wiring stated", () => {
    expect(widgetIntegrityErrors(spec({ stage2: { a: 1, b: 3, square: false } })).join(" ")).toMatch(/needs a `join`/);
  });
  it("refuses a join with nothing to join to", () => {
    expect(widgetIntegrityErrors(spec({ join: "add", targetOutput: 0 })).join(" ")).toMatch(/no second machine/);
  });
  it("REFUSES a target no input can produce", () => {
    // 2x over 0..10 is even; 11 is unreachable without a second stage.
    let reachable = false;
    for (let x = 0; x <= 10; x++) if (2 * x === 11) reachable = true;
    expect(reachable).toBe(false);
    expect(widgetIntegrityErrors(spec({ targetOutput: 11 })).join(" ")).toMatch(/no input in/);
  });
});
