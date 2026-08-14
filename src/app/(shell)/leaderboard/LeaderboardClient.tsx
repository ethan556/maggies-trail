"use client";

import { useEffect, useState } from "react";
import { localDateStr } from "@/lib/engine";
import { DEMOTE_COUNT, PROMOTE_COUNT, standings, TIERS, ensureLeague, type Standing } from "@/lib/league";
import { progressStore, type Profile } from "@/lib/progress";
import { AvatarDisplay } from "@/components/AvatarDisplay";

function daysUntilMonday(): number {
  return ((8 - new Date().getDay()) % 7) || 7;
}

export default function LeaderboardClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    const p = progressStore.load();
    ensureLeague(p, localDateStr(new Date()));
    progressStore.save(p);
    setProfile(p);
  }, []);

  if (!profile?.league)
    return (
      <div aria-busy="true">
        <p className="sr-only">Setting up your league…</p>
        <div aria-hidden className="h-72 animate-pulse rounded-card bg-ink/6 dark:bg-paper/8" />
      </div>
    );

  const { week, tier, weeklyXp, lastResult } = profile.league;
  const rows: Standing[] = standings(week, tier, weeklyXp);
  const days = daysUntilMonday();

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {TIERS.map((t, i) => (
          <span
            key={t}
            className={`rounded-full px-3 py-1 text-xs font-extrabold ${
              i === tier
                ? "bg-tangerine text-night"
                : "bg-ink/10 text-ink/70 dark:bg-paper/10 dark:text-paper/70"
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      {lastResult && lastResult !== "stayed" && (
        <p
          className={`mt-3 rounded-card border-2 px-4 py-2 text-sm font-bold ${
            lastResult === "promoted" ? "border-leaf bg-leaf/10 text-leaf-ink" : "border-berry bg-berry/10 text-berry-ink"
          }`}
        >
          {lastResult === "promoted"
            ? "Promoted last week — welcome to a faster trail!"
            : "Tough week — a fresh start down the trail. Climb back!"}
        </p>
      )}

      <p className="mt-3 text-sm font-bold text-ink/70 dark:text-paper/70">
        Top {PROMOTE_COUNT} climb · bottom {DEMOTE_COUNT} slide · resets in {days} {days === 1 ? "day" : "days"}
      </p>

      <ol className="mt-3 overflow-hidden rounded-card border border-ink/10 bg-surface shadow-e1 dark:border-paper/12">
        {rows.map((r, i) => {
          const inPromo = r.rank <= PROMOTE_COUNT;
          const inDemo = r.rank > rows.length - DEMOTE_COUNT;
          return (
            <li key={r.id}>
              {i === PROMOTE_COUNT && (
                <p className="border-y-2 border-dashed border-leaf/40 bg-leaf/5 px-4 py-1 text-[11px] font-extrabold uppercase tracking-wide text-leaf-ink">
                  ▲ promotion line
                </p>
              )}
              {i === rows.length - DEMOTE_COUNT && (
                <p className="border-y-2 border-dashed border-berry/40 bg-berry/5 px-4 py-1 text-[11px] font-extrabold uppercase tracking-wide text-berry-ink">
                  ▼ demotion line
                </p>
              )}
              <div
                className={`flex min-h-11 items-center gap-3 px-4 py-2 ${
                  r.isUser
                    ? "bg-sky/10 font-extrabold"
                    : inPromo
                      ? "bg-leaf/5"
                      : inDemo
                        ? "bg-berry/5"
                        : ""
                }`}
                aria-current={r.isUser ? "true" : undefined}
              >
                <span className="w-8 text-right tabular-nums text-ink/70 dark:text-paper/70">
                  {r.rank}
                </span>
                {r.isUser ? (
                  <AvatarDisplay
                    avatarId={profile.avatarId}
                    size={256}
                    className="h-7 w-7 shrink-0 rounded-full ring-2 ring-sky/40"
                  />
                ) : (
                  // Rivals are synthetic pacers, not real people — never a library portrait here.
                  // A plain spacer (not the placeholder silhouette) keeps every row's name aligned
                  // without implying a rival has — or is missing — an identity to pick.
                  <span aria-hidden className="h-7 w-7 shrink-0" />
                )}
                <span className="flex-1">
                  {r.name}
                  {r.isUser && " ⭐"}
                </span>
                <span className="tabular-nums">{r.xp} XP</span>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-ink/70 dark:text-paper/70">
        Rivals are practice pacers, not real people — every XP you earn this week counts here.
      </p>
    </div>
  );
}
