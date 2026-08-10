// Adaptive-policy guards (s41): the ladder is exactly cue → structural →
// remedial-once → silence, and fluent learners bypass all of it.
import { describe, expect, it } from "vitest";
import { decideResponse } from "@/lib/adaptivePolicy";

const base = { fluent: false, remediatedSignals: [] as const };

describe("response ladder", () => {
  it("first latch cues, second locks the misused control for confusion signals", () => {
    expect(decideResponse({ ...base, signal: "slope-for-intercept", occurrence: 1 })).toEqual({ kind: "cue" });
    expect(decideResponse({ ...base, signal: "slope-for-intercept", occurrence: 2 })).toEqual({
      kind: "lock",
      control: "m"
    });
    expect(decideResponse({ ...base, signal: "intercept-for-slope", occurrence: 2 })).toEqual({
      kind: "lock",
      control: "b"
    });
  });

  it("fixation locks the control the stream fixated on", () => {
    expect(decideResponse({ ...base, signal: "one-control-fixation", occurrence: 2, control: "dx" })).toEqual({
      kind: "lock",
      control: "dx"
    });
  });

  it("meaning-level misconceptions get a contrast, thrash gets a scaffold", () => {
    expect(decideResponse({ ...base, signal: "xy-reversal", occurrence: 2 })).toEqual({ kind: "contrast" });
    expect(decideResponse({ ...base, signal: "angle-direction", occurrence: 2 })).toEqual({ kind: "contrast" });
    expect(decideResponse({ ...base, signal: "param-thrash", occurrence: 2 })).toEqual({ kind: "scaffold" });
  });

  it("third latch remediates once; the ladder then terminates", () => {
    expect(decideResponse({ ...base, signal: "param-thrash", occurrence: 3 })).toEqual({ kind: "remedial" });
    expect(
      decideResponse({ signal: "param-thrash", occurrence: 3, fluent: false, remediatedSignals: ["param-thrash"] })
    ).toEqual({ kind: "none" });
    expect(decideResponse({ ...base, signal: "param-thrash", occurrence: 4 })).toEqual({ kind: "none" });
    expect(decideResponse({ ...base, signal: "param-thrash", occurrence: 9 })).toEqual({ kind: "none" });
  });
});

describe("guards", () => {
  it("fluent learners are never slowed — every rung suppressed", () => {
    for (const occurrence of [1, 2, 3]) {
      expect(
        decideResponse({ signal: "slope-for-intercept", occurrence, fluent: true, remediatedSignals: [] })
      ).toEqual({ kind: "none" });
    }
  });

  it("is deterministic", () => {
    const input = { ...base, signal: "xy-reversal" as const, occurrence: 2 };
    expect(decideResponse(input)).toEqual(decideResponse({ ...input }));
  });
});
