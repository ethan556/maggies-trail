#!/usr/bin/env node
// S197 — Batch F course 3/6: fraction-division-g5 (5.NF.B.3, 5.NF.B.7). Zero new generator code.
//
// Families: g4-fractions and g4-multiply, both computational (g4Independent.cjs).
//
// THE HAZARD THIS COURSE IS BUILT AROUND. Every g4-multiply route reads `ns` POSITIONALLY, and
// `ns` collects EVERY number in the prompt — including the parts of a fraction written "1/4".
// Probed during the fit-check:
//     "Dividing by 1/4 asks how many fourths fit. Compute 3 × 4."  ->  graded 4, not 12
// because ns became [1, 4, 3, 4] and the route multiplied ns[0] * ns[1]. A fraction mentioned
// before the graded expression silently hijacks the answer. Every graded prompt here therefore
// leads with its operands and carries the explanation AFTER them, and the factory asserts that
// the first two numbers are the ones the route consumes.
//
// Verified routes:
//   mbMultiplyTensNumeric  "Compute A × B — …"   -> ns[0]*ns[1]   (how many 1/B fit in A wholes)
//   mbDivideBigNumeric     "Compute A ÷ B — …"   -> ns[0]/ns[1]
//   mbInterpretRemaindersNumeric                 -> ceil(ns[0]/ns[1])
//   faImproperToMixedNumeric  "Convert N/D … WHOLE NUMBER part?"  -> floor(N/D)
//   faMixedToImproperNumeric  "Convert W N/D …"                   -> W*D+N
//   faWholeTimesFractionNumeric "Compute W × N/D as ?/D…"         -> W*N
//   faSimplifyNumeric         first fraction                      -> num/gcd
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "fraction-division-g5");
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
const REG_MB = new Set(["mbTimesAsManyMcq","mbTimesAsManyNumeric","mbComparisonEquationsMcq",
  "mbComparisonEquationsNumeric","mbAdditiveVsMultiplicativeMcq","mbAdditiveVsMultiplicativeNumeric",
  "mbFactorsMcq","mbFactorsNumeric","mbMultiplesMcq","mbPrimeCompositeMcq","mbPrimeCompositeNumeric",
  "mbMultiplyTensMcq","mbMultiplyTensNumeric","mbAreaModel1DigitMcq","mbAreaModel1DigitNumeric",
  "mbAreaModel2DigitMcq","mbAreaModel2DigitNumeric","mbRemaindersMcq","mbRemaindersNumeric",
  "mbDivideBigNumeric","mbInterpretRemaindersMcq","mbInterpretRemaindersNumeric","mbPatternsMcq",
  "mbPatternsNumeric","mbMultiStepNumeric"]);
const REG = { "g4-fractions": REG_FA, "g4-multiply": REG_MB };

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
const ONE = { 2: "half", 3: "third", 4: "fourth", 5: "fifth", 6: "sixth", 8: "eighth" };
const MANY = { 2: "halves", 3: "thirds", 4: "fourths", 5: "fifths", 6: "sixths", 8: "eighths" };

function traps2(answer, cands) {
  const out = [];
  for (const [v, fb] of cands) {
    if (v !== answer && v >= 0 && Number.isInteger(v) && !out.some((o) => o[0] === v)) out.push([v, fb]);
    if (out.length === 2) break;
  }
  for (let d = 3; out.length < 2; d++) {
    const v = answer + d;
    if (!out.some((o) => o[0] === v)) {
      out.push([v, "That count does not follow from how many equal pieces the sharing produces."]);
    }
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

/* ---------------- graded mirrors — every prompt LEADS with its operands ---------------- */
function WholeByUnitNumeric(r) {
  const wholes = pick(r, 2, 9), den = choose(r, [2, 3, 4, 5, 6, 8]);
  return { gen: "g4-multiply", form: "mbMultiplyTensNumeric",
    prompt: `Compute ${wholes} × ${den} — the number of ${MANY[den]} that fit in ${wholes} wholes.`,
    answer: wholes * den,
    traps: traps2(wholes * den, [
      [wholes + den, `Adding mixes a count of wholes with a piece size; each whole holds ${den} ${MANY[den]}.`],
      [den, `${den} is how many ${MANY[den]} fit in ONE whole; there are ${wholes} wholes here.`]]) };
}
function ShareEvenlyNumeric(r) {
  const parts = pick(r, 3, 8), each = pick(r, 2, 9);
  const total = parts * each;
  return { gen: "g4-multiply", form: "mbDivideBigNumeric",
    prompt: `Compute ${total} ÷ ${parts} — sharing ${total} equal pieces among ${parts} people.`,
    answer: each,
    traps: traps2(each, [
      [total, `${total} is the WHOLE pile; the question asks what one of ${parts} equal shares holds.`],
      [total - parts, `Subtracting removes one share once; sharing equally is division.`]]) };
}
function UnitByWholeNumeric(r) {
  const den = choose(r, [2, 3, 4, 5]), by = pick(r, 2, 5);
  // 1/den ÷ by = 1/(den*by): the new denominator is what the learner must find
  return { gen: "g4-multiply", form: "mbMultiplyTensNumeric",
    prompt: `Compute ${den} × ${by} — the denominator you get when one ${ONE[den]} is shared ${by} ways.`,
    answer: den * by,
    traps: traps2(den * by, [
      [den + by, `Adding the two numbers does not cut anything; sharing ${by} ways multiplies the piece count.`],
      [den, `${den} is the denominator BEFORE the sharing; each piece is about to get smaller.`]]) };
}
function QuotientAsFractionNumeric(r) {
  const den = choose(r, [3, 4, 5, 6, 8]);
  const wholes = pick(r, 2, 4);
  const extra = pick(r, 1, den - 1);
  const num = den * wholes + extra;
  return { gen: "g4-fractions", form: "faImproperToMixedNumeric",
    prompt: `Convert ${num}/${den} to a mixed number. What is the WHOLE NUMBER part?`, answer: wholes,
    traps: traps2(wholes, [
      [num, `${num} counts the PIECES; every ${den} of them rebuild one whole.`],
      [wholes + 1, `The leftover ${extra} ${MANY[den]} fall short of the ${den} needed for another whole.`]]) };
}
function MixedToImproperNumeric(r) {
  const den = choose(r, [3, 4, 5, 6, 8]);
  const whole = pick(r, 2, 5), num = pick(r, 1, den - 1);
  return { gen: "g4-fractions", form: "faMixedToImproperNumeric",
    prompt: `Convert ${whole} ${num}/${den} to an improper fraction. What is the new numerator (over ${den})?`,
    answer: whole * den + num,
    traps: traps2(whole * den + num, [
      [whole + num, `That added the whole to the numerator; each whole is worth ${den} pieces.`],
      [whole * den, `That converted the wholes but dropped the ${num} pieces already in hand.`]]) };
}
function CheckByMultiplyNumeric(r) {
  const den = choose(r, [2, 3, 4, 5]), wholes = pick(r, 2, 6);
  return { gen: "g4-fractions", form: "faWholeTimesFractionNumeric",
    prompt: `Compute ${wholes} × 1/${den} as ?/${den}. What is the numerator?`, answer: wholes,
    traps: traps2(wholes, [
      [den, `${den} is the piece size; collecting ${wholes} of them changes only the count.`],
      [wholes * den, `That multiplied by the denominator too, which would shrink the pieces as well as count them.`]]) };
}
function NeededPiecesNumeric(r) {
  const per = pick(r, 3, 8), full = pick(r, 2, 8), extra = pick(r, 1, per - 1);
  const total = per * full + extra;
  const ans = Math.ceil(total / per);
  must(ans === full + 1, "needed-pieces answer must round the partial group UP");
  return { gen: "g4-multiply", form: "mbInterpretRemaindersNumeric",
    prompt: `Compute ${total} ÷ ${per} rounded up — the containers needed when nothing may be left behind.`,
    answer: ans,
    traps: traps2(ans, [
      [full, `${full} full containers leave ${extra} pieces behind, and nothing may be left.`],
      [extra, `${extra} is the leftover, not a count of containers.`]]) };
}
function SimplifyQuotientNumeric(r) {
  const [num, den] = choose(r, [[2, 4], [3, 6], [4, 8], [4, 6], [6, 9], [8, 12], [6, 8], [9, 12], [2, 6], [10, 12]]);
  const d = gcd(num, den);
  must(d > 1 && num <= 12 && den <= 12, "simplify needs a shared factor inside the slider range");
  return { gen: "g4-fractions", form: "faSimplifyNumeric",
    prompt: `Simplify ${num}/${den} by dividing both by ${d}. What is the simplified numerator (top)?`,
    answer: num / d,
    traps: traps2(num / d, [
      [num, `That left the fraction unsimplified — dividing both parts by ${d} shrinks the numbers, not the value.`],
      [den / d, `That reported the simplified DENOMINATOR; the question asks for the top.`]]) };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function UnevenShareMcq() {
  return { kind: "mcq",
    prompt: `3 sandwiches shared equally among 4 people. How much does each get?`,
    options: [
      { label: "3/4 of a sandwich — the division IS the fraction", correct: true, feedback: `Correct — cut each sandwich into fourths and hand out three of them; a ÷ b is exactly a/b.` },
      { label: "Nobody gets any, since 3 is less than 4", correct: false, feedback: `Sharing does not require whole items — the pieces simply come out smaller than one.` },
      { label: "4/3 of a sandwich", correct: false, feedback: `That is more than a whole sandwich each, which four people cannot get from only three.` },
      { label: "1 sandwich each, with one left over", correct: false, feedback: `That leaves the fourth person with nothing and wastes the remainder; equal sharing splits it.` },
    ] };
}
function AsFractionMcq() {
  return { kind: "mcq",
    prompt: `Why does a ÷ b equal a/b?`,
    options: [
      { label: "Because sharing a wholes among b people gives each a of the b-th pieces", correct: true, feedback: `Correct — cut every whole into b pieces and each person receives one piece per whole, so a of them.` },
      { label: "Because the fraction bar is just a shorthand with no meaning", correct: false, feedback: `The bar means division precisely; it is notation for the sharing, not an arbitrary symbol.` },
      { label: "Only when a is smaller than b", correct: false, feedback: `It holds either way — 7 ÷ 2 is 7/2, which is more than one whole.` },
      { label: "Because a and b are always factors", correct: false, feedback: `That would restrict the rule to tidy cases like 8 ÷ 4 = 2. But 3 ÷ 4 also equals 3/4, where neither number divides the other — the sharing still works, it just yields pieces smaller than one.` },
    ] };
}
function InterpretQuotientMcq() {
  return { kind: "mcq",
    prompt: `13 ÷ 4 gives 3 remainder 1. When is the answer 3 1/4 rather than "3 remainder 1"?`,
    options: [
      { label: "When the leftover can itself be shared, like sandwiches", correct: true, feedback: `Correct — a divisible leftover becomes a fraction; an indivisible one, like people, stays a remainder.` },
      { label: "Always — remainders are never correct", correct: false, feedback: `Remainders are right when the objects cannot be split, such as buses or whole people.` },
      { label: "Never — 3 1/4 is a different answer", correct: false, feedback: `They describe the same division; which form is right depends on what is being shared.` },
      { label: "Only when the divisor is 4", correct: false, feedback: `The divisor's size is irrelevant; what matters is whether the leftover can be cut.` },
    ] };
}
function VisualModelMcq() {
  return { kind: "mcq",
    prompt: `To model 3 ÷ 1/4, what does the picture show?`,
    options: [
      { label: "3 wholes cut into fourths, and you count the pieces: 12", correct: true, feedback: `Correct — dividing by a fraction asks how many of that piece fit, and twelve fourths fit in three wholes.` },
      { label: "3 cut into 4 equal parts, giving 3/4", correct: false, feedback: `That models 3 ÷ 4. Dividing BY 1/4 asks how many fourths fit, which makes the answer larger.` },
      { label: "1/4 of 3, giving 3/4", correct: false, feedback: `That is 3 × 1/4. Dividing by a fraction below one makes the result bigger, not smaller.` },
      { label: "Nothing — you cannot divide by a fraction", correct: false, feedback: `You can, and the question it answers is simply "how many of these fit?"` },
    ] };
}
function WhichIsItMcq() {
  return { kind: "mcq",
    prompt: `"A 4-metre ribbon is cut into 1/2-metre pieces." Which computation fits?`,
    options: [
      { label: "4 ÷ 1/2 = 8, because you count how many halves fit", correct: true, feedback: `Correct — the question asks how many pieces, so the answer counts halves and comes out larger than 4.` },
      { label: "4 × 1/2 = 2, because the pieces are halves", correct: false, feedback: `That halves the ribbon's length; the question asks how many pieces it yields.` },
      { label: "1/2 ÷ 4 = 1/8", correct: false, feedback: `That shares half a metre among four, which reverses what is being divided.` },
      { label: "4 − 1/2 = 3.5", correct: false, feedback: `Subtracting removes one piece's length once; cutting the whole ribbon is division.` },
    ] };
}
function EstimateQuotientMcq() {
  return { kind: "mcq",
    prompt: `Roughly how big is 5 ÷ 1/3, without computing exactly?`,
    options: [
      { label: "About 15 — dividing by a third roughly triples", correct: true, feedback: `Correct — each whole holds three thirds, so five wholes hold about fifteen of them.` },
      { label: "About 1.7 — dividing makes things smaller", correct: false, feedback: `Dividing by a number BELOW one makes the result larger, because many small pieces fit.` },
      { label: "About 5, since 1/3 is close to nothing", correct: false, feedback: `A third is a substantial piece; fifteen of them fit in five wholes.` },
      { label: "You cannot estimate a fraction division", correct: false, feedback: `You can: ask how many of the piece fit in one whole, then scale by the number of wholes.` },
    ] };
}

const REUSE = { WholeByUnitNumeric, ShareEvenlyNumeric, UnitByWholeNumeric, QuotientAsFractionNumeric,
  MixedToImproperNumeric, CheckByMultiplyNumeric, NeededPiecesNumeric, SimplifyQuotientNumeric,
  UnevenShareMcq: () => UnevenShareMcq(), AsFractionMcq: () => AsFractionMcq(),
  InterpretQuotientMcq: () => InterpretQuotientMcq(), VisualModelMcq: () => VisualModelMcq(),
  WhichIsItMcq: () => WhichIsItMcq(), EstimateQuotientMcq: () => EstimateQuotientMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Ask what is being cut and what size the pieces are; the count of pieces is the answer.") {
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

  must(REG[out.gen]?.has(out.form), `${mirror}: ${out.gen}/${out.form} NOT registered`);
  // POSITIONAL GUARD: a fraction mentioned before the graded expression hijacks ns[0]/ns[1]
  const nums = (out.prompt.match(/\d+/g) || []).map(Number);
  if (out.form === "mbMultiplyTensNumeric") {
    must(nums[0] * nums[1] === out.answer, `${mirror}: the first two numbers must be the graded operands`);
  }
  if (out.form === "mbDivideBigNumeric") {
    must(nums[0] / nums[1] === out.answer, `${mirror}: the first two numbers must be the graded operands`);
  }
  if (out.form === "mbInterpretRemaindersNumeric") {
    must(Math.ceil(nums[0] / nums[1]) === out.answer, `${mirror}: ceil(ns0/ns1) must be the answer`);
  }
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
    `fracBar target ${targetNum}/${targetDen} outside the 1..12 sliders`);
  // The corpus template carries the SOURCE lesson's wording ("shorter than the target half"),
  // which is untrue for any target that is not a half. Author both directions from the target.
  w.lowFeedback = `That build is SHORTER than ${targetNum}/${targetDen} — either shade more pieces or make each piece larger until the lengths match.`;
  w.highFeedback = `That build is LONGER than ${targetNum}/${targetDen} — either shade fewer pieces or make each piece smaller until the lengths match.`;
  // A target at the very edge of the sliders leaves one direction unreachable, and the engine
  // reports that as DEAD FEEDBACK. Require room on both sides.
  must(targetNum / targetDen > 1 / 12, `fracBar target ${targetNum}/${targetDen} is the smallest reachable value — lowFeedback would be dead`);
  must(targetNum / targetDen < 12, `fracBar target ${targetNum}/${targetDen} is the largest reachable value — highFeedback would be dead`);
  w.successFeedback = success;
  w.commonFractions = traps.filter(([n, d]) => {
    must(n >= 1 && n <= 12 && d >= 1 && d <= 12, `fracBar trap ${n}/${d} outside the sliders`);
    return n * targetDen !== d * targetNum;      // a value-equal trap is dropped silently
  }).map(([num, den, feedback]) => {
    must(feedback.length >= 25, "fracBar trap feedback short");
    return { num, den, feedback };
  });
  must(w.commonFractions.length >= 1,
    `fracBar ${targetNum}/${targetDen}: every trap equalled the target's VALUE — no wrong build survives`);
  return w;
}
function nlPlace(prompt, fractionDen, target, success, traps, low, high) {
  const w = structuredClone(NLP_T);
  w.prompt = prompt; w.fractionDen = fractionDen;
  w.min = 0; w.max = fractionDen; w.step = 1; w.tickStep = 1;
  w.target = target; w.start = 0;
  if ("showDistanceFromZero" in w) delete w.showDistanceFromZero;
  w.lowFeedback = low; w.highFeedback = high;
  must(low && low.length >= 25 && high && high.length >= 25, "nlPlace needs its own low/high feedback");
  w.successFeedback = success;
  w.commonPlacements = traps.map(([value, feedback]) => {
    must(value !== target, `nlPlace trap ${value} equals target`);
    must(value >= 0 && value <= fractionDen, `nlPlace trap ${value} off the line`);
    must(feedback.length >= 25, "nlPlace trap feedback short");
    return { value, feedback };
  });
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
  actionGoal: `Ask what is being cut and how big each piece is, then count the pieces for ${tag.replace(/-/g, " ")}.`,
  invariants: [`Division and fractions are the same act seen twice: sharing a wholes among b people gives a/b, and dividing BY a piece asks how many of it fit, which is why ${tag.replace(/-/g, " ")} produces a larger answer when the divisor is under one.`],
  misconceptions: [`Reading "divide by 1/4" as "take a quarter of", reporting a remainder when the leftover could be shared, or shrinking the pieces when only their count should change.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `fraction-division-g5:${tag}`, delayed: true,
  counterfactualPrompt: "If the divisor grew past one, would the answer become larger or smaller than the dividend?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  share: ["Cut, then hand out.", "Each whole splits b ways.", "a ÷ b is a/b."],
  fit: ["How many fit?", "Small pieces, big count.", "Below one enlarges."],
  interpret: ["Can the leftover be cut?", "If so, it is a fraction.", "If not, a remainder."],
  check: ["Multiply back.", "It must rebuild the start.", "Inverse always available."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Sharing does not stop when the numbers refuse to divide evenly. Three sandwiches among four people gives each three quarters — the leftover is cut, not abandoned.",
  "Every whole is split into as many pieces as there are people, and each person collects one piece from every whole.",
  { rep: "concrete", widget: () => fracBar("3 sandwiches shared among 4 people. Build one person's share.", 3, 4,
      "3/4 — each sandwich cut into fourths, and each person takes three of those pieces.",
      [[1, 4, "1/4 is one piece from ONE sandwich; there are three sandwiches to draw from."],
       [4, 3, "4/3 is more than a whole sandwich each, which three cannot supply to four people."]]),
    predict: P("3 shared among 4 — does anyone get a whole sandwich?", [{ id: "no", label: "No — less than one each" }, { id: "yes", label: "Yes" }], "no",
      "Three wholes cannot give four people one each; every share must fall under a whole.") },
  [
    reused("UnevenShareMcq", "g5f1-k1", H.share, ["Cut the leftover.", "Nothing is wasted."]),
    reused("ShareEvenlyNumeric", "g5f1-k2", H.share, ["Equal shares divide.", "Count one share."]),
    reused("UnevenShareMcq", "g5f1-k3", H.share, ["Shares below one are fine.", "Pieces get smaller."]),
    reused("ShareEvenlyNumeric", "g5f1-ch1", H.share, ["Bigger piles, same sharing.", "Divide evenly."]),
  ],
  ["Sharing continues past whole numbers.", "The leftover is cut, not abandoned.", "Each share can be under one."],
  "next: writing that as a fraction.");

def(2,
  "Every division IS a fraction: a ÷ b equals a/b, because cutting a wholes into b pieces each gives everyone a of those pieces.",
  "The fraction bar is not shorthand invented for convenience — it means division exactly, in both directions.",
  { rep: "concrete", widget: () => fracBar("Write 5 ÷ 8 as a fraction and build it.", 5, 8,
      "5/8 — five wholes shared eight ways gives each person five of the eighth-pieces.",
      [[8, 5, "8/5 reverses the sharing: that is what 8 ÷ 5 would give, more than one whole each."],
       [1, 8, "1/8 is a single piece; five wholes supply five of them per person."]]),
    predict: P("What is 5 ÷ 8 as a fraction?", [{ id: "58", label: "5/8" }, { id: "85", label: "8/5" }], "58",
      "The amount being shared goes on top; the number of shares goes underneath.") },
  [
    reused("AsFractionMcq", "g5f2-k1", H.share, ["Dividend on top.", "Divisor underneath."]),
    reused("QuotientAsFractionNumeric", "g5f2-k2", H.share, ["Group into wholes.", "Read the whole part."]),
    reused("AsFractionMcq", "g5f2-k3", H.share, ["The bar means divide.", "Both directions."]),
    reused("ShareEvenlyNumeric", "g5f2-ch1", H.share, ["Even shares too.", "Same relationship."]),
  ],
  ["a ÷ b equals a/b.", "The dividend goes on top.", "The bar means division exactly."],
  "next: reading the answer sensibly.");

def(3,
  "The same quotient can be reported two ways. 13 ÷ 4 is 3 remainder 1, or 3 1/4 — and which is right depends on whether the leftover can be cut.",
  "Sandwiches can be cut, so the fraction is right. Buses cannot, so the remainder is. The arithmetic never changes; the reading does.",
  { rep: "concrete", widget: () => fracBar("13 ÷ 4 as a mixed number: build the FRACTION part.", 1, 4,
      "1/4 — three whole sandwiches each, plus a quarter from the one left over.",
      [[3, 4, "3/4 is what 3 ÷ 4 gives; here the leftover is a single sandwich shared four ways."],
       [1, 3, "Thirds appear nowhere — the sandwich is shared among four people."]]),
    predict: P("13 people into 4-seat cars — fraction or remainder?", [{ id: "rem", label: "Remainder — people cannot be cut" }, { id: "frac", label: "Fraction" }], "rem",
      "A quarter of a person is meaningless, so the leftover stays whole and needs another car.") },
  [
    reused("InterpretQuotientMcq", "g5f3-k1", H.interpret, ["Can the leftover be cut?", "That decides the form."]),
    reused("QuotientAsFractionNumeric", "g5f3-k2", H.interpret, ["Whole part first.", "Then the leftover."]),
    reused("NeededPiecesNumeric", "g5f3-k3", H.interpret, ["Uncuttable leftovers round up.", "Nothing left behind."]),
    reused("InterpretQuotientMcq", "g5f3-ch1", H.interpret, ["The story decides.", "Not the arithmetic."]),
  ],
  ["A quotient has two readings.", "Cuttable leftovers become fractions.", "Uncuttable ones stay remainders."],
  "next: sharing stories.");

def(4,
  "Sharing stories name the amount and the number of shares. Once both are found, the fraction writes itself.",
  "Read for what is being divided and among how many — the words carry the numerator and denominator in that order.",
  { rep: "concrete", widget: () => fracBar("7 metres of rope shared among 8 people. Build one share.", 7, 8,
      "7/8 metre — seven wholes shared eight ways gives each seven of the eighth-pieces.",
      [[8, 7, "8/7 reverses the story; that would be eight metres shared among seven."],
       [1, 8, "1/8 is one piece from a single metre; there are seven metres."]]),
    predict: P("7 metres among 8 people — more or less than a metre each?", [{ id: "less", label: "Less" }, { id: "more", label: "More" }], "less",
      "Seven wholes cannot give eight people a whole metre each.") },
  [
    reused("ShareEvenlyNumeric", "g5f4-k1", H.share, ["Amount over shares.", "In that order."]),
    reused("QuotientAsFractionNumeric", "g5f4-k2", H.share, ["Group into wholes.", "Read the count."]),
    reused("UnevenShareMcq", "g5f4-k3", H.share, ["Cut the leftover.", "Equal shares."]),
    reused("SimplifyQuotientNumeric", "g5f4-ch1", H.share, ["Simplify the share.", "Divide both parts."]),
  ],
  ["Read for the amount and the shares.", "Amount on top, shares beneath.", "The fraction writes itself."],
  "next: sharing a fraction.");

def(5,
  "Dividing a unit fraction by a whole number cuts an already-small piece into smaller ones: one fourth shared three ways gives twelfths.",
  "The count of pieces per whole multiplies, so the denominator grows. The piece gets smaller, exactly as sharing should.",
  { rep: "concrete", widget: () => fracBar("One fourth is about to be shared 3 ways. Build that fourth as twelfths first.", 3, 12,
      "3/12 — the same fourth, now cut into twelfths, so the three-way share is one twelfth each.",
      [[1, 12, "A single twelfth is ONE of the three shares, not the whole fourth being shared."],
       [3, 4, "3/4 is three of the original fourths, far more than the single fourth being shared."]]),
    predict: P("Sharing 1/4 three ways, does the denominator grow or shrink?", [{ id: "grow", label: "Grow — to twelfths" }, { id: "shrink", label: "Shrink" }], "grow",
      "More cuts means more pieces in the whole, so the number naming the piece size rises.") },
  [
    reused("UnitByWholeNumeric", "g5f5-k1", H.fit, ["More cuts, more pieces.", "The denominator grows."]),
    reused("UnitByWholeNumeric", "g5f5-k2", H.fit, ["Each piece shrinks.", "Sharing always does."]),
    reused("SimplifyQuotientNumeric", "g5f5-k3", H.share, ["Simplify if you can.", "Both parts divide."]),
    reused("UnitByWholeNumeric", "g5f5-ch1", H.fit, ["Bigger sharings, same rule.", "Multiply the denominator."]),
  ],
  ["Sharing a fraction cuts it further.", "The denominator grows.", "Each piece gets smaller."],
  "next: dividing BY a fraction.");

def(6,
  "Dividing a whole number BY a unit fraction asks a different question: how many of that piece fit? Three wholes hold twelve fourths.",
  "Because many small pieces fit inside a whole, dividing by a fraction under one makes the answer LARGER — the opposite of what division usually does.",
  { rep: "concrete", widget: () => fracBar("How many fourths fit in 3 wholes? Build that count as ?/4.", 12, 4,
      "12/4 — three wholes hold twelve fourths, which is why 3 ÷ 1/4 = 12.",
      [[3, 4, "3/4 is what 3 ÷ 4 gives — sharing three among four, not counting how many fourths fit."],
       [4, 4, "4/4 is a single whole; three wholes hold three times as many fourths."]]),
    predict: P("Is 3 ÷ 1/4 bigger or smaller than 3?", [{ id: "bigger", label: "Bigger — 12" }, { id: "smaller", label: "Smaller" }], "bigger",
      "Fourths are small, so a great many of them fit inside three wholes.") },
  [
    reused("WholeByUnitNumeric", "g5f6-k1", H.fit, ["How many fit in one?", "Then scale by the wholes."]),
    reused("VisualModelMcq", "g5f6-k2", H.fit, ["Count the pieces.", "Not a fraction of."]),
    reused("WholeByUnitNumeric", "g5f6-k3", H.fit, ["Below one enlarges.", "Small pieces, many of them."]),
    reused("WholeByUnitNumeric", "g5f6-ch1", H.fit, ["Any unit fraction, same count.", "Wholes times denominator."]),
  ],
  ["Dividing by a fraction counts how many fit.", "Small pieces mean a large count.", "A divisor under one enlarges."],
  "next: drawing it.");

def(7,
  "A visual model settles which question is being asked: cutting three wholes into fourths and counting the pieces shows 3 ÷ 1/4 = 12 at a glance.",
  "The same picture drawn for 3 ÷ 4 looks completely different — three quarters, not twelve pieces. The drawing keeps the two apart.",
  { rep: "concrete", widget: () => fracBar("Model 3 ÷ 4: build the share one person receives.", 3, 4,
      "3/4 — this is the SHARING question, and its answer is under one whole.",
      [[12, 4, "12/4 is the answer to 3 ÷ 1/4, which counts how many fourths FIT rather than sharing."],
       [1, 4, "1/4 is one piece from a single whole; three wholes contribute three of them."]]),
    predict: P("Do 3 ÷ 4 and 3 ÷ 1/4 have the same answer?", [{ id: "no", label: "No — 3/4 and 12" }, { id: "yes", label: "Yes" }], "no",
      "One shares three among four; the other counts how many fourths fit in three.") },
  [
    reused("VisualModelMcq", "g5f7-k1", H.fit, ["Which question is it?", "Share or fit?"]),
    reused("WholeByUnitNumeric", "g5f7-k2", H.fit, ["Counting fourths.", "Multiply by the denominator."]),
    reused("ShareEvenlyNumeric", "g5f7-k3", H.share, ["Sharing divides.", "Answer under one."]),
    reused("VisualModelMcq", "g5f7-ch1", H.fit, ["The picture separates them.", "Draw before computing."]),
  ],
  ["A model shows which question is asked.", "Sharing and fitting differ.", "The picture keeps them apart."],
  "next: on the number line.");

def(8,
  "The number line makes fitting visible: mark off fourths and count how many jumps reach three, and the answer to 3 ÷ 1/4 stands there in the marks.",
  "It also shows why the answer exceeds the dividend — the jumps are smaller than one, so more of them are needed.",
  { rep: "concrete", widget: () => fracBar("How many thirds fit in 4 wholes? Build that count as ?/3.", 12, 3,
      "12/3 — four wholes hold twelve thirds, three jumps to every whole.",
      [[3, 3, "3/3 is one whole; four wholes hold four times as many thirds."],
       [4, 3, "4/3 counts the WHOLES with a thirds label; the question asks how many third-pieces fit."]]),
    predict: P("Jumps of 1/3 to reach 5 wholes — how many?", [{ id: "fifteen", label: "15" }, { id: "five", label: "5" }], "fifteen",
      "Each whole takes three jumps, so five wholes take fifteen.") },
  [
    reused("WholeByUnitNumeric", "g5f8-k1", H.fit, ["Jumps per whole.", "Times the wholes."]),
    reused("WholeByUnitNumeric", "g5f8-k2", H.fit, ["Smaller jumps, more of them.", "The count rises."]),
    reused("EstimateQuotientMcq", "g5f8-k3", H.fit, ["Estimate the count.", "Then verify."]),
    reused("WholeByUnitNumeric", "g5f8-ch1", H.fit, ["Any denominator, same counting.", "Wholes times pieces."]),
  ],
  ["The line shows the pieces fitting.", "Smaller jumps, more of them.", "The count exceeds the dividend."],
  "next: proving it.");

def(9,
  "Multiplication checks division here as everywhere: if 3 ÷ 1/4 is 12, then 12 × 1/4 must rebuild 3.",
  "That check is what distinguishes a guessed answer from a known one, and it works whichever direction the division ran.",
  { rep: "concrete", widget: () => fracBar("Check that 3 ÷ 1/4 = 12: build 12 × 1/4 as a single fraction.", 12, 4,
      "12/4 — twelve fourths, which is exactly the 3 wholes we started with.",
      [[3, 4, "3/4 is one person's share in the SHARING question, not the count of fourths."],
       [12, 12, "12/12 is one whole; twelve fourths make three."]]),
    predict: P("If 3 ÷ 1/4 = 12, what should 12 × 1/4 give?", [{ id: "three", label: "3" }, { id: "twelve", label: "12" }], "three",
      "Multiplying the quotient by the divisor must rebuild the original amount.") },
  [
    reused("CheckByMultiplyNumeric", "g5f9-k1", H.check, ["Multiply back.", "It must rebuild."]),
    reused("QuotientAsFractionNumeric", "g5f9-k2", H.check, ["Group into wholes.", "Compare to the start."]),
    reused("CheckByMultiplyNumeric", "g5f9-k3", H.check, ["Counts collect.", "Piece size holds."]),
    reused("MixedToImproperNumeric", "g5f9-ch1", H.check, ["Convert to check.", "Wholes become pieces."]),
  ],
  ["Multiplication undoes division.", "Quotient times divisor rebuilds the start.", "It works in both directions."],
  "next: telling the two apart.");

def(10,
  "The hardest question in this topic is which operation a story wants. 'Cut into 1/2-metre pieces' counts pieces; 'shared among 2' splits the amount.",
  "Ask what the answer will COUNT. If it counts pieces, the divisor is the piece size and the answer grows.",
  { rep: "diagram", widget: () => estimate("A 4-metre ribbon cut into 1/2-metre pieces — slide to the number of pieces.", 1, 40, 8, "pieces",
      "Too low — each piece is only half a metre, so four metres yield more than that.",
      "Too high — four metres cannot yield more than eight half-metre pieces.",
      "8 — because each metre yields two half-metre pieces, and there are four metres."),
    predict: P("4 metres in 1/2-metre pieces — how many pieces?", [{ id: "eight", label: "8" }, { id: "two", label: "2" }], "eight",
      "Each metre gives two half-metre pieces, so four metres give eight.") },
  [
    reused("WhichIsItMcq", "g5f10-k1", H.fit, ["What will the answer count?", "Pieces or share?"]),
    reused("WholeByUnitNumeric", "g5f10-k2", H.fit, ["Counting pieces multiplies.", "By the denominator."]),
    reused("ShareEvenlyNumeric", "g5f10-k3", H.share, ["Sharing divides.", "Answer gets smaller."]),
    reused("WhichIsItMcq", "g5f10-ch1", H.fit, ["The words decide.", "Read for the question."]),
  ],
  ["Ask what the answer counts.", "Pieces means dividing by a size.", "Shares means dividing by a number."],
  "next: stories of both kinds.");

def(11,
  "Division word problems mix both kinds freely, so the reading matters more than the arithmetic.",
  "Name the whole, name the piece, and decide which one is unknown — that single decision picks the operation every time.",
  { rep: "diagram", widget: () => estimate("6 litres poured into 1/3-litre cups — slide to the number of cups.", 1, 60, 18, "cups",
      "Too low — each cup takes only a third of a litre, so six litres fill many of them.",
      "Too high — six litres cannot fill more than eighteen third-litre cups.",
      "18 — three cups per litre, across six litres."),
    predict: P("6 litres into 1/3-litre cups — more or fewer than 6 cups?", [{ id: "more", label: "More" }, { id: "fewer", label: "Fewer" }], "more",
      "Each litre fills three cups, so the count is well above the number of litres.") },
  [
    reused("WholeByUnitNumeric", "g5f11-k1", H.fit, ["Cups per litre.", "Times the litres."]),
    reused("ShareEvenlyNumeric", "g5f11-k2", H.share, ["Sharing among people.", "Divides down."]),
    reused("WhichIsItMcq", "g5f11-k3", H.fit, ["Read the question.", "Then choose."]),
    reused("NeededPiecesNumeric", "g5f11-ch1", H.interpret, ["Partial containers round up.", "Nothing left behind."]),
  ],
  ["Name the whole and the piece.", "Decide which is unknown.", "That picks the operation."],
  "next: knowing roughly first.");

def(12,
  "Estimating a fraction quotient asks how many pieces fit in ONE whole, then scales by the number of wholes.",
  "Dividing by a third roughly triples; dividing by a half roughly doubles. That single instinct catches every answer that came out smaller when it should have grown.",
  { rep: "diagram", widget: () => estimate("5 ÷ 1/3 — slide to estimate the quotient.", 1, 60, 15, "pieces",
      "Too low — dividing by a piece under one makes the answer LARGER than the five you started with.",
      "Too high — five wholes hold fifteen thirds, not more.",
      "15 — three thirds per whole, across five wholes."),
    predict: P("Dividing by 1/3 — does the answer grow or shrink?", [{ id: "grow", label: "Grow, roughly triple" }, { id: "shrink", label: "Shrink" }], "grow",
      "Thirds are small, so three of them fit in every whole and the count triples.") },
  [
    reused("EstimateQuotientMcq", "g5f12-k1", H.fit, ["Pieces per whole.", "Then scale."]),
    reused("WholeByUnitNumeric", "g5f12-k2", H.fit, ["Compute exactly.", "Compare to the estimate."]),
    reused("EstimateQuotientMcq", "g5f12-k3", H.fit, ["Below one enlarges.", "Always."]),
    reused("CheckByMultiplyNumeric", "g5f12-ch1", H.check, ["Multiply back to confirm.", "It must rebuild."]),
  ],
  ["Ask how many fit in one whole.", "Then scale by the wholes.", "A divisor under one enlarges."],
  "course complete: shared, written, interpreted, modelled, and checked.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 12, `12 lessons defined, got ${L.length}`);
const chapterTitles = ["Division That Makes Fractions", "Dividing With Unit Fractions", "Choosing and Checking"];
const perChapter = [4, 4, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 8 ? 2 : 3);
const outDir = join(root, "content/courses/fraction-division-g5");
mkdirSync(join(outDir, "lessons"), { recursive: true });

const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);
const MANIP2 = new Set(["numberLineHop", "barBuilder", "estimateSlider", "numberLinePlace", "areaModel", "columnCalc", "fractionBar", "tapDiagram"]);

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g5f-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "concrete") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "fraction-division-g5",
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

  let manipSeen = false, entryAfterManip = false;
  for (const s of lesson.steps) {
    if (!s.widget) continue;
    if (MANIP2.has(s.widget.type)) manipSeen = true;
    else if (manipSeen && ENTRY.has(s.widget.type)) entryAfterManip = true;
  }
  must(entryAfterManip, `${id}: needs a numeric check after the manipulative or it caps at Tier B`);

  for (const s of lesson.steps) {
    const w = s.widget;
    if (!w) continue;
    if (w.type === "numeric") {
      for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} trap==answer`);
      const n = (w.prompt.match(/\d+/g) || []).map(Number);
      const f = s.variant?.form;
      if (f === "mbMultiplyTensNumeric") must(n[0] * n[1] === w.answer, `${id}/${s.id}: first two numbers must be the operands`);
      if (f === "mbDivideBigNumeric") must(n[0] / n[1] === w.answer, `${id}/${s.id}: first two numbers must be the operands`);
      if (f === "mbInterpretRemaindersNumeric") must(Math.ceil(n[0] / n[1]) === w.answer, `${id}/${s.id} ceil(n0/n1)`);
      if (f === "faImproperToMixedNumeric") {
        const m = w.prompt.match(/Convert (\d+)\/(\d+)/);
        must(m && Math.floor(+m[1] / +m[2]) === w.answer, `${id}/${s.id} improper-to-mixed`);
      }
      if (f === "faMixedToImproperNumeric") {
        const m = w.prompt.match(/Convert (\d+) (\d+)\/(\d+)/);
        must(m && +m[1] * +m[3] + +m[2] === w.answer, `${id}/${s.id} mixed-to-improper`);
      }
      if (f === "faWholeTimesFractionNumeric") {
        const m = w.prompt.match(/^Compute (\d+) × (\d+)\/(\d+)/);
        must(m && +m[1] * +m[2] === w.answer, `${id}/${s.id} faWholeTimesFraction shape`);
      }
    }
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 4, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
    }
    if (w.type === "fractionBar") {
      for (const t of w.commonFractions)
        must(t.num * w.targetDen !== t.den * w.targetNum, `${id}/${s.id} fractionBar trap equals target value`);
      must(w.commonFractions.length >= 1, `${id}/${s.id} fractionBar has no surviving wrong build`);
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
  id: "fraction-division-g5", slug: "fraction-division-g5", title: spec.title,
  tagline: "Sharing makes fractions; dividing by a piece counts how many fit.",
  category: "Math", gradeLevel: 5, chapters,
}, null, 2) + "\n");
console.log(`built 12 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
