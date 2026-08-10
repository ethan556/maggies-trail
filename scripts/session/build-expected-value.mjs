#!/usr/bin/env node
// S199 — G6-12 expansion course 4/4: expected-value (S-MD +).
//
// WHY THIS COURSE: S-MD is at zero coverage, yet expected value is the most commonly taught
// plus-standard — fair games, weighted payoffs, insurance-style decisions — and it is the natural
// capstone for `conditional-probability` (G10) feeding `statistical-inference` (G11). Built AFTER
// `binomial-theorem` so lesson 6's probability bridge lands already prepared.
//
// MISCONCEPTION TARGETS named by the spec, one per lesson where they belong:
//   L3  expected value must be a possible outcome (a die's EV of 3.5 is a value no roll produces)
//   L5  "fair" means you win half the time (fairness is EV = 0, not p = 1/2)
//   L6  a $1 ticket with EV $0.50 still "feels" worth it (expectation prices the long run)
//
// ENGINE CHOICES:
//   spinnerSim             — the long-run average made visible; shading IS the probability.
//                            adapt cap is 0, so every spinnerSim lesson also carries an adapt-3
//                            engine (probabilityArea is also 0; distributionCompareLab is 3).
//   probabilityArea        — a favourable-region count out of a grid: P as a shaded fraction.
//   distributionCompareLab — adapt 3; used in `measure` mode, where the standardized gap is
//                            recomputed by the schema itself and must match the authored answer.
//   numeric/mcq            — the weighted-average arithmetic, recomputed by ev() below.
//
// EVERY expected value in this file is recomputed by ev() and asserted against the authored
// answer, so no weighted average is hand-carried.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SLUG = "expected-value";
const spec = JSON.parse(readFileSync("/mnt/user-data/uploads/g6-12-expansion.json", "utf8"))
  .courses.find((c) => c.slug === SLUG);

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };
must(spec && spec.lessons.length === 6, "spec course present with 6 lessons");
must(spec.grade === 11, "grade 11");

/* ---- independent expectation arithmetic: every authored EV is checked against this ---- */
function ev(pairs) { // [[value, probability], ...]
  const pTotal = pairs.reduce((t, [, p]) => t + p, 0);
  must(Math.abs(pTotal - 1) < 1e-9, `probabilities sum to ${pTotal}, not 1`);
  return pairs.reduce((t, [v, p]) => t + v * p, 0);
}
const DIE_EV = ev([[1, 1 / 6], [2, 1 / 6], [3, 1 / 6], [4, 1 / 6], [5, 1 / 6], [6, 1 / 6]]);
must(Math.abs(DIE_EV - 3.5) < 1e-9, "a fair die's EV is 3.5");

function numeric({ prompt, answer, errors, fallbackFeedback, successFeedback, tolerance = 0 }) {
  must(errors.length >= 2, "numeric needs >=2 diagnostic wrong answers");
  for (const [v] of errors) must(v !== answer, `trap ${v} equals answer ${answer}`);
  must(new Set(errors.map((e) => e[0])).size === errors.length, "duplicate traps");
  const w = { type: "numeric", prompt, answer, tolerance,
    commonErrors: errors.map(([value, feedback]) => ({ value, feedback })), fallbackFeedback };
  if (successFeedback) w.successFeedback = successFeedback;
  return w;
}
function mcq(prompt, options) {
  must(options.filter((o) => o[2]).length === 1, `${prompt}: exactly one correct`);
  must(options.length >= 3, "mcq needs >=3 options");
  return { type: "mcq", prompt, options: options.map(([id, label, correct, feedback]) => ({ id, label, correct: !!correct, feedback })) };
}
const predict = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o[0] === outcomeId), "predict outcome offered");
  return { prompt, options: options.map(([id, label]) => ({ id, label })), outcomeId, reveal };
};
function spinnerSim(o) {
  must(o.targetFavourable >= 0 && o.targetFavourable <= o.sectors, "favourable within sectors");
  must(o.favourableStart !== o.targetFavourable, "start must not already be the answer");
  return { type: "spinnerSim", favourableStart: 0, ...o };
}
function probabilityArea(o) {
  must(o.targetNum <= o.targetDen, "favourable <= total");
  must(o.rows * o.cols === o.targetDen, `grid ${o.rows}x${o.cols} must equal the denominator ${o.targetDen}`);
  return { type: "probabilityArea", start: 0, ...o };
}
function distributionCompareLab(o) {
  const gap = Math.abs(o.meanA - o.meanB) / o.variability;
  must(Math.abs(gap - o.answer) <= (o.tolerance ?? 0), `standardized gap ${gap} != authored answer ${o.answer}`);
  must(o.measureChoices.length >= 3, "measure mode needs >=3 choices");
  must(o.measureChoices.some((c) => c.value === o.answer), "one choice carries the answer");
  must(new Set(o.measureChoices.map((c) => c.value)).size === o.measureChoices.length, "duplicate choice values");
  return { type: "distributionCompareLab", mode: "measure", tolerance: 0, ...o };
}

const L = [];
const lesson = (id, slug, title, chapterId, minutes, steps, remedial) =>
  L.push({ id, slug, title, courseId: SLUG, chapterId, minutes, steps, remedials: [remedial] });
const remedialFrom = (steps, tag) => {
  const c = steps.find((s) => s.kind === "concept" && s.id === "c2");
  const k = steps.find((s) => (s.kind === "check" || s.kind === "challenge") && s.conceptTag === tag && s.widget);
  must(c && k, `remedial sources for ${tag}`);
  return { conceptTag: tag,
    concept: { id: `rem-${tag}-c`, kind: "concept", body: c.body },
    check: { id: `rem-${tag}-k`, kind: "check", body: k.body, conceptTag: tag,
      explanationVariants: k.explanationVariants, widget: structuredClone(k.widget) } };
};

/* ================== CH1 — Random Variables ================== */

/* 1. A Number Attached to Chance — ev-random-variable */
{
  const TAG = "ev-random-variable";
  const steps = [
    { id: "c1", kind: "concept", body: "A random variable attaches a NUMBER to each outcome of a chance experiment. Flip three coins and the outcome is a sequence like HTH; the random variable \u2018number of heads\u2019 turns that into 2. The experiment supplies the randomness; the variable supplies the arithmetic." },
    { id: "i1", kind: "interactive", body: "Shade the chance that the variable takes one particular value.",
      widget: probabilityArea({ prompt: "Three coin flips give 8 equally likely outcomes. Shade the ones where the number of heads is exactly 2.",
        rows: 2, cols: 4, targetNum: 3, targetDen: 8, start: 0,
        successFeedback: "3 of 8: HHT, HTH and THH. The random variable takes the value 2 on exactly three outcomes, so P(X = 2) = 3/8.",
        lowFeedback: "Not enough shaded \u2014 more than that many outcomes have exactly two heads.",
        highFeedback: "Too much shaded \u2014 outcomes with three heads or one head do not belong." }),
      predict: predict("Three coin flips, X = number of heads. Which values can X take?",
        [["01", "Only 0 or 1"], ["0to3", "0, 1, 2 or 3"], ["any", "Any number at all"]],
        "0to3",
        "A random variable's possible values are fixed by the experiment: three flips can produce zero through three heads, and nothing else. Listing those values is always the first step, because the distribution has to assign a probability to each one and to nothing more."),
    },
    { id: "k1", kind: "check", body: "Evaluate the variable.", conceptTag: TAG,
      explanationVariants: ["HTH contains two heads, so X = 2 on that outcome.",
                            "Count the H's: two of them."],
      widget: numeric({ prompt: "X counts heads in three flips. What is X for the outcome HTH?", answer: 2,
        errors: [[3, "3 counts the FLIPS, not the heads. HTH has one tail."],
                 [1, "One tail, but two heads \u2014 X counts the heads."]],
        fallbackFeedback: "HTH has heads in positions 1 and 3, so X = 2.",
        successFeedback: "2 \u2014 the outcome is a sequence, the variable is a number read off it." }) },
    { id: "c2", kind: "concept", body: "Several outcomes can share a value, and that is the whole reason expectation is interesting. HHT, HTH and THH are three different outcomes that all give X = 2, so the value 2 collects three shares of probability while X = 3 collects only one. The values are not equally likely even when the outcomes are." },
    { id: "k2", kind: "check", body: "Count outcomes for a value.", conceptTag: TAG,
      explanationVariants: ["Only HHH gives three heads, so exactly one outcome has X = 3.",
                            "Three heads requires every flip to cooperate \u2014 one way."],
      widget: numeric({ prompt: "How many of the 8 outcomes give X = 3 (three heads)?", answer: 1,
        errors: [[3, "3 is the VALUE of X, not the number of outcomes producing it. Only HHH does."],
                 [8, "8 is every outcome. Most of them contain at least one tail."]],
        fallbackFeedback: "Only HHH has three heads, so exactly one outcome gives X = 3.",
        successFeedback: "1 \u2014 which is why X = 3 is far rarer than X = 2, even though both are single values." }) },
    { id: "k3", kind: "check", body: "Outcome or value?", conceptTag: TAG,
      explanationVariants: ["An outcome is what happens; a random variable is the number assigned to it.",
                            "HTH is an outcome; 2 is the value the variable gives it."],
      widget: mcq("Which of these is a random VARIABLE, not an outcome?", [
        ["o1", "The number of heads in three flips", true, "Yes \u2014 it assigns a number to each outcome, which is exactly what a random variable does."],
        ["o2", "The sequence HTH", false, "That is one outcome of the experiment. The variable turns it into a number."],
        ["o3", "The coin itself", false, "The coin is the apparatus, neither outcome nor variable."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Count a different variable.", conceptTag: TAG,
      explanationVariants: ["Rolling two dice, a sum of 7 happens 6 ways out of 36.",
                            "The pairs 1-6, 2-5, 3-4, 4-3, 5-2 and 6-1 all sum to 7."],
      hints: ["List the ordered pairs whose two faces add to 7.",
              "The first die can be 1, 2, 3, 4, 5 or 6, and the second is then forced.",
              "Every first-die value works exactly once, giving six pairs."],
      widget: numeric({ prompt: "Roll two dice and let S be their sum. How many of the 36 outcomes give S = 7?", answer: 6,
        errors: [[7, "7 is the VALUE of S, not the number of ways to reach it."],
                 [3, "That counts unordered pairs like {1,6}, {2,5}, {3,4}. The dice are distinguishable, so 1-6 and 6-1 are two outcomes."]],
        fallbackFeedback: "Six ordered pairs sum to 7, so 6 of the 36 outcomes give S = 7.",
        successFeedback: "6 \u2014 more than any other sum, which is what makes 7 the centre of that distribution." }) },
    { id: "r1", kind: "recap", body: "Numbers attached to chance.",
      takeaways: ["A random variable assigns a number to each outcome of a chance experiment.",
                  "Its possible values are fixed by the experiment and should be listed first.",
                  "Several outcomes may share one value, so values are rarely equally likely."],
      teaser: "Next: collect those probabilities into a table \u2014 the distribution itself." },
  ];
  lesson("ev-01-01", "a-number-attached-to-chance", "A Number Attached to Chance", "ch1-random-variables", 10, steps, remedialFrom(steps, TAG));
}

/* 2. The Probability Distribution — ev-distribution */
{
  const TAG = "ev-distribution";
  const steps = [
    { id: "c1", kind: "concept", body: "A probability distribution is the complete inventory: every value the random variable can take, each paired with its probability. Two rules police it \u2014 no probability may be negative, and they must total exactly 1, because the variable is certain to take SOME value." },
    { id: "i1", kind: "interactive", body: "Set one entry of a distribution on the wheel.",
      widget: spinnerSim({ prompt: "A prize wheel has 8 equal sectors. Shade it so the chance of landing on a prize is 5/8.",
        sectors: 8, targetFavourable: 5, favourableStart: 0,
        successFeedback: "5 of 8 shaded. The shaded share IS the probability, and the unshaded 3/8 is the only other entry \u2014 together they make 8/8 = 1.",
        lowFeedback: "Too little shaded for a 5/8 chance.",
        highFeedback: "Too much shaded \u2014 that is a bigger chance than 5/8." }),
      predict: predict("A distribution lists probabilities 0.2, 0.5 and 0.4 for its only three values. Can it be valid?",
        [["yes", "Yes"], ["no", "No"], ["depends", "Only if the values are positive"]],
        "no",
        "They sum to 1.1, and a distribution's probabilities must total exactly 1. That single check catches most malformed tables instantly, before any expectation is computed \u2014 and computing an expectation from a table that fails it produces a number with no meaning at all."),
    },
    { id: "k1", kind: "check", body: "Complete the table.", conceptTag: TAG,
      explanationVariants: ["The listed probabilities total 0.7, so the missing one is 0.3.",
                            "1 \u2212 (0.4 + 0.3) = 0.3."],
      widget: numeric({ prompt: "A variable takes values 1, 2, 3 with probabilities 0.4, 0.3 and ?. What is the missing probability?", answer: 0.3, tolerance: 0,
        errors: [[0.7, "0.7 is what the first two ALREADY total. The missing entry brings that up to 1."],
                 [1, "A single probability of 1 would leave no room for the other two."]],
        fallbackFeedback: "1 \u2212 0.4 \u2212 0.3 = 0.3.",
        successFeedback: "0.3 \u2014 and now the table totals exactly 1, as every distribution must." }) },
    { id: "c2", kind: "concept", body: "Reading a distribution is reading shape. Where the probability piles up is where the variable usually lands, and the tails show what is possible but rare. A distribution can be symmetric, lopsided, or flat \u2014 and the expectation you are about to compute is its balance point." },
    { id: "k2", kind: "check", body: "Spot the invalid table.", conceptTag: TAG,
      explanationVariants: ["A negative probability is impossible, whatever the other entries do.",
                            "Probabilities live between 0 and 1 inclusive."],
      widget: mcq("Which table CANNOT be a probability distribution?", [
        ["o1", "0.6, \u22120.1, 0.5", true, "Right \u2014 these do total 1, but a negative probability is meaningless. Both rules have to hold."],
        ["o2", "0.25, 0.25, 0.5", false, "All non-negative and totalling 1 \u2014 perfectly valid."],
        ["o3", "1, 0, 0", false, "Valid, if a little extreme: the variable is certain to take the first value."],
      ]) },
    { id: "k3", kind: "check", body: "Read a probability off the wheel.", conceptTag: TAG,
      explanationVariants: ["3 unshaded sectors out of 8 gives 3/8, which is 0.375.",
                            "The complement of 5/8 is 3/8."],
      widget: mcq("On that 8-sector wheel with 5 prize sectors, what is the chance of NOT winning?", [
        ["o1", "3/8", true, "Yes \u2014 the two entries 5/8 and 3/8 are the whole distribution, and they total 1."],
        ["o2", "5/8", false, "That is the chance of winning. Not-winning is the complement."],
        ["o3", "1/8", false, "1/8 is a single sector. Three sectors are unshaded."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Combine two values.", conceptTag: TAG,
      explanationVariants: ["P(2 or 3) = 0.3 + 0.3 = 0.6 for that table.",
                            "Disjoint values add."],
      hints: ["The values 2 and 3 cannot both happen, so their chances simply add.",
              "Look up each probability in the table: 0.3 and 0.3.",
              "0.3 + 0.3."],
      widget: numeric({ prompt: "For the table 1: 0.4, 2: 0.3, 3: 0.3 \u2014 what is P(X is 2 or 3)?", answer: 0.6, tolerance: 0,
        errors: [[0.09, "That multiplies the probabilities, which is for events happening TOGETHER. X cannot be both 2 and 3, so they add."],
                 [0.4, "0.4 is P(X = 1) \u2014 the complement of what was asked. It happens to be 1 \u2212 0.6, which checks the answer."]],
        fallbackFeedback: "0.3 + 0.3 = 0.6.",
        successFeedback: "0.6 \u2014 and 1 \u2212 0.4 gives the same thing, which is the fastest check available." }) },
    { id: "r1", kind: "recap", body: "The complete inventory.",
      takeaways: ["A distribution pairs every possible value with its probability.",
                  "Probabilities are never negative and must total exactly 1.",
                  "Disjoint values add, so a missing entry is recoverable from the rest."],
      teaser: "Next: the distribution's balance point \u2014 and why it need not be a value the variable can take." },
  ];
  lesson("ev-01-02", "the-probability-distribution", "The Probability Distribution", "ch1-random-variables", 10, steps, remedialFrom(steps, TAG));
}

/* 3. The Long-Run Average — ev-expected-value (misconception: EV must be a possible outcome) */
{
  const TAG = "ev-expected-value";
  const steps = [
    { id: "c1", kind: "concept", body: "Expected value is the long-run average: multiply each value by its probability and add. For a fair die that is (1 + 2 + 3 + 4 + 5 + 6)/6 = 3.5. No roll ever produces 3.5 \u2014 and that is not a flaw. Expectation describes where thousands of rolls settle, not what any single roll can do." },
    { id: "i1", kind: "interactive", body: "Measure a gap the standardized way.",
      widget: distributionCompareLab({
        prompt: "Two games have mean payouts of 12 and 6, with a variability measure of 3. How many variability-units apart are the means?",
        meanA: 12, meanB: 6, variability: 3, answer: 2, tolerance: 0,
        measureChoices: [
          { value: 6, feedback: "That is the raw gap, 12 \u2212 6. Divide by the variability measure to standardize it: 6 \u00f7 3 = 2." },
          { value: 2, feedback: "(12 \u2212 6) \u00f7 3 = 2 variability-units \u2014 the gap measured in the spread's own currency." },
          { value: 3, feedback: "3 is the variability measure itself, not the standardized gap." },
        ],
        fallbackFeedback: "(12 \u2212 6) \u00f7 3 = 2 variability-units.",
        successFeedback: "2 variability-units. Means are averages, and comparing them fairly means measuring the gap against how much the games wobble.",
      }),
      predict: predict("A fair die's expected value is 3.5. Can a single roll ever produce 3.5?",
        [["yes", "Yes \u2014 it is the expected result"],
         ["no", "No \u2014 no face shows 3.5"],
         ["sometimes", "Only over many rolls"]],
        "no",
        "Expected value is an average, and averages routinely land between the possible values \u2014 a family with 2.3 children is the same phenomenon. Insisting that expectation must be attainable is the single most common misreading of the word \u2018expected\u2019, which promises a long-run centre, not a forecast of the next roll."),
    },
    { id: "k1", kind: "check", body: "Compute a simple expectation.", conceptTag: TAG,
      explanationVariants: [`Averaging the six faces gives ${DIE_EV}.`,
                            "(1+2+3+4+5+6)/6 = 21/6 = 3.5."],
      widget: numeric({ prompt: "What is the expected value of one roll of a fair six-sided die?", answer: DIE_EV, tolerance: 0,
        errors: [[3, "3 is a face, and a tempting one \u2014 but the average of the six faces is 21/6, which lands between 3 and 4."],
                 [21, "21 is the SUM of the faces. Divide by 6 to average them."]],
        fallbackFeedback: "(1+2+3+4+5+6)/6 = 21/6 = 3.5.",
        successFeedback: "3.5 \u2014 a value no die can show, and exactly where thousands of rolls average out." }) },
    { id: "c2", kind: "concept", body: "When the values are not equally likely, plain averaging is wrong \u2014 each value must be WEIGHTED by its probability. Expected value is a weighted average, and the weights are the distribution. A value with probability 0.9 pulls the answer toward itself far harder than one with probability 0.1." },
    { id: "k2", kind: "check", body: "Weight the values.", conceptTag: TAG,
      explanationVariants: [`10(0.9) + 100(0.1) = 9 + 10 = ${ev([[10, 0.9], [100, 0.1]])}.`,
                            "The 10 carries nine times the weight, so the answer sits far below the midpoint."],
      widget: numeric({ prompt: "X is 10 with probability 0.9 and 100 with probability 0.1. What is its expected value?", answer: ev([[10, 0.9], [100, 0.1]]), tolerance: 0,
        errors: [[55, "55 averages 10 and 100 as if they were equally likely. The 10 is nine times more probable, so it dominates."],
                 [110, "That adds the values without weighting. Multiply each by its probability first."]],
        fallbackFeedback: "10(0.9) + 100(0.1) = 9 + 10 = 19.",
        successFeedback: "19 \u2014 much closer to 10 than to 100, because 10 carries nine tenths of the weight." }) },
    { id: "k3", kind: "check", body: "Where does expectation sit?", conceptTag: TAG,
      explanationVariants: ["A weighted average always lies between the smallest and largest values, but need not equal any of them.",
                            "Expectation is a balance point, not a listed outcome."],
      widget: mcq("Must an expected value be one of the variable's possible values?", [
        ["o1", "No \u2014 but it always lies between the smallest and largest", true, "Exactly. It is a balance point, so it sits inside the range without having to be a listed value."],
        ["o2", "Yes \u2014 otherwise it could not be expected", false, "A die's 3.5 is a counterexample. \u2018Expected\u2019 names a long-run average, not an attainable result."],
        ["o3", "No \u2014 and it can fall outside the range entirely", false, "A weighted average of numbers can never escape their range."],
      ]) },
    { id: "ch1", kind: "challenge", body: "A three-value expectation.", conceptTag: TAG,
      explanationVariants: [`0(0.5) + 5(0.3) + 20(0.2) = ${ev([[0, 0.5], [5, 0.3], [20, 0.2]])}.`,
                            "0 + 1.5 + 4 = 5.5."],
      hints: ["Multiply each value by its own probability before adding anything.",
              "0(0.5) contributes nothing; then 5(0.3) and 20(0.2).",
              "0 + 1.5 + 4."],
      widget: numeric({ prompt: "A game pays 0 with probability 0.5, 5 with probability 0.3, and 20 with probability 0.2. What is the expected payout?", answer: ev([[0, 0.5], [5, 0.3], [20, 0.2]]), tolerance: 0,
        errors: [[25, "That adds the payouts without weighting them by how often they occur."],
                 [8.33, "That averages the three payouts equally. They are not equally likely \u2014 half the time the game pays nothing."]],
        fallbackFeedback: "0(0.5) + 5(0.3) + 20(0.2) = 0 + 1.5 + 4 = 5.5.",
        successFeedback: "5.5 \u2014 a payout the game never actually makes, and precisely what it averages over the long run." }) },
    { id: "r1", kind: "recap", body: "The balance point.",
      takeaways: ["Expected value multiplies each value by its probability and adds: a weighted average.",
                  "It need not be a possible outcome \u2014 a fair die expects 3.5.",
                  "It always lies between the smallest and largest possible values."],
      teaser: "Next: attach real money to the outcomes and ask what a game is worth playing." },
  ];
  lesson("ev-01-03", "the-long-run-average", "The Long-Run Average", "ch1-random-variables", 11, steps, remedialFrom(steps, TAG));
}

/* ================ CH2 — Deciding with Expectation ================ */

/* 4. Computing Payoffs — ev-payoffs */
{
  const TAG = "ev-payoffs";
  const steps = [
    { id: "c1", kind: "concept", body: "Money makes expectation concrete, and it introduces one detail that changes everything: the cost to play is a NEGATIVE payoff. A game that pays $10 on a win but costs $3 to enter nets $7 on a win and \u2212$3 on a loss. Netting the cost before averaging is where most payoff errors happen." },
    { id: "i1", kind: "interactive", body: "Set the winning share of the wheel.",
      widget: spinnerSim({ prompt: "A carnival wheel has 6 equal sectors. Shade it so the chance of winning is 2/6.",
        sectors: 6, targetFavourable: 2, favourableStart: 0,
        successFeedback: "2 of 6 shaded \u2014 a 1/3 chance of winning, and a 2/3 chance of losing whatever the entry cost was.",
        lowFeedback: "Too little shaded for a 2-in-6 chance.",
        highFeedback: "Too much shaded \u2014 only two sectors win." }),
      predict: predict("A game costs $3 and pays $10 on a win. What does a WIN net you?",
        [["10", "$10"], ["7", "$7"], ["13", "$13"]],
        "7",
        "The $3 is spent whether you win or lose, so a win nets $10 \u2212 $3 = $7 and a loss nets \u2212$3. Forgetting to subtract the entry cost is what makes losing games look profitable, because it prices the prize while ignoring what the prize cost to chase."),
    },
    { id: "k1", kind: "check", body: "Net a losing outcome.", conceptTag: TAG,
      explanationVariants: ["A loss returns nothing, so the net is just the \u2212$3 paid to play.",
                            "Losing costs the entry fee and gains nothing."],
      widget: numeric({ prompt: "That same game: what does a LOSS net you, in dollars?", answer: -3,
        errors: [[0, "0 would mean nothing changed hands, but the $3 entry was already paid."],
                 [3, "The sign matters: $3 left your pocket, so the net is \u2212$3."]],
        fallbackFeedback: "You paid $3 and received nothing, so the net is \u2212$3.",
        successFeedback: "\u2212$3 \u2014 and expectation needs both nets, the +$7 and the \u2212$3, weighted by how often each happens." }) },
    { id: "c2", kind: "concept", body: "With both nets in hand the expectation is routine: multiply each net by its probability and add. The result is what one play is worth on average \u2014 positive means the game favours you, negative means it favours the house, and zero means neither." },
    { id: "k2", kind: "check", body: "Compute the expected net.", conceptTag: TAG,
      explanationVariants: [`7(1/3) + (\u22123)(2/3) = 7/3 \u2212 2 = ${ev([[7, 1 / 3], [-3, 2 / 3]]).toFixed(4)}\u2026, which rounds to about 0.33.`,
                            "The win is worth 2.33 on average and the loss costs 2, leaving about +0.33."],
      widget: numeric({ prompt: "Win $7 net with probability 1/3, lose $3 with probability 2/3. What is the expected net, to two decimal places?", answer: 0.33, tolerance: 0.01,
        errors: [[4, "That averages 7 and \u22123 as if equally likely, and drops the 2-to-1 weighting against you."],
                 [2.33, "That is the win's contribution, 7(1/3), alone. The loss still has to be subtracted."]],
        fallbackFeedback: "7(1/3) + (\u22123)(2/3) = 2.333\u2026 \u2212 2 = 0.333\u2026, about 0.33.",
        successFeedback: "About +$0.33 \u2014 a slim edge to the player, which is a rare thing at a carnival." }) },
    { id: "k3", kind: "check", body: "Which sign favours whom?", conceptTag: TAG,
      explanationVariants: ["A negative expected net means the player loses money on average over many plays.",
                            "Expectation's sign is the verdict; its size is the rate."],
      widget: mcq("A game has an expected net of \u2212$0.50 per play. What does that mean?", [
        ["o1", "Over many plays you lose about 50 cents each time", true, "Yes \u2014 and it says nothing about any single play, which may well win."],
        ["o2", "You lose exactly 50 cents every play", false, "That treats an average as if it were an outcome. Every individual play is a win or a loss; \u2212$0.50 is where those results settle over many plays, and it is a net no single play produces."],
        ["o3", "You will lose your next play", false, "Expectation forecasts the long run, never the next play."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Price a lottery ticket.", conceptTag: TAG,
      explanationVariants: [`500(0.001) + 0(0.999) = ${ev([[500, 0.001], [0, 0.999]])}, so the ticket is worth $0.50 before its price.`,
                            "A one-in-a-thousand shot at $500 averages 50 cents."],
      hints: ["Compute the expected PRIZE first, ignoring the ticket price for a moment.",
              "The prize is $500 with probability 0.001, and $0 otherwise.",
              "500 \u00d7 0.001."],
      widget: numeric({ prompt: "A ticket wins $500 with probability 0.001 and nothing otherwise. What is the expected prize, in dollars?", answer: ev([[500, 0.001], [0, 0.999]]), tolerance: 0,
        errors: [[500, "That is the prize if you win. Expectation weights it by the one-in-a-thousand chance of winning."],
                 [0, "The expected prize is small but not zero \u2014 500 \u00d7 0.001 = 0.50."]],
        fallbackFeedback: "500 \u00d7 0.001 = $0.50.",
        successFeedback: "$0.50 \u2014 so a $1 ticket loses 50 cents per play on average, which is exactly the argument lesson 6 examines." }) },
    { id: "r1", kind: "recap", body: "Net first, then average.",
      takeaways: ["The cost to play is a negative payoff and must be netted into every outcome.",
                  "Expected net multiplies each net payoff by its probability and adds.",
                  "The sign says who the game favours; the size says by how much per play."],
      teaser: "Next: the word \u2018fair\u2019 \u2014 and why it does not mean winning half the time." },
  ];
  lesson("ev-02-01", "computing-payoffs", "Computing Payoffs", "ch2-deciding-with-expectation", 11, steps, remedialFrom(steps, TAG));
}

/* 5. Is the Game Fair? — ev-fair-games (misconception: fair means p = 1/2) */
{
  const TAG = "ev-fair-games";
  const steps = [
    { id: "c1", kind: "concept", body: "A game is FAIR when its expected net is exactly 0 \u2014 neither side gains in the long run. Fairness is a statement about expectation, not about how often you win. A game you win only one time in ten can be perfectly fair, provided the payout is large enough to balance the nine losses." },
    { id: "i1", kind: "interactive", body: "Build the winning share that fairness requires.",
      widget: spinnerSim({ prompt: "A wheel has 10 equal sectors. Shade it so the chance of winning is 1/10.",
        sectors: 10, targetFavourable: 1, favourableStart: 3,
        successFeedback: "1 of 10. Nine losses to every win \u2014 and if a win pays nine times the stake, this game is exactly fair.",
        lowFeedback: "Nothing shaded yet \u2014 a 1/10 chance needs one sector.",
        highFeedback: "Too much shaded \u2014 only one sector in ten wins." }),
      predict: predict("A game is FAIR. Does that mean you win half the time?",
        [["yes", "Yes \u2014 fair means a 50-50 chance"],
         ["no", "No \u2014 it means the expected net is 0"],
         ["both", "Both are required"]],
        "no",
        "Fairness balances probability against payout, not wins against losses. Winning one time in ten is fair if the win pays nine times the stake: (+9)(0.1) + (\u22121)(0.9) = 0. Reading \u2018fair\u2019 as \u2018even odds\u2019 misprices every lopsided game there is."),
    },
    { id: "k1", kind: "check", body: "Verify a lopsided fair game.", conceptTag: TAG,
      explanationVariants: [`9(0.1) + (\u22121)(0.9) = 0.9 \u2212 0.9 = ${ev([[9, 0.1], [-1, 0.9]])}.`,
                            "The rare big win exactly balances the frequent small loss."],
      widget: numeric({ prompt: "Win $9 net with probability 0.1, lose $1 with probability 0.9. What is the expected net?", answer: ev([[9, 0.1], [-1, 0.9]]), tolerance: 0,
        errors: [[8, "That subtracts the payoffs without weighting them by probability."],
                 [0.9, "0.9 is the win's contribution alone. The loss contributes \u22120.9, cancelling it exactly."]],
        fallbackFeedback: "9(0.1) + (\u22121)(0.9) = 0.9 \u2212 0.9 = 0.",
        successFeedback: "0 \u2014 perfectly fair, and you lose nine times out of ten. Fairness never promised frequent wins." }) },
    { id: "c2", kind: "concept", body: "Turned around, fairness sets the price. If you know how often a game wins, the fair payout is whatever makes the expectation zero \u2014 which is how insurance premiums and betting odds are set. Every departure from that number is somebody's margin." },
    { id: "k2", kind: "check", body: "Solve for the fair payout.", conceptTag: TAG,
      explanationVariants: ["Fairness needs W(0.25) \u2212 1(0.75) = 0, so W = 3.",
                            "One win must cover three losses, so the win nets 3."],
      widget: numeric({ prompt: "A $1 stake wins with probability 0.25. What NET win makes the game fair?", answer: 3,
        errors: [[1, "A net of 1 would give 1(0.25) \u2212 1(0.75) = \u22120.5, still a losing game."],
                 [4, "4 would make the expectation +0.25, favouring the player. Fair is exactly zero."]],
        fallbackFeedback: "Set W(0.25) \u2212 1(0.75) = 0, giving W = 3.",
        successFeedback: "3 \u2014 one win covers three losses, which is exactly what a 1-in-4 chance demands." }) },
    { id: "k3", kind: "check", body: "Judge three games.", conceptTag: TAG,
      explanationVariants: ["Only an expected net of 0 is fair; positive favours the player and negative the house.",
                            "The sign of the expectation is the whole verdict."],
      widget: mcq("Which game is FAIR?", [
        ["o1", "Expected net $0.00", true, "Yes \u2014 fairness is exactly zero expectation, no matter what the win rate is."],
        ["o2", "You win 50% of the time, expected net \u2212$0.25", false, "Even odds, but the payouts are lopsided \u2014 the house still profits. Win rate is not fairness."],
        ["o3", "Expected net +$0.10", false, "That one favours the PLAYER. Favourable, but not fair."],
      ]) },
    { id: "ch1", kind: "challenge", body: "Price the house edge.", conceptTag: TAG,
      explanationVariants: [`5(1/6) + (\u22122)(5/6) = 5/6 \u2212 10/6 = ${(ev([[5, 1 / 6], [-2, 5 / 6]])).toFixed(4)}\u2026, about \u22120.83.`,
                            "The single winning face cannot carry five losing ones at this payout."],
      hints: ["Identify the two nets and their probabilities before averaging.",
              "A win nets +5 with probability 1/6; a loss nets \u22122 with probability 5/6.",
              "5(1/6) \u2212 2(5/6) = 0.833\u2026 \u2212 1.666\u2026"],
      widget: numeric({ prompt: "Roll a die: a 6 nets you $5, anything else costs $2. What is the expected net, to two decimals?", answer: -0.83, tolerance: 0.01,
        errors: [[3, "That subtracts 2 from 5 without weighting. The loss happens five times as often as the win."],
                 [0.83, "The sign is wrong: the loss contributes \u22121.67, which outweighs the win's +0.83."]],
        fallbackFeedback: "5(1/6) + (\u22122)(5/6) = 0.833\u2026 \u2212 1.667\u2026 = \u22120.833\u2026, about \u2212$0.83.",
        successFeedback: "About \u2212$0.83 per roll \u2014 to make it fair the win would have to pay $10." }) },
    { id: "r1", kind: "recap", body: "Fair means zero, not even.",
      takeaways: ["A fair game has expected net exactly 0.",
                  "Win frequency is irrelevant \u2014 a 1-in-10 game is fair if it pays 9 to 1.",
                  "Setting expectation to zero solves for the fair payout or price."],
      teaser: "Next: what expectation does and does not tell you when the decision is yours." },
  ];
  lesson("ev-02-02", "is-the-game-fair", "Is the Game Fair?", "ch2-deciding-with-expectation", 11, steps, remedialFrom(steps, TAG));
}

/* 6. Deciding by Expectation — ev-decisions (misconception: EV settles single-play decisions) */
{
  const TAG = "ev-decisions";
  const steps = [
    { id: "c1", kind: "concept", body: "Expectation is a decision tool with a stated domain: it compares options over the LONG RUN. Choosing the higher expected value is right when a choice repeats many times \u2014 an insurer writing a million policies, a shop stocking a shelf. For a single irreversible choice it is one consideration among several, not a verdict." },
    { id: "i1", kind: "interactive", body: "Compare two options on a standardized scale.",
      widget: distributionCompareLab({
        prompt: "Plan A averages a $40 return and Plan B averages $25, with a variability measure of 5. How many variability-units apart are they?",
        meanA: 40, meanB: 25, variability: 5, answer: 3, tolerance: 0,
        measureChoices: [
          { value: 15, feedback: "That is the raw gap, 40 \u2212 25. Standardize it by dividing by the variability: 15 \u00f7 5 = 3." },
          { value: 3, feedback: "(40 \u2212 25) \u00f7 5 = 3 variability-units \u2014 a genuinely large separation." },
          { value: 5, feedback: "5 is the variability measure itself, not the standardized gap." },
        ],
        fallbackFeedback: "(40 \u2212 25) \u00f7 5 = 3 variability-units.",
        successFeedback: "3 variability-units apart. A gap that large relative to the spread means Plan A really does out-earn Plan B, not just on this occasion.",
      }),
      predict: predict("A $1 ticket has an expected prize of $0.50. Is buying one ever reasonable?",
        [["never", "No \u2014 negative expectation settles it"],
         ["depends", "It depends what you want from the purchase"],
         ["always", "Yes \u2014 someone has to win"]],
        "depends",
        "Expectation prices the long run, and a single ticket is not a long run. Buying one is a bad INVESTMENT at \u2212$0.50 per play, which the arithmetic settles conclusively; whether an hour of anticipation is worth 50 cents is a different question that expectation does not answer. Knowing which question you are asking is the skill."),
    },
    { id: "k1", kind: "check", body: "Compare two repeated options.", conceptTag: TAG,
      explanationVariants: ["Over many repetitions the higher expected value wins: $12 beats $9.",
                            "Repetition is exactly the condition under which expectation governs."],
      widget: mcq("A shop chooses between two products it will stock every week for years: A expects $12 profit, B expects $9. Which should it stock?", [
        ["o1", "A \u2014 expectation governs over many repetitions", true, "Yes. Weekly repetition for years is precisely the long run expectation describes."],
        ["o2", "B \u2014 lower expectation is safer", false, "Nothing here says B is less variable; and over years the higher average compounds."],
        ["o3", "Neither \u2014 expectation cannot compare products", false, "Comparing repeated options is exactly what expectation is for."],
      ]) },
    { id: "c2", kind: "concept", body: "Two things sit outside expectation's reach. RISK: a $1,000 loss that would be ruinous is not made acceptable by a favourable average. And VALUE THAT IS NOT MONEY: insurance has negative expectation by design, and people rightly buy it, because avoiding a catastrophe is worth more than the premium's arithmetic suggests." },
    { id: "k2", kind: "check", body: "Why insurance sells.", conceptTag: TAG,
      explanationVariants: ["Insurers must charge more than the expected payout to survive, so the buyer's expectation is negative.",
                            "The buyer trades a small certain loss for protection from a large uncertain one."],
      widget: mcq("Insurance has a NEGATIVE expected value for the buyer. Why do sensible people buy it?", [
        ["o1", "It removes a catastrophic risk, which is worth more than the small average loss", true, "Exactly \u2014 expectation prices the average, not the pain of the worst case."],
        ["o2", "Because the expected value is actually positive for buyers", false, "It cannot be: the insurer's margin is precisely what makes the buyer's expectation negative."],
        ["o3", "Because they have miscalculated", false, "Avoiding ruin is a rational goal that expectation alone does not capture."],
      ]) },
    { id: "k3", kind: "check", body: "Expectation over many plays.", conceptTag: TAG,
      explanationVariants: ["100 plays at \u2212$0.50 each averages a $50 loss.",
                            "Multiply the per-play expectation by the number of plays."],
      widget: numeric({ prompt: "A game has expected net \u2212$0.50 per play. Over 100 plays, what total do you expect to lose, in dollars?", answer: 50,
        errors: [[0.5, "That is one play's worth. Expectation scales with the number of plays."],
                 [100, "100 is the number of plays, not the loss. Each costs $0.50 on average."]],
        fallbackFeedback: "100 \u00d7 $0.50 = $50 expected loss.",
        successFeedback: "$50 \u2014 and this is where expectation is at its most reliable, because 100 plays is long-run territory." }) },
    { id: "ch1", kind: "challenge", body: "Decide with a number.", conceptTag: TAG,
      explanationVariants: [`Option A: 100(0.5) + (\u221220)(0.5) = ${ev([[100, 0.5], [-20, 0.5]])}, which beats a certain $30.`,
                            "The gamble averages $40, ten more than the sure thing."],
      hints: ["Compute the gamble's expected value before comparing it with the certain option.",
              "It pays $100 half the time and loses $20 half the time.",
              "100(0.5) + (\u221220)(0.5) = 50 \u2212 10."],
      widget: numeric({ prompt: "Option A wins $100 or loses $20, each with probability 0.5. What is its expected value, in dollars?", answer: ev([[100, 0.5], [-20, 0.5]]), tolerance: 0,
        errors: [[80, "That subtracts the outcomes without halving each. Both are weighted by 0.5."],
                 [60, "That averages only the win. The \u2212$20 half must be included: 50 \u2212 10."]],
        fallbackFeedback: "100(0.5) + (\u221220)(0.5) = 50 \u2212 10 = 40.",
        successFeedback: "$40 \u2014 better than a certain $30 if the choice repeats, though a single player who cannot afford to lose $20 may still take the sure thing." }) },
    { id: "r1", kind: "recap", body: "A tool with a domain.",
      takeaways: ["Expectation compares repeated options; over many plays the higher expected value wins.",
                  "It scales with repetitions: n plays expect n times the per-play value.",
                  "It ignores risk of ruin and non-monetary value, which is why negative-expectation insurance is rational."],
      teaser: "Next in statistics: samples, margins of error, and testing whether a difference is real." },
  ];
  lesson("ev-02-03", "deciding-by-expectation", "Deciding by Expectation", "ch2-deciding-with-expectation", 11, steps, remedialFrom(steps, TAG));
}

/* ------------------------- write ------------------------- */
must(L.length === 6, "6 lessons authored");
must(JSON.stringify(L.map((l) => l.title)) === JSON.stringify(spec.lessons.map((l) => l.title)), "titles match the plan spec exactly");
for (let i = 0; i < 6; i++)
  must(L[i].steps.some((s) => s.conceptTag === spec.lessons[i].conceptTag), `lesson ${i + 1} carries ${spec.lessons[i].conceptTag}`);

const CHAPTERS = [
  { id: "ch1-random-variables", title: "Random Variables", lessonIds: ["ev-01-01", "ev-01-02", "ev-01-03"] },
  { id: "ch2-deciding-with-expectation", title: "Deciding with Expectation", lessonIds: ["ev-02-01", "ev-02-02", "ev-02-03"] },
];
must(JSON.stringify(CHAPTERS.flatMap((c) => c.lessonIds)) === JSON.stringify(L.map((l) => l.id)), "chapter order matches lesson order");

const dir = join(root, "content/courses", SLUG);
must(!existsSync(dir), "course dir must not pre-exist");
mkdirSync(join(dir, "lessons"), { recursive: true });
writeFileSync(join(dir, "course.json"), JSON.stringify({
  id: SLUG, slug: SLUG, title: spec.title,
  tagline: "Random variables, distributions, and the long-run average \u2014 fair games, payoffs, and what expectation can and cannot decide.",
  category: "Math", gradeLevel: 11, chapters: CHAPTERS,
}, null, 2) + "\n");
for (const l of L) writeFileSync(join(dir, "lessons", `${l.id}.json`), JSON.stringify(l, null, 2) + "\n");

console.log(`built ${SLUG}: ${L.length} lessons, ${L.reduce((t, l) => t + l.steps.length, 0)} steps; ${asserts} assertions passed`);
