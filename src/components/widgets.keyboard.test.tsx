// @vitest-environment jsdom
/**
 * P2 gate: every widget is completable "keyboard-only".
 * All interactions here activate native <button>/<input> elements via their
 * ARIA roles — exactly what Enter/Space/arrow keys drive on real keyboards —
 * and each sample is checked to a correct evaluate() result. A faux-control
 * audit rejects any clickable that isn't a native focusable element.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "./widgets";
import { SAMPLES } from "./widgetSamples";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { canCheck, evaluate } from "@/lib/evaluate";

const specs = SAMPLES.map((s) => WidgetSpec.parse(s));
const byType = (t: TWidget["type"]) => {
  const s = specs.find((s) => s.type === t);
  if (!s) throw new Error(`no sample for ${t}`);
  return s;
};

function Host({ spec, holder }: { spec: TWidget; holder: { v: unknown } }) {
  const [v, setV] = useState<unknown>(null);
  return (
    <WidgetRenderer
      spec={spec}
      value={v}
      disabled={false}
      onChange={(x) => {
        holder.v = x;
        setV(x);
      }}
    />
  );
}

function mount(t: TWidget["type"]) {
  const spec = byType(t);
  const holder: { v: unknown } = { v: null };
  const { container } = render(<Host spec={spec} holder={holder} />);
  return { spec, holder, container };
}

function auditNativeControls(container: HTMLElement) {
  // anything presented as pressable must BE a button; anything focus-managed must be native
  container.querySelectorAll('[role="button"], [role="radio"], [role="switch"]').forEach((el) => {
    expect(el.tagName).toBe("BUTTON");
  });
  container.querySelectorAll("[tabindex]").forEach((el) => {
    expect(["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A"]).toContain(el.tagName);
  });
  container.querySelectorAll('[role="slider"], input[type="range"]').forEach((el) => {
    expect(el.tagName).toBe("INPUT");
  });
}

function expectSolved(spec: TWidget, holder: { v: unknown }) {
  expect(canCheck(spec, holder.v)).toBe(true);
  expect(evaluate(spec, holder.v).correct).toBe(true);
}

beforeEach(() => cleanup());

const GATED: string[] = [
  "absValueLine",
  "accumulateArea",
  "algebraTiles",
  "angleMeasure",
  "areaModel",
  "argandExplore",
  "balanceScale",
  "barBuilder",
  "baseTenCompose",
  "binomialAreaLab",
  "shapeParts",
  "boxPlot",
  "buildExpression",
  "ciCapture",
  "circleAngleExplore",
  "circleMeasureExplore",
  "clockSet",
  "compassConstruct",
  "derivativeTrace",
  "dilationExplore",
  "distanceGrid",
  "dotPlot",
  "doubleNumberLine",
  "columnCalc",
  "mixedRegroup",
  "dragBucket",
  "dragOrder",
  "elapsedTime",
  "estimateSlider",
  "evalOrder",
  "expLogExplore",
  "fractionBar",
  "fractionCompare",
  "fractionEntry",
  "fractionGrid",
  "fractionOfSet",
  "functionMachine",
  "graphZoom",
  "integerChips",
  "inversePipeline",
  "solveBalance",
  "lengthCompare",
  "lineExplore",
  "matchPairs",
  "matrixTransform",
  "mcq",
  "moneyBoard",
  "netFold",
  "numberLineHop",
  "numberLinePlace",
  "numberLineRay",
  "numeric",
  "oddEvenPairs",
  "percentBar",
  "placeCompare",
  "placeValue",
  "plotPoint",
  "pointEntry",
  "polarTrace",
  "parametricTrace",
  "probabilityArea",
  "hundredthsGrid",
  "pointSetReasoningLab",
  "geometricConstraintLab",
  "exactNumberLab",
  "affineRelationshipLab",
  "quotientReasoningLab",
  "proportionalReasoningLab",
  "compoundEventLab",
  "quadDrag",
  "quadraticExplore",
  "radicalCheck",
  "ratioTable",
  "rationalCompare",
  "riemannSum",
  "sampleSim",
  "scatterFit",
  "secantSlope",
  "sequenceBuild",
  "shuffleTest",
  "signChart",
  "sliceSum",
  "slider",
  "slopeField",
  "spinnerSim",
  "steppedReveal",
  "subitizeFlash",
  "systemsExplore",
  "feasibleRegionExplore",
  "tapDiagram",
  "taylorApprox",
  "tenFrame",
  "toggleExplore",
  "transformExplore",
  "treeDiagram",
  "triangleSolve",
  "unitCircleExplore",
  "vectorExplore",
  "volumeBuilder",
  "conditionalTableLab",
  "graphStoryLab",
  "placeValueTransformLab",
  "equationOutcomeLab",
  "conicLocusLab",
  "coordinateProofLab",
  "covariationScrubber",
  "derivativeRuleLab",
  "lineRelationLab",
  "rotationLab",
  "relatedRatesLab",
  "extraneousRootLab",
  "samplingBiasLab",
  "shapeFamilyBuilder",
  "solidSliceLab",
  "triangleAngleLab",
  "triangleConstraintLab",
  "unitChain",
  "graphRead",
  "distributionCompareLab",
  "trialProbabilityLab",
  "compositeAreaLab",
  "percentChangeLab",
  "scaledCircleLab",
  "signedFractionLab",
  "triangleClosureLab",
  "shapeHierarchyLab",
  "slopeTriangle",
  "unitRuler",
  "verticalLineScanner"
];

describe("P2 keyboard gate — every registered widget", () => {
  it("REGISTRY COVERAGE: no kind ships without a gate test (s44)", () => {
    const kinds = new Set(specs.map((s) => s.type as string));
    const gated = new Set(GATED);
    const missing = [...kinds].filter((k) => !gated.has(k)).sort();
    const stale = [...gated].filter((k) => !kinds.has(k)).sort();
    expect(missing).toEqual([]); // add the kind's drive-to-correct test AND list it in GATED
    expect(stale).toEqual([]);
  });

  it("pointSetReasoningLab", () => {
    const { spec, holder, container } = mount("pointSetReasoningLab");
    auditNativeControls(container);
    for (const button of screen.getAllByRole("button", { name: /Open point-set stage/ })) fireEvent.click(button);
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "8" } });
    expectSolved(spec, holder);
  });

  it("geometricConstraintLab", () => {
    const { spec, holder, container } = mount("geometricConstraintLab");
    auditNativeControls(container);
    for (const button of screen.getAllByRole("button", { name: /Open geometric constraint stage/ })) fireEvent.click(button);
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "5" } });
    expectSolved(spec, holder);
  });

  it("exactNumberLab", () => {
    const { spec, holder, container } = mount("exactNumberLab");
    auditNativeControls(container);
    for (const button of screen.getAllByRole("button", { name: /Open exact-number stage/ })) fireEvent.click(button);
    fireEvent.click(screen.getByRole("button", { name: "<" })); // 7/15 ≈ 0.467 < 9/16 = 0.5625
    expectSolved(spec, holder);
  });

  it("affineRelationshipLab", () => {
    const { spec, holder, container } = mount("affineRelationshipLab");
    auditNativeControls(container);
    for (const button of screen.getAllByRole("button", { name: /Open affine stage/ })) fireEvent.click(button);
    fireEvent.click(screen.getByRole("button", { name: "A starts higher, but B grows faster" }));
    expectSolved(spec, holder);
  });

  it("proportionalReasoningLab", () => {
    const { spec, holder, container } = mount("proportionalReasoningLab");
    auditNativeControls(container);
    for (const [deal, rate] of [["Deal A", "1.5"], ["Deal B", "1.4"]] as const) {
      fireEvent.change(screen.getByRole("spinbutton", { name: new RegExp(`Enter unit rate for ${deal}`) }), { target: { value: rate } });
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`Check unit rate for ${deal}`) }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Deal B" }));
    expectSolved(spec, holder);
  });

  it("proportionalReasoningLab: a wrong series claim is reachable and named", () => {
    const { spec, holder, container } = mount("proportionalReasoningLab");
    for (const [deal, rate] of [["Deal A", "1.5"], ["Deal B", "1.4"]] as const) {
      fireEvent.change(screen.getByRole("spinbutton", { name: new RegExp(`Enter unit rate for ${deal}`) }), { target: { value: rate } });
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`Check unit rate for ${deal}`) }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Deal A" }));
    expect(canCheck(spec, holder.v)).toBe(true);
    const wrong = evaluate(spec, holder.v);
    expect(wrong.correct).toBe(false);
    expect(wrong.feedback).toMatch(/greater/i);
    void container;
  });

  it("quotientReasoningLab", () => {
    const { spec, holder, container } = mount("quotientReasoningLab");
    auditNativeControls(container);
    for (const button of screen.getAllByRole("button", { name: /Open quotient stage/ })) fireEvent.click(button);
    fireEvent.change(screen.getByRole("spinbutton", { name: /Enter quotient answer/ }), { target: { value: "7" } });
    expectSolved(spec, holder);
  });

  it("mixedRegroup", () => {
    // sample: convert 22/7 (truth 3 1/7). Three "Make a whole" taps walk the exchange ladder
    // 22/7 → 1 15/7 → 2 8/7 → 3 1/7. Every control is a native <button>.
    const { spec, holder, container } = mount("mixedRegroup");
    auditNativeControls(container);
    const make = () => fireEvent.click(screen.getByRole("button", { name: /Make one whole out of 7 parts/ }));
    make();
    make();
    make();
    expectSolved(spec, holder);
  });

  it("mixedRegroup: stopping one whole short is reachable, diagnosed, and undoable", () => {
    const { spec, holder, container } = mount("mixedRegroup");
    fireEvent.click(screen.getByRole("button", { name: /Make one whole out of 7 parts/ }));
    fireEvent.click(screen.getByRole("button", { name: /Make one whole out of 7 parts/ }));
    expect(canCheck(spec, holder.v)).toBe(true);
    const wrong = evaluate(spec, holder.v);
    expect(wrong.correct).toBe(false);
    expect(wrong.feedback).toContain("still has a whole hiding inside it");
    fireEvent.click(within(container).getByRole("button", { name: "Undo" }));
    expect((holder.v as { whole: number; num: number }).whole).toBe(1);
  });

  it("columnCalc", () => {
    // sample: 35 × 4 (truth 140). The correct path: resolve ones (writes 0, spawns carry 2),
    // COMMIT the carry, resolve tens (12 + 2 = 14 → writes 4, spawns 1), commit the final carry
    // in front. Every actionable is a native <button>, so this is exactly the keyboard route.
    const { spec, holder, container } = mount("columnCalc");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("button", { name: /Work out the ones column/ }));
    fireEvent.click(screen.getByRole("button", { name: /Carry 2 into the tens/ }));
    fireEvent.click(screen.getByRole("button", { name: /Work out the tens column/ }));
    fireEvent.click(screen.getByRole("button", { name: /Final carry 1/ }));
    expectSolved(spec, holder);
  });

  it("columnCalc: the forgot-the-carry path is reachable, diagnosed, and undoable", () => {
    const { spec, holder, container } = mount("columnCalc");
    fireEvent.click(screen.getByRole("button", { name: /Work out the ones column/ }));
    // strand the waiting carry: resolve the tens WITHOUT committing it → 3×4 = 12, writes 2
    fireEvent.click(screen.getByRole("button", { name: /Work out the tens column/ }));
    fireEvent.click(screen.getByRole("button", { name: /Final carry 1/ }));
    expect(canCheck(spec, holder.v)).toBe(true);
    const wrong = evaluate(spec, holder.v);
    expect(wrong.correct).toBe(false);
    expect(wrong.feedback).toContain("waiting carry"); // the authored diagnosis, on a state they built
    fireEvent.click(within(container).getByRole("button", { name: "Undo" }));
    expect((holder.v as { lead: number | null }).lead).toBe(null);
  });

  it("evalOrder", () => {
    // sample: 2 + 3 × 4 (target 14). Collapsing × first is the correct precedence path;
    // every token is a native <button>, so this is exactly the keyboard route.
    const { spec, holder, container } = mount("evalOrder");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("button", { name: /Apply times between 3 and 4/ }));
    fireEvent.click(screen.getByRole("button", { name: /Apply plus between 2 and 12/ }));
    expectSolved(spec, holder);
  });

  it("evalOrder: the wrong ORDER is reachable and undoable (the whole point of the lab)", () => {
    const { spec, holder, container } = mount("evalOrder");
    fireEvent.click(screen.getByRole("button", { name: /Apply plus between 2 and 3/ }));
    fireEvent.click(screen.getByRole("button", { name: /Apply times between 5 and 4/ }));
    expect(canCheck(spec, holder.v)).toBe(true);
    const wrong = evaluate(spec, holder.v);
    expect(wrong.correct).toBe(false);
    expect(wrong.feedback).toContain("left to right"); // the authored diagnosis, on a state they built
    fireEvent.click(within(container).getByRole("button", { name: "Undo" }));
    expect((holder.v as { tokens: string[] }).tokens).toEqual(["5", "×", "4"]);
  });

  it("distributionCompareLab", () => {
    // sample: means 20 and 8, one variability-width 4 — the gap is 3 units. Measure
    // choices are native buttons; pressing the value 3 solves it.
    const { spec, holder, container } = mount("distributionCompareLab");
    auditNativeControls(container);
    fireEvent.click(within(container).getByRole("group", { name: /variability-units/ }).querySelectorAll("button")[1] as HTMLElement);
    if (evaluate(spec, holder.v).correct !== true) {
      // Button order is authored, not positional — drive by asserting the correct value directly.
      for (const b of Array.from(container.querySelectorAll("button"))) {
        fireEvent.click(b);
        if (evaluate(spec, holder.v).correct) break;
      }
    }
    expectSolved(spec, holder);
  });

  it("distributionCompareLab: the raw-gap misconception is reachable and named", () => {
    const { spec, holder, container } = mount("distributionCompareLab");
    for (const b of Array.from(container.querySelectorAll("button"))) {
      fireEvent.click(b);
      const res = evaluate(spec, holder.v);
      if (!res.correct) {
        expect(res.feedback).toMatch(/raw gap|variability/);
        return;
      }
    }
    throw new Error("no wrong measure choice was reachable");
  });

  it("trialProbabilityLab", () => {
    // sample: 18 red in 30 spins — 3/5. Fraction choices are native buttons.
    const { spec, holder, container } = mount("trialProbabilityLab");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("button", { name: /3\/5/ }));
    expectSolved(spec, holder);
  });

  it("trialProbabilityLab: success-over-failure is reachable and named", () => {
    const { spec, holder } = mount("trialProbabilityLab");
    fireEvent.click(screen.getByRole("button", { name: /18\/12/ }));
    const res = evaluate(spec, holder.v);
    expect(res.correct).toBe(false);
    expect(res.feedback.length).toBeGreaterThan(20);
  });

  it("compositeAreaLab", () => {
    const { spec, holder, container } = mount("compositeAreaLab");
    auditNativeControls(container);
    for (const b of Array.from(container.querySelectorAll("button"))) {
      fireEvent.click(b);
      if (evaluate(spec, holder.v).correct) break;
    }
    expectSolved(spec, holder);
  });

  it("compositeAreaLab: a wrong area claim is reachable and named", () => {
    const { spec, holder } = mount("compositeAreaLab");
    for (const b of Array.from(document.querySelectorAll("button"))) {
      fireEvent.click(b);
      const res = evaluate(spec, holder.v);
      if (!res.correct) {
        expect(res.feedback.length).toBeGreaterThan(20);
        return;
      }
    }
    throw new Error("no wrong area claim was reachable");
  });

  it("percentChangeLab", () => {
    const { spec, holder, container } = mount("percentChangeLab");
    auditNativeControls(container);
    for (const b of Array.from(container.querySelectorAll("button"))) {
      fireEvent.click(b);
      if (evaluate(spec, holder.v).correct) break;
    }
    expectSolved(spec, holder);
  });

  it("percentChangeLab: a wrong price claim is reachable and named", () => {
    const { spec, holder } = mount("percentChangeLab");
    for (const b of Array.from(document.querySelectorAll("button"))) {
      fireEvent.click(b);
      const res = evaluate(spec, holder.v);
      if (!res.correct) {
        expect(res.feedback.length).toBeGreaterThan(20);
        return;
      }
    }
    throw new Error("no wrong price claim was reachable");
  });

  it("scaledCircleLab", () => {
    const { spec, holder, container } = mount("scaledCircleLab");
    auditNativeControls(container);
    for (const b of Array.from(container.querySelectorAll("button"))) {
      fireEvent.click(b);
      if (evaluate(spec, holder.v).correct) break;
    }
    expectSolved(spec, holder);
  });

  it("scaledCircleLab: a wrong scale claim is reachable and named", () => {
    const { spec, holder } = mount("scaledCircleLab");
    for (const b of Array.from(document.querySelectorAll("button"))) {
      fireEvent.click(b);
      const res = evaluate(spec, holder.v);
      if (!res.correct) {
        expect(res.feedback.length).toBeGreaterThan(20);
        return;
      }
    }
    throw new Error("no wrong scale claim was reachable");
  });

  it("signedFractionLab", () => {
    const { spec, holder, container } = mount("signedFractionLab");
    auditNativeControls(container);
    for (const b of Array.from(container.querySelectorAll("button"))) {
      fireEvent.click(b);
      if (evaluate(spec, holder.v).correct) break;
    }
    expectSolved(spec, holder);
  });

  it("signedFractionLab: a wrong signed-fraction path is reachable and named", () => {
    const { spec, holder } = mount("signedFractionLab");
    for (const b of Array.from(document.querySelectorAll("button"))) {
      fireEvent.click(b);
      const res = evaluate(spec, holder.v);
      if (!res.correct) {
        expect(res.feedback.length).toBeGreaterThan(15);
        return;
      }
    }
    throw new Error("no wrong signed-fraction path was reachable");
  });

  it("triangleClosureLab", () => {
    // The verdict claim is a native button; canCheck also requires exploring the hinge
    // (moves >= requiredMoves), so the slider control is exercised first.
    const { spec, holder, container } = mount("triangleClosureLab");
    auditNativeControls(container);
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement | null;
    if (slider && spec.type === "triangleClosureLab") {
      for (let i = 0; i < spec.requiredMoves; i++) {
        fireEvent.change(slider, { target: { value: String(Number(slider.value) + spec.angleStep) } });
      }
    }
    for (const b of Array.from(container.querySelectorAll("button"))) {
      fireEvent.click(b);
      if (evaluate(spec, holder.v).correct) break;
    }
    expect(evaluate(spec, holder.v).correct).toBe(true);
  });

  it("triangleClosureLab: a wrong verdict claim is reachable and named", () => {
    const { spec, holder } = mount("triangleClosureLab");
    for (const b of Array.from(document.querySelectorAll("button"))) {
      fireEvent.click(b);
      const res = evaluate(spec, holder.v);
      if (!res.correct) {
        expect(res.feedback.length).toBeGreaterThan(20);
        return;
      }
    }
    throw new Error("no wrong verdict claim was reachable");
  });

  it("shapeHierarchyLab", () => {
    const { spec, holder, container } = mount("shapeHierarchyLab");
    auditNativeControls(container);
    for (const b of Array.from(container.querySelectorAll("button"))) {
      fireEvent.click(b);
      if (evaluate(spec, holder.v).correct) break;
    }
    expectSolved(spec, holder);
  });

  it("shapeHierarchyLab: a wrong evidence claim is reachable and named", () => {
    const { spec, holder } = mount("shapeHierarchyLab");
    for (const b of Array.from(document.querySelectorAll("button"))) {
      fireEvent.click(b);
      const res = evaluate(spec, holder.v);
      if (!res.correct) {
        expect(res.feedback.length).toBeGreaterThan(20);
        return;
      }
    }
    throw new Error("no wrong evidence claim was reachable");
  });

  it("unitChain", () => {
    // sample: 3 km → m, one hop. Both direction controls are native buttons; one press of
    // "Multiply by 1000" arrives at the target unit with the correct value.
    const { spec, holder, container } = mount("unitChain");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("button", { name: /Multiply by 1000/ }));
    expectSolved(spec, holder);
  });

  it("graphRead", () => {
    // sample: a picture-graph row of 4 icons, each worth 1 vote. The value scale is native
    // buttons, so the whole read is keyboard-operable.
    const { spec, holder, container } = mount("graphRead");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("button", { name: "4 votes" }));
    expectSolved(spec, holder);
  });

  it("graphRead: a wrong read is reachable and named as an off-by-one", () => {
    const { spec, holder } = mount("graphRead");
    fireEvent.click(screen.getByRole("button", { name: "5 votes" }));
    const res = evaluate(spec, holder.v);
    expect(res.correct).toBe(false);
    expect(res.feedback).toMatch(/one picture out/);
  });

  it("slopeTriangle", () => {
    // sample: A(2,1) B(6,9) — slope 2. Legs are steppers plus a range input, all native.
    const { spec, holder, container } = mount("slopeTriangle");
    auditNativeControls(container);
    // From the start (run 1, rise 0) one "Increase rise" press twice reaches 1/2 -> slope 2.
    fireEvent.click(screen.getByRole("button", { name: /Increase rise/ }));
    fireEvent.click(screen.getByRole("button", { name: /Increase rise/ }));
    expectSolved(spec, holder);
  });

  it("slopeTriangle: an equivalent, larger triangle is equally correct", () => {
    const { spec, holder } = mount("slopeTriangle");
    // Build run 2 / rise 4 through the range inputs — the constancy claim, by keyboard.
    fireEvent.change(screen.getByRole("slider", { name: /Set run \(across\)/ }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("slider", { name: /Set rise \(up\)/ }), { target: { value: "4" } });
    expectSolved(spec, holder);
  });

  it("unitChain: the wrong direction is reachable, named, and undoable", () => {
    const { spec, holder } = mount("unitChain");
    fireEvent.click(screen.getByRole("button", { name: /Divide by 1000/ }));
    expect(canCheck(spec, holder.v)).toBe(true);
    const r = evaluate(spec, holder.v);
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/you divided by 1000/);
    fireEvent.click(screen.getByRole("button", { name: /Back one hop/ }));
    fireEvent.click(screen.getByRole("button", { name: /Multiply by 1000/ }));
    expectSolved(spec, holder);
  });

  it("mcq", () => {
    const { spec, holder, container } = mount("mcq");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("radio", { name: /2 boxes with 5 pencils/ }));
    expectSolved(spec, holder);
  });

  it("rationalCompare", () => {
    const { spec, holder, container } = mount("rationalCompare");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("radio", { name: "greater than" })); // sample answer: 3/4 > 0.5
    expectSolved(spec, holder);
  });

  it("numeric", () => {
    const { spec, holder, container } = mount("numeric");
    auditNativeControls(container);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "12" } });
    expectSolved(spec, holder);
  });

  it("fractionEntry (typed fields + sign toggle, whole + num + den)", () => {
    const { spec, holder, container } = mount("fractionEntry");
    auditNativeControls(container);
    const signBtn = screen.getByRole("button", { name: "negative sign" });
    expect(signBtn.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(signBtn); // the sample's answer is negative
    expect(signBtn.getAttribute("aria-pressed")).toBe("true");
    fireEvent.change(screen.getByRole("textbox", { name: "whole number" }), { target: { value: "1" } });
    fireEvent.change(screen.getByRole("textbox", { name: "numerator" }), { target: { value: "1" } });
    fireEvent.change(screen.getByRole("textbox", { name: "denominator" }), { target: { value: "2" } });
    expectSolved(spec, holder);
  });

  it("slider", () => {
    const { spec, holder, container } = mount("slider");
    auditNativeControls(container);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "3" } });
    expectSolved(spec, holder);
  });

  it("lineExplore", () => {
    const { spec, holder, container } = mount("lineExplore");
    auditNativeControls(container);
    // two native range inputs drive slope and intercept — keyboard-operable
    fireEvent.change(screen.getByLabelText(/slope m/i), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/intercept b/i), { target: { value: "-1" } });
    expectSolved(spec, holder);
  });

  /**
   * numberLineRay (S215). This engine's PRIMARY controls are the drawn objects themselves — a
   * draggable endpoint and a pressable ray — so "keyboard-only" is the substantive claim here, not
   * a formality: if it held only for the secondary slider, the manipulative would be pointer-only
   * and the slider a separate, weaker widget bolted beside it.
   *
   * It holds because the endpoint and the ray ARE native `<button>`s positioned over the picture,
   * not `<div onPointerDown>` handles with a slider standing in for them. So the three facts the
   * engine teaches each have a keyboard route ON the object: Enter/Space on the endpoint opens or
   * closes it, ArrowLeft/ArrowRight walk it along the declared lattice (the same lattice a drag
   * snaps to), and Enter/Space on the ray turns it round.
   *
   * Sample: −x < 5, drawn as x > −5. Reaching the target set needs all three facts to move.
   */
  it("numberLineRay", () => {
    const { spec, holder, container } = mount("numberLineRay");
    auditNativeControls(container);
    // 1. the endpoint, by the native range input — one action reaches any lattice position
    fireEvent.change(screen.getByRole("slider", { name: /Where the solution set begins/ }), { target: { value: "2" } });
    // 2. the ray itself, by pressing the arrow — the very button a pointer taps
    fireEvent.click(screen.getByRole("button", { name: /^The ray runs toward/ }));
    // 3. the endpoint's membership, by pressing the dot — likewise the object, not a proxy
    fireEvent.click(screen.getByRole("button", { name: /^The endpoint of the solution set/ }));
    expectSolved(spec, holder);
  });

  it("numberLineRay: the endpoint's arrow keys reach what a drag reaches", () => {
    // The claim that matters for a draggable object: no slider at all this time. −5 to 2 is seven
    // steps of 1, which is exactly the lattice a pointer drag snaps to, and the symbolic route
    // turns the ray round instead of the arrow — so both alphabets are driven from the keyboard.
    const { spec, holder } = mount("numberLineRay");
    const endpoint = () => screen.getByRole("button", { name: /^The endpoint of the solution set/ });
    for (let i = 0; i < 7; i += 1) fireEvent.keyDown(endpoint(), { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("button", { name: /^The relation symbol is/ }));
    fireEvent.click(endpoint());
    expectSolved(spec, holder);
  });

  it("numberLineRay: a ray left pointing the wrong way is reachable, and named", () => {
    const { spec, holder } = mount("numberLineRay");
    fireEvent.change(screen.getByRole("slider", { name: /Where the solution set begins/ }), { target: { value: "2" } });
    // close the endpoint but leave the ray as it was — the endpoint and its membership are right
    fireEvent.click(screen.getByRole("button", { name: /^The endpoint of the solution set/ }));
    expect(canCheck(spec, holder.v)).toBe(true);
    const wrong = evaluate(spec, holder.v);
    expect(wrong.correct).toBe(false);
    expect(wrong.feedback).toMatch(/Which way the ray runs is the part that is not right yet/);
    // …and the diagnosis names the learner's OWN set, never the target
    expect(wrong.feedback).toContain("Your line shows x \u2265 2");
    expect(wrong.feedback).not.toContain("x \u2264 2");
  });

  it("fractionBar", () => {
    const { spec, holder, container } = mount("fractionBar");
    auditNativeControls(container);
    // 2/4 is an equivalent fraction to the 1/2 target
    fireEvent.change(screen.getByLabelText(/numerator/i), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/denominator/i), { target: { value: "4" } });
    expectSolved(spec, holder);
  });

  it("quadraticExplore", () => {
    const { spec, holder, container } = mount("quadraticExplore");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/stretch\/flip/i), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/left\/right/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/up\/down/i), { target: { value: "-2" } });
    expectSolved(spec, holder);
  });

  it("unitCircleExplore", () => {
    const { spec, holder, container } = mount("unitCircleExplore");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/angle in degrees/i), { target: { value: "60" } });
    expectSolved(spec, holder);
  });

  it("systemsExplore", () => {
    const { spec, holder, container } = mount("systemsExplore");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/point x/i), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/point y/i), { target: { value: "3" } });
    expectSolved(spec, holder);
  });

  it("feasibleRegionExplore", () => {
    const { spec, holder, container } = mount("feasibleRegionExplore");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/flour limit position/i), { target: { value: "4" } });
    expectSolved(spec, holder);
  });

  it("numberLinePlace", () => {
    const { spec, holder, container } = mount("numberLinePlace");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/marker position/i), { target: { value: "-3" } });
    expectSolved(spec, holder);
  });

  it("functionMachine", () => {
    const { spec, holder, container } = mount("functionMachine");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/machine input/i), { target: { value: "6" } });
    expectSolved(spec, holder);
  });

  it("probabilityArea", () => {
    const { spec, holder, container } = mount("probabilityArea");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/cells shaded/i), { target: { value: "3" } });
    expectSolved(spec, holder);
  });

  it("hundredthsGrid", () => {
    // Keyboard path is the slider; cell/column taps are the pointer-only shortcuts on top of it.
    const { spec, holder, container } = mount("hundredthsGrid");
    auditNativeControls(container);
    const target = (spec as Extract<TWidget, { type: "hundredthsGrid" }>).target;
    fireEvent.change(screen.getByLabelText(/cells shaded/i), { target: { value: String(target) } });
    expectSolved(spec, holder);
  });

  it("transformExplore", () => {
    const { spec, holder, container } = mount("transformExplore");
    auditNativeControls(container);
    fireEvent.click(screen.getByLabelText(/reflect over y-axis/i));
    fireEvent.change(screen.getByLabelText(/slide y/i), { target: { value: "2" } });
    expectSolved(spec, holder);
  });

  it("angleMeasure", () => {
    const { spec, holder, container } = mount("angleMeasure");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/angle in degrees/i), { target: { value: "60" } });
    expectSolved(spec, holder);
  });

  it("rotationLab", () => {
    // The turn is a real range input, so the whole engine is reachable by keyboard alone — which is
    // the point of this gate. The first rotationLab sample is coordinateRule with a 180 degree
    // target: a half turn about the origin, reached in two 90 degree steps.
    const { spec, holder, container } = mount("rotationLab");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/rotation angle/i), { target: { value: "180" } });
    expectSolved(spec, holder);
  });

  it("dilationExplore", () => {
    const { spec, holder, container } = mount("dilationExplore");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/scale factor/i), { target: { value: "2" } });
    expectSolved(spec, holder);
  });

  it("barBuilder", () => {
    const { spec, holder, container } = mount("barBuilder");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/mon height/i), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText(/tue height/i), { target: { value: "25" } });
    fireEvent.change(screen.getByLabelText(/wed height/i), { target: { value: "10" } });
    expectSolved(spec, holder);
  });

  it("dotPlot", () => {
    const { spec, holder, container } = mount("dotPlot");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/dots above 1/i), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/dots above 2/i), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(/dots above 3/i), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/dots above 4/i), { target: { value: "1" } });
    expectSolved(spec, holder);
  });

  it("boxPlot", () => {
    const { spec, holder, container } = mount("boxPlot");
    auditNativeControls(container);
    // Each slider's own aria-label is "set <statistic>" ("set minimum", "set Q1 lower
    // quartile", ...) — see widgets.tsx BoxPlotW `rows`. A bare /minimum/i etc. also matches
    // the plot's own image aria-label (which restates every statistic in one sentence, e.g.
    // "...Minimum 0; Q1 lower quartile 3;..."), so the query must include the "set " prefix
    // that only the input carries.
    fireEvent.change(screen.getByLabelText(/set minimum/i), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/set q1 lower quartile/i), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(/set median/i), { target: { value: "6" } });
    fireEvent.change(screen.getByLabelText(/set q3 upper quartile/i), { target: { value: "9" } });
    fireEvent.change(screen.getByLabelText(/set maximum/i), { target: { value: "12" } });
    expectSolved(spec, holder);
  });

  it("areaModel", () => {
    const { spec, holder, container } = mount("areaModel");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/width/i), { target: { value: "6" } });
    fireEvent.change(screen.getByLabelText(/height/i), { target: { value: "4" } });
    expectSolved(spec, holder);
  });

  it("doubleNumberLine", () => {
    const { spec, holder, container } = mount("doubleNumberLine");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/paired value/i), { target: { value: "4" } });
    expectSolved(spec, holder);
  });

  it("scatterFit", () => {
    const { spec, holder, container } = mount("scatterFit");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/line slope/i), { target: { value: "1.5" } });
    fireEvent.change(screen.getByLabelText(/line intercept/i), { target: { value: "1" } });
    expectSolved(spec, holder);
  });

  it("percentBar", () => {
    const { spec, holder, container } = mount("percentBar");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/percent chosen/i), { target: { value: "25" } });
    expectSolved(spec, holder);
  });

  it("integerChips", () => {
    const { spec, holder, container } = mount("integerChips");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/positive chips/i), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(/negative chips/i), { target: { value: "7" } });
    expectSolved(spec, holder);
  });

  it("volumeBuilder", () => {
    const { spec, holder, container } = mount("volumeBuilder");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/^length$/i), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/^width$/i), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/^height$/i), { target: { value: "4" } });
    expectSolved(spec, holder);
  });

  it("netFold", () => {
    const { spec, holder, container } = mount("netFold");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/prism length/i), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(/prism width/i), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/prism height/i), { target: { value: "2" } });
    expectSolved(spec, holder);
  });

  it("elapsedTime", () => {
    const { spec, holder, container } = mount("elapsedTime");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/minutes that pass/i), { target: { value: "45" } });
    expectSolved(spec, holder);
  });

  it("distanceGrid", () => {
    const { spec, holder, container } = mount("distanceGrid");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/point across/i), { target: { value: "6" } });
    fireEvent.change(screen.getByLabelText(/point up/i), { target: { value: "6" } });
    expectSolved(spec, holder);
  });

  it("treeDiagram", () => {
    const { spec, holder, container } = mount("treeDiagram");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/first stage branches/i), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/second stage branches/i), { target: { value: "4" } });
    expectSolved(spec, holder);
  });

  it("slopeField", () => {
    const { spec, holder, container } = mount("slopeField");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/the initial condition/i), { target: { value: "4" } });
    expectSolved(spec, holder); // the carrying capacity — the one flat solution
  });

  it("taylorApprox", () => {
    const { spec, holder, container } = mount("taylorApprox");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/number of terms/i), { target: { value: "4" } });
    expectSolved(spec, holder);
  });

  it("sliceSum", () => {
    const { spec, holder, container } = mount("sliceSum");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/number of slices/i), { target: { value: "24" } });
    expectSolved(spec, holder);
  });

  it("riemannSum", () => {
    const { spec, holder, container } = mount("riemannSum");
    auditNativeControls(container);
    fireEvent.click(screen.getByLabelText(/use the midpoint rule/i));
    fireEvent.change(screen.getByLabelText(/number of strips/i), { target: { value: "12" } });
    expectSolved(spec, holder);
  });

  it("accumulateArea", () => {
    const { spec, holder, container } = mount("accumulateArea");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/how far the area has been swept/i), { target: { value: "2" } });
    expectSolved(spec, holder); // ∫₀² 2x dx = 4
  });

  it("derivativeTrace", () => {
    const { spec, holder, container } = mount("derivativeTrace");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/the point on the curve/i), { target: { value: "3" } });
    expectSolved(spec, holder); // f′(3) = 6 on x²
  });

  it("compassConstruct", () => {
    const { spec, holder, container } = mount("compassConstruct");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/how wide the compass is opened/i), { target: { value: "5" } });
    expectSolved(spec, holder);
  });

  it("quadDrag", () => {
    const { spec, holder, container } = mount("quadDrag");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/fourth corner across/i), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/fourth corner up/i), { target: { value: "4" } });
    expectSolved(spec, holder);
  });

  it("radicalCheck", () => {
    const { spec, holder, container } = mount("radicalCheck");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/candidate value/i), { target: { value: "2" } });
    expectSolved(spec, holder);
  });

  it("sequenceBuild", () => {
    const { spec, holder, container } = mount("sequenceBuild");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/the common ratio/i), { target: { value: "5" } });
    expectSolved(spec, holder); // r = 0.5 -> 4/(1−0.5) = 8
  });

  it("triangleSolve", () => {
    const { spec, holder, container } = mount("triangleSolve");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/the included angle/i), { target: { value: "60" } });
    expectSolved(spec, holder); // 5, 8, 60° -> 7
  });

  it("extraneousRootLab", () => {
    const { spec, holder, container } = mount("extraneousRootLab");
    auditNativeControls(container);
    // The gate the lesson turns on: no answer is graded until the squaring is performed, so the
    // keyboard route must be square-then-pick, and both must be reachable as real buttons.
    fireEvent.click(screen.getByTestId("erl-square"));
    fireEvent.click(screen.getByTestId("erl-pick--2"));
    expectSolved(spec, holder);
  });

  it("signChart", () => {
    const { spec, holder, container } = mount("signChart");
    auditNativeControls(container);
    // starts all "+" -> flip the two middle intervals to reach + − − +
    fireEvent.click(screen.getByLabelText(/sign of interval 2/i));
    fireEvent.click(screen.getByLabelText(/sign of interval 3/i));
    expectSolved(spec, holder);
  });

  it("polarTrace", () => {
    const { spec, holder, container } = mount("polarTrace");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/the multiplier n/i), { target: { value: "2" } });
    expectSolved(spec, holder); // n = 2 -> 4 petals
  });

  it("parametricTrace", () => {
    const { spec, holder, container } = mount("parametricTrace");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/parameter t/i), { target: { value: "2" } });
    expectSolved(spec, holder);
  });

  it("circleMeasureExplore", () => {
    const { spec, holder, container } = mount("circleMeasureExplore");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/slider position/i), { target: { value: "3" } });
    expectSolved(spec, holder); // r = 5, d = 3 -> chord 8
  });

  it("vectorExplore", () => {
    const { spec, holder, container } = mount("vectorExplore");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/horizontal part of v/i), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(/vertical part of v/i), { target: { value: "-3" } });
    expectSolved(spec, holder); // (3,4)·(4,−3) = 0
  });

  it("matrixTransform", () => {
    const { spec, holder, container } = mount("matrixTransform");
    auditNativeControls(container);
    // Rotation 90° CCW from identity: a 1→0, c 0→1, b 0→−1 (d already 0→… d starts 1, target 0).
    const click = (name: RegExp, times: number) => {
      for (let i = 0; i < times; i++) fireEvent.click(screen.getByLabelText(name));
    };
    click(/lower the x-part of the first column/i, 1); // a: 1 → 0
    click(/raise the y-part of the first column/i, 1); // c: 0 → 1
    click(/lower the x-part of the second column/i, 1); // b: 0 → −1
    click(/lower the y-part of the second column/i, 1); // d: 1 → 0
    expectSolved(spec, holder);
  });

  it("argandExplore", () => {
    const { spec, holder, container } = mount("argandExplore");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/real part of z/i), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/imaginary part of z/i), { target: { value: "2" } });
    expectSolved(spec, holder); // 2i × i = −2
  });

  it("secantSlope", () => {
    const { spec, holder, container } = mount("secantSlope");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/size of the gap/i), { target: { value: "0.1" } });
    expectSolved(spec, holder);
  });

  it("expLogExplore", () => {
    const { spec, holder, container } = mount("expLogExplore");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/choose the base/i), { target: { value: "2" } });
    expectSolved(spec, holder);
  });

  it("graphZoom", () => {
    const { spec, holder, container } = mount("graphZoom");
    auditNativeControls(container);
    fireEvent.click(screen.getByLabelText(/magnify further/i));
    fireEvent.click(screen.getByLabelText(/magnify further/i));
    fireEvent.click(screen.getByLabelText(/magnify further/i)); // requiredZoom = 3
    fireEvent.click(screen.getByLabelText(/say the limit exists/i));
    expectSolved(spec, holder);
  });

  it("circleAngleExplore", () => {
    const { spec, holder, container } = mount("circleAngleExplore");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/arc size in degrees/i), { target: { value: "80" } });
    expectSolved(spec, holder); // 80° arc -> 40° at P
  });

  it("sampleSim", () => {
    const { spec, holder, container } = mount("sampleSim");
    auditNativeControls(container);
    fireEvent.click(screen.getByLabelText(/ask 100 people/i)); // pick the sample size...
    fireEvent.click(screen.getByLabelText(/run ten polls/i)); // ...then build the pile
    fireEvent.click(screen.getByLabelText(/run ten polls/i));
    expectSolved(spec, holder);
  });

  it("ciCapture", () => {
    const { spec, holder, container } = mount("ciCapture");
    auditNativeControls(container);
    fireEvent.click(screen.getByLabelText(/set width 95/i));
    fireEvent.click(screen.getByLabelText(/add ten bars/i));
    fireEvent.click(screen.getByLabelText(/add ten bars/i));
    expectSolved(spec, holder);
  });

  it("shuffleTest", () => {
    const { spec, holder, container } = mount("shuffleTest");
    auditNativeControls(container);
    fireEvent.click(screen.getByLabelText(/relabel twenty times/i)); // simulate first...
    fireEvent.click(screen.getByLabelText(/verdict too big for chance/i)); // ...verdict second
    expectSolved(spec, holder);
  });

  it("spinnerSim", () => {
    const { spec, holder, container } = mount("spinnerSim");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/winning sectors/i), { target: { value: "3" } });
    expectSolved(spec, holder);
  });

  it("algebraTiles", () => {
    const { spec, holder, container } = mount("algebraTiles");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/long tiles/i), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/small tiles/i), { target: { value: "0" } });
    expectSolved(spec, holder);
  });

  it("shapeParts", () => {
    const { spec, holder, container } = mount("shapeParts");
    auditNativeControls(container);
    // Every part is its own focusable control; marking each exactly once is the whole task, and
    // Enter is the keyboard equivalent of a tap.
    const parts = [...container.querySelectorAll("button[aria-pressed]")];
    expect(parts.length).toBeGreaterThan(2);
    for (const p of parts) fireEvent.click(p);
    expectSolved(spec, holder);
  });

  it("binomialAreaLab", () => {
    const { spec, holder, container } = mount("binomialAreaLab");
    auditNativeControls(container);
    // Canonical sample: (x + 2)(x + 3), requiredMoves 3. A controlled range input's value
    // tracker suppresses the change event when the new value equals the DOM's current value, so
    // the third move must pass through a genuinely different number before landing on target —
    // repeating the same value is not a real move on a controlled input.
    fireEvent.change(screen.getByLabelText(/across partition/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/down partition/i), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/across partition/i), { target: { value: "2" } });
    expectSolved(spec, holder);
  });

  it("ratioTable", () => {
    const { spec, holder, container } = mount("ratioTable");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/missing value/i), { target: { value: "8" } });
    expectSolved(spec, holder);
  });

  it("fractionOfSet", () => {
    const { spec, holder, container } = mount("fractionOfSet");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/how many chosen/i), { target: { value: "9" } });
    expectSolved(spec, holder);
  });

  it("placeValue", () => {
    const { spec, holder, container } = mount("placeValue");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/hundreds/i), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/tens/i), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/ones/i), { target: { value: "4" } });
    expectSolved(spec, holder);
  });

  it("clockSet", () => {
    const { spec, holder, container } = mount("clockSet");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/hour hand/i), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/minute hand/i), { target: { value: "15" } });
    expectSolved(spec, holder);
  });

  it("inversePipeline (tap-to-place is the mechanism, so keyboard needs no separate path)", () => {
    const { spec, holder, container } = mount("inversePipeline");
    auditNativeControls(container);
    const answer = (spec as { answer: string[] }).answer;
    // Every tray card is a real button, so clicking is exactly what Enter/Space does on focus.
    for (const id of answer) fireEvent.click(screen.getByTestId(`ip-card-${id}`));
    expectSolved(spec, holder);
  });

  it("solveBalance (every tile is a button; solve 3x + 4 = 19)", () => {
    const { spec, holder, container } = mount("solveBalance");
    auditNativeControls(container);
    // Four units off EACH pan, then split — eight taps and a button, all native.
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the left pan/ })[0]);
      fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the right pan/ })[0]);
    }
    fireEvent.click(screen.getByTestId("sb-split"));
    expectSolved(spec, holder);
  });

  it("balanceScale", () => {
    const { spec, holder, container } = mount("balanceScale");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText(/value of x/i), { target: { value: "4" } });
    expectSolved(spec, holder);
  });

  it("tapDiagram", () => {
    const { spec, holder, container } = mount("tapDiagram");
    auditNativeControls(container);
    for (const b of screen.getAllByRole("button", { name: /Basket with 2 balls/ }))
      fireEvent.click(b);
    expectSolved(spec, holder);
  });

  it("dragOrder (arrow buttons reorder)", () => {
    const { spec, holder, container } = mount("dragOrder");
    auditNativeControls(container);
    // initial 15,5,20,10 → target 5,10,15,20
    fireEvent.click(screen.getByRole("button", { name: "Move 5 up" }));
    fireEvent.click(screen.getByRole("button", { name: "Move 10 up" }));
    fireEvent.click(screen.getByRole("button", { name: "Move 10 up" }));
    expectSolved(spec, holder);
  });

  it("dragBucket (radiogroup per item)", () => {
    const { spec, holder, container } = mount("dragBucket");
    auditNativeControls(container);
    const mul = screen.getAllByRole("radio", { name: /Multiply/ });
    const add = screen.getAllByRole("radio", { name: /Add/ });
    fireEvent.click(mul[0]); // crayon boxes
    fireEvent.click(add[1]); // two hands
    fireEvent.click(mul[2]); // shelves
    expectSolved(spec, holder);
  });

  it("matchPairs (select left, tap right)", () => {
    const { spec, holder, container } = mount("matchPairs");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("button", { name: /2 nests, 3 eggs/ }));
    fireEvent.click(screen.getByRole("button", { name: /^2 × 3$/ }));
    fireEvent.click(screen.getByRole("button", { name: /3 nests, 2 eggs/ }));
    fireEvent.click(screen.getByRole("button", { name: /^3 × 2$/ }));
    fireEvent.click(screen.getByRole("button", { name: /4 nests, 2 eggs/ }));
    fireEvent.click(screen.getByRole("button", { name: /^4 × 2$/ }));
    expectSolved(spec, holder);
  });

  it("buildExpression (token assembly, distractors stay unused)", () => {
    const { spec, holder, container } = mount("buildExpression");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "×" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expectSolved(spec, holder);
  });

  it("plotPoint (grid cells toggle, y counts from the bottom)", () => {
    const { spec, holder, container } = mount("plotPoint");
    auditNativeControls(container);
    // A cell's accessible name is `${xLabel}, ${yLabel}` (see widgets.tsx PlotPointW); the
    // gallery sample's yLabels are plain track numbers ("1".."4"), not "row N" text.
    fireEvent.click(screen.getByRole("button", { name: "Cat, 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Cat, 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Cat, 3" }));
    expectSolved(spec, holder);
  });

  it("toggleExplore (switches light the lamp live)", () => {
    const { spec, holder, container } = mount("toggleExplore");
    auditNativeControls(container);
    expect(screen.getByText("The lamp is off.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Switch 1/ }));
    fireEvent.click(screen.getByRole("button", { name: /Switch 2/ }));
    expect(screen.getByText("The lamp is ON!")).toBeTruthy();
    expectSolved(spec, holder);
  });

  it("steppedReveal (check unlocks only after every panel)", () => {
    const { spec, holder, container } = mount("steppedReveal");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("button", { name: /Reveal step 1 of 3/ }));
    expect(canCheck(spec, holder.v)).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: /Reveal step 2 of 3/ }));
    fireEvent.click(screen.getByRole("button", { name: /Reveal step 3 of 3/ }));
    expectSolved(spec, holder);
  });

  it("estimateSlider (log scale snaps to friendly values)", () => {
    const { spec, holder, container } = mount("estimateSlider");
    auditNativeControls(container);
    // position 667/1000 on a 10→10,000 log scale lands ≈1,000 after 2-sig-fig snap
    fireEvent.change(screen.getByRole("slider"), { target: { value: "667" } });
    expect(holder.v).toBe(1000);
    expectSolved(spec, holder);
  });

  it("tenFrame (tap empty cells to make ten)", () => {
    const { spec, holder, container } = mount("tenFrame");
    auditNativeControls(container);
    // 7 pre-filled → tap the three empty cells (8th, 9th, 10th)
    fireEvent.click(screen.getByRole("button", { name: "Empty cell 8" }));
    fireEvent.click(screen.getByRole("button", { name: "Empty cell 9" }));
    fireEvent.click(screen.getByRole("button", { name: "Empty cell 10" }));
    expectSolved(spec, holder);
  });

  it("numberLineHop (native buttons select the landing)", () => {
    const { spec, holder, container } = mount("numberLineHop");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("radio", { name: "Land on 8" }));
    expectSolved(spec, holder);
  });

  it("baseTenCompose (steppers build tens and ones)", () => {
    const { spec, holder, container } = mount("baseTenCompose");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("button", { name: "Add a Tens unit" }));
    fireEvent.click(screen.getByRole("button", { name: "Add a Tens unit" }));
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole("button", { name: "Add a Ones unit" }));
    expectSolved(spec, holder);
  });

  it("subitizeFlash (flash, then pick the count)", () => {
    const { spec, holder, container } = mount("subitizeFlash");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("button", { name: /Flash/ }));
    fireEvent.click(screen.getByRole("radio", { name: "5" }));
    expectSolved(spec, holder);
  });

  /* ── s44 certification: the eight kinds the gate had never covered ── */

  it("pointEntry", () => {
    const { spec, holder } = mount("pointEntry");
    fireEvent.change(screen.getByLabelText("first value"), { target: { value: "-2" } });
    fireEvent.change(screen.getByLabelText("second value"), { target: { value: "3" } });
    expectSolved(spec, holder);
  });

  it("placeCompare", () => {
    const { spec, holder, container } = mount("placeCompare");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("radio", { name: "greater than" }));
    expectSolved(spec, holder);
  });

  it("lengthCompare", () => {
    const { spec, holder, container } = mount("lengthCompare");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("radio", { name: /pencil, 5 paperclips/ }));
    expectSolved(spec, holder);
  });

  it("absValueLine", () => {
    const { spec, holder, container } = mount("absValueLine");
    auditNativeControls(container);
    const group = screen.getByRole("radiogroup", { name: "Which is farther from zero" });
    fireEvent.click(within(group).getAllByRole("radio")[0]); // first item = -4, the answer
    expectSolved(spec, holder);
  });

  it("moneyBoard (build 47¢ from the tray)", () => {
    const { spec, holder, container } = mount("moneyBoard");
    auditNativeControls(container);
    fireEvent.click(screen.getByRole("button", { name: /Add a quarter/ }));
    fireEvent.click(screen.getByRole("button", { name: /Add a dime/ }));
    fireEvent.click(screen.getByRole("button", { name: /Add a dime/ }));
    fireEvent.click(screen.getByRole("button", { name: /Add a penny/ }));
    fireEvent.click(screen.getByRole("button", { name: /Add a penny/ }));
    expectSolved(spec, holder); // 25 + 10 + 10 + 1 + 1 = 47
  });

  it("fractionGrid (four labelled sliders build 2/3 × 4/5)", () => {
    const { spec, holder, container } = mount("fractionGrid");
    auditNativeControls(container);
    fireEvent.change(screen.getByLabelText("row count"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("shade in rows"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("column count"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("shade in columns"), { target: { value: "4" } });
    expectSolved(spec, holder);
  });

  it("fractionCompare (bars are NATIVE buttons after the s44 fix)", () => {
    const { spec, holder, container } = mount("fractionCompare");
    auditNativeControls(container); // would have FAILED on the old <g role="button">
    const first = screen.getByRole("button", { name: /First bar/ });
    expect(first.tagName).toBe("BUTTON");
    fireEvent.click(first);
    expectSolved(spec, holder);
  });

  it("oddEvenPairs (pair three times, then choose odd)", () => {
    const { spec, holder, container } = mount("oddEvenPairs");
    auditNativeControls(container);
    const pair = screen.getByRole("button", { name: /Pair two/ });
    fireEvent.click(pair);
    fireEvent.click(pair);
    fireEvent.click(pair);
    fireEvent.click(screen.getByRole("button", { name: "odd" }));
    expectSolved(spec, holder);
  });

});


/* ---- Session 95–100 laboratories (gated in Session 101): every one keyboard-completable ---- */

describe("keyboard gate — session 95–100 laboratories", () => {
  const range = (name: RegExp | string, value: number | string) =>
    fireEvent.change(screen.getByLabelText(name), { target: { value: String(value) } });
  const press = (name: RegExp | string) => fireEvent.click(screen.getByRole("button", { name }));

  it("triangleConstraintLab: slider + criterion buttons reach the locked triangle", () => {
    const { spec, holder, container } = mount("triangleConstraintLab");
    range("triangle constraint angle", 45);
    range("triangle constraint angle", 55);
    range("triangle constraint angle", 60);
    press("SAS");
    auditNativeControls(container);
    expectSolved(spec, holder);
  });

  it("coordinateProofLab: two sliders position D; evidence buttons complete the proof", () => {
    const { spec, holder, container } = mount("coordinateProofLab");
    range("D x-coordinate", 3);
    range("D y-coordinate", 5);
    press(/Inspect slopes/i);
    press(/Inspect midpoints/i);
    auditNativeControls(container);
    expectSolved(spec, holder);
  });

  it("solidSliceLab: the section slider and comparison button satisfy Cavalieri", () => {
    const { spec, holder, container } = mount("solidSliceLab");
    for (const f of [0.2, 0.3, 0.4, 0.5]) range("section height", f);
    press(/comparison/i);
    auditNativeControls(container);
    expectSolved(spec, holder);
  });

  it("lineRelationLab: rotate and translate by slider to the target relation", () => {
    const { spec, holder, container } = mount("lineRelationLab");
    range("active line offset", 3);
    range("active line angle", 90);
    auditNativeControls(container);
    expectSolved(spec, holder);
  });

  it("triangleAngleLab: the vertex sliders deform the triangle to the target angle", () => {
    const { spec, holder, container } = mount("triangleAngleLab");
    range("Vertex C across", 5);
    range("Vertex C across", 7);
    range("Vertex C height", 7);
    auditNativeControls(container);
    expectSolved(spec, holder);
  });

  it("verticalLineScanner: sweeping the slider and pressing a verdict completes it", () => {
    const { spec, holder, container } = mount("verticalLineScanner");
    for (const x of [-2, 0, 2, 3, 0]) range(/Sweep the vertical scanner/i, x);
    press(/Not a function/i);
    auditNativeControls(container);
    expectSolved(spec, holder);
  });

  it("covariationScrubber: the shared-input slider reaches the target pair", () => {
    const { spec, holder, container } = mount("covariationScrubber");
    range(/Drag the shared input/i, 6);
    auditNativeControls(container);
    expectSolved(spec, holder);
  });

  it("samplingBiasLab: method buttons, size slider, and repeated draws complete the design", () => {
    const { spec, holder, container } = mount("samplingBiasLab");
    press("stratified");
    range("sample size", 100);
    for (let i = 0; i < 5; i++) press(/Draw sample/i);
    auditNativeControls(container);
    expectSolved(spec, holder);
  });

  it("shapeFamilyBuilder: four attribute sliders build the named family", () => {
    const { spec, holder, container } = mount("shapeFamilyBuilder");
    range("Set sides", 4);
    range("Set right angles", 4);
    range("Set parallel pairs", 2);
    auditNativeControls(container);
    expectSolved(spec, holder);
  });

  it("unitRuler: align zero, pick the unit, and iterate placements by button", () => {
    const { spec, holder, container } = mount("unitRuler");
    press(/Align zero/i);
    press("unit 1");
    for (let i = 0; i < 6; i++) press(/Place unit/i);
    auditNativeControls(container);
    expectSolved(spec, holder);
  });

  it("conditionalTableLab: condition buttons and a cell button build the conditional", () => {
    const { spec, holder, container } = mount("conditionalTableLab");
    press(/Given Walk/i);
    press(/Given Bus/i);
    press(/Bus and Sport/i);
    auditNativeControls(container);
    expectSolved(spec, holder);
  });

  it("graphStoryLab: bank stages assemble in authored order", () => {
    const { spec, holder, container } = mount("graphStoryLab");
    auditNativeControls(container);
    if (spec.type === "graphStoryLab") {
      for (const stage of spec.segments) {
        const bankMatch = spec.bank.find((b) => b.kind === stage.kind);
        if (bankMatch) press(new RegExp(`Add ${bankMatch.label}`, "i"));
      }
    }
    expectSolved(spec, holder);
  });

  it("placeValueTransformLab", () => {
    const { spec, holder, container } = mount("placeValueTransformLab");
    auditNativeControls(container);
    for (const b of Array.from(container.querySelectorAll("button"))) fireEvent.click(b);
    const input = container.querySelector('input[type="number"], input[type="text"]') as HTMLInputElement | null;
    if (input) fireEvent.change(input, { target: { value: "12.9" } });
    expectSolved(spec, holder);
  });

  it("placeValueTransformLab: a wrong numeric claim is reachable and named", () => {
    const { spec, holder, container } = mount("placeValueTransformLab");
    for (const b of Array.from(container.querySelectorAll("button"))) fireEvent.click(b);
    const input = container.querySelector('input[type="number"], input[type="text"]') as HTMLInputElement | null;
    expect(input).toBeTruthy();
    fireEvent.change(input!, { target: { value: "12.8" } });
    const res = evaluate(spec, holder.v);
    expect(res.correct).toBe(false);
    expect(res.feedback.length).toBeGreaterThan(15);
  });

  it("equationOutcomeLab", () => {
    const { spec, holder, container } = mount("equationOutcomeLab");
    auditNativeControls(container);
    for (const b of Array.from(container.querySelectorAll("button"))) {
      fireEvent.click(b);
      if (evaluate(spec, holder.v).correct) break;
    }
    expectSolved(spec, holder);
  });

  it("equationOutcomeLab: a wrong outcome claim is reachable and named", () => {
    const { spec, holder } = mount("equationOutcomeLab");
    for (const b of Array.from(document.querySelectorAll("button"))) {
      fireEvent.click(b);
      const res = evaluate(spec, holder.v);
      if (!res.correct) {
        expect(res.feedback.length).toBeGreaterThan(15);
        return;
      }
    }
    throw new Error("no wrong outcome claim was reachable");
  });

  it("conicLocusLab: the eccentricity slider samples ratios and lands the parabola", () => {
    const { spec, holder, container } = mount("conicLocusLab");
    for (const e of [6, 8, 12, 10]) range("conic eccentricity", e);
    auditNativeControls(container);
    expectSolved(spec, holder);
  });

  it("derivativeRuleLab: shrinking h by slider makes the corner term vanish", () => {
    const { spec, holder, container } = mount("derivativeRuleLab");
    for (const h of [0.8, 0.5, 0.25, 0.1]) range("product rule h", h);
    auditNativeControls(container);
    expectSolved(spec, holder);
  });

  it("relatedRatesLab: the ladder-foot slider walks positions to the target", () => {
    const { spec, holder, container } = mount("relatedRatesLab");
    for (const x of [3, 4, 5, 6]) range("ladder foot position", x);
    auditNativeControls(container);
    expectSolved(spec, holder);
  });
});
