/**
 * PROCESS-EVIDENCE LAYER (Pillar Two core).
 *
 * Today the app adapts on OUTCOMES (wrong answers → remediation). This module
 * adds the deterministic machinery to react to PROCESS — how the learner is
 * manipulating the mathematical object before any answer is checked — without
 * touching grading, XP, mastery, or the state machine.
 *
 * Design contract (mirrors §11 of the optimization brief):
 *  - ENGINES classify a single move against their own spec (they own the math)
 *    and emit a semantic event: toward / away / past / invalid. No raw pointer
 *    streams, no timestamps, no lesson-specific logic inside engines.
 *  - THIS MODULE classifies event STREAMS into strategy signals with pure,
 *    threshold-based functions: identical event sequences always produce
 *    identical signals (tested), and a signal latches once per step.
 *  - CUE COPY lives here, keyed by widget type, in tentative language
 *    ("It looks like you may be…") per the brief's transparency rule — never
 *    a claim of certainty about the learner's thoughts.
 *  - The cue is a nudge, not a gate: it never blocks Check, never costs XP,
 *    never feeds the grader. It is the app noticing, out loud, gently.
 */

import type { TWidget } from "@/lib/schema";

/** Domain-specific misconception patterns an ENGINE can recognise in a single
 * move against its own spec (the engine owns the math; this module only counts).
 * Linear-function family: axis-order, parameter roles, slope anatomy, graph-as-
 * picture, cross-representation reading. Geometry family: appearance-as-proof,
 * rigid-motion violations, turn direction, construction prerequisites, measuring
 * where reasoning should be invariant. */
export type MisconceptionTag =
  | "xy-reversal"
  | "slope-for-intercept"
  | "intercept-for-slope"
  | "rise-run-reversal"
  | "graph-as-picture"
  | "repr-disconnect"
  | "visual-proof"
  | "rigid-violation"
  | "angle-direction"
  | "construction-order"
  | "measurement-dependence";

/** A meaningful-move CATEGORY beyond bare direction — the vocabulary the
 * strategy classifiers (strategyClassifiers.ts) read. These are semantic
 * facts an engine already knows about a move, not raw telemetry:
 *  - "reset":     the learner cleared the object back to start;
 *  - "reversal":  a move that undid the immediately-preceding one;
 *  - "repr":      the learner switched representation (bar↔number, grid↔symbol);
 *  - "hint":      a hint was requested at this move;
 *  - "efficient": the engine recognised a direct, minimal-move strategy;
 *  - "regroup":   a base-ten exchange/regroup was performed (valid or not);
 *  - "partition": a fractions/area partition changed (parts, not shading).
 * All optional and additive: an engine that emits none behaves exactly as
 * before, and every existing classifier ignores fields it doesn't read. */
export type MoveKind = "reset" | "reversal" | "repr" | "hint" | "efficient" | "regroup" | "partition";

/** One meaningful move, already interpreted by the engine that owns the math. */
export interface ProcessEvent {
  /** Which control moved (e.g. "x", "d", "marker") — for future per-control signals. */
  control: string;
  dir: "toward" | "away" | "past" | "invalid" | "neutral";
  /** Optional engine-recognised misconception pattern for THIS move. Tags are
   * high-precision (the move landed in a specifically misconceived state), so
   * they reach signal at a lower count than the generic direction streams —
   * but never on a single move: one landing is an accident, two is a pattern. */
  tag?: MisconceptionTag;
  /** Optional meaningful-move category (see MoveKind). Additive: absent on
   * every existing emitter, read only by the strategy classifiers. */
  kind?: MoveKind;
  /** Optional engine-supplied snapshot of the move's mathematical state, for
   * classifiers that reason about VALUES not just direction (e.g. fractions:
   * {num, den}; base-ten: {ones, tens}) or about categorical settings the
   * engine owns (e.g. sampling: {method}; measurement: {spacing}). Small,
   * bounded, no PII. Numeric fields stay numeric — classifiers narrow with a
   * type predicate before doing arithmetic. */
  state?: Readonly<Record<string, number | string>>;
}

/** How a single continuous move relates to the step's target value.
 *  - "toward": strictly closer to the target than before
 *  - "away":   strictly farther from the target than before
 *  - "past":   crossed over the target (overshoot / oscillation evidence)
 *  - null:     no change, landed exactly on target, or equidistant (no signal)
 */
export function moveRelation(fromVal: number, toVal: number, targetVal: number): ProcessEvent["dir"] | null {
  if (toVal === fromVal) return null;
  if (toVal === targetVal) return null; // arriving is success, not process evidence
  const crossed = (fromVal - targetVal) * (toVal - targetVal) < 0;
  if (crossed) return "past";
  const df = Math.abs(fromVal - targetVal);
  const dt = Math.abs(toVal - targetVal);
  if (dt < df) return "toward";
  if (dt > df) return "away";
  return null; // equidistant flip without crossing can't happen for reals; guard anyway
}

export type ProcessSignal =
  | "wrong-direction"
  | "oscillating"
  | "invalid-moves"
  | "one-control-fixation"
  | "param-thrash"
  | MisconceptionTag
  | StrategyName;

/** Strategy names (strategyClassifiers.ts) are ALSO process signals, so a
 * detected strategy latches through the identical signalCounts ladder — same
 * cue → structural → remedial rungs, same fluent-gate, same persistence across
 * resume/sync — with no parallel decision path. Imported as a bare string
 * union to avoid a cycle (the classifier module imports ProcessEvent from
 * here); the two lists are kept in lockstep by a test. */
export type StrategyName =
  | "denominator-size-conflation"
  | "piece-count-only"
  | "unequal-whole"
  | "denominator-addition"
  | "common-denominator"
  | "benchmark-use"
  | "counting-by-one"
  | "valid-grouping"
  | "invalid-exchange"
  | "wrong-regroup-column"
  | "place-value-confusion"
  | "efficient-decomposition"
  | "wrong-direction-count"
  | "interval-vs-point"
  | "zero-crossing-slip"
  | "negative-magnitude"
  | "repeated-overshoot"
  | "additive-not-multiplicative"
  | "inconsistent-scaling"
  | "equivalence-break"
  | "unit-rate-confusion"
  | "one-sided-operation"
  | "wrong-inverse"
  | "combine-unlike"
  | "distribution-error"
  | "sign-error"
  | "balanced-but-inefficient"
  | "xy-swap"
  | "slope-intercept-swap"
  | "rise-run-swap"
  | "graph-as-picture-strategy"
  | "parameter-trial-error"
  | "representation-disconnect"
  | "appearance-as-proof"
  | "rigid-motion-violation"
  | "angle-direction-strategy"
  | "construction-order-strategy"
  | "measurement-dependence-strategy";

/** Thresholds: three of a kind fires a generic direction signal. Three is
 * deliberate — one is noise, two is exploration, three is a pattern worth
 * naming. Engine-recognised tags are far more specific, so TWO of the same tag
 * fire — but never one: a single landing on a misconceived state can be an
 * accident of the drag, and one accidental move must not trigger a diagnosis. */
const THRESHOLD = 3;
const TAG_THRESHOLD = 2;
/** Trial-and-error: many moves, little progress, repeated crossings, spread
 * over more than one control (a single-control version of this stream is
 * wrong-direction/oscillation and is diagnosed there). */
const THRASH_MIN_EVENTS = 8;

/** Pure stream classifier. Returns the FIRST signal whose threshold the event
 * stream has met, in priority order (wrong-direction is the strongest signal
 * of a mistaken model; oscillation suggests step-size trouble; invalid moves
 * suggest the constraint isn't understood). Returns null below threshold. */
export function classifyProcess(
  events: readonly ProcessEvent[],
  opts?: { multiControl?: boolean }
): ProcessSignal | null {
  // Fixation is checked FIRST on multi-control engines because it is the more
  // specific diagnosis: four or more moves all on ONE control, at least two of
  // them unproductive, while the other control was never touched. (On a
  // single-control engine the same stream is just wrong-direction/oscillation
  // — there is no "other control" to be fixated against.)
  if (opts?.multiControl && events.length >= 4) {
    const first = events[0].control;
    if (events.every((e) => e.control === first)) {
      const unproductive = events.filter((e) => e.dir === "away" || e.dir === "past").length;
      if (unproductive >= 2) return "one-control-fixation";
    }
  }
  // Engine-recognised tags first: they are the most specific diagnosis in the
  // stream. Deterministic: walk in event order, return the first tag to reach
  // its threshold, so identical streams always name the identical pattern.
  const tagCount = new Map<MisconceptionTag, number>();
  for (const e of events) {
    if (!e.tag) continue;
    const n = (tagCount.get(e.tag) ?? 0) + 1;
    tagCount.set(e.tag, n);
    if (n >= TAG_THRESHOLD) return e.tag;
  }
  let away = 0, past = 0, invalid = 0, toward = 0;
  const controls = new Set<string>();
  for (const e of events) {
    controls.add(e.control);
    if (e.dir === "away") away++;
    else if (e.dir === "past") past++;
    else if (e.dir === "invalid") invalid++;
    else if (e.dir === "toward") toward++;
  }
  // Trial-and-error is checked BEFORE the generic buckets for the same reason
  // fixation is: when the volume/spread conditions hold, "guessing at the
  // parameters" is the more actionable diagnosis than the direction bucket the
  // guesses happen to fall into. Below the volume bar, the stream degrades to
  // the generic cue — which still helps.
  if (events.length >= THRASH_MIN_EVENTS && controls.size >= 2 && past >= 2 && toward * 3 <= events.length)
    return "param-thrash";
  if (away >= THRESHOLD) return "wrong-direction";
  if (past >= THRESHOLD) return "oscillating";
  if (invalid >= THRESHOLD) return "invalid-moves";
  return null;
}

/** Engines that emit per-control events against per-control targets, making
 * the fixation diagnosis meaningful. Kept here beside the classifier so the
 * emitter, the rule, and the cue evolve together. */
export const MULTI_CONTROL: ReadonlySet<TWidget["type"]> = new Set(["fractionBar", "lineExplore", "scatterFit", "quadDrag", "transformExplore", "triangleConstraintLab", "coordinateProofLab", "solidSliceLab", "lineRelationLab", "triangleAngleLab", "verticalLineScanner", "samplingBiasLab", "shapeFamilyBuilder", "unitRuler", "derivativeRuleLab", "conditionalTableLab", "extraneousRootLab", "binomialAreaLab", "quadraticExplore"]);

/** Tentative, mathematically specific cue copy per instrumented engine, with a
 * generic fallback for engines instrumented later. Tone rules: name what the
 * moves LOOK like, point at the mathematically relevant feature, never assert
 * what the learner thinks, never reveal the target. */
const CUES: Partial<Record<TWidget["type"], Partial<Record<ProcessSignal, string>>>> = {
  hundredthsGrid: {
    "wrong-direction":
      "The shaded count is moving away from the amount the prompt names — read the decimal one place at a time: each full column is a tenth, each single cell a hundredth.",
    oscillating:
      "You've filled and unfilled the same cells a few times — settle the whole columns for the tenths digit first, then add single cells for the hundredths."
  },
  numberLinePlace: {
    "wrong-direction":
      "It looks like your marker may be moving away from where it needs to go — check which direction makes the number bigger on this line.",
    oscillating:
      "You've crossed back and forth over the same spot a few times — try smaller steps and watch the readout as you move."
  },
  quadraticExplore: {
    "wrong-direction":
      "That control looks to be moving away from where it needs to be \u2014 watch the curve against the target as you drag, not just the number.",
    oscillating:
      "You've crossed back over the same value a few times \u2014 settle one control before starting on the next."
  },
  binomialAreaLab: {
    "wrong-direction":
      "The partition looks like it may be moving away from the side length you're after \u2014 watch the strip's coefficient in the readout as you drag.",
    oscillating:
      "You've crossed back over the same partition a few times \u2014 move one unit at a time and read the middle coefficient at each stop."
  },
  extraneousRootLab: {
    "wrong-direction":
      "The probe looks like it may be drifting away from the crossing you're after — watch the two readouts and move toward where they agree.",
    oscillating:
      "You've passed back and forth over the same stretch — step the probe one unit at a time and compare the two sides at each stop."
  },
  fractionBar: {
    "wrong-direction":
      "It looks like the fraction may be moving the wrong way — look at the size of each part, not just how many parts there are.",
    oscillating:
      "You've jumped past the same value a few times — change one thing at a time and watch how the shaded amount responds."
  },
  numberLineHop: {
    "wrong-direction":
      "It looks like your hops may be landing on the wrong side — check whether this jump adds or takes away.",
    oscillating:
      "You've landed on both sides of the same spot — count the hops one at a time from the start mark."
  },
  estimateSlider: {
    "wrong-direction":
      "It looks like the next estimate moved farther from the stated amount — compare the distance between the two markers.",
    oscillating:
      "You've crossed the stated amount more than once — compare one candidate at a time and keep the smaller distance."
  },
  percentBar: {
    "wrong-direction":
      "It looks like the shaded part may be moving the wrong way — compare the bar with how big the percent should feel.",
    oscillating:
      "You've crossed the same percent a few times — smaller steps will show exactly where the amount matches."
  },
  balanceScale: {
    "wrong-direction":
      "It looks like the scale may be tipping further as x changes — watch which way the left pan moves as you adjust.",
    oscillating:
      "You've swung the scale past level a few times — try one step at a time and watch the two totals meet."
  }
};

/** Generic cues for the DIRECTION signals and the engine tags. Strategy-name
 * signals (StrategyName) carry their own copy in strategyClassifiers.ts and
 * are routed there by processCue below, so they are intentionally absent here.
 * Partial keyed by the non-strategy signals. */
type NonStrategySignal = Exclude<ProcessSignal, StrategyName>;
const GENERIC: Record<NonStrategySignal, string> = {
  "wrong-direction":
    "It looks like your changes may be heading away from the goal — watch the readout as you adjust and check which direction closes the gap.",
  oscillating:
    "You've crossed the same value a few times — smaller steps will let you see exactly where it lands.",
  "invalid-moves":
    "That move isn't allowed here — the model only accepts changes that keep the mathematics valid. Try a different control.",
  "one-control-fixation":
    "It looks like you may be adjusting only one control — the other control changes a different part of the model.",
  "param-thrash":
    "A lot of moves haven't settled it yet — pause the sliders for a second. What does each control change about the picture? Try predicting before your next move.",
  "xy-reversal":
    "It looks like the two coordinates may be trading places — in (x, y), the FIRST number runs along, the SECOND climbs. Which one is which here?",
  "slope-for-intercept":
    "The tilt keeps changing, but the tilt already matches — the gap that's left is WHERE the line crosses the y-axis. Which control slides the line without tilting it?",
  "intercept-for-slope":
    "The line keeps sliding up and down, but its height already matches — the gap that's left is the STEEPNESS. Which control tilts the line?",
  "rise-run-reversal":
    "It looks like rise and run may be swapping roles — slope counts how far UP for each step ACROSS. Which of your two numbers is the up-count?",
  "graph-as-picture":
    "The graph may be getting read as a picture of the motion — it isn't a road map. Each point pairs a moment with a value; what does a flat stretch say?",
  "repr-disconnect":
    "The two views describe the SAME object — when one changes, the other must agree. What did your last move do to the other representation?",
  "visual-proof":
    "Looking alike isn't yet knowing — what marked information (equal sides, equal angles) could SHOW it, whatever the drawing happens to look like?",
  "rigid-violation":
    "That change resized or reshaped the figure — a rigid motion may only slide, turn, or flip it. Which of those three is this task asking for?",
  "angle-direction":
    "The turn looks right in size but may be going the wrong way round — which direction is the rotation asked for, clockwise or counter-clockwise?",
  "construction-order":
    "That tool needs something built first — a construction is a sequence, and each step leans on the one before. What does this step require on the canvas already?",
  "measurement-dependence":
    "Measuring keeps standing in for reasoning — the relationship holds for EVERY case, not just this drawing's numbers. What is true no matter what the measures are?"
};

/** Per-control fixation copy: names what the repeated moves LOOK like and what
 * has NOT changed — the quoted contrast is the cue's whole job ("your line
 * moved, but its steepness stayed the same"). Never names the target value. */
const FIXATION_CUES: Partial<Record<TWidget["type"], Record<string, string>>> = {
  lineExplore: {
    b: "Your line has been sliding up and down, but its steepness hasn't changed yet — the slope control tilts it.",
    m: "Your line has been tilting, but where it crosses the y-axis hasn't changed yet — the intercept control slides it."
  },
  fractionBar: {
    d: "It looks like you may be changing only how many parts the bar is cut into — how many parts are shaded matters too.",
    n: "It looks like you may be changing only how many parts are shaded — the size of each part matters too."
  },
  scatterFit: {
    m: "The line has been tilting, but its height hasn't moved — the intercept control lifts the whole line.",
    b: "The line has been sliding up and down without tilting — the slope control changes how it leans through the points."
  },
  quadDrag: {
    x: "The corner has been sliding side to side, but its height hasn't changed yet — the other control moves it up and down.",
    y: "The corner has been moving up and down, but not sideways yet — the other control slides it left and right."
  },
  transformExplore: {
    dx: "The shape has been sliding side to side, but its height hasn't changed yet — the other slider moves it up and down.",
    dy: "The shape has been moving up and down, but not sideways yet — the other slider slides it across."
  },
  quadraticExplore: {
    a: "You've been changing the stretch only \u2014 a decides how steep the curve is and which way it opens, but it cannot move where the curve sits.",
    h: "You've been sliding left and right only \u2014 h moves the curve across, and something else decides its height.",
    k: "You've been moving up and down only \u2014 k raises and lowers the curve, and something else decides where it sits across.",
    r1: "You've been dragging one root only \u2014 the curve crosses the axis TWICE, and both crossings are yours to place.",
    r2: "You've been dragging the other root only \u2014 try the first crossing as well; together they fix the whole parabola."
  },
  binomialAreaLab: {
    a: "You've been moving the across partition only \u2014 the down one sets the other strip, and the middle coefficient is what the two strips add up to.",
    b: "You've been moving the down partition only \u2014 the across one sets the other strip, and neither strip alone decides the middle coefficient."
  },
  extraneousRootLab: {
    probe: "You've been sliding the probe along the axis, but both sides haven't been squared yet — the second intersection can't appear until they are.",
    squared: "Both sides are squared now, but the probe hasn't moved yet — sliding it reads the two sides at any x, which is how you tell a real meeting from an invented one."
  }
};

export function processCue(widgetType: TWidget["type"], signal: ProcessSignal, control?: string): string {
  if (signal === "one-control-fixation") {
    return (
      (control && FIXATION_CUES[widgetType]?.[control]) ??
      "It looks like you may be adjusting only one control — the other control changes a different part of the model."
    );
  }
  // Strategy-name signals are given copy by strategyCue (strategyClassifiers.ts)
  // and routed there directly by the caller, to avoid an import cycle. If one
  // reaches here, fall back gently rather than throw.
  const generic = (GENERIC as Partial<Record<ProcessSignal, string>>)[signal];
  return CUES[widgetType]?.[signal] ?? generic ?? "It looks like there may be a pattern here worth pausing on.";
}
