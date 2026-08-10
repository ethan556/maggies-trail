/**
 * FAMILY METRICS — every number on the parent dashboard, as a pure function.
 *
 * The contract with parents: plain language, and never reduce progress to
 * time-on-app or a lesson counter. Time and counts appear (families ask), but
 * the headline is always the EVIDENCE LADDER (evidenceLadder.ts) and what is
 * fragile, repaired, and due — the things a family can act on tonight.
 *
 * Every function takes (profile, manifest slice, today) and computes from the
 * real persisted record. Nothing here estimates from engagement proxies.
 */

import type { Profile } from "@/lib/progress";
import { computeStreak } from "@/lib/engine";
import { isFading, PROFICIENT, retainedMastery, type SkillState } from "@/lib/mastery";
import { ladderCounts, type EvidenceRung } from "@/lib/evidenceLadder";
import { strategyNote } from "@/components/ParentReport";

export interface ManifestLesson {
  id: string;
  title: string;
  /** Authored length from the lesson file, via the manifest. */
  minutes?: number | null;
}
export interface ManifestCourse {
  id: string;
  title: string;
  gradeLevel: number;
  category: string;
  lessonCount: number;
  lessons: ManifestLesson[];
}

const last7 = (today: string): string[] => {
  const t = Date.parse(today + "T00:00:00Z");
  return Array.from({ length: 7 }, (_, i) => new Date(t - (6 - i) * 86400000).toISOString().slice(0, 10));
};

/** Lessons finished and XP earned per day, past week — the activity strip. */
export function weeklyActivity(p: Profile, today: string): Array<{ date: string; lessons: number; xp: number }> {
  return last7(today).map((date) => ({
    date,
    lessons: p.lessonsByDay?.[date] ?? 0,
    xp: p.xpByDay?.[date] ?? 0
  }));
}

/** Estimated learning minutes this week — from the authored lesson lengths of
 * lessons COMPLETED in the window, labelled as an estimate. The app does not
 * surveil wall-clock time, and progress is never reduced to it. */
export function weeklyMinutes(p: Profile, courses: ManifestCourse[], today: string): number {
  const week = new Set(last7(today));
  const minuteOf = new Map<string, number>();
  for (const c of courses) for (const l of c.lessons) minuteOf.set(l.id, l.minutes ?? 6);
  let sum = 0;
  for (const [id, lp] of Object.entries(p.lessons)) {
    if (lp.completed && lp.completedAt && week.has(lp.completedAt)) sum += minuteOf.get(id) ?? 6;
  }
  return sum;
}

export function lessonsCompleted(p: Profile): number {
  return Object.values(p.lessons).filter((l) => l.completed).length;
}

/** Skills that WERE proficient and have decayed below the line — tonight's
 * most valuable five minutes. Sorted most-slipped first. */
export function fragileSkills(p: Profile, today: string): SkillState[] {
  return Object.values(p.mastery ?? {})
    .filter((s) => isFading(s, today))
    .sort((a, b) => retainedMastery(a, today) - retainedMastery(b, today));
}

/** A misconception is REPAIRED when the record shows both halves of the story:
 * a strategy signal latched in the past (the mistaken model, observed), and the
 * skill now sits at proficient-or-better on UNAIDED evidence. Reported with the
 * same plain-language note the parent report uses. */
export function repairedMisconceptions(
  p: Profile,
  today: string
): Array<{ tag: string; note: string }> {
  const out: Array<{ tag: string; note: string }> = [];
  for (const s of Object.values(p.mastery ?? {})) {
    const signalled = Object.values(s.signals ?? {}).some((n) => (n ?? 0) > 0);
    if (!signalled) continue;
    if (s.mastery >= PROFICIENT && retainedMastery(s, today) >= PROFICIENT) {
      const note = strategyNote(s.signals);
      out.push({ tag: s.tag, note: note ?? "Worked through a mistaken strategy and came out solid." });
    }
  }
  return out;
}

/** Review follow-through — reported from what the queue can actually witness.
 * The queue holds only PENDING items (a completed review moves its due date
 * forward), so a per-item completion history is not reconstructible; what IS a
 * fact is whether anything sits overdue right now. "On track" = zero overdue. */
export function reviewCompletion(
  p: Profile,
  today: string
): { overdue: number; dueToday: number; onTrack: boolean } {
  const overdue = p.review.filter((r) => r.due < today).length;
  const dueToday = p.review.filter((r) => r.due === today).length;
  return { overdue, dueToday, onTrack: overdue === 0 };
}

/** Placement estimate: the highest grade where the learner is proficient in a
 * meaningful share of the skills they've MET at that grade (≥60% of ≥5 met).
 * Plainly labelled an estimate from work inside this app — never a test score. */
export function placementEstimate(
  p: Profile,
  tagGrade: Record<string, number>,
  today: string
): { grade: number; confident: boolean } | null {
  const byGrade = new Map<number, { met: number; solid: number }>();
  for (const s of Object.values(p.mastery ?? {})) {
    if (s.attempts === 0) continue;
    const g = tagGrade[s.tag];
    if (g === undefined) continue;
    const row = byGrade.get(g) ?? { met: 0, solid: 0 };
    row.met++;
    if (retainedMastery(s, today) >= PROFICIENT) row.solid++;
    byGrade.set(g, row);
  }
  let best: { grade: number; confident: boolean } | null = null;
  for (const [g, row] of [...byGrade.entries()].sort((a, b) => a[0] - b[0])) {
    if (row.met >= 5 && row.solid / row.met >= 0.6) best = { grade: g, confident: row.met >= 10 };
  }
  return best;
}

/** Per grade+domain: lessons completed of available, and the ladder shape. */
export function domainProgress(
  p: Profile,
  courses: ManifestCourse[]
): Array<{ grade: number; category: string; done: number; total: number }> {
  const rows = new Map<string, { grade: number; category: string; done: number; total: number }>();
  for (const c of courses) {
    const key = `${c.gradeLevel}:${c.category}`;
    const row = rows.get(key) ?? { grade: c.gradeLevel, category: c.category, done: 0, total: 0 };
    row.total += c.lessonCount;
    for (const l of c.lessons) if (p.lessons[l.id]?.completed) row.done++;
    rows.set(key, row);
  }
  return [...rows.values()].filter((r) => r.done > 0).sort((a, b) => a.grade - b.grade);
}

/** The learner's ladder counts, surfaced for the family headline. */
export function familyLadder(p: Profile, today: string): Record<EvidenceRung, number> {
  return ladderCounts(p.mastery, today);
}

/** Goals: the existing daily-goal ring plus streak, in one glance. */
export function goalsSummary(p: Profile, today: string): { dailyGoal: number; doneToday: number; streak: number } {
  return {
    dailyGoal: p.dailyGoal ?? 1,
    doneToday: p.lessonsByDay?.[today] ?? 0,
    streak: computeStreak(p.activity, today).streak
  };
}

/** A downloadable weekly report — plain markdown a parent can save, print, or
 * hand to a teacher. Built entirely from the persisted record. */
export function familyReportMarkdown(
  name: string,
  p: Profile,
  courses: ManifestCourse[],
  tagGrade: Record<string, number>,
  today: string
): string {
  const ladder = familyLadder(p, today);
  const act = weeklyActivity(p, today);
  const fragile = fragileSkills(p, today);
  const repaired = repairedMisconceptions(p, today);
  const place = placementEstimate(p, tagGrade, today);
  const lines: string[] = [];
  lines.push(`# ${name} — learning report (${today})`);
  lines.push("");
  lines.push(`## What the evidence shows`);
  lines.push(`Uses anywhere: ${ladder.transferable} · Still has it: ${ladder.retained} · Got it: ${ladder.mastered} · Practicing: ${ladder.practiced} · Met it: ${ladder.exposed}`);
  lines.push("");
  lines.push(`## This week`);
  lines.push(`Lessons: ${act.reduce((a, d) => a + d.lessons, 0)} · Estimated minutes: ${weeklyMinutes(p, courses, today)} · Streak: ${computeStreak(p.activity, today).streak} day(s)`);
  lines.push("");
  if (place) lines.push(`Working comfortably at **Grade ${place.grade}** material${place.confident ? "" : " (early estimate)"} — based on work inside the app, not a test.`);
  if (fragile.length) {
    lines.push("");
    lines.push(`## Worth five minutes soon`);
    for (const s of fragile.slice(0, 5)) lines.push(`- ${s.tag} — had it, slipping; a short review brings it back fastest.`);
  }
  if (repaired.length) {
    lines.push("");
    lines.push(`## Repaired along the way`);
    for (const r of repaired.slice(0, 5)) lines.push(`- ${r.tag}: ${r.note}`);
  }
  lines.push("");
  lines.push(`_Progress here is measured by evidence — solved without help, kept over time, used in new places — never by minutes watched or lessons counted._`);
  return lines.join("\n");
}
