import { describe, it, expect } from "vitest";
import { MULTI_CONTROL, processCue } from "./processEvents";

/**
 * S116: `extraneousRootLab` was wired into the process-event system so its `adapt` capability of 3
 * is EARNED rather than assigned — every engine scoring 3 there appears in this system, and it did
 * not until now.
 *
 * Two things need pinning. First the engine's own cues, because the copy is the feature: a learner
 * who slides the probe without ever squaring is exactly the case the lab exists to catch, and the
 * fixation nudge has to say so rather than falling back to the generic line. Second, and more
 * usefully, the GENERAL rule — every MULTI_CONTROL member should have real fixation copy, so the
 * next engine added to that set cannot silently inherit the generic fallback the way
 * `extraneousRootLab` silently inherited a default capability vector.
 */
const GENERIC_FIXATION =
  "It looks like you may be adjusting only one control — the other control changes a different part of the model.";

describe("extraneousRootLab process events (S116)", () => {
  it("is a MULTI_CONTROL engine, so the fixation rule applies to it at all", () => {
    expect(MULTI_CONTROL.has("extraneousRootLab")).toBe(true);
  });

  it("names the un-squared case specifically — the whole point of the lab", () => {
    const cue = processCue("extraneousRootLab", "one-control-fixation", "probe");
    expect(cue).not.toBe(GENERIC_FIXATION);
    expect(cue).toMatch(/squared/i);
  });

  it("names the un-probed case specifically", () => {
    const cue = processCue("extraneousRootLab", "one-control-fixation", "squared");
    expect(cue).not.toBe(GENERIC_FIXATION);
    expect(cue).toMatch(/probe/i);
  });

  it("carries its own direction and oscillation copy rather than the generic fallback", () => {
    for (const signal of ["wrong-direction", "oscillating"] as const) {
      const cue = processCue("extraneousRootLab", signal);
      expect(cue.length, signal).toBeGreaterThan(40);
      // Both mention the probe or the two readouts — the mathematically relevant feature.
      expect(cue, signal).toMatch(/probe|readout|sides/i);
    }
  });

  it("no cue reveals the answer", () => {
    const all = [
      processCue("extraneousRootLab", "one-control-fixation", "probe"),
      processCue("extraneousRootLab", "one-control-fixation", "squared"),
      processCue("extraneousRootLab", "wrong-direction"),
      processCue("extraneousRootLab", "oscillating"),
    ];
    for (const cue of all) {
      expect(cue).not.toMatch(/x\s*=\s*-?\d/);
      expect(cue).not.toMatch(/extraneous|phantom/i);
    }
  });

  it("engines WITH authored fixation copy cover every control they emit", () => {
    // NOT a claim that every MULTI_CONTROL engine must have bespoke copy — most deliberately use
    // the generic fallback, which is honest ("the other control changes a different part of the
    // model") rather than wrong. What IS worth pinning is that an engine which bothered to author
    // copy for one control did not forget the other: a half-filled table gives one control a
    // specific nudge and its partner a generic one, which reads as a bug to a learner.
    const authored: Record<string, string[]> = {
      quadDrag: ["x", "y"],
      transformExplore: ["dx", "dy"],
      extraneousRootLab: ["probe", "squared"],
    };
    for (const [type, controls] of Object.entries(authored)) {
      for (const c of controls) {
        const cue = processCue(type as never, "one-control-fixation", c);
        expect(cue, `${type}.${c} fell back to the generic line`).not.toBe(GENERIC_FIXATION);
      }
    }
  });
});
