#!/usr/bin/env node
// S197 — Batch F course 1/6: decimal-fluency-g5 (5.NBT.B.7). Zero new generator code.
//
// FIT-CHECK FINDING. Computational per-form solvers exist ONLY for the tag prefixes g0/k0-, g1-,
// g2-, g3-mult/div-fluency, g4-, a1-, a2-, g10-, g12-, g13- (see the INDEPENDENT registration
// loops in variants.test.ts). There is no g5- family, and every decimal-arithmetic family
// (decimal-align-addsub, decimal-mul-places, decimal-shift-divide, decimal-compute) is
// authored-template LOOKUP and cannot carry a new prompt. Worse, g4-decimals covers decimal
// REPRESENTATION only — tenths/hundredths grids, place names, fraction<->decimal — not arithmetic.
//
// So this course splits along the real line of what is computable:
//   * representation, comparison, money, measurement -> g4-decimals
//   * add / subtract  -> g2-place-value-1000, computed IN HUNDREDTHS
//   * multiply / divide -> g4-multiply, computed IN HUNDREDTHS
// Computing in the smallest unit and then placing the point is not a workaround; it is exactly
// what lesson 9 ("Where Does the Point Go?") teaches, and the prose says so explicitly.
//
// PROMPT HAZARD, asserted per step: g2Independent.arithmetic() matches the FIRST /(\d+)\s*\+\s*(\d+)/
// in the whole prompt. A prompt containing "3.40 + 2.25" would match "40 + 2" and grade 42. Graded
// add/subtract prompts therefore carry the hundredths expression ONLY — the decimal reading lives
// in the lesson prose. Subtract prompts must contain no "+" at all, since "+" is tried first.
//
// Verified routes (all probed against the shipped solvers before authoring):
//   Pv1000AddTradeNumeric / Pv1000SubtractTradeNumeric -> arithmetic(prompt)
//   mbMultiplyTensNumeric -> ns[0]*ns[1]      mbDivideBigNumeric -> ns[0]/ns[1]
//   mbMultiStepNumeric    -> ns[0]*ns[1]−ns[2]
//   dTenthsWriteNumeric   "split into 10 equal columns, and N"     -> N/10
//   dHundredthsCellsNumeric  (needs a non-integer in the prompt)   -> round(d*100)
//   dFractionToDecimalNumeric -> first fraction's num/den
//   dMoneyNumeric         "(N) dimes and (M) pennies"              -> (N*10+M)/100
//   dMeasureNumeric       "(N) centimeters"                        -> N/100
// SURFACE NOTE: dCompareRational renders a `rationalCompare`, NOT an mcq — a form named for a
// comparison is not necessarily a multiple choice. Surfaces were probed, not assumed.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "decimal-fluency-g5");
if (!spec || spec.lessons.length !== 16) throw new Error("spec course missing or wrong size");

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
const COL_T = corpusTemplate("columnCalc", "place-value-million");
const EST_T = corpusTemplate("estimateSlider", "multiplication-division");
const BAR_T = corpusTemplate("barBuilder", "measurement-data");
const HOP_T = corpusTemplate("numberLineHop", "add-subtract-1000-g2");

/* ---- ported from schema.ts columnCalcReachable: traps must be PROVEN reachable ---- */
const ccDigits = (n) => String(n).split("").reverse().map(Number);
function columnCalcReachable(op, a, b) {
  const out = new Set();
  const join2 = (acc) => Number([...acc].reverse().join(""));
  if (op === "add" || op === "multiply") {
    const A = ccDigits(a), B = op === "add" ? ccDigits(b) : [];
    const n = op === "add" ? Math.max(A.length, B.length) : A.length;
    const rec = (i, carryIn, acc) => {
      if (i === n) {
        if (carryIn > 0) { out.add(join2([...acc, ...ccDigits(carryIn)])); out.add(join2(acc)); }
        else out.add(join2(acc));
        return;
      }
      const base = op === "add" ? (A[i] ?? 0) + (B[i] ?? 0) : (A[i] ?? 0) * b;
      const withCarry = base + carryIn;
      rec(i + 1, Math.floor(withCarry / 10), [...acc, withCarry % 10]);
      if (carryIn > 0) rec(i + 1, Math.floor(base / 10), [...acc, base % 10]);
    };
    rec(0, 0, []);
  } else {
    const A0 = ccDigits(a), B = ccDigits(b), n = A0.length;
    const rec = (i, top, acc) => {
      if (i === n) { out.add(join2(acc)); return; }
      const t = top[i] ?? 0, bo = B[i] ?? 0;
      if (t >= bo) { rec(i + 1, top, [...acc, t - bo]); return; }
      rec(i + 1, top, [...acc, bo - t]);
      let j = i + 1;
      while (j < n && top[j] === 0) j++;
      if (j < n) {
        const nt = [...top];
        nt[j] -= 1;
        for (let k = i + 1; k < j; k++) nt[k] = 9;
        nt[i] = t + 10;
        rec(i + 1, nt, [...acc, nt[i] - bo]);
      }
    };
    rec(0, A0, []);
  }
  return out;
}
const ccTruth = (op, a, b) => (op === "add" ? a + b : op === "subtract" ? a - b : a * b);

const REG_PV = new Set(["Pv1000AddByPlaceNumeric","Pv1000AddTradeNumeric","Pv1000BuildNumberNumeric",
  "Pv1000CountForwardNumeric","Pv1000DigitWorthNumeric","Pv1000MixedNumeric","Pv1000OrderMixedMcq",
  "Pv1000OrderMixedNumeric","Pv1000ReadWordsNumeric","Pv1000RealworldNumeric","Pv1000SkipFivesNumeric",
  "Pv1000SkipHundredsNumeric","Pv1000SkipTensNumeric","Pv1000SubtractByPlaceNumeric",
  "Pv1000SubtractTradeNumeric","Pv1000TradingNumeric","Pv1000WriteWordsBuildExpression"]);
const REG_MB = new Set(["mbTimesAsManyMcq","mbTimesAsManyNumeric","mbComparisonEquationsMcq",
  "mbComparisonEquationsNumeric","mbAdditiveVsMultiplicativeMcq","mbAdditiveVsMultiplicativeNumeric",
  "mbFactorsMcq","mbFactorsNumeric","mbMultiplesMcq","mbPrimeCompositeMcq","mbPrimeCompositeNumeric",
  "mbMultiplyTensMcq","mbMultiplyTensNumeric","mbAreaModel1DigitMcq","mbAreaModel1DigitNumeric",
  "mbAreaModel2DigitMcq","mbAreaModel2DigitNumeric","mbRemaindersMcq","mbRemaindersNumeric",
  "mbDivideBigNumeric","mbInterpretRemaindersMcq","mbInterpretRemaindersNumeric","mbPatternsMcq",
  "mbPatternsNumeric","mbMultiStepNumeric"]);
const REG_D = new Set(["dTenthsWriteNumeric","dTenthsFractionMcq","dHundredthsWriteNumeric",
  "dHundredthsCellsNumeric","dTenthToHundredthNumeric","dAddTenthHundredthNumeric","dReadDecimalMcq",
  "dPlaceNameMcq","dFractionToDecimalNumeric","dDecimalToFractionMcq","dCompareRational",
  "dTrailingZeroRational","dOrderDrag","dMoneyNumeric","dMeasureNumeric"]);
const REG = { "g2-place-value-1000": REG_PV, "g4-multiply": REG_MB, "g4-decimals": REG_D };

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
const money = (cents) => (cents / 100).toFixed(2);

function traps2(answer, cands) {
  const out = [];
  for (const [v, fb] of cands) {
    if (v !== answer && v >= 0 && !out.some((o) => o[0] === v)) out.push([v, fb]);
    if (out.length === 2) break;
  }
  for (let d = 3; out.length < 2; d++) {
    const v = Math.round((answer + d) * 100) / 100;
    if (!out.some((o) => o[0] === v)) {
      out.push([v, "That value does not follow from the digits and the place the point sits in."]);
    }
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

/* ---------------- graded mirrors ---------------- */
// Add / subtract are computed IN HUNDREDTHS so the prompt carries integers only.
function AddHundredthsNumeric(r) {
  const a = pick(r, 145, 480), b = pick(r, 135, 460);
  const ans = a + b;
  must(ans <= 999, "hundredths sum must stay inside the within-1000 route");
  return { gen: "g2-place-value-1000", form: "Pv1000AddTradeNumeric",
    prompt: `Working in hundredths: ${a} + ${b} = ?`, answer: ans,
    traps: traps2(ans, [
      [ans - 100, `A hundred hundredths went missing in the carry — that is a whole 1.00 lost from the total.`],
      [Math.abs(a - b), `That found the difference; putting the two amounts together calls for addition.`]]) };
}
function SubHundredthsNumeric(r) {
  const a = pick(r, 420, 960), b = pick(r, 135, 400);
  const ans = a - b;
  must(a > b && !String(a).includes("+"), "subtract prompt must not contain a plus");
  return { gen: "g2-place-value-1000", form: "Pv1000SubtractTradeNumeric",
    prompt: `Working in hundredths: ${a} − ${b} = ?`, answer: ans,
    traps: traps2(ans, [
      [a + b, `That added the two amounts; the minus sign asks what is LEFT after taking ${b} away.`],
      [ans + 100, `One trade was taken but never paid back — the column you borrowed from must drop by one.`]]) };
}
function MultHundredthsNumeric(r) {
  const cents = pick(r, 12, 96), times = pick(r, 3, 9);
  const ans = cents * times;
  must(ans <= 999, "product must stay readable in hundredths");
  return { gen: "g4-multiply", form: "mbMultiplyTensNumeric",
    prompt: `Working in hundredths: compute ${cents} × ${times}.`, answer: ans,
    traps: traps2(ans, [
      [cents + times, `Adding mixes an amount with a repeat count — ${times} copies of ${cents} hundredths multiply.`],
      [ans - cents, `That is one copy short; ${times} copies means ${times} of them, not ${times - 1}.`]]) };
}
function DivHundredthsNumeric(r) {
  const parts = pick(r, 3, 8), each = pick(r, 12, 96);
  const total = parts * each;
  return { gen: "g4-multiply", form: "mbDivideBigNumeric",
    prompt: `Working in hundredths: compute ${total} ÷ ${parts}.`, answer: each,
    traps: traps2(each, [
      [total, `${total} hundredths is the WHOLE amount; the question asks what one of ${parts} equal parts holds.`],
      [total - parts, `Subtracting removes one part's worth once; sharing equally is division.`]]) };
}
function MultiStepHundredthsNumeric(r) {
  const cents = pick(r, 15, 60), times = pick(r, 3, 8);
  const off = pick(r, 10, cents * times - 10);
  const ans = cents * times - off;
  must(ans > 0, "multi-step result must stay positive");
  return { gen: "g4-multiply", form: "mbMultiStepNumeric",
    prompt: `Working in hundredths: ${times} items at ${cents} each, then ${off} off. How many hundredths remain?`,
    answer: ans,
    traps: traps2(ans, [
      [cents * times, `That reported the total before the discount; the ${off} still has to come off.`],
      [cents * times + off, `A discount reduces the bill, so the last step subtracts.`]]) };
}
function TenthsModelNumeric(r) {
  const shaded = pick(r, 2, 9);
  return { gen: "g4-decimals", form: "dTenthsWriteNumeric",
    prompt: `A unit square is split into 10 equal columns, and ${shaded} of them are shaded. Write the shaded amount as a decimal.`,
    answer: shaded / 10,
    traps: traps2(shaded / 10, [
      [shaded, `${shaded} counts the COLUMNS; as a decimal each column is one tenth, so the answer sits below 1.`],
      [shaded / 100, `That read the columns as hundredths. The square was split into ten, not a hundred.`]]) };
}
function HundredthsCellsNumeric(r) {
  const cells = pick(r, 12, 96);
  return { gen: "g4-decimals", form: "dHundredthsCellsNumeric",
    prompt: `A hundredths grid has 100 equal cells. How many cells must be shaded to show ${(cells / 100).toFixed(2)}?`,
    answer: cells,
    traps: traps2(cells, [
      [Math.round(cells / 10), `That read the amount as tenths; a hundredths grid counts all 100 cells.`],
      [100 - cells, `That shaded the REST of the grid — the part left over rather than the part named.`]]) };
}
function FractionToDecimalNumeric(r) {
  const [num, den] = choose(r, [[3, 10], [7, 10], [9, 10], [1, 10], [4, 10]]);
  return { gen: "g4-decimals", form: "dFractionToDecimalNumeric",
    prompt: `Write the fraction ${num}/${den} as a decimal.`, answer: num / den,
    traps: traps2(num / den, [
      [num, `${num} counts the tenth-pieces; as a decimal those pieces sit after the point.`],
      [num / 100, `That placed the digits in the hundredths place, but the fraction names tenths.`]]) };
}
function MoneyDecimalNumeric(r) {
  const dimes = pick(r, 1, 9), pennies = pick(r, 1, 9);
  return { gen: "g4-decimals", form: "dMoneyNumeric",
    prompt: `A pocket holds ${dimes} dimes and ${pennies} pennies. Write the total amount in dollars as a decimal.`,
    answer: (dimes * 10 + pennies) / 100,
    traps: traps2((dimes * 10 + pennies) / 100, [
      [(dimes + pennies) / 100, `That counted every coin as a penny; a dime is worth ten of them.`],
      [dimes * 10 + pennies, `That is the total in CENTS. Dollars need the point two places from the right.`]]) };
}
function MeasureDecimalNumeric(r) {
  const cm = pick(r, 12, 96);
  return { gen: "g4-decimals", form: "dMeasureNumeric",
    prompt: `A ribbon measures ${cm} centimeters. One meter is 100 centimeters. Write the length in meters as a decimal.`,
    answer: cm / 100,
    traps: traps2(cm / 100, [
      [cm, `${cm} is the length in CENTIMETERS; meters are bigger, so the number must shrink.`],
      [cm / 10, `That divided by ten. A meter holds one hundred centimeters, not ten.`]]) };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function AlignMcq() {
  return { kind: "mcq",
    prompt: `Adding 3.4 + 2.25, why line up the decimal points rather than the right-hand digits?`,
    options: [
      { label: "Because only matching places may be added — tenths to tenths, hundredths to hundredths", correct: true, feedback: `Correct — the point marks where the whole numbers end, so aligning it aligns every place at once.` },
      { label: "Because the longer number always goes on top", correct: false, feedback: `Which number is longer has nothing to do with it; place value is what must match.` },
      { label: "Because 3.4 has fewer digits", correct: false, feedback: `Digit count is not the issue — 3.4 and 3.40 are the same amount but look different lengths.` },
      { label: "It does not matter — either way works", correct: false, feedback: `Right-aligning would add the 4 tenths to the 5 hundredths, which combines different-sized pieces.` },
    ] };
}
function PaddingMcq() {
  return { kind: "mcq",
    prompt: `Subtracting 5.2 − 1.47, what does writing 5.2 as 5.20 do?`,
    options: [
      { label: "It gives the hundredths place a digit to subtract from, without changing the value", correct: true, feedback: `Correct — a trailing zero adds no amount, but it fills the column so the subtraction has somewhere to work.` },
      { label: "It makes 5.2 larger", correct: false, feedback: `5.20 and 5.2 are exactly equal; the zero adds no hundredths at all.` },
      { label: "It rounds the number up", correct: false, feedback: `Nothing is rounded — the value is untouched, only the way it is written changes.` },
      { label: "It is not allowed", correct: false, feedback: `It is standard practice, and it is what makes ragged-length subtraction workable.` },
    ] };
}
function PlacePointMcq() {
  return { kind: "mcq",
    prompt: `Computing 0.4 × 0.3 in hundredths gives 12. Where does the point go?`,
    options: [
      { label: "0.12 — one decimal place from each factor makes two in the product", correct: true, feedback: `Correct — tenths times tenths gives hundredths, so the product carries two decimal places.` },
      { label: "1.2 — one decimal place", correct: false, feedback: `That counts only one factor's place. Each factor contributes its own, so the product has two.` },
      { label: "12 — no decimal places", correct: false, feedback: `Multiplying two numbers below one cannot produce twelve; the product must be smaller than either factor.` },
      { label: "0.012 — three decimal places", correct: false, feedback: `Three places would need a thousandth somewhere; one tenth times one tenth reaches only hundredths.` },
    ] };
}
function EstimateProductMcq() {
  return { kind: "mcq",
    prompt: `Before computing 4.9 × 6, which estimate is most useful?`,
    options: [
      { label: "5 × 6 = 30, so a little under 30", correct: true, feedback: `Correct — 4.9 is just under 5, so six of them land just under 30.` },
      { label: "4 × 6 = 24", correct: false, feedback: `Rounding 4.9 down to 4 throws away nearly a whole unit, six times over.` },
      { label: "About 3, since 4.9 is close to 5 and 5 ÷ 6 is under 1", correct: false, feedback: `That divides instead of multiplying; the operation must survive the estimate.` },
      { label: "About 300", correct: false, feedback: `That is off by a factor of ten — five sixes is thirty, not three hundred.` },
    ] };
}
function ShiftDivideMcq() {
  return { kind: "mcq",
    prompt: `To compute 7.2 ÷ 0.9, why multiply BOTH numbers by 10 first?`,
    options: [
      { label: "Because scaling both by the same factor leaves the quotient unchanged", correct: true, feedback: `Correct — 72 ÷ 9 has the same answer as 7.2 ÷ 0.9, and a whole-number divisor is far easier to work with.` },
      { label: "Because it makes the answer ten times bigger", correct: false, feedback: `It does not change the answer at all — that is precisely why the move is legal.` },
      { label: "Because you may only divide whole numbers", correct: false, feedback: `Dividing by a decimal is perfectly valid; scaling is a convenience, not a requirement.` },
      { label: "Because 0.9 rounds to 1", correct: false, feedback: `Rounding would change the answer; scaling both numbers preserves it exactly.` },
    ] };
}
function CheckDecimalMcq() {
  return { kind: "mcq",
    prompt: `A student computes 3.6 × 4 and gets 1.44. What does an estimate reveal?`,
    options: [
      { label: "It is wrong — four groups of about 3.6 is near 14, not near 1.4", correct: true, feedback: `Correct — the digits are right but the point is two places off; estimating catches exactly that.` },
      { label: "It is right — the digits 144 are correct", correct: false, feedback: `Correct digits in the wrong place still give the wrong amount, and this one is ten times too small.` },
      { label: "The estimate cannot help with decimals", correct: false, feedback: `Estimating is most valuable with decimals, because a misplaced point is the commonest error there is.` },
      { label: "It is wrong — the answer should be 144", correct: false, feedback: `144 is the hundredths count; as an amount that would be 14.4, which is where the point belongs.` },
    ] };
}

const REUSE = { AddHundredthsNumeric, SubHundredthsNumeric, MultHundredthsNumeric,
  DivHundredthsNumeric, MultiStepHundredthsNumeric, TenthsModelNumeric, HundredthsCellsNumeric,
  FractionToDecimalNumeric, MoneyDecimalNumeric, MeasureDecimalNumeric,
  AlignMcq: () => AlignMcq(), PaddingMcq: () => PaddingMcq(), PlacePointMcq: () => PlacePointMcq(),
  EstimateProductMcq: () => EstimateProductMcq(), ShiftDivideMcq: () => ShiftDivideMcq(),
  CheckDecimalMcq: () => CheckDecimalMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Work in the smallest place the numbers use, then decide where the point belongs.") {
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
  const commonErrors = out.traps;
  must(commonErrors.length >= 2, `${mirror} needs 2 traps`);
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `${mirror} duplicate traps`);
  for (const e of commonErrors) {
    must(e.value !== out.answer, `${mirror} trap==answer`);
    must(e.feedback.length >= 25, `${mirror} trap feedback short`);
  }
  const decimalAnswer = !Number.isInteger(out.answer);
  return { variant: { gen: out.gen, form: out.form },
    widget: { type: "numeric", prompt: out.prompt, answer: out.answer,
      tolerance: decimalAnswer ? 0.001 : 0, unit: "",
      commonErrors, fallbackFeedback: fallback, successFeedback: `Correct — ${out.answer}.` },
    hints, ev };
}

/* ---------------- manipulatives ---------------- */
function columnDecimal(prompt, op, a, b, traps) {
  const w = structuredClone(COL_T);
  w.prompt = prompt; w.op = op; w.a = a; w.b = b; w.decimals = 2;
  must(op === "add" || op === "subtract", "columnCalc decimals support add/subtract only");
  if (op === "subtract") must(a >= b, "columnCalc(subtract) needs a >= b in the scaled integers");
  const reach = columnCalcReachable(op, a, b);
  const truth = ccTruth(op, a, b);
  must(reach.has(truth), `columnCalc truth ${truth} unreachable`);
  must(reach.size >= 2, `columnCalc ${a} ${op} ${b} has no regrouping decision — engine refuses it`);
  const kept = [];
  for (const [value, feedback] of traps) {
    if (value === truth || !reach.has(value)) continue;          // prove reachable or drop
    if (kept.some((k) => k.value === value)) continue;
    must(feedback.length >= 25, "columnCalc trap feedback short");
    kept.push({ value, feedback });
  }
  must(kept.length >= 1, `columnCalc ${a} ${op} ${b}: no reachable trap survived — refuse dead feedback`);
  w.commonResults = kept;
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
function bars(prompt, categories, target, success, partial) {
  const w = structuredClone(BAR_T);
  w.prompt = prompt; w.categories = categories; w.target = target;
  w.display = "bar"; w.maxVal = Math.max(...target) + 5; w.step = 1; w.histogram = false;
  w.successFeedback = success; w.partialFeedback = partial;
  must(categories.length === target.length, "bars categories/target aligned");
  return w;
}
function hop(prompt, min, max, start, hopSize, hops, success, landings, low, high) {
  const w = structuredClone(HOP_T);
  w.prompt = prompt; w.min = min; w.max = max; w.start = start;
  w.hop = hopSize; w.hops = hops; w.direction = "forward";
  delete w.hopSizeTargets; delete w.hopSizeMin; delete w.hopSizeMax;
  const land = start + hopSize * hops;
  must(land >= min && land <= max, `hop landing ${land} off the line`);
  w.successFeedback = success;
  w.lowFeedback = low; w.highFeedback = high;
  must(low && low.length >= 25 && high && high.length >= 25, "hop needs its own low/high feedback");
  w.commonLandings = landings.map(([value, feedback]) => {
    must(value !== land, `hop trap ${value} equals the landing`);
    must(value >= min && value <= max, `hop trap ${value} off the line`);
    must(feedback.length >= 25, "hop trap feedback short");
    return { value, feedback };
  });
  return w;
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Work in the smallest place the numbers use, then decide where the point belongs for ${tag.replace(/-/g, " ")}.`,
  invariants: [`A decimal is place value continued past the ones: computing in the smallest shared place turns ${tag.replace(/-/g, " ")} into whole-number arithmetic, and the point's position records which place the digits landed in.`],
  misconceptions: [`Right-aligning digits instead of the points, treating a trailing zero as a change in value, or losing count of the decimal places a product carries.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `decimal-fluency-g5:${tag}`, delayed: true,
  counterfactualPrompt: "If the point moved one place left, how many times smaller would the amount become?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  align: ["Line up the points.", "Match place to place.", "Pad with zeros."],
  place: ["Count the places.", "Each factor contributes.", "The point records them."],
  shift: ["Scale both the same.", "The quotient is unchanged.", "Whole divisors are easier."],
  est: ["Round to a friendly number.", "Keep the operation.", "Check the magnitude."],
  model: ["Ten columns, or a hundred cells.", "Count what is shaded.", "Name the place."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "A decimal is place value carried past the ones: a unit square split into ten columns names tenths, and split into a hundred cells names hundredths.",
  "Adding decimals with a model is just combining shaded pieces of the SAME size — which is why the pieces must be named before anything is added.",
  { rep: "concrete", widget: () => bars("Build 0.40 and 0.25 as shaded hundredths: 40 cells and 25 cells.",
      ["0.40", "0.25"], [40, 25],
      "40 and 25 hundredths — 65 cells shaded in all, which is 0.65.",
      "Shade 40 cells for the first amount and 25 for the second, counting in hundredths."),
    predict: P("Adding 0.40 and 0.25, what size are the pieces being combined?", [{ id: "hund", label: "Hundredths, in both" }, { id: "diff", label: "Different sizes" }], "hund",
      "Both are written to hundredths, so every piece is the same size and the counts simply add.") },
  [
    reused("HundredthsCellsNumeric", "g5d1-k1", H.model, ["Count the cells.", "A hundred to the whole."]),
    reused("TenthsModelNumeric", "g5d1-k2", H.model, ["Ten columns, ten tenths.", "Name the place."]),
    reused("AddHundredthsNumeric", "g5d1-k3", H.align, ["Same-size pieces add.", "Count them up."]),
    reused("HundredthsCellsNumeric", "g5d1-ch1", H.model, ["Any amount, same grid.", "Hundredths throughout."]),
  ],
  ["A decimal continues place value.", "Tenths and hundredths name piece sizes.", "Same-size pieces combine by counting."],
  "next: why the points must line up.");

def(2,
  "Lining up the decimal points lines up every place at once: tenths above tenths, hundredths above hundredths.",
  "Right-aligning the digits instead would add 4 tenths to 5 hundredths — combining pieces of different sizes, which means nothing.",
  { rep: "symbolic", widget: () => columnDecimal("Work 3.47 + 2.85 in columns. Tap each column to add it.", "add", 347, 285,
      [[622, "622 hundredths stranded the carry out of the hundredths column — ten hundredths make a tenth and must move left."],
       [532, "Two carries went missing; each stranded carry costs exactly the bundle it was carrying."]]),
    predict: P("Adding 3.4 + 2.25, which digits belong in the same column?", [{ id: "place", label: "Matching places" }, { id: "right", label: "The rightmost digits" }], "place",
      "The point marks where the whole numbers end, so aligning it puts tenths over tenths automatically.") },
  [
    reused("AlignMcq", "g5d2-k1", H.align, ["Points, not right edges.", "Places must match."]),
    reused("AddHundredthsNumeric", "g5d2-k2", H.align, ["Add in hundredths.", "Then place the point."]),
    reused("AlignMcq", "g5d2-k3", H.align, ["Different sizes cannot add.", "Align first."]),
    reused("AddHundredthsNumeric", "g5d2-ch1", H.align, ["Bigger amounts, same rule.", "Column by column."]),
  ],
  ["Line up the decimal points.", "Matching places add.", "The point aligns every column at once."],
  "next: numbers of different lengths.");

def(3,
  "When the addends have different lengths, write in the missing zeros: 3.4 becomes 3.40, which changes how it looks but not what it is worth.",
  "A trailing zero adds no amount. It simply gives the hundredths column a digit to work with.",
  { rep: "symbolic", widget: () => columnDecimal("Work 5.68 + 1.35 in columns after padding.", "add", 568, 135,
      [[693, "693 hundredths dropped the carry the tenths column produced — a whole 0.10 lost."],
       [603, "Both carries were stranded, so the total is short by the bundles they were carrying."]]),
    predict: P("Is 3.4 the same amount as 3.40?", [{ id: "same", label: "Yes — identical" }, { id: "bigger", label: "No — 3.40 is bigger" }], "same",
      "The zero fills a column without adding hundredths, so the value is untouched.") },
  [
    reused("PaddingMcq", "g5d3-k1", H.align, ["Zeros fill, not change.", "Value untouched."]),
    reused("AddHundredthsNumeric", "g5d3-k2", H.align, ["Pad, then add.", "Places aligned."]),
    reused("FractionToDecimalNumeric", "g5d3-k3", H.model, ["Tenths as decimals.", "One place after the point."]),
    reused("AddHundredthsNumeric", "g5d3-ch1", H.align, ["Ragged lengths, padded.", "Then add."]),
  ],
  ["Pad with trailing zeros.", "A trailing zero changes nothing.", "It fills the column for working."],
  "next: taking decimals apart.");

def(4,
  "Subtracting decimals runs the same columns backward, and the same alignment rule governs it: points lined up, places matched.",
  "Trading works exactly as it does with whole numbers — one tenth becomes ten hundredths when a column comes up short.",
  { rep: "symbolic", widget: () => columnDecimal("Work 7.42 − 3.18 in columns. Tap a top digit to trade when a column is short.", "subtract", 742, 318,
      [[436, "436 flipped the short column, computing 8 − 2 because the top looked too small. Trade instead of flipping."]]),
    predict: P("In 7.42 − 3.18, the hundredths are 2 − 8. What is the legal move?", [{ id: "trade", label: "Trade a tenth for ten hundredths" }, { id: "flip", label: "Compute 8 − 2" }], "trade",
      "Flipping answers a different question. Breaking one tenth turns 2 into 12, and 12 − 8 = 4.") },
  [
    reused("SubHundredthsNumeric", "g5d4-k1", H.align, ["Subtract in hundredths.", "Then place the point."]),
    reused("SubHundredthsNumeric", "g5d4-k2", H.align, ["Short column? Trade.", "Never flip."]),
    reused("AlignMcq", "g5d4-k3", H.align, ["Alignment governs both.", "Places must match."]),
    reused("SubHundredthsNumeric", "g5d4-ch1", H.align, ["Bigger differences, same rule.", "Column by column."]),
  ],
  ["Subtraction uses the same alignment.", "Trade a tenth for ten hundredths.", "Never flip a short column."],
  "next: subtracting from a shorter number.");

def(5,
  "Padding matters most in subtraction: 5.2 − 1.47 has nothing in the hundredths column until 5.2 is written as 5.20.",
  "The zero creates a place to borrow into. Without it the subtraction has no column to work in at all.",
  { rep: "symbolic", widget: () => columnDecimal("Work 5.20 − 1.47 in columns after padding.", "subtract", 520, 147,
      [[433, "433 flipped the short columns instead of trading — 7 − 0 and 4 − 2 are not legal moves when the top is smaller."],
       [387, "A borrow reached the hundredths but the tenths column was never charged for passing it along."]]),
    predict: P("Subtracting 5.2 − 1.47, what does writing 5.20 accomplish?", [{ id: "column", label: "Gives the hundredths a digit" }, { id: "bigger", label: "Makes 5.2 larger" }], "column",
      "The value is unchanged; the zero simply fills the column so the borrow has somewhere to land.") },
  [
    reused("PaddingMcq", "g5d5-k1", H.align, ["Pad before subtracting.", "The zero fills a place."]),
    reused("SubHundredthsNumeric", "g5d5-k2", H.align, ["Then trade as usual.", "Tenths to hundredths."]),
    reused("SubHundredthsNumeric", "g5d5-k3", H.align, ["Borrow chains work the same.", "Pay for each trade."]),
    reused("PaddingMcq", "g5d5-ch1", H.align, ["Value never changes.", "Only the writing does."]),
  ],
  ["Pad before subtracting.", "The zero creates a place to borrow into.", "The value is unchanged."],
  "next: multiplying by a whole number.");

def(6,
  "Multiplying a decimal by a whole number is repeated addition of the same amount, so working in hundredths turns it into whole-number multiplication.",
  "Compute 0.35 × 4 as 35 × 4 = 140 hundredths, then place the point: 1.40. The digits come from the multiplication; the point comes from the places.",
  { rep: "diagram", widget: () => estimate("0.35 × 4 — slide to estimate the product before computing.", 0.1, 20, 1.4, "units",
      "Too low — four groups of about a third of a unit already pass one whole.",
      "Too high — 0.35 is close to a third, so four of them stay under two.",
      "About 1.4 — from 35 × 4 = 140 hundredths, which places as 1.40."),
    predict: P("Is 0.35 × 4 more or less than 1?", [{ id: "more", label: "More" }, { id: "less", label: "Less" }], "more",
      "Three groups of 0.35 already reach 1.05, so four of them pass one whole comfortably.") },
  [
    reused("MultHundredthsNumeric", "g5d6-k1", H.place, ["Multiply in hundredths.", "Then place the point."]),
    reused("MultHundredthsNumeric", "g5d6-k2", H.place, ["Repeated addition scales.", "The count multiplies."]),
    reused("EstimateProductMcq", "g5d6-k3", H.est, ["Round the decimal.", "Keep multiplying."]),
    reused("MultHundredthsNumeric", "g5d6-ch1", H.place, ["Bigger counts, same method.", "Hundredths first."]),
  ],
  ["Multiply in the smallest place.", "Then place the point.", "Digits from multiplying, point from places."],
  "next: estimating that product.");

def(7,
  "Estimating a decimal product rounds to a friendly whole number: 4.9 × 6 is about 5 × 6 = 30, so the answer sits just under 30.",
  "This single step catches the commonest decimal error there is — a correct set of digits with the point in the wrong place.",
  { rep: "diagram", widget: () => estimate("4.9 × 6 — slide to estimate the product.", 1, 200, 29, "units",
      "Too low — six groups of nearly five already approach thirty.",
      "Too high — 4.9 is just under five, so six of them stay just under thirty.",
      "About 29 — the exact product is 29.4, and 5 × 6 = 30 predicted it."),
    predict: P("Estimating 4.9 × 6, which rounding helps?", [{ id: "five", label: "5 × 6" }, { id: "four", label: "4 × 6" }], "five",
      "4.9 is a whisker under 5, so rounding to 5 lands within half a unit of the exact answer.") },
  [
    reused("EstimateProductMcq", "g5d7-k1", H.est, ["Round to a friendly whole.", "Keep the operation."]),
    reused("MultHundredthsNumeric", "g5d7-k2", H.est, ["The exact answer decides.", "The estimate guards it."]),
    reused("CheckDecimalMcq", "g5d7-k3", H.est, ["Wrong place, right digits.", "Estimates catch it."]),
    reused("MultHundredthsNumeric", "g5d7-ch1", H.place, ["Compute, then compare.", "Magnitude first."]),
  ],
  ["Round to a friendly whole number.", "The estimate guards the point.", "Right digits can still be wrong."],
  "next: two decimals at once.");

def(8,
  "Multiplying two decimals multiplies the digits and ADDS the decimal places: tenths times tenths gives hundredths.",
  "0.4 × 0.3 is 4 × 3 = 12 in the smallest place, and since each factor carried one place, the product carries two: 0.12.",
  { rep: "diagram", widget: () => estimate("0.4 × 0.3 — slide to estimate the product.", 0.01, 2, 0.12, "units",
      "Too low — twelve hundredths is more than a hundredth or two.",
      "Too high — multiplying two numbers below one gives a result smaller than either of them.",
      "0.12 — from 4 × 3 = 12, with two decimal places because each factor carried one."),
    predict: P("Is 0.4 × 0.3 bigger or smaller than 0.4?", [{ id: "smaller", label: "Smaller" }, { id: "bigger", label: "Bigger" }], "smaller",
      "Taking three tenths OF something makes it smaller — multiplying by less than one always shrinks.") },
  [
    reused("PlacePointMcq", "g5d8-k1", H.place, ["Add the places.", "One plus one is two."]),
    reused("MultHundredthsNumeric", "g5d8-k2", H.place, ["Multiply the digits.", "Then count places."]),
    reused("PlacePointMcq", "g5d8-k3", H.place, ["Below one shrinks.", "Check the magnitude."]),
    reused("EstimateProductMcq", "g5d8-ch1", H.est, ["Estimate guards the point.", "Round and compare."]),
  ],
  ["Multiply the digits.", "Add the decimal places.", "Below one, the product shrinks."],
  "next: placing the point deliberately.");

def(9,
  "Where the point goes is decided by counting, not guessing: the product carries as many decimal places as the two factors carry together.",
  "The digits and the point are two separate results. Multiplication gives the digits; place value gives the point.",
  { rep: "diagram", widget: () => estimate("0.25 × 3 gives the digits 75. Slide to where the amount actually sits.", 0.01, 8, 0.75, "units",
      "Too low — three quarters of a unit is nearly a whole one.",
      "Too high — three groups of a quarter cannot reach a whole unit.",
      "0.75 — 25 × 3 = 75 hundredths, and two decimal places place it just under one."),
    predict: P("0.25 × 3 gives digits 75. How many decimal places?", [{ id: "two", label: "Two — 0.75" }, { id: "none", label: "None — 75" }], "two",
      "0.25 carries two places and 3 carries none, so the product carries two.") },
  [
    reused("PlacePointMcq", "g5d9-k1", H.place, ["Count both factors' places.", "Add them."]),
    reused("MultHundredthsNumeric", "g5d9-k2", H.place, ["Digits first.", "Point second."]),
    reused("CheckDecimalMcq", "g5d9-k3", H.est, ["A misplaced point is common.", "Estimate to catch it."]),
    reused("MultHundredthsNumeric", "g5d9-ch1", H.place, ["Same digits, different point.", "Places decide."]),
  ],
  ["Count the places in both factors.", "Their sum is the product's places.", "Digits and point are separate results."],
  "next: sharing a decimal.");

def(10,
  "Dividing a decimal by a whole number shares the amount into equal parts, and working in hundredths again turns it into whole-number division.",
  "1.44 ÷ 4 is 144 ÷ 4 = 36 hundredths, which places as 0.36. The point sits where the place value puts it.",
  { rep: "diagram", widget: () => estimate("1.44 ÷ 4 — slide to estimate the quotient.", 0.01, 4, 0.36, "units",
      "Too low — a quarter of about one and a half is more than a few hundredths.",
      "Too high — sharing 1.44 four ways cannot leave more than half a unit in each part.",
      "0.36 — from 144 ÷ 4 = 36 hundredths."),
    predict: P("Sharing 1.44 into 4 parts, is each part more or less than 1?", [{ id: "less", label: "Less" }, { id: "more", label: "More" }], "less",
      "Four equal parts of one and a bit must each be well under a whole unit.") },
  [
    reused("DivHundredthsNumeric", "g5d10-k1", H.place, ["Divide in hundredths.", "Then place the point."]),
    reused("DivHundredthsNumeric", "g5d10-k2", H.place, ["Equal parts share.", "Division finds one."]),
    reused("CheckDecimalMcq", "g5d10-k3", H.est, ["Check the magnitude.", "Estimate first."]),
    reused("DivHundredthsNumeric", "g5d10-ch1", H.place, ["Bigger totals, same method.", "Smallest place first."]),
  ],
  ["Divide in the smallest place.", "Then place the point.", "Sharing shrinks each part."],
  "next: dividing BY a decimal.");

def(11,
  "Dividing by a decimal is easier after scaling: multiply both numbers by the same power of ten and the quotient does not move.",
  "7.2 ÷ 0.9 becomes 72 ÷ 9 = 8. Scaling both sides is legal precisely because it leaves the answer alone.",
  { rep: "diagram", widget: () => hop("72 ÷ 9 — hop by nines to find how many fit.", 0, 90, 0, 9, 8,
      "72 after eight hops — so 7.2 ÷ 0.9 is 8, the same answer at a friendlier scale.",
      [[63, "Seven hops reach 63; one more nine still fits inside 72."],
       [81, "Nine hops overshoot 72 — eight is the exact count."]],
      "Short of the landing — each hop covers 9, so eight of them reach 72.",
      "Past the landing — eight hops of 9 stop exactly on 72."),
    predict: P("Does scaling 7.2 ÷ 0.9 to 72 ÷ 9 change the answer?", [{ id: "no", label: "No — unchanged" }, { id: "yes", label: "Yes — ten times bigger" }], "no",
      "Both numbers grew by the same factor, so the ratio between them is exactly what it was.") },
  [
    reused("ShiftDivideMcq", "g5d11-k1", H.shift, ["Scale both the same.", "The quotient holds."]),
    reused("DivHundredthsNumeric", "g5d11-k2", H.shift, ["Whole divisors are easier.", "Then divide."]),
    reused("ShiftDivideMcq", "g5d11-k3", H.shift, ["Not rounding — scaling.", "Exactness preserved."]),
    reused("DivHundredthsNumeric", "g5d11-ch1", H.shift, ["Bigger scalings, same rule.", "Both sides together."]),
  ],
  ["Scale both numbers alike.", "The quotient is unchanged.", "A whole divisor is easier to work with."],
  "next: how far to move the point.");

def(12,
  "How far to move the point is set by the DIVISOR: shift it just far enough to make the divisor whole, then shift the dividend the same way.",
  "0.9 needs one shift; 0.07 needs two. Shifting the dividend by a different amount would change the answer, which is the one thing scaling must never do.",
  // A single 72-wide "hop" does not model a place-value shift at all; the quotient's MAGNITUDE
  // is what the shift decides, so estimating it is the honest manipulative here.
  { rep: "diagram", widget: () => estimate("3.5 ÷ 0.07 — slide to the quotient after shifting both two places.", 1, 400, 50, "units",
      "Too low — sevenths of a hundredth are tiny, so a great many of them fit inside 3.5.",
      "Too high — 350 ÷ 7 is fifty, not the hundreds.",
      "50 — two shifts turn 3.5 ÷ 0.07 into 350 ÷ 7, and the quotient is unchanged at 50."),
    predict: P("Dividing by 0.07, how many places must the point move?", [{ id: "two", label: "Two" }, { id: "one", label: "One" }], "two",
      "0.07 needs two shifts to become the whole number 7, and the dividend must move two as well.") },
  [
    reused("ShiftDivideMcq", "g5d12-k1", H.shift, ["The divisor sets the shift.", "Both move together."]),
    reused("DivHundredthsNumeric", "g5d12-k2", H.shift, ["Then divide as usual.", "Whole numbers."]),
    reused("PlacePointMcq", "g5d12-k3", H.place, ["Counting places, again.", "Deliberate, not guessed."]),
    reused("DivHundredthsNumeric", "g5d12-ch1", H.shift, ["Two shifts, same rule.", "Equal treatment."]),
  ],
  ["The divisor sets the shift.", "Move both numbers equally.", "Unequal shifts change the answer."],
  "next: checking a decimal answer.");

def(13,
  "Checking a decimal answer means asking whether its SIZE is possible before asking whether its digits are right.",
  "3.6 × 4 with the answer 1.44 has perfectly good digits in an impossible place — four groups of nearly four cannot land near one.",
  { rep: "diagram", widget: () => estimate("3.6 × 4 — slide to the estimate that tests a claimed answer of 1.44.", 0.1, 100, 14.4, "units",
      "Too low — four groups of nearly four reach the teens, not the ones.",
      "Too high — 3.6 is under four, so four of them stay under sixteen.",
      "About 14.4 — so a claimed 1.44 is ten times too small; the digits were right, the point was not."),
    predict: P("3.6 × 4 = 1.44 — plausible?", [{ id: "no", label: "No — ten times too small" }, { id: "yes", label: "Yes" }], "no",
      "Four groups of about 3.6 land near 14, so 1.44 has the point one place out.") },
  [
    reused("CheckDecimalMcq", "g5d13-k1", H.est, ["Size before digits.", "Estimate first."]),
    reused("MultHundredthsNumeric", "g5d13-k2", H.place, ["Recompute carefully.", "Place the point."]),
    reused("EstimateProductMcq", "g5d13-k3", H.est, ["Round, then compare.", "Magnitude check."]),
    reused("MultiStepHundredthsNumeric", "g5d13-ch1", H.est, ["Two steps, then check.", "Both must hold."]),
  ],
  ["Check the size first.", "Right digits can sit in the wrong place.", "Estimating catches misplaced points."],
  "next: money.");

def(14,
  "Money is decimals with the places named: a dime is a tenth of a dollar and a penny is a hundredth, which is why prices carry exactly two places.",
  "Every rule so far applies unchanged — align the points, compute in cents, and place the point two from the right.",
  { rep: "symbolic", widget: () => columnDecimal("Work 4.75 + 2.60 dollars in columns.", "add", 475, 260,
      [[635, "635 cents dropped the carry out of the dimes column — a whole dollar went missing."]]),
    predict: P("Why do prices always show two decimal places?", [{ id: "cents", label: "Because a penny is a hundredth" }, { id: "style", label: "Just convention" }], "cents",
      "The smallest coin is a hundredth of a dollar, so two places name every amount exactly.") },
  [
    reused("MoneyDecimalNumeric", "g5d14-k1", H.model, ["Dimes are tenths.", "Pennies are hundredths."]),
    reused("AddHundredthsNumeric", "g5d14-k2", H.align, ["Add in cents.", "Then place the point."]),
    reused("MoneyDecimalNumeric", "g5d14-k3", H.model, ["Coin values name places.", "Two places for money."]),
    reused("SubHundredthsNumeric", "g5d14-ch1", H.align, ["Change is subtraction.", "Same alignment."]),
  ],
  ["Money is decimals with named places.", "A penny is one hundredth.", "Compute in cents, then place the point."],
  "next: measurement.");

def(15,
  "Measurement works the same way: a centimeter is a hundredth of a meter, so 74 cm is 0.74 m without any calculation beyond naming the place.",
  "Converting to a bigger unit shrinks the number, and the decimal point is what records how far it shrank.",
  { rep: "diagram", widget: () => hop("How many centimeters in 3 meters? Hop one meter at a time.", 0, 500, 0, 100, 3,
      "300 — three hops of a hundred centimeters, which is why 3 m and 300 cm are the same length.",
      [[200, "Two hops reach 200 cm; the length is three meters."],
       [400, "Four hops overshoot — three meters is 300 centimeters."]],
      "Short of the landing — each meter is 100 centimeters, so three reach 300.",
      "Past the landing — three meters stops exactly at 300 centimeters."),
    predict: P("74 cm in meters — bigger or smaller number?", [{ id: "smaller", label: "Smaller — 0.74" }, { id: "bigger", label: "Bigger" }], "smaller",
      "Meters are larger units, so fewer of them cover the same ribbon and the number shrinks.") },
  [
    reused("MeasureDecimalNumeric", "g5d15-k1", H.model, ["A centimeter is a hundredth.", "Name the place."]),
    reused("MeasureDecimalNumeric", "g5d15-k2", H.model, ["Bigger unit, smaller number.", "The point records it."]),
    reused("AddHundredthsNumeric", "g5d15-k3", H.align, ["Add in centimeters.", "Then convert."]),
    reused("MeasureDecimalNumeric", "g5d15-ch1", H.model, ["Any length, same naming.", "Hundredths of a meter."]),
  ],
  ["A centimeter is a hundredth of a meter.", "Converting up shrinks the number.", "The point records the shrink."],
  "next: putting it together.");

def(16,
  "Multi-step decimal problems chain everything: compute in the smallest place, keep the digits honest, and place the point once at the end.",
  "Estimate before and check after. With decimals the estimate is not a luxury — it is what proves the point landed where it belongs.",
  { rep: "diagram", widget: () => estimate("4 items at 1.25 each, then 0.80 off — slide to estimate the total.", 0.1, 40, 4.2, "units",
      "Too low — four items at over a dollar each already pass four dollars.",
      "Too high — four times 1.25 is 5.00, and the discount only reduces it.",
      "About 4.20 — 500 hundredths built, 80 removed, placing as 4.20."),
    predict: P("4 at 1.25 then 0.80 off — total?", [{ id: "420", label: "4.20" }, { id: "580", label: "5.80" }], "420",
      "Five dollars built, then eighty cents removed — the discount subtracts rather than adds.") },
  [
    reused("MultiStepHundredthsNumeric", "g5d16-k1", H.place, ["Build, then adjust.", "In hundredths."]),
    reused("MultHundredthsNumeric", "g5d16-k2", H.place, ["Equal prices multiply.", "Count the items."]),
    reused("CheckDecimalMcq", "g5d16-k3", H.est, ["Estimate, then verify.", "Check the size."]),
    reused("MultiStepHundredthsNumeric", "g5d16-ch1", H.place, ["Longer chains, same order.", "Point last."]),
  ],
  ["Compute in the smallest place.", "Place the point once, at the end.", "Estimate before, check after."],
  "course complete: modelled, aligned, multiplied, divided, shifted, and checked.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 16, `16 lessons defined, got ${L.length}`);
const chapterTitles = ["Models, Alignment, and Adding", "Multiplying and Placing the Point", "Dividing, Checking, and Applying"];
const perChapter = [6, 5, 5];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 6 ? 1 : n <= 11 ? 2 : 3);
const outDir = join(root, "content/courses/decimal-fluency-g5");
mkdirSync(join(outDir, "lessons"), { recursive: true });

const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);
const MANIP2 = new Set(["numberLineHop", "barBuilder", "estimateSlider", "numberLinePlace", "areaModel", "columnCalc", "fractionBar", "tapDiagram"]);

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g5d-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "symbolic") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "decimal-fluency-g5",
    chapterId: chapters[ch - 1].id, minutes: 7, readingProfile: "standard",
    steps: [
      { id: "c1", kind: "concept", figure: "count-on-hops", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: "Try it.", conceptTag: tag, widget: d.i1.widget(), predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      stepFromCheck("k1", d.checks[0]),
      { id: "c2", kind: "concept", figure: "count-on-hops", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: "Try it again.", conceptTag: tag, widget: d.i1.widget(), cml: cml(tag, "symbolic") },
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
      const f = s.variant?.form;
      const plus = w.prompt.match(/(\d+)\s*\+\s*(\d+)/);
      const minus = w.prompt.match(/(\d+)\s*[−-]\s*(\d+)/);
      if (f === "Pv1000AddTradeNumeric") {
        must(plus && +plus[1] + +plus[2] === w.answer,
          `${id}/${s.id}: the FIRST "+" pair must be the graded one — decimal notation before it would hijack the route`);
      }
      if (f === "Pv1000SubtractTradeNumeric") {
        must(!plus, `${id}/${s.id}: a "+" anywhere hijacks arithmetic()'s first branch`);
        must(minus && +minus[1] - +minus[2] === w.answer, `${id}/${s.id}: first − must give the answer`);
      }
      const n = (w.prompt.match(/\d+/g) || []).map(Number);
      if (f === "mbMultiplyTensNumeric") must(n[0] * n[1] === w.answer, `${id}/${s.id} n0*n1`);
      if (f === "mbDivideBigNumeric") must(n[0] / n[1] === w.answer, `${id}/${s.id} n0/n1`);
      if (f === "mbMultiStepNumeric") must(n[0] * n[1] - n[2] === w.answer, `${id}/${s.id} n0*n1−n2`);
      if (!Number.isInteger(w.answer)) must(w.tolerance > 0, `${id}/${s.id}: a decimal answer needs a tolerance`);
    }
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 4, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
    }
    if (w.type === "columnCalc") {
      const reach = columnCalcReachable(w.op, w.a, w.b);
      must(reach.size >= 2, `${id}/${s.id} columnCalc has no regrouping decision`);
      for (const t of w.commonResults) must(reach.has(t.value), `${id}/${s.id} columnCalc trap ${t.value} unreachable`);
      must(w.op !== "multiply", `${id}/${s.id} columnCalc decimals are add/subtract only`);
    }
    if (w.type === "numberLineHop") {
      const land = w.start + w.hop * w.hops;
      must(land >= w.min && land <= w.max, `${id}/${s.id} hop landing off the line`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "decimal-fluency-g5", slug: "decimal-fluency-g5", title: spec.title,
  tagline: "Compute in the smallest place, then put the point where place value says it belongs.",
  category: "Math", gradeLevel: 5, chapters,
}, null, 2) + "\n");
console.log(`built 16 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
