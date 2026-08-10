#!/usr/bin/env node
// S197 — Batch F course 2/6: unlike-fractions-g5 (5.NF.A.1, 5.NF.A.2). Zero new generator code.
//
// Family: g4-fractions (computational solver g4Independent.cjs). Routes probed before authoring:
//   faEquivalenceRecapNumeric  "A/B = ?/C. What number goes on top?"  -> A*C/B (must divide)
//   faEquivalenceRuleNumeric   "Scale A/B by ×K…"                     -> A*K
//   faSimplifyNumeric          first fraction in the prompt           -> num/gcd(num,den)
//   faLikeDenomWordNumeric     two like fractions                     -> a.num + b.num
//                              …UNLESS the prompt contains "were available", which flips the
//                              route to a.num − b.num. That phrase is the ONLY thing separating
//                              addition from subtraction, so it is asserted per step in both the
//                              factory and the session test: deleting it during a prose edit would
//                              silently turn a subtraction lesson into an addition one.
//   faMixedToImproperNumeric   "Convert W N/D to an improper fraction…" -> W*D+N
//   faImproperToMixedNumeric   "Convert N/D to a mixed number… WHOLE NUMBER part?" -> floor(N/D)
//   faMixedAddSubNumeric       "Add W1 N1/D + W2 N2/D…"               -> (N1+N2) % D   (ADD only)
//   faBenchmarkOrderMcq        three like fractions, labels "n/d"     -> the MIDDLE
//   faLikeDenomWordMcq         -> the option starting "It stays "
// fractionBar sliders run 1..12, so every target and trap must sit inside that range.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "unlike-fractions-g5");
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
const MANY = { 2: "halves", 3: "thirds", 4: "fourths", 5: "fifths", 6: "sixths", 8: "eighths", 10: "tenths", 12: "twelfths" };

function traps2(answer, cands) {
  const out = [];
  for (const [v, fb] of cands) {
    if (v !== answer && v >= 0 && Number.isInteger(v) && !out.some((o) => o[0] === v)) out.push([v, fb]);
    if (out.length === 2) break;
  }
  for (let d = 3; out.length < 2; d++) {
    const v = answer + d;
    if (!out.some((o) => o[0] === v)) {
      out.push([v, "That count of pieces does not follow once both fractions wear the same denominator."]);
    }
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

// pairs whose LCD is a clean common multiple, all inside the 1..12 fractionBar sliders
const PAIRS = [[1, 2, 1, 3, 6], [1, 3, 1, 4, 12], [1, 2, 1, 4, 4], [1, 3, 1, 6, 6],
               [1, 4, 1, 6, 12], [1, 2, 1, 6, 6], [2, 3, 1, 6, 6], [3, 4, 1, 12, 12]];

/* ---------------- graded mirrors ---------------- */
function CommonDenomNumeric(r) {
  const [a, b, , , lcd] = choose(r, PAIRS);
  const ans = (a * lcd) / b;
  must(Number.isInteger(ans), "renamed numerator must be whole");
  return { gen: "g4-fractions", form: "faEquivalenceRecapNumeric",
    prompt: `${a}/${b} = ?/${lcd}. What number goes on top?`, answer: ans,
    traps: traps2(ans, [
      [a, `The bottom was multiplied to reach ${lcd}, so the top must be multiplied by the same factor.`],
      [lcd - b, `That subtracted the denominators. Renaming SCALES both parts; it never subtracts.`]]) };
}
function ScaleBothNumeric(r) {
  const [a, b] = choose(r, [[1, 2], [2, 3], [1, 4], [3, 4], [1, 6], [5, 6]]);
  const k = pick(r, 2, 4);
  return { gen: "g4-fractions", form: "faEquivalenceRuleNumeric",
    prompt: `Scale ${a}/${b} by ×${k} on top and bottom. What is the new numerator?`, answer: a * k,
    traps: traps2(a * k, [
      [a, `Scaling by ×${k} has to reach the top as well, or the fraction's value changes.`],
      [b * k, `That scaled the DENOMINATOR; the question asks what sits on top afterwards.`]]) };
}
function AddUnlikeNumeric(r) {
  const [, , , , lcd] = choose(r, PAIRS);
  const den = lcd;
  const a = pick(r, 1, den - 2);
  const b = pick(r, 1, den - 1 - a);
  must(a + b < den, "renamed sum stays under one whole");
  return { gen: "g4-fractions", form: "faLikeDenomWordNumeric",
    prompt: `Once renamed, a jug holds ${a}/${den} litre and then ${b}/${den} litre more. Express the total as ?/${den}. What is the numerator?`,
    answer: a + b,
    traps: traps2(a + b, [
      [den, `${den} names the piece size; once the pieces match, only the COUNT of them changes.`],
      [a * b, `Multiplying the counts is not joining them — ${a} pieces and ${b} more make ${a + b}.`]]) };
}
function SubUnlikeNumeric(r) {
  const [, , , , lcd] = choose(r, PAIRS);
  const den = lcd;
  const a = pick(r, 4, den);
  const b = pick(r, 1, a - 1);
  must(a > b, "subtraction must leave a positive remainder");
  // "were available" is the ONLY thing that routes this to subtraction
  return { gen: "g4-fractions", form: "faLikeDenomWordNumeric",
    prompt: `Once renamed, ${a}/${den} litre were available and ${b}/${den} litre was poured out. Express what is left as ?/${den}. What is the numerator?`,
    answer: a - b,
    traps: traps2(a - b, [
      [a + b, `That joined the two amounts; pouring out removes pieces rather than adding them.`],
      [den, `${den} names the piece size, which never changes — only how many are left.`]]) };
}
function MixedAddNumeric(r) {
  const den = choose(r, [6, 8, 12]);
  const n1 = pick(r, 1, Math.floor(den / 2) - 1);
  const n2 = pick(r, 1, den - 1 - n1);
  const w1 = pick(r, 1, 4), w2 = pick(r, 1, 4);
  must(n1 + n2 < den, "mixed sum's fraction part must stay proper");
  return { gen: "g4-fractions", form: "faMixedAddSubNumeric",
    prompt: `Add ${w1} ${n1}/${den} + ${w2} ${n2}/${den}. What is the numerator of the fraction part?`,
    answer: (n1 + n2) % den,
    traps: traps2((n1 + n2) % den, [
      [w1 + w2, `That added the WHOLE numbers; the question asks about the fraction part.`],
      [den, `${den} is the piece size, not a count of pieces.`]]) };
}
function ToImproperNumeric(r) {
  const den = choose(r, [4, 6, 8, 12]);
  const whole = pick(r, 2, 5);
  const num = pick(r, 1, den - 1);
  return { gen: "g4-fractions", form: "faMixedToImproperNumeric",
    prompt: `Convert ${whole} ${num}/${den} to an improper fraction. What is the new numerator (over ${den})?`,
    answer: whole * den + num,
    traps: traps2(whole * den + num, [
      [whole + num, `That added the whole to the numerator; each whole is worth ${den} pieces, not one.`],
      [whole * den, `That converted the wholes but dropped the ${num} pieces already in hand.`]]) };
}
function WholePartNumeric(r) {
  const den = choose(r, [4, 5, 6, 8]);
  const wholes = pick(r, 2, 4);
  const extra = pick(r, 1, den - 1);
  const num = den * wholes + extra;
  return { gen: "g4-fractions", form: "faImproperToMixedNumeric",
    prompt: `Convert ${num}/${den} to a mixed number. What is the WHOLE NUMBER part?`, answer: wholes,
    traps: traps2(wholes, [
      [num, `${num} counts the PIECES; every ${den} of them rebuild one whole.`],
      [wholes + 1, `The leftover ${extra} ${MANY[den]} fall short of the ${den} needed for another whole.`]]) };
}
function SimplifyNumeric(r) {
  // Explicit table: every entry already satisfies num,den <= 12, so the fractionBar sliders can
  // reach it. Generating base x factor overflowed (5/6 x 3 = 15/18) and the assertion caught it.
  const [num, den] = choose(r, [[2, 4], [3, 6], [4, 8], [4, 6], [6, 9], [8, 12],
                                [6, 8], [9, 12], [2, 6], [3, 9], [4, 12], [10, 12]]);
  must(num <= 12 && den <= 12, "simplify stays inside the fractionBar range");
  must(gcd(num, den) > 1, "simplify needs a shared factor to remove");
  const d = gcd(num, den);
  return { gen: "g4-fractions", form: "faSimplifyNumeric",
    prompt: `Simplify ${num}/${den} by dividing both by ${d}. What is the simplified numerator (top)?`,
    answer: num / d,
    traps: traps2(num / d, [
      [num, `That left the fraction unsimplified — dividing both parts by ${d} shrinks the numbers, not the value.`],
      [den / d, `That reported the simplified DENOMINATOR; the question asks for the top.`]]) };
}
function OrderMcq(r) {
  const den = choose(r, [6, 8, 12]);
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
        ? `Correct — the pieces are identical ${MANY[den]}, so ordering the counts orders the fractions.`
        : n === sorted[0]
          ? `${n}/${den} holds the FEWEST of these identical pieces, so it is the least, not the middle.`
          : `${n}/${den} holds the MOST of these identical pieces, so it is the greatest, not the middle.`])) };
}
function DenominatorHoldsMcq(r) {
  const den = choose(r, [6, 8, 12]);
  const a = pick(r, 1, den - 2), b = pick(r, 1, den - 1 - a);
  const correct = `It stays ${den} because the piece size never changes`;
  return { gen: "g4-fractions", form: "faLikeDenomWordMcq", kind: "solverMcq",
    prompt: `When you add ${a}/${den} + ${b}/${den}, what happens to the denominator?`,
    labels: [correct, `It becomes ${den * 2}`, `It becomes ${a + b}`, "It disappears"],
    correct,
    feedback: {
      [correct]: `Correct — adding counts how many same-size pieces you hold; it never re-cuts them.`,
      [`It becomes ${den * 2}`]: `Doubling the denominator would halve every piece, changing the amount instead of counting it.`,
      [`It becomes ${a + b}`]: `That is the numerator of the answer — the count of pieces, not their size.`,
      "It disappears": `Without a denominator the pieces have no size, and the answer would name nothing.`,
    } };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function WhyCommonMcq() {
  return { kind: "mcq",
    prompt: `Why can 1/2 + 1/3 not be added by adding the tops and the bottoms?`,
    options: [
      { label: "Because halves and thirds are different-sized pieces", correct: true, feedback: `Correct — adding counts only works when every piece is the same size, which is what renaming achieves.` },
      { label: "Because 2/5 is too small to be right", correct: false, feedback: `The answer being wrong is the symptom; the cause is that the pieces were never made the same size.` },
      { label: "Because you must always simplify first", correct: false, feedback: `1/2 and 1/3 are already in lowest terms; simplifying changes nothing here.` },
      { label: "You can — 2/5 is correct", correct: false, feedback: `1/2 alone is already more than 2/5, so a sum that lands below one of its parts cannot be right.` },
    ] };
}
function LcdMcq() {
  return { kind: "mcq",
    prompt: `For 1/4 + 1/6, both 24 and 12 are common denominators. Why prefer 12?`,
    options: [
      { label: "It is the least one, so the numbers stay smallest", correct: true, feedback: `Correct — any common multiple works, but the least keeps the arithmetic and the simplifying lightest.` },
      { label: "24 is not actually a common denominator", correct: false, feedback: `24 is a genuine common multiple of 4 and 6; it is simply larger than it needs to be.` },
      { label: "Because 12 is even", correct: false, feedback: `24 is even too — being least is what matters, not parity.` },
      { label: "Only the least common denominator gives a correct answer", correct: false, feedback: `Both give correct answers; 24 just needs more simplifying at the end.` },
    ] };
}
function RegroupMcq() {
  return { kind: "mcq",
    prompt: `Subtracting 4 1/8 − 1 5/8, the fraction parts give 1/8 − 5/8. What is the legal move?`,
    options: [
      { label: "Trade one whole from the 4 for 8/8, making it 3 9/8", correct: true, feedback: `Correct — one whole is eight eighths, so 9/8 − 5/8 = 4/8 and the wholes become 3 − 1.` },
      { label: "Compute 5/8 − 1/8 instead", correct: false, feedback: `Flipping the subtraction answers a different question, exactly as it would with whole numbers.` },
      { label: "Say the answer has no fraction part", correct: false, feedback: `There is a fraction part; it just needs a trade before it can be found.` },
      { label: "Add the fractions instead", correct: false, feedback: `The problem subtracts. Trading makes the subtraction possible without changing it.` },
    ] };
}
function ReasonableMcq() {
  return { kind: "mcq",
    prompt: `A student computes 1/2 + 1/3 and gets 5/6. Is that reasonable?`,
    options: [
      { label: "Yes — it is under 1 but bigger than either part", correct: true, feedback: `Correct — both fractions are under a half and a half, so the sum must sit between 1/2 and 1.` },
      { label: "No — a sum must always pass 1", correct: false, feedback: `Two fractions each below one whole need not reach one; 1/2 + 1/3 falls short of it.` },
      { label: "No — the answer should be 2/5", correct: false, feedback: `2/5 is less than 1/2, and a sum can never be smaller than one of the parts being added.` },
      { label: "There is no way to judge", correct: false, feedback: `There is: comparing the answer to each part and to one whole rules out most wrong answers instantly.` },
    ] };
}
function BenchmarkMcq() {
  return { kind: "mcq",
    prompt: `Estimating 7/8 + 1/12 with benchmarks, which is closest?`,
    options: [
      { label: "About 1, since 7/8 is nearly 1 and 1/12 is nearly 0", correct: true, feedback: `Correct — rounding each fraction to 0, 1/2 or 1 gives a fast and dependable neighbourhood.` },
      { label: "About 2, since both are fractions", correct: false, feedback: `Both are under one whole, so their sum cannot approach two.` },
      { label: "About 1/2", correct: false, feedback: `7/8 alone already passes a half, so the total must sit well above it.` },
      { label: "About 8/20, by adding tops and bottoms", correct: false, feedback: `Adding across is not addition of fractions, and 8/20 is smaller than 7/8 alone.` },
    ] };
}
function MultiStepMcq() {
  return { kind: "mcq",
    prompt: `"A jug holds 3/4 litre. 1/3 litre is poured out, then 1/6 litre is added." What is the plan?`,
    options: [
      { label: "Rename all three to twelfths, then subtract and add in order", correct: true, feedback: `Correct — one shared denominator makes every step a count, and the story's order is preserved.` },
      { label: "Add all three fractions", correct: false, feedback: `Pouring out removes liquid, so that step must subtract.` },
      { label: "Subtract all three", correct: false, feedback: `The last step adds liquid back, so it cannot subtract.` },
      { label: "Work in fourths, since the jug holds 3/4", correct: false, feedback: `Thirds and sixths do not fit into fourths; twelfths is the denominator all three share.` },
    ] };
}

const REUSE = { CommonDenomNumeric, ScaleBothNumeric, AddUnlikeNumeric, SubUnlikeNumeric,
  MixedAddNumeric, ToImproperNumeric, WholePartNumeric, SimplifyNumeric, OrderMcq, DenominatorHoldsMcq,
  WhyCommonMcq: () => WhyCommonMcq(), LcdMcq: () => LcdMcq(), RegroupMcq: () => RegroupMcq(),
  ReasonableMcq: () => ReasonableMcq(), BenchmarkMcq: () => BenchmarkMcq(),
  MultiStepMcq: () => MultiStepMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Give both fractions the same piece size first; after that the pieces simply count.") {
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
  // the phrase-triggered branch: assert the direction the prompt actually asks for
  if (out.form === "faLikeDenomWordNumeric") {
    const nums = (out.prompt.match(/(\d+)\/(\d+)/g) || []).map((x) => Number(x.split("/")[0]));
    const subtracting = out.prompt.includes("were available");
    must(subtracting ? nums[0] - nums[1] === out.answer : nums[0] + nums[1] === out.answer,
      `${mirror}: "were available" flips this route to subtraction — prompt and answer disagree`);
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
    return n * targetDen !== d * targetNum;          // never trap the target's VALUE
  }).map(([num, den, feedback]) => {
    must(feedback.length >= 25, "fracBar trap feedback short");
    return { num, den, feedback };
  });
  must(w.commonFractions.length >= 1, "fracBar needs a diagnosable wrong build");
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
  actionGoal: `Rename both fractions to the same piece size, then count the pieces for ${tag.replace(/-/g, " ")}.`,
  invariants: [`Fractions add and subtract only when their pieces are the same size: renaming scales both parts of a fraction and leaves its value untouched, which is what makes ${tag.replace(/-/g, " ")} a counting problem once the denominators agree.`],
  misconceptions: [`Adding numerators and denominators across, scaling only one part of a fraction when renaming, or forgetting to trade a whole when the top fraction is too small to subtract from.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `unlike-fractions-g5:${tag}`, delayed: true,
  counterfactualPrompt: "If only the numerators were made equal instead of the denominators, what would go wrong?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  same: ["Pieces must match.", "Rename before adding.", "Value stays put."],
  rename: ["Scale top and bottom.", "The same factor for both.", "Equivalent, not different."],
  count: ["Same size? Count them.", "The denominator holds.", "Only the top moves."],
  mixed: ["Wholes and parts separately.", "Trade when the top is short.", "One whole is b pieces."],
  est: ["Round to 0, 1/2 or 1.", "Compare to the parts.", "A sum passes each part."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Fractions add by counting pieces — but only when the pieces are the same size. Halves and thirds cannot be counted together any more than metres and inches can.",
  "This is why 1/2 + 1/3 is not 2/5. Adding across ignores the piece sizes entirely, and produces an answer smaller than one of the parts.",
  { rep: "concrete", widget: () => fracBar("Rename 1/2 as sixths so it can meet 1/3.", 3, 6,
      "3/6 — the same amount as 1/2, now cut into pieces that thirds can be counted with.",
      [[1, 6, "1/6 is one sixth-piece; a half needs three of them to hold the same amount."],
       [2, 5, "2/5 is what adding across gives, and it is smaller than the 1/2 you started with."]]),
    predict: P("Can 1/2 and 1/3 be added by counting, as they stand?", [{ id: "no", label: "No — different piece sizes" }, { id: "yes", label: "Yes" }], "no",
      "A half and a third are different-sized pieces, so there is nothing common to count until both are renamed.") },
  [
    reused("WhyCommonMcq", "g5u1-k1", H.same, ["Pieces must match.", "Then count them."]),
    reused("CommonDenomNumeric", "g5u1-k2", H.rename, ["Scale to the shared size.", "Both parts."]),
    reused("WhyCommonMcq", "g5u1-k3", H.same, ["Adding across is not addition.", "Sizes matter."]),
    reused("CommonDenomNumeric", "g5u1-ch1", H.rename, ["Any pair, same demand.", "Match the pieces."]),
  ],
  ["Fractions add by counting pieces.", "The pieces must be the same size.", "Adding across ignores size."],
  "next: finding a size they share.");

def(2,
  "A common denominator is a piece size both fractions can be cut into. Any shared multiple of the two denominators will do.",
  "Renaming does not change either fraction — it re-cuts the same amount into finer pieces, which is exactly what scaling top and bottom accomplishes.",
  { rep: "concrete", widget: () => fracBar("Rename 1/3 as twelfths.", 4, 12,
      "4/12 — the same third, now cut into twelfths so it can meet fourths and sixths.",
      [[1, 12, "1/12 is a single twelfth; a third holds four of them."],
       [3, 12, "3/12 is a quarter, not a third — check what 12 ÷ 3 gives."]]),
    predict: P("Renaming 1/3 as twelfths, does the amount change?", [{ id: "no", label: "No — same amount" }, { id: "yes", label: "Yes — it grows" }], "no",
      "Four twelfths cover exactly the ground one third covers; only the cut is finer.") },
  [
    reused("CommonDenomNumeric", "g5u2-k1", H.rename, ["Multiply to reach the shared size.", "Top too."]),
    reused("ScaleBothNumeric", "g5u2-k2", H.rename, ["Same factor, both parts.", "Value unchanged."]),
    reused("CommonDenomNumeric", "g5u2-k3", H.rename, ["Any common multiple works.", "Rename both."]),
    reused("ScaleBothNumeric", "g5u2-ch1", H.rename, ["Bigger factors, same rule.", "Scale together."]),
  ],
  ["A common denominator is a shared piece size.", "Renaming re-cuts, never resizes.", "Scale both parts alike."],
  "next: picking the best one.");

def(3,
  "Any common multiple works, but the LEAST one keeps the numbers smallest and the simplifying lightest.",
  "For fourths and sixths, both 24 and 12 are shared sizes. Twelve is the least, so it is the one worth choosing.",
  { rep: "concrete", widget: () => fracBar("Rename 1/4 into the LEAST size it shares with sixths.", 3, 12,
      "3/12 — twelfths is the least common denominator of fourths and sixths.",
      [[1, 12, "A single twelfth is far short of a quarter — 12 ÷ 4 says how many twelfths one fourth holds."],
       [4, 12, "4/12 is a third, not a fourth; check what 12 ÷ 4 gives."]]),
    predict: P("For 1/4 + 1/6, is 24 wrong as a denominator?", [{ id: "works", label: "It works, but 12 is smaller" }, { id: "wrong", label: "Yes — it is wrong" }], "works",
      "24 gives a correct answer; it just leaves bigger numbers and more simplifying at the end.") },
  [
    reused("LcdMcq", "g5u3-k1", H.rename, ["Least keeps numbers small.", "Any multiple is valid."]),
    reused("CommonDenomNumeric", "g5u3-k2", H.rename, ["Rename into the LCD.", "Scale both parts."]),
    reused("LcdMcq", "g5u3-k3", H.rename, ["Bigger denominators still work.", "More simplifying after."]),
    reused("SimplifyNumeric", "g5u3-ch1", H.rename, ["Simplify at the end.", "Divide both by the GCF."]),
  ],
  ["Any common multiple works.", "The least keeps numbers smallest.", "Larger choices need more simplifying."],
  "next: renaming both at once.");

def(4,
  "Both fractions must be renamed, not just one. Each gets its own scaling factor, chosen so that both land on the shared denominator.",
  "1/4 and 1/6 into twelfths: the first scales by 3, the second by 2. Different factors, same destination.",
  { rep: "concrete", widget: () => fracBar("Rename 1/6 into twelfths.", 2, 12,
      "2/12 — sixths scale by 2 to reach twelfths, while fourths scale by 3.",
      [[3, 12, "3/12 is what 1/4 becomes; a sixth is smaller and scales to 2/12."],
       [1, 12, "1/12 is a single twelfth; a sixth holds two of them."]]),
    predict: P("Renaming 1/4 and 1/6 into twelfths, same scaling factor?", [{ id: "diff", label: "No — 3 and 2" }, { id: "same", label: "Yes" }], "diff",
      "Each denominator needs whatever factor carries IT to twelve, and 4 and 6 need different ones.") },
  [
    reused("ScaleBothNumeric", "g5u4-k1", H.rename, ["Each fraction, its own factor.", "Same destination."]),
    reused("CommonDenomNumeric", "g5u4-k2", H.rename, ["Reach the shared size.", "Scale the top too."]),
    reused("ScaleBothNumeric", "g5u4-k3", H.rename, ["Both parts together.", "Value preserved."]),
    reused("CommonDenomNumeric", "g5u4-ch1", H.rename, ["Both fractions renamed.", "Then compare."]),
  ],
  ["Rename both fractions.", "Each needs its own factor.", "Both land on the shared size."],
  "next: the addition itself.");

def(5,
  "Once both fractions wear the same denominator, addition is pure counting: the pieces match, so the totals simply combine.",
  "The denominator does not add. It names the piece size, and the pieces stayed the same size throughout.",
  { rep: "concrete", widget: () => fracBar("Add 3/12 + 4/12 and build the total.", 7, 12,
      "7/12 — three twelfths and four more twelfths, counted together.",
      [[1, 12, "A single twelfth is the difference between the two amounts, not their total."],
       [12, 12, "12/12 is one whole; three and four twelfths fall well short of it."]]),
    predict: P("Adding 3/12 + 4/12, what happens to the 12?", [{ id: "stays", label: "It stays 12" }, { id: "adds", label: "It becomes 24" }], "stays",
      "You are counting twelfths, so the answer is measured in twelfths too.") },
  [
    reused("AddUnlikeNumeric", "g5u5-k1", H.count, ["Same size? Add the counts.", "Bottom holds."]),
    reused("DenominatorHoldsMcq", "g5u5-k2", H.count, ["The denominator names size.", "It never adds."]),
    reused("AddUnlikeNumeric", "g5u5-k3", H.count, ["Count the pieces.", "That is the numerator."]),
    reused("AddUnlikeNumeric", "g5u5-ch1", H.count, ["Bigger counts, same rule.", "Pieces unchanged."]),
  ],
  ["Matching pieces add by counting.", "The denominator holds still.", "Only the numerator changes."],
  "next: taking pieces away.");

def(6,
  "Subtraction runs the same course: rename to a shared size, then take one count from the other.",
  "The demand is identical — matching pieces — because you cannot remove thirds from halves any more than you can add them.",
  { rep: "concrete", widget: () => fracBar("Subtract 4/12 from 9/12 and build what is left.", 5, 12,
      "5/12 — nine twelfths with four removed, still measured in twelfths.",
      [[5, 6, "Sixths are twice the size of twelfths; removing twelfths leaves twelfths behind."],
       [12, 12, "12/12 is one whole — adding instead of removing overshoots what is actually left."]]),
    predict: P("Subtracting 1/3 from 1/2, what comes first?", [{ id: "rename", label: "Rename both" }, { id: "sub", label: "Subtract straight away" }], "rename",
      "Halves and thirds are different sizes, so there is nothing to take away until both are sixths.") },
  [
    reused("SubUnlikeNumeric", "g5u6-k1", H.count, ["Rename, then remove.", "Counts subtract."]),
    reused("SubUnlikeNumeric", "g5u6-k2", H.count, ["The bottom holds.", "Only the top drops."]),
    reused("DenominatorHoldsMcq", "g5u6-k3", H.count, ["Piece size is fixed.", "Counting changes."]),
    reused("SubUnlikeNumeric", "g5u6-ch1", H.count, ["Bigger differences, same rule.", "Match then remove."]),
  ],
  ["Subtraction needs matching pieces too.", "Rename first, then remove.", "The denominator holds still."],
  "next: numbers with whole parts.");

def(7,
  "Mixed numbers carry wholes and parts at once. Add the fraction parts and the whole parts separately, then reassemble.",
  "If the fraction parts pass one whole, the extra whole moves across — the same carrying that whole-number addition uses.",
  { rep: "concrete", widget: () => fracBar("Add the fraction parts of 2 3/8 + 1 2/8.", 5, 8,
      "5/8 — the fraction parts alone, with the wholes handled separately as 2 + 1.",
      [[5, 12, "Twelfths are the wrong piece size; adding eighths to eighths leaves eighths."],
       [3, 8, "3/8 is only the first fraction part; the second still has to join it."]]),
    predict: P("Adding 2 3/8 + 1 2/8, how are the wholes handled?", [{ id: "sep", label: "Separately, then rejoined" }, { id: "mixed", label: "Mixed into the fractions" }], "sep",
      "Wholes add with wholes and parts with parts; the two results are combined at the end.") },
  [
    reused("MixedAddNumeric", "g5u7-k1", H.mixed, ["Parts with parts.", "Wholes with wholes."]),
    reused("ToImproperNumeric", "g5u7-k2", H.mixed, ["Or convert first.", "Each whole is b pieces."]),
    reused("MixedAddNumeric", "g5u7-k3", H.mixed, ["Reassemble at the end.", "Carry if parts pass one."]),
    reused("WholePartNumeric", "g5u7-ch1", H.mixed, ["Group back into wholes.", "Leftovers stay parts."]),
  ],
  ["Add wholes and parts separately.", "Reassemble at the end.", "Carry when the parts pass one."],
  "next: subtracting them.");

def(8,
  "Subtracting mixed numbers works the same way — provided the top fraction is big enough to subtract from.",
  "Converting both to improper fractions sidesteps the question entirely: with everything in pieces, there are no wholes to trade.",
  { rep: "concrete", widget: () => fracBar("Convert 2 3/8 to an improper fraction and build it.", 3, 8,
      "3/8 is the fraction part; as an improper fraction 2 3/8 is 19 eighths, since each whole is 8.",
      [[8, 8, "8/8 is one whole; the fraction part of 2 3/8 is three eighths."],
       [2, 8, "2/8 reads the whole-number 2 as a numerator; it names the wholes, not the pieces."]]),
    predict: P("Converting 2 3/8 to eighths, how many pieces?", [{ id: "19", label: "19" }, { id: "5", label: "5" }], "19",
      "Two wholes are sixteen eighths, plus the three already there.") },
  [
    reused("ToImproperNumeric", "g5u8-k1", H.mixed, ["Each whole is b pieces.", "Then add the top."]),
    reused("WholePartNumeric", "g5u8-k2", H.mixed, ["Group back afterwards.", "Wholes plus leftover."]),
    reused("SubUnlikeNumeric", "g5u8-k3", H.count, ["Then subtract counts.", "Same piece size."]),
    reused("ToImproperNumeric", "g5u8-ch1", H.mixed, ["Bigger wholes, same conversion.", "Multiply and add."]),
  ],
  ["Convert to improper fractions to avoid trading.", "Each whole is b pieces.", "Then subtract the counts."],
  "next: when the top part is too small.");

def(9,
  "When the top fraction is smaller than the bottom one, trade a whole: 4 1/8 becomes 3 9/8, because one whole is eight eighths.",
  "This is the fraction version of borrowing, and it obeys the same law — the amount is unchanged, only its packaging moves.",
  { rep: "concrete", widget: () => fracBar("After trading one whole, 4 1/8 has how many eighths in its fraction part? Build it.", 9, 8,
      "9/8 — the original one eighth plus the eight that came from the traded whole.",
      [[1, 8, "1/8 is the fraction part BEFORE the trade; a whole has yet to be broken."],
       [8, 8, "8/8 is the traded whole alone; the eighth already there joins it."]]),
    predict: P("In 4 1/8 − 1 5/8, what must happen first?", [{ id: "trade", label: "Trade a whole for 8/8" }, { id: "flip", label: "Compute 5/8 − 1/8" }], "trade",
      "Flipping answers a different question; trading makes the real subtraction possible.") },
  [
    reused("RegroupMcq", "g5u9-k1", H.mixed, ["Trade a whole.", "One whole is b pieces."]),
    reused("ToImproperNumeric", "g5u9-k2", H.mixed, ["Or convert entirely.", "No trading needed."]),
    reused("SubUnlikeNumeric", "g5u9-k3", H.count, ["Then subtract counts.", "Same size pieces."]),
    reused("RegroupMcq", "g5u9-ch1", H.mixed, ["Never flip the order.", "Trade instead."]),
  ],
  ["Trade a whole when the top part is short.", "One whole is b pieces.", "The amount never changes."],
  "next: tidying the answer.");

def(10,
  "Simplifying divides top and bottom by their greatest common factor. The value does not move; the numbers just get smaller.",
  "It is the exact inverse of renaming: one scales up to make pieces match, the other scales down once counting is done.",
  { rep: "concrete", widget: () => fracBar("Simplify 8/12 and build the result.", 2, 3,
      "2/3 — dividing both parts by 4 leaves the same amount in larger pieces.",
      [[2, 12, "That divided only the TOP by 4 and left the bottom alone, which shrinks the amount instead of renaming it."],
       [4, 8, "That SUBTRACTED 4 from both parts. Simplifying divides both by a shared factor; subtracting changes the value."]]),
    predict: P("Simplifying 8/12 to 2/3, does the amount change?", [{ id: "no", label: "No — same amount" }, { id: "smaller", label: "Yes — it shrinks" }], "no",
      "Dividing both parts by 4 re-cuts the same length into fewer, larger pieces.") },
  [
    reused("SimplifyNumeric", "g5u10-k1", H.rename, ["Divide both by the GCF.", "Value unchanged."]),
    reused("SimplifyNumeric", "g5u10-k2", H.rename, ["Simplify fully.", "No shared factor left."]),
    reused("ScaleBothNumeric", "g5u10-k3", H.rename, ["Renaming is the inverse.", "Up or down."]),
    reused("SimplifyNumeric", "g5u10-ch1", H.rename, ["Any fraction, same method.", "Greatest common factor."]),
  ],
  ["Simplify by dividing both parts.", "Use the greatest common factor.", "The value never changes."],
  "next: knowing roughly first.");

def(11,
  "Benchmark estimation rounds each fraction to 0, 1/2 or 1 before any renaming happens. 7/8 + 1/12 is about 1 + 0.",
  "It costs one glance and rules out most wrong answers, including every result of adding across.",
  { rep: "diagram", widget: () => estimate("7/8 + 1/12 — slide to estimate the total in wholes.", 0.05, 4, 0.96, "wholes",
      "Too low — 7/8 alone is nearly a whole one.",
      "Too high — both fractions are under one whole, so the sum cannot reach two.",
      "About 1 — 7/8 rounds to 1 and 1/12 rounds to 0, and the exact total is 23/24."),
    predict: P("Estimating 7/8 + 1/12 with benchmarks, roughly what?", [{ id: "one", label: "About 1" }, { id: "two", label: "About 2" }], "one",
      "Nearly one plus nearly nothing lands just under one whole.") },
  [
    reused("BenchmarkMcq", "g5u11-k1", H.est, ["Round to 0, 1/2 or 1.", "Then add."]),
    reused("OrderMcq", "g5u11-k2", H.est, ["Same pieces order by count.", "Compare directly."]),
    reused("AddUnlikeNumeric", "g5u11-k3", H.count, ["The exact answer decides.", "The estimate guards."]),
    reused("BenchmarkMcq", "g5u11-ch1", H.est, ["Benchmarks are fast.", "They catch adding across."]),
  ],
  ["Round each fraction to a benchmark.", "Estimate before renaming.", "It catches adding across instantly."],
  "next: judging an answer.");

def(12,
  "A reasonable answer sits where the parts put it: a sum must exceed each part it was built from, and two proper fractions cannot exceed two.",
  "That single comparison rejects 2/5 as the sum of 1/2 and 1/3 without any calculation at all.",
  { rep: "diagram", widget: () => estimate("1/2 + 1/3 — slide to estimate the sum in wholes.", 0.05, 4, 0.83, "wholes",
      "Too low — the sum must be larger than the 1/2 it contains.",
      "Too high — both parts are under one whole, so the total stays under one.",
      "About 0.83 — the exact answer is 5/6, comfortably between 1/2 and 1."),
    predict: P("Can 1/2 + 1/3 equal 2/5?", [{ id: "no", label: "No — smaller than 1/2" }, { id: "yes", label: "Yes" }], "no",
      "A sum can never be smaller than one of its parts, and 2/5 is less than 1/2.") },
  [
    reused("ReasonableMcq", "g5u12-k1", H.est, ["A sum exceeds its parts.", "Compare to each."]),
    reused("AddUnlikeNumeric", "g5u12-k2", H.count, ["Compute after judging.", "Then compare."]),
    reused("ReasonableMcq", "g5u12-k3", H.est, ["Adding across shrinks.", "That is the tell."]),
    reused("BenchmarkMcq", "g5u12-ch1", H.est, ["Benchmarks bound the answer.", "Above and below."]),
  ],
  ["A sum exceeds each of its parts.", "Two proper fractions stay under two.", "Comparison rejects wrong answers fast."],
  "next: fractions inside stories.");

def(13,
  "Word problems hide the denominators in the words: read for the quantities, find the shared piece size, then count.",
  "The mathematics is unchanged. Only the job of spotting which fractions are being combined, and in which direction, is new.",
  { rep: "concrete", widget: () => fracBar("A jug holds 5/12 litre and 4/12 more is poured in. Build the total.", 9, 12,
      "9/12 litre — five twelfths and four more, counted together.",
      [[9, 6, "Sixths are the wrong piece size here; pouring twelfths in leaves the total in twelfths."],
       [1, 12, "1/12 is the difference between the two amounts, not their total."]]),
    predict: P("'Poured in' means the total will be…", [{ id: "more", label: "More than either amount" }, { id: "less", label: "Less" }], "more",
      "Adding liquid raises the total above each amount that went into it.") },
  [
    reused("AddUnlikeNumeric", "g5u13-k1", H.count, ["Poured in adds.", "Count the pieces."]),
    reused("SubUnlikeNumeric", "g5u13-k2", H.count, ["Poured out subtracts.", "Read the direction."]),
    reused("AddUnlikeNumeric", "g5u13-k3", H.count, ["Same size first.", "Then combine."]),
    reused("SubUnlikeNumeric", "g5u13-ch1", H.count, ["Direction decides.", "The words say which."]),
  ],
  ["Read for the quantities and the direction.", "Find the shared piece size.", "Then count the pieces."],
  "next: several steps at once.");

def(14,
  "Multi-step fraction problems rename ONCE, to a denominator all the fractions share, and then run the steps in the story's order.",
  "Renaming at every step wastes work and invites mistakes. One shared size carries the whole chain.",
  { rep: "diagram", widget: () => estimate("3/4 litre, pour out 1/3, add 1/6 — slide to estimate what remains.", 0.05, 4, 0.58, "litres",
      "Too low — three quarters minus a third still leaves nearly half a litre before anything is added.",
      "Too high — the jug started at 3/4 and lost more than it gained.",
      "About 0.58 — in twelfths that is 9 − 4 + 2 = 7, so 7/12 litre."),
    predict: P("For 3/4, 1/3 and 1/6, which shared denominator?", [{ id: "twelve", label: "Twelfths" }, { id: "four", label: "Fourths" }], "twelve",
      "Thirds and sixths do not fit into fourths; twelve is the least size all three share.") },
  [
    reused("MultiStepMcq", "g5u14-k1", H.same, ["One shared size.", "Then follow the order."]),
    reused("AddUnlikeNumeric", "g5u14-k2", H.count, ["Add where the story adds.", "Count pieces."]),
    reused("SubUnlikeNumeric", "g5u14-k3", H.count, ["Subtract where it removes.", "Same pieces."]),
    reused("SimplifyNumeric", "g5u14-ch1", H.rename, ["Simplify at the end.", "Once only."]),
  ],
  ["Rename once, to a size all share.", "Run the steps in story order.", "Simplify at the end."],
  "course complete: renamed, added, subtracted, traded, simplified, and judged.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 14, `14 lessons defined, got ${L.length}`);
const chapterTitles = ["Making the Pieces Match", "Adding, Subtracting, and Mixed Numbers", "Simplifying, Estimating, Applying"];
const perChapter = [5, 5, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 5 ? 1 : n <= 10 ? 2 : 3);
const outDir = join(root, "content/courses/unlike-fractions-g5");
mkdirSync(join(outDir, "lessons"), { recursive: true });

const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);
const MANIP2 = new Set(["numberLineHop", "barBuilder", "estimateSlider", "numberLinePlace", "areaModel", "columnCalc", "fractionBar", "tapDiagram"]);

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g5u-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "concrete") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "unlike-fractions-g5",
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
      const f = s.variant?.form;
      if (f === "faLikeDenomWordNumeric") {
        const nums = (w.prompt.match(/(\d+)\/(\d+)/g) || []).map((x) => Number(x.split("/")[0]));
        const sub = w.prompt.includes("were available");
        must(sub ? nums[0] - nums[1] === w.answer : nums[0] + nums[1] === w.answer,
          `${id}/${s.id}: "were available" flips this route to subtraction`);
      }
      if (f === "faEquivalenceRecapNumeric") {
        const m = w.prompt.match(/(\d+)\/(\d+) = \?\/(\d+)/);
        must(m && (+m[1] * +m[3]) % +m[2] === 0 && (+m[1] * +m[3]) / +m[2] === w.answer,
          `${id}/${s.id} equivalence must scale to a whole numerator`);
      }
      if (f === "faMixedToImproperNumeric") {
        const m = w.prompt.match(/Convert (\d+) (\d+)\/(\d+)/);
        must(m && +m[1] * +m[3] + +m[2] === w.answer, `${id}/${s.id} mixed-to-improper`);
      }
      if (f === "faImproperToMixedNumeric") {
        const m = w.prompt.match(/Convert (\d+)\/(\d+)/);
        must(m && Math.floor(+m[1] / +m[2]) === w.answer, `${id}/${s.id} improper-to-mixed`);
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
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "unlike-fractions-g5", slug: "unlike-fractions-g5", title: spec.title,
  tagline: "Make the pieces match, then the fractions simply count.",
  category: "Math", gradeLevel: 5, chapters,
}, null, 2) + "\n");
console.log(`built 14 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
