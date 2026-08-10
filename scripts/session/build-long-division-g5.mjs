#!/usr/bin/env node
// S197 — Batch F course 6/6: long-division-g5 (5.NBT.B.6). Zero new generator code.
//
// Family: g4-multiply (computational). long-div-2digit and partial-products are authored-template
// LOOKUP families and cannot carry a new prompt, so the arithmetic rides the computational routes:
//   mbDivideBigNumeric   "Compute A ÷ B — …"      -> ns[0]/ns[1]   (exact quotients only)
//   mbMultiplyTensNumeric "Compute A × B — …"     -> ns[0]*ns[1]   (compatible-number estimates,
//                                                                   and multiplying back to check)
//   mbRemaindersNumeric  "Divide A by B. The quotient is Q…" -> ns[0] − ns[1]*ns[2]
//   mbInterpretRemaindersNumeric                  -> ceil(ns[0]/ns[1])
// Routes read ns POSITIONALLY over the whole prompt, so graded prompts LEAD with their operands;
// asserted per step. mbDivideBigNumeric returns a real quotient, so a non-exact division would
// yield a decimal answer — every division authored here divides evenly, and that is asserted too.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "long-division-g5");
if (!spec || spec.lessons.length !== 6) throw new Error("spec course missing or wrong size");

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
const BAR_T = corpusTemplate("barBuilder", "measurement-data");
const HOP_T = corpusTemplate("numberLineHop", "add-subtract-1000-g2");

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
      out.push([v, "That value does not follow from how many whole groups of the divisor the dividend contains."]);
    }
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

/* ---------------- graded mirrors — prompts LEAD with their operands ---------------- */
function ExactQuotientNumeric(r) {
  const divisor = pick(r, 12, 39), quotient = pick(r, 12, 38);
  const dividend = divisor * quotient;
  return { gen: "g4-multiply", form: "mbDivideBigNumeric",
    prompt: `Compute ${dividend} ÷ ${divisor} — a two-digit divisor that divides evenly.`,
    answer: quotient,
    traps: traps2(quotient, [
      [quotient * 10, `That misplaced the quotient's digits by a whole place; check how many groups the first partial step accounts for.`],
      [dividend - divisor, `Subtracting the divisor once removes a single group; division counts how many groups FIT.`]]) };
}
function TensDivisorNumeric(r) {
  const tens = choose(r, [20, 30, 40, 50]), quotient = pick(r, 6, 19);
  const dividend = tens * quotient;
  return { gen: "g4-multiply", form: "mbDivideBigNumeric",
    prompt: `Compute ${dividend} ÷ ${tens} — dividing by a multiple of ten.`, answer: quotient,
    traps: traps2(quotient, [
      [quotient * 10, `That divided by ${tens / 10} rather than ${tens}; the extra zero is a whole place value.`],
      [dividend / 10, `That divided by ten alone, leaving the ${tens / 10} in the divisor unused.`]]) };
}
function CompatibleEstimateNumeric(r) {
  const a = choose(r, [20, 30, 40]), b = choose(r, [20, 30, 40, 50]);
  return { gen: "g4-multiply", form: "mbMultiplyTensNumeric",
    prompt: `Compute ${a} × ${b} — the compatible-number product used to size a quotient.`,
    answer: a * b,
    traps: traps2(a * b, [
      [a + b, `Adding the two friendly numbers does not size a product; the estimate multiplies them.`],
      [(a * b) / 10, `That dropped a zero — each factor's ten contributes a place to the product.`]]) };
}
function CheckByMultiplyNumeric(r) {
  const divisor = pick(r, 12, 32), quotient = pick(r, 8, 30);
  return { gen: "g4-multiply", form: "mbMultiplyTensNumeric",
    prompt: `Compute ${quotient} × ${divisor} — multiplying the quotient back by the divisor to check.`,
    answer: quotient * divisor,
    traps: traps2(quotient * divisor, [
      [quotient + divisor, `Adding does not undo division; multiplying the quotient by the divisor must rebuild the dividend.`],
      [quotient * divisor - divisor, `That is one group short — the quotient counts ${quotient} groups, not ${quotient - 1}.`]]) };
}
function RemainderNumeric(r) {
  const divisor = pick(r, 12, 30), quotient = pick(r, 10, 30);
  const rem = pick(r, 1, divisor - 1);
  const dividend = divisor * quotient + rem;
  return { gen: "g4-multiply", form: "mbRemaindersNumeric",
    prompt: `Divide ${dividend} by ${divisor}. The quotient is ${quotient}. What is the remainder?`,
    answer: rem,
    traps: traps2(rem, [
      [divisor, `A remainder never reaches the divisor — ${divisor} more would form one further whole group.`],
      [quotient, `${quotient} counts the whole groups; the remainder is what is left after them.`]]) };
}
function NeededGroupsNumeric(r) {
  const per = pick(r, 12, 30), full = pick(r, 8, 25), extra = pick(r, 1, per - 1);
  const total = per * full + extra;
  const ans = Math.ceil(total / per);
  must(ans === full + 1, "needed-groups answer must round the partial group UP");
  return { gen: "g4-multiply", form: "mbInterpretRemaindersNumeric",
    prompt: `Compute ${total} ÷ ${per} rounded up — the containers needed when nothing may be left behind.`,
    answer: ans,
    traps: traps2(ans, [
      [full, `${full} full containers leave ${extra} behind, and nothing may be left.`],
      [extra, `${extra} is the leftover, not a count of containers.`]]) };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function CompatibleMcq() {
  return { kind: "mcq",
    prompt: `Estimating 552 ÷ 24, which pair of compatible numbers helps most?`,
    options: [
      { label: "600 ÷ 25 = 24, since 25 divides 600 exactly", correct: true, feedback: `Correct — compatible numbers are chosen because they divide cleanly, which is what makes the estimate quick.` },
      { label: "500 ÷ 20 = 25", correct: false, feedback: `It is workable, but 500 sits further from 552 than 600 does, so the estimate drifts more.` },
      { label: "552 ÷ 20, leaving the dividend alone", correct: false, feedback: `Rounding only the divisor keeps the hard number in place; the point is to make BOTH friendly.` },
      { label: "Any two round numbers will do", correct: false, feedback: `They must also divide cleanly — 600 ÷ 40 is round but tells you little about 552 ÷ 24.` },
    ] };
}
function TensMcq() {
  return { kind: "mcq",
    prompt: `Why is dividing by 30 easier than dividing by 27?`,
    options: [
      { label: "Because 30 is 3 tens, so you can divide by 3 and then by 10", correct: true, feedback: `Correct — a multiple of ten splits into a familiar fact and a place-value shift.` },
      { label: "Because 30 is larger", correct: false, feedback: `Size is not the reason; dividing by 33 is no easier than by 27 despite being larger.` },
      { label: "Because 27 is odd", correct: false, feedback: `Parity does not matter — dividing by 26 is no easier than dividing by 27.` },
      { label: "They are equally easy", correct: false, feedback: `The place-value shortcut is only available when the divisor is a multiple of ten.` },
    ] };
}
function PartialQuotientsMcq() {
  return { kind: "mcq",
    prompt: `In partial quotients, why may you take 20 groups of 24 before taking 3 more?`,
    options: [
      { label: "Because the groups can be removed in any convenient batches and then totalled", correct: true, feedback: `Correct — the quotient counts groups, and counting them 20 at a time then 3 at a time gives the same 23.` },
      { label: "Because 20 is always the right first step", correct: false, feedback: `The first batch is whatever is convenient; a different dividend would call for a different one.` },
      { label: "Because the standard algorithm requires it", correct: false, feedback: `The standard algorithm fixes the batches by place value; partial quotients deliberately does not.` },
      { label: "You may not — the batches must be equal", correct: false, feedback: `Unequal batches are the whole advantage of the method, provided they are totalled at the end.` },
    ] };
}
function StandardAlgorithmMcq() {
  return { kind: "mcq",
    prompt: `How does the standard algorithm differ from partial quotients?`,
    options: [
      { label: "It fixes the batches by place value, one digit at a time", correct: true, feedback: `Correct — same counting of groups, but the batches are chosen for you, which is why it is compact and less forgiving.` },
      { label: "It gives a different answer", correct: false, feedback: `Both count the same groups, so both reach the same quotient.` },
      { label: "It does not use multiplication", correct: false, feedback: `Every step multiplies the divisor by a trial digit and subtracts the result.` },
      { label: "It only works for one-digit divisors", correct: false, feedback: `It works for any divisor; two-digit ones simply make the trial digits harder to guess.` },
    ] };
}
function AdjustMcq() {
  return { kind: "mcq",
    prompt: `You try 4 as a digit, but 4 × 24 = 96 exceeds the 88 available. What now?`,
    options: [
      { label: "Lower the digit to 3 and multiply again", correct: true, feedback: `Correct — an overshoot means the trial digit was too big, and adjusting down is a normal part of the method.` },
      { label: "Subtract anyway and carry a negative", correct: false, feedback: `The algorithm never leaves a negative remainder; the digit must be reduced instead.` },
      { label: "Start the whole division again", correct: false, feedback: `Only this digit is wrong; the earlier steps are unaffected.` },
      { label: "Round 88 up to 96", correct: false, feedback: `Changing the dividend changes the problem; the trial digit is what must move.` },
    ] };
}
function CheckMcq() {
  return { kind: "mcq",
    prompt: `A division gives quotient 23 remainder 8, with divisor 24. How do you check it?`,
    options: [
      { label: "23 × 24 + 8 should rebuild the dividend, and 8 must be under 24", correct: true, feedback: `Correct — the check has two halves: the rebuild, and the remainder being too small to form another group.` },
      { label: "Just confirm 23 × 24 equals the dividend", correct: false, feedback: `That ignores the remainder, which is part of the dividend and must be added back.` },
      { label: "Check that 8 is smaller than 23", correct: false, feedback: `The remainder is compared with the DIVISOR, not the quotient — otherwise another group would fit.` },
      { label: "Divide again and hope for the same answer", correct: false, feedback: `Repeating the method repeats any mistake; multiplying back tests it independently.` },
    ] };
}

const REUSE = { ExactQuotientNumeric, TensDivisorNumeric, CompatibleEstimateNumeric,
  CheckByMultiplyNumeric, RemainderNumeric, NeededGroupsNumeric,
  CompatibleMcq: () => CompatibleMcq(), TensMcq: () => TensMcq(),
  PartialQuotientsMcq: () => PartialQuotientsMcq(), StandardAlgorithmMcq: () => StandardAlgorithmMcq(),
  AdjustMcq: () => AdjustMcq(), CheckMcq: () => CheckMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Ask how many whole groups of the divisor the dividend holds, then check what is left over.") {
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
  const nums = (out.prompt.match(/\d+/g) || []).map(Number);
  if (out.form === "mbDivideBigNumeric") {
    must(nums[0] / nums[1] === out.answer, `${mirror}: ns0/ns1 must be the answer`);
    must(Number.isInteger(out.answer), `${mirror}: mbDivideBigNumeric returns a real quotient — divide evenly`);
  }
  if (out.form === "mbMultiplyTensNumeric") must(nums[0] * nums[1] === out.answer, `${mirror}: ns0*ns1`);
  if (out.form === "mbRemaindersNumeric") {
    must(nums[0] - nums[1] * nums[2] === out.answer, `${mirror}: ns0−ns1*ns2`);
    must(out.answer >= 0 && out.answer < nums[1], `${mirror}: remainder must sit under the divisor`);
  }
  if (out.form === "mbInterpretRemaindersNumeric") must(Math.ceil(nums[0] / nums[1]) === out.answer, `${mirror}: ceil`);
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
  w.display = "bar"; w.maxVal = Math.max(...target) + 3; w.step = 1; w.histogram = false;
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
  must(land > min && land < max, `hop landing ${land} sits at the edge — one feedback direction would be dead`);
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
  actionGoal: `Count how many whole groups of the divisor fit, in whatever batches are convenient, for ${tag.replace(/-/g, " ")}.`,
  invariants: [`Division counts groups, and every method — estimating, partial quotients, the standard algorithm — counts the SAME groups in different batches, which is why ${tag.replace(/-/g, " ")} always ends with quotient times divisor plus remainder rebuilding the dividend.`],
  misconceptions: [`Placing a quotient digit a place out, treating an overshoot as final rather than adjusting the trial digit, or reporting a remainder that is as large as the divisor.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `long-division-g5:${tag}`, delayed: true,
  counterfactualPrompt: "If the remainder came out equal to the divisor, what would that tell you about the quotient?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  est: ["Pick numbers that divide cleanly.", "Round both.", "Size the quotient."],
  tens: ["A multiple of ten splits.", "Divide by the digit, then by ten.", "Place value helps."],
  batch: ["Take convenient batches.", "Total them at the end.", "Same groups either way."],
  check: ["Multiply back, add the remainder.", "It must rebuild.", "Remainder under the divisor."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Before dividing by a two-digit number, size the answer with compatible numbers: 552 ÷ 24 is near 600 ÷ 25, which is 24.",
  "Compatible numbers are chosen because they divide CLEANLY, not merely because they are round. That is what makes the estimate instant.",
  { rep: "diagram", widget: () => estimate("552 ÷ 24 — slide to estimate the quotient before dividing.", 2, 200, 23, "groups",
      "Too low — twenty-four groups of twenty-four already approach six hundred.",
      "Too high — 24 × 30 would pass seven hundred, well beyond 552.",
      "About 23 — the estimate 600 ÷ 25 = 24 predicted it, and the exact quotient is 23."),
    predict: P("Estimating 552 ÷ 24, which pair helps most?", [{ id: "600", label: "600 ÷ 25" }, { id: "552", label: "552 ÷ 20" }], "600",
      "25 divides 600 exactly, so the estimate arrives without any working at all.") },
  [
    reused("CompatibleMcq", "g5l1-k1", H.est, ["Both numbers friendly.", "And they divide cleanly."]),
    reused("CompatibleEstimateNumeric", "g5l1-k2", H.est, ["Multiply the friendly pair.", "Size the product."]),
    reused("ExactQuotientNumeric", "g5l1-k3", H.est, ["Then divide exactly.", "Compare with the estimate."]),
    reused("CompatibleEstimateNumeric", "g5l1-ch1", H.est, ["Bigger pairs, same idea.", "Clean division."]),
  ],
  ["Estimate before dividing.", "Compatible numbers divide cleanly.", "The estimate sizes the quotient."],
  "next: divisors that end in zero.");

def(2,
  "A divisor that is a multiple of ten splits into two easy steps: dividing by 30 is dividing by 3 and then by 10.",
  "This is place value doing the work again — the same shortcut that makes multiplying by tens easy runs in reverse.",
  { rep: "diagram", widget: () => hop("How many 30s fit in 240? Hop by thirties.", 0, 300, 0, 30, 8,
      "240 after eight hops — so 240 ÷ 30 = 8, found by counting groups of thirty.",
      [[210, "Seven hops reach 210; one more thirty still fits inside 240."],
       [270, "Nine hops overshoot 240 — eight is the exact count."]],
      "Short of the landing — eight hops of thirty are needed to reach 240.",
      "Past the landing — eight hops of thirty stop exactly on 240."),
    predict: P("Is dividing by 30 easier than by 27?", [{ id: "yes", label: "Yes — 3 then 10" }, { id: "no", label: "No" }], "yes",
      "A multiple of ten splits into a familiar fact and a place-value shift; 27 offers no such split.") },
  [
    reused("TensMcq", "g5l2-k1", H.tens, ["Split the multiple of ten.", "Digit, then place."]),
    reused("TensDivisorNumeric", "g5l2-k2", H.tens, ["Divide by the tens.", "Watch the zero."]),
    reused("TensDivisorNumeric", "g5l2-k3", H.tens, ["Both parts matter.", "Digit and ten."]),
    reused("ExactQuotientNumeric", "g5l2-ch1", H.batch, ["Awkward divisors too.", "Count the groups."]),
  ],
  ["Multiples of ten split in two.", "Divide by the digit, then by ten.", "Place value does the work."],
  "next: taking groups in batches.");

def(3,
  "Partial quotients counts the groups in whatever batches are convenient: take 20 groups of 24, then 3 more, and total them.",
  "The batches need not be equal or tidy. All that matters is that they are all counted, because the quotient is simply how many groups came out.",
  { rep: "diagram", widget: () => bars("Count 552 ÷ 24 in batches: build 20 groups, then 3 more, then the total.",
      ["First batch", "Second batch", "Total"], [20, 3, 23],
      "23 groups in all — twenty taken first, three after, and the quotient is their total.",
      "Build the first batch at 20, the second at 3, and their total at 23."),
    predict: P("May you take 20 groups of 24 before taking 3 more?", [{ id: "yes", label: "Yes — total them" }, { id: "no", label: "No — batches must be equal" }], "yes",
      "The quotient counts groups, and counting them in convenient batches reaches the same total.") },
  [
    reused("PartialQuotientsMcq", "g5l3-k1", H.batch, ["Convenient batches.", "Total at the end."]),
    reused("ExactQuotientNumeric", "g5l3-k2", H.batch, ["The quotient is the total.", "Groups counted."]),
    reused("CheckByMultiplyNumeric", "g5l3-k3", H.check, ["Multiply back.", "It must rebuild."]),
    reused("ExactQuotientNumeric", "g5l3-ch1", H.batch, ["Larger dividends, same counting.", "Batch it up."]),
  ],
  ["Partial quotients uses convenient batches.", "Batches need not be equal.", "The quotient is their total."],
  "next: the compact method.");

def(4,
  "The standard algorithm counts the same groups, but fixes the batches by place value — one digit at a time, largest place first.",
  "That makes it compact and quick, and also less forgiving: a digit placed one column out is wrong by a factor of ten.",
  { rep: "diagram", widget: () => estimate("Dividing 552 by 24, the first digit sits in the tens place — slide to what it is worth.", 2, 200, 20, "groups",
      "Too low — the first digit stands for whole tens of groups, not single ones.",
      "Too high — the tens digit here is 2, so it is worth twenty groups.",
      "20 — the leading 2 sits in the tens place, standing for twenty groups of 24."),
    predict: P("In the standard algorithm, what fixes the batch sizes?", [{ id: "place", label: "Place value" }, { id: "choice", label: "Your choice" }], "place",
      "Each digit's column decides its batch, which is exactly what makes the method compact.") },
  [
    reused("StandardAlgorithmMcq", "g5l4-k1", H.batch, ["Place value fixes batches.", "One digit at a time."]),
    reused("ExactQuotientNumeric", "g5l4-k2", H.batch, ["Same groups counted.", "Same quotient."]),
    reused("PartialQuotientsMcq", "g5l4-k3", H.batch, ["Both methods agree.", "Different batching."]),
    reused("ExactQuotientNumeric", "g5l4-ch1", H.batch, ["Harder divisors, same method.", "Digit by digit."]),
  ],
  ["The standard algorithm fixes batches by place value.", "It counts the same groups.", "A digit one column out is wrong tenfold."],
  "next: when the guess is too big.");

def(5,
  "Trial digits with a two-digit divisor are guesses, and guessing too high is routine: if 4 × 24 = 96 exceeds the 88 available, lower the digit to 3.",
  "Adjusting is part of the method, not a sign of failure. The algorithm never leaves a negative remainder.",
  { rep: "diagram", widget: () => estimate("4 × 24 = 96 overshoots the 88 available — slide to what 3 × 24 gives.", 5, 200, 72, "units",
      "Too low — three twenty-fours already pass seventy.",
      "Too high — three twenty-fours is seventy-two, comfortably under eighty-eight.",
      "72 — which fits inside 88, leaving 16 for the next step."),
    predict: P("4 × 24 = 96 exceeds 88. What now?", [{ id: "lower", label: "Lower the digit to 3" }, { id: "negative", label: "Subtract anyway" }], "lower",
      "An overshoot means the trial digit was too big; the algorithm never carries a negative remainder.") },
  [
    reused("AdjustMcq", "g5l5-k1", H.batch, ["Overshoot means lower.", "Try again."]),
    reused("CheckByMultiplyNumeric", "g5l5-k2", H.check, ["Multiply to test a digit.", "Compare with what is left."]),
    reused("ExactQuotientNumeric", "g5l5-k3", H.batch, ["Then continue.", "Digit by digit."]),
    reused("AdjustMcq", "g5l5-ch1", H.batch, ["Only that digit changes.", "Earlier steps stand."]),
  ],
  ["Trial digits are guesses.", "An overshoot means lower the digit.", "No step leaves a negative remainder."],
  "next: checking and reading the answer.");

def(6,
  "The check has two halves: quotient times divisor plus remainder must rebuild the dividend, and the remainder must be smaller than the divisor.",
  "If the remainder reaches the divisor, another whole group fits and the quotient was too small — the second half of the check catches exactly that.",
  { rep: "diagram", widget: () => estimate("Quotient 23, divisor 24, remainder 8 — slide to the dividend it rebuilds.", 50, 2000, 560, "units",
      "Too low — twenty-three twenty-fours alone already exceed five hundred.",
      "Too high — 23 × 24 is 552, and the remainder adds only eight more.",
      "560 — because 23 × 24 + 8 = 560, which is exactly the dividend."),
    predict: P("Quotient 23, divisor 24, remainder 8 — how do you check?", [{ id: "rebuild", label: "23 × 24 + 8" }, { id: "product", label: "23 × 24 only" }], "rebuild",
      "The remainder is part of the dividend, so it must be added back for the rebuild to work.") },
  [
    reused("CheckMcq", "g5l6-k1", H.check, ["Rebuild the dividend.", "Remainder under divisor."]),
    reused("RemainderNumeric", "g5l6-k2", H.check, ["Whole groups first.", "Then what is left."]),
    reused("NeededGroupsNumeric", "g5l6-k3", H.check, ["Some stories round up.", "Nothing left behind."]),
    reused("CheckByMultiplyNumeric", "g5l6-ch1", H.check, ["Multiply back to confirm.", "Add the remainder."]),
  ],
  ["Multiply back and add the remainder.", "It must rebuild the dividend.", "A remainder must stay under the divisor."],
  "course complete: estimated, batched, formalised, adjusted, and checked.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 6, `6 lessons defined, got ${L.length}`);
const chapterTitles = ["Estimating and Easy Divisors", "Building the Algorithm", "Adjusting and Checking"];
const perChapter = [2, 2, 2];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 2 ? 1 : n <= 4 ? 2 : 3);
const outDir = join(root, "content/courses/long-division-g5");
mkdirSync(join(outDir, "lessons"), { recursive: true });

const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);
const MANIP2 = new Set(["numberLineHop", "barBuilder", "estimateSlider", "numberLinePlace", "areaModel", "columnCalc", "fractionBar", "tapDiagram", "plotPoint"]);

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g5l-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "symbolic") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "long-division-g5",
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
      if (f === "mbDivideBigNumeric") {
        must(n[0] / n[1] === w.answer, `${id}/${s.id} ns0/ns1`);
        must(Number.isInteger(w.answer), `${id}/${s.id}: the route returns a real quotient — divide evenly`);
      }
      if (f === "mbMultiplyTensNumeric") must(n[0] * n[1] === w.answer, `${id}/${s.id} ns0*ns1`);
      if (f === "mbRemaindersNumeric") {
        must(n[0] - n[1] * n[2] === w.answer, `${id}/${s.id} ns0−ns1*ns2`);
        must(w.answer < n[1], `${id}/${s.id} remainder must sit under the divisor`);
      }
      if (f === "mbInterpretRemaindersNumeric") must(Math.ceil(n[0] / n[1]) === w.answer, `${id}/${s.id} ceil`);
    }
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 4, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
    }
    if (w.type === "numberLineHop") {
      const land = w.start + w.hop * w.hops;
      must(land > w.min && land < w.max, `${id}/${s.id} hop landing at the edge leaves dead feedback`);
    }
    if (w.type === "barBuilder") must(w.categories.length === w.target.length, `${id}/${s.id} barBuilder misaligned`);
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "long-division-g5", slug: "long-division-g5", title: spec.title,
  tagline: "Every method counts the same groups — only the batches differ.",
  category: "Math", gradeLevel: 5, chapters,
}, null, 2) + "\n");
console.log(`built 6 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
