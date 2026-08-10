/* Core learning engines. Pure functions only — unit-tested, UI-free. */

/* ---------------- Local dates (midnight-boundary correct) ---------------- */

export function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Strict calendar-date validation. Date.parse normalizes impossible dates
 * (for example 2026-02-31), so API boundaries must round-trip components. */
export function isLocalDateString(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function addDays(day: string, n: number): string {
  const d = new Date(day + "T12:00:00"); // noon avoids DST edge cases
  d.setDate(d.getDate() + n);
  return localDateStr(d);
}

/** ISO week id like "2026-W27" for a local date string. */
export function isoWeek(dayStr: string): string {
  const d = new Date(dayStr + "T12:00:00");
  const dow = (d.getDay() + 6) % 7; // Mon=0
  d.setDate(d.getDate() - dow + 3); // Thursday of this week
  const isoYear = d.getFullYear();
  const jan4 = new Date(isoYear, 0, 4, 12);
  const jan4Dow = (jan4.getDay() + 6) % 7;
  const week1Thu = new Date(isoYear, 0, 4 - jan4Dow + 3, 12);
  const week = 1 + Math.round((d.getTime() - week1Thu.getTime()) / (7 * 86400000));
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

/* ---------------- Spaced review: SM-2-lite (1d / 3d / 7d / 21d) ---------------- */

export const INTERVALS = [1, 3, 7, 21] as const;

export interface ReviewItem {
  key: string; // `${lessonId}:${stepId}`
  conceptTag: string;
  lessonId: string;
  stepId: string;
  box: number; // index of the NEXT interval; graduates past INTERVALS.length - 1
  due: string; // local date string
}

export function onMiss(
  items: ReviewItem[],
  seed: { conceptTag: string; lessonId: string; stepId: string },
  today: string
): ReviewItem[] {
  const key = `${seed.lessonId}:${seed.stepId}`;
  const rest = items.filter((i) => i.key !== key);
  return [...rest, { key, ...seed, box: 0, due: addDays(today, INTERVALS[0]) }];
}

export function onReviewResult(
  items: ReviewItem[],
  key: string,
  correct: boolean,
  today: string
): ReviewItem[] {
  return items.flatMap((i) => {
    if (i.key !== key) return [i];
    if (!correct) return [{ ...i, box: 0, due: addDays(today, INTERVALS[0]) }];
    const box = i.box + 1;
    if (box >= INTERVALS.length) return []; // graduated after the 21-day rep
    return [{ ...i, box, due: addDays(today, INTERVALS[box]) }];
  });
}

export function dueItems(items: ReviewItem[], today: string): ReviewItem[] {
  return items.filter((i) => i.due <= today);
}

/* ---------------- Daily Challenge rotation ---------------- */

const DAILY_EPOCH = Date.parse("2026-01-01T00:00:00Z");

/** Maps a local date string to an authored day 1–30, rotating forever (evergreen). */
export function dailyIndexFor(dateStr: string): number {
  const t = Date.parse(dateStr + "T00:00:00Z");
  const diff = Math.round((t - DAILY_EPOCH) / 86400000);
  return ((diff % 30) + 30) % 30 + 1;
}

/* ---------------- Streaks with one auto-freeze per ISO week ---------------- */

export interface Activity {
  active: string[]; // days with completed activity
  frozen: string[]; // days bridged by a streak freeze
}

/**
 * Streak = number of ACTIVE days in the unbroken run ending today (or yesterday,
 * as grace before today's goal is met). A single missing day may be auto-bridged
 * by a freeze, at most once per ISO week (previously-frozen days count as that
 * week's freeze). Returns any newly applied freezes so the caller can persist them.
 */
export function computeStreak(
  a: Activity,
  today: string
): { streak: number; newlyFrozen: string[] } {
  const active = new Set(a.active);
  const preFrozen = new Set(a.frozen);
  const usedWeeks = new Set([...preFrozen].map(isoWeek));
  const newlyFrozen: string[] = [];

  let cur = active.has(today) ? today : addDays(today, -1);
  let streak = 0;
  // hard stop guards against pathological data
  for (let guard = 0; guard < 3660; guard++) {
    if (active.has(cur)) {
      streak++;
      cur = addDays(cur, -1);
      continue;
    }
    if (preFrozen.has(cur)) {
      cur = addDays(cur, -1);
      continue;
    }
    const wk = isoWeek(cur);
    // Bridge only interior single-day gaps (an active day must sit on the far side).
    if (streak > 0 && !usedWeeks.has(wk) && active.has(addDays(cur, -1))) {
      usedWeeks.add(wk);
      newlyFrozen.push(cur);
      cur = addDays(cur, -1);
      continue;
    }
    break;
  }
  return { streak, newlyFrozen };
}

/* ---------------- XP with decay for retries, hints, reveals ---------------- */

export function xpFor(
  kind: "check" | "challenge" | "interactive",
  attemptsBeforeSuccess: number,
  hintsUsed: number,
  revealed: boolean
): number {
  const base = kind === "challenge" ? 20 : 10;
  let xp: number;
  if (revealed) xp = Math.ceil(base / 10); // 1 or 2 — showing up still counts
  else if (attemptsBeforeSuccess === 0) xp = base;
  else xp = Math.ceil(base / 2);
  xp -= 2 * hintsUsed;
  return Math.max(xp, revealed ? 0 : 1);
}

/* ---------------- Adaptive engine (§3.2 differentiator 3) ---------------- */

export interface AttemptEvent {
  conceptTag: string;
  correct: boolean;
  firstTry: boolean;
}

export type AdaptiveAction =
  | { type: "none" }
  | { type: "remediate"; conceptTag: string }
  | { type: "offerSkip" };

/**
 * - Two consecutive misses on the SAME conceptTag (per-tag history, so interleaved
 *   checks still count) → inject that tag's remedial pair, once per tag.
 * - Two consecutive first-try successes overall → offer a skip-ahead.
 */
export function adaptiveAction(
  history: AttemptEvent[],
  alreadyInjected: string[] = []
): AdaptiveAction {
  const n = history.length;
  if (n === 0) return { type: "none" };
  const last = history[n - 1];

  if (!last.correct && !alreadyInjected.includes(last.conceptTag)) {
    const tagEvents = history.filter((e) => e.conceptTag === last.conceptTag);
    const m = tagEvents.length;
    if (m >= 2 && !tagEvents[m - 1].correct && !tagEvents[m - 2].correct) {
      return { type: "remediate", conceptTag: last.conceptTag };
    }
  }

  if (n >= 2) {
    const prev = history[n - 2];
    if (last.correct && last.firstTry && prev.correct && prev.firstTry) {
      return { type: "offerSkip" };
    }
  }
  return { type: "none" };
}
