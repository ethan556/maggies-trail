// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetSpec, type TCompoundEventLab } from "@/lib/schema";
import { WidgetRenderer, type StageTone } from "./widgets";

const parsed = WidgetSpec.parse({
  type: "compoundEventLab",
  prompt: "Flip heads and roll an even number.",
  mode: "probability",
  stages: [
    { label: "Coin", outcomes: ["H", "T"], favourable: [0] },
    { label: "Die", outcomes: ["1", "2", "3", "4", "5", "6"], favourable: [1, 3, 5] }
  ],
  choices: [
    { id: "correct", label: "1/4", num: 1, den: 4, feedback: "correct" },
    { id: "one-event", label: "1/2", num: 1, den: 2, feedback: "wrong" },
    { id: "one-pair", label: "1/12", num: 1, den: 12, feedback: "wrong" }
  ],
  fallbackFeedback: "Use favourable over total.",
  successFeedback: "correct"
});
if (parsed.type !== "compoundEventLab") throw new Error("bad fixture");
const spec = parsed as TCompoundEventLab;

function Harness({ tone = "neutral" }: { tone?: StageTone }) {
  const [value, setValue] = useState<unknown>(undefined);
  return <WidgetRenderer spec={spec} value={value} onChange={setValue} disabled={false} tone={tone} />;
}

afterEach(cleanup);

describe("compoundEventLab visual interaction", () => {
  it("renders every stage and the complete ordered sample space", () => {
    render(<Harness />);
    expect(screen.getByText("Stage 1")).toBeTruthy();
    expect(screen.getByText("Stage 2")).toBeTruthy();
    expect(screen.getByRole("img", { name: /12 ordered outcomes, 3 favourable/i })).toBeTruthy();
    expect(screen.getByText("2 × 6 = 12")).toBeTruthy();
    expect(screen.getByText("1 × 3 / 2 × 6 = 3/12")).toBeTruthy();
  });

  it("uses keyboard-native 44px exact claim controls", () => {
    render(<Harness />);
    const wrong = screen.getByRole("button", { name: "1/2" });
    expect(wrong.className).toContain("min-h-11");
    fireEvent.click(wrong);
    expect(wrong.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Selected 1/2.")).toBeTruthy();
  });

  it("pairs semantic colour with checks, circles, labels, and borders", () => {
    render(<Harness />);
    expect(screen.getAllByText(/✓/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/○/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Favourable outcomes \/ all outcomes/i)).toBeTruthy();
  });

  it("reveals a dashed target chip without replacing the learner selection", () => {
    render(<Harness tone="info" />);
    const wrong = screen.getByRole("button", { name: "1/12" });
    fireEvent.click(wrong);
    expect(wrong.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("cel-ghost").textContent).toContain("correct claim: 1/4");
  });
});
