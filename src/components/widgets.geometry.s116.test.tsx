// @vitest-environment jsdom
//
// G10 GEOMETRY ENGINE-ENHANCEMENT REGRESSION SUITE (Conversion Playbook §3, Block 3).
//
//   (a) triangleConstraintLab.constraint  — a lock the learner can deliberately BREAK
//   (b) dilationExplore.showRatios        — k / k² / k³ readouts, and the side-splitter stage
//   (c) triangleSolve mode "ratios"       — two dials, only one of which moves the ratio
//   (d) compassConstruct classical modes  — same grammar, five different equidistances
//   (e) quadDrag kite + showMidsegment    — classifier repair and a theorem as a live number
//
// Backward compatibility is pinned FIRST in every block: eight shipped geometry engines and the
// widget gallery depend on the pre-S116 specs parsing and grading byte-identically.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import {
  WidgetSpec,
  widgetIntegrityErrors,
  midsegmentLength,
  quadName,
  triangleRatio,
  type TWidget,
} from "@/lib/schema";
import { correctAnswerText, evaluate } from "@/lib/evaluate";

afterEach(cleanup);

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

/* ================= shared truth ================= */

describe("triangleRatio / midsegmentLength — the numbers the renderer and grader share", () => {
  it("the three ratios are scale-free by construction: no length can enter", () => {
    // The function takes only an angle. This is the guarantee (c) exists to make visible.
    expect(triangleRatio(30, "opp/hyp")).toBeCloseTo(0.5, 9);
    expect(triangleRatio(60, "adj/hyp")).toBeCloseTo(0.5, 9);
    expect(triangleRatio(45, "opp/adj")).toBeCloseTo(1, 9);
  });

  it("the midsegment is the average of the two parallel sides", () => {
    expect(midsegmentLength(6, 10)).toBe(8);
    expect(midsegmentLength(5, 5)).toBe(5); // a parallelogram: the average of equals
  });
});

/* ================= (e) quadDrag ================= */

describe("(e) quadName — the kite classifier caught both orientations", () => {
  it("classifies a kite whose equal pairs are (s0,s1)+(s2,s3)", () => {
    // Sides: AB=AD short pair adjacent, CB=CD long pair adjacent.
    expect(quadName([[0, 0], [2, 2], [0, 6], [-2, 2]])).toBe("a kite");
  });

  it("REGRESSION: classifies a kite whose equal pairs are (s1,s2)+(s3,s0)", () => {
    // The same kite listed starting one vertex later. Before the S116 repair this returned
    // "just a quadrilateral" — the shape was a kite and the model refused to say so.
    expect(quadName([[2, 2], [0, 6], [-2, 2], [0, 0]])).toBe("a kite");
  });

  it("does not promote squares, rhombi, rectangles or parallelograms to kites", () => {
    expect(quadName([[0, 0], [4, 0], [4, 4], [0, 4]])).toBe("a square");
    expect(quadName([[0, 0], [6, 0], [6, 3], [0, 3]])).toBe("a rectangle");
    expect(quadName([[0, 0], [6, 0], [8, 3], [2, 3]])).toBe("a parallelogram");
  });

  it("still reports a plain quadrilateral when no pair matches", () => {
    expect(quadName([[0, 0], [5, 0], [6, 4], [1, 7]])).toBe("just a quadrilateral");
  });
});

const quadBase = {
  type: "quadDrag",
  prompt: "Place the fourth corner.",
  fixed: [[0, 0], [6, 0], [8, 3]],
  targetX: 2,
  targetY: 3,
  startX: 0,
  startY: 0,
  gridMax: 8,
  targetName: "a parallelogram",
  successFeedback: "s",
  sideFeedback: "side",
  angleFeedback: "angle",
} as const;

describe("(e) quadDrag — midsegment readout", () => {
  it("pre-S116 specs parse with no new keys and grade unchanged", () => {
    const parsed = WidgetSpec.parse(quadBase);
    expect("showMidsegment" in parsed).toBe(false);
    const s = parsed as TWidget;
    expect(evaluate(s, { x: 2, y: 3 }).correct).toBe(true);
    expect(evaluate(s, { x: 4, y: 3 }).feedback).toBe("side");
    expect(evaluate(s, { x: 2, y: 5 }).feedback).toBe("angle");
    mount(s);
    expect(screen.queryByTestId("qd-midsegment")).toBeNull();
  });

  it("renders the join and a readout equal to the average of the parallel pair", () => {
    mount(WidgetSpec.parse({ ...quadBase, showMidsegment: true }) as TWidget);
    fireEvent.change(screen.getByLabelText("fourth corner across"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("fourth corner up"), { target: { value: "3" } });
    expect(screen.getByTestId("qd-midsegment")).toBeTruthy();
    // At the target this is a parallelogram (sides 6 and 6), so the midsegment reads 6.
    expect(screen.getByTestId("qd-ms-readout").textContent).toMatch(/midsegment 6\.00 = the average of 6\.00 and 6\.00/);
  });

  it("integrity refuses the readout on a shape with no parallel pair", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse({ ...quadBase, showMidsegment: true }) as TWidget)).toEqual([]);
    const kite = {
      ...quadBase,
      fixed: [[0, 0], [2, 2], [0, 6]],
      targetX: -2,
      targetY: 2,
      targetName: "a kite",
      showMidsegment: true,
    };
    // S120: the gate now tests the base pair directly instead of proxying through the shape
    // name, so the message names the pair. The contract asserted here is unchanged — a kite has
    // no parallel pair and is still refused.
    expect(widgetIntegrityErrors(WidgetSpec.parse(kite) as TWidget).join(" ")).toMatch(
      /showMidsegment on a kite — sides AB and CD are not a parallel pair/
    );
    // …and the case the old name-proxy wrongly refused now passes: a trapezoid.
    const trapezoid = {
      ...quadBase,
      fixed: [[0, 0], [8, 0], [6, 4]],
      targetX: 2,
      targetY: 4,
      targetName: "a trapezoid",
      showMidsegment: true,
    };
    expect(widgetIntegrityErrors(WidgetSpec.parse(trapezoid) as TWidget)).toEqual([]);
  });
});

/* ================= (c) triangleSolve ratios ================= */

const tsSas = {
  type: "triangleSolve",
  prompt: "Set the included angle.",
  mode: "sas",
  a: 5,
  b: 8,
  target: 9,
  start: 30,
  successFeedback: "s",
  lowFeedback: "lo",
  highFeedback: "hi",
} as const;

const tsRatios = {
  type: "triangleSolve",
  prompt: "Find the angle where opp/hyp reads 0.500 — then resize and watch it hold.",
  mode: "ratios",
  a: 6,
  b: 6,
  target: 30,
  start: 55,
  ratio: "opp/hyp",
  requiredScaleMoves: 2,
  scaleFeedback: "untested",
  successFeedback: "s",
  lowFeedback: "lo",
  highFeedback: "hi",
} as const;

describe("(c) triangleSolve — sas/sss are untouched", () => {
  it("parses with no ratios keys and keeps its bare-number value", () => {
    const parsed = WidgetSpec.parse(tsSas);
    for (const k of ["ratio", "requiredScaleMoves", "scaleFeedback"]) expect(k in parsed).toBe(false);
    const s = parsed as TWidget;
    expect(evaluate(s, 90).correct).toBe(false);
    expect(typeof evaluate(s, 30).feedback).toBe("string");
    expect(correctAnswerText(s)).toBe("9 (the third side)");
  });

  it("integrity rejects ratios-only fields on sas", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse(tsSas) as TWidget)).toEqual([]);
    expect(
      widgetIntegrityErrors(WidgetSpec.parse({ ...tsSas, ratio: "opp/hyp" }) as TWidget).join(" ")
    ).toMatch(/ratios-only fields set on mode "sas"/);
  });
});

describe("(c) triangleSolve ratios — two dials, only one moves the ratio", () => {
  it("integrity demands the evidence fields and a hunt with an actual signal", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse(tsRatios) as TWidget)).toEqual([]);
    const noEvidence = { ...tsRatios } as Record<string, unknown>;
    delete noEvidence.requiredScaleMoves;
    expect(widgetIntegrityErrors(WidgetSpec.parse(noEvidence) as TWidget).join(" ")).toMatch(/requiredScaleMoves/);
    const noFb = { ...tsRatios } as Record<string, unknown>;
    delete noFb.scaleFeedback;
    expect(widgetIntegrityErrors(WidgetSpec.parse(noFb) as TWidget).join(" ")).toMatch(/scaleFeedback/);
    expect(
      widgetIntegrityErrors(WidgetSpec.parse({ ...tsRatios, target: 120 }) as TWidget).join(" ")
    ).toMatch(/must be an acute angle/);
    expect(
      widgetIntegrityErrors(WidgetSpec.parse({ ...tsRatios, start: 30 }) as TWidget).join(" ")
    ).toMatch(/start equals target|no drag is required/);
  });

  it("renders both dials and all three ratio readouts", () => {
    mount(WidgetSpec.parse(tsRatios) as TWidget);
    expect(screen.getByTestId("tr-angle")).toBeTruthy();
    expect(screen.getByTestId("tr-scale")).toBeTruthy();
    expect(screen.getByTestId("tr-ratio-opp-hyp")).toBeTruthy();
    expect(screen.getByTestId("tr-ratio-adj-hyp")).toBeTruthy();
    expect(screen.getByTestId("tr-ratio-opp-adj")).toBeTruthy();
  });

  it("THE LESSON: resizing changes every side length and changes no ratio at all", () => {
    mount(WidgetSpec.parse(tsRatios) as TWidget);
    const ratioBefore = screen.getByTestId("tr-ratio-opp-hyp").textContent;
    const adjBefore = screen.getByTestId("tr-adj").textContent;
    const hypBefore = screen.getByTestId("tr-hyp").textContent;
    fireEvent.change(screen.getByTestId("tr-scale"), { target: { value: "3" } });
    expect(screen.getByTestId("tr-adj").textContent).not.toBe(adjBefore); // lengths moved
    expect(screen.getByTestId("tr-hyp").textContent).not.toBe(hypBefore);
    expect(screen.getByTestId("tr-ratio-opp-hyp").textContent).toBe(ratioBefore); // ratio did not
  });

  it("and the angle dial moves the ratio — the contrast that makes the invariance meaningful", () => {
    mount(WidgetSpec.parse(tsRatios) as TWidget);
    const before = screen.getByTestId("tr-ratio-opp-hyp").textContent;
    fireEvent.change(screen.getByTestId("tr-angle"), { target: { value: "30" } });
    expect(screen.getByTestId("tr-ratio-opp-hyp").textContent).not.toBe(before);
  });

  it("counts scale moves and reports the invariance once it has been tested", () => {
    const { holder } = mount(WidgetSpec.parse(tsRatios) as TWidget);
    expect(screen.getByTestId("tr-status").textContent).toMatch(/Resize the triangle to test/);
    fireEvent.change(screen.getByTestId("tr-scale"), { target: { value: "2" } });
    fireEvent.change(screen.getByTestId("tr-scale"), { target: { value: "2.5" } });
    expect((holder.v as { scaleMoves: number }).scaleMoves).toBe(2);
    expect(screen.getByTestId("tr-status").textContent).toMatch(/the three ratios did not move at all/);
  });

  it("grading: untested invariance is its own wrong path, ahead of the angle", () => {
    const s = WidgetSpec.parse(tsRatios) as TWidget;
    // Right angle, but the learner never resized — they have not seen the fact yet.
    expect(evaluate(s, { angle: 30, scale: 1, scaleMoves: 0 }).feedback).toBe("untested");
    expect(evaluate(s, { angle: 30, scale: 1, scaleMoves: 2 }).correct).toBe(true);
    expect(evaluate(s, { angle: 20, scale: 2, scaleMoves: 2 }).feedback).toBe("lo");
    expect(evaluate(s, { angle: 60, scale: 2, scaleMoves: 2 }).feedback).toBe("hi");
    // Scale is irrelevant to correctness — that is the whole claim.
    expect(evaluate(s, { angle: 30, scale: 3, scaleMoves: 2 }).correct).toBe(true);
    expect(correctAnswerText(s)).toMatch(/30° — where opp\/hyp reads 0\.500/);
  });
});

/* ================= (a) triangleConstraintLab ================= */

const tclBase = {
  type: "triangleConstraintLab",
  prompt: "Do these givens lock one triangle?",
  targetCriterion: "SAS",
  startCriterion: "SSA",
  sideA: 5,
  sideB: 8,
  targetAngle: 60,
  angleStart: 35,
  angleStep: 5,
  requiredMoves: 3,
  successFeedback: "s",
  criterionFeedback: "crit",
  angleFeedback: "ang",
  evidenceFeedback: "ev",
} as const;

describe("(a) triangleConstraintLab — the lock the learner can break", () => {
  it("pre-S116 specs parse with no constraint keys and grade unchanged", () => {
    const parsed = WidgetSpec.parse(tclBase);
    expect("constraint" in parsed).toBe(false);
    const s = parsed as TWidget;
    expect(evaluate(s, { criterion: "SAS", angle: 60, flipped: false, moves: 1 }).feedback).toBe("ev");
    expect(evaluate(s, { criterion: "SSA", angle: 60, flipped: false, moves: 5 }).feedback).toBe("crit");
    expect(evaluate(s, { criterion: "SAS", angle: 35, flipped: false, moves: 5 }).feedback).toBe("ang");
    expect(evaluate(s, { criterion: "SAS", angle: 60, flipped: false, moves: 5 }).correct).toBe(true);
    mount(s);
    expect(screen.queryByTestId("tcl-lock")).toBeNull();
  });

  it("integrity pairs constraint with its feedback in both directions", () => {
    const withC = { ...tclBase, constraint: "isoscelesLegs", constraintFeedback: "broke" };
    expect(widgetIntegrityErrors(WidgetSpec.parse(withC) as TWidget)).toEqual([]);
    const noFb = { ...tclBase, constraint: "isoscelesLegs" };
    expect(widgetIntegrityErrors(WidgetSpec.parse(noFb) as TWidget).join(" ")).toMatch(/needs `constraintFeedback`/);
    const orphan = { ...tclBase, constraintFeedback: "broke" };
    expect(widgetIntegrityErrors(WidgetSpec.parse(orphan) as TWidget).join(" ")).toMatch(/without `constraint`/);
  });

  it("isosceles: the base angles read equal while locked and diverge once released", () => {
    const s = WidgetSpec.parse({ ...tclBase, constraint: "isoscelesLegs", constraintFeedback: "broke" }) as TWidget;
    const { holder } = mount(s);
    const readouts = screen.getByTestId("tcl-constraint").textContent ?? "";
    // Locked: both base angles are (180 − apex)/2, so the two readouts agree.
    const nums = readouts.match(/[\d.]+°/g) ?? [];
    expect(nums.length).toBe(2);
    expect(nums[0]).toBe(nums[1]);
    fireEvent.click(screen.getByTestId("tcl-lock"));
    expect((holder.v as { constraintBroken: boolean }).constraintBroken).toBe(true);
    const after = (screen.getByTestId("tcl-constraint").textContent ?? "").match(/[\d.]+°/g) ?? [];
    expect(after[0]).not.toBe(after[1]);
  });

  it("checking while released is its own diagnosable state, ahead of the criterion", () => {
    const s = WidgetSpec.parse({ ...tclBase, constraint: "isoscelesLegs", constraintFeedback: "broke" }) as TWidget;
    expect(
      evaluate(s, { criterion: "SAS", angle: 60, flipped: false, moves: 5, constraintBroken: true }).feedback
    ).toBe("broke");
    expect(
      evaluate(s, { criterion: "SAS", angle: 60, flipped: false, moves: 5, constraintBroken: false }).correct
    ).toBe(true);
  });
});

/* ================= (b) dilationExplore ================= */

const dlBase = {
  type: "dilationExplore",
  prompt: "Set the scale factor.",
  shape: [[1, 1], [4, 1], [4, 3]],
  center: [0, 0],
  targetK: 2,
  kMin: 0.5,
  kMax: 3,
  kStep: 0.5,
  kStart: 1,
  gridMin: 0,
  gridMax: 8,
  successFeedback: "s",
  lowFeedback: "lo",
  highFeedback: "hi",
} as const;

describe("(b) dilationExplore — k, k², k³ under one drag", () => {
  it("pre-S116 specs parse with no showRatios and render no readouts", () => {
    const parsed = WidgetSpec.parse(dlBase);
    expect("showRatios" in parsed).toBe(false);
    mount(parsed as TWidget);
    expect(screen.queryByTestId("dl-ratios")).toBeNull();
    expect(evaluate(parsed as TWidget, { k: 2 }).correct).toBe(true);
  });

  it("the three readouts move at three speeds — measured, not asserted", () => {
    mount(WidgetSpec.parse({ ...dlBase, showRatios: ["length", "area", "volume"] }) as TWidget);
    fireEvent.change(screen.getByLabelText("scale factor"), { target: { value: "2" } });
    expect(screen.getByTestId("dl-ratio-length").textContent).toMatch(/2\.00/);
    expect(screen.getByTestId("dl-ratio-area").textContent).toMatch(/4\.00/);
    expect(screen.getByTestId("dl-ratio-volume").textContent).toMatch(/8\.00/);
    fireEvent.change(screen.getByLabelText("scale factor"), { target: { value: "3" } });
    expect(screen.getByTestId("dl-ratio-length").textContent).toMatch(/3\.00/);
    expect(screen.getByTestId("dl-ratio-area").textContent).toMatch(/9\.00/);
    expect(screen.getByTestId("dl-ratio-volume").textContent).toMatch(/27\.00/);
  });

  it("integrity rejects duplicates and mixing segments with the scale readouts", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse({ ...dlBase, showRatios: ["area"] }) as TWidget)).toEqual([]);
    expect(
      widgetIntegrityErrors(WidgetSpec.parse({ ...dlBase, showRatios: ["area", "area"] }) as TWidget).join(" ")
    ).toMatch(/duplicate entries/);
    expect(
      widgetIntegrityErrors(
        WidgetSpec.parse({ ...dlBase, showRatios: ["segments", "area"], kMin: 0.25, kMax: 0.75, targetK: 0.5 }) as TWidget
      ).join(" ")
    ).toMatch(/cannot be combined/);
  });
});

const ssSpec = {
  ...dlBase,
  prompt: "Slide the parallel cut and watch the two ratios.",
  shape: [[1, 7], [1, 1], [7, 1]],
  kMin: 0.25,
  kMax: 0.75,
  kStep: 0.25,
  kStart: 0.25,
  targetK: 0.5,
  showRatios: ["segments"],
} as const;

describe("(b) dilationExplore segments — the side-splitter", () => {
  it("integrity keeps the cutter strictly inside the triangle", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse(ssSpec) as TWidget)).toEqual([]);
    expect(
      widgetIntegrityErrors(WidgetSpec.parse({ ...ssSpec, kMax: 1 }) as TWidget).join(" ")
    ).toMatch(/must stay inside \(0, 1\)/);
    expect(
      widgetIntegrityErrors(WidgetSpec.parse({ ...ssSpec, shape: [[0, 0], [4, 0], [4, 4], [0, 4]] }) as TWidget).join(" ")
    ).toMatch(/needs exactly 3 vertices/);
  });

  it("re-stages as a cut triangle, not a dilation", () => {
    mount(WidgetSpec.parse(ssSpec) as TWidget);
    expect(screen.getByTestId("spl-cutter")).toBeTruthy();
    expect(screen.getByTestId("spl-dial")).toBeTruthy();
    expect(screen.queryByLabelText("scale factor")).toBeNull();
  });

  it("THE THEOREM: the two ratios agree wherever the cutter is put", () => {
    mount(WidgetSpec.parse(ssSpec) as TWidget);
    const num = (id: string) => {
      const m = (screen.getByTestId(id).textContent ?? "").match(/[\d.]+$/);
      return m ? Number(m[0]) : NaN;
    };
    const seen: number[] = [];
    for (const pos of ["0.25", "0.5", "0.75"]) {
      fireEvent.change(screen.getByTestId("spl-dial"), { target: { value: pos } });
      const ab = num("spl-ratio-ab"), ac = num("spl-ratio-ac");
      expect(Number.isFinite(ab)).toBe(true);
      expect(ab, `cutter at ${pos}`).toBeCloseTo(ac, 6); // the two ratios never disagree
      expect(screen.getByTestId("spl-status").textContent).toMatch(/agree/);
      seen.push(ab);
    }
    // ...and the agreement is not the trivial kind: the shared value itself moves with the cutter,
    // so what holds is the EQUALITY, not a constant.
    expect(new Set(seen).size).toBe(3);
  });

  it("the midpoint cut is named as the midsegment special case", () => {
    mount(WidgetSpec.parse(ssSpec) as TWidget);
    fireEvent.change(screen.getByTestId("spl-dial"), { target: { value: "0.5" } });
    expect(screen.getByTestId("spl-status").textContent).toMatch(/midsegment/);
    expect(screen.getByTestId("spl-ratio-ab").textContent).toMatch(/1\.00/);
  });

  it("grades the cutter position and keeps the reveal ghost", () => {
    const s = WidgetSpec.parse(ssSpec) as TWidget;
    expect(evaluate(s, { k: 0.5 }).correct).toBe(true);
    expect(evaluate(s, { k: 0.25 }).feedback).toBe("lo");
    expect(evaluate(s, { k: 0.75 }).feedback).toBe("hi");
    mount(s, false, "info");
    expect(screen.getByTestId("spl-ghost")).toBeTruthy();
  });
});

/* ================= (d) compassConstruct ================= */

const ccPerp = {
  type: "compassConstruct",
  prompt: "Open the compass wide enough for the arcs to cross.",
  mode: "perpBisector",
  span: 6,
  target: 4,
  start: 2,
  successFeedback: "s",
  lowFeedback: "lo",
  highFeedback: "hi",
} as const;

describe("(d) compassConstruct — the classical five", () => {
  it("perpBisector and hexagon are untouched", () => {
    const s = WidgetSpec.parse(ccPerp) as TWidget;
    expect(evaluate(s, 4).correct).toBe(true);
    expect(evaluate(s, 2).feedback).toBe("lo");
    expect(evaluate(s, 9).feedback).toBe("hi");
    mount(s);
    expect(screen.queryByTestId("cc-arc-0")).toBeNull(); // the classical stage is a different render
    expect(screen.getByLabelText("how wide the compass is opened")).toBeTruthy();
    expect(widgetIntegrityErrors(WidgetSpec.parse({ ...ccPerp, mode: "hexagon" }) as TWidget)).toEqual([]);
  });

  it.each(["angleBisector", "perpAtPoint", "perpFromPoint", "parallelThroughPoint", "copyAngle"])(
    "%s parses, renders two equal arcs, and grades on the compass radius",
    (mode) => {
      const s = WidgetSpec.parse({ ...ccPerp, mode }) as TWidget;
      expect(widgetIntegrityErrors(s)).toEqual([]);
      mount(s);
      expect(screen.getByTestId("cc-arc-0")).toBeTruthy();
      expect(screen.getByTestId("cc-arc-1")).toBeTruthy();
      expect(evaluate(s, 4).correct).toBe(true);
      expect(evaluate(s, 1).feedback).toBe("lo");
    }
  );

  it("the arcs must actually reach: too small a radius is a visible state, not a message", () => {
    const s = WidgetSpec.parse({ ...ccPerp, mode: "angleBisector", start: 2 }) as TWidget;
    mount(s);
    // span 6, radius 2 → 2r = 4 < 6, so no crossing
    expect(screen.queryByTestId("cc-cross")).toBeNull();
    expect(screen.getByTestId("cc-status").textContent).toMatch(/cannot reach|not yet/);
    fireEvent.change(screen.getByLabelText("how wide the compass is opened"), { target: { value: "5" } });
    expect(screen.getByTestId("cc-cross")).toBeTruthy();
  });

  it("every mode's success line names WHICH equidistance did the work", () => {
    const warrants: Record<string, RegExp> = {
      angleBisector: /same distance from each ARM/,
      perpAtPoint: /stands square at P/,
      perpFromPoint: /meets the line square/,
      parallelThroughPoint: /never to meet/,
      copyAngle: /equal chords on equal circles/,
    };
    for (const [mode, re] of Object.entries(warrants)) {
      cleanup();
      mount(WidgetSpec.parse({ ...ccPerp, mode, start: 5 }) as TWidget);
      expect(screen.getByTestId("cc-status").textContent, mode).toMatch(re);
    }
  });

  // The SAMPLES-driven sweeps (widgets.keyboard, widgets.aria) resolve one spec per TYPE with
  // `.find()`, so they only ever exercise the FIRST compassConstruct sample — perpBisector. Adding
  // gallery samples for the other modes made them visible in /dev/widgets but did NOT put their
  // keyboard or labelling behaviour under those gates. This closes that specific gap: every
  // classical mode is driven from the keyboard and checked for a distinct accessible name.
  it("every classical mode is keyboard-operable and does not collide with the image label", () => {
    for (const mode of ["angleBisector", "perpAtPoint", "perpFromPoint", "parallelThroughPoint", "copyAngle"]) {
      cleanup();
      const holder = mount(WidgetSpec.parse({ ...ccPerp, mode, start: 2 }) as TWidget).holder;

      const slider = screen.getByLabelText("how wide the compass is opened") as HTMLInputElement;
      expect(slider.tagName, mode).toBe("INPUT");
      // Reachable and driveable without a pointer.
      slider.focus();
      expect(document.activeElement, mode).toBe(slider);
      fireEvent.change(slider, { target: { value: "5" } });
      expect(holder.v, mode).toBe(5);

      // The figure's accessible name must not duplicate the control's, or a screen reader
      // announces the same string twice with different meanings.
      const img = screen.getByRole("img");
      expect(img.getAttribute("aria-label"), mode).toBeTruthy();
      expect(img.getAttribute("aria-label"), mode).not.toBe("how wide the compass is opened");
    }
  });
});
