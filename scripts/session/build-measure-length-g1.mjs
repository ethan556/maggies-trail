#!/usr/bin/env node
// S192 — PROTOCOL v3, Batch B course 2/3: measure-length-g1 (1.MD.A.1, 1.MD.A.2).
//
// FIT-CHECK RESULT — again deviates from HANDOVER's Batch B table ("g1-shapes-measure has
// LengthDifference only — needs iteration/unit-size forms"). Two findings at build time:
//   1. The graded numerics this standard needs ARE length differences. Smg1LengthDifferenceNumeric
//      (route: n[0]-n[1]) covers comparison, ordering, indirect comparison and transitivity —
//      that is the whole of 1.MD.A.1.
//   2. The iteration content of 1.MD.A.2 (lay units end to end, no gaps or overlaps, unit size
//      changes the count) does not want a numeric generator at all: `unitRuler` and
//      `lengthCompare` are shipped MANIPULATIVES that already encode exactly those rules —
//      align zero, requiredPlacements, gapOverlapFeedback, allowedUnitSizes. Authoring the
//      iteration as a manipulative is both a better experience and zero new generator code.
// MCQ reasoning checks carry no variant declaration: g1-shapes-measure registers no length MCQ
// form, and declaring a topically-unrelated one (2D/3D, halves) would refresh a learner into an
// off-topic question. 217 graded checks in the existing corpus already omit `variant`, so this is
// an established pattern, not a workaround.
// Net: ZERO new generator code; zero edits to variants.ts / g1Variants.ts / g1Independent.cjs.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "measure-length-g1");
if (!spec || spec.lessons.length !== 10) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

// Registered g1-shapes-measure forms (read from VARIANT_GENERATORS at fit-check time). S191
// lesson: solvePrompt has a permissive fallback, so membership must be asserted explicitly.
const REGISTERED = new Set([
  "Smg12D3DMcq","Smg12D3DNumeric","Smg1HalvesFractionBar","Smg1FourthsFractionBar",
  "Smg1HalvesNumeric","Smg1FourthsNumeric","Smg1HalvesMcq","Smg1FourthsMcq",
  "Smg1HalvesFourthsNumeric","Smg1HalvesFourthsMcq","Smg1LengthDifferenceNumeric",
  "Smg1ShapeSidesNumeric","Smg1ShapeSidesMcq","Smg1SolidPartsNumeric","Smg1SolidPartsMcq",
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

/* ---- numeric mirror: parses under the REGISTERED Smg1LengthDifferenceNumeric route (n[0]-n[1]) ---- */
const OBJECTS = [
  ["ribbon", "pencil"], ["rope", "straw"], ["scarf", "crayon"],
  ["branch", "leaf"], ["ladder", "brush"], ["path", "stick"],
];
function LengthDifferenceNumeric(r, b, unit = "cubes") {
  const [longName, shortName] = OBJECTS[pick(r, 0, OBJECTS.length - 1)];
  const longLen = pick(r, band(b, 6, 9, 14), band(b, 9, 13, 18));
  const shortLen = pick(r, 2, longLen - 2);
  const answer = longLen - shortLen;
  // Trap-collision guard: either trap can coincide with the answer for particular draws.
  const traps = [];
  if (longLen !== answer) traps.push([longLen, `That is the whole length of the ${longName}, not the extra it has beyond the ${shortName}.`]);
  if (shortLen !== answer) traps.push([shortLen, `That is the length of the ${shortName}, not the difference between the two.`]);
  if (traps.length < 2 && longLen + shortLen !== answer) traps.push([longLen + shortLen, `That joins the two lengths; comparing asks how much longer one is.`]);
  must(traps.length >= 2, `LengthDifferenceNumeric: could not build 2 live traps`);
  return {
    form: "Smg1LengthDifferenceNumeric",
    prompt: `The ${longName} is ${longLen} ${unit} long and the ${shortName} is ${shortLen} ${unit} long. How many ${unit} longer is the ${longName}?`,
    answer, commonErrors: traps.slice(0, 2),
  };
}

/* ---- MCQ mirrors: reasoning checks, no variant (no registered length MCQ form) ---- */
function FairCompareMcq(r) {
  const off = pick(r, 2, 4);
  const opts = [
    { label: `Line up one end of both first`, correct: true, feedback: `Correct — a fair comparison starts both objects from the same place, then the far ends decide.` },
    { label: `Compare the far ends as they lie`, correct: false, feedback: `With one object shifted ${off} units forward, the far ends alone can make the shorter one look longer.` },
    { label: `Pick whichever looks bigger`, correct: false, feedback: `Appearance is exactly what a shifted starting point distorts; align first, then judge.` },
    { label: `Count the gap between them`, correct: false, feedback: `The space between two objects describes their positions, not either object's length.` },
  ];
  return { prompt: `Two ribbons lie side by side but one starts ${off} units further along. What must you do before deciding which is longer?`, options: opts };
}
function IndirectMcq(r) {
  const a = pick(r, 7, 12), c = pick(r, 2, 5), b = a - c;
  const opts = [
    { label: `The first is longer than the third`, correct: true, feedback: `Correct — if the first beats the string and the string beats the third, the first must beat the third.` },
    { label: `The third is longer than the first`, correct: false, feedback: `That reverses the chain; each comparison points the same direction, so it cannot flip.` },
    { label: `They are exactly equal`, correct: false, feedback: `Both comparisons were strict, so the two objects cannot come out equal.` },
    { label: `You must lay them side by side to know`, correct: false, feedback: `A third object can settle it without moving either one — that is the point of indirect comparison.` },
  ];
  return { prompt: `A pole is longer than a string (${a} vs ${b} units), and the string is longer than a rod (${b} vs ${a - c - 1} units). What follows?`, options: opts };
}
function NoGapsMcq(r) {
  const n = pick(r, 4, 7);
  const opts = [
    { label: `The count is wrong — gaps hide length`, correct: true, feedback: `Correct — every gap leaves length uncounted, so the measurement comes out too small.` },
    { label: `The count is fine either way`, correct: false, feedback: `Units must cover the object completely; uncovered stretches are simply never counted.` },
    { label: `Gaps make the count too large`, correct: false, feedback: `Gaps mean fewer units are used, so the count comes out too small rather than too large.` },
    { label: `Only overlaps matter, not gaps`, correct: false, feedback: `Both spoil a measurement: overlaps count length twice and gaps miss length entirely.` },
  ];
  return { prompt: `A child lays ${n} cubes along a stick but leaves small spaces between them. What is true of the count?`, options: opts };
}
function UnitSizeMcq(r) {
  const small = pick(r, 8, 12), big = Math.floor(small / 2);
  const opts = [
    { label: `Fewer big units than small units`, correct: true, feedback: `Correct — bigger units cover more length each, so it takes fewer of them for the same object.` },
    { label: `More big units than small units`, correct: false, feedback: `A longer unit covers more ground per placement, so the count must go down, not up.` },
    { label: `Exactly the same number`, correct: false, feedback: `The count only stays the same if the unit stays the same size.` },
    { label: `The object changed length`, correct: false, feedback: `The object never changed; only the size of the measuring unit did.` },
  ];
  return { prompt: `A stick measures ${small} small cubes. Measured with units twice as long, will the count be more or fewer?`, options: opts };
}
function CountUnitsMcq(r) {
  const n = pick(r, 5, 9);
  const opts = [
    { label: `${n}`, correct: true, feedback: `Correct — the length is the number of same-size units that cover it end to end, which is ${n}.` },
    { label: `${n + 1}`, correct: false, feedback: `That counts one unit more than were actually placed along the object.` },
    { label: `${n - 1}`, correct: false, feedback: `That misses one of the units that helped cover the object.` },
    { label: `${n * 2}`, correct: false, feedback: `That doubles the count, as if each unit were counted twice over.` },
  ];
  return { prompt: `Exactly ${n} same-size cubes cover a ribbon with no gaps and no overlaps. How long is the ribbon in cubes?`, options: opts };
}

const REUSE = { LengthDifferenceNumeric, FairCompareMcq, IndirectMcq, NoGapsMcq, UnitSizeMcq, CountUnitsMcq };

function reused(mirror, seedStr, bandName, hints, ev,
                fallback = "Re-read the two lengths given, then compare them one step at a time.") {
  const r = mulberry32(seedFromString(seedStr));
  const out = REUSE[mirror](r, bandName);
  if (out.options) {
    must(out.options.length >= 4, `${mirror} needs >=4 options`);
    must(out.options.filter((o) => o.correct).length === 1, `${mirror} mcq correct count`);
    must(out.options[0].correct === true, `${mirror} correct option must stay at index 0 (corpus convention)`);
    must(new Set(out.options.map((o) => o.label)).size === out.options.length, `${mirror} duplicate labels`);
    const withIds = out.options.map((o, i) => ({ id: `o${i}`, ...o }));
    for (const o of withIds) must(o.feedback.length >= 25, `${mirror} feedback too short`);
    must(new Set(withIds.map((o) => o.feedback)).size === withIds.length, `${mirror} feedback not distinct`);
    // No variant: g1-shapes-measure registers no length MCQ form, and declaring an unrelated
    // one would refresh the learner into an off-topic question.
    return { widget: { type: "mcq", prompt: out.prompt, options: withIds }, hints, ev };
  }
  must(REGISTERED.has(out.form), `${mirror}: form ${out.form} is NOT a registered g1-shapes-measure form`);
  const commonErrors = out.commonErrors
    .filter(([v]) => v !== out.answer)
    .map(([value, feedback]) => { must(feedback.length >= 25, `${mirror} trap feedback short`); return { value, feedback }; });
  must(commonErrors.length >= 2, `${mirror} needs 2 live traps`);
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `${mirror} duplicate traps`);
  return { variant: { gen: "g1-shapes-measure", form: out.form },
    widget: { type: "numeric", prompt: out.prompt, answer: out.answer, tolerance: 0, unit: "", commonErrors,
      fallbackFeedback: fallback, successFeedback: `Correct — the difference is ${out.answer}.` },
    hints, ev };
}

/* ---- manipulatives: the shipped widgets that already encode 1.MD.A.2 ---- */
function lengthCompare(prompt, topLen, bottomLen, startOffset, answerId, success) {
  must(topLen !== bottomLen, "lengthCompare needs unequal lengths");
  must((answerId === "top") === (topLen > bottomLen), "lengthCompare answerId must be the longer item");
  return { type: "lengthCompare", mode: "align", prompt,
    items: [{ id: "top", label: "top ribbon", length: topLen, startOffset },
            { id: "bottom", label: "bottom ribbon", length: bottomLen }],
    answerId,
    unalignedFeedback: "Looks can trick you — line the starting ends up first.",
    missFeedback: "Now the starts are lined up — check the far ends again: the one reaching farther is longer.",
    successFeedback: success };
}
function unitRuler(prompt, objectStart, objectEnd, targetUnitSize, startUnitSize, success) {
  const span = objectEnd - objectStart;
  must(span > 0, "unitRuler needs a positive span");
  must(span % targetUnitSize === 0, `unitRuler span ${span} not divisible by unit ${targetUnitSize}`);
  must(targetUnitSize !== startUnitSize, "unitRuler start unit must differ from target so the choice matters");
  return { type: "unitRuler", prompt, objectStart, objectEnd,
    allowedUnitSizes: [targetUnitSize, startUnitSize].sort((a, b) => a - b),
    targetUnitSize, startUnitSize, requiredPlacements: span / targetUnitSize,
    successFeedback: success,
    alignFeedback: "Line up zero with the object's starting end before measuring.",
    gapOverlapFeedback: "The blocks must touch end to end — no spaces and no covering the same part twice.",
    unitFeedback: "Every block must be the same size, or the count means nothing." };
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition", // iterating equal units composes the total length; "measure-iteration" is NOT in the schema enum
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`The manipulated model and the measurement relationship for ${tag.replace(/-/g, " ")} must stay consistent.`],
  misconceptions: [`Reading a length from appearance or position instead of from same-size units laid end to end.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `measure-length-g1:${tag}`, delayed: true,
  counterfactualPrompt: "What change would make the model stop representing the same measurement?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  fair: ["A fair compare needs a common starting line.", "Line up one end of both objects.", "Then the far ends decide."],
  order: ["Compare two at a time.", "Keep the winner and compare again.", "Order them from shortest to longest."],
  ind: ["A third object can carry the comparison.", "If A beats B and B beats C, A beats C.", "No moving required."],
  iter: ["Units go end to end.", "No gaps and no overlaps.", "The count is the length."],
  unit: ["Every unit must be the same size.", "Bigger units cover more each.", "So bigger units give a smaller count."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "To compare two lengths fairly, start them from the same line. Then whichever reaches farther is longer.",
  "Without a common starting line, a shorter object pushed forward can look longer than it is.",
  { rep: "diagram", widget: () => lengthCompare("Make the compare fair, then tap the longer ribbon.", 5, 7, 3, "bottom", "Same start makes the compare fair — the bottom ribbon really does reach farther."),
    predict: P("One ribbon starts further along than the other. Can you trust the far ends alone?", [{ id: "no", label: "No — align them first" }, { id: "yes", label: "Yes — just look" }], "no",
      "A shifted start can make the shorter ribbon reach farther, so aligning comes first.") },
  [
    reused("FairCompareMcq", "g1m1-k1", "core", H.fair, ["A fair compare needs a common start.", "Position is not length."]),
    reused("LengthDifferenceNumeric", "g1m1-k2", "core", H.fair, ["The difference is how much one exceeds the other.", "Subtract the shorter from the longer."]),
    reused("FairCompareMcq", "g1m1-k3", "core", H.fair, ["Align first, then judge the far ends.", "Appearance alone can mislead."]),
    reused("LengthDifferenceNumeric", "g1m1-ch1", "stretch", H.fair, ["Longer minus shorter gives the extra.", "The extra is what 'how much longer' means."]),
  ],
  ["Line up one end first.", "Then the far end decides.", "Position is not length."],
  "next: putting three objects in order.");

def(2,
  "Three objects can be put in order by comparing them two at a time: find the longest, then order the rest.",
  "Ordering is repeated comparing. Each pairwise result narrows the arrangement until only one order fits.",
  { rep: "diagram", widget: () => lengthCompare("Compare this pair fairly, then tap the longer one.", 8, 6, 2, "top", "The top ribbon reaches farther once both start together — it takes the higher place in the order."),
    predict: P("To order three objects, how many at a time do you compare?", [{ id: "two", label: "Two at a time" }, { id: "three", label: "All three at once" }], "two",
      "Comparing pairs is what the eye and the ruler can actually do; the order builds up from those results.") },
  [
    reused("LengthDifferenceNumeric", "g1m2-k1", "core", H.order, ["Each comparison gives one difference.", "Repeat to build the full order."]),
    reused("FairCompareMcq", "g1m2-k2", "core", H.order, ["Every pairwise compare needs a fair start.", "Unfair compares corrupt the order."]),
    reused("LengthDifferenceNumeric", "g1m2-k3", "core", H.order, ["Longer minus shorter is the gap.", "The bigger gap sits further apart in the order."]),
    reused("LengthDifferenceNumeric", "g1m2-ch1", "stretch", H.order, ["Ordering is repeated comparing.", "Two at a time, until one order fits."]),
  ],
  ["Compare two at a time.", "Repeat to build the order.", "Shortest to longest."],
  "next: comparing without moving anything.");

def(3,
  "Sometimes two objects cannot be moved together. A third object can carry the comparison between them.",
  "If the pole beats the string and the string beats the rod, then the pole beats the rod — without ever laying them side by side.",
  { rep: "diagram", widget: () => lengthCompare("Use this string as the go-between: compare it fairly with the pole.", 9, 6, 2, "top", "The pole beats the string — half of the chain that will settle the pole against the rod."),
    predict: P("Two objects cannot be moved. Can a third object still settle which is longer?", [{ id: "yes", label: "Yes — compare each to it" }, { id: "no", label: "No — they must touch" }], "yes",
      "Each object is compared to the same go-between, and those two results settle the pair.") },
  [
    reused("IndirectMcq", "g1m3-k1", "core", H.ind, ["A go-between carries the comparison.", "Each object is compared to the same third thing."]),
    reused("LengthDifferenceNumeric", "g1m3-k2", "core", H.ind, ["Each comparison yields a difference.", "The chain of results settles the pair."]),
    reused("IndirectMcq", "g1m3-k3", "core", H.ind, ["Both links point the same way.", "So the conclusion cannot reverse."]),
    reused("LengthDifferenceNumeric", "g1m3-ch1", "stretch", H.ind, ["Differences add along the chain.", "The end pair differs by the most."]),
  ],
  ["A third object can compare two.", "Compare each to the same go-between.", "The results settle the pair."],
  "next: why the chain always holds.");

def(4,
  "If A is longer than B, and B is longer than C, then A must be longer than C. The chain never breaks.",
  "This is why a go-between works at all: length comparisons pass along the chain in one direction.",
  { rep: "diagram", widget: () => lengthCompare("Second link of the chain: compare the string with the rod.", 6, 4, 2, "top", "The string beats the rod — with the first link, the pole must beat the rod too."),
    predict: P("A beats B and B beats C. Could C still beat A?", [{ id: "no", label: "No — the chain holds" }, { id: "maybe", label: "Maybe — it depends" }], "no",
      "Both links point the same direction, so the conclusion cannot turn around.") },
  [
    reused("IndirectMcq", "g1m4-k1", "core", H.ind, ["The chain points one direction.", "It cannot reverse at the end."]),
    reused("IndirectMcq", "g1m4-k2", "core", H.ind, ["Each link is a strict comparison.", "So equality is ruled out too."]),
    reused("LengthDifferenceNumeric", "g1m4-k3", "core", H.ind, ["Differences accumulate along a chain.", "The ends differ by the most."]),
    reused("LengthDifferenceNumeric", "g1m4-ch1", "stretch", H.ind, ["The far ends of a chain differ most.", "Add the links to see why."]),
  ],
  ["A beats B, B beats C, so A beats C.", "The chain never reverses.", "That is why go-betweens work."],
  "next: measuring by laying units end to end.");

def(5,
  "To measure with units, lay same-size units end to end along the object, starting at its edge. The number of units is the length.",
  "Measuring is covering: the units must start where the object starts and continue to where it ends.",
  { rep: "diagram", widget: () => unitRuler("Measure the ribbon. Align zero with its start, choose one-unit blocks, and place four with no gaps or overlaps.", 2, 6, 1, 2, "Four equal one-unit blocks cover the ribbon exactly — same start, no gaps, no overlaps."),
    predict: P("Where must the first unit begin?", [{ id: "edge", label: "At the object's starting edge" }, { id: "any", label: "Anywhere along it" }], "edge",
      "Starting anywhere else measures only part of the object, so the count comes out wrong.") },
  [
    reused("CountUnitsMcq", "g1m5-k1", "core", H.iter, ["The count of covering units is the length.", "Units must be the same size."]),
    reused("LengthDifferenceNumeric", "g1m5-k2", "core", H.iter, ["Two measured lengths can be compared directly.", "Subtract to find the extra."]),
    reused("CountUnitsMcq", "g1m5-k3", "core", H.iter, ["Cover the object completely.", "Then count the units used."]),
    reused("LengthDifferenceNumeric", "g1m5-ch1", "stretch", H.iter, ["Measuring turns lengths into numbers.", "Numbers compare exactly."]),
  ],
  ["Start at the object's edge.", "Lay same-size units end to end.", "The count is the length."],
  "next: no gaps and no overlaps.");

def(6,
  "Units must touch exactly: no gaps and no overlaps. A gap leaves length uncounted; an overlap counts the same length twice.",
  "This is the rule that makes a count trustworthy. Break it and the number no longer describes the object.",
  { rep: "diagram", widget: () => unitRuler("Measure this rope with one-unit blocks — six of them, touching end to end.", 1, 7, 1, 2, "Six blocks touch exactly end to end, so the count of six is a true measurement."),
    predict: P("A child leaves small gaps between units. Will the count be too big or too small?", [{ id: "small", label: "Too small" }, { id: "big", label: "Too big" }], "small",
      "Gaps mean fewer units are needed to reach the end, so the count comes out under the true length.") },
  [
    reused("NoGapsMcq", "g1m6-k1", "core", H.iter, ["Gaps leave length uncounted.", "Overlaps count length twice."]),
    reused("CountUnitsMcq", "g1m6-k2", "core", H.iter, ["Only a complete cover gives a true count.", "Units must touch exactly."]),
    reused("NoGapsMcq", "g1m6-k3", "core", H.iter, ["Both gaps and overlaps spoil a measurement.", "They fail in opposite directions."]),
    reused("LengthDifferenceNumeric", "g1m6-ch1", "stretch", H.iter, ["Trustworthy counts can be compared.", "Untrustworthy ones cannot."]),
  ],
  ["No gaps, no overlaps.", "Gaps undercount; overlaps overcount.", "Exact touching makes the count true."],
  "next: counting the units.");

def(7,
  "Once the object is covered, the length is simply the number of units used. Count them carefully, one per placement.",
  "The count is a description of the object: it says how many of that unit fit along it.",
  { rep: "diagram", widget: () => unitRuler("Cover this branch with one-unit blocks and count them as you go.", 0, 5, 1, 2, "Five blocks cover the branch — so the branch is five units long."),
    predict: P("Five same-size units exactly cover an object. How long is it?", [{ id: "five", label: "Five units" }, { id: "one", label: "One unit" }], "five",
      "Length in units is the number of units it takes to cover the object — here, five.") },
  [
    reused("CountUnitsMcq", "g1m7-k1", "core", H.iter, ["One count per placement.", "The total is the length."]),
    reused("CountUnitsMcq", "g1m7-k2", "core", H.iter, ["The count describes the object.", "It says how many units fit."]),
    reused("LengthDifferenceNumeric", "g1m7-k3", "core", H.iter, ["Counts turn lengths into comparable numbers.", "Subtract to compare exactly."]),
    reused("LengthDifferenceNumeric", "g1m7-ch1", "stretch", H.iter, ["Two counts can be compared directly.", "The difference is the extra length."]),
  ],
  ["Count one per unit placed.", "The total is the length.", "Counts make lengths comparable."],
  "next: measuring with cubes.");

def(8,
  "Cubes make good units because they are all the same size and stack end to end without gaps.",
  "Any object can serve as a unit if every copy is identical — that sameness is what makes counting meaningful.",
  { rep: "diagram", widget: () => unitRuler("Measure the scarf with one-unit cubes — eight, touching end to end.", 0, 8, 1, 2, "Eight identical cubes cover the scarf exactly, so the scarf is eight cubes long."),
    predict: P("Why do cubes work well as measuring units?", [{ id: "same", label: "They are all the same size" }, { id: "color", label: "They are colorful" }], "same",
      "Identical size is the whole requirement; color and material make no difference to a count.") },
  [
    reused("CountUnitsMcq", "g1m8-k1", "core", H.unit, ["Units must be identical to each other.", "Then the count is meaningful."]),
    reused("LengthDifferenceNumeric", "g1m8-k2", "core", H.unit, ["Same-unit measurements compare directly.", "Subtract for the difference."]),
    reused("NoGapsMcq", "g1m8-k3", "core", H.iter, ["Cubes touch cleanly end to end.", "That makes gaps easy to avoid."]),
    reused("LengthDifferenceNumeric", "g1m8-ch1", "stretch", H.unit, ["Cube counts behave like numbers.", "They add and subtract normally."]),
  ],
  ["Cubes are identical units.", "Identical size makes counting meaningful.", "They touch cleanly end to end."],
  "next: measuring with paper clips.");

def(9,
  "Paper clips work as units too, as long as every clip is the same size. The unit does not have to be a cube.",
  "Different units give different counts for the same object — and both counts are correct, because each names its own unit.",
  { rep: "diagram", widget: () => unitRuler("Measure the path with two-unit clips this time — three of them, end to end.", 0, 6, 2, 1, "Three two-unit clips cover the path exactly, so the path is three clips long."),
    predict: P("The same ribbon is measured in cubes and in longer clips. Will the counts match?", [{ id: "diff", label: "No — different counts" }, { id: "same", label: "Yes — identical" }], "diff",
      "Longer units cover more each, so the same ribbon needs fewer of them.") },
  [
    reused("UnitSizeMcq", "g1m9-k1", "core", H.unit, ["Bigger units cover more length each.", "So the count comes out smaller."]),
    reused("CountUnitsMcq", "g1m9-k2", "core", H.unit, ["Each count names its own unit.", "Both can be correct at once."]),
    reused("LengthDifferenceNumeric", "g1m9-k3", "core", H.unit, ["Compare only counts made in the same unit.", "Otherwise the difference means nothing."]),
    reused("UnitSizeMcq", "g1m9-ch1", "stretch", H.unit, ["The object never changes.", "Only the measuring unit does."]),
  ],
  ["Any identical object can be a unit.", "Different units give different counts.", "Each count names its own unit."],
  "next: same object, different units.");

def(10,
  "Measure one object with two different units and the counts differ — the bigger the unit, the smaller the count.",
  "The object never changed. Only the unit did. That is why a measurement must always say which unit it used.",
  { rep: "diagram", widget: () => unitRuler("Measure this rope with two-unit blocks — four of them cover it.", 0, 8, 2, 1, "Four two-unit blocks cover the same rope that took eight one-unit blocks: bigger unit, smaller count."),
    predict: P("Switching to units twice as long, what happens to the count?", [{ id: "half", label: "It gets smaller" }, { id: "double", label: "It gets bigger" }], "half",
      "Each unit now covers twice as much, so it takes fewer of them to cover the same object.") },
  [
    reused("UnitSizeMcq", "g1m10-k1", "core", H.unit, ["Bigger unit, smaller count.", "The object is unchanged."]),
    reused("UnitSizeMcq", "g1m10-k2", "core", H.unit, ["The count depends on the unit chosen.", "So the unit must always be named."]),
    reused("CountUnitsMcq", "g1m10-k3", "core", H.unit, ["A count is only meaningful with its unit.", "Same-size units throughout."]),
    reused("LengthDifferenceNumeric", "g1m10-ch1", "stretch", H.unit, ["Compare only within one unit.", "Then differences are trustworthy."]),
  ],
  ["Bigger units give smaller counts.", "The object never changes.", "Always say which unit was used."],
  "course complete: measuring length with confidence.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 10, `10 lessons defined, got ${L.length}`);
const chapterTitles = ["Comparing Lengths", "Laying Units End to End", "Units and Counts"];
const perChapter = [4, 3, 3];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 7 ? 2 : 3);
const outDir = join(root, "content/courses/measure-length-g1");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g1m-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "diagram") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "measure-length-g1",
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
    if (w.type === "unitRuler") must(w.requiredPlacements * w.targetUnitSize === w.objectEnd - w.objectStart, `${id}/${s.id} unitRuler placements`);
    if (w.type === "lengthCompare") must(w.items.some((it) => it.id === w.answerId), `${id}/${s.id} lengthCompare answerId`);
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) {
      must(s.variant.gen === "g1-shapes-measure", `${id}/${s.id} unexpected gen`);
      must(REGISTERED.has(s.variant.form), `${id}/${s.id} form ${s.variant.form} not registered`);
    }
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "measure-length-g1", slug: "measure-length-g1", title: spec.title,
  tagline: "Compare fairly, lay units end to end, and learn why the unit you choose changes the count.",
  category: "Math", gradeLevel: 1, chapters,
}, null, 2) + "\n");
console.log(`built 10 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
