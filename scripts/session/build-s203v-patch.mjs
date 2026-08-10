#!/usr/bin/env node
/**
 * S203V — closes all twelve uncovered core HS standards found in S203I, each lesson designed for
 * TIER A from the start (prediction>=2, manip>=2, conseq>=2, misconception>=2, total>=30), not
 * merely Tier B. That is a materially higher bar than the repair workstream (S203J-U), which only
 * needed manip/conseq to cross into B by converting one step of an ALREADY-DECENT lesson. Here
 * every lesson is new, and every scoring dimension is deliberately engineered per
 * scripts/flagship-tier.mjs's exact logic:
 *   - predict on the FIRST interactive step, whose widget itself has manip>=2  -> prediction=3
 *   - same conceptTag across every check step (3 checks)                       -> contrast=3
 *   - a concept step (c2) after the first widget step                         -> invariant=3
 *   - a numeric/entry check immediately after a manip>=2 interactive          -> formal=3
 *   - the challenge step's widget type absent from every check step's types   -> transfer=3
 *   - >=2 wrong-answer paths on EVERY assessed (check/challenge) step         -> misconception 2-3
 *   - an engine with adapt>=3 (scatterFit, distributionCompareLab) PLUS a
 *     remedial block on every lesson                                          -> adapt=3
 *
 * NEW COURSE: data-and-models (G9), inserted bivariate-statistics(G8) -> data-and-models(G9) ->
 * statistical-inference(G11) — the missing middle diagnosed in S203H/I: the corpus taught
 * descriptive/bivariate statistics at G8 and jumped to inference at G11 with nothing at HS
 * rebuilding it with residuals, correlation and technology-fit. Four lessons, deliberately dense
 * (avg 2.25 standards/lesson) to keep this tractable while each still earns its Tier A honestly:
 *   dm-01-01  S-ID.A.1, A.2, A.3   — shape/outliers (dotPlot) + comparing groups (boxPlot)
 *   dm-02-01  S-ID.B.6a, B.6c, C.7 — fitting and reading a line (scatterFit, two contexts)
 *   dm-02-02  S-ID.B.6b, C.8       — residuals (scatterFit) + correlation coefficient (formula)
 *   dm-03-01  N-Q.A.3              — precision propagation, tied back to the course's own modeling
 *
 * THREE SINGLETONS placed where they thematically belong, each math-verified against the actual
 * theorem before authoring (not assumed from a title):
 *   fna-06-01  F-IF.C.9   in function-analysis — derivativeTrace (graph) vs a table vs an equation
 *   sy-06-01   G-SRT.A.1a in similarity        — dilationExplore, a segment NOT through the centre
 *   cr-06-01   G-C.A.1    in circle-theorems   — scaledCircleLab circumferenceCoef vs areaCoef
 *
 * HABIT 3, checked before writing a line: none of dotPlot/boxPlot/distributionCompareLab/
 * scatterFit/dilationExplore/scaledCircleLab are referenced by any FIXED-target pinned audit (the
 * one similarity-adjacent hit, geometric-constraint-mutations-s149.mjs, tests an unrelated
 * aaSimilarity TASK inside a different engine's own math — confirmed by reading the file, not
 * assumed from the grep match).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function lesson({ id, slug, title, courseId, chapterId, minutes, standards, tag, c1, i1, k1, k2, c2, i2, k3, ch1, recap, remedial }) {
  return {
    id, slug, title, courseId, chapterId, minutes, standards,
    steps: [
      { id: "c1", kind: "concept", body: c1.body, figure: c1.figure },
      { id: "i1", kind: "interactive", body: i1.body, predict: i1.predict, widget: i1.widget },
      { id: "k1", kind: "check", body: k1.body, conceptTag: tag, explanationVariants: k1.variants, widget: k1.widget },
      { id: "k2", kind: "check", body: k2.body, conceptTag: tag, explanationVariants: k2.variants, widget: k2.widget },
      { id: "c2", kind: "concept", body: c2.body, figure: c2.figure },
      { id: "i2", kind: "interactive", body: i2.body, predict: i2.predict, widget: i2.widget },
      { id: "k3", kind: "check", body: k3.body, conceptTag: tag, explanationVariants: k3.variants, widget: k3.widget },
      { id: "ch1", kind: "challenge", body: ch1.body, conceptTag: tag, explanationVariants: ch1.variants, hints: ch1.hints, widget: ch1.widget },
      { id: "r1", kind: "recap", body: recap.body, takeaways: recap.takeaways, teaser: recap.teaser }
    ],
    remedials: [remedial]
  };
}

const num = (prompt, answer, errs, fallback, unit = "") => ({
  type: "numeric", prompt, answer, tolerance: 0, unit,
  commonErrors: errs.map(([value, feedback]) => ({ value, feedback })),
  fallbackFeedback: fallback
});
const mcq = (prompt, opts) => ({
  type: "mcq", prompt,
  options: opts.map(([id, label, correct, feedback]) => ({ id, label, correct, feedback }))
});
const predict = (prompt, opts, outcomeId, reveal) => ({
  prompt, options: opts.map(([id, label]) => ({ id, label })), outcomeId, reveal
});

/* ============================================================ dm-01-01: S-ID.A.1, A.2, A.3 */

const dm0101 = lesson({
  id: "dm-01-01", slug: "shape-outliers-and-comparing-groups", title: "One Dataset's Shape, Two Datasets Compared",
  courseId: "data-and-models", chapterId: "ch1-describing-data", minutes: 12,
  standards: ["S-ID.A.1", "S-ID.A.2", "S-ID.A.3"], tag: "dm-shape-spread",
  c1: {
    figure: "dm-shape-outlier",
    body: "A dot plot puts every value where it belongs on a number line, one dot per data point, stacked when values repeat. Nothing is summarized away yet — the whole dataset is right there, which is exactly why its **shape** is visible: where it peaks, whether it leans, and whether one value sits far from the rest."
  },
  i1: {
    predict: predict("Ten quiz scores are mostly 7-9, but one student scored just 2. Will the dot plot look roughly symmetric, or will it lean?",
      [["symmetric", "Roughly symmetric — one low score won't shift the overall shape much"],
       ["lean", "It will lean — a stretched tail toward the low outlier"]], "lean",
      "It leans. A cluster of high scores plus one far-off low score pulls a long tail toward 2 — watch that tail appear as you build it."),
    body: "Build the plot: 1 student scored 2, 1 scored 6, 2 scored 7, 3 scored 8, 3 scored 9.",
    widget: {
      type: "dotPlot", prompt: "Build the dot plot for the ten quiz scores.",
      values: [2, 6, 7, 8, 9], target: [1, 1, 2, 3, 3], maxPerValue: 6,
      successFeedback: "Ten dots, peaked at 8-9 with a long low tail reaching to 2. That tail is the outlier's fingerprint — nothing about the peak changed, but the shape is no longer symmetric.",
      partialFeedback: "Some stacks don't match yet. Recount from the data: 1 at 2, 1 at 6, 2 at 7, 3 at 8, 3 at 9."
    }
  },
  k1: {
    body: "Read a count straight off the plot.",
    variants: ["The stack above 8 has 3 dots — 3 students scored an 8.", "Count the dots directly above the value asked for."],
    widget: num("On this plot, how many students scored an 8?", 3,
      [[9, "9 is the total of the three tallest stacks combined (2+3+3+1... not quite — read only the ONE stack above 8, not several)."],
       [1, "1 is the height of the stack above 6, not 8."]],
      "The stack above 8 has 3 dots.")
  },
  k2: {
    body: "See what the outlier does to the range.",
    variants: ["9 (highest) minus 2 (the outlier) is 7 — a big range driven by one point.", "Range only needs the two extreme values, however many points sit between them."],
    widget: num("What is the range of all ten scores, INCLUDING the outlier at 2?", 7,
      [[3, "3 is 9 − 6, skipping the outlier entirely. The outlier IS one of the ten scores — include it."],
       [2, "2 is the outlier's value itself, not the range. Range is highest minus lowest: 9 − 2."]],
      "9 − 2 = 7.")
  },
  c2: {
    figure: "dm-compare-spread",
    body: "Shape and range describe ONE dataset. Comparing TWO datasets needs the same two questions asked side by side: which is centred higher (or lower), and which is more spread out. A class that averages higher AND stays more consistent is doing better on both counts — a class that averages higher but swings wildly might not be, once you look past the average."
  },
  i2: {
    body: "Build Class A's five-number summary: min 78, Q1 82, median 85, Q3 88, max 92.",
    widget: {
      type: "boxPlot", prompt: "Set Class A's summary: min 78, Q1 82, median 85, Q3 88, max 92.",
      axisMin: 60, axisMax: 100, targetMin: 78, targetQ1: 82, targetMed: 85, targetQ3: 88, targetMax: 92,
      startMin: 60, startQ1: 70, startMed: 80, startQ3: 90, startMax: 100,
      successFeedback: "That box is narrow — Q1 to Q3 spans only 6 points, all packed close to the median. A tight box IS the picture of consistency.",
      orderFeedback: "Keep the five handles in order: min ≤ Q1 ≤ median ≤ Q3 ≤ max.",
      valueFeedback: "In order, but not yet 78, 82, 85, 88, 92."
    }
  },
  k3: {
    body: "Compute the spread the box just showed.",
    variants: ["Q3 minus Q1 is 88 − 82 = 6 — the width of the box, the middle half of the class.", "The IQR is exactly the box's width: Q3 − Q1."],
    widget: num("What is Class A's interquartile range (Q3 − Q1)?", 6,
      [[14, "14 is max − min (92 − 78), the FULL range, not the box's width."],
       [3, "3 is half of 6. The IQR is the box's full width, Q3 minus Q1 directly."]],
      "88 − 82 = 6.")
  },
  ch1: {
    body: "Put both descriptions together.",
    variants: ["Class B's box would be much wider than Class A's — same median, but scores land anywhere from 70 to 100 instead of clustering near 85.",
      "A wide range with the same average means less consistency, not more opportunity."],
    hints: ["Both classes average 85 — the medians would be about the same.", "Class B's scores span 70 to 100. What does that say about its box's WIDTH compared to Class A's?", "A wider box means MORE spread, which means LESS consistency."],
    widget: mcq("Class B has the same median as Class A but scores ranging from 70 to 100. What would Class B's box plot look like next to Class A's?", [
      ["a", "About the same centre, but a much wider box — less consistent", true, "Same median, but a wide range of raw scores means a wide IQR too: Class B is far less consistent than Class A's tight cluster."],
      ["b", "A much higher centre, similar width", false, "The medians are given as roughly equal — the centres would match, not differ."],
      ["c", "About the same centre and a narrower box", false, "A WIDER range of raw scores (70-100 vs Class A's tighter cluster) means a WIDER box, not narrower."],
      ["d", "There is no way to compare them without more data", false, "The median and range given are exactly what a box plot needs — that IS enough to compare."]
    ])
  },
  recap: {
    body: "One dataset's shape, and two datasets compared.",
    takeaways: [
      "A dot plot shows shape directly: peaks, symmetry, and how far an outlier's tail stretches.",
      "Comparing groups needs both centre (median) and spread (IQR) — a higher average alone doesn't mean more consistent.",
      "A narrow box is a tight cluster; a wide box is real variation, whatever the median says."
    ],
    teaser: "next chapter: two-variable data — fitting a line, and reading what it says."
  },
  remedial: {
    conceptTag: "dm-shape-spread",
    concept: { id: "rem-dss-c", kind: "concept", body: "Rewind. Range is the distance from the SMALLEST value to the LARGEST — highest minus lowest, nothing more. IQR is the same idea but for just the middle half: Q3 minus Q1." },
    check: {
      id: "rem-dss-k", kind: "check", body: "", conceptTag: "dm-shape-spread",
      explanationVariants: ["Highest minus lowest: 20 − 5 = 15.", "Range only needs the two extreme values."],
      widget: num("A dataset's smallest value is 5 and largest is 20. What is the range?", 15,
        [[25, "25 adds them. Range SUBTRACTS: highest minus lowest."],
         [4, "4 divides them. Range is highest minus lowest: 20 − 5 = 15."]],
        "20 − 5 = 15.")
    }
  }
});

/* ============================================================ dm-02-01: S-ID.B.6a, B.6c, C.7 */

const dm0201 = lesson({
  id: "dm-02-01", slug: "fitting-and-reading-a-line", title: "Fitting a Line, and Reading What It Says",
  courseId: "data-and-models", chapterId: "ch2-modeling-with-two-variables", minutes: 13,
  standards: ["S-ID.B.6a", "S-ID.B.6c", "S-ID.C.7"], tag: "dm-fit-and-read",
  c1: { figure: "scatter-best-fit", body: "When two quantities move together, a line drawn through the middle of the scatter can **predict** one from the other. Fitting that line by hand means dragging it until the gaps above and below balance out — a real skill, not a guess, and it is exactly what a spreadsheet's trendline button does automatically underneath." },
  i1: {
    predict: predict("Minutes studied versus test score: as study time goes up, scores go up too. Will the fitted line's slope be positive or negative?",
      [["pos", "Positive — more study time, higher scores"], ["neg", "Negative — more study time, lower scores"]], "pos",
      "Positive. More of the input (minutes) goes with more of the output (score), so the line climbs left to right — a positive slope."),
    body: "Six students: hours studied vs. test score. Fit the trend.",
    widget: {
      type: "scatterFit", prompt: "Fit a line to hours studied (x) versus test score (y).",
      points: [[1, 65], [2, 71], [3, 74], [4, 79], [5, 86], [6, 89]],
      xMin: 0, xMax: 7, yMin: 55, yMax: 95, tolerance: 0.4,
      mMin: -2, mMax: 8, mStep: 0.5, mStart: 0, bMin: 40, bMax: 80, bStep: 2, bStart: 50,
      successFeedback: "About y = 5x + 60. Every extra hour of study lines up with roughly 5 more points — the line's slope is that rate, read directly off how steeply it climbs.",
      slopeFeedback: "The tilt is off — this line climbs at the wrong rate for the trend.",
      offsetFeedback: "The tilt looks right, but the line needs to slide to sit through the middle of the cloud."
    }
  },
  k1: {
    body: "Name what the slope means in context.",
    variants: ["Slope is the rate: each extra hour is worth about 5 more points.", "Read the slope as 'points gained per hour' — that is what it counts."],
    widget: num("Using y = 5x + 60, about how many extra points does ONE more hour of study predict?", 5,
      [[60, "60 is the intercept — the STARTING score at zero hours, not the rate per hour."],
       [65, "65 is the score AT one hour (5×1+60), not the CHANGE per hour."]],
      "The slope, 5, is points gained per additional hour.")
  },
  k2: {
    body: "Separate fitting a line from what fitting MEANS.",
    variants: ["A good fit minimizes the total size of the gaps — points can still land above or below it.", "'Best fit' does not mean every point sits ON the line."],
    widget: mcq("What does it mean for a line to 'fit' a scatter of points well?", [
      ["a", "The gaps between the points and the line are small overall, balanced above and below", true, "A good fit keeps the leftover gaps — the residuals — small in total, not zero; some points sit above the line, some below, roughly balanced."],
      ["b", "Every single point lies exactly on the line", false, "Real data almost never lines up perfectly — a good fit balances small gaps, it doesn't erase them."],
      ["c", "The line touches the highest and lowest points", false, "Connecting the extremes ignores everything in between — a fitted line follows the OVERALL trend, not just the two most extreme points."],
      ["d", "The line has the steepest possible slope", false, "Steepest isn't the goal — matching the DATA's actual trend is, however steep or shallow that happens to be."]
    ])
  },
  c2: {
    figure: "bv-residuals-steer-the-line",
    body: "A spreadsheet or calculator finds this SAME line — not by eye, but by testing every possible tilt and choosing the one where the leftover gaps, squared and added up, are as small as they can be. It is the identical goal fitting by hand chases; **technology just automates the search**, and lands on the same answer a careful hand-fit approximates."
  },
  i2: {
    body: "Temperature (°F) vs. hot cocoa cups sold. Fit the trend.",
    widget: {
      type: "scatterFit", prompt: "Fit a line to temperature (x) versus cups sold (y).",
      points: [[30, 120], [40, 100], [50, 82], [60, 58], [70, 42]],
      xMin: 20, xMax: 80, yMin: 0, yMax: 140, tolerance: 0.4,
      mMin: -4, mMax: 2, mStep: 0.5, mStart: 0, bMin: 140, bMax: 220, bStep: 5, bStart: 200,
      successFeedback: "About y = −2x + 180 — a negative slope, because every degree warmer costs about 2 cups of sales. The direction flips, but finding it is the exact same process as before.",
      slopeFeedback: "The tilt is off for this falling trend.",
      offsetFeedback: "The tilt is close, but the line needs to slide toward the middle of this cloud."
    }
  },
  k3: {
    body: "Use the model to predict, not just describe.",
    variants: ["y = −2x + 180 at x = 45 gives 180 − 90 = 90.", "Plug the input into the equation exactly like any other function."],
    widget: num("Using y = −2x + 180, predict cups sold at 45°F.", 90,
      [[135, "135 uses x = 45 as if the slope were +... check the sign: −2(45) = −90, then 180 − 90 = 90."],
       [88, "88 is close but not exact — −2(45) = −90 exactly, and 180 − 90 = 90."]],
      "−2(45) + 180 = 90 cups.")
  },
  ch1: {
    body: "Read a model you didn't fit yourself.",
    variants: ["Slope 8 means $8 more revenue per ad; intercept 200 means $200 in sales with zero ads run.",
      "Whatever produced the numbers, slope is always the rate and intercept is always the value at x = 0."],
    hints: ["A calculator's trendline gives y = 8x + 200 for ads run (x) vs. weekly revenue in dollars (y).", "The slope, 8, is the rate — dollars per ad.", "The intercept, 200, is the value when x = 0 — revenue with no ads at all."],
    widget: mcq("A store's calculator fits weekly revenue to y = 8x + 200, where x is ads run. What do the 8 and the 200 mean?", [
      ["a", "$8 more revenue per extra ad; $200 in revenue with zero ads", true, "Slope is always the rate of change (dollars per ad here); the intercept is always the value at x = 0 — baseline revenue with no advertising at all."],
      ["b", "8 ads produce $200 in revenue", false, "That treats the two numbers as one combined fact. They are separate: a RATE (8) and a STARTING value (200)."],
      ["c", "$200 more revenue per extra ad; a baseline of $8", false, "The roles are swapped — check which number multiplies x (the rate) and which stands alone (the baseline)."],
      ["d", "The numbers only make sense with the original data in hand", false, "That is exactly what a trendline equation is for — reading slope and intercept, no raw data required."]
    ])
  },
  recap: {
    body: "Fitting a line, and reading what it says.",
    takeaways: [
      "A fitted line minimizes the total size of the leftover gaps — it doesn't have to pass through every point.",
      "Technology finds the identical line a careful hand-fit approximates, by testing every tilt for the smallest squared gaps.",
      "Slope is always the rate of change; the intercept is always the value when the input is zero."
    ],
    teaser: "next: how GOOD is a fit — residuals, and the number that grades a line's fit at a glance."
  },
  remedial: {
    conceptTag: "dm-fit-and-read",
    concept: { id: "rem-dfr-c", kind: "concept", body: "Rewind. In y = mx + b, m is the SLOPE — how much y changes for one more unit of x — and b is the INTERCEPT, the value of y when x is 0. They answer two different questions: m answers 'how fast', b answers 'starting where'." },
    check: {
      id: "rem-dfr-k", kind: "check", body: "", conceptTag: "dm-fit-and-read",
      explanationVariants: ["In y = 3x + 10, the slope is the number multiplying x: 3.", "The intercept stands alone; the slope multiplies x."],
      widget: num("In the equation y = 3x + 10, what is the slope?", 3,
        [[10, "10 is the intercept — the value when x = 0. The slope multiplies x: 3."],
         [13, "13 adds them together. The slope is just the number in front of x: 3."]],
        "The number multiplying x is the slope: 3.")
    }
  }
});

/* ============================================================ dm-02-02: S-ID.B.6b, S-ID.C.8 */

const dm0202 = lesson({
  id: "dm-02-02", slug: "residuals-and-correlation", title: "How Good Is the Fit? Residuals and Correlation",
  courseId: "data-and-models", chapterId: "ch2-modeling-with-two-variables", minutes: 12,
  standards: ["S-ID.B.6b", "S-ID.C.8"], tag: "dm-residual-correlation",
  c1: {
    figure: "dm-residual-gap-intro",
    body: "Once a line is fitted, every point has a **residual**: its actual value minus what the line predicted. A point above the line has a positive residual; a point below has a negative one. Small residuals, scattered on both sides, mean the line is doing its job."
  },
  i1: {
    predict: predict("The hours-studied scatter clusters tightly around its fitted line. Will the residuals mostly be small, or mostly be large?",
      [["small", "Small — the points hug the line closely"], ["large", "Large — a tight cluster still leaves big gaps"]], "small",
      "Small. A tight cluster around the line means every point's actual value is close to what the line predicted — that closeness IS what a small residual is."),
    body: "Refit the hours-vs-score line from before.",
    widget: {
      type: "scatterFit", prompt: "Fit the line again: hours studied (x) versus test score (y).",
      points: [[1, 65], [2, 71], [3, 74], [4, 79], [5, 86], [6, 89]],
      xMin: 0, xMax: 7, yMin: 55, yMax: 95, tolerance: 0.4,
      mMin: -2, mMax: 8, mStep: 0.5, mStart: 0, bMin: 40, bMax: 80, bStep: 2, bStart: 50,
      successFeedback: "y = 5x + 60 again. Now look at the gaps: none of the six points sit far from this line — the whole point of fitting well is keeping every one of those gaps small.",
      slopeFeedback: "The tilt is off for this trend.",
      offsetFeedback: "The tilt is right; slide the line toward the middle of the cloud."
    }
  },
  k1: {
    body: "Compute one point's residual directly.",
    variants: ["At x = 3, predicted is 5(3)+60 = 75; actual is 74; residual is 74 − 75 = −1.", "Residual is always actual minus predicted, in that order."],
    widget: num("At x = 3, the line predicts y = 5(3) + 60 = 75, but the actual score was 74. What is the residual?", -1,
      [[1, "1 has the right size but the wrong sign — actual (74) is BELOW predicted (75), so the residual is negative."],
       [75, "75 is the predicted value itself, not the gap. Residual = actual − predicted = 74 − 75."]],
      "74 − 75 = −1.")
  },
  k2: {
    body: "Read what a residual's size says.",
    variants: ["A residual near 0 means the line predicted that point almost exactly.", "The residual's SIZE (distance from 0) is what measures the miss — sign just says which direction."],
    widget: mcq("A residual of −1, compared to a residual of −15 on the same scale, tells you the line's prediction was:", [
      ["a", "Much closer for the −1 point than the −15 point", true, "Smaller size means a smaller miss. −1 is a near-exact prediction; −15 is a much bigger gap, even though both are negative."],
      ["b", "Equally close, since both are negative", false, "Sign only says WHICH side of the line the point fell on. Size is what measures how far off the prediction was."],
      ["c", "Worse for the −1 point", false, "Backwards — a residual's magnitude is the miss; 1 is a smaller miss than 15."],
      ["d", "Impossible to compare without more information", false, "The two numbers alone are enough: compare their sizes directly."]
    ])
  },
  c2: {
    figure: "dm-correlation-scale",
    body: "Checking every residual by hand doesn't scale. The **correlation coefficient**, r, compresses that whole pattern into one number from −1 to 1: close to ±1 means the residuals are tiny and the points hug the line; close to 0 means the points are scattered with barely any linear trend at all. The sign matches the slope's direction; the SIZE says how strong the relationship is."
  },
  i2: {
    body: "A noisier dataset, same rough upward trend. Fit what you can.",
    widget: {
      type: "scatterFit", prompt: "Fit a line to this noisier upward trend.",
      points: [[1, 60], [2, 75], [3, 68], [4, 85], [5, 78], [6, 95]],
      xMin: 0, xMax: 7, yMin: 50, yMax: 100, tolerance: 0.8,
      mMin: -2, mMax: 8, mStep: 0.5, mStart: 0, bMin: 40, bMax: 80, bStep: 2, bStart: 50,
      successFeedback: "A trend is there, but every point sits noticeably farther from the line than in the tidy dataset — bigger residuals throughout. That is exactly the picture of a WEAKER correlation, even with the same general direction.",
      slopeFeedback: "Keep adjusting — some tilt fits this noisier trend better than others, even if no tilt fits perfectly.",
      offsetFeedback: "Slide toward the middle of this messier cloud."
    }
  },
  k3: {
    body: "Compute r from the summary sums — the formula every calculator runs.",
    variants: ["r = [nΣxy − ΣxΣy] / √([nΣx² − (Σx)²][nΣy² − (Σy)²]) = [5(83) − 15(25)] / √([5(55) − 225][5(135) − 625]) = 40/50 = 0.8.",
      "Build the numerator and the two denominator pieces separately, then divide."],
    widget: num("For 5 points: Σx=15, Σy=25, Σxy=83, Σx²=55, Σy²=135. Compute r using r = [nΣxy−ΣxΣy] / √([nΣx²−(Σx)²][nΣy²−(Σy)²]). (2 decimals)", 0.8,
      [[1.6, "1.6 skips the square root in the denominator — divide by √(50×50), not by 50 alone before rooting."],
       [40, "40 is only the numerator. Finish by dividing by the square-rooted denominator: 40/50."]],
      "Numerator 5(83)−15(25)=40. Denominator √([5(55)−225][5(135)−625])=√(50×50)=50. r=40/50=0.8.")
  },
  ch1: {
    body: "Strength is about size, not sign.",
    variants: ["|−0.95| = 0.95 > 0.8, so the negative correlation is actually the STRONGER relationship.",
      "Compare magnitudes to judge strength; the sign only says which direction."],
    hints: ["Strip both correlations down to their absolute values before comparing.", "|0.8| = 0.8, and |−0.95| = 0.95.", "0.95 is bigger than 0.8 — the negative one is stronger, just pointed the other way."],
    widget: mcq("Dataset A has r = 0.8. Dataset B has r = −0.95. Which has the STRONGER linear relationship?", [
      ["b", "Dataset B — 0.95 in magnitude beats 0.8", true, "Strength is about |r|, the DISTANCE from 0 — 0.95 is farther from 0 than 0.8, so B's relationship is stronger, even though it runs in the opposite direction."],
      ["a", "Dataset A — positive is always stronger than negative", false, "Sign says direction, not strength. Compare the sizes: 0.95 beats 0.8, regardless of sign."],
      ["c", "They are equally strong since both are 'high'", false, "0.8 and 0.95 are not equal — 0.95 is closer to 1, meaning a tighter fit."],
      ["d", "Cannot compare a positive and a negative correlation", false, "Comparing magnitudes works precisely because it strips the sign away first."]
    ])
  },
  recap: {
    body: "Grading a fit: one gap at a time, then all at once.",
    takeaways: [
      "A residual is actual minus predicted for ONE point — positive above the line, negative below.",
      "The correlation coefficient r, from −1 to 1, summarizes every residual's pattern into a single strength score.",
      "Strength is |r|, the distance from 0 — sign only tells you the direction of the trend."
    ],
    teaser: "next: what a model's slope and intercept mean depends on the story behind the numbers."
  },
  remedial: {
    conceptTag: "dm-residual-correlation",
    concept: { id: "rem-drc-c", kind: "concept", body: "Rewind. Residual = actual − predicted. If a point's actual value is 50 and the line predicted 45, the residual is 50 − 45 = 5: positive, because the point sits ABOVE the line." },
    check: {
      id: "rem-drc-k", kind: "check", body: "", conceptTag: "dm-residual-correlation",
      explanationVariants: ["Actual 30 minus predicted 34 is −4.", "Subtract predicted from actual, in that order, keeping the sign."],
      widget: num("A point's actual value is 30; the line predicted 34. What is the residual?", -4,
        [[4, "4 has the right size but the wrong sign — actual is BELOW predicted here, so the residual is negative."],
         [64, "64 adds them. Residual is actual MINUS predicted: 30 − 34."]],
        "30 − 34 = −4.")
    }
  }
});

/* ============================================================ dm-03-01: N-Q.A.3 */

const dm0301 = lesson({
  id: "dm-03-01", slug: "precision-in-reporting", title: "Precise Enough — But Not More",
  courseId: "data-and-models", chapterId: "ch3-precision-in-modeling", minutes: 10,
  standards: ["N-Q.A.3"], tag: "dm-precision",
  c1: {
    figure: "dm-least-precise-wins",
    body: "Every measurement has a limit to how finely it was taken. Combine two measurements — add them, subtract them, divide one by the other — and the result can be no MORE precise than the least precise input. A slope computed from whole-centimetre data cannot honestly claim five decimal places, however many the calculator displays."
  },
  i1: {
    predict: predict("A plant's height was measured to the nearest whole centimetre on five different days, then a growth rate was fitted. Should the reported slope have more decimal places than the height data, the same, or fewer?",
      [["same", "About the same — matching the data's own precision"], ["more", "More — decimals make it look more scientific"]], "same",
      "About the same. A calculated slope inherits its honest precision from the data that produced it — reporting more decimals than the input supports is precision the data never actually promised."),
    body: "Plant height (nearest cm) over 5 days. Fit the growth rate.",
    widget: {
      type: "scatterFit", prompt: "Fit a line to day (x) versus height in cm (y), each measured to the nearest whole cm.",
      points: [[1, 3], [2, 5], [3, 8], [4, 10], [5, 13]],
      xMin: 0, xMax: 6, yMin: 0, yMax: 16, tolerance: 0.6,
      mMin: -1, mMax: 4, mStep: 0.5, mStart: 0, bMin: -3, bMax: 3, bStep: 1, bStart: 0,
      successFeedback: "About 2.5 cm/day. That single extra decimal place is reasonable — one more digit than the whole-centimetre readings, not five.",
      slopeFeedback: "Adjust the tilt to follow this rising trend.",
      offsetFeedback: "The tilt is close; slide toward the cloud's centre."
    }
  },
  k1: {
    body: "Judge whether a reported precision is appropriate.",
    variants: ["The height data only supports whole centimetres, so a rate stretched to five decimals claims certainty the measurements never had.", "More decimal places is not automatically more correct — it can just be false precision."],
    widget: mcq("The fitted rate comes out to 2.5 cm/day. A report writes it as '2.50000 cm/day'. Is that appropriate?", [
      ["a", "No — the data was only measured to the nearest cm, so five decimals is false precision", true, "The height readings themselves were whole numbers. A rate built from them can be trusted to about one extra decimal, not five — the calculator's extra digits are noise, not information."],
      ["b", "Yes — more decimal places always means a more accurate answer", false, "The digits have to be EARNED by the data's own precision. A calculator will happily print digits the measurements never supported."],
      ["c", "No — it should be rounded to the nearest whole number instead", false, "Whole-cm inputs support roughly one extra decimal in a computed rate, which is more than zero decimals but far short of five."],
      ["d", "It doesn't matter as long as the number is correct", false, "A number can be arithmetically correct and still overstate its own precision — that overstatement is the actual problem here."]
    ])
  },
  k2: {
    body: "Apply the rule to a concrete sum.",
    variants: ["6 cm + 3.4 cm = 9.4 cm, but the whole-cm measurement caps the honest precision at the nearest whole cm: 9.", "Add normally, then round to the LESS precise measurement's precision, not the more precise one."],
    widget: num("A rectangle's sides are 6 cm (nearest cm) and 3.4 cm (nearest mm). Add them, then round to the LESS precise measurement's precision. What's the sum?", 9,
      [[9.4, "9.4 keeps the millimetre measurement's extra digit, which the whole-cm side can't back up. Round to the nearest whole cm: 9."],
       [3, "3 only uses one of the two measurements. Add both, then round: 6 + 3.4 = 9.4, rounds to 9."]],
      "6 + 3.4 = 9.4, rounded to the coarser whole-cm precision: 9.")
  },
  c2: {
    figure: "dm-false-precision",
    body: "The rule in one line: **a result is only as precise as its least precise input.** Add, subtract, multiply, or divide measurements together, and whichever one was measured most coarsely sets the ceiling for how many meaningful digits the answer can honestly claim — no arithmetic operation manufactures precision that wasn't in the data to begin with."
  },
  i2: {
    body: "A 240 mg sample (measured to the nearest 10 mg) loses mass over 5 measured intervals. Build the decay trend.",
    widget: {
      type: "distributionCompareLab", mode: "measure", tolerance: 0,
      prompt: "Two reported masses, 240 mg and 90 mg, both rounded to the nearest 10 mg. Their gap is 150 mg. Report the gap to a sensible precision: how many mg, to the nearest 10?",
      meanA: 240, meanB: 90, variability: 10, answer: 15,
      measureChoices: [
        { value: 150, feedback: "150 mg is the raw gap, correct as a value but stated to single-mg precision the 10 mg-rounded inputs don't support. In units of the 10 mg precision, that's 15." },
        { value: 15, feedback: "150 mg of gap, measured in units of the shared 10 mg precision, is 15 of those units — matching what both inputs can honestly support." },
        { value: 240, feedback: "240 is one of the original masses, not the gap between them." }
      ],
      successFeedback: "15 units of 10 mg each — 150 mg, reported no finer than the measurements that produced it. The gap can't be more precise than the numbers that made it.",
      fallbackFeedback: "150 mg ÷ 10 mg-per-unit = 15."
    }
  },
  k3: {
    body: "Apply the least-precise-wins rule to a new pair.",
    variants: ["18 cm (nearest cm) and 7.2 cm (nearest mm): the difference can only be trusted to the nearest cm, since that is the coarser input.", "Find the coarsest input's precision, then hold the answer to that."],
    widget: num("A wall is 18 cm long (nearest cm) and a shelf is 7.2 cm (nearest mm). Report their difference to the LESS precise measurement's precision — the nearest whole cm.", 11,
      [[10.8, "10.8 keeps the shelf's finer millimetre precision, which the whole-cm wall measurement can't back up. Round to the nearest cm: 11."],
       [25.2, "25.2 adds the lengths instead of subtracting them."]],
      "18 − 7.2 = 10.8, rounded to the coarser cm precision: 11.")
  },
  ch1: {
    body: "Spot false precision in the wild.",
    variants: ["A odometer reading to the nearest tenth of a mile cannot support a claimed 8-decimal average speed — the input's coarseness caps the output's.",
      "However many digits a calculator shows, the input measurement's precision is still the ceiling."],
    hints: ["Look at how precisely the DISTANCE was actually measured.", "Tenths of a mile is roughly one extra decimal of trustworthy precision in a computed rate, not eight.", "The display showing more digits doesn't mean those digits are meaningful."],
    widget: mcq("A car's trip odometer reads distance to the nearest 0.1 mile. A phone app computes average speed as '47.28193651 mph'. What's wrong?", [
      ["a", "The distance was only measured to one decimal place, so the speed shouldn't claim eight", true, "The 0.1-mile odometer is the precision ceiling. A computed rate can reasonably carry one extra digit of confidence, not eight — the phone is just displaying every digit its calculator produced, meaningful or not."],
      ["b", "Nothing is wrong — more decimals means a more exact answer", false, "The extra decimals are computational noise, not real information, once the input's own coarseness is accounted for."],
      ["c", "The speed should be a whole number with no decimals at all", false, "Some extra precision beyond the input is reasonable in a computed rate — the problem is EIGHT decimals, not any decimals."],
      ["d", "The odometer must be broken if the app shows that many digits", false, "The odometer is fine — the app is simply reporting more digits than the input can honestly support."]
    ])
  },
  recap: {
    body: "A result can't be more precise than its least precise ingredient.",
    takeaways: [
      "Combining measurements — adding, subtracting, computing a rate — never manufactures precision beyond the coarsest input.",
      "A calculator's extra displayed digits are not automatically meaningful; they can be pure noise past what the data supports.",
      "Match a reported result's precision to the LEAST precise measurement that built it, not the most precise."
    ],
    teaser: "That closes this course: describing data, fitting and grading a model, and reporting it honestly."
  },
  remedial: {
    conceptTag: "dm-precision",
    concept: { id: "rem-dp-c", kind: "concept", body: "Rewind. If one measurement is precise to the nearest whole unit and another to the nearest tenth, a result built from BOTH can only be trusted to the COARSER of the two — the whole unit, not the tenth." },
    check: {
      id: "rem-dp-k", kind: "check", body: "", conceptTag: "dm-precision",
      explanationVariants: ["The coarser measurement (nearest whole cm) sets the limit, so 5 cm is the honest precision.", "Match the LEAST precise input, always."],
      widget: mcq("One length is measured to the nearest cm (5 cm); another to the nearest mm (3.2 cm). Their sum should be reported to the nearest:", [
        ["a", "Whole cm — matching the coarser measurement", true, "The 5 cm reading is the weaker link; the sum can't be trusted beyond what THAT measurement supports."],
        ["b", "Millimetre — matching the finer measurement", false, "The finer measurement doesn't rescue the coarser one; the coarser one still caps the result."]
      ])
    }
  }
});

/* ============================================================ fna-06-01: F-IF.C.9 */

const fna0601 = lesson({
  id: "fna-06-01", slug: "comparing-functions-across-representations", title: "Comparing Functions Across Representations",
  courseId: "function-analysis", chapterId: "ch6-comparing-representations", minutes: 11,
  standards: ["F-IF.C.9"], tag: "fna-compare-reps",
  c1: {
    figure: "fna-compare-representations",
    body: "A function can arrive as a graph, a table of input-output pairs, or an equation — three doors into the same room. Comparing two functions' properties (which grows faster, which has the bigger intercept) means finding that property in EACH representation, even though the representations look nothing alike."
  },
  i1: {
    predict: predict("f(x) = x² is graphed near x = 2. A second function g is given only as a table with a CONSTANT rate of 3 per step. Will f's instantaneous rate at x = 2 be bigger or smaller than g's constant rate of 3?",
      [["bigger", "Bigger — f is accelerating by x = 2"], ["smaller", "Smaller — f started out slower"]], "bigger",
      "Bigger. f(x) = x² grows faster and faster as x increases; by x = 2 its instantaneous rate has already overtaken a steady rate of 3, even though f started out slower near x = 0."),
    body: "Trace f(x) = x² to x = 2 and read its instantaneous rate there.",
    widget: {
      type: "derivativeTrace", fn: "square", mode: "slope", targetSlope: 4, targetX: 2, start: 0,
      prompt: "Trace f(x) = x² until the tangent's slope at x = 2 reads its true value.",
      successFeedback: "Slope 4 at x = 2, since f′(x) = 2x. That is bigger than a steady rate of 3 — f has already sped past it by this point, exactly as a curving-upward graph should.",
      lowFeedback: "The tangent is still shallower than the true slope at x = 2.",
      highFeedback: "The tangent has gone past the true slope at x = 2."
    }
  },
  k1: {
    body: "Find g's rate from its table.",
    variants: ["g's rate is constant: (13−10)/(2−1) = 3 between any two consecutive rows.", "A table's rate of change is (change in y) ÷ (change in x) between two rows."],
    widget: num("g is given by the table (1,10), (2,13), (3,16). What is g's constant rate of change?", 3,
      [[13, "13 is one of the table's y-values, not the rate. Divide a change in y by the matching change in x."],
       [23, "23 adds two y-values. The rate is (13−10)/(2−1) = 3."]],
      "(13 − 10) ÷ (2 − 1) = 3.")
  },
  k2: {
    body: "Name which representation makes THIS comparison easiest.",
    variants: ["A table with equally-spaced x-values hands you the rate directly by subtraction — no tracing or graphing needed.", "Different representations are easier for different questions; a table is fastest here precisely because the rate is constant."],
    widget: mcq("For a function with a CONSTANT rate of change, which representation makes finding that rate fastest?", [
      ["a", "A table — subtract consecutive y-values directly", true, "With equal x-steps, the rate is just one subtraction away in a table — no graph to read, no equation to differentiate."],
      ["b", "A graph — always the fastest for any rate question", false, "A graph is often useful, but reading a precise rate off it takes more care than a clean subtraction in a table."],
      ["c", "None of the representations can show a rate of change", false, "Every representation CAN show it — the table just makes THIS particular case fastest."],
      ["d", "Only an equation can reveal a rate of change", false, "A table reveals a constant rate with a single subtraction — no equation required."]
    ])
  },
  c2: {
    figure: "fna-properties-anywhere",
    body: "The rate of change, an intercept, a maximum — these are facts ABOUT the function, not facts about whichever picture happens to be in front of you. The representation changes; the property doesn't. Comparing two functions is always comparing the SAME property, fished out of whatever representation each one is given in."
  },
  i2: {
    body: "Trace f(x) = x² to x = 3 and read its value there.",
    widget: {
      type: "derivativeTrace", fn: "square", mode: "point", targetX: 3, start: 0,
      prompt: "Trace f(x) = x² to x = 3 and read the height.",
      successFeedback: "f(3) = 9. Compare that with g(3) = 3(3) − 1 = 8, computed straight from the equation — two different representations, one clean comparison, with f edging ahead.",
      lowFeedback: "Still short of x = 3.",
      highFeedback: "Past x = 3 now."
    }
  },
  k3: {
    body: "Evaluate g directly from its equation.",
    variants: ["g(3) = 3(3) − 1 = 8.", "Substitute x = 3 into the equation and simplify."],
    widget: num("Using g(x) = 3x − 1, what is g(3)?", 8,
      [[9, "9 skips the −1. 3(3) = 9, then subtract 1: 8."],
       [2, "2 computes 3 − 1 without the coefficient. Multiply first: 3(3) − 1 = 8."]],
      "3(3) − 1 = 8.")
  },
  ch1: {
    body: "Rank a property across three genuinely different representations.",
    variants: ["The equation's y-intercept is read at x=0 directly; the table's is the y-value where x=0 appears as a row; the graph's is where the curve crosses the vertical axis — three different LOOKS, one comparable number each.",
      "Find each function's y-intercept in its own representation, then just compare the three numbers."],
    hints: ["For the equation, y-intercept is the value when x = 0.", "For the table, look for the row where x = 0 (or extend the pattern back to it).", "For the graph, it's where the curve crosses the vertical axis — read the height there."],
    widget: mcq("Function P: y = 2x + 7 (equation). Function Q: table showing (0,3), (1,5), (2,7). Function R: a graph crossing the y-axis at 10. Which has the SMALLEST y-intercept?", [
      ["a", "Q — its intercept is 3", true, "P's intercept is 7 (the equation's constant term). Q's is 3 (its x=0 row). R's is 10 (read off the graph). 3 is the smallest of the three."],
      ["b", "P — its intercept is 7", false, "7 isn't the smallest — Q's intercept of 3 is lower."],
      ["c", "R — its intercept is 10", false, "10 is the LARGEST of the three, not the smallest."],
      ["d", "They cannot be compared across different representations", false, "That is exactly what this lesson is for — each representation still hands over the same property, ready to compare."]
    ])
  },
  recap: {
    body: "Same property, three doors in.",
    takeaways: [
      "A function's properties — rate of change, intercepts, values — exist independent of whether it's shown as a graph, table, or equation.",
      "Each representation has its own fastest way to extract a given property: subtraction in a table, substitution in an equation, tracing on a graph.",
      "Comparing two functions means finding the SAME property in each one's own representation, then comparing the numbers directly."
    ],
    teaser: "next chapter: restricting a domain to build an inverse."
  },
  remedial: {
    conceptTag: "fna-compare-reps",
    concept: { id: "rem-fcr-c", kind: "concept", body: "Rewind. A table's rate of change between two rows is (change in y) divided by (change in x) — exactly the same idea as a graph's slope, just read from numbers instead of a picture." },
    check: {
      id: "rem-fcr-k", kind: "check", body: "", conceptTag: "fna-compare-reps",
      explanationVariants: ["(20−12)/(2−0) = 4.", "Subtract the y-values, subtract the matching x-values, then divide."],
      widget: num("A table shows (0,12) and (2,20). What is the rate of change?", 4,
        [[8, "8 is the change in y alone (20−12), without dividing by the change in x (2)."],
         [32, "32 adds the two y-values. Rate of change is (change in y) ÷ (change in x): (20−12)/(2−0) = 4."]],
        "(20 − 12) ÷ (2 − 0) = 4.")
    }
  }
});

/* ============================================================ sy-06-01: G-SRT.A.1a */

const sy0601 = lesson({
  id: "sy-06-01", slug: "dilations-and-parallel-lines", title: "Dilations and Parallel Lines",
  courseId: "similarity", chapterId: "ch6-the-parallel-line-theorem", minutes: 10,
  standards: ["G-SRT.A.1a"], tag: "sy-dilation-parallel",
  c1: {
    figure: "sy-dilation-parallel",
    body: "A dilation stretches everything away from (or toward) one fixed **centre**, by the scale factor k. When a line segment does NOT pass through the centre, dilating it produces a new segment that is longer or shorter — but always running exactly **parallel** to the original. That parallelism is not a coincidence; it is what a dilation always does to a line it doesn't touch."
  },
  i1: {
    predict: predict("A rectangle sits away from the centre of dilation. After dilating by k = 2, will its sides still be parallel to the original rectangle's sides?",
      [["yes", "Yes — dilation preserves the direction of every line not through the centre"], ["no", "No — stretching would tilt the sides"]], "yes",
      "Yes. Every side of the rectangle avoids the centre, so every side comes out parallel to where it started — only the LENGTHS change, never the directions."),
    body: "Dilate the rectangle from the origin by a factor of 2.",
    widget: {
      type: "dilationExplore", shape: [[2, 3], [5, 3], [5, 6], [2, 6]], center: [0, 0],
      targetK: 2, kMin: 0.5, kMax: 3, kStep: 0.5, kStart: 1, gridMin: 0, gridMax: 14,
      showRatios: ["length"],
            prompt: "Scale the rectangle to twice its size.",
      successFeedback: "k = 2 — every side doubled in length, and every side still runs in exactly the same direction as before. Watch the bottom side: 3 units long, now 6, still perfectly horizontal.",
      lowFeedback: "The rectangle is smaller than twice the original.",
      highFeedback: "The rectangle is larger than twice the original."
    }
  },
  k1: {
    body: "Compute a scaled length directly.",
    variants: ["A 3-unit side scales to 3 × 2 = 6 under k = 2.", "Every length multiplies by k; direction never changes."],
    widget: num("The rectangle's bottom side is 3 units long. After dilating by k = 2, how long is the image's bottom side?", 6,
      [[5, "5 adds 2 to the original length instead of MULTIPLYING by the scale factor: 3 × 2 = 6."],
       [1.5, "1.5 divides by 2. Scaling by k = 2 means multiplying: 3 × 2 = 6."]],
      "3 × 2 = 6.")
  },
  k2: {
    body: "Separate what a dilation changes from what it preserves.",
    variants: ["Dilation changes lengths but preserves every angle — the shape looks identical, just resized.", "Angles are untouched by a pure scale change; only distances stretch or shrink."],
    widget: mcq("Does dilating a shape change its ANGLES?", [
      ["a", "No — angles stay exactly the same; only lengths change", true, "A dilation is a pure resize: every distance scales by k, but every angle is preserved exactly. That is why the dilated shape still LOOKS like the original, just bigger or smaller."],
      ["b", "Yes — larger shapes always have larger angles", false, "Angle measure has nothing to do with size — a huge triangle and a tiny one can share identical angles, which is exactly what similarity means."],
      ["c", "Only the angle at the centre of dilation changes", false, "Every angle stays fixed under a dilation, including any angle measured at the centre — only distances from the centre are affected, never angle measures."],
      ["d", "It depends on the scale factor", false, "Angles are preserved for EVERY scale factor, whether k is large, small, or a fraction."]
    ])
  },
  c2: {
    figure: "dilation-scale",
    body: "The parallel-line property doesn't depend on stretching versus shrinking, or on where exactly the centre sits. Whether k is greater than 1 (enlarging) or between 0 and 1 (reducing), any segment that misses the centre comes out parallel to where it started — the theorem holds across the whole range of scale factors."
  },
  i2: {
    body: "Dilate the same rectangle by a factor of 0.5 this time.",
    widget: {
      type: "dilationExplore", shape: [[2, 3], [5, 3], [5, 6], [2, 6]], center: [0, 0],
      targetK: 0.5, kMin: 0, kMax: 3, kStep: 0.5, kStart: 2, gridMin: 0, gridMax: 14,
      showRatios: ["length"],
            prompt: "Scale the rectangle down to half its size.",
      successFeedback: "k = 0.5 — every side shrank to half its length, and every side is STILL parallel to the original. Enlarging or shrinking, the direction never turns.",
      lowFeedback: "Smaller than half the original size.",
      highFeedback: "Larger than half the original size."
    }
  },
  k3: {
    body: "Compute a shrunk length.",
    variants: ["3 × 0.5 = 1.5.", "Multiplying by a scale factor under 1 shrinks the length."],
    widget: num("The same 3-unit side, dilated by k = 0.5, has what new length?", 1.5,
      [[6, "6 is 3 × 2, using the wrong scale factor. This dilation uses k = 0.5: 3 × 0.5 = 1.5."],
       [2.5, "2.5 subtracts 0.5 instead of multiplying by it. Length × k: 3 × 0.5 = 1.5."]],
      "3 × 0.5 = 1.5.")
  },
  ch1: {
    body: "Test whether the theorem depends on the centre's location.",
    variants: ["The theorem never mentioned WHERE the centre sits — only that the segment must avoid it. Moving the centre changes nothing about the conclusion.",
      "Re-read what the theorem actually requires: a segment not through the centre, any centre."],
    hints: ["What does the parallel-line theorem actually require about the centre's position?", "It only says the SEGMENT must not pass through the centre — it places no restriction on where the centre itself is.", "So moving the centre elsewhere still leaves the theorem's condition satisfied."],
    widget: mcq("A dilation uses a centre that is NOT at the origin — somewhere else entirely. Does the parallel-line theorem still apply to a segment that avoids that centre?", [
      ["a", "Yes — the theorem only requires the segment to miss the centre, wherever the centre is", true, "Nothing in the theorem singles out the origin — 'not through the centre' is the only condition, and it's satisfied for any centre location, not just (0,0)."],
      ["b", "No — the theorem only works when the centre is at the origin", false, "The origin was just a convenient choice for the examples here. The theorem's condition is about the segment missing the centre, not about which point the centre happens to be."],
      ["c", "It depends on the scale factor used", false, "The scale factor changes the LENGTH, not whether the parallel property holds — that only depends on the segment missing the centre."],
      ["d", "Only if the centre is inside the original shape", false, "The centre's position relative to the shape doesn't matter — only whether the specific segment being dilated passes through it."]
    ])
  },
  recap: {
    body: "Miss the centre, stay parallel — always.",
    takeaways: [
      "A segment not passing through the centre of dilation comes out parallel to its original direction.",
      "Dilation changes every length by the scale factor k, but preserves every angle exactly.",
      "The parallel property holds for any scale factor and any centre — the only requirement is that the segment misses the centre."
    ],
    teaser: "next chapter: applying similarity to indirect measurement."
  },
  remedial: {
    conceptTag: "sy-dilation-parallel",
    concept: { id: "rem-sdp-c", kind: "concept", body: "Rewind. Dilating multiplies every length by the scale factor k. A 4-unit segment dilated by k = 3 becomes 4 × 3 = 12 units — and it still points the same direction it always did." },
    check: {
      id: "rem-sdp-k", kind: "check", body: "", conceptTag: "sy-dilation-parallel",
      explanationVariants: ["4 × 3 = 12.", "Multiply the original length by the scale factor."],
      widget: num("A 4-unit segment is dilated by a scale factor of 3. What is its new length?", 12,
        [[7, "7 adds 3 to the length instead of multiplying by it: 4 × 3 = 12."],
         [1.33, "1.33 divides by 3. A scale factor of 3 MULTIPLIES: 4 × 3 = 12."]],
        "4 × 3 = 12.")
    }
  }
});

/* ============================================================ cr-06-01: G-C.A.1 */

const cr0601 = lesson({
  id: "cr-06-01", slug: "why-all-circles-are-similar", title: "Why All Circles Are Similar",
  courseId: "circle-theorems", chapterId: "ch6-all-circles-are-similar", minutes: 10,
  standards: ["G-C.A.1"], tag: "cr-circles-similar",
  c1: {
    figure: "cr-circle-scaling",
    body: "For similarity, most shapes need conditions checked — matching angles, proportional sides. A circle needs none of that. Every circle's circumference is 2πr and every circle's area is πr² — the SAME two formulas, for every circle there is. Only the radius changes from one circle to the next, and that single number is enough to connect any two circles by exactly one dilation."
  },
  i1: {
    predict: predict("A circle's radius doubles, from 4 to 8. In the circumference formula C = 2πr, will the '2r' part double as well, or grow some other way?",
      [["double", "Double — 2r is built directly from r, so it scales the same way r does"], ["other", "Some other way — formulas rarely scale that simply"]], "double",
      "Double. 2r is just 2 times r — whatever r does, 2r does right alongside it. Doubling r doubles 2r, no more and no less."),
    body: "A circle has radius 4. Before multiplying by π, what does the circumference formula's '2r' part equal?",
    widget: {
      type: "scaledCircleLab", prompt: "A circle has radius 4. In C = 2πr, what does 2r equal?",
      realRadius: 4, ask: "circumferenceCoef",
      choices: [
        { id: "correct", label: "8", value: 8, feedback: "2 × 4 = 8 — exactly the '2r' piece of the circumference formula, before π ever enters." },
        { id: "wrong-1", label: "4", value: 4, feedback: "4 is r by itself. The formula asks for 2r: 2 × 4 = 8." },
        { id: "wrong-2", label: "16", value: 16, feedback: "16 is 4² — that's the area formula's r² piece, not circumference's 2r." }
      ],
      fallbackFeedback: "2r means 2 times the radius: 2 × 4 = 8.",
      successFeedback: "8. Circumference is always 2πr — this '2r' piece is a straight multiple of r, which is exactly why circumference scales in lockstep with radius."
    }
  },
  k1: {
    body: "Apply the same formula piece to a new radius.",
    variants: ["2 × 6 = 12.", "2r is always double the radius, whatever the radius is."],
    widget: num("For a circle of radius 6, what does 2r equal?", 12,
      [[6, "6 is r alone. The formula piece is 2r: 2 × 6 = 12."],
       [36, "36 is 6², the AREA formula's r² piece, not circumference's 2r."]],
      "2 × 6 = 12.")
  },
  k2: {
    body: "Compare 2r across two different circles.",
    variants: ["Radius 9 is 3 times radius 3, and 2r follows exactly: 2(9) = 18 is 3 times 2(3) = 6.", "Whatever factor connects two radii, 2r scales by that exact same factor."],
    widget: mcq("Circle A has radius 3 (2r = 6). Circle B has radius 9, three times as large. What is Circle B's 2r?", [
      ["a", "18 — three times Circle A's 2r, matching the tripled radius", true, "2(9) = 18, and 18 is exactly 3 × 6. The '2r' piece scales by the SAME factor as the radius — always, for any two circles."],
      ["b", "6 — the same as Circle A", false, "2r depends on r. Circle B's radius is different (9, not 3), so its 2r is different too: 2(9) = 18."],
      ["c", "54 — nine times Circle A's 2r", false, "54 would match a SQUARED relationship (3² = 9 times), which is how area behaves, not circumference's linear 2r."],
      ["d", "12 — double Circle A's 2r", false, "The radius tripled, not doubled. 2r triples right along with it: 2(9) = 18."]
    ])
  },
  c2: {
    figure: "cr-linear-vs-quadratic",
    body: "Area's formula is πr² — built from r SQUARED, not r alone. That one difference changes everything about how it scales: double the radius and the '2r' piece doubles, but the 'r²' piece quadruples. Circumference and area are both built from the same radius, but they answer to that radius in genuinely different ways."
  },
  i2: {
    body: "Same circle, radius 4. This time, find the area formula's 'r²' piece.",
    widget: {
      type: "scaledCircleLab", prompt: "A circle has radius 4. In A = πr², what does r² equal?",
      realRadius: 4, ask: "areaCoef",
      choices: [
        { id: "correct", label: "16", value: 16, feedback: "4² = 16 — the 'r²' piece of the area formula, before π ever enters." },
        { id: "wrong-1", label: "8", value: 8, feedback: "8 is 2r, the CIRCUMFERENCE formula's piece. Area needs r squared: 4² = 16." },
        { id: "wrong-2", label: "4", value: 4, feedback: "4 is r alone, not r squared. 4² = 16." }
      ],
      fallbackFeedback: "r² means r multiplied by itself: 4 × 4 = 16.",
      successFeedback: "16. Area is always πr² — the 'r²' piece grows by the SQUARE of whatever the radius does, a fundamentally different rule from circumference's straight multiple."
    }
  },
  k3: {
    body: "Apply the area formula's piece to the same new radius as before.",
    variants: ["6² = 36.", "r² means r times itself."],
    widget: num("For a circle of radius 6, what does r² equal?", 36,
      [[12, "12 is 2r, the CIRCUMFERENCE piece. Area needs r squared: 6² = 36."],
       [6, "6 is r alone, not r squared. 6 × 6 = 36."]],
      "6 × 6 = 36.")
  },
  ch1: {
    body: "Compare how far each piece grew when the radius doubled.",
    variants: ["Radius 4→8: 2r went 8→16 (×2, matching the doubled radius); r² went 16→64 (×4, the SQUARE of that same factor).",
      "Track each piece's own growth factor separately, then compare the two factors."],
    hints: ["From radius 4 to radius 8, the 2r piece went from 8 to 16.", "Over the same change, the r² piece went from 16 to 64.", "16/8 = 2, but 64/16 = 4 — compare those two growth factors."],
    widget: mcq("Radius doubles from 4 to 8. The 2r piece goes from 8 to 16. The r² piece goes from 16 to 64. Which piece grew by the LARGER factor?", [
      ["a", "r² — it quadrupled, while 2r only doubled", true, "16 → 64 is ×4; 8 → 16 is only ×2. Doubling the radius quadruples area's r² piece but only doubles circumference's 2r piece — the k versus k² difference, made concrete."],
      ["b", "2r — it doubled, which is a bigger jump than quadrupling", false, "×4 (16→64) is a LARGER growth factor than ×2 (8→16), even though quadrupling sounds smaller in casual language than doubling."],
      ["c", "They grew by the same factor", false, "×2 and ×4 are different factors — r² grew by the square of what 2r grew by."],
      ["d", "Neither piece grew — only π would change the actual circumference or area", false, "π is a fixed constant that never changes; the growth shown here is entirely from the radius changing, in each piece's own way."]
    ])
  },
  recap: {
    body: "Two formulas built from the same radius, scaling in different ways.",
    takeaways: [
      "Circumference's '2r' piece is a straight multiple of r — it scales by exactly the same factor as the radius.",
      "Area's 'r²' piece is built from r squared — it scales by the SQUARE of whatever factor the radius scales by.",
      "Because π is the same universal constant for every circle, any two circles' measurements are connected by a single scale factor — which is exactly what makes every pair of circles similar, no conditions to check."
    ],
    teaser: "next chapter: inscribed and circumscribed circles of a triangle."
  },
  remedial: {
    conceptTag: "cr-circles-similar",
    concept: { id: "rem-ccs-c", kind: "concept", body: "Rewind. Circumference's formula piece is 2r — double the radius. Area's formula piece is r² — the radius multiplied by itself. For radius 5: 2r = 10, but r² = 25." },
    check: {
      id: "rem-ccs-k", kind: "check", body: "", conceptTag: "cr-circles-similar",
      explanationVariants: ["2 × 7 = 14.", "2r is double the radius, nothing more."],
      widget: num("For a circle of radius 7, what does 2r equal?", 14,
        [[49, "49 is 7² — that's the AREA piece. Circumference's piece is 2r: 2 × 7 = 14."],
         [7, "7 is r alone. The piece asked for is 2r: 2 × 7 = 14."]],
        "2 × 7 = 14.")
    }
  }
});

/* ============================================================ patch assembly */

const dataAndModelsCourse = {
  id: "data-and-models", slug: "data-and-models", title: "Data & Models",
  tagline: "Describing one dataset, comparing two, fitting a line, grading how well it fits, and reporting the result no more precisely than it deserves.",
  category: "Math", gradeLevel: 9,
  chapters: [
    { id: "ch1-describing-data", title: "Describing Data", lessonIds: ["dm-01-01"] },
    { id: "ch2-modeling-with-two-variables", title: "Modeling with Two Variables", lessonIds: ["dm-02-01", "dm-02-02"] },
    { id: "ch3-precision-in-modeling", title: "Precision in Modeling", lessonIds: ["dm-03-01"] }
  ]
};

const patch = {
  label: "S203V — twelve missing HS standards, all authored to Tier A: new course data-and-models (S-ID.A/B/C, N-Q.A.3) plus three singleton lessons (F-IF.C.9, G-SRT.A.1a, G-C.A.1)",
  totalLessons: 7,
  courses: [
    { slug: "data-and-models", grade: 9, course: dataAndModelsCourse, lessons: [dm0101, dm0201, dm0202, dm0301] }
  ],
  chapterInsertions: [
    {
      courseSlug: "function-analysis",
      chapter: { id: "ch6-comparing-representations", title: "Comparing Representations", lessonIds: ["fna-06-01"] },
      position: { after: "ch5-inverses-formalized" },
      lessons: [fna0601]
    },
    {
      courseSlug: "similarity",
      chapter: { id: "ch6-the-parallel-line-theorem", title: "The Parallel-Line Theorem", lessonIds: ["sy-06-01"] },
      position: { after: "ch5-applications" },
      lessons: [sy0601]
    },
    {
      courseSlug: "circle-theorems",
      chapter: { id: "ch6-all-circles-are-similar", title: "All Circles Are Similar", lessonIds: ["cr-06-01"] },
      position: { after: "ch5-arcs-sectors-cyclic" },
      lessons: [cr0601]
    }
  ],
  pathEdges: [
    { from: "bivariate-statistics", to: "data-and-models" },
    { from: "data-and-models", to: "statistical-inference" }
  ]
};

mkdirSync(join(root, "content/patches"), { recursive: true });
const out = join(root, "content/patches/s203v-hs-standards-closure.json");
writeFileSync(out, JSON.stringify(patch, null, 2) + "\n");
console.log(`wrote ${out}`);
console.log(`  new course: data-and-models, 4 lessons`);
console.log(`  chapter insertions: 3 (function-analysis, similarity, circle-theorems)`);
console.log(`  total: 7 lessons, 12 standards`);
