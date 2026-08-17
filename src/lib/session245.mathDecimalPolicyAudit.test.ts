import { describe, expect, it } from "vitest";
import { decimalFractionPolicyResidue } from "../../scripts/audit/math-presentation-detectors";
import { ALGEBRA2_GENERATORS } from "./algebra2Variants";
import type { Band } from "./difficulty";
import { hashSeed, mulberry32 } from "./prng";

const context = (key: string) => {
  const [source, owner, unit, field] = key.split("|");
  return { source, owner, unit, field };
};

const exactDecimalFields = [
  "authored|esn-03-02|k1|widget.prompt",
  "authored|esn-03-02|c2|body",
  "authored|esn-03-02|k1|explanationVariants[0]",
  "authored|esn-03-02|i2|widget.commonErrors[0].feedback",
  "authored|esn-03-02|i2|widget.commonErrors[1].feedback",
  "authored|esn-03-02|i2|widget.fallbackFeedback",
  "authored|esn-03-02|i3|widget.prompt",
  "authored|esn-03-02|ch1|widget.prompt",
  "authored|esn-03-02|ch1|hints[1]",
  "authored|esn-03-02|ch1|explanationVariants[0]",
  "authored|lg-04-01|i1|widget.fallbackFeedback",
  "authored|si-02-03|rk1|explanationVariants[0]",
  "generated|sci-notation|small|widget.prompt",
];

const patternFields = [
  "authored|sr-05-03|i1|widget.choices[3].feedback",
  "authored|rns-01-01|ch1|hints[2]",
  "authored|rns-01-01|ch1|explanationVariants[0]",
  "authored|rns-01-01|ch1|widget.choices[0].label",
  "authored|rns-01-03|k2|body",
  "authored|rns-01-03|k2|widget.prompt",
  "authored|rns-01-03|k3|body",
  "authored|rns-01-03|k3|widget.prompt",
  "authored|rns-01-03|ch1|widget.prompt",
  "authored|rns-02-02|k1|widget.items[2].label",
  "authored|rns-02-02|c2|body",
  "authored|rns-02-02|k3|widget.prompt",
  "authored|rns-02-02|ch1|widget.options[3].label",
  "authored|rns-03-03|k2|widget.options[3].feedback",
  "generated|repeat-decimal|twoDigit|widget.prompt",
  "generated|repeat-decimal|threeDigit|widget.prompt",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[0].label",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[1].label",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[2].label",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[3].label",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[0].feedback",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[1].feedback",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[2].feedback",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.choices[3].feedback",
  "generated|g8-rns-decimal-classify|rnsBlockRepeat|widget.successFeedback",
  "generated|g8-rns-root-classify|rnsClassifyMixed|widget.items[2].label",
  "generated|g8-rns-root-classify|rnsClassifyGrowingDecimal|widget.prompt",
  "generated|g8-rns-root-classify|rnsClassifyPickRational|widget.options[0].label",
  "generated|g8-rns-root-classify|rnsClassifyPickRational|widget.options[1].label",
  "generated|g8-rns-root-classify|rnsClassifyPickRational|widget.options[2].label",
  "generated|g8-rns-root-classify|rnsClassifyPickRational|widget.options[3].label",
];

describe("S245 decimal/fraction policy audit dispositions", () => {
  it("disposes only the exact scientific-notation value fields", () => {
    for (const key of exactDecimalFields) {
      expect(
        decimalFractionPolicyResidue("0.000047", "0.000047", context(key)),
        key,
      ).toBeNull();
    }

    expect(
      decimalFractionPolicyResidue(
        "0.000047",
        "0.000047",
        context("authored|esn-03-02|k2|widget.prompt"),
      ),
    ).toBe("6 decimal places, no stated convention");
  });

  it("disposes only the reviewed repeating and growing-pattern fields", () => {
    for (const key of patternFields) {
      expect(
        decimalFractionPolicyResidue(
          "0.123123123…",
          "0.123123123…",
          context(key),
        ),
        key,
      ).toBeNull();
    }

    expect(
      decimalFractionPolicyResidue(
        "0.123123123…",
        "0.123123123…",
        context("authored|future-rns|k1|widget.prompt"),
      ),
    ).toBe("9 decimal places, no stated convention");
  });

  it("still reports the former trig feedback and unrelated invented precision", () => {
    const trig = context(
      "generated|a2-trig|tf-identity__numeric|widget.successFeedback",
    );
    expect(
      decimalFractionPolicyResidue(
        "cos θ==0.916515.",
        "cos θ=√(1−sin²θ)=0.916515.",
        trig,
      ),
    ).toBe("6 decimal places, no stated convention");

    const future = context("generated|future|form|widget.successFeedback");
    expect(decimalFractionPolicyResidue("1.234567", "1.234567", future)).toBe(
      "6 decimal places, no stated convention",
    );
  });

  it("accepts explicitly stated precision and the existing exact-power safeguards", () => {
    const future = context("generated|future|form|widget.successFeedback");
    expect(
      decimalFractionPolicyResidue(
        "1.234567",
        "Rounded to six decimal places: 1.234567",
        future,
      ),
    ).toBeNull();
    expect(
      decimalFractionPolicyResidue("0.000001", "0.000001", future),
    ).toBeNull();
    expect(
      decimalFractionPolicyResidue("4.000000", "4.000000", future),
    ).toBeNull();
  });

  it("disposes only the reviewed quoted over-precision counterexample", () => {
    expect(
      decimalFractionPolicyResidue(
        "47.28193651",
        "The app reports '47.28193651 mph'. What's wrong?",
        context("authored|dm-03-01|ch1|widget.prompt"),
      ),
    ).toBeNull();
    expect(
      decimalFractionPolicyResidue(
        "47.28193651",
        "The app reports '47.28193651 mph'. What's wrong?",
        context("authored|future|ch1|widget.prompt"),
      ),
    ).toBe("8 decimal places, no stated convention");
  });

  it("does not let an unrelated precision word hide an unstated decimal", () => {
    const future = context("generated|future|form|widget.successFeedback");
    expect(
      decimalFractionPolicyResidue(
        "First estimate the diagram. The computed value is 1.234567.",
        "First estimate the diagram. The computed value is 1.234567.",
        future,
      ),
    ).toBe("6 decimal places, no stated convention");
    expect(
      decimalFractionPolicyResidue(
        "About the model: its exact output is 1.234567.",
        "About the model: its exact output is 1.234567.",
        future,
      ),
    ).toBe("6 decimal places, no stated convention");
    expect(
      decimalFractionPolicyResidue(
        "Estimate 2.345678; the unchecked calculator output is 1.234567.",
        "Estimate 2.345678; the unchecked calculator output is 1.234567.",
        future,
      ),
    ).toBe("6 decimal places, no stated convention");
  });

  it("associates approximation and rounding language with the displayed value", () => {
    const future = context("generated|future|form|widget.successFeedback");
    for (const raw of [
      "The value is about 1.234567.",
      "The value is approximately 1.234567.",
      "The estimate is 1.234567.",
      "The value is ≈ 1.234567.",
      "The answer is 1.234567, rounded to six decimal places.",
    ]) {
      expect(
        decimalFractionPolicyResidue("1.234567", raw, future),
        raw,
      ).toBeNull();
    }
  });

  it("states and displays three-decimal precision for every trig-identity draw", () => {
    const generator = ALGEBRA2_GENERATORS.find(
      (candidate) => candidate.tag === "a2-trig",
    );
    expect(generator).toBeDefined();

    const bands: Band[] = ["support", "core", "stretch"];
    for (let index = 0; index < 24; index += 1) {
      const seed = `s245-decimal-policy|${index}`;
      const variant = generator!.gen(
        mulberry32(hashSeed(seed)),
        bands[index % bands.length],
        "tf-identity__numeric",
      );
      expect(variant.widget.prompt, seed).toContain("to three decimal places");
      expect(variant.widget.successFeedback, seed).toMatch(/≈\d+\.\d{3}\./);
      expect(variant.widget.successFeedback, seed).not.toMatch(/=\d+\.\d{6}\b/);
    }
  });
});
