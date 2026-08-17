import { describe, expect, it } from "vitest";
import {
  canonicalFormResidue,
  type CanonicalFormContext,
} from "../../scripts/audit/math-presentation-detectors";

const context = (
  source: string,
  owner: string,
  unit: string,
  field: string,
): CanonicalFormContext => ({ source, owner, unit, field });

describe("S245 canonical-form audit dispositions", () => {
  it("continues to report genuine unit coefficients outside the evidence-backed contexts", () => {
    const ordinary = context(
      "authored",
      "future-lesson",
      "k1",
      "widget.prompt",
    );
    expect(
      canonicalFormResidue("Simplify 1x + 4.", "Simplify 1x + 4.", ordinary),
    ).toBe("redundant unit coefficient (1x)");
    expect(
      canonicalFormResidue("A 1D shape", "A 1D shape", ordinary),
    ).toBeNull();
  });

  it("never exempts explicit multiplication or machine coefficient order", () => {
    const teaching = context(
      "authored",
      "ee-02b-02",
      "i1",
      "widget.successFeedback",
    );
    expect(canonicalFormResidue("3 * x", "3 * x", teaching)).toBe(
      "coefficient written with an explicit *",
    );
    expect(canonicalFormResidue("x * 3", "x * 3", teaching)).toBe(
      "variable before coefficient (machine order)",
    );
  });

  it("disposes only the exact authored coefficient-1 teaching fields", () => {
    const fields = [
      ["bt-02-01", "i1", "widget.successFeedback"],
      ["ep-02-03", "i1", "widget.xFeedback"],
      ["ee-02b-02", "i1", "widget.successFeedback"],
      ["ee-02b-02", "k3", "widget.commonErrors[0].feedback"],
      ["ee-02b-02", "k3", "widget.fallbackFeedback"],
      ["fg-03-01", "k3", "widget.commonBuilds[0].feedback"],
      ["ep-02-03", "ch1", "explanationVariants[1]"],
      ["rf-04-03", "rem-rf0403-k", "widget.commonErrors[0].feedback"],
      ["tse-01b-02", "c1", "body"],
      ["tse-01b-02", "k1", "explanationVariants[0]"],
      ["tse-01b-02", "k1", "widget.fallbackFeedback"],
      ["tse-01b-02", "k3", "widget.fallbackFeedback"],
      ["tse-01b-02", "r1", "takeaways[0]"],
    ] as const;

    for (const [owner, unit, field] of fields) {
      const meta = context("authored", owner, unit, field);
      expect(
        canonicalFormResidue("1x is the coefficient model.", "", meta),
        owner,
      ).toBeNull();
    }

    const nearMiss = context(
      "authored",
      "ee-02b-02",
      "k2",
      "widget.fallbackFeedback",
    );
    expect(canonicalFormResidue("Use 1x.", "Use 1x.", nearMiss)).toBe(
      "redundant unit coefficient (1x)",
    );
  });

  it("disposes only the proven affine and system source-model fields", () => {
    expect(
      canonicalFormResidue(
        "-2x + 1y = 0",
        "-2x + 1y = 0",
        context("authored", "se-01-01", "k1", "widget.lines[0].sourceText"),
      ),
    ).toBeNull();
    expect(
      canonicalFormResidue(
        "1x + 5y = 36",
        "1x + 5y = 36",
        context(
          "generated",
          "a1-systems",
          "eliminate-add-subtract__numeric",
          "widget.lines[0].sourceText",
        ),
      ),
    ).toBeNull();

    for (const meta of [
      context("authored", "future-lesson", "k1", "widget.lines[0].sourceText"),
      context("authored", "se-01-01", "k1", "widget.prompt"),
      context(
        "generated",
        "future-generator",
        "form",
        "widget.lines[0].sourceText",
      ),
    ]) {
      expect(canonicalFormResidue("1x + y = 2", "1x + y = 2", meta)).toBe(
        "redundant unit coefficient (1x)",
      );
    }
  });

  it("disposes only the five proven generated form-and-prompt contracts", () => {
    const forms = [
      ["a1-linear-functions", "standard-form__mcq"],
      ["a1-linear-functions", "standard-form__numeric"],
      ["a1-systems", "eliminate-add-subtract__numeric"],
      ["a1-systems", "eliminate-scale-both__numeric"],
      ["a2-series", "sr-convert__mcq"],
    ] as const;

    for (const [owner, unit] of forms) {
      const meta = context("generated", owner, unit, "widget.prompt");
      expect(
        canonicalFormResidue("Use 1x.", "Use 1x.", meta),
        `${owner}/${unit}`,
      ).toBeNull();
    }

    const wrongField = context(
      "generated",
      "a1-linear-functions",
      "standard-form__mcq",
      "widget.successFeedback",
    );
    expect(canonicalFormResidue("Use 1x.", "Use 1x.", wrongField)).toBe(
      "redundant unit coefficient (1x)",
    );
  });
});
