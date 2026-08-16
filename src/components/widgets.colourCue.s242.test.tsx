// @vitest-environment jsdom
/**
 * S242 / ACC-01 §5(f) × ENG-01 R2 — A CORRECTNESS COLOUR MUST WAIT FOR THE VERDICT.
 *
 * Three engines coloured a mark leaf the instant the learner's state matched the target, with no
 * second channel: `trialProbabilityLab`'s claim marker, `distributionCompareLab`'s measure tape,
 * `fractionGrid`'s product overlap. Each condition is the grader's own test, and each engine
 * carries graded placements (7, 12 and 4 — 23 in all).
 *
 * That is one defect wearing two hats. WCAG 1.4.1 (Level A) because colour is the only channel,
 * and ENG-01 R2 because the signal arrives before Check. §6 of the accessibility matrix settles
 * which remedy wins: adding a glyph or text channel would make the answer leak LOUDER and put it in
 * the accessible name, while gating on `tone === "info"` makes the 1.4.1 problem vanish — after the
 * verdict the banner already states the outcome in words.
 *
 * So the assertion is symmetric, and both halves matter. Withholding the cue is the fix; still
 * SHOWING it post-verdict is what keeps the fix from being a deletion, because the coloured mark is
 * a genuinely good explanation once the answer is settled.
 *
 * The specs are lifted from real graded steps (`sp-03-02#k1`, `sp-02-01#k1`, `fm-03-01#k1`) rather
 * than invented, so a schema change that made them unrepresentative would surface here.
 */
import { describe, expect, it, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { useState } from "react";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { WidgetRenderer } from "./widgets";
import { PALETTE } from "@/lib/palette";

afterEach(() => cleanup());

function mount(raw: unknown, value: unknown, tone?: "info" | "success" | "error") {
  const spec = WidgetSpec.parse(raw) as TWidget;
  function Host() {
    const [v, setV] = useState<unknown>(value);
    return <WidgetRenderer spec={spec} value={v} onChange={setV} disabled={false} tone={tone} />;
  }
  return render(<Host />);
}

/** Every fill/stroke anywhere inside the marked element, so a leaf on a child still counts. */
const paints = (root: Element | null) => {
  if (!root) return [] as string[];
  const nodes = [root, ...Array.from(root.querySelectorAll("*"))];
  return nodes.flatMap((n) => [n.getAttribute("fill"), n.getAttribute("stroke")].filter(Boolean) as string[]);
};

const CASES = [
  {
    name: "trialProbabilityLab — the learner's claim marker",
    testid: "tpl-learner-claim",
    value: "correct",
    spec: {
      type: "trialProbabilityLab", prompt: "A spinner landed on red 18 times out of 30 spins. What is the relative frequency of red?",
      mode: "experimental", favourable: 18, total: 30, successLabel: "red spins", totalLabel: "spins", outcomes: [],
      choices: [
        { id: "correct", label: "3/5", num: 3, den: 5, feedback: "Yes — 18/30 simplifies to 3/5." },
        { id: "trap-1", label: "18/12", num: 18, den: 12, feedback: "That compares red to non-red, not red to the TOTAL spins. 18 out of 30 is 3/5." },
        // The schema requires at least three choices — trimming to two is what a first pass did,
        // and Zod rejected the spec rather than letting the test render something unrepresentative.
        { id: "trap-2", label: "1/3", num: 1, den: 3, feedback: "1/3 of 30 would be 10, not 18. The actual relative frequency is 18/30 = 3/5." },
      ],
      fallbackFeedback: "Relative frequency is successes over TOTAL trials: 18 over 30.",
      successFeedback: "Yes — 18/30 simplifies to 3/5.",
    },
  },
  {
    name: "distributionCompareLab — the measure tape",
    testid: "dcl-measure-tape",
    value: 4,
    spec: {
      type: "distributionCompareLab", prompt: "How many variability-units apart are the means?",
      mode: "measure", meanA: 27, meanB: 15, variability: 3, answer: 4, tolerance: 0,
      measureChoices: [{ value: 4, feedback: "(27−15)÷3 = 4 variability-units." }, { value: 12, feedback: "That's just the raw gap. Divide by the variability measure." }],
      fallbackFeedback: "(27−15)÷3 = 4 variability-units.", successFeedback: "(27−15)÷3 = 4 variability-units.",
    },
  },
  {
    name: "fractionGrid — the product overlap",
    testid: "fg-overlap",
    value: { rows: 2, shadeR: 1, cols: 3, shadeC: 1 },
    spec: {
      type: "fractionGrid", prompt: "1/2 × 1/3 = ? (6 cells total, 1 in the overlap)",
      num1: 1, den1: 2, num2: 1, den2: 3,
      rowFeedback: "Rows carry the first factor: 2 rows with 1 shaded makes the 1/2.",
      colFeedback: "Rows are set — columns carry the 1/3: 3 columns with 1 shaded.",
      successFeedback: "Right — 1 shaded cell out of 6 is 1/6.",
    },
  },
] as const;

describe("S242 — correctness colour waits for the verdict", () => {
  for (const c of CASES) {
    it(`${c.name}: withholds leaf during active work`, () => {
      const { container } = mount(c.spec, c.value);
      const mark = container.querySelector(`[data-testid="${c.testid}"]`);
      expect(mark, `${c.testid} should render once the learner has acted`).toBeTruthy();
      expect(
        paints(mark),
        "the widget announces a correct answer before the learner has committed to it"
      ).not.toContain(PALETTE.leaf);
    });

    it(`${c.name}: shows leaf after the verdict`, () => {
      // The other half of the contract. Without this the gate would also pass on a deletion, and
      // the coloured mark is a good explanation once the answer is settled.
      const { container } = mount(c.spec, c.value, "info");
      expect(paints(container.querySelector(`[data-testid="${c.testid}"]`))).toContain(PALETTE.leaf);
    });
  }
});
