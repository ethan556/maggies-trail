// @vitest-environment jsdom
/**
 * S116 enhancement (i) — numberLinePlace.showDistanceFromZero.
 *
 * Absolute value is taught as "drop the sign" and then misapplied, because position and distance
 * are never shown as two DIFFERENT numbers about the same marker. This pins that they are: the
 * readout must track |v|, must stay non-negative across zero, and must reach screen-reader users
 * through aria-valuetext rather than being a sighted-only fact.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "@/lib/schema";

afterEach(cleanup);

const base = {
  type: "numberLinePlace" as const,
  prompt: "Place the marker at -7.",
  min: -10,
  max: 10,
  step: 1,
  tickStep: 1,
  target: -7,
  start: 0,
  showDistanceFromZero: true,
  commonPlacements: [],
  successFeedback: "s",
  lowFeedback: "l",
  highFeedback: "h"
};

function mount(spec: TWidget) {
  function Host() {
    const [v, setV] = useState<unknown>(null);
    return <WidgetRenderer spec={spec} value={v} onChange={setV} disabled={false} />;
  }
  return render(<Host />);
}

describe("numberLinePlace: distance from zero", () => {
  it("reports |v|, not v — and stays non-negative on both sides of zero", () => {
    mount(WidgetSpec.parse(base) as TWidget);
    const slider = screen.getByLabelText("marker position");

    fireEvent.change(slider, { target: { value: "-7" } });
    expect(screen.getByTestId("nlp-distance").textContent).toContain("7");

    // The sign flips; the distance does not. This is the whole point of the readout.
    fireEvent.change(slider, { target: { value: "7" } });
    expect(screen.getByTestId("nlp-distance").textContent).toContain("7");

    fireEvent.change(slider, { target: { value: "0" } });
    expect(screen.getByTestId("nlp-distance").textContent).toContain("0");

    // Never renders a negative distance anywhere on the line.
    for (const v of [-10, -3, 5, 10]) {
      fireEvent.change(slider, { target: { value: String(v) } });
      expect(screen.getByTestId("nlp-distance").textContent).not.toMatch(/-|\u2212/);
    }
  });

  it("carries the distance in aria-valuetext, so it is not a sighted-only fact", () => {
    mount(WidgetSpec.parse(base) as TWidget);
    const slider = screen.getByLabelText("marker position");
    fireEvent.change(slider, { target: { value: "-7" } });
    expect(slider.getAttribute("aria-valuetext")).toMatch(/distance from zero 7/);
  });

  it("is absent unless asked for, so every other number line is unchanged", () => {
    mount(WidgetSpec.parse({ ...base, showDistanceFromZero: undefined }) as TWidget);
    expect(screen.queryByTestId("nlp-distance")).toBeNull();
  });

  it("integrity refuses it where position and distance could never differ", () => {
    // A line that never goes below zero: the two readouts would always agree, which quietly
    // implies they are the same thing — the exact confusion the flag exists to break.
    const nonNeg = WidgetSpec.parse({ ...base, min: 0, target: 7 });
    expect(widgetIntegrityErrors(nonNeg).join(" ")).toMatch(/reaches below zero/);

    // And on a fraction line, where "distance from zero" is just the position again.
    const frac = WidgetSpec.parse({
      ...base, min: 0, max: 6, step: 1, tickStep: 1, target: 2, start: 0, fractionDen: 6
    });
    expect(widgetIntegrityErrors(frac).join(" ")).toMatch(/no meaning on a fraction line/);
  });

  it("the shipped lesson uses it on a line that actually crosses zero", async () => {
    const { readFileSync } = await import("node:fs");
    const doc = JSON.parse(
      readFileSync("content/courses/number-system/lessons/ns-05-01.json", "utf8")
    );
    const step = doc.steps.find((s: { id: string }) => s.id === "i1");
    expect(step.widget.type).toBe("numberLinePlace");
    expect(step.widget.showDistanceFromZero).toBe(true);
    expect(step.widget.min).toBeLessThan(0);
    expect(widgetIntegrityErrors(WidgetSpec.parse(step.widget))).toEqual([]);
    // The authored predict survived the conversion.
    expect(step.predict).toBeTruthy();
  });
});
