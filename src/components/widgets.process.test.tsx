// @vitest-environment jsdom
// Engine-level process-event emission. The player test proves the loop for
// numberLinePlace; this file pins each instrumented engine's WIRING and the
// correctness of the relation it reports — including the cases where naive
// "did the number go up" logic would lie:
//  - fractionBar: raising the denominator RAISES a number on screen but moves
//    the fraction's VALUE away from a larger target;
//  - balanceScale: with a negative coefficient, raising x moves the left pan
//    DOWN, so the relation must be computed on pan weight, not on x.
import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import type { ProcessEvent } from "@/lib/processEvents";

afterEach(cleanup);

function mount(raw: unknown) {
  const spec = WidgetSpec.parse(raw) as TWidget;
  const events: ProcessEvent[] = [];
  function Host() {
    const [value, setValue] = useState<unknown>(null);
    return (
      <WidgetRenderer
        spec={spec}
        value={value}
        onChange={setValue}
        disabled={false}
        onEvent={(e) => events.push(e)}
      />
    );
  }
  render(<Host />);
  return events;
}

describe("fractionBar process emission", () => {
  const raw = {
    type: "fractionBar",
    prompt: "Build a fraction equal to 3/4.",
    targetNum: 3,
    targetDen: 4,
    numMin: 1,
    numMax: 8,
    denMin: 1,
    denMax: 8,
    numStart: 1,
    denStart: 2,
    successFeedback: "Same value: the shaded lengths match.",
    lowFeedback: "The shaded amount is still smaller than 3/4.",
    highFeedback: "The shaded amount went past 3/4."
  };

  it("raising the denominator when the value must GROW reports away", () => {
    const events = mount(raw);
    // value 1/2, target 3/4: d 2→3 shrinks the value → away, on control d
    fireEvent.change(screen.getByRole("slider", { name: /denominator/ }), { target: { value: "3" } });
    expect(events).toEqual([{ control: "d", dir: "away", state: { num: 1, den: 3 }, kind: "partition" }]);
  });

  it("raising the numerator toward the target reports toward", () => {
    const events = mount(raw);
    // 1/2 → 3/2? no: n 1→2 gives 2/2 = 1, past 3/4 → "past"; n 1→... use d first
    fireEvent.change(screen.getByRole("slider", { name: /numerator/ }), { target: { value: "2" } });
    expect(events).toEqual([{ control: "n", dir: "past", state: { num: 2, den: 2 } }]);
  });

  it("landing exactly on an equivalent value is silent (success is not noise)", () => {
    const events = mount({ ...raw, numStart: 1, denStart: 4 });
    // 1/4 → 3/4 exactly
    fireEvent.change(screen.getByRole("slider", { name: /numerator/ }), { target: { value: "3" } });
    expect(events).toEqual([]);
  });
});

describe("balanceScale process emission", () => {
  it("computes the relation on pan weight, not on x (negative coefficient)", () => {
    // left = -2x + 10, right = 4 → solution x = 3. From x=0 (left 10),
    // RAISING x lowers the left pan toward 4: x 0→1 is toward even though x moved up.
    const events = mount({
      type: "balanceScale",
      prompt: "Balance the scale.",
      a: -2,
      b: 10,
      c: 4,
      xMin: 0,
      xMax: 6,
      xStart: 0,
      successFeedback: "Level: both pans hold 4.",
      lowFeedback: "The left pan is too light now.",
      highFeedback: "The left pan is still too heavy."
    });
    const x = screen.getByRole("slider", { name: /value of x/ });
    fireEvent.change(x, { target: { value: "1" } }); // left 10→8, toward 4
    fireEvent.change(x, { target: { value: "5" } }); // left 8→0, crosses 4 → past
    fireEvent.change(x, { target: { value: "6" } }); // left 0→-2, farther → away
    expect(events.map((e) => e.dir)).toEqual(["toward", "past", "away"]);
    expect(events.every((e) => e.control === "x")).toBe(true);
  });
});

describe("uninstrumented surfaces stay silent", () => {
  it("no onEvent prop → engines never throw, never emit", () => {
    const spec = WidgetSpec.parse({
      type: "numberLinePlace",
      prompt: "Place 2.",
      min: 0,
      max: 5,
      target: 2,
      successFeedback: "That's 2 on the line.",
      lowFeedback: "Move right.",
      highFeedback: "Move left."
    }) as TWidget;
    const onChange = vi.fn();
    render(<WidgetRenderer spec={spec} value={0} onChange={onChange} disabled={false} />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "4" } });
    expect(onChange).toHaveBeenCalledWith(4); // grading path untouched
  });
});
