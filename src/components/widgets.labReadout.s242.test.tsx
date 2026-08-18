// @vitest-environment jsdom
/**
 * S242 / ACC-01 + ENG-01 R2 — LabReadout carried its state in COLOUR ALONE.
 *
 * `ACC01_ACCESSIBILITY_MATRIX.md` measured 53 call sites passing a conditional `tone` to a
 * component that rendered it as a border and a background and nothing else — no glyph, no text, no
 * ARIA. WCAG 2.1 SC 1.4.1, one component wide, reach 678 instances / 176 graded.
 *
 * `ENG01_REVERSIBLE_PLAY_ASSESSMENT.md` flags many of those same readouts as R2: a "good" tone that
 * appears the instant learner state matches the target, before Check. The two reports are looking at
 * one set of sites from opposite ends — adding a text channel makes the leak LOUDER, and gating the
 * signal makes the contrast problem vanish — which is why they are fixed together and tested
 * together here.
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WidgetRenderer } from "./widgets";
import { DerivativeRuleLabSpec } from "@/lib/schema";

/* A real spec whose readout tone is a TARGET COMPARISON — `st.innerRate === spec.targetInnerRate`
 * — so it is exactly the R2 shape rather than a descriptive readout of the model. */
const spec = DerivativeRuleLabSpec.parse({
  type: "derivativeRuleLab",
  mode: "quotient",
  prompt: "Set u' = 3 and v' = 1 above v^2.",
  quotientU: 6,
  quotientV: 4,
  targetInnerRate: 3,
  targetOuterRate: 1,
  startInnerRate: 1,
  startOuterRate: 3,
  requiredMoves: 4,
  successFeedback: "6/16",
  explorationFeedback: "explore",
  mechanismFeedback: "match"
});

/** The learner's state exactly equal to the target — the moment a pre-commit signal would fire. */
const atTarget = { h: 1, innerRate: 3, outerRate: 1, moves: 4 };

/* The labels are read off the RENDERED widget, not guessed. The first cut filtered for "inner rate"
 * and "outer rate" — the spec's field names — and this engine's readouts are actually labelled
 * "ordered numerator", "v²" and "quotient rate". A test that filters for labels the component never
 * emits passes its loop zero times and asserts nothing. */
const readouts = () => Array.from(document.querySelectorAll("[aria-label]"))
  .map((n) => n.getAttribute("aria-label") ?? "")
  .filter((l) => /^(ordered numerator|v squared|quotient rate):/.test(l));

describe("ENG-01 R2 — a correctness readout waits for the verdict", () => {
  it("does not say 'on target' while the learner is still working", () => {
    render(<WidgetRenderer spec={spec} value={atTarget} disabled={false} onChange={() => {}} />);
    const labels = readouts();
    expect(labels.length, "no readout rendered — the test is measuring nothing").toBeGreaterThan(0);
    for (const label of labels) expect(label).not.toContain("on target");
    // And the colour must be gone too, or the gate only half-applied.
    expect(document.body.innerHTML).not.toContain("bg-leaf/10");
  });

  it("says it after the verdict, where it teaches", () => {
    render(<WidgetRenderer spec={spec} value={atTarget} disabled={false} tone="info" onChange={() => {}} />);
    expect(readouts().some((l) => l.includes("on target"))).toBe(true);
  });
});

describe("ACC-01 — the state is not carried by colour alone", () => {
  it("puts the state in the accessible name, not only in a background class", () => {
    render(<WidgetRenderer spec={spec} value={atTarget} disabled={false} tone="info" onChange={() => {}} />);
    const good = readouts().filter((l) => l.includes("on target"));
    expect(good.length).toBeGreaterThan(0);
    // Every one names its own label and value as well as the state, so it stands alone when read out.
    for (const label of good) expect(label).toMatch(/.+: .+, on target/);
  });

  it("shows a visible mark, so greyscale and low vision get the state too", () => {
    render(<WidgetRenderer spec={spec} value={atTarget} disabled={false} tone="info" onChange={() => {}} />);
    expect(document.body.textContent).toContain("✓");
  });

  it("keeps the value in its own element, so the number is still findable on its own", () => {
    /* Prefixing the mark into the value's text node made a readout read "✓ -14" and broke two tests
     * that assert on the exact number — one of them named "keeps reversal visible as a signed
     * consequence rather than color alone", which is this same concern from the other direction.
     * Anything reading the number, test or assistive tech, should still get the number. */
    render(<WidgetRenderer spec={spec} value={atTarget} disabled={false} tone="info" onChange={() => {}} />);
    expect(screen.getAllByText("0.375").length).toBeGreaterThan(0);
    expect(screen.getAllByText("16").length).toBeGreaterThan(0);
  });

  it("does not announce the mark twice", () => {
    // The state is already in the container's accessible name; the glyph is decoration for the eye.
    render(<WidgetRenderer spec={spec} value={atTarget} disabled={false} tone="info" onChange={() => {}} />);
    const marks = Array.from(document.querySelectorAll("span")).filter((n) => n.textContent?.trim() === "✓");
    expect(marks.length).toBeGreaterThan(0);
    for (const mark of marks) expect(mark.getAttribute("aria-hidden")).toBe("true");
  });
});
