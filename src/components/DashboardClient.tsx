"use client";

import { courseIcon } from "@/lib/personalize";
import Link from "next/link";
import { TrailAtmosphere, TrailMark } from "./playerChrome";
import { useEffect, useMemo, useState } from "react";
import { addDays, computeStreak, dueItems, localDateStr } from "@/lib/engine";
import { gradeBandLabel } from "@/lib/copy";
import { ensureLeague, standings, TIERS } from "@/lib/league";
import { progressStore, type Profile } from "@/lib/progress";
import { predictionReviews } from "@/lib/predictionReview";
import { PROFICIENT } from "@/lib/mastery";
import { dashboardRecommendation, type DashRec } from "@/lib/dashboardRecommendation";
export { dashboardRecommendation, type DashRec } from "@/lib/dashboardRecommendation";
import { AppIcon, type IconName, SectionHeader } from "@/components/ui";
import AssignmentsCard from "@/components/AssignmentsCard";
import { AvatarDisplay } from "@/components/AvatarDisplay";

export interface DashCourse {
  /** canonical world course id — the Basecamp route key */
  courseId: string;
  slug: string;
  title: string;
  tagline: string;
  comingSoon: boolean;
  /** grade band (0=K … 13=Calculus) — the trail map groups on this */
  gradeLevel: number;
  /** chapter → lesson ids (empty for coming-soon) */
  chapters: string[][];
  lessonIds: string[];
  firstLessonId: string | null;
  /** titles of courses this one is best walked after */
  after: string[];
  /** conceptTags (skills) taught in this course — for mastery-driven recommendations */
  conceptTags: string[];
}

function completedSet(profile: Profile): Set<string> {
  return new Set(Object.keys(profile.lessons).filter((id) => profile.lessons[id].completed));
}

/** Pure: the grade band this learner is working in. Onboarding's stated grade
 * wins; otherwise infer from where their completed lessons actually live
 * (ties break upward — a learner straddling bands is moving up). Null only
 * when there is no signal at all. */
export function learnerGradeBand(
  profile: Profile,
  courses: Pick<DashCourse, "comingSoon" | "lessonIds" | "gradeLevel">[]
): number | null {
  const stated = profile.onboarding?.grade;
  if (typeof stated === "number") return stated;
  const done = completedSet(profile);
  const byBand = new Map<number, number>();
  for (const c of courses) {
    if (c.comingSoon) continue;
    const n = c.lessonIds.filter((id) => done.has(id)).length;
    if (n > 0) byBand.set(c.gradeLevel, (byBand.get(c.gradeLevel) ?? 0) + n);
  }
  let best: number | null = null;
  let bestN = 0;
  for (const [g, n] of byBand) {
    if (n > bestN || (n === bestN && best !== null && g > best)) {
      best = g;
      bestN = n;
    }
  }
  return best;
}

/** Pure: the single most useful "Up next" lesson. Priority:
 * 1. continue the unfinished course the learner is furthest into,
 * 2. the onboarding recommendation if it's still unwalked,
 * 3. the first unwalked lesson in the learner's own grade band,
 * 4. the first unwalked lesson in catalog order (the old behavior, now the
 *    LAST resort — it used to be the ONLY rule, which pointed every new
 *    learner at Kindergarten lesson 1 regardless of their grade). */
export function upNextLesson(
  profile: Profile,
  courses: DashCourse[]
): { id: string; courseTitle: string } | null {
  const done = completedSet(profile);
  const live = courses.filter((c) => !c.comingSoon && c.lessonIds.length > 0);

  let cont: DashCourse | null = null;
  let contN = 0;
  for (const c of live) {
    const n = c.lessonIds.filter((id) => done.has(id)).length;
    if (n > 0 && n < c.lessonIds.length && n > contN) {
      cont = c;
      contN = n;
    }
  }
  if (cont) {
    const id = cont.lessonIds.find((x) => !done.has(x));
    if (id) return { id, courseTitle: cont.title };
  }

  const rec = profile.onboarding?.recommendedLessonId;
  if (rec && !done.has(rec)) {
    const c = live.find((x) => x.lessonIds.includes(rec));
    if (c) return { id: rec, courseTitle: c.title };
  }

  const band = learnerGradeBand(profile, courses);
  if (band !== null) {
    for (const c of live) {
      if (c.gradeLevel !== band) continue;
      const id = c.lessonIds.find((x) => !done.has(x));
      if (id) return { id, courseTitle: c.title };
    }
  }

  for (const c of live) {
    const id = c.lessonIds.find((x) => !done.has(x));
    if (id) return { id, courseTitle: c.title };
  }
  return null;
}

/** "Saturday" for a local date string — the day a freeze quietly bridged. */
function freezeDayLabel(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "long" });
}

function GoalRing({ done, goal }: { done: number; goal: number }) {
  const pct = Math.min(1, goal === 0 ? 0 : done / goal);
  const R = 26;
  const C = 2 * Math.PI * R;
  const met = done >= goal;
  return (
    <div className="flex items-center gap-3 rounded-card bg-surface-2 px-4 py-3">
      <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label={`Daily goal: ${done} of ${goal} lessons today`} className={met ? "goal-met" : undefined}>
        <circle cx="32" cy="32" r={R} fill="none" strokeWidth="8" className="stroke-ink/10 dark:stroke-paper/10" />
        <circle
          cx="32"
          cy="32"
          r={R}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          transform="rotate(-90 32 32)"
          className={met ? "ring-fill stroke-leaf" : "stroke-tangerine"}
          style={{ transition: "stroke-dashoffset 150ms ease-out" }}
        />
        {met && (
          <text x="32" y="38" textAnchor="middle" fontSize="18" className="fill-leaf font-extrabold">✓</text>
        )}
      </svg>
      <div>
        <p className="text-2xl font-extrabold tabular-nums">
          {done}/{goal}
        </p>
        <p className="text-xs font-bold text-ink/70 dark:text-paper/70">today's goal</p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  icon,
  iconClassName = ""
}: {
  label: string;
  value: string;
  accent?: boolean;
  icon?: IconName;
  /** Extra classes on the icon svg — used for the one-shot flame-pop when the
   * streak was fed today. Purely decorative; reduced-motion and forced-colors
   * are handled by the celebration layer in globals.css. */
  iconClassName?: string;
}) {
  return (
    <div className="rounded-card bg-surface-2 px-4 py-3">
      {icon && (
        <AppIcon name={icon} size={16} className={`mb-1 ${accent ? "text-tangerine-ink" : "text-muted"} ${iconClassName}`} />
      )}
      <p className={`text-2xl font-extrabold tabular-nums ${accent ? "text-tangerine-ink" : "text-content"}`}>{value}</p>
      <p className="text-xs font-bold text-muted">{label}</p>
    </div>
  );
}

export default function DashboardClient({ courses }: { courses: DashCourse[] }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  // Which grade bands of the trail map are expanded. Seeded to the learner's
  // own band when the profile loads; user toggles are synced back via onToggle
  // so React never clobbers a fold the learner opened or closed themselves.
  const [openBands, setOpenBands] = useState<Set<number> | null>(null);
  useEffect(() => {
    const p = progressStore.load();
    const todayStr = localDateStr(new Date());
    ensureLeague(p, todayStr);
    // Streak freezes were computed on every render but never persisted, so the
    // learner was never TOLD a freeze saved their streak — the one moment the
    // mechanic earns loyalty. Persisting also lets the family view and the
    // cross-device merge (frozen days union) see the same streak the learner does.
    const { newlyFrozen } = computeStreak(p.activity, todayStr);
    if (newlyFrozen.length > 0) {
      p.activity.frozen = [...new Set([...p.activity.frozen, ...newlyFrozen])].sort();
    }
    progressStore.save(p);
    setProfile(p);
    const band = learnerGradeBand(p, courses);
    setOpenBands(new Set([band ?? Math.min(...courses.map((c) => c.gradeLevel))]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const done = new Set(
    profile ? Object.keys(profile.lessons).filter((id) => profile.lessons[id].completed) : []
  );
  const today = localDateStr(new Date());
  const streak = profile ? computeStreak(profile.activity, today).streak : 0;
  const due = profile ? dueItems(profile.review, today).length : 0;
  const surprisesDue = profile ? predictionReviews(profile, today).filter((x) => x.due).length : 0;
  // A freeze that bridged the last day or two is worth saying out loud —
  // otherwise the learner sees an unbroken streak and never learns it was saved.
  const recentFreeze = profile
    ? profile.activity.frozen.filter((d) => d >= addDays(today, -2) && d < today).sort().pop() ?? null
    : null;

  const next = profile ? upNextLesson(profile, courses) : null;

  // Mastery-driven "recommended next" — see dashboardRecommendation (pure + unit-tested).
  // Suppressed when the learner has turned recommendations off (stay-on-your-own-path).
  const rec = useMemo(
    () => (profile && profile.followRecs !== false ? dashboardRecommendation(profile, today, courses) : null),
    [profile, today, courses]
  );

  // Forward advance: when there's nothing to review or reinforce, point the learner at the TRUE
  // curriculum-next skill they're ready for. Computed server-side (curriculum order + prereq map)
  // so the dashboard ships none of that data; the client posts only its proficient-tag shortlist.
  const [advance, setAdvance] = useState<{ tag: string; lessonId: string | null; courseSlug: string | null; courseTitle: string | null } | null>(null);
  useEffect(() => {
    if (!profile || profile.followRecs === false || rec) {
      setAdvance(null);
      return;
    }
    const mastery = profile.mastery ?? {};
    const touched = Object.keys(mastery);
    if (touched.length === 0) {
      setAdvance(null); // cold start — onboarding/placement/"Up next" handle it
      return;
    }
    const proficient = touched.filter((t) => mastery[t].mastery >= PROFICIENT);
    let cancelled = false;
    fetch("/api/next-skill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proficient })
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) setAdvance(d?.skill ?? null);
      })
      .catch(() => {
        if (!cancelled) setAdvance(null);
      });
    return () => {
      cancelled = true;
    };
  }, [profile, rec]);

  const advanceCard: DashRec | null = advance
    ? {
        tone: "sky",
        kicker: "Recommended for you",
        headline: `Ready for something new: ${advance.tag.replace(/-/g, " ")}`,
        sub: advance.courseTitle ? `in ${advance.courseTitle}` : "The next skill on your trail.",
        cta: "Start",
        href: advance.lessonId ? `/learn/${advance.lessonId}` : advance.courseSlug ? `/courses/${advance.courseSlug}` : "/courses"
      }
    : null;
  const card = rec ?? advanceCard;
  const cardTone = card
    ? {
        tangerine: { border: "border-tangerine bg-tangerine/5", text: "text-tangerine-ink", btn: "bg-tangerine hover:bg-tangerine/90" },
        leaf: { border: "border-leaf bg-leaf/5", text: "text-leaf-ink", btn: "bg-leaf hover:bg-leaf/90" },
        sky: { border: "border-sky bg-sky/5", text: "text-sky-ink", btn: "bg-sky hover:bg-primary-hover" }
      }[card.tone]
    : null;

  return (
    <div className="relative">
      <TrailAtmosphere />
      <div className="relative z-[1]">
      <div className="flex items-center gap-3">
        <AvatarDisplay
          avatarId={profile?.avatarId}
          size={256}
          className="h-11 w-11 shrink-0 rounded-full ring-2 ring-ink/10 dark:ring-paper/15"
        />
        <h1 className="text-3xl font-extrabold tracking-tight">Your trail</h1>
      </div>

      {profile && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <GoalRing
            done={profile.lessonsByDay?.[today] ?? 0}
            goal={profile.dailyGoal ?? 1}
          />
          <Stat label="Trail mix (XP)" value={String(profile.xp)} accent icon="spark" />
          <Stat
            label="Day streak"
            value={String(streak)}
            icon="flame"
            accent={streak > 0 && (profile.lessonsByDay?.[today] ?? 0) > 0}
            iconClassName={streak > 0 && (profile.lessonsByDay?.[today] ?? 0) > 0 ? "flame-pop" : ""}
          />
          <Stat label="Reviews due" value={String(due)} icon="review" />
          <Stat label="Lessons walked" value={String(done.size)} icon="route" />
        </div>
      )}
      {surprisesDue > 0 && (
        <p className="mt-2 text-xs font-bold text-tangerine-ink">
          🔮{" "}
          <Link href="/review" className="underline decoration-2 underline-offset-2 hover:opacity-80">
            {surprisesDue} surprise{surprisesDue === 1 ? "" : "s"} due for a revisit
          </Link>{" "}
          — a prediction the math disagreed with, ready to re-test now the reveal has settled.
        </p>
      )}
      {recentFreeze && streak > 0 && (
        <p className="mt-2 text-xs font-bold text-sky-ink">
          ❄️ A streak freeze covered {freezeDayLabel(recentFreeze)} — your {streak}-day streak is
          safe. Freezes bridge one missed day per week, automatically.
        </p>
      )}

      {profile && !profile.onboarding && done.size === 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border-2 border-tangerine bg-tangerine/5 p-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-tangerine-ink"><TrailMark className="shrink-0" />New here?</p>
            <p className="font-extrabold">A 60-second placement picks your starting spot.</p>
            <Link href="/placement" className="inline-flex min-h-11 items-center text-sm font-bold text-tangerine-ink hover:underline">
              Take the skill check →
            </Link>
          </div>
          <Link
            href="/onboarding"
            className="pressable rounded-full bg-tangerine px-5 py-3 font-extrabold text-night hover:bg-tangerine/90"
          >
            Get started
          </Link>
        </div>
      )}
      {profile && next && !(done.size === 0 && !profile.onboarding) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border-2 border-sky bg-sky/5 p-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-sky-ink"><TrailMark className="shrink-0" />Up next</p>
            <p className="font-extrabold">{next.courseTitle}</p>
          </div>
          <Link
            href={`/learn/${next.id}`}
            className="pressable rounded-full bg-cta px-5 py-3 font-extrabold text-white hover:bg-sky/90"
          >
            {done.size === 0 ? "Take your first step" : "Continue"}
          </Link>
        </div>
      )}
      {profile && card && cardTone && (
        <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border-2 p-4 ${cardTone.border}`}>
          <div>
            <p className={`flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide ${cardTone.text}`}><TrailMark className="shrink-0" />{card.kicker}</p>
            <p className="font-extrabold">{card.headline}</p>
            <p className="text-sm text-ink/70 dark:text-paper/70">{card.sub}</p>
          </div>
          <Link
            href={card.href}
            className={`pressable rounded-full px-5 py-3 font-extrabold text-white shadow-e1 hover:shadow-e2 ${cardTone.btn}`}
          >
            {card.cta}
          </Link>
        </div>
      )}

      {profile && <AssignmentsCard />}

      {profile && !next && done.size > 0 && (
        <div className="mt-4 rounded-card border-2 border-leaf bg-leaf/5 p-4">
          <p className="font-extrabold">Every live trail walked — more courses are on the way!</p>
        </div>
      )}

      {profile && (
        <Link
          href="/daily"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border-2 border-ink/10 bg-white p-4 hover:border-tangerine dark:border-paper/10 dark:bg-dusk"
        >
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-tangerine-ink">
              Daily Challenge
            </p>
            <p className="font-extrabold">
              {(() => {
                const n = Object.keys(profile.dailyDone ?? {}).filter(
                  (k) => k.startsWith(today + ":") && profile.dailyDone?.[k]
                ).length;
                return n > 0 ? `${n} answered today — nice!` : "Today's problems are waiting";
              })()}
            </p>
          </div>
          <span className="rounded-full bg-tangerine px-5 py-3 font-extrabold text-night">
            Play
          </span>
        </Link>
      )}

      {profile?.league && (
        <Link
          href="/leaderboard"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border-2 border-ink/10 bg-white p-4 hover:border-sky dark:border-paper/10 dark:bg-dusk"
        >
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-sky-ink">
              {TIERS[profile.league.tier]}
            </p>
            <p className="font-extrabold">
              Rank #
              {standings(profile.league.week, profile.league.tier, profile.league.weeklyXp).find(
                (s) => s.isUser
              )?.rank ?? 20}{" "}
              · {profile.league.weeklyXp} XP this week
            </p>
          </div>
          <span className="rounded-full border-2 border-sky px-5 py-3 font-extrabold text-sky-ink">
            League
          </span>
        </Link>
      )}

      {/* WS-E Phase 5: this section carried the "trail map" name while being a plain course
        * accordion. It now routes honestly into the World system — the header opens the living
        * map surfaces (Trailhead / Atlas), and each course card below links straight to its
        * Basecamp (the canonical world course surface /courses/[slug] already redirects to). */}
      <SectionHeader
        waymark
        icon="route"
        title="The trail map"
        className="mt-10 mb-1"
        action={
          <span className="flex items-center gap-3 text-sm font-bold">
            <Link href="/trailhead" className="text-sky-ink hover:underline">
              Open the living map
            </Link>
            <Link href="/atlas" className="text-sky-ink hover:underline">
              Atlas
            </Link>
          </span>
        }
      />
      {Array.from(new Set(courses.map((c) => c.gradeLevel)))
        .sort((a, b) => a - b)
        .map((g) => {
          const bandCourses = courses.filter((c) => c.gradeLevel === g);
          const bandLessonIds = bandCourses.flatMap((c) => c.lessonIds);
          const bandDone = bandLessonIds.filter((id) => done.has(id)).length;
          const open = openBands ? openBands.has(g) : g === Math.min(...courses.map((c) => c.gradeLevel));
          return (
            <details
              key={g}
              open={open}
              onToggle={(e) => {
                const isOpen = (e.currentTarget as HTMLDetailsElement).open;
                setOpenBands((prev) => {
                  const nextSet = new Set(prev ?? []);
                  if (isOpen) nextSet.add(g);
                  else nextSet.delete(g);
                  return nextSet;
                });
              }}
              className="mt-3 overflow-hidden rounded-card bg-surface-2"
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-extrabold marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <AppIcon
                    name="chevronRight"
                    size={16}
                    className={`text-muted transition-transform ${open ? "rotate-90" : ""}`}
                  />
                  Math · {gradeBandLabel(g)}
                </span>
                {profile && bandLessonIds.length > 0 && (
                  <span className="text-xs font-bold tabular-nums text-muted">
                    {bandDone}/{bandLessonIds.length} lessons
                  </span>
                )}
              </summary>
              <TrailBand courses={bandCourses} done={done} hasProfile={Boolean(profile)} />
            </details>
          );
        })}
      </div>
    </div>
  );
}

function TrailBand({
  courses,
  done,
  hasProfile
}: {
  courses: DashCourse[];
  done: Set<string>;
  hasProfile: boolean;
}) {
  return (
    <div className="px-4 pb-4">
      <ol className="relative space-y-4 border-l-4 border-dotted border-ink/20 pl-5 dark:border-paper/20">
        {courses.map((c) => {
          const chDots = c.chapters.map(
            (ids) => ids.length > 0 && ids.every((id) => done.has(id))
          );
          const doneCount = c.lessonIds.filter((id) => done.has(id)).length;
          const pct =
            c.lessonIds.length === 0 ? 0 : Math.round((doneCount / c.lessonIds.length) * 100);
          return (
            <li key={c.slug} className="relative">
              <span
                aria-hidden
                className={`absolute -left-[31px] top-6 h-4 w-4 rounded-full border-4 ${
                  pct === 100
                    ? "border-sky bg-sky"
                    : pct > 0
                      ? "border-tangerine bg-paper dark:bg-night"
                      : "border-ink/25 bg-paper dark:border-paper/25 dark:bg-night"
                }`}
              />
              {c.comingSoon ? (
                <div className="rounded-card border-2 border-dashed border-ink/15 p-4 dark:border-paper/15">
                  <h3 className="font-extrabold text-ink/70 dark:text-paper/70">{c.title}</h3>
                  <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">{c.tagline}</p>
                  <p className="mt-2 text-xs font-bold text-tangerine-ink">
                    Coming soon{c.after.length > 0 ? ` · best after ${c.after.join(" & ")}` : ""}
                  </p>
                </div>
              ) : (
                <Link
                  href={`/basecamp/${c.courseId}`}
                  className="lift block rounded-card bg-surface p-4 ring-1 ring-ink/8 hover:ring-sky/50 dark:bg-dusk dark:ring-paper/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="flex min-w-0 items-center gap-2 font-extrabold">
                      <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-sky/10 text-sky-ink">
                        <AppIcon name={courseIcon(c.title)} size={15} />
                      </span>
                      <span className="truncate">{c.title}</span>
                    </h3>
                    {hasProfile && (
                      <span className="text-xs font-bold text-ink/70 dark:text-paper/70">
                        {doneCount}/{c.lessonIds.length}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">{c.tagline}</p>
                  {c.after.length > 0 && (
                    <p className="mt-1 text-xs font-bold text-ink/70 dark:text-paper/70">
                      Best after {c.after.join(" & ")}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1.5" aria-hidden>
                    {chDots.map((walked, i) => (
                      <span
                        key={i}
                        className={`h-2.5 rounded-full ${
                          walked ? "w-6 bg-sky" : "w-2.5 bg-ink/15 dark:bg-paper/15"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-[10px] font-bold text-ink/70 dark:text-paper/70">
                      chapters
                    </span>
                  </div>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
