// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CausalMasteryPanel } from "@/components/CausalMasteryPanel";
import type { TStep } from "@/lib/schema";

afterEach(cleanup);

const quadraticStep = {
  id: "i1",
  kind: "interactive",
  body: "Three dials, three jobs.",
  widget: {
    type: "quadraticExplore",
    prompt: "Build y = (x - 2)^2 - 3.",
    targetA: 1,
    targetH: 2,
    targetK: -3,
    aMin: -3,
    aMax: 3,
    hMin: -5,
    hMax: 5,
    kMin: -5,
    kMax: 5,
    aStart: 1,
    hStart: 0,
    kStart: 0,
    gridMax: 8,
    successFeedback: "Correct.",
    shapeFeedback: "Check the shape.",
    vertexFeedback: "Check the vertex."
  },
  cml: {
    stage: "construct",
    flagship: false,
    kernel: "equivalence-transformation",
    actionGoal: "Manipulate the model and track how it represents quadratic vertex form.",
    invariants: ["The graph and equation must stay consistent."],
    misconceptions: ["Changing a visible feature without preserving the relationship."],
    representations: ["graph", "symbolic"],
    translationFrom: "graph",
    translationTo: "symbolic",
    fadeLevel: 0,
    transferFamily: "quadratics:quad-vertex-form",
    delayed: true,
    counterfactualPrompt: "What change would break the relationship?"
  }
} as unknown as TStep;

describe("learner-focused maths connection", () => {
  it("keeps authoring and process metadata off the student screen", () => {
    render(<CausalMasteryPanel step={quadraticStep} value={{ a: 1, h: 2, k: -3 }} />);

    const disclosure = screen.getByRole("button", { name: /see another form/i });
    expect(disclosure.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText(/connected representations/i)).toBeNull();
    expect(screen.queryByText(/do the mathematics/i)).toBeNull();
    expect(screen.queryByText(/what must stay true/i)).toBeNull();
    expect(screen.queryByText(/latest move/i)).toBeNull();
    expect(screen.queryByText(/try a what-if/i)).toBeNull();
    expect(screen.queryByText(/use it again/i)).toBeNull();

    fireEvent.click(disclosure);

    expect(screen.getByRole("tablist", { name: "Choose a mathematical form" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Graph" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Symbolic" })).toBeTruthy();
    expect(screen.queryByText(/connected representations/i)).toBeNull();
    expect(screen.queryByText(/what must stay true/i)).toBeNull();
    expect(screen.queryByText(/transfer/i)).toBeNull();
  });
});
