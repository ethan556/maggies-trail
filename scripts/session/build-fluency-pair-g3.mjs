#!/usr/bin/env node
// S186: build the fluency pair — mult-fluency-g3 (18 lessons) and division-fluency-g3 (12) — the
// first two courses over the S186 item-grain fact-family architecture. Every graded step declares
// `variant.factFamily`, so the lesson player folds each result into the learner's per-family
// leech box (Profile.factItems) in ADDITION to the conceptTag mastery estimate. That is the whole
// point of these two courses: fluency is tracked per ATOMIC FACT across every lesson that touches
// it, not per lesson-step the way the review queue works.
//
// Same factory contract as its three predecessors: per-lesson packs, the 9-step A-tier shape,
// every number derived and asserted, abort-before-write.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"));

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

/** Canonical fact-family key — MUST match src/lib/factFluency.ts's factFamilyKey exactly. */
const fam = (a, b) => `${Math.min(a, b)}x${Math.max(a, b)}`;

/* ----------------------------------------------------------------- widget builders */

/** The array/area manipulative: `requireFactors` pins the exact arrangement, so a learner who
 * hits the right AREA with the wrong factor pair is told so rather than passing. */
function array(prompt, w, h, opts = {}) {
  must(Number.isInteger(w) && Number.isInteger(h) && w > 0 && h > 0, `array factors ${w}x${h}`);
  const area = w * h;
  return {
    type: "areaModel", prompt, targetArea: area,
    wMax: Math.max(w + 2, 10), hMax: Math.max(h + 2, 10),
    wStart: 1, hStart: 1, square: false, countGrid: false, commonCounts: [],
    requireFactors: { w, h },
    factorFeedback: opts.factorFeedback ?? `That rectangle covers ${area} squares, but not as ${h} rows of ${w}. Build the arrangement the fact describes.`,
    successFeedback: opts.success ?? `${h} rows of ${w} is ${area} — the array shows the fact.`,
    lowFeedback: opts.low ?? `That is fewer than ${area} squares. Keep building until the array is complete.`,
    highFeedback: opts.high ?? `That is more than ${area} squares. The array should stop at ${h} rows of ${w}.`,
  };
}

/** Fixed-grid counting: the array is given, the learner counts it. */
function countArray(prompt, w, h, traps, opts = {}) {
  const area = w * h;
  const commonCounts = traps.map(([count, feedback]) => {
    must(count !== area && count >= 0, `countArray trap ${count} vs ${area}`);
    must(feedback.length >= 25, `countArray trap feedback short: ${feedback}`);
    return { count, feedback };
  });
  must(new Set(commonCounts.map((c) => c.count)).size === commonCounts.length, "countArray traps distinct");
  return {
    type: "areaModel", prompt, targetArea: area, wMax: w, hMax: h, wStart: w, hStart: h,
    square: false, countGrid: true, commonCounts,
    successFeedback: opts.success ?? `${h} rows of ${w} is ${area}.`,
    lowFeedback: `Keep counting — every square in all ${h} rows belongs to the total.`,
    highFeedback: `The grid holds only ${area} squares; counting past that means a square was counted twice.`,
  };
}

function numeric(prompt, answer, traps, fallback, success) {
  const commonErrors = traps.map(([value, feedback]) => {
    must(value !== answer, `numeric trap equals answer ${value}: ${prompt}`);
    must(feedback.length >= 25, `numeric trap feedback short (${feedback.length}): ${feedback}`);
    return { value, feedback };
  });
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `numeric traps distinct: ${prompt}`);
  return { type: "numeric", prompt, answer, tolerance: 0, unit: "", commonErrors, fallbackFeedback: fallback, successFeedback: success };
}

function mcq(prompt, correct, wrongs) {
  const opts = [{ label: String(correct[0]), feedback: correct[1], ok: true },
    ...wrongs.map(([l, f]) => ({ label: String(l), feedback: f, ok: false }))];
  must(new Set(opts.map((o) => o.label)).size === opts.length, `dup mcq labels: ${prompt}`);
  for (const o of opts) must(o.feedback.length >= 25, `mcq feedback short: ${o.feedback}`);
  const rot = prompt.length % opts.length;
  const shown = [...opts.slice(rot), ...opts.slice(0, rot)].map((o, i) => ({ id: `o${i}`, label: o.label, feedback: o.feedback, correct: o.ok }));
  must(shown.filter((o) => o.correct).length === 1, "exactly one correct");
  return { type: "mcq", prompt, options: shown };
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`The manipulated model and the mathematical relationship for ${tag.replace(/-/g, " ")} must stay consistent.`],
  misconceptions: [`Changing a visible feature without preserving the relationship that defines ${tag.replace(/-/g, " ")}.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `fact-fluency:${tag}`, delayed: true,
  counterfactualPrompt: "What change would make the model stop representing the same mathematical relationship?",
});

/** Variant declaration WITH the S186 fact-family key — the architecture's payoff. */
const V = (gen, form, factFamily) => (factFamily ? { gen, form, factFamily } : { gen, form });
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

/* --------------------------------------------------------------- reusable check packs */

const M = "g3-mult-fluency";
const Dv = "g3-div-fluency";

/** A single multiplication fact drill, fact-family tagged. */
const multFact = (a, b, form) => {
  const product = a * b;
  return {
    body: "Recall the fact.",
    ev: [`${a} groups of ${b} is ${product}.`, `${a} × ${b} = ${product} — one of the table facts worth knowing on sight.`],
    widget: numeric(`${a} × ${b} = ?`, product,
      [[product - a, `That is ${a} short of the product — one whole group of ${a} is missing.`],
       [a + b, `That adds the two factors instead of multiplying them. ${a} × ${b} means ${a} groups of ${b}.`]],
      `Skip-count by ${b}, ${a} times — or lean on a fact you already know and adjust.`,
      `Correct — ${a} × ${b} = ${product}.`),
    hints: [`Think in equal groups.`, `Skip-count by ${b}.`, `${a} × ${b} = ${product}.`],
    variant: V(M, form, fam(a, b)),
  };
};

/** Derive-a-fact drill. The prompt states a KNOWN neighbouring fact and asks for the target one
 * group up — the shape MultDeriveNumeric generates and its independent solver parses. A plain
 * "a × b = ?" prompt would be un-parseable under this form (the solver needs the known product),
 * so the derive lesson gets its own pack rather than reusing multFact. */
const deriveFact = (n, k) => {
  const known = n * k, target = (n + 1) * k;
  must(Number.isInteger(known) && Number.isInteger(target), `deriveFact ${n}x${k}`);
  return {
    body: "Use the fact you know.",
    ev: [`${n} × ${k} = ${known}; one more group of ${k} makes ${target}.`,
      `Stepping up one group adds the group size ${k}, not 1: ${known} + ${k} = ${target}.`],
    widget: numeric(`You know ${n} × ${k} = ${known}. Use it to find ${n + 1} × ${k}.`, target,
      [[known, `That repeats the known fact instead of using it — add one more group of ${k}.`],
       [known + n, `That adds ${n}, but one more GROUP means adding ${k}, the size of each group.`]],
      `One more group of ${k} than ${n} × ${k}.`,
      `Correct — ${known} + ${k} = ${target}.`),
    hints: [`Start from the fact you know.`, `One more group adds ${k}.`, `${known} + ${k} = ${target}.`],
    variant: V(M, "MultDeriveNumeric", fam(n + 1, k)),
  };
};

/** A single division fact drill, fact-family tagged. */
const divFact = (product, divisor, form) => {
  const quotient = product / divisor;
  must(Number.isInteger(quotient), `divFact ${product}/${divisor} not integer`);
  return {
    body: "Recall the fact.",
    ev: [`${divisor} × ${quotient} = ${product}, so ${product} ÷ ${divisor} = ${quotient}.`,
      `Dividing asks how many groups of ${divisor} fit in ${product}: ${quotient}.`],
    // ÷1 and n÷n are degenerate for the ordinary traps: dividing by 1 makes the "repeats the
    // total" trap EQUAL the answer, and n÷n makes "one too many" the original number. Both get
    // the special-case diagnoses the generator's own DivSpecialNumeric uses.
    widget: numeric(`${product} ÷ ${divisor} = ?`, quotient,
      divisor === 1
        ? [[1, `Dividing by 1 leaves the number unchanged — it does not become 1.`],
           [product - 1, `Dividing by 1 changes nothing; the answer is ${product} itself.`]]
        : product === divisor
          ? [[product, `That repeats the number instead of dividing it by itself.`],
             [0, `A nonzero number divided by itself is 1, never 0.`]]
          : [[product, `That repeats the total instead of dividing it into groups of ${divisor}.`],
             [quotient + 1, `That quotient is one too many — ${quotient + 1} × ${divisor} = ${(quotient + 1) * divisor}, which overshoots ${product}.`]],
      `Think the multiplication fact: ${divisor} × ? = ${product}.`,
      `Correct — ${product} ÷ ${divisor} = ${quotient}.`),
    hints: [`Think multiplication.`, `${divisor} × ? = ${product}.`, `${product} ÷ ${divisor} = ${quotient}.`],
    variant: V(Dv, form, fam(divisor, quotient)),
  };
};

/** Missing-factor drill. */
const missingFactor = (a, b) => {
  const product = a * b;
  return {
    body: "Find the missing factor.",
    ev: [`${a} × ${b} = ${product}, so the missing factor is ${b}.`, `Dividing undoes the multiplication: ${product} ÷ ${a} = ${b}.`],
    widget: numeric(`${a} × ? = ${product}`, b,
      [[product, `That repeats the product instead of naming the missing factor.`],
       [product - a, `That subtracts one group instead of finding how many groups of ${a} make ${product}.`]],
      `Divide the product by the known factor: ${product} ÷ ${a}.`,
      `Correct — ${a} × ${b} = ${product}.`),
    hints: [`A missing factor is a division.`, `${product} ÷ ${a} = ?`, `The missing factor is ${b}.`],
    variant: V(M, "MultMissingFactorNumeric", fam(a, b)),
  };
};

/** Fact-family reciprocal drill — the mult/div link, tagged to the SAME family. */
const factFamilyDrill = (a, b) => {
  const product = a * b;
  return {
    body: "Use the family.",
    ev: [`${a}, ${b} and ${product} form one fact family: ${a} × ${b} = ${product} and ${product} ÷ ${a} = ${b}.`,
      `Knowing one fact in the family gives you all four.`],
    widget: numeric(`If ${a} × ${b} = ${product}, what is ${product} ÷ ${a}?`, b,
      [[product, `That repeats the total. Division splits ${product} into groups of ${a}.`],
       [a, `That repeats the divisor instead of naming the quotient.`]],
      `The same three numbers make both facts — the quotient is the other factor.`,
      `Correct — ${product} ÷ ${a} = ${b}, the reciprocal of ${a} × ${b} = ${product}.`),
    hints: [`One family, four facts.`, `The quotient is the other factor.`, `${product} ÷ ${a} = ${b}.`],
    variant: V(M, "MultFactFamilyNumeric", fam(a, b)),
  };
};

/** Dividing by 1 needs its own pack: the generic divFact's "repeats the total" trap IS the
 * correct answer here (product === quotient when the divisor is 1), so the traps must name the
 * two real misconceptions instead — collapsing to 1, or losing one. */
const divByOne = (n) => ({
  body: "Recall the fact.",
  ev: [`One group holds everything, so ${n} ÷ 1 = ${n}.`, `Dividing by 1 leaves a number unchanged.`],
  widget: numeric(`${n} ÷ 1 = ?`, n,
    [[1, `Dividing by 1 leaves the number unchanged — the answer is not 1 just because the divisor is.`],
     [n - 1, `Dividing by 1 removes nothing at all; the total stays exactly ${n}.`]],
    `Splitting into ONE group puts everything in that group.`,
    `Correct — any number divided by 1 is itself: ${n} ÷ 1 = ${n}.`),
  hints: [`How many groups?`, `Just one group holds it all.`, `${n} ÷ 1 = ${n}.`],
  variant: V(Dv, "DivSpecialNumeric", fam(1, n)),
});

/* ------------------------------------------------------------------ lesson definitions */

const MULT = [];
const mdef = (n, ch, title, c1, c2, i1, k1, k2, k3, ch1, i2, recap, teaser) =>
  MULT.push({ n, ch, title, c1, c2, i1, k1, k2, k3, ch1, i2, recap, teaser });

// Chapter 1 — the easy-pattern tables (×2..×5, squares, ×10)
mdef(1, 1, "x2",
  "Multiplying by 2 is doubling: two equal groups joined together.",
  "Every ×2 fact is a double you already know from addition: 2 × 7 is 7 + 7.",
  { body: "Build two rows.", rep: "diagram",
    widget: () => array("Build an array with 2 rows of 6.", 6, 2, { success: "2 rows of 6 is 12 — doubling 6." }),
    predict: P("You will build 2 rows of 6. How many squares will the array hold?",
      [{ id: "d", label: "12 — double 6" }, { id: "s", label: "8 — 6 plus 2" }, { id: "n", label: "6 — one row's worth" }], "d",
      "Two equal rows of 6 means 6 + 6 = 12. Multiplying by 2 doubles the group size.") },
  multFact(2, 6, "MultTable2Numeric"), multFact(2, 9, "MultTable2Numeric"),
  multFact(2, 7, "MultTable2Numeric"), multFact(2, 8, "MultTable2Numeric"),
  { body: "Double a bigger group.", widget: () => array("Build an array with 2 rows of 9.", 9, 2, { success: "2 rows of 9 is 18." }) },
  ["Multiplying by 2 doubles.", "Every ×2 fact is an addition double.", "2 × n = n + n."],
  "next: the ×3 facts.");

mdef(2, 1, "x3",
  "Multiplying by 3 builds three equal groups — skip-count 3, 6, 9, 12.",
  "Three rows of the same size: the array grows one whole row at a time.",
  { body: "Build three rows.", rep: "diagram",
    widget: () => array("Build an array with 3 rows of 7.", 7, 3, { success: "3 rows of 7 is 21." }),
    predict: P("You will build 3 rows of 7. Which is closest to the total?",
      [{ id: "a", label: "21" }, { id: "b", label: "10" }, { id: "c", label: "37" }], "a",
      "Three groups of 7: 7, 14, 21. Adding the factors would give 10; the array shows why that is far too small.") },
  multFact(3, 7, "MultTable3Numeric"), multFact(3, 8, "MultTable3Numeric"),
  multFact(3, 6, "MultTable3Numeric"), multFact(3, 9, "MultTable3Numeric"),
  { body: "One more row of three.", widget: () => array("Build an array with 3 rows of 8.", 8, 3, { success: "3 rows of 8 is 24." }) },
  ["×3 means three equal groups.", "Skip-count 3, 6, 9, 12.", "Each row adds one more group."],
  "next: the ×4 facts.");

mdef(3, 1, "x4",
  "Multiplying by 4 is doubling twice: 4 × 7 is double 7, doubled again.",
  "Four equal rows. If you know the ×2 fact, the ×4 fact is one more doubling away.",
  { body: "Build four rows.", rep: "diagram",
    widget: () => array("Build an array with 4 rows of 6.", 6, 4, { success: "4 rows of 6 is 24 — double 12." }),
    predict: P("2 × 6 = 12. What will 4 × 6 be?",
      [{ id: "d", label: "24 — double it again" }, { id: "s", label: "14 — add 2 more" }, { id: "t", label: "18 — add another 6" }], "d",
      "Doubling the number of groups doubles the product: 4 × 6 is double 2 × 6 = 24.") },
  multFact(4, 6, "MultTable4Numeric"), multFact(4, 8, "MultTable4Numeric"),
  multFact(4, 7, "MultTable4Numeric"), multFact(4, 9, "MultTable4Numeric"),
  { body: "Double twice again.", widget: () => array("Build an array with 4 rows of 7.", 7, 4, { success: "4 rows of 7 is 28." }) },
  ["×4 is doubling twice.", "Know the ×2 fact, double it.", "Four equal rows."],
  "next: the ×5 facts.");

mdef(4, 1, "x5",
  "Multiplying by 5 lands on 5, 10, 15, 20 — every product ends in 5 or 0.",
  "That ending is a check, not the answer: 5 × 7 = 35 ends in 5, and so does 5 × 9 = 45.",
  { body: "Build five rows.", rep: "diagram",
    widget: () => array("Build an array with 5 rows of 6.", 6, 5, { success: "5 rows of 6 is 30." }),
    predict: P("Every ×5 product ends in which digits?",
      [{ id: "a", label: "5 or 0" }, { id: "b", label: "always 5" }, { id: "c", label: "any digit" }], "a",
      "Odd groups of 5 end in 5; even groups end in 0. The pattern checks an answer but does not name it.") },
  multFact(5, 7, "MultTable5Numeric"), multFact(5, 9, "MultTable5Numeric"),
  multFact(5, 6, "MultTable5Numeric"), multFact(5, 8, "MultTable5Numeric"),
  { body: "Five rows again.", widget: () => array("Build an array with 5 rows of 8.", 8, 5, { success: "5 rows of 8 is 40." }) },
  ["×5 skip-counts by fives.", "Products end in 5 or 0.", "The pattern checks; it does not answer."],
  "next: the ×10 facts.");

mdef(5, 1, "x10",
  "Multiplying by 10 shifts every digit one place left: 10 × 7 is 7 tens, or 70.",
  "The zero is not \u201Cadded\u201D — it marks the empty ones place after the digits move up.",
  { body: "Build ten rows.", rep: "diagram",
    widget: () => array("Build an array with 10 rows of 4.", 4, 10, { success: "10 rows of 4 is 40 — four tens." }),
    predict: P("What is 10 × 7?",
      [{ id: "a", label: "70 — seven tens" }, { id: "b", label: "17 — ten plus seven" }, { id: "c", label: "7 — unchanged" }], "a",
      "Ten groups of 7 is 7 tens = 70. Adding the factors gives 17, which is only one group plus ten.") },
  multFact(10, 7, "MultTable10Numeric"), multFact(10, 9, "MultTable10Numeric"),
  multFact(10, 6, "MultTable10Numeric"), multFact(10, 8, "MultTable10Numeric"),
  { body: "Ten rows again.", widget: () => array("Build an array with 10 rows of 6.", 6, 10, { success: "10 rows of 6 is 60." }) },
  ["×10 makes tens.", "Digits shift one place left.", "The zero marks the empty ones place."],
  "next: the square facts.");

mdef(6, 1, "squares",
  "A square fact multiplies a number by itself: 6 × 6, 7 × 7, 8 × 8.",
  "Its array is a perfect square — the same number of rows as columns.",
  { body: "Build a square.", rep: "diagram",
    widget: () => array("Build an array with 6 rows of 6.", 6, 6, { success: "6 rows of 6 is 36 — a square array." }),
    predict: P("What is special about the array for 6 × 6?",
      [{ id: "a", label: "Its rows and columns match" }, { id: "b", label: "It has only one row" }, { id: "c", label: "It cannot be built" }], "a",
      "Multiplying a number by itself gives an array as tall as it is wide — a square.") },
  multFact(6, 6, "MultSquaresNumeric"), multFact(7, 7, "MultSquaresNumeric"),
  multFact(8, 8, "MultSquaresNumeric"), multFact(9, 9, "MultSquaresNumeric"),
  { body: "A bigger square.", widget: () => array("Build an array with 8 rows of 8.", 8, 8, { success: "8 rows of 8 is 64." }) },
  ["A square multiplies a number by itself.", "Rows equal columns.", "6×6=36, 7×7=49, 8×8=64."],
  "next: the ×6 facts.");

// Chapter 2 — the harder tables
mdef(7, 2, "x6",
  "The ×6 facts double the ×3 facts: 6 × 7 is double 3 × 7.",
  "Deriving from a known fact is faster than counting, and it keeps working as numbers grow.",
  { body: "Build six rows.", rep: "diagram",
    widget: () => array("Build an array with 6 rows of 7.", 7, 6, { success: "6 rows of 7 is 42 — double 21." }),
    predict: P("3 × 7 = 21. What will 6 × 7 be?",
      [{ id: "d", label: "42 — double 21" }, { id: "s", label: "24 — add 3" }, { id: "t", label: "28 — add 7" }], "d",
      "Doubling the group count doubles the product: 6 × 7 is double 3 × 7 = 42.") },
  multFact(6, 7, "MultTable6Numeric"), multFact(6, 8, "MultTable6Numeric"),
  multFact(6, 9, "MultTable6Numeric"), multFact(6, 6, "MultTable6Numeric"),
  { body: "Six rows again.", widget: () => array("Build an array with 6 rows of 8.", 8, 6, { success: "6 rows of 8 is 48." }) },
  ["×6 doubles ×3.", "Derive from a fact you know.", "6 × 7 = 42."],
  "next: the ×7 facts.");

mdef(8, 2, "x7",
  "The ×7 facts have no easy pattern — they are the ones worth knowing outright.",
  "Where a pattern fails, a nearby fact still helps: 7 × 8 is 7 × 4 doubled.",
  { body: "Build seven rows.", rep: "diagram",
    widget: () => array("Build an array with 7 rows of 8.", 8, 7, { success: "7 rows of 8 is 56." }),
    predict: P("7 × 4 = 28. What will 7 × 8 be?",
      [{ id: "d", label: "56 — double 28" }, { id: "s", label: "32 — add 4" }, { id: "t", label: "35 — add 7" }], "d",
      "Doubling one factor doubles the product: 7 × 8 is double 7 × 4 = 56.") },
  multFact(7, 8, "MultTable7Numeric"), multFact(7, 6, "MultTable7Numeric"),
  multFact(7, 9, "MultTable7Numeric"), multFact(7, 7, "MultTable7Numeric"),
  { body: "Seven rows again.", widget: () => array("Build an array with 7 rows of 6.", 6, 7, { success: "7 rows of 6 is 42." }) },
  ["×7 has no shortcut pattern.", "Derive from a near fact.", "7 × 8 = 56."],
  "next: the ×8 facts.");

mdef(9, 2, "x8",
  "The ×8 facts double the ×4 facts — which are themselves doubled ×2 facts.",
  "8 × 6 is 4 × 6 doubled: 24 becomes 48.",
  { body: "Build eight rows.", rep: "diagram",
    widget: () => array("Build an array with 8 rows of 6.", 6, 8, { success: "8 rows of 6 is 48 — double 24." }),
    predict: P("4 × 6 = 24. What will 8 × 6 be?",
      [{ id: "d", label: "48 — double 24" }, { id: "s", label: "28 — add 4" }, { id: "t", label: "30 — add 6" }], "d",
      "Doubling the number of groups doubles the product: 8 × 6 = 48.") },
  multFact(8, 6, "MultTable8Numeric"), multFact(8, 7, "MultTable8Numeric"),
  multFact(8, 9, "MultTable8Numeric"), multFact(8, 4, "MultTable8Numeric"),
  { body: "Eight rows again.", widget: () => array("Build an array with 8 rows of 7.", 7, 8, { success: "8 rows of 7 is 56." }) },
  ["×8 doubles ×4.", "Double twice from ×2.", "8 × 6 = 48."],
  "next: the ×9 facts.");

mdef(10, 2, "x9",
  "The ×9 facts sit one group below the ×10 facts: 9 × 7 is 70 minus 7.",
  "Subtracting from a ten fact is faster than skip-counting nine times.",
  { body: "Build nine rows.", rep: "diagram",
    widget: () => array("Build an array with 9 rows of 7.", 7, 9, { success: "9 rows of 7 is 63 — one row short of 70." }),
    predict: P("10 × 7 = 70. What will 9 × 7 be?",
      [{ id: "d", label: "63 — one group of 7 less" }, { id: "s", label: "69 — one less" }, { id: "t", label: "60 — ten less" }], "d",
      "One fewer GROUP means 7 fewer, not 1 fewer: 70 − 7 = 63.") },
  multFact(9, 7, "MultTable9Numeric"), multFact(9, 6, "MultTable9Numeric"),
  multFact(9, 8, "MultTable9Numeric"), multFact(9, 4, "MultTable9Numeric"),
  { body: "Nine rows again.", widget: () => array("Build an array with 9 rows of 6.", 6, 9, { success: "9 rows of 6 is 54." }) },
  ["×9 is ×10 minus one group.", "One fewer group, not one fewer.", "9 × 7 = 63."],
  "next: the facts that stick.");

mdef(11, 2, "hard-facts",
  "A handful of facts resist every pattern: 6×7, 6×8, 7×8, 7×9, 8×9.",
  "These are worth memorizing outright — deriving them every time is what slows fluency down.",
  { body: "Build the classic one.", rep: "diagram",
    widget: () => array("Build an array with 7 rows of 8.", 8, 7, { success: "7 rows of 8 is 56 — the fact worth knowing on sight." }),
    predict: P("Why are facts like 7 × 8 harder than 5 × 8?",
      [{ id: "a", label: "They have no skip-count shortcut" }, { id: "b", label: "Their products are odd" }, { id: "c", label: "They break multiplication rules" }], "a",
      "×5 and ×10 have digit patterns; ×6 through ×9 do not, so these need direct recall or a derived step.") },
  multFact(7, 8, "MultHardFactsNumeric"), multFact(6, 8, "MultHardFactsNumeric"),
  multFact(7, 9, "MultHardFactsNumeric"), multFact(8, 9, "MultHardFactsNumeric"),
  { body: "Another sticky one.", widget: () => array("Build an array with 6 rows of 8.", 8, 6, { success: "6 rows of 8 is 48." }) },
  ["Some facts have no pattern.", "Memorize the sticky handful.", "7×8=56, 8×9=72."],
  "next: deriving from a fact you know.");

mdef(12, 2, "derive",
  "When a fact will not come, build it from one that does: 7 × 6 is 7 × 5 plus one more 7.",
  "Adding or subtracting one group turns a known fact into its neighbor.",
  { body: "Add one group.", rep: "diagram",
    widget: () => array("Build an array with 6 rows of 7.", 7, 6, { success: "6 rows of 7 is 42 — one row more than 35." }),
    predict: P("5 × 7 = 35. What is 6 × 7?",
      [{ id: "a", label: "42 — add one more 7" }, { id: "b", label: "36 — add one" }, { id: "c", label: "40 — add 5" }], "a",
      "One more GROUP adds 7, not 1: 35 + 7 = 42.") },
  deriveFact(5, 7), deriveFact(5, 9),
  deriveFact(3, 8), deriveFact(5, 8),
  { body: "One group less.", widget: () => array("Build an array with 4 rows of 8.", 8, 4, { success: "4 rows of 8 is 32." }) },
  ["Build unknown facts from known ones.", "One more group adds the group size.", "5×7=35, so 6×7=42."],
  "next: mixed practice to 5 × 5.");

// Chapter 3 — mixing, recall, and the whole table
mdef(13, 3, "mixed-small",
  "Mixed practice tests recall rather than a table's rhythm: the facts arrive out of order.",
  "Out of order is the real test — in a table, the next answer is predictable.",
  { body: "Count the array.", rep: "diagram",
    widget: () => countArray("Count the squares in this 4 by 5 array.", 5, 4,
      [[9, "That adds the rows and columns instead of counting every square in the rectangle."],
       [5, "That counts a single row. All 4 rows belong to the total."]],
      { success: "4 rows of 5 is 20." }),
    predict: P("Why is mixed practice harder than one table in order?",
      [{ id: "a", label: "You cannot predict the next answer" }, { id: "b", label: "The facts are different ones" }, { id: "c", label: "The numbers get bigger" }], "a",
      "In a table each product is the last plus the group size. Mixed order removes that crutch and tests real recall.") },
  multFact(3, 4, "MultMixedSmallNumeric"), multFact(5, 5, "MultMixedSmallNumeric"),
  multFact(2, 5, "MultMixedSmallNumeric"), multFact(4, 4, "MultMixedSmallNumeric"),
  { body: "Count another.", widget: () => countArray("Count the squares in this 3 by 5 array.", 5, 3,
    [[8, "That adds 3 and 5 instead of counting all the squares."], [5, "That counts one row only; there are 3 rows."]],
    { success: "3 rows of 5 is 15." }) },
  ["Mixed practice tests recall.", "Order hides no clues.", "Facts must come on sight."],
  "next: mixed facts to 9 × 9.");

mdef(14, 3, "mixed-large",
  "Now the whole range, out of order: any factor pair from 2 through 9.",
  "Fluency means the answer arrives without a detour through skip-counting.",
  { body: "Count the array.", rep: "diagram",
    widget: () => countArray("Count the squares in this 6 by 7 array.", 7, 6,
      [[13, "That adds 6 and 7 instead of counting every square."],
       [7, "That counts one row. There are 6 rows of 7."]],
      { success: "6 rows of 7 is 42." }),
    predict: P("A fact you have to skip-count to reach — is it fluent yet?",
      [{ id: "a", label: "Not yet — fluent means immediate" }, { id: "b", label: "Yes, the answer is right" }, { id: "c", label: "Only for small facts" }], "a",
      "A correct answer reached by counting is real understanding, but fluency means recall without the detour.") },
  multFact(7, 9, "MultMixedLargeNumeric"), multFact(6, 8, "MultMixedLargeNumeric"),
  multFact(8, 9, "MultMixedLargeNumeric"), multFact(7, 6, "MultMixedLargeNumeric"),
  { body: "Count another.", widget: () => countArray("Count the squares in this 8 by 6 array.", 6, 8,
    [[14, "That adds the two side lengths instead of counting the squares."], [6, "That counts one row; there are 8 rows."]],
    { success: "8 rows of 6 is 48." }) },
  ["Any pair, any order.", "Fluent means immediate.", "Counting is understanding, not yet fluency."],
  "next: finding a fact fast.");

mdef(15, 3, "recall-speed",
  "Speed comes from recall, not rushing: a remembered fact needs no working out.",
  "If a fact still needs a detour, that is the one to practise — not the ones already automatic.",
  { body: "Count quickly.", rep: "diagram",
    widget: () => countArray("Count the squares in this 5 by 7 array.", 7, 5,
      [[12, "That adds 5 and 7 rather than counting the squares."], [7, "That counts one row of the five."]],
      { success: "5 rows of 7 is 35." }),
    predict: P("Which facts deserve the most practice?",
      [{ id: "a", label: "The ones that still need working out" }, { id: "b", label: "The ones already automatic" }, { id: "c", label: "All of them equally" }], "a",
      "Practice is worth most where recall is slowest. Facts already automatic gain little from repetition.") },
  multFact(8, 7, "MultRecallSpeedNumeric"), multFact(9, 6, "MultRecallSpeedNumeric"),
  multFact(6, 9, "MultRecallSpeedNumeric"), multFact(9, 8, "MultRecallSpeedNumeric"),
  { body: "One more.", widget: () => countArray("Count the squares in this 9 by 4 array.", 4, 9,
    [[13, "That adds the sides instead of counting squares."], [4, "That counts a single row of the nine."]],
    { success: "9 rows of 4 is 36." }) },
  ["Recall beats rushing.", "Practise the slow facts.", "Automatic facts need no drilling."],
  "next: the missing factor.");

mdef(16, 3, "missing-factor",
  "A missing factor turns multiplication around: 6 × ? = 42 asks what completes the fact.",
  "Finding it is division in disguise: 42 ÷ 6 = 7.",
  { body: "Build to the target.", rep: "diagram",
    widget: () => array("Build an array with 6 rows that holds 42 squares.", 7, 6, { success: "6 rows of 7 is 42 — the missing factor is 7." }),
    predict: P("6 × ? = 42. How do you find the missing factor?",
      [{ id: "a", label: "Divide 42 by 6" }, { id: "b", label: "Subtract 6 from 42" }, { id: "c", label: "Add 6 to 42" }], "a",
      "Division undoes multiplication, so the missing factor is 42 ÷ 6 = 7.") },
  missingFactor(6, 7), missingFactor(8, 6), missingFactor(7, 9), missingFactor(9, 8),
  { body: "Another target.", widget: () => array("Build an array with 8 rows that holds 48 squares.", 6, 8, { success: "8 rows of 6 is 48." }) },
  ["A missing factor is a division.", "Divide the product by the known factor.", "6 × 7 = 42."],
  "next: fact families.");

mdef(17, 3, "fact-family",
  "Three numbers make one fact family: 6, 7 and 42 give two multiplications and two divisions.",
  "Learning one fact of the family gives you all four at once.",
  { body: "Build the family's array.", rep: "diagram",
    widget: () => array("Build an array with 6 rows of 7.", 7, 6, { success: "6 rows of 7 is 42 — and 42 ÷ 6 = 7, 42 ÷ 7 = 6." }),
    predict: P("6 × 7 = 42. How many other facts does that give you free?",
      [{ id: "a", label: "Three — one more product and two quotients" }, { id: "b", label: "None" }, { id: "c", label: "One" }], "a",
      "The family holds 6×7=42, 7×6=42, 42÷6=7 and 42÷7=6 — four facts from one relationship.") },
  factFamilyDrill(6, 7), factFamilyDrill(8, 9), factFamilyDrill(7, 8), factFamilyDrill(6, 9),
  { body: "Another family.", widget: () => array("Build an array with 8 rows of 9.", 9, 8, { success: "8 rows of 9 is 72." }) },
  ["Three numbers, four facts.", "Multiplication and division share a family.", "6, 7, 42."],
  "next: the whole table.");

mdef(18, 3, "full-table",
  "The whole table is every fact from 2 × 2 to 10 × 10 — and by now most of it is familiar.",
  "What remains is a short list of stubborn facts, and those are the ones worth naming.",
  { body: "Count the biggest array.", rep: "diagram",
    widget: () => countArray("Count the squares in this 9 by 9 array.", 9, 9,
      [[18, "That adds the two sides instead of counting all the squares."], [9, "That counts one row of the nine."]],
      { success: "9 rows of 9 is 81." }),
    predict: P("After all this practice, what is left to work on?",
      [{ id: "a", label: "The few facts still not automatic" }, { id: "b", label: "Every fact, from the start" }, { id: "c", label: "Nothing" }], "a",
      "Most of the table is now recall. Fluency work narrows to the specific facts that still need a detour.") },
  multFact(9, 9, "MultWholeTableNumeric"), multFact(8, 8, "MultWholeTableNumeric"),
  multFact(7, 7, "MultWholeTableNumeric"), multFact(6, 6, "MultWholeTableNumeric"),
  { body: "One last array.", widget: () => countArray("Count the squares in this 10 by 7 array.", 7, 10,
    [[17, "That adds 10 and 7 instead of counting the squares."], [7, "That counts one row of the ten."]],
    { success: "10 rows of 7 is 70." }) },
  ["The table is 2×2 through 10×10.", "Most facts are now recall.", "Name the few that still resist."],
  "next course: division fluency.");

const DIV = [];
const ddef = (n, ch, title, c1, c2, i1, k1, k2, k3, ch1, i2, recap, teaser) =>
  DIV.push({ n, ch, title, c1, c2, i1, k1, k2, k3, ch1, i2, recap, teaser });

ddef(1, 1, "div2",
  "Dividing by 2 splits a total into two equal groups — halving.",
  "Halving undoes doubling: 2 × 8 = 16, so 16 ÷ 2 = 8.",
  { body: "Split into two rows.", rep: "diagram",
    widget: () => array("Build an array with 2 rows that holds 16 squares.", 8, 2, { success: "16 split into 2 rows gives 8 in each." }),
    predict: P("16 ÷ 2 — what is the question really asking?",
      [{ id: "a", label: "How many in each of 2 equal groups" }, { id: "b", label: "16 minus 2" }, { id: "c", label: "16 plus 2" }], "a",
      "Division splits a total into equal groups. 16 shared into 2 groups gives 8 each.") },
  divFact(16, 2, "DivBy2Numeric"), divFact(18, 2, "DivBy2Numeric"),
  divFact(14, 2, "DivBy2Numeric"), divFact(20, 2, "DivBy2Numeric"),
  { body: "Halve another.", widget: () => array("Build an array with 2 rows that holds 14 squares.", 7, 2, { success: "14 ÷ 2 = 7." }) },
  ["Dividing by 2 halves.", "Halving undoes doubling.", "16 ÷ 2 = 8."],
  "next: dividing by 3.");

ddef(2, 1, "div3",
  "Dividing by 3 asks how many groups of 3 fit — or how many are in each of 3 equal shares.",
  "Both readings give the same quotient, and both undo a ×3 fact.",
  { body: "Split into three rows.", rep: "diagram",
    widget: () => array("Build an array with 3 rows that holds 21 squares.", 7, 3, { success: "21 split into 3 rows gives 7 in each." }),
    predict: P("3 × 7 = 21. What is 21 ÷ 3?",
      [{ id: "a", label: "7 — the other factor" }, { id: "b", label: "18 — subtract 3" }, { id: "c", label: "24 — add 3" }], "a",
      "Division undoes multiplication: the quotient is the factor that is not the divisor.") },
  divFact(21, 3, "DivBy3Numeric"), divFact(24, 3, "DivBy3Numeric"),
  divFact(18, 3, "DivBy3Numeric"), divFact(27, 3, "DivBy3Numeric"),
  { body: "Three rows again.", widget: () => array("Build an array with 3 rows that holds 24 squares.", 8, 3, { success: "24 ÷ 3 = 8." }) },
  ["÷3 makes three equal shares.", "It undoes a ×3 fact.", "21 ÷ 3 = 7."],
  "next: dividing by 4 and 5.");

ddef(3, 1, "div45",
  "Dividing by 4 halves twice; dividing by 5 undoes the familiar ×5 facts.",
  "A quotient can always be checked by multiplying it back.",
  { body: "Split into four rows.", rep: "diagram",
    widget: () => array("Build an array with 4 rows that holds 28 squares.", 7, 4, { success: "28 split into 4 rows gives 7 in each." }),
    predict: P("How can you check that 28 ÷ 4 = 7?",
      [{ id: "a", label: "Multiply: 7 × 4 = 28" }, { id: "b", label: "Add: 7 + 4 = 11" }, { id: "c", label: "Subtract: 28 − 4 = 24" }], "a",
      "Multiplying the quotient by the divisor must return the original total — the definitive check.") },
  divFact(28, 4, "DivBy45Numeric"), divFact(35, 5, "DivBy45Numeric"),
  divFact(36, 4, "DivBy45Numeric"), divFact(45, 5, "DivBy45Numeric"),
  { body: "Five rows.", widget: () => array("Build an array with 5 rows that holds 35 squares.", 7, 5, { success: "35 ÷ 5 = 7." }) },
  ["÷4 halves twice.", "÷5 undoes the ×5 facts.", "Check by multiplying back."],
  "next: dividing by 6 and 7.");

ddef(4, 1, "div67",
  "Dividing by 6 and 7 undoes the harder tables — the same facts, read backwards.",
  "If the multiplication fact is automatic, the division is too.",
  { body: "Split into six rows.", rep: "diagram",
    widget: () => array("Build an array with 6 rows that holds 42 squares.", 7, 6, { success: "42 split into 6 rows gives 7 in each." }),
    predict: P("You know 6 × 7 = 42. How hard is 42 ÷ 6?",
      [{ id: "a", label: "Just as easy — same family" }, { id: "b", label: "Much harder" }, { id: "c", label: "Impossible without a table" }], "a",
      "The division is the same relationship read the other way, so a fluent product makes a fluent quotient.") },
  divFact(42, 6, "DivBy67Numeric"), divFact(56, 7, "DivBy67Numeric"),
  divFact(48, 6, "DivBy67Numeric"), divFact(63, 7, "DivBy67Numeric"),
  { body: "Seven rows.", widget: () => array("Build an array with 7 rows that holds 56 squares.", 8, 7, { success: "56 ÷ 7 = 8." }) },
  ["÷6 and ÷7 undo the hard tables.", "Same fact, read backwards.", "42 ÷ 6 = 7."],
  "next: dividing by 8 and 9.");

ddef(5, 2, "div89",
  "Dividing by 8 and 9 completes the harder quotients.",
  "For ÷9, the ×10 shortcut still helps: 63 is 70 minus 7, and 63 ÷ 9 = 7.",
  { body: "Split into eight rows.", rep: "diagram",
    widget: () => array("Build an array with 8 rows that holds 72 squares.", 9, 8, { success: "72 split into 8 rows gives 9 in each." }),
    predict: P("72 ÷ 8 — which multiplication fact answers it?",
      [{ id: "a", label: "8 × 9 = 72" }, { id: "b", label: "8 + 9 = 17" }, { id: "c", label: "72 × 8" }], "a",
      "Find the factor that multiplies 8 to reach 72: that factor, 9, is the quotient.") },
  divFact(72, 8, "DivBy89Numeric"), divFact(63, 9, "DivBy89Numeric"),
  divFact(64, 8, "DivBy89Numeric"), divFact(81, 9, "DivBy89Numeric"),
  { body: "Nine rows.", widget: () => array("Build an array with 9 rows that holds 63 squares.", 7, 9, { success: "63 ÷ 9 = 7." }) },
  ["÷8 and ÷9 finish the tables.", "Find the matching product.", "72 ÷ 8 = 9."],
  "next: dividing by 10.");

ddef(6, 2, "div10",
  "Dividing by 10 shifts every digit one place right: 70 ÷ 10 = 7.",
  "The digits move down a place; the zero in the ones place disappears.",
  { body: "Split into ten rows.", rep: "diagram",
    widget: () => array("Build an array with 10 rows that holds 70 squares.", 7, 10, { success: "70 split into 10 rows gives 7 in each." }),
    predict: P("What is 70 ÷ 10?",
      [{ id: "a", label: "7 — seven tens split into ten groups" }, { id: "b", label: "60 — subtract 10" }, { id: "c", label: "700" }], "a",
      "70 is 7 tens; splitting into 10 equal groups leaves 7 in each.") },
  divFact(70, 10, "DivBy10Numeric"), divFact(90, 10, "DivBy10Numeric"),
  divFact(60, 10, "DivBy10Numeric"), divFact(80, 10, "DivBy10Numeric"),
  { body: "Ten rows again.", widget: () => array("Build an array with 10 rows that holds 90 squares.", 9, 10, { success: "90 ÷ 10 = 9." }) },
  ["÷10 shifts digits right.", "Seven tens become seven.", "70 ÷ 10 = 7."],
  "next: think multiplication.");

ddef(7, 2, "think-mult",
  "The fastest division strategy is a multiplication question: 56 ÷ 7 asks 7 × ? = 56.",
  "Every division fact has a multiplication twin — and the twin is usually the one already fluent.",
  { body: "Find the matching product.", rep: "diagram",
    widget: () => array("Build an array with 7 rows that holds 56 squares.", 8, 7, { success: "7 × 8 = 56, so 56 ÷ 7 = 8." }),
    predict: P("Which question is easier to answer?",
      [{ id: "a", label: "7 × ? = 56" }, { id: "b", label: "56 ÷ 7 by counting down" }, { id: "c", label: "Neither" }], "a",
      "Recalling the product is usually faster than repeated subtraction — the twin fact does the work.") },
  divFact(56, 7, "DivThinkMultNumeric"), divFact(48, 8, "DivThinkMultNumeric"),
  divFact(54, 6, "DivThinkMultNumeric"), divFact(72, 9, "DivThinkMultNumeric"),
  { body: "Another twin.", widget: () => array("Build an array with 8 rows that holds 48 squares.", 6, 8, { success: "48 ÷ 8 = 6." }) },
  ["Turn division into multiplication.", "Every fact has a twin.", "56 ÷ 7 asks 7 × ? = 56."],
  "next: missing factors and quotients.");

ddef(8, 2, "missing",
  "A missing number can sit in either position: 6 × ? = 54 or 54 ÷ ? = 9.",
  "Both are the same family — identify which number is missing, then use the twin fact.",
  { body: "Complete the array.", rep: "diagram",
    widget: () => array("Build an array with 6 rows that holds 54 squares.", 9, 6, { success: "6 × 9 = 54, so the missing number is 9." }),
    predict: P("54 ÷ ? = 9. What is the missing divisor?",
      [{ id: "a", label: "6 — because 6 × 9 = 54" }, { id: "b", label: "45" }, { id: "c", label: "63" }], "a",
      "The divisor and quotient are the two factors: since 6 × 9 = 54, the missing divisor is 6.") },
  divFact(54, 6, "DivMissingNumeric"), divFact(42, 7, "DivMissingNumeric"),
  divFact(36, 9, "DivMissingNumeric"), divFact(40, 8, "DivMissingNumeric"),
  { body: "Another missing piece.", widget: () => array("Build an array with 7 rows that holds 42 squares.", 6, 7, { success: "42 ÷ 7 = 6." }) },
  ["The missing number can be anywhere.", "Divisor and quotient are the factors.", "6 × 9 = 54."],
  "next: dividing by 1 and by itself.");

ddef(9, 3, "special",
  "Two special cases: dividing by 1 changes nothing, and dividing a number by itself gives 1.",
  "8 ÷ 1 = 8, because one group holds everything. 8 ÷ 8 = 1, because it makes exactly one full group.",
  { body: "One single row.", rep: "diagram",
    widget: () => array("Build an array with 1 row that holds 8 squares.", 8, 1, { success: "One row of 8 — dividing by 1 leaves the total unchanged." }),
    predict: P("What is 8 ÷ 1?",
      [{ id: "a", label: "8 — one group holds it all" }, { id: "b", label: "1" }, { id: "c", label: "0" }], "a",
      "Splitting into ONE group puts everything in that group, so the quotient is the original number.") },
  divFact(8, 1, "DivSpecialNumeric"), divFact(9, 9, "DivSpecialNumeric"),
  divFact(12, 1, "DivSpecialNumeric"), divFact(7, 7, "DivSpecialNumeric"),
  { body: "A single full group.", widget: () => array("Build an array with 9 rows that holds 9 squares.", 1, 9, { success: "9 ÷ 9 = 1 — exactly one full group." }) },
  ["÷1 leaves a number unchanged.", "A number ÷ itself is 1.", "8÷1=8, 8÷8=1."],
  "next: why you cannot divide by zero.");

ddef(10, 3, "zero",
  "Dividing by zero has no answer at all — it is undefined, not zero.",
  "Because no number times 0 can give anything but 0, there is nothing for 7 ÷ 0 to equal.",
  { body: "Count a real array.", rep: "diagram",
    widget: () => countArray("Count the squares in this 4 by 6 array.", 6, 4,
      [[10, "That adds 4 and 6 instead of counting every square."], [6, "That counts one row of the four."]],
      { success: "4 rows of 6 is 24." }),
    predict: P("Why does 7 ÷ 0 have no answer?",
      [{ id: "a", label: "No number times 0 gives 7" }, { id: "b", label: "The answer is 0" }, { id: "c", label: "The answer is 7" }], "a",
      "Division asks what times the divisor gives the total. Since anything × 0 = 0, nothing × 0 can give 7.") },
  { body: "Zero as divisor.", ev: ["Nothing multiplied by 0 gives a nonzero total.", "Division by zero has no answer at all."],
    widget: mcq("What is 7 ÷ 0?",
      ["Undefined — division by zero has no answer", "Correct — no number multiplied by 0 gives 7, so the division has no answer."],
      [["0", "If 7 ÷ 0 were 0, then 0 × 0 would have to equal 7, but 0 × 0 = 0."],
       ["7", "If 7 ÷ 0 were 7, then 7 × 0 would have to equal 7, but 7 × 0 = 0."],
       ["1", "If 7 ÷ 0 were 1, then 1 × 0 would have to equal 7, but 1 × 0 = 0."]]),
    hints: ["Division asks a multiplication question.", "What times 0 gives 7?", "Nothing does — it is undefined."],
    variant: V(Dv, "DivZeroMcq") },
  { body: "Zero divided.", ev: ["0 ÷ 5 = 0: nothing shared among five is nothing each.", "Zero AS the total is fine; zero as the divisor is not."],
    widget: numeric("0 ÷ 5 = ?", 0,
      [[5, "That repeats the divisor. Sharing nothing among 5 groups leaves nothing in each."],
       [1, "Zero shared into 5 groups gives 0 in each group, not 1."]],
      "There is nothing to share, so each group receives nothing.",
      "Correct — 0 ÷ 5 = 0. Zero as the TOTAL is fine; only zero as the DIVISOR is undefined."),
    hints: ["Zero is the total here.", "Share nothing among five.", "0 ÷ 5 = 0."] },
  { body: "Zero as divisor again.", ev: ["Any nonzero total divided by 0 is undefined.", "No multiplication can produce it."],
    widget: mcq("What is 12 ÷ 0?",
      ["Undefined — division by zero has no answer", "Correct — nothing multiplied by 0 can give 12, so there is no quotient."],
      [["0", "If 12 ÷ 0 were 0, then 0 × 0 would have to equal 12, but 0 × 0 = 0."],
       ["12", "If 12 ÷ 0 were 12, then 12 × 0 would have to equal 12, but 12 × 0 = 0."],
       ["1", "If 12 ÷ 0 were 1, then 1 × 0 would have to equal 12, but 1 × 0 = 0."]]),
    hints: ["Ask the multiplication question.", "What times 0 gives 12?", "Nothing — undefined."],
    variant: V(Dv, "DivZeroMcq") },
  { body: "Tell them apart.", ev: ["0 ÷ 8 = 0; 8 ÷ 0 is undefined.", "The position of the zero decides."],
    widget: mcq("Which of these has an answer?",
      ["0 ÷ 8", "Correct — zero shared into 8 groups gives 0 in each. Zero as the total is perfectly fine."],
      [["8 ÷ 0", "Zero as the DIVISOR is undefined — no number times 0 gives 8."],
       ["Both are undefined", "Only division BY zero is undefined; zero divided by a number is simply 0."],
       ["Neither has an answer", "0 ÷ 8 does have an answer: 0."]]),
    hints: ["Where is the zero?", "Zero as total vs zero as divisor.", "0 ÷ 8 = 0 has an answer."] },
  { body: "Count once more.", widget: () => countArray("Count the squares in this 5 by 6 array.", 6, 5,
    [[11, "That adds the sides instead of counting the squares."], [6, "That counts one row of the five."]],
    { success: "5 rows of 6 is 30." }) },
  ["Division by zero is undefined.", "Zero divided by a number is 0.", "The zero's position decides."],
  "next: mixed division facts.");

ddef(11, 3, "mixed",
  "Mixed division practice: any divisor from 2 to 10, out of order.",
  "Out of order removes the table's rhythm and tests genuine recall.",
  { body: "Count the array.", rep: "diagram",
    widget: () => countArray("Count the squares in this 6 by 8 array.", 8, 6,
      [[14, "That adds 6 and 8 instead of counting all the squares."], [8, "That counts one row of the six."]],
      { success: "6 rows of 8 is 48." }),
    predict: P("What makes mixed division practice harder?",
      [{ id: "a", label: "The divisor changes every time" }, { id: "b", label: "The numbers are bigger" }, { id: "c", label: "Division changes rules" }], "a",
      "A single-divisor page lets you settle into one rhythm. Mixing divisors forces each fact to be recalled on its own.") },
  divFact(48, 6, "DivMixedNumeric"), divFact(63, 7, "DivMixedNumeric"),
  divFact(72, 8, "DivMixedNumeric"), divFact(45, 9, "DivMixedNumeric"),
  { body: "Count another.", widget: () => countArray("Count the squares in this 7 by 9 array.", 9, 7,
    [[16, "That adds 7 and 9 rather than counting the squares."], [9, "That counts one row of the seven."]],
    { success: "7 rows of 9 is 63." }) },
  ["Any divisor, any order.", "Rhythm is gone; recall remains.", "48 ÷ 6 = 8."],
  "next: choosing the operation.");

ddef(12, 3, "choose",
  "The last skill is choosing: does the problem ask you to combine equal groups, or to split a total?",
  "Known groups and group size means multiply. A known total that must be shared means divide.",
  { body: "Combine equal groups.", rep: "diagram",
    widget: () => array("Build an array showing 6 bags with 7 apples in each.", 7, 6, { success: "6 groups of 7 is 42 apples — that is multiplication." }),
    predict: P("6 bags with 7 apples each. Multiply or divide?",
      [{ id: "a", label: "Multiply — the total is missing" }, { id: "b", label: "Divide — split the apples" }, { id: "c", label: "Subtract" }], "a",
      "Both the number of groups and the size of each are known; the TOTAL is missing, so combine by multiplying.") },
  { body: "Which operation?", ev: ["Groups and group size known, total missing: multiply.", "The missing quantity decides the operation."],
    widget: mcq("There are 6 bags with 7 apples in each bag. Which operation finds the total number of apples?",
      ["Multiply", "Correct — equal groups combine by multiplying: 6 × 7 = 42."],
      [["Divide", "Dividing splits a total into groups — here the groups and the amount in each are known, and the TOTAL is missing."],
       ["Subtract", "Subtracting would remove apples rather than combining the equal groups."]]),
    hints: ["What is missing?", "Groups and size are known.", "Multiply."],
    variant: V(Dv, "DivChooseMcq") },
  { body: "The other direction.", ev: ["Total known, shared evenly: divide.", "A known total that must be split means division."],
    widget: mcq("There are 42 apples split evenly into 6 bags. Which operation finds how many apples are in each bag?",
      ["Divide", "Correct — splitting a total evenly into groups is division: 42 ÷ 6 = 7."],
      [["Multiply", "Multiplying would combine groups — here the total is already known and needs to be SPLIT."],
       ["Add", "Adding would grow the total rather than sharing it among the bags."]]),
    hints: ["What is missing now?", "The total is known.", "Divide."],
    variant: V(Dv, "DivChooseMcq") },
  divFact(42, 6, "DivMixedNumeric"),
  // ch1 — the challenge: the operation choice is only decidable from WHICH quantity is missing,
  // so this pair states the same three numbers both ways and asks for the total, not the operation.
  { body: "Decide, then compute.", ev: ["9 groups of 4 known, total missing: multiply to get 36.", "Name the missing quantity first; the operation follows from it."],
    widget: numeric("There are 9 shelves with 4 books on each shelf. How many books in all?", 36,
      [[13, "That adds 9 and 4. Equal groups combine by multiplying, not adding."],
       [2.25, "That divides 9 by 4. The total is missing here, so the groups must be combined."]],
      "Both the number of groups and the size of each group are known — combine them.",
      "Correct — 9 groups of 4 make 36 books."),
    hints: ["Which quantity is missing?", "Groups and group size are both known.", "9 × 4 = 36."] },
    // No variant: this challenge asks the learner to CHOOSE the operation and then COMPUTE, and
    // no g3-div-fluency form emits that combined numeric shape. Tagging it DivChooseMcq (an mcq
    // form) would declare a surface the step does not have. A fixed, un-refreshed problem is the
    // honest cost; inventing a mismatched form would break the resolver's type contract.
  { body: "Split a total.", widget: () => array("Build an array showing 56 apples split evenly into 8 bags.", 7, 8, { success: "56 ÷ 8 = 7 apples in each bag." }) },
  ["Missing total: multiply.", "Missing share: divide.", "Read what the problem gives you."],
  "next course: multi-digit multiplication and division.");

/* ------------------------------------------------------------------------- assembly */

function build(courseSlug, defs, chapterTitles, perChapter) {
  const courseSpec = spec.courses.find((c) => c.slug === courseSlug);
  must(courseSpec && courseSpec.lessons.length === defs.length, `${courseSlug} spec size ${defs.length}`);
  const prefix = courseSlug === "mult-fluency-g3" ? "mf3" : "df3";
  const chapters = chapterTitles.map((t, i) => ({ id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`, title: t, lessonIds: [] }));
  const chCount = chapters.map(() => 0);
  const outDir = join(root, `content/courses/${courseSlug}`);
  mkdirSync(join(outDir, "lessons"), { recursive: true });

  for (const [idx, d] of defs.entries()) {
    const row = courseSpec.lessons[idx];
    const tag = row.conceptTag;
    const seq = chCount[d.ch - 1] + 1; chCount[d.ch - 1]++;
    const id = `${prefix}-0${d.ch}-0${seq}`;
    chapters[d.ch - 1].lessonIds.push(id);
    const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const mk = (sid, pack, kind = "check") => ({
      id: sid, kind, body: pack.body, conceptTag: tag,
      explanationVariants: pack.ev, widget: pack.widget, hints: pack.hints,
      ...(pack.variant ? { variant: pack.variant } : {}), cml: cml(tag, "diagram"),
    });
    const i1w = d.i1.widget();
    const i2w = d.i2.widget();
    const lesson = {
      id, slug, title: row.title, courseId: courseSlug,
      chapterId: chapters[d.ch - 1].id, minutes: 7, readingProfile: "standard",
      steps: [
        { id: "c1", kind: "concept", figure: "bar-compare", body: d.c1, narration: d.c1 },
        { id: "i1", kind: "interactive", body: d.i1.body, conceptTag: tag, widget: i1w, predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
        mk("k1", d.k1),
        { id: "c2", kind: "concept", figure: "bar-compare", body: d.c2, narration: d.c2 },
        { id: "i2", kind: "interactive", body: d.i2.body, conceptTag: tag, widget: i2w, cml: cml(tag, "diagram") },
        mk("k2", d.k2),
        mk("k3", d.k3),
        mk("ch1", d.ch1, "challenge"),
        { id: "r1", kind: "recap", body: "You did it!", takeaways: d.recap, teaser: d.teaser },
      ],
      remedials: [{
        conceptTag: tag,
        concept: { id: `rem-${tag}-c`, kind: "concept", body: d.c2, narration: d.c2 },
        check: {
          id: `rem-${tag}-k`, kind: "check", body: "", conceptTag: tag,
          explanationVariants: d.k1.ev,
          widget: d.k1.widget.type === "numeric"
            ? { ...d.k1.widget, commonErrors: d.k1.widget.commonErrors.slice(0, 2) }
            : d.k1.widget,
        },
      }],
    };

    // structural asserts
    let factTagged = 0;
    for (const s of lesson.steps) {
      const w = s.widget;
      if (!w) continue;
      if (w.type === "areaModel") {
        if (w.requireFactors) must(w.requireFactors.w * w.requireFactors.h === w.targetArea, `${id}/${s.id} factors vs area`);
        if (w.countGrid) for (const c of w.commonCounts) must(c.count !== w.targetArea, `${id}/${s.id} count trap`);
        must(w.wMax >= (w.requireFactors?.w ?? w.wStart) && w.hMax >= (w.requireFactors?.h ?? w.hStart), `${id}/${s.id} area bounds`);
      }
      if (w.type === "numeric") for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} numeric trap`);
      if (w.type === "mcq") must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq single correct`);
      if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
      if (s.variant) {
        must(s.variant.gen === M || s.variant.gen === Dv, `${id}/${s.id} variant gen ${s.variant.gen}`);
        if (s.variant.factFamily) {
          must(/^\d+x\d+$/.test(s.variant.factFamily), `${id}/${s.id} factFamily shape ${s.variant.factFamily}`);
          const [lo, hi] = s.variant.factFamily.split("x").map(Number);
          must(lo <= hi, `${id}/${s.id} factFamily not canonical ${s.variant.factFamily}`);
          factTagged++;
        }
      }
    }
    // Every fluency lesson must exercise the S186 fact-grain architecture — EXCEPT the genuinely
    // conceptual ones, where no fact family exists to tag. Division by zero is not a fact: the
    // whole lesson is reasoning about why no quotient can exist, so DivZeroMcq deliberately
    // carries no factFamily (see g3FluencyVariants.ts). The exemption is an explicit allowlist
    // rather than a relaxed threshold, so a fact lesson that silently loses its tagging still fails.
    const CONCEPTUAL_NO_FACT = new Set(["g3d-zero", "g3d-choose"]);
    must(factTagged >= 1 || CONCEPTUAL_NO_FACT.has(tag),
      `${id}: no step carries a factFamily — the S186 architecture would be unexercised`);
    const rw = lesson.remedials[0].check.widget;
    must(rw.type === "numeric" || rw.type === "mcq", `${id} remedial widget ${rw.type}`);
    writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
  }
  must(chCount.every((c, i) => c === perChapter[i]), `${courseSlug} chapter sizes ${chCount}`);
  writeFileSync(join(outDir, "course.json"), JSON.stringify({
    id: courseSlug, slug: courseSlug, title: courseSpec.title,
    tagline: courseSlug === "mult-fluency-g3"
      ? "Build every multiplication fact from arrays, then make them automatic."
      : "Turn every division fact into the multiplication fact you already know.",
    category: "Math", gradeLevel: 3, chapters,
  }, null, 2) + "\n");
  return chapters.flatMap((c) => c.lessonIds);
}

const multIds = build("mult-fluency-g3", MULT, ["Easy-Pattern Tables", "The Harder Tables", "Mixed Recall"], [6, 6, 6]);
const divIds = build("division-fluency-g3", DIV, ["Dividing by 2 to 7", "Dividing by 8 to 10", "Special Cases and Choosing"], [4, 4, 4]);
console.log(`built ${multIds.length + divIds.length} lessons across 2 courses; ${asserts} internal assertions all passed`);
console.log("mult:", multIds.join(" "));
console.log("div :", divIds.join(" "));
