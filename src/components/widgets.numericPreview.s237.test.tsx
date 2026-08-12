// @vitest-environment jsdom
//
// S237 — numeric's LIVE FIXED-DENOMINATOR PREVIEW.
//
// WHAT THIS PINS. `numeric` renders an input and nothing else across 3,779 authored steps.
// Steps that ask for a NUMERATOR over a denominator the prompt already fixes ("How many
// fourths…?") can now declare `previewDenominator`, and the widget draws the learner's entry
// on the same partition bar fractionEntry has always drawn — 3 becomes visibly 3/4.
//
// THE FOUR THINGS THAT MUST HOLD, and why each is here:
//   1. It draws the right picture: previewDenominator 4 with 3 entered is 4 cells, 3 sky, 1 white.
//   2. It refuses honestly: empty, non-numeric, negative, fractional, or past the honest-partition
//      cap draws NOTHING and never throws.
//   3. It is additive: a numeric spec WITHOUT the field renders byte-identically to before —
//      no SVG, no accessibility panel. That is the regression guard for the other ~3,659 steps.
//   4. Grading is untouched. `previewDenominator` is display-only; `evaluate` returns identical
//      results with and without it, for the correct answer, a trap and an untrapped wrong.
//
// PLUS the accessibility half, which is the point of doing this at all: the bar is aria-hidden
// like every other live preview, so `describeWidgetState` speaks the SAME fraction. The
// fractionEntry and pointEntry previews have no spoken twin — a known gap this deliberately does
// not repeat.
//
// EVERY REJECTION IS PAIRED WITH A NEAR-IDENTICAL ACCEPTANCE. A gate that only ever asserts
// "nothing rendered" passes just as well when the feature is deleted, or when a typo makes it
// render nothing at all. Each pair differs in exactly the one value under test:
//   ""         vs "0"    (and "0" is the Number("") === 0 trap: an empty box must not read as zero)
//   "abc"      vs "3"
//   "-2"       vs "2"
//   "2.5"      vs "2"
//   den 21     vs den 20 (the cap boundary, from both sides)
//   entered 9  vs 8      (2 × den, the numerator boundary, from both sides)
//   no field   vs field  (the regression guard, from both sides)

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, numericPreviewParts, type TWidget } from "@/lib/schema";
import { canCheck, evaluate } from "@/lib/evaluate";
import { describeWidgetState } from "@/lib/describeState";

afterEach(cleanup);

const SKY = "#2E7CD6";
const WHITE = "#fff";

/** The one authored shape under test, and the SAME shape with the field removed. Everything
 * else about the two specs is identical, so any difference between them is `previewDenominator`
 * and nothing else. */
const BASE = {
  type: "numeric",
  prompt: "The bar is cut into 4 equal parts. How many fourths are shaded?",
  answer: 3,
  commonErrors: [{ value: 4, feedback: "You counted every part. Count only the shaded ones: 3 of the 4." }],
  fallbackFeedback: "Count the shaded parts, then say how many fourths that is out of the 4.",
  successFeedback: "Yes — 3 of the 4 equal parts are shaded, so 3/4."
} as const;

const withPreview = (over: Record<string, unknown> = {}): TWidget =>
  WidgetSpec.parse({ ...BASE, previewDenominator: 4, ...over }) as TWidget;
const withoutPreview = (over: Record<string, unknown> = {}): TWidget =>
  WidgetSpec.parse({ ...BASE, ...over }) as TWidget;

function mount(spec: TWidget, tone?: "neutral" | "info" | "error" | "success") {
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
        disabled={false}
        tone={tone}
      />
    );
  }
  render(<Host />);
  return holder;
}

const type = (text: string) =>
  fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });

const svgs = () => document.querySelectorAll("svg");
const rects = () => Array.from(document.querySelectorAll("svg rect"));
const fills = () => rects().map((r) => r.getAttribute("fill"));

describe("numeric live preview — what it draws", () => {
  it("typing 3 on a previewDenominator-4 step draws 4 cells: 3 sky, 1 white", () => {
    mount(withPreview());
    type("3");
    expect(svgs().length).toBe(1);
    expect(rects().length).toBe(4);
    expect(fills()).toEqual([SKY, SKY, SKY, WHITE]);
  });

  it("the shading follows the entry cell by cell, so the bar IS the fraction typed", () => {
    mount(withPreview());
    type("1");
    expect(fills()).toEqual([SKY, WHITE, WHITE, WHITE]);
    type("2");
    expect(fills()).toEqual([SKY, SKY, WHITE, WHITE]);
    // 4/4 is ONE WHOLE, and is drawn as one whole bar rather than a four-cell bar with every
    // cell filled — same quantity, and the picture now says "one whole" when that is the truth.
    type("4");
    expect(svgs().length).toBe(1);
    expect(rects().length).toBe(1);
    expect(fills()).toEqual([SKY]);
  });

  it("the cell count is the DENOMINATOR, not the entry (5 on a /8 step is 8 cells, 5 sky)", () => {
    mount(withPreview({ previewDenominator: 8, answer: 5 }));
    type("5");
    expect(rects().length).toBe(8);
    expect(fills()).toEqual([SKY, SKY, SKY, SKY, SKY, WHITE, WHITE, WHITE]);
  });
});

describe("numeric live preview — every refusal, paired with the acceptance beside it", () => {
  it("REJECTS an empty box (0 SVGs) — and ACCEPTS a typed 0 as an all-white bar", () => {
    // Number("") === 0. An empty box that read as zero would paint a 4-cell bar over a
    // learner who has not answered yet; a typed 0 genuinely is 0/4 and must draw.
    mount(withPreview());
    expect(svgs().length).toBe(0); // nothing typed at all
    type("   ");
    expect(svgs().length).toBe(0); // whitespace is not an entry
    type("0");
    expect(svgs().length).toBe(1);
    expect(fills()).toEqual([WHITE, WHITE, WHITE, WHITE]);
    type("");
    expect(svgs().length).toBe(0); // and clearing it takes the bar away again
  });

  it("REJECTS non-numeric text — and ACCEPTS the digit typed in its place", () => {
    mount(withPreview());
    type("abc");
    expect(svgs().length).toBe(0);
    type("3");
    expect(svgs().length).toBe(1);
  });

  it("REJECTS a negative entry — and ACCEPTS the same magnitude positive", () => {
    mount(withPreview());
    type("-2");
    expect(svgs().length).toBe(0);
    type("2");
    expect(rects().length).toBe(4);
    expect(fills()).toEqual([SKY, SKY, WHITE, WHITE]);
  });

  it("REJECTS a non-integer entry — and ACCEPTS the integer beside it", () => {
    mount(withPreview());
    type("2.5");
    expect(svgs().length).toBe(0);
    type("2");
    expect(svgs().length).toBe(1);
  });

  it("REJECTS a denominator past the honest-partition cap — and ACCEPTS the cap itself", () => {
    mount(withPreview({ previewDenominator: 21, answer: 5 }));
    type("5");
    expect(svgs().length).toBe(0);
    cleanup();
    mount(withPreview({ previewDenominator: 20, answer: 5 }));
    type("5");
    expect(svgs().length).toBe(1);
    expect(rects().length).toBe(20);
  });

  it("draws an IMPROPER entry as whole bars plus a remainder, never as one over-filled bar", () => {
    // CORRECTED, and STRICTER than what this gate asserted before. It used to pin "8 on a /4
    // step fills all four cells of ONE bar" — a picture that says ONE WHOLE for an answer of
    // TWO wholes, understating the learner's own entry. A fraction model must show 8/4 as two
    // whole bars, which is what fractionEntry has always done for the same quantity. The old
    // assertion accepted an under-drawn bar; this one pins the exact quantity.
    mount(withPreview());
    type("5"); // 5/4 → one whole bar + 1 of 4
    expect(svgs().length).toBe(2);
    expect(fills()).toEqual([SKY, SKY, WHITE, WHITE, WHITE]); // whole bar, then 1-of-4
    type("8"); // 8/4 → exactly two wholes, and NO remainder bar
    expect(svgs().length).toBe(2);
    expect(fills()).toEqual([SKY, SKY]);
    type("4"); // and one whole is one bar
    expect(svgs().length).toBe(1);
    expect(fills()).toEqual([SKY]);
  });

  it("REJECTS more whole bars than a row can honestly show — and ACCEPTS the ceiling", () => {
    mount(withPreview({ previewDenominator: 4, answer: 4 }));
    type("28"); // 7 wholes — past the six-bar ceiling fractionEntry uses
    expect(svgs().length).toBe(0);
    type("24"); // exactly 6 wholes
    expect(svgs().length).toBe(6);
    expect(fills()).toEqual([SKY, SKY, SKY, SKY, SKY, SKY]);
  });

  it("never throws on hostile entries, and draws nothing for any of them", () => {
    mount(withPreview());
    for (const t of ["", " ", "-", "abc", "1e400", "NaN", "Infinity", "-0.5", "1/2", "٣"]) {
      expect(() => type(t)).not.toThrow();
      expect(svgs().length, t).toBe(0);
    }
    type("3"); // …and the widget is still alive and drawing afterwards
    expect(svgs().length).toBe(1);
  });
});

describe("numeric WITHOUT previewDenominator renders exactly as before (the ~3,659-step guard)", () => {
  it("draws no SVG for any entry — while the identical spec WITH the field draws one", () => {
    mount(withoutPreview());
    for (const t of ["3", "0", "1", "4", "8", "12"]) {
      type(t);
      expect(svgs().length, `plain numeric should never draw for "${t}"`).toBe(0);
    }
    cleanup();
    mount(withPreview());
    for (const [t, n] of [["3", 1], ["0", 1], ["1", 1], ["4", 1], ["8", 2]] as const) {
      type(t);
      expect(svgs().length, `preview numeric should draw for "${t}"`).toBe(n);
    }
  });

  it("gets no accessibility panel — while the previewing spec gets one", () => {
    mount(withoutPreview());
    type("3");
    expect(screen.queryByTestId("a11y-panel")).toBeNull();
    cleanup();
    mount(withPreview());
    type("3");
    expect(screen.getByTestId("a11y-panel")).toBeTruthy();
  });

  it("the input, its unit-bearing name and the reveal ghost are untouched by the new field", () => {
    // The preview is ADDITIVE. Everything NumericW renders besides it must still render: the
    // labelled input, the unit, and the tone="info" ghost chip. S238 CORRECTION (stricter, not
    // looser): this guard originally pinned aria-label={spec.prompt} — the prompt-as-name
    // defect itself. The house pattern (estimateSlider S237, SliderW + NumericW S238) names the
    // control by a visible wrapping <label> stating what it takes, with the unit folded into
    // the name; the guard now pins THAT, and pins the aria-label gone.
    for (const spec of [withoutPreview({ unit: "quarters" }), withPreview({ unit: "quarters" })]) {
      const holder = mount(spec, "info");
      const box = screen.getByRole("textbox", { name: "Your answer (quarters)" });
      expect(box.getAttribute("aria-label")).toBeNull();
      fireEvent.change(box, { target: { value: "2" } });
      expect(holder.v).toBe(2); // the emitted value is the plain number, exactly as before
      expect(screen.getByTestId("num-ghost").textContent).toContain("3 quarters");
      fireEvent.change(box, { target: { value: "3" } });
      expect(screen.queryByTestId("num-ghost")).toBeNull(); // …and still hidden on a match
      cleanup();
    }
  });

  it("the preview is aria-hidden, so it adds no second voice over the input", () => {
    mount(withPreview());
    type("3");
    const bar = document.querySelector("svg")!.closest("[aria-hidden]");
    expect(bar).not.toBeNull();
    expect(bar!.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("grading is untouched — previewDenominator never reaches evaluate", () => {
  const cases: Array<[string, unknown]> = [
    ["the correct answer", 3],
    ["the trap value", 4],
    ["an untrapped wrong", 7],
    ["a wrong value inside the drawable range", 0],
    ["nothing entered", null],
    ["a non-number", "3"]
  ];

  it("returns identical results with and without the field, for every case", () => {
    for (const [name, v] of cases) {
      expect(evaluate(withPreview(), v), name).toEqual(evaluate(withoutPreview(), v));
      expect(canCheck(withPreview(), v), name).toBe(canCheck(withoutPreview(), v));
    }
  });

  it("and those results are still the RIGHT ones (not identically broken)", () => {
    expect(evaluate(withPreview(), 3)).toEqual({ correct: true, feedback: BASE.successFeedback });
    expect(evaluate(withPreview(), 4)).toEqual({ correct: false, feedback: BASE.commonErrors[0].feedback });
    expect(evaluate(withPreview(), 7)).toEqual({ correct: false, feedback: BASE.fallbackFeedback });
    expect(canCheck(withPreview(), null)).toBe(false);
    expect(canCheck(withPreview(), 3)).toBe(true);
  });

  it("tolerance still governs correctness, and the preview does not widen or narrow it", () => {
    const tol = { tolerance: 0.5, answer: 3 };
    expect(evaluate(withPreview(tol), 3.4)).toEqual(evaluate(withoutPreview(tol), 3.4));
    expect(evaluate(withPreview(tol), 3.4).correct).toBe(true);
    expect(evaluate(withPreview(tol), 3.6).correct).toBe(false);
  });

  it("a spec that omits the field parses without the key at all", () => {
    const plain = WidgetSpec.parse(BASE) as Extract<TWidget, { type: "numeric" }>;
    expect("previewDenominator" in plain).toBe(false);
    expect(plain.previewDenominator).toBeUndefined();
    const shown = WidgetSpec.parse({ ...BASE, previewDenominator: 4 }) as Extract<TWidget, { type: "numeric" }>;
    expect(shown.previewDenominator).toBe(4);
  });

  it("the schema rejects a denominator that is not a positive integer", () => {
    for (const bad of [0, -4, 2.5]) {
      expect(WidgetSpec.safeParse({ ...BASE, previewDenominator: bad }).success, String(bad)).toBe(false);
    }
    expect(WidgetSpec.safeParse({ ...BASE, previewDenominator: 1 }).success).toBe(true);
  });
});

describe("the spoken description says exactly what the bar shows", () => {
  const said = (spec: TWidget, v: unknown) => describeWidgetState(spec, v);

  it("speaks the same fraction the bar draws", () => {
    expect(said(withPreview(), 3)).toBe(
      "You entered 3 of 4. The bar is cut into 4 equal parts, and 3 parts are shaded."
    );
  });

  it("SINGULAR: one shaded part is \"1 part is shaded\", never \"1 parts\"", () => {
    const one = said(withPreview(), 1)!;
    expect(one).toContain("1 part is shaded");
    expect(one).not.toContain("1 parts");
    expect(one).not.toContain("1 part are");
    // …and the plural beside it, so the singular is not passing by the sentence being absent.
    const many = said(withPreview(), 3)!;
    expect(many).toContain("3 parts are shaded");
    expect(many).not.toContain("3 part is");
  });

  it("zero is plural, and a one-part bar is singular on the TOTAL as well", () => {
    expect(said(withPreview(), 0)!).toContain("0 parts are shaded");
    const single = said(withPreview({ previewDenominator: 1, answer: 1 }), 1)!;
    // 1/1 is one whole, so it is spoken as one whole bar. The singular-total phrasing is
    // reached by a PROPER entry on a one-part bar, which is 0/1.
    expect(single).toContain("That fills 1 whole bar exactly.");
    expect(said(withPreview({ previewDenominator: 1, answer: 0 }), 0)!).toContain("cut into 1 equal part,");
    expect(single).not.toContain("1 equal parts");
    // …paired with the plural total, so the singular is not passing by the clause being missing.
    expect(said(withPreview(), 1)!).toContain("cut into 4 equal parts,");
  });

  it("an improper entry is SPOKEN as wholes plus a remainder, matching what is drawn", () => {
    // CORRECTED and stricter. This used to accept "the bar has 4 cells, entering 5 fills all 4"
    // — the sentence for a picture that showed ONE whole for five quarters. Now 5/4 draws a
    // whole bar plus 1-of-4, and the sentence has to say that; a sentence claiming a single
    // over-filled bar would fail here.
    mount(withPreview());
    type("5");
    expect(svgs().length).toBe(2);
    const text = said(withPreview(), 5)!;
    expect(text).toContain("You entered 5 of 4");
    expect(text).toContain("1 whole bar and 1 of 4 parts of another");
    expect(text).not.toContain("4 parts are shaded");   // the old, understating sentence
    expect(text).not.toContain("1 of 4 part of another"); // derived morphology, banned here
    // Exact wholes name themselves, and the plural of "bars" is stored, not derived.
    expect(said(withPreview(), 8)!).toContain("That fills 2 whole bars exactly.");
    expect(said(withPreview(), 4)!).toContain("That fills 1 whole bar exactly.");
    expect(said(withPreview(), 4)!).not.toContain("1 whole bars");
  });

  it("stays silent exactly when the bar does — every refusal above, and no field at all", () => {
    for (const v of [null, undefined, "3", 2.5, -2, NaN, Infinity, 28]) {
      expect(said(withPreview(), v), String(v)).toBeNull();
    }
    expect(said(withPreview({ previewDenominator: 21, answer: 5 }), 5)).toBeNull();
    for (const v of [3, 0, 1, 8]) expect(said(withoutPreview(), v), String(v)).toBeNull();
    // Paired acceptance: the same values that DO draw are the same values that DO speak.
    for (const v of [3, 0, 1, 8]) expect(said(withPreview(), v), String(v)).not.toBeNull();
  });

  it("the description is derived from the renderer's own resolver, so they cannot drift", () => {
    // Both the bar and the sentence come from numericPreviewParts. Pinning it directly means a
    // future change to the cap moves both at once or fails here.
    const num = (s: TWidget) => s as Extract<TWidget, { type: "numeric" }>;
    expect(numericPreviewParts(num(withPreview()), 3)).toEqual({ wholes: 0, shaded: 3, total: 4 });
    expect(numericPreviewParts(num(withPreview()), 8)).toEqual({ wholes: 2, shaded: 0, total: 4 });
    expect(numericPreviewParts(num(withPreview()), 5)).toEqual({ wholes: 1, shaded: 1, total: 4 });
    expect(numericPreviewParts(num(withPreview()), 28)).toBeNull();
    expect(numericPreviewParts(num(withoutPreview()), 3)).toBeNull();
  });

  it("never states the answer — only the learner's entry and the prompt's denominator", () => {
    // The prompt gives the 4. The answer (3) may only appear because the learner typed it.
    const wrong = said(withPreview({ answer: 3 }), 2)!;
    expect(wrong).not.toContain("3");
    expect(wrong).toContain("2");
    expect(wrong).toContain("4");
  });

  it("appears in the on-screen panel a screen reader reads, next to the aria-hidden bar", () => {
    mount(withPreview());
    type("3");
    const panel = screen.getByTestId("a11y-panel");
    expect(panel.textContent).toContain("Describe this model");
    expect(panel.textContent).toContain("You entered 3 of 4");
    expect(panel.querySelector("[aria-live]")).toBeNull(); // the no-chatter contract
  });
});

