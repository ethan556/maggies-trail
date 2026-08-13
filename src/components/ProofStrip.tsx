"use client";

import { useEffect, useRef, useState } from "react";
import { useCountUp } from "@/lib/motion";

/**
 * ProofStrip — WS-H Phase 3, the "What you can verify" rewrite: one line, not a 3-card grid,
 * with the numbers counting up once the strip scrolls into view.
 *
 * Reuses `useCountUp` (`@/lib/motion`) rather than adding a new animation dependency or timing
 * loop — that hook already exists for exactly this ("discrete reveals... totals", currently used
 * for `LessonPlayer`'s XP chip) and already carries the reduced-motion contract (snaps instantly
 * under `prefers-reduced-motion`, so no new accessibility work is needed here).
 *
 * `courseCount`, `lessonCount` and `gradeSpan` are passed in from the server component
 * (`getCatalog()`-derived, computed once in `page.tsx`) — this component never invents or
 * hardcodes a number; it only decides WHEN to animate toward the numbers it's given.
 *
 * The reveal starts at 0 (identically on the server and on first client render — a plain `false`
 * literal, so there is no hydration mismatch) and counts up exactly once, either the first time an
 * `IntersectionObserver` reports the strip on screen, or immediately if that API isn't available —
 * so the strip is never permanently stuck at zero. The real, settled numbers are also already
 * stated in the hero's plain (non-animated, always-correct) stat row above, so this strip's brief
 * pre-reveal frame is a decorative flourish layered on top of accurate content, not a source of it.
 */
export function ProofStrip({
  courseCount,
  lessonCount,
  gradeSpan
}: {
  courseCount: number;
  lessonCount: number;
  gradeSpan: string;
}) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== "function") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect(); // a one-time reveal, not a replay on every scroll past it
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shownCourses = Math.round(useCountUp(revealed ? courseCount : 0, 1000));
  const shownLessons = Math.round(useCountUp(revealed ? lessonCount : 0, 1000));

  return (
    <section className="mt-20">
      <p
        ref={ref}
        className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 rounded-card bg-surface-2 px-5 py-5 text-center text-base font-bold text-content-2"
      >
        <span aria-label={`${shownCourses} courses`}>
          <span className="font-extrabold tabular-nums text-content">{shownCourses.toLocaleString()}</span> courses
        </span>
        <Dot />
        <span aria-label={`${shownLessons} lessons`}>
          <span className="font-extrabold tabular-nums text-content">{shownLessons.toLocaleString()}</span> lessons
        </span>
        <Dot />
        <span className="font-extrabold text-content">{gradeSpan}</span>
        <Dot />
        <span className="font-extrabold text-content">state-aware feedback</span>
      </p>
    </section>
  );
}

function Dot() {
  return (
    <span aria-hidden="true" className="text-muted">
      ·
    </span>
  );
}
