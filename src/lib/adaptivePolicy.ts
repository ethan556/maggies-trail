/**
 * ADAPTIVE-RESPONSE POLICY (Pillar Two, decision layer).
 *
 * classifyProcess (processEvents.ts) names WHAT the move stream looks like;
 * this module decides HOW the lesson responds — and, just as deliberately,
 * when it must NOT respond. Pure function of its inputs: identical situations
 * always produce identical responses, so adaptation is auditable.
 *
 * The response ladder (per signal, per lesson):
 *   1st latch  → cue          the app noticing out loud (a noticing question)
 *   2nd latch  → structural   lock the misused control / insert a contrast
 *                             framing / reduce to a partial scaffold
 *   3rd latch  → remedial     one short remedial interaction, once per signal
 *   4th+       → none         never trap a struggling learner in a loop
 *
 * Guards (the anti-overadaptation contract):
 *   FLUENT LEARNERS ARE NEVER SLOWED  a recent unaided streak suppresses every
 *     scaffolding response outright; acceleration stays the skip-offer
 *     machinery's job and this module never interferes with it.
 *   ONE REMEDIAL PER SIGNAL  the remedial rung fires once per signal per
 *     lesson, then the ladder terminates.
 *   NO RESPONSE WITHOUT A SIGNAL  and signals themselves require repeated
 *     evidence (see thresholds in processEvents.ts) — one accidental move can
 *     never reach this module.
 */

import type { ProcessSignal } from "@/lib/processEvents";
import { POSITIVE_STRATEGIES } from "@/lib/strategyClassifiers";

export type AdaptiveResponse =
  | { kind: "none" }
  | { kind: "cue" }
  | { kind: "lock"; control: string }
  | { kind: "contrast" }
  | { kind: "scaffold" }
  | { kind: "remedial" }
  /** A recognised strong strategy: affirm it once and feed acceleration
   * evidence. NEVER a scaffold — the anti-overadaptation contract's
   * "advanced learners are not slowed" clause, made structural. */
  | { kind: "affirm" };

/** Signals whose second latch locks the misused control (the learner keeps
 * adjusting a control that cannot close the remaining gap — freezing it for a
 * moment makes the other control's role visible). The value is the control to
 * lock; fixation locks whatever control the stream fixated on (caller passes it). */
const LOCKABLE: Partial<Record<ProcessSignal, string | "caller">> = {
  "slope-for-intercept": "m",
  "intercept-for-slope": "b",
  "one-control-fixation": "caller"
};

/** Signals whose second latch inserts a contrast framing — the misconception
 * is about MEANING (axis order, direction, appearance vs. proof), so seeing
 * the two readings side by side teaches more than restricting movement. */
const CONTRAST = new Set<ProcessSignal>([
  "xy-reversal",
  "rise-run-reversal",
  "graph-as-picture",
  "repr-disconnect",
  "visual-proof",
  "angle-direction",
  "rigid-violation",
  "measurement-dependence",
  "construction-order"
]);

export interface AdaptiveInput {
  signal: ProcessSignal;
  /** 1-based count of this signal latching in the CURRENT lesson (persisted
   * across resume so a reload cannot reset the ladder). */
  occurrence: number;
  /** Recent unaided streak on this step's concept — the never-slow-down gate. */
  fluent: boolean;
  /** Signals already remediated this lesson — the loop guard. */
  remediatedSignals: readonly ProcessSignal[];
  /** For fixation: the control the stream fixated on. */
  control?: string;
}

export function decideResponse(input: AdaptiveInput): AdaptiveResponse {
  // A POSITIVE strategy is evidence of understanding, not a problem to fix: it
  // is affirmed ONCE (first detection) and otherwise stays silent, and it
  // never enters the scaffolding rungs regardless of occurrence count. This is
  // the structural guarantee that recognising a good strategy can only ever
  // help a strong learner, never slow them.
  if (POSITIVE_STRATEGIES.has(input.signal)) return input.occurrence === 1 ? { kind: "affirm" } : { kind: "none" };
  if (input.fluent) return { kind: "none" };
  if (input.occurrence <= 0) return { kind: "none" };
  if (input.occurrence === 1) return { kind: "cue" };
  if (input.occurrence === 2) {
    const lock = LOCKABLE[input.signal];
    if (lock === "caller" && input.control) return { kind: "lock", control: input.control };
    if (lock && lock !== "caller") return { kind: "lock", control: lock };
    if (CONTRAST.has(input.signal)) return { kind: "contrast" };
    return { kind: "scaffold" };
  }
  if (input.occurrence === 3 && !input.remediatedSignals.includes(input.signal)) return { kind: "remedial" };
  return { kind: "none" };
}

/** Stronger second-rung copy for the contrast and scaffold responses, in the
 * same tentative voice as the cues. The lock response speaks through the
 * engine's own locked-control chip, so it needs no copy here. */
export function responseCopy(r: AdaptiveResponse): string | null {
  switch (r.kind) {
    case "contrast":
      return "Look at the two readings side by side for a moment — the one your moves suggest, and the one the mathematics defines. Where exactly do they disagree?";
    case "scaffold":
      return "Let's shrink the problem: change ONE thing, predict what will move before it moves, then check. One confirmed connection beats ten guesses.";
    default:
      return null;
  }
}
