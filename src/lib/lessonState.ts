/**
 * Mid-lesson resume — the anti-data-loss layer for the lesson player.
 *
 * Before this existed, a refresh, an accidental back-swipe, or a tab crash at
 * step 11 of a 15-step lesson silently discarded everything: the player's
 * zustand store is in-memory and `load()` always started at step 0. Completed
 * lessons were durable; *in-progress* lessons were not — which is exactly when
 * a learner has the most unsaved work.
 *
 * Design:
 * - A snapshot is written every time the learner ADVANCES to a new step (the
 *   clean state boundary: phase "work", nothing half-finalized). It captures
 *   the full queue AS STEP IDS — including any remedial steps the adaptive
 *   engine injected — plus index, session XP, attempt history, and the
 *   injected-tag list, so the restored player is byte-for-byte the same
 *   machine state the learner left.
 * - Restore is strict: any unknown step id (content edited since), an index
 *   out of range, a lesson-id mismatch, or i === 0 (nothing worth resuming)
 *   discards the snapshot and starts fresh. A stale snapshot must never
 *   produce a confusing hybrid lesson.
 * - Snapshots are namespaced per child (same roster key the progress store
 *   reads) and per lesson, and cleared on completion and on explicit restart.
 * - This is scratch state, deliberately OUTSIDE the synced Profile: a
 *   half-finished step queue is device-local by nature and must not enter the
 *   cross-device semantic merge.
 */

import type { TLesson, TStep } from "./schema";
import type { AttemptEvent } from "./engine";
import { DEFAULT_CHILD_ID, ROSTER_KEY } from "./storageKeys";
import { storageGet, storageRemove, storageSet } from "./safeStorage";

export interface LessonSnapshot {
  v: 1;
  lessonId: string;
  /** Full queue at save time (base steps + injected remedials), by id. */
  stepIds: string[];
  /** Current step index; the learner resumes here in phase "work". */
  i: number;
  sessionXp: number;
  history: AttemptEvent[];
  /** conceptTags whose remedial pair has already been injected. */
  injected: string[];
  /** Prediction outcomes so far this session ({held} per committed prediction),
   * so the completion tally survives a refresh. Absent in old snapshots. */
  predictions?: Array<{ held: boolean }>;
  /** Adaptive ladder (s41): per-lesson latch counts for each process signal,
   * and the signals whose one remedial rung has been consumed. Optional and
   * additive — old snapshots parse unchanged; resume cannot reset the ladder,
   * so a refresh never re-arms a response the learner already received. */
  signalCounts?: Record<string, number>;
  remediated?: string[];
  savedAt: string;
}

/** The active child's id, read the same way progress.ts reads it (no cycle). */
function activeChildId(): string {
  if (typeof window === "undefined") return DEFAULT_CHILD_ID;
  try {
    const raw = storageGet(ROSTER_KEY);
    if (raw) {
      const r = JSON.parse(raw) as { activeId?: string };
      if (r.activeId) return r.activeId;
    }
  } catch {
    /* fall through */
  }
  return DEFAULT_CHILD_ID;
}

export function lessonStateKey(lessonId: string, childId = activeChildId()): string {
  return `numera:lesson:v1:${childId}:${lessonId}`;
}

/** Every step this lesson can ever serve, by id: base steps + remedial pairs. */
export function stepIndex(lesson: TLesson): Map<string, TStep> {
  const m = new Map<string, TStep>();
  for (const s of lesson.steps) m.set(s.id, s);
  for (const r of lesson.remedials) {
    m.set(r.concept.id, r.concept);
    m.set(r.check.id, r.check);
  }
  return m;
}

/**
 * Rebuild the exact queue a snapshot describes, or null when the snapshot
 * cannot be honoured (wrong lesson, unknown step id, index out of range, or
 * nothing to resume). Null means: start fresh.
 */
export function restoreQueue(lesson: TLesson, snap: LessonSnapshot): TStep[] | null {
  if (snap.v !== 1 || snap.lessonId !== lesson.id) return null;
  if (!Number.isInteger(snap.i) || snap.i <= 0 || snap.i >= snap.stepIds.length) return null;
  const idx = stepIndex(lesson);
  const queue: TStep[] = [];
  for (const id of snap.stepIds) {
    const s = idx.get(id);
    if (!s) return null; // content changed underneath the snapshot — discard
    queue.push(s);
  }
  return queue;
}

export function saveLessonState(snap: LessonSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    storageSet(lessonStateKey(snap.lessonId), JSON.stringify(snap));
  } catch {
    /* safeStorage retains the snapshot in memory for this tab */
  }
}

export function loadLessonState(lessonId: string): LessonSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = storageGet(lessonStateKey(lessonId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LessonSnapshot>;
    // Strict shape check. The old shallow check let an in-range-looking but
    // poisoned save through — e.g. i beyond stepIds, or a history element of
    // the wrong shape — which crashed the player on EVERY resume of that
    // lesson (queue[i] undefined) until the key was cleared by hand. Reject
    // deep, and REMOVE the poisoned key so the next open is a clean fresh
    // lesson rather than a repeating crash.
    const ok =
      parsed !== null &&
      typeof parsed === "object" &&
      parsed.v === 1 &&
      typeof parsed.lessonId === "string" &&
      Array.isArray(parsed.stepIds) &&
      parsed.stepIds.every((x) => typeof x === "string") &&
      typeof parsed.i === "number" &&
      Number.isInteger(parsed.i) &&
      parsed.i >= 0 &&
      parsed.i < parsed.stepIds.length &&
      typeof parsed.sessionXp === "number" &&
      Number.isFinite(parsed.sessionXp) &&
      Array.isArray(parsed.history) &&
      parsed.history.every(
        (h) =>
          h !== null &&
          typeof h === "object" &&
          typeof (h as { conceptTag?: unknown }).conceptTag === "string" &&
          typeof (h as { correct?: unknown }).correct === "boolean" &&
          typeof (h as { firstTry?: unknown }).firstTry === "boolean"
      ) &&
      Array.isArray(parsed.injected) &&
      parsed.injected.every((x) => typeof x === "string") &&
      (parsed.predictions === undefined ||
        (Array.isArray(parsed.predictions) &&
          parsed.predictions.every(
            (p) => p !== null && typeof p === "object" && typeof (p as { held?: unknown }).held === "boolean"
          ))) &&
      (parsed.signalCounts === undefined ||
        (parsed.signalCounts !== null &&
          typeof parsed.signalCounts === "object" &&
          Object.values(parsed.signalCounts).every((v) => typeof v === "number")));
    if (!ok) {
      storageRemove(lessonStateKey(lessonId)); // poisoned-save cleanup
      return null;
    }
    return parsed as LessonSnapshot;
  } catch {
    return null;
  }
}

export function clearLessonState(lessonId: string): void {
  if (typeof window === "undefined") return;
  try {
    storageRemove(lessonStateKey(lessonId));
  } catch {
    /* nothing to do */
  }
}
