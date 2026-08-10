/**
 * numberLineRayModel — the number-line ray for inequalities (S215, MMIP wave 2, engine gap G).
 *
 * THE OBJECT. One canonical relation on one variable, held in the form a·x REL c with a ≠ 0:
 *
 *      { coeff: a, constant: c, relation: "lt" | "gt", inclusive: boolean }
 *
 * Everything a learner sees is DERIVED from it: the solved form (x REL′ c/a), the ray drawn on the
 * number line, whether the boundary point itself belongs, the interval, and the membership of every
 * marked value — which is computed by SUBSTITUTION into a·x REL c, never by asking the ray.
 *
 * WHY THE COEFFICIENT IS IN THE STATE (and this is the whole engine)
 * -----------------------------------------------------------------
 * "Inequality reversal" is the misconception this engine exists to expose, and it is not
 * expressible in a state that stores only (endpoint, direction, strictness). In that smaller state
 * "multiply both sides by −2" has nowhere to land: `x > 3` and `−2x < −6` are the same claim about
 * x, so the picture is IDENTICAL and there is nothing to see. Storing a·x REL c gives the two
 * sides somewhere to go, and then:
 *
 *   · The BOUNDARY c/a is INVARIANT under scaling: (kc)/(ka) = c/a, exactly, for every k ≠ 0.
 *   · The DERIVED DIRECTION is `relation` turned round exactly when a < 0. So multiplying both
 *     sides by a NEGATIVE number, and leaving the relation symbol alone, REFLECTS THE RAY about
 *     its own endpoint. The learner does not have to be told they were wrong: the solution set
 *     visibly jumps to the other side of the line.
 *   · Turning the relation symbol round reflects it back. The solution set is restored, and the
 *     learner has watched the rule *be* the thing that keeps it.
 *
 * That is why `scaleBothSides` does NOT silently flip the sign for you. It does what its own name
 * says — it multiplies both sides — and the surface then tells the truth about the statement that
 * results. `−2x > −6` really does mean x < 3; drawing x > 3 over it would be the one defect class
 * this programme keeps catching (a surface asserting something false of its own state). Nothing
 * here ever draws a ray the current relation does not have.
 *
 * A spec that offers no transforms (`transforms: []`) simply never leaves a = 1, and the engine is
 * then the plain "x > 3" number line — the same code, one authoring level down.
 *
 * WHAT IS NOT REACHABLE, BY CONSTRUCTION. Because a ≠ 0 is an invariant (the one edit that would
 * break it, `scaleBothSides(0)`, is a NAMED REJECTION), the solution set is always a half-line:
 * the empty set and the whole line are not states this engine can hold. `deriveSolution` is
 * therefore TOTAL with no degenerate branch, and there is no hidden case for a renderer to get
 * wrong. That is a deliberate scope decision, recorded here rather than discovered later.
 *
 * NUMERIC POLICY. Exactly `lineFamilyModel`'s, by IMPORT rather than by copy: `Rat` is an exact
 * rational in lowest terms with a positive safe-integer denominator, every operation is integer
 * arithmetic, and leaving the safe range is a `rational-overflow` REJECTION, never a silent
 * approximation. Floats cross the boundary once, inbound, through `ratFromNumber` at the pointer
 * seam. No float is ever stored.
 *
 * REJECTION vs CLAMP. The default REJECTS anything the model cannot represent and says why in
 * mathematics. A surface that wants drag-friendly behaviour declares `outOfRange: "clamp"` /
 * `offLattice: "snap"`, and every adjustment still returns an `AbsorbNote` — nothing is silent.
 */

import {
  ONE,
  ZERO,
  rat,
  ratAdd,
  ratCmp,
  ratDiv,
  ratEq,
  ratIsInteger,
  ratIsZero,
  ratMul,
  ratNeg,
  ratOnLattice,
  ratSnap,
  ratSub,
  ratText,
  ratToNumber,
  RationalDomainError,
  RationalOverflowError,
  type Rat
} from "./lineFamilyModel";
import { createRepSyncGraph, type AbsorbNote, type AbsorbOutcome, type RepSyncGraph } from "./repSyncGraph";
import { acceptTransaction, rejectTransaction } from "./mmipTypes";
import type {
  CanonicalModel,
  EditableSlot,
  MmipOperation,
  RepresentationBinding,
  SyncTransaction
} from "./mmipTypes";

/* ------------------------------------------------------------------ *
 * canonical state                                                     *
 * ------------------------------------------------------------------ */

/** Which way the relation symbol points in the STORED form a·x REL c. Not the drawn direction —
 * that is derived, and differs from this exactly when a < 0. */
export type RayRelation = "lt" | "gt";

/** Which way the drawn ray points along the number line. Derived, never stored. */
export type RayDirection = "less" | "greater";

export type RayPolicy = {
  /** The lattice the BOUNDARY lives on. Both editable origins land on it, so the picture and the
   * symbols cannot disagree about which positions exist. */
  readonly step: Rat;
  readonly outOfRange: "reject" | "clamp";
  readonly offLattice: "reject" | "snap";
};

export type RayWindow = {
  readonly min: Rat;
  readonly max: Rat;
  /** Spacing of the drawn, labelled ticks. Presentation only: it never constrains the boundary. */
  readonly tickStep: Rat;
};

export type RayCanonical = {
  /** a in a·x REL c. NEVER zero — see the module header. */
  readonly coeff: Rat;
  /** c in a·x REL c. */
  readonly constant: Rat;
  readonly relation: RayRelation;
  /** `true` for ≤ / ≥ (the boundary belongs), `false` for < / > (it does not). */
  readonly inclusive: boolean;
  /** Frame: the letter the relation is about. No edit changes it. */
  readonly variable: string;
  /** Frame: the stretch of line drawn. No edit changes it. */
  readonly window: RayWindow;
  /** Frame: the declared clamp/snap policy. No edit changes it. */
  readonly policy: RayPolicy;
};

export type RayInit = {
  readonly coeff?: Rat;
  readonly constant?: Rat;
  readonly relation?: RayRelation;
  readonly inclusive?: boolean;
  readonly variable?: string;
  readonly window?: Partial<RayWindow>;
  readonly policy?: Partial<RayPolicy>;
};

const DEFAULT_WINDOW: RayWindow = { min: rat(-6), max: rat(6), tickStep: ONE };
const DEFAULT_POLICY: RayPolicy = { step: ONE, outOfRange: "clamp", offLattice: "snap" };

/** Hard cap on drawn ticks. Reached only by a spec whose window/tickStep ratio is absurd; the
 * schema's integrity check refuses those in authored content, so this is a totality guarantee for
 * `derive` (which must never throw or hang), not a behaviour anything ships. */
export const RAY_TICK_LIMIT = 201;

export function makeRayCanonical(init: RayInit = {}): RayCanonical {
  const coeff = init.coeff && !ratIsZero(init.coeff) ? init.coeff : ONE;
  const window: RayWindow = {
    min: init.window?.min ?? DEFAULT_WINDOW.min,
    max: init.window?.max ?? DEFAULT_WINDOW.max,
    tickStep: init.window?.tickStep ?? DEFAULT_WINDOW.tickStep
  };
  const policy: RayPolicy = {
    step: init.policy?.step ?? DEFAULT_POLICY.step,
    outOfRange: init.policy?.outOfRange ?? DEFAULT_POLICY.outOfRange,
    offLattice: init.policy?.offLattice ?? DEFAULT_POLICY.offLattice
  };
  return Object.freeze({
    coeff,
    constant: init.constant ?? ZERO,
    relation: init.relation ?? "gt",
    inclusive: init.inclusive ?? false,
    variable: init.variable && init.variable.length > 0 ? init.variable : "x",
    window: Object.freeze({
      min: window.min,
      max: ratCmp(window.max, window.min) > 0 ? window.max : ratAdd(window.min, ONE),
      tickStep: ratCmp(window.tickStep, ZERO) > 0 ? window.tickStep : ONE
    }),
    policy: Object.freeze({
      step: ratCmp(policy.step, ZERO) > 0 ? policy.step : ONE,
      outOfRange: policy.outOfRange,
      offLattice: policy.offLattice
    })
  });
}

/** Rebuild a rational from anything (a value restored from storage, a partial from a test). Never
 * throws: a malformed pair falls back rather than surviving into a state that throws at derive
 * time — the failure `linePairModel`'s own suite caught on its first run. */
function ratFrom(raw: unknown, fallback: Rat): Rat {
  if (!raw || typeof raw !== "object") return fallback;
  const src = raw as { n?: unknown; d?: unknown };
  if (typeof src.n !== "number" || typeof src.d !== "number") return fallback;
  try {
    return rat(src.n, src.d);
  } catch (error) {
    if (error instanceof RationalDomainError || error instanceof RationalOverflowError) return fallback;
    throw error;
  }
}

/**
 * Can every representation be derived from this state EXACTLY? The model must never hold a
 * position it cannot show, and `normalize` is the one door that does not go through `absorb` — a
 * value restored from storage can carry a coefficient so large that substituting a tick overflows
 * the exact-integer range, which the suite caught on its first run.
 */
export function rayDerivable(state: RayCanonical): boolean {
  try {
    deriveSolution(state);
    deriveRelationView(state);
    deriveLine(state);
    deriveMembership(state);
    return true;
  } catch (error) {
    if (error instanceof RationalOverflowError || error instanceof RationalDomainError) return false;
    throw error;
  }
}

export function normalizeRayCanonical(raw: unknown, fallback: RayCanonical): RayCanonical {
  const src = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const coeff = ratFrom(src.coeff, fallback.coeff);
  const candidate = makeRayCanonical({
    // a = 0 is not a relation about x; a corrupt or hostile restore lands on the frame's own
    // coefficient rather than on a state no derivation could take.
    coeff: ratIsZero(coeff) ? fallback.coeff : coeff,
    constant: ratFrom(src.constant, fallback.constant),
    relation: src.relation === "lt" || src.relation === "gt" ? src.relation : fallback.relation,
    inclusive: typeof src.inclusive === "boolean" ? src.inclusive : fallback.inclusive,
    variable: fallback.variable,
    window: fallback.window,
    policy: fallback.policy
  });
  // Same rule as `accept`: a state no representation can show is not a state this model holds.
  return rayDerivable(candidate) ? candidate : fallback;
}

/** The MATHEMATICAL content of the state — what `changed` on a transaction must be computed from.
 * Frame (variable, window, policy) is deliberately excluded: no edit moves it, and comparing it
 * would let a presentation difference read as a mathematical change. */
export const rayClaimEq = (a: RayCanonical, b: RayCanonical): boolean =>
  ratEq(a.coeff, b.coeff) &&
  ratEq(a.constant, b.constant) &&
  a.relation === b.relation &&
  a.inclusive === b.inclusive;

/* ------------------------------------------------------------------ *
 * edits                                                               *
 * ------------------------------------------------------------------ */

/** Edits a learner makes ON THE PICTURE. Every one is a gesture on the drawn object. */
export type RayLineEdit =
  /** Slide the endpoint. The value is the BOUNDARY, in the variable's own units. */
  | { readonly kind: "setBoundary"; readonly value: Rat }
  /** Tap the dot: hollow ⇄ filled. */
  | { readonly kind: "toggleInclusive" }
  | { readonly kind: "setInclusive"; readonly inclusive: boolean }
  /** Tap the arrow: the ray turns round about its own endpoint. */
  | { readonly kind: "flipRay" }
  | { readonly kind: "setRayDirection"; readonly direction: RayDirection };

/** Edits a learner makes ON THE SYMBOLS. */
export type RayRelationEdit =
  /** Type the right-hand side. Lands on the boundary lattice through the SAME policy the drag
   * uses, which is what makes the two origins round-trip exactly. */
  | { readonly kind: "setConstant"; readonly value: Rat }
  | { readonly kind: "flipRelationSymbol" }
  | { readonly kind: "setRelationSymbol"; readonly relation: RayRelation }
  | { readonly kind: "setInclusive"; readonly inclusive: boolean }
  /**
   * Multiply both sides by `factor`. Does exactly that and nothing else — the relation symbol is
   * the learner's to turn round. See the module header for why this is the honest shape.
   */
  | { readonly kind: "scaleBothSides"; readonly factor: Rat };

export type NumberLineRayEdit = RayLineEdit | RayRelationEdit;

/* ------------------------------------------------------------------ *
 * derivations                                                         *
 * ------------------------------------------------------------------ */

const ratAbs = (a: Rat): Rat => rat(Math.abs(a.n), a.d);

/** ASCII "-" → the typographic minus the rest of the app's mathematical prose uses. */
export const rayNumber = (value: Rat): string => ratText(value).replace("-", "−");

const flipRelation = (relation: RayRelation): RayRelation => (relation === "lt" ? "gt" : "lt");

/** The glyph for a stored relation. Four of them, and the pair at one value differ by exactly the
 * one point that is the whole open/closed lesson. */
export const raySymbol = (relation: RayRelation, inclusive: boolean): string =>
  relation === "lt" ? (inclusive ? "≤" : "<") : inclusive ? "≥" : ">";

/** a·x, written the way a learner writes it. Integer coefficients juxtapose (`−2x`, `x`, `−x`);
 * a fractional one is bracketed (`(1/2)x`), because `1/2x` is genuinely ambiguous. */
export function rayLeftSideText(coeff: Rat, variable: string): string {
  if (ratEq(coeff, ONE)) return variable;
  if (ratEq(coeff, ratNeg(ONE))) return `−${variable}`;
  if (ratIsInteger(coeff)) return `${rayNumber(coeff)}${variable}`;
  return `(${rayNumber(coeff)})${variable}`;
}

/* ---- the symbolic strip: the relation as stored ---- */

export type RayRelationView = {
  /** `−2x` */
  readonly leftText: string;
  /** `≥` */
  readonly symbol: string;
  /** `−6` */
  readonly rightText: string;
  /** `−2x ≥ −6` */
  readonly text: string;
  readonly coeff: Rat;
  readonly constant: Rat;
  readonly relation: RayRelation;
  readonly inclusive: boolean;
  /** The right-hand side as an editable hole, carrying WHAT THE NUMBER IS. */
  readonly constantSlot: EditableSlot<RayTarget>;
  /** The coefficient is NOT typeable: it is what a both-sides move does to the relation, and
   * typing over it would be doing the move without doing it. Locked, with the reason. */
  readonly coeffSlot: EditableSlot<RayTarget>;
  /** Whether the stored form is already solved (a = 1) — a renderer decides whether to show the
   * solved line separately, and a test can assert the two coincide when it is. */
  readonly solved: boolean;
};

/* ---- the solved form and the solution set ---- */

export type RaySolutionView = {
  /** c / a, exactly. Invariant under multiplying both sides by any k ≠ 0. */
  readonly boundary: Rat;
  readonly direction: RayDirection;
  readonly inclusive: boolean;
  /** `≤` — the symbol of the SOLVED form, which differs from the stored one when a < 0. */
  readonly symbol: string;
  /** `x ≤ 3` */
  readonly text: string;
  /** `(−∞, 3]` */
  readonly interval: string;
  /** The sentence a screen reader hears: the MATHEMATICS, never a position on screen. */
  readonly sentence: string;
  /** "3 is a solution." / "3 is not a solution." — the one point open and closed differ by. */
  readonly boundarySentence: string;
  /** True exactly when a < 0: the stored symbol and the drawn ray point opposite ways. */
  readonly reversed: boolean;
};

export function deriveSolution(c: RayCanonical): RaySolutionView {
  const boundary = ratDiv(c.constant, c.coeff);
  const reversed = c.coeff.n < 0;
  const solvedRelation = reversed ? flipRelation(c.relation) : c.relation;
  const direction: RayDirection = solvedRelation === "gt" ? "greater" : "less";
  const symbol = raySymbol(solvedRelation, c.inclusive);
  const b = rayNumber(boundary);
  const comparison = direction === "greater" ? "greater than" : "less than";
  const wording = c.inclusive ? `${comparison} or equal to` : comparison;
  return {
    boundary,
    direction,
    inclusive: c.inclusive,
    symbol,
    text: `${c.variable} ${symbol} ${b}`,
    interval:
      direction === "greater"
        ? `${c.inclusive ? "[" : "("}${b}, ∞)`
        : `(−∞, ${b}${c.inclusive ? "]" : ")"}`,
    sentence: `all values ${wording} ${b}, ${b} ${c.inclusive ? "included" : "not included"}`,
    boundarySentence: `${b} is ${c.inclusive ? "" : "not "}a solution.`,
    reversed
  };
}

export function deriveRelationView(c: RayCanonical): RayRelationView {
  const leftText = rayLeftSideText(c.coeff, c.variable);
  const symbol = raySymbol(c.relation, c.inclusive);
  const solved = ratEq(c.coeff, ONE);
  // Slot bounds are for an `<input min/max>` — presentation only, never absorbed — so they are
  // computed in float (`ratToNumber` is the render-only door) rather than through exact arithmetic
  // that could overflow inside a derivation that must be total.
  const a = ratToNumber(c.coeff);
  const lo = a * ratToNumber(a > 0 ? c.window.min : c.window.max);
  const hi = a * ratToNumber(a > 0 ? c.window.max : c.window.min);
  return {
    leftText,
    symbol,
    rightText: rayNumber(c.constant),
    text: `${leftText} ${symbol} ${rayNumber(c.constant)}`,
    coeff: c.coeff,
    constant: c.constant,
    relation: c.relation,
    inclusive: c.inclusive,
    constantSlot: {
      target: "constant",
      value: ratToNumber(c.constant),
      min: lo,
      max: hi,
      step: Math.abs(a) * ratToNumber(c.policy.step),
      editable: true,
      meaning: `the number ${leftText} is compared with, currently ${rayNumber(c.constant)}`
    },
    coeffSlot: {
      target: "coefficient",
      value: ratToNumber(c.coeff),
      min: ratToNumber(c.coeff),
      max: ratToNumber(c.coeff),
      step: 0,
      editable: false,
      lockedReason:
        "the number in front of the variable only changes when you multiply or divide BOTH sides; " +
        "typing over it would claim the move without making it",
      meaning: `how many ${c.variable} the left-hand side holds, currently ${rayNumber(c.coeff)}`
    },
    solved
  };
}

/* ---- the picture ---- */

export type RayTickView = {
  readonly value: Rat;
  readonly text: string;
  /** Position along the drawn window, 0 at `window.min` and 1 at `window.max`. */
  readonly t: number;
  readonly major: boolean;
};

export type RayLineView = {
  readonly window: RayWindow;
  readonly boundary: Rat;
  readonly boundaryText: string;
  /** Fraction of the window at which the endpoint sits — the ONLY place this model computes a
   * position, and it is for drawing, never for mathematics. */
  readonly boundaryT: number;
  readonly direction: RayDirection;
  /** Filled dot ⇄ hollow dot. Carried alongside `endpointLabel` and the gap below, so open/closed
   * is never signalled by a fill alone. */
  readonly filled: boolean;
  /** The words printed under the endpoint: three redundant channels, none of them colour. */
  readonly endpointLabel: string;
  /** `true` when the ray runs off the drawn window in its direction — it always does, because a
   * ray is infinite; the renderer draws an arrowhead at that edge. */
  readonly openEnd: "min" | "max";
  readonly ticks: readonly RayTickView[];
  /** `false` when the tick walk hit `RAY_TICK_LIMIT`: the renderer then knows its axis labelling
   * is partial and must not be read as the whole line. */
  readonly ticksComplete: boolean;
  /** How a screen reader is told what is drawn: the mathematics, never "a dot two thirds across". */
  readonly sentence: string;
};

/** Walk the tick lattice from `min` upward. Total and bounded — see `RAY_TICK_LIMIT`. */
export function rayTicks(window: RayWindow): { ticks: Rat[]; complete: boolean } {
  const ticks: Rat[] = [];
  let value = window.min;
  for (let i = 0; i < RAY_TICK_LIMIT; i += 1) {
    if (ratCmp(value, window.max) > 0) return { ticks, complete: true };
    ticks.push(value);
    value = ratAdd(value, window.tickStep);
  }
  return { ticks, complete: ratCmp(value, window.max) > 0 };
}

const positionIn = (window: RayWindow, value: Rat): number => {
  const span = ratToNumber(ratSub(window.max, window.min));
  if (span === 0) return 0;
  return ratToNumber(ratSub(value, window.min)) / span;
};

export function deriveLine(c: RayCanonical): RayLineView {
  const solution = deriveSolution(c);
  const walk = rayTicks(c.window);
  return {
    window: c.window,
    boundary: solution.boundary,
    boundaryText: rayNumber(solution.boundary),
    boundaryT: positionIn(c.window, solution.boundary),
    direction: solution.direction,
    filled: c.inclusive,
    endpointLabel: `${rayNumber(solution.boundary)} ${c.inclusive ? "included" : "not included"}`,
    openEnd: solution.direction === "greater" ? "max" : "min",
    ticks: walk.ticks.map((value) => ({
      value,
      text: rayNumber(value),
      t: positionIn(c.window, value),
      major: ratIsInteger(value)
    })),
    ticksComplete: walk.complete,
    sentence: `A number line shaded for ${solution.sentence}.`
  };
}

/* ---- membership, by substitution ---- */

export type RayMembershipSample = {
  readonly value: Rat;
  readonly text: string;
  /** a·value, exactly — the left-hand side actually evaluated. */
  readonly leftValue: Rat;
  readonly satisfies: boolean;
  /** `−2 × 3 = −6, and −6 ≥ −6 is true, so 3 is a solution.` — every number in it is real. */
  readonly sentence: string;
  readonly isBoundary: boolean;
};

export type RayMembershipView = {
  readonly variable: string;
  readonly samples: readonly RayMembershipSample[];
  /**
   * Index of the boundary within `samples`, or −1 when the boundary lies OFF the drawn window.
   * The boundary is inserted whenever it is on the window — the one point that decides open from
   * closed is never merely near a testable value — but a state authored (or restored) with a
   * boundary outside the drawn stretch genuinely has no boundary sample to offer, and saying so is
   * the honest answer. No edit can reach that state under the shipped clamp policy.
   */
  readonly boundaryIndex: number;
};

/**
 * Does `value` satisfy the stored relation? Computed by SUBSTITUTION into a·x REL c — deliberately
 * NOT by comparing against the boundary. That makes this a second, independent route to the same
 * truth, so the ray and the membership claim are two derivations that a test can hold against each
 * other rather than one derivation quoted twice.
 */
export function raySatisfies(c: RayCanonical, value: Rat): boolean {
  const cmp = ratCmp(ratMul(c.coeff, value), c.constant);
  if (c.relation === "gt") return c.inclusive ? cmp >= 0 : cmp > 0;
  return c.inclusive ? cmp <= 0 : cmp < 0;
}

export function deriveMembership(c: RayCanonical): RayMembershipView {
  const boundary = ratDiv(c.constant, c.coeff);
  const walk = rayTicks(c.window);
  // The boundary and its two lattice neighbours are always testable: they are the values at which
  // open and closed actually differ, and a lattice that happened to miss them would hide the
  // engine's own point.
  const wanted = [...walk.ticks, boundary, ratSub(boundary, c.policy.step), ratAdd(boundary, c.policy.step)]
    .filter((v) => ratCmp(v, c.window.min) >= 0 && ratCmp(v, c.window.max) <= 0)
    .sort((a, b) => ratCmp(a, b));
  const values: Rat[] = [];
  for (const v of wanted) if (!values.some((seen) => ratEq(seen, v))) values.push(v);
  const samples = values.map((value) => {
    const leftValue = ratMul(c.coeff, value);
    const satisfies = raySatisfies(c, value);
    const symbol = raySymbol(c.relation, c.inclusive);
    const substitution = ratEq(c.coeff, ONE)
      ? `${rayNumber(value)} ${symbol} ${rayNumber(c.constant)}`
      : `${rayNumber(c.coeff)} × ${rayNumber(value)} = ${rayNumber(leftValue)}, and ${rayNumber(leftValue)} ${symbol} ${rayNumber(c.constant)}`;
    return {
      value,
      text: rayNumber(value),
      leftValue,
      satisfies,
      sentence: `${substitution} is ${satisfies ? "true" : "false"}, so ${rayNumber(value)} is ${satisfies ? "" : "not "}a solution.`,
      isBoundary: ratEq(value, boundary)
    };
  });
  return {
    variable: c.variable,
    samples,
    boundaryIndex: samples.findIndex((s) => s.isBoundary)
  };
}

/* ------------------------------------------------------------------ *
 * absorb                                                              *
 * ------------------------------------------------------------------ */

const no = (code: string, reason: string): AbsorbOutcome<RayCanonical> => ({ ok: false, code, reason });

/** Every rational operation in this module goes through here, so an overflow is a REJECTION with a
 * reason rather than an exception escaping into a renderer. */
function guard<T>(work: () => T): { ok: true; value: T } | { ok: false; outcome: AbsorbOutcome<RayCanonical> } {
  try {
    return { ok: true, value: work() };
  } catch (error) {
    if (error instanceof RationalOverflowError || error instanceof RationalDomainError) {
      return {
        ok: false,
        outcome: no(
          "rational-overflow",
          `${error.message} — this engine keeps every value exact, so it refuses the move rather than showing you a rounded picture`
        )
      };
    }
    throw error;
  }
}

/** Put a boundary onto the declared lattice and inside the drawn window, or refuse. One code path,
 * used by the drag, by the stepper and by typing the right-hand side. */
function placeBoundary(
  c: RayCanonical,
  wanted: Rat
): { ok: true; boundary: Rat; note?: AbsorbNote } | { ok: false; outcome: AbsorbOutcome<RayCanonical> } {
  const notes: AbsorbNote[] = [];
  let value = wanted;

  if (!ratOnLattice(value, c.policy.step)) {
    if (c.policy.offLattice === "reject") {
      return {
        ok: false,
        outcome: no(
          "boundary-off-lattice",
          `this line marks positions every ${rayNumber(c.policy.step)}, and ${rayNumber(value)} is not one of them`
        )
      };
    }
    const snapped = guard(() => ratSnap(value, c.policy.step));
    if (!snapped.ok) return { ok: false, outcome: snapped.outcome };
    notes.push({
      code: "boundary-snapped",
      reason: `${rayNumber(value)} is not a marked position, so the boundary settled on ${rayNumber(snapped.value)}.`
    });
    value = snapped.value;
  }

  if (ratCmp(value, c.window.min) < 0 || ratCmp(value, c.window.max) > 0) {
    if (c.policy.outOfRange === "reject") {
      return {
        ok: false,
        outcome: no(
          "boundary-out-of-range",
          `the drawn line runs from ${rayNumber(c.window.min)} to ${rayNumber(c.window.max)}, and a boundary at ` +
            `${rayNumber(value)} would sit off it — the picture could not show you where the solutions start`
        )
      };
    }
    const clamped = ratCmp(value, c.window.min) < 0 ? c.window.min : c.window.max;
    notes.push({
      code: "boundary-clamped",
      reason: `${rayNumber(value)} is off the drawn line, so the boundary stopped at ${rayNumber(clamped)}.`
    });
    value = clamped;
  }

  if (notes.length === 0) return { ok: true, boundary: value };
  return {
    ok: true,
    boundary: value,
    note: { code: notes.map((n) => n.code).join("+"), reason: notes.map((n) => n.reason).join(" ") }
  };
}

/**
 * The one exit from absorb. A state is accepted only if EVERY representation derives exactly, so
 * the model can never hold a position it cannot show — the same rule `lineFamilyModel` states, and
 * what makes `derive` total on every reachable state rather than total by hope.
 */
const accept = (next: RayCanonical, note?: AbsorbNote): AbsorbOutcome<RayCanonical> => {
  if (!rayDerivable(next)) {
    return no(
      "rational-overflow",
      "that move leaves the exact-integer range — this engine keeps every value exact, so it " +
        "refuses the move rather than showing you a rounded picture"
    );
  }
  return note ? { ok: true, canonical: next, clamp: note } : { ok: true, canonical: next };
};

const withBoundary = (
  c: RayCanonical,
  boundary: Rat,
  note?: AbsorbNote
): AbsorbOutcome<RayCanonical> => {
  const constant = guard(() => ratMul(c.coeff, boundary));
  if (!constant.ok) return constant.outcome;
  return accept({ ...c, constant: constant.value }, note);
};

/** The one total absorb. Every representation delegates here; nothing restates a policy. */
export function absorbRayEdit(c: RayCanonical, edit: NumberLineRayEdit): AbsorbOutcome<RayCanonical> {
  switch (edit.kind) {
    case "setBoundary": {
      const placed = placeBoundary(c, edit.value);
      if (!placed.ok) return placed.outcome;
      return withBoundary(c, placed.boundary, placed.note);
    }

    case "setConstant": {
      // Typing the right-hand side IS moving the boundary: c = a·boundary, so boundary = c/a. It
      // goes through the identical lattice/window policy, which is what makes the symbolic route a
      // faster way to do the drag rather than a way to reach states the drag cannot.
      const boundary = guard(() => ratDiv(edit.value, c.coeff));
      if (!boundary.ok) return boundary.outcome;
      const placed = placeBoundary(c, boundary.value);
      if (!placed.ok) return placed.outcome;
      return withBoundary(c, placed.boundary, placed.note);
    }

    case "toggleInclusive":
      return accept({ ...c, inclusive: !c.inclusive });

    case "setInclusive":
      return accept({ ...c, inclusive: edit.inclusive });

    case "flipRelationSymbol":
      return accept({ ...c, relation: flipRelation(c.relation) });

    case "setRelationSymbol":
      return accept({ ...c, relation: edit.relation });

    case "flipRay":
      // Turning the DRAWN ray round is turning the stored symbol round: the two differ by the sign
      // of a, and flipping either flips the other.
      return accept({ ...c, relation: flipRelation(c.relation) });

    case "setRayDirection": {
      const wanted: RayRelation = edit.direction === "greater" ? "gt" : "lt";
      return accept({ ...c, relation: c.coeff.n < 0 ? flipRelation(wanted) : wanted });
    }

    case "scaleBothSides": {
      if (ratIsZero(edit.factor)) {
        return no(
          "scale-by-zero",
          "multiplying both sides by 0 leaves 0 on both sides, and 0 compared with 0 says nothing about " +
            `${c.variable} at all — there would be no solution set left to draw`
        );
      }
      const coeff = guard(() => ratMul(c.coeff, edit.factor));
      if (!coeff.ok) return coeff.outcome;
      const constant = guard(() => ratMul(c.constant, edit.factor));
      if (!constant.ok) return constant.outcome;
      // The relation symbol is NOT touched. That is the point: see the module header.
      return accept({ ...c, coeff: coeff.value, constant: constant.value });
    }
  }
}

/* ------------------------------------------------------------------ *
 * operations                                                          *
 * ------------------------------------------------------------------ */

export type RayTarget = "coefficient" | "boundary" | "direction" | "inclusive" | "constant";

/**
 * Name what took `before` into `after`, in the mathematics. Every sentence is built from the two
 * states' own numbers, so it cannot describe a move that did not happen.
 *
 * The LAST operation additionally carries the fact this engine exists to teach: whether the
 * SOLUTION SET survived. It is computed, not asserted — `deriveSolution` on both states — so
 * "the solution set is unchanged" is only ever said when it is true.
 */
export function describeRayChange(before: RayCanonical, after: RayCanonical): MmipOperation<RayTarget>[] {
  const ops: MmipOperation<RayTarget>[] = [];
  const beforeSolution = deriveSolution(before);
  const afterSolution = deriveSolution(after);
  const beforeRelation = deriveRelationView(before);
  const afterRelation = deriveRelationView(after);

  if (!ratEq(before.coeff, after.coeff)) {
    const k = ratDiv(after.coeff, before.coeff);
    if (k.n < 0) {
      ops.push({
        kind: "negate",
        target: "coefficient",
        amount: -1,
        sides: ["left", "right"],
        describe:
          `Multiply both sides by a negative number: ${beforeRelation.text} becomes ${afterRelation.text}. ` +
          "Every term reverses sign together."
      });
    }
    const magnitude = ratAbs(k);
    if (!ratEq(magnitude, ONE)) {
      // The two sides, written the way the strip writes them — so the sentence quotes exactly what
      // the learner is looking at (`x`, never `1x`).
      const from = `${rayLeftSideText(before.coeff, before.variable)} and ${rayNumber(before.constant)}`;
      const to = `${rayLeftSideText(after.coeff, after.variable)} and ${rayNumber(after.constant)}`;
      const reciprocal = ratDiv(ONE, magnitude);
      if (ratIsInteger(magnitude)) {
        ops.push({
          kind: "distribute",
          target: "coefficient",
          amount: magnitude.n,
          sides: ["left", "right"],
          describe: `Multiply both sides by ${rayNumber(magnitude)}: ${from} become ${to}.`
        });
      } else if (ratIsInteger(reciprocal)) {
        // A genuine division: each side really is cut into that many equal parts.
        ops.push({
          kind: "divide",
          target: "coefficient",
          amount: reciprocal.n,
          sides: ["left", "right"],
          describe: `Split both sides into ${reciprocal.n} equal parts: ${from} become ${to}.`
        });
      } else {
        // A general rational scale is neither a whole-number stretch nor a clean split, so it is
        // said as what it IS rather than dressed up as parts that do not exist.
        ops.push({
          kind: "divide",
          target: "coefficient",
          amount: ratToNumber(reciprocal),
          sides: ["left", "right"],
          describe: `Multiply both sides by ${rayNumber(magnitude)}: ${from} become ${to}.`
        });
      }
    }
  }

  if (!ratEq(beforeSolution.boundary, afterSolution.boundary)) {
    const delta = ratSub(afterSolution.boundary, beforeSolution.boundary);
    ops.push({
      kind: delta.n > 0 ? "add" : "subtract",
      target: "boundary",
      amount: ratToNumber(delta),
      sides: ["ray"],
      describe: `Move the boundary ${delta.n > 0 ? "up" : "down"} by ${rayNumber(ratAbs(delta))}: it goes from ${rayNumber(beforeSolution.boundary)} to ${rayNumber(afterSolution.boundary)}.`
    });
  }

  if (before.relation !== after.relation) {
    ops.push({
      kind: "reorient",
      target: "direction",
      amount: 0,
      sides: ["ray"],
      describe: `Turn the sign round: ${beforeRelation.text} becomes ${afterRelation.text}.`
    });
  }

  if (before.inclusive !== after.inclusive) {
    ops.push({
      kind: "reorient",
      target: "inclusive",
      amount: 0,
      sides: ["endpoint"],
      describe: after.inclusive
        ? `Close the endpoint: ${rayNumber(afterSolution.boundary)} joins the solutions, so ${beforeSolution.symbol} becomes ${afterSolution.symbol}.`
        : `Open the endpoint: ${rayNumber(afterSolution.boundary)} leaves the solutions, so ${beforeSolution.symbol} becomes ${afterSolution.symbol}.`
    });
  }

  if (ops.length === 0) return ops;
  const same =
    ratEq(beforeSolution.boundary, afterSolution.boundary) &&
    beforeSolution.direction === afterSolution.direction &&
    beforeSolution.inclusive === afterSolution.inclusive;
  const last = ops[ops.length - 1];
  ops[ops.length - 1] = {
    ...last,
    describe: `${last.describe} ${
      same
        ? `The solution set is unchanged: still ${afterSolution.text}.`
        : `The solution set moved from ${beforeSolution.text} to ${afterSolution.text}.`
    }`
  };
  return ops;
}

/* ------------------------------------------------------------------ *
 * the graph                                                           *
 * ------------------------------------------------------------------ */

export const numberLineRayReps = {
  model: { label: "the relation", derive: (c: RayCanonical): RayCanonical => c },
  line: {
    label: "the number line",
    derive: deriveLine,
    absorb: (c: RayCanonical, edit: RayLineEdit) => absorbRayEdit(c, edit)
  },
  relation: {
    label: "the inequality",
    derive: deriveRelationView,
    absorb: (c: RayCanonical, edit: RayRelationEdit) => absorbRayEdit(c, edit)
  },
  /** Read-only ON PURPOSE. The solved form is what the picture already says in symbols; making it
   * a third editable origin would add no state the other two cannot reach, and would put a third
   * copy of the same claim on screen for the two editable ones to drift from. */
  solution: { label: "the solution set", derive: deriveSolution },
  /** Read-only: membership is a QUESTION asked of the relation, not a fact about it. Which value a
   * learner is currently testing is perceptual and lives in the view, exactly as MMIP invariant 1
   * requires — it cannot change a graded answer. */
  membership: { label: "testing a value", derive: deriveMembership }
} as const;

export type NumberLineRayReps = typeof numberLineRayReps;
export type NumberLineRayGraph = RepSyncGraph<RayCanonical, NumberLineRayReps>;

export const createNumberLineRayGraph = (
  canonical: RayCanonical,
  options?: { readonly history?: readonly RayCanonical[] }
): NumberLineRayGraph =>
  createRepSyncGraph({ canonical, reps: numberLineRayReps, ...(options?.history ? { history: options.history } : {}) });

/* ------------------------------------------------------------------ *
 * the assembled model                                                 *
 * ------------------------------------------------------------------ */

export type NumberLineRayViews = {
  readonly line: RayLineView;
  readonly relation: RayRelationView;
  readonly solution: RaySolutionView;
  readonly membership: RayMembershipView;
};

export interface NumberLineRayModel
  extends CanonicalModel<RayCanonical, NumberLineRayEdit, RayTarget> {
  readonly representations: RepresentationBinding<RayCanonical, unknown>[];
  readonly views: (state: RayCanonical) => NumberLineRayViews;
  readonly createGraph: (start?: RayCanonical) => NumberLineRayGraph;
}

/** One instance per authored problem, mirroring the other engines' factories. */
export function numberLineRayCanonicalModel(init: RayInit = {}): NumberLineRayModel {
  const initial = makeRayCanonical(init);
  const bindings = (Object.keys(numberLineRayReps) as (keyof NumberLineRayReps)[]).map((id) => ({
    id,
    label: numberLineRayReps[id].label,
    derive: (state: RayCanonical) => numberLineRayReps[id].derive(state) as unknown,
    editable: () => Boolean((numberLineRayReps[id] as { absorb?: unknown }).absorb)
  }));
  return {
    id: "numberLineRay",
    initial,
    representations: bindings,
    normalize: (raw: unknown): RayCanonical => normalizeRayCanonical(raw, initial),
    apply: (state, edit, origin, source): SyncTransaction<RayCanonical, RayTarget> => {
      const outcome = absorbRayEdit(state, edit);
      if (!outcome.ok) {
        return rejectTransaction<RayCanonical, RayTarget>(state, origin, source, {
          code: outcome.code,
          message: outcome.reason
        });
      }
      const changed = !rayClaimEq(state, outcome.canonical);
      return acceptTransaction<RayCanonical, RayTarget>(
        state,
        outcome.canonical,
        origin,
        source,
        changed,
        describeRayChange(state, outcome.canonical)
      );
    },
    /**
     * Two states make the same claim when they have the same SOLUTION SET — not when they are
     * written the same way. `−2x ≥ −6` and `x ≤ 3` are the same claim about x in two positions,
     * which is exactly the equality this engine is teaching.
     */
    equivalent: (a, b) => {
      const p = deriveSolution(a);
      const q = deriveSolution(b);
      return ratEq(p.boundary, q.boundary) && p.direction === q.direction && p.inclusive === q.inclusive;
    },
    views: (state) => ({
      line: deriveLine(state),
      relation: deriveRelationView(state),
      solution: deriveSolution(state),
      membership: deriveMembership(state)
    }),
    createGraph: (start?: RayCanonical) => createNumberLineRayGraph(start ?? initial)
  };
}
