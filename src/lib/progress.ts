import { addDays, isoWeek } from "./engine";
import type { Activity, ReviewItem } from "./engine";
import type { SkillState } from "./mastery";
import type { DiagnosticReport, PlacementResponse } from "./placement";
import { DEFAULT_CHILD_ID, LEGACY_PROFILE_KEY, profileKey, ROSTER_KEY } from "./storageKeys";
import { deviceId } from "./device";
import { storageGet, storageSet } from "./safeStorage";
import { isSyncedProfile } from "./sync";

export interface LessonProgress {
  completed: boolean;
  bestXp: number;
  /** Local date of FIRST completion. Powers assignment due-date compliance and
   * weekly-report windows. Absent in profiles written before this field; the
   * sync merge keeps the EARLIEST non-null date (first completion is a fact —
   * it never moves later). */
  completedAt?: string;
}

export interface Onboarding {
  goal: string;
  comfort: number;
  correctCount: number;
  recommendedLessonId: string;
  completedAt: string;
  /** Grade band chosen in onboarding (0=K … 13=Calculus). Absent on profiles
   * onboarded before this field existed — consumers must infer or show all. */
  grade?: number;
}

export interface Profile {
  xp: number;
  activity: Activity;
  review: ReviewItem[];
  lessons: Record<string, LessonProgress>;
  badges: string[];
  /** absent until the user finishes onboarding */
  onboarding?: Onboarding;
  /** first name given in onboarding — personalizes the trail ("David's Trail");
   * absent = the default brand, Maggie's Trail */
  displayName?: string;
  /** id of the chosen portrait from the AVATARS manifest (see ./avatars.ts), e.g. "avatar-101";
   * absent = no selection yet — resolves to the generated-initials/placeholder fallback, never
   * an error state */
  avatarId?: string;
  /** Small non-destructive avatar adornments. Skin and hair remain part of reviewed full portraits. */
  avatarCustomization?: import("./avatars").AvatarCustomization;
  /** lessons-per-day target; absent = 1 */
  dailyGoal?: number;
  /** completions per local date, for the daily-goal ring */
  lessonsByDay?: Record<string, number>;
  /** `${date}:${category}` → answered (right or revealed — showing up counts) */
  dailyDone?: Record<string, boolean>;
  /** XP earned per local date (rolling ~84 days), for the profile graph */
  xpByDay?: Record<string, number>;
  /** weekly league state */
  league?: { week: string; tier: number; weeklyXp: number; lastResult?: "promoted" | "demoted" | "stayed" };
  /** event counters for achievements (reviewSittings, graduated, practiceSweeps, nightOwl, …) */
  counters?: Record<string, number>;
  /** chapterId → passed test-out (one-time XP guard) */
  testouts?: Record<string, boolean>;
  /** per-skill (conceptTag) mastery state, accumulated across every graded check/challenge */
  mastery?: Record<string, SkillState>;
  /** preference: force reduced motion (disable animations) regardless of the OS setting */
  reduceMotion?: boolean;
  /** Adjustable text size — scales the root rem so layout scales coherently.
   *  Absent/"md" = default; "lg"/"xl" step it up. Booted pre-paint alongside
   *  the motion preference (see motionBootstrap). */
  textScale?: "md" | "lg" | "xl";
  /** Open reading spacing — wider letter/word/line spacing on prose for
   *  readers who need it (a dyslexia-friendly measure). Never applied to
   *  equations or stage SVG text. */
  openReading?: boolean;
  /** preference: show mastery-driven "recommended for you" nudges (default true). Off = stay put. */
  followRecs?: boolean;
  /** demo premium state — set by the stubbed checkout, never by real billing */
  premium?: { plan: string; since: string };
  /** Mid-lesson snapshots harvested at sync time so "continue on another
   * device" works: keyed by lessonId; merged by FURTHEST PROGRESS (clock-
   * immune). The per-lesson localStorage keys remain the runtime source. */
  activeLessons?: Record<string, import("./lessonState").LessonSnapshot>;
  /** lessonId → the last completion whose predictions missed. Written at lesson
   * completion, cleared when a re-completion holds every prediction. Feeds the
   * "what surprised you" delayed-retrieval card on the review page. */
  missedPredictions?: Record<string, { missed: number; total: number; at: string }>;
  /** Most recent calibrated placement/benchmark diagnostic. The report keeps uncertainty and
   * domain evidence so future growth is measured against a real baseline rather than a single
   * route decision. */
  diagnostic?: {
    completedAt: string;
    startGrade: number;
    responses: PlacementResponse[];
    report: DiagnosticReport;
  };
  /** earned badge ids live in badges[] (already present) */
  /** S186: per-fact-family leech-box state for fluency courses (see factFluency.ts). Keyed by
   * canonical family ("7x8"), never by lessonId/stepId — the whole point is that every surface
   * of a fact family (7×8, 8×7, 56÷7, 56÷8) across every lesson feeds the SAME entry. Optional
   * and additive: absent until a learner takes their first fluency check; old profiles parse
   * unchanged. Distinct from `review` (which is per lessonId:stepId and never shared across
   * lessons) and from `mastery` (per conceptTag — the SKILL, not the atomic fact). */
  factItems?: Record<string, import("./factFluency").FactItemState>;
  /** S242 / GEN-04: step key → fingerprints of the last 10 generated widgets served, oldest first.
   * The anti-repeat window. Consulted by `drawFreshVariant` so a pool of 400 cannot hand a learner
   * the same problem twice in a row, and merged as a UNION at sync — a problem either device showed
   * is one the learner has seen. Optional and additive: absent until a learner is served their
   * first generated variant, and old profiles parse unchanged. */
  recentVariants?: import("./antiRepeat").RecentDraws;
}

export function emptyProfile(): Profile {
  return {
    xp: 0,
    activity: { active: [], frozen: [] },
    review: [],
    lessons: {},
    badges: []
  };
}

/** Parse a persisted profile without letting malformed storage poison every
 * downstream screen. A tiny compatibility repair supplies `correctStreak` for
 * profiles written before that mastery field existed; everything else must
 * satisfy the same runtime boundary used by authenticated sync. */
export function parseStoredProfile(raw: string): Profile | null {
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const mastery = value.mastery;
    const compatibleMastery =
      mastery && typeof mastery === "object" && !Array.isArray(mastery)
        ? Object.fromEntries(
            Object.entries(mastery as Record<string, unknown>).map(([tag, state]) => [
              tag,
              state && typeof state === "object" && !Array.isArray(state)
                ? { correctStreak: 0, ...(state as Record<string, unknown>) }
                : state
            ])
          )
        : mastery;
    const candidate = { ...emptyProfile(), ...value, ...(compatibleMastery ? { mastery: compatibleMastery } : {}) };
    return isSyncedProfile(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

/** DB-swappable persistence boundary. v1 ships localStorage; server DB slots in later. */
export interface ProgressStore {
  load(): Profile;
  save(p: Profile): void;
}

export class MemoryStore implements ProgressStore {
  private p: Profile = emptyProfile();
  load(): Profile {
    return JSON.parse(JSON.stringify(this.p)) as Profile;
  }
  save(p: Profile): void {
    this.p = JSON.parse(JSON.stringify(p)) as Profile;
  }
}


/** The active child's id, read straight from the roster key (no import cycle with roster.ts). */
function activeChildId(): string {
  if (typeof window === "undefined") return DEFAULT_CHILD_ID;
  try {
    const raw = storageGet(ROSTER_KEY);
    if (raw) {
      const r = JSON.parse(raw) as { activeId?: string };
      if (r.activeId) return r.activeId;
    }
  } catch {
    /* fall through to default */
  }
  return DEFAULT_CHILD_ID;
}

export class LocalStore implements ProgressStore {
  load(): Profile {
    if (typeof window === "undefined") return emptyProfile();
    try {
      const id = activeChildId();
      const key = profileKey(id);
      let raw = storageGet(key);
      // One-time migration: fold the pre-multi-child single profile into the default child.
      if (!raw && id === DEFAULT_CHILD_ID) {
        const legacy = storageGet(LEGACY_PROFILE_KEY);
        if (legacy) {
          storageSet(key, legacy);
          raw = legacy;
        }
      }
      if (!raw) return emptyProfile();
      return parseStoredProfile(raw) ?? emptyProfile();
    } catch {
      return emptyProfile();
    }
  }
  save(p: Profile): void {
    if (typeof window === "undefined") return;
    try {
      // Stamp every local mutation. The sync merge needs an ordering for its last-write-wins
      // fields, and a device id to break ties deterministically. Harmless when sync is unused.
      const stamped = { ...p, updatedAt: new Date().toISOString(), deviceId: deviceId() };
      storageSet(profileKey(activeChildId()), JSON.stringify(stamped));
    } catch {
      /* safeStorage retains the write in memory for this tab */
    }
  }
}

export const progressStore: ProgressStore = new LocalStore();

/** Central XP write: total, per-day graph (pruned), and the league's weekly tally. */
export function applyXp(p: Profile, amount: number, today: string): void {
  if (amount <= 0) return;
  p.xp += amount;
  const byDay = p.xpByDay ?? {};
  byDay[today] = (byDay[today] ?? 0) + amount;
  const cutoff = addDays(today, -84);
  for (const d of Object.keys(byDay)) if (d < cutoff) delete byDay[d];
  p.xpByDay = byDay;
  if (p.league && p.league.week === isoWeek(today)) p.league.weeklyXp += amount;
}

/** Bump a named achievement counter. */
export function bump(p: Profile, key: string, by = 1): void {
  const c = p.counters ?? {};
  c[key] = (c[key] ?? 0) + by;
  p.counters = c;
}
