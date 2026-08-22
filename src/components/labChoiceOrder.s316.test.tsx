// @vitest-environment jsdom
/**
 * S316 regression guard for a mastery-integrity bug: `ProportionalReasoningLabW` and
 * `PercentChangeLabW` rendered `spec.choices` in raw authored order — the exact bug McqW's own
 * in-code comment documents and shuffles against (see widgets.tsx and optionOrder.test.tsx).
 * Authored content overwhelmingly writes the correct choice first, so both engines were
 * 100% solvable by always pressing the first button.
 *
 * The fix shuffles DISPLAY ORDER ONLY, with the same seeded PRNG McqW already uses
 * (src/lib/prng.ts). Grading in evaluate.ts looks the picked choice up by `choice.id` /
 * `value.choiceId`, never by rendered position, so the shuffle cannot change what's correct or
 * which feedback fires — only which button a given choice happens to render as.
 *
 * This file checks, for both widgets:
 *  1. the rendered order is NOT the authored order for a seed known to displace the correct
 *     choice away from position 0 (the bug this guards against);
 *  2. the shuffle is deterministic (same seed -> same order);
 *  3. clicking the correct choice by its LABEL — wherever it renders — still grades correct via
 *     `evaluate()`, proving grading follows identity, not position.
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { WidgetRenderer as WidgetView } from "./widgets";
import { seededShuffle } from "@/lib/prng";
import { evaluate } from "@/lib/evaluate";
import type { TPercentChangeLab, TProportionalReasoningLab } from "@/lib/schema";

afterEach(cleanup);

/* ---------------- percentChangeLab ---------------- */

// Mirrors the authored shape (content/courses/proportional-relationships/lessons/pr-04-02.json):
// the correct choice ("correct") is written first, exactly the pattern that made the bug 100%
// exploitable.
const PERCENT_CHANGE: TPercentChangeLab = {
  type: "percentChangeLab",
  prompt: "A shirt costs $10 wholesale. The store marks it up 25%. What is the new price?",
  base: 10,
  percent: 25,
  direction: "markup",
  currency: "$",
  choices: [
    { id: "correct", label: "$12.50", value: 12.5, feedback: "25% of $10 is $2.50, so the new price is $10 + $2.50 = $12.50." },
    { id: "wrong-1", label: "$10.25", value: 10.25, feedback: "25% of $10 is $2.50, not $0.25. The new price is 10 + 2.50 = 12.50." },
    { id: "wrong-2", label: "$2.50", value: 2.5, feedback: "$2.50 is just the markup amount. Add it to the price: 10 + 2.50 = 12.50." }
  ],
  fallbackFeedback: "25% of $10 is $2.50, so the new price is $10 + $2.50 = $12.50.",
  successFeedback: "25% of $10 is $2.50, so the new price is $10 + $2.50 = $12.50."
};

function percentChangeButtonLabels(seed: string): (string | null)[] {
  const { unmount, container } = render(<WidgetView spec={PERCENT_CHANGE} value={null} onChange={() => {}} disabled={false} seed={seed} />);
  const labels = Array.from(container.querySelectorAll("button")).map((el) => el.textContent);
  unmount();
  return labels;
}

function findDisplacingSeed(choices: { id: string }[], correctId: string, prefix: string): string {
  for (let i = 0; i < 50; i++) {
    if (seededShuffle(choices, `${prefix}-${i}`)[0].id !== correctId) return `${prefix}-${i}`;
  }
  throw new Error("no displacing seed found in 50 tries — sanity check failed");
}

describe("percentChangeLab choice order (S316)", () => {
  it("does not render choices in authored order for a seed that displaces the correct one", () => {
    const seed = findDisplacingSeed(PERCENT_CHANGE.choices, "correct", "pcl-probe");
    const shuffled = seededShuffle(PERCENT_CHANGE.choices, seed);
    expect(shuffled.map((c) => c.id)).not.toEqual(PERCENT_CHANGE.choices.map((c) => c.id));

    render(<WidgetView spec={PERCENT_CHANGE} value={null} onChange={() => {}} disabled={false} seed={seed} />);
    const buttons = screen.getAllByRole("button").filter((b) => /^\$/.test(b.textContent ?? ""));
    // The bug rendered spec.choices verbatim, so the first button was always "$12.50" — assert
    // the fix has moved it for this displacing seed.
    expect(buttons[0].textContent).not.toBe("$12.50");
  });

  it("is deterministic: the same seed renders the same order every time", () => {
    const seed = "pcl-lesson-x:pcl-step-1";
    expect(percentChangeButtonLabels(seed)).toEqual(percentChangeButtonLabels(seed));
  });

  it("still grades correct when the correct choice is clicked wherever it renders", () => {
    const seed = findDisplacingSeed(PERCENT_CHANGE.choices, "correct", "pcl-grade-probe");
    const onChange = vi.fn();
    render(<WidgetView spec={PERCENT_CHANGE} value={null} onChange={onChange} disabled={false} seed={seed} />);
    const buttons = screen.getAllByRole("button").filter((b) => /^\$/.test(b.textContent ?? ""));
    expect(buttons[0].textContent).not.toBe("$12.50"); // sanity: really displaced this time
    const correctButton = screen.getByText("$12.50").closest("button")!;
    fireEvent.click(correctButton);
    expect(onChange).toHaveBeenCalledWith("correct");
    expect(evaluate(PERCENT_CHANGE, "correct").correct).toBe(true);
  });
});

/* ---------------- proportionalReasoningLab ---------------- */

// Mirrors the authored shape (content/courses/proportional-relationships/lessons/pr-02-01.json):
// the correct claim ("a") is written first.
const PROPORTIONAL: TProportionalReasoningLab = {
  type: "proportionalReasoningLab",
  task: "testProportional",
  answerMode: "choice",
  prompt: "A table has pairs (2, 6), (3, 9), (5, 15). Is this proportional?",
  xLabel: "x",
  yLabel: "y",
  series: [{ id: "table", label: "table", pairs: [[2, 6], [3, 9], [5, 15]] }],
  targetSeriesId: "table",
  tolerance: 0,
  requiredExplorations: 3,
  successFeedback: "Yes — 6/2, 9/3, and 15/5 are all 3, so it's proportional.",
  explorationFeedback: "Inspect at least 3 proportional relationships before checking.",
  fallbackFeedback: "Choose the conclusion supported by the normalized ratios.",
  numericErrors: [],
  choices: [
    { id: "a", label: "Yes, every ratio is 3", claim: "proportional:yes", feedback: "Yes — 6/2, 9/3, and 15/5 are all 3, so it's proportional." },
    { id: "b", label: "No, the numbers don't match", claim: "misconception:b", feedback: "Check the ratios, not just the raw numbers: 6/2=9/3=15/5=3, so it IS proportional." },
    { id: "c", label: "Can't tell without more rows", claim: "misconception:c", feedback: "Three rows is enough — check each ratio: 6/2=9/3=15/5=3, all equal, so it's proportional." }
  ]
};

// Every source row's unit rate already verified, so the choice buttons are enabled — mirrors
// widgets.proportionalReasoning.s144.test.tsx's approach of supplying a pre-verified value rather
// than driving the interactive normalize step through the DOM.
const PROPORTIONAL_READY_VALUE = {
  revealed: [],
  unitRates: { "table:0": 3, "table:1": 3, "table:2": 3 },
  verifiedUnitRates: ["table:0", "table:1", "table:2"],
  unitRateStatus: { "table:0": "correct" as const, "table:1": "correct" as const, "table:2": "correct" as const }
};

function proportionalButtonLabels(seed: string): (string | null)[] {
  const { unmount, container } = render(
    <WidgetView spec={PROPORTIONAL} value={PROPORTIONAL_READY_VALUE} onChange={() => {}} disabled={false} seed={seed} />
  );
  const labels = Array.from(container.querySelectorAll('[role="group"][aria-label="Choose the proportional conclusion"] button')).map(
    (el) => el.textContent
  );
  unmount();
  return labels;
}

describe("proportionalReasoningLab choice order (S316)", () => {
  it("does not render choices in authored order for a seed that displaces the correct one", () => {
    const seed = findDisplacingSeed(PROPORTIONAL.choices, "a", "prl-probe");
    const shuffled = seededShuffle(PROPORTIONAL.choices, seed);
    expect(shuffled.map((c) => c.id)).not.toEqual(PROPORTIONAL.choices.map((c) => c.id));

    const labels = proportionalButtonLabels(seed);
    // The bug rendered spec.choices verbatim, so the first conclusion button was always "Yes,
    // every ratio is 3" — assert the fix has moved it for this displacing seed.
    expect(labels[0]).not.toBe("Yes, every ratio is 3");
  });

  it("is deterministic: the same seed renders the same order every time", () => {
    const seed = "prl-lesson-x:prl-step-1";
    expect(proportionalButtonLabels(seed)).toEqual(proportionalButtonLabels(seed));
  });

  it("still grades correct when the correct choice is clicked wherever it renders", () => {
    const seed = findDisplacingSeed(PROPORTIONAL.choices, "a", "prl-grade-probe");
    const onChange = vi.fn();
    render(<WidgetView spec={PROPORTIONAL} value={PROPORTIONAL_READY_VALUE} onChange={onChange} disabled={false} seed={seed} />);
    const group = screen.getByRole("group", { name: "Choose the proportional conclusion" });
    const buttons = Array.from(group.querySelectorAll("button"));
    expect(buttons[0].textContent).not.toBe("Yes, every ratio is 3"); // sanity: really displaced
    const correctButton = buttons.find((b) => b.textContent === "Yes, every ratio is 3")!;
    fireEvent.click(correctButton);
    expect(onChange).toHaveBeenCalledWith({ ...PROPORTIONAL_READY_VALUE, choiceId: "a" });
    expect(evaluate(PROPORTIONAL, { ...PROPORTIONAL_READY_VALUE, choiceId: "a" }).correct).toBe(true);
  });
});
