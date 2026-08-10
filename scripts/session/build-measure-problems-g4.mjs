#!/usr/bin/env node
// S196 — Batch E course 4/5: measure-problems-g4 (4.MD.A.1, 4.MD.A.2). Zero new generator code.
//
// WHY THIS COURSE DOES NOT USE A CONVERSION FAMILY. Every conversion-flavoured family in the
// registry — metric-convert, rect-measure, measure-word, volume, mass — is backed by
// authoredTemplateIndependent.cjs, a LOOKUP TABLE keyed to exact authored prompt strings. It
// throws `unrecognized advanced prompt` on anything it has not seen, so none of them can carry a
// single new lesson. The mathematics of a Grade-4 conversion IS multiplying or dividing by the
// conversion factor, so the arithmetic rides g4-multiply (computational), and the conceptual
// content — which direction to convert, and why a bigger unit gives a smaller number — lives in
// the prose, the predictions, and authored MCQs.
//
// Routes, probed against the shipped solver before authoring:
//   mbMultiplyTensNumeric  "…Compute A × B."      -> ns[0]*ns[1]   (convert to the SMALLER unit)
//   mbDivideBigNumeric     "…Compute A ÷ B."      -> ns[0]/ns[1]   (convert to the BIGGER unit)
//   mbMultiStepNumeric     "…A laps of B … stops C early…"        -> ns[0]*ns[1] − ns[2]
//   mbInterpretRemaindersNumeric                                  -> ceil(ns[0]/ns[1])
//   mcFractionMeasurementNumeric "…total of N quarter-unit marks…" -> ns[0]/4  (g4-measure)
// All conversion prompts state the QUANTITY first and the conversion FACTOR second, because both
// arithmetic routes read ns positionally — asserted per step.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "measure-problems-g4");
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
const HOP_T = corpusTemplate("numberLineHop", "add-subtract-1000-g2");
const BAR_T = corpusTemplate("barBuilder", "measurement-data");
const EST_T = corpusTemplate("estimateSlider", "multiplication-division");
const NLP_T = corpusTemplate("numberLinePlace", "fractions");

const REG_MB = new Set(["mbTimesAsManyMcq","mbTimesAsManyNumeric","mbComparisonEquationsMcq",
  "mbComparisonEquationsNumeric","mbAdditiveVsMultiplicativeMcq","mbAdditiveVsMultiplicativeNumeric",
  "mbFactorsMcq","mbFactorsNumeric","mbMultiplesMcq","mbPrimeCompositeMcq","mbPrimeCompositeNumeric",
  "mbMultiplyTensMcq","mbMultiplyTensNumeric","mbAreaModel1DigitMcq","mbAreaModel1DigitNumeric",
  "mbAreaModel2DigitMcq","mbAreaModel2DigitNumeric","mbRemaindersMcq","mbRemaindersNumeric",
  "mbDivideBigNumeric","mbInterpretRemaindersMcq","mbInterpretRemaindersNumeric","mbPatternsMcq",
  "mbPatternsNumeric","mbMultiStepNumeric"]);
const REG_MC = new Set(["mcPerimeterFormulaMcq","mcDegreeMeasurementMcq","mcDegreeMeasurementNumeric",
  "mcProtractorReadingMcq","mcProtractorReadingNumeric","mcAngleClassificationMcq",
  "mcBenchmarkAnglesMcq","mcBenchmarkAnglesNumeric","mcFractionMeasurementMcq",
  "mcFractionMeasurementNumeric","mcLinePlotBuildMcq","mcLinePlotBuildNumeric",
  "mcLinePlotQuestionsNumeric"]);
const REG = { "g4-multiply": REG_MB, "g4-measure": REG_MC };

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
      out.push([v, "That value does not follow from the quantity and the conversion factor given."]);
    }
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

// [big unit, small unit, factor, an object that is measured in the big unit]
const UNITS = {
  length: [["meter", "centimeter", 100, "trail"], ["kilometer", "meter", 1000, "route"]],
  mass:   [["kilogram", "gram", 1000, "pack"]],
  volume: [["liter", "milliliter", 1000, "jug"]],
  time:   [["hour", "minute", 60, "hike"], ["minute", "second", 60, "rest stop"]],
};

/* ---------------- graded mirrors ---------------- */
function convertDown(r, kind) {           // big unit -> small unit: MULTIPLY
  const [big, small, factor, thing] = choose(r, UNITS[kind]);
  const q = pick(r, 2, 9);
  const ans = q * factor;
  return { gen: "g4-multiply", form: "mbMultiplyTensNumeric",
    prompt: `A ${thing} measures ${q} ${big}s, and each ${big} is ${factor} ${small}s. Compute ${q} × ${factor}.`,
    answer: ans,
    traps: traps2(ans, [
      [q + factor, `Adding mixes a quantity with a rate. Each of the ${q} ${big}s contributes ${factor} ${small}s, so they multiply.`],
      [Math.round(factor / q), `That divided. Going to the SMALLER unit needs more of them, so the number must grow.`]]) };
}
function convertUp(r, kind) {             // small unit -> big unit: DIVIDE
  const [big, small, factor, thing] = choose(r, UNITS[kind]);
  const q = pick(r, 2, 9);
  const total = q * factor;
  return { gen: "g4-multiply", form: "mbDivideBigNumeric",
    prompt: `A ${thing} measures ${total} ${small}s, and each ${big} is ${factor} ${small}s. Compute ${total} ÷ ${factor}.`,
    answer: q,
    traps: traps2(q, [
      [total, `${total} is the count in ${small}s. Switching to the bigger ${big} must make the NUMBER smaller.`],
      [total * factor, `That multiplied. Going to the BIGGER unit needs fewer of them, so divide.`]]) };
}
const ConvertLengthDown = (r) => convertDown(r, "length");
const ConvertLengthUp = (r) => convertUp(r, "length");
const ConvertMassDown = (r) => convertDown(r, "mass");
const ConvertVolumeDown = (r) => convertDown(r, "volume");
const ConvertVolumeUp = (r) => convertUp(r, "volume");
const ConvertTimeDown = (r) => convertDown(r, "time");
const ConvertTimeUp = (r) => convertUp(r, "time");

function DistanceMultiStepNumeric(r) {
  const laps = pick(r, 4, 9), lap = choose(r, [200, 300, 400, 500]);
  const short = pick(r, 50, 180);
  const ans = laps * lap - short;
  return { gen: "g4-multiply", form: "mbMultiStepNumeric",
    prompt: `A hiker walks ${laps} laps of ${lap} meters and stops ${short} meters early. How many meters?`,
    answer: ans,
    traps: traps2(ans, [
      [laps * lap, `That reported the full distance; the hiker stopped ${short} meters before finishing.`],
      [laps * lap + short, `Stopping early SHORTENS the walk, so the last step subtracts.`]]) };
}
function IntervalMultiStepNumeric(r) {
  const sessions = pick(r, 3, 8), each = choose(r, [15, 20, 30, 45]);
  const cut = pick(r, 10, 40);
  const ans = sessions * each - cut;
  return { gen: "g4-multiply", form: "mbMultiStepNumeric",
    prompt: `A trail crew works ${sessions} shifts of ${each} minutes and finishes ${cut} minutes early. How many minutes?`,
    answer: ans,
    traps: traps2(ans, [
      [sessions * each, `That is the planned time; the crew finished ${cut} minutes before it was used up.`],
      [sessions + each, `Adding a shift count to a shift length mixes two different quantities — ${sessions} shifts OF ${each} minutes multiply.`]]) };
}
function MoneyMultiStepNumeric(r) {
  const items = pick(r, 4, 9), price = choose(r, [15, 20, 25, 40]);
  const discount = pick(r, 10, 50);
  const ans = items * price - discount;
  return { gen: "g4-multiply", form: "mbMultiStepNumeric",
    prompt: `A group buys ${items} passes at ${price} dollars each and a voucher takes ${discount} dollars off. How many dollars?`,
    answer: ans,
    traps: traps2(ans, [
      [items * price, `That is the price before the voucher; the discount still has to come off.`],
      [items * price + discount, `A voucher reduces the bill, so the last step subtracts.`]]) };
}
function ContainerCountNumeric(r) {
  const per = pick(r, 4, 9), full = pick(r, 4, 9), extra = pick(r, 1, per - 1);
  const total = per * full + extra;
  const ans = Math.ceil(total / per);
  must(ans === full + 1, "container count must round the partial container UP");
  return { gen: "g4-multiply", form: "mbInterpretRemaindersNumeric",
    prompt: `${total} liters are poured into ${per}-liter jugs. Every liter must be carried. How many jugs are needed?`,
    answer: ans,
    traps: traps2(ans, [
      [full, `${full} full jugs leave ${extra} liters behind, and every liter has to travel.`],
      [extra, `${extra} is the leftover liquid, not a count of jugs.`]]) };
}
function QuarterUnitNumeric(r) {
  const wholes = pick(r, 2, 6);
  const marks = wholes * 4;
  return { gen: "g4-measure", form: "mcFractionMeasurementNumeric",
    prompt: `A line plot records a total of ${marks} quarter-unit marks. What length do they represent in units?`,
    answer: wholes,
    traps: traps2(wholes, [
      [marks, `${marks} counts the quarter-marks; four of them rebuild one whole unit.`],
      [marks * 4, `That multiplied by four. Quarter-units are SMALLER than units, so the number of units is fewer.`]]) };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function BiggerUnitMcq() {
  return { kind: "mcq",
    prompt: `The same rope is measured in meters and in centimeters. Which measurement has the LARGER number?`,
    options: [
      { label: "Centimeters, because a centimeter is a smaller unit", correct: true, feedback: `Correct — smaller units means more of them fit, so the count rises even though the rope never changes.` },
      { label: "Meters, because meters are bigger", correct: false, feedback: `Bigger units give a SMALLER count: fewer of them cover the same rope.` },
      { label: "They are the same number", correct: false, feedback: `The length is the same, but the NUMBER differs because the units differ — 3 m and 300 cm.` },
      { label: "It depends on the rope", correct: false, feedback: `It does not: for any length, the smaller unit always yields the larger count.` },
    ] };
}
function DirectionMcq() {
  return { kind: "mcq",
    prompt: `Converting 5 kilograms into grams, do you multiply or divide by 1,000?`,
    options: [
      { label: "Multiply — grams are smaller, so there are more of them", correct: true, feedback: `Correct — each kilogram contains 1,000 grams, so 5 kilograms is 5,000 grams.` },
      { label: "Divide — the number should get smaller", correct: false, feedback: `Dividing would give 0.005, which is far less than the mass you started with.` },
      { label: "Neither — the number stays the same", correct: false, feedback: `The mass stays the same, but the NUMBER must change because the unit changed.` },
      { label: "Multiply by 100", correct: false, feedback: `100 is the centimeters-per-meter factor; a kilogram holds 1,000 grams.` },
    ] };
}
function TableMcq() {
  return { kind: "mcq",
    prompt: `A conversion table lists 1 m = 100 cm, 2 m = 200 cm, 3 m = 300 cm. What makes it a table rather than a list?`,
    options: [
      { label: "Every row uses the same rule, so any row can be predicted", correct: true, feedback: `Correct — one constant factor generates every row, which is why you can jump straight to 9 m = 900 cm.` },
      { label: "It has exactly three rows", correct: false, feedback: `The row count is arbitrary; the shared rule is what makes it a table.` },
      { label: "The numbers increase", correct: false, feedback: `Increasing numbers alone say nothing — the CONSTANT relationship between the columns does.` },
      { label: "It uses two different units", correct: false, feedback: `Two units are necessary but not sufficient; the fixed factor linking them is the point.` },
    ] };
}
function DiagramMcq() {
  return { kind: "mcq",
    prompt: `A bar diagram shows 6 equal parts of 400 m, with 150 m crossed off the end. What does it record?`,
    options: [
      { label: "(6 × 400) − 150 = 2,250 m", correct: true, feedback: `Correct — six equal laps build 2,400 m, and the crossing-off removes 150 from the whole bar once.` },
      { label: "6 × (400 − 150) = 1,500 m", correct: false, feedback: `That shortens EVERY lap by 150; the diagram crosses off 150 once, at the end.` },
      { label: "6 + 400 − 150 = 256 m", correct: false, feedback: `Equal parts stack into a product, not a sum — six parts of 400 is 6 × 400.` },
      { label: "(6 × 400) + 150 = 2,550 m", correct: false, feedback: `Crossed off means removed, so the final step subtracts.` },
    ] };
}
function FractionUnitMcq() {
  return { kind: "mcq",
    prompt: `A line plot records lengths in quarter-inches. Eight marks sit at 1/4 inch. What total length is that?`,
    options: [
      { label: "2 inches, because four quarter-inches make one inch", correct: true, feedback: `Correct — eight quarter-inches group into two whole inches, since each inch holds four of them.` },
      { label: "8 inches, because there are 8 marks", correct: false, feedback: `The marks count QUARTER-inches, not inches; eight of them is far less than eight inches.` },
      { label: "32 inches, because 8 × 4 = 32", correct: false, feedback: `Multiplying by four goes the wrong way — quarter-inches are smaller, so the inch count is fewer.` },
      { label: "1/2 inch, because 8 is bigger than 4", correct: false, feedback: `Eight quarter-inches is two whole inches; comparing the bare numbers ignores the unit.` },
    ] };
}
function MultiStepPlanMcq() {
  return { kind: "mcq",
    prompt: `"A crew works 5 shifts of 30 minutes, then converts the total to hours." What is the correct ORDER?`,
    options: [
      { label: "Multiply to find 150 minutes, then divide by 60", correct: true, feedback: `Correct — build the total in one unit first, then convert it once; 150 minutes is 2.5 hours.` },
      { label: "Divide 30 by 60 first, then multiply by 5", correct: false, feedback: `It reaches the same value, but converting each shift first invites fractions before they are needed.` },
      { label: "Add 5 and 30, then divide by 60", correct: false, feedback: `Adding a shift count to a shift length mixes quantities; 5 shifts OF 30 minutes multiply.` },
      { label: "Multiply 150 by 60", correct: false, feedback: `Hours are BIGGER than minutes, so the number must shrink — that means dividing.` },
    ] };
}

const REUSE = { ConvertLengthDown, ConvertLengthUp, ConvertMassDown, ConvertVolumeDown,
  ConvertVolumeUp, ConvertTimeDown, ConvertTimeUp, DistanceMultiStepNumeric,
  IntervalMultiStepNumeric, MoneyMultiStepNumeric, ContainerCountNumeric, QuarterUnitNumeric,
  BiggerUnitMcq: () => BiggerUnitMcq(), DirectionMcq: () => DirectionMcq(),
  TableMcq: () => TableMcq(), DiagramMcq: () => DiagramMcq(),
  FractionUnitMcq: () => FractionUnitMcq(), MultiStepPlanMcq: () => MultiStepPlanMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Name the quantity and the conversion factor, then decide whether the count should grow or shrink.") {
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

/* ---------------- manipulatives (all rated manip >= 2) ---------------- */
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

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Hold the quantity fixed while the unit changes, and watch which way the NUMBER moves for ${tag.replace(/-/g, " ")}.`,
  invariants: [`Converting never changes how much there is: a smaller unit needs more of them and a bigger unit needs fewer, so the number moves in the opposite direction to the unit size in ${tag.replace(/-/g, " ")}.`],
  misconceptions: [`Multiplying when converting to a bigger unit, adding the conversion factor instead of multiplying by it, or comparing bare numbers across different units.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `measure-problems-g4:${tag}`, delayed: true,
  counterfactualPrompt: "If the unit got ten times smaller, what would happen to the number that measures the same object?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  size: ["Smaller unit, larger number.", "The quantity never moves.", "Only the count changes."],
  dir: ["Which unit is smaller?", "More of them fit.", "Multiply going down."],
  step: ["Build the total first.", "Then adjust once.", "Order matters."],
  frac: ["Four quarters per unit.", "Group them into wholes.", "Smaller pieces, bigger count."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Measuring the same object in a different unit changes the NUMBER but never the amount. A rope is 3 meters and also 300 centimeters.",
  "Smaller units need more of them to cover the same length, so the number always moves opposite to the unit size.",
  { rep: "diagram", widget: () => hop("How many centimeters in 3 meters? Hop one meter at a time.", 0, 500, 0, 100, 3,
      "300 — three meter-hops, each worth 100 centimeters. Same rope, bigger number.",
      [[200, "Two meter-hops reach 200 cm; the rope is three meters long."],
       [400, "Four hops overshoot — three meters is 300 centimeters."]],
      "Short of the landing — each meter is 100 centimeters, so three of them reach 300.",
      "Past the landing — three meters stops exactly at 300 centimeters."),
    predict: P("A rope is 3 m. In centimeters, is the number bigger or smaller?", [{ id: "bigger", label: "Bigger" }, { id: "smaller", label: "Smaller" }], "bigger",
      "Centimeters are smaller, so many more of them fit along the same rope — 300 instead of 3.") },
  [
    reused("BiggerUnitMcq", "g4v1-k1", H.size, ["Smaller unit, larger count.", "The object is unchanged."]),
    reused("ConvertLengthDown", "g4v1-k2", H.dir, ["Each big unit holds many small.", "Multiply."]),
    reused("BiggerUnitMcq", "g4v1-k3", H.size, ["Numbers differ, lengths agree.", "Units explain it."]),
    reused("ConvertLengthDown", "g4v1-ch1", H.dir, ["Bigger quantities, same rule.", "Multiply by the factor."]),
  ],
  ["Converting changes the number, not the amount.", "Smaller units give larger numbers.", "The object never changes."],
  "next: writing the relationship down.");

def(2,
  "A conversion table records the relationship once and applies it to every row: 1 m = 100 cm, 2 m = 200 cm, 3 m = 300 cm.",
  "Because one constant factor generates every row, the table lets you jump straight to 9 m = 900 cm without listing the rows between.",
  { rep: "diagram", widget: () => bars("Build the conversion table in hundreds of centimeters: 1 m, 2 m, 3 m, 4 m.",
      ["1 m", "2 m", "3 m", "4 m"], [1, 2, 3, 4],
      "1, 2, 3, 4 hundreds of centimeters — one constant factor generating every row.",
      "Each row is one more hundred of centimeters than the row above it."),
    predict: P("If 1 m = 100 cm, what is 9 m?", [{ id: "900", label: "900 cm" }, { id: "109", label: "109 cm" }], "900",
      "The same factor applies to every row: nine meters is nine hundreds of centimeters.") },
  [
    reused("TableMcq", "g4v2-k1", H.dir, ["One rule, every row.", "Predict any row."]),
    reused("ConvertLengthDown", "g4v2-k2", H.dir, ["Quantity times factor.", "Down to the smaller unit."]),
    reused("ConvertLengthUp", "g4v2-k3", H.dir, ["Up to the bigger unit.", "Divide by the factor."]),
    reused("ConvertLengthDown", "g4v2-ch1", H.dir, ["Any row, same factor.", "Multiply."]),
  ],
  ["A table records one constant factor.", "Every row obeys it.", "Any row can be predicted."],
  "next: length in both directions.");

def(3,
  "Converting length runs both ways: meters to centimeters multiplies by 100, and centimeters to meters divides by it.",
  "Decide the direction before you compute. Going to the smaller unit the number grows; going to the bigger unit it shrinks.",
  { rep: "diagram", widget: () => hop("How many centimeters in 4 meters? Hop one meter at a time.", 0, 600, 0, 100, 4,
      "400 — four meter-hops of 100 centimeters each.",
      [[300, "Three hops reach 300 cm; the object is four meters long."],
       [500, "Five hops overshoot — four meters is 400 centimeters."]],
      "Short of the landing — four meters needs four hops of 100 centimeters.",
      "Past the landing — four meters stops exactly at 400 centimeters."),
    predict: P("500 cm in meters — will the number grow or shrink?", [{ id: "shrink", label: "Shrink" }, { id: "grow", label: "Grow" }], "shrink",
      "Meters are bigger, so fewer of them cover the same rope: 500 cm is only 5 m.") },
  [
    reused("ConvertLengthDown", "g4v3-k1", H.dir, ["Down a unit, multiply.", "More small units fit."]),
    reused("ConvertLengthUp", "g4v3-k2", H.dir, ["Up a unit, divide.", "Fewer big units fit."]),
    reused("DirectionMcq", "g4v3-k3", H.dir, ["Decide direction first.", "Then compute."]),
    reused("ConvertLengthUp", "g4v3-ch1", H.dir, ["Bigger totals, same division.", "Shrink the number."]),
  ],
  ["Down a unit: multiply.", "Up a unit: divide.", "Decide direction before computing."],
  "next: mass and weight.");

def(4,
  "Mass converts identically: a kilogram holds 1,000 grams, so 5 kg is 5,000 g. Only the factor changes from one quantity to the next.",
  "This is the payoff of learning the structure — the same two decisions, direction and factor, cover every measurement family there is.",
  { rep: "diagram", widget: () => hop("How many grams in 3 kilograms? Hop one kilogram at a time.", 0, 5000, 0, 1000, 3,
      "3,000 — three kilogram-hops of 1,000 grams each.",
      [[2000, "Two hops reach 2,000 g; the pack is three kilograms."],
       [4000, "Four hops overshoot — three kilograms is 3,000 grams."]],
      "Short of the landing — each kilogram is 1,000 grams, so three reach 3,000.",
      "Past the landing — three kilograms stops exactly at 3,000 grams."),
    predict: P("Converting 5 kg to grams, multiply or divide?", [{ id: "mult", label: "Multiply by 1,000" }, { id: "div", label: "Divide by 1,000" }], "mult",
      "Grams are smaller, so many more of them make up the same mass: 5,000 g.") },
  [
    reused("ConvertMassDown", "g4v4-k1", H.dir, ["Kilograms hold 1,000 grams.", "Multiply."]),
    reused("DirectionMcq", "g4v4-k2", H.dir, ["Smaller unit, more of them.", "Direction first."]),
    reused("ConvertMassDown", "g4v4-k3", H.dir, ["Same structure, new factor.", "Quantity times factor."]),
    reused("ConvertLengthUp", "g4v4-ch1", H.dir, ["Other families divide too.", "Up means fewer."]),
  ],
  ["Mass converts by the same rule.", "Only the factor changes.", "Structure carries across families."],
  "next: liquid volume.");

def(5,
  "Liquid volume follows the pattern too: a liter holds 1,000 milliliters, so 4 L is 4,000 mL and 6,000 mL is 6 L.",
  "By now the only new information in a conversion problem is the factor — everything else you already know how to do.",
  { rep: "diagram", widget: () => hop("How many milliliters in 4 liters? Hop one liter at a time.", 0, 6000, 0, 1000, 4,
      "4,000 — four liter-hops of 1,000 milliliters each.",
      [[3000, "Three hops reach 3,000 mL; the jug holds four liters."],
       [5000, "Five hops overshoot — four liters is 4,000 milliliters."]],
      "Short of the landing — each liter is 1,000 milliliters, so four reach 4,000.",
      "Past the landing — four liters stops exactly at 4,000 milliliters."),
    predict: P("6,000 mL in liters?", [{ id: "six", label: "6 L" }, { id: "sixmillion", label: "6,000,000 L" }], "six",
      "Liters are bigger, so the number must shrink: 6,000 ÷ 1,000 = 6.") },
  [
    reused("ConvertVolumeDown", "g4v5-k1", H.dir, ["Liters hold 1,000 mL.", "Multiply going down."]),
    reused("ConvertVolumeUp", "g4v5-k2", H.dir, ["Up to liters, divide.", "Fewer big units."]),
    reused("ContainerCountNumeric", "g4v5-k3", H.step, ["Every liter must travel.", "Round the partial jug up."]),
    reused("ConvertVolumeDown", "g4v5-ch1", H.dir, ["Same two decisions.", "Direction and factor."]),
  ],
  ["Volume converts by the same rule.", "Liters hold 1,000 millilitres.", "Only the factor is new."],
  "next: time, where the factor is 60.");

def(6,
  "Time breaks the pattern of tens: an hour holds 60 minutes and a minute holds 60 seconds, but the two decisions are unchanged.",
  "Direction and factor still settle everything — which is why a factor of 60 is no harder than a factor of 1,000 once the structure is clear.",
  { rep: "diagram", widget: () => hop("How many minutes in 3 hours? Hop one hour at a time.", 0, 300, 0, 60, 3,
      "180 — three hour-hops of 60 minutes each.",
      [[120, "Two hops reach 120 minutes; the hike lasts three hours."],
       [240, "Four hops overshoot — three hours is 180 minutes."]],
      "Short of the landing — each hour is 60 minutes, so three reach 180.",
      "Past the landing — three hours stops exactly at 180 minutes."),
    predict: P("Does a factor of 60 change the method?", [{ id: "no", label: "No — same two decisions" }, { id: "yes", label: "Yes" }], "no",
      "Direction and factor are all a conversion ever needs; 60 simply replaces 100 or 1,000.") },
  [
    reused("ConvertTimeDown", "g4v6-k1", H.dir, ["Hours hold 60 minutes.", "Multiply going down."]),
    reused("ConvertTimeUp", "g4v6-k2", H.dir, ["Up to hours, divide.", "Fewer big units."]),
    reused("DirectionMcq", "g4v6-k3", H.dir, ["The factor is the only news.", "Method unchanged."]),
    reused("ConvertTimeDown", "g4v6-ch1", H.dir, ["Minutes to seconds too.", "Sixty again."]),
  ],
  ["Time uses 60, not 10.", "The method is unchanged.", "Direction and factor settle it."],
  "next: distance problems.");

def(7,
  "Distance problems combine measurement with arithmetic: six laps of 400 meters build 2,400 m, and stopping 150 m early leaves 2,250 m.",
  "Build the total first, then adjust it once. Reversing that order changes the meaning of the problem entirely.",
  { rep: "diagram", widget: () => estimate("6 laps of 400 m, stopping 150 m early — slide to estimate the distance.", 100, 12000, 2250, "meters",
      "Too low — six laps of four hundred already build well over two thousand meters.",
      "Too high — six laps of 400 m is 2,400 m, and the walk stops short of that.",
      "About 2,250 — 2,400 m built, then 150 m removed once at the end."),
    predict: P("6 laps of 400 m, stopping 150 m early. Total?", [{ id: "2250", label: "2,250 m" }, { id: "1500", label: "1,500 m" }], "2250",
      "The 150 comes off the whole distance once, not off every lap.") },
  [
    reused("DistanceMultiStepNumeric", "g4v7-k1", H.step, ["Build the total.", "Then adjust once."]),
    reused("DiagramMcq", "g4v7-k2", H.step, ["Crossed off at the end.", "Not from every part."]),
    reused("DistanceMultiStepNumeric", "g4v7-k3", H.step, ["Equal laps multiply.", "Shortfall subtracts."]),
    reused("ConvertLengthUp", "g4v7-ch1", H.dir, ["Report in bigger units.", "Divide to convert."]),
  ],
  ["Build the total from equal parts.", "Adjust once at the end.", "Order changes the meaning."],
  "next: intervals of time.");

def(8,
  "Time intervals work the same way: five shifts of 30 minutes is 150 minutes, and finishing 20 minutes early leaves 130.",
  "When the answer is wanted in hours, convert AFTER building the total — one conversion at the end beats several along the way.",
  { rep: "diagram", widget: () => hop("Five shifts of 30 minutes — hop one shift at a time.", 0, 240, 0, 30, 5,
      "150 minutes — five shift-hops of 30 minutes each, which is two and a half hours.",
      [[120, "Four hops reach 120 minutes; there are five shifts."],
       [180, "Six hops overshoot — five shifts of 30 minutes is 150."]],
      "Short of the landing — each shift is 30 minutes, so five reach 150.",
      "Past the landing — five shifts of 30 minutes stops exactly at 150."),
    predict: P("Five 30-minute shifts, answer wanted in hours. Convert when?", [{ id: "after", label: "After building the total" }, { id: "before", label: "Before, per shift" }], "after",
      "One conversion at the end is cleaner than five, and avoids fractions before they are needed.") },
  [
    reused("IntervalMultiStepNumeric", "g4v8-k1", H.step, ["Build the total minutes.", "Then adjust."]),
    reused("MultiStepPlanMcq", "g4v8-k2", H.step, ["Convert once, at the end.", "Order matters."]),
    reused("ConvertTimeUp", "g4v8-k3", H.dir, ["Minutes to hours divides.", "Sixty per hour."]),
    reused("IntervalMultiStepNumeric", "g4v8-ch1", H.step, ["Longer shifts, same plan.", "Total, then adjust."]),
  ],
  ["Build the total in one unit.", "Convert once, at the end.", "Fewer conversions, fewer slips."],
  "next: money.");

def(9,
  "Money problems are measurement problems with dollars as the unit: nine passes at 25 dollars build 225, and a 40-dollar voucher leaves 185.",
  "The structure is identical to laps and shifts — equal groups first, single adjustment second.",
  { rep: "diagram", widget: () => bars("Build the cost of four passes at 25 dollars each, in tens of dollars.",
      ["Pass 1", "Pass 2", "Pass 3", "Pass 4"], [25, 25, 25, 25],
      "100 dollars in four equal parts of 25 — the total before any voucher comes off.",
      "Every pass costs the same 25 dollars; build each bar to 25."),
    predict: P("Nine passes at 25 dollars, 40 off. Total?", [{ id: "185", label: "185 dollars" }, { id: "265", label: "265 dollars" }], "185",
      "225 built, then 40 removed once — a voucher reduces the bill rather than adding to it.") },
  [
    reused("MoneyMultiStepNumeric", "g4v9-k1", H.step, ["Equal prices multiply.", "Discount subtracts."]),
    reused("DiagramMcq", "g4v9-k2", H.step, ["Once, from the total.", "Not from each item."]),
    reused("MoneyMultiStepNumeric", "g4v9-k3", H.step, ["Build, then adjust.", "One discount."]),
    reused("ContainerCountNumeric", "g4v9-ch1", H.step, ["Partial groups round up.", "Everything must be carried."]),
  ],
  ["Money follows the same structure.", "Equal groups build the total.", "The discount comes off once."],
  "next: fractions of a unit.");

def(10,
  "Measurements often land between whole units. A line plot in quarter-inches records eight marks at 1/4, and four of them rebuild one inch.",
  "Smaller pieces mean a bigger count — exactly the rule from converting units, now applied inside a single unit.",
  { rep: "diagram", widget: () => nlPlace("On a QUARTER-unit line, place where 8 quarter-marks reach.", 4, 2,
      "2/4 of the way — but as a length, eight quarter-units is two whole units.",
      [[1, "One quarter-mark is a single jump; eight of them were recorded."],
       [4, "4/4 is one whole unit; eight quarter-marks reach twice that."]],
      "Short of the landing — count the quarter-jumps the marks represent.",
      "Past the landing — the target sits at the halfway mark on this line."),
    predict: P("Eight quarter-inches — how many inches?", [{ id: "two", label: "2 inches" }, { id: "eight", label: "8 inches" }], "two",
      "Four quarter-inches make one inch, so eight of them group into exactly two.") },
  [
    reused("QuarterUnitNumeric", "g4v10-k1", H.frac, ["Four quarters per unit.", "Group them."]),
    reused("FractionUnitMcq", "g4v10-k2", H.frac, ["Marks count quarters.", "Not units."]),
    reused("QuarterUnitNumeric", "g4v10-k3", H.frac, ["Smaller pieces, bigger count.", "Same rule as units."]),
    reused("QuarterUnitNumeric", "g4v10-ch1", H.frac, ["More marks, same grouping.", "Divide by four."]),
  ],
  ["Measurements land between whole units.", "Four quarters rebuild one unit.", "Smaller pieces, bigger count."],
  "next: putting it all together.");

def(11,
  "Multi-step measurement problems chain everything: build a total from equal groups, adjust it, then convert the result to the unit asked for.",
  "Do the steps in that order and each one stays simple. Convert first and you carry awkward numbers through every later step.",
  { rep: "diagram", widget: () => estimate("8 shifts of 45 minutes, finishing 30 minutes early — estimate the minutes.", 50, 4000, 330, "minutes",
      "Too low — eight shifts of forty-five minutes already exceed five hours.",
      "Too high — eight shifts of 45 minutes is 360 minutes, and the crew stops before that.",
      "About 330 — 360 minutes built, then 30 removed once."),
    predict: P("Total first or convert first?", [{ id: "total", label: "Total first" }, { id: "convert", label: "Convert first" }], "total",
      "Building the total in one unit keeps the numbers whole; convert once, at the very end.") },
  [
    reused("IntervalMultiStepNumeric", "g4v11-k1", H.step, ["Build, adjust, convert.", "In that order."]),
    reused("MultiStepPlanMcq", "g4v11-k2", H.step, ["One conversion.", "At the end."]),
    reused("MoneyMultiStepNumeric", "g4v11-k3", H.step, ["Same chain, new units.", "Structure carries."]),
    reused("ConvertTimeUp", "g4v11-ch1", H.dir, ["Finish in bigger units.", "Divide once."]),
  ],
  ["Build, adjust, then convert.", "One conversion at the end.", "Order keeps the numbers simple."],
  "next: drawing the problem.");

def(12,
  "A diagram makes the plan visible: equal parts for the groups, a crossed-off piece for what comes away, and a label for the unit.",
  "Where the crossing sits is the whole question — at the end of the bar it happens once, inside every part it happens to each group.",
  { rep: "diagram", widget: () => bars("Draw the diagram for 6 laps of 400 m: build six equal parts, in hundreds of meters.",
      ["Lap 1", "Lap 2", "Lap 3", "Lap 4", "Lap 5", "Lap 6"], [4, 4, 4, 4, 4, 4],
      "Six equal parts of four hundred meters — 2,400 m before the 150 m shortfall comes off the end.",
      "Every lap is the same length: build each bar to four hundreds of meters."),
    predict: P("150 m crossed off the END of the bar means…", [{ id: "once", label: "Removed once, from the total" }, { id: "each", label: "Removed from each lap" }], "once",
      "A mark at the end of the whole bar removes 150 m one time; a mark inside every part would remove it six times.") },
  [
    reused("DiagramMcq", "g4v12-k1", H.step, ["Read where the mark sits.", "End or inside."]),
    reused("DistanceMultiStepNumeric", "g4v12-k2", H.step, ["Equal parts, then removal.", "Once."]),
    reused("DiagramMcq", "g4v12-k3", H.step, ["The picture holds the order.", "Draw before computing."]),
    reused("MoneyMultiStepNumeric", "g4v12-ch1", H.step, ["Any units, same diagram.", "Build then adjust."]),
  ],
  ["Diagrams show equal parts and removals.", "Where the mark sits sets the order.", "Draw the plan before computing."],
  "course complete: converted, chained, and diagrammed.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 12, `12 lessons defined, got ${L.length}`);
const chapterTitles = ["Units and Conversion", "Converting Every Quantity", "Measurement Problems"];
const perChapter = [4, 4, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 8 ? 2 : 3);
const outDir = join(root, "content/courses/measure-problems-g4");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g4v-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "symbolic") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "measure-problems-g4",
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

  // Tier A needs formal 3: an ENTRY (numeric) check AFTER a manip>=2 step.
  const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);
  const MANIP2 = new Set(["numberLineHop", "barBuilder", "estimateSlider", "numberLinePlace", "areaModel", "columnCalc", "fractionBar", "tapDiagram"]);
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
      if (f === "mbMultiplyTensNumeric") must(n[0] * n[1] === w.answer, `${id}/${s.id} conversion: quantity FIRST, factor second`);
      if (f === "mbDivideBigNumeric") must(n[0] / n[1] === w.answer, `${id}/${s.id} conversion: total FIRST, factor second`);
      if (f === "mbMultiStepNumeric") must(n[0] * n[1] - n[2] === w.answer, `${id}/${s.id} mbMultiStep n0*n1−n2`);
      if (f === "mbInterpretRemaindersNumeric") must(Math.ceil(n[0] / n[1]) === w.answer, `${id}/${s.id} ceil(n0/n1)`);
      if (f === "mcFractionMeasurementNumeric") must(n[0] / 4 === w.answer, `${id}/${s.id} quarter-units n0/4`);
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
    if (w.type === "barBuilder") must(w.categories.length === w.target.length, `${id}/${s.id} barBuilder misaligned`);
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
  id: "measure-problems-g4", slug: "measure-problems-g4", title: spec.title,
  tagline: "Same amount, different unit — decide the direction, apply the factor, then solve.",
  category: "Math", gradeLevel: 4, chapters,
}, null, 2) + "\n");
console.log(`built 12 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
