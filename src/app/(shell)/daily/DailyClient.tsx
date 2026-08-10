"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import QuizShell, { type Servable } from "@/components/QuizShell";
import { localDateStr, xpFor } from "@/lib/engine";
import { awardNewBadges } from "@/lib/achievements";
import { applyXp, progressStore } from "@/lib/progress";
import type { TDailyCategory, TDailyProblem } from "@/lib/schema";

const CATEGORY_META: Record<TDailyCategory, { label: string; icon: string }> = {
  multiplication: { label: "Multiplication & Division", icon: "✖️" },
  "place-value": { label: "Place Value", icon: "🔢" },
  fractions: { label: "Fractions", icon: "🍰" },
  measurement: { label: "Measurement & Data", icon: "📏" },
  geometry: { label: "Shapes & Space", icon: "🔷" },
  "multiply-bigger": { label: "Multiply Bigger", icon: "🧮" },
  millions: { label: "Place Value to a Million", icon: "💯" },
  "fraction-ops": { label: "Fractions That Add Up", icon: "➗" },
  "measure-convert": { label: "Measure & Convert", icon: "📐" },
  "lines-angles": { label: "Lines & Angles", icon: "📏" }
};

type Grade = 3 | 4;

interface DailyPayload {
  date: string;
  day: number;
  grade: Grade;
  categories: Array<{ category: TDailyCategory; problem: TDailyProblem | null }>;
}

type Stage =
  | { at: "loading" }
  | { at: "error"; message: string }
  | { at: "grid"; data: DailyPayload; doneKeys: Set<string> }
  | { at: "quiz"; data: DailyPayload; doneKeys: Set<string>; category: TDailyCategory; problem: TDailyProblem };

export default function DailyClient() {
  const [grade, setGrade] = useState<Grade>(3);
  const [stage, setStage] = useState<Stage>({ at: "loading" });
  const [reload, setReload] = useState(0);
  const today = localDateStr(new Date());

  useEffect(() => {
    const controller = new AbortController();
    const p = progressStore.load();
    const doneKeys = new Set(Object.keys(p.dailyDone ?? {}).filter((k) => p.dailyDone?.[k]));
    setStage({ at: "loading" });
    fetch(`/api/daily?date=${today}&grade=${grade}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Daily challenges failed (${r.status})`);
        const data = (await r.json()) as DailyPayload;
        if (!Array.isArray(data.categories)) throw new Error("Daily challenges were malformed");
        return data;
      })
      .then((data) => setStage({ at: "grid", data, doneKeys }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setStage({
          at: "error",
          message: error instanceof Error ? error.message : "Daily challenges could not load."
        });
      });
    return () => controller.abort();
  }, [grade, reload, today]);

  function markDone(category: TDailyCategory) {
    const p = progressStore.load();
    const dd = p.dailyDone ?? {};
    dd[`${today}:${category}`] = true;
    p.dailyDone = dd;
    // A finished daily keeps the streak alive — showing up counts.
    if (!p.activity.active.includes(today)) p.activity.active.push(today);
    awardNewBadges(p);
    progressStore.save(p);
  }

  if (stage.at === "loading")
    return (
      <div aria-busy="true">
        <p className="sr-only">Setting out today's challenges…</p>
        <div aria-hidden className="flex gap-2">
          <div className="h-11 w-24 animate-pulse rounded-pill bg-ink/8 dark:bg-paper/10" />
          <div className="h-11 w-24 animate-pulse rounded-pill bg-ink/8 dark:bg-paper/10" />
        </div>
        <div aria-hidden className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-card bg-ink/6 dark:bg-paper/8" />
          ))}
        </div>
      </div>
    );

  if (stage.at === "error")
    return (
      <div role="alert" className="rounded-card border border-amber-300 bg-amber-50 p-5 dark:border-amber-700 dark:bg-amber-950/30">
        <h2 className="text-lg font-extrabold">Today’s challenges couldn’t load</h2>
        <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">Your progress is safe. Check the connection and try again.</p>
        <button
          type="button"
          onClick={() => setReload((n) => n + 1)}
          className="pressable mt-4 min-h-11 rounded-pill bg-cta px-5 py-2.5 font-extrabold text-white hover:bg-sky/90"
        >
          Try again
        </button>
      </div>
    );

  if (stage.at === "quiz") {
    const { problem, category } = stage;
    const item: Servable = {
      key: problem.id,
      body: problem.body,
      widget: problem.widget,
      hints: problem.hints,
      explanationVariants: problem.explanationVariants,
      context: CATEGORY_META[category].label
    };
    return (
      <div>
        <QuizShell
          items={[item]}
          onResult={(_key, r) => {
            const p = progressStore.load();
            applyXp(p, xpFor("challenge", r.firstTry ? 0 : 1, r.hintsUsed, r.revealed), today);
            progressStore.save(p);
          }}
          onFinished={() => {
            markDone(category);
            const doneKeys = new Set(stage.doneKeys);
            doneKeys.add(`${today}:${category}`);
            setStage({ at: "grid", data: stage.data, doneKeys });
          }}
        />
      </div>
    );
  }

  const { data, doneKeys } = stage;
  const answered = data.categories.filter(
    (c) => c.problem && doneKeys.has(`${today}:${c.category}`)
  ).length;
  const available = data.categories.filter((c) => c.problem).length;

  return (
    <div>
      <div className="flex gap-2" role="group" aria-label="Choose grade">
        {([3, 4] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGrade(g)}
            aria-pressed={grade === g}
            className={`pressable min-h-11 rounded-pill border-2 px-4 py-2 text-sm font-extrabold transition-colors ${
              grade === g
                ? "border-sky bg-cta text-white shadow-e1"
                : "border-ink/15 text-content-2 hover:border-sky hover:text-sky-ink dark:border-paper/15"
            }`}
          >
            Grade {g}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm font-bold text-ink/70 dark:text-paper/70">
        Day {data.day} of the rotation · {answered}/{available} answered today
        {answered > 0 && " · streak fed 🔥"}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {data.categories.length === 0 && (
          <p className="col-span-full rounded-card border border-dashed border-ink/15 bg-surface-2 p-4 text-sm font-bold text-muted dark:border-paper/15">
            Grade {grade} dailies are on their way — check back soon!
          </p>
        )}
        {data.categories.map(({ category, problem }) => {
          const meta = CATEGORY_META[category];
          const done = problem ? doneKeys.has(`${today}:${category}`) : false;
          if (!problem)
            return (
              <div
                key={category}
                className="rounded-card border border-dashed border-ink/15 bg-surface-2 p-4 dark:border-paper/15"
              >
                <p className="text-2xl" aria-hidden>
                  {meta.icon}
                </p>
                <h2 className="mt-1 font-extrabold text-ink/70 dark:text-paper/70">{meta.label}</h2>
                <p className="mt-1 text-xs font-bold text-tangerine-ink">
                  Challenges arrive with this course
                </p>
              </div>
            );
          return (
            <button
              key={category}
              type="button"
              disabled={done}
              onClick={() =>
                setStage({ at: "quiz", data, doneKeys, category, problem })
              }
              className={`rounded-card border p-4 text-left ${
                done
                  ? "border-leaf/50 bg-leaf/5"
                  : "lift pressable border-ink/10 bg-surface shadow-e1 hover:border-sky dark:border-paper/12"
              }`}
            >
              <p className="text-2xl" aria-hidden>
                {meta.icon}
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <h2 className="font-extrabold">{meta.label}</h2>
                {done && (
                  <span className="rounded-full bg-cta-good px-2 py-0.5 text-xs font-extrabold text-white">
                    ✓ done
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
                {done ? "Answered — back tomorrow!" : "One challenge, three hints if you need them."}
              </p>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-ink/70 dark:text-paper/70">
        Answering any daily keeps your streak alive — right, wrong, or revealed. Showing up counts.
      </p>
      <Link
        href="/dashboard"
        className="pressable mt-4 inline-block rounded-pill border-2 border-ink/15 bg-surface px-5 py-3 font-extrabold transition-colors hover:border-sky hover:text-sky-ink dark:border-paper/20"
      >
        Back to the trail
      </Link>
    </div>
  );
}
