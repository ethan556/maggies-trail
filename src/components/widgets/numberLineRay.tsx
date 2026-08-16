"use client";

/**
 * numberLineRay — the renderer for MMIP engine gap G (S215).
 *
 * FIRST WIDGET IN ITS OWN MODULE. `src/components/widgets.tsx` is 16k lines and three workers deep;
 * the standing mandate (§21) prefers "new isolated module → tests → thin central integration" to
 * growing the monolith, so this engine ships as its own file and `widgets.tsx` gains exactly one
 * dispatch line. Nothing here is imported by that file at type level, so the wiring is a one-liner
 * with no ordering hazard.
 *
 * WHAT THE LEARNER DIRECTLY MANIPULATES — the mathematical object, not a proxy for it:
 *
 *   · the ENDPOINT itself: grab it and slide it along the line (pointer), or press ← / → on it
 *     (keyboard). Both go through the same `setBoundary` edit and the same declared snap/clamp.
 *   · the DOT: press it to open or close the endpoint. One point joins or leaves the solution set,
 *     and the picture, the words under the dot and the symbol all move together.
 *   · the RAY: press the arrow to turn it round about its own endpoint.
 *   · the SYMBOL: press it to turn the written relation round — the same state change reached from
 *     the other alphabet, which is the round trip this engine exists to make visible.
 *   · BOTH SIDES: a transform button multiplies both sides by its factor, and does ONLY that. If
 *     the factor is negative and the learner does not also turn the sign round, the ray reflects
 *     and stays reflected. Nothing here tells them off; the number line simply shows the solution
 *     set they now have, which is a different one. That is the lesson.
 *
 * The range slider and the ± steppers are SECONDARY precision/keyboard routes onto the identical
 * edits. Every state reachable by pointer is reachable by keyboard.
 *
 * NOTHING ON SCREEN ASSERTS ANYTHING IT CANNOT SEE. Every string comes from a derivation of the
 * canonical state (`model.views`), including the membership sentence, which is computed by
 * SUBSTITUTION rather than by reading the picture — so the ray and the claim "4 is not a solution"
 * are two derivations that must agree, not one of them quoted twice. No verdict, no "correct" chip,
 * no target text is rendered outside the reveal ghost.
 */

import { useCallback, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { MathProse } from "@/components/math/MathText";
import { PALETTE } from "@/lib/palette";
import { moveRelation, type ProcessEvent } from "@/lib/processEvents";
import type { TNumberLineRay } from "@/lib/schema";
import {
  createNumberLineRayGraph,
  describeRayChange,
  deriveSolution,
  makeRayCanonical,
  numberLineRayCanonicalModel,
  rayNumber,
  raySymbol,
  type NumberLineRayGraph,
  type NumberLineRayReps,
  type RayCanonical,
  type RayLineEdit,
  type RayRelationEdit,
  type RayTarget
} from "@/lib/mmip/numberLineRayModel";
import { rat, ratAdd, ratEq, ratFromNumber, ratSub, ratToNumber, type Rat } from "@/lib/mmip/lineFamilyModel";
import { stableKey, toSyncTransaction, type ApplyResult } from "@/lib/mmip/repSyncGraph";
import { transactionSentence, type EditOrigin } from "@/lib/mmip/mmipTypes";
import { equationMorphPlan, type MorphPlan } from "@/lib/mmip/equationMorph";
import { NO_MORPH, useMorphHistory, useMorphStage } from "@/lib/mmip/widgetMorph";

/* ─────────────────────────────── props + the persisted value ─────────────────────────────── */

/** Structurally the shared `WProps<TNumberLineRay>` of `widgets.tsx`, restated here so this module
 * has no import edge back into the monolith. */
export interface NumberLineRayProps {
  spec: TNumberLineRay;
  value: unknown;
  onChange: (v: unknown) => void;
  disabled: boolean;
  tone?: "neutral" | "success" | "error" | "info";
  onEvent?: (e: ProcessEvent) => void;
  locks?: readonly string[];
  seed?: string;
}

/** What the player persists: the mathematical claim, exactly, and nothing derived. */
export type NumberLineRayValue = {
  coeff: { n: number; d: number };
  constant: { n: number; d: number };
  relation: "lt" | "gt";
  inclusive: boolean;
};

const toValue = (c: RayCanonical): NumberLineRayValue => ({
  coeff: { n: c.coeff.n, d: c.coeff.d },
  constant: { n: c.constant.n, d: c.constant.d },
  relation: c.relation,
  inclusive: c.inclusive
});

const asRat = (v: { n: number; d: number }): Rat => rat(v.n, v.d);

/* ────────────────────────────────────── drawing frame ────────────────────────────────────── */

const VW = 320;
const VH = 104;
/** Half a 44 px control at the smallest supported width, so an endpoint parked on either end of
 * the line still has its whole target inside the frame. */
const PAD = 30;
const AXIS_Y = 44;
/** The literal notch between a HOLLOW dot and the start of the ray. Open and closed differ by a
 * gap you can see across the room, not by a fill you have to squint at. */
const OPEN_GAP = 10;
const DOT_R = 8;

const axisX = (t: number) => PAD + t * (VW - 2 * PAD);

/* ─────────────────────────────────────── the component ───────────────────────────────────── */

export function NumberLineRayW({ spec, value, onChange, disabled, tone, onEvent, locks }: NumberLineRayProps) {
  const model = useMemo(
    () =>
      numberLineRayCanonicalModel({
        coeff: asRat(spec.start.coeff),
        constant: asRat(spec.start.constant),
        relation: spec.start.relation,
        inclusive: spec.start.inclusive,
        variable: spec.variable,
        window: {
          min: asRat(spec.window.min),
          max: asRat(spec.window.max),
          tickStep: asRat(spec.window.tickStep)
        },
        policy: { step: asRat(spec.step), outOfRange: spec.outOfRange, offLattice: spec.offLattice }
      }),
    [spec]
  );

  // The props are the authority; the graph outlives renders and owns undo. An EXTERNAL change of
  // value (a restore, a reset by the player) clears the stack, because those moves belonged to a
  // position that no longer exists.
  const start = useMemo(() => model.normalize(value ?? model.initial), [model, value]);
  const graphRef = useRef<NumberLineRayGraph | null>(null);
  if (graphRef.current === null) graphRef.current = createNumberLineRayGraph(start);
  const graph = graphRef.current;
  if (graph.getState().key !== stableKey(start)) graph.reset(start, { history: "clear" });

  const canonical = graph.getCanonical();
  const views = model.views(canonical);
  const { line, relation, solution, membership } = views;
  /** Controls the adaptive layer has parked for a moment. Nothing else disables anything. */
  const locked = (id: string) => (locks ?? []).includes(id);

  /* ── motion + the live region (shared with every other MMIP adopter) ──────────────────── */
  const [notice, setNotice] = useState("");
  const { rootRef, stage } = useMorphStage<RayTarget>({ describe: (text) => setNotice(text) });
  const morphHistory = useMorphHistory<RayTarget>();
  const gestureRun = useRef<{ key: string; from: RayCanonical } | null>(null);
  const dragSeq = useRef(0);

  /** THE ONLY MUTATION PATH. Drags, presses, steppers, the slider and the transforms all arrive
   * here; nothing else touches the graph. */
  const commit = useCallback(
    (
      apply: () => ApplyResult<RayCanonical, NumberLineRayReps>,
      gestureKey: string,
      origin: EditOrigin
    ): "applied" | "unchanged" | "rejected" => {
      if (disabled) return "unchanged";
      const before = graph.getCanonical();
      const depthBefore = graph.history().length;
      const result = apply();
      const after = graph.getCanonical();
      const tx = toSyncTransaction(before, result, origin, describeRayChange(before, after));
      const clamp = result.origin.clamp;
      const sentence = clamp ? `${transactionSentence(tx)} ${clamp.reason}` : transactionSentence(tx);
      if (result.status === "applied") {
        const coalesced = graph.history().length === depthBefore && gestureRun.current?.key === gestureKey;
        const from = coalesced ? gestureRun.current!.from : before;
        const netPlan = equationMorphPlan(toSyncTransaction(from, result, origin, describeRayChange(from, after)));
        morphHistory.recordAs(coalesced ? "coalesce" : "push", netPlan);
        if (!coalesced) gestureRun.current = { key: gestureKey, from: before };
        if (onEvent && spec.target && spec.target.coeff.n !== 0) {
          const targetBoundary = ratToNumber(
            deriveSolution(
              makeRayCanonical({
                coeff: asRat(spec.target.coeff),
                constant: asRat(spec.target.constant),
                relation: spec.target.relation,
                inclusive: spec.target.inclusive
              })
            ).boundary
          );
          const dir = moveRelation(
            ratToNumber(deriveSolution(before).boundary),
            ratToNumber(deriveSolution(after).boundary),
            targetBoundary
          );
          if (dir) onEvent({ control: "boundary", dir, state: { boundary: ratToNumber(deriveSolution(after).boundary) } });
        }
      }
      stage(equationMorphPlan(tx), sentence, result.status === "rejected");
      if (result.status === "applied") onChange(toValue(after));
      return result.status;
    },
    [disabled, graph, morphHistory, onChange, onEvent, spec.target, stage]
  );

  const runLine = useCallback(
    (edit: RayLineEdit, gestureKey: string, origin: EditOrigin = "physical") =>
      commit(() => graph.apply("line", edit, { gesture: gestureKey }), gestureKey, origin),
    [commit, graph]
  );
  const runRelation = useCallback(
    (edit: RayRelationEdit, gestureKey: string, origin: EditOrigin = "symbolic") =>
      commit(() => graph.apply("relation", edit, { gesture: gestureKey }), gestureKey, origin),
    [commit, graph]
  );

  const undo = () => {
    if (disabled || !graph.canUndo()) return;
    const reverse = morphHistory.takeReverse();
    gestureRun.current = null;
    const state = graph.undo();
    if (!state) return;
    stage(reverse ?? (NO_MORPH as MorphPlan<RayTarget>), "Stepped back to the relation before that move.");
    onChange(toValue(state.canonical));
  };

  /* ── pointer drag on the endpoint ────────────────────────────────────────────────────── */

  const svgRef = useRef<SVGSVGElement | null>(null);
  const drag = useRef<{ id: number; moved: boolean; gesture: string } | null>(null);
  const suppressClick = useRef(false);

  const boundaryAtClientX = (clientX: number): Rat | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const box = svg.getBoundingClientRect();
    if (!box.width) return null; // jsdom / hidden: nothing to map, so nothing happens
    const vx = ((clientX - box.left) / box.width) * VW;
    const t = (vx - PAD) / (VW - 2 * PAD);
    const min = ratToNumber(canonical.window.min);
    const max = ratToNumber(canonical.window.max);
    return ratFromNumber(min + t * (max - min), 10_000);
  };

  const onEndpointPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || locked("endpoint")) return;
    dragSeq.current += 1;
    drag.current = { id: e.pointerId, moved: false, gesture: `drag-endpoint-${dragSeq.current}` };
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* capture is an enhancement; jsdom and some engines lack it */
    }
  };
  const onEndpointPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const wanted = boundaryAtClientX(e.clientX);
    if (!wanted) return;
    if (runLine({ kind: "setBoundary", value: wanted }, d.gesture) === "applied") d.moved = true;
  };
  const endDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    // A drag that moved the boundary is not also a tap on the dot.
    suppressClick.current = d.moved;
    gestureRun.current = null;
  };

  /* ── the edits, by name ──────────────────────────────────────────────────────────────── */

  const step = canonical.policy.step;
  const nudge = (sign: 1 | -1) => {
    let wanted: Rat;
    try {
      wanted = sign > 0 ? ratAdd(solution.boundary, step) : ratSub(solution.boundary, step);
    } catch {
      return; // exact range exhausted: the model would refuse anyway, and silently is fine here
    }
    runLine({ kind: "setBoundary", value: wanted }, "boundary-step");
  };
  const toggleDot = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    runLine({ kind: "toggleInclusive" }, "inclusive");
  };
  const flipRay = () => runLine({ kind: "flipRay" }, "direction");
  const flipSymbol = () => runRelation({ kind: "flipRelationSymbol" }, "symbol");

  const [constantDraft, setConstantDraft] = useState<string | null>(null);
  const typeConstant = (raw: string) => {
    const parsed = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(parsed)) {
      // A half-typed "−" is a DRAFT, not a claim (MMIP invariant 1). It is kept only while it
      // cannot be read as a number; the instant it can, the field shows the model's own value, so
      // the strip can never display a right-hand side the relation does not hold.
      setConstantDraft(raw);
      return;
    }
    setConstantDraft(null);
    runRelation({ kind: "setConstant", value: ratFromNumber(parsed, 10_000) }, "constant");
  };

  /* ── testing a value: a QUESTION about the relation, so it lives in the view ─────────── */

  const [probe, setProbe] = useState<Rat | null>(null);
  const probeIndex = (() => {
    if (probe) {
      const found = membership.samples.findIndex((s) => ratEq(s.value, probe));
      if (found >= 0) return found;
    }
    return membership.boundaryIndex >= 0 ? membership.boundaryIndex : 0;
  })();
  const probeSample = membership.samples[probeIndex];
  const stepProbe = (delta: 1 | -1) => {
    const next = membership.samples[probeIndex + delta];
    if (next) setProbe(next.value);
  };

  /* ── the reveal ghost: the ONLY place a target is ever rendered ──────────────────────── */

  const ghost =
    tone === "info" && spec.target && spec.target.coeff.n !== 0
      ? deriveSolution(
          makeRayCanonical({
            coeff: asRat(spec.target.coeff),
            constant: asRat(spec.target.constant),
            relation: spec.target.relation,
            inclusive: spec.target.inclusive,
            variable: spec.variable
          })
        )
      : null;

  /* ── geometry ────────────────────────────────────────────────────────────────────────── */

  const endpointX = axisX(Math.min(1, Math.max(0, line.boundaryT)));
  const rayTo = line.direction === "greater" ? VW - 6 : 6;
  const rayFrom = line.direction === "greater"
    ? endpointX + (line.filled ? 0 : OPEN_GAP)
    : endpointX - (line.filled ? 0 : OPEN_GAP);
  const pct = (v: number, total: number) => `${(v / total) * 100}%`;
  /**
   * Position only — NEVER size. A control laid over the picture keeps its 44 CSS px box while the
   * viewBox around it shrinks with the viewport, so any separation expressed in viewBox units is a
   * guarantee at exactly one width. That is why exactly ONE control lives here (the endpoint) and
   * the ray's own control sits in a flow row beneath: two fixed-size boxes in a scaled space cannot
   * be kept apart by construction. Size comes from `h-11 w-11`, so the repo's class-based
   * touch-target contract can SEE the 44 px that is already true.
   */
  const overlay = (x: number, y: number) => ({
    position: "absolute" as const,
    left: pct(x, VW),
    top: pct(y, VH),
    transform: "translate(-50%, -50%)"
  });

  const flippedRelationText = `${relation.leftText} ${raySymbol(relation.relation === "lt" ? "gt" : "lt", relation.inclusive)} ${relation.rightText}`;

  return (
    <div className="grid gap-3" ref={rootRef} data-testid="nlr-root">
      <p className="text-lg font-bold"><MathProse text={spec.prompt} /></p>

      {/* ───────── the number line: the mathematical object, and the primary control ───────── */}
      <div className="relative mx-auto w-full max-w-md">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          className="w-full rounded-2xl border border-ink/10 bg-white"
          role="img"
          data-testid="nlr-line"
          aria-label={`${line.sentence} ${solution.boundarySentence}`}
        >
          <defs>
            <marker id="nlr-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={PALETTE.sky} />
            </marker>
          </defs>

          {/* the axis */}
          <line x1={8} y1={AXIS_Y} x2={VW - 8} y2={AXIS_Y} stroke={PALETTE.ink} strokeOpacity={0.45} strokeWidth={1.5} />
          {line.ticks.map((tick) => (
            <g key={tick.text}>
              <line x1={axisX(tick.t)} y1={AXIS_Y - 5} x2={axisX(tick.t)} y2={AXIS_Y + 5} stroke={PALETTE.ink} strokeOpacity={0.45} />
              <text x={axisX(tick.t)} y={AXIS_Y + 19} fontSize="9" fontWeight="700" textAnchor="middle" fill={PALETTE.ink}>
                {tick.text}
              </text>
            </g>
          ))}

          {/* the ray — thick, arrow-headed, and starting at a VISIBLE gap when the endpoint is open */}
          <line
            data-testid="nlr-ray"
            data-morph-actor="direction:ray boundary:ray"
            data-open-gap={line.filled ? "0" : String(OPEN_GAP)}
            x1={rayFrom}
            y1={AXIS_Y}
            x2={rayTo}
            y2={AXIS_Y}
            stroke={PALETTE.sky}
            strokeWidth={6}
            strokeLinecap="butt"
            markerEnd="url(#nlr-arrow)"
          />

          {/* the endpoint: shape AND a gap AND words — three channels, none of them colour */}
          <circle
            data-testid="nlr-dot"
            data-morph-actor="boundary:ray inclusive:endpoint"
            data-filled={line.filled ? "true" : "false"}
            cx={endpointX}
            cy={AXIS_Y}
            r={DOT_R}
            fill={line.filled ? PALETTE.sky : "#ffffff"}
            stroke={PALETTE.sky}
            strokeWidth={3}
          />
          <text
            data-testid="nlr-endpoint-label"
            x={Math.min(VW - 46, Math.max(46, endpointX))}
            y={AXIS_Y - 16}
            fontSize="10"
            fontWeight="900"
            textAnchor="middle"
            fill={PALETTE.ink}
          >
            {line.endpointLabel}
          </text>

          {ghost && (
            <text data-testid="nlr-ghost" x={VW / 2} y={VH - 6} fontSize="10" fontWeight="900" textAnchor="middle" fill={PALETTE.tangerine} aria-hidden="true">
              the target set is {ghost.text}
            </text>
          )}
        </svg>

        {/* The endpoint AS A CONTROL: 44×44, focusable, draggable, arrow-key movable, and it says
            in words what pressing it will do. */}
        <button
          type="button"
          data-testid="nlr-endpoint"
          /** Declares "I am a fixed-size target inside a scaled space" — the sweep in this engine's
           * widget suite finds every one of these and refuses to let a second appear too close. */
          data-overlay="picture"
          disabled={disabled || locked("endpoint")}
          style={{ ...overlay(endpointX, AXIS_Y), touchAction: "none" }}
          className="h-11 w-11 rounded-full border-2 border-transparent focus-visible:border-sky"
          aria-label={
            `The endpoint of the solution set is at ${line.boundaryText}, and ${line.boundaryText} is ` +
            `${line.filled ? "" : "not "}a solution. Press Enter to ${line.filled ? "leave it out of" : "put it into"} the ` +
            `solution set. Use the left and right arrow keys to move the endpoint by ${rayNumber(step)}.`
          }
          onPointerDown={onEndpointPointerDown}
          onPointerMove={onEndpointPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={toggleDot}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              nudge(e.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          <span className="sr-only">{solution.sentence}</span>
        </button>

      </div>

      {/*
        THE RAY AS A CONTROL — a full-width row directly under the line it turns, not a puck ON it.
        A puck on the ray was the first design and it was wrong: the endpoint can be dragged to
        either end of the drawn window, and at the end the ray points toward there is no runway
        left, so a 44 px puck and the 44 px endpoint handle became EXACTLY COINCIDENT (reachable in
        one over-drag under this engine's own `outOfRange: "clamp"` policy). Two targets on the same
        pixels means one of them is unreachable and the learner cannot tell which they are about to
        hit. Moving into flow makes the separation a property of the document, not of a viewport.
        The ray is still what is pressed: the button's face is the arrow, and its accessible name is
        unchanged.
      */}
      <button
        type="button"
        data-testid="nlr-direction"
        disabled={disabled || locked("direction")}
        onClick={flipRay}
        className="pressable flex min-h-11 w-full items-center justify-center gap-3 rounded-card border-2 border-sky/45 px-3 text-sm font-extrabold text-sky-ink disabled:opacity-40"
        aria-label={
          `The ray runs toward ${line.direction === "greater" ? "larger" : "smaller"} numbers: ${solution.sentence}. ` +
          "Press Enter to turn it round."
        }
      >
        <span aria-hidden="true" className="text-xl font-black">
          {line.direction === "greater" ? "→" : "←"}
        </span>
        <span>ray runs toward {line.direction === "greater" ? "larger" : "smaller"} numbers</span>
        <span aria-hidden="true" className="text-xs font-bold opacity-70">
          turn it round
        </span>
      </button>

      {/* ───────── the relation, editable in the other alphabet ───────── */}
      <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="The inequality as written">
        <span
          data-testid="nlr-coeff"
          data-morph-actor="coefficient:left"
          className="flex min-h-11 items-center rounded-card border-2 border-ink/15 bg-white px-3 text-xl font-black tabular-nums"
        >
          {relation.leftText}
          <span className="sr-only">
            {relation.coeffSlot.meaning}. This one is fixed: {relation.coeffSlot.lockedReason}.
          </span>
        </span>

        <button
          type="button"
          data-testid="nlr-symbol"
          disabled={disabled || locked("symbol")}
          onClick={flipSymbol}
          className="pressable flex min-h-11 min-w-11 items-center justify-center rounded-card border-2 border-sky/45 px-3 text-2xl font-black text-sky-ink disabled:opacity-40"
          aria-label={`The relation symbol is ${relation.symbol}. Press Enter to turn it round: ${relation.text} would become ${flippedRelationText}.`}
        >
          <span aria-hidden="true">{relation.symbol}</span>
        </button>

        <label className="flex min-h-11 items-center gap-2 rounded-card border-2 border-ink/15 bg-white px-2">
          <span className="sr-only">{relation.constantSlot.meaning}</span>
          <input
            type="number"
            data-testid="nlr-constant"
            data-morph-actor="coefficient:right constant:right"
            disabled={disabled || locked("constant")}
            value={constantDraft ?? String(ratToNumber(canonical.constant))}
            min={relation.constantSlot.min}
            max={relation.constantSlot.max}
            step={relation.constantSlot.step}
            aria-label={relation.constantSlot.meaning}
            onChange={(e) => typeConstant(e.target.value)}
            onBlur={() => setConstantDraft(null)}
            /* S242 / ACC-01. `outline-none` with no replacement: this input was keyboard-reachable
               and gave no sign of it. It sits on a transparent background inside a label, so the
               app's ring pattern reads better here than a border change. */
            className="h-11 w-20 rounded-card bg-transparent text-center text-xl font-black tabular-nums outline-none transition-shadow focus:ring-2 focus:ring-sky/25 disabled:opacity-60"
          />
        </label>

        <button
          type="button"
          data-testid="nlr-inclusive"
          disabled={disabled || locked("inclusive")}
          aria-pressed={line.filled}
          onClick={() => runLine({ kind: "toggleInclusive" }, "inclusive", "control")}
          className="pressable min-h-11 rounded-card border-2 border-sky/45 px-3 text-sm font-extrabold text-sky-ink disabled:opacity-40"
          aria-label={`${solution.boundarySentence} Press Enter to ${line.filled ? "take it out" : "put it in"}.`}
        >
          {line.filled ? "endpoint included" : "endpoint left out"}
        </button>
      </div>

      {/* the solved form: derived, read-only, and the same claim as the picture */}
      <p data-testid="nlr-solution" className="text-center text-lg font-extrabold tabular-nums" aria-live="polite">
        {solution.text} <span className="font-bold text-ink/70">{solution.interval}</span>
      </p>

      {/* ───────── secondary precision: the same edits by slider and stepper ───────── */}
      <div className="flex items-center gap-2" role="group" aria-label="Move the endpoint">
        <button
          type="button"
          data-testid="nlr-boundary-down"
          disabled={disabled || locked("boundary")}
          onClick={() => nudge(-1)}
          aria-label={`Move the endpoint down by ${rayNumber(step)}`}
          className="pressable flex h-11 w-11 items-center justify-center rounded-card border-2 border-sky/40 text-lg font-black text-sky-ink disabled:opacity-40"
        >
          −
        </button>
        <input
          type="range"
          data-testid="nlr-boundary-range"
          disabled={disabled || locked("boundary")}
          min={ratToNumber(canonical.window.min)}
          max={ratToNumber(canonical.window.max)}
          step={ratToNumber(step)}
          value={ratToNumber(solution.boundary)}
          aria-label="Where the solution set begins"
          aria-valuetext={solution.sentence}
          onChange={(e) => runLine({ kind: "setBoundary", value: ratFromNumber(Number(e.target.value), 10_000) }, "boundary-range", "control")}
          className="h-11 w-full accent-sky"
        />
        <button
          type="button"
          data-testid="nlr-boundary-up"
          disabled={disabled || locked("boundary")}
          onClick={() => nudge(1)}
          aria-label={`Move the endpoint up by ${rayNumber(step)}`}
          className="pressable flex h-11 w-11 items-center justify-center rounded-card border-2 border-sky/40 text-lg font-black text-sky-ink disabled:opacity-40"
        >
          +
        </button>
      </div>

      {/* ───────── both-sides moves ───────── */}
      {spec.transforms.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Moves that act on both sides">
          {spec.transforms.map((t) => (
            <button
              key={t.id}
              type="button"
              data-testid={`nlr-transform-${t.id}`}
              disabled={disabled || locked("transform")}
              onClick={() => runRelation({ kind: "scaleBothSides", factor: asRat(t.factor) }, `transform-${t.id}`, "control")}
              className="pressable min-h-11 rounded-card border-2 border-tangerine/50 px-3 text-sm font-extrabold text-tangerine-ink disabled:opacity-40"
              aria-label={`${t.label}. This changes both sides only; the relation symbol stays as it is.`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ───────── test a value: membership by substitution ───────── */}
      {probeSample && (
        <div className="rounded-xl border border-ink/12 p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold">Test a value</span>
            <button
              type="button"
              data-testid="nlr-probe-down"
              disabled={disabled || probeIndex === 0}
              onClick={() => stepProbe(-1)}
              aria-label="Test the next value down"
              className="pressable flex h-11 w-11 items-center justify-center rounded-card border-2 border-ink/20 text-lg font-black disabled:opacity-35"
            >
              −
            </button>
            <span data-testid="nlr-probe-value" className="min-w-11 text-center text-lg font-black tabular-nums">
              {probeSample.text}
            </span>
            <button
              type="button"
              data-testid="nlr-probe-up"
              disabled={disabled || probeIndex >= membership.samples.length - 1}
              onClick={() => stepProbe(1)}
              aria-label="Test the next value up"
              className="pressable flex h-11 w-11 items-center justify-center rounded-card border-2 border-ink/20 text-lg font-black disabled:opacity-35"
            >
              +
            </button>
            {membership.boundaryIndex >= 0 && (
              <button
                type="button"
                data-testid="nlr-probe-endpoint"
                disabled={disabled}
                onClick={() => setProbe(membership.samples[membership.boundaryIndex].value)}
                aria-label={`Test the endpoint, ${line.boundaryText}`}
                className="pressable min-h-11 rounded-card border-2 border-ink/20 px-3 text-xs font-extrabold disabled:opacity-35"
              >
                test the endpoint
              </button>
            )}
          </div>
          <p data-testid="nlr-membership" className="mt-2 text-sm font-semibold" aria-live="polite">
            {probeSample.sentence}
          </p>
        </div>
      )}

      {/* What the last move did, and any clamp. Mounted unconditionally so a refusal is never
          silent, visually hidden so the authored surface looks exactly as it does without it. */}
      <p data-testid="nlr-status" className="sr-only" role="status" aria-live="polite">
        {notice}
      </p>

      <div className="flex justify-center gap-2">
        {!disabled && graph.canUndo() && (
          <button
            type="button"
            data-testid="nlr-undo"
            onClick={undo}
            className="pressable min-h-11 rounded-card border-2 border-ink/20 px-4 py-2 text-sm font-bold dark:border-paper/25"
          >
            Undo last move
          </button>
        )}
      </div>
    </div>
  );
}

export default NumberLineRayW;
