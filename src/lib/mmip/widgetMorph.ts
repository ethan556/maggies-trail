/**
 * MMIP — the widget side of the motion layer, once.
 *
 * `equationMorph` compiles a `SyncTransaction` into a `MorphPlan` of unitless phases. Turning those
 * phases into pixels was then copied into every adopting widget: the same effect, the same
 * `durationWeight × base` arithmetic, the same reduced-motion routing, the same plan stack for
 * undo, the same per-gesture coalescing. Three copies is where a fourth engine starts inventing a
 * fourth dialect, so it lives here.
 *
 * WHAT IS SHARED (all of it identical across SolveBalanceW, SlopeTriangleW and AlgebraTilesW):
 *   · actors are located by the plan's OWN ids — `[data-morph-actor~="<target>:<side>"]` — so no
 *     widget keeps a second, hand-maintained map of what moves;
 *   · one base constant per engine converts a ratio to milliseconds, and nothing else does;
 *   · motion plays through the Web Animations API: no stylesheet, no dependency, no timers. Under
 *     jsdom `Element.animate` is simply absent and every call is a guarded no-op, while the same
 *     pass writes `data-morph-motion` / `data-morph-ms`, which is what makes the plan and the
 *     ratio→ms mapping assertable in a DOM test;
 *   · `prefers-reduced-motion: reduce` is read at edit time, not at render, so a change of setting
 *     takes effect on the next move without a remount. Under it nothing travels and the reduced
 *     plan's words — every phase's description plus its net state delta — are handed to the
 *     caller's live region instead.
 *
 * WHAT IS NOT SHARED, deliberately: the canonical state's own undo history. solveBalance persists
 * snapshots in its value, algebraTiles keeps them in component state, the line family delegates to
 * `repSyncGraph`. Only the MOTION history is here, because only that is the same everywhere.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { reducedMotion, reversePlan, type MorphMotion, type MorphPlan } from "./equationMorph";

/* ─────────────────────────────────────── the vocabulary ─────────────────────────────────────── */

/** The default ratio→milliseconds base. An engine may pass its own; nothing else converts. */
export const MORPH_BASE_MS = 220;

/**
 * One keyframe set per motion semantic in `mmipTypes.ts` §3 — the only place a motion verb becomes
 * pixels. No crossfades: every set moves or reshapes something, because a fade between two strings
 * explains nothing.
 */
export const MORPH_FRAMES: Record<MorphMotion, Keyframe[]> = {
  join: [{ opacity: 0.2, transform: "translateY(-10px) scale(0.9)" }, { opacity: 1, transform: "none" }],
  leave: [{ opacity: 0.35, transform: "translateY(8px) scale(0.94)" }, { opacity: 1, transform: "none" }],
  collapse: [{ transform: "scale(1.08)" }, { transform: "scale(0.92)" }, { transform: "none" }],
  partition: [{ transform: "scaleX(1.08)" }, { transform: "scaleX(0.9)" }, { transform: "none" }],
  branch: [{ transform: "scale(0.88)" }, { transform: "scale(1.05)" }, { transform: "none" }],
  gather: [{ transform: "scale(1.06)" }, { transform: "scale(0.95)" }, { transform: "none" }],
  reflect: [{ transform: "scaleX(-1)" }, { transform: "scaleX(1)" }],
  pivot: [{ transform: "rotate(-14deg)" }, { transform: "rotate(10deg)" }, { transform: "none" }],
  rewind: [{ opacity: 0.3, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
};

/** The learner's own system setting, read at the moment of the edit. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** What a widget carries between an edit and its animation. Never persisted: motion is not
 * mathematics, and a state restored from storage must not replay a move the learner never made. */
export interface StagedMorph<T extends string> {
  readonly tick: number;
  readonly plan: MorphPlan<T>;
  readonly reduced: boolean;
}

/* ────────────────────────────────────── playing a plan ────────────────────────────────────── */

/**
 * Play one plan inside `root`, imperatively. Pure of React; exported so the helper's own test can
 * drive it against a hand-built DOM without mounting a component.
 *
 * Returns every `Animation` it started, so the caller can cancel them when the next morph arrives
 * or the component unmounts (S208 review carry-over). Under jsdom that list is always empty,
 * because `Element.animate` does not exist there.
 */
export function playMorphPlan<T extends string>(
  root: ParentNode,
  plan: MorphPlan<T> | null,
  baseMs: number = MORPH_BASE_MS
): Animation[] {
  for (const el of Array.from(root.querySelectorAll("[data-morph-ms]"))) {
    el.removeAttribute("data-morph-ms");
    el.removeAttribute("data-morph-motion");
  }
  if (!plan || plan.rejected || plan.phases.length === 0) return [];
  const running: Animation[] = [];
  let delay = 0;
  for (const phase of plan.phases) {
    const ms = Math.round(phase.durationWeight * baseMs);
    const stagger = Math.round(phase.stagger * baseMs);
    // One element may answer to two of a phase's actor ids (a two-sided operation whose holders
    // happen to be drawn as one node). It should move once, on the earlier of the two beats —
    // moving it twice would read as a stutter rather than as one gesture.
    const seen = new Set<Element>();
    phase.actors.forEach((actor, i) => {
      for (const el of Array.from(root.querySelectorAll(`[data-morph-actor~="${actor}"]`))) {
        if (seen.has(el)) continue;
        seen.add(el);
        el.setAttribute("data-morph-motion", phase.motion);
        el.setAttribute("data-morph-ms", String(ms));
        const a = (el as HTMLElement).animate?.(MORPH_FRAMES[phase.motion], {
          duration: ms,
          delay: delay + i * stagger,
          easing: "ease-out",
          fill: "none",
        });
        if (a) running.push(a);
      }
    });
    delay += ms + stagger * Math.max(0, phase.actors.length - 1);
  }
  return running;
}

/* ─────────────────────────────────────── the stage hook ─────────────────────────────────────── */

export interface MorphStage<T extends string> {
  /** Put this on the widget's root element; actors are only ever looked for inside it. */
  readonly rootRef: React.MutableRefObject<HTMLDivElement | null>;
  /**
   * Play a plan and say the same thing in words. Under reduced motion the words are the reduced
   * plan's — every phase's description plus its net state delta — because then text is the only
   * channel the transformation has. Returns the plan actually shown.
   */
  readonly stage: (plan: MorphPlan<T>, fallback: string, rejected?: boolean, audible?: boolean) => MorphPlan<T>;
  /** The staged morph, for a widget that wants to render from it. */
  readonly staged: StagedMorph<T> | null;
}

export interface MorphStageOptions {
  /** Ratio→ms base for this engine. Defaults to `MORPH_BASE_MS`. */
  readonly baseMs?: number;
  /** Where the words go: the caller's `role="status"` live region setter. */
  readonly describe: (text: string, rejected: boolean, audible?: boolean) => void;
  /** Injectable for tests; defaults to the real media query. */
  readonly reducedMotionQuery?: () => boolean;
}

export function useMorphStage<T extends string>(opts: MorphStageOptions): MorphStage<T> {
  const { baseMs = MORPH_BASE_MS, describe, reducedMotionQuery = prefersReducedMotion } = opts;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [staged, setStaged] = useState<StagedMorph<T> | null>(null);
  const tick = useRef(0);
  const running = useRef<Animation[]>([]);
  const describeRef = useRef(describe);
  describeRef.current = describe;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Retire whatever the previous morph left in flight before starting the next one, so two
    // edits in quick succession do not fight over the same element.
    for (const a of running.current) a.cancel();
    running.current = staged && !staged.reduced ? playMorphPlan(root, staged.plan, baseMs) : playMorphPlan(root, null, baseMs);
    return () => {
      for (const a of running.current) a.cancel();
      running.current = [];
    };
  }, [staged, baseMs]);

  const stage = useCallback(
    (plan: MorphPlan<T>, fallback: string, rejected = false, audible?: boolean): MorphPlan<T> => {
      const reduced = reducedMotionQuery();
      const shown = reduced ? (reducedMotion(plan) as MorphPlan<T>) : plan;
      tick.current += 1;
      setStaged({ tick: tick.current, plan: shown, reduced });
      describeRef.current(
        reduced && !shown.rejected && shown.phases.length > 0 ? shown.phases[0].describe : fallback,
        rejected,
        audible
      );
      return shown;
    },
    [reducedMotionQuery]
  );

  return { rootRef, stage, staged };
}

/* ──────────────────────────────── the motion history (undo + runs) ──────────────────────────── */

/**
 * The plan stack `Undo` reads backwards, and the per-gesture coalescing rule that decides whether a
 * new edit starts a step or continues one.
 *
 * A RUN is a sequence of edits carrying the same key — keystrokes into one field, repeated presses
 * of one stepper, one drag. They are one step back, landing on the value the run began from, not on
 * whatever intermediate the learner typed on the way. When a run continues, the stored plan is
 * REPLACED by the caller's net plan (recompiled from the run's starting position) so an undo
 * animates the whole run rather than only its last beat.
 *
 * ── TWO PATHS, AND WHY THE INVARIANT IS CHECKED RATHER THAN TRUSTED (S211 review, condition 1) ──
 *
 * There are two ways to record, because there are two kinds of engine:
 *
 *   KEYED    `continues` / `record` / `endRun` — the hook owns the run key. solveBalance and
 *            algebraTiles work this way: a run is "edits to this slot".
 *   EXTERNAL `recordAs("push" | "coalesce")` — the caller owns the oracle. The line family asks
 *            `repSyncGraph`, which coalesces its OWN history, so the truth about whether a step
 *            was opened lives there and this hook must not second-guess it.
 *
 * The stack is one object, and the two paths keep run bookkeeping in different places — so mixing
 * them on one instance would leave `runKey` describing a run the stack does not have. That was
 * settled by convention when `recordAs` was introduced; it is settled by a MODE LATCH now. The
 * first recording call fixes the instance's mode and the other path throws by name, so a widget
 * that drifts fails loudly at its first edit instead of desynchronising undo silently.
 *
 * The latch is deliberately NOT reset by `clear()`: which path a widget uses is a property of the
 * widget's code, not of the learner's session, so a reset would only widen the hole.
 */

/** Thrown when a caller breaks one of this hook's structural invariants. Named and coded, because
 * these are programming errors a test should be able to assert on precisely. */
export class MorphHistoryError extends Error {
  readonly code: "mixed-record-paths" | "coalesce-on-empty-stack";
  constructor(code: "mixed-record-paths" | "coalesce-on-empty-stack", message: string) {
    super(message);
    this.name = "MorphHistoryError";
    this.code = code;
  }
}
export interface MorphHistory<T extends string> {
  /** Does this key continue the run already in progress? Ask before committing state.
   * KEYED PATH — latches this instance; `recordAs` will then throw. */
  readonly continues: (runKey: string | null) => boolean;
  /** Record a committed edit. `netPlan` is used when the run continues (defaults to `plan`).
   * KEYED PATH — latches this instance; `recordAs` will then throw. */
  readonly record: (plan: MorphPlan<T>, runKey?: string | null, netPlan?: MorphPlan<T>) => "pushed" | "coalesced";
  /**
   * Record with the decision already made. For an engine whose run-detection is authoritative
   * somewhere else — the line family asks `repSyncGraph`, which coalesces its own history — the
   * stack mechanics are still shared, but the oracle stays where it can see the truth.
   *
   * EXTERNAL PATH — latches this instance; `continues`/`record`/`endRun` will then throw. Asking to
   * coalesce with an empty stack throws `coalesce-on-empty-stack`: there is no step to fold into,
   * and inventing one is how undo desynchronises.
   */
  readonly recordAs: (mode: "push" | "coalesce", plan: MorphPlan<T>) => void;
  /** Pop the last plan and return its REVERSE, ready to stage. Null when there is nothing to undo. */
  readonly takeReverse: () => MorphPlan<T> | null;
  /** End the run in progress WITHOUT touching the stack: a field blurred, a panel closed, a drag
   * released. The next edit starts a new undo step even if it carries the same key.
   * KEYED PATH — latches this instance; `recordAs` will then throw. */
  readonly endRun: () => void;
  /** Forget everything: a reset, or a representation the learner closed. Shared by both paths, and
   * deliberately does NOT reset the mode latch — which path a widget uses is a fact about its code,
   * not about the session. */
  readonly clear: () => void;
  /** How many steps of motion history exist. */
  readonly depth: () => number;
}

export function useMorphHistory<T extends string>(): MorphHistory<T> {
  const stack = useRef<Array<MorphPlan<T>>>([]);
  const runKey = useRef<string | null>(null);
  /** null until the first call on either path; then this instance is one or the other, for life. */
  const mode = useRef<"keyed" | "external" | null>(null);

  const latch = useCallback((want: "keyed" | "external", member: string) => {
    if (mode.current === null) {
      mode.current = want;
      return;
    }
    if (mode.current !== want) {
      throw new MorphHistoryError(
        "mixed-record-paths",
        `useMorphHistory: this instance is already driving the ${mode.current} path, and \`${member}\` ` +
          `belongs to the ${want} path. One widget owns its run bookkeeping in ONE place — the hook's ` +
          "own run key, or the caller's oracle — because the two keep it in different places and mixing " +
          "them leaves the run key describing a step the stack does not have. Use `continues`/`record`/" +
          "`endRun`, or use `recordAs`, but not both on one instance."
      );
    }
  }, []);

  const continues = useCallback(
    (key: string | null) => {
      latch("keyed", "continues");
      return key !== null && key === runKey.current && stack.current.length > 0;
    },
    [latch]
  );
  const record = useCallback(
    (plan: MorphPlan<T>, key: string | null = null, netPlan?: MorphPlan<T>): "pushed" | "coalesced" => {
      latch("keyed", "record");
      if (key !== null && key === runKey.current && stack.current.length > 0) {
        stack.current = [...stack.current.slice(0, -1), netPlan ?? plan];
        return "coalesced";
      }
      runKey.current = key;
      stack.current = [...stack.current, plan];
      return "pushed";
    },
    [latch]
  );
  const recordAs = useCallback(
    (m: "push" | "coalesce", plan: MorphPlan<T>) => {
      latch("external", "recordAs");
      if (m === "coalesce") {
        if (stack.current.length === 0) {
          // AUDITED (S211) against both consumers: a caller only asks to coalesce when its own
          // gesture bookkeeping says a run is open, and that bookkeeping is set ONLY when a push
          // happened and cleared ONLY in undo, immediately after `takeReverse` pops. So a run open
          // over an empty stack is unreachable — and if it ever becomes reachable it is a
          // desynchronised oracle, not a step to guess at. Guessing here is what "silently pushes"
          // meant; a caller that genuinely wants a first step asks for one by name.
          throw new MorphHistoryError(
            "coalesce-on-empty-stack",
            "useMorphHistory: recordAs(\"coalesce\") with nothing on the stack — there is no step to " +
              "fold this edit into. The caller's run oracle and this stack have come apart; a first " +
              "edit must be recorded with recordAs(\"push\")."
          );
        }
        stack.current = [...stack.current.slice(0, -1), plan];
        return;
      }
      stack.current = [...stack.current, plan];
    },
    [latch]
  );
  const takeReverse = useCallback((): MorphPlan<T> | null => {
    runKey.current = null;
    const last = stack.current[stack.current.length - 1];
    stack.current = stack.current.slice(0, -1);
    return last ? (reversePlan(last) as MorphPlan<T>) : null;
  }, []);
  const endRun = useCallback(() => {
    latch("keyed", "endRun");
    runKey.current = null;
  }, [latch]);
  const clear = useCallback(() => {
    stack.current = [];
    runKey.current = null;
  }, []);
  const depth = useCallback(() => stack.current.length, []);

  return { continues, record, recordAs, endRun, takeReverse, clear, depth };
}

/** The empty plan a widget stages when it has motion history for nothing (a session restored from
 * storage has state but no plans, and undo there is silent rather than inventing an animation for
 * a move it never saw). */
export const NO_MORPH: MorphPlan<string> = { phases: [], rejected: false };
