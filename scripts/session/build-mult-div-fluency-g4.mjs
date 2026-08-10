#!/usr/bin/env node
// S196 — Batch E course 1/5: mult-div-fluency-g4 (4.NBT.B.5, 4.NBT.B.6). Zero new generator code.
//
// Family: g4-multiply, backed by the COMPUTATIONAL solver src/lib/g4Independent.cjs. Every route
// below was probed against the shipped solver before authoring:
//   mbMultiplyTensNumeric / mbAreaModel1DigitNumeric / mbAreaModel2DigitNumeric -> ns[0] * ns[1]
//   mbDivideBigNumeric                                                          -> ns[0] / ns[1]
//   mbRemaindersNumeric        "divide A by B, quotient Q, remainder?"           -> ns[0] − ns[1]*ns[2]
//   mbInterpretRemaindersNumeric / Mcq                                          -> ceil(ns[0] / ns[1])
//   mbMultiStepNumeric                                                          -> ns[0]*ns[1] − ns[2]
//   mbAreaModel1DigitMcq  -> exact `${floor(a/10)*10}×${b} and ${a%10}×${b}`
//   mbAreaModel2DigitMcq  -> exact `${at}×${bt}, ${at}×${bo}, ${ao}×${bt}, ${ao}×${bo}`
//   mbRemaindersMcq       -> the option that is a whole number in [0, divisor)
//   mbMultiplyTensMcq     -> one fixed label (reproduced verbatim below)
// ALL of these read ns POSITIONALLY, so the first numbers in a prompt must be the operands —
// asserted per step. The shipped g4 course `multiply-bigger` uses only manip-1 widgets
// (dragBucket/matchPairs/dragOrder/slider); this course uses areaModel and columnCalc(multiply),
// both manip 2, so partial products are BUILT rather than picked.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "mult-div-fluency-g4");
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
const AREA_T = corpusTemplate("areaModel", "measurement-data");
const EST_T = corpusTemplate("estimateSlider", "multiplication-division");
const HOP_T = corpusTemplate("numberLineHop", "add-subtract-1000-g2");

/* ---- ported from schema.ts columnCalcReachable — NOTE the multiply branch shares the add
   recursion with base = A[i] * b, which is why a multiply trap must be enumerated, not guessed. */
const ccDigits = (n) => String(n).split("").reverse().map(Number);
function columnCalcReachable(op, a, b) {
  const out = new Set();
  const join2 = (acc) => Number([...acc].reverse().join(""));
  if (op === "add" || op === "multiply") {
    const A = ccDigits(a);
    const B = op === "add" ? ccDigits(b) : [];
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

const REG_MB = new Set(["mbTimesAsManyMcq","mbTimesAsManyNumeric","mbComparisonEquationsMcq",
  "mbComparisonEquationsNumeric","mbAdditiveVsMultiplicativeMcq","mbAdditiveVsMultiplicativeNumeric",
  "mbFactorsMcq","mbFactorsNumeric","mbMultiplesMcq","mbPrimeCompositeMcq","mbPrimeCompositeNumeric",
  "mbMultiplyTensMcq","mbMultiplyTensNumeric","mbAreaModel1DigitMcq","mbAreaModel1DigitNumeric",
  "mbAreaModel2DigitMcq","mbAreaModel2DigitNumeric","mbRemaindersMcq","mbRemaindersNumeric",
  "mbDivideBigNumeric","mbInterpretRemaindersMcq","mbInterpretRemaindersNumeric","mbPatternsMcq",
  "mbPatternsNumeric","mbMultiStepNumeric"]);
const REG = { "g4-multiply": REG_MB };
const TENS_REASON = "Because the factor is built from tens, so the basic fact is scaled by 10.";

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

function traps2(answer, cands) {
  const out = [];
  for (const [v, fb] of cands) {
    if (v !== answer && v >= 0 && Number.isInteger(v) && !out.some((o) => o[0] === v)) out.push([v, fb]);
    if (out.length === 2) break;
  }
  for (let d = 7; out.length < 2; d++) {
    const v = answer + d;
    if (!out.some((o) => o[0] === v)) {
      out.push([v, "That product does not come from these factors — rebuild it one place at a time."]);
    }
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

/* ---------------- graded mirrors ---------------- */
function TensProductNumeric(r) {
  const a = pick(r, 2, 9) * 10, b = choose(r, [10, 20, 30, 40, 50, 100]);
  const ans = a * b;
  return { gen: "g4-multiply", form: "mbMultiplyTensNumeric",
    prompt: `Compute ${a} × ${b}. What is the product?`, answer: ans,
    traps: traps2(ans, [
      [ans / 10, `That dropped a zero. Each factor's zeros survive into the product — count them all.`],
      [ans * 10, `That is one zero too many; multiply the basic fact first, then attach only the zeros the factors carry.`]]) };
}
function TensReasonMcq() {
  return { gen: "g4-multiply", form: "mbMultiplyTensMcq", kind: "solverMcq",
    prompt: `Why does knowing 3 × 4 = 12 immediately give you 30 × 4 = 120?`,
    labels: [TENS_REASON,
      "Because a zero is always added to any product.",
      "Because multiplication and addition give the same answer here.",
      "Because 30 and 3 are the same number."],
    correct: TENS_REASON,
    feedback: {
      [TENS_REASON]: `Correct — 30 is 3 tens, so the whole product is the basic fact taken ten times over.`,
      "Because a zero is always added to any product.": `Zeros are not decoration; they appear only when a factor actually carries tens.`,
      "Because multiplication and addition give the same answer here.": `3 + 4 is 7, nowhere near 12 — the operations are genuinely different.`,
      "Because 30 and 3 are the same number.": `They differ by a factor of ten, and that factor is exactly what scales the product.`,
    } };
}
function Area1Numeric(r) {
  const a = pick(r, 13, 48), b = pick(r, 3, 8);
  const ans = a * b;
  const t = Math.floor(a / 10) * 10, o = a % 10;
  must(t + o === a, "1-digit split must reconstruct the factor");
  return { gen: "g4-multiply", form: "mbAreaModel1DigitNumeric",
    prompt: `Use an area model for ${a} × ${b}. What is the product?`, answer: ans,
    traps: traps2(ans, [
      [t * b, `That is only the tens piece (${t} × ${b}). The ones piece ${o} × ${b} still has to be added on.`],
      [o * b, `That is only the ones piece. The ${t} in ${a} contributes ${t} × ${b} as well.`]]) };
}
function Area1SplitMcq(r) {
  const a = pick(r, 13, 48), b = pick(r, 3, 8);
  const t = Math.floor(a / 10) * 10, o = a % 10;
  const correct = `${t}×${b} and ${o}×${b}`;
  return { gen: "g4-multiply", form: "mbAreaModel1DigitMcq", kind: "solverMcq",
    prompt: `Which two partial products build the area model for ${a} × ${b}?`,
    labels: [correct, `${a}×${b} and ${t}×${o}`, `${t}×${o} and ${b}×${b}`, `${a}×${t} and ${a}×${o}`],
    correct,
    feedback: {
      [correct]: `Correct — ${a} splits into ${t} and ${o}, and each part multiplies the full ${b}.`,
      [`${a}×${b} and ${t}×${o}`]: `The first piece is the whole problem, not a part of it — an area model splits ONE factor.`,
      [`${t}×${o} and ${b}×${b}`]: `Those multiply the split pieces by each other, which is not what the rectangle's sides are.`,
      [`${a}×${t} and ${a}×${o}`]: `That splits the wrong factor and then multiplies by the whole ${a} twice over.`,
    } };
}
function Area2Numeric(r) {
  const a = pick(r, 12, 39), b = pick(r, 12, 29);
  const ans = a * b;
  return { gen: "g4-multiply", form: "mbAreaModel2DigitNumeric",
    prompt: `Use an area model for ${a} × ${b}. What is the product?`, answer: ans,
    traps: traps2(ans, [
      [Math.floor(a / 10) * 10 * (Math.floor(b / 10) * 10) + (a % 10) * (b % 10),
        `That added only the corner pieces — the two middle rectangles were left out of the total.`],
      [Math.floor(a / 10) * 10 * b, `That is only the tens row of the model; the ones row still has to join it.`]]) };
}
function Area2SplitMcq(r) {
  const a = pick(r, 12, 39), b = pick(r, 12, 29);
  const at = Math.floor(a / 10) * 10, ao = a % 10, bt = Math.floor(b / 10) * 10, bo = b % 10;
  const correct = `${at}×${bt}, ${at}×${bo}, ${ao}×${bt}, ${ao}×${bo}`;
  return { gen: "g4-multiply", form: "mbAreaModel2DigitMcq", kind: "solverMcq",
    prompt: `Which four partial products build the area model for ${a} × ${b}?`,
    labels: [correct, `${at}×${bt} and ${ao}×${bo}`, `${a}×${bt} and ${a}×${bo}`,
      `${at}×${ao}, ${bt}×${bo}, ${at}×${bt}, ${ao}×${bo}`],
    correct,
    feedback: {
      [correct]: `Correct — both factors split, so the rectangle has four regions and every pairing appears once.`,
      [`${at}×${bt} and ${ao}×${bo}`]: `Only the two corner regions. The ${at}×${bo} and ${ao}×${bt} rectangles are real area too.`,
      [`${a}×${bt} and ${a}×${bo}`]: `That splits only one factor — a valid method, but not the FOUR-region model this asks for.`,
      [`${at}×${ao}, ${bt}×${bo}, ${at}×${bt}, ${ao}×${bo}`]: `Two of those multiply a factor's own pieces together, which no side of the rectangle measures.`,
    } };
}
function DivideBigNumeric(r) {
  const b = pick(r, 3, 8), q = pick(r, 112, 987);
  const a = b * q;
  return { gen: "g4-multiply", form: "mbDivideBigNumeric",
    prompt: `Divide ${a} ÷ ${b}. What is the quotient?`, answer: q,
    traps: traps2(q, [
      [q * 10, `That slid the quotient one place too far left — check which place the first digit belongs in.`],
      [Math.floor(q / 10), `A place was dropped from the quotient; every place of ${a} has to be divided in turn.`]]) };
}
function RemainderNumeric(r) {
  const b = pick(r, 3, 9), q = pick(r, 4, 40), rem = pick(r, 1, b - 1);
  const a = b * q + rem;
  must(rem > 0 && rem < b, "remainder must be a genuine leftover under the divisor");
  return { gen: "g4-multiply", form: "mbRemaindersNumeric",
    prompt: `Divide ${a} by ${b}. The quotient is ${q}. What is the remainder?`, answer: rem,
    traps: traps2(rem, [
      [b, `A remainder can never reach the divisor — ${b} more would make one more whole group.`],
      [q, `${q} is how many full groups formed; the remainder is what is left over after them.`]]) };
}
function InterpretRemainderNumeric(r) {
  const b = pick(r, 4, 9), q = pick(r, 3, 20), rem = pick(r, 1, b - 1);
  const a = b * q + rem;
  const ans = Math.ceil(a / b);
  must(ans === q + 1, "interpret-remainder answer must round the partial group UP");
  return { gen: "g4-multiply", form: "mbInterpretRemaindersNumeric",
    prompt: `${a} hikers ride vans holding ${b} each. How many vans are needed?`, answer: ans,
    traps: traps2(ans, [
      [q, `${q} full vans leave ${rem} hikers standing — this question needs everyone carried.`],
      [rem, `${rem} is the leftover group of hikers, not the number of vans.`]]) };
}
function MultiStepNumeric(r) {
  const a = pick(r, 12, 40), b = pick(r, 4, 9);
  const c = pick(r, 10, a * b - 10);
  const ans = a * b - c;
  must(ans > 0, "multi-step result must stay positive");
  return { gen: "g4-multiply", form: "mbMultiStepNumeric",
    prompt: `${a} crates hold ${b} apples each, then ${c} apples are eaten. How many remain?`, answer: ans,
    traps: traps2(ans, [
      [a * b, `That reported the total built; the ${c} eaten apples never came out of it.`],
      [a * b + c, `Eating removes apples, so the second step subtracts rather than adds.`]]) };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function EstimateProductMcq() {
  return { kind: "mcq",
    prompt: `Before computing 38 × 52, which estimate is most useful?`,
    options: [
      { label: "40 × 50 = 2,000", correct: true, feedback: `Correct — round each factor to a friendly one and the product's neighbourhood appears at once.` },
      { label: "38 × 52 = about 200", correct: false, feedback: `Two numbers near 40 and 50 multiply into the thousands, not the hundreds — that is off by a factor of ten.` },
      { label: "38 + 52 = about 90", correct: false, feedback: `Estimating must keep the operation; a product of these factors is far larger than their sum.` },
      { label: "You cannot estimate a two-digit product", correct: false, feedback: `You can, and it is the cheapest guard there is against a misplaced digit.` },
    ] };
}
function CheckProductMcq() {
  return { kind: "mcq",
    prompt: `A student computes 47 × 6 = 2,822. The estimate says about 50 × 6 = 300. What follows?`,
    options: [
      { label: "2,822 is wrong — it is about ten times too big", correct: true, feedback: `Correct — the estimate places the answer near 300, so an answer in the thousands means a place-value slip.` },
      { label: "2,822 is fine — estimates are never exact", correct: false, feedback: `Estimates are not exact, but they are close. Being ten times out is a different kind of error entirely.` },
      { label: "The estimate is wrong because it is not 2,822", correct: false, feedback: `Rounding deliberately changes the numbers; it is expected to differ a little, not by a factor of ten.` },
      { label: "Nothing can be concluded", correct: false, feedback: `A great deal can: an answer an order of magnitude from the estimate is almost always a misplaced digit.` },
    ] };
}
function PlaceValueDivMcq() {
  return { kind: "mcq",
    prompt: `Dividing 936 ÷ 3, why do you start with the hundreds?`,
    options: [
      { label: "Because the largest place decides where the quotient begins", correct: true, feedback: `Correct — 9 hundreds split into 3 gives 3 hundreds, so the quotient starts in the hundreds place.` },
      { label: "Because division always starts on the right", correct: false, feedback: `That is addition and subtraction. Division works from the LARGEST place downward.` },
      { label: "Because 9 is the biggest digit", correct: false, feedback: `Its size is not the reason — its PLACE is. The leftmost place sets the quotient's first place.` },
      { label: "It does not matter where you start", correct: false, feedback: `It does: starting elsewhere puts the quotient's digits in the wrong places entirely.` },
    ] };
}
function PartialQuotientMcq() {
  return { kind: "mcq",
    prompt: `Finding successive chunks in 852 ÷ 4, a student takes 200 fours first. Why is that allowed?`,
    options: [
      { label: "Because any number of groups can be removed at once, in any order", correct: true, feedback: `Correct — partial quotients removes convenient chunks and adds them up; the order never changes the total.` },
      { label: "Because 200 is the only correct first chunk", correct: false, feedback: `It is convenient, not required — 100 fours twice reaches the same place, just more slowly.` },
      { label: "Because 4 × 200 is bigger than 852", correct: false, feedback: `4 × 200 is 800, which fits inside 852 — that is exactly why the chunk is legal.` },
      { label: "It is not allowed — you must take one group at a time", correct: false, feedback: `Taking one at a time works but is enormously slow; chunking is the whole point of the method.` },
    ] };
}
function EstimateQuotientMcq() {
  return { kind: "mcq",
    prompt: `Before computing 3,612 ÷ 6, which estimate helps most?`,
    options: [
      { label: "3,600 ÷ 6 = 600", correct: true, feedback: `Correct — a friendly dividend close to the real one puts the quotient right at 600.` },
      { label: "3,612 ÷ 6 = about 60", correct: false, feedback: `Six sixties is 360, not 3,612 — that estimate is short by a factor of ten.` },
      { label: "3,612 − 6 = about 3,600", correct: false, feedback: `Estimating must keep the operation; dividing by 6 shrinks the number far more than subtracting 6.` },
      { label: "3,612 ÷ 6 = about 6,000", correct: false, feedback: `Dividing makes a number smaller, so a quotient larger than the dividend is impossible.` },
    ] };
}
function CheckQuotientMcq() {
  return { kind: "mcq",
    prompt: `You compute 852 ÷ 4 = 213. Which check confirms it?`,
    options: [
      { label: "Multiply 213 × 4 and see if you get 852", correct: true, feedback: `Correct — multiplication undoes division, so the quotient times the divisor must rebuild the dividend.` },
      { label: "Divide 852 ÷ 213", correct: false, feedback: `That gives 4, the divisor you already knew — it never tests whether 213 was computed correctly.` },
      { label: "Add 213 + 4", correct: false, feedback: `Addition is not the inverse of division; the check has to reconstruct 852.` },
      { label: "Divide 213 ÷ 4", correct: false, feedback: `That starts an unrelated problem and never returns to the 852 the answer should rebuild.` },
    ] };
}
function RemainderMeaningMcq() {
  return { kind: "mcq",
    prompt: `53 pencils are shared into packs of 8. The answer 6 R 5 can mean different things. Which question needs 7?`,
    options: [
      { label: "How many packs are needed so every pencil is packed?", correct: true, feedback: `Correct — the 5 leftover pencils still need a pack, so the partial group rounds UP to 7.` },
      { label: "How many FULL packs are there?", correct: false, feedback: `That is 6 — full packs ignore the leftover entirely.` },
      { label: "How many pencils are left over?", correct: false, feedback: `That is 5, the remainder itself, not a count of packs.` },
      { label: "How many pencils in each pack?", correct: false, feedback: `That is 8, the divisor — it was given, not computed.` },
    ] };
}

const REUSE = { TensProductNumeric, TensReasonMcq: () => TensReasonMcq(), Area1Numeric, Area1SplitMcq,
  Area2Numeric, Area2SplitMcq, DivideBigNumeric, RemainderNumeric, InterpretRemainderNumeric,
  MultiStepNumeric,
  EstimateProductMcq: () => EstimateProductMcq(), CheckProductMcq: () => CheckProductMcq(),
  PlaceValueDivMcq: () => PlaceValueDivMcq(), PartialQuotientMcq: () => PartialQuotientMcq(),
  EstimateQuotientMcq: () => EstimateQuotientMcq(), CheckQuotientMcq: () => CheckQuotientMcq(),
  RemainderMeaningMcq: () => RemainderMeaningMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Split a factor into its places, multiply each part, and add every piece back.") {
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
    must(options.length >= 4, `${mirror} needs >=4 options`);
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
function area(prompt, w, h, success, low, high, factorFeedback) {
  const spec = structuredClone(AREA_T);
  const targetArea = w * h;
  spec.prompt = prompt; spec.targetArea = targetArea;
  // Grading accepts either orientation (a rotated rectangle is the same factoring), so BOTH
  // sliders must reach max(w, h) — otherwise the transpose is accepted but unreachable.
  const bound = Math.max(w, h);
  spec.wMax = bound; spec.hMax = bound;
  spec.wStart = 1; spec.hStart = 1;
  spec.square = false;
  spec.requireFactors = { w, h };            // pins WHICH decomposition counts
  spec.factorFeedback = factorFeedback;      // mandatory whenever requireFactors is set
  if ("countGrid" in spec) delete spec.countGrid;
  if ("commonCounts" in spec) delete spec.commonCounts;
  spec.successFeedback = success; spec.lowFeedback = low; spec.highFeedback = high;
  must(w <= spec.wMax && h <= spec.hMax, "area target must fit the tray");
  must(h <= spec.wMax && w <= spec.hMax, "area TRANSPOSE must also fit the tray");
  must(bound <= 30, `areaModel side ${bound} is too wide to read at 360px — use a smaller model`);
  must(factorFeedback && factorFeedback.length >= 25, "areaModel requireFactors needs factorFeedback");
  must(targetArea > 0, "area must be positive");
  return spec;
}
function columnMultiply(prompt, a, b, traps) {
  const w = structuredClone(COL_T);
  w.prompt = prompt; w.op = "multiply"; w.a = a; w.b = b;
  must(b >= 2 && b <= 9, "columnCalc(multiply) needs a single-digit multiplier 2-9");
  const reach = columnCalcReachable("multiply", a, b);
  const truth = ccTruth("multiply", a, b);
  must(reach.has(truth), `columnCalc truth ${truth} unreachable`);
  must(reach.size >= 2, `columnCalc ${a} × ${b} has no regrouping decision — engine refuses it`);
  const kept = [];
  for (const [value, feedback] of traps) {
    if (value === truth || !reach.has(value)) continue;         // prove reachable or drop
    if (kept.some((k) => k.value === value)) continue;
    must(feedback.length >= 25, "columnCalc trap feedback short");
    kept.push({ value, feedback });
  }
  must(kept.length >= 1, `columnCalc ${a} × ${b}: no reachable trap survived — refuse dead feedback`);
  w.commonResults = kept;
  if ("decimals" in w) w.decimals = 0;
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
function hop(prompt, min, max, start, hopSize, hops, success, landings) {
  const w = structuredClone(HOP_T);
  w.prompt = prompt; w.min = min; w.max = max; w.start = start;
  w.hop = hopSize; w.hops = hops; w.direction = "forward";
  delete w.hopSizeTargets; delete w.hopSizeMin; delete w.hopSizeMax;
  const land = start + hopSize * hops;
  must(land >= min && land <= max, `hop landing ${land} off the line`);
  w.successFeedback = success;
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
  actionGoal: `Split a factor into places, build each piece, and reassemble the whole for ${tag.replace(/-/g, " ")}.`,
  invariants: [`Splitting a factor never changes the product: every piece of the split multiplies the other factor, and the pieces add back to exactly the same total, which is what makes ${tag.replace(/-/g, " ")} decomposable at all.`],
  misconceptions: [`Adding only some of the partial products, dropping or inventing a zero when factors carry tens, or letting a remainder reach or exceed the divisor.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `mult-div-fluency-g4:${tag}`, delayed: true,
  counterfactualPrompt: "If one partial product were left out, exactly how much of the total would go missing?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  tens: ["Use the basic fact.", "Then attach the tens.", "Count every zero."],
  split: ["Split one factor by place.", "Multiply each piece.", "Add every piece back."],
  col: ["Multiply place by place.", "Carry what overflows.", "The carry must land."],
  div: ["Start at the largest place.", "Divide, then bring down.", "Check with multiplication."],
  rem: ["Remainder is what is left.", "It stays under the divisor.", "Ask what the question wants."],
  est: ["Round to friendly numbers.", "Keep the operation.", "Compare to the exact."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Multiplying by 10, 100, or 1,000 does not need a new fact — it takes a fact you own and scales it. 3 × 4 = 12 gives 30 × 4 = 120.",
  "The zeros are not decoration. Each ten in a factor multiplies the product by ten, so count the zeros the factors actually carry.",
  { rep: "diagram", widget: () => area("Build a rectangle whose area is 120 using a side of 30. What is the other side?", 30, 4,
      "30 × 4 = 120 — the fact 3 × 4 = 12, scaled by the ten inside 30.",
      "Smaller than 120 — the rectangle has not reached the full area yet.",
      "Larger than 120 — one side has overshot the factor pair the prompt names.",
      "That area is right, but not from the sides asked for — this rectangle must measure 30 by 4."),
    predict: P("If 3 × 4 = 12, what is 30 × 4?", [{ id: "120", label: "120" }, { id: "12", label: "Still 12" }], "120",
      "30 is three TENS, so the product is the basic fact taken ten times over.") },
  [
    reused("TensProductNumeric", "g4m1-k1", H.tens, ["Basic fact first.", "Then scale by the tens."]),
    reused("TensReasonMcq", "g4m1-k2", H.tens, ["Tens scale the fact.", "Zeros come from factors."]),
    reused("TensProductNumeric", "g4m1-k3", H.tens, ["Count every zero.", "None invented, none lost."]),
    reused("TensProductNumeric", "g4m1-ch1", H.tens, ["Bigger tens, same rule.", "Scale, do not guess."]),
  ],
  ["Basic facts scale by tens.", "Zeros come from the factors.", "Never invent or drop a zero."],
  "next: splitting a factor you do not know.");

def(2,
  "An area model turns a hard product into easy ones: split a factor by place, multiply each piece, and the rectangle's regions add to the whole.",
  "Splitting never changes the answer. 14 × 6 becomes 10 × 6 plus 4 × 6 — two facts you own, reassembled into one you did not.",
  { rep: "diagram", widget: () => area("Build the 14 × 6 rectangle: 14 wide and 6 tall.", 14, 6,
      "84 — and the rectangle splits cleanly into 10 × 6 = 60 and 4 × 6 = 24.",
      "Smaller than 84 — keep building until both sides match 14 and 6.",
      "Larger than 84 — a side has grown past the factors the prompt names.",
      "That area is right, but from different sides — the model asked for is 14 across and 6 down."),
    predict: P("Splitting 14 into 10 and 4, does the product change?", [{ id: "no", label: "No — the pieces add back" }, { id: "yes", label: "Yes — splitting loses some" }], "no",
      "The two regions together ARE the rectangle: 60 + 24 = 84, exactly 14 × 6.") },
  [
    reused("Area1Numeric", "g4m2-k1", H.split, ["Split by place.", "Add every piece."]),
    reused("Area1SplitMcq", "g4m2-k2", H.split, ["One factor splits.", "Each part takes the whole other."]),
    reused("Area1Numeric", "g4m2-k3", H.split, ["Tens piece plus ones piece.", "Neither may be dropped."]),
    reused("Area1Numeric", "g4m2-ch1", H.split, ["Bigger factors, same split.", "Places do the work."]),
  ],
  ["Split a factor by place.", "Multiply each piece.", "Add every region back."],
  "next: the same idea in columns.");

def(3,
  "The column algorithm is the area model written compactly: each place of the top number is multiplied by the single digit, and the pieces stack up.",
  "Nothing new is happening — the partial products are still there, just written above one another instead of side by side.",
  { rep: "symbolic", widget: () => columnMultiply("Work 1,342 × 3 in columns. Tap each column to multiply it.", 1342, 3,
      [[3026, "3,026 stranded the carry out of the hundreds — a column keeps one digit and hands the rest upward."],
       [3926, "One carry never joined the column above it, so the product is a whole hundred short."]]),
    predict: P("Multiplying 1,342 × 3, how many columns get multiplied?", [{ id: "four", label: "All four" }, { id: "one", label: "Just the ones" }], "four",
      "Every place of 1,342 is part of the number, so every place is multiplied by 3.") },
  [
    reused("Area1Numeric", "g4m3-k1", H.col, ["Every place multiplies.", "None is skipped."]),
    reused("Area1Numeric", "g4m3-k2", H.col, ["Columns hold one digit.", "Overflow carries."]),
    reused("TensProductNumeric", "g4m3-k3", H.tens, ["Places scale the fact.", "Zeros stay honest."]),
    reused("Area1Numeric", "g4m3-ch1", H.col, ["Four digits, same rule.", "Place by place."]),
  ],
  ["Every place gets multiplied.", "Columns hold one digit each.", "The algorithm is the area model, compressed."],
  "next: what the carries are doing.");

def(4,
  "A carry in multiplication is the same trade as in addition: when a column's product passes nine, the extra tens move left.",
  "Strand a carry and the product drops by exactly that bundle. The carry is not scratch work — it is part of the answer.",
  { rep: "symbolic", widget: () => columnMultiply("Work 487 × 6 in columns and watch each carry land.", 487, 6,
      [[2882, "2,882 dropped the carry the tens column produced — those forty units never arrived."],
       [2482, "Two carries went missing on the way left; each stranded carry costs exactly its own value."]]),
    predict: P("In 487 × 6, the ones give 7 × 6 = 42. What stays in the ones column?", [{ id: "two", label: "2, and 4 tens carry" }, { id: "fortytwo", label: "42" }], "two",
      "A column holds one digit. Forty-two is 4 tens and 2 ones — the 2 stays, the 4 tens move left.") },
  [
    reused("Area1Numeric", "g4m4-k1", H.col, ["Products over nine carry.", "The carry must land."]),
    reused("Area1Numeric", "g4m4-k2", H.col, ["Stranding loses tens.", "Add the carry in."]),
    reused("Area1Numeric", "g4m4-k3", H.col, ["Carry, then multiply next.", "Order matters."]),
    reused("Area1Numeric", "g4m4-ch1", H.col, ["Chained carries.", "Each one lands."]),
  ],
  ["Products over nine carry.", "The carry joins the next column.", "A stranded carry loses exactly its value."],
  "next: splitting BOTH factors.");

def(5,
  "When both factors are two-digit, both split — and the rectangle gains four regions instead of two.",
  "23 × 14 becomes 20×10, 20×4, 3×10 and 3×4. Miss one region and the product is short by exactly that rectangle.",
  { rep: "diagram", widget: () => area("Build the 23 × 14 rectangle: 23 wide and 14 tall.", 23, 14,
      "322 — and it divides into 200, 80, 30 and 12, which are the four partial products.",
      "Smaller than 322 — keep building until both sides reach 23 and 14.",
      "Larger than 322 — a side has grown past the factors named.",
      "That area is right, but the sides are not — this model must measure 23 across and 14 down."),
    predict: P("Splitting both factors of 23 × 14, how many regions appear?", [{ id: "four", label: "Four" }, { id: "two", label: "Two" }], "four",
      "Two pieces across times two pieces down makes four rectangles, and all four are real area.") },
  [
    reused("Area2Numeric", "g4m5-k1", H.split, ["Both factors split.", "Four regions appear."]),
    reused("Area2SplitMcq", "g4m5-k2", H.split, ["Every pairing appears once.", "Corners are not enough."]),
    reused("Area2Numeric", "g4m5-k3", H.split, ["Add all four.", "Missing one loses its area."]),
    reused("Area2Numeric", "g4m5-ch1", H.split, ["Bigger factors, four regions still.", "Reassemble fully."]),
  ],
  ["Both factors split into places.", "Four regions, not two.", "Every region is real area."],
  "next: the four products written down.");

def(6,
  "Partial products write those four regions as four lines, then add them. The layout changes; the mathematics does not.",
  "Keeping the places straight is the whole discipline: 20 × 10 is 200, not 30, and a misplaced zero costs the entire region.",
  { rep: "diagram", widget: () => area("Build 26 × 18 as a rectangle: 26 wide and 18 tall.", 26, 18,
      "468 — the sum of 200, 160, 60 and 48, the four partial products.",
      "Smaller than 468 — both sides must reach the full factors.",
      "Larger than 468 — a side has overshot.",
      "That area is right, but built from other sides — the model asked for is 26 across and 18 down."),
    predict: P("In 26 × 18, what is the LARGEST partial product?", [{ id: "tens", label: "20 × 10 = 200" }, { id: "ones", label: "6 × 8 = 48" }], "tens",
      "The tens-by-tens region is by far the biggest piece — which is why dropping it is the costliest mistake.") },
  [
    reused("Area2Numeric", "g4m6-k1", H.split, ["Four lines, then add.", "Places stay straight."]),
    reused("Area2SplitMcq", "g4m6-k2", H.split, ["Tens by tens is largest.", "Never drop it."]),
    reused("Area2Numeric", "g4m6-k3", H.split, ["Add all four lines.", "Check each place."]),
    reused("Area2Numeric", "g4m6-ch1", H.split, ["Same method, larger numbers.", "Discipline holds."]),
  ],
  ["Four partial products, four lines.", "Keep the places straight.", "Then add them all."],
  "next: knowing roughly before knowing exactly.");

def(7,
  "Estimating a product rounds each factor to something friendly and multiplies those. It tells you the neighbourhood before you do the work.",
  "An estimate is a guard against the most expensive error in multiplication: a digit in the wrong place, which is wrong by a factor of ten.",
  { rep: "diagram", widget: () => estimate("38 × 52 — slide to estimate the product before computing it.", 100, 20000, 2000, "units",
      "Too low — forty groups of fifty already reaches two thousand.",
      "Too high — both factors are under 60, so the product cannot reach that far.",
      "About 2,000 — from 40 × 50, and the exact answer is 1,976."),
    predict: P("Estimating 38 × 52, which rounding helps most?", [{ id: "friendly", label: "40 × 50" }, { id: "none", label: "No rounding" }], "friendly",
      "Forty and fifty are friendly, and their product sits within a whisker of the exact 1,976.") },
  [
    reused("EstimateProductMcq", "g4m7-k1", H.est, ["Round each factor.", "Keep multiplying."]),
    reused("Area2Numeric", "g4m7-k2", H.est, ["The exact answer decides.", "The estimate guards it."]),
    reused("EstimateProductMcq", "g4m7-k3", H.est, ["Order of magnitude first.", "Then the digits."]),
    reused("Area1Numeric", "g4m7-ch1", H.est, ["Estimate, then compute.", "Compare the two."]),
  ],
  ["Round both factors.", "Multiply the friendly numbers.", "The estimate guards the place value."],
  "next: using that estimate as a check.");

def(8,
  "Checking a product compares it to the estimate. Close means plausible; an answer ten times out is a misplaced digit, every time.",
  "This check costs seconds and catches the errors that matter most — the ones where the digits are right but the places are not.",
  { rep: "diagram", widget: () => estimate("A student computed 47 × 6 = 2,822. Slide to the estimate that tests it.", 20, 3000, 300, "units",
      "Too low — fifty sixes is about three hundred, not tens.",
      "Too high — 47 × 6 cannot approach the thousands.",
      "About 300 — so 2,822 is roughly ten times too big; the exact answer is 282."),
    predict: P("Exact claim 2,822 against an estimate of 300. What follows?", [{ id: "wrong", label: "2,822 is wrong" }, { id: "ok", label: "It is fine" }], "wrong",
      "Being an order of magnitude away is not estimation error — it is a place-value slip.") },
  [
    reused("CheckProductMcq", "g4m8-k1", H.est, ["Compare to the estimate.", "Ten times out is a slip."]),
    reused("Area1Numeric", "g4m8-k2", H.est, ["Recompute carefully.", "Then compare again."]),
    reused("CheckProductMcq", "g4m8-k3", H.est, ["Estimates catch place errors.", "Cheapest check there is."]),
    reused("MultiStepNumeric", "g4m8-ch1", H.split, ["Two steps, then check.", "Both must be right."]),
  ],
  ["Compare exact to estimate.", "Close means plausible.", "An order of magnitude out is a place-value slip."],
  "next: taking numbers apart instead.");

def(9,
  "Division works from the LARGEST place downward — the opposite of addition. The first place that can be divided sets where the quotient begins.",
  "In 936 ÷ 3, nine hundreds split into three gives three hundreds, so the quotient opens in the hundreds place and 312 follows.",
  { rep: "diagram", widget: () => estimate("936 ÷ 3 — slide to where the quotient must land before computing it.", 10, 3000, 312, "units",
      "Too low — nine hundreds divide into three groups of one hundred each, before the tens are touched.",
      "Too high — a quotient cannot exceed the 936 being shared out.",
      "312 — the hundreds divide first, which is why the quotient opens in the hundreds place."),
    predict: P("Dividing 936 ÷ 3, which place does the quotient start in?", [{ id: "h", label: "Hundreds" }, { id: "o", label: "Ones" }], "h",
      "Nine hundreds can be split three ways, so the quotient's first digit is a hundreds digit.") },
  [
    reused("PlaceValueDivMcq", "g4m9-k1", H.div, ["Start at the largest place.", "It sets the first digit."]),
    reused("DivideBigNumeric", "g4m9-k2", H.div, ["Divide each place in turn.", "Bring down the rest."]),
    reused("PlaceValueDivMcq", "g4m9-k3", H.div, ["Left to right in division.", "Opposite of addition."]),
    reused("DivideBigNumeric", "g4m9-ch1", H.div, ["More places, same order.", "Largest place first."]),
  ],
  ["Division starts at the largest place.", "That place sets the quotient's first digit.", "Then work rightward."],
  "next: removing groups in convenient chunks.");

def(10,
  "Partial quotients removes groups in whatever chunks are convenient, then adds the chunks up. 852 ÷ 4 can take 200 fours, then 13 more.",
  "Any legal chunk works and the order never matters, because removing 200 groups then 13 removes exactly the same 213 groups.",
  { rep: "diagram", widget: () => estimate("852 ÷ 4 — slide to the quotient the chunks must total.", 10, 3000, 213, "units",
      "Too low — 200 fours alone already account for 800 of the 852.",
      "Too high — more than 213 fours would overshoot 852 entirely.",
      "213 — reachable as 200 fours then 13 more, or any chunks totalling the same."),
    predict: P("Taking 200 fours out of 852 first, is that legal?", [{ id: "yes", label: "Yes — any size chunk" }, { id: "no", label: "No — one at a time" }], "yes",
      "800 fits inside 852, so the chunk is legal — and it does most of the work in a single step.") },
  [
    reused("PartialQuotientMcq", "g4m10-k1", H.div, ["Chunks may be any size.", "Order does not matter."]),
    reused("DivideBigNumeric", "g4m10-k2", H.div, ["Chunks add to the quotient.", "Total them at the end."]),
    reused("PartialQuotientMcq", "g4m10-k3", H.div, ["Convenient beats small.", "Fewer steps, fewer slips."]),
    reused("DivideBigNumeric", "g4m10-ch1", H.div, ["Bigger dividends, same method.", "Chunk and total."]),
  ],
  ["Remove convenient chunks.", "Add the chunks for the quotient.", "Order never changes the total."],
  "next: three digits, one divisor.");

def(11,
  "Three-digit by one-digit division applies the same order every time: divide the place, write the digit, carry the leftover to the next place.",
  "The leftover from one place does not vanish — it becomes tens or ones in the place below and gets divided there.",
  { rep: "symbolic", widget: () => columnMultiply("Check that 504 ÷ 6 = 84 by multiplying back: work 84 × 6.", 84, 6,
      [[484, "484 stranded the carry out of the ones column, so the check falls ten short of 504."],
       [84, "That wrote only the ones-column product and never multiplied the tens place at all."]]),
    predict: P("Dividing 504 ÷ 6, can the hundreds be divided first?", [{ id: "no", label: "No — 5 is less than 6" }, { id: "yes", label: "Yes — always start left" }], "no",
      "Five hundreds cannot make a group of six, so those hundreds join the tens and division begins there.") },
  [
    reused("DivideBigNumeric", "g4m11-k1", H.div, ["Divide place by place.", "Carry the leftover down."]),
    reused("DivideBigNumeric", "g4m11-k2", H.div, ["A short place joins the next.", "Nothing is lost."]),
    reused("PlaceValueDivMcq", "g4m11-k3", H.div, ["Largest workable place.", "That sets the start."]),
    reused("DivideBigNumeric", "g4m11-ch1", H.div, ["Same order, new numbers.", "Left to right."]),
  ],
  ["Divide each place in turn.", "Leftovers move down a place.", "Nothing is discarded."],
  "next: four digits.");

def(12,
  "Four-digit dividends change nothing but the length of the work. The same place-by-place march produces the quotient.",
  "Longer problems reward the estimate even more: knowing 3,612 ÷ 6 is near 600 tells you instantly whether the quotient has the right number of digits.",
  { rep: "diagram", widget: () => estimate("Estimate 3,612 ÷ 6 before computing it.", 20, 6000, 600, "units",
      "Too low — six sixties is only 360, far short of 3,612.",
      "Too high — dividing by 6 shrinks the number; the quotient is well under a thousand.",
      "About 600 — from 3,600 ÷ 6, and the exact quotient is 602."),
    predict: P("Estimating 3,612 ÷ 6, which friendly dividend helps?", [{ id: "3600", label: "3,600" }, { id: "3000", label: "3,000" }], "3600",
      "3,600 is both close to 3,612 and cleanly divisible by 6, giving 600 on sight.") },
  [
    reused("DivideBigNumeric", "g4m12-k1", H.div, ["Same march, more places.", "Left to right."]),
    reused("EstimateQuotientMcq", "g4m12-k2", H.est, ["Round the dividend.", "Keep dividing."]),
    reused("DivideBigNumeric", "g4m12-k3", H.div, ["Digit count matters.", "The estimate reveals it."]),
    reused("DivideBigNumeric", "g4m12-ch1", H.div, ["Long dividends, same rule.", "Place by place."]),
  ],
  ["Longer dividends, identical method.", "Estimate to check the digit count.", "March left to right."],
  "next: when it does not divide evenly.");

def(13,
  "Most divisions leave something over. The remainder is what could not form another whole group — and it is always smaller than the divisor.",
  "If the remainder reached the divisor, one more group could be made. That is the test: a remainder at or above the divisor means the quotient is too small.",
  { rep: "diagram", widget: () => hop("47 hikers into groups of 6. Hop by sixes and see how far you get.", 0, 60, 0, 6, 7,
      "42 after seven hops — five hikers short of 47, and those five are the remainder.",
      [[48, "Eight hops overshoot 47; only seven full groups of six fit inside it."],
       [36, "Six hops leave eleven over, which is more than six — another whole group still fits."]]),
    predict: P("Dividing 47 by 6, can the remainder be 8?", [{ id: "no", label: "No — 8 is bigger than 6" }, { id: "yes", label: "Yes" }], "no",
      "A remainder of 8 still contains a whole group of 6, so the quotient was counted one too low.") },
  [
    reused("RemainderNumeric", "g4m13-k1", H.rem, ["Full groups first.", "The rest is remainder."]),
    reused("RemainderNumeric", "g4m13-k2", H.rem, ["Remainder under divisor.", "Always."]),
    reused("DivideBigNumeric", "g4m13-k3", H.div, ["Even divisions leave zero.", "Both are normal."]),
    reused("RemainderNumeric", "g4m13-ch1", H.rem, ["Bigger numbers, same test.", "Check the leftover."]),
  ],
  ["The remainder is what is left over.", "It is always under the divisor.", "Otherwise another group fits."],
  "next: what the remainder MEANS.");

def(14,
  "The same remainder answers different questions differently. Six full vans with five hikers left over means seven vans are needed — the leftover still has to travel.",
  "Ask what the story wants: full groups only, the leftover itself, or enough groups for everyone. The arithmetic is identical; the answer is not.",
  { rep: "diagram", widget: () => hop("53 hikers, vans of 8. Hop by eights to see how many FULL vans fill.", 0, 64, 0, 8, 6,
      "48 after six hops — six full vans, and five hikers still waiting for a seventh.",
      [[56, "Seven hops pass 53; only six vans fill completely."],
       [40, "Five hops leave thirteen waiting, which is more than one vanful."]]),
    predict: P("53 hikers, vans of 8, everyone must ride. How many vans?", [{ id: "seven", label: "7" }, { id: "six", label: "6" }], "seven",
      "Six vans carry 48 and leave five behind — those five need a seventh van, even a mostly empty one.") },
  [
    reused("InterpretRemainderNumeric", "g4m14-k1", H.rem, ["Everyone must ride.", "Round the partial group up."]),
    reused("RemainderMeaningMcq", "g4m14-k2", H.rem, ["The question decides.", "Same arithmetic, different answer."]),
    reused("InterpretRemainderNumeric", "g4m14-k3", H.rem, ["Leftovers still need a group.", "Round up."]),
    reused("RemainderNumeric", "g4m14-ch1", H.rem, ["Full groups versus needed groups.", "Read carefully."]),
  ],
  ["The remainder's meaning depends on the question.", "Full groups, leftover, or rounded up.", "Read what the story wants."],
  "next: estimating quotients.");

def(15,
  "Estimating a quotient rounds the dividend to something the divisor likes. 3,612 ÷ 6 becomes 3,600 ÷ 6 = 600 on sight.",
  "The estimate's main job is the digit count: knowing the answer is in the hundreds means a quotient of 60 or 6,000 is caught instantly.",
  { rep: "diagram", widget: () => estimate("Estimate 2,437 ÷ 5 before computing it.", 20, 5000, 500, "units",
      "Too low — five hundreds is 2,500, right near the dividend.",
      "Too high — dividing by 5 cannot leave a number near the dividend itself.",
      "About 500 — from 2,500 ÷ 5, and the exact quotient is 487 remainder 2."),
    predict: P("Estimating 2,437 ÷ 5, which friendly dividend helps?", [{ id: "2500", label: "2,500" }, { id: "2000", label: "2,000" }], "2500",
      "2,500 is closest to 2,437 among the multiples of 5 that divide cleanly, giving 500.") },
  [
    reused("EstimateQuotientMcq", "g4m15-k1", H.est, ["Round to a friendly dividend.", "One the divisor likes."]),
    reused("DivideBigNumeric", "g4m15-k2", H.est, ["Then divide exactly.", "Compare the two."]),
    reused("EstimateQuotientMcq", "g4m15-k3", H.est, ["The digit count matters most.", "Hundreds or tens?"]),
    reused("InterpretRemainderNumeric", "g4m15-ch1", H.rem, ["Estimates guide, stories decide.", "Round up when needed."]),
  ],
  ["Round the dividend to a friendly multiple.", "Divide the friendly numbers.", "The estimate fixes the digit count."],
  "next: proving the quotient.");

def(16,
  "Multiplication undoes division, so every quotient carries its own proof: multiply it by the divisor and the dividend should come back.",
  "With a remainder the check gains one step — multiply, then add the leftover. If that does not rebuild the dividend, something slipped.",
  { rep: "symbolic", widget: () => columnMultiply("Check 852 ÷ 4 = 213 by multiplying back: work 213 × 4.", 213, 4,
      [[842, "842 stranded the carry from the ones column, so the check falls ten short of 852 — the slip is in the check, not the quotient."]]),
    predict: P("You found 852 ÷ 4 = 213. Which product should rebuild 852?", [{ id: "back", label: "213 × 4" }, { id: "fwd", label: "852 × 4" }], "back",
      "The quotient times the divisor reconstructs the dividend — that is exactly what division took apart.") },
  [
    reused("CheckQuotientMcq", "g4m16-k1", H.div, ["Multiply the quotient back.", "It must rebuild the dividend."]),
    reused("DivideBigNumeric", "g4m16-k2", H.div, ["Compute carefully.", "Then check."]),
    reused("CheckQuotientMcq", "g4m16-k3", H.div, ["With a remainder, add it.", "Then compare."]),
    reused("MultiStepNumeric", "g4m16-ch1", H.split, ["Multi-step work, checked.", "Every stage must hold."]),
  ],
  ["Multiplication undoes division.", "Quotient times divisor rebuilds the dividend.", "With a remainder, add it back too."],
  "course complete: multiplied, split, divided, interpreted, estimated, and checked.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 16, `16 lessons defined, got ${L.length}`);
const chapterTitles = ["Multi-Digit Multiplication", "From Products to Quotients", "Division, Remainders, and Checking"];
const perChapter = [6, 5, 5];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 6 ? 1 : n <= 11 ? 2 : 3);
const outDir = join(root, "content/courses/mult-div-fluency-g4");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g4m-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "symbolic") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "mult-div-fluency-g4",
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

  for (const s of lesson.steps) {
    const w = s.widget;
    if (!w) continue;
    if (w.type === "numeric") {
      for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} trap==answer`);
      const n = (w.prompt.match(/\d+/g) || []).map(Number);
      const f = s.variant?.form;
      if (["mbMultiplyTensNumeric","mbAreaModel1DigitNumeric","mbAreaModel2DigitNumeric"].includes(f)) {
        must(n[0] * n[1] === w.answer, `${id}/${s.id} ${f}: first two numbers must be the factors`);
      }
      if (f === "mbDivideBigNumeric") must(n[0] / n[1] === w.answer, `${id}/${s.id} mbDivideBig n0/n1`);
      if (f === "mbRemaindersNumeric") {
        must(n[0] - n[1] * n[2] === w.answer, `${id}/${s.id} mbRemainders n0−n1*n2`);
        must(w.answer >= 0 && w.answer < n[1], `${id}/${s.id} remainder must sit under the divisor`);
      }
      if (f === "mbInterpretRemaindersNumeric") {
        must(Math.ceil(n[0] / n[1]) === w.answer, `${id}/${s.id} mbInterpretRemainders ceil(n0/n1)`);
      }
      if (f === "mbMultiStepNumeric") must(n[0] * n[1] - n[2] === w.answer, `${id}/${s.id} mbMultiStep n0*n1−n2`);
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
    }
    if (w.type === "areaModel") {
      must(w.targetArea === w.requireFactors.w * w.requireFactors.h, `${id}/${s.id} areaModel factors must build the area`);
      must(w.requireFactors.w <= w.wMax && w.requireFactors.h <= w.hMax, `${id}/${s.id} areaModel factors exceed the tray`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "mult-div-fluency-g4", slug: "mult-div-fluency-g4", title: spec.title,
  tagline: "Split, multiply, divide, and check — multi-digit arithmetic you can see and defend.",
  category: "Math", gradeLevel: 4, chapters,
}, null, 2) + "\n");
console.log(`built 16 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
