import type { TWidget } from "./schema";
import {
  systemsPairModel,
  systemsPairParams,
  systemsPointOn,
  type SystemsPairValue
} from "./mmip/systemsPairAdapter";
import { compoundEventChoiceCorrect, compoundEventFavourable, compoundEventTotal, compositeAreaChoiceCorrect, compositeAreaPieceArea, compositeAreaTarget, distributionGapUnits, distributionOverlapFraction, dotPlotLabel, trialProbabilityClaimCount, scaledCircleChoiceCorrect, scaledCircleTarget, percentChangeAmount, percentChangeChoiceCorrect, percentChangeTarget, equationOutcomeTruth, equationTransformApply, equationTransformTruth, signedFractionTruth, triangleClosureChoiceCorrect, triangleClosureForms, triangleClosureSpan, conditionalTableReadTruth, proportionalReasoningExplorationKeys, proportionalReasoningTruth, placeValueTransformExplorationKeys, placeValueTransformTruth, pointSetReasoningExplorationKeys, pointSetReasoningTruth, geometricConstraintExplorationKeys, geometricConstraintTruth, exactNumberExplorationKeys, exactNumberTruth, affineRelationshipExplorationKeys, affineRelationshipTruth, quotientReasoningExplorationKeys, quotientReasoningTruth, quotientRationalKey, quotientRationalDisplay, graphStoryTruth } from "./schema";
import {
  binomialExpand,
  rootsFormCoefs,
  shapePartCount,
  riemannEstimate,
  exactArea,
  accumFnAt,
  accumAreaAt,
  circleReadout,
  lawOfCosinesSide,
  lawOfCosinesAngle,
  circleMeasureReadout,
  signChartCuts,
  signChartSigns,
  sliceInterval,
  sliceExact,
  sliceEstimate,
  taylorFn,
  taylorPartial, traceSlopeAt, traceSecondAt } from "./evaluate";
import { sequenceReasoningTruth } from "./schema";
/** numeric's live preview: the SAME resolver the renderer draws from, so the spoken sentence
 * and the drawn partition bar can never disagree (see the rotationLab note below). */
import { numericPreviewParts } from "./schema";
/** rotationLab's image and self-mapping test — the SAME functions the renderer and the grader
 * call, so the spoken description and the picture can never disagree. */
import { rotationLabImage, rotationLabMapsOntoSelf } from "./schema";
/** numberLineRay: the state and its solution set are derived through the engine's OWN model —
 * never reformatted here — so the spoken description and the drawn ray can never disagree about
 * what "greater than" or "included" means for a given coeff/constant/relation. */
import { deriveLine, deriveRelationView, makeRayCanonical, normalizeRayCanonical } from "./mmip/numberLineRayModel";
import { rat } from "./mmip/lineFamilyModel";

/**
 * Plain-language "what's on screen right now" for the densest lab widgets — the
 * ones whose state lives in an SVG a screen reader can't walk. Returns null for
 * widgets whose controls already narrate themselves (steppers, sliders with
 * labelled readouts, discrete choices).
 *
 * Contract: pure, deterministic, and derived from the SAME spec + value the
 * grader reads, so the description can never disagree with the picture.
 * Rendered on demand inside a <details> panel — not aria-live — so it informs
 * without chattering over every drag.
 */
const fmt = (n: number): string => (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)));

/** S237. Sentence-case a fragment that lost its leading clause. Removing the internal task token
 * from these descriptions left the stage list as the opening words, which begins lowercase. */
const sentence = (text: string): string => (text ? text[0].toUpperCase() + text.slice(1) : text);

/** S237. describeState branched only on perpBisector, so the other six classical constructions were
 * all narrated as "a regular hexagon stepped around the circle". Seven of the eight authored
 * compassConstruct lessons use a non-perpBisector mode, so seven were described wrongly. */
const COMPASS_GOAL: Record<string, string> = {
  perpBisector: "the perpendicular bisector of the segment",
  hexagon: "a regular hexagon stepped around the circle",
  angleBisector: "the bisector of the angle",
  perpAtPoint: "the perpendicular to the line at the marked point",
  perpFromPoint: "the perpendicular from the point to the line",
  parallelThroughPoint: "the parallel to the line through the marked point",
  copyAngle: "a copy of the given angle at the new ray",
};

/** S237. numeric's live partition preview is aria-hidden like every other live preview, so its
 * fraction is spoken here instead of being lost. Both morphologies are STORED, never derived:
 * "1 parts are shaded" is a shipping defect in this codebase, and so is "1 parts is shaded". */
const PART_NOUN = { one: "part", many: "parts" } as const;
const PART_VERB = { one: "is", many: "are" } as const;
const partNoun = (n: number): string => (n === 1 ? PART_NOUN.one : PART_NOUN.many);
const partVerb = (n: number): string => (n === 1 ? PART_VERB.one : PART_VERB.many);

/** S237. conditionalTableLab's readMetric is an internal discriminant; learners heard
 * "The target rowTotal uses 20." These are ordinary statistics names, so they get spoken as such. */
const CONDITIONAL_TABLE_METRIC: Record<string, string> = {
  cell: "cell count",
  rowTotal: "row total",
  colTotal: "column total",
  grandTotal: "grand total",
  relativeWhole: "relative frequency of the whole table",
  relativeRow: "relative frequency within the row",
  relativeCol: "relative frequency within the column",
};

export function describeWidgetState(spec: TWidget, value: unknown): string | null {
  switch (spec.type) {
    case "numeric": {
      // A plain numeric entry narrates itself — one labelled text field — so this stays null
      // for every step that declares no `previewDenominator`, and those steps get no panel,
      // exactly as before. When the field IS set the widget draws a partition bar that is
      // aria-hidden (the fractionEntry/pointEntry previews have no spoken twin at all — the
      // known gap this branch exists NOT to repeat), so the same fraction is spoken here.
      //
      // Resolved through `numericPreviewParts`, the SAME function the renderer draws from, so
      // the sentence cannot claim a bar the screen does not show. The answer is never stated:
      // only the learner's own entry and the denominator the prompt already gave them.
      const preview = numericPreviewParts(spec, value);
      if (!preview) return null;
      const { wholes, shaded, total } = preview;
      const barNoun = wholes === 1 ? "bar" : "bars";
      // An improper entry is DRAWN as whole bars plus a remainder, so it is SPOKEN that way
      // too. Saying "5 of 3, every part shaded" would describe a single full bar — a picture
      // that is not on screen and a quantity smaller than what the learner typed.
      if (wholes > 0) {
        const head = `You entered ${shaded === 0 ? wholes * total : shaded + wholes * total} of ${total}. `;
        const body =
          shaded === 0
            ? `That fills ${wholes} whole ${barNoun} exactly.`
            : `That is ${wholes} whole ${barNoun} and ${shaded} of ${total} ${partNoun(total)} of another.`;
        return head + body;
      }
      return (
        `You entered ${shaded} of ${total}. ` +
        `The bar is cut into ${total} equal ${partNoun(total)}, ` +
        `and ${shaded} ${partNoun(shaded)} ${partVerb(shaded)} shaded.`
      );
    }
    case "scaledCircleLab": {
      const picked = typeof value === "string" ? spec.choices.find((choice) => choice.id === value) : undefined;
      const scale = spec.drawingRadius !== undefined && spec.scale !== undefined
        ? `A drawing radius of ${spec.drawingRadius} scales by ${spec.scale} to real radius ${spec.realRadius}. `
        : `The real radius is ${spec.realRadius}. `;
      const ask = spec.ask === "realRadius" ? "real radius" : spec.ask === "circumferenceCoef" ? "circumference coefficient of pi" : "area coefficient of pi";
      return `${scale}The target ${ask} is ${scaledCircleTarget(spec)}. ${picked ? `Selected ${picked.label}${scaledCircleChoiceCorrect(spec, picked) ? ", matching the model." : ", not matching the model."}` : "No circle claim selected."}`;
    }
    case "percentChangeLab": {
      const picked = typeof value === "string" ? spec.choices.find((choice) => choice.id === value) : undefined;
      const amount = percentChangeAmount(spec);
      const target = percentChangeTarget(spec);
      const sign = spec.direction === "markup" ? "plus" : "minus";
      return `Base price ${spec.currency}${fmt(spec.base)}. ${spec.percent} percent gives a change of ${spec.currency}${fmt(amount)}. ${spec.direction} means ${spec.currency}${fmt(spec.base)} ${sign} ${spec.currency}${fmt(amount)}, for ${spec.currency}${fmt(target)}. ${picked ? `Selected ${picked.label}${percentChangeChoiceCorrect(spec, picked) ? ", matching the price model." : ", not matching the price model."}` : "No final-price claim selected."}`;
    }
    case "equationOutcomeLab": {
      if((spec.mode ?? "classify")==="classify"){
        const selected = typeof value === "string" ? spec.choices.find((choice) => choice.id === value) : undefined;
        // S237. `equationOutcomeTruth` IS the graded answer — les-02-01 asks how many solutions
        // the equation has and this stated "outcome none". The equation itself is the given and
        // stays; the outcome is now withheld on classification steps exactly as the visible truth
        // panel is (widgets.tsx), so both channels ask the same work of the learner.
        // S237b. Withholding the outcome dropped this below the s44 substance floor and left the
        // panel narrating less than the screen: the widget prints the collected-terms residue in
        // its own dashed panel and states it in the section's aria-label, and equationOutcome.s141
        // pins that residue as deliberately exposed. Narrating it restores parity, not the answer.
        const residue = Math.abs(spec.leftCoeff - spec.rightCoeff) < 1e-9
          ? `${spec.leftConstant} = ${spec.rightConstant}`
          : `${spec.leftCoeff - spec.rightCoeff}x = ${spec.rightConstant - spec.leftConstant}`;
        return `Equation ${spec.leftDisplay} equals ${spec.rightDisplay}. Collecting like terms leaves ${residue}.${spec.choices?.length ? "" : ` Normalized outcome ${equationOutcomeTruth(spec)}.`} ${selected ? `Selected ${selected.label}.` : "No claim selected."}`;
      }
      const state=value&&typeof value==="object"&&!Array.isArray(value)?value as {stageIds?:string[];numeric?:number|""}:{};
      const ids=Array.isArray(state.stageIds)?state.stageIds:[],byId=new Map((spec.operations ?? []).map(operation=>[operation.id,operation]));
      let current={leftCoeff:spec.leftCoeff,leftConstant:spec.leftConstant,rightCoeff:spec.rightCoeff,rightConstant:spec.rightConstant,relation:spec.relation};
      for(const id of ids){const operation=byId.get(id);if(operation)current=equationTransformApply(current,operation)}
      const truth=equationTransformTruth(spec),symbol=current.relation==="eq"?"equals":current.relation==="lt"?"is less than":current.relation==="le"?"is at most":current.relation==="gt"?"is greater than":"is at least";
      // S237. The entered-boundary clause is optional, and interpolating it after a literal space
      // left "… plus 10. " — a trailing space on all 8 authored transform instances, the dangling
      // -fragment class. Joined instead of concatenated, so an absent clause leaves no trace.
      const entered = spec.answerMode==="numeric"&&typeof state.numeric==="number"
        ? `Entered boundary ${state.numeric}; exact boundary ${truth.answerNumber}.`
        : "";
      return [
        `Transformation workbench.`,
        `${ids.length} of ${spec.operations.length} operations applied.`,
        `Current normalized sides are ${current.leftCoeff}${spec.variable} plus ${current.leftConstant} ${symbol} ${current.rightCoeff}${spec.variable} plus ${current.rightConstant}.`,
        entered,
      ].filter(Boolean).join(" ");
    }
    case "signedFractionLab": {
      const selected = typeof value === "string" ? spec.choices.find((choice) => choice.id === value) : undefined;
      const truth = signedFractionTruth(spec);
      const sign = truth.sign < 0 ? "negative" : "positive";
      return `Signed fraction ${spec.operation}. The derived result has ${sign} sign and magnitude ${truth.num}/${truth.den}. ${selected ? `Selected ${selected.label}.` : "No exact claim selected."}`;
    }
    case "triangleClosureLab": {
      const state = value && typeof value === "object" ? value as { angle?: number; moves?: number; choice?: string } : {};
      const angle = typeof state.angle === "number" ? state.angle : spec.angleStart;
      const [a, b, c] = [...spec.sides].sort((x, y) => x - y);
      const span = triangleClosureSpan(a, b, angle);
      const picked = state.choice ? spec.choices.find((choice) => choice.id === state.choice) : undefined;
      return `Two hinged beams are ${a} and ${b}; the comparison beam is ${c}. At ${angle} degrees their endpoint span is ${fmt(span)}. The side lengths ${triangleClosureForms(spec.sides) ? "can" : "cannot"} form a triangle. ${picked ? `Selected ${picked.label}${triangleClosureChoiceCorrect(spec, picked) ? ", matching the side-length test." : ", not matching the side-length test."}` : "No frame claim selected."}`;
    }
    case "compoundEventLab": {
      const total = compoundEventTotal(spec);
      const favourable = compoundEventFavourable(spec);
      const factors = spec.stages.map((stage) => stage.outcomes.length).join(" times ");
      const picked = typeof value === "string" ? spec.choices.find((choice) => choice.id === value) : undefined;
      const base = spec.mode === "count"
        ? `${spec.stages.length} stages have ${factors} choices, making ${total} ordered outcomes.`
        : `${spec.stages.length} stages make ${total} ordered outcomes; ${favourable} satisfy every favourable condition.`;
      return picked ? `${base} Selected claim: ${picked.label}${compoundEventChoiceCorrect(spec, picked) ? ", which matches the model." : ", which does not match the model."}` : `${base} No claim selected.`;
    }
    case "compositeAreaLab": {
      const target = compositeAreaTarget(spec);
      const selected = typeof value === "string" ? spec.choices.find((choice) => choice.id === value) : undefined;
      const pieces = spec.pieces.map((piece) => {
        const sign = piece.operation === "subtract" ? "subtract" : "add";
        return `${sign} ${piece.label}, area ${compositeAreaPieceArea(piece)}`;
      }).join("; ");
      const claim = selected ? `Selected claim ${selected.label}${compositeAreaChoiceCorrect(spec, selected) ? ", matching the model" : ", not matching the model"}.` : "No area claim selected.";
      return `${spec.scene.replaceAll("-", " ")}: ${pieces}. The derived target is ${target} square units. ${claim}`;
    }
    case "trialProbabilityLab": {
      const picked = typeof value === "string" ? spec.choices.find((choice) => choice.id === value) : undefined;
      const evidence = spec.mode === "experimental"
        ? `${spec.favourable} ${spec.successLabel} out of ${spec.total} ${spec.totalLabel}`
        : `${spec.favourable} favourable outcomes out of ${spec.total} equally likely outcomes`;
      if (!picked) return `${evidence}. No probability fraction is selected.`;
      const claimed = trialProbabilityClaimCount(spec, picked);
      const claimText = Number.isInteger(claimed) ? String(claimed) : Number(claimed.toFixed(2)).toString();
      return `${evidence}. The selected fraction ${picked.label} predicts ${claimText} favourable outcomes out of the same total.`;
    }
    case "distributionCompareLab": {
      const gap = distributionGapUnits(spec);
      const overlap = Math.round(distributionOverlapFraction(gap) * 100);
      if (spec.mode === "measure") {
        const chosen = typeof value === "number" ? `${value} variability-units selected` : "no gap measurement selected";
        return `${spec.groupALabel} mean ${spec.meanA}; ${spec.groupBLabel} mean ${spec.meanB}; one variability-width is ${spec.variability}. The derived mean gap is ${gap} variability-units, with about ${overlap}% visual overlap. ${chosen}.`;
      }
      const picked = typeof value === "string" ? spec.judgeOptions.find((o) => o.id === value)?.label : null;
      return `Two equal-spread distributions are ${gap} variability-units apart, with about ${overlap}% visual overlap. ${picked ? `Selected conclusion: ${picked}.` : "No conclusion selected."}`;
    }
    case "dotPlot": {
      if (!spec.given || spec.askIndex === undefined) return null; // build mode narrates via its sliders
      const v = (value as number[] | null) ?? null;
      const lbl = (i: number) => dotPlotLabel(spec.values[i], spec.denominator);
      const stacks = spec.values.map((_, i) => `${(spec.given as number[])[i]} X above ${lbl(i)}`).join(", ");
      const askL = lbl(spec.askIndex);
      if (!v || v.every((c) => c === 0))
        return `A line plot with ${stacks}. The question asks about the stack above ${askL}; no X is counted yet.`;
      const counted = v.reduce((a, c) => a + c, 0);
      return `A line plot with ${stacks}. ${counted} X ${counted === 1 ? "is" : "are"} counted so far${v[spec.askIndex] > 0 ? `, ${v[spec.askIndex]} of them above ${askL}` : ""}.`;
    }
    case "areaModel": {
      if (!spec.countGrid) return null;
      const count = typeof value === "number" ? value : 0;
      return `A fixed grid has ${spec.hStart} rows and ${spec.wStart} columns of unit squares. ${count} square${count === 1 ? " is" : "s are"} marked as counted so far; the grid dimensions do not change.`;
    }
    case "slopeTriangle": {
      const v = (value as { run: number; rise: number } | null) ?? null;
      const t = { run: spec.bx - spec.ax, rise: spec.by - spec.ay };
      const base = `Point A is at (${spec.ax}, ${spec.ay}) and point B at (${spec.bx}, ${spec.by}); from A to B the line travels ${Math.abs(t.run)} ${t.run < 0 ? "left" : "right"} and ${Math.abs(t.rise)} ${t.rise < 0 ? "down" : "up"}.`;
      if (!v) return `${base} No triangle is built yet.`;
      const passes = v.run === 0 ? spec.bx === spec.ax : spec.ay + (v.rise / v.run) * (spec.bx - spec.ax) === spec.by;
      return `${base} The built triangle has run ${v.run} and rise ${v.rise}, so its line ${passes ? "passes through B" : "misses B"}.`;
    }
    case "graphRead": {
      const v = (value as { picked?: number } | null) ?? null;
      const shown = `${spec.categoryLabel} shows ${spec.drawn} ${spec.mode === "bar" ? (spec.drawn === 1 ? "gridline" : "gridlines") : spec.drawn === 1 ? "picture" : "pictures"}, each worth ${spec.unitValue} ${spec.unitValue === 1 ? spec.unitNoun : spec.unitNounPlural}.`;
      return v && typeof v.picked === "number"
        ? `${shown} The marker is on ${v.picked}.`
        : `${shown} No number chosen yet.`;
    }
    case "unitChain": {
      const v = (value as { unitIdx: number; value: number } | null) ?? null;
      const units = [spec.startUnit, ...spec.hops.map((h) => h.to)];
      if (!v) return `A fixed bar of ${fmt(spec.startValue)} ${spec.startUnit}. The chain runs ${units.join(" to ")}; the target unit is ${spec.targetUnit}.`;
      const at = units[Math.min(v.unitIdx, units.length - 1)];
      return (
        `The bar has not moved; the ruler now counts in ${at} and reads ${fmt(v.value)} ${at}. ` +
        (v.unitIdx < spec.hops.length
          ? `The next crossing is ${spec.hops[v.unitIdx].from} to ${spec.hops[v.unitIdx].to}, where one ${spec.hops[v.unitIdx].bigger === "from" ? spec.hops[v.unitIdx].from : spec.hops[v.unitIdx].to} holds ${spec.hops[v.unitIdx].factor} of the smaller unit.`
          : `This is the target unit, ${spec.targetUnit}.`)
      );
    }
    case "matrixTransform": {
      const v = (value as { a: number; b: number; c: number; d: number } | null) ?? null;
      if (!v) return "The matrix has not been set yet. The unit square sits with corners at (0,0), (1,0), (1,1) and (0,1); î points right and ĵ points up.";
      const det = v.a * v.d - v.b * v.c;
      return (
        `The matrix is [[${fmt(v.a)}, ${fmt(v.b)}], [${fmt(v.c)}, ${fmt(v.d)}]]. ` +
        `î lands at (${fmt(v.a)}, ${fmt(v.c)}) and ĵ lands at (${fmt(v.b)}, ${fmt(v.d)}) — the matrix's columns. ` +
        `The unit square maps to the parallelogram on those two arrows, with signed area ${fmt(det)}` +
        (det === 0 ? " — flattened to a line." : det < 0 ? " — negative, so orientation is flipped." : ".") +
        ` The target parallelogram wants î at (${fmt(spec.ta)}, ${fmt(spec.tc)}) and ĵ at (${fmt(spec.tb)}, ${fmt(spec.td)}).`
      );
    }
    case "systemsExplore": {
      const v = (value as SystemsPairValue | null) ?? null;
      /* THE LINES AS THEY NOW STAND (S215 QA, accessibility defect).
       *
       * This panel used to narrate `spec`, so a learner who had dragged a line heard the AUTHORED
       * equations, authored y-values, and an authored membership claim — the on-screen labels said
       * one thing and the screen reader said another, and the screen reader's version was false.
       * It is derived through the pair model now: the same four numbers the picture uses, the
       * model's own equation strings (never re-formatted here), and `systemsPointOn` for the
       * membership claim, which is the very function the widget's ✓ marks read.
       *
       * `equation.text` is the canonical `y = mx + b` form, which for the integer parameters every
       * systemsExplore spec carries is byte-identical to what this branch printed before — so a
       * classic spec, or an editable one nobody has touched, narrates exactly as it always did.
       */
      const pair = systemsPairModel(spec, v);
      const views = pair.views(pair.initial);
      const l1 = views.a.equation.text;
      const l2 = views.b.equation.text;
      if (!v || typeof v.x !== "number" || typeof v.y !== "number") {
        return `Two lines are drawn: ${l1} and ${l2}. No point is placed yet.`;
      }
      const p = systemsPairParams(spec, v);
      const y1 = p.m1 * v.x + p.b1;
      const y2 = p.m2 * v.x + p.b2;
      const { onA: on1, onB: on2 } = systemsPointOn(spec, v, v.x, v.y);
      const where = on1 && on2 ? "on BOTH lines — it solves the system" : on1 ? `on the first line only; the second passes through (${fmt(v.x)}, ${fmt(y2)}) there` : on2 ? `on the second line only; the first passes through (${fmt(v.x)}, ${fmt(y1)}) there` : `on neither line; at x = ${fmt(v.x)} the lines sit at y = ${fmt(y1)} and y = ${fmt(y2)}`;
      return `Two lines are drawn: ${l1} and ${l2}. Your point is at (${fmt(v.x)}, ${fmt(v.y)}), which is ${where}.`;
    }
    case "quadraticExplore": {
      // ROOTS form carries {a, r1, r2}, not {a, h, k}. Narrating it through the vertex branch read
      // `v.h` as undefined and threw inside fmt — caught by the all-samples sweep, and it would
      // have broken the screen-reader description outright.
      if (spec.form === "roots") {
        const rv = (value as { a: number; r1: number; r2: number } | null) ?? null;
        const a = rv?.a ?? spec.aStart, r1 = rv?.r1 ?? spec.r1Start, r2 = rv?.r2 ?? spec.r2Start;
        const co = rootsFormCoefs(a, r1, r2);
        return (
          `A parabola crossing the x-axis at ${fmt(r1)} and ${fmt(r2)}, which expands to ` +
          `${fmt(co.a)}x² ${co.b < 0 ? "−" : "+"} ${fmt(Math.abs(co.b))}x ${co.c < 0 ? "−" : "+"} ${fmt(Math.abs(co.c))}. ` +
          `The target crossings are ${fmt(spec.targetR1 ?? 0)} and ${fmt(spec.targetR2 ?? 0)}.`
        );
      }
      const v = (value as { a: number; h: number; k: number } | null) ?? null;
      if (!v) {
        // Untouched still narrates NUMBERS: the starting parabola and the goal.
        const sd = spec.aStart > 0 ? "opens upward" : spec.aStart < 0 ? "opens downward" : "is flattened (a = 0)";
        return (
          `The parabola starts as y = ${fmt(spec.aStart)}(x − ${fmt(spec.hStart)})² + ${fmt(spec.kStart)}: ` +
          `vertex at (${fmt(spec.hStart)}, ${fmt(spec.kStart)}), and it ${sd}. ` +
          `The target is a = ${fmt(spec.targetA)} with vertex (${fmt(spec.targetH)}, ${fmt(spec.targetK)}).`
        );
      }
      const dir = v.a > 0 ? "opens upward" : v.a < 0 ? "opens downward" : "is flattened (a = 0)";
      return (
        `The parabola is y = ${fmt(v.a)}(x − ${fmt(v.h)})² + ${fmt(v.k)}: vertex at (${fmt(v.h)}, ${fmt(v.k)}), and it ${dir}. ` +
        `The target is a = ${fmt(spec.targetA)} with vertex (${fmt(spec.targetH)}, ${fmt(spec.targetK)}).`
      );
    }
    case "unitCircleExplore": {
      const v = (value as { angle: number } | null) ?? null;
      const angle = v?.angle ?? spec.angleStart;
      const rad = (angle * Math.PI) / 180;
      return (
        `The point sits at ${fmt(angle)}° on the unit circle: height (sine) ${fmt(Math.sin(rad))}, horizontal position (cosine) ${fmt(Math.cos(rad))}. ` +
        `The target angle is ${fmt(spec.targetAngle)}°.`
      );
    }
    case "vectorExplore": {
      const v = (value as { vx: number; vy: number } | null) ?? { vx: spec.vxStart, vy: spec.vyStart };
      const u = `u = (${fmt(spec.ux)}, ${fmt(spec.uy)})`;
      if (spec.mode === "dot") {
        const d = spec.ux * v.vx + spec.uy * v.vy;
        const geo = d > 0 ? "the angle between them is under 90°" : d < 0 ? "the angle between them is past 90°" : "they are exactly perpendicular";
        return `${u} is fixed; v is at (${fmt(v.vx)}, ${fmt(v.vy)}). Their dot product is ${fmt(d)}, so ${geo}. The target dot product is ${fmt(spec.targetDot)}.`;
      }
      return `${u} is fixed; v is at (${fmt(v.vx)}, ${fmt(v.vy)}). Tip-to-tail, the sum u + v reaches (${fmt(spec.ux + v.vx)}, ${fmt(spec.uy + v.vy)}); the target is (${fmt(spec.targetX)}, ${fmt(spec.targetY)}).`;
    }
    case "riemannSum": {
      const v = (value as { n: number; rule: "left" | "right" | "mid" | "trap" } | null) ?? {
        n: spec.nStart,
        rule: spec.ruleStart
      };
      const est = riemannEstimate(spec.fn, spec.a, spec.b, v.n, v.rule);
      const truth = exactArea(spec.fn, spec.a, spec.b);
      const name = spec.fn === "line" ? "y = 2x" : "y = x²";
      const ruleName = { left: "left-endpoint", right: "right-endpoint", mid: "midpoint", trap: "trapezoid" }[v.rule];
      return (
        `${name} on [${fmt(spec.a)}, ${fmt(spec.b)}], sliced into ${v.n} strip${v.n === 1 ? "" : "s"} using the ${ruleName} rule. ` +
        `Current estimate: ${fmt(est)} against a true area of ${fmt(truth)} (off by ${fmt(Math.abs(est - truth))}).`
      );
    }
    case "secantSlope": {
      const h = typeof value === "number" ? value : spec.startH;
      const name = spec.curve === "square" ? "x²" : "x³";
      const shiftX = spec.shiftX ?? 0;
      const shiftY = spec.shiftY ?? 0;
      const f = (x: number) => {
        const z=x-shiftX;
        return (spec.curve === "square" ? z*z : z*z*z)+shiftY;
      };
      const slope = h === 0 ? null : (f(spec.a + h) - f(spec.a)) / h;
      const tangentX=spec.mode==="rolle"?shiftX:spec.a;
      const tangent = spec.curve === "square" ? 2*(tangentX-shiftX) : 3*(tangentX-shiftX)*(tangentX-shiftX);
      if(spec.mode==="rolle") return `On the translated ${name} curve, Rolle's interval runs from A at x = ${fmt(spec.a)} to B at x = ${fmt(spec.a+h)}. Their heights are ${fmt(f(spec.a))} and ${fmt(f(spec.a+h))}; the secant slope is ${slope===null?"undefined":fmt(slope)}. The interior candidate c = ${fmt(tangentX)} has tangent slope ${fmt(tangent)}.`;
      return (
        `On y = ${name}, point A is fixed at x = ${fmt(spec.a)} and point B sits at x = ${fmt(spec.a + h)} (gap h = ${fmt(h)}). ` +
        (slope === null
          ? "With h = 0 the two points coincide and the secant is undefined."
          : `The secant through A and B has slope ${fmt(slope)}; the tangent at A has slope ${fmt(tangent)}.`)
      );
    }
    case "dilationExplore": {
      const v = (value as { k: number } | null) ?? { k: spec.kStart };
      return (
        `The shape is scaled by k = ${fmt(v.k)} from center (${fmt(spec.center[0])}, ${fmt(spec.center[1])}): ` +
        `lengths ×${fmt(v.k)}, area ×${fmt(v.k * v.k)}. The target scale is k = ${fmt(spec.targetK)}.`
      );
    }
    case "lineRelationLab": {
      const v=(value as {angle:number;offset:number;moves:number}|null) ?? {angle:spec.angleStart,offset:spec.offsetStart,moves:0};
      const raw=Math.abs(((v.angle-spec.baseAngle)%180+180)%180), diff=Math.min(raw,180-raw);
      const relation=diff===0?"parallel":diff===90?"perpendicular":"intersecting";
      return `The active line is at ${fmt(v.angle)}° with offset ${fmt(v.offset)}. The two lines are ${relation}; their smallest angle is ${fmt(diff)}°. ${v.moves} of ${spec.requiredMoves} moves made.`;
    }
    case "triangleConstraintLab": {
      const v=(value as {criterion:string;angle:number;flipped:boolean;moves:number}|null) ?? {criterion:spec.startCriterion,angle:spec.angleStart,flipped:false,moves:0};
      const ratio=spec.sideB*Math.sin(v.angle*Math.PI/180)/spec.sideA;
      const b1=Math.asin(Math.min(1,Math.max(-1,ratio))), b2=Math.PI-b1, c2=Math.PI-v.angle*Math.PI/180-b2;
      const count=v.criterion==="SSA"?(ratio>1+1e-9?0:c2>1e-9?2:1):1;
      return `${v.criterion} is selected at ${fmt(v.angle)}°. The givens currently permit ${count} ${count===1?"triangle":count===0?"triangles":"noncongruent triangles"}; ${fmt(v.moves)} experiments are recorded.`;
    }
    case "coordinateProofLab": {
      const v=(value as {x:number;y:number;moves:number;evidence:string[]}|null) ?? {x:spec.start[0],y:spec.start[1],moves:0,evidence:[]};
      return `Vertex D is at (${fmt(v.x)}, ${fmt(v.y)}). The target is (${fmt(spec.target[0])}, ${fmt(spec.target[1])}) for a ${spec.targetClaim}. Evidence opened: ${v.evidence.join(", ")||"none"}.`;
    }
    case "solidSliceLab": {
      const v=(value as {fraction:number;moves:number;compare:boolean}|null) ?? {fraction:spec.startFraction,moves:0,compare:false};
      return `A section plane is at ${fmt(v.fraction*100)} percent of the ${spec.solid}'s height. ${v.compare?"The equal-base-area comparison solid is visible.":"The comparison solid is hidden."} ${fmt(v.moves)} moves are recorded.`;
    }
    case "triangleAngleLab": {
      const v=(value as {x:number;y:number;moves:number}|null) ?? {x:spec.startC[0],y:spec.startC[1],moves:0};
      return `Two triangle vertices are fixed and the draggable vertex is at (${fmt(v.x)}, ${fmt(v.y)}). The goal is angle A near ${fmt(spec.targetAngleA)}° while the three-angle sum remains 180°. ${v.moves} of ${spec.requiredMoves} reshapes made.`;
    }
    case "verticalLineScanner": {
      const v=(value as {x:number;maxIntersections:number;sweeps:number;verdict:string|null}|null) ?? {x:spec.scanStart,maxIntersections:0,sweeps:0,verdict:null};
      return `The vertical scanner is at x = ${fmt(v.x)}. The greatest intersection count observed is ${fmt(v.maxIntersections)} after ${fmt(v.sweeps)} sweeps. Verdict: ${v.verdict === "not-function" ? "not a function" : v.verdict === "function" ? "a function" : "not chosen"}.`;
    }
    case "covariationScrubber": {
      const x=typeof value==="number"?value:spec.inputStart;
      return `${spec.inputLabel} = ${fmt(x)} produces ${spec.outputLabel} = ${fmt(spec.a*x+spec.b)} under y = ${fmt(spec.a)}x + ${fmt(spec.b)}. The table, graph, equation, and context all show the same pair.`;
    }
    case "samplingBiasLab": {
      const v=(value as {method:string;size:number;draws:number}|null) ?? {method:"convenience",size:spec.sizeStart,draws:0};
      return `Sampling design: ${v.method}, size ${fmt(v.size)}, ${fmt(v.draws)} repeated draws from ${spec.populationLabel}. Selection method controls bias; sample size controls random variability.`;
    }
    case "shapeHierarchyLab": {
      const choiceId=typeof value==="string"?value:null;
      const choice=spec.choices.find((candidate)=>candidate.id===choiceId);
      const mode=spec.mode==="triangle"?`Triangle givens ${spec.triangleSides?.join("-") ?? ""}${spec.triangleAngles?`, angles ${spec.triangleAngles.join("-")}`:""} decide whether the requested angle, side, or inclusion label follows`:spec.mode==="verdict"?`Testing whether ${spec.subjectLabel} is always, sometimes, or never a ${spec.predicateLabel}, using the family definitions shown`:`Tracing the inheritance path ${spec.nodes.map((node)=>node.label).join(" to ")} to see which property must carry forward`;
      return `${mode}. ${choice?`Selected claim: ${choice.label}. Evidence shown: ${choice.evidenceText}`:"No claim selected yet."}`;
    }
    case "shapeFamilyBuilder": {
      const v=(value as {sides:number;rightAngles:number;equalSides:number;parallelPairs:number}|null) ?? {sides:spec.startSides,rightAngles:0,equalSides:0,parallelPairs:0};
      return `The current shape has ${fmt(v.sides)} sides, ${fmt(v.rightAngles)} right angles, ${fmt(v.equalSides)} equal sides, and ${fmt(v.parallelPairs)} parallel pairs. Target family: ${spec.targetName}.`;
    }
    case "unitRuler": {
      const v=(value as {zeroAligned:boolean;unitSize:number;placements:number;spacing:string}|null) ?? {zeroAligned:false,unitSize:spec.startUnitSize,placements:0,spacing:"exact"};
      return `The object runs from ${fmt(spec.objectStart)} to ${fmt(spec.objectEnd)}. Zero alignment is ${v.zeroAligned?"set":"not set"}; ${fmt(v.placements)} units of size ${fmt(v.unitSize)} are placed with ${v.spacing} spacing.`;
    }
    case "proportionalReasoningLab": {
      const truth=proportionalReasoningTruth(spec);
      const v=value&&typeof value==="object"?value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown}:{};
      const validKeys=new Set(proportionalReasoningExplorationKeys(spec));
      const explored=Array.isArray(v.revealed)?new Set(v.revealed.filter((item):item is string=>typeof item==="string"&&validKeys.has(item))).size:0;
      const seriesText=truth.series.map((entry)=>`${entry.label}: ${entry.pairs.map(([x,y])=>`${fmt(x)} to ${fmt(y)}`).join(", ")}; unit rates ${entry.rates.map(fmt).join(", ")}`).join(". ");
      const answer=spec.answerMode==="numeric"?(typeof v.numeric==="number"?`Entered ${fmt(v.numeric)}${spec.answerUnit?` ${spec.answerUnit}`:""}.`:"No numeric answer entered."):(typeof v.choiceId==="string"?`Selected ${spec.choices.find((choice)=>choice.id===v.choiceId)?.label??v.choiceId}.`:"No conclusion selected.");
      return `${seriesText}. ${explored} proportional checks have been opened; ${spec.requiredExplorations} are required. ${answer}`;
    }
    case "placeValueTransformLab": {
      const truth=placeValueTransformTruth(spec);
      const v=value&&typeof value==="object"?value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown}:{};
      const valid=new Set(placeValueTransformExplorationKeys(spec));
      const opened=Array.isArray(v.revealed)?v.revealed.filter((item):item is string=>typeof item==="string"&&valid.has(item)):[];
      const stageByKey=new Map(truth.stages.map((stage)=>[stage.key,stage]));
      const openedText=opened.map((key)=>stageByKey.get(key)).filter(Boolean).map((stage)=>`${stage!.label}: ${stage!.value}`).join("; ");
      const source=spec.values.map(fmt).join(spec.task.includes("Division")||spec.task==="divisionFirstMove"?" divided by ":", ");
      const answer=spec.answerMode==="numeric"?(typeof v.numeric==="number"?`Entered ${fmt(v.numeric)}${spec.answerUnit?` ${spec.answerUnit}`:""}.`:"No numeric answer entered."):(typeof v.choiceId==="string"?`Selected ${spec.choices.find((choice)=>choice.id===v.choiceId)?.label??v.choiceId}.`:"No conclusion selected.");
      return `Source values: ${source}. ${opened.length} of ${truth.stages.length} derived stages inspected${openedText?`: ${openedText}`:""}. ${answer}`;
    }
    case "pointSetReasoningLab": {const v=value&&typeof value==="object"?value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown}:{};const truth=pointSetReasoningTruth(spec),valid=new Set(pointSetReasoningExplorationKeys(spec)),revealed=Array.isArray(v.revealed)?v.revealed.filter((item):item is string=>typeof item==="string"&&valid.has(item)):[];const selected=typeof v.choiceId==="string"?spec.choices.find(choice=>choice.id===v.choiceId):undefined;const twoD=spec.sets.some(set=>set.points.some(point=>point.y!==undefined));
      // S237b. Dropping the internal task token also dropped the only context sentence, leaving the
      // panel under the s44 substance floor and quieter than the diagram: the plot draws its axis
      // titles on screen and names them in its own aria-label. Say what the axes measure.
      // S237. unitRate draws a ray from the origin through the point; a description that omitted it
      // would be quieter than the picture again, in the same way the axis sentence was.
      const axes=`${twoD?`Horizontal axis ${spec.xLabel}; vertical axis ${spec.yLabel??"y"}.`:`The number line is labelled ${spec.xLabel}.`}${twoD&&spec.task==="unitRate"?" A straight line runs from the origin through the plotted point.":""}`;
      return `${axes} ${sentence(spec.sets.map(set=>`${set.label}: ${set.points.map(point=>point.y===undefined?point.x:`(${point.x}, ${point.y})`).join(", ")}`).join(". "))}. ${revealed.length} of ${truth.stages.length} exact states inspected.${typeof v.numeric==="number"?` Entered ${v.numeric}.`:selected?` Selected ${selected.label}.`:""}`}
    case "geometricConstraintLab": {
      const v=value&&typeof value==="object"?value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown}:{};
      const truth=geometricConstraintTruth(spec),valid=new Set(geometricConstraintExplorationKeys(spec));
      const opened=Array.isArray(v.revealed)?v.revealed.filter((item):item is string=>typeof item==="string"&&valid.has(item)):[];
      const openedSet=new Set(opened);const stages=truth.stages.map(stage=>`${stage.label}: ${openedSet.has(stage.key)?stage.value:"not inspected"}`).join("; ");
      const answer=spec.answerMode==="numeric"?(typeof v.numeric==="number"?`Entered ${v.numeric}${spec.answerUnit?` ${spec.answerUnit}`:""}.`:"No numeric answer entered."):spec.answerMode==="choice"?(typeof v.choiceId==="string"?`Selected ${spec.choices.find(choice=>choice.id===v.choiceId)?.label??v.choiceId}.`:"No conclusion selected."):"Exploration mode.";
      return `${sentence(stages)}. ${answer}`;
    }
    case "exactNumberLab": {
      const v=value&&typeof value==="object"?value as {revealed?:unknown;numeric?:unknown;choiceId?:unknown;relation?:unknown}:{};
      const truth=exactNumberTruth(spec),valid=new Set(exactNumberExplorationKeys(spec));
      const revealed=Array.isArray(v.revealed)?new Set(v.revealed.filter((item):item is string=>typeof item==="string"&&valid.has(item))):new Set<string>();
      const stages=truth.stages.map(stage=>`${stage.label}: ${revealed.has(stage.key)?stage.value:"not inspected"}`).join("; ");
      const answer=spec.answerMode==="numeric"?(typeof v.numeric==="number"?`Entered ${v.numeric}.`:"No numeric answer entered."):spec.answerMode==="choice"?(typeof v.choiceId==="string"?`Selected ${spec.choices.find(choice=>choice.id===v.choiceId)?.label??v.choiceId}.`:"No conclusion selected."):spec.answerMode==="relation"?(v.relation?`Selected relation ${v.relation}.`:"No relation selected."):"Exploration mode.";
      return `${sentence(stages)}. ${answer}`;
    }
    case "affineRelationshipLab": {
      const v=(value&&typeof value==="object"?value:{}) as {revealed?:unknown;numeric?:unknown;choiceId?:unknown;point?:unknown};
      const valid=new Set(affineRelationshipExplorationKeys(spec));
      const revealed=Array.isArray(v.revealed)?v.revealed.filter((item):item is string=>typeof item==="string"&&valid.has(item)):[];
      const truth=affineRelationshipTruth(spec);
      const lineSummary=spec.lines.map(line=>`${line.label}: ${line.sourceText}`).join("; ");
      const opened=truth.stages.filter(stage=>revealed.includes(stage.key)).map(stage=>`${stage.label}: ${stage.value}`).join("; ")||"no derived stages opened";
      const answer=spec.answerMode==="numeric"&&typeof v.numeric==="number"?` Entered ${v.numeric}.`:spec.answerMode==="choice"&&typeof v.choiceId==="string"?` Selected ${spec.choices.find(choice=>choice.id===v.choiceId)?.label??v.choiceId}.`:spec.answerMode==="point"&&Array.isArray(v.point)?` Entered point (${v.point[0]}, ${v.point[1]}).`:"";
      // S237b. Opened with the engine's own name — an authoring label, and the one thing on this
      // panel that is not mathematics. The lines it describes are what the screen actually shows.
      return `${sentence(lineSummary)}. ${revealed.length} of ${truth.stages.length} stages inspected: ${opened}.${answer}`;
    }
    case "quotientReasoningLab": {
      const truth = quotientReasoningTruth(spec);
      const v = value && typeof value === "object" ? value as { revealed?: unknown; numeric?: unknown; choiceId?: unknown; fraction?: unknown } : {};
      const valid = new Set(quotientReasoningExplorationKeys(spec));
      const opened = Array.isArray(v.revealed) ? v.revealed.filter((item): item is string => typeof item === "string" && valid.has(item)) : [];
      const stageByKey = new Map(truth.stages.map((stage) => [stage.key, stage]));
      const openedText = opened.map((key) => stageByKey.get(key)).filter(Boolean).map((stage) => `${stage!.label}: ${stage!.value}`).join("; ");
      const answer = spec.answerMode === "numeric" ? (typeof v.numeric === "number" ? `Entered ${fmt(v.numeric)}${spec.answerUnit ? ` ${spec.answerUnit}` : ""}.` : "No numeric answer entered.")
        : spec.answerMode === "choice" ? (typeof v.choiceId === "string" ? `Selected ${spec.choices.find((choice) => choice.id === v.choiceId)?.label ?? v.choiceId}.` : "No conclusion selected.")
          : spec.answerMode === "fraction" ? (() => { const f = v.fraction && typeof v.fraction === "object" ? v.fraction as {whole?:number;num?:number;den?:number} : {}; return typeof f.num === "number" && typeof f.den === "number" ? `Entered ${f.whole ? `${f.whole} ` : ""}${f.num}/${f.den}.` : "No fraction entered."; })()
            : "Exploration-only quotient state.";
      // S237b. Dropping the internal task token left this description with no mathematics in it at
      // all, below the s44 substance floor. The widget devotes a labelled "Source state" panel to
      // exactly this string; the panel was the one channel that never said it.
      const source = spec.repeatBlock ? `0.(${spec.repeatBlock})`
        : spec.dividend && spec.divisor ? `${quotientRationalDisplay(spec.dividend)} ÷ ${quotientRationalDisplay(spec.divisor)}`
          : spec.dividend ? quotientRationalDisplay(spec.dividend)
            : spec.candidates.length ? spec.candidates.map((candidate) => candidate.label).join(" · ") : "exact quotient state";
      return `Source state ${source}. ${opened.length} of ${truth.stages.length} derived states inspected${openedText ? `: ${openedText}` : ""}. ${answer}`;
    }
    case "graphStoryLab": {
      if (spec.mode === "read") {
        const picked = typeof value === "string" ? spec.choices.find((choice) => choice.id === value) : undefined;
        const truth = graphStoryTruth(spec);
        return `${truth.narration} ${picked ? `Selected claim: ${picked.label}.` : "No graph claim selected."}`;
      }
      const ids = value && typeof value === "object" && Array.isArray((value as {segmentIds?:unknown}).segmentIds)
        ? (value as {segmentIds:string[]}).segmentIds : [];
      const byId = new Map(spec.bank.map((segment) => [segment.id, segment.kind]));
      const kinds = ids.map((id) => byId.get(id)).filter((kind): kind is NonNullable<typeof kind> => Boolean(kind));
      return `${graphStoryTruth(spec, kinds).narration} ${ids.length} stage${ids.length === 1 ? " is" : "s are"} assembled.`;
    }
    case "conditionalTableLab": {
      if (spec.mode === "read" && spec.readMetric) {
        const choiceId=typeof value === "string" ? value : "";
        const choice=spec.answerChoices.find((candidate)=>candidate.id===choiceId);
        const truth=conditionalTableReadTruth(spec.counts,spec.readMetric,spec.targetCell);
        return `The two-way table has row labels ${spec.rowLabels.join(" and ")} and column labels ${spec.colLabels.join(" and ")}. The target ${CONDITIONAL_TABLE_METRIC[spec.readMetric] ?? spec.readMetric} uses ${truth.numerator}${spec.readMetric.startsWith("relative")?` out of ${truth.denominator}`:""}. ${choice?`Selected claim: ${choice.label}.`:"No claim selected yet."}`;
      }
      const v=(value as {condition?:string;cell?:string|null;switches?:number}|null) ?? {};
      const condition=v.condition ?? spec.startCondition, cell=v.cell ?? "none", switches=v.switches ?? 0;
      return `The selected condition is ${condition.startsWith("row") ? spec.rowLabels[Number(condition[3])] : spec.colLabels[Number(condition[3])]}; the selected intersection is ${cell === "none" ? "none" : `${spec.rowLabels[Number(cell[1])]} and ${spec.colLabels[Number(cell[3])]}`}. ${switches} condition changes have been recorded. The highlighted row or column is the current denominator.`;
    }
    case "conicLocusLab": {
      const v=(value as {eTenths:number;samples:number}|null) ?? {eTenths:spec.startEccentricityTenths,samples:0};
      const e=v.eTenths/10, family=e===0?"circle":e<1?"ellipse":e===1?"parabola":"hyperbola";
      return `The focus-to-directrix ratio is e = ${fmt(e)}, producing a ${family}. ${fmt(v.samples)} eccentricity samples have been tested; the target is e = ${fmt(spec.targetEccentricityTenths/10)}.`;
    }
    case "derivativeRuleLab": {
      const v=(value as {h:number;innerRate:number;outerRate:number;moves:number}|null) ?? {h:spec.startH,innerRate:spec.startInnerRate,outerRate:spec.startOuterRate,moves:0};
      if(spec.mode==="product") return `The product rectangle uses h = ${fmt(v.h)}. The divided second-order corner contributes ${fmt(v.h)}, so it approaches zero as h approaches zero. ${fmt(v.moves)} moves are recorded.`;
      if(spec.mode==="substitution") return `The x-world shows ${fmt(v.innerRate)}x times x squared plus 1 to power ${fmt(v.outerRate)}. With u = x squared plus 1 and du = 2x dx, the u-world coefficient is ${fmt(v.innerRate/2)} and the power is ${fmt(v.outerRate)}; no x remains. ${fmt(v.moves)} moves are recorded.`;
      return `The inner rate is ${fmt(v.innerRate)} and the outer rate is ${fmt(v.outerRate)}; the nested total rate is their product, ${fmt(v.innerRate*v.outerRate)}. ${fmt(v.moves)} moves are recorded.`;
    }
    case "relatedRatesLab": {
      const v=(value as {x:number;moves:number}|null) ?? {x:spec.startX,moves:0};
      const y=Math.sqrt(Math.max(0,spec.ladderLength**2-v.x**2));
      const dy=-(v.x/y)*spec.horizontalRate;
      /* Framing must match the pane (S205J): a screen-reader user in a slope lesson hears slope
       * language, exactly as the sighted learner reads dy/dx on the readout. */
      if (spec.framing === "slope")
        return `A point on the circle x² + y² = ${fmt(spec.ladderLength)}² sits at x = ${fmt(v.x)}, y = ${fmt(y)}. The slope there is dy/dx = −x/y = ${fmt(dy)}. ${fmt(v.moves)} moves are recorded.`;
      return `The ${fmt(spec.ladderLength)}-unit ladder has foot x = ${fmt(v.x)} and top height y = ${fmt(y)}. With dx/dt = ${fmt(spec.horizontalRate)}, the coupled vertical rate is dy/dt = ${fmt(dy)}. ${fmt(v.moves)} moves are recorded.`;
    }
    case "quadDrag": {
      const v = (value as { x: number; y: number } | null) ?? { x: spec.startX, y: spec.startY };
      const pts = spec.fixed.map(([x, y]) => `(${fmt(x)}, ${fmt(y)})`).join(", ");
      return (
        `Three vertices are pinned at ${pts}; the fourth is yours, currently at (${fmt(v.x)}, ${fmt(v.y)}). ` +
        `The goal is to complete ${spec.targetName} — the target corner is (${fmt(spec.targetX)}, ${fmt(spec.targetY)}).`
      );
    }
    case "slopeField": {
      const y0 = typeof value === "number" ? value : spec.startY0;
      const eq = {
        linear: "dy/dx follows a linear rule",
        exponential: "dy/dx = ky — growth proportional to y",
        decay: "dy/dx = −ky — decay proportional to y",
        logistic: "dy/dx = ky(1 − y/L) — logistic growth toward a ceiling"
      }[spec.equation];
      return (
        `A field of little slope ticks fills the grid (${eq}). Your solution curve is launched from y(0) = ${fmt(y0)} ` +
        `and threads through the ticks from there; the target launch height is y(0) = ${fmt(spec.targetY0)}.`
      );
    }
    case "polarTrace": {
      const v = typeof value === "number" ? value : spec.start;
      if (spec.mode === "rose") {
        const petals = v % 2 === 0 ? 2 * v : v;
        return (
          `The curve r = cos(${fmt(v)}θ) is traced: with n = ${fmt(v)} (${v % 2 === 0 ? "even, so petals double" : "odd, so petals match n"}), ` +
          `it draws ${fmt(petals)} petal${petals === 1 ? "" : "s"}. The target is ${fmt(spec.targetPetals)} petals.`
        );
      }
      return (
        `The limaçon r = ${fmt(v)} + cos θ is traced: with a = ${fmt(v)} it is ` +
        (v === 1 ? "a cardioid — the inner loop just closes into a cusp" : v < 1 ? "looped — an inner loop appears" : v >= 2 ? "convex — no dimple at all" : "dimpled but loop-free") +
        `. The target is a = ${fmt(spec.targetA)}.`
      );
    }
    case "plotPoint": {
      /* Names what is marked and what remains, WITHOUT naming the unmarked targets — the sighted
       * learner must find the cells; the description reports progress, not the answer. */
      const pts = Array.isArray(value) ? (value as { x: number; y: number }[]) : [];
      const isTarget = (p: { x: number; y: number }) => spec.targets.some((t) => t.x === p.x && t.y === p.y);
      const correct = pts.filter(isTarget);
      const stray = pts.filter((p) => !isTarget(p));
      const marked = pts.length === 0
        ? "No cells are marked yet"
        : `Marked cells: ${pts.map((p) => `(${p.x}, ${p.y})`).join(", ")}`;
      const strays = stray.length > 0 ? ` ${stray.length} of them ${stray.length === 1 ? "is" : "are"} not a target.` : "";
      return (
        `A ${spec.cols}-by-${spec.rows} grid, coordinates counted from the bottom-left starting at 1. ` +
        `${marked}. ${correct.length} of ${spec.targets.length} targets are marked so far.${strays}`
      );
    }
    case "inversePipeline": {
      /* Speaks the forward chain (fixed, on-screen structure) and the learner's built track.
       * The answer ordering is withheld — building it is the task. */
      const built: string[] = Array.isArray(value) ? (value as string[]) : [];
      const word = { add: "add", sub: "subtract", mul: "multiply by", div: "divide by" } as const;
      const label = (op: { op: "add" | "sub" | "mul" | "div"; n: number }) => `${word[op.op]} ${op.n}`;
      const byId = new Map(spec.tray.map((t) => [t.id, t]));
      const track = built
        .map((id) => byId.get(id))
        .filter((t): t is NonNullable<typeof t> => Boolean(t))
        .map(label);
      const forward = spec.forward.map(label).join(", then ");
      return (
        `The forward machine applies: ${forward}. ` +
        (track.length === 0
          ? `The inverse track is empty; ${spec.tray.length} cards are in the tray.`
          : `The inverse track so far reads: ${track.join(", then ")} — ${track.length} of ${spec.answer.length} slots filled.`)
      );
    }
    case "solveBalance": {
      /* Reads the pans as they stand — the equation the beam is claiming RIGHT NOW. The solution
       * (c − b) / a is never computed here; reaching it is the task. */
      const g = spec.groups;
      const start = {
        leftX: g ? 0 : spec.a, leftUnits: g ? 0 : spec.b, rightUnits: spec.c,
        groups: g ? Math.abs(g.count) : 0, rel: (spec.relation ?? "eq") as "eq" | "lt" | "gt" | "le" | "ge"
      };
      const raw = (value as Partial<typeof start> | null) ?? start;
      const st = { ...start, ...raw };
      const relWord = { eq: "equals", lt: "is less than", gt: "is greater than", le: "is at most", ge: "is at least" }[st.rel];
      const side = (x: number, u: number, groupsLeft: number) => {
        const parts: string[] = [];
        if (groupsLeft > 0 && g) parts.push(`${fmt(groupsLeft)} unopened group${groupsLeft === 1 ? "" : "s"} of (${fmt(g.x)}x ${g.unit < 0 ? "−" : "+"} ${fmt(Math.abs(g.unit))})${g.count < 0 ? ", each negated" : ""}`);
        if (x !== 0) parts.push(`${fmt(x)} x-tile${Math.abs(x) === 1 ? "" : "s"}`);
        if (u !== 0) parts.push(`${fmt(u)} unit tile${Math.abs(u) === 1 ? "" : "s"}`);
        return parts.length ? parts.join(" and ") : "nothing";
      };
      return `The left pan holds ${side(st.leftX ?? 0, st.leftUnits ?? 0, st.groups ?? 0)}; the right pan holds ${side(0, st.rightUnits ?? 0, 0)}. The beam claims the left side ${relWord} the right.`;
    }
    case "rotationLab": {
      /* Describes the CURRENT turn only. `spec.targetAngle` is deliberately withheld: the sighted
       * learner must hunt the landing angle, and speaking it here would hand a screen-reader user
       * the answer a mouse user has to find. Parity means the same task, not an easier one. */
      const angle = (value as { angle: number } | null)?.angle ?? spec.angleStart;
      const centre: [number, number] = [spec.centre[0], spec.centre[1]];
      if (spec.mode === "coordinateRule") {
        const point: [number, number] = [spec.point?.[0] ?? 0, spec.point?.[1] ?? 0];
        const [ix, iy] = rotationLabImage(point, centre, angle);
        return (
          `The point (${fmt(point[0])}, ${fmt(point[1])}) is turned ${fmt(angle)}° counterclockwise about ` +
          `(${fmt(centre[0])}, ${fmt(centre[1])}); its image reads (${fmt(ix)}, ${fmt(iy)}).`
        );
      }
      const shape = (spec.shape ?? []).map((p) => [p[0], p[1]] as [number, number]);
      const onSelf = shape.length > 0 && rotationLabMapsOntoSelf(shape, centre, angle);
      return (
        `A ${shape.length}-vertex shape is turned ${fmt(angle)}° counterclockwise about ` +
        `(${fmt(centre[0])}, ${fmt(centre[1])}). At this turn it ` +
        `${onSelf ? "lands exactly back on itself" : "does not land back on itself"}.`
      );
    }
    case "transformExplore": {
      const v = (value as { dx: number; dy: number; reflect: "none" | "x" | "y" } | null) ?? { dx: 0, dy: 0, reflect: "none" as const };
      const flip = v.reflect === "none" ? "no reflection" : `reflected over the ${v.reflect}-axis`;
      const [sx, sy] = spec.shape[0];
      const [tx, ty] = spec.target[0];
      return (
        `The shape's first vertex started at (${fmt(sx)}, ${fmt(sy)}); the current move is a slide of (${fmt(v.dx)}, ${fmt(v.dy)}) with ${flip}, ` +
        `so that vertex now sits at (${fmt(v.reflect === "y" ? -sx + v.dx : sx + v.dx)}, ${fmt(v.reflect === "x" ? -sy + v.dy : sy + v.dy)}). ` +
        `The target's matching vertex is (${fmt(tx)}, ${fmt(ty)}).`
      );
    }
    case "balanceScale": {
      const x = (value as { x: number } | null)?.x ?? spec.xStart;
      const left = spec.a * x + spec.b;
      const state = left === spec.c ? "the pans are level" : left < spec.c ? `the left pan is lighter by ${fmt(spec.c - left)}` : `the left pan is heavier by ${fmt(left - spec.c)}`;
      return `The left pan holds ${spec.a === 1 ? "" : fmt(spec.a)}x + ${fmt(spec.b)} and the right holds ${fmt(spec.c)}. With x = ${fmt(x)}, the left pan weighs ${fmt(left)} — ${state}.`;
    }
    case "lineExplore": {
      const v = (value as { m: number; b: number } | null) ?? { m: spec.slopeStart, b: spec.interceptStart };
      return (
        `The line is y = ${fmt(v.m)}x + ${fmt(v.b)}: it crosses the y-axis at (0, ${fmt(v.b)}) and ` +
        (v.m === 0 ? "runs flat" : `${v.m > 0 ? "climbs" : "falls"} ${fmt(Math.abs(v.m))} for every 1 across`) +
        `. The target is y = ${fmt(spec.targetSlope)}x + ${fmt(spec.targetIntercept)}.`
      );
    }
    case "expLogExplore": {
      const b = typeof value === "number" ? value : spec.startBase;
      const character = b > 1 ? "rises — each step multiplies up" : b === 1 ? "is flat — multiplying by 1 changes nothing" : "falls — each step multiplies down";
      return `The curve is ${spec.mode === "logarithm" ? `y = log base ${fmt(b)} of x` : `y = ${fmt(b)} to the x`}, and it ${character}. Every base passes through ${spec.mode === "logarithm" ? "(1, 0)" : "(0, 1)"}. The target base is ${fmt(spec.targetBase)}.`;
    }
    case "graphZoom": {
      const v = (value as { zoom: number; verdict: "limit-exists" | "no-limit" | null } | null) ?? { zoom: 1, verdict: null };
      const sides =
        spec.behaviour === "infinite"
          ? "both sides climb without bound"
          : spec.leftValue === spec.rightValue
            ? `both sides head toward ${fmt(spec.leftValue)}`
            : `the left side heads toward ${fmt(spec.leftValue)} and the right toward ${fmt(spec.rightValue)}`;
      const at = spec.fAtA === null ? "the point itself is missing" : `f(${fmt(spec.a)}) = ${fmt(spec.fAtA)}`;
      return `Zoomed ×${fmt(v.zoom)} at x = ${fmt(spec.a)}: ${sides}, and ${at}. Verdict entered: ${v.verdict === null ? "none yet" : v.verdict === "limit-exists" ? "the limit exists" : "no limit"}.`;
    }
    case "circleAngleExplore": {
      const arc = typeof value === "number" ? value : spec.startArc;
      const shown = circleReadout(spec.mode, arc);
      const name = { central: "central angle", inscribed: "inscribed angle", tangentChord: "tangent–chord angle", cyclic: "opposite angle" }[spec.mode];
      return `The arc is set to ${fmt(arc)}°, so the ${name} reads ${fmt(shown)}°. The target reading is ${fmt(spec.targetAngle)}°.`;
    }
    case "accumulateArea": {
      const x = typeof value === "number" ? value : spec.start;
      const name = { const: "f = 3 (flat)", line: "f(x) = 2x", square: "f(x) = x²", shifted: "f(x) = x − 2" }[spec.fn];
      return (
        `Sweeping area under ${name}: the sweep line is at x = ${fmt(x)}, where the function's height is ${fmt(accumFnAt(spec.fn, x))} ` +
        `and the accumulated area so far is ${fmt(accumAreaAt(spec.fn, x))}. ` +
        (spec.mode === "area" ? `The goal is accumulated area ${fmt(spec.targetArea)}.` : `The goal is to park the sweep at x = ${fmt(spec.targetX)}.`)
      );
    }
    case "derivativeTrace": {
      /* S205B: computed from the grader's own traceSlopeAt/traceSecondAt, not a reimplemented
       * formula — the description and the grading can never disagree about the same x. */
      const x = typeof value === "number" ? value : spec.start;
      const slope = traceSlopeAt(spec.fn, x);
      const bend = spec.showSecond ? traceSecondAt(spec.fn, x) : null;
      const name = { square: "y = x²", cubic: "y = x³", abs: "y = |x|", cubicMix: "y = x³ − 3x" }[spec.fn];
      return (
        `Riding the tangent along ${name}: the point is at x = ${fmt(x)}, where ` +
        (slope === null ? "the corner has no single tangent slope" : `the tangent's slope is ${fmt(slope)} (${slope > 0 ? "uphill" : slope < 0 ? "downhill" : "flat"})`) +
        (spec.showSecond
          ? bend === null
            ? ", and f″ is undefined here"
            : `, and f″ is ${fmt(bend)} — the curve is ${bend > 0 ? "bending upward" : bend < 0 ? "bending downward" : "not bending"}`
          : "") +
        `. ` +
        (spec.mode === "slope" ? `The goal is a slope of ${fmt(spec.targetSlope)}.` : `The goal is to reach x = ${fmt(spec.targetX)}.`)
      );
    }
    case "argandExplore": {
      const v = (value as { re: number; im: number } | null) ?? { re: spec.reStart, im: spec.imStart };
      const z = `${fmt(v.re)} ${v.im < 0 ? "−" : "+"} ${fmt(Math.abs(v.im))}i`;
      if (spec.mode === "multiply") {
        const pr = v.re * spec.mulRe - v.im * spec.mulIm;
        const pi = v.re * spec.mulIm + v.im * spec.mulRe;
        return (
          `z is at ${z} on the complex plane. Multiplying by w = ${fmt(spec.mulRe)} ${spec.mulIm < 0 ? "−" : "+"} ${fmt(Math.abs(spec.mulIm))}i lands the product at ` +
          `${fmt(pr)} ${pi < 0 ? "−" : "+"} ${fmt(Math.abs(pi))}i; the target is ${fmt(spec.targetRe)} ${spec.targetIm < 0 ? "−" : "+"} ${fmt(Math.abs(spec.targetIm))}i.`
        );
      }
      return `z is plotted at ${z}: ${fmt(v.re)} along the real axis, ${fmt(v.im)} up the imaginary axis. The target point is ${fmt(spec.targetRe)} ${spec.targetIm < 0 ? "−" : "+"} ${fmt(Math.abs(spec.targetIm))}i.`;
    }
    case "sequenceBuild": {
      if (spec.task === "dial") return null;
      const state = value && typeof value === "object" && !Array.isArray(value) ? value as { explored?: string[]; numeric?: number | ""; choiceId?: string } : {};
      const truth = sequenceReasoningTruth(spec), valid = new Set(truth.stages.map((stage) => stage.key));
      const explored = Array.isArray(state.explored) ? state.explored.filter((key) => valid.has(key)) : [];
      const choice = state.choiceId ? spec.choices.find((candidate) => candidate.id === state.choiceId) : undefined;
      return `${truth.terms.length?`Terms ${truth.terms.slice(0,8).map(fmt).join(", ")}.`:"No terms shown yet."} ${explored.length} exact states inspected. ${choice ? `Selected ${choice.label}.` : typeof state.numeric === "number" ? `Entered ${state.numeric}.` : "No final answer selected."}`;
    }
    case "triangleSolve": {
      const v = typeof value === "number" ? value : spec.start;
      if (spec.mode === "sas") {
        return (
          `Sides ${fmt(spec.a)} and ${fmt(spec.b)} are hinged at ${fmt(v)}°, making the third side ${fmt(+lawOfCosinesSide(spec.a, spec.b, v).toFixed(2))}. ` +
          `The goal is a third side of ${fmt(spec.target)}.`
        );
      }
      return (
        `Sides ${fmt(spec.a)} and ${fmt(spec.b)} with a third side of ${fmt(v)} force the angle between them to ${fmt(+lawOfCosinesAngle(spec.a, spec.b, v).toFixed(1))}°. ` +
        `The goal is an angle of ${fmt(spec.target)}°.`
      );
    }
    case "distanceGrid": {
      const v = (value as { x: number; y: number } | null) ?? { x: spec.startX, y: spec.startY };
      const run = v.x - spec.anchor[0];
      const rise = v.y - spec.anchor[1];
      const d = Math.sqrt(run * run + rise * rise);
      return (
        `The anchor sits at (${fmt(spec.anchor[0])}, ${fmt(spec.anchor[1])}); your point is at (${fmt(v.x)}, ${fmt(v.y)}) — ` +
        `a run of ${fmt(run)} and rise of ${fmt(rise)}, for a straight-line distance of ${fmt(+d.toFixed(2))}.`
      );
    }
    case "scatterFit": {
      const v = (value as { m: number; b: number } | null) ?? null;
      const n = spec.points.length;
      const intro = `${n} data points are scattered from (${fmt(spec.points[0][0])}, ${fmt(spec.points[0][1])}) to (${fmt(spec.points[n - 1][0])}, ${fmt(spec.points[n - 1][1])}).`;
      if (!v) return `${intro} No fit line has been set yet.`;
      return `${intro} Your fit line is y = ${fmt(v.m)}x + ${fmt(v.b)} — slope ${fmt(v.m)} per unit, crossing the y-axis at ${fmt(v.b)}.`;
    }
    case "angleMeasure": {
      const a = (value as { angle: number } | null)?.angle ?? spec.angleStart;
      const kind = a < 90 ? "acute" : a === 90 ? "a right angle" : a < 180 ? "obtuse" : "a straight angle";
      const gap = spec.targetAngle - a;
      const rel =
        gap === 0 ? "You are exactly on the target." : gap > 0 ? `Open ${fmt(gap)}° more to reach it.` : `Close ${fmt(-gap)}° to reach it.`;
      return `The angle is opened to ${fmt(a)}° — ${kind}. The target is ${fmt(spec.targetAngle)}°. ${rel}`;
    }
    case "taylorApprox": {
      const n = typeof value === "number" ? value : spec.nStart;
      const partial = taylorPartial(spec.fn, n, spec.atX);
      const truth = taylorFn(spec.fn, spec.atX);
      const name = spec.fn === "exp" ? "eˣ" : "1/(1 − x)";
      return (
        `Approximating ${name} at x = ${fmt(spec.atX)} with series terms through degree ${fmt(n)}: ` +
        `the partial sum reads ${fmt(+partial.toFixed(4))} against the true value ${fmt(+truth.toFixed(4))} — off by ${fmt(+Math.abs(truth - partial).toFixed(4))}.`
      );
    }
    case "sliceSum": {
      const v = (value as { n: number; rule: "left" | "right" | "mid" } | null) ?? { n: spec.nStart, rule: spec.ruleStart };
      const [a, b] = sliceInterval(spec.mode);
      const est = sliceEstimate(spec.mode, v.n, v.rule);
      const truth = sliceExact(spec.mode);
      const what = spec.mode === "areaBetween" ? "area between y = x and y = x²" : spec.mode === "disc" ? "volume of the cone (y = x revolved)" : spec.mode === "washer" ? "volume of the washer solid (between y = x and y = x²)" : "sector measure";
      return (
        `Slicing the ${what} on [${fmt(a)}, ${fmt(b)}] into ${fmt(v.n)} ${v.rule}-sampled slice${v.n === 1 ? "" : "s"}: ` +
        `the slice total is ${fmt(+est.toFixed(4))} against an exact ${fmt(+truth.toFixed(4))}.`
      );
    }
    case "shapeParts": {
      const total = shapePartCount(spec.shape, spec.sides, spec.part);
      const marked = Array.isArray(value) ? (value as unknown[]).filter((v) => typeof v === "number") : [];
      const name = spec.shape === "polygon" ? `${spec.sides}-sided flat shape` : spec.shape;
      const distinct = new Set(marked).size;
      return `A ${name} with ${total} ${spec.part}. ${marked.length} tap${marked.length === 1 ? "" : "s"} recorded so far, covering ${distinct} distinct ${spec.part}.`;
    }
    case "binomialAreaLab": {
      const v = (value as { a?: number; b?: number; moves?: number } | null) ?? null;
      const side = (c: number, k: number | undefined) =>
        `${c === 1 ? "" : c}x${k === undefined ? " + ?" : k === 0 ? "" : k > 0 ? " + " + k : " \u2212 " + Math.abs(k)}`;
      const t = binomialExpand(spec.pX, spec.targetA, spec.qX, spec.targetB);
      const name = spec.asks === "x2" ? "x\u00b2 coefficient" : spec.asks === "middle" ? "x coefficient" : "constant term";
      if (!v || typeof v.a !== "number" || typeof v.b !== "number")
        return `A rectangle whose sides are ${side(spec.pX, undefined)} and ${side(spec.qX, undefined)}; neither partition is placed yet. The step asks for the ${name} of the product.`;
      const mine = binomialExpand(spec.pX, v.a, spec.qX, v.b);
      return `Rectangle sides ${side(spec.pX, v.a)} and ${side(spec.qX, v.b)}; the four regions total ${mine.x2}x\u00b2 ${mine.middle >= 0 ? "+" : "\u2212"} ${Math.abs(mine.middle)}x ${mine.constant >= 0 ? "+" : "\u2212"} ${Math.abs(mine.constant)}. The step asks for the ${name}, which for the intended rectangle is ${spec.asks === "x2" ? t.x2 : spec.asks === "middle" ? t.middle : t.constant}.`;
    }
    case "extraneousRootLab": {
      const v = (value as { pick?: number | null; squared?: boolean; moves?: number } | null) ?? null;
      const eq = `${spec.radical.scale === 1 ? "" : spec.radical.scale}\u221a(x + ${spec.radical.c}) = ${spec.line.m === 1 ? "" : spec.line.m}x${spec.line.b >= 0 ? " + " + spec.line.b : " - " + Math.abs(spec.line.b)}`;
      const state = v?.squared ? "Both sides have been squared." : "Both sides are still un-squared.";
      const picked = typeof v?.pick === "number" ? `Candidate ${fmt(v.pick)} is selected.` : "No candidate selected yet.";
      const asks =
        spec.targetPhase === "identifyPhantom"
          ? "The step asks which candidate is the phantom."
          : spec.targetPhase === "identifyTrue"
            ? "The step asks which candidate genuinely solves the equation."
            : "The step asks why the phantom appeared.";
      return `${eq}. ${state} ${picked} ${asks}`;
    }
    case "signChart": {
      const v = (value as Array<"+" | "-"> | null) ?? null;
      // S237: the widget cuts the line with signChartCuts(roots, poles); a pole of odd order flips
      // the sign exactly as an odd root does. Describing roots alone narrated a different picture
      // than the one drawn, and threw on a spec with poles but no roots (authored: rf-01-03).
      const cuts = signChartCuts(spec.roots, spec.poles);
      const xs = cuts.map((c) => c.x);
      const truth = signChartSigns(spec.roots, spec.leadingPositive, spec.poles);
      const intervals = xs.length === 0
        ? ["the whole line"]
        : [`left of ${fmt(xs[0])}`, ...xs.map((x, i) => (i === xs.length - 1 ? `right of ${fmt(x)}` : `between ${fmt(x)} and ${fmt(xs[i + 1])}`))];
      const cutsTxt = cuts.map((c) => (c.kind === "pole"
        ? `${fmt(c.x)} (pole, multiplicity ${c.mult}${c.mult % 2 === 0 ? ", sign holds" : ", sign changes"})`
        : `${fmt(c.x)} (multiplicity ${c.mult}${c.mult % 2 === 0 ? ", bounce" : ", cross"})`)).join(", ");
      const hasPole = cuts.some((c) => c.kind === "pole");
      const hasRoot = cuts.some((c) => c.kind === "root");
      const lead = hasPole && hasRoot ? "Roots and poles at" : hasPole ? "Poles at" : "Roots at";
      const where = cuts.length === 0
        ? "No roots or poles, so the sign never changes."
        : `${lead} ${cutsTxt}, cutting the line into ${intervals.length} ${intervals.length === 1 ? "interval" : "intervals"}.`;
      const set = v ? `Signs set so far: ${intervals.map((iv, i) => `${iv}: ${v[i] ?? "unset"}`).join("; ")}.` : "No signs set yet.";
      return `${where} ${set} The rightmost interval is ${truth[truth.length - 1]} because the leading term is ${spec.leadingPositive ? "positive" : "negative"}.`;
    }
    case "circleMeasureExplore": {
      const v = typeof value === "number" ? value : spec.start;
      const shown = circleMeasureReadout(spec.mode, spec.radius, v);
      const desc = spec.mode === "chordDistance" ? `a chord ${fmt(v)} from the center has length ${fmt(+shown.toFixed(2))}` : spec.mode === "tangentLength" ? `from a point ${fmt(v)} from the center, the tangent segment measures ${fmt(+shown.toFixed(2))}` : `the sector's angle is set to ${fmt(v)}°`;
      return `Circle of radius ${fmt(spec.radius)}: ${desc}. The target reading is ${fmt(spec.mode === "arcSector" ? spec.targetAngle : spec.targetLength)}.`;
    }
    case "netFold": {
      const v = (value as { l: number; w: number; h: number } | null) ?? { l: spec.lStart, w: spec.wStart, h: spec.hStart };
      const sa = 2 * (v.l * v.w + v.l * v.h + v.w * v.h);
      return (
        `The box is ${fmt(v.l)} × ${fmt(v.w)} × ${fmt(v.h)}; its net unfolds into three face-pairs of ` +
        `${fmt(v.l * v.w)}, ${fmt(v.l * v.h)} and ${fmt(v.w * v.h)} squares each, for a surface area of ${fmt(sa)}. ` +
        `The target surface area is ${fmt(spec.targetSurfaceArea)}.`
      );
    }
    case "sampleSim": {
      const v = (value as { size: number; draws: number } | null) ?? { size: spec.sizes[0], draws: 0 };
      return (
        `The population's true proportion is ${fmt(spec.populationP)}. Each draw takes a sample of ${fmt(v.size)} and plots its ` +
        `sample proportion as a dot; ${fmt(v.draws)} draw${v.draws === 1 ? "" : "s"} so far. Bigger samples pull the dots into a tighter band around ${fmt(spec.populationP)}.`
      );
    }
    case "ciCapture": {
      const v = (value as { level: number; drawn: number } | null) ?? { level: spec.levels[0], drawn: 0 };
      return (
        `Samples of ${fmt(spec.sampleSize)} from a population with true proportion ${fmt(spec.populationP)}: each draw paints a ${fmt(v.level)}% ` +
        `confidence interval as a strip, green when it captures the truth. ${fmt(v.drawn)} strip${v.drawn === 1 ? "" : "s"} drawn — in the long run about ${fmt(v.level)}% should capture it.`
      );
    }
    case "shuffleTest": {
      const v = (value as { shuffles: number; verdict: "chance" | "real" | null } | null) ?? { shuffles: 0, verdict: null };
      const mean = (a: number[]) => a.reduce((s0, x) => s0 + x, 0) / a.length;
      const diff = mean(spec.groupA) - mean(spec.groupB);
      return (
        `${spec.groupALabel} vs ${spec.groupBLabel}: the observed mean difference is ${fmt(+diff.toFixed(2))}. ` +
        `Each shuffle deals the same numbers into two random groups and plots the difference chance alone produces; ${fmt(v.shuffles)} shuffle${v.shuffles === 1 ? "" : "s"} run. ` +
        `Verdict entered: ${v.verdict === null ? "none yet" : v.verdict === "chance" ? "chance could explain it" : "the difference looks real"}.`
      );
    }
    case "compassConstruct": {
      const v = typeof value === "number" ? value : spec.start;
      const goal = COMPASS_GOAL[spec.mode] ?? "the construction";
      return `Building ${goal} with a compass span of ${fmt(spec.span)}: the construction dial is at ${fmt(v)} of ${fmt(spec.target)} steps.`;
    }
    case "moneyBoard": {
      if (spec.mode === "count") {
        const show = spec.show ?? [];
        const v =
          value && typeof value === "object"
            ? (value as { counted: number[]; entry: number | null })
            : { counted: [], entry: null };
        const coll = show.map((c) => `${c.count} ${c.label}${c.count > 1 ? "s" : ""}`).join(", ");
        const chainTotal = v.counted.reduce((t, c) => t + c, 0);
        const pieces = show.reduce((t, c) => t + c.count, 0);
        return `A collection of ${coll}. ${
          v.counted.length
            ? `${v.counted.length} of ${pieces} coins counted — ${chainTotal} cents so far.`
            : "No coins counted yet."
        }${v.entry !== null ? ` Typed total: ${v.entry} cents.` : ""}`;
      }
      const tray = spec.tray ?? [];
      const target =
        spec.mode === "change"
          ? (spec.paidCents ?? 0) - (spec.priceCents ?? 0)
          : spec.targetCents ?? 0;
      const v = (value && typeof value === "object" ? value : {}) as Record<number, number>;
      const placed = tray
        .map((d) => ({ d, c: v[d.cents] ?? 0 }))
        .filter((x) => x.c > 0)
        .map((x) => `${x.c} ${x.d.label}${x.c > 1 ? "s" : ""}`);
      const total = tray.reduce((t, d) => t + d.cents * (v[d.cents] ?? 0), 0);
      const framing =
        spec.mode === "change"
          ? `A purchase: paid ${spec.paidCents} cents, cost ${spec.priceCents} cents. Build the change. `
          : "";
      return `${framing}A coin tray offering ${tray.map((d) => d.label).join(", ")}. ${
        placed.length ? `Placed: ${placed.join(", ")} — ${total} cents so far.` : "Nothing placed yet."
      }${spec.mode === "change" ? "" : ` Target: ${target} cents.`}`;
    }
    case "fractionGrid": {
      const v =
        value && typeof value === "object"
          ? (value as { rows: number; cols: number; shadeR: number; shadeC: number })
          : null;
      if (!v) return `A unit square to partition into rows and columns for ${spec.num1}/${spec.den1} × ${spec.num2}/${spec.den2}.`;
      return `The square has ${v.rows} rows (${v.shadeR} shaded sky) and ${v.cols} columns (${v.shadeC} shaded tangerine); the overlap covers ${v.shadeR * v.shadeC} of ${v.rows * v.cols} cells.`;
    }
    case "fractionCompare":
      return null; // two labelled tappable bars + a live status carry the state
    case "oddEvenPairs":
      return null; // chip row aria-label + live status narrate pairing progress
    case "absValueLine": {
      const parts = spec.items.map((i) => {
        const mag = Math.abs(i.value);
        const side = i.value < 0 ? "left of" : i.value > 0 ? "right of" : "at";
        return `${i.label} sits ${mag} ${mag === 1 ? "unit" : "units"} ${side} zero`;
      });
      const picked = typeof value === "string" ? value : null;
      const chosen =
        picked === "equal"
          ? ` You chose "${spec.equalLabel ?? "same distance"}".`
          : picked
            ? ` You chose ${spec.items.find((i) => i.id === picked)?.label ?? picked}.`
            : " Nothing is chosen yet.";
      return `On the number line, ${parts.join("; ")}. Distance from zero ignores the sign.${chosen}`;
    }
    case "numberLineRay": {
      /* S215 follow-up: derived through the model, not reimplemented here. The persisted `value` is
       * only the mathematical claim (coeff/constant/relation/inclusive) — the frame (variable,
       * window, policy) always comes from the spec, exactly as the widget's own `model.normalize`
       * merges the two. `deriveLine`'s `sentence` is the same string the widget hands a screen
       * reader for the picture itself ("A number line shaded for …"), so this can never drift from
       * what's actually drawn. */
      const fallback = makeRayCanonical({
        coeff: rat(spec.start.coeff.n, spec.start.coeff.d),
        constant: rat(spec.start.constant.n, spec.start.constant.d),
        relation: spec.start.relation,
        inclusive: spec.start.inclusive,
        variable: spec.variable,
        window: {
          min: rat(spec.window.min.n, spec.window.min.d),
          max: rat(spec.window.max.n, spec.window.max.d),
          tickStep: rat(spec.window.tickStep.n, spec.window.tickStep.d)
        },
        policy: { step: rat(spec.step.n, spec.step.d), outOfRange: spec.outOfRange, offLattice: spec.offLattice }
      });
      const canonical = normalizeRayCanonical(value, fallback);
      const relationView = deriveRelationView(canonical);
      const line = deriveLine(canonical);
      // The relation as WRITTEN, then its solution set in words — the target is never spoken here
      // (the widget itself renders it only inside the reveal ghost, `tone === "info"`, which this
      // function does not receive; parity means the same task, not an easier one).
      return `${relationView.text}. ${line.sentence}`;
    }
    default:
      return null;
  }
}

/* ── s44: the "available actions" field of the accessibility panel ──────────
   SPECIFIC entries exist only for kinds whose controls were verified by hand;
   everything else gets the honest default — which is TRUE for every kind,
   because the keyboard gate drives all 81 registered widgets to a correct
   answer through native controls alone (widgets.keyboard.test.tsx, with a
   registry-coverage lock so no future kind can skip it). */
const ACTION_DEFAULT =
  "Every control is a native button, slider, or text field — Tab moves between them, arrow keys adjust sliders, Enter or Space activates buttons. Anything draggable has this keyboard path too.";

const WIDGET_ACTIONS: Partial<Record<TWidget["type"], string>> = {
  pointEntry: "Type each coordinate into its labelled field (first value, second value); minus signs are allowed. The mini-grid shows your point as you type.",
  placeCompare: "Tab to the comparison symbols — less than, equal to, greater than — and press the one that holds.",
  lengthCompare: "Each object is a button naming its length in units. Tab between them and press the one your answer picks.",
  absValueLine: "Each number is a button under the line; a separate button says they're the same distance. Press your choice.",
  moneyBoard: "The tray has an Add and a Remove button per coin, each naming its value and how many are placed. Build the total by pressing them.",
  fractionGrid: "Four labelled sliders: row count, shade in rows, column count, shade in columns. Arrow keys change each by one; the readout narrates the build.",
  hundredthsGrid: "One slider sets how many cells are shaded; arrow keys move it one cell and the readout speaks the count and its decimal. Tapping a cell or a column number sets the same fill directly.",
  fractionCompare: "The two bars are buttons naming their shaded fractions; a third button says they're equal. Press the bar showing more.",
  oddEvenPairs: "Press \"Pair two\" until no pair remains, then press odd or even.",
  lineExplore: "Two sliders — slope and intercept — with live value readouts. Arrow keys move them one step.",
  matrixTransform: "Four minus/plus button pairs step the matrix entries a, b, c, d; press one and the picture and determinant readout update.",
  fractionBar: "Sliders set how many equal parts and how many are shaded; the bar and its fraction readout follow.",
  slider: "One labelled slider; arrow keys move it one step and the readout speaks the value.",
  lineRelationLab: "Two labelled sliders rotate and translate the active line; live readouts name the relation and the angle.",
  triangleConstraintLab: "Criterion buttons change the locked givens, a slider changes the angle, and a button tests whether a second triangle can exist.",
  coordinateProofLab: "Two sliders position vertex D; evidence buttons reveal slopes, diagonal midpoints, and side lengths.",
  solidSliceLab: "A slider moves the section plane through the solid, and a button adds an equal-base-area comparison solid.",
  triangleAngleLab: "Drag the highlighted vertex directly, or use the two labelled sliders — Vertex C across and Vertex C height — with Arrow keys; all three angle labels update live.",
  verticalLineScanner: "A labelled slider sweeps the vertical line; two verdict buttons record function or not a function.",
  covariationScrubber: "One labelled slider changes the shared input while the context, table, graph, and equation update together.",
  samplingBiasLab: "Choose a sampling method with buttons, set sample size with a slider, and press Draw sample repeatedly.",
  shapeFamilyBuilder: "Four labelled sliders set sides, right angles, equal sides, and parallel pairs; the preview updates live.",
  shapeHierarchyLab: "Inspect the fixed family map or triangle givens, then Tab to an exact claim and press Enter or Space. Selecting a claim opens the evidence it would need — a chain of properties, an example, a counterexample, a blocking property, or a classification; the chosen claim remains visible on reveal.",
  unitRuler: "Buttons align zero, place the next unit, select unit size, and test exact, gap, or overlap spacing.",
  estimateSlider: "Continuous mode uses one labelled slider. Exact-comparison mode uses candidate buttons; selecting one draws its distance from the stated actual value.",
  scaledCircleLab: "Inspect the fixed drawing-to-real scale chain and circle formula card, then Tab to one exact claim button and press Enter or Space. Your chosen claim remains visible on reveal.",
  percentChangeLab: "Inspect the fixed base price and percent-change strip, then Tab to one final-price claim and press Enter or Space. The chosen claim remains visible on reveal.",
  equationOutcomeLab: "Inspect the fixed equation, collect like terms, then Tab to the supported outcome claim and press Enter or Space.",
  signedFractionLab: "Inspect the fixed operand signs and fraction magnitudes. In division, verify the divisor becomes its reciprocal. Then Tab to one exact result claim and press Enter or Space; the selected path remains visible on reveal.",
  triangleClosureLab: "Use Left and Right Arrow on the hinge-angle slider at least twice, watching the endpoint span compare with the third beam. Then Tab to a frame claim and press Enter or Space.",
  trialProbabilityLab: "Choose one exact fraction button. The evidence strip and claim marker project your fraction onto the same total, so numerator, denominator, complement, and theoretical-versus-experimental differences stay visible.",
  compoundEventLab: "Tab to the claim buttons and press Enter or Space to select exactly one count or probability claim. The stage cards and the full ordered sample space stay fixed while you choose, so the product of stage choices and the favourable-over-total probability remain separately visible.",
  compositeAreaLab: "Inspect the fixed geometric pieces, then Tab to the exact area-claim buttons and press Enter or Space. Added pieces use plus badges; cut-away pieces use minus badges and dashed berry patterns. Your selected claim stays visible on reveal.",
  proportionalReasoningLab: "Use native buttons to normalize each row or build each multiplicative stage, then enter a value or select one exact claim. Each conclusion appears only once you have inspected the rows it depends on. A shown answer appears as a separate faded copy, so what you entered stays as you left it.",
  placeValueTransformLab: "Read the aligned base-ten source, then Tab through the derived-stage buttons and press Enter or Space to inspect the required digit, rounding, scaling, or exponent steps. Enter a value or choose one exact claim. A shown answer appears as a separate faded copy, so the value you typed stays as you left it.",
  graphStoryLab: "Read mode shows one labelled graph and exact claim buttons. Build mode uses Tab plus Enter or Space to add labelled segment cards in story order; Back removes the last card and Clear restarts. A shown answer is drawn as a separate dashed graph, so the cards you placed stay exactly where you left them.",
  conditionalTableLab: "Conditional mode uses row or column condition buttons and table-cell buttons. Read mode keeps the table fixed and uses exact claim buttons; highlighted cells and margins show the count or denominator used.",
  conicLocusLab: "One labelled slider changes eccentricity; arrow keys move among circle, ellipse, parabola, and hyperbola cases while the focus-directrix ratio and locus update.",
  derivativeRuleLab: "Product mode uses one labelled slider. Chain, quotient, and substitution modes use two labelled sliders; all live terms and linked representations update.",
  relatedRatesLab: "One labelled slider moves the ladder foot; arrow keys change x while the height and vertical rate update under the fixed-length invariant."
};

export function actionsFor(type: TWidget["type"]): string {
  return WIDGET_ACTIONS[type] ?? ACTION_DEFAULT;
}
