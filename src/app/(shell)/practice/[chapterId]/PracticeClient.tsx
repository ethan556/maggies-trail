"use client";

import Link from "next/link";
import { useState } from "react";
import { seededShuffle } from "@/lib/prng";
import { hasVariants, variantForStep } from "@/lib/variants";
import { recommendBand } from "@/lib/difficulty";
import QuizShell, { type QuizSummary, type Servable } from "@/components/QuizShell";
import { localDateStr, onMiss, xpFor } from "@/lib/engine";
import { awardNewBadges, type BadgeDef } from "@/lib/achievements";
import { applyXp, bump, progressStore } from "@/lib/progress";
import { applyResult } from "@/lib/mastery";

export interface PracticeItem extends Servable {
  conceptTag: string;
  lessonId: string;
  stepId: string;
  /** true when this round's numbers were generated fresh rather than replayed from the lesson */
  fresh?: boolean;
}

/** The practice order LOOKS arbitrary, but it must not BE arbitrary: seeded by chapter and date, so
 * the same practice set is reproducible — which is what lets a parent or a test re-run exactly what
 * the learner saw. Nothing in this app depends on unseeded randomness. */
function pick(pool: PracticeItem[], n: number, seed: string): PracticeItem[] {
  return seededShuffle(pool, seed).slice(0, Math.min(n, pool.length));
}

type Stage =
  | { at: "intro" }
  | { at: "quiz"; items: PracticeItem[] }
  | { at: "done"; summary: QuizSummary; badges: BadgeDef[] };

const PASS_BAR = 4;
const TESTOUT_XP = 50;

export default function PracticeClient({
  pool,
  chapterTitle,
  courseSlug,
  chapterId,
  chapterLessonIds,
  mode = "practice"
}: {
  pool: PracticeItem[];
  chapterTitle: string;
  courseSlug: string;
  chapterId: string;
  chapterLessonIds: string[];
  mode?: "practice" | "testout";
}) {
  const [stage, setStage] = useState<Stage>({ at: "intro" });
  const [items, setItems] = useState<PracticeItem[]>([]);

  /** Practice ROUND — every replay is a fresh round, and a fresh round means fresh NUMBERS.
   *
   * The authored items are the same five questions every time, so a second attempt tests recall of
   * the QUESTION rather than command of the IDEA. Where a concept has a parameterised generator, the
   * item is regenerated for this round instead: same misconception traps, different numbers, and the
   * whole thing seeded on (chapter, date, round) so it stays reproducible. */
  const [round, setRound] = useState(0);

  function start() {
    const roundSeed = `${chapterId}:${localDateStr(new Date())}:${round}`;
    // Each skill practises at ITS band: fragile or signal-laden skills get the
    // support surface, streaking-proficient ones get stretch (difficulty.ts —
    // pure and re-derivable from the profile, so a round is still reproducible
    // from (chapter, date, round, profile)). Authored fallbacks stay authored.
    const mastery = progressStore.load().mastery ?? {};
    const today = localDateStr(new Date());
    const picked = pick(pool, 5, roundSeed).map((item) => {
      if (!hasVariants(item.conceptTag)) return item;
      const band = recommendBand(mastery[item.conceptTag], today);
      const v = variantForStep(item, `${roundSeed}:${item.key}`, band);
      return v ? { ...item, widget: v.widget, fresh: true } : item;
    });
    setRound((r) => r + 1);
    setItems(picked);
    setStage({ at: "quiz", items: picked });
  }

  function record(key: string, r: { firstTry: boolean; hintsUsed: number; revealed: boolean }) {
    const p = progressStore.load();
    const today = localDateStr(new Date());
    applyXp(p, xpFor("check", r.firstTry ? 0 : 1, r.hintsUsed, r.revealed), today);
    // Practice was not feeding the mastery model either — the same hole as the review queue. A
    // practised skill is evidence like any other, and (with variants) it is evidence about the IDEA
    // rather than about one remembered question.
    const practised = items.find((i) => i.key === key);
    if (practised) {
      p.mastery = applyResult(p.mastery ?? {}, practised.conceptTag, r, today);
    }
    if (!r.firstTry) {
      // A practice miss is the same forgetting signal as a lesson miss.
      const item = items.find((i) => i.key === key);
      if (item) {
        p.review = onMiss(
          p.review,
          { conceptTag: item.conceptTag, lessonId: item.lessonId, stepId: item.stepId },
          today
        );
      }
    }
    progressStore.save(p);
  }

  if (stage.at === "intro")
    return (
      <div className="rounded-card border-2 border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-dusk">
        <p className="text-sm text-ink/70 dark:text-paper/70">
          {mode === "testout" ? (
            <>
              Five questions from <strong>{chapterTitle}</strong>. Get {PASS_BAR} or more right on
              the FIRST try and the whole chapter is marked walked (+{TESTOUT_XP} XP). Misses still
              join your Review trail — the test is honest both ways.
            </>
          ) : (
            <>
              Five mixed questions drawn from <strong>{chapterTitle}</strong> ({pool.length} in the
              pool). Anything you miss on the first try joins your Review trail.
            </>
          )}
        </p>
        <button
          type="button"
          onClick={start}
          className="pressable mt-4 min-h-11 rounded-full bg-cta px-6 py-3 font-extrabold text-white hover:bg-sky/90"
        >
          {mode === "testout" ? "Start the test-out" : "Start practice"}
        </button>
      </div>
    );

  if (stage.at === "quiz")
    return (
      <QuizShell
        items={stage.items}
        onResult={record}
        onFinished={(summary) => {
          const p = progressStore.load();
          if (mode === "practice" && summary.firstTry === summary.total) bump(p, "practiceSweeps");
          if (mode === "testout" && summary.firstTry >= PASS_BAR && !p.testouts?.[chapterId]) {
            p.testouts = { ...(p.testouts ?? {}), [chapterId]: true };
            for (const id of chapterLessonIds) {
              p.lessons[id] = { completed: true, bestXp: p.lessons[id]?.bestXp ?? 0 };
            }
            applyXp(p, TESTOUT_XP, localDateStr(new Date()));
          }
          const badges = awardNewBadges(p);
          progressStore.save(p);
          setStage({ at: "done", summary, badges });
        }}
      />
    );

  const { summary } = stage;
  const perfect = summary.firstTry === summary.total;
  const passed = mode === "testout" && summary.firstTry >= PASS_BAR;
  return (
    <div
      className={`rounded-card border-2 p-5 ${perfect ? "border-leaf bg-leaf/5" : "border-ink/10 bg-white dark:border-paper/10 dark:bg-dusk"}`}
    >
      <h2 className="text-lg font-extrabold">
        {mode === "testout"
          ? passed
            ? `Chapter cleared — ${summary.firstTry}/${summary.total}! 🚀`
            : `${summary.firstTry} of ${summary.total} — the bar is ${PASS_BAR}`
          : perfect
            ? "Clean sweep!"
            : `${summary.firstTry} of ${summary.total} on the first try`}
      </h2>
      {stage.badges.map((b) => (
        <p key={b.id} className="mt-2 rounded-card border-2 border-tangerine bg-tangerine/10 px-3 py-2 text-sm font-extrabold">
          {b.icon} Badge earned: {b.name} — <span className="font-normal">{b.desc}</span>
        </p>
      ))}
      <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">
        {mode === "testout"
          ? passed
            ? "Every lesson in the chapter is marked walked, and the test-out bonus is yours. The lessons stay open if you ever want the full trail."
            : "The full lessons will get you there — or take another run at the test any time. Your misses are already on the Review trail."
          : perfect
            ? "Every question, first try. This chapter is walked-in."
            : "The ones that got away are on your Review trail now — they'll come back at just the right time."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={start}
          className="pressable min-h-11 rounded-full bg-cta px-5 py-3 font-extrabold text-white hover:bg-sky/90"
        >
          {mode === "testout" ? "Take another run" : "Practice again"}
        </button>
        <Link
          href={`/courses/${courseSlug}`}
          className="min-h-11 rounded-full border-2 border-ink/15 px-5 py-3 font-extrabold hover:border-sky dark:border-paper/15"
        >
          Back to the course
        </Link>
      </div>
    </div>
  );
}
