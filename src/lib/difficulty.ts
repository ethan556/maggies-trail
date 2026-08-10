// DETERMINISTIC DIFFICULTY LADDER (Pillar Two, final piece).
//
// Practice difficulty should follow the learner's evidence, not the course
// order — but "adaptive difficulty" must stay a pure function the app (and a
// parent, and a test) can re-derive. This module is that function and nothing
// else: no storage, no clock (the date comes in), no randomness.
//
// Three bands, on purpose. A finer ladder implies precision the evidence does
// not carry; two bands cannot express "solid — stretch her". The names say
// what the LEARNER needs, not what the item is:
//
//   support — smaller numbers, familiar benchmarks, less working-memory load
//   core    — the authored difficulty of the concept
//   stretch — same concept, bigger values and less familiar surfaces
//
// Two evidence sources, combined with a fixed rule:
//
//   1. RETAINED mastery (mastery.ts's forgetting-adjusted estimate — the score
//      she can be expected to produce TODAY, not the score she once got).
//   2. The process-evidence ledger: latched strategy signals (wrong-direction,
//      oscillation, fixation, invalid moves). Two or more of these on a skill
//      mean the concept's MODEL is shaky even when answers eventually landed —
//      so the ladder shifts one band down. The ledger can never shift a band
//      UP: fluent process is the absence of signals, and absence of evidence
//      must not masquerade as evidence of fluency.
//
// The rule never inspects WHICH signal fired — that specificity belongs to the
// in-lesson cue, which already acted on it. Here the ledger is load, not
// diagnosis.

import { PROFICIENT, retainedMastery, type SkillState } from "@/lib/mastery";

export type Band = "support" | "core" | "stretch";

/** Retained mastery below this is fragile enough that harder surface features
 * would test working memory, not the concept. */
const SUPPORT_BELOW = 0.35;

/** A stretch item is earned by proficiency PLUS a current streak — a high
 * score with recent misses stays at core. */
const STRETCH_STREAK = 3;

/** Ledger pressure at or above this shifts the band down one rung. */
const PRESSURE_AT = 2;

export function recommendBand(skill: SkillState | undefined, today: string): Band {
  // No graded evidence yet → the authored difficulty is the calibration probe.
  if (!skill || skill.attempts === 0) return "core";
  const retained = retainedMastery(skill, today);
  let band: Band =
    retained < SUPPORT_BELOW
      ? "support"
      : retained >= PROFICIENT && skill.correctStreak >= STRETCH_STREAK
        ? "stretch"
        : "core";
  const pressure = Object.values(skill.signals ?? {}).reduce((a, b) => a + (b ?? 0), 0);
  if (pressure >= PRESSURE_AT) band = band === "stretch" ? "core" : "support";
  return band;
}
