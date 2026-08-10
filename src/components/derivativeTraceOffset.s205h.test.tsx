/* @vitest-environment jsdom */
/* derivativeTrace vertical offset (+C) — the invariant, pinned.
 *
 * The control exists to make ONE claim manipulable: sliding a curve up does not tilt it anywhere,
 * so f′ carries no information about vertical position. That is the whole content of the +C in
 * antidifferentiation. These tests assert the claim at both levels it has to hold:
 *
 *   1. MATHEMATICALLY — traceSlopeAt and traceSecondAt take no offset argument at all, so no
 *      offset can reach them. That is structural, not incidental, and the test states it.
 *   2. IN THE RENDERED PICTURE — moving the C slider must change the drawn curve and must NOT
 *      change the f′ path. A picture that moved f′ would teach the opposite of the lesson.
 *
 * And the boundary that keeps every existing lesson safe: offsetMax defaults to 0, the control is
 * not rendered, and the graded value stays the bare x it has always been — C is deliberately local
 * component state, never part of `value`, because a grader that could see C would contradict the
 * claim the control demonstrates.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WidgetRenderer } from "@/components/widgets";
import { traceSlopeAt, traceSecondAt } from "@/lib/evaluate";
import type { TWidget } from "@/lib/schema";

const spec = (offsetMax: number): TWidget => ({
  type: "derivativeTrace", prompt: "Slide C and watch f′ refuse to move.",
  fn: "square", mode: "point", targetX: 2, targetSlope: 0, start: -2,
  showSecond: false, offsetMax,
  successFeedback: "s", lowFeedback: "l", highFeedback: "h",
} as TWidget);

const curvePath = (c: HTMLElement) =>
  (c.querySelectorAll("path")[0] as SVGPathElement | undefined)?.getAttribute("d") ?? "";
const allPaths = (c: HTMLElement) =>
  Array.from(c.querySelectorAll("path")).map((p) => p.getAttribute("d") ?? "");

describe("derivativeTrace +C: the offset moves the curve and never the derivative", () => {
  it("is structurally impossible for an offset to reach f′ or f″", () => {
    // The slope helpers accept (fn, x) only — there is no offset parameter to pass.
    expect(traceSlopeAt.length).toBe(2);
    expect(traceSecondAt.length).toBe(2);
    // And the values are what they always were, independent of any curve shift.
    expect(traceSlopeAt("square", 2)).toBe(4);
    expect(traceSecondAt("square", 2)).toBe(2);
  });

  it("renders no C control when offsetMax is 0 (every existing lesson is untouched)", () => {
    render(<WidgetRenderer spec={spec(0)} value={-2} onChange={vi.fn()} disabled={false} />);
    expect(screen.queryByLabelText("vertical shift C")).toBeNull();
  });

  it("renders the C control when a lesson asks for it, with an aria-valuetext that states the invariant", () => {
    render(<WidgetRenderer spec={spec(4)} value={-2} onChange={vi.fn()} disabled={false} />);
    const slider = screen.getByLabelText("vertical shift C");
    expect(slider.getAttribute("min")).toBe("-4");
    expect(slider.getAttribute("max")).toBe("4");
    expect(slider.getAttribute("aria-valuetext")).toContain("f prime is unchanged");
  });

  it("moving C changes the drawn curve but leaves the f′ path identical", () => {
    const { container } = render(<WidgetRenderer spec={spec(4)} value={2} onChange={vi.fn()} disabled={false} />);
    const before = allPaths(container);
    const curveBefore = curvePath(container);

    fireEvent.change(screen.getByLabelText("vertical shift C"), { target: { value: "3" } });

    const after = allPaths(container);
    expect(curvePath(container), "the curve must move").not.toBe(curveBefore);
    // Every path that is not the curve — the f′ trace among them — must be unchanged.
    const derivativePathsBefore = before.slice(1);
    const derivativePathsAfter = after.slice(1);
    expect(derivativePathsAfter, "f′ must not move when C moves").toEqual(derivativePathsBefore);
  });

  it("C never reaches the graded value: onChange is not called by the offset control", () => {
    const onChange = vi.fn();
    render(<WidgetRenderer spec={spec(4)} value={2} onChange={onChange} disabled={false} />);
    onChange.mockClear();
    fireEvent.change(screen.getByLabelText("vertical shift C"), { target: { value: "2" } });
    expect(onChange, "the grader must never see C").not.toHaveBeenCalled();
  });
});
