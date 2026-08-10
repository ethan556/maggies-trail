// @vitest-environment jsdom
/**
 * S119 — `numberLineHop` hop-SIZE mode: the GCF shape.
 *
 * ns-03-01 asked for the greatest common factor by handing the learner two written factor lists
 * and taking a number. The causal fact underneath is a stride: the greatest common factor of 8 and
 * 12 is the BIGGEST hop that still lands exactly on both marks. Nothing in the registry could pose
 * that, because every mode graded a landing rather than a stride.
 *
 * The arithmetic here is checked against divisibility computed in the test — never against
 * `hopSizeAnswer` — so a bug in the shared truth function fails here instead of confirming itself.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { WidgetSpec, widgetIntegrityErrors, hopSizeAnswer, type TWidget } from "./schema";
import { evaluate } from "./evaluate";

afterEach(() => cleanup());

const landingBase = {
  type: "numberLineHop" as const,
  prompt: "p",
  min: 0,
  max: 20,
  start: 0,
  hop: 3,
  hops: 5,
  direction: "forward" as const,
  commonLandings: [],
  successFeedback: "ok",
  missFeedback: "miss"
};

const sizeBase = {
  ...landingBase,
  max: 16,
  hopSizeTargets: [8, 12],
  hopSizeMin: 1,
  hopSizeMax: 12,
  notLargestFeedback: "lands on both, but not the biggest",
  missesTargetFeedback: "skips a mark"
};
const spec = (o: Record<string, unknown> = {}) => WidgetSpec.parse({ ...sizeBase, ...o }) as TWidget;

describe("backward compatibility — landing mode is untouched", () => {
  it("a landing spec parses with none of the hop-size keys injected", () => {
    const p = WidgetSpec.parse(landingBase) as Record<string, unknown>;
    expect("hopSizeTargets" in p).toBe(false);
    expect("hopSizeMin" in p).toBe(false);
    expect("notLargestFeedback" in p).toBe(false);
  });

  it("landing grading is unchanged (start + hop x hops = 15)", () => {
    const s = WidgetSpec.parse(landingBase) as TWidget;
    expect(evaluate(s, 15).correct).toBe(true);
    expect(evaluate(s, 12).correct).toBe(false);
  });

  it("landing mode still renders its tap buttons, not a stride slider", () => {
    render(<Host s={WidgetSpec.parse(landingBase) as TWidget} />);
    expect(screen.getByRole("radio", { name: "Land on 15" })).toBeTruthy();
    expect(screen.queryByLabelText("hop size")).toBeNull();
  });
});

function Host({ s }: { s: TWidget }) {
  const [v, setV] = useState<unknown>(null);
  return <WidgetRenderer spec={s} value={v} disabled={false} onChange={setV} />;
}

describe("hopSizeAnswer — checked against divisibility computed here", () => {
  const cases: Array<[number, number[], number, number, number | null]> = [
    [0, [8, 12], 1, 12, 4], // GCF(8,12) = 4
    [0, [15, 25], 1, 12, 5], // GCF(15,25) = 5
    [0, [9, 16], 1, 12, 1], // relatively prime
    [0, [16, 24], 1, 12, 8], // GCF(16,24) = 8
    [0, [12, 18, 24], 1, 12, 6] // three-way GCF
  ];
  it.each(cases)("start %i targets %j in [%i,%i] gives %s", (start, targets, lo, hi, want) => {
    expect(hopSizeAnswer(start, targets, lo, hi)).toBe(want);
    if (want !== null) {
      // Independently: `want` divides every distance, and nothing larger in range does.
      for (const t of targets) expect((t - start) % want).toBe(0);
      for (let h = want + 1; h <= hi; h++) expect(targets.every((t) => (t - start) % h === 0)).toBe(false);
    }
  });

  it("returns null when nothing in range hits every mark", () => {
    expect(hopSizeAnswer(0, [7, 11], 2, 3)).toBe(null);
  });

  it("respects the authored ceiling — a bigger true GCF outside range is not returned", () => {
    // GCF(16, 24) is 8, but a ceiling of 5 must yield the largest stride AT MOST 5 that works: 4.
    expect(hopSizeAnswer(0, [16, 24], 1, 5)).toBe(4);
    expect(16 % 4).toBe(0);
    expect(24 % 4).toBe(0);
  });
});

describe("grading — two distinguishable wrong paths", () => {
  const s = spec();
  it("the greatest common stride is correct", () => {
    expect(evaluate(s, 4).correct).toBe(true);
  });

  it("a stride that hits both marks but is smaller gets the not-largest diagnosis", () => {
    // 2 divides both 8 and 12 — common, but not greatest. This is the error the word
    // GREATEST exists to rule out, and it is a reachable state rather than a message.
    expect(8 % 2).toBe(0);
    expect(12 % 2).toBe(0);
    expect(evaluate(s, 2)).toEqual({ correct: false, feedback: sizeBase.notLargestFeedback });
    expect(evaluate(s, 1)).toEqual({ correct: false, feedback: sizeBase.notLargestFeedback });
  });

  it("a stride that skips a mark gets the missed-target diagnosis", () => {
    // 8 divides 8 but not 12 — the "factor of one of them" error.
    expect(8 % 8).toBe(0);
    expect(12 % 8).not.toBe(0);
    expect(evaluate(s, 8)).toEqual({ correct: false, feedback: sizeBase.missesTargetFeedback });
  });

  it("refuses to grade before a stride is set", () => {
    expect(evaluate(s, null).correct).toBe(false);
  });
});

describe("integrity gate", () => {
  it("accepts a well-formed hop-size lab", () => {
    expect(widgetIntegrityErrors(spec())).toEqual([]);
  });

  it("refuses an unsolvable configuration", () => {
    expect(widgetIntegrityErrors(spec({ hopSizeTargets: [7, 11], hopSizeMin: 2, hopSizeMax: 3 })).join(" ")).toMatch(
      /unsolvable/
    );
  });

  it("refuses a target sitting off the line", () => {
    expect(widgetIntegrityErrors(spec({ hopSizeTargets: [8, 40] })).join(" ")).toMatch(/off the/);
  });

  it("refuses a target equal to the start — every stride would land on it", () => {
    expect(widgetIntegrityErrors(spec({ start: 8, hopSizeTargets: [8, 12] })).join(" ")).toMatch(/equals the start/);
  });

  it("REFUSES a range with no contrast case (every stride hits every mark)", () => {
    // Targets 2 and 4 with strides limited to {1, 2}: both strides hit both marks, so a learner
    // could never see a stride skip anything.
    expect(widgetIntegrityErrors(spec({ hopSizeTargets: [2, 4], hopSizeMin: 1, hopSizeMax: 2 })).join(" ")).toMatch(
      /no contrast case/
    );
  });

  it("demands the feedback for each reachable wrong path", () => {
    const noNotLargest = { ...sizeBase, notLargestFeedback: undefined };
    expect(widgetIntegrityErrors(WidgetSpec.parse(noNotLargest) as TWidget).join(" ")).toMatch(/notLargestFeedback/);
    const noMisses = { ...sizeBase, missesTargetFeedback: undefined };
    expect(widgetIntegrityErrors(WidgetSpec.parse(noMisses) as TWidget).join(" ")).toMatch(/missesTargetFeedback/);
  });
});

describe("rendering — the stride's consequence is visible per mark", () => {
  it("marks each target hit or skipped, live", () => {
    const { container } = render(<Host s={spec()} />);
    // Opens at stride 1, which hits everything.
    expect(container.textContent).toContain("hit");
    expect(container.textContent).toContain("2 of 2");
  });

  it("the slider is a real range input with a mathematical aria-valuetext", () => {
    render(<Host s={spec()} />);
    const slider = screen.getByLabelText("hop size") as HTMLInputElement;
    expect(slider.tagName).toBe("INPUT");
    expect(slider.type).toBe("range");
    expect(slider.getAttribute("aria-valuetext")).toMatch(/stride 1; lands on 2 of 2 marks/);
  });
});
