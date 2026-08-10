#!/usr/bin/env node
// S198 — Batch G course 3/6: teen-numbers-k (K.NBT.A.1). Zero new generator code.
//
// The star surface is countTeenFrame (g0-counting -> tenFrame): "A full group of 10 is already
// shown. Add the extra dots needed to make 1X." with target = X, the ONES — the widget renders
// the completed ten separately, so the frame carries exactly the ten-and-ones structure this
// standard is about. Probed shapes:
//   countTeenFrame  prompt "…make 1X." target=X, preFilled 0, addColor tangerine
//   countDecomposeMcq "Which pair is NOT a split of N?" — the correct label is the pair that
//     does NOT sum to N (there is a second shared-equally shape; only the NOT-a-split shape is
//     authored here)
//   countMakeTenMcq "Which pair makes exactly 10?" — correct label sums to 10
// Hops (kSeqNextHop / kSeqBeforeHop / kCountFromHop) live comfortably in the teens and keep the
// adapt-3 engine present in every lesson. All-A recipe as in courses 1-2; concept bodies written
// to the 25-word "early" cap.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "teen-numbers-k");
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
const FRAME_T = corpusTemplate("tenFrame", "add-subtract-10-k");
const HOP_T = corpusTemplate("numberLineHop", "counting-to-100-k");

const REG_G0 = new Set(["countAddMcq","countAddLine","countCompareEqualMcq","countTensMcq","countTensLine",
  "countObjectsMcq","countObjectsFlash","countDecomposeMcq","countMakeTenMcq","countMoreFewerMcq",
  "countOrderDrag","countBetweenMcq","countReadMcq","countReadFlash","countZeroTap",
  "countSubtractMcq","countSubtractLine","countTeenFrame"]);
const REG_K100 = new Set(["kSeqNextHop","kSeqNextMcq","kSeqBeforeHop","kSeqMissingMcq","kDecadeCrossHop",
  "kDecadeNextMcq","kTensNextHop","kTensNextMcq","kTensBackHop","kTensOrderDrag","kChartRowMcq",
  "kChartMissingMcq","kCountFromHop","kCountBackHop","kSeqOrderDrag"]);
const REG = { "g0-counting": REG_G0, "k0-count-100": REG_K100 };

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

/* ---- countTeenFrame mirror: teen = 10 + ones; target is the ONES ---- */
function TeenFrame(r, fixedTeen = null) {
  const teen = fixedTeen ?? pick(r, 11, 19);
  const ones = teen - 10;
  const w = structuredClone(FRAME_T);
  w.prompt = `A full group of 10 is already shown. Add the extra dots needed to make ${teen}.`;
  w.target = ones; w.preFilled = 0; w.addColor = "tangerine";
  must(ones >= 1 && ones <= 9, `teen ${teen} out of range`);
  w.successFeedback = `${teen} built — one complete ten and ${ones} more, exactly what the teen numeral says.`;
  w.missFeedback = `The ten is done; count on from 10 while adding dots, and stop when you reach ${teen}.`;
  const traps = [[0, `0 leaves ${ones} dots still missing — the ten alone only makes 10, not ${teen}.`]];
  if (ones > 1) traps.push([ones - 1, `${ones - 1} leaves 1 dot still missing; ten and ${ones - 1} is ${teen - 1}, one short of ${teen}.`]);
  if (ones < 9) traps.push([ones + 1, `${ones + 1} adds 1 too many; ten and ${ones + 1} is ${teen + 1}, one past ${teen}.`]);
  w.commonCounts = traps.slice(0, 3).map(([count, feedback]) => ({ count, feedback }));
  must(w.commonCounts.length >= 2, "teen frame needs 2 traps");
  return { widget: w, variant: { gen: "g0-counting", form: "countTeenFrame" } };
}

/* ---- decompose / make-ten mcq mirrors ---- */
function DecomposeNot(r, fixedN = null) {
  const n = fixedN ?? pick(r, 12, 18);
  const wrongPair = `10 and ${n - 10 + 1}`; // sums to n+1, the NOT-a-split answer
  const valids = [`10 and ${n - 10}`, `${n} and 0`, `${n - 1} and 1`];
  const fb = {
    [wrongPair]: `Correct — 10 + ${n - 10 + 1} = ${n + 1}, one too many, so this pair is not a split of ${n}.`,
    [`10 and ${n - 10}`]: `10 + ${n - 10} = ${n}, so this pair is a valid split of ${n} — the teen split itself.`,
    [`${n} and 0`]: `${n} + 0 = ${n}, so this pair is a valid split of ${n}, keeping everything in one part.`,
    [`${n - 1} and 1`]: `${n - 1} + 1 = ${n}, so this pair is a valid split of ${n}.`,
  };
  return mcqStep(`Which pair is NOT a split of ${n}?`, wrongPair, valids, fb, "g0-counting", "countDecomposeMcq");
}
function MakeTen(r) {
  const a = pick(r, 3, 7);
  const correct = `${a} and ${10 - a}`;
  const wrongs = [`${a} and ${10 - a + 1}`, `${a + 1} and ${10 - a + 1}`, `${a} and ${10 - a - 1}`];
  const fb = {
    [correct]: `Correct — ${a} + ${10 - a} = 10, so the pair fills one complete ten.`,
    [`${a} and ${10 - a + 1}`]: `${a} + ${10 - a + 1} = 11, which spills one past the complete ten.`,
    [`${a + 1} and ${10 - a + 1}`]: `${a + 1} + ${10 - a + 1} = 12, two beyond a complete ten.`,
    [`${a} and ${10 - a - 1}`]: `${a} + ${10 - a - 1} = 9, one dot short of filling the ten.`,
  };
  return mcqStep("Which pair makes exactly 10?", correct, wrongs, fb, "g0-counting", "countMakeTenMcq");
}
function CountRead(r, lo = 11, hi = 19) {
  const n = pick(r, lo, hi);
  return mcqStep(`A group shows ${n} dots. Which numeral names that amount?`,
    String(n), [String(n + 1), String(n - 1), String(n - 10)],
    { [String(n)]: `Correct — a full ten and ${n - 10} more is what the numeral ${n} says: 1 ten, ${n - 10} ones.`,
      [String(n + 1)]: `That numeral names one more dot than the group shows.`,
      [String(n - 1)]: `That numeral stops one dot short; the ten plus the extras reaches ${n}.`,
      [String(n - 10)]: `${n - 10} counts only the extras and forgets the whole completed ten underneath.` },
    "g0-counting", "countReadMcq");
}
function SeqNext(r, lo = 10, hi = 18) {
  const n = pick(r, lo, hi);
  return mcqStep(`What number comes right after ${n}?`,
    String(n + 1), [String(n), String(n + 2), String(n - 1)],
    { [String(n + 1)]: `Correct — the teens climb by ones just like every other stretch of the counting song.`,
      [String(n)]: `${n} is where we stood; the question asks for the next number along.`,
      [String(n + 2)]: `${n + 2} skips a number; the count moves one at a time through the teens too.`,
      [String(n - 1)]: `${n - 1} comes BEFORE ${n}; after means one step forward.` },
    "k0-count-100", "kSeqNextMcq");
}

/* ---- hops (numberLineHop, the adapt-3 engine), teen-ranged ---- */
function hopBase(prompt, min, max, start, hops, direction, land, success, landings, low, high, gen, form) {
  const w = structuredClone(HOP_T);
  w.prompt = prompt; w.min = min; w.max = max; w.start = start;
  w.hop = 1; w.hops = hops; w.direction = direction;
  must(land > min && land < max, `hop landing ${land} at the edge`);
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
function SeqNextHop(r) {
  const n = pick(r, 11, 17);
  return hopBase(`What number comes right after ${n}? Hop one and tap where you land.`,
    n - 3, n + 4, n, 1, "forward", n + 1,
    `${n + 1} — one hop forward; the teens follow the song exactly.`,
    [[n, `${n} stops one complete hop too soon. Continue the final 1-unit hop to reach ${n + 1}.`],
     [n + 2, `${n + 2} goes one complete hop too far. One hop from ${n} lands on ${n + 1}.`]],
    `Short of the landing — a single hop forward reaches ${n + 1}.`,
    `Past the landing — right after ${n} means one hop, stopping on ${n + 1}.`,
    "k0-count-100", "kSeqNextHop");
}
function SeqBeforeHop(r) {
  const n = pick(r, 12, 18);
  return hopBase(`What number comes right before ${n}? Hop one back and tap where you land.`,
    n - 4, n + 3, n, 1, "back", n - 1,
    `${n - 1} — one hop back through the teens, one less than ${n}.`,
    [[n, `${n} stops one complete hop too soon. Continue the final 1-unit hop back to reach ${n - 1}.`],
     [n - 2, `${n - 2} goes one complete hop too far. Count exactly 1 hop back from ${n} to reach ${n - 1}.`]],
    `Short of the landing — one hop back from ${n} reaches ${n - 1}.`,
    `Past the landing — right before ${n} means a single hop back, stopping on ${n - 1}.`,
    "k0-count-100", "kSeqBeforeHop");
}
function TenPlusHop(r, ones = null) {
  const h = ones ?? pick(r, 2, 6);
  const land = 10 + h;
  return hopBase(`Start at 10 and count on ${h}. Tap where you land.`,
    8, land + 2, 10, h, "forward", land,
    `10 and ${h} more is ${land} — the teen numeral written as a walk: ten first, then the ones.`,
    [[land - 1, `${land - 1} stops one complete hop too soon. Continue the final 1-unit hop to reach ${land}.`],
     [land + 1, `${land + 1} goes one complete hop too far. Count just ${h} hops from 10 to land on ${land}.`]],
    `Short of the landing — all ${h} counts past ten are needed to reach ${land}.`,
    `Past the landing — the count-on stops after ${h} numbers, on ${land}.`,
    "k0-count-100", "kCountFromHop");
}

/* ---- authored MCQs ---- */
const authored = (prompt, opts) => {
  must(opts.length >= 4 && opts[0][1], "authored mcq shape");
  return mcqStep(prompt, opts[0][0], opts.slice(1).map((o) => o[0]),
    Object.fromEntries(opts.map(([l, , f]) => [l, f])), null, null);
};
const TeenNameMcq = () => authored("What does the numeral 14 secretly say?", [
  ["One complete ten, and four more", true, "Correct — the 1 stands for a whole ten, the 4 for the ones riding on top."],
  ["A one and a four, side by side", false, "That reads the digits as neighbours; the left digit is a whole TEN, not a one."],
  ["Four tens and a one", false, "That swaps the digits' jobs — the ten is on the left, the ones on the right."],
  ["Fourteen separate tens", false, "Only the single left digit counts tens; fourteen has exactly one of them."]]);
const WhyTenFirstMcq = () => authored("Why build the ten BEFORE adding the extra ones?", [
  ["A finished ten never needs recounting — only the extras do", true, "Correct — the full frame is a known ten at a glance, so all attention goes to the ones."],
  ["Tens are heavier than ones", false, "Weight is not the point; the ten is a completed, trusted chunk of the count."],
  ["The extras would run away otherwise", false, "Nothing runs; building the ten first is about never recounting a finished group."],
  ["It is just a rule with no reason", false, "The reason is real: a complete ten is read instantly, leaving only ones to count."]]);
const LeftoverOnesMcq = () => authored("17 dots fill one ten-frame with some left outside. How many are left over?", [
  ["7 — the ten is inside, the rest ride outside", true, "Correct — 17 is one full ten and 7 ones, so exactly 7 dots cannot fit in the frame."],
  ["17 — all of them are left over", false, "Ten of the seventeen sit INSIDE the frame; only the ones beyond the ten remain out."],
  ["10 — the frame's worth", false, "The frame's ten is the part that fits; the leftovers are what exceeds it."],
  ["1 — just one dot", false, "One would make eleven in all; seventeen carries seven past the completed ten."]]);
const TeenEquationMcq = () => authored("Which equation tells the truth about 15?", [
  ["10 + 5 = 15", true, "Correct — fifteen is one complete ten and five ones, and the equation says exactly that."],
  ["5 + 5 = 15", false, "5 + 5 makes 10; the equation for fifteen needs the whole ten plus five more."],
  ["10 + 15 = 5", false, "That reads backwards — the two parts stand left of the equals, the whole on the right."],
  ["1 + 5 = 15", false, "That treats the 1 of 15 as one; the left digit is a full ten, so the sum is 10 + 5."]]);
const WhichTeenMcq = () => authored("A frame shows a full ten and 3 outside. Which teen is it?", [
  ["13 — ten and three", true, "Correct — one complete ten and 3 ones is exactly what the numeral 13 records."],
  ["3 — just the outsiders", false, "Counting only the extras drops the completed ten; the whole group is ten and three."],
  ["30 — three and a zero", false, "30 means three TENS; here there is one ten and three ones, which is 13."],
  ["10 — the frame alone", false, "The frame's ten is only part of the group; the 3 outside push the total to 13."]]);
const TeensAroundMcq = () => authored("An egg tray holds 10, and 2 eggs sit beside it. How many eggs?", [
  ["12 — a tray-ten and two more", true, "Correct — the full tray is a ready-made ten, so the count reads ten and 2: twelve."],
  ["2 — the ones beside the tray", false, "The tray's ten eggs count too; the extras merely ride on top of them."],
  ["10 — the tray's worth", false, "The tray alone is ten, but the two beside it lift the total to twelve."],
  ["20 — two full trays", false, "Only one tray is full; the two loose eggs are ones, not a second ten."]]);

const H = {
  ten: ["Build the ten first.", "Then count the extras.", "Teen means ten-and-some."],
  song: ["Teens climb by ones.", "After means one forward.", "Before means one back."],
  split: ["Ten and ones.", "The parts make the whole.", "Check by adding."],
};

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Build one complete ten, then count on the ones, for ${tag.replace(/-/g, " ")}.`,
  invariants: [`Every teen number is one complete ten and some ones — the left digit records the finished ten, the right digit counts the extras — and that split is what ${tag.replace(/-/g, " ")} rests on.`],
  misconceptions: [`Reading the 1 of a teen as \u201cone\u201d instead of one TEN, or counting only the leftover ones and forgetting the completed ten.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `teen-numbers-k:${tag}`, delayed: true,
  counterfactualPrompt: "If one more dot joined the ones, which teen would the frame show then?",
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
const A = (mk, hints, ev) => ({ ...mk(), hints, ev });

def(1,
  "Eleven is not a brand-new thing — it is ten and one more. The ten is finished; a single extra rides on top.",
  "Say it as a walk: land on ten, take one more step. That step's name is eleven.",
  { rep: "concrete", widget: (r) => TeenFrame(r, 11),
    predict: P("A full ten, then one more dot. What number is that?", [{ id: "eleven", label: "11 — ten and one" }, { id: "one", label: "1 — just the new dot" }], "eleven",
      "The finished ten still counts; the new dot lifts the total one past it.") },
  [
    S(TenPlusHop, "knb1-k1", H.ten, ["Land on ten first.", "One step past it."], 1),
    A(TeenNameMcq, H.ten, ["The 1 is a ten.", "The right digit counts extras."]),
    S(SeqNextHop, "knb1-k3", H.song, ["After ten comes eleven.", "One hop."]),
    S(CountRead, "knb1-ch1", H.ten, ["Ten and extras.", "Read the whole group."], 11, 13),
  ],
  ["Eleven is ten and one more.", "The ten stays finished.", "One extra rides on top."],
  "next: ten and two.");

def(2,
  "Twelve works the same way: ten and two more. The ten never gets recounted — only the two extras are new.",
  "Every teen will follow this pattern: one finished ten, plus some ones you can count on your fingers.",
  { rep: "concrete", widget: (r) => TeenFrame(r, 12),
    predict: P("Ten and two more — do you recount the ten?", [{ id: "no", label: "No — count on: 11, 12" }, { id: "yes", label: "Yes, start from 1" }], "no",
      "The ten is a finished, trusted chunk; only the newcomers need numbers.") },
  [
    S(TenPlusHop, "knb2-k1", H.ten, ["Two steps past ten.", "Count on, not over."], 2),
    A(WhyTenFirstMcq, H.ten, ["Finished tens are trusted.", "Only extras get counted."]),
    S(SeqNextHop, "knb2-k3", H.song, ["Eleven, then twelve.", "One at a time."]),
    S(CountRead, "knb2-ch1", H.ten, ["Ten plus the extras.", "Name the whole."], 11, 14),
  ],
  ["Twelve is ten and two.", "Count on from ten: 11, 12.", "Never recount the finished ten."],
  "next: building any teen.");

def(3,
  "The ten-frame turns any teen into a picture: the full frame is the ten, and the dots outside are the ones.",
  "Reading the picture is instant — nobody counts a full frame. Ten at a glance, then count only the extras.",
  { rep: "concrete", widget: (r) => TeenFrame(r),
    predict: P("A full frame and 5 loose dots — how do you read it?", [{ id: "on", label: "Ten at a glance, then count 5" }, { id: "all", label: "Count all fifteen dots one by one" }], "on",
      "The full frame is a known ten; counting it dot by dot wastes the frame's whole gift.") },
  [
    S(TeenFrame, "knb3-k1", H.ten, ["Fill nothing twice.", "Extras only."]),
    S(CountRead, "knb3-k2", H.ten, ["Frame plus extras.", "Say the teen."], 12, 17),
    S(TenPlusHop, "knb3-k3", H.ten, ["The line tells it too.", "Ten, then on."]),
    S(TeenFrame, "knb3-ch1", H.ten, ["Any teen, same build.", "Ten first."]),
  ],
  ["The full frame is the ten.", "Outside dots are the ones.", "Read ten at a glance, count only extras."],
  "next: the first three teens by name.");

def(4,
  "Eleven, twelve, thirteen — the odd-sounding teens. Their names hide it, but each is still ten and some: 10+1, 10+2, 10+3.",
  "Trust the numeral over the name: the left digit is the ten, the right digit counts the ones.",
  { rep: "concrete", widget: (r) => TeenFrame(r, 13),
    predict: P("Does \u201ctwelve\u201d contain a ten, even though the name hides it?", [{ id: "yes", label: "Yes — twelve is 10 + 2" }, { id: "no", label: "No — twelve is its own thing" }], "yes",
      "The name is old and strange, but the numeral 12 plainly writes one ten and two ones.") },
  [
    S(CountRead, "knb4-k1", H.ten, ["Numeral over name.", "Left digit is the ten."], 11, 13),
    A(TeenNameMcq, H.split, ["The 1 means ten.", "Read both digits' jobs."]),
    S(SeqBeforeHop, "knb4-k3", H.song, ["Step back through them.", "Twelve before thirteen."]),
    S(TeenFrame, "knb4-ch1", H.ten, ["Build one of the three.", "Ten and its extras."]),
  ],
  ["Eleven, twelve, thirteen hide their tens.", "The numeral shows it plainly.", "10+1, 10+2, 10+3."],
  "next: the -teen family.");

def(5,
  "Fourteen, fifteen, sixteen say their secret out loud: FOUR-teen, FIF-teen, SIX-teen — the ones first, then \u201cteen\u201d for the ten.",
  "Hear a -teen name and you already know the split: the front of the word counts the ones.",
  { rep: "concrete", widget: (r) => TeenFrame(r, 15),
    predict: P("What does the \u201cfour\u201d in fourteen count?", [{ id: "ones", label: "The four ones past the ten" }, { id: "tens", label: "Four tens" }], "ones",
      "The -teen ending carries the ten; the front of the word counts only the extras.") },
  [
    S(TeenFrame, "knb5-k1", H.ten, ["Hear the split.", "Build what the name says."]),
    S(CountRead, "knb5-k2", H.ten, ["Name, numeral, frame.", "All say ten-and-some."], 14, 16),
    S(TenPlusHop, "knb5-k3", H.ten, ["Walk the name.", "Ten, then the front number."]),
    S(SeqNext, "knb5-ch1", H.song, ["The teens climb by ones.", "Next name, next number."]),
  ],
  ["-teen means ten.", "The word's front counts the ones.", "Fourteen: four past ten."],
  "next: the biggest teens.");

def(6,
  "Seventeen, eighteen, nineteen fill the frame's neighbourhood almost to twenty. Nineteen is ten and nine — one dot shy of two full tens.",
  "The pattern holds to the very edge: left digit one ten, right digit the ones, all the way to 19.",
  { rep: "concrete", widget: (r) => TeenFrame(r, 18),
    predict: P("Nineteen is one more dot away from…", [{ id: "twenty", label: "20 — a second full ten" }, { id: "ten", label: "10 — back to one ten" }], "twenty",
      "Nine ones is a nearly-finished second frame; one more dot completes it at twenty.") },
  [
    S(TeenFrame, "knb6-k1", H.ten, ["Big ones counts.", "Still ten-and-some."]),
    S(CountRead, "knb6-k2", H.ten, ["Read to the edge.", "Ten and nine is nineteen."], 17, 19),
    S(SeqNextHop, "knb6-k3", H.song, ["Toward twenty.", "One hop at a time."]),
    S(DecomposeNot, "knb6-ch1", H.split, ["Check pairs by adding.", "One pair overshoots."], 18),
  ],
  ["The pattern holds to 19.", "Nineteen is ten and nine.", "One more makes a second ten."],
  "next: breaking teens apart.");

def(7,
  "Building runs backwards too: any teen BREAKS into its ten and its ones. Sixteen splits into 10 and 6, always.",
  "The split is not one choice among many — the ten-and-ones split is written into the numeral itself.",
  { rep: "concrete", widget: (r) => TeenFrame(r, 16),
    predict: P("Sixteen breaks into ten and…", [{ id: "six", label: "6 — the right digit" }, { id: "sixteen", label: "16 — it cannot break" }], "six",
      "The numeral stores the split: one ten on the left, six ones on the right.") },
  [
    S(DecomposeNot, "knb7-k1", H.split, ["Add each pair.", "One misses the whole."]),
    A(LeftoverOnesMcq, H.split, ["Inside: the ten.", "Outside: the ones."]),
    S(SeqBeforeHop, "knb7-k3", H.song, ["One back drops one one.", "The ten stays whole."]),
    S(DecomposeNot, "knb7-ch1", H.split, ["Splits must re-make the whole.", "Check by adding."]),
  ],
  ["Any teen breaks into ten and ones.", "The numeral stores the split.", "Adding the parts re-makes the whole."],
  "next: writing it as an equation.");

def(8,
  "The split can be WRITTEN: 15 = 10 + 5. The equals sign says both sides name one amount: teen, and ten-and-ones.",
  "One little equation carries the whole idea: whole on one side, ten and ones on the other.",
  { rep: "symbolic", widget: (r) => TeenFrame(r, 14),
    predict: P("Which equation matches a full ten and 4 more?", [{ id: "right", label: "10 + 4 = 14" }, { id: "wrong", label: "1 + 4 = 14" }], "right",
      "The left digit of 14 is a whole ten, so the true equation adds 10, not 1.") },
  [
    A(TeenEquationMcq, H.split, ["Whole equals parts.", "The ten is 10, not 1."]),
    S(MakeTen, "knb8-k2", H.split, ["First, pairs that make ten.", "Then ride the extras."]),
    S(TenPlusHop, "knb8-k3", H.split, ["The equation as a walk.", "Ten, then the ones."]),
    S(DecomposeNot, "knb8-ch1", H.split, ["Equations must balance.", "Add to check."]),
  ],
  ["15 = 10 + 5 writes the split.", "Equals means same amount.", "Whole on one side, parts on the other."],
  "next: counting the leftovers.");

def(9,
  "Fill a frame from a teen-sized pile and some dots will not fit. Those LEFTOVERS are exactly the ones digit, sorted out for you.",
  "Seventeen dots: ten vanish into the frame, seven remain outside. The 7 of 17 stands there in plain sight.",
  { rep: "concrete", widget: (r) => TeenFrame(r, 17),
    predict: P("17 dots meet a ten-frame. How many stay outside?", [{ id: "seven", label: "7 — the ones digit" }, { id: "none", label: "0 — they all fit" }], "seven",
      "The frame holds exactly ten; the ones digit counts everything past that.") },
  [
    A(LeftoverOnesMcq, H.split, ["The frame takes ten.", "Leftovers are the ones."]),
    S(CountRead, "knb9-k2", H.ten, ["Leftovers plus the frame.", "Read the teen."], 13, 18),
    S(TenPlusHop, "knb9-k3", H.split, ["Walk past ten by the leftovers.", "Land on the teen."]),
    A(WhichTeenMcq, H.split, ["Frame plus outsiders.", "Name the teen."]),
  ],
  ["Leftovers past the frame are the ones.", "The frame sorts the teen for you.", "17: ten inside, 7 outside."],
  "next: teens living on the line.");

def(10,
  "On the number line the teens are the stretch between 10 and 20 — every teen sits its ones-count of steps past the ten.",
  "Thirteen lives three steps past ten; eighteen, eight steps past. The line and the frame tell one story.",
  { rep: "diagram", widget: (r) => TenPlusHop(r),
    predict: P("Where does 13 live on the line?", [{ id: "past", label: "3 steps past 10" }, { id: "before", label: "3 steps before 10" }], "past",
      "The ones count the steps beyond the completed ten; teens all live to ten's right.") },
  [
    S(TenPlusHop, "knb10-k1", H.ten, ["Steps past ten.", "The ones count them."]),
    S(SeqNextHop, "knb10-k2", H.song, ["Neighbours one step apart.", "Forward is greater."]),
    S(SeqBeforeHop, "knb10-k3", H.song, ["Back toward ten.", "One less per hop."]),
    S(SeqNext, "knb10-ch1", H.song, ["The song runs the line.", "Teens climb by ones."]),
  ],
  ["Teens live between 10 and 20.", "The ones count steps past ten.", "Line and frame tell one story."],
  "next: naming a mystery teen.");

def(11,
  "Now run it in reverse: shown a frame-and-extras picture, NAME the teen. Count the extras, put \u201cten and\u201d in front, and the numeral appears.",
  "Full frame plus 6 outside? Ten and six — sixteen — 16. Picture to name to numeral, one straight path.",
  { rep: "concrete", widget: (r) => TeenFrame(r),
    predict: P("Full frame, 6 dots outside. Which teen?", [{ id: "sixteen", label: "16 — ten and six" }, { id: "six", label: "6 — count the outsiders only" }], "sixteen",
      "The outsiders ride on a finished ten; the name must carry both parts.") },
  [
    A(WhichTeenMcq, H.split, ["Extras first.", "Then \u201cten and\u201d."]),
    S(CountRead, "knb11-k2", H.ten, ["Picture to numeral.", "Both digits have jobs."], 11, 19),
    S(SeqBeforeHop, "knb11-k3", H.song, ["Check against neighbours.", "One back, one less."]),
    S(TeenFrame, "knb11-ch1", H.ten, ["Build the one you named.", "Ten and its extras."]),
  ],
  ["Count the extras, say \u201cten and\u201d.", "Picture, name, numeral — one path.", "Both digits have jobs."],
  "next: teens out in the world.");

def(12,
  "Teens hide everywhere: an egg tray of 10 with 2 beside it, a pack plus spares. Spot the ready ten; the count is nearly done.",
  "That is the teen habit for life: find the ten, count the extras, and read the number whole.",
  { rep: "concrete", widget: (r) => TeenFrame(r),
    predict: P("A ten-tray of eggs and 2 loose ones. Fastest true count?", [{ id: "twelve", label: "Ten and 2 — twelve" }, { id: "count", label: "Count all twelve one by one" }], "twelve",
      "The tray is a ready-made ten; only the loose eggs need counting.") },
  [
    A(TeensAroundMcq, H.ten, ["Spot the ready ten.", "Add the spares."]),
    S(MakeTen, "knb12-k2", H.split, ["Tens are built from pairs.", "Then extras ride."]),
    S(TenPlusHop, "knb12-k3", H.ten, ["Walk it on the line.", "Ten, then the spares."]),
    S(DecomposeNot, "knb12-ch1", H.split, ["Split any teen you meet.", "Add to check."]),
  ],
  ["Teens hide in trays and packs.", "Spot the ten, count the extras.", "The habit lasts a lifetime."],
  "course complete: every teen is ten-and-some.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 12, `12 lessons defined, got ${L.length}`);
const chapterTitles = ["Ten and Some More", "Every Teen by Name", "Split, Write, Spot"];
const perChapter = [4, 4, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 8 ? 2 : 3);
const outDir = join(root, "content/courses/teen-numbers-k");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seqN = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `knb-0${ch}-${String(seqN).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev.length >= 2 ? c.ev : [...c.ev, "Find the ten, count the extras — every teen is ten-and-some."],
      widget: c.widget, hints: c.hints, cml: cml(tag, "concrete") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const mkI = d.i1.widget;
  const i1r = mulberry32(seedFromString(`knb-i1-${idx}`));
  const i2r = mulberry32(seedFromString(`knb-i2-${idx}`));
  const i1out = mkI(i1r), i2out = mkI(i2r);
  const i1w = i1out.widget ?? i1out;
  const i2w = i2out.widget ?? i2out;
  const lesson = {
    id, slug, title: row.title, courseId: "teen-numbers-k",
    chapterId: chapters[ch - 1].id, minutes: 6, readingProfile: "early",
    steps: [
      { id: "c1", kind: "concept", figure: "count-on-hops", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: "Try it.", conceptTag: tag, widget: i1w, predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      stepFromCheck("k1", d.checks[0]),
      { id: "c2", kind: "concept", figure: "count-on-hops", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: "Try it again.", conceptTag: tag, widget: i2w, cml: cml(tag, "concrete") },
      stepFromCheck("k2", d.checks[1]),
      stepFromCheck("k3", d.checks[2]),
      stepFromCheck("ch1", d.checks[3], "challenge"),
      { id: "r1", kind: "recap", body: "You did it!", takeaways: d.recap, teaser: d.teaser },
    ],
    remedials: [{
      conceptTag: tag,
      concept: { id: `rem-${tag}-c`, kind: "concept", body: d.c2, narration: d.c2 },
      check: { id: `rem-${tag}-k`, kind: "check", body: "", conceptTag: tag,
        explanationVariants: d.checks[0].ev.length >= 2 ? d.checks[0].ev : [...d.checks[0].ev, "Find the ten, count the extras."],
        widget: d.checks[0].widget },
    }],
  };

  must(lesson.steps[1].predict, `${id}: i1 must carry a predict step`);
  must(lesson.steps.some((s) => s.widget?.type === "numberLineHop"),
    `${id}: needs a numberLineHop — the only K engine rated adapt 3`);
  const wc = (t) => t.split(/\s+/).filter(Boolean).length;
  for (const s of lesson.steps) {
    if (s.kind === "concept") must(wc(s.body) <= 25, `${id}/${s.id}: concept body ${wc(s.body)} words > early cap 25`);
    const w = s.widget;
    if (!w) continue;
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1 && w.options.length >= 4, `${id}/${s.id} mcq shape`);
      must(w.options[0].correct === true, `${id}/${s.id} correct at index 0`);
      for (const o of w.options) must(o.feedback.length >= 25, `${id}/${s.id} feedback short`);
    }
    if (w.type === "numberLineHop") {
      const land = w.direction === "back" ? w.start - w.hop * w.hops : w.start + w.hop * w.hops;
      must(land > w.min && land < w.max, `${id}/${s.id} hop landing at the edge`);
      must(w.commonLandings.length >= 2, `${id}/${s.id} hop needs 2 traps`);
    }
    if (w.type === "tenFrame") {
      must(w.target >= 1 && w.target <= 9, `${id}/${s.id} teen frame target must be the ONES (1-9)`);
      const m = w.prompt.match(/make (\d+)\.$/);
      must(m && Number(m[1]) === 10 + w.target, `${id}/${s.id}: teen prompt must agree with target+10`);
      must(w.commonCounts.length >= 2, `${id}/${s.id} tenFrame traps`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "teen-numbers-k", slug: "teen-numbers-k", title: spec.title,
  tagline: "Every teen is ten-and-some.",
  category: "Math", gradeLevel: 0, chapters,
}, null, 2) + "\n");
console.log(`built 12 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
