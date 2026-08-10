/**
 * MMIP v1 — the canonical model for the `algebraTiles` engine (S210).
 *
 * ── THE ZERO-PAIR DECISION ───────────────────────────────────────────────────────────────────
 *
 * The canonical state stores SIGNED POPULATIONS — how many +x tiles, how many −x tiles, how many
 * +1 tiles, how many −1 tiles are physically lying on the mat — and NOT the net counts the old
 * value carried.
 *
 * The reason is the engine's own flagship task. Its gallery lesson is *"Build −3x + 5x with tiles,
 * then read the simplified expression"*, and under net counts that sentence cannot be built: three
 * negative x-tiles and five positive ones collapse to `2` the instant they are typed, so the
 * learner never sees the thing they are supposed to reason about. Zero pairs become unrepresentable
 * exactly where zero pairs ARE the lesson.
 *
 * With populations:
 *   · a zero pair is a STATE the learner can create (`placeZeroPair`) and then collapse
 *     (`cancelPair` / `cancelAll`), rather than an event that happens to them;
 *   · `+5x` beside `−3x` is a legible position — unsimplified, not wrong — and "simplify" becomes
 *     a move with a before and an after instead of a number changing;
 *   · the cancel move maps to MMIP's `cancel` operation and so to the morph layer's COLLAPSE
 *     semantics: a pair annihilates in place. Under net counts there is nothing to animate,
 *     because nothing was ever on stage.
 *
 * THE PRICE, stated plainly. `evaluate.ts` grades `{ x, c }` — net counts — and that contract is
 * frozen. So the persisted value is `{ x, c, mat }`: the net projection the grader reads, plus the
 * populations. The net pair is the ONE derived value this engine persists, it is recomputed from
 * the populations on every write, and it is never read back as truth while `mat` is present.
 * `normalize` accepts a bare `{ x, c }` (a value written before this session, or handed in by a
 * test) and reconstructs the minimal population with no zero pairs — a well-defined section of the
 * projection, so the round trip is total in both directions.
 *
 * ── WHAT THIS ENGINE DOES NOT DO ──────────────────────────────────────────────────────────────
 *
 * `AlgebraTilesSpec` has x-tiles and unit tiles and nothing else: no x² tiles, no rectangle
 * outlines, no area frame. `distribute` (branch) and `factor` (gather) therefore have no honest
 * tile meaning here and are NOT emitted — implementing them would mean extending the schema, which
 * this session does not do. Listed as future work rather than faked.
 *
 * PURE AND DETERMINISTIC. No Math.random, no Date.now, no ambient state.
 */

import { algebraTilesPartials } from "@/lib/schema";
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

/* ─────────────────────────────── the canonical state ─────────────────────────────── */

/** What is lying on the mat. All four are counts, so all four are ≥ 0 — the SIGN is which pile a
 * tile is in, never a negative population. */
export interface AlgebraTilesState {
  readonly xPos: number;
  readonly xNeg: number;
  readonly uPos: number;
  readonly uNeg: number;
  /** x² populations. Always 0 for a mat with no area frame, which is every lesson before S211. */
  readonly sqPos: number;
  readonly sqNeg: number;
  /**
   * The rectangle is whole. `false` for every mat with no `area`, so a classic lesson's state is
   * the four populations it always was plus two zeroes and a false — and every derivation, edit
   * and refusal below reduces literally to what it did before.
   */
  readonly framed: boolean;
}

/** The task. Nothing a learner does changes it. */
export interface AlgebraTilesFrame {
  readonly targetX: number;
  readonly targetConst: number;
  /** The mat's capacity, per pile — the spec's own readability limit, reused. */
  readonly maxTiles: number;
  readonly xStart: number;
  readonly constStart: number;
  /** S211: the rectangle, when the lesson has one. `null` is the classic two-population mat. */
  readonly area: { readonly width: readonly [number, number]; readonly height: readonly [number, number]; readonly mode: "distribute" | "factor" } | null;
  /** The partial products the rectangle contains — the multiplication table, from schema.ts so the
   * renderer, this model and the grader cannot each have their own idea of it. All zero with no
   * area. */
  readonly partials: { readonly square: number; readonly x: number; readonly unit: number };
  readonly targetSquare: number;
  readonly squareStart: number;
  /** The a(x + b) shape: the width is a bare multiplier, so "the multiplier reached the x and
   * stopped" is a well-defined misconception. False for (x + a)(x + b), where it is not. */
  readonly multiplierShape: boolean;
}

export type AlgebraTilesTarget =
  | "xPos" | "xNeg" | "uPos" | "uNeg"
  | "sqPos" | "sqNeg"
  | "x" | "unit" | "square"
  | "frame" | "expression";
export type AlgebraTilesOperation = MmipOperation<AlgebraTilesTarget>;
export type AlgebraTilesTransaction = SyncTransaction<AlgebraTilesState, AlgebraTilesTarget>;

/** Which pile a tile belongs to. */
export type TileKind = "x" | "unit" | "square";
export type TileSign = 1 | -1;

export type AlgebraTilesEdit =
  /* physical — one tile, one pile */
  | { readonly kind: "placeTile"; readonly tile: TileKind; readonly sign: TileSign }
  | { readonly kind: "removeTile"; readonly tile: TileKind; readonly sign: TileSign }
  /* physical — the move that adds nothing: a +tile and a −tile together */
  | { readonly kind: "placeZeroPair"; readonly tile: TileKind }
  /* control — collapse what is already zero */
  | { readonly kind: "cancelPair"; readonly tile: TileKind }
  | { readonly kind: "cancelAll" }
  /* control */
  | { readonly kind: "reset" }
  | { readonly kind: "restore"; readonly to: AlgebraTilesState }
  /* symbolic — type or step a coefficient in the expression */
  | { readonly kind: "setXCoefficient"; readonly value: number }
  | { readonly kind: "setConstant"; readonly value: number }
  /* S215 — the x² slot. Without it (x + a)(x + b) is UNREACHABLE: its rectangle holds an x² cell
   * and no control could produce a tile for one, so the only two engines that could carry a
   * two-binomial product were the two that hand the learner the answer. Every rule the other two
   * coefficients obey applies unchanged — whole tiles only, the mat's own range, and the rectangle
   * must be open before a number may describe tiles that are lying on it. */
  | { readonly kind: "setSquareCoefficient"; readonly value: number }
  /* S211, area lessons only — the rectangle opens into its partial products, or they gather back.
   * `openFrame` is the primitive the compound `distribute` is built from: the outline is lifted
   * away and the mat is momentarily bare, which is a state the mat can really be in and the state a
   * BRANCH animation passes through. */
  | { readonly kind: "openFrame" }
  | { readonly kind: "distribute" }
  | { readonly kind: "distributePartial" }
  | { readonly kind: "factor" };

export const AT_REPRESENTATIONS = {
  mat: "algebraTiles.mat",
  controls: "algebraTiles.controls",
  expression: "algebraTiles.expression",
} as const;

/* ─────────────────────────── frame, initial, normalisation ─────────────────────────── */

export interface AlgebraTilesSpecLike {
  readonly targetX: number;
  readonly targetConst: number;
  readonly maxTiles?: number;
  readonly xStart?: number;
  readonly constStart?: number;
  readonly targetSquare?: number;
  readonly squareStart?: number;
  readonly area?: {
    readonly width: readonly [number, number];
    readonly height: readonly [number, number];
    readonly mode: "distribute" | "factor";
  };
}

export function algebraTilesFrame(spec: AlgebraTilesSpecLike): AlgebraTilesFrame {
  return {
    targetX: spec.targetX,
    targetConst: spec.targetConst,
    maxTiles: spec.maxTiles ?? 8,
    xStart: spec.xStart ?? 0,
    constStart: spec.constStart ?? 0,
    area: spec.area ?? null,
    partials: spec.area ? algebraTilesPartials(spec.area.width, spec.area.height) : { square: 0, x: 0, unit: 0 },
    targetSquare: spec.targetSquare ?? 0,
    squareStart: spec.squareStart ?? 0,
    multiplierShape: !!spec.area && spec.area.width[0] === 0,
  };
}

/** The minimal population carrying a net value: everything in one pile, no zero pairs. This is the
 * section of the net projection `normalize` uses, so `netOf(minimalPopulation(n)) === n` always. */
function split(n: number): { pos: number; neg: number } {
  return { pos: Math.max(n, 0), neg: Math.max(-n, 0) };
}

/**
 * Where the lesson starts.
 *
 *   no area      the mat the engine has always had — plus `sq` zero and `framed` false.
 *   distribute   the rectangle WHOLE and the mat bare: the tiles are still inside it.
 *   factor       the tiles LOOSE, laid out as the partial products, and no rectangle yet: the
 *                learner's job is to gather them into one.
 */
export function algebraTilesInitial(frame: AlgebraTilesFrame): AlgebraTilesState {
  if (frame.area) {
    if (frame.area.mode === "distribute") {
      // S215 — THE RECTANGLE IS THE TASK, NOT A BOX TO OPEN.
      //
      // It used to start `framed: true` with a bare mat, so the only move was one press of "Open
      // the rectangle" and the engine computed the expansion for the learner. Fable-QA rejected
      // exactly that: the step removed a manipulation instead of adding one.
      //
      // Now the rectangle is drawn OUTLINED and EMPTY — its edges proportional to the factors, its
      // interior divided into the cells `algebraTilesPartials` names — and the learner fills it by
      // producing the tiles. The mathematics they must supply is "how many of each kind does this
      // rectangle hold", which is the distributive law itself. `framed` stays false because nothing
      // is closed: there is a shape to fill and it is empty.
      return { xPos: 0, xNeg: 0, uPos: 0, uNeg: 0, sqPos: 0, sqNeg: 0, framed: false };
    }
    const sq = split(frame.partials.square);
    const x = split(frame.partials.x);
    const u = split(frame.partials.unit);
    return { xPos: x.pos, xNeg: x.neg, uPos: u.pos, uNeg: u.neg, sqPos: sq.pos, sqNeg: sq.neg, framed: false };
  }
  const x = split(frame.xStart);
  const u = split(frame.constStart);
  const sq = split(frame.squareStart);
  return { xPos: x.pos, xNeg: x.neg, uPos: u.pos, uNeg: u.neg, sqPos: sq.pos, sqNeg: sq.neg, framed: false };
}

/** The net counts the grader reads. The ONE derived value this engine persists, recomputed here on
 * every write and never treated as the source of truth while populations exist. */
export function algebraTilesNet(st: AlgebraTilesState): { x: number; c: number } {
  return { x: st.xPos - st.xNeg, c: st.uPos - st.uNeg };
}

/** The x² count the mat is worth. Kept apart from `algebraTilesNet` because that pair is the frozen
 * `{ x, c }` the grader has always read, and adding a third key to it would change that shape. */
export function algebraTilesNetSquare(st: AlgebraTilesState): number {
  return st.sqPos - st.sqNeg;
}

/**
 * Coerce anything into a whole state. Accepts the full `{ x, c, mat }` value, a bare `{ x, c }`
 * written before this session (reconstructing the pair-free population), or nonsense (falling back
 * to the task's own start). Never throws.
 */
export function algebraTilesNormalize(frame: AlgebraTilesFrame, raw: unknown): AlgebraTilesState {
  const start = algebraTilesInitial(frame);
  if (!raw || typeof raw !== "object") return start;
  const r = raw as { x?: unknown; c?: unknown; mat?: Partial<AlgebraTilesState> };
  const whole = (v: unknown, fallback: number) =>
    typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.round(v)) : fallback;
  if (r.mat && typeof r.mat === "object") {
    // A mat written before S211 carries four populations and no more; the two new fields fall to
    // the values a classic lesson always had, so an old saved value restores to old behaviour.
    return {
      xPos: whole(r.mat.xPos, start.xPos),
      xNeg: whole(r.mat.xNeg, start.xNeg),
      uPos: whole(r.mat.uPos, start.uPos),
      uNeg: whole(r.mat.uNeg, start.uNeg),
      sqPos: whole(r.mat.sqPos, start.sqPos),
      sqNeg: whole(r.mat.sqNeg, start.sqNeg),
      framed: typeof r.mat.framed === "boolean" ? r.mat.framed : start.framed,
    };
  }
  const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : fallback);
  const x = split(num(r.x, frame.xStart));
  const u = split(num(r.c, frame.constStart));
  const sq = split(num((r as { sq?: unknown }).sq, frame.squareStart));
  return { xPos: x.pos, xNeg: x.neg, uPos: u.pos, uNeg: u.neg, sqPos: sq.pos, sqNeg: sq.neg, framed: start.framed };
}

/* ────────────────────────────────── derived views ────────────────────────────────── */

export interface AlgebraTilesMatView {
  readonly xPos: number;
  readonly xNeg: number;
  readonly uPos: number;
  readonly uNeg: number;
  readonly netX: number;
  readonly netConst: number;
  /** How many +/− pairs are sitting on the mat waiting to be collapsed. */
  readonly sqPos: number;
  readonly sqNeg: number;
  readonly netSquare: number;
  readonly xPairs: number;
  readonly unitPairs: number;
  readonly squarePairs: number;
  readonly totalTiles: number;
  /** The rectangle is whole, so its tiles are inside it rather than on the mat. */
  readonly framed: boolean;
  /** The rectangle's edges as algebra, when there is one. */
  readonly edges: { readonly width: string; readonly height: string } | null;
  /** No pair is left: the mat shows the simplest expression it can. */
  readonly simplified: boolean;
}

/** One segment of an edge: an x of length `X`, or a unit of length `U`. Its sign is the sign of the
 * factor part it came from, because a negative factor makes every segment it contributes negative. */
export interface AreaSegment {
  readonly kind: "x" | "unit";
  readonly sign: 1 | -1;
  /** Drawn length, in the same units the renderer uses for a loose tile of that kind. */
  readonly length: number;
}

/** One cell of the rectangle's interior — a partial product, as an area. */
export interface AreaCell {
  readonly col: number;
  readonly row: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  /** x·x is an x², x·unit and unit·x are x-tiles, unit·unit is a unit. */
  readonly kind: TileKind;
  /** The product of the two segments' signs. */
  readonly sign: 1 | -1;
  /** Has the learner produced a tile for this cell yet? */
  readonly filled: boolean;
}

export interface AreaView {
  readonly columns: readonly AreaSegment[];
  readonly rows: readonly AreaSegment[];
  readonly cells: readonly AreaCell[];
  readonly width: number;
  readonly height: number;
  /** How many cells of each kind the rectangle holds, signed — the partial products, counted as
   * AREAS rather than computed. Asserted equal to `algebraTilesPartials` in the tests. */
  readonly needs: { readonly square: number; readonly x: number; readonly unit: number };
  /** What the mat actually holds, signed. */
  readonly have: { readonly square: number; readonly x: number; readonly unit: number };
  /** `have − needs` per kind: positive-or-negative surplus that the rectangle has no room for. */
  readonly surplus: { readonly square: number; readonly x: number; readonly unit: number };
  readonly filledCount: number;
  /**
   * The mat holds EXACTLY what the rectangle holds.
   *
   * S215b: this used to mean "every cell has something in it", which a learner reached by
   * over-producing — 8 x-tiles cover 3 x-cells and leave 5 with nowhere to go, and the widget
   * announced "9 pieces … together they are −8x − 8". A state that is not the mathematics must
   * never be announced as finished, so completeness is exact match now, and the leftovers are
   * reported rather than absorbed.
   */
  readonly complete: boolean;
  /** True when every cell is covered but the mat is carrying more besides. */
  readonly overfilled: boolean;
}

/** An x edge-segment is drawn as long as an x-tile; a unit segment as wide as a unit tile. The two
 * lengths differ, which is the point: a learner can SEE that an x is longer than a 1, and that a
 * 3-wide rectangle is three times a 1-wide one. */
export const AREA_X_LEN = 44;
export const AREA_UNIT_LEN = 18;

function edgeSegments(edge: readonly [number, number]): AreaSegment[] {
  const [a, b] = edge;
  const out: AreaSegment[] = [];
  for (let i = 0; i < Math.abs(a); i++)
    out.push({ kind: "x", sign: a < 0 ? -1 : 1, length: AREA_X_LEN });
  for (let i = 0; i < Math.abs(b); i++)
    out.push({ kind: "unit", sign: b < 0 ? -1 : 1, length: AREA_UNIT_LEN });
  return out;
}

/**
 * THE RECTANGLE, as geometry rather than as a caption.
 *
 * Each edge is cut into segments — one per unit of each factor part — so the drawn width and height
 * are proportional to the factors themselves. The interior is then the grid of those segments, and
 * every cell IS a partial product: an x-segment against an x-segment is an x², an x against a unit
 * is an x-tile, a unit against a unit is a 1. Counting the cells by kind therefore reproduces
 * `algebraTilesPartials` exactly — not because it is called here, but because that is what
 * multiplying two edges means. The tests assert the two agree rather than assuming it.
 *
 * `filled` reports how much of the rectangle the learner has actually produced, kind by kind, so an
 * incomplete distribution is visible AS A GAP IN THE PICTURE rather than only as a sentence.
 */
export function deriveArea(frame: AlgebraTilesFrame, st: AlgebraTilesState): AreaView | null {
  if (!frame.area) return null;
  const columns = edgeSegments(frame.area.width);
  const rows = edgeSegments(frame.area.height);
  const needs = { square: 0, x: 0, unit: 0 };
  const cells: AreaCell[] = [];
  let y = 0;
  // Tiles already on the mat, by kind AND BY PILE, drawn down cell by cell.
  //
  // S215b: this was one signed NET per kind, and a net cannot be in two places at once. A
  // rectangle whose cells of one kind are of BOTH signs — which is every (x + a)(x − b), since one
  // negative edge part makes some x strips negative and leaves the rest positive — needs 3 positive
  // x-tiles AND 2 negative ones to be covered. Their net is 1, so a net budget could fill exactly
  // one of the five and the picture reported "3 of 12 parts covered" about a mat the GRADER (which
  // compares nets) marked correct. A tile that is on the mat is on the mat: each pile pays for its
  // own cells. Where only one pile of a kind is occupied — every authored step, and every state a
  // coefficient slider can reach on its own — the pile IS the net, so the old rule reduces
  // literally.
  const pos = { square: st.sqPos, x: st.xPos, unit: st.uPos };
  const neg = { square: st.sqNeg, x: st.xNeg, unit: st.uNeg };
  rows.forEach((r, row) => {
    let x = 0;
    columns.forEach((c, col) => {
      const kind: TileKind = r.kind === "x" && c.kind === "x" ? "square" : r.kind === c.kind ? "unit" : "x";
      const sign: 1 | -1 = r.sign * c.sign > 0 ? 1 : -1;
      needs[kind] += sign;
      // A cell counts as filled when the mat still has a tile of that kind AND THAT SIGN to spend.
      const pool = sign > 0 ? pos : neg;
      const filled = pool[kind] > 0;
      if (filled) pool[kind] -= 1;
      cells.push({ col, row, x, y, w: c.length, h: r.length, kind, sign, filled });
      x += c.length;
    });
    y += r.length;
  });
  const width = columns.reduce((t, c) => t + c.length, 0);
  const height = rows.reduce((t, r) => t + r.length, 0);
  const filledCount = cells.filter((c) => c.filled).length;
  const have = { square: algebraTilesNetSquare(st), x: algebraTilesNet(st).x, unit: algebraTilesNet(st).c };
  const surplus = {
    square: have.square - needs.square,
    x: have.x - needs.x,
    unit: have.unit - needs.unit,
  };
  const exact = surplus.square === 0 && surplus.x === 0 && surplus.unit === 0;
  const allCovered = cells.length > 0 && filledCount === cells.length;
  return {
    columns,
    rows,
    cells,
    width,
    height,
    needs,
    have,
    surplus,
    filledCount,
    // A rectangle of area 9 cannot contain 12 pieces. Covering every cell is necessary and not
    // sufficient — the mat must hold exactly the rectangle, nothing spare.
    complete: allCovered && exact,
    overfilled: allCovered && !exact,
  };
}

export function deriveMat(frame: AlgebraTilesFrame, st: AlgebraTilesState): AlgebraTilesMatView {
  const xPairs = Math.min(st.xPos, st.xNeg);
  const unitPairs = Math.min(st.uPos, st.uNeg);
  const squarePairs = Math.min(st.sqPos, st.sqNeg);
  const net = algebraTilesNet(st);
  return {
    xPos: st.xPos,
    xNeg: st.xNeg,
    uPos: st.uPos,
    uNeg: st.uNeg,
    sqPos: st.sqPos,
    sqNeg: st.sqNeg,
    netX: net.x,
    netConst: net.c,
    netSquare: algebraTilesNetSquare(st),
    xPairs,
    unitPairs,
    squarePairs,
    totalTiles: st.xPos + st.xNeg + st.uPos + st.uNeg + st.sqPos + st.sqNeg,
    framed: st.framed,
    edges: frame.area ? { width: edgeText(frame.area.width), height: edgeText(frame.area.height) } : null,
    simplified: xPairs === 0 && unitPairs === 0 && squarePairs === 0,
  };
}

export interface AlgebraTilesExpressionView {
  /** The classic readout, byte-for-byte: `2x + 3`, `2x − 3`. Always the NET, because that is what
   * the expression means however the tiles are arranged. */
  readonly sentence: string;
  /** What the mat literally holds, when it is not yet simplified: `5x − 3x + 2`. Null once there is
   * nothing left to collapse, so the two lines never say the same thing twice. */
  /** The same expression with a real minus sign on EVERY term. `sentence` is the classic readout
   * and is byte-frozen — it renders a negative coefficient with JavaScript's hyphen ("-3x − 6"),
   * which is how the engine has always drawn it and what the authored regression set pins. New
   * surfaces use this one instead, so nothing new ships a hyphen where a minus belongs. */
  readonly signedSentence: string;
  readonly unsimplified: string | null;
  /** The rectangle as a product, while it is whole. Null once it is open. */
  readonly product: string | null;
  readonly simplified: boolean;
  readonly slots: {
    /** S215 — always present, and 0 on a mat with no rectangle, so a classic lesson's slot set is
     * the two it always had plus one that reads zero and is never rendered. */
    readonly squareCoefficient: EditableSlot<AlgebraTilesTarget>;
    readonly xCoefficient: EditableSlot<AlgebraTilesTarget>;
    readonly constant: EditableSlot<AlgebraTilesTarget>;
  };
}

const MINUS = "−";

function term(count: number, suffix: string, first: boolean): string {
  // A single x or x² is written without its 1, as algebra writes it; a single UNIT keeps its 1,
  // because "+ " is not a term.
  const mag = suffix.length > 0 && Math.abs(count) === 1 ? suffix : `${Math.abs(count)}${suffix}`;
  if (first) return count < 0 ? `${MINUS}${mag}` : mag;
  return `${count < 0 ? MINUS : "+"} ${mag}`;
}

export function deriveExpression(
  frame: AlgebraTilesFrame,
  st: AlgebraTilesState
): AlgebraTilesExpressionView {
  const mat = deriveMat(frame, st);
  // The classic line, unchanged: `${x}x ${c >= 0 ? "+" : "−"} ${|c|}`.
  // The classic line, byte-for-byte, whenever there is no x² on the mat — which is every lesson
  // before S211 and every moment of an area lesson that has none.
  const tail = `${mat.netX}x ${mat.netConst >= 0 ? "+" : MINUS} ${Math.abs(mat.netConst)}`;
  const sentence = mat.netSquare === 0 ? tail : `${term(mat.netSquare, "x\u00b2", true)} ${mat.netX < 0 ? MINUS : "+"} ${Math.abs(mat.netX)}x ${mat.netConst >= 0 ? "+" : MINUS} ${Math.abs(mat.netConst)}`;
  const parts: string[] = [];
  if (st.sqPos !== 0) parts.push(term(st.sqPos, "x\u00b2", parts.length === 0));
  if (st.sqNeg !== 0) parts.push(term(-st.sqNeg, "x\u00b2", parts.length === 0));
  if (st.xPos !== 0) parts.push(term(st.xPos, "x", parts.length === 0));
  if (st.xNeg !== 0) parts.push(term(-st.xNeg, "x", parts.length === 0));
  if (st.uPos !== 0) parts.push(term(st.uPos, "", parts.length === 0));
  if (st.uNeg !== 0) parts.push(term(-st.uNeg, "", parts.length === 0));
  const slot = (
    target: AlgebraTilesTarget,
    value: number,
    meaning: string
  ): EditableSlot<AlgebraTilesTarget> => ({
    target,
    value,
    min: -frame.maxTiles,
    max: frame.maxTiles,
    step: 1,
    editable: true,
    meaning,
  });
  const signedTail = `${term(mat.netX, "x", true)} ${mat.netConst < 0 ? MINUS : "+"} ${Math.abs(mat.netConst)}`;
  return {
    sentence,
    signedSentence:
      mat.netSquare === 0
        ? signedTail
        : `${term(mat.netSquare, "x\u00b2", true)} ${mat.netX < 0 ? MINUS : "+"} ${Math.abs(mat.netX)}x ${mat.netConst < 0 ? MINUS : "+"} ${Math.abs(mat.netConst)}`,
    // While the rectangle is whole the mat shows a PRODUCT, not a sum — that is the whole point of
    // the distribute lesson, and saying it in words is what the strip is for.
    product: mat.framed && mat.edges ? `(${mat.edges.width})(${mat.edges.height})` : null,
    unsimplified: mat.simplified ? null : parts.length > 0 ? parts.join(" ") : "0",
    simplified: mat.simplified,
    slots: {
      squareCoefficient: slot(
        "square",
        mat.netSquare,
        `how many x² tiles the mat is worth altogether, currently ${mat.netSquare}`
      ),
      xCoefficient: slot("x", mat.netX, `how many x-tiles the mat is worth altogether, currently ${mat.netX}`),
      constant: slot("unit", mat.netConst, `how many unit tiles the mat is worth altogether, currently ${mat.netConst}`),
    },
  };
}

export interface AlgebraTilesControlView {
  readonly canCancelX: boolean;
  readonly canCancelUnit: boolean;
  readonly canCancelAll: boolean;
  readonly pairsAvailable: number;
  readonly matFull: boolean;
  /** S211 — all false with no area frame, so a classic lesson's control set is what it always was. */
  readonly hasFrame: boolean;
  readonly canDistribute: boolean;
  readonly canDistributePartial: boolean;
  readonly canFactor: boolean;
  /** Why factoring is not available yet, when it is not. */
  readonly factorBlocked: string | null;
}

/** Does the mat hold exactly the rectangle's partial products? The gate on factoring. */
export function matchesPartials(frame: AlgebraTilesFrame, st: AlgebraTilesState): boolean {
  if (!frame.area) return false;
  const net = algebraTilesNet(st);
  return (
    algebraTilesNetSquare(st) === frame.partials.square &&
    net.x === frame.partials.x &&
    net.c === frame.partials.unit
  );
}

export function deriveControls(frame: AlgebraTilesFrame, st: AlgebraTilesState): AlgebraTilesControlView {
  const mat = deriveMat(frame, st);
  return {
    canCancelX: mat.xPairs > 0,
    canCancelUnit: mat.unitPairs > 0,
    canCancelAll: mat.xPairs > 0 || mat.unitPairs > 0,
    pairsAvailable: mat.xPairs + mat.unitPairs,
    matFull:
      st.xPos >= frame.maxTiles || st.xNeg >= frame.maxTiles || st.uPos >= frame.maxTiles || st.uNeg >= frame.maxTiles,
    hasFrame: frame.area !== null,
    // A lesson runs ONE direction (S214). Offering the inverse move as well made a finished answer
    // one click from being un-done: in a distribute lesson `Gather` lit up exactly when the learner
    // succeeded, and re-framing is graded incorrect there. The model still performs either move —
    // distribute and factor really are inverses, and the tests pin that — but the CONTROLS follow
    // the lesson's own direction, which is what the learner is being asked to travel.
    canDistribute: !!frame.area && frame.area.mode === "distribute" && st.framed,
    canDistributePartial:
      !!frame.area && frame.area.mode === "distribute" && st.framed && frame.multiplierShape,
    canFactor: !!frame.area && frame.area.mode === "factor" && !st.framed && matchesPartials(frame, st),
    factorBlocked:
      !frame.area || frame.area.mode !== "factor" || st.framed || matchesPartials(frame, st)
        ? null
        : `The mat is worth ${algebraTilesNetSquare(st)} x², ${mat.netX} x and ${mat.netConst} units; the rectangle needs ${frame.partials.square}, ${frame.partials.x} and ${frame.partials.unit}.`,
  };
}

/* ────────────────────────────────── the edit path ────────────────────────────────── */

const pile = (tile: TileKind, sign: TileSign): AlgebraTilesTarget =>
  tile === "square"
    ? sign > 0 ? "sqPos" : "sqNeg"
    : tile === "x"
      ? sign > 0 ? "xPos" : "xNeg"
      : sign > 0 ? "uPos" : "uNeg";

const NOUN: Record<TileKind, string> = { square: "x² tile", x: "x-tile", unit: "unit tile" };

/** Which coefficient edit drives which pile, and how its value reads back as algebra. Tables rather
 * than chains of ternaries, so a third kind cannot be handled in one place and missed in the
 * other — which is exactly how `placeTile` came to announce a square tile's count as the
 * constant. */
const COEFFICIENT_TILE: Record<"setSquareCoefficient" | "setXCoefficient" | "setConstant", TileKind> = {
  setSquareCoefficient: "square",
  setXCoefficient: "x",
  setConstant: "unit",
};
const SUFFIX: Record<TileKind, string> = { square: "x²", x: "x", unit: "" };

const tileWord = (n: number, tile: TileKind, sign: TileSign) =>
  `${Math.abs(n)} ${sign < 0 ? "negative " : ""}${NOUN[tile]}${Math.abs(n) === 1 ? "" : "s"}`;

const fmt = (n: number) => (n < 0 ? `${MINUS}${Math.abs(n)}` : `${n}`);

/** One edge of the rectangle, written as algebra: `[1, 3]` is `x + 3`, `[0, 4]` is `4`. */
export function edgeText(edge: readonly [number, number]): string {
  const [a, b] = edge;
  if (a === 0) return fmt(b);
  const head = a === 1 ? "x" : a === -1 ? `${MINUS}x` : `${fmt(a)}x`;
  if (b === 0) return head;
  return `${head} ${b < 0 ? MINUS : "+"} ${Math.abs(b)}`;
}

function op(
  kind: AlgebraTilesOperation["kind"],
  target: AlgebraTilesTarget,
  amount: number,
  describe: string
): AlgebraTilesOperation {
  return { kind, target, amount, sides: ["mat"], describe };
}

function accept(
  before: AlgebraTilesState,
  after: AlgebraTilesState,
  origin: EditOrigin,
  source: string,
  ops: readonly AlgebraTilesOperation[]
): AlgebraTilesTransaction {
  const changed =
    before.xPos !== after.xPos ||
    before.xNeg !== after.xNeg ||
    before.uPos !== after.uPos ||
    before.uNeg !== after.uNeg ||
    before.sqPos !== after.sqPos ||
    before.sqNeg !== after.sqNeg ||
    before.framed !== after.framed;
  // A transaction that moved nothing has nothing to describe. `reset` on an untouched mat is the
  // reachable case: it is accepted, it is legal, and it is not an event — so it carries no ops and
  // a morph layer given it animates nothing. (mmipHarness `transactionCheck` pins exactly this.)
  // The rule itself now lives in `acceptTransaction` (mmipTypes.ts, hoisted S213) — this engine
  // only computes what "changed" means for ITS OWN state, which is all that may vary per engine.
  return acceptTransaction(before, after, origin, source, changed, ops);
}

/** What the mat is worth in ONE kind — the net, not a pile. Squares are counted by their own
 * function because `algebraTilesNet` returns the frozen `{ x, c }` pair the grader reads; routing
 * all three through here is what stops a describe-string reaching for the wrong one. */
const netOf = (st: AlgebraTilesState, tile: TileKind): number =>
  tile === "square" ? algebraTilesNetSquare(st) : tile === "x" ? algebraTilesNet(st).x : algebraTilesNet(st).c;

const get = (st: AlgebraTilesState, t: AlgebraTilesTarget): number =>
  t === "xPos" ? st.xPos
  : t === "xNeg" ? st.xNeg
  : t === "uPos" ? st.uPos
  : t === "uNeg" ? st.uNeg
  : t === "sqPos" ? st.sqPos
  : t === "sqNeg" ? st.sqNeg
  : 0;

/** The tile placements a set of partial products stands for, one pile at a time. This is what a
 * `distribute` decomposes into, and it is the only place the partial products become moves. */
function placementsFor(p: { square: number; x: number; unit: number }): AlgebraTilesEdit[] {
  const out: AlgebraTilesEdit[] = [];
  const push = (tile: TileKind, n: number) => {
    const sign: TileSign = n < 0 ? -1 : 1;
    for (let i = 0; i < Math.abs(n); i++) out.push({ kind: "placeTile", tile, sign });
  };
  push("square", p.square);
  push("x", p.x);
  push("unit", p.unit);
  return out;
}

/** THE ONLY MUTATION PATH. */
export function algebraTilesApply(
  frame: AlgebraTilesFrame,
  st: AlgebraTilesState,
  edit: AlgebraTilesEdit,
  origin: EditOrigin,
  source: string
): AlgebraTilesTransaction {
  const reject = (code: string, message: string) =>
    rejectTransaction<AlgebraTilesState, AlgebraTilesTarget>(st, origin, source, { code, message });

  // ── THE RECTANGLE STANDS (S214) ──────────────────────────────────────────────────────────
  // While the frame is whole its tiles are INSIDE it, so there is nothing loose on the mat to
  // move, add or cancel — and a number typed into a slot would describe tiles that are not there.
  // This is the same rule solveBalance has always had for an unopened bracket (`brackets-standing`),
  // and its absence here was the defect that let a learner set the sliders to the right answer and
  // be graded wrong: the arithmetic was correct, the mat contradicted the picture, and nothing
  // said so. Opening the rectangle, resetting and stepping back are the moves that remain, because
  // those are the ones that act on the frame itself.
  const FRAME_STANDING =
    "The rectangle is still whole, so its tiles are inside it rather than on the mat. Open it first — then every tile is yours to move.";
  const framedGate: ReadonlyArray<AlgebraTilesEdit["kind"]> = [
    "placeTile",
    "removeTile",
    "placeZeroPair",
    "cancelPair",
    "cancelAll",
    "setXCoefficient",
    "setConstant",
    "setSquareCoefficient",
  ];
  if (st.framed && framedGate.includes(edit.kind)) return reject("frame-standing", FRAME_STANDING);

  switch (edit.kind) {
    case "placeTile": {
      const t = pile(edit.tile, edit.sign);
      if (get(st, t) >= frame.maxTiles)
        return reject(
          "mat-full",
          `The mat holds at most ${frame.maxTiles} tiles of one kind — beyond that they could not be counted by eye.`
        );
      const after = { ...st, [t]: get(st, t) + 1 } as AlgebraTilesState;
      return accept(st, after, origin, source, [
        op(
          "add",
          t,
          1,
          `Put ${tileWord(1, edit.tile, edit.sign)} on the mat — it now holds ${get(after, t)} of them, and the expression reads ${fmt(netOf(after, edit.tile))}${edit.tile === "square" ? "x\u00b2" : edit.tile === "x" ? "x" : ""}.`
        ),
      ]);
    }
    case "removeTile": {
      const t = pile(edit.tile, edit.sign);
      if (get(st, t) === 0)
        return reject("none-to-remove", `There are no ${tileWord(2, edit.tile, edit.sign)} on the mat to take off.`);
      const after = { ...st, [t]: get(st, t) - 1 } as AlgebraTilesState;
      return accept(st, after, origin, source, [
        op(
          "subtract",
          t,
          -1,
          `Took ${tileWord(1, edit.tile, edit.sign)} off the mat — ${get(after, t)} left of that kind.`
        ),
      ]);
    }
    case "placeZeroPair": {
      const p = pile(edit.tile, 1);
      const n = pile(edit.tile, -1);
      if (get(st, p) >= frame.maxTiles || get(st, n) >= frame.maxTiles)
        return reject("mat-full", `The mat holds at most ${frame.maxTiles} tiles of one kind.`);
      const after = { ...st, [p]: get(st, p) + 1, [n]: get(st, n) + 1 } as AlgebraTilesState;
      const noun = NOUN[edit.tile];
      return accept(st, after, origin, source, [
        op("add", p, 1, `Put one ${noun} on the mat…`),
        op("add", n, 1, `…and one negative ${noun} beside it. Together they weigh nothing, so the expression is unchanged: a zero pair.`),
      ]);
    }
    case "cancelPair":
    case "cancelAll": {
      const kinds: TileKind[] = edit.kind === "cancelPair" ? [edit.tile] : ["x", "unit"];
      const mat = deriveMat(frame, st);
      // Each kind reads ITS OWN pair count. "square" used to fall through to `unitPairs`, which
      // would have collapsed a square pair that was not there and driven both squares piles
      // negative — unreachable from the UI, and wrong wherever it was called from.
      const avail = (k: TileKind) => (k === "square" ? mat.squarePairs : k === "x" ? mat.xPairs : mat.unitPairs);
      if (!kinds.some((k) => avail(k) > 0))
        return reject(
          "no-pairs",
          "There is no zero pair on the mat to collapse — a pair needs one positive tile and one negative tile of the same kind."
        );
      let after = st;
      const ops: AlgebraTilesOperation[] = [];
      for (const k of kinds) {
        const n = edit.kind === "cancelPair" ? 1 : avail(k);
        if (n === 0) continue;
        const p = pile(k, 1);
        const q = pile(k, -1);
        after = { ...after, [p]: get(after, p) - n, [q]: get(after, q) - n } as AlgebraTilesState;
        const noun = k === "x" ? "x-tile" : "unit tile";
        ops.push(
          op(
            "cancel",
            k,
            -n,
            `${n} ${noun}${n === 1 ? "" : "s"} and ${n} negative ${noun}${n === 1 ? "" : "s"} made zero and left the mat together — the expression did not change.`
          )
        );
      }
      return accept(st, after, origin, source, ops);
    }
    case "reset": {
      return accept(st, algebraTilesInitial(frame), origin, source, [
        op("restore", "expression", 0, "Cleared the mat back to the tiles the task started with."),
      ]);
    }
    case "restore": {
      const to = algebraTilesNormalize(frame, { mat: edit.to });
      return accept(st, to, origin, source, [
        op(
          "restore",
          "expression",
          0,
          `Stepped back to the mat before that move: ${deriveExpression(frame, to).sentence}.`
        ),
      ]);
    }
    /* ── S211: the rectangle ── */
    case "openFrame": {
      if (!frame.area) return reject("no-frame", "This mat has no rectangle on it.");
      if (!st.framed) return reject("frame-already-open", "The rectangle is already open.");
      return accept(st, { ...st, framed: false }, origin, source, [
        op("distribute", "frame", 0, "Lifted the rectangle away — its tiles are loose on the mat now."),
      ]);
    }
    case "distribute":
    case "distributePartial": {
      if (!frame.area) return reject("no-frame", "This mat has no rectangle to open.");
      if (!st.framed)
        return reject("frame-already-open", "The rectangle is already open — its tiles are on the mat.");
      const full = frame.partials;
      if (edit.kind === "distributePartial" && !frame.multiplierShape)
        return reject(
          "no-partial-shape",
          "This rectangle is a product of two binomials, so there is no single multiplier that could stop early — every edge reaches every term."
        );
      // The named misconception, and only where it is well defined: for a(x + b) the multiplier
      // reaches the x and stops, so one copy of the constant survives instead of a of them.
      const p = edit.kind === "distribute" ? full : { square: full.square, x: full.x, unit: frame.area.height[1] };
      const after: AlgebraTilesState = {
        ...st,
        framed: false,
        sqPos: st.sqPos + Math.max(p.square, 0),
        sqNeg: st.sqNeg + Math.max(-p.square, 0),
        xPos: st.xPos + Math.max(p.x, 0),
        xNeg: st.xNeg + Math.max(-p.x, 0),
        uPos: st.uPos + Math.max(p.unit, 0),
        uNeg: st.uNeg + Math.max(-p.unit, 0),
      };
      const ops: AlgebraTilesOperation[] = [];
      const branch = (tile: TileKind, n: number, target: AlgebraTilesTarget) => {
        if (n === 0) return;
        ops.push(
          op(
            "distribute",
            target,
            n,
            `${edit.kind === "distribute" ? "Every edge reached" : "The multiplier reached"} this corner of the rectangle: ${tileWord(n, tile, n < 0 ? -1 : 1)} came out onto the mat.`
          )
        );
      };
      branch("square", p.square, "square");
      branch("x", p.x, "x");
      branch("unit", p.unit, "unit");
      if (ops.length === 0)
        ops.push(op("distribute", "frame", 0, "Lifted the rectangle away — it contained no tiles."));
      return accept(st, after, origin, source, ops);
    }
    case "factor": {
      if (!frame.area) return reject("no-frame", "This mat has no rectangle to gather into.");
      if (st.framed) return reject("already-framed", "The tiles are already gathered into the rectangle.");
      const net = algebraTilesNet(st);
      const p = frame.partials;
      if (algebraTilesNetSquare(st) !== p.square || net.x !== p.x || net.c !== p.unit)
        return reject(
          "frame-mismatch",
          `These tiles do not make that rectangle. It needs ${p.square} x², ${p.x} x and ${p.unit} units; the mat is worth ${algebraTilesNetSquare(st)} x², ${net.x} x and ${net.c} units.`
        );
      return accept(
        st,
        { xPos: 0, xNeg: 0, uPos: 0, uNeg: 0, sqPos: 0, sqNeg: 0, framed: true },
        origin,
        source,
        [
          op(
            "factor",
            "frame",
            1,
            `The tiles gathered into one rectangle: ${edgeText(frame.area.width)} along one edge and ${edgeText(frame.area.height)} along the other.`
          ),
        ]
      );
    }
    case "setSquareCoefficient":
    case "setXCoefficient":
    case "setConstant": {
      const tile: TileKind = COEFFICIENT_TILE[edit.kind];
      if (!Number.isInteger(edit.value)) return reject("non-integer", "The mat holds whole tiles only.");
      if (Math.abs(edit.value) > frame.maxTiles)
        return reject("out-of-range", `This mat goes from ${MINUS}${frame.maxTiles} to ${frame.maxTiles}.`);
      const primitives = walk(st, tile, edit.value);
      if (primitives.length === 0) return accept(st, st, origin, source, []);
      let after = st;
      for (const p of primitives) after = algebraTilesApply(frame, after, p, origin, source).after;
      const from = netOf(st, tile);
      const d = edit.value - from;
      const suffix = SUFFIX[tile];
      return accept(st, after, origin, source, [
        op(
          d > 0 ? "add" : "subtract",
          tile,
          d,
          `${d > 0 ? "Put" : "Took"} ${tileWord(d, tile, d > 0 ? 1 : -1)} ${d > 0 ? "on" : "off"} the mat — the expression now reads ${fmt(edit.value)}${suffix}.`
        ),
      ]);
    }
  }
}

/**
 * The tile route a typed coefficient stands for: one tile at a time, always the SHORTEST one.
 * To raise the value it takes negative tiles off while any remain, then places positive ones; to
 * lower it, the mirror. Two consequences, both deliberate:
 *
 *   · a typed number NEVER invents a zero pair. Crossing zero with the slider empties one pile
 *     before it starts filling the other, so the classic control set draws exactly the tiles it
 *     always drew.
 *   · a typed number may CONSUME pairs a learner has built, because taking a negative tile away is
 *     the shortest honest way to be worth more. Putting pairs ON is a deliberate move
 *     (`placeZeroPair`), never a side effect of typing.
 */
function walk(st: AlgebraTilesState, tile: TileKind, to: number): AlgebraTilesEdit[] {
  const out: AlgebraTilesEdit[] = [];
  let pos = tile === "square" ? st.sqPos : tile === "x" ? st.xPos : st.uPos;
  let neg = tile === "square" ? st.sqNeg : tile === "x" ? st.xNeg : st.uNeg;
  let net = pos - neg;
  while (net !== to) {
    if (to > net) {
      if (neg > 0) {
        out.push({ kind: "removeTile", tile, sign: -1 });
        neg -= 1;
      } else {
        out.push({ kind: "placeTile", tile, sign: 1 });
        pos += 1;
      }
    } else if (pos > 0) {
      out.push({ kind: "removeTile", tile, sign: 1 });
      pos -= 1;
    } else {
      out.push({ kind: "placeTile", tile, sign: -1 });
      neg += 1;
    }
    net = pos - neg;
  }
  return out;
}

/** Every symbolic edit as the sequence of single-tile moves it stands for. `apply(edit)` equals
 * folding `apply` over this — pinned in algebraTilesModel.test.ts. */
export function algebraTilesDecompose(
  frame: AlgebraTilesFrame,
  st: AlgebraTilesState,
  edit: AlgebraTilesEdit
): readonly AlgebraTilesEdit[] {
  // Opening a rectangle IS its partial products, one tile at a time: the outline lifts away and
  // then every corner of the multiplication table lands on the mat. `algebraTilesPartials` names
  // the counts; this turns them into moves, and nothing else does.
  if (edit.kind === "distribute" || edit.kind === "distributePartial") {
    if (!frame.area || !st.framed) return [edit];
    if (edit.kind === "distributePartial" && !frame.multiplierShape) return [edit];
    const p =
      edit.kind === "distribute"
        ? frame.partials
        : { square: frame.partials.square, x: frame.partials.x, unit: frame.area.height[1] };
    return [{ kind: "openFrame" }, ...placementsFor(p)];
  }
  if (edit.kind !== "setSquareCoefficient" && edit.kind !== "setXCoefficient" && edit.kind !== "setConstant")
    return [edit];
  if (!Number.isInteger(edit.value) || Math.abs(edit.value) > frame.maxTiles) return [edit];
  return walk(st, COEFFICIENT_TILE[edit.kind], edit.value);
}

/** Two mats make the same claim when they are worth the same — a mat carrying zero pairs is
 * equivalent to the simplified one, which is exactly what "a zero pair changes nothing" means. */
export function algebraTilesEquivalent(p: AlgebraTilesState, q: AlgebraTilesState): boolean {
  const a = algebraTilesNet(p);
  const b = algebraTilesNet(q);
  return a.x === b.x && a.c === b.c && algebraTilesNetSquare(p) === algebraTilesNetSquare(q);
}

/* ─────────────────────────── the assembled model (S209-A1 pattern) ─────────────────────────── */

export interface AlgebraTilesViews {
  readonly mat: AlgebraTilesMatView;
  /** The rectangle as geometry — null for a lesson that has none. */
  readonly area: AreaView | null;
  readonly controls: AlgebraTilesControlView;
  readonly expression: AlgebraTilesExpressionView;
}

export function algebraTilesRepresentations(
  frame: AlgebraTilesFrame
): readonly [
  RepresentationBinding<AlgebraTilesState, AlgebraTilesMatView>,
  RepresentationBinding<AlgebraTilesState, AlgebraTilesControlView>,
  RepresentationBinding<AlgebraTilesState, AlgebraTilesExpressionView>,
] {
  return [
    { id: AT_REPRESENTATIONS.mat, label: "the tile mat", derive: (s) => deriveMat(frame, s), editable: () => true },
    {
      id: AT_REPRESENTATIONS.controls,
      label: "the simplify controls",
      derive: (s) => deriveControls(frame, s),
      editable: () => true,
    },
    {
      id: AT_REPRESENTATIONS.expression,
      label: "the expression",
      derive: (s) => deriveExpression(frame, s),
      editable: () => true,
    },
  ];
}

export interface AlgebraTilesModel
  extends CanonicalModel<AlgebraTilesState, AlgebraTilesEdit, AlgebraTilesTarget> {
  readonly frame: AlgebraTilesFrame;
  readonly representations: ReturnType<typeof algebraTilesRepresentations>;
  readonly views: (state: AlgebraTilesState) => AlgebraTilesViews;
  /** The `{ x, c }` pair `evaluate.ts` grades. Derived, never stored as truth. */
  readonly net: (state: AlgebraTilesState) => { x: number; c: number };
  /** The x² count, kept out of `net` so that frozen pair keeps its shape. */
  readonly netSquare: (state: AlgebraTilesState) => number;
}

export function algebraTilesCanonicalModel(spec: AlgebraTilesSpecLike): AlgebraTilesModel {
  const frame = algebraTilesFrame(spec);
  const representations = algebraTilesRepresentations(frame);
  const [mat, controls, expression] = representations;
  return {
    id: "algebraTiles",
    frame,
    representations,
    initial: algebraTilesInitial(frame),
    normalize: (raw) => algebraTilesNormalize(frame, raw),
    apply: (state, edit, origin, source) => algebraTilesApply(frame, state, edit, origin, source),
    equivalent: algebraTilesEquivalent,
    views: (state) => ({
      mat: mat.derive(state),
      area: deriveArea(frame, state),
      controls: controls.derive(state),
      expression: expression.derive(state),
    }),
    net: algebraTilesNet,
    netSquare: algebraTilesNetSquare,
  };
}
