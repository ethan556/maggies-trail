"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { localDateStr } from "@/lib/engine";
import { progressStore } from "@/lib/progress";
import type { Goal } from "@/lib/onboarding";
import { buildDiagnosticFieldPacket, type DiagnosticFieldPacket } from "@/lib/diagnosticCalibration";
import { contributeDiagnosticPacket, downloadDiagnosticPacket } from "@/lib/diagnosticFieldClient";
import {
  buildDiagnosticReport,
  nextItem,
  placementRoute,
  seedMastery,
  type DiagnosticConfidence,
  type DiagnosticDomain,
  type DiagnosticReport,
  type PlacementItem,
  type PlacementResponse,
  type PlacementRoute
} from "@/lib/placement";

const DIAGNOSTIC_LENGTH = 12;

interface Result {
  route: PlacementRoute | null;
  seeded: number;
  correct: number;
  total: number;
  completedAt: string;
  report: DiagnosticReport;
}

type ContributionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "uploaded" }
  | { status: "unavailable" | "failed"; reason: string };

const BANDS: { label: string; grade: number; detail: string }[] = [
  { label: "Kindergarten–Grade 2", grade: 1, detail: "Counting, early operations, shapes, and measurement" },
  { label: "Grades 3–5", grade: 4, detail: "Fractions, multidigit operations, decimals, and coordinate ideas" },
  { label: "Grades 6–8", grade: 7, detail: "Ratios, equations, probability, geometry, and functions" },
  { label: "Grades 9–10", grade: 9, detail: "Algebra I and Geometry" },
  { label: "Grade 11 / Algebra II", grade: 11, detail: "Advanced functions, logarithms, trigonometry, and inference" },
  { label: "Precalculus / Calculus", grade: 12, detail: "Limits, advanced functions, derivatives, and accumulation" }
];

const DOMAIN_LABEL: Record<DiagnosticDomain, string> = {
  number: "Number & operations",
  algebra: "Algebra & functions",
  geometry: "Geometry & measurement",
  data: "Data & probability",
  calculus: "Calculus & advanced change"
};

const STATUS_LABEL = {
  secure: "Secure evidence",
  developing: "Developing",
  "needs-support": "Needs support",
  "insufficient-evidence": "Not enough evidence"
} as const;

function confidenceLabel(value: DiagnosticConfidence): string {
  if (value === 0) return "Mostly a guess";
  if (value === 0.5) return "Fairly sure";
  return "Certain";
}

export default function PlacementFlow({
  bank,
  prereqs,
  courseTitles,
  lessonByTag,
  initialGrade,
  onboardingGoal
}: {
  bank: PlacementItem[];
  prereqs: Record<string, string[]>;
  courseTitles: Record<string, string>;
  lessonByTag: Record<string, string>;
  initialGrade: number | null;
  onboardingGoal: Goal | null;
}) {
  const today = localDateStr(new Date());
  const [diagnosticStartedAt] = useState(() => new Date().toISOString());
  const [startGrade, setStartGrade] = useState<number | null>(initialGrade);
  const [history, setHistory] = useState<PlacementResponse[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [fieldPacket, setFieldPacket] = useState<DiagnosticFieldPacket | null>(null);
  const [contribution, setContribution] = useState<ContributionState>({ status: "idle" });
  const itemStartedAt = useRef(Date.now());
  const current = useMemo(
    () => (result || startGrade == null ? null : nextItem(bank, history, DIAGNOSTIC_LENGTH, startGrade)),
    [bank, history, result, startGrade]
  );

  useEffect(() => {
    itemStartedAt.current = Date.now();
  }, [current?.id]);

  function submitAnswer(item: PlacementItem, choice: number, confidence: DiagnosticConfidence) {
    const correct = choice === item.answer;
    const response: PlacementResponse = {
      itemId: item.id,
      tag: item.tag,
      grade: item.grade,
      domain: item.domain,
      representation: item.representation,
      correct,
      confidence,
      selectedChoice: choice,
      responseMs: Math.max(100, Date.now() - itemStartedAt.current)
    };
    const nextHistory = [...history, response];
    const following = nextItem(bank, nextHistory, DIAGNOSTIC_LENGTH, startGrade ?? undefined);
    setHistory(nextHistory);
    setSelectedChoice(null);
    if (following) return;

    const report = buildDiagnosticReport(nextHistory, bank, startGrade ?? 6);
    const seed = seedMastery(nextHistory, prereqs, today);
    const p = progressStore.load();
    const merged = { ...(p.mastery ?? {}) };
    for (const [tag, state] of Object.entries(seed)) {
      // Placement evidence may lift readiness, but never overwrites stronger lesson/retrieval evidence.
      if ((merged[tag]?.mastery ?? 0) < state.mastery) merged[tag] = state;
    }
    p.mastery = merged;
    const completedAt = new Date().toISOString();
    p.diagnostic = {
      completedAt,
      startGrade: startGrade ?? 6,
      responses: nextHistory,
      report
    };
    const route = placementRoute(nextHistory, bank, startGrade ?? 6);
    const recommendedLessonId = route?.tag ? lessonByTag[route.tag] : undefined;
    if (onboardingGoal && recommendedLessonId) {
      p.onboarding = {
        goal: onboardingGoal,
        // Legacy fields remain for sync compatibility; the 12-item evidence itself lives in diagnostic.
        comfort: 2,
        correctCount: nextHistory.filter((r) => r.correct).length,
        recommendedLessonId,
        completedAt,
        grade: startGrade ?? 6
      };
    }
    progressStore.save(p);

    setResult({
      route,
      seeded: Object.keys(seed).length,
      correct: nextHistory.filter((r) => r.correct).length,
      total: nextHistory.length,
      completedAt,
      report
    });
  }

  function makeFieldPacket(): DiagnosticFieldPacket {
    if (fieldPacket) return fieldPacket;
    if (!result) throw new Error("Diagnostic result is not ready");
    const packet = buildDiagnosticFieldPacket({
      responses: history,
      report: result.report,
      startGrade: startGrade ?? 6,
      startedAt: diagnosticStartedAt,
      completedAt: result.completedAt,
      bank
    });
    setFieldPacket(packet);
    return packet;
  }

  async function contributeFieldData() {
    const packet = makeFieldPacket();
    setContribution({ status: "submitting" });
    const outcome = await contributeDiagnosticPacket(packet);
    setContribution(outcome);
  }

  function downloadFieldData() {
    downloadDiagnosticPacket(makeFieldPacket());
  }

  if (startGrade == null && !result) {
    return (
      <div>
        <p className="font-extrabold">Where should the diagnostic begin?</p>
        <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
          This sets only the first item. The diagnostic then adapts across domains and difficulty.
        </p>
        <div className="mt-4 grid gap-2">
          {BANDS.map((band) => (
            <button
              key={band.label}
              type="button"
              onClick={() => setStartGrade(band.grade)}
              className="min-h-11 rounded-card border-2 border-ink/15 px-4 py-3 text-left hover:border-sky hover:bg-sky/5 dark:border-paper/15"
            >
              <span className="block font-extrabold">{band.label}</span>
              <span className="mt-0.5 block text-xs text-ink/70 dark:text-paper/70">{band.detail}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    const slug = result.route?.courseSlug;
    const tag = result.route?.tag;
    const title = (slug && courseTitles[slug]) || "your recommended trail";
    const lessonId = tag ? lessonByTag[tag] : undefined;
    const href = lessonId ? `/learn/${lessonId}` : slug ? `/courses/${slug}` : "/dashboard";
    const overall = result.report.overall;

    return (
      <div className="space-y-5">
        <div className="rounded-card border-2 border-leaf bg-leaf/5 p-6 text-center">
          <p className="text-xs font-extrabold uppercase tracking-wide text-leaf-ink">Diagnostic complete</p>
          <p className="mt-2 text-2xl font-extrabold">Start with {title}</p>
          <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">
            Vertical score <strong>{overall.scaledScore}</strong>, with a provisional 95% interval of {overall.scaledLower95}–{overall.scaledUpper95}.
            You answered {result.correct} of {result.total} correctly. We recorded {result.seeded} readiness signal{result.seeded === 1 ? "" : "s"},
            but no domain is labelled secure from a single lucky answer.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href={href} className="pressable rounded-full bg-cta-good px-6 py-3 font-extrabold text-white hover:bg-leaf/90">
              {lessonId ? "Start the recommended lesson" : `Go to ${title}`}
            </Link>
            <Link href="/standards" className="rounded-full border-2 border-ink/15 px-6 py-3 font-extrabold hover:border-leaf dark:border-paper/15">
              View mastery evidence
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {result.report.domainScores.map((domain) => (
            <div key={domain.domain} className="rounded-card border border-ink/10 bg-white/70 p-4 dark:border-paper/10 dark:bg-ink/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold">{DOMAIN_LABEL[domain.domain]}</p>
                  <p className="text-xs text-ink/70 dark:text-paper/70">
                    {domain.correct}/{domain.attempts} correct · score {domain.scaledScore}
                  </p>
                </div>
                <span className="rounded-full bg-ink/5 px-2 py-1 text-[11px] font-extrabold dark:bg-paper/10">
                  {STATUS_LABEL[domain.status]}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10">
                <div
                  className="h-full rounded-full bg-sky"
                  style={{ width: `${Math.max(4, Math.min(100, ((domain.scaledScore - 200) / 600) * 100))}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-ink/70 dark:text-paper/70">95% interval: {domain.scaledLower95}–{domain.scaledUpper95}</p>
            </div>
          ))}
        </div>

        <p className="rounded-card border border-amber/30 bg-amber/10 p-3 text-xs text-ink/70 dark:text-paper/70">
          {result.report.evidenceWarning}
        </p>

        <section className="rounded-card border border-sky/25 bg-sky/5 p-4" aria-labelledby="diagnostic-research-title">
          <h2 id="diagnostic-research-title" className="font-extrabold">Help calibrate the diagnostic</h2>
          <p className="mt-1 text-xs text-ink/70 dark:text-paper/70">
            Participation is optional. With your explicit click, Maggie’s Trail contributes item IDs, right/wrong responses, answer choices, confidence, response time, and score uncertainty. It does not include a learner name, email address, prompt text, or free-text response. Provisional parameters remain provisional until field-sample and quality gates pass.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={contributeFieldData}
              disabled={contribution.status === "submitting" || contribution.status === "uploaded"}
              className="rounded-full bg-cta px-4 py-2 text-sm font-extrabold text-white disabled:opacity-60"
            >
              {contribution.status === "submitting" ? "Sending securely…" : contribution.status === "uploaded" ? "Contribution received" : "I agree — contribute this diagnostic"}
            </button>
            <button type="button" onClick={downloadFieldData} className="rounded-full border-2 border-sky/30 px-4 py-2 text-sm font-extrabold hover:border-sky">
              Download research packet
            </button>
          </div>
          {contribution.status === "unavailable" || contribution.status === "failed" ? (
            <p className="mt-2 text-xs font-bold text-amber-800 dark:text-amber-200">Secure upload is unavailable: {contribution.reason}. The portable packet can be downloaded without changing your learning record.</p>
          ) : contribution.status === "uploaded" ? (
            <p className="mt-2 text-xs font-bold text-leaf-ink">Thank you. This administration is stored as research evidence and does not change your placement or mastery.</p>
          ) : null}
        </section>
      </div>
    );
  }

  if (!current) return null;
  const step = history.length + 1;
  const progress = (step / DIAGNOSTIC_LENGTH) * 100;

  return (
    <div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10">
        <div className="h-full rounded-full bg-sky transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide text-ink/70 dark:text-paper/70">
        <span>Question {step} of {DIAGNOSTIC_LENGTH}</span>
        <span>{DOMAIN_LABEL[current.domain]}</span>
      </div>
      <p className="mt-3 text-lg font-extrabold">{current.prompt}</p>
      <div className="mt-4 grid gap-2">
        {current.choices.map((choice, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedChoice(index)}
            aria-pressed={selectedChoice === index}
            className={`min-h-11 rounded-card border-2 px-4 py-3 text-left font-bold transition ${
              selectedChoice === index
                ? "border-sky bg-sky/10"
                : "border-ink/15 hover:border-sky hover:bg-sky/5 dark:border-paper/15"
            }`}
          >
            {choice}
          </button>
        ))}
      </div>

      {selectedChoice != null ? (
        <div className="mt-5 rounded-card border border-ink/10 bg-ink/[0.025] p-4 dark:border-paper/10 dark:bg-paper/[0.035]">
          <p className="text-sm font-extrabold">How sure are you?</p>
          <p className="mt-1 text-xs text-ink/70 dark:text-paper/70">
            Confidence helps distinguish a misconception from an uncertain guess. It never changes whether the answer is right.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {([0, 0.5, 1] as DiagnosticConfidence[]).map((confidence) => (
              <button
                key={confidence}
                type="button"
                onClick={() => submitAnswer(current, selectedChoice, confidence)}
                className="min-h-10 rounded-full border-2 border-ink/15 px-3 py-2 text-sm font-extrabold hover:border-leaf hover:bg-leaf/5 dark:border-paper/15"
              >
                {confidenceLabel(confidence)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-ink/70 dark:text-paper/70">
        Choose your best answer, then report your confidence. The next question is selected for information and domain balance.
      </p>
    </div>
  );
}
