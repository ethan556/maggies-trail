import { describe, it, expect } from "vitest";
import { DotPlotSpec, dotPlotLabel, widgetIntegrityErrors } from "./schema";
import { evaluate, canCheck, correctAnswerText } from "./evaluate";
import type { TDotPlot } from "./schema";

// The vm-02-01 ribbon plot: 1/4 → XX, 1/2 → XXX, 3/4 → X, 1 → XX (denominator 4).
const ribbons = (over: Partial<TDotPlot> = {}): TDotPlot =>
  DotPlotSpec.parse({
    type: "dotPlot",
    prompt: "How many ribbons measured 1/2 foot?",
    values: [1, 2, 3, 4],
    denominator: 4,
    given: [2, 3, 1, 2],
    target: [2, 3, 1, 2],
    askIndex: 1,
    maxPerValue: 6,
    successFeedback: "ok",
    partialFeedback: "fb",
    ...over
  });

describe("dotPlotLabel: the one shared formatter", () => {
  it("reduces numerators over the denominator", () => {
    expect(dotPlotLabel(1, 4)).toBe("1/4");
    expect(dotPlotLabel(2, 4)).toBe("1/2");
    expect(dotPlotLabel(3, 4)).toBe("3/4");
    expect(dotPlotLabel(4, 4)).toBe("1");
    expect(dotPlotLabel(6, 4)).toBe("3/2");
  });
  it("passes integers through without a denominator", () => {
    expect(dotPlotLabel(5)).toBe("5");
    expect(dotPlotLabel(0, 4)).toBe("0");
  });
});

describe("dotPlot read mode: integrity gate", () => {
  it("accepts the ribbon plot", () => {
    expect(widgetIntegrityErrors(ribbons())).toEqual([]);
  });
  it("build mode (no given) is untouched by the gate", () => {
    const build = ribbons();
    delete (build as Partial<TDotPlot>).given;
    delete (build as Partial<TDotPlot>).askIndex;
    expect(widgetIntegrityErrors(build)).toEqual([]);
  });
  it("rejects askIndex without given, and given without askIndex", () => {
    const a = ribbons(); delete (a as Partial<TDotPlot>).given;
    expect(widgetIntegrityErrors(a).join(" ")).toMatch(/askIndex without/);
    const b = ribbons(); delete (b as Partial<TDotPlot>).askIndex;
    expect(widgetIntegrityErrors(b).join(" ")).toMatch(/askIndex.*required/);
  });
  it("rejects an empty asked stack and a stack-less plot", () => {
    expect(widgetIntegrityErrors(ribbons({ given: [2, 0, 1, 2], target: [2, 0, 1, 2] })).join(" ")).toMatch(/asked stack is empty/);
    expect(widgetIntegrityErrors(ribbons({ given: [0, 3, 0, 0], target: [0, 3, 0, 0] })).join(" ")).toMatch(/no other non-empty stack/);
  });
  it("rejects target ≠ given (two truth arrays)", () => {
    expect(widgetIntegrityErrors(ribbons({ target: [2, 3, 1, 1] })).join(" ")).toMatch(/must equal `given`/);
  });
  it("rejects a stack taller than maxPerValue", () => {
    expect(widgetIntegrityErrors(ribbons({ given: [7, 3, 1, 2], target: [7, 3, 1, 2] })).join(" ")).toMatch(/exceeds maxPerValue/);
  });
});

describe("dotPlot read mode: grading and derived diagnoses", () => {
  it("cannot check with nothing marked; can once one X is marked", () => {
    expect(canCheck(ribbons(), [0, 0, 0, 0])).toBe(false);
    expect(canCheck(ribbons(), [0, 1, 0, 0])).toBe(true);
  });
  it("correct: exactly the asked stack, nothing else", () => {
    const r = evaluate(ribbons(), [0, 3, 0, 0]);
    expect(r.correct).toBe(true);
    expect(r.feedback).toBe("ok");
  });
  it("wrong stack fully counted → names both stacks with reduced labels", () => {
    const r = evaluate(ribbons(), [2, 0, 0, 0]);
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/2 X's above 1\/4/);
    expect(r.feedback).toMatch(/stack above 1\/2/);
  });
  it("whole plot counted → the total-vs-stack diagnosis, with the drawn total", () => {
    const r = evaluate(ribbons(), [2, 3, 1, 2]);
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/every X on the plot — the total, 8/);
  });
  it("half-counted stack → progress-preserving diagnosis with both numbers", () => {
    const r = evaluate(ribbons(), [0, 2, 0, 0]);
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/marked 2 of the 3 X's above 1\/2/);
  });
  it("mixed marking falls to the authored fallback", () => {
    expect(evaluate(ribbons(), [1, 1, 0, 0]).feedback).toBe("fb");
  });
  it("build mode grading is byte-for-byte unchanged", () => {
    const build = ribbons();
    delete (build as Partial<TDotPlot>).given;
    delete (build as Partial<TDotPlot>).askIndex;
    expect(evaluate(build, [2, 3, 1, 2]).correct).toBe(true);
    expect(evaluate(build, [2, 3, 1, 1]).feedback).toBe("fb");
    expect(canCheck(build, null)).toBe(true);
  });
  it("answer text names the count and the reduced label", () => {
    expect(correctAnswerText(ribbons())).toBe("3 — the X's above 1/2");
  });
});
