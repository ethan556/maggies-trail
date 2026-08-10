import { describe, expect, it } from "vitest";
import { evaluate, canCheck, correctAnswerText } from "./evaluate";
import { ColumnCalcSpec, columnCalcReachable, columnCalcTruth, widgetIntegrityErrors } from "./schema";

/** s52 — columnCalc, the standard-algorithms laboratory. The engine computes only what the
 * learner's moves compute: strand a waiting carry and 35 × 4 assembles as 120 on screen; resolve
 * an underflow column without borrowing and 52 − 27 assembles as 35. The move-space is finite, so
 * `columnCalcReachable` enumerates every final value any move sequence can produce, and the
 * integrity gate uses it to refuse dead feedback and no-decision problems. Every trap below is an
 * AUTHORED misconception from the curriculum, verified reachable mechanically before conversion. */

const parse = (o: object) => ColumnCalcSpec.parse(o);
const mul35x4 = parse({
  type: "columnCalc", op: "multiply", a: 35, b: 4,
  prompt: "Work out 35 × 4.",
  commonResults: [{ value: 120, feedback: "the waiting carry never joined the tens" }],
  fallbackFeedback: "column by column", successFeedback: "140"
});

describe("columnCalc truth", () => {
  it("derives the true value per op", () => {
    expect(columnCalcTruth("add", 24681, 13247)).toBe(37928);
    expect(columnCalcTruth("subtract", 52, 27)).toBe(25);
    expect(columnCalcTruth("multiply", 35, 4)).toBe(140);
  });
});

describe("columnCalc reachability — the authored trap corpus, mechanically", () => {
  it("multiply: stranding the ones carry lands the authored 120 (dop-02-02/k3)", () => {
    const r = columnCalcReachable("multiply", 35, 4);
    expect(r.has(140)).toBe(true);
    expect(r.has(120)).toBe(true);
  });

  it("subtract: small-from-large lands the authored 35 (pv-03-03/k2)", () => {
    const r = columnCalcReachable("subtract", 52, 27);
    expect([...r].sort((a, b) => a - b)).toEqual([25, 35]);
  });

  it("add: stranding a carry lands the authored 37828 (pv2-04-01/k1)", () => {
    const r = columnCalcReachable("add", 24681, 13247);
    expect(r.has(37928)).toBe(true);
    expect(r.has(37828)).toBe(true);
  });

  it("subtract with a borrow-chain across zeros: buggy path lands 587253 (pv2-04-03/k2)", () => {
    const r = columnCalcReachable("subtract", 500203, 87456);
    expect(r.has(412747)).toBe(true); // truth, via the learner-enacted chain 0→9, 0→9
    expect(r.has(587253)).toBe(true); // small-from-large in every underflow column
  });

  it("subtract: BOTH authored traps of the pv2-04-03 challenge are reachable", () => {
    const r = columnCalcReachable("subtract", 600004, 235478);
    expect(r.has(364526)).toBe(true); // truth
    expect(r.has(435474)).toBe(true); // full small-from-large
    expect(r.has(365474)).toBe(true); // borrowed early, went buggy later
  });

  it("a no-carry, no-borrow problem has exactly one reachable final", () => {
    expect(columnCalcReachable("add", 21, 34).size).toBe(1);
    expect(columnCalcReachable("subtract", 87, 45).size).toBe(1);
  });
});

describe("columnCalc integrity gate", () => {
  it("accepts a live spec with reachable traps", () => {
    expect(widgetIntegrityErrors(mul35x4)).toEqual([]);
  });

  it("REFUSES a no-decision problem — the engine is for regrouping", () => {
    const flat = parse({ ...mul35x4, op: "add", a: 21, b: 34, commonResults: [] });
    expect(widgetIntegrityErrors(flat).join(" ")).toContain("no regrouping decision");
  });

  it("REFUSES a trap equal to the truth and a trap no move sequence can produce", () => {
    const eqTruth = parse({ ...mul35x4, commonResults: [{ value: 140, feedback: "x" }] });
    expect(widgetIntegrityErrors(eqTruth).join(" ")).toContain("success slot");
    const dead = parse({ ...mul35x4, commonResults: [{ value: 3015, feedback: "wrote both digits" }] });
    expect(widgetIntegrityErrors(dead).join(" ")).toContain("unreachable");
  });

  it("REFUSES a two-digit multiplier and a negative subtraction", () => {
    const twoRow = parse({ ...mul35x4, b: 12 });
    expect(widgetIntegrityErrors(twoRow).join(" ")).toContain("single digit");
    const neg = parse({ ...mul35x4, op: "subtract", a: 27, b: 52 });
    expect(widgetIntegrityErrors(neg).join(" ")).toContain("negative");
  });
});

describe("columnCalc grading", () => {
  it("gates checking on completeness", () => {
    expect(canCheck(mul35x4, { value: null, complete: false })).toBe(false);
    expect(evaluate(mul35x4, { value: null, complete: false }).feedback).toContain("Resolve every column");
    expect(canCheck(mul35x4, { value: 120, complete: true })).toBe(true);
  });

  it("success, per-value diagnosis, and fallback", () => {
    expect(evaluate(mul35x4, { value: 140, complete: true }).correct).toBe(true);
    const trap = evaluate(mul35x4, { value: 120, complete: true });
    expect(trap.correct).toBe(false);
    expect(trap.feedback).toBe("the waiting carry never joined the tens");
    expect(evaluate(mul35x4, { value: 40, complete: true }).feedback).toBe("column by column");
  });

  it("correctAnswerText derives the truth", () => {
    expect(correctAnswerText(mul35x4)).toBe("140");
  });
});
