// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetSpec, type TScaledCircleLab } from "@/lib/schema";
import { WidgetRenderer, type StageTone } from "./widgets";

function fixture(ask: TScaledCircleLab["ask"], withPlan = false): TScaledCircleLab {
  const realRadius = ask === "realRadius" ? 6 : 4;
  const target = ask === "realRadius" ? realRadius : ask === "circumferenceCoef" ? 2 * realRadius : realRadius * realRadius;
  const wrongBase = ask === "realRadius" ? 3 : realRadius;
  const parsed = WidgetSpec.parse({
    type: "scaledCircleLab",
    prompt: "Use the circle model.",
    ...(withPlan ? { drawingRadius: ask === "realRadius" ? 3 : 2, scale: 2, drawingUnit: "cm", realUnit: "m" } : {}),
    realRadius,
    ask,
    choices: [
      { id: "correct", label: `target ${target}`, value: target, feedback: "Correct." },
      { id: "radius", label: `given ${wrongBase}`, value: wrongBase, feedback: "That uses one given without completing the relationship." },
      { id: "double", label: `double ${target * 2}`, value: target * 2, feedback: "That doubles once too often." }
    ],
    fallbackFeedback: "Use the shown relationship.",
    successFeedback: "Correct."
  });
  if (parsed.type !== "scaledCircleLab") throw new Error("wrong fixture type");
  return parsed;
}

function show(spec: TScaledCircleLab, tone: StageTone, value = "radius") {
  return render(<WidgetRenderer spec={spec} value={value} onChange={() => {}} disabled={false} tone={tone} />);
}

afterEach(cleanup);

describe("S244 scaledCircleLab staged derivation", () => {
  it.each([
    ["circumferenceCoef", false, "2 × 4 = ?", "2 × 4 = 8"],
    ["areaCoef", false, "4 × 4 = ?", "4 × 4 = 16"]
  ] as const)("keeps the radius geometry but gates the %s result (plan=%s)", (ask, withPlan, working, answer) => {
    const spec = fixture(ask, withPlan);
    const view = show(spec, "neutral");
    expect(screen.getByTestId("scl-derivation").textContent).toContain(working);
    expect(screen.getByTestId("scl-derivation").getAttribute("data-result-visible")).toBe("false");
    const circle = screen.getByRole("img", { name: new RegExp(`circle radius ${spec.realRadius}\\.`, "i") });
    expect(circle).toBeTruthy();
    expect(circle.getAttribute("aria-label")).not.toMatch(/meters?/i);
    expect(screen.getByRole("group", { name: "Choose the circle claim" })).toBeTruthy();
    expect(screen.getByTestId("a11y-panel").textContent).toContain("left for you to calculate");
    expect(screen.getByTestId("a11y-panel").textContent).not.toContain("matching the model");

    view.rerender(<WidgetRenderer spec={spec} value="radius" onChange={() => {}} disabled={false} tone="error" />);
    expect(screen.getByTestId("scl-derivation").textContent).toContain(working);
    view.rerender(<WidgetRenderer spec={spec} value="radius" onChange={() => {}} disabled={false} tone="success" />);
    expect(screen.getByTestId("scl-derivation").textContent).toContain(working);
    view.rerender(<WidgetRenderer spec={spec} value="radius" onChange={() => {}} disabled={false} tone="info" />);
    expect(screen.getByTestId("scl-derivation").textContent).toContain(answer);
    expect(screen.getByTestId("scl-derivation").getAttribute("data-result-visible")).toBe("true");
    expect(screen.getByTestId("scl-ghost").textContent).toContain(`target ${spec.ask === "circumferenceCoef" ? 8 : 16}`);
  });

  it("keeps the plan and scale visible while withholding the real radius in text and SVG accessibility", () => {
    const spec = fixture("realRadius", true);
    const view = show(spec, "neutral");
    expect(screen.getByRole("img", { name: /drawing circle radius 3 centimeters/i })).toBeTruthy();
    expect(screen.getByLabelText(/multiply by scale 2 meters per centimeter/i)).toBeTruthy();
    expect(screen.getByRole("img", { name: /real circle.*value to calculate/i })).toBeTruthy();
    expect(screen.queryByRole("img", { name: /real circle radius 6 meters/i })).toBeNull();
    const hiddenRadius = screen.getByRole("img", { name: /real circle.*value to calculate/i });
    expect(hiddenRadius.textContent).toContain("? m");
    expect(hiddenRadius.textContent).not.toContain("6 m");
    expect(screen.getByTestId("scl-derivation").textContent).toContain("3 cm × 2 m/cm = ? m");

    view.rerender(<WidgetRenderer spec={spec} value="radius" onChange={() => {}} disabled={false} tone="info" />);
    expect(screen.getByRole("img", { name: /real circle radius 6 meters/i })).toBeTruthy();
    expect(screen.getByTestId("scl-derivation").textContent).toContain("3 cm × 2 m/cm = 6 m");
    expect(screen.getByTestId("a11y-panel").textContent).toContain("revealed real radius is 6");
  });

  it("withholds the derived radius and final area throughout a two-step plan problem", () => {
    const spec = fixture("areaCoef", true);
    const view = show(spec, "neutral");
    expect(screen.getByRole("img", { name: /drawing circle radius 2 centimeters/i })).toBeTruthy();
    expect(screen.getByLabelText(/multiply by scale 2 meters per centimeter/i)).toBeTruthy();
    const hiddenRadius = screen.getByRole("img", { name: /real circle.*calculate its radius/i });
    expect(hiddenRadius.textContent).toContain("? m");
    expect(hiddenRadius.textContent).not.toContain("4 m");
    expect(screen.getByTestId("scl-derivation").textContent).toContain("2 cm × 2 m/cm = ? m");
    expect(screen.getByTestId("scl-derivation").textContent).toContain("real radius × real radius = ? m²");
    expect(screen.getByTestId("a11y-panel").textContent).toContain("first multiply the drawing radius by the scale");
    expect(screen.getByTestId("a11y-panel").textContent).not.toContain("given real radius is 4");

    view.rerender(<WidgetRenderer spec={spec} value="radius" onChange={() => {}} disabled={false} tone="info" />);
    expect(screen.getByRole("img", { name: /real circle radius 4 meters/i }).textContent).toContain("4 m");
    expect(screen.getByTestId("scl-derivation").textContent).toContain("2 cm × 2 m/cm = 4 m");
    expect(screen.getByTestId("scl-derivation").textContent).toContain("4 m × 4 m = 16 m²");
    expect(screen.getByTestId("a11y-panel").textContent).toContain("revealed real radius is 4");
    expect(screen.getByTestId("a11y-panel").textContent).toContain("revealed area coefficient of pi is 16");
  });

  it("uses the lesson seed to randomize choices reproducibly", () => {
    const spec = fixture("areaCoef");
    const view = render(<WidgetRenderer spec={spec} value={undefined} onChange={() => {}} disabled={false} tone="neutral" seed="lesson:a" />);
    const order = () => Array.from(view.container.querySelectorAll("button[aria-pressed]"), (button) => button.textContent);
    const first = order();
    view.rerender(<WidgetRenderer spec={spec} value={undefined} onChange={() => {}} disabled={false} tone="neutral" seed="lesson:a" />);
    expect(order()).toEqual(first);
    view.rerender(<WidgetRenderer spec={spec} value={undefined} onChange={() => {}} disabled={false} tone="neutral" seed="lesson:b" />);
    expect(order()).not.toEqual(first);
  });

  it("keeps a correct learner claim and avoids a redundant reveal ghost", () => {
    const spec = fixture("areaCoef");
    show(spec, "info", "correct");
    expect(screen.getByRole("button", { name: "target 16" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.queryByTestId("scl-ghost")).toBeNull();
  });
});
