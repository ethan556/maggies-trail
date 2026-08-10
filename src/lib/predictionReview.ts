import type { Profile } from "./progress";
import { addDays } from "./engine";

/**
 * The predict→review loop's back half. Predictions are never graded and never
 * touch mastery — but a MISSED prediction is the purest signal the app gets
 * that a mental model disagreed with the mathematics. This module remembers
 * those moments at lesson completion and serves them back for delayed
 * retrieval: revisit after a night's sleep, not immediately (re-running the
 * lesson while the reveal is still in working memory would test memory of the
 * reveal, not repair of the model).
 *
 * Contract:
 *  - record at completion; any miss writes/refreshes the lesson's entry
 *  - a re-completion where EVERY prediction holds resolves (deletes) the entry
 *  - lessons without predictions never write anything
 *  - due = the local day after `at` (or later)
 */

export interface MissedPredictionEntry {
  missed: number;
  total: number;
  at: string; // local date of the completion that missed
}

export interface PredictionReview extends MissedPredictionEntry {
  lessonId: string;
  due: boolean;
}

export function recordPredictionOutcome(
  p: Profile,
  lessonId: string,
  predictions: Array<{ held: boolean }>,
  today: string
): void {
  if (predictions.length === 0) return; // nothing was predicted; nothing to remember
  const missed = predictions.filter((x) => !x.held).length;
  if (missed > 0) {
    p.missedPredictions = { ...(p.missedPredictions ?? {}), [lessonId]: { missed, total: predictions.length, at: today } };
    return;
  }
  if (p.missedPredictions?.[lessonId]) {
    // Every prediction held this time — the surprise is resolved.
    const next = { ...p.missedPredictions };
    delete next[lessonId];
    p.missedPredictions = next;
  }
}

/** All remembered surprises, due-first, then oldest-first — callers cap the list. */
export function predictionReviews(p: Profile, today: string): PredictionReview[] {
  const entries = Object.entries(p.missedPredictions ?? {});
  return entries
    .map(([lessonId, e]) => ({ lessonId, ...e, due: addDays(e.at, 1) <= today }))
    .sort((a, b) => (a.due === b.due ? (a.at < b.at ? -1 : a.at > b.at ? 1 : 0) : a.due ? -1 : 1));
}
