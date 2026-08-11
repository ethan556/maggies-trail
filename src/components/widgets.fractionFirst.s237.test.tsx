// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { WidgetRenderer } from "./widgets";
import { fractionText, terminatingDecimal, fractionWithDecimal } from "@/lib/mathUtils";
import { correctAnswerText } from "@/lib/evaluate";
import type { TWidget } from "@/lib/schema";

/**
 * S237 — FRACTION FIRST, AND NEVER A FALSE EQUALS.
 *
 * Reported by a learner against the "Finding a Common Denominator" lesson, which printed:
 *
 *     4/12   = 0.333 ✓ equal
 *
 * Two defects in one line. 4/12 is exactly 1/3, whose decimal expansion never terminates, so the
 * "=" asserted something false — with a ✓ beside it. And a fractions lesson had made a rounded
 * decimal the headline reading of a fraction.
 *
 * The ruling: in a fraction context every number is shown AS A FRACTION; a decimal may appear
 * beside it, in parentheses, and only when it is exact.
 *
 * The rule is enforced here as a PROPERTY over the rendered DOM, not as a check on the four
 * call sites I happened to fix: mount each fraction-subject widget in a state whose value does
 * not terminate, and assert no decimal is printed as an equal. It therefore fails for a new
 * widget that reintroduces the defect. Every rejection is paired with a terminating case that
 * MUST still print its decimal, so the gate cannot pass by simply banning all digits.
 */

afterEach(cleanup);

const textOf = (spec: TWidget, value: unknown = null): string => {
  const { container } = render(
    <WidgetRenderer spec={spec} value={value} onChange={() => {}} disabled={false} />
  );
  return container.textContent ?? "";
};

/** A decimal presented as an equal: "= 0.333", "= 0.167", "= 66.6667%". */
const EQUALS_A_DECIMAL = /=\s*-?\d*\.\d/;

/* ───────────────────────── the helpers ───────────────────────── */

describe("terminatingDecimal refuses to invent a rounding", () => {
  it("REJECTS every non-terminating fraction — the ones the reported defect rounded", () => {
    for (const [n, d] of [[4, 12], [1, 3], [2, 3], [1, 6], [5, 12], [1, 13], [40, 110], [3, 52]]) {
      expect(terminatingDecimal(n, d), `${n}/${d}`).toBeNull();
    }
  });

  it("ACCEPTS every terminating fraction, exactly — including unreduced forms", () => {
    expect(terminatingDecimal(3, 4)).toBe("0.75");
    expect(terminatingDecimal(1, 2)).toBe("0.5");
    expect(terminatingDecimal(5, 10)).toBe("0.5"); // reduces to 1/2
    expect(terminatingDecimal(6, 12)).toBe("0.5");
    expect(terminatingDecimal(1, 8)).toBe("0.125");
    expect(terminatingDecimal(7, 20)).toBe("0.35");
    expect(terminatingDecimal(4, 4)).toBe("1");
    expect(terminatingDecimal(0, 3)).toBe("0"); // 0/anything terminates
  });

  it("fractionText reduces, and names a whole number as a whole number", () => {
    expect(fractionText(4, 12)).toBe("1/3");
    expect(fractionText(8, 4)).toBe("2");
    expect(fractionText(0, 5)).toBe("0");
    expect(fractionText(5, 12)).toBe("5/12");
  });

  it("fractionWithDecimal states an exact decimal and withholds an inexact one", () => {
    expect(fractionWithDecimal(3, 4)).toBe("3/4 (0.75)");
    expect(fractionWithDecimal(40, 110)).toBe("4/11");
    expect(fractionWithDecimal(40, 110, true)).toBe("4/11 (≈ 0.364)"); // opt-in, and marked ≈
    expect(fractionWithDecimal(40, 110)).not.toMatch(EQUALS_A_DECIMAL);
  });
});

/* ───────────────────────── the widgets ───────────────────────── */

const fractionBar = (n: number, d: number, targetNum = 1, targetDen = 3): TWidget =>
  ({
    type: "fractionBar", prompt: `Rename ${targetNum}/${targetDen} as ${d}ths.`,
    numMin: 1, numMax: 12, denMin: 1, denMax: 12, numStart: n, denStart: d,
    targetNum, targetDen, showTarget: true, notation: "fraction", commonFractions: [],
    successFeedback: "Same amount, renamed.", fallbackFeedback: "Keep adjusting until the bars match.",
    lowFeedback: "That is less than the target.", highFeedback: "That is more than the target."
  }) as unknown as TWidget;

/** The widget reads n and d from its VALUE, so the state under test is passed as one. */
const barState = (n: number, d: number) => ({ n, d });

describe("fractionBar — the reported defect", () => {
  it("shows 4/12 as a FRACTION, never as = 0.333", () => {
    const t = textOf(fractionBar(4, 12), barState(4, 12));
    expect(t).toContain("4/12");
    expect(t).toContain("1/3");           // the exact reading, which is the lesson's own subject
    expect(t).not.toContain("0.333");     // the rounded value that was printed as equal
    expect(t).not.toMatch(EQUALS_A_DECIMAL);
    expect(t).toContain("✓ equal");       // the correct ✓ is preserved — it was never the bug
  });

  it("ACCEPTS a terminating decimal beside the fraction — 3/4 still states 0.75", () => {
    // The paired acceptance: this gate bans FALSE decimals, not decimals.
    const t = textOf(fractionBar(3, 4, 3, 4), barState(3, 4));
    expect(t).toContain("3/4");
    expect(t).toContain("0.75");
    expect(t).not.toMatch(EQUALS_A_DECIMAL); // stated in parentheses, not after an "="
  });

  it("the number-line label spoken to a screen reader carries no rounded decimal either", () => {
    const { container } = render(
      <WidgetRenderer spec={fractionBar(4, 12)} value={barState(4, 12)} onChange={() => {}} disabled={false} />
    );
    const labels = Array.from(container.querySelectorAll("[aria-label]")).map((e) => e.getAttribute("aria-label") ?? "");
    const line = labels.find((l) => l.includes("number line")) ?? "";
    expect(line, "the number-line aria-label").not.toContain("0.333");
    expect(line).toContain("1/3");
  });
});

describe("probability widgets state a probability as a fraction", () => {
  const spinner = (sectors: number, fav: number): TWidget =>
    ({
      type: "spinnerSim", prompt: "Set the wheel.", sectors, targetFavourable: fav,
      favourableStart: fav,
      successFeedback: "That is the wheel described.",
      lowFeedback: "Shade more sectors to match.", highFeedback: "Shade fewer sectors to match."
    }) as unknown as TWidget;

  it("REJECTS a rounded decimal for 1/6 and 5/12 — and ACCEPTS the exact one for 3/6", () => {
    const sixth = textOf(spinner(6, 1), { favourable: 1 });
    expect(sixth).toContain("1/6");
    expect(sixth).not.toContain("0.167");
    expect(sixth).not.toMatch(EQUALS_A_DECIMAL);

    const twelfth = textOf(spinner(12, 5), { favourable: 5 });
    expect(twelfth).toContain("5/12");
    expect(twelfth).not.toContain("0.417");

    const half = textOf(spinner(6, 3), { favourable: 3 });
    expect(half).toContain("0.5"); // 3/6 = 1/2 exactly, so the decimal is honest and is shown
  });
});

describe("the reveal surface states the exact fraction", () => {
  it("REJECTS 20/30 = 66.6667% — and ACCEPTS an exact percent as an equal", () => {
    const lab = (counts: number[]): TWidget =>
      ({
        type: "conditionalTableLab", prompt: "Read the relative frequency.",
        rowLabels: ["A", "B"], colLabels: ["X", "Y"], counts, mode: "read",
        readMetric: "relativeRow", targetCell: "r0c0", targetCondition: "row0",
        answerChoices: [{ id: "c0", label: "20 ÷ 30", value: 66.6667, feedback: "" }],
        successFeedback: "Right.", fallbackFeedback: "Use the row as the denominator."
      }) as unknown as TWidget;

    const inexact = correctAnswerText(lab([20, 10, 5, 15]));
    expect(inexact).toContain("20/30");
    expect(inexact).not.toMatch(EQUALS_A_DECIMAL);
    expect(inexact).toContain("≈");

    const exact = correctAnswerText(lab([20, 30, 5, 15])); // 20/50 = 40% exactly
    expect(exact).toContain("20/50");
    expect(exact).toContain("= 40%");
  });
});
