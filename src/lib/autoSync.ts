/**
 * AUTO-SYNC COORDINATOR — the effectful shell around the pure scheduler.
 *
 * Owns one piece of module state (there must be exactly one in-flight lock per tab, so a singleton
 * is correct here rather than React state), asks `shouldSync` whether a given trigger deserves a
 * run, performs it via `syncNow`, folds the result back, and notifies subscribers so the UI can
 * show what actually happened.
 *
 * Triggers wired by `start()`:
 *   - window focus / tab becomes visible  (ambient, coalesced)
 *   - browser goes back online            (high priority)
 *   - a periodic heartbeat                (ambient, coalesced)
 *   - a finished lesson                   (high priority — see requestSync in LessonPlayer)
 *
 * Nothing here retries forever: failures back off exponentially, and going offline simply stops
 * attempts. Local progress is never at risk either way, because the local store is the source of
 * truth for reads and the merge is monotonic.
 */

import { authProvider, SESSION_CHANGED_EVENT } from "./auth";
import { syncNow, type SyncOutcome, type SyncState } from "./syncClient";
import { afterAttempt, shouldSync, type SchedulerState, type SyncTrigger } from "./syncScheduler";

export interface SyncStatus {
  state: SyncState | "idle";
  at?: string;
  detail?: string;
  /** Why the last decision went the way it did — useful and honest, not a fake tick. */
  lastReason?: string;
}

const HEARTBEAT_MS = 5 * 60_000;

let state: SchedulerState = {
  lastAttemptAt: null,
  consecutiveErrors: 0,
  inFlight: false,
  signedIn: false,
  online: true
};

let status: SyncStatus = { state: "idle" };
const listeners = new Set<(s: SyncStatus) => void>();
let started = false;
let heartbeat: ReturnType<typeof setInterval> | null = null;

function emit(next: SyncStatus) {
  status = next;
  for (const l of listeners) l(status);
}

export function getStatus(): SyncStatus {
  return status;
}

export function subscribe(fn: (s: SyncStatus) => void): () => void {
  listeners.add(fn);
  fn(status);
  return () => listeners.delete(fn);
}

function refreshEnv() {
  state = {
    ...state,
    signedIn: !!authProvider.currentSession(),
    online: typeof navigator === "undefined" ? true : navigator.onLine
  };
}

/** Ask for a sync and return the transport's truthful outcome. `null` means
 * the scheduler intentionally coalesced/blocked the request; it never means
 * success. Unexpected throws are folded back into scheduler state so one bad
 * transport call cannot leave the tab permanently locked "in flight". */
export async function requestSyncOutcome(trigger: SyncTrigger): Promise<SyncOutcome | null> {
  refreshEnv();
  const decision = shouldSync(state, trigger, Date.now());
  if (!decision.sync) {
    emit({ ...status, lastReason: decision.reason });
    return null;
  }

  state = { ...state, inFlight: true };
  emit({ state: "syncing", lastReason: decision.reason });

  let outcome: SyncOutcome;
  try {
    outcome = await syncNow();
  } catch {
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    outcome = offline
      ? { state: "offline", detail: "changes are saved on this device and will sync when you're back online" }
      : { state: "error", detail: "sync failed unexpectedly; your progress remains saved on this device" };
  }
  const ok = outcome.state === "ok";
  state = afterAttempt(state, ok, Date.now());
  emit({ state: outcome.state, at: outcome.at, detail: outcome.detail, lastReason: decision.reason });
  return outcome;
}

/** Back-compatible boolean seam for fire-and-forget callers and existing tests. */
export async function requestSync(trigger: SyncTrigger): Promise<boolean> {
  return (await requestSyncOutcome(trigger))?.state === "ok";
}

/** Wire the ambient triggers. Idempotent; returns a teardown. */
export function start(): () => void {
  if (typeof window === "undefined" || started) return () => {};
  started = true;

  const onFocus = () => void requestSync("focus");
  const onVisible = () => {
    if (document.visibilityState === "visible") void requestSync("focus");
  };
  const onOnline = () => void requestSync("online");
  const onOffline = () => {
    refreshEnv();
    emit({ ...status, state: "offline", detail: "changes are saved on this device" });
  };

  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  window.addEventListener(SESSION_CHANGED_EVENT, onFocus);
  heartbeat = setInterval(() => void requestSync("interval"), HEARTBEAT_MS);

  // One attempt on boot, so a device that was closed mid-session catches up.
  void requestSync("focus");

  return () => {
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
    window.removeEventListener(SESSION_CHANGED_EVENT, onFocus);
    if (heartbeat) clearInterval(heartbeat);
    heartbeat = null;
    started = false;
  };
}

/** Test seam: reset the module singleton between tests. */
export function __resetForTests() {
  state = { lastAttemptAt: null, consecutiveErrors: 0, inFlight: false, signedIn: false, online: true };
  status = { state: "idle" };
  listeners.clear();
  if (heartbeat) clearInterval(heartbeat);
  heartbeat = null;
  started = false;
}
