// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { evaluate } from "@/lib/evaluate";
import { WidgetSpec, type TDistributionCompareLab } from "@/lib/schema";
import { WidgetRenderer, type StageTone } from "./widgets";

const parsed = WidgetSpec.parse({
  type: "distributionCompareLab",
  prompt: "Which conclusion is supported by the overlap?",
  mode: "judge",
  gapUnits: 4,
  judgeOptions: [
    { id: "supported", label: "Little overlap", correct: true, feedback: "The four-width gap supports little overlap." },
    { id: "heavy", label: "Heavy overlap", feedback: "A four-width gap leaves little overlap, not heavy overlap." },
    { id: "identical", label: "Identical groups", feedback: "Separated means do not describe identical groups." }
  ],
  successFeedback: "The distributions have little overlap."
});
if (parsed.type !== "distributionCompareLab") throw new Error("bad distribution judge fixture");
const spec = parsed as TDistributionCompareLab;

function ChoiceHarness({ seed, tone = "neutral" }: { seed: string; tone?: StageTone }) {
  const [value, setValue] = useState<unknown>(undefined);
  return <WidgetRenderer spec={spec} value={value} onChange={setValue} disabled={false} tone={tone} seed={seed} />;
}

function order(): string[] {
  return within(screen.getByRole("group", { name: "Choose the conclusion supported by the overlap" }))
    .getAllByRole("button")
    .map((button) => button.textContent ?? "");
}

afterEach(cleanup);

describe("S243 distribution judge choice-order canary", () => {
  it("moves the correct conclusion across positions over different question seeds", () => {
    const positions = new Set<number>();
    for (let i = 0; i < 18; i++) {
      const view = render(<ChoiceHarness seed={`lesson:step:${i}`} />);
      positions.add(order().indexOf("Little overlap"));
      view.unmount();
    }
    expect(positions.size).toBeGreaterThan(1);
    expect([...positions].every((position) => position >= 0 && position < 3)).toBe(true);
  });

  it("keeps one seed stable through rerender and retry tone", () => {
    const view = render(<ChoiceHarness seed="sp-02-02:i2" />);
    const first = order();
    fireEvent.click(screen.getByRole("button", { name: "Heavy overlap" }));
    view.rerender(<ChoiceHarness seed="sp-02-02:i2" tone="error" />);
    expect(order()).toEqual(first);
    expect(screen.getByRole("button", { name: "Heavy overlap" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("submits stable IDs, so correctness and diagnostic feedback are independent of display order", () => {
    const onChange = vi.fn();
    render(<WidgetRenderer spec={spec} value={undefined} onChange={onChange} disabled={false} seed="feedback-seed" />);

    fireEvent.click(screen.getByRole("button", { name: "Heavy overlap" }));
    expect(onChange).toHaveBeenLastCalledWith("heavy");
    expect(evaluate(spec, "heavy")).toEqual({
      correct: false,
      feedback: "A four-width gap leaves little overlap, not heavy overlap."
    });

    fireEvent.click(screen.getByRole("button", { name: "Little overlap" }));
    expect(onChange).toHaveBeenLastCalledWith("supported");
    expect(evaluate(spec, "supported")).toEqual({
      correct: true,
      feedback: "The four-width gap supports little overlap."
    });
  });

  it("uses the shuffled DOM order as native keyboard order with no tabindex override", () => {
    render(<ChoiceHarness seed="keyboard-seed" />);
    const buttons = within(screen.getByRole("group", { name: "Choose the conclusion supported by the overlap" }))
      .getAllByRole("button");
    expect(buttons.map((button) => button.textContent)).toEqual(order());
    for (const button of buttons) {
      expect(button.tagName).toBe("BUTTON");
      expect(button.getAttribute("type")).toBe("button");
      expect(button.hasAttribute("tabindex")).toBe(false);
      button.focus();
      expect(document.activeElement).toBe(button);
    }
  });
});
