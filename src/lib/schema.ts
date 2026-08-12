import { z } from "zod";
import { gcd } from "./mathUtils";

/* ---------------- Widget specs ---------------- */

/** DISPLAY ONLY — the line plot a prompt already DESCRIBES, drawn instead of spelled in ASCII.
 *
 * THE DEFECT THIS CLOSES. `vm-02-02` ("Using Line Plot Data") asks four graded questions about a
 * line plot that is never drawn: the prompt spells the dataset out as text — "Total length of all
 * ribbons in the plot (1/4 → XX, 1/2 → XXX, 3/4 → X)?" — and the learner sees an entry box and
 * nothing else. The lesson's stated skill is USING LINE-PLOT DATA, so the plot is the instrument,
 * not decoration. Four rows of the S237 absent-diagram list are exactly this.
 *
 * WHY IT IS A DISPLAY BLOCK AND NOT A WIDGET SWAP. `dotPlot` READ mode grades "how many X's in
 * the stack above askIndex". These steps grade a TOTAL (Σ value × count) and a DIFFERENCE
 * (longest − shortest); moving them onto `dotPlot` would change what is graded, which is a
 * curriculum change. A static `figure` cannot work either: these steps declare variants that
 * REGENERATE the plot per re-ask, so a fixed picture would contradict the prompt the moment the
 * item refreshes. So the dataset travels WITH the spec, exactly as `previewDenominator` does.
 *
 * THE CONTRACT, copied from `previewDenominator` (schema.ts, S237):
 *   - never read by `evaluate`, `canCheck`, `correctAnswerText` or any grading path;
 *   - absent by default, so every other numeric and fractionEntry step is byte-identical;
 *   - what it draws is a GIVEN the prompt already states, so showing it leaks no answer.
 *
 * `values` are NUMERATORS over `denominator` — the same exact-integer convention `dotPlot` uses
 * (S122), so no float enters a label — and `dotPlotLabel` renders them, the ONE shared
 * fraction-axis formatter. `counts` is the stack height above each value; 0 is legal and means a
 * mark the prompt lists with no X's above it ("3/4 → —"). */
export const PlotDataSpec = z.object({
  /** Axis positions as numerators over `denominator`, strictly increasing (integrity enforces). */
  values: z.array(z.number().int().nonnegative()).min(2),
  /** X's stacked above each value, one entry per value. */
  counts: z.array(z.number().int().nonnegative()).min(2),
  /** Absent = a whole-number axis, exactly as in `dotPlot`. */
  denominator: z.number().int().min(2).optional(),
  /** The mark the figure stacks. Absent = "x", the canonical line-plot glyph every wired row
   * already draws. "dot" exists for lessons whose FROZEN prose says dots — dd-02-01 teaches
   * "one dot per data value" and asks the learner to "count the dots", so drawing X's there
   * would trade the absent-diagram defect for a figure-text contradiction (user-ruled
   * 2026-08-12). Display-only like every field here; grading never reads it. */
  glyph: z.enum(["x", "dot"]).optional(),
  /** How the axis writes a fractional value. Absent = improper form ("5/2"), what every wired
   * row before wave 9 draws. "mixed" exists for md-03-04, whose FROZEN prose writes halves as
   * mixed numbers ("2½") — the one shared formatter would otherwise put "5/2" on an axis whose
   * own prompt says "2½" (user-ruled 2026-08-12: formatter mode, not a prose edit). */
  labelStyle: z.enum(["mixed"]).optional()
});
export type TPlotData = z.infer<typeof PlotDataSpec>;

export const McqSpec = z.object({
  type: z.literal("mcq"),
  prompt: z.string().min(1),
  /** DISPLAY ONLY — see `PlotDataSpec` above (S238 extended it here from numeric/fractionEntry;
   * same field, same resolver, same renderer — never a second shape). The MCQ-specific rule is
   * about LEAKAGE: the plot may only state what the prompt already states. It is correct for
   * "read the plot" questions whose options are interpretations of a dataset the prompt spells
   * out; it is WRONG for any step where an option IS the dataset (e.g. "Which data set does this
   * plot show?") — drawing the plot there would print the answer. Grading never reads it:
   * evaluate() looks at option ids alone, byte-identical with or without the field. */
  plotData: PlotDataSpec.optional(),
  options: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        correct: z.boolean().default(false),
        /** Diagnostic feedback: names the misconception for wrong picks, reinforces for right. */
        feedback: z.string().min(1)
      })
    )
    .min(2)
});

/** The most columns a plot may draw, and the tallest stack it may show. Past these the picture
 * stops being readable at a phone width and starts being a smear — the same judgement
 * `partitionBarDrawable` makes for the partition previews, stated once for the plot. */
export const MAX_PLOT_COLUMNS = 8;
export const MAX_PLOT_STACK = 10;

/** The plot resolved from the spec — the SINGLE source the renderer draws from and the
 * accessibility panel speaks, so the picture on screen and the sentence a screen reader hears can
 * never disagree (the `numericPreviewParts` contract, applied to the plot).
 *
 * Returns null — draw nothing, say nothing — when the step declares no `plotData`, or when the
 * declared data is not something a plot can honestly show: a count per value missing, an axis
 * that does not increase, no X anywhere, too many columns, or a stack past the cap. Pure, total,
 * never throws. DISPLAY ONLY: no caller grades with it. */
export function plotDataParts(
  spec: { plotData?: TPlotData }
): { values: number[]; counts: number[]; labels: string[]; denominator?: number; glyph: "x" | "dot" } | null {
  const d = spec.plotData;
  if (!d) return null;
  const { values, counts, denominator } = d;
  if (values.length !== counts.length) return null;
  if (values.length < 2 || values.length > MAX_PLOT_COLUMNS) return null;
  for (let i = 1; i < values.length; i++) if (values[i] <= values[i - 1]) return null;
  if (!counts.some((c) => c > 0)) return null;
  if (counts.some((c) => c > MAX_PLOT_STACK)) return null;
  return {
    values: [...values],
    counts: [...counts],
    labels: values.map((v) => dotPlotLabel(v, denominator, d.labelStyle)),
    denominator,
    glyph: d.glyph ?? "x"
  };
}

export const NumericSpec = z.object({
  type: z.literal("numeric"),
  prompt: z.string().min(1),
  answer: z.number(),
  tolerance: z.number().min(0).default(0),
  unit: z.string().optional(),
  /** DISPLAY ONLY — see `PlotDataSpec`. The line plot the prompt describes, drawn. */
  plotData: PlotDataSpec.optional(),
  /** DISPLAY ONLY — never read by `evaluate`, `canCheck`, `correctAnswerText` or any
   * integrity rule. Set it when the step asks for a NUMERATOR over a denominator the
   * PROMPT has already fixed ("How many fourths are shaded?"): the widget then draws the
   * learner's entry as entered/previewDenominator on the same live partition bar
   * fractionEntry uses, so "3" is visibly 3/4 while they type.
   *
   * Grading is byte-identical with or without it: the answer is still the plain number in
   * `answer`, compared against `tolerance`, exactly as before this field existed. A spec
   * that omits it renders and grades exactly as it always has.
   *
   * The denominator is the PROMPT's, not the learner's — it is a given, not an answer, so
   * showing it leaks nothing. */
  previewDenominator: z.number().int().positive().optional(),
  /** Anticipated wrong answers mapped to misconception-diagnosing feedback. */
  commonErrors: z.array(z.object({ value: z.number(), feedback: z.string().min(1) })).default([]),
  /** Shown for wrong answers not in commonErrors. Must still be diagnostic, never generic. */
  fallbackFeedback: z.string().min(1),
  /** Optional confirmation that RESTATES WHY (e.g. "6 in the layer plus 2 on top = 8").
   * When absent the player's generic correct banner stands alone. */
  successFeedback: z.string().min(1).optional()
});

/** The honest-partition cap the live "what you just typed" previews share. A bar cannot
 * truthfully show 333 parts, and a count far past the denominator stops reading as a
 * fraction of ONE whole. Written once so fractionEntry's bar (widgets.tsx) and numeric's
 * new bar can never drift apart on what a bar may honestly draw.
 *
 * Identical in effect to the gate fractionEntry has always used inline
 * (`den <= 20 && num <= den * 2`, on values already parsed as non-negative integers with
 * den >= 1); the integer/range guards here are those parse conditions made explicit, so
 * this is that gate stated in full, never a looser one. */
export function partitionBarDrawable(shaded: number, total: number): boolean {
  return (
    Number.isInteger(shaded) &&
    Number.isInteger(total) &&
    shaded >= 0 &&
    total >= 1 &&
    total <= 20 &&
    shaded <= total * 2
  );
}

/** numeric's live preview, resolved from the SAME spec + value the renderer draws and the
 * accessibility panel speaks — so the bar on screen and the sentence a screen reader hears
 * can never disagree (the rotationLab/numberLineRay contract, applied here).
 *
 * An IMPROPER entry is drawn the way a fraction model should draw it and the way this app's
 * own `fractionEntry` already does: as WHOLE BARS plus a remainder. 5/3 is one filled bar and
 * a second bar with 2 of 3 parts shaded — five thirds, visibly more than one whole. It is not
 * one bar with every cell filled; that picture says "one whole" for an answer of one-and-two-
 * thirds, and understating the answer is worse than drawing nothing.
 *
 * Returns null — draw nothing, say nothing — when the step declares no `previewDenominator`,
 * when nothing is entered yet, when the entry is not a finite non-negative integer, or when
 * the shape is past what a bar can honestly show (too many wholes, or a remainder past the
 * partition cap). Pure, total, never throws. DISPLAY ONLY: no caller grades with it. */
export function numericPreviewParts(
  spec: Pick<TNumeric, "previewDenominator">,
  value: unknown
): { wholes: number; shaded: number; total: number } | null {
  const total = spec.previewDenominator;
  if (typeof total !== "number") return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) return null;
  if (!Number.isInteger(total) || total < 1 || total > 20) return null;
  const wholes = Math.floor(value / total);
  const shaded = value - wholes * total;
  // Six is fractionEntry's own whole-bar ceiling; past it the row stops reading as a quantity.
  if (wholes > MAX_PREVIEW_WHOLES) return null;
  if (!partitionBarDrawable(shaded, total)) return null;
  return { wholes, shaded, total };
}

/** The whole-bar ceiling both live previews share. */
export const MAX_PREVIEW_WHOLES = 6;

/** fractionEntry — the fraction-FORM analogue of `numeric`: the learner TYPES a
 * fraction (numerator over denominator, optionally with a whole-number part) and
 * is graded on the rational VALUE, exactly. This is the engine the vm-02-02 and
 * fm-01/02/03/05 keeps were waiting for: `numeric` accepts decimals only, and
 * forcing 5/6 → 0.833 or 2 3/4 → 2.75 changes the Grade 4–5 fraction-FORM skill
 * being graded.
 *
 *   - `commonEntries` are per-VALUE misconception traps (numeric's commonErrors
 *     semantics): "1 1/2" and "3/2" are the same wrong amount, so a trap authored
 *     as {whole:1, num:1, den:2} fires on either form of that value.
 *   - `form` grades the FORM on top of the value when the prompt demands it:
 *       "lowestTerms" (…then simplify): a right-value entry not in lowest terms
 *         routes to `formFeedback` instead of success (5/10 for 1/2);
 *       "mixed" (write it as a mixed number): a right-value entry that is not
 *         whole-part-maximal with a lowest-terms proper fraction routes to
 *         `formFeedback` (6/5 or 1 2/10 for 1 1/5).
 *   - Whole-only entries are real: with `allowWhole`, typing just "3" reads as
 *     3 + 0/1, so "forgot the fraction part" is a trappable wrong value. */
export const FractionEntrySpec = z.object({
  type: z.literal("fractionEntry"),
  prompt: z.string().min(1),
  /** The answer as displayed: whole (0 for pure fractions) + num/den. */
  answerWhole: z.number().int().min(0).default(0),
  answerNum: z.number().int().min(0),
  answerDen: z.number().int().min(1),
  /** Show the whole-number field (mixed-number tasks). */
  allowWhole: z.boolean().default(false),
  /** Render a ± sign toggle (signed-rational tasks). Off by default — every
   * pre-extension fractionEntry stays a non-negative entry, byte-identical grading. */
  allowNegative: z.boolean().default(false),
  /** DISPLAY ONLY — see `PlotDataSpec`. The line plot the prompt describes, drawn. */
  plotData: PlotDataSpec.optional(),
  /** Sign of the answer value (the boxes stay non-negative magnitudes). */
  answerSign: z.union([z.literal(1), z.literal(-1)]).default(1),
  /** any = value equivalence · lowestTerms = value + lowest-terms fraction ·
   * mixed = value + maximal whole + lowest-terms proper fraction part. */
  form: z.enum(["any", "lowestTerms", "mixed"]).default("any"),
  /** Right value, wrong FORM (required when form ≠ "any"; unreachable otherwise). */
  formFeedback: z.string().min(1).optional(),
  unit: z.string().optional(),
  /** Anticipated wrong VALUES with diagnosis, authored in display form. */
  commonEntries: z
    .array(
      z.object({
        sign: z.union([z.literal(1), z.literal(-1)]).default(1),
        whole: z.number().int().min(0).default(0),
        num: z.number().int().min(0),
        den: z.number().int().min(1),
        feedback: z.string().min(1)
      })
    )
    .default([]),
  /** Shown for wrong values not in commonEntries. Diagnostic, never generic. */
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1).optional()
});

export const PlaceCompareSpec = z.object({
  type: z.literal("placeCompare"),
  prompt: z.string().min(1),
  /** The two numbers as DIGIT STRINGS (e.g. "63", "0.409") so authored forms —
   * trailing zeros, decimal lengths — render exactly as written. */
  left: z.string().regex(/^\d+(\.\d+)?$/),
  right: z.string().regex(/^\d+(\.\d+)?$/),
  /** The true relation, left vs right. Integrity re-derives this from the
   * digit strings — an authored answer that contradicts the numbers is rejected. */
  answer: z.enum(["lt", "eq", "gt"]),
  /** Column headers (hundreds/tens/ones · tenths…) above the digit cells.
   * On for place-value courses; off when the naming would be noise. */
  placeLabels: z.boolean().default(true),
  /** How each number is MODELED beside its digits. "chart" is the classic
   * aligned digit chart; "blocks" adds base-ten flats/rods/cubes (whole
   * numbers ≤ 999 — integrity enforces); "expanded" adds 300 + 40 + 5
   * decomposition rows. Additive: every existing step keeps "chart". */
  view: z.enum(["chart", "blocks", "expanded"]).default("chart"),
  /** Diagnosis for each WRONG symbol pick. Exactly the two non-answer slots
   * must be present; the answer's own slot must be absent (it can never fire). */
  ltFeedback: z.string().min(1).optional(),
  eqFeedback: z.string().min(1).optional(),
  gtFeedback: z.string().min(1).optional(),
  successFeedback: z.string().min(1)
});

/** One side of a rationalCompare: a FRACTION (sign carried on the numerator)
 * or a SCALAR digit string (signed integer or decimal, rendered exactly as
 * authored). placeCompare owns plain digit-domain pairs; this engine owns the
 * pairs it can't — signed values, fractions, and mixed-form operands. */
export const RationalOperandSpec = z.union([
  z.object({ num: z.number().int(), den: z.number().int().positive() }),
  z.object({ value: z.string().regex(/^-?\d+(\.\d+)?$/) })
]);

export const RationalCompareSpec = z.object({
  type: z.literal("rationalCompare"),
  prompt: z.string().min(1),
  left: RationalOperandSpec,
  right: RationalOperandSpec,
  /** Optional story captions above each operand card (e.g. "Team A" / "Team B"),
   * drawn from the prompt's own nouns — widget chrome, never authored content. */
  leftLabel: z.string().min(1).optional(),
  rightLabel: z.string().min(1).optional(),
  /** The true relation, left vs right. Integrity re-derives this EXACTLY
   * (cross-multiplication, no floats) — a contradicting answer is rejected. */
  answer: z.enum(["lt", "eq", "gt"]),
  /** Diagnosis for each WRONG symbol pick. Exactly the two non-answer slots
   * must be present; the answer's own slot must be absent (it can never fire). */
  ltFeedback: z.string().min(1).optional(),
  eqFeedback: z.string().min(1).optional(),
  gtFeedback: z.string().min(1).optional(),
  successFeedback: z.string().min(1)
});

export const PointEntrySpec = z.object({
  type: z.literal("pointEntry"),
  prompt: z.string().min(1),
  /** The correct ordered tuple — 2+ signed integers (coordinate pair, vector components). */
  answer: z.array(z.number().int()).min(2),
  /** Display delimiters: "paren" → (a, b) for points · "angle" → ⟨a, b⟩ for vectors. */
  delimiter: z.enum(["paren", "angle"]).default("paren"),
  /** Optional per-slot aria labels; defaults to "first/second/… value" when omitted. */
  slotLabels: z.array(z.string().min(1)).optional(),
  /** Anticipated wrong TUPLES with diagnosis (same length as the answer). */
  commonEntries: z
    .array(z.object({ values: z.array(z.number().int()).min(2), feedback: z.string().min(1) }))
    .default([]),
  /** Shown for wrong tuples not in commonEntries. Diagnostic, never generic. */
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1).optional()
});

export const SliderSpec = z.object({
  type: z.literal("slider"),
  prompt: z.string().min(1),
  min: z.number(),
  max: z.number(),
  step: z.number().default(1),
  start: z.number(),
  target: z.number(),
  visual: z.enum(["groups", "numberline", "bar", "conic"]),
  /** For the "conic" visual: which locus the slider reshapes live. */
  conicKind: z.enum(["parabola", "ellipse"]).optional(),
  /** For the "groups" visual: items per group (e.g. apples per bag). */
  groupSize: z.number().int().positive().optional(),
  /** "grid" packs items like a bag; "row" lines them up like an array row. */
  groupLayout: z.enum(["grid", "row"]).default("grid"),
  itemEmoji: z.string().default("🍎"),
  unitLabel: z.string().optional(),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export const TapDiagramSpec = z.object({
  type: z.literal("tapDiagram"),
  prompt: z.string().min(1),
  mode: z.enum(["selectAll", "selectOne"]),
  /** Aspect ratio of the tap canvas. */
  canvas: z.object({ w: z.number().positive(), h: z.number().positive() }),
  hotspots: z
    .array(
      z.object({
        id: z.string().min(1),
        /** Position as percentages (0–100) of the canvas. */
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
        label: z.string().min(1),
        icon: z.string().min(1),
        /** How many icons the hotspot shows. 0 is legal and meaningful — an
         * empty plate/group is exactly how kindergarten meets zero. */
        count: z.number().int().min(0),
        correct: z.boolean().default(false),
        feedback: z.string().optional()
      })
    )
    .min(2),
  missFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export const DragOrderSpec = z.object({
  type: z.literal("dragOrder"),
  prompt: z.string().min(1),
  /** Presented top-to-bottom in this (shuffled) order. */
  items: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).min(3),
  correctOrder: z.array(z.string().min(1)).min(3),
  /** Anticipated transpositions: fires when `first` is placed anywhere before `second`. */
  misorderFeedback: z
    .array(z.object({ first: z.string(), second: z.string(), feedback: z.string().min(1) }))
    .default([]),
  missFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export const DragBucketSpec = z.object({
  type: z.literal("dragBucket"),
  prompt: z.string().min(1),
  buckets: z
    .array(z.object({ id: z.string().min(1), label: z.string().min(1), icon: z.string().optional() }))
    .min(2),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        bucketId: z.string().min(1),
        /** Diagnostic shown when this item lands in the wrong bucket. */
        feedback: z.string().min(1)
      })
    )
    .min(2),
  missFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export const MatchPairsSpec = z.object({
  type: z.literal("matchPairs"),
  prompt: z.string().min(1),
  left: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).min(2),
  right: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).min(2),
  /** leftId → rightId */
  pairs: z.record(z.string(), z.string()),
  /** Anticipated wrong links with diagnosis. */
  pairErrors: z
    .array(z.object({ left: z.string(), right: z.string(), feedback: z.string().min(1) }))
    .default([]),
  missFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export const BuildExpressionSpec = z.object({
  type: z.literal("buildExpression"),
  prompt: z.string().min(1),
  /** Token bank; may include distractor tokens that appear in no accepted build. */
  tokens: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).min(2),
  correct: z.array(z.string().min(1)).min(1),
  /** Alternative accepted builds (e.g. commutative forms). */
  acceptAlso: z.array(z.array(z.string().min(1))).default([]),
  /** Anticipated wrong builds with diagnosis. */
  commonBuilds: z
    .array(z.object({ sequence: z.array(z.string().min(1)), feedback: z.string().min(1) }))
    .default([]),
  /** Each token usable once (consumed) unless reusable. */
  reusable: z.boolean().default(false),
  missFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export const PlotPointSpec = z.object({
  type: z.literal("plotPoint"),
  prompt: z.string().min(1),
  cols: z.number().int().min(2).max(8),
  rows: z.number().int().min(2).max(8),
  /** Optional axis labels; x left→right, y bottom→top. */
  xLabels: z.array(z.string()).optional(),
  yLabels: z.array(z.string()).optional(),
  /** 1-based cell coordinates, y counted from the bottom. All must be marked. */
  targets: z.array(z.object({ x: z.number().int().min(1), y: z.number().int().min(1) })).min(1),
  /** When true, a line is drawn through the targets (in array order) once all are correctly marked — makes "the points line up" visible. */
  connectTargets: z.boolean().optional(),
  pointErrors: z
    .array(z.object({ x: z.number().int(), y: z.number().int(), feedback: z.string().min(1) }))
    .default([]),
  missFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

/** Boolean rule tree over toggle ids: "sw1" | {op:"and"|"or"|"not", args:[...]}. */
export type TRule = string | { op: "and" | "or" | "not"; args: TRule[] };
export const Rule: z.ZodType<TRule> = z.lazy(() =>
  z.union([
    z.string().min(1),
    z.object({ op: z.enum(["and", "or", "not"]), args: z.array(Rule).min(1) })
  ])
);

export const ToggleExploreSpec = z.object({
  type: z.literal("toggleExplore"),
  prompt: z.string().min(1),
  toggles: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).min(2),
  /** The lamp lights when this rule is true; the goal is to light it. */
  rule: Rule,
  /** Kid-readable statement of the rule, shown beside the lamp. */
  ruleText: z.string().min(1),
  /** Shown in the reveal state. */
  solutionText: z.string().min(1),
  commonStates: z
    .array(z.object({ states: z.record(z.string(), z.boolean()), feedback: z.string().min(1) }))
    .default([]),
  missFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export const SteppedRevealSpec = z.object({
  type: z.literal("steppedReveal"),
  prompt: z.string().min(1),
  panels: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        /** Optional named figure (FIGURES registry) shown with this panel — e.g. a construction
         *  stage. Lets a steppedReveal read as a genuine build-up rather than a wall of text. */
        figure: z.string().optional()
      })
    )
    .min(2)
    .max(6),
  continueFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export const EstimateSliderSpec = z.object({
  type: z.literal("estimateSlider"),
  prompt: z.string().min(1),
  /** Continuous mode is logarithmic and therefore needs min > 0. Discrete
   *  comparison mode is linear and may begin at 0, like a physical ruler. */
  min: z.number().nonnegative(),
  max: z.number().positive(),
  start: z.number().nonnegative().optional(),
  /** The stated actual/reference quantity against which estimates are compared. */
  target: z.number().positive(),
  /** Correct if within target ÷ factor … target × factor in continuous mode. */
  acceptFactor: z.number().min(1.1).default(2),
  unitLabel: z.string().optional(),
  /** Values to mark along the continuous logarithmic scale. */
  ticks: z.array(z.number().positive()).default([]),
  /** When present, the engine becomes an exact discrete comparison: the learner
   *  may choose only authored candidates, and every wrong candidate keeps its
   *  own misconception-specific feedback. */
  choices: z
    .array(
      z.object({
        value: z.number().nonnegative(),
        label: z.string().min(1),
        correct: z.boolean().default(false),
        feedback: z.string().min(1)
      })
    )
    .max(6)
    .default([]),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

/* ---------------- G1–G2 early-math manipulatives ---------------- */

export const TenFrameSpec = z.object({
  type: z.literal("tenFrame"),
  prompt: z.string().min(1),
  /** Total dots the finished frame should show (1–10). */
  target: z.number().int().min(1).max(10),
  /** Dots pre-placed and locked (e.g. "7 are here, add to make 10"). Must be < target so a tap is required. */
  preFilled: z.number().int().min(0).max(10).default(0),
  /** Colour cue for the dots the student adds. */
  addColor: z.enum(["sky", "tangerine", "leaf"]).default("tangerine"),
  /** Anticipated wrong fill counts, each with a diagnosis. */
  commonCounts: z
    .array(z.object({ count: z.number().int().min(0).max(10), feedback: z.string().min(1) }))
    .default([]),
  missFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export const NumberLineHopSpec = z.object({
  type: z.literal("numberLineHop"),
  prompt: z.string().min(1),
  min: z.number().int(),
  max: z.number().int(),
  /** Marked starting point. */
  start: z.number().int(),
  /** Size of each hop (≥1). */
  hop: z.number().int().min(1).default(1),
  /** Number of hops to make (≥1). Landing = start ± hop·hops. */
  hops: z.number().int().min(1),
  /** forward = add (right), back = subtract (left). */
  direction: z.enum(["forward", "back"]).default("forward"),
  /** S119 — rational hops. When present, EVERY integer on this spec (`min`, `max`, `start`,
   * `hop`, and each `commonLandings.value`) is read as a COUNT OF 1/denom UNITS rather than as a
   * whole number, and the axis renders those positions with their true fraction labels.
   *
   * This is deliberately not "relabel the line in fifths", which S116 rejected — correctly —
   * because showing a 0–10 integer axis for a question posed on 0–2 misrepresents the
   * mathematics. Here the numbers on screen ARE the question's numbers: the axis reads
   * 0, 1/5, 2/5 … 1 … 2, whole numbers carry taller emphasised ticks, and only the arithmetic
   * underneath stays in exact integer numerator units. Nothing is rounded and no float enters
   * grading, so the engine's determinism is unchanged. */
  denom: z.number().int().min(2).max(12).optional(),
  /** S119 — HOP-SIZE mode (the GCF shape). When present the learner sets the SIZE of the hop
   * instead of tapping a landing, and the graded value is that size. Every target must be
   * reachable by a whole number of hops from `start`, and the answer is the LARGEST size for
   * which that is true — which is exactly the greatest common factor of the targets' distances
   * from the start. GCF stops being a list-intersection procedure and becomes the biggest stride
   * that still lands on every mark.
   *
   * Deliberately a separate channel from `hops`/`commonLandings`: those grade a LANDING, this
   * grades a STRIDE, and conflating the two would make the value's meaning depend on which
   * fields happened to be authored. */
  hopSizeTargets: z.array(z.number().int()).min(2).max(4).optional(),
  hopSizeMin: z.number().int().min(1).max(24).optional(),
  hopSizeMax: z.number().int().min(1).max(24).optional(),
  /** Reached a stride that lands on every target but is not the largest one. */
  notLargestFeedback: z.string().min(1).optional(),
  /** Reached a stride that misses at least one target. */
  missesTargetFeedback: z.string().min(1).optional(),
  commonLandings: z
    .array(z.object({ value: z.number().int(), feedback: z.string().min(1) }))
    .default([]),
  missFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

/** The largest stride that lands on EVERY target from `start` — the greatest common factor of the
 * targets' distances, clamped to the authored slider range. Integer arithmetic only. Shared by the
 * renderer (which marks each target hit or missed), the grader, and the integrity gate, so what
 * the learner watches and what the grader concludes are one computation.
 * Returns null when no stride in range lands on all targets (an unsolvable authoring). */
export function hopSizeAnswer(
  start: number,
  targets: readonly number[],
  hopMin: number,
  hopMax: number
): number | null {
  let best: number | null = null;
  for (let h = hopMin; h <= hopMax; h++) {
    if (targets.every((t) => t !== start && (t - start) % h === 0)) best = h;
  }
  return best;
}

/** Exact label for `units` sixteenths/fifths/… on a `denom`-lattice number line: a whole number
 * where it lands on one, otherwise a reduced proper or mixed fraction. Integer arithmetic only —
 * no float ever reaches a label or a grade, which is what keeps the rational-hop line exact.
 * Shared by the renderer and its tests so the picture and the assertion cannot drift apart. */
export function hopLabel(units: number, denom: number): string {
  if (denom <= 1) return String(units);
  const sign = units < 0 ? "\u2212" : "";
  const a = Math.abs(units);
  const whole = Math.floor(a / denom);
  const rem = a % denom;
  if (rem === 0) return `${sign}${whole}`;
  const g = (x: number, y: number): number => (y === 0 ? x : g(y, x % y));
  const k = g(rem, denom);
  const frac = `${rem / k}/${denom / k}`;
  return whole === 0 ? `${sign}${frac}` : `${sign}${whole} ${frac}`;
}

export const BaseTenComposeSpec = z.object({  type: z.literal("baseTenCompose"),
  prompt: z.string().min(1),
  /** Up to 999 when maxHundreds > 0; the integrity check pins ≤99 builds to the two-place tray. */
  target: z.number().int().min(1).max(999),
  /** true = standard form only (one build); false = any h·100 + t·10 + o = target (regroup practice). */
  requireStandard: z.boolean().default(true),
  /** 0 = the original two-place tray (all pre-hundreds content); >0 adds the flats column. */
  maxHundreds: z.number().int().min(0).max(9).default(0),
  /** Up to 19 so a hundreds↔tens trade (1 flat = 10 rods) fits on the tray. */
  maxTens: z.number().int().min(1).max(19).default(9),
  maxOnes: z.number().int().min(9).max(20).default(20),
  commonBuilds: z
    .array(
      z.object({
        hundreds: z.number().int().default(0),
        tens: z.number().int(),
        ones: z.number().int(),
        feedback: z.string().min(1)
      })
    )
    .default([]),
  missFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

/** lengthCompare — proportional bars from a common baseline; tap the one the
 * question asks for. When unitLabel is set, bars show unit ticks so the length
 * can be COUNTED, not just eyeballed — the informal-unit measurement idea made
 * visible. This is the engine the ks-03-01/smg1-03 keeps were waiting for:
 * relative visible length, finally rendered.
 *
 * v2 — `mode: "align"` (the fair-comparison PROCEDURE, ks-03-01 k1/ch1):
 * bars start staggered (`startOffset` units past a dashed start line). The
 * learner must DRAG the offset bar(s) to the line (or use the paired slider,
 * the keyboard path) before the compare is fair, then tap their answer.
 * Grading of the align state:
 *   - not aligned + an answer picked  → that item's `feedback` (judged before
 *     making it fair — the "just look" misconception, diagnosed per bar);
 *   - not aligned + nothing picked    → `unalignedFeedback` (checked while the
 *     starts still differ) falling back to `missFeedback`;
 *   - aligned + wrong pick            → `missFeedback`;
 *   - aligned + `answerId` picked     → `successFeedback`.
 * In pick mode (default) `startOffset`/`unalignedFeedback` are unused and the
 * original one-tap semantics are unchanged. */
export const LengthCompareSpec = z.object({
  type: z.literal("lengthCompare"),
  prompt: z.string().min(1),
  /** pick = tap the answer bar (v1); align = drag staggered bars to the start line, THEN pick;
   *  difference = count the OVERHANG (S119). */
  mode: z.enum(["pick", "align", "difference"]).default("pick"),
  /** S119 — difference mode. "How many more?" is not a question about WHICH bar is longer, which
   * is all `pick` can grade; it is a question about the gap between them. Here the two bars are
   * drawn from a shared baseline with their unit ticks, the stretch by which the longer one
   * overhangs is shaded, and the learner counts THAT. Comparison subtraction stops being an
   * arithmetic step performed away from the picture and becomes the picture's own measurement.
   *
   * Requires exactly two items and a `unitLabel` — a difference in units cannot be counted off a
   * bar with no unit ticks — both of which the integrity gate enforces. */
  targetDifference: z.number().int().positive().optional(),
  /** Slider ceiling for the learner's count. Defaults to the longer bar's length, so "I counted
   * the whole long bar" is always reachable rather than clamped away. */
  diffMax: z.number().int().positive().optional(),
  /** Counted the whole longer bar instead of just the part that sticks out — by far the most
   * common comparison-subtraction error, and a REACHABLE state here rather than a message. */
  countsWholeFeedback: z.string().min(1).optional(),
  /** e.g. "paperclips" — draws per-unit tick marks and joins aria-valuetext. */
  unitLabel: z.string().min(1).optional(),
  /** h = lengths from a left baseline; v = heights from the ground (taller/shorter). */
  orientation: z.enum(["h", "v"]).default("h"),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        /** Length in units (or abstract proportion when unitLabel is absent). */
        length: z.number().positive(),
        /** align mode: how many units past the start line this bar begins (0 = on the line). */
        startOffset: z.number().min(0).default(0),
        feedback: z.string().optional()
      })
    )
    .min(2),
  answerId: z.string().min(1),
  /** align mode: fires when the learner checks while the starts still differ (no pick). */
  unalignedFeedback: z.string().min(1).optional(),
  missFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

/** Absolute-value number line: two or more SIGNED operands, each drawn as a
 * point on a shared number line with a distance BRACKET from 0 whose length
 * is |value|. The learner taps the operand FARTHEST from zero (largest
 * magnitude), or the "same distance" chip when the magnitudes tie. This makes
 * the value-vs-distance distinction visible: a number can sit to the LEFT
 * (smaller value) yet reach FARTHER from zero (larger magnitude) — the very
 * thing a value-relation pick (<, =, >) cannot express. Owns the magnitude
 * ("farther from zero", "larger debt") pocket that rationalCompare cannot. */
export const AbsValueLineSpec = z.object({
  type: z.literal("absValueLine"),
  prompt: z.string().min(1),
  /** Optional unit word (e.g. "degrees", "dollars") joined into readouts and
   * bracket labels; purely descriptive chrome, never authored content. */
  unitLabel: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        /** Signed value: position on the line; magnitude = Math.abs(value). */
        value: z.number(),
        /** The tappable chip's display text (carries the authored option label
         * verbatim — may be a bare number or a full reasoning phrase). */
        label: z.string().min(1),
        /** Diagnosis when this (non-answer) operand is tapped. Absent on the
         * answer operand (its own slot can never fire — success carries it). */
        feedback: z.string().optional()
      })
    )
    .min(2),
  /** id of the operand farthest from zero, OR the literal "equal" when tied. */
  answerId: z.string().min(1),
  /** Label for the optional "same distance / same debt" chip. */
  equalLabel: z.string().min(1).optional(),
  /** Diagnosis when the equal chip is tapped but the magnitudes differ.
   * Absent when "equal" IS the answer (its own slot can never fire). */
  equalFeedback: z.string().min(1).optional(),
  missFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export const SubitizeFlashSpec = z.object({
  type: z.literal("subitizeFlash"),
  prompt: z.string().min(1),
  count: z.number().int().min(1).max(10),
  arrangement: z.enum(["dice", "tenFrame", "line", "scatter"]).default("dice"),
  /** Milliseconds the dots stay visible per flash (re-flashable + hold-to-view for accessibility). */
  flashMs: z.number().int().min(400).max(3000).default(1200),
  /** Answer choices; must include `count`. */
  options: z.array(z.number().int().min(0).max(12)).min(2),
  commonPicks: z.array(z.object({ value: z.number().int(), feedback: z.string().min(1) })).default([]),
  missFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

/** lineExplore — a two-parameter manipulative: the learner drags slope (m) and intercept (b)
 * on native range inputs and a graph line, a rise/run triangle, and the y = mx + b equation all
 * update together (synchronized representations). Correct when the line matches the target. */
export const LineExploreSpec = z.object({
  type: z.literal("lineExplore"),
  prompt: z.string().min(1),
  targetSlope: z.number().int(),
  targetIntercept: z.number().int(),
  slopeMin: z.number().int().default(-4),
  slopeMax: z.number().int().default(4),
  interceptMin: z.number().int().default(-5),
  interceptMax: z.number().int().default(5),
  slopeStart: z.number().int().default(0),
  interceptStart: z.number().int().default(0),
  gridMax: z.number().int().positive().default(6),
  successFeedback: z.string().min(1),
  slopeFeedback: z.string().min(1),
  interceptFeedback: z.string().min(1)
});

/** fractionBar — drag numerator and denominator; a partitioned bar, the fraction, its decimal,
 * and a reference bar update together. Correct on ANY fraction equal in value to the target,
 * so the learner discovers equivalence (2/4, 3/6 … all match 1/2). */
export const FractionBarSpec = z.object({
  type: z.literal("fractionBar"),
  prompt: z.string().min(1),
  targetNum: z.number().int().positive(),
  targetDen: z.number().int().positive(),
  numMin: z.number().int().positive().default(1),
  numMax: z.number().int().positive().default(12),
  denMin: z.number().int().positive().default(1),
  denMax: z.number().int().positive().default(12),
  numStart: z.number().int().positive().default(1),
  denStart: z.number().int().positive().default(1),
  /** Per-value misconception traps, matched on the EXACT build (num AND den) before the
   * direction-generic low/high fallbacks — a trap is a specific build ("you made 1/4"),
   * so equivalents of a trap fall through to low/high rather than borrow its diagnosis.
   * This is what naming-vocabulary items ("a third" vs "a fourth") need: the authored
   * distractor feedback is value-specific, and the low/high slots are not. */
  commonFractions: z
    .array(
      z.object({
        num: z.number().int().positive(),
        den: z.number().int().positive(),
        feedback: z.string().min(1)
      })
    )
    .default([]),
  /** false = hide the reference/target bar (and the live "✓ equal" cue) for items where the
   * target is named in the prompt ("build a half") and showing it would print the answer. */
  showTarget: z.boolean().default(true),
  /** words = read the build as "1 of 2 equal parts" and hide the decimal — fraction NOTATION
   * is a Grade-3 skill, so Grade 1–2 partition items speak in part-language instead. */
  notation: z.enum(["symbol", "words"]).default("symbol"),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** quadraticExplore — drag a (stretch/flip), h and k (shifts) of vertex form y = a(x−h)² + k;
 * the parabola, its vertex point, and the equation update together. Correct when a, h, k match. */
export const QuadraticExploreSpec = z.object({
  type: z.literal("quadraticExplore"),
  prompt: z.string().min(1),
  targetA: z.number().int(),
  targetH: z.number().int(),
  targetK: z.number().int(),
  /** (S238) Exact-rational leading coefficient, closing the S237 NOT-POSSIBLE row ft-03-02/k3:
   * with aDen > 1, every `a` field (targetA, aMin, aMax, aStart) is a NUMERATOR over this fixed
   * denominator, so a = 1/3 is authorable as targetA 1 over aDen 3 — drawable, gradable, and
   * displayed as the exact fraction. Integers only, never floats: 0 < a < 1 lands exactly, the
   * same house rule the roots form states for its crossings. Default 1 (a IS the integer) keeps
   * every existing spec byte-identical. Vertex form only; the roots form keeps integer a. */
  aDen: z.number().int().positive().default(1),
  /** (S238) Draw the parent y = x² dashed behind the learner's curve — the reference that makes
   * "wider or narrower THAN THE PARENT" a visible comparison instead of a remembered rule. */
  showParent: z.boolean().default(false),
  aMin: z.number().int().default(-3),
  aMax: z.number().int().default(3),
  hMin: z.number().int().default(-5),
  hMax: z.number().int().default(5),
  kMin: z.number().int().default(-5),
  kMax: z.number().int().default(5),
  aStart: z.number().int().default(1),
  hStart: z.number().int().default(0),
  kStart: z.number().int().default(0),
  gridMax: z.number().int().positive().default(7),
  /** S119 — ROOTS form: y = a(x - r1)(x - r2), with the learner dragging the two roots.
   *
   * The qu- solving lessons are all about where a parabola MEETS THE AXIS, and vertex form cannot
   * pose them: x^2 + 5x + 6 has vertex (-2.5, -0.25), and `hMin`/`hMax` are integers. In roots form
   * the two things the learner drags ARE the two solutions, so "solving" stops being a procedure
   * performed away from the picture and becomes the crossings themselves. The zero-product
   * property is then not a rule but a reading: the product is zero exactly where a factor is.
   *
   * Order is deliberately not significant — (x-2)(x-3) and (x-3)(x-2) are the same parabola, and
   * grading them differently would teach a distinction that does not exist. */
  form: z.enum(["vertex", "roots"]).default("vertex"),
  targetR1: z.number().int().optional(),
  targetR2: z.number().int().optional(),
  rMin: z.number().int().default(-9),
  rMax: z.number().int().default(9),
  r1Start: z.number().int().default(0),
  r2Start: z.number().int().default(0),
  successFeedback: z.string().min(1),
  shapeFeedback: z.string().min(1),
  vertexFeedback: z.string().min(1)
});

/** The expanded coefficients of a(x - r1)(x - r2) = ax^2 + bx + c. Exact integer arithmetic, so a
 * lesson's own equation can be checked against the roots it claims rather than trusted. */
export function rootsFormCoefs(a: number, r1: number, r2: number): { a: number; b: number; c: number } {
  // `+ 0` normalises negative zero. Opposite roots give -a*(r1+r2) = -0, which is 0 mathematically
  // but renders as "\u2212 0" — and the difference of squares, x\u00b2 \u2212 9, is precisely the
  // lesson where a middle coefficient of zero is the point being made.
  return { a, b: -a * (r1 + r2) + 0, c: a * r1 * r2 + 0 };
}

/** b^2 - 4ac for a parabola given by its roots. Equals a^2(r1 - r2)^2, so it is zero exactly when
 * the roots coincide and positive otherwise — which is why a real-rooted parabola can never
 * demonstrate a negative discriminant, and the "no real solutions" case needs vertex form. */
export function rootsFormDiscriminant(a: number, r1: number, r2: number): number {
  const { b, c } = rootsFormCoefs(a, r1, r2);
  return b * b - 4 * a * c;
}

/** unitCircleExplore — drag the angle; the point on the unit circle, its reference triangle, and
 * cos θ / sin θ update together. Correct when the angle matches the target.
 *
 * S115 additive modes (Conversion Playbook §2.2, all fields optional — pre-existing specs parse
 * byte-identically):
 *   wave   — the circle unrolls: dragging θ traces y = amplitude·trig(angularScale·θ + phaseDeg)
 *            + midline to the right of the circle, tip tied to the point by a leader line. With
 *            `dials`, chosen parameters become sliders and the target wave is drawn to match;
 *            with `targetFeature`, the drag must land the trace on a named feature.
 *   ghost  — an identity is a point that can't escape itself: a second point computed from the
 *            RHS formula rides the direct point at every reachable θ. `ghostChoices` offers
 *            formula variants; the impostors visibly detach (the contrast case).
 *   branch — [min, max] greys the rest of the circle and hard-stops the drag at the walls: the
 *            restriction that makes an inverse a function is something you bump into.
 * Angles are DEGREES throughout, matching the engine's existing integer lattice (deviation from
 * the playbook's radian phase, ledgered in CONVERSION_LOG).
 */
export const UnitCircleExploreSpec = z.object({
  type: z.literal("unitCircleExplore"),
  prompt: z.string().min(1),
  targetAngle: z.number().int(),
  angleStart: z.number().int().default(0),
  angleStep: z.number().int().positive().default(15),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1),
  /* ---- wave ---- */
  trace: z.enum(["sin", "cos", "tan"]).optional(),
  amplitude: z.number().optional(),
  phaseDeg: z.number().int().optional(),
  angularScale: z.number().optional(),
  midline: z.number().optional(),
  targetFeature: z
    .object({
      kind: z.enum(["peak", "zero", "period", "midlineCross"]),
      /** Degrees along the wave's horizontal axis. */
      x: z.number(),
      tol: z.number().positive(),
    })
    .optional(),
  /** Learner-adjustable parameters; the target wave is drawn (tangerine) until every dial
   * matches. Each wrong dial carries its own diagnosis. */
  dials: z
    .array(
      z.object({
        param: z.enum(["amplitude", "midline", "angularScale", "phaseDeg"]),
        min: z.number(),
        max: z.number(),
        step: z.number().positive(),
        start: z.number(),
        target: z.number(),
        feedback: z.string().min(1),
      })
    )
    .min(1)
    .max(4)
    .optional(),
  /* ---- ghost ---- */
  ghost: z.enum(["double", "negate", "cofunction", "sum"]).optional(),
  /** The fixed second angle for `ghost: "sum"` (degrees). */
  ghostAngle: z.number().int().optional(),
  showGhostCoords: z.boolean().optional(),
  /** Selectable RHS formulas. Ids are the computable set in ucGhostPoint; a false formula's
   * ghost detaches from the direct point, and its feedback names WHY. */
  ghostChoices: z
    .array(
      z.object({
        id: z.enum(["exact", "face2cos2", "face1minus2sin2", "signError", "linearity", "bothNegated"]),
        label: z.string().min(1),
        feedback: z.string().min(1).optional(),
      })
    )
    .min(2)
    .max(4)
    .optional(),
  /* ---- branch ---- */
  branch: z.tuple([z.number().int(), z.number().int()]).optional(),
});

/** Which selectable ghost formulas are true identities — a mathematical fact of the id, shared by
 * the integrity gate, the grader, and the renderer. */
export function quadName(pts: Array<[number, number]>): string {
  const d = (i: number, j: number) =>
    Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
  const side = [d(0, 1), d(1, 2), d(2, 3), d(3, 0)];
  const diag = [d(0, 2), d(1, 3)];
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
  const oppEqual = near(side[0], side[2]) && near(side[1], side[3]);
  const allEqual = side.every((x) => near(x, side[0]));
  const diagEqual = near(diag[0], diag[1]);
  if (allEqual && diagEqual) return "a square";
  if (allEqual) return "a rhombus";
  if (oppEqual && diagEqual) return "a rectangle";
  if (oppEqual) return "a parallelogram";
  // A kite is TWO PAIRS OF ADJACENT congruent sides, and adjacency comes in two
  // rotations: (s0,s1)+(s2,s3) or (s1,s2)+(s3,s0). Testing only the first
  // misclassified every kite whose axis ran the other way as "just a quadrilateral".
  if (
    (near(side[0], side[1]) && near(side[2], side[3])) ||
    (near(side[1], side[2]) && near(side[3], side[0]))
  )
    return "a kite";
  // S120: exactly one pair of parallel sides. Without this case the classifier called every
  // trapezoid "just a quadrilateral", so the trapezoid midsegment lab would have shown a learner
  // the correct shape under a label denying it had a name. Tested AFTER the kite branch so no
  // shape the model already names changes what it is called; the parallelogram families above
  // have both pairs parallel and have already returned.
  if (hasSomeParallelPair(pts)) return "a trapezoid";
  return "just a quadrilateral";
}

/** Either pair of opposite sides parallel: (0-1, 2-3), or the same test one rotation round. */
function hasSomeParallelPair(pts: Array<[number, number]>): boolean {
  return (
    hasParallelBasePair(pts) ||
    hasParallelBasePair([pts[1], pts[2], pts[3], pts[0]])
  );
}

/** The three right-triangle ratios at an acute angle, in degrees. Shared by the renderer, the
 * integrity gate and the grader so the number on screen and the number graded are one number.
 * Scale-free BY CONSTRUCTION: no length enters. That is exactly the fact `ratios` mode teaches. */
export function triangleRatio(angleDeg: number, which: "opp/hyp" | "adj/hyp" | "opp/adj"): number {
  const r = (angleDeg * Math.PI) / 180;
  return which === "opp/hyp" ? Math.sin(r) : which === "adj/hyp" ? Math.cos(r) : Math.tan(r);
}

/** RELEASE BLOCKER FIX (S119) — one geometric truth model for triangleConstraintLab.
 *
 * The lab previously computed its displayed angles from a formula that had nothing to do with the
 * triangle it drew. Released from the isosceles lock it used
 * `otherBase = 180 − apex − baseAngle × 0.72`, an arbitrary factor whose angles do not sum to 180:
 * at an apex of 60° it displayed 60 + 60 + 76.8 = 196.8°, an impossible triangle presented as fact.
 * The midsegment mode was worse — both of its readouts were the constant `sideA / 2`, drawn from
 * no geometry at all, so releasing the "midpoint" lock changed the caption and not one number.
 *
 * Everything is now derived from ONE set of vertices. Angles come from those coordinates by the
 * law of cosines, so they sum to 180 by construction rather than by hope, and the midsegment is
 * measured between the points it is actually drawn between.
 */
export type TriangleModel = {
  vertices: [[number, number], [number, number], [number, number]];
  /** Interior angles at A, B, C in degrees. Sums to 180 by construction. */
  angles: [number, number, number];
  /** Side lengths opposite A, B, C. */
  sides: [number, number, number];
  legsEqual: boolean;
  /** Present in midsegment mode: the join actually drawn, and the base it is compared against. */
  midsegment?: { from: [number, number]; to: [number, number]; length: number; base: number; isMidpoints: boolean };
};

const angleAtVertex = (p: [number, number], q: [number, number], r: [number, number]): number => {
  const u = [q[0] - p[0], q[1] - p[1]];
  const v = [r[0] - p[0], r[1] - p[1]];
  const m = Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]);
  if (m < 1e-12) return 0;
  const c = Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / m));
  return (Math.acos(c) * 180) / Math.PI;
};

/** Build the triangle the lab is actually showing.
 *
 * `isoscelesLegs` locked: both legs are `sideB`, so the base angles are equal — a fact of the
 * coordinates, not an assertion. Released: the second leg becomes `sideA`, the triangle is scalene,
 * and the base angles diverge — still summing to 180 with the apex, because they are measured.
 *
 * `midsegment` locked: the join runs between the true midpoints of the two legs, so its length is
 * exactly half the base. Released: the join slides to 0.35 along both legs, and its length is
 * 0.35 of the base — a number that visibly stops being half. */
export function triangleConstraintModel(
  apexDeg: number,
  sideA: number,
  sideB: number,
  constraint: "isoscelesLegs" | "midsegment" | undefined,
  broken: boolean
): TriangleModel {
  const rad = (apexDeg * Math.PI) / 180;
  const A: [number, number] = [0, 0];
  const legAC = constraint === "isoscelesLegs" && !broken ? sideB : sideA;
  const B: [number, number] = [sideB, 0];
  const C: [number, number] = [legAC * Math.cos(rad), legAC * Math.sin(rad)];
  const angles: [number, number, number] = [
    angleAtVertex(A, B, C),
    angleAtVertex(B, A, C),
    angleAtVertex(C, A, B)
  ];
  const d = (p: [number, number], q: [number, number]) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const sides: [number, number, number] = [d(B, C), d(A, C), d(A, B)];
  const model: TriangleModel = {
    vertices: [A, B, C],
    angles,
    sides,
    legsEqual: Math.abs(d(A, B) - d(A, C)) < 1e-9
  };
  if (constraint === "midsegment") {
    // t along each leg from the apex: 1/2 is the midsegment, anything else is not.
    const t = broken ? 0.35 : 0.5;
    const from: [number, number] = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
    const to: [number, number] = [A[0] + (C[0] - A[0]) * t, A[1] + (C[1] - A[1]) * t];
    model.midsegment = {
      from,
      to,
      length: d(from, to),
      base: d(B, C),
      isMidpoints: !broken
    };
  }
  return model;
}

/** S119 — the true length of a volumeBuilder edge, given its raw slider tick and an optional
 * denominator. Shared by the renderer, the grader and the integrity gate, exactly the role
 * `hopLabel`'s denominator plays for `numberLineHop` — the number on screen is the tick count, the
 * number that matters mathematically is this. */
export function prismEdgeLength(raw: number, denom: number | undefined): number {
  return denom ? raw / denom : raw;
}

/** The exact volume of a prism whose length edge may be fractional. */
export function prismVolume(l: number, w: number, h: number, denomL: number | undefined): number {
  return prismEdgeLength(l, denomL) * w * h;
}

/** The trapezoid/triangle midsegment length: the average of the two parallel sides. */
/** The altitude-to-hypotenuse figure, computed rather than authored.
 *
 * `shape[0]` and `shape[1]` are the ends of the hypotenuse; `shape[2]` is used only to decide
 * which side of it the apex sits on. The apex is NOT taken from the authoring — it is placed at
 * height √(p·q) above the foot, which is exactly the position that rides the Thales semicircle
 * over the hypotenuse. That is why the right angle survives every drag: it is built into where
 * the apex is allowed to be, not asserted in prose.
 *
 * Shared by the integrity gate, the renderer and the tests so the figure on screen, the figure
 * graded and the figure asserted are one figure. */
export function altitudeMeans(
  shape: Array<[number, number]>,
  k: number
): { c: number; p: number; q: number; h: number; foot: [number, number]; apex: [number, number]; legA: number; legB: number } {
  const [A, B, ref] = shape;
  const dx = B[0] - A[0], dy = B[1] - A[1];
  const c = Math.hypot(dx, dy);
  const ux = c ? dx / c : 0, uy = c ? dy / c : 0;
  const p = k * c, q = c - p;
  const h = Math.sqrt(Math.max(0, p * q));
  const foot: [number, number] = [A[0] + p * ux, A[1] + p * uy];
  // Unit normal, turned toward whichever side the authored third vertex sits on.
  let nx = -uy, ny = ux;
  if (ref && (ref[0] - A[0]) * nx + (ref[1] - A[1]) * ny < 0) { nx = -nx; ny = -ny; }
  const apex: [number, number] = [foot[0] + h * nx, foot[1] + h * ny];
  const legA = Math.hypot(apex[0] - A[0], apex[1] - A[1]);
  const legB = Math.hypot(apex[0] - B[0], apex[1] - B[1]);
  return { c, p, q, h, foot, apex, legA, legB };
}

export function midsegmentLength(base1: number, base2: number): number {
  return (base1 + base2) / 2;
}

/** Does the pair of sides the midsegment readout actually averages — AB (vertices 0-1) and CD
 * (vertices 2-3) — form a genuine pair of parallel bases?
 *
 * S120: this replaces a `quadName` proxy in the `showMidsegment` gate. The proxy rejected any
 * shape named "just a quadrilateral", and `quadName` has no trapezoid case, so EVERY trapezoid
 * was refused — the one family the trapezoid midsegment theorem is about. The renderer was
 * always correct for trapezoids (it draws the join of the midpoints of 1-2 and 3-0 and averages
 * 0-1 with 2-3); only the gate disagreed, which is why the enhancement shipped with zero uptake.
 *
 * Parallel is tested directly, and the two bases must be distinct lines: if C lies on line AB the
 * quadrilateral has collapsed and there is nothing to average. A kite still fails, as intended. */
export function hasParallelBasePair(pts: Array<[number, number]>): boolean {
  if (pts.length !== 4) return false;
  const vec = (i: number, j: number): [number, number] => [pts[j][0] - pts[i][0], pts[j][1] - pts[i][1]];
  const cross = (u: [number, number], w: [number, number]) => u[0] * w[1] - u[1] * w[0];
  const ab = vec(0, 1), cd = vec(2, 3);
  if (Math.hypot(...ab) < 1e-9 || Math.hypot(...cd) < 1e-9) return false;
  if (Math.abs(cross(ab, cd)) > 1e-9) return false;
  return Math.abs(cross(ab, vec(0, 2))) > 1e-9;
}

export const UC_TRUE_FORMULAS: ReadonlySet<string> = new Set(["exact", "face2cos2", "face1minus2sin2"]);

const DEG = Math.PI / 180;

/** Wave value at x degrees: amplitude·trig(angularScale·x + phaseDeg) + midline. */
export function ucWaveY(
  x: number,
  trace: "sin" | "cos" | "tan",
  amplitude = 1,
  angularScale = 1,
  phaseDeg = 0,
  midline = 0
): number {
  const arg = (angularScale * x + phaseDeg) * DEG;
  const t = trace === "sin" ? Math.sin(arg) : trace === "cos" ? Math.cos(arg) : Math.tan(arg);
  return amplitude * t + midline;
}

/** RELEASE BLOCKER FIX (S119) — the circle quantity each trace actually comes from.
 *
 * The wave view drew the moving point at (cos g, sin g) and then ran a leader line from that
 * point's HEIGHT to the graph, with a comment asserting "the point's height IS the trace value".
 * That is true for sine and false for the other two: cosine is the point's HORIZONTAL coordinate,
 * and tangent is not a coordinate of the point at all — it is the height where the ray through the
 * point meets the vertical tangent line at x = 1. Drawing all three as a vertical drop taught a
 * false causal story twice over.
 *
 * This returns the raw circle-derived quantity, before amplitude and midline. */
export function ucCircleQuantity(trace: "sin" | "cos" | "tan", genDeg: number): number {
  const r = genDeg * DEG;
  return trace === "sin" ? Math.sin(r) : trace === "cos" ? Math.cos(r) : Math.tan(r);
}

/** Where the transferred quantity is READ OFF the unit circle, in unit coordinates, and by what
 * construction. The renderer draws exactly this; the tests assert it against the trig directly.
 *
 * - `sin`  — vertical: the point's own height, read on the y-axis.
 * - `cos`  — horizontal: the point's x-coordinate. It is carried to the y-axis by a quarter-turn
 *            arc (a genuine rotation of the segment), never by pretending it was already vertical.
 * - `tan`  — the tangent-line construction: extend the ray through the point to the vertical line
 *            x = 1; the height of that intersection is tan. Undefined at the asymptotes, which is
 *            reported rather than drawn.
 *
 * Amplitude and midline are deliberately NOT applied here: they transform the EMITTED ordinate on
 * the graph, not the meaning of the unit circle, so the circle stays a unit circle at every
 * amplitude. */
export function ucTransferGeometry(
  trace: "sin" | "cos" | "tan",
  genDeg: number
): { kind: "vertical" | "horizontal" | "tangent"; from: [number, number]; readAt: number; defined: boolean } {
  const r = genDeg * DEG;
  const c = Math.cos(r), s = Math.sin(r);
  if (trace === "sin") return { kind: "vertical", from: [c, s], readAt: s, defined: true };
  if (trace === "cos") return { kind: "horizontal", from: [c, s], readAt: c, defined: true };
  // Tangent: the ray hits x = 1 at height sin/cos. Near cos = 0 the intersection runs off to
  // infinity — the asymptote — and must be reported as undefined rather than drawn at a clamp.
  const defined = Math.abs(c) > 1e-9;
  return { kind: "tangent", from: [c, s], readAt: defined ? s / c : Number.NaN, defined };
}

/** The two points a ghost lesson compares at learner angle θ (degrees): `direct` is the point the
 * identity's LEFT side names (2θ, −θ, 90−θ, θ+A); `ghost` is computed from the selected RHS
 * formula. For every true formula they coincide at every reachable θ — that coincidence IS the
 * identity, and the impostors' failure to coincide is the contrast case. */
export function ucGhostPoint(
  thetaDeg: number,
  kind: "double" | "negate" | "cofunction" | "sum",
  formula: "exact" | "face2cos2" | "face1minus2sin2" | "signError" | "linearity" | "bothNegated",
  ghostAngleDeg = 0
): { direct: [number, number]; ghost: [number, number] } {
  const th = thetaDeg * DEG;
  const c = Math.cos(th), s = Math.sin(th);
  const A = ghostAngleDeg * DEG;
  const cA = Math.cos(A), sA = Math.sin(A);
  const directAngle =
    kind === "double" ? 2 * thetaDeg : kind === "negate" ? -thetaDeg : kind === "cofunction" ? 90 - thetaDeg : thetaDeg + ghostAngleDeg;
  const da = directAngle * DEG;
  const direct: [number, number] = [Math.cos(da), Math.sin(da)];
  let ghost: [number, number];
  switch (kind) {
    case "double":
      ghost =
        formula === "face2cos2" ? [2 * c * c - 1, 2 * s * c]
        : formula === "face1minus2sin2" ? [1 - 2 * s * s, 2 * s * c]
        : formula === "signError" ? [s * s - c * c, 2 * s * c]
        : [c * c - s * s, 2 * s * c]; // exact
      break;
    case "negate":
      ghost = formula === "bothNegated" ? [-c, -s] : [c, -s];
      break;
    case "cofunction":
      ghost = formula === "signError" ? [s, -c] : [s, c];
      break;
    case "sum":
      ghost =
        formula === "linearity" ? [c + cA, s + sA] : [c * cA - s * sA, s * cA + c * sA];
      break;
  }
  return { direct, ghost };
}

/** systemsExplore — place a point on a grid with two drawn lines; a solution to the system is the
 * single point lying on BOTH. Correct when the point is on both lines (their intersection). */
/**
 * S212 — per-line learner control for `systemsExplore`, additive and optional.
 *
 * Present on a line means that line's rate and starting value become the learner's to move, which
 * is what turns a fixed picture of a system into one whose solution can be BROKEN: make the rates
 * equal and the crossing leaves (parallel), match the starts too and it returns everywhere
 * (coincident). Absent means exactly today's behaviour — the line is authored and immovable.
 *
 * The vocabulary is deliberately `lineExplore`'s, so the wiring reuses the established policy path
 * rather than inventing a second one: a range, a lattice step, and a declared response when an
 * edit leaves either (`clamp`/`snap` report the adjustment; `reject` refuses with a reason).
 *
 * PERSISTED VALUE. The value stays `{ x, y }` and gains an OPTIONAL `lines` envelope carrying the
 * four parameters. A value written before this field existed — or by a spec that never enables
 * editing — is `{ x, y }` forever and stays valid; `lines` is only written once a learner has
 * actually moved a line. See `systemsPairAdapter.ts`, which owns that normalization.
 */
export const SystemsLineEditSpec = z.object({
  slopeMin: z.number().int().default(-5),
  slopeMax: z.number().int().default(5),
  slopeStep: z.number().int().positive().default(1),
  interceptMin: z.number().int().default(-10),
  interceptMax: z.number().int().default(10),
  interceptStep: z.number().int().positive().default(1),
  /** What an edit past the end of the range does. `clamp` holds it at the end and says so. */
  outOfRange: z.enum(["clamp", "reject"]).default("clamp"),
  /** What an edit between lattice points does. `snap` moves to the nearest and says so. */
  offLattice: z.enum(["snap", "reject"]).default("snap")
});
export type TSystemsLineEdit = z.infer<typeof SystemsLineEditSpec>;

export const SystemsExploreSpec = z.object({
  type: z.literal("systemsExplore"),
  prompt: z.string().min(1),
  m1: z.number().int(),
  b1: z.number().int(),
  m2: z.number().int(),
  b2: z.number().int(),
  xMin: z.number().int().default(0),
  xMax: z.number().int().default(6),
  yMin: z.number().int().default(0),
  yMax: z.number().int().default(7),
  xStart: z.number().int().default(0),
  yStart: z.number().int().default(0),
  successFeedback: z.string().min(1),
  offLine1Feedback: z.string().min(1),
  offLine2Feedback: z.string().min(1),
  /** Optional and defaultless: omit and the parsed spec is byte-identical to what it always was. */
  editLine1: SystemsLineEditSpec.optional(),
  editLine2: SystemsLineEditSpec.optional(),
  /**
   * What to say when the learner has made the system degenerate — parallel (no solution) or
   * coincident (infinitely many). REQUIRED whenever a line is editable; see
   * `systemsExploreEditErrors`, which is the gate that makes the borrowed-message state
   * unreachable rather than merely discouraged.
   *
   * Without it the grader had to reuse the off-line strings, which for coincident lines reads
   * plainly wrong: it tells the learner the point is off a line it is demonstrably on. An author
   * who opens a line is the person who knows what that lesson should say when its question is
   * dismantled, so the schema asks them for it rather than inventing one.
   */
  degenerateSystemFeedback: z.string().min(1).optional()
});

/**
 * A line the learner may move must START somewhere they could have put it: inside the authored
 * range and on the authored lattice. Otherwise the opening position is unreachable by the very
 * controls that are supposed to own it, and the first nudge would jump.
 */
export function systemsExploreEditErrors(spec: {
  m1: number; b1: number; m2: number; b2: number;
  editLine1?: TSystemsLineEdit; editLine2?: TSystemsLineEdit;
  degenerateSystemFeedback?: string;
}): string[] {
  const errs: string[] = [];
  // THE GATE (S212 review, condition 1). A movable line makes parallel and coincident reachable
  // states, so enabling editing without authoring the string that names them would ship a lesson
  // whose only response to a destroyed system is a borrowed sentence about the wrong thing.
  if ((spec.editLine1 || spec.editLine2) && !spec.degenerateSystemFeedback) {
    errs.push("systemsExplore: a spec with an editable line must author degenerateSystemFeedback — parallel and coincident are reachable states and need their own words");
  }
  const check = (line: 1 | 2, edit: TSystemsLineEdit | undefined, m: number, b: number) => {
    if (!edit) return;
    if (edit.slopeMin > edit.slopeMax) errs.push(`systemsExplore: line ${line} slope range is inverted`);
    if (edit.interceptMin > edit.interceptMax) errs.push(`systemsExplore: line ${line} intercept range is inverted`);
    if (m < edit.slopeMin || m > edit.slopeMax) errs.push(`systemsExplore: line ${line} starts at rate ${m}, outside its editable range ${edit.slopeMin} to ${edit.slopeMax}`);
    if (b < edit.interceptMin || b > edit.interceptMax) errs.push(`systemsExplore: line ${line} starts at ${b}, outside its editable range ${edit.interceptMin} to ${edit.interceptMax}`);
    if ((m - edit.slopeMin) % edit.slopeStep !== 0) errs.push(`systemsExplore: line ${line} starts at rate ${m}, which is not a step of ${edit.slopeStep} from ${edit.slopeMin}`);
    if ((b - edit.interceptMin) % edit.interceptStep !== 0) errs.push(`systemsExplore: line ${line} starts at ${b}, which is not a step of ${edit.interceptStep} from ${edit.interceptMin}`);
  };
  check(1, spec.editLine1, spec.m1, spec.b1);
  check(2, spec.editLine2, spec.m2, spec.b2);
  return errs;
}

/** numberLinePlace — drag a marker along a number line to a target value (integers, negatives, or
 * fractions via a fractional step). Reuses linScale for the mapping. */
export const NumberLinePlaceSpec = z.object({
  type: z.literal("numberLinePlace"),
  prompt: z.string().min(1),
  min: z.number().int(),
  max: z.number().int(),
  step: z.number().positive().default(1),
  tickStep: z.number().positive().default(1),
  target: z.number(),
  start: z.number().default(0),
  /** Fraction-line rendering: the line is authored in JUMP units (min 0, max = fractionDen,
   * step 1 — everything stays integer-exact, no float denominators in JSON). The endpoints
   * render as 0 and 1, interior ticks are UNLABELED (labeling every tick with its fraction
   * would print the answer on the line), and the readout speaks positionally ("mark 2 of 6")
   * so the mark↔fraction correspondence is what the learner supplies. */
  fractionDen: z.number().int().positive().optional(),
  /** S116 enhancement (i): show a live |v| readout beside the position readout. Absolute value is
   * taught as a rule ("drop the sign") and then misapplied, because position and distance are
   * never shown as two DIFFERENT numbers about the same marker. With this on, placing −7 reads
   * "position −7 · distance from 0: 7" — the marker sits left, the distance does not. Off by
   * default; only lessons about absolute value or ordering-by-magnitude should turn it on. */
  showDistanceFromZero: z.boolean().optional(),
  /** Per-value misconception landings (e.g. "placed 1/6 at the sixth mark — that's 6/6 = 1"),
   * checked before the direction-generic low/high fallbacks. */
  commonPlacements: z
    .array(z.object({ value: z.number(), feedback: z.string().min(1) }))
    .default([]),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** functionMachine — set the input; a rule y = a·x + b transforms it to a live output. Reach a
 * target output. Teaches function-as-machine (one input → one output). */
export const FunctionMachineSpec = z.object({
  type: z.literal("functionMachine"),
  prompt: z.string().min(1),
  a: z.number().int(),
  b: z.number().int(),
  inputMin: z.number().int(),
  inputMax: z.number().int(),
  inputStep: z.number().int().positive().default(1),
  inputStart: z.number().int().default(0),
  targetOutput: z.number().int(),
  /** S119 — a SECOND machine, and how the two are joined.
   *
   * `compose` feeds the first machine's output into the second, which is what f(g(x)) means and
   * why the order matters: the ft-04-02/03 lessons turn on g-then-f differing from f-then-g, and
   * that is an ordering you can watch rather than a rule to recall. `add` and `multiply` feed BOTH
   * machines the same input and combine their outputs, which is what (f + g)(x) and (f · g)(x)
   * mean — the same two machines wired differently.
   *
   * Each stage is a·x + b; `square: true` squares the stage's input first, so f(x) = x² is
   * representable without inventing a general expression parser. */
  stage2: z
    .object({
      a: z.number().int(),
      b: z.number().int(),
      square: z.boolean().default(false)
    })
    .optional(),
  square: z.boolean().default(false),
  join: z.enum(["compose", "add", "multiply"]).optional(),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** One stage of a function machine: a·(x or x²) + b. */
export function fmStage(x: number, a: number, b: number, square: boolean): number {
  const t = square ? x * x : x;
  return a * t + b;
}

/** What a two-machine wiring produces from one input. `compose` is stage1 THEN stage2 — the order
 * f(g(x)) reads right-to-left, which is exactly the confusion these lessons address, so the
 * grader, the renderer and the integrity gate all read it from here and cannot disagree about it. */
export function fmOutput(
  x: number,
  a: number,
  b: number,
  square: boolean,
  stage2: { a: number; b: number; square: boolean } | undefined,
  join: "compose" | "add" | "multiply" | undefined
): number {
  const first = fmStage(x, a, b, square);
  if (!stage2 || !join) return first;
  if (join === "compose") return fmStage(first, stage2.a, stage2.b, stage2.square);
  const second = fmStage(x, stage2.a, stage2.b, stage2.square);
  return join === "add" ? first + second : first * second;
}

/** probabilityArea — shade cells of a grid to represent a probability; the fraction and decimal
 * update live. Correct on any shading equal in value to the target. Reuses gridScales. */
export const ProbabilityAreaSpec = z.object({
  type: z.literal("probabilityArea"),
  prompt: z.string().min(1),
  rows: z.number().int().positive(),
  cols: z.number().int().positive(),
  targetNum: z.number().int().nonnegative(),
  targetDen: z.number().int().positive(),
  start: z.number().int().nonnegative().default(0),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** hundredthsGrid — the Grade-4 decimal grid (4.NF.C.5/6/7). One unit square split into ten
 * columns (mode "tenths") or one hundred cells (mode "hundredths"); the learner shades cells and a
 * live readout shows the SAME quantity three ways (count, fraction over 10/100, decimal), which is
 * the whole lesson. Cells fill contiguously column-major, so the state is a single count and the
 * tenths↔hundredths link is visible as whole columns. `prefilled` cells are locked (add-on tasks:
 * 0.2 + 0.05 starts with two columns shaded). Graded on the exact total count; `commonCounts`
 * carries the family's misconceptions (3 for 0.3 on a hundredths grid — tenths read as hundredths —
 * and 70 for 0.07 — the same confusion reversed). */
export const HundredthsGridSpec = z.object({
  type: z.literal("hundredthsGrid"),
  prompt: z.string().min(1),
  mode: z.enum(["tenths", "hundredths"]),
  /** Target TOTAL shaded cell count, prefilled included. tenths: 0..10; hundredths: 0..100. */
  target: z.number().int().nonnegative(),
  /** Cells already shaded and locked when the task starts (add-on tasks). */
  prefilled: z.number().int().nonnegative().default(0),
  /** Live count/fraction/decimal readout under the grid. Off only when the readout would print the
   * answer the prompt asks the learner to produce. */
  showDecimal: z.boolean().default(true),
  commonCounts: z.array(z.object({ count: z.number().int().nonnegative(), feedback: z.string().min(1) })).default([]),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** transformExplore — translate (dx, dy) and optionally reflect a shape to land it on a target
 * image. Correct when the transformed vertices match the target. Reuses gridScales. */
export const TransformExploreSpec = z.object({
  type: z.literal("transformExplore"),
  prompt: z.string().min(1),
  shape: z.array(z.tuple([z.number(), z.number()])).min(3),
  target: z.array(z.tuple([z.number(), z.number()])).min(3),
  gridMin: z.number().int().default(-6),
  gridMax: z.number().int().default(6),
  dxMin: z.number().int().default(-6),
  dxMax: z.number().int().default(6),
  dyMin: z.number().int().default(-6),
  dyMax: z.number().int().default(6),
  allowReflect: z.boolean().default(true),
  successFeedback: z.string().min(1),
  offsetFeedback: z.string().min(1),
  reflectFeedback: z.string().min(1)
});

/** angleMeasure — open two rays to a target angle on a protractor (0–180°). */
export const AngleMeasureSpec = z.object({
  type: z.literal("angleMeasure"),
  prompt: z.string().min(1),
  targetAngle: z.number().int().min(0).max(180),
  angleStart: z.number().int().min(0).max(180).default(0),
  angleStep: z.number().int().positive().default(5),
  /** Optional straight-line equation context. The movable angle is x; the neighbouring angle is
   * multiplier·x, so the model exposes (1 + multiplier)x = total without leaking x. */
  linearPair: z.object({ multiplier: z.number().int().min(1).max(6), total: z.number().int().min(90).max(360) }).optional(),
  commonAngles: z.array(z.object({ angle: z.number().int().min(0).max(180), feedback: z.string().min(1) })).optional(),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** dilationExplore — scale a shape from a center by factor k; preimage and image shown together.
 *
 * `showRatios` (length | area | volume | segments | altitude) is NOT a uniform list of additive
 * readouts, and DOCUMENTING that is the point of this note. length/area/volume add scale readouts
 * and combine freely. But `segments` and `altitude` RE-STAGE the widget into different figures
 * entirely — segments becomes a side-splitter exercise (needs exactly 3 vertices and a cutter
 * fraction strictly inside (0,1)); altitude becomes a right-triangle exercise with the same
 * interior constraint. Neither can combine with the scale readouts, or with each other. Added in
 * S203W after S203V wrote `["segments", "length"]` expecting an additive display and got a
 * validation cascade from a completely different exercise's requirements. */
/** rotationLab — S204C. The rotation engine the corpus has been missing since S203S.
 *
 * WHY IT EXISTS. transformExplore models translation and reflection; dilationExplore scales from a
 * centre. NOTHING turned anything. That gap refused gf-03-03 (Rotations as Functions) and gf-04-03
 * (Rotational Symmetry) outright — two Tier D lessons whose entire content is rotation — and forced
 * every rotation question in the corpus to be answered from a memorised coordinate rule rather than
 * from a turn the learner performs.
 *
 * `mode` selects which of the two rotation facts is being made operable — they need genuinely
 * different stages, which is why one engine carries both rather than two near-duplicates existing:
 *   coordinateRule — a single point rides around a centre as the learner turns it. The image's
 *                    coordinates update live, so (x, y) -> (-y, x) at 90° stops being a rule to
 *                    recall and becomes the reading at the top of the dial. Composition falls out
 *                    for free: turn 90° twice and the readout IS the 180° rule.
 *   symmetryOrder  — a whole polygon turns, and the learner hunts the SMALLEST positive angle that
 *                    lands it back on itself. Order and angle are the same fact read two ways
 *                    (order × angle = 360), so the engine grades the angle and names the order.
 *
 * The centre is authored, never dragged: a rotation about an arbitrary moving point is a different
 * (and much harder) idea than the coordinate rules these lessons teach, and letting the centre move
 * would quietly change what is being learned. */
export const RotationLabSpec = z.object({
  type: z.literal("rotationLab"),
  prompt: z.string().min(1),
  /** coordinateRule: one point turns, coordinates read live. symmetryOrder: a polygon hunts its
   * own smallest self-mapping turn. */
  mode: z.enum(["coordinateRule", "symmetryOrder"]),
  /** The turn to land on, in degrees counterclockwise. Restricted to the quarter-turn lattice in
   * coordinateRule (the only turns with integer coordinate rules) and to any divisor of 360 in
   * symmetryOrder. */
  targetAngle: z.number().int().min(1).max(359),
  angleStart: z.number().int().min(0).max(359).default(0),
  angleStep: z.number().int().positive().max(180).default(15),
  /** coordinateRule: the point being turned. */
  point: z.tuple([z.number().int(), z.number().int()]).optional(),
  /** symmetryOrder: the polygon being turned, as vertices. */
  shape: z.array(z.tuple([z.number().int(), z.number().int()])).min(3).max(12).optional(),
  centre: z.tuple([z.number().int(), z.number().int()]).default([0, 0]),
  gridMax: z.number().int().min(4).max(12).default(8),
  /** Misconception landings: a turn the learner is likely to stop at, and why it is wrong. */
  commonTurns: z.array(z.object({ angle: z.number().int(), feedback: z.string().min(1) })).default([]),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** The image of a point under a counterclockwise rotation about a centre. Exact for the quarter
 * turns; every other angle is irrational in general, which is precisely why coordinateRule is
 * restricted to the 90° lattice. */
export function rotationLabImage(
  point: [number, number],
  centre: [number, number],
  angleDeg: number
): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = point[0] - centre[0];
  const dy = point[1] - centre[1];
  const cos = Math.round(Math.cos(rad) * 1e9) / 1e9;
  const sin = Math.round(Math.sin(rad) * 1e9) / 1e9;
  const x = centre[0] + dx * cos - dy * sin;
  const y = centre[1] + dx * sin + dy * cos;
  return [Math.round(x * 1e6) / 1e6, Math.round(y * 1e6) / 1e6];
}

/** Does turning `shape` by `angleDeg` about `centre` land it exactly on itself (as a set)? */
export function rotationLabMapsOntoSelf(
  shape: Array<[number, number]>,
  centre: [number, number],
  angleDeg: number
): boolean {
  const key = (p: [number, number]) => `${p[0].toFixed(4)}:${p[1].toFixed(4)}`;
  const original = new Set(shape.map((p) => key([p[0], p[1]])));
  return shape.every((p) => original.has(key(rotationLabImage([p[0], p[1]], centre, angleDeg))));
}
export const DilationExploreSpec = z.object({
  type: z.literal("dilationExplore"),
  prompt: z.string().min(1),
  shape: z.array(z.tuple([z.number(), z.number()])).min(3),
  center: z.tuple([z.number(), z.number()]).default([0, 0]),
  targetK: z.number(),
  kMin: z.number().default(0.5),
  kMax: z.number().default(3),
  kStep: z.number().positive().default(0.5),
  kStart: z.number().default(1),
  gridMin: z.number().int().default(0),
  gridMax: z.number().int().default(7),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1),
  /** S116 (b) — live ratio readouts beside the shape.
   *  length/area/volume: perimeter scales by k, area by k^2, volume by k^3 — the three
   *    exponents as three numbers moving at three speeds under one drag.
   *  segments: switches the stage to a triangle cut by a line PARALLEL to its base, with the
   *    drag as the cutter's position; AD/DB and AE/EC are both live and never disagree
   *    (the side-splitter theorem), and the midpoint cut is the midsegment special case.
   *  altitude (S120): switches the stage to a RIGHT triangle with the altitude dropped to its
   *    hypotenuse, with the drag as the foot's position along it. The apex rides the semicircle
   *    over the hypotenuse, so the right angle survives every drag (Thales), and the three
   *    sub-triangles stay similar to each other and to the whole. The readouts are the geometric
   *    means: h² = p·q for the altitude and leg² = c·(its own segment) for each leg. This is a
   *    different figure from `segments` — a perpendicular from the right angle, not a parallel
   *    cut — which is why it is its own stage rather than a parameter of that one. */
  showRatios: z.array(z.enum(["length", "area", "volume", "segments", "altitude"])).min(1).max(5).optional()
});

/** barBuilder — set each bar's height to match a target dataset (a data-plot builder). */
export const BarBuilderSpec = z.object({
  type: z.literal("barBuilder"),
  prompt: z.string().min(1),
  categories: z.array(z.string().min(1)).min(2),
  target: z.array(z.number().int().nonnegative()).min(2),
  maxVal: z.number().int().positive(),
  step: z.number().int().positive().default(1),
  /** Histogram mode: bars sit flush (no gaps) because the categories are contiguous numeric bins
   * rather than separate categories. Same mechanics, correct visual grammar. */
  histogram: z.boolean().default(false),
  /** S185: how the counts are DRAWN. "bar" is the classic vertical bar (sliders); "tally" renders
   * each category as tally marks in five-groups with the fifth crossing; "pictograph" renders icon
   * rows. tally/pictograph use per-category add/remove steppers — the authentic mark-making action
   * for 1.MD.C.4, whose verb is "organize/represent", i.e. DRAW. Same state, same grading. */
  display: z.enum(["bar", "tally", "pictograph"]).default("bar"),
  /** Icon glyph for pictograph display; ignored otherwise. */
  icon: z.string().min(1).default("●"),
  /** Optional axis title (e.g. "minutes read") — useful when categories are bin ranges. */
  axisLabel: z.string().optional(),
  successFeedback: z.string().min(1),
  partialFeedback: z.string().min(1)
});

/** graphRead — the READ side of a graph, for lessons whose whole skill is getting a value OFF a
 * drawn display. Two modes share one action: a quantity is drawn (icons in a row, or a bar against
 * gridlines) and the learner moves a marker along a value scale until it names that quantity.
 * Building the graph is a different skill and a different engine (barBuilder); here the graph is
 * GIVEN and reading it is the task — which is why these lessons must draw it, and until S125 they
 * described it in a sentence and asked a 7-year-old to type a number. */
export const GraphReadSpec = z.object({
  type: z.literal("graphRead"),
  prompt: z.string().min(1),
  mode: z.enum(["picture", "bar", "tally"]),
  /** How many icons are drawn (picture mode) or how many gridlines the bar reaches (bar mode). */
  drawn: z.number().int().nonnegative(),
  /** Value of one icon / one gridline. The read value is drawn × unitValue. */
  unitValue: z.number().int().positive().default(1),
  /** Row label ("Monday") and what one unit counts ("vote", "cookie") — stored as BOTH forms,
   * never derived, per the standing English-forms rule. */
  categoryLabel: z.string().min(1),
  unitNoun: z.string().min(1),
  unitNounPlural: z.string().min(1),
  /** Upper bound of the marker scale. Must exceed the answer so the correct value is reachable
   * without sitting at the end of the track. */
  scaleMax: z.number().int().positive(),
  /** Icon glyph for picture mode; ignored for bar mode. */
  icon: z.string().min(1).default("●"),
  commonResults: z
    .array(z.object({ value: z.number().int(), feedback: z.string().min(1) }))
    .default([]),
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

/** The value a correct read yields — the independent derivation the grader and the gate share. */
export function graphReadAnswer(spec: { drawn: number; unitValue: number }): number {
  return spec.drawn * spec.unitValue;
}

/** dotPlot — stack dots above number-line values to match a target frequency distribution. */
export const DotPlotSpec = z.object({
  type: z.literal("dotPlot"),
  prompt: z.string().min(1),
  values: z.array(z.number().int()).min(2),
  target: z.array(z.number().int().nonnegative()).min(2),
  maxPerValue: z.number().int().positive().default(6),
  /** S122 — fractional axis. When present every entry of `values` is a NUMERATOR of
   * value/denominator and the axis labels render the true reduced fractions (2/4 → 1/2,
   * 4/4 → 1); the arithmetic underneath stays in exact integer numerator units, so nothing
   * is rounded and no float enters grading — the same rule numberLineHop's rational hops
   * follow (S119). */
  denominator: z.number().int().min(2).optional(),
  /** S122 — READ mode. When present the plot is an AUTHORED dataset (fixed X's, one count per
   * value) and the learner's action is marking dots to count a stack: `askIndex` names the
   * column the prompt asks about. Grading derives its misconception diagnoses from the marked
   * state (wrong stack counted, whole plot counted, stack half-counted) using the drawn
   * numbers, unitChain-style — no authored wrong-path array to go stale. Build mode
   * (given absent) is unchanged. */
  given: z.array(z.number().int().nonnegative()).optional(),
  askIndex: z.number().int().nonnegative().optional(),
  successFeedback: z.string().min(1),
  partialFeedback: z.string().min(1)
});

/** Reduced fraction label for a dot-plot numerator under `denominator` — the ONE formatter the
 * renderer, the grader's feedback, describeState and correctAnswerText all share, so the label
 * in a diagnosis can never disagree with the axis. */
/** The vulgar-fraction glyphs the authored prose actually writes ("2½" in md-03-04). STORED,
 * never derived — a proper fraction with no glyph falls back to the spaced form ("2 1/3"). */
const VULGAR = { "1/2": "½", "1/4": "¼", "3/4": "¾" } as const;

export function dotPlotLabel(numerator: number, denominator?: number, style?: "mixed"): string {
  if (!denominator) return String(numerator);
  let a = Math.abs(numerator), b = denominator;
  while (b) [a, b] = [b, a % b];
  const g = a || 1;
  const n = numerator / g, d = denominator / g;
  if (d === 1) return String(n);
  if (style !== "mixed") return `${n}/${d}`;
  // Mixed mode (S238 wave 9, user-ruled): "5/2" becomes "2½" — the form md-03-04's frozen
  // prompts write. Whole part first, remainder as a stored vulgar glyph where one exists.
  const whole = Math.floor(n / d), rem = n - whole * d;
  const frac = VULGAR[`${rem}/${d}` as keyof typeof VULGAR] ?? `${rem}/${d}`;
  if (whole === 0) return frac;
  return frac.length === 1 ? `${whole}${frac}` : `${whole} ${frac}`;
}

/** boxPlot — set the five-number summary (min, Q1, median, Q3, max) to draw a box-and-whisker. */
export const BoxPlotSpec = z.object({
  type: z.literal("boxPlot"),
  prompt: z.string().min(1),
  axisMin: z.number().int(),
  axisMax: z.number().int(),
  targetMin: z.number().int(),
  targetQ1: z.number().int(),
  targetMed: z.number().int(),
  targetQ3: z.number().int(),
  targetMax: z.number().int(),
  startMin: z.number().int(),
  startQ1: z.number().int(),
  startMed: z.number().int(),
  startQ3: z.number().int(),
  startMax: z.number().int(),
  successFeedback: z.string().min(1),
  orderFeedback: z.string().min(1),
  valueFeedback: z.string().min(1)
});


/** distributionCompareLab — compare two population distributions using one shared unit of
 * variability. Measure mode turns the raw mean gap into a count of variability-widths; judge mode
 * turns the same geometry into a conclusion about overlap. Both modes draw the distributions, so
 * "three units apart" and "little overlap" are the same visible relationship rather than two
 * disconnected facts. */
export const DistributionCompareLabSpec = z.object({
  type: z.literal("distributionCompareLab"),
  prompt: z.string().min(1),
  mode: z.enum(["measure", "judge"]),
  /** Measure mode: the displayed means and one variability-width. */
  meanA: z.number().optional(),
  meanB: z.number().optional(),
  variability: z.number().positive().optional(),
  /** The authored accepted answer may intentionally round a tiny derived gap to 0. */
  answer: z.number().optional(),
  tolerance: z.number().nonnegative().default(0.01),
  measureChoices: z.array(z.object({
    value: z.number(),
    label: z.string().min(1).optional(),
    feedback: z.string().min(1)
  })).default([]),
  fallbackFeedback: z.string().min(1).optional(),
  successFeedback: z.string().min(1),
  /** Judge mode: the standardized gap alone determines the drawn overlap. */
  gapUnits: z.number().nonnegative().optional(),
  judgeOptions: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    correct: z.boolean().optional(),
    feedback: z.string().min(1)
  })).default([]),
  groupALabel: z.string().min(1).default("Group A"),
  groupBLabel: z.string().min(1).default("Group B")
});

/** The exact standardized mean gap used by the renderer, grader and integrity gate. */
export function distributionGapUnits(spec: {
  mode: "measure" | "judge";
  meanA?: number;
  meanB?: number;
  variability?: number;
  gapUnits?: number;
}): number {
  if (spec.mode === "measure") {
    if (spec.meanA === undefined || spec.meanB === undefined || spec.variability === undefined) return NaN;
    return Math.abs(spec.meanA - spec.meanB) / spec.variability;
  }
  return spec.gapUnits ?? NaN;
}

/** A deterministic visual-overlap proxy for two equal-spread bell shapes. It is deliberately a
 * readout, not a grading threshold: the authored conclusion remains the assessed claim. */
export function distributionOverlapFraction(gapUnits: number): number {
  return Math.exp(-(gapUnits * gapUnits) / 8);
}

/** areaModel — set width and height; a rectangle of unit squares shows the product (area). Any
 * factor pair that reaches the target area is correct. */
export const AreaModelSpec = z.object({
  type: z.literal("areaModel"),
  prompt: z.string().min(1),
  targetArea: z.number().int().positive(),
  wMax: z.number().int().positive(),
  hMax: z.number().int().positive(),
  wStart: z.number().int().positive().default(1),
  hStart: z.number().int().positive().default(1),
  /** Square mode: one control drives BOTH sides, so the rectangle is always a square. Needed for
   * "a square has area 36 — what is its side?": ungated, areaModel accepts 4×9 and the learner
   * never finds the side the lesson asks for. In square mode the target is reachable only at the
   * correct side length, so the engine demands the authored answer — and the side-vs-area
   * relationship (double the side, quadruple the area) becomes the visible invariant. */
  square: z.boolean().default(false),
  /** S116: pins WHICH arrangement counts, not just the area. Ungated, areaModel accepts every
   * factor pair of `targetArea` — for "rewrite 8 + 12 as (GCF) × (sum)" that means 1×20, 2×10 and
   * 4×5 all pass, and only one of them pulls out the GREATEST common factor. With this set, the
   * area must match AND the sides must be the named pair (either orientation — a rotated rectangle
   * is the same factoring). Same failure this schema's `square` flag was added to close, one step
   * further: there, any 4×9 satisfied a question about a square's side. */
  requireFactors: z.object({ w: z.number().int().positive(), h: z.number().int().positive() }).optional(),
  /** Fixed-grid counting mode. The rows and columns are given; the learner marks how many unit
   * squares have been counted. This preserves a read-the-grid task instead of changing it into
   * free factor construction. `wStart` is the given column count and `hStart` the given row count. */
  countGrid: z.boolean().default(false),
  /** Exact misconception landings for fixed-grid counting (for example rows + columns, or only
   * one row). Values must be reachable by the counting controls and may never equal the target. */
  commonCounts: z.array(z.object({ count: z.number().int().nonnegative(), feedback: z.string().min(1) })).default([]),
  /** Shown when the area is right but the arrangement is not the required one. Required whenever
   * `requireFactors` is set — without it a learner who hits the area with the wrong factors would
   * fall through to lowFeedback/highFeedback, which both describe being off on AREA and would be
   * simply untrue here. */
  factorFeedback: z.string().min(1).optional(),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** placeValue — set hundreds / tens / ones with base-ten blocks to build a target number. Any
 * combination equal in value is correct (10 ones = 1 ten). */
export const PlaceValueSpec = z.object({
  type: z.literal("placeValue"),
  prompt: z.string().min(1),
  target: z.number().int().nonnegative(),
  maxHundreds: z.number().int().nonnegative().default(4),
  maxTens: z.number().int().nonnegative().default(12),
  maxOnes: z.number().int().nonnegative().default(15),
  hStart: z.number().int().nonnegative().default(0),
  tStart: z.number().int().nonnegative().default(0),
  oStart: z.number().int().nonnegative().default(0),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** clockSet — set the hour and minute hands of an analog clock to a target time. */
export const ClockSetSpec = z.object({
  type: z.literal("clockSet"),
  prompt: z.string().min(1),
  targetHour: z.number().int().min(1).max(12),
  targetMinute: z.number().int().min(0).max(59),
  minuteStep: z.number().int().positive().default(5),
  successFeedback: z.string().min(1),
  hourFeedback: z.string().min(1),
  minuteFeedback: z.string().min(1)
});

/** inversePipeline — build f⁻¹ by reversing a chain of operations and flipping each one.
 *
 * The forward function is shown as an ordered chain of operation cards (x → ×3 → +4 → ÷2). The
 * learner assembles the inverse into a second track from a tray of candidate cards. It is the only
 * engine in the registry where ORDER and OPERATION are graded separately, which is the point: the
 * dominant error in inverse work is undoing the steps in the order they were applied, and a typed
 * answer or a multiple choice cannot tell that apart from any other wrong answer.
 *
 * Grading is exact and deterministic — the built track must equal the reversed, flipped chain. Two
 * wrong states are diagnosed by name because they are the two real misconceptions:
 *   forwardOrderFeedback  right operations, applied in the ORIGINAL order (never reversed)
 *   unflippedFeedback     reversed correctly, but one or more operations not inverted
 */
export const InverseOp = z.object({
  /** Stable id, so a tray card and a placed card are the same object. */
  id: z.string().min(1),
  op: z.enum(["add", "sub", "mul", "div"]),
  /** The operand. Division by zero is rejected by the integrity check. */
  n: z.number().int(),
});

export const InversePipelineSpec = z.object({
  type: z.literal("inversePipeline"),
  prompt: z.string().min(1),
  /** The forward chain, in the order it is applied to x. 2-4 steps. */
  forward: z.array(InverseOp).min(2).max(4),
  /** Cards offered to build the inverse — the correct set plus decoys. Every card the learner can
   * place must be here, or a reachable state would have no diagnosis. */
  tray: z.array(InverseOp).min(2),
  /** Ids from `tray`, in the order that constitutes f⁻¹. */
  answer: z.array(z.string().min(1)).min(2).max(4),
  /** Optional worked value: shows x travelling the chain, so the inverse is checkable by arithmetic
   * and not only by rule. Omit for a pure structural task. */
  sampleInput: z.number().int().optional(),
  successFeedback: z.string().min(1),
  /** Right operations, original order — the headline misconception. */
  forwardOrderFeedback: z.string().min(1),
  /** Reversed, but an operation was left un-inverted. */
  unflippedFeedback: z.string().min(1),
  /** Anything else reachable: wrong cards, short track. */
  missFeedback: z.string().min(1),
});

/** solveBalance — SOLVE an equation on a pan balance by acting on the tiles themselves.
 *
 * a·x + b sits on the left pan as x-tiles and unit tiles; c sits on the right as unit tiles. The
 * learner taps unit tiles away and splits the pans into equal groups until one x-tile stands alone.
 * Nothing stops them taking tiles from only one side — that is the point. The beam is weighed at the
 * TRUE x after every move, so removing from one side only tips it immediately: the misconception is
 * not an error message, it is a picture of the equality breaking.
 *
 * Distinct from balanceScale (find x by sliding a value until the beam levels): here x is never
 * entered — it is what remains.
 *
 * Wrong states, in the order the evaluator checks them:
 *   unbalancedFeedback   the pans differ at the true x — something was done to one side only
 *   notIsolatedFeedback  still balanced, but x is not yet alone — a legal position, just unfinished
 *   missFeedback         anything else (every x-tile removed, an impossible state)
 */
export const SolveBalanceSpec = z.object({
  type: z.literal("solveBalance"),
  prompt: z.string().min(1),
  /** Left pan starts as a·x + b, right pan as c. The tile model stays honest because
   * (c − b) / a is a positive integer — splitting the pans is always exact. Signed ranges admit
   * negative coefficients and negative constants (S114): a negative count renders as negative
   * tiles, and integer arithmetic on the pan totals IS zero-pair cancellation. */
  a: z.number().int().min(-6).max(6),
  b: z.number().int().min(-24).max(24),
  c: z.number().int(),
  /** (f) Bracketed groups — the left pan starts as `count` copies of (x·X + unit) that must be
   * distributed before their tiles can be moved. `count` is the SIGNED multiplier: −3(x + 2) is
   * three copies of −(x + 2), so the sign travels with every chip. `count·x` must equal a and
   * `count·unit` must equal b, so the group form and the flat form are the same pan weighed twice. */
  groups: z
    .object({
      count: z.number().int().min(-6).max(6),
      x: z.number().int().min(1).max(3),
      unit: z.number().int().min(-6).max(6),
    })
    .optional(),
  /** (h) The relation the pans claim. "eq" is the original engine: the beam must stay level.
   * For the four inequalities the beam is WEIGHED AT A WITNESS from the solution set, so it tilts
   * on purpose and the tilt is the claim; multiplying both pans by −1 reverses it. */
  relation: z.enum(["eq", "lt", "gt", "le", "ge"]).optional(),
  successFeedback: z.string().min(1),
  unbalancedFeedback: z.string().min(1),
  notIsolatedFeedback: z.string().min(1),
  missFeedback: z.string().min(1),
  /** Reachable only with `groups`: brackets still un-distributed, or the multiplier was given to
   * the x and not to the constant. */
  unexpandedFeedback: z.string().min(1).optional(),
  partialDistributeFeedback: z.string().min(1).optional(),
  /** Reachable only in an inequality: both pans were negated and the comparator was left alone,
   * so the symbol on screen now contradicts the beam under it. */
  notFlippedFeedback: z.string().min(1).optional(),
});
// NOTE: (c − b) / a must be a positive integer, so x is whole and splitting is exact. That
// invariant lives in widgetIntegrityErrors, not in a .refine here: a ZodEffects cannot be a member
// of the discriminated widget union.

export type SolveBalanceRel = "eq" | "lt" | "gt" | "le" | "ge";

/** Does the left weight stand in the claimed relation to the right? Single source of truth for the
 * pan renderer and the grader — they must never disagree about what the beam is saying. */
export function solveBalanceHolds(L: number, R: number, rel: SolveBalanceRel): boolean {
  return rel === "eq" ? L === R : rel === "lt" ? L < R : rel === "gt" ? L > R : rel === "le" ? L <= R : L >= R;
}

/** The x the pans are weighed at. For an equation that is the solution itself; for an inequality it
 * is a WITNESS drawn from the solution set, so a true claim tilts the beam and a broken one tilts it
 * back. A strict witness is preferred over the boundary so ≤ and ≥ still produce a visible tilt. */
export function solveBalanceWitness(a: number, b: number, c: number, rel: SolveBalanceRel): number {
  const x0 = (c - b) / a;
  if (rel === "eq") return x0;
  for (const w of [x0 + 1, x0 - 1, x0]) if (solveBalanceHolds(a * w + b, c, rel)) return w;
  return x0;
}

/** RELEASE BLOCKER FIX (S119) — solution-set equivalence for solveBalance.
 *
 * The engine used to grade an inequality by weighing the beam at ONE witness value. That is not a
 * proof of anything: `2x + 3 > 11` has the solution set `x > 4` and a witness of 5, and a learner
 * who lands on `x > 3` is weighed as 5 > 3, which holds — so a wrong solution set was marked
 * correct. The same hole passed `x ≥ 4` for `x > 4`, and passed any one-sided operation whose
 * damage happened to miss the single sampled point.
 *
 * A claim about x is only equivalent to another if it admits exactly the same x. So a claim is now
 * reduced to a canonical solution set and compared as a set. Everything is exact integer
 * arithmetic — the boundary is a reduced fraction, never a float — so no comparison can drift.
 */
export type SolveBalanceSet =
  | { kind: "half"; cmp: "lt" | "gt" | "le" | "ge"; num: number; den: number }
  | { kind: "point"; num: number; den: number }
  | { kind: "all" }
  | { kind: "none" };

const FLIP: Record<SolveBalanceRel, SolveBalanceRel> = { eq: "eq", lt: "gt", gt: "lt", le: "ge", ge: "le" };

/** The set of x satisfying `coefX·x + units REL rhs`, canonically.
 *
 * Dividing by a negative coefficient reverses the comparator — that reversal is applied HERE, once,
 * so every caller inherits it and no caller can forget it. A zero coefficient leaves a claim with
 * no x in it at all, which is either always true or never true; both are returned honestly rather
 * than being treated as a boundary. */
export function solveBalanceSet(
  coefX: number,
  units: number,
  rhs: number,
  rel: SolveBalanceRel
): SolveBalanceSet {
  if (coefX === 0) {
    const holds = solveBalanceHolds(units, rhs, rel);
    return holds ? { kind: "all" } : { kind: "none" };
  }
  // (rhs − units) / coefX as a reduced fraction with a positive denominator.
  let num = rhs - units;
  let den = coefX;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = (a: number, b: number): number => (b === 0 ? a : g(b, a % b));
  const d = g(Math.abs(num), den) || 1;
  num /= d;
  den /= d;
  // The comparator turns around exactly when the coefficient divided out was negative.
  const cmp = coefX < 0 ? FLIP[rel] : rel;
  if (cmp === "eq") return { kind: "point", num, den };
  return { kind: "half", cmp, num, den };
}

/** Do two claims admit exactly the same x? Compared structurally on the canonical form, so a
 * different boundary, a different strictness, or a different direction all register as different
 * sets — which is the whole point. */
export function solveBalanceSetsEqual(p: SolveBalanceSet, q: SolveBalanceSet): boolean {
  if (p.kind !== q.kind) return false;
  if (p.kind === "all" || p.kind === "none") return true;
  if (p.kind === "point" && q.kind === "point") return p.num === q.num && p.den === q.den;
  if (p.kind === "half" && q.kind === "half")
    return p.cmp === q.cmp && p.num === q.num && p.den === q.den;
  return false;
}

/** balanceScale — set x so a pan balance holds: a·x + b on the left equals c on the right. */
export const BalanceScaleSpec = z.object({
  type: z.literal("balanceScale"),
  prompt: z.string().min(1),
  a: z.number().int(),
  b: z.number().int(),
  c: z.number().int(),
  xMin: z.number().int(),
  xMax: z.number().int(),
  xStart: z.number().int().default(0),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** doubleNumberLine — two aligned number lines (two quantities in a fixed ratio); set the tick
 * scale so the pair lines up, then read off an equivalent value. */
export const DoubleNumberLineSpec = z.object({
  type: z.literal("doubleNumberLine"),
  prompt: z.string().min(1),
  topLabel: z.string().min(1),
  bottomLabel: z.string().min(1),
  /** The unit ratio: topPerStep : bottomPerStep at each tick. */
  topPerStep: z.number().positive(),
  bottomPerStep: z.number().positive(),
  steps: z.number().int().min(2).max(8).default(5),
  /** Learner sets the top value at the marked tick; correct when it matches the ratio. */
  askAtStep: z.number().int().positive(),
  targetTop: z.number(),
  topMax: z.number().positive(),
  topStep: z.number().positive().default(1),
  /** S119 — the FRACTION lattice. Without it the renderer's formatter prints a non-integer as a
   * rounded decimal, so a quarter-hour tick reads "0.25". In a lesson titled "Dividing by a
   * Fraction" that quietly replaces the subject with its decimal shadow.
   *
   * With `denom` set, every number on the spec is a COUNT OF 1/denom UNITS and both scales render
   * true fractions through the same `hopLabel` used by numberLineHop's rational lattice — so the
   * numbers on screen are the question's numbers while the arithmetic underneath stays integer.
   * Additive and optional: an existing spec parses with no key injected and renders unchanged. */
  denom: z.number().int().min(2).max(24).optional(),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** scatterFit — a fixed scatter of points; drag slope and intercept to fit a line. Scored by
 * closeness of fit (sum of squared residuals) against a tolerance. */
export const ScatterFitSpec = z.object({
  type: z.literal("scatterFit"),
  prompt: z.string().min(1),
  points: z.array(z.tuple([z.number(), z.number()])).min(4),
  xMin: z.number().int(),
  xMax: z.number().int(),
  yMin: z.number().int(),
  yMax: z.number().int(),
  mMin: z.number().default(-3),
  mMax: z.number().default(3),
  mStep: z.number().positive().default(0.5),
  bMin: z.number().default(-5),
  bMax: z.number().default(15),
  bStep: z.number().positive().default(1),
  mStart: z.number().default(0),
  bStart: z.number().default(0),
  /** Max mean squared residual that still counts as a good fit. */
  tolerance: z.number().positive(),
  successFeedback: z.string().min(1),
  slopeFeedback: z.string().min(1),
  offsetFeedback: z.string().min(1)
});

/** fractionOfSet — a set of objects; select the fraction of them named by the prompt. Any correct
 * count wins (the fraction of the SET, not specific objects). */
export const FractionOfSetSpec = z.object({
  type: z.literal("fractionOfSet"),
  prompt: z.string().min(1),
  setSize: z.number().int().positive(),
  num: z.number().int().positive(),
  den: z.number().int().positive(),
  groupsHint: z.boolean().default(true),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** percentBar — a bar of 100 parts; drag to a percent and see the matching amount of a whole. */
export const PercentBarSpec = z.object({
  type: z.literal("percentBar"),
  prompt: z.string().min(1),
  whole: z.number().positive(),
  targetPercent: z.number().int().min(0).max(100),
  percentStep: z.number().int().positive().default(5),
  startPercent: z.number().int().min(0).max(100).default(0),
  unit: z.string().optional(),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** percentChangeLab — keep the original amount, the derived percent change, the add/subtract
 * direction, and the learner's final-price claim visible at the same time. This is deliberately
 * separate from percentBar: in markup/markdown tasks the percent is GIVEN, so dragging a percent
 * slider would rehearse the wrong action. */
export const PercentChangeLabSpec = z.object({
  type: z.literal("percentChangeLab"),
  prompt: z.string().min(1),
  base: z.number().positive(),
  percent: z.number().positive().max(100),
  direction: z.enum(["markup", "markdown"]),
  currency: z.string().min(1),
  choices: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    value: z.number().nonnegative(),
    feedback: z.string().min(1)
  })).min(3),
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export function percentChangeAmount(spec: { base: number; percent: number }): number {
  return Math.round(spec.base * spec.percent) / 100;
}

export function percentChangeTarget(spec: { base: number; percent: number; direction: "markup" | "markdown" }): number {
  const raw = spec.direction === "markup" ? spec.base + percentChangeAmount(spec) : spec.base - percentChangeAmount(spec);
  return Math.round(raw * 100) / 100;
}

export function percentChangeChoiceCorrect(
  spec: { base: number; percent: number; direction: "markup" | "markdown" },
  choice: { value: number }
): boolean {
  return Math.abs(choice.value - percentChangeTarget(spec)) < 1e-9;
}



/** equationOutcomeLab — a residue classifier and a balance-preserving transformation workbench.
 * `classify` retains the Session-141 one/none/infinite surface. `transform` applies authored
 * operations to BOTH sides of one normalized linear relation. The operation sequence, every
 * intermediate equation, the solution boundary, relation flip, grading, feedback, narration,
 * and rendering all derive from the same coefficient state. */
export type EquationRelation = "eq" | "lt" | "le" | "gt" | "ge";
export type EquationTransformOperation = {
  id:string; label:string; kind:"normalize"|"addVariable"|"addConstant"|"scale"; value?:number; feedback?:string; result?:EquationTransformState;
};
export type EquationTransformState = {
  leftCoeff:number; leftConstant:number; rightCoeff:number; rightConstant:number; relation:EquationRelation;
};
const equationClean=(value:number):number=>{const rounded=Math.round(value*1e12)/1e12;return Object.is(rounded,-0)?0:rounded};
const equationFlip=(relation:EquationRelation):EquationRelation=>relation==="lt"?"gt":relation==="le"?"ge":relation==="gt"?"lt":relation==="ge"?"le":"eq";
export function equationTransformApply(state:EquationTransformState,operation:EquationTransformOperation):EquationTransformState{
  const next={...state};
  if(operation.kind==="normalize"){
    if(!operation.result)return next;
    const canonical=(candidate:EquationTransformState)=>{const coeff=equationClean(candidate.leftCoeff-candidate.rightCoeff),constant=equationClean(candidate.rightConstant-candidate.leftConstant);if(Math.abs(coeff)<1e-12)throw new Error("equationOutcomeLab normalized rewrite must retain one finite boundary");return{answer:equationClean(constant/coeff),relation:coeff<0?equationFlip(candidate.relation):candidate.relation}};
    const before=canonical(state),after=canonical(operation.result);if(Math.abs(before.answer-after.answer)>1e-9||before.relation!==after.relation)throw new Error(`equationOutcomeLab normalize operation ${operation.id} changes the solution set`);
    return{...operation.result};
  }
  const value=operation.value;
  if(typeof value!=="number"||!Number.isFinite(value))throw new Error(`equationOutcomeLab operation ${operation.id} requires a finite value`);
  if(operation.kind==="addVariable"){next.leftCoeff=equationClean(next.leftCoeff+value);next.rightCoeff=equationClean(next.rightCoeff+value)}
  else if(operation.kind==="addConstant"){next.leftConstant=equationClean(next.leftConstant+value);next.rightConstant=equationClean(next.rightConstant+value)}
  else {if(Math.abs(value)<1e-12)throw new Error("equationOutcomeLab cannot scale both sides by zero");next.leftCoeff=equationClean(next.leftCoeff*value);next.leftConstant=equationClean(next.leftConstant*value);next.rightCoeff=equationClean(next.rightCoeff*value);next.rightConstant=equationClean(next.rightConstant*value);if(value<0)next.relation=equationFlip(next.relation)}
  return next;
}
export function equationOutcomeTruth(spec: { leftCoeff: number; leftConstant: number; rightCoeff: number; rightConstant: number }): "one" | "none" | "infinite" {
  if (Math.abs(spec.leftCoeff - spec.rightCoeff) > 1e-9) return "one";
  return Math.abs(spec.leftConstant - spec.rightConstant) <= 1e-9 ? "infinite" : "none";
}
export function equationTransformTruth(spec:{leftCoeff:number;leftConstant:number;rightCoeff:number;rightConstant:number;relation:EquationRelation;operations:readonly EquationTransformOperation[];correctOrder:readonly string[]}):{
  initial:EquationTransformState;states:Array<{operation:EquationTransformOperation;state:EquationTransformState}>;answerNumber?:number;answerRelation?:EquationRelation;
}{
  const initial={leftCoeff:spec.leftCoeff,leftConstant:spec.leftConstant,rightCoeff:spec.rightCoeff,rightConstant:spec.rightConstant,relation:spec.relation};
  const byId=new Map((spec.operations??[]).map(operation=>[operation.id,operation]));let current=initial;const states=[];
  for(const id of (spec.correctOrder??[])){const operation=byId.get(id);if(!operation)throw new Error(`equationOutcomeLab correct order references missing operation ${id}`);current=equationTransformApply(current,operation);states.push({operation,state:current})}
  const coeff=equationClean(spec.leftCoeff-spec.rightCoeff),constant=equationClean(spec.rightConstant-spec.leftConstant);
  if(Math.abs(coeff)<1e-12)throw new Error("equationOutcomeLab transform mode requires one finite boundary");
  const answerNumber=equationClean(constant/coeff);const answerRelation=coeff<0?equationFlip(spec.relation):spec.relation;
  return{initial,states,answerNumber,answerRelation};
}
export function equationOutcomeChoiceCorrect(spec: { leftCoeff: number; leftConstant: number; rightCoeff: number; rightConstant: number },choice: { outcome: "one" | "none" | "infinite" }): boolean { return choice.outcome === equationOutcomeTruth(spec); }

export const EquationOutcomeLabSpec = z.object({
  type: z.literal("equationOutcomeLab"),
  mode:z.enum(["classify","transform"]).default("classify"),
  answerMode:z.enum(["outcome","sequence","numeric"]).default("outcome"),
  prompt: z.string().min(1),
  leftDisplay: z.string().min(1), rightDisplay: z.string().min(1),
  leftCoeff: z.number(), leftConstant: z.number(), rightCoeff: z.number(), rightConstant: z.number(),
  relation:z.enum(["eq","lt","le","gt","ge"]).default("eq"), variable:z.string().min(1).default("x"),
  choices: z.array(z.object({id:z.string().min(1),label:z.string().min(1),outcome:z.enum(["one","none","infinite"]),feedback:z.string().min(1)})).max(8).default([]),
  operations:z.array(z.object({id:z.string().min(1),label:z.string().min(1),kind:z.enum(["normalize","addVariable","addConstant","scale"]),value:z.number().finite().optional(),feedback:z.string().min(1).optional(),result:z.object({leftCoeff:z.number().finite(),leftConstant:z.number().finite(),rightCoeff:z.number().finite(),rightConstant:z.number().finite(),relation:z.enum(["eq","lt","le","gt","ge"])}).optional()})).max(10).default([]),
  correctOrder:z.array(z.string().min(1)).max(10).default([]), requiredMoves:z.number().int().min(1).max(10).default(1),
  numericErrors:z.array(z.object({value:z.number().finite(),feedback:z.string().min(1)})).max(8).default([]), tolerance:z.number().nonnegative().default(0),
  explorationFeedback:z.string().min(1).default("Apply the same legal operation to both sides and inspect the new relation."),
  fallbackFeedback: z.string().min(1), successFeedback: z.string().min(1)
});

/** signedFractionLab — one proof-carrying surface for sign, operation, reciprocal division,
 * magnitude arithmetic, and simplification. A selected authored claim does not merely color a
 * button: it changes the visible process route, so a wrong sign, an unflipped divisor, an
 * unreduced equivalent, and a magnitude error remain mathematically distinct. */
export const SignedFractionLabSpec = z.object({
  type: z.literal("signedFractionLab"),
  prompt: z.string().min(1),
  operation: z.enum(["multiply", "divide"]),
  left: z.object({ sign: z.union([z.literal(1), z.literal(-1)]), num: z.number().int().positive(), den: z.number().int().positive() }),
  right: z.object({ sign: z.union([z.literal(1), z.literal(-1)]), num: z.number().int().positive(), den: z.number().int().positive() }),
  form: z.enum(["any", "lowestTerms"]).default("any"),
  choices: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    sign: z.union([z.literal(1), z.literal(-1)]),
    num: z.number().int().nonnegative(),
    den: z.number().int().positive(),
    path: z.enum(["correct", "wrongSign", "keptDivisor", "magnitudeError", "unreduced"]),
    feedback: z.string().min(1)
  })).min(3),
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

function signedFractionGcd(a: number, b: number): number {
  let x = Math.abs(a), y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x || 1;
}

export function signedFractionTruth(spec: {
  operation: "multiply" | "divide";
  left: { sign: 1 | -1; num: number; den: number };
  right: { sign: 1 | -1; num: number; den: number };
}): { sign: 1 | -1; num: number; den: number; rawNum: number; rawDen: number } {
  const sign = (spec.left.sign * spec.right.sign) as 1 | -1;
  const rawNum = spec.operation === "multiply" ? spec.left.num * spec.right.num : spec.left.num * spec.right.den;
  const rawDen = spec.operation === "multiply" ? spec.left.den * spec.right.den : spec.left.den * spec.right.num;
  const g = signedFractionGcd(rawNum, rawDen);
  return { sign, num: rawNum / g, den: rawDen / g, rawNum, rawDen };
}

export function signedFractionChoiceEquivalent(
  truth: { sign: 1 | -1; num: number; den: number },
  choice: { sign: 1 | -1; num: number; den: number }
): boolean {
  return truth.sign === choice.sign && truth.num * choice.den === choice.num * truth.den;
}

export function signedFractionChoiceCorrect(
  spec: { operation: "multiply" | "divide"; left: { sign: 1 | -1; num: number; den: number }; right: { sign: 1 | -1; num: number; den: number }; form: "any" | "lowestTerms" },
  choice: { sign: 1 | -1; num: number; den: number }
): boolean {
  const truth = signedFractionTruth(spec);
  if (!signedFractionChoiceEquivalent(truth, choice)) return false;
  return spec.form === "any" || (choice.num === truth.num && choice.den === truth.den);
}

/** integerChips — positive/negative chips; zero pairs cancel. Build a target sum. */
export const IntegerChipsSpec = z.object({
  type: z.literal("integerChips"),
  prompt: z.string().min(1),
  target: z.number().int(),
  maxPos: z.number().int().nonnegative().default(10),
  maxNeg: z.number().int().nonnegative().default(10),
  posStart: z.number().int().nonnegative().default(0),
  negStart: z.number().int().nonnegative().default(0),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** volumeBuilder — stack unit cubes as l × w × h layers; volume updates live. Any dimension
 * triple reaching the target volume is correct.
 *
 * `solid` (prism | cylinder | cone | sphere) re-shapes what is being built and which radius/height
 * controls are live: prism uses l/w/h, the other three use rMax/rStart. DOCUMENTED EXPLICITLY in
 * S203W because its absence caused a real error — S203L refused a whole lesson on the written claim
 * that "no registered engine represents a sphere as manipulable state", when `solid: "sphere"` had
 * existed the entire time. The enum's VALUES were always visible in the schema; its MEANING was
 * not, and a refusal written from memory rather than from the field is how that gap turns into
 * lost content. */
export const VolumeBuilderSpec = z.object({
  type: z.literal("volumeBuilder"),
  prompt: z.string().min(1),
  targetVolume: z.number().int().positive(),
  lMax: z.number().int().positive().default(6),
  wMax: z.number().int().positive().default(6),
  hMax: z.number().int().positive().default(6),
  lStart: z.number().int().positive().default(1),
  wStart: z.number().int().positive().default(1),
  hStart: z.number().int().positive().default(1),
  /** Per-volume misconception landings, checked BEFORE the low/high direction fallback. A built
   * volume carries a specific diagnosis (e.g. 10 = "you stopped at the base layer", 9 = "you added
   * the edges instead of multiplying"), which direction-generic feedback cannot distinguish. */
  commonBuilds: z
    .array(z.object({ volume: z.number().int().positive(), feedback: z.string().min(1) }))
    .default([]),
  /** Missing-dimension mode: a locked dimension is FIXED at its start value and rendered as a
   * fixed readout rather than a slider. Without it volumeBuilder grades the product alone, so a
   * step asking "volume 60, length 5, width 4 — find the height" could be satisfied by 6×5×2
   * without the learner ever finding the height. Locking the stated knowns makes the target
   * reachable ONLY at the correct free dimension, so the engine demands the authored answer. */
  lockL: z.boolean().default(false),
  lockW: z.boolean().default(false),
  lockH: z.boolean().default(false),
  /** S119 — the ROUND solids. `prism` (the default) keeps every existing spec working unchanged;
   * the other three swap the l/w/h sliders for radius and height, and the volume is reported as an
   * exact multiple of \u03c0 rather than a decimal. The three G8 lessons this serves sit in a
   * relationship worth being able to SEE: at r = 3, h = 4 a cylinder is 36\u03c0 and a cone is
   * exactly a third of it, 12\u03c0 \u2014 while a sphere of the same radius is 36\u03c0 again,
   * equal to the cylinder that would contain it if its height were 4. Those coincidences are the
   * content of the lessons, and three fixed formulas on a page cannot show them. */
  solid: z.enum(["prism", "cylinder", "cone", "sphere"]).default("prism"),
  /** S119 — a fractional EDGE on the prism. `l` on the slider is a count of 1/denomL units, the
   * exact shape of `numberLineHop.denom` and `doubleNumberLine.denom` reused here: the numbers on
   * screen stay the question's own numbers (a half-unit reads "1/2", not "0.5" or a raw tick
   * count of 1), while the arithmetic underneath stays exact. Only `l` gains a denominator — these
   * lessons ("1/2 × 2 × 3", "1½ × 4 × 2") always place the fraction on one edge, and generalizing
   * to all three would be speculative rather than measured. Prism-only: a round solid's radius and
   * height are not counts of unit cubes, so a denominator on them would mean something different. */
  denomL: z.number().int().min(2).max(12).optional(),
  /** Reached by treating the half-unit COUNT as a whole-unit count — building l/denomL times too
   * large a box. Reachable only when that raw product actually differs from the true volume,
   * which the integrity gate verifies before requiring this field. */
  wholeUnitFeedback: z.string().min(1).optional(),
  rMax: z.number().int().positive().max(12).default(6),
  rStart: z.number().int().positive().default(1),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** The volume of a round solid as an EXACT multiple of \u03c0, returned as a reduced fraction so
 * nothing is rounded: cylinder r\u00b2h, cone r\u00b2h/3, sphere 4r\u00b3/3. Shared by the
 * renderer's readout, the grader and the integrity gate. */
export function roundSolidCoef(
  solid: "cylinder" | "cone" | "sphere",
  r: number,
  h: number
): { num: number; den: number } {
  const raw =
    solid === "cylinder" ? { num: r * r * h, den: 1 }
      : solid === "cone" ? { num: r * r * h, den: 3 }
        : { num: 4 * r * r * r, den: 3 };
  // Guard: a non-finite r or h (a prism-shaped value reaching a round spec) made `a % b` NaN and
  // recursed until the stack blew. Fail closed instead.
  if (!Number.isFinite(raw.num) || !Number.isFinite(raw.den)) return { num: 0, den: 1 };
  const g = (a: number, b: number): number => (b === 0 ? a : g(b, a % b));
  const d = g(Math.abs(raw.num), raw.den) || 1;
  return { num: raw.num / d, den: raw.den / d };
}

/** netFold — set a prism's dimensions; the net unfolds with each face labelled by its area, and
 * the total is the surface area. Correct when the net's total area hits the target. */
export const NetFoldSpec = z.object({
  type: z.literal("netFold"),
  prompt: z.string().min(1),
  targetSurfaceArea: z.number().int().positive(),
  lMax: z.number().int().positive().default(6),
  wMax: z.number().int().positive().default(6),
  hMax: z.number().int().positive().default(6),
  lStart: z.number().int().positive().default(1),
  wStart: z.number().int().positive().default(1),
  hStart: z.number().int().positive().default(1),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** ratioTable — fill the missing cell of an equivalent-ratio table by scaling a known row. */
export const RatioTableSpec = z.object({
  type: z.literal("ratioTable"),
  prompt: z.string().min(1),
  colA: z.string().min(1),
  colB: z.string().min(1),
  /** Known rows shown filled in. */
  rows: z.array(z.tuple([z.number(), z.number()])).min(1),
  /** The row being asked: its A is given, its B is set by the learner. */
  askA: z.number(),
  targetB: z.number(),
  bMax: z.number().positive(),
  bStep: z.number().positive().default(1),
  bStart: z.number().default(0),
  /** S119 — FRACTION mode. When present, every number in this table is a count of 1/denom units and
   * the cells render as true fractions. It exists for the unit-rate lessons: "1/2 mile in 1/4 hour"
   * is a lesson about dividing fractions, and a table reading 0.5 and 0.25 sidesteps the very thing
   * being taught. Reuses `hopLabel` — the same exact-fraction renderer built and proven for
   * numberLineHop's rational lattice — so there is one fraction formatter, not two.
   *
   * The arithmetic underneath stays integer, so cross-multiplication and grading are exact. */
  denom: z.number().int().min(2).max(24).optional(),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** elapsedTime — two clocks (start fixed, end draggable); the elapsed duration updates live. */
export const ElapsedTimeSpec = z.object({
  type: z.literal("elapsedTime"),
  prompt: z.string().min(1),
  startHour: z.number().int().min(1).max(12),
  startMinute: z.number().int().min(0).max(59),
  targetMinutes: z.number().int().positive(),
  minuteStep: z.number().int().positive().default(5),
  maxMinutes: z.number().int().positive().default(180),
  startElapsed: z.number().int().nonnegative().default(0),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** distanceGrid — move a point on a grid; the right triangle's legs and the hypotenuse (the
 * distance) update live, showing the distance formula as the Pythagorean theorem. */
export const DistanceGridSpec = z.object({
  type: z.literal("distanceGrid"),
  prompt: z.string().min(1),
  anchor: z.tuple([z.number().int(), z.number().int()]),
  targetPoint: z.tuple([z.number().int(), z.number().int()]),
  gridMin: z.number().int().default(0),
  gridMax: z.number().int().default(8),
  startX: z.number().int().default(0),
  startY: z.number().int().default(0),
  successFeedback: z.string().min(1),
  wrongPointFeedback: z.string().min(1)
});

/** treeDiagram — choose how many branches at each of two stages; the tree draws and the leaf count
 * shows why outcomes multiply. */
export const TreeDiagramSpec = z.object({
  type: z.literal("treeDiagram"),
  prompt: z.string().min(1),
  stage1Label: z.string().min(1),
  stage2Label: z.string().min(1),
  targetA: z.number().int().positive(),
  targetB: z.number().int().positive(),
  maxA: z.number().int().positive().default(6),
  maxB: z.number().int().positive().default(6),
  aStart: z.number().int().positive().default(1),
  bStart: z.number().int().positive().default(1),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** spinnerSim — a spinner with n equal sectors, m of them favourable; set the sectors so the
 * theoretical probability matches a target. */
export const SpinnerSimSpec = z.object({
  type: z.literal("spinnerSim"),
  prompt: z.string().min(1),
  sectors: z.number().int().min(2).max(12),
  targetFavourable: z.number().int().nonnegative(),
  favourableStart: z.number().int().nonnegative().default(0),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});


/** trialProbabilityLab — make favourable-over-total visible for both experimental and
 * theoretical probability. The fixed evidence is authored; the learner selects an exact fraction,
 * and the lab projects that claim back onto the SAME total so denominator, complement and
 * theoretical-vs-experimental misconceptions become visible rather than merely marked wrong. */
export const TrialProbabilityLabSpec = z.object({
  type: z.literal("trialProbabilityLab"),
  prompt: z.string().min(1),
  mode: z.enum(["experimental", "theoretical"]),
  favourable: z.number().int().nonnegative(),
  total: z.number().int().positive().max(120),
  successLabel: z.string().min(1),
  totalLabel: z.string().min(1),
  /** Theoretical mode lists every equally likely outcome; experimental mode uses a deterministic
   * spread of favourable and other trial marks and therefore keeps this empty. */
  outcomes: z.array(z.object({ label: z.string().min(1), favourable: z.boolean() })).default([]),
  /** Optional given theoretical probability, shown as a labelled tangerine diamond while the
   * experimental evidence remains fixed. It is context, never the graded target. */
  referenceNum: z.number().int().nonnegative().optional(),
  referenceDen: z.number().int().positive().optional(),
  choices: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    num: z.number().int().nonnegative(),
    den: z.number().int().positive(),
    feedback: z.string().min(1)
  })).min(3),
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

/** compoundEventLab — a fixed multi-stage sample space with two separately graded claims:
 * count mode asks for the total number of ordered outcomes; probability mode asks for the exact
 * favourable-over-total probability. The stage factors, complete outcome lattice, and selected
 * claim all share the same authored structure, so counting and probability cannot silently drift. */
/** scaledCircleLab — one exact chain from plan radius to real radius, circumference coefficient,
 * or area coefficient. The scale diagram and the selected symbolic claim share one truth.
 *
 * `ask` (realRadius | circumferenceCoef | areaCoef) selects WHICH quantity of a SINGLE circle is
 * graded, computed by `scaledCircleTarget()` below: realRadius → realRadius, circumferenceCoef →
 * 2·realRadius, areaCoef → realRadius². DOCUMENTED EXPLICITLY in S203W after S203V designed a whole
 * lesson believing circumferenceCoef/areaCoef compared TWO circles under a scale factor. They do
 * not — they extract one circle's own formula component, before π. Note also that `choices` has NO
 * `correct` boolean (unlike most mcq-shaped widgets): correctness is computed by matching
 * `choice.value` against that target, so a hand-set `correct: true` is silently ignored. */
export const ScaledCircleLabSpec = z.object({
  type: z.literal("scaledCircleLab"),
  prompt: z.string().min(1),
  drawingRadius: z.number().positive().optional(),
  scale: z.number().positive().optional(),
  realRadius: z.number().positive(),
  ask: z.enum(["realRadius", "circumferenceCoef", "areaCoef"]),
  choices: z.array(z.object({
    id: z.string().min(1), label: z.string().min(1), value: z.number().nonnegative(), feedback: z.string().min(1)
  })).min(3),
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export function scaledCircleTarget(spec: { realRadius: number; ask: "realRadius" | "circumferenceCoef" | "areaCoef" }): number {
  if (spec.ask === "realRadius") return spec.realRadius;
  if (spec.ask === "circumferenceCoef") return 2 * spec.realRadius;
  return spec.realRadius * spec.realRadius;
}

export function scaledCircleChoiceCorrect(
  spec: { realRadius: number; ask: "realRadius" | "circumferenceCoef" | "areaCoef" },
  choice: { value: number }
): boolean {
  return Math.abs(choice.value - scaledCircleTarget(spec)) < 1e-9;
}

/** triangleClosureLab — rotate two fixed beams around a hinge and compare their endpoint span
 * with the third beam. The learner explores closure before choosing an authored reasoning claim. */
export const TriangleClosureLabSpec = z.object({
  type: z.literal("triangleClosureLab"),
  prompt: z.string().min(1),
  sides: z.tuple([z.number().positive(), z.number().positive(), z.number().positive()]),
  angleStart: z.number().min(0).max(180).default(30),
  angleStep: z.number().positive().default(5),
  requiredMoves: z.number().int().min(1).max(20).default(2),
  choices: z.array(z.object({
    id: z.string().min(1), label: z.string().min(1), verdict: z.enum(["forms", "does-not-form"]), feedback: z.string().min(1)
  })).min(3),
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export function triangleClosureForms(sides: readonly [number, number, number]): boolean {
  const [a, b, c] = [...sides].sort((x, y) => x - y);
  return a + b > c;
}

export function triangleClosureSpan(a: number, b: number, angleDeg: number): number {
  const rad = angleDeg * Math.PI / 180;
  return Math.sqrt(Math.max(0, a * a + b * b - 2 * a * b * Math.cos(rad)));
}

export function triangleClosureTargetAngle(sides: readonly [number, number, number]): number | null {
  const [a, b, c] = [...sides].sort((x, y) => x - y);
  if (!(a + b > c) || !(Math.abs(a - b) < c)) return null;
  const cosine = (a * a + b * b - c * c) / (2 * a * b);
  return Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI;
}

export function triangleClosureChoiceCorrect(
  spec: { sides: readonly [number, number, number] },
  choice: { verdict: "forms" | "does-not-form" }
): boolean {
  return choice.verdict === (triangleClosureForms(spec.sides) ? "forms" : "does-not-form");
}

export const CompoundEventLabSpec = z.object({
  type: z.literal("compoundEventLab"),
  prompt: z.string().min(1),
  mode: z.enum(["count", "probability"]),
  stages: z.array(z.object({
    label: z.string().min(1),
    outcomes: z.array(z.string().min(1)).min(2).max(14),
    favourable: z.array(z.number().int().nonnegative()).default([])
  })).min(2).max(6),
  choices: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    count: z.number().int().nonnegative().optional(),
    num: z.number().int().nonnegative().optional(),
    den: z.number().int().positive().optional(),
    feedback: z.string().min(1)
  })).min(3),
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export function compoundEventTotal(spec: { stages: Array<{ outcomes: string[] }> }): number {
  return spec.stages.reduce((product, stage) => product * stage.outcomes.length, 1);
}

export function compoundEventFavourable(spec: { stages: Array<{ favourable: number[] }> }): number {
  return spec.stages.reduce((product, stage) => product * stage.favourable.length, 1);
}

export function compoundEventChoiceCorrect(
  spec: { mode: "count" | "probability"; stages: Array<{ outcomes: string[]; favourable: number[] }> },
  choice: { count?: number; num?: number; den?: number }
): boolean {
  const total = compoundEventTotal(spec);
  if (spec.mode === "count") return choice.count === total;
  if (choice.num === undefined || choice.den === undefined) return false;
  return choice.num * total === choice.den * compoundEventFavourable(spec);
}

/** compositeAreaLab — one exact geometric truth across decomposition and signed composition.
 * A scene fixes the pieces; the learner selects a numerical claim while the same piece-area
 * derivation drives the renderer, integrity gate, grading, answer summary, and accessibility text. */
export const CompositeAreaLabSpec = z.object({
  type: z.literal("compositeAreaLab"),
  prompt: z.string().min(1),
  scene: z.enum(["parallelogram-rearrange", "trapezoid-diagonal", "piece-ledger"]),
  pieces: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    shape: z.enum(["rectangle", "triangle", "parallelogram", "given"]),
    operation: z.enum(["add", "subtract"]),
    width: z.number().positive().optional(),
    base: z.number().positive().optional(),
    height: z.number().positive().optional(),
    area: z.number().positive().optional()
  })).min(1).max(6),
  target: z.object({
    kind: z.enum(["total", "piece"]),
    pieceId: z.string().min(1).optional()
  }),
  choices: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    value: z.number(),
    feedback: z.string().min(1)
  })).min(3),
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export type CompositeAreaPieceLike = {
  id: string;
  shape: "rectangle" | "triangle" | "parallelogram" | "given";
  operation: "add" | "subtract";
  width?: number;
  base?: number;
  height?: number;
  area?: number;
};

/** Exact area of one displayed piece. No authored total is trusted. */
export function compositeAreaPieceArea(piece: CompositeAreaPieceLike): number {
  switch (piece.shape) {
    case "rectangle":
      return (piece.width ?? NaN) * (piece.height ?? NaN);
    case "triangle":
      return ((piece.base ?? NaN) * (piece.height ?? NaN)) / 2;
    case "parallelogram":
      return (piece.base ?? NaN) * (piece.height ?? NaN);
    case "given":
      return piece.area ?? NaN;
  }
}

/** The one target value used by grading, reveal, narration, and integrity. */
export function compositeAreaTarget(spec: {
  pieces: CompositeAreaPieceLike[];
  target: { kind: "total" | "piece"; pieceId?: string };
}): number {
  if (spec.target.kind === "piece") {
    const piece = spec.pieces.find((candidate) => candidate.id === spec.target.pieceId);
    return piece ? compositeAreaPieceArea(piece) : NaN;
  }
  return spec.pieces.reduce((sum, piece) =>
    sum + (piece.operation === "subtract" ? -1 : 1) * compositeAreaPieceArea(piece), 0);
}

export function compositeAreaChoiceCorrect(
  spec: { pieces: CompositeAreaPieceLike[]; target: { kind: "total" | "piece"; pieceId?: string } },
  choice: { value: number }
): boolean {
  return Math.abs(choice.value - compositeAreaTarget(spec)) <= 1e-9;
}
/** Cross-product equality is the single truth used by grading, integrity and narration. */
export function trialProbabilityEquivalent(
  spec: { favourable: number; total: number },
  choice: { num: number; den: number }
): boolean {
  return choice.num * spec.total === spec.favourable * choice.den;
}

/** What a selected fraction predicts out of the authored total; may exceed total for an invalid
 * probability, which the renderer deliberately shows beyond the probability-1 boundary. */
export function trialProbabilityClaimCount(
  spec: { total: number },
  choice: { num: number; den: number }
): number {
  return (spec.total * choice.num) / choice.den;
}

/** sampleSim — draw repeated random samples from a population whose true proportion is known, and
 * watch the sample proportions pile up into a sampling distribution. Larger samples pile tighter:
 * the learner must find the sample size that pins the estimate down, not just draw more samples. */
export const SampleSimSpec = z.object({
  type: z.literal("sampleSim"),
  prompt: z.string().min(1),
  populationP: z.number().min(0.05).max(0.95),
  sizes: z.array(z.number().int().min(5).max(400)).min(2).max(4),
  targetSize: z.number().int().min(5).max(400),
  requiredDraws: z.number().int().min(5).max(200),
  seed: z.number().int().nonnegative().default(7),
  successFeedback: z.string().min(1),
  wrongSizeFeedback: z.string().min(1),
  moreDrawsFeedback: z.string().min(1)
});

/** ciCapture — each simulated poll produces an interval; intervals that miss the true value are
 * flagged. Makes "95% confident" mean what it actually means: 95% of the INTERVALS capture the
 * parameter, not "a 95% chance the parameter sits in this one". */
export const CiCaptureSpec = z.object({
  type: z.literal("ciCapture"),
  prompt: z.string().min(1),
  populationP: z.number().min(0.05).max(0.95),
  sampleSize: z.number().int().min(10).max(500),
  levels: z.array(z.number().int().min(50).max(99)).min(2).max(4),
  targetLevel: z.number().int().min(50).max(99),
  requiredIntervals: z.number().int().min(5).max(100),
  seed: z.number().int().nonnegative().default(11),
  successFeedback: z.string().min(1),
  wrongLevelFeedback: z.string().min(1),
  moreIntervalsFeedback: z.string().min(1)
});

/** shuffleTest — a randomisation test. Shuffle the group labels, rebuild the difference, repeat:
 * that pile IS the "what chance alone produces" distribution. Then judge the observed gap against
 * it. Simulate first, verdict second — both are required to be correct. */
export const ShuffleTestSpec = z.object({
  type: z.literal("shuffleTest"),
  prompt: z.string().min(1),
  groupALabel: z.string().min(1),
  groupBLabel: z.string().min(1),
  groupA: z.array(z.number()).min(3).max(20),
  groupB: z.array(z.number()).min(3).max(20),
  requiredShuffles: z.number().int().min(10).max(200),
  targetVerdict: z.enum(["chance", "real"]),
  seed: z.number().int().nonnegative().default(5),
  successFeedback: z.string().min(1),
  moreShufflesFeedback: z.string().min(1),
  wrongVerdictFeedback: z.string().min(1)
});

/** circleAngleExplore — one circle, one draggable arc, and (in inscribed mode) a point P you can
 * slide right around the circumference while the angle at P refuses to move. The invariance IS the
 * theorem, and no static figure can show it. Modes:
 *   central      — the readout is the central angle itself (= the arc)
 *   inscribed    — the readout is the angle at P: half the arc, wherever P sits
 *   tangentChord — the readout is the angle between a tangent and a chord: half the arc it cuts off
 *   cyclic       — the readout is the angle OPPOSITE the one you are setting: 180 minus half the arc
 */
export const CircleAngleExploreSpec = z.object({
  type: z.literal("circleAngleExplore"),
  prompt: z.string().min(1),
  mode: z.enum(["central", "inscribed", "tangentChord", "cyclic"]),
  /** Degrees the readout must reach. */
  targetAngle: z.number().int().min(10).max(340),
  /** Starting arc, in degrees. */
  startArc: z.number().int().min(20).max(340).default(100),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** graphZoom — magnify a curve around a single x-value and watch what the y-values do. A limit is a
 * claim about arbitrarily small neighbourhoods, so the only honest way to teach it is to let the
 * learner shrink the neighbourhood themselves. Four behaviours, and the point of each survives zoom:
 *   continuous — the curve closes up and the limit equals f(a)
 *   removable  — the HOLE never fills, but both sides still march to the same number (limit exists,
 *                f(a) does not) — the misconception this widget exists to kill
 *   jump       — the two branches refuse to meet; zooming makes the gap look BIGGER, never smaller
 *   infinite   — the branches leave the window at every magnification
 * The learner must zoom AND then give a verdict; both are graded, so "right answer, never looked"
 * is marked wrong. */
export const GraphZoomSpec = z.object({
  type: z.literal("graphZoom"),
  prompt: z.string().min(1),
  behaviour: z.enum(["continuous", "removable", "jump", "infinite"]),
  /** The x we approach. */
  a: z.number(),
  /** What y approaches from the left and from the right (ignored for `infinite`). */
  leftValue: z.number(),
  rightValue: z.number(),
  /** The actual value of f(a); null when f is undefined there (removable / infinite). */
  fAtA: z.number().nullable(),
  targetVerdict: z.enum(["limit-exists", "no-limit"]),
  /** How far in the learner must magnify before a verdict counts. */
  requiredZoom: z.number().int().min(1).max(6).default(3),
  successFeedback: z.string().min(1),
  moreZoomFeedback: z.string().min(1),
  wrongVerdictFeedback: z.string().min(1)
});

/** expLogExplore — one base slider drives BOTH curves at once: y = b^x and its mirror image
 * y = log_b(x) across the line y = x. Moving the base moves them together, which is the fact the
 * two courses are built on and which no static figure states as forcefully: a logarithm is not a new
 * animal, it is an exponential read backwards. */
export const ExpLogExploreSpec = z.object({
  type: z.literal("expLogExplore"),
  prompt: z.string().min(1),
  mode: z.enum(["exponential", "logarithm"]),
  /** The fixed input: the exponent (exponential mode) or the argument (logarithm mode). */
  x: z.number().positive(),
  /** The base that makes the readout hit its goal. Slider moves on a 0.1 grid. */
  targetBase: z.number().min(0.2).max(10),
  startBase: z.number().min(0.2).max(10).default(2),
  /** Draw the partner curve and the y = x mirror line. */
  showMirror: z.boolean().default(false),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** secantSlope — a fixed point A on a curve, a second point B the learner slides, and the line
 * through them. In `average` mode the learner builds a specific interval and reads its average rate.
 * In `limit` mode they squeeze the interval toward nothing and watch the secant FALL ONTO the
 * tangent while the readout converges — and at h = 0 exactly, the quotient reads 0/0 and refuses to
 * exist, which is the same lesson graphZoom teaches about holes, arriving from the other direction. */
export const SecantSlopeSpec = z.object({
  type: z.literal("secantSlope"),
  prompt: z.string().min(1),
  curve: z.enum(["square", "cubic"]),
  mode: z.enum(["average", "limit", "rolle"]),
  /** The fixed point A sits at x = a. */
  a: z.number(),
  /** Optional translations keep authored functions exact without multiplying curve families. */
  shiftX: z.number().default(0),
  shiftY: z.number().default(0),
  /** `average`: the exact gap to build (0.05 grid). `limit`: the gap must be squeezed to within this. */
  targetH: z.number(),
  startH: z.number().default(1.5),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** argandExplore — a complex number as a PLACE, dragged with two integer sliders on the Argand
 * plane. In `multiply` mode a second arrow shows z × w live, so multiplication stops being a FOIL
 * drill and becomes what it actually is: a rotation and a stretch. Multiplying by i turns the arrow
 * a quarter turn — which is the only honest reason i² = −1. */
export const ArgandExploreSpec = z.object({
  type: z.literal("argandExplore"),
  prompt: z.string().min(1),
  mode: z.enum(["plot", "multiply"]),
  /** The fixed multiplier w (multiply mode only). */
  mulRe: z.number().int().default(0),
  mulIm: z.number().int().default(1),
  /** In `plot` mode the target IS z. In `multiply` mode the target is the PRODUCT z × w. */
  targetRe: z.number().int(),
  targetIm: z.number().int(),
  reStart: z.number().int().default(0),
  imStart: z.number().int().default(0),
  gridMax: z.number().int().min(3).max(6).default(5),
  successFeedback: z.string().min(1),
  realFeedback: z.string().min(1),
  imagFeedback: z.string().min(1)
});

/** vectorExplore — a fixed vector u and a vector v the learner drags with two integer sliders.
 * `add` shows v drawn tip-to-tail from u's tip, so the sum is a JOURNEY rather than a rule about
 * components. `dot` shows u · v as a live number and the angle between the arrows, so the learner
 * can steer the dot product to zero and WATCH the arrows become perpendicular — which is the whole
 * reason the dot product is worth having. */
export const VectorExploreSpec = z.object({
  type: z.literal("vectorExplore"),
  prompt: z.string().min(1),
  mode: z.enum(["add", "dot"]),
  ux: z.number().int(),
  uy: z.number().int(),
  /** `add`: the sum u + v must land here. */
  targetX: z.number().int().default(0),
  targetY: z.number().int().default(0),
  /** `dot`: u · v must equal this. */
  targetDot: z.number().int().default(0),
  vxStart: z.number().int().default(1),
  vyStart: z.number().int().default(0),
  gridMax: z.number().int().min(4).max(9).default(6),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** matrixTransform — the 2×2 linear-map laboratory. The one convention that matters:
 * COLUMNS are where the basis vectors land — column 1 = image of î, column 2 = image of ĵ.
 * The learner steps the four entries; the unit square's image, both basis arrows, and a live
 * determinant readout (area scale + orientation) update together, with the target image drawn
 * as a dashed ghost to build toward. Two misconception traps are first-class:
 *  - column swap: entering î's image where ĵ's belongs (rows/columns confusion),
 *  - off-diagonal sign flip: the same rotation taken the wrong way round. */
export const MatrixTransformSpec = z.object({
  type: z.literal("matrixTransform"),
  prompt: z.string().min(1),
  /** Target matrix [[a b],[c d]]: (ta,tc) = image of î, (tb,td) = image of ĵ. */
  ta: z.number().int().min(-3).max(3),
  tb: z.number().int().min(-3).max(3),
  tc: z.number().int().min(-3).max(3),
  td: z.number().int().min(-3).max(3),
  /** Starting entries (identity unless stated). Must differ from the target. */
  sa: z.number().int().min(-3).max(3).default(1),
  sb: z.number().int().min(-3).max(3).default(0),
  sc: z.number().int().min(-3).max(3).default(0),
  sd: z.number().int().min(-3).max(3).default(1),
  /** Human name of the target map, e.g. "a 90° counter-clockwise rotation". */
  targetName: z.string().min(1),
  successFeedback: z.string().min(1),
  /** Diagnosis when the learner's matrix is the target with its COLUMNS swapped. */
  swappedFeedback: z.string().min(1),
  /** Diagnosis when the learner's matrix is the target with off-diagonal signs flipped. */
  signFeedback: z.string().min(1),
  fallbackFeedback: z.string().min(1)
});

/** circleMeasureExplore — the chord/tangent half of circle geometry, which `circleAngleExplore`
 * (angles) never touched. Three modes, each a Pythagorean right triangle hiding in a circle:
 *   chordDistance — slide the chord's distance from the centre; the perpendicular foot BISECTS it,
 *                   and the two halves are shown separately so the learner can watch them stay equal
 *   tangentLength — slide an external point; the two tangent lengths stay equal to each other and to
 *                   √(D² − r²), because the radius meets a tangent at a right angle
 *   arcSector     — slide the central angle; arc length and sector area are the same fraction of the
 *                   circumference and of the area
 */
export const CircleMeasureExploreSpec = z.object({
  type: z.literal("circleMeasureExplore"),
  prompt: z.string().min(1),
  mode: z.enum(["chordDistance", "tangentLength", "arcSector", "radiusScale"]),
  radius: z.number().int().min(3).max(15),
  /** S119 — radiusScale. The other three modes hold the circle fixed and move something inside it.
   * This one moves the CIRCLE: the learner drags r and watches diameter, circumference and area
   * recompute together. It exists because g7-02-03's own concept step names the misconception it
   * exposes — "C = 2\u03c0r doubles, A = \u03c0r\u00b2 squares" — and that is a claim about how two
   * quantities RESPOND to a change, which no fixed diagram can show.
   *
   * Every readout stays an exact integer multiple of \u03c0 (d = 2r, C = 2r\u00b7\u03c0,
   * A = r\u00b2\u00b7\u03c0 for whole r), so nothing on screen is rounded and the grade is integer
   * equality on the radius. */
  targetRadius: z.number().int().min(1).max(12).optional(),
  radiusMax: z.number().int().min(2).max(12).optional(),
  /** Which quantity the task's target is stated in — the lesson's own question, so the lab answers
   * that rather than a neighbouring one. */
  askQuantity: z.enum(["diameter", "circumference", "area"]).optional(),
  /** chordDistance: the chord length to reach. tangentLength: the tangent length to reach. */
  targetLength: z.number().int().default(0),
  /** arcSector: the central angle to reach, in degrees. */
  targetAngle: z.number().int().default(90),
  start: z.number().int().default(0),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** The three circle measures at whole radius r, each an EXACT integer (the \u03c0 is carried
 * symbolically, never multiplied out). Shared by the renderer's readouts, the grader and the
 * integrity gate, so the numbers a learner reads and the numbers the gate checks are one
 * computation. */
export function circleScaleReadouts(r: number): { diameter: number; circumferenceCoef: number; areaCoef: number } {
  return { diameter: 2 * r, circumferenceCoef: 2 * r, areaCoef: r * r };
}

/** polarTrace — sweep a polar curve and change ONE parameter. The petal rule (n petals when n is
 * odd, 2n when n is even) is a fact nobody believes until they have watched the even case retrace
 * its own path and double back; and a cardioid is the exact moment a limaçon's inner loop shrinks to
 * a point. Both are events in time, so both need a curve you can drive. */
export const PolarTraceSpec = z.object({
  type: z.literal("polarTrace"),
  prompt: z.string().min(1),
  mode: z.enum(["rose", "limacon"]),
  /** rose: the number of petals to produce. */
  targetPetals: z.number().int().min(1).max(12).default(4),
  /** limacon: r = a + 2cos θ; the a that produces the required shape. */
  targetA: z.number().int().min(1).max(5).default(2),
  start: z.number().int().min(1).max(6).default(1),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** S116 (k): the ordered cuts a sign chart is divided by — roots AND poles, merged and sorted.
 * Both split the line and both flip the sign by the parity of their multiplicity; they differ only
 * in what the curve does at the cut (a root is a point on it, a pole is an asymptote it never
 * reaches). Exported so the evaluator, the renderer and the integrity gate all count intervals
 * from one definition rather than three. */
export function signChartCuts(
  roots: Array<{ x: number; mult: number }>,
  poles?: Array<{ x: number; mult: number }>
): Array<{ x: number; mult: number; kind: "root" | "pole" }> {
  return [
    ...roots.map((r) => ({ ...r, kind: "root" as const })),
    ...(poles ?? []).map((p) => ({ ...p, kind: "pole" as const })),
  ].sort((a, b) => a.x - b.x);
}

/** S116 (j): the value of the MONIC polynomial a sign chart describes, at x.
 * `sign * prod (x - r_i)^m_i`. A sign chart fixes the roots, their multiplicities and the leading
 * SIGN, which determines the polynomial only up to a positive constant — so this is exact for the
 * monic case and proportional otherwise. Its zeros are exact either way, which is the whole content
 * of the Factor Theorem. Shared so the probe readout and its tests use one definition. */
export function signChartValueAt(
  roots: Array<{ x: number; mult: number }>,
  leadingPositive: boolean,
  x: number
): number {
  let v = leadingPositive ? 1 : -1;
  for (const r of roots) v *= Math.pow(x - r.x, r.mult);
  // Normalise negative zero. IEEE gives -0 whenever an odd number of factors is negative and one
  // is exactly zero — probing a root of (x + 3)(x - 1)(x - 2) at x = 1 produces -0, which renders
  // as "P(1) = -0" and reads as a bug at exactly the moment the Factor Theorem is supposed to land.
  return v === 0 ? 0 : v;
}

/** S116 Block 6: the candidate roots of `scale * sqrt(x + c) = m*x + b`, split into the ones that
 * genuinely solve it and the phantoms squaring invents.
 *
 * Squaring both sides gives scale^2 * (x + c) = (m*x + b)^2, i.e.
 *   m^2 x^2 + (2mb - scale^2) x + (b^2 - scale^2 c) = 0.
 * Every solution of the ORIGINAL is a solution of that quadratic, but not conversely: squaring
 * throws away the sign of the right-hand side. A candidate is genuine exactly when both sides are
 * actually equal — which requires m*x + b >= 0 (a square root is never negative) and x + c >= 0
 * (the radicand must exist). A candidate that satisfies the quadratic but fails the FIRST of those
 * is the phantom: it is the point where the line, reflected up across the axis by squaring, meets
 * the parabola. Failing the SECOND is a different error (outside the domain), and the lab keeps
 * them apart because conflating them is the misconception the lesson corrects.
 *
 * Returned roots are exact integers only when the quadratic has integer solutions; the integrity
 * gate refuses anything else, so no lesson ever renders a rounded root. */
export function extraneousCandidates(
  radical: { c: number; scale: number },
  line: { m: number; b: number }
): { candidates: number[]; trueRoots: number[]; phantomRoots: number[]; outOfDomain: number[] } {
  const { c, scale } = radical;
  const { m, b } = line;
  const A = m * m;
  const B = 2 * m * b - scale * scale;
  const C = b * b - scale * scale * c;
  const candidates: number[] = [];
  if (A === 0) {
    // Degenerate: the "line" is horizontal, so squaring leaves a linear equation.
    if (B !== 0) candidates.push(-C / B);
  } else {
    const disc = B * B - 4 * A * C;
    if (disc >= 0) {
      const r = Math.sqrt(disc);
      for (const x of [(-B - r) / (2 * A), (-B + r) / (2 * A)]) if (!candidates.includes(x)) candidates.push(x);
    }
  }
  candidates.sort((p, q) => p - q);
  const trueRoots: number[] = [];
  const phantomRoots: number[] = [];
  const outOfDomain: number[] = [];
  for (const x of candidates) {
    const radicand = x + c;
    const rhs = m * x + b;
    if (radicand < 0) outOfDomain.push(x);
    else if (rhs < 0) phantomRoots.push(x);
    else trueRoots.push(x);
  }
  return { candidates, trueRoots, phantomRoots, outOfDomain };
}

/** Independent re-derivation used by the integrity gate: does this x ACTUALLY satisfy the original
 * equation, evaluated directly rather than through the quadratic? Kept separate from
 * `extraneousCandidates` on purpose — a bug in the quadratic algebra would otherwise verify itself. */
export function extraneousHolds(
  radical: { c: number; scale: number },
  line: { m: number; b: number },
  x: number
): boolean {
  const radicand = x + radical.c;
  if (radicand < 0) return false;
  const lhs = radical.scale * Math.sqrt(radicand);
  const rhs = line.m * x + line.b;
  return Math.abs(lhs - rhs) < 1e-9;
}

/** signChart — the learner PRODUCES the sign chart instead of reading one. Roots split the line into
 * intervals; the learner picks + or − for each, and the sketch above the line redraws to match their
 * claim. The multiplicity rule stops being a slogan: an odd root flips the sign (the curve crosses),
 * an even one does not (it bounces), and a learner who flips at a double root gets told exactly that. */
export const SignChartSpec = z.object({
  type: z.literal("signChart"),
  prompt: z.string().min(1),
  /** Roots in increasing order, each with its multiplicity.
   *
   * S116: the cap was 3, which silently blocked faithful authoring of monomial end-behaviour
   * lessons — f(x) = -2x^5 has a single root of multiplicity 5 at the origin, and authoring it as
   * multiplicity 3 would put a different function on screen from the one the prose names. Raised
   * to 6, which covers the A2 curriculum's realistic range. Nothing downstream reads the magnitude:
   * `signChartSigns` and the renderer both branch on `mult % 2` only (odd crosses, even bounces),
   * so this widens authoring latitude without changing any behaviour for existing specs. */
  roots: z
    .array(z.object({ x: z.number().int(), mult: z.number().int().min(1).max(6) }))
    .max(4)
    /** S116 (k): floor relaxed from 1 to 0. A rational function need not have ANY zero —
     * (4 - x)/(x^2 - 16) reduces to -1/(x + 4), which has a pole and a hole and no root at all —
     * and requiring one made that whole class unauthorable. The chart still needs something to
     * divide it, so the integrity gate demands at least one CUT (root or pole) instead; a
     * polynomial spec, which has no poles, therefore still needs a root exactly as before. */
    .min(0),
  /** Sign of the leading coefficient. */
  leadingPositive: z.boolean().default(true),
  /** S116 (k): poles — the x-values where a RATIONAL function is undefined because the denominator
   * vanishes. A pole cuts the number line exactly as a root does, and flips the sign by the same
   * parity rule (an odd-order pole flips, an even-order one does not), because the sign of a
   * quotient is decided by the parity of every factor above AND below the bar. What differs is
   * what happens AT the cut: a root is a point ON the curve, a pole is a vertical asymptote the
   * curve never reaches. That distinction — sign can flip with no crossing — is precisely what
   * rf-01-01 (excluded values) exists to teach, and no roots-only chart can pose it. */
  poles: z
    .array(z.object({ x: z.number().int(), mult: z.number().int().min(1).max(3) }))
    .max(3)
    .optional(),
  /** S116 (j): probeX — a draggable probe on the axis with a live readout of P at the probe.
   * Slide it onto a root and the readout hits zero: the Factor Theorem as a collision rather than
   * a stated rule. The probe is EXPLORATORY — it is local to the widget and never part of the
   * graded value, so the learner still grades on the signs they claim. That keeps the evaluator,
   * the value shape and the solvability audit completely unchanged, which is why this is a small
   * addition rather than a second value channel.
   *
   * The readout is the MONIC product `sign * prod (x - r_i)^m_i` — the polynomial is only
   * recoverable from a sign chart up to a positive constant, so author `probeX` on monic
   * polynomials (as the Factor Theorem exercises are). The ZERO is exact regardless of that
   * constant, which is the fact the theorem turns on. Refused alongside `poles`: a remainder is a
   * polynomial-division idea, and a rational function has no remainder at a pole. */
  probeX: z.boolean().optional(),
  /** S116 (k): holes — removable discontinuities, where a factor cancels top and bottom. A hole
   * does NOT cut the line and has NO effect on sign: the reduced function is continuous through
   * it, with a single point punched out. Authored separately from `poles` for exactly that reason
   * — conflating the two is the misconception the rf-01-02/01-03 lessons are built to correct. */
  holes: z.array(z.number().int()).max(3).optional(),
  successFeedback: z.string().min(1),
  /** Fired when a sign is wrong across an ODD root (a crossing that was missed). */
  crossFeedback: z.string().min(1),
  /** Fired when the learner flipped the sign across an EVEN root (a bounce treated as a crossing). */
  bounceFeedback: z.string().min(1)
});

/** sequenceBuild — the original dial modes plus a proof-carrying sequence/series workbench.
 * `dial` preserves the arithmetic-term, geometric-term, and convergent-sum sliders. Reasoning
 * tasks derive terms, differences/ratios, sigma expansion, partial sums, and exact finite or
 * repeating totals from one sequence state. */
export type SequenceReasoningTask="dial"|"ruleType"|"termEvaluate"|"sigmaEvaluate"|"sigmaRepresent"|"arithmeticPair"|"arithmeticSum"|"geometricPair"|"geometricSum"|"repeatingDecimal";
export type SequenceReasoningStage={key:string;label:string;value:string};
export function sequenceReasoningTruth(spec:{task:SequenceReasoningTask;first:number;difference?:number;ratio?:number;count?:number;position?:number;lowerIndex?:number;upperIndex?:number;coefficient?:number;constant?:number;power?:number;pairIndices?:[number,number];repeatingBlock?:number;repeatingDigits?:number;terms?:readonly number[]}):{terms:number[];partialSums:number[];stages:SequenceReasoningStage[];answerNumber?:number;answerClaim?:string}{
  const clean=(n:number)=>{const r=Math.round(n*1e12)/1e12;return Object.is(r,-0)?0:r},fmt=(n:number)=>Number.isInteger(n)?String(n):String(clean(n));
  const count=spec.count??6,d=spec.difference,r=spec.ratio;let terms:number[]=[];const stages:SequenceReasoningStage[]=[];let answerNumber:number|undefined,answerClaim:string|undefined;
  if(spec.terms?.length)terms=[...spec.terms];else if(typeof d==="number")terms=Array.from({length:count},(_,i)=>clean(spec.first+i*d));else if(typeof r==="number")terms=Array.from({length:count},(_,i)=>clean(spec.first*Math.pow(r,i)));
  const partialSums=terms.reduce<number[]>((acc,value)=>[...acc,clean((acc.at(-1)??0)+value)],[]);
  switch(spec.task){
    case"dial":break;
    case"ruleType":{if(typeof d!=="number"&&typeof r!=="number")throw new Error("sequenceBuild ruleType requires a difference or ratio");stages.push({key:"pattern:first",label:"identify the first term",value:`a₁ = ${fmt(spec.first)}`},{key:"pattern:change",label:typeof d==="number"?"measure the common difference":"measure the common ratio",value:typeof d==="number"?`d = ${fmt(d)}`:`r = ${fmt(r!)}`});answerClaim=typeof d==="number"?`recursive:add:${fmt(d)}`:`recursive:multiply:${fmt(r!)}`;break}
    case"termEvaluate":{const position=spec.position??count;if(position<1)throw new Error("sequenceBuild termEvaluate requires a positive position");if(typeof d==="number"){answerNumber=clean(spec.first+(position-1)*d);stages.push({key:"term:offset",label:"count the steps from the first term",value:`${position} − 1 = ${position-1}`},{key:"term:change",label:"accumulate the common difference",value:`${position-1} × ${fmt(d)} = ${fmt((position-1)*d)}`});}else if(typeof r==="number"){answerNumber=clean(spec.first*Math.pow(r,position-1));stages.push({key:"term:exponent",label:"count the ratio multiplications",value:`exponent ${position-1}`},{key:"term:scale",label:"scale the first term",value:`${fmt(spec.first)} × ${fmt(r)}^${position-1} = ${fmt(answerNumber)}`});}else throw new Error("sequenceBuild termEvaluate requires a difference or ratio");break}
    case"sigmaEvaluate":{const lo=spec.lowerIndex??1,hi=spec.upperIndex??count,a=spec.coefficient??1,c=spec.constant??0,p=spec.power??1;if(hi<lo)throw new Error("sequenceBuild sigma upper bound must be at least the lower bound");terms=Array.from({length:hi-lo+1},(_,i)=>clean(a*Math.pow(lo+i,p)+c));const ps=terms.reduce<number[]>((acc,value)=>[...acc,clean((acc.at(-1)??0)+value)],[]);partialSums.splice(0,partialSums.length,...ps);stages.push({key:"sigma:bounds",label:"expand the stated index range",value:`k = ${lo}, …, ${hi} gives ${terms.length} terms`},{key:"sigma:terms",label:"evaluate each term",value:terms.map(fmt).join(" + ")},{key:"sigma:sum",label:"accumulate the terms",value:`sum = ${fmt(ps.at(-1)??0)}`});answerNumber=ps.at(-1)??0;break}
    case"sigmaRepresent":{if(!terms.length)throw new Error("sequenceBuild sigmaRepresent requires terms");const arithmetic=terms.length>1&&terms.slice(1).every((value,i)=>Math.abs((value-terms[i]!)-(terms[1]!-terms[0]!))<1e-9);if(!arithmetic)throw new Error("sequenceBuild sigmaRepresent currently requires an arithmetic term list");const diff=terms.length>1?clean(terms[1]!-terms[0]!):0,constant=clean(terms[0]!-diff);stages.push({key:"sigma:count",label:"count the written terms",value:`${terms.length} terms`},{key:"sigma:rule",label:"derive the kth term",value:`${fmt(diff)}k ${constant<0?"−":"+"} ${fmt(Math.abs(constant))}`});answerClaim=`sigma:${terms.length}:${fmt(diff)}:${fmt(constant)}`;break}
    case"arithmeticPair":{if(!terms.length)throw new Error("sequenceBuild arithmeticPair requires terms");const [i,j]=spec.pairIndices??[0,terms.length-1];if(!terms[i]&&terms[i]!==0||!terms[j]&&terms[j]!==0)throw new Error("sequenceBuild pair index is outside the term list");answerNumber=clean(terms[i]!+terms[j]!);stages.push({key:"pair:select",label:"select the paired terms",value:`${fmt(terms[i]!)} and ${fmt(terms[j]!)}`},{key:"pair:add",label:"add the pair",value:`${fmt(terms[i]!)} + ${fmt(terms[j]!)} = ${fmt(answerNumber)}`});break}
    case"arithmeticSum":{if(typeof d!=="number")throw new Error("sequenceBuild arithmeticSum requires a common difference");const n=count,last=clean(spec.first+(n-1)*d);answerNumber=clean(n*(spec.first+last)/2);stages.push({key:"arith:last",label:"derive the last term",value:`aₙ = ${fmt(last)}`},{key:"arith:pair",label:"pair first and last",value:`${fmt(spec.first)} + ${fmt(last)} = ${fmt(spec.first+last)}`},{key:"arith:sum",label:"take n halves of the pair",value:`${n}/2 × ${fmt(spec.first+last)} = ${fmt(answerNumber)}`});break}
    case"geometricPair":{if(!terms.length)throw new Error("sequenceBuild geometricPair requires terms");const [i,j]=spec.pairIndices??[1,2];if(!terms[i]&&terms[i]!==0||!terms[j]&&terms[j]!==0)throw new Error("sequenceBuild pair index is outside the term list");answerNumber=clean(terms[i]!+terms[j]!);stages.push({key:"geometric:ratio",label:"confirm the common ratio",value:`r = ${fmt(r??(terms[1]!/terms[0]!))}`},{key:"pair:add",label:"add the requested pair",value:`${fmt(terms[i]!)} + ${fmt(terms[j]!)} = ${fmt(answerNumber)}`});break}
    case"geometricSum":{if(typeof r!=="number"||Math.abs(r-1)<1e-12)throw new Error("sequenceBuild geometricSum requires r ≠ 1");answerNumber=clean(spec.first*(1-Math.pow(r,count))/(1-r));stages.push({key:"geo:power",label:"raise the ratio to the term count",value:`${fmt(r)}^${count} = ${fmt(Math.pow(r,count))}`},{key:"geo:numerator",label:"form the finite growth difference",value:`1 − rⁿ = ${fmt(1-Math.pow(r,count))}`},{key:"geo:sum",label:"apply the geometric sum",value:`Sₙ = ${fmt(answerNumber)}`});break}
    case"repeatingDecimal":{const block=spec.repeatingBlock,digits=spec.repeatingDigits??String(Math.abs(block??0)).length;if(!Number.isInteger(block)||block===undefined||digits<1)throw new Error("sequenceBuild repeatingDecimal requires an integer block");const denominator=Math.pow(10,digits)-1;stages.push({key:"repeat:place",label:"align one repeating block",value:`10^${digits}x shifts one block`},{key:"repeat:subtract",label:"subtract the repeating tails",value:`${denominator}x = ${block}`});answerClaim=`fraction:${block}/${denominator}`;break}
  }
  return{terms,partialSums,stages,answerNumber,answerClaim};
}
export const SequenceBuildSpec = z.object({
  type: z.literal("sequenceBuild"),prompt:z.string().min(1),mode:z.enum(["arithmetic","geometric","geometricTerm"]),
  task:z.enum(["dial","ruleType","termEvaluate","sigmaEvaluate","sigmaRepresent","arithmeticPair","arithmeticSum","geometricPair","geometricSum","repeatingDecimal"]).default("dial"),answerMode:z.enum(["dial","numeric","choice"]).default("dial"),
  first:z.number(),targetD:z.number().int().default(1),atPosition:z.number().int().min(2).max(50).default(10),targetTerm:z.number().default(0),targetRTenths:z.number().int().min(1).max(9).default(5),targetSum:z.number().default(0),rMax:z.number().int().min(3).max(20).default(9),start:z.number().int().default(1),
  difference:z.number().optional(),ratio:z.number().optional(),count:z.number().int().min(1).max(100).optional(),position:z.number().int().min(1).max(100).optional(),lowerIndex:z.number().int().optional(),upperIndex:z.number().int().optional(),coefficient:z.number().optional(),constant:z.number().optional(),power:z.number().int().min(0).max(6).optional(),pairIndices:z.tuple([z.number().int().nonnegative(),z.number().int().nonnegative()]).optional(),repeatingBlock:z.number().int().nonnegative().optional(),repeatingDigits:z.number().int().min(1).max(6).optional(),terms:z.array(z.number()).max(20).optional(),
  choices:z.array(z.object({id:z.string().min(1),label:z.string().min(1),claim:z.string().min(1),feedback:z.string().min(1)})).max(8).default([]),numericErrors:z.array(z.object({value:z.number(),feedback:z.string().min(1)})).max(8).default([]),authoredStages:z.array(z.object({key:z.string().min(1),body:z.string().min(1)})).max(12).default([]),requiredStageKeys:z.array(z.string().min(1)).max(16).default([]),requiredExplorations:z.number().int().min(1).max(16).default(1),tolerance:z.number().nonnegative().default(0),fallbackFeedback:z.string().min(1).default("Inspect the sequence structure, then answer from the exact terms and partial sums."),explorationFeedback:z.string().min(1).default("Open the required sequence states before checking."),successFeedback:z.string().min(1),lowFeedback:z.string().min(1),highFeedback:z.string().min(1)
});

/** triangleSolve — two sides and the included angle (SAS), or three sides (SSS). The readout is the
 * law of cosines, live. The pedagogy is not the formula: it is that these three given parts FIX the
 * triangle — move nothing else and nothing else can move. That is why SAS is a congruence criterion. */
export const TriangleSolveSpec = z.object({
  type: z.literal("triangleSolve"),
  prompt: z.string().min(1),
  mode: z.enum(["sas", "sss", "ratios"]),
  /** sas: fixed sides a and b; the learner sets the included angle. sss: fixed a and b; the learner
   * sets side c, and the readout is the angle opposite c.
   * ratios (S116 c): a right triangle with TWO drags — the acute angle, and the overall SCALE.
   * Every side length moves with the scale; the three ratios do not move at all. That
   * invariance is the only causal fact in introductory trigonometry and no other engine shows
   * it. The learner must actually spend scale moves before the reading counts. */
  a: z.number().int().min(2).max(12),
  b: z.number().int().min(2).max(12),
  /** sas: the third side to reach. sss: the angle (degrees) to reach.
   * ratios: the acute angle (degrees) whose named ratio the learner is hunting. */
  target: z.number().int(),
  start: z.number().int().default(30),
  /** ratios only: which ratio the readout hunt is about. */
  ratio: z.enum(["opp/hyp", "adj/hyp", "opp/adj"]).optional(),
  /** ratios only: how many distinct scale changes count as having TESTED the invariance. */
  requiredScaleMoves: z.number().int().min(1).max(10).optional(),
  /** ratios only: shown when the learner checks without having moved the scale at all. */
  scaleFeedback: z.string().min(1).optional(),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** compassConstruct — swing the compass yourself. `perpBisector`: two arcs of equal radius from the
 * ends of a segment. They meet only once the radius clears half the segment — and wherever they meet,
 * BOTH intersection points are the same distance from each end BY CONSTRUCTION. Change the radius and
 * the line through them does not move. That invariance is the proof, and a learner who has never
 * swung the compass has never met it. `hexagon`: the compass radius steps round its own circle
 * exactly six times, and only when it equals the radius. */
export const CompassConstructSpec = z.object({
  type: z.literal("compassConstruct"),
  prompt: z.string().min(1),
  /** S116 (d) — the classical construction set. Every mode is the SAME interaction grammar the
   * engine already implements (open the compass, swing arcs, mark where they meet); what
   * changes is which equidistance does the work, which each mode's feedback must name. */
  mode: z.enum([
    "perpBisector",
    "hexagon",
    "angleBisector",
    "perpAtPoint",
    "perpFromPoint",
    "parallelThroughPoint",
    "copyAngle"
  ]),
  /** perpBisector: the segment's length. hexagon: the circle's radius. */
  span: z.number().int().min(4).max(10),
  /** The compass radius the task asks for. */
  target: z.number().int().min(1).max(12),
  start: z.number().int().min(1).max(12).default(2),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** quadDrag — three vertices are pinned and the fourth is yours. Side lengths, diagonals and right
 * angles are read out live, and the shape NAMES ITSELF underneath. The hierarchy stops being a list
 * to memorise: you discover a square is a rhombus by being unable to escape the label. */
export const QuadDragSpec = z.object({
  type: z.literal("quadDrag"),
  prompt: z.string().min(1),
  /** The three fixed vertices, in order. The learner supplies the fourth. */
  fixed: z.array(z.tuple([z.number().int(), z.number().int()])).length(3),
  targetX: z.number().int(),
  targetY: z.number().int(),
  startX: z.number().int().default(0),
  startY: z.number().int().default(0),
  gridMax: z.number().int().min(4).max(10).default(8),
  /** What the finished shape should be called, e.g. "a rectangle". */
  targetName: z.string().min(1),
  /** S116 (e) — draw the midsegment (the join of the two non-parallel sides' midpoints) with a
   * live length readout. Through every drag it equals the average of the two parallel sides,
   * which is the trapezoid midsegment theorem stated as a number that will not move. */
  showMidsegment: z.boolean().optional(),
  successFeedback: z.string().min(1),
  sideFeedback: z.string().min(1),
  angleFeedback: z.string().min(1)
});

/** radicalCheck — squaring both sides can INVENT a root. The learner drags a candidate and sees two
 * verdicts at once: does it satisfy the squared equation, and does it satisfy the ORIGINAL? The
 * extraneous root passes the first and fails the second, in front of them. That is the only honest
 * way to teach why the check at the end is not optional. Equation: √(x + a) = x. */
export const RadicalCheckSpec = z.object({
  type: z.literal("radicalCheck"),
  prompt: z.string().min(1),
  /** The constant inside the radical. */
  inside: z.number().int().min(1).max(12),
  /** The genuine solution, and the phantom that squaring created. */
  target: z.number().int(),
  extraneous: z.number().int(),
  start: z.number().int().default(-2),
  successFeedback: z.string().min(1),
  extraneousFeedback: z.string().min(1),
  missFeedback: z.string().min(1)
});

/** derivativeTrace — f on top, and f′ PLOTTED LIVE UNDERNEATH as the learner drags x. Where f is
 * steepest, f′ peaks; where f turns, f′ crosses zero; where f has a corner, f′ has a hole. This is
 * the widget that makes the derivative a FUNCTION rather than a number at a point, which is the one
 * idea `secantSlope` (a single point, a single slope) structurally cannot reach.
 *
 * `slope` mode grades on f′(x) and is only ever used where f′ is strictly monotone — otherwise the
 * low/high feedback would lie (the non-monotonic-feedback rule). Elsewhere, `point` mode grades on x. */
export const DerivativeTraceSpec = z.object({
  type: z.literal("derivativeTrace"),
  prompt: z.string().min(1),
  fn: z.enum(["square", "cubic", "abs", "cubicMix"]),
  mode: z.enum(["slope", "point"]),
  /** Draw a third pane tracing f″ as the learner drags (S205B). Off by default, so every
   * existing lesson renders exactly as before; inflection lessons switch it on to make
   * "where the bend flips" a thing the learner can SEE themselves cross. */
  showSecond: z.boolean().default(false),
  /** Let the learner slide the WHOLE curve vertically: f(x) + C, with C on its own control
   * (S205H). Off by default — `offsetMax: 0` leaves every existing lesson byte-identical.
   *
   * This exists for one idea and it is the central idea of antidifferentiation: sliding a curve up
   * does not tilt it anywhere, so f′ carries NO information about vertical position. Every other
   * representation asserts that; here the learner drags C and watches the f′ pane refuse to move.
   * The +C stops being a bookkeeping rule and becomes something they made happen.
   *
   * `offsetMax` bounds the slider at ±offsetMax in whole units. The graded target is never the
   * offset: grading reads x exactly as before, because the whole point is that C is invisible to
   * the derivative — a grader that cared about C would contradict the lesson. */
  offsetMax: z.number().int().min(0).max(6).default(0),
  /** slope mode: the value f′(x) must reach. */
  targetSlope: z.number().default(0),
  /** point mode: the x to land on. */
  targetX: z.number().default(0),
  start: z.number().default(-3),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** riemannSum — the learner sets the number of strips AND the rule (left / right / midpoint /
 * trapezoid). On a rising function the LEFT sum always undershoots and the RIGHT sum always
 * overshoots, so the true area is TRAPPED between them — and raising n squeezes the trap shut. The
 * definite integral stops being a formula and becomes a limit the learner closes with their own
 * hands. */
export const RiemannSumSpec = z.object({
  type: z.literal("riemannSum"),
  prompt: z.string().min(1),
  fn: z.enum(["line", "square"]),
  a: z.number(),
  b: z.number(),
  /** The estimate must land within this of the true area. */
  tolerance: z.number().positive(),
  nStart: z.number().int().min(1).max(24).default(2),
  ruleStart: z.enum(["left", "right", "mid", "trap"]).default("left"),
  successFeedback: z.string().min(1),
  /** The estimate is below the true area (an undershoot). */
  lowFeedback: z.string().min(1),
  /** The estimate is above it. */
  highFeedback: z.string().min(1)
});

/** accumulateArea — THE Fundamental Theorem, discovered rather than announced. Drag x: the area
 * under f from a to x fills in, AND its running total plots as a second curve A(x) underneath. Then
 * the punchline, which the widget states live: the SLOPE of the accumulation equals the HEIGHT of
 * the function. A′ = f. Nothing else in the catalogue can produce that moment. */
export const AccumulateAreaSpec = z.object({
  type: z.literal("accumulateArea"),
  prompt: z.string().min(1),
  fn: z.enum(["const", "line", "square", "shifted"]),
  /** `area`: drag until the accumulated area reaches targetArea (only for f > 0, so A is monotone
   * and the low/high feedback cannot lie). `point`: drag to a specific x — used where f changes
   * sign and A stops being monotone. */
  mode: z.enum(["area", "point"]),
  targetArea: z.number().default(0),
  targetX: z.number().default(0),
  start: z.number().default(0),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** sliceSum — the through-line of the whole applications course, in one instrument. EVERY integral
 * in C5 is: cut the region into slices, MEASURE one slice, add them up. Only the measurement changes.
 *   areaBetween — the slice is a strip, and you measure its HEIGHT (top − bottom)
 *   disc        — the slice is a rectangle that SWEEPS INTO A DISC when revolved; you measure πr²
 *   washer      — the same, with a bite taken out: π(R² − r²)
 * The learner drags a slider to highlight one slice and read its measurement, and a second to raise
 * the slice count and watch the sum converge. The rectangle becoming a disc is a MOTION, and no
 * static figure in the library can hold it — which is why this widget exists and the others did not
 * suffice. */
export const SliceSumSpec = z.object({
  type: z.literal("sliceSum"),
  prompt: z.string().min(1),
  mode: z.enum(["areaBetween", "disc", "washer", "sector"]),
  /** The estimate must land within this of the exact value. */
  tolerance: z.number().positive(),
  nStart: z.number().int().min(1).max(24).default(2),
  ruleStart: z.enum(["left", "right", "mid"]).default("left"),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** slopeField — a differential equation stops being an equation to SOLVE and becomes a set of
 * instructions a curve OBEYS. The field of little segments is the instruction ("at this point, go
 * this way"), and the learner drags the initial condition while a particular solution THREADS ITSELF
 * through the field. Infinitely many curves obey the same instructions — one for every starting
 * point — which is what the + C has been trying to tell them since C4.
 *
 * The equilibrium tasks are the payoff: at y = 4 on the logistic field every segment is flat, so the
 * solution never moves. That is not a curve that happens to be constant; it is the ONE curve the
 * instructions forbid from going anywhere. */
export const SlopeFieldSpec = z.object({
  type: z.literal("slopeField"),
  prompt: z.string().min(1),
  /** linear: dy/dx = x · exponential: dy/dx = 0.5y · decay: dy/dx = −0.5y · logistic: dy/dx = 1.8y(1 − y/4) */
  equation: z.enum(["linear", "exponential", "decay", "logistic"]),
  /** The starting y (at x = 0) the task asks for. */
  targetY0: z.number().int().min(0).max(8),
  startY0: z.number().int().min(0).max(8).default(1),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** taylorApprox — add terms one at a time and watch the polynomial HUG the curve outward from the
 * centre, and then PEEL AWAY. `terms` mode asks for the SMALLEST number of terms that gets inside a
 * tolerance (so "too many terms" is a live wrong path, not decoration). `radius` mode drags the
 * evaluation point instead and watches the individual terms xᵏ stop shrinking — at exactly |x| = 1
 * for the geometric series. That is the moment the interval of convergence stops being an algebraic
 * result and becomes a VISIBLE BOUNDARY where the approximation gives up. */
export const TaylorApproxSpec = z.object({
  type: z.literal("taylorApprox"),
  prompt: z.string().min(1),
  /** exp: eˣ (converges everywhere) · geometric: 1/(1 − x) (radius 1 — the whole point) */
  fn: z.enum(["exp", "geometric"]),
  mode: z.enum(["terms", "radius"]),
  /** terms: the point the polynomial is judged at, and how close it must come. */
  atX: z.number().default(1),
  tolerance: z.number().positive().default(0.01),
  /** terms: the SMALLEST n that lands inside the tolerance. */
  targetN: z.number().int().min(0).max(10).default(4),
  nStart: z.number().int().min(0).max(10).default(0),
  /** radius: the x (in tenths) at which the terms stop shrinking. */
  targetXTenths: z.number().int().min(1).max(15).default(10),
  xStart: z.number().int().min(1).max(15).default(3),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** algebraTiles — x-tiles and unit tiles, positive and negative; zero pairs cancel. Build a target
 * expression (coefficient of x, and the constant). */
export const AlgebraTilesSpec = z.object({
  type: z.literal("algebraTiles"),
  prompt: z.string().min(1),
  targetX: z.number().int(),
  targetConst: z.number().int(),
  maxTiles: z.number().int().positive().default(8),
  xStart: z.number().int().default(0),
  constStart: z.number().int().default(0),
  successFeedback: z.string().min(1),
  xFeedback: z.string().min(1),
  constFeedback: z.string().min(1),

  /* ── S211: the area workspace. EVERY field below is optional with NO `.default()`, so a spec
   * that omits them parses to exactly the object it always parsed to — no injected keys, no new
   * defaults appearing in an authored lesson's parsed form. All 27 authored instances are pinned
   * against their current parsed output in evaluate/schema regression tests. ── */

  /** x² tiles join the mat. Present only for a lesson that multiplies or factors; when absent the
   * engine is the two-population mat it has always been. */
  targetSquare: z.number().int().optional(),
  squareStart: z.number().int().optional(),

  /**
   * THE RECTANGLE. Its two edges are written as (x-part, unit-part) pairs, so `[1, 3]` is
   * `(x + 3)` and `[0, 4]` is the bare constant `4`. That one shape covers both lessons the
   * mandate asks for:
   *
   *   width [0, a], height [1, b]  →  a(x + b)          — the distributive law
   *   width [1, a], height [1, b]  →  (x + a)(x + b)    — factoring a trinomial
   *
   * The tiles inside are the PARTIAL PRODUCTS, which is just the multiplication table written
   * with tiles: `w₁h₁` x² tiles, `w₁h₀ + w₀h₁` x-tiles, `w₀h₀` unit tiles. Nothing else needs to
   * be authored, because nothing else is true.
   *
   * `mode` says which way the lesson runs. `distribute` starts with the rectangle whole and the
   * learner opens it into tiles (branch); `factor` starts with the tiles loose and the learner
   * gathers them into the rectangle (gather).
   */
  area: z
    .object({
      width: z.tuple([z.number().int(), z.number().int()]),
      height: z.tuple([z.number().int(), z.number().int()]),
      mode: z.enum(["distribute", "factor"])
    })
    .optional(),
  /** Reachable only with `area`: the rectangle was opened but the multiplier reached only some of
   * the terms — the partial-product misconception, named rather than merely marked wrong. */
  partialProductFeedback: z.string().min(1).optional(),
  /** Reachable only with `area` in `factor` mode: the tiles were gathered into a rectangle whose
   * edges do not multiply to what is on the mat. */
  frameMismatchFeedback: z.string().min(1).optional(),
  /**
   * S215 (defect A-M1). Reachable only with `area`: the learner pressed Check with the rectangle
   * still closed, or still empty. Without it that state fell through to `constFeedback` — "Check
   * the units… so it is −6" — which diagnoses a constant error they have not made and hands them
   * the answer outright. An author who opens a rectangle is the person who knows what that lesson
   * should say to someone who has not filled it yet.
   */
  unopenedFrameFeedback: z.string().min(1).optional()
});

/** The partial products of `(w₁x + w₀)(h₁x + h₀)` — the multiplication table, as tile counts.
 * Single source of truth for the renderer, the canonical model and the grader. */
export function algebraTilesPartials(
  width: readonly [number, number],
  height: readonly [number, number]
): { square: number; x: number; unit: number } {
  const [w1, w0] = width;
  const [h1, h0] = height;
  // `-0` is the same number as `0` and a different value to a deep-equality check; a tile count
  // must never carry a sign it does not mean.
  const z = (n: number) => (n === 0 ? 0 : n);
  return { square: z(w1 * h1), x: z(w1 * h0 + w0 * h1), unit: z(w0 * h0) };
}

/** 6.1 — Money board (compose mode): build an exact amount from a constrained
 * coin/bill tray. Values in CENTS throughout (decimal display is presentation).
 * Region-aware by TRAY: the denominations are data, not code. */
export const MoneyBoardSpec = z.object({
  type: z.literal("moneyBoard"),
  prompt: z.string().min(1),
  /** compose: build an exact amount from the tray (default — every pre-v2 step).
   * count: a fixed mixed collection is SHOWN; tapping coins builds a visible
   * skip-count chain (the strategy), and the graded act is the entered total.
   * change: a purchase — build paid − price from the tray. */
  mode: z.enum(["compose", "count", "change"]).default("compose"),
  /** Target amount in cents (compose). In change mode it is DERIVED as
   * paidCents − priceCents; author it only if you want the redundancy checked. */
  targetCents: z.number().int().positive().optional(),
  /** The tray: which denominations are offered and how many of each may be
   * used (compose/change). Constrained construction ("only nickels") is a
   * one-entry tray. */
  tray: z
    .array(
      z.object({
        /** cents value of the denomination */
        cents: z.number().int().positive(),
        /** display label, e.g. "quarter", "dime", "$1" */
        label: z.string().min(1),
        /** max of this denomination the learner may place */
        max: z.number().int().positive()
      })
    )
    .min(1)
    .optional(),
  /** count mode: the displayed collection, in display order. */
  show: z
    .array(
      z.object({
        cents: z.number().int().positive(),
        label: z.string().min(1),
        count: z.number().int().positive()
      })
    )
    .min(1)
    .optional(),
  /** count mode: the collection's total. Integrity re-derives it from show —
   * an authored value that contradicts the coins is rejected. */
  answerCents: z.number().int().positive().optional(),
  /** count mode: anticipated wrong ENTRIES with diagnosis (e.g. the
   * counted-the-coins total). */
  commonEntries: z
    .array(z.object({ cents: z.number().int().min(0), feedback: z.string().min(1) }))
    .default([]),
  /** count mode: fires when the tapped chain reaches the right total but the
   * typed entry disagrees — recount vs retype. */
  mismatchFeedback: z
    .string()
    .min(1)
    .default("Your coin chain and your typed answer disagree — check one against the other."),
  /** count mode: the wrong-entry fallback when no diagnosis matches. */
  fallbackFeedback: z.string().min(1).optional(),
  /** change mode: the purchase price and the amount paid. */
  priceCents: z.number().int().positive().optional(),
  paidCents: z.number().int().positive().optional(),
  /** Show the running total as $X.YY as well as cents — the decimal-notation
   * bridge. Off for the earliest cents-only lessons. */
  showDollars: z.boolean().default(false),
  /** Anticipated wrong TOTALS with diagnosis (e.g. the coins-counted-not-valued
   * total). Fires when the learner checks that exact total. */
  commonTotals: z
    .array(z.object({ cents: z.number().int().min(0), feedback: z.string().min(1) }))
    .default([]),
  /** Fires when the PILE SIZE equals the target's digit count intent — the
   * counting-coins-not-values misconception (e.g. target 25¢, learner places
   * 25 coins of mixed value). Optional because not every item anticipates it. */
  countFeedback: z.string().min(1).optional(),
  lowFeedback: z.string().min(1).optional(),
  highFeedback: z.string().min(1).optional(),
  successFeedback: z.string().min(1)
});

/** 6.2 — Fraction area grid: build a × b as row/column partitions of one unit
 * square; the overlap IS the product. The factors are stated; the learner's
 * job is the construction that makes the product visible. */
export const FractionGridSpec = z.object({
  type: z.literal("fractionGrid"),
  prompt: z.string().min(1),
  /** First factor a/b — built as ROWS (partition rows into den1, shade num1). */
  num1: z.number().int().positive(),
  den1: z.number().int().min(2).max(12),
  /** Second factor c/d — built as COLUMNS. */
  num2: z.number().int().positive(),
  den2: z.number().int().min(2).max(12),
  /** Diagnosis when the ROW build is wrong (wrong partition count or shading). */
  rowFeedback: z.string().min(1),
  /** Diagnosis when rows are right but the COLUMN build is wrong. */
  colFeedback: z.string().min(1),
  /** Anticipated wrong builds (e.g. added denominators) by their (rows, cols,
   * shadedRows, shadedCols) signature. */
  commonBuilds: z
    .array(
      z.object({
        rows: z.number().int().positive(),
        cols: z.number().int().positive(),
        shadeR: z.number().int().min(0),
        shadeC: z.number().int().min(0),
        feedback: z.string().min(1)
      })
    )
    .default([]),
  successFeedback: z.string().min(1)
});

/** 6.3 — Side-by-side fraction comparison (G3): two bars of the SAME width
 * (equal wholes enforced by construction). Tap the bigger bar, or "equal".
 * The developmental predecessor of rationalCompare — at this stage the bars
 * ARE the reasoning being built, so drawing them is the point (rationalCompare
 * deliberately hides them at G6–7; that ruling stands there). */
export const FractionCompareSpec = z.object({
  type: z.literal("fractionCompare"),
  prompt: z.string().min(1),
  left: z.object({ num: z.number().int().min(0), den: z.number().int().min(2).max(12) }),
  right: z.object({ num: z.number().int().min(0), den: z.number().int().min(2).max(12) }),
  /** Which is more. Integrity re-derives from the fractions. */
  answer: z.enum(["left", "right", "equal"]),
  /** Optional benchmark line drawn across both bars (e.g. 0.5). */
  benchmark: z.number().min(0).max(1).optional(),
  /** Show unit tick marks inside the bars. */
  showTicks: z.boolean().default(true),
  /** Diagnosis for tapping the LEFT bar when it is not the answer. */
  leftFeedback: z.string().min(1).optional(),
  /** Diagnosis for tapping the RIGHT bar when it is not the answer. */
  rightFeedback: z.string().min(1).optional(),
  /** Diagnosis for picking "equal" when they differ. */
  equalFeedback: z.string().min(1).optional(),
  successFeedback: z.string().min(1)
});

/** 6.5 — Odd/even pairing: chips pair up two at a time; the leftover settles
 * parity. "pair" mode pairs every chip (counts ≤ 20); "onesDigit" mode shows
 * tens as pre-paired rods (10 = 5 pairs, always) so only the ONES digit needs
 * pairing — the actual place-value shortcut, made visible. */
/** evalOrder — the precedence laboratory. The expression is shown as tappable tokens; tapping an
 * operator COLLAPSES it and its two neighbours into their result, so the learner watches the
 * expression shrink one operation at a time. Tapping in the wrong order is allowed on purpose:
 * `2 + 3 × 4` collapsed left-to-right visibly becomes `5 × 4` and then 20, which is precisely the
 * misconception these lessons anticipate — the wrong ORDER produces a wrong NUMBER on screen,
 * rather than a red X under an unchanged expression. Grading is on the final collapsed value, so
 * every authored wrong answer keeps its own diagnosis. */
/** columnCalc — the standard-algorithms laboratory. The problem renders as place-value columns;
 * the learner resolves them right to left by tapping, and REGROUPING is a physical move: a spawned
 * carry hovers as a token that must be TAPPED into the next column before that column resolves,
 * and a borrow is taken by TAPPING a top digit to break one of it into ten for its right neighbour
 * (a zero shakes — it has nothing to break — so the chain across zeros is learner-enacted, digit
 * by digit). Skipping the move is allowed on purpose: resolve the tens without committing the
 * waiting carry and 35 × 4 visibly finishes as 120; resolve an underflow column without borrowing
 * and 52 − 27 visibly finishes as 35, the classic small-from-large bug. The wrong PROCEDURE
 * produces a wrong NUMBER the learner watches assemble, and grading on the final value keeps every
 * authored slip's own diagnosis. The engine never computes the true answer on screen — it computes
 * only what the learner's moves compute. */
/** mixedRegroup — the unit-exchange laboratory. Wholes and parts are two registers on screen, and
 * the ONE legal move in both directions is the exchange 1 whole = den/den parts: tap a whole to
 * BREAK it into den parts, tap a full group of den parts to MAKE it a whole. That single mechanic
 * is the whole G4 mixed-number chapter — improper→mixed is making wholes, mixed→improper is
 * breaking them all, adding is making the carry, subtracting is breaking the borrow.
 *
 * Wrong procedures stay walkable on purpose. Stop making wholes early and 22/7 sits at 8/7 with a
 * whole still hiding inside it. Never make one at all and it sits at 22/7. Subtract a parts column
 * whose top is too small WITHOUT breaking a whole first and the engine writes bottom−top, the
 * classic backwards-subtraction bug. Resolve the whole column while a made-whole is still waiting
 * and it never joins the total. The engine never displays the true answer — it shows only what the
 * learner's exchanges build. */
export const MixedRegroupSpec = z.object({
  type: z.literal("mixedRegroup"),
  prompt: z.string().min(1),
  /** convert = regroup one value into a target form; add/subtract = two mixed numbers, like denominators. */
  mode: z.enum(["convert", "add", "subtract"]),
  den: z.number().int().min(2).max(12),
  /** The value being worked on (convert) or the first operand / minuend (add, subtract). */
  aWhole: z.number().int().nonnegative().max(20),
  aNum: z.number().int().nonnegative().max(144),
  /** Second operand — required for add/subtract, forbidden for convert. */
  bWhole: z.number().int().nonnegative().max(20).optional(),
  bNum: z.number().int().nonnegative().max(144).optional(),
  /** convert only: "mixed" = exchange up until the leftover is smaller than one whole;
   * "improper" = break every whole down into parts. */
  targetForm: z.enum(["mixed", "improper"]).optional(),
  /** Per-final-state misconception landings, keyed by the assembled (whole, num) the learner built. */
  commonResults: z
    .array(
      z.object({
        whole: z.number().int().nonnegative(),
        num: z.number().int().nonnegative(),
        feedback: z.string().min(1)
      })
    )
    .default([]),
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

export type MixedState = { whole: number; num: number };

/** The value a correct procedure produces, in the form the step asks for. */
export function mixedRegroupTruth(spec: {
  mode: "convert" | "add" | "subtract";
  den: number;
  aWhole: number;
  aNum: number;
  bWhole?: number;
  bNum?: number;
  targetForm?: "mixed" | "improper";
}): MixedState {
  const P = spec.aWhole * spec.den + spec.aNum;
  if (spec.mode === "convert")
    return spec.targetForm === "improper"
      ? { whole: 0, num: P }
      : { whole: Math.floor(P / spec.den), num: P % spec.den };
  const Q = (spec.bWhole ?? 0) * spec.den + (spec.bNum ?? 0);
  const T = spec.mode === "add" ? P + Q : P - Q;
  return { whole: Math.floor(T / spec.den), num: T % spec.den };
}

export const mixedKey = (s: MixedState): string => `${s.whole}|${s.num}`;

/** Every final (whole, num) reachable by some sequence of legal exchanges. Convert walks the whole
 * exchange ladder; subtract branches on how many wholes were broken before the parts column was
 * resolved (zero breaks on a too-small top = the backwards-subtraction bug); add branches on how
 * many waiting wholes were actually made before the whole column was resolved. The integrity gate
 * demands ≥ 2 members — a step with no exchange decision does not need this engine — and demands
 * every authored misconception be a member, since feedback no move sequence can fire is dead. */
export function mixedRegroupReachable(spec: {
  mode: "convert" | "add" | "subtract";
  den: number;
  aWhole: number;
  aNum: number;
  bWhole?: number;
  bNum?: number;
  targetForm?: "mixed" | "improper";
}): Set<string> {
  const out = new Set<string>();
  const P = spec.aWhole * spec.den + spec.aNum;
  if (spec.mode === "convert") {
    for (let k = 0; k * spec.den <= P; k++) out.add(mixedKey({ whole: k, num: P - k * spec.den }));
    return out;
  }
  const bW = spec.bWhole ?? 0;
  const bN = spec.bNum ?? 0;
  if (spec.mode === "subtract") {
    for (let breaks = 0; breaks <= spec.aWhole; breaks++) {
      const topNum = spec.aNum + breaks * spec.den;
      const wholes = spec.aWhole - breaks - bW;
      if (wholes < 0) break; // the whole column cannot go negative — that path is blocked
      const parts = topNum >= bN ? topNum - bN : bN - topNum; // no break taken on a small top = the bug
      out.add(mixedKey({ whole: wholes, num: parts }));
    }
    return out;
  }
  const sum = spec.aNum + bN;
  for (let made = 0; made * spec.den <= sum; made++)
    out.add(mixedKey({ whole: spec.aWhole + bW + made, num: sum - made * spec.den }));
  return out;
}

export const ColumnCalcSpec = z.object({
  type: z.literal("columnCalc"),
  prompt: z.string().min(1),
  op: z.enum(["add", "subtract", "multiply"]),
  /** First operand (top row). ≤ 6 digits so the grid stays legible at 360px. */
  a: z.number().int().positive().max(999999),
  /** Second operand: the bottom row for add/subtract (subtract requires a ≥ b); the single-digit
   * multiplier (2–9) for multiply. */
  b: z.number().int().positive().max(999999),
  /** Per-final-value misconception landings (e.g. 120 = "forgot the waiting carry",
   * 35 = "took the small digit from the large one"), checked before the generic fallback.
   * The integrity gate verifies each is reachable by some sequence of legal moves. */
  commonResults: z
    .array(z.object({ value: z.number().int().nonnegative(), feedback: z.string().min(1) }))
    .default([]),
  /** S116: how many of the rightmost digits sit AFTER the decimal point, for decimal
   * add/subtract. `a`, `b`, `commonResults` and the internal arithmetic all stay INTEGERS in the
   * smallest place — 8.60 + 0.75 is authored as a: 860, b: 75, decimals: 2 — so every carry,
   * borrow and reachability check is the exact integer machinery already in use, with no float
   * anywhere. Only the place LABELS and a rendered point change, which is precisely the lesson:
   * decimal columns are ordinary columns whose names continue past ones into tenths and
   * hundredths, and "line the points up" is just "line the places up".
   *
   * Deliberately add/subtract only. Multiplication's result carries aDecimals + bDecimals places
   * rather than sharing the operands' — 0.6 x 0.7 = 0.42 has more places than either factor — so
   * the answer row's point would sit at a different column from the operand rows'. That needs two
   * fields and a per-row point position; it is a separate enhancement, refused here rather than
   * half-implemented. */
  decimals: z.number().int().min(0).max(3).optional(),
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

/** True value of a columnCalc problem under correct arithmetic. */
export function columnCalcTruth(op: "add" | "subtract" | "multiply", a: number, b: number): number {
  return op === "add" ? a + b : op === "subtract" ? a - b : a * b;
}

const ccDigits = (n: number): number[] => String(n).split("").map(Number).reverse();

/** Every final value reachable by some sequence of legal moves. For add/multiply the choice per
 * spawned carry is commit-or-strand; for subtract the choice per underflow column is the correct
 * borrow-chain or the small-from-large bug. This set is what makes columnCalc a laboratory: the
 * integrity gate demands ≥ 2 members (a real regrouping decision to get wrong — a no-carry,
 * no-borrow problem is refused) and demands every authored misconception be a member (feedback
 * that no move sequence can fire is dead). */
export function columnCalcReachable(op: "add" | "subtract" | "multiply", a: number, b: number): Set<number> {
  const out = new Set<number>();
  const join = (acc: number[]): number => Number([...acc].reverse().join(""));
  if (op === "add" || op === "multiply") {
    const A = ccDigits(a);
    const B = op === "add" ? ccDigits(b) : [];
    const n = op === "add" ? Math.max(A.length, B.length) : A.length;
    const rec = (i: number, carryIn: number, acc: number[]): void => {
      if (i === n) {
        if (carryIn > 0) {
          out.add(join([...acc, ...ccDigits(carryIn)])); // final carry committed as leading digit(s)
          out.add(join(acc)); // final carry stranded
        } else out.add(join(acc));
        return;
      }
      const base = op === "add" ? (A[i] ?? 0) + (B[i] ?? 0) : (A[i] ?? 0) * b;
      const withCarry = base + carryIn;
      rec(i + 1, Math.floor(withCarry / 10), [...acc, withCarry % 10]);
      if (carryIn > 0) rec(i + 1, Math.floor(base / 10), [...acc, base % 10]); // carry stranded
    };
    rec(0, 0, []);
  } else {
    const A0 = ccDigits(a);
    const B = ccDigits(b);
    const n = A0.length;
    const rec = (i: number, top: number[], acc: number[]): void => {
      if (i === n) {
        out.add(join(acc));
        return;
      }
      const t = top[i] ?? 0;
      const bo = B[i] ?? 0;
      if (t >= bo) {
        rec(i + 1, top, [...acc, t - bo]);
        return;
      }
      rec(i + 1, top, [...acc, bo - t]); // buggy small-from-large
      let j = i + 1;
      while (j < n && top[j] === 0) j++;
      if (j < n) {
        const nt = [...top];
        nt[j] = (nt[j] ?? 0) - 1;
        for (let k = j - 1; k > i; k--) nt[k] = 9;
        nt[i] = t + 10;
        rec(i + 1, nt, [...acc, nt[i] - bo]); // correct borrow-chain
      }
    };
    rec(0, A0, []);
  }
  return out;
}

/** unitChain — the unit-conversion laboratory. The quantity is a fixed bar that never moves;
 * what the learner changes is the UNIT the ruler underneath is denominated in, one hop at a
 * time along an authored chain (km → m, or yd → ft → in). At each hop the learner must choose
 * the direction — multiply by the factor or divide by it — and the ruler relabels while the
 * bar and marker stay put. That is the whole lesson made visible: converting units never
 * changes the quantity, only how finely it is counted. The engine structurally removes the
 * "stopped mid-chain" and "added the factors" errors (Check is only offered at the target
 * unit, and factors are applied one hop at a time), which leaves DIRECTION as the one live
 * decision — exactly the misconception the authored feedback in this strand names. */
export const UnitChainSpec = z.object({
  type: z.literal("unitChain"),
  prompt: z.string().min(1),
  /** The quantity being re-denominated, in startUnit. */
  startValue: z.number(),
  startUnit: z.string().min(1),
  targetUnit: z.string().min(1),
  /** Ordered hops from startUnit to targetUnit. `bigger` names which end of the hop is the
   * larger unit and `factor` how many of the smaller make one of the bigger — a single source
   * of truth from which the correct direction at each hop is DERIVED, never authored twice. */
  hops: z
    .array(
      z.object({
        from: z.string().min(1),
        to: z.string().min(1),
        bigger: z.enum(["from", "to"]),
        factor: z.number().int().gt(1)
      })
    )
    .min(1)
    .max(3),
  /** Per-final-value misconception landings beyond the derived wrong-direction worlds. */
  commonResults: z
    .array(z.object({ value: z.number(), feedback: z.string().min(1) }))
    .default([]),
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

/** The converted value under the correct direction at every hop — the independent derivation
 * the grader and the integrity gate both use. Exported so conversion scripts can assert it
 * against the frozen authored answer before any write. */
export function unitChainAnswer(spec: { startValue: number; hops: { bigger: "from" | "to"; factor: number }[] }): number {
  let v = spec.startValue;
  for (const h of spec.hops) v = h.bigger === "from" ? v * h.factor : v / h.factor;
  return v;
}

/** Every final value reachable by a direction sequence, keyed by the sequence — the grader
 * walks these to name WHICH hop was crossed the wrong way. */
export function unitChainWorlds(spec: { startValue: number; hops: { bigger: "from" | "to"; factor: number }[] }): { dirs: ("mul" | "div")[]; value: number }[] {
  const out: { dirs: ("mul" | "div")[]; value: number }[] = [];
  const n = spec.hops.length;
  for (let mask = 0; mask < 1 << n; mask++) {
    let v = spec.startValue;
    const dirs: ("mul" | "div")[] = [];
    for (let i = 0; i < n; i++) {
      const mul = ((mask >> i) & 1) === 1;
      dirs.push(mul ? "mul" : "div");
      v = mul ? v * spec.hops[i].factor : v / spec.hops[i].factor;
    }
    out.push({ dirs, value: v });
  }
  return out;
}

/** slopeTriangle — the slope laboratory. Two lattice points A and B are FIXED on the grid; the
 * learner builds the slope triangle by setting its `run` and `rise`, and the line through A with
 * that ratio is drawn extended. The line visibly misses B until the ratio is right, so a wrong
 * slope is a wrong PICTURE rather than a wrong number.
 *
 * The grading rule is the lesson: ANY pair with the correct ratio is accepted — 1/2, 2/4 and
 * 3/6 all pass — so "the slope is constant along the line" stops being an assertion and becomes
 * the reason several different triangles all count as right. (Same precedent as fractionBar
 * accepting any equivalent fraction.) Zero rise and zero run are reachable, real states, which
 * is how horizontal and vertical lines get taught instead of merely named.
 */
export const SlopeTriangleSpec = z.object({
  type: z.literal("slopeTriangle"),
  prompt: z.string().min(1),
  /** A is the triangle's anchor; B is the point the line must pass through. */
  ax: z.number().int(),
  ay: z.number().int(),
  bx: z.number().int(),
  by: z.number().int(),
  runStart: z.number().int().default(1),
  riseStart: z.number().int().default(0),
  gridMax: z.number().int().positive().default(8),
  /** Legs the learner can dial; the range must reach at least one correct pair. */
  legMax: z.number().int().positive().default(8),
  /** Named misconception builds, matched on the EXACT (run, rise) pair. */
  commonPairs: z
    .array(z.object({ run: z.number().int(), rise: z.number().int(), feedback: z.string().min(1) }))
    .default([]),
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

/** The line's true leg deltas, and whether a built (run, rise) reproduces its slope. Both the
 * grader and the integrity gate call these, so the picture, the diagnosis and the gate can never
 * disagree about what "the same slope" means. */
export function slopeTriangleTruth(spec: { ax: number; ay: number; bx: number; by: number }): { run: number; rise: number } {
  return { run: spec.bx - spec.ax, rise: spec.by - spec.ay };
}

export function slopeTriangleMatches(
  spec: { ax: number; ay: number; bx: number; by: number },
  run: number,
  rise: number
): boolean {
  const t = slopeTriangleTruth(spec);
  if (run === 0 && rise === 0) return false; // no triangle at all
  if (t.run === 0) return run === 0 && rise !== 0; // vertical: undefined slope
  if (t.rise === 0) return rise === 0 && run !== 0; // horizontal: zero slope
  if (run === 0) return false;
  return run * t.rise === rise * t.run; // cross-multiplied equivalence, signs included
}

/** Reduced, human-readable slope of the authored line. */
export function slopeTriangleLabel(spec: { ax: number; ay: number; bx: number; by: number }): string {
  const t = slopeTriangleTruth(spec);
  if (t.run === 0) return "undefined";
  if (t.rise === 0) return "0";
  const g = (a: number, b: number): number => (b === 0 ? Math.abs(a) : g(b, a % b));
  const d = g(Math.abs(t.rise), Math.abs(t.run));
  const n = t.rise / d, m = t.run / d;
  const sign = n * m < 0 ? "\u2212" : "";
  const an = Math.abs(n), am = Math.abs(m);
  return am === 1 ? `${sign}${an}` : `${sign}${an}/${am}`;
}

export const EvalOrderSpec = z.object({
  type: z.literal("evalOrder"),
  prompt: z.string().min(1),
  /** Token stream: numeric literals, the operators + − × ÷ ^, and parentheses. */
  tokens: z.array(z.string().min(1)).min(3),
  /** The value the expression takes under standard precedence. The integrity gate re-derives
   * this from the tokens — an authored value that contradicts the expression is rejected. */
  target: z.number(),
  /** Per-final-value misconception landings (e.g. 20 = "you added before multiplying"),
   * checked before the generic fallback. */
  commonResults: z
    .array(z.object({ value: z.number(), feedback: z.string().min(1) }))
    .default([]),
  /** Fires when Check is pressed on a wrong final value that no landing names. */
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

const OP_PREC: Record<string, number> = { "+": 1, "−": 1, "-": 1, "×": 2, "*": 2, "÷": 2, "/": 2, "^": 3 };
export const isEvalOp = (t: string): boolean => Object.prototype.hasOwnProperty.call(OP_PREC, t);

export function applyEvalOp(op: string, a: number, b: number): number {
  switch (op) {
    case "+": return a + b;
    case "−": case "-": return a - b;
    case "×": case "*": return a * b;
    case "÷": case "/": return b === 0 ? NaN : a / b;
    case "^": return Math.pow(a, b);
    default: return NaN;
  }
}

/** Standard-precedence evaluation of a token stream (shunting-yard). Returns null when the
 * stream is malformed, so the integrity gate can reject an unparseable expression rather than
 * shipping a puzzle with no defined answer. */
export function evalTokens(tokens: string[]): number | null {
  const out: number[] = [];
  const ops: string[] = [];
  const reduce = () => {
    const op = ops.pop();
    const b = out.pop();
    const a = out.pop();
    if (op === undefined || a === undefined || b === undefined) return false;
    const v = applyEvalOp(op, a, b);
    if (!Number.isFinite(v)) return false;
    out.push(v);
    return true;
  };
  for (const t of tokens) {
    if (t === "(") ops.push(t);
    else if (t === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") if (!reduce()) return null;
      if (ops.pop() !== "(") return null;
    } else if (isEvalOp(t)) {
      while (ops.length && ops[ops.length - 1] !== "(") {
        const top = ops[ops.length - 1];
        const rightAssoc = t === "^";
        if (OP_PREC[top] > OP_PREC[t] || (OP_PREC[top] === OP_PREC[t] && !rightAssoc)) {
          if (!reduce()) return null;
        } else break;
      }
      ops.push(t);
    } else {
      const n = Number(t);
      if (!Number.isFinite(n)) return null;
      out.push(n);
    }
  }
  while (ops.length) {
    if (ops[ops.length - 1] === "(") return null;
    if (!reduce()) return null;
  }
  return out.length === 1 ? out[0] : null;
}


/** Every final value reachable by collapsing the expression one operator at a time in ANY legal
 * order. This is what makes evalOrder a laboratory rather than a calculator: if the set has only
 * one member the learner has no precedence decision to get wrong, and if an authored
 * misconception is not in the set it is dead feedback that can never fire. */
export function evalOrderReachable(tokens: string[]): Set<number> {
  const out = new Set<number>();
  const isNum = (t: string) => Number.isFinite(Number(t));
  const walk = (toks: string[], depth: number) => {
    if (depth > 8 || out.size > 64) return;
    if (toks.length === 1) {
      const n = Number(toks[0]);
      if (Number.isFinite(n)) out.add(Math.round(n * 1e6) / 1e6);
      return;
    }
    let moved = false;
    for (let i = 1; i < toks.length - 1; i++) {
      if (!isEvalOp(toks[i]) || !isNum(toks[i - 1]) || !isNum(toks[i + 1])) continue;
      const v = applyEvalOp(toks[i], Number(toks[i - 1]), Number(toks[i + 1]));
      if (!Number.isFinite(v)) continue;
      const next = [...toks.slice(0, i - 1), String(v), ...toks.slice(i + 2)];
      for (let j = 1; j < next.length - 1; j++)
        if (next[j - 1] === "(" && next[j + 1] === ")" && isNum(next[j])) {
          next.splice(j + 1, 1);
          next.splice(j - 1, 1);
          break;
        }
      moved = true;
      walk(next, depth + 1);
    }
    if (!moved) return;
  };
  walk(tokens, 0);
  return out;
}

export const OddEvenPairsSpec = z.object({
  type: z.literal("oddEvenPairs"),
  prompt: z.string().min(1),
  /** The number under test. pair mode: 1–20. onesDigit mode: 10–999. */
  n: z.number().int().min(1).max(999),
  mode: z.enum(["pair", "onesDigit"]).default("pair"),
  /** The parity answer. Integrity re-derives from n. */
  answer: z.enum(["odd", "even"]),
  /** Diagnosis for choosing the WRONG parity (the answer's own slot must be
   * absent — it can never fire). */
  oddFeedback: z.string().min(1).optional(),
  evenFeedback: z.string().min(1).optional(),
  /** Fires if they answer before pairing is finished (>1 unpaired chip). */
  unfinishedFeedback: z.string().min(1).default("Pair up every chip you can first — then the leftover settles it."),
  successFeedback: z.string().min(1)
});


/** lineRelationLab — construct parallel or perpendicular lines by rotating and translating one line.
 * Angle, slope, intersection angle, and equal-distance evidence update together. */
export const LineRelationLabSpec = z.object({
  type: z.literal("lineRelationLab"),
  prompt: z.string().min(1),
  targetRelation: z.enum(["parallel", "perpendicular"]),
  baseAngle: z.number().int().min(0).max(175).default(0),
  angleStart: z.number().int().min(0).max(175).default(35),
  offsetStart: z.number().int().min(-5).max(5).default(2),
  angleStep: z.number().int().positive().default(5),
  requiredMoves: z.number().int().min(1).max(20).default(2),
  successFeedback: z.string().min(1),
  angleFeedback: z.string().min(1),
  distanceFeedback: z.string().min(1)
});

/** triangleConstraintLab — compare congruence criteria by exposing whether the givens leave one or two possible triangles. */
export const TriangleConstraintLabSpec = z.object({
  type: z.literal("triangleConstraintLab"),
  prompt: z.string().min(1),
  targetCriterion: z.enum(["SSS", "SAS", "ASA", "AAS", "HL", "SSA"]),
  startCriterion: z.enum(["SSS", "SAS", "ASA", "AAS", "HL", "SSA"]).default("SSA"),
  sideA: z.number().positive().default(5),
  sideB: z.number().positive().default(8),
  targetAngle: z.number().min(20).max(140).default(60),
  angleStart: z.number().min(20).max(140).default(35),
  angleStep: z.number().positive().default(5),
  requiredMoves: z.number().int().min(2).max(20).default(3),
  successFeedback: z.string().min(1),
  criterionFeedback: z.string().min(1),
  angleFeedback: z.string().min(1),
  evidenceFeedback: z.string().min(1),
  /** S116 (a) — a locked relationship the learner can deliberately BREAK.
   *  isoscelesLegs: the two legs are held equal and the base angles stay equal through every
   *    drag; releasing the lock lets them diverge, which is the converse read backwards.
   *  midsegment: the midpoint join is drawn live and its length readout is permanently half
   *    the base — the theorem as a number that refuses to move. */
  constraint: z.enum(["isoscelesLegs", "midsegment"]).optional(),
  /** Required with `constraint`: what to say when the learner checks while the lock is off. */
  constraintFeedback: z.string().min(1).optional()
});

/** coordinateProofLab — position a vertex and build a proof from live slope, distance, and midpoint invariants. */
export const CoordinateProofLabSpec = z.object({
  type: z.literal("coordinateProofLab"),
  prompt: z.string().min(1),
  fixed: z.tuple([
    z.tuple([z.number(), z.number()]),
    z.tuple([z.number(), z.number()]),
    z.tuple([z.number(), z.number()])
  ]),
  target: z.tuple([z.number(), z.number()]),
  start: z.tuple([z.number(), z.number()]),
  targetClaim: z.enum(["parallelogram", "rectangle", "rhombus"]),
  gridMin: z.number().int().default(0),
  gridMax: z.number().int().default(10),
  requiredEvidence: z.array(z.enum(["slopes", "midpoints", "distances"])).min(1).default(["slopes", "midpoints"]),
  requiredMoves: z.number().int().min(2).max(20).default(3),
  successFeedback: z.string().min(1),
  positionFeedback: z.string().min(1),
  evidenceFeedback: z.string().min(1)
});

/** solidSliceLab — move a section plane through a solid and compare cross-sectional area at matching heights. */
export const SolidSliceLabSpec = z.object({
  type: z.literal("solidSliceLab"),
  prompt: z.string().min(1),
  solid: z.enum(["prism", "cylinder", "cone", "sphere"]),
  radius: z.number().positive().default(4),
  height: z.number().positive().default(8),
  baseArea: z.number().positive().optional(),
  targetFraction: z.number().min(0.05).max(0.95).default(0.5),
  startFraction: z.number().min(0).max(1).default(0.1),
  fractionStep: z.number().positive().max(0.25).default(0.05),
  tolerance: z.number().positive().max(0.25).default(0.05),
  comparisonRequired: z.boolean().default(true),
  requiredMoves: z.number().int().min(2).max(20).default(4),
  successFeedback: z.string().min(1),
  positionFeedback: z.string().min(1),
  comparisonFeedback: z.string().min(1),
  invariantFeedback: z.string().min(1)
});

/** triangleAngleLab — deform a triangle while all three angles and their invariant sum update live. */
export const TriangleAngleLabSpec = z.object({
  type: z.literal("triangleAngleLab"),
  prompt: z.string().min(1),
  fixedA: z.tuple([z.number(), z.number()]).default([1, 1]),
  fixedB: z.tuple([z.number(), z.number()]).default([7, 1]),
  startC: z.tuple([z.number(), z.number()]).default([4, 6]),
  targetAngleA: z.number().min(15).max(150),
  tolerance: z.number().positive().default(3),
  gridMax: z.number().int().min(6).max(12).default(8),
  requiredMoves: z.number().int().min(1).max(20).default(3),
  successFeedback: z.string().min(1),
  targetFeedback: z.string().min(1),
  invariantFeedback: z.string().min(1)
});

/** verticalLineScanner — sweep a vertical line across a relation and record the maximum intersections. */
export const VerticalLineScannerSpec = z.object({
  type: z.literal("verticalLineScanner"),
  prompt: z.string().min(1),
  relation: z.enum(["linear", "quadratic", "circle", "sideways", "discreteFunction", "discreteNonFunction"]),
  targetVerdict: z.enum(["function", "not-function"]),
  xMin: z.number().int().default(-5),
  xMax: z.number().int().default(5),
  scanStart: z.number().default(0),
  scanStep: z.number().positive().default(0.5),
  requiredSweeps: z.number().int().min(2).max(30).default(5),
  successFeedback: z.string().min(1),
  moreSweepFeedback: z.string().min(1),
  verdictFeedback: z.string().min(1)
});

/** covariationScrubber — one input controls context, table, graph, equation, and unit rate. */
export const CovariationScrubberSpec = z.object({
  type: z.literal("covariationScrubber"),
  prompt: z.string().min(1),
  a: z.number(),
  b: z.number().default(0),
  inputMin: z.number().int(),
  inputMax: z.number().int(),
  inputStart: z.number().int(),
  targetInput: z.number().int(),
  inputLabel: z.string().min(1),
  outputLabel: z.string().min(1),
  contextTemplate: z.string().min(1),
  successFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** samplingBiasLab — design a sample, vary size and selection method, and separate bias from variability. */
export const SamplingBiasLabSpec = z.object({
  type: z.literal("samplingBiasLab"),
  prompt: z.string().min(1),
  populationLabel: z.string().min(1),
  targetMethod: z.enum(["random", "stratified"]),
  targetSize: z.number().int().min(10).max(500),
  sizeMin: z.number().int().min(5).default(10),
  sizeMax: z.number().int().min(20).default(200),
  sizeStep: z.number().int().positive().default(10),
  sizeStart: z.number().int().min(5).default(20),
  requiredDraws: z.number().int().min(2).max(30).default(5),
  successFeedback: z.string().min(1),
  methodFeedback: z.string().min(1),
  sizeFeedback: z.string().min(1),
  drawsFeedback: z.string().min(1)
});

/** shapeFamilyBuilder — build a shape from attributes, not coordinates or prototype appearance. */
export const ShapeFamilyBuilderSpec = z.object({
  type: z.literal("shapeFamilyBuilder"),
  prompt: z.string().min(1),
  targetName: z.enum(["triangle", "quadrilateral", "rectangle", "square", "rhombus", "trapezoid", "pentagon", "hexagon"]),
  targetSides: z.number().int().min(3).max(6),
  targetRightAngles: z.number().int().min(0).max(4),
  targetEqualSides: z.number().int().min(0).max(4),
  targetParallelPairs: z.number().int().min(0).max(2),
  startSides: z.number().int().min(3).max(6).default(4),
  successFeedback: z.string().min(1),
  sidesFeedback: z.string().min(1),
  attributesFeedback: z.string().min(1)
});

/** shapeHierarchyLab — evidence-driven classification and hierarchy logic. The selected claim
 * changes the visible path, witness/counterexample, or triangle labels; it is not an MCQ skin. */
const ShapeHierarchyChoiceSpec = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  /** Hierarchy/verdict claim, or a stable joined label token for triangle mode. */
  claim: z.string().min(1),
  feedback: z.string().min(1),
  evidenceKind: z.enum(["path", "reverse", "example", "counterexample", "blocker", "classification", "calculation"]),
  evidenceText: z.string().min(1),
  highlightNodeIds: z.array(z.string().min(1)).default([])
});

export const ShapeHierarchyLabSpec = z.object({
  type: z.literal("shapeHierarchyLab"),
  prompt: z.string().min(1),
  mode: z.enum(["hierarchy", "triangle", "verdict"]),
  nodes: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    attributes: z.array(z.string().min(1)).default([])
  })).min(1).max(8),
  edges: z.array(z.tuple([z.string().min(1), z.string().min(1)])).default([]),
  /** hierarchy mode: the exact logical claim the authored prompt asks the learner to select. */
  answerClaim: z.string().min(1).optional(),
  propertyLabel: z.string().min(1).optional(),
  /** verdict mode: subset → always, overlap → sometimes, disjoint → never. */
  relation: z.enum(["subset", "overlap", "disjoint"]).optional(),
  subjectLabel: z.string().min(1).optional(),
  predicateLabel: z.string().min(1).optional(),
  witness: z.string().min(1).optional(),
  counterexample: z.string().min(1).optional(),
  blocker: z.string().min(1).optional(),
  /** triangle mode: fixed givens. Classification is independently re-derived from these values. */
  triangleSides: z.tuple([z.number().positive(), z.number().positive(), z.number().positive()]).optional(),
  triangleAngles: z.tuple([z.number().positive(), z.number().positive(), z.number().positive()]).optional(),
  triangleQuestion: z.enum(["side", "angle", "sideInclusive", "dual"]).optional(),
  choices: z.array(ShapeHierarchyChoiceSpec).min(3),
  fallbackFeedback: z.string().min(1),
  successFeedback: z.string().min(1)
});

function sameStringSet(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && [...a].sort().every((value, index) => value === [...b].sort()[index]);
}

export function shapeHierarchyTriangleLabels(spec: {
  triangleSides?: readonly [number, number, number];
  triangleAngles?: readonly [number, number, number];
  triangleQuestion?: "side" | "angle" | "sideInclusive" | "dual";
}): string[] {
  const sides = spec.triangleSides;
  const angles = spec.triangleAngles;
  const sideLabel = sides
    ? sides[0] === sides[1] && sides[1] === sides[2]
      ? "equilateral"
      : sides[0] === sides[1] || sides[0] === sides[2] || sides[1] === sides[2]
        ? "isosceles"
        : "scalene"
    : null;
  const angleLabel = angles
    ? angles.some((angle) => Math.abs(angle - 90) < 1e-9)
      ? "right"
      : Math.max(...angles) > 90
        ? "obtuse"
        : "acute"
    : null;
  if (spec.triangleQuestion === "side") return sideLabel ? [sideLabel] : [];
  if (spec.triangleQuestion === "angle") return angleLabel ? [angleLabel] : [];
  if (spec.triangleQuestion === "sideInclusive") return sideLabel === "equilateral" ? ["equilateral", "isosceles"] : sideLabel ? [sideLabel] : [];
  return [angleLabel, sideLabel].filter((value): value is string => value !== null);
}

export function shapeHierarchyChoiceCorrect(
  spec: {
    mode: "hierarchy" | "triangle" | "verdict";
    answerClaim?: string;
    relation?: "subset" | "overlap" | "disjoint";
    triangleSides?: readonly [number, number, number];
    triangleAngles?: readonly [number, number, number];
    triangleQuestion?: "side" | "angle" | "sideInclusive" | "dual";
  },
  choice: { claim: string }
): boolean {
  if (spec.mode === "hierarchy") return choice.claim === spec.answerClaim;
  if (spec.mode === "verdict") {
    const expected = spec.relation === "subset" ? "always" : spec.relation === "overlap" ? "sometimes" : "never";
    return choice.claim === expected;
  }
  return sameStringSet(choice.claim.split("+").filter(Boolean), shapeHierarchyTriangleLabels(spec));
}

/** unitRuler — align zero, choose a unit, and iterate equal units with no gaps or overlaps. */
export const UnitRulerSpec = z.object({
  type: z.literal("unitRuler"),
  prompt: z.string().min(1),
  objectStart: z.number().int().min(0).max(10),
  objectEnd: z.number().int().min(1).max(20),
  allowedUnitSizes: z.array(z.number().positive()).min(1),
  targetUnitSize: z.number().positive(),
  startUnitSize: z.number().positive(),
  requiredPlacements: z.number().int().min(1).max(20),
  /** Wrong unit counts that represent a named misconception (for example, reading the ruler's
   * end label as the length). Each count must be reachable on the same 0–20 ruler. */
  commonPlacements: z
    .array(z.object({ placements: z.number().int().min(0).max(20), feedback: z.string().min(1) }))
    .default([]),
  successFeedback: z.string().min(1),
  alignFeedback: z.string().min(1),
  gapOverlapFeedback: z.string().min(1),
  unitFeedback: z.string().min(1)
});



/** graphStoryLab — a finite qualitative graph language shared by graph reading and graph
 * construction. One pure segment truth generates geometry, grading, narration, reveal, and
 * accessibility text, so a curve cannot say one thing while the checker grades another. */
export const GraphStorySegmentKindSchema = z.enum([
  "riseGentle", "riseSteady", "riseSteep", "fallSteady", "flat",
  "riseConcaveUp", "riseConcaveDown", "fallConcaveUp", "fallConcaveDown"
]);
export type GraphStorySegmentKind = z.infer<typeof GraphStorySegmentKindSchema>;

export const GraphStorySegmentSpec = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: GraphStorySegmentKindSchema,
  meaning: z.string().min(1)
});

const GraphStoryChoiceSpec = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  claim: z.string().min(1),
  feedback: z.string().min(1)
});

const GraphStoryWrongSequenceSpec = z.object({
  label: z.string().min(1),
  kinds: z.array(GraphStorySegmentKindSchema).min(1).max(4),
  feedback: z.string().min(1)
});

export type GraphStoryGeometrySegment = {
  kind: GraphStorySegmentKind;
  path: string;
  start: readonly [number, number];
  end: readonly [number, number];
  labelAt: readonly [number, number];
};

const graphStoryDelta = (kind: GraphStorySegmentKind): number => {
  switch (kind) {
    case "riseGentle": return 0.45;
    case "riseSteady": return 0.8;
    case "riseSteep": return 1.25;
    case "fallSteady": return -0.8;
    case "flat": return 0;
    case "riseConcaveUp":
    case "riseConcaveDown": return 1;
    case "fallConcaveUp":
    case "fallConcaveDown": return -1;
  }
};

export const graphStoryKindLabel = (kind: GraphStorySegmentKind): string => ({
  riseGentle: "gentle rising line",
  riseSteady: "straight rising line",
  riseSteep: "steep rising line",
  fallSteady: "straight falling line",
  flat: "flat horizontal segment",
  riseConcaveUp: "rising curve that gets steeper",
  riseConcaveDown: "rising curve that gets flatter",
  fallConcaveUp: "falling curve that gets flatter",
  fallConcaveDown: "falling curve that gets steeper"
}[kind]);

/** SVG geometry derived only from the ordered segment language. Curves use cubic controls that
 * preserve the named concavity; every y coordinate is affinely normalized together, so relative
 * steepness and order survive resizing. */
export function graphStoryGeometry(
  kinds: readonly GraphStorySegmentKind[], width = 360, height = 220
): GraphStoryGeometrySegment[] {
  if (kinds.length === 0) return [];
  type Raw = { kind: GraphStorySegmentKind; x0: number; x1: number; y0: number; y1: number; c1?: number; c2?: number };
  const raw: Raw[] = [];
  let y = 0;
  for (let i = 0; i < kinds.length; i++) {
    const kind = kinds[i]!;
    const y0 = y;
    const y1 = y0 + graphStoryDelta(kind);
    const d = y1 - y0;
    const curve = kind.includes("Concave");
    const getsSteeper = kind === "riseConcaveUp" || kind === "fallConcaveDown";
    raw.push({
      kind, x0: i, x1: i + 1, y0, y1,
      ...(curve ? { c1: y0 + d * (getsSteeper ? 0.08 : 0.68), c2: y0 + d * (getsSteeper ? 0.32 : 0.92) } : {})
    });
    y = y1;
  }
  const ys = raw.flatMap((r) => [r.y0, r.y1, ...(r.c1 === undefined ? [] : [r.c1, r.c2!])]);
  const lo = Math.min(...ys), hi = Math.max(...ys), span = Math.max(hi - lo, 0.8);
  const padX = 34, padY = 26;
  const px = (x: number) => padX + (x / kinds.length) * (width - padX - 18);
  const py = (v: number) => height - padY - ((v - lo + (span - (hi - lo)) / 2) / span) * (height - padY - 18);
  const f = (n: number) => Number(n.toFixed(2));
  return raw.map((r) => {
    const x0 = f(px(r.x0)), x1 = f(px(r.x1)), y0 = f(py(r.y0)), y1 = f(py(r.y1));
    const path = r.c1 === undefined
      ? `M ${x0} ${y0} L ${x1} ${y1}`
      : `M ${x0} ${y0} C ${f(px(r.x0 + 0.34))} ${f(py(r.c1))} ${f(px(r.x0 + 0.68))} ${f(py(r.c2!))} ${x1} ${y1}`;
    return { kind: r.kind, path, start: [x0, y0] as const, end: [x1, y1] as const, labelAt: [f((x0 + x1) / 2), f(Math.min(y0, y1) - 8)] as const };
  });
}

const graphStoryDirectionClaim = (kind: GraphStorySegmentKind): string =>
  kind === "flat" ? "change:constant" : kind.startsWith("rise") ? "change:increasing" : "change:decreasing";

export type GraphStoryTruthInput = {
  mode: "read" | "build";
  axisContext: "distanceFromOrigin" | "generic" | "height" | "temperature" | "waterLevel" | "savings";
  distanceRule: "notDistance" | "awayOnly" | "mayReturn";
  segments: readonly { id: string; label: string; kind: GraphStorySegmentKind; meaning: string }[];
  readTask?: "flatMeaning" | "steepMeaning" | "directionMeaning" | "flatteningMeaning" | "locateStopped" | "storySummary";
  targetSegmentId?: string;
};

/** The semantic truth consumed by renderer, grader, reveal, narration, and audit. */
export function graphStoryTruth(spec: GraphStoryTruthInput, activeKinds?: readonly GraphStorySegmentKind[]) {
  const targetKinds = spec.segments.map((segment) => segment.kind);
  const target = spec.segments.find((segment) => segment.id === spec.targetSegmentId) ?? spec.segments[0]!;
  let answerClaim = `sequence:${targetKinds.join(">")}`;
  if (spec.mode === "read") {
    switch (spec.readTask) {
      case "flatMeaning": answerClaim = spec.axisContext === "distanceFromOrigin" ? "motion:stopped" : "change:constant"; break;
      case "steepMeaning": answerClaim = target.kind === "riseGentle" ? "rate:slower" : "rate:faster"; break;
      case "directionMeaning": answerClaim = graphStoryDirectionClaim(target.kind); break;
      case "flatteningMeaning": answerClaim = target.kind.startsWith("rise") ? "rate:increasing-more-slowly" : "rate:decreasing-more-slowly"; break;
      case "locateStopped": {
        const stopped = spec.segments.find((segment) => segment.kind === "flat");
        answerClaim = `section:${stopped?.label ?? "none"}`;
        break;
      }
      case "storySummary": answerClaim = `sequence:${targetKinds.join(">")}`; break;
      default: break;
    }
  }
  const kinds = activeKinds ?? targetKinds;
  return {
    targetKinds,
    activeKinds: [...kinds],
    answerClaim,
    geometry: graphStoryGeometry(kinds),
    targetGeometry: graphStoryGeometry(targetKinds),
    narration: kinds.length
      ? `The graph shows ${kinds.map(graphStoryKindLabel).join(", then ")}.`
      : "The graph has no stages assembled yet."
  };
}

export function graphStoryChoiceCorrect(spec: GraphStoryTruthInput, choice: { claim: string }): boolean {
  return graphStoryTruth(spec).answerClaim === choice.claim;
}

export function graphStorySequenceKey(kinds: readonly GraphStorySegmentKind[]): string {
  return kinds.join(">");
}


export type ProportionalReasoningTask =
  | "unitRate"
  | "bestRate"
  | "predictOutput"
  | "predictInput"
  | "steadyAssumption"
  | "testProportional"
  | "constant"
  | "scaleRatio"
  | "percentOf"
  | "discount"
  | "cheaperThenPredict";

const ProportionalPairSpec = z.tuple([z.number().finite(), z.number().finite()]);
const ProportionalSeriesSpec = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  pairs: z.array(ProportionalPairSpec).min(1).max(6)
});
const ProportionalChoiceSpec = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  claim: z.string().min(1).optional(),
  value: z.number().finite().optional(),
  feedback: z.string().min(1)
});
const ProportionalNumericErrorSpec = z.object({
  value: z.number().finite(),
  feedback: z.string().min(1)
});

export type ProportionalReasoningTruthInput = {
  task: ProportionalReasoningTask;
  answerMode: "numeric" | "choice";
  series: readonly { id: string; label: string; pairs: readonly (readonly [number, number])[] }[];
  targetSeriesId?: string;
  targetInput?: number;
  targetOutput?: number;
  percent?: number;
  optimize?: "min" | "max";
};

const proportionalRound = (value: number): number => Math.round(value * 1e12) / 1e12;
export const proportionalClaimForNumber = (value: number): string => `number:${proportionalRound(value)}`;

/** One proportional truth model drives tables, unit-rate comparison, prediction, percent, and
 * discount chains. Every mode reduces to one or more exact multiplicative stages; no authored
 * answer flag is consulted. */
export function proportionalReasoningTruth(spec: ProportionalReasoningTruthInput) {
  const series = spec.series.map((entry) => {
    const rates = entry.pairs.map(([x, y]) => proportionalRound(y / x));
    const constant = rates[0]!;
    const proportional = rates.every((rate) => Math.abs(rate - constant) < 1e-9);
    return { ...entry, rates, constant, proportional };
  });
  const target = series.find((entry) => entry.id === spec.targetSeriesId) ?? series[0]!;
  const ranked = [...series].sort((a, b) => a.constant - b.constant || a.id.localeCompare(b.id));
  const best = spec.optimize === "max" ? ranked.at(-1)! : ranked[0]!;
  let answerNumber: number | undefined;
  let answerClaim: string | undefined;
  const stages: Array<{ label: string; value: number }> = [];
  switch (spec.task) {
    case "unitRate":
    case "constant":
      answerNumber = target.constant;
      stages.push({ label: "constant rate", value: target.constant });
      break;
    case "predictOutput":
    case "scaleRatio":
      answerNumber = proportionalRound(target.constant * (spec.targetInput ?? 0));
      stages.push({ label: "constant rate", value: target.constant }, { label: "scaled output", value: answerNumber });
      break;
    case "predictInput":
      answerNumber = proportionalRound((spec.targetOutput ?? 0) / target.constant);
      stages.push({ label: "constant rate", value: target.constant }, { label: "required input", value: answerNumber });
      break;
    case "cheaperThenPredict":
      answerNumber = proportionalRound(best.constant * (spec.targetInput ?? 0));
      answerClaim = `series:${best.id}`;
      stages.push({ label: "winning unit rate", value: best.constant }, { label: "predicted total", value: answerNumber });
      break;
    case "percentOf":
      answerNumber = proportionalRound((spec.targetInput ?? 0) * (spec.percent ?? 0) / 100);
      stages.push({ label: "per-100 rate", value: (spec.percent ?? 0) / 100 }, { label: "percent amount", value: answerNumber });
      break;
    case "discount": {
      const subtotal = proportionalRound(target.constant * (spec.targetInput ?? 0));
      const discount = proportionalRound(subtotal * (spec.percent ?? 0) / 100);
      answerNumber = proportionalRound(subtotal - discount);
      stages.push({ label: "subtotal", value: subtotal }, { label: "discount", value: discount }, { label: "final total", value: answerNumber });
      break;
    }
    case "bestRate":
      answerClaim = `series:${best.id}`;
      stages.push({ label: "winning unit rate", value: best.constant });
      break;
    case "steadyAssumption":
      answerClaim = target.proportional ? "assumption:holds" : "assumption:failed";
      break;
    case "testProportional":
      answerClaim = target.proportional ? "proportional:yes" : "proportional:no";
      break;
  }
  if (answerNumber !== undefined && answerClaim === undefined) answerClaim = proportionalClaimForNumber(answerNumber);
  return { series, target, best, answerNumber, answerClaim, stages };
}

export function proportionalReasoningExplorationKeys(spec: ProportionalReasoningTruthInput): string[] {
  const truth = proportionalReasoningTruth(spec);
  return [
    ...truth.series.flatMap((entry) => entry.pairs.map((_, index) => `${entry.id}:${index}`)),
    ...truth.stages.map((_, index) => `stage:${index}`),
  ];
}

export function proportionalReasoningChoiceCorrect(
  spec: ProportionalReasoningTruthInput,
  choice: { claim?: string; value?: number }
): boolean {
  const truth = proportionalReasoningTruth(spec);
  if (typeof choice.value === "number" && typeof truth.answerNumber === "number")
    return Math.abs(choice.value - truth.answerNumber) < 1e-9;
  return Boolean(choice.claim && truth.answerClaim === choice.claim);
}

export const ProportionalReasoningLabSpec = z.object({
  type: z.literal("proportionalReasoningLab"),
  task: z.enum(["unitRate", "bestRate", "predictOutput", "predictInput", "steadyAssumption", "testProportional", "constant", "scaleRatio", "percentOf", "discount", "cheaperThenPredict"]),
  answerMode: z.enum(["numeric", "choice"]),
  prompt: z.string().min(1),
  xLabel: z.string().min(1),
  yLabel: z.string().min(1),
  series: z.array(ProportionalSeriesSpec).min(1).max(4),
  targetSeriesId: z.string().optional(),
  targetInput: z.number().finite().optional(),
  targetOutput: z.number().finite().optional(),
  percent: z.number().finite().min(0).max(100).optional(),
  optimize: z.enum(["min", "max"]).optional(),
  answerUnit: z.string().optional(),
  tolerance: z.number().nonnegative().default(0),
  choices: z.array(ProportionalChoiceSpec).max(5).default([]),
  numericErrors: z.array(ProportionalNumericErrorSpec).max(6).default([]),
  requiredExplorations: z.number().int().min(1).max(12).default(1),
  successFeedback: z.string().min(1),
  explorationFeedback: z.string().min(1),
  fallbackFeedback: z.string().min(1)
});


/** placeValueTransformLab — one base-ten position model for every selected Session-145 task.
 * Digits keep their place while the decimal/power frame moves. The same derived state drives
 * shifting, aligned comparison, rounding, exponent arithmetic, scientific form, and equivalent
 * decimal division; task modes remain explicit so adjacent procedures are never conflated. */
export type PlaceValueTransformTask =
  | "shift" | "identifyShift" | "compare" | "decidingPlace"
  | "round" | "roundPartsThenSum" | "roundMethod" | "roundGapCause"
  | "decimalDivision" | "divisionFirstMove" | "exponentChain"
  | "placeExponent" | "scientificForm" | "evaluatePowerTen";
export type PlaceValueRelation = "lt" | "eq" | "gt";
export type PlaceValueExponentOp = "add" | "subtract";
export type PlaceValueTransformTruthInput = {
  task: PlaceValueTransformTask;
  values: readonly number[];
  targetExponent?: number;
  shiftExponent?: number;
  exponentOps?: readonly PlaceValueExponentOp[];
};
export type PlaceValueTruthStage = { key: string; label: string; value: string };

const placeValuePow10 = (exponent: number): number => Math.pow(10, exponent);
const placeValueClean = (value: number): number => {
  const rounded = Math.round(value * 1e12) / 1e12;
  return Object.is(rounded, -0) ? 0 : rounded;
};
export function placeValueRoundToExponent(value: number, exponent: number): number {
  const unit = placeValuePow10(exponent);
  return placeValueClean(Math.round((value + Number.EPSILON * Math.sign(value || 1)) / unit) * unit);
}
export function placeValueExponentLabel(exponent: number): string {
  const named: Record<number,string> = {6:"millions",5:"hundred-thousands",4:"ten-thousands",3:"thousands",2:"hundreds",1:"tens",0:"ones",[-1]:"tenths",[-2]:"hundredths",[-3]:"thousandths",[-4]:"ten-thousandths",[-5]:"hundred-thousandths",[-6]:"millionths"};
  return named[exponent] ?? `10^${exponent} place`;
}
export function placeValueDigitAt(value: number, exponent: number): number {
  const scaled = Math.abs(value) / placeValuePow10(exponent);
  return Math.floor(scaled + 1e-9) % 10;
}
export function placeValueDecidingExponent(left: number, right: number): number {
  const magnitude = Math.max(Math.abs(left), Math.abs(right), 1e-12);
  const maxExponent = Math.max(0, Math.floor(Math.log10(magnitude)));
  for (let exponent=maxExponent; exponent>=-12; exponent--)
    if (placeValueDigitAt(left,exponent)!==placeValueDigitAt(right,exponent)) return exponent;
  return -12;
}
function placeValueIntegerScale(value: number): number {
  for (let exponent=0; exponent<=12; exponent++)
    if (Math.abs(value*placeValuePow10(exponent)-Math.round(value*placeValuePow10(exponent)))<1e-9) return exponent;
  return 12;
}
function placeValueScientific(value: number): { coefficient:number; exponent:number } {
  if (value===0) return {coefficient:0,exponent:0};
  const exponent=Math.floor(Math.log10(Math.abs(value)));
  return {coefficient:placeValueClean(value/placeValuePow10(exponent)),exponent};
}
function placeValueClaimForNumber(value: number): string { return `number:${placeValueClean(value)}`; }

export function placeValueTransformTruth(spec: PlaceValueTransformTruthInput): {
  answerNumber?: number; answerClaim?: string; relation?: PlaceValueRelation;
  stages: PlaceValueTruthStage[]; decidingExponent?: number; scaleExponent?: number;
} {
  const values=[...spec.values];
  const stages: PlaceValueTruthStage[]=[];
  let answerNumber:number|undefined, answerClaim:string|undefined, relation:PlaceValueRelation|undefined;
  let decidingExponent:number|undefined, scaleExponent:number|undefined;
  const fmt=(n:number)=>Number.isInteger(n)?String(n):String(placeValueClean(n));
  switch(spec.task){
    case "shift": {
      const start=values[0]??0, shift=spec.shiftExponent??0;
      for(let step=1;step<=Math.abs(shift);step++){
        const signed=shift>0?step:-step;
        stages.push({key:`shift:${step}`,label:`${shift>0?"left":"right"} place move ${step}`,value:fmt(start*placeValuePow10(signed))});
      }
      answerNumber=placeValueClean(start*placeValuePow10(shift));
      break;
    }
    case "identifyShift": {
      const [start=0,end=0]=values;
      const ratio=start===0?Number.NaN:end/start;
      const shift=Number.isFinite(ratio)&&ratio>0?Math.round(Math.log10(ratio)):0;
      stages.push({key:"compare:start",label:"starting value",value:fmt(start)},{key:"compare:end",label:"ending value",value:fmt(end)});
      answerClaim=`shift:${shift}`;
      break;
    }
    case "compare":
    case "decidingPlace": {
      const [left=0,right=0]=values;
      relation=Math.abs(left-right)<1e-12?"eq":left<right?"lt":"gt";
      decidingExponent=placeValueDecidingExponent(left,right);
      const maxExponent=Math.max(0,Math.floor(Math.log10(Math.max(Math.abs(left),Math.abs(right),1e-12))));
      for(let exponent=maxExponent;exponent>=decidingExponent;exponent--)
        stages.push({key:`place:${exponent}`,label:placeValueExponentLabel(exponent),value:`${placeValueDigitAt(left,exponent)} vs ${placeValueDigitAt(right,exponent)}`});
      answerClaim=spec.task==="compare"?`relation:${relation}`:`place:${decidingExponent}`;
      break;
    }
    case "round": {
      const exact=placeValueClean(values.reduce((sum,value)=>sum+value,0));
      const exponent=spec.targetExponent??0;
      const decider=placeValueDigitAt(exact,exponent-1);
      answerNumber=placeValueRoundToExponent(exact,exponent);
      stages.push({key:"round:exact",label:values.length>1?"exact combined value":"exact value",value:fmt(exact)},
        {key:"round:target",label:`rounding place (${placeValueExponentLabel(exponent)})`,value:String(placeValueDigitAt(exact,exponent))},
        {key:"round:decider",label:`deciding digit (${placeValueExponentLabel(exponent-1)})`,value:String(decider)});
      break;
    }
    case "roundPartsThenSum": {
      const exponent=spec.targetExponent??0;
      const rounded=values.map((value)=>placeValueRoundToExponent(value,exponent));
      rounded.forEach((value,index)=>stages.push({key:`round:part:${index}`,label:`rounded part ${index+1}`,value:fmt(value)}));
      answerNumber=placeValueClean(rounded.reduce((sum,value)=>sum+value,0));
      stages.push({key:"round:sum",label:"sum of rounded parts",value:fmt(answerNumber)});
      break;
    }
    case "roundMethod": {
      const exponent=spec.targetExponent??0;
      const exact=values.reduce((sum,value)=>sum+value,0);
      const exactRounded=placeValueRoundToExponent(exact,exponent);
      const parts=values.reduce((sum,value)=>sum+placeValueRoundToExponent(value,exponent),0);
      stages.push({key:"method:exact",label:"add exact values, then round",value:fmt(exactRounded)},
        {key:"method:parts",label:"round parts, then add",value:fmt(parts)});
      answerClaim="method:exact-then-round";
      break;
    }
    case "roundGapCause": {
      const exponent=spec.targetExponent??0;
      const directions=values.map((value)=>Math.sign(placeValueRoundToExponent(value,exponent)-value));
      const key=directions.every((d)=>d>0)?"both-up":directions.every((d)=>d<0)?"both-down":"mixed";
      values.forEach((value,index)=>stages.push({key:`gap:part:${index}`,label:`part ${index+1} rounding`,value:`${fmt(value)} → ${fmt(placeValueRoundToExponent(value,exponent))}`}));
      stages.push({key:"gap:exact",label:"exact total rounded once",value:fmt(placeValueRoundToExponent(values.reduce((a,b)=>a+b,0),exponent))});
      answerClaim=`bias:${key}`;
      break;
    }
    case "decimalDivision": {
      const [dividend=0,divisor=1]=values;
      scaleExponent=placeValueIntegerScale(divisor);
      const scale=placeValuePow10(scaleExponent);
      if(scaleExponent>0) stages.push({key:"division:scale",label:`scale both by 10^${scaleExponent}`,value:`${fmt(dividend*scale)} ÷ ${fmt(divisor*scale)}`});
      else stages.push({key:"division:place",label:"align quotient place",value:`${fmt(dividend)} ÷ ${fmt(divisor)}`});
      answerNumber=placeValueClean(dividend/divisor);
      stages.push({key:"division:quotient",label:"quotient",value:fmt(answerNumber)});
      break;
    }
    case "divisionFirstMove": {
      const [dividend=0,divisor=1]=values;
      scaleExponent=placeValueIntegerScale(divisor);
      const scale=placeValuePow10(scaleExponent);
      stages.push({key:"division:source",label:"original division",value:`${fmt(dividend)} ÷ ${fmt(divisor)}`},
        {key:"division:scale",label:"equal scaling",value:`${fmt(dividend*scale)} ÷ ${fmt(divisor*scale)}`});
      answerClaim=`scale:${scaleExponent}`;
      break;
    }
    case "exponentChain": {
      let total=values[0]??0;
      stages.push({key:"exponent:0",label:"starting exponent",value:fmt(total)});
      for(let index=1;index<values.length;index++){
        const op=spec.exponentOps?.[index-1]??"add";
        total=op==="add"?total+(values[index]??0):total-(values[index]??0);
        stages.push({key:`exponent:${index}`,label:`${op} ${fmt(values[index]??0)}`,value:fmt(total)});
      }
      answerNumber=placeValueClean(total);
      break;
    }
    case "placeExponent": {
      const exponent=spec.targetExponent??0;
      stages.push({key:"power:place",label:placeValueExponentLabel(exponent),value:`10^${exponent}`});
      answerClaim=`place-exponent:${exponent}`;
      break;
    }
    case "scientificForm": {
      const scientific=placeValueScientific(values[0]??0);
      stages.push({key:"scientific:coefficient",label:"single nonzero digit coefficient",value:fmt(scientific.coefficient)},
        {key:"scientific:exponent",label:"place exponent",value:String(scientific.exponent)});
      answerClaim=`scientific:${scientific.coefficient}:${scientific.exponent}`;
      break;
    }
    case "evaluatePowerTen": {
      const coefficient=values[0]??0, exponent=spec.targetExponent??0;
      stages.push({key:"power:coefficient",label:"coefficient",value:fmt(coefficient)},
        {key:"power:shift",label:`multiply by 10^${exponent}`,value:`${Math.abs(exponent)} place${Math.abs(exponent)===1?"":"s"} ${exponent>=0?"left":"right"}`});
      answerNumber=placeValueClean(coefficient*placeValuePow10(exponent));
      break;
    }
  }
  if(answerNumber!==undefined&&!answerClaim) answerClaim=placeValueClaimForNumber(answerNumber);
  return {answerNumber,answerClaim,relation,stages,decidingExponent,scaleExponent};
}
export function placeValueTransformExplorationKeys(spec: PlaceValueTransformTruthInput): string[] {
  return placeValueTransformTruth(spec).stages.map((stage)=>stage.key);
}
export function placeValueTransformChoiceCorrect(spec: PlaceValueTransformTruthInput, choice:{claim?:string;value?:number}): boolean {
  const truth=placeValueTransformTruth(spec);
  if(typeof choice.value==="number"&&typeof truth.answerNumber==="number") return Math.abs(choice.value-truth.answerNumber)<1e-9;
  return Boolean(choice.claim&&choice.claim===truth.answerClaim);
}
const PlaceValueTransformChoiceSpec=z.object({id:z.string().min(1),label:z.string().min(1),claim:z.string().min(1).optional(),value:z.number().finite().optional(),feedback:z.string().min(1)});
const PlaceValueTransformNumericErrorSpec=z.object({value:z.number().finite(),feedback:z.string().min(1)});
export const PlaceValueTransformLabSpec = z.object({
  type: z.literal("placeValueTransformLab"),
  task:z.enum(["shift","identifyShift","compare","decidingPlace","round","roundPartsThenSum","roundMethod","roundGapCause","decimalDivision","divisionFirstMove","exponentChain","placeExponent","scientificForm","evaluatePowerTen"]),
  answerMode:z.enum(["numeric","choice"]),
  prompt:z.string().min(1),
  values:z.array(z.number().finite()).min(1).max(6),
  targetExponent:z.number().int().min(-12).max(12).optional(),
  shiftExponent:z.number().int().min(-12).max(12).optional(),
  exponentOps:z.array(z.enum(["add","subtract"])).max(5).default([]),
  answerUnit:z.string().optional(),
  tolerance:z.number().nonnegative().default(0),
  choices:z.array(PlaceValueTransformChoiceSpec).max(5).default([]),
  numericErrors:z.array(PlaceValueTransformNumericErrorSpec).max(6).default([]),
  requiredExplorations:z.number().int().min(1).max(12).default(1),
  successFeedback:z.string().min(1),
  explorationFeedback:z.string().min(1),
  fallbackFeedback:z.string().min(1)
});






/** pointSetReasoningLab — one finite point-set truth model for Session 150.
 * Coordinate stories and one-dimensional data spreads both become labelled observations. The same
 * state derives axis meaning, point reading, coordinate distance, constant-step extension, path
 * length, endpoints, range, range blindness, and outlier-driven range updates.
 *
 * S237 adds `unitRate`: read a point off a proportional graph and derive y ÷ x. It exists because
 * 45 authored steps across seven lessons ask a learner to read a rate FROM A GRAPH through a bare
 * numeric box with no graph on screen — `figure` takes a static registry name so it cannot show
 * (4, 20) on one step and (2, 18) on the next, and `plotPoint` grades plotting rather than a typed
 * rate. This task is the smallest thing that draws the point and grades the number. It is the only
 * task that asserts a relationship BETWEEN the plotted points rather than reading them
 * independently, so integrity checking requires every point to sit on the one line through the
 * origin: a picture that disagrees with the derived rate is worse than no picture. */
export type PointSetReasoningTask =
  | "axisMeaning" | "axisDistance" | "pointRead" | "sequenceExtend" | "pathLength" | "pointMeaning"
  | "rangeEndpoints" | "rangeValue" | "rangeBlindness" | "rangeUpdate" | "unitRate";
export type PointSetObservation = { id:string; label:string; x:number; y?:number };
export type PointSetSeries = { id:string; label:string; points:readonly PointSetObservation[] };
export type PointSetReasoningTruthInput = {
  task:PointSetReasoningTask; xLabel:string; yLabel?:string; sets:readonly PointSetSeries[];
  targetSetId?:string; targetPointId?:string; targetAxis?:"x"|"y"; targetX?:number;
  pathPointIds?:readonly string[]; addedValue?:number; answerUnit?:string;
};
export type PointSetReasoningStage = { key:string; label:string; value:string };
const pointSetClean=(value:number):number=>{const rounded=Math.round(value*1e12)/1e12;return Object.is(rounded,-0)?0:rounded};
const pointSetFmt=(value:number):string=>Number.isInteger(value)?String(value):String(+value.toFixed(6));
export function pointSetReasoningTruth(spec:PointSetReasoningTruthInput){
  const target=spec.sets.find(set=>set.id===spec.targetSetId)??spec.sets[0]!;
  const point=(id?:string)=>target.points.find(item=>item.id===id)??target.points[0]!;
  const values=target.points.map(item=>item.x);
  const stages:PointSetReasoningStage[]=[];let answerNumber:number|undefined;let answerClaim:string|undefined;
  switch(spec.task){
    case "axisMeaning":{const axis=spec.targetAxis??"x",label=axis==="x"?spec.xLabel:(spec.yLabel??"y");const p=point(spec.targetPointId);stages.push({key:`axis:${axis}`,label:`read the ${axis}-axis meaning`,value:label},{key:`point:${p.id}`,label:"locate the named point",value:`(${pointSetFmt(p.x)}, ${pointSetFmt(p.y??0)})`});answerClaim=`axis:${axis}:${label}`;break}
    case "axisDistance":{const ids=spec.pathPointIds??target.points.slice(0,2).map(p=>p.id),a=point(ids[0]),b=point(ids[1]);const dx=Math.abs(b.x-a.x),dy=Math.abs((b.y??0)-(a.y??0));stages.push({key:`point:${a.id}`,label:"read the first endpoint",value:`(${pointSetFmt(a.x)}, ${pointSetFmt(a.y??0)})`},{key:`point:${b.id}`,label:"read the second endpoint",value:`(${pointSetFmt(b.x)}, ${pointSetFmt(b.y??0)})`},{key:"distance:changes",label:"measure coordinate changes",value:`|Δx|=${pointSetFmt(dx)}, |Δy|=${pointSetFmt(dy)}`},{key:"distance:total",label:"combine the travelled change",value:`${pointSetFmt(dx)} + ${pointSetFmt(dy)} = ${pointSetFmt(dx+dy)}`});answerNumber=pointSetClean(dx+dy);break}
    case "pointRead":{const p=point(spec.targetPointId),axis=spec.targetAxis??"y";stages.push({key:`point:${p.id}`,label:"locate the target observation",value:`(${pointSetFmt(p.x)}, ${pointSetFmt(p.y??0)})`},{key:`axis:${axis}`,label:`read the ${axis}-coordinate`,value:axis==="x"?pointSetFmt(p.x):pointSetFmt(p.y??0)});answerNumber=axis==="x"?p.x:(p.y??0);break}
    case "sequenceExtend":{const pts=[...target.points].sort((a,b)=>a.x-b.x);const a=pts[0]!,b=pts[1]!,rate=pointSetClean(((b.y??0)-(a.y??0))/(b.x-a.x)),tx=spec.targetX??(pts.at(-1)!.x+1),ty=pointSetClean((a.y??0)+rate*(tx-a.x));for(const p of pts)stages.push({key:`point:${p.id}`,label:`read ${p.label}`,value:`(${pointSetFmt(p.x)}, ${pointSetFmt(p.y??0)})`});stages.push({key:"sequence:rate",label:"derive the constant step",value:`${pointSetFmt(rate)} ${spec.yLabel??"output"} per ${spec.xLabel}`},{key:"sequence:extend",label:"extend to the target input",value:`${spec.xLabel} ${pointSetFmt(tx)} → ${pointSetFmt(ty)}`});answerNumber=ty;break}
    case "unitRate":{const p=point(spec.targetPointId),py=p.y??0;if(p.x===0)throw new Error("unitRate needs a target point with a nonzero input value");const rate=pointSetClean(py/p.x);stages.push({key:"axis:x",label:"name the horizontal variable",value:spec.xLabel},{key:"axis:y",label:"name the vertical variable",value:spec.yLabel??"output"},{key:`point:${p.id}`,label:"read the plotted point",value:`(${pointSetFmt(p.x)}, ${pointSetFmt(py)})`},{key:"rate:origin",label:"check the line through the origin",value:`(0, 0) and (${pointSetFmt(p.x)}, ${pointSetFmt(py)}) lie on one straight line`},
      // The unit phrase comes from the authored answerUnit, never from `${yLabel} per ${xLabel}` —
      // that composition printed "5 miles per hours" the first time it was read, which is the
      // derived-English-morphology defect CLAUDE.md bans outright.
      {key:"rate:unit",label:"divide the output by the input",value:`${pointSetFmt(py)} ÷ ${pointSetFmt(p.x)} = ${pointSetFmt(rate)}${spec.answerUnit?` ${spec.answerUnit}`:""}`});answerNumber=rate;break}
    case "pathLength":{const ids=spec.pathPointIds??target.points.map(p=>p.id);let total=0;for(let i=0;i<ids.length;i++){const q=point(ids[i]);stages.push({key:`point:${q.id}`,label:`read path point ${i+1}`,value:`(${pointSetFmt(q.x)}, ${pointSetFmt(q.y??0)})`});if(i){const prev=point(ids[i-1]),leg=Math.abs(q.x-prev.x)+Math.abs((q.y??0)-(prev.y??0));total+=leg;stages.push({key:`path:leg:${i}`,label:`measure leg ${i}`,value:pointSetFmt(leg)})}}stages.push({key:"path:total",label:"add all path legs",value:pointSetFmt(total)});answerNumber=pointSetClean(total);break}
    case "pointMeaning":{const p=point(spec.targetPointId);stages.push({key:"axis:x",label:"name the horizontal variable",value:spec.xLabel},{key:"axis:y",label:"name the vertical variable",value:spec.yLabel??"y"},{key:`point:${p.id}`,label:"pair the two meanings",value:`${spec.xLabel}=${pointSetFmt(p.x)}, ${spec.yLabel??"y"}=${pointSetFmt(p.y??0)}`});answerClaim=`point:${pointSetFmt(p.x)}:${pointSetFmt(p.y??0)}:${spec.xLabel}:${spec.yLabel??"y"}`;break}
    case "rangeEndpoints":
    case "rangeValue":{const min=Math.min(...values),max=Math.max(...values),range=pointSetClean(max-min);stages.push({key:"range:min",label:"identify the minimum",value:pointSetFmt(min)},{key:"range:max",label:"identify the maximum",value:pointSetFmt(max)},{key:"range:span",label:"subtract the endpoints",value:`${pointSetFmt(max)} − ${pointSetFmt(min)} = ${pointSetFmt(range)}`});if(spec.task==="rangeEndpoints")answerClaim=`range:endpoints:${pointSetFmt(min)}:${pointSetFmt(max)}`;else answerNumber=range;break}
    case "rangeBlindness":{for(const set of spec.sets){const xs=set.points.map(p=>p.x),min=Math.min(...xs),max=Math.max(...xs);stages.push({key:`range:${set.id}:endpoints`,label:`read ${set.label} endpoints`,value:`${pointSetFmt(min)} to ${pointSetFmt(max)}`})}stages.push({key:"range:interior",label:"compare the interior observations",value:"range ignores every value between the endpoints"});answerClaim="range:interior-blind";break}
    case "rangeUpdate":{const oldMin=Math.min(...values),oldMax=Math.max(...values),added=spec.addedValue??0,newMin=Math.min(oldMin,added),newMax=Math.max(oldMax,added),range=pointSetClean(newMax-newMin);stages.push({key:"range:old",label:"read the old endpoints",value:`${pointSetFmt(oldMin)} to ${pointSetFmt(oldMax)}`},{key:"range:added",label:"place the new observation",value:pointSetFmt(added)},{key:"range:new-endpoints",label:"update the endpoints",value:`${pointSetFmt(newMin)} to ${pointSetFmt(newMax)}`},{key:"range:new-span",label:"compute the new range",value:`${pointSetFmt(newMax)} − ${pointSetFmt(newMin)} = ${pointSetFmt(range)}`});answerNumber=range;break}
  }
  return{target,answerNumber,answerClaim,stages};
}
export function pointSetReasoningExplorationKeys(spec:PointSetReasoningTruthInput):string[]{return pointSetReasoningTruth(spec).stages.map(stage=>stage.key)}
export function pointSetReasoningChoiceCorrect(spec:PointSetReasoningTruthInput,choice:{claim?:string;numberValue?:number}):boolean{const truth=pointSetReasoningTruth(spec);if(typeof choice.numberValue==="number"&&typeof truth.answerNumber==="number")return Math.abs(choice.numberValue-truth.answerNumber)<=1e-9;return Boolean(choice.claim&&choice.claim===truth.answerClaim)}
const PointSetObservationSpec=z.object({id:z.string().min(1),label:z.string().min(1),x:z.number().finite(),y:z.number().finite().optional()});
const PointSetSeriesSpec=z.object({id:z.string().min(1),label:z.string().min(1),points:z.array(PointSetObservationSpec).min(1).max(16)});
const PointSetChoiceSpec=z.object({id:z.string().min(1),label:z.string().min(1),feedback:z.string().min(1),claim:z.string().min(1).optional(),numberValue:z.number().finite().optional()});
const PointSetNumericErrorSpec=z.object({value:z.number().finite(),feedback:z.string().min(1)});
const PointSetAuthoredStageSpec=z.object({title:z.string().min(1),body:z.string().min(1)});
export const PointSetReasoningLabSpec = z.object({
  type: z.literal("pointSetReasoningLab"), task:z.enum(["axisMeaning","axisDistance","pointRead","sequenceExtend","pathLength","pointMeaning","rangeEndpoints","rangeValue","rangeBlindness","rangeUpdate","unitRate"]), answerMode:z.enum(["numeric","choice","explore"]), prompt:z.string().min(1),
  xLabel:z.string().min(1),yLabel:z.string().min(1).optional(),sets:z.array(PointSetSeriesSpec).min(1).max(4),targetSetId:z.string().min(1).optional(),targetPointId:z.string().min(1).optional(),targetAxis:z.enum(["x","y"]).optional(),targetX:z.number().finite().optional(),pathPointIds:z.array(z.string().min(1)).min(2).max(12).optional(),addedValue:z.number().finite().optional(),
  answerUnit:z.string().optional(),tolerance:z.number().nonnegative().default(0),choices:z.array(PointSetChoiceSpec).max(8).default([]),numericErrors:z.array(PointSetNumericErrorSpec).max(8).default([]),authoredStages:z.array(PointSetAuthoredStageSpec).max(20).default([]),requiredStageKeys:z.array(z.string().min(1)).max(30).default([]),requiredExplorations:z.number().int().min(1).max(30).default(1),successFeedback:z.string().min(1),explorationFeedback:z.string().min(1),fallbackFeedback:z.string().min(1)
});

/** geometricConstraintLab — one declarative geometry-constraint state for Session 149.
 * Perimeter, coordinate area composition, scaled area, crossing-angle relations, AA similarity,
 * and Pythagorean square-area conservation remain distinct task modes over the same named quantity
 * and relation graph. Rendering, grading, narration, accessibility, and seeded generation all
 * derive from this state; authored correctness flags are never consulted. */
export type GeometricConstraintTask = "perimeterMissing" | "coordinateArea" | "scaledArea" | "angleCrossing" | "aaSimilarity" | "pythagoreanArea" | "coordinateProof";
export type GeometricConstraintAnswerMode = "numeric" | "choice" | "explore";
export type GeometricConstraintStage = { key:string; label:string; value:string };
export type GeometricPerimeterModel = { shape:"triangle"|"square"|"rectangle"; perimeter:number; knownSides:readonly number[]; unknownMultiplicity:number };
export type GeometricCoordinatePiece = { id:string; label:string; kind:"rectangle"|"rightTriangle"; x:number; y:number; width:number; height:number; operation:"add"|"subtract"; points?:readonly (readonly [number,number])[] };
export type GeometricCoordinateModel = { pieces:readonly GeometricCoordinatePiece[]; target:"piece"|"total"; targetPieceId?:string };
export type GeometricScaleModel = { drawingWidth?:number; drawingHeight?:number; drawingArea?:number; lengthScale:number; target:"realArea"|"unitArea"|"error" };
export type GeometricAngleModel = { knownAngle:number; target:"vertical"|"adjacent"|"all"|"whyVertical"; algebraFactor?:number; algebraValue?:number };
export type GeometricAAModel = { anglesA:readonly number[]; anglesB:readonly number[]; target:"third"|"similarity"|"scale"; matchedSmall?:number; matchedLarge?:number; targetSmall?:number };
export type GeometricPythagoreanModel = { legA?:number; legB?:number; legAreaA?:number; legAreaB?:number; hypotenuse?:number; target:"cSquared"|"hypotenuseIdentity"|"areaMeaning"|"length"|"legLength" };
export type GeometricProofPoint={id:string;label:string;x:number;y:number};
export type GeometricCoordinateProofModel={kind:"segmentPartition"|"lineRelation"|"vectorRotation"|"triangleCertificate"|"symmetricPlacement"|"radicalPerimeter"|"boxAdvantage"|"shoelaceArea"|"circleLineIntersection"|"segmentLength";points:readonly GeometricProofPoint[];segment?:{a:string;p:string;b:string};span?:{a:string;b:string};segments?:readonly (readonly [string,string])[];vector?:readonly [number,number];sideRadicands?:readonly number[];circle?:{h:number;k:number;r:number};line?:{m:number;b:number};targetClaim?:string};
export type GeometricConstraintTruthInput = { task:GeometricConstraintTask; perimeter?:GeometricPerimeterModel; coordinate?:GeometricCoordinateModel; scale?:GeometricScaleModel; angle?:GeometricAngleModel; aa?:GeometricAAModel; pythagorean?:GeometricPythagoreanModel; coordinateProof?:GeometricCoordinateProofModel };
const geometricClean=(value:number):number=>{const rounded=Math.round(value*1e12)/1e12;return Object.is(rounded,-0)?0:rounded};
const geometricFmt=(value:number):string=>Number.isInteger(value)?String(value):String(geometricClean(value));
const geometricTriangleThird=(angles:readonly number[]):number=>geometricClean(180-angles.reduce((sum,value)=>sum+value,0));
const geometricCompletedAngles=(angles:readonly number[]):number[]=>angles.length===2?[...angles,geometricTriangleThird(angles)]:[...angles];
const geometricAngleSetKey=(angles:readonly number[]):string=>geometricCompletedAngles(angles).map(geometricClean).sort((a,b)=>a-b).join(",");
export function geometricCoordinatePieceArea(piece:GeometricCoordinatePiece):number{return geometricClean((piece.kind==="rightTriangle"?.5:1)*Math.abs(piece.width*piece.height))}
const geometricGcd=(a:number,b:number):number=>{let x=Math.abs(Math.round(a)),y=Math.abs(Math.round(b));while(y){const t=x%y;x=y;y=t}return x||1};
const geometricPointMap=(model:GeometricCoordinateProofModel)=>new Map(model.points.map(point=>[point.id,point]));
const geometricSlope=(a:GeometricProofPoint,b:GeometricProofPoint):number|null=>Math.abs(b.x-a.x)<1e-12?null:geometricClean((b.y-a.y)/(b.x-a.x));
const geometricDist2=(a:GeometricProofPoint,b:GeometricProofPoint):number=>geometricClean((b.x-a.x)**2+(b.y-a.y)**2);
const geometricShoelace=(points:readonly GeometricProofPoint[]):number=>geometricClean(Math.abs(points.reduce((sum,p,index)=>{const q=points[(index+1)%points.length]!;return sum+p.x*q.y-p.y*q.x},0))/2);
const geometricSimplifyRoot=(n:number):{coefficient:number;radicand:number}=>{let coefficient=1,radicand=n;for(let factor=Math.floor(Math.sqrt(n));factor>=2;factor--){const square=factor*factor;if(n%square===0){coefficient=factor;radicand=n/square;break}}return{coefficient,radicand}};
export function geometricConstraintTruth(spec:GeometricConstraintTruthInput):{answerNumber?:number;answerClaim?:string;stages:GeometricConstraintStage[];pieceAreas?:Readonly<Record<string,number>>}{
  const stages:GeometricConstraintStage[]=[];let answerNumber:number|undefined,answerClaim:string|undefined,pieceAreas:Record<string,number>|undefined;
  switch(spec.task){
    case "perimeterMissing":{
      const model=spec.perimeter;if(!model)throw new Error("geometricConstraintLab perimeterMissing requires perimeter data");
      const known=model.knownSides.reduce((sum,value)=>sum+value,0),remaining=geometricClean(model.perimeter-known);
      stages.push({key:"perimeter:total",label:"read the full boundary",value:`perimeter = ${geometricFmt(model.perimeter)}`},{key:"perimeter:known",label:"combine the known side lengths",value:`known sides = ${geometricFmt(known)}`},{key:"perimeter:remaining",label:"remove the known boundary",value:`remaining boundary = ${geometricFmt(remaining)}`});
      if(model.unknownMultiplicity>1)stages.push({key:"perimeter:split",label:"split the remaining equal sides",value:`${geometricFmt(remaining)} ÷ ${model.unknownMultiplicity} = ${geometricFmt(remaining/model.unknownMultiplicity)}`});
      answerNumber=geometricClean(remaining/model.unknownMultiplicity);break;
    }
    case "coordinateArea":{
      const model=spec.coordinate;if(!model||!model.pieces.length)throw new Error("geometricConstraintLab coordinateArea requires pieces");pieceAreas={};
      for(const piece of model.pieces){const area=geometricCoordinatePieceArea(piece);pieceAreas[piece.id]=area;stages.push({key:`coordinate:${piece.id}:dimensions`,label:`derive ${piece.label} dimensions`,value:`${geometricFmt(Math.abs(piece.width))} by ${geometricFmt(Math.abs(piece.height))}`},{key:`coordinate:${piece.id}:area`,label:`compute ${piece.label} area`,value:`${piece.kind==="rightTriangle"?"one half × ":""}${geometricFmt(Math.abs(piece.width))} × ${geometricFmt(Math.abs(piece.height))} = ${geometricFmt(area)}`});}
      if(model.target==="piece"){const id=model.targetPieceId??model.pieces[0]!.id;answerNumber=pieceAreas[id];if(answerNumber===undefined)throw new Error(`geometricConstraintLab unknown target piece ${id}`)}else{answerNumber=geometricClean(model.pieces.reduce((sum,piece)=>sum+(piece.operation==="subtract"?-1:1)*(pieceAreas![piece.id]??0),0));stages.push({key:"coordinate:combine",label:"combine attached and cut-away pieces",value:model.pieces.map(piece=>`${piece.operation==="subtract"?"−":"+"}${geometricFmt(pieceAreas![piece.id]??0)}`).join(" ").replace(/^\+/,"")+` = ${geometricFmt(answerNumber)}`});}break;
    }
    case "scaledArea":{
      const model=spec.scale;if(!model)throw new Error("geometricConstraintLab scaledArea requires scale data");const drawingArea=model.drawingArea??((model.drawingWidth??1)*(model.drawingHeight??1)),factor=geometricClean(model.lengthScale*model.lengthScale),real=geometricClean(drawingArea*factor);
      stages.push({key:"scale:length",label:"read the linear scale factor",value:`length factor = ${geometricFmt(model.lengthScale)}`},{key:"scale:area-factor",label:"square the scale for area",value:`area factor = ${geometricFmt(model.lengthScale)}² = ${geometricFmt(factor)}`});
      if(model.target!=="unitArea")stages.push({key:"scale:drawing-area",label:"compute the drawing area",value:`drawing area = ${geometricFmt(drawingArea)}`},{key:"scale:real-area",label:"apply the squared area factor",value:`${geometricFmt(drawingArea)} × ${geometricFmt(factor)} = ${geometricFmt(real)}`});
      if(model.target==="realArea")answerNumber=real;else if(model.target==="unitArea")answerNumber=factor;else answerClaim="scale:must-square";break;
    }
    case "angleCrossing":{
      const model=spec.angle;if(!model)throw new Error("geometricConstraintLab angleCrossing requires angle data");const known=geometricClean(model.knownAngle),adjacent=geometricClean(180-known);
      if(model.algebraFactor!==undefined&&model.algebraValue!==undefined)stages.push({key:"angle:substitute",label:"evaluate the algebraic angle",value:`${geometricFmt(model.algebraFactor)} × ${geometricFmt(model.algebraValue)} = ${geometricFmt(known)}°`});
      stages.push({key:"angle:vertical",label:"use the vertical-angle equality",value:`across angle = ${geometricFmt(known)}°`},{key:"angle:adjacent",label:"complete the straight line",value:`180° − ${geometricFmt(known)}° = ${geometricFmt(adjacent)}°`});
      if(model.target==="all")stages.push({key:"angle:full-turn",label:"verify all four angles",value:`${geometricFmt(known)} + ${geometricFmt(adjacent)} + ${geometricFmt(known)} + ${geometricFmt(adjacent)} = 360°`});
      if(model.target==="vertical")answerNumber=known;else if(model.target==="adjacent")answerNumber=adjacent;else if(model.target==="whyVertical")answerClaim="angle:shared-supplement";break;
    }
    case "aaSimilarity":{
      const model=spec.aa;if(!model)throw new Error("geometricConstraintLab aaSimilarity requires triangle-angle data");const a=geometricCompletedAngles(model.anglesA),b=geometricCompletedAngles(model.anglesB);
      stages.push({key:"aa:complete-a",label:"complete triangle A",value:a.map(v=>`${geometricFmt(v)}°`).join(", ")},{key:"aa:complete-b",label:"complete triangle B",value:b.map(v=>`${geometricFmt(v)}°`).join(", ")});const similar=geometricAngleSetKey(a)===geometricAngleSetKey(b);stages.push({key:"aa:compare",label:"compare the angle sets",value:similar?"two corresponding angles match, so AA holds":"fewer than two corresponding angles match"});
      if(model.target==="third")answerNumber=a[2];else if(model.target==="similarity")answerClaim=similar?"aa:similar":"aa:not-similar";else{if(!similar||!model.matchedSmall||!model.matchedLarge||model.targetSmall===undefined)throw new Error("geometricConstraintLab AA scale requires similar triangles and three side values");const factor=geometricClean(model.matchedLarge/model.matchedSmall);stages.push({key:"aa:scale-factor",label:"derive the side scale factor",value:`${geometricFmt(model.matchedLarge)} ÷ ${geometricFmt(model.matchedSmall)} = ${geometricFmt(factor)}`},{key:"aa:scale-target",label:"scale the matching side",value:`${geometricFmt(model.targetSmall)} × ${geometricFmt(factor)} = ${geometricFmt(model.targetSmall*factor)}`});answerNumber=geometricClean(model.targetSmall*factor);}break;
    }
    case "pythagoreanArea":{
      const model=spec.pythagorean;if(!model)throw new Error("geometricConstraintLab pythagoreanArea requires right-triangle data");const areaA=model.legAreaA??((model.legA??0)**2),areaB=model.legAreaB??((model.legB??0)**2),c2=geometricClean(areaA+areaB),c=geometricClean(Math.sqrt(c2));
      stages.push({key:"pyth:leg-squares",label:"read the two leg-square areas",value:`${geometricFmt(areaA)} and ${geometricFmt(areaB)}`},{key:"pyth:sum",label:"conserve square area",value:`${geometricFmt(areaA)} + ${geometricFmt(areaB)} = ${geometricFmt(c2)}`},{key:"pyth:identity",label:"match the hypotenuse-square area",value:`c² = ${geometricFmt(c2)}`});
      if(model.target==="length")stages.push({key:"pyth:square-root",label:"recover the hypotenuse length",value:`√${geometricFmt(c2)} = ${geometricFmt(c)}`});
      if(model.target==="legLength"){const hyp=model.hypotenuse;if(hyp===undefined)throw new Error("geometricConstraintLab legLength requires the hypotenuse");const knownArea=model.legAreaA??((model.legA??0)**2);if(knownArea<=0)throw new Error("geometricConstraintLab legLength requires one known leg");const missing2=geometricClean(hyp*hyp-knownArea);if(missing2<=0)throw new Error("geometricConstraintLab legLength requires hypotenuse longer than the known leg");const missing=geometricClean(Math.sqrt(missing2));stages.length=0;stages.push({key:"pyth:hyp-square",label:"square the hypotenuse",value:`${geometricFmt(hyp)}² = ${geometricFmt(hyp*hyp)}`},{key:"pyth:leg-square",label:"square the known leg",value:`${geometricFmt(Math.sqrt(knownArea))}² = ${geometricFmt(knownArea)}`},{key:"pyth:subtract",label:"conserve square area in reverse",value:`${geometricFmt(hyp*hyp)} − ${geometricFmt(knownArea)} = ${geometricFmt(missing2)}`},{key:"pyth:square-root",label:"recover the missing leg",value:`√${geometricFmt(missing2)} = ${geometricFmt(missing)}`});answerNumber=missing;}
      else if(model.target==="cSquared")answerNumber=c2;else if(model.target==="length")answerNumber=c;else if(model.target==="hypotenuseIdentity")answerClaim="pyth:hypotenuse-opposite-right";else answerClaim="pyth:squared-terms-are-areas";break;
    }
    case "coordinateProof":{
      const model=spec.coordinateProof;if(!model)throw new Error("geometricConstraintLab coordinateProof requires coordinateProof data");const points=geometricPointMap(model),need=(id:string)=>{const point=points.get(id);if(!point)throw new Error(`geometricConstraintLab coordinate proof missing point ${id}`);return point};
      if(model.kind==="segmentLength"){if(!model.span)throw new Error("segmentLength requires span ids");const a=need(model.span.a),b=need(model.span.b),dx=b.x-a.x,dy=b.y-a.y,d2=geometricClean(dx*dx+dy*dy),d=geometricClean(Math.sqrt(d2));stages.push({key:"proof:span-runs",label:"read the horizontal and vertical runs",value:`Δx = ${geometricFmt(dx)}, Δy = ${geometricFmt(dy)}`},{key:"proof:span-squares",label:"sum the squared runs",value:`${geometricFmt(dx*dx)} + ${geometricFmt(dy*dy)} = ${geometricFmt(d2)}`},{key:"proof:span-root",label:"recover the distance",value:`√${geometricFmt(d2)} = ${geometricFmt(d)}`});answerNumber=d;}
      else if(model.kind==="segmentPartition"){if(!model.segment)throw new Error("segmentPartition requires segment ids");const a=need(model.segment.a),p=need(model.segment.p),b=need(model.segment.b),dx=b.x-a.x,dy=b.y-a.y,kx=Math.abs(dx)>1e-12?(p.x-a.x)/dx:undefined,ky=Math.abs(dy)>1e-12?(p.y-a.y)/dy:undefined,k=kx??ky;if(k===undefined||k<=0||k>=1||kx!==undefined&&ky!==undefined&&Math.abs(kx-ky)>1e-9)throw new Error("segment partition point must lie strictly on the segment");let bestNum=1,bestDen=2,bestError=Infinity;for(let den=2;den<=1000;den++){const num=Math.round(k*den);if(num<=0||num>=den)continue;const error=Math.abs(k-num/den);if(error<bestError){bestError=error;bestNum=num;bestDen=den;if(error<1e-12)break}}const g=geometricGcd(bestNum,bestDen-bestNum),m=bestNum/g,n=(bestDen-bestNum)/g;stages.push({key:"proof:partition-x",label:"measure the horizontal fraction",value:`(${geometricFmt(p.x)} − ${geometricFmt(a.x)}) ÷ (${geometricFmt(b.x)} − ${geometricFmt(a.x)}) = ${geometricFmt(k)}`},{key:"proof:partition-y",label:"verify the vertical fraction",value:`(${geometricFmt(p.y)} − ${geometricFmt(a.y)}) ÷ (${geometricFmt(b.y)} − ${geometricFmt(a.y)}) = ${geometricFmt(k)}`},{key:"proof:partition-ratio",label:"convert fraction traveled to part ratio",value:`${m} : ${n}`});answerNumber=m;
      }else if(model.kind==="lineRelation"){if(!model.segments||model.segments.length<2)throw new Error("lineRelation requires two segments");const [[aId,bId],[cId,dId]]=model.segments,s1=geometricSlope(need(aId),need(bId)),s2=geometricSlope(need(cId),need(dId)),shared=new Set([aId,bId]);const hasShared=shared.has(cId)||shared.has(dId),equal=s1===null&&s2===null||s1!==null&&s2!==null&&Math.abs(s1-s2)<1e-9;stages.push({key:"proof:slope-a",label:"derive the first slope",value:`slope = ${s1===null?"undefined":geometricFmt(s1)}`},{key:"proof:slope-b",label:"derive the second slope",value:`slope = ${s2===null?"undefined":geometricFmt(s2)}`},{key:"proof:shared-point",label:"check the incidence condition",value:hasShared?"the segments share an endpoint":"the segments are disjoint"});answerClaim=equal&&hasShared?"line:collinear":equal?"line:parallel":"line:not-parallel";
      }else if(model.kind==="vectorRotation"){const [a,b]=model.vector??[0,0],rot=[-b,a] as const,dot=a*rot[0]+b*rot[1];stages.push({key:"proof:vector",label:"read the original displacement",value:`(${a}, ${b})`},{key:"proof:rotate",label:"rotate the displacement 90 degrees",value:`(${a}, ${b}) → (${rot[0]}, ${rot[1]})`},{key:"proof:dot",label:"verify perpendicularity",value:`dot product = ${dot}`});answerClaim=dot===0?"rotation:perpendicular-readable":"rotation:not-perpendicular";
      }else if(model.kind==="triangleCertificate"){if(model.points.length!==3)throw new Error("triangleCertificate requires three points");const [a,b,c]=model.points,d2=[geometricDist2(a,b),geometricDist2(b,c),geometricDist2(c,a)].sort((x,y)=>x-y),right=Math.abs(d2[0]!+d2[1]!-d2[2]!)<1e-9;stages.push({key:"proof:side-squares",label:"compute all squared side lengths",value:d2.map(geometricFmt).join(", ")},{key:"proof:converse",label:"test the Pythagorean converse",value:`${geometricFmt(d2[0]!)} + ${geometricFmt(d2[1]!)} ${right?"=":"≠"} ${geometricFmt(d2[2]!)}`},{key:"proof:slope-option",label:"identify the independent slope certificate",value:"perpendicular sides have slope product −1"});answerClaim=right?"triangle:right:slope-or-converse":"triangle:not-right";
      }else if(model.kind==="symmetricPlacement"){if(model.points.length!==3)throw new Error("symmetricPlacement requires three points");const [a,b,c]=model.points,slants=[geometricDist2(a,c),geometricDist2(b,c)];stages.push({key:"proof:symmetry-axis",label:"inspect the midpoint and axis",value:`base midpoint = (${geometricFmt((a.x+b.x)/2)}, ${geometricFmt((a.y+b.y)/2)})`},{key:"proof:equal-slants",label:"compare the two slant squares",value:`${geometricFmt(slants[0]!)} and ${geometricFmt(slants[1]!)}`});answerClaim=Math.abs(slants[0]!-slants[1]!)<1e-9?"placement:isosceles-symmetric":"placement:not-symmetric";
      }else if(model.kind==="radicalPerimeter"){if(!model.sideRadicands?.length)throw new Error("radicalPerimeter requires side radicands");const simplified=model.sideRadicands.map(geometricSimplifyRoot),same=simplified.every(item=>item.radicand===simplified[0]!.radicand),coefficient=simplified.reduce((sum,item)=>sum+item.coefficient,0);stages.push({key:"proof:radical-sides",label:"simplify each exact side",value:simplified.map(item=>`${item.coefficient}√${item.radicand}`).join(" + ")},{key:"proof:radical-combine",label:"combine like radicals",value:same?`${coefficient}√${simplified[0]!.radicand}`:"unlike radicals stay separate"});answerClaim=same?`perimeter:${coefficient}sqrt${simplified[0]!.radicand}`:"perimeter:unlike-radicals";
      }else if(model.kind==="boxAdvantage"){if(model.points.length<3)throw new Error("boxAdvantage requires polygon points");const xs=model.points.map(p=>p.x),ys=model.points.map(p=>p.y);stages.push({key:"proof:box",label:"build the axis-aligned bounding box",value:`width ${geometricFmt(Math.max(...xs)-Math.min(...xs))}, height ${geometricFmt(Math.max(...ys)-Math.min(...ys))}`},{key:"proof:corner-legs",label:"read corner-triangle legs from coordinate differences",value:"every corner leg is horizontal or vertical"});answerClaim="area:box-axis-aligned-corners";
      }else if(model.kind==="shoelaceArea"){if(model.points.length<3)throw new Error("shoelaceArea requires polygon points");const forward=model.points.reduce((sum,p,index)=>sum+p.x*model.points[(index+1)%model.points.length]!.y,0),backward=model.points.reduce((sum,p,index)=>sum+p.y*model.points[(index+1)%model.points.length]!.x,0);stages.push({key:"proof:shoelace-forward",label:"sum the forward diagonal products",value:geometricFmt(forward)},{key:"proof:shoelace-back",label:"sum the backward diagonal products",value:geometricFmt(backward)},{key:"proof:shoelace-half",label:"take half the absolute difference",value:`½|${geometricFmt(forward)} − ${geometricFmt(backward)}| = ${geometricFmt(geometricShoelace(model.points))}`});answerNumber=geometricShoelace(model.points);
      }else {if(!model.circle||!model.line)throw new Error("circleLineIntersection requires circle and line");const {h,k,r}=model.circle,{m,b}=model.line,A=1+m*m,B=2*(m*(b-k)-h),C=h*h+(b-k)**2-r*r,disc=geometricClean(B*B-4*A*C);stages.push({key:"proof:substitute-line",label:"substitute the line into the circle",value:`(${m}x + ${b} − ${k})² + (x − ${h})² = ${r*r}`},{key:"proof:discriminant",label:"count intersections from the discriminant",value:`Δ = ${geometricFmt(disc)}`});if(disc<0)throw new Error("circleLineIntersection requires a real intersection");const roots=[(-B+Math.sqrt(disc))/(2*A),(-B-Math.sqrt(disc))/(2*A)].map(geometricClean);stages.push({key:"proof:roots",label:"solve the intersection x-values",value:roots.map(geometricFmt).join(", ")});answerNumber=Math.max(...roots.filter(root=>root>0));if(!Number.isFinite(answerNumber))throw new Error("circleLineIntersection requires a positive x root");
      }break;
    }
  }
  return{answerNumber,answerClaim,stages,pieceAreas};
}
export function geometricConstraintExplorationKeys(spec:GeometricConstraintTruthInput):string[]{return geometricConstraintTruth(spec).stages.map(stage=>stage.key)}
export function geometricConstraintChoiceCorrect(spec:GeometricConstraintTruthInput,choice:{claim?:string;numberValue?:number}):boolean{const truth=geometricConstraintTruth(spec);if(typeof choice.numberValue==="number"&&typeof truth.answerNumber==="number")return Math.abs(choice.numberValue-truth.answerNumber)<=1e-9;return Boolean(choice.claim&&choice.claim===truth.answerClaim)}
const GeometricConstraintChoiceSpec=z.object({id:z.string().min(1),label:z.string().min(1),feedback:z.string().min(1),claim:z.string().min(1).optional(),numberValue:z.number().finite().optional()});
const GeometricConstraintNumericErrorSpec=z.object({value:z.number().finite(),feedback:z.string().min(1)});
const GeometricConstraintAuthoredStageSpec=z.object({title:z.string().min(1),body:z.string().min(1)});
const GeometricCoordinatePieceSpec=z.object({id:z.string().min(1),label:z.string().min(1),kind:z.enum(["rectangle","rightTriangle"]),x:z.number().finite(),y:z.number().finite(),width:z.number().finite(),height:z.number().finite(),operation:z.enum(["add","subtract"]),points:z.array(z.tuple([z.number().finite(),z.number().finite()])).min(3).max(4).optional()});
export const GeometricConstraintLabSpec = z.object({
  type: z.literal("geometricConstraintLab"),task:z.enum(["perimeterMissing","coordinateArea","scaledArea","angleCrossing","aaSimilarity","pythagoreanArea","coordinateProof"]),answerMode:z.enum(["numeric","choice","explore"]),prompt:z.string().min(1),
  perimeter:z.object({shape:z.enum(["triangle","square","rectangle"]),perimeter:z.number().positive(),knownSides:z.array(z.number().positive()).max(6),unknownMultiplicity:z.number().int().min(1).max(4)}).optional(),
  coordinate:z.object({pieces:z.array(GeometricCoordinatePieceSpec).min(1).max(8),target:z.enum(["piece","total"]),targetPieceId:z.string().min(1).optional()}).optional(),
  scale:z.object({drawingWidth:z.number().positive().optional(),drawingHeight:z.number().positive().optional(),drawingArea:z.number().positive().optional(),lengthScale:z.number().positive(),target:z.enum(["realArea","unitArea","error"])}).optional(),
  angle:z.object({knownAngle:z.number().positive().max(179.999999),target:z.enum(["vertical","adjacent","all","whyVertical"]),algebraFactor:z.number().positive().optional(),algebraValue:z.number().finite().optional()}).optional(),
  aa:z.object({anglesA:z.array(z.number().positive().max(179.999999)).min(2).max(3),anglesB:z.array(z.number().positive().max(179.999999)).min(2).max(3),target:z.enum(["third","similarity","scale"]),matchedSmall:z.number().positive().optional(),matchedLarge:z.number().positive().optional(),targetSmall:z.number().positive().optional()}).optional(),
  pythagorean:z.object({legA:z.number().positive().optional(),legB:z.number().positive().optional(),legAreaA:z.number().positive().optional(),legAreaB:z.number().positive().optional(),hypotenuse:z.number().positive().optional(),target:z.enum(["cSquared","hypotenuseIdentity","areaMeaning","length","legLength"])}).optional(),
  coordinateProof:z.object({kind:z.enum(["segmentPartition","lineRelation","vectorRotation","triangleCertificate","symmetricPlacement","radicalPerimeter","boxAdvantage","shoelaceArea","circleLineIntersection","segmentLength"]),points:z.array(z.object({id:z.string().min(1),label:z.string().min(1),x:z.number().finite(),y:z.number().finite()})).max(12),span:z.object({a:z.string().min(1),b:z.string().min(1)}).optional(),segment:z.object({a:z.string().min(1),p:z.string().min(1),b:z.string().min(1)}).optional(),segments:z.array(z.tuple([z.string().min(1),z.string().min(1)])).max(4).optional(),vector:z.tuple([z.number().finite(),z.number().finite()]).optional(),sideRadicands:z.array(z.number().int().positive()).max(12).optional(),circle:z.object({h:z.number().finite(),k:z.number().finite(),r:z.number().positive()}).optional(),line:z.object({m:z.number().finite(),b:z.number().finite()}).optional(),targetClaim:z.string().min(1).optional()}).optional(),
  answerUnit:z.string().optional(),tolerance:z.number().nonnegative().default(0),choices:z.array(GeometricConstraintChoiceSpec).max(8).default([]),numericErrors:z.array(GeometricConstraintNumericErrorSpec).max(8).default([]),authoredStages:z.array(GeometricConstraintAuthoredStageSpec).max(12).default([]),requiredStageKeys:z.array(z.string().min(1)).max(20).default([]),requiredExplorations:z.number().int().min(1).max(20).default(1),successFeedback:z.string().min(1),explorationFeedback:z.string().min(1),fallbackFeedback:z.string().min(1)
});

/** exactNumberLab — one exact ordered-number state for Session 148.
 * Fractions, grouped expressions, powers, inequalities, signed rational operations, and square-root
 * brackets remain explicit task modes over the same exact rational/radical domain. Rendering,
 * grading, narration, and generation derive from this state; no authored answer flag is consulted. */
export type ExactNumberTask =
  | "fractionCompare" | "benchmarkDecision"
  | "groupedEvaluate" | "groupedFirst"
  | "powerEvaluate" | "powerCompare"
  | "inequalityMembership" | "inequalityExtremum"
  | "rationalOperation"
  | "rootClassify" | "rootSelect" | "rootList"
  | "rootBracket" | "squareEvaluate" | "densityWitness" | "densityPrinciple"
  | "radicalSimplifyCoef" | "radicalCombine" | "radicalProduct" | "rationalExponentEvaluate"
  | "logarithmEvaluate" | "logarithmArgument" | "approximationEvaluate"
  | "logarithmEqualArguments" | "logarithmSumQuadratic"
  | "radicalEquationSolve" | "radicalEquationExtraneous" | "rationalExponentSolve"
  | "rationalLimitAtInfinity" | "polynomialEvaluate" | "antiderivativeInitialValue"
  | "linearSystemSolve" | "polynomialIntegerRoots"
  | "rationalRootCandidateCount" | "polynomialZeroCount" | "vectorDirectionAngle"
  | "polynomialMinimumDegree"
  | "exponentSolve";
export type ExactNumberAnswerMode = "numeric" | "choice" | "relation" | "explore";
export type ExactNumberRelation = "lt" | "eq" | "gt";
export type ExactRational = { num:number; den:number };
export type ExactNumberSource =
  | { id:string; label:string; kind:"rational"; num:number; den:number }
  | { id:string; label:string; kind:"power"; base:number; exponent:number; rootIndex?:number }
  | { id:string; label:string; kind:"root"; radicand:number; coefficient?:number };
export type ExactNumberGroup = { a:number; b:number; c:number; innerOp:"add"|"subtract"; outerOp:"multiply"|"divide"; groupSide:"left"|"right" };
export type ExactNumberInequality = { operator:"lt"|"le"|"gt"|"ge"; boundary:number; candidate?:number };
export type ExactNumberTruthStage = { key:string; label:string; value:string };
export type ExactNumberTruthInput = {
  task:ExactNumberTask; values:readonly ExactNumberSource[];
  operation?:"add"|"subtract"|"multiply"|"divide";
  group?:ExactNumberGroup; inequality?:ExactNumberInequality;
  targetClass?:"rational"|"irrational";
  targetRadicand?:number; lower?:number; upper?:number;
  logBase?:number; logArgument?:number; logResult?:number; logDivisor?:number;
  logCoefA?:number; logConstB?:number; logConstQ?:number; logShift?:number;
  radRootIndex?:number; radInsideCoef?:number; radInsideConst?:number; radOuterCoef?:number; radOuterConst?:number; radRhs?:number;
  extInsideConst?:number; extRhsShift?:number;
  rexCoef?:number; rexShift?:number; rexP?:number; rexQ?:number; rexRhs?:number;
  limDegNum?:number; limDegDenom?:number; limLeadNum?:number; limLeadDenom?:number;
  polyCoefficients?:number[]; polyAt?:number;
  aivRate?:number[]; aivOrder?:number; aivAt0?:number; aivInit?:number[]; aivTarget?:number;
  sysA1?:number; sysB1?:number; sysC1?:number; sysA2?:number; sysB2?:number; sysC2?:number; sysAsk?:"x"|"y";
  pirCoefficients?:number[]; pirMode?:"largest"|"smallest"|"sum"|"count";
  rrcLeading?:number; rrcConstant?:number;
  pzcMode?:"total"|"distinct"|"nonReal"; pzcMultiplicities?:number[]; pzcDegree?:number; pzcRealCount?:number;
  vdaX?:number; vdaY?:number;
  pmdTurningPoints?:number; pmdEndBehavior?:"same"|"opposite"|"unconstrained";
  esCoef?:number; esBaseNum?:number; esBaseDen?:number; esRhsNum?:number; esRhsDen?:number;
  /** S164: an authored numeric approximation (e.g. "log 2 ≈ 0.301") supplied as an INPUT, not
   * derived. Using a given constant as an input is not circular — it is how a log/trig table
   * is used in the first place. What must never happen is silently guessing the constant. */
  approxConstants?:readonly{id:string;label:string;value:number}[];
  /** A tiny closed expression tree over those constants and integer literals — evaluated
   * exactly, never parsed from prose. */
  approxFormula?:ApproxExpr;
  approxRound?:number;
};
export type ApproxExpr=
  | {op:"const";id:string}
  | {op:"lit";value:number}
  | {op:"add"|"subtract"|"multiply"|"divide";left:ApproxExpr;right:ApproxExpr}
  | {op:"negate";arg:ApproxExpr}
  | {op:"sqrt";arg:ApproxExpr}
  | {op:"root";index:number;arg:ApproxExpr}
  | {op:"sinDeg";degrees:number}
  | {op:"cosDeg";degrees:number};
export function evalApproxExpr(expr:ApproxExpr,constants:readonly{id:string;value:number}[]):number{
  switch(expr.op){
    case "const":{const c=constants.find(x=>x.id===expr.id);if(!c)throw new Error(`approximationEvaluate: unknown constant "${expr.id}"`);return c.value}
    case "lit":return expr.value;
    case "negate":return -evalApproxExpr(expr.arg,constants);
    case "sqrt":{const v=evalApproxExpr(expr.arg,constants);if(v<0)throw new Error("approximationEvaluate: square root of a negative value");return Math.sqrt(v)}
    /* S168: an nth root that refuses to approximate. The radicand must be an exact perfect nth
     * power, so a rounded irrational can never propagate into an answer. */
    /* S173. Exact unit-circle values for the standard 30-60-90/45-45-90 special angles ONLY —
     * this is a closed-form algebraic fact (sin 30 deg = 1/2 exactly), not a numerical
     * approximation of a general angle. Any angle outside this fixed, named whitelist throws
     * rather than falling back to a generic trig call: that is exactly the line this project
     * has held since the g10-right-triangles/a2-trig boundary — arbitrary-angle trig has no
     * independent closed form and is correctly out of scope; these seventeen angles do. */
    case "sinDeg":case "cosDeg":{
      const SIN:Record<number,number>={0:0,30:0.5,45:Math.SQRT2/2,60:Math.sqrt(3)/2,90:1,120:Math.sqrt(3)/2,135:Math.SQRT2/2,150:0.5,180:0,210:-0.5,225:-Math.SQRT2/2,240:-Math.sqrt(3)/2,270:-1,300:-Math.sqrt(3)/2,315:-Math.SQRT2/2,330:-0.5,360:0};
      const COS:Record<number,number>={0:1,30:Math.sqrt(3)/2,45:Math.SQRT2/2,60:0.5,90:0,120:-0.5,135:-Math.SQRT2/2,150:-Math.sqrt(3)/2,180:-1,210:-Math.sqrt(3)/2,225:-Math.SQRT2/2,240:-0.5,270:0,300:0.5,315:Math.SQRT2/2,330:Math.sqrt(3)/2,360:1};
      const table=expr.op==="sinDeg"?SIN:COS,deg=((expr.degrees%360)+360)%360;
      if(!(deg in table))throw new Error(`approximationEvaluate: ${expr.degrees}° is not one of the standard special angles (multiples of 30° or 45°) — arbitrary-angle trig is out of scope`);
      return table[deg]!;
    }
    case "root":{const v=evalApproxExpr(expr.arg,constants),n=expr.index;
      if(!Number.isInteger(n)||n<2)throw new Error(`approximationEvaluate: root index must be an integer of at least 2, got ${n}`);
      if(v<0&&n%2===0)throw new Error("approximationEvaluate: even root of a negative value");
      const r=Math.round(Math.sign(v)*Math.pow(Math.abs(v),1/n));
      if(Math.pow(r,n)!==v)throw new Error(`approximationEvaluate: ${v} is not an exact perfect power of index ${n}`);
      return r}
    default:{
      const l=evalApproxExpr(expr.left,constants),r=evalApproxExpr(expr.right,constants);
      if(expr.op==="add")return l+r; if(expr.op==="subtract")return l-r; if(expr.op==="multiply")return l*r;
      if(r===0)throw new Error("approximationEvaluate: division by zero");
      return l/r;
    }
  }
}

const exactGcd=(a:number,b:number):number=>{a=Math.abs(Math.trunc(a));b=Math.abs(Math.trunc(b));while(b){const t=a%b;a=b;b=t}return a||1};
export function exactRational(value:ExactRational):ExactRational{
  if(!Number.isInteger(value.num)||!Number.isInteger(value.den)||value.den===0)throw new Error("exactNumberLab rational values require integer numerator and nonzero denominator");
  const sign=value.den<0?-1:1,g=exactGcd(value.num,value.den);return{num:sign*value.num/g,den:Math.abs(value.den)/g};
}
export function exactRationalKey(value:ExactRational):string{const r=exactRational(value);return r.den===1?String(r.num):`${r.num}/${r.den}`}
export function exactRationalNumber(value:ExactRational):number{const r=exactRational(value);return r.num/r.den}
const exactClean=(value:number):number=>{const rounded=Math.round(value*1e12)/1e12;return Object.is(rounded,-0)?0:rounded};
const exactSourceRational=(source:ExactNumberSource):ExactRational|null=>{
  if(source.kind==="rational")return exactRational({num:source.num,den:source.den});
  if(source.kind==="power"&&source.exponent>=0&&Number.isInteger(source.exponent))return exactRational({num:Math.pow(source.base,source.exponent),den:1});
  if(source.kind==="root"&&Number.isInteger(Math.sqrt(source.radicand)))return exactRational({num:Math.sqrt(source.radicand),den:1});
  return null;
};
export function exactNumberApprox(source:ExactNumberSource):number{
  if(source.kind==="rational")return exactRationalNumber(source);
  if(source.kind==="power")return exactClean(Math.pow(source.base,source.exponent/(source.rootIndex??1)));
  return exactClean((source.coefficient??1)*Math.sqrt(source.radicand));
}
export function exactNumberKey(source:ExactNumberSource):string{
  if(source.kind==="rational")return exactRationalKey(source);
  if(source.kind==="power")return `${source.base}^${source.exponent}`;
  return `sqrt:${source.radicand}`;
}
export function exactNumberClass(source:ExactNumberSource):"rational"|"irrational"{return exactSourceRational(source)?"rational":"irrational"}
const exactCompare=(a:ExactNumberSource,b:ExactNumberSource):ExactNumberRelation=>{
  const ar=exactSourceRational(a),br=exactSourceRational(b);
  if(ar&&br){const d=ar.num*br.den-br.num*ar.den;return d<0?"lt":d>0?"gt":"eq"}
  const d=exactNumberApprox(a)-exactNumberApprox(b);return Math.abs(d)<1e-12?"eq":d<0?"lt":"gt";
};
const exactApply=(a:ExactRational,b:ExactRational,op:NonNullable<ExactNumberTruthInput["operation"]>):ExactRational=>{
  const x=exactRational(a),y=exactRational(b);
  if(op==="add")return exactRational({num:x.num*y.den+y.num*x.den,den:x.den*y.den});
  if(op==="subtract")return exactRational({num:x.num*y.den-y.num*x.den,den:x.den*y.den});
  if(op==="multiply")return exactRational({num:x.num*y.num,den:x.den*y.den});
  if(y.num===0)throw new Error("exactNumberLab cannot divide by zero");
  return exactRational({num:x.num*y.den,den:x.den*y.num});
};
const exactRelationSymbol=(relation:ExactNumberRelation)=>relation==="lt"?"<":relation==="gt"?">":"=";
const exactInequalityHolds=(operator:NonNullable<ExactNumberTruthInput["inequality"]>["operator"],candidate:number,boundary:number)=>operator==="lt"?candidate<boundary:operator==="le"?candidate<=boundary:operator==="gt"?candidate>boundary:candidate>=boundary;
export function exactNumberTruth(spec:ExactNumberTruthInput):{
  answerNumber?:number; answerClaim?:string; answerRelation?:ExactNumberRelation;
  stages:ExactNumberTruthStage[]; answerRational?:ExactRational;
}{
  const values=[...spec.values],stages:ExactNumberTruthStage[]=[];
  let answerNumber:number|undefined,answerClaim:string|undefined,answerRelation:ExactNumberRelation|undefined,answerRational:ExactRational|undefined;
  const fmt=(n:number)=>Number.isInteger(n)?String(n):String(exactClean(n));
  const sign=(n:number)=>n<0?`- ${fmt(Math.abs(n))}`:`+ ${fmt(n)}`;
  switch(spec.task){
    case "fractionCompare": case "benchmarkDecision":{
      if(values.length!==2)throw new Error(`exactNumberLab ${spec.task} requires exactly two rational values`);
      const [a,b]=values,ar=exactSourceRational(a!),br=exactSourceRational(b!);if(!ar||!br)throw new Error(`exactNumberLab ${spec.task} requires rational values`);
      const halfA=ar.num*2-ar.den,halfB=br.num*2-br.den;
      stages.push({key:`benchmark:${a!.id}`,label:`${a!.label} against one half`,value:halfA<0?"below 1/2":halfA>0?"above 1/2":"equal to 1/2"},{key:`benchmark:${b!.id}`,label:`${b!.label} against one half`,value:halfB<0?"below 1/2":halfB>0?"above 1/2":"equal to 1/2"});
      const settles=Math.sign(halfA)!==Math.sign(halfB)&&halfA!==0&&halfB!==0;
      if(spec.task==="benchmarkDecision")answerClaim=settles?"benchmark:settles":"benchmark:needs-more";
      else{answerRelation=exactCompare(a!,b!);stages.push({key:"compare:exact",label:settles?"opposite-side comparison":"exact cross-product comparison",value:`${a!.label} ${exactRelationSymbol(answerRelation)} ${b!.label}`});}
      break;
    }
    case "groupedEvaluate": case "groupedFirst":{
      const g=spec.group;if(!g)throw new Error(`exactNumberLab ${spec.task} requires group data`);
      const inner=g.innerOp==="add"?g.a+g.b:g.a-g.b;
      stages.push({key:"group:inner",label:"evaluate the grouping first",value:`${g.a} ${g.innerOp==="add"?"+":"−"} ${g.b} = ${inner}`});
      if(spec.task==="groupedFirst")answerClaim="first:group";
      else{const outer=g.groupSide==="left"?(g.outerOp==="multiply"?inner*g.c:inner/g.c):(g.outerOp==="multiply"?g.c*inner:g.c/inner);answerNumber=exactClean(outer);stages.push({key:"group:outer",label:"apply the outside operation",value:`result = ${fmt(answerNumber)}`});}
      break;
    }
    case "powerEvaluate": case "powerCompare":{
      if(values.length<(spec.task==="powerCompare"?2:1)||values.some(v=>v.kind!=="power"))throw new Error(`exactNumberLab ${spec.task} requires power values`);
      for(const v of values){const p=v as Extract<ExactNumberSource,{kind:"power"}>;stages.push({key:`power:${p.id}:expand`,label:`expand ${p.label}`,value:Array(Math.max(1,p.exponent)).fill(String(p.base)).join(" × ")},{key:`power:${p.id}:value`,label:`evaluate ${p.label}`,value:`${p.label} = ${fmt(Math.pow(p.base,p.exponent))}`});}
      if(spec.task==="powerEvaluate")answerNumber=exactNumberApprox(values[0]!);else answerRelation=exactCompare(values[0]!,values[1]!);
      break;
    }
    case "inequalityMembership": case "inequalityExtremum":{
      const q=spec.inequality;if(!q)throw new Error(`exactNumberLab ${spec.task} requires inequality data`);
      const inclusive=q.operator==="le"||q.operator==="ge",direction=q.operator==="lt"||q.operator==="le"?"left":"right";
      stages.push({key:"inequality:boundary",label:"read the boundary",value:`${inclusive?"closed":"open"} boundary at ${fmt(q.boundary)}`},{key:"inequality:direction",label:"read the solution direction",value:`solutions extend ${direction}`});
      if(spec.task==="inequalityMembership"){
        if(typeof q.candidate!=="number")throw new Error("exactNumberLab inequalityMembership requires a candidate");
        const holds=exactInequalityHolds(q.operator,q.candidate,q.boundary);stages.push({key:"inequality:test",label:"test the candidate",value:`${fmt(q.candidate)} ${holds?"satisfies":"does not satisfy"} the inequality`});answerClaim=holds?"membership:yes":"membership:no";
      }else answerClaim=q.operator==="gt"||q.operator==="ge"?"extremum:no-largest":"extremum:no-smallest";
      break;
    }
    case "rationalOperation":{
      if(values.length!==2||!spec.operation)throw new Error("exactNumberLab rationalOperation requires two rational values and an operation");
      const a=exactSourceRational(values[0]!),b=exactSourceRational(values[1]!);if(!a||!b)throw new Error("exactNumberLab rationalOperation requires rational values");
      stages.push({key:"rational:normalize",label:"normalize the signed values",value:`${exactRationalKey(a)} and ${exactRationalKey(b)}`});
      answerRational=exactApply(a,b,spec.operation);answerNumber=exactRationalNumber(answerRational);
      stages.push({key:"rational:operate",label:`${spec.operation} exactly`,value:`${exactRationalKey(a)} ${spec.operation==="add"?"+":spec.operation==="subtract"?"−":spec.operation==="multiply"?"×":"÷"} ${exactRationalKey(b)} = ${exactRationalKey(answerRational)}`});
      break;
    }
    case "rootClassify":{
      if(values.length!==1||values[0]!.kind!=="root")throw new Error("exactNumberLab rootClassify requires one root");
      const root=values[0] as Extract<ExactNumberSource,{kind:"root"}>,lower=Math.floor(Math.sqrt(root.radicand)),exact=lower*lower===root.radicand;
      stages.push({key:"root:lower-square",label:"lower perfect square",value:`${lower}² = ${lower*lower}`},{key:"root:upper-square",label:exact?"exact square":"upper perfect square",value:exact?`${root.label} = ${lower}`:`${lower+1}² = ${(lower+1)*(lower+1)}`});
      answerClaim=exact?`root:rational:${lower}`:"root:irrational";break;
    }
    case "rootSelect": case "rootList":{
      if(!spec.targetClass)throw new Error(`exactNumberLab ${spec.task} requires targetClass`);
      values.forEach(v=>{if(v.kind!=="root")throw new Error(`exactNumberLab ${spec.task} requires root values`);const n=v.radicand,k=Math.floor(Math.sqrt(n));stages.push({key:`root:${v.id}`,label:`classify ${v.label}`,value:k*k===n?`rational: ${k}² = ${n}`:`irrational: ${k}² < ${n} < ${(k+1)}²`});});
      answerClaim=`root-target:${spec.targetClass}`;break;
    }
    case "rootBracket":{
      if(typeof spec.targetRadicand!=="number"||typeof spec.lower!=="number"||typeof spec.upper!=="number")throw new Error("exactNumberLab rootBracket requires radicand and endpoints");
      const lo=exactClean(spec.lower*spec.lower),hi=exactClean(spec.upper*spec.upper);stages.push({key:"root:lower-square",label:"square the lower endpoint",value:`${fmt(spec.lower)}² = ${fmt(lo)}`},{key:"root:upper-square",label:"square the upper endpoint",value:`${fmt(spec.upper)}² = ${fmt(hi)}`});
      answerClaim=`interval:${fmt(spec.lower)}:${fmt(spec.upper)}`;break;
    }
    case "squareEvaluate":{
      if(values.length!==1)throw new Error("exactNumberLab squareEvaluate requires one value");const n=exactNumberApprox(values[0]!);answerNumber=exactClean(n*n);stages.push({key:"square:multiply",label:"multiply the value by itself",value:`${fmt(n)} × ${fmt(n)} = ${fmt(answerNumber)}`});break;
    }
    case "densityWitness":{
      if(typeof spec.lower!=="number"||typeof spec.upper!=="number"||!(spec.lower<spec.upper))throw new Error("exactNumberLab densityWitness requires lower < upper");const mid=exactClean((spec.lower+spec.upper)/2);stages.push({key:"density:midpoint",label:"construct a midpoint",value:`(${fmt(spec.lower)} + ${fmt(spec.upper)}) ÷ 2 = ${fmt(mid)}`});answerClaim="density:yes";break;
    }
    case "densityPrinciple":stages.push({key:"density:rule",label:"midpoint rule",value:"for a < b, (a + b) / 2 lies strictly between them"}),answerClaim="density:always";break;
    /* S160 radical tasks. Every derivation is INTEGER-exact: a radical term is (coefficient,
     * radicand) and a simplification is only accepted when the extracted quotient is a perfect
     * square, so no float rounding can ever decide an answer. Each branch throws rather than
     * guessing when its preconditions fail — an unsatisfiable spec is a build error, never a
     * silently wrong number. */
    case "radicalSimplifyCoef": case "radicalCombine": case "radicalProduct":{
      const roots=values.filter(v=>v.kind==="root") as Extract<ExactNumberSource,{kind:"root"}>[];
      if(roots.length===0)throw new Error(`exactNumberLab ${spec.task} requires root values`);
      const target=spec.targetRadicand??1;
      /** c·√r expressed over √target: r must be target×(perfect square). */
      const overTarget=(c:number,r:number,label:string)=>{
        if(r%target!==0)throw new Error(`exactNumberLab ${spec.task}: ${label} radicand ${r} is not a multiple of target radicand ${target}`);
        const q=r/target,k=Math.round(Math.sqrt(q));
        if(k*k!==q)throw new Error(`exactNumberLab ${spec.task}: ${label} leaves ${q} outside the radical, which is not a perfect square`);
        return c*k;
      };
      if(spec.task==="radicalProduct"){
        const coef=roots.reduce((acc,v)=>acc*(v.coefficient??1),1);
        const rad=roots.reduce((acc,v)=>acc*v.radicand,1);
        stages.push({key:"radical:multiply",label:"multiply coefficients and radicands",value:`${fmt(coef)} × √${rad}`});
        const out=overTarget(coef,rad,"product");
        stages.push({key:"radical:extract",label:target===1?"take the whole square root":`extract squares over √${target}`,value:target===1?`√${rad} = ${fmt(out/ (coef||1))}`:`${fmt(coef)}√${rad} = ${fmt(out)}√${target}`});
        answerNumber=exactClean(out);break;
      }
      if(spec.task==="radicalSimplifyCoef"){
        const only=roots[0]!;
        stages.push({key:"radical:factor",label:"factor the radicand",value:`${only.radicand} = ${only.radicand/target} × ${target}`});
        const out=overTarget(only.coefficient??1,only.radicand,only.label);
        stages.push({key:"radical:extract",label:"take the square root of the perfect-square factor",value:`${only.label} = ${fmt(out)}√${target}`});
        answerNumber=exactClean(out);break;
      }
      if(!spec.operation||(spec.operation!=="add"&&spec.operation!=="subtract"))throw new Error("exactNumberLab radicalCombine requires operation add or subtract");
      if(roots.length!==2)throw new Error("exactNumberLab radicalCombine requires exactly two root values");
      const [a,b]=roots as [Extract<ExactNumberSource,{kind:"root"}>,Extract<ExactNumberSource,{kind:"root"}>];
      const ca=overTarget(a.coefficient??1,a.radicand,a.label),cb=overTarget(b.coefficient??1,b.radicand,b.label);
      stages.push({key:"radical:like-terms",label:`write both over √${target}`,value:`${fmt(ca)}√${target} and ${fmt(cb)}√${target}`});
      const out=spec.operation==="add"?ca+cb:ca-cb;
      stages.push({key:"radical:combine",label:`${spec.operation} the coefficients`,value:`${fmt(ca)} ${spec.operation==="add"?"+":"−"} ${fmt(cb)} = ${fmt(out)}`});
      answerNumber=exactClean(out);break;
    }
    /* S163 logarithm tasks. Both are INTEGER-exact and throw rather than approximate: a
     * logarithm is only evaluated when the argument is an exact integer power of the base
     * (rational arguments like 1/16 are supported via reciprocal powers), so no float rounding
     * can decide an answer. Prompts that supply an authored constant and ask for a rounded
     * decimal are deliberately NOT modelled here — see ENGINE_COVERAGE_S154 §S162. */
    /* S164 equation-solving logarithm tasks. Both re-derive x from the SURFACE coefficients
     * (never from a pre-chosen answer), throw on a non-positive-integer solution, and are
     * integer-exact throughout. */
    /* S165 radical-equation tasks. All integer-exact: every division asserts divisibility and
     * every root asserts a perfect power, so a float can never decide an answer. Each derives x
     * from the SURFACE coefficients, never from a pre-chosen answer. */
    case "radicalEquationSolve":{
      const idx=spec.radRootIndex??2,k=spec.radInsideCoef??1,b=spec.radInsideConst??0,m=spec.radOuterCoef??1,dd=spec.radOuterConst??0,rhs=spec.radRhs;
      if(typeof rhs!=="number")throw new Error("exactNumberLab radicalEquationSolve requires radRhs");
      if(idx!==2&&idx!==3)throw new Error(`exactNumberLab radicalEquationSolve: root index must be 2 or 3, got ${idx}`);
      if(m===0||k===0)throw new Error("exactNumberLab radicalEquationSolve: zero coefficient");
      const iso=rhs-dd;
      if(iso%m!==0)throw new Error(`exactNumberLab radicalEquationSolve: (rhs - outer constant) ${iso} is not divisible by outer coefficient ${m}`);
      const root=iso/m;
      if(idx===2&&root<0)throw new Error("exactNumberLab radicalEquationSolve: a principal square root cannot be negative");
      const powered=Math.pow(root,idx),inner=powered-b;
      if(inner%k!==0)throw new Error(`exactNumberLab radicalEquationSolve: (root^index - inside constant) ${inner} is not divisible by inside coefficient ${k}`);
      const x=inner/k;
      stages.push({key:"radeq:isolate",label:"isolate the radical",value:`root = ${fmt(root)}`},
        {key:"radeq:power",label:idx===2?"square both sides":"cube both sides",value:`${fmt(root)}^${fmt(idx)} = ${fmt(powered)}`},
        {key:"radeq:solve",label:"solve the remaining linear equation",value:`x = ${fmt(x)}`});
      answerNumber=exactClean(x);break;
    }
    case "radicalEquationExtraneous":{
      const a=spec.extInsideConst,b=spec.extRhsShift;
      if(typeof a!=="number"||typeof b!=="number")throw new Error("exactNumberLab radicalEquationExtraneous requires extInsideConst and extRhsShift");
      /* sqrt(x+a) = x-b  =>  x^2 - (2b+1)x + (b^2-a) = 0. Keep the root that satisfies the
       * ORIGINAL equation (x > b and x + a >= 0); throw when no integer root survives. */
      const B=2*b+1,C=b*b-a,disc=B*B-4*C;
      if(disc<0)throw new Error("exactNumberLab radicalEquationExtraneous: negative discriminant");
      const r=Math.sqrt(disc);
      if(!Number.isInteger(r))throw new Error("exactNumberLab radicalEquationExtraneous: irrational roots");
      const cands=[(B+r)/2,(B-r)/2].filter(x=>Number.isInteger(x)&&x>=b&&x+a>=0&&(x-b)*(x-b)===x+a);
      if(cands.length===0)throw new Error("exactNumberLab radicalEquationExtraneous: no valid integer solution");
      const x=Math.max(...cands);
      stages.push({key:"radx:square",label:"square both sides",value:`x + ${fmt(a)} = (x ${sign(-b)})^2`},
        {key:"radx:quadratic",label:"solve the quadratic",value:`x^2 - ${fmt(B)}x + ${fmt(C)} = 0`},
        {key:"radx:check",label:"reject the extraneous root by checking the original",value:`x = ${fmt(x)}`});
      answerNumber=exactClean(x);break;
    }
    case "rationalExponentSolve":{
      const c=spec.rexCoef??1,sh=spec.rexShift??0,pp=spec.rexP,q=spec.rexQ,rhs=spec.rexRhs;
      if(typeof pp!=="number"||typeof q!=="number"||typeof rhs!=="number")throw new Error("exactNumberLab rationalExponentSolve requires rexP, rexQ, rexRhs");
      if(c===0)throw new Error("exactNumberLab rationalExponentSolve: zero coefficient");
      if(rhs%c!==0)throw new Error(`exactNumberLab rationalExponentSolve: rhs ${rhs} is not divisible by coefficient ${c}`);
      const base=rhs/c;
      if(base<=0)throw new Error("exactNumberLab rationalExponentSolve: isolated power must be positive");
      const t=Math.round(Math.pow(base,1/pp));
      if(Math.pow(t,pp)!==base)throw new Error(`exactNumberLab rationalExponentSolve: ${base} is not a perfect ${fmt(pp)}th power`);
      const x=Math.pow(t,q)-sh;
      stages.push({key:"rex:isolate",label:"isolate the power",value:`(x ${sign(sh)})^(${fmt(pp)}/${fmt(q)}) = ${fmt(base)}`},
        {key:"rex:invert",label:`raise both sides to ${fmt(q)}/${fmt(pp)}`,value:`x ${sign(sh)} = ${fmt(base)}^(${fmt(q)}/${fmt(pp)}) = ${fmt(Math.pow(t,q))}`},
        {key:"rex:solve",label:"solve for x",value:`x = ${fmt(x)}`});
      answerNumber=exactClean(x);break;
    }
    /* S166 calculus tasks. Both are exact-arithmetic pattern-matches on the SURFACE structure of a
     * limit or a polynomial — never a numeric approximation of a transcendental quantity. */
    case "rationalLimitAtInfinity":{
      const dn=spec.limDegNum,dd=spec.limDegDenom,ln=spec.limLeadNum,ld=spec.limLeadDenom;
      if(typeof dn!=="number"||typeof dd!=="number"||typeof ln!=="number"||typeof ld!=="number")throw new Error("exactNumberLab rationalLimitAtInfinity requires limDegNum, limDegDenom, limLeadNum, limLeadDenom");
      if(ld===0)throw new Error("exactNumberLab rationalLimitAtInfinity: zero leading denominator coefficient");
      if(dn>dd){
        stages.push({key:"lim:degree",label:"compare the degrees of numerator and denominator",value:`degree ${fmt(dn)} > degree ${fmt(dd)}`});
        throw new Error("exactNumberLab rationalLimitAtInfinity: numerator degree exceeds denominator degree — no finite limit");
      }
      if(dn<dd){
        stages.push({key:"lim:degree",label:"compare the degrees of numerator and denominator",value:`degree ${fmt(dn)} < degree ${fmt(dd)}`},
          {key:"lim:value",label:"the denominator dominates, so the limit is 0",value:"0"});
        answerNumber=0;break;
      }
      stages.push({key:"lim:degree",label:"compare the degrees of numerator and denominator",value:`degree ${fmt(dn)} = degree ${fmt(dd)}`},
        {key:"lim:value",label:"equal degrees: the limit is the ratio of leading coefficients",value:`${fmt(ln)}/${fmt(ld)} = ${fmt(ln/ld)}`});
      answerNumber=exactClean(ln/ld);break;
    }
    case "polynomialEvaluate":{
      const coefs=spec.polyCoefficients,x=spec.polyAt;
      if(!Array.isArray(coefs)||coefs.length===0||typeof x!=="number")throw new Error("exactNumberLab polynomialEvaluate requires polyCoefficients (descending powers) and polyAt");
      let acc=0;const terms:string[]=[];
      for(let i=0;i<coefs.length;i++){const power=coefs.length-1-i;acc=acc*x+coefs[i];if(coefs[i]!==0)terms.push(power===0?fmt(coefs[i]):`${fmt(coefs[i])}·${fmt(x)}^${fmt(power)}`);}
      stages.push({key:"poly:substitute",label:"substitute the input value into every term",value:terms.join(" + ")||"0"},
        {key:"poly:evaluate",label:"evaluate (Horner's method)",value:`${fmt(acc)}`});
      answerNumber=exactClean(acc);break;
    }
    /* S167. Integrates a polynomial rate one or two times, pinning each constant with the
     * authored initial condition, then evaluates at the target. Every integrated coefficient must
     * come out an integer: a non-terminating rational (e.g. integrating x^2 to x^3/3) cannot be
     * held exactly in binary floating point, so the branch throws rather than let a rounded
     * coefficient decide an answer. */
    case "antiderivativeInitialValue":{
      const rate=spec.aivRate,order=spec.aivOrder??1,x0=spec.aivAt0,init=spec.aivInit,target=spec.aivTarget;
      if(!Array.isArray(rate)||rate.length===0||typeof x0!=="number"||!Array.isArray(init)||typeof target!=="number")throw new Error("exactNumberLab antiderivativeInitialValue requires aivRate, aivAt0, aivInit, aivTarget");
      if(order!==1&&order!==2)throw new Error(`exactNumberLab antiderivativeInitialValue: order must be 1 or 2, got ${order}`);
      if(init.length!==order)throw new Error(`exactNumberLab antiderivativeInitialValue: expected ${fmt(order)} initial value(s), got ${fmt(init.length)}`);
      const evalPoly=(coefs:number[],x:number)=>coefs.reduce((acc,c)=>acc*x+c,0);
      /* Integrate descending-power coefficients, leaving the constant term as 0 for now. */
      const integrate=(coefs:number[]):number[]=>{
        const deg=coefs.length-1;
        const out=coefs.map((c,i)=>{const power=deg-i,next=power+1,v=c/next;
          if(!Number.isInteger(v))throw new Error(`exactNumberLab antiderivativeInitialValue: integrating ${fmt(c)}x^${fmt(power)} gives the non-terminating coefficient ${fmt(c)}/${fmt(next)}`);
          return v});
        return [...out,0];
      };
      let current=rate;
      for(let level=0;level<order;level++){
        const anti=integrate(current);
        /* Pin the constant so the antiderivative matches the authored initial value at x0. The
         * initial conditions are given lowest-order first: for order 2 that is [v(x0), s(x0)]. */
        const want=init[level]!;
        const constant=want-evalPoly(anti,x0);
        anti[anti.length-1]=constant;
        stages.push({key:`aiv:integrate${level+1}`,label:level===0?"integrate the rate":"integrate again",value:`constant pinned to ${fmt(constant)} by the given value ${fmt(want)} at x = ${fmt(x0)}`});
        current=anti;
      }
      const answer=evalPoly(current,target);
      stages.push({key:"aiv:evaluate",label:"evaluate at the target input",value:`${fmt(answer)}`});
      answerNumber=exactClean(answer);break;
    }
    /* S170. Solves a1x+b1y=c1, a2x+b2y=c2 by Cramer\'s rule. Throws on a singular system (parallel
     * lines) and on a non-integer solution rather than round — the determinant division must land
     * exactly, or the answer is not stated with confidence. */
    case "linearSystemSolve":{
      const a1=spec.sysA1,b1=spec.sysB1,c1=spec.sysC1,a2=spec.sysA2,b2=spec.sysB2,c2=spec.sysC2,ask=spec.sysAsk;
      if([a1,b1,c1,a2,b2,c2].some(v=>typeof v!=="number")||(ask!=="x"&&ask!=="y"))throw new Error("exactNumberLab linearSystemSolve requires sysA1, sysB1, sysC1, sysA2, sysB2, sysC2, sysAsk");
      const det=a1!*b2!-a2!*b1!;
      if(det===0)throw new Error("exactNumberLab linearSystemSolve: the system is singular (parallel or identical lines)");
      const x=(c1!*b2!-c2!*b1!)/det,y=(a1!*c2!-a2!*c1!)/det;
      if(!Number.isInteger(x)||!Number.isInteger(y))throw new Error(`exactNumberLab linearSystemSolve: solution (${fmt(x)}, ${fmt(y)}) is not integer-exact`);
      stages.push({key:"sys:eliminate",label:"eliminate one variable",value:`determinant = ${fmt(det)}`},
        {key:"sys:solve",label:"solve for both coordinates",value:`(x, y) = (${fmt(x)}, ${fmt(y)})`});
      answerNumber=ask==="x"?x:y;break;
    }
    /* S171. Finds every INTEGER root of a monic polynomial by testing rational-root-theorem
     * candidates via direct substitution (Horner). Requires a monic leading coefficient (1) —
     * a non-monic case would need the full p/q candidate search, deliberately out of scope here
     * rather than approximated. Throws if the requested mode has no roots to report. */
    case "polynomialIntegerRoots":{
      const coefs=spec.pirCoefficients,mode=spec.pirMode;
      if(!Array.isArray(coefs)||coefs.length<2||!mode)throw new Error("exactNumberLab polynomialIntegerRoots requires pirCoefficients and pirMode");
      if(coefs[0]!==1)throw new Error("exactNumberLab polynomialIntegerRoots: leading coefficient must be 1 (monic) — this task does not search rational (non-integer) candidates");
      const constTerm=coefs[coefs.length-1];
      if(constTerm===0)throw new Error("exactNumberLab polynomialIntegerRoots: a zero constant term admits x=0 plus a lower-degree factor, outside this task's scope");
      const evalPoly=(x:number)=>coefs.reduce((acc,c)=>acc*x+c,0);
      const divisors:number[]=[];
      for(let d=1;d<=Math.abs(constTerm);d++)if(constTerm%d===0)divisors.push(d);
      const roots=new Set<number>();
      for(const d of divisors){if(evalPoly(d)===0)roots.add(d);if(evalPoly(-d)===0)roots.add(-d);}
      const found=[...roots].sort((a,b)=>a-b);
      if(found.length===0)throw new Error("exactNumberLab polynomialIntegerRoots: no integer roots found among the rational-root candidates");
      stages.push({key:"pir:candidates",label:"test each divisor of the constant term",value:`candidates ±{${divisors.join(", ")}}`},
        {key:"pir:roots",label:"the integer roots that check out",value:`{${found.join(", ")}}`});
      const answer=mode==="largest"?Math.max(...found):mode==="smallest"?Math.min(...found):mode==="sum"?found.reduce((a,b)=>a+b,0):found.length;
      answerNumber=exactClean(answer);break;
    }
    /* S172. Rational-root-theorem CANDIDATE COUNTING — a genuinely different operation from
     * candidate TESTING (polynomialIntegerRoots): here nothing is substituted into the
     * polynomial, only divisor pairs are enumerated and reduced fractions deduplicated by exact
     * integer GCD, never by float comparison. */
    case "rationalRootCandidateCount":{
      const lead=spec.rrcLeading,constTerm=spec.rrcConstant;
      if(typeof lead!=="number"||typeof constTerm!=="number")throw new Error("exactNumberLab rationalRootCandidateCount requires rrcLeading and rrcConstant");
      if(lead<=0||constTerm===0)throw new Error("exactNumberLab rationalRootCandidateCount: leading coefficient must be positive and constant term nonzero");
      const divisorsOf=(n:number)=>{const out:number[]=[];for(let d=1;d<=n;d++)if(n%d===0)out.push(d);return out};
      const gcd=(a:number,b:number):number=>b===0?a:gcd(b,a%b);
      const dq=divisorsOf(Math.abs(constTerm)),dp=divisorsOf(Math.abs(lead));
      const distinct=new Set<string>();
      for(const q of dq)for(const p of dp){const g=gcd(q,p);distinct.add(`${q/g}/${p/g}`)}
      stages.push({key:"rrc:divisors",label:"list the divisors of the constant term and leading coefficient",value:`|const| divisors {${dq.join(", ")}}, |lead| divisors {${dp.join(", ")}}`},
        {key:"rrc:reduce",label:"reduce every quotient and drop duplicates",value:`${distinct.size} distinct positive value(s)`});
      answerNumber=distinct.size*2;break;
    }
    /* Zero-COUNTING is distinct from zero-FINDING: no polynomial is evaluated, only the given
     * factor multiplicities or degree/real-count data is combined arithmetically. */
    case "polynomialZeroCount":{
      const mode=spec.pzcMode;
      if(mode==="total"||mode==="distinct"){
        const mults=spec.pzcMultiplicities;
        if(!Array.isArray(mults)||mults.length===0||mults.some(m=>!Number.isInteger(m)||m<1))throw new Error("exactNumberLab polynomialZeroCount requires pzcMultiplicities as positive integers");
        if(mode==="total"){
          stages.push({key:"pzc:sum",label:"sum every factor's multiplicity",value:`${mults.join(" + ")} = ${mults.reduce((a,b)=>a+b,0)}`});
          answerNumber=mults.reduce((a,b)=>a+b,0);
        }else{
          stages.push({key:"pzc:count",label:"count the distinct factors listed, ignoring multiplicity",value:`${mults.length} distinct factor(s)`});
          answerNumber=mults.length;
        }
      }else if(mode==="nonReal"){
        const deg=spec.pzcDegree,real=spec.pzcRealCount;
        if(typeof deg!=="number"||typeof real!=="number")throw new Error("exactNumberLab polynomialZeroCount (nonReal) requires pzcDegree and pzcRealCount");
        if(real>deg||real<0)throw new Error("exactNumberLab polynomialZeroCount: real zero count cannot exceed the degree");
        stages.push({key:"pzc:degree",label:"total zeros equal the degree, counted with multiplicity",value:`degree ${fmt(deg)}`},
          {key:"pzc:nonreal",label:"subtract the given real (simple) zeros",value:`${fmt(deg)} - ${fmt(real)} = ${fmt(deg-real)}`});
        answerNumber=deg-real;
      }else throw new Error("exactNumberLab polynomialZeroCount requires a valid pzcMode");
      break;
    }
    /* S173. The inverse direction of sinDeg/cosDeg: given integer vector components, name the
     * angle ONLY when it falls on the same standard-special-angle whitelist — an axis (x=0 or
     * y=0) or a 45-degree diagonal (|x|=|y|). Any other ratio (e.g. components giving a 1:2
     * slope) has no closed-form angle and throws rather than approximate one via atan2.
     * A generic scale factor is a genuine second method: it is not restated FROM the answer, it
     * is derived from the SAME components the quadrant/base-angle logic already consumed. */
    case "vectorDirectionAngle":{
      const x=spec.vdaX,y=spec.vdaY;
      if(typeof x!=="number"||typeof y!=="number")throw new Error("exactNumberLab vectorDirectionAngle requires vdaX and vdaY");
      if(x===0&&y===0)throw new Error("exactNumberLab vectorDirectionAngle: the zero vector has no direction");
      let base:number;
      if(x===0)base=90;
      else if(y===0)base=0;
      else if(Math.abs(x)===Math.abs(y))base=45;
      else throw new Error(`exactNumberLab vectorDirectionAngle: (${fmt(x)}, ${fmt(y)}) is not on a standard special-angle axis or diagonal — arbitrary-angle direction is out of scope`);
      let angle:number;
      if(x===0)angle=y>0?90:270;
      else if(y===0)angle=x>0?0:180;
      else angle=x>0?(y>0?45:315):(y>0?135:225);
      stages.push({key:"vda:quadrant",label:"locate the quadrant from the signs of the components",value:`(${fmt(x)}, ${fmt(y)})`},
        {key:"vda:angle",label:`a ${fmt(base)}° reference angle placed in that quadrant`,value:`${fmt(angle)}°`});
      answerNumber=angle;break;
    }
    /* S178. The smallest degree admitting a given number of turning points, RESPECTING the
     * end-behavior parity constraint when the problem states one. This exists because turns+1
     * alone is only correct when it happens to land on the required parity — see KNOWN_ISSUES.md
     * for the S176/S177 reversal that motivated it. Opposite end behaviours ("falls left, rises
     * right") force an ODD degree; matching ends force an EVEN degree; an unconstrained problem
     * takes turns+1 directly. */
    case "polynomialMinimumDegree":{
      const turns=spec.pmdTurningPoints,end=spec.pmdEndBehavior??"unconstrained";
      if(typeof turns!=="number"||!Number.isInteger(turns)||turns<0)throw new Error("exactNumberLab polynomialMinimumDegree requires a non-negative integer pmdTurningPoints");
      const floor=turns+1;
      let degree=floor;
      if(end!=="unconstrained"){
        const wantOdd=end==="opposite";
        if((degree%2===1)!==wantOdd)degree+=1;
        stages.push({key:"pmd:floor",label:"a degree-n polynomial has at most n \u2212 1 turning points",value:`degree \u2265 ${fmt(turns)} + 1 = ${fmt(floor)}`},
          {key:"pmd:parity",label:end==="opposite"?"opposite end behaviours require an ODD degree":"matching end behaviours require an EVEN degree",value:`smallest such degree is ${fmt(degree)}`});
      }else{
        stages.push({key:"pmd:floor",label:"a degree-n polynomial has at most n \u2212 1 turning points",value:`degree \u2265 ${fmt(turns)} + 1 = ${fmt(floor)}`});
      }
      answerNumber=degree;break;
    }
    /* S180: solve coef · base^x = rhs for an INTEGER exponent x, where base and rhs are exact
     * rationals (integer parts). The exponent is found by exact cross-multiplication testing over
     * x in [-12, 12] — coef · bn^x · rd === rn · bd^x (with the base flipped for negative x) —
     * never via Math.log, so a rounded logarithm can never propagate into an answer. Exactly one
     * hit is required; zero or several hits throw rather than guess (base 1, or a target no
     * integer power reaches, are refused by design). */
    case "exponentSolve":{
      const coef=spec.esCoef??1,bn=spec.esBaseNum,bd=spec.esBaseDen??1,rn=spec.esRhsNum,rd=spec.esRhsDen??1;
      if(typeof bn!=="number"||typeof rn!=="number")throw new Error("exactNumberLab exponentSolve requires esBaseNum and esRhsNum");
      for(const part of [coef,bn,bd,rn,rd])if(!Number.isInteger(part)||part<=0)throw new Error("exactNumberLab exponentSolve requires positive integer coefficient, base parts, and target parts");
      if(bn===bd)throw new Error("exactNumberLab exponentSolve: a base of 1 is solved by every exponent");
      const ipow=(base:number,k:number):number=>{let out=1;for(let i=0;i<k;i++){out*=base;if(!Number.isSafeInteger(out))throw new Error("exactNumberLab exponentSolve: power exceeds the exact integer range")}return out};
      const hits:number[]=[];
      for(let x=-12;x<=12;x++){
        const k=Math.abs(x),pn=ipow(x>=0?bn:bd,k),pd=ipow(x>=0?bd:bn,k);
        if(coef*pn*rd===rn*pd)hits.push(x);
      }
      if(hits.length!==1)throw new Error(`exactNumberLab exponentSolve: expected exactly one integer exponent in [-12, 12], found ${hits.length}`);
      const x=hits[0]!;
      const baseText=bd===1?fmt(bn):`${fmt(bn)}/${fmt(bd)}`,rhsText=rd===1?fmt(rn):`${fmt(rn)}/${fmt(rd)}`;
      stages.push({key:"exp:base",label:"identify the base",value:`base ${baseText}`});
      if(coef!==1)stages.push({key:"exp:isolate",label:"divide off the coefficient first",value:`${rhsText} \u00f7 ${fmt(coef)} = ${rd===1&&rn%coef===0?fmt(rn/coef):`${rhsText}/${fmt(coef)}`}`});
      stages.push({key:"exp:power",label:"write the isolated value as a power of the base",value:`${baseText}^${fmt(x)}`},
        {key:"exp:read",label:"read the exponent",value:`x = ${fmt(x)}`});
      answerNumber=x;break;
    }
    case "logarithmEqualArguments":{
      const A=spec.logCoefA,B=spec.logConstB,Q=spec.logConstQ;
      if(typeof A!=="number"||typeof B!=="number"||typeof Q!=="number")throw new Error("exactNumberLab logarithmEqualArguments requires logCoefA, logConstB, logConstQ");
      if(A===1)throw new Error("exactNumberLab logarithmEqualArguments: coefficient of x cannot be 1 on both sides");
      const x=(Q-B)/(A-1);
      stages.push({key:"logeq:equal",label:"equal logs (same valid base) mean equal arguments",value:`${fmt(A)}x ${sign(B)} = x ${sign(Q)}`},
        {key:"logeq:solve",label:"solve the resulting linear equation",value:`x = ${fmt(x)}`});
      answerNumber=exactClean(x);break;
    }
    case "logarithmSumQuadratic":{
      const b=spec.logBase,m=spec.logShift,k=spec.logResult;
      if(typeof b!=="number"||typeof m!=="number"||typeof k!=="number")throw new Error("exactNumberLab logarithmSumQuadratic requires logBase, logShift, logResult");
      if(!(b>1))throw new Error(`exactNumberLab logarithmSumQuadratic needs base>1, got ${b}`);
      const rhs=Math.pow(b,k),disc=m*m+4*rhs;
      if(disc<0)throw new Error("exactNumberLab logarithmSumQuadratic: negative discriminant");
      const root=Math.sqrt(disc),x=(-m+root)/2;
      if(!(x>0))throw new Error(`exactNumberLab logarithmSumQuadratic: no positive solution (got ${x})`);
      stages.push({key:"logsum:product",label:"the product rule condenses the sum",value:`x(x ${sign(m)}) = ${fmt(b)}^${fmt(k)} = ${fmt(rhs)}`},
        {key:"logsum:quadratic",label:"solve the quadratic, keeping the positive root",value:`x = ${fmt(x)}`});
      answerNumber=exactClean(x);break;
    }
    case "approximationEvaluate":{
      const cs=spec.approxConstants,f=spec.approxFormula;
      if(!cs||cs.length===0||!f)throw new Error("exactNumberLab approximationEvaluate requires approxConstants and approxFormula");
      for(const c of cs)stages.push({key:`approx:${c.id}`,label:`use the given ${c.label}`,value:`${c.label} = ${fmt(c.value)}`});
      const raw=evalApproxExpr(f,cs),places=spec.approxRound??0,mult=Math.pow(10,places);
      const rounded=Math.round(raw*mult)/mult;
      if(!Number.isFinite(rounded))throw new Error("exactNumberLab approximationEvaluate produced a non-finite result");
      stages.push({key:"approx:compute",label:places===0?"combine and round to the nearest whole number":`combine and round to ${places} decimal place${places===1?"":"s"}`,value:`${fmt(rounded)}`});
      answerNumber=rounded;break;
    }
    case "logarithmEvaluate":{
      const b=spec.logBase,x=spec.logArgument;
      if(typeof b!=="number"||typeof x!=="number")throw new Error("exactNumberLab logarithmEvaluate requires logBase and logArgument");
      if(!(b>1)||!(x>0))throw new Error(`exactNumberLab logarithmEvaluate needs base>1 and argument>0, got base ${b} argument ${x}`);
      const approx=Math.log(x)/Math.log(b);let k:number|undefined;
      for(const c of [Math.floor(approx),Math.round(approx),Math.ceil(approx)])if(Math.abs(Math.pow(b,c)-x)<1e-9){k=c;break}
      if(k===undefined)throw new Error(`exactNumberLab logarithmEvaluate: ${x} is not an exact power of ${b}`);
      stages.push({key:"log:base",label:"identify the base",value:`base ${fmt(b)}`},
        {key:"log:power",label:"write the argument as a power of the base",value:`${fmt(b)}^${fmt(k)} = ${fmt(x)}`},
        {key:"log:read",label:"read the exponent",value:`log_${fmt(b)} ${fmt(x)} = ${fmt(k)}`});
      answerNumber=exactClean(k);break;
    }
    case "logarithmArgument":{
      const b=spec.logBase,r=spec.logResult,dv=spec.logDivisor??1;
      if(typeof b!=="number"||typeof r!=="number")throw new Error("exactNumberLab logarithmArgument requires logBase and logResult");
      if(!(b>1))throw new Error(`exactNumberLab logarithmArgument needs base>1, got ${b}`);
      if(dv===0)throw new Error("exactNumberLab logarithmArgument cannot divide by zero");
      const whole=Math.pow(b,r),out=whole/dv;
      if(!Number.isFinite(out))throw new Error("exactNumberLab logarithmArgument produced a non-finite argument");
      stages.push({key:"log:exponential",label:"rewrite in exponential form",value:`${fmt(b)}^${fmt(r)} = ${fmt(whole)}`});
      if(dv!==1)stages.push({key:"log:divide",label:"undo the added logarithm",value:`${fmt(whole)} ÷ ${fmt(dv)} = ${fmt(out)}`});
      answerNumber=exactClean(out);break;
    }
    case "rationalExponentEvaluate":{
      const p0=values[0];
      if(!p0||p0.kind!=="power")throw new Error("exactNumberLab rationalExponentEvaluate requires one power value");
      const idx=p0.rootIndex??1;
      if(idx<1)throw new Error("exactNumberLab rationalExponentEvaluate requires a positive root index");
      const root=Math.round(Math.pow(p0.base,1/idx));
      if(Math.pow(root,idx)!==p0.base)throw new Error(`exactNumberLab rationalExponentEvaluate: ${p0.base} is not a perfect ${idx}th power`);
      stages.push({key:"exponent:root",label:`take the ${idx}th root of the base`,value:`${idx}th root of ${p0.base} = ${root}`},{key:"exponent:power",label:`raise to power ${p0.exponent}`,value:`${root}^${p0.exponent} = ${fmt(Math.pow(root,p0.exponent))}`});
      answerNumber=exactClean(Math.pow(root,p0.exponent));break;
    }
  }
  return{answerNumber,answerClaim,answerRelation,stages,answerRational};
}
export function exactNumberExplorationKeys(spec:ExactNumberTruthInput):string[]{return exactNumberTruth(spec).stages.map(stage=>stage.key)}
export function exactNumberChoiceCorrect(spec:ExactNumberTruthInput,choice:{claim?:string;numberValue?:number;relation?:ExactNumberRelation;interval?:readonly[number,number];source?:ExactNumberSource;sourceList?:readonly ExactNumberSource[]}):boolean{
  const truth=exactNumberTruth(spec);
  if(typeof choice.numberValue==="number"&&typeof truth.answerNumber==="number")return Math.abs(choice.numberValue-truth.answerNumber)<1e-9;
  if(choice.relation&&truth.answerRelation)return choice.relation===truth.answerRelation;
  if(choice.interval&&typeof spec.lower==="number"&&typeof spec.upper==="number")return Math.abs(choice.interval[0]-spec.lower)<1e-9&&Math.abs(choice.interval[1]-spec.upper)<1e-9;
  if(choice.source&&spec.task==="rootSelect"&&spec.targetClass)return exactNumberClass(choice.source)===spec.targetClass;
  if(choice.sourceList&&spec.task==="rootList"&&spec.targetClass)return choice.sourceList.length>0&&choice.sourceList.every(source=>exactNumberClass(source)===spec.targetClass);
  return Boolean(choice.claim&&choice.claim===truth.answerClaim);
}
const ApproxExprSpec:z.ZodType<import("./schema").ApproxExpr>=z.lazy(()=>z.union([
  z.object({op:z.literal("const"),id:z.string().min(1)}),
  z.object({op:z.literal("lit"),value:z.number().finite()}),
  z.object({op:z.enum(["add","subtract","multiply","divide"]),left:ApproxExprSpec,right:ApproxExprSpec}),
  z.object({op:z.literal("negate"),arg:ApproxExprSpec}),
  z.object({op:z.literal("sqrt"),arg:ApproxExprSpec}),
  z.object({op:z.literal("root"),index:z.number().int().min(2),arg:ApproxExprSpec}),
  z.object({op:z.literal("sinDeg"),degrees:z.number().finite()}),
  z.object({op:z.literal("cosDeg"),degrees:z.number().finite()}),
]));
const ExactNumberSourceSpec=z.discriminatedUnion("kind",[
  z.object({id:z.string().min(1),label:z.string().min(1),kind:z.literal("rational"),num:z.number().int(),den:z.number().int().refine((d)=>d!==0,{message:"denominator must not be zero"})}),
  z.object({id:z.string().min(1),label:z.string().min(1),kind:z.literal("power"),base:z.number().int(),exponent:z.number().int().min(0).max(12),rootIndex:z.number().int().min(1).max(12).optional()}),
  z.object({id:z.string().min(1),label:z.string().min(1),kind:z.literal("root"),radicand:z.number().int().positive(),coefficient:z.number().int().optional()})
]);
const ExactNumberChoiceSpec=z.object({id:z.string().min(1),label:z.string().min(1),feedback:z.string().min(1),claim:z.string().min(1).optional(),numberValue:z.number().finite().optional(),relation:z.enum(["lt","eq","gt"]).optional(),interval:z.tuple([z.number().finite(),z.number().finite()]).optional(),source:ExactNumberSourceSpec.optional(),sourceList:z.array(ExactNumberSourceSpec).min(1).max(8).optional()});
const ExactNumberNumericErrorSpec=z.object({value:z.number().finite(),feedback:z.string().min(1)});
const ExactNumberAuthoredStageSpec=z.object({title:z.string().min(1),body:z.string().min(1)});
export const ExactNumberLabSpec = z.object({
  type: z.literal("exactNumberLab"),task:z.enum(["fractionCompare","benchmarkDecision","groupedEvaluate","groupedFirst","powerEvaluate","powerCompare","inequalityMembership","inequalityExtremum","rationalOperation","rootClassify","rootSelect","rootList","rootBracket","squareEvaluate","densityWitness","densityPrinciple","radicalSimplifyCoef","radicalCombine","radicalProduct","rationalExponentEvaluate","logarithmEvaluate","logarithmArgument","approximationEvaluate","logarithmEqualArguments","logarithmSumQuadratic","radicalEquationSolve","radicalEquationExtraneous","rationalExponentSolve","rationalLimitAtInfinity","polynomialEvaluate","antiderivativeInitialValue","linearSystemSolve","polynomialIntegerRoots","rationalRootCandidateCount","polynomialZeroCount","vectorDirectionAngle","polynomialMinimumDegree","exponentSolve"]),answerMode:z.enum(["numeric","choice","relation","explore"]),prompt:z.string().min(1),values:z.array(ExactNumberSourceSpec).max(10).default([]),operation:z.enum(["add","subtract","multiply","divide"]).optional(),group:z.object({a:z.number().finite(),b:z.number().finite(),c:z.number().finite(),innerOp:z.enum(["add","subtract"]),outerOp:z.enum(["multiply","divide"]),groupSide:z.enum(["left","right"])}).optional(),inequality:z.object({operator:z.enum(["lt","le","gt","ge"]),boundary:z.number().finite(),candidate:z.number().finite().optional()}).optional(),targetClass:z.enum(["rational","irrational"]).optional(),targetRadicand:z.number().int().positive().optional(),logBase:z.number().finite().optional(),logArgument:z.number().finite().optional(),logResult:z.number().finite().optional(),logDivisor:z.number().finite().optional(),approxConstants:z.array(z.object({id:z.string().min(1),label:z.string().min(1),value:z.number().finite()})).max(6).optional(),approxFormula:ApproxExprSpec.optional(),approxRound:z.number().int().min(0).max(6).optional(),logCoefA:z.number().finite().optional(),logConstB:z.number().finite().optional(),logConstQ:z.number().finite().optional(),logShift:z.number().finite().optional(),radRootIndex:z.number().int().optional(),radInsideCoef:z.number().int().optional(),radInsideConst:z.number().int().optional(),radOuterCoef:z.number().int().optional(),radOuterConst:z.number().int().optional(),radRhs:z.number().int().optional(),extInsideConst:z.number().int().optional(),extRhsShift:z.number().int().optional(),rexCoef:z.number().int().optional(),rexShift:z.number().int().optional(),rexP:z.number().int().optional(),rexQ:z.number().int().optional(),rexRhs:z.number().int().optional(),limDegNum:z.number().int().optional(),limDegDenom:z.number().int().optional(),limLeadNum:z.number().finite().optional(),limLeadDenom:z.number().finite().optional(),polyCoefficients:z.array(z.number().finite()).optional(),polyAt:z.number().finite().optional(),aivRate:z.array(z.number().finite()).optional(),aivOrder:z.number().int().optional(),aivAt0:z.number().finite().optional(),aivInit:z.array(z.number().finite()).optional(),aivTarget:z.number().finite().optional(),sysA1:z.number().finite().optional(),sysB1:z.number().finite().optional(),sysC1:z.number().finite().optional(),sysA2:z.number().finite().optional(),sysB2:z.number().finite().optional(),sysC2:z.number().finite().optional(),sysAsk:z.enum(["x","y"]).optional(),pirCoefficients:z.array(z.number().int()).optional(),pirMode:z.enum(["largest","smallest","sum","count"]).optional(),rrcLeading:z.number().int().optional(),rrcConstant:z.number().int().optional(),pzcMode:z.enum(["total","distinct","nonReal"]).optional(),pzcMultiplicities:z.array(z.number().int()).optional(),pzcDegree:z.number().int().optional(),pzcRealCount:z.number().int().optional(),vdaX:z.number().finite().optional(),vdaY:z.number().finite().optional(),pmdTurningPoints:z.number().int().optional(),pmdEndBehavior:z.enum(["same","opposite","unconstrained"]).optional(),esCoef:z.number().int().positive().optional(),esBaseNum:z.number().int().positive().optional(),esBaseDen:z.number().int().positive().optional(),esRhsNum:z.number().int().positive().optional(),esRhsDen:z.number().int().positive().optional(),lower:z.number().finite().optional(),upper:z.number().finite().optional(),answerUnit:z.string().optional(),tolerance:z.number().nonnegative().default(0),choices:z.array(ExactNumberChoiceSpec).max(8).default([]),numericErrors:z.array(ExactNumberNumericErrorSpec).max(8).default([]),authoredStages:z.array(ExactNumberAuthoredStageSpec).max(8).default([]),requiredStageKeys:z.array(z.string().min(1)).max(16).default([]),requiredExplorations:z.number().int().min(1).max(16).default(1),successFeedback:z.string().min(1),explorationFeedback:z.string().min(1),fallbackFeedback:z.string().min(1)
});

/** affineRelationshipLab — one exact affine state for Session 147.
 * Equations, tables, verbal rates, line-of-fit descriptions, and two-line systems all normalize
 * to y = mx + b. The same state derives parameter reading, comparisons, substitution, point
 * verification, and intersections, so graph geometry and grading cannot disagree. */
export type AffineRelationshipTask =
  | "exploreParameters" | "readSlope" | "readIntercept" | "slopeAssociation"
  | "compareStart" | "compareRate" | "compareRateAndStart" | "intersectionX" | "intersectionY"
  | "intersectionPoint" | "verifyPoint" | "evaluateAtX";
export type AffineAnswerMode = "numeric" | "choice" | "point" | "explore";
export type AffineRateGoal = "greater" | "lower";
export type AffineTruthStage = { key: string; label: string; value: string };
export type AffineLine = {
  id: string; label: string; m: number; b: number;
  sourceKind?: "equation" | "table" | "context";
  sourceText?: string;
  tablePoints?: readonly (readonly [number, number])[];
};
export type AffineRelationshipTruthInput = {
  task: AffineRelationshipTask;
  lines: readonly AffineLine[];
  targetLineId?: string;
  rateGoal?: AffineRateGoal;
  candidatePoint?: readonly [number, number]; targetInput?: number;
};
const affineClean = (value: number): number => Math.abs(value) < 1e-12 ? 0 : Math.round(value * 1e12) / 1e12;
const affineFmt = (value: number): string => Number.isInteger(value) ? String(value) : String(affineClean(value));
export const affineLineValue = (line: Pick<AffineLine,"m"|"b">, x: number): number => affineClean(line.m * x + line.b);
export function affineIntersection(lines: readonly AffineLine[]): readonly [number, number] | null {
  if (lines.length < 2) return null;
  const [a,b]=lines;
  if (!a || !b || Math.abs(a.m-b.m)<1e-12) return null;
  const x=affineClean((b.b-a.b)/(a.m-b.m));
  return [x,affineLineValue(a,x)] as const;
}
const affineWinner = (lines: readonly AffineLine[], goal: AffineRateGoal): string => {
  if (!lines.length) return "none";
  const extreme=goal==="lower"?Math.min(...lines.map(line=>line.m)):Math.max(...lines.map(line=>line.m));
  const winners=lines.filter(line=>Math.abs(line.m-extreme)<1e-12);
  return winners.length===1?winners[0]!.id:"tie";
};
const affineStartWinner = (lines: readonly AffineLine[]): string => {
  if (!lines.length) return "none";
  const extreme=Math.max(...lines.map(line=>line.b));
  const winners=lines.filter(line=>Math.abs(line.b-extreme)<1e-12);
  return winners.length===1?winners[0]!.id:"tie";
};
export function affineRelationshipTruth(spec: AffineRelationshipTruthInput): {
  answerNumber?: number; answerClaim?: string; answerPoint?: readonly [number,number];
  intersection?: readonly [number,number] | null; stages: AffineTruthStage[];
} {
  const lines=[...spec.lines];
  if (!lines.length) throw new Error("affineRelationshipLab requires at least one line");
  const stages:AffineTruthStage[]=[];
  for (const line of lines) {
    stages.push({key:`line:${line.id}:slope`,label:`${line.label} rate of change`,value:`m = ${affineFmt(line.m)}`});
    stages.push({key:`line:${line.id}:intercept`,label:`${line.label} initial value`,value:`b = ${affineFmt(line.b)}`});
  }
  const target=lines.find(line=>line.id===spec.targetLineId)??lines[0]!;
  let answerNumber:number|undefined,answerClaim:string|undefined,answerPoint:readonly[number,number]|undefined;
  const intersection:readonly[number,number]|null=affineIntersection(lines);
  switch(spec.task){
    case "exploreParameters": break;
    case "readSlope": answerNumber=target.m; break;
    case "readIntercept": answerNumber=target.b; break;
    case "evaluateAtX": {
      if(typeof spec.targetInput!=="number")throw new Error("affineRelationshipLab evaluateAtX requires targetInput");
      answerNumber=affineLineValue(target,spec.targetInput);
      stages.push({key:`evaluate:${target.id}:substitute`,label:`substitute into ${target.label}`,value:`y = ${affineFmt(target.m)}(${affineFmt(spec.targetInput)}) + ${affineFmt(target.b)}`},{key:`evaluate:${target.id}:value`,label:"evaluate the output",value:`y = ${affineFmt(answerNumber)}`});
      break;
    }
    case "slopeAssociation": answerClaim=`association:${target.m>0?"positive":target.m<0?"negative":"none"}`; break;
    case "compareStart": {
      const start=affineStartWinner(lines);
      stages.push({key:"compare:starts",label:"compare initial values",value:start==="tie"?"same initial value":`${lines.find(line=>line.id===start)?.label??start} starts higher`});
      answerClaim=`start:higher:${start}`;break;
    }
    case "compareRate": {
      const goal=spec.rateGoal??"greater",winner=affineWinner(lines,goal);
      stages.push({key:"compare:rates",label:`${goal} rate comparison`,value:winner==="tie"?"the rates are equal":`${lines.find(line=>line.id===winner)?.label??winner} has the ${goal} rate`});
      answerClaim=`rate:${goal}:${winner}`; break;
    }
    case "compareRateAndStart": {
      const rate=affineWinner(lines,"greater"),start=affineStartWinner(lines);
      stages.push({key:"compare:rates",label:"compare rates",value:rate==="tie"?"same rate":`${lines.find(line=>line.id===rate)?.label??rate} grows faster`});
      stages.push({key:"compare:starts",label:"compare initial values",value:start==="tie"?"same initial value":`${lines.find(line=>line.id===start)?.label??start} starts higher`});
      answerClaim=`compare:rate:${rate}:start:${start}`; break;
    }
    case "intersectionX": case "intersectionY": case "intersectionPoint": {
      if(!intersection) throw new Error(`affineRelationshipLab ${spec.task} requires two nonparallel lines`);
      const [x,y]=intersection;
      stages.push({key:"intersection:equate",label:"set the outputs equal",value:`${affineFmt(lines[0]!.m)}x + ${affineFmt(lines[0]!.b)} = ${affineFmt(lines[1]!.m)}x + ${affineFmt(lines[1]!.b)}`});
      stages.push({key:"intersection:x",label:"solve for the shared input",value:`x = ${affineFmt(x)}`});
      stages.push({key:"intersection:y",label:"substitute to find the shared output",value:`y = ${affineFmt(y)}`});
      stages.push({key:"intersection:verify",label:"verify both relationships",value:`both give ${affineFmt(y)} when x = ${affineFmt(x)}`});
      if(spec.task==="intersectionX")answerNumber=x; else if(spec.task==="intersectionY")answerNumber=y; else answerPoint=intersection;
      break;
    }
    case "verifyPoint": {
      if(!spec.candidatePoint) throw new Error("affineRelationshipLab verifyPoint requires candidatePoint");
      const [x,y]=spec.candidatePoint;
      const holds=lines.map(line=>Math.abs(affineLineValue(line,x)-y)<1e-9);
      lines.forEach((line,index)=>stages.push({key:`verify:${line.id}`,label:`test ${line.label}`,value:`${affineFmt(line.m)}(${affineFmt(x)}) + ${affineFmt(line.b)} = ${affineFmt(affineLineValue(line,x))}${holds[index]?" ✓":` ≠ ${affineFmt(y)}`}`}));
      answerClaim=holds.every(Boolean)?"point:yes":"point:no"; break;
    }
  }
  return {answerNumber,answerClaim,answerPoint,intersection,stages};
}
export function affineRelationshipExplorationKeys(spec:AffineRelationshipTruthInput):string[]{return affineRelationshipTruth(spec).stages.map(stage=>stage.key)}
export function affineRelationshipChoiceCorrect(spec:AffineRelationshipTruthInput,choice:{claim:string}):boolean{return affineRelationshipTruth(spec).answerClaim===choice.claim}

const AffineLineSpec=z.object({
  id:z.string().min(1),label:z.string().min(1),m:z.number().finite(),b:z.number().finite(),
  sourceKind:z.enum(["equation","table","context"]).default("equation"),sourceText:z.string().min(1),
  tablePoints:z.array(z.tuple([z.number().finite(),z.number().finite()])).max(6).default([])
});
const AffineChoiceSpec=z.object({id:z.string().min(1),label:z.string().min(1),claim:z.string().min(1),feedback:z.string().min(1)});
const AffineNumericErrorSpec=z.object({value:z.number().finite(),feedback:z.string().min(1)});
const AffinePointErrorSpec=z.object({values:z.tuple([z.number().finite(),z.number().finite()]),feedback:z.string().min(1)});
const AffineAuthoredStageSpec=z.object({title:z.string().min(1),body:z.string().min(1)});
export const AffineRelationshipLabSpec = z.object({
  type: z.literal("affineRelationshipLab"),task:z.enum(["exploreParameters","readSlope","readIntercept","slopeAssociation","compareStart","compareRate","compareRateAndStart","intersectionX","intersectionY","intersectionPoint","verifyPoint","evaluateAtX"]),
  answerMode:z.enum(["numeric","choice","point","explore"]),prompt:z.string().min(1),lines:z.array(AffineLineSpec).min(1).max(3),targetLineId:z.string().optional(),rateGoal:z.enum(["greater","lower"]).default("greater"),targetInput:z.number().finite().optional(),candidatePoint:z.tuple([z.number().finite(),z.number().finite()]).optional(),answerUnit:z.string().optional(),tolerance:z.number().nonnegative().default(0),
  choices:z.array(AffineChoiceSpec).max(8).default([]),numericErrors:z.array(AffineNumericErrorSpec).max(8).default([]),pointErrors:z.array(AffinePointErrorSpec).max(8).default([]),authoredStages:z.array(AffineAuthoredStageSpec).max(8).default([]),requiredStageKeys:z.array(z.string().min(1)).max(16).default([]),requiredExplorations:z.number().int().min(1).max(16).default(1),successFeedback:z.string().min(1),explorationFeedback:z.string().min(1),fallbackFeedback:z.string().min(1)
});

/** quotientReasoningLab — one exact quotient-state model for Session 146.
 * Integer division, remainder meaning, fraction division, rational decimal expansion, and
 * repeating-decimal conversion are explicit task modes over one normalized rational state. */
export type QuotientReasoningTask =
  | "remainderContext" | "remainderPolicy" | "integerQuotient" | "integerRemainder"
  | "invalidRemainder" | "verifyProduct" | "reciprocal" | "divisorChoice"
  | "fractionDivide" | "rationalDefinition" | "decimalExact" | "decimalClassify"
  | "decimalSelect" | "decimalValue" | "remainderCycle" | "repeatToFraction";
export type QuotientAnswerMode = "numeric" | "choice" | "fraction" | "explore";
export type QuotientContextPolicy = "roundUp" | "fullGroups" | "remainder" | "eachGets";
export type QuotientNumericProjection = "value" | "numerator" | "denominator";
export type QuotientRational = { num: number; den: number };
export type QuotientTruthStage = { key: string; label: string; value: string };

export const QuotientRationalSpec = z.object({ num: z.number().int(), den: z.number().int().positive() });
const QuotientChoiceSpec = z.object({ id: z.string().min(1), label: z.string().min(1), claim: z.string().min(1), feedback: z.string().min(1) });
const QuotientNumericErrorSpec = z.object({ value: z.number().finite(), feedback: z.string().min(1) });
const QuotientFractionErrorSpec = z.object({ whole: z.number().int().default(0), num: z.number().int(), den: z.number().int().positive(), feedback: z.string().min(1) });
const QuotientCandidateSpec = z.object({ id: z.string().min(1), label: z.string().min(1), value: QuotientRationalSpec });
const QuotientAuthoredStageSpec = z.object({ title: z.string().min(1), body: z.string().min(1) });

const quotientGcd = (a: number, b: number): number => b === 0 ? Math.abs(a) : quotientGcd(b, a % b);
export function quotientNormalize(value: QuotientRational): QuotientRational {
  if (!Number.isInteger(value.num) || !Number.isInteger(value.den) || value.den === 0) throw new Error("quotientReasoningLab requires integer numerator and nonzero denominator");
  const sign = value.den < 0 ? -1 : 1;
  const g = quotientGcd(value.num, value.den) || 1;
  return { num: sign * value.num / g, den: sign * value.den / g };
}
export function quotientRationalKey(value: QuotientRational): string { const n = quotientNormalize(value); return `${n.num}/${n.den}`; }
/**
 * S237. What a LEARNER should read. quotientRationalKey is an identity string — evaluate.ts
 * compares it with === to decide whether an entered fraction is correct — so its "num/den" shape
 * is load-bearing and must not change. But it was also being painted straight onto the screen,
 * and a whole number normalises to den 1: dop-03-02's prominent "Source state" panel read
 * `492/1 ÷ 15/1`, ns-02-01 read `1248/1 ÷ 24/1`. 39 authored instances show a division of whole
 * numbers as a division of improper fractions, which is exactly the notation confusion the lesson
 * is teaching against.
 *
 * Display drops the denominator when it is 1. Nothing else changes: the key function is untouched,
 * so grading, stage identity and the fraction-error checks all still compare the same strings.
 */
export function quotientRationalDisplay(value: QuotientRational): string {
  const n = quotientNormalize(value);
  return n.den === 1 ? String(n.num) : `${n.num}/${n.den}`;
}
export function quotientDivideRational(left: QuotientRational, right: QuotientRational): QuotientRational {
  const a = quotientNormalize(left), b = quotientNormalize(right);
  if (b.num === 0) throw new Error("quotientReasoningLab cannot divide by zero");
  return quotientNormalize({ num: a.num * b.den, den: a.den * b.num });
}
export function quotientReciprocal(value: QuotientRational): QuotientRational {
  const n = quotientNormalize(value);
  if (n.num === 0) throw new Error("quotientReasoningLab cannot reciprocate zero");
  return quotientNormalize({ num: n.den, den: n.num });
}
export function quotientFractionFromMixed(value: { whole?: number; num?: number; den?: number }): QuotientRational | null {
  const whole = Number.isInteger(value.whole) ? Number(value.whole) : 0;
  const num = Number.isInteger(value.num) ? Number(value.num) : Number.NaN;
  const den = Number.isInteger(value.den) ? Number(value.den) : Number.NaN;
  if (!Number.isFinite(num) || !Number.isFinite(den) || den <= 0) return null;
  const sign = whole < 0 ? -1 : 1;
  return quotientNormalize({ num: whole * den + sign * num, den });
}

export type QuotientDecimalStep = { index: number; remainderBefore: number; scaled: number; digit: number; remainderAfter: number };
export type QuotientDecimalExpansion = { integerPart: number; digits: number[]; steps: QuotientDecimalStep[]; terminates: boolean; cycleStart: number | null; cycleDigits: number[]; text: string };
export function quotientDecimalExpansion(value: QuotientRational): QuotientDecimalExpansion {
  const normalized = quotientNormalize(value);
  const negative = normalized.num < 0;
  const numerator = Math.abs(normalized.num);
  const integerPart = Math.floor(numerator / normalized.den);
  let remainder = numerator % normalized.den;
  const seen = new Map<number, number>(), digits: number[] = [], steps: QuotientDecimalStep[] = [];
  let cycleStart: number | null = null;
  while (remainder !== 0 && !seen.has(remainder) && digits.length < 96) {
    seen.set(remainder, digits.length);
    const remainderBefore = remainder, scaled = remainder * 10, digit = Math.floor(scaled / normalized.den);
    remainder = scaled % normalized.den;
    digits.push(digit); steps.push({ index: digits.length - 1, remainderBefore, scaled, digit, remainderAfter: remainder });
  }
  if (remainder !== 0) cycleStart = seen.get(remainder) ?? null;
  const terminates = remainder === 0, cycleDigits = cycleStart === null ? [] : digits.slice(cycleStart), prefix = cycleStart === null ? digits : digits.slice(0, cycleStart);
  const sign = negative ? "-" : "";
  const text = digits.length === 0 ? `${sign}${integerPart}` : terminates ? `${sign}${integerPart}.${digits.join("")}` : `${sign}${integerPart}.${prefix.join("")}(${cycleDigits.join("")})`;
  return { integerPart, digits, steps, terminates, cycleStart, cycleDigits, text };
}

export type QuotientReasoningTruthInput = {
  task: QuotientReasoningTask; dividend?: QuotientRational; divisor?: QuotientRational;
  candidates?: readonly { id: string; label: string; value: QuotientRational }[];
  contextPolicy?: QuotientContextPolicy; classificationTarget?: "terminates" | "repeats";
  numericProjection?: QuotientNumericProjection; claimedQuotient?: number; claimedRemainder?: number; repeatBlock?: string;
};
export function quotientReasoningTruth(spec: QuotientReasoningTruthInput): {
  answerNumber?: number; answerClaim?: string; answerFraction?: QuotientRational; stages: QuotientTruthStage[];
  integerQuotient?: number; remainder?: number; exactQuotient?: QuotientRational; decimal?: QuotientDecimalExpansion;
} {
  const stages: QuotientTruthStage[] = [];
  let answerNumber: number | undefined, answerClaim: string | undefined, answerFraction: QuotientRational | undefined;
  let integerQuotient: number | undefined, remainder: number | undefined, exactQuotient: QuotientRational | undefined, decimal: QuotientDecimalExpansion | undefined;
  const dividend = spec.dividend ? quotientNormalize(spec.dividend) : undefined, divisor = spec.divisor ? quotientNormalize(spec.divisor) : undefined;
  const requireIntegerDivision = () => {
    if (!dividend || !divisor || dividend.den !== 1 || divisor.den !== 1 || divisor.num <= 0 || dividend.num < 0) throw new Error(`quotientReasoningLab ${spec.task} requires nonnegative integer dividend and positive integer divisor`);
    integerQuotient = Math.floor(dividend.num / divisor.num); remainder = dividend.num - integerQuotient * divisor.num; exactQuotient = quotientNormalize({ num: dividend.num, den: divisor.num });
    stages.push({ key: "integer:estimate", label: "largest full-group count", value: `${integerQuotient}` }, { key: "integer:product", label: "multiply back", value: `${integerQuotient} × ${divisor.num} = ${integerQuotient * divisor.num}` }, { key: "integer:remainder", label: "subtract to find the remainder", value: `${dividend.num} − ${integerQuotient * divisor.num} = ${remainder}` });
  };
  switch (spec.task) {
    case "remainderContext": case "remainderPolicy": {
      requireIntegerDivision(); const policy = spec.contextPolicy ?? "fullGroups";
      stages.push({ key: "integer:policy", label: "interpret the question", value: policy === "roundUp" ? "every leftover needs another group" : policy === "remainder" ? "the leftover itself is requested" : policy === "eachGets" ? "the whole-number share is requested" : "only complete groups count" });
      if (spec.task === "remainderPolicy") answerClaim = `policy:${policy}`; else answerNumber = policy === "roundUp" ? integerQuotient! + (remainder! > 0 ? 1 : 0) : policy === "remainder" ? remainder : integerQuotient;
      break;
    }
    case "integerQuotient": requireIntegerDivision(); answerNumber = integerQuotient; break;
    case "integerRemainder": requireIntegerDivision(); answerNumber = remainder; break;
    case "invalidRemainder": { requireIntegerDivision(); const claimedQ = spec.claimedQuotient; const claimedR = spec.claimedRemainder; stages.push({ key: "integer:claimed", label: "student's claimed reconstruction", value: `${claimedQ ?? "?"} × ${divisor!.num} + ${claimedR ?? "?"}` }); const normalized = typeof claimedR === "number" && claimedR >= 0 && claimedR < divisor!.num; const reconstructsDividend = typeof claimedQ === "number" && typeof claimedR === "number" && claimedQ * divisor!.num + claimedR === dividend!.num; answerClaim = normalized && reconstructsDividend ? "remainder:valid" : "remainder:invalid"; break; }
    case "verifyProduct": requireIntegerDivision(); answerNumber = divisor!.num * integerQuotient! + remainder!; break;
    case "reciprocal": {
      if (!dividend) throw new Error("quotientReasoningLab reciprocal requires a fraction"); answerFraction = quotientReciprocal(dividend);
      stages.push({ key: "fraction:source", label: "source fraction", value: quotientRationalKey(dividend) }, { key: "fraction:reciprocal", label: "swap numerator and denominator", value: quotientRationalKey(answerFraction) }); answerClaim = `fraction:${quotientRationalKey(answerFraction)}`; break;
    }
    case "divisorChoice": {
      if (!dividend || !divisor) throw new Error("quotientReasoningLab divisorChoice requires dividend and divisor");
      stages.push({ key: "fraction:dividend", label: "keep the dividend", value: quotientRationalKey(dividend) }, { key: "fraction:divisor", label: "identify the number after ÷", value: quotientRationalKey(divisor) }); answerClaim = "role:divisor"; break;
    }
    case "fractionDivide": {
      if (!dividend || !divisor) throw new Error("quotientReasoningLab fractionDivide requires dividend and divisor");
      const reciprocal = quotientReciprocal(divisor), raw = { num: dividend.num * reciprocal.num, den: dividend.den * reciprocal.den };
      exactQuotient = quotientNormalize(raw); answerFraction = exactQuotient;
      stages.push({ key: "fraction:keep", label: "keep the dividend", value: quotientRationalKey(dividend) }, { key: "fraction:flip", label: "reciprocal of the divisor", value: quotientRationalKey(reciprocal) }, { key: "fraction:multiply", label: "multiply numerators and denominators", value: `${raw.num}/${raw.den}` }, { key: "fraction:reduce", label: "reduce exactly", value: quotientRationalKey(exactQuotient) });
      const projection = spec.numericProjection ?? "value"; answerNumber = projection === "numerator" ? exactQuotient.num : projection === "denominator" ? exactQuotient.den : exactQuotient.num / exactQuotient.den; answerClaim = `fraction:${quotientRationalKey(exactQuotient)}`; break;
    }
    case "rationalDefinition": {
      if (!dividend) throw new Error("quotientReasoningLab rationalDefinition requires a rational value"); decimal = quotientDecimalExpansion(dividend);
      stages.push({ key: "decimal:fraction", label: "integer ratio", value: quotientRationalKey(dividend) }, { key: "decimal:representation", label: "decimal representation", value: decimal.text }); answerClaim = "rational:yes"; break;
    }
    case "decimalExact": case "decimalClassify": case "decimalValue": case "remainderCycle": {
      if (!dividend) throw new Error(`quotientReasoningLab ${spec.task} requires a rational value`); decimal = quotientDecimalExpansion(dividend);
      decimal.steps.forEach((step) => stages.push({ key: `decimal:${step.index}`, label: `decimal digit ${step.index + 1}`, value: `${step.scaled} ÷ ${dividend.den} gives digit ${step.digit}, remainder ${step.remainderAfter}` }));
      stages.push({ key: "decimal:status", label: decimal.terminates ? "remainder reaches zero" : "a remainder repeats", value: decimal.terminates ? `terminates at ${decimal.text}` : `cycle ${decimal.cycleDigits.join("")} repeats` });
      if (spec.task === "decimalValue") answerNumber = dividend.num / dividend.den; else if (spec.task === "decimalClassify") answerClaim = decimal.terminates ? "classification:terminates" : "classification:repeats"; else if (spec.task === "decimalExact") answerClaim = `decimal:${decimal.text}`; break;
    }
    case "decimalSelect": {
      const target = spec.classificationTarget ?? "terminates", candidates = spec.candidates ?? [];
      const matching = candidates.filter((candidate) => quotientDecimalExpansion(candidate.value).terminates === (target === "terminates"));
      candidates.forEach((candidate) => { const expansion = quotientDecimalExpansion(candidate.value); stages.push({ key: `candidate:${candidate.id}`, label: candidate.label, value: expansion.terminates ? `terminates at ${expansion.text}` : `repeats cycle ${expansion.cycleDigits.join("")}` }); });
      if (matching.length === 1) answerClaim = `candidate:${matching[0].id}`; break;
    }
    case "repeatToFraction": {
      const block = spec.repeatBlock ?? "", rawNumerator = Number(block), rawDenominator = Math.pow(10, block.length) - 1;
      answerFraction = quotientNormalize({ num: rawNumerator, den: rawDenominator });
      stages.push({ key: "repeat:name", label: "name the repeating decimal", value: `x = 0.(${block})` }, { key: "repeat:shift", label: "shift one complete period", value: `${Math.pow(10, block.length)}x = ${rawNumerator}.(${block})` }, { key: "repeat:subtract", label: "subtract aligned repeats", value: `${rawDenominator}x = ${rawNumerator}` }, { key: "repeat:reduce", label: "solve and reduce", value: quotientRationalKey(answerFraction) }); answerClaim = `fraction:${quotientRationalKey(answerFraction)}`; break;
    }
  }
  return { answerNumber, answerClaim, answerFraction, stages, integerQuotient, remainder, exactQuotient, decimal };
}
export function quotientReasoningExplorationKeys(spec: QuotientReasoningTruthInput): string[] { return quotientReasoningTruth(spec).stages.map((stage) => stage.key); }
export function quotientReasoningChoiceCorrect(spec: QuotientReasoningTruthInput, choice: { claim: string }): boolean { return quotientReasoningTruth(spec).answerClaim === choice.claim; }
export function quotientReasoningFractionCorrect(spec: QuotientReasoningTruthInput, value: { whole?: number; num?: number; den?: number }): boolean { const entered = quotientFractionFromMixed(value), truth = quotientReasoningTruth(spec).answerFraction; return Boolean(entered && truth && quotientRationalKey(entered) === quotientRationalKey(truth)); }

export const QuotientReasoningLabSpec = z.object({
  type: z.literal("quotientReasoningLab"),
  task: z.enum(["remainderContext","remainderPolicy","integerQuotient","integerRemainder","invalidRemainder","verifyProduct","reciprocal","divisorChoice","fractionDivide","rationalDefinition","decimalExact","decimalClassify","decimalSelect","decimalValue","remainderCycle","repeatToFraction"]),
  answerMode: z.enum(["numeric","choice","fraction","explore"]), prompt: z.string().min(1),
  dividend: QuotientRationalSpec.optional(), divisor: QuotientRationalSpec.optional(), candidates: z.array(QuotientCandidateSpec).max(6).default([]),
  contextPolicy: z.enum(["roundUp","fullGroups","remainder","eachGets"]).optional(), classificationTarget: z.enum(["terminates","repeats"]).optional(), numericProjection: z.enum(["value","numerator","denominator"]).optional(),
  claimedQuotient: z.number().int().nonnegative().optional(), claimedRemainder: z.number().int().nonnegative().optional(), repeatBlock: z.string().regex(/^\d{1,6}$/).optional(),
  answerUnit: z.string().optional(), tolerance: z.number().nonnegative().default(0), choices: z.array(QuotientChoiceSpec).max(6).default([]), numericErrors: z.array(QuotientNumericErrorSpec).max(8).default([]), fractionErrors: z.array(QuotientFractionErrorSpec).max(8).default([]), authoredStages: z.array(QuotientAuthoredStageSpec).max(8).default([]),
  requiredExplorations: z.number().int().min(1).max(24).default(1), successFeedback: z.string().min(1), explorationFeedback: z.string().min(1), fallbackFeedback: z.string().min(1),
});

export const GraphStoryLabSpec = z.object({
  type: z.literal("graphStoryLab"),
  mode: z.enum(["read", "build"]),
  prompt: z.string().min(1),
  axisContext: z.enum(["distanceFromOrigin", "generic", "height", "temperature", "waterLevel", "savings"]),
  distanceRule: z.enum(["notDistance", "awayOnly", "mayReturn"]).default("notDistance"),
  xAxisLabel: z.string().min(1).default("time"),
  yAxisLabel: z.string().min(1),
  segments: z.array(GraphStorySegmentSpec).min(1).max(4),
  readTask: z.enum(["flatMeaning", "steepMeaning", "directionMeaning", "flatteningMeaning", "locateStopped", "storySummary"]).optional(),
  targetSegmentId: z.string().optional(),
  choices: z.array(GraphStoryChoiceSpec).max(5).default([]),
  bank: z.array(GraphStorySegmentSpec).max(8).default([]),
  wrongSequences: z.array(GraphStoryWrongSequenceSpec).max(6).default([]),
  answerLabel: z.string().min(1).optional(),
  successFeedback: z.string().min(1),
  explorationFeedback: z.string().min(1),
  fallbackFeedback: z.string().min(1)
});

/** conditionalTableLab — one coherent two-way-table truth serves two interaction grammars.
 * `conditional` mode makes the condition select the denominator. `read` mode keeps the table fixed
 * while the learner selects an exact cell, margin, grand-total, or relative-frequency claim. */
export type ConditionalTableReadMetric = "cell" | "rowTotal" | "colTotal" | "grandTotal" | "relativeWhole" | "relativeRow" | "relativeCol";
export type ConditionalTableCell = "r0c0" | "r0c1" | "r1c0" | "r1c1";
export function conditionalTableReadTruth(
  counts: readonly [number, number, number, number],
  metric: ConditionalTableReadMetric,
  targetCell: ConditionalTableCell
): { numerator: number; denominator: number; value: number } {
  const r = Number(targetCell[1]);
  const c = Number(targetCell[3]);
  const cell = counts[r * 2 + c]!;
  const row = counts[r * 2]! + counts[r * 2 + 1]!;
  const col = counts[c]! + counts[c + 2]!;
  const grand = counts.reduce((sum, value) => sum + value, 0);
  if (metric === "cell") return { numerator: cell, denominator: 1, value: cell };
  if (metric === "rowTotal") return { numerator: row, denominator: 1, value: row };
  if (metric === "colTotal") return { numerator: col, denominator: 1, value: col };
  if (metric === "grandTotal") return { numerator: grand, denominator: 1, value: grand };
  const denominator = metric === "relativeRow" ? row : metric === "relativeCol" ? col : grand;
  return { numerator: cell, denominator, value: Math.round((cell / denominator) * 1000000) / 10000 };
}

export const ConditionalTableLabSpec = z.object({
  type: z.literal("conditionalTableLab"),
  mode: z.enum(["conditional", "read"]).default("conditional"),
  prompt: z.string().min(1),
  rowLabels: z.tuple([z.string().min(1), z.string().min(1)]),
  colLabels: z.tuple([z.string().min(1), z.string().min(1)]),
  counts: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative(), z.number().int().nonnegative(), z.number().int().nonnegative()]),
  targetCondition: z.enum(["row0", "row1", "col0", "col1"]),
  targetCell: z.enum(["r0c0", "r0c1", "r1c0", "r1c1"]),
  startCondition: z.enum(["row0", "row1", "col0", "col1"]).default("col0"),
  requiredSwitches: z.number().int().min(1).max(8).default(2),
  readMetric: z.enum(["cell", "rowTotal", "colTotal", "grandTotal", "relativeWhole", "relativeRow", "relativeCol"]).optional(),
  answerChoices: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    value: z.number().finite(),
    feedback: z.string().min(1)
  })).max(5).default([]),
  successFeedback: z.string().min(1),
  explorationFeedback: z.string().min(1),
  conditionFeedback: z.string().min(1),
  cellFeedback: z.string().min(1)
});

/** conicLocusLab — vary eccentricity and watch one focus-directrix ratio generate the entire conic
 * family. The learner must sample several values before landing on the target, so classification is
 * earned from the changing locus rather than recalled from a static list. */
export const ConicLocusLabSpec = z.object({
  type: z.literal("conicLocusLab"),
  prompt: z.string().min(1),
  targetEccentricityTenths: z.number().int().min(0).max(18),
  startEccentricityTenths: z.number().int().min(0).max(18).default(4),
  focusDistance: z.number().positive().default(2),
  requiredSamples: z.number().int().min(2).max(8).default(4),
  successFeedback: z.string().min(1),
  explorationFeedback: z.string().min(1),
  lowFeedback: z.string().min(1),
  highFeedback: z.string().min(1)
});

/** derivativeRuleLab — expose the mechanism behind product, quotient, and chain rules. Product
 * mode shrinks the second-order corner of a changing rectangle; quotient mode makes the two
 * competing numerator products and the denominator square respond to the local rates; chain mode
 * coordinates two local rates through a nested input→inner→outer machine. */
export const DerivativeRuleLabSpec = z.object({
  type: z.literal("derivativeRuleLab"),
  prompt: z.string().min(1),
  mode: z.enum(["product", "quotient", "chain", "substitution"]),
  targetH: z.number().positive().max(0.5).default(0.1),
  startH: z.number().positive().max(2).default(1),
  targetInnerRate: z.number().int().min(1).max(6).default(3),
  targetOuterRate: z.number().int().min(1).max(6).default(4),
  startInnerRate: z.number().int().min(1).max(6).default(1),
  startOuterRate: z.number().int().min(1).max(6).default(1),
  quotientU: z.number().int().positive().max(12).default(6),
  quotientV: z.number().int().positive().max(12).default(4),
  requiredMoves: z.number().int().min(2).max(10).default(4),
  successFeedback: z.string().min(1),
  explorationFeedback: z.string().min(1),
  mechanismFeedback: z.string().min(1)
});

/** relatedRatesLab — a sliding ladder whose position and velocity are coupled by x²+y²=L².
 * Moving the foot changes the height and the live derivative dy/dt together, making the hidden
 * chain rule visible. */
export const RelatedRatesLabSpec = z.object({
  type: z.literal("relatedRatesLab"),
  prompt: z.string().min(1),
  /** (S238) WHICH related-rates model the lab draws. "ladder" is the original engine:
   * x² + y² = L², slide the foot. The two growth models close the S237 NOT-POSSIBLE rows
   * dc-02-01/k3 and /ch1: "circleArea" grows a disc (A = πr², dA/dt = 2πr·dr/dt) and
   * "sphereVolume" grows a balloon (V = 4/3·πr³, dV/dt = 4πr²·dr/dt). In the growth models the
   * slider is the RADIUS: `ladderLength` is read as the radius ceiling, `horizontalRate` as
   * dr/dt, and `targetX`/`startX` as radii. Every readout is an exact multiple of π (integers
   * in, integers out — except 4r³/3, printed as the exact fraction when 3 ∤ 4r³), so nothing
   * is ever rounded. Default "ladder" leaves every existing lesson byte-identical. */
  model: z.enum(["ladder", "circleArea", "sphereVolume"]).default("ladder"),
  ladderLength: z.number().int().min(5).max(15),
  /** (S205J) How the coupling is NARRATED. "rates" is the original engine: a time story, dx/dt
   * and dy/dt labels. "slope" strips time out entirely — same circle x² + y² = L², same slider,
   * but the readout is dy/dx and the caption differentiates implicitly with respect to x. Built
   * for implicit-differentiation lessons (dr-04-03: x² + y² = 25, slope −3/4 at (3,4)) where the
   * geometry fits EXACTLY but dt notation would teach symbols the lesson never introduces. The
   * mathematics is untouched: with horizontalRate 1 the rates readout already equalled dy/dx;
   * this mode says so honestly instead of asking the learner to notice. Default "rates" leaves
   * every existing lesson byte-identical. */
  framing: z.enum(["rates", "slope"]).default("rates"),
  horizontalRate: z.number().positive(),
  targetX: z.number().int().min(1).max(14),
  startX: z.number().int().min(1).max(14),
  requiredMoves: z.number().int().min(2).max(10).default(4),
  successFeedback: z.string().min(1),
  explorationFeedback: z.string().min(1),
  positionFeedback: z.string().min(1)
});

/** extraneousRootLab — square both sides yourself and watch a phantom intersection be born.
 *
 * The left curve is y = scale*sqrt(x + c); the right is the line y = m*x + b. One control squares
 * both sides, morphing the pair into y = scale^2*(x + c) and y = (m*x + b)^2. The part of the line
 * that was BELOW the axis reflects upward, and the extra intersection appears exactly where that
 * reflection lands — so the phantom is not asserted, it arrives with its cause on screen.
 *
 * Why an engine and not a `radicalCheck`: the existing widget VERIFIES candidates after the fact
 * (substitute, see it fail). Nothing in the registry shows WHY squaring manufactures a candidate
 * that was never a solution. That "why" is the entire content of re-04-02, and it is a picture. */
export const ExtraneousRootLabSpec = z.object({
  type: z.literal("extraneousRootLab"),
  prompt: z.string().min(1),
  /** y = scale * sqrt(x + c). Integers only: the lab's roots must land exactly, never rounded. */
  radical: z.object({ c: z.number().int(), scale: z.number().int().positive().max(6).default(1) }),
  /** y = m*x + b. */
  line: z.object({ m: z.number().int(), b: z.number().int() }),
  /** Where the draggable probe starts; it reads BOTH sides at its x so the learner can see them
   * agree at a true root and disagree at a phantom. */
  probeStart: z.number().int(),
  /** Whether the squaring has already been performed when the step opens. Authoring this `true`
   * would hand over the transformation the lesson is about, so the integrity gate refuses it. */
  squared: z.boolean().default(false),
  /** Which question this step asks. The value shape is the same in all three; only grading differs. */
  targetPhase: z.enum(["identifyTrue", "identifyPhantom", "explainPhantom"]),
  /** The authored answers. Both are re-derived by `extraneousCandidates` and re-checked by the
   * independent `extraneousHolds` in the integrity gate — an authoring slip cannot ship. */
  trueRoot: z.number().int(),
  /** null when squaring invents nothing (the honest case: not every radical equation has a phantom,
   * and a lab that implied otherwise would teach a superstition). */
  phantomRoot: z.number().int().nullable(),
  /** The learner must actually square AND move the probe before an answer is graded. */
  requiredMoves: z.number().int().min(1).max(6).default(2),
  successFeedback: z.string().min(1),
  /** Chose the phantom as a solution. */
  phantomPickedFeedback: z.string().min(1),
  /** Answered without performing the squaring. */
  notSquaredFeedback: z.string().min(1),
  /** Shown at the probe when it sits in the reflected region — names WHY, rather than grading. */
  signRegionFeedback: z.string().min(1),
  /** Picked something that is neither root — usually conflating "extraneous" with "out of domain". */
  domainConfusionFeedback: z.string().min(1)
});

/** binomialAreaLab — a product of two linear factors, laid out as the rectangle it measures.
 *
 * Sides are (p·x + a) across and (q·x + b) down. The learner DRAGS the two constant partitions,
 * a and b, and watches four regions resize together: pq·x² (fixed), p·b·x and q·a·x (the two
 * strips), and a·b (the corner). The middle coefficient is the SUM of the two strip coefficients
 * because both strips share a side of length x — which is the whole content of FOIL, and the
 * single thing a memorised rule hides. Sweeping a while b holds shows one strip growing and the
 * other still: the middle coefficient tracks a SUM, never a product.
 *
 * Negative constants are honest here rather than avoided: a strip with a negative constant is
 * drawn OUTSIDE the x-block in berry, as area being taken away, which is how algebra tiles have
 * always modelled subtraction and how (x + 6)(x − 6) loses its middle term in front of the
 * learner — the two strips are equal and opposite, so they cancel.
 *
 * Why an engine and not `algebraTiles`: that engine builds a LINEAR expression
 * (`targetX·x + targetConst`) with no x² channel, so a binomial product cannot be laid out at
 * all; `areaModel` is numeric area with no algebraic labels on its sides. */
export const BinomialAreaLabSpec = z.object({
  type: z.literal("binomialAreaLab"),
  prompt: z.string().min(1),
  /** The x-coefficients of the two sides. Authored, not dragged: they set the x² channel. */
  pX: z.number().int().min(1).max(6).default(1),
  qX: z.number().int().min(1).max(6).default(1),
  /** The constants the learner is hunting: side one is (pX·x + targetA), side two is (qX·x + targetB). */
  targetA: z.number().int().min(-9).max(9),
  targetB: z.number().int().min(-9).max(9),
  startA: z.number().int().min(-9).max(9).default(0),
  startB: z.number().int().min(-9).max(9).default(0),
  /** Which coefficient the authored question asks for — named in the success copy so the lab
   * answers the lesson's own question rather than a neighbouring one. */
  asks: z.enum(["x2", "middle", "constant"]),
  /** The learner must actually sweep before a claim is graded. */
  requiredMoves: z.number().int().min(2).max(12).default(3),
  successFeedback: z.string().min(1),
  /** Reached the right middle coefficient by MULTIPLYING the constants instead of adding them. */
  productMiddleFeedback: z.string().min(1),
  /** One partition is right and the other is not. */
  partialFeedback: z.string().min(1),
  /** Right magnitudes, wrong sign(s) — the (x − 4)(x − 1) and (x + 6)(x − 6) trap. */
  signFeedback: z.string().min(1)
});

/** The expansion of (pX·x + a)(qX·x + b), as the three channels the rectangle draws.
 * Shared by the renderer, the grader and the integrity gate, so the coefficients on screen and
 * the coefficients graded are one set of numbers. */
export function binomialExpand(
  pX: number,
  a: number,
  qX: number,
  b: number
): { x2: number; middle: number; constant: number } {
  return { x2: pX * qX, middle: pX * b + qX * a, constant: a * b };
}

/** shapeParts — count a figure's parts by TOUCHING them, not by recalling a fact.
 *
 * "How many sides does a hexagon have?" was a numeric box beside no hexagon. A six-year-old
 * answers that question by putting a finger on each side in turn and keeping track — which is a
 * manipulation, and which is also exactly how the counting principles (one-to-one correspondence,
 * cardinality) are supposed to be practised. Here each part is its own tap target; tapping marks
 * it counted, tapping again releases it, and a running tally shows. The step is correct when every
 * part has been marked exactly once — so double-counting one corner and missing another cannot
 * pass, which a bare number entry could never detect.
 *
 * The shape is DRAWN, which is the whole reason `tapDiagram` could not serve these lessons: it
 * places icons on a blank canvas and would have asked a child to tap the sides of a triangle that
 * was not there. */
export const ShapePartsSpec = z.object({
  type: z.literal("shapeParts"),
  prompt: z.string().min(1),
  shape: z.enum(["polygon", "cube", "rectangularPrism", "squarePyramid", "cylinder"]),
  /** polygon only: how many sides the drawn n-gon has (3–10). Ignored by the solids. */
  sides: z.number().int().min(3).max(10).optional(),
  /** Which parts to count. `corners` and `vertices` are the same idea in 2D and 3D wording, and
   * each lesson's own vocabulary is preserved by choosing the matching one. */
  part: z.enum(["sides", "corners", "faces", "vertices"]),
  successFeedback: z.string().min(1),
  /** Checked with some parts still unmarked. */
  missedFeedback: z.string().min(1),
  /** Marked a part that was already counted, or tapped past the total. */
  doubleCountFeedback: z.string().min(1)
});

/** How many parts a shape has — derived from the geometry, never read from an authored number, so
 * the count on screen, the count the grader wants and the count the integrity gate checks are one
 * computation. `cylinder` reports its FLAT faces (the two discs); its curved surface is not a face
 * in the K–2 sense these lessons use, and it has no vertices. */
export function shapePartCount(
  shape: "polygon" | "cube" | "rectangularPrism" | "squarePyramid" | "cylinder",
  sides: number | undefined,
  part: "sides" | "corners" | "faces" | "vertices"
): number {
  if (shape === "polygon") {
    const n = sides ?? 0;
    return part === "sides" || part === "corners" ? n : 0;
  }
  if (shape === "cube" || shape === "rectangularPrism")
    return part === "faces" ? 6 : part === "vertices" || part === "corners" ? 8 : 12;
  if (shape === "squarePyramid")
    return part === "faces" ? 5 : part === "vertices" || part === "corners" ? 5 : 8;
  // cylinder
  return part === "faces" ? 2 : 0;
}

/** S119 — a_n = first·r^(n-1), exact for the small integer ratios this mode uses. Shared by the
 * evaluator, the renderer and the integrity gate, so a learner watching the bars grow and the
 * grader deciding correctness can never disagree about what the nth term is. */
export function geometricTerm(first: number, r: number, atPosition: number): number {
  return first * Math.pow(r, atPosition - 1);
}

/* ---------------- numberLineRay (S215 — MMIP engine gap G) ---------------- */

/**
 * numberLineRay — one inequality on one variable, held as `coeff·x REL constant` with coeff ≠ 0,
 * and drawn as a ray. The canonical model is `src/lib/mmip/numberLineRayModel.ts`; this block is
 * only the AUTHORING surface, and the checks below are deliberately written in plain integer
 * arithmetic so the gate is a second, independent opinion about a spec rather than the model
 * agreeing with itself.
 *
 * The coefficient is in the spec because "inequality reversal" is not expressible without it:
 * `x > 3` and `−2x < −6` are the same claim, so a state that stored only the endpoint would have
 * nothing to show when both sides are multiplied. See the model's header for the full argument.
 */
const RayRationalSpec = z.object({ n: z.number().int(), d: z.number().int().positive() }).strict();

/** `coeff·variable REL constant`. `relation` is the symbol as WRITTEN; which way the ray points is
 * derived, and differs from it exactly when `coeff` is negative. */
const RayRelationSpec = z.object({
  coeff: RayRationalSpec,
  constant: RayRationalSpec,
  relation: z.enum(["lt", "gt"]),
  /** `true` for ≤ / ≥ — the boundary point itself belongs to the solution set. */
  inclusive: z.boolean().default(false)
});

export const NumberLineRaySpec = z.object({
  type: z.literal("numberLineRay"),
  prompt: z.string().min(1),
  variable: z.string().min(1).max(3).default("x"),
  /** Where the learner starts. */
  start: RayRelationSpec,
  /** The stretch of line drawn, and how it is labelled. */
  window: z.object({ min: RayRationalSpec, max: RayRationalSpec, tickStep: RayRationalSpec }),
  /** The lattice the BOUNDARY lives on: the discrete set of positions a drag can reach. Typing the
   * right-hand side lands on the same lattice, so the two routes cannot disagree. */
  step: RayRationalSpec,
  outOfRange: z.enum(["reject", "clamp"]).default("clamp"),
  offLattice: z.enum(["reject", "snap"]).default("snap"),
  /** Both-sides moves this instance offers. Empty (the default) keeps the coefficient at whatever
   * `start` holds, and the engine is then the plain "x > 3" number line. */
  transforms: z
    .array(z.object({ id: z.string().min(1), factor: RayRationalSpec, label: z.string().min(1) }))
    .default([]),
  /** The relation the learner is asked to reach, as a SOLUTION SET (any equivalent writing of it
   * counts). Optional: an explore instance has no target. */
  target: RayRelationSpec.optional(),
  /**
   * Grade the FORM as well as the set (S215b). This engine draws the solution set of whatever
   * relation is held, so `−2x > −8` already SHOWS `x < 4` — which makes "solve it" ungradable by
   * set alone: the item begins at its own answer. With this on, correct means the set matches
   * `target` AND the relation is in solved form (coefficient 1), so "reduce `−2x > −8` to `x < 4`
   * WITHOUT changing which numbers work" becomes a real task whose invariant is the picture.
   *
   * OPTIONAL, never defaulted: a spec written before this existed parses to the identical object
   * and grades identically. Off, any equivalent writing of the target set is correct.
   */
  requireSolvedForm: z.boolean().optional(),
  successFeedback: z.string().min(1).optional(),
  fallbackFeedback: z.string().min(1).optional()
});

type RayFracLiteral = { n: number; d: number };
type RayRelationLiteral = {
  coeff: RayFracLiteral;
  constant: RayFracLiteral;
  relation: "lt" | "gt";
  inclusive: boolean;
};

/** −1 / 0 / +1, by cross multiplication. Denominators are positive by schema, so the sign is honest. */
const rayFracCmp = (a: RayFracLiteral, b: RayFracLiteral): number => {
  const left = a.n * b.d;
  const right = b.n * a.d;
  return left < right ? -1 : left > right ? 1 : 0;
};

/** constant ÷ coeff, as a fraction with a positive denominator. Caller checks coeff ≠ 0 first. */
function rayBoundaryOf(rel: RayRelationLiteral): RayFracLiteral {
  const n = rel.constant.n * rel.coeff.d;
  const d = rel.constant.d * rel.coeff.n;
  return d < 0 ? { n: -n, d: -d } : { n, d };
}

/** Which way the ray points once the relation is solved for the variable. */
const rayDirectionOf = (rel: RayRelationLiteral): "greater" | "less" => {
  const flipped = rel.coeff.n < 0;
  const solved = flipped ? (rel.relation === "lt" ? "gt" : "lt") : rel.relation;
  return solved === "gt" ? "greater" : "less";
};

/** Is `value` an exact multiple of `stepValue`? Integer arithmetic; never a float comparison. */
const rayOnLattice = (value: RayFracLiteral, stepValue: RayFracLiteral): boolean =>
  (value.n * stepValue.d) % (value.d * stepValue.n) === 0;

/** Is the relation written in SOLVED form — the variable standing alone with coefficient 1?
 * Exact for an unreduced pair too, since n/d = 1 exactly when n === d. */
export const numberLineRayIsSolvedForm = (rel: RayRelationLiteral): boolean => rel.coeff.n === rel.coeff.d;

/** Do two written relations describe the SAME set of numbers? */
export function numberLineRaySameSolutionSet(a: RayRelationLiteral, b: RayRelationLiteral): boolean {
  if (a.coeff.n === 0 || b.coeff.n === 0) return false;
  return (
    rayFracCmp(rayBoundaryOf(a), rayBoundaryOf(b)) === 0 &&
    rayDirectionOf(a) === rayDirectionOf(b) &&
    a.inclusive === b.inclusive
  );
}

export const WidgetSpec = z.discriminatedUnion("type", [
  McqSpec,
  NumericSpec,
  FractionEntrySpec,
  PointEntrySpec,
  PlaceCompareSpec,
  RationalCompareSpec,
  SliderSpec,
  TapDiagramSpec,
  DragOrderSpec,
  DragBucketSpec,
  MatchPairsSpec,
  BuildExpressionSpec,
  PlotPointSpec,
  ToggleExploreSpec,
  SteppedRevealSpec,
  EstimateSliderSpec,
  TenFrameSpec,
  NumberLineHopSpec,
  BaseTenComposeSpec,
  LengthCompareSpec,
  AbsValueLineSpec,
  MoneyBoardSpec,
  FractionGridSpec,
  FractionCompareSpec,
  OddEvenPairsSpec,
  MixedRegroupSpec,
  ColumnCalcSpec,
  EvalOrderSpec,
  UnitChainSpec,
  SlopeTriangleSpec,
  SubitizeFlashSpec,
  LineExploreSpec,
  FractionBarSpec,
  QuadraticExploreSpec,
  UnitCircleExploreSpec,
  SystemsExploreSpec,
  NumberLinePlaceSpec,
  FunctionMachineSpec,
  ProbabilityAreaSpec,
  HundredthsGridSpec,
  TransformExploreSpec,
  AngleMeasureSpec,
  DilationExploreSpec,
  RotationLabSpec,
  BarBuilderSpec,
  GraphReadSpec,
  DotPlotSpec,
  BoxPlotSpec,
  DistributionCompareLabSpec,
  AreaModelSpec,
  PlaceValueSpec,
  ClockSetSpec,
  BalanceScaleSpec,
  SolveBalanceSpec,
  InversePipelineSpec,
  DoubleNumberLineSpec,
  ScatterFitSpec,
  FractionOfSetSpec,
  PercentBarSpec,
  PercentChangeLabSpec,
  EquationOutcomeLabSpec,
  SignedFractionLabSpec,
  IntegerChipsSpec,
  VolumeBuilderSpec,
  NetFoldSpec,
  RatioTableSpec,
  ElapsedTimeSpec,
  DistanceGridSpec,
  TreeDiagramSpec,
  SpinnerSimSpec,
  TrialProbabilityLabSpec,
  ScaledCircleLabSpec,
  TriangleClosureLabSpec,
  CompoundEventLabSpec,
  CompositeAreaLabSpec,
  TaylorApproxSpec,
  SlopeFieldSpec,
  SliceSumSpec,
  RiemannSumSpec,
  AccumulateAreaSpec,
  DerivativeTraceSpec,
  CompassConstructSpec,
  QuadDragSpec,
  RadicalCheckSpec,
  SequenceBuildSpec,
  TriangleSolveSpec,
  SignChartSpec,
  ExtraneousRootLabSpec,
  BinomialAreaLabSpec,
  ShapePartsSpec,
  PolarTraceSpec,
  CircleMeasureExploreSpec,
  VectorExploreSpec,
  MatrixTransformSpec,
  ArgandExploreSpec,
  SecantSlopeSpec,
  ExpLogExploreSpec,
  GraphZoomSpec,
  CircleAngleExploreSpec,
  SampleSimSpec,
  CiCaptureSpec,
  ShuffleTestSpec,
  AlgebraTilesSpec,
  LineRelationLabSpec,
  TriangleConstraintLabSpec,
  CoordinateProofLabSpec,
  SolidSliceLabSpec,
  TriangleAngleLabSpec,
  VerticalLineScannerSpec,
  CovariationScrubberSpec,
  SamplingBiasLabSpec,
  ShapeFamilyBuilderSpec,
  ShapeHierarchyLabSpec,
  UnitRulerSpec,
  ProportionalReasoningLabSpec,
  PlaceValueTransformLabSpec,
  PointSetReasoningLabSpec,
  GeometricConstraintLabSpec,
  ExactNumberLabSpec,
  AffineRelationshipLabSpec,
  QuotientReasoningLabSpec,
  GraphStoryLabSpec,
  ConditionalTableLabSpec,
  ConicLocusLabSpec,
  DerivativeRuleLabSpec,
  RelatedRatesLabSpec,
  NumberLineRaySpec
]);

/** Structural integrity checks that discriminated unions can't express inline. */
/** The authoring rules for the display-only `plotData` block, in one place because `numeric` and
 * `fractionEntry` share the field and must never diverge on what a drawable plot is. Every rule
 * here is a reason `plotDataParts` would refuse to draw, stated as a message an author can act on
 * — so a step whose data the renderer would silently skip fails `lint:pedagogy` instead. */
function plotDataIntegrityErrors(where: string, d: TPlotData): string[] {
  const errs: string[] = [];
  if (d.counts.length !== d.values.length)
    errs.push(`${where}: plotData needs one count per value (${d.values.length} values, ${d.counts.length} counts)`);
  if (d.values.length > MAX_PLOT_COLUMNS)
    errs.push(`${where}: plotData has ${d.values.length} marks; the plot draws at most ${MAX_PLOT_COLUMNS}`);
  for (let i = 1; i < d.values.length; i++)
    if (d.values[i] <= d.values[i - 1])
      errs.push(`${where}: plotData values must increase along the axis (${d.values[i - 1]} then ${d.values[i]})`);
  if (!d.counts.some((c) => c > 0))
    errs.push(`${where}: plotData has no X anywhere — an empty plot illustrates nothing`);
  for (const c of d.counts)
    if (c > MAX_PLOT_STACK)
      errs.push(`${where}: plotData stack of ${c} exceeds the ${MAX_PLOT_STACK}-X ceiling a column can show`);
  // Last line of defence: whatever the rules above missed, the renderer's own resolver decides.
  // A spec that passes authoring but draws nothing is the failure mode this exists to prevent.
  if (errs.length === 0 && plotDataParts({ plotData: d }) === null)
    errs.push(`${where}: plotData cannot be drawn — the renderer would show nothing`);
  return errs;
}

export function widgetIntegrityErrors(spec: TWidget): string[] {
  const errs: string[] = [];
  // Display-only, shared by three surfaces, and therefore checked before the per-type switch:
  // no branch owns it and none may drift from the others on what it means. (S238 added mcq.)
  if ((spec.type === "numeric" || spec.type === "fractionEntry" || spec.type === "mcq") && spec.plotData)
    errs.push(...plotDataIntegrityErrors(spec.type, spec.plotData));
  switch (spec.type) {
    case "numberLineRay": {
      const w = spec.window;
      if (spec.start.coeff.n === 0)
        errs.push("numberLineRay: the start coefficient must not be 0 — 0·x compared with a number says nothing about x");
      if (spec.target && spec.target.coeff.n === 0)
        errs.push("numberLineRay: the target coefficient must not be 0 — 0·x compared with a number says nothing about x");
      if (rayFracCmp(w.min, w.max) >= 0) errs.push("numberLineRay: window.min must be below window.max");
      if (w.tickStep.n <= 0) errs.push("numberLineRay: window.tickStep must be positive");
      if (spec.step.n <= 0) errs.push("numberLineRay: step must be positive");
      if (w.tickStep.n > 0 && rayFracCmp(w.min, w.max) < 0) {
        const span = w.max.n / w.max.d - w.min.n / w.min.d;
        const ticks = span / (w.tickStep.n / w.tickStep.d);
        if (ticks > 200) errs.push(`numberLineRay: window would draw ${Math.round(ticks)} ticks; the line caps at 200`);
      }
      if (spec.step.n > 0) {
        const named: [string, RayRelationLiteral | undefined][] = [
          ["start", spec.start],
          ["target", spec.target]
        ];
        for (const [label, rel] of named) {
          if (!rel || rel.coeff.n === 0) continue;
          const b = rayBoundaryOf(rel);
          if (rayFracCmp(b, w.min) < 0 || rayFracCmp(b, w.max) > 0)
            errs.push(`numberLineRay: the ${label} boundary ${b.n}/${b.d} sits off the drawn line, so the picture could not show where the solutions begin`);
          if (!rayOnLattice(b, spec.step))
            errs.push(`numberLineRay: the ${label} boundary ${b.n}/${b.d} is not on the step lattice, so no drag could reach it`);
        }
      }
      const ids = spec.transforms.map((t) => t.id);
      if (new Set(ids).size !== ids.length) errs.push("numberLineRay: transform ids must be unique");
      for (const t of spec.transforms) {
        if (t.factor.n === 0)
          errs.push(`numberLineRay: transform ${t.id} multiplies by 0, which would leave no solution set to draw`);
        if (t.factor.n === t.factor.d)
          errs.push(`numberLineRay: transform ${t.id} multiplies by 1, which changes nothing`);
      }
      if (spec.target && spec.start.coeff.n !== 0 && spec.target.coeff.n !== 0) {
        /* "Already at the answer" depends on what is being asked for. Graded on the SET alone, a
         * start whose set matches the target is solved before the learner arrives. Graded on the
         * set AND the form, it is not: `−2x > −8` against a target of `x < 4` shows the right
         * numbers but is not yet written in solved form, and reaching that form without moving the
         * line is the whole task. */
        const sameSet = numberLineRaySameSolutionSet(spec.start, spec.target);
        if (sameSet && (spec.requireSolvedForm !== true || numberLineRayIsSolvedForm(spec.start)))
          errs.push("numberLineRay: the item begins solved — start and target describe the same solution set");
        if (spec.requireSolvedForm === true && !numberLineRayIsSolvedForm(spec.target))
          errs.push("numberLineRay: requireSolvedForm asks the learner for the solved form, so the target must be written in it (coefficient 1)");
        /* S217 (FABLE-QA S216 hazard): requireSolvedForm demands coefficient 1, but nothing had
         * checked that coefficient 1 is REACHABLE from the start via the transforms this spec
         * actually offers — an author could ship an unsolvable item. Transforms apply forward only
         * (each press multiplies the coefficient by its factor), so the reachable coefficients are
         * the start coefficient times finite products of the offered factors. Bounded BFS over
         * reduced exact rationals; bounds far exceed any authorable ladder (every factor is a
         * schema-checked rational and authored ladders are 1–3 presses deep). */
        if (spec.requireSolvedForm === true && spec.target) {
          const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
          const red = (n: number, d: number): [number, number] => {
            const g = gcd(n, d) || 1;
            const s = d < 0 ? -1 : 1;
            return [(s * n) / g, (s * d) / g];
          };
          const key = (n: number, d: number) => `${n}/${d}`;
          const factors = spec.transforms.map((t) => red(t.factor.n, t.factor.d));
          const startC = red(spec.start.coeff.n, spec.start.coeff.d);
          const seen = new Set<string>([key(...startC)]);
          const queue: [number, number][] = [startC];
          const LIMIT = 1_000_000;
          let solvedReachable = startC[0] === startC[1];
          /* The search is bounded, and the message must be true either way (S217 QA REQUIRED_FIX 2):
           * if the frontier was exhausted, unreachability is PROVED and the message says so; if the
           * search halted on its caps, we refuse to certify — conservative, and worded as what it
           * is — rather than assert an unreachability the search did not establish. */
          let halted = false;
          while (queue.length > 0 && !solvedReachable) {
            if (seen.size >= 256) { halted = true; break; }
            const [cn, cd] = queue.shift() as [number, number];
            for (const [fn, fd] of factors) {
              const [nn, nd] = red(cn * fn, cd * fd);
              if (nd === 0) continue;
              if (Math.abs(nn) > LIMIT || Math.abs(nd) > LIMIT) { halted = true; continue; }
              const k = key(nn, nd);
              if (seen.has(k)) continue;
              seen.add(k);
              if (nn === nd) { solvedReachable = true; break; }
              queue.push([nn, nd]);
            }
          }
          if (!solvedReachable)
            errs.push(
              halted
                ? "numberLineRay: requireSolvedForm demands coefficient 1, and the bounded search over the offered both-sides transforms could not confirm it is reachable from the start coefficient — simplify the transform ladder so solvability is checkable"
                : "numberLineRay: requireSolvedForm demands coefficient 1, but no finite sequence of the offered both-sides transforms reaches it from the start coefficient — the item is unsolvable as authored"
            );
        }
      }
      break;
    }
    /**
     * S215b: the area rectangle must not need same-kind tiles of BOTH signs.
     *
     * The area grader (evaluate.ts, gated on `spec.area`) compares NET tile counts, because that is
     * what this engine has always graded and what the 26 classic specs depend on — a mat carrying
     * zero pairs denotes the same expression there, and that is a feature. The area PICTURE counts
     * signed cells, because a partial product has a sign. For almost every rectangle the two agree.
     * They part company when one kind's cells carry both signs, and only the x-kind ever can: x²
     * cells come only from x·x and unit cells only from unit·unit, so each of those has a single
     * sign, while x cells come from TWO products — the width's x part against the height's unit
     * part, and the height's x part against the width's unit part.
     *
     * (x − 2)(x + 3) is the smallest case: three positive x strips and two negative ones. A mat
     * holding ONE positive x-tile has the right net, so the grader says CORRECT, while the picture
     * correctly reports "8 of 12 parts covered". The picture is the one that is right — collapsing
     * five strips to a net of one is the step the learner is there to perform, not to be credited
     * for skipping.
     *
     * Refusing the spec is the cheap closure, not the proper one. The proper one is to give the
     * AREA grader a population check (leaving nets for the classic mat, which must not move); until
     * that exists, this guard is what stops the divergence reaching a learner. Recorded in
     * KNOWN_ISSUES terms rather than left as a comment in a test file, which is where the
     * constraint lived before.
     */
    case "algebraTiles": {
      if (spec.area) {
        const [wx, wu] = spec.area.width;
        const [hx, hu] = spec.area.height;
        const a = hx * wu;
        const b = hu * wx;
        if (a * b < 0) {
          const pos = (a > 0 ? Math.abs(a) : 0) + (b > 0 ? Math.abs(b) : 0);
          const neg = (a < 0 ? Math.abs(a) : 0) + (b < 0 ? Math.abs(b) : 0);
          errs.push(
            `algebraTiles: this rectangle needs ${pos} positive and ${neg} negative x-tiles, because its two x strips come from parts of opposite sign. ` +
              `The area grader compares NET tile counts, so a mat holding a net of ${pos - neg} would be graded CORRECT while the picture correctly reports the rectangle unfilled. ` +
              `Give both edges' parts matching signs until the area grader counts tiles rather than nets.`
          );
        }
      }
      break;
    }
    /**
     * S213: the editable-line gate, actually RUN. S212 shipped `systemsExploreEditErrors` and
     * described the borrowed-message state as "unreachable by construction" — but nothing called
     * it on authored content, so `validate:content` never exercised it and the state was in fact
     * perfectly reachable. A validator nobody runs is a comment. This is the call that makes the
     * sentence true.
     */
    case "systemsExplore":
      errs.push(...systemsExploreEditErrors(spec));
      break;
    case "scaledCircleLab": {
      if ((spec.drawingRadius === undefined) !== (spec.scale === undefined))
        errs.push("scaledCircleLab: drawingRadius and scale must be supplied together");
      if (spec.drawingRadius !== undefined && spec.scale !== undefined && Math.abs(spec.drawingRadius * spec.scale - spec.realRadius) > 1e-9)
        errs.push(`scaledCircleLab: ${spec.drawingRadius} × ${spec.scale} does not equal realRadius ${spec.realRadius}`);
      const correct = spec.choices.filter((choice) => scaledCircleChoiceCorrect(spec, choice));
      if (correct.length !== 1) errs.push(`scaledCircleLab: expected exactly one correct claim, found ${correct.length}`);
      if (new Set(spec.choices.map((choice) => choice.id)).size !== spec.choices.length) errs.push("scaledCircleLab: choice ids must be unique");
      if (new Set(spec.choices.map((choice) => choice.value)).size !== spec.choices.length) errs.push("scaledCircleLab: choice values must be unique");
      break;
    }
    case "percentChangeLab": {
      const target = percentChangeTarget(spec);
      const amount = percentChangeAmount(spec);
      if (spec.direction === "markdown" && target < 0)
        errs.push(`percentChangeLab: markdown target ${target} is negative`);
      if (!Number.isFinite(amount) || !Number.isFinite(target))
        errs.push("percentChangeLab: derived change and target must be finite");
      const ids = spec.choices.map((choice) => choice.id);
      const values = spec.choices.map((choice) => choice.value);
      if (new Set(ids).size !== ids.length) errs.push("percentChangeLab: choice ids must be unique");
      if (new Set(values).size !== values.length) errs.push("percentChangeLab: choice values must be unique");
      const correct = spec.choices.filter((choice) => percentChangeChoiceCorrect(spec, choice));
      if (correct.length !== 1) errs.push(`percentChangeLab: expected exactly one correct price claim, found ${correct.length}`);
      break;
    }
    case "equationOutcomeLab": {
      if (![spec.leftCoeff, spec.leftConstant, spec.rightCoeff, spec.rightConstant].every(Number.isFinite)) errs.push("equationOutcomeLab: normalized coefficients and constants must be finite");
      if (spec.mode === "classify") {
        if (spec.answerMode !== "outcome") errs.push("equationOutcomeLab: classify mode requires outcome answerMode");
        const ids = spec.choices.map((choice) => choice.id), labels = spec.choices.map((choice) => choice.label);
        if (spec.choices.length < 3) errs.push("equationOutcomeLab: classify mode requires at least three outcome claims");
        if (new Set(ids).size !== ids.length) errs.push("equationOutcomeLab: choice ids must be unique");
        if (new Set(labels).size !== labels.length) errs.push("equationOutcomeLab: choice labels must be unique");
        const correct = spec.choices.filter((choice) => equationOutcomeChoiceCorrect(spec, choice));
        if (correct.length !== 1) errs.push(`equationOutcomeLab: expected exactly one correct outcome claim, found ${correct.length}`);
        if (spec.operations.length || spec.correctOrder.length) errs.push("equationOutcomeLab: classify mode cannot carry transform operations");
      } else {
        if (spec.answerMode === "outcome") errs.push("equationOutcomeLab: transform mode requires sequence or numeric answerMode");
        const ids = spec.operations.map((operation) => operation.id), labels = spec.operations.map((operation) => operation.label);
        if (!spec.operations.length) errs.push("equationOutcomeLab: transform mode requires operations");
        if (new Set(ids).size !== ids.length) errs.push("equationOutcomeLab: operation ids must be unique");
        if (new Set(labels).size !== labels.length) errs.push("equationOutcomeLab: operation labels must be unique");
        if (new Set(spec.correctOrder).size !== spec.correctOrder.length) errs.push("equationOutcomeLab: correctOrder must be unique");
        for (const id of spec.correctOrder) if (!ids.includes(id)) errs.push(`equationOutcomeLab: correctOrder references missing operation ${id}`);
        if (spec.correctOrder.length !== spec.operations.length) errs.push("equationOutcomeLab: every transform operation must appear exactly once in correctOrder");
        if (spec.requiredMoves > spec.correctOrder.length) errs.push("equationOutcomeLab: requiredMoves exceeds the operation sequence");
        for (const operation of spec.operations) {
          if (operation.kind !== "normalize" && typeof operation.value !== "number") errs.push(`equationOutcomeLab: operation ${operation.id} requires a value`);
          if (operation.kind !== "normalize" && operation.result) errs.push(`equationOutcomeLab: operation ${operation.id} may carry a result state only when it is a normalize rewrite`);
          if (operation.kind === "normalize" && operation.value !== undefined) errs.push(`equationOutcomeLab: normalize operation ${operation.id} must not carry a scalar value`);
        }
        let truth:ReturnType<typeof equationTransformTruth>|undefined;try{truth=equationTransformTruth(spec)}catch(error){errs.push(error instanceof Error?error.message:"equationOutcomeLab: transform truth failed")}
        if (truth?.states.length) {
          const final=truth.states.at(-1)!.state, variableLeft=Math.abs(final.leftCoeff-1)<1e-9&&Math.abs(final.rightCoeff)<1e-9&&Math.abs(final.leftConstant)<1e-9;
          if (!variableLeft) errs.push("equationOutcomeLab: correct sequence must finish with the variable isolated on the left");
          if (spec.answerMode === "numeric") {
            const values=spec.numericErrors.map(error=>error.value);
            if (new Set(values).size!==values.length) errs.push("equationOutcomeLab: numeric error values must be unique");
            if (truth.answerNumber!==undefined&&values.some(value=>Math.abs(value-truth!.answerNumber!)<=spec.tolerance)) errs.push("equationOutcomeLab: numeric error collides with the correct boundary");
          }
        }
      }
      break;
    }
    case "signedFractionLab": {
      const truth = signedFractionTruth(spec);
      const ids = spec.choices.map((choice) => choice.id);
      const labels = spec.choices.map((choice) => choice.label);
      if (new Set(ids).size !== ids.length) errs.push("signedFractionLab: choice ids must be unique");
      if (new Set(labels).size !== labels.length) errs.push("signedFractionLab: choice labels must be unique");
      const correct = spec.choices.filter((choice) => signedFractionChoiceCorrect(spec, choice));
      if (correct.length !== 1) errs.push(`signedFractionLab: expected exactly one correct claim, found ${correct.length}`);
      for (const choice of spec.choices) {
        if (choice.path === "correct" && !signedFractionChoiceCorrect(spec, choice)) errs.push(`signedFractionLab: ${choice.id} is marked correct but is not the derived result`);
        if (choice.path !== "correct" && signedFractionChoiceCorrect(spec, choice)) errs.push(`signedFractionLab: ${choice.id} is a wrong path but grades correct`);
        if (choice.path === "wrongSign" && !(choice.sign === -truth.sign && choice.num * truth.den === truth.num * choice.den))
          errs.push(`signedFractionLab: ${choice.id} wrongSign must preserve the target magnitude and flip only the sign`);
        if (choice.path === "keptDivisor") {
          if (spec.operation !== "divide") errs.push(`signedFractionLab: ${choice.id} keptDivisor is valid only for division`);
          const rawNum = spec.left.num * spec.right.num, rawDen = spec.left.den * spec.right.den;
          if (!(choice.sign === truth.sign && choice.num * rawDen === rawNum * choice.den)) errs.push(`signedFractionLab: ${choice.id} does not represent multiplying without flipping`);
        }
        if (choice.path === "unreduced" && !(spec.form === "lowestTerms" && signedFractionChoiceEquivalent(truth, choice) && (choice.num !== truth.num || choice.den !== truth.den)))
          errs.push(`signedFractionLab: ${choice.id} unreduced path must be equivalent but not lowest terms`);
      }
      break;
    }
    case "triangleClosureLab": {
      const [a, b, c] = [...spec.sides].sort((x, y) => x - y);
      const correct = spec.choices.filter((choice) => triangleClosureChoiceCorrect(spec, choice));
      if (correct.length !== 1) errs.push(`triangleClosureLab: expected exactly one correct authored claim, found ${correct.length}`);
      if (new Set(spec.choices.map((choice) => choice.id)).size !== spec.choices.length) errs.push("triangleClosureLab: choice ids must be unique");
      if (spec.angleStart % spec.angleStep !== 0) errs.push("triangleClosureLab: angleStart must sit on the angleStep lattice");
      const target = triangleClosureTargetAngle(spec.sides);
      if (a + b > c && target === null) errs.push("triangleClosureLab: valid sides have no reachable closure angle");
      break;
    }
    case "angleMeasure": {
      if (spec.linearPair) {
        if ((1 + spec.linearPair.multiplier) * spec.targetAngle !== spec.linearPair.total)
          errs.push(`angleMeasure linearPair: target ${spec.targetAngle} does not solve (1 + ${spec.linearPair.multiplier})x = ${spec.linearPair.total}`);
        for (const common of spec.commonAngles ?? []) {
          if (common.angle === spec.targetAngle) errs.push("angleMeasure: common angle equals target");
          if (common.angle % spec.angleStep !== 0) errs.push(`angleMeasure: common angle ${common.angle} is off the step lattice`);
        }
      } else if ((spec.commonAngles ?? []).length) {
        errs.push("angleMeasure: commonAngles are reserved for an explicit relationship context");
      }
      break;
    }
    case "shapeHierarchyLab": {
      const ids = spec.choices.map((choice) => choice.id);
      const labels = spec.choices.map((choice) => choice.label);
      const claims = spec.choices.map((choice) => choice.claim);
      const nodeIds = new Set(spec.nodes.map((node) => node.id));
      if (new Set(ids).size !== ids.length) errs.push("shapeHierarchyLab: choice ids must be unique");
      if (new Set(labels).size !== labels.length) errs.push("shapeHierarchyLab: choice labels must be unique");
      if (new Set(claims).size !== claims.length) errs.push("shapeHierarchyLab: choice claims must be unique");
      if (nodeIds.size !== spec.nodes.length) errs.push("shapeHierarchyLab: node ids must be unique");
      for (const [from, to] of spec.edges) if (!nodeIds.has(from) || !nodeIds.has(to)) errs.push(`shapeHierarchyLab: edge ${from} → ${to} references a missing node`);
      for (const choice of spec.choices) for (const id of choice.highlightNodeIds) if (!nodeIds.has(id)) errs.push(`shapeHierarchyLab: choice ${choice.id} highlights missing node ${id}`);
      const correct = spec.choices.filter((choice) => shapeHierarchyChoiceCorrect(spec, choice));
      if (correct.length !== 1) errs.push(`shapeHierarchyLab: expected exactly one correct claim, found ${correct.length}`);
      if ((spec.mode === "hierarchy" || spec.mode === "verdict") && spec.nodes.length < 2) errs.push(`shapeHierarchyLab ${spec.mode}: at least two family nodes are required`);
      if (spec.mode === "hierarchy" && !spec.answerClaim) errs.push("shapeHierarchyLab hierarchy: answerClaim is required");
      if (spec.mode === "verdict") {
        if (!spec.relation || !spec.subjectLabel || !spec.predicateLabel) errs.push("shapeHierarchyLab verdict: relation, subjectLabel, and predicateLabel are required");
        if (spec.relation === "subset" && !spec.witness) errs.push("shapeHierarchyLab verdict subset: witness is required");
        if (spec.relation === "overlap" && (!spec.witness || !spec.counterexample)) errs.push("shapeHierarchyLab verdict overlap: witness and counterexample are required");
        if (spec.relation === "disjoint" && !spec.blocker) errs.push("shapeHierarchyLab verdict disjoint: blocker is required");
      }
      if (spec.mode === "triangle") {
        if (!spec.triangleQuestion) errs.push("shapeHierarchyLab triangle: triangleQuestion is required");
        if ((spec.triangleQuestion === "side" || spec.triangleQuestion === "sideInclusive" || spec.triangleQuestion === "dual") && !spec.triangleSides) errs.push("shapeHierarchyLab triangle: side data are required");
        if ((spec.triangleQuestion === "angle" || spec.triangleQuestion === "dual") && !spec.triangleAngles) errs.push("shapeHierarchyLab triangle: angle data are required");
        if (spec.triangleAngles && Math.abs(spec.triangleAngles.reduce((sum, angle) => sum + angle, 0) - 180) > 1e-9) errs.push("shapeHierarchyLab triangle: angles must sum to 180°");
        if (spec.triangleSides) {
          const [a,b,c]=[...spec.triangleSides].sort((x,y)=>x-y);
          if (a+b<=c) errs.push("shapeHierarchyLab triangle: side lengths must form a non-degenerate triangle");
        }
      }
      break;
    }
    case "unitRuler": {
      const length = spec.objectEnd - spec.objectStart;
      if (length <= 0) errs.push("unitRuler: objectEnd must be greater than objectStart");
      if (!spec.allowedUnitSizes.includes(spec.targetUnitSize))
        errs.push("unitRuler: targetUnitSize must be one of allowedUnitSizes");
      if (!spec.allowedUnitSizes.includes(spec.startUnitSize))
        errs.push("unitRuler: startUnitSize must be one of allowedUnitSizes");
      if (Math.abs(spec.requiredPlacements * spec.targetUnitSize - length) > 1e-9)
        errs.push(`unitRuler: ${spec.requiredPlacements} placements of ${spec.targetUnitSize} cover ${spec.requiredPlacements * spec.targetUnitSize}, not object length ${length}`);
      const seen = new Set<number>();
      for (const c of spec.commonPlacements) {
        if (c.placements === spec.requiredPlacements)
          errs.push("unitRuler: a commonPlacements entry equals the correct placement count");
        if (seen.has(c.placements)) errs.push(`unitRuler: duplicate commonPlacements count ${c.placements}`);
        seen.add(c.placements);
      }
      break;
    }
    case "proportionalReasoningLab": {
      const ids = spec.series.map((entry) => entry.id);
      const labels = spec.series.map((entry) => entry.label);
      if (new Set(ids).size !== ids.length) errs.push("proportionalReasoningLab: series ids must be unique");
      if (new Set(labels).size !== labels.length) errs.push("proportionalReasoningLab: series labels must be unique");
      for (const entry of spec.series) {
        if (entry.pairs.some(([x]) => x === 0)) errs.push(`proportionalReasoningLab: ${entry.id} contains a zero input, so y/x is undefined`);
        const pairKeys = entry.pairs.map(([x,y]) => `${x}|${y}`);
        if (new Set(pairKeys).size !== pairKeys.length) errs.push(`proportionalReasoningLab: ${entry.id} contains duplicate pairs`);
      }
      if (spec.targetSeriesId && !ids.includes(spec.targetSeriesId)) errs.push(`proportionalReasoningLab: target series ${spec.targetSeriesId} is missing`);
      const needsInput = ["predictOutput","scaleRatio","percentOf","discount","cheaperThenPredict"].includes(spec.task);
      if (needsInput && typeof spec.targetInput !== "number") errs.push(`proportionalReasoningLab: ${spec.task} requires targetInput`);
      if (spec.task === "predictInput" && typeof spec.targetOutput !== "number") errs.push("proportionalReasoningLab: predictInput requires targetOutput");
      if (["percentOf","discount"].includes(spec.task) && typeof spec.percent !== "number") errs.push(`proportionalReasoningLab: ${spec.task} requires percent`);
      if (["bestRate","cheaperThenPredict"].includes(spec.task) && !spec.optimize) errs.push(`proportionalReasoningLab: ${spec.task} requires optimize`);
      const truth = proportionalReasoningTruth(spec);
      const target = truth.target;
      const predictive = ["unitRate","constant","predictOutput","predictInput","scaleRatio","discount"].includes(spec.task);
      if (predictive && !target.proportional) errs.push(`proportionalReasoningLab: ${spec.task} requires a constant target ratio`);
      if (["bestRate","cheaperThenPredict"].includes(spec.task) && truth.series.some((entry) => !entry.proportional))
        errs.push(`proportionalReasoningLab: ${spec.task} requires every compared series to have a constant ratio`);
      if (spec.task === "predictInput" && Math.abs(target.constant) < 1e-12)
        errs.push("proportionalReasoningLab: predictInput cannot divide by a zero rate");
      const availableExplorations = proportionalReasoningExplorationKeys(spec).length;
      if (spec.requiredExplorations > availableExplorations)
        errs.push(`proportionalReasoningLab: requiredExplorations ${spec.requiredExplorations} exceeds ${availableExplorations} inspectable states`);
      const choiceIds = spec.choices.map((choice) => choice.id);
      const choiceLabels = spec.choices.map((choice) => choice.label);
      const choiceClaims = spec.choices.map((choice) => choice.claim ?? (typeof choice.value === "number" ? proportionalClaimForNumber(choice.value) : ""));
      if (new Set(choiceIds).size !== choiceIds.length) errs.push("proportionalReasoningLab: choice ids must be unique");
      if (new Set(choiceLabels).size !== choiceLabels.length) errs.push("proportionalReasoningLab: choice labels must be unique");
      for (const choice of spec.choices) {
        const hasClaim = typeof choice.claim === "string";
        const hasValue = typeof choice.value === "number";
        if (hasClaim === hasValue)
          errs.push(`proportionalReasoningLab: choice ${choice.id} must carry exactly one mathematical claim or numeric value`);
      }
      if (new Set(choiceClaims).size !== choiceClaims.length) errs.push("proportionalReasoningLab: mathematical choice claims must be unique");
      if (spec.answerMode === "choice") {
        if (spec.choices.length < 2) errs.push("proportionalReasoningLab: choice mode requires at least two choices");
        const matches = spec.choices.filter((choice) => proportionalReasoningChoiceCorrect(spec, choice));
        if (matches.length !== 1) errs.push(`proportionalReasoningLab: expected exactly one independently derived correct choice, found ${matches.length}`);
      } else {
        if (spec.choices.length) errs.push("proportionalReasoningLab: numeric mode must not carry answer choices");
        if (typeof truth.answerNumber !== "number" || !Number.isFinite(truth.answerNumber)) errs.push("proportionalReasoningLab: numeric mode has no finite derived answer");
        const values = spec.numericErrors.map((entry) => entry.value);
        if (new Set(values).size !== values.length) errs.push("proportionalReasoningLab: numeric misconception values must be unique");
        const answerNumber = truth.answerNumber;
        if (typeof answerNumber === "number" && values.some((value) => Math.abs(value-answerNumber) <= spec.tolerance)) errs.push("proportionalReasoningLab: a numeric misconception collides with the derived answer");
      }
      break;
    }
    case "placeValueTransformLab": {
      const truth=placeValueTransformTruth(spec);
      const needsTarget=["round","roundPartsThenSum","roundMethod","roundGapCause","placeExponent","evaluatePowerTen"].includes(spec.task);
      if(needsTarget&&typeof spec.targetExponent!=="number") errs.push(`placeValueTransformLab: ${spec.task} requires targetExponent`);
      if(spec.task==="shift"&&typeof spec.shiftExponent!=="number") errs.push("placeValueTransformLab: shift requires shiftExponent");
      if(["identifyShift","compare","decidingPlace","decimalDivision","divisionFirstMove"].includes(spec.task)&&spec.values.length!==2)
        errs.push(`placeValueTransformLab: ${spec.task} requires exactly two values`);
      if(["round","roundPartsThenSum","roundMethod","roundGapCause"].includes(spec.task)&&spec.values.length<1)
        errs.push(`placeValueTransformLab: ${spec.task} requires at least one value`);
      if(["decimalDivision","divisionFirstMove"].includes(spec.task)&&Math.abs(spec.values[1]??0)<1e-12)
        errs.push(`placeValueTransformLab: ${spec.task} cannot divide by zero`);
      if(spec.task==="exponentChain"&&spec.exponentOps.length!==spec.values.length-1)
        errs.push(`placeValueTransformLab: exponentChain requires ${spec.values.length-1} exponent operations`);
      if(spec.task!=="exponentChain"&&spec.exponentOps.length)
        errs.push(`placeValueTransformLab: ${spec.task} must not carry exponent operations`);
      if(spec.task==="scientificForm"&&Math.abs(spec.values[0]??0)<1e-12)
        errs.push("placeValueTransformLab: scientificForm requires a nonzero value");
      if(spec.task==="identifyShift"){
        const [start=0,end=0]=spec.values; const ratio=start===0?Number.NaN:end/start;
        if(!Number.isFinite(ratio)||ratio<=0||Math.abs(Math.log10(ratio)-Math.round(Math.log10(ratio)))>1e-9)
          errs.push("placeValueTransformLab: identifyShift values must differ by an exact power of ten");
      }
      const available=placeValueTransformExplorationKeys(spec).length;
      if(spec.requiredExplorations>available)
        errs.push(`placeValueTransformLab: requiredExplorations ${spec.requiredExplorations} exceeds ${available} inspectable states`);
      const ids=spec.choices.map((choice)=>choice.id), labels=spec.choices.map((choice)=>choice.label);
      const claims=spec.choices.map((choice)=>choice.claim??(typeof choice.value==="number"?placeValueClaimForNumber(choice.value):""));
      if(new Set(ids).size!==ids.length) errs.push("placeValueTransformLab: choice ids must be unique");
      if(new Set(labels).size!==labels.length) errs.push("placeValueTransformLab: choice labels must be unique");
      for(const choice of spec.choices){
        const hasClaim=typeof choice.claim==="string",hasValue=typeof choice.value==="number";
        if(hasClaim===hasValue) errs.push(`placeValueTransformLab: choice ${choice.id} must carry exactly one mathematical claim or numeric value`);
      }
      if(new Set(claims).size!==claims.length) errs.push("placeValueTransformLab: mathematical choice claims must be unique");
      if(spec.answerMode==="choice"){
        if(spec.choices.length<2) errs.push("placeValueTransformLab: choice mode requires at least two choices");
        const matches=spec.choices.filter((choice)=>placeValueTransformChoiceCorrect(spec,choice));
        if(matches.length!==1) errs.push(`placeValueTransformLab: expected exactly one independently derived correct choice, found ${matches.length}`);
      } else {
        if(spec.choices.length) errs.push("placeValueTransformLab: numeric mode must not carry answer choices");
        if(typeof truth.answerNumber!=="number"||!Number.isFinite(truth.answerNumber)) errs.push("placeValueTransformLab: numeric mode has no finite derived answer");
        const values=spec.numericErrors.map((entry)=>entry.value);
        if(new Set(values).size!==values.length) errs.push("placeValueTransformLab: numeric misconception values must be unique");
        const answerNumberQ = truth.answerNumber;
        if(typeof answerNumberQ==="number"&&values.some((value)=>Math.abs(value-answerNumberQ)<=spec.tolerance))
          errs.push("placeValueTransformLab: a numeric misconception collides with the derived answer");
      }
      break;
    }
    case "pointSetReasoningLab": {
      const setIds=spec.sets.map(set=>set.id);if(new Set(setIds).size!==setIds.length)errs.push("pointSetReasoningLab: set ids must be unique");
      for(const set of spec.sets){const ids=set.points.map(point=>point.id);if(new Set(ids).size!==ids.length)errs.push(`pointSetReasoningLab: point ids in ${set.id} must be unique`)}
      const target=spec.sets.find(set=>set.id===(spec.targetSetId??spec.sets[0]?.id));if(!target)errs.push("pointSetReasoningLab: targetSetId must name an authored set");
      const twoD=new Set(["axisMeaning","axisDistance","pointRead","sequenceExtend","pathLength","pointMeaning","unitRate"]);if(twoD.has(spec.task)&&target?.points.some(point=>point.y===undefined))errs.push("pointSetReasoningLab: coordinate tasks require y-values for every target point");
      if(spec.targetPointId&&!target?.points.some(point=>point.id===spec.targetPointId))errs.push("pointSetReasoningLab: targetPointId must name a target-set point");
      if(spec.pathPointIds)for(const id of spec.pathPointIds)if(!target?.points.some(point=>point.id===id))errs.push(`pointSetReasoningLab: path point ${id} is missing`);
      if(spec.task==="sequenceExtend"&&target){const pts=[...target.points].sort((a,b)=>a.x-b.x);if(pts.length<2)errs.push("pointSetReasoningLab: sequence extension requires at least two points");else{const rate=((pts[1].y??0)-(pts[0].y??0))/(pts[1].x-pts[0].x);if(!Number.isFinite(rate)||pts.some((point,index)=>index>0&&Math.abs(((point.y??0)-(pts[0].y??0))-rate*(point.x-pts[0].x))>1e-9))errs.push("pointSetReasoningLab: sequence points must share one constant rate")}}
      // unitRate is the one task whose answer is a relationship BETWEEN points, so every plotted
      // point has to sit on the same line through the origin. A second point off that line would
      // draw a picture the derived rate contradicts — the exact failure this engine exists to end.
      if(spec.task==="unitRate"&&target){const p=(spec.targetPointId?target.points.find(point=>point.id===spec.targetPointId):undefined)??target.points[0];if(!p||p.x===0)errs.push("pointSetReasoningLab: unitRate requires a target point with a nonzero input value");else{const rate=(p.y??0)/p.x;for(const q of target.points){if(q.x===0&&(q.y??0)===0)continue;if(q.x===0||Math.abs((q.y??0)-rate*q.x)>1e-9)errs.push(`pointSetReasoningLab: point ${q.id} is off the proportional line the unit rate is read from`)}}}
      if(spec.task==="rangeBlindness"&&spec.sets.length<2)errs.push("pointSetReasoningLab: rangeBlindness requires two sets");
      let truth:ReturnType<typeof pointSetReasoningTruth>|undefined;try{truth=pointSetReasoningTruth(spec)}catch(error){errs.push(`pointSetReasoningLab: ${error instanceof Error?error.message:String(error)}`)}
      const valid=new Set(truth?.stages.map(stage=>stage.key)??[]);if(new Set(spec.requiredStageKeys).size!==spec.requiredStageKeys.length)errs.push("pointSetReasoningLab: requiredStageKeys must be unique");for(const key of spec.requiredStageKeys)if(!valid.has(key))errs.push(`pointSetReasoningLab: invalid required stage ${key}`);if(spec.requiredExplorations>valid.size)errs.push(`pointSetReasoningLab: requiredExplorations ${spec.requiredExplorations} exceeds ${valid.size} inspectable states`);
      const ids=spec.choices.map(choice=>choice.id),labels=spec.choices.map(choice=>choice.label);if(new Set(ids).size!==ids.length)errs.push("pointSetReasoningLab: choice ids must be unique");if(new Set(labels).size!==labels.length)errs.push("pointSetReasoningLab: choice labels must be unique");for(const choice of spec.choices){const carriers=Number(choice.claim!==undefined)+Number(choice.numberValue!==undefined);if(carriers!==1)errs.push(`pointSetReasoningLab: choice ${choice.id} must carry exactly one mathematical truth carrier`)}
      const carriers=spec.choices.map(choice=>choice.claim??`number:${pointSetClean(choice.numberValue??NaN)}`);if(new Set(carriers).size!==carriers.length)errs.push("pointSetReasoningLab: mathematical choice truths must be unique");
      if(spec.answerMode==="choice"){if(spec.numericErrors.length)errs.push("pointSetReasoningLab: choice mode cannot carry numeric errors");const correct=truth?spec.choices.filter(choice=>pointSetReasoningChoiceCorrect(spec,choice)):[];if(correct.length!==1)errs.push(`pointSetReasoningLab: expected exactly one correct choice, found ${correct.length}`)}
      if(spec.answerMode==="numeric"){if(spec.choices.length)errs.push("pointSetReasoningLab: numeric mode cannot carry choices");const traps=spec.numericErrors.map(entry=>entry.value);if(new Set(traps).size!==traps.length)errs.push("pointSetReasoningLab: numeric error values must be unique");if(typeof truth?.answerNumber!=="number")errs.push("pointSetReasoningLab: numeric mode requires a numeric truth");else if(spec.numericErrors.some(entry=>Math.abs(entry.value-truth!.answerNumber!)<=spec.tolerance))errs.push("pointSetReasoningLab: numeric error collides with the correct answer")}
      if(spec.answerMode==="explore"&&(spec.choices.length||spec.numericErrors.length))errs.push("pointSetReasoningLab: explore mode cannot carry answer surfaces");break;
    }
    case "geometricConstraintLab": {
      const present=[spec.perimeter,spec.coordinate,spec.scale,spec.angle,spec.aa,spec.pythagorean,spec.coordinateProof].filter(Boolean).length;
      if(present!==1)errs.push(`geometricConstraintLab: expected exactly one domain model, found ${present}`);
      const expected=spec.task==="perimeterMissing"?spec.perimeter:spec.task==="coordinateArea"?spec.coordinate:spec.task==="scaledArea"?spec.scale:spec.task==="angleCrossing"?spec.angle:spec.task==="aaSimilarity"?spec.aa:spec.task==="pythagoreanArea"?spec.pythagorean:spec.coordinateProof;
      if(!expected)errs.push(`geometricConstraintLab: ${spec.task} is missing its domain model`);
      let truth:ReturnType<typeof geometricConstraintTruth>|undefined;try{truth=geometricConstraintTruth(spec)}catch(error){errs.push(`geometricConstraintLab: ${error instanceof Error?error.message:String(error)}`)}
      const valid=new Set(truth?.stages.map(stage=>stage.key)??[]);
      if(new Set(spec.requiredStageKeys).size!==spec.requiredStageKeys.length)errs.push("geometricConstraintLab: requiredStageKeys must be unique");
      for(const key of spec.requiredStageKeys)if(!valid.has(key))errs.push(`geometricConstraintLab: invalid required stage ${key}`);
      if(spec.requiredExplorations>valid.size)errs.push(`geometricConstraintLab: requiredExplorations ${spec.requiredExplorations} exceeds ${valid.size} inspectable states`);
      if(spec.coordinate){const ids=spec.coordinate.pieces.map(piece=>piece.id),labels=spec.coordinate.pieces.map(piece=>piece.label);if(new Set(ids).size!==ids.length)errs.push("geometricConstraintLab: coordinate piece ids must be unique");if(new Set(labels).size!==labels.length)errs.push("geometricConstraintLab: coordinate piece labels must be unique");for(const piece of spec.coordinate.pieces){if(piece.width===0||piece.height===0)errs.push(`geometricConstraintLab: coordinate piece ${piece.id} must have nonzero dimensions`);if(piece.points){const xs=piece.points.map(point=>point[0]),ys=piece.points.map(point=>point[1]),w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);if(Math.abs(Math.abs(piece.width)-w)>1e-9||Math.abs(Math.abs(piece.height)-h)>1e-9)errs.push(`geometricConstraintLab: coordinate piece ${piece.id} dimensions disagree with its points`)}}}
      if(spec.coordinateProof){const ids=spec.coordinateProof.points.map(point=>point.id),labels=spec.coordinateProof.points.map(point=>point.label);if(new Set(ids).size!==ids.length)errs.push("geometricConstraintLab: coordinate proof point ids must be unique");if(new Set(labels).size!==labels.length)errs.push("geometricConstraintLab: coordinate proof point labels must be unique");}
      if(spec.perimeter&&spec.perimeter.knownSides.reduce((sum,value)=>sum+value,0)>=spec.perimeter.perimeter)errs.push("geometricConstraintLab: known perimeter sides must leave positive boundary");
      if(spec.aa){for(const [name,angles] of [["A",spec.aa.anglesA],["B",spec.aa.anglesB]] as const){if(angles.reduce((sum,value)=>sum+value,0)>=180)errs.push(`geometricConstraintLab: triangle ${name} angles must leave a positive third angle`)}}
      if(spec.pythagorean){const a=spec.pythagorean.legAreaA??(spec.pythagorean.legA?spec.pythagorean.legA**2:undefined),b=spec.pythagorean.legAreaB??(spec.pythagorean.legB?spec.pythagorean.legB**2:undefined);
      if(spec.pythagorean.target==="legLength"){if(a===undefined||spec.pythagorean.hypotenuse===undefined)errs.push("geometricConstraintLab: legLength requires one known leg and the hypotenuse");else if(spec.pythagorean.hypotenuse**2-a<=0)errs.push("geometricConstraintLab: legLength requires hypotenuse longer than the known leg");}
      else{if(a===undefined||b===undefined)errs.push("geometricConstraintLab: Pythagorean model requires two leg lengths or square areas");}if(spec.pythagorean.target==="length"&&a!==undefined&&b!==undefined&&Math.abs(Math.sqrt(a+b)-Math.round(Math.sqrt(a+b)))>1e-9)errs.push("geometricConstraintLab: authored exact-length task requires a square hypotenuse area")}
      const ids=spec.choices.map(choice=>choice.id),labels=spec.choices.map(choice=>choice.label);if(new Set(ids).size!==ids.length)errs.push("geometricConstraintLab: choice ids must be unique");if(new Set(labels).size!==labels.length)errs.push("geometricConstraintLab: choice labels must be unique");
      for(const choice of spec.choices){const carriers=Number(choice.claim!==undefined)+Number(choice.numberValue!==undefined);if(carriers!==1)errs.push(`geometricConstraintLab: choice ${choice.id} must carry exactly one mathematical truth carrier`)}
      const carriers=spec.choices.map(choice=>choice.claim??`number:${geometricClean(choice.numberValue??NaN)}`);if(new Set(carriers).size!==carriers.length)errs.push("geometricConstraintLab: mathematical choice truths must be unique");
      if(spec.answerMode==="choice"){if(spec.numericErrors.length)errs.push("geometricConstraintLab: choice mode cannot carry numeric errors");const correct=truth?spec.choices.filter(choice=>geometricConstraintChoiceCorrect(spec,choice)):[];if(correct.length!==1)errs.push(`geometricConstraintLab: expected exactly one correct choice, found ${correct.length}`)}
      if(spec.answerMode==="numeric"){if(spec.choices.length)errs.push("geometricConstraintLab: numeric mode cannot carry choices");const traps=spec.numericErrors.map(entry=>entry.value);if(new Set(traps).size!==traps.length)errs.push("geometricConstraintLab: numeric error values must be unique");if(typeof truth?.answerNumber!=="number")errs.push("geometricConstraintLab: numeric mode requires a numeric truth");else if(spec.numericErrors.some(entry=>Math.abs(entry.value-truth!.answerNumber!)<=spec.tolerance))errs.push("geometricConstraintLab: numeric error collides with the correct answer")}
      if(spec.answerMode==="explore"&&(spec.choices.length||spec.numericErrors.length))errs.push("geometricConstraintLab: explore mode cannot carry answer surfaces");
      break;
    }
    case "exactNumberLab": {
      let truth:ReturnType<typeof exactNumberTruth>|null=null;try{truth=exactNumberTruth(spec)}catch(error){errs.push(error instanceof Error?error.message:"exactNumberLab: truth derivation failed")}
      const ids=spec.values.map(value=>value.id),labels=spec.values.map(value=>value.label),keys=spec.values.map(exactNumberKey);
      if(new Set(ids).size!==ids.length)errs.push("exactNumberLab: source ids must be unique");
      if(new Set(labels).size!==labels.length)errs.push("exactNumberLab: source labels must be unique");
      if((spec.task==="rootSelect"||spec.task==="rootList")&&new Set(keys).size!==keys.length)errs.push("exactNumberLab: selectable mathematical sources must be unique");
      const available=truth?.stages.length??0;if(spec.requiredExplorations>available)errs.push(`exactNumberLab: requiredExplorations ${spec.requiredExplorations} exceeds ${available} truthful stages`);
      const stageKeys=new Set(truth?.stages.map(stage=>stage.key)??[]);for(const key of spec.requiredStageKeys)if(!stageKeys.has(key))errs.push(`exactNumberLab: required stage ${key} is not derived`);if(new Set(spec.requiredStageKeys).size!==spec.requiredStageKeys.length)errs.push("exactNumberLab: required stage keys must be unique");
      const choiceIds=spec.choices.map(choice=>choice.id),choiceLabels=spec.choices.map(choice=>choice.label);
      if(new Set(choiceIds).size!==choiceIds.length)errs.push("exactNumberLab: choice ids must be unique");if(new Set(choiceLabels).size!==choiceLabels.length)errs.push("exactNumberLab: choice labels must be unique");
      for(const choice of spec.choices){const carriers=[choice.claim!==undefined,choice.numberValue!==undefined,choice.relation!==undefined,choice.interval!==undefined,choice.source!==undefined,choice.sourceList!==undefined].filter(Boolean).length;if(carriers!==1)errs.push(`exactNumberLab: choice ${choice.id} must carry exactly one mathematical truth carrier`)}
      const numericValues=spec.numericErrors.map(entry=>entry.value);if(new Set(numericValues).size!==numericValues.length)errs.push("exactNumberLab: numeric misconception values must be unique");
      if(spec.answerMode==="numeric"){if(spec.choices.length)errs.push("exactNumberLab: numeric mode must not carry choices");if(typeof truth?.answerNumber!=="number"||!Number.isFinite(truth.answerNumber))errs.push("exactNumberLab: numeric mode has no finite derived answer");if(typeof truth?.answerNumber==="number"&&numericValues.some(value=>Math.abs(value-truth!.answerNumber!)<=spec.tolerance))errs.push("exactNumberLab: a numeric misconception collides with the derived answer")}
      else if(spec.answerMode==="relation"){if(spec.choices.length||spec.numericErrors.length)errs.push("exactNumberLab: relation mode must not carry choices or numeric errors");if(!truth?.answerRelation)errs.push("exactNumberLab: relation mode has no derived relation")}
      else if(spec.answerMode==="choice"){if(spec.numericErrors.length)errs.push("exactNumberLab: choice mode must not carry numeric errors");const matches=truth?spec.choices.filter(choice=>exactNumberChoiceCorrect(spec,choice)):[];if(matches.length!==1)errs.push(`exactNumberLab: choice mode requires exactly one independently derived correct choice, found ${matches.length}`)}
      else if(spec.choices.length||spec.numericErrors.length)errs.push("exactNumberLab: explore mode must not carry answer traps");
      if(spec.task==="rootBracket"&&typeof spec.targetRadicand==="number"&&typeof spec.lower==="number"&&typeof spec.upper==="number"&&!((spec.lower*spec.lower)<spec.targetRadicand&&spec.targetRadicand<(spec.upper*spec.upper)))errs.push("exactNumberLab: root bracket endpoints do not trap the radicand");
      break;
    }
    case "affineRelationshipLab": {
      let truth:ReturnType<typeof affineRelationshipTruth>|null=null;
      try{truth=affineRelationshipTruth(spec)}catch(error){errs.push(error instanceof Error?error.message:"affineRelationshipLab: truth derivation failed")}
      const lineIds=spec.lines.map(line=>line.id),lineLabels=spec.lines.map(line=>line.label),lineKeys=spec.lines.map(line=>`${affineClean(line.m)}:${affineClean(line.b)}`);
      if(new Set(lineIds).size!==lineIds.length)errs.push("affineRelationshipLab: line ids must be unique");
      if(new Set(lineLabels).size!==lineLabels.length)errs.push("affineRelationshipLab: line labels must be unique");
      if(new Set(lineKeys).size!==lineKeys.length)errs.push("affineRelationshipLab: mathematical lines must be unique");
      for(const line of spec.lines)for(const [x,y] of line.tablePoints)if(Math.abs(affineLineValue(line,x)-y)>1e-9)errs.push(`affineRelationshipLab: ${line.id} table point (${x}, ${y}) is off its line`);
      if(spec.targetLineId&&!lineIds.includes(spec.targetLineId))errs.push(`affineRelationshipLab: target line ${spec.targetLineId} is missing`);
      if(["readSlope","readIntercept","slopeAssociation","evaluateAtX"].includes(spec.task)&&!spec.targetLineId)errs.push(`affineRelationshipLab: ${spec.task} requires targetLineId`);
      if(["intersectionX","intersectionY","intersectionPoint"].includes(spec.task)&&spec.lines.length!==2)errs.push(`affineRelationshipLab: ${spec.task} requires exactly two lines`);
      if(spec.task==="evaluateAtX"&&typeof spec.targetInput!=="number")errs.push("affineRelationshipLab: evaluateAtX requires targetInput");
      if(spec.task==="verifyPoint"&&!spec.candidatePoint)errs.push("affineRelationshipLab: verifyPoint requires candidatePoint");
      if(truth){const stageKeys=new Set(truth.stages.map(stage=>stage.key));for(const key of spec.requiredStageKeys)if(!stageKeys.has(key))errs.push(`affineRelationshipLab: required stage ${key} is not derived`);if(new Set(spec.requiredStageKeys).size!==spec.requiredStageKeys.length)errs.push("affineRelationshipLab: required stage keys must be unique");}
      if(truth&&spec.requiredExplorations>truth.stages.length)errs.push(`affineRelationshipLab: requiredExplorations ${spec.requiredExplorations} exceeds ${truth.stages.length} truthful stages`);
      const choiceIds=spec.choices.map(choice=>choice.id),choiceLabels=spec.choices.map(choice=>choice.label),choiceClaims=spec.choices.map(choice=>choice.claim);
      if(new Set(choiceIds).size!==choiceIds.length)errs.push("affineRelationshipLab: choice ids must be unique");
      if(new Set(choiceLabels).size!==choiceLabels.length)errs.push("affineRelationshipLab: choice labels must be unique");
      if(new Set(choiceClaims).size!==choiceClaims.length)errs.push("affineRelationshipLab: mathematical choice claims must be unique");
      const numericValues=spec.numericErrors.map(entry=>entry.value),pointKeys=spec.pointErrors.map(entry=>entry.values.join(","));
      if(new Set(numericValues).size!==numericValues.length)errs.push("affineRelationshipLab: numeric misconception values must be unique");
      if(new Set(pointKeys).size!==pointKeys.length)errs.push("affineRelationshipLab: point misconception values must be unique");
      if(spec.answerMode==="choice"){
        if(spec.numericErrors.length||spec.pointErrors.length)errs.push("affineRelationshipLab: choice mode must not carry numeric or point errors");
        const matches=truth?spec.choices.filter(choice=>affineRelationshipChoiceCorrect(spec,choice)):[];
        if(matches.length!==1)errs.push("affineRelationshipLab: choice mode requires exactly one independently derived correct choice");
      }else if(spec.answerMode==="numeric"){
        if(spec.choices.length||spec.pointErrors.length)errs.push("affineRelationshipLab: numeric mode must not carry choices or point errors");
        if(typeof truth?.answerNumber!=="number"||!Number.isFinite(truth.answerNumber))errs.push("affineRelationshipLab: numeric mode has no finite derived answer");
        if(typeof truth?.answerNumber==="number"&&numericValues.some(value=>Math.abs(value-truth!.answerNumber!)<=spec.tolerance))errs.push("affineRelationshipLab: a numeric misconception collides with the derived answer");
      }else if(spec.answerMode==="point"){
        if(spec.choices.length||spec.numericErrors.length)errs.push("affineRelationshipLab: point mode must not carry choices or numeric errors");
        if(!truth?.answerPoint)errs.push("affineRelationshipLab: point mode has no derived intersection point");
        if(truth?.answerPoint&&pointKeys.includes(truth.answerPoint.join(",")))errs.push("affineRelationshipLab: a point misconception collides with the derived answer");
      }else if(spec.choices.length||spec.numericErrors.length||spec.pointErrors.length)errs.push("affineRelationshipLab: explore mode must not carry answer traps");
      break;
    }
    case "quotientReasoningLab": {
      let truth: ReturnType<typeof quotientReasoningTruth> | null = null;
      try { truth = quotientReasoningTruth(spec); } catch (error) { errs.push(error instanceof Error ? error.message : "quotientReasoningLab: truth derivation failed"); }
      const needsInteger = ["remainderContext","remainderPolicy","integerQuotient","integerRemainder","invalidRemainder","verifyProduct"].includes(spec.task);
      const needsFractionPair = ["divisorChoice","fractionDivide"].includes(spec.task);
      const needsOneFraction = ["reciprocal","rationalDefinition","decimalExact","decimalClassify","decimalValue","remainderCycle"].includes(spec.task);
      if ((needsInteger || needsFractionPair) && (!spec.dividend || !spec.divisor)) errs.push(`quotientReasoningLab: ${spec.task} requires dividend and divisor`);
      if (needsOneFraction && !spec.dividend) errs.push(`quotientReasoningLab: ${spec.task} requires a dividend fraction`);
      if (spec.task === "remainderContext" || spec.task === "remainderPolicy") if (!spec.contextPolicy) errs.push(`quotientReasoningLab: ${spec.task} requires contextPolicy`);
      if (spec.task === "invalidRemainder" && (typeof spec.claimedQuotient !== "number" || typeof spec.claimedRemainder !== "number")) errs.push("quotientReasoningLab: invalidRemainder requires the student's claimed quotient and remainder");
      if (spec.task === "repeatToFraction" && !spec.repeatBlock) errs.push("quotientReasoningLab: repeatToFraction requires repeatBlock");
      if (spec.repeatBlock && /^0+$/.test(spec.repeatBlock)) errs.push("quotientReasoningLab: repeating block cannot be all zeros");
      if (spec.task === "decimalSelect") {
        if (!spec.classificationTarget) errs.push("quotientReasoningLab: decimalSelect requires classificationTarget");
        if (spec.candidates.length < 2) errs.push("quotientReasoningLab: decimalSelect requires at least two candidate fractions");
        const matches = spec.candidates.filter((candidate) => quotientDecimalExpansion(candidate.value).terminates === (spec.classificationTarget === "terminates"));
        if (matches.length !== 1) errs.push(`quotientReasoningLab: decimalSelect requires exactly one ${spec.classificationTarget ?? "target"} candidate, found ${matches.length}`);
      } else if (spec.candidates.length) errs.push(`quotientReasoningLab: ${spec.task} must not carry candidate fractions`);
      const candidateIds = spec.candidates.map((candidate) => candidate.id), candidateLabels = spec.candidates.map((candidate) => candidate.label), candidateValues = spec.candidates.map((candidate) => quotientRationalKey(candidate.value));
      if (new Set(candidateIds).size !== candidateIds.length) errs.push("quotientReasoningLab: candidate ids must be unique");
      if (new Set(candidateLabels).size !== candidateLabels.length) errs.push("quotientReasoningLab: candidate labels must be unique");
      if (new Set(candidateValues).size !== candidateValues.length) errs.push("quotientReasoningLab: candidate fractions must be mathematically unique");
      const available = truth?.stages.length ?? 0;
      if (spec.requiredExplorations > available) errs.push(`quotientReasoningLab: requiredExplorations ${spec.requiredExplorations} exceeds ${available} inspectable states`);
      if (spec.authoredStages.length > available) errs.push(`quotientReasoningLab: ${spec.authoredStages.length} authored stages exceed ${available} truth stages`);
      const choiceIds = spec.choices.map((choice) => choice.id), choiceLabels = spec.choices.map((choice) => choice.label), choiceClaims = spec.choices.map((choice) => choice.claim);
      if (new Set(choiceIds).size !== choiceIds.length) errs.push("quotientReasoningLab: choice ids must be unique");
      if (new Set(choiceLabels).size !== choiceLabels.length) errs.push("quotientReasoningLab: choice labels must be unique");
      if (new Set(choiceClaims).size !== choiceClaims.length) errs.push("quotientReasoningLab: mathematical choice claims must be unique");
      const numericValues = spec.numericErrors.map((entry) => entry.value);
      if (new Set(numericValues).size !== numericValues.length) errs.push("quotientReasoningLab: numeric misconception values must be unique");
      const fractionValues = spec.fractionErrors.map((entry) => quotientRationalKey(quotientFractionFromMixed(entry) ?? {num:0,den:1}));
      if (new Set(fractionValues).size !== fractionValues.length) errs.push("quotientReasoningLab: fraction misconception values must be mathematically unique");
      if (spec.answerMode === "choice") {
        if (spec.choices.length < 2) errs.push("quotientReasoningLab: choice mode requires at least two choices");
        const matches = spec.choices.filter((choice) => quotientReasoningChoiceCorrect(spec, choice));
        if (matches.length !== 1) errs.push(`quotientReasoningLab: expected exactly one independently derived correct choice, found ${matches.length}`);
        if (spec.numericErrors.length || spec.fractionErrors.length) errs.push("quotientReasoningLab: choice mode must not carry numeric or fraction errors");
      } else if (spec.answerMode === "numeric") {
        if (spec.choices.length || spec.fractionErrors.length) errs.push("quotientReasoningLab: numeric mode must not carry choices or fraction errors");
        if (typeof truth?.answerNumber !== "number" || !Number.isFinite(truth.answerNumber)) errs.push("quotientReasoningLab: numeric mode has no finite derived answer");
        if (typeof truth?.answerNumber === "number" && numericValues.some((value) => Math.abs(value - truth!.answerNumber!) <= spec.tolerance)) errs.push("quotientReasoningLab: a numeric misconception collides with the derived answer");
      } else if (spec.answerMode === "fraction") {
        if (spec.choices.length || spec.numericErrors.length) errs.push("quotientReasoningLab: fraction mode must not carry choices or numeric errors");
        if (!truth?.answerFraction) errs.push("quotientReasoningLab: fraction mode has no exact derived fraction");
        if (truth?.answerFraction && fractionValues.includes(quotientRationalKey(truth.answerFraction))) errs.push("quotientReasoningLab: a fraction misconception collides with the derived answer");
      } else {
        if (spec.choices.length || spec.numericErrors.length || spec.fractionErrors.length) errs.push("quotientReasoningLab: explore mode must not carry answer traps");
      }
      break;
    }
    case "graphStoryLab": {
      const segmentIds = spec.segments.map((segment) => segment.id);
      const segmentLabels = spec.segments.map((segment) => segment.label);
      const choiceIds = spec.choices.map((choice) => choice.id);
      const choiceLabels = spec.choices.map((choice) => choice.label);
      const choiceClaims = spec.choices.map((choice) => choice.claim);
      const bankIds = spec.bank.map((segment) => segment.id);
      const bankLabels = spec.bank.map((segment) => segment.label);
      const wrongLabels = spec.wrongSequences.map((wrong) => wrong.label);
      if (new Set(segmentIds).size !== segmentIds.length) errs.push("graphStoryLab: segment ids must be unique");
      if (new Set(segmentLabels).size !== segmentLabels.length) errs.push("graphStoryLab: segment labels must be unique");
      if (new Set(choiceIds).size !== choiceIds.length) errs.push("graphStoryLab: choice ids must be unique");
      if (new Set(choiceLabels).size !== choiceLabels.length) errs.push("graphStoryLab: choice labels must be unique");
      if (new Set(choiceClaims).size !== choiceClaims.length) errs.push("graphStoryLab: mathematical claims must be unique");
      if (new Set(bankIds).size !== bankIds.length) errs.push("graphStoryLab: bank ids must be unique");
      if (new Set(bankLabels).size !== bankLabels.length) errs.push("graphStoryLab: bank labels must be unique");
      if (new Set(wrongLabels).size !== wrongLabels.length) errs.push("graphStoryLab: wrong mathematical labels must be unique");
      if (spec.targetSegmentId && !segmentIds.includes(spec.targetSegmentId)) errs.push(`graphStoryLab: target segment ${spec.targetSegmentId} is missing`);
      const targetKinds = spec.segments.map((segment) => segment.kind);
      if (spec.axisContext === "distanceFromOrigin" && spec.distanceRule === "awayOnly" && targetKinds.some((kind) => kind.startsWith("fall")))
        errs.push("graphStoryLab: away-only distance graphs cannot fall");
      if (spec.mode === "read") {
        if (!spec.readTask) errs.push("graphStoryLab: read mode requires readTask");
        if (spec.choices.length < 1) errs.push("graphStoryLab: read mode requires at least one claim");
        const matches = spec.choices.filter((choice) => graphStoryChoiceCorrect(spec, choice));
        if (matches.length !== 1) errs.push("graphStoryLab: read mode requires exactly one derived correct claim");
      } else {
        if (!spec.answerLabel) errs.push("graphStoryLab: build mode requires the authored answer label");
        if (spec.bank.length < 2) errs.push("graphStoryLab: build mode requires a stage bank");
        const bankKinds = new Set(spec.bank.map((segment) => segment.kind));
        for (const kind of targetKinds) if (!bankKinds.has(kind)) errs.push(`graphStoryLab: bank is missing target kind ${kind}`);
        for (const wrong of spec.wrongSequences) for (const kind of wrong.kinds)
          if (!bankKinds.has(kind)) errs.push(`graphStoryLab: bank is missing wrong-path kind ${kind}`);
      }
      if (spec.mode === "build") {
        const targetKey = graphStorySequenceKey(spec.segments.map((segment) => segment.kind));
        const wrongKeys = spec.wrongSequences.map((wrong) => graphStorySequenceKey(wrong.kinds));
        if (new Set(wrongKeys).size !== wrongKeys.length) errs.push("graphStoryLab: duplicate wrong mathematical sequences");
        if (wrongKeys.includes(targetKey)) errs.push("graphStoryLab: wrong sequence duplicates the target truth");
        if (spec.axisContext === "distanceFromOrigin" && spec.distanceRule === "awayOnly") {
          for (const wrong of spec.wrongSequences) if (wrong.kinds.some((kind) => kind.startsWith("fall"))) {
            // A falling distractor is allowed and deliberately diagnosable; only the authored truth is constrained.
          }
        }
      }
      break;
    }
    case "conditionalTableLab": {
      const cells = spec.targetCondition === "row0" ? ["r0c0","r0c1"] : spec.targetCondition === "row1" ? ["r1c0","r1c1"] : spec.targetCondition === "col0" ? ["r0c0","r1c0"] : ["r0c1","r1c1"];
      if (!cells.includes(spec.targetCell)) errs.push(`conditionalTableLab: target cell ${spec.targetCell} is outside condition ${spec.targetCondition}`);
      if (spec.mode === "read") {
        if (!spec.readMetric) errs.push("conditionalTableLab: read mode requires readMetric");
        if (spec.answerChoices.length < 3) errs.push("conditionalTableLab: read mode requires at least three answer choices");
        const ids = spec.answerChoices.map((choice) => choice.id);
        const labels = spec.answerChoices.map((choice) => choice.label);
        const values = spec.answerChoices.map((choice) => choice.value);
        if (new Set(ids).size !== ids.length) errs.push("conditionalTableLab: answer-choice ids must be unique");
        if (new Set(labels).size !== labels.length) errs.push("conditionalTableLab: answer-choice labels must be unique");
        if (new Set(values).size !== values.length) errs.push("conditionalTableLab: answer-choice values must be unique");
        if (spec.readMetric) {
          const truth = conditionalTableReadTruth(spec.counts, spec.readMetric, spec.targetCell);
          const matches = spec.answerChoices.filter((choice) => Math.abs(choice.value - truth.value) < 1e-9);
          if (matches.length !== 1) errs.push("conditionalTableLab: read mode requires exactly one independently derived correct choice");
        }
      }
      break;
    }
    case "triangleConstraintLab": {
      if (spec.constraint && !spec.constraintFeedback)
        errs.push("triangleConstraintLab: `constraint` needs `constraintFeedback` — breaking the lock must be a diagnosable state, not silence");
      if (!spec.constraint && spec.constraintFeedback)
        errs.push("triangleConstraintLab: `constraintFeedback` without `constraint` — nothing can reach it");
      break;
    }
    case "rotationLab": {
      /* Reachability, the failure this repo has hit most often (traps 23, 27, 28): a target the
       * dial cannot land on exactly is unsolvable, and a target at the very edge leaves one
       * direction's feedback dead. Both are checked here rather than discovered by the solvability
       * gate nine minutes into gen:reports. */
      const steps = (spec.targetAngle - spec.angleStart) / spec.angleStep;
      if (Math.abs(steps - Math.round(steps)) > 1e-9)
        errs.push(`rotationLab: targetAngle ${spec.targetAngle} is not reachable from ${spec.angleStart} in steps of ${spec.angleStep}`);
      for (const t of spec.commonTurns) {
        const s2 = (t.angle - spec.angleStart) / spec.angleStep;
        if (Math.abs(s2 - Math.round(s2)) > 1e-9)
          errs.push(`rotationLab: commonTurn ${t.angle} is off the step lattice and can never be landed on`);
        if (t.angle === spec.targetAngle)
          errs.push(`rotationLab: commonTurn ${t.angle} collides with targetAngle — a wrong-path landing cannot also be the answer`);
      }
      if (spec.mode === "coordinateRule") {
        if (!spec.point) errs.push("rotationLab: coordinateRule needs a point to turn");
        if (spec.shape) errs.push("rotationLab: shape belongs to symmetryOrder, not coordinateRule");
        /* Only the quarter turns send integer coordinates to integer coordinates. Any other angle
         * produces irrational images, which the coordinate RULES this mode teaches do not cover —
         * allowing them would render a readout the lesson cannot honestly ask about. */
        if (spec.targetAngle % 90 !== 0)
          errs.push(`rotationLab: coordinateRule targetAngle ${spec.targetAngle} is not a quarter turn — only 90/180/270 have integer coordinate rules`);
        if (spec.point) {
          const img = rotationLabImage([spec.point[0], spec.point[1]], [spec.centre[0], spec.centre[1]], spec.targetAngle);
          if (Math.abs(img[0]) > spec.gridMax || Math.abs(img[1]) > spec.gridMax)
            errs.push(`rotationLab: the image (${img[0]}, ${img[1]}) falls outside gridMax ${spec.gridMax}`);
        }
      } else {
        if (!spec.shape) errs.push("rotationLab: symmetryOrder needs a shape to turn");
        if (spec.point) errs.push("rotationLab: point belongs to coordinateRule, not symmetryOrder");
        if (360 % spec.targetAngle !== 0)
          errs.push(`rotationLab: symmetryOrder targetAngle ${spec.targetAngle} does not divide 360, so it cannot be a symmetry angle`);
        if (spec.shape) {
          const shape = spec.shape.map((p) => [p[0], p[1]] as [number, number]);
          const centre: [number, number] = [spec.centre[0], spec.centre[1]];
          /* The target must genuinely be a self-mapping turn, AND the SMALLEST one — a shape whose
           * true order is higher would make the authored answer wrong even though it "works". */
          if (!rotationLabMapsOntoSelf(shape, centre, spec.targetAngle))
            errs.push(`rotationLab: turning this shape by ${spec.targetAngle}° does not land it on itself`);
          for (let a = spec.angleStep; a < spec.targetAngle; a += spec.angleStep) {
            if (360 % a === 0 && rotationLabMapsOntoSelf(shape, centre, a)) {
              errs.push(`rotationLab: ${a}° already maps this shape onto itself, so ${spec.targetAngle}° is not the SMALLEST such turn`);
              break;
            }
          }
        }
      }
      break;
    }
    case "dilationExplore": {
      if (spec.showRatios) {
        if (new Set(spec.showRatios).size !== spec.showRatios.length)
          errs.push("dilationExplore: duplicate entries in showRatios");
        const seg = spec.showRatios.includes("segments");
        const alt = spec.showRatios.includes("altitude");
        if (seg && alt)
          errs.push("dilationExplore: `segments` and `altitude` are two different figures — a parallel cut and a perpendicular one — and cannot share a stage");
        if (seg && spec.showRatios.length > 1)
          errs.push("dilationExplore: `segments` re-stages the widget as a cut triangle and cannot be combined with the scale readouts");
        if (alt && spec.showRatios.length > 1)
          errs.push("dilationExplore: `altitude` re-stages the widget as a right triangle and cannot be combined with the scale readouts");
        if (alt) {
          // The foot must land strictly inside the hypotenuse: at either end the altitude has
          // length zero and there are no two sub-triangles to be similar.
          if (spec.kMin <= 0 || spec.kMax >= 1)
            errs.push(`dilationExplore altitude: the foot's position must stay inside (0, 1) — got [${spec.kMin}, ${spec.kMax}]`);
          if (spec.targetK <= 0 || spec.targetK >= 1)
            errs.push(`dilationExplore altitude: targetK ${spec.targetK} does not put the foot inside the hypotenuse`);
          if (spec.shape.length !== 3)
            errs.push("dilationExplore altitude: the stage needs exactly 3 vertices — the hypotenuse's two ends and the right-angle apex");
          // Independent second method: the construction places the apex at height √(p·q), so
          // "h² = p·q" would be a tautology here. Check instead the two facts that construction
          // is SUPPOSED to deliver and does not state — that the apex angle is right, and that
          // each leg is the geometric mean of the hypotenuse and its own segment.
          const gm = altitudeMeans(spec.shape as Array<[number, number]>, spec.targetK);
          if (!Number.isFinite(gm.h) || gm.h <= 0)
            errs.push("dilationExplore altitude: the altitude has no positive length at targetK");
          else {
            const [A, B] = spec.shape as Array<[number, number]>;
            const dot =
              (A[0] - gm.apex[0]) * (B[0] - gm.apex[0]) + (A[1] - gm.apex[1]) * (B[1] - gm.apex[1]);
            if (Math.abs(dot) > 1e-9)
              errs.push(`dilationExplore altitude: the apex angle is not right (dot product ${dot})`);
            if (Math.abs(gm.legA * gm.legA - gm.c * gm.p) > 1e-9)
              errs.push("dilationExplore altitude: leg² ≠ hypotenuse × its own segment on the A side");
            if (Math.abs(gm.legB * gm.legB - gm.c * gm.q) > 1e-9)
              errs.push("dilationExplore altitude: leg² ≠ hypotenuse × its own segment on the B side");
          }
        }
        if (seg) {
          // The cutter runs on the same k dial, read as a fraction along the sides: it must stay
          // strictly inside the triangle or there is no pair of segments to compare.
          if (spec.kMin <= 0 || spec.kMax >= 1)
            errs.push(`dilationExplore segments: the cutter fraction must stay inside (0, 1) — got [${spec.kMin}, ${spec.kMax}]`);
          if (spec.targetK <= 0 || spec.targetK >= 1)
            errs.push(`dilationExplore segments: targetK ${spec.targetK} is not a position strictly inside the triangle`);
          if (spec.shape.length !== 3)
            errs.push("dilationExplore segments: the side-splitter stage needs exactly 3 vertices");
        }
      }
      break;
    }
    case "triangleSolve": {
      if (spec.mode === "ratios") {
        if (!spec.ratio) errs.push("triangleSolve ratios: `ratio` names which readout the hunt is about");
        if (typeof spec.requiredScaleMoves !== "number")
          errs.push("triangleSolve ratios: `requiredScaleMoves` is required — an untested invariant was never witnessed");
        if (!spec.scaleFeedback)
          errs.push("triangleSolve ratios: `scaleFeedback` is required — checking without moving the scale is the misconception this lab exists to catch");
        if (spec.target <= 0 || spec.target >= 90)
          errs.push(`triangleSolve ratios: target ${spec.target}° must be an acute angle strictly between 0 and 90`);
        if (spec.start <= 0 || spec.start >= 90)
          errs.push(`triangleSolve ratios: start ${spec.start}° must be an acute angle strictly between 0 and 90`);
        if (spec.start === spec.target)
          errs.push("triangleSolve ratios: start equals target — no drag is required");
        // Independent second method: the named ratio must actually separate the start from the
        // target, or the hunt has no observable signal.
        if (spec.ratio) {
          const gap = Math.abs(triangleRatio(spec.start, spec.ratio) - triangleRatio(spec.target, spec.ratio));
          if (gap < 1e-6)
            errs.push(`triangleSolve ratios: ${spec.ratio} reads the same at start and target — nothing to hunt`);
        }
      } else if (spec.ratio || spec.requiredScaleMoves || spec.scaleFeedback) {
        errs.push(`triangleSolve: ratios-only fields set on mode "${spec.mode}"`);
      }
      break;
    }
    case "quadDrag": {
      if (spec.showMidsegment) {
        // The midsegment readout is only meaningful when the finished shape actually has a pair
        // of parallel sides to average. Tested directly: the name proxy this used to run had no
        // trapezoid case and so refused the theorem's own family.
        const pts: Array<[number, number]> = [...spec.fixed, [spec.targetX, spec.targetY]];
        if (!hasParallelBasePair(pts))
          errs.push(`quadDrag: showMidsegment on ${quadName(pts)} — sides AB and CD are not a parallel pair, so the midsegment has nothing to average`);
      }
      break;
    }
    case "unitCircleExplore": {
      const hasWave = !!(spec.trace || spec.dials || spec.targetFeature);
      if ((spec.dials || spec.targetFeature) && !spec.trace)
        errs.push("unitCircleExplore: dials/targetFeature need `trace` — there is no wave to act on");
      if (hasWave && spec.ghost)
        errs.push("unitCircleExplore: wave and ghost are exclusive — one comparison per lab");
      if (spec.ghost === "sum" && typeof spec.ghostAngle !== "number")
        errs.push("unitCircleExplore: ghost \"sum\" needs ghostAngle — the fixed second angle is the identity's subject");
      if (spec.ghostChoices) {
        if (!spec.ghost) errs.push("unitCircleExplore: ghostChoices without ghost — nothing computes them");
        const kinds = new Set(spec.ghostChoices.map((c) => c.id));
        if (kinds.size !== spec.ghostChoices.length)
          errs.push("unitCircleExplore: duplicate ghostChoices ids");
        if (![...kinds].some((k) => UC_TRUE_FORMULAS.has(k)))
          errs.push("unitCircleExplore: ghostChoices contain no true identity — the coincidence must be reachable");
        for (const ch of spec.ghostChoices)
          if (!UC_TRUE_FORMULAS.has(ch.id) && !ch.feedback)
            errs.push(`unitCircleExplore: impostor ghost choice "${ch.id}" needs feedback naming why it detaches`);
        // Independent second method: every claimed-true formula must actually coincide with the
        // direct point across a sweep of angles, and every impostor must detach somewhere.
        if (spec.ghost)
          for (const ch of spec.ghostChoices) {
            let maxGap = 0;
            for (let a = 0; a <= 360; a += 15) {
              const { direct, ghost } = ucGhostPoint(a, spec.ghost, ch.id, spec.ghostAngle ?? 0);
              maxGap = Math.max(maxGap, Math.hypot(direct[0] - ghost[0], direct[1] - ghost[1]));
            }
            if (UC_TRUE_FORMULAS.has(ch.id) && maxGap > 1e-9)
              errs.push(`unitCircleExplore: formula "${ch.id}" claimed true but detaches (gap ${maxGap.toFixed(3)}) for ghost "${spec.ghost}"`);
            if (!UC_TRUE_FORMULAS.has(ch.id) && maxGap < 1e-6)
              errs.push(`unitCircleExplore: impostor "${ch.id}" never detaches for ghost "${spec.ghost}" — no contrast case`);
          }
      }
      if (spec.targetFeature && spec.trace) {
        const f = spec.targetFeature;
        const amp = spec.amplitude ?? 1, b = spec.angularScale ?? 1, ph = spec.phaseDeg ?? 0, mid = spec.midline ?? 0;
        const y = ucWaveY(f.x, spec.trace, amp, b, ph, mid);
        if (spec.trace === "tan" && f.kind === "peak")
          errs.push("unitCircleExplore: tangent has no peak — targetFeature.kind peak is undefined for trace tan");
        if (f.kind === "zero" && Math.abs(y) > 1e-6)
          errs.push(`unitCircleExplore: targetFeature zero at x = ${f.x} but y(x) = ${y.toFixed(4)}`);
        if (f.kind === "midlineCross" && Math.abs(y - mid) > 1e-6)
          errs.push(`unitCircleExplore: targetFeature midlineCross at x = ${f.x} but y(x) − midline = ${(y - mid).toFixed(4)}`);
        if (f.kind === "peak" && Math.abs(y - (mid + Math.abs(amp))) > 1e-6)
          errs.push(`unitCircleExplore: targetFeature peak at x = ${f.x} but y(x) = ${y.toFixed(4)} ≠ midline + |amplitude| = ${mid + Math.abs(amp)}`);
        if (f.kind === "period") {
          const base = spec.trace === "tan" ? 180 : 360;
          if (Math.abs(f.x - base / Math.abs(b || 1)) > 1e-6)
            errs.push(`unitCircleExplore: targetFeature period x = ${f.x} but ${base}/|angularScale| = ${base / Math.abs(b || 1)}`);
        }
      }
      if (spec.dials) {
        const seen = new Set<string>();
        for (const d of spec.dials) {
          if (seen.has(d.param)) errs.push(`unitCircleExplore: duplicate dial for ${d.param}`);
          seen.add(d.param);
          for (const [name, v] of [["start", d.start], ["target", d.target]] as const) {
            if (v < d.min || v > d.max) errs.push(`unitCircleExplore: dial ${d.param} ${name} ${v} outside [${d.min}, ${d.max}]`);
            if (Math.abs((v - d.min) / d.step - Math.round((v - d.min) / d.step)) > 1e-9)
              errs.push(`unitCircleExplore: dial ${d.param} ${name} ${v} is off the step lattice`);
          }
          if (d.start === d.target) errs.push(`unitCircleExplore: dial ${d.param} starts at its target — no move required`);
        }
      }
      if (spec.branch) {
        const [lo, hi] = spec.branch;
        if (lo >= hi) errs.push(`unitCircleExplore: branch [${lo}, ${hi}] is empty`);
        if (spec.targetAngle < lo || spec.targetAngle > hi)
          errs.push(`unitCircleExplore: targetAngle ${spec.targetAngle} outside branch [${lo}, ${hi}] — unreachable`);
        if (spec.angleStart < lo || spec.angleStart > hi)
          errs.push(`unitCircleExplore: angleStart ${spec.angleStart} outside branch [${lo}, ${hi}]`);
      }
      break;
    }
    case "solveBalance": {
      // The .refine that would live on the spec cannot (ZodEffects is barred from the discriminated
      // union), so the tile-model invariant is enforced here.
      const gap = spec.c - spec.b;
      // Stated as a ratio rather than a sign test so a negative coefficient passes on the same
      // rule: for every a > 0 this is exactly the old `gap > 0` check, unchanged.
      if (spec.a === 0) errs.push("solveBalance: a = 0 leaves no x on the pan");
      else if (gap % spec.a !== 0)
        errs.push(`solveBalance: (c − b) = ${gap} is not divisible by a = ${spec.a} — splitting the pans could never be exact`);
      else if (gap / spec.a <= 0)
        errs.push(`solveBalance: (c − b) / a = ${gap / spec.a} — x must come out positive so the pans can be drawn`);
      // A pan is a row of 44px tap targets. The largest pan the product has ever shipped is 28
      // tiles; beyond ~30 the model stops being readable on a 360px screen and the lesson is
      // better served by a different engine.
      if (Math.abs(spec.c) > 30 || Math.abs(spec.b) > 30)
        errs.push(`solveBalance: a pan of ${Math.max(Math.abs(spec.c), Math.abs(spec.b))} tiles cannot be read at 360px — keep |b| and |c| at 30 or under`);
      if (spec.a === 1 && spec.b === 0 && !spec.groups)
        errs.push("solveBalance: a = 1 and b = 0 starts with x already isolated — no interaction would be required");
      if (spec.groups) {
        const g = spec.groups;
        if (Math.abs(g.count) < 2)
          errs.push(`solveBalance: groups count ${g.count} is not a multiplier — use at least two copies`);
        if (g.count * g.x !== spec.a)
          errs.push(`solveBalance: groups give ${g.count}×${g.x} = ${g.count * g.x} x-tiles but a = ${spec.a}`);
        if (g.count * g.unit !== spec.b)
          errs.push(`solveBalance: groups give ${g.count}×${g.unit} = ${g.count * g.unit} units but b = ${spec.b}`);
        if (!spec.partialDistributeFeedback)
          errs.push("solveBalance: groups need partialDistributeFeedback — giving the multiplier to the x alone is a reachable state and must be named");
        if (!spec.unexpandedFeedback)
          errs.push("solveBalance: groups need unexpandedFeedback — brackets left standing is a reachable state and must be named");
      }
      if ((spec.relation ?? "eq") !== "eq" && !spec.notFlippedFeedback)
        errs.push("solveBalance: an inequality needs notFlippedFeedback — negating both pans without flipping the comparator is the lesson's misconception and must be named");
      break;
    }
    case "inversePipeline": {
      // Buildability: every answer id must be a tray card, the track length must match the chain,
      // and the answer must BE the flipped reverse of the forward chain — an authored answer that
      // is not actually f⁻¹ is a mathematical error, not a style choice.
      const FLIP = { add: "sub", sub: "add", mul: "div", div: "mul" } as const;
      if (spec.answer.length !== spec.forward.length)
        errs.push(`inversePipeline: answer has ${spec.answer.length} steps but f has ${spec.forward.length}`);
      const cards = spec.answer.map((id) => spec.tray.find((t) => t.id === id));
      if (cards.some((c) => !c)) errs.push("inversePipeline: answer references a card that is not in the tray");
      else {
        const rev = [...spec.forward].reverse();
        cards.forEach((c, i) => {
          const want = rev[i];
          if (c && want && (c.op !== FLIP[want.op] || c.n !== want.n))
            errs.push(`inversePipeline: answer slot ${i + 1} is ${c.op} ${c.n}, but undoing "${want.op} ${want.n}" needs ${FLIP[want.op]} ${want.n}`);
        });
      }
      if (spec.tray.length <= spec.answer.length)
        errs.push("inversePipeline: the tray needs at least one decoy, or the task is ordering, not choosing");
      if (spec.forward.some((f) => (f.op === "mul" || f.op === "div") && f.n === 0))
        errs.push("inversePipeline: multiply/divide by 0 is not invertible");
      if (new Set(spec.tray.map((t) => t.id)).size !== spec.tray.length)
        errs.push("inversePipeline: tray ids must be unique");
      break;
    }
    case "mixedRegroup": {
      const two = spec.mode === "add" || spec.mode === "subtract";
      if (two && (spec.bWhole === undefined || spec.bNum === undefined))
        errs.push(`mixedRegroup(${spec.mode}): needs bWhole and bNum \u2014 two operands are required`);
      if (!two && (spec.bWhole !== undefined || spec.bNum !== undefined))
        errs.push("mixedRegroup(convert): a second operand is meaningless \u2014 remove bWhole/bNum");
      if (!two && !spec.targetForm)
        errs.push("mixedRegroup(convert): needs targetForm (mixed or improper)");
      if (two && spec.targetForm)
        errs.push(`mixedRegroup(${spec.mode}): targetForm belongs to convert only \u2014 the result form is always a proper mixed number`);
      if (two && (spec.aNum >= spec.den || (spec.bNum ?? 0) >= spec.den))
        errs.push(
          `mixedRegroup(${spec.mode}): the operands must be proper mixed numbers \u2014 a numerator \u2265 ${spec.den} means the value was not written in mixed form`
        );
      if (
        spec.mode === "subtract" &&
        spec.aWhole * spec.den + spec.aNum < (spec.bWhole ?? 0) * spec.den + (spec.bNum ?? 0)
      )
        errs.push("mixedRegroup(subtract): the second value exceeds the first \u2014 negative results are not supported");
      if (errs.length === 0) {
        const truth = mixedRegroupTruth(spec);
        const reach = mixedRegroupReachable(spec);
        if (!reach.has(mixedKey(truth)))
          errs.push(
            `mixedRegroup: the true result ${truth.whole} ${truth.num}/${spec.den} is not reachable \u2014 enumeration bug, refuse to author`
          );
        if (reach.size < 2)
          errs.push(
            "mixedRegroup: no exchange decision \u2014 every move sequence lands on the same state. A step with no whole to break and no group to make does not need this engine"
          );
        for (const r of spec.commonResults) {
          if (r.whole === truth.whole && r.num === truth.num)
            errs.push("mixedRegroup: a commonResults entry equals the true result \u2014 the success slot owns that state");
          else if (!reach.has(mixedKey(r)))
            errs.push(
              `mixedRegroup: commonResults state ${r.whole} ${r.num}/${spec.den} is unreachable by any exchange sequence \u2014 dead feedback that looks like diagnosis`
            );
        }
      }
      break;
    }
    case "circleMeasureExplore": {
      if (spec.mode === "radiusScale") {
        if (spec.targetRadius === undefined) errs.push("circleMeasureExplore: radiusScale needs targetRadius");
        if (spec.askQuantity === undefined) errs.push("circleMeasureExplore: radiusScale needs askQuantity");
        const max = spec.radiusMax ?? 10;
        if (spec.targetRadius !== undefined && spec.targetRadius > max)
          errs.push(`circleMeasureExplore: targetRadius ${spec.targetRadius} is above radiusMax ${max}`);
        // The doubling-vs-squaring contrast is the lesson; at r = 1 and r = 2 the coefficients
        // coincide (2 and 1; 4 and 4), so the contrast is invisible exactly there.
        if (spec.targetRadius !== undefined && spec.targetRadius < 3)
          errs.push("circleMeasureExplore: radiusScale below r = 3 cannot show the doubling-vs-squaring contrast");
        if (spec.targetLength !== 0)
          errs.push("circleMeasureExplore: targetLength does not apply to radiusScale");
      } else if (spec.targetRadius !== undefined || spec.askQuantity !== undefined || spec.radiusMax !== undefined) {
        errs.push("circleMeasureExplore: radiusScale fields are unreachable outside radiusScale mode");
      }
      break;
    }
    case "ratioTable": {
      const [a0, b0] = spec.rows[0];
      if (a0 === 0) errs.push("ratioTable: the first row's A is 0 — it fixes no ratio");
      // Every shown row must sit on the SAME ratio as the asked row. A decorative row that breaks
      // it teaches a false pattern, and the learner has no way to know which row to trust.
      for (const [a, b] of spec.rows)
        if (b * a0 !== a * b0)
          errs.push(`ratioTable: shown row ${a}:${b} is off the ratio ${a0}:${b0}`);
      if (b0 * spec.askA !== a0 * spec.targetB)
        errs.push(`ratioTable: targetB ${spec.targetB} is off the ratio ${a0}:${b0} at askA ${spec.askA}`);
      if (spec.targetB > spec.bMax) errs.push("ratioTable: targetB is above bMax — unreachable");
      if (spec.bStep > 0 && Math.abs(spec.targetB / spec.bStep - Math.round(spec.targetB / spec.bStep)) > 1e-9)
        errs.push(`ratioTable: targetB ${spec.targetB} is off the bStep lattice`);
      if (spec.denom !== undefined) {
        const whole = (n: number) => Number.isInteger(n);
        if (!whole(spec.askA) || !whole(spec.targetB) || !spec.rows.every(([a, b]) => whole(a) && whole(b)))
          errs.push("ratioTable: in fraction mode every value is a COUNT of 1/denom units and must be a whole number");
      }
      break;
    }
    case "doubleNumberLine": {
      if (spec.denom !== undefined) {
        // The pairing only teaches a unit rate if the bottom line actually REACHES one whole unit
        // on a whole number of steps — otherwise the tick the question is about is never drawn.
        const perStep = spec.bottomPerStep;
        if (!Number.isInteger(perStep) || perStep <= 0)
          errs.push("doubleNumberLine: on a denom lattice bottomPerStep must be a whole count of 1/denom units");
        else if (spec.denom % perStep !== 0)
          errs.push(
            `doubleNumberLine: ${perStep}/${spec.denom} per step never lands on 1 whole unit — the unit-rate tick would not exist`
          );
        if (!Number.isInteger(spec.topPerStep))
          errs.push("doubleNumberLine: on a denom lattice topPerStep must be a whole count of 1/denom units");
        if (!Number.isInteger(spec.targetTop))
          errs.push("doubleNumberLine: on a denom lattice targetTop must be a whole count of 1/denom units");
      }
      break;
    }
    case "quadraticExplore": {
      if (spec.form === "roots") {
        if (spec.targetR1 === undefined || spec.targetR2 === undefined)
          errs.push("quadraticExplore: roots form needs targetR1 and targetR2");
        else {
          for (const r of [spec.targetR1, spec.targetR2])
            if (r < spec.rMin || r > spec.rMax)
              errs.push(`quadraticExplore: root ${r} is outside the draggable range [${spec.rMin}, ${spec.rMax}]`);
          const startSet = [spec.r1Start, spec.r2Start].sort((x, y) => x - y).join(",");
          const targetSet = [spec.targetR1, spec.targetR2].sort((x, y) => x - y).join(",");
          if (startSet === targetSet && spec.aStart === spec.targetA)
            errs.push("quadraticExplore: the start position IS the answer");
        }
        if (spec.targetA === 0) errs.push("quadraticExplore: a leading coefficient of 0 is not a parabola");
      } else if (spec.targetR1 !== undefined || spec.targetR2 !== undefined) {
        errs.push("quadraticExplore: roots-form fields are unreachable in vertex form");
      }
      break;
    }
    case "functionMachine": {
      if (spec.stage2 && !spec.join)
        errs.push("functionMachine: a second machine needs a `join` saying how the two are wired");
      if (spec.join && !spec.stage2)
        errs.push("functionMachine: `join` with no second machine to join to");
      let reachable = false;
      for (let x = spec.inputMin; x <= spec.inputMax && !reachable; x += spec.inputStep)
        if (fmOutput(x, spec.a, spec.b, spec.square, spec.stage2, spec.join) === spec.targetOutput) reachable = true;
      if (!reachable)
        errs.push(
          `functionMachine: no input in [${spec.inputMin}, ${spec.inputMax}] produces ${spec.targetOutput}`
        );
      break;
    }
    case "shapeParts": {
      const n = shapePartCount(spec.shape, spec.sides, spec.part);
      if (spec.shape === "polygon" && spec.sides === undefined)
        errs.push("shapeParts: a polygon needs a `sides` count to draw");
      if (spec.shape !== "polygon" && spec.sides !== undefined)
        errs.push("shapeParts: `sides` only applies to the polygon shape");
      if ((spec.part === "sides" || spec.part === "corners") && spec.shape !== "polygon")
        errs.push(`shapeParts: a ${spec.shape} has faces and vertices, not ${spec.part}`);
      if ((spec.part === "faces" || spec.part === "vertices") && spec.shape === "polygon")
        errs.push("shapeParts: a flat polygon has sides and corners, not faces or vertices");
      if (n < 2) errs.push(`shapeParts: ${spec.shape} has ${n} ${spec.part} — nothing to count`);
      break;
    }
    case "binomialAreaLab": {
      const { pX, qX, targetA, targetB } = spec;
      // A zero partition is legitimate (a monomial side, as in (3x)(x + 4)), but BOTH zero leaves
      // no strip and no corner — there is no product structure left to see.
      if (targetA === 0 && targetB === 0)
        errs.push("binomialAreaLab: both constants are 0 — the rectangle has no strips and no corner, so nothing about the product is visible");
      // The lab must be a hunt, not a starting position.
      if (spec.startA === targetA && spec.startB === targetB)
        errs.push("binomialAreaLab: the start position IS the target — the learner would have nothing to find");
      const truth = binomialExpand(pX, targetA, qX, targetB);
      // The step's own question must have a non-degenerate answer to read off the rectangle.
      if (spec.asks === "middle" && truth.middle === 0 && targetA + targetB !== 0)
        errs.push("binomialAreaLab: asks for the middle coefficient but it is 0 for a reason the rectangle cannot show");
      if (spec.asks === "constant" && truth.constant === 0)
        errs.push("binomialAreaLab: asks for the constant term but one partition is 0, so there is no corner region");
      // The multiply-instead-of-add misconception must be DISTINGUISHABLE from the right answer,
      // or productMiddleFeedback is dead copy the solvability gate would rightly flag.
      if (targetA * targetB === truth.middle)
        errs.push(
          `binomialAreaLab: the product of the constants (${targetA * targetB}) equals the middle coefficient (${truth.middle}), so the add-vs-multiply misconception has no distinguishable state`
        );
      break;
    }
    case "extraneousRootLab": {
      const der = extraneousCandidates(spec.radical, spec.line);
      // Every candidate must be an exact integer, or the lab would render a rounded root.
      for (const x of der.candidates)
        if (!Number.isInteger(x))
          errs.push(
            `extraneousRootLab: squaring gives a non-integer candidate ${x} — choose c, scale, m, b whose quadratic factors exactly`
          );
      if (der.trueRoots.length !== 1)
        errs.push(
          `extraneousRootLab: the equation has ${der.trueRoots.length} genuine solutions — the lab is posed on exactly one`
        );
      else if (der.trueRoots[0] !== spec.trueRoot)
        errs.push(
          `extraneousRootLab: authored trueRoot ${spec.trueRoot} but the equation actually solves at ${der.trueRoots[0]}`
        );
      // Independent second method: substitute back into the ORIGINAL equation.
      if (!extraneousHolds(spec.radical, spec.line, spec.trueRoot))
        errs.push(
          `extraneousRootLab: trueRoot ${spec.trueRoot} does not satisfy the original equation when substituted back`
        );
      const derPhantom = der.phantomRoots.length > 0 ? der.phantomRoots[0] : null;
      if (der.phantomRoots.length > 1)
        errs.push("extraneousRootLab: more than one phantom — the lab shows a single invented intersection");
      if (spec.phantomRoot !== derPhantom)
        errs.push(
          `extraneousRootLab: authored phantomRoot ${spec.phantomRoot} but squaring actually invents ${derPhantom}`
        );
      if (spec.phantomRoot !== null && extraneousHolds(spec.radical, spec.line, spec.phantomRoot))
        errs.push(
          `extraneousRootLab: phantomRoot ${spec.phantomRoot} DOES satisfy the original equation — it is a real solution, not a phantom`
        );
      if (spec.targetPhase === "identifyPhantom" && spec.phantomRoot === null)
        errs.push(
          "extraneousRootLab: targetPhase asks the learner to identify a phantom, but squaring invents none here"
        );
      if (spec.squared)
        errs.push(
          "extraneousRootLab: `squared` starts true — that hands over the transformation the lesson is about"
        );
      if (spec.trueRoot === spec.phantomRoot)
        errs.push("extraneousRootLab: trueRoot and phantomRoot are the same value");
      break;
    }
    case "signChart": {
      // S116 (k). A pole sharing an x with a root is not a hard case to render — it is a
      // contradiction: the same value cannot make the numerator zero and the denominator zero
      // without being a hole instead. Refuse rather than draw something that cannot exist.
      const rootXs = new Set(spec.roots.map((r) => r.x));
      for (const p of spec.poles ?? []) {
        if (rootXs.has(p.x))
          errs.push(
            `signChart: x = ${p.x} is authored as BOTH a root and a pole — a shared factor is a hole, not a pole; put it in \`holes\``
          );
      }
      const poleXs = new Set((spec.poles ?? []).map((p) => p.x));
      if (poleXs.size !== (spec.poles ?? []).length)
        errs.push("signChart: duplicate pole x — each excluded value cuts the line once");
      for (const h of spec.holes ?? []) {
        if (rootXs.has(h))
          errs.push(`signChart: x = ${h} is authored as both a root and a hole — a hole is not on the curve`);
        if (poleXs.has(h))
          errs.push(
            `signChart: x = ${h} is authored as both a pole and a hole — the factor either cancels (hole) or it does not (pole)`
          );
      }
      if (new Set(spec.holes ?? []).size !== (spec.holes ?? []).length)
        errs.push("signChart: duplicate hole x");
      if (spec.probeX && (spec.poles ?? []).length > 0)
        errs.push(
          "signChart: probeX is for POLYNOMIALS \u2014 a remainder is a polynomial-division idea, and a rational function has no remainder at a pole"
        );
      // The chart's whole claim is that the sign is decided by parity across the cuts. If every
      // cut is even there is no crossing anywhere and the exercise has no decision in it.
      const cuts = signChartCuts(spec.roots, spec.poles);
      if (cuts.length === 0)
        errs.push(
          "signChart: no roots and no poles — there is nothing to divide the line, so there is no chart to build"
        );
      if (cuts.length > 0 && cuts.every((c) => c.mult % 2 === 0))
        errs.push(
          "signChart: every cut has even multiplicity — the sign never changes, so there is no sign chart to build"
        );
      break;
    }
    case "columnCalc": {
      if (spec.op === "multiply" && (spec.b < 2 || spec.b > 9))
        errs.push("columnCalc(multiply): the multiplier must be a single digit 2\u20139 \u2014 two-row multiplication is not supported yet");
      if ((spec.decimals ?? 0) > 0 && spec.op === "multiply")
        errs.push(
          "columnCalc: decimals are add/subtract only \u2014 a product carries aDecimals + bDecimals places, so its point sits in a different column from the operands' and needs a separate per-row implementation"
        );
      if ((spec.decimals ?? 0) > 0 && spec.op === "subtract" && spec.b > spec.a)
        errs.push("columnCalc: decimals with subtract still requires a \u2265 b in the scaled integers");
      if (spec.op === "subtract" && spec.b > spec.a)
        errs.push("columnCalc(subtract): b exceeds a \u2014 negative results are not supported");
      const truth = columnCalcTruth(spec.op, spec.a, spec.b);
      const reach = columnCalcReachable(spec.op, spec.a, spec.b);
      if (!reach.has(truth))
        errs.push(`columnCalc: truth ${truth} is not reachable \u2014 enumeration bug, refuse to author`);
      if (reach.size < 2)
        errs.push(
          `columnCalc: no regrouping decision \u2014 every move sequence lands on ${truth}. A no-carry, no-borrow problem has no wrong path and does not need this engine`
        );
      for (const r of spec.commonResults) {
        if (r.value === truth)
          errs.push("columnCalc: a commonResults entry equals the truth \u2014 the success slot owns that state");
        else if (!reach.has(r.value))
          errs.push(
            `columnCalc: commonResults value ${r.value} is unreachable by any move sequence \u2014 dead feedback that looks like diagnosis`
          );
      }
      break;
    }
    case "sequenceBuild": {
      if(spec.task==="dial"){
        if(spec.answerMode!=="dial")errs.push("sequenceBuild: dial task requires dial answerMode");
        if (spec.mode === "geometricTerm") {
          if (spec.first === 0) errs.push("sequenceBuild: geometricTerm needs a nonzero first term");
          const hits: number[] = [];
          for (let r = 2; r <= spec.rMax; r++) if (geometricTerm(spec.first, r, spec.atPosition) === spec.targetTerm) hits.push(r);
          if (hits.length === 0) errs.push(`sequenceBuild: no whole ratio in [2, ${spec.rMax}] gives term ${spec.atPosition} = ${spec.targetTerm}`);
          else if (hits.length > 1) errs.push(`sequenceBuild: term ${spec.atPosition} = ${spec.targetTerm} is reachable at ${hits.length} ratios (${hits.join(", ")}) — narrow rMax so the step demands one answer`);
        }
        break;
      }
      if(spec.answerMode==="dial")errs.push("sequenceBuild: reasoning tasks require numeric or choice answerMode");
      let truth:ReturnType<typeof sequenceReasoningTruth>|undefined;try{truth=sequenceReasoningTruth(spec)}catch(error){errs.push(error instanceof Error?error.message:"sequenceBuild: truth derivation failed")}
      if(truth){const valid=new Set(truth.stages.map(stage=>stage.key));if(new Set(spec.requiredStageKeys).size!==spec.requiredStageKeys.length)errs.push("sequenceBuild: requiredStageKeys must be unique");for(const key of spec.requiredStageKeys)if(!valid.has(key))errs.push(`sequenceBuild: required stage ${key} is not derived`);if(spec.requiredExplorations>valid.size)errs.push("sequenceBuild: requiredExplorations exceeds the truthful stages");if(spec.answerMode==="numeric"&&truth.answerNumber===undefined)errs.push("sequenceBuild: numeric mode lacks numeric truth");if(spec.answerMode==="choice"&&truth.answerClaim===undefined)errs.push("sequenceBuild: choice mode lacks claim truth");if(spec.answerMode==="choice"){const ids=spec.choices.map(choice=>choice.id),labels=spec.choices.map(choice=>choice.label);if(new Set(ids).size!==ids.length)errs.push("sequenceBuild: choice ids must be unique");if(new Set(labels).size!==labels.length)errs.push("sequenceBuild: choice labels must be unique");const claims=spec.choices.map(choice=>choice.claim);if(new Set(claims).size!==claims.length)errs.push("sequenceBuild: mathematical choice claims must be unique");if(spec.choices.filter(choice=>choice.claim===truth.answerClaim).length!==1)errs.push("sequenceBuild: expected exactly one truthful choice");}if(spec.answerMode==="numeric"){const values=spec.numericErrors.map(error=>error.value);if(new Set(values).size!==values.length)errs.push("sequenceBuild: numeric error values must be unique");if(values.some(value=>truth!.answerNumber!==undefined&&Math.abs(value-truth!.answerNumber)<=spec.tolerance))errs.push("sequenceBuild: numeric error collides with truth");}}
      break;
    }
    case "volumeBuilder": {
      // S119 — the round solids come first and RETURN, because every check below is about the
      // l/w/h lattice a prism has and a cylinder does not. (This was originally written as a
      // second `case "volumeBuilder"`, which the compiler accepts and which silently dead-ended
      // the prism checks — caught by constrainedBuilders.s51.)
      if (spec.solid !== "prism") {
        if (spec.lockL || spec.lockW)
          errs.push("volumeBuilder: lockL/lockW have no meaning on a round solid \u2014 it has a radius, not a length and width");
        if (spec.solid === "sphere" && spec.lockH)
          errs.push("volumeBuilder: a sphere has no height to lock");
        let reachable = false;
        for (let r = 1; r <= spec.rMax && !reachable; r++)
          for (let h = 1; h <= (spec.solid === "sphere" ? 1 : spec.hMax); h++) {
            const c = roundSolidCoef(spec.solid, r, spec.solid === "sphere" ? 1 : h);
            if (c.den === 1 && c.num === spec.targetVolume) { reachable = true; break; }
          }
        if (!reachable)
          errs.push(
            `volumeBuilder: no whole radius/height on the ${spec.solid} lattice gives a volume of ${spec.targetVolume}\u03c0`
          );
        for (const c of spec.commonBuilds)
          if (c.volume === spec.targetVolume)
            errs.push("volumeBuilder: a commonBuilds entry equals the target — the success slot owns that state");
        break;
      }
      const locks = [spec.lockL, spec.lockW, spec.lockH];
      if (spec.denomL !== undefined) {
        // A fractional edge and the missing-dimension lock mode both change what "reachable"
        // means for l; combining them was never authored and is not verified here, so refuse
        // rather than silently miscompute.
        if (spec.lockL) errs.push("volumeBuilder: denomL and lockL together are unverified — do not combine them");
        let reachable = false;
        for (let l = 1; l <= spec.lMax && !reachable; l++)
          for (let w = 1; w <= spec.wMax; w++)
            for (let h = 1; h <= spec.hMax; h++)
              if (prismVolume(l, w, h, spec.denomL) === spec.targetVolume) { reachable = true; break; }
        if (!reachable)
          errs.push(`volumeBuilder: no l/w/h on the denomL=${spec.denomL} lattice gives a volume of ${spec.targetVolume}`);
        // wholeUnitFeedback is required UNCONDITIONALLY here, not only when a specific target is
        // shown to be reachable via the misreading. Checked exhaustively (denominators 2–7,
        // dimension caps up to 10, including asymmetric and prime-flavoured bounds): whenever the
        // fractional formula (l/denom)·w·h lands on an integer at all, that same integer is ALSO
        // reachable as a plain integer product l′·w′·h′ within the same lattice — any integer the
        // fractional path can reach can be repackaged as pure integers, because the raw achievable
        // set (every product of three bounded integers) is intrinsically the larger set. So the
        // misconception is reachable whenever the lesson is solvable at all, and the copy is
        // required whenever denomL is used, full stop — see
        // `volumeFractionalEdge.s119.test.tsx` for the search that established this.
        if (!spec.wholeUnitFeedback)
          errs.push("volumeBuilder: denomL needs wholeUnitFeedback — the whole-unit misreading is reachable whenever the target is");
        break;
      }
      if (locks.every(Boolean))
        errs.push("volumeBuilder: every dimension is locked — there is nothing for the learner to solve");
      if (locks.some(Boolean)) {
        // Missing-dimension mode: the target must be reachable at EXACTLY one free-dimension
        // setting, otherwise the step can be satisfied without finding the authored answer.
        const range = (max: number, lock: boolean, start: number) =>
          lock ? [start] : Array.from({ length: max }, (_, i) => i + 1);
        const hits: string[] = [];
        for (const L of range(spec.lMax, spec.lockL, spec.lStart))
          for (const W of range(spec.wMax, spec.lockW, spec.wStart))
            for (const H of range(spec.hMax, spec.lockH, spec.hStart))
              if (L * W * H === spec.targetVolume) hits.push(`${L}x${W}x${H}`);
        if (hits.length === 0)
          errs.push(`volumeBuilder: target ${spec.targetVolume} is unreachable with the locked dimensions`);
        else if (hits.length > 1)
          errs.push(
            `volumeBuilder: target ${spec.targetVolume} is reachable ${hits.length} ways (${hits.slice(0, 3).join(", ")}) — lock more dimensions so the step demands the authored answer`
          );
      }
      for (const c of spec.commonBuilds)
        if (c.volume === spec.targetVolume)
          errs.push("volumeBuilder: a commonBuilds entry equals the target — the success slot owns that state");
      break;
    }
    case "distributionCompareLab": {
      const gap = distributionGapUnits(spec);
      if (!Number.isFinite(gap)) errs.push("distributionCompareLab: the standardized gap is not derivable");
      if (spec.mode === "measure") {
        if (spec.meanA === undefined || spec.meanB === undefined || spec.variability === undefined || spec.answer === undefined)
          errs.push("distributionCompareLab(measure): meanA, meanB, variability and answer are required");
        if (spec.gapUnits !== undefined || spec.judgeOptions.length)
          errs.push("distributionCompareLab(measure): judge-only fields are present");
        if (!spec.fallbackFeedback) errs.push("distributionCompareLab(measure): fallbackFeedback is required");
        if (spec.measureChoices.length < 3) errs.push("distributionCompareLab(measure): at least three exact choices are required");
        const values = spec.measureChoices.map((c) => c.value);
        if (new Set(values).size !== values.length) errs.push("distributionCompareLab(measure): duplicate choice values");
        if (spec.answer !== undefined && Number.isFinite(gap) && Math.abs(spec.answer - gap) > spec.tolerance)
          errs.push(`distributionCompareLab(measure): answer ${spec.answer} contradicts derived gap ${gap} beyond tolerance ${spec.tolerance}`);
        const correct = spec.answer === undefined ? [] : spec.measureChoices.filter((c) => Math.abs(c.value - spec.answer!) <= spec.tolerance);
        if (correct.length !== 1) errs.push(`distributionCompareLab(measure): expected exactly one accepted choice, found ${correct.length}`);
      } else {
        if (spec.gapUnits === undefined) errs.push("distributionCompareLab(judge): gapUnits is required");
        if (spec.meanA !== undefined || spec.meanB !== undefined || spec.variability !== undefined || spec.answer !== undefined || spec.measureChoices.length)
          errs.push("distributionCompareLab(judge): measure-only fields are present");
        if (spec.judgeOptions.length < 3) errs.push("distributionCompareLab(judge): at least three conclusion options are required");
        if (new Set(spec.judgeOptions.map((o) => o.id)).size !== spec.judgeOptions.length)
          errs.push("distributionCompareLab(judge): option IDs must be unique");
        const correct = spec.judgeOptions.filter((o) => o.correct);
        if (correct.length !== 1) errs.push(`distributionCompareLab(judge): expected exactly one correct option, found ${correct.length}`);
      }
      break;
    }
    case "compoundEventLab": {
      const total = compoundEventTotal(spec);
      if (total > 120) errs.push(`compoundEventLab: outcome space ${total} exceeds the 120-cell visual ceiling`);
      const ids = spec.choices.map((choice) => choice.id);
      if (new Set(ids).size !== ids.length) errs.push("compoundEventLab: choice IDs must be unique");
      for (const stage of spec.stages) {
        if (new Set(stage.outcomes).size !== stage.outcomes.length) errs.push(`compoundEventLab: duplicate outcomes in ${stage.label}`);
        if (new Set(stage.favourable).size !== stage.favourable.length) errs.push(`compoundEventLab: duplicate favourable indices in ${stage.label}`);
        if (stage.favourable.some((i) => i < 0 || i >= stage.outcomes.length)) errs.push(`compoundEventLab: favourable index outside ${stage.label}`);
      }
      if (spec.mode === "count") {
        if (spec.stages.some((stage) => stage.favourable.length)) errs.push("compoundEventLab(count): favourable outcomes must stay empty");
        if (spec.choices.some((choice) => choice.count === undefined || choice.num !== undefined || choice.den !== undefined))
          errs.push("compoundEventLab(count): each choice needs count only");
        const values = spec.choices.map((choice) => choice.count);
        if (new Set(values).size !== values.length) errs.push("compoundEventLab(count): duplicate count choices");
      } else {
        if (spec.stages.some((stage) => stage.favourable.length === 0)) errs.push("compoundEventLab(probability): every stage needs at least one favourable outcome");
        if (spec.choices.some((choice) => choice.count !== undefined || choice.num === undefined || choice.den === undefined))
          errs.push("compoundEventLab(probability): each choice needs num/den only");
      }
      const correct = spec.choices.filter((choice) => compoundEventChoiceCorrect(spec, choice));
      if (correct.length !== 1) errs.push(`compoundEventLab: expected exactly one correct choice, found ${correct.length}`);
      break;
    }
    case "compositeAreaLab": {
      const pieceIds = spec.pieces.map((piece) => piece.id);
      const choiceIds = spec.choices.map((choice) => choice.id);
      const choiceValues = spec.choices.map((choice) => choice.value);
      if (new Set(pieceIds).size !== pieceIds.length) errs.push("compositeAreaLab: piece IDs must be unique");
      if (new Set(choiceIds).size !== choiceIds.length) errs.push("compositeAreaLab: choice IDs must be unique");
      if (new Set(choiceValues).size !== choiceValues.length) errs.push("compositeAreaLab: choice values must be unique");
      for (const piece of spec.pieces) {
        const area = compositeAreaPieceArea(piece);
        if (!Number.isFinite(area) || area <= 0) errs.push(`compositeAreaLab: ${piece.id} has no positive derivable area`);
        if (piece.shape === "rectangle" && (piece.width === undefined || piece.height === undefined))
          errs.push(`compositeAreaLab: rectangle ${piece.id} needs width and height`);
        if ((piece.shape === "triangle" || piece.shape === "parallelogram") && (piece.base === undefined || piece.height === undefined))
          errs.push(`compositeAreaLab: ${piece.shape} ${piece.id} needs base and height`);
        if (piece.shape === "given" && piece.area === undefined) errs.push(`compositeAreaLab: given piece ${piece.id} needs area`);
      }
      if (spec.target.kind === "piece" && !spec.pieces.some((piece) => piece.id === spec.target.pieceId))
        errs.push("compositeAreaLab(piece): target piece does not exist");
      if (spec.target.kind === "total" && spec.target.pieceId !== undefined)
        errs.push("compositeAreaLab(total): pieceId must be absent");
      if (spec.scene === "parallelogram-rearrange" &&
          (spec.pieces.length !== 1 || spec.pieces[0].shape !== "parallelogram" || spec.pieces[0].operation !== "add"))
        errs.push("compositeAreaLab(parallelogram): requires one added parallelogram piece");
      if (spec.scene === "trapezoid-diagonal") {
        if (spec.pieces.length !== 2 || spec.pieces.some((piece) => piece.shape !== "triangle" || piece.operation !== "add"))
          errs.push("compositeAreaLab(trapezoid): requires two added triangle pieces");
        const heights = spec.pieces.map((piece) => piece.height);
        if (new Set(heights).size !== 1) errs.push("compositeAreaLab(trapezoid): triangles must share one height");
      }
      const target = compositeAreaTarget(spec);
      if (!Number.isFinite(target) || target <= 0) errs.push("compositeAreaLab: target area must be positive and derivable");
      const correct = spec.choices.filter((choice) => compositeAreaChoiceCorrect(spec, choice));
      if (correct.length !== 1) errs.push(`compositeAreaLab: expected exactly one correct choice, found ${correct.length}`);
      break;
    }
    case "trialProbabilityLab": {
      if (spec.favourable > spec.total)
        errs.push(`trialProbabilityLab: favourable ${spec.favourable} exceeds total ${spec.total}`);
      const ids = spec.choices.map((choice) => choice.id);
      if (new Set(ids).size !== ids.length) errs.push("trialProbabilityLab: choice IDs must be unique");
      const rationalKeys = spec.choices.map((choice) => {
        const g = gcd(choice.num, choice.den) || 1;
        return `${choice.num / g}/${choice.den / g}`;
      });
      if (new Set(rationalKeys).size !== rationalKeys.length)
        errs.push("trialProbabilityLab: equivalent duplicate fraction choices are not allowed");
      const accepted = spec.choices.filter((choice) => trialProbabilityEquivalent(spec, choice));
      if (accepted.length !== 1)
        errs.push(`trialProbabilityLab: expected exactly one accepted fraction, found ${accepted.length}`);
      if ((spec.referenceNum === undefined) !== (spec.referenceDen === undefined))
        errs.push("trialProbabilityLab: referenceNum and referenceDen must appear together");
      if (spec.referenceNum !== undefined && spec.referenceDen !== undefined && spec.referenceNum > spec.referenceDen)
        errs.push("trialProbabilityLab: the reference probability cannot exceed 1");
      if (spec.mode === "theoretical") {
        if (spec.outcomes.length !== spec.total)
          errs.push(`trialProbabilityLab(theoretical): expected ${spec.total} listed outcomes, found ${spec.outcomes.length}`);
        const fav = spec.outcomes.filter((outcome) => outcome.favourable).length;
        if (fav !== spec.favourable)
          errs.push(`trialProbabilityLab(theoretical): ${fav} outcomes are marked favourable, expected ${spec.favourable}`);
      } else if (spec.outcomes.length) {
        errs.push("trialProbabilityLab(experimental): outcomes must stay empty; the trial strip is derived from favourable and total");
      }
      break;
    }
    case "areaModel": {
      if (spec.countGrid) {
        if (spec.square) errs.push("areaModel(countGrid): square mode is a build control and cannot be combined with fixed-grid counting");
        if (spec.requireFactors) errs.push("areaModel(countGrid): requireFactors is a build constraint and cannot be combined with fixed-grid counting");
        if (spec.wStart !== spec.wMax || spec.hStart !== spec.hMax)
          errs.push("areaModel(countGrid): wStart/wMax and hStart/hMax must match so the given grid cannot resize");
        if (spec.wStart * spec.hStart !== spec.targetArea)
          errs.push(`areaModel(countGrid): ${spec.hStart} rows × ${spec.wStart} columns = ${spec.wStart * spec.hStart}, not target ${spec.targetArea}`);
        const seen = new Set<number>();
        for (const c of spec.commonCounts) {
          if (seen.has(c.count)) errs.push(`areaModel(countGrid): duplicate common count ${c.count}`);
          seen.add(c.count);
          if (c.count === spec.targetArea) errs.push("areaModel(countGrid): a common count equals the correct total");
          if (c.count > spec.targetArea) errs.push(`areaModel(countGrid): common count ${c.count} exceeds the visible ${spec.targetArea}-cell grid`);
        }
      }
      if (spec.requireFactors) {
        const { w, h } = spec.requireFactors;
        if (spec.square)
          errs.push("areaModel: requireFactors and square are mutually exclusive — square already pins both sides");
        if (w * h !== spec.targetArea)
          errs.push(`areaModel: requireFactors ${w}×${h} = ${w * h}, which is not the target area ${spec.targetArea}`);
        // Either orientation is accepted at grade time, so BOTH must be reachable on the sliders —
        // otherwise the learner can be told "right area, wrong arrangement" about an arrangement
        // they cannot physically build.
        if (w > spec.wMax || h > spec.hMax)
          errs.push(`areaModel: requireFactors ${w}×${h} exceeds the slider range (wMax ${spec.wMax}, hMax ${spec.hMax})`);
        if (h > spec.wMax || w > spec.hMax)
          errs.push(`areaModel: the transpose ${h}×${w} exceeds the slider range, but grading accepts it`);
        if (!spec.factorFeedback)
          errs.push("areaModel: requireFactors needs factorFeedback — otherwise a right-area/wrong-factors build falls through to the area-direction feedback, which would be untrue");
        if (spec.wStart * spec.hStart === spec.targetArea)
          errs.push("areaModel: the start build already has the target area — the lesson opens pre-solved on area");
      }
      if (spec.square) {
        const side = Math.sqrt(spec.targetArea);
        if (!Number.isInteger(side))
          errs.push(`areaModel(square): target ${spec.targetArea} has no whole-number side — the square can never reach it`);
        else if (side > Math.min(spec.wMax, spec.hMax))
          errs.push(`areaModel(square): side ${side} exceeds the slider range`);
        if (spec.wStart !== spec.hStart)
          errs.push("areaModel(square): wStart and hStart must match — square mode drives both sides together");
      }
      break;
    }
    case "moneyBoard": {
      if (spec.mode === "count") {
        if (spec.tray || spec.targetCents !== undefined)
          errs.push("moneyBoard(count): count mode shows a fixed collection — use show, not tray/targetCents");
        if (!spec.show) errs.push("moneyBoard(count): show is required");
        if (spec.answerCents === undefined) errs.push("moneyBoard(count): answerCents is required");
        if (!spec.fallbackFeedback) errs.push("moneyBoard(count): fallbackFeedback is required");
        if (spec.show && spec.answerCents !== undefined) {
          const truth = spec.show.reduce((t, c) => t + c.cents * c.count, 0);
          if (truth !== spec.answerCents)
            errs.push(`moneyBoard(count): answerCents ${spec.answerCents} contradicts the shown coins (truth: ${truth})`);
          const pieces = spec.show.reduce((t, c) => t + c.count, 0);
          if (pieces > 24) errs.push("moneyBoard(count): more than 24 coins won't render legibly");
        }
        for (const e of spec.commonEntries)
          if (e.cents === spec.answerCents)
            errs.push("moneyBoard(count): a commonEntries entry equals the answer — the success slot owns that state");
        break;
      }
      // compose / change share the tray machinery
      const target =
        spec.mode === "change"
          ? (spec.paidCents ?? 0) - (spec.priceCents ?? 0)
          : spec.targetCents ?? 0;
      if (spec.mode === "change") {
        if (spec.priceCents === undefined || spec.paidCents === undefined)
          errs.push("moneyBoard(change): priceCents and paidCents are required");
        else if (spec.paidCents <= spec.priceCents)
          errs.push("moneyBoard(change): paidCents must exceed priceCents — otherwise there is no change to build");
        if (spec.targetCents !== undefined && spec.targetCents !== target)
          errs.push(`moneyBoard(change): authored targetCents ${spec.targetCents} contradicts paid − price = ${target}`);
      } else if (spec.targetCents === undefined) {
        errs.push("moneyBoard(compose): targetCents is required");
      }
      if (!spec.tray) {
        errs.push(`moneyBoard(${spec.mode}): tray is required`);
        break;
      }
      if (!spec.lowFeedback || !spec.highFeedback)
        errs.push(`moneyBoard(${spec.mode}): lowFeedback and highFeedback are required`);
      if (target <= 0) break;
      const cap = spec.tray.reduce((t, d) => t + d.cents * d.max, 0);
      if (target > cap) errs.push("moneyBoard: targetCents is unreachable within the tray caps");
      // exact reachability: bounded coin-change over the tray
      const reach = new Set<number>([0]);
      for (const d of spec.tray) {
        const next = new Set(reach);
        for (const r of reach)
          for (let k = 1; k <= d.max; k++) {
            const v = r + d.cents * k;
            if (v <= target) next.add(v);
          }
        for (const v of next) reach.add(v);
      }
      if (!reach.has(target))
        errs.push("moneyBoard: no combination in the tray makes targetCents exactly");
      for (const c of spec.commonTotals) {
        if (c.cents === target)
          errs.push("moneyBoard: a commonTotals entry equals the target — the success slot owns that state");
      }
      break;
    }
    case "dotPlot": {
      if (spec.given) {
        if (spec.given.length !== spec.values.length)
          errs.push("dotPlot(read): `given` must have one count per value");
        if (spec.askIndex === undefined) errs.push("dotPlot(read): `askIndex` is required with `given`");
        else if (spec.askIndex >= spec.values.length) errs.push("dotPlot(read): askIndex out of range");
        else if ((spec.given[spec.askIndex] ?? 0) < 1)
          errs.push("dotPlot(read): the asked stack is empty — nothing to count");
        const others = spec.given.filter((g, i) => i !== spec.askIndex && g > 0).length;
        if (others < 1)
          errs.push("dotPlot(read): no other non-empty stack — the wrong-stack diagnosis has no reachable state");
        if (spec.given.some((g) => g > spec.maxPerValue))
          errs.push("dotPlot(read): a given stack exceeds maxPerValue and cannot render");
        if (JSON.stringify(spec.target) !== JSON.stringify(spec.given))
          errs.push("dotPlot(read): `target` must equal `given` — two truth arrays would let them contradict");
      } else if (spec.askIndex !== undefined) {
        errs.push("dotPlot: askIndex without `given` — read mode requires the authored dataset");
      }
      break;
    }
    case "slopeTriangle": {
      if (spec.ax === spec.bx && spec.ay === spec.by)
        errs.push("slopeTriangle: A and B are the same point — no line is determined");
      for (const [n, v] of [["ax", spec.ax], ["ay", spec.ay], ["bx", spec.bx], ["by", spec.by]] as const)
        if (Math.abs(v) > spec.gridMax) errs.push(`slopeTriangle: ${n}=${v} is outside the grid (${spec.gridMax})`);
      // A correct build must be REACHABLE inside the learner's stepper range, or the task is
      // unsolvable however well the learner reasons.
      let reachable = false;
      for (let r = -spec.legMax; r <= spec.legMax && !reachable; r++)
        for (let ri = -spec.legMax; ri <= spec.legMax && !reachable; ri++)
          if (slopeTriangleMatches(spec, r, ri)) reachable = true;
      if (!reachable) errs.push("slopeTriangle: no (run, rise) inside legMax reproduces the line's slope");
      for (const c of spec.commonPairs) {
        if (slopeTriangleMatches(spec, c.run, c.rise))
          errs.push(`slopeTriangle: commonPairs (${c.run}, ${c.rise}) is a CORRECT build — the success slot owns that state`);
        if (Math.abs(c.run) > spec.legMax || Math.abs(c.rise) > spec.legMax)
          errs.push(`slopeTriangle: commonPairs (${c.run}, ${c.rise}) is outside legMax — unreachable, so its feedback is dead`);
      }
      break;
    }
    case "graphRead": {
      const truthGR = graphReadAnswer(spec);
      if (truthGR > spec.scaleMax)
        errs.push(`graphRead: the correct value ${truthGR} is above scaleMax ${spec.scaleMax} — unreadable`);
      if (spec.mode === "bar" && spec.drawn > spec.scaleMax)
        errs.push(`graphRead: a bar of ${spec.drawn} gridlines cannot be drawn on a scale of ${spec.scaleMax}`);
      // A picture graph of 40 apples is a counting endurance test, not a reading task.
      if (spec.mode === "picture" && spec.drawn > 20)
        errs.push(`graphRead: ${spec.drawn} icons is past the point where reading becomes tallying`);
      // Tally exists exactly to organize bigger counts — but past five five-groups the reading
      // becomes an endurance test again.
      if (spec.mode === "tally" && spec.drawn > 25)
        errs.push(`graphRead: ${spec.drawn} tally marks is past the five-group range this reader teaches`);
      if (spec.mode === "tally" && spec.unitValue !== 1)
        errs.push("graphRead: tally marks are unit marks by definition — unitValue must be 1");
      for (const r of spec.commonResults) {
        if (r.value === truthGR)
          errs.push("graphRead: a commonResults entry equals the correct value — the success slot owns that state");
        if (r.value < 0 || r.value > spec.scaleMax)
          errs.push(`graphRead: commonResults ${r.value} is off the scale — unreachable, so its feedback is dead`);
      }
      break;
    }
    case "unitChain": {
      // Chain continuity: hops must walk startUnit → targetUnit without gaps.
      if (spec.hops[0].from !== spec.startUnit)
        errs.push(`unitChain: first hop starts at ${spec.hops[0].from}, not startUnit ${spec.startUnit}`);
      if (spec.hops[spec.hops.length - 1].to !== spec.targetUnit)
        errs.push(`unitChain: last hop ends at ${spec.hops[spec.hops.length - 1].to}, not targetUnit ${spec.targetUnit}`);
      for (let i = 1; i < spec.hops.length; i++)
        if (spec.hops[i].from !== spec.hops[i - 1].to)
          errs.push(`unitChain: hop ${i + 1} starts at ${spec.hops[i].from} but hop ${i} ended at ${spec.hops[i - 1].to}`);
      if (spec.startValue <= 0) errs.push("unitChain: startValue must be positive — the bar has a length");
      const truthUC = unitChainAnswer(spec);
      const worlds = unitChainWorlds(spec);
      // Every wrong direction sequence must land somewhere DISTINGUISHABLE from the answer,
      // or the direction misconception has no observable state and its feedback is dead copy
      // (the ×2 then ÷2 trap: crossing both hops the wrong way reproduces the right value).
      const rightDirs = spec.hops.map((h) => (h.bigger === "from" ? "mul" : "div")).join(",");
      for (const w of worlds) {
        if (w.dirs.join(",") !== rightDirs && Math.abs(w.value - truthUC) < 1e-9)
          errs.push(
            `unitChain: the wrong-direction sequence [${w.dirs.join(", ")}] reproduces the correct value ${truthUC} — direction is not observable with these factors`
          );
      }
      for (const r of spec.commonResults) {
        if (Math.abs(r.value - truthUC) < 1e-9)
          errs.push("unitChain: a commonResults entry equals the correct value — the success slot owns that state");
      }
      break;
    }
    case "evalOrder": {
      const truth = evalTokens(spec.tokens);
      if (truth === null) errs.push("evalOrder: the token stream does not parse — no defined answer");
      else if (Math.abs(truth - spec.target) > 1e-9)
        errs.push(`evalOrder: authored target ${spec.target} contradicts the expression (truth: ${truth})`);
      if (!spec.tokens.some((t) => isEvalOp(t))) errs.push("evalOrder: needs at least one operator to collapse");
      const reachable = evalOrderReachable(spec.tokens);
      if (reachable.size < 2)
        errs.push(
          "evalOrder: every collapse order gives the same value — there is no precedence decision to make, so the puzzle has no wrong path"
        );
      for (const r of spec.commonResults) {
        if (Math.abs(r.value - spec.target) < 1e-9) errs.push("evalOrder: a commonResults entry equals the correct value");
        else if (!reachable.has(Math.round(r.value * 1e6) / 1e6))
          errs.push(`evalOrder: commonResults ${r.value} is not reachable by any collapse order — dead feedback`);
      }
      break;
    }
    case "fractionGrid": {
      if (spec.num1 > spec.den1) errs.push("fractionGrid: num1 exceeds den1 — the row factor must fit the unit square");
      if (spec.num2 > spec.den2) errs.push("fractionGrid: num2 exceeds den2 — the column factor must fit the unit square");
      for (const b of spec.commonBuilds)
        if (b.rows === spec.den1 && b.shadeR === spec.num1 && b.cols === spec.den2 && b.shadeC === spec.num2)
          errs.push("fractionGrid: a commonBuilds entry equals the correct build");
      break;
    }
    case "fractionCompare": {
      const l = spec.left.num * spec.right.den;
      const r = spec.right.num * spec.left.den;
      const truth = l < r ? "right" : l > r ? "left" : "equal";
      if (truth !== spec.answer)
        errs.push(`fractionCompare: authored answer "${spec.answer}" contradicts the fractions (truth: ${truth})`);
      if (spec.left.num > spec.left.den || spec.right.num > spec.right.den)
        errs.push("fractionCompare: improper fractions exceed the equal-whole bar (v1 renders one whole)");
      // answer-slot discipline: the answer's own feedback must be absent; both wrong slots present
      const slots = { left: spec.leftFeedback, right: spec.rightFeedback, equal: spec.equalFeedback };
      if (slots[spec.answer] !== undefined)
        errs.push("fractionCompare: the answer's own feedback slot can never fire — remove it");
      for (const k of ["left", "right", "equal"] as const)
        if (k !== spec.answer && slots[k] === undefined)
          errs.push(`fractionCompare: missing ${k}Feedback — every wrong tap needs a diagnosis`);
      break;
    }
    case "oddEvenPairs": {
      const truth = spec.n % 2 === 0 ? "even" : "odd";
      if (truth !== spec.answer)
        errs.push(`oddEvenPairs: authored answer "${spec.answer}" contradicts n=${spec.n} (truth: ${truth})`);
      if (spec.mode === "pair" && spec.n > 20)
        errs.push("oddEvenPairs: pair mode caps at 20 chips — use onesDigit mode for bigger numbers");
      if (spec.mode === "onesDigit" && spec.n < 10)
        errs.push("oddEvenPairs: onesDigit mode needs a tens place — use pair mode below 10");
      const slots = { odd: spec.oddFeedback, even: spec.evenFeedback };
      if (slots[spec.answer] !== undefined)
        errs.push("oddEvenPairs: the answer's own feedback slot can never fire — remove it");
      if (slots[spec.answer === "odd" ? "even" : "odd"] === undefined)
        errs.push("oddEvenPairs: the wrong parity needs a diagnosis");
      break;
    }
    case "baseTenCompose": {
      if (spec.maxHundreds === 0 && spec.target > 99)
        errs.push("baseTenCompose: target > 99 needs maxHundreds > 0 (the flats column)");
      const stdH = Math.floor(spec.target / 100);
      const stdT = Math.floor(spec.target / 10) % 10;
      const stdO = spec.target % 10;
      if (spec.requireStandard && (stdH > spec.maxHundreds || stdT > spec.maxTens || stdO > spec.maxOnes))
        errs.push("baseTenCompose: standard form of the target does not fit the tray caps");
      // Reachability, 3-digit aware (a dead duplicate case used to hold a 2-digit-era
      // version of this check — floor(target/10) tens — that miscounts hundreds).
      if (spec.target > spec.maxHundreds * 100 + spec.maxTens * 10 + spec.maxOnes)
        errs.push("baseTenCompose: target is unreachable within the maxHundreds/maxTens/maxOnes tray");
      break;
    }
    case "matrixTransform": {
      if (spec.sa === spec.ta && spec.sb === spec.tb && spec.sc === spec.tc && spec.sd === spec.td)
        errs.push("matrixTransform: start matrix equals the target — the task begins solved");
      if (spec.ta === spec.tb && spec.tc === spec.td)
        errs.push("matrixTransform: target columns are identical — the column-swap trap cannot be diagnosed");
      break;
    }
    case "dragOrder": {
      const ids = new Set(spec.items.map((i) => i.id));
      if (spec.correctOrder.length !== spec.items.length || !spec.correctOrder.every((id) => ids.has(id)))
        errs.push("dragOrder: correctOrder must be a permutation of item ids");
      break;
    }
    case "dragBucket": {
      const bids = new Set(spec.buckets.map((b) => b.id));
      for (const i of spec.items)
        if (!bids.has(i.bucketId)) errs.push(`dragBucket: item ${i.id} points at unknown bucket ${i.bucketId}`);
      break;
    }
    case "matchPairs": {
      const l = new Set(spec.left.map((i) => i.id));
      const r = new Set(spec.right.map((i) => i.id));
      for (const li of spec.left) if (!(li.id in spec.pairs)) errs.push(`matchPairs: left ${li.id} has no pair`);
      for (const [a, b] of Object.entries(spec.pairs)) {
        if (!l.has(a)) errs.push(`matchPairs: unknown left ${a}`);
        if (!r.has(b)) errs.push(`matchPairs: unknown right ${b}`);
      }
      break;
    }
    case "buildExpression": {
      const ids = new Set(spec.tokens.map((t) => t.id));
      for (const seq of [spec.correct, ...spec.acceptAlso, ...spec.commonBuilds.map((c) => c.sequence)])
        for (const id of seq) if (!ids.has(id)) errs.push(`buildExpression: unknown token ${id}`);
      break;
    }
    case "plotPoint": {
      for (const t of spec.targets)
        if (t.x > spec.cols || t.y > spec.rows)
          errs.push(`plotPoint: target (${t.x},${t.y}) outside the ${spec.cols}×${spec.rows} grid`);
      break;
    }
    case "toggleExplore": {
      const ids = new Set(spec.toggles.map((t) => t.id));
      const walk = (r: TRule): void => {
        if (typeof r === "string") {
          if (!ids.has(r)) errs.push(`toggleExplore: rule references unknown toggle ${r}`);
        } else r.args.forEach(walk);
      };
      walk(spec.rule);
      break;
    }
    case "estimateSlider": {
      if (spec.choices.length > 0) {
        if (!(spec.min < spec.max))
          errs.push("estimateSlider choices: need min < max");
        if (!(spec.min <= spec.target && spec.target <= spec.max))
          errs.push("estimateSlider choices: target must lie inside min…max");
        const values = spec.choices.map((choice) => choice.value);
        if (new Set(values).size !== values.length)
          errs.push("estimateSlider choices: candidate values must be unique");
        for (const value of values)
          if (value < spec.min || value > spec.max)
            errs.push(`estimateSlider choices: ${value} lies outside min…max`);
        const correct = spec.choices.filter((choice) => choice.correct);
        if (correct.length !== 1)
          errs.push("estimateSlider choices: exactly one candidate must be correct");
        if (correct.length === 1) {
          const correctGap = Math.abs(correct[0].value - spec.target);
          const otherGaps = spec.choices
            .filter((choice) => !choice.correct)
            .map((choice) => Math.abs(choice.value - spec.target));
          if (otherGaps.some((gap) => gap <= correctGap))
            errs.push("estimateSlider choices: the correct candidate must be uniquely closest to the target");
        }
        if (spec.start !== undefined && !values.includes(spec.start))
          errs.push("estimateSlider choices: start must equal one of the candidate values");
      } else {
        if (!(spec.min > 0 && spec.min < spec.target && spec.target < spec.max))
          errs.push("estimateSlider: continuous mode needs 0 < min < target < max");
        if (spec.min > 0 && spec.max / spec.min < 4)
          errs.push("estimateSlider: log scale needs max/min ≥ 4 to be meaningful");
      }
      break;
    }
    case "tenFrame": {
      if (spec.preFilled >= spec.target)
        errs.push("tenFrame: preFilled must be < target so at least one dot must be added");
      break;
    }
    case "numberLineHop": {
      const sign = spec.direction === "back" ? -1 : 1;
      const land = spec.start + sign * spec.hop * spec.hops;
      if (spec.hopSizeTargets) {
        // HOP-SIZE mode grades a stride, so the landing checks below do not apply to it.
        const lo = spec.hopSizeMin ?? 1;
        const hi = spec.hopSizeMax ?? 12;
        if (lo > hi) errs.push("numberLineHop: hopSizeMin exceeds hopSizeMax");
        for (const t of spec.hopSizeTargets) {
          if (t < spec.min || t > spec.max) errs.push(`numberLineHop: target ${t} is off the [${spec.min}, ${spec.max}] line`);
          if (t === spec.start) errs.push(`numberLineHop: target ${t} equals the start — every stride lands on it`);
        }
        if (new Set(spec.hopSizeTargets).size !== spec.hopSizeTargets.length)
          errs.push("numberLineHop: duplicate hopSizeTargets");
        const answer = hopSizeAnswer(spec.start, spec.hopSizeTargets, lo, hi);
        if (answer === null)
          errs.push("numberLineHop: no stride in range lands on every target — the task is unsolvable");
        else {
          // Both wrong-paths must be REACHABLE or their feedback is dead copy. A stride smaller
          // than the answer that still divides every distance gives notLargest; any stride that
          // misses a target gives missesTarget. A configuration offering neither cannot teach.
          let anySmallerHits = false;
          let anyMisses = false;
          for (let h = lo; h <= hi; h++) {
            if (h === answer) continue;
            const hits = spec.hopSizeTargets.every((t) => (t - spec.start) % h === 0);
            if (hits) anySmallerHits = true;
            else anyMisses = true;
          }
          if (anySmallerHits && !spec.notLargestFeedback)
            errs.push("numberLineHop: a non-largest stride is reachable but notLargestFeedback is missing");
          if (anyMisses && !spec.missesTargetFeedback)
            errs.push("numberLineHop: a target-missing stride is reachable but missesTargetFeedback is missing");
          if (!anyMisses)
            errs.push("numberLineHop: every stride in range lands on every target — there is no contrast case");
        }
        break;
      }
      if (spec.start < spec.min || spec.start > spec.max)
        errs.push("numberLineHop: start is off the line");
      if (land < spec.min || land > spec.max)
        errs.push(`numberLineHop: landing ${land} is off the [${spec.min}, ${spec.max}] line`);
      if (land === spec.start)
        errs.push("numberLineHop: landing equals start — no hop would be required");
      break;
    }
    case "subitizeFlash": {
      if (!spec.options.includes(spec.count))
        errs.push(`subitizeFlash: options must include the true count ${spec.count}`);
      if (new Set(spec.options).size !== spec.options.length)
        errs.push("subitizeFlash: options must be distinct");
      break;
    }
    case "lengthCompare": {
      const ids = spec.items.map((i) => i.id);
      if (new Set(ids).size !== ids.length) errs.push("lengthCompare: item ids must be distinct");
      if (!ids.includes(spec.answerId))
        errs.push(`lengthCompare: answerId "${spec.answerId}" is not one of the item ids`);
      const staggered = spec.items.some((i) => i.startOffset > 0);
      if (spec.mode === "difference") {
        // A difference is between exactly two things, and it has to be countable off the bars.
        if (spec.items.length !== 2)
          errs.push(`lengthCompare: difference mode needs exactly 2 items, found ${spec.items.length}`);
        if (!spec.unitLabel)
          errs.push("lengthCompare: difference mode needs a unitLabel — a gap in units cannot be counted off unmarked bars");
        if (staggered)
          errs.push("lengthCompare: difference mode requires a shared baseline (every startOffset 0)");
        if (spec.targetDifference === undefined)
          errs.push("lengthCompare: difference mode needs targetDifference");
        else if (spec.items.length === 2) {
          const [a, b] = spec.items;
          if (!Number.isInteger(a.length) || !Number.isInteger(b.length))
            errs.push("lengthCompare: difference mode needs whole-unit lengths, or the overhang cannot be counted");
          const real = Math.abs(a.length - b.length);
          if (real !== spec.targetDifference)
            errs.push(`lengthCompare: targetDifference ${spec.targetDifference} but the bars differ by ${real}`);
          if (real === 0) errs.push("lengthCompare: the two bars are the same length — there is no overhang to count");
          const longer = a.length >= b.length ? a : b;
          if (spec.answerId !== longer.id)
            errs.push(`lengthCompare: answerId must name the LONGER bar ("${longer.id}") in difference mode`);
          const ceiling = spec.diffMax ?? longer.length;
          if (ceiling < longer.length)
            errs.push(
              `lengthCompare: diffMax ${ceiling} is below the longer bar (${longer.length}) — the count-the-whole-bar error would be unreachable`
            );
          if (spec.targetDifference > ceiling)
            errs.push("lengthCompare: targetDifference is above diffMax — the answer cannot be reached");
        }
        if (spec.unalignedFeedback !== undefined)
          errs.push("lengthCompare: unalignedFeedback in difference mode is unreachable dead feedback");
      } else if (spec.mode === "align") {
        if (!staggered)
          errs.push("lengthCompare: align mode with every startOffset 0 — the task begins solved");
        if (spec.orientation !== "h")
          errs.push("lengthCompare: align mode is horizontal-only (the fair-comparison start line)");
      } else if (spec.mode === "pick") {
        if (staggered)
          errs.push("lengthCompare: startOffset > 0 in pick mode — the bars could never be lined up");
        if (spec.unalignedFeedback !== undefined)
          errs.push("lengthCompare: unalignedFeedback in pick mode is unreachable dead feedback");
      }
      // countsWholeFeedback is only reachable where a whole-bar count is a distinct wrong answer.
      if (spec.mode !== "difference" && spec.countsWholeFeedback !== undefined)
        errs.push("lengthCompare: countsWholeFeedback outside difference mode is unreachable dead feedback");
      break;
    }
    case "absValueLine": {
      const ids = spec.items.map((i) => i.id);
      if (new Set(ids).size !== ids.length) errs.push("absValueLine: item ids must be distinct");
      if (ids.includes("equal"))
        errs.push('absValueLine: "equal" is reserved for the same-distance choice — rename the item');
      // Truth re-derived from the magnitudes — a contradicting answer is rejected.
      const mags = spec.items.map((i) => Math.abs(i.value));
      const max = Math.max(...mags);
      const winners = spec.items.filter((i) => Math.abs(i.value) === max);
      const truth = winners.length === 1 ? winners[0].id : "equal";
      if (spec.answerId !== truth)
        errs.push(
          `absValueLine: authored answerId "${spec.answerId}" contradicts the magnitudes (farthest from zero is "${truth}")`
        );
      if (spec.answerId === "equal") {
        if (spec.equalLabel === undefined)
          errs.push("absValueLine: answer is equal but no equalLabel is offered to select it");
        if (spec.equalFeedback !== undefined)
          errs.push("absValueLine: equalFeedback is the ANSWER's own slot — it can never fire");
      } else {
        if (!ids.includes(spec.answerId))
          errs.push(`absValueLine: answerId "${spec.answerId}" is not an item id or "equal"`);
        const ans = spec.items.find((i) => i.id === spec.answerId);
        if (ans?.feedback !== undefined)
          errs.push(`absValueLine: the answer operand "${spec.answerId}" has feedback that can never fire`);
        if (spec.equalLabel !== undefined && spec.equalFeedback === undefined)
          errs.push("absValueLine: equalLabel offered without equalFeedback — a learner who picks it gets no diagnosis");
        if (spec.equalLabel === undefined && spec.equalFeedback !== undefined)
          errs.push("absValueLine: equalFeedback without an equalLabel choice is dead feedback");
      }
      break;
    }
    case "fractionEntry": {
      const val = (w: number, n: number, d: number, sg = 1) => (sg * (w * d + n)) / d;
      const ans = val(spec.answerWhole, spec.answerNum, spec.answerDen, spec.answerSign);
      if (spec.answerSign === -1 && !spec.allowNegative)
        errs.push("fractionEntry: a negative answer needs allowNegative (there is no sign control to reach it)");
      if (spec.form === "lowestTerms") {
        if (spec.allowWhole)
          errs.push("fractionEntry: form lowestTerms is for pure fractions — use form mixed with allowWhole");
        if (spec.answerNum > 0 && gcd(spec.answerNum, spec.answerDen) !== 1)
          errs.push(`fractionEntry: answer ${spec.answerNum}/${spec.answerDen} is not itself in lowest terms`);
      }
      if (spec.form === "mixed") {
        if (!spec.allowWhole) errs.push("fractionEntry: form mixed needs allowWhole (there is no whole field to fill)");
        if (!(spec.answerNum >= 1 && spec.answerNum < spec.answerDen && gcd(spec.answerNum, spec.answerDen) === 1))
          errs.push("fractionEntry: form mixed needs a lowest-terms proper fraction part (1 ≤ num < den, gcd 1)");
        if (spec.answerWhole < 1) errs.push("fractionEntry: form mixed with whole 0 is not a mixed number");
      }
      if (spec.form !== "any" && spec.formFeedback === undefined)
        errs.push("fractionEntry: form-graded task needs formFeedback (right value, wrong form is a real wrong path)");
      if (spec.form === "any" && spec.formFeedback !== undefined)
        errs.push("fractionEntry: formFeedback with form any is unreachable dead feedback");
      const seenVals = new Set<string>();
      for (const t of spec.commonEntries) {
        if (t.sign === -1 && !spec.allowNegative)
          errs.push(`fractionEntry: trap −${t.whole ? t.whole + " " : ""}${t.num}/${t.den} is negative but allowNegative is off — unreachable diagnosis`);
        const tv = val(t.whole, t.num, t.den, t.sign);
        const key = String(tv);
        if (Math.abs(tv - ans) < 1e-12)
          errs.push(`fractionEntry: trap ${t.whole ? t.whole + " " : ""}${t.num}/${t.den} equals the answer value — the right amount would be shown error feedback`);
        if (seenVals.has(key))
          errs.push(`fractionEntry: two traps share the value ${key} — the second diagnosis can never fire`);
        seenVals.add(key);
      }
      break;
    }
    case "placeCompare": {
      const num = (s: string) => Number(s);
      const truth = num(spec.left) < num(spec.right) ? "lt" : num(spec.left) > num(spec.right) ? "gt" : "eq";
      if (truth !== spec.answer)
        errs.push(`placeCompare: authored answer "${spec.answer}" contradicts the numbers (${spec.left} vs ${spec.right} is "${truth}")`);
      if (spec.view === "blocks")
        for (const side of [spec.left, spec.right])
          if (side.includes(".") || Number(side) > 999)
            errs.push("placeCompare: blocks view renders whole numbers ≤ 999 only");
      const slots = { lt: spec.ltFeedback, eq: spec.eqFeedback, gt: spec.gtFeedback } as const;
      for (const k of ["lt", "eq", "gt"] as const) {
        if (k === spec.answer && slots[k] !== undefined)
          errs.push(`placeCompare: ${k}Feedback is the ANSWER's own slot — it can never fire`);
        if (k !== spec.answer && slots[k] === undefined)
          errs.push(`placeCompare: missing ${k}Feedback — a learner who picks "${k}" gets no diagnosis`);
      }
      break;
    }
    case "rationalCompare": {
      // Truth re-derived EXACTLY via cross-multiplication (a decimal parses to
      // digits/10^k) — no floats, so 3/4 vs 0.75 is eq and 1/3 vs 0.3333 is gt.
      const rat = (o: { num: number; den: number } | { value: string }): [number, number] => {
        if ("num" in o) return [o.num, o.den];
        const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(o.value);
        if (!m) return [0, 1]; // unreachable: the zod regex already validated
        const d = 10 ** (m[3]?.length ?? 0);
        return [(m[1] === "-" ? -1 : 1) * (Number(m[2]) * d + Number(m[3] ?? "0")), d];
      };
      const [ln, ld] = rat(spec.left);
      const [rn, rd] = rat(spec.right);
      const truth = ln * rd < rn * ld ? "lt" : ln * rd > rn * ld ? "gt" : "eq";
      if (truth !== spec.answer)
        errs.push(`rationalCompare: authored answer "${spec.answer}" contradicts the values (truth is "${truth}")`);
      const slots = { lt: spec.ltFeedback, eq: spec.eqFeedback, gt: spec.gtFeedback } as const;
      for (const k of ["lt", "eq", "gt"] as const) {
        if (k === spec.answer && slots[k] !== undefined)
          errs.push(`rationalCompare: ${k}Feedback is the ANSWER's own slot — it can never fire`);
        if (k !== spec.answer && slots[k] === undefined)
          errs.push(`rationalCompare: missing ${k}Feedback — a learner who picks "${k}" gets no diagnosis`);
      }
      break;
    }
    case "pointEntry": {
      const arrEq = (a: number[], b: number[]) => a.length === b.length && a.every((x, i) => x === b[i]);
      const seen = new Set<string>();
      for (const t of spec.commonEntries) {
        if (t.values.length !== spec.answer.length)
          errs.push(`pointEntry: trap (${t.values.join(", ")}) has ${t.values.length} slots but the answer has ${spec.answer.length}`);
        if (arrEq(t.values, spec.answer))
          errs.push(`pointEntry: trap (${t.values.join(", ")}) equals the answer — the right point would be shown error feedback`);
        const key = t.values.join(",");
        if (seen.has(key)) errs.push(`pointEntry: two traps share the tuple (${t.values.join(", ")}) — the second diagnosis can never fire`);
        seen.add(key);
      }
      break;
    }
    case "fractionBar": {
      const seen = new Set<string>();
      for (const t of spec.commonFractions) {
        if (t.num * spec.targetDen === t.den * spec.targetNum)
          errs.push(`fractionBar: trap ${t.num}/${t.den} equals the target value — the right build would be shown error feedback`);
        if (t.num < spec.numMin || t.num > spec.numMax || t.den < spec.denMin || t.den > spec.denMax)
          errs.push(`fractionBar: trap ${t.num}/${t.den} is outside the slider bounds — unreachable dead feedback`);
        const key = `${t.num}/${t.den}`;
        if (seen.has(key)) errs.push(`fractionBar: duplicate trap ${key} — the second diagnosis can never fire`);
        seen.add(key);
      }
      break;
    }
    case "numberLinePlace": {
      if (spec.fractionDen !== undefined) {
        if (spec.min !== 0 || spec.max !== spec.fractionDen || spec.step !== 1 || spec.tickStep !== 1)
          errs.push(
            "numberLinePlace: fraction line must be authored in jump units (min 0, max = fractionDen, step 1, tickStep 1)"
          );
        if (spec.showDistanceFromZero)
          errs.push(
            "numberLinePlace: showDistanceFromZero has no meaning on a fraction line — that line runs 0..1 in jump units, so distance from zero is just the position again"
          );
      }
      // The readout earns its place only when position and distance can DIFFER. On a line that
      // never goes negative the two numbers are always identical, so showing both teaches nothing
      // and quietly implies they are the same thing — the exact confusion the flag exists to break.
      if (spec.showDistanceFromZero && spec.min >= 0)
        errs.push(
          `numberLinePlace: showDistanceFromZero needs a line that reaches below zero (min is ${spec.min}) — otherwise position and distance never differ`
        );
      const seen = new Set<number>();
      for (const p of spec.commonPlacements) {
        if (Math.abs(p.value - spec.target) < 1e-9)
          errs.push(`numberLinePlace: commonPlacement ${p.value} equals the target — the right placement would be shown error feedback`);
        if (p.value < spec.min || p.value > spec.max)
          errs.push(`numberLinePlace: commonPlacement ${p.value} is off the [${spec.min}, ${spec.max}] line — unreachable`);
        else if (Math.abs((p.value - spec.min) / spec.step - Math.round((p.value - spec.min) / spec.step)) > 1e-9)
          errs.push(`numberLinePlace: commonPlacement ${p.value} is off the step lattice — unreachable`);
        if (seen.has(p.value)) errs.push(`numberLinePlace: duplicate commonPlacement ${p.value}`);
        seen.add(p.value);
      }
      break;
    }
    default:
      break;
  }
  return errs;
}

/* ---------------- Steps & lessons ---------------- */

export const StepKind = z.enum(["concept", "interactive", "check", "challenge", "recap"]);

/** A commitment the learner makes BEFORE touching the manipulative — the
 * predict → manipulate → observe loop's opening move. The chosen option is
 * recorded and compared with the mathematical outcome after the interaction,
 * so being wrong is safe (predictions are commitments, never graded): the
 * comparison IS the lesson. `outcomeId` names which option the mathematics
 * bears out; `reveal` states the consequence explicitly, held to the same
 * ≥25-char substance bar as misconception feedback. */
export const Prediction = z
  .object({
    prompt: z.string().min(1),
    options: z
      .array(z.object({ id: z.string().min(1), label: z.string().min(1) }))
      .min(2)
      .max(4),
    outcomeId: z.string().min(1),
    reveal: z.string().min(25)
  })
  .superRefine((p, ctx) => {
    const ids = p.options.map((o) => o.id);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "prediction option ids must be unique" });
    if (!ids.includes(p.outcomeId))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `prediction outcomeId "${p.outcomeId}" is not one of the option ids`
      });
  });

export const CMLStage = z.enum(["predict", "construct", "observe", "explain", "revise", "generalize", "retrieve"]);
export const CMLRepresentation = z.enum(["concrete", "diagram", "number-line", "table", "symbolic", "graph", "language"]);
export const CMLKernel = z.enum([
  "quantity-composition",
  "equivalence-transformation",
  "covariation",
  "spatial-invariance",
  "chance-sampling"
]);

/** Causal Mastery Learning metadata. Optional on every existing step; the
 * runtime also supplies safe engine defaults for direct manipulatives, while
 * flagship pilot steps declare the full instructional contract here. */
export const CMLMeta = z
  .object({
    stage: CMLStage.default("construct"),
    flagship: z.boolean().default(false),
    kernel: CMLKernel.optional(),
    actionGoal: z.string().min(1).optional(),
    predictionId: z.string().min(1).optional(),
    invariants: z.array(z.string().min(1)).default([]),
    misconceptions: z.array(z.string().min(1)).default([]),
    representations: z.array(CMLRepresentation).default([]),
    translationFrom: CMLRepresentation.optional(),
    translationTo: CMLRepresentation.optional(),
    revisionOf: z.string().min(1).optional(),
    fadeLevel: z.number().int().min(0).max(3).default(0),
    transferFamily: z.string().min(1).optional(),
    delayed: z.boolean().default(false),
    counterfactualPrompt: z.string().min(1).optional(),
    explanation: z
      .object({
        prompt: z.string().min(1),
        options: z
          .array(
            z.object({
              id: z.string().min(1),
              label: z.string().min(1),
              correct: z.boolean().default(false),
              feedback: z.string().min(1)
            })
          )
          .min(2)
          .max(4)
      })
      .optional()
  })
  .superRefine((meta, ctx) => {
    if ((meta.translationFrom === undefined) !== (meta.translationTo === undefined))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CML representation translation requires both translationFrom and translationTo"
      });
    if (meta.stage === "revise" && !meta.revisionOf)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CML revise stages must identify revisionOf"
      });
    if (meta.explanation) {
      const right = meta.explanation.options.filter((o) => o.correct).length;
      if (right !== 1)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CML explanation must contain exactly one correct option"
        });
    }
  });

export const Step = z.object({
  id: z.string().min(1),
  kind: StepKind,
  /** Markdown-lite (only **bold**). ≤80 words for concept steps (pedagogy-linted). */
  body: z.string(),
  /** Optional named figure (see src/components/figures.tsx FIGURES registry) rendered above the body on concept steps. */
  figure: z.string().optional(),
  widget: WidgetSpec.optional(),
  /** Predict-before-manipulate commitment. Interactive steps only (pedagogy-linted):
   * the manipulative stays hidden until the learner commits, and the outcome
   * comparison is shown when the step completes. */
  predict: Prediction.optional(),
  /** Optional Causal Mastery Learning contract for this step. */
  cml: CMLMeta.optional(),
  conceptTag: z.string().optional(),
  /** ITEM-LEVEL VARIANT DECLARATION. A conceptTag names a SKILL; a skill is often authored on
   * several surfaces at once (`tse-solve-two-step` carries numeric, solveBalance and inversePipeline
   * items). Tag-level aliasing can therefore only ever serve one of those surfaces, and the rest go
   * unrefreshed — the guard in variantForStep declines them rather than downgrading them.
   *
   * This field lets a single STEP name its own generator and form, so a manipulative item inside an
   * otherwise-numeric tag gets fresh problems in ITS OWN surface. The tag alias remains the default;
   * this overrides it for one item. Validated by variants.resolver.test.ts: the generator must exist,
   * the form must be implemented, and the generated widget type must match this step's widget type. */
  variant: z
    .object({
      gen: z.string().min(1),
      form: z.string().min(1).optional(),
      /** S186: canonical fact-family key (see factFluency.ts) this check drills, e.g. "7x8" for
       * the 7×8/8×7/56÷7/56÷8 relationship. Optional and additive — only fluency-course checks
       * set it. When present, the lesson player folds the graded result into the learner's
       * per-family leech-box state (Profile.factItems) IN ADDITION TO the normal conceptTag
       * mastery update; it never substitutes for conceptTag, which still names the skill. */
      factFamily: z.string().regex(/^\d+[x+]\d+$/, "factFamily must be a canonical \"lowxhigh\" (multiplicative) or \"low+high\" (additive) key").optional()
    })
    .optional(),
  /** Exactly 3 progressive hints on challenge steps (nudge → method → near-solution). */
  hints: z.array(z.string().min(1)).optional(),
  /** Two distinct explanations per check/challenge — powers "Explain it differently". */
  explanationVariants: z.tuple([z.string().min(1), z.string().min(1)]).optional(),
  /** Recap only: ≤3 takeaways plus a next-lesson teaser. */
  takeaways: z.array(z.string().min(1)).optional(),
  teaser: z.string().optional(),
  /** Optional spoken caption for early-reader (G1–G2) steps. Text now; a TTS/audio
   *  provider reads it in a later phase — mirrors the TutorProvider stub pattern. */
  narration: z.string().optional()
});

/** Remedial content, hidden unless the adaptive engine injects it (2 misses on a conceptTag). */
export const RemedialPair = z.object({
  conceptTag: z.string().min(1),
  concept: Step,
  check: Step
});

export const Lesson = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  courseId: z.string().min(1),
  chapterId: z.string().min(1),
  minutes: z.number().int().positive(),
  /** "early" = G1–G2 figure-first profile (tighter concept word cap, pedagogy-linted).
   *  Omitted → "standard" (the ≤80-word profile all existing G3–G6 content uses). */
  readingProfile: z.enum(["early", "standard"]).default("standard"),
  steps: z.array(Step).min(8).max(15),
  /**
   * S203 — CCSS (and equivalent) sub-standard codes this lesson is authored to teach, e.g.
   * ["6.SP.B.4"]. Optional and additive: all 1,667 pre-existing lessons stay valid untagged, and
   * their coverage is carried by the sidecar map at content/standards/ccss-6-8-coverage-map.json
   * so that tagging the back catalogue never requires a lesson-JSON byte change. New lessons
   * should declare inline — the sidecar exists for history, not as the destination.
   *
   * Codes are LETTERED sub-standards (6.RP.A.3a, not 6.RP), because that is the unit instruction
   * and assessment actually work in; scripts/audit/standards-coverage-6-8.mjs validates every
   * code against content/standards/ccss-6-8.json and rejects unknown ones.
   */
  standards: z.array(z.string().min(1)).optional(),
  remedials: z.array(RemedialPair).default([])
});

export const Course = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  category: z.enum(["Math", "Logic", "CS", "Data", "Science"]),
  /** Grade band (0 = kindergarten, 1 = grade 1, etc.). Existing content defaults to 3. */
  gradeLevel: z.number().int().min(0).default(3),
  chapters: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        lessonIds: z.array(z.string().min(1)).min(1)
      })
    )
    .min(1)
});

export const DailyCategory = z.enum([
  "multiplication",
  "place-value",
  "fractions",
  "measurement",
  "geometry",
  "multiply-bigger",
  "millions",
  "fraction-ops",
  "measure-convert",
  "lines-angles"
]);

/** A standalone dated challenge: one per category per day, rotating over 30 authored days. */
export const DailyProblem = z.object({
  id: z.string().regex(/^daily-[a-z-]+-\d{2}$/),
  day: z.number().int().min(1).max(30),
  category: DailyCategory,
  body: z.string().min(1),
  conceptTag: z.string().min(1),
  widget: WidgetSpec,
  hints: z.array(z.string().min(1)).length(3),
  explanationVariants: z.array(z.string().min(1)).length(2)
});

export const DailyCategoryFile = z.object({
  category: DailyCategory,
  /** Mirrors Course.gradeLevel (P9.0): defaults to 3 so every existing G3 file parses unchanged. */
  gradeLevel: z.number().int().min(3).default(3),
  problems: z.array(DailyProblem).length(30)
});

/* ---------------- Inferred types ---------------- */

export type TMcq = z.infer<typeof McqSpec>;
export type TNumeric = z.infer<typeof NumericSpec>;
export type TFractionEntry = z.infer<typeof FractionEntrySpec>;
export type TPointEntry = z.infer<typeof PointEntrySpec>;
export type TPlaceCompare = z.infer<typeof PlaceCompareSpec>;
export type TRationalCompare = z.infer<typeof RationalCompareSpec>;
export type TSlider = z.infer<typeof SliderSpec>;
export type TTapDiagram = z.infer<typeof TapDiagramSpec>;
export type TDragOrder = z.infer<typeof DragOrderSpec>;
export type TDragBucket = z.infer<typeof DragBucketSpec>;
export type TMatchPairs = z.infer<typeof MatchPairsSpec>;
export type TBuildExpression = z.infer<typeof BuildExpressionSpec>;
export type TPlotPoint = z.infer<typeof PlotPointSpec>;
export type TToggleExplore = z.infer<typeof ToggleExploreSpec>;
export type TSteppedReveal = z.infer<typeof SteppedRevealSpec>;
export type TEstimateSlider = z.infer<typeof EstimateSliderSpec>;
export type TLineExplore = z.infer<typeof LineExploreSpec>;
export type TFractionBar = z.infer<typeof FractionBarSpec>;
export type TQuadraticExplore = z.infer<typeof QuadraticExploreSpec>;
export type TUnitCircleExplore = z.infer<typeof UnitCircleExploreSpec>;
export type TSystemsExplore = z.infer<typeof SystemsExploreSpec>;
export type TNumberLinePlace = z.infer<typeof NumberLinePlaceSpec>;
export type TFunctionMachine = z.infer<typeof FunctionMachineSpec>;
export type TProbabilityArea = z.infer<typeof ProbabilityAreaSpec>;
export type THundredthsGrid = z.infer<typeof HundredthsGridSpec>;
export type TTransformExplore = z.infer<typeof TransformExploreSpec>;
export type TAngleMeasure = z.infer<typeof AngleMeasureSpec>;
export type TDilationExplore = z.infer<typeof DilationExploreSpec>;
export type TRotationLab = z.infer<typeof RotationLabSpec>;
export type TBarBuilder = z.infer<typeof BarBuilderSpec>;
export type TDotPlot = z.infer<typeof DotPlotSpec>;
export type TGraphRead = z.infer<typeof GraphReadSpec>;
export type TBoxPlot = z.infer<typeof BoxPlotSpec>;
export type TDistributionCompareLab = z.infer<typeof DistributionCompareLabSpec>;
export type TAreaModel = z.infer<typeof AreaModelSpec>;
export type TPlaceValue = z.infer<typeof PlaceValueSpec>;
export type TDoubleNumberLine = z.infer<typeof DoubleNumberLineSpec>;
export type TScatterFit = z.infer<typeof ScatterFitSpec>;
export type TFractionOfSet = z.infer<typeof FractionOfSetSpec>;
export type TPercentBar = z.infer<typeof PercentBarSpec>;
export type TPercentChangeLab = z.infer<typeof PercentChangeLabSpec>;
export type TEquationOutcomeLab = z.infer<typeof EquationOutcomeLabSpec>;
export type TSignedFractionLab = z.infer<typeof SignedFractionLabSpec>;
export type TIntegerChips = z.infer<typeof IntegerChipsSpec>;
export type TVolumeBuilder = z.infer<typeof VolumeBuilderSpec>;
export type TNetFold = z.infer<typeof NetFoldSpec>;
export type TRatioTable = z.infer<typeof RatioTableSpec>;
export type TElapsedTime = z.infer<typeof ElapsedTimeSpec>;
export type TDistanceGrid = z.infer<typeof DistanceGridSpec>;
export type TTreeDiagram = z.infer<typeof TreeDiagramSpec>;
export type TSpinnerSim = z.infer<typeof SpinnerSimSpec>;
export type TTrialProbabilityLab = z.infer<typeof TrialProbabilityLabSpec>;
export type TScaledCircleLab = z.infer<typeof ScaledCircleLabSpec>;
export type TTriangleClosureLab = z.infer<typeof TriangleClosureLabSpec>;
export type TCompoundEventLab = z.infer<typeof CompoundEventLabSpec>;
export type TCompositeAreaLab = z.infer<typeof CompositeAreaLabSpec>;
export type TTaylorApprox = z.infer<typeof TaylorApproxSpec>;
export type TSlopeField = z.infer<typeof SlopeFieldSpec>;
export type TSliceSum = z.infer<typeof SliceSumSpec>;
export type TRiemannSum = z.infer<typeof RiemannSumSpec>;
export type TAccumulateArea = z.infer<typeof AccumulateAreaSpec>;
export type TDerivativeTrace = z.infer<typeof DerivativeTraceSpec>;
export type TCompassConstruct = z.infer<typeof CompassConstructSpec>;
export type TQuadDrag = z.infer<typeof QuadDragSpec>;
export type TRadicalCheck = z.infer<typeof RadicalCheckSpec>;
export type TSequenceBuild = z.infer<typeof SequenceBuildSpec>;
export type TTriangleSolve = z.infer<typeof TriangleSolveSpec>;
export type TSignChart = z.infer<typeof SignChartSpec>;
export type TExtraneousRootLab = z.infer<typeof ExtraneousRootLabSpec>;
export type TBinomialAreaLab = z.infer<typeof BinomialAreaLabSpec>;
export type TShapeParts = z.infer<typeof ShapePartsSpec>;
export type TPolarTrace = z.infer<typeof PolarTraceSpec>;
export type TCircleMeasureExplore = z.infer<typeof CircleMeasureExploreSpec>;
export type TVectorExplore = z.infer<typeof VectorExploreSpec>;
export type TMatrixTransform = z.infer<typeof MatrixTransformSpec>;
export type TArgandExplore = z.infer<typeof ArgandExploreSpec>;
export type TSecantSlope = z.infer<typeof SecantSlopeSpec>;
export type TExpLogExplore = z.infer<typeof ExpLogExploreSpec>;
export type TGraphZoom = z.infer<typeof GraphZoomSpec>;
export type TCircleAngleExplore = z.infer<typeof CircleAngleExploreSpec>;
export type TSampleSim = z.infer<typeof SampleSimSpec>;
export type TCiCapture = z.infer<typeof CiCaptureSpec>;
export type TShuffleTest = z.infer<typeof ShuffleTestSpec>;
export type TAlgebraTiles = z.infer<typeof AlgebraTilesSpec>;
export type TClockSet = z.infer<typeof ClockSetSpec>;
export type TBalanceScale = z.infer<typeof BalanceScaleSpec>;
export type TInversePipeline = z.infer<typeof InversePipelineSpec>;
export type TSolveBalance = z.infer<typeof SolveBalanceSpec>;
export type TTenFrame = z.infer<typeof TenFrameSpec>;
export type TNumberLineHop = z.infer<typeof NumberLineHopSpec>;
export type TBaseTenCompose = z.infer<typeof BaseTenComposeSpec>;
export type TSubitizeFlash = z.infer<typeof SubitizeFlashSpec>;
export type TLengthCompare = z.infer<typeof LengthCompareSpec>;
export type TAbsValueLine = z.infer<typeof AbsValueLineSpec>;
export type TMoneyBoard = z.infer<typeof MoneyBoardSpec>;
export type TFractionGrid = z.infer<typeof FractionGridSpec>;
export type TFractionCompare = z.infer<typeof FractionCompareSpec>;
export type TOddEvenPairs = z.infer<typeof OddEvenPairsSpec>;
export type TMixedRegroup = z.infer<typeof MixedRegroupSpec>;
export type TColumnCalc = z.infer<typeof ColumnCalcSpec>;
export type TEvalOrder = z.infer<typeof EvalOrderSpec>;
export type TUnitChain = z.infer<typeof UnitChainSpec>;
export type TSlopeTriangle = z.infer<typeof SlopeTriangleSpec>;
export type TLineRelationLab = z.infer<typeof LineRelationLabSpec>;
export type TTriangleConstraintLab = z.infer<typeof TriangleConstraintLabSpec>;
export type TCoordinateProofLab = z.infer<typeof CoordinateProofLabSpec>;
export type TSolidSliceLab = z.infer<typeof SolidSliceLabSpec>;
export type TTriangleAngleLab = z.infer<typeof TriangleAngleLabSpec>;
export type TVerticalLineScanner = z.infer<typeof VerticalLineScannerSpec>;
export type TCovariationScrubber = z.infer<typeof CovariationScrubberSpec>;
export type TSamplingBiasLab = z.infer<typeof SamplingBiasLabSpec>;
export type TShapeFamilyBuilder = z.infer<typeof ShapeFamilyBuilderSpec>;
export type TShapeHierarchyLab = z.infer<typeof ShapeHierarchyLabSpec>;
export type TUnitRuler = z.infer<typeof UnitRulerSpec>;
export type TProportionalReasoningLab = z.infer<typeof ProportionalReasoningLabSpec>;
export type TPlaceValueTransformLab = z.infer<typeof PlaceValueTransformLabSpec>;
export type TPointSetReasoningLab = z.infer<typeof PointSetReasoningLabSpec>;
export type TGeometricConstraintLab = z.infer<typeof GeometricConstraintLabSpec>;
export type TExactNumberLab = z.infer<typeof ExactNumberLabSpec>;
export type TAffineRelationshipLab = z.infer<typeof AffineRelationshipLabSpec>;
export type TQuotientReasoningLab = z.infer<typeof QuotientReasoningLabSpec>;
export type TGraphStoryLab = z.infer<typeof GraphStoryLabSpec>;
export type TConditionalTableLab = z.infer<typeof ConditionalTableLabSpec>;
export type TConicLocusLab = z.infer<typeof ConicLocusLabSpec>;
export type TDerivativeRuleLab = z.infer<typeof DerivativeRuleLabSpec>;
export type TRelatedRatesLab = z.infer<typeof RelatedRatesLabSpec>;
export type TNumberLineRay = z.infer<typeof NumberLineRaySpec>;
export type TWidget = z.infer<typeof WidgetSpec>;
export type TStep = z.infer<typeof Step>;
export type TRemedialPair = z.infer<typeof RemedialPair>;
export type TCMLMeta = z.infer<typeof CMLMeta>;
export type TLesson = z.infer<typeof Lesson>;
export type TCourse = z.infer<typeof Course>;
export type TDailyProblem = z.infer<typeof DailyProblem>;
export type TDailyCategoryFile = z.infer<typeof DailyCategoryFile>;
export type TDailyCategory = z.infer<typeof DailyCategory>;
