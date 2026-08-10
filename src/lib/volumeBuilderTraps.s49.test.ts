import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { VolumeBuilderSpec } from "./schema";

/** s49 — volumeBuilder gained per-volume misconception landings (`commonBuilds`), the same
 * capability tenFrame/baseTenCompose/fractionGrid already carry. Without it, every wrong build
 * collapses into one direction-generic lowFeedback, so a lesson converting an mcq whose two
 * distractors are BOTH under the target (e.g. "base layer only" 10 and "added the edges" 7)
 * would silently lose one of its two authored diagnoses. These tests pin that it doesn't. */

const spec = VolumeBuilderSpec.parse({
  type: "volumeBuilder",
  prompt: "Build a box 5 long, 2 wide, and 3 layers tall.",
  targetVolume: 30,
  lMax: 6,
  wMax: 6,
  hMax: 6,
  commonBuilds: [
    { volume: 10, feedback: "10 is the base layer (5 × 2). Multiply by the 3 layers: 30." },
    { volume: 7, feedback: "7 adds 5 + 2. First multiply the base: 5 × 2 = 10, then × 3 = 30." }
  ],
  successFeedback: "Right — 5 × 2 = 10 per layer, stacked 3 high: 30 cubic units.",
  lowFeedback: "That solid holds fewer than 30 cubes. Add layers or widen the base.",
  highFeedback: "That solid holds more than 30 cubes. Trim a dimension."
});

describe("volumeBuilder per-volume misconception landings", () => {
  it("grades any dimension triple hitting the target as correct", () => {
    expect(evaluate(spec, { l: 5, w: 2, h: 3 }).correct).toBe(true);
    expect(evaluate(spec, { l: 5, w: 3, h: 2 }).correct).toBe(true);
    expect(evaluate(spec, { l: 6, w: 5, h: 1 }).correct).toBe(true);
  });

  it("returns the SPECIFIC diagnosis for a landed misconception volume", () => {
    const baseOnly = evaluate(spec, { l: 5, w: 2, h: 1 }); // 10 — stopped at the base layer
    expect(baseOnly.correct).toBe(false);
    expect(baseOnly.feedback).toBe(spec.commonBuilds[0].feedback);

    const added = evaluate(spec, { l: 7, w: 1, h: 1 }); // 7 — added the edges
    expect(added.correct).toBe(false);
    expect(added.feedback).toBe(spec.commonBuilds[1].feedback);
  });

  it("distinguishes two landings that are BOTH low — the case direction feedback cannot express", () => {
    const a = evaluate(spec, { l: 5, w: 2, h: 1 }).feedback;
    const b = evaluate(spec, { l: 7, w: 1, h: 1 }).feedback;
    expect(a).not.toBe(b);
    expect(a).not.toBe(spec.lowFeedback);
    expect(b).not.toBe(spec.lowFeedback);
  });

  it("matches on the built VOLUME, not on one particular dimension triple", () => {
    // 10 is reachable as 5×2×1 and as 10 is not (lMax 6) — but 2×5×1 is the same volume.
    expect(evaluate(spec, { l: 2, w: 5, h: 1 }).feedback).toBe(spec.commonBuilds[0].feedback);
  });

  it("still falls back to direction feedback for unlisted volumes", () => {
    expect(evaluate(spec, { l: 2, w: 2, h: 2 }).feedback).toBe(spec.lowFeedback); // 8
    expect(evaluate(spec, { l: 6, w: 6, h: 2 }).feedback).toBe(spec.highFeedback); // 72
  });

  it("defaults to an empty landing list so every pre-s49 spec is unchanged", () => {
    const legacy = VolumeBuilderSpec.parse({
      type: "volumeBuilder",
      prompt: "Build a box with volume 24.",
      targetVolume: 24,
      successFeedback: "Right.",
      lowFeedback: "Too few cubes.",
      highFeedback: "Too many cubes."
    });
    expect(legacy.commonBuilds).toEqual([]);
    expect(evaluate(legacy, { l: 2, w: 2, h: 2 }).feedback).toBe(legacy.lowFeedback);
    expect(evaluate(legacy, { l: 2, w: 3, h: 4 }).correct).toBe(true);
  });
});
