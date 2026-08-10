/**
 * STRATEGY CLASSIFIERS (Pillar Two, Phase 5 — "strategy-aware").
 *
 * processEvents.classifyProcess names the SHAPE of a move stream (toward /
 * away / oscillating / fixated). This module goes a layer deeper: it names the
 * STRATEGY the stream reveals, per mathematical domain, from the meaningful-
 * move vocabulary (MoveKind) plus the engine's numeric state snapshots.
 *
 * Every classifier here obeys the same contract as the rest of Pillar Two:
 *   PURE + DETERMINISTIC   identical event streams → identical strategy, always
 *                          (the property tests assert this per domain).
 *   EVIDENCE, NOT ACCIDENT one move never classifies; each strategy needs a
 *                          repeated or structurally-unambiguous pattern.
 *   PRECISION OVER RECALL  when the stream is ambiguous the classifier returns
 *                          null — silence is correct; a wrong diagnosis is not.
 *   NAMES A STRATEGY, NOT A MIND   the returned label describes what the moves
 *                          DO ("added denominators"), never what the learner
 *                          "is" — the cue copy keeps the tentative voice.
 *
 * The classifiers are consumed by decideStrategyResponse (below), which maps a
 * detected strategy to the SAME adaptive-response ladder the direction signals
 * use — so a strategy diagnosis flows through cue → structural → remedial with
 * the identical fluent-gate and one-remedial-per-signal guards. Nothing here
 * touches grading, XP, or mastery.
 */

import type { MoveKind, ProcessEvent } from "@/lib/processEvents";

// ── The strategy vocabulary (the mandate's six domain families) ─────────────

export type FractionStrategy =
  | "denominator-size-conflation" // treats a bigger denominator as a bigger fraction
  | "piece-count-only" // counts shaded pieces, ignores piece size
  | "unequal-whole" // partitions into unequal parts and reasons as if equal
  | "denominator-addition" // adds denominators (¼+¼ → 2/8 reasoning)
  | "common-denominator" // POSITIVE: coordinates a shared denominator
  | "benchmark-use"; // POSITIVE: reasons via ½ or 1 as a landmark

export type BaseTenStrategy =
  | "counting-by-one" // ones-at-a-time where grouping was available
  | "valid-grouping" // POSITIVE: composes/【de】composes a ten correctly
  | "invalid-exchange" // exchanges at a wrong rate (10↔1 broken)
  | "wrong-regroup-column" // regroups into the wrong place-value column
  | "place-value-confusion" // treats a ten as a one or vice versa
  | "efficient-decomposition"; // POSITIVE: splits by place value directly

export type NumberLineStrategy =
  | "wrong-direction-count" // hops the wrong way for the operation
  | "interval-vs-point" // counts intervals where points are meant (or vice versa)
  | "zero-crossing-slip" // mishandles the sign change across zero
  | "negative-magnitude" // treats −n as farther when it's nearer (or vice versa)
  | "repeated-overshoot"; // overshoots the target repeatedly

export type RatioStrategy =
  | "additive-not-multiplicative" // adds a constant instead of scaling
  | "inconsistent-scaling" // scales the two terms by different factors
  | "equivalence-break" // moves off an equivalent-ratio path
  | "unit-rate-confusion"; // inverts or misapplies the per-one rate

export type AlgebraBalanceStrategy =
  | "one-sided-operation" // changes one pan without the other
  | "wrong-inverse" // applies the wrong inverse operation
  | "combine-unlike" // combines unlike terms
  | "distribution-error" // distributes incorrectly
  | "sign-error" // sign slip on a moved term
  | "balanced-but-inefficient"; // POSITIVE-ish: valid but wandering

export type GraphStrategy =
  | "xy-swap" // plots/reads with coordinates transposed
  | "slope-intercept-swap" // adjusts the wrong parameter for the goal
  | "rise-run-swap" // inverts the slope ratio
  | "graph-as-picture" // reads the graph as a literal picture
  | "parameter-trial-error" // guesses parameters without connecting them
  | "representation-disconnect"; // changes one view, ignores the other

export type GeometryStrategy =
  | "appearance-as-proof" // uses how it looks as justification
  | "rigid-motion-violation" // resizes/reshapes under a rigid motion
  | "angle-direction" // turns the correct amount the wrong way
  | "construction-order" // uses a tool before its prerequisite exists
  | "measurement-dependence"; // relies on this drawing's measures

/** The umbrella type: every domain strategy plus the domain it belongs to, so
 * the player can route copy and responses generically. */
export type Strategy =
  | { domain: "fractions"; name: FractionStrategy }
  | { domain: "base-ten"; name: BaseTenStrategy }
  | { domain: "number-line"; name: NumberLineStrategy }
  | { domain: "ratios"; name: RatioStrategy }
  | { domain: "algebra-balance"; name: AlgebraBalanceStrategy }
  | { domain: "graphs"; name: GraphStrategy }
  | { domain: "geometry"; name: GeometryStrategy };

/** Positive strategies — evidence of UNDERSTANDING, not error. The player uses
 * this to (a) never scaffold against them and (b) feed acceleration evidence.
 * Kept as data so the fluent-gate logic reads one predicate. */
export const POSITIVE_STRATEGIES: ReadonlySet<string> = new Set([
  "common-denominator",
  "benchmark-use",
  "valid-grouping",
  "efficient-decomposition"
]);

export function isPositiveStrategy(s: Strategy): boolean {
  return POSITIVE_STRATEGIES.has(s.name);
}

// ── Shared helpers ──────────────────────────────────────────────────────────

const countKind = (events: readonly ProcessEvent[], kind: MoveKind): number =>
  events.reduce((n, e) => n + (e.kind === kind ? 1 : 0), 0);

/** A "settled" run needs enough moves to distinguish strategy from a first
 * probe. Below this, every classifier returns null — exploration is not yet a
 * strategy, and one accidental move can never trigger a diagnosis. */
const MIN_MOVES = 3;

// ── FRACTIONS ───────────────────────────────────────────────────────────────
// State snapshot contract: { num, den } after the move; targetNum/targetDen in
// the opts. The engine emits kind:"partition" when the DENOMINATOR changed and
// kind:"reversal" when a move undid the last. All reasoning is on the integers
// the engine already computed — this module never re-derives the geometry.

export interface FractionOpts {
  targetNum: number;
  targetDen: number;
}

export function classifyFraction(events: readonly ProcessEvent[], opts: FractionOpts): FractionStrategy | null {
  const withState = events.filter((e): e is ProcessEvent & { state: Record<string, number> } => !!e.state && Object.values(e.state).every((v) => typeof v === "number"));
  if (withState.length < MIN_MOVES) return null;
  const target = opts.targetNum / opts.targetDen;

  // POSITIVE — benchmark use: the learner parks on ½ or 1 (exactly) on the way
  // to a nearby target, i.e. lands a landmark value that is NOT the target but
  // is a recognised reference, then moves on. Two such landmark touches are a
  // strategy, not a coincidence.
  const landmarkTouches = withState.filter((e) => {
    const v = e.state.num / e.state.den;
    return (v === 0.5 || v === 1) && v !== target;
  }).length;
  if (landmarkTouches >= 2 && target !== 0.5 && target !== 1) return "benchmark-use";

  // POSITIVE — common denominator: once the denominator matches the target's,
  // the learner adjusts ONLY the numerator to close the gap (coordinating on a
  // shared denominator rather than thrashing both).
  const denAligned = withState.filter((e) => e.state.den === opts.targetDen);
  if (denAligned.length >= 2) {
    const afterAlign = withState.slice(withState.findIndex((e) => e.state.den === opts.targetDen));
    const numOnly = afterAlign.length >= 2 && afterAlign.slice(1).every((e, i) => e.state.den === afterAlign[i].state.den);
    if (numOnly) return "common-denominator";
  }

  // MISCONCEPTION — denominator-size conflation: as the learner increases the
  // denominator they move consistently AWAY from a target that is a LARGER
  // fraction (they act as if a bigger denominator means a bigger value).
  let denUpAwayUp = 0;
  for (let i = 1; i < withState.length; i++) {
    const a = withState[i - 1].state, b = withState[i].state;
    const grewDen = b.den > a.den && b.num === a.num;
    if (grewDen && b.num / b.den < a.num / a.den && target > a.num / a.den) denUpAwayUp++;
  }
  if (denUpAwayUp >= 2) return "denominator-size-conflation";

  // MISCONCEPTION — piece-count only: the learner drives the NUMERATOR toward
  // the target's numerator while ignoring a denominator mismatch (matches "how
  // many shaded" and stops, regardless of piece size).
  const last = withState[withState.length - 1].state;
  const numMatchesDenDoesnt = last.num === opts.targetNum && last.den !== opts.targetDen;
  const numDriven = countKind(events, "partition") <= 1 && withState.filter((e) => e.state.num !== withState[0].state.num).length >= 2;
  if (numMatchesDenDoesnt && numDriven) return "piece-count-only";

  // MISCONCEPTION — denominator addition: the signature of adding denominators
  // is landing on a value whose denominator is the SUM of two same-size unit
  // fractions' denominators while the numerator stayed put (¼ then "⅛" for ¼+¼).
  for (let i = 1; i < withState.length; i++) {
    const a = withState[i - 1].state, b = withState[i].state;
    if (b.num === a.num && b.den === a.den * 2 && a.num === 1) return "denominator-addition";
  }

  // MISCONCEPTION — unequal-whole reasoning surfaces as invalid partition moves
  // the engine flagged (a partition the model rejects as non-equal) repeated.
  if (events.filter((e) => e.dir === "invalid" && e.kind === "partition").length >= 2) return "unequal-whole";

  return null;
}

// ── The other five domains ──────────────────────────────────────────────────
// All follow the fraction template: MIN_MOVES floor, evidence-not-accident
// thresholds, silence (null) over guessing. Each consumes only what its
// engine actually emits — an uninstrumented engine yields null, never a
// fabricated read.

export interface BaseTenOpts {
  targetOnes: number;
  targetTens: number;
}
export function classifyBaseTen(events: readonly ProcessEvent[], opts: BaseTenOpts): BaseTenStrategy | null {
  const withState = events.filter((e): e is ProcessEvent & { state: Record<string, number> } => !!e.state && Object.values(e.state).every((v) => typeof v === "number"));
  if (withState.length < MIN_MOVES) return null;

  // POSITIVE — valid grouping / efficient decomposition: a correct regroup that
  // moved the state closer, with no invalid exchanges.
  const invalidRegroup = events.some((e) => e.dir === "invalid" && e.kind === "regroup");
  const validRegroups = events.filter((e) => e.kind === "regroup" && e.dir !== "invalid").length;
  if (!invalidRegroup && validRegroups >= 1 && withState[withState.length - 1].state.tens === opts.targetTens) {
    return validRegroups >= 2 ? "efficient-decomposition" : "valid-grouping";
  }

  // MISCONCEPTION — invalid exchange: an exchange the model rejected, twice.
  if (events.filter((e) => e.dir === "invalid" && e.kind === "regroup").length >= 2) return "invalid-exchange";

  // MISCONCEPTION — counting by one: many single-ones moves where a ten was
  // available (the engine tags ones-moves via control "one"), no regroup used.
  const onesMoves = events.filter((e) => e.control === "one").length;
  if (onesMoves >= 10 && validRegroups === 0) return "counting-by-one";

  // MISCONCEPTION — place-value confusion: a move that raised ones past 9
  // without carrying, or drove tens when ones were the mismatch.
  const last = withState[withState.length - 1].state;
  if (last.ones > 9) return "place-value-confusion";
  // Wrong-regroup-column demands a SETTLED state, not a transit: a one-at-a-
  // time builder passes through every ones value on the way, so a single
  // reading at the target's ones digit proves nothing. Two consecutive
  // readings there (the learner adjusted something else, or repeated, while
  // the tens stayed wrong) is the evidence bar.
  const prev = withState.length >= 2 ? withState[withState.length - 2].state : null;
  if (
    prev !== null &&
    last.tens !== opts.targetTens &&
    last.ones === opts.targetOnes &&
    prev.ones === opts.targetOnes &&
    withState.filter((e) => e.control === "ten").length === 0
  )
    return "wrong-regroup-column";

  return null;
}

export interface NumberLineOpts {
  target: number;
  start: number;
}
export function classifyNumberLine(events: readonly ProcessEvent[], opts: NumberLineOpts): NumberLineStrategy | null {
  const withState = events.filter((e): e is ProcessEvent & { state: Record<string, number> } => !!e.state && Object.values(e.state).every((v) => typeof v === "number"));
  if (withState.length < MIN_MOVES) return null;
  const goingUp = opts.target > opts.start;

  // MISCONCEPTION — wrong direction: consistent movement opposite the target.
  const awayMoves = events.filter((e) => e.dir === "away").length;
  const firstStep = withState[0].state.pos - opts.start;
  if (awayMoves >= 3 && (goingUp ? firstStep < 0 : firstStep > 0)) return "wrong-direction-count";

  // MISCONCEPTION — repeated overshoot: crossed the target 3+ times.
  if (events.filter((e) => e.dir === "past").length >= 3) return "repeated-overshoot";

  // MISCONCEPTION — zero crossing: an away move exactly as the value crosses 0.
  for (let i = 1; i < withState.length; i++) {
    const a = withState[i - 1].state.pos, b = withState[i].state.pos;
    if (a * b < 0 && events[i]?.dir === "away") return "zero-crossing-slip";
  }

  // MISCONCEPTION — negative magnitude: on a target below zero, moving MORE
  // negative when already past it (treats −n as always "farther out").
  if (opts.target < 0) {
    const overshootNeg = withState.some((e) => e.state.pos < opts.target);
    if (overshootNeg && events.filter((e) => e.dir === "away").length >= 2) return "negative-magnitude";
  }

  // MISCONCEPTION — interval vs point: engine tags an off-by-one landing on the
  // wrong side of a tick as kind:"reversal" of counting convention.
  if (events.filter((e) => e.kind === "reversal").length >= 2) return "interval-vs-point";

  return null;
}

export interface RatioOpts {
  aTarget: number;
  bTarget: number;
  aStart: number;
  bStart: number;
}
export function classifyRatio(events: readonly ProcessEvent[], opts: RatioOpts): RatioStrategy | null {
  const withState = events.filter((e): e is ProcessEvent & { state: Record<string, number> } => !!e.state && Object.values(e.state).every((v) => typeof v === "number"));
  if (withState.length < MIN_MOVES) return null;
  const targetRatio = opts.aTarget / opts.bTarget;

  // MISCONCEPTION — additive not multiplicative: the learner adds the SAME
  // constant to both terms (preserving a difference, not a ratio).
  let addedConstant = 0;
  for (let i = 1; i < withState.length; i++) {
    const a = withState[i - 1].state, b = withState[i].state;
    const da = b.a - a.a, db = b.b - a.b;
    if (da !== 0 && da === db) addedConstant++;
  }
  if (addedConstant >= 2) return "additive-not-multiplicative";

  // MISCONCEPTION — inconsistent scaling: multiplies the two terms by different
  // factors between moves.
  let inconsistent = 0;
  for (let i = 1; i < withState.length; i++) {
    const a = withState[i - 1].state, b = withState[i].state;
    if (a.a !== 0 && a.b !== 0 && b.a % a.a === 0 && b.b % a.b === 0 && b.a / a.a !== b.b / a.b && b.a !== a.a) inconsistent++;
  }
  if (inconsistent >= 2) return "inconsistent-scaling";

  // MISCONCEPTION — equivalence break: the current ratio drifts away from the
  // target ratio across consecutive moves (leaves the equivalent-ratio path).
  const lastR = withState[withState.length - 1].state;
  if (lastR.b !== 0 && Math.abs(lastR.a / lastR.b - targetRatio) > 1e-9 && events.filter((e) => e.dir === "away").length >= 3)
    return "equivalence-break";

  // MISCONCEPTION — unit-rate confusion: engine tags an inverted per-one move.
  if (events.filter((e) => e.kind === "reversal").length >= 2) return "unit-rate-confusion";

  return null;
}

export interface AlgebraBalanceOpts {
  /** engine emits kind:"regroup" for a two-sided op, dir:"invalid" for illegal. */
  targetX: number;
}
export function classifyAlgebraBalance(events: readonly ProcessEvent[], _opts: AlgebraBalanceOpts): AlgebraBalanceStrategy | null {
  if (events.length < MIN_MOVES) return null;

  // MISCONCEPTION — one-sided operation: an operation applied to one pan only,
  // which the engine flags invalid, repeated.
  if (events.filter((e) => e.dir === "invalid" && e.control === "one-side").length >= 2) return "one-sided-operation";

  // MISCONCEPTION — wrong inverse / sign / distribution / combine: the engine
  // tags the specific illegal transform via control; each needs two to latch.
  for (const [control, strat] of [
    ["inverse", "wrong-inverse"],
    ["sign", "sign-error"],
    ["distribute", "distribution-error"],
    ["combine", "combine-unlike"]
  ] as const) {
    if (events.filter((e) => e.dir === "invalid" && e.control === control).length >= 2) return strat;
  }

  // NEAR-POSITIVE — balanced but inefficient: only legal two-sided ops, but a
  // long wandering path (many moves, still not solved) — worth a nudge toward
  // strategy, not a correction.
  const allLegal = events.every((e) => e.dir !== "invalid");
  if (allLegal && events.length >= 8) return "balanced-but-inefficient";

  return null;
}

export interface GraphOpts {
  targetSlope: number;
  targetIntercept: number;
}
export function classifyGraph(events: readonly ProcessEvent[], _opts: GraphOpts): GraphStrategy | null {
  if (events.length < MIN_MOVES) return null;
  // The graph family already has high-precision engine TAGS (xy-reversal,
  // slope-for-intercept, …) flowing through classifyProcess. This classifier
  // adds only the STRATEGY-level reads those tags don't cover:
  //   parameter-trial-error — many parameter moves, little progress, no tag.
  const paramMoves = events.filter((e) => e.control === "m" || e.control === "b").length;
  const progress = events.filter((e) => e.dir === "toward").length;
  if (paramMoves >= 8 && progress * 3 <= events.length) return "parameter-trial-error";
  return null;
}

// ── Strategy → response (reuses the direction-signal ladder's shape) ─────────

/** Tentative, mathematically-specific cue for a detected strategy. Same voice
 * as processEvents' cues: name what the moves DO, point at the structure,
 * never assert the mind, never reveal the target. Positive strategies get a
 * brief affirmation instead of a correction. */
const STRATEGY_CUES: Record<string, string> = {
  // fractions
  "denominator-size-conflation":
    "It looks like a bigger bottom number may be reading as a bigger fraction — but more parts means each part is SMALLER. Watch the size of one part as the bottom number grows.",
  "piece-count-only":
    "The number of shaded parts matches, but the parts aren't the same SIZE as the target's — a fraction is how many AND how big. Check the bottom numbers against each other.",
  "unequal-whole":
    "For a fraction, the parts have to be equal — the model only accepts an even split. What would make these pieces the same size?",
  "denominator-addition":
    "When you combine same-size parts, the SIZE of each part doesn't change — only how many you have. What stays the same on the bottom when you add fourths to fourths?",
  "common-denominator": "Nice — you matched the bottom numbers first, then counted parts. That's exactly how equivalent fractions line up.",
  "benchmark-use": "Good instinct using a half as a landmark — anchoring to ½ or 1 and adjusting from there is a strong way to place a fraction.",
  // base-ten
  "counting-by-one": "You're counting one at a time — when you have ten ones, they can become a single ten. Try grouping to move faster.",
  "valid-grouping": "Good — you traded ten ones for a ten. That regroup is the heart of place value.",
  "invalid-exchange": "That trade isn't allowed — ten ones make one ten, not any other amount. Check the ten-for-ten rate.",
  "wrong-regroup-column": "The regroup landed in the wrong column — a carry moves into the NEXT place up. Which column should this ten join?",
  "place-value-confusion": "A ten and a one aren't the same size — check whether this amount belongs in the tens column or the ones column.",
  "efficient-decomposition": "Sharp — you split it straight into tens and ones. That's the efficient way to build the number.",
  // number line
  "wrong-direction-count": "Your hops may be going the wrong way — check whether this operation moves you toward the bigger numbers or the smaller ones.",
  "interval-vs-point": "Count the JUMPS between marks, not the marks themselves — landing is about how many spaces you move.",
  "zero-crossing-slip": "Watch what happens right at zero — crossing it flips which direction makes the value larger.",
  "negative-magnitude": "Further left isn't always 'more' — for negatives, the number closer to zero is the larger one.",
  "repeated-overshoot": "You keep passing the target — try smaller hops and watch the readout as you approach.",
  // ratios
  "additive-not-multiplicative":
    "It looks like the same amount is being ADDED to both — but a ratio scales by MULTIPLYING. What do you multiply both by to keep them in step?",
  "inconsistent-scaling": "The two quantities grew by different factors — to keep a ratio, both sides scale by the SAME number. Check your two multipliers.",
  "equivalence-break": "The ratio has drifted off — equivalent ratios stay in the same proportion. What move keeps both terms in the same relationship?",
  "unit-rate-confusion": "Check the per-one amount — the unit rate is how much of one quantity goes with a SINGLE of the other.",
  // algebra balance
  "one-sided-operation": "Whatever you do to one pan, do to the other — the scale only stays true if both sides change together.",
  "wrong-inverse": "To undo an operation you need its opposite — check whether this step reverses what was done to x.",
  "combine-unlike": "Only like terms combine — a number and an x-term stay separate. Which of these can actually be added?",
  "distribution-error": "When you multiply across a sum, every term inside gets multiplied — check that nothing was skipped.",
  "sign-error": "Watch the sign as the term moves — crossing the equals sign flips it. Did this one change correctly?",
  "balanced-but-inefficient":
    "Every step you've made is legal — but there may be a shorter path. What single operation would isolate x fastest from here?",
  // graphs
  "parameter-trial-error":
    "A lot of parameter changes haven't closed the gap — pause and connect each control to the graph. Which one changes the tilt, and which the height?"
};

export function strategyCue(s: Strategy): string {
  return STRATEGY_CUES[s.name] ?? "It looks like there may be a pattern worth pausing on — what does each control change about the model?";
}
