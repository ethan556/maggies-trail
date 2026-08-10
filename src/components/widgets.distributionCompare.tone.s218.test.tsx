// @vitest-environment jsdom
/**
 * S218 — distributionCompareLab judge-mode error/reveal surfaces (Fable-only session).
 *
 * The lift under test: judge mode previously answered a wrong conclusion with feedback TEXT only —
 * the picture never responded. Now, at retry (error) and reveal (info), the DECIDING QUANTITIES —
 * the mean gap in variability-units and the overlap share — are drawn onto the picture
 * (`dcl-evidence`), and the options carry the house option-surface grammar (`dcl-judge-ghost` on
 * the correct option at reveal, `dcl-judge-yours` contrast on a differing pick, retry cue on the
 * learner's own pick with the correct option NOT marked).
 *
 * Expectations are INDEPENDENT: gap and overlap are recomputed here by a hand transcription of the
 * published model (gap = |meanB − meanA| / variability; overlap by the same closed form, verified
 * below against three hand-checked anchor values BEFORE it is used), never by importing the
 * helpers the widget uses.
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import WidgetView from "./WidgetView.testshim";

afterEach(cleanup);

/** Independent transcription of this engine's PUBLISHED overlap readout. The schema documents it
 * as "a deterministic visual-overlap proxy… deliberately a readout, not a grading threshold":
 * overlap(g) = exp(−g²/8). The shipped judge-mode aria already speaks this proxy ("Their patterned
 * overlap is about P percent"), so the S218 evidence overlay printing the same quantity is
 * consistent with the engine's established readout semantics — and this transcription is anchored
 * by hand below BEFORE use, so the test cannot inherit a bug from the model. */
const overlapShare = (g: number) => Math.exp(-(g * g) / 8);

const JUDGE = (over: Partial<Record<string, unknown>> = {}) =>
  WidgetSpec.parse({
    type: "distributionCompareLab",
    prompt: "What conclusion does the overlap support?",
    mode: "judge",
    gapUnits: 3,
    judgeOptions: [
      { id: "a", correct: true, label: "The classes are meaningfully different", feedback: "Three variability-units apart is a real separation." },
      { id: "b", label: "The classes are basically the same", feedback: "Look at how little the curves overlap before deciding they match." },
      { id: "c", label: "The data must be wrong", feedback: "Data that surprises you is not the same as data that is wrong." }
    ],
    successFeedback: "Three variability-units apart: a genuine difference with a little overlap.",
    ...over
  }) as TWidget;

const mount = (spec: TWidget, value: unknown, tone?: "error" | "info" | "success" | "neutral") =>
  render(<WidgetView spec={spec} value={value} onChange={() => {}} disabled={false} tone={tone} />);

describe("the independent overlap transcription is anchored before use", () => {
  it("matches three hand-checked values", () => {
    // g = 0: exp(0) = 1 → 100%.
    expect(Math.round(overlapShare(0) * 100)).toBe(100);
    // g = 2: exp(−4/8) = e^−0.5 ≈ 0.6065 → 61%.
    expect(Math.round(overlapShare(2) * 100)).toBe(61);
    // g = 3: exp(−9/8) = e^−1.125 ≈ 0.3247 → 32%.
    expect(Math.round(overlapShare(3) * 100)).toBe(32);
  });
});

describe("distributionCompareLab judge mode — evidence illumination", () => {
  it("no tone: NO evidence overlay, NO ghost, NO contrast — the classic surface is untouched", () => {
    mount(JUDGE(), "b");
    expect(screen.queryByTestId("dcl-evidence")).toBeNull();
    expect(screen.queryByTestId("dcl-judge-ghost")).toBeNull();
    expect(screen.queryByTestId("dcl-judge-yours")).toBeNull();
  });

  it("retry (error): the evidence states the TRUE gap and overlap for the authored numbers", () => {
    // Independent: authored gapUnits = 3; overlap proxy exp(−9/8) ≈ 32%.
    const { container } = mount(JUDGE(), "b", "error");
    const ev = screen.getByTestId("dcl-evidence");
    expect(ev.textContent).toContain("gap ≈ 3 variability-units");
    expect(ev.textContent).toContain(`overlap ≈ ${Math.round(overlapShare(3) * 100)}%`);
    // the retry cue sits on the learner's own pick…
    const pick = screen.getByRole("button", { name: "The classes are basically the same" });
    expect(pick.className).toContain("border-berry");
    // …and the CORRECT option is not marked at retry (no leak).
    const correct = screen.getByRole("button", { name: "The classes are meaningfully different" });
    expect(correct.className).not.toContain("tangerine");
    expect(container.querySelectorAll('[data-testid="dcl-judge-ghost"]').length).toBe(0);
  });

  it("reveal (info): ghost on the correct option, contrast on the differing pick, evidence in tangerine", () => {
    mount(JUDGE(), "c", "info");
    expect(screen.getByTestId("dcl-judge-ghost").textContent).toBe("The classes are meaningfully different");
    expect(screen.getByTestId("dcl-judge-yours").textContent).toBe("The data must be wrong");
    expect(screen.getByTestId("dcl-evidence")).toBeTruthy();
  });

  it("reveal with the RIGHT pick: ghost only, no contrast", () => {
    mount(JUDGE(), "a", "info");
    expect(screen.getByTestId("dcl-judge-ghost")).toBeTruthy();
    expect(screen.queryByTestId("dcl-judge-yours")).toBeNull();
  });

  it("the singular state: gap exactly 1 reads 'variability-unit', not 'units' (QA REQUIRED_FIX, S218)", () => {
    // si-03-03/i1 authors gapUnits exactly 1 — the shipped trigger for the singular branch.
    mount(JUDGE({ gapUnits: 1 }), "b", "error");
    const ev = screen.getByTestId("dcl-evidence");
    expect(ev.textContent).toContain("gap ≈ 1 variability-unit");
    expect(ev.textContent).not.toContain("variability-units");
    expect(ev.textContent).toContain(`overlap ≈ ${Math.round(overlapShare(1) * 100)}%`);
  });

  it("the evidence is true of a DIFFERENT authored shape too (gap 0: identical means)", () => {
    // sp-02-01/i2 and sp-02-03/i2 author answer=0 shapes; evidence must not fabricate separation.
    const spec = JUDGE({ gapUnits: 0 });
    mount(spec, "b", "error");
    const ev = screen.getByTestId("dcl-evidence");
    expect(ev.textContent).toContain("gap ≈ 0 variability-units");
    expect(ev.textContent).toContain("overlap ≈ 100%");
  });

  it("measure mode is untouched by the judge surfaces in every tone", () => {
    const measure = WidgetSpec.parse({
      type: "distributionCompareLab",
      prompt: "How many variability-units apart are the means?",
      mode: "measure",
      groupALabel: "A",
      groupBLabel: "B",
      meanA: 10,
      meanB: 16,
      variability: 2,
      answer: 3,
      tolerance: 0.25,
      measureChoices: [
        { value: 1, feedback: "One unit would put the curves nearly on top of each other." },
        { value: 3, feedback: "Three is the measured separation, counted against the target tape." },
        { value: 6, feedback: "Six units would separate the curves completely." }
      ],
      successFeedback: "Three variability-units: the curves separate with just a sliver of overlap."
    }) as TWidget;
    for (const tone of [undefined, "error", "info"] as const) {
      cleanup();
      mount(measure, 3, tone);
      expect(screen.queryByTestId("dcl-evidence")).toBeNull();
      expect(screen.queryByTestId("dcl-judge-ghost")).toBeNull();
      expect(screen.queryByTestId("dcl-judge-yours")).toBeNull();
    }
  });
});
