// @vitest-environment jsdom
/**
 * ACCESSIBILITY AUDIT (s44) — the machine-verifiable backbone of the
 * certification. Together with the keyboard gate (all 81 kinds driven to a
 * correct answer through native controls, with a registry-coverage lock) and
 * the aria-collision lint, this file pins the panel contract:
 *
 *  · every registered kind has an "available actions" description
 *    (verified specifics or the honest default — which the keyboard gate
 *    makes TRUE);
 *  · every DENSE kind (state living in an SVG) narrates its current
 *    mathematical state, target, and relationships via describeWidgetState;
 *  · the on-screen panel renders all three fields — state, actions, and
 *    "before your last change" once the state has changed —
 *    without an aria-live channel (the no-chatter contract).
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import React, { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { SAMPLES } from "@/components/widgetSamples";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { actionsFor, describeWidgetState } from "@/lib/describeState";

const specs = SAMPLES.map((s) => WidgetSpec.parse(s));
const kinds = [...new Set(specs.map((s) => s.type))].sort();

beforeEach(() => cleanup());

describe("available actions", () => {
  it("every registered kind describes how to work it", () => {
    for (const k of kinds) {
      const text = actionsFor(k as TWidget["type"]);
      expect(text.length, k).toBeGreaterThan(40);
      expect(text, k).toMatch(/Tab|slider|button|field|Press|Type|Arrow/i);
    }
  });
});

describe("dense-widget narration", () => {
  it("every kind with a panel narrates numbers, not vibes", () => {
    let dense = 0;
    for (const spec of specs) {
      const d = describeWidgetState(spec, null);
      if (d === null) continue; // controls narrate themselves — the panel contract's other half
      dense++;
      expect(d.length, spec.type).toBeGreaterThan(60); // substantive, not a stub
    }
    expect(dense).toBeGreaterThanOrEqual(38); // the dense set can grow, never silently shrink
  });
});

function Host({ spec }: { spec: TWidget }) {
  const [v, setV] = useState<unknown>(null);
  return <WidgetRenderer spec={spec} value={v} onChange={setV} disabled={false} />;
}

describe("focus persistence (s46 hoist regression)", () => {
  it("a stepper button keeps focus across the value change it causes", () => {
    // Before the s46 hoist, BaseTenStepper was defined per-render: every click
    // REMOUNTED the buttons, and a keyboard user's focus fell to <body> after
    // each press. Module scope preserves node identity — the focused element
    // must be the SAME node after the click re-render.
    const spec = WidgetSpec.parse({
      type: "baseTenCompose", prompt: "Build 34.", target: 34,
      missFeedback: "m", successFeedback: "s"
    }) as TWidget;
    render(<Host spec={spec} />);
    const btn = screen.getByRole("button", { name: "Add a Ones unit" });
    btn.focus();
    fireEvent.click(btn);
    // scope the value check to the stepper's own row — "1" also appears elsewhere
    expect(within(btn.parentElement as HTMLElement).getByText("1")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Add a Ones unit" }));
    expect(document.activeElement).toBe(btn); // …and the node is the SAME one
  });
});

describe("the on-screen panel", () => {
  it("tracks the full lifecycle: state + actions always; before/after across every change", () => {
    const spec = specs.find((s) => s.type === "fractionGrid")!;
    const { container } = render(<Host spec={spec} />);
    let panel = screen.getByTestId("a11y-panel");
    expect(panel.textContent).toContain("What's on screen right now");
    expect(panel.textContent).toContain("How to work it");
    expect(panel.textContent).toContain("row count"); // the verified specific, not the default
    // fractionGrid initializes itself on mount (a real change) — the panel
    // honestly records the pristine description as "before".
    expect(panel.textContent).toContain("Before your last change");
    expect(panel.textContent).toContain("unit square to partition");
    expect(panel.querySelector("[aria-live]")).toBeNull(); // the no-chatter contract

    fireEvent.change(screen.getByLabelText("row count"), { target: { value: "3" } });
    panel = screen.getByTestId("a11y-panel");
    expect(panel.textContent).toContain("3 rows"); // current state moved
    expect(panel.textContent).toContain("1 rows"); // "before" is the state the learner just left
    expect(container.querySelectorAll("[data-testid='a11y-panel']")).toHaveLength(1);
  });
});
