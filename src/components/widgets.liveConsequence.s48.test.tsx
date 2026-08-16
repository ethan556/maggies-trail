// @vitest-environment jsdom
/**
 * LIVE-CONSEQUENCE CONTRACT (s48) — the honesty anchor for four capability
 * re-ratings (conseq 1→2: buildExpression, dragBucket, matchPairs, dragOrder).
 * Each engine's arrangement must SPEAK as mathematics while being arranged:
 *
 *  · buildExpression — the build reads back live; pure arithmetic shows its
 *    value; a single "=" shows whether the sides balance (never eval()).
 *  · dragBucket — every placement lands the item inside a rendered bucket
 *    with a running count.
 *  · matchPairs — each link materializes as a visible paired claim.
 *  · dragOrder — value orderings are PLOTTED rank-by-size (wrong order = a
 *    visible zigzag); non-numeric sequences read back as a chain.
 *
 * steppedReveal was judged NOT upgradeable (revealing prose is not a model
 * reaction) and keeps conseq 1 — that decision is part of this contract.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import React, { useState } from "react";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function mount(raw: unknown, tone?: "info" | "success" | "error") {
  const spec = WidgetSpec.parse(raw) as TWidget;
  function Host() {
    const [value, setValue] = useState<unknown>(null);
    return <WidgetRenderer spec={spec} value={value} onChange={setValue} disabled={false} tone={tone} />;
  }
  return render(<Host />);
}

afterEach(() => cleanup());

describe("buildExpression reads back live", () => {
  const spec = {
    type: "buildExpression",
    prompt: "Build it.",
    tokens: [
      { id: "t3", label: "3" },
      { id: "tx", label: "×" },
      { id: "t4", label: "4" },
      { id: "teq", label: "=" },
      { id: "t12", label: "12" },
      { id: "t10", label: "10" }
    ],
    correct: ["t3", "tx", "t4"],
    missFeedback: "Check the build.",
    successFeedback: "Built."
  };

  it("shows the reading and the arithmetic value as tokens land", () => {
    mount(spec);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "×" }));
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    const p = screen.getByTestId("be-reading");
    expect(p.textContent).toContain("3 × 4");
    expect(p.textContent).toContain("value 12");
  });

  it("an incomplete build reads but carries no value", () => {
    mount(spec);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "×" }));
    const p = screen.getByTestId("be-reading");
    expect(p.textContent).toContain("3 ×");
    expect(p.textContent).not.toContain("value");
  });

  it("a built equation shows its balance verdict — true and false", () => {
    mount(spec);
    for (const n of ["3", "×", "4", "=", "12"]) fireEvent.click(screen.getByRole("button", { name: n }));
    expect(screen.getByTestId("be-reading").textContent).toContain("both sides equal");
    // swap the RHS: remove 12, add 10
    fireEvent.click(screen.getByRole("button", { name: "Remove 12" }));
    fireEvent.click(screen.getByRole("button", { name: "10" }));
    expect(screen.getByTestId("be-reading").textContent).toContain("the sides differ");
  });

  it("algebraic tokens read back without inventing a value", () => {
    mount({
      ...spec,
      tokens: [
        { id: "a", label: "2x" },
        { id: "b", label: "+" },
        { id: "c", label: "5" }
      ],
      correct: ["a", "b", "c"]
    });
    fireEvent.click(screen.getByRole("button", { name: "2x" }));
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    const p = screen.getByTestId("be-reading");
    expect(p.textContent).toContain("2x + 5");
    expect(p.textContent).not.toContain("value");
  });
});

describe("dragBucket fills visible buckets", () => {
  const spec = {
    type: "dragBucket",
    prompt: "Sort them.",
    buckets: [
      { id: "ev", label: "Even" },
      { id: "od", label: "Odd" }
    ],
    items: [
      { id: "i4", label: "4", bucketId: "ev", feedback: "4 splits into pairs — even." },
      { id: "i7", label: "7", bucketId: "od", feedback: "7 leaves one out — odd." }
    ],
    missFeedback: "Check the sort.",
    successFeedback: "Sorted."
  };

  it("placement moves the item into the rendered bucket and the count follows", () => {
    mount(spec);
    const live = screen.getByTestId("db-live");
    expect(live.textContent).toContain("Even · 0");
    // place "4" into Even
    const group = screen.getByRole("radiogroup", { name: "Where does 4 go?" });
    fireEvent.click(within(group).getByRole("radio", { name: "Even" }));
    expect(live.textContent).toContain("Even · 1");
    expect(within(live).getAllByText("4").length).toBeGreaterThan(0);
  });
});

describe("matchPairs materializes claims", () => {
  it("a link renders as a paired statement, and unlinking removes it", () => {
    mount({
      type: "matchPairs",
      prompt: "Match.",
      left: [
        { id: "l1", label: "349" },
        { id: "l2", label: "251" }
      ],
      right: [
        { id: "r1", label: "between 300 and 400" },
        { id: "r2", label: "between 200 and 300" }
      ],
      pairs: { l1: "r1", l2: "r2" },
      missFeedback: "Check the links.",
      successFeedback: "Matched."
    });
    expect(screen.queryByTestId("mp-live")).toBeNull(); // nothing claimed yet
    fireEvent.click(screen.getByRole("button", { name: "349" }));
    fireEvent.click(screen.getByRole("button", { name: "between 300 and 400" }));
    const live = screen.getByTestId("mp-live");
    expect(live.textContent).toContain("349");
    expect(live.textContent).toContain("between 300 and 400");
  });
});

describe("dragOrder plots the size claim", () => {
  const numeric = {
    type: "dragOrder",
    prompt: "Smallest to largest.",
    items: [
      { id: "a", label: "40" },
      { id: "b", label: "37" },
      { id: "c", label: "39" }
    ],
    correctOrder: ["b", "c", "a"],
    missFeedback: "Check the order.",
    successFeedback: "Ordered."
  };

  /* S242 / ENG-01 R4. THIS ASSERTION WAS CORRECTED, NOT RELAXED. It used to mount with no tone —
   * i.e. during active work — and require the plot to be present. That pinned the leak: measured
   * across the corpus, ALL 54 all-numeric dragOrder instances have a `correctOrder` monotone in the
   * plotted value, so the pre-verdict staircase is the answer and the learner drags until the line
   * stops bending (`reports/eng/ENG01_R4_ORDER_STAIRCASE.csv`).
   *
   * The replacement is stricter: it keeps the re-plot requirement, moves it behind the same
   * `tone === "info"` gate the `do-ghost` reveal in the very same component has always used, and
   * adds a prohibition on the plot appearing before the verdict — the part that was the defect. */
  it("withholds the rank-by-size plot during active work and reads the claim back instead", () => {
    mount(numeric);
    expect(screen.queryByTestId("do-line")).toBeNull();
    // The s48 idea survives: the learner still sees WHAT THEY SAID, just not whether it is sorted.
    expect(screen.getByTestId("do-chain").textContent).toContain("40");
  });

  it("plots the size claim after the verdict, and it re-plots on a move", () => {
    const { container } = mount(numeric, "info");
    expect(screen.getByTestId("do-line")).toBeTruthy();
    const before = container.querySelector('[data-testid="do-line"] polyline')?.getAttribute("points");
    fireEvent.click(screen.getByRole("button", { name: "Move 37 up" }));
    const after = container.querySelector('[data-testid="do-line"] polyline')?.getAttribute("points");
    expect(after).not.toEqual(before); // the claim visibly re-plots
  });

  it("non-numeric sequences read back as a chain instead", () => {
    mount({
      ...numeric,
      items: [
        { id: "a", label: "Pose a question" },
        { id: "b", label: "Collect data" },
        { id: "c", label: "Read the shape" }
      ],
      correctOrder: ["a", "b", "c"]
    });
    expect(screen.queryByTestId("do-line")).toBeNull();
    expect(screen.getByTestId("do-chain").textContent).toContain("Pose a question");
  });
});

describe("the capability table matches these anchors", () => {
  it("conseq=2 for exactly the four upgraded engines; steppedReveal stays 1", () => {
    const caps = JSON.parse(
      readFileSync(join(process.cwd(), "scripts", "engine-capabilities.json"), "utf8")
    ).types as Record<string, { conseq: number }>;
    for (const t of ["buildExpression", "dragBucket", "matchPairs", "dragOrder"]) {
      expect(caps[t].conseq, t).toBe(2);
    }
    expect(caps.steppedReveal.conseq).toBe(1);
  });
});
