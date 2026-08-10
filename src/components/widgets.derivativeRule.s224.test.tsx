// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { evaluate } from "@/lib/evaluate";
import { DerivativeRuleLabSpec } from "@/lib/schema";
import { WidgetRenderer } from "./widgets";

const spec = DerivativeRuleLabSpec.parse({
  type: "derivativeRuleLab",
  mode: "quotient",
  prompt: "Set u' = 3 and v' = 1 above v^2.",
  quotientU: 6,
  quotientV: 4,
  targetInnerRate: 3,
  targetOuterRate: 1,
  startInnerRate: 1,
  startOuterRate: 3,
  requiredMoves: 4,
  successFeedback: "6/16",
  explorationFeedback: "explore",
  mechanismFeedback: "match"
});

describe("derivativeRuleLab quotient mode", () => {
  it("derives the ordered numerator and denominator square from learner-controlled rates", () => {
    let latest: unknown = null;
    function Host() {
      const [value, setValue] = useState<unknown>(null);
      return <WidgetRenderer spec={spec} value={value} disabled={false} onChange={(next) => { latest = next; setValue(next); }} />;
    }
    render(<Host />);
    const top = screen.getByRole("slider", { name: "quotient numerator derivative rate" });
    const bottom = screen.getByRole("slider", { name: "quotient denominator derivative rate" });
    fireEvent.change(top, { target: { value: "2" } });
    fireEvent.change(bottom, { target: { value: "2" } });
    fireEvent.change(top, { target: { value: "3" } });
    fireEvent.change(bottom, { target: { value: "1" } });
    expect(evaluate(spec, latest).correct).toBe(true);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("ordered difference is 6");
    expect(screen.getByText("0.375")).toBeTruthy();
  });

  it("keeps reversal visible as a signed consequence rather than color alone", () => {
    render(<WidgetRenderer spec={spec} value={{ h: 1, innerRate: 1, outerRate: 3, moves: 4 }} disabled={false} onChange={() => {}} />);
    expect(screen.getByText("-14")).toBeTruthy();
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("ordered difference is -14");
  });
});
