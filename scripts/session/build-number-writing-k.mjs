#!/usr/bin/env node
// S198 — Batch G course 4/6: number-writing-k (K.CC.A.3). Zero new generator code.
//
// The writing standard is really the numeral<->quantity link: a numeral is a written promise about
// an amount. So i1 builds the amount (tenFrame / countTeenFrame) or finds it (countZeroTap ->
// tapDiagram, manip 2 — zero's lesson gets a genuinely manipulable "find the empty plate"), and the
// checks read numerals back (countReadMcq/Flash, countObjectsMcq). Teens reuse the countTeenFrame
// contract from course 3 (target = teen − 10, exact prompt shape).
//
// countZeroTap solver encoding: `prompt||label,label,label`, hotspot count = first number in the
// label (no number -> 0), so labels must be comma-free and carry their counts as digits, except
// the zero plate whose label stays digit-free.
//
// All-A recipe: predict on i1 + two diagnostic traps per graded widget + >=1 numberLineHop per
// lesson. Concept bodies written TO the 25-word "early" cap.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "number-writing-k");
if (!spec || spec.lessons.length !== 14) throw new Error("spec course missing or wrong size");

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
const FLASH_T = corpusTemplate("subitizeFlash", "counting-to-20-k");
const TAP_T = corpusTemplate("tapDiagram", "shapes-and-sorting-k");

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
const NAMES = ["Mina", "Ravi", "Tally", "Noor", "Kai", "Lena"];
const choose = (r, xs) => xs[pick(r, 0, xs.length - 1)];
const seq = (n) => Array.from({ length: n }, (_, i) => i + 1).join(", ");

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

/* ---------------- solver-backed forms ---------------- */
function Read(r, lo = 2, hi = 9) {
  const n = pick(r, lo, hi);
  const near = [n + 1, n - 1 >= 0 ? n - 1 : n + 2, n + 2].map(String);
  return mcqStep(`A group shows ${n} dots. Which numeral names that amount?`,
    String(n), [...new Set(near)].filter((x) => x !== String(n)).slice(0, 3),
    Object.assign(
      { [String(n)]: `Correct — the numeral ${n} is the written name for a group of exactly ${n}.` },
      Object.fromEntries([...new Set(near)].filter((x) => x !== String(n)).slice(0, 3).map((x) => [x,
        Number(x) > n
          ? `${x} promises more dots than the group holds; the count stops at ${n}.`
          : `${x} promises fewer dots than the group holds; the count reaches ${n}.`]))),
    "g0-counting", "countReadMcq");
}
function CountObjects(r, lo = 3, hi = 9) {
  const n = pick(r, lo, hi), name = choose(r, NAMES);
  return mcqStep(`${name} counts her blocks: ${seq(n)}. How many blocks does she have?`,
    String(n), [String(n + 1), String(n - 1), String(n + 2)],
    { [String(n)]: `Correct — the last number said, ${n}, is the one the numeral must record.`,
      [String(n + 1)]: `The count stopped at ${n}; writing one more would record a block that is not there.`,
      [String(n - 1)]: `That records one too few — the count reached ${n}, so the numeral must too.`,
      [String(n + 2)]: `That runs two past the count; the written numeral copies the last word said, ${n}.` },
    "g0-counting", "countObjectsMcq");
}
function ReadFlash(r) {
  const count = pick(r, 4, 9);
  const w = structuredClone(FLASH_T);
  w.prompt = "Look at the ten-frame flash and choose the matching numeral.";
  w.count = count; w.arrangement = "tenFrame"; w.flashMs = 1400;
  const opts = [count - 1, count, count + 1, count + 2].filter((v) => v >= 1);
  while (opts.length < 4) opts.push(count + opts.length);
  w.options = opts;
  must(new Set(w.options).size === w.options.length && w.options.includes(count), "flash options invalid");
  w.commonPicks = [
    { value: count - 1, feedback: `${count - 1} misses 1 of the visible dots. Group the dots, then count the full group as ${count}.` },
    { value: count + 1, feedback: `${count + 1} counts 1 extra. Touch each dot once in your mind — the group holds ${count}.` },
  ].filter((p) => w.options.includes(p.value));
  must(w.commonPicks.length >= 1, "flash needs a wrong pick");
  return { widget: w, variant: { gen: "g0-counting", form: "countReadFlash" } };
}
function MakeTen(r) {
  const a = pick(r, 1, 9), b = 10 - a;
  const correct = `${a} and ${b}`;
  const uniqSet = new Set([`${a} and ${b - 1 >= 1 ? b - 1 : b + 2}`, `${a + 1} and ${b}`, `${a} and ${b + 1}`]);
  uniqSet.delete(correct);
  const uniq = [...uniqSet].slice(0, 3);
  while (uniq.length < 3) uniq.push(`${a + uniq.length + 1} and ${b + 1}`);
  const fb = { [correct]: `Correct — ${a} + ${b} = 10, one complete frame with nothing missing and nothing spare.` };
  for (const l of uniq) {
    const [x, y] = l.split(" and ").map(Number);
    fb[l] = `${x} + ${y} = ${x + y}, which ${x + y > 10 ? "spills past a full frame of 10" : "leaves gaps in a full frame of 10"}.`;
  }
  return mcqStep("Which pair makes exactly 10?", correct, uniq, fb, "g0-counting", "countMakeTenMcq");
}

/* ---------------- hops ---------------- */
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
function SeqNextHop(r, lo = 3, hi = 17) {
  const n = pick(r, lo, hi);
  return hopBase(`What number comes right after ${n}? Hop one and tap where you land.`,
    n - 3, n + 4, n, 1, "forward", n + 1,
    `${n + 1} — the next numeral in the writing order is the next number in the song.`,
    [[n, `${n} stops one complete hop too soon. Continue the final 1-unit hop to reach ${n + 1}.`],
     [n + 2, `${n + 2} goes one complete hop too far. One hop from ${n} lands on ${n + 1}.`]],
    `Short of the landing — a single hop forward reaches ${n + 1}.`,
    `Past the landing — right after ${n} means one hop, stopping on ${n + 1}.`,
    "k0-count-100", "kSeqNextHop");
}
function SeqBeforeHop(r, lo = 6, hi = 18) {
  const n = pick(r, lo, hi);
  return hopBase(`What number comes right before ${n}? Hop one back and tap where you land.`,
    n - 4, n + 3, n, 1, "back", n - 1,
    `${n - 1} — the numeral written just before ${n} names one less.`,
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
    `10 and ${h} more is ${land} — the teen numeral writes exactly that: 1 ten, ${h} ones.`,
    [[land - 1, `${land - 1} stops one complete hop too soon. Continue the final 1-unit hop to reach ${land}.`],
     [land + 1, `${land + 1} goes one complete hop too far. Count just ${h} hops from 10 to land on ${land}.`]],
    `Short of the landing — all ${h} counts past ten are needed to reach ${land}.`,
    `Past the landing — the count-on stops after ${h} numbers, on ${land}.`,
    "k0-count-100", "kCountFromHop");
}

/* ---------------- countZeroTap: tapDiagram, comma-free labels carrying digit counts ---------------- */
function ZeroTap() {
  const w = structuredClone(TAP_T);
  w.prompt = "Tap the plate that shows zero cookies.";
  w.mode = "selectOne";
  w.canvas = { w: 3, h: 1 };
  w.hotspots = [
    { id: "g0", x: 17, y: 50, label: "plate with 4 cookies", icon: "🍪", count: 4, correct: false,
      feedback: "This plate shows 4 cookies. Zero means an empty plate with no cookies at all." },
    { id: "g1", x: 50, y: 50, label: "empty plate", icon: "🍪", count: 0, correct: true },
    { id: "g2", x: 83, y: 50, label: "plate with 2 cookies", icon: "🍪", count: 2, correct: false,
      feedback: "This plate shows 2 cookies. A plate showing zero would have nothing on it to count." },
  ];
  for (const h of w.hotspots) must(!h.label.includes(","), "tap labels must be comma-free for the solver encoding");
  must(w.hotspots.filter((h) => h.correct).length === 1 && w.hotspots.find((h) => h.correct).count === 0, "zero tap correct");
  return { widget: w, variant: { gen: "g0-counting", form: "countZeroTap" } };
}

/* ---------------- tenFrame builders ---------------- */
function frame(prompt, target, success, traps, miss) {
  const w = structuredClone(FRAME_T);
  w.prompt = prompt; w.target = target; w.preFilled = 0; w.addColor = "sky";
  must(target >= 1 && target <= 10, `tenFrame target ${target} outside the frame`);
  w.successFeedback = success; w.missFeedback = miss;
  w.commonCounts = traps.map(([count, feedback]) => {
    must(count !== target && count >= 0 && count <= 10, `tenFrame trap ${count} invalid`);
    must(feedback.length >= 25, "tenFrame trap feedback short");
    return { count, feedback };
  });
  must(w.commonCounts.length >= 2, "tenFrame needs 2 traps");
  return w;
}
function TeenFrame(teen) {
  must(teen >= 13 && teen <= 19, `countTeenFrame band is 13..19; got ${teen}`);
  const t = teen - 10;
  const w = structuredClone(FRAME_T);
  w.prompt = `A full group of 10 is already shown. Add the extra dots needed to make ${teen}.`;
  w.target = t; w.preFilled = 0; w.addColor = "tangerine";
  const traps = [
    [0, `0 leaves ${t} dots still missing. Continue until the frame shows exactly ${t}.`],
    [t - 1, `${t - 1} leaves 1 dot still missing. Continue until the frame shows exactly ${t}.`],
  ];
  if (t + 1 <= 10) traps.push([t + 1, `${t + 1} adds 1 too many. Remove the extra so the frame shows exactly ${t}.`]);
  w.commonCounts = traps.filter(([c]) => c >= 0 && c !== t).map(([count, feedback]) => ({ count, feedback }));
  must(w.commonCounts.length >= 2, "teen frame needs 2 traps");
  w.missFeedback = `The ten is already made; add only the ones. Stop when the frame shows ${t}.`;
  w.successFeedback = `Ten and ${t} — the numeral ${teen} writes those two pieces side by side.`;
  return { widget: w, variant: { gen: "g0-counting", form: "countTeenFrame" } };
}

/* ---------------- authored MCQs ---------------- */
const authored = (prompt, opts) => {
  must(opts.length >= 4 && opts[0][1], "authored mcq shape");
  return mcqStep(prompt, opts[0][0], opts.slice(1).map((o) => o[0]),
    Object.fromEntries(opts.map(([l, , f]) => [l, f])), null, null);
};
const NumeralPromiseMcq = () => authored("What is a written numeral, really?", [
  ["A promise about how many", true, "Correct — write 3 and you promise a count of three; the mark stands for the amount."],
  ["A little drawing of the things", false, "The numeral 3 looks nothing like three apples — it names the amount, not the objects."],
  ["A decoration for the page", false, "Numerals carry meaning: change the mark and you change the promised amount."],
  ["A letter of the alphabet", false, "Letters build words; numerals name counts — two different writing systems."]]);
const StrokeOrderMcq = () => authored("Why practise writing each numeral the same way every time?", [
  ["So the hand learns it and the numeral stays readable", true, "Correct — a practised stroke path makes numerals quick to write and easy for others to read."],
  ["Because there is only one legal way", false, "Other paths exist, but a settled one trains the hand fastest and keeps shapes consistent."],
  ["To make writing slower", false, "Practice speeds writing up — the settled path becomes automatic."],
  ["It does not matter at all", false, "Wobbly, changing shapes get misread — a 6 that drifts can be taken for a 0."]]);
const ReversalMcq = () => authored("A numeral written backwards, like a flipped 3 — what is the risk?", [
  ["It may be misread or look like another mark", true, "Correct — numerals are shapes with a direction; flipping one blurs its identity to a reader."],
  ["The amount it names changes", false, "The writer still MEANS three; the danger is the reader, who sees an unclear mark."],
  ["Nothing — any direction works", false, "Direction is part of the shape: readers rely on it to tell numerals apart."],
  ["The paper must be thrown away", false, "Just write it again the right way round — practice, not punishment."]]);
const SixNineMcq = () => authored("6 and 9 look like the same shape turned around. What tells them apart?", [
  ["Which way up the loop sits", true, "Correct — 6 carries its loop at the bottom, 9 at the top; orientation IS the difference."],
  ["Their colour", false, "Numerals have no fixed colour; only the shape and its orientation distinguish them."],
  ["Their size on the page", false, "A big 6 is still 6; size never separates numerals."],
  ["Nothing — they are the same", false, "They name different amounts three apart; the turned loop is the whole signal."]]);
const ZeroMeansMcq = () => authored("What does the numeral 0 promise?", [
  ["Nothing to count — an empty group", true, "Correct — zero is the written name for none at all: an empty plate, an empty frame."],
  ["A very small amount", false, "Small still means SOME; zero means the counting never starts."],
  ["A circle shape", false, "The mark is round, but its meaning is emptiness, not geometry."],
  ["Ten", false, "Ten is written 10 — a one and a zero together; zero alone names none."]]);
const TenTwoDigitsMcq = () => authored("Why does writing ten take TWO marks — 1 and 0?", [
  ["The 1 names a full ten and the 0 says no extras", true, "Correct — 10 is a report: one complete ten, zero ones left over."],
  ["Ten is too big for one mark", false, "It is not about size — the two marks REPORT the ten-and-ones structure."],
  ["The 0 is decoration", false, "Drop the 0 and the mark reads as one; the 0 holds the ones place open."],
  ["It is a mistake we keep", false, "The two-mark form is the system working: place tells each digit its job."]]);
const OrderMattersMcq = () => authored("12 and 21 use the same two digits. Same number?", [
  ["No — position gives each digit its job", true, "Correct — in 12 the 1 is a ten; in 21 the 2 is two tens. Order is meaning."],
  ["Yes — same digits, same number", false, "Swap the digits and the tens digit changes: twelve becomes twenty-one."],
  ["Only on Tuesdays", false, "Place value never takes a day off; position always assigns the jobs."],
  ["12 is bigger", false, "21 holds two full tens against 12's one — the swap made it BIGGER."]]);
const TeenPatternMcq = () => authored("What do the numerals 13 through 19 all share?", [
  ["A 1 in front — the full ten each teen carries", true, "Correct — every teen numeral opens with 1 because every teen contains exactly one ten."],
  ["A 9 somewhere", false, "Only 19 holds a 9; the shared mark is the leading 1, the written ten."],
  ["Round shapes", false, "Shape varies; the pattern is positional — the tens place says 1 throughout."],
  ["Nothing at all", false, "Line them up and the leading 1 repeats — the teens wear their ten openly."]]);
const TwentyMcq = () => authored("What does the numeral 20 report?", [
  ["Two full tens and no extras", true, "Correct — the 2 counts complete tens, the 0 says the ones place is empty."],
  ["A two and a nothing", false, "The 0 is not nothing — it holds the ones place open so the 2 can mean tens."],
  ["Twelve", false, "Twelve is 12 — one ten and two ones; 20 doubles the tens and empties the ones."],
  ["Two", false, "Alone the 2 would mean two; the 0 beside it promotes it to two TENS."]]);
const ShowAmountMcq = () => authored("The card says 7. What does \u201cshow that many\u201d ask you to do?", [
  ["Build a group the numeral truly names — exactly 7", true, "Correct — reading runs backwards here: the numeral is the order, the group is your answer."],
  ["Write the numeral bigger", false, "Size of writing is not amount; the task wants seven real things."],
  ["Show any group you like", false, "The numeral fixes the count — seven exactly, not roughly."],
  ["Say the word seven aloud", false, "Saying helps, but showing means a countable group of seven things."]]);
const DrawCountMcq = () => authored("Asked to draw 5 circles, when should you stop drawing?", [
  ["The moment the count of drawings says 5", true, "Correct — count as you draw; the numeral 5 is the stopping rule."],
  ["When the page is full", false, "The page's size is not the rule; the numeral 5 is."],
  ["After 10, to be safe", false, "Extra circles break the promise — the drawing must match the numeral exactly."],
  ["Never — keep drawing", false, "A drawing that never stops shows no number at all; 5 means stop at five."]]);
const ThreeFormsMcq = () => authored("Numeral 4, the word \u201cfour\u201d, and a picture of 4 dots — how are they related?", [
  ["Three ways of writing one same amount", true, "Correct — mark, word, and picture all name the identical count of four."],
  ["Three different numbers", false, "They differ in costume only; underneath, each says exactly four."],
  ["The picture is the biggest", false, "Pictures take more space, but space is not amount — all three say four."],
  ["Only the numeral is real", false, "All three are real names; the numeral is just the fastest to write."]]);

const H = {
  write: ["The numeral records the count.", "Last number said, first mark written.", "Match mark to amount."],
  shape: ["Shapes have directions.", "Practise one path.", "Readable beats fancy."],
  teen: ["Teens open with 1.", "The 1 is a ten.", "Ones digit counts extras."],
  zero: ["Zero means none.", "An empty group.", "Still a number."],
};

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Link the written numeral to the exact amount it names for ${tag.replace(/-/g, " ")}.`,
  invariants: [`A numeral is a written promise about an amount: it records the last word of a careful count, position gives each digit its job, and the promise survives any change of objects or arrangement — the anchor for ${tag.replace(/-/g, " ")}.`],
  misconceptions: [`Treating numerals as decorations, reading digit pairs without position, or matching a numeral to roughly rather than exactly its amount.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `number-writing-k:${tag}`, delayed: true,
  counterfactualPrompt: "If one more thing joined the group, which single mark of the numeral would have to change?",
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
  return { ...out, hints, ev };
};

def(1,
  "A numeral is a promise written down: make the mark 3 and you promise an amount of three. Writing starts with 1, 2, 3.",
  "Each mark has one practised path — the hand learns it, and the numeral comes out readable every time.",
  { rep: "concrete", widget: () => frame("Show what the numeral 3 promises — build its amount.", 3,
      "Three — the mark 3 and this group say the same thing in two languages.",
      [[2, "Two falls short of the promise; the mark 3 names one more than this."],
       [4, "Four overshoots the promise; the mark 3 stops the count at three."]],
      "Read the numeral, then build exactly that many."),
    predict: P("The mark 3 is written on a card. What does it promise?", [{ id: "amount", label: "An amount of three" }, { id: "shape", label: "Just a curly shape" }], "amount",
      "Numerals are names for amounts — the shape carries a count inside it.") },
  [
    A(NumeralPromiseMcq, H.write, ["Marks name amounts.", "3 promises three."]),
    S(Read, "kcw1-k2", H.write, ["Match mark to group.", "Count, then choose."], 1, 3),
    S(SeqNextHop, "kcw1-k3", H.write, ["1, 2, 3 in order.", "One hop each."], 1, 3),
    S(CountObjects, "kcw1-ch1", H.write, ["Count first.", "The last word is the mark."], 3, 5),
  ],
  ["A numeral promises an amount.", "3 names three, always.", "One practised path per mark."],
  "next: the marks 4, 5, 6.");

def(2,
  "Next come 4, 5, and 6. New shapes, same promise: each mark names its own amount, one more than the mark before.",
  "Watch 6 — its loop sits at the bottom. Turned over it turns into 9, a different promise entirely.",
  { rep: "concrete", widget: () => frame("Build the amount the numeral 5 promises.", 5,
      "Five — a full row of the frame, and the mark 5 names exactly it.",
      [[4, "Four leaves one square of the row empty; the mark 5 asks for the full row."],
       [6, "Six spills past the row; the mark 5 stops at five."]],
      "The numeral fixes the count: exactly five, no more, no fewer."),
    predict: P("Which mark can 6 be mistaken for, turned upside-down?", [{ id: "nine", label: "9" }, { id: "zero", label: "0" }], "nine",
      "6 and 9 are one shape in two orientations — which way the loop sits decides.") },
  [
    A(SixNineMcq, H.shape, ["Loop low is 6.", "Loop high is 9."]),
    S(Read, "kcw2-k2", H.write, ["Count the dots.", "Choose the matching mark."], 4, 6),
    S(SeqNextHop, "kcw2-k3", H.write, ["4, 5, 6 climb by ones.", "Hop the line."], 4, 6),
    S(CountObjects, "kcw2-ch1", H.write, ["Careful count first.", "Then the numeral."], 4, 6),
  ],
  ["4, 5, 6 — new shapes, same promises.", "6 wears its loop low.", "Orientation is part of the mark."],
  "next: 7, 8, 9.");

def(3,
  "The single marks finish with 7, 8, 9. Nine is the last amount one mark can name — the next number will need two.",
  "A flipped or backwards mark risks being misread; the reader only has the shape, so the shape must be right.",
  { rep: "concrete", widget: () => frame("Build the amount the numeral 8 promises.", 8,
      "Eight — the mark's double loop names this exact count.",
      [[7, "Seven is one short of the promise; the mark 8 names one more."],
       [9, "Nine overshoots; the mark 8 stops the count at eight."]],
      "Match the mark exactly: eight dots, then stop."),
    predict: P("What comes after 9, the last single mark?", [{ id: "two", label: "A number needing TWO marks" }, { id: "none", label: "Nothing — counting ends" }], "two",
      "Counting never ends; the writing system simply switches to two-mark numerals at ten.") },
  [
    A(ReversalMcq, H.shape, ["Readers see only the shape.", "Write it the right way round."]),
    S(Read, "kcw3-k2", H.write, ["Count, then pick.", "Exact match only."], 7, 9),
    S(SeqBeforeHop, "kcw3-k3", H.write, ["Step back through 9, 8, 7.", "One hop down."], 8, 9),
    S(ReadFlash, "kcw3-ch1", H.write, ["Quick look, then the mark.", "Rows of five help."]),
  ],
  ["7, 8, 9 close the single marks.", "Nine is the last one-mark amount.", "Backwards marks get misread."],
  "next: the strangest marks — zero and ten.");

def(4,
  "Two special numerals: 0 promises NOTHING to count, and 10 uses two marks — a 1 for the full ten, a 0 for no extras.",
  "Zero is a real number, not a blank: an empty plate has a count, and 0 writes it.",
  { rep: "concrete", widget: ZeroTap,
    predict: P("A plate with no cookies — does it have a count?", [{ id: "yes", label: "Yes — zero" }, { id: "no", label: "No count at all" }], "yes",
      "Emptiness is countable: the count is zero, and the mark 0 records it.") },
  [
    A(ZeroMeansMcq, H.zero, ["Zero names none.", "Empty, but counted."]),
    A(TenTwoDigitsMcq, H.teen, ["1 ten, 0 ones.", "Two marks, one report."]),
    S(TenPlusHop, "kcw4-k3", H.teen, ["Ten sits past nine.", "Count on to reach it."], 2),
    S(Read, "kcw4-ch1", H.write, ["Every group has a mark.", "Match it exactly."], 6, 9),
  ],
  ["0 promises an empty group.", "10 reports one ten, no extras.", "Two marks, one number."],
  "next: matching numerals to groups.");

def(5,
  "Matching runs both directions: from a group, count and pick its numeral; from a numeral, read and find its group.",
  "The match must be exact. A numeral never means roughly — 7 refuses a group of six.",
  { rep: "concrete", widget: () => frame("The card shows 6. Build the group it names.", 6,
      "Six — numeral and group agree exactly, which is what matching means.",
      [[5, "Five leaves the promise unmet; the card's 6 asks for one more."],
       [7, "Seven breaks the promise upward; 6 refuses any extras."]],
      "Read the card, build exactly that count."),
    predict: P("The card says 7 and the group holds 6. A match?", [{ id: "no", label: "No — exact or nothing" }, { id: "close", label: "Close enough" }], "no",
      "Numerals are exact promises; one missing thing breaks the match.") },
  [
    S(Read, "kcw5-k1", H.write, ["Count the group.", "Pick its exact mark."], 3, 9),
    S(ReadFlash, "kcw5-k2", H.write, ["Fast matching.", "Frame rows help."]),
    S(SeqNextHop, "kcw5-k3", H.write, ["Neighbouring numerals.", "One apart on the line."], 4, 12),
    S(Read, "kcw5-ch1", H.write, ["Both directions.", "Exact match only."], 5, 9),
  ],
  ["Matching runs both directions.", "Group to numeral, numeral to group.", "Exact — never roughly."],
  "next: writing what you count.");

def(6,
  "Write how many: count the group carefully, and the numeral you write is the last number you said. Counting and writing join hands.",
  "Never write before the count finishes — the numeral copies the count's final word, not a guess.",
  { rep: "concrete", widget: () => frame("Count the group of 9, then show the amount your numeral must record.", 9,
      "Nine — the count ended there, so the written mark must say 9.",
      [[8, "The count did not stop at eight; one more dot carried it to nine."],
       [10, "Ten overshoots the count; the numeral copies the last word said, nine."]],
      "Count to the end first; the final word is the mark to write."),
    predict: P("You count 1 to 9. Which numeral do you write?", [{ id: "nine", label: "9 — the last word said" }, { id: "one", label: "1 — the first word" }], "nine",
      "The written numeral records where the count FINISHED, not where it began.") },
  [
    S(CountObjects, "kcw6-k1", H.write, ["Count to the end.", "Write the last word."], 5, 9),
    S(Read, "kcw6-k2", H.write, ["Check the match.", "Mark equals amount."], 4, 9),
    S(SeqBeforeHop, "kcw6-k3", H.write, ["One fewer, one back.", "The numeral steps down."], 7, 12),
    S(CountObjects, "kcw6-ch1", H.write, ["Bigger groups, same rule.", "Finish, then write."], 6, 9),
  ],
  ["Count first, write second.", "The numeral copies the last word.", "Never write a guess."],
  "next: writing the teens.");

def(7,
  "Teen numerals take two marks: a 1 in front for the full ten, and a second digit counting the extras. 14 reports ten-and-four.",
  "The leading 1 is not a one — position makes it a ten. That is the whole trick of two-mark writing.",
  { rep: "concrete", widget: () => TeenFrame(14).widget, variant: TeenFrame(14).variant,
    predict: P("Writing fourteen — what does the front 1 stand for?", [{ id: "ten", label: "One full ten" }, { id: "one", label: "Just one" }], "ten",
      "Position gives the digit its job: in front of another digit, 1 reports a complete ten.") },
  [
    A(TeenPatternMcq, H.teen, ["Every teen opens with 1.", "That 1 is the ten."]),
    S(TenPlusHop, "kcw7-k2", H.teen, ["Ten, then the extras.", "The numeral writes the trip."], 4),
    S(Read, "kcw7-k3", H.teen, ["Read teens as ten-and-some.", "Match exactly."], 11, 19),
    S(SeqNextHop, "kcw7-ch1", H.teen, ["Teens climb by ones.", "Only the ones digit moves."], 11, 17),
  ],
  ["Teen numerals take two marks.", "The front 1 is a full ten.", "The second digit counts extras."],
  "next: the two tricky teens.");

def(8,
  "Eleven and twelve are the tricky teens: their names hide the ten. No \u201cteen\u201d sound — yet 11 and 12 still write ten-and-one, ten-and-two.",
  "Trust the numeral over the name: the leading 1 says the ten is there, whatever the word sounds like.",
  { rep: "diagram", widget: () => S(TenPlusHop, "kcw8-i1", [], [], 2).widget,
    predict: P("Does eleven contain a full ten, though its name hides it?", [{ id: "yes", label: "Yes — 11 writes ten-and-one" }, { id: "no", label: "No — no ten inside" }], "yes",
      "The name is irregular but the numeral is honest: the leading 1 reports the ten.") },
  [
    A(OrderMattersMcq, H.teen, ["12 and 21 differ.", "Position is the job."]),
    S(TenPlusHop, "kcw8-k2", H.teen, ["Ten and one, ten and two.", "Hop past ten."], 1 + 1),
    S(Read, "kcw8-k3", H.teen, ["Read 11 and 12 as teens.", "Ten hides in the name only."], 11, 12),
    S(SeqBeforeHop, "kcw8-ch1", H.teen, ["Twelve back to eleven.", "One hop down."], 12, 13),
  ],
  ["Eleven and twelve hide their ten in the name.", "The numeral shows it anyway.", "Trust the leading 1."],
  "next: thirteen through nineteen.");

def(9,
  "From 13 to 19 the pattern is plain: the ones digit climbs 3, 4, 5, 6, 7, 8, 9 while the front 1 never moves.",
  "Write any of them the same way — a 1 for the ten, then the extras' own digit beside it.",
  { rep: "concrete", widget: () => TeenFrame(16).widget, variant: TeenFrame(16).variant,
    predict: P("From 13 up to 19, which digit changes?", [{ id: "ones", label: "Only the ones digit" }, { id: "tens", label: "The front 1" }], "ones",
      "One ten serves the whole stretch; only the count of extras climbs.") },
  [
    S(Read, "kcw9-k1", H.teen, ["Front 1 steady.", "Extras name the teen."], 13, 19),
    S(TenPlusHop, "kcw9-k2", H.teen, ["Hops past ten = ones digit.", "Count them."], 6),
    A(TeenPatternMcq, H.teen, ["The shared 1.", "The written ten."]),
    S(ReadFlash, "kcw9-ch1", H.write, ["Quick teen reading.", "Row of five, then extras."]),
  ],
  ["13 to 19: the ones digit climbs.", "The front 1 stands still.", "One writing recipe covers them all."],
  "next: writing twenty.");

def(10,
  "Twenty ends the stretch: the extras finally fill a second ten, and the numeral resets — 2 for two tens, 0 for no extras.",
  "20 echoes 10's shape: tens digit, then a 0 holding the empty ones place open.",
  { rep: "diagram", widget: () => S(SeqNextHop, "kcw10-i1", [], [], 17, 17).widget,
    predict: P("After 19 comes 20. What happened to the nine extras?", [{ id: "closed", label: "One more closed them into a second ten" }, { id: "lost", label: "They vanished" }], "closed",
      "Ten extras stop being extras — they bind into a complete second ten, and the ones place empties.") },
  [
    A(TwentyMcq, H.teen, ["2 tens, 0 ones.", "The report resets."]),
    S(MakeTen, "kcw10-k2", H.teen, ["Pairs that close a ten.", "Full frames."]),
    S(SeqNextHop, "kcw10-k3", H.write, ["19 to 20, one hop.", "The teens end."], 18, 19),
    A(TenTwoDigitsMcq, H.teen, ["10 and 20 rhyme in shape.", "Tens digit plus 0."]),
  ],
  ["Twenty closes the teens.", "2 tens, 0 extras.", "The 0 keeps the ones place open."],
  "next: writing teen counts.");

def(11,
  "Write how many, teen edition: claim the full ten at sight, count on the extras, and write both pieces — 1 then the extras' digit.",
  "The count-on IS the ones digit: ten… then four more hops means the numeral ends in 4.",
  { rep: "concrete", widget: () => TeenFrame(17).widget, variant: TeenFrame(17).variant,
    predict: P("A full frame plus 7 loose dots. The numeral you write is…", [{ id: "sev", label: "17 — ten and seven" }, { id: "sevonly", label: "7 — the loose ones" }], "sev",
      "The frame's ten belongs in the numeral too — the leading 1 records it.") },
  [
    S(Read, "kcw11-k1", H.teen, ["Ten at sight.", "Extras finish the numeral."], 13, 19),
    S(TenPlusHop, "kcw11-k2", H.teen, ["Hops past ten.", "They become the ones digit."], 7),
    S(CountObjects, "kcw11-k3", H.write, ["Careful counting still rules.", "Last word, written."], 6, 9),
    S(Read, "kcw11-ch1", H.teen, ["Any teen at sight.", "1, then the extras."], 11, 19),
  ],
  ["Claim the ten, count the extras.", "Write 1, then the extras' digit.", "Count-on equals ones digit."],
  "next: reading numerals backwards into groups.");

def(12,
  "Show that many: the numeral is now an order. Read 7, build exactly seven — reading is counting run in reverse.",
  "The stopping rule lives in the mark: build until the count says the numeral's name, then stop.",
  { rep: "concrete", widget: () => frame("The card orders 7. Build exactly that many.", 7,
      "Seven — the group now keeps the numeral's promise.",
      [[6, "Six leaves the order unfilled; the card's 7 wants one more."],
       [8, "Eight disobeys upward; the order says stop at seven."]],
      "Count as you build; the numeral names your stopping point."),
    predict: P("Card says 7. When does the building stop?", [{ id: "seven", label: "The moment the count says 7" }, { id: "feel", label: "When it feels right" }], "seven",
      "The numeral is the rule; feelings undercount and overcount alike.") },
  [
    A(ShowAmountMcq, H.write, ["The numeral is the order.", "Exactly, then stop."]),
    S(Read, "kcw12-k2", H.write, ["Check your build.", "Group matches mark."], 5, 9),
    S(SeqNextHop, "kcw12-k3", H.write, ["One more changes the mark.", "Next numeral, next amount."], 6, 12),
    S(CountObjects, "kcw12-ch1", H.write, ["Verify by recount.", "It must end on the numeral."], 5, 9),
  ],
  ["A numeral can be an order.", "Build until the count says its name.", "Then stop exactly."],
  "next: drawing amounts.");

def(13,
  "Draw that many: same order, pencil edition. Draw circles and count each one as it lands — the numeral says when the pencil stops.",
  "Count DURING the drawing, not after — each circle gets its number the moment it appears.",
  { rep: "concrete", widget: () => frame("Draw-and-count practice: show the 8 your pencil must produce.", 8,
      "Eight — counted as they landed, stopped on the numeral's word.",
      [[7, "The pencil stopped a circle early; the count must reach eight before resting."],
       [9, "One circle too many landed; counting during the drawing catches it at eight."]],
      "One number per circle as you draw; the numeral is the stopping word."),
    predict: P("Drawing 5 circles — when do you count them?", [{ id: "during", label: "As each one is drawn" }, { id: "after", label: "Only at the end" }], "during",
      "Counting during the drawing stops the pencil on time; counting after finds mistakes too late.") },
  [
    A(DrawCountMcq, H.write, ["The numeral stops the pencil.", "Count as you draw."]),
    S(CountObjects, "kcw13-k2", H.write, ["Verify a drawing by count.", "End on the numeral."], 5, 9),
    S(SeqBeforeHop, "kcw13-k3", H.write, ["One circle erased, one back.", "The numeral steps down."], 6, 12),
    S(ReadFlash, "kcw13-ch1", H.write, ["Read drawings fast.", "Patterns name amounts."]),
  ],
  ["Drawing follows the same order.", "Count each circle as it lands.", "The numeral stops the pencil."],
  "next: three costumes, one amount.");

def(14,
  "One amount wears three costumes: the numeral 4, the word \u201cfour\u201d, and a picture of four things. All name the same count.",
  "Translation between the three is the whole game — see any costume, produce the other two.",
  { rep: "concrete", widget: () => frame("The word says \u201cfour\u201d. Build the amount all three costumes share.", 4,
      "Four — word, mark, and picture agree, because underneath they are one count.",
      [[3, "Three misses the shared amount; every costume of four names one more."],
       [5, "Five overshoots; the word four, the mark 4, and the picture all stop together."]],
      "Whatever the costume, build the one amount it names."),
    predict: P("Numeral 4, word \u201cfour\u201d, picture of 4 dots — how many amounts?", [{ id: "one", label: "One amount, three names" }, { id: "three", label: "Three different amounts" }], "one",
      "The costumes differ; the count underneath is the same single four.") },
  [
    A(ThreeFormsMcq, H.write, ["Three names, one amount.", "Translate freely."]),
    S(Read, "kcw14-k2", H.write, ["Picture to numeral.", "One costume to another."], 3, 9),
    S(SeqNextHop, "kcw14-k3", H.write, ["The line is a fourth costume.", "Position names amount."], 3, 15),
    S(ReadFlash, "kcw14-ch1", H.write, ["Fast translation.", "Flash to numeral."]),
  ],
  ["One amount, three costumes.", "Numeral, word, picture agree.", "Translation is the skill."],
  "course complete: every mark keeps its promise.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 14, `14 lessons defined, got ${L.length}`);
const chapterTitles = ["The Single Marks", "Two-Mark Numbers", "Numerals at Work"];
const perChapter = [5, 5, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 5 ? 1 : n <= 10 ? 2 : 3);
const outDir = join(root, "content/courses/number-writing-k");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seqN = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `kcw-0${ch}-${String(seqN).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev.length >= 2 ? c.ev : [...c.ev, "The numeral records the count's last word — match mark to amount exactly."],
      widget: c.widget, hints: c.hints, cml: cml(tag, "concrete") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const mkI1 = () => (typeof d.i1.widget === "function" ? d.i1.widget() : structuredClone(d.i1.widget));
  const i1raw = typeof d.i1.widget === "function" ? d.i1.widget() : d.i1.widget;
  const i1w = i1raw.widget ?? i1raw;                    // ZeroTap returns {widget, variant}
  const i1variant = i1raw.variant ?? d.i1.variant ?? null;
  const i2raw = mkI1();
  const i2w = i2raw.widget ?? i2raw;
  const lesson = {
    id, slug, title: row.title, courseId: "number-writing-k",
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
        explanationVariants: d.checks[0].ev.length >= 2 ? d.checks[0].ev : [...d.checks[0].ev, "Count first; the numeral copies the last word said."],
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
      const m = w.prompt.match(/make (\d+)\.$/);
      if (m) must(Number(m[1]) - 10 === w.target, `${id}/${s.id} countTeenFrame target must be teen − 10`);
    }
    if (w.type === "tapDiagram") {
      must(w.hotspots.filter((h) => h.correct).length === 1, `${id}/${s.id} tap needs one correct`);
      for (const h of w.hotspots) {
        must(!h.label.includes(","), `${id}/${s.id} tap label contains a comma (breaks solver encoding)`);
        if (!h.correct) must((h.feedback ?? "").length >= 25, `${id}/${s.id} tap wrong hotspot needs feedback`);
      }
    }
    if (w.type === "subitizeFlash") {
      must(w.options.includes(w.count) && w.commonPicks.length >= 1, `${id}/${s.id} flash shape`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "number-writing-k", slug: "number-writing-k", title: spec.title,
  tagline: "Every numeral is a written promise about an amount.",
  category: "Math", gradeLevel: 0, chapters,
}, null, 2) + "\n");
console.log(`built 14 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
