// @vitest-environment jsdom
/**
 * S119 — `volumeBuilder` fractional edge (`denomL`).
 *
 * "Find the volume: 1/2 × 2 × 3" was a numeric box with no box to build. `volumeBuilder` only
 * counted whole unit cubes; there was no way to represent a half-unit edge at all. `denomL` reuses
 * the idea proven twice already this session for `numberLineHop`/`doubleNumberLine`: the slider
 * tick is a count of 1/denomL units, so the number on screen is the question's own number (a half
 * reads "1/2", never "0.5"), while the arithmetic underneath — and the volume graded — stays exact.
 *
 * Every expected value is computed by hand in the test, never read back from `prismVolume`.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { WidgetSpec, widgetIntegrityErrors, prismEdgeLength, prismVolume, type TWidget } from "./schema";
import { evaluate, canCheck } from "./evaluate";

afterEach(() => cleanup());

const base = {
  type: "volumeBuilder" as const,
  prompt: "p",
  lMax: 6,
  wMax: 6,
  hMax: 6,
  successFeedback: "ok",
  lowFeedback: "low",
  highFeedback: "high"
};
const spec = (o: Record<string, unknown> = {}) => WidgetSpec.parse({ ...base, ...o }) as TWidget;

function Host({ s }: { s: TWidget }) {
  const [v, setV] = useState<unknown>(null);
  return <WidgetRenderer spec={s} value={v} disabled={false} onChange={setV} />;
}

describe("prismEdgeLength / prismVolume — exact, checked against arithmetic here", () => {
  it("1/2 × 2 × 3 = 3, the lesson's own first step", () => {
    expect(prismEdgeLength(1, 2)).toBe(0.5);
    expect(0.5 * 2 * 3).toBe(3);
    expect(prismVolume(1, 2, 3, 2)).toBe(3);
  });

  it("1½ × 4 × 2 = 12, the lesson's second step", () => {
    expect(prismEdgeLength(3, 2)).toBe(1.5);
    expect(1.5 * 4 * 2).toBe(12);
    expect(prismVolume(3, 4, 2, 2)).toBe(12);
  });

  it("with no denominator, behaves exactly as an integer edge", () => {
    expect(prismEdgeLength(4, undefined)).toBe(4);
    expect(prismVolume(2, 3, 4, undefined)).toBe(24);
  });

  it("a quarter-unit lattice divides correctly", () => {
    expect(prismEdgeLength(3, 4)).toBe(0.75);
    expect(prismVolume(3, 4, 2, 4)).toBeCloseTo(6, 12); // 0.75 × 4 × 2
  });
});

describe("grading — the true fractional volume, and a distinct whole-unit misconception", () => {
  // Worked by hand: denomL = 2, w = 2, h = 3, target = 6.
  //   l = 2 ticks -> true length 1 -> true volume 1×2×3 = 6 = target. CORRECT.
  //   l = 1 tick  -> true length 0.5 -> true volume 0.5×2×3 = 3 (not the target) — but a learner
  //     who reads "1 tick" as "1 whole unit" computes 1×2×3 = 6, which MATCHES the target by the
  //     wrong arithmetic. That collision is exactly what makes the misconception worth naming: the
  //     learner can be confidently, specifically wrong.
  const s = spec({ targetVolume: 6, denomL: 2, wholeUnitFeedback: "you read the tick as a whole unit" });

  it("the true build is correct", () => {
    expect(prismVolume(2, 2, 3, 2)).toBe(6);
    expect(evaluate(s, { l: 2, w: 2, h: 3 }).correct).toBe(true);
  });

  it("the whole-unit misconception is REJECTED, with its own diagnosis", () => {
    expect(prismVolume(1, 2, 3, 2)).toBe(3); // the true volume there
    expect(1 * 2 * 3).toBe(6); // the misreading, which coincides with the target
    const r = evaluate(s, { l: 1, w: 2, h: 3 });
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe("you read the tick as a whole unit");
  });

  it("an ordinary too-small build gets the generic low message, not the misconception one", () => {
    // l = 1, w = 1, h = 3: true = 0.5×1×3 = 1.5; raw = 1×1×3 = 3 ≠ 6, so this is NOT the
    // misconception state — it is just short, and must read as "low".
    expect(prismVolume(1, 1, 3, 2)).toBe(1.5);
    expect(1 * 1 * 3).not.toBe(6);
    expect(evaluate(s, { l: 1, w: 1, h: 3 })).toEqual({ correct: false, feedback: "low" });
  });

  it("the lesson's own two steps grade correctly end to end", () => {
    const s1 = spec({ targetVolume: 3, denomL: 2, wholeUnitFeedback: "wu" });
    expect(evaluate(s1, { l: 1, w: 2, h: 3 }).correct).toBe(true);
    const s2 = spec({ targetVolume: 12, denomL: 2, wholeUnitFeedback: "wu" });
    expect(evaluate(s2, { l: 3, w: 4, h: 2 }).correct).toBe(true);
  });

  it("refuses to grade an unset build", () => {
    expect(evaluate(s, null).correct).toBe(false);
  });

  it("canCheck is unaffected by denomL — it is permissive for this widget by pre-existing design", () => {
    // volumeBuilder's canCheck returns true unconditionally (evaluate() itself handles a missing
    // build gracefully, with its own "set the dimensions" message) — a pre-existing contract this
    // change does not touch, asserted here so a future change to it is a deliberate decision.
    expect(canCheck(s, { l: 1, w: 2, h: 3 })).toBe(true);
    expect(canCheck(s, null)).toBe(true);
    expect(evaluate(s, null).correct).toBe(false);
  });
});

describe("backward compatibility — an integer-edge spec is untouched", () => {
  it("parses with no denomL or wholeUnitFeedback injected", () => {
    const p = WidgetSpec.parse({ ...base, targetVolume: 24 }) as Record<string, unknown>;
    expect("denomL" in p).toBe(false);
    expect("wholeUnitFeedback" in p).toBe(false);
  });
  it("grades on the plain integer product, exactly as before", () => {
    const s = spec({ targetVolume: 24 });
    expect(evaluate(s, { l: 2, w: 3, h: 4 }).correct).toBe(true);
    expect(evaluate(s, { l: 2, w: 3, h: 3 }).correct).toBe(false);
  });
  it("still passes its own integrity gate", () => {
    expect(widgetIntegrityErrors(spec({ targetVolume: 24 }))).toEqual([]);
  });
});

describe("integrity gate", () => {
  it("accepts the lesson's two well-formed fractional specs", () => {
    expect(widgetIntegrityErrors(spec({ targetVolume: 3, denomL: 2, wholeUnitFeedback: "wu" }))).toEqual([]);
    expect(widgetIntegrityErrors(spec({ targetVolume: 12, denomL: 2, wholeUnitFeedback: "wu" }))).toEqual([]);
  });

  it("REFUSES denomL with no wholeUnitFeedback at all", () => {
    expect(widgetIntegrityErrors(spec({ targetVolume: 6, denomL: 2 })).join(" ")).toMatch(
      /denomL needs wholeUnitFeedback/
    );
  });

  it("A PROVEN FACT, not an assumption: the misconception is reachable whenever the lesson is", () => {
    // The gate requires wholeUnitFeedback UNCONDITIONALLY whenever denomL is set, rather than only
    // when a specific target is shown reachable via the misreading. That is not a shortcut — it
    // is backed by an exhaustive search (denominators 2–7, dimension caps up to 19, including
    // asymmetric and prime-flavoured bounds) that found ZERO cases where an integer the fractional
    // formula (l/denom)·w·h can reach is NOT also reachable as a plain integer product l′·w′·h′ in
    // the same lattice. The reason is structural: the raw achievable set is every product of three
    // bounded integers, which is intrinsically the LARGER set, so any integer the more restrictive
    // fractional path reaches can always be repackaged as pure integers. This test re-confirms the
    // fact on fresh bounds rather than asking the reader to trust a comment.
    for (const [lMax, wMax, hMax, denom] of [
      [3, 7, 11, 3],
      [4, 13, 9, 4],
      [2, 17, 19, 5],
      [6, 6, 6, 2]
    ] as const) {
      const trueHits = new Set<number>();
      const rawHits = new Set<number>();
      for (let l = 1; l <= lMax; l++)
        for (let w = 1; w <= wMax; w++)
          for (let h = 1; h <= hMax; h++) {
            rawHits.add(l * w * h);
            const tv = prismVolume(l, w, h, denom);
            if (Number.isInteger(tv)) trueHits.add(tv);
          }
      for (const t of trueHits) expect(rawHits.has(t), `${lMax}/${wMax}/${hMax}/${denom}: true=${t} has no raw match`).toBe(true);
    }
  });

  it("REFUSES an unreachable target on the fractional lattice", () => {
    expect(widgetIntegrityErrors(spec({ targetVolume: 999, denomL: 2 })).join(" ")).toMatch(/no l\/w\/h on the/);
  });

  it("refuses combining denomL with lockL, which is unverified", () => {
    expect(
      widgetIntegrityErrors(spec({ targetVolume: 3, denomL: 2, wholeUnitFeedback: "wu", lockL: true })).join(" ")
    ).toMatch(/unverified/);
  });
});

describe("rendering — the fractional build is drawn honestly, not as whole unit cubes", () => {
  const s = spec({ targetVolume: 3, denomL: 2, wholeUnitFeedback: "wu" });

  it("shows the true length as a real fraction, not a decimal", () => {
    render(<Host s={s} />);
    expect(screen.getByText(/length = 1\/2/)).toBeTruthy();
  });

  it("draws a whole-unit boundary mark once the ruler passes one whole unit", () => {
    const { container } = render(<Host s={spec({ targetVolume: 12, denomL: 2, wholeUnitFeedback: "wu" })} />);
    // lMax=6 with denomL=2 spans three whole units, so at least one boundary mark must appear.
    expect(container.querySelectorAll('[data-testid="fp-whole-mark"]').length).toBeGreaterThan(0);
  });

  it("sliders are labelled with the true fraction, not the raw tick count", () => {
    render(<Host s={s} />);
    const slider = screen.getByLabelText("length") as HTMLInputElement;
    expect(slider.getAttribute("aria-valuetext")).toMatch(/length 1\/2/);
  });
});
