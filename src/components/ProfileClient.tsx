"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addDays, computeStreak, localDateStr } from "@/lib/engine";
import { classify, PROFICIENT, retainedMastery, summarize, type MasteryBand } from "@/lib/mastery";
import { awardNewBadges, BADGES } from "@/lib/achievements";
import { progressStore, type Profile } from "@/lib/progress";

export interface ProfileCourse {
  slug: string;
  title: string;
  gradeLevel: number;
  lessonIds: string[];
  conceptTags: string[];
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function StreakCalendar({ profile, today }: { profile: Profile; today: string }) {
  const active = new Set(profile.activity.active);
  const frozen = new Set(profile.activity.frozen);
  // last 28 days, oldest first
  const days: string[] = [];
  for (let i = 27; i >= 0; i--) days.push(addDays(today, -i));
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5" role="img" aria-label="Activity for the last 28 days">
        {days.map((d) => {
          const isActive = active.has(d);
          const isFrozen = frozen.has(d);
          return (
            <span
              key={d}
              title={`${d}${isActive ? " — active" : isFrozen ? " — streak freeze" : ""}`}
              className={`h-6 w-full rounded ${
                isActive
                  ? "bg-sky"
                  : isFrozen
                    ? "border-2 border-tangerine bg-tangerine/20"
                    : "bg-ink/10 dark:bg-paper/10"
              } ${d === today ? "ring-2 ring-tangerine ring-offset-1 ring-offset-paper dark:ring-offset-night" : ""}`}
            />
          );
        })}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-ink/70 dark:text-paper/70">
        {days.slice(0, 7).map((d, i) => (
          <span key={d} aria-hidden>
            {DAY_LABELS[(new Date(d + "T12:00:00").getDay() + 6) % 7] ?? DAY_LABELS[i]}
          </span>
        ))}
      </div>
    </div>
  );
}

const BAND_META: Record<MasteryBand, { label: string; bar: string; text: string }> = {
  new: { label: "New", bar: "bg-ink/20", text: "text-ink/70 dark:text-paper/70" },
  developing: { label: "Developing", bar: "bg-berry", text: "text-berry-ink" },
  practicing: { label: "Practicing", bar: "bg-tangerine", text: "text-tangerine-ink" },
  proficient: { label: "Proficient", bar: "bg-sky", text: "text-sky-ink" },
  mastered: { label: "Mastered", bar: "bg-leaf", text: "text-leaf-ink" }
};

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-card border border-ink/10 bg-surface shadow-e1 px-4 py-3 dark:border-paper/12">
      <p className="text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="text-xs font-bold text-ink/70 dark:text-paper/70">{label}</p>
    </div>
  );
}

export function MasteryPanel({ profile, courses, today }: { profile: Profile; courses: ProfileCourse[]; today: string }) {
  const mastery = profile.mastery ?? {};
  const tags = Object.keys(mastery);
  if (tags.length === 0) {
    return (
      <div className="rounded-card border border-ink/10 bg-surface shadow-e1 p-4 text-sm text-ink/70 dark:border-paper/12 dark:text-paper/70">
        <p>
          Finish a few lesson checks and your skill mastery grows here — you'll see which ideas are
          solid and which are fading and due for review.
        </p>
        <a href="/placement" className="mt-3 inline-block font-extrabold text-sky-ink hover:underline">
          Or take a 5-question placement to find your starting point →
        </a>
      </div>
    );
  }
  const sum = summarize(mastery);

  const perCourse = courses
    .map((c) => {
      const touched = c.conceptTags.filter((t) => mastery[t]);
      if (touched.length === 0) return null;
      const avg = touched.reduce((s, t) => s + mastery[t].mastery, 0) / touched.length;
      const mastered = touched.filter((t) => classify(mastery[t]) === "mastered").length;
      return { slug: c.slug, title: c.title, gradeLevel: c.gradeLevel, avg, touched: touched.length, mastered };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.gradeLevel - b.gradeLevel || b.avg - a.avg);

  const tagCourse: Record<string, string> = {};
  for (const c of courses) for (const t of c.conceptTags) if (!(t in tagCourse)) tagCourse[t] = c.title;

  const slipped = tags
    .map((t) => ({ tag: t, state: mastery[t], retained: retainedMastery(mastery[t], today) }))
    .filter((x) => x.state.mastery >= PROFICIENT && x.retained < PROFICIENT)
    .sort((a, b) => a.retained - b.retained)
    .slice(0, 6);

  const bandOrder: MasteryBand[] = ["mastered", "proficient", "practicing", "developing"];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat value={sum.total} label="skills practiced" />
        <Stat value={sum.masteredOrProficient} label="proficient+" />
        <Stat value={`${Math.round(sum.averageMastery * 100)}%`} label="avg mastery" />
      </div>

      <div className="rounded-card border border-ink/10 bg-surface shadow-e1 p-4 dark:border-paper/12">
        <div className="flex h-3 overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10">
          {bandOrder.map((b) =>
            sum.byBand[b] ? (
              <div
                key={b}
                className={BAND_META[b].bar}
                style={{ width: `${(sum.byBand[b] / sum.total) * 100}%` }}
                title={`${BAND_META[b].label}: ${sum.byBand[b]}`}
              />
            ) : null
          )}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
          {bandOrder.map((b) =>
            sum.byBand[b] ? (
              <li key={b} className={BAND_META[b].text}>
                <span className={`mr-1 inline-block h-2 w-2 rounded-full align-middle ${BAND_META[b].bar}`} aria-hidden />
                {BAND_META[b].label} {sum.byBand[b]}
              </li>
            ) : null
          )}
        </ul>
      </div>

      {perCourse.length > 0 && (
        <ul className="space-y-2">
          {perCourse.map((c) => (
            <li key={c.slug} className="rounded-card border border-ink/10 bg-surface shadow-e1 p-3 dark:border-paper/12">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-extrabold">{c.title}</span>
                <span className="text-xs font-bold tabular-nums text-ink/70 dark:text-paper/70">
                  {c.mastered}/{c.touched} mastered
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10">
                <div
                  className="h-full rounded-full bg-sky"
                  style={{ width: `${Math.round(c.avg * 100)}%` }}
                  aria-label={`${c.title} average mastery ${Math.round(c.avg * 100)} percent`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {slipped.length > 0 && (
        <div className="rounded-card border-2 border-tangerine/40 bg-tangerine/5 p-4">
          <p className="text-sm font-extrabold text-tangerine-ink">Fading — worth a review</p>
          <ul className="mt-2 space-y-1 text-sm">
            {slipped.map((s) => (
              <li key={s.tag} className="flex items-center justify-between gap-3">
                <span className="font-semibold capitalize">{s.tag.replace(/-/g, " ")}</span>
                <span className="shrink-0 text-xs text-ink/70 dark:text-paper/70">
                  was {Math.round(s.state.mastery * 100)}% · now ~{Math.round(s.retained * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PrefToggle({ label, desc, on, onToggle }: { label: string; desc: string; on: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-card border border-ink/10 bg-surface shadow-e1 p-4 dark:border-paper/12">
      <div>
        <p className="font-extrabold">{label}</p>
        <p className="text-sm text-ink/70 dark:text-paper/70">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onToggle(!on)}
        className="flex h-11 w-12 shrink-0 items-center justify-center"
      >
        <span
          className={`relative block h-7 w-12 rounded-full border-2 transition-colors ${
            on ? "border-leaf bg-leaf" : "border-ink/25 bg-ink/10 dark:border-paper/25 dark:bg-paper/10"
          }`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
        </span>
      </button>
    </div>
  );
}

export default function ProfileClient({ courses }: { courses: ProfileCourse[] }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    const p = progressStore.load();
    awardNewBadges(p, { courses });
    progressStore.save(p);
    setProfile(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!profile) return <p className="text-ink/70 dark:text-paper/70">Loading your trail log…</p>;

  const today = localDateStr(new Date());
  const streak = computeStreak(profile.activity, today).streak;
  const done = new Set(Object.keys(profile.lessons).filter((id) => profile.lessons[id].completed));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Trail mix (XP)", value: profile.xp, accent: true },
          { label: "Day streak", value: streak, accent: false },
          { label: "Lessons walked", value: done.size, accent: false }
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-card border border-ink/10 bg-surface shadow-e1 px-4 py-3 dark:border-paper/12"
          >
            <p className={`text-2xl font-extrabold tabular-nums ${s.accent ? "text-tangerine-ink" : ""}`}>
              {s.value}
            </p>
            <p className="text-xs font-bold text-ink/70 dark:text-paper/70">{s.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="waymark-label text-sm font-extrabold uppercase tracking-wide text-muted">
          Mastery
        </h2>
        <div className="mt-2">
          <MasteryPanel profile={profile} courses={courses} today={today} />
        </div>
      </section>

      <section>
        <h2 className="waymark-label text-sm font-extrabold uppercase tracking-wide text-muted">
          Trail mix earned — last 14 days
        </h2>
        <div className="mt-2 rounded-card border border-ink/10 bg-surface shadow-e1 p-4 dark:border-paper/12">
          {(() => {
            const days: string[] = [];
            for (let i = 13; i >= 0; i--) days.push(addDays(today, -i));
            const vals = days.map((d) => profile.xpByDay?.[d] ?? 0);
            const max = Math.max(...vals, 1);
            return (
              <div
                className="flex h-24 items-end gap-1"
                role="img"
                aria-label={`XP per day for the last 14 days; best day ${max} XP`}
              >
                {days.map((d, i) => (
                  <div key={d} className="flex flex-1 flex-col items-center gap-1" title={`${d}: ${vals[i]} XP`}>
                    <span
                      className={`w-full rounded-t ${vals[i] > 0 ? "bg-tangerine" : "bg-ink/10 dark:bg-paper/10"}`}
                      style={{ height: `${Math.max(4, (vals[i] / max) * 88)}px` }}
                    />
                  </div>
                ))}
              </div>
            );
          })()}
          <p className="mt-2 text-xs text-ink/70 dark:text-paper/70">
            Lessons, reviews, practice, and dailies all feed the pile.
          </p>
        </div>
      </section>

      <section>
        <h2 className="waymark-label text-sm font-extrabold uppercase tracking-wide text-muted">
          Last four weeks
        </h2>
        <div className="mt-2 rounded-card border border-ink/10 bg-surface shadow-e1 p-4 dark:border-paper/12">
          <StreakCalendar profile={profile} today={today} />
          <p className="mt-3 text-xs text-ink/70 dark:text-paper/70">
            <span className="mr-3 inline-flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-sky" /> active day
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded border-2 border-tangerine bg-tangerine/20" />{" "}
              streak freeze
            </span>
          </p>
        </div>
      </section>

      <section>
        <h2 className="waymark-label text-sm font-extrabold uppercase tracking-wide text-muted">
          Badges ({profile.badges.length}/{BADGES.length})
        </h2>
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BADGES.map((b) => {
            const earned = profile.badges.includes(b.id);
            return (
              <li
                key={b.id}
                className={`rounded-card border-2 px-3 py-2 ${
                  earned
                    ? "border-tangerine/60 bg-tangerine/10"
                    : "border-ink/10 bg-surface-2 dark:border-paper/10 dark:bg-paper/5"
                }`}
                title={b.desc}
              >
                <p className="text-xl" aria-hidden>
                  {earned ? b.icon : "🔒"}
                </p>
                <p className="text-xs font-extrabold">{b.name}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-ink/70 dark:text-paper/70">{b.desc}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="waymark-label text-sm font-extrabold uppercase tracking-wide text-muted">
          Daily goal
        </h2>
        <div className="mt-2 rounded-card border border-ink/10 bg-surface shadow-e1 p-4 dark:border-paper/12">
          <p className="text-sm text-ink/70 dark:text-paper/70">
            Lessons per day to fill the ring on your dashboard. Any finished lesson keeps your
            streak alive either way.
          </p>
          <div className="mt-3 flex gap-2" role="group" aria-label="Daily goal in lessons">
            {[1, 2, 3].map((g) => {
              const current = (profile.dailyGoal ?? 1) === g;
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={current}
                  onClick={() => {
                    const p = progressStore.load();
                    p.dailyGoal = g;
                    progressStore.save(p);
                    setProfile(p);
                  }}
                  className={`min-h-11 min-w-11 rounded-full border-2 px-4 font-extrabold ${
                    current
                      ? "border-sky bg-cta text-white"
                      : "border-ink/15 hover:border-sky dark:border-paper/15"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <h2 className="waymark-label text-sm font-extrabold uppercase tracking-wide text-muted">
          Preferences
        </h2>
        <div className="mt-2 space-y-2">
          <PrefToggle
            label="Reduce animations"
            desc="Turn off motion and reveals — figures and text appear instantly, no movement."
            on={profile.reduceMotion === true}
            onToggle={(v) => {
              const p = progressStore.load();
              p.reduceMotion = v;
              progressStore.save(p);
              if (typeof document !== "undefined") {
                if (v) document.documentElement.dataset.reduceMotion = "true";
                else delete document.documentElement.dataset.reduceMotion;
              }
              setProfile(p);
            }}
          />
          <div className="rounded-card border-2 border-ink/10 p-3 dark:border-paper/15">
            <p className="font-extrabold">Text size</p>
            <p className="text-sm text-ink/70 dark:text-paper/70">
              Larger sizes scale the whole page together, so nothing overlaps.
            </p>
            <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Text size">
              {([
                ["md", "Default"],
                ["lg", "Large"],
                ["xl", "Larger"]
              ] as const).map(([v, label]) => {
                const active = (profile.textScale ?? "md") === v;
                return (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      const p = progressStore.load();
                      if (v === "md") delete p.textScale;
                      else p.textScale = v;
                      progressStore.save(p);
                      if (typeof document !== "undefined") {
                        if (v === "md") delete document.documentElement.dataset.textScale;
                        else document.documentElement.dataset.textScale = v;
                      }
                      setProfile(p);
                    }}
                    className={`pressable min-h-11 rounded-pill border-2 px-4 font-bold ${
                      active
                        ? "border-sky-ink bg-sky/10 text-sky-ink"
                        : "border-ink/15 text-content-2 hover:border-sky-ink hover:text-sky-ink dark:border-paper/20"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <PrefToggle
            label="Open reading spacing"
            desc="Wider space between letters, words, and lines in reading text — equations and figures stay exact."
            on={profile.openReading === true}
            onToggle={(v) => {
              const p = progressStore.load();
              if (v) p.openReading = true;
              else delete p.openReading;
              progressStore.save(p);
              if (typeof document !== "undefined") {
                if (v) document.documentElement.dataset.readingSpace = "open";
                else delete document.documentElement.dataset.readingSpace;
              }
              setProfile(p);
            }}
          />
          <PrefToggle
            label="Follow recommendations"
            desc="Show mastery-based nudges on your dashboard. Turn off to stay on your chosen course without prompts to jump around."
            on={profile.followRecs !== false}
            onToggle={(v) => {
              const p = progressStore.load();
              p.followRecs = v;
              progressStore.save(p);
              setProfile(p);
            }}
          />
        </div>
      </section>

      <section>
        <h2 className="waymark-label text-sm font-extrabold uppercase tracking-wide text-muted">
          Course progress
        </h2>
        <ul className="mt-2 space-y-3">
          {courses.map((c) => {
            const dc = c.lessonIds.filter((id) => done.has(id)).length;
            const pct = c.lessonIds.length === 0 ? 0 : Math.round((dc / c.lessonIds.length) * 100);
            return (
              <li
                key={c.slug}
                className="rounded-card border border-ink/10 bg-surface shadow-e1 p-4 dark:border-paper/12"
              >
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/courses/${c.slug}`} className="font-extrabold hover:text-sky-ink">
                    {c.title}
                  </Link>
                  <span className="text-xs font-bold tabular-nums text-ink/70 dark:text-paper/70">
                    {dc}/{c.lessonIds.length}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${c.title} progress`}
                  className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10"
                >
                  <div className="h-full rounded-full bg-sky" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
