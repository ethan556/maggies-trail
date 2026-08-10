#!/usr/bin/env node
// S194 — Batch C course 5/6: length-problems-g2 (2.MD.A.4, 2.MD.B.5). Zero new generator code.
//
// VERIFIED routes:
//   MmtLengthDifferenceNumeric -> n[0] − n[1]   (larger length FIRST in the prose — asserted)
//   MmtRulerReadNumeric / MmtRulerSubtractNumeric -> n[1] − n[0]  (smaller mark first — asserted)
//   MmtLengthCompareMcq -> parses "The <name> is <N> inches" tuples; picks the longest/shortest
//     name per the prompt keyword (pattern count and extreme-uniqueness asserted)
//   Add2DigitNumeric (g2-add-subtract-100) -> arithmetic, for joined lengths (cross-family
//     precedent: number-line-g2)
//   TwoStepTradeNumeric (g2-add-subtract-100) -> n[0] − n[1] + n[2] — the two-step lesson's exact
//     shape: had, used, added.
// Manipulatives: unitRuler + lengthCompare, with schema-complete field sets extracted from the
// shipped measure-length-g1 corpus AT RUNTIME (no guessed fields), plus numberLineHop.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "length-problems-g2");
if (!spec || spec.lessons.length !== 10) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

/* Schema-complete manipulative templates from the shipped G1 course — fields copied, not guessed. */
function corpusTemplate(type) {
  const dir = join(root, "content/courses/measure-length-g1/lessons");
  for (const f of readdirSync(dir).sort()) {
    const lesson = JSON.parse(readFileSync(join(dir, f), "utf8"));
    for (const s of lesson.steps) if (s.widget?.type === type) return structuredClone(s.widget);
  }
  throw new Error("no corpus template for " + type);
}
const RULER_T = corpusTemplate("unitRuler");
const COMPARE_T = corpusTemplate("lengthCompare");

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
    out.push([v, "That length does not fit the measurements given — line up what is known and re-measure the ask."]);
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

const OBJECTS = [["pine branch","oak branch"],["blue ribbon","red ribbon"],["garden hose","watering can cord"],["hiking pole","walking stick"],["clothesline","jump rope"]];

/* ---------------- graded mirrors ---------------- */
function HowMuchLongerNumeric(r) {
  const [big, small] = OBJECTS[pick(r, 0, OBJECTS.length - 1)];
  const b = pick(r, 20, 45); const a = b + pick(r, 8, 30);
  must(a > b, "length-difference prompt must lead with the larger length");
  const ans = a - b;
  return { gen: "g2-measure-money-time", form: "MmtLengthDifferenceNumeric",
    prompt: `The ${big} measures ${a} cm and the ${small} measures ${b} cm. How much longer is the ${big}?`,
    answer: ans,
    traps: traps2(ans, [[a + b, `That joined the two lengths — "how much longer" wants the gap between them, found by subtracting.`],
                        [ans + 2, `The gap came out two too wide; align the lengths end to end and recount the extra.`]]) };
}
function MissingLengthNumeric(r) {
  const part = pick(r, 25, 45); const whole = part + pick(r, 15, 40);
  must(whole > part, "missing-length prompt must lead with the whole");
  const ans = whole - part;
  return { gen: "g2-measure-money-time", form: "MmtLengthDifferenceNumeric",
    prompt: `The whole trail runs ${whole} meters and the first stretch covers ${part} meters. How many meters remain?`,
    answer: ans,
    traps: traps2(ans, [[whole + part <= 99 ? whole + part : ans + 10, `That stretched the trail LONGER — the remaining part is what the whole still owes after the first stretch.`],
                        [ans - 5, `Five meters of trail went missing; the parts must rebuild the whole exactly.`]]) };
}
function RulerSubtractNumeric(r) {
  const startM = pick(r, 2, 6); const endM = startM + pick(r, 5, 9);
  must(endM > startM, "ruler prompt must lead with the smaller mark");
  const ans = endM - startM;
  return { gen: "g2-measure-money-time", form: "MmtRulerSubtractNumeric",
    prompt: `A pencil stretches from the ${startM} cm mark to the ${endM} cm mark on a ruler. How long is it?`,
    answer: ans,
    traps: traps2(ans, [[endM, `That read the END mark as the length — a start away from zero must be subtracted off.`],
                        [endM + startM, `Adding the marks measures nothing on a ruler; the length is the span BETWEEN them.`]]) };
}
function AddLengthsNumeric(r) {
  const a = 10 * pick(r, 2, 4) + pick(r, 1, 6);
  const b = 10 * pick(r, 1, 3) + pick(r, 1, 9 - (a % 10) > 0 ? 9 - (a % 10) : 2);
  const ans = a + b;
  return { gen: "g2-add-subtract-100", form: "Add2DigitNumeric",
    prompt: `${a} + ${b} = ? (the two ribbon pieces joined end to end, in cm)`, answer: ans,
    traps: traps2(ans, [[a - b > 0 ? a - b : ans + 4, `That found how much longer one piece is — joining end to end ADDS the lengths.`],
                        [ans + 10, `A phantom ten crept in; each piece contributes exactly its own length.`]]) };
}
function TotalDistanceStaged(r) {
  const a = 10 * pick(r, 2, 3) + pick(r, 1, 5);
  const b = 10 * pick(r, 1, 2) + pick(r, 1, 4);
  const c = 10 * pick(r, 1, 2);
  const sofar = a + b; const ans = sofar + c;
  must(ans <= 99, "total distance within 100");
  return { gen: "g2-add-subtract-100", form: "Add2DigitNumeric",
    prompt: `${sofar} + ${c} = ? (the third leg joins the first two legs of ${a} m, ${b} m, and ${c} m)`, answer: ans,
    traps: traps2(ans, [[sofar, `The third leg never joined — a total distance collects EVERY leg walked.`],
                        [ans + c, `The last leg was counted twice; each leg enters the total once.`]]) };
}
function TwoStepNumeric(r) {
  const had = 10 * pick(r, 5, 7); const used = 10 * pick(r, 2, 3) + pick(r, 1, 5); const got = 10 * pick(r, 2, 3);
  const ans = had - used + got;
  must(had > used && ans <= 99, "two-step stays positive and within 100");
  return { gen: "g2-add-subtract-100", form: "TwoStepTradeNumeric",
    prompt: `Maggie had ${had} cm of ribbon, used ${used} cm on a bow, then bought ${got} cm more. How much ribbon now?`,
    answer: ans,
    traps: traps2(ans, [[had - used, `The story has a second step — the new ${got} cm still joins after the cutting.`],
                        [had + used - got > 0 ? had + used - got : ans + 3, `The steps ran backward: the bow TOOK ribbon away, and the purchase brought more.`]]) };
}
function CompareThreeMcq(r) {
  const names = ["ribbon", "shoelace", "bookmark", "straw"];
  const base = pick(r, 8, 14);
  const lens = [base, base + pick(r, 2, 5), base + pick(r, 7, 11), base - pick(r, 2, 5)];
  const wantLongest = r() < 0.5;
  const extremeIdx = wantLongest ? lens.indexOf(Math.max(...lens)) : lens.indexOf(Math.min(...lens));
  must(lens.filter((v) => v === lens[extremeIdx]).length === 1, "extreme length must be unique");
  const clauses = names.map((nm, i) => `The ${nm} is ${lens[i]} inches.`).join(" ");
  const others = names.filter((_, i) => i !== extremeIdx);
  const word = wantLongest ? "longest" : "shortest";
  return { kind: "mcq", gen: "g2-measure-money-time", form: "MmtLengthCompareMcq",
    prompt: `${clauses} Which is the ${word}?`,
    options: [
      { label: names[extremeIdx], correct: true, feedback: `Correct — at ${lens[extremeIdx]} inches the ${names[extremeIdx]} ${wantLongest ? "outreaches" : "comes in under"} every other item on the list.` },
      { label: others[0], correct: false, feedback: `The ${others[0]} measures ${lens[names.indexOf(others[0])]} inches — compare all four numbers before crowning the ${word}.` },
      { label: others[1], correct: false, feedback: `At ${lens[names.indexOf(others[1])]} inches the ${others[1]} sits in the middle of the pack, not at the ${word} end.` },
      { label: others[2], correct: false, feedback: `The ${others[2]}'s ${lens[names.indexOf(others[2])]} inches is ${wantLongest ? "the wrong extreme — that is nearer the shortest" : "too long for this question — check the small end"}.` },
    ] };
}
function DrawModelMcq() {
  return { kind: "mcq",
    prompt: `A drawing shows two bars: a 40 cm bar, and under it a 25 cm bar plus a mystery piece reaching the same end. What is the mystery piece?`,
    options: [
      { label: "The missing length: 40 − 25 = 15 cm", correct: true, feedback: `Correct — the two lower parts rebuild the 40 cm bar, so the mystery piece fills exactly the 15 cm gap.` },
      { label: "The total: 40 + 25 = 65 cm", correct: false, feedback: `The bars END together, so they are equal — nothing in the drawing stacks to 65.` },
      { label: "Another copy of the 25 cm piece", correct: false, feedback: `Two 25s would overshoot the 40 cm bar by 10 — the drawing's ends would no longer meet.` },
      { label: "It cannot be found from a drawing", correct: false, feedback: `The drawing is exactly what makes it findable — equal ends turn the picture into an equation.` },
    ] };
}
function LineModelMcq() {
  return { kind: "mcq",
    prompt: `To show a 34 cm piece joined to a 20 cm piece on a number line, what is the drawing?`,
    options: [
      { label: "Start at 0, jump 34, then jump 20 more — land on 54", correct: true, feedback: `Correct — lengths chain head to tail on the line, and the landing reads the joined total.` },
      { label: "Two dots at 34 and 20 with nothing between", correct: false, feedback: `Dots mark positions; joined LENGTHS need jumps laid end to end from zero.` },
      { label: "Start at 34 and jump back 20", correct: false, feedback: `Jumping back takes length away — joining pieces sends the second jump forward.` },
      { label: "Start at 20, jump 20", correct: false, feedback: `That drawing loses the 34 entirely; both pieces must appear as their own jumps.` },
    ] };
}
function ReasonableMcq(r) {
  const kind = pick(r, 0, 1);
  if (kind === 0) {
    return { kind: "mcq",
      prompt: `Maggie computes that a pencil measured from the 3 cm mark to the 11 cm mark is 14 cm long. Reasonable?`,
      options: [
        { label: "Too long — the marks are only 8 apart", correct: true, feedback: `Correct — 11 − 3 = 8, so 14 overshoots; she likely added the marks instead of subtracting.` },
        { label: "Reasonable — rulers can stretch", correct: false, feedback: `A ruler's spacing is fixed by design; the span between 3 and 11 can only ever be 8.` },
        { label: "Too short", correct: false, feedback: `The error runs the other way — 14 is LARGER than the true 8 cm span.` },
        { label: "Impossible to judge without the pencil", correct: false, feedback: `The two marks alone pin the length; the marks ARE the measurement.` },
      ] };
  }
  return { kind: "mcq",
    prompt: `Two trail legs of 32 m and 25 m give a computed total of 30 m. Reasonable?`,
    options: [
      { label: "Impossible — a total cannot be shorter than one of its parts", correct: true, feedback: `Correct — joining 32 with anything positive lands past 32; a 30 m total contradicts its own first leg.` },
      { label: "Reasonable — totals vary", correct: false, feedback: `Totals obey their parts: 32 + 25 must reach 57, never dip below 32.` },
      { label: "Reasonable if the legs overlap", correct: false, feedback: `Trail legs walked one after another do not overlap — each adds its full distance.` },
      { label: "Only a ruler could tell", correct: false, feedback: `Sense-checking needs no tools here — part-vs-total logic already rules 30 out.` },
    ] };
}

const REUSE = { HowMuchLongerNumeric, MissingLengthNumeric, RulerSubtractNumeric, AddLengthsNumeric,
  TotalDistanceStaged, TwoStepNumeric, CompareThreeMcq,
  DrawModelMcq: () => DrawModelMcq(), LineModelMcq: () => LineModelMcq(), ReasonableMcq };

function reused(mirror, seedStr, hints, ev,
                fallback = "Line the lengths up: same starting point, then read what the ends say — joins add, gaps subtract.") {
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
    const step = { widget: { type: "mcq", prompt: out.prompt, options: withIds }, hints, ev };
    if (out.form) { must(REG[out.gen]?.has(out.form), `${mirror}: ${out.gen}/${out.form} not registered`); step.variant = { gen: out.gen, form: out.form }; }
    return step;
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
function ruler(prompt, objectStart, objectEnd, requiredPlacements, success) {
  const w = structuredClone(RULER_T);
  w.prompt = prompt; w.objectStart = objectStart; w.objectEnd = objectEnd;
  w.requiredPlacements = requiredPlacements; w.successFeedback = success;
  must(objectEnd - objectStart === requiredPlacements * (w.targetUnitSize ?? 1),
    "ruler placements must tile the object exactly");
  return w;
}
function compare(prompt, topLabel, topLen, topOffset, bottomLabel, bottomLen, answerTop) {
  const w = structuredClone(COMPARE_T);
  w.prompt = prompt;
  w.items = [
    { id: "top", label: topLabel, length: topLen, startOffset: topOffset },
    { id: "bottom", label: bottomLabel, length: bottomLen },
  ];
  w.answerId = answerTop ? "top" : "bottom";
  must((topLen > bottomLen) === answerTop, "compare answer must match the longer item");
  return w;
}
function hop(prompt, min, max, start, hopSize, hops, success, traps = []) {
  const land = start + hopSize * hops;
  must(land >= min && land <= max && start >= min, `hop bounds ${start}->${land}`);
  const commonLandings = traps.map(([value, feedback]) => {
    must(value !== land && value >= min && value <= max, `hop trap ${value}`);
    must(feedback.length >= 25, "hop trap feedback short");
    return { value, feedback };
  });
  return { type: "numberLineHop", prompt, min, max, start, hop: hopSize, hops, direction: "forward",
    commonLandings, missFeedback: `Each hop is ${hopSize}. From ${start}, ${hops} hops land on ${land}.`,
    successFeedback: success };
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`Lengths compare only from a shared start, join by placing end to end, and split so the parts rebuild the whole exactly for ${tag.replace(/-/g, " ")}.`],
  misconceptions: [`Comparing unaligned ends, reading a ruler's end mark as a length, or letting a total drift from the sum of its parts.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `length-problems-g2:${tag}`, delayed: true,
  counterfactualPrompt: "What would have to change about the pieces for the total or the gap to come out differently?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  cmp: ["Line the starting ends up.", "Read the far ends.", "The overhang is the difference."],
  ruler: ["Find both marks.", "The length is the span between.", "Subtract the smaller mark."],
  join: ["Place the pieces end to end.", "The total is the far end.", "Every piece counts once."],
  part: ["Whole minus the known part.", "The parts rebuild the whole.", "Check by re-joining."],
  sense: ["Compare answer to parts.", "Totals outgrow their parts.", "Gaps fit inside the longer."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "'How much longer' is a gap question: line both objects up at the same start and the overhang IS the answer.",
  "The gap you can see equals the difference you can compute — subtracting the shorter from the longer names the overhang.",
  { rep: "concrete", widget: () => compare("Line the ribbons up from the same start. Which is longer?", "blue ribbon", 7, 2, "red ribbon", 5, true),
    predict: P("Two ribbons start together; one sticks out past the other. What is the overhang?", [{ id: "diff", label: "The difference in their lengths" }, { id: "sum", label: "Their lengths added" }], "diff",
      "The shared part cancels; only the extra shows — and the extra is longer minus shorter.") },
  [
    reused("HowMuchLongerNumeric", "g2p1-k1", H.cmp, ["Subtract the shorter length.", "The overhang is the gap."]),
    reused("HowMuchLongerNumeric", "g2p1-k2", H.cmp, ["Bigger length leads the sentence.", "Then the gap is positive."]),
    reused("CompareThreeMcq", "g2p1-k3", H.cmp, ["Compare ALL the numbers.", "The extreme wins the title."]),
    reused("HowMuchLongerNumeric", "g2p1-ch1", H.cmp, ["Bigger objects, same gap logic.", "Align, then subtract."]),
  ],
  ["Align the starts.", "The overhang is the difference.", "Longer minus shorter."],
  "next: comparing a whole set of measurements.");

def(2,
  "With several measurements, comparing means ranking: scan every number before naming the longest or the shortest.",
  "The middle numbers are the traps — an item can beat two others and still lose the crown.",
  { rep: "concrete", widget: () => compare("Two of the four items, aligned: which of these two is longer?", "hiking pole", 8, 2, "walking stick", 6, true),
    predict: P("An item is longer than TWO others in a set of four. Is it the longest?", [{ id: "maybe", label: "Not necessarily — check the fourth" }, { id: "yes", label: "Yes" }], "maybe",
      "Beating some is not beating all; the crown needs every comparison.") },
  [
    reused("CompareThreeMcq", "g2p2-k1", H.cmp, ["Scan every measurement.", "Crown only the extreme."]),
    reused("HowMuchLongerNumeric", "g2p2-k2", H.cmp, ["The top two still differ.", "Their gap is a subtraction."]),
    reused("CompareThreeMcq", "g2p2-k3", H.cmp, ["Shortest works the same way.", "The other extreme."]),
    reused("HowMuchLongerNumeric", "g2p2-ch1", H.cmp, ["Rank first, then measure gaps.", "Order organizes the set."]),
  ],
  ["Ranking needs every number.", "Middle values are traps.", "Extremes take the titles."],
  "next: differences read straight off a ruler.");

def(3,
  "A ruler measures by marks: an object from the 3 cm mark to the 11 cm mark is 11 − 3 = 8 cm — the END mark is not the length.",
  "Starting away from zero is fine; the ruler just asks you to subtract the start back out.",
  { rep: "concrete", widget: () => ruler("Measure the ribbon with one-unit blocks: align its start, place four with no gaps or overlaps.", 2, 6, 4,
      "Four one-unit blocks tile the ribbon exactly — the count of units IS the length, wherever the ribbon starts."),
    predict: P("An object runs from mark 3 to mark 11. Is it 11 cm long?", [{ id: "no", label: "No — it is 11 − 3 = 8 cm" }, { id: "yes", label: "Yes — the end says 11" }], "no",
      "The stretch before mark 3 belongs to the ruler, not the object; subtracting the start returns the true 8.") },
  [
    reused("RulerSubtractNumeric", "g2p3-k1", H.ruler, ["End mark minus start mark.", "The span is the length."]),
    reused("RulerSubtractNumeric", "g2p3-k2", H.ruler, ["A non-zero start subtracts out.", "The ruler forgives it."]),
    reused("ReasonableMcq", "g2p3-k3", H.sense, ["Sense-check ruler readings.", "Spans cannot exceed end marks."]),
    reused("RulerSubtractNumeric", "g2p3-ch1", H.ruler, ["Any two marks, same rule.", "Between is what you measure."]),
  ],
  ["The end mark is not the length.", "Subtract the start mark.", "The span between is the answer."],
  "next: joining two lengths.");

def(4,
  "Joining lengths end to end ADDS them: a 34 cm piece and a 25 cm piece make one 59 cm stretch.",
  "The joined length has no seams — where one piece stops the next begins, and the far end reads the sum.",
  { rep: "number-line", widget: () => hop("Join a 34 cm piece and a 20 cm piece: from 34, two ten-hops for the second piece.", 20, 70, 34, 10, 2,
      "54 — the second piece laid end to end carries the far end to the joined total.",
      [[36, "Two centimeters of the second piece placed — the whole 20 must join."]]),
    predict: P("Two pieces joined end to end: what does the far end read?", [{ id: "sum", label: "The SUM of the lengths" }, { id: "long", label: "Just the longer piece" }], "sum",
      "Each piece pushes the end farther by its full length — the far end accumulates both.") },
  [
    reused("AddLengthsNumeric", "g2p4-k1", H.join, ["End to end means add.", "The far end is the sum."]),
    reused("AddLengthsNumeric", "g2p4-k2", H.join, ["Order of joining is free.", "The total cannot tell."]),
    reused("LineModelMcq", "g2p4-k3", H.join, ["Draw joins as chained jumps.", "Zero starts the chain."]),
    reused("AddLengthsNumeric", "g2p4-ch1", H.join, ["Longer pieces, same seam-free join.", "Add and read the end."]),
  ],
  ["End to end adds.", "The far end reads the sum.", "Joining order is free."],
  "next: totals across several legs.");

def(5,
  "A journey's total distance collects every leg: add them one at a time and let the running total walk with you.",
  "Three legs of 34, 21, and 20 meters total 75 — staged exactly like any long sum, because that is what it is.",
  { rep: "number-line", widget: () => hop("Legs of a hike: the first two banked 55 m; the last leg is 20 m. Hop its tens.", 40, 90, 55, 10, 2,
      "75 meters — every leg collected, no meter walked twice.",
      [[57, "Two meters of the last leg — the full 20 belongs in the total."]]),
    predict: P("A total distance skips one leg. Is it still the total?", [{ id: "no", label: "No — totals collect every leg" }, { id: "yes", label: "Close enough" }], "no",
      "Leaving out a leg measures a different, shorter journey — the total owes every part its due.") },
  [
    reused("TotalDistanceStaged", "g2p5-k1", H.join, ["Stage the legs like addends.", "Bank after each."]),
    reused("TotalDistanceStaged", "g2p5-k2", H.join, ["The last leg lands the total.", "Nothing counted twice."]),
    reused("ReasonableMcq", "g2p5-k3", H.sense, ["A total outgrows each leg.", "Smaller totals are alarms."]),
    reused("TotalDistanceStaged", "g2p5-ch1", H.join, ["More legs, same collection.", "The running total remembers."]),
  ],
  ["Totals collect every leg.", "Stage and bank.", "No leg twice, none skipped."],
  "next: when a length goes missing.");

def(6,
  "A missing length hides inside a whole: whole minus the known part reveals it, because the parts must rebuild the whole.",
  "If the trail is 75 m and the first stretch is 40, the rest can only be 35 — nothing else re-assembles to 75.",
  { rep: "number-line", widget: () => hop("Rebuild the whole: the known 40 m stretch is walked; hop the missing part's tens toward 75.", 30, 90, 40, 10, 3,
      "70 — three tens of the missing part walked; five more meters would complete the 75 m whole.",
      [[50, "One ten of the missing stretch — keep walking until the whole is rebuilt."]]),
    predict: P("Whole 75, known part 40. The missing part must be…", [{ id: "d", label: "75 − 40 = 35" }, { id: "s", label: "75 + 40" }], "d",
      "The parts rebuild the whole: 40 + 35 = 75, and no other missing part manages it.") },
  [
    reused("MissingLengthNumeric", "g2p6-k1", H.part, ["Whole minus known part.", "The remainder is the answer."]),
    reused("MissingLengthNumeric", "g2p6-k2", H.part, ["Check by re-joining the parts.", "They must hit the whole."]),
    reused("DrawModelMcq", "g2p6-k3", H.part, ["Bars make the gap visible.", "Equal ends, one equation."]),
    reused("MissingLengthNumeric", "g2p6-ch1", H.part, ["Bigger wholes, same rebuild.", "Subtract, then verify."]),
  ],
  ["The parts rebuild the whole.", "Whole minus known part.", "Re-join to check."],
  "next: drawings that solve length stories.");

def(7,
  "A bar drawing turns a length story into geometry: one bar per quantity, aligned starts, and the picture asks its own question.",
  "Equal ends say 'these match'; a gap says 'find me'; stacked bars say 'add us' — the drawing does the translating.",
  { rep: "diagram", widget: () => compare("The story's two bars, aligned: which quantity is longer?", "trail A", 8, 2, "trail B", 5, true),
    predict: P("In a bar drawing, what does a GAP between bar ends mean?", [{ id: "find", label: "A difference to find" }, { id: "err", label: "A drawing mistake" }], "find",
      "The gap is the picture's question — the difference between the quantities the bars represent.") },
  [
    reused("DrawModelMcq", "g2p7-k1", H.part, ["Read the bars' ends.", "Gaps ask for differences."]),
    reused("HowMuchLongerNumeric", "g2p7-k2", H.cmp, ["Compute what the drawing asks.", "Longer minus shorter."]),
    reused("DrawModelMcq", "g2p7-k3", H.part, ["Stacked bars ask for sums.", "The drawing sets the operation."]),
    reused("MissingLengthNumeric", "g2p7-ch1", H.part, ["Draw, read, compute.", "The bars never lie."]),
  ],
  ["One bar per quantity.", "The picture asks the question.", "Gaps subtract, stacks add."],
  "next: lengths on the number line.");

def(8,
  "The number line is a ruler that never ends: lengths become jumps from zero, joins chain forward, and differences appear as gaps.",
  "Everything from the number-line course carries over — length was the line's first job all along.",
  { rep: "number-line", widget: () => hop("A 34 cm piece as a jump from zero — then chain a 20 cm piece: two more ten-hops.", 0, 70, 34, 10, 2,
      "54 — two pieces chained on the endless ruler, their join read at the landing.",
      [[44, "One ten of the second piece — its whole 20 cm belongs in the chain."]]),
    predict: P("On the line, a length is best shown as…", [{ id: "jump", label: "A jump of that many units" }, { id: "dot", label: "A single dot" }], "jump",
      "A dot marks a place; a LENGTH covers ground — and covering ground is a jump.") },
  [
    reused("LineModelMcq", "g2p8-k1", H.join, ["Lengths are jumps.", "Chains start at zero."]),
    reused("AddLengthsNumeric", "g2p8-k2", H.join, ["Compute the chained landing.", "The line agrees with the sum."]),
    reused("RulerSubtractNumeric", "g2p8-k3", H.ruler, ["Marks on the line subtract too.", "Same rule as the ruler."]),
    reused("AddLengthsNumeric", "g2p8-ch1", H.join, ["Any lengths, one endless ruler.", "Jump, chain, read."]),
  ],
  ["The line is an endless ruler.", "Lengths are jumps.", "Joins chain, gaps subtract."],
  "next: stories that take two steps.");

def(9,
  "Some stories take two steps: ribbon is used AND bought, trail is walked AND backtracked. Handle one step at a time and carry the total between them.",
  "'Had 60, used 25, bought 30' is 60 − 25 + 30 — two moves, one running answer.",
  { rep: "number-line", widget: () => hop("Step two of a story: after using ribbon, 35 cm remained; the purchase adds 30. Hop its tens.", 20, 80, 35, 10, 3,
      "65 cm — the second step joined the survivor of the first.",
      [[45, "One ten of the purchase — the story bought three tens' worth."]]),
    predict: P("A two-step story: what carries you from step one to step two?", [{ id: "run", label: "The running total after step one" }, { id: "orig", label: "The original amount" }], "run",
      "Step two acts on what step one left behind — the running total is the bridge.") },
  [
    reused("TwoStepNumeric", "g2p9-k1", H.join, ["One step at a time.", "The total bridges them."]),
    reused("TwoStepNumeric", "g2p9-k2", H.join, ["Watch each step's direction.", "Used subtracts, bought adds."]),
    reused("ReasonableMcq", "g2p9-k3", H.sense, ["Sense-check between steps.", "Each stage must be possible."]),
    reused("TwoStepNumeric", "g2p9-ch1", H.join, ["New stories, same bridge.", "Step, carry, step."]),
  ],
  ["Two steps, one running total.", "Direction per step.", "The total bridges the moves."],
  "next: judging whether an answer can be right.");

def(10,
  "Before trusting an answer, test it against the story: totals must outgrow their parts, gaps must fit inside the longer piece, and ruler spans cannot beat their end marks.",
  "Sense-checking costs seconds and catches the classic slips — added marks, skipped legs, reversed steps — before they ever leave your page.",
  { rep: "concrete", widget: () => compare("A suspicious result, drawn: the 'computed gap' towers over the item it should fit inside. Which bar is longer?", "computed gap", 9, 2, "longer item", 6, true),
    predict: P("A computed difference comes out LONGER than the longer object. Possible?", [{ id: "no", label: "No — gaps fit inside the longer" }, { id: "yes", label: "Sometimes" }], "no",
      "The difference lives inside the longer length; outgrowing it means the computation slipped.") },
  [
    reused("ReasonableMcq", "g2p10-k1", H.sense, ["Test answers against parts.", "Impossible sizes are alarms."]),
    reused("TwoStepNumeric", "g2p10-k2", H.join, ["Solve, then sense-check.", "Both habits together."]),
    reused("ReasonableMcq", "g2p10-k3", H.sense, ["Name WHY it fails.", "Part-whole logic decides."]),
    reused("HowMuchLongerNumeric", "g2p10-ch1", H.cmp, ["A checked answer is a kept answer.", "Seconds well spent."]),
  ],
  ["Test answers against the story.", "Totals outgrow parts.", "Gaps fit inside the longer."],
  "course complete: lengths compared, joined, modeled, and sense-checked.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 10, `10 lessons defined, got ${L.length}`);
const chapterTitles = ["Comparing Lengths", "Joining and Missing Lengths", "Models, Steps, and Sense"];
const perChapter = [3, 3, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 3 ? 1 : n <= 6 ? 2 : 3);
const outDir = join(root, "content/courses/length-problems-g2");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g2p-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "diagram") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "length-problems-g2",
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
      if (s.variant?.form === "MmtLengthDifferenceNumeric") {
        const nums = (w.prompt.match(/\d+/g) || []).map(Number);
        must(nums[0] - nums[1] === w.answer && nums[0] > nums[1], `${id}/${s.id} n0−n1 route order`);
      }
      if (s.variant?.form === "MmtRulerSubtractNumeric") {
        const nums = (w.prompt.match(/\d+/g) || []).map(Number);
        must(nums[1] - nums[0] === w.answer && nums[1] > nums[0], `${id}/${s.id} n1−n0 route order`);
      }
      if (s.variant?.form === "TwoStepTradeNumeric") {
        const nums = (w.prompt.match(/\d+/g) || []).map(Number);
        must(nums[0] - nums[1] + nums[2] === w.answer, `${id}/${s.id} two-step route shape`);
      }
    }
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 4, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
      if (s.variant?.form === "MmtLengthCompareMcq") {
        const tuples = [...w.prompt.matchAll(/The ([a-z ]+) is (\d+) inches/g)].map((m) => [m[1], +m[2]]);
        must(tuples.length >= 3, `${id}/${s.id} compare-mcq needs the route's tuple pattern`);
        const wantLongest = w.prompt.includes("longest");
        const extreme = wantLongest ? Math.max(...tuples.map((t) => t[1])) : Math.min(...tuples.map((t) => t[1]));
        const winners = tuples.filter((t) => t[1] === extreme);
        must(winners.length === 1 && winners[0][0] === w.options[0].label, `${id}/${s.id} compare-mcq route winner`);
      }
    }
    if (w.type === "numberLineHop") {
      const land = w.start + w.hop * w.hops;
      must(land >= w.min && land <= w.max, `${id}/${s.id} hop land outside range`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "length-problems-g2", slug: "length-problems-g2", title: spec.title,
  tagline: "Align it, join it, question it — length problems where the model shows its work.",
  category: "Math", gradeLevel: 2, chapters,
}, null, 2) + "\n");
console.log(`built 10 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
