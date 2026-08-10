// Process-evidence layer contract (Pillar Two core). Pins:
//  1. moveRelation's geometry: toward/away/past/null, exact-arrival silence.
//  2. classifyProcess: pure, threshold-of-three, priority order, determinism.
//  3. Cue copy: engine-specific tentative language with a generic fallback,
//     and the tone rule — every cue hedges ("It looks like…" / "You've…"),
//     none asserts what the learner thinks.
import { describe, expect, it } from "vitest";
import { classifyProcess, moveRelation, processCue, type ProcessEvent } from "./processEvents";

const ev = (dir: ProcessEvent["dir"]): ProcessEvent => ({ control: "x", dir });

describe("moveRelation", () => {
  it("classifies toward, away, and past against the target", () => {
    expect(moveRelation(2, 4, 6)).toBe("toward");
    expect(moveRelation(4, 2, 6)).toBe("away");
    expect(moveRelation(4, 8, 6)).toBe("past");
    expect(moveRelation(8, 4, 6)).toBe("past"); // crossing back is still crossing
  });

  it("is silent on no-ops and on arrival", () => {
    expect(moveRelation(3, 3, 6)).toBeNull();
    expect(moveRelation(3, 6, 6)).toBeNull(); // landing on target = success, not process noise
  });

  it("handles negative targets and negative motion (the number-line case)", () => {
    expect(moveRelation(-1, -3, -5)).toBe("toward");
    expect(moveRelation(-3, -1, -5)).toBe("away");
    expect(moveRelation(-6, -4, -5)).toBe("past");
  });

  it("works on fractional values (the fraction-bar case)", () => {
    // needs to grow toward 3/4 but the move shrank it: 1/2 → 1/3
    expect(moveRelation(1 / 2, 1 / 3, 3 / 4)).toBe("away");
    // 1/2 → 2/3 closes the gap
    expect(moveRelation(1 / 2, 2 / 3, 3 / 4)).toBe("toward");
  });
});

describe("classifyProcess", () => {
  it("stays silent below threshold", () => {
    expect(classifyProcess([])).toBeNull();
    expect(classifyProcess([ev("away"), ev("away")])).toBeNull();
    expect(classifyProcess([ev("toward"), ev("away"), ev("toward"), ev("past")])).toBeNull();
  });

  it("fires on three of a kind, interleaved or not", () => {
    expect(classifyProcess([ev("away"), ev("away"), ev("away")])).toBe("wrong-direction");
    expect(classifyProcess([ev("away"), ev("toward"), ev("away"), ev("toward"), ev("away")])).toBe(
      "wrong-direction"
    );
    expect(classifyProcess([ev("past"), ev("past"), ev("past")])).toBe("oscillating");
    expect(classifyProcess([ev("invalid"), ev("invalid"), ev("invalid")])).toBe("invalid-moves");
  });

  it("prioritizes wrong-direction over oscillation when both qualify", () => {
    const both = [ev("away"), ev("past"), ev("away"), ev("past"), ev("away"), ev("past")];
    expect(classifyProcess(both)).toBe("wrong-direction");
  });

  it("is deterministic: identical streams, identical signal", () => {
    const stream = [ev("past"), ev("toward"), ev("past"), ev("away"), ev("past")];
    expect(classifyProcess(stream)).toBe(classifyProcess([...stream]));
    expect(classifyProcess(stream)).toBe("oscillating");
  });
});

describe("processCue", () => {
  it("gives engine-specific copy for instrumented engines", () => {
    expect(processCue("fractionBar", "wrong-direction")).toMatch(/size of each part/);
    expect(processCue("numberLinePlace", "wrong-direction")).toMatch(/direction/);
    expect(processCue("balanceScale", "oscillating")).toMatch(/level|totals/);
  });

  it("falls back to generic copy for engines not yet instrumented", () => {
    expect(processCue("lineExplore", "wrong-direction")).toMatch(/heading away from the goal/);
    expect(processCue("mcq", "invalid-moves")).toMatch(/isn't allowed/);
  });

  it("every cue uses tentative or descriptive language, never mind-reading", () => {
    const types = ["numberLinePlace", "fractionBar", "balanceScale", "lineExplore"] as const;
    const signals = ["wrong-direction", "oscillating", "invalid-moves"] as const;
    for (const t of types) {
      for (const g of signals) {
        const cue = processCue(t, g);
        expect(cue).not.toMatch(/you think|you believe|you assumed/i);
        expect(cue).toMatch(/looks like|you've|isn't allowed/i);
      }
    }
  });
});

describe("one-control-fixation", () => {
  const ev = (control: string, dir: ProcessEvent["dir"]): ProcessEvent => ({ control, dir });

  it("latches on 4+ same-control events with ≥2 unproductive, on multi-control engines only", () => {
    const stream = [ev("b", "away"), ev("b", "toward"), ev("b", "away"), ev("b", "toward")];
    expect(classifyProcess(stream, { multiControl: true })).toBe("one-control-fixation");
    expect(classifyProcess(stream)).toBeNull(); // single-control engine: only 2 aways, below threshold
  });

  it("never fires when the other control was touched, or below 4 moves, or mostly productive", () => {
    expect(
      classifyProcess([ev("b", "away"), ev("m", "toward"), ev("b", "away"), ev("b", "away")], { multiControl: true })
    ).toBe("wrong-direction"); // mixed controls → falls through to the generic thresholds
    expect(classifyProcess([ev("b", "away"), ev("b", "away"), ev("b", "past")], { multiControl: true })).toBeNull();
    expect(
      classifyProcess([ev("b", "toward"), ev("b", "toward"), ev("b", "toward"), ev("b", "away")], { multiControl: true })
    ).toBeNull(); // one unproductive move among progress is exploration, not fixation
  });

  it("outranks wrong-direction when both would apply (the more specific diagnosis wins)", () => {
    const stream = [ev("b", "away"), ev("b", "away"), ev("b", "away"), ev("b", "away")];
    expect(classifyProcess(stream, { multiControl: true })).toBe("one-control-fixation");
    expect(classifyProcess(stream)).toBe("wrong-direction");
  });

  it("cue names the specific contrast per control, with a generic fallback", () => {
    expect(processCue("lineExplore", "one-control-fixation", "b")).toContain("steepness hasn't changed");
    expect(processCue("lineExplore", "one-control-fixation", "m")).toContain("crosses the y-axis");
    expect(processCue("quadDrag", "one-control-fixation", "x")).toContain("sliding side to side");
    // an engine with no fixation table, and a known control with no entry, both fall back
    expect(processCue("areaModel", "one-control-fixation", "x")).toContain("only one control");
    expect(processCue("lineExplore", "one-control-fixation")).toContain("only one control");
  });

  it("is deterministic: identical streams, identical signals", () => {
    const stream = [ev("d", "away"), ev("d", "past"), ev("d", "toward"), ev("d", "toward")];
    const run = () => classifyProcess(stream, { multiControl: true });
    expect(run()).toBe(run());
  });
});
