// @vitest-environment jsdom
//
// fractionEntry — the fraction-FORM analogue of `numeric`. Pins:
//   · exact rational grading (integer cross-multiplication, no float dust)
//   · per-VALUE traps: "1 1/2" and "3/2" are the same wrong amount (numeric's
//     commonErrors semantics, NOT fractionBar's exact-build semantics)
//   · form grading: lowestTerms (5/10 for 1/2 → formFeedback) and mixed
//     (6/5 or 1 2/10 for 1 1/5 → formFeedback); form "any" takes any equivalent
//   · whole-only entries on mixed tasks ("3" = 3 + 0/1) are trappable values
//   · integrity: traps equal to the answer, duplicate trap values, form/answer
//     contradictions, and dead formFeedback are all rejected
//   · renderer: three labelled text fields; partial entry yields a null value
//     (Check stays gated) — the numerator/denominator pair, or the whole alone.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "@/lib/schema";
import { canCheck, correctAnswerText, evaluate } from "@/lib/evaluate";
import { widgetWrongPaths } from "@/lib/pedagogy";

afterEach(cleanup);

function mount(spec: TWidget, disabled = false) {
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
      />
    );
  }
  render(<Host />);
  return holder;
}

const mixedSpec = WidgetSpec.parse({
  type: "fractionEntry",
  prompt: "3 × 1/2 ft — combined length as a mixed number?",
  allowWhole: true,
  form: "mixed",
  answerWhole: 1,
  answerNum: 1,
  answerDen: 2,
  unit: "ft",
  formFeedback: "Right amount — now write it as a mixed number: whole feet plus the fraction left over.",
  commonEntries: [
    { whole: 0, num: 1, den: 2, feedback: "1/2 is one ribbon. Three of them: 3 × 1/2 = 1 1/2 ft." },
    { whole: 2, num: 1, den: 2, feedback: "That's five halves — three ribbons make three: 1 1/2 ft." }
  ],
  fallbackFeedback: "Count the halves: 3 × 1/2 = 3/2 = 1 whole and 1/2 left.",
  successFeedback: "Yes — 3 × 1/2 = 3/2 = 1 1/2 feet."
}) as TWidget;

const lowestSpec = WidgetSpec.parse({
  type: "fractionEntry",
  prompt: "2/5 + 1/10 = ? (rewrite 2/5 as 4/10, then simplify)",
  form: "lowestTerms",
  answerNum: 1,
  answerDen: 2,
  formFeedback: "That's the right amount — now simplify: divide top and bottom by their common factor.",
  commonEntries: [{ whole: 0, num: 3, den: 15, feedback: "3/15 adds tops AND bottoms. Rewrite over tenths first: 4/10 + 1/10 = 5/10 = 1/2." }],
  fallbackFeedback: "Rewrite 2/5 as 4/10, add the tenths (4 + 1 = 5), then simplify 5/10."
}) as TWidget;

describe("fractionEntry grading", () => {
  it("exact-value success in the demanded form; equivalent-but-wrong-form routes to formFeedback", () => {
    expect(evaluate(mixedSpec, { whole: 1, num: 1, den: 2 })).toEqual({
      correct: true,
      feedback: "Yes — 3 × 1/2 = 3/2 = 1 1/2 feet."
    });
    // right amount, improper form
    expect(evaluate(mixedSpec, { whole: 0, num: 3, den: 2 }).correct).toBe(false);
    expect(evaluate(mixedSpec, { whole: 0, num: 3, den: 2 }).feedback).toContain("mixed number");
    // right amount, non-lowest fraction part
    expect(evaluate(mixedSpec, { whole: 1, num: 2, den: 4 }).feedback).toContain("mixed number");
  });

  it("traps match on VALUE: 1/2 and 2/4 and 3/6 all fire the same diagnosis", () => {
    for (const v of [
      { whole: 0, num: 1, den: 2 },
      { whole: 0, num: 2, den: 4 },
      { whole: 0, num: 3, den: 6 }
    ]) {
      expect(evaluate(mixedSpec, v).feedback).toContain("one ribbon");
    }
  });

  it("whole-only entries are real values (2 = 2 + 0/1) and untrapped wrongs hit the fallback", () => {
    expect(evaluate(mixedSpec, { whole: 2, num: 0, den: 1 }).feedback).toContain("Count the halves");
  });

  it("lowestTerms: 1/2 correct, 5/10 → formFeedback, 3/15 → its trap, 7/10 → fallback", () => {
    expect(evaluate(lowestSpec, { whole: 0, num: 1, den: 2 }).correct).toBe(true);
    expect(evaluate(lowestSpec, { whole: 0, num: 5, den: 10 }).feedback).toContain("now simplify");
    expect(evaluate(lowestSpec, { whole: 0, num: 3, den: 15 }).feedback).toContain("adds tops AND bottoms");
    expect(evaluate(lowestSpec, { whole: 0, num: 7, den: 10 }).feedback).toContain("Rewrite 2/5 as 4/10");
  });

  it("form any accepts every equivalent, including improper for a whole-number answer", () => {
    const anySpec = WidgetSpec.parse({
      type: "fractionEntry",
      prompt: "Total length?",
      allowWhole: true,
      answerWhole: 2,
      answerNum: 0,
      answerDen: 1,
      unit: "ft",
      commonEntries: [
        { whole: 1, num: 1, den: 2, feedback: "1 1/2 misses a mark — recount the plot." },
        { whole: 2, num: 1, den: 2, feedback: "Recount: the quarter and three-quarter marks combine to exactly 1." }
      ],
      fallbackFeedback: "Add value × count for every mark on the plot."
    }) as TWidget;
    expect(evaluate(anySpec, { whole: 2, num: 0, den: 1 }).correct).toBe(true);
    expect(evaluate(anySpec, { whole: 0, num: 8, den: 4 }).correct).toBe(true);
    expect(evaluate(anySpec, { whole: 1, num: 1, den: 2 }).feedback).toContain("misses a mark");
  });

  it("canCheck gates on a well-formed fraction; reveal text speaks the display form", () => {
    expect(canCheck(mixedSpec, null)).toBe(false);
    expect(canCheck(mixedSpec, { whole: 1, num: 1, den: 2 })).toBe(true);
    expect(canCheck(mixedSpec, { whole: 1, num: 1, den: 0 })).toBe(false);
    expect(correctAnswerText(mixedSpec)).toBe("1 1/2 ft");
    expect(correctAnswerText(lowestSpec)).toBe("1/2");
  });

  it("wrong paths include every trap, the form path, and the fallback", () => {
    const paths = widgetWrongPaths(mixedSpec);
    expect(paths).toHaveLength(4);
    expect(paths.some((p) => p.includes("mixed number"))).toBe(true);
  });
});

describe("fractionEntry integrity rules", () => {
  const base = {
    type: "fractionEntry",
    prompt: "p",
    answerNum: 1,
    answerDen: 2,
    fallbackFeedback: "Rewrite over a common denominator, then add the numerators."
  };
  const mk = (over: object) => WidgetSpec.parse({ ...base, ...over }) as TWidget;

  it("a trap equal to the answer value (in any form) is rejected", () => {
    const s = mk({ commonEntries: [{ whole: 0, num: 2, den: 4, feedback: "f" }] });
    expect(widgetIntegrityErrors(s).join(" ")).toContain("equals the answer value");
  });

  it("two traps sharing one value are rejected", () => {
    const s = mk({
      commonEntries: [
        { whole: 0, num: 3, den: 4, feedback: "f1" },
        { whole: 0, num: 6, den: 8, feedback: "f2" }
      ]
    });
    expect(widgetIntegrityErrors(s).join(" ")).toContain("share the value");
  });

  it("form/answer contradictions and dead formFeedback are rejected", () => {
    expect(widgetIntegrityErrors(mk({ form: "lowestTerms", answerNum: 5, answerDen: 10, formFeedback: "x" })).join(" ")).toContain(
      "not itself in lowest terms"
    );
    expect(widgetIntegrityErrors(mk({ form: "mixed", formFeedback: "x" })).join(" ")).toContain("needs allowWhole");
    expect(widgetIntegrityErrors(mk({ form: "lowestTerms" })).join(" ")).toContain("needs formFeedback");
    expect(widgetIntegrityErrors(mk({ formFeedback: "x" })).join(" ")).toContain("unreachable dead feedback");
  });

  it("a clean spec passes", () => {
    expect(widgetIntegrityErrors(mixedSpec)).toEqual([]);
    expect(widgetIntegrityErrors(lowestSpec)).toEqual([]);
  });
});

describe("fractionEntry renderer", () => {
  it("partial entry yields null (Check gated); a full entry emits the triple", () => {
    const holder = mount(mixedSpec);
    fireEvent.change(screen.getByRole("textbox", { name: "numerator" }), { target: { value: "3" } });
    expect(holder.v).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "denominator" }), { target: { value: "2" } });
    expect(holder.v).toEqual({ whole: 0, num: 3, den: 2 });
    fireEvent.change(screen.getByRole("textbox", { name: "whole number" }), { target: { value: "1" } });
    expect(holder.v).toEqual({ whole: 1, num: 3, den: 2 });
  });

  it("whole-only entry on a mixed task emits whole + 0/1; clearing it re-nulls", () => {
    const holder = mount(mixedSpec);
    fireEvent.change(screen.getByRole("textbox", { name: "whole number" }), { target: { value: "3" } });
    expect(holder.v).toEqual({ whole: 3, num: 0, den: 1 });
    fireEvent.change(screen.getByRole("textbox", { name: "whole number" }), { target: { value: "" } });
    expect(holder.v).toBeNull();
  });

  it("pure-fraction tasks render no whole field; non-integer input nulls the value", () => {
    const holder = mount(lowestSpec);
    expect(screen.queryByRole("textbox", { name: "whole number" })).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "numerator" }), { target: { value: "1.5" } });
    fireEvent.change(screen.getByRole("textbox", { name: "denominator" }), { target: { value: "2" } });
    expect(holder.v).toBeNull();
  });

  it("disabled state disables all fields", () => {
    mount(mixedSpec, true);
    for (const name of ["whole number", "numerator", "denominator"]) {
      expect(screen.getByRole("textbox", { name })).toHaveProperty("disabled", true);
    }
  });
});

describe("fractionEntry — signed extension", () => {
  const signed = () =>
    WidgetSpec.parse({
      type: "fractionEntry",
      prompt: "Compute −3/4 × −1/2 — wait, this one is −5/6 ÷ 1/3.",
      allowNegative: true,
      answerSign: -1,
      answerNum: 5,
      answerDen: 2,
      commonEntries: [
        { sign: 1, num: 5, den: 2, feedback: "Signs differ, so the result is negative." },
        { sign: -1, num: 5, den: 18, feedback: "That multiplies instead of flip-and-multiply." }
      ],
      fallbackFeedback: "Divide the sizes, then set the sign from the sign rule."
    }) as Extract<TWidget, { type: "fractionEntry" }>;
  it("defaults: allowNegative false, answerSign 1, trap sign 1 — legacy specs parse unchanged", () => {
    const legacy = WidgetSpec.parse({
      type: "fractionEntry", prompt: "p", answerNum: 1, answerDen: 2,
      commonEntries: [{ num: 1, den: 3, feedback: "f" }], fallbackFeedback: "fb"
    }) as Extract<TWidget, { type: "fractionEntry" }>;
    expect(legacy.allowNegative).toBe(false);
    expect(legacy.answerSign).toBe(1);
    expect(legacy.commonEntries[0].sign).toBe(1);
  });
  it("grades the signed value correct only with the sign toggled", () => {
    expect(evaluate(signed(), { sign: -1, whole: 0, num: 5, den: 2 }).correct).toBe(true);
    expect(evaluate(signed(), { whole: 0, num: 5, den: 2 }).correct).toBe(false);
  });
  it("the wrong-sign magnitude fires its sign trap", () => {
    expect(evaluate(signed(), { sign: 1, whole: 0, num: 5, den: 2 }).feedback).toBe(
      "Signs differ, so the result is negative."
    );
  });
  it("a signed value-trap matches on equivalent signed fractions", () => {
    expect(evaluate(signed(), { sign: -1, whole: 0, num: 10, den: 36 }).feedback).toBe(
      "That multiplies instead of flip-and-multiply."
    );
  });
  it("a signed wrong value falls to the fallback", () => {
    const r = evaluate(signed(), { sign: -1, whole: 0, num: 7, den: 2 });
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe("Divide the sizes, then set the sign from the sign rule.");
  });
  it("answerText prefixes the minus", () => {
    expect(correctAnswerText(signed())).toBe("\u22125/2");
  });
  it("integrity: negative answer without allowNegative is flagged", () => {
    const bad = WidgetSpec.parse({
      type: "fractionEntry", prompt: "p", answerSign: -1, answerNum: 1, answerDen: 4,
      commonEntries: [{ num: 1, den: 2, feedback: "a" }, { num: 3, den: 4, feedback: "b" }],
      fallbackFeedback: "fb"
    });
    expect(widgetIntegrityErrors(bad).some((e) => e.includes("needs allowNegative"))).toBe(true);
  });
  it("integrity: a signed trap equal to the signed answer is flagged; opposite sign is not", () => {
    const collide = WidgetSpec.parse({
      type: "fractionEntry", prompt: "p", allowNegative: true, answerSign: -1, answerNum: 1, answerDen: 4,
      commonEntries: [{ sign: -1, num: 2, den: 8, feedback: "dup" }, { sign: 1, num: 1, den: 4, feedback: "sign" }],
      fallbackFeedback: "fb"
    });
    const errs = widgetIntegrityErrors(collide);
    expect(errs.some((e) => e.includes("equals the answer value"))).toBe(true);
    expect(errs.filter((e) => e.includes("equals the answer value")).length).toBe(1);
  });
});

describe("fractionEntry live preview (ROLE.active)", () => {
  it("shows a den-partition bar with num cells sky-shaded once the fraction is typed", () => {
    mount(mixedSpec);
    fireEvent.change(screen.getByRole("textbox", { name: "numerator" }), { target: { value: "1" } });
    fireEvent.change(screen.getByRole("textbox", { name: "denominator" }), { target: { value: "2" } });
    const rects = document.querySelectorAll("svg rect");
    expect(rects.length).toBe(2);
    expect(rects[0].getAttribute("fill")).toBe("#2E7CD6");
    expect(rects[1].getAttribute("fill")).toBe("#fff");
  });
  it("mixed entries add one full sky bar per whole unit", () => {
    mount(mixedSpec);
    fireEvent.change(screen.getByRole("textbox", { name: "whole number" }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("textbox", { name: "numerator" }), { target: { value: "1" } });
    fireEvent.change(screen.getByRole("textbox", { name: "denominator" }), { target: { value: "4" } });
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBe(3); // 2 whole bars + 1 partition bar
  });
  it("skips the preview for denominators a bar can't honestly partition", () => {
    mount(mixedSpec);
    fireEvent.change(screen.getByRole("textbox", { name: "numerator" }), { target: { value: "41" } });
    fireEvent.change(screen.getByRole("textbox", { name: "denominator" }), { target: { value: "333" } });
    expect(document.querySelectorAll("svg").length).toBe(0);
  });
});
