/**
 * MMIP v1 — the canonical model for the `solveBalance` engine.
 *
 * ONE mathematical state; three representations derived from it:
 *
 *   · the PAN BALANCE   — tiles you tap, add and take away  (origin "physical")
 *   · the TERM CONTROLS — split, distribute, negate, flip    (origin "control")
 *   · the EQUATION STRIP— coefficient and constants you type (origin "symbolic")
 *
 * The state is exactly what the pans hold. Everything else on screen — the sentence, the beam
 * angle, the enabled controls, the slot bounds — is a pure function of it, computed here.
 *
 * ── WHAT A SYMBOLIC EDIT IS ALLOWED TO MEAN ──────────────────────────────────────────────────
 *
 * The danger of letting a learner type into an equation is that typing is stronger than the
 * manipulative: "3x + 4 = 19" could become "x = 5" in one keystroke and the tiles would have shown
 * nothing. So the rule this model enforces is:
 *
 *     EVERY symbolic edit decomposes into a finite sequence of tile moves the learner can see.
 *
 * `decompose()` returns that sequence, and `apply(symbolic edit)` is provably equal to folding
 * `apply` over it (pinned in solveBalanceModel.test.ts). The symbolic strip is therefore a FASTER
 * WAY TO DO TILE MOVES, never a way to do algebra the tiles cannot show. Three consequences:
 *
 *   1. The coefficient of x can only move TOWARD ZERO. There is no affordance anywhere in this
 *      engine for putting an x-tile onto a pan — you cannot conjure an unknown weight — so the
 *      strip cannot either. Growing the coefficient is refused by name. (Splitting and distributing
 *      still change it, because those are two-sided moves the pans perform.)
 *   2. A constant may move in either direction, because the pans have +1/−1 adders. Those adders
 *      are revealed whenever the strip is open, so the tile route is always visible, not notional.
 *      Editing ONE side's constant is a one-sided move — the beam tips, on purpose. That is this
 *      engine's whole pedagogy and the strip inherits it rather than hiding it.
 *   3. While a bracket is still standing the strip is INERT. `3(x + 2)` is a physical object with
 *      an unopened multiplier; there is no honest tile meaning for typing over its parts. Distribute
 *      first. (Conservative choice — see docs/MMIP_V1_API.md, "Open questions".)
 *
 * The relation symbol is not typeable. In an equation it is the problem statement; in an inequality
 * the only legal change is the flip, which the existing control already performs.
 *
 * PURE AND DETERMINISTIC. No Math.random, no Date.now, no ambient state. Same inputs ⇒ byte
 * identical outputs, forever.
 */

import {
  solveBalanceHolds,
  solveBalanceSet,
  solveBalanceSetsEqual,
  solveBalanceWitness,
  type SolveBalanceRel,
} from "@/lib/schema";
import {
  acceptTransaction,
  rejectTransaction,
  type CanonicalModel,
  type EditOrigin,
  type EditableSlot,
  type MmipOperation,
  type RepresentationBinding,
  type SyncTransaction,
} from "./mmipTypes";

/* ─────────────────────────── vocabulary shared with the renderer ─────────────────────────── */

export type SBRel = SolveBalanceRel;

export const SB_RELS: readonly SBRel[] = ["eq", "lt", "gt", "le", "ge"] as const;
export const SB_REL_SYM: Record<SBRel, string> = { eq: "=", lt: "<", gt: ">", le: "≤", ge: "≥" };
export const SB_REL_WORD: Record<SBRel, string> = {
  eq: "equals",
  lt: "is less than",
  gt: "is greater than",
  le: "is at most",
  ge: "is at least",
};
export const SB_REL_FLIP: Record<SBRel, SBRel> = { eq: "eq", lt: "gt", gt: "lt", le: "ge", ge: "le" };
export const SB_MINUS = "−";

/** Which tile population an equation term names — the key that links the symbolic readout to the
 * physical pans (the S206 Spotlight), and now also names the editable slots. */
export type SBTermKey = "g" | "lx" | "lu" | "ru";

/** One side of the sentence as identified terms, signs carried by the text so colour is never the
 * only signal. Joining the texts with " " reproduces the classic sentence byte-for-byte (pinned by
 * widgets.solveBalance.s114.test.tsx), while the keys let the readout and the tiles point at each
 * other: the term IS the tiles, written down. */
export function sbTermTokens(
  xCount: number,
  units: number,
  groupText: string | null,
  keys: { g?: SBTermKey; x?: SBTermKey; u?: SBTermKey }
): Array<{ key: SBTermKey | null; text: string }> {
  const parts: Array<{ key: SBTermKey | null; text: string }> = [];
  const add = (key: SBTermKey | null, neg: boolean, mag: string) =>
    parts.push({ key, text: parts.length === 0 ? (neg ? `${SB_MINUS}${mag}` : mag) : `${neg ? SB_MINUS : "+"} ${mag}` });
  if (groupText) parts.push({ key: keys.g ?? null, text: groupText });
  if (xCount !== 0) add(keys.x ?? null, xCount < 0, Math.abs(xCount) === 1 ? "x" : `${Math.abs(xCount)}x`);
  if (units !== 0) add(keys.u ?? null, units < 0, `${Math.abs(units)}`);
  return parts.length ? parts : [{ key: null, text: "0" }];
}

/* ─────────────────────────────── the canonical state ─────────────────────────────── */

/** The pans, and nothing else. Field-for-field the value the widget has always persisted (minus the
 * undo history, which is a session convenience rather than mathematics). */
export interface SolveBalanceState {
  /** Signed count of x-tiles on the left pan. */
  readonly leftX: number;
  /** Signed count of unit tiles on the left pan. */
  readonly leftUnits: number;
  /** Signed count of unit tiles on the right pan. */
  readonly rightUnits: number;
  /** Unopened bracket copies still on the left pan (a magnitude; the sign lives in the frame). */
  readonly groups: number;
  /** 1 once a multiplier was given to the x alone — a named, reachable misconception. */
  readonly partial: number;
  /** The relation the sentence currently claims. */
  readonly rel: SBRel;
}

/** The problem, fixed for the life of the interaction. Not state: nothing a learner does changes it. */
export interface SolveBalanceFrame {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly rel0: SBRel;
  readonly groups: { readonly count: number; readonly x: number; readonly unit: number } | null;
  /** The x both pans are weighed at — the solution for an equation, a witness from the solution set
   * for an inequality. Never shown to the learner. */
  readonly witness: number;
  /** Sign of the bracket multiplier; +1 when there are no brackets. */
  readonly gSign: 1 | -1;
  /** How many unit tiles one pan may hold. Rendering limit, not mathematics — a pan of 60 chips
   * cannot be read at 360px. Never below the pan the problem starts with. */
  readonly unitBound: number;
  /** How many x-tiles the left pan may hold. Only ever decreases in play; kept for slot bounds. */
  readonly xBound: number;
}

/** The slots of the state an operation can name. `equation` means "the whole sentence at once". */
export type SolveBalanceTarget = "leftX" | "leftUnits" | "rightUnits" | "groups" | "relation" | "equation";

export type SolveBalanceOperation = MmipOperation<SolveBalanceTarget>;
export type SolveBalanceTransaction = SyncTransaction<SolveBalanceState, SolveBalanceTarget>;

/* ────────────────────────────────────── edits ────────────────────────────────────── */

/**
 * Every legal mutation, from every origin. The first three are PRIMITIVE: one tile, one pan, one
 * tap. Everything else either is a named two-sided move or decomposes into primitives.
 */
export type SolveBalanceEdit =
  /* physical — a tile is tapped and leaves its pan */
  | { readonly kind: "tapLeftUnit" }
  | { readonly kind: "tapRightUnit" }
  | { readonly kind: "tapLeftX" }
  /* physical — the ±1 adders put a unit tile onto a pan (or cancel one already there) */
  | { readonly kind: "stepLeftUnits"; readonly delta: number }
  | { readonly kind: "stepRightUnits"; readonly delta: number }
  /* control — named two-sided moves */
  | { readonly kind: "split" }
  | { readonly kind: "negate" }
  | { readonly kind: "flipRelation" }
  | { readonly kind: "distributeAll" }
  | { readonly kind: "distributeXOnly" }
  | { readonly kind: "reset" }
  /* control — step back to a position the learner has already stood in (undo).
   *
   * S208 review, condition 5. Undo used to rebuild the state inside the widget, which made
   * "apply is the only mutation path" false in the one place a learner leans on hardest. The
   * position to return to is supplied by the caller because HISTORY IS NOT MATHEMATICS — the
   * model stays historyless and the session owns the stack — but the transition itself is now an
   * ordinary transaction: normalised, described, and compiled to motion like any other. */
  | { readonly kind: "restore"; readonly to: SolveBalanceState }
  /* symbolic — type or step a number in the equation strip */
  | { readonly kind: "setLeftCoefficient"; readonly value: number }
  | { readonly kind: "setLeftConstant"; readonly value: number }
  | { readonly kind: "setRightConstant"; readonly value: number };

/** The representation ids. Also the `source` of a transaction. */
export const SB_REPRESENTATIONS = {
  tiles: "solveBalance.tiles",
  controls: "solveBalance.controls",
  symbol: "solveBalance.symbol",
} as const;

/* ─────────────────────────────── frame + normalisation ─────────────────────────────── */

/** The spec fields this model reads. Kept structural so a test can build one without a full widget. */
export interface SolveBalanceSpecLike {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly relation?: SBRel;
  readonly groups?: { readonly count: number; readonly x: number; readonly unit: number };
}

export function solveBalanceFrame(spec: SolveBalanceSpecLike): SolveBalanceFrame {
  const rel0: SBRel = spec.relation ?? "eq";
  const g = spec.groups ?? null;
  return {
    a: spec.a,
    b: spec.b,
    c: spec.c,
    rel0,
    groups: g,
    witness: solveBalanceWitness(spec.a, spec.b, spec.c, rel0),
    gSign: g && g.count < 0 ? -1 : 1,
    // 30 is the integrity gate's readable-pan limit; a spec that legitimately starts larger keeps
    // its own size as the bound, so a legal problem can never begin out of bounds.
    unitBound: Math.max(30, Math.abs(spec.b), Math.abs(spec.c)),
    xBound: Math.max(12, Math.abs(spec.a)),
  };
}

export function solveBalanceInitial(frame: SolveBalanceFrame): SolveBalanceState {
  const g = frame.groups;
  return {
    leftX: g ? 0 : frame.a,
    leftUnits: g ? 0 : frame.b,
    rightUnits: frame.c,
    groups: g ? Math.abs(g.count) : 0,
    partial: 0,
    rel: frame.rel0,
  };
}

/** Coerce anything into a whole state. A value restored from storage (or supplied by a test) may
 * carry only the three pan counts; the rest fall back to the problem's own start. Never throws. */
export function solveBalanceNormalize(frame: SolveBalanceFrame, raw: unknown): SolveBalanceState {
  const start = solveBalanceInitial(frame);
  const r = (raw ?? {}) as Partial<SolveBalanceState>;
  const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
  return {
    leftX: num(r.leftX, start.leftX),
    leftUnits: num(r.leftUnits, start.leftUnits),
    rightUnits: num(r.rightUnits, start.rightUnits),
    groups: num(r.groups, start.groups),
    partial: num(r.partial, 0),
    rel: r.rel && SB_RELS.includes(r.rel) ? r.rel : start.rel,
  };
}

/* ─────────────────────────────────── the mathematics ─────────────────────────────────── */

export interface SolveBalanceWeights {
  /** What the left pan weighs at the witness. */
  readonly left: number;
  /** What the right pan weighs. */
  readonly right: number;
  /** Does the beam agree with the sentence's comparator? */
  readonly holds: boolean;
  /** One x-tile alone on the left, pans agreeing — the finished position. */
  readonly done: boolean;
  /** Beam rotation in degrees, clamped to ±7. */
  readonly tilt: number;
  readonly heavier: "left" | "right" | "level";
}

/** THE BEAM IS WEIGHED AT THE TRUE X. Every derived view goes through this one function, so what
 * the learner watches and what any other surface concludes cannot come apart. */
export function solveBalanceWeights(frame: SolveBalanceFrame, st: SolveBalanceState): SolveBalanceWeights {
  const g = frame.groups;
  const groupWeight = g ? st.groups * frame.gSign * (g.x * frame.witness + g.unit) : 0;
  const left = st.leftX * frame.witness + st.leftUnits + groupWeight;
  const right = st.rightUnits;
  const holds = solveBalanceHolds(left, right, st.rel);
  return {
    left,
    right,
    holds,
    done: holds && st.leftX === 1 && st.leftUnits === 0 && st.groups === 0,
    tilt: left === right ? 0 : Math.max(-7, Math.min(7, ((right - left) / Math.max(Math.abs(frame.c), 1)) * 14)),
    heavier: left > right ? "left" : left < right ? "right" : "level",
  };
}

/** The claim the pans currently make, as a coefficient / constant / right-hand side. Brackets are
 * counted at their distributed value, because that is what they weigh. */
export function solveBalanceClaim(
  frame: SolveBalanceFrame,
  st: SolveBalanceState
): { coefX: number; units: number; rhs: number; rel: SBRel } {
  const g = frame.groups;
  return {
    coefX: st.leftX + (g ? st.groups * frame.gSign * g.x : 0),
    units: st.leftUnits + (g ? st.groups * frame.gSign * g.unit : 0),
    rhs: st.rightUnits,
    rel: st.rel,
  };
}

/** Do two positions make the same claim about x? Set equality, not structural equality: `2x = 10`
 * and `x = 5` are the same claim written twice. */
export function solveBalanceEquivalent(
  frame: SolveBalanceFrame,
  p: SolveBalanceState,
  q: SolveBalanceState
): boolean {
  const cp = solveBalanceClaim(frame, p);
  const cq = solveBalanceClaim(frame, q);
  return solveBalanceSetsEqual(
    solveBalanceSet(cp.coefX, cp.units, cp.rhs, cp.rel),
    solveBalanceSet(cq.coefX, cq.units, cq.rhs, cq.rel)
  );
}

/* ────────────────────────────────── derived views ────────────────────────────────── */

export interface SolveBalancePanView {
  readonly groups: number;
  readonly xTiles: number;
  readonly xNegative: boolean;
  readonly unitTiles: number;
  readonly unitNegative: boolean;
  readonly empty: boolean;
}

export interface SolveBalanceTileView {
  readonly left: SolveBalancePanView;
  readonly right: SolveBalancePanView;
  readonly groupGlyph: string | null;
  readonly weights: SolveBalanceWeights;
}

export function deriveTiles(frame: SolveBalanceFrame, st: SolveBalanceState): SolveBalanceTileView {
  const pan = (xs: number, us: number, groups: number): SolveBalancePanView => ({
    groups,
    xTiles: Math.abs(xs),
    xNegative: xs < 0,
    unitTiles: Math.abs(us),
    unitNegative: us < 0,
    empty: xs === 0 && us === 0 && groups === 0,
  });
  return {
    left: pan(st.leftX, st.leftUnits, st.groups),
    right: pan(0, st.rightUnits, 0),
    groupGlyph: solveBalanceGroupGlyph(frame, st),
    weights: solveBalanceWeights(frame, st),
  };
}

/** `−3(x + 2)` — the bracket as it is written on a chip and in the sentence. */
export function solveBalanceGroupGlyph(frame: SolveBalanceFrame, st: SolveBalanceState): string | null {
  const g = frame.groups;
  if (!g || st.groups <= 0) return null;
  const inner = `${g.x === 1 ? "x" : `${g.x}x`} ${g.unit < 0 ? SB_MINUS : "+"} ${Math.abs(g.unit)}`;
  return `${frame.gSign < 0 ? SB_MINUS : ""}${st.groups}(${inner})`;
}

/** The bracket's inner text alone — `x + 2` — for the chip glyph the pans draw. */
export function solveBalanceGroupInner(frame: SolveBalanceFrame): string {
  const g = frame.groups;
  return g ? `${g.x === 1 ? "x" : `${g.x}x`} ${g.unit < 0 ? SB_MINUS : "+"} ${Math.abs(g.unit)}` : "";
}

export interface SolveBalanceSymbolView {
  readonly leftTokens: ReadonlyArray<{ key: SBTermKey | null; text: string }>;
  readonly rightTokens: ReadonlyArray<{ key: SBTermKey | null; text: string }>;
  readonly relationSymbol: string;
  readonly relationWord: string;
  /** The sentence as plain text, exactly as the readout renders it. */
  readonly sentence: string;
  readonly editable: boolean;
  readonly lockedReason?: string;
  readonly slots: {
    readonly leftCoefficient: EditableSlot<SolveBalanceTarget>;
    readonly leftConstant: EditableSlot<SolveBalanceTarget>;
    readonly rightConstant: EditableSlot<SolveBalanceTarget>;
  };
}

const BRACKETS_STANDING =
  "The left pan still holds unopened brackets. Give the multiplier out first — while a bracket is closed there is no tile for a typed number to move.";

export function deriveSymbol(frame: SolveBalanceFrame, st: SolveBalanceState): SolveBalanceSymbolView {
  const bracketed = st.groups > 0;
  const leftTokens = sbTermTokens(st.leftX, st.leftUnits, solveBalanceGroupGlyph(frame, st), {
    g: "g",
    x: "lx",
    u: "lu",
  });
  const rightTokens = sbTermTokens(0, st.rightUnits, null, { u: "ru" });
  const sentence = `${leftTokens.map((t) => t.text).join(" ")} ${SB_REL_SYM[st.rel]} ${rightTokens
    .map((t) => t.text)
    .join(" ")}`;

  // The coefficient may only travel toward zero: x-tiles can leave a pan, never arrive on one.
  const coefLo = Math.min(0, st.leftX);
  const coefHi = Math.max(0, st.leftX);
  const coefLocked = bracketed || st.leftX === 0;
  const slot = (
    target: SolveBalanceTarget,
    value: number,
    min: number,
    max: number,
    editable: boolean,
    meaning: string,
    lockedReason?: string
  ): EditableSlot<SolveBalanceTarget> => ({
    target,
    value,
    min,
    max,
    step: 1,
    editable,
    ...(editable ? {} : { lockedReason }),
    meaning,
  });

  return {
    leftTokens,
    rightTokens,
    relationSymbol: SB_REL_SYM[st.rel],
    relationWord: SB_REL_WORD[st.rel],
    sentence,
    editable: !bracketed,
    ...(bracketed ? { lockedReason: BRACKETS_STANDING } : {}),
    slots: {
      leftCoefficient: slot(
        "leftX",
        st.leftX,
        coefLo,
        coefHi,
        !coefLocked,
        `how many x-tiles stand on the left pan, currently ${st.leftX}`,
        bracketed
          ? BRACKETS_STANDING
          : "There are no x-tiles left on the pan to take away, and an x-tile cannot be conjured onto one."
      ),
      leftConstant: slot(
        "leftUnits",
        st.leftUnits,
        -frame.unitBound,
        frame.unitBound,
        !bracketed,
        `how many unit tiles stand on the left pan, currently ${st.leftUnits}`,
        BRACKETS_STANDING
      ),
      rightConstant: slot(
        "rightUnits",
        st.rightUnits,
        -frame.unitBound,
        frame.unitBound,
        !bracketed,
        `how many unit tiles stand on the right pan, currently ${st.rightUnits}`,
        BRACKETS_STANDING
      ),
    },
  };
}

export interface SolveBalanceControlView {
  readonly canSplit: boolean;
  readonly splitDivisor: number;
  readonly canNegate: boolean;
  readonly canFlip: boolean;
  readonly canDistribute: boolean;
  /** The ±1 adders are part of the classic control set only where a pan can actually hold a
   * negative tile. The equation strip reveals them wherever it is open, because a constant typed
   * upward must have a visible tile route. */
  readonly signedAddersInClassicSet: boolean;
}

export function deriveControls(frame: SolveBalanceFrame, st: SolveBalanceState): SolveBalanceControlView {
  const k = Math.abs(st.leftX);
  return {
    canSplit: st.groups === 0 && k > 1 && st.leftUnits === 0 && st.rightUnits % k === 0,
    splitDivisor: k,
    canNegate: st.groups === 0 && (st.leftX < 0 || st.leftUnits < 0 || st.rightUnits < 0),
    canFlip: frame.rel0 !== "eq",
    canDistribute: !!frame.groups && st.groups > 0,
    signedAddersInClassicSet: frame.a < 0 || frame.b < 0 || frame.c < 0,
  };
}

/* ────────────────────────────────── the edit path ────────────────────────────────── */

const PAN_WORD: Record<"left" | "right", string> = { left: "left", right: "right" };

const tileWord = (n: number, negative: boolean, kind: "unit" | "x") =>
  `${Math.abs(n)} ${negative ? "negative " : ""}${kind === "x" ? "x-tile" : "unit tile"}${Math.abs(n) === 1 ? "" : "s"}`;

/** A signed count as mathematics writes it — a real minus sign, never a hyphen. Spoken aloud by
 * every operation description, so the glyph matters. */
const fmt = (n: number) => (n < 0 ? `${SB_MINUS}${Math.abs(n)}` : `${n}`);

const noNegZero = (n: number) => (n === 0 ? 0 : n);

function op(
  kind: SolveBalanceOperation["kind"],
  target: SolveBalanceTarget,
  amount: number,
  sides: readonly [string, ...string[]],
  describe: string
): SolveBalanceOperation {
  return { kind, target, amount, sides, describe };
}

function accept(
  before: SolveBalanceState,
  after: SolveBalanceState,
  origin: EditOrigin,
  source: string,
  ops: readonly SolveBalanceOperation[]
): SolveBalanceTransaction {
  const changed =
    before.leftX !== after.leftX ||
    before.leftUnits !== after.leftUnits ||
    before.rightUnits !== after.rightUnits ||
    before.groups !== after.groups ||
    before.partial !== after.partial ||
    before.rel !== after.rel;
  // A transaction that moved nothing has nothing to describe. `reset` on an untouched position is
  // the reachable case: accepted, legal, and not an event — so it carries no ops and a morph layer
  // given it animates nothing. (mmipHarness `transactionCheck` pins exactly this; the same shape
  // was found and fixed in algebraTilesModel in S212.)
  // The rule itself now lives in `acceptTransaction` (mmipTypes.ts, hoisted S213) — this engine
  // only computes what "changed" means for ITS OWN state, which is all that may vary per engine.
  return acceptTransaction(before, after, origin, source, changed, ops);
}

/** The unit-tile step as the pans perform it: one tile at a time. `tap` when the tile leaves the
 * pan (magnitude falls), `step` when the adder puts one on. */
function unitOps(
  target: "leftUnits" | "rightUnits",
  from: number,
  to: number,
  viaAdder: boolean
): SolveBalanceOperation[] {
  const side = target === "leftUnits" ? "left" : "right";
  const out: SolveBalanceOperation[] = [];
  const leg = (a: number, b: number) => {
    const d = b - a;
    if (d === 0) return;
    const shrinking = Math.abs(b) < Math.abs(a);
    const kind = shrinking ? (viaAdder ? "cancel" : "subtract") : "add";
    const negTiles = shrinking ? a < 0 : b < 0;
    const describe = shrinking
      ? viaAdder
        ? `Added ${tileWord(d, d < 0, "unit")} to the ${PAN_WORD[side]} pan only, forming ${Math.abs(d)} zero pair${
            Math.abs(d) === 1 ? "" : "s"
          } — the ${PAN_WORD[side]} pan now holds ${fmt(b)}.`
        : `Took ${tileWord(d, negTiles, "unit")} off the ${PAN_WORD[side]} pan only — it now holds ${fmt(b)}.`
      : `Added ${tileWord(d, negTiles, "unit")} to the ${PAN_WORD[side]} pan only — it now holds ${fmt(b)}.`;
    out.push(op(kind, target, d, [side], describe));
  };
  // A move that crosses zero is two mathematical steps: the tiles that were there leave, then the
  // opposite tiles arrive. A morph layer needs to see both.
  if (from !== 0 && to !== 0 && Math.sign(from) !== Math.sign(to)) {
    leg(from, 0);
    leg(0, to);
  } else {
    leg(from, to);
  }
  return out;
}

/**
 * THE ONLY MUTATION PATH. Every affordance in the widget — every tile, every button, every typed
 * field — arrives here. A refused edit returns `before` unchanged with a mathematical reason.
 */
export function solveBalanceApply(
  frame: SolveBalanceFrame,
  st: SolveBalanceState,
  edit: SolveBalanceEdit,
  origin: EditOrigin,
  source: string
): SolveBalanceTransaction {
  const reject = (code: string, message: string) =>
    rejectTransaction<SolveBalanceState, SolveBalanceTarget>(st, origin, source, { code, message });
  const g = frame.groups;

  switch (edit.kind) {
    /* ── physical: a tile leaves its pan ─────────────────────────────────────────── */
    case "tapLeftUnit":
    case "tapRightUnit": {
      const target = edit.kind === "tapLeftUnit" ? "leftUnits" : "rightUnits";
      const from = target === "leftUnits" ? st.leftUnits : st.rightUnits;
      if (from === 0)
        return reject("empty-pan", `There are no unit tiles on the ${target === "leftUnits" ? "left" : "right"} pan to take off.`);
      const to = from - Math.sign(from);
      return accept(st, { ...st, [target]: to } as SolveBalanceState, origin, source, unitOps(target, from, to, false));
    }
    case "tapLeftX": {
      if (st.leftX === 0) return reject("no-x-tiles", "There are no x-tiles on the left pan to take off.");
      const to = st.leftX - Math.sign(st.leftX);
      return accept(
        st,
        { ...st, leftX: to },
        origin,
        source,
        [
          op(
            "subtract",
            "leftX",
            to - st.leftX,
            ["left"],
            `Took ${tileWord(1, st.leftX < 0, "x")} off the left pan only — it now holds ${fmt(to)}.`
          ),
        ]
      );
    }

    /* ── physical: the ±1 adders ─────────────────────────────────────────────────── */
    case "stepLeftUnits":
    case "stepRightUnits": {
      const target = edit.kind === "stepLeftUnits" ? "leftUnits" : "rightUnits";
      const from = target === "leftUnits" ? st.leftUnits : st.rightUnits;
      if (!Number.isInteger(edit.delta)) return reject("non-integer", "A pan holds whole tiles only.");
      if (edit.delta === 0) return accept(st, st, origin, source, []);
      const to = from + edit.delta;
      if (Math.abs(to) > frame.unitBound)
        return reject(
          "pan-too-full",
          `A pan can show at most ${frame.unitBound} unit tiles — beyond that the tiles could not be counted by eye.`
        );
      return accept(st, { ...st, [target]: to } as SolveBalanceState, origin, source, unitOps(target, from, to, true));
    }

    /* ── control: named two-sided moves ──────────────────────────────────────────── */
    case "split": {
      const k = Math.abs(st.leftX);
      const ctl = deriveControls(frame, st);
      if (!ctl.canSplit)
        return reject(
          "split-not-exact",
          st.groups > 0
            ? BRACKETS_STANDING
            : k <= 1
              ? "There is only one x-tile group to share out — splitting would change nothing."
              : st.leftUnits !== 0
                ? "Clear the loose unit tiles off the left pan first: the pans can only be shared into equal groups when the left pan is all x-tiles."
                : `${st.rightUnits} does not share into ${k} equal whole groups, so splitting could not be exact.`
        );
      return accept(
        st,
        { ...st, leftX: st.leftX / k, rightUnits: st.rightUnits / k },
        origin,
        source,
        [
          op(
            "divide",
            "equation",
            k,
            ["left", "right"],
            `Shared both pans into ${k} equal groups and kept one group of each: ${fmt(st.leftX / k)} x-tiles against ${fmt(
              st.rightUnits / k
            )}.`
          ),
        ]
      );
    }
    case "negate": {
      if (!deriveControls(frame, st).canNegate)
        return reject(
          "nothing-to-negate",
          st.groups > 0 ? BRACKETS_STANDING : "Every tile on both pans is already positive — multiplying by −1 would only turn them all negative."
        );
      return accept(
        st,
        // `-0` is the same number as `0` and a different value to a deep-equality check, so the
        // sign is dropped here rather than left to leak into a persisted state.
        { ...st, leftX: noNegZero(-st.leftX), leftUnits: noNegZero(-st.leftUnits), rightUnits: noNegZero(-st.rightUnits) },
        origin,
        source,
        [
          op(
            "negate",
            "equation",
            -1,
            ["left", "right"],
            `Multiplied both pans by −1: every tile turned into its opposite, so the beam turned round too.`
          ),
        ]
      );
    }
    case "flipRelation": {
      if (frame.rel0 === "eq")
        return reject("equation-has-no-flip", "An equals sign has no direction to turn round.");
      const to = SB_REL_FLIP[st.rel];
      return accept(st, { ...st, rel: to }, origin, source, [
        op(
          "reorient",
          "relation",
          0,
          ["left", "right"],
          `Turned the comparator round: the sentence now claims the left side ${SB_REL_WORD[to]} the right.`
        ),
      ]);
    }
    case "distributeAll":
    case "distributeXOnly": {
      if (!g || st.groups <= 0) return reject("no-brackets", "There are no brackets left to open.");
      const xArrivals = st.groups * frame.gSign * g.x;
      const unitArrivals = edit.kind === "distributeAll" ? st.groups * frame.gSign * g.unit : frame.gSign * g.unit;
      const after: SolveBalanceState = {
        ...st,
        leftX: st.leftX + xArrivals,
        leftUnits: st.leftUnits + unitArrivals,
        groups: 0,
        partial: edit.kind === "distributeAll" ? 0 : 1,
      };
      return accept(st, after, origin, source, [
        op(
          "distribute",
          "leftX",
          xArrivals,
          ["left"],
          `Gave the ×${g.count} to the x inside every bracket: ${tileWord(xArrivals, xArrivals < 0, "x")} joined the left pan.`
        ),
        op(
          "distribute",
          "leftUnits",
          unitArrivals,
          ["left"],
          edit.kind === "distributeAll"
            ? `Gave the ×${g.count} to the constant as well: ${tileWord(unitArrivals, unitArrivals < 0, "unit")} joined the left pan.`
            : `The multiplier stopped at the x, so only one copy of the constant survived: ${tileWord(
                unitArrivals,
                unitArrivals < 0,
                "unit"
              )} on the left pan.`
        ),
      ]);
    }
    case "reset": {
      const start = solveBalanceInitial(frame);
      return accept(st, start, origin, source, [
        op("restore", "equation", 0, ["left", "right"], "Put every tile back where the problem started."),
      ]);
    }
    case "restore": {
      // Normalised on the way in: a snapshot restored from storage may be a partial or an older
      // shape, and undo must never be the door through which a malformed state enters.
      const to = solveBalanceNormalize(frame, edit.to);
      return accept(st, to, origin, source, [
        op(
          "restore",
          "equation",
          0,
          ["left", "right"],
          `Stepped back to the position before that move: ${deriveSymbol(frame, to).sentence}.`
        ),
      ]);
    }

    /* ── symbolic: a number typed or stepped in the equation strip ───────────────── */
    case "setLeftCoefficient": {
      if (st.groups > 0) return reject("brackets-standing", BRACKETS_STANDING);
      if (!Number.isInteger(edit.value)) return reject("non-integer", "A pan holds whole x-tiles only.");
      if (edit.value === st.leftX) return accept(st, st, origin, source, []);
      const growing = Math.abs(edit.value) > Math.abs(st.leftX);
      const flipping = edit.value !== 0 && st.leftX !== 0 && Math.sign(edit.value) !== Math.sign(st.leftX);
      if (growing || flipping)
        return reject(
          "no-x-conjuring",
          "x-tiles can only be taken off a pan, never put on one — you would have to know what x weighs to add one. Take x-tiles away, or split both pans into equal groups.",
        );
      const d = edit.value - st.leftX;
      return accept(st, { ...st, leftX: edit.value }, origin, source, [
        op(
          "subtract",
          "leftX",
          d,
          ["left"],
          `Took ${tileWord(d, st.leftX < 0, "x")} off the left pan only — it now holds ${fmt(edit.value)}.`
        ),
      ]);
    }
    case "setLeftConstant":
    case "setRightConstant": {
      if (st.groups > 0) return reject("brackets-standing", BRACKETS_STANDING);
      const target = edit.kind === "setLeftConstant" ? "leftUnits" : "rightUnits";
      const from = target === "leftUnits" ? st.leftUnits : st.rightUnits;
      if (!Number.isInteger(edit.value)) return reject("non-integer", "A pan holds whole tiles only.");
      if (edit.value === from) return accept(st, st, origin, source, []);
      if (Math.abs(edit.value) > frame.unitBound)
        return reject(
          "pan-too-full",
          `A pan can show at most ${frame.unitBound} unit tiles — beyond that the tiles could not be counted by eye.`
        );
      return accept(
        st,
        { ...st, [target]: edit.value } as SolveBalanceState,
        origin,
        source,
        unitOps(target, from, edit.value, false)
      );
    }
  }
}

/**
 * The tile moves a symbolic edit stands for, one visible affordance at a time.
 *
 * This is the proof obligation of the whole design: `apply(symbolic edit)` equals folding `apply`
 * over `decompose(symbolic edit)`. A learner who types "4 → 1" into the left constant has done
 * exactly what three taps on three unit tiles would have done, and nothing else. Edits that are
 * already primitive, and the named two-sided moves, decompose to themselves.
 */
export function solveBalanceDecompose(
  frame: SolveBalanceFrame,
  st: SolveBalanceState,
  edit: SolveBalanceEdit
): readonly SolveBalanceEdit[] {
  const walk = (
    from: number,
    to: number,
    tap: SolveBalanceEdit,
    step: (d: number) => SolveBalanceEdit
  ): SolveBalanceEdit[] => {
    const out: SolveBalanceEdit[] = [];
    let cur = from;
    while (cur !== to) {
      const d = to > cur ? 1 : -1;
      // Toward zero the tile LEAVES the pan (a tap); away from zero the adder puts one on.
      out.push(Math.abs(cur + d) < Math.abs(cur) ? tap : step(d));
      cur += d;
    }
    return out;
  };
  switch (edit.kind) {
    case "setLeftCoefficient": {
      if (st.groups > 0 || !Number.isInteger(edit.value)) return [edit];
      const growing = Math.abs(edit.value) > Math.abs(st.leftX);
      const flipping = edit.value !== 0 && st.leftX !== 0 && Math.sign(edit.value) !== Math.sign(st.leftX);
      if (growing || flipping) return [edit]; // refused edits decompose to themselves (and are refused)
      return walk(st.leftX, edit.value, { kind: "tapLeftX" }, () => ({ kind: "tapLeftX" }));
    }
    case "setLeftConstant":
      if (st.groups > 0 || !Number.isInteger(edit.value) || Math.abs(edit.value) > frame.unitBound) return [edit];
      return walk(st.leftUnits, edit.value, { kind: "tapLeftUnit" }, (d) => ({ kind: "stepLeftUnits", delta: d }));
    case "setRightConstant":
      if (st.groups > 0 || !Number.isInteger(edit.value) || Math.abs(edit.value) > frame.unitBound) return [edit];
      return walk(st.rightUnits, edit.value, { kind: "tapRightUnit" }, (d) => ({ kind: "stepRightUnits", delta: d }));
    default:
      return [edit];
  }
}

/* ─────────────────────────── the model as an MMIP participant ─────────────────────────── */

export function solveBalanceRepresentations(
  frame: SolveBalanceFrame
): readonly [
  RepresentationBinding<SolveBalanceState, SolveBalanceTileView>,
  RepresentationBinding<SolveBalanceState, SolveBalanceControlView>,
  RepresentationBinding<SolveBalanceState, SolveBalanceSymbolView>,
] {
  return [
    {
      id: SB_REPRESENTATIONS.tiles,
      label: "the pan balance",
      derive: (s) => deriveTiles(frame, s),
      editable: () => true,
    },
    {
      id: SB_REPRESENTATIONS.controls,
      label: "the move controls",
      derive: (s) => deriveControls(frame, s),
      editable: () => true,
    },
    {
      id: SB_REPRESENTATIONS.symbol,
      label: "the equation strip",
      derive: (s) => deriveSymbol(frame, s),
      editable: (s) => s.groups === 0,
    },
  ];
}

/** Every representation, derived together. One call, so two views can never be computed from two
 * different states — which is the whole claim MMIP makes. */
export interface SolveBalanceViews {
  readonly tiles: SolveBalanceTileView;
  readonly controls: SolveBalanceControlView;
  readonly symbol: SolveBalanceSymbolView;
}

/**
 * The assembled model: `CanonicalModel` exactly as `mmipTypes.ts` freezes it, plus the three things
 * a renderer needs that the generic contract cannot type — the problem's frame, the representation
 * bindings, and a single call that derives all of them at once.
 */
export interface SolveBalanceModel
  extends CanonicalModel<SolveBalanceState, SolveBalanceEdit, SolveBalanceTarget> {
  readonly frame: SolveBalanceFrame;
  readonly representations: ReturnType<typeof solveBalanceRepresentations>;
  readonly views: (state: SolveBalanceState) => SolveBalanceViews;
}

/**
 * Assemble the canonical model for one problem.
 *
 * A FACTORY, not a module-level constant: `CanonicalModel.initial` is a value, and solveBalance's
 * starting position is a function of the spec (`a`, `b`, `c`, the bracket), so one instance per
 * problem is the only honest reading of the frozen shape.
 *
 * This is the object `SolveBalanceW` runs through (S209-A1). Before that the widget imported the
 * loose pure functions and the interface was a specification the code satisfied rather than a seam
 * the code passed through; every mutation and every derivation now goes through here, so a change
 * to the contract is a compile error in the renderer rather than a doc drifting away from it. The
 * loose functions stay exported — they are what this wraps, and what the model tests exercise
 * directly.
 */
export function solveBalanceCanonicalModel(spec: SolveBalanceSpecLike): SolveBalanceModel {
  const frame = solveBalanceFrame(spec);
  const representations = solveBalanceRepresentations(frame);
  const [tiles, controls, symbol] = representations;
  return {
    id: "solveBalance",
    frame,
    representations,
    initial: solveBalanceInitial(frame),
    normalize: (raw) => solveBalanceNormalize(frame, raw),
    apply: (state, edit, origin, source) => solveBalanceApply(frame, state, edit, origin, source),
    equivalent: (p, q) => solveBalanceEquivalent(frame, p, q),
    // Derived THROUGH the bindings, so `RepresentationBinding.derive` is load-bearing rather than
    // decorative: there is no second path from state to a view.
    views: (state) => ({
      tiles: tiles.derive(state),
      controls: controls.derive(state),
      symbol: symbol.derive(state),
    }),
  };
}
