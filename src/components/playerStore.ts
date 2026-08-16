/**
 * THE PLAYER STATE MACHINE — extracted verbatim from LessonPlayer.tsx (Session 101).
 *
 * Everything below is behavior, not presentation: the work → retry → correct →
 * revealed → done phase machine, grading, XP, adaptive/hint policy, persistence
 * and resume. LessonPlayer.tsx renders it; nothing here touches the DOM. The
 * split exists so a visual change can no longer risk a logic regression — the
 * exact hazard a 1,458-line component kept alive.
 */
"use client";

"use client";

import { create } from "zustand";
import type { TLesson, TStep } from "@/lib/schema";
import { evaluate } from "@/lib/evaluate";
import { adaptiveAction, addDays, localDateStr, onMiss, xpFor, type AttemptEvent } from "@/lib/engine";
import { awardNewBadges } from "@/lib/achievements";
import { requestSync } from "@/lib/autoSync";
import { clearLessonState, loadLessonState, restoreQueue, saveLessonState } from "@/lib/lessonState";
import { applyXp, bump, progressStore } from "@/lib/progress";
import { recordPredictionOutcome } from "@/lib/predictionReview";
import { applyResult, recordSignal } from "@/lib/mastery";
import { applyFactResult } from "@/lib/factFluency";
import { type ProcessSignal } from "@/lib/processEvents";
import { decideResponse, type AdaptiveResponse } from "@/lib/adaptivePolicy";
import { refreshLessonSteps } from "@/lib/lessonVariants";
export type Phase = "work" | "retry" | "correct" | "revealed" | "done";

interface PlayerState {
  lesson: TLesson | null;
  queue: TStep[];
  i: number;
  phase: Phase;
  value: unknown;
  attempts: number; // wrong attempts on the current step
  /** The prediction option the learner committed to on this step (null = not yet).
   * A commitment device, never graded: the comparison with the outcome IS the lesson. */
  prediction: string | null;
  hintsShown: number;
  feedback: string;
  /** Post-verdict sandbox state. The graded checkpoint is already durable; these fields
   * let learners keep manipulating and check new states without duplicating XP/evidence. */
  explorationActive: boolean;
  explorationFeedback: string;
  explorationCorrect: boolean | null;
  variant: 0 | 1;
  lastXp: number;
  sessionXp: number;
  history: AttemptEvent[];
  injected: string[];
  /** {held} per committed prediction this session — the process evidence the
   * completion screen reports. Never graded, never fed to mastery. */
  predictions: Array<{ held: boolean }>;
  skipOffer: boolean;
  /** The process signal (if any) that latched on the current step — recorded
   * into the skill's evidence ledger at finalize, then reset with the step.
   * Evidence only: never touches grading, XP, or the mastery score. */
  stepSignal: ProcessSignal | null;
  /** Adaptive ladder (s41): per-lesson latch counts per signal and the signals
   * whose single remedial rung has fired. Both persist in the resume snapshot
   * so a refresh can neither repeat a response nor re-arm the ladder. */
  signalCounts: Partial<Record<ProcessSignal, number>>;
  remediated: ProcessSignal[];
  /** Control the policy has locked for a moment (transient, per step). */
  lockedControl: string | null;
  /** A third-rung remedial is owed; consumed at finalize on a wrong answer. */
  pendingRemedial: boolean;
  /** Step index this session was restored to, for the "picked up where you
   * left off" notice. Cleared on the next advance. Null = fresh start. */
  resumedAt: number | null;
  load: (l: TLesson) => void;
  /** Store-internal: timestamp of the last accepted advance. Lives IN the
   * store (not module scope) so a lesson load, restart, or completion resets
   * it — a restart within the latch window must not eat the first Continue
   * of the new run. Not read by any component. */
  lastAdvanceAt: number;
  restart: () => void;
  commitPrediction: (optionId: string) => void;
  setValue: (v: unknown) => void;
  check: () => void;
  tryAgain: () => void;
  reveal: () => void;
  next: (skip?: boolean) => void;
  hint: () => void;
  swapVariant: () => void;
  noteSignal: (sig: ProcessSignal, opts: { control?: string; lockCapable: boolean }) => AdaptiveResponse;
  clearLock: () => void;
}

/** See next(): absorbs double-fired advances between ungraded steps.
 * Under vitest the latch defaults OFF (existing specs advance synchronously);
 * the rapid-input regression spec opts in via setAdvanceLatchForTest. */
export const ADVANCE_LATCH_MS = 350;
let advanceLatchMs = typeof process !== "undefined" && process.env.NODE_ENV === "test" ? 0 : ADVANCE_LATCH_MS;
/** Test hooks — enable/reset the advance latch deterministically. */
export function setAdvanceLatchForTest(ms: number): void { advanceLatchMs = ms; usePlayer.setState({ lastAdvanceAt: 0 }); }
export function resetAdvanceLatch(): void { usePlayer.setState({ lastAdvanceAt: 0 }); }

function freshStepState() {
  return {
    value: null as unknown,
    attempts: 0,
    prediction: null as string | null,
    hintsShown: 0,
    feedback: "",
    explorationActive: false,
    explorationFeedback: "",
    explorationCorrect: null as boolean | null,
    variant: 0 as const,
    skipOffer: false,
    stepSignal: null as ProcessSignal | null,
    lockedControl: null as string | null,
    pendingRemedial: false
  };
}

export const usePlayer = create<PlayerState>((set, get) => {
  function recordMiss(s: TStep) {
    const lesson = get().lesson;
    if (!lesson || (s.kind !== "check" && s.kind !== "challenge")) return;
    const p = progressStore.load();
    p.review = onMiss(
      p.review,
      { conceptTag: s.conceptTag ?? "general", lessonId: lesson.id, stepId: s.id },
      localDateStr(new Date())
    );
    progressStore.save(p);
  }

  function finalize(correct: boolean, revealed: boolean, fb: string) {
    const st = get();
    const s = st.queue[st.i];
    const kind =
      s.kind === "challenge" ? "challenge" : s.kind === "interactive" ? "interactive" : "check";
    const xp = xpFor(kind, st.attempts, st.hintsShown, revealed);

    let history = st.history;
    let queue = st.queue;
    let injected = st.injected;
    let skipOffer = false;
    let predictions = st.predictions;
    if (s.predict && st.prediction !== null) {
      predictions = [...predictions, { held: st.prediction === s.predict.outcomeId }];
    }

    // Interactive steps emit process events but never graded evidence; a
    // latched signal still belongs in the concept's ledger (score untouched).
    if (s.kind === "interactive" && s.conceptTag && st.stepSignal) {
      const pm = progressStore.load();
      pm.mastery = recordSignal(pm.mastery ?? {}, s.conceptTag, st.stepSignal);
      progressStore.save(pm);
    }
    if ((s.kind === "check" || s.kind === "challenge") && s.conceptTag) {
      history = [
        ...history,
        { conceptTag: s.conceptTag, correct, firstTry: correct && st.attempts === 0 }
      ];
      // Accumulate persistent per-skill mastery from the same evidence (revealed ⇒ not produced).
      const pm = progressStore.load();
      pm.mastery = applyResult(
        pm.mastery ?? {},
        s.conceptTag,
        { firstTry: st.attempts === 0, hintsUsed: st.hintsShown, revealed, signal: st.stepSignal },
        localDateStr(new Date()),
        st.lesson?.id
      );
      // S186: fact-family item-grain evidence, additive alongside the conceptTag mastery update
      // above. Deliberately STRICTER than mastery's correct/retryCorrect split: fluency means
      // instant, unaided recall, so only a true first-attempt success advances the family's
      // leech box. A retry-recovered or revealed answer still means the fact is not yet
      // automatic — both count as a miss here even though a retry-correct is real (partial)
      // evidence for the broader conceptTag mastery estimate above.
      if (s.variant?.factFamily) {
        pm.factItems = applyFactResult(
          pm.factItems ?? {},
          s.variant.factFamily,
          !revealed && st.attempts === 0,
          localDateStr(new Date())
        );
      }
      progressStore.save(pm);
      const act0 = adaptiveAction(history, injected);
      // Third-rung escalation: a process signal earned its remedial and the
      // answer came out wrong — inject the step's remedial pair even where the
      // outcome history alone wouldn't yet. Never fires on a correct answer
      // (struggle that self-resolved stays evidence, not intervention), and the
      // once-per-conceptTag injection guard still applies.
      const act =
        !correct && st.pendingRemedial && act0.type === "none" && s.conceptTag && !injected.includes(s.conceptTag)
          ? ({ type: "remediate", conceptTag: s.conceptTag } as const)
          : act0;
      if (act.type === "remediate") {
        const rem = st.lesson?.remedials.find((r) => r.conceptTag === act.conceptTag);
        if (rem) {
          queue = [...queue.slice(0, st.i + 1), rem.concept, rem.check, ...queue.slice(st.i + 1)];
          injected = [...injected, act.conceptTag];
        }
      } else if (act.type === "offerSkip" && queue[st.i + 1]?.kind === "concept") {
        skipOffer = true;
      }
    }

    set({
      phase: revealed ? "revealed" : "correct",
      feedback: fb,
      explorationActive: false,
      explorationFeedback: "",
      explorationCorrect: null,
      lastXp: xp,
      sessionXp: st.sessionXp + xp,
      history,
      queue,
      injected,
      predictions,
      skipOffer
    });
  }

  function persistCompletion() {
    const st = get();
    if (!st.lesson) return;
    const p = progressStore.load();
    const prev = p.lessons[st.lesson.id]?.bestXp ?? 0;
    const today = localDateStr(new Date());
    applyXp(p, Math.max(0, st.sessionXp - prev), today);
    p.lessons[st.lesson.id] = {
      completed: true,
      bestXp: Math.max(prev, st.sessionXp),
      // First completion date sticks; replays never move it later.
      completedAt: p.lessons[st.lesson.id]?.completedAt ?? localDateStr(new Date())
    };
    recordPredictionOutcome(p, st.lesson.id, st.predictions, today);
    /* S242 / ADAPT-01. The freshness axis for the lesson path. `lessons[id].completed` is a boolean
     * and has never carried a replay count, so the tally lives in `counters` — which already exists
     * for this and merges by MAX, the right rule for a walk count that can only go up. Incrementing
     * here, at completion, is what makes a replay a genuinely new set of problems while keeping the
     * CURRENT walk byte-identical across a resume. */
    bump(p, `walk:${st.lesson.id}`);
    if (new Date().getHours() >= 21) bump(p, "nightOwl");
    awardNewBadges(p);
    if (!p.activity.active.includes(today)) p.activity.active.push(today);
    const byDay = p.lessonsByDay ?? {};
    byDay[today] = (byDay[today] ?? 0) + 1;
    const cutoff = addDays(today, -84);
    for (const d of Object.keys(byDay)) if (d < cutoff) delete byDay[d];
    p.lessonsByDay = byDay;
    progressStore.save(p);
    clearLessonState(st.lesson.id); // the resume snapshot has served its purpose
    // Real work just landed — push it up now rather than waiting for an ambient trigger.
    // Fire-and-forget: the coordinator decides whether it may actually run, and local progress is
    // already durable regardless of what the network does.
    void requestSync("lesson-complete");
  }

  return {
    lesson: null,
    queue: [],
    i: 0,
    phase: "work",
    lastAdvanceAt: 0,
    lastXp: 0,
    sessionXp: 0,
    history: [],
    injected: [],
    predictions: [],
    signalCounts: {},
    remediated: [],
    resumedAt: null,
    ...freshStepState(),

    load: (l) => {
      /* S242 / ADAPT-01. The lesson path consults the learner for the first time. Until this line
       * `playerStore` wrote mastery and never read it, and every one of 1,701 lessons was served
       * exactly as authored to every learner forever. `refreshLessonSteps` picks a band per step
       * from the mastery model and regenerates the numbers where a generator exists; it is pure and
       * seeded on (lesson, step, completed-walk count), so a RESUME is byte-identical and a REPLAY
       * is a genuinely new set of problems. */
      const profile = progressStore.load();
      const refreshed = refreshLessonSteps(l, profile);
      if (refreshed.refreshed > 0) progressStore.save({ ...profile, recentVariants: refreshed.served });
      /* The queue is built from the REFRESHED steps in every branch below, including the resumed
       * one: `restoreQueue` rebuilds from the lesson it is handed, so passing the authored lesson
       * there would show generated numbers on the first visit and authored ones after a refresh. */
      const lessonForRun = { ...l, steps: refreshed.steps };
      // A refresh, back-swipe, or crash mid-lesson must not discard the walk:
      // if a snapshot for this lesson restores cleanly, resume exactly where
      // the learner left off (queue including injected remedials, XP, history).
      // Defense-in-depth (s46): a COMPLETED lesson never resumes, whatever a
      // stale key claims — replay starts fresh. Sync prunes these upstream;
      // this guard holds even if a stale key arrives by any other path.
      const done = !!progressStore.load().lessons?.[l.id]?.completed;
      if (done) clearLessonState(l.id);
      const snap = done ? null : loadLessonState(l.id);
      const queue = snap ? restoreQueue(lessonForRun, snap) : null;
      if (snap && queue) {
        set({
          lesson: lessonForRun,
          queue,
          i: snap.i,
          phase: "work",
          lastAdvanceAt: 0,
          lastXp: 0,
          sessionXp: snap.sessionXp,
          history: snap.history,
          injected: snap.injected,
          predictions: snap.predictions ?? [],
          signalCounts: (snap.signalCounts ?? {}) as Partial<Record<ProcessSignal, number>>,
          remediated: (snap.remediated ?? []) as ProcessSignal[],
          resumedAt: snap.i,
          ...freshStepState()
        });
        return;
      }
      set({
        lesson: lessonForRun,
        queue: lessonForRun.steps,
        i: 0,
        phase: "work",
        lastAdvanceAt: 0,
        lastXp: 0,
        sessionXp: 0,
        history: [],
        injected: [],
        predictions: [],
        signalCounts: {},
        remediated: [],
        resumedAt: null,
        ...freshStepState()
      });
    },

    restart: () => {
      const l = get().lesson;
      if (!l) return;
      clearLessonState(l.id);
      set({
        lesson: l,
        queue: l.steps,
        i: 0,
        phase: "work",
        lastAdvanceAt: 0,
        lastXp: 0,
        sessionXp: 0,
        history: [],
        injected: [],
        predictions: [],
        signalCounts: {},
        remediated: [],
        resumedAt: null,
        ...freshStepState()
      });
    },

    setValue: (v) => {
      const phase = get().phase;
      if (phase === "correct" || phase === "revealed") {
        set({ value: v, explorationActive: true, explorationFeedback: "", explorationCorrect: null });
        return;
      }
      set({ value: v });
    },

    check: () => {
      const st = get();
      // A verdict is a saved checkpoint, not a padlock. Post-verdict checks are
      // deliberately ungraded: no attempts, history, mastery, review item, or XP changes.
      if ((st.phase === "correct" || st.phase === "revealed") && st.explorationActive) {
        const step = st.queue[st.i];
        if (!step.widget) return;
        const result = evaluate(step.widget, st.value);
        set({ explorationFeedback: result.feedback, explorationCorrect: result.correct });
        return;
      }
      // Rapid-input guard: grading is only legal while working. A double-click
      // or Enter-spam that lands after the verdict must be a no-op — otherwise
      // the second call re-runs finalize and duplicates history/XP/mastery.
      if (st.phase !== "work") return;
      const s = st.queue[st.i];
      if (!s.widget) return;
      const res = evaluate(s.widget, st.value);
      if (res.correct) {
        finalize(true, false, res.feedback);
        return;
      }
      const attempts = st.attempts + 1;
      if (s.kind === "interactive") {
        set({ attempts, phase: "retry", feedback: res.feedback });
        return;
      }
      if (attempts === 1) {
        recordMiss(s); // first wrong attempt → spaced-review queue
        set({ attempts, phase: "retry", feedback: res.feedback });
      } else {
        finalize(false, true, res.feedback);
      }
    },

    tryAgain: () => { if (get().phase === "retry") set({ phase: "work" }); },

    reveal: () => {
      const st = get();
      // Reveal is only reachable from retry; a second click after the reveal
      // has landed must not finalize (and pay out / record evidence) twice.
      if (st.phase !== "retry") return;
      finalize(false, true, st.feedback);
    },

    next: (skip = false) => {
      const st = get();
      // Phase guard: advancing is legal after a verdict, or from an ungraded
      // step (concept/recap/interactive) while working. In particular phase
      // "done" is NOT legal — the second half of a double-Continue on the last
      // step must never reach persistCompletion again.
      const s = st.queue[st.i];
      const ungraded = s && (s.kind === "concept" || s.kind === "recap" || s.kind === "interactive");
      const legal =
        st.phase === "correct" || st.phase === "revealed" || (st.phase === "work" && ungraded);
      if (!legal) return;
      // Transition latch: two ungraded steps in a row keep phase === "work",
      // so the phase guard alone cannot catch a double-click there — the
      // second click would silently skip a reading step. A short latch
      // absorbs it; 350ms is beyond any double-input, below any real read.
      const now = Date.now();
      if (advanceLatchMs > 0 && now - st.lastAdvanceAt < advanceLatchMs) return;
      const nextI = st.i + (skip ? 2 : 1);
      if (nextI >= st.queue.length) {
        persistCompletion();
        // Completion resets the latch too: the terminal state must not carry
        // timing into whatever run is loaded next.
        set({ phase: "done", lastAdvanceAt: 0 });
        return;
      }
      // Entering a new step is the durable checkpoint: everything up to here
      // (queue shape incl. remedials, XP, history) survives refresh and back.
      if (st.lesson) {
        saveLessonState({
          v: 1,
          lessonId: st.lesson.id,
          stepIds: st.queue.map((q) => q.id),
          i: nextI,
          sessionXp: st.sessionXp,
          history: st.history,
          injected: st.injected,
          predictions: st.predictions,
          signalCounts: st.signalCounts as Record<string, number>,
          remediated: st.remediated,
          savedAt: new Date().toISOString()
        });
      }
      set({ i: nextI, phase: "work", lastAdvanceAt: now, resumedAt: null, ...freshStepState() });
    },

    hint: () => {
      const st = get();
      const s = st.queue[st.i];
      if (s.hints && st.hintsShown < s.hints.length) set({ hintsShown: st.hintsShown + 1 });
    },

    swapVariant: () => set({ variant: get().variant === 0 ? 1 : 0 }),

    noteSignal: (sig, opts) => {
      const st = get();
      if (st.stepSignal !== null) return { kind: "none" }; // first latch wins, like the cue
      const counts = { ...st.signalCounts, [sig]: (st.signalCounts[sig] ?? 0) + 1 };
      // The never-slow-down gate mirrors the skip-offer's fluency notion: the
      // last two graded attempts were unaided first-try successes.
      const n = st.history.length;
      const fluent =
        n >= 2 &&
        st.history[n - 1].correct &&
        st.history[n - 1].firstTry &&
        st.history[n - 2].correct &&
        st.history[n - 2].firstTry;
      const resp = decideResponse({
        signal: sig,
        occurrence: counts[sig] ?? 1,
        fluent,
        remediatedSignals: st.remediated,
        control: opts.control
      });
      // A lock only means something on an engine that renders it; elsewhere the
      // second rung degrades to the scaffold framing rather than a silent no-op.
      const applied: AdaptiveResponse = resp.kind === "lock" && !opts.lockCapable ? { kind: "scaffold" } : resp;
      set({
        stepSignal: sig,
        signalCounts: counts,
        ...(applied.kind === "lock" ? { lockedControl: applied.control } : {}),
        ...(applied.kind === "remedial" ? { pendingRemedial: true, remediated: [...st.remediated, sig] } : {})
      });
      return applied;
    },

    clearLock: () => {
      if (get().lockedControl !== null) set({ lockedControl: null });
    },

    commitPrediction: (optionId) => {
      if (get().prediction === null) set({ prediction: optionId });
    }
  };
});

export function sameCMLValue(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}
