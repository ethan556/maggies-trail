import { describe, expect, it } from "vitest";
import { MOTION, easeLerp, prefersReducedMotion, gatedKeyframes, glideStyle } from "./motion";

describe("motion", () => {
  it("exposes coherent timing tokens (snap < settle)", () => {
    expect(MOTION.snapMs).toBeLessThan(MOTION.settleMs);
    expect(MOTION.ease).toContain("cubic-bezier");
  });

  it("easeLerp pins the endpoints and stays in range", () => {
    expect(easeLerp(0, 100, 0)).toBe(0);
    expect(easeLerp(0, 100, 1)).toBe(100);
    const mid = easeLerp(0, 100, 0.5);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(100);
  });

  it("easeLerp clamps out-of-range progress", () => {
    expect(easeLerp(10, 20, -1)).toBe(10);
    expect(easeLerp(10, 20, 5)).toBe(20);
  });

  it("easeLerp decelerates (ease-out: past halfway by t=0.5)", () => {
    expect(easeLerp(0, 1, 0.5)).toBeGreaterThan(0.5);
  });

  it("prefersReducedMotion is SSR-safe (no window ⇒ false)", () => {
    // node env: window is undefined, must not throw and must default to false
    expect(prefersReducedMotion()).toBe(false);
  });

  it("gatedKeyframes wraps the class body in a no-preference query", () => {
    const css = gatedKeyframes("foo", "kf", "animation:kf .3s");
    expect(css).toContain("prefers-reduced-motion: no-preference");
    expect(css).toContain(".foo{animation:kf .3s}");
    expect(css).toContain("@keyframes kf{");
  });

  it("glideStyle gates the transition behind no-preference and uses MOTION timing", () => {
    const css = glideStyle();
    expect(css).toContain("prefers-reduced-motion: no-preference");
    expect(css).toContain(".mt-glide{transition:");
    expect(css).toContain(`${MOTION.settleMs}ms`);
    expect(css).toContain(MOTION.ease);
    // reduced-motion users get NO transition ⇒ base render already equals final state
    expect(css.startsWith("@media")).toBe(true);
  });
});
