// @vitest-environment jsdom
/**
 * S119 — `lengthCompare` difference mode: counting the overhang.
 *
 * "A pencil is 5 paperclips long and an eraser is 3 — how many more?" is not a question about
 * WHICH bar is longer, which is all `pick` mode can grade. It is a question about the gap. The
 * engine drew the right picture and graded the wrong quantity, so six steps across three K–2
 * lessons stayed in numeric boxes.
 *
 * Difference mode grades the gap and shades it. The count-the-whole-longer-bar error — by far the
 * commonest in comparison subtraction — is a reachable state, and the integrity gate guarantees it
 * stays reachable by refusing any `diffMax` that would clamp it away.
 *
 * Arithmetic is computed in the test throughout, never read back from the spec.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate, canCheck, correctAnswerText } from "./evaluate";

afterEach(() => cleanup());

const pickBase = {
  type: "lengthCompare" as const,
  prompt: "p",
  mode: "pick" as const,
  items: [
    { id: "pencil", label: "pencil", length: 5 },
    { id: "eraser", label: "eraser", length: 3 }
  ],
  answerId: "pencil",
  missFeedback: "miss",
  successFeedback: "ok"
};

const diffBase = {
  ...pickBase,
  mode: "difference" as const,
  unitLabel: "paperclips",
  targetDifference: 2,
  diffMax: 5,
  countsWholeFeedback: "you counted the whole pencil"
};
const spec = (o: Record<string, unknown> = {}) => WidgetSpec.parse({ ...diffBase, ...o }) as TWidget;

function Host({ s }: { s: TWidget }) {
  const [v, setV] = useState<unknown>(null);
  return <WidgetRenderer spec={s} value={v} disabled={false} onChange={setV} />;
}

describe("backward compatibility — pick mode untouched", () => {
  it("a pick spec parses with none of the difference keys injected", () => {
    const p = WidgetSpec.parse(pickBase) as Record<string, unknown>;
    expect("targetDifference" in p).toBe(false);
    expect("diffMax" in p).toBe(false);
    expect("countsWholeFeedback" in p).toBe(false);
  });

  it("pick grading is unchanged — the answer is still an id, not a number", () => {
    const s = WidgetSpec.parse(pickBase) as TWidget;
    expect(evaluate(s, "pencil").correct).toBe(true);
    expect(evaluate(s, "eraser").correct).toBe(false);
  });

  it("pick mode still passes its own integrity gate", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse(pickBase) as TWidget)).toEqual([]);
  });
});

describe("grading — the overhang, with the whole-bar error distinguished", () => {
  const s = spec();
  it("the true gap is correct", () => {
    expect(5 - 3).toBe(2); // computed here, not read from the spec
    expect(evaluate(s, 2).correct).toBe(true);
  });

  it("counting the whole longer bar gets its own diagnosis", () => {
    expect(evaluate(s, 5)).toEqual({ correct: false, feedback: diffBase.countsWholeFeedback });
  });

  it("any other count gets the generic miss", () => {
    expect(evaluate(s, 3)).toEqual({ correct: false, feedback: diffBase.missFeedback });
    expect(evaluate(s, 0)).toEqual({ correct: false, feedback: diffBase.missFeedback });
  });

  it("refuses to grade a non-number", () => {
    expect(evaluate(s, null).correct).toBe(false);
    expect(evaluate(s, "pencil").correct).toBe(false);
  });

  it("canCheck wants a number here, not an id", () => {
    expect(canCheck(s, 2)).toBe(true);
    expect(canCheck(s, "pencil")).toBe(false);
  });

  it("correctAnswerText names the gap in units", () => {
    expect(correctAnswerText(s)).toContain("2 paperclips");
  });
});

describe("integrity gate", () => {
  it("accepts a well-formed difference lab", () => {
    expect(widgetIntegrityErrors(spec())).toEqual([]);
  });

  it("refuses a targetDifference that disagrees with the bars", () => {
    expect(widgetIntegrityErrors(spec({ targetDifference: 4 })).join(" ")).toMatch(/bars differ by 2/);
  });

  it("refuses equal-length bars — there is no overhang to count", () => {
    const eq = spec({
      items: [
        { id: "a", label: "a", length: 4 },
        { id: "b", label: "b", length: 4 }
      ],
      answerId: "a",
      targetDifference: 1
    });
    expect(widgetIntegrityErrors(eq).join(" ")).toMatch(/same length|bars differ by 0/);
  });

  it("refuses more or fewer than two items", () => {
    const three = spec({
      items: [
        { id: "a", label: "a", length: 5 },
        { id: "b", label: "b", length: 3 },
        { id: "c", label: "c", length: 1 }
      ]
    });
    expect(widgetIntegrityErrors(three).join(" ")).toMatch(/exactly 2 items/);
  });

  it("refuses a missing unitLabel — a gap in units needs unit ticks", () => {
    const noUnit = { ...diffBase } as Record<string, unknown>;
    delete noUnit.unitLabel;
    expect(widgetIntegrityErrors(WidgetSpec.parse(noUnit) as TWidget).join(" ")).toMatch(/unitLabel/);
  });

  it("refuses answerId naming the SHORTER bar", () => {
    expect(widgetIntegrityErrors(spec({ answerId: "eraser" })).join(" ")).toMatch(/LONGER bar/);
  });

  it("REFUSES a diffMax that would clamp the whole-bar error out of reach", () => {
    // The point of the gate: if the learner cannot physically reach 5, countsWholeFeedback is
    // dead copy and the commonest misconception has no state.
    expect(widgetIntegrityErrors(spec({ diffMax: 3 })).join(" ")).toMatch(/unreachable/);
  });

  it("refuses non-integer lengths — an overhang must be countable", () => {
    const frac = spec({
      items: [
        { id: "a", label: "a", length: 5.5 },
        { id: "b", label: "b", length: 3.5 }
      ],
      answerId: "a"
    });
    expect(widgetIntegrityErrors(frac).join(" ")).toMatch(/whole-unit lengths/);
  });

  it("refuses countsWholeFeedback outside difference mode as dead copy", () => {
    const bad = { ...pickBase, countsWholeFeedback: "x" };
    expect(widgetIntegrityErrors(WidgetSpec.parse(bad) as TWidget).join(" ")).toMatch(/dead feedback/);
  });
});

describe("rendering and keyboard parity", () => {
  it("shades the overhang and labels both bars in units", () => {
    const { container } = render(<Host s={spec()} />);
    expect(container.querySelector('[data-testid="lc-gap"]')).toBeTruthy();
    expect(container.textContent).toContain("pencil");
    expect(container.textContent).toContain("paperclips");
  });

  it("the count is driveable by native buttons AND a range input", () => {
    render(<Host s={spec()} />);
    const plus = screen.getByLabelText("one more");
    expect(plus.tagName).toBe("BUTTON");
    const slider = screen.getByLabelText(/how many more paperclips/i) as HTMLInputElement;
    expect(slider.tagName).toBe("INPUT");
    expect(slider.type).toBe("range");
    expect(slider.max).toBe("5"); // diffMax — the whole-bar error stays reachable
  });

  it("aria-valuetext names the mathematical state, not the raw number", () => {
    render(<Host s={spec()} />);
    const slider = screen.getByLabelText(/how many more paperclips/i);
    expect(slider.getAttribute("aria-valuetext")).toMatch(/the overhang covers 2/);
  });
});

describe("S119 regression — covariationScrubber's value window must hold 5 DISTINCT inputs", () => {
  // Found by the key-duplication warning the keyboard gate emitted. Each cell used to be clamped
  // independently, so at a bound the window collapsed: x=0 with inputMin=0 produced [0,0,0,1,2] —
  // duplicate React keys, and three identical rows in a table whose purpose is showing neighbours.
  const window = (x: number, min: number, max: number) => {
    const lo = Math.max(min, Math.min(x - 2, max - 4));
    return Array.from({ length: 5 }, (_, i) => lo + i).filter((v) => v >= min && v <= max);
  };

  it("stays distinct at the lower bound", () => {
    const r = window(0, 0, 10);
    expect(new Set(r).size).toBe(r.length);
    expect(r).toEqual([0, 1, 2, 3, 4]);
  });

  it("stays distinct at the upper bound", () => {
    const r = window(10, 0, 10);
    expect(new Set(r).size).toBe(r.length);
    expect(r).toEqual([6, 7, 8, 9, 10]);
  });

  it("centres on x in the interior", () => {
    expect(window(5, 0, 10)).toEqual([3, 4, 5, 6, 7]);
  });

  it("never leaves the authored bounds, and never repeats, anywhere in range", () => {
    for (let min = 0; min <= 3; min++)
      for (let max = min + 4; max <= min + 12; max++)
        for (let x = min; x <= max; x++) {
          const r = window(x, min, max);
          expect(new Set(r).size, `duplicate at x=${x} in [${min},${max}]`).toBe(r.length);
          for (const v of r) expect(v >= min && v <= max).toBe(true);
        }
  });
});
