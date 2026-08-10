#!/usr/bin/env node
// S199 — G6-12 expansion course 1/4: absolute-value-piecewise (F-IF.C.7b, F-BF.B.3, A-CED.A.1).
//
// WHY THIS COURSE: F-IF.C.7b is an Algebra expectation, but the corpus's only |x| / piecewise
// treatment lives in Grade 12 `function-analysis`. This is a SEQUENCING fix — the G12 lessons
// stay put and become review-and-extend.
//
// ENGINE CHOICES (all adapt-3 so the tier `adapt` lever reaches 3 with one authored remedial):
//   numberLinePlace  — with showDistanceFromZero, the S116 flag built exactly for this standard:
//                      placing -6 reads "position -6 · distance from 0: 6", so the lesson's whole
//                      misconception ("|x| makes things positive") is visible as TWO numbers about
//                      ONE marker rather than a rule to recall. The schema forbids the flag on a
//                      non-negative line, which is why every abs-value line here runs below zero.
//   plotPoint        — the V and the piecewise branches. plotPoint cells are 1-BASED with y from
//                      the bottom and no zero/negative coordinates, so negative axis values are
//                      carried by xLabels/yLabels and every target is converted to a cell index by
//                      cellOf() below (asserted round-trip, not hand-counted).
//   functionMachine  — one input, one output: the definition a piecewise rule must not violate.
//
// TIER-A RECIPE per lesson: predict hosted ON the manipulable step (prediction 3) · adapt-3 engine
// + one remedial (adapt 3) · a numeric/mcq entry AFTER the manipulable step (formal 3) · a concept
// step after the first widget (invariant 3) · >=3 steps sharing the lead conceptTag, or a compare
// surface (contrast 3) · a challenge (transfer) · >=2 wrong paths per assessed step (misconception).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SLUG = "absolute-value-piecewise";
const spec = JSON.parse(readFileSync("/mnt/user-data/uploads/g6-12-expansion.json", "utf8"))
  .courses.find((c) => c.slug === SLUG);

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };
must(spec && spec.lessons.length === 9, "spec course present with 9 lessons");
must(spec.grade === 9, "grade 9");

/* ---- plotPoint helper: author in MATH coordinates, convert to 1-based cells ---- */
function grid(xLabels, yLabels) {
  const cellOf = (xv, yv) => {
    const cx = xLabels.indexOf(String(xv));
    const cy = yLabels.indexOf(String(yv));
    must(cx >= 0, `x value ${xv} not on the authored axis [${xLabels}]`);
    must(cy >= 0, `y value ${yv} not on the authored axis [${yLabels}]`);
    return { x: cx + 1, y: cy + 1 };
  };
  return { xLabels, yLabels, cols: xLabels.length, rows: yLabels.length, cellOf };
}
function plotPoint({ prompt, g, target, errors, missFeedback, successFeedback }) {
  const t = g.cellOf(target[0], target[1]);
  const seen = new Set();
  const pointErrors = errors.map(([xv, yv, feedback]) => {
    const c = g.cellOf(xv, yv);
    const key = `${c.x},${c.y}`;
    must(!(c.x === t.x && c.y === t.y), `error (${xv},${yv}) equals the target`);
    must(!seen.has(key), `duplicate error cell ${key}`);
    seen.add(key);
    return { x: c.x, y: c.y, feedback };
  });
  must(t.x <= g.cols && t.y <= g.rows, "target inside grid");
  return { type: "plotPoint", prompt, cols: g.cols, rows: g.rows,
    xLabels: g.xLabels, yLabels: g.yLabels, targets: [t], pointErrors, missFeedback, successFeedback };
}
function numberLinePlace(o) {
  must(o.min < o.max, "line min<max");
  must(o.target >= o.min && o.target <= o.max, "target on line");
  if (o.showDistanceFromZero) must(o.min < 0, "showDistanceFromZero needs a line below zero");
  for (const p of o.commonPlacements ?? []) {
    must(p.value !== o.target, `commonPlacement ${p.value} equals target`);
    must(p.value >= o.min && p.value <= o.max, `commonPlacement ${p.value} off the line`);
    must(Number.isInteger(p.value - o.min), `commonPlacement ${p.value} off the step lattice`);
  }
  return { type: "numberLinePlace", step: 1, tickStep: 1, start: 0, commonPlacements: [], ...o };
}
function numeric({ prompt, answer, errors, fallbackFeedback, successFeedback, unit }) {
  must(errors.length >= 2, "numeric needs >=2 diagnostic wrong answers");
  for (const [v] of errors) must(v !== answer, `trap ${v} equals the answer`);
  must(new Set(errors.map((e) => e[0])).size === errors.length, "duplicate traps");
  const w = { type: "numeric", prompt, answer, tolerance: 0,
    commonErrors: errors.map(([value, feedback]) => ({ value, feedback })), fallbackFeedback };
  if (successFeedback) w.successFeedback = successFeedback;
  if (unit) w.unit = unit;
  return w;
}
function mcq(prompt, options) {
  must(options.filter((o) => o[2]).length === 1, `${prompt}: exactly one correct`);
  must(options.length >= 3, "mcq needs >=3 options");
  return { type: "mcq", prompt,
    options: options.map(([id, label, correct, feedback]) => ({ id, label, correct: !!correct, feedback })) };
}
const predict = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o[0] === outcomeId), "predict outcome is an offered option");
  must(options.length >= 3, "predict needs >=3 options");
  return { prompt, options: options.map(([id, label]) => ({ id, label })), outcomeId, reveal };
};

const L = [];
const lesson = (id, slug, title, chapterId, minutes, steps, remedial) => {
  L.push({ id, slug, title, courseId: SLUG, chapterId, minutes, steps, remedials: [remedial] });
};
/** remedial: re-teach with the lesson's own naming concept + its first tagged check, verbatim. */
const remedialFrom = (steps, tag) => {
  const c = steps.find((s) => s.kind === "concept" && s.id === "c2");
  const k = steps.find((s) => (s.kind === "check" || s.kind === "challenge") && s.conceptTag === tag && s.widget);
  must(c && k, `remedial sources for ${tag}`);
  return { conceptTag: tag,
    concept: { id: `rem-${tag}-c`, kind: "concept", body: c.body },
    check: { id: `rem-${tag}-k`, kind: "check", body: k.body, conceptTag: tag,
      explanationVariants: k.explanationVariants, widget: structuredClone(k.widget) } };
};

/* =========================== CH1 — The V =========================== */

/* 1. Absolute Value Is a Distance — avp-abs-distance */
{
  const TAG = "avp-abs-distance";
  const steps = [
    { id: "c1", kind: "concept", body: "|x| is almost always taught as \u201cmake it positive,\u201d and that description survives exactly as long as the numbers stay simple. The honest definition is geometric: |x| is the DISTANCE from x to 0 on the number line. Distance has no direction, which is why it is never negative \u2014 not because a sign was deleted." },
    { id: "i1", kind: "interactive",
      body: "Place the marker and watch two different numbers describe it.",
      widget: numberLinePlace({ prompt: "Place the marker at \u22126. Watch the position readout and the distance readout.",
        min: -8, max: 8, target: -6, showDistanceFromZero: true,
        commonPlacements: [
          { value: 6, feedback: "That is \u22126's mirror image. Same distance from 0, opposite side \u2014 which is exactly the point: |6| and |\u22126| agree, 6 and \u22126 do not." },
          { value: -8, feedback: "Too far left. Count six units from 0, not eight." },
        ],
        successFeedback: "Position \u22126, distance 6. One marker, two honest numbers \u2014 and only the distance is |\u22126|.",
        lowFeedback: "Too far left \u2014 you have passed \u22126.",
        highFeedback: "Not far enough left \u2014 keep going toward \u22126." }),
      predict: predict("The marker will sit at \u22126. What will the two readouts say?",
        [["both-neg", "Both \u22126 \u2014 position and distance agree"],
         ["split", "Position \u22126, distance 6"],
         ["both-pos", "Both 6 \u2014 absolute value rewrites the position"]],
        "split",
        "Position and distance are different questions about the same marker. Where is it? \u22126. How far from 0? 6. Absolute value answers only the second, which is why it never rewrites where the number actually lives."),
    },
    { id: "k1", kind: "check", body: "Compare two distances.", conceptTag: TAG,
      explanationVariants: [
        "|\u22126| = 6 and |4| = 4, and 6 > 4, so \u22126 sits farther from zero even though \u22126 is the smaller number.",
        "Distance ignores side: six units left beats four units right.",
      ],
      widget: mcq("Which number is FARTHER from 0: \u22126 or 4?", [
        ["o1", "\u22126, because |\u22126| = 6", true, "Yes \u2014 six units out beats four, and the side it went does not enter the comparison."],
        ["o2", "4, because \u22126 is smaller than 4", false, "That compares POSITION, not distance. \u22126 is indeed the smaller number, and still the farther one from zero."],
        ["o3", "They are equally far", false, "Equal distance would need equal magnitudes: 6 \u2260 4."],
      ]) },
    { id: "c2", kind: "concept", body: "So two numbers can share a distance while disagreeing about everything else. |\u22126| = |6| = 6, but \u22126 \u2260 6. Absolute value throws away the side and keeps the size; the number itself is unharmed by being measured." },
    { id: "k2", kind: "check", body: "Evaluate directly.", conceptTag: TAG,
      explanationVariants: [
        "|\u22129| asks how far \u22129 is from 0: nine units, so the value is 9.",
        "Nine units left of zero is still nine units of distance \u2014 |\u22129| = 9.",
      ],
      widget: numeric({ prompt: "What is |\u22129|?", answer: 9,
        errors: [[-9, "That is the input, not its distance. \u22129 sits nine units from 0, so the distance is 9."],
                 [0, "Zero would mean \u22129 sits ON zero. It sits nine units to the left."]],
        fallbackFeedback: "Count units from 0 to \u22129: nine of them. |\u22129| = 9.",
        successFeedback: "9 \u2014 the distance, positive because distances are." }) },
    { id: "k3", kind: "check", body: "One more comparison, sign-mixed.", conceptTag: TAG,
      explanationVariants: [
        "|\u22127| = 7 and |5| = 5, so \u22127 is farther out despite being the smaller number.",
        "Strip the signs to compare distances: 7 against 5.",
      ],
      widget: mcq("Which has the GREATER absolute value: \u22127 or 5?", [
        ["o1", "\u22127", true, "Right: 7 > 5. The negative sign changed the side, never the size."],
        ["o2", "5", false, "5 is the larger NUMBER, but |\u22127| = 7 > 5 = |5|. Bigger value, smaller distance."],
        ["o3", "Neither \u2014 absolute values are always equal", false, "Absolute values differ whenever magnitudes differ; 7 \u2260 5."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Count the solutions.", conceptTag: TAG,
      explanationVariants: [
        "Two points sit exactly five units from 0: 5 and \u22125.",
        "Distance five, either direction \u2014 so exactly two integers qualify.",
      ],
      hints: ["Draw the number line and mark every point exactly five units from 0.",
              "Distance does not care about direction, so check the left side as well as the right.",
              "5 is five units right of 0; \u22125 is five units left. Count them."],
      widget: numeric({ prompt: "How many different values of x satisfy |x| = 5?", answer: 2,
        errors: [[1, "Only if distance had a direction. Five units LEFT of zero works just as well as five units right."],
                 [5, "That is the distance itself, not the number of solutions. Count the qualifying points: 5 and \u22125."]],
        fallbackFeedback: "Exactly two points lie five units from 0 \u2014 one on each side: x = 5 and x = \u22125.",
        successFeedback: "Two \u2014 and that pair is the whole reason absolute-value equations behave the way the next chapter shows." }) },
    { id: "r1", kind: "recap", body: "Distance, not sign-deletion.",
      takeaways: ["|x| is the distance from x to 0, which is why it is never negative.",
                  "Absolute value discards the side and keeps the size: |\u22126| = |6| = 6, but \u22126 \u2260 6.",
                  "Equal distances usually come in pairs \u2014 one on each side of zero."],
      teaser: "Next: plot |x| at every input and watch the pair-of-distances idea draw a V." },
  ];
  lesson("avp-01-01", "absolute-value-is-a-distance", "Absolute Value Is a Distance", "ch1-the-v", 9, steps, remedialFrom(steps, TAG));
}

/* 2. The V-Shaped Graph — avp-v-graph */
{
  const TAG = "avp-v-graph";
  const g = grid(["-3", "-2", "-1", "0", "1", "2", "3"], ["0", "1", "2", "3"]);
  const steps = [
    { id: "c1", kind: "concept", body: "Feed every input to |x| and plot the results. Inputs on the right rise along y = x. Inputs on the left are negative, but their DISTANCES are positive, so the left half rises too \u2014 mirror-imaging the right. Two rising branches meeting at the origin: a V." },
    { id: "i1", kind: "interactive", body: "Plot one point on the left branch.",
      widget: plotPoint({ prompt: "On y = |x|, plot the point where x = \u22122.", g,
        target: [-2, 2],
        errors: [["-2", "0", "That would say |\u22122| = 0 \u2014 that \u22122 sits ON zero. It sits two units away, so the height is 2."],
                 ["2", "2", "Correct height, wrong branch: that is x = +2. The left branch is where the mirror argument does its work."]],
        missFeedback: "|\u22122| is the distance from \u22122 to 0, which is 2. So the point is (\u22122, 2).",
        successFeedback: "(\u22122, 2): two units left of zero, plotted two units UP. The left branch climbs as x moves away from the origin." }),
      predict: predict("y = |x| at x = \u22122 \u2014 where does the point land?",
        [["down", "Two BELOW the axis \u2014 negative input, negative height"],
         ["up", "Two ABOVE the axis"],
         ["zero", "On the axis \u2014 the negative cancels"]],
        "up",
        "Heights on this graph are distances, and distances are never negative. That single fact forces the left half upward and makes the V \u2014 the graph can touch the x-axis but can never dip below it."),
    },
    { id: "k1", kind: "check", body: "The lowest point.", conceptTag: TAG,
      explanationVariants: ["The smallest possible distance is 0, reached only at x = 0, so the vertex sits at (0, 0).",
                            "Every other input is some positive distance from zero, so nothing on the graph dips below the origin."],
      widget: mcq("What is the LOWEST point on y = |x|?", [
        ["o1", "(0, 0) \u2014 the vertex", true, "Yes: distance 0 happens exactly once, at the origin, and nothing can beat it."],
        ["o2", "There is none \u2014 it goes down forever", false, "That is true of y = x, not y = |x|. Distances have a floor at 0."],
        ["o3", "(\u22121, \u22121)", false, "|\u22121| = 1, so that point is (\u22121, 1) \u2014 above the axis, not below."],
      ]) },
    { id: "c2", kind: "concept", body: "The corner is the signature. A line has one constant slope; the V has two \u2014 it falls at slope \u22121 until the origin, then climbs at slope +1. The switch happens exactly where the inside of the bars changes sign, and that is the vertex." },
    { id: "k2", kind: "check", body: "Evaluate on the left branch.", conceptTag: TAG,
      explanationVariants: ["|\u22124| = 4, so the point at x = \u22124 has height 4.",
                            "Four units from zero means a height of four, no matter which side."],
      widget: numeric({ prompt: "On y = |x|, what is y when x = \u22124?", answer: 4,
        errors: [[-4, "Heights on the V are distances \u2014 they never go negative. |\u22124| = 4."],
                 [0, "Zero height happens only at the vertex, x = 0."]],
        fallbackFeedback: "y = |\u22124| = 4.",
        successFeedback: "4 \u2014 and (4, 4) sits at the same height on the right branch. Mirror images." }) },
    { id: "k3", kind: "check", body: "Compare heights across the vertex.", conceptTag: TAG,
      explanationVariants: ["|\u22123| = 3 = |3|, so the two points sit at the same height.",
                            "Inputs that are mirror images across 0 have equal distances, hence equal heights."],
      widget: mcq("On y = |x|, compare the heights at x = \u22123 and x = 3.", [
        ["o1", "Equal \u2014 both 3", true, "Exactly: the V is symmetric about the y-axis because |\u2212a| = |a|."],
        ["o2", "The x = 3 point is higher", false, "Both distances are 3. Nothing about the right side makes it taller."],
        ["o3", "The x = \u22123 point is lower, at \u22123", false, "That would put the graph below the axis, which distance forbids."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Read the V backwards.", conceptTag: TAG,
      explanationVariants: ["Height 6 needs distance 6, and two inputs are six units from 0: 6 and \u22126.",
                            "A horizontal line at y = 6 cuts the V once on each branch."],
      hints: ["Sketch the horizontal line y = 6 across the V.",
              "Count how many times that line meets the graph \u2014 the V has two branches.",
              "It meets the right branch at x = 6 and the left branch at x = \u22126."],
      widget: numeric({ prompt: "How many points on y = |x| have height exactly 6?", answer: 2,
        errors: [[1, "One is the answer for a straight line. The V climbs on BOTH sides of the vertex, so a horizontal line above the vertex hits it twice."],
                 [6, "That is the height, not the count. The qualifying inputs are x = 6 and x = \u22126."]],
        fallbackFeedback: "y = 6 meets the V twice \u2014 at x = 6 and x = \u22126.",
        successFeedback: "Two \u2014 every height above the vertex is reached twice, which is exactly why |x| = 6 will have two solutions." }) },
    { id: "r1", kind: "recap", body: "Two branches, one corner.",
      takeaways: ["y = |x| is a V: slope \u22121 into the vertex, slope +1 out of it.",
                  "The vertex (0, 0) is the graph's floor \u2014 distance cannot go below zero.",
                  "Mirror-image inputs have equal heights, so heights above the vertex are hit twice."],
      teaser: "Next: move that V around \u2014 and find out which direction a minus sign inside the bars really pushes it." },
  ];
  lesson("avp-01-02", "the-v-shaped-graph", "The V-Shaped Graph", "ch1-the-v", 9, steps, remedialFrom(steps, TAG));
}

/* 3. Shifting and Flipping the V — avp-v-transform (F-BF.B.3) */
{
  const TAG = "avp-v-transform";
  const g = grid(["-1", "0", "1", "2", "3", "4"], ["-4", "-3", "-2", "-1", "0", "1"]);
  const steps = [
    { id: "c1", kind: "concept", body: "y = |x \u2212 2| \u2212 3 is still the same V, standing somewhere else. The \u22122 INSIDE the bars moves it horizontally; the \u22123 outside moves it vertically. The vertex is wherever the inside of the bars equals 0 \u2014 that is the one input the shift is built around." },
    { id: "i1", kind: "interactive", body: "Put the vertex where it actually stands.",
      widget: plotPoint({ prompt: "Plot the vertex of y = |x \u2212 2| \u2212 3.", g,
        target: [2, -3],
        errors: [["0", "-3", "The inside says x \u2212 2, and many readers move LEFT by 2. Solve x \u2212 2 = 0 instead: the vertex sits at x = +2."],
                 ["2", "0", "Right column, wrong floor \u2014 the \u22123 outside the bars drops the whole V three units below the axis."]],
        missFeedback: "The vertex sits where x \u2212 2 = 0, so x = 2; there the height is 0 \u2212 3 = \u22123. Plot (2, \u22123).",
        successFeedback: "(2, \u22123): inside-the-bars moved it right, outside-the-bars moved it down. The V's shape never changed." }),
      predict: predict("y = |x \u2212 2| \u2212 3. Which way does the \u22122 INSIDE the bars move the V?",
        [["left", "Left 2 \u2014 a minus means left"],
         ["right", "Right 2"],
         ["down", "Down 2 \u2014 it lowers the graph"]],
        "right",
        "The vertex tracks whatever makes the inside zero, and x \u2212 2 = 0 at x = +2. Inside-the-bars shifts run opposite to the sign you read, which is exactly why this one catches so many people."),
    },
    { id: "k1", kind: "check", body: "Locate another vertex.", conceptTag: TAG,
      explanationVariants: ["x + 4 = 0 at x = \u22124, and the +1 outside lifts the vertex to height 1, so the vertex is (\u22124, 1).",
                            "Plus-inside moves left; plus-outside moves up."],
      widget: mcq("Where is the vertex of y = |x + 4| + 1?", [
        ["o1", "(\u22124, 1)", true, "Yes \u2014 x + 4 = 0 at x = \u22124, and the outside +1 raises the floor to 1."],
        ["o2", "(4, 1)", false, "Inside-the-bars shifts run opposite to their sign: x + 4 = 0 gives x = \u22124."],
        ["o3", "(\u22124, \u22121)", false, "The outside +1 lifts the V; it does not lower it."],
      ]) },
    { id: "c2", kind: "concept", body: "A minus in FRONT flips instead of shifts. y = \u2212|x| takes every height and negates it, turning the V upside down into a peak \u2014 the vertex becomes the highest point rather than the lowest. Inside the bars: horizontal. Outside: vertical. In front: reflection." },
    { id: "k2", kind: "check", body: "Evaluate a shifted V.", conceptTag: TAG,
      explanationVariants: ["At x = 5: |5 \u2212 2| \u2212 3 = 3 \u2212 3 = 0.",
                            "Inside first: 5 \u2212 2 = 3, its distance is 3, then subtract 3 to get 0."],
      widget: numeric({ prompt: "For y = |x \u2212 2| \u2212 3, what is y when x = 5?", answer: 0,
        errors: [[6, "The bars were dropped: |5 \u2212 2| = 3, and then the outside \u22123 still has to be applied."],
                 [-3, "That is the vertex height, which happens at x = 2, not x = 5."]],
        fallbackFeedback: "Work inside out: 5 \u2212 2 = 3, |3| = 3, 3 \u2212 3 = 0.",
        successFeedback: "0 \u2014 the shifted V crosses the x-axis right there." }) },
    { id: "k3", kind: "check", body: "Which way does it open?", conceptTag: TAG,
      explanationVariants: ["The minus in front negates every height, so the V opens downward into a peak.",
                            "\u2212|x| turns the graph's floor into a ceiling."],
      widget: mcq("How does y = \u2212|x| + 2 open?", [
        ["o1", "Downward \u2014 a peak at (0, 2)", true, "Right: the front minus flips the V, so the vertex is now the maximum."],
        ["o2", "Upward \u2014 a valley at (0, 2)", false, "That would be y = |x| + 2. The minus in front reverses every height."],
        ["o3", "Upward, with a vertex at (0, \u22122)", false, "Two errors: the flip is ignored and the +2 is read as lowering the graph."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Build the rule from the picture.", conceptTag: TAG,
      explanationVariants: ["A vertex at x = 6 needs the inside to vanish there: x \u2212 6.",
                            "Set the inside equal to zero and solve for the shift that lands the vertex on 6."],
      hints: ["The vertex happens where the expression inside the bars is 0.",
              "You need |x \u2212 h| to vanish at x = 6, so ask what h does that.",
              "x \u2212 h = 0 at x = h, so h must equal 6."],
      widget: numeric({ prompt: "y = |x \u2212 h| + 1 has its vertex at x = 6. What is h?", answer: 6,
        errors: [[-6, "The sign flip is being applied twice. The rule already reads x \u2212 h, so h = 6 puts the vertex at +6."],
                 [1, "That is the vertical shift, which sets the vertex's HEIGHT, not its x."]],
        fallbackFeedback: "The vertex sits where x \u2212 h = 0, i.e. x = h. For that to be 6, h = 6.",
        successFeedback: "h = 6 \u2014 read the vertex straight off the rule, no table needed." }) },
    { id: "r1", kind: "recap", body: "Same V, new address.",
      takeaways: ["The vertex sits where the expression inside the bars equals zero.",
                  "Inside the bars shifts horizontally and opposite to its sign; outside shifts vertically as written.",
                  "A minus in front flips the V into a peak."],
      teaser: "Next: stop reading the V and start solving it \u2014 |x| = 5 and the pair of answers it always hides." },
  ];
  lesson("avp-01-03", "shifting-and-flipping-the-v", "Shifting and Flipping the V", "ch1-the-v", 9, steps, remedialFrom(steps, TAG));
}

/* ==================== CH2 — Equations with |x| ==================== */

/* 4. Two Numbers Share a Distance — avp-abs-equations */
{
  const TAG = "avp-abs-equations";
  const steps = [
    { id: "c1", kind: "concept", body: "|x| = 5 asks which numbers sit five units from zero. Phrased that way the answer is obvious \u2014 there are two, one per side. Phrased as \u201cremove the bars,\u201d only one shows up. The distance reading is what keeps the second solution from disappearing." },
    { id: "i1", kind: "interactive", body: "Place the solution most people miss.",
      widget: numberLinePlace({ prompt: "|x| = 5 has two solutions. Place the NEGATIVE one.",
        min: -8, max: 8, target: -5, showDistanceFromZero: true,
        commonPlacements: [
          { value: 5, feedback: "That is the solution everyone finds first. Its twin is the same distance out on the other side." },
          { value: -8, feedback: "Eight units out, not five. Read the distance panel as you slide." },
        ],
        successFeedback: "\u22125: position \u22125, distance 5. Both \u22125 and 5 answer |x| = 5, which is what \u201ctwo numbers share a distance\u201d means.",
        lowFeedback: "Too far left \u2014 the distance readout has passed 5.",
        highFeedback: "Not far enough left \u2014 keep sliding until the distance reads 5." }),
      predict: predict("How many solutions does |x| = 5 have?",
        [["one", "One \u2014 x = 5"], ["two", "Two"], ["none", "None \u2014 the bars make it unsolvable"]],
        "two",
        "Every positive distance is achieved twice, once on each side of zero. The equation is really asking a geometry question, and geometry answers it with a pair."),
    },
    { id: "k1", kind: "check", body: "Split into two cases.", conceptTag: TAG,
      explanationVariants: ["|x| = 7 means the inside is 7 or \u22127, giving x = 7 and x = \u22127.",
                            "Two cases, because two numbers have distance 7 from zero."],
      widget: mcq("Solving |x| = 7 correctly means writing which pair of equations?", [
        ["o1", "x = 7 or x = \u22127", true, "Yes \u2014 an absolute-value equation always splits into a positive and a negative case."],
        ["o2", "x = 7 only", false, "That drops the left-hand solution. \u22127 is also seven units from zero."],
        ["o3", "x = 7 and x = 0", false, "0 is zero units from zero, so |0| = 0 \u2260 7."],
      ]) },
    { id: "c2", kind: "concept", body: "The method generalizes by treating whatever sits inside the bars as one object. |x \u2212 1| = 4 says the QUANTITY x \u2212 1 is four units from zero, so x \u2212 1 = 4 or x \u2212 1 = \u22124. Solve both, and you get both answers." },
    { id: "k2", kind: "check", body: "Solve a shifted equation.", conceptTag: TAG,
      explanationVariants: ["x \u2212 1 = \u22124 gives x = \u22123, the smaller of the two solutions.",
                            "The two cases give x = 5 and x = \u22123; the negative case is the one asked for."],
      widget: numeric({ prompt: "|x \u2212 1| = 4. What is the SMALLER solution?", answer: -3,
        errors: [[5, "That is the larger solution, from x \u2212 1 = 4. The other case, x \u2212 1 = \u22124, gives the smaller one."],
                 [-5, "That treats the center as \u22121. The inside is x \u2212 1, so the cases are x \u2212 1 = \u00b14 and the negative case lands at \u22123."]],
        fallbackFeedback: "x \u2212 1 = \u22124 gives x = \u22123; check it: |\u22123 \u2212 1| = |\u22124| = 4.",
        successFeedback: "\u22123 \u2014 and its partner is 5. Both sit four units from the center x = 1." }) },
    { id: "k3", kind: "check", body: "Verify a candidate.", conceptTag: TAG,
      explanationVariants: ["|\u22122 \u2212 1| = |\u22123| = 3, not 4, so \u22122 is not a solution.",
                            "Substituting is the check: the distance comes out 3, one short."],
      widget: mcq("Is x = \u22122 a solution of |x \u2212 1| = 4?", [
        ["o1", "No \u2014 it gives 3, not 4", true, "Correct: |\u22122 \u2212 1| = 3. Close, but the equation demands exactly 4."],
        ["o2", "Yes \u2014 it is negative, so it must be the second solution", false, "Being negative does not make a number a solution; substitution decides. Here it gives 3."],
        ["o3", "Yes \u2014 |\u22122| = 2 and 2 + 1 = 3... close enough", false, "The bars enclose the WHOLE expression x \u2212 1, so subtract first, then measure."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Both at once.", conceptTag: TAG,
      explanationVariants: ["The solutions are 5 and \u22123, and 5 + (\u22123) = 2.",
                            "Solutions sit symmetrically about the center x = 1, so their sum is twice the center: 2."],
      hints: ["Solve both cases of |x \u2212 1| = 4 before adding anything.",
              "One case gives x \u2212 1 = 4, the other x \u2212 1 = \u22124.",
              "The solutions are 5 and \u22123 \u2014 now add them."],
      widget: numeric({ prompt: "|x \u2212 1| = 4. What is the SUM of its two solutions?", answer: 2,
        errors: [[8, "That doubles the distance instead of adding the solutions. The solutions are 5 and \u22123."],
                 [0, "Solutions sum to zero only when the center is zero. Here they straddle x = 1, so they sum to 2."]],
        fallbackFeedback: "The solutions are 5 and \u22123; their sum is 2 \u2014 exactly twice the center x = 1.",
        successFeedback: "2 \u2014 the pair always balances around the center, which is a fast way to check your work." }) },
    { id: "r1", kind: "recap", body: "One equation, two cases.",
      takeaways: ["|expression| = k splits into expression = k and expression = \u2212k.",
                  "Treat everything inside the bars as a single quantity before splitting.",
                  "The two solutions sit symmetrically about the value that makes the inside zero."],
      teaser: "Next: when does that reliable pair become one solution \u2014 or none at all?" },
  ];
  lesson("avp-02-01", "two-numbers-share-a-distance", "Two Numbers Share a Distance", "ch2-equations-with-abs", 9, steps, remedialFrom(steps, TAG));
}

/* 5. No Solution, One, or Two — avp-solution-count */
{
  const TAG = "avp-solution-count";
  const steps = [
    { id: "c1", kind: "concept", body: "The pair is the usual case, not the only one. |x| = k has two solutions when k > 0, exactly one when k = 0 (zero is its own mirror), and NONE when k < 0 \u2014 because no point on the line sits a negative distance from anywhere." },
    { id: "i1", kind: "interactive", body: "Find the case with only one answer.",
      widget: numberLinePlace({ prompt: "|x + 2| = 0 has exactly ONE solution. Place it.",
        min: -6, max: 6, target: -2, showDistanceFromZero: true,
        commonPlacements: [
          { value: 2, feedback: "Sign flipped. The inside is x + 2, which vanishes at x = \u22122, not +2." },
          { value: 0, feedback: "That makes the inside 2, not 0 \u2014 |0 + 2| = 2. The quantity in the bars has to vanish, not x itself." },
        ],
        successFeedback: "\u22122: the inside reads 0, whose distance from zero is 0. Zero is the one number that is its own mirror image, so this case cannot produce a pair.",
        lowFeedback: "Too far left \u2014 the inside has gone negative past zero.",
        highFeedback: "Too far right \u2014 slide left until the inside vanishes." }),
      predict: predict("How many solutions does |x + 2| = \u22124 have?",
        [["two", "Two \u2014 as usual"], ["one", "One"], ["none", "None"]],
        "none",
        "A distance is never negative, so nothing can be \u22124 units from anywhere. Notice this can be settled without a single algebraic step \u2014 the geometry rules it out before the work starts."),
    },
    { id: "k1", kind: "check", body: "Count without solving.", conceptTag: TAG,
      explanationVariants: ["The right side is negative and a distance cannot be, so no solutions exist.",
                            "|anything| \u2265 0 always, so it can never equal \u22123."],
      widget: mcq("How many solutions does |x \u2212 7| = \u22123 have?", [
        ["o1", "None", true, "Right \u2014 and no algebra was needed: the right side is negative, which distance forbids."],
        ["o2", "Two, at 4 and 10", false, "Those come from treating the \u22123 as if it were 3. The equation as written asks for a negative distance."],
        ["o3", "One, at x = 7", false, "x = 7 makes the inside 0, so |x \u2212 7| = 0, not \u22123."],
      ]) },
    { id: "c2", kind: "concept", body: "So the count is decided by the number on the right, before any case-splitting begins. Positive right side: a pair. Zero: a single solution where the inside vanishes. Negative right side: nothing. Reading the right-hand side first saves the whole procedure." },
    { id: "k2", kind: "check", body: "The single-solution case.", conceptTag: TAG,
      explanationVariants: ["|x \u2212 6| = 0 forces x \u2212 6 = 0, so x = 6 and there is exactly one solution.",
                            "Zero distance can only happen at the center itself."],
      widget: numeric({ prompt: "|x \u2212 6| = 0. How many solutions does it have?", answer: 1,
        errors: [[2, "The pair appears only for a POSITIVE distance. Zero has no mirror image \u2014 it is its own."],
                 [0, "There is a solution: x = 6 makes the inside vanish. The count is one, not none."]],
        fallbackFeedback: "Zero distance happens only at the center, so x = 6 is the sole solution: exactly 1.",
        successFeedback: "1 \u2014 the case where the V's vertex just touches the horizontal line." }) },
    { id: "k3", kind: "check", body: "Match the count to the picture.", conceptTag: TAG,
      explanationVariants: ["A horizontal line below the vertex never meets the V, so the equation has no solutions.",
                            "The V's floor is its vertex; lines beneath it miss entirely."],
      widget: mcq("Graphically, why does |x| = \u22122 have no solutions?", [
        ["o1", "The line y = \u22122 passes below the V, which never dips under the x-axis", true, "Exactly \u2014 the graph shows the impossibility at a glance."],
        ["o2", "The V is too narrow to reach it", false, "Width is not the issue; the V extends forever sideways but never downward."],
        ["o3", "Because \u22122 is not an integer distance", false, "\u22122 is an integer. The obstacle is its sign, not its type."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Choose the boundary.", conceptTag: TAG,
      explanationVariants: ["Exactly one solution requires the right side to be 0, so k = 0.",
                            "The single-solution case is the vertex-touching case, which needs distance zero."],
      hints: ["Ask what right-hand value gives a solution that has no mirror twin.",
              "Two solutions need a positive right side; none needs a negative one. What is left?",
              "Only distance 0 has a single point, so k = 0."],
      widget: numeric({ prompt: "For which value of k does |x \u2212 3| = k have EXACTLY one solution?", answer: 0,
        errors: [[3, "3 is the center, not the distance. |x \u2212 3| = 3 has two solutions, 0 and 6."],
                 [-1, "A negative right side gives NO solutions, not one."]],
        fallbackFeedback: "Only k = 0 works: the inside must vanish, which happens at the single point x = 3.",
        successFeedback: "k = 0 \u2014 the knife edge between two solutions and none." }) },
    { id: "r1", kind: "recap", body: "Read the right side first.",
      takeaways: ["|expression| = k has two solutions for k > 0, one for k = 0, and none for k < 0.",
                  "The count can be settled before any case-splitting.",
                  "Graphically the count is how many times a horizontal line meets the V."],
      teaser: "Next: swap the equals sign for an inequality \u2014 and watch one band split into two rays." },
  ];
  lesson("avp-02-02", "no-solution-one-or-two", "No Solution, One, or Two", "ch2-equations-with-abs", 9, steps, remedialFrom(steps, TAG));
}

/* 6. Absolute Value Inequalities — avp-abs-inequalities */
{
  const TAG = "avp-abs-inequalities";
  const steps = [
    { id: "c1", kind: "concept", body: "|x| < 3 asks which points are CLOSER than three units to zero \u2014 a band around the origin, from \u22123 to 3. |x| > 3 asks the opposite: points farther out than three units, which is everything beyond \u22123 on the left and beyond 3 on the right. One band, or two rays." },
    { id: "i1", kind: "interactive", body: "Place the edge of the band.",
      widget: numberLinePlace({ prompt: "|x| < 3 keeps everything strictly between two edges. Place the RIGHT edge.",
        min: -6, max: 6, target: 3, showDistanceFromZero: true,
        commonPlacements: [
          { value: -3, feedback: "That is the LEFT edge \u2014 correct distance, wrong side. The right edge sits at +3." },
          { value: 6, feedback: "Six units out is well outside the band; |6| = 6, which is not less than 3." },
        ],
        successFeedback: "+3: the band runs \u22123 < x < 3, and both edges sit exactly three units from zero. The edge itself is excluded, because the inequality is strict.",
        lowFeedback: "Not far enough right \u2014 the distance readout is still under 3.",
        highFeedback: "Too far right \u2014 you have passed the edge at 3." }),
      predict: predict("What does the solution of |x| > 4 look like on the number line?",
        [["band", "One band around zero"],
         ["rays", "Two rays heading in opposite directions"],
         ["point", "A single point"]],
        "rays",
        "\u201cFarther than four units out\u201d can be satisfied by going left or by going right, and those two escapes never touch. The band belongs to <, the pair of rays to > \u2014 and using one sandwich for both is the classic error."),
    },
    { id: "k1", kind: "check", body: "Write the band.", conceptTag: TAG,
      explanationVariants: ["|x| < 5 means the distance is under 5 in either direction: \u22125 < x < 5.",
                            "Less-than gives a single sandwich around zero."],
      widget: mcq("Which is equivalent to |x| < 5?", [
        ["o1", "\u22125 < x < 5", true, "Yes \u2014 one sandwich, because \u2018closer than 5\u2019 is a single connected stretch."],
        ["o2", "x < 5 or x > \u22125", false, "That is every number at once \u2014 the \u2018or\u2019 makes the condition impossible to fail."],
        ["o3", "x < \u22125 or x > 5", false, "That is the solution of |x| > 5, the outside case."],
      ]) },
    { id: "c2", kind: "concept", body: "So the direction of the sign decides the SHAPE of the answer, not just its edges. Less-than gives one sandwich, written with a single chain. Greater-than gives two separate rays, joined by \u2018or\u2019 \u2014 and it cannot be written as a chain, because no number is on both rays at once." },
    { id: "k2", kind: "check", body: "Write the two rays.", conceptTag: TAG,
      explanationVariants: ["|x| \u2265 2 means at least two units out, so x \u2264 \u22122 or x \u2265 2.",
                            "Greater-than-or-equal keeps the edges and takes both outward directions."],
      widget: mcq("Which is equivalent to |x| \u2265 2?", [
        ["o1", "x \u2264 \u22122 or x \u2265 2", true, "Correct \u2014 both rays, edges included because the inequality is not strict."],
        ["o2", "\u22122 \u2264 x \u2264 2", false, "That is the inside band, the solution of |x| \u2264 2 \u2014 the exact opposite set."],
        ["o3", "x \u2265 2 only", false, "That forgets the left ray; \u22125 is five units out and qualifies too."],
      ]) },
    { id: "k3", kind: "check", body: "Test membership.", conceptTag: TAG,
      explanationVariants: ["|\u22127| = 7, and 7 > 4, so \u22127 satisfies |x| > 4.",
                            "Distance seven exceeds four, so the point lies on the left ray."],
      widget: numeric({ prompt: "Does x = \u22127 satisfy |x| > 4? Enter 1 for yes, 0 for no.", answer: 1,
        errors: [[0, "The negative sign is not disqualifying \u2014 |\u22127| = 7, and 7 > 4, so it lands on the left ray."],
                 [7, "That is |\u22127| itself. The question asks yes or no: enter 1 or 0."]],
        fallbackFeedback: "|\u22127| = 7 > 4, so yes \u2014 enter 1.",
        successFeedback: "Yes \u2014 the left ray is a full half of this solution set, and it is the half most often dropped." }) },
    { id: "ch1", kind: "challenge", body: "A shifted band.", conceptTag: TAG,
      explanationVariants: ["|x \u2212 3| < 2 means 1 < x < 5, whose integer members are 2, 3 and 4.",
                            "Points strictly within two units of 3 are 2, 3, 4 \u2014 three integers."],
      hints: ["Rewrite it as a sandwich centered on the value that makes the inside zero.",
              "The condition says x sits strictly within 2 units of 3, so 1 < x < 5.",
              "List the integers strictly between 1 and 5 and count them."],
      widget: numeric({ prompt: "How many INTEGERS satisfy |x \u2212 3| < 2?", answer: 3,
        errors: [[5, "The edges 1 and 5 are excluded \u2014 the inequality is strict, so |1 \u2212 3| = 2 is not less than 2."],
                 [4, "One endpoint slipped in. Strict means both 1 and 5 are out, leaving 2, 3 and 4."]],
        fallbackFeedback: "1 < x < 5 contains the integers 2, 3 and 4 \u2014 three of them.",
        successFeedback: "3 \u2014 and notice the band is centered on 3, the value that makes the inside vanish." }) },
    { id: "r1", kind: "recap", body: "The sign chooses the shape.",
      takeaways: ["|x| < k is one band: \u2212k < x < k.",
                  "|x| > k is two rays: x < \u2212k or x > k \u2014 never a single chain.",
                  "Shifted versions center the band or the rays on whatever makes the inside zero."],
      teaser: "Next: rules that change formula partway along \u2014 functions defined in pieces." },
  ];
  lesson("avp-02-03", "absolute-value-inequalities", "Absolute Value Inequalities", "ch2-equations-with-abs", 9, steps, remedialFrom(steps, TAG));
}

/* ================== CH3 — Functions in Pieces ================== */

/* 7. A Function Defined in Pieces — avp-piecewise-define */
{
  const TAG = "avp-piecewise-define";
  const steps = [
    { id: "c1", kind: "concept", body: "Some rules change formula partway along. A phone plan charges one rate up to 5 GB and another beyond it; that is one function with two formulas, each labelled with the inputs it governs. The labels are what keep it a function: every input is handed to exactly one formula." },
    { id: "i1", kind: "interactive", body: "Run one branch of the rule.",
      widget: { type: "functionMachine",
        prompt: "This branch applies when x \u2265 0 and its rule is y = 2x + 1. Set the input that produces 9.",
        a: 2, b: 1, inputMin: 0, inputMax: 8, inputStep: 1, inputStart: 0, targetOutput: 9,
        successFeedback: "x = 4 gives 2(4) + 1 = 9. One input in, one output out \u2014 the branch behaves like any other function.",
        lowFeedback: "Output still under 9 \u2014 raise the input and watch the doubling do most of the work.",
        highFeedback: "Output past 9 \u2014 come back down; 2x + 1 climbs two for every step you take." },
      predict: predict("A piecewise rule has two formulas. How many outputs does ONE input receive?",
        [["one", "Exactly one"], ["two", "Two \u2014 one per formula"], ["depends", "Two, unless the formulas happen to agree"]],
        "one",
        "The conditions partition the inputs: each x satisfies exactly one of them, so exactly one formula ever applies. If both could fire at the same x, the rule would not be a function at all \u2014 which is why the conditions must never overlap."),
    },
    { id: "k1", kind: "check", body: "Pick the governing branch.", conceptTag: TAG,
      explanationVariants: ["x = \u22123 satisfies x < 0, so the first branch applies and f(\u22123) = \u22123 + 5 = 2.",
                            "Check the conditions before the formulas: \u22123 is negative, so the x < 0 rule governs."],
      widget: mcq("f(x) = x + 5 for x < 0, and f(x) = 2x + 1 for x \u2265 0. What is f(\u22123)?", [
        ["o1", "2", true, "Yes \u2014 \u22123 is negative, so the first branch applies: \u22123 + 5 = 2."],
        ["o2", "\u22125", false, "That uses the second branch: 2(\u22123) + 1 = \u22125. But \u22123 does not satisfy x \u2265 0."],
        ["o3", "Both 2 and \u22125", false, "A function returns one output. The conditions decide which formula fires, and only one can."],
      ]) },
    { id: "c2", kind: "concept", body: "So evaluating happens in two moves, and the order matters: first find which condition the input satisfies, THEN apply that branch's formula. Reaching for the nearest formula and checking the condition afterwards is what produces most piecewise errors." },
    { id: "k2", kind: "check", body: "Evaluate on the other branch.", conceptTag: TAG,
      explanationVariants: ["x = 4 satisfies x \u2265 0, so f(4) = 2(4) + 1 = 9.",
                            "Positive input, second branch, double-and-add-one."],
      widget: numeric({ prompt: "With f(x) = x + 5 for x < 0 and f(x) = 2x + 1 for x \u2265 0, what is f(4)?", answer: 9,
        errors: [[9.5, "Only whole steps here \u2014 recompute 2(4) + 1 exactly."],
                 [4, "That used the first branch's shape but 4 is not negative, so the x \u2265 0 rule governs: 2(4) + 1."]],
        fallbackFeedback: "4 satisfies x \u2265 0, so use 2x + 1: 2(4) + 1 = 9.",
        successFeedback: "9 \u2014 condition first, then formula." }) },
    { id: "k3", kind: "check", body: "Why the conditions cannot overlap.", conceptTag: TAG,
      explanationVariants: ["Overlapping conditions would give one input two outputs, which no function may do.",
                            "The conditions must partition the inputs so each x meets exactly one."],
      widget: mcq("Why must the conditions of a piecewise rule never overlap?", [
        ["o1", "Because an input in both would receive two outputs, and functions give one", true, "Exactly \u2014 non-overlap is what preserves function-hood."],
        ["o2", "Because overlapping conditions are hard to write", false, "Writing them is easy; the problem is that the result stops being a function."],
        ["o3", "Because the formulas would have to be identical", false, "They may be anything at all \u2014 provided no input satisfies two conditions at once."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Find the gap.", conceptTag: TAG,
      explanationVariants: ["x < 2 and x > 2 leave out x = 2, so exactly one input has no branch.",
                            "The conditions miss the single value 2, which makes the rule undefined there."],
      hints: ["List the inputs each condition covers and look for one that neither claims.",
              "x < 2 stops just short of 2; x > 2 starts just past it.",
              "The value 2 itself is claimed by neither condition."],
      widget: numeric({ prompt: "g(x) = 1 for x < 2 and g(x) = 5 for x > 2. How many inputs get NO output at all?", answer: 1,
        errors: [[0, "Look at x = 2 itself: it is neither less than 2 nor greater than 2, so no branch claims it."],
                 [2, "Only one value falls through the gap \u2014 the boundary x = 2 \u2014 not two."]],
        fallbackFeedback: "The conditions skip x = 2 exactly, so precisely one input is left undefined.",
        successFeedback: "1 \u2014 the boundary itself. Real definitions close that gap with a \u2264 or \u2265 on one side." }) },
    { id: "r1", kind: "recap", body: "One rule, several formulas.",
      takeaways: ["A piecewise function pairs each formula with the inputs it governs.",
                  "Evaluate by checking the condition first, then applying that branch.",
                  "Conditions must not overlap, or one input would get two outputs."],
      teaser: "Next: draw one \u2014 and settle who owns the boundary point." },
  ];
  lesson("avp-03-01", "a-function-defined-in-pieces", "A Function Defined in Pieces", "ch3-functions-in-pieces", 9, steps, remedialFrom(steps, TAG));
}

/* 8. Graphing Piecewise Functions — avp-piecewise-graph */
{
  const TAG = "avp-piecewise-graph";
  const g = grid(["-1", "0", "1", "2", "3"], ["0", "1", "2", "3", "4"]);
  const steps = [
    { id: "c1", kind: "concept", body: "Graphing a piecewise rule means drawing each formula only over the inputs it governs, then deciding what happens where the branches meet. At the boundary exactly one branch owns the point \u2014 the one whose condition includes it \u2014 and the graph marks that with a filled dot and the other with an open one." },
    { id: "i1", kind: "interactive", body: "Plot the boundary point, owner included.",
      widget: plotPoint({ prompt: "f(x) = x + 3 for x < 1, and f(x) = 2x for x \u2265 1. Plot the point ON the graph at x = 1.", g,
        target: [1, 2],
        errors: [["1", "4", "That is the FIRST branch's value, 1 + 3 = 4 \u2014 but x < 1 excludes x = 1. The branch marked x \u2265 1 owns the boundary, and it gives 2."],
                 ["3", "2", "Right height, wrong input: that is x = 3. The boundary being asked about is x = 1."]],
        missFeedback: "x = 1 satisfies x \u2265 1, so use the second branch: f(1) = 2(1) = 2. Plot (1, 2).",
        successFeedback: "(1, 2): the \u2265 branch owns the boundary, so the filled dot sits there and the other branch gets an open circle at (1, 4)." }),
      predict: predict("At the boundary x = 1, which branch decides the graph's actual point?",
        [["first", "The first one listed"],
         ["owner", "The one whose condition includes x = 1"],
         ["both", "Both \u2014 the graph has two points there"]],
        "owner",
        "Ownership is written into the inequality signs, not the ordering of the lines on the page. Here x \u2265 1 includes the boundary and x < 1 does not, so the second branch supplies the point \u2014 and the graph shows a filled dot there and an open circle where the first branch stopped short."),
    },
    { id: "k1", kind: "check", body: "Evaluate at the boundary.", conceptTag: TAG,
      explanationVariants: ["x = 1 satisfies x \u2265 1, so f(1) = 2(1) = 2.",
                            "The \u2265 branch includes its endpoint, so it supplies f(1)."],
      widget: numeric({ prompt: "For that same f, what is f(1)?", answer: 2,
        errors: [[4, "That is 1 + 3 from the first branch, but x < 1 is strict \u2014 it does not include x = 1."],
                 [6, "That looks like both branches combined. Only one branch ever applies to a given input."]],
        fallbackFeedback: "1 satisfies x \u2265 1, so f(1) = 2(1) = 2.",
        successFeedback: "2 \u2014 the boundary belongs to whichever branch's condition includes it." }) },
    { id: "c2", kind: "concept", body: "The open circle is not decoration \u2014 it records that the branch approaches a height it never attains. When the two branches meet at the same height the dots coincide and the graph is continuous; when they do not, the graph jumps, and the size of that jump is visible on the page." },
    { id: "k2", kind: "check", body: "Continuous or jumping?", conceptTag: TAG,
      explanationVariants: ["The first branch approaches 1 + 3 = 4 while the second starts at 2, so the graph jumps by 2.",
                            "The branch heights at the boundary disagree, so there is a break."],
      widget: mcq("Is that f continuous at x = 1?", [
        ["o1", "No \u2014 it jumps from a height of 4 down to 2", true, "Right: the branches disagree at the boundary, so the graph breaks."],
        ["o2", "Yes \u2014 piecewise functions are always continuous", false, "Nothing forces the branches to agree; when they disagree the graph jumps."],
        ["o3", "Yes \u2014 both branches are lines", false, "Straight branches can still meet at different heights, which is exactly what happens here."],
      ]) },
    { id: "k3", kind: "check", body: "Evaluate away from the boundary.", conceptTag: TAG,
      explanationVariants: ["x = \u22121 satisfies x < 1, so f(\u22121) = \u22121 + 3 = 2.",
                            "Negative input, first branch, add three."],
      widget: numeric({ prompt: "For the same f, what is f(\u22121)?", answer: 2,
        errors: [[-2, "That is the second branch, 2(\u22121). But \u22121 satisfies x < 1, so the first branch governs."],
                 [4, "That is f evaluated at 1 on the first branch. The input here is \u22121: \u22121 + 3 = 2."]],
        fallbackFeedback: "\u22121 < 1, so use x + 3: \u22121 + 3 = 2.",
        successFeedback: "2 \u2014 same height as f(1), reached by a different branch entirely." }) },
    { id: "ch1", kind: "challenge", body: "Size the jump.", conceptTag: TAG,
      explanationVariants: ["The first branch approaches 4 and the second gives 2, a gap of 2.",
                            "|4 \u2212 2| = 2, the vertical distance between the open circle and the filled dot."],
      hints: ["Compute what each branch says at x = 1, even the one that stops short.",
              "The first branch approaches 1 + 3; the second attains 2(1).",
              "The gap is the distance between 4 and 2."],
      widget: numeric({ prompt: "How tall is the jump in that graph at x = 1?", answer: 2,
        errors: [[0, "Zero would mean the branches meet. Here one approaches 4 and the other gives 2."],
                 [6, "That adds the two heights instead of comparing them. The gap is their difference."]],
        fallbackFeedback: "The branches give 4 and 2 at the boundary, so the jump measures 4 \u2212 2 = 2.",
        successFeedback: "2 \u2014 and measuring a gap by subtracting is the same distance idea this course opened with." }) },
    { id: "r1", kind: "recap", body: "Branches, boundaries, and dots.",
      takeaways: ["Draw each branch only over the inputs its condition names.",
                  "The boundary point belongs to the branch whose condition includes it: filled dot there, open circle on the other.",
                  "Branches that meet at different heights make the graph jump."],
      teaser: "Next: rules that jump on purpose \u2014 postage, parking, and tax brackets." },
  ];
  lesson("avp-03-02", "graphing-piecewise-functions", "Graphing Piecewise Functions", "ch3-functions-in-pieces", 9, steps, remedialFrom(steps, TAG));
}

/* 9. Steps, Brackets & Real Rules — avp-step-functions */
{
  const TAG = "avp-step-functions";
  const steps = [
    { id: "c1", kind: "concept", body: "Some real rules are piecewise with many pieces, all of them flat. Postage charges by the ounce, parking by the hour, tax by the bracket. Between the jumps the price does not move at all; at each jump it leaps. Graphed, these rules look like a staircase." },
    { id: "i1", kind: "interactive", body: "Round the way the rule rounds.",
      widget: numberLinePlace({ prompt: "Postage costs $1 for the first ounce and $1 for each additional STARTED ounce. A letter weighs 2.3 oz \u2014 place the weight it is CHARGED as.",
        min: 0, max: 6, target: 3,
        commonPlacements: [
          { value: 2, feedback: "That rounds down, which no postal service does \u2014 those extra 0.3 oz have already started a third ounce, and a started ounce is a charged ounce." },
          { value: 4, feedback: "Too far: 2.3 has started the third ounce but not the fourth." },
        ],
        successFeedback: "3: a started ounce is a charged ounce, so 2.3 oz pays as 3 oz \u2014 $3. This rule always rounds UP.",
        lowFeedback: "Not far enough \u2014 the third ounce has already begun.",
        highFeedback: "Too far \u2014 only three ounces have been started." }),
      predict: predict("A 2.3-ounce letter under that rule is charged for how many ounces?",
        [["two", "2 \u2014 round to the nearest"], ["three", "3"], ["twoish", "2.3 \u2014 charged exactly"]],
        "three",
        "Step functions round in whichever direction their rule states, and \u2018each additional started ounce\u2019 rounds up. This is why the graph is flat between whole ounces and jumps exactly at them \u2014 the price cannot notice 2.3 as different from 2.9."),
    },
    { id: "k1", kind: "check", body: "Price it.", conceptTag: TAG,
      explanationVariants: ["2.3 oz is charged as 3 oz at $1 per ounce, so the cost is $3.",
                            "Round up to 3 started ounces, then multiply by the $1 rate."],
      widget: numeric({ prompt: "What does that 2.3-ounce letter cost, in dollars?", answer: 3,
        errors: [[2.3, "The rule charges by started OUNCES, not by exact weight \u2014 there is no such thing as a $2.30 stamp here."],
                 [2, "Rounding down; the third ounce has begun, and starting it is what triggers the charge."]],
        fallbackFeedback: "Three started ounces at $1 each is $3.",
        successFeedback: "$3 \u2014 and a 2.9 oz letter costs exactly the same, which is what a flat step means." }) },
    { id: "c2", kind: "concept", body: "Flat between jumps has a consequence worth naming: within one step the price carries no information about the exact input. Learning a letter cost $3 tells you the weight was more than 2 oz and at most 3 oz \u2014 a range, never a number. Steps trade precision for simplicity, on purpose." },
    { id: "k2", kind: "check", body: "Same price, different weights.", conceptTag: TAG,
      explanationVariants: ["Anything above 2 oz and up to 3 oz costs $3, so 2.1 and 2.9 agree.",
                            "The step is flat across the whole interval, so the two weights cannot be told apart by price."],
      widget: mcq("Which pair of letters costs the SAME under that rule?", [
        ["o1", "2.1 oz and 2.9 oz", true, "Yes \u2014 both have started the third ounce and neither has started a fourth, so both pay $3."],
        ["o2", "2.9 oz and 3.1 oz", false, "3.1 has started a FOURTH ounce, so it pays $4 while 2.9 pays $3."],
        ["o3", "1.9 oz and 2.1 oz", false, "They straddle a jump: 1.9 pays $2 and 2.1 pays $3."],
      ]) },
    { id: "k3", kind: "check", body: "Cross a jump.", conceptTag: TAG,
      explanationVariants: ["3.1 oz has started a fourth ounce, so it costs $4.",
                            "Round 3.1 up to 4 started ounces at $1 each."],
      widget: numeric({ prompt: "What does a 3.1-ounce letter cost, in dollars?", answer: 4,
        errors: [[3, "3.1 has crossed the jump \u2014 that extra tenth started a fourth ounce."],
                 [3.1, "The rule charges whole started ounces, so the cost lands on a whole number of dollars."]],
        fallbackFeedback: "3.1 oz means four started ounces, so $4.",
        successFeedback: "$4 \u2014 one tenth of an ounce more than 3.0, one whole dollar more to send." }) },
    { id: "ch1", kind: "challenge", body: "Read the step backwards.", conceptTag: TAG,
      explanationVariants: ["$5 covers weights above 4 oz and up to 5 oz, whose largest value is 5.",
                            "The step's right endpoint is included, so the heaviest $5 letter weighs exactly 5 oz."],
      hints: ["Ask which weights are charged $5 \u2014 the answer is a range, not a number.",
              "Five started ounces means the weight is more than 4 oz and at most 5 oz.",
              "The heaviest weight in that range is its right endpoint."],
      widget: numeric({ prompt: "Under that rule, what is the HEAVIEST letter that still costs $5, in ounces?", answer: 5,
        errors: [[4, "4 oz costs only $4 \u2014 four started ounces. The $5 range runs above 4 and up to 5."],
                 [6, "6 oz would have started a sixth ounce and cost $6."]],
        fallbackFeedback: "$5 buys five started ounces, so the range is 4 < w \u2264 5 and the heaviest is exactly 5 oz.",
        successFeedback: "5 oz \u2014 exactly on the step's edge, where the rule's \u2018at most\u2019 still includes it." }) },
    { id: "r1", kind: "recap", body: "Staircases in the wild.",
      takeaways: ["Step functions are piecewise rules whose branches are all flat.",
                  "Each branch rounds in the direction its rule states \u2014 started ounces round up.",
                  "Within a step the output carries no information about the exact input, only its range."],
      teaser: "Next up in Algebra: functions that stretch and shift as a family \u2014 the same moves you just made on the V." },
  ];
  lesson("avp-03-03", "steps-brackets-and-real-rules", "Steps, Brackets & Real Rules", "ch3-functions-in-pieces", 10, steps, remedialFrom(steps, TAG));
}

/* ------------------------- write ------------------------- */
must(L.length === 9, "9 lessons authored");
const specTitles = spec.lessons.map((l) => l.title);
const specTags = spec.lessons.map((l) => l.conceptTag);
must(JSON.stringify(L.map((l) => l.title)) === JSON.stringify(specTitles), "titles match the plan spec exactly");
for (let i = 0; i < 9; i++)
  must(L[i].steps.some((s) => s.conceptTag === specTags[i]) || L[i].remedials[0].conceptTag === specTags[i],
    `lesson ${i + 1} carries its planned conceptTag ${specTags[i]}`);

const CHAPTERS = [
  { id: "ch1-the-v", title: "The V", lessonIds: ["avp-01-01", "avp-01-02", "avp-01-03"] },
  { id: "ch2-equations-with-abs", title: "Equations with |x|", lessonIds: ["avp-02-01", "avp-02-02", "avp-02-03"] },
  { id: "ch3-functions-in-pieces", title: "Functions in Pieces", lessonIds: ["avp-03-01", "avp-03-02", "avp-03-03"] },
];
must(JSON.stringify(CHAPTERS.flatMap((c) => c.lessonIds)) === JSON.stringify(L.map((l) => l.id)), "chapter order matches lesson order");

const dir = join(root, "content/courses", SLUG);
must(!existsSync(dir), "course dir must not pre-exist");
mkdirSync(join(dir, "lessons"), { recursive: true });
writeFileSync(join(dir, "course.json"), JSON.stringify({
  id: SLUG, slug: SLUG, title: spec.title,
  tagline: "Absolute value as distance, the V and its moves, equations and inequalities with bars, and functions that change formula partway along.",
  category: "Math", gradeLevel: 9, chapters: CHAPTERS,
}, null, 2) + "\n");
for (const l of L) writeFileSync(join(dir, "lessons", `${l.id}.json`), JSON.stringify(l, null, 2) + "\n");

console.log(`built ${SLUG}: ${L.length} lessons, ${L.reduce((t, l) => t + l.steps.length, 0)} steps; ${asserts} assertions passed`);
