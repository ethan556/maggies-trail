// @vitest-environment jsdom
/** pointEntry live mini-grid — the learner's tuple made visible (dot vs vector arrow),
 * always on screen and directly draggable since S330/CL-P1-057. This file stays focused
 * on what's drawn and when; see widgets.drag.test.tsx for the drag-path coverage
 * ("pointEntry drag") that proves dragging reaches the same graded value as typing. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

beforeEach(() => cleanup());

const point: TWidget = WidgetSpec.parse({
  type: "pointEntry",
  prompt: "Enter (x, y).",
  answer: [-2, 3],
  commonEntries: [
    { values: [3, -2], feedback: "Swapped — x first." },
    { values: [2, 3], feedback: "Check the x-sign." }
  ],
  fallbackFeedback: "Read each move separately."
});
const vec: TWidget = WidgetSpec.parse({
  type: "pointEntry",
  prompt: "Enter the vector.",
  answer: [3, -4],
  delimiter: "angle",
  commonEntries: [
    { values: [-3, 4], feedback: "Reversed." },
    { values: [4, -3], feedback: "Components swapped." }
  ],
  fallbackFeedback: "Tip minus tail, componentwise."
});

function type(name: string, v: string) {
  fireEvent.change(screen.getByRole("textbox", { name }), { target: { value: v } });
}

describe("pointEntry mini-grid preview", () => {
  it("plots the origin before typing, then follows the learner's tuple to the sky dot", () => {
    render(<WidgetRenderer spec={point} value={null} onChange={() => {}} disabled={false} />);
    // The grid is always on screen (S330) — an origin dot, not nothing, is the honest
    // "no entry yet" state: a learner can start from the grid instead of only
    // confirming a typed guess after the fact. R for this spec (answer [-2,3] plus
    // decoys [3,-2] and [2,3]) is 5, so the origin sits at the SVG's exact center, 48,48.
    let dot = document.querySelector("svg circle") as SVGCircleElement | null;
    expect(dot).toBeTruthy();
    expect(dot!.getAttribute("cx")).toBe("48");
    expect(dot!.getAttribute("cy")).toBe("48");
    type("first value", "-2");
    dot = document.querySelector("svg circle");
    expect(dot!.getAttribute("cy")).toBe("48"); // y still unset — only x moved off-center
    expect(dot!.getAttribute("cx")).not.toBe("48");
    type("second value", "3");
    dot = document.querySelector("svg circle");
    expect(dot!.getAttribute("fill")).toBe("#2E7CD6");
    expect(document.querySelectorAll("svg circle").length).toBe(1);
    expect(document.querySelectorAll("svg line").length).toBe(2); // axes only
  });

  it("renders an origin arrow (extra sky line) for the angle delimiter, present even unset", () => {
    render(<WidgetRenderer spec={vec} value={null} onChange={() => {}} disabled={false} />);
    const skyLines = () =>
      Array.from(document.querySelectorAll("svg line")).filter((l) => l.getAttribute("stroke") === "#2E7CD6");
    expect(skyLines().length).toBe(1); // a zero-length vector at the origin, drawn from the start
    type("first value", "3");
    type("second value", "-4");
    expect(skyLines().length).toBe(1);
  });

  it("the grid is a live role=img with a coordinate-accurate label, and drops the drag surface when disabled", () => {
    render(<WidgetRenderer spec={point} value={null} onChange={() => {}} disabled={false} />);
    type("first value", "-2");
    type("second value", "3");
    const svg = document.querySelector("svg") as SVGSVGElement;
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-hidden")).toBeNull();
    expect(svg.getAttribute("aria-label")).toContain("(−2, 3)");
    expect(screen.getByTestId("pe-drag")).toBeTruthy();
    cleanup();
    render(<WidgetRenderer spec={point} value={[-2, 3]} onChange={() => {}} disabled={true} />);
    expect(screen.queryByTestId("pe-drag")).toBeNull();
  });
});
