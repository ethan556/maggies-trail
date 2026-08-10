// @vitest-environment jsdom
//
// S207 — THE LAST THREE STATIC ANSWER SURFACES JOIN THE TONE GRAMMAR.
//
// pointEntry / radicalCheck / subitizeFlash follow the programme grammar pinned in
// widgets.tone.test.tsx and extended in widgets.answerSurface.tone.s206.test.tsx:
//   - tone="error" (retry): a corrective berry cue ON the learner's own answer object —
//     never the correct answer;
//   - tone="info" (revealed): the dashed-tangerine target ghost states the correct answer
//     beside the learner's differing state; for value surfaces (pointEntry, radicalCheck)
//     the ghost NEVER renders when the learner's value already matches; for the option
//     surface (subitizeFlash) the ghost marks the true count and a berry "yours" contrast
//     marks a differing pick, mirroring mcq;
//   - no tone (quiz/gallery): byte-identical classic rendering, nothing extra.
// Accessible names stay pinned to the authored labels — decorations never rename a control.
//
// Expected values below are derived independently, never from the implementation:
//   radicalCheck uses √(x + 6) = x, whose genuine solution is x = 3 (√9 = 3) and whose
//   squaring-invented phantom is x = −2 (squared: −2 + 6 = 4 = (−2)²  ✓; original:
//   √4 = 2 ≠ −2  ✗).

import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { WidgetRenderer, type StageTone } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

beforeEach(() => cleanup());

function show(spec: TWidget, value: unknown, tone?: StageTone) {
  return render(
    <WidgetRenderer spec={spec} value={value} onChange={() => {}} disabled={tone === "info"} tone={tone} />
  );
}

const pe = WidgetSpec.parse({
  type: "pointEntry",
  prompt: "Where does the line cross?",
  answer: [3, -4],
  fallbackFeedback: "Trace each coordinate from the axes again.",
}) as TWidget;

const rc = WidgetSpec.parse({
  type: "radicalCheck",
  prompt: "Which candidate really solves it?",
  inside: 6,
  target: 3,
  extraneous: -2,
  successFeedback: "3 satisfies both the squared and the original equation.",
  extraneousFeedback: "That candidate passes the squared equation and fails the original.",
  missFeedback: "Check both verdict panels for this candidate.",
}) as TWidget;

const sf = WidgetSpec.parse({
  type: "subitizeFlash",
  prompt: "How many dots?",
  count: 5,
  options: [4, 5, 6],
  missFeedback: "Flash again and look for a group you know.",
  successFeedback: "Five — the dice pattern of four plus one in the middle.",
}) as TWidget;

describe("pointEntry tone grammar", () => {
  it("renders nothing extra without a tone", () => {
    show(pe, [3, 4]);
    expect(screen.queryByTestId("pe-ghost")).toBeNull();
    expect(screen.getByRole("textbox", { name: "first value" }).className).not.toContain("border-berry");
    expect(screen.getByRole("textbox", { name: "second value" }).className).not.toContain("border-berry");
  });

  it("retry paints the berry cue on the learner's own fields and leaks no answer", () => {
    show(pe, [3, 4], "error");
    expect(screen.getByRole("textbox", { name: "first value" }).className).toContain("border-berry");
    expect(screen.getByRole("textbox", { name: "second value" }).className).toContain("border-berry");
    expect(screen.queryByTestId("pe-ghost")).toBeNull();
    expect(document.body.textContent).not.toContain("\u22124"); // the correct y never appears at retry
  });

  it("reveal states the correct tuple in the ghost when the learner's differs", () => {
    show(pe, [3, 4], "info");
    expect(screen.getByTestId("pe-ghost").textContent).toContain("(3, \u22124)");
  });

  it("no ghost when the learner's tuple already matches the answer", () => {
    show(pe, [3, -4], "info");
    expect(screen.queryByTestId("pe-ghost")).toBeNull();
  });

  it("decorations never change a slot's accessible name", () => {
    show(pe, [3, 4], "info");
    expect(screen.getByRole("textbox", { name: "first value" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "second value" })).toBeTruthy();
  });
});

describe("radicalCheck tone grammar", () => {
  it("renders nothing extra without a tone", () => {
    show(rc, -2);
    expect(screen.queryByTestId("rc-ghost")).toBeNull();
    const slider = screen.getByRole("slider", { name: "candidate value" });
    expect(slider.className).toContain("accent-sky");
    expect(slider.className).not.toContain("accent-berry");
  });

  it("retry moves the berry cue onto the candidate control and shows no ghost", () => {
    show(rc, -2, "error");
    expect(screen.getByRole("slider", { name: "candidate value" }).className).toContain("accent-berry");
    expect(screen.queryByTestId("rc-ghost")).toBeNull();
  });

  it("reveal states the genuine solution when the candidate differs", () => {
    show(rc, -2, "info");
    expect(screen.getByTestId("rc-ghost").textContent).toContain("x = 3");
  });

  it("no ghost when the candidate already sits on the target", () => {
    show(rc, 3, "info");
    expect(screen.queryByTestId("rc-ghost")).toBeNull();
  });

  it("decorations never change the slider's accessible name", () => {
    show(rc, -2, "error");
    expect(screen.getByRole("slider", { name: "candidate value" })).toBeTruthy();
  });
});

describe("subitizeFlash tone grammar", () => {
  it("renders nothing extra without a tone, and keeps the dots hidden pre-flash", () => {
    show(sf, 4);
    expect(screen.queryByTestId("szf-ghost")).toBeNull();
    expect(screen.queryByTestId("szf-yours")).toBeNull();
    expect(screen.getByRole("img", { name: "dots hidden" })).toBeTruthy();
  });

  it("retry anchors the berry cue on the chosen count and leaks no answer", () => {
    show(sf, 4, "error");
    const chosen = screen.getByRole("radio", { name: "4" });
    expect(chosen.className).toContain("border-berry");
    const truth = screen.getByRole("radio", { name: "5" });
    expect(truth.className).not.toContain("tangerine");
    expect(screen.queryByTestId("szf-ghost")).toBeNull();
  });

  it("reveal ghosts the true count, tags the differing pick, and holds the dots visible", () => {
    show(sf, 4, "info");
    const ghost = screen.getByTestId("szf-ghost");
    expect(ghost.textContent).toBe("5");
    expect(ghost.className).toContain("border-dashed");
    expect(ghost.className).toContain("border-tangerine");
    const yours = screen.getByTestId("szf-yours");
    expect(yours.textContent).toBe("4");
    expect(yours.className).toContain("border-berry");
    // a revealed subitizing task must finally let the learner count the pattern
    expect(screen.getByRole("img", { name: "5 dots" })).toBeTruthy();
  });

  it("reveal with the true count selected shows the ghost only — no 'yours' contrast", () => {
    show(sf, 5, "info");
    expect(screen.getByTestId("szf-ghost")).toBeTruthy();
    expect(screen.queryByTestId("szf-yours")).toBeNull();
  });

  it("decorations never change an option's accessible name", () => {
    show(sf, 4, "info");
    expect(screen.getByRole("radio", { name: "4" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "5" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "6" })).toBeTruthy();
  });
});
