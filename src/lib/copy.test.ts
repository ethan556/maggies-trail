import { describe, expect, it } from "vitest";
import { gradeBandLabel } from "./copy";

describe("gradeBandLabel", () => {
  it("labels K–8 as grades", () => {
    expect(gradeBandLabel(0)).toBe("Kindergarten");
    expect(gradeBandLabel(3)).toBe("Grade 3");
    expect(gradeBandLabel(8)).toBe("Grade 8");
  });

  it("labels the four HS bands as course tracks (the catalog split)", () => {
    expect(gradeBandLabel(9)).toBe("Algebra 1");
    expect(gradeBandLabel(10)).toBe("Geometry");
    expect(gradeBandLabel(11)).toBe("Algebra 2");
    expect(gradeBandLabel(12)).toBe("Precalculus");
  });

  it("labels the calculus band by name, never 'Grade 13'", () => {
    expect(gradeBandLabel(13)).toBe("Calculus");
  });
});
