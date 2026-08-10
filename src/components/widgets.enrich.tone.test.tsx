// @vitest-environment jsdom
/** Segment-14 enrichments: buildExpression outcome frames + tray ghosts; numberLinePlace marker roles. */
import { cleanup, render } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { WidgetRenderer, type StageTone } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

beforeEach(() => cleanup());

function show(spec: TWidget, value: unknown, tone?: StageTone) {
  return render(<WidgetRenderer spec={spec} value={value} onChange={() => {}} disabled={false} tone={tone} />);
}

const build: TWidget = WidgetSpec.parse({
  type: "buildExpression",
  prompt: "Build 2x + 3.",
  tokens: [
    { id: "a", label: "2x" },
    { id: "b", label: "+" },
    { id: "c", label: "3" }
  ],
  correct: ["a", "b", "c"],
  successFeedback: "That's 2x + 3.",
  missFeedback: "Rebuild it term by term."
});

const nlp: TWidget = WidgetSpec.parse({
  type: "numberLinePlace",
  prompt: "Place 6.",
  min: 0,
  max: 10,
  step: 1,
  tickStep: 1,
  target: 6,
  start: 0,
  successFeedback: "That's 6.",
  lowFeedback: "Higher.",
  highFeedback: "Lower."
});

describe("buildExpression outcome frames (ROLE contract)", () => {
  const frameOf = (c: HTMLElement) => c.querySelector('[aria-label="Your expression"]')!.className;
  it("neutral build row keeps the dashed ink frame", () => {
    const { container } = show(build, ["a"], undefined);
    expect(frameOf(container)).toContain("border-dashed");
  });
  it("success turns the ARRANGEMENT's frame leaf", () => {
    const { container } = show(build, ["a", "b", "c"], "success");
    expect(frameOf(container)).toContain("border-leaf");
  });
  it("error turns the frame berry — never a single tile", () => {
    const { container } = show(build, ["c", "b", "a"], "error");
    expect(frameOf(container)).toContain("border-berry");
    expect(container.querySelectorAll(".bg-berry\\/5").length).toBe(1); // the row, not tiles
  });
  it("a consumed non-reusable tray tile renders as a sky ghost", () => {
    const { container } = show(build, ["a"], undefined);
    const ghost = Array.from(container.querySelectorAll("button")).find((b) =>
      b.className.includes("border-sky/50")
    );
    expect(ghost?.textContent).toBe("2x");
    expect(ghost?.disabled).toBe(true);
  });
});

describe("numberLinePlace marker roles", () => {
  it("the learner's marker is sky (active), not berry", () => {
    const { container } = show(nlp, 4, undefined);
    expect(container.querySelector('[data-testid="nlp-marker"]')!.getAttribute("fill")).toBe("#2E7CD6");
  });
  it("success confirms in leaf", () => {
    const { container } = show(nlp, 6, "success");
    expect(container.querySelector('[data-testid="nlp-marker"]')!.getAttribute("fill")).toBe("#2FA36B");
  });
  it("the error chevron stays berry while the marker stays sky", () => {
    const { container } = show(nlp, 4, "error");
    expect(container.querySelector('[data-testid="nlp-cue"]')!.getAttribute("stroke")).toBe("#D6455D");
    expect(container.querySelector('[data-testid="nlp-marker"]')!.getAttribute("fill")).toBe("#2E7CD6");
  });
});
