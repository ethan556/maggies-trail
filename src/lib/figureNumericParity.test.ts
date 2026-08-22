import { describe, expect, it } from "vitest";
import {
  compareExactFigureNumericParity,
  compareFigureNumericParity,
  hasExplicitNumericOrSymbolicClaim,
  isDeclaredFixedNumericExemplarAligned,
  signedRationalAtoms,
} from "./figureNumericParity";

describe("fixed numeric figure parity", () => {
  it("preserves signed integers, decimals, and fractions", () => {
    expect(signedRationalAtoms("-3 + (-5) = -8")).toEqual(["-3", "-5", "-8"]);
    expect(signedRationalAtoms("3.25 - (-1.5) = 4.75")).toEqual(["3.25", "-1.5", "4.75"]);
    expect(signedRationalAtoms("-1/2 + 3/4 = 1/4")).toEqual(["-1/2", "3/4", "1/4"]);
  });

  it("distinguishes exact claims from generic instructional prose", () => {
    expect(hasExplicitNumericOrSymbolicClaim("Add integers with different signs by comparing absolute values.")).toBe(false);
    expect(hasExplicitNumericOrSymbolicClaim("Start at -3 and move right 8 to land at 5.")).toBe(true);
    expect(hasExplicitNumericOrSymbolicClaim("Seeing a - (-b) means immediately think a + b.")).toBe(true);
  });

  it("rejects incidental shared factors in renderer-derived exact claims", () => {
    const result = compareExactFigureNumericParity("4 × 6 = 24", "3 rows of 4 = 12; 4 + 4 + 4 = 12");
    expect(result.aligned).toBe(false);
    expect(result.reasons).toContain("EXACT_RENDERED_VALUE_MISMATCH[missing=6+24]");
    expect(compareExactFigureNumericParity("3 × 4 = 4 × 3", "3 rows of 4 = 12").aligned).toBe(true);
  });

  it("rejects the screenshot same-sign mismatch", () => {
    const result = compareFigureNumericParity("-4 + 9 = 5; move right", "-3 + (-5) = -8; move left");
    expect(result.aligned).toBe(false);
    expect(result.reasons).toEqual(expect.arrayContaining([expect.stringContaining("FIXED_VALUE_MISMATCH"), expect.stringContaining("CLAIM_SHAPE_MISMATCH")]));
  });

  it("rejects fixed subtraction when prose subtracts a negative", () => {
    expect(isDeclaredFixedNumericExemplarAligned("rno-add-opposite", "a - (-b) = a + b")).toBe(false);
    expect(isDeclaredFixedNumericExemplarAligned("rno7-signed-decimal", "3.25 - (-1.5) = 4.75")).toBe(true);
  });

  it("allows a matching fixed claim or a narrow generic semantic binding", () => {
    expect(isDeclaredFixedNumericExemplarAligned("rno7-add-same-line", "-3 + (-5) = -8. Move 5 spaces left.")).toBe(true);
    expect(isDeclaredFixedNumericExemplarAligned("rno-same-sign", "To add two negative integers, add their absolute values and keep the negative sign.")).toBe(true);
  });
});
