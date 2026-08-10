// @vitest-environment jsdom
//
// S206 — ANSWER SURFACES JOIN THE TONE GRAMMAR + THE solveBalance SPOTLIGHT.
//
// Part 1: mcq / numeric / fractionEntry were the last widgets whose feedback lived only in the
// dock while the object on stage stayed unchanged. They now follow the programme grammar pinned
// in widgets.tone.test.tsx:
//   - tone="error" (retry): a corrective cue ON the learner's own answer object — never the
//     correct answer;
//   - tone="info" (revealed): the dashed-tangerine target ghost states the correct answer beside
//     the learner's differing state; the ghost NEVER renders when the learner's value already
//     matches (nothing to contrast);
//   - no tone (quiz/gallery): byte-identical classic rendering, nothing extra.
// Accessible names stay pinned to the authored labels — decorations never rename an option.
//
// Part 2: solveBalance's equation readout became term-addressable. The sentence's text is
// byte-identical to the classic string (s114 pins it too); each term is now a spotlight button
// linking the symbol to the tiles it names, in both directions, alive even when the widget is
// disabled so a revealed state can still be inspected.

import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { WidgetRenderer, type StageTone } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

beforeEach(() => cleanup());

function show(spec: TWidget, value: unknown, tone?: StageTone) {
  return render(
    <WidgetRenderer spec={spec} value={value} onChange={() => {}} disabled={tone === "info"} tone={tone} />
  );
}

const mcq = WidgetSpec.parse({
  type: "mcq",
  prompt: "Which is larger?",
  options: [
    { id: "a", label: "Three fourths", correct: true, feedback: "Yes — 3/4 beats 2/3." },
    { id: "b", label: "Two thirds", correct: false, feedback: "Compare on a common denominator." },
  ],
}) as TWidget;

const num = WidgetSpec.parse({
  type: "numeric",
  prompt: "How many cm?",
  answer: 12,
  tolerance: 0,
  unit: "cm",
  fallbackFeedback: "Count the marked lengths again \u2014 each segment is one centimetre.",
}) as TWidget;

const fe = WidgetSpec.parse({
  type: "fractionEntry",
  prompt: "What fraction is shaded?",
  answerNum: 1,
  answerDen: 2,
  fallbackFeedback: "Count the shaded parts against the total parts.",
}) as TWidget;

describe("mcq tone grammar", () => {
  it("renders nothing extra without a tone", () => {
    show(mcq, "b");
    expect(screen.queryByTestId("mcq-ghost")).toBeNull();
    expect(screen.queryByTestId("mcq-yours")).toBeNull();
  });

  it("retry anchors a berry cue on the chosen option and leaks no answer", () => {
    show(mcq, "b", "error");
    expect(screen.queryByTestId("mcq-ghost")).toBeNull();
    const chosen = screen.getByRole("radio", { name: "Two thirds" });
    expect(chosen.className).toContain("border-berry");
    const other = screen.getByRole("radio", { name: "Three fourths" });
    expect(other.className).not.toContain("border-berry");
    expect(other.className).not.toContain("tangerine");
  });

  it("reveal ghosts the correct option and tags the learner's differing pick", () => {
    show(mcq, "b", "info");
    const ghost = screen.getByTestId("mcq-ghost");
    const correct = screen.getByRole("radio", { name: "Three fourths" });
    expect(correct.contains(ghost)).toBe(true);
    expect(correct.className).toContain("border-dashed");
    const yours = screen.getByTestId("mcq-yours");
    const chosen = screen.getByRole("radio", { name: "Two thirds" });
    expect(chosen.contains(yours)).toBe(true);
  });

  it("reveal with the correct option selected shows the ghost only — no 'your answer' contrast", () => {
    show(mcq, "a", "info");
    expect(screen.getByTestId("mcq-ghost")).toBeTruthy();
    expect(screen.queryByTestId("mcq-yours")).toBeNull();
  });

  it("decorations never change an option's accessible name", () => {
    show(mcq, "b", "info");
    expect(screen.getByRole("radio", { name: "Three fourths" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Two thirds" })).toBeTruthy();
  });
});

describe("numeric tone grammar", () => {
  it("reveal states the correct value (with unit) when the learner's differs", () => {
    show(num, 7, "info");
    expect(screen.getByTestId("num-ghost").textContent).toContain("12 cm");
  });

  it("no ghost when the learner's value already matches the answer", () => {
    show(num, 12, "info");
    expect(screen.queryByTestId("num-ghost")).toBeNull();
  });

  it("retry paints the berry cue on the input itself and shows no ghost", () => {
    show(num, 7, "error");
    expect(screen.getByRole("textbox", { name: "How many cm?" }).className).toContain("border-berry");
    expect(screen.queryByTestId("num-ghost")).toBeNull();
  });

  it("renders nothing extra without a tone", () => {
    show(num, 7);
    expect(screen.queryByTestId("num-ghost")).toBeNull();
    expect(screen.getByRole("textbox", { name: "How many cm?" }).className).not.toContain("border-berry");
  });
});

describe("fractionEntry tone grammar", () => {
  it("reveal states the correct fraction when the entry differs (or is empty)", () => {
    show(fe, null, "info");
    expect(screen.getByTestId("fe-ghost").textContent).toContain("1/2");
  });

  it("no ghost for a VALUE-equivalent entry — 5/10 carries 1/2's value", () => {
    show(fe, { whole: 0, num: 5, den: 10 }, "info");
    expect(screen.queryByTestId("fe-ghost")).toBeNull();
  });
});

describe("solveBalance spotlight", () => {
  const sb = WidgetSpec.parse({
    type: "solveBalance",
    prompt: "Get x alone.",
    a: 3,
    b: 4,
    c: 19,
    successFeedback: "One x-tile alone weighs 5 — so x = 5.",
    unbalancedFeedback: "The beam tipped: that move touched only one pan.",
    notIsolatedFeedback: "The pans still balance, but x is not alone yet.",
    missFeedback: "Check the move against the beam — it is weighing the true x.",
  }) as TWidget;

  it("keeps the sentence byte-identical while making terms addressable", () => {
    show(sb, { leftX: 3, leftUnits: 4, rightUnits: 19 });
    expect(screen.getByTestId("sb-equation").textContent).toBe("3x + 4 = 19");
    expect(screen.getByTestId("sb-term-lx").textContent).toBe("3x");
    expect(screen.getByTestId("sb-term-lu").textContent).toBe("+ 4");
    expect(screen.getByTestId("sb-term-ru").textContent).toBe("19");
  });

  it("pressing a term pins the spotlight onto exactly the tiles it names", () => {
    show(sb, { leftX: 3, leftUnits: 4, rightUnits: 19 });
    fireEvent.click(screen.getByTestId("sb-term-lx"));
    expect(screen.getByTestId("sb-term-lx").getAttribute("aria-pressed")).toBe("true");
    const left = screen.getByTestId("sb-left");
    const lit = Array.from(left.querySelectorAll("button")).filter((b) => b.className.includes("ring-tangerine"));
    expect(lit).toHaveLength(3); // the three x-tiles, nothing else
    expect(lit.every((b) => b.textContent === "x")).toBe(true);
    const right = screen.getByTestId("sb-right");
    expect(right.querySelector(".ring-tangerine, [class*='ring-tangerine']")).toBeNull();
    // second press releases the pin
    fireEvent.click(screen.getByTestId("sb-term-lx"));
    expect(screen.getByTestId("sb-term-lx").getAttribute("aria-pressed")).toBe("false");
  });

  it("hovering a tile lights the term it belongs to — the reverse direction", () => {
    show(sb, { leftX: 3, leftUnits: 4, rightUnits: 19 });
    const unitTile = Array.from(screen.getByTestId("sb-left").querySelectorAll("button")).find(
      (b) => b.textContent === "1"
    )!;
    fireEvent.mouseEnter(unitTile);
    expect(screen.getByTestId("sb-term-lu").className).toContain("ring-tangerine");
    fireEvent.mouseLeave(unitTile);
    expect(screen.getByTestId("sb-term-lu").className).not.toContain("ring-tangerine");
  });

  it("stays inspectable when the widget is disabled (revealed state)", () => {
    render(
      <WidgetRenderer
        spec={sb}
        value={{ leftX: 3, leftUnits: 4, rightUnits: 19 }}
        onChange={() => {}}
        disabled
        tone="info"
      />
    );
    fireEvent.click(screen.getByTestId("sb-term-ru"));
    const lit = Array.from(screen.getByTestId("sb-right").querySelectorAll("button")).filter((b) =>
      b.className.includes("ring-tangerine")
    );
    expect(lit).toHaveLength(19);
  });

  it("a pinned term that empties out drops its spotlight instead of pointing at nothing", () => {
    let latest: unknown = { leftX: 3, leftUnits: 1, rightUnits: 19 };
    const { rerender } = render(
      <WidgetRenderer
        spec={sb}
        value={latest}
        onChange={(v) => {
          latest = v;
        }}
        disabled={false}
      />
    );
    fireEvent.click(screen.getByTestId("sb-term-lu")); // pin the +1 term
    const unitTile = Array.from(screen.getByTestId("sb-left").querySelectorAll("button")).find(
      (b) => b.textContent === "1"
    )!;
    fireEvent.click(unitTile); // take the last unit off
    rerender(
      <WidgetRenderer spec={sb} value={latest} onChange={() => {}} disabled={false} />
    );
    // the term is gone from the sentence and no stale ring remains anywhere
    expect(screen.queryByTestId("sb-term-lu")).toBeNull();
    expect(document.querySelector("[class*='ring-tangerine']")).toBeNull();
  });
});
