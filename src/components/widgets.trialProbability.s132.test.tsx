// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetSpec, type TTrialProbabilityLab } from "@/lib/schema";
import { WidgetRenderer, type StageTone } from "./widgets";

const parsed = WidgetSpec.parse({
  type: "trialProbabilityLab",
  prompt: "A coin landed heads 6 times in 10 flips. Choose the relative frequency.",
  mode: "experimental",
  favourable: 6,
  total: 10,
  successLabel: "heads",
  totalLabel: "flips",
  outcomes: [],
  referenceNum: 1,
  referenceDen: 2,
  choices: [
    { id: "correct", label: "3/5", num: 3, den: 5, feedback: "correct" },
    { id: "over-rest", label: "6/4", num: 6, den: 4, feedback: "wrong" },
    { id: "theoretical", label: "1/2", num: 1, den: 2, feedback: "wrong" }
  ],
  fallbackFeedback: "Use favourable over all trials.",
  successFeedback: "correct"
});
if (parsed.type !== "trialProbabilityLab") throw new Error("bad fixture");
const spec = parsed as TTrialProbabilityLab;

function Harness({ tone = "neutral" }: { tone?: StageTone }) {
  const [value, setValue] = useState<unknown>(undefined);
  return <WidgetRenderer spec={spec} value={value} onChange={setValue} disabled={false} tone={tone} />;
}

afterEach(cleanup);

describe("trialProbabilityLab visual interaction", () => {
  it("renders fixed evidence and non-color success labels", () => {
    render(<Harness />);
    expect(screen.getByRole("img", { name: /6 heads out of 10 flips/i })).toBeTruthy();
    expect(screen.getByText(/✓ 6 heads/)).toBeTruthy();
    expect(screen.getAllByText(/10 flips/).length).toBeGreaterThanOrEqual(2); // prompt AND fixed evidence caption
  });

  it("uses keyboard-native 44px exact fraction controls", () => {
    render(<Harness />);
    const overRest = screen.getByRole("button", { name: /6\/4/ });
    expect(overRest.className).toContain("min-h-11");
    fireEvent.click(overRest);
    expect(overRest.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText(/6\/4 says 15 favourable out of 10/)).toBeTruthy();
  });

  it("shows learner claim, fixed evidence, and theoretical reference as distinct shapes", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: /1\/2/ }));
    expect(screen.getByTestId("tpl-learner-claim").querySelector("circle")).toBeTruthy();
    expect(screen.getByTestId("tpl-reference").querySelector("path")).toBeTruthy();
    expect(screen.getByText(/evidence 6/)).toBeTruthy();
  });

  it("reveals the target as a dashed ghost without replacing learner work", () => {
    render(<Harness tone="info" />);
    fireEvent.click(screen.getByRole("button", { name: /6\/4/ }));
    expect(screen.getByTestId("tpl-learner-claim")).toBeTruthy();
    expect(screen.getByTestId("tpl-reveal-ghost")).toBeTruthy();
    expect(screen.getByText(/6\/4 says 15 favourable out of 10/)).toBeTruthy();
  });

  it("renders the equally likely outcome space in theoretical mode", () => {
    const theoretical = WidgetSpec.parse({
      ...spec,
      mode: "theoretical",
      favourable: 3,
      total: 6,
      successLabel: "odd faces",
      totalLabel: "faces",
      outcomes: Array.from({ length: 6 }, (_, i) => ({ label: String(i + 1), favourable: i % 2 === 0 })),
      referenceNum: undefined,
      referenceDen: undefined,
      choices: [
        { id: "correct", label: "1/2", num: 1, den: 2, feedback: "correct" },
        { id: "one", label: "1/6", num: 1, den: 6, feedback: "wrong" },
        { id: "rest", label: "3/3", num: 3, den: 3, feedback: "wrong" }
      ]
    });
    if (theoretical.type !== "trialProbabilityLab") throw new Error("bad theoretical fixture");
    render(<WidgetRenderer spec={theoretical} value={undefined} onChange={() => undefined} disabled={false} />);
    expect(screen.getByRole("img", { name: /3 favourable outcomes among 6 equally likely outcomes/i })).toBeTruthy();
    expect(screen.getByText(/✓ favourable: 3/)).toBeTruthy();
  });
});
