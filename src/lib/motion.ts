"use client";

/**
 * Shared motion language for cinematic manipulatives.
 *
 * The codebase animates with native CSS keyframes gated behind
 * `@media (prefers-reduced-motion: no-preference)` plus Tailwind `motion-reduce:`
 * variants — no animation library, keeping the landing JS budget small. This module
 * centralizes the timing/easing vocabulary and a couple of tiny helpers so every
 * manipulative "settles" and "snaps" with one consistent feel, and so the reduced-motion
 * invariant (base render == final state) is expressed once.
 */
import { useEffect, useRef, useState } from "react";

export const MOTION = {
  /** A value easing to its new resting place (slider fills, position markers). */
  settleMs: 280,
  /** A quick acknowledgement (highlight pulse, tick). */
  snapMs: 140,
  /** Gentle overshoot for things that "arrive" (a point dropping onto a grid). */
  ease: "cubic-bezier(.22,1,.36,1)",
  easeOut: "cubic-bezier(.16,1,.3,1)"
} as const;

/**
 * Build a reduced-motion-gated <style> body for a scoped keyframe animation.
 * Only emits the animation inside the no-preference media query, so reduced-motion
 * users see the element in its final state with no motion at all.
 */
export function gatedKeyframes(className: string, keyframesName: string, body: string): string {
  return `@media (prefers-reduced-motion: no-preference){.${className}{${body}}}@keyframes ${keyframesName}{`;
}

/** SSR/jsdom-safe read of the user's reduced-motion preference (defaults to false).
 * Honors the in-app toggle (root data-reduce-motion attribute) as well as the OS setting. */
export function prefersReducedMotion(): boolean {
  if (typeof document !== "undefined" && document.documentElement.dataset.reduceMotion === "true") return true;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** eased interpolation from → to at progress t∈[0,1] using easeOut. */
export function easeLerp(from: number, to: number, t: number): number {
  const c = Math.min(Math.max(t, 0), 1);
  const eased = 1 - Math.pow(1 - c, 3); // cubic ease-out
  return from + (to - from) * eased;
}

/**
 * Animate a number counting toward `target` for discrete reveals (XP awards, totals).
 * Respects reduced motion (snaps instantly). Safe under SSR/jsdom: if rAF is missing
 * or motion is reduced, it returns the target immediately.
 */
export function useCountUp(target: number, durationMs = MOTION.settleMs): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const start = fromRef.current;
    if (start === target || prefersReducedMotion() || typeof requestAnimationFrame !== "function") {
      setDisplay(target);
      fromRef.current = target;
      return;
    }
    let raf = 0;
    const t0 = Date.now();
    const tick = () => {
      const t = (Date.now() - t0) / durationMs;
      if (t >= 1) {
        setDisplay(target);
        fromRef.current = target;
        return;
      }
      setDisplay(easeLerp(start, target, t));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return display;
}

/**
 * Reduced-motion-gated CSS for smoothly *gliding* an SVG marker whose position
 * (cx/cy or the endpoints of a driven line) is recomputed on every parameter
 * change. Applied to slider-driven foci, handles, and tracing points so cause→
 * effect reads as continuous motion rather than a jump. Under reduced motion no
 * transition is emitted, so the base render already equals the final state
 * (preserves the render-sweep invariant).
 */
export function glideStyle(
  className = "mt-glide",
  props = "cx, cy, x1, y1, x2, y2, transform"
): string {
  return `@media (prefers-reduced-motion: no-preference){.${className}{transition:${props} ${MOTION.settleMs}ms ${MOTION.ease}}}`;
}
