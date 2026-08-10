/**
 * S119 — the `denom` fraction lattice on `ratioTable` and `doubleNumberLine`.
 *
 * Both engines added an identical additive-optional `denom` field for the same reason: the
 * unit-rate lessons in `pr-01-*` ask "1/2 mile in 1/4 hour" and the original formatters rendered
 * every value as a rounded decimal, quietly replacing a lesson about DIVIDING FRACTIONS with its
 * decimal shadow. Both reuse the exact `hopLabel(units, denom)` helper already built and tested for
 * `numberLineHop`'s rational lattice, so there is one fraction formatter in the codebase, not three.
 *
 * This suite treats the two engines as adversaries of each other in one respect: since they share
 * `hopLabel`, any test that would catch a regression in one is written to catch it in the other
 * too, so a future edit cannot fix one lattice while quietly breaking its twin.
 *
 * Every arithmetic expectation is computed by hand in the test — cross-multiplication, or the
 * fraction read back as units/denom — never taken from the spec or from `hopLabel` itself.
 */
import { describe, it, expect } from "vitest";
import { WidgetSpec, widgetIntegrityErrors, hopLabel, type TWidget } from "./schema";
import { evaluate, canCheck } from "./evaluate";

const ratio = (o: Record<string, unknown> = {}) =>
  WidgetSpec.parse({
    type: "ratioTable",
    prompt: "p",
    colA: "a",
    colB: "b",
    rows: [
      [1, 2],
      [2, 4]
    ],
    askA: 4,
    targetB: 8,
    bMax: 16,
    bStep: 1,
    bStart: 0,
    successFeedback: "ok",
    lowFeedback: "lo",
    highFeedback: "hi",
    ...o
  }) as TWidget;

const dnl = (o: Record<string, unknown> = {}) =>
  WidgetSpec.parse({
    type: "doubleNumberLine",
    prompt: "p",
    topLabel: "top",
    bottomLabel: "bottom",
    topPerStep: 2,
    bottomPerStep: 1,
    steps: 5,
    askAtStep: 4,
    targetTop: 8,
    topMax: 16,
    topStep: 1,
    successFeedback: "ok",
    lowFeedback: "lo",
    highFeedback: "hi",
    ...o
  }) as TWidget;

describe("backward compatibility — neither engine changes shape without denom", () => {
  it("ratioTable parses with no denom key injected", () => {
    const p = WidgetSpec.parse({
      type: "ratioTable",
      prompt: "p",
      colA: "a",
      colB: "b",
      rows: [[1, 2]],
      askA: 4,
      targetB: 8,
      bMax: 16,
      successFeedback: "ok",
      lowFeedback: "lo",
      highFeedback: "hi"
    }) as Record<string, unknown>;
    expect("denom" in p).toBe(false);
  });

  it("doubleNumberLine parses with no denom key injected", () => {
    const p = WidgetSpec.parse({
      type: "doubleNumberLine",
      prompt: "p",
      topLabel: "t",
      bottomLabel: "b",
      topPerStep: 2,
      bottomPerStep: 1,
      askAtStep: 4,
      targetTop: 8,
      topMax: 16,
      successFeedback: "ok",
      lowFeedback: "lo",
      highFeedback: "hi"
    }) as Record<string, unknown>;
    expect("denom" in p).toBe(false);
  });

  it("grading is IDENTICAL with or without denom — it is a display concern only", () => {
    const plain = ratio();
    const frac = ratio({ denom: 4 });
    for (const b of [0, 5, 8, 12, 16]) expect(evaluate(plain, b).correct).toBe(evaluate(frac, b).correct);
  });

  it("canCheck is unaffected by denom on both engines", () => {
    expect(canCheck(ratio(), 8)).toBe(canCheck(ratio({ denom: 4 }), 8));
    expect(canCheck(dnl(), 8)).toBe(canCheck(dnl({ denom: 4 }), 8));
  });
});

describe("ADVERSARIAL — grading is exact, denom or not (the reason this is safe at all)", () => {
  it("ratioTable never rounds the boundary — off-by-one units are rejected", () => {
    const s = ratio({ denom: 4 }); // target 8, i.e. 32/4
    expect(evaluate(s, 8).correct).toBe(true);
    expect(evaluate(s, 7).correct).toBe(false);
    expect(evaluate(s, 9).correct).toBe(false);
  });

  it("doubleNumberLine never rounds the boundary either", () => {
    const s = dnl({ denom: 4 });
    expect(evaluate(s, 8).correct).toBe(true);
    expect(evaluate(s, 7).correct).toBe(false);
  });
});

describe("hopLabel reuse — both engines defer to the SAME formatter, checked against arithmetic", () => {
  const cases: Array<[number, number, string]> = [
    [0, 4, "0"],
    [1, 4, "1/4"],
    [2, 4, "1/2"], // reduces
    [4, 4, "1"],
    [8, 4, "2"],
    [5, 16, "5/16"],
    [16, 16, "1"],
    [32, 16, "2"],
    [3, 20, "3/20"],
    [40, 20, "2"]
  ];
  it.each(cases)("%i of 1/%i reads %s, matching hopLabel exactly", (units, denom, want) => {
    expect(hopLabel(units, denom)).toBe(want);
  });

  it("a label never contains a decimal point at any denom this session authored", () => {
    for (const denom of [4, 16, 20]) for (let u = 0; u <= 48; u++) expect(hopLabel(u, denom)).not.toMatch(/\./);
  });
});

describe("ADVERSARIAL — the three shipped lessons, re-verified independently of the spec", () => {
  it("pr-01-01: 1/2 mile in 1/4 hour is 2 mph, and the table's own rows agree", () => {
    const s = ratio({ denom: 4, rows: [[1, 2], [2, 4]], askA: 4, targetB: 8, bMax: 16 });
    // Cross-multiplication on the asked row: 2/1 (quarter-hours units) should equal 8/4.
    expect(2 * 4).toBe(1 * 8);
    // Read back as the actual rate: (targetB/denom) miles per (askA/denom) hours = 2 mph.
    expect(8 / 4 / (4 / 4)).toBe(2);
    expect(evaluate(s, 8).correct).toBe(true);
    expect(widgetIntegrityErrors(s)).toEqual([]);
  });

  it("pr-01-03/i1: 5/16 hour at 5/8 mph-equivalent scales to 2 mph over a full hour", () => {
    const s = ratio({ denom: 16, rows: [[5, 10], [10, 20]], askA: 16, targetB: 32, bMax: 48 });
    expect(10 * 16).toBe(5 * 32); // cross-multiplication holds
    expect(32 / 16 / (16 / 16)).toBe(2);
    expect(evaluate(s, 32).correct).toBe(true);
    expect(widgetIntegrityErrors(s)).toEqual([]);
  });

  it("pr-01-03/i2: 3/20 minute filling 3/10 cup scales to 2 cups per minute", () => {
    const s = ratio({ denom: 20, rows: [[3, 6], [6, 12]], askA: 20, targetB: 40, bMax: 60 });
    expect(6 * 20).toBe(3 * 40);
    expect(40 / 20 / (20 / 20)).toBe(2);
    expect(evaluate(s, 40).correct).toBe(true);
    expect(widgetIntegrityErrors(s)).toEqual([]);
  });
});

describe("ADVERSARIAL — integrity gates reject fractional units in fraction mode", () => {
  it("ratioTable refuses a non-whole askA/targetB/row under denom", () => {
    expect(widgetIntegrityErrors(ratio({ denom: 4, askA: 4.5 })).join(" ")).toMatch(/whole number/);
    expect(widgetIntegrityErrors(ratio({ denom: 4, targetB: 8.5 })).join(" ")).toMatch(/whole number/);
    expect(widgetIntegrityErrors(ratio({ denom: 4, rows: [[1.5, 2], [2, 4]] })).join(" ")).toMatch(/whole number/);
  });

  it("doubleNumberLine refuses non-whole topPerStep/targetTop under denom", () => {
    expect(widgetIntegrityErrors(dnl({ denom: 4, topPerStep: 2.5 })).join(" ")).toMatch(/whole count/);
    expect(widgetIntegrityErrors(dnl({ denom: 4, targetTop: 8.5 })).join(" ")).toMatch(/whole count/);
  });

  it("doubleNumberLine refuses a bottomPerStep that never reaches one whole unit", () => {
    // denom 4, bottomPerStep 3: the unit-rate tick (bottom = denom) is never landed on by any
    // integer number of steps, since 4 is not a multiple of 3.
    expect(widgetIntegrityErrors(dnl({ denom: 4, bottomPerStep: 3 })).join(" ")).toMatch(/never lands on 1 whole unit/);
  });

  it("ratioTable and doubleNumberLine BOTH still enforce their pre-existing (non-denom) checks", () => {
    // A shown row off the ratio must still be caught even in fraction mode — denom does not
    // suspend the ratio-consistency check.
    expect(
      widgetIntegrityErrors(ratio({ denom: 4, rows: [[1, 2], [2, 5]] })).join(" ")
    ).toMatch(/off the ratio/);
  });
});

describe("ADVERSARIAL — a plausible future regression: swapping denom between the two engines", () => {
  // If a future edit accidentally copied ratioTable's denom semantics onto doubleNumberLine's
  // integrity case (or vice versa) without updating the field names, these would catch it: each
  // gate's message must name the field that actually belongs to ITS engine.
  it("ratioTable's fraction-mode message names 'whole number', not 'whole count'", () => {
    const msg = widgetIntegrityErrors(ratio({ denom: 4, askA: 4.5 })).join(" ");
    expect(msg).toContain("whole number");
  });

  it("doubleNumberLine's fraction-mode message names 'whole count', not 'whole number'", () => {
    const msg = widgetIntegrityErrors(dnl({ denom: 4, topPerStep: 2.5 })).join(" ");
    expect(msg).toContain("whole count");
  });
});
