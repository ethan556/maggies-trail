// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WidgetRenderer, type StageTone } from "./widgets";
import { WidgetSpec, type TSignedFractionLab } from "@/lib/schema";

function fixture(): TSignedFractionLab {
  const parsed = WidgetSpec.parse({
    type: "signedFractionLab",
    prompt: "−3/4 ÷ 1/2 = ?",
    operation: "divide",
    left: { sign: -1, num: 3, den: 4 },
    right: { sign: 1, num: 1, den: 2 },
    form: "any",
    choices: [
      { id: "correct", label: "−3/2", sign: -1, num: 3, den: 2, path: "correct", feedback: "correct" },
      { id: "sign", label: "3/2", sign: 1, num: 3, den: 2, path: "wrongSign", feedback: "sign" },
      { id: "kept", label: "−3/8", sign: -1, num: 3, den: 8, path: "keptDivisor", feedback: "kept" }
    ],
    fallbackFeedback: "fallback",
    successFeedback: "success"
  });
  if (parsed.type !== "signedFractionLab") throw new Error("bad signed-fraction fixture");
  return parsed;
}

function Harness({ tone = "neutral", onEvent = vi.fn() }: { tone?: StageTone; onEvent?: (event: unknown) => void }) {
  const [value, setValue] = useState<unknown>(undefined);
  return <WidgetRenderer spec={fixture()} value={value} onChange={setValue} disabled={false} tone={tone} onEvent={onEvent} />;
}
afterEach(cleanup);

describe("Session 139 signedFractionLab interaction", () => {
  it("renders sign, reciprocal, magnitude, and three keyboard-native 44px claims", () => {
    render(<Harness />);
    expect(screen.getByText("Sign channel")).toBeTruthy();
    expect(screen.getByText("Division transform")).toBeTruthy();
    expect(screen.getAllByText(/reciprocal/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Magnitude channel")).toBeTruthy();
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    for (const button of buttons) expect(button.className).toContain("min-h-11");
  });

  it("preserves the kept-divisor claim without disclosing its diagnosis before Check", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "−3/8" }));
    expect(screen.queryByText("kept unchanged")).toBeNull();
    expect(screen.getAllByText(/reciprocal/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Your exact claim: −3\/8/)).toBeTruthy();
  });

  it("keeps process signals neutral before Check", () => {
    const onEvent = vi.fn();
    render(<Harness onEvent={onEvent} />);
    fireEvent.click(screen.getByRole("button", { name: "3/2" }));
    fireEvent.click(screen.getByRole("button", { name: "−3/2" }));
    expect(onEvent).toHaveBeenNthCalledWith(1, expect.objectContaining({ control: "signed-fraction-claim", dir: "neutral", state: expect.objectContaining({ path: "wrongSign" }) }));
    expect(onEvent).toHaveBeenNthCalledWith(2, expect.objectContaining({ control: "signed-fraction-claim", dir: "neutral", state: expect.objectContaining({ path: "correct" }) }));
  });

  it("preserves the learner claim on reveal and adds a separate correct ghost", () => {
    render(<Harness tone="info" />);
    fireEvent.click(screen.getByRole("button", { name: "−3/8" }));
    expect(screen.getByRole("button", { name: "−3/8" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("correct result: −3/2")).toBeTruthy();
    expect(screen.getAllByText(/Selected .3\/8/).length).toBeGreaterThanOrEqual(1);
  });
});
