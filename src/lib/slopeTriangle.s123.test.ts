import { describe, it, expect } from "vitest";
import {
  SlopeTriangleSpec,
  slopeTriangleMatches,
  slopeTriangleLabel,
  widgetIntegrityErrors
} from "./schema";
import { evaluate, canCheck, correctAnswerText } from "./evaluate";
import type { TSlopeTriangle } from "./schema";

const spec = (over: Partial<TSlopeTriangle> = {}): TSlopeTriangle =>
  SlopeTriangleSpec.parse({
    type: "slopeTriangle",
    prompt: "Build the triangle so the line hits B.",
    ax: 2,
    ay: 1,
    bx: 6,
    by: 9,
    gridMax: 10,
    legMax: 8,
    fallbackFeedback: "fb",
    successFeedback: "ok",
    ...over
  });

describe("slopeTriangle: constancy is the grading rule", () => {
  it("accepts EVERY equivalent triangle on the line (slope 2)", () => {
    for (const [run, rise] of [[1, 2], [2, 4], [3, 6], [4, 8]])
      expect(slopeTriangleMatches(spec(), run, rise)).toBe(true);
  });
  it("accepts the reversed direction — travelling left and down is the same line", () => {
    expect(slopeTriangleMatches(spec(), -1, -2)).toBe(true);
    expect(slopeTriangleMatches(spec(), -3, -6)).toBe(true);
  });
  it("rejects the reciprocal and the sign flip", () => {
    expect(slopeTriangleMatches(spec(), 2, 1)).toBe(false);
    expect(slopeTriangleMatches(spec(), 1, -2)).toBe(false);
  });
  it("rejects the empty triangle", () => {
    expect(slopeTriangleMatches(spec(), 0, 0)).toBe(false);
  });
});

describe("slopeTriangle: horizontal and vertical are real states", () => {
  const horiz = spec({ ax: 2, ay: 5, bx: 7, by: 5 });
  const vert = spec({ ax: 4, ay: 1, bx: 4, by: 7 });
  it("horizontal: any nonzero run with zero rise, nothing else", () => {
    expect(slopeTriangleMatches(horiz, 3, 0)).toBe(true);
    expect(slopeTriangleMatches(horiz, -5, 0)).toBe(true);
    expect(slopeTriangleMatches(horiz, 3, 1)).toBe(false);
    expect(slopeTriangleMatches(horiz, 0, 0)).toBe(false);
  });
  it("vertical: any nonzero rise with zero run, nothing else", () => {
    expect(slopeTriangleMatches(vert, 0, 4)).toBe(true);
    expect(slopeTriangleMatches(vert, 0, -2)).toBe(true);
    expect(slopeTriangleMatches(vert, 1, 4)).toBe(false);
    expect(slopeTriangleMatches(vert, 0, 0)).toBe(false);
  });
  it("labels them the way the curriculum names them", () => {
    expect(slopeTriangleLabel(horiz)).toBe("0");
    expect(slopeTriangleLabel(vert)).toBe("undefined");
  });
});

describe("slopeTriangle: labels reduce, and negatives use the typographic minus", () => {
  it("reduces a non-unit slope", () => {
    expect(slopeTriangleLabel(spec({ ax: 0, ay: 0, bx: 3, by: 2 }))).toBe("2/3");
  });
  it("renders an integer slope without a denominator", () => {
    expect(slopeTriangleLabel(spec())).toBe("2");
  });
  it("uses U+2212 for a negative slope", () => {
    expect(slopeTriangleLabel(spec({ ax: 1, ay: 5, bx: 4, by: 2 }))).toBe("\u22121");
    expect(slopeTriangleLabel(spec({ ax: 1, ay: 8, bx: 5, by: 0 }))).toBe("\u22122");
  });
});

describe("slopeTriangle: grading and derived diagnoses", () => {
  it("cannot check the empty triangle; can once a leg is set", () => {
    expect(canCheck(spec(), { run: 0, rise: 0 })).toBe(false);
    expect(canCheck(spec(), { run: 1, rise: 2 })).toBe(true);
  });
  it("correct on an equivalent build", () => {
    const r = evaluate(spec(), { run: 2, rise: 4 });
    expect(r.correct).toBe(true);
    expect(r.feedback).toBe("ok");
  });
  it("names the swapped legs without an authored entry", () => {
    const r = evaluate(spec(), { run: 2, rise: 1 });
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/legs are swapped/);
  });
  it("names a sign error as a direction error, naming the actual direction", () => {
    const r = evaluate(spec(), { run: 1, rise: -2 });
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/right and 8 up/);
  });
  it("authored pairs beat the derived diagnosis, and the fallback catches the rest", () => {
    const s = spec({ commonPairs: [{ run: 3, rise: 1, feedback: "counted the grid squares" }] });
    expect(evaluate(s, { run: 3, rise: 1 }).feedback).toBe("counted the grid squares");
    expect(evaluate(s, { run: 5, rise: 3 }).feedback).toBe("fb");
  });
  it("answer text names the slope", () => {
    expect(correctAnswerText(spec())).toBe("slope 2");
    expect(correctAnswerText(spec({ ax: 4, ay: 1, bx: 4, by: 7 }))).toBe("slope undefined");
  });
});

describe("slopeTriangle: integrity gate", () => {
  it("accepts well-formed authoring", () => {
    expect(widgetIntegrityErrors(spec())).toEqual([]);
  });
  it("rejects A === B", () => {
    expect(widgetIntegrityErrors(spec({ bx: 2, by: 1 })).join(" ")).toMatch(/same point/);
  });
  it("rejects a point outside the grid", () => {
    expect(widgetIntegrityErrors(spec({ bx: 40 })).join(" ")).toMatch(/outside the grid/);
  });
  it("rejects a slope no reachable leg pair can build", () => {
    // slope 11/1 needs a rise of 11, beyond legMax 8; no equivalent pair is smaller.
    expect(widgetIntegrityErrors(spec({ ax: 0, ay: 0, bx: 1, by: 11, gridMax: 12 })).join(" ")).toMatch(
      /no \(run, rise\) inside legMax/
    );
  });
  it("rejects a commonPairs entry that is actually correct", () => {
    expect(
      widgetIntegrityErrors(spec({ commonPairs: [{ run: 2, rise: 4, feedback: "dead" }] })).join(" ")
    ).toMatch(/is a CORRECT build/);
  });
  it("rejects an unreachable commonPairs entry", () => {
    expect(
      widgetIntegrityErrors(spec({ commonPairs: [{ run: 20, rise: 1, feedback: "dead" }] })).join(" ")
    ).toMatch(/outside legMax/);
  });
});
