"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { progressStore } from "@/lib/progress";
import { predictionReviews, type PredictionReview } from "@/lib/predictionReview";
import { localDateStr } from "@/lib/engine";
import { AppIcon } from "@/components/ui";

/**
 * "What surprised you" — the back half of the prediction loop. Lists lessons
 * whose predictions missed, due for a revisit the day AFTER the miss (delayed
 * retrieval: repair the model once the reveal has left working memory).
 * Renders nothing when there are no remembered surprises.
 */
export default function MissedPredictionsCard() {
  const [items, setItems] = useState<PredictionReview[] | null>(null);
  const [titles, setTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    const p = progressStore.load();
    const list = predictionReviews(p, localDateStr(new Date())).slice(0, 5);
    setItems(list);
    if (list.length === 0) return;
    let alive = true;
    fetch("/api/lesson-titles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: list.map((x) => x.lessonId) })
    })
      .then((r) => (r.ok ? r.json() : { titles: {} }))
      .then((d: { titles?: Record<string, string> }) => {
        if (alive) setTitles(d.titles ?? {});
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!items || items.length === 0) return null;
  const due = items.filter((x) => x.due);
  const upcoming = items.filter((x) => !x.due);

  return (
    <section
      aria-labelledby="missed-predictions-heading"
      className="rounded-card border-2 border-tangerine/40 bg-tangerine/5 p-5 dark:border-tangerine/30 dark:bg-dusk"
    >
      <h2 id="missed-predictions-heading" className="flex items-center gap-2 text-lg font-extrabold">
        <AppIcon name="icon-801" size={20} className="text-tangerine-ink" />
        What surprised you
      </h2>
      <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
        These lessons had a prediction the math disagreed with. A next-day revisit checks whether the
        model got repaired — not whether you remember the reveal.
      </p>
      {due.length > 0 && (
        <ul className="mt-3 grid gap-2">
          {due.map((x) => (
            <li key={x.lessonId} className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-surface shadow-e1 px-3 py-2 dark:border-paper/15 dark:bg-ink/20">
              <div className="min-w-0">
                <p className="truncate font-bold">{titles[x.lessonId] ?? x.lessonId}</p>
                <p className="text-xs text-ink/70 dark:text-paper/70">
                  {x.missed} of {x.total} prediction{x.total === 1 ? "" : "s"} missed on {x.at}
                </p>
              </div>
              <Link
                href={`/learn/${x.lessonId}`}
                className="pressable shrink-0 rounded-full bg-tangerine px-4 py-2 text-sm font-extrabold text-night hover:bg-tangerine/90"
              >
                Revisit
              </Link>
            </li>
          ))}
        </ul>
      )}
      {upcoming.length > 0 && (
        <p className="mt-3 text-xs font-bold text-ink/70 dark:text-paper/70">
          {due.length === 0 ? "Nothing due yet — " : "Also waiting: "}
          {upcoming.map((x) => titles[x.lessonId] ?? x.lessonId).join(", ")} — due tomorrow, once
          today's reveal has settled.
        </p>
      )}
    </section>
  );
}
