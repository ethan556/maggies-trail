"use client";
/**
 * FAMILY DASHBOARD — the parent view of one learner, in plain language.
 *
 * Every number renders from the tested pure functions in family.ts /
 * evidenceLadder.ts over the child's persisted profile. The layout leads with
 * the EVIDENCE LADDER — what the work actually shows — and never headlines
 * time-on-app or a lesson counter (they appear, labelled, further down).
 */

import React from "react";
import type { Profile } from "@/lib/progress";
import { RUNG_COPY, RUNGS } from "@/lib/evidenceLadder";
import {
  familyLadder,
  familyReportMarkdown,
  fragileSkills,
  goalsSummary,
  domainProgress,
  placementEstimate,
  repairedMisconceptions,
  reviewCompletion,
  weeklyActivity,
  weeklyMinutes,
  type ManifestCourse
} from "@/lib/family";
import type { SkillLabel } from "@/components/ParentReport";

const CAT_LABEL: Record<string, string> = { Math: "Math" };

export default function FamilyDashboard({
  name,
  profile,
  courses,
  tagGrades,
  skills,
  today
}: {
  name: string;
  profile: Profile;
  courses: ManifestCourse[];
  tagGrades: Record<string, number>;
  skills: Record<string, SkillLabel>;
  today: string;
}) {
  const ladder = familyLadder(profile, today);
  const act = weeklyActivity(profile, today);
  const weekLessons = act.reduce((a, d) => a + d.lessons, 0);
  const minutes = weeklyMinutes(profile, courses, today);
  const fragile = fragileSkills(profile, today).slice(0, 3);
  const repaired = repairedMisconceptions(profile, today).slice(0, 3);
  const review = reviewCompletion(profile, today);
  const place = placementEstimate(profile, tagGrades, today);
  const domains = domainProgress(profile, courses);
  const goals = goalsSummary(profile, today);
  const maxBar = Math.max(1, ...act.map((d) => d.lessons));
  const labelOf = (tag: string) => skills[tag]?.label ?? tag;

  const download = () => {
    const md = familyReportMarkdown(name, profile, courses, tagGrades, today);
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, "-")}-report-${today}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 text-sm">
      {/* The headline: what the evidence shows, never a time counter. */}
      <section aria-label="what the evidence shows">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink/70 dark:text-paper/70">
          What the work shows
        </h2>
        <ul className="mt-2 grid grid-cols-5 gap-1 text-center">
          {[...RUNGS].reverse().map((r) => (
            <li key={r} className="rounded border border-ink/10 py-1.5 dark:border-paper/10" title={RUNG_COPY[r].plain}>
              <p className="text-base font-extrabold tabular-nums">{ladder[r]}</p>
              <p className="text-[10px] font-bold leading-tight text-ink/70 dark:text-paper/70">{RUNG_COPY[r].label}</p>
            </li>
          ))}
        </ul>
        {place && (
          <p className="mt-2 font-bold">
            Working comfortably at Grade {place.grade} material
            {place.confident ? "" : " (early estimate)"}{" "}
            <span className="font-normal text-ink/70 dark:text-paper/70">— from work in the app, not a test.</span>
          </p>
        )}
      </section>

      {/* This week: the activity strip, with time clearly labelled an estimate. */}
      <section aria-label="this week">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink/70 dark:text-paper/70">This week</h2>
        <div className="mt-2 flex items-end gap-1" aria-hidden>
          {act.map((d) => (
            <div key={d.date} className="flex-1">
              <div
                className={`mx-auto w-full rounded-t ${d.lessons > 0 ? "bg-sky" : "bg-ink/10 dark:bg-paper/10"}`}
                style={{ height: `${6 + (d.lessons / maxBar) * 26}px` }}
              />
              <p className="mt-0.5 text-center text-[9px] font-bold text-ink/70 dark:text-paper/70">
                {d.date.slice(8)}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-1 text-ink/70 dark:text-paper/70">
          {weekLessons} lesson{weekLessons === 1 ? "" : "s"} · about {minutes} min of learning (estimated) · goal{" "}
          {goals.doneToday}/{goals.dailyGoal} today · {goals.streak}-day streak
        </p>
      </section>

      {/* Actionable: fragile now, repaired along the way, review status. */}
      {fragile.length > 0 && (
        <section aria-label="worth five minutes soon">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink/70 dark:text-paper/70">
            Worth five minutes soon
          </h2>
          <ul className="mt-1 space-y-0.5">
            {fragile.map((s) => (
              <li key={s.tag}>
                <span className="font-bold">{labelOf(s.tag)}</span>{" "}
                <span className="text-ink/70 dark:text-paper/70">— had it, slipping; a short review brings it back fastest.</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {repaired.length > 0 && (
        <section aria-label="repaired along the way">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink/70 dark:text-paper/70">
            Repaired along the way
          </h2>
          <ul className="mt-1 space-y-0.5">
            {repaired.map((r) => (
              <li key={r.tag}>
                <span className="font-bold">{labelOf(r.tag)}</span>{" "}
                <span className="text-ink/70 dark:text-paper/70">— {r.note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className={review.onTrack ? "font-bold text-leaf-ink" : "font-bold text-tangerine-ink"}>
        {review.onTrack
          ? "Review is on track — nothing overdue."
          : `${review.overdue} review item${review.overdue === 1 ? "" : "s"} overdue${review.dueToday ? ` · ${review.dueToday} due today` : ""}.`}
      </p>

      {/* Where the work has been: grade × subject progress. */}
      {domains.length > 0 && (
        <section aria-label="progress by grade and subject">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink/70 dark:text-paper/70">
            Progress by grade
          </h2>
          <ul className="mt-1 space-y-1">
            {domains.map((d) => (
              <li key={`${d.grade}:${d.category}`} className="flex items-center gap-2">
                <span className="w-24 shrink-0 font-bold">
                  Grade {d.grade} {CAT_LABEL[d.category] ?? d.category}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10" aria-hidden>
                  <span className="block h-full rounded-full bg-leaf" style={{ width: `${Math.round((d.done / d.total) * 100)}%` }} />
                </span>
                <span className="tabular-nums text-ink/70 dark:text-paper/70">
                  {d.done}/{d.total}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button
        type="button"
        onClick={download}
        className="pressable min-h-11 rounded-pill border-2 border-ink/15 px-4 font-bold transition-colors hover:border-sky hover:text-sky-ink dark:border-paper/20"
      >
        Download this report
      </button>
    </div>
  );
}
