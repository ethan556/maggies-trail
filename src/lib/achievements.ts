import type { Profile } from "./progress";
import type { IconName } from "@/components/ui";

/** Achievements (P5): pure checks over the profile; two badges need course context. */

export interface BadgeCtx {
  courses?: Array<{ slug: string; lessonIds: string[] }>;
}

export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  /** Owned product icon. Achievement surfaces render this through the shared AppIcon system. */
  icon: IconName;
  check: (p: Profile, ctx?: BadgeCtx) => boolean;
}

function doneCount(p: Profile): number {
  return Object.keys(p.lessons).filter((id) => p.lessons[id].completed).length;
}

function streakLen(p: Profile): number {
  // longest run anywhere in activity (cheap, order-independent enough for badges):
  const days = new Set([...p.activity.active, ...p.activity.frozen]);
  let best = 0;
  for (const d of days) {
    // count only run STARTS (previous day absent) to stay O(n)
    const prev = shiftDate(d, -1);
    if (days.has(prev)) continue;
    let len = 0;
    let cur = d;
    while (days.has(cur)) {
      len++;
      cur = shiftDate(cur, 1);
    }
    best = Math.max(best, len);
  }
  return best;
}

function shiftDate(dateStr: string, by: number): string {
  const t = new Date(dateStr + "T12:00:00Z");
  t.setUTCDate(t.getUTCDate() + by);
  return t.toISOString().slice(0, 10);
}

function courseDone(p: Profile, ctx: BadgeCtx | undefined, slug: string): boolean {
  const course = ctx?.courses?.find((c) => c.slug === slug);
  if (!course || course.lessonIds.length === 0) return false;
  return course.lessonIds.every((id) => p.lessons[id]?.completed);
}

export const BADGES: BadgeDef[] = [
  { id: "first-step", name: "First Step", desc: "Finish your first lesson.", icon: "icon-101",
    check: (p) => doneCount(p) >= 1 },
  { id: "five-lessons", name: "Finding Your Stride", desc: "Finish 5 lessons.", icon: "icon-002",
    check: (p) => doneCount(p) >= 5 },
  { id: "fifteen-lessons", name: "Trail Regular", desc: "Finish 15 lessons.", icon: "icon-004",
    check: (p) => doneCount(p) >= 15 },
  { id: "flagship-finisher", name: "Times-Table Summit", desc: "Complete Multiplication & Division Foundations.", icon: "icon-201",
    check: (p, ctx) => courseDone(p, ctx, "multiplication-division") },
  { id: "place-value-pro", name: "Spot Keeper", desc: "Complete Place Value & Big Numbers.", icon: "icon-902",
    check: (p, ctx) => courseDone(p, ctx, "place-value") },
  { id: "streak-3", name: "Warm Boots", desc: "Keep a 3-day streak.", icon: "icon-802",
    check: (p) => streakLen(p) >= 3 },
  { id: "streak-7", name: "Week Walker", desc: "Keep a 7-day streak.", icon: "icon-501",
    check: (p) => streakLen(p) >= 7 },
  { id: "big-haul", name: "Big Haul", desc: "Earn 60+ XP in a single lesson.", icon: "icon-401",
    check: (p) => Object.values(p.lessons).some((l) => l.bestXp >= 60) },
  { id: "night-owl", name: "Night Owl", desc: "Finish a lesson after 9 PM.", icon: "icon-707",
    check: (p) => (p.counters?.nightOwl ?? 0) >= 1 },
  { id: "review-first", name: "Trail Sweeper", desc: "Finish a Review sitting.", icon: "icon-603",
    check: (p) => (p.counters?.reviewSittings ?? 0) >= 1 },
  { id: "graduate", name: "Graduate", desc: "Walk a missed check all the way off the review trail (21-day rep).", icon: "icon-804",
    check: (p) => (p.counters?.graduated ?? 0) >= 1 },
  { id: "daily-first", name: "Day One", desc: "Answer your first Daily Challenge.", icon: "icon-604",
    check: (p) => Object.values(p.dailyDone ?? {}).some(Boolean) },
  { id: "daily-five", name: "Full Plate", desc: "Answer all 5 Daily Challenges in one day.", icon: "icon-704",
    check: (p) => {
      const byDate: Record<string, number> = {};
      for (const k of Object.keys(p.dailyDone ?? {})) {
        if (!p.dailyDone?.[k]) continue;
        const date = k.split(":")[0];
        byDate[date] = (byDate[date] ?? 0) + 1;
      }
      return Object.values(byDate).some((n) => n >= 5);
    } },
  { id: "xp-500", name: "Trail Mix Hoard", desc: "Reach 500 total XP.", icon: "icon-203",
    check: (p) => p.xp >= 500 },
  { id: "xp-2000", name: "Mountain of Mix", desc: "Reach 2,000 total XP.", icon: "icon-204",
    check: (p) => p.xp >= 2000 },
  { id: "practice-sweep", name: "Clean Sweep", desc: "Ace a 5-question practice round, all first try.", icon: "icon-803",
    check: (p) => (p.counters?.practiceSweeps ?? 0) >= 1 },
  { id: "test-out", name: "Switchback", desc: "Pass a chapter test-out.", icon: "icon-205",
    check: (p) => Object.values(p.testouts ?? {}).some(Boolean) },
  { id: "century-day", name: "Century Day", desc: "Earn 100+ XP in a single day.", icon: "icon-502",
    check: (p) => Object.values(p.xpByDay ?? {}).some((n) => n >= 100) }
];

/** Awards any newly-earned badges onto the profile; returns the new BadgeDefs (for toasts). */
export function awardNewBadges(p: Profile, ctx?: BadgeCtx): BadgeDef[] {
  const have = new Set(p.badges);
  const fresh: BadgeDef[] = [];
  for (const b of BADGES) {
    if (have.has(b.id)) continue;
    if (b.check(p, ctx)) {
      p.badges.push(b.id);
      fresh.push(b);
    }
  }
  return fresh;
}
