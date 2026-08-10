#!/usr/bin/env node
// S194 — Batch C course 6/6: data-line-plots-g2 (2.MD.D.9, 2.MD.D.10). Zero new generator code.
//
// VERIFIED routes (g2-measure-money-time):
//   MmtLinePlotNumeric / MmtBarGraphNumeric / MmtPictureGraphNumeric -> n[0]
//     (the prompt states the count in words; its FIRST number IS the answer — asserted)
//   MmtGraphCompareNumeric -> n[1] − n[0]  (smaller category first — asserted)
//   MmtRulerSubtractNumeric -> n[1] − n[0] (the measuring lessons)
//   Add2DigitNumeric (g2-add-subtract-100) -> arithmetic, for put-together questions
//     (no Mmt route sums categories; cross-family precedent stands)
// Manipulatives — ALL runtime-templated from corpus (zero guessed fields, proven in course 5):
//   dotPlot (the line plot itself; integer data via denominator 1 — corpus precedent),
//   barBuilder with display "tally" | "pictograph" | "bar" (the S185 steppers),
//   graphRead with mode "picture" | "bar", and unitRuler from measure-length-g1.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "data-line-plots-g2");
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
const DOT_T = corpusTemplate("dotPlot");
const BAR_T = corpusTemplate("barBuilder");
const READ_T = corpusTemplate("graphRead");
const RULER_T = corpusTemplate("unitRuler", "measure-length-g1");

const REG_MMT = new Set(["MmtBarGraphNumeric","MmtBestUnitMcq","MmtCoinNameMcq",
  "MmtCoinReverseMoneyBoard","MmtEstimateMcq","MmtGraphCompareNumeric","MmtLengthCompareMcq",
  "MmtLengthDifferenceNumeric","MmtLinePlotNumeric","MmtPictureGraphNumeric","MmtRulerReadNumeric",
  "MmtRulerSubtractNumeric","MmtSkip5sNumeric","MmtUnitFitMcq"]);
const REG100 = new Set(["Add2DigitNumeric","Add2DigitMcq","AddOnesNumeric","AddOnesMcq",
  "AddTensNumeric","AddTensMcq","ChooseStepsNumeric","ChooseStepsMcq","DoublesNumeric","DoublesMcq",
  "Fluency20Numeric","Fluency20Mcq","NearDoublesNumeric","NearDoublesMcq","OddEvenMcq",
  "OddEvenOddEvenPairs","ParitySumNumeric","ParitySumMcq","RegroupAddNumeric","Sub2DigitMcq",
  "SubOnesMcq","SubTensMcq","TwoStepTradeNumeric","TwoStepTradeMcq","UnbundleSubMcq"]);
const REG = { "g2-measure-money-time": REG_MMT, "g2-add-subtract-100": REG100 };

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

function traps2(answer, cands) {
  const out = [];
  for (const [v, fb] of cands) {
    if (v !== answer && v >= 0 && !out.some((o) => o[0] === v)) out.push([v, fb]);
    if (out.length === 2) break;
  }
  while (out.length < 2) {
    const v = answer + 3 + out.length;
    out.push([v, "That count does not match the graph — return to the display and count what is actually drawn."]);
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const CATS = [["apples", "votes"], ["pinecones", "finds"], ["stickers", "stickers"], ["shells", "shells"]];

/* ---------------- graded mirrors ---------------- */
function LinePlotCountNumeric(r) {
  const count = pick(r, 3, 8); const at = pick(r, 4, 12);
  const ans = count;
  return { gen: "g2-measure-money-time", form: "MmtLinePlotNumeric",
    prompt: `A line plot shows ${count} x's above the number ${at}. How many data points are at ${at}?`, answer: ans,
    traps: traps2(ans, [[at, `That read the LABEL under the stack — the count is how many x's stand on it.`],
                        [count + at, `Label and count got added together; only the x's in the stack are data points.`]]) };
}
function TallestStackNumeric(r) {
  const count = pick(r, 5, 9); const at = pick(r, 3, 4);
  return { gen: "g2-measure-money-time", form: "MmtLinePlotNumeric",
    prompt: `The tallest stack shows ${count} x's above the number ${at} inches. How many measurements sit in that stack?`, answer: count,
    traps: traps2(count, [[at, `${at} names the MEASUREMENT the stack stands on; the stack's height is its count.`],
                          [count - 1, `One x went uncounted — the stack holds every mark drawn above ${at}.`]]) };
}
function PictographCountNumeric(r) {
  const [thing, noun] = CATS[pick(r, 0, CATS.length - 1)];
  const count = pick(r, 4, 9); const day = DAYS[pick(r, 0, 4)];
  return { gen: "g2-measure-money-time", form: "MmtPictureGraphNumeric",
    prompt: `The picture graph shows ${count} ${thing} pictures for ${day}. Each picture equals 1 ${noun.replace(/s$/, "")}. How many ${noun} on ${day}?`, answer: count,
    traps: traps2(count, [[count + 1, `One phantom picture crept into the count; tally only what the row shows.`],
                          [count * 2, `Each picture equals ONE here — doubling belongs to keys worth two.`]]) };
}
function BarReadNumeric(r) {
  const h = pick(r, 3, 9);
  return { gen: "g2-measure-money-time", form: "MmtBarGraphNumeric",
    prompt: `A bar reaches ${h} on the bar graph, where each gridline is worth 1. How many is that?`, answer: h,
    traps: traps2(h, [[h + 1, `That read one gridline above the bar's top — follow the top straight across.`],
                      [h - 1, `One gridline low; the bar's top sits exactly on ${h}.`]]) };
}
function GraphCompareNumeric(r) {
  const i = pick(r, 0, 3); const dayA = DAYS[i], dayB = DAYS[i + 1];
  const a = pick(r, 3, 6); const b = a + pick(r, 2, 5);
  must(b > a, "compare prompt must lead with the smaller count");
  const ans = b - a;
  return { gen: "g2-measure-money-time", form: "MmtGraphCompareNumeric",
    prompt: `${dayA} has ${a} votes and ${dayB} has ${b} votes. How many more votes on ${dayB}?`, answer: ans,
    traps: traps2(ans, [[a + b, `That put the days TOGETHER — "how many more" asks for the gap between the bars.`],
                        [b, `${b} is ${dayB}'s whole count; the question wants only its lead over ${dayA}.`]]) };
}
function PutTogetherNumeric(r) {
  const i = pick(r, 0, 3); const dayA = DAYS[i], dayB = DAYS[i + 1];
  const a = pick(r, 12, 38); const b = pick(r, 11, 35);
  const ans = a + b;
  return { gen: "g2-add-subtract-100", form: "Add2DigitNumeric",
    prompt: `${a} + ${b} = ? (${dayA}'s and ${dayB}'s counts put together)`, answer: ans,
    traps: traps2(ans, [[Math.abs(a - b), `That measured the gap between the days — "put together" collects BOTH counts.`],
                        [ans + 10, `A stray ten joined the total; each day contributes exactly its own count.`]]) };
}
function RulerMeasureNumeric(r) {
  const startM = pick(r, 1, 4); const endM = startM + pick(r, 4, 9);
  must(endM > startM, "ruler prompt leads with the smaller mark");
  const ans = endM - startM;
  return { gen: "g2-measure-money-time", form: "MmtRulerSubtractNumeric",
    prompt: `A ribbon in the group stretches from the ${startM} cm mark to the ${endM} cm mark. How long is it?`, answer: ans,
    traps: traps2(ans, [[endM, `That read the end mark as the length — subtract where the ribbon starts.`],
                        [endM + startM, `Adding the marks measures nothing; the span between them is the length.`]]) };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function RecordFaithMcq() {
  return { kind: "mcq",
    prompt: `You measured five ribbons: 6, 8, 6, 7, 6 cm. Which record keeps ALL the information?`,
    options: [
      { label: "6, 8, 6, 7, 6 — every measurement, repeats included", correct: true, feedback: `Correct — a record's job is completeness; the three 6s are three real ribbons, not one.` },
      { label: "6, 7, 8 — just the different values", correct: false, feedback: `Dropping repeats erases HOW MANY ribbons hit each length — the very thing a line plot will need.` },
      { label: "The biggest: 8", correct: false, feedback: `One number describes one ribbon; four others vanish from that record.` },
      { label: "About 7 each", correct: false, feedback: `An average-flavored summary trades away the individual measurements a plot is built from.` },
    ] };
}
function ModeMcq(r) {
  const vals = [5, 6, 7, 8];
  const counts = [2, pick(r, 4, 6), 3, 1];
  const top = vals[counts.indexOf(Math.max(...counts))];
  return { kind: "mcq",
    prompt: `A line plot shows stacks of ${counts[0]}, ${counts[1]}, ${counts[2]}, and ${counts[3]} x's above ${vals[0]}, ${vals[1]}, ${vals[2]}, and ${vals[3]} inches. Which measurement is most common?`,
    options: [
      { label: `${top} inches — its stack is tallest`, correct: true, feedback: `Correct — "most common" crowns the VALUE under the tallest stack, ${counts[1]} strong.` },
      { label: `${counts[1]} inches`, correct: false, feedback: `${counts[1]} is the tall stack's COUNT of x's, not the measurement those x's record.` },
      { label: `${vals[3]} inches — the biggest value`, correct: false, feedback: `Biggest value and most common value are different crowns; ${vals[3]}'s stack holds just ${counts[3]}.` },
      { label: "They are all equally common", correct: false, feedback: `The stacks differ in height, and height IS frequency on a line plot.` },
    ] };
}
function ChooseGraphMcq(r) {
  const kind = pick(r, 0, 1);
  if (kind === 0) {
    return { kind: "mcq",
      prompt: `You measured 20 ribbons to the nearest centimeter and want to see which lengths repeat. Which display fits?`,
      options: [
        { label: "A line plot — stacks over a number line", correct: true, feedback: `Correct — measurements live on a number line, and stacked x's make every repeat visible at a glance.` },
        { label: "A picture graph of ribbon drawings", correct: false, feedback: `Picture graphs shine for CATEGORIES; centimeter values want their places on a number line.` },
        { label: "A single total of all lengths", correct: false, feedback: `One grand total hides every individual length — the repeats you wanted vanish inside it.` },
        { label: "No graph can show repeats", correct: false, feedback: `Showing repeats is precisely the line plot's specialty — each repeat adds an x to its stack.` },
      ] };
  }
  return { kind: "mcq",
    prompt: `The class voted for a field-trip spot among four choices. Which display fits the votes?`,
    options: [
      { label: "A bar or picture graph — one bar or row per choice", correct: true, feedback: `Correct — votes belong to CATEGORIES, and bars or picture rows compare categories cleanly.` },
      { label: "A line plot over a number line", correct: false, feedback: `Trip choices are not numbers on a line — a line plot has nowhere honest to put "the museum".` },
      { label: "A ruler drawing", correct: false, feedback: `Rulers measure length; votes need counting per category, not measuring.` },
      { label: "Whichever is prettiest", correct: false, feedback: `The DATA chooses the display: categories take bars, measurements take line plots.` },
    ] };
}
function MeasurePlanMcq() {
  return { kind: "mcq",
    prompt: `To measure every ribbon in a group fairly, what must stay the SAME for all of them?`,
    options: [
      { label: "The unit — every ribbon in centimeters", correct: true, feedback: `Correct — one shared unit makes the numbers comparable; 6 of one unit and 6 of another are strangers.` },
      { label: "The ribbon color", correct: false, feedback: `Color carries no length information; the measuring unit is what fairness rides on.` },
      { label: "The person holding the ruler", correct: false, feedback: `Anyone can measure — provided everyone uses the same unit the same way.` },
      { label: "Nothing — measurement is automatic", correct: false, feedback: `Switching units mid-group quietly breaks every comparison the data was gathered for.` },
    ] };
}

const REUSE = { LinePlotCountNumeric, TallestStackNumeric, PictographCountNumeric, BarReadNumeric,
  GraphCompareNumeric, PutTogetherNumeric, RulerMeasureNumeric,
  RecordFaithMcq: () => RecordFaithMcq(), ModeMcq, ChooseGraphMcq, MeasurePlanMcq: () => MeasurePlanMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Read the display itself: count what is drawn, and let the stacks, rows, and bars do the remembering.") {
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

/* ---------------- manipulatives (corpus-templated) ---------------- */
function dotPlot(prompt, values, target, askIndex, success, partial) {
  const w = structuredClone(DOT_T);
  // Schema floors denominator at 2; dotPlotLabel reduces by GCD, so numerator 2v over
  // denominator 2 RENDERS as the whole number v — G2 whole-unit plots, schema-legal.
  w.prompt = prompt; w.values = values.map((v) => v * 2); w.denominator = 2;
  w.target = target; w.given = [...target]; // read-only widget: one truth array (lint contract)
  w.askIndex = askIndex; w.maxPerValue = Math.max(...target) + 2;
  w.successFeedback = success; w.partialFeedback = partial;
  must(w.values.every((v) => v % 2 === 0), "dotPlot numerators must reduce to whole labels");
  must(askIndex >= 0 && askIndex < values.length, "dotPlot askIndex in range");
  must(values.length === target.length, "dotPlot values/target aligned");
  return w;
}
function builder(prompt, display, categories, target, success, partial) {
  const w = structuredClone(BAR_T);
  w.prompt = prompt; w.display = display; w.categories = categories; w.target = target;
  w.maxVal = Math.max(...target) + 2; w.step = 1; w.histogram = false;
  w.successFeedback = success; w.partialFeedback = partial;
  must(categories.length === target.length, "builder categories/target aligned");
  must(["bar", "tally", "pictograph"].includes(display), "builder display enum");
  return w;
}
function reader(prompt, mode, drawn, categoryLabel, unitNoun, success, traps) {
  const w = structuredClone(READ_T);
  w.prompt = prompt; w.mode = mode; w.drawn = drawn; w.unitValue = 1;
  w.categoryLabel = categoryLabel; w.unitNoun = unitNoun; w.unitNounPlural = unitNoun + "s";
  w.scaleMax = drawn + 3;
  w.commonResults = traps.map(([value, feedback]) => {
    must(value !== drawn && value >= 0 && value <= w.scaleMax, `reader trap ${value}`);
    must(feedback.length >= 25, "reader trap feedback short");
    return { value, feedback };
  });
  if ("successFeedback" in w) w.successFeedback = success;
  must(["picture", "bar", "tally"].includes(mode), "reader mode enum");
  return w;
}
function ruler(prompt, objectStart, objectEnd, requiredPlacements, success) {
  const w = structuredClone(RULER_T);
  w.prompt = prompt; w.objectStart = objectStart; w.objectEnd = objectEnd;
  w.requiredPlacements = requiredPlacements; w.successFeedback = success;
  must(objectEnd - objectStart === requiredPlacements * (w.targetUnitSize ?? 1),
    "ruler placements must tile the object exactly");
  return w;
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`A display and its data are the same information in two forms: every measurement appears exactly once, and counts survive the trip into stacks, rows, and bars for ${tag.replace(/-/g, " ")}.`],
  misconceptions: [`Reading a label as a count, dropping repeats while recording, or comparing categories by adding instead of finding the gap.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `data-line-plots-g2:${tag}`, delayed: true,
  counterfactualPrompt: "What change to the data would the display be FORCED to show — and what change could it silently hide?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  measure: ["One shared unit for all.", "Mark to mark is the length.", "Record as you go."],
  plot: ["One x per measurement.", "Stacks sit on their value.", "Height is frequency."],
  read: ["Count what is drawn.", "Labels name, stacks count.", "Follow tops to the scale."],
  q: ["Together adds the counts.", "'More' measures the gap.", "The graph holds the numbers."],
  choose: ["Categories take bars.", "Measurements take line plots.", "The data picks the display."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Measuring a whole group starts with one promise: the SAME unit for every object, start to finish.",
  "With a shared unit, every number in the group speaks the same language — and comparisons become honest.",
  { rep: "concrete", widget: () => ruler("Measure this ribbon of the group with one-unit blocks: align its start and tile it exactly.", 2, 6, 4,
      "Four one-unit blocks tile it exactly — one ribbon measured, in the unit the whole group shares."),
    predict: P("Half the group is measured in cm, half in paperclips. Comparable?", [{ id: "no", label: "No — units must match" }, { id: "yes", label: "Yes — numbers are numbers" }], "no",
      "A 6 in centimeters and a 6 in paperclips are different lengths wearing the same digit.") },
  [
    reused("MeasurePlanMcq", "g2g1-k1", H.measure, ["One unit for the whole group.", "That is the fairness rule."]),
    reused("RulerMeasureNumeric", "g2g1-k2", H.measure, ["Mark to mark, subtracted.", "Non-zero starts subtract out."]),
    reused("RulerMeasureNumeric", "g2g1-k3", H.measure, ["Each object gets the same care.", "Span between the marks."]),
    reused("RulerMeasureNumeric", "g2g1-ch1", H.measure, ["The group grows, the rule holds.", "Same unit, every time."]),
  ],
  ["One unit for all.", "Mark to mark is the length.", "Shared units make comparisons honest."],
  "next: writing the measurements down.");

def(2,
  "A record keeps EVERYTHING: every measurement, repeats included, in the order they came — the raw material of every graph to come.",
  "Three ribbons of 6 cm are three facts; a record that collapses them to one has already lost data.",
  { rep: "diagram", widget: () => builder("Record the counts so far as tallies: 6 cm seen 3 times, 7 cm twice, 8 cm once.", "tally",
      ["6 cm", "7 cm", "8 cm"], [3, 2, 1],
      "Three, two, one — every measurement remembered, repeats and all.",
      "Match each tally group to how many times that measurement appeared — repeats each earn a mark."),
    predict: P("Your record drops the repeated 6s. What is lost?", [{ id: "freq", label: "How OFTEN 6 cm occurred" }, { id: "nothing", label: "Nothing important" }], "freq",
      "The value 6 survives, but its three-ness dies — and frequency is what the plot will need.") },
  [
    reused("RecordFaithMcq", "g2g2-k1", H.measure, ["Records keep repeats.", "Completeness is the job."]),
    reused("RulerMeasureNumeric", "g2g2-k2", H.measure, ["Measure, then write immediately.", "Memory drops data."]),
    reused("RecordFaithMcq", "g2g2-k3", H.measure, ["Summaries come later.", "Raw data comes first."]),
    reused("RulerMeasureNumeric", "g2g2-ch1", H.measure, ["The record feeds the plot.", "Faithful in, faithful out."]),
  ],
  ["Keep every measurement.", "Repeats are real data.", "Records feed the graphs."],
  "next: turning the record into a line plot.");

def(3,
  "A line plot puts a number line under the data: each measurement becomes one x above its value, and repeats stack up.",
  "Building it is transcription — one x per record entry, no more, no less. The stacks appear on their own.",
  { rep: "diagram", widget: () => dotPlot("The record 6, 6, 7, 6, 8, 7 became this plot. Verify the transcription: count the x's above 6.",
      [6, 7, 8], [3, 2, 1], 0,
      "Three — exactly as many x's as the record holds 6s. The transcription is faithful.",
      "Check the plot against the record: the 6-stack must hold one x per recorded 6, no more, no less."),
    predict: P("The record holds six measurements. How many x's will the finished plot show?", [{ id: "six", label: "Exactly six" }, { id: "three", label: "Three — one per value" }], "six",
      "Every measurement earns its own x; values shared by several get taller stacks, not fewer marks.") },
  [
    reused("LinePlotCountNumeric", "g2g3-k1", H.plot, ["One x per data point.", "Stacks grow from repeats."]),
    reused("LinePlotCountNumeric", "g2g3-k2", H.plot, ["The stack's height is its count.", "The label is its value."]),
    reused("RecordFaithMcq", "g2g3-k3", H.measure, ["The plot mirrors the record.", "Faithful transcription."]),
    reused("TallestStackNumeric", "g2g3-ch1", H.plot, ["Tall stacks mean frequent values.", "Height is frequency."]),
  ],
  ["One x per measurement.", "Stacks sit on their values.", "Repeats build height."],
  "next: reading a finished plot.");

def(4,
  "Reading a line plot is counting what stands there: the x's in a stack answer 'how many at this value?'",
  "The label under a stack NAMES the measurement; the x's above it COUNT the data — two jobs, never swapped.",
  { rep: "diagram", widget: () => dotPlot("How many ribbons measured 7? Count the x's in its stack.",
      [6, 7, 8], [3, 4, 1], 1,
      "Four — every x above 7 and nothing from a neighboring stack.",
      "Count only the stack above 7: every x in it, and no x from another stack."),
    predict: P("A stack of 5 x's stands over the number 8. How many data points at 8?", [{ id: "five", label: "5 — the x's count" }, { id: "eight", label: "8 — the label" }], "five",
      "The 8 names the value; the five x's ARE the data points standing on it.") },
  [
    reused("LinePlotCountNumeric", "g2g4-k1", H.read, ["Count the x's, not the label.", "Stacks hold the data."]),
    reused("LinePlotCountNumeric", "g2g4-k2", H.read, ["Neighboring stacks stay out.", "One stack per question."]),
    reused("TallestStackNumeric", "g2g4-k3", H.read, ["The tallest stack, counted.", "Height read as number."]),
    reused("LinePlotCountNumeric", "g2g4-ch1", H.read, ["Any stack, same reading.", "X's answer 'how many'."]),
  ],
  ["Labels name, x's count.", "Read one stack at a time.", "The stack is the answer."],
  "next: the most common measurement.");

def(5,
  "The most common measurement wears the tallest stack — find the peak, then read the VALUE beneath it.",
  "Two different numbers meet at the peak: the count of x's (how many) and the value below (what they measured). 'Most common' asks for the value.",
  { rep: "diagram", widget: () => dotPlot("Find the most common length: which value carries the tallest stack?",
      [5, 6, 7, 8], [2, 5, 3, 1], 1,
      "Six — five ribbons landed there, more than any other length.",
      "Compare the stack heights first; then read the value under the winner."),
    predict: P("The tallest stack has 5 x's over the value 6. The most common measurement is…", [{ id: "six", label: "6 — the value beneath" }, { id: "five", label: "5 — the stack's count" }], "six",
      "The crown goes to the VALUE the peak stands on; its height merely proves the win.") },
  [
    reused("ModeMcq", "g2g5-k1", H.read, ["Peak first, value second.", "Two numbers, one crown."]),
    reused("TallestStackNumeric", "g2g5-k2", H.read, ["Count the winning stack.", "Its height is the frequency."]),
    reused("ModeMcq", "g2g5-k3", H.read, ["Biggest value is a decoy.", "Most common ≠ largest."]),
    reused("TallestStackNumeric", "g2g5-ch1", H.read, ["New plots, same peak hunt.", "Height decides, value answers."]),
  ],
  ["The tallest stack wins.", "Read the value beneath it.", "Count and value are different crowns."],
  "next: building a picture graph.");

def(6,
  "A picture graph counts categories with pictures: one row per category, one picture per counted thing — the key says what each picture is worth.",
  "With a key of 1, building is transcription again: four finds on Monday means four pictures in Monday's row.",
  { rep: "diagram", widget: () => builder("Build the picture graph: Monday 4 finds, Tuesday 6, Wednesday 3.", "pictograph",
      ["Monday", "Tuesday", "Wednesday"], [4, 6, 3],
      "Four, six, and three pictures — thirteen finds, each wearing its own icon.",
      "Each row's pictures must equal its count — one picture per find when the key is 1."),
    predict: P("The key says each picture = 1 find. Monday had 4 finds. How many pictures in its row?", [{ id: "four", label: "4 pictures" }, { id: "one", label: "1 big picture" }], "four",
      "A key of one is one-to-one: every find earns its own picture in the row.") },
  [
    reused("PictographCountNumeric", "g2g6-k1", H.plot, ["One picture per counted thing.", "The key sets the worth."]),
    reused("PictographCountNumeric", "g2g6-k2", H.plot, ["Rows are categories.", "Pictures are the counts."]),
    reused("ChooseGraphMcq", "g2g6-k3", H.choose, ["Categories suit pictures.", "The data picks the display."]),
    reused("PictographCountNumeric", "g2g6-ch1", H.plot, ["Bigger counts, longer rows.", "The key never changes mid-graph."]),
  ],
  ["One row per category.", "The key sets each picture's worth.", "Building is faithful counting."],
  "next: reading picture graphs.");

def(7,
  "Reading a picture graph is counting a row and multiplying by the key — with a key of 1, the count IS the answer.",
  "The rows also compare at a glance: a longer row means a bigger count, before any counting starts.",
  { rep: "diagram", widget: () => reader("How many finds does Tuesday's row show? Move the marker to its count.", "picture", 6, "Tuesday", "find",
      "Six — every picture in the row counted, none borrowed from a neighbor.",
      [[5, "That stopped one picture short — sweep the WHOLE row before settling the marker."],
       [7, "One picture too many; only Tuesday's own row belongs in Tuesday's count."]]),
    predict: P("Two rows: one clearly longer. Before counting, which category has more?", [{ id: "longer", label: "The longer row" }, { id: "cannot", label: "Cannot tell without counting" }], "longer",
      "Equal-worth pictures make row length a fair proxy — longer row, larger count.") },
  [
    reused("PictographCountNumeric", "g2g7-k1", H.read, ["Count the row's pictures.", "Times the key, if not 1."]),
    reused("GraphCompareNumeric", "g2g7-k2", H.q, ["'More' asks for the gap.", "Subtract the smaller row."]),
    reused("PictographCountNumeric", "g2g7-k3", H.read, ["Rows keep to themselves.", "One category per question."]),
    reused("GraphCompareNumeric", "g2g7-ch1", H.q, ["Compare any two rows.", "The gap is the answer."]),
  ],
  ["Count the row, apply the key.", "Longer rows hold more.", "Gaps answer 'how many more'."],
  "next: building a bar graph.");

def(8,
  "A bar graph trades pictures for height: one bar per category, its top resting exactly on the count.",
  "The gridlines are the ruler — building means raising each bar until its top touches its number, no further.",
  { rep: "diagram", widget: () => builder("Build the graph: Vans 4, Bikes 6, Cars 3.", "bar",
      ["Vans", "Bikes", "Cars"], [4, 6, 3],
      "Four, six, and three — each bar's top resting exactly on its count.",
      "Compare each bar against its count — the top must sit exactly on its number."),
    predict: P("Bikes counted 6. Where must the Bikes bar stop?", [{ id: "on", label: "Its top exactly on 6" }, { id: "near", label: "Anywhere near 6" }], "on",
      "The gridline is a promise: the top ON the number, or the graph misreports the data.") },
  [
    reused("BarReadNumeric", "g2g8-k1", H.plot, ["Tops rest on their counts.", "Gridlines are the ruler."]),
    reused("BarReadNumeric", "g2g8-k2", H.plot, ["Each category, one bar.", "Height carries the number."]),
    reused("ChooseGraphMcq", "g2g8-k3", H.choose, ["Bars also suit categories.", "Pictures and bars are cousins."]),
    reused("BarReadNumeric", "g2g8-ch1", H.plot, ["Taller data, taller bars.", "Exactness at the top."]),
  ],
  ["One bar per category.", "Tops rest exactly on counts.", "Gridlines keep bars honest."],
  "next: reading bar graphs.");

def(9,
  "Reading a bar means following its top straight across to the scale — the number it touches is the count.",
  "Compare bars the way you compared rows: taller means more, and the difference in heights is the difference in counts.",
  { rep: "diagram", widget: () => reader("How many votes does the Pizza bar show? Move the marker.", "bar", 7, "Pizza", "vote",
      "Seven — the bar's top followed straight across to the scale.",
      [[6, "That reads one gridline low. Follow the bar's TOP straight across to the scale."],
       [8, "That reads one gridline high. The top touches 7, not the line above it."]]),
    predict: P("A bar's top sits between gridlines 6 and 8, exactly on 7. Its count is…", [{ id: "seven", label: "7" }, { id: "eight", label: "8 — round up" }], "seven",
      "The top touches 7 and the scale does not round; bars report exactly where they stop.") },
  [
    reused("BarReadNumeric", "g2g9-k1", H.read, ["Follow the top across.", "Read where it touches."]),
    reused("GraphCompareNumeric", "g2g9-k2", H.q, ["Height gaps are count gaps.", "Subtract to compare."]),
    reused("BarReadNumeric", "g2g9-k3", H.read, ["No rounding at the top.", "Bars are exact reporters."]),
    reused("GraphCompareNumeric", "g2g9-ch1", H.q, ["Any two bars compare.", "The gap answers 'more'."]),
  ],
  ["Follow tops to the scale.", "Taller means more.", "Height gaps are count gaps."],
  "next: put-together questions.");

def(10,
  "Graphs answer 'how many together?' too: read each category's count, then ADD them — the graph holds the numbers, the sum joins them.",
  "Monday's 23 and Tuesday's 31 put together make 54 — a two-step: read, read, add.",
  { rep: "diagram", widget: () => reader("Step one of a put-together: read Monday's bar first.", "bar", 5, "Monday", "vote",
      "Five — one addend secured; the other bar and the addition finish the job.",
      [[4, "One gridline low — an addend misread poisons the whole put-together."],
       [6, "One gridline high; read the top exactly before adding anything."]]),
    predict: P("'How many votes on Monday and Tuesday together?' The plan is…", [{ id: "readadd", label: "Read both bars, then add" }, { id: "tall", label: "Report the taller bar" }], "readadd",
      "Together collects BOTH counts; the taller bar alone answers a different question.") },
  [
    reused("PutTogetherNumeric", "g2g10-k1", H.q, ["Read each count first.", "Then join them."]),
    reused("PutTogetherNumeric", "g2g10-k2", H.q, ["The sum is off-graph work.", "The graph supplies the addends."]),
    reused("BarReadNumeric", "g2g10-k3", H.read, ["Misread bars poison sums.", "Exact tops, then add."]),
    reused("PutTogetherNumeric", "g2g10-ch1", H.q, ["Three categories join the same way.", "Read, read, read, add."]),
  ],
  ["Read, then add.", "The graph supplies addends.", "Together collects every count."],
  "next: take-apart and compare questions.");

def(11,
  "'How many MORE?' is a gap question: subtract the smaller count from the larger — the graph shows the gap as extra height or extra row.",
  "The visible overhang and the subtraction agree: 9 − 5 = 4, and the taller bar overtops the shorter by exactly four gridlines.",
  { rep: "diagram", widget: () => reader("A compare question begins with a careful read: Thursday's bar.", "bar", 9, "Thursday", "vote",
      "Nine — the larger count secured; subtracting the other bar's count finds the gap.",
      [[8, "One gridline low — a compare question is only as good as its two reads."],
       [10, "One gridline high; the top touches 9 exactly."]]),
    predict: P("Tuesday shows 5, Thursday shows 9. 'How many more on Thursday?' means…", [{ id: "gap", label: "9 − 5 = 4" }, { id: "sum", label: "9 + 5 = 14" }], "gap",
      "'More' measures the lead, not the pile — the gap between the bars is the answer.") },
  [
    reused("GraphCompareNumeric", "g2g11-k1", H.q, ["Smaller from larger.", "The gap is the lead."]),
    reused("GraphCompareNumeric", "g2g11-k2", H.q, ["The overhang shows the gap.", "Sight and subtraction agree."]),
    reused("PutTogetherNumeric", "g2g11-k3", H.q, ["Together vs. more: different asks.", "Add joins, subtract compares."]),
    reused("GraphCompareNumeric", "g2g11-ch1", H.q, ["Any pair compares the same way.", "Read both, subtract once."]),
  ],
  ["'More' means the gap.", "Smaller from larger.", "The overhang is visible subtraction."],
  "next: choosing the right graph.");

def(12,
  "The data chooses its display: measurements on a number line want a line plot; categories want bars or pictures.",
  "Ask what the data IS — lengths repeat on a line; votes belong to choices — and the right graph names itself.",
  { rep: "diagram", widget: () => builder("Votes for four trip spots — a category question. Build the fitting display.", "bar",
      ["Museum", "Farm", "Aquarium", "Park"], [5, 3, 7, 4],
      "Bars fit votes: one per choice, tops on their counts — categories compared at a glance.",
      "One bar per choice, each top exactly on its vote count."),
    predict: P("Twenty ribbon lengths, measured to the nearest cm. Which display?", [{ id: "plot", label: "A line plot" }, { id: "bars", label: "A bar per ribbon" }], "plot",
      "Twenty bars would name every ribbon; the line plot instead shows which LENGTHS repeat — the actual question.") },
  [
    reused("ChooseGraphMcq", "g2g12-k1", H.choose, ["Name what the data is.", "The display follows."]),
    reused("ChooseGraphMcq", "g2g12-k2", H.choose, ["Measurements: line plot.", "Categories: bars or pictures."]),
    reused("ModeMcq", "g2g12-k3", H.read, ["The chosen display answers best.", "Peaks show on line plots."]),
    reused("GraphCompareNumeric", "g2g12-ch1", H.q, ["Whatever the display, questions follow.", "Read, then add or subtract."]),
  ],
  ["The data picks the display.", "Lengths take line plots.", "Categories take bars and pictures."],
  "course complete: measured, recorded, plotted, graphed, and questioned.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 12, `12 lessons defined, got ${L.length}`);
const chapterTitles = ["From Measurements to a Line Plot", "Picture and Bar Graphs", "Questions Graphs Answer"];
const perChapter = [5, 4, 3];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 5 ? 1 : n <= 9 ? 2 : 3);
const outDir = join(root, "content/courses/data-line-plots-g2");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g2g-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "diagram") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "data-line-plots-g2",
    chapterId: chapters[ch - 1].id, minutes: 6, readingProfile: "standard",
    steps: [
      { id: "c1", kind: "concept", figure: "count-on-hops", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: "Try it.", conceptTag: tag, widget: d.i1.widget(), predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      stepFromCheck("k1", d.checks[0]),
      { id: "c2", kind: "concept", figure: "count-on-hops", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: "Try it again.", conceptTag: tag, widget: d.i1.widget(), cml: cml(tag, "diagram") },
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
      const nums = (w.prompt.match(/\d+/g) || []).map(Number);
      const f = s.variant?.form;
      if (f === "MmtLinePlotNumeric" || f === "MmtBarGraphNumeric" || f === "MmtPictureGraphNumeric") {
        must(nums[0] === w.answer, `${id}/${s.id} ${f}: first number must be the answer`);
      }
      if (f === "MmtGraphCompareNumeric") {
        must(nums[1] - nums[0] === w.answer && nums[1] > nums[0], `${id}/${s.id} n1−n0 route order`);
      }
      if (f === "MmtRulerSubtractNumeric") {
        must(nums[1] - nums[0] === w.answer && nums[1] > nums[0], `${id}/${s.id} ruler route order`);
      }
    }
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 4, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
    }
    if (w.type === "dotPlot") {
      must(w.values.length === w.target.length && w.values.length === w.given.length, `${id}/${s.id} dotPlot alignment`);
      must(Math.max(...w.target) <= w.maxPerValue, `${id}/${s.id} dotPlot cap`);
    }
    if (w.type === "barBuilder") {
      must(Math.max(...w.target) <= w.maxVal, `${id}/${s.id} builder cap`);
    }
    if (w.type === "graphRead") {
      for (const t of w.commonResults) must(t.value !== w.drawn, `${id}/${s.id} reader trap equals drawn`);
      must(w.drawn <= w.scaleMax, `${id}/${s.id} reader scale`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "data-line-plots-g2", slug: "data-line-plots-g2", title: spec.title,
  tagline: "Measure it, plot it, question it — data displays that keep every measurement honest.",
  category: "Math", gradeLevel: 2, chapters,
}, null, 2) + "\n");
console.log(`built 12 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
