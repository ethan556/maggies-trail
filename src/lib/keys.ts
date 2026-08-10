"use client";

import { useEffect } from "react";

/**
 * Enter drives the lesson loop: check when an answer is ready, advance when a
 * step is finished — the hands-stay-on-the-keyboard flow that makes lesson
 * pacing feel instant. The handler decides what Enter means for the current
 * phase; this hook only decides when Enter is OURS to handle:
 *
 * - Buttons/links keep their native Enter activation (no double-fire: if focus
 *   is on "Continue", the click handles it and we stand down).
 * - Text inputs DO submit on Enter (a numeric answer + Enter must check),
 *   textareas and contenteditable never do.
 * - Held keys (`repeat`) and IME composition are ignored so Enter can't
 *   machine-gun through steps.
 */
export function useEnterAdvance(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat || e.isComposing) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "BUTTON" || tag === "A" || tag === "TEXTAREA" || tag === "SELECT" || t?.isContentEditable) return;
      e.preventDefault();
      handler();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handler, enabled]);
}
