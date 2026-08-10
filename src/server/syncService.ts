/**
 * SYNC SERVICE — the server side of cross-device progress, on the database.
 *
 * This replaces the in-memory Map the old route documented as "NOT REAL".
 * The protocol is unchanged (pull → merge → push → adopt); what's new is
 * everything a durable authority owes:
 *
 *   AUTHORIZATION   the session decides which learners it may touch —
 *                   `canTouchLearner` reads rows, never the request body.
 *   IDEMPOTENCY     a client retry with the same key gets the byte-identical
 *                   first response; nothing merges twice.
 *   CONCURRENCY     optimistic version check on the write; a concurrent
 *                   writer triggers re-read + re-merge (the merge is
 *                   commutative, so the retry converges) — bounded attempts.
 *   ENTITLEMENT     server-authoritative: whatever `premium` the client sent
 *                   is DISCARDED and rewritten from the subscriptions table.
 *                   A device cannot grant itself the family plan offline.
 *   CLOCK DRIFT     `updated_at` is server receipt time; educational fields
 *                   merge by union/max/evidence, and active lessons by
 *                   furthest-progress — none of it trusts a client clock.
 *   PROJECTIONS     lesson_completions and skill_evidence are refreshed in
 *                   the same transaction, so teacher/school queries read
 *                   indexed rows, never JSON.
 */

import type { DB } from "@/server/db";
import { canTouchLearner, type SessionInfo } from "@/server/authService";
import { isSyncedProfile, mergeProfiles, type SyncedProfile } from "@/lib/sync";

const nowIso = () => new Date().toISOString();
function parseStoredProfile(raw: string): SyncedProfile | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSyncedProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}


/** The subscriptions row is the only source of premium truth. */
function entitlementFor(db: DB, accountId: string): SyncedProfile["premium"] {
  const row = db
    .prepare("SELECT plan, status, current_period_end, updated_at FROM subscriptions WHERE user_id = ?")
    .get(accountId) as { plan: string; status: string; current_period_end: string; updated_at: string } | undefined;
  if (!row) return undefined;
  const live = row.status === "active" && row.current_period_end >= nowIso();
  return live ? { plan: row.plan, since: row.updated_at } : undefined;
}

function refreshProjections(db: DB, learnerId: string, p: SyncedProfile): void {
  const upCompletion = db.prepare(
    `INSERT INTO lesson_completions (learner_id, lesson_id, completed_at, best_xp) VALUES (?,?,?,?)
     ON CONFLICT(learner_id, lesson_id) DO UPDATE SET
       completed_at = COALESCE(MIN(completed_at, excluded.completed_at), excluded.completed_at, completed_at),
       best_xp = MAX(best_xp, excluded.best_xp)`
  );
  for (const [lessonId, lp] of Object.entries(p.lessons ?? {})) {
    if (lp.completed) upCompletion.run(learnerId, lessonId, lp.completedAt ?? null, lp.bestXp ?? 0);
  }
  const upSkill = db.prepare(
    `INSERT INTO skill_evidence (learner_id, tag, mastery, attempts, last_seen, contexts, signals) VALUES (?,?,?,?,?,?,?)
     ON CONFLICT(learner_id, tag) DO UPDATE SET
       mastery = excluded.mastery, attempts = excluded.attempts, last_seen = excluded.last_seen,
       contexts = excluded.contexts, signals = excluded.signals`
  );
  for (const s of Object.values(p.mastery ?? {})) {
    upSkill.run(learnerId, s.tag, s.mastery, s.attempts, s.lastSeen, s.contexts?.length ?? 0, JSON.stringify(s.signals ?? {}));
  }
}

export interface SyncResult {
  profile: SyncedProfile;
  version: number;
}

function parseCachedResult(raw: string): SyncResult | null {
  try {
    const value = JSON.parse(raw) as { profile?: unknown; version?: unknown };
    return Number.isInteger(value.version) && (value.version as number) >= 0 && isSyncedProfile(value.profile)
      ? { profile: value.profile, version: value.version as number }
      : null;
  } catch {
    return null;
  }
}

/** Pull is the one read that can honestly come back EMPTY: an offline-created
 * roster id has no server document until its first push (reads never create
 * ownership). The type says so — no null-hiding casts. */
export interface PullResult {
  profile: SyncedProfile | null;
  version: number;
}

export function pullProfile(db: DB, session: SessionInfo, learnerId: string): PullResult | { error: "forbidden" | "corrupt" } {
  const known = db.prepare("SELECT 1 FROM learners WHERE id = ?").get(learnerId);
  if (!known) {
    // LOCAL-FIRST: the roster was created offline; an unknown id simply has no
    // server document yet. A full account session gets an empty pull (the
    // claim happens on PUSH — reads must not create ownership); a learner-
    // scoped session can never touch ids beyond its own row.
    return session.learnerId ? { error: "forbidden" } : { profile: null, version: 0 };
  }
  if (!canTouchLearner(db, session, learnerId)) return { error: "forbidden" };
  const row = db.prepare("SELECT version, data FROM profiles WHERE learner_id = ?").get(learnerId) as
    | { version: number; data: string }
    | undefined;
  if (!row) return { profile: null, version: 0 };
  const profile = parseStoredProfile(row.data);
  return profile ? { profile, version: row.version } : { error: "corrupt" };
}

/** Merge one pushed document into the durable row. See the header for the
 * five guarantees; each has a test in syncService.s43.test.ts. */
export function pushProfile(
  db: DB,
  session: SessionInfo,
  learnerId: string,
  clientProfile: SyncedProfile,
  idempotencyKey?: string
): SyncResult | { error: "forbidden" } | { error: "conflict" } {
  const exists = db.prepare("SELECT 1 FROM learners WHERE id = ?").get(learnerId);
  if (!exists) {
    // CLAIM ON FIRST PUSH: local-first rosters mint learner ids offline; the
    // first authenticated sync registers the row under the pushing account.
    // High-entropy client ids make collisions negligible; an id that already
    // exists under ANOTHER account falls through to canTouchLearner and is
    // refused — claiming is only ever possible for genuinely new ids.
    if (session.learnerId) return { error: "forbidden" };
    db.prepare("INSERT OR IGNORE INTO learners (id, account_id, name, created_at) VALUES (?,?,?,?)").run(
      learnerId,
      session.user.id,
      clientProfile.displayName ?? "Learner",
      nowIso()
    );
  }
  if (!canTouchLearner(db, session, learnerId)) return { error: "forbidden" };

  const idempotencyScope = `${session.user.id}:${learnerId}`;
  const safeIdempotencyKey = idempotencyKey?.trim().slice(0, 200) || undefined;
  if (safeIdempotencyKey) {
    const hit = db.prepare("SELECT response FROM idempotency_keys WHERE scope = ? AND key = ?").get(idempotencyScope, safeIdempotencyKey) as
      | { response: string }
      | undefined;
    if (hit) return parseCachedResult(hit.response) ?? { error: "conflict" };
  }

  const accountId = (
    db.prepare("SELECT account_id FROM learners WHERE id = ?").get(learnerId) as { account_id: string }
  ).account_id;

  for (let attempt = 0; attempt < 5; attempt++) {
    const row = db.prepare("SELECT version, data FROM profiles WHERE learner_id = ?").get(learnerId) as
      | { version: number; data: string }
      | undefined;
    const server = row ? parseStoredProfile(row.data) : null;
    // Never overwrite a malformed durable record with a guessed merge. Surface
    // a conflict so operators can inspect/recover the row without data loss.
    if (row && !server) return { error: "conflict" };
    const merged = server ? mergeProfiles(server, clientProfile) : clientProfile;

    // ENTITLEMENT CLAMP: the client's word on premium is worth nothing here.
    merged.premium = entitlementFor(db, accountId);
    // The document's rev is the SERVER's version counter, stamped here so the
    // adopted copy and the row can never disagree.
    merged.rev = (row?.version ?? 0) + 1;

    const result: SyncResult = { profile: merged, version: (row?.version ?? 0) + 1 };
    const write = db.transaction((): SyncResult | { error: "conflict" } | null => {
      // Recheck after obtaining the write reservation. Two processes can both
      // miss the optimistic preflight; IMMEDIATE + this lookup guarantees the
      // second one replays the first byte-for-byte instead of bumping again.
      if (safeIdempotencyKey) {
        const replay = db.prepare("SELECT response FROM idempotency_keys WHERE scope = ? AND key = ?")
          .get(idempotencyScope, safeIdempotencyKey) as { response: string } | undefined;
        if (replay) return parseCachedResult(replay.response) ?? { error: "conflict" };
      }
      const changed = row
        ? db
            .prepare("UPDATE profiles SET version = ?, data = ?, updated_at = ? WHERE learner_id = ? AND version = ?")
            .run(result.version, JSON.stringify(merged), nowIso(), learnerId, row.version).changes
        : db
            .prepare("INSERT OR IGNORE INTO profiles (learner_id, version, data, updated_at) VALUES (?,1,?,?)")
            .run(learnerId, JSON.stringify(merged), nowIso()).changes;
      if (changed === 0) return null; // concurrent writer — retry with a fresh read
      refreshProjections(db, learnerId, merged);
      if (safeIdempotencyKey) {
        db.prepare("INSERT INTO idempotency_keys (scope, key, response, created_at) VALUES (?,?,?,?)").run(
          idempotencyScope,
          safeIdempotencyKey,
          JSON.stringify(result),
          nowIso()
        );
      }
      return result;
    });
    const committed = write.immediate();
    if (committed) return committed;
  }
  return { error: "conflict" }; // five concurrent losses in a row: tell the client to retry
}
