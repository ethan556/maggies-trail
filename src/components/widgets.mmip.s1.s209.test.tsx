// @vitest-environment jsdom
//
// THE OWED INDEPENDENT WIDGET PASS (S209, worker S1) — flagged missing by the S208 adversarial
// review. This is a SECOND, independent set of eyes on `SolveBalanceW`'s MMIP wiring: its own spec
// fixtures, its own hand-computed expectations, written without reading
// `widgets.mmip.o1.s208.test.tsx` beyond confirming the filename does not collide with this one.
// The value of an independent pass is that it cannot inherit a blind spot the first pass had.
//
// Every expectation below is derived BY HAND from the spec constants and the documented rules in
// `docs/MMIP_V1_API.md` and `src/lib/mmip/solveBalanceModel.ts` — never by running the widget and
// reading back whatever it printed.

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { correctAnswerText } from "@/lib/evaluate";
import { answerLeakCheck, keyboardParityCheck, reducedMotionCheck } from "@/lib/mmip/mmipHarness";

afterEach(cleanup);

function mount(spec: TWidget, disabled = false, tone?: "neutral" | "success" | "error" | "info", initialValue: unknown = null) {
  const holder: { v: unknown } = { v: initialValue };
  function Host() {
    const [value, setValue] = useState<unknown>(initialValue);
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
  successFeedback: "s1-solved",
  unbalancedFeedback: "s1-unbalanced",
  notIsolatedFeedback: "s1-notisolated",
  missFeedback: "s1-miss",
};

// SPEC_A — my own fixture, chosen independently of O1's: 2x + 5 = 13.
//   x = (c - b) / a = (13 - 5) / 2 = 4.
// No pan legitimately holds "4" anywhere before the tiles are solved (leftX=2, leftUnits=5,
// rightUnits=13; coefficient slot bounds 0..2; unit slot bounds -30..30 since unitBound =
// max(30, |b|, |c|) = max(30, 5, 13) = 30) — which is what makes SPEC_A a clean fixture for the
// answer-leak check below: "4"/"x = 4" cannot appear by accident, only by an actual leak.
const SPEC_A = WidgetSpec.parse({
  type: "solveBalance",
  prompt: "Solve 2x + 5 = 13.",
  a: 2,
  b: 5,
  c: 13,
  ...FB,
}) as TWidget;

const leftUnitTileLabel = "Take one unit tile off the left pan";

describe("SolveBalanceW — independent MMIP proof (S209, worker S1)", () => {
  // -----------------------------------------------------------------------------------------
  // (a) a tile action updates the equation sentence — hand-computed
  // -----------------------------------------------------------------------------------------
  it("(a) tapping a left unit tile updates the equation sentence to the hand-computed text", () => {
    const { holder } = mount(SPEC_A);
    expect(screen.getByTestId("sb-equation").textContent).toBe("2x + 5 = 13");

    const leftPan = screen.getByTestId("sb-left");
    fireEvent.click(within(leftPan).getAllByLabelText(leftUnitTileLabel)[0]);

    // HAND COMPUTATION: one unit tile leaves the left pan — leftUnits 5 -> 4. leftX (2) and
    // rightUnits (13) are untouched (a physical tap is one-sided by construction). The rendered
    // sentence tokenizes the left side as "2x" then "+ 4" (sbTermTokens, solveBalanceModel.ts) and
    // the right side is unaffected: "2x + 4 = 13".
    expect(screen.getByTestId("sb-equation").textContent).toBe("2x + 4 = 13");
    expect(holder.v).toMatchObject({ leftX: 2, leftUnits: 4, rightUnits: 13 });
  });

  // -----------------------------------------------------------------------------------------
  // (b) opening the strip and stepping the coefficient — hand-counted chip counts
  // -----------------------------------------------------------------------------------------
  it("(b) stepping the coefficient down in the equation strip removes exactly one x-tile chip", () => {
    mount(SPEC_A);
    const leftPan = screen.getByTestId("sb-left");
    // HAND COUNT before any edit: leftX = 2 -> 2 x-tile chips; leftUnits = 5 -> 5 unit-tile
    // chips; 2 + 5 = 7 chips total on the left pan, no groups (SPEC_A has no bracket).
    expect(within(leftPan).getAllByRole("button")).toHaveLength(7);
    expect(within(leftPan).getAllByLabelText(/x-tile/)).toHaveLength(2);

    fireEvent.click(screen.getByTestId("sb-sym-toggle"));
    fireEvent.click(screen.getByTestId("sb-sym-lx-down")); // coefficient 2 -> 1: TOWARD zero, legal

    // HAND COMPUTATION: setLeftCoefficient(1) is one step toward zero, so it decomposes to exactly
    // ONE tapLeftX (solveBalanceDecompose's `walk`, leftX 2 -> 1). leftUnits (5) is untouched, so
    // the left pan now shows 1 x-tile chip + 5 unit-tile chips = 6 chips, and "2x" becomes "x"
    // (sbTermTokens renders a bare coefficient of 1 as "x", never "1x").
    expect(within(leftPan).getAllByRole("button")).toHaveLength(6);
    expect(within(leftPan).getAllByLabelText(/x-tile/)).toHaveLength(1);
    expect(screen.getByTestId("sb-equation").textContent).toBe("x + 5 = 13");
  });

  // -----------------------------------------------------------------------------------------
  // (c) an illegal symbolic edit (coefficient away from zero) is refused — state unchanged,
  //     refusal announced. Typed directly into the number field rather than the (correctly
  //     disabled) stepper button, so this proves the MODEL refuses the move, not merely that one
  //     button happens to be disabled.
  // -----------------------------------------------------------------------------------------
  it("(c) growing the coefficient away from zero is refused and leaves state unchanged", () => {
    // Mounted with the initial canonical state made explicit (rather than relying on the
    // mount-time effect) so a REFUSED edit — which never calls onChange — still leaves `holder.v`
    // at a defined, checkable value instead of null.
    const { holder } = mount(SPEC_A, false, undefined, {
      leftX: 2,
      leftUnits: 5,
      rightUnits: 13,
      groups: 0,
      partial: 0,
      rel: "eq",
      hist: [],
    });
    fireEvent.click(screen.getByTestId("sb-sym-toggle"));
    const coefInput = screen.getByTestId("sb-sym-lx") as HTMLInputElement;
    expect(coefInput.value).toBe("2");

    // 2 -> 3 is AWAY from zero — no affordance in this engine can put an x-tile onto a pan
    // (docs/MMIP_V1_API.md §5, consequence 1: "no-x-conjuring"), so this must be refused.
    fireEvent.change(coefInput, { target: { value: "3" } });

    // HAND DERIVATION: a refusal never mutates state (docs/MMIP_V1_API.md §2, invariant 2), so
    // leftX must still be 2, leftUnits still 5, rightUnits still 13, and the equation sentence must
    // still read exactly as it did before the attempted edit.
    expect(holder.v).toMatchObject({ leftX: 2, leftUnits: 5, rightUnits: 13 });
    expect(screen.getByTestId("sb-equation").textContent).toBe("2x + 5 = 13");

    const status = screen.getByTestId("sb-sym-status");
    expect(status.textContent).not.toBe("");
    expect(status.textContent).toMatch(/x-tiles can only be taken off a pan, never put on one/);
  });

  // -----------------------------------------------------------------------------------------
  // (d) undo after a symbolic RUN restores the hand-stated prior position — not an intermediate
  //     keystroke's value.
  // -----------------------------------------------------------------------------------------
  it("(d) undo after a symbolic run restores the position before the whole run, not a mid-run value", () => {
    const { holder } = mount(SPEC_A);
    fireEvent.click(screen.getByTestId("sb-sym-toggle"));
    const constInput = screen.getByTestId("sb-sym-lu") as HTMLInputElement;

    // A RUN: two keystrokes that together retype the left constant from 5 to 16 (legal in either
    // direction — docs/MMIP_V1_API.md §5, consequence 2). Consecutive edits to the same slot
    // coalesce into ONE undo step (solveBalanceModel.ts's `SBRun.coalesceKey`), so the mid-run value
    // "1" must never be a position undo can land on.
    fireEvent.change(constInput, { target: { value: "1" } });
    fireEvent.change(constInput, { target: { value: "16" } });
    expect(holder.v).toMatchObject({ leftX: 2, leftUnits: 16, rightUnits: 13 });

    fireEvent.click(screen.getByTestId("sb-undo"));

    // HAND-STATED PRIOR POSITION: the run only ever touched leftUnits; leftX and rightUnits were
    // never part of it, so undo must land EXACTLY on { leftX: 2, leftUnits: 5, rightUnits: 13 } —
    // the position before the run began, not the position before its last keystroke.
    expect(holder.v).toMatchObject({ leftX: 2, leftUnits: 5, rightUnits: 13 });
    expect(screen.getByTestId("sb-equation").textContent).toBe("2x + 5 = 13");
  });

  // -----------------------------------------------------------------------------------------
  // (e) a keyboard-only route reaches the same final state as a pointer route
  // -----------------------------------------------------------------------------------------
  it("(e) the equation-strip stepper (keyboard route) reaches the same canonical state as tapping tiles (pointer route)", () => {
    // POINTER ROUTE: tap the left unit tile three times directly on the pans.
    const pointer = mount(SPEC_A);
    for (let i = 0; i < 3; i++) {
      const leftPan = screen.getByTestId("sb-left");
      fireEvent.click(within(leftPan).getAllByLabelText(leftUnitTileLabel)[0]);
    }
    // HAND COMPUTATION: three one-tile taps take leftUnits 5 -> 4 -> 3 -> 2.
    expect(pointer.holder.v).toMatchObject({ leftX: 2, leftUnits: 2, rightUnits: 13 });
    const pointerFinal = pointer.holder.v;
    cleanup();

    // KEYBOARD ROUTE: the equation strip's "−1" stepper is a native <button>, three activations —
    // this is the route the strip exists FOR: "the stepper and the field are the same edit by two
    // routes" (docs/MMIP_V1_API.md §6). A native button's Enter/Space activation dispatches the
    // same `click` event fired below — that equivalence is this repo's own established
    // keyboard-testing convention (see `widgets.keyboard.test.tsx`'s `auditNativeControls`), since
    // jsdom does not itself simulate a real browser's default action for a keydown on a button.
    const keyboard = mount(SPEC_A);
    fireEvent.click(screen.getByTestId("sb-sym-toggle"));
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByTestId("sb-sym-lu-down"));
    }
    expect(keyboard.holder.v).toMatchObject({ leftX: 2, leftUnits: 2, rightUnits: 13 });

    // The two routes must agree on the CANONICAL mathematics. `hist` is explicitly not mathematics
    // (docs/MMIP_V1_API.md §2 — "history is not mathematics... the session owns the undo stack")
    // and is allowed to differ in shape between a 3-entry tap history and a single coalesced run,
    // so it is excluded from the comparison on purpose, not by oversight.
    const canonical = (v: unknown) => {
      const s = v as { leftX: number; leftUnits: number; rightUnits: number; groups: number; partial: number; rel: string };
      return { leftX: s.leftX, leftUnits: s.leftUnits, rightUnits: s.rightUnits, groups: s.groups, partial: s.partial, rel: s.rel };
    };
    expect(canonical(pointerFinal)).toEqual(canonical(keyboard.holder.v));
  });

  it("(e-audit) keyboardParityCheck confirms every pan tile and equation-strip control is natively focusable", () => {
    const { container } = mount(SPEC_A);
    fireEvent.click(screen.getByTestId("sb-sym-toggle"));
    const result = keyboardParityCheck(container, {
      pointerSelectors: {
        panTiles: '[data-testid="sb-left"] button, [data-testid="sb-right"] button',
        stripControls: '[data-testid="sb-sym"] button, [data-testid="sb-sym"] input',
        moveControls: '[data-testid="sb-split"], [data-testid="sb-undo"], [data-testid="sb-reset"]',
      },
    });
    expect(result.ok).toBe(true);
    expect(result.failures).toHaveLength(0);
    expect(result.checked).toBeGreaterThan(0);
  });

  // -----------------------------------------------------------------------------------------
  // (f) no answer string before reveal — derived by hand from SPEC_A
  // -----------------------------------------------------------------------------------------
  describe("(f) the answer never appears before reveal", () => {
    it("passes on the un-revealed widget for the hand-derived answer in every format it might leak", () => {
      const { container } = mount(SPEC_A); // no `tone` — not a reveal render
      // HAND DERIVATION: x = (c - b) / a = (13 - 5) / 2 = 4. Leak formats checked: the grader's own
      // convention ("x = 4", confirmed against correctAnswerText below) and the bare word "four".
      const result = answerLeakCheck(container, ["x = 4", "four"]);
      expect(result.ok).toBe(true);
      expect(result.leaked).toHaveLength(0);
      // Not vacuous: correctAnswerText independently agrees with the hand derivation, so "x = 4" is
      // a real string this widget is capable of showing, not one that could never appear at all.
      expect(correctAnswerText(SPEC_A)).toBe("x = 4");
    });

    it("the reveal render (tone='info') DOES show the answer — proving the check above is not vacuous", () => {
      // An unsolved position (leftX: 2, not yet isolated), revealed: the "finished state" ghost
      // names the true x without the learner having to replay every move.
      const { container } = mount(
        SPEC_A,
        false,
        "info",
        { leftX: 2, leftUnits: 5, rightUnits: 13, groups: 0, partial: 0, rel: "eq", hist: [] }
      );
      const result = answerLeakCheck(container, ["4"]);
      expect(result.ok).toBe(false);
      expect(result.leaked).toEqual(["4"]);
    });
  });

  // -----------------------------------------------------------------------------------------
  // (g) reduced motion still narrates the change
  // -----------------------------------------------------------------------------------------
  it("(g) narrates an accepted move through the live region under prefers-reduced-motion", () => {
    reducedMotionCheck({
      render: () => {
        const { container } = mount(SPEC_A);
        // The strip must be OPEN for the status region to narrate an ACCEPTED move — closed, it
        // speaks only refusals (docs/MMIP_V1_API.md §6, "the region... stays EMPTY for accepted
        // moves" while closed, to avoid new chatter in lessons that never asked for the strip).
        fireEvent.click(screen.getByTestId("sb-sym-toggle"));
        const leftPan = screen.getByTestId("sb-left");
        fireEvent.click(within(leftPan).getAllByLabelText(leftUnitTileLabel)[0]);
        return container;
      },
      assertMeaningful: (container) => {
        const status = container.querySelector('[data-testid="sb-sym-status"]');
        expect(status).toBeTruthy();
        // HAND DERIVATION, entirely from source formulas (no execution):
        //   solveBalanceModel.ts `unitOps`/`leg`: leftUnits 5 -> 4, one tile, positive pan, so the
        //     op's own describe is "Took 1 unit tile off the left pan only — it now holds 4."
        //     with kind "subtract" (shrinking, not via an adder) and amount = -1.
        //   equationMorph.ts `buildSinglePhase`: a single "subtract" op maps to motion "leave"
        //     (MOTION_LABEL "Leave"), so the phase's describe is
        //     "Leave. " + the op's own describe string above.
        //   equationMorph.ts `reducedMotion`: one phase, so combinedDescribe is that same string
        //     unchanged; `summarizeStateDelta` sees one op with target "leftUnits", amount -1, so
        //     the appended state-delta sentence is "State delta: leftUnits -1."
        //   SolveBalanceW's `stage()`: under reduced motion, `symNotice.text` is exactly
        //     `shown.phases[0].describe`, and with the strip open the status region renders
        //     `symNotice.text` verbatim.
        expect(status!.textContent).toBe(
          "Leave. Took 1 unit tile off the left pan only — it now holds 4. State delta: leftUnits -1."
        );
      },
    });
  });
});
