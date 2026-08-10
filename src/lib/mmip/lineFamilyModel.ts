/**
 * lineFamilyModel — the first proof that the Representation Synchronization Graph carries real
 * mathematics: one canonical line, five representations, five editable origins.
 *
 *      equation (y = mx + b)  ─┐
 *      graph (drag a point)   ─┤
 *      table (edit a cell)    ─┼──►  ONE canonical LineCanonical  ──►  all five views re-derived
 *      slope triangle (run/rise)┤
 *      context sentence       ─┘
 *
 * NUMERIC POLICY — why this file has its own rational type
 * -------------------------------------------------------
 * Round-tripping a line through a graph drag is where float manipulatives die: drag the unit
 * handle to slope 1/3, read the table, type a table value back, and `0.30000000000000004` is
 * suddenly a different line from the one on screen. Equivalence classes stop being classes and
 * undo stops being exact.
 *
 * So the canonical state stores NO floating point mathematics at all:
 *
 *  1. `Rat` is an exact rational with a safe-integer numerator and a positive safe-integer
 *     denominator, always in lowest terms. `rat(2, 4)` and `rat(1, 2)` are the *same object
 *     shape*, so structural fingerprints are true equality — this is what makes the RSG's
 *     equivalence-class guarantee mathematically meaningful and not merely representational.
 *  2. Every arithmetic operation is integer arithmetic. If a product or sum would leave the
 *     safe-integer range, the operation throws `RationalOverflowError` rather than silently
 *     becoming approximate; `absorb` converts that into a rejection with code
 *     `rational-overflow`, so the learner gets a reason instead of a wrong picture.
 *  3. Floats exist only at the UI boundary. A pointer event carries pixels; the adapter calls
 *     `ratFromNumber`, which uses a continued-fraction (Stern–Brocot) search for the SIMPLEST
 *     rational within tolerance of the float and bounded by `maxDenominator`. That conversion
 *     happens exactly once, on the way in. Nothing converts back and forth, so there is no
 *     accumulation path: drift over a 10 000-edit walk is identically zero, which the test
 *     suite asserts rather than bounds.
 *  4. `ratToNumber` exists for rendering coordinates only. Its result is never absorbed.
 *
 * REJECTION vs CLAMP
 * ------------------
 * The default policy REJECTS anything the model cannot represent and returns the mathematical
 * reason (a vertical line is not a function of x; two table rows cannot share an input; these
 * three rows are not collinear). A surface that genuinely wants clamping — `lineExplore` ships
 * integer sliders with min/max — sets `policy.outOfRange: "clamp"` / `policy.offLattice: "snap"`,
 * and every clamp still returns an `AbsorbNote` saying what moved and why. Nothing is silent.
 */

import {
  createRepSyncGraph,
  type AbsorbNote,
  type AbsorbOutcome,
  type RepSyncGraph
} from "./repSyncGraph";
import { rejectTransaction } from "./mmipTypes";
import type {
  CanonicalModel,
  EditableSlot,
  MmipOperation,
  RepresentationBinding,
  SyncTransaction
} from "./mmipTypes";

/* ------------------------------------------------------------------ *
 * exact rationals                                                     *
 * ------------------------------------------------------------------ */

export type Rat = { readonly n: number; readonly d: number };

export class RationalOverflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RationalOverflowError";
  }
}
export class RationalDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RationalDomainError";
  }
}

const gcd = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
};

const safe = (v: number, what: string): number => {
  if (!Number.isSafeInteger(v)) {
    throw new RationalOverflowError(`${what} left the exact-integer range (${v}); the state would stop being exact`);
  }
  return v;
};

/** Build an exact rational in lowest terms with a positive denominator. */
export function rat(n: number, d = 1): Rat {
  if (!Number.isInteger(n) || !Number.isInteger(d)) {
    throw new RationalDomainError(`a rational needs integer parts, received ${n}/${d}`);
  }
  if (d === 0) throw new RationalDomainError("a rational cannot have denominator 0");
  safe(n, "numerator");
  safe(d, "denominator");
  const sign = d < 0 ? -1 : 1;
  const g = gcd(n, d) || 1;
  return Object.freeze({ n: (sign * n) / g, d: (sign * d) / g });
}

export const ZERO: Rat = rat(0);
export const ONE: Rat = rat(1);

export const ratAdd = (a: Rat, b: Rat): Rat => rat(safe(a.n * b.d, "sum") + safe(b.n * a.d, "sum"), safe(a.d * b.d, "sum"));
export const ratSub = (a: Rat, b: Rat): Rat => ratAdd(a, { n: -b.n, d: b.d });
export const ratMul = (a: Rat, b: Rat): Rat => rat(safe(a.n * b.n, "product"), safe(a.d * b.d, "product"));
export const ratDiv = (a: Rat, b: Rat): Rat => {
  if (b.n === 0) throw new RationalDomainError("division by zero");
  return rat(safe(a.n * b.d, "quotient"), safe(a.d * b.n, "quotient"));
};
export const ratNeg = (a: Rat): Rat => rat(-a.n, a.d);
export const ratEq = (a: Rat, b: Rat): boolean => a.n === b.n && a.d === b.d;
export const ratIsZero = (a: Rat): boolean => a.n === 0;
/** −1, 0, +1 by cross-multiplication; denominators are positive so the sign is honest. */
export const ratCmp = (a: Rat, b: Rat): number => {
  const left = safe(a.n * b.d, "comparison");
  const right = safe(b.n * a.d, "comparison");
  return left < right ? -1 : left > right ? 1 : 0;
};
export const ratToNumber = (a: Rat): number => a.n / a.d;
export const ratIsInteger = (a: Rat): boolean => a.d === 1;

/** ASCII, machine-parseable: "3", "-3", "3/2", "-3/2". */
export const ratText = (a: Rat): string => (a.d === 1 ? String(a.n) : `${a.n}/${a.d}`);
/** Typographic: unicode minus, matching the rest of the app's mathematical prose. */
export const ratDisplay = (a: Rat): string => ratText(a).replace("-", "−");

/**
 * Float → simplest exact rational (continued fractions), bounded denominator. This is the only
 * door floats are allowed through, and they never go back out through it.
 */
export function ratFromNumber(value: number, maxDenominator = 1_000_000, tolerance = 1e-9): Rat {
  if (!Number.isFinite(value)) throw new RationalDomainError(`cannot convert ${value} to an exact rational`);
  const sign = value < 0 ? -1 : 1;
  let x = Math.abs(value);
  let n0 = 0;
  let d0 = 1;
  let n1 = 1;
  let d1 = 0;
  for (let i = 0; i < 64; i += 1) {
    const a = Math.floor(x);
    const n2 = a * n1 + n0;
    const d2 = a * d1 + d0;
    if (d2 > maxDenominator || !Number.isSafeInteger(n2)) break;
    n0 = n1;
    d0 = d1;
    n1 = n2;
    d1 = d2;
    if (Math.abs(n1 / d1 - x) <= tolerance) break;
    const frac = x - a;
    if (frac === 0) break;
    x = 1 / frac;
  }
  if (d1 === 0) return rat(Math.round(value));
  return rat(sign * n1, d1);
}

/** Nearest integer to n/d (d > 0), half up, computed in integers so no float ever decides. */
const ratRoundToInteger = (a: Rat): number => Math.floor((safe(2 * a.n, "rounding") + a.d) / (2 * a.d));

/** Snap to the nearest multiple of `step` (exactly — the quotient is rounded, not the value). */
export function ratSnap(value: Rat, step: Rat): Rat {
  if (ratIsZero(step)) return value;
  return ratMul(rat(ratRoundToInteger(ratDiv(value, step))), step);
}

export const ratOnLattice = (value: Rat, step: Rat): boolean => {
  if (ratIsZero(step)) return true;
  return ratIsInteger(ratDiv(value, step));
};

/* ------------------------------------------------------------------ *
 * canonical state                                                     *
 * ------------------------------------------------------------------ */

export type LineContext = {
  readonly subject: string;
  readonly xLabel: string;
  readonly xUnit: string;
  readonly xUnitSingular: string;
  readonly yLabel: string;
  readonly yUnit: string;
};

export type LineDomain = {
  readonly start: Rat;
  readonly step: Rat;
  readonly count: number;
};

export type LineWindow = {
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin: number;
  readonly yMax: number;
};

export type LinePolicy = {
  readonly slopeMin: Rat | null;
  readonly slopeMax: Rat | null;
  readonly interceptMin: Rat | null;
  readonly interceptMax: Rat | null;
  /** Non-null forces m (resp. b) onto a lattice — `rat(1)` reproduces lineExplore's integers. */
  readonly slopeStep: Rat | null;
  readonly interceptStep: Rat | null;
  readonly outOfRange: "reject" | "clamp";
  readonly offLattice: "reject" | "snap";
  /**
   * What a single table OUTPUT cell edit means geometrically:
   *   "translate" — hold the slope, slide the line (b moves). Always feasible.
   *   "pivot"     — hold the intercept, tilt the line (m moves). Impossible at x = 0, and that
   *                 impossibility is the lesson, so it is a rejection with a reason.
   */
  readonly tableEdit: "translate" | "pivot";
};

/**
 * The canonical line. Note what is NOT here: no rise (it is m·run), no anchor y (it is m·x + b),
 * no table rows (they are the domain evaluated on the line), no equation string. Every one of
 * those is derivable, so storing it would create exactly the second source of truth the RSG
 * exists to abolish.
 */
export type LineCanonical = {
  readonly m: Rat;
  readonly b: Rat;
  /** Slope-triangle anchor: only its input is stored, so the anchor is ON the line by construction. */
  readonly anchorX: Rat;
  /** Slope-triangle run leg. Never zero — a zero run is a vertical line, rejected at absorb. */
  readonly run: Rat;
  readonly domain: LineDomain;
  readonly window: LineWindow;
  readonly context: LineContext;
  readonly policy: LinePolicy;
};

export const DEFAULT_LINE_POLICY: LinePolicy = Object.freeze({
  slopeMin: null,
  slopeMax: null,
  interceptMin: null,
  interceptMax: null,
  slopeStep: null,
  interceptStep: null,
  outOfRange: "reject",
  offLattice: "reject",
  tableEdit: "translate"
});

export const DEFAULT_LINE_CONTEXT: LineContext = Object.freeze({
  subject: "the trip",
  xLabel: "time",
  xUnit: "hours",
  xUnitSingular: "hour",
  yLabel: "distance",
  yUnit: "kilometres"
});

/** Authoring shape: sub-objects may be given partially and are merged over the defaults. */
export type LineCanonicalInit = Partial<Omit<LineCanonical, "domain" | "window" | "context" | "policy">> & {
  readonly domain?: Partial<LineDomain>;
  readonly window?: Partial<LineWindow>;
  readonly context?: Partial<LineContext>;
  readonly policy?: Partial<LinePolicy>;
};

export function makeLineCanonical(overrides: LineCanonicalInit = {}): LineCanonical {
  const base: LineCanonical = {
    m: ONE,
    b: ZERO,
    anchorX: ZERO,
    run: ONE,
    domain: { start: ZERO, step: ONE, count: 5 },
    window: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 },
    context: DEFAULT_LINE_CONTEXT,
    policy: DEFAULT_LINE_POLICY
  };
  const next: LineCanonical = {
    ...base,
    ...overrides,
    domain: { ...base.domain, ...(overrides.domain ?? {}) },
    window: { ...base.window, ...(overrides.window ?? {}) },
    context: { ...base.context, ...(overrides.context ?? {}) },
    policy: { ...base.policy, ...(overrides.policy ?? {}) }
  };
  if (ratIsZero(next.run)) throw new RationalDomainError("a slope triangle needs a non-zero run");
  if (ratIsZero(next.domain.step)) throw new RationalDomainError("a table domain needs a non-zero step");
  if (!Number.isInteger(next.domain.count) || next.domain.count < 1) {
    throw new RationalDomainError("a table domain needs at least one row");
  }
  return Object.freeze(next);
}

/** y = m·x + b, exactly. The single place the line's defining relation is written down. */
export const lineValueAt = (c: Pick<LineCanonical, "m" | "b">, x: Rat): Rat => ratAdd(ratMul(c.m, x), c.b);

/** Input rows of the table domain: start, start + step, … (count of them). */
export const domainInputs = (domain: LineDomain): Rat[] => {
  const out: Rat[] = [];
  for (let i = 0; i < domain.count; i += 1) out.push(ratAdd(domain.start, ratMul(rat(i), domain.step)));
  return out;
};

/* ------------------------------------------------------------------ *
 * edits                                                               *
 * ------------------------------------------------------------------ */

export type TableRowInput = { readonly x: Rat; readonly y: Rat };

export type EquationEdit =
  | { readonly kind: "setSlope"; readonly m: Rat }
  | { readonly kind: "setIntercept"; readonly b: Rat };

export type GraphEdit =
  /**
   * `handle` says which invariant the gesture holds — this is the whole mathematics of dragging:
   *   "intercept" — hold the slope, slide the line onto (x, y).  b := y − m·x
   *   "unit"      — hold the intercept, tilt about (0, b) onto (x, y).  m := (y − b)/x
   *   "free"      — hold the slope-triangle anchor, tilt about it onto (x, y).
   */
  | { readonly kind: "dragPoint"; readonly handle: "intercept" | "unit" | "free"; readonly x: Rat; readonly y: Rat };

export type TableEdit =
  | { readonly kind: "setOutputCell"; readonly row: number; readonly y: Rat }
  | { readonly kind: "setInputCell"; readonly row: number; readonly x: Rat }
  | { readonly kind: "setRows"; readonly rows: readonly TableRowInput[] }
  | { readonly kind: "setDomain"; readonly start?: Rat; readonly step?: Rat; readonly count?: number };

export type TriangleEdit =
  | { readonly kind: "setRunRise"; readonly run: Rat; readonly rise: Rat }
  | { readonly kind: "setRun"; readonly run: Rat }
  | { readonly kind: "setAnchorX"; readonly x: Rat };

export type ContextEdit =
  | { readonly kind: "setRate"; readonly value: Rat }
  | { readonly kind: "setStart"; readonly value: Rat };

export type LineEdit = EquationEdit | GraphEdit | TableEdit | TriangleEdit | ContextEdit;

/* ------------------------------------------------------------------ *
 * parameter guards (the declared clamp policy lives here)             *
 * ------------------------------------------------------------------ */

type Guarded = { value: Rat; notes: AbsorbNote[] } | { reject: AbsorbNote };

function guardParameter(
  value: Rat,
  name: "slope" | "intercept",
  policy: LinePolicy
): Guarded {
  const step = name === "slope" ? policy.slopeStep : policy.interceptStep;
  const min = name === "slope" ? policy.slopeMin : policy.interceptMin;
  const max = name === "slope" ? policy.slopeMax : policy.interceptMax;
  const notes: AbsorbNote[] = [];
  let out = value;

  if (step && !ratOnLattice(out, step)) {
    if (policy.offLattice === "reject") {
      return {
        reject: {
          code: `${name}-off-lattice`,
          reason: `${ratText(out)} is not a multiple of ${ratText(step)}, and this ${name} only takes steps of ${ratText(step)}`
        }
      };
    }
    const snapped = ratSnap(out, step);
    notes.push({
      code: `${name}-snapped`,
      reason: `${ratText(out)} snapped to ${ratText(snapped)}, the nearest multiple of ${ratText(step)}`
    });
    out = snapped;
  }

  if (min && ratCmp(out, min) < 0) {
    if (policy.outOfRange === "reject") {
      return {
        reject: {
          code: `${name}-out-of-range`,
          reason: `${ratText(out)} is below the smallest ${name} this line allows, ${ratText(min)}`
        }
      };
    }
    notes.push({ code: `${name}-clamped`, reason: `${ratText(out)} clamped up to the smallest allowed ${name}, ${ratText(min)}` });
    out = min;
  }
  if (max && ratCmp(out, max) > 0) {
    if (policy.outOfRange === "reject") {
      return {
        reject: {
          code: `${name}-out-of-range`,
          reason: `${ratText(out)} is above the largest ${name} this line allows, ${ratText(max)}`
        }
      };
    }
    notes.push({ code: `${name}-clamped`, reason: `${ratText(out)} clamped down to the largest allowed ${name}, ${ratText(max)}` });
    out = max;
  }
  return { value: out, notes };
}

const mergeNotes = (notes: readonly AbsorbNote[]): AbsorbNote | undefined =>
  notes.length === 0
    ? undefined
    : notes.length === 1
      ? notes[0]
      : { code: notes.map((n) => n.code).join("+"), reason: notes.map((n) => n.reason).join("; ") };

/**
 * A canonical state is only accepted if EVERY representation can still be derived exactly. That
 * keeps "the model never holds a state it cannot show" an invariant of absorb rather than a
 * hazard discovered at render time — an exact-arithmetic blow-up becomes a rejection with a
 * reason instead of a thrown error mid-paint.
 */
function ensureDerivable(c: LineCanonical): AbsorbOutcome<LineCanonical> | null {
  try {
    deriveEquation(c);
    deriveGraph(c);
    deriveTable(c);
    deriveTriangle(c);
    deriveContext(c);
    return null;
  } catch (error) {
    if (error instanceof RationalOverflowError) {
      return no("rational-overflow", `${error.message} — this line cannot be shown exactly in every representation`);
    }
    if (error instanceof RationalDomainError) return no("rational-domain", error.message);
    throw error;
  }
}

const ok = (canonical: LineCanonical, notes: readonly AbsorbNote[] = []): AbsorbOutcome<LineCanonical> => {
  const undrawable = ensureDerivable(canonical);
  if (undrawable) return undrawable;
  const clamp = mergeNotes(notes);
  return clamp ? { ok: true, canonical, clamp } : { ok: true, canonical };
};

const no = (code: string, reason: string, detail?: Record<string, unknown>): AbsorbOutcome<LineCanonical> =>
  detail ? { ok: false, code, reason, detail } : { ok: false, code, reason };

/** Set m and/or b through the declared policy, returning a rejection or a clamped success. */
function setParameters(
  c: LineCanonical,
  next: { m?: Rat; b?: Rat },
  extra: Partial<LineCanonical> = {}
): AbsorbOutcome<LineCanonical> {
  const notes: AbsorbNote[] = [];
  let m = c.m;
  let b = c.b;
  if (next.m) {
    const g = guardParameter(next.m, "slope", c.policy);
    if ("reject" in g) return no(g.reject.code, g.reject.reason);
    m = g.value;
    notes.push(...g.notes);
  }
  if (next.b) {
    const g = guardParameter(next.b, "intercept", c.policy);
    if ("reject" in g) return no(g.reject.code, g.reject.reason);
    b = g.value;
    notes.push(...g.notes);
  }
  return ok({ ...c, ...extra, m, b }, notes);
}

/** Any exact-arithmetic blow-up becomes a rejection carrying a reason, never a wrong picture. */
function guardArithmetic(run: () => AbsorbOutcome<LineCanonical>): AbsorbOutcome<LineCanonical> {
  try {
    return run();
  } catch (error) {
    if (error instanceof RationalOverflowError) return no("rational-overflow", error.message);
    if (error instanceof RationalDomainError) return no("rational-domain", error.message);
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * absorb                                                              *
 * ------------------------------------------------------------------ */

export function absorbLineEdit(c: LineCanonical, edit: LineEdit): AbsorbOutcome<LineCanonical> {
  return guardArithmetic(() => {
    switch (edit.kind) {
      case "setSlope":
        return setParameters(c, { m: edit.m });
      case "setIntercept":
        return setParameters(c, { b: edit.b });
      case "setRate":
        return setParameters(c, { m: edit.value });
      case "setStart":
        return setParameters(c, { b: edit.value });

      case "dragPoint": {
        if (edit.handle === "intercept") {
          // Slide: the slope is held, so b is whatever makes the line meet the pointer.
          return setParameters(c, { b: ratSub(edit.y, ratMul(c.m, edit.x)) });
        }
        if (edit.handle === "unit") {
          if (ratIsZero(edit.x)) {
            return no(
              "pivot-at-intercept",
              "the point at x = 0 IS the y-intercept, so no amount of tilting moves it; drag the intercept handle instead"
            );
          }
          return setParameters(c, { m: ratDiv(ratSub(edit.y, c.b), edit.x) });
        }
        // free: pivot about the slope-triangle anchor, which stays on the line.
        const ax = c.anchorX;
        const ay = lineValueAt(c, ax);
        if (ratEq(edit.x, ax)) {
          return no(
            "pivot-at-anchor",
            `x = ${ratText(ax)} is the pivot itself; a line turning about (${ratText(ax)}, ${ratText(ay)}) can never move that point`
          );
        }
        const m = ratDiv(ratSub(edit.y, ay), ratSub(edit.x, ax));
        // Pivoting holds the anchor fixed, so the intercept follows: b = ay − m·ax.
        const guarded = guardParameter(m, "slope", c.policy);
        if ("reject" in guarded) return no(guarded.reject.code, guarded.reject.reason);
        const finalM = guarded.value;
        const finalB = ratSub(ay, ratMul(finalM, ax));
        const bGuard = guardParameter(finalB, "intercept", c.policy);
        if ("reject" in bGuard) return no(bGuard.reject.code, bGuard.reject.reason);
        return ok({ ...c, m: finalM, b: bGuard.value }, [...guarded.notes, ...bGuard.notes]);
      }

      case "setOutputCell": {
        const inputs = domainInputs(c.domain);
        const x = inputs[edit.row];
        if (!x) return no("table-row-missing", `this table has rows 0 to ${c.domain.count - 1}; there is no row ${edit.row}`);
        if (c.policy.tableEdit === "translate") {
          return setParameters(c, { b: ratSub(edit.y, ratMul(c.m, x)) });
        }
        if (ratIsZero(x)) {
          return no(
            "table-pivot-at-zero",
            `row ${edit.row} has input 0, so its output is the y-intercept itself; with the intercept held fixed no slope can change it`
          );
        }
        return setParameters(c, { m: ratDiv(ratSub(edit.y, c.b), x) });
      }

      case "setInputCell": {
        if (edit.row < 0 || edit.row >= c.domain.count) {
          return no("table-row-missing", `this table has rows 0 to ${c.domain.count - 1}; there is no row ${edit.row}`);
        }
        if (edit.row === 0) return ok({ ...c, domain: { ...c.domain, start: edit.x } });
        const step = ratDiv(ratSub(edit.x, c.domain.start), rat(edit.row));
        if (ratIsZero(step)) {
          return no(
            "table-duplicate-input",
            `row ${edit.row} would share the input ${ratText(edit.x)} with row 0, and a function's table cannot list one input twice`
          );
        }
        return ok({ ...c, domain: { ...c.domain, step } });
      }

      case "setRows":
        return absorbRows(c, edit.rows);

      case "setDomain": {
        const start = edit.start ?? c.domain.start;
        const step = edit.step ?? c.domain.step;
        const count = edit.count ?? c.domain.count;
        if (ratIsZero(step)) {
          return no("domain-step-zero", "a table with step 0 repeats one input forever; a function's table needs distinct inputs");
        }
        if (!Number.isInteger(count) || count < 1 || count > 24) {
          return no("domain-count-out-of-range", `a table needs between 1 and 24 rows; ${count} is not a usable row count`);
        }
        return ok({ ...c, domain: { start, step, count } });
      }

      case "setRunRise": {
        if (ratIsZero(edit.run)) {
          return no(
            "run-zero",
            "a run of 0 describes a vertical line, and a vertical line is not the graph of y = mx + b — its slope is undefined"
          );
        }
        const m = ratDiv(edit.rise, edit.run);
        const guarded = guardParameter(m, "slope", c.policy);
        if ("reject" in guarded) return no(guarded.reject.code, guarded.reject.reason);
        // The triangle keeps the run the learner built: 1/2 and 2/4 are the same slope drawn as
        // two different, both-correct triangles, and the model must be able to show either.
        return ok({ ...c, m: guarded.value, run: edit.run }, guarded.notes);
      }

      case "setRun": {
        if (ratIsZero(edit.run)) {
          return no("run-zero", "a slope triangle needs a non-zero run; with run 0 there is no ratio to read");
        }
        return ok({ ...c, run: edit.run });
      }

      case "setAnchorX":
        return ok({ ...c, anchorX: edit.x });
    }
  });
}

/**
 * Multi-row table edit — the one edit that can genuinely describe "no such line". Two distinct
 * inputs fix a line; every remaining row is then a claim that must hold.
 */
function absorbRows(c: LineCanonical, rows: readonly TableRowInput[]): AbsorbOutcome<LineCanonical> {
  if (rows.length < 2) {
    return no("table-underdetermined", "one point does not determine a line; give at least two rows");
  }
  for (let i = 0; i < rows.length; i += 1) {
    for (let j = i + 1; j < rows.length; j += 1) {
      if (ratEq(rows[i]!.x, rows[j]!.x) && !ratEq(rows[i]!.y, rows[j]!.y)) {
        return no(
          "table-duplicate-input",
          `rows ${i} and ${j} both use the input ${ratText(rows[i]!.x)} but give different outputs (${ratText(rows[i]!.y)} and ${ratText(rows[j]!.y)}); a function has one output per input`,
          { rows: [i, j] }
        );
      }
    }
  }
  const first = rows[0]!;
  const pivotIndex = rows.findIndex((row) => !ratEq(row.x, first.x));
  if (pivotIndex < 0) {
    return no(
      "table-vertical",
      `every row uses the input ${ratText(first.x)}, so the points sit on a vertical line, which is not the graph of y = mx + b`
    );
  }
  const second = rows[pivotIndex]!;
  const m = ratDiv(ratSub(second.y, first.y), ratSub(second.x, first.x));
  const b = ratSub(first.y, ratMul(m, first.x));
  for (let i = 0; i < rows.length; i += 1) {
    const expected = ratAdd(ratMul(m, rows[i]!.x), b);
    if (!ratEq(expected, rows[i]!.y)) {
      return no(
        "table-not-collinear",
        `rows 0 and ${pivotIndex} fix the line y = ${ratText(m)}x + ${ratText(b)}, which sends ${ratText(rows[i]!.x)} to ${ratText(expected)}; row ${i} says ${ratText(rows[i]!.y)}, so no single line holds all these rows`,
        { row: i, expected: ratText(expected), actual: ratText(rows[i]!.y) }
      );
    }
  }
  const guardedM = guardParameter(m, "slope", c.policy);
  if ("reject" in guardedM) return no(guardedM.reject.code, guardedM.reject.reason);
  const guardedB = guardParameter(b, "intercept", c.policy);
  if ("reject" in guardedB) return no(guardedB.reject.code, guardedB.reject.reason);

  // The x column IS the domain. When the typed inputs form an arithmetic sequence they define
  // it; when they do not, the domain is untouched and the clamp note says so out loud rather
  // than letting the table silently redraw different inputs than the learner typed.
  const notes: AbsorbNote[] = [...guardedM.notes, ...guardedB.notes];
  const step = ratSub(rows[1]!.x, rows[0]!.x);
  let arithmetic = !ratIsZero(step);
  for (let i = 1; i < rows.length && arithmetic; i += 1) {
    if (!ratEq(ratSub(rows[i]!.x, rows[i - 1]!.x), step)) arithmetic = false;
  }
  if (arithmetic) {
    return ok(
      { ...c, m: guardedM.value, b: guardedB.value, domain: { start: rows[0]!.x, step, count: rows.length } },
      notes
    );
  }
  notes.push({
    code: "table-domain-unchanged",
    reason: `the inputs ${rows.map((row) => ratText(row.x)).join(", ")} are not evenly spaced, so the line was updated but the table keeps its own evenly spaced inputs`
  });
  return ok({ ...c, m: guardedM.value, b: guardedB.value }, notes);
}

/* ------------------------------------------------------------------ *
 * derivations                                                         *
 * ------------------------------------------------------------------ */

export type RatPoint = { readonly x: Rat; readonly y: Rat };

export type EquationView = {
  readonly m: Rat;
  readonly b: Rat;
  readonly slopeText: string;
  readonly interceptText: string;
  /** Always the full canonical form — machine-parseable, e.g. "y = 3/2x + -2". */
  readonly text: string;
  /** Reading form: "y = x", "y = −3x + 4", "y = 2". */
  readonly display: string;
  readonly parts: {
    readonly slopeTerm: string;
    readonly sign: "+" | "−";
    readonly interceptMagnitude: string;
  };
  /** Point-slope through the slope-triangle anchor — the same line said a second way. */
  readonly pointSlopeText: string;
};

export type GraphView = {
  readonly window: LineWindow;
  readonly from: RatPoint;
  readonly to: RatPoint;
  readonly intercept: RatPoint;
  readonly unitPoint: RatPoint;
  readonly anchor: RatPoint;
  readonly handles: readonly { readonly id: "intercept" | "unit" | "free"; readonly at: RatPoint }[];
  /** Integer-coordinate points of the line inside the window — the "it goes through" evidence. */
  readonly latticePoints: readonly RatPoint[];
};

export type TableView = {
  readonly headerX: string;
  readonly headerY: string;
  readonly step: Rat;
  /** Δy between consecutive rows = m·step. Constant, which is what makes the table linear. */
  readonly firstDifference: Rat;
  readonly rows: readonly {
    readonly index: number;
    readonly x: Rat;
    readonly y: Rat;
    readonly xText: string;
    readonly yText: string;
  }[];
};

export type TriangleView = {
  readonly anchor: RatPoint;
  readonly corner: RatPoint;
  readonly tip: RatPoint;
  readonly run: Rat;
  readonly rise: Rat;
  readonly runText: string;
  readonly riseText: string;
  readonly slopeText: string;
  readonly orientation: "up" | "down" | "flat";
};

export type ContextView = {
  readonly sentence: string;
  readonly startSentence: string;
  readonly rateSentence: string;
  readonly bindings: {
    readonly rate: Rat;
    readonly start: Rat;
    readonly rateText: string;
    readonly startText: string;
    readonly xUnit: string;
    readonly yUnit: string;
  };
};

export function deriveEquation(c: LineCanonical): EquationView {
  const slopeText = ratText(c.m);
  const interceptText = ratText(c.b);
  const sign: "+" | "−" = c.b.n < 0 ? "−" : "+";
  const magnitude = ratText(rat(Math.abs(c.b.n), c.b.d));
  const slopeTerm = ratEq(c.m, ONE) ? "x" : ratEq(c.m, rat(-1)) ? "−x" : `${ratDisplay(c.m)}x`;
  const display = ratIsZero(c.m)
    ? `y = ${ratDisplay(c.b)}`
    : ratIsZero(c.b)
      ? `y = ${slopeTerm}`
      : `y = ${slopeTerm} ${sign} ${magnitude}`;
  const ax = c.anchorX;
  const ay = lineValueAt(c, ax);
  return {
    m: c.m,
    b: c.b,
    slopeText,
    interceptText,
    text: `y = ${slopeText}x + ${interceptText}`,
    display,
    parts: { slopeTerm, sign, interceptMagnitude: magnitude },
    pointSlopeText: `y - ${ratText(ay)} = ${slopeText}(x - ${ratText(ax)})`
  };
}

export function deriveGraph(c: LineCanonical): GraphView {
  // The window's edges are NOT assumed to be integers. A plot that auto-scales to its content
  // (affineRelationshipLab pads its extent by 8%) hands over fractional bounds, so the edges go
  // through `ratFromNumber` — exact for the integer windows every other surface uses — and the
  // lattice walk runs over the integers strictly inside the window instead of stepping from a
  // fractional edge. Before S209 a fractional bound threw out of `rat`.
  const edge = (v: number): Rat => (Number.isInteger(v) ? rat(v) : ratFromNumber(v));
  const from = { x: edge(c.window.xMin), y: lineValueAt(c, edge(c.window.xMin)) };
  const to = { x: edge(c.window.xMax), y: lineValueAt(c, edge(c.window.xMax)) };
  const intercept = { x: ZERO, y: c.b };
  const unitPoint = { x: ONE, y: lineValueAt(c, ONE) };
  const anchor = { x: c.anchorX, y: lineValueAt(c, c.anchorX) };
  const lattice: RatPoint[] = [];
  for (let x = Math.ceil(c.window.xMin); x <= Math.floor(c.window.xMax); x += 1) {
    const y = lineValueAt(c, rat(x));
    if (ratIsInteger(y) && y.n >= c.window.yMin && y.n <= c.window.yMax) lattice.push({ x: rat(x), y });
  }
  return {
    window: c.window,
    from,
    to,
    intercept,
    unitPoint,
    anchor,
    handles: [
      { id: "intercept", at: intercept },
      { id: "unit", at: unitPoint },
      { id: "free", at: anchor }
    ],
    latticePoints: lattice
  };
}

export function deriveTable(c: LineCanonical): TableView {
  const rows = domainInputs(c.domain).map((x, index) => {
    const y = lineValueAt(c, x);
    return { index, x, y, xText: ratText(x), yText: ratText(y) };
  });
  return {
    headerX: c.context.xLabel,
    headerY: c.context.yLabel,
    step: c.domain.step,
    firstDifference: ratMul(c.m, c.domain.step),
    rows
  };
}

export function deriveTriangle(c: LineCanonical): TriangleView {
  const anchor = { x: c.anchorX, y: lineValueAt(c, c.anchorX) };
  const rise = ratMul(c.m, c.run);
  const corner = { x: ratAdd(c.anchorX, c.run), y: anchor.y };
  const tip = { x: corner.x, y: ratAdd(anchor.y, rise) };
  return {
    anchor,
    corner,
    tip,
    run: c.run,
    rise,
    runText: ratText(c.run),
    riseText: ratText(rise),
    slopeText: `${ratText(rise)} ÷ ${ratText(c.run)}`,
    orientation: rise.n > 0 ? "up" : rise.n < 0 ? "down" : "flat"
  };
}

export function deriveContext(c: LineCanonical): ContextView {
  const { subject, xUnitSingular, xUnit, yUnit } = c.context;
  const startSentence = `${subject} starts at ${ratDisplay(c.b)} ${yUnit}.`;
  const rateSentence = ratIsZero(c.m)
    ? `${subject} does not change as ${c.context.xLabel} goes on.`
    : `Every ${xUnitSingular}, ${subject} changes by ${ratDisplay(c.m)} ${yUnit}.`;
  return {
    sentence: `${startSentence} ${rateSentence}`,
    startSentence,
    rateSentence,
    bindings: {
      rate: c.m,
      start: c.b,
      rateText: ratText(c.m),
      startText: ratText(c.b),
      xUnit,
      yUnit
    }
  };
}

/* ------------------------------------------------------------------ *
 * the graph wiring                                                    *
 * ------------------------------------------------------------------ */

/**
 * Five nodes. `model` is the canonical hub and is deliberately read-only as a representation:
 * nothing edits the canonical state except through a representation's absorb, which is what
 * keeps the propagation depth at exactly one.
 */
export const lineFamilyReps = {
  model: { label: "canonical line", derive: (c: LineCanonical): LineCanonical => c },
  equation: {
    label: "equation",
    derive: deriveEquation,
    absorb: (c: LineCanonical, edit: EquationEdit) => absorbLineEdit(c, edit)
  },
  graph: {
    label: "graph",
    derive: deriveGraph,
    absorb: (c: LineCanonical, edit: GraphEdit) => absorbLineEdit(c, edit)
  },
  table: {
    label: "table",
    derive: deriveTable,
    absorb: (c: LineCanonical, edit: TableEdit) => absorbLineEdit(c, edit)
  },
  triangle: {
    label: "slope triangle",
    derive: deriveTriangle,
    absorb: (c: LineCanonical, edit: TriangleEdit) => absorbLineEdit(c, edit)
  },
  context: {
    label: "context sentence",
    derive: deriveContext,
    absorb: (c: LineCanonical, edit: ContextEdit) => absorbLineEdit(c, edit)
  }
} as const;

export type LineFamilyReps = typeof lineFamilyReps;
export type LineFamilyGraph = RepSyncGraph<LineCanonical, LineFamilyReps>;

export function createLineFamilyGraph(
  initial: LineCanonicalInit = {},
  options: { historyLimit?: number; history?: readonly LineCanonical[] } = {}
): LineFamilyGraph {
  return createRepSyncGraph({
    canonical: makeLineCanonical(initial),
    reps: lineFamilyReps,
    ...(options.historyLimit === undefined ? {} : { historyLimit: options.historyLimit }),
    ...(options.history === undefined ? {} : { history: options.history })
  });
}

/**
 * Slope-equivalence key. Two states with the same slope but different triangles (run 1 vs run 2)
 * are DIFFERENT canonical states — the triangles are genuinely different pictures — but the same
 * slope class, which is exactly the distinction `slopeTriangle` grades on.
 */
export const lineSlopeKey = (c: LineCanonical): string => ratText(c.m);
/** The full line's identity, ignoring presentation-only fields (triangle, domain, window). */
export const lineIdentityKey = (c: LineCanonical): string => `${ratText(c.m)}|${ratText(c.b)}`;

/* ------------------------------------------------------------------ *
 * MMIP v1 adoption                                                    *
 * ------------------------------------------------------------------ */

/** Which slot of the canonical state an operation acts on. */
export type LineTarget = "slope" | "intercept" | "triangle" | "anchor" | "domain";

const ratAbs = (a: Rat): Rat => rat(Math.abs(a.n), a.d);

/**
 * Name the mathematics that took `before` to `after`, in MMIP's vocabulary, so the motion layer
 * animates an OPERATION rather than a pixel diff. The naming is honest about which operation it
 * was: reversing a rate is a REFLECT, tripling it is a BRANCH, nudging it is an add.
 */
export function describeLineChange(before: LineCanonical, after: LineCanonical): MmipOperation<LineTarget>[] {
  const ops: MmipOperation<LineTarget>[] = [];

  if (!ratEq(before.m, after.m)) {
    const scale = ratIsZero(before.m) ? null : ratDiv(after.m, before.m);
    if (!ratIsZero(before.m) && ratEq(after.m, ratNeg(before.m))) {
      ops.push({
        kind: "negate",
        target: "slope",
        amount: -1,
        sides: ["line"],
        describe: `Reverse the rate: ${ratText(before.m)} becomes ${ratText(after.m)}, so the line tilts the other way.`
      });
    } else if (scale && ratIsInteger(scale) && Math.abs(scale.n) >= 2) {
      ops.push({
        kind: "distribute",
        target: "slope",
        amount: scale.n,
        sides: ["line"],
        describe: `Multiply the rate by ${scale.n}: ${ratText(before.m)} becomes ${ratText(after.m)}, so the line steepens.`
      });
    } else if (scale && Math.abs(scale.n) === 1 && scale.d >= 2) {
      ops.push({
        kind: "divide",
        target: "slope",
        amount: scale.n < 0 ? -scale.d : scale.d,
        sides: ["line"],
        describe: `Divide the rate by ${scale.d}: ${ratText(before.m)} becomes ${ratText(after.m)}, so the line flattens.`
      });
    } else {
      const delta = ratSub(after.m, before.m);
      ops.push({
        kind: delta.n > 0 ? "add" : "subtract",
        target: "slope",
        amount: ratToNumber(delta),
        sides: ["line"],
        describe: `Change the rate by ${ratText(delta)}: ${ratText(before.m)} becomes ${ratText(after.m)}.`
      });
    }
  }

  if (!ratEq(before.b, after.b)) {
    const delta = ratSub(after.b, before.b);
    ops.push({
      kind: delta.n > 0 ? "add" : "subtract",
      target: "intercept",
      amount: ratToNumber(delta),
      sides: ["line"],
      describe: `Slide the line ${delta.n > 0 ? "up" : "down"} by ${ratText(ratAbs(delta))}: the starting value moves from ${ratText(before.b)} to ${ratText(after.b)}.`
    });
  }

  if (!ratEq(before.run, after.run)) {
    const scale = ratDiv(after.run, before.run);
    if (ratIsInteger(scale) && Math.abs(scale.n) >= 2) {
      ops.push({
        kind: "distribute",
        target: "triangle",
        amount: scale.n,
        sides: ["triangle"],
        describe: `Draw the same slope on a triangle ${scale.n} times as wide: run ${ratText(before.run)} becomes ${ratText(after.run)}, and the rise scales with it.`
      });
    } else if (Math.abs(scale.n) === 1 && scale.d >= 2) {
      ops.push({
        kind: "divide",
        target: "triangle",
        amount: scale.n < 0 ? -scale.d : scale.d,
        sides: ["triangle"],
        describe: `Draw the same slope on a triangle ${scale.d} times as narrow: run ${ratText(before.run)} becomes ${ratText(after.run)}.`
      });
    } else {
      const delta = ratSub(after.run, before.run);
      ops.push({
        kind: delta.n > 0 ? "add" : "subtract",
        target: "triangle",
        amount: ratToNumber(delta),
        sides: ["triangle"],
        describe: `Change the triangle's run by ${ratText(delta)}: ${ratText(before.run)} becomes ${ratText(after.run)}, with the rise following the same slope.`
      });
    }
  }

  if (!ratEq(before.anchorX, after.anchorX)) {
    const delta = ratSub(after.anchorX, before.anchorX);
    ops.push({
      kind: delta.n > 0 ? "add" : "subtract",
      target: "anchor",
      amount: ratToNumber(delta),
      sides: ["triangle"],
      describe: `Slide the triangle along the line to x = ${ratText(after.anchorX)}; the slope it measures does not change.`
    });
  }

  const domainChanged =
    !ratEq(before.domain.start, after.domain.start) ||
    !ratEq(before.domain.step, after.domain.step) ||
    before.domain.count !== after.domain.count;
  if (domainChanged) {
    ops.push({
      kind: after.domain.count >= before.domain.count ? "add" : "subtract",
      target: "domain",
      amount: after.domain.count - before.domain.count,
      sides: ["table"],
      describe: `Read the same line at new inputs: ${after.domain.count} rows starting at ${ratText(after.domain.start)}, stepping by ${ratText(after.domain.step)}.`
    });
  }

  return ops;
}

/**
 * Coerce anything at all into a whole canonical line. Restored storage, an older shape, a partial
 * from a test, or outright rubbish: every rational is rebuilt through `rat` (so a denominator of 0
 * or a non-integer part cannot survive), every structural field is bounds-checked, and the
 * function never throws — MMIP requires exactly that of `CanonicalModel.normalize`.
 */
export function normalizeLineCanonical(raw: unknown): LineCanonical {
  const src = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const asRat = (value: unknown, fallback: Rat, rejectZero = false): Rat => {
    if (!value || typeof value !== "object") return fallback;
    const candidate = value as { n?: unknown; d?: unknown };
    if (typeof candidate.n !== "number" || typeof candidate.d !== "number") return fallback;
    try {
      const built = rat(candidate.n, candidate.d);
      return rejectZero && ratIsZero(built) ? fallback : built;
    } catch {
      return fallback;
    }
  };
  const asInt = (value: unknown, fallback: number): number => (Number.isInteger(value) ? (value as number) : fallback);
  const asText = (value: unknown, fallback: string): string =>
    typeof value === "string" && value.length > 0 ? value : fallback;
  const asEnum = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    allowed.includes(value as T) ? (value as T) : fallback;

  const base = makeLineCanonical();
  const domain = (src.domain && typeof src.domain === "object" ? src.domain : {}) as Record<string, unknown>;
  const window = (src.window && typeof src.window === "object" ? src.window : {}) as Record<string, unknown>;
  const context = (src.context && typeof src.context === "object" ? src.context : {}) as Record<string, unknown>;
  const policy = (src.policy && typeof src.policy === "object" ? src.policy : {}) as Record<string, unknown>;
  const optionalRat = (value: unknown): Rat | null => {
    if (value === null || value === undefined) return null;
    const built = asRat(value, ZERO);
    return value && typeof value === "object" && typeof (value as Rat).n === "number" ? built : null;
  };

  const xMin = asInt(window.xMin, base.window.xMin);
  const xMax = asInt(window.xMax, base.window.xMax);
  try {
    return makeLineCanonical({
      m: asRat(src.m, base.m),
      b: asRat(src.b, base.b),
      anchorX: asRat(src.anchorX, base.anchorX),
      run: asRat(src.run, base.run, true),
      domain: {
        start: asRat(domain.start, base.domain.start),
        step: asRat(domain.step, base.domain.step, true),
        count: Math.min(24, Math.max(1, asInt(domain.count, base.domain.count)))
      },
      window: {
        xMin: Math.min(xMin, xMax),
        xMax: xMin === xMax ? xMin + 1 : Math.max(xMin, xMax),
        yMin: asInt(window.yMin, base.window.yMin),
        yMax: asInt(window.yMax, base.window.yMax)
      },
      context: {
        subject: asText(context.subject, base.context.subject),
        xLabel: asText(context.xLabel, base.context.xLabel),
        xUnit: asText(context.xUnit, base.context.xUnit),
        xUnitSingular: asText(context.xUnitSingular, base.context.xUnitSingular),
        yLabel: asText(context.yLabel, base.context.yLabel),
        yUnit: asText(context.yUnit, base.context.yUnit)
      },
      policy: {
        slopeMin: optionalRat(policy.slopeMin),
        slopeMax: optionalRat(policy.slopeMax),
        interceptMin: optionalRat(policy.interceptMin),
        interceptMax: optionalRat(policy.interceptMax),
        slopeStep: optionalRat(policy.slopeStep),
        interceptStep: optionalRat(policy.interceptStep),
        outOfRange: asEnum(policy.outOfRange, ["reject", "clamp"] as const, base.policy.outOfRange),
        offLattice: asEnum(policy.offLattice, ["reject", "snap"] as const, base.policy.offLattice),
        tableEdit: asEnum(policy.tableEdit, ["translate", "pivot"] as const, base.policy.tableEdit)
      }
    });
  } catch {
    return base;
  }
}

export type LineFamilyViews = {
  readonly equation: EquationView;
  readonly graph: GraphView;
  readonly table: TableView;
  readonly triangle: TriangleView;
  readonly context: ContextView;
};

export interface LineFamilyModel extends CanonicalModel<LineCanonical, LineEdit, LineTarget> {
  readonly representations: RepresentationBinding<LineCanonical, unknown>[];
  readonly views: (state: LineCanonical) => LineFamilyViews;
  readonly createGraph: (start?: LineCanonical) => LineFamilyGraph;
}

/**
 * Assemble the MMIP `CanonicalModel` for one authored line problem.
 *
 * A FACTORY, mirroring `solveBalanceCanonicalModel` (S209-A1): `CanonicalModel.initial` is a
 * value, and a line surface's starting position, window and slider policy are all functions of
 * the spec, so one instance per problem is the only honest reading of the frozen shape. This is
 * the object `LineExploreW` runs through — before S209-B the widget imported the loose helpers
 * and the interface was a specification the code satisfied rather than a seam the code passed
 * through. `views` derives THROUGH the representation bindings, so `RepresentationBinding.derive`
 * is load-bearing rather than decorative: there is no second path from state to a view.
 *
 * `equivalent` asks the mathematical question — do these two states claim the same line? — and so
 * ignores the triangle the learner happened to draw, the table window and the graph window,
 * exactly as `mmipTypes.CanonicalModel.equivalent` describes.
 */
export function lineFamilyCanonicalModel(init: LineCanonicalInit = {}): LineFamilyModel {
  const initial = makeLineCanonical(init);
  const bindings = (Object.keys(lineFamilyReps) as (keyof LineFamilyReps)[]).map((id) => ({
    id,
    label: lineFamilyReps[id].label,
    derive: (state: LineCanonical) => lineFamilyReps[id].derive(state) as unknown,
    editable: () => Boolean((lineFamilyReps[id] as { absorb?: unknown }).absorb)
  }));
  return {
    id: "lineFamily",
    initial,
    representations: bindings,
    normalize: normalizeLineCanonical,
    apply: (state, edit, origin, source): SyncTransaction<LineCanonical, LineTarget> => {
      const outcome = absorbLineEdit(state, edit);
      if (!outcome.ok) {
        return rejectTransaction<LineCanonical, LineTarget>(state, origin, source, {
          code: outcome.code,
          message: outcome.reason
        });
      }
      const ops = describeLineChange(state, outcome.canonical);
      return { before: state, after: outcome.canonical, origin, source, ops, changed: ops.length > 0, rejected: false };
    },
    equivalent: (a, b) => lineIdentityKey(a) === lineIdentityKey(b),
    views: (state) => ({
      equation: lineFamilyReps.equation.derive(state),
      graph: lineFamilyReps.graph.derive(state),
      table: lineFamilyReps.table.derive(state),
      triangle: lineFamilyReps.triangle.derive(state),
      context: lineFamilyReps.context.derive(state)
    }),
    createGraph: (start?: LineCanonical) =>
      createRepSyncGraph({ canonical: start ?? initial, reps: lineFamilyReps })
  };
}

/**
 * The two numbers a learner may type or step, described so a screen reader says what they MEAN.
 * The bounds come from the surface's declared policy; where a surface declares none, the graph
 * window supplies the reachable range, because an unbounded stepper is not a usable affordance.
 */
export function lineEditableSlots(c: LineCanonical): EditableSlot<LineTarget>[] {
  const bound = (value: Rat | null, fallback: number): number => (value ? ratToNumber(value) : fallback);
  const stepOf = (value: Rat | null): number => (value ? ratToNumber(value) : 1);
  return [
    {
      target: "slope",
      value: ratToNumber(c.m),
      min: bound(c.policy.slopeMin, c.window.yMin),
      max: bound(c.policy.slopeMax, c.window.yMax),
      step: stepOf(c.policy.slopeStep),
      editable: true,
      meaning: `the rate of change: how much ${c.context.yLabel} changes for each ${c.context.xUnitSingular}`
    },
    {
      target: "intercept",
      value: ratToNumber(c.b),
      min: bound(c.policy.interceptMin, c.window.yMin),
      max: bound(c.policy.interceptMax, c.window.yMax),
      step: stepOf(c.policy.interceptStep),
      editable: true,
      meaning: `the starting value: the ${c.context.yLabel} when ${c.context.xLabel} is 0`
    }
  ];
}

/** The MMIP binding list — the same five nodes, expressed in O1's interface. */
export function lineRepresentationBindings(): RepresentationBinding<LineCanonical, unknown>[] {
  return (Object.keys(lineFamilyReps) as (keyof LineFamilyReps)[]).map((id) => ({
    id,
    label: lineFamilyReps[id].label,
    derive: (state: LineCanonical) => lineFamilyReps[id].derive(state) as unknown,
    editable: () => Boolean((lineFamilyReps[id] as { absorb?: unknown }).absorb)
  }));
}

/* ================================================================== *
 * THE SLOPE TRIANGLE — and the vertical-line decision (S209 wave B)   *
 * ================================================================== */

/**
 * DECISION (retires open question 1 of `docs/RSG_DESIGN.md`).
 *
 * `slopeTriangle` must let a learner build run = 0 and SEE undefined slope; the model above
 * refuses it, because `y = mx + b` cannot express a vertical line. Two options were on the table:
 * let the widget hold run = 0 as ephemeral state outside the model, or give `LineCanonical` a
 * `VerticalLine` variant. Neither is right, and the reason is the same in both cases: they both
 * assume the slope triangle's canonical object is a LINE.
 *
 * It is not. It is a PAIR OF LEGS. `1:2` and `2:4` are different triangles on the same line, and
 * teaching that they are the same slope is the entire lesson — so `rise` is genuinely canonical
 * here, not derived from a slope the way `LineCanonical` derives it. Once the canonical object is
 * the triangle, the line becomes a DERIVATION of it, and it is a derivation that is partial by
 * nature: the legs are the graph of a function of x only when the run is non-zero.
 *
 * So the undefined-slope moment is neither hidden in the widget nor smuggled into `LineCanonical`.
 * It is a first-class derived state — `deriveTriangleSlope` returns `undefined`/`none` as named
 * results, and `deriveTriangleLine` returns a `vertical` branch that carries the x it stands on.
 * `LineCanonical` stays TOTAL: `deriveEquation`, `deriveTable`, `lineValueAt` and `deriveContext`
 * remain defined for every state that can exist, no consumer inherits a case it cannot render,
 * and the invariant "a canonical state is accepted only if every representation derives exactly"
 * survives intact. A `LineCanonical` is constructed from a triangle in exactly one place — the
 * `function` branch below — and only when it exists.
 *
 * The cost, stated honestly: two canonical types in one family. That is the correct number,
 * because they are two different mathematical objects — one is a function, one is a direction.
 */

export type TrianglePolicy = {
  /** The legs a learner may dial, symmetric about 0 — `slopeTriangle`'s authored `legMax`. */
  readonly legMax: Rat;
  readonly legStep: Rat | null;
  readonly outOfRange: "reject" | "clamp";
  readonly offLattice: "reject" | "snap";
};

export type TriangleCanonical = {
  /** A: the triangle's anchor. Authored, never edited. */
  readonly anchor: RatPoint;
  /** B: the point the built line is trying to pass through. Authored, never edited. */
  readonly through: RatPoint;
  /** BOTH legs are canonical — the pair is the object, not the ratio. */
  readonly run: Rat;
  readonly rise: Rat;
  readonly window: LineWindow;
  readonly policy: TrianglePolicy;
};

export type TriangleLegEdit =
  | { readonly kind: "setRunLeg"; readonly run: Rat }
  | { readonly kind: "setRiseLeg"; readonly rise: Rat }
  | { readonly kind: "setLegs"; readonly run: Rat; readonly rise: Rat };

export type TriangleCanonicalInit = Partial<Omit<TriangleCanonical, "window" | "policy">> & {
  readonly window?: Partial<LineWindow>;
  readonly policy?: Partial<TrianglePolicy>;
};

export const DEFAULT_TRIANGLE_POLICY: TrianglePolicy = Object.freeze({
  legMax: rat(8),
  legStep: ONE,
  outOfRange: "clamp",
  offLattice: "snap"
});

export function makeTriangleCanonical(overrides: TriangleCanonicalInit = {}): TriangleCanonical {
  const base: TriangleCanonical = {
    anchor: { x: ZERO, y: ZERO },
    through: { x: ONE, y: ONE },
    run: ONE,
    rise: ZERO,
    window: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
    policy: DEFAULT_TRIANGLE_POLICY
  };
  return Object.freeze({
    ...base,
    ...overrides,
    window: { ...base.window, ...(overrides.window ?? {}) },
    policy: { ...base.policy, ...(overrides.policy ?? {}) }
  });
}

/* ── derivations ──────────────────────────────────────────────────── */

export type TriangleLegsView = {
  readonly anchor: RatPoint;
  readonly corner: RatPoint;
  readonly tip: RatPoint;
  readonly run: Rat;
  readonly rise: Rat;
  readonly runText: string;
  readonly riseText: string;
  /** No legs at all — the state the widget draws as an empty grid. */
  readonly degenerate: boolean;
};

/** The slope the built legs claim, with the two boundary states NAMED rather than missing. */
export type TriangleSlopeView =
  | { readonly kind: "slope"; readonly m: Rat; readonly text: string; readonly ratioText: string }
  | { readonly kind: "undefined"; readonly text: string; readonly reason: string }
  | { readonly kind: "none"; readonly text: string; readonly reason: string };

/**
 * The line the legs draw. The `function` branch is the ONLY place in this module a
 * `LineCanonical` is built out of a triangle, and it is built only when one exists.
 */
export type TriangleLineView =
  | { readonly kind: "function"; readonly line: LineCanonical; readonly from: RatPoint; readonly to: RatPoint }
  | { readonly kind: "vertical"; readonly x: Rat; readonly from: RatPoint; readonly to: RatPoint }
  | { readonly kind: "absent"; readonly reason: string };

export type TriangleVerdictView = {
  readonly passes: boolean;
  /** The authored line's own legs, B − A. */
  readonly targetRun: Rat;
  readonly targetRise: Rat;
  readonly reason: string;
};

export function deriveTriangleLegs(c: TriangleCanonical): TriangleLegsView {
  const corner = { x: ratAdd(c.anchor.x, c.run), y: c.anchor.y };
  return {
    anchor: c.anchor,
    corner,
    tip: { x: corner.x, y: ratAdd(c.anchor.y, c.rise) },
    run: c.run,
    rise: c.rise,
    runText: ratText(c.run),
    riseText: ratText(c.rise),
    degenerate: ratIsZero(c.run) && ratIsZero(c.rise)
  };
}

export function deriveTriangleSlope(c: TriangleCanonical): TriangleSlopeView {
  if (ratIsZero(c.run)) {
    if (ratIsZero(c.rise)) {
      return {
        kind: "none",
        text: "no triangle",
        reason: "with no run and no rise there are no legs to compare, so there is no ratio to read"
      };
    }
    return {
      kind: "undefined",
      text: "undefined",
      reason: `a rise of ${ratText(c.rise)} over a run of 0 asks how much the line climbs per step across, and it never takes a step across — the slope is undefined, not infinite`
    };
  }
  const m = ratDiv(c.rise, c.run);
  return { kind: "slope", m, text: ratText(m), ratioText: `${ratText(c.rise)} ÷ ${ratText(c.run)}` };
}

export function deriveTriangleLine(c: TriangleCanonical): TriangleLineView {
  const slope = deriveTriangleSlope(c);
  if (slope.kind === "none") {
    return { kind: "absent", reason: "no legs are built, so no line is drawn through A yet" };
  }
  if (slope.kind === "undefined") {
    return {
      kind: "vertical",
      x: c.anchor.x,
      from: { x: c.anchor.x, y: rat(c.window.yMin) },
      to: { x: c.anchor.x, y: rat(c.window.yMax) }
    };
  }
  // b = y_A − m·x_A, so the line really does pass through the anchor by construction.
  const line = makeLineCanonical({
    m: slope.m,
    b: ratSub(c.anchor.y, ratMul(slope.m, c.anchor.x)),
    anchorX: c.anchor.x,
    run: c.run,
    window: c.window,
    domain: { start: c.anchor.x, step: ONE, count: 2 }
  });
  const view = deriveGraph(line);
  return { kind: "function", line, from: view.from, to: view.to };
}

/**
 * Does the built line pass through B?
 *
 * Deliberately transcribed from the mathematics rather than delegated to `schema.ts`'s
 * `slopeTriangleMatches`: the grader stays where it is, and a test pins the two against each
 * other over the whole leg lattice. Cross-multiplied, so signs and equivalent ratios both work
 * and no division is needed.
 */
export function deriveTriangleVerdict(c: TriangleCanonical): TriangleVerdictView {
  const targetRun = ratSub(c.through.x, c.anchor.x);
  const targetRise = ratSub(c.through.y, c.anchor.y);
  const named = (passes: boolean, reason: string): TriangleVerdictView => ({ passes, targetRun, targetRise, reason });
  if (ratIsZero(c.run) && ratIsZero(c.rise)) return named(false, "no triangle is built, so no line is drawn");
  if (ratIsZero(targetRun)) {
    return named(
      ratIsZero(c.run) && !ratIsZero(c.rise),
      "A and B share an input, so only a run of 0 with some rise draws the vertical line through both"
    );
  }
  if (ratIsZero(targetRise)) {
    return named(
      ratIsZero(c.rise) && !ratIsZero(c.run),
      "A and B share an output, so only a rise of 0 with some run draws the flat line through both"
    );
  }
  if (ratIsZero(c.run)) return named(false, "a vertical line through A cannot reach B, which sits at a different input");
  const left = ratMul(c.run, targetRise);
  const right = ratMul(c.rise, targetRun);
  return named(
    ratEq(left, right),
    `the line from A to B rises ${ratText(targetRise)} over a run of ${ratText(targetRun)}; this triangle rises ${ratText(c.rise)} over ${ratText(c.run)}`
  );
}

/* ── absorb ───────────────────────────────────────────────────────── */

function guardLeg(value: Rat, name: "run" | "rise", policy: TrianglePolicy): Guarded {
  const notes: AbsorbNote[] = [];
  let out = value;
  if (policy.legStep && !ratOnLattice(out, policy.legStep)) {
    if (policy.offLattice === "reject") {
      return {
        reject: {
          code: `${name}-off-lattice`,
          reason: `${ratText(out)} is not a multiple of ${ratText(policy.legStep)}, and this leg only takes steps of ${ratText(policy.legStep)}`
        }
      };
    }
    const snapped = ratSnap(out, policy.legStep);
    notes.push({ code: `${name}-snapped`, reason: `${ratText(out)} snapped to ${ratText(snapped)}` });
    out = snapped;
  }
  const min = ratNeg(policy.legMax);
  if (ratCmp(out, min) < 0 || ratCmp(out, policy.legMax) > 0) {
    if (policy.outOfRange === "reject") {
      return {
        reject: {
          code: `${name}-out-of-range`,
          reason: `${ratText(out)} is outside the legs this triangle can build, ${ratText(min)} to ${ratText(policy.legMax)}`
        }
      };
    }
    const clamped = ratCmp(out, min) < 0 ? min : policy.legMax;
    notes.push({ code: `${name}-clamped`, reason: `${ratText(out)} clamped to ${ratText(clamped)}, the longest leg this triangle can build` });
    out = clamped;
  }
  return { value: out, notes };
}

/**
 * NOTE THE ABSENCE: there is no `run-zero` rejection here. A run of 0 is a legal, reachable,
 * gradable state of a slope triangle — it is how a vertical line gets taught rather than merely
 * named — and refusing it would be the model overruling the lesson. `absorbLineEdit` above still
 * refuses it, because a `LineCanonical` genuinely cannot hold it. Two models, two domains.
 */
export function absorbTriangleLegEdit(c: TriangleCanonical, edit: TriangleLegEdit): AbsorbOutcome<TriangleCanonical> {
  try {
    const notes: AbsorbNote[] = [];
    let run = c.run;
    let rise = c.rise;
    if (edit.kind === "setRunLeg" || edit.kind === "setLegs") {
      const g = guardLeg(edit.run, "run", c.policy);
      if ("reject" in g) return { ok: false, code: g.reject.code, reason: g.reject.reason };
      run = g.value;
      notes.push(...g.notes);
    }
    if (edit.kind === "setRiseLeg" || edit.kind === "setLegs") {
      const g = guardLeg(edit.rise, "rise", c.policy);
      if ("reject" in g) return { ok: false, code: g.reject.code, reason: g.reject.reason };
      rise = g.value;
      notes.push(...g.notes);
    }
    const next: TriangleCanonical = { ...c, run, rise };
    // Same discipline as the line: a state is only accepted if every representation derives.
    deriveTriangleLegs(next);
    deriveTriangleSlope(next);
    deriveTriangleLine(next);
    deriveTriangleVerdict(next);
    const clamp = mergeNotes(notes);
    return clamp ? { ok: true, canonical: next, clamp } : { ok: true, canonical: next };
  } catch (error) {
    if (error instanceof RationalOverflowError) return { ok: false, code: "rational-overflow", reason: error.message };
    if (error instanceof RationalDomainError) return { ok: false, code: "rational-domain", reason: error.message };
    throw error;
  }
}

/* ── the graph ────────────────────────────────────────────────────── */

export const slopeTriangleReps = {
  model: { label: "canonical triangle", derive: (c: TriangleCanonical): TriangleCanonical => c },
  legs: {
    label: "slope triangle",
    derive: deriveTriangleLegs,
    absorb: (c: TriangleCanonical, edit: TriangleLegEdit) => absorbTriangleLegEdit(c, edit)
  },
  slope: { label: "slope readout", derive: deriveTriangleSlope },
  line: { label: "the line through A", derive: deriveTriangleLine },
  verdict: { label: "does it pass through B", derive: deriveTriangleVerdict }
} as const;

export type SlopeTriangleReps = typeof slopeTriangleReps;
export type SlopeTriangleGraph = RepSyncGraph<TriangleCanonical, SlopeTriangleReps>;

export type TriangleTarget = "run" | "rise";

/** Name what the legs did, in MMIP's vocabulary, for the motion layer. */
export function describeTriangleChange(
  before: TriangleCanonical,
  after: TriangleCanonical
): MmipOperation<TriangleTarget>[] {
  const ops: MmipOperation<TriangleTarget>[] = [];
  const leg = (target: TriangleTarget, from: Rat, to: Rat) => {
    if (ratEq(from, to)) return;
    if (!ratIsZero(from) && ratEq(to, ratNeg(from))) {
      ops.push({
        kind: "negate",
        target,
        amount: -1,
        sides: ["triangle"],
        describe: `Turn the ${target} the other way: ${ratText(from)} becomes ${ratText(to)}.`
      });
      return;
    }
    const delta = ratSub(to, from);
    ops.push({
      kind: delta.n > 0 ? "add" : "subtract",
      target,
      amount: ratToNumber(delta),
      sides: ["triangle"],
      describe: `Change the ${target} by ${ratText(delta)}: ${ratText(from)} becomes ${ratText(to)}.`
    });
  };
  leg("run", before.run, after.run);
  leg("rise", before.rise, after.rise);
  return ops;
}

export type SlopeTriangleViews = {
  readonly legs: TriangleLegsView;
  readonly slope: TriangleSlopeView;
  readonly line: TriangleLineView;
  readonly verdict: TriangleVerdictView;
};

export interface SlopeTriangleModel
  extends CanonicalModel<TriangleCanonical, TriangleLegEdit, TriangleTarget> {
  readonly representations: RepresentationBinding<TriangleCanonical, unknown>[];
  readonly views: (state: TriangleCanonical) => SlopeTriangleViews;
  readonly createGraph: (initial?: TriangleCanonical) => SlopeTriangleGraph;
}

/**
 * Assemble the slope-triangle model for one authored problem — the same factory shape O1 gave
 * `solveBalanceCanonicalModel`, so the renderer passes through the frozen contract rather than
 * merely satisfying it.
 */
export function slopeTriangleCanonicalModel(init: TriangleCanonicalInit = {}): SlopeTriangleModel {
  const initial = makeTriangleCanonical(init);
  const bindings = (Object.keys(slopeTriangleReps) as (keyof SlopeTriangleReps)[]).map((id) => ({
    id,
    label: slopeTriangleReps[id].label,
    derive: (state: TriangleCanonical) => slopeTriangleReps[id].derive(state) as unknown,
    editable: () => Boolean((slopeTriangleReps[id] as { absorb?: unknown }).absorb)
  }));
  return {
    id: "slopeTriangle",
    initial,
    representations: bindings,
    normalize: (raw: unknown): TriangleCanonical => {
      const src = (raw && typeof raw === "object" ? raw : {}) as { run?: unknown; rise?: unknown };
      const leg = (value: unknown, fallback: Rat): Rat => {
        if (typeof value === "number" && Number.isFinite(value)) {
          try {
            return Number.isInteger(value) ? rat(value) : ratFromNumber(value);
          } catch {
            return fallback;
          }
        }
        return fallback;
      };
      return makeTriangleCanonical({ ...initial, run: leg(src.run, initial.run), rise: leg(src.rise, initial.rise) });
    },
    apply: (state, edit, origin, source): SyncTransaction<TriangleCanonical, TriangleTarget> => {
      const outcome = absorbTriangleLegEdit(state, edit);
      if (!outcome.ok) {
        return rejectTransaction<TriangleCanonical, TriangleTarget>(state, origin, source, {
          code: outcome.code,
          message: outcome.reason
        });
      }
      const ops = describeTriangleChange(state, outcome.canonical);
      return { before: state, after: outcome.canonical, origin, source, ops, changed: ops.length > 0, rejected: false };
    },
    // Two triangles are the same CLAIM when they name the same slope — which is the lesson, so it
    // is also the equivalence: 1:2 and 2:4 are equivalent states drawn as different pictures.
    equivalent: (a, b) => {
      const sa = deriveTriangleSlope(a);
      const sb = deriveTriangleSlope(b);
      if (sa.kind !== sb.kind) return false;
      return sa.kind === "slope" && sb.kind === "slope" ? ratEq(sa.m, sb.m) : true;
    },
    views: (state) => ({
      legs: slopeTriangleReps.legs.derive(state),
      slope: slopeTriangleReps.slope.derive(state),
      line: slopeTriangleReps.line.derive(state),
      verdict: slopeTriangleReps.verdict.derive(state)
    }),
    createGraph: (start?: TriangleCanonical) =>
      createRepSyncGraph({ canonical: start ?? initial, reps: slopeTriangleReps })
  };
}
