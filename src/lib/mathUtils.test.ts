import { describe, expect, it } from "vitest";
import { gcd, reduceFraction } from "./mathUtils";

describe("gcd", () => {
  it("computes the greatest common divisor", () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(17, 5)).toBe(1);
    expect(gcd(9, 0)).toBe(9);
    expect(gcd(100, 60)).toBe(20);
  });
});

describe("reduceFraction", () => {
  it("reduces to lowest terms and keeps sign on the numerator", () => {
    expect(reduceFraction(6, 12)).toEqual([1, 2]);
    expect(reduceFraction(8, 15)).toEqual([8, 15]);
    expect(reduceFraction(-4, 8)).toEqual([-1, 2]);
    expect(reduceFraction(4, -8)).toEqual([-1, 2]);
  });
});
