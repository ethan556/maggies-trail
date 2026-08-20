// @vitest-environment jsdom
/**
 * S316 sweep — regression guard for the SAME mastery-integrity bug fixed in
 * `labChoiceOrder.s316.test.tsx` (`PercentChangeLabW` / `ProportionalReasoningLabW`), now applied
 * to the ten widgets the S316 report flagged as carrying the identical defect: `spec.choices`
 * rendered in raw authored order, with no seeded shuffle, while `evaluate.ts` grades by
 * `choice.id` (never rendered position). Authored content overwhelmingly writes the correct
 * choice first (documented in `S316_LAB_CHOICE_SHUFFLE_FIX.md`), so every one of these widgets
 * was solvable, in real authored steps, by always pressing the first button.
 *
 * Nine of the ten are fixed here with the same `orderedChoices = useMemo(() =>
 * seededShuffle(spec.choices, seed ?? ...), [seed, spec.choices])` pattern already used by McqW /
 * PercentChangeLabW / ProportionalReasoningLabW / SignedFractionLabW etc.
 *
 * `DiscreteEstimateCompareW` (estimateSlider's discrete mode) is NOT fixed and has no test here —
 * see `reports/closure/S316_LAB_CHOICE_SHUFFLE_SWEEP.md` for the ordered-semantics argument (its
 * choices are quantities on a shared magnitude scale — "about how far/big/much" — and 11 of 15
 * authored instances order them ascending low → correct → high, which is content, not authoring
 * bias; the remaining 4 do carry a correct-first bias and are flagged there as a content issue for
 * a human, not a widget bug).
 *
 * Every spec below is copied byte-for-byte (aside from JSON→TS punctuation) from real authored
 * lesson content, per CLAUDE.md's "read every authored item" discipline, so the tests exercise the
 * exact shapes these engines actually render in production.
 *
 * For each widget:
 *  1. the rendered choice order is NOT the authored order for a seed known to displace the
 *     correct choice away from position 0 (the bug this guards against);
 *  2. clicking the correct choice by its LABEL — wherever it renders — still grades correct via
 *     `evaluate()`, proving grading follows identity (`choice.id`), not rendered position.
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, cleanup, within } from "@testing-library/react";
import { afterEach } from "vitest";
import { WidgetRenderer as WidgetView } from "./widgets";
import { seededShuffle } from "@/lib/prng";
import { evaluate } from "@/lib/evaluate";
import type {
  TCompositeAreaLab,
  TTrialProbabilityLab,
  TEquationOutcomeLab,
  TPlaceValueTransformLab,
  TPointSetReasoningLab,
  TExactNumberLab,
  TAffineRelationshipLab,
  TQuotientReasoningLab,
  TGraphStoryLab,
  TDistributionCompareLab
} from "@/lib/schema";

afterEach(cleanup);

function findDisplacingSeed(choices: { id: string }[], correctId: string, prefix: string): string {
  for (let i = 0; i < 50; i++) {
    if (seededShuffle(choices, `${prefix}-${i}`)[0].id !== correctId) return `${prefix}-${i}`;
  }
  throw new Error("no displacing seed found in 50 tries — sanity check failed");
}

/* ---------------- compositeAreaLab ---------------- */
// content/courses/measurement-data/lessons/md-04-04.json — correct choice ("sum") authored first.
const COMPOSITE_AREA: TCompositeAreaLab = {
  type: "compositeAreaLab",
  prompt: "The L-shape is split into a 4-by-2 rectangle and a 3-by-2 rectangle. Use the shown pieces to choose the L-shape's total area.",
  scene: "piece-ledger",
  pieces: [
    { id: "upper", label: "4 by 2 piece", shape: "rectangle", operation: "add", width: 4, height: 2 },
    { id: "lower", label: "3 by 2 piece", shape: "rectangle", operation: "add", width: 3, height: 2 }
  ],
  target: { kind: "total" },
  choices: [
    { id: "sum", label: "14 square units", value: 14, feedback: "Yes. The two visible areas are 8 and 6, and 8 + 6 = 14." },
    { id: "first", label: "8 square units", value: 8, feedback: "That is only the 4-by-2 piece. The L-shape includes the second rectangle." },
    { id: "edges", label: "9 square units", value: 9, feedback: "Adding side lengths does not count square units. Find each rectangle's area, then add." }
  ],
  fallbackFeedback: "The pieces cover 4 × 2 = 8 and 3 × 2 = 6 square units. Add 8 + 6.",
  successFeedback: "Both rectangles together cover 14 square units. After the cut, the last step is to add the piece areas."
};

describe("compositeAreaLab choice order (S316 sweep)", () => {
  it("does not render choices in authored order for a seed that displaces the correct one", () => {
    const seed = findDisplacingSeed(COMPOSITE_AREA.choices, "sum", "cal-probe");
    const { container } = render(<WidgetView spec={COMPOSITE_AREA} value={null} onChange={() => {}} disabled={false} seed={seed} />);
    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons[0].textContent).not.toBe("14 square units");
  });

  it("still grades correct when the correct choice is clicked wherever it renders", () => {
    const seed = findDisplacingSeed(COMPOSITE_AREA.choices, "sum", "cal-grade-probe");
    const onChange = vi.fn();
    const { container } = render(<WidgetView spec={COMPOSITE_AREA} value={null} onChange={onChange} disabled={false} seed={seed} />);
    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons[0].textContent).not.toBe("14 square units"); // sanity: really displaced
    const correctButton = buttons.find((b) => b.textContent === "14 square units")!;
    fireEvent.click(correctButton);
    expect(onChange).toHaveBeenCalledWith("sum");
    expect(evaluate(COMPOSITE_AREA, "sum").correct).toBe(true);
  });
});

/* ---------------- trialProbabilityLab ---------------- */
// content/courses/sampling-and-probability/lessons/sp-03-03.json — correct choice ("a") authored first.
const TRIAL_PROBABILITY: TTrialProbabilityLab = {
  type: "trialProbabilityLab",
  prompt: "When rolling a standard 6-sided die, what is the probability of rolling an odd number?",
  mode: "theoretical",
  favourable: 3,
  total: 6,
  successLabel: "odd faces",
  totalLabel: "faces",
  outcomes: [
    { label: "1", favourable: true }, { label: "2", favourable: false }, { label: "3", favourable: true },
    { label: "4", favourable: false }, { label: "5", favourable: true }, { label: "6", favourable: false }
  ],
  choices: [
    { id: "a", label: "1/2", num: 1, den: 2, feedback: "Yes — 1, 3, 5 are odd: 3 out of 6 = 1/2." },
    { id: "b", label: "1/3", num: 1, den: 3, feedback: "That would be 2 out of 6. Three faces (1,3,5) are odd: 3/6 = 1/2." },
    { id: "c", label: "1/6", num: 1, den: 6, feedback: "That's just one face. 3 odd faces out of 6 is 1/2." }
  ],
  fallbackFeedback: "Compare favourable outcomes with the complete set of equally likely outcomes or trials.",
  successFeedback: "Yes — 1, 3, 5 are odd: 3 out of 6 = 1/2."
};

describe("trialProbabilityLab choice order (S316 sweep)", () => {
  it("does not render choices in authored order for a seed that displaces the correct one", () => {
    const seed = findDisplacingSeed(TRIAL_PROBABILITY.choices, "a", "tpl-probe");
    render(<WidgetView spec={TRIAL_PROBABILITY} value={null} onChange={() => {}} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the probability fraction" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toMatch(/^1\/2/);
  });

  it("still grades correct when the correct choice is clicked wherever it renders", () => {
    const seed = findDisplacingSeed(TRIAL_PROBABILITY.choices, "a", "tpl-grade-probe");
    const onChange = vi.fn();
    render(<WidgetView spec={TRIAL_PROBABILITY} value={null} onChange={onChange} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the probability fraction" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toMatch(/^1\/2/); // sanity: really displaced
    const correctButton = buttons.find((b) => /^1\/2/.test(b.textContent ?? ""))!;
    fireEvent.click(correctButton);
    expect(onChange).toHaveBeenCalledWith("a");
    expect(evaluate(TRIAL_PROBABILITY, "a").correct).toBe(true);
  });
});

/* ---------------- equationOutcomeLab (classify mode) ---------------- */
// content/courses/linear-equations-systems/lessons/les-02-02.json — correct choice ("a") authored first.
const EQUATION_OUTCOME: TEquationOutcomeLab = {
  type: "equationOutcomeLab",
  mode: "classify",
  answerMode: "outcome",
  prompt: "How many solutions does 5x − 2 = 5x − 2 have?",
  leftDisplay: "5x − 2",
  rightDisplay: "5x − 2",
  leftCoeff: 5, leftConstant: -2, rightCoeff: 5, rightConstant: -2,
  relation: "eq", variable: "x",
  choices: [
    { id: "a", label: "Infinitely many", outcome: "infinite", feedback: "Right — both sides are identical, so every x works." },
    { id: "b", label: "No solution", outcome: "none", feedback: "That needs a FALSE leftover statement — here −2 = −2 is TRUE, so infinitely many, not none." },
    { id: "c", label: "One solution", outcome: "one", feedback: "The x-terms cancel and leave −2 = −2 (always true), so every x works — infinitely many, not one." },
    { id: "d", label: "x = 0", outcome: "one", feedback: "Every x works, not just 0 — the equation is true for all values: infinitely many." }
  ],
  operations: [], correctOrder: [], requiredMoves: 1, numericErrors: [], tolerance: 0,
  explorationFeedback: "Apply the same legal operation to both sides and inspect the new relation.",
  fallbackFeedback: "Collect like terms and inspect whether the residue is false, true for every x, or still contains x.",
  successFeedback: "Right — both sides are identical, so every x works."
};

describe("equationOutcomeLab (classify) choice order (S316 sweep)", () => {
  it("does not render choices in authored order for a seed that displaces the correct one", () => {
    const seed = findDisplacingSeed(EQUATION_OUTCOME.choices, "a", "eol-probe");
    const { container } = render(<WidgetView spec={EQUATION_OUTCOME} value={null} onChange={() => {}} disabled={false} seed={seed} />);
    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons[0].textContent).not.toBe("Infinitely many");
  });

  it("still grades correct when the correct choice is clicked wherever it renders", () => {
    const seed = findDisplacingSeed(EQUATION_OUTCOME.choices, "a", "eol-grade-probe");
    const onChange = vi.fn();
    const { container } = render(<WidgetView spec={EQUATION_OUTCOME} value={null} onChange={onChange} disabled={false} seed={seed} />);
    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons[0].textContent).not.toBe("Infinitely many"); // sanity: really displaced
    const correctButton = buttons.find((b) => b.textContent === "Infinitely many")!;
    fireEvent.click(correctButton);
    expect(onChange).toHaveBeenCalledWith("a");
    expect(evaluate(EQUATION_OUTCOME, "a").correct).toBe(true);
  });
});

/* ---------------- placeValueTransformLab ---------------- */
// content/courses/place-value/lessons/pv-01-03.json — correct choice ("less") authored first.
const PLACE_VALUE_TRANSFORM: TPlaceValueTransformLab = {
  type: "placeValueTransformLab",
  task: "compare",
  answerMode: "choice",
  prompt: "Line up 98 and 401. Open the place chart, then choose the true comparison.",
  values: [98, 401],
  exponentOps: [],
  tolerance: 0,
  choices: [
    { id: "less", label: "98 < 401", claim: "relation:lt", feedback: "Yes. 98 has 0 hundreds, while 401 has 4 hundreds." },
    { id: "greater", label: "98 > 401", claim: "relation:gt", feedback: "The 9 is in the tens place. It cannot outweigh 4 hundreds." },
    { id: "equal", label: "98 = 401", claim: "relation:eq", feedback: "The place charts are different at the hundreds place, so the numbers are not equal." }
  ],
  numericErrors: [],
  requiredExplorations: 1,
  successFeedback: "98 < 401. Any 3-digit number has at least 1 hundred, so it is greater than every 2-digit number.",
  explorationFeedback: "Open the hundreds stage before choosing the comparison.",
  fallbackFeedback: "Compare the greatest place first: 0 hundreds is less than 4 hundreds."
};
// One valid, pre-verified exploration key (mirrors the "supply a pre-verified value" pattern used
// for proportionalReasoningLab in labChoiceOrder.s316.test.tsx) — avoids driving the reveal-stage
// UI through the DOM just to reach the choice buttons this test targets. Computed the same way
// placeValueTransformTruth does for task "compare": 98 vs 401 first differ at the hundreds place
// (exponent 2, "0 hundreds" vs "4 hundreds"), so the sole stage key is "place:2".
const PVT_READY_VALUE = { revealed: ["place:2"] };

describe("placeValueTransformLab choice order (S316 sweep)", () => {
  it("does not render choices in authored order for a seed that displaces the correct one", () => {
    const seed = findDisplacingSeed(PLACE_VALUE_TRANSFORM.choices, "less", "pvtl-probe");
    render(<WidgetView spec={PLACE_VALUE_TRANSFORM} value={PVT_READY_VALUE} onChange={() => {}} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the place-value conclusion" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toBe("98 < 401");
  });

  it("still grades correct when the correct choice is clicked wherever it renders", () => {
    const seed = findDisplacingSeed(PLACE_VALUE_TRANSFORM.choices, "less", "pvtl-grade-probe");
    const onChange = vi.fn();
    render(<WidgetView spec={PLACE_VALUE_TRANSFORM} value={PVT_READY_VALUE} onChange={onChange} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the place-value conclusion" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toBe("98 < 401"); // sanity: really displaced
    const correctButton = buttons.find((b) => b.textContent === "98 < 401")!;
    fireEvent.click(correctButton);
    expect(onChange).toHaveBeenCalledWith({ ...PVT_READY_VALUE, choiceId: "less" });
    expect(evaluate(PLACE_VALUE_TRANSFORM, { ...PVT_READY_VALUE, choiceId: "less" }).correct).toBe(true);
  });
});

/* ---------------- pointSetReasoningLab ---------------- */
// content/courses/data-distributions/lessons/dd-04-01.json — correct choice ("a") authored first.
const POINT_SET_REASONING: TPointSetReasoningLab = {
  type: "pointSetReasoningLab",
  answerMode: "choice",
  prompt: "For the laps data 3, 5, 7, 9, 12 — which values does the range use?",
  task: "rangeEndpoints",
  xLabel: "laps",
  sets: [
    {
      id: "data", label: "laps data",
      points: [
        { id: "data-0", label: "value 1", x: 3 }, { id: "data-1", label: "value 2", x: 5 },
        { id: "data-2", label: "value 3", x: 7 }, { id: "data-3", label: "value 4", x: 9 },
        { id: "data-4", label: "value 5", x: 12 }
      ]
    }
  ],
  targetSetId: "data",
  choices: [
    { id: "a", label: "Only the max (12) and the min (3)", feedback: "Yes — range is a two-value summary: the endpoints of the stretch. The 5, 7, and 9 never enter the calculation.", claim: "range:endpoints:3:12" },
    { id: "b", label: "All five values, added up", feedback: "Adding every value is the MEAN's opening move. The range only touches the endpoints: max − min.", claim: "misconception:b" },
    { id: "c", label: "The middle value, 7", feedback: "The middle is the MEDIAN's territory — a center, not a spread. Range measures the stretch between min and max.", claim: "misconception:c" }
  ],
  numericErrors: [],
  authoredStages: [],
  requiredStageKeys: ["range:min", "range:max", "range:span"],
  requiredExplorations: 3,
  successFeedback: "Yes — range is a two-value summary: the endpoints of the stretch. The 5, 7, and 9 never enter the calculation.",
  explorationFeedback: "Inspect every required observation and derived point-set state before checking.",
  fallbackFeedback: "Choose the conclusion supported by the point-set state.",
  tolerance: 0
};
const PSR_READY_VALUE = { revealed: POINT_SET_REASONING.requiredStageKeys };

describe("pointSetReasoningLab choice order (S316 sweep)", () => {
  it("does not render choices in authored order for a seed that displaces the correct one", () => {
    const seed = findDisplacingSeed(POINT_SET_REASONING.choices, "a", "psr-probe");
    render(<WidgetView spec={POINT_SET_REASONING} value={PSR_READY_VALUE} onChange={() => {}} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the point-set conclusion" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toBe("Only the max (12) and the min (3)");
  });

  it("still grades correct when the correct choice is clicked wherever it renders", () => {
    const seed = findDisplacingSeed(POINT_SET_REASONING.choices, "a", "psr-grade-probe");
    const onChange = vi.fn();
    render(<WidgetView spec={POINT_SET_REASONING} value={PSR_READY_VALUE} onChange={onChange} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the point-set conclusion" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toBe("Only the max (12) and the min (3)"); // sanity: really displaced
    const correctButton = buttons.find((b) => b.textContent === "Only the max (12) and the min (3)")!;
    fireEvent.click(correctButton);
    expect(onChange).toHaveBeenCalledWith({ ...PSR_READY_VALUE, choiceId: "a" });
    expect(evaluate(POINT_SET_REASONING, { ...PSR_READY_VALUE, choiceId: "a" }).correct).toBe(true);
  });
});

/* ---------------- exactNumberLab ---------------- */
// content/courses/rational-number-operations/lessons/rno-04-03.json — correct choice ("a") authored first.
const EXACT_NUMBER: TExactNumberLab = {
  type: "exactNumberLab",
  prompt: "-1/2 × 2/3 = ?",
  task: "rationalOperation",
  values: [
    { id: "a", label: "-1/2", kind: "rational", num: -1, den: 2 },
    { id: "b", label: "2/3", kind: "rational", num: 2, den: 3 }
  ],
  operation: "multiply",
  requiredExplorations: 2,
  requiredStageKeys: ["rational:normalize", "rational:operate"],
  tolerance: 0,
  choices: [
    { id: "a", label: "-1/3", feedback: "Yes — different signs, and 1/2 × 2/3 = 1/3.", numberValue: -0.3333333333333333 },
    { id: "b", label: "1/3", feedback: "Signs differ, so the result is negative: -1/3.", claim: "misconception:b" },
    { id: "c", label: "-1/6", feedback: "1×2/2×3 = 2/6 = 1/3, not 1/6.", claim: "misconception:c" }
  ],
  numericErrors: [],
  authoredStages: [],
  explorationFeedback: "Inspect every required exact-number state before checking.",
  fallbackFeedback: "Use the exact-number states to support your answer.",
  answerMode: "choice",
  successFeedback: "Yes — different signs, and 1/2 × 2/3 = 1/3."
};
const EXACT_NUMBER_READY_VALUE = { revealed: EXACT_NUMBER.requiredStageKeys };

describe("exactNumberLab choice order (S316 sweep)", () => {
  it("does not render choices in authored order for a seed that displaces the correct one", () => {
    const seed = findDisplacingSeed(EXACT_NUMBER.choices, "a", "enl-probe");
    render(<WidgetView spec={EXACT_NUMBER} value={EXACT_NUMBER_READY_VALUE} onChange={() => {}} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the exact-number conclusion" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toBe("-1/3");
  });

  it("still grades correct when the correct choice is clicked wherever it renders", () => {
    const seed = findDisplacingSeed(EXACT_NUMBER.choices, "a", "enl-grade-probe");
    const onChange = vi.fn();
    render(<WidgetView spec={EXACT_NUMBER} value={EXACT_NUMBER_READY_VALUE} onChange={onChange} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the exact-number conclusion" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toBe("-1/3"); // sanity: really displaced
    const correctButton = buttons.find((b) => b.textContent === "-1/3")!;
    fireEvent.click(correctButton);
    expect(onChange).toHaveBeenCalledWith({ ...EXACT_NUMBER_READY_VALUE, choiceId: "a" });
    expect(evaluate(EXACT_NUMBER, { ...EXACT_NUMBER_READY_VALUE, choiceId: "a" }).correct).toBe(true);
  });
});

/* ---------------- affineRelationshipLab ---------------- */
// content/courses/functions-g8/lessons/fg-03-02.json — correct choice ("a") authored first.
const AFFINE_RELATIONSHIP: TAffineRelationshipLab = {
  type: "affineRelationshipLab",
  prompt: "Function A is y = 2x. Function B is the table (1,3), (2,6), (3,9). Which grows faster?",
  task: "compareRate",
  lines: [
    { id: "a", label: "Function A", m: 2, b: 0, sourceKind: "equation", sourceText: "y = 2x", tablePoints: [] },
    { id: "b", label: "Function B", m: 3, b: 0, sourceKind: "table", sourceText: "(1, 3), (2, 6), (3, 9)", tablePoints: [[1, 3], [2, 6], [3, 9]] }
  ],
  rateGoal: "greater",
  requiredExplorations: 3,
  requiredStageKeys: ["line:a:slope", "line:b:slope", "compare:rates"],
  tolerance: 0,
  choices: [
    { id: "a", label: "B, because its rate is 3 vs A's rate of 2", claim: "rate:greater:b", feedback: "Right — B rises 3 per step, A rises 2, so B grows faster." },
    { id: "b", label: "A, because it's an equation", claim: "misconception:b", feedback: "The form doesn't decide — compare rates: A's is 2, B's is 3, so B is faster." },
    { id: "c", label: "They grow at the same rate", claim: "misconception:c", feedback: "A rises 2 per step; B rises 3 per step — not the same." },
    { id: "d", label: "Can't compare an equation with a table", claim: "misconception:d", feedback: "You can — just find each rate: A is 2, B is 3, so B grows faster." }
  ],
  numericErrors: [],
  pointErrors: [],
  authoredStages: [],
  explorationFeedback: "Inspect every designated affine state before checking.",
  fallbackFeedback: "Use the affine relationship states to support your answer.",
  answerMode: "choice",
  successFeedback: "Right — B rises 3 per step, A rises 2, so B grows faster."
};
const AFFINE_READY_VALUE = { revealed: AFFINE_RELATIONSHIP.requiredStageKeys };

describe("affineRelationshipLab choice order (S316 sweep)", () => {
  it("does not render choices in authored order for a seed that displaces the correct one", () => {
    const seed = findDisplacingSeed(AFFINE_RELATIONSHIP.choices, "a", "arl-probe");
    render(<WidgetView spec={AFFINE_RELATIONSHIP} value={AFFINE_READY_VALUE} onChange={() => {}} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the affine conclusion" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toBe("B, because its rate is 3 vs A's rate of 2");
  });

  it("still grades correct when the correct choice is clicked wherever it renders", () => {
    const seed = findDisplacingSeed(AFFINE_RELATIONSHIP.choices, "a", "arl-grade-probe");
    const onChange = vi.fn();
    render(<WidgetView spec={AFFINE_RELATIONSHIP} value={AFFINE_READY_VALUE} onChange={onChange} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the affine conclusion" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toBe("B, because its rate is 3 vs A's rate of 2"); // sanity: really displaced
    const correctButton = buttons.find((b) => b.textContent === "B, because its rate is 3 vs A's rate of 2")!;
    fireEvent.click(correctButton);
    expect(onChange).toHaveBeenCalledWith({ ...AFFINE_READY_VALUE, choiceId: "a" });
    expect(evaluate(AFFINE_RELATIONSHIP, { ...AFFINE_READY_VALUE, choiceId: "a" }).correct).toBe(true);
  });
});

/* ---------------- quotientReasoningLab ---------------- */
// content/courses/the-real-number-system/lessons/rns-02-02.json — correct choice ("a") authored first.
const QUOTIENT_REASONING: TQuotientReasoningLab = {
  type: "quotientReasoningLab",
  task: "rationalDefinition",
  answerMode: "choice",
  prompt: "Explore the exact fraction and decimal forms of 1/3, then classify 0.333….",
  dividend: { num: 1, den: 3 },
  candidates: [],
  choices: [
    { id: "a", label: "Rational, because it equals 1/3", claim: "rational:yes", feedback: "Correct. A repeating decimal can equal an exact ratio of integers; 0.333… = 1/3." },
    { id: "b", label: "Irrational, because it never ends", claim: "misconception:endless", feedback: "Endlessness alone is not enough. A repeating pattern represents a fraction, so the number is rational." },
    { id: "c", label: "Neither, because the decimal is unfinished", claim: "misconception:unfinished", feedback: "The ellipsis names an exact repeating pattern, not an unfinished measurement. That pattern equals 1/3." }
  ],
  requiredExplorations: 2,
  tolerance: 0,
  successFeedback: "0.333… and 1/3 are two exact forms of the same number. Because it is a ratio of integers, it is rational.",
  explorationFeedback: "Inspect both the fraction form and repeating decimal form before classifying the number.",
  fallbackFeedback: "A rational number is any exact ratio of integers. Check whether the repeating decimal has such a fraction form.",
  numericErrors: [],
  fractionErrors: [],
  authoredStages: []
};
// quotientReasoningTruth's "rationalDefinition" case pushes exactly two stages, keyed
// "decimal:fraction" (the integer ratio) and "decimal:representation" (its decimal form) —
// matching requiredExplorations: 2.
const QUOTIENT_READY_VALUE = { revealed: ["decimal:fraction", "decimal:representation"] };

describe("quotientReasoningLab choice order (S316 sweep)", () => {
  it("does not render choices in authored order for a seed that displaces the correct one", () => {
    const seed = findDisplacingSeed(QUOTIENT_REASONING.choices, "a", "qrl-probe");
    render(<WidgetView spec={QUOTIENT_REASONING} value={QUOTIENT_READY_VALUE} onChange={() => {}} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the exact quotient conclusion" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toBe("Rational, because it equals 1/3");
  });

  it("still grades correct when the correct choice is clicked wherever it renders", () => {
    const seed = findDisplacingSeed(QUOTIENT_REASONING.choices, "a", "qrl-grade-probe");
    const onChange = vi.fn();
    render(<WidgetView spec={QUOTIENT_REASONING} value={QUOTIENT_READY_VALUE} onChange={onChange} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the exact quotient conclusion" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toBe("Rational, because it equals 1/3"); // sanity: really displaced
    const correctButton = buttons.find((b) => b.textContent === "Rational, because it equals 1/3")!;
    fireEvent.click(correctButton);
    expect(onChange).toHaveBeenCalledWith({ ...QUOTIENT_READY_VALUE, choiceId: "a" });
    expect(evaluate(QUOTIENT_REASONING, { ...QUOTIENT_READY_VALUE, choiceId: "a" }).correct).toBe(true);
  });
});

/* ---------------- graphStoryLab (read mode) ---------------- */
// content/courses/functions-g8/lessons/fg-04-02.json — correct choice ("a") authored first.
const GRAPH_STORY: TGraphStoryLab = {
  type: "graphStoryLab",
  mode: "read",
  prompt: "A distance-vs-time graph is FLAT (horizontal) for a while. What's happening?",
  axisContext: "distanceFromOrigin",
  distanceRule: "awayOnly",
  xAxisLabel: "time",
  yAxisLabel: "distance",
  segments: [
    { id: "A", label: "A", kind: "riseSteady", meaning: "The output increases at a constant rate." },
    { id: "B", label: "B", kind: "flat", meaning: "The output does not change." }
  ],
  readTask: "flatMeaning",
  targetSegmentId: "B",
  choices: [
    { id: "a", label: "Not moving — distance stays the same", claim: "motion:stopped", feedback: "Right — a flat graph means the output (distance) isn't changing: standing still." },
    { id: "b", label: "Moving faster and faster", claim: "rate:speeding-up", feedback: "That would be a graph curving upward more steeply, not a flat line." },
    { id: "c", label: "Moving at a steady speed", claim: "motion:constant-speed", feedback: "Steady speed is a straight SLANTED line — flat means not moving at all." },
    { id: "d", label: "Moving backward", claim: "motion:moving-backward", feedback: "Moving backward would slope DOWN — a flat line means no movement." }
  ],
  bank: [],
  wrongSequences: [],
  successFeedback: "Right — a flat graph means the output (distance) isn't changing: standing still.",
  explorationFeedback: "Read the graph from left to right, then choose the claim supported by its direction, steepness, flatness, or curvature.",
  fallbackFeedback: "Use the visible graph shape and the axis labels together; do not infer from color alone."
};

describe("graphStoryLab (read) choice order (S316 sweep)", () => {
  it("does not render choices in authored order for a seed that displaces the correct one", () => {
    const seed = findDisplacingSeed(GRAPH_STORY.choices, "a", "gsl-probe");
    render(<WidgetView spec={GRAPH_STORY} value={null} onChange={() => {}} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the claim supported by the graph" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toBe("Not moving — distance stays the same");
  });

  it("still grades correct when the correct choice is clicked wherever it renders", () => {
    const seed = findDisplacingSeed(GRAPH_STORY.choices, "a", "gsl-grade-probe");
    const onChange = vi.fn();
    render(<WidgetView spec={GRAPH_STORY} value={null} onChange={onChange} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the claim supported by the graph" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons[0].textContent).not.toBe("Not moving — distance stays the same"); // sanity: really displaced
    const correctButton = buttons.find((b) => b.textContent === "Not moving — distance stays the same")!;
    fireEvent.click(correctButton);
    expect(onChange).toHaveBeenCalledWith("a");
    expect(evaluate(GRAPH_STORY, "a").correct).toBe(true);
  });
});

/* ---------------- distributionCompareLab (measure mode) — S320-A3 ----------------
 * content/courses/sampling-and-probability/lessons/sp-02-01.json i1 — the correct choice (value 3)
 * is authored at index 1, same as 20 of 21 authored measure-mode instances across the 6 lessons the
 * S320-A3 independent assessment escalated. `DistributionCompareLabW`'s judge mode already guarded
 * against this with a seeded `orderedJudgeOptions` shuffle; measure mode rendered `spec.measureChoices`
 * in raw authored order with no shuffle at all, so "always click the 2nd button" scored ~95% on these
 * steps. Fixed with the same `orderedMeasureChoices = useMemo(() => seededShuffle(...), [seed, spec])`
 * pattern. `evaluate.ts`'s "distributionCompareLab" measure-mode case grades strictly by `value`
 * (`spec.measureChoices.some((c) => c.value === value)` / `Math.abs(value - spec.answer) <= spec.tolerance`),
 * never rendered position, so the shuffle is evaluator-safe. */
const DISTRIBUTION_COMPARE_MEASURE: TDistributionCompareLab = {
  type: "distributionCompareLab",
  prompt: "Group A has a mean of 20. Group B has a mean of 8. The variability measure is 4. How many variability-units apart are the means?",
  mode: "measure",
  meanA: 20,
  meanB: 8,
  variability: 4,
  answer: 3,
  tolerance: 0,
  measureChoices: [
    { value: 12, feedback: "That's just the raw gap (20−8). Divide by the variability measure: 12÷4=3." },
    { value: 3, feedback: "(20−8)÷4 = 3 variability-units." },
    { value: 4, feedback: "That's the variability measure itself, not the gap in units. (20−8)÷4=3." }
  ],
  fallbackFeedback: "(20−8)÷4 = 3 variability-units.",
  successFeedback: "(20−8)÷4 = 3 variability-units.",
  judgeOptions: [],
  groupALabel: "Group A",
  groupBLabel: "Group B"
};

function measureGroup() {
  return screen.getByRole("group", { name: "Choose the number of variability-units between the means" });
}

function measureOrder(): string[] {
  return within(measureGroup()).getAllByRole("button").map((button) => button.textContent ?? "");
}

describe("distributionCompareLab (measure) choice order (S320-A3)", () => {
  it("moves the correct choice across positions over different question seeds (was fixed at index 1)", () => {
    const positions = new Set<number>();
    for (let i = 0; i < 18; i++) {
      const view = render(<WidgetView spec={DISTRIBUTION_COMPARE_MEASURE} value={null} onChange={() => {}} disabled={false} seed={`sp-02-01:i1:${i}`} />);
      positions.add(measureOrder().findIndex((text) => text.startsWith("3variability")));
      view.unmount();
    }
    expect(positions.size).toBeGreaterThan(1);
    expect([...positions].every((position) => position >= 0 && position < 3)).toBe(true);
  });

  it("does not render choices in authored order for a seed that displaces the correct one", () => {
    let seed = "";
    for (let i = 0; i < 50; i++) {
      const candidate = `dcl-measure-probe-${i}`;
      const { unmount } = render(<WidgetView spec={DISTRIBUTION_COMPARE_MEASURE} value={null} onChange={() => {}} disabled={false} seed={candidate} />);
      const displaced = !measureOrder()[0].startsWith("12variability");
      unmount();
      if (displaced) { seed = candidate; break; }
    }
    expect(seed).not.toBe("");
    render(<WidgetView spec={DISTRIBUTION_COMPARE_MEASURE} value={null} onChange={() => {}} disabled={false} seed={seed} />);
    expect(measureOrder()[0]).not.toMatch(/^12variability/);
  });

  it("still grades correct by value when the correct choice is clicked wherever it renders — survives shuffle", () => {
    const onChange = vi.fn();
    let seed = "";
    for (let i = 0; i < 50; i++) {
      const candidate = `dcl-measure-grade-probe-${i}`;
      const { unmount } = render(<WidgetView spec={DISTRIBUTION_COMPARE_MEASURE} value={null} onChange={() => {}} disabled={false} seed={candidate} />);
      const displaced = !measureOrder()[0].startsWith("12variability");
      unmount();
      if (displaced) { seed = candidate; break; }
    }
    expect(seed).not.toBe(""); // sanity: a displacing seed exists
    render(<WidgetView spec={DISTRIBUTION_COMPARE_MEASURE} value={null} onChange={onChange} disabled={false} seed={seed} />);
    const buttons = within(measureGroup()).getAllByRole("button");
    expect(buttons[0].textContent).not.toMatch(/^12variability/); // sanity: really displaced
    const correctButton = buttons.find((b) => b.textContent?.startsWith("3variability"))!;
    fireEvent.click(correctButton);
    expect(onChange).toHaveBeenCalledWith(3);
    expect(evaluate(DISTRIBUTION_COMPARE_MEASURE, 3).correct).toBe(true);
  });

  it("keeps grading correct by value even when a wrong choice is clicked wherever it renders", () => {
    const onChange = vi.fn();
    render(<WidgetView spec={DISTRIBUTION_COMPARE_MEASURE} value={null} onChange={onChange} disabled={false} seed="dcl-measure-wrong-probe" />);
    const buttons = within(measureGroup()).getAllByRole("button");
    const wrongButton = buttons.find((b) => b.textContent?.startsWith("4variability"))!;
    fireEvent.click(wrongButton);
    expect(onChange).toHaveBeenCalledWith(4);
    expect(evaluate(DISTRIBUTION_COMPARE_MEASURE, 4)).toEqual({
      correct: false,
      feedback: "That's the variability measure itself, not the gap in units. (20−8)÷4=3."
    });
  });
});
