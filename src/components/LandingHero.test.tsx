// @vitest-environment jsdom
/**
 * LandingHero — the marketing hero harness (WS-H Phase 2). Confirms the Harness-pattern wiring
 * (local value state + WidgetSpec.parse + evaluate()/canCheck()) actually round-trips through the
 * real, extracted `CovariationScrubberW`, not a mock — the same "mount with real state" discipline
 * `widgets/covariationScrubber.test.tsx` uses.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import LandingHero from "./LandingHero";

afterEach(cleanup);

describe("LandingHero", () => {
  it("mounts with the hero's own copy, already checkable at inputStart", () => {
    render(<LandingHero />);
    expect(screen.getByText("Drag the point until the trip covers 24 miles.")).toBeTruthy();
    expect(screen.getByText("Try it — a real course widget, not a mockup")).toBeTruthy();
    // inputStart=1 is a number the instant the widget's own mount effect fires, so canCheck is
    // already true — no separate "pick a value first" step for a first-time visitor.
    expect((screen.getByRole("button", { name: "Check" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("Check reports the real evaluator's verdict, not a hardcoded string", () => {
    render(<LandingHero />);
    fireEvent.click(screen.getByRole("button", { name: "Check" })); // inputStart=1, target=6
    expect(screen.getByRole("status").textContent).toBe("Not there yet — drag right to cover more miles.");

    fireEvent.change(screen.getByRole("slider"), { target: { value: "6" } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("status").textContent).toBe(
      "6 hours, 24 miles — the table, the graph, and the equation all agree. That's the whole product: one honest state, every representation in sync."
    );
  });

  it("moving the input after a Check clears the stale feedback until the next Check", () => {
    render(<LandingHero />);
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.queryByRole("status")).toBeTruthy();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "3" } });
    expect(screen.queryByRole("status")).toBeNull();
  });
});
