#!/usr/bin/env node
// S195 — Batch D course 2/3: fractions-deeper-g3 (3.NF.A.1, 3.NF.A.2, 3.NF.A.3). Zero new generator code.
//
// The shipped g3 `fractions` course rides authored-template families (equal-parts, nl-partition,
// equivalent-fractions …) whose solver is a LOOKUP TABLE keyed to exact authored prompts — it
// cannot carry a single new prompt. So this course reuses the two COMPUTATIONAL fraction
// families instead, both probed empirically before authoring:
//   g2-shapes-shares (src/lib/g2Independent.cjs)
//     Ssg2NameThirdMcq        -> n[0]===2 ? 'a half' : 'a third'  (labels must match EXACTLY)
//     Ssg2CompareSharesMcq    -> 'smaller' picks the LARGEST denominator among half|third|fourth
//     Ssg2ThirdsCountNumeric  -> always 3
//     Ssg2GridApplyNumeric    -> n[0] * n[1]
//   g4-fractions (src/lib/g4Independent.cjs)
//     faEquivalenceRecapNumeric  "A/B = ?/C. What number goes on top?"      -> A*C/B (must divide)
//     faEquivalenceRuleNumeric   "Scale A/B by ×K…"                          -> A*K
//     faImproperToMixedNumeric   "Convert N/D to a mixed number… WHOLE NUMBER part?" -> floor(N/D)
//     faWholeTimesFractionNumeric "Compute W × N/D as ?/D…"                  -> W*N
//     faLikeDenomWordNumeric     two like fractions, no "were available"     -> a.num + b.num
//     faBenchmarkOrderMcq        three fractions; labels exactly "n/d"       -> the MIDDLE
//     faBenchmarkOrderNumeric    three fractions                             -> middle's DENOMINATOR
// Ssg2ThirdsCountMcq is deliberately unused: its route demands option labels exactly "Yes"/"No",
// which cannot carry a diagnosis, so equal-part reasoning uses authored MCQs instead.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "fractions-deeper-g3");
if (!spec || spec.lessons.length !== 14) throw new Error("spec course missing or wrong size");

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
const TAP_T = corpusTemplate("tapDiagram", "fractions");

const REG_SS = new Set(["Ssg2CompareSharesMcq","Ssg2GridApplyNumeric","Ssg2GridApplyRead",
  "Ssg2NameAnyMcq","Ssg2NameAnyTapDiagram","Ssg2NameThirdFractionBar","Ssg2NameThirdMcq",
  "Ssg2PyramidNumeric","Ssg2PyramidTapDiagram","Ssg2ShapeVocabMcq","Ssg2ShapeVocabNumeric",
  "Ssg2ThirdsCountMcq","Ssg2ThirdsCountNumeric"]);
const REG_FA = new Set(["faEquivalenceRecapMcq","faEquivalenceRecapNumeric","faEquivalenceRuleNumeric",
  "faSimplifyNumeric","faBenchmarkCompareMcq","faBenchmarkOrderMcq","faBenchmarkOrderNumeric",
  "faBenchmarkOrderRational","faLikeDenomWordMcq","faLikeDenomWordNumeric","faImproperToMixedNumeric",
  "faMixedToImproperNumeric","faMixedAddSubMixed","faMixedAddSubNumeric","faWholeTimesFractionMcq",
  "faWholeTimesFractionMixed","faWholeTimesFractionNumeric","faWholeTimesFractionWordNumeric"]);
const REG = { "g2-shapes-shares": REG_SS, "g4-fractions": REG_FA };

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
    if (v !== answer && v >= 0 && !out.some((o) => o[0] === v)) out.push([v, fb]);
    if (out.length === 2) break;
  }
  while (out.length < 2) {
    const v = answer + 3 + out.length;
    out.push([v, "That count does not match the pieces in the model — recount the shaded parts against the whole."]);
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

const ORD = { 2: "halves", 3: "thirds", 4: "fourths", 6: "sixths", 8: "eighths" };
const ONE = { 2: "half", 3: "third", 4: "fourth", 6: "sixth", 8: "eighth" };

/* ---------------- graded mirrors ---------------- */
function NameUnitMcq(r) {
  const n = choose(r, [2, 3]);
  const thing = choose(r, [["A sandwich", "part"], ["A ribbon", "strip"], ["A pizza", "slice"]]);
  const correct = n === 2 ? "a half" : "a third";
  return { gen: "g2-shapes-shares", form: "Ssg2NameThirdMcq", kind: "solverMcq",
    prompt: `${thing[0]} is split into ${n} equal ${n === 2 ? "parts" : "parts"}. What do you call each ${thing[1]}?`,
    labels: ["a half", "a third", "a fourth"], correct,
    feedback: {
      "a half": n === 2 ? `Correct — two equal parts, so each one is a half of the whole.`
                        : `A half means the whole was split into TWO equal parts, but this one was split into ${n}.`,
      "a third": n === 3 ? `Correct — three equal parts, so each one is a third of the whole.`
                         : `A third names one of THREE equal parts; this whole was split into ${n}.`,
      "a fourth": `A fourth names one of four equal parts, and nothing here was cut into four.`,
    } };
}
function CompareSharesMcq(r) {
  const which = r() < 0.5 ? "smaller" : "bigger";
  const pairs = [["a half", "a third"], ["a third", "a fourth"], ["a half", "a fourth"]];
  const [x, y] = choose(r, pairs);
  const den = { "a half": 2, "a third": 3, "a fourth": 4 };
  const correct = which === "smaller"
    ? (den[x] > den[y] ? x : y)
    : (den[x] < den[y] ? x : y);
  return { gen: "g2-shapes-shares", form: "Ssg2CompareSharesMcq", kind: "solverMcq",
    prompt: `Which is ${which}: ${x} or ${y}?`,
    labels: [x, y, "they're the same size"], correct,
    feedback: {
      [x]: correct === x
        ? `Correct — more pieces in the same whole means each piece is smaller, so ${x} wins "${which}".`
        : `${x} is not the ${which} one here — cutting a whole into more pieces makes each piece smaller.`,
      [y]: correct === y
        ? `Correct — the whole is fixed, so the fraction with more pieces has smaller pieces.`
        : `${y} is not the ${which} one — compare how many pieces the whole was cut into.`,
      "they're the same size": `They differ: the same whole cut into more pieces gives smaller pieces every time.`,
    } };
}
function ThirdsCountNumeric(r) {
  const thing = choose(r, ["A circle", "A ribbon", "A garden bed", "A paper strip"]);
  return { gen: "g2-shapes-shares", form: "Ssg2ThirdsCountNumeric",
    prompt: `${thing} is split into thirds. How many equal pieces are there?`, answer: 3,
    traps: traps2(3, [
      [1, `One is the whole, not the number of pieces — thirds names how many equal parts the whole becomes.`],
      [2, `Two equal parts are halves. Thirds cut the same whole into one more piece.`]]) };
}
function SetGridNumeric(r) {
  const rows = pick(r, 2, 5), cols = pick(r, 2, 5);
  const ans = rows * cols;
  return { gen: "g2-shapes-shares", form: "Ssg2GridApplyNumeric",
    prompt: `A set is arranged in ${rows} rows of ${cols} counters. How many counters in the whole set?`,
    answer: ans,
    traps: traps2(ans, [
      [rows + cols, `That added the rows to the columns; a grid holds rows GROUPS of ${cols}.`],
      [ans - cols, `That is one row short — count every row, including the last.`]]) };
}
function BuildFromUnitNumeric(r) {
  const den = choose(r, [3, 4, 6, 8]);
  const w = pick(r, 2, den - 1);
  const ans = w * 1;
  return { gen: "g4-fractions", form: "faWholeTimesFractionNumeric",
    prompt: `Compute ${w} × 1/${den} as ?/${den}. What is the numerator?`, answer: ans,
    traps: traps2(ans, [
      [den, `${den} is the DENOMINATOR — it names the piece size and never changes when you collect pieces.`],
      [w + den, `Adding the two numbers mixes a count of pieces with a piece size; only the count grows.`]]) };
}
function LikeDenomSumNumeric(r) {
  const den = choose(r, [4, 6, 8]);
  const a = pick(r, 1, den - 2);
  const b = pick(r, 1, den - 1 - a);
  const ans = a + b;
  must(a + b < den, "like-denominator sum must stay under one whole");
  return { gen: "g4-fractions", form: "faLikeDenomWordNumeric",
    prompt: `A trail is ${a}/${den} mile, then ${b}/${den} mile more. Express the total as ?/${den}. What is the numerator?`,
    answer: ans,
    traps: traps2(ans, [
      [den, `${den} names the piece size; adding same-size pieces changes only how MANY you have.`],
      [a * b, `Multiplying the counts is not joining them — ${a} pieces and ${b} more pieces make ${ans}.`]]) };
}
function EquivalentTopNumeric(r) {
  const [a, b] = choose(r, [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 6], [5, 6]]);
  const k = pick(r, 2, 4);
  const c = b * k;
  const ans = a * k;
  must(Number.isInteger(ans), "equivalent numerator must be whole");
  return { gen: "g4-fractions", form: "faEquivalenceRecapNumeric",
    prompt: `${a}/${b} = ?/${c}. What number goes on top?`, answer: ans,
    traps: traps2(ans, [
      [a, `The bottom was multiplied by ${k}, so the top must be too — otherwise the value changes.`],
      [a + k, `Equivalence SCALES both numbers; adding ${k} to the top breaks the ratio.`]]) };
}
function ScaleRuleNumeric(r) {
  const [a, b] = choose(r, [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]);
  const k = pick(r, 2, 5);
  const ans = a * k;
  return { gen: "g4-fractions", form: "faEquivalenceRuleNumeric",
    prompt: `Scale ${a}/${b} by ×${k} on top and bottom. What is the new numerator?`, answer: ans,
    traps: traps2(ans, [
      [a, `Scaling by ×${k} must reach the top as well — leaving it alone changes the fraction's value.`],
      [b * k, `That scaled the DENOMINATOR. The question asks what sits on top after the same scaling.`]]) };
}
function WholeAsFractionNumeric(r) {
  const den = choose(r, [2, 3, 4, 6, 8]);
  const wholes = pick(r, 2, 4);
  const num = den * wholes;
  return { gen: "g4-fractions", form: "faImproperToMixedNumeric",
    prompt: `Convert ${num}/${den} to a mixed number. What is the WHOLE NUMBER part?`, answer: wholes,
    traps: traps2(wholes, [
      [num, `${num} counts the PIECES. Every ${den} of them rebuild one whole, so ask how many groups of ${den} fit.`],
      [den, `${den} is the piece size, not how many wholes ${num} pieces make.`]]) };
}
function EqualToOneNumeric(r) {
  const den = choose(r, [2, 3, 4, 6, 8]);
  return { gen: "g4-fractions", form: "faImproperToMixedNumeric",
    prompt: `Convert ${den}/${den} to a mixed number. What is the WHOLE NUMBER part?`, answer: 1,
    traps: traps2(1, [
      [den, `${den} is how many PIECES there are; all ${den} of them together rebuild exactly one whole.`],
      [0, `${den}/${den} is not less than a whole — it is every piece the whole was cut into.`]]) };
}
// NOTE: faBenchmarkCompareMcq is NOT usable here — despite its name it emits an `exactNumberLab`
// surface, so a step declaring it on an mcq would fail the resolver's surface contract. The same
// comparison is taught as a variant-less authored MCQ instead.
function CompareSameWholeMcq(r) {
  const den = choose(r, [3, 4, 6, 8]);
  const a = pick(r, 1, den - 2);
  const b = pick(r, a + 1, den - 1);
  must(b > a, "compare needs a strictly larger second fraction");
  return { kind: "mcq",
    prompt: `Two identical wholes are cut into ${ORD[den]}. Which is greater, ${a}/${den} or ${b}/${den}?`,
    options: [
      { label: `${b}/${den}`, correct: true, feedback: `Correct — the pieces are the same size, so holding ${b} of them beats holding ${a}.` },
      { label: `${a}/${den}`, correct: false, feedback: `${a} pieces is fewer than ${b} pieces of the very same size, so this is the smaller amount.` },
      { label: "they are equal", correct: false, feedback: `They hold different numbers of identical ${ONE[den]}-size pieces, so they cannot be equal.` },
      { label: "there is no way to tell", correct: false, feedback: `There is: the wholes match and the pieces match, so comparing the counts settles it completely.` },
    ] };
}
function OrderThreeMcq(r) {
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
        ? `Correct — with identical ${ONE[den]}-size pieces, ordering the counts orders the fractions, and ${n} sits between ${sorted[0]} and ${sorted[2]}.`
        : n === sorted[0]
          ? `${n}/${den} holds the FEWEST pieces, so it is the least, not the middle.`
          : `${n}/${den} holds the MOST pieces, so it is the greatest, not the middle.`])) };
}
function OrderThreeDenNumeric(r) {
  const dens = [3, 4, 6];
  const fr = [[1, 3], [1, 4], [1, 6]];
  const sorted = [...fr].sort((a, b) => a[0] / a[1] - b[0] / b[1]);
  const ans = sorted[1][1];
  must(dens.length === 3 && ans === 4, "unit-fraction ordering: middle of 1/6 < 1/4 < 1/3 is 1/4");
  return { gen: "g4-fractions", form: "faBenchmarkOrderNumeric",
    prompt: `Order 1/3, 1/4, and 1/6 from least to greatest. What is the DENOMINATOR of the fraction that comes SECOND?`,
    answer: ans,
    traps: traps2(ans, [
      [6, `1/6 has the most pieces so each is smallest — it comes FIRST, not second.`],
      [3, `1/3 has the fewest pieces so each is largest — it comes LAST, not second.`]]) };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function EqualPartsMcq() {
  return { kind: "mcq",
    prompt: `A circle is cut into 3 pieces, but one piece is much larger than the others. Are these thirds?`,
    options: [
      { label: "No — thirds must be three EQUAL pieces", correct: true, feedback: `Correct — a fraction name promises equal shares; three unequal pieces have no fraction name at all.` },
      { label: "Yes — there are 3 pieces", correct: false, feedback: `Counting three pieces is not enough; the pieces must also be the same size to earn the name thirds.` },
      { label: "Yes, if you agree to call them thirds", correct: false, feedback: `Naming does not make shares fair — the pieces themselves must match in size.` },
      { label: "Only the biggest piece is a third", correct: false, feedback: `Picking the largest piece assumes size alone earns the name, but a third must be one of three MATCHING parts — and none of these match.` },
    ] };
}
function RulerHalfMcq() {
  return { kind: "mcq",
    prompt: `On a ruler marked in eighths, which mark lands exactly on 1/2?`,
    options: [
      { label: "The 4/8 mark", correct: true, feedback: `Correct — four of the eight equal jumps is half the trip, so 4/8 and 1/2 name the same point.` },
      { label: "The 2/8 mark", correct: false, feedback: `2/8 is only a quarter of the way — two jumps out of eight, not four.` },
      { label: "The 1/8 mark", correct: false, feedback: `1/8 is a single jump from zero, nowhere near the halfway point of eight jumps.` },
      { label: "There is no such mark", correct: false, feedback: `Eighths do land on a half: because 8 is even, the midpoint falls exactly on a mark.` },
    ] };
}
function SameWholeMcq() {
  return { kind: "mcq",
    prompt: `Maya eats 1/2 of a small pizza. Ben eats 1/4 of a giant pizza. Ben's piece is bigger. Does that mean 1/4 > 1/2?`,
    options: [
      { label: "No — the wholes were different sizes", correct: true, feedback: `Correct — fraction comparison assumes ONE shared whole; different wholes make the comparison meaningless.` },
      { label: "Yes — Ben's piece was bigger", correct: false, feedback: `Bigger piece, yes, but from a bigger pizza; that compares the pizzas, not the fractions.` },
      { label: "Yes — fourths are always bigger", correct: false, feedback: `Within one whole, fourths are always SMALLER than halves; more pieces means smaller pieces.` },
      { label: "There is no way to tell", correct: false, feedback: `There is: with the same whole, 1/2 is always greater than 1/4, and that is what the symbols compare.` },
    ] };
}
function StoryChoiceMcq() {
  return { kind: "mcq",
    prompt: `A ribbon is cut into 6 equal pieces and 5 are used. Which fraction names what was used?`,
    options: [
      { label: "5/6 — five of six equal pieces", correct: true, feedback: `Correct — the denominator counts the equal pieces the whole became, and the numerator counts the ones used.` },
      { label: "6/5 — six pieces, five used", correct: false, feedback: `That puts the whole on top; the piece count belongs underneath, and 6/5 would be more than one ribbon.` },
      { label: "1/6 — one piece was used", correct: false, feedback: `1/6 names a single piece, but five of them were used, not one.` },
      { label: "1/5 — five pieces", correct: false, feedback: `The ribbon was cut into SIX pieces, so sixths are the piece size no matter how many were used.` },
    ] };
}

const REUSE = { NameUnitMcq, CompareSharesMcq, ThirdsCountNumeric, SetGridNumeric,
  BuildFromUnitNumeric, LikeDenomSumNumeric, EquivalentTopNumeric, ScaleRuleNumeric,
  WholeAsFractionNumeric, EqualToOneNumeric, CompareSameWholeMcq, OrderThreeMcq, OrderThreeDenNumeric,
  EqualPartsMcq: () => EqualPartsMcq(), RulerHalfMcq: () => RulerHalfMcq(),
  SameWholeMcq: () => SameWholeMcq(), StoryChoiceMcq: () => StoryChoiceMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Name the equal pieces the whole was cut into, then count how many of them the question is about.") {
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
  w.numMin = 1; w.numMax = 12; w.denMin = 1; w.denMax = 12;
  // the slider must not OPEN on the answer: pick a start whose VALUE differs from the target's.
  // (1/1 and 6/6 are different numbers but the same value, which is what "pre-solved" means here.)
  const starts = [[1, 1], [1, 2], [1, 3], [1, 4]];
  const start = starts.find(([n, d]) => n * targetDen !== d * targetNum);
  must(start !== undefined, `fracBar ${targetNum}/${targetDen}: no start differs in value from the target`);
  w.numStart = start[0]; w.denStart = start[1];
  must(w.numStart * targetDen !== w.denStart * targetNum,
    `fracBar ${targetNum}/${targetDen} would open PRE-SOLVED at ${w.numStart}/${w.denStart}`);
  w.successFeedback = success;
  w.commonFractions = traps.filter(([n, d]) => {
    must(n >= 1 && n <= 12 && d >= 1 && d <= 12, `fracBar trap ${n}/${d} outside slider range`);
    return n * targetDen !== d * targetNum;             // never trap the target's VALUE
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
  w.successFeedback = success;
  w.commonPlacements = traps.map(([value, feedback]) => {
    must(value !== target, `nlPlace trap ${value} equals target`);
    must(value >= 0 && value <= fractionDen, `nlPlace trap ${value} off the line`);
    must(feedback.length >= 25, "nlPlace trap feedback short");
    return { value, feedback };
  });
  // the template ships low/high feedback for a DIFFERENT line; rewrite it, then prove each side
  // still has an uncovered landing, or the audit rightly calls that feedback dead.
  w.lowFeedback = low; w.highFeedback = high;
  const covered = new Set(w.commonPlacements.map((p) => p.value));
  const below = [], above = [];
  for (let v = 0; v <= fractionDen; v++) {
    if (v === target || covered.has(v)) continue;
    (v < target ? below : above).push(v);
  }
  must(below.length > 0, `nlPlace(${target}/${fractionDen}): lowFeedback is DEAD — every landing below the target is already claimed`);
  must(above.length > 0, `nlPlace(${target}/${fractionDen}): highFeedback is DEAD — every landing above the target is already claimed`);
  must(target >= 0 && target <= fractionDen, "nlPlace target on the line");
  return w;
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Cut, count, and compare equal pieces to see what ${tag.replace(/-/g, " ")} really names.`,
  invariants: [`A fraction names equal shares of ONE whole: the denominator says how many equal pieces the whole became, and the numerator counts them, which is what makes ${tag.replace(/-/g, " ")} comparable at all.`],
  misconceptions: [`Calling unequal pieces fractions, reading the denominator as a count, or comparing fractions that came from different-sized wholes.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `fractions-deeper-g3:${tag}`, delayed: true,
  counterfactualPrompt: "If the whole changed size, which of these comparisons would stop being trustworthy?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  equal: ["Equal pieces or no name.", "Count the cuts.", "Fairness is the rule."],
  unit: ["One piece of the whole.", "The bottom names the size.", "More pieces, smaller each."],
  build: ["Collect unit pieces.", "Only the count grows.", "Piece size holds still."],
  line: ["Zero to one, equal jumps.", "Count jumps, not marks.", "Land on the mark."],
  equiv: ["Scale top and bottom.", "Same point, new name.", "Value must not move."],
  cmp: ["Same whole, always.", "Same size? Count them.", "More pieces means smaller."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "A fraction only has a name when the pieces are EQUAL. Three unequal scraps are not thirds — they are just three pieces.",
  "Equal shares are the whole promise of fraction language. Break that promise and the name means nothing.",
  { rep: "concrete", widget: () => fracBar("Build a bar cut into 4 equal pieces with 1 shaded: make 1/4.", 1, 4,
      "1/4 — four equal pieces, one of them shaded. Equal pieces are what earn the name.",
      [[1, 3, "That is 1/3 — three equal pieces, not four. The denominator counts the pieces the whole became."],
       [2, 4, "2/4 shades two of the four pieces; a unit fraction shades exactly one."]]),
    predict: P("A circle is cut into 3 pieces of different sizes. Are these thirds?", [{ id: "no", label: "No — they are not equal" }, { id: "yes", label: "Yes — there are 3" }], "no",
      "Thirds means three EQUAL parts. Counting to three is not enough; the pieces must match.") },
  [
    reused("EqualPartsMcq", "g3f1-k1", H.equal, ["Equal pieces or no name.", "Counting alone is not enough."]),
    reused("ThirdsCountNumeric", "g3f1-k2", H.equal, ["Thirds means three.", "The name states the count."]),
    reused("EqualPartsMcq", "g3f1-k3", H.equal, ["Fairness makes the name.", "Unequal pieces are nameless."]),
    reused("ThirdsCountNumeric", "g3f1-ch1", H.equal, ["Any whole, same rule.", "Equal shares throughout."]),
  ],
  ["Fractions need EQUAL pieces.", "The name states the piece count.", "Unequal pieces have no fraction name."],
  "next: naming one of those pieces.");

def(2,
  "One piece of an equally-cut whole is a UNIT fraction: 1/2, 1/3, 1/4. The bottom number names how many pieces the whole became.",
  "Read the denominator as a piece SIZE, never as a count of what you have. More pieces in the same whole always means each piece is smaller.",
  { rep: "concrete", widget: () => fracBar("Build the unit fraction 1/6: one piece of a whole cut into six.", 1, 6,
      "1/6 — the whole became six equal pieces and you are holding exactly one.",
      [[1, 4, "1/4 cuts the whole into four bigger pieces. Six pieces means each is smaller."],
       [6, 6, "6/6 shades every piece — that is the whole, not one piece of it."]]),
    predict: P("Same whole, cut into 3 versus cut into 6. Which pieces are bigger?", [{ id: "three", label: "The thirds" }, { id: "six", label: "The sixths" }], "three",
      "The whole is fixed, so more cuts means smaller pieces — thirds are bigger than sixths.") },
  [
    reused("NameUnitMcq", "g3f2-k1", H.unit, ["Count the equal parts.", "The count gives the name."]),
    reused("CompareSharesMcq", "g3f2-k2", H.unit, ["More pieces, smaller each.", "The whole never changes."]),
    reused("NameUnitMcq", "g3f2-k3", H.unit, ["Halves, thirds, fourths.", "One piece each time."]),
    reused("CompareSharesMcq", "g3f2-ch1", H.unit, ["Compare the piece counts.", "Bigger bottom, smaller piece."]),
  ],
  ["One piece is a unit fraction.", "The bottom names piece size.", "More pieces, smaller each."],
  "next: collecting those pieces.");

def(3,
  "Every fraction is built from unit fractions: 3/4 is simply 1/4 and 1/4 and 1/4 — three pieces of the same size.",
  "Collecting pieces changes only how MANY you hold. The piece size, named by the denominator, stands perfectly still.",
  { rep: "concrete", widget: () => fracBar("Collect three fourths: build 3/4 from unit pieces.", 3, 4,
      "3/4 — three pieces of size one-fourth. The bottom never moved.",
      [[3, 12, "3/12 shrank the pieces as well as counting them; collecting fourths keeps fourths."],
       [1, 4, "1/4 is a single piece. Three of them were collected."]]),
    predict: P("Collecting 1/5 three times, what changes?", [{ id: "top", label: "Only the top — 3/5" }, { id: "both", label: "Both numbers" }], "top",
      "You gathered three same-size pieces: the count rises to 3 and the fifths stay fifths.") },
  [
    reused("BuildFromUnitNumeric", "g3f3-k1", H.build, ["Count the unit pieces.", "The bottom holds still."]),
    reused("LikeDenomSumNumeric", "g3f3-k2", H.build, ["Same size? Add the counts.", "Piece size unchanged."]),
    reused("BuildFromUnitNumeric", "g3f3-k3", H.build, ["Collecting is counting.", "Only the top grows."]),
    reused("LikeDenomSumNumeric", "g3f3-ch1", H.build, ["Join the counts.", "Denominator survives."]),
  ],
  ["Fractions are built from unit pieces.", "Collecting raises only the count.", "The denominator holds still."],
  "next: fractions of a group.");

def(4,
  "A fraction can share a SET as well as a shape: 12 counters split into 3 equal groups makes each group one-third of the set.",
  "The whole is now a collection, but the promise is identical — the groups must be equal before any fraction name applies.",
  { rep: "diagram", widget: () => fracBar("A set of 8 counters is split into 4 equal groups. Build the fraction one group represents.", 1, 4,
      "1/4 — four equal groups, and one of them is a fourth of the whole set.",
      [[1, 8, "1/8 would name one COUNTER out of eight, not one of the four equal groups."],
       [4, 4, "4/4 is the entire set — all four groups together."]]),
    predict: P("12 counters in 3 equal groups. What fraction of the set is one group?", [{ id: "third", label: "1/3" }, { id: "twelfth", label: "1/12" }], "third",
      "There are three equal groups, so each is one third — even though each holds four counters.") },
  [
    reused("SetGridNumeric", "g3f4-k1", H.unit, ["Rows of equal groups.", "Count the whole set."]),
    reused("CompareSharesMcq", "g3f4-k2", H.unit, ["Fewer groups, bigger share.", "The set is the whole."]),
    reused("SetGridNumeric", "g3f4-k3", H.unit, ["Groups times size.", "Every group counted."]),
    reused("StoryChoiceMcq", "g3f4-ch1", H.unit, ["Pieces below, used above.", "Read the story carefully."]),
  ],
  ["A set can be the whole.", "Equal groups earn fraction names.", "One group of n is 1/n."],
  "next: fractions along a length.");

def(5,
  "A ruler is a whole stretched into a line: cut the distance from 0 to 1 into equal jumps and every mark earns a fraction name.",
  "On an eighths ruler the marks are 1/8, 2/8, 3/8 and onward. Count JUMPS from zero, never the tick marks themselves.",
  { rep: "diagram", widget: () => nlPlace("On an EIGHTHS ruler, place the mark that sits at 1/2.", 8, 4,
      "4/8 — four of the eight equal jumps is exactly halfway, the same point as 1/2.",
      [[1, "1/8 is a single jump from 0 — one eighth of the way, not half."],
       [8, "8/8 is the far end of the ruler, a whole unit from zero."]],
      "Jumps run FORWARD from 0, so a landing behind the target is short of it — count the jumps again.",
      "That overshoots halfway — four of the eight jumps is where 1/2 sits, so stop there."),
    predict: P("On an eighths ruler, does any mark land exactly on 1/2?", [{ id: "yes", label: "Yes — the 4/8 mark" }, { id: "no", label: "No — eighths skip past it" }], "yes",
      "Eight is even, so half the jumps is a whole number of jumps: 4/8 lands precisely on 1/2.") },
  [
    reused("RulerHalfMcq", "g3f5-k1", H.line, ["Half the jumps is half the trip.", "Count jumps from zero."]),
    reused("EquivalentTopNumeric", "g3f5-k2", H.equiv, ["Same point, two names.", "Scale both numbers."]),
    reused("RulerHalfMcq", "g3f5-k3", H.line, ["Even denominators hit the half.", "Marks are named by jumps."]),
    reused("LikeDenomSumNumeric", "g3f5-ch1", H.build, ["Distances add.", "Same-size jumps combine."]),
  ],
  ["A ruler stretches the whole into a line.", "Count jumps from zero.", "Every mark has a fraction name."],
  "next: building the line yourself.");

def(6,
  "To mark thirds on a number line, cut the distance from 0 to 1 into three equal jumps — not three tick marks, three JUMPS.",
  "The most common slip is counting marks instead of spaces. Zero is a mark but not a jump; the jumps are what carry the fraction.",
  { rep: "diagram", widget: () => nlPlace("Place 2/3 on a THIRDS line: count equal jumps from 0.", 3, 2,
      "2/3 — two of the three equal jumps from zero.",
      [[1, "1/3 is one jump from zero, and the question asked for two of them."]],
      "Jumps run FORWARD from 0, so a landing behind the target is short of it — count the jumps again.",
      "That went past 2/3 — the whole trip is three jumps, and only two were asked for."),
    predict: P("Cutting 0 to 1 into thirds, how many JUMPS are there?", [{ id: "three", label: "3 jumps" }, { id: "four", label: "4 — counting both ends" }], "three",
      "Four marks bound three spaces. Fractions are named by the spaces you travel, not the posts you pass.") },
  [
    reused("ThirdsCountNumeric", "g3f6-k1", H.line, ["Thirds means three jumps.", "Spaces, not posts."]),
    reused("EquivalentTopNumeric", "g3f6-k2", H.equiv, ["Same point, new name.", "Scale both numbers."]),
    reused("ThirdsCountNumeric", "g3f6-k3", H.line, ["The name gives the count.", "Equal jumps throughout."]),
    reused("BuildFromUnitNumeric", "g3f6-ch1", H.build, ["Jumps collect.", "Only the count grows."]),
  ],
  ["Cut 0 to 1 into equal jumps.", "Count spaces, not marks.", "Thirds means three jumps."],
  "next: finer cuts.");

def(7,
  "Sixths and eighths cut the same journey into more, smaller jumps — and the more jumps there are, the shorter each one becomes.",
  "This is why 1/8 is less than 1/6 even though 8 is more than 6: the bigger bottom number means the whole was shared further.",
  { rep: "diagram", widget: () => nlPlace("Place 3/6 on a SIXTHS line.", 6, 3,
      "3/6 — three of six jumps, which is also exactly one half.",
      [[2, "2/6 is one jump short of halfway on a sixths line."],
       [6, "6/6 is the whole trip, landing on 1."]],
      "Jumps run FORWARD from 0, so a landing behind the target is short of it — count the jumps again.",
      "That is past the halfway mark — three of the six jumps is where 3/6 lands."),
    predict: P("Which jump is longer, 1/6 or 1/8?", [{ id: "six", label: "1/6" }, { id: "eight", label: "1/8" }], "six",
      "Eight jumps must fit in the same distance as six, so each eighth is shorter than each sixth.") },
  [
    reused("CompareSharesMcq", "g3f7-k1", H.cmp, ["Bigger bottom, smaller jump.", "The trip is fixed."]),
    reused("EquivalentTopNumeric", "g3f7-k2", H.equiv, ["Finer cuts, same points.", "Scale to compare."]),
    reused("LikeDenomSumNumeric", "g3f7-k3", H.build, ["Same-size jumps add.", "Count them up."]),
    reused("CompareSharesMcq", "g3f7-ch1", H.cmp, ["More pieces, smaller each.", "Always one whole."]),
  ],
  ["More jumps, shorter jumps.", "Bigger bottom means smaller pieces.", "The journey stays the same."],
  "next: two names for one point.");

def(8,
  "Different fractions can name the SAME amount. Fold a halves strip once more and 1/2 becomes 2/4 — new numbers, identical length.",
  "Scaling top and bottom by the same factor is what keeps the value still: you are renaming the pieces, not changing how much you hold.",
  { rep: "concrete", widget: () => fracBar("Find a fraction equal to 1/2 using fourths: build it.", 2, 4,
      "2/4 — twice as many pieces, each half as big, and the shaded length has not moved at all.",
      [[1, 4, "1/4 is only half as much as 1/2; renaming must keep the length identical."],
       [3, 4, "3/4 overshoots past a half — the shaded part grew instead of being renamed."]]),
    predict: P("Cutting every piece of 1/2 in two, what happens to the shaded length?", [{ id: "same", label: "It stays the same" }, { id: "double", label: "It doubles" }], "same",
      "More cuts create more, smaller pieces — you hold twice as many of half-sized pieces, so the length is unchanged.") },
  [
    reused("ScaleRuleNumeric", "g3f8-k1", H.equiv, ["Scale both numbers.", "Value must not move."]),
    reused("EquivalentTopNumeric", "g3f8-k2", H.equiv, ["Bottom scaled, so top too.", "Same amount, new name."]),
    reused("ScaleRuleNumeric", "g3f8-k3", H.equiv, ["The factor applies twice.", "Top and bottom together."]),
    reused("EquivalentTopNumeric", "g3f8-ch1", H.equiv, ["Renaming, not resizing.", "Check the length."]),
  ],
  ["Different names, same amount.", "Scale top and bottom together.", "Renaming never changes the value."],
  "next: equivalence on the line.");

def(9,
  "On a number line, equivalent fractions land on the very same POINT. 1/2 and 2/4 and 4/8 are one location wearing three names.",
  "That shared point is the proof: if two fractions land together, they are equal, no matter how different the numbers look.",
  { rep: "diagram", widget: () => nlPlace("On a FOURTHS line, place the mark that also names 1/2.", 4, 2,
      "2/4 — two of four jumps, the same point 1/2 occupies.",
      [[1, "1/4 is one jump — half as far as the halfway point."],
       [4, "4/4 is the whole trip, landing on 1."]],
      "Jumps run FORWARD from 0, so a landing behind the target is short of it — count the jumps again.",
      "That is beyond the halfway point — two of the four jumps is where 1/2 sits."),
    predict: P("Where does 2/4 sit compared with 1/2?", [{ id: "same", label: "Exactly on top of it" }, { id: "right", label: "To its right" }], "same",
      "Two of four jumps covers the same distance as one of two — one point, two names.") },
  [
    reused("EquivalentTopNumeric", "g3f9-k1", H.equiv, ["Same point, two names.", "Scale to match."]),
    reused("ScaleRuleNumeric", "g3f9-k2", H.equiv, ["The factor hits both.", "Location unchanged."]),
    reused("EquivalentTopNumeric", "g3f9-k3", H.equiv, ["Landing together means equal.", "The line is the proof."]),
    reused("RulerHalfMcq", "g3f9-ch1", H.line, ["Even bottoms reach the half.", "Count the jumps."]),
  ],
  ["Equivalents share one point.", "Same landing means equal.", "The line proves equality."],
  "next: whole numbers wearing fraction clothes.");

def(10,
  "Whole numbers are fractions too: 8/4 means eight fourths, and every four of them rebuild one whole, so 8/4 is exactly 2.",
  "Ask how many groups of the denominator fit inside the numerator — that count is the whole number hiding in the fraction.",
  { rep: "concrete", widget: () => fracBar("Build 6/3 and see how many wholes it makes.", 6, 3,
      "6/3 — six thirds, and every three of them make a whole, so this is exactly 2.",
      [[1, 3, "1/3 is a single piece; six of them were asked for."],
       [3, 6, "3/6 is half of one whole — the numbers were swapped."]]),
    predict: P("How many wholes does 8/4 make?", [{ id: "two", label: "2" }, { id: "eight", label: "8" }], "two",
      "Four fourths rebuild one whole, and eight fourths contain two such groups.") },
  [
    reused("WholeAsFractionNumeric", "g3f10-k1", H.build, ["Group by the denominator.", "Each group is a whole."]),
    reused("WholeAsFractionNumeric", "g3f10-k2", H.build, ["How many fit inside?", "That count is the whole."]),
    reused("BuildFromUnitNumeric", "g3f10-k3", H.build, ["Pieces collect into wholes.", "Size stays fixed."]),
    reused("WholeAsFractionNumeric", "g3f10-ch1", H.build, ["Bigger numerators, same rule.", "Count the full groups."]),
  ],
  ["Whole numbers can be written as fractions.", "Group by the denominator.", "Each full group is one whole."],
  "next: the fraction that equals one.");

def(11,
  "When the numerator matches the denominator, you are holding every piece the whole was cut into — so 5/5, 8/8, and 3/3 all equal 1.",
  "This is the tidiest test in fractions: same number on top and bottom means exactly one whole, no matter how fine the cuts.",
  { rep: "concrete", widget: () => fracBar("Build a fraction that equals exactly one whole using sixths.", 6, 6,
      "6/6 — every one of the six pieces, which together are the whole.",
      [[5, 6, "5/6 leaves one piece unshaded — just short of the whole."],
       [1, 6, "1/6 is a single piece of six, far from the complete whole."]]),
    predict: P("What does 7/7 equal?", [{ id: "one", label: "1" }, { id: "seven", label: "7" }], "one",
      "Seven of the seven pieces is all of them — the whole, rebuilt exactly.") },
  [
    reused("EqualToOneNumeric", "g3f11-k1", H.build, ["Top matches bottom.", "All pieces present."]),
    reused("EqualToOneNumeric", "g3f11-k2", H.build, ["Every piece, one whole.", "Fineness does not matter."]),
    reused("WholeAsFractionNumeric", "g3f11-k3", H.build, ["Count the full groups.", "Each rebuilds a whole."]),
    reused("EqualToOneNumeric", "g3f11-ch1", H.build, ["Any denominator, same result.", "Matching means one."]),
  ],
  ["Matching top and bottom equals one.", "You hold every piece.", "Cut fineness does not matter."],
  "next: comparing fairly.");

def(12,
  "Comparing fractions demands ONE shared whole. Half a small pizza against a quarter of a giant one compares the pizzas, not the fractions.",
  "Once the whole is fixed and the pieces are the same size, comparison is just counting: more pieces means more.",
  { rep: "concrete", widget: () => fracBar("Both wholes are the same size. Build the greater of 3/8 and 5/8.", 5, 8,
      "5/8 — five identical eighth-pieces beat three of them, because the whole is shared.",
      [[3, 8, "3/8 holds fewer of the very same pieces, so it is the smaller amount."],
       [8, 8, "8/8 is the entire whole, which was not one of the two fractions offered."]]),
    predict: P("Ben's 1/4 slice is bigger than Maya's 1/2 slice. Is 1/4 > 1/2?", [{ id: "no", label: "No — different wholes" }, { id: "yes", label: "Yes — bigger slice" }], "no",
      "His pizza was larger. Fraction comparison only means something when both fractions share one whole.") },
  [
    reused("SameWholeMcq", "g3f12-k1", H.cmp, ["One shared whole.", "Otherwise it is meaningless."]),
    reused("CompareSameWholeMcq", "g3f12-k2", H.cmp, ["Same size? Count them.", "More pieces means more."]),
    reused("SameWholeMcq", "g3f12-k3", H.cmp, ["Different wholes, no verdict.", "Fix the whole first."]),
    reused("CompareSameWholeMcq", "g3f12-ch1", H.cmp, ["Counting settles it.", "Given equal pieces."]),
  ],
  ["Comparison needs one shared whole.", "Equal pieces make counting fair.", "Different wholes prove nothing."],
  "next: putting three in order.");

def(13,
  "With a shared denominator, ordering three fractions is ordering three counts — the pieces are identical, so only the tally differs.",
  "With a shared NUMERATOR the logic flips: 1/3 beats 1/4 beats 1/6, because a bigger bottom means the whole was shared further.",
  { rep: "concrete", widget: () => fracBar("Build the largest unit fraction among 1/3, 1/4, and 1/6.", 1, 3,
      "1/3 — the fewest pieces means the biggest piece.",
      [[1, 6, "1/6 splits the whole into the most pieces, so its piece is the smallest of the three."],
       [1, 4, "1/4 sits between; thirds are cut fewer times and stay larger."]]),
    predict: P("Order 1/3, 1/4, 1/6 from least to greatest. Which is least?", [{ id: "sixth", label: "1/6" }, { id: "third", label: "1/3" }], "sixth",
      "Six pieces in one whole are the smallest pieces here, so 1/6 is the least.") },
  [
    reused("OrderThreeMcq", "g3f13-k1", H.cmp, ["Same bottom? Order the tops.", "Identical pieces."]),
    reused("OrderThreeDenNumeric", "g3f13-k2", H.cmp, ["Same top? Bigger bottom is smaller.", "Fewer cuts, bigger piece."]),
    reused("OrderThreeMcq", "g3f13-k3", H.cmp, ["The middle count wins.", "Sort, then read."]),
    reused("CompareSameWholeMcq", "g3f13-ch1", H.cmp, ["Counting decides.", "Given one whole."]),
  ],
  ["Same denominator: order the counts.", "Same numerator: bigger bottom is smaller.", "One whole throughout."],
  "next: fractions inside stories.");

def(14,
  "Stories name the whole and the pieces in words: read for how many EQUAL pieces the whole became, then how many the story is about.",
  "The denominator is always the cut, and the numerator is always the count — no matter how the sentence is arranged.",
  { rep: "concrete", widget: () => fracBar("A ribbon is cut into 6 equal pieces and 5 are used. Build the fraction used.", 5, 6,
      "5/6 — six equal pieces made, five of them used.",
      [[6, 5, "That flipped the numbers: sixths are the piece size, so 6 belongs underneath."],
       [1, 6, "1/6 names a single piece, but five pieces were used."]]),
    predict: P("A ribbon in 6 equal pieces, 5 used. Which number goes on the bottom?", [{ id: "six", label: "6 — the pieces made" }, { id: "five", label: "5 — the pieces used" }], "six",
      "The bottom always names how many equal pieces the whole became; the top counts the ones in question.") },
  [
    reused("StoryChoiceMcq", "g3f14-k1", H.equal, ["Pieces made go below.", "Pieces used go above."]),
    reused("LikeDenomSumNumeric", "g3f14-k2", H.build, ["Same-size pieces join.", "Add the counts."]),
    reused("StoryChoiceMcq", "g3f14-k3", H.equal, ["Read for the cut.", "Then read for the count."]),
    reused("WholeAsFractionNumeric", "g3f14-ch1", H.build, ["Stories can pass one whole.", "Group by the denominator."]),
  ],
  ["The cut goes on the bottom.", "The count goes on top.", "Read the story for both."],
  "course complete: cut, named, built, placed, renamed, and compared.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 14, `14 lessons defined, got ${L.length}`);
const chapterTitles = ["Equal Shares and Unit Fractions", "Fractions on the Number Line", "Equivalence and Comparison"];
const perChapter = [5, 5, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 5 ? 1 : n <= 10 ? 2 : 3);
const outDir = join(root, "content/courses/fractions-deeper-g3");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g3f-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "concrete") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "fractions-deeper-g3",
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
      if (f === "faEquivalenceRecapNumeric") {
        const m = w.prompt.match(/(\d+)\/(\d+) = \?\/(\d+)/);
        must(m && (+m[1] * +m[3]) % +m[2] === 0 && (+m[1] * +m[3]) / +m[2] === w.answer,
          `${id}/${s.id} equivalence must scale to a whole numerator`);
      }
      if (f === "faWholeTimesFractionNumeric") {
        must(/^Compute \d+ × \d+\/\d+/.test(w.prompt), `${id}/${s.id} faWholeTimesFraction needs the Compute shape`);
      }
      if (f === "faImproperToMixedNumeric") {
        const m = w.prompt.match(/Convert (\d+)\/(\d+)/);
        must(m && Math.floor(+m[1] / +m[2]) === w.answer, `${id}/${s.id} improper-to-mixed whole part`);
      }
      if (f === "faLikeDenomWordNumeric") {
        must(!w.prompt.includes("were available"), `${id}/${s.id} "were available" would flip the route to subtraction`);
      }
      if (f === "Ssg2ThirdsCountNumeric") must(w.answer === 3, `${id}/${s.id} thirds count is always 3`);
    }
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 3, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
    }
    if (w.type === "fractionBar") {
      for (const t of w.commonFractions)
        must(t.num * w.targetDen !== t.den * w.targetNum, `${id}/${s.id} fractionBar trap equals target value`);
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
  id: "fractions-deeper-g3", slug: "fractions-deeper-g3", title: spec.title,
  tagline: "Equal shares, named and placed — fractions you can build, locate, rename, and compare.",
  category: "Math", gradeLevel: 3, chapters,
}, null, 2) + "\n");
console.log(`built 14 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
