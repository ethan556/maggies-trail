import { describe, expect, it } from "vitest";
import { canCheck, correctAnswerText, evaluate } from "./evaluate";
import { MixedRegroupSpec, mixedKey, mixedRegroupReachable, mixedRegroupTruth, widgetIntegrityErrors } from "./schema";

/** s53 — mixedRegroup, the unit-exchange laboratory. One move in two directions (1 whole ⇄ den/den
 * parts) carries the whole G4 mixed-number chapter: improper→mixed is making wholes, mixed→improper
 * is breaking them all, an addition carry is a make, a subtraction borrow is a break. Every trap
 * asserted below is an AUTHORED misconception from the curriculum, verified reachable by a legal
 * exchange sequence before conversion — or explicitly recorded here as unreachable, which is why
 * it was dropped rather than silently kept as dead feedback. */

const parse = (o: object) => MixedRegroupSpec.parse(o);
const base = { fallbackFeedback: "keep exchanging", successFeedback: "done" };

const convert22over7 = parse({
  type: "mixedRegroup", mode: "convert", den: 7, aWhole: 0, aNum: 22, targetForm: "mixed",
  prompt: "Convert 22/7.",
  commonResults: [{ whole: 2, num: 8, feedback: "8/7 still has a whole hiding inside it" }],
  ...base
});

describe("mixedRegroup truth", () => {
  it("derives the result per mode", () => {
    expect(mixedRegroupTruth({ mode: "convert", den: 8, aWhole: 0, aNum: 11, targetForm: "mixed" })).toEqual({ whole: 1, num: 3 });
    expect(mixedRegroupTruth({ mode: "convert", den: 8, aWhole: 2, aNum: 7, targetForm: "improper" })).toEqual({ whole: 0, num: 23 });
    expect(mixedRegroupTruth({ mode: "add", den: 5, aWhole: 2, aNum: 3, bWhole: 1, bNum: 4 })).toEqual({ whole: 4, num: 2 });
    expect(mixedRegroupTruth({ mode: "subtract", den: 7, aWhole: 4, aNum: 1, bWhole: 2, bNum: 5 })).toEqual({ whole: 1, num: 3 });
    expect(mixedRegroupTruth({ mode: "subtract", den: 5, aWhole: 3, aNum: 0, bWhole: 1, bNum: 2 })).toEqual({ whole: 1, num: 3 });
  });
});

describe("mixedRegroup reachability — the authored trap corpus, mechanically", () => {
  it("convert 11/8: the ladder has exactly two rungs, and 'not yet divided' is the wrong one (fa-04-01/k1)", () => {
    const r = mixedRegroupReachable({ mode: "convert", den: 8, aWhole: 0, aNum: 11, targetForm: "mixed" });
    expect([...r].sort()).toEqual(["0|11", "1|3"].sort());
  });

  it("convert 22/7: partial regrouping states are real, an overshoot to 4 wholes is not (fa-04-01/k3)", () => {
    const r = mixedRegroupReachable({ mode: "convert", den: 7, aWhole: 0, aNum: 22, targetForm: "mixed" });
    expect(r.has(mixedKey({ whole: 3, num: 1 }))).toBe(true); // truth
    expect(r.has(mixedKey({ whole: 2, num: 8 }))).toBe(true); // stopped one whole short
    expect(r.has(mixedKey({ whole: 0, num: 22 }))).toBe(true); // never exchanged
    expect(r.has(mixedKey({ whole: 4, num: 0 }))).toBe(false); // the authored "overshoot" cannot be built
  });

  it("convert 2 7/8 → improper: the halfway state is real, 16 and 9 are not (fa-04-02/k1)", () => {
    const r = mixedRegroupReachable({ mode: "convert", den: 8, aWhole: 2, aNum: 7, targetForm: "improper" });
    expect([...r].sort()).toEqual(["0|23", "1|15", "2|7"].sort());
    // the authored traps 16 (2×8, forgot the 7) and 9 (2+7) are not states: the exchange carries
    // the existing 7 along and only ever moves den parts at a time.
    expect([...r].some((k) => k.endsWith("|16") || k.endsWith("|9"))).toBe(false);
  });

  it("add 2 3/5 + 1 4/5: stranding the made whole lands the authored 3 (fa-04-03/k2)", () => {
    const r = mixedRegroupReachable({ mode: "add", den: 5, aWhole: 2, aNum: 3, bWhole: 1, bNum: 4 });
    expect([...r].sort()).toEqual(["3|7", "4|2"].sort());
  });

  it("subtract 4 1/7 − 2 5/7: no-break lands the authored 4, over-breaking is visible (fa-04-03/k3)", () => {
    const r = mixedRegroupReachable({ mode: "subtract", den: 7, aWhole: 4, aNum: 1, bWhole: 2, bNum: 5 });
    expect([...r].sort()).toEqual(["0|10", "1|3", "2|4"].sort());
    // the authored trap 6 ("misses a step in the borrow") is not a state — no exchange sequence
    // produces a 6/7 parts result, so it would be dead feedback.
    expect([...r].some((k) => k.endsWith("|6"))).toBe(false);
  });

  it("subtract from a whole number (3 − 1 2/5): the break is forced, and skipping it is walkable", () => {
    const r = mixedRegroupReachable({ mode: "subtract", den: 5, aWhole: 3, aNum: 0, bWhole: 1, bNum: 2 });
    expect(r.has(mixedKey({ whole: 1, num: 3 }))).toBe(true); // truth
    expect(r.has(mixedKey({ whole: 2, num: 2 }))).toBe(true); // never broke: wrote 2 − 0 in the parts column
  });
});

describe("mixedRegroup integrity gate", () => {
  it("accepts a live spec with reachable traps", () => {
    expect(widgetIntegrityErrors(convert22over7)).toEqual([]);
  });

  it("REFUSES a step with no exchange decision", () => {
    const flat = parse({ ...convert22over7, aNum: 3, commonResults: [] });
    expect(widgetIntegrityErrors(flat).join(" ")).toContain("no exchange decision");
  });

  it("REFUSES a trap equal to the result and a trap no exchange sequence can build", () => {
    const eq = parse({ ...convert22over7, commonResults: [{ whole: 3, num: 1, feedback: "x" }] });
    expect(widgetIntegrityErrors(eq).join(" ")).toContain("success slot");
    const dead = parse({ ...convert22over7, commonResults: [{ whole: 4, num: 0, feedback: "overshoot" }] });
    expect(widgetIntegrityErrors(dead).join(" ")).toContain("unreachable");
  });

  it("REFUSES malformed modes: missing operand, stray operand, missing target form, improper operand, negative", () => {
    const noB = parse({ ...convert22over7, mode: "subtract", targetForm: undefined, aWhole: 4, aNum: 1 });
    expect(widgetIntegrityErrors(noB).join(" ")).toContain("two operands are required");
    const strayB = parse({ ...convert22over7, bWhole: 1, bNum: 1 });
    expect(widgetIntegrityErrors(strayB).join(" ")).toContain("second operand is meaningless");
    const noForm = parse({ ...convert22over7, targetForm: undefined });
    expect(widgetIntegrityErrors(noForm).join(" ")).toContain("needs targetForm");
    const improperOperand = parse({
      type: "mixedRegroup", mode: "add", den: 5, aWhole: 1, aNum: 9, bWhole: 1, bNum: 2,
      prompt: "x", commonResults: [], ...base
    });
    expect(widgetIntegrityErrors(improperOperand).join(" ")).toContain("proper mixed numbers");
    const negative = parse({
      type: "mixedRegroup", mode: "subtract", den: 5, aWhole: 1, aNum: 1, bWhole: 3, bNum: 2,
      prompt: "x", commonResults: [], ...base
    });
    expect(widgetIntegrityErrors(negative).join(" ")).toContain("negative");
  });
});

describe("mixedRegroup grading", () => {
  const sub = parse({
    type: "mixedRegroup", mode: "subtract", den: 7, aWhole: 4, aNum: 1, bWhole: 2, bNum: 5,
    prompt: "4 1/7 − 2 5/7",
    commonResults: [{ whole: 2, num: 4, feedback: "subtracted backward" }],
    ...base
  });

  it("gates checking until both columns are resolved", () => {
    expect(canCheck(sub, { whole: 0, num: 0, complete: false })).toBe(false);
    expect(evaluate(sub, { whole: 0, num: 0, complete: false }).feedback).toContain("parts column");
    expect(canCheck(sub, { whole: 1, num: 3, complete: true })).toBe(true);
  });

  it("success, per-state diagnosis, and fallback", () => {
    expect(evaluate(sub, { whole: 1, num: 3, complete: true }).correct).toBe(true);
    expect(evaluate(sub, { whole: 2, num: 4, complete: true }).feedback).toBe("subtracted backward");
    expect(evaluate(sub, { whole: 0, num: 10, complete: true }).feedback).toBe("keep exchanging");
  });

  it("correctAnswerText writes the result in mixed-number form", () => {
    expect(correctAnswerText(sub)).toBe("1 3/7");
    expect(correctAnswerText(convert22over7)).toBe("3 1/7");
    expect(
      correctAnswerText(parse({ ...convert22over7, aWhole: 2, aNum: 7, den: 8, targetForm: "improper" }))
    ).toBe("23/8");
  });
});
