#!/usr/bin/env node
// S196 — Batch E course 3/5: patterns-factors-g4 (4.OA.B.4, 4.OA.C.5). Zero new generator code.
//
// Family: g4-multiply (computational solver g4Independent.cjs). Routes AND widget surfaces were
// both probed before authoring — course 2 taught that a form named *Mcq does not necessarily
// GENERATE an mcq (faBenchmarkCompareMcq renders an exactNumberLab), and the resolver gates on
// the surface, not the name. Verified here: mbFactorsMcq, mbMultiplesMcq, mbPrimeCompositeMcq and
// mbPatternsMcq all generate mcq; mbFactorsNumeric, mbPrimeCompositeNumeric, mbPatternsNumeric
// and mbTimesAsManyNumeric all generate numeric.
//   mbFactorsNumeric      "one side A and an area of B"  -> ns[1]/ns[0]  (side FIRST, area second)
//   mbFactorsMcq          -> the option that divides ns[0]
//   mbMultiplesMcq        -> the option divisible by ns[0]
//   mbPrimeCompositeMcq   -> "Prime"/"Composite" by trial division on ns[0] (labels EXACT)
//   mbPrimeCompositeNumeric -> always 2 (the smallest prime)
//   mbPatternsMcq         -> exact `Multiply by ${ns[1]/ns[0]}`
//   mbPatternsNumeric     -> ns[last] * (ns[1]/ns[0])
// NOTE mbPatterns* models MULTIPLICATIVE rules only: the rule is read as the ratio of the first
// two numbers. Additive patterns cannot ride it, so the additive lessons use authored MCQs.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "patterns-factors-g4");
if (!spec || spec.lessons.length !== 10) throw new Error("spec course missing or wrong size");

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
const AREA_T = corpusTemplate("areaModel", "measurement-data");
const HOP_T = corpusTemplate("numberLineHop", "add-subtract-1000-g2");
const BAR_T = corpusTemplate("barBuilder", "measurement-data");
const TAP_T = corpusTemplate("tapDiagram", "fractions");

const REG_MB = new Set(["mbTimesAsManyMcq","mbTimesAsManyNumeric","mbComparisonEquationsMcq",
  "mbComparisonEquationsNumeric","mbAdditiveVsMultiplicativeMcq","mbAdditiveVsMultiplicativeNumeric",
  "mbFactorsMcq","mbFactorsNumeric","mbMultiplesMcq","mbPrimeCompositeMcq","mbPrimeCompositeNumeric",
  "mbMultiplyTensMcq","mbMultiplyTensNumeric","mbAreaModel1DigitMcq","mbAreaModel1DigitNumeric",
  "mbAreaModel2DigitMcq","mbAreaModel2DigitNumeric","mbRemaindersMcq","mbRemaindersNumeric",
  "mbDivideBigNumeric","mbInterpretRemaindersMcq","mbInterpretRemaindersNumeric","mbPatternsMcq",
  "mbPatternsNumeric","mbMultiStepNumeric"]);
const REG = { "g4-multiply": REG_MB };

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
const isPrime = (n) => n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d);
const factorsOf = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);

function traps2(answer, cands) {
  const out = [];
  for (const [v, fb] of cands) {
    if (v !== answer && v >= 0 && Number.isInteger(v) && !out.some((o) => o[0] === v)) out.push([v, fb]);
    if (out.length === 2) break;
  }
  for (let d = 3; out.length < 2; d++) {
    const v = answer + d;
    if (!out.some((o) => o[0] === v)) {
      out.push([v, "That value does not follow from the rule — apply it again from the term before."]);
    }
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

/* ---------------- graded mirrors ---------------- */
function FactorPairNumeric(r) {
  const side = pick(r, 3, 9);
  const other = pick(r, 3, 9);
  const areaVal = side * other;
  return { gen: "g4-multiply", form: "mbFactorsNumeric",
    prompt: `A rectangle has one side ${side} and an area of ${areaVal}. What is the other side?`,
    answer: other,
    traps: traps2(other, [
      [areaVal - side, `That subtracted the known side. A rectangle's sides MULTIPLY to the area, so divide instead.`],
      [areaVal, `${areaVal} is the whole area; the question asks for the side that pairs with ${side}.`]]) };
}
function IsFactorMcq(r) {
  const n = choose(r, [24, 36, 40, 48, 60]);
  const facs = factorsOf(n).filter((f) => f > 2 && f < n);
  const correct = String(choose(r, facs));
  const wrongs = [];
  for (let c = 3; wrongs.length < 3 && c < n; c++) {
    if (n % c !== 0 && !wrongs.includes(String(c)) && String(c) !== correct) wrongs.push(String(c));
  }
  must(wrongs.length === 3, "IsFactorMcq needs three non-factors");
  return { gen: "g4-multiply", form: "mbFactorsMcq", kind: "solverMcq",
    prompt: `Which of these is a factor of ${n}?`,
    labels: [correct, ...wrongs], correct,
    feedback: Object.fromEntries([[correct, `Correct — ${n} ÷ ${correct} comes out even, so ${correct} pairs with another whole number to build ${n}.`],
      ...wrongs.map((wv) => [wv, `${n} ÷ ${wv} leaves a remainder, so ${wv} cannot be one side of a whole-number rectangle with area ${n}.`])]) };
}
function IsMultipleMcq(r) {
  const base = choose(r, [4, 6, 7, 8, 9]);
  const correct = String(base * pick(r, 4, 9));
  const wrongs = [];
  for (let k = 2; wrongs.length < 3; k++) {
    const cand = String(base * k + pick(r, 1, base - 1));
    if (Number(cand) % base !== 0 && !wrongs.includes(cand) && cand !== correct) wrongs.push(cand);
  }
  must(wrongs.length === 3, "IsMultipleMcq needs three non-multiples");
  return { gen: "g4-multiply", form: "mbMultiplesMcq", kind: "solverMcq",
    prompt: `Which of these is a multiple of ${base}?`,
    labels: [correct, ...wrongs], correct,
    feedback: Object.fromEntries([[correct, `Correct — counting by ${base} lands exactly on ${correct}, so it is ${base} taken a whole number of times.`],
      ...wrongs.map((wv) => [wv, `Counting by ${base} steps straight past ${wv}; it sits between two multiples rather than on one.`])]) };
}
function PrimeCompositeMcq(r) {
  const n = choose(r, [11, 13, 15, 17, 21, 23, 25, 27, 29, 33]);
  const correct = isPrime(n) ? "Prime" : "Composite";
  return { gen: "g4-multiply", form: "mbPrimeCompositeMcq", kind: "solverMcq",
    prompt: `Is ${n} prime or composite?`,
    labels: [correct, correct === "Prime" ? "Composite" : "Prime"], correct,
    feedback: {
      Prime: isPrime(n)
        ? `Correct — ${n} has no factors besides 1 and itself, so the only rectangle it builds is 1 by ${n}.`
        : `${n} is not prime: it has a factor besides 1 and itself, which means more than one rectangle can be built from it.`,
      Composite: isPrime(n)
        ? `${n} has no factor pair other than 1 and ${n}, so it cannot be composed of smaller whole-number sides.`
        : `Correct — ${n} has a factor besides 1 and itself, so it can be built as a rectangle with both sides above 1.`,
    } };
}
function SmallestPrimeNumeric() {
  return { gen: "g4-multiply", form: "mbPrimeCompositeNumeric",
    prompt: `What is the smallest prime number?`, answer: 2,
    traps: traps2(2, [
      [1, `1 has only ONE factor — itself — while a prime needs exactly two, so 1 is neither prime nor composite.`],
      [3, `3 is prime, but a smaller one comes before it and is the only even prime there is.`]]) };
}
function PatternNextNumeric(r) {
  const start = pick(r, 2, 5);
  const ratio = choose(r, [2, 3]);
  const t2 = start * ratio, t3 = t2 * ratio, t4 = t3 * ratio;
  const ans = t4 * ratio;
  return { gen: "g4-multiply", form: "mbPatternsNumeric",
    prompt: `A pattern runs ${start}, ${t2}, ${t3}, ${t4}. What comes next?`, answer: ans,
    traps: traps2(ans, [
      [t4 + (t4 - t3), `That ADDED the last gap. This pattern multiplies by ${ratio} each time, so the gaps keep growing.`],
      [t4 + ratio, `That added ${ratio} instead of multiplying by it — the rule scales the term, it does not nudge it.`]]) };
}
function PatternRuleMcq(r) {
  const start = pick(r, 2, 5);
  const ratio = choose(r, [2, 3, 4]);
  const t2 = start * ratio, t3 = t2 * ratio;
  const correct = `Multiply by ${ratio}`;
  // "Add ${ratio}" collides with "Add ${t2 - start}" whenever start === ratio, so the third
  // distractor uses the SECOND gap instead — always larger than the first for a growing pattern.
  const wrongs = [`Add ${t2 - start}`, `Multiply by ${ratio + 1}`, `Add ${t3 - t2}`];
  must(t3 - t2 !== t2 - start, "the two gaps must differ or the additive distractors collide");
  must(new Set([correct, ...wrongs]).size === 4, "PatternRuleMcq labels must be distinct");
  return { gen: "g4-multiply", form: "mbPatternsMcq", kind: "solverMcq",
    prompt: `The pattern ${start}, ${t2}, ${t3} grows. What is the rule?`,
    labels: [correct, ...wrongs], correct,
    feedback: {
      [correct]: `Correct — each term is ${ratio} times the one before, which is why the gaps widen as the pattern runs.`,
      [`Add ${t2 - start}`]: `Adding ${t2 - start} works for the FIRST step only; the next gap is larger, so the rule is not additive.`,
      [`Multiply by ${ratio + 1}`]: `Multiplying by ${ratio + 1} would overshoot ${t2} immediately — check the first step.`,
      [`Add ${t3 - t2}`]: `${t3 - t2} is the SECOND gap, not a constant step — the first gap was only ${t2 - start}, so no single addition fits.`,
    } };
}
function TimesAsManyNumeric(r) {
  const a = pick(r, 3, 9), b = pick(r, 3, 9);
  return { gen: "g4-multiply", form: "mbTimesAsManyNumeric",
    prompt: `One shelf holds ${a} books. Another holds ${b} times as many. ${a} × ${b} = ?`,
    answer: a * b,
    traps: traps2(a * b, [
      [a + b, `"Times as many" scales the amount; adding would answer "how many MORE", a different question.`],
      [b, `${b} counts how many times as many, not the number of books that many produces.`]]) };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function AllFactorPairsMcq() {
  return { kind: "mcq",
    prompt: `How do you know you have found ALL the factor pairs of 24?`,
    options: [
      { label: "Test every number from 1 up until the pairs start repeating", correct: true, feedback: `Correct — once you pass the point where a pair flips (4 × 6 then 6 × 4), every pair has already appeared.` },
      { label: "Stop once you find three pairs", correct: false, feedback: `The count of pairs is not fixed; 24 has four, and stopping early misses some.` },
      { label: "Only even numbers can be factors of 24", correct: false, feedback: `1 and 3 are both odd factors of 24, so evenness is not the test.` },
      { label: "Divide 24 by 2 repeatedly and list what you get", correct: false, feedback: `That finds 12, 6, 3 but misses 8 and 4 as partners — halving does not reach every factor.` },
    ] };
}
function SieveMcq() {
  return { kind: "mcq",
    prompt: `In a sieve you cross out multiples of 2, then 3, then 5. Why is 4 never used as a crossing-out number?`,
    options: [
      { label: "Every multiple of 4 was already crossed out as a multiple of 2", correct: true, feedback: `Correct — 4 is itself composite, so its multiples are also multiples of its factor 2 and are gone already.` },
      { label: "Because 4 has no multiples", correct: false, feedback: `4 has infinitely many multiples; the point is they were already removed by an earlier pass.` },
      { label: "Because 4 is prime", correct: false, feedback: `4 is composite — it is 2 × 2 — which is exactly why it is skipped as a sieve number.` },
      { label: "Because 4 is too small to matter", correct: false, feedback: `Size is not the reason; 5 is used and 4 is not, because only PRIMES add new crossings.` },
    ] };
}
function AdditiveRuleMcq() {
  return { kind: "mcq",
    prompt: `A pattern follows the rule "add 6", starting at 4: 4, 10, 16, 22. What comes next?`,
    options: [
      { label: "28, because each term gains a fixed 6", correct: true, feedback: `Correct — an additive rule adds the same amount every time, so the gaps stay equal at 6.` },
      { label: "132, because 22 × 6 = 132", correct: false, feedback: `That applies a multiplying rule; this pattern adds 6 rather than scaling by it.` },
      { label: "26, because the gap shrinks", correct: false, feedback: `The gap in an additive rule never changes — every step here is exactly 6.` },
      { label: "44, because the pattern doubles", correct: false, feedback: `Doubling would have taken 4 to 8, not to 10; the first step already rules it out.` },
    ] };
}
function ShapeRuleMcq() {
  return { kind: "mcq",
    prompt: `A shape pattern adds 3 squares each step: 3, 6, 9, 12 squares. Which describes step 6?`,
    options: [
      { label: "18 squares, because step n uses 3 × n squares", correct: true, feedback: `Correct — the rule "add 3 each step" makes every step a multiple of 3, so step 6 uses 18.` },
      { label: "15 squares, because 12 + 3 = 15", correct: false, feedback: `15 is step 5. One more step of 3 is still needed to reach step 6.` },
      { label: "36 squares, because 12 × 3 = 36", correct: false, feedback: `The rule adds 3 per step; multiplying the last term by 3 skips far ahead of step 6.` },
      { label: "You cannot know without drawing every step", correct: false, feedback: `You can: a constant step size makes step n predictable without drawing, which is the point of finding the rule.` },
    ] };
}
function HiddenFeatureMcq() {
  return { kind: "mcq",
    prompt: `The rule is "add 3", starting at 3: 3, 6, 9, 12, 15. Which feature does the rule NOT state, but the pattern shows?`,
    options: [
      { label: "The terms alternate odd, even, odd, even", correct: true, feedback: `Correct — nothing in "add 3" mentions parity, yet adding an odd number flips odd to even every step.` },
      { label: "Each term is 3 more than the one before", correct: false, feedback: `That is exactly what the rule states, so it is not a hidden feature.` },
      { label: "The pattern starts at 3", correct: false, feedback: `The starting value is given outright, so it is stated rather than discovered.` },
      { label: "The pattern grows", correct: false, feedback: `Growth follows directly from adding a positive number — it is stated, not hidden.` },
    ] };
}
function ExtendExplainMcq() {
  return { kind: "mcq",
    prompt: `Extending a pattern, why is stating the RULE better than just writing the next number?`,
    options: [
      { label: "A rule lets you find any term, not only the next one", correct: true, feedback: `Correct — with the rule you can jump to step 20 directly, while the next number alone gets you one step.` },
      { label: "Because the next number is usually wrong", correct: false, feedback: `The next number can be perfectly right; the rule is better because it generalises, not because it is more accurate.` },
      { label: "Because rules are shorter to write", correct: false, feedback: `Brevity is not the point — a rule carries the structure that a single number cannot.` },
      { label: "There is no difference", correct: false, feedback: `There is: the rule predicts every future term and explains WHY the pattern behaves as it does.` },
    ] };
}

const REUSE = { FactorPairNumeric, IsFactorMcq, IsMultipleMcq, PrimeCompositeMcq,
  SmallestPrimeNumeric: () => SmallestPrimeNumeric(), PatternNextNumeric, PatternRuleMcq,
  TimesAsManyNumeric,
  AllFactorPairsMcq: () => AllFactorPairsMcq(), SieveMcq: () => SieveMcq(),
  AdditiveRuleMcq: () => AdditiveRuleMcq(), ShapeRuleMcq: () => ShapeRuleMcq(),
  HiddenFeatureMcq: () => HiddenFeatureMcq(), ExtendExplainMcq: () => ExtendExplainMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Test whole-number divisions, or apply the rule once more from the term before.") {
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
    must(options.length >= 2, `${mirror} needs at least a binary choice`);
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

/* ---------------- manipulatives (all rated manip >= 2) ---------------- */
function area(prompt, w, h, success, low, high, factorFeedback) {
  const spec = structuredClone(AREA_T);
  spec.prompt = prompt; spec.targetArea = w * h;
  const bound = Math.max(w, h);
  spec.wMax = bound; spec.hMax = bound;
  spec.wStart = 1; spec.hStart = 1;
  spec.square = false;
  spec.requireFactors = { w, h };
  spec.factorFeedback = factorFeedback;
  if ("countGrid" in spec) delete spec.countGrid;
  if ("commonCounts" in spec) delete spec.commonCounts;
  spec.successFeedback = success; spec.lowFeedback = low; spec.highFeedback = high;
  must(h <= spec.wMax && w <= spec.hMax, "area TRANSPOSE must also fit the tray");
  must(bound <= 30, `areaModel side ${bound} is too wide to read at 360px`);
  must(factorFeedback && factorFeedback.length >= 25, "areaModel requireFactors needs factorFeedback");
  return spec;
}
function hop(prompt, min, max, start, hopSize, hops, success, landings, low, high) {
  const w = structuredClone(HOP_T);
  w.prompt = prompt; w.min = min; w.max = max; w.start = start;
  w.hop = hopSize; w.hops = hops; w.direction = "forward";
  delete w.hopSizeTargets; delete w.hopSizeMin; delete w.hopSizeMax;
  const land = start + hopSize * hops;
  must(land >= min && land <= max, `hop landing ${land} off the line`);
  w.successFeedback = success;
  if (low !== undefined) w.lowFeedback = low;
  if (high !== undefined) w.highFeedback = high;
  w.commonLandings = landings.map(([value, feedback]) => {
    must(value !== land, `hop trap ${value} equals the landing`);
    must(value >= min && value <= max, `hop trap ${value} off the line`);
    must(feedback.length >= 25, "hop trap feedback short");
    return { value, feedback };
  });
  return w;
}
function bars(prompt, categories, target, success, partial) {
  const w = structuredClone(BAR_T);
  w.prompt = prompt; w.categories = categories; w.target = target;
  w.display = "bar"; w.maxVal = Math.max(...target) + 2; w.step = 1; w.histogram = false;
  w.successFeedback = success; w.partialFeedback = partial;
  must(categories.length === target.length, "bars categories/target aligned");
  return w;
}
function tap(prompt, hotspots) {
  const w = structuredClone(TAP_T);
  w.prompt = prompt; w.mode = "selectAll"; w.canvas = { w: Math.min(hotspots.length, 6), h: 1 };
  w.hotspots = hotspots.map((h, i) => ({
    id: h.id, x: Math.round(((i + 0.5) / hotspots.length) * 100), y: 50,
    label: h.label, icon: h.icon, count: 1,
    ...(h.correct ? { correct: true } : { feedback: h.feedback }),
  }));
  must(w.hotspots.some((h) => h.correct), "tapDiagram needs a correct hotspot");
  must(w.hotspots.some((h) => !h.correct), "tapDiagram needs a diagnosable wrong hotspot");
  for (const h of hotspots) if (!h.correct) must(h.feedback.length >= 25, "tapDiagram wrong-hotspot feedback short");
  return w;
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Build the arrangements a number allows, and read the rule that generates the next term for ${tag.replace(/-/g, " ")}.`,
  invariants: [`A factor pair is a rectangle a number can build and a multiple is a landing a count reaches, so every claim about ${tag.replace(/-/g, " ")} can be settled by construction rather than recall.`],
  misconceptions: [`Reading an additive gap as a multiplier, stopping a factor search before the pairs repeat, or treating 1 as prime.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `patterns-factors-g4:${tag}`, delayed: true,
  counterfactualPrompt: "Which numbers would make this rectangle impossible to build with whole-number sides?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  factor: ["Sides multiply to the area.", "Test whole divisions.", "Stop when pairs repeat."],
  multiple: ["Count by the number.", "Land exactly on it.", "Between means no."],
  prime: ["Count the factor pairs.", "Only 1 and itself.", "One is neither."],
  rule: ["Check the FIRST step.", "Then check the second.", "Equal gaps means adding."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "A factor pair is a rectangle a number can build: 24 makes 1×24, 2×12, 3×8 and 4×6, and each pair is two factors that multiply to 24.",
  "Search upward from 1 and stop when the pairs begin to repeat — 4×6 and 6×4 are the same rectangle turned on its side.",
  { rep: "diagram", widget: () => area("Build a rectangle with area 24 whose sides are 4 and 6.", 6, 4,
      "24 — a 6 by 4 rectangle, one of the four factor pairs 24 allows.",
      "Smaller than 24 — keep building until the rectangle reaches the full area.",
      "Larger than 24 — one side has grown past the pair asked for.",
      "That area is right, but from a different pair — this one must measure 6 by 4."),
    predict: P("Are 4 × 6 and 6 × 4 different factor pairs of 24?", [{ id: "same", label: "No — the same rectangle turned" }, { id: "diff", label: "Yes — two pairs" }], "same",
      "Rotating a rectangle does not change which two numbers multiply to 24, so the pair is counted once.") },
  [
    reused("FactorPairNumeric", "g4p1-k1", H.factor, ["Sides multiply to the area.", "Divide to find the partner."]),
    reused("AllFactorPairsMcq", "g4p1-k2", H.factor, ["Search upward from 1.", "Stop when pairs repeat."]),
    reused("FactorPairNumeric", "g4p1-k3", H.factor, ["Each pair is a rectangle.", "Whole sides only."]),
    reused("FactorPairNumeric", "g4p1-ch1", H.factor, ["Bigger areas, same search.", "Divide and check."]),
  ],
  ["A factor pair builds a rectangle.", "Search upward from 1.", "Stop when the pairs repeat."],
  "next: testing a single candidate.");

def(2,
  "To test whether one number is a factor of another, divide. A factor divides with nothing left over; anything else is not a factor.",
  "The rectangle test says the same thing: if the division leaves a remainder, no whole-number rectangle with that side exists.",
  { rep: "diagram", widget: () => tap("Which of these are factors of 24? Tap every one that divides it exactly.",
      [{ id: "f3", label: "3 — divides 24 exactly", icon: "3️⃣", correct: true },
       { id: "f5", label: "5", icon: "5️⃣", feedback: "24 ÷ 5 leaves 4 over, so no whole-number rectangle has a side of 5 and area 24." },
       { id: "f8", label: "8 — divides 24 exactly", icon: "8️⃣", correct: true },
       { id: "f7", label: "7", icon: "7️⃣", feedback: "24 ÷ 7 leaves 3 over; counting by sevens steps straight past 24." }]),
    predict: P("Is 5 a factor of 24?", [{ id: "no", label: "No — it leaves a remainder" }, { id: "yes", label: "Yes" }], "no",
      "24 ÷ 5 is 4 remainder 4, and a factor must divide with nothing left over.") },
  [
    reused("IsFactorMcq", "g4p2-k1", H.factor, ["Divide and check the remainder.", "Zero means factor."]),
    reused("FactorPairNumeric", "g4p2-k2", H.factor, ["A factor has a partner.", "Their product is the number."]),
    reused("IsFactorMcq", "g4p2-k3", H.factor, ["Remainder means no.", "Exact means yes."]),
    reused("IsFactorMcq", "g4p2-ch1", H.factor, ["Larger numbers, same test.", "Divide exactly."]),
  ],
  ["A factor divides with no remainder.", "Divide to test a candidate.", "Remainder means not a factor."],
  "next: counting the other way.");

def(3,
  "Multiples run the relationship backwards: the multiples of 6 are the landings you reach counting 6, 12, 18, 24 — 6 taken a whole number of times.",
  "Every number has finitely many factors but endlessly many multiples, because you can always take one more step.",
  { rep: "diagram", widget: () => hop("Count by 6s from 0. Take four hops and see where you land.", 0, 60, 0, 6, 4,
      "24 — the fourth multiple of 6, reached by four equal hops.",
      [[18, "Three hops reach 18. One more hop of 6 is still needed."],
       [30, "Five hops overshoot; the fourth multiple of 6 is 24."]],
      "Short of the landing — each hop covers 6, so four of them reach 24.",
      "Past the landing — four hops of 6 stop exactly on 24."),
    predict: P("How many multiples does 6 have?", [{ id: "endless", label: "Endlessly many" }, { id: "few", label: "Only a few" }], "endless",
      "You can always take one more hop of 6, so the multiples never run out — unlike the factors, which do.") },
  [
    reused("IsMultipleMcq", "g4p3-k1", H.multiple, ["Count by the number.", "Land exactly."]),
    reused("IsMultipleMcq", "g4p3-k2", H.multiple, ["Multiples never run out.", "Factors do."]),
    reused("TimesAsManyNumeric", "g4p3-k3", H.multiple, ["Times as many scales.", "Multiplication."]),
    reused("IsMultipleMcq", "g4p3-ch1", H.multiple, ["Bigger bases, same counting.", "Exact landings."]),
  ],
  ["Multiples are the landings when counting by a number.", "Every number has endless multiples.", "Factors are finite, multiples are not."],
  "next: testing a candidate multiple.");

def(4,
  "Testing whether a number is a multiple uses the same division: if it divides exactly, counting reaches it; if not, counting steps past.",
  "Factor and multiple are one relationship read from two ends. 6 is a factor of 24 exactly when 24 is a multiple of 6.",
  { rep: "diagram", widget: () => hop("Is 40 a multiple of 8? Count by 8s and check.", 0, 60, 0, 8, 5,
      "40 — five hops of 8 land exactly on it, so 40 is a multiple of 8.",
      [[32, "Four hops reach 32; one more is needed to test 40."],
       [48, "Six hops overshoot past 40 entirely."]],
      "Short of the landing — five hops of 8 are needed to reach 40.",
      "Past the landing — counting by 8s hits 40 exactly on the fifth hop."),
    predict: P("6 is a factor of 24. Is 24 a multiple of 6?", [{ id: "yes", label: "Yes — always" }, { id: "no", label: "Not necessarily" }], "yes",
      "The two statements say the same thing from opposite ends: 6 × 4 = 24 makes both true at once.") },
  [
    reused("IsMultipleMcq", "g4p4-k1", H.multiple, ["Divide to test.", "Exact means multiple."]),
    reused("IsFactorMcq", "g4p4-k2", H.factor, ["Same relationship.", "Read from the other end."]),
    reused("IsMultipleMcq", "g4p4-k3", H.multiple, ["Between multiples means no.", "Counting steps past."]),
    reused("FactorPairNumeric", "g4p4-ch1", H.factor, ["Pairs connect both ideas.", "Product is the number."]),
  ],
  ["Test a multiple by dividing.", "Factor and multiple are one relationship.", "Read it from either end."],
  "next: numbers with almost no factors.");

def(5,
  "A prime number has exactly two factors: 1 and itself. A composite has more, which means it can be built as a rectangle with both sides above 1.",
  "One is neither prime nor composite — it has only a single factor, so it fails both definitions rather than sitting in one.",
  { rep: "diagram", widget: () => area("15 is composite. Build it as a rectangle with both sides greater than 1.", 5, 3,
      "15 — a 5 by 3 rectangle, which is exactly what makes 15 composite.",
      "Smaller than 15 — keep building to the full area.",
      "Larger than 15 — a side has grown past the pair asked for.",
      "That area is right, but 1 by 15 is the pair every number has; composite means a pair with BOTH sides above 1."),
    predict: P("Can 13 be built as a rectangle with both sides above 1?", [{ id: "no", label: "No — 13 is prime" }, { id: "yes", label: "Yes" }], "no",
      "13's only factors are 1 and 13, so the only rectangle is the 1-wide strip — the signature of a prime.") },
  [
    reused("PrimeCompositeMcq", "g4p5-k1", H.prime, ["Count the factors.", "Exactly two means prime."]),
    reused("SmallestPrimeNumeric", "g4p5-k2", H.prime, ["One is neither.", "Two is the smallest."]),
    reused("PrimeCompositeMcq", "g4p5-k3", H.prime, ["Composite builds a rectangle.", "Both sides above 1."]),
    reused("PrimeCompositeMcq", "g4p5-ch1", H.prime, ["Test each candidate factor.", "Up to the square root."]),
  ],
  ["A prime has exactly two factors.", "A composite has more.", "One is neither."],
  "next: finding all the primes at once.");

def(6,
  "The sieve finds every prime in a range by elimination: cross out the multiples of 2, then 3, then 5, and whatever survives is prime.",
  "Only PRIMES need to be sieve numbers. The multiples of 4 vanished with the multiples of 2, because 4 is itself built from 2.",
  { rep: "diagram", widget: () => hop("Run the multiples-of-3 pass: count by 3s from 0 and watch which numbers get crossed out.", 0, 30, 0, 3, 6,
      "18 — and every landing on the way (3, 6, 9, 12, 15) is crossed out as a multiple of 3.",
      [[15, "Five hops reach 15; the sixth landing is the one being tested."],
       [21, "Seven hops overshoot — the sixth multiple of 3 is 18."]],
      "Short of the landing — each hop covers 3, so six of them reach 18.",
      "Past the landing — six hops of 3 stop exactly on 18."),
    predict: P("After crossing out multiples of 2, is a separate pass for 4 needed?", [{ id: "no", label: "No — already gone" }, { id: "yes", label: "Yes" }], "no",
      "Every multiple of 4 is also a multiple of 2, so the first pass already removed them all.") },
  [
    reused("SieveMcq", "g4p6-k1", H.prime, ["Only primes sieve.", "Composites add nothing."]),
    reused("SmallestPrimeNumeric", "g4p6-k2", H.prime, ["Survivors are prime.", "Two is the first survivor."]),
    reused("SieveMcq", "g4p6-k3", H.prime, ["4's multiples went with 2's.", "Factors carry through."]),
    reused("PrimeCompositeMcq", "g4p6-ch1", H.prime, ["Check the survivors.", "Two factors only."]),
  ],
  ["The sieve eliminates composites.", "Only primes are sieve numbers.", "Survivors are the primes."],
  "next: rules that generate numbers.");

def(7,
  "A rule generates a pattern: start somewhere and apply the same operation each step. 'Multiply by 2' from 3 gives 3, 6, 12, 24.",
  "Check the FIRST step to find the rule, then confirm it on the second. A rule that fits only one step is not the rule.",
  { rep: "diagram", widget: () => bars("Build the pattern 3, 6, 12, 24 — each term double the one before.",
      ["Term 1", "Term 2", "Term 3", "Term 4"], [3, 6, 12, 24],
      "3, 6, 12, 24 — each bar twice the height of the one before it, so the gaps grow as the pattern runs.",
      "Each term must be double the previous one: 3, then 6, then 12, then 24."),
    predict: P("In 3, 6, 12, 24, do the gaps stay the same?", [{ id: "grow", label: "No — they grow" }, { id: "same", label: "Yes" }], "grow",
      "The gaps are 3, 6, 12 — widening every step, which is the signature of a multiplying rule.") },
  [
    reused("PatternRuleMcq", "g4p7-k1", H.rule, ["Check the first step.", "Confirm on the second."]),
    reused("PatternNextNumeric", "g4p7-k2", H.rule, ["Apply the rule again.", "From the last term."]),
    reused("AdditiveRuleMcq", "g4p7-k3", H.rule, ["Equal gaps means adding.", "Growing gaps means multiplying."]),
    reused("PatternNextNumeric", "g4p7-ch1", H.rule, ["Longer patterns, same rule.", "One step at a time."]),
  ],
  ["A rule generates every term.", "Check the first step, confirm on the second.", "Growing gaps mean multiplying."],
  "next: patterns made of shapes.");

def(8,
  "Shape patterns follow rules too: adding 3 squares each step gives 3, 6, 9, 12 — the same arithmetic wearing a picture.",
  "Because the step is constant, step n uses 3 × n squares, so you can jump straight to step 10 without drawing nine pictures first.",
  { rep: "diagram", widget: () => bars("Build the shape pattern: 3 squares, then 6, then 9, then 12.",
      ["Step 1", "Step 2", "Step 3", "Step 4"], [3, 6, 9, 12],
      "3, 6, 9, 12 — a constant step of 3, so every term is a multiple of 3.",
      "Each step adds exactly 3 more squares than the step before."),
    predict: P("Adding 3 squares each step, how many at step 6?", [{ id: "eighteen", label: "18" }, { id: "fifteen", label: "15" }], "eighteen",
      "Step n uses 3 × n squares, so step 6 uses 18 — no drawing required.") },
  [
    reused("ShapeRuleMcq", "g4p8-k1", H.rule, ["Constant step means multiples.", "Step n uses n steps."]),
    reused("AdditiveRuleMcq", "g4p8-k2", H.rule, ["Equal gaps, additive rule.", "Apply it again."]),
    reused("PatternNextNumeric", "g4p8-k3", H.rule, ["Apply the rule again.", "From the last term."]),
    reused("ShapeRuleMcq", "g4p8-ch1", H.rule, ["Jump to any step.", "That is the rule's power."]),
  ],
  ["Shape patterns follow arithmetic rules.", "A constant step makes every term a multiple.", "The rule reaches any step directly."],
  "next: what the rule never mentions.");

def(9,
  "A pattern often shows features its rule never states. 'Add 3' from 3 produces 3, 6, 9, 12 — and the terms alternate odd, even, odd, even.",
  "Nothing about parity appears in the rule, yet adding an odd number flips odd to even every single step. The structure comes free.",
  { rep: "diagram", widget: () => tap("The rule is 'add 3' from 3: 3, 6, 9, 12, 15. Tap the features the RULE never states.",
      [{ id: "parity", label: "Terms alternate odd and even", icon: "🔀", correct: true },
       { id: "step", label: "Each term is 3 more than the last", icon: "➕", feedback: "That is exactly what the rule says, so it is stated rather than discovered." },
       { id: "mult3", label: "Every term is a multiple of 3", icon: "✳️", correct: true },
       { id: "start", label: "The pattern starts at 3", icon: "🚩", feedback: "The starting value is given outright, so it is stated rather than hidden." }]),
    predict: P("Does 'add 3' mention odd and even?", [{ id: "no", label: "No — parity comes free" }, { id: "yes", label: "Yes" }], "no",
      "The rule speaks only of adding 3; the alternating parity is a consequence, not an instruction.") },
  [
    reused("HiddenFeatureMcq", "g4p9-k1", H.rule, ["Stated or discovered?", "Read the rule closely."]),
    reused("AdditiveRuleMcq", "g4p9-k2", H.rule, ["Apply the stated rule.", "Then look for extras."]),
    reused("PatternNextNumeric", "g4p9-k3", H.rule, ["Apply the stated rule.", "One more step."]),
    reused("HiddenFeatureMcq", "g4p9-ch1", H.rule, ["Consequences are not instructions.", "Both are real."]),
  ],
  ["Patterns show features the rule never states.", "Those features are consequences.", "Look beyond the instruction."],
  "next: explaining, not just extending.");

def(10,
  "Extending a pattern gives the next number. Stating the RULE gives every number — including step 20, without drawing the nineteen before it.",
  "That is why the rule is the real answer: it predicts, it generalises, and it explains why the pattern behaves the way it does.",
  { rep: "diagram", widget: () => bars("Build the first four terms of 'multiply by 2 from 2': 2, 4, 8, 16.",
      ["Term 1", "Term 2", "Term 3", "Term 4"], [2, 4, 8, 16],
      "2, 4, 8, 16 — and with the rule in hand, term 8 follows without building the six between.",
      "Each term must be double the one before: 2, 4, 8, 16."),
    predict: P("Which tells you term 20 — the next number, or the rule?", [{ id: "rule", label: "The rule" }, { id: "next", label: "The next number" }], "rule",
      "The next number advances you one step; the rule reaches any step you like.") },
  [
    reused("ExtendExplainMcq", "g4p10-k1", H.rule, ["Rules generalise.", "Numbers do not."]),
    reused("PatternNextNumeric", "g4p10-k2", H.rule, ["Apply the rule.", "From the last term."]),
    reused("PatternRuleMcq", "g4p10-k3", H.rule, ["Name the rule first.", "Then extend."]),
    reused("ExtendExplainMcq", "g4p10-ch1", H.rule, ["Explaining beats listing.", "The rule carries structure."]),
  ],
  ["The rule reaches any term.", "The next number reaches one.", "Explaining beats listing."],
  "course complete: factored, sieved, ruled, and explained.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 10, `10 lessons defined, got ${L.length}`);
const chapterTitles = ["Factors and Multiples", "Primes and the Sieve", "Patterns and Rules"];
const perChapter = [4, 2, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 6 ? 2 : 3);
const outDir = join(root, "content/courses/patterns-factors-g4");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g4p-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "symbolic") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "patterns-factors-g4",
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
      if (f === "mbFactorsNumeric") must(n[1] / n[0] === w.answer, `${id}/${s.id} mbFactors n1/n0 (side first, area second)`);
      if (f === "mbPrimeCompositeNumeric") must(w.answer === 2, `${id}/${s.id} mbPrimeComposite is always 2`);
      if (f === "mbPatternsNumeric") must(n[n.length - 1] * (n[1] / n[0]) === w.answer, `${id}/${s.id} mbPatterns last*ratio`);
      if (f === "mbTimesAsManyNumeric") must(n[0] * n[1] === w.answer, `${id}/${s.id} mbTimesAsMany n0*n1`);
    }
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 2, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
    }
    if (w.type === "areaModel" && w.requireFactors) {
      must(w.targetArea === w.requireFactors.w * w.requireFactors.h, `${id}/${s.id} areaModel factors must build the area`);
      must(w.factorFeedback, `${id}/${s.id} areaModel requireFactors needs factorFeedback`);
    }
    if (w.type === "numberLineHop") {
      const land = w.start + w.hop * w.hops;
      must(land >= w.min && land <= w.max, `${id}/${s.id} hop landing off the line`);
      for (const t of w.commonLandings ?? []) must(t.value !== land, `${id}/${s.id} hop trap equals landing`);
    }
    if (w.type === "barBuilder") must(w.categories.length === w.target.length, `${id}/${s.id} barBuilder misaligned`);
    if (w.type === "tapDiagram") {
      must(w.hotspots.some((h) => h.correct), `${id}/${s.id} tapDiagram needs a correct hotspot`);
      must(w.hotspots.some((h) => !h.correct), `${id}/${s.id} tapDiagram needs a diagnosable wrong hotspot`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "patterns-factors-g4", slug: "patterns-factors-g4", title: spec.title,
  tagline: "Build the rectangles a number allows, sieve out the composites, and name the rule behind a pattern.",
  category: "Math", gradeLevel: 4, chapters,
}, null, 2) + "\n");
console.log(`built 10 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
