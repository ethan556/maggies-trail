#!/usr/bin/env node
// S196 — Batch E course 2/5: fraction-multiply-g4 (4.NF.B.4). Zero new generator code.
//
// Family: g4-fractions, backed by the COMPUTATIONAL solver g4Independent.cjs. Routes probed
// against the shipped solver before authoring:
//   faWholeTimesFractionNumeric     "Compute W × N/D as ?/D…"                       -> W*N
//   faWholeTimesFractionWordNumeric "W identical recipes each use N/D…"             -> W*N
//   faWholeTimesFractionMcq         "…finds W × N/D…"  -> exact `(W × N)/D`
//   faLikeDenomWordNumeric          two like fractions, NO "were available"         -> a.num+b.num
//   faImproperToMixedNumeric        "Convert N/D to a mixed number… WHOLE NUMBER part?" -> floor(N/D)
//   faMixedToImproperNumeric        "Convert W N/D to an improper fraction…"        -> W*D+N
//   faSimplifyNumeric               first fraction in the prompt                    -> num/gcd
//   faBenchmarkOrderMcq             three like fractions; labels exactly "n/d"      -> the MIDDLE
// NOT usable: faBenchmarkCompareMcq. Despite the name it GENERATES an exactNumberLab widget, not
// an mcq, so a step declaring it fails the resolver's "same widget surface" gate. Probed, not assumed.
// The "were available" trap is asserted: that substring flips faLikeDenomWordNumeric from
// addition to subtraction. Manipulatives are fractionBar and numberLinePlace (both manip 2,
// adapt 3); numberLinePlace on a fraction line must be authored in JUMP UNITS
// (min 0, max = fractionDen, step 1, tickStep 1) or the integrity gate rejects it.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "fraction-multiply-g4");
if (!spec || spec.lessons.length !== 12) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

function corpusTemplate(type, fromCourse = null) {
  const courses = fromCourse ? [fromCourse] : readdirSync(join(root, "content/courses"));
  for (const c of courses) {
    const dir = join(root, "content/courses", c, "lessons");
    let files; try { files = readdirSync(dir).sort(); } catch { continue; }
    for (const f of files) {
      const lesson = JSON.parse(readFileSync(join(dir, f), "utf8"));
      for (const s of lesson.steps) if (s.widget?.type === type) return structuredClone(s.widget);
    }
  }
  throw new Error("no corpus template for " + type);
}
const BAR_T = corpusTemplate("fractionBar", "fractions");
const NLP_T = corpusTemplate("numberLinePlace", "fractions");
const EST_T = corpusTemplate("estimateSlider", "multiplication-division");

const REG_FA = new Set(["faEquivalenceRecapMcq","faEquivalenceRecapNumeric","faEquivalenceRuleNumeric",
  "faSimplifyNumeric","faBenchmarkCompareMcq","faBenchmarkOrderMcq","faBenchmarkOrderNumeric",
  "faBenchmarkOrderRational","faLikeDenomWordMcq","faLikeDenomWordNumeric","faImproperToMixedNumeric",
  "faMixedToImproperNumeric","faMixedAddSubMixed","faMixedAddSubNumeric","faWholeTimesFractionMcq",
  "faWholeTimesFractionMixed","faWholeTimesFractionNumeric","faWholeTimesFractionWordNumeric"]);
const REG = { "g4-fractions": REG_FA };

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFromString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const pick = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
const choose = (r, xs) => xs[pick(r, 0, xs.length - 1)];
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));

function traps2(answer, cands) {
  const out = [];
  for (const [v, fb] of cands) {
    if (v !== answer && v >= 0 && Number.isInteger(v) && !out.some((o) => o[0] === v)) out.push([v, fb]);
    if (out.length === 2) break;
  }
  for (let d = 3; out.length < 2; d++) {
    const v = answer + d;
    if (!out.some((o) => o[0] === v)) {
      out.push([v, "That count of pieces does not follow from the model — recount the same-size pieces."]);
    }
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

const ONE = { 2: "half", 3: "third", 4: "fourth", 5: "fifth", 6: "sixth", 8: "eighth" };
const MANY = { 2: "halves", 3: "thirds", 4: "fourths", 5: "fifths", 6: "sixths", 8: "eighths" };

/* ---------------- graded mirrors ---------------- */
function UnitMultipleNumeric(r) {
  const den = choose(r, [3, 4, 5, 6, 8]);
  const w = pick(r, 2, den - 1);
  return { gen: "g4-fractions", form: "faWholeTimesFractionNumeric",
    prompt: `Compute ${w} × 1/${den} as ?/${den}. What is the numerator?`, answer: w,
    traps: traps2(w, [
      [den, `${den} is the DENOMINATOR — it names the piece size and never changes when you collect pieces.`],
      [w + den, `Adding the two numbers mixes a count of pieces with a piece size; only the count grows.`]]) };
}
function GeneralProductNumeric(r) {
  const den = choose(r, [3, 4, 5, 6, 8]);
  const num = pick(r, 2, den - 1);
  const w = pick(r, 2, 5);
  const ans = w * num;
  return { gen: "g4-fractions", form: "faWholeTimesFractionNumeric",
    prompt: `Compute ${w} × ${num}/${den} as ?/${den}. What is the numerator?`, answer: ans,
    traps: traps2(ans, [
      [w * den, `That multiplied the whole number by the DENOMINATOR; the piece size stays put and only the count scales.`],
      [num, `That is one group's numerator — ${w} groups of ${num} ${MANY[den]} were asked for.`]]) };
}
function ProductFormMcq(r) {
  const den = choose(r, [4, 5, 6, 8]);
  const num = pick(r, 2, den - 1);
  const w = pick(r, 2, 6);
  const correct = `(${w} × ${num})/${den}`;
  return { gen: "g4-fractions", form: "faWholeTimesFractionMcq", kind: "solverMcq",
    prompt: `Maya finds ${w} × ${num}/${den}. Which expression matches?`,
    labels: [correct, `${w}/(${num} × ${den})`, `(${w} + ${num})/${den}`, `(${w} × ${num})/(${w} × ${den})`],
    correct,
    feedback: {
      [correct]: `Correct — ${w} groups of ${num} ${MANY[den]} is ${w} × ${num} pieces, all still ${MANY[den]}.`,
      [`${w}/(${num} × ${den})`]: `That multiplies the denominator, which would make the pieces smaller instead of collecting more of them.`,
      [`(${w} + ${num})/${den}`]: `Adding counts one group plus a numerator; ${w} groups calls for multiplication.`,
      [`(${w} × ${num})/(${w} × ${den})`]: `Scaling BOTH parts renames the fraction without changing its value — that is equivalence, not ${w} groups of it.`,
    } };
}
function RepeatedSumNumeric(r) {
  const den = choose(r, [5, 6, 8]);
  const a = pick(r, 1, den - 3);
  const b = pick(r, 1, den - 1 - a);
  const ans = a + b;
  must(a + b < den, "repeated sum must stay under one whole");
  return { gen: "g4-fractions", form: "faLikeDenomWordNumeric",
    prompt: `A hiker walks ${a}/${den} mile, then ${b}/${den} mile more. Express the total as ?/${den}. What is the numerator?`,
    answer: ans,
    traps: traps2(ans, [
      [den, `${den} names the piece size; joining same-size pieces changes only how MANY there are.`],
      [a * b, `Multiplying the counts is not joining them — ${a} pieces and ${b} more make ${ans}.`]]) };
}
function RecipeNumeric(r) {
  const den = choose(r, [3, 4, 6, 8]);
  const num = pick(r, 1, den - 1);
  const w = pick(r, 2, 6);
  const ans = w * num;
  return { gen: "g4-fractions", form: "faWholeTimesFractionWordNumeric",
    prompt: `${w} identical recipes each use ${num}/${den} cup of flour. Express the total as ?/${den}. What is the numerator?`,
    answer: ans,
    traps: traps2(ans, [
      [num, `That is ONE recipe's flour; ${w} recipes each take that much.`],
      [w + num, `Adding the recipe count to the numerator mixes two different things — the count multiplies.`]]) };
}
function WholePartNumeric(r) {
  const den = choose(r, [3, 4, 5, 6, 8]);
  const wholes = pick(r, 2, 4);
  const extra = pick(r, 1, den - 1);
  const num = den * wholes + extra;
  return { gen: "g4-fractions", form: "faImproperToMixedNumeric",
    prompt: `Convert ${num}/${den} to a mixed number. What is the WHOLE NUMBER part?`, answer: wholes,
    traps: traps2(wholes, [
      [num, `${num} counts the PIECES. Every ${den} of them rebuild one whole, so ask how many groups of ${den} fit.`],
      [wholes + 1, `That counted the leftover ${extra} ${MANY[den]} as another whole, but ${extra} is short of ${den}.`]]) };
}
function ToImproperNumeric(r) {
  const den = choose(r, [3, 4, 5, 6, 8]);
  const whole = pick(r, 2, 5);
  const num = pick(r, 1, den - 1);
  const ans = whole * den + num;
  return { gen: "g4-fractions", form: "faMixedToImproperNumeric",
    prompt: `Convert ${whole} ${num}/${den} to an improper fraction. What is the new numerator (over ${den})?`,
    answer: ans,
    traps: traps2(ans, [
      [whole + num, `That added the whole to the numerator; each whole is worth ${den} ${MANY[den]}, not one.`],
      [whole * den, `That converted the wholes but dropped the extra ${num} ${MANY[den]} already in hand.`]]) };
}
function SimplifyNumeric(r) {
  const g = choose(r, [2, 3, 4]);
  const base = choose(r, [[1, 2], [2, 3], [3, 4], [1, 3], [5, 6]]);
  const num = base[0] * g, den = base[1] * g;
  const ans = num / gcd(num, den);
  must(gcd(num, den) === g || ans === base[0], "simplify must reduce to the base numerator");
  return { gen: "g4-fractions", form: "faSimplifyNumeric",
    prompt: `Simplify ${num}/${den} by dividing both by ${gcd(num, den)}. What is the simplified numerator (top)?`,
    answer: ans,
    traps: traps2(ans, [
      [num, `That left the fraction unsimplified — dividing both parts by ${gcd(num, den)} shrinks the numbers, not the value.`],
      [den / gcd(num, den), `That reported the simplified DENOMINATOR; the question asks for the top.`]]) };
}
function OrderProductsMcq(r) {
  const den = choose(r, [6, 8]);
  const nums = [];
  while (nums.length < 3) {
    const v = pick(r, 1, den - 1);
    if (!nums.includes(v)) nums.push(v);
  }
  const sorted = [...nums].sort((x, y) => x - y);
  const middle = sorted[1];
  return { gen: "g4-fractions", form: "faBenchmarkOrderMcq", kind: "solverMcq",
    prompt: `Order ${nums[0]}/${den}, ${nums[1]}/${den}, and ${nums[2]}/${den} from least to greatest. Which one is in the MIDDLE?`,
    labels: nums.map((n) => `${n}/${den}`), correct: `${middle}/${den}`,
    feedback: Object.fromEntries(nums.map((n) => [`${n}/${den}`,
      n === middle
        ? `Correct — the pieces are identical ${MANY[den]}, so ordering the counts orders the fractions, and ${n} sits between ${sorted[0]} and ${sorted[2]}.`
        : n === sorted[0]
          ? `${n}/${den} holds the FEWEST of these identical pieces, so it is the least, not the middle.`
          : `${n}/${den} holds the MOST of these identical pieces, so it is the greatest, not the middle.`])) };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function AsMultiplicationMcq() {
  return { kind: "mcq",
    prompt: `2/5 + 2/5 + 2/5 written as multiplication is…`,
    options: [
      { label: "3 × 2/5", correct: true, feedback: `Correct — three equal groups of 2/5, which is exactly what repeated addition of the same fraction means.` },
      { label: "2/5 × 2/5 × 2/5", correct: false, feedback: `That multiplies the fractions together, which shrinks them; the story repeats one fraction three times.` },
      { label: "3 + 2/5", correct: false, feedback: `Adding 3 counts three wholes, not three copies of 2/5.` },
      { label: "6/15", correct: false, feedback: `That scaled the denominator too. Collecting three groups of 2/5 keeps fifths and gives 6/5.` },
    ] };
}
function LineModelMcq() {
  return { kind: "mcq",
    prompt: `On a number line marked in fifths, how do you show 3 × 2/5?`,
    options: [
      { label: "Three jumps of 2/5 each, landing on 6/5", correct: true, feedback: `Correct — each jump is two fifths long, and three of them cover six fifths, just past one whole.` },
      { label: "One jump of 3/5", correct: false, feedback: `That is a single group of three fifths; the expression asks for three groups of two fifths.` },
      { label: "Two jumps of 3/5, landing on 6/5", correct: false, feedback: `It lands correctly by accident, but it models 2 × 3/5 — a different story with a different group size.` },
      { label: "Three jumps of 1/5", correct: false, feedback: `That is 3 × 1/5 = 3/5; each jump here must be two fifths, not one.` },
    ] };
}
function AreaModelMcq() {
  return { kind: "mcq",
    prompt: `An area model for 4 × 3/8 shows four rows, each with 3 of 8 parts shaded. What does the shading total?`,
    options: [
      { label: "12/8, because 12 eighth-pieces are shaded", correct: true, feedback: `Correct — four rows of three eighths shade twelve eighths in all, which is one and a half wholes.` },
      { label: "12/32, because there are 32 parts in all", correct: false, feedback: `The pieces are still eighths of ONE whole; stacking rows does not shrink the piece size.` },
      { label: "7/8, because 4 + 3 = 7", correct: false, feedback: `Adding the group count to the numerator mixes two different quantities.` },
      { label: "3/8, because each row shows 3/8", correct: false, feedback: `That is one row. The model has four of them, and the question asks for the total shaded.` },
    ] };
}
function PastOneMcq() {
  return { kind: "mcq",
    prompt: `Why is 5 × 3/4 greater than one whole?`,
    options: [
      { label: "Because 15 fourths is far more than the 4 fourths in one whole", correct: true, feedback: `Correct — one whole holds only 4 fourths, and this product collects 15 of them.` },
      { label: "Because a product is always bigger than its factors", correct: false, feedback: `Not always — multiplying by a fraction less than one makes things smaller. Here the WHOLE-number factor is what grows it.` },
      { label: "Because 3/4 is greater than one", correct: false, feedback: `3/4 is less than one whole; it is taking five of them that passes one.` },
      { label: "It is not — fractions are always less than one", correct: false, feedback: `Improper fractions like 15/4 are genuinely greater than one; fractions are not capped at a whole.` },
    ] };
}
function EstimateProductMcq() {
  return { kind: "mcq",
    prompt: `Roughly how big is 7 × 5/6, without computing exactly?`,
    options: [
      { label: "A little less than 7, since 5/6 is nearly a whole", correct: true, feedback: `Correct — each group is just under one, so seven of them land just under seven.` },
      { label: "About 35, since 7 × 5 = 35", correct: false, feedback: `That ignores the sixths entirely; 35 counts pieces, and 35 sixths is under six wholes.` },
      { label: "Less than one, since 5/6 is a fraction", correct: false, feedback: `Taking seven groups of nearly-a-whole cannot land under one whole.` },
      { label: "Exactly 7, since 5/6 rounds to 1", correct: false, feedback: `Rounding 5/6 up to 1 gives an estimate of 7, but the true product is slightly BELOW it.` },
    ] };
}
function DistanceStoryMcq() {
  return { kind: "mcq",
    prompt: `A runner covers 3/8 mile per lap and runs 6 laps. Which computes the distance?`,
    options: [
      { label: "6 × 3/8 = 18/8 miles", correct: true, feedback: `Correct — six equal laps of three eighths each collects eighteen eighths, or 2 1/4 miles.` },
      { label: "6 + 3/8 miles", correct: false, feedback: `Adding treats the lap count as a distance; six equal laps calls for multiplication.` },
      { label: "6 ÷ 3/8 miles", correct: false, feedback: `Dividing asks how many laps fit in six miles — a different question entirely.` },
      { label: "3/8 mile, since each lap is the same", correct: false, feedback: `That is one lap. Six were run, so the distance is six times as far.` },
    ] };
}

const REUSE = { UnitMultipleNumeric, GeneralProductNumeric, ProductFormMcq, RepeatedSumNumeric,
  RecipeNumeric, WholePartNumeric, ToImproperNumeric, SimplifyNumeric, OrderProductsMcq,
  AsMultiplicationMcq: () => AsMultiplicationMcq(), LineModelMcq: () => LineModelMcq(),
  AreaModelMcq: () => AreaModelMcq(), PastOneMcq: () => PastOneMcq(),
  EstimateProductMcq: () => EstimateProductMcq(), DistanceStoryMcq: () => DistanceStoryMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Count the same-size pieces the groups collect; the denominator never changes.") {
  const r = mulberry32(seedFromString(seedStr));
  const out = REUSE[mirror](r);

  if (out.kind === "mcq") {
    must(out.options.length >= 4, `${mirror} needs >=4 options`);
    must(out.options.filter((o) => o.correct).length === 1, `${mirror} mcq correct count`);
    must(out.options[0].correct === true, `${mirror} correct option must stay at index 0`);
    must(new Set(out.options.map((o) => o.label)).size === out.options.length, `${mirror} duplicate labels`);
    const withIds = out.options.map((o, i) => ({ id: `o${i}`, ...o }));
    for (const o of withIds) must(o.feedback.length >= 25, `${mirror} feedback too short`);
    must(new Set(withIds.map((o) => o.feedback)).size === withIds.length, `${mirror} feedback not distinct`);
    return { widget: { type: "mcq", prompt: out.prompt, options: withIds }, hints, ev };
  }

  if (out.kind === "solverMcq") {
    must(REG[out.gen]?.has(out.form), `${mirror}: ${out.gen}/${out.form} NOT registered`);
    must(out.labels.includes(out.correct), `${mirror} correct label must be an option`);
    must(new Set(out.labels).size === out.labels.length, `${mirror} duplicate labels`);
    const ordered = [out.correct, ...out.labels.filter((l) => l !== out.correct)];
    const options = ordered.map((label, i) => ({
      id: `o${i}`, label, correct: label === out.correct, feedback: out.feedback[label],
    }));
    must(options[0].correct === true, `${mirror} correct must be index 0`);
    must(options.length >= 3, `${mirror} needs >=3 options`);
    for (const o of options) must(o.feedback && o.feedback.length >= 25, `${mirror} feedback missing/short for "${o.label}"`);
    must(new Set(options.map((o) => o.feedback)).size === options.length, `${mirror} feedback not distinct`);
    return { variant: { gen: out.gen, form: out.form },
      widget: { type: "mcq", prompt: out.prompt, options }, hints, ev };
  }

  must(REG[out.gen]?.has(out.form), `${mirror}: ${out.gen}/${out.form} NOT registered`);
  const commonErrors = out.traps;
  must(commonErrors.length >= 2, `${mirror} needs 2 traps`);
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `${mirror} duplicate traps`);
  for (const e of commonErrors) {
    must(e.value !== out.answer, `${mirror} trap==answer`);
    must(e.feedback.length >= 25, `${mirror} trap feedback short`);
  }
  return { variant: { gen: out.gen, form: out.form },
    widget: { type: "numeric", prompt: out.prompt, answer: out.answer, tolerance: 0, unit: "",
      commonErrors, fallbackFeedback: fallback, successFeedback: `Correct — ${out.answer}.` },
    hints, ev };
}

/* ---------------- manipulatives ---------------- */
function fracBar(prompt, targetNum, targetDen, success, traps = []) {
  const w = structuredClone(BAR_T);
  w.prompt = prompt; w.targetNum = targetNum; w.targetDen = targetDen;
  w.numMin = 1; w.numMax = 12; w.denMin = 1; w.denMax = 12; w.numStart = 1; w.denStart = 1;
  must(targetNum >= 1 && targetNum <= 12 && targetDen >= 1 && targetDen <= 12,
    `fracBar target ${targetNum}/${targetDen} outside the slider range`);
  w.successFeedback = success;
  w.commonFractions = traps.filter(([n, d]) => {
    must(n >= 1 && n <= 12 && d >= 1 && d <= 12, `fracBar trap ${n}/${d} outside slider range`);
    return n * targetDen !== d * targetNum;          // never trap the target's VALUE
  }).map(([num, den, feedback]) => {
    must(feedback.length >= 25, "fracBar trap feedback short");
    return { num, den, feedback };
  });
  return w;
}
function nlPlace(prompt, fractionDen, target, success, traps, low, high) {
  const w = structuredClone(NLP_T);
  w.prompt = prompt; w.fractionDen = fractionDen;
  w.min = 0; w.max = fractionDen; w.step = 1; w.tickStep = 1;   // jump-unit contract
  w.target = target; w.start = 0;
  if ("showDistanceFromZero" in w) delete w.showDistanceFromZero;
  // A corpus template carries the SOURCE lesson's feedback verbatim; left in place it becomes
  // dead feedback naming numbers this lesson never mentions. Always author both.
  w.lowFeedback = low; w.highFeedback = high;
  must(low && low.length >= 25 && high && high.length >= 25, "nlPlace needs its own low/high feedback");
  w.successFeedback = success;
  w.commonPlacements = traps.map(([value, feedback]) => {
    must(value !== target, `nlPlace trap ${value} equals target`);
    must(value >= 0 && value <= fractionDen, `nlPlace trap ${value} off the line`);
    must(feedback.length >= 25, "nlPlace trap feedback short");
    return { value, feedback };
  });
  must(target >= 0 && target <= fractionDen, "nlPlace target on the line");
  return w;
}
function estimate(prompt, min, max, target, unitLabel, low, high, success) {
  const w = structuredClone(EST_T);
  w.prompt = prompt; w.min = min; w.max = max; w.start = min; w.target = target;
  w.acceptFactor = 2; w.unitLabel = unitLabel;
  w.ticks = [min, Math.round((min + max) / 2), max];
  w.lowFeedback = low; w.highFeedback = high;
  if ("successFeedback" in w) w.successFeedback = success;
  if ("choices" in w) delete w.choices;
  must(min < target && target < max, "estimate target inside range");
  return w;
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Collect equal groups of a fraction and watch only the COUNT of pieces change for ${tag.replace(/-/g, " ")}.`,
  invariants: [`Multiplying a fraction by a whole number collects groups of identical pieces: the denominator names the piece size and holds still, while the numerator counts every piece gathered, which is what keeps ${tag.replace(/-/g, " ")} a counting problem.`],
  misconceptions: [`Scaling the denominator along with the numerator, adding the whole number to the numerator, or assuming a product cannot pass one whole.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `fraction-multiply-g4:${tag}`, delayed: true,
  counterfactualPrompt: "If the denominator DID change when you collected groups, what would happen to the size of each piece?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  collect: ["Same-size pieces collect.", "Only the count grows.", "The denominator holds still."],
  form: ["Groups times pieces.", "Multiply the numerator.", "Piece size is fixed."],
  past: ["Count against the whole.", "Denominator pieces per whole.", "Past that is more than one."],
  mixed: ["Group by the denominator.", "Each group is a whole.", "The rest stays a fraction."],
  est: ["Compare each group to one.", "Then scale by the count.", "Check the neighbourhood."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Adding the same fraction again and again is the simplest kind of fraction multiplication: 2/5 + 2/5 + 2/5 collects three equal groups.",
  "Because the pieces are all the same size, joining them is pure counting — the fifths stay fifths, and only how many you hold changes.",
  { rep: "concrete", widget: () => fracBar("Collect 2/5 three times: build the total on the bar.", 6, 5,
      "6/5 — three groups of two fifths is six fifths, just past one whole.",
      [[2, 5, "2/5 is a single group. Three of them were collected."],
       [6, 10, "6/10 shrank the pieces as well as counting them; collecting fifths keeps fifths."]]),
    predict: P("Adding 2/5 three times, what changes?", [{ id: "top", label: "Only the count of pieces" }, { id: "both", label: "Both numbers" }], "top",
      "The pieces stay fifths; you simply end up holding six of them instead of two.") },
  [
    reused("RepeatedSumNumeric", "g4x1-k1", H.collect, ["Same size? Add the counts.", "Piece size unchanged."]),
    reused("AsMultiplicationMcq", "g4x1-k2", H.collect, ["Repeated addition is multiplication.", "Equal groups."]),
    reused("RepeatedSumNumeric", "g4x1-k3", H.collect, ["Join the counts.", "Denominator survives."]),
    reused("UnitMultipleNumeric", "g4x1-ch1", H.collect, ["Unit pieces collect too.", "The count is the answer."]),
  ],
  ["Repeated addition collects equal groups.", "Only the piece count grows.", "The denominator holds still."],
  "next: writing that as multiplication.");

def(2,
  "Three groups of 2/5 is written 3 × 2/5. The whole number counts the GROUPS; the fraction names what is in each one.",
  "The rule falls straight out of the meaning: multiply the numerator by the whole number and leave the denominator exactly where it is.",
  { rep: "concrete", widget: () => fracBar("Build 3 × 2/5 as a single fraction.", 6, 5,
      "6/5 — the numerator tripled and the fifths never moved.",
      [[6, 10, "That scaled the denominator too, which shrinks the pieces instead of collecting more of them."],
       [5, 5, "5/5 is one whole; three groups of 2/5 reaches past it."]]),
    predict: P("In 3 × 2/5, which number does the 3 multiply?", [{ id: "num", label: "The numerator" }, { id: "both", label: "Both parts" }], "num",
      "Three groups means three times as many PIECES, and the piece size is what the denominator names.") },
  [
    reused("ProductFormMcq", "g4x2-k1", H.form, ["Groups times pieces.", "Denominator untouched."]),
    reused("GeneralProductNumeric", "g4x2-k2", H.form, ["Multiply the top only.", "Keep the bottom."]),
    reused("ProductFormMcq", "g4x2-k3", H.form, ["Scaling both is equivalence.", "Not multiplication."]),
    reused("GeneralProductNumeric", "g4x2-ch1", H.form, ["Bigger groups, same rule.", "The top scales."]),
  ],
  ["The whole number counts groups.", "Multiply the numerator only.", "The denominator names piece size."],
  "next: the simplest case of all.");

def(3,
  "Multiples of a unit fraction are the clearest case: 4 × 1/6 is simply four sixth-pieces, so the answer is 4/6.",
  "Every fraction is a multiple of its own unit fraction — which is exactly why the numerator can be read as a count.",
  { rep: "concrete", widget: () => fracBar("Build 4 × 1/6 as a single fraction.", 4, 6,
      "4/6 — four sixth-pieces gathered, and each one is still a sixth.",
      [[1, 6, "1/6 is a single piece; four of them were collected."],
       [4, 12, "4/12 shrank the pieces. Collecting sixths leaves you holding sixths."]]),
    predict: P("What is 4 × 1/6?", [{ id: "46", label: "4/6" }, { id: "424", label: "4/24" }], "46",
      "Four sixth-pieces are four sixths. Collecting pieces never makes them smaller.") },
  [
    reused("UnitMultipleNumeric", "g4x3-k1", H.collect, ["Count the unit pieces.", "That count is the top."]),
    reused("UnitMultipleNumeric", "g4x3-k2", H.collect, ["Piece size is fixed.", "Only the count moves."]),
    reused("AsMultiplicationMcq", "g4x3-k3", H.collect, ["Repeated addition again.", "Equal groups."]),
    reused("GeneralProductNumeric", "g4x3-ch1", H.form, ["Bigger groups than one piece.", "Same counting."]),
  ],
  ["A unit fraction is one piece.", "Multiples collect those pieces.", "The count becomes the numerator."],
  "next: the general rule.");

def(4,
  "The general rule covers every case: n × a/b multiplies the count a by n and keeps the piece size b.",
  "Whether the group is one piece or five, whether n is 2 or 20, the mathematics is identical — collect groups of same-size pieces and count them.",
  { rep: "concrete", widget: () => fracBar("Build 5 × 2/8 as a single fraction.", 10, 8,
      "10/8 — five groups of two eighths make ten eighths, past one whole.",
      [[8, 8, "8/8 is exactly one whole; five groups of two eighths passes it."],
       [2, 8, "2/8 is one group. Five were asked for."]]),
    predict: P("Does n × a/b ever change the denominator?", [{ id: "never", label: "No — never" }, { id: "sometimes", label: "Sometimes" }], "never",
      "Collecting groups of identical pieces cannot change what a piece IS — only how many you hold.") },
  [
    reused("GeneralProductNumeric", "g4x4-k1", H.form, ["n times the numerator.", "Denominator kept."]),
    reused("ProductFormMcq", "g4x4-k2", H.form, ["One expression matches.", "Read the grouping."]),
    reused("GeneralProductNumeric", "g4x4-k3", H.form, ["Any n, any a/b.", "Same rule."]),
    reused("RecipeNumeric", "g4x4-ch1", H.form, ["Stories use the rule too.", "Groups times pieces."]),
  ],
  ["n × a/b multiplies the count only.", "The piece size never changes.", "One rule covers every case."],
  "next: seeing it on a line.");

def(5,
  "A number line shows the multiplication as a journey: each group is one jump, and every jump is the same length.",
  "Three jumps of 2/5 land on 6/5 — past the 1 mark, which is where the line makes 'more than one whole' impossible to miss.",
  { rep: "diagram", widget: () => nlPlace("On a FIFTHS line, place where 2 × 2/5 lands.", 5, 4,
      "4/5 — two jumps of two fifths each, landing one fifth short of the whole.",
      // Only 5 sits above the target on a fifths line, so trapping it would leave highFeedback
      // unreachable — that diagnosis belongs IN highFeedback instead.
      [[2, "2/5 is one jump. Two were asked for."]],
      "Short of the landing — each jump covers two fifths, so two jumps reach four of them.",
      "Past the landing — 5/5 is the whole, and two jumps of two fifths stop one fifth short of it."),
    predict: P("Three jumps of 2/5 from zero land where?", [{ id: "sixfifths", label: "6/5 — past 1" }, { id: "one", label: "Exactly 1" }], "sixfifths",
      "Each jump covers two fifths, so three jumps cover six — one more than the five fifths in a whole.") },
  [
    reused("LineModelMcq", "g4x5-k1", H.collect, ["Each group is a jump.", "All jumps equal."]),
    reused("GeneralProductNumeric", "g4x5-k2", H.form, ["Count the pieces covered.", "Same denominator."]),
    reused("LineModelMcq", "g4x5-k3", H.collect, ["Group size sets jump length.", "Count sets jumps."]),
    reused("UnitMultipleNumeric", "g4x5-ch1", H.collect, ["Unit jumps too.", "Count them up."]),
  ],
  ["Each group is one jump.", "Jumps are all the same length.", "The landing point is the product."],
  "next: seeing it as area.");

def(6,
  "An area model stacks the groups as rows: four rows each showing 3/8 shades twelve eighth-pieces in all.",
  "Stacking rows does not shrink the pieces. They are eighths of one whole before and after — there are simply more of them shaded.",
  { rep: "concrete", widget: () => fracBar("Build the total shaded by 4 × 3/8.", 12, 8,
      "12/8 — twelve eighth-pieces, which is one and a half wholes.",
      [[12, 12, "12/12 read the answer as a single whole; twelve EIGHTHS is one and a half wholes."],
       [3, 8, "3/8 is one row. Four rows were shaded."]]),
    predict: P("Four rows each shading 3/8 — do the pieces get smaller?", [{ id: "no", label: "No — still eighths" }, { id: "yes", label: "Yes — now 32nds" }], "no",
      "Each row is a copy of the same whole cut into eighths; stacking copies never re-cuts the pieces.") },
  [
    reused("AreaModelMcq", "g4x6-k1", H.form, ["Rows stack, pieces stay.", "Count the shaded."]),
    reused("GeneralProductNumeric", "g4x6-k2", H.form, ["Rows times per-row count.", "Denominator fixed."]),
    reused("AreaModelMcq", "g4x6-k3", H.form, ["Not 32nds.", "Eighths throughout."]),
    reused("RecipeNumeric", "g4x6-ch1", H.form, ["Same model, real quantities.", "Groups times pieces."]),
  ],
  ["Rows stack the groups.", "The pieces never shrink.", "Count every shaded piece."],
  "next: passing one whole.");

def(7,
  "Products often pass one whole. One whole holds exactly b of its own b-pieces, so any product with more than b pieces is greater than one.",
  "5 × 3/4 collects fifteen fourths, and a whole holds only four — so the product is nearly four wholes. Fractions are not capped at one.",
  { rep: "concrete", widget: () => fracBar("Build 3 × 3/4 and compare it to one whole.", 9, 4,
      "9/4 — nine fourths, and since a whole holds four, this is more than two wholes.",
      [[3, 4, "3/4 is one group, still under a whole."],
       [4, 4, "4/4 is exactly one whole; nine fourths passes it more than twice."]]),
    predict: P("Is 5 × 3/4 more or less than one whole?", [{ id: "more", label: "More" }, { id: "less", label: "Less" }], "more",
      "Five groups of nearly-a-whole cannot stay under one; fifteen fourths is almost four wholes.") },
  [
    reused("PastOneMcq", "g4x7-k1", H.past, ["Count against the whole.", "b pieces per whole."]),
    reused("GeneralProductNumeric", "g4x7-k2", H.past, ["Collect the pieces.", "Then compare to b."]),
    reused("OrderProductsMcq", "g4x7-k3", H.past, ["Same pieces? Count them.", "More is more."]),
    reused("GeneralProductNumeric", "g4x7-ch1", H.past, ["Products can be large.", "No cap at one."]),
  ],
  ["A whole holds b of its b-pieces.", "More pieces means more than one whole.", "Fractions are not capped at one."],
  "next: naming those answers.");

def(8,
  "An improper answer like 12/8 can be renamed as a mixed number: group the pieces into wholes and keep the leftovers as a fraction.",
  "Every 8 eighths rebuild one whole, so 12/8 is one whole with 4 eighths left over — 1 4/8, and the value has not moved.",
  { rep: "concrete", widget: () => fracBar("Build 10/4 and find how many wholes it holds.", 10, 4,
      "10/4 — ten fourths, which groups into two wholes with two fourths left over.",
      [[4, 4, "4/4 is exactly one whole; ten fourths holds more than two of them."],
       [12, 4, "12/4 is three whole cups — one group too many; ten fourths stops short of that."]]),
    predict: P("How many wholes are in 12/8?", [{ id: "one", label: "1, with 4/8 left" }, { id: "twelve", label: "12" }], "one",
      "Eight eighths make one whole, and twelve eighths contains exactly one such group plus four spare.") },
  [
    reused("WholePartNumeric", "g4x8-k1", H.mixed, ["Group by the denominator.", "Each group is a whole."]),
    reused("ToImproperNumeric", "g4x8-k2", H.mixed, ["Back the other way.", "Each whole is b pieces."]),
    reused("WholePartNumeric", "g4x8-k3", H.mixed, ["Leftovers stay fractions.", "Short of b."]),
    reused("SimplifyNumeric", "g4x8-ch1", H.mixed, ["Simplify the leftover.", "Value unchanged."]),
  ],
  ["Group pieces into wholes.", "Leftovers stay a fraction.", "Renaming never changes the value."],
  "next: equal-group stories.");

def(9,
  "Equal-group stories are fraction multiplication in words: the same amount, taken a whole number of times.",
  "Read for the group SIZE and the group COUNT. The size is the fraction, the count is the whole number, and the product follows.",
  { rep: "concrete", widget: () => fracBar("Six bags each hold 2/6 kilogram. Build the total.", 12, 6,
      "12/6 — six groups of two sixths, which is exactly two kilograms.",
      [[2, 6, "2/6 is one bag. Six of them were filled."],
       [8, 6, "That added the six bags to the two sixths instead of taking six groups of it."]]),
    predict: P("Six bags of 2/6 kg each — total?", [{ id: "twelve", label: "12/6 kg" }, { id: "eight", label: "8/6 kg" }], "twelve",
      "Six groups of two sixths collects twelve sixths; adding the counts would answer a different question.") },
  [
    reused("GeneralProductNumeric", "g4x9-k1", H.form, ["Size times count.", "Read both."]),
    reused("RecipeNumeric", "g4x9-k2", H.form, ["Equal groups multiply.", "Never add the count."]),
    reused("GeneralProductNumeric", "g4x9-k3", H.form, ["Same rule in words.", "Groups of pieces."]),
    reused("WholePartNumeric", "g4x9-ch1", H.mixed, ["Rename the answer.", "Wholes plus leftover."]),
  ],
  ["Stories name a group size and count.", "The size is the fraction.", "Equal groups multiply."],
  "next: recipes.");

def(10,
  "Recipes scale by whole numbers all the time: five batches of a 3/4-cup ingredient needs 15/4 cups, or 3 3/4.",
  "The mixed-number form is what a cook actually measures, so scaling usually ends with grouping the pieces back into wholes.",
  { rep: "concrete", widget: () => fracBar("Four batches each use 3/4 cup. Build the total cups.", 12, 4,
      "12/4 — twelve fourths, which is exactly three cups.",
      [[3, 4, "3/4 is one batch. Four were made."],
       [7, 4, "That added the batch count to the numerator instead of taking four groups."]]),
    predict: P("Five batches of 3/4 cup each. Total?", [{ id: "fifteen", label: "15/4 cups" }, { id: "eight", label: "8/4 cups" }], "fifteen",
      "Five groups of three fourths collects fifteen fourths — three and three-quarter cups.") },
  [
    reused("RecipeNumeric", "g4x10-k1", H.form, ["Batches times per-batch.", "Same piece size."]),
    reused("WholePartNumeric", "g4x10-k2", H.mixed, ["Cooks want mixed numbers.", "Group into wholes."]),
    reused("RecipeNumeric", "g4x10-k3", H.form, ["Scale the numerator.", "Cups stay fourths."]),
    reused("ToImproperNumeric", "g4x10-ch1", H.mixed, ["Convert back too.", "Wholes become pieces."]),
  ],
  ["Recipes scale by whole numbers.", "Multiply the numerator.", "Rename as a mixed number to measure."],
  "next: distance.");

def(11,
  "Distance problems repeat a fractional length: six laps of 3/8 mile covers 18/8 miles, which is 2 1/4.",
  "The structure is identical to bags and batches — only the units change. Recognising the structure is what makes the arithmetic automatic.",
  { rep: "diagram", widget: () => nlPlace("On an EIGHTHS line, place where 2 × 3/8 lands.", 8, 6,
      "6/8 — two jumps of three eighths, landing three quarters of the way to one.",
      [[3, "3/8 is a single lap. Two were run."],
       [8, "8/8 is a full mile; two laps of 3/8 stop short of it."]],
      "Short of the landing — each lap covers three eighths, so two laps reach six of them.",
      "Past the landing — two laps of three eighths stop at 6/8, short of the full mile."),
    predict: P("Six laps of 3/8 mile — total distance?", [{ id: "eighteen", label: "18/8 miles" }, { id: "nine", label: "9/8 miles" }], "eighteen",
      "Six groups of three eighths is eighteen eighths; nine would be only three laps.") },
  [
    reused("DistanceStoryMcq", "g4x11-k1", H.form, ["Laps times lap length.", "Multiplication."]),
    reused("GeneralProductNumeric", "g4x11-k2", H.form, ["Same structure, new units.", "Groups of pieces."]),
    reused("DistanceStoryMcq", "g4x11-k3", H.form, ["Not division.", "Not addition."]),
    reused("WholePartNumeric", "g4x11-ch1", H.mixed, ["Rename in miles.", "Wholes plus leftover."]),
  ],
  ["Distance repeats a fractional length.", "The structure matches every equal-group story.", "Rename the answer to read it."],
  "next: knowing roughly first.");

def(12,
  "Estimating a fraction product compares each group to one whole. If 5/6 is nearly a whole, then 7 × 5/6 is a little under 7.",
  "That single comparison catches the worst error in this topic — multiplying the denominators and landing an order of magnitude away.",
  { rep: "diagram", widget: () => estimate("7 × 5/6 — slide to estimate the product in wholes.", 1, 40, 6, "wholes",
      "Too low — each of the seven groups is nearly a whole one.",
      "Too high — seven groups of just under one cannot pass seven.",
      "About 6 — the exact value is 35/6, which is 5 5/6, just under seven."),
    predict: P("Is 7 × 5/6 nearer 6 or nearer 35?", [{ id: "six", label: "Nearer 6" }, { id: "thirtyfive", label: "Nearer 35" }], "six",
      "35 counts sixth-PIECES, not wholes; thirty-five sixths is only about six wholes.") },
  [
    reused("EstimateProductMcq", "g4x12-k1", H.est, ["Compare a group to one.", "Then scale."]),
    reused("GeneralProductNumeric", "g4x12-k2", H.est, ["The exact answer decides.", "The estimate guards."]),
    reused("EstimateProductMcq", "g4x12-k3", H.est, ["Pieces are not wholes.", "Convert before judging."]),
    reused("WholePartNumeric", "g4x12-ch1", H.mixed, ["Rename to compare.", "Wholes plus leftover."]),
  ],
  ["Compare each group to one whole.", "Then scale by the count.", "Pieces are not wholes."],
  "course complete: collected, written, modelled, renamed, applied, and estimated.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 12, `12 lessons defined, got ${L.length}`);
const chapterTitles = ["From Repeated Addition to Multiplication", "Models and Mixed Numbers", "Problems and Estimates"];
const perChapter = [4, 4, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 8 ? 2 : 3);
const outDir = join(root, "content/courses/fraction-multiply-g4");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g4x-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "concrete") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "fraction-multiply-g4",
    chapterId: chapters[ch - 1].id, minutes: 7, readingProfile: "standard",
    steps: [
      { id: "c1", kind: "concept", figure: "count-on-hops", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: "Try it.", conceptTag: tag, widget: d.i1.widget(), predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      stepFromCheck("k1", d.checks[0]),
      { id: "c2", kind: "concept", figure: "count-on-hops", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: "Try it again.", conceptTag: tag, widget: d.i1.widget(), cml: cml(tag, "concrete") },
      stepFromCheck("k2", d.checks[1]),
      stepFromCheck("k3", d.checks[2]),
      stepFromCheck("ch1", d.checks[3], "challenge"),
      { id: "r1", kind: "recap", body: "You did it!", takeaways: d.recap, teaser: d.teaser },
    ],
    remedials: [{
      conceptTag: tag,
      concept: { id: `rem-${tag}-c`, kind: "concept", body: d.c2, narration: d.c2 },
      check: { id: `rem-${tag}-k`, kind: "check", body: "", conceptTag: tag,
        explanationVariants: d.checks[0].ev,
        widget: d.checks[0].widget.type === "numeric"
          ? { ...d.checks[0].widget, commonErrors: d.checks[0].widget.commonErrors.slice(0, 2) }
          : d.checks[0].widget },
    }],
  };

  for (const s of lesson.steps) {
    const w = s.widget;
    if (!w) continue;
    if (w.type === "numeric") {
      for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} trap==answer`);
      const f = s.variant?.form;
      if (f === "faWholeTimesFractionNumeric") {
        const m = w.prompt.match(/^Compute (\d+) × (\d+)\/(\d+)/);
        must(m && +m[1] * +m[2] === w.answer, `${id}/${s.id} faWholeTimesFraction needs the Compute shape`);
      }
      if (f === "faWholeTimesFractionWordNumeric") {
        const m = w.prompt.match(/(\d+) identical recipes each use (\d+)\/(\d+)/);
        must(m && +m[1] * +m[2] === w.answer, `${id}/${s.id} recipe route shape`);
      }
      if (f === "faLikeDenomWordNumeric") {
        must(!w.prompt.includes("were available"), `${id}/${s.id} "were available" flips the route to subtraction`);
      }
      if (f === "faImproperToMixedNumeric") {
        const m = w.prompt.match(/Convert (\d+)\/(\d+)/);
        must(m && Math.floor(+m[1] / +m[2]) === w.answer, `${id}/${s.id} improper-to-mixed whole part`);
      }
      if (f === "faMixedToImproperNumeric") {
        const m = w.prompt.match(/Convert (\d+) (\d+)\/(\d+)/);
        must(m && +m[1] * +m[3] + +m[2] === w.answer, `${id}/${s.id} mixed-to-improper numerator`);
      }
    }
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 3, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
    }
    if (w.type === "fractionBar") {
      for (const t of w.commonFractions)
        must(t.num * w.targetDen !== t.den * w.targetNum, `${id}/${s.id} fractionBar trap equals target value`);
      must(w.targetNum <= w.numMax && w.targetDen <= w.denMax, `${id}/${s.id} fractionBar target off the sliders`);
    }
    if (w.type === "numberLinePlace" && w.fractionDen !== undefined) {
      must(w.min === 0 && w.max === w.fractionDen && w.step === 1 && w.tickStep === 1,
        `${id}/${s.id} fraction line must use jump units`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "fraction-multiply-g4", slug: "fraction-multiply-g4", title: spec.title,
  tagline: "Collect equal groups of a fraction — the count grows, the pieces never do.",
  category: "Math", gradeLevel: 4, chapters,
}, null, 2) + "\n");
console.log(`built 12 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
