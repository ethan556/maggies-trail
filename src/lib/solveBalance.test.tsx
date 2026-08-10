// @vitest-environment jsdom
// THE SOLVE-BALANCE GATE.
//
// The engine's one idea: the beam is weighed at the TRUE x, so "do the same to both sides" is a
// visible consequence, not a rule. That forces a diagnosis ORDER — an unbalanced state must be
// named as unbalanced even when x also isn't isolated, because the broken equality is the more
// urgent fact. If that ordering, or any of the three wrong states, stops holding, this fails.
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { evaluate, correctAnswerText } from "@/lib/evaluate";
import { SolveBalanceSpec, widgetIntegrityErrors, type TSolveBalance } from "@/lib/schema";
import { SAMPLES } from "@/components/widgetSamples";
import { WidgetRenderer } from "@/components/widgets";

const sample = (SAMPLES as Array<{ type: string }>).find(
  (s) => s.type === "solveBalance"
) as unknown as TSolveBalance;
const spec = SolveBalanceSpec.parse(sample); // 3x + 4 = 19, x = 5
const st = (leftX: number, leftUnits: number, rightUnits: number) => ({ leftX, leftUnits, rightUnits });

describe("solveBalance", () => {
  it("passes its own integrity gate, and the gate rejects a broken tile model", () => {
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    expect(widgetIntegrityErrors({ ...spec, a: 4 })[0]).toMatch(/not divisible/); // (19−4)/4
    expect(widgetIntegrityErrors({ ...spec, a: 1, b: 0 })[0]).toMatch(/already isolated/);
  });

  it("grades the isolated state correct, and reads the answer off the right pan", () => {
    const r = evaluate(spec, st(1, 0, 5));
    expect(r.correct).toBe(true);
    expect(correctAnswerText(spec)).toBe("x = 5");
  });

  it("diagnoses one-sided removal as UNBALANCED — even when x is otherwise isolated", () => {
    // Cleared the left correctly but took nothing off the right: 1·5 + 0 ≠ 19.
    const r = evaluate(spec, st(1, 0, 19));
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe(spec.unbalancedFeedback);
  });

  it("names a fair-but-unfinished position, and a lost-x position, distinctly", () => {
    // 3x = 15 after clearing 4 from each side: balanced, not isolated.
    expect(evaluate(spec, st(3, 0, 15)).feedback).toBe(spec.notIsolatedFeedback);
    // Every x-tile removed while pans happen to level (0 + 4 = 4): the miss path.
    expect(evaluate(spec, st(0, 4, 4)).feedback).toBe(spec.missFeedback);
  });

  it("beam and words agree: a one-sided removal tips the beam AND says so in text", () => {
    cleanup();
    let held: unknown = undefined;
    const { rerender } = render(
      <WidgetRenderer spec={spec} value={held} onChange={(v) => (held = v)} disabled={false} />
    );
    rerender(<WidgetRenderer spec={spec} value={held} onChange={(v) => (held = v)} disabled={false} />);
    // Take one unit off the LEFT only.
    fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the left pan/ })[0]);
    rerender(<WidgetRenderer spec={spec} value={held} onChange={(v) => (held = v)} disabled={false} />);
    expect(screen.getByTestId("sb-tipped").textContent).toMatch(/right side is heavier/i);
    // Undo restores level — the badge disappears, so the signal is state, not residue.
    fireEvent.click(screen.getByTestId("sb-undo"));
    rerender(<WidgetRenderer spec={spec} value={held} onChange={(v) => (held = v)} disabled={false} />);
    expect(screen.queryByTestId("sb-tipped")).toBeNull();
  });

  it("the equation line tracks the tiles — notation and model are one object", () => {
    cleanup();
    render(<WidgetRenderer spec={spec} value={st(3, 0, 15) as unknown} onChange={() => {}} disabled={false} />);
    expect(screen.getByTestId("sb-equation").textContent).toBe("3x = 15");
    cleanup();
    render(<WidgetRenderer spec={spec} value={st(1, 0, 5) as unknown} onChange={() => {}} disabled={false} />);
    expect(screen.getByTestId("sb-equation").textContent).toBe("x = 5");
  });

  it("split is offered only when the share-out is exact", () => {
    cleanup();
    render(<WidgetRenderer spec={spec} value={st(3, 0, 15) as unknown} onChange={() => {}} disabled={false} />);
    expect((screen.getByTestId("sb-split") as HTMLButtonElement).disabled).toBe(false);
    cleanup();
    render(<WidgetRenderer spec={spec} value={st(3, 0, 14) as unknown} onChange={() => {}} disabled={false} />);
    expect((screen.getByTestId("sb-split") as HTMLButtonElement).disabled).toBe(true);
    cleanup();
    // Loose units block the split — the move that teaches subtract-before-divide.
    render(<WidgetRenderer spec={spec} value={st(3, 4, 19) as unknown} onChange={() => {}} disabled={false} />);
    expect((screen.getByTestId("sb-split") as HTMLButtonElement).disabled).toBe(true);
  });
});
