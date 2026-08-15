/**
 * SYNC CORE — merging one learner's Profile across devices.
 *
 * Why not last-write-wins on the whole profile? Because learning progress is mostly *monotonic
 * accumulation*. A learner does three lessons on the tablet offline; meanwhile the phone syncs a
 * stale profile. Whole-profile LWW would silently erase one device's work — the single worst bug a
 * progress system can have. So this merges FIELD BY FIELD with the semantics each field deserves:
 *
 *   - XP, counters, per-day totals  → max()          (you can never lose XP you earned)
 *   - lessons, badges, testouts     → union / OR     (a completion never un-completes)
 *   - mastery                       → more evidence wins (higher `attempts`)
 *   - review queue                  → per-item, the fresher device wins
 *   - preferences, onboarding       → last-write-wins (genuinely a "latest intent" field)
 *   - premium entitlement           → keep any entitlement (never revoke on a stale merge)
 *
 * The merge is commutative, idempotent, and associative on the monotonic fields; the LWW fields are
 * decided by `updatedAt`, with `deviceId` as a deterministic tiebreak so two devices that write in
 * the same millisecond still converge on the same answer. All of that is unit-tested.
 *
 * This module is pure: no network, no storage, no clock. That's what makes it testable — the
 * transport (syncClient.ts) and the backend (/api/sync) are swappable around it.
 */

import type { Profile } from "./progress";
import type { ReviewItem } from "./engine";
import type { SkillState } from "./mastery";
import type { FactItemState } from "./factFluency";
import { mergeRecentDraws, MAX_TRACKED_STEPS, REPEAT_WINDOW } from "./antiRepeat";

/** Sync metadata carried on a Profile. Absent on profiles created before sync existed. */
export interface SyncMeta {
  /** Server-assigned revision, bumped on each accepted push. Used to detect "am I stale?". */
  rev?: number;
  /** ISO timestamp of the last local mutation. Decides LWW fields. */
  updatedAt?: string;
  /** Stable per-device id, used only as a deterministic tiebreak. */
  deviceId?: string;
}

export type SyncedProfile = Profile & SyncMeta;

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const finiteNonNegative = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
const integerIn = (value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): value is number =>
  Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
const shortString = (value: unknown, max = 300): value is string =>
  typeof value === "string" && value.length <= max;
const strings = (value: unknown, max = 5000): value is string[] =>
  Array.isArray(value) && value.length <= max && value.every((item) => shortString(item));
const boundedRecord = (value: unknown, max = 5000): value is Record<string, unknown> =>
  record(value) && Object.keys(value).length <= max && Object.keys(value).every((key) => key.length <= 300);
const optionalBoolean = (value: unknown): value is boolean | undefined =>
  value === undefined || typeof value === "boolean";

/** Runtime guard for the authenticated sync boundary. TypeScript disappears at
 * runtime; without this, a malformed or hostile JSON document could crash the
 * merge or persist impossible values. Unknown optional fields remain allowed
 * for forward compatibility, while every field the merge or resume path reads
 * is validated and collection sizes are bounded. */
export function isSyncedProfile(value: unknown): value is SyncedProfile {
  if (!record(value) || !finiteNonNegative(value.xp)) return false;

  const activity = value.activity;
  if (!record(activity) || !strings(activity.active) || !strings(activity.frozen)) return false;
  if (!strings(value.badges, 2000) || !Array.isArray(value.review) || value.review.length > 5000) return false;
  if (!boundedRecord(value.lessons)) return false;

  for (const lesson of Object.values(value.lessons)) {
    if (!record(lesson) || typeof lesson.completed !== "boolean" || !finiteNonNegative(lesson.bestXp)) return false;
    if (lesson.completedAt !== undefined && !shortString(lesson.completedAt, 64)) return false;
  }
  for (const item of value.review) {
    if (!record(item) || !shortString(item.key) || !shortString(item.lessonId) || !shortString(item.stepId)) return false;
    if (!shortString(item.conceptTag) || !integerIn(item.box, 0, 20) || !shortString(item.due, 64)) return false;
  }

  for (const map of [value.lessonsByDay, value.xpByDay, value.counters]) {
    if (map === undefined) continue;
    if (!boundedRecord(map) || Object.values(map).some((n) => !finiteNonNegative(n))) return false;
  }
  for (const map of [value.dailyDone, value.testouts]) {
    if (map === undefined) continue;
    if (!boundedRecord(map) || Object.values(map).some((entry) => typeof entry !== "boolean")) return false;
  }

  if (value.mastery !== undefined) {
    if (!boundedRecord(value.mastery)) return false;
    for (const skill of Object.values(value.mastery)) {
      if (!record(skill) || !shortString(skill.tag) || !finiteNonNegative(skill.mastery) || skill.mastery > 1) return false;
      if (!integerIn(skill.attempts, 0) || !integerIn(skill.correctStreak, 0)) return false;
      if (skill.lastSeen !== null && skill.lastSeen !== undefined && !shortString(skill.lastSeen, 64)) return false;
      if (skill.contexts !== undefined && !strings(skill.contexts, 8)) return false;
      if (skill.signals !== undefined) {
        if (!boundedRecord(skill.signals, 100) || Object.values(skill.signals).some((n) => !finiteNonNegative(n))) return false;
      }
    }
  }

  /* S242 / GEN-04. Bounded on BOTH axes at the runtime boundary, because this field grows with use
   * rather than being written once: a hostile or corrupted document could otherwise arrive with a
   * million step keys or a million fingerprints under one, and the merge would faithfully persist
   * it. The bounds are the module's own constants, so widening one there cannot silently outgrow
   * the guard here. */
  if (value.recentVariants !== undefined) {
    if (!boundedRecord(value.recentVariants, MAX_TRACKED_STEPS)) return false;
    for (const window of Object.values(value.recentVariants)) {
      if (!strings(window, REPEAT_WINDOW)) return false;
      if (window.some((fingerprint) => !shortString(fingerprint, 32))) return false;
    }
  }

  if (value.activeLessons !== undefined) {
    if (!boundedRecord(value.activeLessons, 500)) return false;
    for (const snap of Object.values(value.activeLessons)) {
      if (!record(snap) || snap.v !== 1 || !shortString(snap.lessonId) || !strings(snap.stepIds, 100)) return false;
      if (!integerIn(snap.i, 0) || snap.i >= snap.stepIds.length || !finiteNonNegative(snap.sessionXp)) return false;
      if (!Array.isArray(snap.history) || snap.history.length > 1000 || snap.history.some((event) => !record(event))) return false;
      if (!strings(snap.injected, 100) || !shortString(snap.savedAt, 64)) return false;
      if (snap.predictions !== undefined) {
        if (!Array.isArray(snap.predictions) || snap.predictions.length > 1000) return false;
        if (snap.predictions.some((prediction) => !record(prediction) || typeof prediction.held !== "boolean")) return false;
      }
      if (snap.signalCounts !== undefined) {
        if (!boundedRecord(snap.signalCounts, 100) || Object.values(snap.signalCounts).some((n) => !finiteNonNegative(n))) return false;
      }
      if (snap.remediated !== undefined && !strings(snap.remediated, 100)) return false;
    }
  }

  if (value.onboarding !== undefined) {
    const onboarding = value.onboarding;
    if (!record(onboarding) || !shortString(onboarding.goal) || !finiteNonNegative(onboarding.comfort)) return false;
    if (!integerIn(onboarding.correctCount, 0) || !shortString(onboarding.recommendedLessonId) || !shortString(onboarding.completedAt, 64)) return false;
    if (onboarding.grade !== undefined && !integerIn(onboarding.grade, 0, 13)) return false;
  }
  if (value.league !== undefined) {
    const league = value.league;
    if (!record(league) || !shortString(league.week, 64) || !integerIn(league.tier, 0) || !finiteNonNegative(league.weeklyXp)) return false;
    if (league.lastResult !== undefined && !["promoted", "demoted", "stayed"].includes(String(league.lastResult))) return false;
  }
  if (value.premium !== undefined) {
    const premium = value.premium;
    if (!record(premium) || !shortString(premium.plan, 100) || !shortString(premium.since, 64)) return false;
  }
  if (value.missedPredictions !== undefined) {
    if (!boundedRecord(value.missedPredictions, 5000)) return false;
    for (const result of Object.values(value.missedPredictions)) {
      if (!record(result) || !integerIn(result.missed, 0) || !integerIn(result.total, 0)) return false;
      if (result.missed > result.total || !shortString(result.at, 64)) return false;
    }
  }
  if (value.diagnostic !== undefined) {
    const diagnostic = value.diagnostic;
    if (!record(diagnostic) || !shortString(diagnostic.completedAt, 64) || !integerIn(diagnostic.startGrade, 0, 13)) return false;
    if (!Array.isArray(diagnostic.responses) || diagnostic.responses.length > 40) return false;
    for (const response of diagnostic.responses) {
      if (!record(response) || !shortString(response.tag) || !integerIn(response.grade, 0, 13) || typeof response.correct !== "boolean") return false;
      if (response.itemId !== undefined && !shortString(response.itemId)) return false;
      if (response.confidence !== undefined && ![0, 0.5, 1].includes(Number(response.confidence))) return false;
    }
    if (!record(diagnostic.report) || !record(diagnostic.report.overall) || !Array.isArray(diagnostic.report.domainScores)) return false;
    if (!finiteNonNegative(diagnostic.report.overall.scaledScore) || !integerIn(diagnostic.report.estimatedGrade, 0, 13)) return false;
  }

  if (value.displayName !== undefined && !shortString(value.displayName, 200)) return false;
  if (value.avatarId !== undefined && !shortString(value.avatarId, 64)) return false;
  if (value.dailyGoal !== undefined && !integerIn(value.dailyGoal, 1, 100)) return false;
  if (!optionalBoolean(value.reduceMotion) || !optionalBoolean(value.followRecs)) return false;
  if (value.updatedAt !== undefined && !shortString(value.updatedAt, 64)) return false;
  if (value.deviceId !== undefined && !shortString(value.deviceId, 200)) return false;
  if (value.rev !== undefined && !integerIn(value.rev, 0)) return false;
  return true;
}

/** Which side wins a last-write-wins field. Deterministic even on equal timestamps. */
export function lwwWinner(a: SyncedProfile, b: SyncedProfile): "a" | "b" {
  const ta = a.updatedAt ?? "";
  const tb = b.updatedAt ?? "";
  if (ta !== tb) return ta > tb ? "a" : "b";
  // Same instant (or both missing): fall back to device id so both devices agree on the outcome.
  return (a.deviceId ?? "") >= (b.deviceId ?? "") ? "a" : "b";
}

function maxRecord(a: Record<string, number> = {}, b: Record<string, number> = {}): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
}

function orRecord(a: Record<string, boolean> = {}, b: Record<string, boolean> = {}): Record<string, boolean> {
  const out: Record<string, boolean> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = (out[k] ?? false) || v;
  return out;
}

function unionSorted(a: string[] = [], b: string[] = []): string[] {
  return [...new Set([...a, ...b])].sort();
}

function mergeLessons(a: Profile["lessons"], b: Profile["lessons"]): Profile["lessons"] {
  const out: Profile["lessons"] = { ...a };
  for (const [id, lp] of Object.entries(b)) {
    const cur = out[id];
    out[id] = cur
      ? {
          completed: cur.completed || lp.completed,
          bestXp: Math.max(cur.bestXp, lp.bestXp),
          // Earliest first-completion wins — a fact, not a preference.
          ...(cur.completedAt || lp.completedAt
            ? { completedAt: [cur.completedAt, lp.completedAt].filter(Boolean).sort()[0] }
            : {})
        }
      : lp;
  }
  return out;
}

/** More evidence wins. On equal attempts, the more recently seen state wins; then higher mastery,
 * so the result is independent of argument order. */
function mergeSkill(a: SkillState, b: SkillState): SkillState {
  const win =
    a.attempts !== b.attempts
      ? a.attempts > b.attempts
        ? a
        : b
      : (a.lastSeen ?? "") !== (b.lastSeen ?? "")
        ? (a.lastSeen ?? "") > (b.lastSeen ?? "")
          ? a
          : b
        : a.mastery >= b.mastery
          ? a
          : b;
  // Transfer contexts are facts from BOTH devices: union (sorted for
  // commutativity), re-capped at 8, regardless of which snapshot won.
  const union = [...new Set([...(a.contexts ?? []), ...(b.contexts ?? [])])].sort().slice(0, 8);
  return union.length ? { ...win, contexts: union } : win;
}

function mergeMastery(
  a: Record<string, SkillState> = {},
  b: Record<string, SkillState> = {}
): Record<string, SkillState> {
  const out: Record<string, SkillState> = { ...a };
  for (const [tag, st] of Object.entries(b)) {
    const cur = out[tag];
    out[tag] = cur ? mergeSkill(cur, st) : st;
  }
  return out;
}

/**
 * Review items are genuinely stateful (a miss RESETS the box), so "max" would be wrong — it would
 * resurrect a graduated card the learner just missed. The fresher device's version of each card
 * wins; that's the one that saw the most recent answer.
 */
function mergeReview(a: SyncedProfile, b: SyncedProfile): ReviewItem[] {
  const fresher = lwwWinner(a, b) === "a" ? a : b;
  const staler = fresher === a ? b : a;
  const byKey = new Map<string, ReviewItem>();
  for (const it of staler.review ?? []) byKey.set(it.key, it);
  for (const it of fresher.review ?? []) byKey.set(it.key, it); // fresher overwrites
  return [...byKey.values()].sort((x, y) => x.key.localeCompare(y.key));
}

/**
 * S186: per-fact-family leech-box merge. Same reasoning as mergeReview — a fact's box is
 * genuinely stateful (a miss RESETS it), so accumulating/maxing would be wrong: it could
 * resurrect a family the learner just missed on the fresher device. The fresher device's version
 * of each family wins, exactly mirroring mergeReview's fresher/staler split so the two stateful
 * per-key maps in this profile follow one rule rather than two subtly different ones.
 */
function mergeFactItems(a: SyncedProfile, b: SyncedProfile): Record<string, FactItemState> {
  const fresher = lwwWinner(a, b) === "a" ? a : b;
  const staler = fresher === a ? b : a;
  const out: Record<string, FactItemState> = { ...(staler.factItems ?? {}) };
  for (const [key, st] of Object.entries(fresher.factItems ?? {})) out[key] = st; // fresher overwrites
  return out;
}

function mergeLeague(a: SyncedProfile, b: SyncedProfile): Profile["league"] {
  const la = a.league;
  const lb = b.league;
  if (!la) return lb;
  if (!lb) return la;
  // Different weeks: the later week is current. Same week: keep the higher weekly XP.
  if (la.week !== lb.week) return la.week > lb.week ? la : lb;
  return la.weeklyXp >= lb.weeklyXp ? la : lb;
}

/**
 * Merge two versions of the SAME learner's profile. Commutative and idempotent:
 *   merge(a, b) === merge(b, a)   and   merge(a, a) === a
 */
/** Cross-device "continue where you left off": per lesson, the snapshot with
 * the FURTHEST PROGRESS wins — higher step index, then higher session XP.
 * Progress comparison is clock-immune (device clocks can drift; a step count
 * cannot), which is exactly why timestamps are not consulted here. */
export function mergeActiveLessons(
  a: Profile["activeLessons"],
  b: Profile["activeLessons"]
): Profile["activeLessons"] {
  if (!a && !b) return undefined;
  const out: NonNullable<Profile["activeLessons"]> = { ...(a ?? {}) };
  for (const [id, snap] of Object.entries(b ?? {})) {
    const cur = out[id];
    out[id] = !cur || snap.i > cur.i || (snap.i === cur.i && snap.sessionXp > cur.sessionXp) ? snap : cur;
  }
  return out;
}

export function mergeProfiles(a: SyncedProfile, b: SyncedProfile): SyncedProfile {
  const prefsFrom = lwwWinner(a, b) === "a" ? a : b;

  const lessons = mergeLessons(a.lessons, b.lessons);
  // A COMPLETED lesson has no active snapshot: completion clears the local
  // key, but earlier pushes left the snapshot in the server document — without
  // this prune every later sync resurrects it, and a replay of a finished
  // lesson resumes mid-way with stale XP. Pruning against the MERGED lessons
  // map keeps the rule commutative and cleans the durable doc permanently on
  // the next push from any device.
  const active = mergeActiveLessons(a.activeLessons, b.activeLessons);
  const activeLessons =
    active &&
    Object.fromEntries(Object.entries(active).filter(([id]) => !lessons[id]?.completed));

  return {
    // ---- monotonic: accumulate, never lose ----
    xp: Math.max(a.xp, b.xp),
    lessons,
    badges: unionSorted(a.badges, b.badges),
    activity: {
      active: unionSorted(a.activity?.active, b.activity?.active),
      frozen: unionSorted(a.activity?.frozen, b.activity?.frozen)
    },
    lessonsByDay: maxRecord(a.lessonsByDay, b.lessonsByDay),
    xpByDay: maxRecord(a.xpByDay, b.xpByDay),
    dailyDone: orRecord(a.dailyDone, b.dailyDone),
    testouts: orRecord(a.testouts, b.testouts),
    counters: maxRecord(a.counters, b.counters),

    // ---- evidence-weighted ----
    mastery: mergeMastery(a.mastery, b.mastery),

    // ---- stateful ----
    review: mergeReview(a, b),
    league: mergeLeague(a, b),
    ...((a.factItems || b.factItems) ? { factItems: mergeFactItems(a, b) } : {}),
    /* S242 / GEN-04. The anti-repeat window merges as a UNION, not last-write-wins: a problem
     * either device served is one the learner has SEEN, and letting the fresher document win would
     * silently un-see everything the other device showed — the precise repeat the window exists to
     * prevent. `mergeRecentDraws` is commutative up to the window trim, like every rule here. */
    ...((a.recentVariants || b.recentVariants)
      ? {
          recentVariants: mergeRecentDraws(
            lwwWinner(a, b) === "a" ? a.recentVariants : b.recentVariants,
            lwwWinner(a, b) === "a" ? b.recentVariants : a.recentVariants
          )
        }
      : {}),
    activeLessons: activeLessons && Object.keys(activeLessons).length ? activeLessons : undefined,

    // ---- last-write-wins (a genuine "latest intent") ----
    displayName: prefsFrom.displayName ?? a.displayName ?? b.displayName,
    avatarId: prefsFrom.avatarId ?? a.avatarId ?? b.avatarId,
    onboarding: prefsFrom.onboarding ?? a.onboarding ?? b.onboarding,
    dailyGoal: prefsFrom.dailyGoal ?? a.dailyGoal ?? b.dailyGoal,
    reduceMotion: prefsFrom.reduceMotion ?? a.reduceMotion ?? b.reduceMotion,
    followRecs: prefsFrom.followRecs ?? a.followRecs ?? b.followRecs,
    diagnostic: prefsFrom.diagnostic ?? a.diagnostic ?? b.diagnostic,

    // ---- entitlement: never revoke on a stale merge ----
    premium: a.premium ?? b.premium,

    // ---- sync metadata ----
    rev: Math.max(a.rev ?? 0, b.rev ?? 0),
    updatedAt: (a.updatedAt ?? "") > (b.updatedAt ?? "") ? a.updatedAt : b.updatedAt,
    deviceId: prefsFrom.deviceId
  };
}

/** True if `local` has changes the server hasn't accepted (so a push is worth making). */
export function needsPush(local: SyncedProfile, serverRev: number): boolean {
  return (local.rev ?? 0) <= serverRev ? hasLocalEdits(local) : true;
}

/** A profile is "dirty" if it was mutated after the last successful sync stamped it. */
function hasLocalEdits(p: SyncedProfile & { syncedAt?: string }): boolean {
  const synced = (p as { syncedAt?: string }).syncedAt;
  if (!synced) return true;
  return (p.updatedAt ?? "") > synced;
}
