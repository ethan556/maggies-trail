#!/usr/bin/env node
// S198 — Batch G course 1/6: how-many-k (K.CC.B.4, K.CC.B.5). Zero new generator code.
//
// FIT (probed, and it corrects the handover's old "lowest fit" note): g0-counting (18 forms) and
// k0-count-100 (15 forms) cover this course completely. Surfaces are NOT what the names suggest —
// probed before authoring:
//   countObjects/Read/MoreFewer/CompareEqual/Between/kSeqNext *Mcq -> mcq (solver returns the
//     correct LABEL, e.g. "They are equal", so authored options must carry the solver's label)
//   countAddLine, kSeqNextHop, kCountFromHop -> numberLineHop
//   countObjectsFlash, countReadFlash -> subitizeFlash
//   countTeenFrame -> tenFrame
//
// TIER RECIPE (measured from the shipped all-A K courses, not assumed): the K threshold is the
// TOTAL (>=30) and does NOT require numeric entry — k100-01-01 is Tier A at 31 with formal 1.
// numberLineHop is the ONLY K engine rated adapt 3; tenFrame/tapDiagram/subitizeFlash rate adapt 0,
// which is exactly why the flash-heavy counting-to-20-k lessons sat at B. So EVERY lesson here
// carries: a predict step on i1 (+3), two diagnostic traps per check (misconception 3), and at
// least one numberLineHop widget (adapt 3). That reproduces the k100 recipe with margin.
//
// SOLVER PROMPT SHAPES are load-bearing (g0Independent.cjs re-derives from the prompt text):
//   countObjectsMcq   "{Name} counts her blocks: 1, 2, …, N. How many blocks does she have?" -> "N"
//   countReadMcq      "A group shows N dots. Which numeral names that amount?"               -> "N"
//   countMoreFewerMcq "There are A stars and B hearts. Which statement is true?"             -> "More stars" | "More hearts" | "They are equal"
//   countCompareEqualMcq "Compare A and A. Which statement is true?"                         -> "They are equal"
//   countBetweenMcq   "Which number comes between A and B?"                                  -> midpoint
//   kSeqNextMcq       "What number comes right after N?"                                     -> N+1
//   countAddLine      "Start at A. Hop forward H times by 1. Where do you land?"             (hop)
//   kCountFromHop     "Start at A and count on H. Tap where you land."                       (hop)
//   kSeqNextHop       "What number comes right after N? Hop one and tap where you land."     (hop)
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "how-many-k");
if (!spec || spec.lessons.length !== 16) throw new Error("spec course missing or wrong size");

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
const choose = (r, xs) => xs[pick(r, 0, xs.length - 1)];
const NAMES = ["Mina", "Ravi", "Tally", "Noor", "Kai", "Lena"];

/* ---------------- solver-mcq mirrors: the correct LABEL is what the solver returns ---------------- */
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
  if (gen) {
    must(REG[gen]?.has(form), `${gen}/${form} NOT registered`);
    step.variant = { gen, form };
  }
  return step;
}
const seq = (n) => Array.from({ length: n }, (_, i) => i + 1).join(", ");

function CountObjects(r) {
  const n = pick(r, 3, 9), name = choose(r, NAMES);
  return mcqStep(`${name} counts her blocks: ${seq(n)}. How many blocks does she have?`,
    String(n), [String(n + 1), String(n - 1), String(n + 2)],
    { [String(n)]: `Correct — the last number said, ${n}, tells how many blocks there are in all.`,
      [String(n + 1)]: `The count stops at ${n}; saying one more number would count a block that is not there.`,
      [String(n - 1)]: `That stops one number early — every block gets exactly one number, ending at ${n}.`,
      [String(n + 2)]: `That runs two past the count; the last number spoken is the answer, and it was ${n}.` },
    "g0-counting", "countObjectsMcq");
}
function CountRead(r) {
  const n = pick(r, 2, 9);
  return mcqStep(`A group shows ${n} dots. Which numeral names that amount?`,
    String(n), [String(n + 1), "0", String(n - 1 > 0 ? n - 1 : n + 2)],
    { [String(n)]: `Correct — the numeral ${n} names a group of exactly ${n} dots, no matter how they sit.`,
      [String(n + 1)]: `That numeral names one more dot than the group shows.`,
      "0": `Zero names an empty group, while this group contains ${n} dots.`,
      [String(n - 1 > 0 ? n - 1 : n + 2)]: `That numeral does not match the count; touch each dot once and the count ends at ${n}.` },
    "g0-counting", "countReadMcq");
}
function MoreFewer(r, forceEqual = false, forceOneMore = false) {
  const a = pick(r, 3, 8);
  let b;
  if (forceEqual) b = a;
  else if (forceOneMore) b = a - 1;
  else { b = pick(r, 2, 8); if (b === a) b = a - 1; }
  const correct = a === b ? "They are equal" : a > b ? "More stars" : "More hearts";
  const wrongs = ["They are equal", "More stars", "More hearts", "You cannot tell"].filter((l) => l !== correct).slice(0, 3);
  const fb = {
    "More stars": a > b
      ? `Correct — ${a} stars against ${b} hearts; matching them one to one leaves stars unmatched.`
      : `Pairing them up one to one uses every star; the stars do not outnumber the hearts here.`,
    "More hearts": b > a
      ? `Correct — ${b} hearts against ${a} stars; matching them one to one leaves hearts unmatched.`
      : `Pairing them up one to one uses every heart; the hearts do not outnumber the stars here.`,
    "They are equal": a === b
      ? `Correct — every star pairs with exactly one heart and nothing is left over on either side.`
      : `The groups are equal only when both counts match; here the counts are ${a} and ${b}.`,
    "You cannot tell": `You can always tell — pair the groups one to one and see which side has leftovers.`,
  };
  return mcqStep(`There are ${a} stars and ${b} hearts. Which statement is true?`,
    correct, wrongs, fb, "g0-counting", "countMoreFewerMcq");
}
function CompareEqual(r) {
  const n = pick(r, 2, 9);
  return mcqStep(`Compare ${n} and ${n}. Which statement is true?`,
    "They are equal", ["The first number is greater", `${n} is less than ${n}`, "You cannot tell"],
    { "They are equal": `Correct — the same numeral names the same amount every time, so the two match exactly.`,
      "The first number is greater": `Both numbers are ${n}, so neither one is greater than the other.`,
      [`${n} is less than ${n}`]: `A number cannot be less than itself; the two values are equal.`,
      "You cannot tell": `You can tell at a glance — the numerals are identical, so the amounts are too.` },
    "g0-counting", "countCompareEqualMcq");
}
function Between(r) {
  const a = pick(r, 2, 8);
  return mcqStep(`Which number comes between ${a} and ${a + 2}?`,
    String(a + 1), [String(a), String(a + 2), String(a + 3)],
    { [String(a + 1)]: `Correct — counting runs ${a}, ${a + 1}, ${a + 2}, and ${a + 1} sits in the middle.`,
      [String(a)]: `${a} is the first endpoint, not the number between the endpoints.`,
      [String(a + 2)]: `${a + 2} is the second endpoint; the question asks for the number inside.`,
      [String(a + 3)]: `${a + 3} comes after ${a + 2}, outside the two endpoints entirely.` },
    "g0-counting", "countBetweenMcq");
}
function SeqNext(r) {
  const n = pick(r, 3, 17);
  return mcqStep(`What number comes right after ${n}?`,
    String(n + 1), [String(n), String(n + 2), String(n - 1)],
    { [String(n + 1)]: `Correct — each counting number is exactly one more than the number before it.`,
      [String(n)]: `${n} is the number we started from, not the one that follows it.`,
      [String(n + 2)]: `${n + 2} skips a number; counting moves one at a time.`,
      [String(n - 1)]: `${n - 1} comes BEFORE ${n}; the count moves forward, not back.` },
    "k0-count-100", "kSeqNextMcq");
}

/* ---------------- hop mirrors (numberLineHop, the adapt-3 engine) ---------------- */
function hop(prompt, min, max, start, hops, success, landings, low, high, gen, form) {
  const w = structuredClone(HOP_T);
  w.prompt = prompt; w.min = min; w.max = max; w.start = start;
  w.hop = 1; w.hops = hops; w.direction = "forward";
  const land = start + hops;
  must(land > min && land < max, `hop landing ${land} sits at the edge — one feedback direction would be dead`);
  w.successFeedback = success;
  w.missFeedback = `Start at ${start} and count on ${hops}: you land on ${land}.`;
  if ("lowFeedback" in w || low) w.lowFeedback = low;
  if ("highFeedback" in w || high) w.highFeedback = high;
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
function AddLineHop(r) {
  const a = pick(r, 1, 5), h = pick(r, 2, 4);
  const land = a + h;
  return hop(`Start at ${a}. Hop forward ${h} times by 1. Where do you land?`,
    0, land + 3, a, h,
    `${a} and ${h} more is ${land} — each hop says the next counting number.`,
    [[land - 1, `${land - 1} stops one complete hop too soon. Continue the final 1-unit hop to reach ${land}.`],
     [land + 1, `${land + 1} goes one complete hop too far. Count just ${h} hops from ${a} to land on ${land}.`]],
    `Short of the landing — count all ${h} hops, one number per hop, to reach ${land}.`,
    `Past the landing — the count stops after exactly ${h} hops, on ${land}.`,
    "g0-counting", "countAddLine");
}
function CountFromHop(r) {
  const a = pick(r, 8, 14), h = pick(r, 2, 4);
  const land = a + h;
  return hop(`Start at ${a} and count on ${h}. Tap where you land.`,
    a - 2, land + 2, a, h,
    `${a} and ${h} more is ${land} — counting on continues the count instead of starting over.`,
    [[land - 1, `${land - 1} stops one complete hop too soon. Continue the final 1-unit hop to reach ${land}.`],
     [land + 1, `${land + 1} goes one complete hop too far. Count just ${h} hops from ${a} to land on ${land}.`]],
    `Short of the landing — all ${h} counts are needed to reach ${land}.`,
    `Past the landing — the count-on stops after ${h} numbers, on ${land}.`,
    "k0-count-100", "kCountFromHop");
}
function SeqNextHop(r) {
  const n = pick(r, 5, 17);
  return hop(`What number comes right after ${n}? Hop one and tap where you land.`,
    n - 3, n + 4, n, 1,
    `${n + 1} — one hop forward, because each number is exactly one more than the last.`,
    [[n, `${n} stops one complete hop too soon. Continue the final 1-unit hop to reach ${n + 1}.`],
     [n + 2, `${n + 2} goes one complete hop too far. One hop from ${n} lands on ${n + 1}.`]],
    `Short of the landing — a single hop forward reaches ${n + 1}.`,
    `Past the landing — right after ${n} means one hop, stopping on ${n + 1}.`,
    "k0-count-100", "kSeqNextHop");
}

/* ---------------- subitize flash mirrors ---------------- */
function flash(r, arrangement, gen, form) {
  const count = arrangement === "dice" ? pick(r, 2, 6) : pick(r, 4, 9);
  const w = structuredClone(FLASH_T);
  w.prompt = arrangement === "dice"
    ? "A group of dots will flash. Choose the number of dots you see."
    : "Look at the ten-frame flash and choose the matching numeral.";
  w.count = count; w.arrangement = arrangement; w.flashMs = arrangement === "dice" ? 1200 : 1400;
  const opts = [count - 1, count, count + 1, count + 2].filter((v) => v >= 1);
  while (opts.length < 4) opts.push(count + opts.length);
  w.options = opts;
  must(new Set(w.options).size === w.options.length && w.options.includes(count), "flash options invalid");
  w.commonPicks = [
    { value: count - 1, feedback: `${count - 1} misses 1 of the visible dots. Group the dots, then count the full group as ${count}.` },
    { value: count + 1, feedback: `${count + 1} counts 1 extra. Touch each dot once in your mind — the group holds ${count}.` },
  ].filter((p) => w.options.includes(p.value));
  must(w.commonPicks.length >= 1, "flash needs a diagnosable wrong pick");
  const step = { widget: w };
  must(REG[gen]?.has(form), `${gen}/${form} NOT registered`);
  step.variant = { gen, form };
  return step;
}

/* ---------------- variant-less reasoning MCQs ---------------- */
const authored = (prompt, opts) => {
  must(opts.length >= 4 && opts[0][1], "authored mcq shape");
  return mcqStep(prompt, opts[0][0], opts.slice(1).map((o) => o[0]),
    Object.fromEntries(opts.map(([l, , f]) => [l, f])), null, null);
};
const TouchEachMcq = () => authored("Why do we touch each toy while counting?", [
  ["So every toy gets exactly one number", true, "Correct — touching pairs each toy with one number, so nothing is skipped and nothing is counted twice."],
  ["To make the counting louder", false, "Volume does not change the count; the touch is what keeps numbers and toys paired."],
  ["Because toys like being touched", false, "The touch is for the counter, not the toy — it marks which toys already have a number."],
  ["To move the toys into a line", false, "Counting works in any arrangement; the touch pairs, it does not tidy."]]);
const SkipErrorMcq = () => authored("Sam counts 5 blocks but says only four numbers. What happened?", [
  ["One block was skipped, so a block got no number", true, "Correct — fewer numbers than blocks means some block was never paired with a number."],
  ["A number was said twice", false, "Repeating a number gives too FEW numbers only if a block is also skipped; the plain repeat error double-counts."],
  ["Sam counted backwards", false, "Backwards counting still says one number per block; the total spoken would match."],
  ["Nothing — four is close enough", false, "Close is not counted; each block must receive exactly one number for the count to mean anything."]]);
const CircleStartMcq = () => authored("Counting beads in a circle, what must you remember?", [
  ["Where you started, so you stop before recounting it", true, "Correct — a circle has no natural end, so the starting bead marks where the count must stop."],
  ["To count the biggest bead first", false, "Size plays no part in counting; each bead gets one number wherever you begin."],
  ["To count twice around to be sure", false, "Twice around counts every bead twice, doubling the answer."],
  ["To skip the bead you started on", false, "The starting bead is counted once — it is RE-counting it that must be avoided."]]);
const LastNumberMcq = () => authored("After counting \u201c1, 2, 3, 4, 5\u201d, what does the 5 tell you?", [
  ["How many there are in the whole group", true, "Correct — the last number names the size of the whole group, not just one object."],
  ["The name of the last toy only", false, "The 5 belongs to the group; the last toy is simply where the count finished."],
  ["That the toys are big", false, "Counting measures how many, never how large."],
  ["That you must count again", false, "One careful count is enough — its last number IS the answer."]]);
const RecountMcq = () => authored("You counted 6 shells. Someone asks \u201chow many?\u201d Must you recount?", [
  ["No — the last number of the count already answers it", true, "Correct — the count's final number IS how many; nothing changed, so it still holds."],
  ["Yes — every question needs a fresh count", false, "A finished count keeps its answer as long as the group is untouched."],
  ["Yes — shells are hard to count", false, "Difficulty does not erase a finished count; 6 remains 6."],
  ["No — but the answer becomes 7", false, "Asking the question does not add a shell; the count stays exactly 6."]]);
const StartAnywhereMcq = () => authored("Counting the same 5 toys from the left or from the right — what happens?", [
  ["Both counts end at 5", true, "Correct — the order of counting never changes how many there are; every toy still gets one number."],
  ["Counting from the right gives more", false, "Direction adds nothing; the same five toys are paired with the same five numbers."],
  ["Counting from the right gives fewer", false, "That treats changing direction as losing toys — but the pairing still touches all five, so the count ends where it always did."],
  ["Only left-to-right counting is allowed", false, "Any order works, as long as each toy is counted exactly once."]]);
const SpreadOutMcq = () => authored("5 buttons are spread far apart. Are there more buttons now?", [
  ["No — spreading changes the space, not the count", true, "Correct — the buttons look bigger as a group, but each one still gets one number and the count ends at 5."],
  ["Yes — they take up more room", false, "Room is not amount; the same 5 buttons are simply farther apart."],
  ["Fewer — the gaps swallow some", false, "Gaps hold no buttons; all 5 are still there to be counted."],
  ["You must weigh them to know", false, "Counting answers how many; spreading them out changes nothing it measures."]]);
const ScatterPlanMcq = () => authored("The stickers are scattered everywhere. What is the best counting plan?", [
  ["Mark or move each one as it is counted", true, "Correct — marking separates the counted from the uncounted, which is what scattered groups make hard."],
  ["Count fast before they move", false, "Speed invites skips and repeats; scattered things need marking, not hurrying."],
  ["Count only the easy ones", false, "Every sticker needs a number, or the final count answers a different question."],
  ["Guess from how big the mess looks", false, "A guess is not a count; the mess can look big with few stickers or small with many."]]);
const OneMoreGroupMcq = () => authored("Ana has 6 grapes. Ben has 1 more than Ana. Who has more, and how many?", [
  ["Ben, with 7 — one more than 6 is the next number", true, "Correct — \u201cone more\u201d moves the count to the very next number, 7."],
  ["Ana, because she was named first", false, "Being named first does not add grapes; Ben's group is the larger one."],
  ["Ben, with 8", false, "8 is TWO more than 6; one more than 6 is 7."],
  ["They have the same", false, "\u201cOne more\u201d makes Ben's group larger by exactly one grape."]]);
const CountOutPlanMcq = () => authored("You must hand over exactly 7 crayons from a big pile. What do you do?", [
  ["Count crayons out one at a time and stop at 7", true, "Correct — counting out means stopping the moment the count says 7, not counting the whole pile."],
  ["Count the whole pile first", false, "The pile's total is a different question; only 7 crayons are needed."],
  ["Grab a handful that looks right", false, "Looks deceive; the count is what guarantees exactly 7."],
  ["Hand over crayons until the pile looks smaller", false, "The pile shrinking says nothing about whether exactly 7 left it."]]);
const QuickLookMcq = () => authored("A quick look tells you \u201c4\u201d without counting. How?", [
  ["Small groups have shapes your eyes recognise at once", true, "Correct — patterns like dice faces let the mind name small amounts instantly, no counting needed."],
  ["You secretly counted very fast", false, "True quick looks recognise the whole pattern; there is no time to touch each dot."],
  ["Four is the only number that flashes", false, "Any small amount can flash; the skill is naming whichever one appears."],
  ["It was written under the dots", false, "The amount comes from the dot pattern itself, not a hidden label."]]);
const FrameHelpMcq = () => authored("Why does a ten-frame make a quick look easier?", [
  ["The frame's rows turn the dots into a known pattern", true, "Correct — a full row is five at a glance, so the eye reads \u201cfive and some more\u201d instead of counting."],
  ["The frame makes the dots larger", false, "Size does not help naming amounts; the fixed positions do."],
  ["The frame hides the extra dots", false, "Nothing is hidden — every dot sits in its own square, which is what makes them readable."],
  ["Frames only ever hold ten", false, "A frame can hold fewer; its power is showing HOW MANY of the ten squares are filled."]]);

/* ---------------- tenFrame builder for i1 ---------------- */
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
  must(w.commonCounts.length >= 2, "tenFrame needs 2 diagnosable wrong counts");
  return w;
}

const H = {
  touch: ["Touch one, say one.", "No toy twice.", "No toy skipped."],
  last: ["The last number is the answer.", "It names the whole group.", "No recount needed."],
  order: ["Any order works.", "Each toy once.", "The count cannot change."],
  more: ["Pair them one to one.", "Leftovers decide.", "One more is the next number."],
  look: ["See the pattern.", "Rows of five help.", "Name it at once."],
};

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Pair each object with exactly one number and trust the last number said for ${tag.replace(/-/g, " ")}.`,
  invariants: [`A count pairs objects with number words one to one, and its last word names the whole group — which is why order, spacing, and arrangement can change without changing the answer for ${tag.replace(/-/g, " ")}.`],
  misconceptions: [`Skipping or double-counting an object, recounting when nothing changed, or believing a spread-out group holds more.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `how-many-k:${tag}`, delayed: true,
  counterfactualPrompt: "If one more object joined the group, what would the last counting word become?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });
const S = (mk, seedStr, hints, ev) => {
  const r = mulberry32(seedFromString(seedStr));
  const out = mk(r);
  return { ...out, hints, ev };
};
const A = (mk, hints, ev) => ({ ...mk(), hints, ev });

def(1,
  "Counting is a pairing game: touch one toy, say one number. Every toy gets a number, and no toy gets two.",
  "The touch is what keeps the pairing honest — it marks which toys already have their number.",
  { rep: "concrete", widget: () => frame("Four toys to count. Place ONE counter for each toy.", 4,
      "Four counters, four toys — every toy has exactly one number.",
      [[3, "One toy still has no counter — a toy without a counter is a toy without a number."],
       [5, "That is one counter too many; some toy has been counted twice."]],
      "Place one counter at a time, saying the next number as you do."),
    predict: P("If a toy is skipped while counting 4 toys, what happens?", [{ id: "small", label: "The count comes out too small" }, { id: "same", label: "Nothing changes" }], "small",
      "A skipped toy gets no number, so the last number said falls short of the true amount.") },
  [
    A(TouchEachMcq, H.touch, ["The touch pairs.", "One number each."]),
    S(CountObjects, "khm1-k2", H.touch, ["Count to the end.", "The last number answers."]),
    S(AddLineHop, "khm1-k3", H.touch, ["One hop per number.", "Land and stop."]),
    S(CountObjects, "khm1-ch1", H.touch, ["Bigger groups, same pairing.", "Touch and say."]),
  ],
  ["Touch one, say one.", "Every toy gets exactly one number.", "The touch keeps the pairing honest."],
  "next: what goes wrong when we skip.");

def(2,
  "Two mistakes break a count: skipping a toy, and counting a toy twice. Skipping makes the answer too small; repeating makes it too big.",
  "Careful counters go slowly enough that each toy is touched exactly once — speed is the enemy of the pairing.",
  { rep: "concrete", widget: () => frame("Count 6 buttons — one counter each, none skipped, none twice.", 6,
      "Six counters for six buttons — nothing skipped, nothing doubled.",
      [[5, "One button was skipped; a skipped button leaves the count one short."],
       [7, "One button was counted twice; a repeat pushes the count one too high."]],
      "Slow down: touch each button once, saying one number per touch."),
    predict: P("Counting a toy twice makes the answer…", [{ id: "big", label: "Too big" }, { id: "small", label: "Too small" }], "big",
      "A repeated toy takes two numbers, so the last number said runs past the true amount.") },
  [
    S(CountObjects, "khm2-k1", H.touch, ["Exactly once each.", "End on the true count."]),
    A(SkipErrorMcq, H.touch, ["Fewer numbers than toys?", "Something was skipped."]),
    S(AddLineHop, "khm2-k3", H.touch, ["No skipped hops.", "No doubled hops."]),
    S(CountObjects, "khm2-ch1", H.touch, ["Careful beats fast.", "Once each."]),
  ],
  ["Skipping makes the count too small.", "Repeating makes it too big.", "Each toy is touched exactly once."],
  "next: counting things in a line.");

def(3,
  "A line is the friendliest arrangement to count: start at one end, touch each thing in turn, and stop at the other end.",
  "The line does the organising for you — what has been counted sits behind your finger, and what remains sits ahead.",
  { rep: "diagram", widget: () => S(AddLineHop, "khm3-i1", [], []).widget,
    predict: P("Counting a line of things, where do you start?", [{ id: "end", label: "At one end" }, { id: "middle", label: "In the middle" }], "end",
      "Starting at an end keeps counted and uncounted things on opposite sides of your finger.") },
  [
    S(CountObjects, "khm3-k1", H.touch, ["End to end.", "One number each."]),
    S(Between, "khm3-k2", H.order, ["The line shows order.", "Between means inside."]),
    S(CountFromHop, "khm3-k3", H.touch, ["Keep counting forward.", "One per step."]),
    S(CountObjects, "khm3-ch1", H.touch, ["Longer lines, same walk.", "Start at an end."]),
  ],
  ["Start at one end of the line.", "Touch each thing in turn.", "Counted things stay behind your finger."],
  "next: when the line bends into a circle.");

def(4,
  "A circle has no ends, so the counter must invent one: remember the starting bead, and stop just before reaching it again.",
  "Forget the start and the count sails past it, counting beads a second time — the circle's only trap.",
  { rep: "concrete", widget: () => frame("Count 7 beads from a circle — one counter per bead, stopping at the start.", 7,
      "Seven counters, and the count stopped exactly where it began.",
      [[8, "The count passed its starting bead and counted it twice; a circle needs a remembered start."],
       [6, "One bead was missed — going once around must touch every bead exactly once."]],
      "Pick a starting bead, count around, and stop just before reaching it again."),
    predict: P("Counting a circle of beads without marking the start, what is the risk?", [{ id: "twice", label: "Counting some beads twice" }, { id: "none", label: "No risk" }], "twice",
      "With no ends to stop you, the count can lap the circle and recount the first beads.") },
  [
    A(CircleStartMcq, H.order, ["Remember the start.", "Stop before it."]),
    S(CountObjects, "khm4-k2", H.touch, ["One number per bead.", "Once around."]),
    S(SeqNextHop, "khm4-k3", H.order, ["The count moves one at a time.", "Forward only."]),
    S(CountObjects, "khm4-ch1", H.order, ["Any loop, same rule.", "Mark the start."]),
  ],
  ["A circle has no ends.", "Remember the starting bead.", "Stop just before reaching it again."],
  "next: things that cannot be moved.");

def(5,
  "Pictures on a page cannot move into a line — so mark them instead: each one gets a tick as its number is said.",
  "Marking splits the page the way a line splits a row: ticked things are counted, clean things still wait.",
  { rep: "concrete", widget: () => frame("Count 8 printed stars by marking — one counter stands for each tick.", 8,
      "Eight ticks, eight stars — the marks kept counted and uncounted apart.",
      [[7, "One star has no tick; an unmarked star is an uncounted star."],
       [9, "A star was ticked twice; each mark must land on a clean star."]],
      "Tick each star as its number is said, and count the ticks at the end."),
    predict: P("Stars printed on a page — how do you keep track while counting?", [{ id: "mark", label: "Mark each one as it is counted" }, { id: "stare", label: "Stare harder" }], "mark",
      "A mark does what moving would do: it separates the counted from the uncounted.") },
  [
    S(CountObjects, "khm5-k1", H.touch, ["Tick as you count.", "Clean means waiting."]),
    A(ScatterPlanMcq, H.touch, ["Marking beats hurrying.", "Split counted from not."]),
    S(AddLineHop, "khm5-k3", H.touch, ["Same counting, on the line.", "One per hop."]),
    S(CountObjects, "khm5-ch1", H.touch, ["Busy pages, same marks.", "Tick and say."]),
  ],
  ["Unmovable things get marks instead.", "A tick means counted.", "Clean means still waiting."],
  "next: what the last number means.");

def(6,
  "Counting's biggest secret: the last number said is not just the last toy's name — it tells how many are in the WHOLE group.",
  "Count five shells and the word \u201cfive\u201d belongs to all of them together. That is what \u201chow many\u201d asks for.",
  { rep: "concrete", widget: () => frame("Count 5 shells, then show the group's number with counters.", 5,
      "Five — the last word of the count names the whole group at once.",
      [[1, "One names only the final shell; the question asks about the whole group."],
       [4, "The count did not stop at 4 — one more shell took the count to 5."]],
      "Count the shells one by one; the number you end on is the group's number."),
    predict: P("After counting \u201c1, 2, 3, 4, 5\u201d, what does 5 name?", [{ id: "group", label: "The whole group" }, { id: "lasttoy", label: "Just the last toy" }], "group",
      "The final count word answers \u201chow many\u201d for everything counted, not for one shell.") },
  [
    A(LastNumberMcq, H.last, ["The last word answers.", "It names them all."]),
    S(CountObjects, "khm6-k2", H.last, ["Stop and trust it.", "That is how many."]),
    S(SeqNextHop, "khm6-k3", H.last, ["One more toy, next number.", "The count grows by one."]),
    S(CountRead, "khm6-ch1", H.last, ["The numeral names the amount.", "Match them."]),
  ],
  ["The last number names the whole group.", "That is what \u201chow many\u201d asks.", "One count is enough."],
  "next: asking again without recounting.");

def(7,
  "Once a group is counted, its number sticks. Asked again, the counter answers from memory — nothing changed, so the count still holds.",
  "Recounting is only needed when the group itself changes: something added, something taken away.",
  { rep: "concrete", widget: () => frame("You counted 6 shells. Show the answer again — without recounting.", 6,
      "Still six — the finished count keeps its answer while the group stays the same.",
      [[7, "Nothing was added; asking the question again does not grow the group."],
       [5, "Nothing was removed; the count of 6 still stands."]],
      "The last count said 6, and the shells have not changed — show 6."),
    predict: P("Nothing changed since you counted 6. How many now?", [{ id: "six", label: "Still 6" }, { id: "recount", label: "Unknown until recounted" }], "six",
      "A count keeps its answer as long as the group is untouched.") },
  [
    A(RecountMcq, H.last, ["The answer sticks.", "Unless the group changes."]),
    S(CountObjects, "khm7-k2", H.last, ["Count once, trust it.", "The last word holds."]),
    S(CountFromHop, "khm7-k3", H.last, ["If some are added, count ON.", "No starting over."]),
    S(CompareEqual, "khm7-ch1", H.last, ["Same numeral, same amount.", "Every time."]),
  ],
  ["A finished count keeps its answer.", "Recount only when the group changes.", "Adding means counting ON, not over."],
  "next: starting the count anywhere.");

def(8,
  "Count the same toys left-to-right, right-to-left, or hopping about — the answer never moves. Order is the counter's choice; the amount is not.",
  "As long as every toy is counted exactly once, the pairing ends at the same last number from any direction.",
  { rep: "concrete", widget: () => frame("Count 5 toys from the RIGHT this time — show what the count ends on.", 5,
      "Five again — direction changed, the pairing did not.",
      [[4, "Counting from the right skips nothing; all five toys still get numbers."],
       [6, "That imagines the new direction re-dealing numbers — but each of the 5 toys still receives exactly one, so the count cannot grow."]],
      "Start from either side; give each toy one number and the count ends at 5."),
    predict: P("Counting the same 5 toys from the right instead — what changes?", [{ id: "nothing", label: "Nothing — still 5" }, { id: "more", label: "The count grows" }], "nothing",
      "Order is free; the amount is fixed. Every toy still gets exactly one number.") },
  [
    A(StartAnywhereMcq, H.order, ["Any direction.", "Same last number."]),
    S(CountObjects, "khm8-k2", H.order, ["Once each, any order.", "The end matches."]),
    S(AddLineHop, "khm8-k3", H.order, ["The line agrees.", "Hops end the same."]),
    S(CountObjects, "khm8-ch1", H.order, ["Scrambled order, same count.", "Pair them all."]),
  ],
  ["Order is the counter's choice.", "The amount never moves.", "Each toy counted exactly once."],
  "next: spreading things out.");

def(9,
  "Spread five buttons far apart and the group LOOKS bigger — but looking bigger and being more are different. The count ends at five.",
  "Space is not amount. Only adding or removing buttons can change how many there are.",
  { rep: "concrete", widget: () => frame("The 5 buttons were spread far apart. Count them again and show the answer.", 5,
      "Five, exactly as before — the gaps grew, the group did not.",
      [[6, "The empty space holds no buttons; spreading cannot add one."],
       [4, "That reads the gaps as swallowing buttons — but empty space holds nothing, and touching each button still ends the count at 5."]],
      "Ignore the spacing: touch each button once and the count ends where it always did."),
    predict: P("5 buttons are spread far apart. More buttons now?", [{ id: "no", label: "No — still 5" }, { id: "yes", label: "Yes — they fill more space" }], "no",
      "Spreading changes where the buttons sit, not how many there are.") },
  [
    A(SpreadOutMcq, H.order, ["Space is not amount.", "Count to check."]),
    S(CompareEqual, "khm9-k2", H.more, ["Same numeral, same amount.", "Always."]),
    S(AddLineHop, "khm9-k3", H.order, ["The line agrees.", "Same hops, same landing."]),
    S(CountObjects, "khm9-ch1", H.order, ["Squeezed or spread, same count.", "Touch each once."]),
  ],
  ["Spreading changes space, not amount.", "Looking bigger is not being more.", "Only adding or removing changes the count."],
  "next: counting a scattered mess.");

def(10,
  "Scattered things are hardest to count — nothing separates counted from uncounted. The oldest trick fixes it: mark each one as its number is said.",
  "With a mark on every counted thing, the mess cannot fool you — the clean ones are exactly the ones still waiting.",
  { rep: "concrete", widget: () => frame("9 stickers are scattered. Mark each as you count — a counter per mark.", 9,
      "Nine marks, nine stickers — the mess never stood a chance.",
      [[8, "A clean sticker is hiding somewhere; unmarked means uncounted."],
       [10, "A sticker was marked twice; each mark must land on a clean one."]],
      "Mark one sticker per number; when no clean stickers remain, the last number is the answer."),
    predict: P("Counting scattered stickers without marking — the danger is…", [{ id: "both", label: "Skipping some and repeating others" }, { id: "none", label: "No danger" }], "both",
      "With nothing separating counted from uncounted, both mistakes come easily.") },
  [
    A(ScatterPlanMcq, H.touch, ["Mark as you go.", "Clean means waiting."]),
    S(CountObjects, "khm10-k2", H.touch, ["The plan finishes the mess.", "One mark each."]),
    S(CountFromHop, "khm10-k3", H.touch, ["Found one more? Count on.", "No starting over."]),
    S(CountObjects, "khm10-ch1", H.touch, ["Bigger messes, same trick.", "Mark and say."]),
  ],
  ["Scattered things need marks.", "Marked means counted.", "The clean ones still wait."],
  "next: the number that comes next.");

def(11,
  "Add one more toy and the count does not start over — it simply says the NEXT number. One more than five is six, always.",
  "This is why the counting song matters: each number is exactly one more than the number before it.",
  { rep: "diagram", widget: () => S(SeqNextHop, "khm11-i1", [], []).widget,
    predict: P("A group of 5 gets one more toy. The new count is…", [{ id: "next", label: "6 — the next number" }, { id: "recount", label: "Unknown until recounted" }], "next",
      "One more moves the count forward by exactly one word: from five to six.") },
  [
    S(SeqNext, "khm11-k1", H.more, ["One more, next number.", "No recount."]),
    S(SeqNextHop, "khm11-k2", H.more, ["One hop forward.", "Land on the next."]),
    S(SeqNext, "khm11-k3", H.more, ["It works from any number.", "The song moves by ones."]),
    S(Between, "khm11-ch1", H.more, ["Between means the middle.", "One step from each end."]),
  ],
  ["One more says the next number.", "No recount needed.", "Each number is one more than the last."],
  "next: growing one at a time.");

def(12,
  "A group can grow one toy at a time, and the count grows with it: six, seven, eight — counting ON from where it stood.",
  "Counting on is the fast counter's habit: never start over when you already know where the count stands.",
  { rep: "diagram", widget: () => S(CountFromHop, "khm12-i1", [], []).widget,
    predict: P("You know there are 12. Three more arrive. What do you do?", [{ id: "on", label: "Count on: 13, 14, 15" }, { id: "over", label: "Start over from 1" }], "on",
      "The 12 is already counted; only the newcomers need numbers.") },
  [
    S(CountFromHop, "khm12-k1", H.more, ["Start where you stood.", "Count the newcomers."]),
    S(SeqNext, "khm12-k2", H.more, ["Each arrival, next number.", "One at a time."]),
    S(CountFromHop, "khm12-k3", H.more, ["Longer count-ons too.", "One hop per newcomer."]),
    S(SeqNext, "khm12-ch1", H.more, ["From any number.", "The song continues."]),
  ],
  ["Growing groups count ON.", "Never start over.", "One newcomer, one more number."],
  "next: which group has one more.");

def(13,
  "\u201cOne more\u201d also compares: if Ben has one more grape than Ana's six, Ben has seven — the very next number.",
  "Pairing the groups one to one shows it: every grape of Ana's matches one of Ben's, and Ben has a single grape left over.",
  { rep: "concrete", widget: () => frame("Ana has 6. Show Ben's group — ONE MORE than Ana's.", 7,
      "Seven — one more than six is the next counting number.",
      [[6, "That builds a group that matches Ana's exactly — the pairing would leave nothing over, but Ben holds one extra."],
       [8, "That is TWO more than six; one more stops at seven."]],
      "Build Ana's six, then add exactly one more."),
    predict: P("Ben has one more than Ana's 6. Pairing them up leaves…", [{ id: "one", label: "One of Ben's unmatched" }, { id: "none", label: "Nothing unmatched" }], "one",
      "One-to-one pairing uses all of Ana's six and leaves Ben's single extra standing alone.") },
  [
    A(OneMoreGroupMcq, H.more, ["One more, next number.", "Pair to check."]),
    S(MoreFewer, "khm13-k2", H.more, ["Leftovers decide.", "Pair one to one."]),
    S(SeqNextHop, "khm13-k3", H.more, ["The line shows it.", "One hop apart."]),
    S(MoreFewer, "khm13-ch1", H.more, ["Any groups, same pairing.", "Match and see."]),
  ],
  ["One more than a group is the next number.", "Pairing shows the single leftover.", "The line shows them one hop apart."],
  "next: counting out exactly enough.");

def(14,
  "Counting out reverses the game: instead of asking how many, you remove exactly the number asked for — and STOP when the count says so.",
  "The pile's total does not matter. Seven crayons means the count stops at seven, however many remain behind.",
  { rep: "concrete", widget: () => frame("Count out exactly 7 crayons from the big pile.", 7,
      "Seven exactly — the count said stop, and you stopped.",
      [[10, "That kept going past seven; counting out means stopping the moment the count arrives."],
       [6, "One crayon short — the count must reach seven before stopping."]],
      "Take one crayon per number, and stop the instant you say seven."),
    predict: P("Counting out 7 from a pile of many — when do you stop?", [{ id: "seven", label: "The moment the count says 7" }, { id: "empty", label: "When the pile is empty" }], "seven",
      "The request fixes the stopping point; the rest of the pile is not your problem.") },
  [
    A(CountOutPlanMcq, H.last, ["Stop at the number.", "The pile does not matter."]),
    S(CountRead, "khm14-k2", H.last, ["The numeral says how many.", "Match it exactly."]),
    S(AddLineHop, "khm14-k3", H.last, ["Hop exactly that many.", "Then stop."]),
    S(CountObjects, "khm14-ch1", H.last, ["Check by recounting the seven.", "It must end at 7."]),
  ],
  ["Counting out stops AT the number.", "The pile's total is irrelevant.", "One per number, then stop."],
  "next: naming amounts at a glance.");

def(15,
  "Some amounts need no counting at all: a quick look at two dots, or a dice-style four, and the mind names it instantly.",
  "That instant naming is a skill — the eye learns the shapes small numbers make, the way it learns faces.",
  { rep: "concrete", widget: () => frame("Build the dice-four pattern — two on top, two below.", 4,
      "Four, seen as a shape — the square of dots the eye names at once.",
      [[3, "Three makes a triangle of dots; the square pattern holds one more."],
       [5, "Five adds a centre dot; the plain square is four."]],
      "Place the dots as a square: two up, two down."),
    predict: P("A dice-four flashes for a moment. Can you name it without counting?", [{ id: "yes", label: "Yes — the shape says four" }, { id: "no", label: "No — counting is always needed" }], "yes",
      "Small amounts make shapes the eye recognises whole, faster than any count.") },
  [
    A(QuickLookMcq, H.look, ["The shape names it.", "No counting needed."]),
    S((r) => flash(r, "dice", "g0-counting", "countObjectsFlash"), "khm15-k2", H.look, ["Trust the pattern.", "Check by counting after."]),
    S(SeqNextHop, "khm15-k3", H.look, ["Quick looks feed counting on.", "One more is next."]),
    S((r) => flash(r, "dice", "g0-counting", "countObjectsFlash"), "khm15-ch1", H.look, ["New flash, same skill.", "Name the shape."]),
  ],
  ["Small amounts have shapes.", "The eye names them at once.", "Counting can confirm afterwards."],
  "next: quick looks on the ten-frame.");

def(16,
  "The ten-frame gives EVERY amount a shape: a full row is five at a glance, so seven reads as five-and-two with no counting.",
  "That is the frame's whole purpose — it turns any number up to ten into a picture the mind can name quickly.",
  { rep: "concrete", widget: () => frame("Build 7 on the frame — fill the top row, then two below.", 7,
      "Seven, read as five-and-two — the full row does the counting for you.",
      [[5, "That is the full row alone; two more dots complete the seven."],
       [8, "That adds one too many below; five and two make seven."]],
      "Fill the whole top row first, then add the extras beneath."),
    predict: P("On a ten-frame, a full row plus two more reads as…", [{ id: "seven", label: "Seven, at a glance" }, { id: "count", label: "Unknown without counting each dot" }], "seven",
      "The full row is a known five; only the extras need noticing.") },
  [
    A(FrameHelpMcq, H.look, ["A full row is five.", "Read five-and-more."]),
    S((r) => flash(r, "tenFrame", "g0-counting", "countReadFlash"), "khm16-k2", H.look, ["Rows first.", "Then the extras."]),
    S(CountFromHop, "khm16-k3", H.look, ["Five and count on.", "The frame feeds the hop."]),
    S((r) => flash(r, "tenFrame", "g0-counting", "countReadFlash"), "khm16-ch1", H.look, ["Any amount, same reading.", "Row plus extras."]),
  ],
  ["A full row is five at a glance.", "Read amounts as five-and-more.", "The frame makes numbers into pictures."],
  "course complete: paired, counted, compared, and named at a glance.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 16, `16 lessons defined, got ${L.length}`);
const chapterTitles = ["Touch and Count", "The Counting Rules", "One More and Quick Looks"];
const perChapter = [5, 5, 6];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 5 ? 1 : n <= 10 ? 2 : 3);
const outDir = join(root, "content/courses/how-many-k");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seqN = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `khm-0${ch}-${String(seqN).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev.length >= 2 ? c.ev : [...c.ev, "Touch one, say one — and the last number names the whole group."],
      widget: c.widget, hints: c.hints, cml: cml(tag, "concrete") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const i1w = typeof d.i1.widget === "function" ? d.i1.widget() : d.i1.widget;
  const i2w = typeof d.i1.widget === "function" ? d.i1.widget() : structuredClone(d.i1.widget);
  const lesson = {
    id, slug, title: row.title, courseId: "how-many-k",
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
        explanationVariants: d.checks[0].ev.length >= 2 ? d.checks[0].ev : [...d.checks[0].ev, "Touch one, say one — the last number answers."],
        widget: d.checks[0].widget },
    }],
  };

  // A-tier recipe checks: predict present, >=1 numberLineHop in the lesson, traps everywhere
  must(lesson.steps[1].predict, `${id}: i1 must carry a predict step (+3 prediction)`);
  const hasHop = lesson.steps.some((s) => s.widget?.type === "numberLineHop");
  must(hasHop, `${id}: needs a numberLineHop — the only K engine rated adapt 3`);

  for (const s of lesson.steps) {
    const w = s.widget;
    if (!w) continue;
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 4, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
      for (const o of w.options) must(o.feedback.length >= 25, `${id}/${s.id} feedback short`);
    }
    if (w.type === "numberLineHop") {
      const land = w.start + w.hop * w.hops;
      must(land > w.min && land < w.max, `${id}/${s.id} hop landing at the edge`);
      must(w.commonLandings.length >= 2, `${id}/${s.id} hop needs 2 traps`);
    }
    if (w.type === "tenFrame") {
      must(w.target >= 1 && w.target <= 10, `${id}/${s.id} tenFrame target`);
      must(w.commonCounts.length >= 2, `${id}/${s.id} tenFrame needs 2 traps`);
      for (const t of w.commonCounts) must(t.count !== w.target, `${id}/${s.id} tenFrame trap==target`);
    }
    if (w.type === "subitizeFlash") {
      must(w.options.includes(w.count), `${id}/${s.id} flash options must include the count`);
      must(w.commonPicks.length >= 1, `${id}/${s.id} flash needs a wrong pick`);
      for (const p of w.commonPicks) must(p.value !== w.count && w.options.includes(p.value), `${id}/${s.id} flash pick invalid`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "how-many-k", slug: "how-many-k", title: spec.title,
  tagline: "Touch one, say one — and the last number names them all.",
  category: "Math", gradeLevel: 0, chapters,
}, null, 2) + "\n");
console.log(`built 16 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
