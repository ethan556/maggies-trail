/**
 * TRAIL CHROME & NARRATION — the presentational half of the lesson player,
 * extracted verbatim in Session 101. Pure rendering: waypoints, dots, the goal
 * ring, summit route, per-step narration, and rich text. No grading, no phase
 * logic, no persistence — that lives in playerStore.ts. A restyle here cannot
 * regress the machine, and the machine cannot regress a pixel.
 */
"use client";

import { useEffect, useState } from "react";
import { TRAIL, TRAIL_STAGE } from "@/lib/trail";
import type { TStep } from "@/lib/schema";
import { AppIcon, normalizeStepProgress, StepSegments } from "@/components/ui";
import { canSpeak, cancelSpeech, narrationEnabled, narrationFor, setNarrationEnabled, speak } from "@/lib/speech";
import { MathProse } from "@/components/math/MathText";
/* ---------------- Rendering ---------------- */

/**
 * NARRATION — the listen control for early-profile (K–2) steps.
 *
 * Pre-readers can't drive a text-first player, so early lessons carry an authored `narration`
 * string per step. Behaviour is deliberately conservative:
 *
 *   • It renders only when the browser actually supports speech and the step has something to say,
 *     so an unsupported browser shows no dead button.
 *   • Auto-advance narration is OFF until the learner switches it on. That satisfies browser
 *     autoplay policy (the toggle is the required gesture) and, more importantly, keeps a shared
 *     classroom device from suddenly talking.
 *   • Once on, changing step speaks the new step and cancels the old one, so a learner tapping
 *     quickly never stacks two voices.
 */
export function Narration({ step, stepKey }: { step: TStep; stepKey: string }) {
  const [on, setOn] = useState(false);
  const [supported, setSupported] = useState(false);
  // Read support and the stored preference after mount — both touch `window`, and this component
  // renders on the server first.
  useEffect(() => {
    setSupported(canSpeak());
    setOn(narrationEnabled());
  }, []);

  const text = narrationFor(step);

  // Speak on step change, but only while enabled. Cancelling on cleanup is what stops a fast
  // learner from accumulating overlapping utterances.
  useEffect(() => {
    if (!on || !text) return;
    speak(text);
    return () => cancelSpeech();
  }, [stepKey, on, text]);

  if (!supported || !text) return null;

  return (
    <div className="mb-3 flex items-center gap-2">
      <button
        type="button"
        onClick={() => speak(text)}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-sky/40 bg-sky/10 px-4 font-bold text-sky-ink"
      >
        <AppIcon name="icon-808" size={16} />
        Listen
      </button>
      <button
        type="button"
        aria-pressed={on}
        onClick={() => {
          const next = !on;
          setOn(next);
          setNarrationEnabled(next);
          if (next) speak(text);
        }}
        className="min-h-11 rounded-full px-3 text-sm font-bold text-ink/70 underline underline-offset-2"
      >
        {on ? "Stop reading each step" : "Read each step to me"}
      </button>
    </div>
  );
}

/** Step body prose. Bold is split here; ITALICS are handled inside `MathProse`, which every
 *  segment below is passed through — so `*then*` renders emphasised in body text and in widget
 *  prompts from one rule, rather than from two that can drift. See MathText.tsx for why that rule
 *  has to be careful: the same character is multiplication in "f(x) = 5 * 3^x". */
export function Rich({ text, early }: { text: string; early?: boolean }) {
  const parts = text.split("**");
  return (
    <p className={`${early ? "text-xl" : "text-lg"} leading-relaxed`}>
      {parts.map((p, i) => (i % 2 === 1 ? <strong key={i}><MathProse text={p} includeArithmetic /></strong> : <span key={i}><MathProse text={p} includeArithmetic /></span>))}
    </p>
  );
}

export function TrailDots({
  steps,
  current,
  remedialIds,
  reviewingIndex,
  onSelectCompleted
}: {
  steps: TStep[];
  current: number;
  remedialIds: Set<string>;
  reviewingIndex?: number | null;
  onSelectCompleted?: (index: number) => void;
}) {
  const progress = normalizeStepProgress(steps.length, current);
  // The broken bar over the whole sitting: walked segments LEAF (the trail
  // grammar app-wide), the current step TANGERINE, ahead a hairline; injected
  // remedial steps keep their berry ring + dot-in arrival, and the aria label
  // still narrates that the trail grew.
  const injected = new Set(steps.map((s, i) => (remedialIds.has(s.id) ? i : -1)).filter((i) => i >= 0));
  return (
    <StepSegments
      total={progress.total}
      current={progress.current}
      injected={injected}
      label={`Step ${progress.current + 1} of ${progress.total}${onSelectCompleted ? "; completed items can be opened in read-only review" : ""}${remedialIds.size > 0 ? "; the trail grew to add help steps" : ""}`}
      reviewingIndex={reviewingIndex}
      onSelectCompleted={onSelectCompleted}
      className="min-w-0"
    />
  );
}

/** Compact daily-goal ring for the completion screen (static under reduced motion). */
export function GoalRing({ done, goal }: { done: number; goal: number }) {
  const R = 24;
  const C = 2 * Math.PI * R;
  const frac = goal > 0 ? Math.min(done, goal) / goal : 0;
  const met = goal > 0 && done >= goal;
  return (
    <svg viewBox="0 0 60 60" className={`h-14 w-14 ${met ? "goal-met" : ""}`} aria-hidden="true">
      <circle cx="30" cy="30" r={R} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="6" />
      <circle
        cx="30"
        cy="30"
        r={R}
        fill="none"
        stroke={met ? "#2FA36B" : "#FF8A3D"}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - frac)}
        transform="rotate(-90 30 30)"
        className="ring-fill"
      />
      <text x="30" y="35" textAnchor="middle" fontSize="15" fontWeight="800" fill="currentColor" className="tabular-nums">
        {Math.min(done, goal)}/{goal}
      </text>
    </svg>
  );
}

/**
 * SPARK BURST — the moment of "yes!" made visible.
 *
 * Twelve brand-colored sparks fly outward from a point: fired on every correct
 * answer (keyed by step index so it re-fires each time) and once at the summit.
 * Fully deterministic — fixed angle/distance/delay/color tables, no randomness,
 * honoring the app's no-unseeded-randomness invariant even for decoration.
 * Pure CSS animation: `aria-hidden`, `pointer-events-none`, gated behind
 * prefers-reduced-motion (the particles simply never appear), and killed by the
 * in-app motion toggle via the global [data-reduce-motion] override. Under
 * forced-colors the sparks are hidden entirely.
 */
const SPARK_COLORS = ["#2E7CD6", "#FF8A3D", "#2FA36B", "#D6455D"] as const;
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * 30 - 90) * (Math.PI / 180); // fan from straight up, clockwise
  const dist = 44 + (i % 3) * 16; // three deterministic rings: 44/60/76 px
  return {
    dx: Math.round(Math.cos(angle) * dist),
    dy: Math.round(Math.sin(angle) * dist * 0.85), // slightly squashed vertically
    delay: (i % 4) * 40, // four staggered waves
    color: SPARK_COLORS[i % SPARK_COLORS.length]
  };
});

export function SparkBurst({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`spark-burst ${className}`}>
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="spark-p"
          style={
            {
              "--sx": `${s.dx}px`,
              "--sy": `${s.dy}px`,
              "--sd": `${s.delay}ms`,
              "--sc": s.color
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}



const TRAIL_GUIDE = {
  concept: {
    label: TRAIL_STAGE.concept,
    cue: "Notice the landmark before you move on.",
    icon: "icon-808" as const,
    // Ink, not a raw Tailwind violet. The palette is semantic (§20): sky =
    // learner-controlled, tangerine = target/attention, leaf = confirmed,
    // berry = conflict, ink = fixed mathematical structure. A concept step is
    // structure being SHOWN to the learner, so ink is the honest token — and
    // it keeps the trail chrome inside the brand palette in both themes.
    tone: "text-ink/[0.72] dark:text-paper/[0.72]"
  },
  interactive: {
    label: TRAIL_STAGE.interactive,
    cue: "Move the model and watch what must change.",
    icon: "icon-807" as const,
    tone: "text-sky-ink"
  },
  check: {
    label: TRAIL_STAGE.check,
    cue: "Leave the model behind and prove the idea yourself.",
    icon: "icon-803" as const,
    tone: "text-leaf-ink"
  },
  challenge: {
    label: TRAIL_STAGE.challenge,
    cue: "Use the idea where the route is less obvious.",
    icon: "icon-804" as const,
    tone: "text-tangerine-ink"
  },
  recap: {
    label: TRAIL_STAGE.recap,
    cue: "Name the pattern you can carry to the next trail.",
    icon: "icon-901" as const,
    // Recap consolidates what has been confirmed, so it speaks in leaf — the
    // same token the "confirmed relationship" contract already uses.
    tone: "text-leaf-ink"
  }
} as const;

/** TrailMark — the trail's smallest unit of iconography: a dashed route from
 * a trailhead dot to a waypoint ring. Drawn in currentColor so it inherits
 * whatever semantic tone its card speaks in (sky for "continue", tangerine
 * for "new here", leaf for "trail complete"). This is how the trail language
 * travels beyond the player without hauling the full atmosphere along. */
export function TrailMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 20" width="64" height="20" aria-hidden="true" className={className}>
      <path
        d="M4 15 C 18 15, 22 5, 34 7 C 44 8.6, 48 12, 58 8"
        fill="none" stroke="currentColor" strokeWidth="2.4"
        strokeLinecap="round" strokeDasharray="1 6"
      />
      <circle cx="4" cy="15" r="2.6" fill="currentColor" />
      <circle cx="58" cy="8" r="3.4" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

export function TrailAtmosphere() {
  return (
    <div className="trail-atmosphere" aria-hidden="true">
      <span className="trail-atmosphere__ridge trail-atmosphere__ridge--far" />
      <span className="trail-atmosphere__ridge trail-atmosphere__ridge--near" />
      <span className="trail-atmosphere__route" />
    </div>
  );
}

export function TrailWaypoint({
  kind,
  current,
  total,
  lessonTitle
}: {
  kind: TStep["kind"];
  current: number;
  total: number;
  lessonTitle: string;
}) {
  const guide = TRAIL_GUIDE[kind];
  return (
    <section className="trail-waypoint" aria-label={`${guide.label}: ${TRAIL.waypoint} ${current + 1} of ${total}`}>
      <span className={`trail-waypoint__marker ${guide.tone}`} aria-hidden="true">
        <AppIcon name={guide.icon} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className={`text-[11px] font-extrabold uppercase tracking-[0.16em] ${guide.tone}`}>
            {guide.label}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/[0.7] dark:text-paper/[0.7]">
            {TRAIL.waypointLabel} {current + 1} of {total}
          </p>
        </div>
        <h1 className="truncate text-sm font-extrabold text-ink/[0.85] dark:text-paper/[0.85]">{lessonTitle}</h1>
      </div>
      <p className="hidden max-w-[18rem] text-right text-xs font-semibold leading-snug text-ink/[0.7] dark:text-paper/[0.7] md:block">
        {guide.cue}
      </p>
    </section>
  );
}

export function TrailClearingLabel({ kind }: { kind: TStep["kind"] }) {
  const guide = TRAIL_GUIDE[kind];
  return (
    <div className="trail-clearing-label" aria-hidden="true">
      <AppIcon name="icon-807" size={13} />
      <span>{TRAIL.clearing}</span>
      <span className="trail-clearing-label__dot" />
      <span>{guide.label}</span>
    </div>
  );
}

export function SummitRoute({ walked }: { walked: number }) {
  return (
    <svg viewBox="0 0 520 170" className="summit-route" aria-hidden="true">
      <path d="M0 145 C82 118 125 128 184 96 C242 64 283 91 344 58 C398 29 447 52 520 8 V170 H0Z" className="summit-route__ridge summit-route__ridge--far" />
      <path d="M0 158 C93 134 158 151 223 111 C294 67 349 114 417 66 C456 39 486 31 520 22 V170 H0Z" className="summit-route__ridge summit-route__ridge--near" />
      <path d="M38 146 C108 118 137 142 196 106 C252 72 304 112 356 74 C402 40 449 62 486 25" className="summit-route__path" />
      <circle cx="38" cy="146" r="7" className="summit-route__start" />
      <circle cx="486" cy="25" r="9" className="summit-route__peak" />
      <text x="38" y="165" textAnchor="middle" className="summit-route__text">{TRAIL.trailhead}</text>
      <text x="486" y="17" textAnchor="middle" className="summit-route__text">{walked} {TRAIL.waypoint}s</text>
    </svg>
  );
}
