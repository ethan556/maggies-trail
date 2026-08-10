import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { AreaModelSpec, VolumeBuilderSpec, widgetIntegrityErrors } from "./schema";

/** s51 — volumeBuilder and areaModel grade the PRODUCT alone. That is correct for "build a solid
 * holding 24 cubes", but wrong for the missing-dimension family: "volume 60, length 5, width 4 —
 * find the height" could be satisfied by 6×5×2, and "a square has area 36 — find its side" by
 * 4×9, in both cases without the learner ever producing the answer the lesson asks for.
 * Locked dimensions and square mode constrain the state space so the target is reachable only at
 * the authored answer, and the integrity gate refuses specs where it is not. */

const missingHeight = VolumeBuilderSpec.parse({
  type: "volumeBuilder",
  prompt: "A box has volume 60, a length of 5, and a width of 4. Set its height.",
  targetVolume: 60,
  lMax: 6, wMax: 6, hMax: 12,
  lStart: 5, wStart: 4, hStart: 1,
  lockL: true, lockW: true,
  commonBuilds: [{ volume: 240, feedback: "240 divides by the length only — the width is a factor too." }],
  successFeedback: "5 × 4 = 20 per layer, and 60 ÷ 20 = 3 layers.",
  lowFeedback: "That solid holds fewer than 60 cubes.",
  highFeedback: "That solid holds more than 60 cubes."
});

describe("volumeBuilder missing-dimension mode", () => {
  it("accepts only the correct free dimension", () => {
    expect(evaluate(missingHeight, { l: 5, w: 4, h: 3 }).correct).toBe(true);
    expect(evaluate(missingHeight, { l: 5, w: 4, h: 2 }).correct).toBe(false);
  });

  it("still returns the specific landing diagnosis", () => {
    const dividedOnce = evaluate(missingHeight, { l: 5, w: 4, h: 12 }); // 240
    expect(dividedOnce.feedback).toBe(missingHeight.commonBuilds[0].feedback);
  });

  it("passes integrity when exactly one setting reaches the target", () => {
    expect(widgetIntegrityErrors(missingHeight)).toEqual([]);
  });

  it("REFUSES a partially-locked spec the learner could still satisfy without finding the answer", () => {
    // Locking only the length leaves 60 = 5 × W × H solvable several ways (4×3, 3×4, 6×2, 2×6…),
    // so the height is never demanded. An UNLOCKED spec is not flagged: that is the ordinary
    // "build any solid holding 60 cubes" task, where many triples are legitimately correct.
    const halfLocked = VolumeBuilderSpec.parse({ ...missingHeight, lockL: true, lockW: false });
    expect(widgetIntegrityErrors(halfLocked).join(" ")).toContain("reachable");
    const unlocked = VolumeBuilderSpec.parse({ ...missingHeight, lockL: false, lockW: false });
    expect(widgetIntegrityErrors(unlocked)).toEqual([]);
  });

  it("REFUSES an unreachable target and a fully locked spec", () => {
    const unreachable = VolumeBuilderSpec.parse({ ...missingHeight, targetVolume: 61 });
    expect(widgetIntegrityErrors(unreachable).join(" ")).toContain("unreachable");
    const frozen = VolumeBuilderSpec.parse({ ...missingHeight, lockH: true });
    expect(widgetIntegrityErrors(frozen).join(" ")).toContain("nothing for the learner to solve");
  });

  it("leaves unlocked specs completely unchanged", () => {
    const plain = VolumeBuilderSpec.parse({
      type: "volumeBuilder", prompt: "Build a solid holding 24 cubes.", targetVolume: 24,
      successFeedback: "y", lowFeedback: "l", highFeedback: "h"
    });
    expect(plain.lockL).toBe(false);
    expect(widgetIntegrityErrors(plain)).toEqual([]);
    expect(evaluate(plain, { l: 2, w: 3, h: 4 }).correct).toBe(true);
    expect(evaluate(plain, { l: 1, w: 4, h: 6 }).correct).toBe(true); // any triple still fine
  });
});

const squareRug = AreaModelSpec.parse({
  type: "areaModel",
  prompt: "A square rug has an area of 36 square feet. Set its side.",
  targetArea: 36, wMax: 12, hMax: 12, wStart: 1, hStart: 1, square: true,
  successFeedback: "6 × 6 = 36.",
  lowFeedback: "That square is smaller than 36 square feet.",
  highFeedback: "That square is larger than 36 square feet."
});

describe("areaModel square mode", () => {
  it("accepts the square side and rejects a non-square with the same area", () => {
    expect(evaluate(squareRug, { w: 6, h: 6 }).correct).toBe(true);
    // the control cannot produce 4x9, but grading must not bless it either if state is forced in
    expect(evaluate(squareRug, { w: 5, h: 5 }).correct).toBe(false);
  });

  it("passes integrity for a perfect-square target in range", () => {
    expect(widgetIntegrityErrors(squareRug)).toEqual([]);
  });

  it("REFUSES a target with no whole-number side, or a side past the range", () => {
    expect(widgetIntegrityErrors(AreaModelSpec.parse({ ...squareRug, targetArea: 30 })).join(" "))
      .toContain("no whole-number side");
    expect(widgetIntegrityErrors(AreaModelSpec.parse({ ...squareRug, targetArea: 196 })).join(" "))
      .toContain("exceeds the slider range");
  });

  it("leaves rectangle specs unchanged", () => {
    const rect = AreaModelSpec.parse({
      type: "areaModel", prompt: "Make a rectangle of area 12.", targetArea: 12, wMax: 6, hMax: 6,
      successFeedback: "y", lowFeedback: "l", highFeedback: "h"
    });
    expect(rect.square).toBe(false);
    expect(widgetIntegrityErrors(rect)).toEqual([]);
    expect(evaluate(rect, { w: 3, h: 4 }).correct).toBe(true);
  });
});
