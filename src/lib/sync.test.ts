import { describe, expect, it } from "vitest";
import { isSyncedProfile, lwwWinner, mergeProfiles, type SyncedProfile } from "./sync";
import { emptyProfile } from "./progress";

function p(over: Partial<SyncedProfile> = {}): SyncedProfile {
  return { ...emptyProfile(), updatedAt: "2026-01-01T00:00:00.000Z", deviceId: "dev-a", ...over };
}

describe("mergeProfiles — algebraic properties", () => {
  it("is idempotent: merging a profile with itself changes nothing meaningful", () => {
    const a = p({ xp: 120, badges: ["first-lesson"], lessons: { "l1": { completed: true, bestXp: 30 } } });
    const m = mergeProfiles(a, a);
    expect(m.xp).toBe(120);
    expect(m.badges).toEqual(["first-lesson"]);
    expect(m.lessons).toEqual(a.lessons);
  });

  it("is commutative on the monotonic fields", () => {
    const a = p({ xp: 100, badges: ["b1"], counters: { reviewSittings: 3 }, deviceId: "dev-a" });
    const b = p({ xp: 40, badges: ["b2"], counters: { reviewSittings: 5 }, deviceId: "dev-b" });
    const ab = mergeProfiles(a, b);
    const ba = mergeProfiles(b, a);
    expect(ab.xp).toBe(ba.xp);
    expect(ab.badges).toEqual(ba.badges);
    expect(ab.counters).toEqual(ba.counters);
  });

  it("breaks LWW ties deterministically by deviceId, so both devices converge", () => {
    const a = p({ deviceId: "dev-a", dailyGoal: 2, avatarId: "avatar-002" });
    const b = p({ deviceId: "dev-b", dailyGoal: 5, avatarId: "avatar-101" }); // identical updatedAt
    // lwwWinner returns a POSITIONAL label, so resolve it to the actual profile before comparing.
    const winnerOf = (x: SyncedProfile, y: SyncedProfile) => (lwwWinner(x, y) === "a" ? x : y);
    expect(winnerOf(a, b).deviceId).toBe(winnerOf(b, a).deviceId); // same device wins either way
    expect(mergeProfiles(a, b).dailyGoal).toBe(mergeProfiles(b, a).dailyGoal);
    expect(mergeProfiles(a, b).avatarId).toBe(mergeProfiles(b, a).avatarId);
  });

  it("avatarId: last-write-wins, mirroring displayName", () => {
    const older = p({ updatedAt: "2026-03-01T08:00:00.000Z", avatarId: "avatar-002" });
    const fresher = p({ updatedAt: "2026-03-02T08:00:00.000Z", avatarId: "avatar-101" });
    expect(mergeProfiles(older, fresher).avatarId).toBe("avatar-101");
    expect(mergeProfiles(fresher, older).avatarId).toBe("avatar-101"); // order-independent
  });

  it("avatar customization follows the same latest-intent merge as the selected avatar", () => {
    const older = p({
      updatedAt: "2026-03-01T08:00:00.000Z",
      avatarCustomization: { glasses: "none", accent: "navy", badge: "none" }
    });
    const fresher = p({
      updatedAt: "2026-03-02T08:00:00.000Z",
      avatarCustomization: { glasses: "round", accent: "teal", badge: "pi" }
    });
    expect(mergeProfiles(older, fresher).avatarCustomization).toEqual(fresher.avatarCustomization);
    expect(mergeProfiles(fresher, older).avatarCustomization).toEqual(fresher.avatarCustomization);
  });
});

describe("mergeProfiles — the bug this exists to prevent", () => {
  it("NEVER loses XP or completions earned offline on another device", () => {
    // Tablet, offline: learner finishes two lessons.
    const tablet = p({
      deviceId: "tablet",
      updatedAt: "2026-03-01T10:00:00.000Z",
      xp: 260,
      lessons: { "l1": { completed: true, bestXp: 30 }, "l2": { completed: true, bestXp: 25 } },
      badges: ["first-lesson", "perfect-lesson"],
      xpByDay: { "2026-03-01": 55 }
    });
    // Phone, meanwhile: stale, only knows about the first lesson. Syncs LATER (newer timestamp).
    const phone = p({
      deviceId: "phone",
      updatedAt: "2026-03-01T11:00:00.000Z", // newer! whole-profile LWW would erase the tablet
      xp: 30,
      lessons: { "l1": { completed: true, bestXp: 30 } },
      badges: ["first-lesson"],
      xpByDay: { "2026-03-01": 30 }
    });

    const m = mergeProfiles(phone, tablet);
    expect(m.xp).toBe(260); // not 30 — the newer-but-stale device does not win
    expect(m.lessons["l2"].completed).toBe(true);
    expect(m.badges).toEqual(["first-lesson", "perfect-lesson"]);
    expect(m.xpByDay!["2026-03-01"]).toBe(55);
  });

  it("keeps the best score per lesson and unions streak days", () => {
    const a = p({ lessons: { l1: { completed: true, bestXp: 20 } }, activity: { active: ["2026-03-01"], frozen: [] } });
    const b = p({ lessons: { l1: { completed: true, bestXp: 45 } }, activity: { active: ["2026-03-02"], frozen: ["2026-03-03"] } });
    const m = mergeProfiles(a, b);
    expect(m.lessons.l1.bestXp).toBe(45);
    expect(m.activity.active).toEqual(["2026-03-01", "2026-03-02"]);
    expect(m.activity.frozen).toEqual(["2026-03-03"]);
  });

  it("never revokes a premium entitlement just because the other device didn't know about it", () => {
    const paid = p({ premium: { plan: "family", since: "2026-02-01" } });
    const unaware = p({ updatedAt: "2026-09-09T00:00:00.000Z" }); // newer, but no premium
    expect(mergeProfiles(unaware, paid).premium?.plan).toBe("family");
    expect(mergeProfiles(paid, unaware).premium?.plan).toBe("family");
  });
});

describe("mergeProfiles — stateful fields", () => {
  it("mastery: more evidence wins, not the newer write", () => {
    const few = p({ mastery: { "add-ten": { tag: "add-ten", mastery: 0.9, attempts: 1, correctStreak: 1, lastSeen: "2026-03-02" } } });
    const many = p({ mastery: { "add-ten": { tag: "add-ten", mastery: 0.6, attempts: 12, correctStreak: 0, lastSeen: "2026-03-01" } } });
    expect(mergeProfiles(few, many).mastery!["add-ten"].attempts).toBe(12);
    expect(mergeProfiles(many, few).mastery!["add-ten"].attempts).toBe(12);
  });

  it("review: a miss that RESETS a card is respected — the fresher device wins, not the higher box", () => {
    const older = p({
      updatedAt: "2026-03-01T08:00:00.000Z",
      review: [{ key: "l1:k1", conceptTag: "t", lessonId: "l1", stepId: "k1", box: 3, due: "2026-03-20" }]
    });
    // Learner then MISSED it — box reset to 0. A naive max() would resurrect box 3.
    const fresher = p({
      updatedAt: "2026-03-02T08:00:00.000Z",
      review: [{ key: "l1:k1", conceptTag: "t", lessonId: "l1", stepId: "k1", box: 0, due: "2026-03-03" }]
    });
    const m = mergeProfiles(older, fresher);
    expect(m.review).toHaveLength(1);
    expect(m.review[0].box).toBe(0);
    expect(m.review[0].due).toBe("2026-03-03");
  });

  it("league: later week wins; within a week, the higher weekly XP wins", () => {
    const w1 = p({ league: { week: "2026-W09", tier: 2, weeklyXp: 300 } });
    const w2 = p({ league: { week: "2026-W10", tier: 2, weeklyXp: 40 } });
    expect(mergeProfiles(w1, w2).league!.week).toBe("2026-W10");

    const lo = p({ league: { week: "2026-W10", tier: 2, weeklyXp: 40 } });
    const hi = p({ league: { week: "2026-W10", tier: 2, weeklyXp: 190 } });
    expect(mergeProfiles(lo, hi).league!.weeklyXp).toBe(190);
  });

  it("factItems (S186): a miss that RESETS a fact's box is respected — fresher device wins, not the higher box", () => {
    const older = p({
      updatedAt: "2026-03-01T08:00:00.000Z",
      factItems: { "7x8": { family: "7x8", box: 3, due: "2026-03-20", misses: 1, correctStreak: 3, lastSeen: "2026-03-01" } }
    });
    // Learner then MISSED 7×8 on the other device — box reset to 0. A naive max() would resurrect box 3.
    const fresher = p({
      updatedAt: "2026-03-02T08:00:00.000Z",
      factItems: { "7x8": { family: "7x8", box: 0, due: "2026-03-03", misses: 2, correctStreak: 0, lastSeen: "2026-03-02" } }
    });
    const m = mergeProfiles(older, fresher);
    expect(m.factItems!["7x8"].box).toBe(0);
    expect(m.factItems!["7x8"].misses).toBe(2);
  });

  it("factItems: families present on only one device survive the merge untouched", () => {
    const a = p({ factItems: { "2x2": { family: "2x2", box: 1, due: "2026-03-05", misses: 0, correctStreak: 1, lastSeen: "2026-03-01" } } });
    const b = p({ factItems: { "9x9": { family: "9x9", box: 2, due: "2026-03-06", misses: 1, correctStreak: 0, lastSeen: "2026-03-01" } } });
    const m = mergeProfiles(a, b);
    expect(m.factItems!["2x2"].box).toBe(1);
    expect(m.factItems!["9x9"].box).toBe(2);
  });

  it("factItems: absent entirely when neither device has any (old profiles stay old)", () => {
    const m = mergeProfiles(p(), p({ deviceId: "dev-b" }));
    expect(m.factItems).toBeUndefined();
  });

  it("factItems: commutative — merge(a,b) equals merge(b,a) regardless of argument order", () => {
    const a = p({ updatedAt: "2026-03-01T08:00:00.000Z", factItems: { "3x4": { family: "3x4", box: 2, due: "2026-03-10", misses: 0, correctStreak: 2, lastSeen: "2026-03-01" } } });
    const b = p({ updatedAt: "2026-03-02T08:00:00.000Z", factItems: { "3x4": { family: "3x4", box: 0, due: "2026-03-03", misses: 3, correctStreak: 0, lastSeen: "2026-03-02" } } });
    expect(mergeProfiles(a, b).factItems).toEqual(mergeProfiles(b, a).factItems);
  });
});

describe("REGRESSION s46: completed lessons cannot resurrect as active", () => {
  const snap = {
    v: 1 as const, lessonId: "l1", stepIds: ["a", "b"], i: 1, sessionXp: 10,
    history: [], injected: [], savedAt: "2026-07-17T10:00:00.000Z"
  };
  const base = (over: Partial<SyncedProfile>): SyncedProfile => ({
    xp: 0, activity: { active: [], frozen: [] }, review: [], lessons: {}, badges: [],
    updatedAt: "2026-07-17T10:00:00.000Z", deviceId: "devA", ...over
  });

  it("mergeProfiles prunes an active snapshot for a lesson EITHER side has completed", () => {
    // Device A finished l1 (its local snapshot was cleared at completion);
    // the server doc still carries the mid-lesson snapshot from an earlier
    // push. The merged document must not keep serving it back forever.
    const finishedA = base({ lessons: { l1: { completed: true, bestXp: 60, completedAt: "2026-07-17" } } });
    const staleServer = base({ deviceId: "srv", activeLessons: { l1: snap, l2: { ...snap, lessonId: "l2" } } });
    const merged = mergeProfiles(finishedA, staleServer);
    expect(merged.activeLessons?.l1).toBeUndefined(); // completed → pruned
    expect(merged.activeLessons?.l2).toBeDefined(); // untouched lessons keep theirs
    // and the prune is commutative, like every other merge rule
    const mergedBA = mergeProfiles(staleServer, finishedA);
    expect(mergedBA.activeLessons?.l1).toBeUndefined();
  });
});


describe("isSyncedProfile — authenticated trust boundary", () => {
  it("accepts a valid current profile, including resumable lesson state", () => {
    const valid = p({
      avatarId: "avatar-101",
      avatarCustomization: { glasses: "round", accent: "teal", badge: "pi" },
      mastery: {
        fractions: {
          tag: "fractions", mastery: 0.72, attempts: 8, correctStreak: 2,
          lastSeen: "2026-07-22", signals: { "wrong-direction": 1 }, contexts: ["l1", "l2"]
        }
      },
      activeLessons: {
        l1: {
          v: 1, lessonId: "l1", stepIds: ["s1", "s2"], i: 1, sessionXp: 10,
          history: [], injected: [], savedAt: "2026-07-22T10:00:00.000Z"
        }
      }
    });
    expect(isSyncedProfile(valid)).toBe(true);
  });

  it.each([
    ["negative xp", { xp: -1 }],
    ["impossible mastery", { mastery: { x: { tag: "x", mastery: 1.2, attempts: 1, correctStreak: 1, lastSeen: null } } }],
    ["negative attempts", { mastery: { x: { tag: "x", mastery: 0.5, attempts: -1, correctStreak: 0, lastSeen: null } } }],
    ["invalid league", { league: { week: "2026-W30", tier: 1, weeklyXp: 5, lastResult: "teleported" } }],
    ["out-of-range resume index", { activeLessons: { l1: { v: 1, lessonId: "l1", stepIds: ["s1"], i: 1, sessionXp: 0, history: [], injected: [], savedAt: "now" } } }],
    ["impossible prediction totals", { missedPredictions: { l1: { missed: 4, total: 3, at: "2026-07-22" } } }],
    ["wrong preference type", { reduceMotion: "yes" }],
    ["wrong avatarId type", { avatarId: 123 }],
    ["invalid avatar customization", { avatarCustomization: { glasses: "huge", accent: "teal", badge: "pi" } }]
  ])("rejects %s", (_label, patch) => {
    expect(isSyncedProfile({ ...p(), ...patch })).toBe(false);
  });
});
