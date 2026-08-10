// Deterministic per-skill mastery model.
//
// The existing adaptiveAction() is purely reactive (last two events on a conceptTag). This
// module adds the missing piece the product critique flagged: a persistent per-skill mastery
// STATE that accumulates evidence over time, models forgetting, classifies proficiency, and
// drives next-skill recommendations. Skills are conceptTags. Fully deterministic (no AI, no
// randomness) so it is unit-testable and reproducible, and it plugs into the evidence that
// QuizShell.onResult already emits ({ firstTry, hintsUsed, revealed }) and the review
// scheduler's due list.

export type EvidenceKind = "firstTryCorrect" | "retryCorrect" | "hintedCorrect" | "revealed" | "miss";

import type { ProcessSignal } from "@/lib/processEvents";

/** Raw evidence from a single graded interaction. `correct` is derived: a revealed answer
 * means the learner did not produce it, so it counts as not-correct for mastery purposes. */
export interface MasteryEvidence {
  correct: boolean;
  firstTry: boolean;
  hintsUsed: number;
  revealed: boolean;
}

/** Adapter for QuizShell.onResult's shape → mastery evidence. */
export function evidenceFromResult(r: { firstTry: boolean; hintsUsed: number; revealed: boolean }): MasteryEvidence {
  return { correct: !r.revealed, firstTry: r.firstTry, hintsUsed: r.hintsUsed, revealed: r.revealed };
}

export function classifyEvidence(e: MasteryEvidence): EvidenceKind {
  // Order matters: a revealed answer sets correct=false, but "saw the solution" is a distinct,
  // softer signal than an un-revealed miss — so check revealed first.
  if (e.revealed) return "revealed";
  if (!e.correct) return "miss";
  if (e.hintsUsed > 0) return "hintedCorrect";
  if (e.firstTry) return "firstTryCorrect";
  return "retryCorrect";
}

/** How strongly each evidence kind moves mastery. Ordered: unaided first-try success is the
 * strongest signal of real understanding; hint/reveal-assisted success counts for less; a miss
 * pulls mastery down. These are the "evidence weights" from the critique's recommended model. */
export const EVIDENCE_WEIGHT: Record<EvidenceKind, number> = {
  firstTryCorrect: 0.45,
  retryCorrect: 0.28,
  hintedCorrect: 0.15,
  revealed: 0.05,
  miss: -0.4
};

export interface SkillState {
  tag: string;
  /** Current mastery estimate in [0, 1]. */
  mastery: number;
  attempts: number;
  /** Consecutive correct (non-revealed) interactions; resets on a miss. */
  correctStreak: number;
  /** Last interaction date (YYYY-MM-DD), or null if never seen. */
  lastSeen: string | null;
  /** Process-evidence ledger (Pillar Two): how often each deterministic
   * strategy signal (see processEvents.ts) latched on a step carrying this
   * tag. Distinguishes "answered wrong" from "manipulated the model with a
   * mistaken strategy" in the learner record. Optional and additive: profiles
   * written before this field parse unchanged, and the whole-state
   * more-evidence-wins merge in sync.ts carries it with no merge changes.
   * NEVER feeds the mastery score or scheduling — it is evidence, not a
   * penalty (the brief's rule: adaptation must not inflate or deflate
   * mastery through process noise). */
  signals?: Partial<Record<ProcessSignal, number>>;
  /** Distinct lesson ids that contributed UNAIDED-correct evidence (capped at
   * 8 — enough to witness transfer, bounded for sync). Two or more contexts is
   * the "transferable" bar: the skill worked outside the room it was learned
   * in. Optional and additive; merge is union, earliest-sorted, re-capped. */
  contexts?: string[];
}

export function emptySkill(tag: string): SkillState {
  return { tag, mastery: 0, attempts: 0, correctStreak: 0, lastSeen: null };
}

/** Fold one evidence event into a skill's mastery state.
 * Positive evidence approaches 1 asymptotically (each gain is a fraction of the remaining gap,
 * so mastery is progressively harder to raise near the top — pedagogically the right shape).
 * A miss removes a proportion of current mastery (a confident skill loses more absolute ground). */
/** Assisted success (hints, reveals) is real evidence of engagement but weak
 * evidence of independent command — so it can carry mastery only up to the top
 * of "practicing", never across the proficiency line. Proficient and above must
 * be earned unaided (first-try or retry success). Assisted evidence NEVER
 * lowers a mastery already above the ceiling; it simply stops lifting. */
export const ASSISTED_CEILING = 0.65;

export function updateMastery(state: SkillState, e: MasteryEvidence, today: string): SkillState {
  const kind = classifyEvidence(e);
  const w = EVIDENCE_WEIGHT[kind];
  let m = state.mastery;
  m = w >= 0 ? m + w * (1 - m) : m + w * m;
  if ((kind === "hintedCorrect" || kind === "revealed") && w >= 0)
    m = Math.min(m, Math.max(state.mastery, ASSISTED_CEILING));
  m = Math.min(1, Math.max(0, m));
  return {
    tag: state.tag,
    mastery: m,
    attempts: state.attempts + 1,
    correctStreak: e.correct ? state.correctStreak + 1 : 0,
    lastSeen: today,
    // The process-evidence ledger survives graded events — it accumulates
    // across a concept's whole history, it isn't per-interaction state.
    ...(state.signals ? { signals: state.signals } : {})
  };
}

/** Whole-numbers of days from a → b (both YYYY-MM-DD). */
export function daysBetween(a: string, b: string): number {
  const ms = Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z");
  return Math.round(ms / 86400000);
}

/** Effective mastery accounting for forgetting since it was last practiced. Full retention
 * through the first review week; after that a gentle exponential decay (~30-day time constant),
 * floored at 40% of stored mastery so a mastered skill never reads as un-learned — it reads as
 * "due for review", which is what the review loop is for. */
export function retainedMastery(state: SkillState, today: string): number {
  if (!state.lastSeen || state.attempts === 0) return state.mastery;
  const days = daysBetween(state.lastSeen, today);
  if (days <= 7) return state.mastery;
  const decayed = state.mastery * Math.exp(-(days - 7) / 30);
  return Math.max(0.4 * state.mastery, decayed);
}

/** Review is due when a skill that WAS proficient has decayed back below the
 * proficiency line. Because decay is proportional, the implied interval is
 * monotone in evidence strength: solving m·e^{-(d-7)/30} = 0.7 gives
 * d = 7 + 30·ln(m/0.7) days — a skill at 0.75 comes due in ~9 days, one at 0.9
 * in ~14.5, one at 0.98 in ~17. Stronger evidence, longer interval; the floor
 * in retainedMastery keeps a mastered skill reading as "due", never "unlearned". */
export function isFading(st: SkillState, today: string): boolean {
  return st.mastery >= PROFICIENT && retainedMastery(st, today) < PROFICIENT;
}

export type MasteryBand = "new" | "developing" | "practicing" | "proficient" | "mastered";
export const PROFICIENT = 0.7;

export function classify(state: SkillState): MasteryBand {
  if (state.attempts === 0) return "new";
  const m = state.mastery;
  if (m < 0.4) return "developing";
  if (m < PROFICIENT) return "practicing";
  if (m < 0.9) return "proficient";
  return "mastered";
}

/** A skill is ready to work on when every prerequisite skill is at least proficient.
 * `prereqs` maps a skill tag → the tags that must precede it (may be empty/absent). */
export function isReady(tag: string, states: Record<string, SkillState>, prereqs: Record<string, string[]> = {}): boolean {
  return (prereqs[tag] ?? []).every((p) => (states[p]?.mastery ?? 0) >= PROFICIENT);
}

export interface Recommendation {
  tag: string;
  reason: "review" | "continue" | "advance";
  score: number;
}

/** Pick the single most valuable next skill. Priority, high to low:
 *   1. review  — a due skill whose retained mastery has slipped (retention loop wins)
 *   2. continue— a ready, not-yet-proficient skill with the most room to grow
 *   3. advance — a ready skill at/above proficient that still isn't mastered
 * Unready skills (unmet prerequisites) are never recommended. Deterministic tie-break by tag. */
export function recommendNext(params: {
  states: Record<string, SkillState>;
  candidateTags?: string[];
  prereqs?: Record<string, string[]>;
  dueTags?: string[];
  today: string;
}): Recommendation | null {
  const { states, prereqs = {}, today } = params;
  const due = new Set(params.dueTags ?? []);
  const candidates = params.candidateTags ?? Object.keys(states);

  let best: Recommendation | null = null;
  const consider = (rec: Recommendation) => {
    if (!best || rec.score > best.score || (rec.score === best.score && rec.tag < best.tag)) best = rec;
  };

  for (const tag of candidates) {
    const state = states[tag] ?? emptySkill(tag);
    if (!isReady(tag, states, prereqs)) continue;
    const retained = retainedMastery(state, today);

    if (due.has(tag)) {
      // Slippage drives urgency; a fully-slipped skill is the most urgent thing to restore.
      consider({ tag, reason: "review", score: 1000 + (1 - retained) * 100 });
      continue;
    }
    if (retained >= 0.9) continue; // already mastered and fresh — nothing to do
    // more room to grow ⇒ higher need; proficient-but-not-mastered ranks below developing.
    const reason: Recommendation["reason"] = retained < PROFICIENT ? "continue" : "advance";
    consider({ tag, reason, score: (1 - retained) * 100 });
  }
  return best;
}

/** The learner's curriculum frontier for forward advance: the earliest not-yet-proficient skill
 * (in curriculum order) whose prerequisites are all proficient. Deterministic — a plain ordered
 * walk, not a score-max, so it picks the TRUE next skill rather than an alphabetical tie-break. */
export function nextCurriculumSkill(order: string[], prereqs: Record<string, string[]>, proficient: Set<string>): string | null {
  for (const tag of order) {
    if (proficient.has(tag)) continue;
    if ((prereqs[tag] ?? []).every((p) => proficient.has(p))) return tag;
  }
  return null;
}

export interface MasterySummary {
  total: number;
  byBand: Record<MasteryBand, number>;
  masteredOrProficient: number;
  averageMastery: number;
}

/** Aggregate a learner's skill map — the basis for a progress / parent view. */
export function summarize(states: Record<string, SkillState>): MasterySummary {
  const byBand: Record<MasteryBand, number> = { new: 0, developing: 0, practicing: 0, proficient: 0, mastered: 0 };
  let sum = 0;
  const list = Object.values(states);
  for (const s of list) {
    byBand[classify(s)]++;
    sum += s.mastery;
  }
  return {
    total: list.length,
    byBand,
    masteredOrProficient: byBand.proficient + byBand.mastered,
    averageMastery: list.length ? sum / list.length : 0
  };
}

/** Fold a graded result straight into a skill map (the reducer LessonPlayer/ProgressStore would
 * call on each onResult). Pure: returns a new map, does not mutate. */
export function applyResult(
  states: Record<string, SkillState>,
  tag: string,
  result: { firstTry: boolean; hintsUsed: number; revealed: boolean; signal?: ProcessSignal | null },
  today: string,
  /** Lesson the evidence came from — recorded as a transfer CONTEXT when the
   * success was unaided (first-try or retry, no hints, not revealed). */
  lessonId?: string
): Record<string, SkillState> {
  const prev = states[tag] ?? emptySkill(tag);
  const next = updateMastery(prev, evidenceFromResult(result), today);
  const unaided = !result.revealed && result.hintsUsed === 0;
  const contexts =
    lessonId && unaided && !(prev.contexts ?? []).includes(lessonId)
      ? [...(prev.contexts ?? []), lessonId].slice(0, 8)
      : prev.contexts;
  const withContexts: SkillState = contexts ? { ...next, contexts } : next;
  const withSignal: SkillState = result.signal
    ? { ...withContexts, signals: { ...withContexts.signals, [result.signal]: (withContexts.signals?.[result.signal] ?? 0) + 1 } }
    : withContexts;
  return { ...states, [tag]: withSignal };
}

/** Fold a process signal into a skill's evidence ledger WITHOUT a graded
 * result — the path for `interactive` steps, which emit process events but by
 * long-standing design never write graded mastery evidence. Score, attempts,
 * streak, and lastSeen are untouched: noticing a strategy is not an
 * assessment, and it must not advance (or decay) the forgetting model. */
export function recordSignal(
  states: Record<string, SkillState>,
  tag: string,
  signal: ProcessSignal
): Record<string, SkillState> {
  const prev = states[tag] ?? emptySkill(tag);
  return {
    ...states,
    [tag]: { ...prev, signals: { ...prev.signals, [signal]: (prev.signals?.[signal] ?? 0) + 1 } }
  };
}
