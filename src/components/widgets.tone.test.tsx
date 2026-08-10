// @vitest-environment jsdom
//
// TONE-AWARE MODEL FEEDBACK ("errors must teach" / "reveal shows the state").
//
// The lesson player paints a StageTone onto the widget; tone-aware engines
// respond ON THE MATHEMATICAL MODEL:
//   - tone="info"  (revealed): a dashed tangerine TARGET GHOST contrasts the
//     correct state with wherever the learner's state stayed;
//   - tone="error" (retry): a corrective cue — direction only, never the
//     distance or the answer (numberLinePlace's chevron is the exemplar);
//   - any other tone (or none, as on quiz surfaces): NOTHING extra renders,
//     and a ghost never appears while the learner is still working.
//
// Also pinned: a ghost never renders when the learner's state already equals
// the target (nothing to contrast), and the end-to-end plumbing — the REAL
// LessonPlayer reaching the revealed phase makes a ghost appear on stage.

import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { WidgetRenderer, type StageTone } from "./widgets";
import LessonPlayer from "./LessonPlayer";
import { Lesson, type TLesson, type TWidget, WidgetSpec } from "@/lib/schema";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

function show(spec: TWidget, value: unknown, tone?: StageTone) {
  return render(
    <WidgetRenderer spec={spec} value={value} onChange={() => {}} disabled={tone === "info"} tone={tone} />
  );
}

const line: TWidget = {
  type: "lineExplore",
  prompt: "Build y = 2x + 1.",
  targetSlope: 2,
  targetIntercept: 1,
  slopeMin: -4,
  slopeMax: 4,
  interceptMin: -5,
  interceptMax: 5,
  slopeStart: 0,
  interceptStart: 0,
  gridMax: 6,
  successFeedback: "That's y = 2x + 1 — slope 2 climbs from the intercept at 1.",
  slopeFeedback: "The tilt is off — the rise over one run must be 2.",
  interceptFeedback: "The crossing is off — the line must meet the y-axis at 1."
};

const nlp = WidgetSpec.parse({
  type: "numberLinePlace",
  prompt: "Place 6.",
  min: 0,
  max: 10,
  step: 1,
  tickStep: 1,
  target: 6,
  start: 0,
  successFeedback: "That's 6 — six steps from zero.",
  lowFeedback: "Too far left — count up from zero.",
  highFeedback: "Too far right — count back toward zero."
}) as TWidget;

describe("reveal ghosts (tone='info')", () => {
  it("lineExplore draws the dashed target line only when revealed and off-target", () => {
    show(line, { m: 3, b: 0 }, "info");
    expect(screen.getByTestId("le-ghost")).toBeTruthy();
    expect(screen.getByText("target")).toBeTruthy();
    cleanup();
    show(line, { m: 3, b: 0 }); // no tone (quiz surface / working) → no ghost
    expect(screen.queryByTestId("le-ghost")).toBeNull();
    cleanup();
    show(line, { m: 3, b: 0 }, "error"); // retry never previews the answer
    expect(screen.queryByTestId("le-ghost")).toBeNull();
  });

  it("lineExplore draws no ghost when the learner's line IS the target (nothing to contrast)", () => {
    show(line, { m: 2, b: 1 }, "info");
    expect(screen.queryByTestId("le-ghost")).toBeNull();
  });

  const absLine = WidgetSpec.parse({
    type: "absValueLine",
    prompt: "Which is farther from zero: -2 or -8?",
    items: [
      { id: "a", value: -8, label: "-8" },
      { id: "b", value: -2, label: "-2", feedback: "-8 is 8 steps away; -2 only 2." }
    ],
    answerId: "a",
    equalLabel: "Same distance",
    equalFeedback: "|-8| = 8 and |-2| = 2 differ.",
    missFeedback: "Compare the two bracket lengths.",
    successFeedback: "Right — |-8| = 8 beats |-2| = 2."
  }) as TWidget;

  it("absValueLine ghosts the farthest operand only when revealed and mis-picked", () => {
    show(absLine, "b", "info"); // picked the nearer one → contrast the farther
    expect(screen.getByTestId("avl-ghost")).toBeTruthy();
    expect(screen.getByText("farthest")).toBeTruthy();
    cleanup();
    show(absLine, "b"); // working / quiz surface → no ghost
    expect(screen.queryByTestId("avl-ghost")).toBeNull();
    cleanup();
    show(absLine, "b", "error"); // retry never previews the answer
    expect(screen.queryByTestId("avl-ghost")).toBeNull();
  });

  it("absValueLine draws no ghost when the learner already picked the farthest operand", () => {
    show(absLine, "a", "info");
    expect(screen.queryByTestId("avl-ghost")).toBeNull();
  });

  /* ---- geometry + statistics band pass (s31): ghosts and ROLE color fixes ---- */

  const fb = { successFeedback: "yes", lowFeedback: "low — substance first", highFeedback: "high — substance first" };

  it("dilationExplore ghosts the target-k image only when revealed and off-target", () => {
    const spec = WidgetSpec.parse({
      type: "dilationExplore", prompt: "Dilate by k = 2.",
      shape: [[1, 1], [3, 1], [1, 2]], targetK: 2, ...fb
    }) as TWidget;
    show(spec, { k: 1.5 }, "info");
    expect(screen.getByTestId("dl-ghost")).toBeTruthy();
    cleanup();
    show(spec, { k: 1.5 });
    expect(screen.queryByTestId("dl-ghost")).toBeNull();
    cleanup();
    show(spec, { k: 1.5 }, "error");
    expect(screen.queryByTestId("dl-ghost")).toBeNull();
    cleanup();
    show(spec, { k: 2 }, "info"); // at target → nothing to contrast
    expect(screen.queryByTestId("dl-ghost")).toBeNull();
  });

  it("circleMeasureExplore ghosts the target measure in each mode, only on reveal", () => {
    const chord = WidgetSpec.parse({
      type: "circleMeasureExplore", prompt: "Make the chord 8.", mode: "chordDistance",
      radius: 5, targetLength: 8, start: 0, ...fb
    }) as TWidget;
    show(chord, 4, "info"); // d=4 → chord 6 ≠ 8
    expect(screen.getByTestId("cm-ghost")).toBeTruthy();
    cleanup();
    show(chord, 3, "info"); // d=3 → chord 8 = target → no ghost
    expect(screen.queryByTestId("cm-ghost")).toBeNull();
    cleanup();
    show(chord, 4, "error");
    expect(screen.queryByTestId("cm-ghost")).toBeNull();
    cleanup();
    const arc = WidgetSpec.parse({
      type: "circleMeasureExplore", prompt: "Make the angle 90°.", mode: "arcSector",
      radius: 5, targetAngle: 90, start: 45, ...fb
    }) as TWidget;
    show(arc, 45, "info");
    expect(screen.getByTestId("cm-ghost")).toBeTruthy();
    cleanup();
    show(arc, 90, "info");
    expect(screen.queryByTestId("cm-ghost")).toBeNull();
  });

  it("circleAngleExplore ghosts the arc that PRODUCES the target reading (inscribed mode doubles it)", () => {
    const spec = WidgetSpec.parse({
      type: "circleAngleExplore", prompt: "Make the angle at P read 40°.",
      mode: "inscribed", targetAngle: 40, startArc: 100, ...fb
    }) as TWidget;
    show(spec, 100, "info"); // reading 50 ≠ 40
    expect(screen.getByTestId("ca-ghost")).toBeTruthy();
    expect(screen.getByText("target arc")).toBeTruthy();
    cleanup();
    show(spec, 80, "info"); // reading 40 = target → no ghost
    expect(screen.queryByTestId("ca-ghost")).toBeNull();
    cleanup();
    show(spec, 100, "error");
    expect(screen.queryByTestId("ca-ghost")).toBeNull();
  });

  it("triangleSolve ghosts the target triangle only when the dial misses", () => {
    const spec = WidgetSpec.parse({
      type: "triangleSolve", prompt: "Make the third side 5.",
      mode: "sas", a: 4, b: 3, target: 5, start: 30, ...fb
    }) as TWidget;
    show(spec, 60, "info"); // third ≈ 3.61 ≠ 5
    expect(screen.getByTestId("ts-ghost")).toBeTruthy();
    cleanup();
    show(spec, 90, "info"); // 3-4-5 right triangle → third = 5 exactly → no ghost
    expect(screen.queryByTestId("ts-ghost")).toBeNull();
    cleanup();
    show(spec, 60, "error");
    expect(screen.queryByTestId("ts-ghost")).toBeNull();
  });

  it("probabilityArea ghosts the target shading boundary (exact cross-multiplied predicate)", () => {
    const spec = WidgetSpec.parse({
      type: "probabilityArea", prompt: "Shade 3/10.", rows: 2, cols: 5,
      targetNum: 3, targetDen: 10, start: 0, ...fb
    }) as TWidget;
    show(spec, 5, "info"); // 5/10 ≠ 3/10
    expect(screen.getByTestId("pa-ghost")).toBeTruthy();
    cleanup();
    show(spec, 3, "info"); // 3/10 = target → no ghost
    expect(screen.queryByTestId("pa-ghost")).toBeNull();
    cleanup();
    show(spec, 5);
    expect(screen.queryByTestId("pa-ghost")).toBeNull();
  });

  it("spinnerSim ghosts the target boundary; sectors are sky (learner-active), not leaf", () => {
    const spec = WidgetSpec.parse({
      type: "spinnerSim", prompt: "Shade a 1/4 chance.", sectors: 8,
      targetFavourable: 2, favourableStart: 0, ...fb
    }) as TWidget;
    const { container } = show(spec, 5, "info");
    expect(screen.getByTestId("spin-ghost")).toBeTruthy();
    expect(container.innerHTML).not.toContain("#2FA36B"); // no leaf on learner shading
    cleanup();
    show(spec, 2, "info");
    expect(screen.queryByTestId("spin-ghost")).toBeNull();
    cleanup();
    show(spec, 5, "error");
    expect(screen.queryByTestId("spin-ghost")).toBeNull();
  });

  it("dotPlot rings the target height on exactly the mismatched columns", () => {
    const spec = WidgetSpec.parse({
      type: "dotPlot", prompt: "Build the dot plot.", values: [1, 2, 3],
      target: [2, 0, 1], successFeedback: "yes", partialFeedback: "some columns are off"
    }) as TWidget;
    show(spec, [2, 3, 1], "info"); // only column 2 (value 2) mismatched
    expect(screen.getAllByTestId("dpx-ghost")).toHaveLength(1);
    cleanup();
    show(spec, [0, 0, 0], "info"); // columns 1 and 3 mismatched (targets 2 and 1); column 2 matches 0
    expect(screen.getAllByTestId("dpx-ghost")).toHaveLength(2);
    cleanup();
    show(spec, [2, 0, 1], "info"); // all match → no ghost
    expect(screen.queryByTestId("dpx-ghost")).toBeNull();
    cleanup();
    show(spec, [0, 0, 0]);
    expect(screen.queryByTestId("dpx-ghost")).toBeNull();
  });

  it("boxPlot ghosts the target five-number skeleton only on reveal", () => {
    const spec = WidgetSpec.parse({
      type: "boxPlot", prompt: "Build the box plot.", axisMin: 0, axisMax: 20,
      targetMin: 2, targetQ1: 5, targetMed: 8, targetQ3: 12, targetMax: 18,
      startMin: 0, startQ1: 0, startMed: 0, startQ3: 0, startMax: 0,
      successFeedback: "yes", orderFeedback: "keep the five in order", valueFeedback: "values are off"
    }) as TWidget;
    show(spec, { min: 0, q1: 4, med: 8, q3: 12, max: 18 }, "info");
    expect(screen.getByTestId("bp-ghost")).toBeTruthy();
    cleanup();
    show(spec, { min: 2, q1: 5, med: 8, q3: 12, max: 18 }, "info");
    expect(screen.queryByTestId("bp-ghost")).toBeNull();
    cleanup();
    show(spec, { min: 0, q1: 4, med: 8, q3: 12, max: 18 }, "error");
    expect(screen.queryByTestId("bp-ghost")).toBeNull();
  });

  /* ---- K-8 band pass (s32): ghosts + ROLE recolors ---- */

  it("clockSet ghosts the target hands only when revealed and mis-set", () => {
    const spec = WidgetSpec.parse({
      type: "clockSet", prompt: "Set the clock to 7:00.", targetHour: 7, targetMinute: 0,
      successFeedback: "yes", hourFeedback: "hour family", minuteFeedback: "minute family"
    }) as TWidget;
    show(spec, { hour: 4, minute: 30 }, "info");
    expect(screen.getByTestId("ck-ghost")).toBeTruthy();
    cleanup();
    show(spec, { hour: 7, minute: 0 }, "info");
    expect(screen.queryByTestId("ck-ghost")).toBeNull();
    cleanup();
    show(spec, { hour: 4, minute: 30 }, "error");
    expect(screen.queryByTestId("ck-ghost")).toBeNull();
  });

  it("numberLineHop: hops and landing are sky; the true landing ghosts on reveal only", () => {
    const spec = WidgetSpec.parse({
      type: "numberLineHop", prompt: "Hop by 10s.", start: 20, hop: 10, hops: 3,
      direction: "forward", min: 0, max: 100, commonLandings: [],
      successFeedback: "yes", missFeedback: "count the hops"
    }) as TWidget;
    const c = show(spec, 40, "info"); // landing is 50
    expect(screen.getByTestId("nlh-ghost")).toBeTruthy();
    expect(c.container.innerHTML).not.toContain("#2FA36B"); // no leaf on learner picks
    cleanup();
    show(spec, 50, "info");
    expect(screen.queryByTestId("nlh-ghost")).toBeNull();
    cleanup();
    show(spec, 40);
    expect(screen.queryByTestId("nlh-ghost")).toBeNull();
  });

  it("tenFrame outlines the target region on exactly the reveal state", () => {
    const spec = WidgetSpec.parse({
      type: "tenFrame", prompt: "Show 7.", target: 7, preFilled: 3, addColor: "tangerine",
      commonCounts: [], successFeedback: "yes", missFeedback: "fill to 7"
    }) as TWidget;
    show(spec, 5, "info");
    expect(screen.getAllByTestId("ten-ghost")).toHaveLength(7); // rings on cells 1..7
    cleanup();
    show(spec, 7, "info");
    expect(screen.queryByTestId("ten-ghost")).toBeNull();
    cleanup();
    show(spec, 5, "error");
    expect(screen.queryByTestId("ten-ghost")).toBeNull();
  });

  it("fractionBar: learner bar sky, shown-target bar tangerine; hidden-target builds ghost the FILL FRACTION", () => {
    const hidden = WidgetSpec.parse({
      type: "fractionBar", prompt: "Build one half.", targetNum: 1, targetDen: 2, showTarget: false,
      numMin: 1, numMax: 8, denMin: 1, denMax: 8, numStart: 1, denStart: 4,
      commonFractions: [], successFeedback: "yes", lowFeedback: "low", highFeedback: "high"
    }) as TWidget;
    show(hidden, { n: 1, d: 4 }, "info");
    expect(screen.getByTestId("fb-ghost")).toBeTruthy();
    expect(screen.getByText("target fill")).toBeTruthy();
    cleanup();
    show(hidden, { n: 2, d: 4 }, "info"); // 2/4 ≡ 1/2 — equivalent build, no ghost
    expect(screen.queryByTestId("fb-ghost")).toBeNull();
    cleanup();
    const shown = WidgetSpec.parse({
      type: "fractionBar", prompt: "Match the target.", targetNum: 1, targetDen: 2, showTarget: true,
      numMin: 1, numMax: 8, denMin: 1, denMax: 8, numStart: 1, denStart: 4,
      commonFractions: [], successFeedback: "yes", lowFeedback: "low", highFeedback: "high"
    }) as TWidget;
    show(shown, { n: 1, d: 4 }, "info"); // target visible → never a ghost
    expect(screen.queryByTestId("fb-ghost")).toBeNull();
  });

  it("percentBar ghosts the target fill level only on reveal", () => {
    const spec = WidgetSpec.parse({
      type: "percentBar", prompt: "Show 40%.", whole: 50, targetPercent: 40,
      startPercent: 0, percentStep: 5, successFeedback: "yes", lowFeedback: "low", highFeedback: "high"
    }) as TWidget;
    show(spec, 25, "info");
    expect(screen.getByTestId("pct-ghost")).toBeTruthy();
    cleanup();
    show(spec, 40, "info");
    expect(screen.queryByTestId("pct-ghost")).toBeNull();
    cleanup();
    show(spec, 25);
    expect(screen.queryByTestId("pct-ghost")).toBeNull();
  });

  it("doubleNumberLine: the asked value is sky (not berry) and its target ghosts in the model on reveal", () => {
    const spec = WidgetSpec.parse({
      type: "doubleNumberLine", prompt: "Fill the marked tick.", topLabel: "km", bottomLabel: "min",
      steps: 5, topPerStep: 2, bottomPerStep: 10, askAtStep: 3, targetTop: 6,
      topMax: 12, topStep: 1, successFeedback: "yes", lowFeedback: "low", highFeedback: "high"
    }) as TWidget;
    const c = show(spec, 4, "info");
    expect(screen.getByTestId("dnl-ghost")).toBeTruthy();
    expect(c.container.innerHTML).not.toContain("accent-berry");
    cleanup();
    show(spec, 6, "info");
    expect(screen.queryByTestId("dnl-ghost")).toBeNull();
    cleanup();
    show(spec, 4, "error");
    expect(screen.queryByTestId("dnl-ghost")).toBeNull();
  });

  it("s36 engines ghost on reveal-mismatch only: moneyBoard bar, fractionGrid guides, fractionCompare ring", () => {
    const mb = WidgetSpec.parse({
      type: "moneyBoard", prompt: "Build 47¢.", targetCents: 47,
      tray: [{ cents: 25, label: "quarter", max: 2 }, { cents: 1, label: "penny", max: 30 }],
      lowFeedback: "low", highFeedback: "high", successFeedback: "yes"
    }) as TWidget;
    show(mb, { 25: 1 }, "info");
    expect(screen.getByTestId("mb-ghost")).toBeTruthy();
    cleanup();
    show(mb, { 25: 1, 1: 22 }, "info");
    expect(screen.queryByTestId("mb-ghost")).toBeNull();
    cleanup();
    const fg = WidgetSpec.parse({
      type: "fractionGrid", prompt: "Build 2/3 × 4/5.", num1: 2, den1: 3, num2: 4, den2: 5,
      rowFeedback: "r", colFeedback: "c", successFeedback: "yes"
    }) as TWidget;
    show(fg, { rows: 2, cols: 5, shadeR: 1, shadeC: 4 }, "info");
    expect(screen.getByTestId("fg-ghost")).toBeTruthy();
    cleanup();
    show(fg, { rows: 3, cols: 5, shadeR: 2, shadeC: 4 }, "info");
    expect(screen.queryByTestId("fg-ghost")).toBeNull();
    cleanup();
    const fc = WidgetSpec.parse({
      type: "fractionCompare", prompt: "Bigger?", left: { num: 2, den: 3 }, right: { num: 2, den: 8 },
      answer: "left", rightFeedback: "reflex", equalFeedback: "eq", successFeedback: "yes"
    }) as TWidget;
    show(fc, "right", "info");
    expect(screen.getByTestId("fc-ghost")).toBeTruthy();
    cleanup();
    show(fc, "right", "error");
    expect(screen.queryByTestId("fc-ghost")).toBeNull();
  });

  it("moneyBoard count-mode chain ghost renders on reveal-mismatch only", () => {
    const mbc = WidgetSpec.parse({
      type: "moneyBoard", mode: "count", prompt: "How many cents?",
      show: [{ cents: 25, label: "quarter", count: 2 }],
      answerCents: 50, fallbackFeedback: "f", successFeedback: "yes"
    }) as TWidget;
    show(mbc, { counted: [], entry: 40 }, "info");
    expect(screen.getByTestId("mbc-ghost").textContent).toContain("25 → 50");
    cleanup();
    show(mbc, { counted: [25, 25], entry: 50 }, "info");
    expect(screen.queryByTestId("mbc-ghost")).toBeNull();
    cleanup();
    show(mbc, { counted: [], entry: 40 }, "error");
    expect(screen.queryByTestId("mbc-ghost")).toBeNull();
  });

  it("ROLE contract sweep: no learner-active object or slider left in berry (s31 recolors)", () => {
    // clockSet minute hand — the primary learner control across ~43 lessons.
    const clock = WidgetSpec.parse({
      type: "clockSet", prompt: "Set the clock to 7:00.", targetHour: 7, targetMinute: 0,
      successFeedback: "yes", hourFeedback: "hour family", minuteFeedback: "minute family"
    }) as TWidget;
    const c1 = show(clock, { hour: 4, minute: 30 });
    expect(c1.container.innerHTML).not.toContain("accent-berry");
    expect(c1.container.querySelector('[class*="ck-m"]')?.getAttribute("stroke")).toBe("#2E7CD6");
    cleanup();
    // angleMeasure moving ray — its reveal ghost owns tangerine; the ray is sky.
    const ang = WidgetSpec.parse({
      type: "angleMeasure", prompt: "Open the angle to 60°.", targetAngle: 60,
      successFeedback: "yes", lowFeedback: "wider — substance", highFeedback: "narrower — substance"
    }) as TWidget;
    const c2 = show(ang, { angle: 30 });
    expect(c2.container.innerHTML).not.toContain("accent-berry");
    const ray = c2.container.querySelector('line[class*="am-ray"]');
    expect(ray?.getAttribute("stroke")).toBe("#2E7CD6");
  });

  it("transformExplore: learner image is sky, turns leaf exactly at the (always-visible) target — no ghost id", () => {
    const spec = WidgetSpec.parse({
      type: "transformExplore", prompt: "Slide onto the target.",
      shape: [[0, 0], [2, 0], [0, 1]], target: [[3, 2], [5, 2], [3, 3]],
      successFeedback: "yes", offsetFeedback: "same shape, wrong spot", reflectFeedback: "flip first"
    }) as TWidget;
    show(spec, { dx: 1, dy: 1, reflect: "none" }, "info");
    const off = screen.getByTestId("tf-image");
    expect(off.getAttribute("data-at-target")).toBe("false");
    expect(off.getAttribute("stroke")).toBe("#2E7CD6"); // sky, never berry
    cleanup();
    show(spec, { dx: 3, dy: 2, reflect: "none" });
    const on = screen.getByTestId("tf-image");
    expect(on.getAttribute("data-at-target")).toBe("true");
    expect(on.getAttribute("stroke")).toBe("#2FA36B"); // leaf at coincidence
  });

  it("quadDrag ghosts the target quadrilateral and corner on reveal", () => {
    const spec: TWidget = {
      type: "quadDrag",
      prompt: "Finish the rectangle.",
      fixed: [
        [1, 1],
        [5, 1],
        [5, 4]
      ],
      targetX: 1,
      targetY: 4,
      startX: 2,
      startY: 2,
      gridMax: 8,
      targetName: "a rectangle",
      successFeedback: "Four right angles, opposite sides equal — that's the rectangle.",
      sideFeedback: "A side length is off — opposite sides of a rectangle match.",
      angleFeedback: "A corner isn't square — every rectangle angle is 90°."
    };
    show(spec, { x: 2, y: 2 }, "info");
    expect(screen.getByTestId("qd-ghost")).toBeTruthy();
    cleanup();
    show(spec, { x: 2, y: 2 });
    expect(screen.queryByTestId("qd-ghost")).toBeNull();
  });

  it("unitCircleExplore ghosts the target radius on reveal", () => {
    const spec: TWidget = {
      type: "unitCircleExplore",
      prompt: "Sweep to 90°.",
      targetAngle: 90,
      angleStart: 0,
      angleStep: 15,
      successFeedback: "At 90° the point sits straight up: cos 0, sin 1.",
      lowFeedback: "Keep sweeping counterclockwise — the angle is still too small.",
      highFeedback: "Past it — sweep back clockwise toward straight up."
    };
    show(spec, { angle: 30 }, "info");
    expect(screen.getByTestId("uc-ghost")).toBeTruthy();
    cleanup();
    show(spec, { angle: 90 }, "info"); // at target → nothing to contrast
    expect(screen.queryByTestId("uc-ghost")).toBeNull();
  });

  it("systemsExplore rings the intersection on reveal", () => {
    const spec: TWidget = {
      type: "systemsExplore",
      prompt: "Find the point on both lines.",
      m1: 1,
      b1: 0,
      m2: -1,
      b2: 4,
      xMin: -1,
      xMax: 5,
      yMin: -1,
      yMax: 5,
      xStart: 0,
      yStart: 0,
      successFeedback: "That point satisfies both equations at once — the solution.",
      offLine1Feedback: "That point is off the first line — its y must equal x there.",
      offLine2Feedback: "That point is off the second line — its y must equal 4 − x there."
    };
    show(spec, { x: 0, y: 0 }, "info");
    expect(screen.getByTestId("se-ghost")).toBeTruthy();
  });

  it("angleMeasure ghosts the target ray on reveal", () => {
    const spec: TWidget = {
      type: "angleMeasure",
      prompt: "Open the rays to 60°.",
      targetAngle: 60,
      angleStart: 0,
      angleStep: 5,
      successFeedback: "That opening is 60° — a third of a straight angle.",
      lowFeedback: "The opening is still too narrow — keep rotating the ray up.",
      highFeedback: "Too wide — bring the ray back down toward the base."
    };
    show(spec, { angle: 20 }, "info");
    expect(screen.getByTestId("am-ghost")).toBeTruthy();
  });
});

describe("error cues (tone='error')", () => {
  it("numberLinePlace shows a direction-only chevron on a miss — and no ghost", () => {
    show(nlp, 3, "error");
    expect(screen.getByTestId("nlp-cue")).toBeTruthy();
    expect(screen.queryByTestId("nlp-ghost")).toBeNull(); // retry never reveals the target
    cleanup();
    show(nlp, 3); // working: no cue
    expect(screen.queryByTestId("nlp-cue")).toBeNull();
    cleanup();
    show(nlp, 3, "info"); // revealed: ghost, not cue
    expect(screen.getByTestId("nlp-ghost")).toBeTruthy();
    expect(screen.queryByTestId("nlp-cue")).toBeNull();
  });

  it("the chevron points toward the target from either side", () => {
    const { container } = show(nlp, 3, "error"); // target 6 is to the RIGHT of 3
    const dRight = container.querySelector('[data-testid="nlp-cue"]')!.getAttribute("d")!;
    expect(dRight).toContain("l 8 6"); // rightward chevron
    cleanup();
    const { container: c2 } = show(nlp, 9, "error"); // target 6 is to the LEFT of 9
    const dLeft = c2.querySelector('[data-testid="nlp-cue"]')!.getAttribute("d")!;
    expect(dLeft).toContain("l -8 6"); // leftward chevron
  });
});

describe("end-to-end plumbing through the real player", () => {
  const lesson: TLesson = Lesson.parse({
    id: "test-tone-01",
    slug: "test-tone",
    title: "Tone Plumbing Trail",
    courseId: "test",
    chapterId: "t1",
    minutes: 2,
    steps: [
      {
        id: "k1",
        kind: "check",
        body: "Place the number.",
        conceptTag: "tone-nlp",
        widget: nlp,
        explanationVariants: [
          "6 sits six unit steps from zero on this line.",
          "Count the ticks: zero, then six equal hops land on 6."
        ]
      },
      ...[1, 2, 3, 4, 5, 6].map((n) => ({
        id: `c${n}`,
        kind: "concept" as const,
        body: `Filler concept ${n}: the number line orders every value by its distance from zero.`
      })),
      { id: "r1", kind: "recap", body: "Done.", takeaways: ["Position is distance from zero."] }
    ],
    remedials: []
  });

  it("a wrong check → retry shows the cue; second miss → reveal shows the ghost", () => {
    render(<LessonPlayer lesson={lesson} />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
    expect(screen.getByTestId("nlp-cue")).toBeTruthy(); // retry: model points the way
    expect(screen.queryByTestId("nlp-ghost")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^Try again$/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Check$/ })); // second miss → revealed
    expect(screen.getByTestId("nlp-ghost")).toBeTruthy(); // reveal: target contrasted on the line
    expect(screen.queryByTestId("nlp-cue")).toBeNull();
  });
});

describe("algebraTiles error rows (§13.6: the model points at its own error)", () => {
  const tiles: TWidget = {
    type: "algebraTiles",
    prompt: "Build 3x + 2.",
    targetX: 3,
    targetConst: 2,
    maxTiles: 8,
    xStart: 0,
    constStart: 0,
    successFeedback: "3 long tiles and 2 units — that's 3x + 2 on the board.",
    xFeedback: "Count the long tiles again — each one is worth one x.",
    constFeedback: "The long tiles are right; recount the small unit tiles."
  };

  it("x-row wrong → the long-tile row is ringed (grader's first priority)", () => {
    show(tiles, { x: 2, c: 2 }, "error");
    expect(screen.getByTestId("at-off-x")).toBeTruthy();
    expect(screen.queryByTestId("at-off-c")).toBeNull();
  });

  it("x-row right, units wrong → only the unit row is ringed", () => {
    show(tiles, { x: 3, c: 5 }, "error");
    expect(screen.queryByTestId("at-off-x")).toBeNull();
    expect(screen.getByTestId("at-off-c")).toBeTruthy();
  });

  it("both wrong → only the x row rings, mirroring evaluate()'s diagnosis order", () => {
    show(tiles, { x: 1, c: 9 }, "error");
    expect(screen.getByTestId("at-off-x")).toBeTruthy();
    expect(screen.queryByTestId("at-off-c")).toBeNull();
  });

  it("no tone (quiz surfaces) or neutral → no rings while working", () => {
    show(tiles, { x: 1, c: 9 });
    expect(screen.queryByTestId("at-off-x")).toBeNull();
    expect(screen.queryByTestId("at-off-c")).toBeNull();
  });
});

/* ---------------- calculus reveal ghosts (session 28) ---------------- */

const ssLimit = WidgetSpec.parse({
  type: "secantSlope", prompt: "Squeeze the gap.", curve: "square", mode: "limit",
  a: 3, targetH: 0.1, startH: 1.5,
  successFeedback: "merged", lowFeedback: "0/0 is nothing", highFeedback: "still wide"
});
const ssAvg = WidgetSpec.parse({
  type: "secantSlope", prompt: "Set the gap to 1.", curve: "square", mode: "average",
  a: 1, targetH: 1, startH: 0.5,
  successFeedback: "s", lowFeedback: "l", highFeedback: "h"
});
const dtSlope = WidgetSpec.parse({
  type: "derivativeTrace", prompt: "Find slope 6.", fn: "square", mode: "slope",
  targetSlope: 6, targetX: 0, start: -3,
  successFeedback: "s", lowFeedback: "l", highFeedback: "h"
});
const dtPoint = WidgetSpec.parse({
  type: "derivativeTrace", prompt: "Go to x = 2.", fn: "square", mode: "point",
  targetSlope: 0, targetX: 2, start: -3,
  successFeedback: "s", lowFeedback: "l", highFeedback: "h"
});
const aaArea = WidgetSpec.parse({
  type: "accumulateArea", prompt: "Sweep to area 4.", fn: "line", mode: "area",
  targetArea: 4, targetX: 0, start: 0,
  successFeedback: "s", lowFeedback: "l", highFeedback: "h"
});
const sfSpec = WidgetSpec.parse({
  type: "slopeField", prompt: "Find the equilibrium.", equation: "logistic",
  targetY0: 4, startY0: 1,
  successFeedback: "s", lowFeedback: "l", highFeedback: "h"
});
const taTerms = WidgetSpec.parse({
  type: "taylorApprox", prompt: "Add terms.", fn: "exp", mode: "terms",
  atX: 1, tolerance: 0.01, targetN: 4, nStart: 0, targetXTenths: 10, xStart: 3,
  successFeedback: "s", lowFeedback: "l", highFeedback: "h"
});
const ptLimacon = WidgetSpec.parse({
  type: "polarTrace", prompt: "Close the loop.", mode: "limacon",
  targetPetals: 4, targetA: 2, start: 1,
  successFeedback: "s", lowFeedback: "l", highFeedback: "h"
});
const ptRose = WidgetSpec.parse({
  type: "polarTrace", prompt: "Four petals.", mode: "rose",
  targetPetals: 4, targetA: 2, start: 1,
  successFeedback: "s", lowFeedback: "l", highFeedback: "h"
});
const scSpec = WidgetSpec.parse({
  type: "signChart", prompt: "Set the signs.",
  roots: [{ x: -2, mult: 1 }, { x: 1, mult: 2 }, { x: 3, mult: 1 }],
  leadingPositive: true,
  successFeedback: "s", crossFeedback: "cross", bounceFeedback: "bounce"
});
const gzSpec = WidgetSpec.parse({
  type: "graphZoom", prompt: "Does the limit exist?", behaviour: "removable",
  a: 2, leftValue: 4, rightValue: 4, fAtA: null,
  targetVerdict: "limit-exists", requiredZoom: 3,
  successFeedback: "s", moreZoomFeedback: "zoom more", wrongVerdictFeedback: "wrong verdict"
});

describe("calculus reveal ghosts (tone=info shows the target on the object)", () => {
  it("secantSlope limit mode draws the ε-corridor when the gap is still wide — not once inside it", () => {
    show(ssLimit, 1.5, "info");
    expect(screen.getByTestId("ss-ghost")).toBeTruthy();
    cleanup();
    show(ssLimit, 0.05, "info"); // inside |h| ≤ 0.1, nonzero → correct state, nothing to contrast
    expect(screen.queryByTestId("ss-ghost")).toBeNull();
  });

  it("secantSlope average mode rings the exact target B", () => {
    show(ssAvg, 0.5, "info");
    expect(screen.getByTestId("ss-ghost")).toBeTruthy();
    cleanup();
    show(ssAvg, 1, "info");
    expect(screen.queryByTestId("ss-ghost")).toBeNull();
  });

  it("derivativeTrace slope mode marks the height f′ must reach; point mode rings the exact x", () => {
    show(dtSlope, -3, "info");
    expect(screen.getByTestId("dt-ghost")).toBeTruthy();
    cleanup();
    show(dtPoint, 0, "info");
    expect(screen.getByTestId("dt-ghost")).toBeTruthy();
    cleanup();
    show(dtPoint, 2, "info"); // at target
    expect(screen.queryByTestId("dt-ghost")).toBeNull();
  });

  it("accumulateArea area mode marks the level A must reach", () => {
    show(aaArea, 0, "info");
    expect(screen.getByTestId("aa-ghost")).toBeTruthy();
    cleanup();
    show(aaArea, 2, "info"); // A(2) = 4 exactly
    expect(screen.queryByTestId("aa-ghost")).toBeNull();
  });

  it("slopeField threads the target solution through the same field — and never while working", () => {
    show(sfSpec, 1, "info");
    expect(screen.getByTestId("sf-ghost")).toBeTruthy();
    cleanup();
    show(sfSpec, 4, "info");
    expect(screen.queryByTestId("sf-ghost")).toBeNull();
    cleanup();
    show(sfSpec, 1, "error"); // retry keeps the struggle productive: no ghost
    expect(screen.queryByTestId("sf-ghost")).toBeNull();
  });

  it("taylorApprox terms mode dashes the target-term polynomial", () => {
    show(taTerms, 0, "info");
    expect(screen.getByTestId("ta-ghost")).toBeTruthy();
    cleanup();
    show(taTerms, 4, "info");
    expect(screen.queryByTestId("ta-ghost")).toBeNull();
  });

  it("polarTrace ghosts the target limaçon — but never a rose (petal count has no unique n)", () => {
    show(ptLimacon, 1, "info");
    expect(screen.getByTestId("pt-ghost")).toBeTruthy();
    cleanup();
    show(ptRose, 1, "info");
    expect(screen.queryByTestId("pt-ghost")).toBeNull();
  });

  it("signChart dashes the TRUE sign on exactly the intervals the claim gets wrong", () => {
    show(scSpec, ["+", "+", "+", "+"], "info"); // truth is + − − +
    expect(screen.getByTestId("sc-ghost")).toBeTruthy();
    cleanup();
    show(scSpec, ["+", "-", "-", "+"], "info");
    expect(screen.queryByTestId("sc-ghost")).toBeNull();
  });

  it("graphZoom verdict buttons announce their selected state (aria-pressed)", () => {
    show(gzSpec, { zoom: 3, verdict: "no-limit" });
    expect(screen.getByRole("button", { name: "say there is none" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "say the limit exists" }).getAttribute("aria-pressed")).toBe("false");
  });
});

/* ---------------- algebra reveal ghosts (session 29) ---------------- */

const qeSpec = WidgetSpec.parse({
  type: "quadraticExplore", prompt: "Match y = 2(x − 1)² − 2.",
  targetA: 2, targetH: 1, targetK: -2,
  aMin: -3, aMax: 3, hMin: -5, hMax: 5, kMin: -5, kMax: 5,
  aStart: 1, hStart: 0, kStart: 0, gridMax: 7,
  successFeedback: "s", shapeFeedback: "shape", vertexFeedback: "vertex"
});
const sbGeo = WidgetSpec.parse({
  type: "sequenceBuild", prompt: "Settle the forever-sum on 8.", mode: "geometric",
  first: 4, targetD: 3, atPosition: 4, targetTerm: 11, targetRTenths: 5, targetSum: 8, start: 9,
  successFeedback: "s", lowFeedback: "l", highFeedback: "h"
});
const sbArith = WidgetSpec.parse({
  type: "sequenceBuild", prompt: "Make term 4 equal 11.", mode: "arithmetic",
  first: 2, targetD: 3, atPosition: 4, targetTerm: 11, targetRTenths: 5, targetSum: 8, start: 1,
  successFeedback: "s", lowFeedback: "l", highFeedback: "h"
});
const ppSpec = WidgetSpec.parse({
  type: "plotPoint", prompt: "Mark 3 dots in the Cat column.",
  cols: 3, rows: 4, xLabels: ["Cat", "Dog", "Fish"],
  targets: [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
  pointErrors: [{ x: 2, y: 1, feedback: "That dot sits in the Dog column." }],
  missFeedback: "Stack 3 dots in the Cat column.", successFeedback: "s"
});
const dgSpec = WidgetSpec.parse({
  type: "distanceGrid", prompt: "Move to (6, 6).",
  anchor: [2, 3], targetPoint: [6, 6], gridMin: 0, gridMax: 8, startX: 2, startY: 3,
  successFeedback: "s", wrongPointFeedback: "not there yet"
});
const dbSpec = WidgetSpec.parse({
  type: "dragBucket", prompt: "Sort the stories.",
  buckets: [{ id: "mul", label: "Multiply" }, { id: "add", label: "Add" }],
  items: [
    { id: "s1", label: "4 boxes of 6", bucketId: "mul", feedback: "equal groups multiply" },
    { id: "s2", label: "6 and 4 joined", bucketId: "add", feedback: "joining once adds" }
  ],
  missFeedback: "Sort each story.", successFeedback: "s"
});
const mpSpec = WidgetSpec.parse({
  type: "matchPairs", prompt: "Match stories to products.",
  left: [{ id: "l1", label: "2 nests of 3" }, { id: "l2", label: "3 nests of 2" }],
  right: [{ id: "r1", label: "3 × 2" }, { id: "r2", label: "2 × 3" }],
  pairs: { l1: "r2", l2: "r1" },
  pairErrors: [{ left: "l1", right: "r1", feedback: "groups-first reads 2 × 3" }],
  missFeedback: "Read groups-first.", successFeedback: "s"
});
const doSpec = WidgetSpec.parse({
  type: "dragOrder", prompt: "Smallest first.",
  items: [{ id: "n15", label: "15" }, { id: "n5", label: "5" }, { id: "n10", label: "10" }],
  correctOrder: ["n5", "n10", "n15"],
  misorderFeedback: [{ first: "n15", second: "n5", feedback: "15 landed before 5." }],
  missFeedback: "Start at the smallest.", successFeedback: "s"
});

describe("algebra reveal ghosts (session 29)", () => {
  it("quadraticExplore dashes the target parabola and rings its vertex", () => {
    show(qeSpec, { a: 1, h: 0, k: 0 }, "info");
    expect(screen.getByTestId("qe-ghost")).toBeTruthy();
    cleanup();
    show(qeSpec, { a: 2, h: 1, k: -2 }, "info");
    expect(screen.queryByTestId("qe-ghost")).toBeNull();
  });

  it("sequenceBuild ghosts the target level in geometric mode only", () => {
    show(sbGeo, 9, "info"); // r = 0.9 → sum 40, far from 8
    expect(screen.getByTestId("sb-ghost")).toBeTruthy();
    cleanup();
    show(sbGeo, 5, "info"); // r = 0.5 → sum exactly 8
    expect(screen.queryByTestId("sb-ghost")).toBeNull();
    cleanup();
    show(sbArith, 1, "info"); // arithmetic: a level line would be dishonest (bars are sums)
    expect(screen.queryByTestId("sb-ghost")).toBeNull();
  });

  it("plotPoint rings every target cell until the selection is exactly right", () => {
    show(ppSpec, [{ x: 1, y: 1 }, { x: 2, y: 1 }], "info");
    expect(screen.getAllByTestId("pp-ghost")).toHaveLength(3);
    cleanup();
    show(ppSpec, [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }], "info");
    expect(screen.queryByTestId("pp-ghost")).toBeNull();
  });

  it("distanceGrid rings the named point", () => {
    show(dgSpec, { x: 2, y: 3 }, "info");
    expect(screen.getByTestId("dg-ghost")).toBeTruthy();
    cleanup();
    show(dgSpec, { x: 6, y: 6 }, "info");
    expect(screen.queryByTestId("dg-ghost")).toBeNull();
  });

  it("dragBucket chips the correct destination on wrong AND unplaced items — never while working", () => {
    show(dbSpec, { s1: "add" }, "info"); // s1 wrong, s2 unplaced
    const chips = screen.getAllByTestId("db-ghost");
    expect(chips).toHaveLength(2);
    expect(chips[0].textContent).toContain("Multiply");
    expect(chips[1].textContent).toContain("Add");
    cleanup();
    show(dbSpec, { s1: "mul", s2: "add" }, "info");
    expect(screen.queryByTestId("db-ghost")).toBeNull();
    cleanup();
    show(dbSpec, { s1: "add" }); // no tone: still working
    expect(screen.queryByTestId("db-ghost")).toBeNull();
  });

  it("matchPairs chips the correct match on mismatched and missing links", () => {
    show(mpSpec, { l1: "r1" }, "info"); // l1 wrong, l2 missing
    const chips = screen.getAllByTestId("mp-ghost");
    expect(chips).toHaveLength(2);
    expect(chips[0].textContent).toContain("2 × 3");
    expect(chips[1].textContent).toContain("3 × 2");
    cleanup();
    show(mpSpec, { l1: "r2", l2: "r1" }, "info");
    expect(screen.queryByTestId("mp-ghost")).toBeNull();
  });

  it("dragOrder chips the correct position on exactly the misplaced rows", () => {
    show(doSpec, ["n15", "n5", "n10"], "info"); // every row misplaced
    expect(screen.getAllByTestId("do-ghost")).toHaveLength(3);
    cleanup();
    show(doSpec, ["n5", "n10", "n15"], "info");
    expect(screen.queryByTestId("do-ghost")).toBeNull();
  });
});
