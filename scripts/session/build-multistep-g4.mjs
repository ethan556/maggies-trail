#!/usr/bin/env node
// S196 — Batch E course 5/5: multistep-g4 (4.OA.A.3). Zero new generator code.
//
// Family: g4-multiply (computational solver g4Independent.cjs). Routes and widget surfaces both
// probed before authoring:
//   mbMultiStepNumeric              "A packs of B … uses C…"      -> ns[0]*ns[1] − ns[2]
//   mbTimesAsManyNumeric            "…A × B = ?"                  -> ns[0]*ns[1]
//   mbComparisonEquationsNumeric    "…how many times as long…"    -> ns[0]/ns[1]
//   mbComparisonEquationsMcq        needs CURLY quotes: “A is B times as many as C”
//                                                                 -> exact `A = B × C`
//   mbAdditiveVsMultiplicativeNumeric "…how much larger is A × B than A + B?"
//                                                                 -> ns[0]*ns[1] − (ns[0]+ns[1])
//   mbAdditiveVsMultiplicativeMcq   -> the option containing "times as many"
//   mbInterpretRemaindersNumeric    -> ceil(ns[0]/ns[1])
//   mbRemaindersNumeric             "Divide A by B. The quotient is Q…" -> ns[0] − ns[1]*ns[2]
//   mbFactorsNumeric                "one side A and an area of B" -> ns[1]/ns[0]
// Every route reads ns POSITIONALLY, so operand order in the prose is load-bearing and asserted
// per step. Tier A also needs `formal: 3` — a numeric check AFTER a manip>=2 step — which this
// factory asserts per lesson rather than discovering after a tier run.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "multistep-g4");
if (!spec || spec.lessons.length !== 8) throw new Error("spec course missing or wrong size");

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
const BAR_T = corpusTemplate("barBuilder", "measurement-data");
const EST_T = corpusTemplate("estimateSlider", "multiplication-division");
const HOP_T = corpusTemplate("numberLineHop", "add-subtract-1000-g2");
const AREA_T = corpusTemplate("areaModel", "measurement-data");

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

function traps2(answer, cands) {
  const out = [];
  for (const [v, fb] of cands) {
    if (v !== answer && v >= 0 && Number.isInteger(v) && !out.some((o) => o[0] === v)) out.push([v, fb]);
    if (out.length === 2) break;
  }
  for (let d = 3; out.length < 2; d++) {
    const v = answer + d;
    if (!out.some((o) => o[0] === v)) {
      out.push([v, "That result does not follow from the story's steps — retrace them in order."]);
    }
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

const KIT = [["packs", "markers"], ["crates", "apples"], ["boxes", "pencils"], ["trays", "seedlings"]];

/* ---------------- graded mirrors ---------------- */
function TwoOpNumeric(r) {
  const [g, item] = choose(r, KIT);
  const groups = pick(r, 5, 9), each = pick(r, 6, 9);
  const used = pick(r, 5, groups * each - 5);
  const ans = groups * each - used;
  must(ans > 0, "two-step result must stay positive");
  return { gen: "g4-multiply", form: "mbMultiStepNumeric",
    prompt: `A class buys ${groups} ${g} of ${each} ${item} and uses ${used}. How many ${item} remain?`,
    answer: ans,
    traps: traps2(ans, [
      [groups * each, `That reported the total bought; the ${used} used never came out of it.`],
      [groups * each + used, `Using ${item} removes them, so the second step subtracts rather than adds.`]]) };
}
function ThreeOpNumeric(r) {
  const [g, item] = choose(r, KIT);
  const groups = pick(r, 4, 8), each = pick(r, 5, 9);
  const used = pick(r, 4, groups * each - 6);
  const ans = groups * each - used;
  return { gen: "g4-multiply", form: "mbMultiStepNumeric",
    prompt: `After a delivery there are ${groups} ${g} of ${each} ${item}, and ${used} are handed out. How many ${item} remain?`,
    answer: ans,
    traps: traps2(ans, [
      [groups + each - used, `Adding the group COUNT to the group SIZE mixes two different things — ${groups} ${g} OF ${each} multiply.`],
      [groups * each, `That stopped after building the total; handing out ${used} is still to come.`]]) };
}
function ComparisonNumeric(r) {
  const small = pick(r, 4, 9), times = pick(r, 3, 8);
  const big = small * times;
  return { gen: "g4-multiply", form: "mbComparisonEquationsNumeric",
    prompt: `A rope is ${big} meters. Another is ${small} meters. How many times as long is the first?`,
    answer: times,
    traps: traps2(times, [
      [big - small, `That found how many meters LONGER. "How many times as long" asks for a factor, not a difference.`],
      [big, `${big} is the first rope's length; the question wants how it compares to ${small}.`]]) };
}
function ComparisonEquationMcq(r) {
  const b = pick(r, 3, 9), c = pick(r, 3, 9);
  const a = b * c;
  const correct = `${a} = ${b} × ${c}`;
  return { gen: "g4-multiply", form: "mbComparisonEquationsMcq", kind: "solverMcq",
    // the solver's regex requires CURLY quotes around the sentence
    prompt: `Write \u201c${a} is ${b} times as many as ${c}\u201d as an equation.`,
    labels: [correct, `${b} = ${a} × ${c}`, `${a} = ${b} + ${c}`, `${c} = ${b} × ${a}`],
    correct,
    feedback: {
      [correct]: `Correct — the total sits alone, and the factor times the smaller amount rebuilds it.`,
      [`${b} = ${a} × ${c}`]: `That puts the FACTOR alone; ${b} is how many times, not the amount being described.`,
      [`${a} = ${b} + ${c}`]: `"Times as many" scales rather than adds — ${b} + ${c} does not reach ${a}.`,
      [`${c} = ${b} × ${a}`]: `That makes the SMALLER amount the total, which reverses the comparison entirely.`,
    } };
}
function AdditiveVsMultiplicativeNumeric(r) {
  const a = pick(r, 4, 9), b = pick(r, 3, 8);
  const ans = a * b - (a + b);
  must(ans > 0, "product must exceed the sum for this comparison");
  return { gen: "g4-multiply", form: "mbAdditiveVsMultiplicativeNumeric",
    prompt: `Compare ${a} and ${b}: how much larger is ${a} × ${b} than ${a} + ${b}?`,
    answer: ans,
    traps: traps2(ans, [
      [a * b, `That is the product alone; the question asks how far it sits ABOVE the sum.`],
      [a + b, `That is the sum alone. The gap between the two is what was asked for.`]]) };
}
function RemainderNumeric(r) {
  const b = pick(r, 4, 9), q = pick(r, 5, 12), rem = pick(r, 1, b - 1);
  const a = b * q + rem;
  return { gen: "g4-multiply", form: "mbRemaindersNumeric",
    prompt: `Divide ${a} by ${b}. The quotient is ${q}. What is the remainder?`, answer: rem,
    traps: traps2(rem, [
      [b, `A remainder never reaches the divisor — ${b} more would form one more whole group.`],
      [q, `${q} counts the full groups; the remainder is what is left after them.`]]) };
}
function NeededGroupsNumeric(r) {
  const per = pick(r, 5, 9), full = pick(r, 5, 10), extra = pick(r, 1, per - 1);
  const total = per * full + extra;
  const ans = Math.ceil(total / per);
  must(ans === full + 1, "needed-groups answer must round the partial group UP");
  return { gen: "g4-multiply", form: "mbInterpretRemaindersNumeric",
    prompt: `${total} hikers ride buses holding ${per} each. Every hiker must ride. How many buses are needed?`,
    answer: ans,
    traps: traps2(ans, [
      [full, `${full} full buses leave ${extra} hikers behind, and every hiker has to travel.`],
      [extra, `${extra} is the leftover group of hikers, not a count of buses.`]]) };
}
function LetterValueNumeric(r) {
  const side = pick(r, 4, 9), other = pick(r, 4, 9);
  const areaVal = side * other;
  return { gen: "g4-multiply", form: "mbFactorsNumeric",
    prompt: `A rectangle has one side ${side} and an area of ${areaVal}. What is the other side?`,
    answer: other,
    traps: traps2(other, [
      [areaVal - side, `Subtracting undoes addition, not multiplication — the sides MULTIPLY to the area, so divide.`],
      [areaVal, `${areaVal} is the whole area; the letter stands for the side that pairs with ${side}.`]]) };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function OrderOfStepsMcq() {
  return { kind: "mcq",
    prompt: `"7 packs of 8 markers, then 12 markers are lost." Which equation records it?`,
    options: [
      { label: "(7 × 8) − 12", correct: true, feedback: `Correct — build the total first, then remove the 12 once from the whole collection.` },
      { label: "7 × (8 − 12)", correct: false, feedback: `That removes 12 from EVERY pack, which would leave a negative count in each one.` },
      { label: "7 + 8 − 12", correct: false, feedback: `Adding a pack count to a pack size mixes two different quantities; 7 packs OF 8 multiply.` },
      { label: "(7 × 8) + 12", correct: false, feedback: `Losing markers reduces the total, so the second step subtracts.` },
    ] };
}
function ThreeStepPlanMcq() {
  return { kind: "mcq",
    prompt: `"6 boxes of 9 pencils, 14 given away, then 20 more bought." What is the correct order?`,
    options: [
      { label: "Multiply, then subtract, then add", correct: true, feedback: `Correct — build the total, remove what left, then add what arrived; each step acts on the running total.` },
      { label: "Add, then multiply, then subtract", correct: false, feedback: `The 20 arrive last, so adding them first would multiply them by the box count too.` },
      { label: "Multiply, then add, then subtract", correct: false, feedback: `It happens to reach the same number here, but it misreports the story's sequence of events.` },
      { label: "Subtract, then multiply, then add", correct: false, feedback: `Subtracting before the total exists removes pencils from a count that has not been built.` },
    ] };
}
function ComparisonLanguageMcq() {
  return { kind: "mcq",
    prompt: `"Ben has 4 more than Ana" and "Ben has 4 times as many as Ana" — what is the difference?`,
    options: [
      { label: "'More than' adds a fixed amount; 'times as many' multiplies", correct: true, feedback: `Correct — one is a constant gap, the other is a scaling, and they only agree by coincidence.` },
      { label: "They mean the same thing", correct: false, feedback: `If Ana has 3, "4 more" gives 7 while "4 times" gives 12 — different answers from the same numbers.` },
      { label: "'Times as many' adds, 'more than' multiplies", correct: false, feedback: `That reverses them: "times as many" is the multiplying phrase.` },
      { label: "The difference only matters for large numbers", correct: false, feedback: `It matters at every size; with Ana at 3 the two readings already differ by 5.` },
    ] };
}
function RemainderMeaningMcq() {
  return { kind: "mcq",
    prompt: `74 hikers ride buses holding 9. The division gives 8 remainder 2. How many buses?`,
    options: [
      { label: "9 — the 2 leftover hikers still need a bus", correct: true, feedback: `Correct — every hiker must ride, so the partial group rounds up to a ninth bus.` },
      { label: "8 — that is the quotient", correct: false, feedback: `Eight buses carry 72 hikers and leave 2 standing at the trailhead.` },
      { label: "2 — that is the remainder", correct: false, feedback: `2 counts leftover hikers, not buses.` },
      { label: "82 — add the quotient and remainder", correct: false, feedback: `Adding those two numbers combines buses with hikers, which measures nothing.` },
    ] };
}
function EstimateCheckMcq() {
  return { kind: "mcq",
    prompt: `A student computes 7 × 68 − 90 and gets 386. Estimating gives 7 × 70 − 90 = 400. What follows?`,
    options: [
      { label: "386 is reasonable — it sits just below the estimate", correct: true, feedback: `Correct — rounding 68 up to 70 inflates the estimate slightly, so the exact answer should land just under it.` },
      { label: "386 is wrong because it is not 400", correct: false, feedback: `An estimate is a neighbourhood, not a target; landing 14 away from it is exactly what rounding predicts.` },
      { label: "The estimate is wrong because it is not 386", correct: false, feedback: `Rounding deliberately changes the numbers, so a small difference is expected.` },
      { label: "Nothing can be concluded", correct: false, feedback: `A great deal can: an answer near 40 or 4,000 would have been caught immediately.` },
    ] };
}
function RoundingDirectionMcq() {
  return { kind: "mcq",
    prompt: `You round 68 UP to 70 when estimating 7 × 68. Will the estimate be above or below the exact answer?`,
    options: [
      { label: "Above, because each of the 7 groups was made larger", correct: true, feedback: `Correct — rounding a factor up inflates every group, so the estimate overshoots by 7 × 2 = 14.` },
      { label: "Below, because rounding always loses something", correct: false, feedback: `Rounding UP adds; only rounding down would pull the estimate beneath the exact answer.` },
      { label: "Exactly equal", correct: false, feedback: `Changing a factor changes the product, so the estimate cannot match the exact value.` },
      { label: "It is impossible to say", correct: false, feedback: `It is predictable: rounding a factor up always raises the product.` },
    ] };
}
function ExplainPlanMcq() {
  return { kind: "mcq",
    prompt: `Why is stating your PLAN better than just showing the arithmetic?`,
    options: [
      { label: "A plan shows which quantity each step produces, so an error can be located", correct: true, feedback: `Correct — naming the intermediate quantity turns a wrong answer into a findable wrong STEP.` },
      { label: "Because plans are required by the rules", correct: false, feedback: `The reason is practical, not procedural: a plan makes the reasoning checkable.` },
      { label: "Because the arithmetic does not matter", correct: false, feedback: `It matters entirely — a correct plan with faulty arithmetic still gives the wrong answer.` },
      { label: "Because it makes the answer longer", correct: false, feedback: `Length is not the point; the plan carries the meaning of each intermediate number.` },
    ] };
}

const REUSE = { TwoOpNumeric, ThreeOpNumeric, ComparisonNumeric, ComparisonEquationMcq,
  AdditiveVsMultiplicativeNumeric, RemainderNumeric, NeededGroupsNumeric, LetterValueNumeric,
  OrderOfStepsMcq: () => OrderOfStepsMcq(), ThreeStepPlanMcq: () => ThreeStepPlanMcq(),
  ComparisonLanguageMcq: () => ComparisonLanguageMcq(), RemainderMeaningMcq: () => RemainderMeaningMcq(),
  EstimateCheckMcq: () => EstimateCheckMcq(), RoundingDirectionMcq: () => RoundingDirectionMcq(),
  ExplainPlanMcq: () => ExplainPlanMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Name what each step produces, then carry that quantity into the next step.") {
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

/* ---------------- manipulatives (all rated manip >= 2) ---------------- */
function bars(prompt, categories, target, success, partial) {
  const w = structuredClone(BAR_T);
  w.prompt = prompt; w.categories = categories; w.target = target;
  w.display = "bar"; w.maxVal = Math.max(...target) + 2; w.step = 1; w.histogram = false;
  w.successFeedback = success; w.partialFeedback = partial;
  must(categories.length === target.length, "bars categories/target aligned");
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

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Name the quantity each step produces, then carry it into the next for ${tag.replace(/-/g, " ")}.`,
  invariants: [`Each step of a multi-step problem produces a quantity the story never states, and the next step consumes it, which is why naming the intermediate value is what makes ${tag.replace(/-/g, " ")} checkable at all.`],
  misconceptions: [`Applying the second step to every group instead of the whole, reading "times as many" as "more than", or reporting a quotient when the story needs the partial group rounded up.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `multistep-g4:${tag}`, delayed: true,
  counterfactualPrompt: "If the second step were applied to each group instead of the total, how far off would the answer be?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  order: ["Build the total first.", "Then adjust once.", "Order carries meaning."],
  compare: ["'Times as many' scales.", "'More than' adds.", "Read the phrase."],
  rem: ["Full groups, then leftover.", "Under the divisor.", "Ask what is needed."],
  est: ["Round, keep the operations.", "Compare to the exact.", "Note which way you rounded."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "A multi-step story hides a quantity: seven packs of eight markers build 56, and the story never says 56 — you have to produce it before anything can be taken away.",
  "Build the total first, then adjust it once. Applying the second step to every group instead of the whole is the error this order prevents.",
  { rep: "diagram", widget: () => bars("Build the total before anything is lost: 7 packs of 8 markers.",
      ["Pack 1", "Pack 2", "Pack 3", "Pack 4", "Pack 5", "Pack 6", "Pack 7"], [8, 8, 8, 8, 8, 8, 8],
      "56 markers — the hidden total, ready for the 12 lost ones to come off it once.",
      "Every pack holds the same 8 markers; build each bar to 8."),
    predict: P("7 packs of 8, then 12 lost. Is it 7 × (8 − 12)?", [{ id: "no", label: "No — (7 × 8) − 12" }, { id: "yes", label: "Yes" }], "no",
      "Removing 12 from every pack would empty them; the twelve come off the whole collection once.") },
  [
    reused("TwoOpNumeric", "g4s1-k1", H.order, ["Build the total.", "Then remove once."]),
    reused("OrderOfStepsMcq", "g4s1-k2", H.order, ["Whole or each group?", "The words decide."]),
    reused("TwoOpNumeric", "g4s1-k3", H.order, ["Equal groups multiply.", "Losses subtract."]),
    reused("TwoOpNumeric", "g4s1-ch1", H.order, ["Bigger stories, same order.", "Total, then adjust."]),
  ],
  ["Multi-step stories hide a total.", "Build it before adjusting.", "The adjustment hits the whole, once."],
  "next: three steps in a row.");

def(2,
  "Three operations chain the same way: build the total, remove what left, then add what arrived — each step acting on the running total.",
  "Naming the quantity after every step is what keeps a long chain honest. A number you cannot name is a number you cannot check.",
  { rep: "diagram", widget: () => estimate("6 boxes of 9 pencils, 14 given away, 20 bought — estimate what remains.", 5, 500, 60, "pencils",
      "Too low — six boxes of nine already build over fifty pencils before anything changes.",
      "Too high — the total starts at 54, and the two adjustments are small.",
      "About 60 — 54 built, 14 removed, 20 added, landing on exactly 60."),
    predict: P("6 boxes of 9, 14 out, 20 in. Which order?", [{ id: "mult", label: "Multiply, subtract, add" }, { id: "add", label: "Add, multiply, subtract" }], "mult",
      "The 20 arrive last, so adding them first would multiply them by the box count too.") },
  [
    reused("ThreeOpNumeric", "g4s2-k1", H.order, ["Build, remove, add.", "In story order."]),
    reused("ThreeStepPlanMcq", "g4s2-k2", H.order, ["Each step uses the running total.", "Sequence matters."]),
    reused("ThreeOpNumeric", "g4s2-k3", H.order, ["Name each quantity.", "Then continue."]),
    reused("TwoOpNumeric", "g4s2-ch1", H.order, ["Shorter chains, same discipline.", "Total first."]),
  ],
  ["Chain the steps in story order.", "Each acts on the running total.", "Name every intermediate quantity."],
  "next: comparison stories.");

def(3,
  "Multiplicative comparison uses a factor, not a gap: a 45-metre rope is five TIMES as long as a 9-metre one, and also 36 metres longer.",
  "Both statements are true and they mean different things. 'Times as many' scales; 'more than' adds a fixed amount.",
  { rep: "diagram", widget: () => bars("Compare the ropes: build one bar of 9 and one of 45, in metres.",
      ["Short rope", "Long rope"], [9, 45],
      "9 and 45 — the long rope is five times the short one, and also 36 metres longer.",
      "Build the short rope to 9 and the long rope to 45 metres."),
    predict: P("45 m versus 9 m — how many TIMES as long?", [{ id: "five", label: "5 times" }, { id: "thirtysix", label: "36 times" }], "five",
      "36 is how many metres LONGER; the factor is 45 ÷ 9 = 5.") },
  [
    reused("ComparisonNumeric", "g4s3-k1", H.compare, ["Divide for a factor.", "Subtract for a gap."]),
    reused("ComparisonEquationMcq", "g4s3-k2", H.compare, ["Total alone on one side.", "Factor times the smaller."]),
    reused("ComparisonLanguageMcq", "g4s3-k3", H.compare, ["'Times' scales.", "'More' adds."]),
    reused("AdditiveVsMultiplicativeNumeric", "g4s3-ch1", H.compare, ["Product versus sum.", "The gap between them."]),
  ],
  ["'Times as many' is a factor.", "'More than' is a gap.", "Divide for one, subtract for the other."],
  "next: when the division does not come out even.");

def(4,
  "Multi-step problems often end in a remainder, and the remainder is only the beginning of the answer — the story decides what to do with it.",
  "Eight full buses with two hikers left over means nine buses are needed. The arithmetic is the same; the answer is not.",
  { rep: "diagram", widget: () => hop("74 hikers into buses of 9. Hop by nines to find the full buses.", 0, 90, 0, 9, 8,
      "72 after eight hops — eight full buses, with two hikers still waiting for a ninth.",
      [[81, "Nine hops pass 74; only eight buses fill completely."],
       [63, "Seven hops leave eleven hikers over, which is more than one busful."]],
      "Short of the landing — eight hops of nine reach 72, just under 74.",
      "Past the landing — the eighth hop of nine stops at 72."),
    predict: P("74 hikers, buses of 9, everyone rides. How many buses?", [{ id: "nine", label: "9" }, { id: "eight", label: "8" }], "nine",
      "Eight buses carry 72 and leave two behind — those two need a ninth bus.") },
  [
    reused("RemainderNumeric", "g4s4-k1", H.rem, ["Full groups first.", "Then the leftover."]),
    reused("NeededGroupsNumeric", "g4s4-k2", H.rem, ["Everyone must ride.", "Round the partial group up."]),
    reused("RemainderMeaningMcq", "g4s4-k3", H.rem, ["The question decides.", "Same arithmetic."]),
    reused("NeededGroupsNumeric", "g4s4-ch1", H.rem, ["Bigger groups, same rule.", "Leftovers still travel."]),
  ],
  ["A remainder is not the whole answer.", "The story decides its meaning.", "Partial groups often round up."],
  "next: naming the unknown.");

def(5,
  "When a quantity is unknown, give it a letter and write the equation the story describes. The letter is a placeholder standing where the number will go.",
  "An equation with a letter records the plan itself, which is why it can be checked long before the arithmetic is finished.",
  { rep: "diagram", widget: () => area("A rectangle has area 56 and one side 7. Build it to find the unknown side.", 8, 7,
      "8 — because 7 × 8 = 56, so the letter standing for the missing side is 8.",
      "Smaller than 56 — keep building until the rectangle reaches the full area.",
      "Larger than 56 — one side has grown past the pair the problem names.",
      "That area is right, but from a different pair — this rectangle must measure 8 by 7."),
    predict: P("In 7 × n = 56, what does n stand for?", [{ id: "side", label: "The missing side" }, { id: "area", label: "The area" }], "side",
      "56 is already the area; the letter holds the factor that pairs with 7 to produce it.") },
  [
    reused("LetterValueNumeric", "g4s5-k1", H.order, ["The letter is a factor.", "Divide to find it."]),
    reused("ComparisonEquationMcq", "g4s5-k2", H.compare, ["Write the relationship.", "Total alone."]),
    reused("LetterValueNumeric", "g4s5-k3", H.order, ["Undo the multiplication.", "Division finds it."]),
    reused("ComparisonNumeric", "g4s5-ch1", H.compare, ["Factors compare quantities.", "Divide."]),
  ],
  ["Letters name unknown quantities.", "The equation records the plan.", "Undo the operation to solve it."],
  "next: knowing roughly first.");

def(6,
  "Estimating before computing gives a neighbourhood for the answer: 7 × 68 − 90 rounds to 7 × 70 − 90 = 400.",
  "The estimate guards the most expensive error in multi-step work — a misplaced digit, which is wrong by a factor of ten.",
  { rep: "diagram", widget: () => estimate("7 × 68 − 90 — slide to estimate before computing.", 20, 4000, 400, "units",
      "Too low — seven groups of about seventy already exceed four hundred before the ninety comes off.",
      "Too high — seven times seventy is only 490, and ninety is still to be removed.",
      "About 400 — from 7 × 70 − 90, and the exact answer is 386."),
    predict: P("Estimating 7 × 68 − 90, which rounding helps?", [{ id: "seventy", label: "7 × 70 − 90" }, { id: "none", label: "No rounding" }], "seventy",
      "Seventy is friendly and close to 68, so the rounded chain lands within fourteen of the exact answer.") },
  [
    reused("EstimateCheckMcq", "g4s6-k1", H.est, ["Round, keep the operations.", "Compare after."]),
    reused("TwoOpNumeric", "g4s6-k2", H.est, ["The exact answer decides.", "The estimate guards it."]),
    reused("EstimateCheckMcq", "g4s6-k3", H.est, ["Close means plausible.", "Ten times out is a slip."]),
    reused("ThreeOpNumeric", "g4s6-ch1", H.order, ["Longer chains, still estimable.", "Round each step."]),
  ],
  ["Estimate before computing.", "Round but keep the operations.", "The estimate guards place value."],
  "next: which way the estimate leans.");

def(7,
  "Knowing WHICH WAY you rounded sharpens the check: rounding 68 up to 70 inflates every one of the seven groups, so the estimate sits above the exact answer.",
  "An estimate that you know is high turns 'about 400' into 'a little under 400' — a far tighter net for catching mistakes.",
  { rep: "diagram", widget: () => estimate("Rounding 68 up to 70 in 7 × 68 — slide to the size of the overshoot.", 1, 200, 14, "units",
      "Too low — each of the seven groups gained 2, so the total gained more than that.",
      "Too high — seven groups each gaining 2 adds 14, not more.",
      "14 — seven groups each inflated by 2, which is exactly why the estimate sits above the exact value."),
    predict: P("Rounding a factor UP — is the estimate above or below?", [{ id: "above", label: "Above" }, { id: "below", label: "Below" }], "above",
      "Every group was made larger, so the product grew — the estimate overshoots by 7 × 2 = 14.") },
  [
    reused("RoundingDirectionMcq", "g4s7-k1", H.est, ["Up inflates.", "Down deflates."]),
    reused("AdditiveVsMultiplicativeNumeric", "g4s7-k2", H.est, ["Measure the gap.", "Product minus sum."]),
    reused("EstimateCheckMcq", "g4s7-k3", H.est, ["A leaning estimate is tighter.", "Know the direction."]),
    reused("TwoOpNumeric", "g4s7-ch1", H.order, ["Then compute exactly.", "Compare to the lean."]),
  ],
  ["Note which way you rounded.", "Rounding a factor up raises the product.", "A leaning estimate catches more."],
  "next: explaining the plan.");

def(8,
  "Explaining the plan names what each step produces: build the total, remove the losses, add the arrivals. Each name is a quantity you can check.",
  "That is the difference between a wrong answer and a findable wrong step — and it is the whole reason multi-step work is written down at all.",
  { rep: "diagram", widget: () => bars("Draw the plan for 6 boxes of 9 pencils: build six equal parts.",
      ["Box 1", "Box 2", "Box 3", "Box 4", "Box 5", "Box 6"], [9, 9, 9, 9, 9, 9],
      "54 pencils in six equal parts — the named intermediate quantity every later step depends on.",
      "Every box holds the same 9 pencils; build each bar to 9."),
    predict: P("Why name the 54 rather than push straight on?", [{ id: "check", label: "So an error can be located" }, { id: "rules", label: "Because rules require it" }], "check",
      "A named quantity can be checked on its own, which turns a wrong answer into a findable wrong step.") },
  [
    reused("ExplainPlanMcq", "g4s8-k1", H.order, ["Name each quantity.", "Then it can be checked."]),
    reused("ThreeOpNumeric", "g4s8-k2", H.order, ["Follow the named plan.", "Step by step."]),
    reused("ThreeStepPlanMcq", "g4s8-k3", H.order, ["Order records the story.", "Explain it."]),
    reused("NeededGroupsNumeric", "g4s8-ch1", H.rem, ["Plans handle remainders too.", "Say what they mean."]),
  ],
  ["Name what each step produces.", "Named quantities can be checked.", "A plan turns errors into findable steps."],
  "course complete: chained, compared, interpreted, estimated, and explained.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 8, `8 lessons defined, got ${L.length}`);
const chapterTitles = ["Chaining the Steps", "Comparisons and Remainders", "Checking and Explaining"];
const perChapter = [3, 3, 2];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 3 ? 1 : n <= 6 ? 2 : 3);
const outDir = join(root, "content/courses/multistep-g4");
mkdirSync(join(outDir, "lessons"), { recursive: true });

const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);
const MANIP2 = new Set(["numberLineHop", "barBuilder", "estimateSlider", "numberLinePlace", "areaModel", "columnCalc", "fractionBar", "tapDiagram"]);

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g4s-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "symbolic") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "multistep-g4",
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
      const n = (w.prompt.match(/\d+/g) || []).map(Number);
      const f = s.variant?.form;
      if (f === "mbMultiStepNumeric") must(n[0] * n[1] - n[2] === w.answer, `${id}/${s.id} n0*n1−n2`);
      if (f === "mbComparisonEquationsNumeric") must(n[0] / n[1] === w.answer, `${id}/${s.id} n0/n1 (larger FIRST)`);
      if (f === "mbAdditiveVsMultiplicativeNumeric") must(n[0] * n[1] - (n[0] + n[1]) === w.answer, `${id}/${s.id} product−sum`);
      if (f === "mbRemaindersNumeric") {
        must(n[0] - n[1] * n[2] === w.answer, `${id}/${s.id} n0−n1*n2`);
        must(w.answer >= 0 && w.answer < n[1], `${id}/${s.id} remainder must sit under the divisor`);
      }
      if (f === "mbInterpretRemaindersNumeric") must(Math.ceil(n[0] / n[1]) === w.answer, `${id}/${s.id} ceil(n0/n1)`);
      if (f === "mbFactorsNumeric") must(n[1] / n[0] === w.answer, `${id}/${s.id} n1/n0 (side first, area second)`);
    }
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 4, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
      if (s.variant?.form === "mbComparisonEquationsMcq") {
        must(/\u201c\d+ is \d+ times as many as \d+\u201d/.test(w.prompt),
          `${id}/${s.id} mbComparisonEquationsMcq needs CURLY quotes around the sentence`);
      }
    }
    if (w.type === "barBuilder") must(w.categories.length === w.target.length, `${id}/${s.id} barBuilder misaligned`);
    if (w.type === "numberLineHop") {
      const land = w.start + w.hop * w.hops;
      must(land >= w.min && land <= w.max, `${id}/${s.id} hop landing off the line`);
      for (const t of w.commonLandings ?? []) must(t.value !== land, `${id}/${s.id} hop trap equals landing`);
    }
    if (w.type === "areaModel" && w.requireFactors) {
      must(w.targetArea === w.requireFactors.w * w.requireFactors.h, `${id}/${s.id} areaModel factors must build the area`);
      must(w.factorFeedback, `${id}/${s.id} areaModel requireFactors needs factorFeedback`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "multistep-g4", slug: "multistep-g4", title: spec.title,
  tagline: "Name what each step produces, carry it forward, and the answer becomes checkable.",
  category: "Math", gradeLevel: 4, chapters,
}, null, 2) + "\n");
console.log(`built 8 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
