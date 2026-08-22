#!/usr/bin/env node
// S195 — Batch D course 3/3: word-problems-g3 (3.OA.D.8). Zero new generator code.
//
// Two-step word problems have no single "two-step" generator, so the structure is honest about
// where each part of the reasoning lives:
//   * TwoStepTradeNumeric (g2-add-subtract-100) IS a genuine two-step route: n0 − n1 + n2,
//     exactly the had / spent / gained story shape. It carries the arithmetic two-steppers.
//   * The multiply and divide STEPS ride the g3 fluency routes (all probed before authoring):
//       Mult(Table\d+|MixedSmall|MixedLarge|Squares|RecallSpeed|WholeTable)Numeric -> n[0]*n[1]
//         (so the FIRST TWO numbers in the prompt must be the factors)
//       MultMissingFactorNumeric  "A × ? = P"                    -> n[1]/n[0]
//       MultFactFamilyNumeric     "…what is P ÷ B?"              -> P/B
//       DivMixedNumeric / DivThinkMultNumeric / DivBy*Numeric     -> n[0]/n[1]
//       DivMissingNumeric         "A × ? = P"                    -> n[1]/n[0]
//   * Pv1000RealworldNumeric (g2-place-value-1000) -> arithmetic(prompt), first "+" pair.
//   * The parts a solver cannot grade — finding the hidden question, choosing the equation,
//     judging reasonableness, spotting extra information — are authored MCQs with a diagnosis
//     in every distractor, which is where the actual 3.OA.D.8 reasoning is assessed.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "word-problems-g3");
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
const EST_T = corpusTemplate("estimateSlider", "multiplication-division");
const HOP_T = corpusTemplate("numberLineHop", "add-subtract-1000-g2");
const BAR_T = corpusTemplate("barBuilder", "measurement-data");
const NLP_T = corpusTemplate("numberLinePlace", "place-value");
const TAP_T = corpusTemplate("tapDiagram", "fractions");

const REG_MULT = new Set(["MultTable2Numeric","MultTable3Numeric","MultTable4Numeric","MultTable5Numeric",
  "MultTable6Numeric","MultTable7Numeric","MultTable8Numeric","MultTable9Numeric","MultTable10Numeric",
  "MultSquaresNumeric","MultHardFactsNumeric","MultDeriveNumeric","MultMixedSmallNumeric",
  "MultMixedLargeNumeric","MultRecallSpeedNumeric","MultMissingFactorNumeric","MultFactFamilyNumeric",
  "MultWholeTableNumeric"]);
const REG_DIV = new Set(["DivBy2Numeric","DivBy3Numeric","DivBy45Numeric","DivBy67Numeric","DivBy89Numeric",
  "DivBy10Numeric","DivThinkMultNumeric","DivMissingNumeric","DivSpecialNumeric","DivZeroMcq",
  "DivMixedNumeric","DivChooseMcq"]);
const REG100 = new Set(["Add2DigitNumeric","Add2DigitMcq","AddOnesNumeric","AddOnesMcq",
  "AddTensNumeric","AddTensMcq","ChooseStepsNumeric","ChooseStepsMcq","DoublesNumeric","DoublesMcq",
  "Fluency20Numeric","Fluency20Mcq","NearDoublesNumeric","NearDoublesMcq","OddEvenMcq",
  "OddEvenOddEvenPairs","ParitySumNumeric","ParitySumMcq","RegroupAddNumeric","Sub2DigitMcq",
  "SubOnesMcq","SubTensMcq","TwoStepTradeNumeric","TwoStepTradeMcq","UnbundleSubMcq"]);
const REG = { "g3-mult-fluency": REG_MULT, "g3-div-fluency": REG_DIV, "g2-add-subtract-100": REG100 };

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
  for (let d = 5; out.length < 2; d++) {
    const v = answer + d;
    if (v !== answer && !out.some((o) => o[0] === v)) {
      out.push([v, "That total does not follow from the two steps the story describes — retrace them in order."]);
    }
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

const KIT = [["vans", "hikers"], ["crates", "apples"], ["shelves", "books"], ["tables", "chairs"], ["boxes", "markers"]];

/* ---------------- graded mirrors ---------------- */
function TwoStepStoryNumeric(r) {
  const start = pick(r, 180, 640), spent = pick(r, 40, 150), gained = pick(r, 30, 140);
  const ans = start - spent + gained;
  const story = choose(r, [
    ["The trail club had", "stickers", "gave away", "earned"],
    ["The library had", "books", "loaned out", "received"],
    ["The garden had", "seeds", "planted", "was gifted"],
  ]);
  return { gen: "g2-add-subtract-100", form: "TwoStepTradeNumeric",
    prompt: `${story[0]} ${start} ${story[1]}. It ${story[2]} ${spent}, then ${story[3]} ${gained} more. How many ${story[1]} now?`,
    answer: ans,
    traps: traps2(ans, [
      [start - spent - gained, `The second step ADDED ${gained}; subtracting it sends the total the wrong way.`],
      [start + spent + gained, `The first step took ${spent} away — adding it counts what was lost as if it were still there.`]]) };
}
function AddThenMultiplyNumeric(r) {
  const groups = pick(r, 3, 8), each = pick(r, 4, 9);
  const ans = groups * each;
  const [g, item] = choose(r, KIT);
  const singularGroup = g.replace(/s$/, "");
  return { gen: "g3-mult-fluency", form: "MultMixedSmallNumeric",
    prompt: `There were ${groups - 1} ${g}. One more ${singularGroup} arrived. Each ${singularGroup} holds ${each} ${item}. How many ${item} are there now?`,
    answer: ans,
    traps: traps2(ans, [
      [groups + each, `That added the two numbers; ${groups} groups OF ${each} calls for multiplication.`],
      [ans - each, `That is one group short — the arriving ${g.replace(/s$/, "")} is already counted in the ${groups}.`]]) };
}
function MultiplyThenSubtractNumeric(r) {
  const groups = pick(r, 4, 9), each = pick(r, 3, 8);
  const total = groups * each;
  const taken = pick(r, 2, Math.max(2, total - 2));
  const ans = total - taken;
  must(ans > 0, "multiply-then-subtract must leave a positive remainder");
  return { gen: "g2-add-subtract-100", form: "TwoStepTradeNumeric",
    prompt: `${groups} shelves hold ${each} markers each. Students take ${taken} markers. How many markers remain?`,
    answer: ans,
    traps: traps2(ans, [
      [total + taken, `Taking markers away lowers the count; adding treats a loss like a gain.`],
      [total, `That reported the starting pile — the ${taken} the students took never came off.`]]) };
}
function DivideThenAddNumeric(r) {
  const divisor = pick(r, 2, 9), quotient = pick(r, 2, 9);
  const total = divisor * quotient;
  const ans = quotient;
  return { gen: "g3-div-fluency", form: "DivMixedNumeric",
    prompt: `${total} hikers split evenly into ${divisor} groups. ${total} ÷ ${divisor} = ?`, answer: ans,
    traps: traps2(ans, [
      [total - divisor, `That subtracted one group's worth; splitting evenly asks how many are in EACH group.`],
      [divisor, `${divisor} counts the GROUPS, not the hikers inside one of them.`]]) };
}
function MissingFactorNumeric(r) {
  const known = pick(r, 3, 9), missing = pick(r, 3, 9);
  const product = known * missing;
  return { gen: "g3-mult-fluency", form: "MultMissingFactorNumeric",
    prompt: `${known} × ? = ${product}`, answer: missing,
    traps: traps2(missing, [
      [product - known, `Subtracting undoes addition, not multiplication — ask what times ${known} makes ${product}.`],
      [product, `${product} is the whole total; the letter stands for the size of one group.`]]) };
}
function FactFamilyNumeric(r) {
  const a = pick(r, 3, 9), b = pick(r, 3, 9);
  const p = a * b;
  return { gen: "g3-mult-fluency", form: "MultFactFamilyNumeric",
    prompt: `You know ${a} × ${b} = ${p}. So what is ${p} ÷ ${b}?`, answer: a,
    traps: traps2(a, [
      [b, `${b} is the number you divided BY; the family says the answer is the other factor.`],
      [p, `${p} is the product itself — dividing it by ${b} undoes the multiplication.`]]) };
}
function ThinkMultNumeric(r) {
  const d = pick(r, 3, 9), q = pick(r, 3, 9);
  const p = d * q;
  return { gen: "g3-div-fluency", form: "DivThinkMultNumeric",
    prompt: `${p} ÷ ${d} = ? Think: ${d} × ? = ${p}.`, answer: q,
    traps: traps2(q, [
      [p - d, `Subtraction is not the inverse of division — ask what times ${d} reaches ${p}.`],
      [d, `${d} is the divisor; the answer is the factor that pairs with it to make ${p}.`]]) };
}
function RealworldAddNumeric(r) {
  const a = pick(r, 120, 460), b = pick(r, 130, 420);
  return { gen: "g2-add-subtract-100", form: "Add2DigitNumeric",
    prompt: `${a} + ${b} = ?`, answer: a + b,
    traps: traps2(a + b, [
      [Math.abs(a - b), `That found the difference; putting the two amounts together calls for addition.`],
      [a + b - 100, `A hundred went missing in the carry — check the tens column.`]]) };
}
/* ---------------- variant-less reasoning MCQs (the 3.OA.D.8 core) ---------------- */
function HiddenQuestionMcq() {
  return { kind: "mcq",
    prompt: `"A box holds 6 pencils. Mia buys 4 boxes and gives away 5 pencils. How many does she keep?" What must you find FIRST?`,
    options: [
      { label: "How many pencils are in 4 boxes", correct: true, feedback: `Correct — the hidden question. You cannot subtract 5 until you know the total the 4 boxes hold.` },
      { label: "How many pencils she gives away", correct: false, feedback: `The story already states that: 5. A hidden question is one the story makes you work out.` },
      { label: "How many boxes she buys", correct: false, feedback: `The story states that too: 4. That number is given, not hidden.` },
      { label: "How many pencils she keeps", correct: false, feedback: `That is the FINAL question, and it is the one you cannot reach until the hidden step is done.` },
    ] };
}
function ChooseEquationMcq(r) {
  const kind = pick(r, 0, 1);
  if (kind === 0) {
    return { kind: "mcq",
      prompt: `"There are 5 tables with 4 chairs each. 3 chairs break. How many chairs work?" Which equation matches?`,
      options: [
        { label: "(5 × 4) − 3", correct: true, feedback: `Correct — build the total first, then remove the broken ones; the parentheses hold the hidden step.` },
        { label: "5 × (4 − 3)", correct: false, feedback: `That breaks 3 chairs at EVERY table before multiplying — the story breaks only 3 in total.` },
        { label: "5 + 4 − 3", correct: false, feedback: `Adding tables to chairs mixes two different things; 5 tables OF 4 chairs is multiplication.` },
        { label: "(5 × 4) + 3", correct: false, feedback: `Broken chairs come OUT of the total, so the second step subtracts rather than adds.` },
      ] };
  }
  return { kind: "mcq",
    prompt: `"18 apples split evenly into 3 bags, then 2 more apples go in each bag." Which equation gives one bag's count?`,
    options: [
      { label: "(18 ÷ 3) + 2", correct: true, feedback: `Correct — share first to find one bag's six, then add the 2 that join that same bag.` },
      { label: "18 ÷ (3 + 2)", correct: false, feedback: `That splits the apples into 5 bags; the story has 3 bags and adds apples afterward.` },
      { label: "(18 + 2) ÷ 3", correct: false, feedback: `That adds 2 apples once before sharing, but each of the 3 bags gains 2 after the split.` },
      { label: "18 − 3 + 2", correct: false, feedback: `Splitting evenly is division, not subtraction — 3 names the number of bags.` },
    ] };
}
function BarModelMcq() {
  return { kind: "mcq",
    prompt: `A bar model shows 4 equal parts of 7, with 6 crossed off. What does the model say?`,
    options: [
      { label: "(4 × 7) − 6 = 22", correct: true, feedback: `Correct — four equal parts of 7 build 28, and the crossed-off 6 come straight back out.` },
      { label: "4 × (7 − 6) = 4", correct: false, feedback: `That crosses 6 off EVERY part; the model crosses off 6 from the whole bar once.` },
      { label: "4 + 7 − 6 = 5", correct: false, feedback: `Equal parts stack into a product, not a sum — four parts of 7 is 4 × 7.` },
      { label: "(4 × 7) + 6 = 34", correct: false, feedback: `Crossed off means removed, so the last step subtracts.` },
    ] };
}
function EstimateFirstMcq() {
  return { kind: "mcq",
    prompt: `Before computing 7 × 48 − 96, what is the most useful estimate?`,
    options: [
      { label: "About 7 × 50 − 100 = 250", correct: true, feedback: `Correct — round each number to a friendly one and the answer's neighbourhood appears before any exact work.` },
      { label: "About 7 × 48 = 336, so about 336", correct: false, feedback: `That estimates only the first step; the subtraction still has to shrink the total.` },
      { label: "About 7 + 48 − 96, so below zero", correct: false, feedback: `Estimating must keep the story's operations — 7 groups of 48 is a product, not a sum.` },
      { label: "You cannot estimate a two-step problem", correct: false, feedback: `You can: estimate each step in turn, and the rounded chain lands near the exact answer.` },
    ] };
}
function RoundingCheckMcq() {
  return { kind: "mcq",
    prompt: `A student computes 6 × 39 + 21 and gets 255. Rounding says about 6 × 40 + 20 = 260. What should they conclude?`,
    options: [
      { label: "255 is reasonable — it sits close to 260", correct: true, feedback: `Correct — the estimate is a neighbourhood, and 255 lands inside it, so the exact work survives the check.` },
      { label: "255 is wrong because it is not 260", correct: false, feedback: `An estimate is never the exact answer; it only tells you whether the exact one is plausible.` },
      { label: "The estimate is wrong because it is not 255", correct: false, feedback: `Rounding deliberately changes the numbers, so it is expected to differ a little from the exact result.` },
      { label: "Nothing — estimates prove nothing", correct: false, feedback: `They rule out big mistakes: an answer of 2,550 or 25 would have been caught immediately.` },
    ] };
}
function UnreasonableMcq() {
  return { kind: "mcq",
    prompt: `"8 crates hold 9 apples each. 12 apples are eaten." A student answers 150 apples left. Why is that unreasonable?`,
    options: [
      { label: "8 crates hold only 72 apples, so 150 is impossible", correct: true, feedback: `Correct — the answer exceeds the total that ever existed, and eating can only make it smaller.` },
      { label: "Because 150 is not a multiple of 8", correct: false, feedback: `Multiples are not the issue; after subtracting 12 the result need not be a multiple of anything.` },
      { label: "Because 150 is an even number", correct: false, feedback: `Evenness says nothing about reasonableness here — 60 is even and perfectly plausible.` },
      { label: "It is reasonable", correct: false, feedback: `It cannot be: the story never contains more than 72 apples, so 150 has nowhere to come from.` },
    ] };
}
function ExtraInfoMcq() {
  return { kind: "mcq",
    prompt: `"Sam has 3 red bags and 4 blue bags. Each blue bag holds 6 marbles. How many marbles are in the blue bags?" Which number is NOT needed?`,
    options: [
      { label: "The 3 red bags", correct: true, feedback: `Correct — the question asks only about blue bags, so the red ones are extra information.` },
      { label: "The 4 blue bags", correct: false, feedback: `You need it: the number of blue bags is one of the two factors in the product.` },
      { label: "The 6 marbles per blue bag", correct: false, feedback: `You need it: it is the size of each group being counted.` },
      { label: "All three numbers are needed", correct: false, feedback: `The red bags never enter the calculation; a story can carry numbers the question does not use.` },
    ] };
}
function AuthorProblemMcq() {
  return { kind: "mcq",
    prompt: `You want to write a two-step problem answered by (5 × 6) + 4. Which story fits?`,
    options: [
      { label: "5 baskets hold 6 eggs each, then 4 more eggs are added", correct: true, feedback: `Correct — equal groups build the product, and the 4 join the total once, exactly as the equation says.` },
      { label: "5 baskets hold 6 eggs each, and 4 eggs are added to each basket", correct: false, feedback: `That is 5 × (6 + 4) — adding to EVERY basket happens before the multiplication.` },
      { label: "5 eggs and 6 eggs and 4 eggs are put together", correct: false, feedback: `That is 5 + 6 + 4; nothing in it forms equal groups, so no multiplication appears.` },
      { label: "5 baskets share 6 eggs, then 4 are eaten", correct: false, feedback: `Sharing is division and eating is subtraction — neither matches the equation you set out to write.` },
    ] };
}

const REUSE = { TwoStepStoryNumeric, AddThenMultiplyNumeric, MultiplyThenSubtractNumeric,
  DivideThenAddNumeric, MissingFactorNumeric, FactFamilyNumeric, ThinkMultNumeric, RealworldAddNumeric,
  HiddenQuestionMcq: () => HiddenQuestionMcq(), ChooseEquationMcq, BarModelMcq: () => BarModelMcq(),
  EstimateFirstMcq: () => EstimateFirstMcq(), RoundingCheckMcq: () => RoundingCheckMcq(),
  UnreasonableMcq: () => UnreasonableMcq(), ExtraInfoMcq: () => ExtraInfoMcq(),
  AuthorProblemMcq: () => AuthorProblemMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Name the hidden question first, answer it, and only then take the second step.") {
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
  return { variant: { gen: out.gen, form: out.form },
    widget: { type: "numeric", prompt: out.prompt, answer: out.answer, tolerance: 0, unit: "",
      commonErrors, fallbackFeedback: fallback, successFeedback: `Correct — ${out.answer}.` },
    hints, ev };
}

/* ---------------- manipulatives ----------------
 * Every engine here rates manip>=2 in scripts/engine-capabilities.json AND genuinely models the
 * lesson's mathematics: equal-group journeys on a line, equal groups as bars, the landing point
 * of a two-step expression, and selecting which stated numbers a question actually consumes.
 * dragBucket / matchPairs / steppedReveal were dropped: they rate manip 1 (a sort or a reveal is
 * a pick, not a manipulation), and sorting stories into buckets never builds the quantity the
 * hidden question asks for. */
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
  must(start >= min && start <= max, "hop start off the line");
  w.successFeedback = success;
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
  must(Math.max(...target) <= w.maxVal, "bars cap");
  return w;
}
function landing(prompt, min, max, target, success, traps) {
  const w = structuredClone(NLP_T);
  w.prompt = prompt; w.min = min; w.max = max; w.step = 1; w.tickStep = Math.max(1, Math.round((max - min) / 10));
  w.target = target; w.start = min;
  if ("fractionDen" in w) delete w.fractionDen;              // integer line, not a fraction line
  if ("showDistanceFromZero" in w) delete w.showDistanceFromZero;
  w.successFeedback = success;
  w.commonPlacements = traps.map(([value, feedback]) => {
    must(value !== target, `landing trap ${value} equals target`);
    must(value >= min && value <= max, `landing trap ${value} off the line`);
    must(feedback.length >= 25, "landing trap feedback short");
    return { value, feedback };
  });
  must(min <= target && target <= max, "landing target on the line");
  return w;
}
function tap(prompt, hotspots) {
  const w = structuredClone(TAP_T);
  w.prompt = prompt; w.mode = "selectAll"; w.canvas = { w: 3, h: 1 };
  w.hotspots = hotspots.map((h, i) => ({
    id: h.id, x: Math.round(((i + 0.5) / hotspots.length) * 100), y: 50,
    label: h.label, icon: h.icon, count: 1,
    ...(h.correct ? { correct: true } : { feedback: h.feedback }),
  }));
  must(w.hotspots.some((h) => h.correct), "tapDiagram needs a correct hotspot");
  must(w.hotspots.some((h) => !h.correct), "tapDiagram needs a wrong hotspot to diagnose");
  for (const h of hotspots) if (!h.correct) must(h.feedback.length >= 25, "tapDiagram wrong-hotspot feedback short");
  return w;
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Separate the hidden question from the final one, then take each step in order for ${tag.replace(/-/g, " ")}.`,
  invariants: [`A two-step problem hides one question inside another: the first step produces a quantity the story never states, and the second step consumes it, which is what makes ${tag.replace(/-/g, " ")} a two-step problem rather than two separate ones.`],
  misconceptions: [`Answering the hidden question and stopping, applying the second step to each group instead of the whole, or using a number the question never needed.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `word-problems-g3:${tag}`, delayed: true,
  counterfactualPrompt: "Which numbers would have to change for the SECOND step to become unnecessary?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  hidden: ["Find the unstated quantity.", "Answer it first.", "Then take the final step."],
  order: ["Groups first, then change.", "Parentheses hold step one.", "Order is the meaning."],
  est: ["Round each number.", "Estimate the chain.", "Compare to the exact."],
  judge: ["Ask what is possible.", "Compare to the total.", "Impossible means wrong."],
  read: ["Read for the question.", "Not every number is used.", "Match numbers to steps."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "A two-step problem hides a question inside itself. The story never states the middle quantity — you have to build it before the real question can be answered.",
  "Find the hidden question first. It is always the one whose answer the final question needs but the story refuses to give you.",
  { rep: "diagram", widget: () => estimate("4 boxes hold 6 pencils each, then 5 are given away. First slide to the HIDDEN total: how many pencils the boxes hold.", 4, 240, 24, "pencils",
      "Too few — four boxes of six is more than that; the hidden total is what subtraction needs.",
      "Too many — six pencils per box across four boxes cannot reach that high.",
      "24 — the total the story never states. Only now can the 5 be taken away."),
    predict: P("6 pencils per box, 4 boxes, 5 given away. What must you find first?", [{ id: "total", label: "The total in 4 boxes" }, { id: "given", label: "How many she gave away" }], "total",
      "The story already states 5. The total in 4 boxes is the number it hides — and the one subtraction needs.") },
  [
    reused("HiddenQuestionMcq", "g3w1-k1", H.hidden, ["Hidden means unstated.", "The story withholds it."]),
    reused("AddThenMultiplyNumeric", "g3w1-k2", H.order, ["Groups of means multiply.", "Build the total first."]),
    reused("HiddenQuestionMcq", "g3w1-k3", H.hidden, ["Given numbers are not hidden.", "Work out the middle one."]),
    reused("TwoStepStoryNumeric", "g3w1-ch1", H.order, ["Two steps, in order.", "Each has a direction."]),
  ],
  ["Two-step problems hide a question.", "The hidden quantity is unstated.", "Answer it before the final step."],
  "next: building a total, then growing it.");

def(2,
  "Add then multiply: when the story changes a group COUNT before the groups are counted up, the addition has to happen first.",
  "One more van arrives, then every van is filled. The arrival changes how many groups there are, so it belongs inside the parentheses.",
  { rep: "diagram", widget: () => hop("One more van arrives, so FIVE vans each carry 7 hikers. Hop the five groups from 0.", 0, 60, 0, 7, 5,
      "35 — five groups of seven. The extra van was filled like all the others.",
      [[28, "That hopped only four vans. The van that arrived carries 7 hikers too, not zero."],
       [8, "That added the extra van as a single hiker: 4 × 7 then + 1. A whole van brings a whole group."]]),
    predict: P("4 vans, 1 more arrives, each holds 7. Is the answer (4 × 7) + 1?", [{ id: "no", label: "No — (4 + 1) × 7" }, { id: "yes", label: "Yes" }], "no",
      "The new van gets filled too, so it brings 7 hikers, not 1. The addition must happen before the multiplication.") },
  [
    reused("AddThenMultiplyNumeric", "g3w2-k1", H.order, ["Count the groups first.", "Then multiply."]),
    reused("ChooseEquationMcq", "g3w2-k2", H.order, ["Parentheses hold step one.", "Order carries meaning."]),
    reused("AddThenMultiplyNumeric", "g3w2-k3", H.order, ["Every group is the same size.", "Including the new one."]),
    reused("FactFamilyNumeric", "g3w2-ch1", H.order, ["Families link × and ÷.", "One fact gives another."]),
  ],
  ["A changed group count comes first.", "Then multiply the groups.", "Parentheses record the order."],
  "next: building a total, then taking from it.");

def(3,
  "Multiply then subtract: build the whole from equal groups, then remove what the story takes away — once, from the total.",
  "The classic error removes the loss from EVERY group. Read carefully: 3 chairs broke in total, not 3 at each table.",
  { rep: "diagram", widget: () => bars("Build the five tables before anything breaks: 4 chairs at each table.",
      ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5"], [4, 4, 4, 4, 4],
      "20 chairs standing — the total the story builds before the 3 broken ones come out of it.",
      "Every table holds the same 4 chairs; build each bar to 4 before any are removed."),
    predict: P("5 tables of 4 chairs, 3 break. Is it 5 × (4 − 3)?", [{ id: "no", label: "No — (5 × 4) − 3" }, { id: "yes", label: "Yes" }], "no",
      "5 × (4 − 3) breaks three chairs at every table — fifteen in all. The story breaks exactly three.") },
  [
    reused("MultiplyThenSubtractNumeric", "g3w3-k1", H.order, ["Build the total first.", "Then remove once."]),
    reused("ChooseEquationMcq", "g3w3-k2", H.order, ["Total or each group?", "The words decide."]),
    reused("MultiplyThenSubtractNumeric", "g3w3-k3", H.order, ["Subtraction hits the whole.", "Not every group."]),
    reused("AddThenMultiplyNumeric", "g3w3-ch1", H.order, ["Groups of means multiply.", "Then adjust."]),
  ],
  ["Build the total from equal groups.", "Then remove once, from the whole.", "'Each' changes where the step lands."],
  "next: sharing, then adding.");

def(4,
  "Divide then add: share the total into equal groups first, then add what joins afterward — and notice WHERE it joins.",
  "If two apples go into each bag, the addition lands on one group's share. If two apples join the pile, it lands on the total instead.",
  { rep: "diagram", widget: () => bars("18 apples shared into 3 bags, then 2 more into EACH bag. Build the final bags.",
      ["Bag 1", "Bag 2", "Bag 3"], [8, 8, 8],
      "8 per bag — six from the even share, plus the two that joined that same bag.",
      "Share 18 into 3 first (six each), then add the 2 that join each bag."),
    predict: P("18 apples into 3 bags, then 2 more into each bag. One bag holds…", [{ id: "eight", label: "8" }, { id: "six", label: "6" }], "eight",
      "Sharing gives 6 per bag, then each bag gains 2 more: 6 + 2 = 8.") },
  [
    reused("DivideThenAddNumeric", "g3w4-k1", H.order, ["Share evenly first.", "Then add."]),
    reused("ChooseEquationMcq", "g3w4-k2", H.order, ["Before or after the split?", "Placement changes everything."]),
    reused("ThinkMultNumeric", "g3w4-k3", H.order, ["Division undoes multiplication.", "Think in factors."]),
    reused("DivideThenAddNumeric", "g3w4-ch1", H.order, ["Equal groups, then change.", "Read where it lands."]),
  ],
  ["Share into equal groups first.", "Then add what joins.", "Where it joins changes the equation."],
  "next: giving the unknown a name.");

def(5,
  "When a quantity is unknown, give it a letter. The letter is not a mystery — it is a placeholder standing exactly where the number will go.",
  "Writing 6 × n = 42 says 'six groups of something make forty-two'. Solving it just asks which number the letter is hiding.",
  { rep: "symbolic", widget: () => hop("5 boxes hold n pencils each and 35 in total. Hop five equal groups to find what n must be.", 0, 50, 0, 7, 5,
      "35 — five hops of 7, so n = 7 pencils per box. The letter was a placeholder for the hop size.",
      [[25, "Five hops of 5 land on 25, short of the 35 the story states."],
       [30, "Five hops of 6 reach only 30 — the boxes must hold one more each."]]),
    predict: P("In 6 × n = 42, what does n stand for?", [{ id: "size", label: "The size of one group" }, { id: "total", label: "The total" }], "size",
      "42 is already the total. The letter holds the missing factor — how many are in each of the six groups.") },
  [
    reused("MissingFactorNumeric", "g3w5-k1", H.hidden, ["The letter is a factor.", "Ask what fits."]),
    reused("MissingFactorNumeric", "g3w5-k2", H.hidden, ["Undo the multiplication.", "Division finds it."]),
    reused("ThinkMultNumeric", "g3w5-k3", H.hidden, ["Think in fact families.", "One fact reveals another."]),
    reused("FactFamilyNumeric", "g3w5-ch1", H.hidden, ["Families work both ways.", "× and ÷ together."]),
  ],
  ["Letters name unknown quantities.", "A letter is a placeholder.", "Undo the steps to find it."],
  "next: writing the whole thing down.");

def(6,
  "Writing the equation makes the ORDER visible. Parentheses are not decoration — they say which step happens first.",
  "(5 × 4) − 3 and 5 × (4 − 3) use the same three numbers and mean completely different stories. The brackets carry the meaning.",
  { rep: "symbolic", widget: () => landing("Place where (5 × 4) − 3 lands on the line.", 0, 24, 17,
      "17 — twenty chairs built, then three removed once from the whole.",
      [[5, "5 is where 5 × (4 − 3) lands: that breaks three chairs at EVERY table, not three in total."],
       [20, "20 is the total before anything breaks — the second step has not happened yet."],
       [23, "23 adds the three instead of removing them; broken chairs come out of the total."]]),
    predict: P("Do (5 × 4) − 3 and 5 × (4 − 3) give the same answer?", [{ id: "no", label: "No — 17 and 5" }, { id: "yes", label: "Yes — same numbers" }], "no",
      "Same numbers, different order: one removes three chairs, the other removes three from every table.") },
  [
    reused("ChooseEquationMcq", "g3w6-k1", H.order, ["Brackets fix the order.", "Order is the meaning."]),
    reused("MultiplyThenSubtractNumeric", "g3w6-k2", H.order, ["Total first, then remove.", "Once, from the whole."]),
    reused("ChooseEquationMcq", "g3w6-k3", H.order, ["Same numbers, different stories.", "Read the placement."]),
    reused("AddThenMultiplyNumeric", "g3w6-ch1", H.order, ["Groups change first.", "Then multiply."]),
  ],
  ["Equations record the order.", "Parentheses hold the first step.", "Same numbers can mean different stories."],
  "next: drawing the story.");

def(7,
  "A bar model turns a story into a picture: equal parts for the groups, and a crossed-off piece for what leaves.",
  "The picture makes the hidden question visible — you can see the total being built before anything is removed from it.",
  { rep: "diagram", widget: () => bars("Build the bar model: 4 equal parts of 7, before anything is crossed off.",
      ["Part 1", "Part 2", "Part 3", "Part 4"], [7, 7, 7, 7],
      "28 in four equal parts — the whole bar, ready for the 6 to be crossed off the end.",
      "Every part is the same size: build each bar to 7."),
    predict: P("A bar shows 4 parts of 7 with 6 crossed off the end. The equation is…", [{ id: "outer", label: "(4 × 7) − 6" }, { id: "inner", label: "4 × (7 − 6)" }], "outer",
      "The crossing-off sits at the end of the whole bar, so it happens after the four parts are built.") },
  [
    reused("BarModelMcq", "g3w7-k1", H.order, ["Equal parts build a product.", "Then read the crossing."]),
    reused("MultiplyThenSubtractNumeric", "g3w7-k2", H.order, ["Whole bar first.", "Then remove."]),
    reused("BarModelMcq", "g3w7-k3", H.order, ["Inside or at the end?", "The picture shows which."]),
    reused("DivideThenAddNumeric", "g3w7-ch1", H.order, ["Bars split evenly too.", "Then add."]),
  ],
  ["Bar models picture the steps.", "Equal parts build the total.", "Where the mark sits sets the order."],
  "next: knowing roughly before knowing exactly.");

def(8,
  "Estimating first gives you a neighbourhood for the answer. Round each number to something friendly, run the same two steps, and you know where you should land.",
  "The estimate is not the answer — it is the guard. Anything far outside the neighbourhood is a mistake worth catching before you trust it.",
  { rep: "diagram", widget: () => estimate("7 crates hold about 48 apples each, then 96 apples are eaten. Slide to estimate what is left.", 20, 3000, 240, "apples",
      "Too low — seven crates of about fifty is around 350 before anything is eaten.",
      "Too high — 96 apples come out of roughly 350, so the answer sits in the low hundreds.",
      "About 240 — around 350 built, then about 100 eaten."),
    predict: P("Estimating 7 × 48 − 96, which rounding helps most?", [{ id: "friendly", label: "7 × 50 − 100" }, { id: "none", label: "No rounding — do it exactly" }], "friendly",
      "Fifty and one hundred are friendly numbers, and the rounded chain lands close enough to guard the exact work.") },
  [
    reused("EstimateFirstMcq", "g3w8-k1", H.est, ["Round each number.", "Keep the operations."]),
    reused("AddThenMultiplyNumeric", "g3w8-k2", H.est, ["The exact answer decides.", "The estimate guards it."]),
    reused("EstimateFirstMcq", "g3w8-k3", H.est, ["Estimate every step.", "Not just the first."]),
    reused("RealworldAddNumeric", "g3w8-ch1", H.est, ["Exact work still matters.", "Estimates only guard."]),
  ],
  ["Estimate before computing.", "Round, then run the same steps.", "The estimate is a guard, not an answer."],
  "next: using the estimate as a check.");

def(9,
  "Checking with rounding compares your exact answer to the neighbourhood. Close means plausible; wildly outside means something went wrong.",
  "An estimate can never prove an answer exactly right — but it catches the big errors: a lost carry, a dropped zero, a step done backwards.",
  { rep: "diagram", widget: () => estimate("A student computed 6 × 39 + 21 = 255. Slide to the rounded estimate that checks it.", 20, 2600, 260, "apples",
      "Too low — six groups of about forty already reaches 240 before the 21 is added.",
      "Too high — rounding 39 up to 40 and 21 to 20 lands near 260, not in the thousands.",
      "About 260 — and 255 sits comfortably inside that neighbourhood, so the exact work survives."),
    predict: P("Exact answer 255, estimate 260. What follows?", [{ id: "ok", label: "255 is reasonable" }, { id: "wrong", label: "255 must be wrong" }], "ok",
      "Estimates are neighbourhoods, not targets. Landing five away from 260 is exactly what a good estimate predicts.") },
  [
    reused("RoundingCheckMcq", "g3w9-k1", H.est, ["Close means plausible.", "Not identical."]),
    reused("MultiplyThenSubtractNumeric", "g3w9-k2", H.est, ["Do the exact work.", "Then compare."]),
    reused("RoundingCheckMcq", "g3w9-k3", H.est, ["Estimates catch big errors.", "They cannot prove exactness."]),
    reused("TwoStepStoryNumeric", "g3w9-ch1", H.est, ["Two steps, then check.", "Both must be right."]),
  ],
  ["Compare exact to estimate.", "Close means plausible.", "Estimates catch the big errors."],
  "next: answers that cannot possibly be right.");

def(10,
  "Some answers are impossible before you check any arithmetic: more apples than ever existed, or a leftover bigger than the total.",
  "Ask what the story ALLOWS. If eight crates hold nine apples each, nothing that happens afterwards can push the count above seventy-two.",
  { rep: "diagram", widget: () => landing("8 crates hold 9 apples each; 12 are eaten. Place the answer on the line.", 0, 90, 60,
      "60 — seventy-two built, twelve eaten. Everything above 72 was impossible before any arithmetic.",
      [[84, "84 is above the 72 the crates ever held, and eating cannot raise a count."],
       [72, "72 is the total BEFORE the twelve were eaten — the second step has not happened."],
       [12, "12 is the number eaten, not the number left."]]),
    predict: P("8 crates of 9 apples, 12 eaten. Could 150 be left?", [{ id: "no", label: "No — only 72 ever existed" }, { id: "yes", label: "Yes" }], "no",
      "Seventy-two is the ceiling, and eating only lowers it. An answer above the ceiling is impossible before you check the arithmetic.") },
  [
    reused("UnreasonableMcq", "g3w10-k1", H.judge, ["Compare to the total.", "Above it is impossible."]),
    reused("MultiplyThenSubtractNumeric", "g3w10-k2", H.judge, ["Build the ceiling.", "Then check below it."]),
    reused("UnreasonableMcq", "g3w10-k3", H.judge, ["Removing cannot add.", "The count only falls."]),
    reused("EstimateFirstMcq", "g3w10-ch1", H.est, ["Estimates flag the impossible.", "Then check exactly."]),
  ],
  ["Ask what the story allows.", "Removing cannot raise a count.", "Impossible answers need no arithmetic."],
  "next: numbers you do not need.");

def(11,
  "Stories often carry numbers the question never uses. Reading for the QUESTION, not for the numbers, is what keeps them out of your equation.",
  "Three red bags are real, but if the question asks only about blue bags, the red ones never enter the arithmetic.",
  { rep: "diagram", widget: () => tap("Sam has 3 red bags and 4 blue bags. Each blue bag holds 6 marbles. Tap ONLY the numbers the question about blue marbles needs.",
      [{ id: "n3", label: "3 red bags", icon: "3️⃣", feedback: "The question asks only about blue bags, so the red ones never enter the arithmetic." },
       { id: "n4", label: "4 blue bags", icon: "4️⃣", correct: true },
       { id: "n6", label: "6 marbles per blue bag", icon: "6️⃣", correct: true }]),
    predict: P("The question asks about blue bags only. Are the 3 red bags needed?", [{ id: "no", label: "No — extra information" }, { id: "yes", label: "Yes" }], "no",
      "They are real bags, but the question never asks about them, so they stay out of the arithmetic.") },
  [
    reused("ExtraInfoMcq", "g3w11-k1", H.read, ["Read the question first.", "Then pick the numbers."]),
    reused("AddThenMultiplyNumeric", "g3w11-k2", H.read, ["Only the needed factors.", "Groups times size."]),
    reused("ExtraInfoMcq", "g3w11-k3", H.read, ["Extra numbers are decoys.", "The question decides."]),
    reused("TwoStepStoryNumeric", "g3w11-ch1", H.read, ["Two steps, right numbers.", "Ignore the rest."]),
  ],
  ["Not every number is needed.", "Read for the question.", "Extra information is a decoy."],
  "next: writing one of your own.");

def(12,
  "Writing your own two-step problem is the real test: you must invent a story whose hidden question is genuinely hidden and whose order actually matters.",
  "Start from the equation. (5 × 6) + 4 needs equal groups first and a single addition after — and the story must make that order the only sensible reading.",
  { rep: "symbolic", widget: () => landing("Place where (5 × 6) + 4 lands on the line.", 0, 60, 34,
      "34 — thirty built from five groups of six, then four added once to the collection.",
      [[50, "50 is where 5 × (6 + 4) lands: that adds four eggs to EVERY basket, not four in all."],
       [30, "30 is the product alone — the four extra eggs have not joined yet."],
       [15, "15 is 5 + 6 + 4, which never forms equal groups at all."]]),
    predict: P("For (5 × 6) + 4, should the 4 be added to each basket?", [{ id: "once", label: "No — once, to the total" }, { id: "each", label: "Yes — to each" }], "once",
      "Adding to each basket would be 5 × (6 + 4). The parentheses put the addition outside, so it happens once.") },
  [
    reused("AuthorProblemMcq", "g3w12-k1", H.order, ["Start from the equation.", "Match the order."]),
    reused("ChooseEquationMcq", "g3w12-k2", H.order, ["Once or to each?", "Brackets decide."]),
    reused("AuthorProblemMcq", "g3w12-k3", H.order, ["The story must force the order.", "No other reading."]),
    reused("TwoStepStoryNumeric", "g3w12-ch1", H.order, ["Two genuine steps.", "Hidden, then final."]),
  ],
  ["Start from the equation.", "The hidden step must be genuinely hidden.", "The story must force the order."],
  "course complete: hidden questions found, ordered, written, estimated, and judged.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 12, `12 lessons defined, got ${L.length}`);
const chapterTitles = ["Finding the Hidden Question", "Writing It Down", "Checking Your Answer"];
const perChapter = [4, 4, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 8 ? 2 : 3);
const outDir = join(root, "content/courses/word-problems-g3");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g3w-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "symbolic") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "word-problems-g3",
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
      const f = s.variant?.form;
      const n = (w.prompt.match(/\d+/g) || []).map(Number);
      if (/^Mult(Table\d+|MixedSmall|MixedLarge|Squares|RecallSpeed|WholeTable|HardFacts)Numeric$/.test(f ?? "")) {
        must(n[0] * n[1] === w.answer, `${id}/${s.id} ${f}: first two numbers must be the factors`);
      }
      if (f === "MultMissingFactorNumeric" || f === "DivMissingNumeric") {
        must(n[1] / n[0] === w.answer, `${id}/${s.id} ${f}: n1/n0 route`);
      }
      if (f === "DivMixedNumeric" || f === "DivThinkMultNumeric") {
        must(n[0] / n[1] === w.answer, `${id}/${s.id} ${f}: n0/n1 route`);
      }
      if (f === "MultFactFamilyNumeric") {
        const m = w.prompt.match(/what is (\d+) ÷ (\d+)\?/);
        must(m && +m[1] / +m[2] === w.answer, `${id}/${s.id} MultFactFamily needs the "what is P ÷ B?" shape`);
      }
      if (f === "TwoStepTradeNumeric") {
        must(n[0] - n[1] + n[2] === w.answer, `${id}/${s.id} TwoStepTrade n0−n1+n2`);
      }
      if (f === "Add2DigitNumeric") {
        const plus = w.prompt.match(/(\d+)\s*\+\s*(\d+)/);
        must(plus && +plus[1] + +plus[2] === w.answer, `${id}/${s.id} Add2Digit first + must give the answer`);
      }
    }
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 4, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
    }
    if (w.type === "numberLineHop") {
      const land = w.start + w.hop * w.hops;
      must(land >= w.min && land <= w.max, `${id}/${s.id} hop landing off the line`);
      for (const t of w.commonLandings ?? []) must(t.value !== land, `${id}/${s.id} hop trap equals landing`);
    }
    if (w.type === "numberLinePlace") {
      must(w.fractionDen === undefined, `${id}/${s.id} integer line must not declare fractionDen`);
      must(w.min <= w.target && w.target <= w.max, `${id}/${s.id} landing target off the line`);
      for (const t of w.commonPlacements ?? []) must(t.value !== w.target, `${id}/${s.id} landing trap equals target`);
    }
    if (w.type === "barBuilder") {
      must(w.categories.length === w.target.length, `${id}/${s.id} barBuilder misaligned`);
      must(Math.max(...w.target) <= w.maxVal, `${id}/${s.id} barBuilder cap`);
    }
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
  id: "word-problems-g3", slug: "word-problems-g3", title: spec.title,
  tagline: "Find the hidden question, take both steps in order, and prove the answer is possible.",
  category: "Math", gradeLevel: 3, chapters,
}, null, 2) + "\n");
console.log(`built 12 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
