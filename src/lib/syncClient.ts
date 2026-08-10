/**
 * SYNC CLIENT — the transport around the pure merge core.
 *
 * DESIGN NOTE (why there is no `RemoteProgressStore`): `ProgressStore.load()` is synchronous and is
 * called on mount by a dozen surfaces. A remote-first store would have to block on the network or
 * return an empty profile and pop it in later — both are worse than what a learning app needs. So
 * the local store stays the read path (instant, offline-proof) and sync reconciles *around* it:
 *
 *     pull → merge(server, local) → push merged → adopt the server's copy
 *
 * Because `mergeProfiles` is commutative and monotonic, doing this on any schedule, in any order,
 * from any number of devices converges without losing work. Offline needs no queue: the local
 * profile IS the queue, and the next successful sync carries everything.
 *
 * FAN-OUT: a parent's device holds a ROSTER, not one learner. Syncing only the active child would
 * silently strand the others' progress on this device — a parent would have to remember to switch
 * to each child and sync them one at a time, which nobody will do. So `syncAll()` walks the roster.
 * Each learner is an independent server row keyed by learner id, so they can't contaminate
 * one another.
 *
 * ADOPTION IS A RAW WRITE. `progressStore.save()` stamps every write as a fresh local edit — right
 * for learner activity, wrong for sync: re-stamping the server's merged copy would claim this
 * device had just authored it, and a later tie-break could then let a stale device win a field it
 * had no right to. So adoption goes through `writeChildProfile`, preserving the timestamps the
 * merge decided on.
 */

import type { Profile } from "./progress";
import { mergeProfiles, type SyncedProfile } from "./sync";
import { lessonStateKey, type LessonSnapshot } from "./lessonState";
import { authProvider } from "./auth";
import { getRoster, readChildProfile, writeChildProfile } from "./roster";
import { deviceId } from "./device";
import { storageEntries, storageGet, storageSet } from "./safeStorage";

const LAST_SYNC_KEY = "numera:lastsync:v1";

export type SyncState = "idle" | "syncing" | "ok" | "offline" | "signed-out" | "error";

export interface SyncOutcome {
  state: SyncState;
  at?: string;
  detail?: string;
  /** How many learners were reconciled on this run (fan-out). */
  synced?: number;
}

/** Stamp a profile as locally mutated. Used when PUSHING local work, never when adopting. */
export function stampLocal(p: Profile): SyncedProfile {
  return { ...(p as SyncedProfile), updatedAt: new Date().toISOString(), deviceId: deviceId() };
}

export function lastSyncedAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return storageGet(LAST_SYNC_KEY);
  } catch {
    return null;
  }
}

/** Reconcile ONE learner. Throws on failure so the caller can classify offline vs server error. */
/** Harvest this child's per-lesson snapshots into the document (push side)
 * and write pulled ones back — but ONLY when the pulled snapshot is FURTHER
 * than the local one, mirroring the merge's clock-immune progress rule. */
function harvestActiveLessons(childId: string): Record<string, LessonSnapshot> {
  const out: Record<string, LessonSnapshot> = {};
  const prefix = lessonStateKey("", childId);
  for (const [, raw] of storageEntries(prefix)) {
    try {
      const snap = JSON.parse(raw) as LessonSnapshot;
      if (snap?.lessonId) out[snap.lessonId] = snap;
    } catch {
      /* one unreadable snapshot: skip it without aborting sync */
    }
  }
  return out;
}

function restoreActiveLessons(
  childId: string,
  pulled: Record<string, LessonSnapshot> | undefined,
  lessons: SyncedProfile["lessons"] | undefined
): void {
  if (!pulled || typeof window === "undefined") return;
  for (const [lessonId, snap] of Object.entries(pulled)) {
    // A completed lesson never regains a resume point on this device.
    if (lessons?.[lessonId]?.completed) continue;
    const key = lessonStateKey(lessonId, childId);
    let cur: LessonSnapshot | null = null;
    try {
      cur = JSON.parse(storageGet(key) ?? "null") as LessonSnapshot | null;
    } catch {
      cur = null;
    }
    const further = !cur || snap.i > cur.i || (snap.i === cur.i && snap.sessionXp > cur.sessionXp);
    if (further) storageSet(key, JSON.stringify(snap));
  }
}

async function syncChild(childId: string): Promise<void> {
  const stored = readChildProfile(childId) as SyncedProfile;
  stored.activeLessons = { ...(stored.activeLessons ?? {}), ...harvestActiveLessons(childId) };
  // Never push a snapshot for a lesson this profile has completed — the local
  // key was cleared at completion; anything here is a stale leftover.
  for (const id of Object.keys(stored.activeLessons)) {
    if (stored.lessons?.[id]?.completed) delete stored.activeLessons[id];
  }
  // Stamp only if this profile has never been stamped; otherwise keep its real edit time.
  const local: SyncedProfile = stored.updatedAt ? stored : stampLocal(stored);

  // The learner id names the row; the RIGHT to touch it comes from the
  // session cookie — the old accountId parameter was a trust hole and is gone.
  const res = await fetch(`/api/sync?learnerId=${encodeURIComponent(childId)}`);
  if (!res.ok) throw new Error(`pull failed (${res.status})`);
  const pulled = (await res.json()) as { profile: SyncedProfile | null; rev: number };

  const merged = pulled.profile ? mergeProfiles(local, pulled.profile) : local;

  const push = await fetch("/api/sync", {
    method: "POST",
    // The idempotency key lets any proxy- or runtime-level retry of THIS push
    // replay byte-identically on the server instead of merging twice.
    headers: { "Content-Type": "application/json", "x-idempotency-key": crypto.randomUUID() },
    body: JSON.stringify({ learnerId: childId, profile: merged })
  });
  if (!push.ok) throw new Error(`push failed (${push.status})`);
  const saved = (await push.json()) as { profile: SyncedProfile; rev: number };

  restoreActiveLessons(childId, saved.profile.activeLessons, saved.profile.lessons);
  writeChildProfile(childId, saved.profile); // raw — do not forge an edit timestamp
}

/**
 * Reconcile EVERY learner on the roster. Safe to call repeatedly; a no-op when signed out. Returns
 * what actually happened so the UI can tell the truth rather than show a tick it hasn't earned.
 */
export async function syncAll(): Promise<SyncOutcome> {
  const session = authProvider.currentSession();
  if (!session) return { state: "signed-out" };

  const children = getRoster().children;
  let done = 0;

  try {
    for (const child of children) {
      await syncChild(child.id); // identity rides the session cookie, not an argument
      done++;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    // An HTTP error carries a status; a failed fetch (offline) does not.
    if (/failed \(\d+\)/.test(msg)) return { state: "error", detail: msg, synced: done };
    return {
      state: "offline",
      detail: "changes are saved on this device and will sync when you're back online",
      synced: done
    };
  }

  const at = new Date().toISOString();
  try {
    storageSet(LAST_SYNC_KEY, at);
  } catch {
    /* ignore */
  }
  return { state: "ok", at, synced: done };
}

/** The whole roster is what should sync, so the old single-learner entry point now fans out. */
export const syncNow = syncAll;
