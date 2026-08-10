// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WidgetRenderer, type StageTone } from "./widgets";
import { WidgetSpec, type TPercentChangeLab } from "@/lib/schema";

function fixture(): TPercentChangeLab {
  const parsed = WidgetSpec.parse({
    type: "percentChangeLab",
    prompt: "A $40 backpack is marked down 25%. Which is the sale price?",
    base: 40,
    percent: 25,
    direction: "markdown",
    currency: "$",
    choices: [
      { id: "correct", label: "$30.00", value: 30, feedback: "correct" },
      { id: "change", label: "$10.00", value: 10, feedback: "change only" },
      { id: "decimal", label: "$39.75", value: 39.75, feedback: "decimal error" }
    ],
    fallbackFeedback: "fallback",
    successFeedback: "success"
  });
  if (parsed.type !== "percentChangeLab") throw new Error("bad percent-change fixture");
  return parsed;
}

function Harness({ tone = "neutral", onEvent = vi.fn() }: { tone?: StageTone; onEvent?: (event: unknown) => void }) {
  const [value, setValue] = useState<unknown>(undefined);
  return <WidgetRenderer spec={fixture()} value={value} onChange={setValue} disabled={false} tone={tone} onEvent={onEvent} />;
}
afterEach(cleanup);

describe("Session 138 percentChangeLab interaction", () => {
  it("renders base, percent amount, direction, and three 44px claims", () => {
    render(<Harness />);
    expect(screen.getByText("Base price")).toBeTruthy();
    expect(screen.getAllByText("$40.00").length).toBeGreaterThan(0);
    expect(screen.getByText(/− 25%/)).toBeTruthy();
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    for (const button of buttons) expect(button.className).toContain("min-h-11");
  });

  it("emits away and toward process signals from exact choices", () => {
    const onEvent = vi.fn();
    render(<Harness onEvent={onEvent} />);
    fireEvent.click(screen.getByRole("button", { name: "$10.00" }));
    fireEvent.click(screen.getByRole("button", { name: "$30.00" }));
    expect(onEvent).toHaveBeenNthCalledWith(1, expect.objectContaining({ control: "final-price-claim", dir: "away" }));
    expect(onEvent).toHaveBeenNthCalledWith(2, expect.objectContaining({ control: "final-price-claim", dir: "toward" }));
  });

  it("preserves the learner choice on reveal and adds a separate correct ghost", () => {
    render(<Harness tone="info" />);
    fireEvent.click(screen.getByRole("button", { name: "$10.00" }));
    expect(screen.getByRole("button", { name: "$10.00" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("correct final price: $30.00")).toBeTruthy();
    expect(screen.getByText("Selected $10.00.")).toBeTruthy();
  });

  it("uses labels, operator text, and dashed structure rather than color alone", () => {
    const { container } = render(<Harness />);
    expect(screen.getByText("markdown")).toBeTruthy();
    expect(container.querySelector(".border-dashed")).toBeTruthy();
    expect(screen.getByText(/\$40\.00 − \$10\.00 =/)).toBeTruthy();
  });
});
