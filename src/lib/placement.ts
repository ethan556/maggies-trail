// Calibrated adaptive placement diagnostic.
//
// The original five-question staircase was useful for routing, but it could not support domain
// scores, uncertainty, growth, or false-mastery protection. This module keeps the same pure,
// deterministic boundary while adding a compact IRT-style engine:
//   • 28 independent probes spanning K → Calculus
//   • domain-balanced item selection using Fisher information
//   • item difficulty and discrimination metadata
//   • an ability estimate with a 95% confidence interval and vertical 200–800 scale
//   • confidence calibration and high-confidence-misconception detection
//   • conservative mastery seeding: one lucky answer can never mark a domain secure
//
// The parameters are instructional calibration seeds, not claims from a national norming study.
// They are explicitly labelled `provisional` until field-response data are large enough for item
// re-estimation. The diagnostic remains useful now because the uncertainty and evidence thresholds
// are honest and deterministic.

import { type SkillState } from "./mastery";

export type DiagnosticDomain = "number" | "algebra" | "geometry" | "data" | "calculus";
export type DiagnosticRepresentation = "visual" | "symbolic" | "verbal" | "table" | "graph";
export type DiagnosticConfidence = 0 | 0.5 | 1;

export interface PlacementItem {
  id: string;
  tag: string; // a real conceptTag
  grade: number; // K=0 … Calculus=13
  courseSlug: string;
  domain: DiagnosticDomain;
  representation: DiagnosticRepresentation;
  /** Provisional IRT difficulty on a roughly -3.2 → +3.2 vertical continuum. */
  difficulty: number;
  /** Provisional IRT discrimination. Values near 1 are moderate; >1.3 are stronger separators. */
  discrimination: number;
  calibration: "provisional" | "field-calibrated";
  prompt: string;
  choices: string[];
  answer: number;
}

const item = (
  id: string,
  tag: string,
  grade: number,
  courseSlug: string,
  domain: DiagnosticDomain,
  representation: DiagnosticRepresentation,
  difficulty: number,
  discrimination: number,
  prompt: string,
  choices: string[],
  answer: number
): PlacementItem => ({
  id,
  tag,
  grade,
  courseSlug,
  domain,
  representation,
  difficulty,
  discrimination,
  calibration: "provisional",
  prompt,
  choices,
  answer
});

/** Two independent probes per grade/rank. Tags are real curriculum skills and never repeat. */
export const PLACEMENT_BANK: PlacementItem[] = [
  item("p-k-count", "kc-count-objects", 0, "counting-to-20-k", "number", "visual", -3.25, 0.9, "There are ● ● ● ● counters. How many?", ["3", "4", "5", "6"], 1),
  item("p-k-shape", "ks-name-shapes", 0, "shapes-and-sorting-k", "geometry", "verbal", -3.05, 0.85, "Which shape has three straight sides?", ["Circle", "Triangle", "Square", "Sphere"], 1),

  item("p-g1-maketen", "make-ten-add", 1, "add-subtract-20", "number", "symbolic", -2.75, 1.0, "What is 8 + 5?", ["12", "13", "14", "15"], 1),
  item("p-g1-half", "smg1-halves", 1, "shapes-measure-g1", "geometry", "verbal", -2.55, 0.9, "A sandwich is cut into 2 equal pieces. One piece is called:", ["one half", "one third", "two halves", "one fourth"], 0),

  item("p-g2-regroup", "regroup-add", 2, "add-subtract-100", "number", "symbolic", -2.25, 1.1, "What is 27 + 15?", ["32", "41", "42", "52"], 2),
  item("p-g2-time", "mmt-time-5min", 2, "measure-money-time", "geometry", "verbal", -2.05, 0.95, "The minute hand moves from 2 to 5. How many minutes pass?", ["3", "10", "15", "25"], 2),

  item("p-g3-fraction", "unit-fraction", 3, "fractions", "number", "visual", -1.75, 1.15, "A whole is split into 4 equal parts. One part is:", ["1/2", "1/3", "1/4", "4"], 2),
  item("p-g3-groups", "equal-groups", 3, "multiplication-division", "algebra", "verbal", -1.55, 1.05, "How many counters are in 4 groups of 3?", ["7", "9", "12", "16"], 2),

  item("p-g4-addfrac", "add-like-denom", 4, "fractions-add", "number", "symbolic", -1.25, 1.2, "What is 2/7 + 3/7?", ["5/14", "5/7", "6/7", "1/7"], 1),
  item("p-g4-angle", "triangle-angle-sum", 4, "lines-angles", "geometry", "symbolic", -1.05, 1.15, "A triangle has angles 50° and 60°. What is the third angle?", ["70°", "80°", "90°", "110°"], 0),

  item("p-g5-decimal", "decimal-place-names", 5, "decimals-place-value", "number", "symbolic", -0.75, 1.1, "In 3.24, the digit 4 is in the ___ place.", ["tens", "tenths", "hundredths", "ones"], 2),
  item("p-g5-coordinate", "coord-plot", 5, "coordinate-geometry", "geometry", "graph", -0.55, 1.05, "Which ordered pair means 3 units right and 2 units up from the origin?", ["(2, 3)", "(3, 2)", "(−3, 2)", "(3, −2)"], 1),

  item("p-g6-ratio", "equivalent-ratios", 6, "ratios-rates", "algebra", "table", -0.25, 1.3, "Which ratio is equivalent to 2 : 3?", ["3 : 2", "4 : 6", "2 : 6", "5 : 6"], 1),
  item("p-g6-mean", "mean", 6, "data-distributions", "data", "symbolic", -0.05, 1.15, "What is the mean of 4, 6, and 8?", ["5", "6", "7", "18"], 1),

  item("p-g7-rate", "pr-unit-rate-context", 7, "proportional-relationships", "algebra", "verbal", 0.25, 1.25, "A car travels 180 miles in 3 hours. What is its unit rate?", ["60 miles/hour", "90 miles/hour", "177 miles/hour", "540 miles/hour"], 0),
  item("p-g7-prob", "sp-theoretical-prob", 7, "sampling-and-probability", "data", "verbal", 0.45, 1.15, "A fair number cube is rolled. What is P(rolling an even number)?", ["1/6", "1/3", "1/2", "2/3"], 2),

  item("p-g8-slope", "fg-rate-of-change", 8, "functions-g8", "algebra", "graph", 0.75, 1.35, "A line rises 6 units while running 3 units right. What is its rate of change?", ["1/2", "2", "3", "9"], 1),
  item("p-g8-system", "les-system-meaning", 8, "linear-equations-systems", "algebra", "graph", 0.95, 1.25, "On a graph, the solution of two linear equations is:", ["either y-intercept", "their intersection", "the steeper line", "the x-axis"], 1),

  item("p-g9-vertex", "quad-vertex-form", 9, "quadratics", "algebra", "symbolic", 1.25, 1.35, "The vertex of y = (x − 2)² + 5 is:", ["(−2, 5)", "(2, 5)", "(2, −5)", "(5, 2)"], 1),
  item("p-g9-exp", "exp-growth-decay", 9, "exponential-functions", "algebra", "verbal", 1.45, 1.2, "Which function represents exponential decay?", ["y = 3(1.2)^x", "y = 3(0.8)^x", "y = 3x + 0.8", "y = x² − 3"], 1),

  item("p-g10-midpoint", "cx-midpoint", 10, "coordinate-proofs", "geometry", "symbolic", 1.75, 1.25, "The midpoint of (2, 4) and (6, 8) is:", ["(4, 6)", "(8, 12)", "(2, 2)", "(3, 5)"], 0),
  item("p-g10-conditional", "cpr-conditional-table", 10, "conditional-probability", "data", "table", 1.95, 1.35, "Of 20 students in band, 8 play piano. For P(piano | band), the denominator is:", ["8", "12", "20", "28"], 2),

  item("p-g11-log", "lg-evaluate", 11, "logarithms", "algebra", "symbolic", 2.25, 1.3, "What is log₂ 8?", ["2", "3", "4", "16"], 1),
  item("p-g11-inference", "si-parameter-statistic", 11, "statistical-inference", "data", "verbal", 2.45, 1.25, "A survey mean computed from 200 sampled voters is a:", ["parameter", "statistic", "population", "census"], 1),

  item("p-g12-limit", "lc-limit-idea", 12, "limits-continuity", "calculus", "symbolic", 2.75, 1.35, "As x approaches 2, what does f(x) = x + 1 approach?", ["2", "3", "4", "undefined"], 1),
  item("p-g12-conic", "co-focus-directrix", 12, "conic-sections", "geometry", "verbal", 2.95, 1.2, "A parabola is the set of points equidistant from a focus and a:", ["center", "directrix", "radius", "tangent"], 1),

  item("p-g13-derivative", "dr-power-rule", 13, "derivative-rules", "calculus", "symbolic", 3.15, 1.4, "If f(x) = x⁴, then f′(x) is:", ["4x³", "x³", "4x⁴", "x⁵/5"], 0),
  item("p-g13-integral", "in-signed-area", 13, "integration-accumulation", "calculus", "graph", 3.35, 1.3, "In a definite integral, area below the x-axis contributes:", ["positively", "negatively", "zero always", "only its perimeter"], 1)
];

export interface PlacementResponse {
  itemId?: string;
  tag: string;
  grade: number;
  domain?: DiagnosticDomain;
  representation?: DiagnosticRepresentation;
  correct: boolean;
  /** 0=guess, 0.5=fairly sure, 1=certain. */
  confidence?: DiagnosticConfidence;
  /** Selected answer index, retained only for consented field-calibration packets. */
  selectedChoice?: number;
  /** Time from item presentation to confidence submission, bounded by the collector. */
  responseMs?: number;
}

export interface AbilityEstimate {
  theta: number;
  standardError: number;
  lower95: number;
  upper95: number;
  scaledScore: number;
  scaledLower95: number;
  scaledUpper95: number;
}

export type DomainStatus = "secure" | "developing" | "needs-support" | "insufficient-evidence";
export interface DomainDiagnostic extends AbilityEstimate {
  domain: DiagnosticDomain;
  attempts: number;
  correct: number;
  highConfidenceErrors: number;
  status: DomainStatus;
}

export interface DiagnosticReport {
  calibration: "provisional" | "field-calibrated";
  overall: AbilityEstimate;
  estimatedGrade: number;
  domainScores: DomainDiagnostic[];
  falseMasteryProtected: boolean;
  evidenceWarning: string;
}

const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));
const logistic = (x: number): number => 1 / (1 + Math.exp(-x));
const scaleTheta = (theta: number): number => Math.round(clamp(500 + theta * 90, 200, 800));
const thetaForGrade = (grade: number): number => clamp(-3.15 + (grade / 13) * 6.3, -3.3, 3.3);
const gradeForTheta = (theta: number): number => Math.round(clamp(((theta + 3.15) / 6.3) * 13, 0, 13));

function responseItem(response: PlacementResponse, bank: PlacementItem[]): PlacementItem | undefined {
  return (response.itemId ? bank.find((b) => b.id === response.itemId) : undefined) ?? bank.find((b) => b.tag === response.tag);
}

/** 3PL-style probability with fixed four-choice guessing floor. */
export function responseProbability(theta: number, item: PlacementItem): number {
  const c = 1 / Math.max(2, item.choices.length);
  return clamp(c + (1 - c) * logistic(item.discrimination * (theta - item.difficulty)), 0.0001, 0.9999);
}

function posteriorGrid(
  history: PlacementResponse[],
  bank: PlacementItem[],
  priorMean: number,
  domain?: DiagnosticDomain
): { theta: number; variance: number } {
  const evidence = history.filter((r) => !domain || (r.domain ?? responseItem(r, bank)?.domain) === domain);
  const points: { theta: number; logWeight: number }[] = [];
  for (let i = 0; i <= 160; i++) {
    const theta = -4 + i * 0.05;
    // N(priorMean, 1.35²): broad enough to let evidence move, narrow enough to avoid wild one-item scores.
    let logWeight = -0.5 * Math.pow((theta - priorMean) / 1.35, 2);
    for (const response of evidence) {
      const it = responseItem(response, bank);
      if (!it) continue;
      const p = responseProbability(theta, it);
      logWeight += response.correct ? Math.log(p) : Math.log(1 - p);
    }
    points.push({ theta, logWeight });
  }
  const max = Math.max(...points.map((p) => p.logWeight));
  const weights = points.map((p) => Math.exp(p.logWeight - max));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const mean = points.reduce((s, p, i) => s + p.theta * weights[i], 0) / total;
  const variance = Math.max(0.04, points.reduce((s, p, i) => s + Math.pow(p.theta - mean, 2) * weights[i], 0) / total);
  return { theta: mean, variance };
}

export function estimateAbility(
  history: PlacementResponse[],
  bank: PlacementItem[] = PLACEMENT_BANK,
  startGrade = 6,
  domain?: DiagnosticDomain
): AbilityEstimate {
  const posterior = posteriorGrid(history, bank, thetaForGrade(startGrade), domain);
  const se = Math.sqrt(posterior.variance);
  const lower = clamp(posterior.theta - 1.96 * se, -4, 4);
  const upper = clamp(posterior.theta + 1.96 * se, -4, 4);
  return {
    theta: Number(posterior.theta.toFixed(3)),
    standardError: Number(se.toFixed(3)),
    lower95: Number(lower.toFixed(3)),
    upper95: Number(upper.toFixed(3)),
    scaledScore: scaleTheta(posterior.theta),
    scaledLower95: scaleTheta(lower),
    scaledUpper95: scaleTheta(upper)
  };
}

function itemInformation(theta: number, item: PlacementItem): number {
  const p = responseProbability(theta, item);
  return Math.pow(item.discrimination, 2) * p * (1 - p);
}

const ALL_DOMAINS: DiagnosticDomain[] = ["number", "algebra", "geometry", "data", "calculus"];

/**
 * Domain-balanced adaptive selection. It maximizes information near the current ability estimate,
 * boosts under-sampled domains, keeps the next item near the learner's plausible band, and never
 * repeats an item or tag. A 12-item run is compact enough for onboarding but long enough to prevent
 * single-item mastery claims.
 */
export function nextItem(
  bank: PlacementItem[],
  history: PlacementResponse[],
  limit = 12,
  startGrade?: number
): PlacementItem | null {
  const askedIds = new Set(history.map((h) => h.itemId).filter(Boolean));
  const askedTags = new Set(history.map((h) => h.tag));
  const remaining = bank.filter((b) => !askedIds.has(b.id) && !askedTags.has(b.tag));
  if (history.length >= limit || remaining.length === 0) return null;

  const start = startGrade ?? 6;
  const estimate = estimateAbility(history, bank, start);
  const domainCounts = Object.fromEntries(ALL_DOMAINS.map((d) => [d, 0])) as Record<DiagnosticDomain, number>;
  for (const response of history) {
    const domain = response.domain ?? responseItem(response, bank)?.domain;
    if (domain) domainCounts[domain] += 1;
  }

  if (history.length === 0) {
    return [...remaining].sort(
      (a, b) =>
        Math.abs(a.grade - start) - Math.abs(b.grade - start) ||
        Math.abs(a.difficulty - thetaForGrade(start)) - Math.abs(b.difficulty - thetaForGrade(start)) ||
        a.id.localeCompare(b.id)
    )[0];
  }

  const requiredDomains: DiagnosticDomain[] =
    start >= 11 ? ALL_DOMAINS : start <= 2 ? ["number", "geometry"] : ["number", "algebra", "geometry", "data"];
  const minimumRequiredCount = Math.min(...requiredDomains.map((domain) => domainCounts[domain]));
  // Before pure information maximization, collect at least two independent probes in every
  // grade-relevant domain. This makes domain scores interpretable and prevents an algebra-heavy
  // route from silently skipping number sense, geometry, or data reasoning.
  if (minimumRequiredCount < 2) {
    const targetDomains = new Set(requiredDomains.filter((domain) => domainCounts[domain] === minimumRequiredCount));
    const candidates = remaining.filter((item) => targetDomains.has(item.domain));
    if (candidates.length) {
      return [...candidates].sort((a, b) => {
        const score = (it: PlacementItem): number => {
          const distance = Math.abs(it.difficulty - estimate.theta);
          return itemInformation(estimate.theta, it) * Math.exp(-0.12 * distance * distance);
        };
        return score(b) - score(a) || Math.abs(a.difficulty - estimate.theta) - Math.abs(b.difficulty - estimate.theta) || a.id.localeCompare(b.id);
      })[0];
    }
  }

  const minCount = Math.min(...ALL_DOMAINS.map((d) => domainCounts[d]));
  return [...remaining].sort((a, b) => {
    const score = (it: PlacementItem): number => {
      const underSampled = domainCounts[it.domain] === minCount ? 1.4 : 1 / (1 + domainCounts[it.domain] * 0.25);
      const bandDistance = Math.abs(it.difficulty - estimate.theta);
      const bandWeight = Math.exp(-0.18 * bandDistance * bandDistance);
      const advancedGuard = it.domain === "calculus" && estimate.theta < 1.7 ? 0.25 : 1;
      return itemInformation(estimate.theta, it) * underSampled * bandWeight * advancedGuard;
    };
    return score(b) - score(a) || a.difficulty - b.difficulty || a.id.localeCompare(b.id);
  })[0];
}

const seedState = (tag: string, mastery: number, today: string): SkillState => ({
  tag,
  mastery,
  attempts: 1,
  correctStreak: 0,
  lastSeen: today,
  contexts: ["diagnostic"]
});

/**
 * Conservative mastery seeding. Correct probes establish readiness, not full mastery. A failed
 * direct probe always wins for its tag. Prerequisite propagation is capped below proficient, and a
 * confident wrong answer is treated as a misconception signal rather than ordinary noise.
 */
export function seedMastery(
  responses: PlacementResponse[],
  prereqs: Record<string, string[]>,
  today: string
): Record<string, SkillState> {
  const states: Record<string, SkillState> = {};
  const raiseTo = (tag: string, mastery: number) => {
    if ((states[tag]?.mastery ?? 0) < mastery) states[tag] = seedState(tag, mastery, today);
  };

  for (const response of responses) {
    if (!response.correct) continue;
    const stack = [...(prereqs[response.tag] ?? [])];
    const seen = new Set<string>();
    while (stack.length) {
      const prerequisite = stack.pop() as string;
      if (seen.has(prerequisite)) continue;
      seen.add(prerequisite);
      // Diagnostic inference is evidence, not proof of durable independent mastery.
      raiseTo(prerequisite, 0.64);
      for (const parent of prereqs[prerequisite] ?? []) stack.push(parent);
    }
  }

  for (const response of responses) {
    if (response.correct) {
      const confidence = response.confidence ?? 0.5;
      raiseTo(response.tag, 0.68 + 0.08 * confidence);
    } else {
      const misconceptionPenalty = (response.confidence ?? 0.5) >= 1 ? 0.08 : 0.15;
      states[response.tag] = seedState(response.tag, misconceptionPenalty, today);
    }
  }
  return states;
}

export interface PlacementRoute {
  tag: string;
  courseSlug: string;
  grade: number;
}

/** Ability-aware routing to the nearest course frontier, with first-miss fallback for legacy calls. */
export function placementRoute(
  responses: PlacementResponse[],
  bank: PlacementItem[] = PLACEMENT_BANK,
  startGrade = 6
): PlacementRoute | null {
  if (bank.length === 0) return null;
  if (responses.length === 0) {
    const initial = [...bank].sort((a, b) => Math.abs(a.grade - startGrade) - Math.abs(b.grade - startGrade))[0];
    return { tag: initial.tag, courseSlug: initial.courseSlug, grade: initial.grade };
  }
  const estimate = estimateAbility(responses, bank, startGrade);
  const targetGrade = gradeForTheta(estimate.theta);
  const itemAtFrontier = [...bank].sort(
    (a, b) =>
      Math.abs(a.grade - targetGrade) - Math.abs(b.grade - targetGrade) ||
      Math.abs(a.difficulty - estimate.theta) - Math.abs(b.difficulty - estimate.theta)
  )[0];
  return { tag: itemAtFrontier.tag, courseSlug: itemAtFrontier.courseSlug, grade: itemAtFrontier.grade };
}

function domainStatus(
  estimate: AbilityEstimate,
  attempts: number,
  correct: number,
  highConfidenceErrors: number
): DomainStatus {
  if (attempts < 2) return "insufficient-evidence";
  if (highConfidenceErrors > 0) return "needs-support";
  const accuracy = correct / attempts;
  // Lower-bound and repeated-evidence rule: a lucky item can never produce "secure".
  if (attempts >= 3 && correct >= 2 && accuracy >= 0.7 && estimate.scaledLower95 >= 460) return "secure";
  if (accuracy >= 0.5 && estimate.scaledScore >= 430) return "developing";
  return "needs-support";
}

export function buildDiagnosticReport(
  history: PlacementResponse[],
  bank: PlacementItem[] = PLACEMENT_BANK,
  startGrade = 6
): DiagnosticReport {
  const overall = estimateAbility(history, bank, startGrade);
  const domainScores = ALL_DOMAINS.map((domain): DomainDiagnostic => {
    const responses = history.filter((r) => (r.domain ?? responseItem(r, bank)?.domain) === domain);
    const estimate = estimateAbility(responses, bank, gradeForTheta(overall.theta), domain);
    const correct = responses.filter((r) => r.correct).length;
    const highConfidenceErrors = responses.filter((r) => !r.correct && (r.confidence ?? 0.5) >= 1).length;
    return {
      domain,
      ...estimate,
      attempts: responses.length,
      correct,
      highConfidenceErrors,
      status: domainStatus(estimate, responses.length, correct, highConfidenceErrors)
    };
  });
  const protectedDomains = domainScores.filter((d) => d.status !== "secure").length;
  const calibration = bank.length > 0 && bank.every((item) => item.calibration === "field-calibrated") ? "field-calibrated" : "provisional";
  return {
    calibration,
    overall,
    estimatedGrade: gradeForTheta(overall.theta),
    domainScores,
    falseMasteryProtected: protectedDomains > 0,
    evidenceWarning: calibration === "field-calibrated"
      ? "Scores use an approved field calibration. Secure status still requires repeated evidence and a sufficiently strong lower confidence bound; it is never awarded from one answer."
      : "Scores use provisional item parameters. Secure status requires repeated evidence and a sufficiently strong lower confidence bound; it is never awarded from one answer."
  };
}
