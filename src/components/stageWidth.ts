import type { TWidget } from "@/lib/schema";

/**
 * The lesson player's principled width system (three tiers, not per-widget
 * hard-coding):
 *
 * - `narrow`  — the reading column. Prose, MCQs, numeric entry, token/tile
 *               builders: text-first steps where a wider stage would only
 *               stretch line lengths.
 * - `medium`  — simple visual tools (ten frames, fraction bars, clocks,
 *               number lines): compact by design; a little extra room keeps
 *               controls and visual together without diluting either.
 * - `wide`    — mathematical laboratories (coordinate planes, constructions,
 *               simulations, calculus panels, multi-representation systems):
 *               these earn the widest stage a tablet/desktop can give while
 *               the prose above them stays at reading width.
 *
 * The player applies the tier to the step's main column AND to the header /
 * footer inner containers, so actions and progress never detach from the
 * content width they govern. On phones every tier collapses to the viewport
 * (minus the gutters), so mobile behavior is unchanged.
 *
 * The Record is exhaustive over the widget union: registering a new widget
 * without choosing its tier is a compile error, same contract as evaluate().
 */
export type StageTier = "narrow" | "medium" | "wide";

export const STAGE_TIER: Record<TWidget["type"], StageTier> = {
  // A number line with labelled ticks, plus a symbolic strip and a both-sides row beneath it.
  numberLineRay: "wide",
  // Two curves, a reflected region, a probe and a candidate row — this needs the width.
  extraneousRootLab: "wide",
  binomialAreaLab: "wide",
  shapeParts: "medium",
  triangleConstraintLab: "wide",
  coordinateProofLab: "wide",
  solidSliceLab: "wide",
  lineRelationLab: "wide",
  triangleAngleLab: "wide",
  verticalLineScanner: "wide",
  covariationScrubber: "wide",
  samplingBiasLab: "wide",
  shapeFamilyBuilder: "wide",
  shapeHierarchyLab: "wide",
  unitRuler: "wide",
  // ---- narrow: text-first answering surfaces ----
  mcq: "narrow",
  numeric: "narrow",
  fractionEntry: "narrow",
  pointEntry: "narrow",
  placeCompare: "medium",
  mixedRegroup: "medium",
  columnCalc: "medium",
  evalOrder: "medium",
  // Ruler + chips + two direction buttons: compact by design, needs room for the chain path.
  unitChain: "medium",
  // A drawn row of icons or a short bar plus a tap-scale: compact, reading-column friendly.
  graphRead: "medium",
  // A coordinate grid plus two leg controls — the graph needs room to read exact lattice points.
  slopeTriangle: "wide",
  rationalCompare: "medium",
  buildExpression: "narrow",
  dragOrder: "narrow",
  dragBucket: "narrow",
  matchPairs: "narrow",
  toggleExplore: "narrow",
  steppedReveal: "narrow",
  functionMachine: "narrow",
  ratioTable: "narrow",
  radicalCheck: "narrow",

  // ---- medium: compact visual tools ----
  slider: "medium",
  fractionBar: "medium",
  tapDiagram: "medium",
  plotPoint: "medium",
  tenFrame: "medium",
  numberLineHop: "medium",
  baseTenCompose: "medium",
  subitizeFlash: "medium",
  lengthCompare: "medium",
  absValueLine: "medium",
  moneyBoard: "medium",
  fractionGrid: "medium",
  fractionCompare: "medium",
  oddEvenPairs: "medium",
  placeValue: "medium",
  percentBar: "medium",
  equationOutcomeLab: "wide",
  signedFractionLab: "wide",
  integerChips: "medium",
  algebraTiles: "medium",
  fractionOfSet: "medium",
  areaModel: "medium",
  clockSet: "medium",
  elapsedTime: "medium",
  balanceScale: "medium",
  // Three stacked rows of cards that wrap; medium keeps the tray beside the track it feeds rather
  // than stranding them at opposite edges of a wide stage.
  inversePipeline: "medium",
  // Beam plus two pan cards side by side; medium keeps the pans large enough to tap at 360px.
  solveBalance: "medium",
  angleMeasure: "medium",
  estimateSlider: "medium",
  barBuilder: "medium",
  dotPlot: "medium",
  volumeBuilder: "medium",
  netFold: "medium",
  spinnerSim: "medium",
  treeDiagram: "medium",
  numberLinePlace: "medium",
  doubleNumberLine: "medium",
  signChart: "medium",
  sequenceBuild: "medium",
  distanceGrid: "medium",
  probabilityArea: "medium",
  hundredthsGrid: "medium",

  // ---- wide: mathematical laboratories ----
  lineExplore: "wide",
  quadraticExplore: "wide",
  systemsExplore: "wide",
  unitCircleExplore: "wide",
  transformExplore: "wide",
  rotationLab: "wide",
  dilationExplore: "wide",
  scatterFit: "wide",
  boxPlot: "wide",
  distributionCompareLab: "wide",
  trialProbabilityLab: "wide",
  scaledCircleLab: "wide",
  percentChangeLab: "wide",
  triangleClosureLab: "wide",
  compoundEventLab: "wide",
  compositeAreaLab: "wide",
  graphZoom: "wide",
  expLogExplore: "wide",
  secantSlope: "wide",
  argandExplore: "wide",
  vectorExplore: "wide",
  matrixTransform: "wide",
  circleMeasureExplore: "wide",
  circleAngleExplore: "wide",
  polarTrace: "wide",
  compassConstruct: "wide",
  quadDrag: "wide",
  triangleSolve: "wide",
  derivativeTrace: "wide",
  riemannSum: "wide",
  accumulateArea: "wide",
  sliceSum: "wide",
  taylorApprox: "wide",
  slopeField: "wide",
  sampleSim: "wide",
  ciCapture: "wide",
  shuffleTest: "wide",
  pointSetReasoningLab: "wide",
  geometricConstraintLab: "wide",
  exactNumberLab: "wide",
  affineRelationshipLab: "wide",
  quotientReasoningLab: "wide",
  proportionalReasoningLab: "wide",
  placeValueTransformLab: "wide",
  graphStoryLab: "wide",
  conditionalTableLab: "wide",
  conicLocusLab: "wide",
  derivativeRuleLab: "wide",
  relatedRatesLab: "wide"
};

/** Tailwind max-width class for a tier (statically enumerated so the JIT sees them). */
export function stageWidthClass(tier: StageTier): string {
  switch (tier) {
    case "narrow":
      return "max-w-xl";
    case "medium":
      return "max-w-2xl";
    case "wide":
      return "max-w-3xl";
  }
}

/** The tier a lesson step renders at: its widget's tier, or the reading column. */
export function stepTier(widget: TWidget | undefined): StageTier {
  return widget ? STAGE_TIER[widget.type] : "narrow";
}
