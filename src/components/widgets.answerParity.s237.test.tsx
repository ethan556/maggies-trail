// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { WidgetRenderer } from "./widgets";
import type { TWidget } from "@/lib/schema";

/**
 * S237. Screen-reader parity: the accessible text must not hand a learner a value the visible
 * interface withholds. Both engines below were doing exactly that — the inverse of the usual
 * accessibility failure, and invisible to every existing gate.
 */

const active = { value: null, onChange: () => {}, disabled: false, tone: "neutral" as const };
const srText = () => (document.body.textContent ?? "").replace(/\s+/g, " ");
const ariaText = () =>
  Array.from(document.querySelectorAll("[aria-label]"))
    .map((n) => n.getAttribute("aria-label") ?? "")
    .join(" | ");

afterEach(cleanup);

/** Authored: dop-04-03 — "You pay $10.00 for an item costing $6.75. Build the change." */
const moneyChange = {
  type: "moneyBoard",
  mode: "change",
  prompt: "You pay $10.00 for an item costing $6.75. Build the change from the tray.",
  paidCents: 1000,
  priceCents: 675,
  tray: [
    { cents: 25, label: "quarter", max: 4 },
    { cents: 100, label: "$1", max: 3 },
  ],
  successFeedback: "That is the exact change: three dollars and a quarter, built from the tray.",
} as unknown as TWidget;

/** Authored shape: compose mode states its target in the prompt. */
const moneyCompose = {
  type: "moneyBoard",
  mode: "compose",
  prompt: "How many nickels make 25 cents?",
  targetCents: 25,
  tray: [
    { cents: 5, label: "nickel", max: 5 },
    { cents: 25, label: "quarter", max: 1 },
  ],
  successFeedback: "Five nickels make twenty-five cents, which is one quarter.",
} as unknown as TWidget;

/** Authored: smg1-03-02 — "Count the paperclips the pencil sticks out past the eraser." */
const lengthDifference = {
  type: "lengthCompare",
  mode: "difference",
  prompt: "The bars start in the same place. Count the paperclips the pencil sticks out past the eraser.",
  unitLabel: "paperclips",
  items: [
    { id: "pencil", label: "pencil", length: 5 },
    { id: "eraser", label: "eraser", length: 3 },
  ],
  successFeedback: "Two paperclips of pencil stick out past the end of the eraser.",
} as unknown as TWidget;

describe("S237 answer parity in accessible text", () => {
  it("moneyBoard change mode does not announce the change the learner must compute", () => {
    render(<WidgetRenderer spec={moneyChange} {...active} />);
    const all = srText() + " " + ariaText();
    // The answer is 1000 - 675 = 325 cents. It must not be spoken.
    expect(all).not.toMatch(/target 325/);
    expect(all).not.toMatch(/325 cents/);
    // The two givens the visible receipt shows SHOULD be spoken.
    expect(all).toMatch(/paid 1000 cents/);
    expect(all).toMatch(/cost 675 cents/);
  });

  it("moneyBoard compose mode still announces its target, which the prompt already gives", () => {
    render(<WidgetRenderer spec={moneyCompose} {...active} />);
    expect(srText() + " " + ariaText()).toMatch(/target 25 cents/);
  });

  it("lengthCompare difference mode does not announce the overhang being counted", () => {
    render(<WidgetRenderer spec={lengthDifference} {...active} />);
    const aria = ariaText();
    // The answer is 5 - 3 = 2 paperclips.
    expect(aria).not.toMatch(/overhang is 2/);
    // Both bar lengths stay: a sighted learner sees both bars, so naming them is parity.
    expect(aria).toMatch(/pencil is 5/);
    expect(aria).toMatch(/eraser is 3/);
  });
});
