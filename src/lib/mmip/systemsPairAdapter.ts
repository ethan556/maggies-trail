/**
 * systemsPairAdapter — the thin seam between an authored `systemsExplore` spec and the canonical
 * pair (S212 phase 1, so that phase 2's wiring is a rendering change and nothing more).
 *
 * `linePairModel` is deliberately engine-agnostic: it knows about two lines, not about a widget's
 * spec shape or its persisted value. Everything surface-specific lives here — the policy mapping,
 * the persisted envelope, and the one rule that keeps the old value shape valid forever.
 *
 * THE PERSISTED-VALUE RULE, which is the whole of the backward-compatibility story:
 *
 *   · The value is `{ x, y }` and gains an OPTIONAL `lines` envelope.
 *   · `lines` is written ONLY when the pair actually differs from the authored one — that is, only
 *     after a learner has moved a line. A spec with no editable line can never write it, and a
 *     learner who has not touched a line has not written it either.
 *   · So every value the product has ever stored stays exactly as valid, and a classic spec's
 *     value stays byte-identical to what it always was. `systemsPairPersist` is the only writer
 *     and it enforces this, rather than leaving it to each call site to remember.
 *
 * A LINE THAT IS NOT EDITABLE IS NOT A SPECIAL CASE. Rather than teach the pair model about
 * read-only slots, an unedited line gets a policy pinned to its own authored values with
 * `outOfRange: "reject"`. Any edit aimed at it is refused by the machinery that already refuses
 * everything else, with a reason in the same shape — no new concept, no new code path.
 */

import {
  ONE,
  rat,
  ratToNumber,
  type LineCanonical,
  type LinePolicy,
  type Rat
} from "./lineFamilyModel";
import {
  linePairCanonicalModel,
  makeLinePairCanonical,
  type LinePairCanonical,
  type LinePairInit,
  type LinePairModel,
  type LineSlot
} from "./linePairModel";

/** Structural mirror of `SystemsLineEditSpec` — kept local so the model never imports the schema. */
export type SystemsLineEditPolicy = {
  readonly slopeMin: number;
  readonly slopeMax: number;
  readonly slopeStep: number;
  readonly interceptMin: number;
  readonly interceptMax: number;
  readonly interceptStep: number;
  readonly outOfRange: "clamp" | "reject";
  readonly offLattice: "snap" | "reject";
};

export type SystemsPairSpecLike = {
  readonly m1: number;
  readonly b1: number;
  readonly m2: number;
  readonly b2: number;
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin: number;
  readonly yMax: number;
  readonly editLine1?: SystemsLineEditPolicy;
  readonly editLine2?: SystemsLineEditPolicy;
};

/** The persisted value. `lines` absent is the shape every stored value has today. */
export type SystemsPairValue = {
  readonly x: number;
  readonly y: number;
  readonly lines?: { readonly m1: number; readonly b1: number; readonly m2: number; readonly b2: number };
};

export const systemsPairEditable = (spec: SystemsPairSpecLike): boolean =>
  Boolean(spec.editLine1 || spec.editLine2);

export const systemsLineEditable = (spec: SystemsPairSpecLike, slot: LineSlot): boolean =>
  Boolean(slot === "a" ? spec.editLine1 : spec.editLine2);

/** An authored integer as an exact rational. Every systemsExplore parameter is an integer. */
const exact = (v: number): Rat => (Number.isFinite(v) ? rat(Math.round(v)) : rat(0));

/**
 * Map one line's authored control onto the line family's policy vocabulary. With no control, the
 * range collapses onto the line's own values and refuses — an immovable line, said in the language
 * the model already speaks.
 */
function policyFor(edit: SystemsLineEditPolicy | undefined, m: number, b: number): LinePolicy {
  if (!edit) {
    return {
      slopeMin: exact(m),
      slopeMax: exact(m),
      interceptMin: exact(b),
      interceptMax: exact(b),
      slopeStep: null,
      interceptStep: null,
      outOfRange: "reject",
      offLattice: "reject",
      tableEdit: "translate"
    };
  }
  return {
    slopeMin: exact(edit.slopeMin),
    slopeMax: exact(edit.slopeMax),
    interceptMin: exact(edit.interceptMin),
    interceptMax: exact(edit.interceptMax),
    slopeStep: exact(edit.slopeStep),
    interceptStep: exact(edit.interceptStep),
    outOfRange: edit.outOfRange,
    offLattice: edit.offLattice,
    tableEdit: "translate"
  };
}

/** Read the four line parameters a value stands for: the learner's if present, else the spec's. */
export function systemsPairParams(
  spec: SystemsPairSpecLike,
  value?: SystemsPairValue | null
): { m1: number; b1: number; m2: number; b2: number } {
  const stored = value?.lines;
  const pick = (v: unknown, fallback: number): number =>
    typeof v === "number" && Number.isFinite(v) ? v : fallback;
  if (!stored) return { m1: spec.m1, b1: spec.b1, m2: spec.m2, b2: spec.b2 };
  // PER-LINE gating is what makes a stale or corrupt envelope harmless: a slot the author never
  // opened reads its authored value no matter what the stored object claims, so a classic spec is
  // immune by the same rule that keeps a half-open spec half-open. (An earlier draft also had a
  // whole-spec early return here; it was provably unreachable given these four checks, and a
  // mutation test that could not tell it apart is what exposed it as dead code.)
  return {
    m1: systemsLineEditable(spec, "a") ? pick(stored.m1, spec.m1) : spec.m1,
    b1: systemsLineEditable(spec, "a") ? pick(stored.b1, spec.b1) : spec.b1,
    m2: systemsLineEditable(spec, "b") ? pick(stored.m2, spec.m2) : spec.m2,
    b2: systemsLineEditable(spec, "b") ? pick(stored.b2, spec.b2) : spec.b2
  };
}

export function systemsPairInit(spec: SystemsPairSpecLike, value?: SystemsPairValue | null): LinePairInit {
  const p = systemsPairParams(spec, value);
  const window = { xMin: spec.xMin, xMax: spec.xMax, yMin: spec.yMin, yMax: spec.yMax };
  const domain = { start: exact(spec.xMin), step: ONE, count: 2 };
  return {
    a: { m: exact(p.m1), b: exact(p.b1), window, domain, policy: policyFor(spec.editLine1, p.m1, p.b1) },
    b: { m: exact(p.m2), b: exact(p.b2), window, domain, policy: policyFor(spec.editLine2, p.m2, p.b2) },
    labels: { a: "line 1", b: "line 2" }
  };
}

/** The assembled pair model for one authored problem at one persisted value. */
export const systemsPairModel = (spec: SystemsPairSpecLike, value?: SystemsPairValue | null): LinePairModel =>
  linePairCanonicalModel(systemsPairInit(spec, value));

export const systemsPairCanonical = (spec: SystemsPairSpecLike, value?: SystemsPairValue | null): LinePairCanonical =>
  makeLinePairCanonical(systemsPairInit(spec, value));

/**
 * THE ONLY WRITER of the persisted value. `lines` appears exactly when the pair differs from the
 * authored one, so a classic spec — and an untouched editable one — persists `{ x, y }` and
 * nothing else, forever.
 */
export function systemsPairPersist(
  spec: SystemsPairSpecLike,
  canonical: LinePairCanonical,
  x: number,
  y: number
): SystemsPairValue {
  const m1 = ratToNumber(canonical.a.m);
  const b1 = ratToNumber(canonical.a.b);
  const m2 = ratToNumber(canonical.b.m);
  const b2 = ratToNumber(canonical.b.b);
  const untouched = m1 === spec.m1 && b1 === spec.b1 && m2 === spec.m2 && b2 === spec.b2;
  return untouched ? { x, y } : { x, y, lines: { m1, b1, m2, b2 } };
}

/**
 * The point-on-line test, at the CURRENT lines rather than the authored ones. Integer-exact by the
 * same argument the widget already relies on: every coordinate and parameter here is an integer.
 *
 * Phase 2 note, recorded where the code is rather than only in a handoff: with editable lines the
 * graded claim "the point satisfies both relationships" has to be read against the lines as they
 * now stand, so `evaluate.ts` must consult `value.lines` when it is present. No authored spec
 * enables editing, so `evaluate.ts` is correct as written today for every shipped lesson.
 */
export function systemsPointOn(
  spec: SystemsPairSpecLike,
  value: SystemsPairValue | null | undefined,
  x: number,
  y: number
): { onA: boolean; onB: boolean } {
  const p = systemsPairParams(spec, value);
  return { onA: y === p.m1 * x + p.b1, onB: y === p.m2 * x + p.b2 };
}

/** Which line a `LineSlot` names in this surface's own vocabulary. */
export const systemsSlotLabel = (slot: LineSlot): string => (slot === "a" ? "line 1" : "line 2");

/** Slot ↔ the pair graph's editable representation id, so phase 2 does not re-derive the mapping. */
export const systemsSlotRep = (slot: LineSlot): "lineA" | "lineB" => (slot === "a" ? "lineA" : "lineB");

/* ------------------------------------------------------------------ *
 * equation-label layout                                               *
 * ------------------------------------------------------------------ */

/**
 * Where each line's equation label sits, as a PURE function of the state and the viewport.
 *
 * Extracted from the renderer (S215) because the first version clipped: right-anchored with a
 * fixed left clamp, it left the frame in 520 of 2,401 reachable states — including 32 of the 49
 * coincident ones, which is exactly the case the labels exist to teach. A clamp guessed against
 * one label length cannot be right for all of them, and a four-state spot check could not see it.
 * As a pure function the whole reachable space can be swept in a test, which is what pins it now.
 *
 * The rules, in order: anchor on the rightmost point of the line still inside the frame; clamp the
 * text box fully inside the plot; then, if the two labels still overlap, push them apart and clamp
 * again — coincident lines genuinely share an anchor, and both labels must stay readable.
 */
export type SystemsLabelBox = {
  readonly slot: LineSlot;
  readonly text: string;
  /** Right edge of the text (it is end-anchored), in viewBox units. */
  readonly x: number;
  /** Text baseline, in viewBox units. */
  readonly y: number;
  readonly width: number;
  /** The box's own edges, carried rather than recomputed: `x - width` in floating point is not
   * exactly the clamped left edge, and a caller checking containment that way sees phantom
   * escapes of 1e-14. The layout knows where it put the box; it says so. */
  readonly left: number;
  readonly top: number;
};

/** Advance width per character at fontSize 11 / weight 800, measured generously. */
const LABEL_CHAR_W = 6.1;
const LABEL_LINE_H = 11;
const LABEL_GAP = 15;

export function systemsLabelLayout(args: {
  readonly lines: { m1: number; b1: number; m2: number; b2: number };
  readonly equations: { a: string; b: string };
  readonly window: { xMin: number; xMax: number; yMin: number; yMax: number };
  readonly W: number;
  readonly H: number;
  readonly pad: number;
}): SystemsLabelBox[] {
  const { lines, equations, window: win, W, H, pad } = args;
  const sx = (x: number) => pad + ((x - win.xMin) / (win.xMax - win.xMin)) * (W - 2 * pad);
  const sy = (y: number) => H - pad - ((y - win.yMin) / (win.yMax - win.yMin)) * (H - 2 * pad);
  const anchor = (m: number, b: number) => {
    for (let x = win.xMax; x >= win.xMin; x -= 0.5) {
      const y = m * x + b;
      if (y >= win.yMin && y <= win.yMax) return { x, y };
    }
    // Entirely outside the frame vertically: sit at the edge it left through.
    return { x: win.xMin, y: Math.min(win.yMax, Math.max(win.yMin, m * win.xMin + b)) };
  };

  const build = (slot: LineSlot, m: number, b: number, text: string) => {
    const a = anchor(m, b);
    const width = text.length * LABEL_CHAR_W;
    return { slot, text, width, rawX: sx(a.x), rawY: sy(a.y) };
  };
  const raw = [
    build("a", lines.m1, lines.b1, equations.a),
    build("b", lines.m2, lines.b2, equations.b)
  ];

  const clampLeft = (rightEdge: number, width: number) =>
    Math.min(W - pad - width, Math.max(pad, rightEdge - width));
  const clampY = (y: number) => Math.min(H - pad, Math.max(pad + LABEL_LINE_H, y));

  // First pass: sit just above the line, inside the plot.
  const ys = raw.map((r) => clampY(r.rawY - 6));
  // Second pass: if they overlap, separate them about their midpoint, then re-clamp. Re-clamping
  // can push them back together against an edge, so the lower one is nudged down by whatever the
  // clamp took away — the plot is far taller than two lines of text, so this always converges.
  if (Math.abs(ys[0]! - ys[1]!) < LABEL_GAP) {
    const mid = (ys[0]! + ys[1]!) / 2;
    ys[0] = clampY(mid - LABEL_GAP / 2);
    ys[1] = clampY(mid + LABEL_GAP / 2);
    if (ys[1]! - ys[0]! < LABEL_GAP) ys[0] = clampY(ys[1]! - LABEL_GAP);
    if (ys[1]! - ys[0]! < LABEL_GAP) ys[1] = clampY(ys[0]! + LABEL_GAP);
  }
  return raw.map((r, i) => {
    const left = clampLeft(r.rawX, r.width);
    return { slot: r.slot, text: r.text, width: r.width, left, x: left + r.width, y: ys[i]!, top: ys[i]! - LABEL_LINE_H };
  });
}
