import type { TCMLMeta, TStep, TWidget } from "@/lib/schema";

export interface EngineCMLProfile {
  readonly kernel: NonNullable<TCMLMeta["kernel"]>;
  readonly role: "flagship" | "supporting";
  readonly actionGoal: string;
  readonly invariants: readonly string[];
  readonly misconceptions: readonly string[];
  readonly representations: readonly NonNullable<TCMLMeta["representations"]>[number][];
}

/** Direct mathematical manipulatives. Response-only and sorting surfaces are
 * intentionally absent: the product must not inflate its manipulative count. */
export const CML_ENGINE_PROFILES: Partial<Record<TWidget["type"], EngineCMLProfile>> = {
  conicLocusLab: { kernel:"spatial-invariance", role:"flagship", actionGoal:"Vary eccentricity and infer how one focus-directrix ratio generates every conic family.", invariants:["focus-directrix-ratio-defines-locus","eccentricity-classifies-conic"], misconceptions:["conics-are-unrelated-formulas","parabola-is-just-a-u-shape"], representations:["diagram","graph","table","symbolic","language"] },
  derivativeRuleLab: { kernel:"covariation", role:"flagship", actionGoal:"Change local input increments or nested rates and expose derivative rules forwards or in reverse as substitution.", invariants:["first-order-change-survives-limit","nested-rates-multiply","substitution-leaves-no-x"], misconceptions:["differentiate-factors-separately","chain-rule-adds-rates","substitution-leaves-x-behind"], representations:["diagram","table","graph","symbolic","language"] },
  relatedRatesLab: { kernel:"covariation", role:"flagship", actionGoal:"Move a constrained geometric system and coordinate its changing positions and rates through one invariant.", invariants:["ladder-length-fixed","related-rates-share-time"], misconceptions:["all-rates-constant","differentiate-variables-without-time"], representations:["diagram","table","graph","symbolic","language"] },
  secantSlope: { kernel:"covariation", role:"supporting", actionGoal:"Move an interval, compare secant and tangent slopes, and expose the equal-endpoint flat-spot guarantee.", invariants:["difference-quotient-measures-average-rate","tangent-is-secant-limit","equal-endpoints-force-zero-secant"], misconceptions:["derivative-is-y-value","zero-gap-can-be-substituted-directly","rolle-flat-spot-can-be-an-endpoint"], representations:["graph","table","symbolic","language"] },
  vectorExplore: { kernel:"spatial-invariance", role:"supporting", actionGoal:"Change vector components and coordinate geometric movement with component and dot-product representations.", invariants:["components-determine-vector","dot-product-encodes-angle"], misconceptions:["componentwise-magnitude","dot-product-is-vector"], representations:["diagram","graph","table","symbolic","language"] },
  matrixTransform: { kernel:"equivalence-transformation", role:"supporting", actionGoal:"Change matrix entries and observe how columns move basis vectors and transform the plane.", invariants:["matrix-columns-are-basis-images","determinant-scales-oriented-area"], misconceptions:["rows-are-basis-images","determinant-is-only-arithmetic"], representations:["diagram","graph","table","symbolic","language"] },
  polarTrace: { kernel:"covariation", role:"supporting", actionGoal:"Change a polar parameter and coordinate angle, radius, tracing direction, and resulting curve family.", invariants:["polar-point-depends-on-angle-and-radius","parameter-controls-symmetry"], misconceptions:["negative-radius-is-invalid","petal-count-always-equals-n"], representations:["diagram","graph","table","symbolic","language"] },
  derivativeTrace: { kernel:"covariation", role:"supporting", actionGoal:"Move along a function and coordinate position, local slope, and derivative graph.", invariants:["derivative-records-local-slope","corners-break-differentiability"], misconceptions:["derivative-copies-function-height","slope-at-corner-is-zero"], representations:["graph","table","symbolic","language"] },
  riemannSum: { kernel:"quantity-composition", role:"supporting", actionGoal:"Partition an interval and compare how sample rules accumulate approximate signed area.", invariants:["sum-is-height-times-width","refinement-controls-error"], misconceptions:["more-rectangles-always-overestimate","area-ignores-sign"], representations:["diagram","graph","table","symbolic","language"] },
  accumulateArea: { kernel:"covariation", role:"supporting", actionGoal:"Move an upper bound and coordinate accumulated area with the integrand's current value.", invariants:["accumulation-changes-at-integrand-rate","signed-area-can-decrease"], misconceptions:["integral-is-always-total-positive-area","accumulation-graph-copies-integrand"], representations:["diagram","graph","table","symbolic","language"] },
  sliceSum: { kernel:"quantity-composition", role:"supporting", actionGoal:"Refine cross-sectional slices and connect their accumulated volume estimate to a limiting integral.", invariants:["volume-is-sum-of-thin-slices","cross-section-rule-controls-each-slice"], misconceptions:["volume-is-base-area-only","slice-thickness-does-not-matter"], representations:["diagram","graph","table","symbolic","language"] },
  slopeField: { kernel:"covariation", role:"supporting", actionGoal:"Change an initial condition and trace a solution that remains tangent to the local direction field.", invariants:["field-slope-depends-on-position","solution-follows-local-slopes"], misconceptions:["all-solutions-share-one-curve","field-arrows-are-motion-vectors"], representations:["diagram","graph","table","symbolic","language"] },
  taylorApprox: { kernel:"equivalence-transformation", role:"supporting", actionGoal:"Add local derivative information term by term and compare a polynomial approximation with its target function.", invariants:["matched-derivatives-anchor-local-approximation","more-terms-expand-local-accuracy"], misconceptions:["series-equals-function-everywhere","highest-degree-term-dominates-near-center"], representations:["graph","table","symbolic","language"] },
  triangleConstraintLab: { kernel:"spatial-invariance", role:"flagship", actionGoal:"Change the given triangle constraints and test whether one or two noncongruent triangles remain possible.", invariants:["congruence-means-unique-triangle","included-angle-locks-shape"], misconceptions:["ssa-guarantees-congruence","matching-three-parts-always-sufficient"], representations:["diagram","table","symbolic","language"] },
  coordinateProofLab: { kernel:"spatial-invariance", role:"flagship", actionGoal:"Position a coordinate vertex and assemble a proof from live slope, distance, and midpoint evidence.", invariants:["parallel-lines-equal-slope","diagonals-share-midpoint"], misconceptions:["picture-is-proof","single-coordinate-check"], representations:["graph","table","symbolic","language"] },
  solidSliceLab: { kernel:"spatial-invariance", role:"flagship", actionGoal:"Move a section plane through a solid and compare cross-sectional areas at matching heights.", invariants:["equal-sections-equal-volume","section-area-tracks-height"], misconceptions:["same-surface-means-same-volume","base-shape-must-match"], representations:["concrete","diagram","table","symbolic","language"] },
  lineRelationLab: { kernel:"spatial-invariance", role:"flagship", actionGoal:"Rotate and translate a line while angle, slope, and equal-distance evidence update together.", invariants:["parallel-equal-distance","perpendicular-right-angle"], misconceptions:["appearance-only","translation-changes-angle"], representations:["diagram","table","symbolic","language"] },
  triangleAngleLab: { kernel:"spatial-invariance", role:"flagship", actionGoal:"Deform a triangle and observe that its three angles always sum to 180 degrees.", invariants:["triangle-angle-sum"], misconceptions:["shape-changes-sum","largest-angle-only"], representations:["diagram","table","symbolic","language"] },
  verticalLineScanner: { kernel:"covariation", role:"flagship", actionGoal:"Sweep a vertical line and connect intersection count to the one-output-per-input definition.", invariants:["one-output-per-input"], misconceptions:["graph-as-picture","single-test-line"], representations:["graph","table","symbolic","language"] },
  covariationScrubber: { kernel:"covariation", role:"flagship", actionGoal:"Change one input and synchronize context, table, graph, equation, and unit rate.", invariants:["constant-rate","representation-equivalence"], misconceptions:["additive-not-multiplicative","representation-disconnect"], representations:["table","graph","symbolic","language"] },
  samplingBiasLab: { kernel:"chance-sampling", role:"flagship", actionGoal:"Design repeated samples and separate selection bias from random variability.", invariants:["population-fixed","sampling-method-declared"], misconceptions:["large-sample-cures-bias","single-sample-proof"], representations:["diagram","table","graph","language"] },
  shapeFamilyBuilder: { kernel:"spatial-invariance", role:"flagship", actionGoal:"Construct a shape from defining attributes instead of prototype appearance.", invariants:["attribute-definition","family-hierarchy"], misconceptions:["prototype-only","exclusive-category"], representations:["diagram","table","symbolic","language"] },
  unitRuler: { kernel:"spatial-invariance", role:"flagship", actionGoal:"Align zero and iterate equal units with no gaps or overlaps.", invariants:["equal-unit-size","zero-alignment","gap-free-iteration"], misconceptions:["end-label-is-length","gaps-overlaps","unit-size-ignored"], representations:["concrete","number-line","table","symbolic","language"] },
  lengthCompare: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Align or compare measured objects so the decision depends on equal units and a fair starting point.",
    invariants: ["measured-length-fixed", "unit-size-consistent"], misconceptions: ["misaligned-starts", "visual-size-only"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  tapDiagram: {
    kernel: "spatial-invariance", role: "supporting",
    actionGoal: "Select examples by the defining mathematical attribute rather than by prototype appearance.",
    invariants: ["attribute-definition"], misconceptions: ["prototype-only", "irrelevant-feature"],
    representations: ["diagram", "table", "language"]
  },
  tenFrame: {
    kernel: "quantity-composition", role: "flagship",
    actionGoal: "Build and reorganize the quantity without losing track of the total.",
    invariants: ["quantity-preserved"], misconceptions: ["counting-all", "decorative-matching"],
    representations: ["concrete", "diagram", "symbolic", "language"]
  },
  numberLineHop: {
    kernel: "quantity-composition", role: "flagship",
    actionGoal: "Make each jump represent the operation and watch the landing change.",
    invariants: ["hop-size-consistent", "operation-direction"], misconceptions: ["wrong-direction", "off-by-one-hop"],
    representations: ["number-line", "symbolic", "language"]
  },
  numberLinePlace: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Place the value by magnitude, not by the appearance of its digits.",
    invariants: ["ordered-magnitude"], misconceptions: ["interval-vs-point", "digit-size-only"],
    representations: ["number-line", "symbolic", "language"]
  },
  baseTenCompose: {
    kernel: "quantity-composition", role: "flagship",
    actionGoal: "Compose the number and exchange units while preserving its value.",
    invariants: ["quantity-preserved", "unit-value-preserved"], misconceptions: ["illegal-exchange", "place-value-confusion"],
    representations: ["concrete", "table", "symbolic", "language"]
  },
  moneyBoard: {
    kernel: "quantity-composition", role: "flagship",
    actionGoal: "Compose the exact value with interchangeable denominations and compare efficient constructions.",
    invariants: ["total-value-preserved", "denomination-value"], misconceptions: ["coin-count-is-value", "denomination-confusion"],
    representations: ["concrete", "table", "symbolic", "language"]
  },
  inversePipeline: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Reverse each operation in the opposite order and preserve the input-output relationship.",
    invariants: ["inverse-composition", "operation-order"], misconceptions: ["same-order-undo", "wrong-inverse"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  evalOrder: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Collapse one legal subexpression at a time and preserve the expression's value.",
    invariants: ["expression-value-preserved", "precedence-structure"], misconceptions: ["left-to-right-only", "ignored-grouping"],
    representations: ["diagram", "symbolic", "language"]
  },
  oddEvenPairs: {
    kernel: "quantity-composition", role: "flagship",
    actionGoal: "Pair every object and use the presence or absence of a singleton to explain parity.",
    invariants: ["pair-size-two", "quantity-preserved"], misconceptions: ["last-digit-guess", "incomplete-pairing"],
    representations: ["concrete", "diagram", "symbolic", "language"]
  },
  placeValue: {
    kernel: "quantity-composition", role: "flagship",
    actionGoal: "Compose a value with flats, rods, and units while coordinating the place-value equation.",
    invariants: ["quantity-preserved", "unit-value-preserved"], misconceptions: ["digit-place-confusion", "illegal-exchange"],
    representations: ["concrete", "table", "symbolic", "language"]
  },
  mixedRegroup: {
    kernel: "quantity-composition", role: "flagship",
    actionGoal: "Regroup wholes and fractional parts while preserving the amount.",
    invariants: ["quantity-preserved", "denominator-preserved"], misconceptions: ["missed-exchange", "whole-fraction-disconnect"],
    representations: ["diagram", "symbolic", "language"]
  },
  columnCalc: {
    kernel: "quantity-composition", role: "flagship",
    actionGoal: "Perform each exchange in the column where its unit value belongs.",
    invariants: ["place-value-preserved", "operation-equivalence"], misconceptions: ["wrong-regroup-column", "digit-wise-operation"],
    representations: ["table", "symbolic", "language"]
  },
  fractionBar: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Repartition the same whole and track whether the magnitude moves.",
    invariants: ["magnitude-preserved", "whole-preserved"], misconceptions: ["denominator-size-conflation", "unequal-whole"],
    representations: ["diagram", "number-line", "symbolic", "language"]
  },
  fractionGrid: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Change the partition or overlap and observe the exact fraction it creates.",
    invariants: ["whole-preserved", "overlap-represents-product"], misconceptions: ["add-factors", "count-lines-not-regions"],
    representations: ["diagram", "symbolic", "language"]
  },
  fractionOfSet: {
    kernel: "equivalence-transformation", role: "supporting",
    actionGoal: "Select equal groups so the chosen set represents the fraction of the whole.",
    invariants: ["whole-set-fixed", "equal-groups"], misconceptions: ["numerator-as-total", "unequal-groups"],
    representations: ["concrete", "diagram", "symbolic"]
  },
  barBuilder: {
    kernel: "chance-sampling", role: "flagship",
    actionGoal: "Construct the data display and keep category, frequency, and scale synchronized.",
    invariants: ["bar-height-is-frequency", "scale-consistent"], misconceptions: ["category-frequency-swap", "unequal-scale"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  ratioTable: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Scale both quantities together and preserve the multiplicative relationship.",
    invariants: ["constant-ratio", "paired-scaling"], misconceptions: ["additive-not-multiplicative", "inconsistent-scaling"],
    representations: ["table", "number-line", "symbolic", "graph", "language"]
  },
  doubleNumberLine: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Keep aligned quantities synchronized as the scale changes.",
    invariants: ["constant-ratio", "aligned-pairs"], misconceptions: ["unit-rate-confusion", "inconsistent-scaling"],
    representations: ["number-line", "table", "symbolic", "language"]
  },
  percentBar: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Vary the percent and observe the corresponding part of the whole.",
    invariants: ["whole-is-100-percent"], misconceptions: ["percent-as-amount", "wrong-whole"],
    representations: ["diagram", "number-line", "symbolic", "language"]
  },
  areaModel: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Split and recombine the region while preserving total area or product.",
    invariants: ["area-preserved", "product-preserved"], misconceptions: ["perimeter-area-confusion", "partial-product-omission"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  volumeBuilder: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Build the solid and coordinate length, width, height, layers, and volume.",
    invariants: ["unit-cubes-fill-volume", "volume-product"], misconceptions: ["surface-volume-confusion", "missing-dimension"],
    representations: ["concrete", "diagram", "symbolic", "language"]
  },
  clockSet: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Coordinate hour and minute hands so their positions represent one consistent time.",
    invariants: ["sixty-minutes-per-turn", "hour-hand-progress"], misconceptions: ["hand-role-swap", "hour-hand-fixed"],
    representations: ["diagram", "number-line", "symbolic", "language"]
  },
  netFold: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Coordinate the unfolded faces with the solid and account for every face exactly once.",
    invariants: ["face-areas-preserved", "all-faces-counted-once"], misconceptions: ["missing-face", "volume-surface-confusion"],
    representations: ["concrete", "diagram", "table", "symbolic", "language"]
  },
  dilationExplore: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Vary the scale factor and observe coordinate, length, perimeter, and area consequences together.",
    invariants: ["angle-preserved", "proportional-distance-from-center"], misconceptions: ["additive-scaling", "translation-for-dilation"],
    representations: ["diagram", "table", "symbolic", "graph", "language"]
  },
  distanceGrid: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Construct displacement components and connect them to geometric distance.",
    invariants: ["distance-nonnegative", "path-components-determine-distance"], misconceptions: ["coordinate-sum", "axis-distance-confusion"],
    representations: ["diagram", "table", "symbolic", "graph", "language"]
  },
  angleMeasure: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Align, rotate, and measure the turn rather than the ray lengths.",
    invariants: ["angle-independent-of-ray-length"], misconceptions: ["wrong-scale", "measurement-dependence"],
    representations: ["diagram", "symbolic", "language"]
  },
  transformExplore: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Transform the figure and identify which properties remain invariant.",
    invariants: ["distance-preserved", "angle-preserved"], misconceptions: ["rigid-motion-violation", "coordinate-rule-disconnect"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  triangleSolve: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Vary a side or angle and coordinate the triangle with the law of cosines.",
    invariants: ["side-angle-dependence", "triangle-determined-by-sas"], misconceptions: ["pythagorean-only", "angle-side-disconnect"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  circleAngleExplore: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Move points on a circle and coordinate arc, central-angle, and inscribed-angle consequences.",
    invariants: ["inscribed-angle-half-intercepted-arc", "central-angle-equals-arc"], misconceptions: ["inscribed-angle-equals-arc", "angle-location-irrelevant"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  circleMeasureExplore: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Move a circle measurement and connect tangent, chord, radius, and power relationships.",
    invariants: ["tangent-radius-perpendicular", "equal-tangents-common-point"], misconceptions: ["tangent-as-chord", "unequal-tangent-segments"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  compassConstruct: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Change the compass radius and observe which equal-distance guarantees remain fixed.",
    invariants: ["equal-radius", "perpendicular-bisector-locus"], misconceptions: ["construction-by-appearance", "measurement-is-proof"],
    representations: ["concrete", "diagram", "symbolic", "language"]
  },
  quadDrag: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Move one vertex and use live side, diagonal, and angle evidence to construct a quadrilateral family member.",
    invariants: ["four-sided-closed-figure", "attributes-determine-family"], misconceptions: ["prototype-only", "single-attribute-only"],
    representations: ["graph", "table", "diagram", "language"]
  },
  plotPoint: {
    kernel: "spatial-invariance", role: "supporting",
    actionGoal: "Coordinate horizontal and vertical movement to construct the ordered pair.",
    invariants: ["ordered-pair-axis-meaning"], misconceptions: ["xy-reversal"],
    representations: ["graph", "symbolic", "language"]
  },
  integerChips: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Create and remove zero pairs while preserving the signed value.",
    invariants: ["value-preserved-by-zero-pairs"], misconceptions: ["sign-error", "negative-magnitude"],
    representations: ["concrete", "number-line", "symbolic", "language"]
  },
  algebraTiles: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Combine or transform like units without changing the expression's value.",
    invariants: ["expression-value-preserved", "like-units-only"], misconceptions: ["combine-unlike", "sign-error"],
    representations: ["concrete", "diagram", "symbolic", "language"]
  },
  balanceScale: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Apply legal changes while preserving equality and the solution set.",
    invariants: ["equality-preserved", "solution-set-preserved"], misconceptions: ["one-sided-operation", "wrong-inverse"],
    representations: ["concrete", "diagram", "symbolic", "language"]
  },
  solveBalance: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Choose and apply inverse operations to both sides until the variable is isolated.",
    invariants: ["equality-preserved", "solution-set-preserved"], misconceptions: ["one-sided-operation", "wrong-inverse"],
    representations: ["diagram", "symbolic", "language"]
  },
  functionMachine: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Vary the input and track how the rule produces exactly one output.",
    invariants: ["one-output-per-input"], misconceptions: ["input-output-reversal", "additive-rule-only"],
    representations: ["table", "symbolic", "graph", "language"]
  },
  lineExplore: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Change one parameter at a time and connect equation, graph, table, and context.",
    invariants: ["constant-rate-for-linear-function", "intercept-is-initial-value"], misconceptions: ["slope-intercept-swap", "rise-run-swap"],
    representations: ["graph", "table", "symbolic", "language"]
  },
  quadraticExplore: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Vary vertex-form parameters and coordinate shape, vertex, equation, and table consequences.",
    invariants: ["vertex-is-h-k", "a-controls-opening-and-width"], misconceptions: ["h-sign-not-reversed", "a-translates-vertex"],
    representations: ["graph", "table", "symbolic", "language"]
  },
  expLogExplore: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Vary the base and coordinate growth or decay across graph, table, symbolic rule, and language.",
    invariants: ["constant-multiplicative-factor", "base-one-is-boundary"], misconceptions: ["additive-change", "all-positive-bases-grow"],
    representations: ["graph", "table", "symbolic", "language"]
  },
  systemsExplore: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Coordinate two constraints and observe how their shared solution changes.",
    invariants: ["shared-solution", "equivalent-system"], misconceptions: ["one-equation-only", "intersection-as-decoration"],
    representations: ["graph", "table", "symbolic", "language"]
  },
  proportionalReasoningLab: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Normalize paired quantities, compare exact multiplicative constants, and carry one proportional invariant through prediction, percent, and discount stages.",
    invariants: ["constant-ratio", "unit-rate-equivalence", "ordered-multiplicative-chain"], misconceptions: ["compare-raw-totals", "additive-not-multiplicative", "percent-as-whole-number"],
    representations: ["table", "diagram", "symbolic", "language"]
  },
  placeValueTransformLab: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Inspect aligned base-ten positions and carry one digit-position invariant through shifting, comparison, rounding, exponent arithmetic, and equivalent decimal scaling.",
    invariants: ["digit-place-value", "power-of-ten-equivalence", "equal-scaling-preserves-quotient"], misconceptions: ["move-decimal-arbitrarily", "compare-digit-count", "round-before-combining"],
    representations: ["table", "diagram", "symbolic", "language"]
  },
  exactNumberLab: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Transform and compare exact rational, power, inequality, and radical states while preserving ordered value and the task-specific conclusion.",
    invariants: ["exact-value-preserved", "order-preserved", "solution-set-preserved"], misconceptions: ["notation-size-is-value", "grouping-ignored", "radical-rounded-as-exact"],
    representations: ["number-line", "table", "diagram", "symbolic", "language"]
  },
  affineRelationshipLab: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Normalize equations, tables, graphs, and contexts to one affine state, then compare rates and starts, evaluate inputs, verify points, and solve intersections.",
    invariants: ["constant-rate", "intercept-is-initial-value", "intersection-satisfies-both-relations"], misconceptions: ["slope-intercept-swap", "compare-raw-outputs", "candidate-satisfies-one-line-only"],
    representations: ["graph", "table", "symbolic", "language"]
  },
  quotientReasoningLab: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Carry one exact quotient state through grouping, remainder interpretation, reciprocal division, decimal cycles, and repeating-decimal conversion.",
    invariants: ["dividend-equals-divisor-times-quotient-plus-remainder", "reciprocal-division-equivalence", "remainder-cycle-determines-decimal"], misconceptions: ["remainder-meaning-is-context-free", "flip-the-dividend", "repeating-decimal-is-rounded"],
    representations: ["table", "diagram", "symbolic", "language"]
  },
  pointSetReasoningLab: {
    kernel: "covariation", role: "supporting",
    actionGoal: "Reason over a finite point set: read its coordinate story, derive the unit rate of a proportional line, and decide membership, extremes, and range from the points themselves.",
    invariants: ["point-set-determines-range", "membership-is-decided-by-coordinates", "unit-rate-is-output-per-one-input"], misconceptions: ["range-read-from-axis-not-points", "membership-guessed-from-proximity", "rate-is-the-difference-not-the-quotient"],
    representations: ["graph", "table", "language"]
  },
  geometricConstraintLab: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Inspect named geometric quantities and preserve one exact relation through perimeter, coordinate-area composition, scaling, angle constraints, similarity, and Pythagorean area conservation.",
    invariants: ["perimeter-total", "coordinate-area-composition", "squared-scale-factor", "angle-relations", "AA-similarity", "pythagorean-area-conservation"], misconceptions: ["subtract-wrong-side", "scale-area-linearly", "vertical-means-supplementary", "one-angle-proves-similarity", "add-side-lengths-not-squares"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  graphStoryLab: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Read or assemble ordered qualitative graph segments while direction, flatness, steepness, curvature, and axis meaning remain synchronized.",
    invariants: ["segment-order-preserved", "axis-semantics-preserved", "shape-meaning-consistent"], misconceptions: ["flat-means-slow", "concavity-interchange", "story-order-permutation"],
    representations: ["graph", "table", "symbolic", "language"]
  },
  conditionalTableLab: {
    kernel: "chance-sampling", role: "flagship",
    actionGoal: "Change the condition, select the intersection, and make the denominator restriction and reversal visible in a two-way table.",
    invariants: ["condition-defines-denominator", "joint-cell-can-support-two-conditionals"], misconceptions: ["reverse-conditional", "always-divide-by-grand-total"],
    representations: ["table", "diagram", "symbolic", "language"]
  },
  treeDiagram: {
    kernel: "chance-sampling", role: "flagship",
    actionGoal: "Build every branch of the compound sample space and coordinate path probabilities.",
    invariants: ["branch-probabilities-sum", "path-probabilities-multiply"], misconceptions: ["add-along-path", "missing-outcome"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  probabilityArea: {
    kernel: "chance-sampling", role: "flagship",
    actionGoal: "Vary favorable area and connect region, fraction, decimal, and probability.",
    invariants: ["sample-space-fixed", "probability-is-part-over-whole"], misconceptions: ["favorable-is-denominator", "unequal-cells"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  shuffleTest: {
    kernel: "chance-sampling", role: "flagship",
    actionGoal: "Generate a null distribution and compare the observed statistic with shuffled outcomes.",
    invariants: ["labels-exchangeable-under-null", "sample-size-fixed"], misconceptions: ["single-shuffle-proof", "tail-direction-confusion"],
    representations: ["diagram", "table", "graph", "symbolic", "language"]
  },
  dotPlot: {
    kernel: "chance-sampling", role: "flagship",
    actionGoal: "Build or vary the distribution and observe center, spread, and shape together.",
    invariants: ["data-values-determine-distribution"], misconceptions: ["axis-frequency-confusion", "center-only"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  boxPlot: {
    kernel: "chance-sampling", role: "flagship",
    actionGoal: "Move through the five-number summary and connect it to the underlying distribution.",
    invariants: ["ordered-five-number-summary"], misconceptions: ["box-is-frequency", "range-iqr-confusion"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  scatterFit: {
    kernel: "chance-sampling", role: "flagship",
    actionGoal: "Fit, perturb, and compare lines while residuals reveal the quality of the model.",
    invariants: ["association-not-causation", "residual-direction"], misconceptions: ["through-every-point", "outlier-ignored"],
    representations: ["graph", "table", "symbolic", "language"]
  },
  estimateSlider: {
    kernel: "quantity-composition", role: "supporting",
    actionGoal: "Place an estimate by order of magnitude and compare multiplicative distance from the target.",
    invariants: ["ordered-magnitude"], misconceptions: ["linear-spacing-on-log-scale", "digit-count-only"],
    representations: ["number-line", "symbolic", "language"]
  },
  spinnerSim: {
    kernel: "chance-sampling", role: "flagship",
    actionGoal: "Run repeated trials and compare long-run behavior with theoretical probability.",
    invariants: ["sample-space-fixed", "long-run-stabilization"], misconceptions: ["short-run-certainty", "outcome-equiprobability"],
    representations: ["concrete", "table", "graph", "symbolic"]
  },
  argandExplore: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Move a complex input and observe multiplication as a coordinated rotation and dilation on the Argand plane.",
    invariants: ["complex-product-coordinate-rule", "moduli-multiply", "arguments-add"], misconceptions: ["componentwise-multiplication", "rotation-without-scaling"],
    representations: ["graph", "table", "symbolic", "language"]
  },
  signChart: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Construct interval signs and make root multiplicity visibly control crossing or bouncing.",
    invariants: ["odd-multiplicity-flips-sign", "even-multiplicity-preserves-sign"], misconceptions: ["every-root-flips", "multiplicity-does-not-matter"],
    representations: ["graph", "table", "symbolic", "language"]
  },
  radicalCheck: {
    kernel: "equivalence-transformation", role: "flagship",
    actionGoal: "Test each candidate in both the squared equation and the original radical equation to expose extraneous roots.",
    invariants: ["original-equation-governs-solution-set", "principal-square-root-nonnegative"], misconceptions: ["squared-roots-all-valid", "checking-is-optional"],
    representations: ["diagram", "table", "symbolic", "language"]
  },
  graphZoom: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Shrink the neighborhood around a discontinuity and separate nearby behavior from the function value at the point.",
    invariants: ["limit-depends-on-nearby-values", "two-sided-agreement"], misconceptions: ["undefined-means-no-limit", "hole-is-asymptote"],
    representations: ["graph", "table", "symbolic", "language"]
  },
  sequenceBuild: {
    kernel: "covariation", role: "flagship",
    actionGoal: "Vary a common difference or ratio and coordinate terms, partial sums, and long-run behavior.",
    invariants: ["constant-additive-or-multiplicative-change", "partial-sum-definition"], misconceptions: ["sequence-term-is-partial-sum", "all-infinite-series-converge"],
    representations: ["diagram", "table", "graph", "symbolic", "language"]
  },
  unitCircleExplore: {
    kernel: "spatial-invariance", role: "flagship",
    actionGoal: "Rotate an angle and coordinate quadrant, reference angle, coordinates, sine, and cosine.",
    invariants: ["unit-radius", "coordinates-are-cosine-and-sine"], misconceptions: ["reference-angle-keeps-signs", "sine-and-cosine-swap"],
    representations: ["diagram", "graph", "table", "symbolic", "language"]
  },
  ciCapture: {
    kernel: "chance-sampling", role: "flagship",
    actionGoal: "Generate repeated confidence intervals and coordinate confidence level, interval width, and long-run capture rate.",
    invariants: ["method-capture-rate", "higher-confidence-wider-interval"], misconceptions: ["probability-parameter-in-one-fixed-interval", "confidence-means-sample-percent"],
    representations: ["table", "graph", "symbolic", "language"]
  },
  sampleSim: {
    kernel: "chance-sampling", role: "flagship",
    actionGoal: "Draw repeated samples and vary size or method to expose variability and bias.",
    invariants: ["population-fixed", "sampling-process-declared"], misconceptions: ["sample-equals-population", "bias-ignored"],
    representations: ["table", "graph", "symbolic", "language"]
  }
};

export function profileForWidget(type: TWidget["type"] | undefined): EngineCMLProfile | null {
  return type ? CML_ENGINE_PROFILES[type] ?? null : null;
}

export function resolveCMLMeta(step: TStep | undefined): TCMLMeta | null {
  if (!step?.widget) return null;
  const profile = profileForWidget(step.widget.type);
  if (!profile && !step.cml) return null;
  const authored = step.cml;
  return {
    stage: authored?.stage ?? "construct",
    flagship: authored?.flagship ?? profile?.role === "flagship",
    ...(authored?.kernel ?? profile?.kernel ? { kernel: authored?.kernel ?? profile?.kernel } : {}),
    ...(authored?.actionGoal ?? profile?.actionGoal ? { actionGoal: authored?.actionGoal ?? profile?.actionGoal } : {}),
    ...(authored?.predictionId ? { predictionId: authored.predictionId } : {}),
    invariants: authored?.invariants?.length ? authored.invariants : [...(profile?.invariants ?? [])],
    misconceptions: authored?.misconceptions?.length ? authored.misconceptions : [...(profile?.misconceptions ?? [])],
    representations: authored?.representations?.length ? authored.representations : [...(profile?.representations ?? [])],
    ...(authored?.translationFrom ? { translationFrom: authored.translationFrom } : {}),
    ...(authored?.translationTo ? { translationTo: authored.translationTo } : {}),
    ...(authored?.revisionOf ? { revisionOf: authored.revisionOf } : {}),
    fadeLevel: authored?.fadeLevel ?? 0,
    ...(authored?.transferFamily ? { transferFamily: authored.transferFamily } : {}),
    delayed: authored?.delayed ?? false,
    ...(authored?.counterfactualPrompt ? { counterfactualPrompt: authored.counterfactualPrompt } : {}),
    ...(authored?.explanation ? { explanation: authored.explanation } : {})
  };
}

export function humanizeCMLId(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
