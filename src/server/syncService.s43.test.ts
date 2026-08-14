/**
 * SYNC SERVICE (s43) — the mandate's conflict matrix, each row a test:
 *
 *   two devices complete different lessons   → union, earliest completedAt
 *   mastery updated independently            → evidence-aware winner + context union
 *   continue a lesson on another device      → furthest progress wins (clock-immune)
 *   review touched offline and online        → per-item freshest, idempotent replay
 *   profile renamed on one device            → the rename survives the merge
 *   entitlement flipped while offline        → the client's word is discarded;
 *                                              the subscriptions row grants and revokes
 *   clock drift                              → educational fields never consult clocks
 *   server retries / duplicate requests      → byte-identical replay, single version bump
 *   a stranger's session                     → forbidden, pull and push alike
 *
 * All of it runs on the real SQLite schema through the real auth service.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, openDb, type DB } from "@/server/db";
import { addLearner, login, sessionFor, signup, type SessionInfo } from "@/server/authService";
import { pullProfile, pushProfile } from "@/server/syncService";
import type { SyncedProfile } from "@/lib/sync";
import { emptySkill } from "@/lib/mastery";

let dir: string;
let db: DB;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-sync-"));
  db = openDb(join(dir, "t.db"));
  migrate(db);
});
afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

function makeFamily(): { session: SessionInfo; learnerId: string; accountId: string } {
  signup(db, "p@x.com", "pw-one-two");
  const r = login(db, "p@x.com", "pw-one-two");
  if ("error" in r) throw new Error("login failed");
  const session = sessionFor(db, r.token)!;
  const { learnerId } = addLearner(db, session.user.id, "Ana");
  return { session, learnerId, accountId: session.user.id };
}

const base = (over: Partial<SyncedProfile>): SyncedProfile => ({
  xp: 0,
  activity: { active: [], frozen: [] },
  review: [],
  lessons: {},
  badges: [],
  updatedAt: "2026-07-17T10:00:00.000Z",
  deviceId: "devA",
  ...over
});

const ok = (r: ReturnType<typeof pushProfile>): { profile: SyncedProfile; version: number } => {
  if ("error" in r) throw new Error(`unexpected ${r.error}`);
  return r;
};

describe("the conflict matrix", () => {
  it("two devices, different lessons: union of completions, earliest completedAt, max XP", () => {
    const { session, learnerId } = makeFamily();
    const devA = base({ xp: 100, lessons: { l1: { completed: true, bestXp: 60, completedAt: "2026-07-15" } } });
    const devB = base({
      xp: 80,
      deviceId: "devB",
      lessons: {
        l1: { completed: true, bestXp: 40, completedAt: "2026-07-14" }, // same lesson, earlier elsewhere
        l2: { completed: true, bestXp: 50, completedAt: "2026-07-16" }
      }
    });
    ok(pushProfile(db, session, learnerId, devA));
    const merged = ok(pushProfile(db, session, learnerId, devB)).profile;
    expect(Object.keys(merged.lessons).sort()).toEqual(["l1", "l2"]);
    expect(merged.lessons.l1).toMatchObject({ bestXp: 60, completedAt: "2026-07-14" });
    expect(merged.xp).toBe(100);
    // and the projection rows exist for teacher queries
    expect(db.prepare("SELECT COUNT(*) c FROM lesson_completions WHERE learner_id = ?").get(learnerId)).toEqual({ c: 2 });
  });

  it("mastery updated independently: more evidence wins, transfer contexts union", () => {
    const { session, learnerId } = makeFamily();
    const skillA = { ...emptySkill("frac"), attempts: 6, mastery: 0.8, lastSeen: "2026-07-16", contexts: ["l1"] };
    const skillB = { ...emptySkill("frac"), attempts: 4, mastery: 0.9, lastSeen: "2026-07-17", contexts: ["l2"] };
    ok(pushProfile(db, session, learnerId, base({ mastery: { frac: skillA } })));
    const merged = ok(pushProfile(db, session, learnerId, base({ deviceId: "devB", mastery: { frac: skillB } }))).profile;
    expect(merged.mastery?.frac.attempts).toBe(6); // evidence count outranks recency
    expect(merged.mastery?.frac.contexts).toEqual(["l1", "l2"]); // transfer facts from both devices
    expect(db.prepare("SELECT contexts FROM skill_evidence WHERE learner_id = ? AND tag='frac'").get(learnerId)).toEqual({
      contexts: 2
    });
  });

  it("continue on another device: the FURTHER snapshot wins regardless of clocks", () => {
    const { session, learnerId } = makeFamily();
    const snapEarly = { v: 1 as const, lessonId: "l9", stepIds: ["a", "b", "c"], i: 1, sessionXp: 10, history: [], injected: [], savedAt: "2026-07-17T12:00:00.000Z" };
    const snapFar = { ...snapEarly, i: 2, sessionXp: 25, savedAt: "2026-07-16T08:00:00.000Z" }; // earlier clock, further progress
    // The FAR device has the EARLIER wall clock — progress must still win.
    ok(pushProfile(db, session, learnerId, base({ updatedAt: "2026-07-17T12:00:00.000Z", activeLessons: { l9: snapEarly } })));
    const merged = ok(
      pushProfile(db, session, learnerId, base({ deviceId: "devB", updatedAt: "2026-07-16T08:00:00.000Z", activeLessons: { l9: snapFar } }))
    ).profile;
    expect(merged.activeLessons?.l9.i).toBe(2);
    expect(merged.activeLessons?.l9.sessionXp).toBe(25);
  });

  it("a rename on one device survives the merge (the displayName fix)", () => {
    const { session, learnerId } = makeFamily();
    ok(pushProfile(db, session, learnerId, base({ updatedAt: "2026-07-17T09:00:00.000Z" })));
    const merged = ok(
      pushProfile(db, session, learnerId, base({ deviceId: "devB", updatedAt: "2026-07-17T11:00:00.000Z", displayName: "Ana Banana" }))
    ).profile;
    expect(merged.displayName).toBe("Ana Banana");
  });

  it("an avatar chosen on one device survives the merge (the avatarId fix)", () => {
    const { session, learnerId } = makeFamily();
    ok(pushProfile(db, session, learnerId, base({ updatedAt: "2026-07-17T09:00:00.000Z" })));
    const merged = ok(
      pushProfile(db, session, learnerId, base({ deviceId: "devB", updatedAt: "2026-07-17T11:00:00.000Z", avatarId: "avatar-101" }))
    ).profile;
    expect(merged.avatarId).toBe("avatar-101");
  });

  it("entitlement is server-authoritative: client premium discarded; the row grants and revokes", () => {
    const { session, learnerId, accountId } = makeFamily();
    // Device claims premium out of thin air → discarded.
    let merged = ok(pushProfile(db, session, learnerId, base({ premium: { plan: "family", since: "2026-01-01" } }))).profile;
    expect(merged.premium).toBeUndefined();
    // A live subscription row grants it on the next sync.
    db.prepare(
      "INSERT INTO subscriptions (user_id, plan, status, current_period_end, updated_at) VALUES (?,?,?,?,?)"
    ).run(accountId, "family", "active", "2027-01-01T00:00:00.000Z", "2026-07-01T00:00:00.000Z");
    merged = ok(pushProfile(db, session, learnerId, base({}))).profile;
    expect(merged.premium?.plan).toBe("family");
    // Expiry revokes it, whatever the client still believes.
    db.prepare("UPDATE subscriptions SET current_period_end = '2026-07-01T00:00:00.000Z'").run();
    merged = ok(pushProfile(db, session, learnerId, base({ premium: { plan: "family", since: "2026-07-01" } }))).profile;
    expect(merged.premium).toBeUndefined();
  });

  it("clock drift cannot deflate education: a future-clocked device with less work loses nothing for anyone", () => {
    const { session, learnerId } = makeFamily();
    ok(pushProfile(db, session, learnerId, base({ xp: 200, lessons: { l1: { completed: true, bestXp: 90 } } })));
    const drifted = base({ deviceId: "devB", updatedAt: "2027-01-01T00:00:00.000Z", xp: 5 }); // clock a year fast, work behind
    const merged = ok(pushProfile(db, session, learnerId, drifted)).profile;
    expect(merged.xp).toBe(200); // max, not "latest"
    expect(merged.lessons.l1?.completed).toBe(true); // union, not "latest"
  });

  it("duplicate requests replay byte-identically and bump the version once", () => {
    const { session, learnerId } = makeFamily();
    const body = base({ xp: 50 });
    const first = ok(pushProfile(db, session, learnerId, body, "idem-123"));
    const replay = ok(pushProfile(db, session, learnerId, body, "idem-123"));
    expect(replay).toEqual(first);
    expect(ok(pullProfile(db, session, learnerId) as never).version).toBe(1); // one bump, not two
  });


  it("scopes identical idempotency keys to the authenticated account and learner", () => {
    const first = makeFamily();
    const a = ok(pushProfile(db, first.session, first.learnerId, base({ xp: 111 }), "shared-key"));

    signup(db, "second@x.com", "pw-one-two");
    const login2 = login(db, "second@x.com", "pw-one-two");
    if ("error" in login2) throw new Error("login failed");
    const secondSession = sessionFor(db, login2.token)!;
    const { learnerId: secondLearner } = addLearner(db, secondSession.user.id, "Bo");
    const b = ok(pushProfile(db, secondSession, secondLearner, base({ xp: 222 }), "shared-key"));

    expect(a.profile.xp).toBe(111);
    expect(b.profile.xp).toBe(222);
    expect(b).not.toEqual(a);
  });

  it("review merges per item by freshness and replays idempotently", () => {
    const { session, learnerId } = makeFamily();
    const item = { key: "l1:k1", conceptTag: "t", lessonId: "l1", stepId: "k1", box: 1, due: "2026-07-20" };
    ok(pushProfile(db, session, learnerId, base({ review: [item], updatedAt: "2026-07-17T09:00:00.000Z" })));
    // The online device reviewed it (box advanced) with a fresher stamp.
    const reviewed = { ...item, box: 2, due: "2026-07-27" };
    const merged = ok(
      pushProfile(db, session, learnerId, base({ deviceId: "devB", review: [reviewed], updatedAt: "2026-07-17T10:00:00.000Z" }), "rev-1")
    ).profile;
    expect(merged.review).toEqual([reviewed]);
    const replay = ok(
      pushProfile(db, session, learnerId, base({ deviceId: "devB", review: [reviewed], updatedAt: "2026-07-17T10:00:00.000Z" }), "rev-1")
    ).profile;
    expect(replay.review).toEqual([reviewed]); // no duplication, no regression
  });

  it("local-first onboarding: an account CLAIMS its offline-minted learner on first push; a stranger cannot re-claim", () => {
    const { session } = makeFamily();
    const offlineId = "child-uuid-minted-offline";
    // Pull before any push: unknown id → empty document, nothing created.
    const pulled = pullProfile(db, session, offlineId);
    expect("error" in pulled ? null : pulled.version).toBe(0);
    expect(db.prepare("SELECT COUNT(*) c FROM learners WHERE id = ?").get(offlineId)).toEqual({ c: 0 });
    // First push claims the row under this account.
    const r = ok(pushProfile(db, session, offlineId, base({ displayName: "Mia", xp: 30 })));
    expect(r.profile.rev).toBe(1); // the server stamps its own version into the doc
    expect(db.prepare("SELECT account_id FROM learners WHERE id = ?").get(offlineId)).toEqual({
      account_id: session.user.id
    });
    // Another account can neither push to nor pull that id now.
    signup(db, "rival@x.com", "pw-one-two");
    const rr = login(db, "rival@x.com", "pw-one-two");
    if ("error" in rr) throw new Error("login failed");
    const rival = sessionFor(db, rr.token)!;
    expect(pushProfile(db, rival, offlineId, base({}))).toEqual({ error: "forbidden" });
    expect(pullProfile(db, rival, offlineId)).toEqual({ error: "forbidden" });
  });

  it("a stranger's session is forbidden from pull and push alike", () => {
    const { learnerId } = makeFamily();
    signup(db, "stranger@x.com", "pw-one-two");
    const r = login(db, "stranger@x.com", "pw-one-two");
    if ("error" in r) throw new Error("login failed");
    const stranger = sessionFor(db, r.token)!;
    expect(pullProfile(db, stranger, learnerId)).toEqual({ error: "forbidden" });
    expect(pushProfile(db, stranger, learnerId, base({}))).toEqual({ error: "forbidden" });
  });
});
