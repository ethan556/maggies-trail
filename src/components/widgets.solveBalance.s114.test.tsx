// @vitest-environment jsdom
//
// SOLVEBALANCE ENGINE-EXTENSION REGRESSION SUITE (Conversion Playbook enhancements f, g, h).
//
//   (f) `groups`      — a(x + n) starts as bracketed chips that must be distributed. Both ways of
//                       taking the brackets off are offered and labelled; giving the multiplier to
//                       the x alone is a REACHABLE STATE that tips the beam, not a message.
//   (g) signed tiles  — negative coefficients and negative constants. Integer pan totals ARE
//                       zero-pair cancellation; "multiply both sides by −1" is the move that
//                       turns the beam around.
//   (h) `relation`    — the four inequalities. The beam is weighed at a WITNESS from the solution
//                       set, so a true claim tilts it; negating both pans reverses the tilt and
//                       the comparator must be flipped to keep telling the truth.
//
// The first block is the one that matters most: every pre-existing positive-coefficient equation
// spec must parse and behave EXACTLY as before, because 3 shipped lessons depend on it.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import {
  WidgetSpec,
  widgetIntegrityErrors,
  solveBalanceHolds,
  solveBalanceWitness,
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

const FB = {
  successFeedback: "s",
  unbalancedFeedback: "u",
  notIsolatedFeedback: "n",
  missFeedback: "m",
};

/* ---------------- backward compatibility: the shipped positive form ---------------- */

const classic = {
  type: "solveBalance",
  prompt: "Solve 3x + 4 = 19.",
  a: 3,
  b: 4,
  c: 19,
  ...FB,
} as const;

describe("solveBalance — pre-existing specs are untouched", () => {
  it("parses to the same object it always did (no injected keys)", () => {
    const parsed = WidgetSpec.parse(classic);
    expect(parsed).toEqual(classic);
    expect("relation" in parsed).toBe(false);
    expect("groups" in parsed).toBe(false);
  });

  it("still renders the flat equation and the original control set", () => {
    mount(WidgetSpec.parse(classic));
    expect(screen.getByTestId("sb-equation").textContent).toBe("3x + 4 = 19");
    expect(screen.getByTestId("sb-split")).toBeTruthy();
    expect(screen.getByTestId("sb-undo")).toBeTruthy();
    expect(screen.getByTestId("sb-reset")).toBeTruthy();
    // No signed or relational chrome leaks into a positive equation.
    expect(screen.queryByTestId("sb-left-add")).toBeNull();
    expect(screen.queryByTestId("sb-negate")).toBeNull();
    expect(screen.queryByTestId("sb-flip")).toBeNull();
    expect(screen.queryByTestId("sb-group")).toBeNull();
  });

  it("grades the three original states unchanged", () => {
    const s = WidgetSpec.parse(classic) as TWidget;
    expect(evaluate(s, { leftX: 1, leftUnits: 0, rightUnits: 5 }).correct).toBe(true);
    expect(evaluate(s, { leftX: 3, leftUnits: 0, rightUnits: 19 }).feedback).toBe("u"); // one-sided
    expect(evaluate(s, { leftX: 3, leftUnits: 0, rightUnits: 15 }).feedback).toBe("n"); // fair, unfinished
    expect(evaluate(s, { leftX: 0, leftUnits: 0, rightUnits: 0 }).feedback).toBe("m");
    expect(correctAnswerText(s)).toBe("x = 5");
  });

  it("still accepts a legacy 3-tuple history when undoing", () => {
    const spec = WidgetSpec.parse(classic) as TWidget;
    const { holder } = mount(spec);
    // A value restored from storage written before the extension existed.
    fireEvent.click(screen.getByTestId("sb-reset"));
    expect(holder.v).toBeTruthy();
    expect((holder.v as { rel: string }).rel).toBe("eq");
  });
});

/* ---------------- (f) groups ---------------- */

const grouped = {
  type: "solveBalance",
  prompt: "Solve 3(x + 2) = 18.",
  a: 3,
  b: 6,
  c: 18,
  groups: { count: 3, x: 1, unit: 2 },
  ...FB,
  unexpandedFeedback: "brackets",
  partialDistributeFeedback: "partial",
} as const;

describe("solveBalance (f) — brackets are distributed, not recalled", () => {
  it("starts as chips and shows both labelled ways out", () => {
    mount(WidgetSpec.parse(grouped));
    expect(screen.getAllByTestId("sb-group")).toHaveLength(3);
    expect(screen.getByTestId("sb-equation").textContent).toBe("3(x + 2) = 18");
    expect(screen.getByTestId("sb-dist-all")).toBeTruthy();
    expect(screen.getByTestId("sb-dist-x")).toBeTruthy();
  });

  it("an unexpanded pan still BALANCES — it is unfinished, not wrong", () => {
    const s = WidgetSpec.parse(grouped) as TWidget;
    const r = evaluate(s, { leftX: 0, leftUnits: 0, rightUnits: 18, groups: 3, partial: 0 });
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe("brackets");
  });

  it("distributing to both parts conserves the pan; the beam stays level", () => {
    const { holder } = mount(WidgetSpec.parse(grouped));
    fireEvent.click(screen.getByTestId("sb-dist-all"));
    expect(holder.v).toMatchObject({ leftX: 3, leftUnits: 6, groups: 0, partial: 0 });
    expect(screen.getByTestId("sb-equation").textContent).toBe("3x + 6 = 18");
    expect(screen.queryByTestId("sb-tipped")).toBeNull();
  });

  it("giving the multiplier to the x alone TIPS THE BEAM — the misconception is a picture", () => {
    const { holder } = mount(WidgetSpec.parse(grouped));
    fireEvent.click(screen.getByTestId("sb-dist-x"));
    expect(holder.v).toMatchObject({ leftX: 3, leftUnits: 2, groups: 0, partial: 1 });
    expect(screen.getByTestId("sb-equation").textContent).toBe("3x + 2 = 18");
    expect(screen.getByTestId("sb-tipped")).toBeTruthy();
    const r = evaluate(WidgetSpec.parse(grouped) as TWidget, holder.v);
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe("partial"); // named, not the generic imbalance
  });

  it("completes: distribute, clear six units from both pans, split into 3", () => {
    const s = WidgetSpec.parse(grouped) as TWidget;
    expect(evaluate(s, { leftX: 1, leftUnits: 0, rightUnits: 4, groups: 0 }).correct).toBe(true);
    expect(correctAnswerText(s)).toBe("x = 4");
  });

  it("rejects groups that do not rebuild a and b, and unnamed reachable states", () => {
    expect(widgetIntegrityErrors({ ...grouped, groups: { count: 3, x: 1, unit: 3 } } as TWidget).join(" "))
      .toMatch(/groups give 3×3 = 9 units but b = 6/);
    const { partialDistributeFeedback: _p, ...noPartial } = grouped;
    expect(widgetIntegrityErrors(noPartial as TWidget).join(" ")).toMatch(/partialDistributeFeedback/);
    expect(widgetIntegrityErrors({ ...grouped, a: 1, b: 2, groups: { count: 1, x: 1, unit: 2 } } as TWidget).join(" "))
      .toMatch(/is not a multiplier/);
  });

  it("a NEGATIVE multiplier sends the minus to every tile inside the bracket", () => {
    // −5(x + 3) = −20, the shape tse-03-02 needs: five copies of −(x + 3).
    const negGroup = WidgetSpec.parse({
      type: "solveBalance",
      prompt: "Solve −5(x + 3) = −20.",
      a: -5, b: -15, c: -20,
      groups: { count: -5, x: 1, unit: 3 },
      ...FB,
      unexpandedFeedback: "brackets",
      partialDistributeFeedback: "partial",
    }) as TWidget;
    expect(widgetIntegrityErrors(negGroup)).toEqual([]);
    expect(correctAnswerText(negGroup)).toBe("x = 1");

    const { holder } = mount(negGroup);
    // Five chips, each carrying its own minus sign in the glyph.
    expect(screen.getAllByTestId("sb-group")).toHaveLength(5);
    expect(screen.getByTestId("sb-equation").textContent).toBe("\u22125(x + 3) = \u221220");

    fireEvent.click(screen.getByTestId("sb-dist-all"));
    // The minus reached the 3 as well as the x: −5x − 15, and the pan still balances.
    expect(holder.v).toMatchObject({ leftX: -5, leftUnits: -15, groups: 0 });
    expect(screen.getByTestId("sb-equation").textContent).toBe("\u22125x \u2212 15 = \u221220");
    expect(screen.queryByTestId("sb-tipped")).toBeNull();
  });

  // S208 condition-3 pin — RENDERER HALF UNCHANGED, GRADER HALF NOW CLOSED (S208 Wave 2b).
  //
  // tse-03-02's start position (five unopened copies of −(x + 3) against −20) had no test at all,
  // which meant the pan-weight convention could have been rewritten underneath it in silence. The
  // beam weighs a standing bracket WITH the multiplier's sign: 5 copies × (−1) × (1·1 + 3) = −20
  // against −20, so the beam is LEVEL before anything is distributed — brackets left standing are
  // unfinished, never wrong. That is what the S207 tree rendered, what it renders now, and what
  // the four render assertions below hold to. NONE of them changed.
  //
  // When this pin was written the grader disagreed: evaluate.ts weighed the same bracket WITHOUT
  // the sign, so a learner submitting this untouched position was told "the beam tipped" having
  // moved nothing, and `unexpandedFeedback` was unreachable for the lesson. Wave 2b fixed the sign
  // (evaluate.ts, `gSign`), so the grader assertion added here is the one the pin anticipated —
  // strictly narrower than what it replaced, naming the exact feedback rather than leaving the
  // grader unasserted. docs/MMIP_V1_API.md §7 records the fix.
  it("a bracket still standing leaves the beam LEVEL — the negative multiplier travels with it", () => {
    const negGroup = WidgetSpec.parse({
      type: "solveBalance",
      prompt: "Solve −5(x + 3) = −20.",
      a: -5, b: -15, c: -20,
      groups: { count: -5, x: 1, unit: 3 },
      ...FB,
      unexpandedFeedback: "brackets",
      partialDistributeFeedback: "partial",
    }) as TWidget;
    mount(negGroup);
    // before sb-dist-all: five chips, nothing distributed, and no imbalance badge
    expect(screen.getAllByTestId("sb-group")).toHaveLength(5);
    expect(screen.queryByTestId("sb-tipped")).toBeNull();
    expect(screen.queryByTestId("sb-done")).toBeNull();
    // the beam's own words say the same thing, so this is not a testid technicality
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/beam is level/i);
  });

  it("…and the grader now says the same thing about that position: sealed, not broken", () => {
    const negGroup = WidgetSpec.parse({
      type: "solveBalance",
      prompt: "Solve −5(x + 3) = −20.",
      a: -5, b: -15, c: -20,
      groups: { count: -5, x: 1, unit: 3 },
      ...FB,
      unexpandedFeedback: "brackets",
      partialDistributeFeedback: "partial",
    }) as TWidget;
    // The state the widget mounts in: nothing moved, five copies still sealed.
    const start = { leftX: 0, leftUnits: 0, rightUnits: -20, groups: 5, partial: 0, rel: "eq" as const };
    const r = evaluate(negGroup, start);
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe("brackets"); // unexpandedFeedback — the branch that used to be dead
    expect(r.feedback).not.toBe("u"); // and NOT unbalancedFeedback, which contradicted the picture
    // a genuinely one-sided move from there is still named as one
    expect(evaluate(negGroup, { ...start, rightUnits: -19 }).feedback).toBe("u");
  });

  it("giving a negative multiplier to the x alone leaves four copies of the constant behind", () => {
    const negGroup = WidgetSpec.parse({
      type: "solveBalance",
      prompt: "Solve −5(x + 3) = −20.",
      a: -5, b: -15, c: -20,
      groups: { count: -5, x: 1, unit: 3 },
      ...FB,
      unexpandedFeedback: "brackets",
      partialDistributeFeedback: "partial",
    }) as TWidget;
    const { holder } = mount(negGroup);
    fireEvent.click(screen.getByTestId("sb-dist-x"));
    expect(holder.v).toMatchObject({ leftX: -5, leftUnits: -3, partial: 1 });
    expect(screen.getByTestId("sb-tipped")).toBeTruthy();
    expect(evaluate(negGroup, holder.v).feedback).toBe("partial");
  });

  it("refuses a pan too large to read at 360px", () => {
    // 5x + 20 ≥ 50 is arithmetically fine and visually impossible: 50 tap targets in a row.
    expect(widgetIntegrityErrors({ ...classic, a: 5, b: 20, c: 50 } as TWidget).join(" "))
      .toMatch(/cannot be read at 360px/);
  });
});

/* ---------------- (g) signed tiles ---------------- */

const signed = {
  type: "solveBalance",
  prompt: "Solve −2x + 5 = −7.",
  a: -2,
  b: 5,
  c: -7,
  ...FB,
} as const;

describe("solveBalance (g) — negative tiles and the ×(−1) move", () => {
  it("accepts the signed spec and derives x = 6", () => {
    const s = WidgetSpec.parse(signed) as TWidget;
    expect(widgetIntegrityErrors(s)).toEqual([]);
    expect(correctAnswerText(s)).toBe("x = 6");
  });

  it("renders signed tiles with the sign in the GLYPH, never colour alone", () => {
    mount(WidgetSpec.parse(signed));
    expect(screen.getByTestId("sb-equation").textContent).toBe("\u22122x + 5 = \u22127");
    // Two negative x-tiles on the left, seven negative units on the right.
    expect(screen.getAllByLabelText(/Take one negative x-tile off the left pan/)).toHaveLength(2);
    expect(screen.getAllByLabelText(/Take one negative unit tile off the right pan/)).toHaveLength(7);
    // Signed adders exist so a pan of negatives can be worked on at all.
    expect(screen.getByTestId("sb-right-sub")).toBeTruthy();
    expect(screen.getByTestId("sb-negate")).toBeTruthy();
  });

  it("adding a negative unit to ONE pan only tips the beam", () => {
    const { holder } = mount(WidgetSpec.parse(signed));
    fireEvent.click(screen.getByTestId("sb-right-sub"));
    expect(holder.v).toMatchObject({ rightUnits: -8 });
    expect(screen.getByTestId("sb-tipped")).toBeTruthy();
  });

  it("×(−1) turns −x = −6 into x = 6 and is graded correct", () => {
    const spec = WidgetSpec.parse(signed) as TWidget;
    const { holder } = mount(spec);
    // Arrive at −x = −6 the honest way is a long click-chain; assert the move itself.
    fireEvent.click(screen.getByTestId("sb-reset"));
    const at = { leftX: -1, leftUnits: 0, rightUnits: -6, groups: 0, partial: 0, rel: "eq" as const, hist: [] };
    expect(evaluate(spec, at).correct).toBe(false); // x is not alone: it is −x
    expect(evaluate(spec, { ...at, leftX: 1, rightUnits: 6 }).correct).toBe(true);
    expect(holder.v).toBeTruthy();
  });

  it("splitting divides by the MAGNITUDE and keeps the sign", () => {
    const { holder } = mount(WidgetSpec.parse({ ...signed, b: 0, c: -12 }));
    fireEvent.click(screen.getByTestId("sb-split"));
    expect(holder.v).toMatchObject({ leftX: -1, rightUnits: -6 });
  });

  it("a = 0 and a non-positive x are rejected", () => {
    expect(widgetIntegrityErrors({ ...signed, a: 0 } as TWidget).join(" ")).toMatch(/a = 0/);
    expect(widgetIntegrityErrors({ ...signed, a: 2, b: 5, c: -7 } as TWidget).join(" ")).toMatch(/must come out positive/);
  });
});

/* ---------------- (h) inequalities ---------------- */

const ineq = {
  type: "solveBalance",
  prompt: "Solve −2x + 5 > −3.",
  a: -2,
  b: 5,
  c: -3,
  relation: "gt",
  ...FB,
  notFlippedFeedback: "flip",
} as const;

describe("solveBalance (h) — the sign-flip rule performed", () => {
  it("weighs at a witness that makes the claim true, so the beam tilts on purpose", () => {
    // −2x + 5 > −3 solves to x < 4; boundary 4, witness 3 → left = −1 > −3 = right.
    const w = solveBalanceWitness(-2, 5, -3, "gt");
    expect(w).toBe(3);
    expect(solveBalanceHolds(-2 * w + 5, -3, "gt")).toBe(true);
  });

  it("shows agreement rather than an imbalance warning while the claim is true", () => {
    mount(WidgetSpec.parse(ineq));
    expect(screen.getByTestId("sb-equation").textContent).toBe("\u22122x + 5 > \u22123");
    expect(screen.getByTestId("sb-agrees")).toBeTruthy();
    expect(screen.queryByTestId("sb-tipped")).toBeNull();
    expect(screen.getByTestId("sb-flip")).toBeTruthy();
  });

  it("×(−1) reverses the beam and leaves the comparator contradicting it", () => {
    const spec = WidgetSpec.parse(ineq) as TWidget;
    const { holder } = mount(spec);
    fireEvent.click(screen.getByTestId("sb-negate"));
    expect(holder.v).toMatchObject({ leftX: 2, leftUnits: -5, rightUnits: 3, rel: "gt" });
    expect(screen.getByTestId("sb-contradiction")).toBeTruthy();
    // And the grader names exactly that: flipping would rescue the sentence.
    expect(evaluate(spec, holder.v).feedback).toBe("flip");
  });

  it("flipping the comparator restores the truth", () => {
    const spec = WidgetSpec.parse(ineq) as TWidget;
    const { holder } = mount(spec);
    fireEvent.click(screen.getByTestId("sb-negate"));
    fireEvent.click(screen.getByTestId("sb-flip"));
    expect(holder.v).toMatchObject({ rel: "lt" });
    expect(screen.getByTestId("sb-agrees")).toBeTruthy();
  });

  it("undo restores the comparator as well as the pans", () => {
    const { holder } = mount(WidgetSpec.parse(ineq));
    fireEvent.click(screen.getByTestId("sb-negate"));
    fireEvent.click(screen.getByTestId("sb-flip"));
    fireEvent.click(screen.getByTestId("sb-undo"));
    expect(holder.v).toMatchObject({ rel: "gt" });
    fireEvent.click(screen.getByTestId("sb-undo"));
    expect(holder.v).toMatchObject({ leftX: -2, leftUnits: 5, rightUnits: -3, rel: "gt" });
  });

  it("grades the finished inequality and summarises it with the flipped comparator", () => {
    const spec = WidgetSpec.parse(ineq) as TWidget;
    expect(correctAnswerText(spec)).toBe("x < 4");
    expect(evaluate(spec, { leftX: 1, leftUnits: 0, rightUnits: 4, groups: 0, rel: "lt" }).correct).toBe(true);
    // Isolated but never flipped: the sentence now says the opposite of the beam.
    expect(evaluate(spec, { leftX: 1, leftUnits: 0, rightUnits: 4, groups: 0, rel: "gt" }).feedback).toBe("flip");
  });

  it("an inequality without notFlippedFeedback is rejected as unnamed", () => {
    const { notFlippedFeedback: _n, ...bare } = ineq;
    expect(widgetIntegrityErrors(bare as TWidget).join(" ")).toMatch(/notFlippedFeedback/);
  });

  it("a positive-coefficient inequality never needs the flip", () => {
    const pos = WidgetSpec.parse({
      type: "solveBalance",
      prompt: "Solve 3x + 2 > 14.",
      a: 3, b: 2, c: 14, relation: "gt",
      ...FB,
      notFlippedFeedback: "flip",
    }) as TWidget;
    expect(correctAnswerText(pos)).toBe("x > 4");
    expect(evaluate(pos, { leftX: 1, leftUnits: 0, rightUnits: 4, groups: 0, rel: "gt" }).correct).toBe(true);
  });
});
