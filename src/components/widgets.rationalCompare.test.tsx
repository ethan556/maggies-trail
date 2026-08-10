// @vitest-environment jsdom
/** rationalCompare renderer — operand cards, relation slot, structural cue roles. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { WidgetRenderer, type StageTone } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

beforeEach(() => cleanup());

const spec = (over: Record<string, unknown> = {}): TWidget =>
  WidgetSpec.parse({
    type: "rationalCompare",
    prompt: "Compare: 1/12 __ 11/12",
    left: { num: 1, den: 12 },
    right: { num: 11, den: 12 },
    answer: "lt",
    gtFeedback: "Twelfths are the same size — 11 of them beat 1.",
    eqFeedback: "Same-size parts, different counts — not equal.",
    successFeedback: "Yes — same-size parts, so the counts decide it.",
    ...over
  });

function show(s: TWidget, value: unknown, tone?: StageTone) {
  return render(<WidgetRenderer spec={s} value={value} onChange={() => {}} disabled={false} tone={tone} />);
}

describe("rationalCompare renderer", () => {
  it("renders both operands as labelled cards (fractions and scalars)", () => {
    show(spec({ right: { value: "0.5" }, answer: "lt", gtFeedback: "g", eqFeedback: "e" }), null);
    expect(screen.getByRole("img", { name: "1/12" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "0.5" })).toBeTruthy();
  });
  it("story captions join the card's accessible name", () => {
    show(
      spec({
        left: { value: "-120" },
        right: { value: "-80" },
        leftLabel: "Submarine",
        rightLabel: "Fish",
        answer: "lt",
        gtFeedback: "g",
        eqFeedback: "e"
      }),
      null
    );
    expect(screen.getByRole("img", { name: "Submarine: -120" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Fish: -80" })).toBeTruthy();
  });
  it("symbol buttons form a radiogroup and report the selection", () => {
    const changes: unknown[] = [];
    render(<WidgetRenderer spec={spec()} value={null} onChange={(v) => changes.push(v)} disabled={false} />);
    fireEvent.click(screen.getByRole("radio", { name: "less than" }));
    expect(changes).toEqual(["lt"]);
  });
  it("the slot announces the chosen relation for screen readers", () => {
    const { container } = show(spec(), "lt");
    expect(container.textContent).toContain("chosen symbol: less than");
    expect(screen.getByRole("radio", { name: "less than" }).getAttribute("aria-checked")).toBe("true");
  });
  it("same-denominator wrong pick lights the counts berry with the cue", () => {
    const { container } = show(spec(), "gt", "error");
    expect(container.querySelector(".ring-berry")).toBeTruthy();
    expect(container.textContent).toContain("the parts are the same size — look at the counts");
  });
  it("same-denominator success confirms the counts in leaf", () => {
    const { container } = show(spec(), "lt", "success");
    expect(container.querySelector(".ring-leaf")).toBeTruthy();
    expect(container.querySelector(".ring-berry")).toBeFalsy();
    expect(container.textContent).toContain("the counts decided it");
  });
  it("same-numerator pairs cue the part sizes instead", () => {
    const s = spec({
      left: { num: 1, den: 3 },
      right: { num: 1, den: 2 },
      answer: "lt",
      gtFeedback: "Thirds are smaller than halves.",
      eqFeedback: "Same count, different sizes."
    });
    const { container } = show(s, "gt", "error");
    expect(container.textContent).toContain("the counts match — look at the sizes of the parts");
  });
  it("a both-negative pair cues the signs (below zero) on a wrong pick", () => {
    const s = spec({
      left: { value: "-3" },
      right: { value: "-8" },
      answer: "gt",
      gtFeedback: undefined,
      ltFeedback: "Colder means smaller — but which IS smaller?",
      eqFeedback: "They differ."
    });
    const { container } = show(s, "lt", "error");
    expect(container.textContent).toContain("both are below zero");
    expect(container.querySelector(".ring-berry")).toBeTruthy();
  });
  it("an exactly-equal pair on success says they name the same value, with no marks", () => {
    const s = spec({
      left: { num: 3, den: 4 },
      right: { value: "0.75" },
      answer: "eq",
      gtFeedback: "g",
      eqFeedback: undefined,
      ltFeedback: "l"
    });
    const { container } = show(s, "eq", "success");
    expect(container.textContent).toContain("they name the same value");
    expect(container.querySelector(".ring-leaf")).toBeFalsy();
  });
  it("disabled freezes every symbol button", () => {
    render(<WidgetRenderer spec={spec()} value={"lt"} onChange={() => {}} disabled={true} />);
    for (const name of ["less than", "equal to", "greater than"]) {
      expect((screen.getByRole("radio", { name }) as HTMLButtonElement).disabled).toBe(true);
    }
  });
});
