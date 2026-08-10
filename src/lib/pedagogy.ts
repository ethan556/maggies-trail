import { conditionalTableReadTruth, sequenceReasoningTruth, proportionalReasoningChoiceCorrect, placeValueTransformChoiceCorrect, pointSetReasoningChoiceCorrect, geometricConstraintChoiceCorrect, exactNumberChoiceCorrect, affineRelationshipChoiceCorrect, quotientReasoningChoiceCorrect, graphStoryChoiceCorrect } from "./schema";
import type { TLesson, TStep } from "./schema";
import { compoundEventChoiceCorrect, compositeAreaChoiceCorrect, trialProbabilityEquivalent, scaledCircleChoiceCorrect, percentChangeChoiceCorrect, signedFractionChoiceCorrect, shapeHierarchyChoiceCorrect, triangleClosureChoiceCorrect, equationOutcomeChoiceCorrect, widgetIntegrityErrors, type TDailyProblem } from "./schema";
import { evalRule } from "./evaluate";

const ACTION_KINDS = new Set(["interactive", "check", "challenge"]);
/** Generic-feedback blocklist: incorrect-answer feedback must diagnose, never dismiss. */
const GENERIC = /^["'‘“]?(incorrect|wrong|try again|no|nope|not right|bad|sorry)\b/i;
/** Minimum length for a wrong-path feedback on a graded step to count as a real diagnosis.
 * Promoted from the standalone misconception audit (scripts/audit_misconceptions.py). */
const MIN_DIAGNOSIS_CHARS = 25;

function wordCount(s: string): number {
  const t = s.trim();
  return t === "" ? 0 : t.split(/\s+/).length;
}

/** Every feedback string attached to an INCORRECT outcome for this step. */
function incorrectFeedbackStrings(s: TStep): string[] {
  const w = s.widget;
  if (!w) return [];
  return widgetWrongPaths(w);
}

/** Every wrong-path feedback string a widget can emit. Exported so the solvability gate can prove
 * each one is actually REACHABLE — a wrong path that cannot fire is dead feedback, which looks like
 * diagnosis and is decoration. */
export function widgetWrongPaths(w: NonNullable<TStep["widget"]>): string[] {
  switch (w.type) {
    // All three are reachable: undo in the original order, undo in the right order without flipping,
    // and anything else (wrong card, short track). The evaluator checks them in that order.
    case "inversePipeline":
      return [w.forwardOrderFeedback, w.unflippedFeedback, w.missFeedback];
    // Unbalanced: remove a unit from one side. Not-isolated: check before finishing. Miss: remove
    // every x-tile while keeping the pans level (possible only via matching removals — reachable
    // whenever b > 0 or a > 1; the integrity check enforces that).
    case "solveBalance":
      return [w.unbalancedFeedback, w.notIsolatedFeedback, w.missFeedback];
    case "mcq":
      return w.options.filter((o) => !o.correct).map((o) => o.feedback);
    // Reciprocal and sign-flip diagnoses are derived at grade time; the authored surface is the
    // named pairs plus the fallback.
    case "slopeTriangle":
      return [...w.commonPairs.map((c) => c.feedback), w.fallbackFeedback];
    // One shared body for the commonResults-shaped engines. unitChain's wrong-DIRECTION
    // diagnoses are likewise derived at grade time, so only the authored landings appear here.
    case "mixedRegroup":
    case "columnCalc":
    case "graphRead":
      return [...w.commonResults.map((r) => r.feedback), w.fallbackFeedback];
    case "unitChain":
    case "evalOrder":
      return [...w.commonResults.map((r) => r.feedback), w.fallbackFeedback];
    case "lengthCompare":
      return [
        ...w.items.filter((i) => i.feedback).map((i) => i.feedback!),
        ...(w.unalignedFeedback ? [w.unalignedFeedback] : []),
        w.missFeedback
      ];
    case "moneyBoard":
      if (w.mode === "count")
        return [
          ...w.commonEntries.map((e) => e.feedback),
          w.mismatchFeedback,
          ...(w.fallbackFeedback ? [w.fallbackFeedback] : [])
        ];
      return [
        ...w.commonTotals.map((c) => c.feedback),
        ...(w.countFeedback ? [w.countFeedback] : []),
        ...(w.lowFeedback ? [w.lowFeedback] : []),
        ...(w.highFeedback ? [w.highFeedback] : [])
      ];
    case "fractionGrid":
      return [...w.commonBuilds.map((b) => b.feedback), w.rowFeedback, w.colFeedback];
    case "fractionCompare":
      return [w.leftFeedback, w.rightFeedback, w.equalFeedback].filter((x): x is string => Boolean(x));
    case "oddEvenPairs": {
      const ones = w.mode === "onesDigit" ? w.n % 10 : w.n;
      return [
        w.oddFeedback,
        w.evenFeedback,
        // With 0 or 1 ones there is nothing to pair — the unfinished path can't exist.
        ...(ones > 1 ? [w.unfinishedFeedback] : [])
      ].filter((x): x is string => Boolean(x));
    }
    case "absValueLine":
      return [
        ...w.items.filter((i) => i.feedback).map((i) => i.feedback!),
        ...(w.equalFeedback ? [w.equalFeedback] : []),
        w.missFeedback
      ];
    case "numeric":
      return [...w.commonErrors.map((e) => e.feedback), w.fallbackFeedback];
    case "fractionEntry":
      return [
        ...w.commonEntries.map((e) => e.feedback),
        ...(w.formFeedback ? [w.formFeedback] : []),
        w.fallbackFeedback
      ];
    case "placeCompare":
    case "rationalCompare":
      return (["lt", "eq", "gt"] as const).filter((k) => k !== w.answer).map((k) => (k === "lt" ? w.ltFeedback : k === "eq" ? w.eqFeedback : w.gtFeedback)).filter((f): f is string => !!f);
    case "pointEntry":
      return [...w.commonEntries.map((e) => e.feedback), w.fallbackFeedback];
    case "slider":
      return [w.lowFeedback, w.highFeedback];
    case "lineExplore":
      return [w.slopeFeedback, w.interceptFeedback];
    case "fractionBar":
      return [...w.commonFractions.map((t) => t.feedback), w.lowFeedback, w.highFeedback];
    case "quadraticExplore":
      return [w.shapeFeedback, w.vertexFeedback];
    case "unitCircleExplore":
      // Dial mode grades dial-by-dial: the per-dial diagnoses are the wrong paths, and the base
      // low/high strings are inert scaffolding required by the base shape. Ghost-choice mode adds
      // each impostor's detachment diagnosis to the angle paths.
      if (w.dials) return w.dials.map((d) => d.feedback);
      if (w.ghostChoices)
        return [
          ...w.ghostChoices.filter((c) => c.feedback).map((c) => c.feedback as string),
          w.lowFeedback,
          w.highFeedback,
        ];
      return [w.lowFeedback, w.highFeedback];
    case "systemsExplore":
      return [w.offLine1Feedback, w.offLine2Feedback];
    case "numberLinePlace":
      return [...w.commonPlacements.map((c) => c.feedback), w.lowFeedback, w.highFeedback];
    case "functionMachine":
      return [w.lowFeedback, w.highFeedback];
    case "probabilityArea":
      return [w.lowFeedback, w.highFeedback];
    case "hundredthsGrid":
      return [...w.commonCounts.map((c) => c.feedback), w.lowFeedback, w.highFeedback];
    case "transformExplore":
      return [w.offsetFeedback, w.reflectFeedback];
    case "angleMeasure":
      return [...(w.commonAngles ?? []).map((entry) => entry.feedback), w.lowFeedback, w.highFeedback];
    case "rotationLab":
      return [...(w.commonTurns ?? []).map((t) => t.feedback), w.lowFeedback, w.highFeedback];
    case "dilationExplore":
      return [w.lowFeedback, w.highFeedback];
    case "barBuilder":
      return [w.partialFeedback];
    case "dotPlot":
      return [w.partialFeedback];
    case "boxPlot":
      return [w.orderFeedback, w.valueFeedback];
    case "compoundEventLab":
      return [
        ...w.choices.filter((choice) => !compoundEventChoiceCorrect(w, choice)).map((choice) => choice.feedback),
        w.fallbackFeedback
      ];
    case "compositeAreaLab":
      return [
        ...w.choices.filter((choice) => !compositeAreaChoiceCorrect(w, choice)).map((choice) => choice.feedback),
        w.fallbackFeedback
      ];
    case "scaledCircleLab":
      return [...w.choices.filter((choice) => !scaledCircleChoiceCorrect(w, choice)).map((choice) => choice.feedback), w.fallbackFeedback];
    case "percentChangeLab":
      return [...w.choices.filter((choice) => !percentChangeChoiceCorrect(w, choice)).map((choice) => choice.feedback), w.fallbackFeedback];
    case "equationOutcomeLab":
      return w.mode==="classify"
        ? [...w.choices.filter((choice) => !equationOutcomeChoiceCorrect(w, choice)).map((choice) => choice.feedback), w.fallbackFeedback]
        : [...w.operations.map((operation)=>operation.feedback).filter((feedback):feedback is string=>Boolean(feedback)),...w.numericErrors.map((error)=>error.feedback),w.explorationFeedback,w.fallbackFeedback];
    case "signedFractionLab":
      return [...w.choices.filter((choice) => !signedFractionChoiceCorrect(w, choice)).map((choice) => choice.feedback), w.fallbackFeedback];
    case "triangleClosureLab":
      return [...w.choices.filter((choice) => !triangleClosureChoiceCorrect(w, choice)).map((choice) => choice.feedback), w.fallbackFeedback];
    case "trialProbabilityLab":
      return [
        ...w.choices.filter((choice) => !trialProbabilityEquivalent(w, choice)).map((choice) => choice.feedback),
        w.fallbackFeedback
      ];
    case "distributionCompareLab":
      return w.mode === "measure"
        ? w.measureChoices.filter((c) => w.answer === undefined || Math.abs(c.value - w.answer) > w.tolerance).map((c) => c.feedback)
        : w.judgeOptions.filter((o) => !o.correct).map((o) => o.feedback);
    case "areaModel":
      return [...w.commonCounts.map((entry) => entry.feedback), w.lowFeedback, w.highFeedback];
    case "placeValue":
      return [w.lowFeedback, w.highFeedback];
    case "doubleNumberLine":
      return [w.lowFeedback, w.highFeedback];
    case "scatterFit":
      return [w.slopeFeedback, w.offsetFeedback];
    case "fractionOfSet":
      return [w.lowFeedback, w.highFeedback];
    case "percentBar":
      return [w.lowFeedback, w.highFeedback];
    case "integerChips":
      return [w.lowFeedback, w.highFeedback];
    case "volumeBuilder":
      return [w.lowFeedback, w.highFeedback];
    case "netFold":
      return [w.lowFeedback, w.highFeedback];
    case "ratioTable":
      return [w.lowFeedback, w.highFeedback];
    case "elapsedTime":
      return [w.lowFeedback, w.highFeedback];
    case "treeDiagram":
      return [w.lowFeedback, w.highFeedback];
    case "spinnerSim":
      return [w.lowFeedback, w.highFeedback];
    case "circleAngleExplore":
      return [w.lowFeedback, w.highFeedback];
    case "expLogExplore":
      return [w.lowFeedback, w.highFeedback];
    case "secantSlope":
      return [w.lowFeedback, w.highFeedback];
    case "argandExplore":
      return [w.realFeedback, w.imagFeedback];
    case "matrixTransform":
      return [w.swappedFeedback, w.signFeedback, w.fallbackFeedback];
    case "vectorExplore":
      return [w.lowFeedback, w.highFeedback];
    case "circleMeasureExplore":
      return [w.lowFeedback, w.highFeedback];
    case "polarTrace":
      return [w.lowFeedback, w.highFeedback];
    case "shapeParts":
      // Both are reachable: stop early and you get missed; tap one twice and you get doubleCount.
      return [w.missedFeedback, w.doubleCountFeedback];
    case "binomialAreaLab":
      // Every one of the three is reachable: signFeedback needs a non-zero constant to flip,
      // productMiddleFeedback is gated by the integrity rule that the product and the sum differ,
      // and partialFeedback catches everything else including the pre-sweep state.
      return [w.productMiddleFeedback, w.partialFeedback, w.signFeedback];
    case "extraneousRootLab":
      // signRegionFeedback is a PROBE readout, not a grading path — it is shown where the probe
      // sits, never returned by evaluate — so reporting it here would be dead feedback the
      // solvability gate would rightly flag. phantomPickedFeedback is only reachable when there IS
      // a phantom to pick.
      return w.phantomRoot !== null
        ? [w.notSquaredFeedback, w.phantomPickedFeedback, w.domainConfusionFeedback]
        : [w.notSquaredFeedback, w.domainConfusionFeedback];
    case "signChart":
      // bounceFeedback can only ever fire if there IS an even root to bounce off. With only single
      // roots the grader can never emit it, so reporting it as a wrong path would be a lie — and the
      // solvability gate would (rightly) call it dead feedback. The string stays in the spec as a
      // safety net for lessons that later add a repeated root.
      return w.roots.some((r) => r.mult % 2 === 0)
        ? [w.crossFeedback, w.bounceFeedback]
        : [w.crossFeedback];
    case "sequenceBuild":
      return w.task === "dial"
        ? [w.lowFeedback, w.highFeedback]
        // The CORRECT choice's feedback is the success path — it can never fire as a wrong
        // path, so listing it here made the dead-feedback gate demand the impossible. Likewise
        // `fallbackFeedback` only fires in numeric mode (choice mode always has the chosen
        // option's own feedback), so it is only required where it is actually reachable.
        : [
            ...w.choices.filter((choice) => choice.claim !== sequenceReasoningTruth(w).answerClaim).map((choice) => choice.feedback),
            ...w.numericErrors.map((error) => error.feedback),
            w.explorationFeedback,
            ...(w.answerMode === "numeric" ? [w.fallbackFeedback] : [])
          ];
    case "triangleSolve":
      return [w.lowFeedback, w.highFeedback];
    case "compassConstruct":
      return [w.lowFeedback, w.highFeedback];
    case "derivativeTrace":
      return [w.lowFeedback, w.highFeedback];
    case "riemannSum":
    case "accumulateArea":
    case "sliceSum":
    case "slopeField":
      return [w.lowFeedback, w.highFeedback];
    case "taylorApprox":
      return [w.lowFeedback, w.highFeedback];
    case "triangleConstraintLab":
      return [w.criterionFeedback, w.angleFeedback, w.evidenceFeedback];
    case "coordinateProofLab":
      return [w.positionFeedback, w.evidenceFeedback];
    case "solidSliceLab":
      return [w.positionFeedback, w.comparisonFeedback, w.invariantFeedback];
    case "lineRelationLab":
      return [w.angleFeedback, w.distanceFeedback];
    case "triangleAngleLab":
      return [w.targetFeedback, w.invariantFeedback];
    case "verticalLineScanner":
      return [w.moreSweepFeedback, w.verdictFeedback];
    case "covariationScrubber":
      return [w.lowFeedback, w.highFeedback];
    case "samplingBiasLab":
      return [w.methodFeedback, w.sizeFeedback, w.drawsFeedback];
    case "shapeFamilyBuilder":
      return [w.sidesFeedback, w.attributesFeedback];
    case "shapeHierarchyLab":
      return w.choices.filter((choice) => !shapeHierarchyChoiceCorrect(w, choice)).map((choice) => choice.feedback);
    case "unitRuler":
      return [w.alignFeedback, w.gapOverlapFeedback, w.unitFeedback];
    case "proportionalReasoningLab":
      return w.answerMode === "choice"
        ? [...w.choices.filter((choice)=>!proportionalReasoningChoiceCorrect(w,choice)).map((choice)=>choice.feedback), w.explorationFeedback]
        : [...w.numericErrors.map((entry)=>entry.feedback), w.explorationFeedback, w.fallbackFeedback];
    case "placeValueTransformLab":
      return w.answerMode === "choice"
        ? [...w.choices.filter((choice)=>!placeValueTransformChoiceCorrect(w,choice)).map((choice)=>choice.feedback), w.explorationFeedback]
        : [...w.numericErrors.map((entry)=>entry.feedback), w.explorationFeedback, w.fallbackFeedback];
    case "pointSetReasoningLab":
      return w.answerMode==="numeric"?[...w.numericErrors.map(entry=>entry.feedback),w.fallbackFeedback]:w.answerMode==="choice"?[...w.choices.filter(choice=>!pointSetReasoningChoiceCorrect(w,choice)).map(choice=>choice.feedback),w.fallbackFeedback]:[w.explorationFeedback];
    case "geometricConstraintLab":
      return w.answerMode==="numeric"?[...w.numericErrors.map(entry=>entry.feedback),w.explorationFeedback,w.fallbackFeedback]:w.answerMode==="choice"?[...w.choices.filter(choice=>!geometricConstraintChoiceCorrect(w,choice)).map(choice=>choice.feedback),w.explorationFeedback,w.fallbackFeedback]:[w.explorationFeedback];
    case "exactNumberLab":
      return w.answerMode==="numeric"?[...w.numericErrors.map(entry=>entry.feedback),w.fallbackFeedback]:w.answerMode==="choice"?[...w.choices.filter(choice=>!exactNumberChoiceCorrect(w,choice)).map(choice=>choice.feedback),w.fallbackFeedback]:[w.fallbackFeedback];
    case "affineRelationshipLab":
      return w.answerMode === "choice"
        ? [...w.choices.filter(choice=>!affineRelationshipChoiceCorrect(w,choice)).map(choice=>choice.feedback),w.explorationFeedback]
        : w.answerMode === "numeric"
          ? [...w.numericErrors.map(entry=>entry.feedback),w.explorationFeedback,w.fallbackFeedback]
          : w.answerMode === "point"
            ? [...w.pointErrors.map(entry=>entry.feedback),w.explorationFeedback,w.fallbackFeedback]
            : [w.explorationFeedback];
    case "quotientReasoningLab":
      return w.answerMode === "choice"
        ? [...w.choices.filter((choice) => !quotientReasoningChoiceCorrect(w, choice)).map((choice) => choice.feedback), w.explorationFeedback]
        : w.answerMode === "numeric"
          ? [...w.numericErrors.map((entry) => entry.feedback), w.explorationFeedback, w.fallbackFeedback]
          : w.answerMode === "fraction"
            ? [...w.fractionErrors.map((entry) => entry.feedback), w.explorationFeedback, w.fallbackFeedback]
            : [w.explorationFeedback];
    case "graphStoryLab":
      return w.mode === "read"
        ? w.choices.filter((choice) => !graphStoryChoiceCorrect(w, choice)).map((choice) => choice.feedback)
        : [...w.wrongSequences.map((wrong) => wrong.feedback), w.fallbackFeedback];
    case "conditionalTableLab":
      return w.mode === "read" ? w.answerChoices.filter((choice)=>choice.value !== (w.readMetric ? conditionalTableReadTruth(w.counts,w.readMetric,w.targetCell).value : Number.NaN)).map((choice)=>choice.feedback) : [w.explorationFeedback, w.conditionFeedback, w.cellFeedback];
    case "conicLocusLab":
      return [w.explorationFeedback, w.lowFeedback, w.highFeedback];
    case "derivativeRuleLab":
      return [w.explorationFeedback, w.mechanismFeedback];
    case "relatedRatesLab":
      return [w.explorationFeedback, w.positionFeedback];
    // numberLineRay's diagnosis is COMPUTED from the learner's own state (which of the three facts
    // is not right yet) and carries the authored fallback as its tail, so the fallback is the only
    // authored wrong-path string this engine can emit.
    case "numberLineRay":
      return w.fallbackFeedback ? [w.fallbackFeedback] : [];
    case "quadDrag":
      return [w.sideFeedback, w.angleFeedback];
    case "radicalCheck":
      return [w.extraneousFeedback, w.missFeedback];
    case "graphZoom":
      return [w.moreZoomFeedback, w.wrongVerdictFeedback];
    case "sampleSim":
      return [w.wrongSizeFeedback, w.moreDrawsFeedback];
    case "ciCapture":
      return [w.wrongLevelFeedback, w.moreIntervalsFeedback];
    case "shuffleTest":
      return [w.moreShufflesFeedback, w.wrongVerdictFeedback];
    case "distanceGrid":
      return [w.wrongPointFeedback];
    case "algebraTiles":
      return [w.xFeedback, w.constFeedback];
    case "clockSet":
      return [w.hourFeedback, w.minuteFeedback];
    case "balanceScale":
      return [w.lowFeedback, w.highFeedback];
    case "tapDiagram":
      return [
        w.missFeedback,
        ...w.hotspots.filter((h) => !h.correct && h.feedback).map((h) => h.feedback as string)
      ];
    case "dragOrder":
      return [w.missFeedback, ...w.misorderFeedback.map((m) => m.feedback)];
    case "dragBucket":
      return [w.missFeedback, ...w.items.map((i) => i.feedback)];
    case "matchPairs":
      return [w.missFeedback, ...w.pairErrors.map((p) => p.feedback)];
    case "buildExpression":
      return [w.missFeedback, ...w.commonBuilds.map((c) => c.feedback)];
    case "plotPoint":
      return [w.missFeedback, ...w.pointErrors.map((p) => p.feedback)];
    case "toggleExplore":
      return [w.missFeedback, ...w.commonStates.map((c) => c.feedback)];
    case "steppedReveal":
      return [w.continueFeedback];
    case "estimateSlider":
      return w.choices.length > 0
        ? w.choices.filter((choice) => !choice.correct).map((choice) => choice.feedback)
        : [w.lowFeedback, w.highFeedback];
    case "tenFrame":
      return [w.missFeedback, ...w.commonCounts.map((c) => c.feedback)];
    case "numberLineHop":
      return [w.missFeedback, ...w.commonLandings.map((c) => c.feedback)];
    case "baseTenCompose":
      return [w.missFeedback, ...w.commonBuilds.map((c) => c.feedback)];
    case "subitizeFlash":
      return [w.missFeedback, ...w.commonPicks.map((c) => c.feedback)];
  }
}

/** Per-lesson lint context. Early-reader (G1–G2) lessons are figure-first, so their
 *  captions must stay short enough for a 6-year-old to read (or have read aloud). */
interface LintCtx {
  conceptWordMax: number;
}
const STANDARD_CTX: LintCtx = { conceptWordMax: 80 };
const EARLY_CTX: LintCtx = { conceptWordMax: 25 };

/** Rules that apply to a step wherever it appears (core sequence or remedial pair). */
function lintStep(s: TStep, where: string, ctx: LintCtx = STANDARD_CTX): string[] {
  const errs: string[] = [];
  if (s.kind === "concept" && wordCount(s.body) > ctx.conceptWordMax) {
    errs.push(
      `${where}/${s.id}: concept body is ${wordCount(s.body)} words (max ${ctx.conceptWordMax} for this reading profile)`
    );
  }
  if (ACTION_KINDS.has(s.kind) && !s.widget) {
    errs.push(`${where}/${s.id}: ${s.kind} step has no widget`);
  }
  if (s.kind === "check" || s.kind === "challenge") {
    if (!s.conceptTag) errs.push(`${where}/${s.id}: ${s.kind} missing conceptTag`);
    if (!s.explanationVariants) {
      errs.push(`${where}/${s.id}: ${s.kind} missing explanationVariants (needs 2)`);
    } else if (s.explanationVariants[0].trim() === s.explanationVariants[1].trim()) {
      errs.push(`${where}/${s.id}: explanationVariants must be genuinely different`);
    }
  }
  if (s.kind === "challenge" && (s.hints?.length ?? 0) !== 3) {
    errs.push(`${where}/${s.id}: challenge needs exactly 3 hints (nudge → method → near-solution)`);
  }
  if (s.widget?.type === "slider" && s.widget.start === s.widget.target) {
    errs.push(`${where}/${s.id}: slider starts on its target — no interaction would be required`);
  }
  if (s.widget?.type === "dragOrder") {
    const initial = s.widget.items.map((i) => i.id).join("|");
    if (initial === s.widget.correctOrder.join("|"))
      errs.push(`${where}/${s.id}: dragOrder items already sit in the correct order — shuffle them`);
  }
  if (s.widget?.type === "toggleExplore") {
    const allOff = Object.fromEntries(s.widget.toggles.map((t) => [t.id, false]));
    if (evalRule(s.widget.rule, allOff))
      errs.push(`${where}/${s.id}: toggleExplore lamp is already lit with every switch off`);
  }
  if (s.widget?.type === "estimateSlider" && s.widget.start !== undefined) {
    const w = s.widget;
    const start = w.start as number;
    if (w.choices.length > 0) {
      if (w.choices.find((choice) => choice.value === start)?.correct)
        errs.push(`${where}/${s.id}: estimateSlider choice mode starts on the correct candidate — no comparison required`);
    } else if (start >= w.target / w.acceptFactor && start <= w.target * w.acceptFactor) {
      errs.push(`${where}/${s.id}: estimateSlider starts inside the accepted window — no estimation required`);
    }
  }
  if (s.widget) {
    for (const e of widgetIntegrityErrors(s.widget)) errs.push(`${where}/${s.id}: ${e}`);
  }
  if (
    s.widget?.type === "numeric" &&
    (s.kind === "check" || s.kind === "challenge") &&
    s.widget.commonErrors.length < 2
  ) {
    errs.push(`${where}/${s.id}: numeric ${s.kind} needs ≥2 anticipated wrong answers with diagnostic feedback`);
  }
  if (
    s.widget?.type === "fractionEntry" &&
    (s.kind === "check" || s.kind === "challenge") &&
    s.widget.commonEntries.length + (s.widget.form !== "any" ? 1 : 0) < 2
  ) {
    errs.push(`${where}/${s.id}: fractionEntry ${s.kind} needs ≥2 anticipated wrong paths (commonEntries; a form requirement counts as one)`);
  }
  if (
    s.widget?.type === "pointEntry" &&
    (s.kind === "check" || s.kind === "challenge") &&
    s.widget.commonEntries.length < 2
  ) {
    errs.push(`${where}/${s.id}: pointEntry ${s.kind} needs ≥2 anticipated wrong tuples with diagnostic feedback`);
  }
  if (s.widget?.type === "numeric") {
    const tol = s.widget.tolerance ?? 0;
    for (const e of s.widget.commonErrors) {
      if (Math.abs(e.value - s.widget.answer) <= tol) {
        errs.push(
          `${where}/${s.id}: commonError ${e.value} equals the correct answer — the right response would be shown error feedback`
        );
      }
    }
  }
  for (const f of incorrectFeedbackStrings(s)) {
    if (GENERIC.test(f)) {
      errs.push(`${where}/${s.id}: generic incorrect-feedback "${f.slice(0, 40)}…" — diagnose the misconception instead`);
    }
  }
  // SUBSTANCE (promoted from scripts/audit_misconceptions.py to a hard gate): on a graded step,
  // a wrong-path feedback shorter than MIN_DIAGNOSIS_CHARS can state a verdict or a bare
  // correction but cannot actually name the error pattern and repair it. Terse-but-correct is
  // still a failure of §3.2 differentiator #1.
  if (s.kind === "check" || s.kind === "challenge") {
    for (const f of distractorFeedbackStrings(s)) {
      const t = f.trim();
      if (t.length > 0 && t.length < MIN_DIAGNOSIS_CHARS) {
        errs.push(
          `${where}/${s.id}: thin incorrect-feedback "${t}" (${t.length} chars < ${MIN_DIAGNOSIS_CHARS}) — name the misconception, don't just correct the value`
        );
      }
    }
  }
  // Each *competing distractor* must diagnose a DISTINCT misconception: two wrong MCQ
  // options / numeric errors / diagram hotspots sharing the same feedback is a collapsed
  // diagnosis (§3.2 differentiator #1). Confirmation-style per-item feedback on sorting
  // widgets (dragBucket, matchPairs, …) is intentionally excluded — same-category items
  // legitimately share a reason.
  const seen = new Map<string, number>();
  for (const f of distractorFeedbackStrings(s)) {
    const key = f.trim().toLowerCase();
    if (key.length > 0) seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  for (const [key, n] of seen) {
    if (n > 1) {
      errs.push(`${where}/${s.id}: ${n} distractors share identical feedback "${key.slice(0, 40)}…" — give each a distinct diagnosis`);
    }
  }
  return errs;
}

/** Feedback on genuinely *competing wrong answers* (not confirmation on correct sorts). */
function distractorFeedbackStrings(s: TStep): string[] {
  const w = s.widget;
  if (!w) return [];
  switch (w.type) {
    // All three are reachable: undo in the original order, undo in the right order without flipping,
    // and anything else (wrong card, short track). The evaluator checks them in that order.
    case "inversePipeline":
      return [w.forwardOrderFeedback, w.unflippedFeedback, w.missFeedback];
    // Unbalanced: remove a unit from one side. Not-isolated: check before finishing. Miss: remove
    // every x-tile while keeping the pans level (possible only via matching removals — reachable
    // whenever b > 0 or a > 1; the integrity check enforces that).
    case "solveBalance":
      return [w.unbalancedFeedback, w.notIsolatedFeedback, w.missFeedback];
    case "mcq":
      return w.options.filter((o) => !o.correct).map((o) => o.feedback);
    case "numeric":
      return w.commonErrors.map((e) => e.feedback);
    case "fractionEntry":
      return w.commonEntries.map((e) => e.feedback);
    case "placeCompare":
    case "rationalCompare":
      return (["lt", "eq", "gt"] as const).filter((k) => k !== w.answer).map((k) => (k === "lt" ? w.ltFeedback : k === "eq" ? w.eqFeedback : w.gtFeedback)).filter((f): f is string => !!f);
    case "pointEntry":
      return w.commonEntries.map((e) => e.feedback);
    case "tapDiagram":
      return w.hotspots.filter((h) => !h.correct && h.feedback).map((h) => h.feedback as string);
    default:
      return [];
  }
}

export function lintLesson(l: TLesson): string[] {
  const errs: string[] = [];
  const steps = l.steps;
  const n = steps.length;
  const ctx = l.readingProfile === "early" ? EARLY_CTX : STANDARD_CTX;

  if (n < 8 || n > 15) errs.push(`${l.id}: ${n} steps (must be 8–15)`);

  steps.forEach((s, i) => {
    errs.push(...lintStep(s, l.id, ctx));

    if (s.predict) {
      // A prediction is a commitment ABOUT a manipulation — it needs a
      // manipulative to be about. Anywhere else it is a disguised quiz.
      if (s.kind !== "interactive")
        errs.push(`${l.id}/${s.id}: predict is only allowed on interactive steps`);
      if (!s.widget) errs.push(`${l.id}/${s.id}: predict requires a widget to manipulate`);
    }

    if (s.kind === "concept") {
      if (steps[i + 1]?.kind === "concept") {
        errs.push(`${l.id}/${s.id}: two concept steps in a row`);
      }
      const window = steps.slice(i + 1, i + 3);
      if (!window.some((w) => w.kind === "check" || w.kind === "interactive")) {
        errs.push(`${l.id}/${s.id}: concept not followed by a check/interactive within 2 steps`);
      }
    }
    if (s.kind === "challenge" && i < Math.floor((2 * n) / 3)) {
      errs.push(`${l.id}/${s.id}: challenge appears before the final third of the lesson`);
    }
    if (s.kind === "recap") {
      if (i !== n - 1) errs.push(`${l.id}/${s.id}: recap must be the last step`);
      const t = s.takeaways?.length ?? 0;
      if (t < 1 || t > 3) errs.push(`${l.id}/${s.id}: recap needs 1–3 takeaways (has ${t})`);
      if (!s.teaser?.trim()) errs.push(`${l.id}/${s.id}: recap needs a next-lesson teaser`);
    }
  });

  const action = steps.filter((s) => ACTION_KINDS.has(s.kind)).length;
  if (action / n < 0.6) {
    errs.push(`${l.id}: only ${Math.round((100 * action) / n)}% of steps require action (min 60%)`);
  }
  if (steps[n - 1]?.kind !== "recap") errs.push(`${l.id}: last step must be a recap`);

  for (const r of l.remedials) {
    if (r.concept.kind !== "concept") errs.push(`${l.id}/remedial:${r.conceptTag}: first item must be a concept step`);
    if (r.check.kind !== "check") errs.push(`${l.id}/remedial:${r.conceptTag}: second item must be a check step`);
    if (r.check.conceptTag !== r.conceptTag) {
      errs.push(`${l.id}/remedial:${r.conceptTag}: check's conceptTag must match the pair's tag`);
    }
    errs.push(...lintStep(r.concept, `${l.id}/remedial:${r.conceptTag}`, ctx));
    errs.push(...lintStep(r.check, `${l.id}/remedial:${r.conceptTag}`, ctx));
  }

  return errs;
}

/** Daily problems get the challenge-grade subset of the lesson rules. */
export function lintDailyProblem(p: TDailyProblem, where: string): string[] {
  const errs: string[] = [];
  for (const e of widgetIntegrityErrors(p.widget)) errs.push(`${where}/${p.id}: ${e}`);
  if (p.widget.type === "numeric") {
    if (p.widget.commonErrors.length < 2) {
      errs.push(`${where}/${p.id}: daily numeric needs ≥2 anticipated wrong answers with diagnostic feedback`);
    }
    const tol = p.widget.tolerance ?? 0;
    for (const e of p.widget.commonErrors) {
      if (Math.abs(e.value - p.widget.answer) <= tol) {
        errs.push(`${where}/${p.id}: commonError ${e.value} equals the correct answer`);
      }
    }
  }
  const pseudo = {
    id: p.id,
    kind: "challenge",
    body: p.body,
    conceptTag: p.conceptTag,
    hints: p.hints,
    explanationVariants: p.explanationVariants,
    widget: p.widget
  } as unknown as TStep;
  for (const f of incorrectFeedbackStrings(pseudo)) {
    if (GENERIC.test(f)) {
      errs.push(`${where}/${p.id}: generic incorrect-feedback "${f.slice(0, 40)}…" — diagnose the misconception instead`);
    }
  }
  return errs;
}
