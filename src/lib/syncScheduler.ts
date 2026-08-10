/**
 * AUTO-SYNC SCHEDULER — the decision logic, kept pure so it can be tested.
 *
 * Syncing on every trigger would be wrong in several ways at once: focus events fire constantly
 * when a learner alt-tabs, a failing server would get hammered, and two triggers arriving together
 * would race. So the *decision* ("given what I know, should I sync right now?") lives here as a
 * pure function of state + trigger + clock, and the effectful part (listeners, fetch) lives in
 * autoSync.ts around it.
 *
 * Rules, in order:
 *   1. Never sync while a sync is already in flight — a second push would race the first.
 *   2. Never sync signed-out (there is no account to sync to) or offline (it would just fail).
 *   3. HIGH-PRIORITY triggers (a finished lesson, an explicit button) bypass the coalescing window:
 *      the learner just did real work, get it up immediately.
 *   4. AMBIENT triggers (focus, interval) coalesce: skip if we attempted recently.
 *   5. After failures, back off exponentially — but an explicit manual retry always gets through,
 *      because a user tapping "sync now" is entitled to an attempt.
 */

export type SyncTrigger = "lesson-complete" | "manual" | "focus" | "interval" | "online";

export interface SchedulerState {
  /** Epoch ms of the last attempt (success or failure), or null if never. */
  lastAttemptAt: number | null;
  /** Consecutive failures; drives the backoff. Reset to 0 on success. */
  consecutiveErrors: number;
  inFlight: boolean;
  signedIn: boolean;
  online: boolean;
}

export interface Decision {
  sync: boolean;
  /** Why — surfaced in tests and in the dev status line, never guessed at. */
  reason: string;
}

/** Ambient triggers won't re-sync more often than this. */
export const COALESCE_MS = 30_000;
/** Backoff after failures: 2s, 4s, 8s … capped. */
export const BACKOFF_BASE_MS = 2_000;
export const BACKOFF_MAX_MS = 5 * 60_000;

const HIGH_PRIORITY: SyncTrigger[] = ["lesson-complete", "manual", "online"];

export function backoffMs(consecutiveErrors: number): number {
  if (consecutiveErrors <= 0) return 0;
  const raw = BACKOFF_BASE_MS * 2 ** (consecutiveErrors - 1);
  return Math.min(raw, BACKOFF_MAX_MS);
}

export function shouldSync(state: SchedulerState, trigger: SyncTrigger, now: number): Decision {
  if (state.inFlight) return { sync: false, reason: "a sync is already running" };
  if (!state.signedIn) return { sync: false, reason: "signed out" };
  if (!state.online) return { sync: false, reason: "offline" };

  const since = state.lastAttemptAt === null ? Infinity : now - state.lastAttemptAt;
  const high = HIGH_PRIORITY.includes(trigger);

  // Manual retries always get an attempt — the user explicitly asked.
  if (trigger === "manual") return { sync: true, reason: "manual" };

  // Respect backoff after failures, for everything else.
  const wait = backoffMs(state.consecutiveErrors);
  if (wait > 0 && since < wait) {
    return { sync: false, reason: `backing off after ${state.consecutiveErrors} failure(s)` };
  }

  if (high) return { sync: true, reason: trigger };

  if (since < COALESCE_MS) return { sync: false, reason: "synced recently" };
  return { sync: true, reason: trigger };
}

/** Fold the result of an attempt back into the scheduler state. */
export function afterAttempt(state: SchedulerState, ok: boolean, now: number): SchedulerState {
  return {
    ...state,
    inFlight: false,
    lastAttemptAt: now,
    consecutiveErrors: ok ? 0 : state.consecutiveErrors + 1
  };
}
