"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { progressStore } from "@/lib/progress";
import { authProvider, SESSION_CHANGED_EVENT } from "@/lib/auth";
import { isPremium } from "@/lib/entitlement";
import { LinkButton, ProgressBar } from "@/components/ui";

export interface SyllabusChapter {
  id: string;
  title: string;
  lessons: Array<{ id: string; title: string; minutes: number }>;
}

/** Demo premium flag — ch1 free; later chapters show a soft upsell chip (never a hard lock).
 * Asks the entitlement layer, not the raw profile flag, so an ACCOUNT-level family plan unlocks
 * every learner on the roster (the profile flag remains a legacy fallback). */
function usePremium(): boolean {
  const [premium, setPremium] = useState(true); // SSR-safe optimistic default
  useEffect(() => {
    const readSession = () => {
      try {
        const accountId = authProvider.currentSession()?.accountId ?? null;
        setPremium(isPremium(progressStore.load(), accountId));
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

export default function SyllabusClient({ chapters }: { chapters: SyllabusChapter[] }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const premium = usePremium();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const p = progressStore.load();
    setDone(new Set(Object.keys(p.lessons).filter((id) => p.lessons[id].completed)));
    setLoaded(true);
  }, []);

  const ordered = chapters.flatMap((ch) => ch.lessons);
  const total = ordered.length;
  const doneCount = ordered.filter((l) => done.has(l.id)).length;
  const next = ordered.find((l) => !done.has(l.id));
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <div className="mt-6">
      {/* Progress header — fixed min-height so the hydrated card lands without layout shift. */}
      <div className="min-h-[104px] rounded-card border border-ink/10 bg-surface p-4 shadow-e1 dark:border-paper/12">
        {loaded ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-bold">
                {doneCount} of {total} lessons walked
              </p>
              {next ? (
                <LinkButton href={`/learn/${next.id}`} size="md" iconRight="icon-701">
                  {doneCount === 0 ? "Start the trail" : `Continue: ${next.title}`}
                </LinkButton>
              ) : total > 0 ? (
                <LinkButton href={`/learn/${ordered[0].id}`} size="md" className="!bg-leaf enabled:hover:!bg-leaf/90">
                  Trail complete — walk it again
                </LinkButton>
              ) : null}
            </div>
            <ProgressBar value={pct} label="Course progress" className="mt-3" />
          </>
        ) : (
          <div aria-hidden className="animate-pulse">
            <div className="h-6 w-44 rounded-pill bg-ink/8 dark:bg-paper/10" />
            <div className="mt-2 h-11 w-56 rounded-pill bg-ink/8 dark:bg-paper/10" />
            <div className="mt-3 h-2 w-full rounded-pill bg-ink/8 dark:bg-paper/10" />
          </div>
        )}
      </div>

      <ol className="mt-6 space-y-6">
        {chapters.map((ch, ci) => {
          const chDone = ch.lessons.filter((l) => done.has(l.id)).length;
          return (
            <li key={ch.id}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex min-w-0 items-center gap-2.5 text-lg font-extrabold">
                  <span
                    aria-hidden
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-sm font-extrabold ${
                      loaded && chDone === ch.lessons.length && ch.lessons.length > 0
                        ? "bg-cta-good text-white"
                        : loaded && ch.lessons.some((l) => next?.id === l.id)
                          ? "bg-tangerine text-night"
                          : "bg-ink/8 text-ink/70 dark:bg-paper/10 dark:text-paper/70"
                    }`}
                  >
                    {loaded && chDone === ch.lessons.length && ch.lessons.length > 0 ? "✓" : ci + 1}
                  </span>
                  <span className="sr-only">Chapter {ci + 1}: </span>
                  <span className="truncate">{ch.title}</span>
                  {!premium && ci > 0 && (
                    <Link
                      href="/premium"
                      className="pressable ml-2 inline-flex min-h-6 items-center rounded-pill bg-tangerine/10 px-2 align-middle text-[11px] font-extrabold uppercase tracking-wide text-tangerine-ink hover:underline"
                    >
                      Premium
                    </Link>
                  )}
                </h2>
                <span className="flex items-center gap-3">
                  {loaded && (
                    <span className="text-xs font-bold tabular-nums text-muted">
                      {chDone}/{ch.lessons.length}
                    </span>
                  )}
                  <Link
                    href={`/practice/${ch.id}`}
                    className="pressable rounded-pill border border-ink/15 px-3 py-1.5 text-xs font-extrabold transition-colors hover:border-sky hover:text-sky-ink dark:border-paper/15"
                  >
                    Practice
                  </Link>
                  {loaded && chDone < ch.lessons.length && (
                    <Link
                      href={`/practice/${ch.id}?testout=1`}
                      className="pressable rounded-pill border border-tangerine/50 px-3 py-1.5 text-xs font-extrabold text-tangerine-ink transition-colors hover:border-tangerine"
                    >
                      Test out
                    </Link>
                  )}
                </span>
              </div>
              {/* The trail itself: a rail connects the markers — walked stretches are
                  leaf, the path ahead is a faint hairline. Done = leaf ✓ (confirmed),
                  the next step = tangerine (where attention goes), ahead = neutral. */}
              <ul className="mt-2 rounded-card border border-ink/10 bg-surface shadow-e1 dark:border-paper/12">
                {ch.lessons.map((l, li) => {
                  const isDone = done.has(l.id);
                  const isNext = loaded && next?.id === l.id;
                  const prevDone = li > 0 && done.has(ch.lessons[li - 1].id);
                  return (
                    <li key={l.id} className="relative">
                      {li > 0 && (
                        <span
                          aria-hidden
                          className={`absolute left-[29px] top-0 h-1/2 w-0.5 ${prevDone ? "bg-leaf/55" : "bg-ink/12 dark:bg-paper/12"}`}
                        />
                      )}
                      {li < ch.lessons.length - 1 && (
                        <span
                          aria-hidden
                          className={`absolute bottom-0 left-[29px] h-1/2 w-0.5 ${isDone ? "bg-leaf/55" : "bg-ink/12 dark:bg-paper/12"}`}
                        />
                      )}
                      <Link
                        href={`/learn/${l.id}`}
                        className="group relative flex min-h-12 items-center gap-3 rounded-card px-4 py-2 transition-colors hover:bg-sky/5"
                      >
                        <span
                          aria-hidden
                          className={`relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-pill text-xs font-extrabold ring-4 ring-surface transition-transform group-hover:scale-105 motion-reduce:transition-none ${
                            isDone
                              ? "bg-cta-good text-white"
                              : isNext
                                ? "bg-tangerine text-night"
                                : "bg-ink/10 text-ink/70 dark:bg-paper/10 dark:text-paper/70"
                          }`}
                        >
                          {isDone ? "✓" : li + 1}
                        </span>
                        <span className="flex-1 font-bold">
                          {l.title}
                          {isNext && (
                            <span className="ml-2 rounded-pill bg-tangerine/10 px-2 py-0.5 align-middle text-[10px] font-extrabold uppercase tracking-wide text-tangerine-ink">
                              Next
                            </span>
                          )}
                        </span>
                        {isDone && <span className="sr-only">(completed)</span>}
                        <span className="text-xs tabular-nums text-muted">{l.minutes} min</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
