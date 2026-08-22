// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

/**
 * S237 — NUMBER LINE MUST BE A RULER, NOT A ROW OF ANSWER SLOTS.
 *
 * THE DEFECT (reported from the running app). numberLineHop ticked only the positions a learner
 * could tap. "9 + 9: start at 9 and make one hop of 9" drew a mark at 9, then marks at 17, 18 and
 * 19, and nothing in between — so the hop could not be counted, which is the whole reason a
 * number line is the model for this lesson. Worse, the only marks present were the candidate
 * answers, so the line showed the shape of the answer set rather than the structure of number.
 *
 * WHAT IS PINNED. A unit scale spans min..max independently of the choices, its landmarks fall on
 * a 1-2-5-10 ladder, and no position carries two overlapping labels. The scale is decorative
 * (aria-hidden) — the interactive contract and the accessible description are unchanged, and
 * grading never saw the ruler at all.
 */

const spec = (extra: Record<string, unknown>) =>
  WidgetSpec.parse({
    type: "numberLineHop", prompt: "p", direction: "forward", commonLandings: [],
    successFeedback: "y", missFeedback: "z", ...extra,
  }) as TWidget;

const labelsOf = (s: TWidget) => {
  const { container } = render(<WidgetRenderer spec={s} value={null} onChange={() => {}} disabled={false} />);
  const svg = container.querySelector("svg")!;
  const texts = Array.from(svg.querySelectorAll("text")).map((t) => (t.textContent ?? "").trim());
  const ticks = svg.querySelectorAll("line").length;
  cleanup();
  return { texts, ticks };
};

// numberLinePlainLabel (widgets.tsx) prints a typeset minus, "−" (U+2212), not the ASCII hyphen
// "-" — the same substitution widgets.tsx's own bin-label parser and figureTextAdversarialAudit /
// s322Figures undo before calling Number() on rendered text. Plain `Number("−5")` is NaN, so
// `texts.map(Number)` silently drops every negative tick instead of finding it: not a widget
// defect, a test-side parse gap this closes the same way the rest of the suite already does.
const toNum = (text: string): number => Number(text.replace(/−/g, "-"));

describe("S237 number-line scale", () => {
  it("marks the whole line, not just the tappable positions", () => {
    // The reported case. Before the fix this rendered 4 labels: 9, 17, 18, 19.
    const { texts, ticks } = labelsOf(spec({ min: 0, max: 20, start: 9, hop: 9, hops: 1 }));
    const nums = texts.map(toNum).filter((n) => Number.isFinite(n));
    expect(nums).toContain(0);
    expect(nums).toContain(20);
    // Something between the start and the far choices must be marked — that is the countable gap.
    expect(nums.filter((n) => n > 9 && n < 18).length).toBeGreaterThan(0);
    expect(ticks).toBeGreaterThan(12); // axis + a real scale, not four answer slots
  });

  it("labels fall on landmarks a learner counts in, at every scale", () => {
    for (const [min, max] of [[0, 10], [0, 20], [0, 100], [-5, 5], [0, 1000]] as const) {
      const { texts } = labelsOf(spec({ min, max, start: min, hop: Math.max(1, (max - min) / 10), hops: 1 }));
      const nums = texts.map(toNum).filter((n) => Number.isFinite(n));
      expect(nums).toContain(min);
      expect(nums).toContain(max);
      // Dividing the span by a fixed N produced strides like 3, labelling 9/18/27 on a 0-100 line.
      // Every label must sit on a 1-2-5-10-style landmark: divisible by the smallest gap present.
      const sorted = [...new Set(nums)].sort((a, b) => a - b);
      const gap = Math.min(...sorted.slice(1).map((n, i) => n - sorted[i]));
      const offLadder = sorted.filter((n) => n !== min && n !== max && n % gap !== 0);
      expect(offLadder).toEqual([]);
    }
  });

  it("never stacks two labels on one position", () => {
    // The ruler and a choice tick both wanted to label 0, at identical coordinates.
    for (const [min, max, start, hop] of [[0, 20, 9, 9], [0, 10, 2, 2], [0, 100, 0, 10]] as const) {
      const { texts } = labelsOf(spec({ min, max, start, hop, hops: 1 }));
      const seen = texts.filter((t) => t !== "");
      expect(new Set(seen).size).toBe(seen.length);
    }
  });

  it("the scale is decorative: it adds no accessible text", () => {
    const s = spec({ min: 0, max: 20, start: 9, hop: 9, hops: 1 });
    const { container } = render(<WidgetRenderer spec={s} value={null} onChange={() => {}} disabled={false} />);
    for (const g of Array.from(container.querySelectorAll("g[aria-hidden='true']"))) {
      expect(g.getAttribute("aria-hidden")).toBe("true");
    }
    cleanup();
  });
});
