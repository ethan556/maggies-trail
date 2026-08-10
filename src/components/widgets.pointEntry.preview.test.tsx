// @vitest-environment jsdom
/** pointEntry live mini-grid — the learner's tuple made visible (dot vs vector arrow). */
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
  it("stays hidden until both slots parse, then plots a sky dot for a point", () => {
    render(<WidgetRenderer spec={point} value={null} onChange={() => {}} disabled={false} />);
    expect(document.querySelectorAll("svg circle").length).toBe(0);
    type("first value", "-2");
    expect(document.querySelectorAll("svg circle").length).toBe(0);
    type("second value", "3");
    const dot = document.querySelector("svg circle");
    expect(dot).toBeTruthy();
    expect(dot!.getAttribute("fill")).toBe("#2E7CD6");
    expect(document.querySelectorAll("svg line").length).toBe(2); // axes only
  });
  it("renders an origin arrow (extra sky line) for the angle delimiter", () => {
    render(<WidgetRenderer spec={vec} value={null} onChange={() => {}} disabled={false} />);
    type("first value", "3");
    type("second value", "-4");
    const skyLines = Array.from(document.querySelectorAll("svg line")).filter(
      (l) => l.getAttribute("stroke") === "#2E7CD6"
    );
    expect(skyLines.length).toBe(1);
  });
});
