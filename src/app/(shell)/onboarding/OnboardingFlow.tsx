"use client";

import Link from "next/link";
import { useState } from "react";
import {
  recommendGradeTrail,
  trailsForGrade,
  type Goal,
  type GradeLevel,
  type Recommendation
} from "@/lib/onboarding";
import { progressStore } from "@/lib/progress";
import { cleanName } from "@/lib/personalize";
import { AppIcon } from "@/components/ui";
import { AvatarPicker } from "@/components/AvatarPicker";
import { AVATARS } from "@/lib/avatars";

// WS-J: the avatar stage between "grade" and "goal" only renders while the manifest has at least
// one enabled entry — a screen with zero selectable options is a dead stage, so the grade step
// would skip straight to "goal" instead. Production art landed 2026-08-14, so this is true and the
// stage renders for every grade; the guard stays because it is what keeps onboarding honest if
// every entry is ever disabled again (art pulled after a QA rejection). See
// OnboardingFlow.avatar.test.tsx for the live path and the emptied-manifest path.
const HAS_ENABLED_AVATARS = AVATARS.some((a) => a.enabled);

// Every band with a trail belongs here. K/1/2 and 9–13 had trails in onboarding.ts all along and
// the picker never offered them, so `trailsForGrade` was dead code above Grade 8 — a whole HS and
// Precalculus catalogue that onboarding could not reach.
const GRADES: Array<{ id: GradeLevel; label: string; sub: string }> = [
  { id: 0, label: "Kindergarten", sub: "Counting to 20, shapes, sorting, and comparing" },
  { id: 1, label: "Grade 1", sub: "Adding and subtracting within 20, tens and ones, shapes and time" },
  { id: 2, label: "Grade 2", sub: "Adding within 100, place value to 1000, measurement, money and time" },
  { id: 3, label: "Grade 3", sub: "Multiplication, place value, fractions, measurement, shapes" },
  { id: 4, label: "Grade 4", sub: "Bigger multiplication, place value to a million, and more" },
  { id: 5, label: "Grade 5", sub: "Decimals, fraction operations, volume, and the coordinate plane" },
  { id: 6, label: "Grade 6", sub: "Ratios, negative numbers, expressions, and data" },
  { id: 7, label: "Grade 7", sub: "Proportional relationships, rational numbers, equations, geometry, and statistics" },
  { id: 8, label: "Grade 8", sub: "Real numbers, exponents, functions, linear systems, geometry, and data" },
  { id: 9, label: "Algebra 1", sub: "Equations, linear functions, systems, exponents, quadratics" },
  { id: 10, label: "Geometry", sub: "Congruence, similarity, circles, trigonometry, proof — and probability" },
  { id: 11, label: "Algebra 2", sub: "Polynomials, rational and radical functions, logarithms, series, statistics" },
  { id: 12, label: "Precalculus", sub: "Trig graphs and identities, vectors, polar and parametric, limits" },
  { id: 13, label: "Calculus", sub: "Derivatives, integrals, the Fundamental Theorem — a year past precalculus" }
];

/** Grades 0 and 9–13 are not "Grade n" — they have names. */
function gradeLabel(g: GradeLevel): string {
  return GRADES.find((x) => x.id === g)?.label ?? `Grade ${g}`;
}

const GOALS: Array<{ id: Goal; label: string; sub: string }> = [
  { id: "school", label: "Keep up with school", sub: "Follow along with your class" },
  { id: "catchup", label: "Catch up on the basics", sub: "Rebuild the foundations, no rush" },
  { id: "ahead", label: "Race ahead", sub: "Already comfortable — bring the challenge" }
];

function ChoiceButton({
  label,
  sub,
  onClick
}: {
  label: string;
  sub?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group lift pressable flex w-full items-center gap-3 rounded-card border border-ink/12 bg-surface px-4 py-3 text-left shadow-e1 transition-colors hover:border-sky focus-visible:border-sky dark:border-paper/15"
    >
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold">{label}</span>
        {sub && <span className="mt-0.5 block text-sm text-content-2">{sub}</span>}
      </span>
      <span
        aria-hidden
        className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-sky-ink motion-reduce:transition-none"
      >
        <AppIcon name="icon-701" size={18} />
      </span>
    </button>
  );
}

/** Three way-marks across the flow: answer → placement → trailhead. */
function StepDots({ current }: { current: 1 | 2 | 3 }) {
  const marks = ["About you", "Starting spot", "Trailhead"] as const;
  return (
    <ol className="mb-5 flex items-center gap-2" aria-label={`Step ${current} of 3: ${marks[current - 1]}`}>
      {marks.map((m, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const state = n < current ? "done" : n === current ? "now" : "ahead";
        return (
          <li key={m} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className={`h-0.5 w-6 rounded-pill ${state === "ahead" ? "bg-ink/12 dark:bg-paper/12" : "bg-leaf/55"}`} />}
            <span
              aria-hidden
              className={`h-2.5 w-2.5 rounded-pill ${
                state === "done" ? "bg-leaf" : state === "now" ? "bg-tangerine ring-4 ring-tangerine/20" : "bg-ink/15 dark:bg-paper/15"
              }`}
            />
            <span className={`text-[11px] font-extrabold uppercase tracking-wide ${state === "now" ? "text-content" : "text-muted"}`}>
              {m}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

type Stage =
  | { at: "name" }
  | { at: "grade" }
  | { at: "avatar"; grade: GradeLevel }
  | { at: "goal"; grade: GradeLevel }
  | { at: "placement"; goal: Goal; grade: GradeLevel }
  | { at: "gradetrail"; goal: Goal; grade: GradeLevel }
  | { at: "done"; rec: Recommendation };

export default function OnboardingFlow() {
  const [stage, setStage] = useState<Stage>({ at: "name" });
  const [nameDraft, setNameDraft] = useState("");
  // Mirrors nameDraft: never prefilled from a prior profile (onboarding is a first-run flow, not
  // an edit flow — see commitName below, which has the same "never prefilled" property for names).
  const [avatarId, setAvatarId] = useState<string | undefined>(undefined);

  /** Save the name (if any) immediately, so it sticks even if they never finish. */
  function commitName(raw: string) {
    const n = cleanName(raw);
    if (n) {
      const p = progressStore.load();
      p.displayName = n;
      progressStore.save(p);
    }
    setStage({ at: "grade" });
  }

  function finishGradeTrail(goal: Goal, trailId: string, grade: GradeLevel) {
    const rec = recommendGradeTrail(trailId);
    // The learner explicitly chose to skip the diagnostic. Preserve the legacy onboarding
    // record shape for sync compatibility; placement evidence lives separately in `diagnostic`.
    saveAndFinish(goal, 2, 0, rec, grade);
  }

  function saveAndFinish(goal: Goal, comfort: 1 | 2 | 3, correct: number, rec: Recommendation, grade: GradeLevel) {
    const p = progressStore.load();
    p.onboarding = {
      goal,
      comfort,
      correctCount: correct,
      recommendedLessonId: rec.lessonId,
      completedAt: new Date().toISOString(),
      grade
    };
    progressStore.save(p);
    setStage({ at: "done", rec });
  }

  if (stage.at === "name") {
    return (
      <div className="step-in">
        <StepDots current={1} />
        <h1 className="text-2xl font-extrabold">Whose trail is this?</h1>
        <p className="mt-1 text-content-2">
          Add your first name and the whole app becomes <strong>your</strong> trail — or keep
          walking Maggie's.
        </p>
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            commitName(nameDraft);
          }}
        >
          <label className="block">
            <span className="text-sm font-bold text-content-2">Your first name</span>
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={20}
              autoComplete="given-name"
              placeholder="e.g. David"
              className="mt-1 w-full rounded-card border border-ink/12 bg-surface px-4 py-3 text-base font-bold outline-none transition-colors focus:border-sky focus:ring-2 focus:ring-sky/25 dark:border-paper/15"
            />
          </label>
          {cleanName(nameDraft) && (
            <p className="text-sm font-bold text-leaf-ink" aria-live="polite">
              {cleanName(nameDraft)}'s Trail — has a nice ring to it.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!cleanName(nameDraft)}
              className="pressable min-h-11 rounded-pill bg-cta px-6 py-3 font-extrabold text-white shadow-e1 transition-colors enabled:hover:bg-primary-hover enabled:hover:shadow-e2 disabled:opacity-40"
            >
              Make it my trail
            </button>
            <button
              type="button"
              onClick={() => setStage({ at: "grade" })}
              className="pressable min-h-11 rounded-pill border-2 border-ink/15 bg-surface px-6 py-3 font-extrabold transition-colors hover:border-sky hover:text-sky-ink dark:border-paper/20"
            >
              Keep Maggie's Trail
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (stage.at === "grade") {
    return (
      <div className="step-in">
        <StepDots current={1} />
        <h1 className="text-2xl font-extrabold">Welcome to the trail!</h1>
        <p className="mt-1 text-ink/70 dark:text-paper/70">Which grade are you working on?</p>
        <div className="mt-4 space-y-2">
          {GRADES.map((g) => (
            <ChoiceButton
              key={g.id}
              label={g.label}
              sub={g.sub}
              onClick={() =>
                setStage(HAS_ENABLED_AVATARS ? { at: "avatar", grade: g.id } : { at: "goal", grade: g.id })
              }
            />
          ))}
        </div>
      </div>
    );
  }

  if (stage.at === "avatar") {
    return (
      <div className="step-in">
        <StepDots current={1} />
        <h1 className="text-2xl font-extrabold">Choose your avatar</h1>
        <p className="mt-1 text-content-2">Pick one that feels right. You can change it anytime.</p>
        <div className="mt-4">
          <AvatarPicker
            grade={stage.grade}
            value={avatarId}
            onChange={(id) => {
              // Commit immediately, mirroring commitName — it sticks even if the learner bails
              // out of onboarding before reaching "done".
              const p = progressStore.load();
              p.avatarId = id;
              progressStore.save(p);
              setAvatarId(id);
            }}
          />
        </div>
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setStage({ at: "goal", grade: stage.grade })}
            className="pressable min-h-11 rounded-pill bg-cta px-6 py-3 font-extrabold text-white shadow-e1 transition-colors hover:bg-primary-hover hover:shadow-e2"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (stage.at === "goal") {
    return (
      <div className="step-in">
        <StepDots current={1} />
        <h1 className="text-2xl font-extrabold">What brings you here?</h1>
        <p className="mt-1 text-ink/70 dark:text-paper/70">
          {gradeLabel(stage.grade)} — good to have you.
        </p>
        <div className="mt-4 space-y-2">
          {GOALS.map((g) => (
            <ChoiceButton
              key={g.id}
              label={g.label}
              sub={g.sub}
              onClick={() => setStage({ at: "placement", goal: g.id, grade: stage.grade })}
            />
          ))}
        </div>
      </div>
    );
  }

  if (stage.at === "placement") {
    const diagnosticHref = `/placement?grade=${stage.grade}&goal=${encodeURIComponent(stage.goal)}`;
    return (
      <div className="step-in">
        <StepDots current={2} />
        <h1 className="text-2xl font-extrabold">Find the right starting spot</h1>
        <p className="mt-1 text-ink/70 dark:text-paper/70">
          Start near {gradeLabel(stage.grade)}, then let the same confidence-aware diagnostic used across Maggie’s Trail adjust from the evidence it sees.
        </p>
        <div className="mt-5 grid gap-3">
          <Link
            href={diagnosticHref}
            className="group lift pressable flex min-h-11 w-full items-center gap-3 rounded-card border-2 border-sky/35 bg-sky/5 px-4 py-4 text-left shadow-e1 transition-colors hover:border-sky"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-extrabold">Take the 12-item diagnostic</span>
              <span className="mt-0.5 block text-sm text-content-2">Recommended · domain-balanced, confidence-aware, and easy to retake later.</span>
            </span>
            <AppIcon name="icon-701" size={18} className="shrink-0 text-sky-ink" />
          </Link>
          <ChoiceButton
            label="Start at my grade level"
            sub="Skip placement and choose a trail yourself. You can run the diagnostic later."
            onClick={() => setStage({ at: "gradetrail", goal: stage.goal, grade: stage.grade })}
          />
        </div>
      </div>
    );
  }

  if (stage.at === "gradetrail") {
    const trails = trailsForGrade(stage.grade);
    return (
      <div className="step-in">
        <StepDots current={2} />
        <h1 className="text-2xl font-extrabold">Which trail first?</h1>
        <p className="mt-1 text-ink/70 dark:text-paper/70">
          Choose a {gradeLabel(stage.grade)} trail to start now. You can run placement any time.
        </p>
        <div className="mt-4 space-y-2">
          {trails.map((t) => (
            <ChoiceButton
              key={t.id}
              label={t.title}
              sub={t.tagline}
              onClick={() => finishGradeTrail(stage.goal, t.id, stage.grade)}
            />
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="summit-in">
      <StepDots current={3} />
      <p className="text-xs font-extrabold uppercase tracking-wide text-leaf-ink">Your starting spot</p>
      <h1 className="mt-2 text-2xl font-extrabold">{stage.rec.note}</h1>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/learn/${stage.rec.lessonId}`}
          className="pressable rounded-pill bg-cta px-6 py-3 font-extrabold text-white shadow-e1 transition-colors hover:bg-primary-hover hover:shadow-e2"
        >
          Take the first step
        </Link>
        <Link
          href="/dashboard"
          className="pressable rounded-pill border-2 border-ink/15 bg-surface px-6 py-3 font-extrabold transition-colors hover:border-sky hover:text-sky-ink dark:border-paper/20"
        >
          See the whole map
        </Link>
      </div>
    </div>
  );
}
