import { fractionText } from "@/lib/mathUtils";
import type { TRule, TWidget, SolveBalanceRel } from "./schema";
import { algebraTilesPartials, binomialExpand, circleScaleReadouts, columnCalcTruth, fmOutput, geometricTerm, sequenceReasoningTruth, prismVolume, hopSizeAnswer, roundSolidCoef, shapePartCount, solveBalanceSet, solveBalanceSetsEqual, extraneousCandidates, extraneousHolds, mixedRegroupTruth, quadName, signChartCuts, solveBalanceHolds, solveBalanceWitness, triangleRatio, UC_TRUE_FORMULAS , unitChainAnswer, unitChainWorlds, dotPlotLabel , slopeTriangleMatches, slopeTriangleTruth, slopeTriangleLabel , graphReadAnswer, distributionGapUnits, trialProbabilityEquivalent, compoundEventChoiceCorrect, compoundEventTotal, compoundEventFavourable, compositeAreaChoiceCorrect, compositeAreaTarget, scaledCircleChoiceCorrect, scaledCircleTarget, percentChangeChoiceCorrect, percentChangeTarget, equationOutcomeChoiceCorrect, equationOutcomeTruth, equationTransformTruth, signedFractionChoiceCorrect, signedFractionTruth, shapeHierarchyChoiceCorrect, triangleClosureChoiceCorrect, triangleClosureForms, conditionalTableReadTruth, proportionalReasoningChoiceCorrect, proportionalReasoningExplorationKeys, proportionalReasoningTruth, placeValueTransformChoiceCorrect, placeValueTransformExplorationKeys, placeValueTransformTruth, pointSetReasoningChoiceCorrect, pointSetReasoningExplorationKeys, pointSetReasoningTruth, geometricConstraintChoiceCorrect, geometricConstraintExplorationKeys, geometricConstraintTruth, exactNumberChoiceCorrect, exactNumberExplorationKeys, exactNumberTruth, affineRelationshipChoiceCorrect, affineRelationshipExplorationKeys, affineRelationshipTruth, quotientFractionFromMixed, quotientRationalKey, quotientReasoningChoiceCorrect, quotientReasoningExplorationKeys, quotientReasoningFractionCorrect, quotientReasoningTruth, graphStoryChoiceCorrect, graphStorySequenceKey, graphStoryTruth } from "./schema";
export { binomialExpand, circleScaleReadouts, roundSolidCoef, rootsFormCoefs, shapePartCount, quadName, triangleRatio, midsegmentLength, signChartCuts, signChartValueAt, extraneousCandidates, extraneousHolds } from "./schema";

/* ── numberLineRay (S215) helpers ────────────────────────────────────────────────────────────────
 * Both read the ENGINE's own derivation rather than restating the mathematics here, so the grader
 * and the number line the learner is looking at cannot tell two different stories about one state.
 */

/** Coerce a persisted widget value into a relation, or null if it is not one. `coeff = 0` is not a
 * relation about the variable and is refused here exactly as the model refuses to reach it. */
function numberLineRayClaim(
  value: unknown
): { coeff: { n: number; d: number }; constant: { n: number; d: number }; relation: "lt" | "gt"; inclusive: boolean } | null {
  if (!value || typeof value !== "object") return null;
  const v = value as { coeff?: unknown; constant?: unknown; relation?: unknown; inclusive?: unknown };
  const frac = (raw: unknown): { n: number; d: number } | null => {
    if (!raw || typeof raw !== "object") return null;
    const f = raw as { n?: unknown; d?: unknown };
    return typeof f.n === "number" && Number.isSafeInteger(f.n) && typeof f.d === "number" && Number.isSafeInteger(f.d) && f.d > 0
      ? { n: f.n, d: f.d }
      : null;
  };
  const coeff = frac(v.coeff);
  const constant = frac(v.constant);
  if (!coeff || !constant || coeff.n === 0) return null;
  if (v.relation !== "lt" && v.relation !== "gt") return null;
  if (typeof v.inclusive !== "boolean") return null;
  return { coeff, constant, relation: v.relation, inclusive: v.inclusive };
}

/** The solved form (`x \u2264 3`) and its three graded facts, from the engine's own derivation. */
function numberLineRaySolved(
  rel: { coeff: { n: number; d: number }; constant: { n: number; d: number }; relation: "lt" | "gt"; inclusive: boolean },
  variable: string
): {
  text: string;
  written: string;
  solved: boolean;
  boundaryText: string;
  direction: "less" | "greater";
  inclusive: boolean;
} | null {
  try {
    const canonical = makeRayCanonical({
      coeff: ratOf(rel.coeff.n, rel.coeff.d),
      constant: ratOf(rel.constant.n, rel.constant.d),
      relation: rel.relation,
      inclusive: rel.inclusive,
      variable
    });
    const solution = deriveRaySolution(canonical);
    const written = deriveRayRelation(canonical);
    return {
      text: solution.text,
      written: written.text,
      solved: written.solved,
      // The typographic minus, so the diagnosis names the endpoint the way the line labels it.
      boundaryText: (solution.boundary.d === 1
        ? String(solution.boundary.n)
        : `${solution.boundary.n}/${solution.boundary.d}`
      ).replace("-", "\u2212"),
      direction: solution.direction,
      inclusive: solution.inclusive
    };
  } catch {
    return null; // a value restored from storage whose parts leave the exact range
  }
}

/** Reversing a comparator — the one thing multiplying an inequality by a negative does. */
const FLIP_REL: Record<SolveBalanceRel, SolveBalanceRel> = { eq: "eq", lt: "gt", gt: "lt", le: "ge", ge: "le" };
import { gcd } from "./mathUtils";
import { numberLineRaySameSolutionSet } from "./schema";
import { deriveRelationView as deriveRayRelation, deriveSolution as deriveRaySolution, makeRayCanonical } from "./mmip/numberLineRayModel";
import { rat as ratOf } from "./mmip/lineFamilyModel";

export interface EvalResult {
  correct: boolean;
  feedback: string;
  /** Partial credit (0–1) where the widget supports it (dragBucket, plotPoint). */
  score?: number;
}

export type Reflect = "none" | "x" | "y";
/** Reflect a point over an axis (x-axis negates y; y-axis negates x), then translate by (dx, dy).
 * Shared by the transformExplore widget (rendering) and its checker (evaluate) — single source. */
export function transformPoint(x: number, y: number, dx: number, dy: number, reflect: Reflect): [number, number] {
  const rx = reflect === "y" ? -x : x;
  const ry = reflect === "x" ? -y : y;
  return [rx + dx, ry + dy];
}
function sortVerts(vs: Array<[number, number]>): Array<[number, number]> {
  return [...vs].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}
function vertsEqual(a: Array<[number, number]>, b: Array<[number, number]>): boolean {
  return a.length === b.length && a.every((p, i) => p[0] === b[i][0] && p[1] === b[i][1]);
}

export function evalRule(rule: TRule, states: Record<string, boolean>): boolean {
  if (typeof rule === "string") return !!states[rule];
  switch (rule.op) {
    case "and":
      return rule.args.every((a) => evalRule(a, states));
    case "or":
      return rule.args.some((a) => evalRule(a, states));
    case "not":
      return !evalRule(rule.args[0], states);
  }
}

/** Snap to 2 significant figures — keeps log-slider readouts kid-friendly. */
export function snap2sf(v: number): number {
  if (v <= 0) return v;
  const mag = Math.pow(10, Math.floor(Math.log10(v)) - 1);
  return Math.round(v / mag) * mag;
}

/** The angle a circleAngleExplore reports, given its mode and the arc the learner has set.
 * Shared by evaluate() and correctAnswerText() so the two can never drift apart. */
export function circleReadout(mode: "central" | "inscribed" | "tangentChord" | "cyclic", arc: number): number {
  switch (mode) {
    case "central":
      return Math.round(arc);
    case "inscribed":
    case "tangentChord":
      return Math.round(arc / 2);
    case "cyclic":
      return Math.round(180 - arc / 2);
  }
}

/** What an expLogExplore reports for a given base. Null when the base is 1 (a logarithm base 1 is
 * undefined). Exported so the component and the grader read the SAME arithmetic. */
export function expLogReadout(mode: "exponential" | "logarithm", base: number, x: number): number | null {
  if (base <= 0) return null;
  if (mode === "exponential") return Math.pow(base, x);
  if (Math.abs(base - 1) < 1e-9) return null;
  return Math.log(x) / Math.log(base);
}

/** The curve a secantSlope draws, its exact derivative, and the secant slope over a gap h.
 * Exported so the component and the grader share one arithmetic. */
export function curveAt(curve: "square" | "cubic", x: number, shiftX = 0, shiftY = 0): number {
  const z = x - shiftX;
  return (curve === "square" ? z * z : z * z * z) + shiftY;
}
export function curveSlopeAt(curve: "square" | "cubic", x: number, shiftX = 0): number {
  const z = x - shiftX;
  return curve === "square" ? 2 * z : 3 * z * z;
}
/** Null at h = 0: the difference quotient is 0/0 there, and that is the point. */
export function secantSlopeOver(curve: "square" | "cubic", a: number, h: number, shiftX = 0, shiftY = 0): number | null {
  if (h === 0) return null;
  return (curveAt(curve, a + h, shiftX, shiftY) - curveAt(curve, a, shiftX, shiftY)) / h;
}

/** (a + bi)(c + di). Exported so the widget's second arrow and the grader use ONE multiplication. */
export function complexProduct(a: number, b: number, c: number, d: number): [number, number] {
  return [a * c - b * d, a * d + b * c];
}

/** Dot product — exported so the widget's live readout and the grader agree by construction. */
export function dotProduct(ax: number, ay: number, bx: number, by: number): number {
  return ax * bx + ay * by;
}

/** What a circleMeasureExplore reports for a given slider position. chordDistance: the chord length
 * at distance `v` from the centre. tangentLength: the tangent length from an external point at
 * distance `v`. arcSector: the angle itself. One helper, imported by both the widget and the grader. */
export function circleMeasureReadout(
  mode: "chordDistance" | "tangentLength" | "arcSector" | "radiusScale",
  radius: number,
  v: number
): number {
  if (mode === "chordDistance") return 2 * Math.sqrt(Math.max(radius * radius - v * v, 0));
  if (mode === "tangentLength") return Math.sqrt(Math.max(v * v - radius * radius, 0));
  return v;
}

/** Petals of r = cos(nθ): n when n is odd, 2n when n is even. The even case retraces the odd half
 * of its sweep, which is why it ends up with twice as many. Exported so the widget's caption and the
 * grader count petals the same way. */
export function rosePetals(n: number): number {
  return n % 2 === 1 ? n : 2 * n;
}

/** The true signs of a polynomial on the intervals cut out by its roots. Sign flips only across a
 * root of ODD multiplicity — an even root touches zero and comes back the way it came. Exported so
 * the widget's sketch and the grader agree on what the curve actually does. */
export function signChartSigns(
  roots: Array<{ x: number; mult: number }>,
  leadingPositive: boolean,
  poles?: Array<{ x: number; mult: number }>
): Array<"+" | "-"> {
  const cuts = signChartCuts(roots, poles);
  const out: Array<"+" | "-"> = [];
  let sign = leadingPositive ? 1 : -1; // rightmost interval: the leading term wins
  out.push(sign > 0 ? "+" : "-");
  for (let i = cuts.length - 1; i >= 0; i--) {
    if (cuts[i].mult % 2 === 1) sign = -sign;
    out.unshift(sign > 0 ? "+" : "-");
  }
  return out;
}

/** Law of cosines, both directions. sas: the third side from two sides and the included angle.
 * sss: the angle opposite side c. Exported so the triangle drawn and the answer graded are the same
 * triangle. */
export function lawOfCosinesSide(a: number, b: number, angleDeg: number): number {
  return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos((angleDeg * Math.PI) / 180));
}
export function lawOfCosinesAngle(a: number, b: number, c: number): number {
  const cos = (a * a + b * b - c * c) / (2 * a * b);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

/** How many times a compass of radius r steps round a circle of radius R. Exactly 6 when r = R,
 * which is the whole reason the hexagon construction works. */
export function compassSteps(R: number, r: number): number {
  const chord = 2 * Math.asin(Math.min(r / (2 * R), 1));
  return (2 * Math.PI) / chord;
}
/** Name a quadrilateral from its four vertices, in order. The hierarchy is honoured: a square is
 * reported as a square, but it satisfies every rhombus and rectangle test on the way there. */

/** The little function library derivativeTrace draws, and its exact first AND second derivatives.
 * Null where the derivative does not exist — the corner of |x| at 0, which is the point of having
 * |x| in here. cubicMix is x³ − 3x (S205B): its critical points (±1) and its inflection (0) are
 * DIFFERENT places, which is what an inflection lesson needs — on x² and x³ the interesting
 * x-values all pile up at the origin and "flat" cannot be told apart from "bending changes". */
export type TraceFn = "square" | "cubic" | "abs" | "cubicMix";
export function traceAt(fn: TraceFn, x: number): number {
  return fn === "square" ? x * x : fn === "cubic" ? x * x * x : fn === "cubicMix" ? x * x * x - 3 * x : Math.abs(x);
}
export function traceSlopeAt(fn: TraceFn, x: number): number | null {
  if (fn === "square") return 2 * x;
  if (fn === "cubic") return 3 * x * x;
  if (fn === "cubicMix") return 3 * x * x - 3;
  return x === 0 ? null : x > 0 ? 1 : -1;
}
export function traceSecondAt(fn: TraceFn, x: number): number | null {
  if (fn === "square") return 2;
  if (fn === "cubic") return 6 * x;
  if (fn === "cubicMix") return 6 * x;
  return x === 0 ? null : 0; // |x|: straight on both sides, no bend; undefined at the corner
}

/** The two functions C4 integrates, their exact areas, and their accumulation functions.
 * Exported so the widget's picture and the grader can never disagree about what the area IS. */
export function integrandAt(fn: "line" | "square", x: number): number {
  return fn === "line" ? 2 * x : x * x;
}
export function exactArea(fn: "line" | "square", a: number, b: number): number {
  return fn === "line" ? b * b - a * a : (b * b * b - a * a * a) / 3;
}
export function riemannEstimate(
  fn: "line" | "square",
  a: number,
  b: number,
  n: number,
  rule: "left" | "right" | "mid" | "trap"
): number {
  const h = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const xl = a + i * h, xr = xl + h;
    if (rule === "left") s += integrandAt(fn, xl) * h;
    else if (rule === "right") s += integrandAt(fn, xr) * h;
    else if (rule === "mid") s += integrandAt(fn, (xl + xr) / 2) * h;
    else s += ((integrandAt(fn, xl) + integrandAt(fn, xr)) / 2) * h;
  }
  return s;
}
/** The accumulation A(x) = ∫ from 0 to x, and the integrand f. A′ = f is the whole point. */
export function accumFnAt(fn: "const" | "line" | "square" | "shifted", x: number): number {
  return fn === "const" ? 3 : fn === "line" ? 2 * x : fn === "square" ? x * x : x - 2;
}
export function accumAreaAt(fn: "const" | "line" | "square" | "shifted", x: number): number {
  return fn === "const" ? 3 * x : fn === "line" ? x * x : fn === "square" ? (x * x * x) / 3 : (x * x) / 2 - 2 * x;
}

/** The three regions C5 slices, and what a slice of each is WORTH. One helper, so the picture the
 * learner sees and the number the grader checks can never disagree.
 *   areaBetween: y = x above y = x² on [0, 1]      → exact area 1/6
 *   disc:        y = x on [0, 2], revolved         → exact volume 8π/3 (a cone)
 *   washer:      y = x outside, y = x² inside      → exact volume 2π/15
 */
export type SliceMode = "areaBetween" | "disc" | "washer" | "sector";
export function sliceInterval(mode: SliceMode): [number, number] {
  if (mode === "disc") return [0, 2];
  if (mode === "sector") return [0, Math.PI / 2]; // θ, not x — the slices are wedges
  return [0, 1];
}
/** What one slice at x is worth, per unit thickness. Height for an area; πr² (or π(R²−r²)) for a volume. */
export function sliceMeasure(mode: SliceMode, x: number): number {
  if (mode === "areaBetween") return x - x * x;
  if (mode === "disc") return Math.PI * x * x;
  // A polar slice is a thin TRIANGLE, not a rectangle: its area is ½r²·dθ, and that ½ is the whole
  // difference between this and every other integral in the course. r = 2cos θ here (a circle).
  if (mode === "sector") return 0.5 * Math.pow(2 * Math.cos(x), 2);
  return Math.PI * (x * x - x * x * x * x);
}
export function sliceExact(mode: SliceMode): number {
  if (mode === "areaBetween") return 1 / 6;
  if (mode === "disc") return (8 * Math.PI) / 3;
  if (mode === "sector") return Math.PI / 2; // ∫₀^{π/2} 2cos²θ dθ — and it IS a half-disc of radius 1
  return (2 * Math.PI) / 15;
}
export function sliceEstimate(
  mode: SliceMode,
  n: number,
  rule: "left" | "right" | "mid"
): number {
  const [a, b] = sliceInterval(mode);
  const h = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const xl = a + i * h;
    // The midpoint rule is not a luxury here: both of these regions pinch to zero at BOTH ends, so
    // left and right sums can only ever UNDERSHOOT. Without a rule that can overshoot, the
    // "too big" feedback path could never fire — dead feedback — and the cone could not be brought
    // inside a usable tolerance at all.
    const x = rule === "left" ? xl : rule === "right" ? xl + h : xl + h / 2;
    s += sliceMeasure(mode, x) * h;
  }
  return s;
}

/** The slope a differential equation prescribes at a point — the instruction the field draws.
 * Exported so the segments the learner sees and the curve that threads through them are computed
 * from the SAME equation, and can never disagree. */
export function fieldSlope(
  equation: "linear" | "exponential" | "decay" | "logistic",
  x: number,
  y: number
): number {
  if (equation === "linear") return x;
  if (equation === "exponential") return 0.5 * y;
  if (equation === "decay") return -0.5 * y;
  // k = 1.8 (not 0.6): at the slower rate the curve does not visibly REACH the ceiling inside the
  // plotted window, and the whole point of the lesson — that every solution runs to y = 4 — would be
  // invisible. Verified numerically before a single lesson was written.
  return 1.8 * y * (1 - y / 4);
}

/** The two functions taylorApprox expands about 0, their partial sums, and one term of the series.
 * Exported so the curve the learner sees and the number the grader checks cannot drift apart. */
export function taylorFn(fn: "exp" | "geometric", x: number): number {
  return fn === "exp" ? Math.exp(x) : 1 / (1 - x);
}
export function taylorTerm(fn: "exp" | "geometric", k: number, x: number): number {
  if (fn === "exp") {
    let fact = 1;
    for (let i = 2; i <= k; i++) fact *= i;
    return Math.pow(x, k) / fact;
  }
  return Math.pow(x, k);
}
export function taylorPartial(fn: "exp" | "geometric", n: number, x: number): number {
  let s = 0;
  for (let k = 0; k <= n; k++) s += taylorTerm(fn, k, x);
  return s;
}

function angleAt(a: readonly [number, number], b: readonly [number, number], c: readonly [number, number]): number {
  const ux=b[0]-a[0], uy=b[1]-a[1], vx=c[0]-a[0], vy=c[1]-a[1];
  const den=Math.hypot(ux,uy)*Math.hypot(vx,vy);
  return Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy)/den)))*180/Math.PI;
}

export function evaluate(spec: TWidget, value: unknown): EvalResult {
  switch (spec.type) {
    /**
     * numberLineRay (S215) — graded on the SOLUTION SET, not on the writing. `\u22122x \u2265 \u22126` and
     * `x \u2264 3` are the same claim about x, so both are correct for a target of `x \u2264 3`: this engine
     * teaches that they are the same claim, and a grader that insisted on one written form would be
     * teaching the opposite. The graded facts are the three the learner controls \u2014 where the
     * endpoint sits, whether it belongs, and which way the ray runs \u2014 and the diagnosis names
     * which of the three is not right yet WITHOUT naming the value it should be.
     *
     * The solved form comes from the engine's own `deriveSolution`, so the sentence the grader says
     * and the sentence the picture says are one computation.
     */
    case "numberLineRay": {
      const held = numberLineRayClaim(value);
      if (!held) return { correct: false, feedback: "Set the endpoint, the dot and the arrow, then check." };
      if (!spec.target)
        return { correct: false, feedback: spec.fallbackFeedback ?? "This number line has no single target set to check against." };
      const mine = numberLineRaySolved(held, spec.variable);
      const target = numberLineRaySolved(spec.target, spec.variable);
      const tail = spec.fallbackFeedback ? ` ${spec.fallbackFeedback}` : "";
      if (!mine || !target)
        return {
          correct: false,
          feedback: `Your saved relation holds numbers this line can no longer draw exactly. Step back with Undo, or reset the line, and build the set again.${tail}`
        };
      const sameSet = numberLineRaySameSolutionSet(held, spec.target);
      if (sameSet && (spec.requireSolvedForm !== true || mine.solved))
        return { correct: true, feedback: spec.successFeedback ?? "" };
      if (sameSet) {
        /* RIGHT SET, WRONG FORM — and it must be caught HERE, above the three fact diagnoses.
         * It is reachable in two presses of one transform (`−2x > −8` scaled twice by −1/2 is
         * `(−1/2)x > −2`, whose set is still `x < 4`), and every branch below would be FALSE of
         * it: the endpoint, the direction and the endpoint's membership are all already right.
         * Naming one of them as "the part that is not right yet" is exactly the defect class
         * this programme keeps catching. */
        return {
          correct: false,
          feedback:
            `Your line already shows the right set of numbers, and every move you make from here has to keep it there. ` +
            `The inequality still reads ${mine.written}, so ${spec.variable} is not standing on its own yet.${tail}`
        };
      }
      if (mine.boundaryText !== target.boundaryText)
        return { correct: false, feedback: `Your line shows ${mine.text}, so its endpoint sits at ${mine.boundaryText}. The endpoint is the part that is not right yet.${tail}` };
      if (mine.direction !== target.direction)
        return {
          correct: false,
          feedback: `Your line shows ${mine.text}, so it runs toward the ${mine.direction === "greater" ? "larger" : "smaller"} numbers. Which way the ray runs is the part that is not right yet.${tail}`
        };
      return {
        correct: false,
        feedback: `Your line shows ${mine.text}, so ${mine.boundaryText} ${mine.inclusive ? "counts as a solution" : "is left out"}. Whether the endpoint itself belongs is the part that is not right yet.${tail}`
      };
    }
    case "mcq": {
      const opt = spec.options.find((o) => o.id === value);
      if (!opt) return { correct: false, feedback: "Pick an answer, then check." };
      return { correct: !!opt.correct, feedback: opt.feedback };
    }
    case "numeric": {
      const v = typeof value === "number" ? value : NaN;
      if (Number.isNaN(v)) return { correct: false, feedback: "Type a number, then check." };
      if (Math.abs(v - spec.answer) <= spec.tolerance)
        return { correct: true, feedback: spec.successFeedback ?? "" };
      const ce = spec.commonErrors.find((e) => e.value === v);
      return { correct: false, feedback: ce ? ce.feedback : spec.fallbackFeedback };
    }
    case "fractionEntry": {
      // Graded on the exact rational VALUE (integer cross-multiplication — no floats),
      // with per-VALUE misconception traps, then the form check when the prompt
      // demands lowest terms or a mixed number (right value, wrong form → formFeedback).
      const v = value as { sign?: number; whole: number; num: number; den: number } | null | undefined;
      if (!v || typeof v.num !== "number" || typeof v.den !== "number" || v.den < 1)
        return { correct: false, feedback: "Type the fraction, then check." };
      const whole = typeof v.whole === "number" ? v.whole : 0;
      const vSign = v.sign === -1 ? -1 : 1;
      const lhs = vSign * (whole * v.den + v.num) * spec.answerDen;
      const rhs = spec.answerSign * (spec.answerWhole * spec.answerDen + spec.answerNum) * v.den;
      if (lhs === rhs) {
        const formOk =
          spec.form === "any" ||
          (spec.form === "lowestTerms" && (v.num === 0 || gcd(v.num, v.den) === 1)) ||
          (spec.form === "mixed" && v.num >= 1 && v.num < v.den && gcd(v.num, v.den) === 1);
        if (formOk) return { correct: true, feedback: spec.successFeedback ?? "" };
        return { correct: false, feedback: spec.formFeedback ?? spec.fallbackFeedback };
      }
      const trap = spec.commonEntries.find(
        (t) => vSign * (whole * v.den + v.num) * t.den === (t.sign === -1 ? -1 : 1) * (t.whole * t.den + t.num) * v.den
      );
      return { correct: false, feedback: trap ? trap.feedback : spec.fallbackFeedback };
    }
    case "placeCompare": {
      // Graded on the chosen relation symbol; each wrong symbol carries its authored diagnosis.
      const v = value as string | null | undefined;
      if (v !== "lt" && v !== "eq" && v !== "gt")
        return { correct: false, feedback: "Pick <, =, or >, then check." };
      if (v === spec.answer) return { correct: true, feedback: spec.successFeedback };
      const fb = v === "lt" ? spec.ltFeedback : v === "eq" ? spec.eqFeedback : spec.gtFeedback;
      return { correct: false, feedback: fb ?? "" };
    }
    case "rationalCompare": {
      // Same statement-frame grading as placeCompare: the chosen relation symbol,
      // each wrong symbol carrying its authored diagnosis.
      const v = value as string | null | undefined;
      if (v !== "lt" && v !== "eq" && v !== "gt")
        return { correct: false, feedback: "Pick <, =, or >, then check." };
      if (v === spec.answer) return { correct: true, feedback: spec.successFeedback };
      const fb = v === "lt" ? spec.ltFeedback : v === "eq" ? spec.eqFeedback : spec.gtFeedback;
      return { correct: false, feedback: fb ?? "" };
    }
    case "pointEntry": {
      // Graded on the exact ordered integer TUPLE, with per-tuple misconception traps.
      const v = value as number[] | null | undefined;
      if (!Array.isArray(v) || v.length !== spec.answer.length || v.some((x) => typeof x !== "number" || Number.isNaN(x)))
        return { correct: false, feedback: "Fill in every coordinate, then check." };
      const eq = (a: number[], b: number[]) => a.every((x, i) => x === b[i]);
      if (eq(v, spec.answer)) return { correct: true, feedback: spec.successFeedback ?? "" };
      const trap = spec.commonEntries.find((t) => t.values.length === v.length && eq(v, t.values));
      return { correct: false, feedback: trap ? trap.feedback : spec.fallbackFeedback };
    }
    case "lineExplore": {
      const val = value as { m: number; b: number } | null | undefined;
      if (!val || typeof val.m !== "number" || typeof val.b !== "number")
        return { correct: false, feedback: "Set the slope and intercept, then check." };
      if (val.m === spec.targetSlope && val.b === spec.targetIntercept)
        return { correct: true, feedback: spec.successFeedback };
      if (val.m !== spec.targetSlope) return { correct: false, feedback: spec.slopeFeedback };
      return { correct: false, feedback: spec.interceptFeedback };
    }
    case "fractionBar": {
      const v = value as { n: number; d: number } | null | undefined;
      if (!v || typeof v.n !== "number" || typeof v.d !== "number" || v.d === 0)
        return { correct: false, feedback: "Set a fraction with the sliders, then check." };
      const lhs = v.n * spec.targetDen, rhs = v.d * spec.targetNum;
      if (lhs === rhs) return { correct: true, feedback: spec.successFeedback };
      // Per-value traps first (the EXACT build, e.g. "you made 1/4"), then the
      // direction-generic low/high fallbacks. Equivalents of a trap fall through:
      // the trap diagnoses a specific build, not its value class.
      const trap = spec.commonFractions.find((t) => t.num === v.n && t.den === v.d);
      if (trap) return { correct: false, feedback: trap.feedback };
      return lhs < rhs
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "quadraticExplore": {
      if (spec.form === "roots") {
        const rv = value as { a?: number; r1?: number; r2?: number } | null | undefined;
        if (!rv || typeof rv.a !== "number" || typeof rv.r1 !== "number" || typeof rv.r2 !== "number")
          return { correct: false, feedback: "Set the leading coefficient and both roots, then check." };
        // The roots are a SET: (x - 2)(x - 3) and (x - 3)(x - 2) are the same parabola, and marking
        // one wrong would teach a distinction that does not exist.
        const got = [rv.r1, rv.r2].sort((x, y) => x - y).join(",");
        const want = [spec.targetR1 ?? 0, spec.targetR2 ?? 0].sort((x, y) => x - y).join(",");
        if (rv.a === spec.targetA && got === want) return { correct: true, feedback: spec.successFeedback };
        if (rv.a !== spec.targetA) return { correct: false, feedback: spec.shapeFeedback };
        return { correct: false, feedback: spec.vertexFeedback };
      }
      const v = value as { a: number; h: number; k: number } | null | undefined;
      if (!v || typeof v.a !== "number" || typeof v.h !== "number" || typeof v.k !== "number")
        return { correct: false, feedback: "Set a, h, and k, then check." };
      if (v.a === spec.targetA && v.h === spec.targetH && v.k === spec.targetK)
        return { correct: true, feedback: spec.successFeedback };
      if (v.a !== spec.targetA) return { correct: false, feedback: spec.shapeFeedback };
      return { correct: false, feedback: spec.vertexFeedback };
    }
    case "unitCircleExplore": {
      const v = value as { angle: number; choice?: string; dials?: Record<string, number> } | null | undefined;
      if (!v || typeof v.angle !== "number") return { correct: false, feedback: "Drag the angle, then check." };
      // Dial-matching wave: every dial must sit on its target; the first wrong one is diagnosed
      // with its own authored feedback, most specific first.
      if (spec.dials) {
        const cur = v.dials ?? {};
        for (const d of spec.dials) {
          const val = cur[d.param] ?? d.start;
          if (Math.abs(val - d.target) > 1e-9) return { correct: false, feedback: d.feedback };
        }
        return { correct: true, feedback: spec.successFeedback };
      }
      // Feature hunt: the drag must land the trace on the named feature. Truth is re-derived by
      // the same shared function the renderer draws with, so screen and grade cannot disagree.
      if (spec.targetFeature && spec.trace) {
        const f = spec.targetFeature;
        if (Math.abs(v.angle - f.x) <= f.tol) return { correct: true, feedback: spec.successFeedback };
        return v.angle < f.x
          ? { correct: false, feedback: spec.lowFeedback }
          : { correct: false, feedback: spec.highFeedback };
      }
      // Ghost with selectable formulas: an impostor selection is diagnosed by ITS feedback (the
      // detachment the learner watched), ahead of any angle diagnosis.
      if (spec.ghostChoices && spec.ghost) {
        const chosen = spec.ghostChoices.find((c) => c.id === v.choice);
        if (!chosen) return { correct: false, feedback: "Pick a formula for the second point, then check." };
        if (!UC_TRUE_FORMULAS.has(chosen.id))
          return { correct: false, feedback: chosen.feedback ?? spec.lowFeedback };
        if (v.angle === spec.targetAngle) return { correct: true, feedback: spec.successFeedback };
        return v.angle < spec.targetAngle
          ? { correct: false, feedback: spec.lowFeedback }
          : { correct: false, feedback: spec.highFeedback };
      }
      if (v.angle === spec.targetAngle) return { correct: true, feedback: spec.successFeedback };
      return v.angle < spec.targetAngle
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "systemsExplore": {
      const v = value as
        | { x: number; y: number; lines?: { m1: number; b1: number; m2: number; b2: number } }
        | null
        | undefined;
      if (!v || typeof v.x !== "number" || typeof v.y !== "number") return { correct: false, feedback: "Place the point, then check." };

      // ── S213: LINES THE LEARNER HAS MOVED. Gated on the spec enabling editing AND the value
      // carrying the envelope, so a spec without `editLine1`/`editLine2` — which is all five
      // authored instances — never enters here and is graded by the four lines below, unchanged.
      //
      // The claim is "this point solves the system", and with movable lines that has to be read
      // against the lines AS THEY NOW STAND, not as they were authored (`systemsPairAdapter.ts`
      // says the same thing beside `systemsPointOn`).
      //
      // THE DEGENERATE CASE, decided conservatively. Equal rates means the system has no unique
      // solution: parallel lines never meet, coincident lines meet everywhere. Both are graded
      // INCORRECT. That is the conservative reading in the exact sense that matters — a learner
      // must not be able to be marked right by destroying the question, and the coincident case is
      // where that bites, because every point on the line is then genuinely on "both" lines and a
      // naive on1 && on2 would hand out `successFeedback` for collapsing the system. It is also
      // the reading the engine already assumes elsewhere: `correctAnswerText` divides by
      // (m1 − m2), so a degenerate system has no answer to name.
      //
      // THE MESSAGE (S212 review, condition 1b). A destroyed system gets the author's own words:
      // `degenerateSystemFeedback` is required by `systemsExploreEditErrors` of any spec that opens
      // a line, so for every VALID editable spec it is present. The old off-line chain survives
      // only as the impossible-state fallback — a spec that reached here without it never passed
      // the integrity gate, and borrowing a sentence about the wrong line is still better than
      // saying nothing.
      if ((spec.editLine1 || spec.editLine2) && v.lines) {
        const { m1, b1, m2, b2 } = v.lines;
        const on1 = v.y === m1 * v.x + b1;
        const on2 = v.y === m2 * v.x + b2;
        if (m1 === m2)
          return {
            correct: false,
            feedback: spec.degenerateSystemFeedback ?? (on1 ? spec.offLine2Feedback : spec.offLine1Feedback),
          };
        if (on1 && on2) return { correct: true, feedback: spec.successFeedback };
        if (on1 && !on2) return { correct: false, feedback: spec.offLine2Feedback };
        return { correct: false, feedback: spec.offLine1Feedback };
      }

      const on1 = v.y === spec.m1 * v.x + spec.b1;
      const on2 = v.y === spec.m2 * v.x + spec.b2;
      if (on1 && on2) return { correct: true, feedback: spec.successFeedback };
      if (on1 && !on2) return { correct: false, feedback: spec.offLine2Feedback };
      return { correct: false, feedback: spec.offLine1Feedback };
    }
    case "numberLinePlace": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Drag the marker, then check." };
      if (Math.abs(v - spec.target) < 1e-9) return { correct: true, feedback: spec.successFeedback };
      // Per-value misconception landings before the direction-generic fallbacks
      // (e.g. "placed 1/6 at the sixth mark — that's 6/6 = 1").
      const landing = spec.commonPlacements.find((p) => Math.abs(p.value - v) < 1e-9);
      if (landing) return { correct: false, feedback: landing.feedback };
      return v < spec.target
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "functionMachine": {
      const val = value as { input: number } | null | undefined;
      if (!val || typeof val.input !== "number") return { correct: false, feedback: "Set an input, then check." };
      // Read from the shared wiring function so the grader cannot disagree with the diagram about
      // what the machines produce — including the compose ORDER, which is the whole lesson.
      const out = fmOutput(val.input, spec.a, spec.b, spec.square, spec.stage2, spec.join);
      if (out === spec.targetOutput) return { correct: true, feedback: spec.successFeedback };
      return out < spec.targetOutput
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "probabilityArea": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Shade some cells, then check." };
      const total = spec.rows * spec.cols;
      const lhs = v * spec.targetDen, rhs = total * spec.targetNum;
      if (lhs === rhs) return { correct: true, feedback: spec.successFeedback };
      return lhs < rhs
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "hundredthsGrid": {
      // Graded on the exact TOTAL shaded count (prefilled included) — the count IS the decimal.
      // Named misconception counts first (tenths read as hundredths and its reverse), then the
      // direction-generic fallbacks, mirroring numberLinePlace's landing order.
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Shade some cells, then check." };
      if (v === spec.target) return { correct: true, feedback: spec.successFeedback };
      const cc = spec.commonCounts.find((c) => c.count === v);
      if (cc) return { correct: false, feedback: cc.feedback };
      return v < spec.target
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "transformExplore": {
      const v = value as { dx: number; dy: number; reflect: Reflect } | null | undefined;
      if (!v || typeof v.dx !== "number") return { correct: false, feedback: "Move the shape, then check." };
      const moved = spec.shape.map(([x, y]) => transformPoint(x, y, v.dx, v.dy, v.reflect));
      const ms = sortVerts(moved), gs = sortVerts(spec.target.map(([x, y]) => [x, y] as [number, number]));
      if (vertsEqual(ms, gs)) return { correct: true, feedback: spec.successFeedback };
      if (ms.length === gs.length) {
        const ox = gs[0][0] - ms[0][0], oy = gs[0][1] - ms[0][1];
        if (ms.every((p, i) => p[0] + ox === gs[i][0] && p[1] + oy === gs[i][1]))
          return { correct: false, feedback: spec.offsetFeedback };
      }
      return { correct: false, feedback: spec.reflectFeedback };
    }
    case "angleMeasure": {
      const v = value as { angle: number } | null | undefined;
      if (!v || typeof v.angle !== "number") return { correct: false, feedback: "Open the angle, then check." };
      if (v.angle === spec.targetAngle) return { correct: true, feedback: spec.successFeedback };
      const common = (spec.commonAngles ?? []).find((entry) => entry.angle === v.angle);
      if (common) return { correct: false, feedback: common.feedback };
      return v.angle < spec.targetAngle
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "rotationLab": {
      const v = value as { angle: number } | null | undefined;
      if (!v || typeof v.angle !== "number") return { correct: false, feedback: "Turn the shape, then check." };
      if (v.angle === spec.targetAngle) return { correct: true, feedback: spec.successFeedback };
      const hit = (spec.commonTurns ?? []).find((t) => t.angle === v.angle);
      if (hit) return { correct: false, feedback: hit.feedback };
      return v.angle < spec.targetAngle
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "dilationExplore": {
      const v = value as { k: number } | null | undefined;
      if (!v || typeof v.k !== "number") return { correct: false, feedback: "Set the scale factor, then check." };
      if (Math.abs(v.k - spec.targetK) < 1e-9) return { correct: true, feedback: spec.successFeedback };
      return v.k < spec.targetK
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "barBuilder": {
      const v = value as number[] | null | undefined;
      if (!Array.isArray(v) || v.length !== spec.target.length) return { correct: false, feedback: "Set the bars, then check." };
      if (v.every((h, i) => h === spec.target[i])) return { correct: true, feedback: spec.successFeedback };
      return { correct: false, feedback: spec.partialFeedback };
    }
    case "dotPlot": {
      const v = value as number[] | null | undefined;
      // READ mode: the plot is authored; the learner marks dots to count the asked stack.
      if (spec.given && spec.askIndex !== undefined) {
        if (!Array.isArray(v) || v.length !== spec.given.length)
          return { correct: false, feedback: "Tap the X's you are counting, then check." };
        const ask = spec.askIndex;
        const askLabel = dotPlotLabel(spec.values[ask], spec.denominator);
        const marked = v.reduce((a, c) => a + c, 0);
        if (v[ask] === spec.given[ask] && marked === spec.given[ask])
          return { correct: true, feedback: spec.successFeedback };
        // Whole plot marked — counted the total instead of one stack.
        if (v.every((c, i) => c === (spec.given as number[])[i]))
          return {
            correct: false,
            feedback: `That marks every X on the plot — the total, ${marked}. The question asks for one stack: the X's above ${askLabel}.`
          };
        // Exactly one OTHER stack fully marked, nothing else — counted the wrong stack.
        const full = v.map((c, i) => c > 0 && c === (spec.given as number[])[i]);
        const j = full.findIndex((f, i) => f && i !== ask);
        if (j >= 0 && marked === (spec.given as number[])[j] )
          return {
            correct: false,
            feedback: `You counted the ${spec.given[j]} X's above ${dotPlotLabel(spec.values[j], spec.denominator)} — the question asks about the stack above ${askLabel}.`
          };
        // Partial mark of the right stack, nothing else.
        if (v[ask] > 0 && marked === v[ask] && v[ask] < spec.given[ask])
          return {
            correct: false,
            feedback: `You've marked ${v[ask]} of the ${spec.given[ask]} X's above ${askLabel} — count the whole stack.`
          };
        return { correct: false, feedback: spec.partialFeedback };
      }
      if (!Array.isArray(v) || v.length !== spec.target.length) return { correct: false, feedback: "Add dots, then check." };
      if (v.every((c, i) => c === spec.target[i])) return { correct: true, feedback: spec.successFeedback };
      return { correct: false, feedback: spec.partialFeedback };
    }
    case "boxPlot": {
      const v = value as { min: number; q1: number; med: number; q3: number; max: number } | null | undefined;
      if (!v || typeof v.min !== "number") return { correct: false, feedback: "Set the five values, then check." };
      if (v.min === spec.targetMin && v.q1 === spec.targetQ1 && v.med === spec.targetMed && v.q3 === spec.targetQ3 && v.max === spec.targetMax)
        return { correct: true, feedback: spec.successFeedback };
      const ordered = v.min <= v.q1 && v.q1 <= v.med && v.med <= v.q3 && v.q3 <= v.max;
      return ordered ? { correct: false, feedback: spec.valueFeedback } : { correct: false, feedback: spec.orderFeedback };
    }
    case "compoundEventLab": {
      if (typeof value !== "string") return { correct: false, feedback: "Choose a claim, then check." };
      const choice = spec.choices.find((candidate) => candidate.id === value);
      if (!choice) return { correct: false, feedback: "Choose a claim, then check." };
      return compoundEventChoiceCorrect(spec, choice)
        ? { correct: true, feedback: choice.feedback || spec.successFeedback }
        : { correct: false, feedback: choice.feedback || spec.fallbackFeedback };
    }
    case "compositeAreaLab": {
      if (typeof value !== "string") return { correct: false, feedback: "Choose one of the shown area claims, then check." };
      const choice = spec.choices.find((candidate) => candidate.id === value);
      if (!choice) return { correct: false, feedback: "Choose one of the shown area claims, then check." };
      return compositeAreaChoiceCorrect(spec, choice)
        ? { correct: true, feedback: spec.successFeedback }
        : { correct: false, feedback: choice.feedback || spec.fallbackFeedback };
    }
    case "scaledCircleLab": {
      if (typeof value !== "string") return { correct: false, feedback: "Choose one of the shown circle claims, then check." };
      const choice = spec.choices.find((candidate) => candidate.id === value);
      if (!choice) return { correct: false, feedback: "Choose one of the shown circle claims, then check." };
      return scaledCircleChoiceCorrect(spec, choice)
        ? { correct: true, feedback: spec.successFeedback }
        : { correct: false, feedback: choice.feedback || spec.fallbackFeedback };
    }
    case "percentChangeLab": {
      if (typeof value !== "string") return { correct: false, feedback: "Choose one of the shown price claims, then check." };
      const choice = spec.choices.find((candidate) => candidate.id === value);
      if (!choice) return { correct: false, feedback: "Choose one of the shown price claims, then check." };
      return percentChangeChoiceCorrect(spec, choice)
        ? { correct: true, feedback: spec.successFeedback }
        : { correct: false, feedback: choice.feedback || spec.fallbackFeedback };
    }
    case "equationOutcomeLab": {
      if (spec.mode === "classify") {
        if (typeof value !== "string") return { correct: false, feedback: "Choose one of the shown equation outcomes, then check." };
        const choice = spec.choices.find((candidate) => candidate.id === value);
        if (!choice) return { correct: false, feedback: "Choose one of the shown equation outcomes, then check." };
        return equationOutcomeChoiceCorrect(spec, choice)
          ? { correct: true, feedback: spec.successFeedback }
          : { correct: false, feedback: choice.feedback || spec.fallbackFeedback };
      }
      const state=value&&typeof value==="object"&&!Array.isArray(value)?value as {stageIds?:string[];numeric?:number|""}:{};
      const ids=Array.isArray(state.stageIds)?state.stageIds:[];
      if(ids.length<spec.requiredMoves)return{correct:false,feedback:spec.explorationFeedback};
      if(ids.length!==spec.correctOrder.length)return{correct:false,feedback:"Apply every operation before checking."};
      const mismatch=ids.findIndex((id,index)=>id!==spec.correctOrder[index]);
      if(mismatch>=0){const operation=spec.operations.find(candidate=>candidate.id===ids[mismatch]);return{correct:false,feedback:operation?.feedback||spec.fallbackFeedback}}
      if(spec.answerMode==="sequence")return{correct:true,feedback:spec.successFeedback};
      const truth=equationTransformTruth(spec);
      if(typeof state.numeric!=="number"||!Number.isFinite(state.numeric))return{correct:false,feedback:`Enter the boundary value for ${spec.variable}, then check.`};
      if(truth.answerNumber!==undefined&&Math.abs(state.numeric-truth.answerNumber)<=spec.tolerance)return{correct:true,feedback:spec.successFeedback};
      const common=spec.numericErrors.find(error=>Math.abs(error.value-(state.numeric as number))<=spec.tolerance);
      return{correct:false,feedback:common?.feedback||spec.fallbackFeedback};
    }
    case "signedFractionLab": {
      if (typeof value !== "string") return { correct: false, feedback: "Choose one of the shown signed-fraction claims, then check." };
      const choice = spec.choices.find((candidate) => candidate.id === value);
      if (!choice) return { correct: false, feedback: "Choose one of the shown signed-fraction claims, then check." };
      return signedFractionChoiceCorrect(spec, choice)
        ? { correct: true, feedback: spec.successFeedback }
        : { correct: false, feedback: choice.feedback || spec.fallbackFeedback };
    }
    case "triangleClosureLab": {
      const state = value as { choice?: string } | null | undefined;
      if (!state?.choice) return { correct: false, feedback: "Explore the hinge and choose a frame claim, then check." };
      const choice = spec.choices.find((candidate) => candidate.id === state.choice);
      if (!choice) return { correct: false, feedback: "Choose one of the shown frame claims, then check." };
      return triangleClosureChoiceCorrect(spec, choice)
        ? { correct: true, feedback: spec.successFeedback }
        : { correct: false, feedback: choice.feedback || spec.fallbackFeedback };
    }
    case "trialProbabilityLab": {
      if (typeof value !== "string") return { correct: false, feedback: "Choose one of the shown fractions, then check." };
      const choice = spec.choices.find((candidate) => candidate.id === value);
      if (!choice) return { correct: false, feedback: "Choose one of the shown fractions, then check." };
      return trialProbabilityEquivalent(spec, choice)
        ? { correct: true, feedback: spec.successFeedback }
        : { correct: false, feedback: choice.feedback ?? spec.fallbackFeedback };
    }
    case "distributionCompareLab": {
      if (spec.mode === "measure") {
        if (typeof value !== "number" || !spec.measureChoices.some((c) => c.value === value))
          return { correct: false, feedback: "Choose one of the shown gap measurements, then check." };
        if (spec.answer !== undefined && Math.abs(value - spec.answer) <= spec.tolerance)
          return { correct: true, feedback: spec.successFeedback };
        const choice = spec.measureChoices.find((c) => c.value === value);
        return { correct: false, feedback: choice?.feedback ?? spec.fallbackFeedback ?? "Compare the mean gap with one variability-width." };
      }
      if (typeof value !== "string") return { correct: false, feedback: "Choose a conclusion, then check." };
      const option = spec.judgeOptions.find((o) => o.id === value);
      if (!option) return { correct: false, feedback: "Choose a conclusion, then check." };
      return option.correct
        ? { correct: true, feedback: option.feedback }
        : { correct: false, feedback: option.feedback };
    }
    case "areaModel": {
      if (spec.countGrid) {
        const count = typeof value === "number" ? value : null;
        if (count === null) return { correct: false, feedback: "Count some squares, then check." };
        if (count === spec.targetArea) return { correct: true, feedback: spec.successFeedback };
        const common = spec.commonCounts.find((entry) => entry.count === count);
        if (common) return { correct: false, feedback: common.feedback };
        return { correct: false, feedback: count < spec.targetArea ? spec.lowFeedback : spec.highFeedback };
      }
      const v = value as { w: number; h: number } | null | undefined;
      if (!v || typeof v.w !== "number") return { correct: false, feedback: "Set width and height, then check." };
      const area = v.w * v.h;
      if (area === spec.targetArea) {
        // S116: when the lesson is about WHICH factoring, hitting the area is necessary but not
        // sufficient. Either orientation counts — a rotated rectangle is the same factoring.
        const rf = spec.requireFactors;
        if (rf && !((v.w === rf.w && v.h === rf.h) || (v.w === rf.h && v.h === rf.w)))
          return { correct: false, feedback: spec.factorFeedback ?? spec.highFeedback };
        return { correct: true, feedback: spec.successFeedback };
      }
      return area < spec.targetArea
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "placeValue": {
      const v = value as { h: number; t: number; o: number } | null | undefined;
      if (!v || typeof v.h !== "number") return { correct: false, feedback: "Add blocks, then check." };
      const total = 100 * v.h + 10 * v.t + v.o;
      if (total === spec.target) return { correct: true, feedback: spec.successFeedback };
      return total < spec.target
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "clockSet": {
      const v = value as { hour: number; minute: number } | null | undefined;
      if (!v || typeof v.hour !== "number") return { correct: false, feedback: "Set the hands, then check." };
      const hourOk = v.hour === spec.targetHour;
      const minOk = v.minute === spec.targetMinute;
      if (hourOk && minOk) return { correct: true, feedback: spec.successFeedback };
      return minOk || !hourOk
        ? { correct: false, feedback: spec.hourFeedback }
        : { correct: false, feedback: spec.minuteFeedback };
    }
    case "inversePipeline": {
      // Graded on the exact ordered track. The two named misconceptions are checked BEFORE the
      // generic miss, and both are checked structurally rather than by comparing strings: a learner
      // who reversed the chain but left one operation un-inverted has done something specific, and
      // saying so is the only reason this engine exists.
      const built = Array.isArray(value) ? (value as string[]) : [];
      if (built.length === 0) return { correct: false, feedback: "Build the inverse, then check." };
      if (built.join("|") === spec.answer.join("|"))
        return { correct: true, feedback: spec.successFeedback };
      const card = (id: string) => spec.tray.find((t) => t.id === id);
      const FLIP = { add: "sub", sub: "add", mul: "div", div: "mul" } as const;
      const placed = built.map(card);
      if (placed.some((c) => c === undefined) || placed.length !== spec.forward.length)
        return { correct: false, feedback: spec.missFeedback };
      const ops = placed as Array<{ op: "add" | "sub" | "mul" | "div"; n: number }>;
      const wanted = [...spec.forward].reverse();
      // Right operations, ORIGINAL order: each placed card inverts the forward step at the SAME
      // index instead of the mirrored one.
      const forwardOrder = spec.forward.every(
        (f, i) => ops[i].op === FLIP[f.op] && ops[i].n === f.n
      );
      if (forwardOrder) return { correct: false, feedback: spec.forwardOrderFeedback };
      // Reversed correctly, but at least one card was not flipped.
      const rightOrderWrongOps = wanted.every((f, i) => ops[i].n === f.n);
      const someUnflipped = wanted.some((f, i) => ops[i].op === f.op);
      if (rightOrderWrongOps && someUnflipped)
        return { correct: false, feedback: spec.unflippedFeedback };
      return { correct: false, feedback: spec.missFeedback };
    }
    case "solveBalance": {
      // The beam is weighed at the TRUE x, which the learner never sees. That single number is what
      // turns "you must do the same to both sides" from a rule into a consequence: any one-sided
      // removal makes L(x) ≠ R and the state is diagnosed as unbalanced, whatever else is going on.
      const st = value as
        | { leftX: number; leftUnits: number; rightUnits: number; groups?: number; partial?: number; rel?: SolveBalanceRel }
        | undefined;
      if (!st) return { correct: false, feedback: "Take tiles away until x stands alone." };
      const rel0: SolveBalanceRel = spec.relation ?? "eq";
      // Weighed at the same point the beam is weighed at, so what the learner watched and what the
      // grader concludes can never come apart.
      const wx = solveBalanceWitness(spec.a, spec.b, spec.c, rel0);
      const groupsLeft = st.groups ?? 0;
      const rel: SolveBalanceRel = st.rel ?? rel0;
      // S208 (Wave 2b) — THE MULTIPLIER'S SIGN TRAVELS WITH EVERY CHIP.
      //
      // `st.groups` counts unopened copies as a MAGNITUDE; the sign lives in `spec.groups.count`,
      // because −5(x + 3) is five copies of −(x + 3), not minus-five copies of +(x + 3). The
      // renderer has always weighed a standing bracket that way (widgets.tsx, and now
      // mmip/solveBalanceModel.ts `solveBalanceWeights`); this grader did not, so for a negative
      // multiplier it read the left pan with the wrong sign and disagreed with the beam the learner
      // was looking at. tse-03-02 (−5(x + 3) = −20) is exactly that lesson: its untouched start sits
      // level on screen and used to be graded `unbalancedFeedback`, which also made
      // `unexpandedFeedback` unreachable there. `gSign` is +1 whenever there are no brackets, so
      // every position with `groups === 0` and every positive multiplier is bit-for-bit unchanged.
      const gSign = spec.groups && spec.groups.count < 0 ? -1 : 1;
      const groupWeight = spec.groups ? groupsLeft * gSign * (spec.groups.x * wx + spec.groups.unit) : 0;
      const L = st.leftX * wx + st.leftUnits + groupWeight;
      // RELEASE BLOCKER FIX (S119). `holds` is the beam's VISUAL state at one witness and is kept
      // for the equation path, but it must never decide an inequality: `2x + 3 > 11` is weighed at
      // x = 5, and a learner claiming `x > 3` also passes 5 > 3. Correctness is now decided by
      // comparing SOLUTION SETS, which is the only thing "equivalent" can mean here.
      // The claim the pans make, with a standing bracket counted at what it WEIGHS — same signed
      // convention as `groupWeight` above, or the solution-set comparison would contradict the beam
      // it is meant to explain.
      const coefX = st.leftX + (spec.groups ? groupsLeft * gSign * spec.groups.x : 0);
      const unitsX = st.leftUnits + (spec.groups ? groupsLeft * gSign * spec.groups.unit : 0);
      const trueSet = solveBalanceSet(spec.a, spec.b, spec.c, rel0);
      const learnerSet = solveBalanceSet(coefX, unitsX, st.rightUnits, rel);
      const sameSet = solveBalanceSetsEqual(trueSet, learnerSet);
      const holds = rel0 === "eq" ? solveBalanceHolds(L, st.rightUnits, rel) : sameSet;
      // Most specific first: a named misconception outranks the generic broken-relation message.
      if (!holds && st.partial === 1 && spec.partialDistributeFeedback)
        return { correct: false, feedback: spec.partialDistributeFeedback };
      // A comparator that is out of step with the transformation actually performed. The sign of
      // leftX/a says whether the pans have been through a negative multiplication: if they have,
      // the comparator SHOULD have turned around, and if they have not, it should not have. Testing
      // that — rather than "would flipping make it true?" — keeps the two inequality wrong-paths
      // genuinely distinct: on a total order the flipped relation almost always holds when the
      // original fails, which would let this branch swallow every one-sided move.
      // A comparator fault is diagnosed specifically: same boundary, wrong direction or wrong
      // strictness. Anything else that changed the set is a broken transformation, which is a
      // different lesson and gets the different message.
      if (rel0 !== "eq" && !sameSet && spec.notFlippedFeedback) {
        const boundaryMatches =
          trueSet.kind === "half" &&
          learnerSet.kind === "half" &&
          trueSet.num === learnerSet.num &&
          trueSet.den === learnerSet.den;
        if (boundaryMatches) return { correct: false, feedback: spec.notFlippedFeedback };
      }
      // "No x left at all" is the most specific state there is, and it must be named before the
      // generic broken-relation message. Under set-equivalence grading a coefficient of zero makes
      // the claim all-x or no-x, which never equals a half-line — so without this the specific
      // diagnosis became unreachable, which the solvability gate caught in tse-04-01/02.
      if (coefX === 0 && groupsLeft === 0) return { correct: false, feedback: spec.missFeedback };
      if (!holds) return { correct: false, feedback: spec.unbalancedFeedback };
      if (groupsLeft > 0)
        return { correct: false, feedback: spec.unexpandedFeedback ?? spec.notIsolatedFeedback };
      if (st.leftX === 1 && st.leftUnits === 0)
        return { correct: true, feedback: spec.successFeedback };
      return { correct: false, feedback: spec.notIsolatedFeedback };
    }
    case "balanceScale": {
      const v = value as { x: number } | null | undefined;
      if (!v || typeof v.x !== "number") return { correct: false, feedback: "Set x, then check." };
      const left = spec.a * v.x + spec.b;
      if (left === spec.c) return { correct: true, feedback: spec.successFeedback };
      return left < spec.c
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "doubleNumberLine": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Set the value, then check." };
      if (Math.abs(v - spec.targetTop) < 1e-9) return { correct: true, feedback: spec.successFeedback };
      return v < spec.targetTop
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "scatterFit": {
      const v = value as { m: number; b: number } | null | undefined;
      if (!v || typeof v.m !== "number") return { correct: false, feedback: "Set the line, then check." };
      const mse = spec.points.reduce((acc, [px, py]) => acc + (py - (v.m * px + v.b)) ** 2, 0) / spec.points.length;
      if (mse <= spec.tolerance) return { correct: true, feedback: spec.successFeedback };
      // Diagnose: is the tilt wrong, or just the height? Try the best intercept for this slope.
      const meanResid = spec.points.reduce((acc, [px, py]) => acc + (py - v.m * px), 0) / spec.points.length;
      const bestMse = spec.points.reduce((acc, [px, py]) => acc + (py - (v.m * px + meanResid)) ** 2, 0) / spec.points.length;
      return bestMse <= spec.tolerance
        ? { correct: false, feedback: spec.offsetFeedback } // slope is fine; line sits too high/low
        : { correct: false, feedback: spec.slopeFeedback }; // no intercept can rescue this tilt
    }
    case "fractionOfSet": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Choose some, then check." };
      const target = (spec.setSize * spec.num) / spec.den;
      if (v === target) return { correct: true, feedback: spec.successFeedback };
      return v < target
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "percentBar": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Set the percent, then check." };
      if (v === spec.targetPercent) return { correct: true, feedback: spec.successFeedback };
      return v < spec.targetPercent
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "feasibleRegionExplore": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Drag the fence, then check." };
      if (v === spec.verticalTarget) return { correct: true, feedback: spec.successFeedback };
      return v < spec.verticalTarget
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "parametricTrace": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Drag t along the path, then check." };
      if (Math.abs(v - spec.targetT) <= spec.tTolerance) return { correct: true, feedback: spec.successFeedback };
      return v < spec.targetT
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "integerChips": {
      const v = value as { pos: number; neg: number } | null | undefined;
      if (!v || typeof v.pos !== "number") return { correct: false, feedback: "Add chips, then check." };
      const sum = v.pos - v.neg;
      if (sum === spec.target) return { correct: true, feedback: spec.successFeedback };
      return sum < spec.target
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "volumeBuilder": {
      if (spec.solid !== "prism") {
        const rv = value as { r?: number; h?: number } | null | undefined;
        if (!rv || typeof rv.r !== "number") return { correct: false, feedback: "Set the radius, then check." };
        const c = roundSolidCoef(spec.solid, rv.r, spec.solid === "sphere" ? 1 : (rv.h ?? 1));
        // Exact comparison against the target coefficient — no rounding anywhere.
        if (c.den === 1 && c.num === spec.targetVolume) return { correct: true, feedback: spec.successFeedback };
        const cb = c.den === 1 ? spec.commonBuilds.find((x) => x.volume === c.num) : undefined;
        if (cb) return { correct: false, feedback: cb.feedback };
        return c.num / c.den < spec.targetVolume
          ? { correct: false, feedback: spec.lowFeedback }
          : { correct: false, feedback: spec.highFeedback };
      }
      const v = value as { l: number; w: number; h: number } | null | undefined;
      if (!v || typeof v.l !== "number") return { correct: false, feedback: "Set the dimensions, then check." };
      const vol = prismVolume(v.l, v.w, v.h, spec.denomL);
      if (vol === spec.targetVolume) return { correct: true, feedback: spec.successFeedback };
      // The whole-unit misconception is checked BEFORE the generic low/high fallback: it is a
      // specific, nameable error (the raw tick count multiplied as if it were whole units), not
      // merely "too big" — and with a fractional edge it is almost always too big, so the generic
      // message would otherwise swallow it.
      if (spec.denomL && v.l * v.w * v.h === spec.targetVolume && spec.wholeUnitFeedback)
        return { correct: false, feedback: spec.wholeUnitFeedback };
      const cb = spec.commonBuilds.find((c) => c.volume === vol);
      if (cb) return { correct: false, feedback: cb.feedback };
      return vol < spec.targetVolume
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "netFold": {
      const v = value as { l: number; w: number; h: number } | null | undefined;
      if (!v || typeof v.l !== "number") return { correct: false, feedback: "Set the dimensions, then check." };
      const sa = 2 * (v.l * v.w + v.l * v.h + v.w * v.h);
      if (sa === spec.targetSurfaceArea) return { correct: true, feedback: spec.successFeedback };
      return sa < spec.targetSurfaceArea
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "ratioTable": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Set the missing value, then check." };
      if (Math.abs(v - spec.targetB) < 1e-9) return { correct: true, feedback: spec.successFeedback };
      return v < spec.targetB
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "elapsedTime": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Set the time that passes, then check." };
      if (v === spec.targetMinutes) return { correct: true, feedback: spec.successFeedback };
      return v < spec.targetMinutes
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "distanceGrid": {
      const v = value as { x: number; y: number } | null | undefined;
      if (!v || typeof v.x !== "number") return { correct: false, feedback: "Move the point, then check." };
      if (v.x === spec.targetPoint[0] && v.y === spec.targetPoint[1]) return { correct: true, feedback: spec.successFeedback };
      return { correct: false, feedback: spec.wrongPointFeedback };
    }
    case "treeDiagram": {
      const v = value as { a: number; b: number } | null | undefined;
      if (!v || typeof v.a !== "number") return { correct: false, feedback: "Set the branches, then check." };
      if (v.a === spec.targetA && v.b === spec.targetB) return { correct: true, feedback: spec.successFeedback };
      const leaves = v.a * v.b;
      return leaves < spec.targetA * spec.targetB
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "spinnerSim": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Shade some sectors, then check." };
      if (v === spec.targetFavourable) return { correct: true, feedback: spec.successFeedback };
      return v < spec.targetFavourable
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "circleAngleExplore": {
      const arc = value as number | null | undefined;
      if (typeof arc !== "number") return { correct: false, feedback: "Set the arc, then check." };
      const shown = circleReadout(spec.mode, arc);
      if (shown === spec.targetAngle) return { correct: true, feedback: spec.successFeedback };
      return shown < spec.targetAngle
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "expLogExplore": {
      const b = value as number | null | undefined;
      if (typeof b !== "number") return { correct: false, feedback: "Set the base, then check." };
      if (Math.abs(b - spec.targetBase) < 1e-9) return { correct: true, feedback: spec.successFeedback };
      const shown = expLogReadout(spec.mode, b, spec.x);
      const goal = expLogReadout(spec.mode, spec.targetBase, spec.x);
      if (shown === null || goal === null) return { correct: false, feedback: spec.lowFeedback };
      return shown < goal
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "secantSlope": {
      const hv = value as number | null | undefined;
      if (typeof hv !== "number") return { correct: false, feedback: "Slide the second point, then check." };
      if (spec.mode === "average" || spec.mode === "rolle") {
        if (Math.abs(hv - spec.targetH) < 1e-9) return { correct: true, feedback: spec.successFeedback };
        return hv < spec.targetH
          ? { correct: false, feedback: spec.lowFeedback }
          : { correct: false, feedback: spec.highFeedback };
      }
      if (hv === 0) return { correct: false, feedback: spec.lowFeedback };
      if (Math.abs(hv) <= spec.targetH + 1e-9) return { correct: true, feedback: spec.successFeedback };
      return { correct: false, feedback: spec.highFeedback };
    }
    case "vectorExplore": {
      const v = value as { vx: number; vy: number } | null | undefined;
      if (!v || typeof v.vx !== "number") return { correct: false, feedback: "Set the vector, then check." };
      if (spec.mode === "add") {
        const sx = spec.ux + v.vx, sy = spec.uy + v.vy;
        if (sx === spec.targetX && sy === spec.targetY)
          return { correct: true, feedback: spec.successFeedback };
        return sx !== spec.targetX
          ? { correct: false, feedback: spec.lowFeedback }
          : { correct: false, feedback: spec.highFeedback };
      }
      const d = dotProduct(spec.ux, spec.uy, v.vx, v.vy);
      if (d === spec.targetDot) return { correct: true, feedback: spec.successFeedback };
      return d < spec.targetDot
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "matrixTransform": {
      const v = value as { a: number; b: number; c: number; d: number } | null | undefined;
      if (!v || typeof v.a !== "number")
        return { correct: false, feedback: "Step the matrix entries, then check." };
      const { ta, tb, tc, td } = spec;
      if (v.a === ta && v.b === tb && v.c === tc && v.d === td)
        return { correct: true, feedback: spec.successFeedback };
      // Column swap: î's image entered where ĵ's belongs (rows/columns confusion).
      if (v.a === tb && v.c === td && v.b === ta && v.d === tc)
        return { correct: false, feedback: spec.swappedFeedback };
      // Off-diagonal sign flip: the same map taken the wrong way round (e.g. rotation direction).
      if ((tb !== 0 || tc !== 0) && v.a === ta && v.d === td && v.b === -tb && v.c === -tc)
        return { correct: false, feedback: spec.signFeedback };
      return { correct: false, feedback: spec.fallbackFeedback };
    }
    case "circleMeasureExplore": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Move the slider, then check." };
      if (spec.mode === "radiusScale") {
        const goalR = spec.targetRadius ?? 0;
        if (v === goalR) return { correct: true, feedback: spec.successFeedback };
        return v < goalR
          ? { correct: false, feedback: spec.lowFeedback }
          : { correct: false, feedback: spec.highFeedback };
      }
      const got = circleMeasureReadout(spec.mode, spec.radius, v);
      const goal = spec.mode === "arcSector" ? spec.targetAngle : spec.targetLength;
      if (Math.abs(got - goal) < 1e-9) return { correct: true, feedback: spec.successFeedback };
      return got < goal
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "polarTrace": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Move the dial, then check." };
      const got = spec.mode === "rose" ? rosePetals(v) : v;
      const goal = spec.mode === "rose" ? spec.targetPetals : spec.targetA;
      if (got === goal) return { correct: true, feedback: spec.successFeedback };
      return got < goal
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "shapeParts": {
      const n = shapePartCount(spec.shape, spec.sides, spec.part);
      const marked = Array.isArray(value) ? (value as unknown[]).filter((v): v is number => typeof v === "number") : null;
      if (!marked || marked.length === 0)
        return { correct: false, feedback: "Tap each one to count it." };
      const distinct = new Set(marked);
      // Every part marked exactly once. A bare number cannot tell a correct total from a
      // double-count plus a miss; a set can.
      if (distinct.size === n && marked.length === n) return { correct: true, feedback: spec.successFeedback };
      if (marked.length !== distinct.size || marked.length > n)
        return { correct: false, feedback: spec.doubleCountFeedback };
      return { correct: false, feedback: spec.missedFeedback };
    }
    case "binomialAreaLab": {
      const v = value as { a?: number; b?: number; moves?: number } | null | undefined;
      if (!v || typeof v.a !== "number" || typeof v.b !== "number")
        return { correct: false, feedback: "Drag the two partitions to lay out the rectangle, then check." };
      if ((v.moves ?? 0) < spec.requiredMoves)
        return { correct: false, feedback: spec.partialFeedback };
      const { pX, qX, targetA, targetB } = spec;
      const hit = v.a === targetA && v.b === targetB;
      // Swapping the two constants is the SAME rectangle turned on its side — but only when the
      // x-coefficients match, since otherwise the swap changes the product.
      const swapped = pX === qX && v.a === targetB && v.b === targetA;
      if (hit || swapped) return { correct: true, feedback: spec.successFeedback };
      // Right magnitudes, wrong signs: the (x − 4)(x − 1) and (x + 6)(x − 6) trap.
      if (Math.abs(v.a) === Math.abs(targetA) && Math.abs(v.b) === Math.abs(targetB))
        return { correct: false, feedback: spec.signFeedback };
      // The add-vs-multiply misconception, reachable as a state: the learner's partitions produce
      // a middle coefficient equal to the PRODUCT of the intended constants.
      const mine = binomialExpand(pX, v.a, qX, v.b);
      if (mine.middle === targetA * targetB && targetA * targetB !== binomialExpand(pX, targetA, qX, targetB).middle)
        return { correct: false, feedback: spec.productMiddleFeedback };
      return { correct: false, feedback: spec.partialFeedback };
    }
    case "extraneousRootLab": {
      const v = value as { pick?: number | null; squared?: boolean; moves?: number } | null | undefined;
      const moves = v?.moves ?? 0;
      // The transformation IS the lesson: an answer given before squaring has skipped the thing
      // being taught, so it is refused before the pick is even looked at.
      if (!v?.squared || moves < spec.requiredMoves)
        return { correct: false, feedback: spec.notSquaredFeedback };
      const pick = typeof v.pick === "number" ? v.pick : null;
      if (pick === null) return { correct: false, feedback: "Pick a candidate on the axis, then check." };
      const want = spec.targetPhase === "identifyPhantom" ? spec.phantomRoot : spec.trueRoot;
      if (want !== null && pick === want) return { correct: true, feedback: spec.successFeedback };
      // Picking the phantom when the true root was asked for is the diagnosis this lab exists for.
      if (spec.phantomRoot !== null && pick === spec.phantomRoot)
        return { correct: false, feedback: spec.phantomPickedFeedback };
      if (pick === spec.trueRoot) return { correct: false, feedback: spec.phantomPickedFeedback };
      return { correct: false, feedback: spec.domainConfusionFeedback };
    }
    case "signChart": {
      const v = value as Array<"+" | "-"> | null | undefined;
      const truth = signChartSigns(spec.roots, spec.leadingPositive, spec.poles);
      if (!Array.isArray(v) || v.length !== truth.length)
        return { correct: false, feedback: "Choose a sign for every interval, then check." };
      const bad = v.findIndex((sgn, i) => sgn !== truth[i]);
      if (bad === -1) return { correct: true, feedback: spec.successFeedback };
      // Did the learner flip across an EVEN cut (a bounce mistaken for a crossing)? Poles count
      // here too: an even-order pole no more flips the sign than an even-order root does.
      const cuts = signChartCuts(spec.roots, spec.poles);
      const flippedAtEven = cuts.some((c, i) => c.mult % 2 === 0 && v[i] !== v[i + 1]);
      return flippedAtEven
        ? { correct: false, feedback: spec.bounceFeedback }
        : { correct: false, feedback: spec.crossFeedback };
    }
    case "sequenceBuild": {
      if (spec.task !== "dial") {
        const state = value && typeof value === "object" && !Array.isArray(value) ? value as { explored?: string[]; numeric?: number | ""; choiceId?: string } : {};
        const truth = sequenceReasoningTruth(spec);
        const valid = new Set(truth.stages.map((stage) => stage.key));
        const explored = Array.isArray(state.explored) ? state.explored.filter((key) => valid.has(key)) : [];
        const exploredSet = new Set(explored);
        if (explored.length < spec.requiredExplorations || !spec.requiredStageKeys.every((key) => exploredSet.has(key))) return { correct: false, feedback: spec.explorationFeedback };
        if (spec.answerMode === "numeric") {
          if (typeof state.numeric !== "number" || !Number.isFinite(state.numeric)) return { correct: false, feedback: "Enter the exact sequence result, then check." };
          if (truth.answerNumber !== undefined && Math.abs(state.numeric - truth.answerNumber) <= spec.tolerance) return { correct: true, feedback: spec.successFeedback };
          const entered = state.numeric;
          const trap = spec.numericErrors.find((error) => Math.abs(error.value - entered) <= spec.tolerance);
          return { correct: false, feedback: trap?.feedback ?? spec.fallbackFeedback };
        }
        if (spec.answerMode === "choice") {
          const choice = spec.choices.find((candidate) => candidate.id === state.choiceId);
          if (!choice) return { correct: false, feedback: "Choose a sequence claim, then check." };
          return choice.claim === truth.answerClaim ? { correct: true, feedback: spec.successFeedback } : { correct: false, feedback: choice.feedback || spec.fallbackFeedback };
        }
        return { correct: false, feedback: spec.fallbackFeedback };
      }
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Set the dial, then check." };
      if (spec.mode === "geometricTerm") {
        const term = geometricTerm(spec.first, v, spec.atPosition);
        if (term === spec.targetTerm) return { correct: true, feedback: spec.successFeedback };
        return term < spec.targetTerm ? { correct: false, feedback: spec.lowFeedback } : { correct: false, feedback: spec.highFeedback };
      }
      if (spec.mode === "arithmetic") {
        const term = spec.first + (spec.atPosition - 1) * v;
        if (term === spec.targetTerm) return { correct: true, feedback: spec.successFeedback };
        return term < spec.targetTerm ? { correct: false, feedback: spec.lowFeedback } : { correct: false, feedback: spec.highFeedback };
      }
      const r = v / 10;
      const sum = spec.first / (1 - r);
      if (Math.abs(sum - spec.targetSum) < 1e-9) return { correct: true, feedback: spec.successFeedback };
      return sum < spec.targetSum ? { correct: false, feedback: spec.lowFeedback } : { correct: false, feedback: spec.highFeedback };
    }
    case "triangleSolve": {
      // ratios mode carries two dials, so its value is an object; sas/sss keep the bare number
      // they have always used.
      if (spec.mode === "ratios") {
        const rv = value as { angle: number; scale: number; scaleMoves?: number } | null | undefined;
        if (!rv || typeof rv.angle !== "number")
          return { correct: false, feedback: "Move the dials, then check." };
        const need = spec.requiredScaleMoves ?? 1;
        if ((rv.scaleMoves ?? 0) < need)
          return { correct: false, feedback: spec.scaleFeedback ?? "Resize the triangle first, and watch what the ratio does." };
        const which = spec.ratio ?? "opp/hyp";
        const got = triangleRatio(rv.angle, which);
        const want = triangleRatio(spec.target, which);
        if (Math.abs(got - want) < 5e-3) return { correct: true, feedback: spec.successFeedback };
        return got < want
          ? { correct: false, feedback: spec.lowFeedback }
          : { correct: false, feedback: spec.highFeedback };
      }
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Move the dial, then check." };
      const got =
        spec.mode === "sas" ? lawOfCosinesSide(spec.a, spec.b, v) : lawOfCosinesAngle(spec.a, spec.b, v);
      if (Math.abs(got - spec.target) < 1e-6) return { correct: true, feedback: spec.successFeedback };
      return got < spec.target
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "compassConstruct": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Set the compass, then check." };
      if (v === spec.target) return { correct: true, feedback: spec.successFeedback };
      return v < spec.target
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "lineRelationLab": {
      const v=value as {angle:number;offset:number;moves:number}|null|undefined;
      if(!v) return {correct:false,feedback:"Rotate and translate the active line, then check."};
      const raw=Math.abs(((v.angle-spec.baseAngle)%180+180)%180);
      const diff=Math.min(raw,180-raw);
      const relation=diff===0?"parallel":diff===90?"perpendicular":"intersecting";
      if(v.moves<spec.requiredMoves) return {correct:false,feedback:spec.distanceFeedback};
      if(spec.targetRelation==="parallel"&&v.offset===0) return {correct:false,feedback:spec.distanceFeedback};
      return relation===spec.targetRelation?{correct:true,feedback:spec.successFeedback}:{correct:false,feedback:spec.angleFeedback};
    }
    case "triangleConstraintLab": {
      const v=value as {criterion:string;angle:number;flipped:boolean;moves:number}|null|undefined;
      if(!v) return {correct:false,feedback:"Test the givens, then check whether they lock one triangle."};
      if(v.moves<spec.requiredMoves) return {correct:false,feedback:spec.evidenceFeedback};
      // S116 (a): checking while the lock is released is its own diagnosable state — the learner
      // is looking at a shape the claim was never about.
      if(spec.constraint&&(v as {constraintBroken?:boolean}).constraintBroken)
        return {correct:false,feedback:spec.constraintFeedback??spec.criterionFeedback};
      if(v.criterion!==spec.targetCriterion) return {correct:false,feedback:spec.criterionFeedback};
      if(Math.abs(v.angle-spec.targetAngle)>1e-8) return {correct:false,feedback:spec.angleFeedback};
      return {correct:true,feedback:spec.successFeedback};
    }
    case "coordinateProofLab": {
      const v=value as {x:number;y:number;moves:number;evidence:string[]}|null|undefined;
      if(!v) return {correct:false,feedback:"Position vertex D and inspect proof evidence."};
      if(v.x!==spec.target[0]||v.y!==spec.target[1]) return {correct:false,feedback:spec.positionFeedback};
      if(v.moves<spec.requiredMoves||!spec.requiredEvidence.every(e=>v.evidence.includes(e))) return {correct:false,feedback:spec.evidenceFeedback};
      return {correct:true,feedback:spec.successFeedback};
    }
    case "solidSliceLab": {
      const v=value as {fraction:number;moves:number;compare:boolean}|null|undefined;
      if(!v) return {correct:false,feedback:"Move the section plane and compare matching slices."};
      if(v.moves<spec.requiredMoves) return {correct:false,feedback:spec.invariantFeedback};
      if(Math.abs(v.fraction-spec.targetFraction)>spec.tolerance) return {correct:false,feedback:spec.positionFeedback};
      if(spec.comparisonRequired&&!v.compare) return {correct:false,feedback:spec.comparisonFeedback};
      return {correct:true,feedback:spec.successFeedback};
    }
    case "triangleAngleLab": {
      const v=value as {x:number;y:number;moves:number}|null|undefined;
      if(!v) return {correct:false,feedback:"Drag the vertex to deform the triangle, then check."};
      if(v.moves<spec.requiredMoves) return {correct:false,feedback:spec.invariantFeedback};
      const A=angleAt(spec.fixedA,spec.fixedB,[v.x,v.y]);
      return Math.abs(A-spec.targetAngleA)<=spec.tolerance?{correct:true,feedback:spec.successFeedback}:{correct:false,feedback:spec.targetFeedback};
    }
    case "verticalLineScanner": {
      const v=value as {maxIntersections:number;sweeps:number;verdict:"function"|"not-function"|null}|null|undefined;
      if(!v||!v.verdict) return {correct:false,feedback:"Sweep the scanner and choose a verdict."};
      if(v.sweeps<spec.requiredSweeps) return {correct:false,feedback:spec.moreSweepFeedback};
      if(v.verdict!==spec.targetVerdict) return {correct:false,feedback:spec.verdictFeedback};
      if(spec.targetVerdict==="not-function"&&v.maxIntersections<2) return {correct:false,feedback:spec.moreSweepFeedback};
      return {correct:true,feedback:spec.successFeedback};
    }
    case "covariationScrubber": {
      const v=value as number|null|undefined;
      if(typeof v!=="number") return {correct:false,feedback:"Move the shared input, then check."};
      return v===spec.targetInput?{correct:true,feedback:spec.successFeedback}:v<spec.targetInput?{correct:false,feedback:spec.lowFeedback}:{correct:false,feedback:spec.highFeedback};
    }
    case "samplingBiasLab": {
      const v=value as {method:string;size:number;draws:number}|null|undefined;
      if(!v) return {correct:false,feedback:"Choose a design, sample size, and draw samples."};
      if(v.method!==spec.targetMethod) return {correct:false,feedback:spec.methodFeedback};
      if(v.size<spec.targetSize) return {correct:false,feedback:spec.sizeFeedback};
      if(v.draws<spec.requiredDraws) return {correct:false,feedback:spec.drawsFeedback};
      return {correct:true,feedback:spec.successFeedback};
    }
    case "shapeHierarchyLab": {
      if (typeof value !== "string") return { correct: false, feedback: "Choose one evidence-backed shape claim, then check." };
      const choice = spec.choices.find((candidate) => candidate.id === value);
      if (!choice) return { correct: false, feedback: "Choose one evidence-backed shape claim, then check." };
      return shapeHierarchyChoiceCorrect(spec, choice)
        ? { correct: true, feedback: spec.successFeedback }
        : { correct: false, feedback: choice.feedback || spec.fallbackFeedback };
    }
    case "shapeFamilyBuilder": {
      const v=value as {sides:number;rightAngles:number;equalSides:number;parallelPairs:number}|null|undefined;
      if(!v) return {correct:false,feedback:"Set the shape attributes, then check."};
      if(v.sides!==spec.targetSides) return {correct:false,feedback:spec.sidesFeedback};
      const ok=v.rightAngles===spec.targetRightAngles&&v.equalSides===spec.targetEqualSides&&v.parallelPairs===spec.targetParallelPairs;
      return ok?{correct:true,feedback:spec.successFeedback}:{correct:false,feedback:spec.attributesFeedback};
    }
    case "unitRuler": {
      const v=value as {zeroAligned:boolean;unitSize:number;placements:number;spacing:string}|null|undefined;
      if(!v) return {correct:false,feedback:"Align zero and iterate equal units, then check."};
      if(!v.zeroAligned) return {correct:false,feedback:spec.alignFeedback};
      if(v.spacing!=="exact") return {correct:false,feedback:spec.gapOverlapFeedback};
      if(v.unitSize!==spec.targetUnitSize) return {correct:false,feedback:spec.unitFeedback};
      if(v.placements===spec.requiredPlacements) return {correct:true,feedback:spec.successFeedback};
      const named=spec.commonPlacements.find((c)=>c.placements===v.placements);
      return {correct:false,feedback:named?.feedback??spec.gapOverlapFeedback};
    }
    case "proportionalReasoningLab": {
      const v = value && typeof value === "object" ? value as { revealed?: unknown; numeric?: unknown; choiceId?: unknown } : {};
      const validExplorationKeys = new Set(proportionalReasoningExplorationKeys(spec));
      const explored = Array.isArray(v.revealed)
        ? new Set(v.revealed.filter((item): item is string => typeof item === "string" && validExplorationKeys.has(item))).size
        : 0;
      if (explored < spec.requiredExplorations) return { correct: false, feedback: spec.explorationFeedback };
      const truth = proportionalReasoningTruth(spec);
      if (spec.answerMode === "numeric") {
        if (typeof v.numeric !== "number" || Number.isNaN(v.numeric)) return { correct: false, feedback: spec.fallbackFeedback };
        if (typeof truth.answerNumber === "number" && Math.abs(v.numeric - truth.answerNumber) <= spec.tolerance) return { correct: true, feedback: spec.successFeedback };
        const named = spec.numericErrors.find((entry) => Math.abs(entry.value - (v.numeric as number)) <= spec.tolerance);
        return { correct: false, feedback: named?.feedback ?? spec.fallbackFeedback };
      }
      const choice = typeof v.choiceId === "string" ? spec.choices.find((candidate) => candidate.id === v.choiceId) : undefined;
      if (!choice) return { correct: false, feedback: spec.fallbackFeedback };
      return proportionalReasoningChoiceCorrect(spec, choice)
        ? { correct: true, feedback: spec.successFeedback }
        : { correct: false, feedback: choice.feedback };
    }
    case "placeValueTransformLab": {
      const v=value&&typeof value==="object"?value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown}:{};
      const validKeys=new Set(placeValueTransformExplorationKeys(spec));
      const explored=Array.isArray(v.revealed)?new Set(v.revealed.filter((item):item is string=>typeof item==="string"&&validKeys.has(item))).size:0;
      if(explored<spec.requiredExplorations) return {correct:false,feedback:spec.explorationFeedback};
      const truth=placeValueTransformTruth(spec);
      if(spec.answerMode==="numeric"){
        if(typeof v.numeric!=="number"||Number.isNaN(v.numeric)) return {correct:false,feedback:spec.fallbackFeedback};
        if(typeof truth.answerNumber==="number"&&Math.abs(v.numeric-truth.answerNumber)<=spec.tolerance) return {correct:true,feedback:spec.successFeedback};
        const named=spec.numericErrors.find((entry)=>Math.abs(entry.value-(v.numeric as number))<=spec.tolerance);
        return {correct:false,feedback:named?.feedback??spec.fallbackFeedback};
      }
      const choice=typeof v.choiceId==="string"?spec.choices.find((candidate)=>candidate.id===v.choiceId):undefined;
      if(!choice) return {correct:false,feedback:spec.fallbackFeedback};
      return placeValueTransformChoiceCorrect(spec,choice)?{correct:true,feedback:spec.successFeedback}:{correct:false,feedback:choice.feedback};
    }
    case "pointSetReasoningLab": {
      const v=value&&typeof value==="object"?value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown}:{};const valid=new Set(pointSetReasoningExplorationKeys(spec));const set=new Set(Array.isArray(v.revealed)?v.revealed.filter((item):item is string=>typeof item==="string"&&valid.has(item)):[]);if(set.size<spec.requiredExplorations||spec.requiredStageKeys.some(key=>!set.has(key)))return{correct:false,feedback:spec.explorationFeedback};const truth=pointSetReasoningTruth(spec);if(spec.answerMode==="explore")return{correct:true,feedback:spec.successFeedback};if(spec.answerMode==="numeric"){if(typeof v.numeric!=="number"||Number.isNaN(v.numeric))return{correct:false,feedback:spec.fallbackFeedback};if(typeof truth.answerNumber==="number"&&Math.abs(v.numeric-truth.answerNumber)<=spec.tolerance)return{correct:true,feedback:spec.successFeedback};const named=spec.numericErrors.find(entry=>Math.abs(entry.value-(v.numeric as number))<=spec.tolerance);return{correct:false,feedback:named?.feedback??spec.fallbackFeedback}}const choice=typeof v.choiceId==="string"?spec.choices.find(candidate=>candidate.id===v.choiceId):undefined;if(!choice)return{correct:false,feedback:spec.fallbackFeedback};return pointSetReasoningChoiceCorrect(spec,choice)?{correct:true,feedback:spec.successFeedback}:{correct:false,feedback:choice.feedback};
    }
    case "geometricConstraintLab": {
      const v=value&&typeof value==="object"?value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown}:{};
      const valid=new Set(geometricConstraintExplorationKeys(spec));
      const revealed=Array.isArray(v.revealed)?v.revealed.filter((item):item is string=>typeof item==="string"&&valid.has(item)):[];
      const revealedSet=new Set(revealed);
      if(revealedSet.size<spec.requiredExplorations||spec.requiredStageKeys.some(key=>!revealedSet.has(key)))return{correct:false,feedback:spec.explorationFeedback};
      const truth=geometricConstraintTruth(spec);
      if(spec.answerMode==="explore")return{correct:true,feedback:spec.successFeedback};
      if(spec.answerMode==="numeric"){
        if(typeof v.numeric!=="number"||Number.isNaN(v.numeric))return{correct:false,feedback:spec.fallbackFeedback};
        if(typeof truth.answerNumber==="number"&&Math.abs(v.numeric-truth.answerNumber)<=spec.tolerance)return{correct:true,feedback:spec.successFeedback};
        const named=spec.numericErrors.find(entry=>Math.abs(entry.value-(v.numeric as number))<=spec.tolerance);return{correct:false,feedback:named?.feedback??spec.fallbackFeedback};
      }
      const choice=typeof v.choiceId==="string"?spec.choices.find(candidate=>candidate.id===v.choiceId):undefined;if(!choice)return{correct:false,feedback:spec.fallbackFeedback};
      return geometricConstraintChoiceCorrect(spec,choice)?{correct:true,feedback:spec.successFeedback}:{correct:false,feedback:choice.feedback};
    }
    case "exactNumberLab": {
      const v=value&&typeof value==="object"?value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown;relation?:unknown}:{};
      const validKeys=new Set(exactNumberExplorationKeys(spec));
      const revealed=Array.isArray(v.revealed)?v.revealed.filter((item):item is string=>typeof item==="string"&&validKeys.has(item)):[];
      const revealedSet=new Set(revealed);
      if(revealedSet.size<spec.requiredExplorations||spec.requiredStageKeys.some(key=>!revealedSet.has(key)))return{correct:false,feedback:spec.explorationFeedback};
      const truth=exactNumberTruth(spec);
      if(spec.answerMode==="explore")return{correct:true,feedback:spec.successFeedback};
      if(spec.answerMode==="numeric"){
        if(typeof v.numeric!=="number"||Number.isNaN(v.numeric))return{correct:false,feedback:spec.fallbackFeedback};
        if(typeof truth.answerNumber==="number"&&Math.abs(v.numeric-truth.answerNumber)<=spec.tolerance)return{correct:true,feedback:spec.successFeedback};
        const named=spec.numericErrors.find(entry=>Math.abs(entry.value-(v.numeric as number))<=spec.tolerance);return{correct:false,feedback:named?.feedback??spec.fallbackFeedback};
      }
      if(spec.answerMode==="relation"){
        if(v.relation!=="lt"&&v.relation!=="eq"&&v.relation!=="gt")return{correct:false,feedback:spec.fallbackFeedback};
        return v.relation===truth.answerRelation?{correct:true,feedback:spec.successFeedback}:{correct:false,feedback:spec.fallbackFeedback};
      }
      const choice=typeof v.choiceId==="string"?spec.choices.find(candidate=>candidate.id===v.choiceId):undefined;
      if(!choice)return{correct:false,feedback:spec.fallbackFeedback};
      return exactNumberChoiceCorrect(spec,choice)?{correct:true,feedback:spec.successFeedback}:{correct:false,feedback:choice.feedback};
    }
    case "affineRelationshipLab": {
      const v=value&&typeof value==="object"?value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown;point?:unknown}:{};
      const validKeys=new Set(affineRelationshipExplorationKeys(spec));
      const explored=Array.isArray(v.revealed)?new Set(v.revealed.filter((item):item is string=>typeof item==="string"&&validKeys.has(item))).size:0;
      const revealedSet=new Set(Array.isArray(v.revealed)?v.revealed.filter((item):item is string=>typeof item==="string"&&validKeys.has(item)):[]);
      if(explored<spec.requiredExplorations||spec.requiredStageKeys.some(key=>!revealedSet.has(key)))return{correct:false,feedback:spec.explorationFeedback};
      const truth=affineRelationshipTruth(spec);
      if(spec.answerMode==="explore")return{correct:true,feedback:spec.successFeedback};
      if(spec.answerMode==="numeric"){
        if(typeof v.numeric!=="number"||Number.isNaN(v.numeric))return{correct:false,feedback:spec.fallbackFeedback};
        if(typeof truth.answerNumber==="number"&&Math.abs(v.numeric-truth.answerNumber)<=spec.tolerance)return{correct:true,feedback:spec.successFeedback};
        const named=spec.numericErrors.find(entry=>Math.abs(entry.value-(v.numeric as number))<=spec.tolerance);
        return{correct:false,feedback:named?.feedback??spec.fallbackFeedback};
      }
      if(spec.answerMode==="choice"){
        const choice=typeof v.choiceId==="string"?spec.choices.find(candidate=>candidate.id===v.choiceId):undefined;
        if(!choice)return{correct:false,feedback:spec.fallbackFeedback};
        return affineRelationshipChoiceCorrect(spec,choice)?{correct:true,feedback:spec.successFeedback}:{correct:false,feedback:choice.feedback};
      }
      const point=Array.isArray(v.point)&&v.point.length===2&&v.point.every(item=>typeof item==="number"&&!Number.isNaN(item))?v.point as [number,number]:null;
      if(point&&truth.answerPoint&&Math.abs(point[0]-truth.answerPoint[0])<=spec.tolerance&&Math.abs(point[1]-truth.answerPoint[1])<=spec.tolerance)return{correct:true,feedback:spec.successFeedback};
      const named=point?spec.pointErrors.find(entry=>Math.abs(entry.values[0]-point[0])<=spec.tolerance&&Math.abs(entry.values[1]-point[1])<=spec.tolerance):undefined;
      return{correct:false,feedback:named?.feedback??spec.fallbackFeedback};
    }
    case "quotientReasoningLab": {
      const v = value && typeof value === "object" ? value as { revealed?: unknown; numeric?: unknown; choiceId?: unknown; fraction?: unknown } : {};
      const validKeys = new Set(quotientReasoningExplorationKeys(spec));
      const explored = Array.isArray(v.revealed) ? new Set(v.revealed.filter((item): item is string => typeof item === "string" && validKeys.has(item))).size : 0;
      if (explored < spec.requiredExplorations) return { correct: false, feedback: spec.explorationFeedback };
      const truth = quotientReasoningTruth(spec);
      if (spec.answerMode === "explore") return { correct: true, feedback: spec.successFeedback };
      if (spec.answerMode === "numeric") {
        if (typeof v.numeric !== "number" || Number.isNaN(v.numeric)) return { correct: false, feedback: spec.fallbackFeedback };
        if (typeof truth.answerNumber === "number" && Math.abs(v.numeric - truth.answerNumber) <= spec.tolerance) return { correct: true, feedback: spec.successFeedback };
        const named = spec.numericErrors.find((entry) => Math.abs(entry.value - (v.numeric as number)) <= spec.tolerance);
        return { correct: false, feedback: named?.feedback ?? spec.fallbackFeedback };
      }
      if (spec.answerMode === "choice") {
        const choice = typeof v.choiceId === "string" ? spec.choices.find((candidate) => candidate.id === v.choiceId) : undefined;
        if (!choice) return { correct: false, feedback: spec.fallbackFeedback };
        return quotientReasoningChoiceCorrect(spec, choice) ? { correct: true, feedback: spec.successFeedback } : { correct: false, feedback: choice.feedback };
      }
      const fraction = v.fraction && typeof v.fraction === "object" ? v.fraction as { whole?: number; num?: number; den?: number } : {};
      if (quotientReasoningFractionCorrect(spec, fraction)) return { correct: true, feedback: spec.successFeedback };
      const entered = quotientFractionFromMixed(fraction);
      const named = entered ? spec.fractionErrors.find((entry) => {
        const candidate = quotientFractionFromMixed(entry);
        return Boolean(candidate && quotientRationalKey(candidate) === quotientRationalKey(entered));
      }) : undefined;
      return { correct: false, feedback: named?.feedback ?? spec.fallbackFeedback };
    }
    case "graphStoryLab": {
      if (spec.mode === "read") {
        const choice = typeof value === "string" ? spec.choices.find((candidate) => candidate.id === value) : undefined;
        if (!choice) return { correct: false, feedback: spec.explorationFeedback };
        return graphStoryChoiceCorrect(spec, choice)
          ? { correct: true, feedback: spec.successFeedback }
          : { correct: false, feedback: choice.feedback };
      }
      const ids = value && typeof value === "object" && Array.isArray((value as { segmentIds?: unknown }).segmentIds)
        ? (value as { segmentIds: string[] }).segmentIds : [];
      if (ids.length === 0) return { correct: false, feedback: spec.explorationFeedback };
      const byId = new Map(spec.bank.map((segment) => [segment.id, segment]));
      const kinds = ids.map((id) => byId.get(id)?.kind).filter((kind): kind is NonNullable<typeof kind> => Boolean(kind));
      if (kinds.length !== ids.length) return { correct: false, feedback: spec.fallbackFeedback };
      const truth = graphStoryTruth(spec);
      if (graphStorySequenceKey(kinds) === graphStorySequenceKey(truth.targetKinds))
        return { correct: true, feedback: spec.successFeedback };
      const named = spec.wrongSequences.find((wrong) => graphStorySequenceKey(wrong.kinds) === graphStorySequenceKey(kinds));
      return { correct: false, feedback: named?.feedback ?? spec.fallbackFeedback };
    }
    case "conditionalTableLab": {
      if (spec.mode === "read") {
        const choiceId = typeof value === "string" ? value : "";
        const choice = spec.answerChoices.find((candidate) => candidate.id === choiceId);
        if (!choice || !spec.readMetric) return {correct:false,feedback:spec.explorationFeedback};
        const truth = conditionalTableReadTruth(spec.counts, spec.readMetric, spec.targetCell);
        return Math.abs(choice.value-truth.value)<1e-9 ? {correct:true,feedback:spec.successFeedback} : {correct:false,feedback:choice.feedback};
      }
      const v=value as {condition:string;cell:string|null;switches:number}|null|undefined;
      if(!v) return {correct:false,feedback:"Choose a condition and an intersection cell, then check."};
      if(v.switches<spec.requiredSwitches) return {correct:false,feedback:spec.explorationFeedback};
      if(v.condition!==spec.targetCondition) return {correct:false,feedback:spec.conditionFeedback};
      if(v.cell!==spec.targetCell) return {correct:false,feedback:spec.cellFeedback};
      return {correct:true,feedback:spec.successFeedback};
    }
    case "conicLocusLab": {
      const v=value as {eTenths:number;samples:number}|null|undefined;
      if(!v) return {correct:false,feedback:"Change eccentricity and compare several conic loci, then check."};
      if(v.samples<spec.requiredSamples) return {correct:false,feedback:spec.explorationFeedback};
      if(v.eTenths===spec.targetEccentricityTenths) return {correct:true,feedback:spec.successFeedback};
      return v.eTenths<spec.targetEccentricityTenths?{correct:false,feedback:spec.lowFeedback}:{correct:false,feedback:spec.highFeedback};
    }
    case "derivativeRuleLab": {
      const v=value as {h:number;innerRate:number;outerRate:number;moves:number}|null|undefined;
      if(!v) return {correct:false,feedback:"Change the controls and inspect the live rate mechanism, then check."};
      if(v.moves<spec.requiredMoves) return {correct:false,feedback:spec.explorationFeedback};
      if(spec.mode==="product") return v.h<=spec.targetH+1e-9?{correct:true,feedback:spec.successFeedback}:{correct:false,feedback:spec.mechanismFeedback};
      const ok=v.innerRate===spec.targetInnerRate&&v.outerRate===spec.targetOuterRate;
      return ok?{correct:true,feedback:spec.successFeedback}:{correct:false,feedback:spec.mechanismFeedback};
    }
    case "relatedRatesLab": {
      const v=value as {x:number;moves:number}|null|undefined;
      if(!v) return {correct:false,feedback:"Slide the ladder and inspect how both position and rate change, then check."};
      if(v.moves<spec.requiredMoves) return {correct:false,feedback:spec.explorationFeedback};
      return v.x===spec.targetX?{correct:true,feedback:spec.successFeedback}:{correct:false,feedback:spec.positionFeedback};
    }
    case "quadDrag": {
      const v = value as { x: number; y: number } | null | undefined;
      if (!v || typeof v.x !== "number") return { correct: false, feedback: "Place the fourth corner, then check." };
      if (v.x === spec.targetX && v.y === spec.targetY)
        return { correct: true, feedback: spec.successFeedback };
      // With three vertices pinned the fourth is uniquely determined, so "right family, wrong place"
      // is unreachable — a wrong-path that can never fire is dead feedback. Split on the axis instead:
      // the across value controls whether the opposite sides pair up at all; the up value then
      // controls the remaining side and the diagonals.
      return v.x !== spec.targetX
        ? { correct: false, feedback: spec.sideFeedback }
        : { correct: false, feedback: spec.angleFeedback };
    }
    case "radicalCheck": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Pick a candidate, then check." };
      if (v === spec.target) return { correct: true, feedback: spec.successFeedback };
      if (v === spec.extraneous) return { correct: false, feedback: spec.extraneousFeedback };
      return { correct: false, feedback: spec.missFeedback };
    }
    case "derivativeTrace": {
      const x = value as number | null | undefined;
      if (typeof x !== "number") return { correct: false, feedback: "Drag the point, then check." };
      if (spec.mode === "point") {
        if (x === spec.targetX) return { correct: true, feedback: spec.successFeedback };
        return x < spec.targetX
          ? { correct: false, feedback: spec.lowFeedback }
          : { correct: false, feedback: spec.highFeedback };
      }
      const d = traceSlopeAt(spec.fn, x);
      if (d === null) return { correct: false, feedback: spec.lowFeedback };
      if (Math.abs(d - spec.targetSlope) < 1e-9) return { correct: true, feedback: spec.successFeedback };
      return d < spec.targetSlope
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "riemannSum": {
      const v = value as { n: number; rule: "left" | "right" | "mid" | "trap" } | null | undefined;
      if (!v || typeof v.n !== "number") return { correct: false, feedback: "Set the strips, then check." };
      const est = riemannEstimate(spec.fn, spec.a, spec.b, v.n, v.rule);
      const truth = exactArea(spec.fn, spec.a, spec.b);
      if (Math.abs(est - truth) <= spec.tolerance) return { correct: true, feedback: spec.successFeedback };
      return est < truth
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "accumulateArea": {
      const x = value as number | null | undefined;
      if (typeof x !== "number") return { correct: false, feedback: "Drag x, then check." };
      if (spec.mode === "point") {
        if (Math.abs(x - spec.targetX) < 1e-9) return { correct: true, feedback: spec.successFeedback };
        return x < spec.targetX
          ? { correct: false, feedback: spec.lowFeedback }
          : { correct: false, feedback: spec.highFeedback };
      }
      const area = accumAreaAt(spec.fn, x);
      if (Math.abs(area - spec.targetArea) < 1e-9) return { correct: true, feedback: spec.successFeedback };
      return area < spec.targetArea
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "sliceSum": {
      const v = value as { n: number; rule: "left" | "right" | "mid" } | null | undefined;
      if (!v || typeof v.n !== "number") return { correct: false, feedback: "Set the slices, then check." };
      const est = sliceEstimate(spec.mode, v.n, v.rule);
      const truth = sliceExact(spec.mode);
      if (Math.abs(est - truth) <= spec.tolerance) return { correct: true, feedback: spec.successFeedback };
      return est < truth
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "taylorApprox": {
      const v = value as number | null | undefined;
      if (typeof v !== "number") return { correct: false, feedback: "Move the dial, then check." };
      const goal = spec.mode === "terms" ? spec.targetN : spec.targetXTenths;
      if (v === goal) return { correct: true, feedback: spec.successFeedback };
      return v < goal
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "slopeField": {
      const y0 = value as number | null | undefined;
      if (typeof y0 !== "number") return { correct: false, feedback: "Set the starting value, then check." };
      if (y0 === spec.targetY0) return { correct: true, feedback: spec.successFeedback };
      return y0 < spec.targetY0
        ? { correct: false, feedback: spec.lowFeedback }
        : { correct: false, feedback: spec.highFeedback };
    }
    case "argandExplore": {
      const v = value as { re: number; im: number } | null | undefined;
      if (!v || typeof v.re !== "number") return { correct: false, feedback: "Place the number, then check." };
      const [gotRe, gotIm] =
        spec.mode === "multiply" ? complexProduct(v.re, v.im, spec.mulRe, spec.mulIm) : [v.re, v.im];
      if (gotRe === spec.targetRe && gotIm === spec.targetIm)
        return { correct: true, feedback: spec.successFeedback };
      return gotRe !== spec.targetRe
        ? { correct: false, feedback: spec.realFeedback }
        : { correct: false, feedback: spec.imagFeedback };
    }
    case "graphZoom": {
      const v = value as { zoom: number; verdict: "limit-exists" | "no-limit" | null } | null | undefined;
      if (!v || typeof v.zoom !== "number")
        return { correct: false, feedback: "Magnify the graph a few times, then give a verdict." };
      if (v.zoom < spec.requiredZoom) return { correct: false, feedback: spec.moreZoomFeedback };
      if (v.verdict !== spec.targetVerdict) return { correct: false, feedback: spec.wrongVerdictFeedback };
      return { correct: true, feedback: spec.successFeedback };
    }
    case "sampleSim": {
      const v = value as { size: number; draws: number } | null | undefined;
      if (!v || typeof v.draws !== "number" || v.draws === 0)
        return { correct: false, feedback: "Draw at least one sample first, then check." };
      if (v.size !== spec.targetSize) return { correct: false, feedback: spec.wrongSizeFeedback };
      if (v.draws < spec.requiredDraws) return { correct: false, feedback: spec.moreDrawsFeedback };
      return { correct: true, feedback: spec.successFeedback };
    }
    case "ciCapture": {
      const v = value as { level: number; drawn: number } | null | undefined;
      if (!v || typeof v.drawn !== "number" || v.drawn === 0)
        return { correct: false, feedback: "Draw at least one interval first, then check." };
      if (v.level !== spec.targetLevel) return { correct: false, feedback: spec.wrongLevelFeedback };
      if (v.drawn < spec.requiredIntervals) return { correct: false, feedback: spec.moreIntervalsFeedback };
      return { correct: true, feedback: spec.successFeedback };
    }
    case "shuffleTest": {
      const v = value as { shuffles: number; verdict: "chance" | "real" | null } | null | undefined;
      if (!v || typeof v.shuffles !== "number")
        return { correct: false, feedback: "Shuffle the labels a few times, then give a verdict." };
      if (v.shuffles < spec.requiredShuffles) return { correct: false, feedback: spec.moreShufflesFeedback };
      if (v.verdict !== spec.targetVerdict) return { correct: false, feedback: spec.wrongVerdictFeedback };
      return { correct: true, feedback: spec.successFeedback };
    }
    case "algebraTiles": {
      const v = value as
        | { x: number; c: number; mat?: { sqPos?: number; sqNeg?: number; framed?: boolean } }
        | null
        | undefined;
      if (!v || typeof v.x !== "number") return { correct: false, feedback: "Place some tiles, then check." };

      // ── S211: the area workspace, gated ENTIRELY behind `spec.area`. ─────────────────────
      // Every line of this block is unreachable for a spec that has no rectangle, which is all 27
      // authored instances; below it the original three lines stand untouched, so the old path
      // reduces literally to the code it always was.
      if (spec.area) {
        const p = algebraTilesPartials(spec.area.width, spec.area.height);
        const framed = v.mat?.framed === true;
        const sq = (v.mat?.sqPos ?? 0) - (v.mat?.sqNeg ?? 0);
        if (spec.area.mode === "factor") {
          // Gathering is the task: the tiles are right when they are inside the rectangle. The
          // model only lets the rectangle close over a mat that matches it, so `framed` IS the
          // proof — but the tiles are checked too rather than trusted.
          if (framed) return { correct: true, feedback: spec.successFeedback };
          if (sq === p.square && v.x === p.x && v.c === p.unit)
            return { correct: false, feedback: spec.frameMismatchFeedback ?? spec.constFeedback };
          return v.x !== p.x
            ? { correct: false, feedback: spec.xFeedback }
            : { correct: false, feedback: spec.constFeedback };
        }
        // distribute: the rectangle must be filled — every partial product produced.
        //
        // S215: "nothing produced yet" is its own state and gets its own words. It used to fall
        // through to `constFeedback`, which told a learner who had done nothing that their constant
        // was wrong and then handed them the right one. `unopenedFrameFeedback` is optional, so a
        // spec without it behaves exactly as before; every existing path still reduces literally.
        if (framed) return { correct: false, feedback: spec.unopenedFrameFeedback ?? spec.constFeedback };
        if (sq === 0 && v.x === 0 && v.c === 0 && (p.square !== 0 || p.x !== 0 || p.unit !== 0))
          return { correct: false, feedback: spec.unopenedFrameFeedback ?? spec.constFeedback };
        if (sq === p.square && v.x === p.x && v.c === p.unit)
          return { correct: true, feedback: spec.successFeedback };
        // The named misconception: the multiplier reached the x and stopped, so one copy of the
        // constant survived instead of all of them. Only meaningful for a(x + b).
        if (spec.partialProductFeedback && spec.area.width[0] === 0 && sq === p.square && v.x === p.x && v.c === spec.area.height[1])
          return { correct: false, feedback: spec.partialProductFeedback };
        return v.x !== p.x
          ? { correct: false, feedback: spec.xFeedback }
          : { correct: false, feedback: spec.constFeedback };
      }

      if (v.x === spec.targetX && v.c === spec.targetConst) return { correct: true, feedback: spec.successFeedback };
      return v.x !== spec.targetX
        ? { correct: false, feedback: spec.xFeedback }
        : { correct: false, feedback: spec.constFeedback };
    }
    case "slider": {
      const v = typeof value === "number" ? value : spec.start;
      if (v === spec.target) return { correct: true, feedback: spec.successFeedback };
      return { correct: false, feedback: v < spec.target ? spec.lowFeedback : spec.highFeedback };
    }
    case "lengthCompare": {
      if (spec.mode === "difference") {
        const v = typeof value === "number" ? value : null;
        if (v === null) return { correct: false, feedback: "Count the part that sticks out, then check." };
        if (v === spec.targetDifference) return { correct: true, feedback: spec.successFeedback };
        // The classic comparison-subtraction error: counting the whole longer bar instead of the
        // stretch by which it overhangs. Reachable by construction (diffMax >= the longer bar).
        const longer = spec.items.reduce((m, it) => (it.length > m.length ? it : m), spec.items[0]);
        if (v === longer.length && spec.countsWholeFeedback)
          return { correct: false, feedback: spec.countsWholeFeedback };
        return { correct: false, feedback: spec.missFeedback };
      }
      if (spec.mode === "align") {
        // Align mode: the value carries the live per-bar offsets and the pick, so the
        // grader can tell WHETHER the compare was made fair before it was judged.
        //   unaligned + pick   → that bar's authored pre-align diagnosis (judged by looks)
        //   unaligned + no pick → unalignedFeedback ("you cannot tell yet")
        //   aligned + wrong pick → missFeedback   ·   aligned + answerId → success
        const v =
          value && typeof value === "object"
            ? (value as { offsets?: Record<string, number>; picked?: string | null })
            : null;
        const offsetOf = (id: string, authored: number) => {
          const o = v?.offsets?.[id];
          return typeof o === "number" ? o : authored;
        };
        const aligned = spec.items.every((i) => offsetOf(i.id, i.startOffset) === 0);
        const picked = typeof v?.picked === "string" && v.picked.length > 0 ? v.picked : null;
        if (!aligned) {
          const item = spec.items.find((i) => i.id === picked);
          return {
            correct: false,
            feedback: (picked ? item?.feedback : undefined) ?? spec.unalignedFeedback ?? spec.missFeedback
          };
        }
        if (picked === spec.answerId) return { correct: true, feedback: spec.successFeedback };
        return { correct: false, feedback: spec.missFeedback };
      }
      const picked = typeof value === "string" ? value : null;
      if (picked === spec.answerId) return { correct: true, feedback: spec.successFeedback };
      const item = spec.items.find((i) => i.id === picked);
      return { correct: false, feedback: item?.feedback ?? spec.missFeedback };
    }
    case "moneyBoard": {
      if (spec.mode === "count") {
        const v =
          value && typeof value === "object"
            ? (value as { counted: number[]; entry: number | null })
            : { counted: [], entry: null };
        if (v.entry === null)
          return { correct: false, feedback: "Count the coins, then type the total." };
        const answer = spec.answerCents ?? 0;
        if (v.entry === answer) return { correct: true, feedback: spec.successFeedback };
        const trap = spec.commonEntries.find((e) => e.cents === v.entry);
        if (trap) return { correct: false, feedback: trap.feedback };
        const chainTotal = v.counted.reduce((t, c) => t + c, 0);
        if (chainTotal === answer)
          return { correct: false, feedback: spec.mismatchFeedback };
        return {
          correct: false,
          feedback: spec.fallbackFeedback ?? "Count each coin's VALUE — biggest coins first."
        };
      }
      const tray = spec.tray ?? [];
      const target =
        spec.mode === "change"
          ? (spec.paidCents ?? 0) - (spec.priceCents ?? 0)
          : spec.targetCents ?? 0;
      const v = value as Record<number, number> | null | undefined; // {cents → count placed}
      if (!v || Object.values(v).every((c) => !c))
        return { correct: false, feedback: "Place coins to build the amount, then check." };
      let total = 0;
      let pieces = 0;
      for (const d of tray) {
        const c = v[d.cents] ?? 0;
        total += d.cents * c;
        pieces += c;
      }
      if (total === target) return { correct: true, feedback: spec.successFeedback };
      const ct = spec.commonTotals.find((c) => c.cents === total);
      if (ct) return { correct: false, feedback: ct.feedback };
      if (spec.countFeedback && pieces === target)
        return { correct: false, feedback: spec.countFeedback };
      return total < target
        ? { correct: false, feedback: spec.lowFeedback ?? "Not there yet — add value." }
        : { correct: false, feedback: spec.highFeedback ?? "Over the mark — take something off." };
    }
    case "mixedRegroup": {
      const v = value as { whole?: number; num?: number; complete?: boolean } | null | undefined;
      if (!v?.complete || typeof v.whole !== "number" || typeof v.num !== "number")
        return {
          correct: false,
          feedback:
            spec.mode === "convert"
              ? "Exchange until the value is in the form the question asks for, then check."
              : "Work out the parts column and the whole column, then check."
        };
      const truth = mixedRegroupTruth(spec);
      if (v.whole === truth.whole && v.num === truth.num) return { correct: true, feedback: spec.successFeedback };
      const landing = spec.commonResults.find((r) => r.whole === v.whole && r.num === v.num);
      if (landing) return { correct: false, feedback: landing.feedback };
      return { correct: false, feedback: spec.fallbackFeedback };
    }
    case "columnCalc": {
      const v = value as { value?: number | null; complete?: boolean } | null | undefined;
      if (!v?.complete || typeof v.value !== "number")
        return { correct: false, feedback: "Resolve every column, then check." };
      const truth = columnCalcTruth(spec.op, spec.a, spec.b);
      if (v.value === truth) return { correct: true, feedback: spec.successFeedback };
      const landing = spec.commonResults.find((r) => r.value === v.value);
      if (landing) return { correct: false, feedback: landing.feedback };
      return { correct: false, feedback: spec.fallbackFeedback };
    }
    case "slopeTriangle": {
      const v = value as { run?: number; rise?: number } | null | undefined;
      if (!v || typeof v.run !== "number" || typeof v.rise !== "number")
        return { correct: false, feedback: "Set the run and the rise, then check." };
      const run = v.run, rise = v.rise;
      if (slopeTriangleMatches(spec, run, rise)) return { correct: true, feedback: spec.successFeedback };
      const named = spec.commonPairs.find((c) => c.run === run && c.rise === rise);
      if (named) return { correct: false, feedback: named.feedback };
      const t = slopeTriangleTruth(spec);
      // Derived diagnoses, checked before the fallback: the reciprocal (legs swapped) and the
      // sign flip (direction dropped) are the two errors this construction can actually make.
      if (run !== 0 && rise !== 0 && slopeTriangleMatches(spec, rise, run))
        return {
          correct: false,
          feedback: `That triangle has a run of ${run} and a rise of ${rise} — the legs are swapped. Slope is rise \u00f7 run, the VERTICAL change over the horizontal one, so this line tilts the reciprocal way and misses B.`
        };
      if (slopeTriangleMatches(spec, -run, rise) || slopeTriangleMatches(spec, run, -rise))
        return {
          correct: false,
          feedback: `The sizes are right but the direction is not: from A the line has to travel ${Math.abs(t.run)} ${t.run < 0 ? "left" : "right"} and ${Math.abs(t.rise)} ${t.rise < 0 ? "down" : "up"} to reach B, so one of your legs needs the other sign.`
        };
      if (run === 0 && rise === 0)
        return { correct: false, feedback: "A run of 0 and a rise of 0 is not a triangle — the line never leaves A." };
      return { correct: false, feedback: spec.fallbackFeedback };
    }
    case "graphRead": {
      const v = value as { picked?: number } | null | undefined;
      if (!v || typeof v.picked !== "number")
        return { correct: false, feedback: `Move the marker to the number that says how many ${spec.unitNounPlural} the graph shows.` };
      const truth = graphReadAnswer(spec);
      if (v.picked === truth) return { correct: true, feedback: spec.successFeedback };
      const landing = spec.commonResults.find((r) => r.value === v.picked);
      if (landing) return { correct: false, feedback: landing.feedback };
      // Off-by-one is THE reading error in both modes; name it precisely rather than falling
      // through to generic copy.
      if (Math.abs(v.picked - truth) === spec.unitValue) {
        const one = spec.mode === "bar" ? "gridline" : spec.mode === "tally" ? "mark" : "picture";
        return { correct: false, feedback: `That is one ${one} out. Count again from the bottom \u2014 the last one lands on ${truth}, not ${v.picked}.` };
      }
      return { correct: false, feedback: spec.fallbackFeedback };
    }
    case "unitChain": {
      const v = value as { unitIdx?: number; value?: number; dirs?: ("mul" | "div")[] } | null | undefined;
      if (!v || typeof v.unitIdx !== "number" || typeof v.value !== "number")
        return { correct: false, feedback: "Cross each hop of the chain — multiply or divide — until you reach the target unit, then check." };
      const got = v.value;
      if (v.unitIdx < spec.hops.length)
        return { correct: false, feedback: `Keep going — you are at ${v.unitIdx === 0 ? spec.startUnit : spec.hops[v.unitIdx - 1].to}, and the target is ${spec.targetUnit}.` };
      const truth = unitChainAnswer(spec);
      if (Math.abs(got - truth) < 1e-9) return { correct: true, feedback: spec.successFeedback };
      // Name WHICH hop was crossed the wrong way: match the learner's landing against the
      // derived wrong-direction worlds first, then authored landings, then the fallback.
      const rightDirs = spec.hops.map((h) => (h.bigger === "from" ? "mul" : "div"));
      const world = unitChainWorlds(spec).find(
        (w) => w.dirs.join(",") !== rightDirs.join(",") && Math.abs(w.value - got) < 1e-9
      );
      if (world) {
        const i = world.dirs.findIndex((d, k) => d !== rightDirs[k]);
        const h = spec.hops[i];
        const big = h.bigger === "from" ? h.from : h.to;
        const small = h.bigger === "from" ? h.to : h.from;
        const needed = rightDirs[i] === "mul" ? "multiplies" : "divides";
        return {
          correct: false,
          feedback: `Going from ${h.from} to ${h.to} you ${world.dirs[i] === "mul" ? "multiplied" : "divided"} by ${h.factor} — but one ${big} holds ${h.factor} ${small}, so that crossing ${needed}. The bar never moved; only the counting unit changed.`
        };
      }
      const landing = spec.commonResults.find((r) => Math.abs(r.value - got) < 1e-9);
      if (landing) return { correct: false, feedback: landing.feedback };
      return { correct: false, feedback: spec.fallbackFeedback };
    }
    case "evalOrder": {
      const v = value as { tokens?: string[] } | null | undefined;
      const toks = v?.tokens;
      if (!Array.isArray(toks) || toks.length === 0)
        return { correct: false, feedback: "Tap an operator to collapse it, then check." };
      if (toks.length > 1)
        return { correct: false, feedback: "Keep collapsing — one operation at a time, until a single number is left." };
      const got = Number(toks[0]);
      if (Number.isFinite(got) && Math.abs(got - spec.target) < 1e-9)
        return { correct: true, feedback: spec.successFeedback };
      const landing = spec.commonResults.find((r) => Math.abs(r.value - got) < 1e-9);
      if (landing) return { correct: false, feedback: landing.feedback };
      return { correct: false, feedback: spec.fallbackFeedback };
    }
    case "fractionGrid": {
      const v = value as { rows: number; cols: number; shadeR: number; shadeC: number } | null | undefined;
      if (!v || typeof v.rows !== "number")
        return { correct: false, feedback: "Partition the square and shade each factor, then check." };
      if (v.rows === spec.den1 && v.shadeR === spec.num1 && v.cols === spec.den2 && v.shadeC === spec.num2)
        return { correct: true, feedback: spec.successFeedback };
      const cb = spec.commonBuilds.find(
        (b) => b.rows === v.rows && b.cols === v.cols && b.shadeR === v.shadeR && b.shadeC === v.shadeC
      );
      if (cb) return { correct: false, feedback: cb.feedback };
      if (v.rows !== spec.den1 || v.shadeR !== spec.num1)
        return { correct: false, feedback: spec.rowFeedback };
      return { correct: false, feedback: spec.colFeedback };
    }
    case "fractionCompare": {
      const v = value as "left" | "right" | "equal" | null | undefined;
      if (!v) return { correct: false, feedback: "Tap the bigger bar — or the equal sign — then check." };
      if (v === spec.answer) return { correct: true, feedback: spec.successFeedback };
      const fb = v === "left" ? spec.leftFeedback : v === "right" ? spec.rightFeedback : spec.equalFeedback;
      return { correct: false, feedback: fb ?? "Look at the piece sizes, not just the counts." };
    }
    case "oddEvenPairs": {
      const v = value as { paired: number; choice: "odd" | "even" | null } | null | undefined;
      if (!v || !v.choice)
        return { correct: false, feedback: "Pair the chips, then choose odd or even." };
      const ones = spec.mode === "onesDigit" ? spec.n % 10 : spec.n;
      const unpaired = ones - v.paired * 2;
      if (unpaired > 1) return { correct: false, feedback: spec.unfinishedFeedback };
      if (v.choice === spec.answer) return { correct: true, feedback: spec.successFeedback };
      const fb = v.choice === "odd" ? spec.oddFeedback : spec.evenFeedback;
      return { correct: false, feedback: fb ?? "Check the leftover: a full pairing means even; one left over means odd." };
    }
    case "absValueLine": {
      const picked = typeof value === "string" ? value : null;
      if (picked === spec.answerId) return { correct: true, feedback: spec.successFeedback };
      if (picked === "equal") return { correct: false, feedback: spec.equalFeedback ?? spec.missFeedback };
      const item = spec.items.find((i) => i.id === picked);
      return { correct: false, feedback: item?.feedback ?? spec.missFeedback };
    }
    case "tapDiagram": {
      const sel = new Set(Array.isArray(value) ? (value as string[]) : []);
      const correctIds = new Set(spec.hotspots.filter((h) => h.correct).map((h) => h.id));
      const ok = sel.size === correctIds.size && [...sel].every((id) => correctIds.has(id));
      if (ok) return { correct: true, feedback: spec.successFeedback };
      const wrongPick = spec.hotspots.find((h) => sel.has(h.id) && !h.correct && h.feedback);
      return { correct: false, feedback: wrongPick?.feedback ?? spec.missFeedback };
    }
    case "dragOrder": {
      const order = Array.isArray(value) ? (value as string[]) : spec.items.map((i) => i.id);
      if (order.join("|") === spec.correctOrder.join("|"))
        return { correct: true, feedback: spec.successFeedback };
      for (const m of spec.misorderFeedback) {
        const a = order.indexOf(m.first);
        const b = order.indexOf(m.second);
        if (a !== -1 && b !== -1 && a < b) return { correct: false, feedback: m.feedback };
      }
      return { correct: false, feedback: spec.missFeedback };
    }
    case "dragBucket": {
      const placed = (value ?? {}) as Record<string, string>;
      const right = spec.items.filter((i) => placed[i.id] === i.bucketId).length;
      const score = right / spec.items.length;
      if (right === spec.items.length)
        return { correct: true, feedback: spec.successFeedback, score: 1 };
      const wrong = spec.items.find((i) => placed[i.id] && placed[i.id] !== i.bucketId);
      /* S242 / ENG-01 R3. A RUNNING COUNT USED TO LEAD THIS STRING —
       * `${right} of ${spec.items.length} sorted right so far. ` — and what it was worth was
       * measured, not argued. With four items and two buckets it split the sixteen possible
       * sortings into TEN feedback classes instead of four, which takes a learner who knows no
       * mathematics at all from a 12.5% chance of passing a graded step inside the two-attempt
       * bound to 68.8% (`reports/eng/ENG01_R3_FISHING_ORACLE.csv`). On the 145 `interactive`
       * placements, where attempts are unbounded, it is the hill-climb itself: swap one item,
       * re-check, keep the swap if the number rose — §3.4 of the ENG-01 assessment.
       *
       * It is removed rather than softened because it is the one part of this string carrying NO
       * diagnosis. `wrong.feedback` names the misplaced item and says why it belongs elsewhere,
       * which is the pedagogy and stays; the count only scored the guess. The platform already
       * draws this exact line — `plotPoint` computes a partial score and deliberately keeps it out
       * of its feedback string — and `score` below still carries the number, for a surface that
       * wants to show progress AFTER the verdict under the same post-verdict rule `tone === "info"`
       * enforces everywhere else. */
      return {
        correct: false,
        feedback: wrong ? wrong.feedback : spec.missFeedback,
        score
      };
    }
    case "matchPairs": {
      const links = (value ?? {}) as Record<string, string>;
      const ok = spec.left.every((l) => links[l.id] === spec.pairs[l.id]);
      if (ok) return { correct: true, feedback: spec.successFeedback };
      for (const pe of spec.pairErrors)
        if (links[pe.left] === pe.right) return { correct: false, feedback: pe.feedback };
      return { correct: false, feedback: spec.missFeedback };
    }
    case "buildExpression": {
      const seq = Array.isArray(value) ? (value as string[]) : [];
      const key = seq.join("|");
      if (key === spec.correct.join("|") || spec.acceptAlso.some((a) => a.join("|") === key))
        return { correct: true, feedback: spec.successFeedback };
      const cb = spec.commonBuilds.find((c) => c.sequence.join("|") === key);
      return { correct: false, feedback: cb ? cb.feedback : spec.missFeedback };
    }
    case "plotPoint": {
      const pts = Array.isArray(value) ? (value as { x: number; y: number }[]) : [];
      const keyOf = (p: { x: number; y: number }) => `${p.x},${p.y}`;
      const sel = new Set(pts.map(keyOf));
      const want = new Set(spec.targets.map(keyOf));
      const hit = [...sel].filter((k) => want.has(k)).length;
      const ok = sel.size === want.size && hit === want.size;
      if (ok) return { correct: true, feedback: spec.successFeedback, score: 1 };
      const wrong = pts.find((p) => !want.has(keyOf(p)));
      const pe = wrong && spec.pointErrors.find((e) => e.x === wrong.x && e.y === wrong.y);
      return {
        correct: false,
        feedback: pe ? pe.feedback : spec.missFeedback,
        score: want.size ? hit / want.size : 0
      };
    }
    case "toggleExplore": {
      const states = (value ?? {}) as Record<string, boolean>;
      if (evalRule(spec.rule, states)) return { correct: true, feedback: spec.successFeedback };
      const cs = spec.commonStates.find((c) =>
        Object.entries(c.states).every(([k, v]) => !!states[k] === v)
      );
      return { correct: false, feedback: cs ? cs.feedback : spec.missFeedback };
    }
    case "steppedReveal": {
      const seen = typeof value === "number" ? value : 0;
      if (seen >= spec.panels.length) return { correct: true, feedback: spec.successFeedback };
      return { correct: false, feedback: spec.continueFeedback };
    }
    case "estimateSlider": {
      if (spec.choices.length > 0) {
        if (typeof value !== "number")
          return { correct: false, feedback: "Choose one of the shown estimates, then check." };
        const choice = spec.choices.find((candidate) => candidate.value === value);
        if (!choice)
          return { correct: false, feedback: "Choose one of the shown estimates, then check." };
        return choice.correct
          ? { correct: true, feedback: spec.successFeedback }
          : { correct: false, feedback: choice.feedback };
      }
      const v = typeof value === "number" ? value : (spec.start ?? spec.min);
      if (v >= spec.target / spec.acceptFactor && v <= spec.target * spec.acceptFactor)
        return { correct: true, feedback: spec.successFeedback };
      return { correct: false, feedback: v < spec.target ? spec.lowFeedback : spec.highFeedback };
    }
    case "tenFrame": {
      const v = typeof value === "number" ? value : spec.preFilled;
      if (v === spec.target) return { correct: true, feedback: spec.successFeedback };
      const cc = spec.commonCounts.find((c) => c.count === v);
      if (cc) return { correct: false, feedback: cc.feedback };
      const dir = v < spec.target ? "Add more dots" : "Take some dots out";
      return { correct: false, feedback: `${dir} — the frame should show ${spec.target}. ${spec.missFeedback}` };
    }
    case "numberLineHop": {
      // HOP-SIZE mode grades the STRIDE, not the landing.
      if (spec.hopSizeTargets) {
        const v = typeof value === "number" ? value : null;
        if (v === null) return { correct: false, feedback: "Set the hop size, then check." };
        const lo = spec.hopSizeMin ?? 1;
        const hi = spec.hopSizeMax ?? 12;
        const answer = hopSizeAnswer(spec.start, spec.hopSizeTargets, lo, hi);
        if (v === answer) return { correct: true, feedback: spec.successFeedback };
        const hitsAll = spec.hopSizeTargets.every((t) => (t - spec.start) % v === 0);
        // Lands on every mark but is not the biggest such stride — the "common but not greatest"
        // error, which is the one the word GREATEST exists to rule out.
        if (hitsAll) return { correct: false, feedback: spec.notLargestFeedback ?? spec.missFeedback };
        return { correct: false, feedback: spec.missesTargetFeedback ?? spec.missFeedback };
      }
      const sign = spec.direction === "back" ? -1 : 1;
      const land = spec.start + sign * spec.hop * spec.hops;
      const v = typeof value === "number" ? value : spec.start;
      if (v === land) return { correct: true, feedback: spec.successFeedback };
      const cl = spec.commonLandings.find((c) => c.value === v);
      return { correct: false, feedback: cl ? cl.feedback : spec.missFeedback };
    }
    case "baseTenCompose": {
      const b = (value ?? { hundreds: 0, tens: 0, ones: 0 }) as { hundreds?: number; tens: number; ones: number };
      const h = b.hundreds ?? 0;
      const total = h * 100 + b.tens * 10 + b.ones;
      const stdH = Math.floor(spec.target / 100);
      const stdT = Math.floor(spec.target / 10) % 10;
      const stdO = spec.target % 10;
      const ok = spec.requireStandard
        ? h === stdH && b.tens === stdT && b.ones === stdO
        : total === spec.target;
      if (ok) return { correct: true, feedback: spec.successFeedback };
      const cb = spec.commonBuilds.find((c) => (c.hundreds ?? 0) === h && c.tens === b.tens && c.ones === b.ones);
      if (cb) return { correct: false, feedback: cb.feedback };
      if (total !== spec.target)
        return { correct: false, feedback: `That builds ${total}, not ${spec.target}. ${spec.missFeedback}` };
      const std = stdH > 0 ? `${stdH} hundreds, ${stdT} tens and ${stdO} ones` : `${stdT} tens and ${stdO} ones`;
      return { correct: false, feedback: `${total} is right, but show it in standard form: ${std}. ${spec.missFeedback}` };
    }
    case "subitizeFlash": {
      const v = typeof value === "number" ? value : -1;
      if (v === spec.count) return { correct: true, feedback: spec.successFeedback };
      const cp = spec.commonPicks.find((c) => c.value === v);
      return { correct: false, feedback: cp ? cp.feedback : spec.missFeedback };
    }
  }
}

export function canCheck(spec: TWidget, value: unknown): boolean {
  switch (spec.type) {
    // A relation with no target is an explore instance: there is nothing to check it against, and
    // offering Check would promise a verdict the spec cannot give.
    case "numberLineRay":
      return Boolean(spec.target) && numberLineRayClaim(value) !== null;
    case "lineRelationLab":
    case "triangleConstraintLab":
    case "coordinateProofLab":
    case "solidSliceLab":
    case "triangleAngleLab":
    case "covariationScrubber":
    case "samplingBiasLab":
    case "shapeFamilyBuilder":
    case "unitRuler":
    case "conicLocusLab":
    case "derivativeRuleLab":
    case "relatedRatesLab":
      return value !== null && value !== undefined;
    case "proportionalReasoningLab": {
      if (!value || typeof value !== "object") return false;
      const v=value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown};
      const valid=new Set(proportionalReasoningExplorationKeys(spec));const ready=Array.isArray(v.revealed)&&(()=>{const set=new Set(v.revealed!.filter((item):item is string=>typeof item==="string"&&valid.has(item)));return set.size>=spec.requiredExplorations;})();if(!ready)return false;
      return spec.answerMode === "numeric"
        ? typeof v.numeric === "number" && !Number.isNaN(v.numeric)
        : typeof v.choiceId === "string" && v.choiceId.length > 0;
    }
    case "placeValueTransformLab": {
      if(!value||typeof value!=="object") return false;
      const v=value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown};
      const valid=new Set(placeValueTransformExplorationKeys(spec));const ready=Array.isArray(v.revealed)&&(()=>{const set=new Set(v.revealed!.filter((item):item is string=>typeof item==="string"&&valid.has(item)));return set.size>=spec.requiredExplorations;})();if(!ready)return false;
      return spec.answerMode==="numeric"?typeof v.numeric==="number"&&!Number.isNaN(v.numeric):typeof v.choiceId==="string"&&v.choiceId.length>0;
    }
    case "pointSetReasoningLab": {if(!value||typeof value!=="object")return false;const v=value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown};const valid=new Set(pointSetReasoningExplorationKeys(spec));if(!Array.isArray(v.revealed))return false;const set=new Set(v.revealed.filter((item):item is string=>typeof item==="string"&&valid.has(item)));if(!(set.size>=spec.requiredExplorations&&spec.requiredStageKeys.every(key=>set.has(key))))return false;if(spec.answerMode==="numeric")return typeof v.numeric==="number"&&!Number.isNaN(v.numeric);return typeof v.choiceId==="string"&&v.choiceId.length>0}
    case "geometricConstraintLab": {
      if(!value||typeof value!=="object")return false;const v=value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown};
      const valid=new Set(geometricConstraintExplorationKeys(spec));if(!Array.isArray(v.revealed))return false;const set=new Set(v.revealed.filter((item):item is string=>typeof item==="string"&&valid.has(item)));
      const ready=set.size>=spec.requiredExplorations&&spec.requiredStageKeys.every(key=>set.has(key));if(!ready)return false;
      if(spec.answerMode==="numeric")return typeof v.numeric==="number"&&!Number.isNaN(v.numeric);
      if(spec.answerMode==="choice")return typeof v.choiceId==="string"&&v.choiceId.length>0;
      return true;
    }
    case "exactNumberLab": {
      if(!value||typeof value!=="object")return false;const v=value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown;relation?:unknown};
      const valid=new Set(exactNumberExplorationKeys(spec));if(!Array.isArray(v.revealed))return false;const set=new Set(v.revealed.filter((item):item is string=>typeof item==="string"&&valid.has(item)));if(!(set.size>=spec.requiredExplorations&&spec.requiredStageKeys.every(key=>set.has(key))))return false;
      if(spec.answerMode==="numeric")return typeof v.numeric==="number"&&!Number.isNaN(v.numeric);
      if(spec.answerMode==="choice")return typeof v.choiceId==="string"&&v.choiceId.length>0;
      return v.relation==="lt"||v.relation==="eq"||v.relation==="gt";
    }
    case "affineRelationshipLab": {
      if(!value||typeof value!=="object")return false;
      const v=value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown;point?:unknown};
      const valid=new Set(affineRelationshipExplorationKeys(spec));
      if(!Array.isArray(v.revealed))return false;const set=new Set(v.revealed.filter((item):item is string=>typeof item==="string"&&valid.has(item)));
      if(!(set.size>=spec.requiredExplorations&&spec.requiredStageKeys.every(key=>set.has(key))))return false;
      if(spec.answerMode==="numeric")return typeof v.numeric==="number"&&!Number.isNaN(v.numeric);
      if(spec.answerMode==="choice")return typeof v.choiceId==="string"&&v.choiceId.length>0;
      return Array.isArray(v.point)&&v.point.length===2&&v.point.every(item=>typeof item==="number"&&!Number.isNaN(item));
    }
    case "quotientReasoningLab": {
      if (!value || typeof value !== "object") return false;
      const v = value as { revealed?: unknown; numeric?: unknown; choiceId?: unknown; fraction?: unknown };
      const valid = new Set(quotientReasoningExplorationKeys(spec));
      if (!Array.isArray(v.revealed)) return false;
      const set = new Set(v.revealed.filter((item): item is string => typeof item === "string" && valid.has(item)));
      if (!(set.size >= spec.requiredExplorations)) return false;
      if (spec.answerMode === "numeric") return typeof v.numeric === "number" && !Number.isNaN(v.numeric);
      if (spec.answerMode === "choice") return typeof v.choiceId === "string" && v.choiceId.length > 0;
      if (spec.answerMode === "fraction") {
        const f = v.fraction && typeof v.fraction === "object" ? v.fraction as { num?: unknown; den?: unknown } : {};
        return typeof f.num === "number" && Number.isInteger(f.num) && typeof f.den === "number" && Number.isInteger(f.den) && f.den > 0;
      }
      return true;
    }
    case "graphStoryLab":
      return spec.mode === "read"
        ? typeof value === "string" && value.length > 0
        : Boolean(value && typeof value === "object" && Array.isArray((value as {segmentIds?:unknown}).segmentIds) && (value as {segmentIds:string[]}).segmentIds.length > 0);
    case "conditionalTableLab":
      return spec.mode === "read" ? typeof value === "string" && value.length > 0 : value !== null && value !== undefined;
    case "verticalLineScanner": {
      const v=value as {verdict?:string|null}|null|undefined;
      return !!v?.verdict;
    }
    case "mcq":
      return typeof value === "string" && value.length > 0;
    case "numeric":
      return typeof value === "number" && !Number.isNaN(value);
    case "fractionEntry": {
      const v = value as { num?: number; den?: number } | null | undefined;
      return !!v && typeof v.num === "number" && typeof v.den === "number" && v.den >= 1;
    }
    case "placeCompare":
    case "rationalCompare": {
      return value === "lt" || value === "eq" || value === "gt";
    }
    case "mixedRegroup": {
      const v = value as { whole?: number; num?: number; complete?: boolean } | null | undefined;
      return v?.complete === true && typeof v.whole === "number" && typeof v.num === "number";
    }
    case "columnCalc": {
      const v = value as { value?: number | null; complete?: boolean } | null | undefined;
      return v?.complete === true && typeof v.value === "number";
    }
    case "slopeTriangle": {
      const v = value as { run?: number; rise?: number } | null | undefined;
      return typeof v?.run === "number" && typeof v?.rise === "number" && !(v.run === 0 && v.rise === 0);
    }
    case "graphRead": {
      const v = value as { picked?: number } | null | undefined;
      return typeof v?.picked === "number" && Number.isFinite(v.picked);
    }
    case "unitChain": {
      const v = value as { unitIdx?: number; value?: number } | null | undefined;
      return typeof v?.unitIdx === "number" && v.unitIdx === spec.hops.length && typeof v.value === "number" && Number.isFinite(v.value);
    }
    case "evalOrder": {
      const v = value as { tokens?: string[] } | null | undefined;
      return Array.isArray(v?.tokens) && v.tokens.length === 1 && Number.isFinite(Number(v.tokens[0]));
    }
    case "pointEntry": {
      const v = value as unknown[] | null | undefined;
      return Array.isArray(v) && v.length === spec.answer.length && v.every((x) => typeof x === "number" && !Number.isNaN(x));
    }
    case "scaledCircleLab":
      return typeof value === "string" && spec.choices.some((choice) => choice.id === value);
    case "percentChangeLab":
      return typeof value === "string" && spec.choices.some((choice) => choice.id === value);
    case "equationOutcomeLab": {
      if(spec.mode==="classify")return typeof value === "string" && spec.choices.some((choice) => choice.id === value);
      const state=value&&typeof value==="object"&&!Array.isArray(value)?value as {stageIds?:string[];numeric?:number|""}:{};
      const valid=new Set(spec.operations.map(operation=>operation.id));
      const explored=Array.isArray(state.stageIds)?new Set(state.stageIds.filter(id=>valid.has(id))).size:0;
      return explored>=spec.requiredMoves&&(spec.answerMode==="sequence"||typeof state.numeric==="number");
    }
    case "sequenceBuild": {
      if (spec.task === "dial") return true;
      const state = value && typeof value === "object" && !Array.isArray(value) ? value as { explored?: string[]; numeric?: number | ""; choiceId?: string } : {};
      const truth = sequenceReasoningTruth(spec), valid = new Set(truth.stages.map((stage) => stage.key));
      const explored = Array.isArray(state.explored) ? state.explored.filter((key) => valid.has(key)) : [];
      const ready = explored.length >= spec.requiredExplorations && spec.requiredStageKeys.every((key) => explored.includes(key));
      return ready && (spec.answerMode === "numeric" ? typeof state.numeric === "number" : spec.answerMode === "choice" ? typeof state.choiceId === "string" : false);
    }
    case "signedFractionLab":
      return typeof value === "string" && spec.choices.some((choice) => choice.id === value);
    case "triangleClosureLab": {
      const state = value as { choice?: string; moves?: number } | null | undefined;
      return !!state?.choice && (state.moves ?? 0) >= spec.requiredMoves;
    }
    case "trialProbabilityLab":
      return typeof value === "string" && spec.choices.some((choice) => choice.id === value);
    case "compoundEventLab":
      return typeof value === "string" && spec.choices.some((choice) => choice.id === value);
    case "compositeAreaLab":
      return typeof value === "string" && spec.choices.some((choice) => choice.id === value);
    case "shapeHierarchyLab":
      return typeof value === "string" && spec.choices.some((choice) => choice.id === value);
    case "distributionCompareLab":
      return spec.mode === "measure"
        ? typeof value === "number" && spec.measureChoices.some((c) => c.value === value)
        : typeof value === "string" && spec.judgeOptions.some((o) => o.id === value);
    case "areaModel":
      if (spec.countGrid) return typeof value === "number" && value > 0;
      return true;
    case "dotPlot": {
      // Read mode: at least one X marked. Build mode: unchanged — any state is checkable,
      // exactly as when this type sat in the always-true label chain below.
      if (spec.given && spec.askIndex !== undefined) {
        const v = value as number[] | null | undefined;
        return Array.isArray(v) && v.some((c) => c > 0);
      }
      return true;
    }
    case "slider":
    case "lineExplore":
    case "fractionBar":
    case "quadraticExplore":
    case "unitCircleExplore":
    case "systemsExplore":
    case "numberLinePlace":
    case "functionMachine":
    case "probabilityArea":
    case "hundredthsGrid":
    case "transformExplore":
    case "angleMeasure":
    case "rotationLab":
    case "dilationExplore":
    case "barBuilder":
    case "boxPlot":
    case "placeValue":
    case "doubleNumberLine":
    case "scatterFit":
    case "fractionOfSet":
    case "percentBar":
    case "feasibleRegionExplore":
    case "parametricTrace":
    case "integerChips":
    case "volumeBuilder":
    case "netFold":
    case "ratioTable":
    case "elapsedTime":
    case "distanceGrid":
    case "treeDiagram":
    case "spinnerSim":
    case "circleAngleExplore":
    case "expLogExplore":
    case "secantSlope":
    case "argandExplore":
    case "vectorExplore":
    case "matrixTransform":
    case "circleMeasureExplore":
    case "polarTrace":
    case "triangleSolve":
    case "derivativeTrace":
    case "riemannSum":
    case "accumulateArea":
    case "sliceSum":
    case "slopeField":
    case "taylorApprox":
    case "compassConstruct":
    case "quadDrag":
    case "radicalCheck":
    case "sampleSim":
    case "ciCapture":
    case "algebraTiles":
    case "clockSet":
    case "inversePipeline":
    case "solveBalance":
    case "balanceScale":
    case "toggleExplore":
    case "dragOrder":
      return true;
    case "estimateSlider":
      return spec.choices.length > 0
        ? typeof value === "number" && spec.choices.some((choice) => choice.value === value)
        : true;
    case "shuffleTest": {
      const v = value as { shuffles: number; verdict: string | null } | null | undefined;
      return !!v && typeof v.shuffles === "number" && v.shuffles > 0 && v.verdict !== null;
    }
    case "graphZoom": {
      const v = value as { zoom: number; verdict: string | null } | null | undefined;
      return !!v && typeof v.zoom === "number" && v.zoom > 0 && v.verdict !== null;
    }
    case "shapeParts":
      return Array.isArray(value) && value.length > 0;
    case "binomialAreaLab": {
      const v = value as { a?: number; b?: number } | null | undefined;
      return !!v && typeof v.a === "number" && typeof v.b === "number";
    }
    case "extraneousRootLab":
      return typeof (value as { pick?: number | null } | null | undefined)?.pick === "number";
    case "signChart":
      return Array.isArray(value) && value.every((x) => x === "+" || x === "-");
    case "lengthCompare": {
      if (spec.mode === "difference") return typeof value === "number";
      if (spec.mode === "align") {
        // Checkable while UNALIGNED even with no pick — "I can already tell" is the
        // designed wrong path (it fires the unaligned diagnosis). Once the starts are
        // lined up, a pick is required.
        const v =
          value && typeof value === "object"
            ? (value as { offsets?: Record<string, number>; picked?: string | null })
            : null;
        const aligned = spec.items.every((i) => {
          const o = v?.offsets?.[i.id];
          return (typeof o === "number" ? o : i.startOffset) === 0;
        });
        return !aligned || (typeof v?.picked === "string" && v.picked.length > 0);
      }
      return typeof value === "string" && value.length > 0;
    }
    case "moneyBoard": {
      if (spec.mode === "count") {
        const v = value as { entry?: number | null } | null | undefined;
        return Boolean(v && v.entry !== null && v.entry !== undefined);
      }
      const v = value as Record<number, number> | null | undefined;
      return Boolean(v && Object.values(v).some((c) => c > 0));
    }
    case "fractionGrid": {
      const v = value as { rows?: number } | null | undefined;
      return Boolean(v && typeof v.rows === "number");
    }
    case "fractionCompare":
      return value === "left" || value === "right" || value === "equal";
    case "oddEvenPairs": {
      const v = value as { choice?: string } | null | undefined;
      return Boolean(v && v.choice);
    }
    case "absValueLine":
      return typeof value === "string" && value.length > 0;
    case "tapDiagram":
      return Array.isArray(value) && value.length > 0;
    case "dragBucket":
      return (
        !!value &&
        spec.items.every((i) => typeof (value as Record<string, string>)[i.id] === "string")
      );
    case "matchPairs":
      return (
        !!value && spec.left.every((l) => typeof (value as Record<string, string>)[l.id] === "string")
      );
    case "buildExpression":
      return Array.isArray(value) && value.length > 0;
    case "plotPoint":
      return Array.isArray(value) && value.length > 0;
    case "steppedReveal":
      return typeof value === "number" && value >= spec.panels.length;
    case "tenFrame":
    case "numberLineHop":
    case "subitizeFlash":
      return typeof value === "number";
    case "baseTenCompose": {
      const b = value as { hundreds?: number; tens?: number; ones?: number } | null;
      return (
        !!b && typeof b.tens === "number" && typeof b.ones === "number" && (b.hundreds ?? 0) + b.tens + b.ones > 0
      );
    }
  }
}

export function correctAnswerText(spec: TWidget): string {
  switch (spec.type) {
    case "numberLineRay":
      return spec.target ? numberLineRaySolved(spec.target, spec.variable)?.text ?? "" : "";
    case "circleMeasureExplore": {
      if (spec.mode === "radiusScale") {
        const r = spec.targetRadius ?? 0;
        const t = circleScaleReadouts(r);
        const q =
          spec.askQuantity === "diameter"
            ? `diameter ${t.diameter}`
            : spec.askQuantity === "area"
              ? `area ${t.areaCoef}\u03c0`
              : `circumference ${t.circumferenceCoef}\u03c0`;
        return `radius ${r} \u2014 ${q}`;
      }
      // Restored verbatim: my first edit over-simplified these and broke evaluate.new.test.ts.
      return spec.mode === "arcSector"
        ? `a central angle of ${spec.targetAngle}\u00b0`
        : `a length of ${spec.targetLength}`;
    }
    case "shapeParts":
      return `${shapePartCount(spec.shape, spec.sides, spec.part)} ${spec.part}`;
    case "binomialAreaLab": {
      const t = binomialExpand(spec.pX, spec.targetA, spec.qX, spec.targetB);
      const side = (c: number, k: number) => `${c === 1 ? "" : c}x${k === 0 ? "" : k > 0 ? " + " + k : " \u2212 " + Math.abs(k)}`;
      const asked = spec.asks === "x2" ? t.x2 : spec.asks === "middle" ? t.middle : t.constant;
      const name = spec.asks === "x2" ? "x\u00b2 coefficient" : spec.asks === "middle" ? "x coefficient" : "constant term";
      return `(${side(spec.pX, spec.targetA)})(${side(spec.qX, spec.targetB)}) \u2014 ${name} ${asked}`;
    }
    case "extraneousRootLab":
      return spec.targetPhase === "identifyPhantom"
        ? `x = ${spec.phantomRoot} — the candidate squaring invented`
        : `x = ${spec.trueRoot} — the candidate that genuinely solves it`;
    case "lineRelationLab": return `${spec.targetRelation} lines`;
    case "triangleConstraintLab": return `${spec.targetCriterion} at ${spec.targetAngle}° locks one congruent triangle`;
    case "coordinateProofLab": return `D = (${spec.target[0]}, ${spec.target[1]}) with ${spec.requiredEvidence.join(" and ")} evidence`;
    case "solidSliceLab": return `slice at ${Math.round(spec.targetFraction*100)}%${spec.comparisonRequired?" with the comparison solid visible":""}`;
    case "triangleAngleLab": return `angle A ≈ ${spec.targetAngleA}°, while A + B + C stays 180°`;
    case "verticalLineScanner": return spec.targetVerdict === "function" ? "function: no vertical line hits more than once" : "not a function: at least one vertical line hits twice";
    case "covariationScrubber": return `${spec.inputLabel} = ${spec.targetInput}, ${spec.outputLabel} = ${spec.a*spec.targetInput+spec.b}`;
    case "samplingBiasLab": return `${spec.targetMethod} sample, size at least ${spec.targetSize}, after ${spec.requiredDraws} draws`;
    case "shapeFamilyBuilder": return `${spec.targetName}: ${spec.targetSides} sides, ${spec.targetRightAngles} right angles, ${spec.targetEqualSides} equal sides, ${spec.targetParallelPairs} parallel pairs`;
    case "shapeHierarchyLab": return spec.choices.find((choice)=>shapeHierarchyChoiceCorrect(spec,choice))?.label ?? "the evidence-backed shape claim";
    case "unitRuler": return `${spec.requiredPlacements} gap-free units of size ${spec.targetUnitSize}, aligned at zero`;
    case "proportionalReasoningLab": {
      const truth=proportionalReasoningTruth(spec);
      if(spec.answerMode==="numeric") return `${truth.answerNumber}${spec.answerUnit?` ${spec.answerUnit}`:""}`;
      return spec.choices.find((choice)=>proportionalReasoningChoiceCorrect(spec,choice))?.label ?? truth.answerClaim ?? "the proportional conclusion";
    }
    case "placeValueTransformLab": {
      const truth=placeValueTransformTruth(spec);
      if(spec.answerMode==="numeric") return `${truth.answerNumber}${spec.answerUnit?` ${spec.answerUnit}`:""}`;
      return spec.choices.find((choice)=>placeValueTransformChoiceCorrect(spec,choice))?.label??truth.answerClaim??"the derived place-value conclusion";
    }
    case "pointSetReasoningLab": {const truth=pointSetReasoningTruth(spec);if(spec.answerMode==="numeric")return `${truth.answerNumber}${spec.answerUnit?` ${spec.answerUnit}`:""}`;if(spec.answerMode==="choice")return spec.choices.find(choice=>pointSetReasoningChoiceCorrect(spec,choice))?.label??truth.answerClaim??"the point-set conclusion";return "complete the point-set exploration"}
    case "geometricConstraintLab": {
      const truth=geometricConstraintTruth(spec);
      if(spec.answerMode==="numeric")return `${truth.answerNumber}${spec.answerUnit?` ${spec.answerUnit}`:""}`;
      if(spec.answerMode==="choice")return spec.choices.find(choice=>geometricConstraintChoiceCorrect(spec,choice))?.label??truth.answerClaim??"the geometry-constraint conclusion";
      return "complete the geometry-constraint exploration";
    }
    case "exactNumberLab": {
      const truth=exactNumberTruth(spec);
      if(spec.answerMode==="numeric")return `${truth.answerNumber}${spec.answerUnit?` ${spec.answerUnit}`:""}`;
      if(spec.answerMode==="relation")return truth.answerRelation==="lt"?"<":truth.answerRelation==="gt"?">":"=";
      if(spec.answerMode==="choice")return spec.choices.find(choice=>exactNumberChoiceCorrect(spec,choice))?.label??truth.answerClaim??"the exact-number conclusion";
      return "complete the exact-number exploration";
    }
    case "affineRelationshipLab": {
      const truth=affineRelationshipTruth(spec);
      if(spec.answerMode==="numeric")return `${truth.answerNumber}${spec.answerUnit?` ${spec.answerUnit}`:""}`;
      if(spec.answerMode==="choice")return spec.choices.find(choice=>affineRelationshipChoiceCorrect(spec,choice))?.label??truth.answerClaim??"the derived affine conclusion";
      if(spec.answerMode==="point"&&truth.answerPoint)return `(${truth.answerPoint[0]}, ${truth.answerPoint[1]})`;
      return "complete the affine relationship exploration";
    }
    case "quotientReasoningLab": {
      const truth = quotientReasoningTruth(spec);
      if (spec.answerMode === "numeric") return `${truth.answerNumber}${spec.answerUnit ? ` ${spec.answerUnit}` : ""}`;
      if (spec.answerMode === "choice") return spec.choices.find((choice) => quotientReasoningChoiceCorrect(spec, choice))?.label ?? truth.answerClaim ?? "the exact quotient claim";
      if (spec.answerMode === "fraction" && truth.answerFraction) return quotientRationalKey(truth.answerFraction);
      return "complete the exact quotient-state exploration";
    }
    case "graphStoryLab": {
      const truth = graphStoryTruth(spec);
      if (spec.mode === "read") return spec.choices.find((choice) => graphStoryChoiceCorrect(spec, choice))?.label ?? truth.answerClaim;
      return spec.answerLabel ?? spec.segments.map((segment) => segment.label).join(" → ");
    }
    case "conditionalTableLab": {
      if (spec.mode === "read" && spec.readMetric) {
        const truth=conditionalTableReadTruth(spec.counts,spec.readMetric,spec.targetCell);
        // S237 — the reveal surface states the FRACTION, which is exact. `truth.value` is rounded to
        // four places (schema.ts) and is the GRADING key, so it must not move; but printing it after
        // an "=" made 20/30 read as "= 66.6667%", which is false. The percent is now marked
        // approximate unless it is exact.
        return spec.readMetric.startsWith("relative")
          ? `${truth.numerator}/${truth.denominator}${truth.value === Math.round(truth.value * 100) / 100 ? ` = ${truth.value}%` : ` (\u2248 ${truth.value}%)`}`
          : String(truth.value);
      }
      return `${spec.targetCell} within ${spec.targetCondition}; the condition supplies the denominator`;
    }
    case "conicLocusLab": return `eccentricity e = ${(spec.targetEccentricityTenths/10).toFixed(1)}`;
    case "derivativeRuleLab": return spec.mode === "product" ? `h ≤ ${spec.targetH}, so the second-order corner vanishes` : spec.mode === "quotient" ? `u′ = ${spec.targetInnerRate} and v′ = ${spec.targetOuterRate}, giving (${spec.targetInnerRate}·${spec.quotientV} − ${spec.quotientU}·${spec.targetOuterRate})/${spec.quotientV}²` : `inner rate ${spec.targetInnerRate} and outer rate ${spec.targetOuterRate}, giving total rate ${spec.targetInnerRate*spec.targetOuterRate}`;
    case "relatedRatesLab": return spec.model === "circleArea" ? `radius r = ${spec.targetX}, where dA/dt = 2πr·dr/dt = ${2 * spec.targetX * spec.horizontalRate}π` : spec.model === "sphereVolume" ? `radius r = ${spec.targetX}, where dV/dt = 4πr²·dr/dt = ${4 * spec.targetX * spec.targetX * spec.horizontalRate}π` : `ladder foot x = ${spec.targetX}, with x² + y² = ${spec.ladderLength}²`;
    case "solveBalance": {
      const xs = (spec.c - spec.b) / spec.a;
      const r = spec.relation ?? "eq";
      if (r === "eq") return `x = ${xs}`;
      const SYM = { eq: "=", lt: "<", gt: ">", le: "\u2264", ge: "\u2265" } as const;
      return `x ${SYM[spec.a < 0 ? FLIP_REL[r] : r]} ${xs}`;
    }
    case "inversePipeline": {
      const SYM = { add: "+", sub: "\u2212", mul: "\u00d7", div: "\u00f7" } as const;
      return spec.answer
        .map((id) => {
          const c = spec.tray.find((t) => t.id === id);
          return c ? `${SYM[c.op]}${Math.abs(c.n)}` : "?";
        })
        .join(" \u2192 ");
    }
    case "mcq":
      return spec.options.find((o) => o.correct)?.label ?? "";
    case "numeric":
      return `${spec.answer}${spec.unit ? ` ${spec.unit}` : ""}`;
    case "fractionEntry": {
      const frac = spec.answerNum > 0 ? `${spec.answerNum}/${spec.answerDen}` : "";
      const wholePart = spec.answerWhole > 0 ? String(spec.answerWhole) : "";
      const body = [wholePart, frac].filter(Boolean).join(" ") || "0";
      const signed = spec.answerSign === -1 ? `\u2212${body}` : body;
      return `${signed}${spec.unit ? ` ${spec.unit}` : ""}`;
    }
    case "placeCompare": {
      const sym = spec.answer === "lt" ? "<" : spec.answer === "gt" ? ">" : "=";
      return `${spec.left} ${sym} ${spec.right}`;
    }
    case "rationalCompare": {
      const sym = spec.answer === "lt" ? "<" : spec.answer === "gt" ? ">" : "=";
      const disp = (o: { num: number; den: number } | { value: string }) =>
        "num" in o ? `${o.num}/${o.den}` : o.value;
      return `${disp(spec.left)} ${sym} ${disp(spec.right)}`;
    }
    case "pointEntry": {
      const [lb, rb] = spec.delimiter === "angle" ? ["\u27e8", "\u27e9"] : ["(", ")"];
      return `${lb}${spec.answer.join(", ")}${rb}`;
    }
    case "slider":
      return `${spec.target}${spec.unitLabel ? ` (${spec.unitLabel})` : ""}`;
    case "lineExplore":
      return `y = ${spec.targetSlope}x ${spec.targetIntercept >= 0 ? `+ ${spec.targetIntercept}` : `− ${Math.abs(spec.targetIntercept)}`}`;
    case "fractionBar":
      return `any fraction equal to ${spec.targetNum}/${spec.targetDen} (e.g. ${2 * spec.targetNum}/${2 * spec.targetDen})`;
    case "unitCircleExplore":
      if (spec.dials)
        return spec.dials.map((d) => `${d.param} = ${d.target}`).join(", ");
      if (spec.targetFeature)
        return `${spec.targetFeature.kind} at x = ${spec.targetFeature.x}° (±${spec.targetFeature.tol}°)`;
      return `θ = ${spec.targetAngle}°`;
    case "numberLinePlace":
      return spec.fractionDen !== undefined
        ? `${spec.target}/${spec.fractionDen} (mark ${spec.target} of ${spec.fractionDen})`
        : String(spec.target);
    case "probabilityArea": {
      const total = spec.rows * spec.cols;
      return `shade ${(spec.targetNum * total) / spec.targetDen} of ${total}`;
    }
    case "hundredthsGrid": {
      const total = spec.mode === "tenths" ? 10 : 100;
      const dec = (spec.target / total).toFixed(spec.mode === "tenths" ? 1 : 2);
      return `shade ${spec.target} of ${total} (${dec})`;
    }
    case "transformExplore":
      return spec.target.map((p) => `(${p[0]}, ${p[1]})`).join(" ");
    case "scaledCircleLab":
      return spec.choices.find((choice) => scaledCircleChoiceCorrect(spec, choice))?.label ?? String(scaledCircleTarget(spec));
    case "percentChangeLab":
      return spec.choices.find((choice) => percentChangeChoiceCorrect(spec, choice))?.label ?? String(percentChangeTarget(spec));
    case "equationOutcomeLab": {
      if(spec.mode==="classify")return spec.choices.find((choice) => equationOutcomeChoiceCorrect(spec, choice))?.label ?? equationOutcomeTruth(spec);
      const truth=equationTransformTruth(spec),route=truth.states.map(entry=>entry.operation.label).join(" → ");
      return spec.answerMode==="numeric"?`${route}; ${spec.variable} ${truth.answerRelation==="lt"?"<":truth.answerRelation==="le"?"≤":truth.answerRelation==="gt"?">":truth.answerRelation==="ge"?"≥":"="} ${truth.answerNumber}`:route;
    }
    case "signedFractionLab": {
      const truth = signedFractionTruth(spec);
      return spec.choices.find((choice) => signedFractionChoiceCorrect(spec, choice))?.label ?? `${truth.sign < 0 ? "−" : ""}${truth.num}/${truth.den}`;
    }
    case "triangleClosureLab":
      return spec.choices.find((choice) => triangleClosureChoiceCorrect(spec, choice))?.label ?? (triangleClosureForms(spec.sides) ? "forms" : "does not form");
    case "angleMeasure":
      return `${spec.targetAngle}°`;
    case "rotationLab":
      return spec.mode === "symmetryOrder"
        ? `${spec.targetAngle}° (order ${360 / spec.targetAngle})`
        : `${spec.targetAngle}°`;
    case "dilationExplore":
      return `k = ${spec.targetK}`;
    case "barBuilder":
      return spec.categories.map((c, i) => `${c}: ${spec.target[i]}`).join(", ");
    case "dotPlot":
      if (spec.given && spec.askIndex !== undefined)
        return `${spec.given[spec.askIndex]} — the X's above ${dotPlotLabel(spec.values[spec.askIndex], spec.denominator)}`;
      return spec.values.map((v, i) => `${dotPlotLabel(v, spec.denominator)}: ${spec.target[i]}`).join(", ");
    case "boxPlot":
      return `min ${spec.targetMin}, Q1 ${spec.targetQ1}, median ${spec.targetMed}, Q3 ${spec.targetQ3}, max ${spec.targetMax}`;
    case "compoundEventLab": {
      const choice = spec.choices.find((candidate) => compoundEventChoiceCorrect(spec, candidate));
      return choice?.label ?? (spec.mode === "count" ? String(compoundEventTotal(spec)) : `${compoundEventFavourable(spec)}/${compoundEventTotal(spec)}`);
    }
    case "compositeAreaLab": {
      const choice = spec.choices.find((candidate) => compositeAreaChoiceCorrect(spec, candidate));
      return choice?.label ?? String(compositeAreaTarget(spec));
    }
    case "trialProbabilityLab": {
      const g = gcd(spec.favourable, spec.total) || 1;
      return `${spec.favourable / g}/${spec.total / g}`;
    }
    case "distributionCompareLab": {
      if (spec.mode === "measure") return `${spec.answer} variability-unit${spec.answer === 1 ? "" : "s"}`;
      return spec.judgeOptions.find((o) => o.correct)?.label ?? "the supported conclusion";
    }
    case "areaModel":
      return spec.countGrid ? `${spec.targetArea} unit squares` : `area = ${spec.targetArea}`;
    case "placeValue":
      return String(spec.target);
    case "doubleNumberLine":
      return String(spec.targetTop);
    case "scatterFit":
      return "a line following the points' trend";
    case "fractionOfSet":
      return String((spec.setSize * spec.num) / spec.den);
    case "percentBar":
      return `${spec.targetPercent}% = ${(spec.whole * spec.targetPercent) / 100}`;
    case "feasibleRegionExplore":
      return `fence at x = ${spec.verticalTarget}`;
    case "parametricTrace":
      return `t ≈ ${spec.targetT.toFixed(2)}`;
    case "integerChips":
      return String(spec.target);
    case "mixedRegroup": {
      const t = mixedRegroupTruth(spec);
      return t.num === 0 ? String(t.whole) : t.whole === 0 ? `${t.num}/${spec.den}` : `${t.whole} ${t.num}/${spec.den}`;
    }
    case "columnCalc":
      return String(columnCalcTruth(spec.op, spec.a, spec.b));
    case "slopeTriangle":
      return `slope ${slopeTriangleLabel(spec)}`;
    case "graphRead": {
      const n = graphReadAnswer(spec);
      return `${n} ${n === 1 ? spec.unitNoun : spec.unitNounPlural}`;
    }
    case "unitChain":
      return `${unitChainAnswer(spec)} ${spec.targetUnit}`;
    case "evalOrder":
      return String(spec.target);
    case "volumeBuilder":
      return spec.solid === "prism"
        ? `volume = ${spec.targetVolume}`
        : `volume = ${spec.targetVolume}\u03c0`;
    case "netFold":
      return `surface area = ${spec.targetSurfaceArea}`;
    case "ratioTable":
      return String(spec.targetB);
    case "elapsedTime":
      return `${Math.floor(spec.targetMinutes / 60)}h ${spec.targetMinutes % 60}min`;
    case "distanceGrid":
      return `(${spec.targetPoint[0]}, ${spec.targetPoint[1]})`;
    case "treeDiagram":
      return `${spec.targetA} × ${spec.targetB} = ${spec.targetA * spec.targetB}`;
    case "spinnerSim":
      return `${spec.targetFavourable} of ${spec.sectors}`;
    case "circleAngleExplore":
      return `${spec.targetAngle}°`;
    case "expLogExplore":
      return `base ${spec.targetBase}`;
    case "signChart":
      return signChartSigns(spec.roots, spec.leadingPositive).join(" ");
    case "circleMeasureExplore":
      return spec.mode === "arcSector" ? `${spec.targetAngle}°` : `a length of ${spec.targetLength}`;
    case "polarTrace":
      return spec.mode === "rose" ? `${spec.targetPetals} petals` : `a = ${spec.targetA}`;
    case "sequenceBuild": {
      if (spec.task === "dial") return spec.mode === "arithmetic" ? `d = ${spec.targetD}` : `r = ${spec.targetRTenths / 10}`;
      const truth = sequenceReasoningTruth(spec);
      if (truth.answerNumber !== undefined) return String(truth.answerNumber);
      return spec.choices.find((choice) => choice.claim === truth.answerClaim)?.label ?? truth.answerClaim ?? "the exact sequence result";
    }
    case "triangleSolve":
      return spec.mode === "sas"
        ? `${spec.target} (the third side)`
        : spec.mode === "ratios"
          ? `${spec.target}° — where ${spec.ratio ?? "opp/hyp"} reads ${triangleRatio(spec.target, spec.ratio ?? "opp/hyp").toFixed(3)}`
          : `${spec.target}°`;
    case "derivativeTrace":
      return spec.mode === "slope" ? `an x where f′(x) = ${spec.targetSlope}` : `x = ${spec.targetX}`;
    case "riemannSum":
      return `an estimate within ${spec.tolerance} of ${Number(exactArea(spec.fn, spec.a, spec.b).toFixed(3))}`;
    case "accumulateArea":
      return spec.mode === "area" ? `an accumulated area of ${spec.targetArea}` : `x = ${spec.targetX}`;
    case "sliceSum":
      return `an estimate within ${spec.tolerance} of ${Number(sliceExact(spec.mode).toFixed(4))}`;
    case "slopeField":
      return `a starting value of y = ${spec.targetY0}`;
    case "taylorApprox":
      return spec.mode === "terms" ? `${spec.targetN} terms` : `x = ${spec.targetXTenths / 10}`;
    case "compassConstruct":
      return `a compass radius of ${spec.target}`;
    case "quadDrag":
      return `(${spec.targetX}, ${spec.targetY}) — ${spec.targetName}`;
    case "radicalCheck":
      return `x = ${spec.target}`;
    case "vectorExplore":
      return spec.mode === "add"
        ? `a v that lands the sum on (${spec.targetX}, ${spec.targetY})`
        : `a v with u · v = ${spec.targetDot}`;
    case "matrixTransform":
      return `${spec.targetName}: î ↦ (${spec.ta}, ${spec.tc}), ĵ ↦ (${spec.tb}, ${spec.td}) — the matrix [[${spec.ta} ${spec.tb}], [${spec.tc} ${spec.td}]]`;
    case "argandExplore": {
      const im = spec.targetIm;
      const txt = `${spec.targetRe}${im < 0 ? " − " : " + "}${Math.abs(im)}i`;
      return spec.mode === "multiply" ? `a z whose product is ${txt}` : txt;
    }
    case "secantSlope":
      return spec.mode === "average"
        ? `a gap of ${spec.targetH}`
        : spec.mode === "rolle"
        ? `matching endpoint heights across a gap of ${spec.targetH}, with a flat tangent between them`
        : `squeeze the gap to ${spec.targetH} or less (slope → ${curveSlopeAt(spec.curve, spec.a, spec.shiftX)})`;
    case "graphZoom":
      return spec.targetVerdict === "limit-exists"
        ? `the limit exists (it is ${spec.leftValue})`
        : "the limit does not exist";
    case "sampleSim":
      return `samples of ${spec.targetSize}, at least ${spec.requiredDraws} of them`;
    case "ciCapture":
      return `${spec.targetLevel}% intervals, at least ${spec.requiredIntervals} of them`;
    case "shuffleTest":
      return spec.targetVerdict === "real"
        ? "bigger than chance alone tends to produce"
        : "within what chance alone tends to produce";
    case "algebraTiles":
      return `${spec.targetX}x ${spec.targetConst >= 0 ? "+" : "−"} ${Math.abs(spec.targetConst)}`;
    case "clockSet":
      return `${spec.targetHour}:${String(spec.targetMinute).padStart(2, "0")}`;
    case "balanceScale":
      return `x = ${(spec.c - spec.b) / spec.a}`;
    case "functionMachine":
      return `input = ${(spec.targetOutput - spec.b) / spec.a} (output ${spec.targetOutput})`;
    case "systemsExplore": {
      const xs = (spec.b2 - spec.b1) / (spec.m1 - spec.m2);
      const ys = spec.m1 * xs + spec.b1;
      return `(${xs}, ${ys})`;
    }
    case "quadraticExplore":
      return `y = ${spec.aDen === 1 ? spec.targetA : fractionText(spec.targetA, spec.aDen)}(x ${spec.targetH >= 0 ? `− ${spec.targetH}` : `+ ${Math.abs(spec.targetH)}`})² ${spec.targetK >= 0 ? `+ ${spec.targetK}` : `− ${Math.abs(spec.targetK)}`}`;
    case "lengthCompare": {
      const label = spec.items.find((i) => i.id === spec.answerId)?.label ?? "";
      if (spec.mode === "difference")
        return `${spec.targetDifference} ${spec.unitLabel ?? "units"} — how far ${label} overhangs`;
      return spec.mode === "align" ? `line up the starting ends, then ${label}` : label;
    }
    case "moneyBoard": {
      if (spec.mode === "count") return `${spec.answerCents ?? 0}¢ — every coin's value counted`;
      const target =
        spec.mode === "change"
          ? (spec.paidCents ?? 0) - (spec.priceCents ?? 0)
          : spec.targetCents ?? 0;
      const d = (target / 100).toFixed(2);
      return spec.showDollars ? `${target}¢ ($${d}) built exactly from the tray` : `${target}¢ built exactly from the tray`;
    }
    case "fractionGrid":
      return `${spec.den1} rows with ${spec.num1} shaded \u00d7 ${spec.den2} columns with ${spec.num2} shaded \u2014 the overlap shows ${spec.num1 * spec.num2}/${spec.den1 * spec.den2}`;
    case "fractionCompare": {
      const name = spec.answer === "equal" ? "they are equal" : spec.answer === "left" ? `${spec.left.num}/${spec.left.den} is more` : `${spec.right.num}/${spec.right.den} is more`;
      return name;
    }
    case "oddEvenPairs":
      return `${spec.n} is ${spec.answer}`;
    case "absValueLine": {
      if (spec.answerId === "equal") return spec.equalLabel ?? "the same distance from zero";
      return spec.items.find((i) => i.id === spec.answerId)?.label ?? "";
    }
    case "tapDiagram":
      return spec.hotspots
        .filter((h) => h.correct)
        .map((h) => h.label)
        .join(" and ");
    case "dragOrder": {
      const byId = new Map(spec.items.map((i) => [i.id, i.label]));
      return spec.correctOrder.map((id) => byId.get(id) ?? id).join(" → ");
    }
    case "dragBucket": {
      const bById = new Map(spec.buckets.map((b) => [b.id, b.label]));
      return spec.items.map((i) => `${i.label} → ${bById.get(i.bucketId)}`).join("; ");
    }
    case "matchPairs": {
      const rById = new Map(spec.right.map((r) => [r.id, r.label]));
      return spec.left.map((l) => `${l.label} ↔ ${rById.get(spec.pairs[l.id])}`).join("; ");
    }
    case "buildExpression": {
      const tById = new Map(spec.tokens.map((t) => [t.id, t.label]));
      return spec.correct.map((id) => tById.get(id) ?? id).join(" ");
    }
    case "plotPoint":
      return spec.targets.map((t) => `(${t.x}, ${t.y})`).join(", ");
    case "toggleExplore":
      return spec.solutionText;
    case "steppedReveal":
      return "";
    case "estimateSlider": {
      const correct = spec.choices.find((choice) => choice.correct);
      if (correct) return correct.label;
      return `about ${spec.target.toLocaleString()}${spec.unitLabel ? ` ${spec.unitLabel}` : ""}`;
    }
    case "tenFrame":
      return `${spec.target} in the frame`;
    case "numberLineHop": {
      const sign = spec.direction === "back" ? -1 : 1;
      return `land on ${spec.start + sign * spec.hop * spec.hops}`;
    }
    case "baseTenCompose": {
      const hh = Math.floor(spec.target / 100);
      const t = Math.floor(spec.target / 10) % 10;
      const o = spec.target % 10;
      if (hh > 0)
        return `${hh} hundred${hh === 1 ? "" : "s"}, ${t} ten${t === 1 ? "" : "s"} and ${o} one${o === 1 ? "" : "s"}`;
      return `${t} ten${t === 1 ? "" : "s"} and ${o} one${o === 1 ? "" : "s"}`;
    }
    case "subitizeFlash":
      return `${spec.count}`;
  }
}

/**
 * The learner's OWN submitted answer rendered as one line of text, for the
 * common typed/choice widgets. Surfaced on the reveal screen so the mistake is
 * visible right beside the correct answer — and, crucially, ANNOUNCED to a
 * screen reader, which cannot re-read a frozen control the way a sighted
 * learner can still see their selection on the stage.
 *
 * Display-only: it reads the same `value` the grader read but never influences
 * grading, canCheck, or determinism. It deliberately mirrors evaluate()'s own
 * parse guards so it agrees with what was graded. Returns null when the value
 * is absent/unparseable, or when the widget already narrates its own state
 * (dense labs via describeWidgetState, sliders via their live readout); the
 * reveal banner then simply omits the "you answered" line — never a regression.
 */
export function learnerAnswerText(spec: TWidget, value: unknown): string | null {
  switch (spec.type) {
    case "proportionalReasoningLab": {
      if(!value || typeof value!=="object") return null;
      const v=value as {numeric?:unknown;choiceId?:unknown};
      if(spec.answerMode==="numeric") return typeof v.numeric==="number"&&!Number.isNaN(v.numeric)?`${v.numeric}${spec.answerUnit?` ${spec.answerUnit}`:""}`:null;
      return typeof v.choiceId==="string"?spec.choices.find((choice)=>choice.id===v.choiceId)?.label??null:null;
    }
    case "placeValueTransformLab": {
      if(!value||typeof value!=="object") return null;
      const v=value as {numeric?:unknown;choiceId?:unknown};
      if(spec.answerMode==="numeric") return typeof v.numeric==="number"&&!Number.isNaN(v.numeric)?`${v.numeric}${spec.answerUnit?` ${spec.answerUnit}`:""}`:null;
      return typeof v.choiceId==="string"?spec.choices.find((choice)=>choice.id===v.choiceId)?.label??null:null;
    }
    case "pointSetReasoningLab": {if(!value||typeof value!=="object")return null;const v=value as {numeric?:unknown;choiceId?:unknown};if(spec.answerMode==="numeric")return typeof v.numeric==="number"&&!Number.isNaN(v.numeric)?`${v.numeric}${spec.answerUnit?` ${spec.answerUnit}`:""}`:null;if(spec.answerMode==="choice")return typeof v.choiceId==="string"?spec.choices.find(choice=>choice.id===v.choiceId)?.label??null:null;return null}
    case "geometricConstraintLab": {
      if(!value||typeof value!=="object")return null;const v=value as {numeric?:unknown;choiceId?:unknown};
      if(spec.answerMode==="numeric")return typeof v.numeric==="number"&&!Number.isNaN(v.numeric)?`${v.numeric}${spec.answerUnit?` ${spec.answerUnit}`:""}`:null;
      if(spec.answerMode==="choice")return typeof v.choiceId==="string"?spec.choices.find(choice=>choice.id===v.choiceId)?.label??null:null;
      return null;
    }
    case "exactNumberLab": {
      if(!value||typeof value!=="object")return null;const v=value as {numeric?:unknown;choiceId?:unknown;relation?:unknown};
      if(spec.answerMode==="numeric")return typeof v.numeric==="number"&&!Number.isNaN(v.numeric)?`${v.numeric}${spec.answerUnit?` ${spec.answerUnit}`:""}`:null;
      if(spec.answerMode==="choice")return typeof v.choiceId==="string"?spec.choices.find(choice=>choice.id===v.choiceId)?.label??null:null;
      if(spec.answerMode==="relation")return v.relation==="lt"?"<":v.relation==="gt"?">":v.relation==="eq"?"=":null;
      return null;
    }
    case "affineRelationshipLab": {
      if(!value||typeof value!=="object")return null;
      const v=value as {numeric?:unknown;choiceId?:unknown;point?:unknown};
      if(spec.answerMode==="numeric")return typeof v.numeric==="number"&&!Number.isNaN(v.numeric)?`${v.numeric}${spec.answerUnit?` ${spec.answerUnit}`:""}`:null;
      if(spec.answerMode==="choice")return typeof v.choiceId==="string"?spec.choices.find(choice=>choice.id===v.choiceId)?.label??null:null;
      if(spec.answerMode==="point"&&Array.isArray(v.point)&&v.point.length===2)return `(${v.point[0]}, ${v.point[1]})`;
      return null;
    }
    case "quotientReasoningLab": {
      if (!value || typeof value !== "object") return null;
      const v = value as { numeric?: unknown; choiceId?: unknown; fraction?: unknown };
      if (spec.answerMode === "numeric") return typeof v.numeric === "number" && !Number.isNaN(v.numeric) ? `${v.numeric}${spec.answerUnit ? ` ${spec.answerUnit}` : ""}` : null;
      if (spec.answerMode === "choice") return typeof v.choiceId === "string" ? spec.choices.find((choice) => choice.id === v.choiceId)?.label ?? null : null;
      if (spec.answerMode === "fraction") {
        const f = v.fraction && typeof v.fraction === "object" ? v.fraction as { whole?: number; num?: number; den?: number } : {};
        const entered = quotientFractionFromMixed(f);
        return entered ? quotientRationalKey(entered) : null;
      }
      return null;
    }
    case "graphStoryLab": {
      if (spec.mode === "read") {
        if (typeof value !== "string") return null;
        return spec.choices.find((choice) => choice.id === value)?.label ?? null;
      }
      const ids = value && typeof value === "object" && Array.isArray((value as {segmentIds?:unknown}).segmentIds)
        ? (value as {segmentIds:string[]}).segmentIds : [];
      if (!ids.length) return null;
      const byId = new Map(spec.bank.map((segment) => [segment.id, segment.label]));
      return ids.map((id) => byId.get(id) ?? id).join(" → ");
    }
    case "mcq": {
      const opt = spec.options.find((o) => o.id === value);
      return opt ? opt.label : null;
    }
    case "estimateSlider": {
      if (typeof value !== "number") return null;
      const choice = spec.choices.find((candidate) => candidate.value === value);
      if (choice) return choice.label;
      return `${value.toLocaleString()}${spec.unitLabel ? ` ${spec.unitLabel}` : ""}`;
    }
    case "compoundEventLab": {
      if (typeof value !== "string") return null;
      return spec.choices.find((choice) => choice.id === value)?.label ?? null;
    }
    case "trialProbabilityLab": {
      if (typeof value !== "string") return null;
      return spec.choices.find((choice) => choice.id === value)?.label ?? null;
    }
    case "distributionCompareLab": {
      if (spec.mode === "measure") {
        if (typeof value !== "number") return null;
        return `${value} variability-unit${value === 1 ? "" : "s"}`;
      }
      if (typeof value !== "string") return null;
      return spec.judgeOptions.find((o) => o.id === value)?.label ?? null;
    }
    case "areaModel": {
      if (!spec.countGrid || typeof value !== "number" || !Number.isFinite(value)) return null;
      return `${value} unit square${value === 1 ? "" : "s"}`;
    }
    case "numeric": {
      if (typeof value !== "number" || Number.isNaN(value)) return null;
      return `${value}${spec.unit ? ` ${spec.unit}` : ""}`;
    }
    case "fractionEntry": {
      const v = value as { sign?: number; whole?: number; num?: number; den?: number } | null | undefined;
      if (!v || typeof v.num !== "number" || typeof v.den !== "number" || v.den < 1) return null;
      const whole = typeof v.whole === "number" ? v.whole : 0;
      const frac = v.num > 0 ? `${v.num}/${v.den}` : "";
      const wholePart = whole > 0 ? String(whole) : "";
      const body = [wholePart, frac].filter(Boolean).join(" ") || "0";
      const signed = v.sign === -1 ? `\u2212${body}` : body;
      return `${signed}${spec.unit ? ` ${spec.unit}` : ""}`;
    }
    case "placeCompare": {
      if (value !== "lt" && value !== "eq" && value !== "gt") return null;
      const sym = value === "lt" ? "<" : value === "gt" ? ">" : "=";
      return `${spec.left} ${sym} ${spec.right}`;
    }
    case "rationalCompare": {
      if (value !== "lt" && value !== "eq" && value !== "gt") return null;
      const sym = value === "lt" ? "<" : value === "gt" ? ">" : "=";
      const disp = (o: { num: number; den: number } | { value: string }) =>
        "num" in o ? `${o.num}/${o.den}` : o.value;
      return `${disp(spec.left)} ${sym} ${disp(spec.right)}`;
    }
    case "absValueLine": {
      if (typeof value !== "string" || value.length === 0) return null;
      if (value === "equal") return spec.equalLabel ?? "same distance from zero";
      return spec.items.find((i) => i.id === value)?.label ?? null;
    }
    case "pointEntry": {
      const v = value as number[] | null | undefined;
      if (!Array.isArray(v) || v.length !== spec.answer.length || v.some((x) => typeof x !== "number" || Number.isNaN(x)))
        return null;
      const [lb, rb] = spec.delimiter === "angle" ? ["\u27e8", "\u27e9"] : ["(", ")"];
      return `${lb}${v.join(", ")}${rb}`;
    }
    case "compositeAreaLab": {
      if (typeof value !== "string") return null;
      return spec.choices.find((choice) => choice.id === value)?.label ?? null;
    }
    case "percentChangeLab": {
      if (typeof value !== "string") return null;
      return spec.choices.find((choice) => choice.id === value)?.label ?? null;
    }
    case "signedFractionLab": {
      if (typeof value !== "string") return null;
      return spec.choices.find((choice) => choice.id === value)?.label ?? null;
    }
    case "triangleClosureLab": {
      const v = value as { choice?: string } | null | undefined;
      if (!v?.choice) return null;
      return spec.choices.find((choice) => choice.id === v.choice)?.label ?? null;
    }
    case "shapeHierarchyLab": {
      if (typeof value !== "string") return null;
      return spec.choices.find((choice) => choice.id === value)?.label ?? null;
    }
    default:
      return null;
  }
}
