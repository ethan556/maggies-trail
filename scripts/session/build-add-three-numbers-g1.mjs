#!/usr/bin/env node
// S192 — PROTOCOL v3, Batch B course 1/3: add-three-numbers-g1 (1.OA.A.2, 1.OA.B.3).
//
// FIT-CHECK RESULT — deviates from HANDOVER's Batch B table, which predicted "no 3-addend
// grouping form; needs 2-4 new forms". Build-time fit-check says otherwise: the STRATEGY this
// standard teaches IS decomposition ("group two addends, then add the third"), so every graded
// numeric step is a genuine TWO-addend sum and parses under already-registered routes:
//   PartWholeNumeric   -> n[0]+n[1]      (pair sums, doubles, "10 + rest", totals past ten)
//   TensPartnersNumeric-> 10-n[0]        ("a + ? = 10", the make-ten partner)
//   UnknownNumeric     -> n[1]-n[0] ('+')("10 + ? = total", the missing third addend)
// The full three-addend judgments (which pair to group, any-order, strategy choice) are MCQs,
// which are gated structurally and declare the nearest shipped MCQ form. Net: ZERO new generator
// code, zero edits to variants.ts / g1Variants.ts / g1Independent.cjs / resolver bands.
//
// Writing "4 + 6 + 3 = ?" as a numeric would be the misfit: no route sums three numbers
// (PartWholeNumeric would return 10). Decomposing is not a workaround — it is the taught method.
//
// S191 lessons baked in: declared forms are asserted against the REGISTERED form list (the
// solver's permissive fallback once masked an unregistered name); NO authoring-time MCQ option
// rotation (corpus convention is correct-at-index-0, pinned >0.95 in optionOrder.test.tsx; the
// learner-facing shuffle happens at RENDER time); >=4 options per MCQ; numeric/MCQ mixed per
// lesson for tier safety.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "add-three-numbers-g1");
if (!spec || spec.lessons.length !== 10) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

// The REGISTERED g1-add-subtract forms (read from VARIANT_GENERATORS at fit-check time).
// Asserting membership here is the S191 lesson: solvePrompt has a permissive fallback that
// silently accepts an unregistered name, while variantForGenForm correctly rejects it.
const REGISTERED = new Set([
  "BiggerFirstNumeric","BiggerFirstMcq","CompareNumeric","CompareMcq","CountBackMcq",
  "CountOnSmallNumeric","CountingOnNumeric","CountingOnMcq","DifferenceMcq","EqualSignMcq",
  "EqualSignNumeric","FactFamilyNumeric","MakeTenFirstNumeric","MakeTenFirstMcq",
  "PartWholeNumeric","PartWholeMcq","ResultUnknownNumeric","ResultUnknownMcq","SubFactsMcq",
  "TakeAwayMcq","TensPartnersNumeric","TensPartnersMcq","UnknownNumeric",
]);

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
const band = (b, s, c, st) => (b === "support" ? s : b === "stretch" ? st : c);

/* ---- numeric mirrors: every prompt parses under a REGISTERED route ---- */
// PartWholeNumeric -> n[0]+n[1]
function PairSumNumeric(r, b) {
  const a = pick(r, 2, band(b, 5, 7, 9)), c = pick(r, 2, band(b, 5, 7, 9));
  const answer = a + c;
  // Trap-collision guard: the "difference" trap coincides with the "first addend" trap whenever
  // c === 2a. Pick the first distinct fallback rather than dropping a trap.
  const diff = Math.abs(a - c);
  const second = (diff !== a && diff !== answer) ? diff
               : (c !== a && c !== answer) ? c
               : answer + 1;
  return { form: "PartWholeNumeric", prompt: `${a} + ${c} = ?`, answer,
    commonErrors: [[a, `That is only the first addend; the pair's total joins both.`],
                   [second, `That does not join both addends into a single total.`]] };
}
function TenPlusRestNumeric(r, b) {
  const c = pick(r, 2, band(b, 6, 8, 9));
  return { form: "PartWholeNumeric", prompt: `10 + ${c} = ?`, answer: 10 + c,
    commonErrors: [[10, `That stops at the ten without adding the remaining ${c}.`],
                   [c, `That is only the leftover addend, not the whole total.`]] };
}
function DoubleThenAddNumeric(r, b) {
  const n = pick(r, 2, band(b, 5, 7, 8)), c = pick(r, 2, band(b, 5, 7, 9));
  return { form: "PartWholeNumeric", prompt: `${2 * n} + ${c} = ?`, answer: 2 * n + c,
    commonErrors: [[2 * n, `That is the double alone; the third addend still has to join it.`],
                   [n + c, `That uses only one of the two equal groups from the double.`]] };
}
function TenPartnerNumeric(r) {
  let a = pick(r, 1, 9);
  if (a === 5) a = 4; // trap-collision guard: at a=5 the "repeats a" trap equals the answer 10-a
  return { form: "TensPartnersNumeric", prompt: `${a} + ? = 10. What makes ten with ${a}?`, answer: 10 - a,
    commonErrors: [[a, `That repeats the known addend; the two parts must total ten.`],
                   [10, `Ten is the whole, not the missing partner.`]] };
}
function MissingThirdNumeric(r, b) {
  const total = pick(r, band(b, 13, 15, 18), band(b, 16, 18, 19));
  return { form: "UnknownNumeric", prompt: `10 + ? = ${total}. What is the missing addend?`, answer: total - 10,
    commonErrors: [[total, `That is the whole total, not the part still missing after the ten.`],
                   [10, `That repeats the ten already made; the blank is what is left to add.`]] };
}

/* ---- MCQ mirrors: structural gates, >=4 options, correct stays at index 0 ---- */
function ChoosePairMcq(r) {
  let a = pick(r, 3, 8);
  if (a === 5) a = 4; // at a=5 the ten-partner b is also 5, collapsing two option labels
  const b = 10 - a;
  let c = pick(r, 2, 7);
  // Label-collision guard: if the third addend equals either pair member, two option labels
  // become textually identical. Nudge it clear of both.
  while (c === b || c === a) c = c < 7 ? c + 1 : 2;
  const opts = [
    { label: `${a} and ${b}`, correct: true, feedback: `Correct — ${a} and ${b} make exactly ten, which leaves an easy ten-plus-${c} to finish.` },
    { label: `${a} and ${c}`, correct: false, feedback: `This pair does not land on ten, so the last step stays awkward.` },
    { label: `${b} and ${c}`, correct: false, feedback: `This pair misses the ten that ${a} and ${b} would have made together.` },
    { label: `No pair helps here`, correct: false, feedback: `One pair does make ten; scanning for ten-partners first is the whole strategy.` },
  ];
  return { form: "MakeTenFirstMcq", prompt: `To add ${a} + ${b} + ${c}, which two should you group first?`, options: opts };
}
function AnyOrderMcq(r) {
  const a = pick(r, 2, 6), b = pick(r, 2, 6), c = pick(r, 2, 6), s = a + b + c;
  const opts = [
    { label: `${s} — the same total`, correct: true, feedback: `Correct — regrouping changes the order of the work, never the total, so it stays ${s}.` },
    { label: `${s + 1} — one more`, correct: false, feedback: `Regrouping moves no counter into the pile, so the total cannot grow past ${s}.` },
    { label: `${s - 1} — one less`, correct: false, feedback: `Regrouping takes no counter out of the pile, so the total cannot fall below ${s}.` },
    { label: `It depends which pair you group`, correct: false, feedback: `Every grouping of the same three addends reaches the identical total; only the ease changes.` },
  ];
  return { form: "EqualSignMcq", prompt: `${a} + ${b} + ${c} = ${s}. If you group a different pair first, what is the total?`, options: opts };
}
function StrategyPickMcq(r) {
  const kind = pick(r, 0, 2);
  if (kind === 0) {
    const a = pick(r, 3, 8), b = 10 - a, c = pick(r, 2, 7);
    const opts = [
      { label: `Make ten with ${a} and ${b} first`, correct: true, feedback: `Correct — a ten-partner pair is the fastest opening because ten-plus-something is easy to name.` },
      { label: `Add left to right, no matter what`, correct: false, feedback: `That works but ignores the ten sitting in plain sight, making the last step harder.` },
      { label: `Count all three from zero`, correct: false, feedback: `Counting everything from zero throws away the facts already known.` },
      { label: `Subtract the smallest addend`, correct: false, feedback: `Subtracting removes an amount; this problem joins all three.` },
    ];
    return { form: "MakeTenFirstMcq", prompt: `Which strategy fits ${a} + ${b} + ${c} best?`, options: opts };
  }
  if (kind === 1) {
    const n = pick(r, 3, 7), c = pick(r, 2, 6);
    const opts = [
      { label: `Use the double ${n} + ${n} first`, correct: true, feedback: `Correct — a known double is instant, so double first and then join the ${c}.` },
      { label: `Make ten first`, correct: false, feedback: `Scanning these addends finds no ten-partner pair, so the double is the faster anchor.` },
      { label: `Count on from ${c}`, correct: false, feedback: `Starting from the smallest addend means the most counting, not the least.` },
      { label: `Add the two largest last`, correct: false, feedback: `Saving the hardest pair for last does not use the double you already know.` },
    ];
    return { form: "MakeTenFirstMcq", prompt: `Which strategy fits ${n} + ${n} + ${c} best?`, options: opts };
  }
  const a = pick(r, 2, 4), b = pick(r, 2, 4), c = pick(r, 2, 4);
  const opts = [
    { label: `Any order — all three are small`, correct: true, feedback: `Correct — with three small addends no grouping is clearly faster, so any order is fine.` },
    { label: `Only left to right is allowed`, correct: false, feedback: `Addition permits any grouping; left-to-right is a habit, not a rule.` },
    { label: `Make ten first`, correct: false, feedback: `These addends are too small to reach ten as a pair, so there is no ten to make.` },
    { label: `Use a double`, correct: false, feedback: `A double only helps when two addends are equal, which is not guaranteed here.` },
  ];
  return { form: "MakeTenFirstMcq", prompt: `Which strategy fits ${a} + ${b} + ${c} best?`, options: opts };
}
function StoryMcq(r) {
  const a = pick(r, 2, 6), b = 10 - a > 6 ? pick(r, 2, 6) : 10 - a;
  let c = pick(r, 2, 6);
  // Label-collision guard: b === c makes "a + b" and "a + c" identical distractors.
  while (c === b) c = c < 6 ? c + 1 : 2;
  const s = a + b + c;
  const opts = [
    { label: `${a} + ${b} + ${c} = ${s}`, correct: true, feedback: `Correct — all three groups join, so all three addends belong in one addition.` },
    { label: `${a} + ${b} = ${a + b}`, correct: false, feedback: `This leaves the third group out; the story collects all three.` },
    { label: `${s} − ${c} = ${s - c}`, correct: false, feedback: `Subtracting removes a group, but the story joins them together.` },
    { label: `${a} + ${c} = ${a + c}`, correct: false, feedback: `This skips one of the three groups the story describes.` },
  ];
  return { form: "PartWholeMcq", prompt: `Maggie finds ${a} pinecones, then ${b} more, then ${c} more. Which equation matches?`, options: opts };
}
function PastTenMcq(r) {
  const a = pick(r, 4, 8), b = pick(r, 4, 8), c = pick(r, 3, 6), s = a + b + c;
  const opts = [
    { label: `Past ten — it reaches ${s}`, correct: true, feedback: `Correct — the three addends together pass ten, landing on ${s}.` },
    { label: `Exactly ten`, correct: false, feedback: `Adding all three goes beyond ten; ten is only a stepping stone here.` },
    { label: `Less than ten`, correct: false, feedback: `Three addends this size total more than ten, not less.` },
    { label: `You cannot tell without counting one at a time`, correct: false, feedback: `Grouping a ten first tells you quickly that the total must be past ten.` },
  ];
  return { form: "MakeTenFirstMcq", prompt: `Does ${a} + ${b} + ${c} land short of ten, on ten, or past ten?`, options: opts };
}

const REUSE = { PairSumNumeric, TenPlusRestNumeric, DoubleThenAddNumeric, TenPartnerNumeric,
  MissingThirdNumeric, ChoosePairMcq, AnyOrderMcq, StrategyPickMcq, StoryMcq, PastTenMcq };

function reused(mirror, seedStr, bandName, hints, ev,
                fallback = "Recompute the quantities and relationship shown, one step at a time.") {
  const r = mulberry32(seedFromString(seedStr));
  const out = REUSE[mirror](r, bandName);
  must(REGISTERED.has(out.form), `${mirror}: form ${out.form} is NOT a registered g1-add-subtract form`);
  if (out.options) {
    must(out.options.length >= 4, `${mirror} needs >=4 options`);
    must(out.options.filter((o) => o.correct).length === 1, `${mirror} mcq correct count`);
    must(out.options[0].correct === true, `${mirror} correct option must stay at index 0 (corpus convention)`);
    must(new Set(out.options.map((o) => o.label)).size === out.options.length, `${mirror} duplicate labels`);
    const withIds = out.options.map((o, i) => ({ id: `o${i}`, ...o }));
    for (const o of withIds) must(o.feedback.length >= 25, `${mirror} feedback too short`);
    must(new Set(withIds.map((o) => o.feedback)).size === withIds.length, `${mirror} feedback not distinct`);
    return { variant: { gen: "g1-add-subtract", form: out.form },
      widget: { type: "mcq", prompt: out.prompt, options: withIds }, hints, ev };
  }
  const commonErrors = out.commonErrors
    .filter(([v]) => v !== out.answer)
    .map(([value, feedback]) => { must(feedback.length >= 25, `${mirror} trap feedback short`); return { value, feedback }; });
  must(commonErrors.length >= 2, `${mirror} needs 2 live traps`);
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `${mirror} duplicate traps`);
  return { variant: { gen: "g1-add-subtract", form: out.form },
    widget: { type: "numeric", prompt: out.prompt, answer: out.answer, tolerance: 0, unit: "", commonErrors,
      fallbackFeedback: fallback, successFeedback: `Correct — the total is ${out.answer}.` },
    hints, ev };
}

/* ---- manipulatives ---- */
function hop(prompt, start, hops, direction, success, traps = []) {
  const sign = direction === "back" ? -1 : 1;
  const land = start + sign * hops;
  const pts = [start, land, ...traps.map((t) => t[0])];
  const min = Math.max(0, Math.min(...pts) - 2);
  const max = Math.min(99, Math.max(...pts) + 2);
  must(land >= min && land <= max, `hop bounds ${start}->${land}`);
  const commonLandings = traps.map(([value, feedback]) => {
    must(value !== land && value >= min && value <= max, `hop trap ${value}`);
    must(feedback.length >= 25, "hop trap feedback short");
    return { value, feedback };
  });
  return { type: "numberLineHop", prompt, min, max, start, hop: 1, hops, direction, commonLandings,
    missFeedback: `Start at ${start} and count ${direction === "back" ? "back" : "on"} ${hops}: you land on ${land}.`,
    successFeedback: success };
}
function frame10(prompt, target, preFilled, success, traps = []) {
  must(preFilled < target, `frame preFilled ${preFilled} < ${target}`);
  must(target <= 10, `frame target ${target} > 10`);
  const commonCounts = traps.map(([count, feedback]) => {
    must(count !== target, `frame trap ${count}`); must(feedback.length >= 25, "frame trap feedback short");
    return { count, feedback };
  });
  return { type: "tenFrame", prompt, target, preFilled, addColor: "tangerine", commonCounts,
    missFeedback: "Fill one square at a time, counting as you go.", successFeedback: success };
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`The manipulated model and the mathematical relationship for ${tag.replace(/-/g, " ")} must stay consistent.`],
  misconceptions: [`Changing a visible feature without preserving the relationship that defines ${tag.replace(/-/g, " ")}.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `add-three-numbers-g1:${tag}`, delayed: true,
  counterfactualPrompt: "What change would make the model stop representing the same mathematical relationship?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  three: ["Three groups all join into one total.", "Add two of them first.", "Then join the third."],
  ten: ["Look for two addends that make ten.", "Ten plus the rest is easy to name.", "The total never changes."],
  dbl: ["Look for two equal addends.", "Say the double you already know.", "Then join the third addend."],
  order: ["The addends can be grouped in any order.", "Grouping changes the work, not the total.", "Pick the easiest pair first."],
  miss: ["Find the part already made.", "Compare it with the total.", "The gap is the missing addend."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Three groups can join into one total. Add two of them first, then join the third — the answer is the same however you start.",
  "Adding three numbers is really two additions in a row. Finish the first pair before bringing in the third addend.",
  { rep: "diagram", widget: () => hop("Add 4 + 3 first, then join 2. Start at 7 and count on 2.", 7, 2, "forward", "Landed on 9 — 4 + 3 made 7, and joining 2 more reaches the total 9."),
    predict: P("Three groups join together. Is the total bigger or smaller than any one group?", [{ id: "big", label: "Bigger than any one" }, { id: "small", label: "Smaller than one" }], "big",
      "Joining groups only adds, so the total is at least as big as every group in it.") },
  [
    reused("PairSumNumeric", "g1t1-k1", "core", H.three, ["Adding three numbers is two additions in a row.", "Finish the first pair, then join the third."]),
    reused("PairSumNumeric", "g1t1-k2", "core", H.three, ["The first pair makes a part of the total.", "The third addend completes it."]),
    reused("StoryMcq", "g1t1-k3", "core", H.three, ["All three groups belong in one equation.", "Leaving one out loses part of the total."]),
    reused("DoubleThenAddNumeric", "g1t1-ch1", "stretch", H.three, ["A finished pair becomes one number to build on.", "Join the last addend to it."]),
  ],
  ["Three groups join into one total.", "Add a pair first.", "Then join the third addend."],
  "next: finding a ten inside three addends.");

def(2,
  "When two of the three addends make ten, group those two first. Ten plus the leftover is easy to name.",
  "Scanning for a ten-partner pair before adding is faster than working strictly left to right.",
  { rep: "diagram", widget: () => frame10("Two addends are 7 and 3. Fill the frame to see them make a whole ten.", 10, 7, "Ten filled — 7 and 3 are ten-partners, so they group first."),
    predict: P("Two of the addends are 7 and 3. What do they make together?", [{ id: "ten", label: "Exactly ten" }, { id: "nine", label: "Nine" }], "ten",
      "7 and 3 are ten-partners — together they complete a whole ten.") },
  [
    reused("TenPartnerNumeric", "g1t2-k1", "core", H.ten, ["Every number has a partner that completes ten.", "Spotting the partner pair comes first."]),
    reused("TenPlusRestNumeric", "g1t2-k2", "core", H.ten, ["Once ten is made, the rest simply rides on top.", "Ten-and-some is easy to name."]),
    reused("ChoosePairMcq", "g1t2-k3", "core", H.ten, ["Group the ten-partners before anything else.", "The leftover addend finishes the job."]),
    reused("MissingThirdNumeric", "g1t2-ch1", "stretch", H.ten, ["The ten is already built.", "The gap up to the total is what remains."]),
  ],
  ["Look for a ten-partner pair.", "Group those two first.", "Ten plus the rest is easy."],
  "next: using a double to start.");

def(3,
  "When two addends are equal, start with the double you already know, then join the third addend.",
  "Doubles are instant facts. Anchoring on one turns a three-addend problem into a single easy step.",
  { rep: "diagram", widget: () => hop("The double 4 + 4 lands on 8. Now join 3 more.", 8, 3, "forward", "Landed on 11 — the double gave 8 instantly, and joining 3 finished the total."),
    predict: P("Two addends are both 5. Which fact starts fastest?", [{ id: "dbl", label: "The double 5 + 5" }, { id: "count", label: "Counting from zero" }], "dbl",
      "A known double is instant; counting from zero re-does work you already know.") },
  [
    reused("DoubleThenAddNumeric", "g1t3-k1", "core", H.dbl, ["A double is a fact you already know by heart.", "Start there, then join the third."]),
    reused("DoubleThenAddNumeric", "g1t3-k2", "core", H.dbl, ["The double handles two addends at once.", "Only one addend is left to join."]),
    reused("StrategyPickMcq", "g1t3-k3", "core", H.dbl, ["Equal addends signal a double.", "Anchor on the fact you know fastest."]),
    reused("PairSumNumeric", "g1t3-ch1", "stretch", H.dbl, ["Any finished pair becomes one number.", "Join the remaining addend to it."]),
  ],
  ["Equal addends make a double.", "Start with the double.", "Then join the third addend."],
  "next: why any order works.");

def(4,
  "Three addends can be grouped in any order. Whichever pair you join first, the total is the same.",
  "This is why choosing a smart pair is safe: regrouping changes how hard the work is, never the answer.",
  { rep: "diagram", widget: () => hop("Group 2 + 6 first to get 8, then join 5.", 8, 5, "forward", "Landed on 13 — the same 13 you reach by grouping any other pair first."),
    predict: P("You group a different pair first. What happens to the total?", [{ id: "same", label: "It stays the same" }, { id: "changes", label: "It changes" }], "same",
      "The same three groups are joined either way, so the total cannot change.") },
  [
    reused("AnyOrderMcq", "g1t4-k1", "core", H.order, ["Regrouping never adds or removes a counter.", "Only the ease of the work changes."]),
    reused("PairSumNumeric", "g1t4-k2", "core", H.order, ["Each pair sum is a stepping stone.", "Every route reaches the same total."]),
    reused("AnyOrderMcq", "g1t4-k3", "core", H.order, ["Any grouping is allowed in addition.", "Pick the pair that is easiest."]),
    reused("TenPlusRestNumeric", "g1t4-ch1", "stretch", H.order, ["A ten-first grouping is usually easiest.", "The total is unchanged either way."]),
  ],
  ["Any grouping is allowed.", "The total never changes.", "Choose the easiest pair."],
  "next: choosing the smartest grouping.");

def(5,
  "Since any grouping works, choose deliberately: a ten-partner pair if one exists, otherwise a double, otherwise simply left to right.",
  "Reading the three addends before starting is what separates fast adding from slow counting.",
  { rep: "diagram", widget: () => frame10("The addends include 6 and 4. Fill the frame to confirm they make ten.", 10, 6, "Ten filled — 6 and 4 are the pair worth grouping first."),
    predict: P("Which pair should you look for FIRST in three addends?", [{ id: "ten", label: "A pair making ten" }, { id: "biggest", label: "The two biggest" }], "ten",
      "A ten-partner pair makes the remaining step trivial, so it is worth finding first.") },
  [
    reused("ChoosePairMcq", "g1t5-k1", "core", H.ten, ["Scan for ten-partners before adding.", "That choice makes the last step trivial."]),
    reused("StrategyPickMcq", "g1t5-k2", "core", H.order, ["Ten first, then doubles, then left to right.", "The numbers tell you which fits."]),
    reused("TenPlusRestNumeric", "g1t5-k3", "core", H.ten, ["A made ten leaves an easy finish.", "Ten-and-some names itself."]),
    reused("StrategyPickMcq", "g1t5-ch1", "stretch", H.order, ["Every strategy reaches the same total.", "Some simply take fewer steps."]),
  ],
  ["Read the addends before adding.", "Ten-partners first, then doubles.", "Otherwise left to right is fine."],
  "next: three-addend stories.");

def(6,
  "A story with three collections becomes a three-addend equation. Every collection mentioned belongs in the total.",
  "Write the equation first, then choose the easiest grouping to finish it.",
  { rep: "diagram", widget: () => hop("Maggie collects 3, then 7, then 4. Group 3 + 7 to make ten, then join 4.", 10, 4, "forward", "Landed on 14 — the ten-partner pair made the story easy to finish."),
    predict: P("A story mentions three collections. How many addends does the equation need?", [{ id: "three", label: "Three" }, { id: "two", label: "Two" }], "three",
      "Every collection joins the total, so all three appear as addends.") },
  [
    reused("StoryMcq", "g1t6-k1", "core", H.three, ["Every group in the story is an addend.", "Leaving one out loses part of the total."]),
    reused("PairSumNumeric", "g1t6-k2", "core", H.three, ["Finish one pair from the story first.", "Then join the remaining group."]),
    reused("StoryMcq", "g1t6-k3", "core", H.three, ["Joining stories use addition, not subtraction.", "All three groups combine."]),
    reused("MissingThirdNumeric", "g1t6-ch1", "stretch", H.miss, ["Part of the story total is already built.", "The gap is what is still missing."]),
  ],
  ["Every collection is an addend.", "Write the equation first.", "Then group the easiest pair."],
  "next: picking the pair yourself.");

def(7,
  "Given three addends, decide for yourself which two to join first — and be able to say why that pair was the best choice.",
  "The best pair is the one that lands on a friendly number: ten if possible, otherwise a known double.",
  { rep: "diagram", widget: () => frame10("You chose 8 and 2 as your pair. Fill the frame to check they make ten.", 10, 8, "Ten filled — 8 and 2 were the right pair to group first."),
    predict: P("Which pair is the best first choice: one making ten, or two random addends?", [{ id: "ten", label: "The pair making ten" }, { id: "any", label: "Any two at random" }], "ten",
      "A ten-partner pair leaves a ten-plus-something step, which is the easiest possible finish.") },
  [
    reused("ChoosePairMcq", "g1t7-k1", "core", H.ten, ["The best pair lands on a friendly number.", "Ten is the friendliest of all."]),
    reused("ChoosePairMcq", "g1t7-k2", "core", H.ten, ["Explain the choice, not just the answer.", "A ten-partner pair justifies itself."]),
    reused("TenPartnerNumeric", "g1t7-k3", "core", H.ten, ["Knowing ten-partners makes the scan instant.", "Each number has exactly one partner."]),
    reused("DoubleThenAddNumeric", "g1t7-ch1", "stretch", H.dbl, ["When no ten exists, a double is next best.", "Anchor on the fact you know."]),
  ],
  ["Choose the pair deliberately.", "Ten-partners are the best first choice.", "Be able to say why."],
  "next: totals that pass ten.");

def(8,
  "Three addends often total more than ten. Making the ten first turns the answer into ten-and-some, which is easy to name.",
  "Passing ten is not a problem to avoid — the ten is the stepping stone that makes the total readable.",
  { rep: "diagram", widget: () => hop("The pair made ten. Now join the last addend, 6.", 10, 6, "forward", "Landed on 16 — ten-and-six names itself once the ten is built."),
    predict: P("Three addends of 5, 5, and 6: will the total pass ten?", [{ id: "past", label: "Yes, past ten" }, { id: "under", label: "No, under ten" }], "past",
      "Two fives already reach ten, and the six pushes the total well past it.") },
  [
    reused("TenPlusRestNumeric", "g1t8-k1", "core", H.ten, ["Ten-and-some is the easiest form to read.", "Build the ten, then add the rest."]),
    reused("PastTenMcq", "g1t8-k2", "core", H.ten, ["Grouping a ten reveals the size of the total fast.", "No one-by-one counting needed."]),
    reused("DoubleThenAddNumeric", "g1t8-k3", "core", H.dbl, ["A double can also carry you past ten.", "Then join the third addend."]),
    reused("TenPlusRestNumeric", "g1t8-ch1", "stretch", H.ten, ["Larger leftovers work the same way.", "Ten plus the leftover is the total."]),
  ],
  ["Three addends often pass ten.", "Build the ten first.", "Ten-and-some is easy to name."],
  "next: finding a missing addend.");

def(9,
  "Sometimes the total is known and one addend is hidden. Build what you can, then find the gap up to the total.",
  "The gap between the part already made and the total is exactly the missing addend.",
  { rep: "diagram", widget: () => hop("A ten is already made and the total is 15. Count on from 10 to reach 15.", 10, 5, "forward", "Landed on 15 — the five hops are exactly the missing addend.",
      [[14, "That stops one short of the total; keep going until you reach it."]]),
    predict: P("A ten is built and the total is 15. Is the missing addend bigger or smaller than 15?", [{ id: "smaller", label: "Smaller — it is only a part" }, { id: "bigger", label: "Bigger" }], "smaller",
      "A part can never exceed its own total, so the missing addend fits inside 15.") },
  [
    reused("MissingThirdNumeric", "g1t9-k1", "core", H.miss, ["Build the part you can first.", "The gap up to the total is the missing addend."]),
    reused("MissingThirdNumeric", "g1t9-k2", "core", H.miss, ["A part is always smaller than the total.", "Check by adding it back."]),
    reused("TenPartnerNumeric", "g1t9-k3", "core", H.ten, ["Ten-partners find missing parts fast.", "Every number has exactly one."]),
    reused("MissingThirdNumeric", "g1t9-ch1", "stretch", H.miss, ["Larger totals work identically.", "Total minus the built part is the gap."]),
  ],
  ["Build the part you can.", "The gap to the total is the missing addend.", "Add it back to check."],
  "next: adding three, your way.");

def(10,
  "You now have three tools for three addends: make a ten, use a double, or just add in order. Read the numbers, pick a tool, and say why.",
  "A strategy is valid when it protects the total. All three tools do — they differ only in how much work they save.",
  { rep: "diagram", widget: () => hop("Your chosen pair made 9. Join the last addend, 4.", 9, 4, "forward", "Landed on 13 — your grouping reached the same total any other route would."),
    predict: P("A strategy changes HOW you group. What must it never change?", [{ id: "total", label: "The total" }, { id: "order", label: "The order" }], "total",
      "A grouping strategy is only valid if the total survives it; the route may vary freely.") },
  [
    reused("StrategyPickMcq", "g1t10-k1", "core", H.order, ["Read the addends, then pick a tool.", "Every valid tool protects the total."]),
    reused("AnyOrderMcq", "g1t10-k2", "core", H.order, ["Regrouping cannot change the answer.", "That is what makes choosing safe."]),
    reused("StrategyPickMcq", "g1t10-k3", "core", H.order, ["Ten-partners, doubles, or plain order.", "The numbers decide which is fastest."]),
    reused("DoubleThenAddNumeric", "g1t10-ch1", "stretch", H.dbl, ["A finished pair is one number.", "Join the last addend to reach the total."]),
  ],
  ["Three tools: ten, double, or in order.", "The numbers tell you which fits.", "Every valid strategy protects the total."],
  "course complete: adding three numbers with confidence.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 10, `10 lessons defined, got ${L.length}`);
const chapterTitles = ["Joining Three Groups", "Smart Grouping", "Choose Your Way"];
const perChapter = [4, 3, 3];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 7 ? 2 : 3);
const outDir = join(root, "content/courses/add-three-numbers-g1");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g1t-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => ({
    id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
    explanationVariants: c.ev, widget: c.widget, hints: c.hints, variant: c.variant, cml: cml(tag, "diagram"),
  });

  const lesson = {
    id, slug, title: row.title, courseId: "add-three-numbers-g1",
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
    if (w.type === "numeric") for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} trap==answer`);
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 4, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
    }
    if (w.type === "tenFrame") must(w.preFilled < w.target, `${id}/${s.id} frame prefill`);
    if (w.type === "numberLineHop") {
      const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
      must(land >= w.min && land <= w.max, `${id}/${s.id} hop land outside range`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) {
      must(s.variant.gen === "g1-add-subtract", `${id}/${s.id} unexpected gen`);
      must(REGISTERED.has(s.variant.form), `${id}/${s.id} form ${s.variant.form} not registered`);
    }
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "add-three-numbers-g1", slug: "add-three-numbers-g1", title: spec.title,
  tagline: "Group a ten, lean on a double, or add in order — three addends, your way.",
  category: "Math", gradeLevel: 1, chapters,
}, null, 2) + "\n");
console.log(`built 10 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
