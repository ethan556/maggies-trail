// @vitest-environment jsdom
//
// ENGINE-EXTENSION REGRESSION SUITE (three v2 capabilities, one session):
//
//   1. lengthCompare `mode:"align"` — staggered starts + the "line up the
//      starting ends" move. A pick while unaligned is graded as the
//      judged-by-looks misconception; checking with NO pick fires the
//      unaligned diagnosis; only aligned + answerId is correct. Drag on the
//      bar is redundant with the per-bar range slider (keyboard parity).
//   2. fractionBar `commonFractions` (per-value traps matched on the EXACT
//      build before the direction-generic low/high), `showTarget:false`
//      (reference bar hidden when the prompt names the target), and
//      `notation:"words"` (Grade 1–2 part-language; a numerator pinned by
//      numMin === numMax renders no slider).
//   3. numberLinePlace `fractionDen` (jump-unit fraction line, endpoints 0
//      and 1, interior ticks unlabeled, positional readout) and
//      `commonPlacements` (per-value landings diagnosed first).
//
// Integrity rules for all three are pinned too, so dead/unreachable feedback
// configurations are rejected before they can ship.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "@/lib/schema";
import { canCheck, correctAnswerText, evaluate } from "@/lib/evaluate";
import { widgetWrongPaths } from "@/lib/pedagogy";

afterEach(cleanup);

function pinRect(svg: SVGSVGElement, w: number, h: number) {
  svg.getBoundingClientRect = () =>
    ({ left: 0, top: 0, x: 0, y: 0, width: w, height: h, right: w, bottom: h, toJSON: () => ({}) }) as DOMRect;
}

function mount(spec: TWidget, disabled = false, tone?: "neutral" | "success" | "error" | "info") {
  const holder: { v: unknown } = { v: null };
  function Host() {
    const [value, setValue] = useState<unknown>(null);
    return (
      <WidgetRenderer
        spec={spec}
        value={value}
        onChange={(v) => {
          holder.v = v;
          setValue(v);
        }}
        disabled={disabled}
        tone={tone}
      />
    );
  }
  const utils = render(<Host />);
  return { holder, ...utils };
}

/* ---------------- lengthCompare mode:"align" ---------------- */

const alignSpec = WidgetSpec.parse({
  type: "lengthCompare",
  mode: "align",
  prompt: "Line up the starting ends, then tap the longer ribbon.",
  items: [
    {
      id: "top",
      label: "top ribbon",
      length: 5,
      startOffset: 3,
      feedback: "That end only sticks out because it started ahead — line the starting ends up first."
    },
    { id: "bottom", label: "bottom ribbon", length: 7 }
  ],
  answerId: "bottom",
  unalignedFeedback: "You cannot tell yet — line up the starting ends first.",
  missFeedback: "Now the starts match — the longer ribbon is the one whose end reaches farther.",
  successFeedback: "Yes — same start line, then the bottom ribbon reaches farther."
}) as TWidget;

describe("lengthCompare align mode: grading", () => {
  it("null value (nothing done) is checkable and fires the unaligned diagnosis", () => {
    expect(canCheck(alignSpec, null)).toBe(true);
    expect(evaluate(alignSpec, null)).toEqual({
      correct: false,
      feedback: "You cannot tell yet — line up the starting ends first."
    });
  });

  it("a pick while unaligned is graded with that bar's authored pre-align diagnosis", () => {
    const v = { offsets: { top: 3, bottom: 0 }, picked: "top" };
    expect(evaluate(alignSpec, v).correct).toBe(false);
    expect(evaluate(alignSpec, v).feedback).toContain("started ahead");
  });

  it("a pick of a bar WITHOUT its own pre-align feedback falls back to unalignedFeedback", () => {
    const v = { offsets: { top: 2, bottom: 0 }, picked: "bottom" };
    expect(evaluate(alignSpec, v).feedback).toBe("You cannot tell yet — line up the starting ends first.");
  });

  it("aligned + wrong pick → missFeedback; aligned + answerId → success", () => {
    const zero = { top: 0, bottom: 0 };
    expect(evaluate(alignSpec, { offsets: zero, picked: "top" })).toEqual({
      correct: false,
      feedback: "Now the starts match — the longer ribbon is the one whose end reaches farther."
    });
    expect(evaluate(alignSpec, { offsets: zero, picked: "bottom" })).toEqual({
      correct: true,
      feedback: "Yes — same start line, then the bottom ribbon reaches farther."
    });
  });

  it("aligned with no pick is NOT checkable; unaligned always is", () => {
    expect(canCheck(alignSpec, { offsets: { top: 0, bottom: 0 }, picked: null })).toBe(false);
    expect(canCheck(alignSpec, { offsets: { top: 1, bottom: 0 }, picked: null })).toBe(true);
    expect(canCheck(alignSpec, { offsets: { top: 0, bottom: 0 }, picked: "bottom" })).toBe(true);
  });

  it("reveal text names the procedure, not just the label", () => {
    expect(correctAnswerText(alignSpec)).toBe("line up the starting ends, then bottom ribbon");
  });

  it("wrong paths include the unaligned diagnosis (reachability lint sees it)", () => {
    expect(widgetWrongPaths(alignSpec)).toContain("You cannot tell yet — line up the starting ends first.");
  });
});

describe("lengthCompare align mode: renderer", () => {
  it("initializes the value with the authored offsets, unaligned status shown", () => {
    const { holder } = mount(alignSpec);
    expect(holder.v).toEqual({ offsets: { top: 3, bottom: 0 }, picked: null });
    expect(screen.getByRole("status").textContent).toContain("not lined up yet");
  });

  it("the range slider (keyboard path) slides the starting end to the line and flips the status", () => {
    const { holder } = mount(alignSpec);
    const slider = screen.getByRole("slider", { name: "Move top ribbon's starting end to the start line" });
    fireEvent.change(slider, { target: { value: "0" } });
    expect(holder.v).toEqual({ offsets: { top: 0, bottom: 0 }, picked: null });
    expect(screen.getByRole("status").textContent).toContain("lined up — the compare is fair");
  });

  it("press/drag on the head-start bar's row snaps its offset to the unit lattice", () => {
    // Geometry: x0 = 18, total = max(3+5, 7) = 8, u = (340 − 18 − 14)/8 = 38.5;
    // row 0 spans y ∈ [24, 70). Pressing at x = 18 + 1·38.5 lands offset 1;
    // pressing on the line (x = 18) lands offset 0.
    const { holder, container } = mount(alignSpec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 340, 126);
    const hit = screen.getByTestId("lc-drag");
    fireEvent.pointerDown(hit, { clientX: 18 + 38.5, clientY: 40 });
    expect((holder.v as { offsets: Record<string, number> }).offsets.top).toBe(1);
    fireEvent.pointerMove(hit, { clientX: 18, clientY: 40 });
    expect((holder.v as { offsets: Record<string, number> }).offsets.top).toBe(0);
    fireEvent.pointerUp(hit, { clientX: 18, clientY: 40 });
  });

  it("dragging on a bar that started ON the line is a no-op", () => {
    const { holder, container } = mount(alignSpec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 340, 126);
    const before = JSON.stringify(holder.v);
    fireEvent.pointerDown(screen.getByTestId("lc-drag"), { clientX: 100, clientY: 90 }); // row 1
    expect(JSON.stringify(holder.v)).toBe(before);
  });

  it("tapping an answer records the pick without touching the offsets", () => {
    const { holder } = mount(alignSpec);
    fireEvent.click(screen.getByRole("radio", { name: "bottom ribbon" }));
    expect(holder.v).toEqual({ offsets: { top: 3, bottom: 0 }, picked: "bottom" });
  });

  it("finalized (disabled) removes the drag surface and disables slider + radios", () => {
    mount(alignSpec, true);
    expect(screen.queryByTestId("lc-drag")).toBeNull();
    expect(screen.getByRole("slider", { name: /starting end/ })).toHaveProperty("disabled", true);
    expect(screen.getByRole("radio", { name: "bottom ribbon" })).toHaveProperty("disabled", true);
  });

  it("error tone while unaligned shows the direction-only chevron cue; reveal ghosts the answer bar", () => {
    const { unmount } = mount(alignSpec, false, "error");
    expect(screen.getByTestId("lc-cue")).toBeTruthy();
    unmount();
    mount(alignSpec, true, "info");
    expect(screen.getByTestId("lc-ghost")).toBeTruthy();
  });

  it("pick mode (v1) still renders bar-buttons with no start line, status, or sliders", () => {
    const v1 = WidgetSpec.parse({
      type: "lengthCompare",
      prompt: "Which is longer? Tap it.",
      items: [
        { id: "a", label: "pencil", length: 5 },
        { id: "b", label: "eraser", length: 3 }
      ],
      answerId: "a",
      missFeedback: "Compare the bars from their shared left edge.",
      successFeedback: "Yes — the pencil bar reaches farther."
    }) as TWidget;
    mount(v1);
    expect(screen.getByRole("radio", { name: "pencil" })).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("slider")).toBeNull();
  });
});

describe("lengthCompare align mode: integrity rules", () => {
  const base = {
    type: "lengthCompare",
    prompt: "p",
    items: [
      { id: "a", label: "a", length: 5, startOffset: 3 },
      { id: "b", label: "b", length: 7 }
    ],
    answerId: "b",
    missFeedback: "Compare from the same start line — the longer bar reaches farther.",
    successFeedback: "Yes."
  };
  const parse = (over: object) => WidgetSpec.parse({ ...base, ...over }) as TWidget;

  it("align mode with every startOffset 0 begins solved — rejected", () => {
    const s = parse({
      mode: "align",
      items: [
        { id: "a", label: "a", length: 5 },
        { id: "b", label: "b", length: 7 }
      ]
    });
    expect(widgetIntegrityErrors(s).join(" ")).toContain("begins solved");
  });

  it("staggered starts in pick mode can never be lined up — rejected", () => {
    expect(widgetIntegrityErrors(parse({})).join(" ")).toContain("never be lined up");
  });

  it("unalignedFeedback in pick mode is dead feedback — rejected", () => {
    const s = parse({
      items: [
        { id: "a", label: "a", length: 5 },
        { id: "b", label: "b", length: 7 }
      ],
      unalignedFeedback: "You cannot tell yet — line the starting ends up first."
    });
    expect(widgetIntegrityErrors(s).join(" ")).toContain("dead feedback");
  });

  it("align mode is horizontal-only; answerId must name an item", () => {
    expect(widgetIntegrityErrors(parse({ mode: "align", orientation: "v" })).join(" ")).toContain("horizontal-only");
    expect(widgetIntegrityErrors(parse({ answerId: "zz" })).join(" ")).toContain("not one of the item ids");
  });
});

/* ---------------- fractionBar commonFractions / showTarget / notation ---------------- */

const partitionSpec = WidgetSpec.parse({
  type: "fractionBar",
  notation: "words",
  showTarget: false,
  prompt: "Split the bar into equal parts so each part is a half.",
  targetNum: 1,
  targetDen: 2,
  numMin: 1,
  numMax: 1,
  denMin: 1,
  denMax: 6,
  numStart: 1,
  denStart: 1,
  commonFractions: [
    { num: 1, den: 4, feedback: "Splitting into 4 makes fourths, not halves — a half needs exactly 2 equal parts." },
    { num: 1, den: 1, feedback: "One part is the WHOLE bar, not a half — split it into 2 equal parts." }
  ],
  successFeedback: "Yes — 2 equal parts, and each one is a half.",
  lowFeedback: "Each of your parts is smaller than a half — too many pieces.",
  highFeedback: "Each of your parts is bigger than a half — split into more pieces."
}) as TWidget;

describe("fractionBar per-value traps", () => {
  it("the EXACT trapped build gets its own diagnosis, before the low/high fallbacks", () => {
    expect(evaluate(partitionSpec, { n: 1, d: 4 }).feedback).toContain("fourths, not halves");
    expect(evaluate(partitionSpec, { n: 1, d: 1 }).feedback).toContain("WHOLE bar");
  });

  it("untrapped wrong builds still get the direction-generic diagnosis", () => {
    expect(evaluate(partitionSpec, { n: 1, d: 3 }).feedback).toContain("smaller than a half");
  });

  it("an equivalent of a trap does NOT borrow its diagnosis (2/8 = trap-value 1/4 → low, not trap)", () => {
    const wide = WidgetSpec.parse({
      type: "fractionBar",
      prompt: "Build 1/2.",
      targetNum: 1,
      targetDen: 2,
      commonFractions: [{ num: 1, den: 4, feedback: "That build is one fourth — halves need exactly 2 equal parts." }],
      successFeedback: "Equal to a half.",
      lowFeedback: "Below a half.",
      highFeedback: "Above a half."
    }) as TWidget;
    expect(evaluate(wide, { n: 2, d: 8 }).feedback).toBe("Below a half.");
  });

  it("a correct (equivalent) build wins over everything", () => {
    expect(evaluate(partitionSpec, { n: 1, d: 2 })).toEqual({
      correct: true,
      feedback: "Yes — 2 equal parts, and each one is a half."
    });
  });

  it("wrong paths include every trap (reachability lint sees them)", () => {
    const paths = widgetWrongPaths(partitionSpec);
    expect(paths.some((p) => p.includes("fourths, not halves"))).toBe(true);
    expect(paths.some((p) => p.includes("WHOLE bar"))).toBe(true);
  });

  it("integrity: a trap equal to the target value, out-of-bounds, or duplicated is rejected", () => {
    const mk = (traps: object[]) =>
      WidgetSpec.parse({
        type: "fractionBar",
        prompt: "p",
        targetNum: 1,
        targetDen: 2,
        denMax: 6,
        commonFractions: traps,
        successFeedback: "s",
        lowFeedback: "l",
        highFeedback: "h"
      }) as TWidget;
    expect(widgetIntegrityErrors(mk([{ num: 2, den: 4, feedback: "f" }])).join(" ")).toContain("equals the target value");
    expect(widgetIntegrityErrors(mk([{ num: 1, den: 9, feedback: "f" }])).join(" ")).toContain("outside the slider bounds");
    expect(
      widgetIntegrityErrors(
        mk([
          { num: 1, den: 4, feedback: "f1" },
          { num: 1, den: 4, feedback: "f2" }
        ])
      ).join(" ")
    ).toContain("duplicate trap");
  });
});

describe("fractionBar words notation + hidden target + pinned numerator", () => {
  it("speaks part-language, hides the target row, and renders no numerator slider", () => {
    const { container } = mount(partitionSpec);
    expect(container.textContent).toContain("1 of 1 equal part");
    expect(container.textContent).not.toContain("target");
    expect(screen.queryByRole("slider", { name: "shaded parts" })).toBeNull();
    expect(screen.queryByRole("slider", { name: "numerator" })).toBeNull();
    const den = screen.getByRole("slider", { name: "equal parts" });
    fireEvent.change(den, { target: { value: "2" } });
    expect(container.textContent).toContain("1 of 2 equal parts");
    expect(container.textContent).not.toContain("✓ equal"); // no self-answering cue with the target hidden
  });

  it("symbol notation with a movable numerator is unchanged (v1 path)", () => {
    const v1 = WidgetSpec.parse({
      type: "fractionBar",
      prompt: "Build a fraction equal to 1/2.",
      targetNum: 1,
      targetDen: 2,
      successFeedback: "s",
      lowFeedback: "l",
      highFeedback: "h"
    }) as TWidget;
    const { container } = mount(v1);
    expect(screen.getByRole("slider", { name: "numerator" })).toBeTruthy();
    expect(container.textContent).toContain("target");
  });
});

/* ---------------- numberLinePlace fractionDen / commonPlacements ---------------- */

const fractionLine = WidgetSpec.parse({
  type: "numberLinePlace",
  prompt: "Place the marker at 1/4.",
  min: 0,
  max: 4,
  step: 1,
  tickStep: 1,
  fractionDen: 4,
  target: 1,
  start: 0,
  commonPlacements: [
    { value: 4, feedback: "That's 4 of 4 jumps — the whole line, which is 1, not 1/4." },
    { value: 3, feedback: "Three of the four jumps is 3/4, not 1/4." }
  ],
  successFeedback: "Yes — one jump of the four lands on 1/4.",
  lowFeedback: "Take one jump right to reach 1/4.",
  highFeedback: "Too many jumps for 1/4."
}) as TWidget;

describe("numberLinePlace fraction line", () => {
  it("per-value landings are diagnosed before the direction fallbacks", () => {
    expect(evaluate(fractionLine, 4).feedback).toContain("the whole line");
    expect(evaluate(fractionLine, 3).feedback).toContain("3/4, not 1/4");
    expect(evaluate(fractionLine, 2).feedback).toBe("Too many jumps for 1/4.");
    expect(evaluate(fractionLine, 1).correct).toBe(true);
  });

  it("reveal text speaks the fraction, and wrong paths include every landing", () => {
    expect(correctAnswerText(fractionLine)).toBe("1/4 (mark 1 of 4)");
    const paths = widgetWrongPaths(fractionLine);
    expect(paths.some((p) => p.includes("whole line"))).toBe(true);
  });

  it("renders endpoints 0 and 1, unlabeled interior ticks, and a positional readout", () => {
    const { container } = mount(fractionLine);
    const svgTexts = Array.from(container.querySelectorAll("svg text")).map((t) => t.textContent);
    expect(svgTexts).toContain("0");
    expect(svgTexts).toContain("1");
    expect(svgTexts).not.toContain("2");
    expect(svgTexts).not.toContain("3");
    expect(container.textContent).toContain("mark 0 of 4");
    fireEvent.change(screen.getByRole("slider"), { target: { value: "1" } });
    expect(container.textContent).toContain("mark 1 of 4");
    expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toBe("mark 1 of 4");
  });

  it("integrity: fraction-line contract and landing rules are enforced", () => {
    const mk = (over: object) =>
      WidgetSpec.parse({
        type: "numberLinePlace",
        prompt: "p",
        min: 0,
        max: 4,
        step: 1,
        tickStep: 1,
        target: 1,
        start: 0,
        successFeedback: "s",
        lowFeedback: "l",
        highFeedback: "h",
        ...over
      }) as TWidget;
    expect(widgetIntegrityErrors(mk({ fractionDen: 4, max: 8 })).join(" ")).toContain("jump units");
    expect(widgetIntegrityErrors(mk({ commonPlacements: [{ value: 1, feedback: "f" }] })).join(" ")).toContain(
      "equals the target"
    );
    expect(widgetIntegrityErrors(mk({ commonPlacements: [{ value: 9, feedback: "f" }] })).join(" ")).toContain(
      "off the [0, 4] line"
    );
    expect(widgetIntegrityErrors(mk({ commonPlacements: [{ value: 2.5, feedback: "f" }] })).join(" ")).toContain(
      "off the step lattice"
    );
    expect(widgetIntegrityErrors(mk({})).length).toBe(0);
  });
});
