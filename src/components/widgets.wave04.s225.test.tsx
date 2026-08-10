// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { evaluate } from "@/lib/evaluate";
import { DerivativeRuleLabSpec, SecantSlopeSpec } from "@/lib/schema";
import { WidgetRenderer } from "./widgets";

describe("Wave 04 batch 2 advanced engine extensions", () => {
  it("keeps u-substitution's x-world and u-world synchronized without stranding x", () => {
    const spec = DerivativeRuleLabSpec.parse({
      type: "derivativeRuleLab",
      mode: "substitution",
      prompt: "Synchronize both worlds.",
      targetInnerRate: 2,
      targetOuterRate: 3,
      startInnerRate: 1,
      startOuterRate: 1,
      requiredMoves: 4,
      successFeedback: "matched",
      explorationFeedback: "explore",
      mechanismFeedback: "match"
    });
    let latest: unknown = null;
    function Host() {
      const [value, setValue] = useState<unknown>(null);
      return <WidgetRenderer spec={spec} value={value} disabled={false} onChange={(next) => { latest = next; setValue(next); }} />;
    }
    render(<Host />);
    const factor = screen.getByRole("slider", { name: "substitution derivative factor" });
    const power = screen.getByRole("slider", { name: "substitution outside power" });
    fireEvent.input(power, { target: { value: "2" } });
    fireEvent.input(factor, { target: { value: "2" } });
    fireEvent.input(power, { target: { value: "4" } });
    fireEvent.input(power, { target: { value: "3" } });
    expect(evaluate(spec, latest).correct).toBe(true);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("no x remains");
    expect(screen.getByText("none")).toBeTruthy();
  });

  it("makes Rolle's equal endpoints, zero secant, and interior flat tangent one state", () => {
    const spec = SecantSlopeSpec.parse({
      type: "secantSlope",
      prompt: "Match the endpoint heights.",
      curve: "square",
      mode: "rolle",
      a: 0,
      shiftX: 2,
      shiftY: -4,
      targetH: 4,
      startH: 1.5,
      successFeedback: "matched",
      lowFeedback: "low",
      highFeedback: "high"
    });
    let latest: unknown = null;
    function Host() {
      const [value, setValue] = useState<unknown>(null);
      return <WidgetRenderer spec={spec} value={value} disabled={false} onChange={(next) => { latest = next; setValue(next); }} />;
    }
    render(<Host />);
    fireEvent.input(screen.getByRole("slider", { name: "Rolle interval right endpoint" }), { target: { value: "4" } });
    expect(evaluate(spec, latest).correct).toBe(true);
    const label = screen.getByRole("img").getAttribute("aria-label") ?? "";
    expect(label).toContain("Endpoint heights are 0 and 0");
    expect(label).toContain("tangent at x 2 has slope 0");
    expect(screen.getByText(/secant slope 0/i)).toBeTruthy();
  });

  it("keeps the new range controls operable from arrow keys", () => {
    const substitution = DerivativeRuleLabSpec.parse({
      type: "derivativeRuleLab",
      mode: "substitution",
      prompt: "Synchronize both worlds.",
      targetInnerRate: 2,
      targetOuterRate: 3,
      startInnerRate: 1,
      startOuterRate: 1,
      requiredMoves: 3,
      successFeedback: "matched",
      explorationFeedback: "explore",
      mechanismFeedback: "match"
    });
    function Host() {
      const [value, setValue] = useState<unknown>(null);
      return <WidgetRenderer spec={substitution} value={value} disabled={false} onChange={setValue} />;
    }
    render(<Host />);
    const factor = screen.getByRole("slider", { name: "substitution derivative factor" });
    const power = screen.getByRole("slider", { name: "substitution outside power" });
    fireEvent.keyDown(factor, { key: "ArrowRight" });
    fireEvent.keyDown(power, { key: "End" });
    fireEvent.keyDown(power, { key: "Home" });
    fireEvent.keyDown(power, { key: "ArrowRight" });
    expect(factor.getAttribute("value")).toBe("2");
    expect(power.getAttribute("value")).toBe("2");
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("integrand is 2 x");
  });
});
