#!/usr/bin/env node
/**
 * Builds content/patches/s203f-closing.json — Batch F, the last of Wave 1.
 *
 * TARGETS — the final three uncovered CCSS sub-standards in grades 6-8:
 *   6.RP.A.3a  make tables of equivalent ratios and PLOT THE PAIRS on the coordinate plane.
 *              The coordinate plane is taught in G6 `number-system`, but never inside
 *              `ratios-rates`; plotting a ratio relationship first appeared a year late in G7.
 *   6.NS.C.6b  understand signs of numbers in ordered pairs, and recognise that two pairs
 *              differing only by signs are reflections across one or both axes.
 *   7.RP.A.2c  represent a proportional relationship by an equation, y = kx.
 *
 * HABIT 3 — the pinned audits were checked BEFORE authoring, and they shaped the plan:
 *   `proportional-reasoning-s144` compares whole non-widget lesson skeletons for five fixed
 *   targets — rr-03-02, rr-03-03, rr-05-03, pr-02-01, pr-02-03. Any seam edit on one of those
 *   would trip it exactly the way S203D's esn-01-03 tripped s145. So each insertion is placed
 *   where its predecessor is NOT a target:
 *     ratios-rates              after ch2-ratio-tables      -> seam rr-02-03  (safe)
 *     number-system             after ch4-below-zero        -> seam ns-04-03  (safe)
 *     proportional-relationships after ch3-graphs...        -> seam pr-03-03  (safe)
 *   Each placement is also the right pedagogical seam: tables -> plot the pairs -> unit rates;
 *   four quadrants -> signs and reflections -> absolute value; table -> graph -> equation.
 *
 * ENGINES (all manip >= 2, per HANDOVER §12):
 *   plotPoint                manip 3 — carries both G6 lessons. Grid coordinates are 1-BASED
 *                            indices into xLabels/yLabels, not the labelled values.
 *   ratioTable               manip 2 — the table half of 6.RP.A.3a.
 *   proportionalReasoningLab manip 3 — s144 is scoped to five fixed lessons, so new usages
 *                            elsewhere are safe.
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function lesson({ id, slug, title, courseId, chapterId, minutes, standards, tag, c1, i1, k1, k2, c2, i2, k3, ch1, recap, remedial }) {
  return {
    id, slug, title, courseId, chapterId, minutes, standards,
    steps: [
      { id: "c1", kind: "concept", body: c1.body, figure: c1.figure },
      { id: "i1", kind: "interactive", body: i1.body, widget: i1.widget },
      { id: "k1", kind: "check", body: k1.body, conceptTag: tag, explanationVariants: k1.variants, widget: k1.widget },
      { id: "k2", kind: "check", body: k2.body, conceptTag: tag, explanationVariants: k2.variants, widget: k2.widget },
      { id: "c2", kind: "concept", body: c2.body, figure: c2.figure },
      { id: "i2", kind: "interactive", body: i2.body, widget: i2.widget },
      { id: "k3", kind: "check", body: k3.body, conceptTag: tag, explanationVariants: k3.variants, widget: k3.widget },
      { id: "ch1", kind: "challenge", body: ch1.body, conceptTag: tag, explanationVariants: ch1.variants, hints: ch1.hints, widget: ch1.widget },
      { id: "r1", kind: "recap", body: recap.body, takeaways: recap.takeaways, teaser: recap.teaser }
    ],
    remedials: remedial ? [remedial] : []
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
/** A 7x7 grid labelled -3..3; plotPoint targets are 1-BASED indices into those label arrays. */
const AXIS = ["-3", "-2", "-1", "0", "1", "2", "3"];
const idx = (v) => AXIS.indexOf(String(v)) + 1;
const plotSigned = (prompt, x, y, errs, success, miss) => ({
  type: "plotPoint", prompt, cols: 7, rows: 7, xLabels: AXIS, yLabels: AXIS,
  targets: [{ x: idx(x), y: idx(y) }],
  pointErrors: errs.map(([ex, ey, feedback]) => ({ x: idx(ex), y: idx(ey), feedback })),
  missFeedback: miss,
  successFeedback: success
});
/** A first-quadrant grid 0..6 for plotting ratio pairs. */
const QUAD1 = ["0", "1", "2", "3", "4", "5", "6"];
const q1 = (v) => QUAD1.indexOf(String(v)) + 1;
const plotRatio = (prompt, x, y, errs, success, miss) => ({
  type: "plotPoint", prompt, cols: 7, rows: 7, xLabels: QUAD1, yLabels: QUAD1,
  targets: [{ x: q1(x), y: q1(y) }],
  pointErrors: errs.map(([ex, ey, feedback]) => ({ x: q1(ex), y: q1(ey), feedback })),
  missFeedback: miss,
  successFeedback: success
});

/* ==================================================== 6.RP.A.3a — ratio pairs on the plane */

const rr02b01 = lesson({
  id: "rr-02b-01", slug: "ratio-pairs-on-the-coordinate-plane", title: "Ratio Pairs on the Plane",
  courseId: "ratios-rates", chapterId: "ch2b-ratios-on-the-plane", minutes: 11,
  standards: ["6.RP.A.3a"], tag: "ratio-pairs-plotted",
  c1: {
    figure: "rr6-table-to-plane",
    body: "A ratio table already holds pairs of numbers. The coordinate plane is just a second place to put them.\n\nThe row *1 cup, 2 scoops* becomes the point (1, 2). The row *2 cups, 4 scoops* becomes (2, 4). Nothing new is being measured — the same pairs are simply shown as positions instead of as rows."
  },
  i1: {
    body: "Carry one row across to the grid.",
    widget: plotRatio("A ratio table row reads 2 cups and 4 scoops. Plot that row as a point.", 2, 4,
      [[4, 2, "That is (4, 2) — the numbers are the right pair but in the wrong order. The cups go across (x) and the scoops go up (y)."],
       [2, 2, "That is (2, 2). The scoops value is 4, not 2 — read the second column."]],
      "(2, 4). The first number moves across, the second moves up — the table's two columns become the point's two coordinates.",
      "Read the row as (across, up): 2 cups goes right along the bottom, 4 scoops goes up.")
  },
  k1: {
    body: "Read a point back as a table row.",
    variants: [
      "The point (3, 6) means 3 cups and 6 scoops, so the second value is 6.",
      "The y-coordinate is the second column of the table."
    ],
    widget: num("On a cups-versus-scoops graph, a point sits at (3, 6). How many scoops does that row describe?", 6,
      [[3, "3 is the cups value, the x-coordinate. The scoops are the y-coordinate."],
       [9, "9 adds the coordinates. Each coordinate is read separately: 3 cups, 6 scoops."]],
      "The y-coordinate, 6, is the scoops column.")
  },
  k2: {
    body: "Plot the whole table and look at the shape.",
    variants: [
      "Equivalent ratios always land in a straight line that runs through the origin.",
      "Each pair scales by the same factor, so the points climb at a steady rate from (0, 0)."
    ],
    widget: mcq("The pairs (1, 2), (2, 4) and (3, 6) are all plotted. What do the points form?", [
      ["a", "A straight line through the origin", true, "Equivalent ratios climb at a constant rate, so the points line up and the line passes through (0, 0)."],
      ["b", "A curve that bends upward", false, "The scoops rise by the same 2 for every extra cup, so the climb is steady, not bending."],
      ["c", "A scattered cloud with no pattern", false, "These pairs share one ratio, which is exactly what makes them line up."],
      ["d", "A straight line that misses the origin", false, "0 cups needs 0 scoops, so (0, 0) is on the line too."]
    ])
  },
  c2: {
    figure: "proportional-line",
    body: "That line is worth pausing on. It passes through **(0, 0)** because zero cups need zero scoops — and it is straight because every extra cup adds the same number of scoops.\n\nOne point on it is especially useful: the point where x = 1. Its height is the **unit rate**, the amount per single cup, readable straight off the graph."
  },
  i2: {
    body: "Find the per-one point.",
    widget: plotRatio("The recipe uses 2 scoops per cup. Plot the point that shows ONE cup.", 1, 2,
      [[2, 1, "That is (2, 1) — one scoop for two cups. The question asks for one CUP, so the x-coordinate is 1."],
       [2, 4, "That is (2, 4), the two-cup row. The point for a single cup sits at x = 1."]],
      "(1, 2). The height above x = 1 is the unit rate — 2 scoops for every single cup — read directly off the graph.",
      "One cup means x = 1. Move one step right, then up to the matching number of scoops.")
  },
  k3: {
    body: "Read a rate from a plotted point.",
    variants: [
      "The point (1, 5) sits above x = 1, so the unit rate is 5 per one.",
      "The height at x = 1 is the amount for a single unit."
    ],
    widget: num("A proportional graph passes through (1, 5). What is the unit rate?", 5,
      [[1, "1 is the x-coordinate — one unit of the input. The rate is how high the line sits there: 5."],
       [6, "6 adds the coordinates. The unit rate is the y-value at x = 1, which is 5."]],
      "At x = 1 the line is 5 high, so the rate is 5 per one.")
  },
  ch1: {
    body: "Spot the pair that does not belong.",
    variants: [
      "(1, 3), (2, 6) and (4, 12) all have y ÷ x = 3, but (3, 8) gives 8 ÷ 3, which is not 3 — so it is off the line.",
      "Divide each y by its x: three of them give 3 and one does not."
    ],
    hints: [
      "For each pair, divide the second number by the first.",
      "(1,3) gives 3, (2,6) gives 3, (4,12) gives 3 — check the remaining one.",
      "8 ÷ 3 is not 3, so (3, 8) does not sit on the same line."
    ],
    widget: mcq("Three of these pairs lie on one line through the origin. Which one does NOT?", [
      ["a", "(3, 8)", true, "8 ÷ 3 is not 3, while every other pair gives exactly 3 — so this point sits off the line."],
      ["b", "(1, 3)", false, "3 ÷ 1 = 3, which matches the others."],
      ["c", "(2, 6)", false, "6 ÷ 2 = 3, the same ratio as the others, so this point does sit on the line."],
      ["d", "(4, 12)", false, "12 ÷ 4 = 3 — on the line."]
    ])
  },
  recap: {
    body: "The same pairs, shown as positions.",
    takeaways: [
      "Each row of a ratio table plots as a point: first column across, second column up.",
      "Equivalent ratios land in a straight line through the origin.",
      "The height of that line at x = 1 is the unit rate."
    ],
    teaser: "next chapter: the per-one row itself — unit rates and what they let you predict."
  },
  remedial: {
    conceptTag: "ratio-pairs-plotted",
    concept: { id: "rem-rpp-c", kind: "concept", body: "Rewind. A point is written (across, up). The first number is how far right, the second is how far up — so a table row of 3 cups and 6 scoops is the point (3, 6)." },
    check: {
      id: "rem-rpp-k", kind: "check", body: "", conceptTag: "ratio-pairs-plotted",
      explanationVariants: ["The first coordinate is the across value, so 5 cups gives x = 5.", "In (5, 10) the 5 is the cups and the 10 is the scoops."],
      widget: num("A table row reads 5 cups and 10 scoops. As a point (x, y), what is x?", 5,
        [[10, "10 is the scoops, which is the y-coordinate. The cups go across, as x."],
         [15, "15 adds them. The two columns become the two coordinates separately."]],
        "The first column, cups, is the x-coordinate: 5.")
    }
  }
});

/* ==================================================== 6.NS.C.6b — signs and reflections */

const ns04b01 = lesson({
  id: "ns-04b-01", slug: "signs-and-reflections-of-ordered-pairs", title: "Signs, and What a Flip Does to Them",
  courseId: "number-system", chapterId: "ch4b-signs-and-reflections", minutes: 11,
  standards: ["6.NS.C.6b"], tag: "ordered-pair-signs",
  c1: {
    figure: "tf-quadrant-signs",
    body: "A point's two signs say which quadrant it lives in, and you can read them off without plotting anything.\n\nPositive x means right of the vertical axis; positive y means above the horizontal one. So (+, +) is Quadrant I, (−, +) is II, (−, −) is III, and (+, −) is IV. The signs *are* the address."
  },
  i1: {
    body: "Put a point where its signs say it belongs.",
    widget: plotSigned("Plot the point (-2, 3).", -2, 3,
      [[2, 3, "That is (2, 3) — up in the right half. A NEGATIVE x means moving left of the vertical axis."],
       [-2, -3, "That is (-2, -3). The x is right, but a positive y goes ABOVE the horizontal axis, not below."],
       [3, -2, "That is (3, -2) — the coordinates have been swapped. The first number is the across value."]],
      "(-2, 3) — left 2 and up 3, which is Quadrant II. Negative first, positive second: that sign pair always means the upper-left quadrant.",
      "Use the signs as directions: negative x means go LEFT, positive y means go UP.")
  },
  k1: {
    body: "Name a quadrant from signs alone.",
    variants: [
      "A negative x with a negative y is down-left, which is Quadrant III.",
      "Both coordinates negative means left of the vertical axis and below the horizontal one."
    ],
    widget: mcq("In which quadrant does (-4, -1) lie?", [
      ["a", "Quadrant III", true, "Negative x puts it left of the vertical axis and negative y puts it below the horizontal one — the bottom-left region."],
      ["b", "Quadrant I", false, "Quadrant I needs BOTH coordinates positive."],
      ["c", "Quadrant II", false, "Quadrant II is negative x with POSITIVE y — upper left. Here the y is negative."],
      ["d", "Quadrant IV", false, "Quadrant IV is positive x with negative y. Here the x is negative too."]
    ])
  },
  k2: {
    body: "Flip one sign and see where it lands.",
    variants: [
      "Changing only the sign of x moves the point straight across the y-axis, so (5, 2) becomes (-5, 2).",
      "The y-coordinate is untouched, so the height stays the same and only the side changes."
    ],
    widget: mcq("Reflect (5, 2) across the y-axis.", [
      ["a", "(-5, 2)", true, "Only the x-coordinate changes sign — the point keeps its height and swaps sides."],
      ["b", "(5, -2)", false, "That flips across the x-axis instead, changing the height rather than the side."],
      ["c", "(-5, -2)", false, "Both signs changed, which would be two reflections, not one."],
      ["d", "(2, 5)", false, "Swapping the coordinates is a different move entirely — it is a reflection across the line y = x."]
    ])
  },
  c2: {
    figure: "tm8-reflect-rule",
    body: "That is the whole idea of this lesson: **a pair of points differing only in signs is a reflection**.\n\nFlip the sign of x and the point crosses the y-axis. Flip the sign of y and it crosses the x-axis. Flip both and it does each in turn, landing diagonally opposite through the origin — the distance from each axis never changes, only the side."
  },
  i2: {
    body: "Reflect across the other axis.",
    widget: plotSigned("Start from (1, 3) and plot its reflection across the x-axis.", 1, -3,
      [[1, 3, "That is the original point. Reflecting across the x-axis flips the y-coordinate to -3."],
       [-1, 3, "That is (-1, 3), a reflection across the Y-axis. Across the X-axis it is the height that flips."],
       [-1, -3, "That is (-1, -3) — both signs changed. Only the y should flip here."]],
      "(1, -3). The point kept its distance from the vertical axis and swapped sides of the horizontal one — only the sign of y moved.",
      "Reflecting across the x-axis keeps x the same and flips the sign of y.")
  },
  k3: {
    body: "Read a reflection backwards.",
    variants: [
      "(-6, 2) and (6, 2) share a y-coordinate and have opposite x, so the mirror is the y-axis.",
      "The coordinate that changed sign is x, which means the reflection was across the vertical axis."
    ],
    widget: mcq("(-6, 2) and (6, 2) are reflections of each other. Across which axis?", [
      ["a", "The y-axis", true, "Only the x-coordinate changed sign, so the point crossed the vertical axis while keeping its height."],
      ["b", "The x-axis", false, "That would flip the y-coordinate, but both points have y = 2."],
      ["c", "Both axes", false, "Only one coordinate changed. Flipping both would also negate the 2."],
      ["d", "Neither — they are not reflections", false, "They differ in exactly one sign, which is precisely what a single reflection does."]
    ])
  },
  ch1: {
    body: "Both signs at once.",
    variants: [
      "(-3, 5) with both signs flipped is (3, -5), which is diagonally opposite through the origin in Quadrant IV.",
      "Negating both coordinates reflects across each axis in turn, landing in the opposite quadrant."
    ],
    hints: [
      "Change the sign of each coordinate one at a time and track where the point goes.",
      "(-3, 5) becomes (3, 5) across the y-axis, then (3, -5) across the x-axis.",
      "Positive x with negative y is the bottom-right region — Quadrant IV."
    ],
    widget: mcq("Both signs of (-3, 5) are flipped. Which quadrant does the new point sit in?", [
      ["a", "Quadrant IV", true, "It becomes (3, -5): positive x, negative y — the bottom-right region, diagonally opposite the original."],
      ["b", "Quadrant II", false, "That is where the ORIGINAL point sits. Flipping both signs moves it diagonally across the origin."],
      ["c", "Quadrant I", false, "Quadrant I needs both coordinates positive, but the y became -5."],
      ["d", "Quadrant III", false, "Quadrant III needs both negative. Here x became positive."]
    ])
  },
  recap: {
    body: "Signs are an address, and flipping one is a mirror.",
    takeaways: [
      "The pair of signs names the quadrant: (+,+) I, (−,+) II, (−,−) III, (+,−) IV.",
      "Flipping the sign of x reflects across the y-axis; flipping y reflects across the x-axis.",
      "A reflection never changes a point's distance from either axis — only which side it is on."
    ],
    teaser: "next chapter: absolute value — that distance from zero, given a name."
  }
});

/* ==================================================== 7.RP.A.2c — the equation y = kx */

const pr03b01 = lesson({
  id: "pr-03b-01", slug: "writing-the-equation-y-equals-kx", title: "Writing the Equation y = kx",
  courseId: "proportional-relationships", chapterId: "ch3b-the-equation-of-a-proportion", minutes: 11,
  standards: ["7.RP.A.2c"], tag: "equation-y-kx",
  c1: {
    figure: "pr-y-equals-kx",
    body: "You can already find the constant of proportionality in a table and spot it on a graph. The last step is to **write it down as an equation**.\n\nEvery proportional relationship has the same form: **y = kx**, where k is that constant. Once k is known the equation predicts any value at all — no table row required."
  },
  i1: {
    body: "Pull the constant out of a set of pairs.",
    widget: {
      type: "proportionalReasoningLab", task: "constant", answerMode: "numeric",
      prompt: "A table has pairs (2, 10), (5, 25) and (8, 40). What is the constant of proportionality?",
      xLabel: "x", yLabel: "y",
      series: [{ id: "table", label: "table", pairs: [[2, 10], [5, 25], [8, 40]] }],
      requiredExplorations: 3, tolerance: 0, choices: [],
      numericErrors: [
        { value: 2, feedback: "2 is the x-value of the first pair, not the ratio between them. Divide y by x: 10 ÷ 2 = 5." },
        { value: 20, feedback: "20 is 10 × 2 rather than 10 ÷ 2. The constant is y divided by x." }
      ],
      successFeedback: "10 ÷ 2 = 5 (and 25 ÷ 5 = 5, 40 ÷ 8 = 5 too). The equation is therefore y = 5x.",
      explorationFeedback: "Inspect at least 3 of the pairs before checking — the claim is that they ALL give the same constant.",
      fallbackFeedback: "Divide any y by its x: 10 ÷ 2 = 5, so k = 5 and y = 5x."
    }
  },
  k1: {
    body: "Turn the constant into an equation.",
    variants: [
      "With k = 5 the relationship is y = 5x.",
      "The constant always sits in front of the x."
    ],
    widget: mcq("A proportional relationship has constant of proportionality 5. What is its equation?", [
      ["a", "y = 5x", true, "The constant multiplies x — that is what makes every pair share the same ratio."],
      ["b", "y = x + 5", false, "Adding 5 is not proportional: at x = 0 it would give y = 5, but a proportional graph passes through (0, 0)."],
      ["c", "y = 5", false, "That is a constant value, not a relationship — y would never change as x does."],
      ["d", "x = 5y", false, "This reverses the roles, which describes a constant of 1/5 rather than 5."]
    ])
  },
  k2: {
    body: "Use the equation to predict.",
    variants: [
      "y = 5x at x = 12 gives y = 60.",
      "Multiply the input by the constant: 12 × 5."
    ],
    widget: num("Using y = 5x, what is y when x = 12?", 60,
      [[17, "17 adds 5 and 12. The equation multiplies: 5 × 12 = 60."],
       [2.4, "2.4 divides 12 by 5. The constant multiplies the input."]],
      "5 × 12 = 60.")
  },
  c2: {
    figure: "pr7-k-three-ways",
    body: "The constant is the same number wherever you look for it, and that is the point.\n\nIn a **table** it is y ÷ x for any row. On a **graph** it is the height at x = 1 — how steeply the line climbs. In the **equation** it is simply the number in front of x. Three representations, one number, and the equation is the most compact of the three."
  },
  i2: {
    body: "Find the constant from a steeper relationship.",
    widget: {
      type: "proportionalReasoningLab", task: "constant", answerMode: "numeric",
      prompt: "A table has pairs (3, 21), (4, 28) and (10, 70). What is the constant of proportionality?",
      xLabel: "x", yLabel: "y",
      series: [{ id: "table", label: "table", pairs: [[3, 21], [4, 28], [10, 70] ] }],
      requiredExplorations: 3, tolerance: 0, choices: [],
      numericErrors: [
        { value: 18, feedback: "18 is 21 − 3, a difference. Proportional relationships are built on division: 21 ÷ 3." },
        { value: 63, feedback: "63 is 21 × 3. The constant is y DIVIDED by x, so 21 ÷ 3 = 7." }
      ],
      successFeedback: "21 ÷ 3 = 7 (and 28 ÷ 4 = 7, 70 ÷ 10 = 7). The equation is y = 7x.",
      explorationFeedback: "Check at least 3 pairs before answering — a single row cannot show that the ratio is constant.",
      fallbackFeedback: "Divide any y by its x: 21 ÷ 3 = 7, so y = 7x."
    }
  },
  k3: {
    body: "Read the constant off a graph instead.",
    variants: [
      "A proportional line through (1, 8) has constant 8, so the equation is y = 8x.",
      "The height at x = 1 is the constant of proportionality."
    ],
    widget: mcq("A proportional graph passes through (1, 8). What is its equation?", [
      ["a", "y = 8x", true, "The height at x = 1 is the constant, so k = 8."],
      ["b", "y = x + 8", false, "That is not proportional — it would not pass through the origin."],
      ["c", "y = 8", false, "A horizontal line at 8 does not pass through (0, 0) and does not change with x."],
      ["d", "y = x/8", false, "That gives a constant of 1/8; at x = 1 it would reach only 0.125, not 8."]
    ])
  },
  ch1: {
    body: "Work back from a single pair.",
    variants: [
      "If y = kx and (6, 42) fits, then k = 42 ÷ 6 = 7.",
      "Divide the output by the input to recover the constant."
    ],
    hints: [
      "Substitute the pair into y = kx and see what is left to find.",
      "42 = k × 6, so k is what you multiply 6 by to reach 42.",
      "42 ÷ 6 = 7, so the equation is y = 7x."
    ],
    widget: num("A proportional relationship contains the pair (6, 42). What is k?", 7,
      [[36, "36 is 42 − 6, a difference. Proportional relationships divide: 42 ÷ 6 = 7."],
       [252, "252 multiplies 42 by 6. The constant is the output DIVIDED by the input."]],
      "42 ÷ 6 = 7, so y = 7x.")
  },
  recap: {
    body: "One constant, written as an equation.",
    takeaways: [
      "Every proportional relationship is y = kx, with k the constant of proportionality.",
      "k is y ÷ x from any row, the height at x = 1 on the graph, and the number in front of x.",
      "With k known, the equation predicts any value without extending the table."
    ],
    teaser: "next chapter: percent problems — tax, tip, markup and markdown."
  }
});

/* ==================================================== patch */

const patch = {
  label: "S203F closing batch — ratio pairs on the plane (6.RP.A.3a), signs and reflections (6.NS.C.6b), the equation y = kx (7.RP.A.2c)",
  totalLessons: 3,
  chapterInsertions: [
    {
      courseSlug: "ratios-rates",
      chapter: { id: "ch2b-ratios-on-the-plane", title: "Ratios on the Plane", lessonIds: ["rr-02b-01"] },
      position: { after: "ch2-ratio-tables" },
      lessons: [rr02b01],
      seamEdit: { lessonId: "rr-02-03", field: "recap.teaser", expect: null,
        newValue: "next chapter: the same pairs again — this time as points on the coordinate plane." }
    },
    {
      courseSlug: "number-system",
      chapter: { id: "ch4b-signs-and-reflections", title: "Signs & Reflections", lessonIds: ["ns-04b-01"] },
      position: { after: "ch4-below-zero" },
      lessons: [ns04b01],
      seamEdit: { lessonId: "ns-04-03", field: "recap.teaser", expect: null,
        newValue: "next chapter: what the signs of a pair tell you, and what flipping one does to the point." }
    },
    {
      courseSlug: "proportional-relationships",
      chapter: { id: "ch3b-the-equation-of-a-proportion", title: "The Equation of a Proportion", lessonIds: ["pr-03b-01"] },
      position: { after: "ch3-graphs-of-proportional-relationships" },
      lessons: [pr03b01],
      seamEdit: { lessonId: "pr-03-03", field: "recap.teaser", expect: null,
        newValue: "next chapter: writing the relationship as an equation — y = kx." }
    }
  ]
};

/* Read each seam's pre-edit value from the live tree; a mismatch is a refusal, which is the point. */
for (const ci of patch.chapterInsertions) {
  const p = join(root, "content/courses", ci.courseSlug, "lessons", `${ci.seamEdit.lessonId}.json`);
  ci.seamEdit.expect = JSON.parse(readFileSync(p, "utf8")).steps.find((s) => s.kind === "recap").teaser;
}

mkdirSync(join(root, "content/patches"), { recursive: true });
const out = join(root, "content/patches/s203f-closing.json");
writeFileSync(out, JSON.stringify(patch, null, 2) + "\n");
console.log(`wrote ${out}: ${patch.chapterInsertions.reduce((t, c) => t + c.lessons.length, 0)} lessons`);
for (const ci of patch.chapterInsertions) console.log(`  seam ${ci.seamEdit.lessonId}: expect ${JSON.stringify(ci.seamEdit.expect)}`);
