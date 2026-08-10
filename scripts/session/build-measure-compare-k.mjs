#!/usr/bin/env node
// S198 — Batch G course 5/6: measure-compare-k (K.MD.A.1-2, K.MD.B.3). Zero new generator code.
//
// TIER CORRECTION THIS COURSE IS BUILT ON (measured, recorded for the handover): numberLineHop is
// NOT the only adapt-3 K engine. unitRuler rates ALL 3s (manip/conseq/err/adapt/a11y/mobile/polish)
// and balanceScale rates conseq 3 + adapt 3 — and the tier takes the max over the lesson's widgets
// (ks-03-01 is Tier A at 34 on the strength of its unitRuler i1). Neither engine is produced by
// any g0/k0 generator form, so both are used here as AUTHORED i1 widgets (i1 carries no variant
// requirement). Length lessons get unitRuler, weight lessons get balanceScale (a=1, b=0, c=N —
// "slide blocks until the seesaw is level" IS weight comparison), and sorting/counting lessons
// carry a natural counting hop.
//
// SOLVER-REGEX CONTRACTS (g0Independent, pinned verbatim — the prompts below must match):
//   shapeWeightMcq   "…its side goes down…"  -> "The bear is heavier"
//                    "…its side goes up…"    -> "The bear is lighter"
//                    prompt contains "stays level" -> "The bags weigh the same"
//   shapeWeightTap   "the (X) side goes down" + "Tap the heavier" -> hotspot labelled X
//   shapeSortMcq     "You sort a {color} {item} first by color and then by kind." ->
//                    "{Color} group first, then {kind} group", kind from {apple/banana:food, car:toy, sock:clothing}
//   shapeSortTap     "Tap the group with the greatest number of shapes." -> max-count label ("8 squares")
//   shapeSortFrame   tenFrame whose TARGET IS THE TOTAL (preFilled included) and the prompt's LAST
//                    number must be that total — opposite semantics from countTeenFrame.
//   shapeLengthCompare -> lengthCompare pick mode; answerId must be the LONGEST item (solver
//                    reduces by length). align mode (authored, no variant) grades the fair-compare
//                    procedure itself: answerId + unalignedFeedback + missFeedback.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "measure-compare-k");
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
const HOP_T = corpusTemplate("numberLineHop", "counting-to-100-k");
const FRAME_T = corpusTemplate("tenFrame", "add-subtract-10-k");
const TAP_T = corpusTemplate("tapDiagram", "shapes-and-sorting-k");
const RULER_T = corpusTemplate("unitRuler", "measure-length-g1");
const BALANCE_T = corpusTemplate("balanceScale", "expressions-equations");
const LC_T = corpusTemplate("lengthCompare", "shapes-and-sorting-k");

const REG_G0 = new Set(["countAddMcq","countAddLine","countCompareEqualMcq","countTensMcq","countTensLine",
  "countObjectsMcq","countObjectsFlash","countDecomposeMcq","countMakeTenMcq","countMoreFewerMcq",
  "countOrderDrag","countBetweenMcq","countReadMcq","countReadFlash","countZeroTap",
  "countSubtractMcq","countSubtractLine","countTeenFrame"]);
const REG_K100 = new Set(["kSeqNextHop","kSeqNextMcq","kSeqBeforeHop","kSeqMissingMcq","kDecadeCrossHop",
  "kDecadeNextMcq","kTensNextHop","kTensNextMcq","kTensBackHop","kTensOrderDrag","kChartRowMcq",
  "kChartMissingMcq","kCountFromHop","kCountBackHop","kSeqOrderDrag"]);
const REG_SHAPES = new Set(["shapeComposePairs","shapeComposeMcq","shapeComposeTap","shapeWeightMcq","shapeWeightTap",
  "shapeLengthCompare","shapePositionMcq","shapePositionTap","shapeRollStackMcq","shapeRollStackTap",
  "shapeAnyWayMcq","shapeAnyWayTap","shapeSortMcq","shapeSortTap","shapeSortFrame"]);
const REG = { "g0-counting": REG_G0, "k0-count-100": REG_K100, "g0-shapes-sorting": REG_SHAPES };

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

/* ---------------- generic mcq assembly ---------------- */
function mcqStep(prompt, correctLabel, wrongs, feedbackByLabel, gen, form) {
  const labels = [correctLabel, ...wrongs];
  must(new Set(labels).size === labels.length, `mcq duplicate labels: ${prompt.slice(0, 40)}`);
  must(labels.length >= 4, `mcq needs >=4 options: ${prompt.slice(0, 40)}`);
  const options = labels.map((label, i) => {
    const fb = feedbackByLabel[label];
    must(fb && fb.length >= 25, `mcq feedback missing/short for "${label}"`);
    return { id: `o${i}`, label, correct: i === 0, feedback: fb };
  });
  must(new Set(options.map((o) => o.feedback)).size === options.length, "mcq feedback not distinct");
  const step = { widget: { type: "mcq", prompt, options } };
  if (gen) { must(REG[gen]?.has(form), `${gen}/${form} NOT registered`); step.variant = { gen, form }; }
  return step;
}

/* ---------------- solver-exact weight forms ---------------- */
function WeightDown() {
  return mcqStep("A toy bear sits on a seesaw and its side goes down. What does that show about the bear?",
    "The bear is heavier", ["The bear is lighter", "The bags weigh the same", "The seesaw is broken"],
    { "The bear is heavier": "Correct — the lower side of a seesaw carries the heavier load; sinking IS the comparison.",
      "The bear is lighter": "Lighter things ride UP on a seesaw; the sinking side holds the heavier object.",
      "The bags weigh the same": "Equal weights leave the seesaw level; a side going down breaks the tie.",
      "The seesaw is broken": "The seesaw is doing its job — tilting is exactly how it reports a weight difference." },
    "g0-shapes-sorting", "shapeWeightMcq");
}
function WeightUp() {
  return mcqStep("A toy bear sits on a seesaw and its side goes up. What does that show about the bear?",
    "The bear is lighter", ["The bear is heavier", "The bags weigh the same", "The bear is bigger"],
    { "The bear is lighter": "Correct — the rising side carries the lighter load; up means less weight, not less size.",
      "The bear is heavier": "Heavier loads sink; a side floating up is the lighter one.",
      "The bags weigh the same": "Equal weights keep the seesaw level; a rising side means the weights differ.",
      "The bear is bigger": "Size and weight are different questions — a big fluffy bear can still be the lighter load." },
    "g0-shapes-sorting", "shapeWeightMcq");
}
function WeightLevel() {
  return mcqStep("Two bags sit on a seesaw and it stays level. What does that show?",
    "The bags weigh the same", ["The left bag is heavier", "The right bag is heavier", "The seesaw is stuck"],
    { "The bags weigh the same": "Correct — a level seesaw means neither side wins; the weights are equal.",
      "The left bag is heavier": "A heavier left bag would drag its side down; level means no side sinks.",
      "The right bag is heavier": "A heavier right bag would drag its side down; the level beam says the weights match.",
      "The seesaw is stuck": "Nothing is stuck — balance is the seesaw's way of reporting equal weights." },
    "g0-shapes-sorting", "shapeWeightMcq");
}
function WeightTapHeavier(heavy, light, heavyIcon, lightIcon) {
  must(!heavy.includes(",") && !light.includes(","), "tap labels must be comma-free");
  const w = structuredClone(TAP_T);
  w.prompt = `On a seesaw, the ${heavy} side goes down and the ${light} side goes up. Tap the heavier object.`;
  w.mode = "selectOne"; w.canvas = { w: 3, h: 1 };
  w.hotspots = [
    { id: "g0", x: 25, y: 50, label: light, icon: lightIcon, count: 1, correct: false,
      feedback: `The ${light} side rises, which shows that it is lighter than the ${heavy}.` },
    { id: "g1", x: 75, y: 50, label: heavy, icon: heavyIcon, count: 1, correct: true },
  ];
  w.missFeedback = "The sinking side of a seesaw carries the heavier object — find which side went down.";
  return { widget: w, variant: { gen: "g0-shapes-sorting", form: "shapeWeightTap" } };
}

/* ---------------- solver-exact sort forms ---------------- */
const KIND = { apple: "food", banana: "food", car: "toy", sock: "clothing" };
function SortMcq(r) {
  const item = ["apple", "banana", "car", "sock"][pick(r, 0, 3)];
  const color = ["red", "green", "blue", "yellow"][pick(r, 0, 3)];
  const kind = KIND[item];
  const cap = color[0].toUpperCase() + color.slice(1);
  const correct = `${cap} group first, then ${kind} group`;
  return mcqStep(`You sort a ${color} ${item} first by color and then by kind. Where does it go each time?`,
    correct, ["The same group both times", `${kind} group first, then ${cap} group`, "It cannot be sorted twice"],
    { [correct]: `Correct — the first rule reads its color (${color}), the second reads what it is (${kind}); same object, two homes.`,
      "The same group both times": "Changing the sorting rule can move one object into a different group.",
      [`${kind} group first, then ${cap} group`]: "That swaps the rules' order — color was the FIRST rule asked for, kind the second.",
      "It cannot be sorted twice": "Any object answers many questions at once; each rule simply asks a different one." },
    "g0-shapes-sorting", "shapeSortMcq");
}
function SortTap(r) {
  const shapes = [["triangles", "🔺"], ["squares", "◼️"], ["circles", "⚪"]];
  const counts = [pick(r, 4, 6), pick(r, 7, 9), pick(r, 2, 3)];
  const order = [0, 1, 2].sort(() => 0);
  const maxI = counts.indexOf(Math.max(...counts));
  const w = structuredClone(TAP_T);
  w.prompt = "Tap the group with the greatest number of shapes.";
  w.mode = "selectOne"; w.canvas = { w: 3, h: 1 };
  w.hotspots = order.map((k, i) => {
    const label = `${counts[k]} ${shapes[k][0]}`;
    must(!label.includes(","), "sort tap label comma-free");
    const h = { id: `g${i}`, x: 17 + 33 * i, y: 50, label, icon: shapes[k][1], count: counts[k], correct: k === maxI };
    if (k !== maxI) h.feedback = `${counts[k]} is fewer than the greatest group, which contains ${Math.max(...counts)} shapes.`;
    return h;
  });
  w.missFeedback = "Count each group first; the comparison is between the three counts, not the shapes' sizes.";
  return { widget: w, variant: { gen: "g0-shapes-sorting", form: "shapeSortTap" } };
}
function SortFrame(r) {
  const pre = pick(r, 2, 4), add = pick(r, 3, 5);
  const total = pre + add;
  must(total <= 10, "sort frame total fits the frame");
  const w = structuredClone(FRAME_T);
  // solver: target = LAST number in the prompt = the TOTAL (preFilled included)
  w.prompt = `The frame already has ${pre} red buttons. Add ${add} blue buttons so it shows ${total} buttons altogether.`;
  w.target = total; w.preFilled = pre; w.addColor = "sky";
  w.commonCounts = [
    { count: pre, feedback: `${pre} leaves ${add} dots still missing. Continue until the frame shows exactly ${total}.` },
    { count: total - 1, feedback: `${total - 1} leaves 1 dot still missing. Continue until the frame shows exactly ${total}.` },
    { count: total + 1 <= 10 ? total + 1 : pre + 1, feedback: total + 1 <= 10
      ? `${total + 1} adds 1 too many. Remove the extra so the frame shows exactly ${total}.`
      : `${pre + 1} adds only 1 blue button; ${add} are needed to reach ${total}.` },
  ];
  w.missFeedback = `Both colors count: the ${pre} red already there plus your blue must total ${total}.`;
  w.successFeedback = `${pre} red and ${add} blue — ${total} altogether; the sort's groups add up to the whole.`;
  return { widget: w, variant: { gen: "g0-shapes-sorting", form: "shapeSortFrame" } };
}

/* ---------------- shapeLengthCompare (variant, pick mode: answerId = LONGEST) ---------------- */
function LengthPick(r, orientation = "h", noun = "ribbons", ask = "longest") {
  const base = pick(r, 4, 6);
  const lens = [base, base + pick(r, 2, 3), base - pick(r, 1, 2)];
  const names = orientation === "h" ? ["top", "middle", "bottom"] : ["left", "middle", "right"];
  const w = structuredClone(LC_T);
  w.mode = "pick"; w.orientation = orientation; w.unitLabel = "cubes";
  delete w.unalignedFeedback;
  w.prompt = `Compare the three ${noun} from one start line and tap the ${ask}.`;
  const maxI = lens.indexOf(Math.max(...lens));
  w.items = lens.map((len, i) => {
    const it = { id: names[i], label: `${names[i]} ${noun.replace(/s$/, "")}`, length: len, startOffset: 0 };
    if (i !== maxI) it.feedback = `The ${names[i]} one measures ${len} cubes — shorter than ${Math.max(...lens)}. Count the unit ticks, not the look.`;
    return it;
  });
  w.answerId = names[maxI];
  must(w.items.filter((x) => x.id === w.answerId)[0].length === Math.max(...lens), "answerId must be the longest item");
  w.missFeedback = `From one start line the far end decides: the ${ask} reaches ${Math.max(...lens)} cubes.`;
  w.successFeedback = `Right — same start line, so the farther end IS the ${ask}.`;
  return { widget: w, variant: { gen: "g0-shapes-sorting", form: "shapeLengthCompare" } };
}
/* align mode: authored, no variant — grades the fair-compare PROCEDURE */
function LengthAlign(offset, aLen, bLen) {
  must(bLen > aLen, "align: bottom must be longer");
  const w = structuredClone(LC_T);
  w.mode = "align"; delete w.unitLabel; delete w.orientation;
  w.prompt = "To compare two ribbons fairly, what must you do first? Make it fair, then tap the longer ribbon.";
  w.items = [
    { id: "top", label: "top ribbon", length: aLen, startOffset: offset,
      feedback: "Judged before the starts were lined up — the head start made the top ribbon LOOK ahead. Slide it to the line, then compare far ends." },
    { id: "bottom", label: "bottom ribbon", length: bLen },
  ];
  w.answerId = "bottom";
  w.unalignedFeedback = "Looks can trick you — line the ends up first.";
  w.missFeedback = "Now the starts are lined up — check the far ends again: the ribbon that reaches farther is the longer one.";
  w.successFeedback = "Yes — same start makes the compare fair.";
  return { widget: w };
}

/* ---------------- authored engines: unitRuler & balanceScale i1s ---------------- */
function Ruler(span, thing) {
  const w = structuredClone(RULER_T);
  w.objectStart = 0; w.objectEnd = span;
  w.allowedUnitSizes = [1, 2]; w.targetUnitSize = 1; w.startUnitSize = 1;
  w.requiredPlacements = span;
  w.prompt = `Measure the ${thing}. Align zero with its start, then place ${span} one-unit blocks with no gaps or overlaps.`;
  w.successFeedback = `${span} equal blocks cover the ${thing} exactly — same start, no gaps, no overlaps: that number IS its length.`;
  w.alignFeedback = "Line up zero with the object's starting end before measuring.";
  w.gapOverlapFeedback = "The blocks must touch end to end — no spaces and no covering the same part twice.";
  w.unitFeedback = "Every block must be the same size, or the count means nothing.";
  must(w.requiredPlacements === w.objectEnd - w.objectStart, "ruler placements must equal the span in unit blocks");
  return w;
}
function Balance(c, thing) {
  const w = structuredClone(BALANCE_T);
  w.a = 1; w.b = 0; w.c = c; w.xMin = 0; w.xMax = Math.max(10, c + 2); w.xStart = 0;
  w.prompt = `The ${thing} sits on one pan. Slide blocks onto the other pan until the seesaw is level.`;
  w.successFeedback = `${c} blocks balance the ${thing} — level pans mean equal weight, and the block count NAMES that weight.`;
  w.lowFeedback = "The block pan is lighter — the pans are not level yet; add more blocks.";
  w.highFeedback = "The block pan is heavier — it sank past level; take blocks off.";
  must(w.c > w.xMin && w.c < w.xMax, "balance target must be interior");
  return w;
}

/* ---------------- hops & counting mcqs ---------------- */
function hopBase(prompt, min, max, start, hops, direction, land, success, landings, low, high, gen, form) {
  const w = structuredClone(HOP_T);
  w.prompt = prompt; w.min = min; w.max = max; w.start = start;
  w.hop = 1; w.hops = hops; w.direction = direction;
  must(land > min && land < max, `hop landing ${land} sits at the edge`);
  w.successFeedback = success;
  w.missFeedback = `Count ${hops} ${direction === "back" ? "back" : "on"} from ${start}: you land on ${land}.`;
  w.lowFeedback = low; w.highFeedback = high;
  must(low.length >= 25 && high.length >= 25, "hop needs authored low/high feedback");
  w.commonLandings = landings.map(([value, feedback]) => {
    must(value !== land && value >= min && value <= max, `hop trap ${value} invalid`);
    must(feedback.length >= 25, "hop trap feedback short");
    return { value, feedback };
  });
  const step = { widget: w };
  if (gen) { must(REG[gen]?.has(form), `${gen}/${form} NOT registered`); step.variant = { gen, form }; }
  return step;
}
function CountOnHop(r, noun) {
  const a = pick(r, 3, 6), h = pick(r, 2, 4);
  const land = a + h;
  return hopBase(`Start at ${a} and count on ${h}. Tap where you land.`,
    a - 2, land + 2, a, h, "forward", land,
    `${a} ${noun} and ${h} more make ${land} — counting finishes what sorting starts.`,
    [[land - 1, `${land - 1} stops one complete hop too soon. Continue the final 1-unit hop to reach ${land}.`],
     [land + 1, `${land + 1} goes one complete hop too far. Count just ${h} hops from ${a} to land on ${land}.`]],
    `Short of the landing — all ${h} counts are needed to reach ${land}.`,
    `Past the landing — the count-on stops after ${h} numbers, on ${land}.`,
    "k0-count-100", "kCountFromHop");
}
function MoreFewer(r, mode) {
  const a = pick(r, 3, 8);
  let b;
  if (mode === "equal") b = a;
  else if (mode === "starsMore") b = a - pick(r, 1, 2);
  else b = a + pick(r, 1, 2);
  const correct = a === b ? "They are equal" : a > b ? "More stars" : "More hearts";
  const wrongs = ["They are equal", "More stars", "More hearts", "You cannot tell"].filter((l) => l !== correct).slice(0, 3);
  const fb = {
    "More stars": a > b ? `Correct — ${a} stars against ${b} hearts; the star group's count is greater.`
      : `The star count (${a}) does not beat the heart count (${b}); compare the two totals.`,
    "More hearts": b > a ? `Correct — ${b} hearts against ${a} stars; the heart group's count is greater.`
      : `The heart count (${b}) does not beat the star count (${a}); compare the two totals.`,
    "They are equal": a === b ? `Correct — both groups count to ${a}; equal counts mean equal groups.`
      : `The counts differ (${a} against ${b}); equal needs the two totals to match.`,
    "You cannot tell": `You can always tell — count each group and compare the two totals directly.`,
  };
  return mcqStep(`There are ${a} stars and ${b} hearts. Which statement is true?`,
    correct, wrongs, fb, "g0-counting", "countMoreFewerMcq");
}

/* ---------------- authored MCQs ---------------- */
const authored = (prompt, opts) => {
  must(opts.length >= 4 && opts[0][1], "authored mcq shape");
  return mcqStep(prompt, opts[0][0], opts.slice(1).map((o) => o[0]),
    Object.fromEntries(opts.map(([l, , f]) => [l, f])), null, null);
};
const AttributesMcq = () => authored("A pencil can be measured in more than one way. Which list is right?", [
  ["Its length AND its weight", true, "Correct — one object carries many measurable attributes; each question needs its own tool."],
  ["Only its length", false, "Length is one attribute of the pencil, but a scale would find its weight too."],
  ["Only its color", false, "Color is a property you SORT by, not an amount you measure with units."],
  ["Nothing — pencils aren't measurable", false, "Every object answers measurement questions: how long, how heavy, how much it holds."]]);
const ToolMatchMcq = () => authored("Which question does a seesaw answer, and which does a ruler answer?", [
  ["Seesaw: which is heavier. Ruler: which is longer", true, "Correct — each tool compares ONE attribute; swapping them answers the wrong question."],
  ["Both answer which is longer", false, "A seesaw never reports length — it tilts by weight alone."],
  ["Both answer which is heavier", false, "A ruler never reports weight — it counts length units alone."],
  ["Neither answers anything", false, "Each is a comparison machine: the seesaw for weight, the ruler for length."]]);
const TallLongMcq = () => authored("A tower is TALL and a snake is LONG. What do the two words share?", [
  ["Both describe length — one standing up, one lying down", true, "Correct — tall is length measured upward; long is length measured along; same attribute, two poses."],
  ["Nothing — they are unrelated", false, "Turn the tower on its side and tall becomes long; one attribute wears both words."],
  ["Tall means heavy", false, "Tall speaks of height, not weight — a tall tower of feathers stays light."],
  ["Long means old", false, "Long measures distance end to end, whatever the age of the snake."]]);
const BigNotHeavyMcq = () => authored("A big balloon and a small stone — which is heavier?", [
  ["The stone can be, though it is smaller", true, "Correct — size and weight are separate attributes; the seesaw, not the eye, settles weight."],
  ["The balloon — bigger is always heavier", false, "Bigger fills more space, but air weighs little; the small stone can sink the seesaw."],
  ["They must weigh the same", false, "Nothing forces equal weight; only a level seesaw could show it."],
  ["You can never know", false, "You CAN know — put them on the pans and read the tilt."]]);
const HoldsMoreMcq = () => authored("A tall thin glass and a wide bowl — which holds more?", [
  ["Filling both is the only fair test", true, "Correct — capacity hides from the eye; pour with one same scoop and count the scoops."],
  ["The tall glass — tall means more", false, "Tallness is one direction only; the wide bowl spreads its room sideways."],
  ["The wide bowl — wide means more", false, "Width alone does not decide either; the scoop count settles it."],
  ["Neither holds anything", false, "Both are containers; the question is how many scoops each swallows."]]);
const FairStartMcq = () => authored("Two runners race, but one starts ahead. Is the race a fair length test?", [
  ["No — comparisons need one same start line", true, "Correct — a head start fakes extra length; lining up the starts makes far ends comparable."],
  ["Yes — finishing first is all that counts", false, "The head start stole distance; the finish alone cannot untangle it."],
  ["Yes, if they run fast", false, "Speed cannot repair a crooked start — the compared distance is wrong."],
  ["Races cannot be compared", false, "They compare fine once both start together — that is the whole fix."]]);
const SortRuleMcq = () => authored("What makes a sort a SORT, instead of just piles?", [
  ["One rule that every object is tested against", true, "Correct — a sort asks one question of everything: red or not, big or small; the rule builds the piles."],
  ["Making the piles equal", false, "The rule decides the pile sizes; equal piles are a coincidence, not the goal."],
  ["Pretty arrangements", false, "A sort can be messy on the table and perfect in its rule."],
  ["Speed", false, "A slow sort with one clear rule is still a sort; a fast jumble is not."]]);
const RecountMcq = () => authored("After sorting shapes into groups, what does counting each group add?", [
  ["A number for each group, ready to compare", true, "Correct — sorting builds the groups, counting names their sizes, comparing crowns the largest."],
  ["Nothing — sorting was enough", false, "Without counts the groups are just piles; the numbers make them comparable."],
  ["It undoes the sort", false, "Counting touches nothing — the groups stand as sorted, now with sizes."],
  ["Bigger shapes count double", false, "Each shape is one member; size never changes a count."]]);

const H = {
  ruler: ["Zero at the start.", "No gaps, no overlaps.", "Same-size blocks only."],
  seesaw: ["Down means heavier.", "Up means lighter.", "Level means equal."],
  fair: ["Same start line.", "Then compare far ends.", "Looks lie; line up first."],
  sort: ["One rule for all.", "Then count each group.", "Numbers make groups comparable."],
};

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Compare fairly — same start line, level seesaw, one sorting rule — for ${tag.replace(/-/g, " ")}.`,
  invariants: [`Fair comparison has fixed rules: lengths compare from one same start line, weights compare by which pan sinks, and sorted groups compare by their counts — the anchors for ${tag.replace(/-/g, " ")}.`],
  misconceptions: [`Judging length before aligning starts, reading size as weight, or comparing groups by how much space they fill instead of their counts.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `measure-compare-k:${tag}`, delayed: true,
  counterfactualPrompt: "If the starts were not lined up, could the far ends still settle which is longer?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });
const S = (mk, seedStr, hints, ev, ...extra) => {
  const r = mulberry32(seedFromString(seedStr));
  const out = mk(r, ...extra);
  return { ...out, hints, ev };
};
const A = (mkOrStep, hints, ev) => {
  const out = typeof mkOrStep === "function" ? mkOrStep() : mkOrStep;
  return { ...(out.widget ? out : { widget: out }), hints, ev };
};

def(1,
  "Objects hide many amounts at once: how LONG, how HEAVY, how MUCH they hold. Each amount is an attribute, and each can be measured.",
  "Pick the attribute first, then the tool: a ruler for length, a seesaw for weight, a scoop for what fits inside.",
  { rep: "concrete", widget: () => Ruler(4, "ribbon"),
    predict: P("Measuring the ribbon's LENGTH — which tool fits?", [{ id: "ruler", label: "Blocks laid end to end" }, { id: "seesaw", label: "A seesaw" }], "ruler",
      "Length is distance end to end; blocks along the ribbon count it. The seesaw answers a different question — weight.") },
  [
    A(AttributesMcq, H.ruler, ["One object, many amounts.", "Each has its own tool."]),
    S(LengthPick, "kmd1-k2", H.fair, ["Count the unit ticks.", "The far end decides."]),
    A(ToolMatchMcq, H.seesaw, ["Tools answer one question.", "Match tool to attribute."]),
    A(WeightLevel, H.seesaw, ["Level means equal.", "The beam reports weight."]),
  ],
  ["Objects carry many measurable attributes.", "Length, weight, capacity are different questions.", "Each question has its own tool."],
  "next: the words for length.");

def(2,
  "Length wears many words: a snake is LONG, a tower TALL, a pencil stub SHORT. All describe one attribute — distance end to end.",
  "Tall is length standing up; long is length lying down. Turn the tower sideways and tall becomes long.",
  { rep: "concrete", widget: () => Ruler(5, "scarf"),
    predict: P("A tower tips onto its side. Its TALL becomes…", [{ id: "long", label: "LONG — same length, new pose" }, { id: "gone", label: "Nothing — the length vanishes" }], "long",
      "Length survives turning; only the word changes with the pose.") },
  [
    A(TallLongMcq, H.ruler, ["One attribute, two poses.", "Tall stands, long lies."]),
    S(LengthPick, "kmd2-k2", H.fair, ["Longest reaches farthest.", "From one start line."]),
    S((r) => LengthPick(r, "v", "towers", "tallest"), "kmd2-k3", H.fair, ["Tallest is vertical longest.", "Same rule upright."]),
    S(LengthPick, "kmd2-ch1", H.fair, ["Count ticks, not looks.", "Units settle it."]),
  ],
  ["Long, tall, short — one attribute.", "Tall is length standing up.", "Turning changes the word, not the length."],
  "next: the words for weight.");

def(3,
  "Weight has its own words: HEAVY presses down hard, LIGHT barely presses at all. The seesaw turns that pressing into something you can see.",
  "Down means heavier, up means lighter, level means equal — the seesaw's three answers.",
  { rep: "concrete", widget: () => Balance(6, "toy bear"),
    predict: P("The bear's pan hangs lower than the block pan. The bear is…", [{ id: "heavy", label: "Heavier than the blocks" }, { id: "light", label: "Lighter than the blocks" }], "heavy",
      "Sinking is the seesaw's word for heavier; the low pan carries the greater weight.") },
  [
    A(WeightDown, H.seesaw, ["Down means heavier.", "The tilt is the answer."]),
    A(WeightTapHeavier("book", "balloon", "📘", "🎈"), H.seesaw, ["Find the sunken side.", "That object wins the weight."]),
    A(BigNotHeavyMcq, H.seesaw, ["Size is not weight.", "The seesaw decides."]),
    A(WeightUp, H.seesaw, ["Up means lighter.", "Rising side, smaller weight."]),
  ],
  ["Heavy presses down, light barely presses.", "The seesaw shows pressing as tilt.", "Down, up, level — three answers."],
  "next: which container holds more.");

def(4,
  "Containers hold different amounts. HOLDS MORE and HOLDS LESS compare capacity — the room inside — which eyes alone often misjudge.",
  "The fair test is filling: one same scoop, count the scoops each container swallows, compare the counts.",
  { rep: "concrete", widget: () => S(SortFrame, "kmd4-i1", [], []).widget,
    variant: { gen: "g0-shapes-sorting", form: "shapeSortFrame" },
    predict: P("A tall thin glass against a wide bowl — can looks settle which holds more?", [{ id: "no", label: "No — fill both and count scoops" }, { id: "yes", label: "Yes — tall wins" }], "no",
      "Capacity hides inside; only the scoop count makes the comparison fair.") },
  [
    A(HoldsMoreMcq, H.sort, ["Fill with one scoop.", "Count the scoops."]),
    S(SortFrame, "kmd4-k2", H.sort, ["Part plus part is the whole.", "Fill to the total."]),
    S((r) => CountOnHop(r, "scoops"), "kmd4-k3", H.sort, ["Count scoops on the line.", "Each scoop, one hop."]),
    A(ToolMatchMcq, H.seesaw, ["Capacity, weight, length differ.", "Tool matches question."]),
  ],
  ["Capacity is the room inside.", "Filling is the fair test.", "Count scoops with one same scoop."],
  "next: comparing two lengths properly.");

def(5,
  "To compare two lengths, put them side by side from ONE start line, then read the far ends: the one reaching farther is longer.",
  "The unit ticks let you say by HOW MUCH: count each length in cubes and compare the counts.",
  { rep: "concrete", widget: () => Ruler(6, "rope"),
    predict: P("Two ribbons from one start line; one reaches farther. The farther one is…", [{ id: "longer", label: "Longer" }, { id: "heavier", label: "Heavier" }], "longer",
      "Reach past a shared start line is exactly what LONGER means; weight never entered the test.") },
  [
    S(LengthPick, "kmd5-k1", H.fair, ["Same start, far end decides.", "Count the cubes."]),
    S((r) => LengthPick(r, "h", "pencils", "longest"), "kmd5-k2", H.fair, ["Three at once, same rule.", "Farthest reach wins."]),
    A(FairStartMcq, H.fair, ["Head starts fake length.", "Line up first."]),
    S(LengthPick, "kmd5-ch1", H.fair, ["By how much? Count ticks.", "Units answer it."]),
  ],
  ["Side by side, one start line.", "The farther end is longer.", "Cube counts say by how much."],
  "next: comparing two weights.");

def(6,
  "To compare two weights, load one on each pan and read the tilt: the sinking side is heavier, the rising side lighter.",
  "A level beam is an answer too — it says the weights are EQUAL, neither side winning.",
  { rep: "concrete", widget: () => Balance(7, "parcel"),
    predict: P("Blocks match the parcel and the pans sit level. What is true?", [{ id: "equal", label: "Parcel and blocks weigh the same" }, { id: "stuck", label: "The seesaw jammed" }], "equal",
      "Level is the seesaw's word for equal — the block count now NAMES the parcel's weight.") },
  [
    A(WeightTapHeavier("brick", "feather", "🧱", "🪶"), H.seesaw, ["Sunken side, heavier object.", "Read the tilt."]),
    A(WeightUp, H.seesaw, ["Rising means lighter.", "The high pan loses the weight race."]),
    A(BigNotHeavyMcq, H.seesaw, ["Big can be light.", "Pans, not eyes."]),
    A(WeightDown, H.seesaw, ["Down means heavier.", "Every time, both pans."]),
  ],
  ["One object per pan.", "Sinking side is heavier.", "Level means exactly equal."],
  "next: the fair-start rule for lengths.");

def(7,
  "The oldest length trick: give one ribbon a head start and it LOOKS longer. Fair comparing means lining the starting ends up first.",
  "Align first, judge second. Once the starts agree, the far ends tell the truth.",
  { rep: "concrete", widget: () => Ruler(4, "stick"),
    predict: P("A shorter ribbon starts 3 cubes ahead. Its far end reaches farther. Longer?", [{ id: "no", label: "No — the head start is lying" }, { id: "yes", label: "Yes — farther is longer" }], "no",
      "Far ends only speak truth AFTER the starts are aligned; the head start faked the reach.") },
  [
    A(LengthAlign(3, 5, 7), H.fair, ["Slide to the line first.", "Then read far ends."]),
    A(FairStartMcq, H.fair, ["Races need one start.", "So do ribbons."]),
    A(LengthAlign(2, 4, 6), H.fair, ["Align, then compare.", "Every single time."]),
    S(LengthPick, "kmd7-ch1", H.fair, ["Already aligned here.", "Far end decides."]),
  ],
  ["Head starts fake length.", "Align the starting ends first.", "Then the far ends tell the truth."],
  "next: taller and shorter.");

def(8,
  "Standing things compare by the same rule turned upright: same floor as the start line, and the top that reaches higher is TALLER.",
  "The floor does the aligning for you — which is why towers are easy to compare and ribbons are not.",
  { rep: "concrete", widget: () => Ruler(5, "tower"),
    predict: P("Two towers on the same floor. The taller one is the one that…", [{ id: "higher", label: "Reaches higher from the floor" }, { id: "wider", label: "Is wider" }], "higher",
      "Tallness is vertical reach from the shared floor; width is a different attribute altogether.") },
  [
    S((r) => LengthPick(r, "v", "towers", "tallest"), "kmd8-k1", H.fair, ["Floor is the start line.", "Highest top wins."]),
    A(TallLongMcq, H.ruler, ["Tall is vertical length.", "Same attribute upright."]),
    S((r) => LengthPick(r, "v", "plants", "tallest"), "kmd8-k3", H.fair, ["Same rule, any objects.", "Count cubes upward."]),
    S(LengthPick, "kmd8-ch1", H.fair, ["Lying down again.", "One start line still."]),
  ],
  ["Taller means reaching higher.", "The floor is a built-in start line.", "Width plays no part."],
  "next: sorting by a rule.");

def(9,
  "Sorting asks ONE question of every object — red or not? round or not? — and the answers build the groups.",
  "Change the rule and the groups change: a red sock joins the red pile under a color rule, the clothing pile under a kind rule.",
  { rep: "concrete", widget: () => S(SortTap, "kmd9-i1", [], []).widget,
    variant: { gen: "g0-shapes-sorting", form: "shapeSortTap" },
    predict: P("Sorting toys by COLOR — what question does every toy get?", [{ id: "color", label: "What color are you?" }, { id: "size", label: "How big are you?" }], "color",
      "The rule IS the question; a color sort asks color of everything, size of nothing.") },
  [
    S(SortMcq, "kmd9-k1", H.sort, ["The rule decides the home.", "New rule, new home."]),
    A(SortRuleMcq, H.sort, ["One question for all.", "That is a sort."]),
    S((r) => CountOnHop(r, "shapes"), "kmd9-k3", H.sort, ["Count a finished group.", "Hop the count out."]),
    S(SortMcq, "kmd9-ch1", H.sort, ["Two rules, two homes.", "Same object moves."]),
  ],
  ["A sort asks one question of everything.", "Answers build the groups.", "Change the rule, change the groups."],
  "next: sorting by size.");

def(10,
  "Size is a sorting rule too: BIG in one group, SMALL in the other. The rule must say where big begins before sorting.",
  "Size-sorting is not length-measuring — it asks a yes-or-no question, not a how-many question.",
  { rep: "concrete", widget: () => S(SortTap, "kmd10-i1", [], []).widget,
    variant: { gen: "g0-shapes-sorting", form: "shapeSortTap" },
    predict: P("Sorting buttons into BIG and SMALL — what must be decided first?", [{ id: "line", label: "Where big begins" }, { id: "count", label: "How many buttons exist" }], "line",
      "A size rule needs its boundary declared; without it, middling buttons have no home.") },
  [
    A(SortRuleMcq, H.sort, ["Declare the boundary.", "Then sort by it."]),
    S(SortTap, "kmd10-k2", H.sort, ["Groups made, now compare.", "Counts, not looks."]),
    S((r) => CountOnHop(r, "buttons"), "kmd10-k3", H.sort, ["Count one group.", "One hop per button."]),
    S(SortMcq, "kmd10-ch1", H.sort, ["Rules can chain.", "Each rule, its own home."]),
  ],
  ["Big and small make a rule.", "Declare where big begins.", "Sorting asks yes-or-no, not how-many."],
  "next: counting each group.");

def(11,
  "After the sort, count each group: touch and count the reds, then the blues. Each group earns its own number.",
  "The counts turn piles into data — three groups become three numbers, ready for comparing.",
  { rep: "concrete", widget: () => S(SortFrame, "kmd11-i1", [], []).widget,
    variant: { gen: "g0-shapes-sorting", form: "shapeSortFrame" },
    predict: P("Two sorted color groups fill one frame. The frame's total is…", [{ id: "sum", label: "Both group counts together" }, { id: "big", label: "Just the bigger group" }], "sum",
      "The whole is its parts together — the sort split the total, and the counts rebuild it.") },
  [
    S(SortFrame, "kmd11-k1", H.sort, ["Part plus part.", "Fill to the total."]),
    S((r) => CountOnHop(r, "shapes"), "kmd11-k2", H.sort, ["Count on for the second group.", "Hop past the first."]),
    A(RecountMcq, H.sort, ["Counts make data.", "Groups become numbers."]),
    S(SortFrame, "kmd11-ch1", H.sort, ["Every member counted once.", "Totals check the sort."]),
  ],
  ["Count each sorted group.", "Each group earns a number.", "Counts turn piles into data."],
  "next: which group has most.");

def(12,
  "With every group counted, the last question answers itself: the group with the greatest count has the MOST; the least count, the FEWEST.",
  "Sort, count, compare — the full chain. The counts do the comparing; the shapes' sizes never vote.",
  { rep: "concrete", widget: () => S(SortTap, "kmd12-i1", [], []).widget,
    variant: { gen: "g0-shapes-sorting", form: "shapeSortTap" },
    predict: P("Groups of 6, 8, and 5. Which has the most?", [{ id: "eight", label: "The group of 8" }, { id: "spread", label: "Whichever spreads widest" }], "eight",
      "Most is a claim about counts; 8 beats 6 beats 5 however the shapes sprawl.") },
  [
    S(SortTap, "kmd12-k1", H.sort, ["Greatest count wins.", "Counts, not sprawl."]),
    S(MoreFewer, "kmd12-k2", H.sort, ["Two groups, two counts.", "Compare the totals."], "heartsMore"),
    S((r) => CountOnHop(r, "circles"), "kmd12-k3", H.sort, ["Verify a count by hopping.", "The line double-checks."]),
    A(RecountMcq, H.sort, ["Sort, count, compare.", "The full chain."]),
  ],
  ["Greatest count means most.", "Least count means fewest.", "Sort, count, compare — the whole chain."],
  "course complete: fair comparing, start to finish.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 12, `12 lessons defined, got ${L.length}`);
const chapterTitles = ["Words for Measuring", "Fair Comparisons", "Sort and Count"];
const perChapter = [4, 4, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 8 ? 2 : 3);
const outDir = join(root, "content/courses/measure-compare-k");
mkdirSync(join(outDir, "lessons"), { recursive: true });

const ADAPT3 = new Set(["unitRuler", "balanceScale", "numberLineHop"]);

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seqN = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `kmd-0${ch}-${String(seqN).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev.length >= 2 ? c.ev : [...c.ev, "Compare fairly: same start line for lengths, the seesaw's tilt for weights, counts for sorted groups."],
      widget: c.widget, hints: c.hints, cml: cml(tag, "concrete") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const mkI1 = () => (typeof d.i1.widget === "function" ? d.i1.widget() : structuredClone(d.i1.widget));
  const i1raw = mkI1();
  const i1w = i1raw.widget ?? i1raw;
  const i1variant = i1raw.variant ?? d.i1.variant ?? null;
  const i2raw = mkI1();
  const i2w = i2raw.widget ?? i2raw;
  const lesson = {
    id, slug, title: row.title, courseId: "measure-compare-k",
    chapterId: chapters[ch - 1].id, minutes: 6, readingProfile: "early",
    steps: [
      { id: "c1", kind: "concept", figure: "count-on-hops", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: "Try it.", conceptTag: tag, widget: i1w,
        ...(i1variant ? { variant: i1variant } : {}), predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      stepFromCheck("k1", d.checks[0]),
      { id: "c2", kind: "concept", figure: "count-on-hops", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: "Try it again.", conceptTag: tag, widget: i2w,
        ...(i1variant ? { variant: i1variant } : {}), cml: cml(tag, "concrete") },
      stepFromCheck("k2", d.checks[1]),
      stepFromCheck("k3", d.checks[2]),
      stepFromCheck("ch1", d.checks[3], "challenge"),
      { id: "r1", kind: "recap", body: "You did it!", takeaways: d.recap, teaser: d.teaser },
    ],
    remedials: [{
      conceptTag: tag,
      concept: { id: `rem-${tag}-c`, kind: "concept", body: d.c2, narration: d.c2 },
      check: { id: `rem-${tag}-k`, kind: "check", body: "", conceptTag: tag,
        explanationVariants: d.checks[0].ev.length >= 2 ? d.checks[0].ev : [...d.checks[0].ev, "Same start line, seesaw tilt, or group counts — pick the fair test for the attribute."],
        widget: d.checks[0].widget },
    }],
  };

  must(lesson.steps[1].predict, `${id}: i1 must carry a predict step`);
  must(lesson.steps.some((s) => s.widget && ADAPT3.has(s.widget.type)),
    `${id}: needs an adapt-3 engine (unitRuler, balanceScale, or numberLineHop)`);
  const wc = (t) => t.split(/\s+/).filter(Boolean).length;
  for (const s of lesson.steps) {
    if (s.kind === "concept") must(wc(s.body) <= 25, `${id}/${s.id}: concept body ${wc(s.body)} words > early cap 25`);
    const w = s.widget;
    if (!w) continue;
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1 && w.options.length >= 4 && w.options[0].correct === true, `${id}/${s.id} mcq shape`);
      for (const o of w.options) must(o.feedback.length >= 25, `${id}/${s.id} feedback short`);
    }
    if (w.type === "numberLineHop") {
      const land = w.direction === "back" ? w.start - w.hop * w.hops : w.start + w.hop * w.hops;
      must(land > w.min && land < w.max, `${id}/${s.id} hop landing at the edge`);
      must(w.commonLandings.length >= 2, `${id}/${s.id} hop needs 2 traps`);
    }
    if (w.type === "tenFrame") {
      must(w.target >= 1 && w.target <= 10, `${id}/${s.id} tenFrame target`);
      must(w.commonCounts.length >= 2, `${id}/${s.id} tenFrame traps`);
      const nums = (w.prompt.match(/\d+/g) || []).map(Number);
      must(nums.length && nums[nums.length - 1] === w.target,
        `${id}/${s.id} shapeSortFrame: the prompt's LAST number must equal target (the TOTAL)`);
      must(w.target === w.preFilled + (w.target - w.preFilled) && w.preFilled < w.target,
        `${id}/${s.id} preFilled must sit below target`);
    }
    if (w.type === "tapDiagram") {
      must(w.hotspots.filter((h) => h.correct).length === 1, `${id}/${s.id} tap one correct`);
      for (const h of w.hotspots) {
        must(!h.label.includes(","), `${id}/${s.id} tap label comma`);
        if (!h.correct) must((h.feedback ?? "").length >= 25, `${id}/${s.id} tap wrong needs feedback`);
      }
      if (w.prompt.includes("Tap the heavier")) {
        const m = w.prompt.match(/the (.+?) side goes down/);
        must(m && w.hotspots.find((h) => h.correct).label === m[1],
          `${id}/${s.id} shapeWeightTap: correct hotspot must be the goes-down label`);
      }
      if (w.prompt.includes("greatest number")) {
        const max = Math.max(...w.hotspots.map((h) => h.count));
        must(w.hotspots.find((h) => h.correct).count === max,
          `${id}/${s.id} shapeSortTap: correct must be the max-count group`);
      }
    }
    if (w.type === "lengthCompare") {
      must(w.items.length >= 2 && w.answerId, `${id}/${s.id} lengthCompare shape`);
      const ans = w.items.find((x) => x.id === w.answerId);
      must(ans, `${id}/${s.id} answerId present`);
      if (w.mode === "pick") {
        must(ans.length === Math.max(...w.items.map((x) => x.length)),
          `${id}/${s.id} pick-mode answer must be the longest (solver reduces by length)`);
      }
      if (w.mode === "align") {
        must(w.items.some((x) => (x.startOffset ?? 0) > 0), `${id}/${s.id} align mode needs an offset item`);
        must(typeof w.unalignedFeedback === "string" && w.unalignedFeedback.length >= 10, `${id}/${s.id} align needs unalignedFeedback`);
      }
    }
    if (w.type === "unitRuler") {
      must(w.requiredPlacements === (w.objectEnd - w.objectStart) / w.targetUnitSize,
        `${id}/${s.id} ruler placements must tile the span exactly`);
    }
    if (w.type === "balanceScale") {
      must(w.c > w.xMin && w.c < w.xMax, `${id}/${s.id} balance target interior`);
      must(w.a === 1 && w.b === 0, `${id}/${s.id} K balance must be plain weight (a=1, b=0)`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "measure-compare-k", slug: "measure-compare-k", title: spec.title,
  tagline: "Same start line, level seesaw, one sorting rule — fair comparisons.",
  category: "Math", gradeLevel: 0, chapters,
}, null, 2) + "\n");
console.log(`built 12 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
