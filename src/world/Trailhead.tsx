"use client";
/**
 * S201 Step 2 — Trailhead parity without hierarchy regression.
 *
 * Location and ONE evidence-ranked action still lead. Existing engagement systems are re-homed
 * below that action as compact support: daily goal, XP, streak, league and the shared
 * dashboardRecommendation. The recommendation is informational/tertiary; it never becomes a
 * second primary CTA. Streak freezes are persisted and disclosed exactly as on the Dashboard.
 */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LinkButton, Surface } from "@/components/ui";
import { TRAIL } from "@/lib/trail";
import { addDays, computeStreak } from "@/lib/engine";
import { ensureLeague, standings, TIERS } from "@/lib/league";
import { progressStore, type Profile } from "@/lib/progress";
import { dashboardRecommendation, type RecommendationCourse } from "@/lib/dashboardRecommendation";
import { useWorld } from "./WorldShell";
import { MAINTENANCE_COPY, WORLD_STATES } from "./worldCopy";
import { basecampHref, dominantAction, waypointHref } from "./worldNav";
import { Instruments } from "./Instruments";
import { ReturnPaths } from "./ReturnPaths";
import type { WorldInstrument, WorldLandmark } from "./worldTypes";

function freezeDayLabel(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date).toLocaleDateString(undefined, { weekday: "long" });
}

export function Trailhead({
  landmarks,
  courseNames,
  regionName,
  instruments = [],
  waypointTitles = {},
  recommendationCourses = []
}: {
  landmarks: WorldLandmark[];
  courseNames: Record<string, string>;
  regionName: string;
  instruments?: WorldInstrument[];
  waypointTitles?: Record<string, string>;
  recommendationCourses?: RecommendationCourse[];
}) {
  const { world, flags, hydrated } = useWorld();
  const [profile, setProfile] = useState<Profile | null>(null);
  // S202 restores S201's dropped memo. This walk is rebuilt only when the geography or the
  // learner's evidence changes — NOT on a mode switch, and NOT on the second render that lands
  // when the profile loads. Changing presentation must not re-walk every landmark; the
  // throttled perf spec measures exactly that.
  const action = useMemo(() => {
    const landmarkWaypoints = new Map(landmarks.map((landmark) => [landmark.id, landmark.waypointIds]));
    const completedSet = new Set<string>();
    for (const course of Object.values(world.courses)) {
      for (const landmark of course.landmarks) {
        const waypoints = landmarkWaypoints.get(landmark.id) ?? [];
        for (let index = 0; index < landmark.completed; index += 1) {
          if (waypoints[index]) completedSet.add(waypoints[index]);
        }
      }
    }
    return dominantAction(world, landmarkWaypoints, (id: string) => completedSet.has(id));
  }, [landmarks, world]);

  useEffect(() => {
    const loaded = progressStore.load();
    ensureLeague(loaded, world.today);
    const { newlyFrozen } = computeStreak(loaded.activity, world.today);
    if (newlyFrozen.length > 0) {
      loaded.activity.frozen = [...new Set([...loaded.activity.frozen, ...newlyFrozen])].sort();
    }
    progressStore.save(loaded);
    setProfile(loaded);
  }, [world.today]);

  const loc = world.currentLocation;
  const locLandmark = loc ? landmarks.find((landmark) => landmark.id === loc.landmarkId) : undefined;
  const needsMaintenance = Object.values(world.courses)
    .filter((course) => course.maintenance === "route-fading" || course.maintenance === "needs-reinforcement")
    .sort((a, b) => a.courseId.localeCompare(b.courseId));
  const open = Object.values(world.courses)
    .filter((course) => course.approachOpen && !course.complete && course.courseId !== (action.kind === "explore" ? null : action.courseId))
    .sort((a, b) => b.completedWaypoints - a.completedWaypoints || a.courseId.localeCompare(b.courseId))
    .slice(0, 4);

  const { streak, recentFreeze } = useMemo(() => {
    if (!profile) return { streak: 0, recentFreeze: null as string | null };
    return {
      streak: computeStreak(profile.activity, world.today).streak,
      recentFreeze: profile.activity.frozen
        .filter((day) => day >= addDays(world.today, -2) && day < world.today)
        .sort()
        .pop() ?? null
    };
  }, [profile, world.today]);
  const recommendation = useMemo(
    () => profile && profile.followRecs !== false
      ? dashboardRecommendation(profile, world.today, recommendationCourses)
      : null,
    [profile, recommendationCourses, world.today]
  );
  const leagueStanding = profile?.league
    ? standings(profile.league.week, profile.league.tier, profile.league.weeklyXp).find((entry) => entry.id === "you")
    : null;

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-ink">
        {flags.trailTermsInNav ? regionName : "Your learning"}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{TRAIL.trailhead}</h1>

      <div data-primary-action>
        <Surface border className="mt-4 rounded-card p-5" elevation="e1">
          <p className="text-sm text-content-2">
            {hydrated && loc && locLandmark
              ? `You're on ${courseNames[loc.courseId] ?? loc.courseId} — ${locLandmark.name}.`
              : "You haven't walked a trail in this region yet."}
          </p>
          <h2 className="mt-2 text-xl font-extrabold">
            {action.kind === "explore" ? "Choose where to go next" : courseNames[action.courseId] ?? action.courseId}
          </h2>
          <div className="mt-4">
            {action.kind === "explore" ? (
              <LinkButton href="/atlas" size="lg">{action.label}</LinkButton>
            ) : (
              <LinkButton href={waypointHref(action.lessonId)} size="lg">{action.label}</LinkButton>
            )}
          </div>
        </Surface>
      </div>

      {profile && (
        <section data-engagement-support aria-labelledby="momentum-heading" className="mt-4 rounded-card border border-ink/10 bg-surface-2 p-4 dark:border-paper/12">
          <h2 id="momentum-heading" className="text-xs font-extrabold uppercase tracking-wide text-content-2">Trail support</h2>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs font-bold text-content-2">Today&apos;s goal</dt>
              <dd className="font-extrabold tabular-nums">{profile.lessonsByDay?.[world.today] ?? 0}/{profile.dailyGoal ?? 1}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-content-2">Trail mix</dt>
              <dd className="font-extrabold tabular-nums">{profile.xp} XP</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-content-2">Day streak</dt>
              <dd className="font-extrabold tabular-nums">{streak}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-content-2">League</dt>
              <dd className="font-extrabold">
                {profile.league ? `${TIERS[profile.league.tier]}${leagueStanding ? ` · #${leagueStanding.rank}` : ""}` : "Not placed"}
              </dd>
            </div>
          </dl>
          {recentFreeze && streak > 0 && (
            <p className="mt-3 text-xs font-bold text-sky-ink">
              A streak freeze covered {freezeDayLabel(recentFreeze)} — your {streak}-day streak is safe. Freezes bridge one missed day per week automatically.
            </p>
          )}
          {recommendation && (
            <p className="mt-3 border-t border-ink/8 pt-3 text-sm dark:border-paper/10">
              <span className="font-extrabold">{recommendation.headline}.</span>{" "}
              <span className="text-content-2">{recommendation.sub}</span>{" "}
              <Link href={recommendation.href} className="font-bold text-sky-ink underline decoration-2 underline-offset-2">
                {recommendation.cta}
              </Link>
            </p>
          )}
        </section>
      )}

      <section aria-labelledby="returnpaths-heading" className="mt-6">
        <h2 id="returnpaths-heading" className="text-sm font-extrabold uppercase tracking-wide text-content-2">Return paths</h2>
        <ReturnPaths lessonTitles={waypointTitles} />
      </section>

      {instruments.length > 0 && (
        <section aria-labelledby="instruments-heading" className="mt-6">
          <h2 id="instruments-heading" className="text-sm font-extrabold uppercase tracking-wide text-content-2">Instruments</h2>
          <Instruments instruments={instruments} compact />
        </section>
      )}

      <section aria-labelledby="maintenance-heading" className="mt-6">
        <h2 id="maintenance-heading" className="text-sm font-extrabold uppercase tracking-wide text-content-2">
          {TRAIL.returnPath === "return path" ? "Route maintenance" : TRAIL.returnPath}
        </h2>
        {needsMaintenance.length === 0 ? (
          <p className="mt-2 text-sm text-content-2">{WORLD_STATES.noReviewDue}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {needsMaintenance.map((course) => (
              <li key={course.courseId}>
                <Link href={basecampHref(course.courseId)} className="flex min-h-[44px] items-center justify-between rounded-card border border-ink/10 px-4 py-2 hover:border-sky dark:border-paper/12">
                  <span className="font-bold">{courseNames[course.courseId] ?? course.courseId}</span>
                  <span className="text-xs text-content-2">{MAINTENANCE_COPY[course.maintenance]}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {open.length > 0 && (
        <section aria-labelledby="open-heading" className="mt-6">
          <h2 id="open-heading" className="text-sm font-extrabold uppercase tracking-wide text-content-2">Other open trails</h2>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {open.map((course) => (
              <li key={course.courseId}>
                <Link href={basecampHref(course.courseId)} className="block min-h-[44px] rounded-card border border-ink/10 px-4 py-3 hover:border-sky dark:border-paper/12">
                  <span className="block font-bold">{courseNames[course.courseId] ?? course.courseId}</span>
                  <span className="block text-xs text-content-2">{course.completedWaypoints} of {course.totalWaypoints} {TRAIL.waypoint}s walked</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
