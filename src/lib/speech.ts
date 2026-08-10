/**
 * NARRATION — Web Speech API for the K–2 (early-profile) band.
 *
 * Pre-readers can't use a text-first player, so early lessons carry an authored `narration` string
 * per step (schema.ts). This module reads it aloud. Deliberate constraints:
 *
 *   • OPT-IN, NEVER SURPRISE. Browsers block un-gestured speech anyway, but the stronger reason is
 *     that audio firing unannounced on a shared classroom device is hostile. The learner turns it
 *     on; the preference persists; only then does step-change narration follow automatically.
 *   • SSR-SAFE. Nothing touches `window` at module scope — this file is imported by a component
 *     that renders on the server.
 *   • GRADING-INERT. Speech never reads learner answers and never feeds the evaluator. If the
 *     whole subsystem is missing, the player behaves exactly as before.
 *   • CANCEL-ON-CHANGE. Utterances are cancelled when the step changes, so a learner who advances
 *     quickly doesn't accumulate a backlog of voices talking over each other.
 *
 * Availability is genuinely uneven (older Firefox ships no voices; some Linux builds no-op), so
 * every entry point is a no-op when unsupported and `canSpeak()` gates the UI.
 */

import { storageGet, storageSet } from "./safeStorage";

const PREF_KEY = "numera:narration:v1";

/** Feature detection, evaluated per call so SSR and hydration both behave. */
export function canSpeak(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
}

export function narrationEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return storageGet(PREF_KEY) === "on";
  } catch {
    // Invalid stored data is treated as off rather than crashing.
    return false;
  }
}

export function setNarrationEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    storageSet(PREF_KEY, on ? "on" : "off");
  } catch {
    /* safeStorage retains it for this tab */
  }
  if (!on) cancelSpeech();
}

export function cancelSpeech(): void {
  if (!canSpeak()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* no-op */
  }
}

/**
 * Speak `text`, replacing anything in flight.
 *
 * `rate` is slowed a little from the 1.0 default: the default clip is brisk for a six-year-old
 * meeting a number word for the first time. Returns false when speech is unavailable so callers
 * can fall back silently.
 */
export function speak(text: string, opts: { rate?: number; onEnd?: () => void } = {}): boolean {
  if (!canSpeak()) return false;
  const clean = text.trim();
  if (!clean) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(clean);
    u.rate = opts.rate ?? 0.9;
    u.pitch = 1;
    u.lang = "en-US";
    if (opts.onEnd) u.onend = opts.onEnd;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

/**
 * Turn mathematical notation into something a speech engine says correctly.
 *
 * Raw TTS handles prose well and notation badly: "8 + 8 = ?" is read by some voices as a bare
 * "8 8" with the operator swallowed, and a trailing "?" becomes an audible "question mark". For a
 * pre-reader — who cannot fall back to seeing the symbol — that is the difference between hearing
 * the question and hearing noise.
 *
 * Only symbols with an unambiguous spoken form are translated. Anything else is left alone rather
 * than guessed at, because a confidently wrong reading is worse than a symbol the voice skips.
 */
export function speakableMath(text: string): string {
  return text
    // "= ?" is a BLANK to be filled, not a question — strip the marker so the voice ends on
    // "equals" and waits. A "?" ending real prose ("How many apples?") is left alone, because
    // there it is ordinary punctuation the voice renders as intonation.
    .replace(/\s*=\s*\?\s*$/, " equals ")
    .replace(/(\d)\s*\/\s*(\d)/g, "$1 over $2") // 3/4 → "3 over 4" (a fraction, not division)
    .replace(/\s*\+\s*/g, " plus ")
    .replace(/\s*[−–—-]\s*/g, " minus ")
    .replace(/\s*[×*]\s*/g, " times ")
    .replace(/\s*÷\s*/g, " divided by ")
    .replace(/\s*≥\s*/g, " is greater than or equal to ")
    .replace(/\s*≤\s*/g, " is less than or equal to ")
    .replace(/\s*≠\s*/g, " is not equal to ")
    .replace(/\s*<\s*/g, " is less than ")
    .replace(/\s*>\s*/g, " is greater than ")
    .replace(/\s*=\s*/g, " equals ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * What to read for a step: the authored framing, then the question itself.
 *
 * Authored `narration` wins over `body` because it is written to be HEARD. But framing alone is
 * not enough — an early step often says "Say the double." in the body while the actual question
 * ("8 + 8 = ?") lives only in the widget prompt. A learner who cannot read hears the instruction
 * and never learns which problem to solve, so the prompt is appended whenever it adds something
 * the framing doesn't already contain.
 */
export function narrationFor(step: { narration?: string; body?: string; widget?: { prompt?: string } }): string | null {
  const framing = step.narration?.trim() || step.body?.trim() || "";
  const prompt = step.widget?.prompt?.trim() ?? "";
  const addsSomething = prompt && !framing.includes(prompt);
  const parts = [framing, addsSomething ? prompt : ""].filter(Boolean);
  if (!parts.length) return null;
  return speakableMath(parts.join(". ").replace(/\.\s*\./g, "."));
}
