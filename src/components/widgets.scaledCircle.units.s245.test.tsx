// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetSpec, type TScaledCircleLab } from "@/lib/schema";
import { WidgetRenderer } from "./widgets";

const lesson = (course: string, id: string) => JSON.parse(readFileSync(
  join(process.cwd(), "content", "courses", course, "lessons", `${id}.json`),
  "utf8",
)) as { steps: Array<{ id: string; widget?: unknown }> };

const widget = (course: string, lessonId: string, stepId: string): TScaledCircleLab => {
  const raw = lesson(course, lessonId).steps.find((step) => step.id === stepId)?.widget;
  const parsed = WidgetSpec.parse(raw);
  if (parsed.type !== "scaledCircleLab") throw new Error(`${lessonId}/${stepId}: wrong widget`);
  return parsed;
};

const show = (spec: TScaledCircleLab, tone: "neutral" | "info" = "neutral") => render(
  <WidgetRenderer spec={spec} value="wrong-1" onChange={() => {}} disabled={false} tone={tone} seed="s245-units" />,
);

afterEach(cleanup);

describe("S245 scaledCircleLab visible and accessible units", () => {
  it.each(["i1", "i2", "i3"])("keeps circle-theorems %s unit-neutral", (stepId) => {
    const spec = widget("circle-theorems", "cr-06-01", stepId);
    const view = show(spec);
    const circle = screen.getByRole("img", { name: new RegExp(`circle radius ${spec.realRadius}\\.`, "i") });
    expect(circle.getAttribute("aria-label")).not.toMatch(/meters?|centimeters?/i);
    expect(circle.textContent).toBe(String(spec.realRadius));
    expect(screen.getByTestId("scl-derivation").textContent).not.toMatch(/\b(?:cm|m|m²)\b/);
    expect(screen.getByTestId("a11y-panel").textContent).not.toMatch(/meters?|centimeters?/i);
    view.rerender(<WidgetRenderer spec={spec} value="wrong-1" onChange={() => {}} disabled={false} tone="info" seed="s245-units" />);
    expect(screen.getByTestId("scl-derivation").textContent).not.toMatch(/\b(?:cm|m|m²)\b/);
    expect(screen.getByTestId("a11y-panel").textContent).not.toMatch(/meters?|centimeters?/i);
  });

  it("shows and speaks the full centimetre-to-metre radius chain", () => {
    const spec = widget("geometry-g7", "g7-04-03", "i1");
    const view = show(spec);
    expect(screen.getByRole("img", { name: /drawing circle radius 3 centimeters/i }).textContent).toContain("3 cm");
    expect(screen.getByLabelText(/multiply by scale 2 meters per centimeter/i).textContent).toContain("× 2 m/cm");
    const hidden = screen.getByRole("img", { name: /real circle.*value to calculate/i });
    expect(hidden.textContent).toContain("? m");
    expect(screen.getByTestId("scl-derivation").textContent).toContain("3 cm × 2 m/cm = ? m");
    expect(screen.getByTestId("a11y-panel").textContent).toContain("3 centimeters");
    expect(screen.getByTestId("a11y-panel").textContent).toContain("2 meters per centimeter");
    view.rerender(<WidgetRenderer spec={spec} value="wrong-1" onChange={() => {}} disabled={false} tone="info" seed="s245-units" />);
    expect(screen.getByRole("img", { name: /real circle radius 6 meters/i }).textContent).toContain("6 m");
    expect(screen.getByTestId("scl-derivation").textContent).toContain("3 cm × 2 m/cm = 6 m");
  });

  it("uses linear metres for circumference and square metres for area", () => {
    const circumference = widget("geometry-g7", "g7-04-03", "k1");
    const circumferenceView = show(circumference);
    expect(screen.getByRole("img", { name: /circle radius 6 meters/i }).textContent).toContain("6 m");
    expect(screen.getByTestId("scl-derivation").textContent).toContain("2 × 6 m = ? m");
    circumferenceView.rerender(<WidgetRenderer spec={circumference} value="wrong-1" onChange={() => {}} disabled={false} tone="info" seed="s245-units" />);
    expect(screen.getByTestId("scl-derivation").textContent).toContain("2 × 6 m = 12 m");
    cleanup();

    const area = widget("geometry-g7", "g7-04-03", "i2");
    const areaView = show(area);
    expect(screen.getByRole("img", { name: /circle radius 6 meters/i }).textContent).toContain("6 m");
    expect(screen.getByTestId("scl-derivation").textContent).toContain("6 m × 6 m = ? m²");
    areaView.rerender(<WidgetRenderer spec={area} value="wrong-1" onChange={() => {}} disabled={false} tone="info" seed="s245-units" />);
    expect(screen.getByTestId("scl-derivation").textContent).toContain("6 m × 6 m = 36 m²");
    expect(screen.getByTestId("a11y-panel").textContent).toContain("36 square meters");
  });

  it("keeps both units truthful through the two-stage area challenge", () => {
    const spec = widget("geometry-g7", "g7-04-03", "ch1");
    const view = show(spec);
    expect(screen.getByTestId("scl-derivation").textContent).toContain("2 cm × 2 m/cm = ? m");
    expect(screen.getByTestId("scl-derivation").textContent).toContain("real radius × real radius = ? m²");
    view.rerender(<WidgetRenderer spec={spec} value="wrong-1" onChange={() => {}} disabled={false} tone="info" seed="s245-units" />);
    expect(screen.getByTestId("scl-derivation").textContent).toContain("2 cm × 2 m/cm = 4 m");
    expect(screen.getByTestId("scl-derivation").textContent).toContain("4 m × 4 m = 16 m²");
    expect(screen.getByTestId("a11y-panel").textContent).toContain("16 square meters");
  });
});
