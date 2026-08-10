"use client";
/**
 * S201 Step 3 — Basecamp course parity.
 *
 * Basecamp replaces the legacy course page, so it carries every durable affordance that page
 * offered: course scope, progress, continue/rewalk, per-landmark practice and test-out,
 * entitlement disclosure, waypoint minutes, and Mastery Studio. Geography remains derived from
 * WorldState; this component never derives or reloads progress independently.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { courseIcon } from "@/lib/personalize";
import { authProvider, SESSION_CHANGED_EVENT } from "@/lib/auth";
import { isPremium } from "@/lib/entitlement";
import { progressStore } from "@/lib/progress";
import { AppIcon, LinkButton, ProgressBar, Surface } from "@/components/ui";
import { useWorld } from "./WorldShell";
import { MAINTENANCE_COPY, WORLD_STATES } from "./worldCopy";
import { nextWaypoint, waypointHref } from "./worldNav";
import type { WorldLandmark } from "./worldTypes";

function usePremium(): boolean {
  const [premium, setPremium] = useState(true);
  useEffect(() => {
    const readSession = () => {
      try {
        setPremium(isPremium(progressStore.load(), authProvider.currentSession()?.accountId ?? null));
      } catch {
        setPremium(false);
      }
    };
    readSession();
    window.addEventListener(SESSION_CHANGED_EVENT, readSession);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, readSession);
  }, []);
  return premium;
}

export interface BasecampWaypoint {
  title: string;
  minutes: number;
}

export function Basecamp({
  courseId,
  trailName,
  trailSummary,
  category,
  lessonCount,
  totalMinutes,
  landmarks,
  waypoints,
  prerequisites,
  masteryConcepts = []
}: {
  courseId: string;
  trailName: string;
  trailSummary: string;
  category: string;
  lessonCount: number;
  totalMinutes: number;
  landmarks: WorldLandmark[];
  waypoints: Record<string, BasecampWaypoint>;
  prerequisites: Array<{ courseId: string; trailName: string }>;
  masteryConcepts?: Array<[string, string]>;
}) {
  const { world, hydrated } = useWorld();
  const premium = usePremium();
  const course = world.courses[courseId];
  const landmarkWaypoints = new Map(landmarks.map((landmark) => [landmark.id, landmark.waypointIds]));

  const completedSet = new Set<string>();
  if (course) {
    for (const landmark of course.landmarks) {
      const ids = landmarkWaypoints.get(landmark.id) ?? [];
      for (let index = 0; index < landmark.completed; index += 1) {
        if (ids[index]) completedSet.add(ids[index]);
      }
    }
  }
  const next = hydrated && course ? nextWaypoint(course, landmarkWaypoints, (id) => completedSet.has(id)) : null;
  const firstWaypointId = landmarks.flatMap((landmark) => landmark.waypointIds)[0] ?? null;
  const progress = course && course.totalWaypoints > 0
    ? Math.round((course.completedWaypoints / course.totalWaypoints) * 100)
    : 0;

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-ink">{category} · Basecamp</p>
      <h1 className="mt-1 flex items-center gap-3 text-3xl font-extrabold tracking-tight">
        <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-sky/10 text-sky-ink">
          <AppIcon name={courseIcon(trailName)} size={24} />
        </span>
        {trailName}
      </h1>
      <p className="mt-2 max-w-2xl text-content-2">{trailSummary}</p>
      <p className="mt-3 text-sm font-bold text-content-2">
        {lessonCount} lessons · {landmarks.length} landmarks · ~{totalMinutes} min total
      </p>

      <Surface border className="mt-5 min-h-[104px] rounded-card p-4" elevation="e1">
        {!hydrated ? (
          <div aria-hidden className="animate-pulse">
            <div className="h-6 w-44 rounded-pill bg-ink/8 dark:bg-paper/10" />
            <div className="mt-2 h-11 w-56 rounded-pill bg-ink/8 dark:bg-paper/10" />
            <div className="mt-3 h-2 w-full rounded-pill bg-ink/8 dark:bg-paper/10" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-extrabold">{course?.completedWaypoints ?? 0} of {course?.totalWaypoints ?? lessonCount} lessons walked</p>
                {course && <p className="mt-1 text-sm text-content-2">{MAINTENANCE_COPY[course.maintenance]}</p>}
              </div>
              {next ? (
                <LinkButton href={waypointHref(next.lessonId)} size="md" iconRight="chevronRight">
                  {completedSet.size > 0 ? `Continue: ${waypoints[next.lessonId]?.title ?? "next waypoint"}` : "Begin expedition"}
                </LinkButton>
              ) : firstWaypointId ? (
                <LinkButton href={waypointHref(firstWaypointId)} size="md" className="!bg-leaf enabled:hover:!bg-leaf/90">
                  Trail complete — walk it again
                </LinkButton>
              ) : null}
            </div>
            <ProgressBar value={progress} label="Course progress" className="mt-3" />
          </>
        )}
      </Surface>

      {prerequisites.length > 0 && (
        <section aria-labelledby="approach-heading" className="mt-5">
          <h2 id="approach-heading" className="text-sm font-extrabold uppercase tracking-wide text-content-2">Approach trails</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {prerequisites.map((prerequisite) => {
              const prerequisiteState = world.courses[prerequisite.courseId];
              const walked = prerequisiteState ? prerequisiteState.completedWaypoints > 0 : false;
              return (
                <li key={prerequisite.courseId}>
                  <Link
                    href={`/basecamp/${prerequisite.courseId}`}
                    className={`inline-flex min-h-[44px] items-center gap-2 rounded-card border-2 px-3 py-2 text-sm font-bold ${walked ? "border-leaf/50 bg-leaf/10" : "border-ink/15 dark:border-paper/15"}`}
                  >
                    <span aria-hidden>{walked ? "✓" : "→"}</span>
                    {prerequisite.trailName}
                    <span className="sr-only">{walked ? " — walked" : " — not yet walked"}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {course && !course.approachOpen && <p className="mt-2 text-sm text-content-2">{WORLD_STATES.approachClosed(trailName)}</p>}
        </section>
      )}

      <section aria-labelledby="landmarks-heading" className="mt-7">
        <h2 id="landmarks-heading" className="text-sm font-extrabold uppercase tracking-wide text-content-2">Landmarks</h2>
        <ol aria-labelledby="landmarks-heading" className="mt-3 space-y-5">
          {landmarks.map((landmark, landmarkIndex) => {
            const state = course?.landmarks.find((entry) => entry.id === landmark.id);
            const complete = Boolean(state && state.total > 0 && state.completed === state.total);
            const active = Boolean(next && next.landmarkId === landmark.id);
            return (
              <li key={landmark.id}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex min-w-0 items-center gap-2.5 text-lg font-extrabold">
                    <span aria-hidden data-status-pill="landmark" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-sm font-extrabold ${complete ? "bg-cta-good text-white" : active ? "bg-tangerine text-night" : "bg-ink/8 text-content-2 dark:bg-paper/10"}`}>
                      {complete ? "✓" : landmarkIndex + 1}
                    </span>
                    <span className="sr-only">Landmark {landmarkIndex + 1}: </span>
                    <span className="truncate">{landmark.name}</span>
                    {!premium && landmarkIndex > 0 && (
                      <Link href="/premium" className="ml-1 inline-flex min-h-6 items-center rounded-pill bg-tangerine/10 px-2 text-[11px] font-extrabold uppercase tracking-wide text-tangerine-ink hover:underline">Premium</Link>
                    )}
                  </h3>
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-bold tabular-nums text-content-2">{state ? `${state.completed}/${state.total}` : `0/${landmark.waypointIds.length}`}</span>
                    <Link href={`/practice/${landmark.chapterId}`} className="rounded-pill border border-ink/15 px-3 py-1.5 text-xs font-extrabold hover:border-sky hover:text-sky-ink dark:border-paper/15">Practice</Link>
                    {!complete && (
                      <Link href={`/practice/${landmark.chapterId}?testout=1`} className="rounded-pill border border-tangerine/50 px-3 py-1.5 text-xs font-extrabold text-tangerine-ink hover:border-tangerine">Test out</Link>
                    )}
                  </span>
                </div>
                <Surface border className="rounded-card p-0" elevation="e1">
                  <ul className="divide-y divide-ink/8 dark:divide-paper/8">
                    {landmark.waypointIds.map((waypointId, waypointIndex) => {
                      const done = completedSet.has(waypointId);
                      const isNext = next?.lessonId === waypointId;
                      const detail = waypoints[waypointId];
                      const previousDone = waypointIndex > 0 && completedSet.has(landmark.waypointIds[waypointIndex - 1]);
                      return (
                        <li key={waypointId} className="relative">
                          {waypointIndex > 0 && <span aria-hidden="true" data-waypoint-rail="above" className={`absolute left-[29px] top-0 h-1/2 w-0.5 ${previousDone ? "bg-leaf/55" : "bg-ink/12 dark:bg-paper/12"}`} />}
                          {waypointIndex < landmark.waypointIds.length - 1 && <span aria-hidden="true" data-waypoint-rail="below" className={`absolute bottom-0 left-[29px] h-1/2 w-0.5 ${done ? "bg-leaf/55" : "bg-ink/12 dark:bg-paper/12"}`} />}
                          <Link href={waypointHref(waypointId)} className="group relative flex min-h-[48px] items-center gap-3 rounded-card px-4 py-2 hover:bg-sky/5">
                            <span aria-hidden data-status-pill="waypoint" className={`relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-pill text-xs font-extrabold ring-4 ring-surface transition-transform group-hover:scale-105 motion-reduce:transition-none ${done ? "bg-cta-good text-white" : isNext ? "bg-tangerine text-night" : "bg-ink/10 text-content-2 dark:bg-paper/10"}`}>
                              {done ? "✓" : waypointIndex + 1}
                            </span>
                            <span className="flex-1 font-bold">
                              {detail?.title ?? waypointId}
                              {isNext && <span className="ml-2 rounded-pill bg-tangerine/10 px-2 py-0.5 align-middle text-[10px] font-extrabold uppercase tracking-wide text-tangerine-ink">Next</span>}
                            </span>
                            <span className="sr-only">{done ? " — walked" : " — not yet walked"}</span>
                            {detail && <span className="text-xs tabular-nums text-content-2">{detail.minutes} min</span>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </Surface>
              </li>
            );
          })}
        </ol>
      </section>

      {masteryConcepts.length > 0 && (
        <section className="mt-8 rounded-card border border-sky/25 bg-sky/5 p-5" aria-labelledby="mastery-studio-heading">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-ink">Beyond lesson completion</p>
          <h2 id="mastery-studio-heading" className="mt-1 text-xl font-extrabold">Mastery Studio</h2>
          <p className="mt-2 max-w-2xl text-sm text-content-2">
            Rebuild a load-bearing concept through prediction, direct manipulation, explanation, near-miss contrast, mixed practice, transfer, and fresh retrieval.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {masteryConcepts.map(([tag, label]) => (
              <Link key={tag} href={`/mastery/${encodeURIComponent(tag)}`} className="rounded-full border-2 border-sky/30 bg-surface px-3 py-2 text-sm font-extrabold capitalize hover:border-sky dark:bg-ink/40">
                {label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
