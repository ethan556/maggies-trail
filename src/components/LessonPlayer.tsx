"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TLesson } from "@/lib/schema";
import { canCheck, correctAnswerText, learnerAnswerText } from "@/lib/evaluate";
import { computeStreak, localDateStr } from "@/lib/engine";
import { useEnterAdvance } from "@/lib/keys";
import { prefersReducedMotion, useCountUp } from "@/lib/motion";
import { AppIcon, HINT_RUNGS, StatusBanner } from "@/components/ui";
import { seededShuffle } from "@/lib/prng";
import FigureView from "@/components/FigureView";
import { FIGURE_IDS } from "@/components/figureIds";
import { stageWidthClass, stepTier } from "@/components/stageWidth";
import { progressStore } from "@/lib/progress";
import { COPY } from "@/lib/copy";
import WidgetView from "@/components/WidgetView";
import type { StageTone } from "./widgets";
import { CausalMasteryPanel } from "@/components/CausalMasteryPanel";
import { resolveCMLMeta } from "@/lib/cml/catalog";
import { classifyProcess, MULTI_CONTROL, processCue as processCue2, type ProcessEvent } from "@/lib/processEvents";
import { responseCopy } from "@/lib/adaptivePolicy";
import { classifyBaseTen, classifyFraction, classifyGraph, classifyNumberLine, classifyRatio, strategyCue, type Strategy } from "@/lib/strategyClassifiers";
import { sameCMLValue, usePlayer } from "./playerStore";
import { GoalRing, Narration, Rich, SparkBurst, SummitRoute, TrailAtmosphere, TrailDots } from "./playerChrome";
import { MathProse } from "@/components/math/MathText";
import { isFigureTextAligned } from "@/lib/figureTextAlignment";


export interface NextLesson {
  id: string;
  title: string;
}

/** Server-resolved route context. Keeping this out of client discovery avoids
 * a post-hydration jump and lets the learner feel located on the trail from
 * the first painted frame. */
export type GradeBand = "early" | "middle" | "upper";

export interface LessonTrailContext {
  /** Density band derived from the course grade level (S110): K-2 early,
   * 3-8 middle, 9+ upper. Drives the data-band token block in globals.css -
   * layout density shifts by band through tokens, never per-widget overrides. */
  gradeBand?: GradeBand;
  courseTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  chapterCount: number;
  lessonNumber: number;
  lessonCount: number;
}

export default function LessonPlayer({
  lesson,
  next: nextLesson = null,
  trailContext = null,
  masteryTag = null,
  masteryRound = 1
}: {
  lesson: TLesson;
  /** The following lesson in this course, for the one-tap continue loop. */
  next?: NextLesson | null;
  /** Course/chapter/position shown in the persistent trail chrome. */
  trailContext?: LessonTrailContext | null;
  /** Canonical objective for the generated mastery studio. Normal lessons also
   * receive their dominant concept so completion can deepen rather than end. */
  masteryTag?: string | null;
  /** Current generated-bank round. Each round draws a different deterministic
   * slice from the 20–40-state practice bank. */
  masteryRound?: number;
}) {
  const st = usePlayer();
  // Enter on the completion screen clicks the rendered Next link (client-side
  // nav without needing a router context — the jsdom playthrough has none).
  const nextRef = useRef<HTMLAnchorElement>(null);
  // Animate the running XP total so awards feel earned (snaps under reduced motion).
  const shownXp = Math.round(useCountUp(st.sessionXp));
  useEffect(() => {
    usePlayer.getState().load(lesson);
  }, [lesson]);

  // Enter drives the whole loop: check → try again → continue → next lesson.
  // Phase is read at keypress time (getState), so the handler is stable.
  const onEnter = useCallback(() => {
    const p = usePlayer.getState();
    if (!p.lesson) return;
    const step = p.queue[p.i];
    switch (p.phase) {
      case "work":
        if (step.kind === "concept" || step.kind === "recap") p.next();
        else if (step.predict && p.prediction === null) break; // commit first
        else if (step.widget && canCheck(step.widget, p.value)) p.check();
        break;
      case "retry":
        p.tryAgain();
        break;
      case "correct":
      case "revealed":
        p.next();
        break;
      case "done":
        nextRef.current?.click();
        break;
    }
  }, []);
  useEnterAdvance(onEnter, Boolean(st.lesson));

  // Predict-option display order, shuffled and seeded (see McqW in widgets.tsx for the full
  // rationale — the same authoring bias applies here: 87% of predict blocks put the true
  // outcome first). Computed here, before either early return below, so hook order stays
  // identical across every render path (the "done" screen and the loading/mismatch bail-out
  // included). Falls back to authored order only if there's no current predict step to shuffle.
  const predictStep = st.queue?.[st.i];
  const predictOrder = useMemo(() => {
    if (!predictStep?.predict) return null;
    return seededShuffle(predictStep.predict.options, `${st.lesson?.id ?? "x"}:${predictStep.id}:predict`);
  }, [predictStep, st.lesson?.id]);

  // Each new step opens at its top. Scrolls ONLY when the previous step left
  // the window scrolled (long feedback, tall stage) — a fresh viewport never
  // moves, and jsdom (scrollY 0) never triggers the unimplemented call.
  const stepIndex = st.i;
  const [cmlHistory, setCmlHistory] = useState<unknown[]>([]);
  const [cmlFirstValue, setCmlFirstValue] = useState<unknown>(null);
  const [cmlMoveCount, setCmlMoveCount] = useState(0);
  const cmlStep = st.queue?.[st.i];
  const cmlEnabled = resolveCMLMeta(cmlStep) !== null;

  useEffect(() => {
    setCmlHistory([]);
    setCmlFirstValue(null);
    setCmlMoveCount(0);
  }, [stepIndex]);

  const setCMLValue = useCallback((next: unknown) => {
    const live = usePlayer.getState();
    const active = live.queue?.[live.i];
    if (resolveCMLMeta(active)) {
      const current = live.value;
      if (current === null || current === undefined) {
        setCmlFirstValue(next);
      } else if (!sameCMLValue(current, next)) {
        setCmlFirstValue((first: unknown) => (first === null || first === undefined ? current : first));
        setCmlHistory((history) => [...history, current].slice(-24));
      }
    }
    live.setValue(next);
  }, []);

  const undoCML = useCallback(() => {
    setCmlHistory((history) => {
      if (history.length === 0) return history;
      const previous = history[history.length - 1];
      usePlayer.getState().setValue(previous);
      return history.slice(0, -1);
    });
  }, []);

  const restoreFirstCML = useCallback(() => {
    if (cmlFirstValue === null || cmlFirstValue === undefined) return;
    const current = usePlayer.getState().value;
    if (!sameCMLValue(current, cmlFirstValue)) {
      setCmlHistory((history) => [...history, current].slice(-24));
      usePlayer.getState().setValue(cmlFirstValue);
    }
  }, [cmlFirstValue]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.scrollY) return;
    try {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    } catch {
      /* older engines without options object */
    }
  }, [stepIndex]);

  // DOCK-OVERLAP REVEAL. When the dock grows to carry feedback (retry/correct/revealed) on a
  // short viewport — landscape phones, split screens — it can come to rest ON TOP of the very
  // control the learner just used. `scroll-margin-bottom` (globals.css, max-height: 480px) is
  // the declarative reservation, but only some scroll paths honour it: Chromium's
  // scrollIntoViewIfNeeded judges visibility by the raw element rect, so a control sitting a
  // few pixels under the stuck dock counts as "visible" and never moves. The app therefore
  // guarantees the invariant itself: measure the real overlap after layout settles and nudge by
  // exactly that much, never more, and only if the page has the slack to give. No overlap, no
  // scroll — a tall viewport never moves.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (st.phase !== "retry" && st.phase !== "correct" && st.phase !== "revealed") return;
    const frame = window.requestAnimationFrame(() => {
      const dock = document.querySelector<HTMLElement>(".trail-action-dock");
      const main = document.querySelector<HTMLElement>("main");
      if (!dock || !main) return;
      const active = document.activeElement as HTMLElement | null;
      const control =
        active && main.contains(active) && active.matches("input, textarea, select")
          ? active
          : [...main.querySelectorAll<HTMLElement>("input, textarea, select")]
              .filter((el) => el.getBoundingClientRect().height > 0)
              .pop() ?? null;
      if (!control) return;
      const gap = 8;
      const overlap = control.getBoundingClientRect().bottom - (dock.getBoundingClientRect().top - gap);
      if (overlap <= 2) return;
      const slack = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      const delta = Math.max(0, Math.min(overlap, slack));
      if (delta <= 0) return;
      try {
        window.scrollBy({ top: delta, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      } catch {
        window.scrollBy(0, delta);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [st.phase, stepIndex]);

  // PROCESS-AWARE NOTICING (deterministic; see src/lib/processEvents.ts).
  // Instrumented engines report each move's relation to the target; when the
  // pure classifier sees a pattern (three of a kind), the player says what it
  // noticed — once per step, in tentative language, near the object. It never
  // blocks Check, never costs XP, never touches grading; the same move
  // sequence always produces the same cue.
  const procEventsRef = useRef<ProcessEvent[]>([]);
  const cueLatchedRef = useRef(false);
  const [processCue, setProcessCue] = useState<string | null>(null);
  // Dispatch a move stream to the DOMAIN strategy classifier for this widget.
  // Only engines instrumented with numeric state snapshots participate; the
  // rest fall through to the direction classifier exactly as before. Kept as a
  // stable callback so the hot interaction path allocates nothing per move.
  const detectStrategy = useCallback((wtype: string, widget: unknown, events: readonly ProcessEvent[]): Strategy | null => {
    if (wtype === "fractionBar") {
      const w = widget as { targetNum?: number; targetDen?: number } | undefined;
      if (typeof w?.targetNum === "number" && typeof w?.targetDen === "number") {
        const name = classifyFraction(events, { targetNum: w.targetNum, targetDen: w.targetDen });
        if (name) return { domain: "fractions", name };
      }
    }
    if (wtype === "numberLineHop") {
      const w = widget as { start?: number; hop?: number; hops?: number; direction?: string } | undefined;
      if (typeof w?.start === "number" && typeof w?.hop === "number" && typeof w?.hops === "number") {
        const target = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
        const name = classifyNumberLine(events, { target, start: w.start });
        if (name) return { domain: "number-line", name };
      }
    }
    if (wtype === "baseTenCompose") {
      const w = widget as { target?: number } | undefined;
      if (typeof w?.target === "number") {
        const name = classifyBaseTen(events, {
          targetOnes: w.target % 10,
          targetTens: Math.floor(w.target / 10) % 10
        });
        if (name) return { domain: "base-ten", name };
      }
    }
    if (wtype === "ratioTable") {
      const w = widget as { askA?: number; targetB?: number; bStart?: number } | undefined;
      if (typeof w?.askA === "number" && typeof w?.targetB === "number" && w.targetB !== 0) {
        const name = classifyRatio(events, {
          aTarget: w.askA,
          bTarget: w.targetB,
          aStart: w.askA,
          bStart: w.bStart ?? 0
        });
        if (name) return { domain: "ratios", name };
      }
    }
    if (wtype === "doubleNumberLine") {
      const w = widget as { targetTop?: number; askAtStep?: number; bottomPerStep?: number } | undefined;
      if (typeof w?.targetTop === "number" && typeof w?.askAtStep === "number" && typeof w?.bottomPerStep === "number") {
        const bottomAt = w.askAtStep * w.bottomPerStep;
        if (bottomAt !== 0) {
          const name = classifyRatio(events, { aTarget: w.targetTop, bTarget: bottomAt, aStart: 0, bStart: bottomAt });
          if (name) return { domain: "ratios", name };
        }
      }
    }
    if (wtype === "lineExplore") {
      const w = widget as { targetSlope?: number; targetIntercept?: number } | undefined;
      if (typeof w?.targetSlope === "number" && typeof w?.targetIntercept === "number") {
        const name = classifyGraph(events, { targetSlope: w.targetSlope, targetIntercept: w.targetIntercept });
        if (name) return { domain: "graphs", name };
      }
    }
    return null;
  }, []);
  useEffect(() => {
    procEventsRef.current = [];
    cueLatchedRef.current = false;
    setProcessCue(null);
  }, [stepIndex]);
  const widgetType = st.queue?.[st.i]?.widget?.type ?? null;
  const onProcessEvent = useCallback(
    (e: ProcessEvent) => {
      // A locked control releases on the learner's first move ANYWHERE else —
      // the lock is a moment of contrast, never a cage. Checked before the
      // latch guard so release works even after the cue has latched.
      const live = usePlayer.getState();
      if (resolveCMLMeta(live.queue?.[live.i])) {
        setCmlMoveCount((count) => count + 1);
      }
      if (live.lockedControl !== null && e.control !== live.lockedControl) live.clearLock();
      if (cueLatchedRef.current || !widgetType) return;
      procEventsRef.current.push(e);
      // STRATEGY LAYER (Phase 5): before the generic direction classifier, ask
      // the domain classifier whether the move STREAM reveals a named strategy.
      // A detected strategy latches through the identical signalCounts ladder
      // (it is a ProcessSignal), so persistence, resume, the fluent-gate, and
      // one-remedial-per-signal all apply unchanged. Positive strategies are
      // affirmed once and never scaffold.
      const strat = detectStrategy(widgetType, live.queue?.[live.i]?.widget, procEventsRef.current);
      if (strat) {
        cueLatchedRef.current = true;
        const resp = usePlayer.getState().noteSignal(strat.name, { control: procEventsRef.current[0]?.control, lockCapable: false });
        if (resp.kind === "affirm") setProcessCue(strategyCue(strat));
        else if (resp.kind === "cue") setProcessCue(strategyCue(strat));
        else {
          const copy = responseCopy(resp);
          if (copy) setProcessCue(copy);
        }
        return;
      }
      const signal = classifyProcess(procEventsRef.current, { multiControl: MULTI_CONTROL.has(widgetType) });
      if (signal) {
        cueLatchedRef.current = true;
        // On fixation every buffered event shares one control — pass it so the
        // cue can name the specific contrast ("moved, but didn't tilt").
        const resp = usePlayer.getState().noteSignal(signal, {
          control: procEventsRef.current[0]?.control,
          lockCapable: widgetType === "lineExplore"
        });
        if (resp.kind === "cue") setProcessCue(processCue2(widgetType, signal, procEventsRef.current[0]?.control));
        else {
          const copy = responseCopy(resp);
          if (copy) setProcessCue(copy);
          // lock: the engine's chip speaks for it; remedial: silently owed.
        }
      }
    },
    [widgetType, detectStrategy]
  );

  if (!st.lesson || st.lesson.id !== lesson.id) return null;

  if (st.phase === "done") {
    // The completion screen is the consolidation moment: name what was walked,
    // show the goal/streak it fed, reflect on predictions, and hand the learner
    // the very next step — never a dead end, never just confetti.
    const prof = progressStore.load();
    const today = localDateStr(new Date());
    const streak = computeStreak(prof.activity, today).streak;
    const doneToday = prof.lessonsByDay?.[today] ?? 0;
    const goal = prof.dailyGoal ?? 1;
    const held = st.predictions.filter((x) => x.held).length;
    return (
      <main
        data-band={trailContext?.gradeBand ?? "middle"}
        data-player-phase="done"
        data-lesson-id={st.lesson.id}
        data-step-index={st.i}
        data-step-count={st.queue.length}
        className="lesson-trail-shell trail-summit-screen relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden px-4 py-10 text-center"
      >
        <TrailAtmosphere />
        <div className="relative z-[1] mx-auto flex w-full max-w-xl flex-col items-center gap-6">
        <SummitRoute walked={st.queue.length} />
        <div className="summit-in relative flex flex-col items-center gap-3">
          <SparkBurst className="left-1/2 top-6" />
          <Image src="/brand/logo-tally-peak.svg" alt="" width={64} height={64} unoptimized priority aria-hidden="true" />
          <h1 className="text-3xl font-extrabold tracking-tight">{COPY.lessonDone}</h1>
          <p className="text-sm font-semibold text-ink/70 dark:text-paper/70">{st.lesson.title}</p>
          {trailContext && (
            <p className="rounded-pill border border-ink/10 bg-surface/75 px-3 py-1 text-xs font-bold text-ink/[0.7] shadow-e1 backdrop-blur dark:border-paper/12 dark:text-paper/[0.7]">
              {trailContext.courseTitle} · Lesson {trailContext.lessonNumber} of {trailContext.lessonCount}
            </p>
          )}
        </div>

        <p className="summit-xp summit-xp-pop rounded-card bg-tangerine/15 px-6 py-3 text-xl font-bold text-ink dark:text-paper">
          +{st.sessionXp} {COPY.xpEarned}
        </p>

        <div className="flex w-full flex-wrap items-stretch justify-center gap-3">
          <div className="flex min-w-[9rem] flex-1 flex-col items-center gap-1 rounded-card border border-ink/10 bg-surface px-4 py-3 dark:border-paper/15">
            <GoalRing done={doneToday} goal={goal} />
            <p className="text-xs font-bold text-ink/70 dark:text-paper/70">
              {doneToday >= goal ? "Daily goal met!" : "toward today's goal"}
            </p>
          </div>
          <div className="flex min-w-[9rem] flex-1 flex-col items-center justify-center gap-1 rounded-card border border-ink/10 bg-surface px-4 py-3 dark:border-paper/15">
            <span className="flex items-center gap-1.5 text-2xl font-extrabold tabular-nums">
              <span className="flame-pop inline-flex"><AppIcon name="flame" size={22} className="text-tangerine-ink" /></span>
              {streak}
            </span>
            <p className="text-xs font-bold text-ink/70 dark:text-paper/70">day streak</p>
          </div>
        </div>

        {st.predictions.length > 0 && (
          <p className="flex items-center gap-2 rounded-card border border-sky/30 bg-sky/5 px-4 py-2 text-sm font-bold text-ink/70 dark:text-paper/70">
            <AppIcon name="compass" size={16} className="shrink-0 text-sky-ink" />
            <span>
              Predictions: {held} of {st.predictions.length} held
              {st.predictions.some((x) => !x.held)
                ? " — the misses are where the learning happened"
                : " — you saw it coming"}
            </span>
          </p>
        )}

        <div className="flex w-full flex-col items-center gap-3">
          {nextLesson && (
            <Link
              ref={nextRef}
              href={`/learn/${nextLesson.id}`}
              className="pressable summit-next flex w-full max-w-sm flex-col items-center rounded-card bg-cta-good px-6 py-3 font-bold text-white shadow-e2"
            >
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-white/80">
                Next on this trail
              </span>
              <span>Next: {nextLesson.title} →</span>
            </Link>
          )}
          {masteryTag && (
            <Link
              href={`/mastery/${encodeURIComponent(masteryTag)}?round=${Math.max(1, masteryRound + 1)}`}
              className="pressable flex w-full max-w-sm flex-col items-center rounded-card border-2 border-sky/30 bg-sky/8 px-6 py-3 font-bold text-sky-ink shadow-e1"
            >
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-sky-ink/75">
                Deepen, mix, and transfer
              </span>
              <span>{masteryRound > 1 ? 'New 32-state mastery round' : 'Open Mastery Studio'} →</span>
            </Link>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className={`pressable min-h-11 rounded-card px-6 py-3 font-bold ${
                nextLesson ? "border-2 border-ink/20 dark:border-paper/25" : "bg-cta text-white"
              }`}
            >
              {COPY.backHome}
            </Link>
            <button
              type="button"
              onClick={() => usePlayer.getState().restart()}
              className="pressable flex min-h-11 items-center gap-2 rounded-card border-2 border-ink/20 px-6 py-3 font-bold dark:border-paper/25"
            >
              <AppIcon name="repeat" size={16} />
              {COPY.replay}
            </button>
          </div>
        </div>
        {nextLesson && (
          <p className="text-xs text-ink/70 dark:text-paper/70">Press Enter to keep walking</p>
        )}
        </div>
      </main>
    );
  }

  const s = st.queue[st.i];
  const actionable = s.kind !== "concept" && s.kind !== "recap";
  const finalized = st.phase === "correct" || st.phase === "revealed";
  // Availability, not kind — same defect as the hint control below. 118 interactive
  // steps (116 of them the very steps that also carried stranded hint ladders) author
  // explanationVariants that this gate discarded, so the learner finished an explored
  // step with no "here is why" and no swap. `finalized` still means the reasoning is
  // over; concept/recap steps never author the field, so nothing new leaks earlier.
  const showExplanation = finalized && actionable && s.explanationVariants;
  const early = st.lesson.readingProfile === "early";
  // Reveal contrast: the correct answer AND (for typed/choice widgets) the
  // learner's own submission, so the reveal shows *your* answer next to *the*
  // answer rather than the answer in isolation. learnerAnswerText returns null
  // where a one-line echo isn't honest (dense labs, sliders that self-narrate),
  // and the "you answered" line is suppressed when it would equal the answer.
  const revealAnswer = s.widget ? correctAnswerText(s.widget) : "";
  const revealYours = s.widget ? learnerAnswerText(s.widget, st.value) : null;

  // The width tier this step earns: reading column for prose, wider stages for
  // laboratories. Header/main/footer share it so actions never detach from the
  // content they govern (see stageWidth.ts).
  const widthCls = stageWidthClass(stepTier(s.widget));
  const colTransition = "transition-[max-width] duration-300 ease-out motion-reduce:transition-none";

  // Feedback ↔ object linkage: the stage frame carries the phase's tone so the
  // footer diagnosis visibly points at the manipulative it is talking about.
  const stageTone: StageTone =
    st.explorationActive && st.explorationCorrect === false
      ? "error"
      : st.explorationActive && st.explorationCorrect === true
        ? "success"
        : st.explorationActive
          ? "neutral"
          : st.phase === "retry"
      ? "error"
      : st.phase === "correct"
        ? "success"
        : st.phase === "revealed"
          ? "info"
          : "neutral";

  return (
    <div
      data-player-phase={st.phase}
      data-lesson-id={st.lesson.id}
      data-step-id={s.id}
      data-step-index={st.i}
      data-step-count={st.queue.length}
      className="lesson-trail-shell lesson-trail-shell--active relative flex min-h-dvh flex-col overflow-x-clip"
    >
      <header className="trail-player-header sticky top-0 z-20 border-b border-ink/8 bg-paper/[0.88] backdrop-blur-xl dark:border-paper/8 dark:bg-night/[0.88]">
        <div className={`mx-auto flex w-full ${widthCls} ${colTransition} items-center gap-2.5 px-3 py-2 sm:px-4`}>
          <Link
            href="/"
            aria-label="Exit lesson"
            className="pressable trail-exit flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-ink/8 bg-surface/75 text-ink/70 shadow-e1 backdrop-blur hover:border-sky/35 hover:bg-sky/8 hover:text-sky-ink dark:border-paper/10 dark:text-paper/70"
          >
            <AppIcon name="arrowLeft" size={20} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex min-w-0 items-baseline justify-between gap-2 px-0.5">
              <h1 id="lesson-player-title" className="truncate text-sm font-extrabold leading-tight text-ink/[0.85] dark:text-paper/[0.85]">
                {st.lesson.title}
              </h1>
              <span className="shrink-0 text-[10px] font-bold tabular-nums text-ink/[0.55] dark:text-paper/[0.55]">
                {st.i + 1}/{st.queue.length}
              </span>
            </div>
            <TrailDots
              steps={st.queue}
              current={st.i}
              remedialIds={
                new Set(
                  st.lesson.remedials
                    .flatMap((r) => [r.concept.id, r.check.id])
                    .filter((id) => st.queue.some((q) => q.id === id))
                )
              }
            />
          </div>
          <span className="trail-xp-chip flex shrink-0 items-center gap-1 whitespace-nowrap rounded-pill border border-tangerine/25 bg-tangerine/10 px-2.5 py-1 text-xs font-extrabold tabular-nums text-[#9B4A18] shadow-e1 dark:text-tangerine-ink" aria-label={`${shownXp} experience points`}>
            <AppIcon name="spark" size={13} />
            {shownXp} XP
          </span>
        </div>
      </header>

      <main
        aria-labelledby="lesson-player-title"
        data-band={trailContext?.gradeBand ?? "middle"}
        data-step-kind={s.kind}
        key={`${s.id}:${st.i}`}
        className={`trail-step-enter relative z-[1] mx-auto w-full ${widthCls} ${colTransition} flex-1 px-4 pb-10 pt-4`}
      >
        {/* Prose lives in the reading column even when the stage below widens. */}
        <div className="mx-auto w-full max-w-xl">
          {st.resumedAt !== null && (
            <div
              aria-live="polite"
              className="mb-3 flex items-center justify-between gap-2 rounded-card border border-sky/35 bg-sky/8 px-3 py-1.5 text-xs"
            >
              <span className="min-w-0 truncate font-bold">
                Resumed at step {st.resumedAt + 1} of {st.queue.length}.
              </span>
              <button
                type="button"
                onClick={st.restart}
                className="min-h-11 shrink-0 rounded-full px-2.5 font-bold text-sky-ink underline underline-offset-2"
              >
                Start over
              </button>
            </div>
          )}
          {/* Availability, not kind — the third instance of the S200 stranding class.
              Two interactive steps (cp-01-02 i1 "perp-bisector-stage1", cp-01-03 i1
              "angle-bisector-construction") author a REGISTERED figure that the
              `kind === "concept"` gate discarded, so two construction lessons opened
              their steppedReveal with no construction to look at. Only concept and
              interactive steps author `figure` anywhere in the corpus, so availability
              plus the FIGURE_IDS membership test is the whole guard.
              Wave A gives the figure the visual lead with no repeated stage-kind label. */}
          {s.figure && FIGURE_IDS.has(s.figure) && isFigureTextAligned(s.figure, s.body ?? "") && (
            <div className="math-stage-shell figure-reveal mb-4">
              <div key={s.id} className="stage trail-concept-stage rounded-card p-3 shadow-e2 ring-1 ring-ink/8"><FigureView id={s.figure} context={s.body ?? ""} /></div>
            </div>
          )}
          {early && <Narration step={s} stepKey={`${s.id}:${st.i}`} />}
          {s.body && <Rich text={s.body} early={early} />}

          {s.predict && st.prediction === null && (
            /* Predict before you touch: the manipulative stays hidden until the
               learner commits, so the interaction tests a belief rather than
               wandering. Commitments are safe — never graded, never penalized. */
            <div className="trail-prediction-card mt-5 rounded-card border border-tangerine/30 bg-tangerine/7 p-4 shadow-e2">
              <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-tangerine-ink">
                <AppIcon name="compass" size={14} />
                Make a prediction first
              </p>
              <p className="mt-1 text-lg font-bold"><MathProse text={s.predict.prompt} /></p>
              <div className="mt-3 grid gap-2" role="radiogroup" aria-label={s.predict.prompt}>
                {(predictOrder ?? s.predict.options).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={false}
                    onClick={() => st.commitPrediction(o.id)}
                    className="pressable min-h-11 rounded-card border border-ink/12 bg-white px-4 py-3 text-left text-base font-bold text-ink shadow-[0_1px_2px_rgba(34,49,79,0.03)] hover:border-tangerine/70 hover:bg-tangerine/5 dark:border-paper/15"
                  >
                    <MathProse text={o.label} />
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink/70 dark:text-paper/70">
                No points on the line for this — you'll test it yourself in a moment.
              </p>
            </div>
          )}
          {s.predict && st.prediction !== null && !finalized && (
            <p className="mt-4 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-tangerine/40 bg-tangerine/15 px-3 py-1 text-sm font-bold text-tangerine-ink">
              <AppIcon name="target" size={14} className="shrink-0" />
              <span>
                Your prediction:{" "}
                <MathProse text={s.predict.options.find((o) => o.id === st.prediction)?.label ?? ""} />
                <span className="ml-1 font-normal text-ink/70 dark:text-paper/70">
                  — now test it
                </span>
              </span>
            </p>
          )}
        </div>

        {/* The manipulative gets the step's full stage width — the loudest thing on screen. */}
        {!(s.predict && st.prediction === null) && s.widget && (
          <div className="math-stage-shell mt-4">
            <WidgetView
              spec={s.widget}
              value={st.value}
              onChange={setCMLValue}
              disabled={false}
              seed={`${st.lesson.id}:${s.id}`}
              tone={stageTone}
              onEvent={onProcessEvent}
              locks={st.lockedControl ? [st.lockedControl] : undefined}
            />
            {/* The app noticing out loud: tentative, proximal, never a gate.
                Hidden once the step is finalized — the diagnosis takes over. */}
            {processCue && !finalized && (
              <p
                data-testid="process-cue"
                aria-live="polite"
                className="banner-in mx-auto mt-3 flex w-full max-w-xl items-start gap-2 rounded-card border border-sky/30 bg-sky/5 px-4 py-2.5 text-sm font-semibold text-ink/80 dark:text-paper/80"
              >
                <AppIcon name="compass" size={16} className="mt-0.5 shrink-0 text-sky-ink" />
                <span>{processCue}</span>
              </p>
            )}
            {cmlEnabled && !finalized && cmlMoveCount > 0 && (
              <div
                className="mx-auto mt-3 flex w-full max-w-xl justify-end gap-2"
                role="group"
                aria-label="Model controls"
              >
                <button
                  type="button"
                  disabled={cmlHistory.length === 0}
                  onClick={undoCML}
                  className="pressable min-h-11 rounded-card border border-ink/15 bg-surface px-3 text-sm font-bold text-content-2 disabled:opacity-35 dark:border-paper/15"
                >
                  Undo
                </button>
                <button
                  type="button"
                  disabled={
                    cmlFirstValue === null ||
                    cmlFirstValue === undefined ||
                    sameCMLValue(st.value, cmlFirstValue)
                  }
                  onClick={restoreFirstCML}
                  className="pressable min-h-11 rounded-card border border-ink/15 bg-surface px-3 text-sm font-bold text-content-2 disabled:opacity-35 dark:border-paper/15"
                >
                  Reset model
                </button>
              </div>
            )}
            {cmlEnabled && finalized && (
              <CausalMasteryPanel
                key={`cml:${s.id}:${st.i}`}
                step={s}
                value={st.value}
              />
            )}
          </div>
        )}

        <div className="mx-auto w-full max-w-xl">
          {s.kind === "recap" && (
            <div className="mt-5 grid gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-ink/70">{COPY.keepGoing}</h2>
              <ul className="grid gap-2">
                {s.takeaways?.map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-card border-2 border-leaf/40 bg-leaf/10 px-4 py-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-pill bg-cta-good text-white" aria-hidden="true">
                      <AppIcon name="check" size={12} />
                    </span>
                    <span><MathProse text={t} includeArithmetic /></span>
                  </li>
                ))}
              </ul>
              {s.teaser && <p className="mt-2 italic text-ink/70">Next up: <MathProse text={s.teaser} /></p>}
            </div>
          )}

          {s.hints && st.hintsShown > 0 && (
            <div className="mt-5 grid gap-2" aria-label="Hints">
              {s.hints.slice(0, st.hintsShown).map((h, i) => {
                const latest = i === st.hintsShown - 1;
                return (
                  <div
                    key={i}
                    className={`rounded-card border-l-4 px-4 py-3 ${
                      latest
                        ? "banner-in border-tangerine bg-tangerine/10"
                        : "border-tangerine/30 bg-tangerine/5 text-ink/70 dark:text-paper/70"
                    }`}
                  >
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-tangerine-ink">
                      {HINT_RUNGS[i] ?? `Hint ${i + 1}`} · {i + 1} of {s.hints!.length}
                    </p>
                    <p className={latest ? "mt-0.5 font-semibold" : "mt-0.5 text-sm"}><MathProse text={h} includeArithmetic /></p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Sticky, not fixed: the footer takes layout space, so a tall feedback
          banner + explanation can never cover the very widget the learner is
          being corrected on — the step content always remains reachable. */}
      <footer className="trail-action-dock sticky bottom-0 z-10 border-t border-ink/8 bg-paper/[0.94] shadow-[0_-12px_34px_rgba(34,49,79,0.08)] backdrop-blur-xl dark:border-paper/10 dark:bg-night/[0.94]">
        <div className={`mx-auto w-full ${widthCls} ${colTransition} px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]`}>
          {/* Feedback region: scrolls internally past ~40% of the viewport so a
              long diagnosis can never push the actions off a phone screen or
              bury the stage it refers to. */}
          <div data-testid="feedback-scroll" className="max-h-[42dvh] overflow-y-auto overscroll-contain">
            {st.phase === "retry" && (
              <StatusBanner tone="error" icon="target" title={COPY.nudgeBanner}>
                <p><MathProse text={st.feedback} includeArithmetic /></p>
                <p className="mt-1 text-xs font-semibold text-ink/70 dark:text-paper/70">
                  Your work is still on the stage — adjust it and check again.
                </p>
              </StatusBanner>
            )}
            {st.phase === "correct" && (
              <div className="relative">
                <SparkBurst key={`spark-${st.i}`} className="left-1/2 top-0" />
              <StatusBanner
                tone="success"
                icon="check"
                title={COPY.correctBanner}
                titleExtra={
                  <span className="rounded-pill bg-leaf/15 px-2 py-0.5 text-sm tabular-nums">+{st.lastXp} XP</span>
                }
              >
                {st.feedback && <p><MathProse text={st.feedback} includeArithmetic /></p>}
                <p className="mt-1 text-xs font-semibold text-ink/70 dark:text-paper/70">
                  Checkpoint saved. Keep exploring the model, or continue when you are ready.
                </p>
              </StatusBanner>
              </div>
            )}
            {st.phase === "revealed" && s.widget && (
              <StatusBanner tone="info" icon="route" title={COPY.revealBanner}>
                <p><MathProse text={st.feedback} includeArithmetic /></p>
                <div className="mt-2 flex flex-wrap items-stretch gap-2">
                  {revealYours !== null && revealYours !== revealAnswer && (
                    <p className="inline-flex flex-wrap items-baseline gap-x-2 rounded-lg bg-berry/10 px-2.5 py-1">
                      <strong className="text-berry-ink">You answered</strong>
                      <span className="font-bold"><MathProse text={revealYours} /></span>
                    </p>
                  )}
                  <p className="inline-flex flex-wrap items-baseline gap-x-2 rounded-lg bg-sky/10 px-2.5 py-1">
                    <strong className="text-sky-ink">{COPY.answerWas}</strong>
                    <span className="font-bold"><MathProse text={revealAnswer} /></span>
                  </p>
                </div>
              </StatusBanner>
            )}
            {finalized && st.explorationActive && (
              <StatusBanner
                tone={st.explorationCorrect === null ? "info" : st.explorationCorrect ? "success" : "error"}
                icon={st.explorationCorrect === null ? "compass" : st.explorationCorrect ? "check" : "target"}
                title={
                  st.explorationCorrect === null
                    ? "Exploration state ready"
                    : st.explorationCorrect
                      ? "This state also meets the target"
                      : "This state does not meet the target"
                }
              >
                <p>
                  {st.explorationFeedback
                    ? <MathProse text={st.explorationFeedback} includeArithmetic />
                    : "You can test this state without changing your saved score or mastery evidence."}
                </p>
              </StatusBanner>
            )}
            {finalized && s.predict && st.prediction !== null && (() => {
              const chosen = s.predict.options.find((o) => o.id === st.prediction);
              const outcome = s.predict.options.find((o) => o.id === s.predict!.outcomeId);
              const confirmed = st.prediction === s.predict.outcomeId;
              return (
                <StatusBanner
                  tone={confirmed ? "leaf-info" : "info"}
                  icon="compass"
                  title={confirmed ? "Your prediction held. ✓" : "Not what you predicted — that's the interesting part."}
                >
                  <p className="mt-1 text-sm">
                    You predicted <strong><MathProse text={chosen?.label ?? ""} /></strong>
                    {confirmed ? (
                      "."
                    ) : (
                      <>
                        ; the model showed <strong><MathProse text={outcome?.label ?? ""} /></strong>.
                      </>
                    )}{" "}
                    <MathProse text={s.predict.reveal} />
                  </p>
                </StatusBanner>
              );
            })()}
            {showExplanation && s.explanationVariants && (
              <div className="stage mb-3 rounded-card px-4 py-3 shadow-sm">
                <p><MathProse text={s.explanationVariants[st.variant]} includeArithmetic /></p>
                <button
                  type="button"
                  onClick={st.swapVariant}
                  className="mt-2 min-h-11 rounded-card px-3 py-1 text-sm font-bold text-sky-ink underline underline-offset-2"
                >
                  {COPY.explainDifferently}
                </button>
              </div>
            )}
            {st.skipOffer && st.phase === "correct" && (
              <p className="mb-3 text-sm font-semibold text-ink/70 dark:text-paper/70">{COPY.skipOffer}</p>
            )}
          </div>

          <div className="trail-action-row flex flex-wrap items-center justify-end gap-3">
            {/* Hint availability, not step kind, gates the control. The store's hint()
                and the ladder renderer above were both kind-agnostic already, and
                xpFor() prices "interactive" hints at the same −2 XP — but this button
                used to test kind === challenge|check, which stranded the authored
                ladders on 118 interactive steps (decimal-operations, fractions-multiply,
                ratios-rates and six other courses) with no way to reach them. `actionable`
                still excludes concept/recap; the hintsShown < length test still excludes
                steps with no ladder authored. */}
            {actionable &&
              st.phase !== "correct" &&
              st.phase !== "revealed" &&
              st.hintsShown < (s.hints?.length ?? 0) && (
              <button
                type="button"
                onClick={st.hint}
                className="pressable mr-auto min-h-11 rounded-card px-3 py-2 text-sm font-bold text-tangerine-ink hover:bg-tangerine/8"
              >
                {COPY.hint} <span className="text-xs">({COPY.hintCost})</span>
              </button>
            )}

            {!actionable && st.phase === "work" && (
              <button
                type="button"
                onClick={() => st.next()}
                className="pressable trail-primary-action min-h-11 rounded-card bg-cta px-8 py-3 font-bold text-white shadow-[0_6px_18px_rgba(46,124,214,0.20)]"
              >
                <AppIcon name="chevronRight" size={17} />
                {COPY.continue}
              </button>
            )}

            {actionable && st.phase === "work" && s.widget && !(s.predict && st.prediction === null) && (
              <button
                type="button"
                onClick={st.check}
                disabled={!canCheck(s.widget, st.value)}
                className="pressable trail-primary-action min-h-11 rounded-card bg-cta px-8 py-3 font-bold text-white shadow-[0_6px_18px_rgba(46,124,214,0.20)] disabled:opacity-40 disabled:shadow-none"
              >
                <AppIcon name="target" size={17} />
                {COPY.check}
              </button>
            )}

            {st.phase === "retry" && (
              <>
                {s.kind === "interactive" && st.attempts >= 3 && (
                  <button
                    type="button"
                    onClick={st.reveal}
                    className="pressable min-h-11 rounded-card border-2 border-ink/20 px-4 py-2 font-bold dark:border-paper/25"
                  >
                    {COPY.showMe}
                  </button>
                )}
                <button
                  type="button"
                  onClick={st.tryAgain}
                  className="pressable trail-primary-action min-h-11 rounded-card bg-cta-danger px-8 py-3 font-bold text-white shadow-[0_6px_18px_rgba(214,69,93,0.18)]"
                >
                  <AppIcon name="repeat" size={17} />
                  {COPY.tryAgain}
                </button>
              </>
            )}

            {finalized && (
              <>
                {st.explorationActive && s.widget && (
                  <button
                    type="button"
                    onClick={st.check}
                    disabled={!canCheck(s.widget, st.value)}
                    className="pressable min-h-11 rounded-card border-2 border-sky px-4 py-2 font-bold text-sky-ink disabled:opacity-40"
                  >
                    <AppIcon name="target" size={17} />
                    Check this state
                  </button>
                )}
                {st.skipOffer && st.phase === "correct" && (
                  <button
                    type="button"
                    onClick={() => st.next(true)}
                    className="pressable min-h-11 rounded-card border-2 border-sky px-4 py-2 font-bold text-sky-ink"
                  >
                    {COPY.skipAhead}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => st.next()}
                  className="pressable trail-primary-action min-h-11 rounded-card bg-cta-good px-8 py-3 font-bold text-white shadow-[0_6px_18px_rgba(47,163,107,0.18)]"
                >
                  <AppIcon name="chevronRight" size={17} />
                  {COPY.continue}
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
