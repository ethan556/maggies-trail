import { describe, expect, it } from "vitest";
import { unitNotationResidue } from "../../scripts/audit/math-presentation-detectors";

describe("S244 unit-notation audit boundary", () => {
  it("keeps real welded and pluralised unit-symbol defects", () => {
    expect(unitNotationResidue("The length is 12cm." )).toBe("number welded to its unit");
    expect(unitNotationResidue("The two lengths are 12 cms and 8 cms." )).toBe("unit symbol pluralised");
    expect(unitNotationResidue("Use 45 mins, then stop." )).toBe("unit symbol pluralised");
  });

  it("does not split English error-analysis verbs into mile symbols", () => {
    expect(unitNotationResidue("935 mis-adds. Line up the places." )).toBeNull();
    expect(unitNotationResidue("11 mis-subtracts the ones." )).toBeNull();
    expect(unitNotationResidue("15 mis-picks the first digit." )).toBeNull();
  });
});
