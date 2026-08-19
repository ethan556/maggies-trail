"use client";
/**
 * THE NOTEBOOK — a revisitable record of everything the learner has finished:
 * each completed lesson's authored takeaways, with a LIVE retained-mastery
 * reading that visibly fades as time passes. The fade is the review cue.
 *
 * Architecture: the card content ships as a static, cacheable index
 * (/notebook-index.json, emitted by gen-manifest) fetched once here — nothing
 * about the catalog rides in the app bundle, and the learner's side of the
 * derivation (which lessons, what strength) stays local-first in the profile.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { buildNotebook, type NotebookIndex, type NotebookSection } from "@/lib/notebook";
import { progressStore } from "@/lib/progress";
import { localDateStr } from "@/lib/engine";

type Stage = { at: "loading" } | { at: "error" } | { at: "ready"; sections: NotebookSection[] };

function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}

function Card({ c }: { c: NotebookSection["cards"][number] }) {
  return (
    <li className="rounded-card border border-ink/10 bg-surface p-4 shadow-e1 dark:border-paper/12">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/learn/${c.id}`}
          className="font-extrabold text-ink hover:underline dark:text-paper"
        >
          {c.title}
        </Link>
        {c.retained !== null && (
          <span className="shrink-0 text-sm font-extrabold tabular-nums text-ink/70 dark:text-paper/70">
            {pct(c.retained)}
          </span>
        )}
      </div>
      {c.retained !== null && (
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-ink/10 dark:bg-paper/10" aria-hidden="true">
          <div
            className={`progress-fill h-1.5 rounded-pill ${c.fading ? "bg-tangerine" : "bg-leaf"}`}
            style={{ width: `${Math.max(4, Math.round(c.retained * 100))}%` }}
          />
        </div>
      )}
      <ul className="mt-2 grid gap-1">
        {c.takeaways.map((t, i) => (
          <li key={i} className="text-sm text-ink/80 dark:text-paper/80">
            {t}
          </li>
        ))}
      </ul>
      {c.fading && (
        <p className="mt-2 text-xs font-bold text-tangerine-ink" data-testid="fading-cue">
          Fading — a quick{" "}
          <Link href="/review" className="underline">
            review
          </Link>{" "}
          will bring it back.
        </p>
      )}
    </li>
  );
}

export default function NotebookClient() {
  const [stage, setStage] = useState<Stage>({ at: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/notebook-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((index: NotebookIndex) => {
        if (!alive) return;
        const sections = buildNotebook(index, progressStore.load(), localDateStr(new Date()));
        setStage({ at: "ready", sections });
      })
      .catch(() => alive && setStage({ at: "error" }));
    return () => {
      alive = false;
    };
  }, [attempt]);

  if (stage.at === "loading") {
    return (
      <div aria-busy="true">
        <p className="sr-only">Opening your notebook…</p>
        <div aria-hidden className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 motion-safe:animate-pulse rounded-card bg-ink/6 dark:bg-paper/8" />
          ))}
        </div>
      </div>
    );
  }
  if (stage.at === "error") {
    return (
      <div role="alert" className="rounded-card border border-berry/30 bg-berry/5 p-4">
        <p className="text-sm text-ink/70 dark:text-paper/70">
          The notebook couldn&apos;t load just now. Your completed lessons are still saved.
        </p>
        <button
          type="button"
          onClick={() => {
            setStage({ at: "loading" });
            setAttempt((value) => value + 1);
          }}
          className="mt-3 min-h-11 rounded-full bg-cta px-4 font-extrabold text-white"
        >
          Try again
        </button>
      </div>
    );
  }
  if (stage.sections.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-ink/15 bg-surface-2 p-5 dark:border-paper/15">
        <h2 className="font-extrabold text-ink dark:text-paper">Nothing written down yet</h2>
        <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
          Finish a lesson and its key ideas land here automatically — your own record of the trail so
          far, with a live reading of how strongly each idea is holding.{" "}
          <Link href="/courses" className="font-bold underline">
            Pick up the trail
          </Link>
          .
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-5">
      <p className="text-sm text-ink/70 dark:text-paper/70">
        Every lesson you finish writes its key ideas here. The strength bar is what you&apos;re
        expected to <em>retain today</em> — it fades with time away, and fading is the signal to
        review, not a penalty.
      </p>
      {stage.sections.map((s) => (
        <section key={s.courseTitle}>
          <h2 className="waymark-label mb-2 text-sm font-extrabold uppercase tracking-wide text-muted">
            {s.courseTitle}
          </h2>
          <ul className="grid gap-3">
            {s.cards.map((c) => (
              <Card key={c.id} c={c} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
