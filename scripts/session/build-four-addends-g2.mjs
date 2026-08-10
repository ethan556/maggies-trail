#!/usr/bin/env node
// S194 — Batch C course 3/6: four-addends-g2 (2.NBT.B.6). Zero new generator code.
//
// VERIFIED routes (g2-add-subtract-100, g2Independent.cjs):
//   Add2DigitNumeric / DoublesNumeric / NearDoublesNumeric / Fluency20Numeric -> arithmetic(prompt)
//     arithmetic() parses only the FIRST "a + b", so every staged prompt LEADS with its pair and
//     puts context in a trailing parenthetical: "64 + 15 = ? (joining the third addend)".
//     Multi-addend totals are therefore authored as staged pair sums — which is not a workaround
//     but 2.NBT.B.6's own strategy (associativity in action).
//   Add2DigitMcq -> exact(options, `${tensA} + ${tensB} and ${onesA} + ${onesB}`)
//     The route IS the by-place split — lesson 4's core idea rides a registered MCQ form.
// Manipulatives: tapDiagram tile-grids (tap the make-ten pair) and numberLineHop (the running
// total as staged jumps). Both shapes proven in courses 1-2 this batch.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "four-addends-g2");
if (!spec || spec.lessons.length !== 8) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

const REGISTERED = new Set(["Add2DigitNumeric","Add2DigitMcq","AddOnesNumeric","AddOnesMcq",
  "AddTensNumeric","AddTensMcq","ChooseStepsNumeric","ChooseStepsMcq","DoublesNumeric","DoublesMcq",
  "Fluency20Numeric","Fluency20Mcq","NearDoublesNumeric","NearDoublesMcq","OddEvenMcq",
  "OddEvenOddEvenPairs","ParitySumNumeric","ParitySumMcq","RegroupAddNumeric","Sub2DigitMcq",
  "SubOnesMcq","SubTensMcq","TwoStepTradeNumeric","TwoStepTradeMcq","UnbundleSubMcq"]);
const GEN = "g2-add-subtract-100";

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
    out.push([v, "That total does not survive a careful restaging of the sum — add the pairs again in order."]);
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

/* Addend sets, deterministic per seed. threeSet keeps every stage within 100. */
function threeSet(r) {
  const a = 10 * pick(r, 1, 3) + pick(r, 2, 7);
  const b = 10 * pick(r, 1, 3) + pick(r, 1, 6);
  const c = 10 * pick(r, 1, 2) + pick(r, 1, 5);
  must(a + b + c <= 99, "three-addend total within 100");
  return [a, b, c];
}
function fourSet(r) {
  const a = 10 * pick(r, 1, 2) + pick(r, 2, 6);
  const b = 10 * pick(r, 1, 2) + pick(r, 1, 5);
  const c = pick(r, 11, 19);
  const d = pick(r, 5, 9);
  must(a + b + c + d <= 99, "four-addend total within 100");
  return [a, b, c, d];
}
function makeTenSet(r) {
  const o = pick(r, 2, 8);
  const a = 10 * pick(r, 1, 3) + o;
  const b = 10 * pick(r, 1, 2) + (10 - o);
  const c = 10 * pick(r, 1, 2) + pick(r, 1, 4);
  must((a + b) % 10 === 0 && a + b + c <= 99, "make-ten pair lands on a ten");
  return [a, b, c];
}

/* ---------------- graded mirrors ---------------- */
function Stage1of3(r) {
  const [a, b, c] = threeSet(r);
  const ans = a + b;
  return { kind: "numeric", form: "Add2DigitNumeric",
    prompt: `${a} + ${b} = ? (the first pair of ${a} + ${b} + ${c})`, answer: ans,
    traps: traps2(ans, [[a + b + c, `That is the WHOLE sum — this stage joins only the first pair.`],
                        [a + c, `The pair is the first two addends; ${c} waits for the next stage.`]]) };
}
function Stage2of3(r) {
  const [a, b, c] = threeSet(r);
  const sofar = a + b, ans = sofar + c;
  return { kind: "numeric", form: "Add2DigitNumeric",
    prompt: `${sofar} + ${c} = ? (joining the last addend of ${a} + ${b} + ${c})`, answer: ans,
    traps: traps2(ans, [[sofar, `The running total stalled — the third addend ${c} still has to join.`],
                        [sofar + c + c, `${c} joined twice; each addend enters the total exactly once.`]]) };
}
function Stage2of4(r) {
  const [a, b, c, d] = fourSet(r);
  const sofar = a + b, ans = sofar + c;
  return { kind: "numeric", form: "Add2DigitNumeric",
    prompt: `${sofar} + ${c} = ? (the third addend of ${a} + ${b} + ${c} + ${d} joins)`, answer: ans,
    traps: traps2(ans, [[sofar + d, `That skipped ahead to ${d} — the addends join in the order you staged.`],
                        [sofar, `The total froze; ${c} must be folded in before moving on.`]]) };
}
function Stage3of4(r) {
  const [a, b, c, d] = fourSet(r);
  const sofar = a + b + c, ans = sofar + d;
  return { kind: "numeric", form: "Add2DigitNumeric",
    prompt: `${sofar} + ${d} = ? (the last addend of ${a} + ${b} + ${c} + ${d})`, answer: ans,
    traps: traps2(ans, [[sofar, `One addend short — ${d} never made it into the total.`],
                        [sofar + d + 4, `Four addends does not mean adding a 4; only ${d} remains to join.`]]) };
}
function MakeTenPairNumeric(r) {
  const [a, b, c] = makeTenSet(r);
  const ans = a + b;
  return { kind: "numeric", form: "Add2DigitNumeric",
    prompt: `${a} + ${b} = ? (a friendly pair from ${a} + ${b} + ${c})`, answer: ans,
    traps: traps2(ans, [[ans + 1, `A make-ten pair lands exactly on a ten — no leftover ones at all.`],
                        [a + c, `${a} pairs with ${b} to make the ten; ${c} is not its partner.`]]) };
}
function AfterTenNumeric(r) {
  const [a, b, c] = makeTenSet(r);
  const ten = a + b, ans = ten + c;
  return { kind: "numeric", form: "Add2DigitNumeric",
    prompt: `${ten} + ${c} = ? (after the friendly pair in ${a} + ${b} + ${c})`, answer: ans,
    traps: traps2(ans, [[ten, `The friendly ten is a stepping stone, not the destination — ${c} still joins.`],
                        [ten + c + 10, `An extra ten crept in; the pair already banked its ten.`]]) };
}
function ByPlaceMcq(r) {
  const a = 10 * pick(r, 1, 4) + pick(r, 2, 7);
  let b = 10 * pick(r, 1, 4) + pick(r, 1, 6);
  if (b === a) b += 10;
  const ta = Math.floor(a / 10) * 10, tb = Math.floor(b / 10) * 10, oa = a % 10, ob = b % 10;
  return { kind: "mcq", form: "Add2DigitMcq",
    prompt: `Split ${a} + ${b} by place before adding. Which split is right?`,
    options: [
      { label: `${ta} + ${tb} and ${oa} + ${ob}`, correct: true, feedback: `Correct — tens meet tens (${ta} + ${tb}) and ones meet ones (${oa} + ${ob}); the two little sums rebuild the big one.` },
      { label: `${ta} + ${ob} and ${oa} + ${tb}`, correct: false, feedback: `That crosses the places — a ten added to a one mixes two different unit sizes.` },
      { label: `${a} + ${tb} and ${ob}`, correct: false, feedback: `${a} was never split, so its ones would be counted inside AND outside the pair.` },
      { label: `${ta} + ${tb} and ${oa} − ${ob}`, correct: false, feedback: `The ones join by addition here — nothing in ${a} + ${b} calls for taking away.` },
    ] };
}
function FriendlyPairMcq(r) {
  const o = pick(r, 3, 7);
  const a = 10 * pick(r, 1, 2) + o;
  const b = 10 * pick(r, 1, 2) + (10 - o);
  const c = 10 * pick(r, 1, 2) + pick(r, 1, 4);
  const dOnes = (10 - o + 1) > 9 ? 2 : 10 - o + 1;
  const d = 10 + dOnes;
  return { kind: "mcq", form: null,
    prompt: `In ${a} + ${c} + ${b}, which two addends make the friendliest pair to add FIRST?`,
    options: [
      { label: `${a} and ${b} — their ones make a ten`, correct: true, feedback: `Correct — ${o} + ${10 - o} = 10, so ${a} + ${b} lands on a clean ten and the rest joins easily.` },
      { label: `${a} and ${c} — they come first`, correct: false, feedback: `Order on the page is not a strategy; their ones (${o} + ${c % 10}) miss the ten.` },
      { label: `${c} and ${b} — the biggest two`, correct: false, feedback: `Size alone does not help; those ones (${c % 10} + ${10 - o}) do not complete a ten.` },
      { label: `${a} and ${d} — they look alike`, correct: false, feedback: `${d} is not even in this sum — a pair must come from the addends you actually have.` },
    ] };
}
function OrderFreeMcq() {
  return { kind: "mcq", form: null,
    prompt: `You add 17 + 25 + 3 as (17 + 3) + 25. Is the total allowed to change?`,
    options: [
      { label: "No — regrouping addends never changes a sum", correct: true, feedback: `Correct — addition lets you group in any order; 20 + 25 and the left-to-right path both reach 45.` },
      { label: "Yes — the parentheses add extra", correct: false, feedback: `Parentheses only choose which pair goes first; they contribute nothing of their own.` },
      { label: "Only if the answer stays under 20", correct: false, feedback: `The regrouping freedom has no size limit — it is a property of addition itself.` },
      { label: "Yes — 3 must always join last", correct: false, feedback: `That treats position as a rule, but addends own no fixed turn — 17 + 3 first is exactly the friendly-pair move.` },
    ] };
}
function CheckBackwardNumeric(r) {
  const [a, b, c] = threeSet(r);
  const ans = c + b;
  return { kind: "numeric", form: "Add2DigitNumeric",
    prompt: `${c} + ${b} = ? (re-adding ${a} + ${b} + ${c} from the back to check)`, answer: ans,
    traps: traps2(ans, [[c + a, `The backward path starts ${c} + ${b} — pairing with ${a} skips an addend's turn.`],
                        [b - c > 0 ? b - c : c + b + 2, `Checking re-ADDS in a new order; nothing is taken away.`]]) };
}
function StoryFourNumeric(r) {
  const [a, b, c, d] = fourSet(r);
  const sofar = a + b + c, ans = sofar + d;
  return { kind: "numeric", form: "Add2DigitNumeric",
    prompt: `Maggie's four seed packets hold ${a}, ${b}, ${c}, and ${d} seeds. Three packets made ${sofar}. So ${sofar} + ${d} = ?`, answer: ans,
    traps: traps2(ans, [[sofar, `The fourth packet never emptied into the count — its ${d} seeds belong in the total.`],
                        [sofar + 4, `That added the NUMBER of packets; the last packet holds ${d} seeds, not 4.`]]) };
}

const REUSE = { Stage1of3, Stage2of3, Stage2of4, Stage3of4, MakeTenPairNumeric, AfterTenNumeric,
  ByPlaceMcq, FriendlyPairMcq, OrderFreeMcq: () => OrderFreeMcq(), CheckBackwardNumeric, StoryFourNumeric };

function reused(mirror, seedStr, hints, ev,
                fallback = "Stage the sum: pick a pair, bank the total, and let each remaining addend join one at a time.") {
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
    if (out.form) { must(REGISTERED.has(out.form), `${mirror}: ${out.form} not registered`); step.variant = { gen: GEN, form: out.form }; }
    return step;
  }
  must(REGISTERED.has(out.form), `${mirror}: ${out.form} NOT registered`);
  const commonErrors = out.traps;
  must(commonErrors.length >= 2, `${mirror} needs 2 traps`);
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `${mirror} duplicate traps`);
  for (const e of commonErrors) {
    must(e.value !== out.answer, `${mirror} trap==answer`);
    must(e.feedback.length >= 25, `${mirror} trap feedback short`);
  }
  return { variant: { gen: GEN, form: out.form },
    widget: { type: "numeric", prompt: out.prompt, answer: out.answer, tolerance: 0, unit: "",
      commonErrors, fallbackFeedback: fallback, successFeedback: `Correct — ${out.answer}.` },
    hints, ev };
}

/* ---------------- manipulatives ---------------- */
function tileTap(prompt, tiles, correctIds, mode, fbFor) {
  const cols = tiles.length;
  const hotspots = tiles.map((t, i) => {
    const h = { id: t.id, x: Math.round(((i + 0.5) / cols) * 100), y: 50,
      label: String(t.v), icon: "▮", count: 1 };
    if (correctIds.includes(t.id)) h.correct = true; else h.feedback = fbFor(t);
    return h;
  });
  must(new Set(hotspots.map((h) => h.id)).size === hotspots.length, "tile ids unique");
  const dfb = hotspots.filter((h) => !h.correct).map((h) => h.feedback);
  must(dfb.every((f) => f && f.length >= 25), "tile distractor feedback");
  must(new Set(dfb).size === dfb.length, "tile distractor feedback distinct");
  return { type: "tapDiagram", prompt, mode, canvas: { w: cols, h: 1 }, hotspots,
    missFeedback: "Look at the ONES digits — the friendly pair is the one whose ones complete a ten.",
    successFeedback: "That pair's ones complete a ten — banking it first makes the rest easy." };
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
    commonLandings, missFeedback: `Each hop adds ${hopSize}. From ${start}, ${hops} hops land on ${land}.`,
    successFeedback: success };
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`Regrouping addends changes the ORDER of joining, never the total — every staging of the sum must land on the same number for ${tag.replace(/-/g, " ")}.`],
  misconceptions: [`Believing the grouping or order of addends can change a sum, or letting an addend join twice or not at all while restaging.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `four-addends-g2:${tag}`, delayed: true,
  counterfactualPrompt: "Which single change to the staging would actually change the total — and which only changes the path?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  stage: ["Pick a pair and add it.", "Bank the running total.", "Let each addend join once."],
  tens: ["Scan the ones digits.", "Find the two that make ten.", "Bank the ten, then continue."],
  place: ["Tens with tens, ones with ones.", "Two small sums.", "Rejoin them at the end."],
  check: ["Re-add in a different order.", "The totals must agree.", "Disagreement means recount."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Three addends join two at a time: pick a pair, add it, then let the last addend join the running total.",
  "The sum never asks you to hold three numbers at once — staging turns one hard join into two easy ones.",
  { rep: "number-line", widget: () => hop("Show 24 + 13 + 10 in stages: from 37, one ten-hop for the last addend.", 20, 60, 37, 10, 1,
      "Landed on 47 — the pair banked 37, and the last addend hopped it home.",
      [[38, "That hop added one — the last addend here is a whole ten."]]),
    predict: P("24 + 13 + 10: can you add just two of them first?", [{ id: "yes", label: "Yes — pair, then join the third" }, { id: "no", label: "No — all three at once" }], "yes",
      "Addition happily goes two at a time: 24 + 13 = 37, then 37 + 10 = 47.") },
  [
    reused("Stage1of3", "g2n1-k1", H.stage, ["The first pair opens the sum.", "Its total becomes the base."]),
    reused("Stage2of3", "g2n1-k2", H.stage, ["The last addend joins the base.", "One join at a time."]),
    reused("OrderFreeMcq", "g2n1-k3", H.stage, ["Grouping is free in addition.", "Every path lands together."]),
    reused("Stage2of3", "g2n1-ch1", H.stage, ["New numbers, same staging.", "Pair, bank, join."]),
  ],
  ["Add two at a time.", "Bank the running total.", "The last addend joins it."],
  "next: a fourth addend joins the line.");

def(2,
  "Four addends are just one more stage: pair, bank, join, join. The running total carries you the whole way.",
  "Nothing new happens at four — the same two-at-a-time move repeats until every addend has had its turn.",
  { rep: "number-line", widget: () => hop("Four addends staged: the total reached 55; the last addend is 10. Hop it.", 40, 80, 55, 10, 1,
      "Landed on 65 — four addends, three joins, one steady total.",
      [[56, "A one-hop — this final addend is worth a full ten."]]),
    predict: P("Adding four numbers needs how many joins?", [{ id: "three", label: "Three joins" }, { id: "four", label: "Four joins" }], "three",
      "Each join folds in one more addend: pair (1), third (2), fourth (3).") },
  [
    reused("Stage2of4", "g2n2-k1", H.stage, ["The third addend joins the pair's total.", "Same move as before."]),
    reused("Stage3of4", "g2n2-k2", H.stage, ["The fourth addend finishes it.", "Every addend joined once."]),
    reused("OrderFreeMcq", "g2n2-k3", H.stage, ["Regrouping stays free at four.", "The total is path-proof."]),
    reused("Stage3of4", "g2n2-ch1", H.stage, ["Longer sums, same rhythm.", "Pair, bank, join, join."]),
  ],
  ["Four addends, three joins.", "The rhythm repeats.", "The running total carries you."],
  "next: choosing WHICH pair to add first.");

def(3,
  "Scan the ones digits before you start: two addends whose ones make a ten are a friendly pair — add them first and bank a clean ten.",
  "38 + 25 + 12: the 8 and the 2 call to each other. 38 + 12 = 50, and 50 + 25 is easy street.",
  { rep: "diagram", widget: () => tileTap("Tap the TWO addends whose ones make a ten: 38, 25, 12.",
      [{ id: "t38", v: 38 }, { id: "t25", v: 25 }, { id: "t12", v: 12 }], ["t38", "t12"], "selectAll",
      (t) => `${t.v} has ${t.v % 10} ones — with 8 that makes ${8 + t.v % 10}, missing the clean ten that 8 + 2 delivers.`),
    predict: P("In 38 + 25 + 12, which pair lands on a ten?", [{ id: "outer", label: "38 and 12" }, { id: "first", label: "38 and 25" }], "outer",
      "8 ones + 2 ones = 10, so 38 + 12 = 50 exactly — the middle addend waits its turn.") },
  [
    reused("MakeTenPairNumeric", "g2n3-k1", H.tens, ["The chosen ones complete a ten.", "The pair lands cleanly."]),
    reused("AfterTenNumeric", "g2n3-k2", H.tens, ["From the clean ten, join the rest.", "Tens make easy bases."]),
    reused("FriendlyPairMcq", "g2n3-k3", H.tens, ["Judge pairs by their ones.", "Position and size mislead."]),
    reused("MakeTenPairNumeric", "g2n3-ch1", H.tens, ["Spot the pair before adding.", "Scanning first saves work."]),
  ],
  ["Scan the ones first.", "Pair the ten-makers.", "Bank the clean ten."],
  "next: splitting every addend by place.");

def(4,
  "Another road: split EVERY addend into tens and ones, add all the tens, add all the ones, then rejoin the two piles.",
  "34 + 25 splits into 30 + 20 and 4 + 5 — two small sums, 50 and 9, rebuild the answer 59.",
  { rep: "number-line", widget: () => hop("Tens pile first: 30 + 20 banked 50. Now hop the ones pile of 9... shown as one 9-hop? No — hop by ones is slow. Hop the banked 50 by one ten to preview 60, the neighborhood of the answer.", 40, 70, 50, 10, 1,
      "Landed on 60 — the real answer 59 lives one step below; the tens pile put you in the right neighborhood.",
      [[51, "That hop is a single one — the preview hop here is a full ten."]]),
    predict: P("Split 34 + 25 by place: what are the two piles?", [{ id: "right", label: "30 + 20 and 4 + 5" }, { id: "cross", label: "30 + 5 and 4 + 20" }], "right",
      "Tens meet tens and ones meet ones — crossing them mixes unit sizes.") },
  [
    reused("ByPlaceMcq", "g2n4-k1", H.place, ["Tens with tens, ones with ones.", "Same-size units add cleanly."]),
    reused("Stage1of3", "g2n4-k2", H.place, ["The piles are just a staging choice.", "The total is unmoved."]),
    reused("ByPlaceMcq", "g2n4-k3", H.place, ["Spot the crossed split.", "Unit sizes must match."]),
    reused("Stage2of3", "g2n4-ch1", H.place, ["Either road, same landing.", "Choose the one you see fastest."]),
  ],
  ["Split every addend by place.", "Add tens, add ones.", "Rejoin the two piles."],
  "next: friendly pairs as a habit.");

def(5,
  "Friendly pairing is a habit, not a trick: before any long sum, spend three seconds scanning for ones that complete each other.",
  "The scan costs almost nothing and often replaces a trade with a clean ten — the cheapest work you will ever skip.",
  { rep: "diagram", widget: () => tileTap("Tap the friendly pair in 46, 23, 14: the ones that make a ten.",
      [{ id: "t46", v: 46 }, { id: "t23", v: 23 }, { id: "t14", v: 14 }], ["t46", "t14"], "selectAll",
      (t) => `${t.v} carries ${t.v % 10} ones — 6 needs a 4, and ${t.v % 10} is not it.`),
    predict: P("46 + 23 + 14: scan the ones. Which two complete a ten?", [{ id: "pair", label: "46 and 14 (6 + 4)" }, { id: "none", label: "No pair exists" }], "pair",
      "6 + 4 = 10, so 46 + 14 = 60 — the scan found free simplicity.") },
  [
    reused("MakeTenPairNumeric", "g2n5-k1", H.tens, ["The scan comes before the adding.", "Ones that sum to ten."]),
    reused("AfterTenNumeric", "g2n5-k2", H.tens, ["Ride the clean ten onward.", "The leftover joins gently."]),
    reused("FriendlyPairMcq", "g2n5-k3", H.tens, ["Habit beats habit-less speed.", "Three seconds, one trade saved."]),
    reused("AfterTenNumeric", "g2n5-ch1", H.tens, ["Scan, pair, bank, finish.", "The rhythm becomes automatic."]),
  ],
  ["Scan before adding.", "Ones that complete each other.", "A found pair is free work."],
  "next: keeping the running total honest.");

def(6,
  "The running total is your only cargo — say it after every join, and a long sum becomes a short walk with a full backpack.",
  "Losing the total mid-sum is the classic long-sum error; the fix is narration, not talent.",
  { rep: "number-line", widget: () => hop("Track the total aloud: from 42, three ten-hops. Say each landing.", 30, 90, 42, 10, 3,
      "52, 62, 72 — three narrated landings, zero lost cargo.",
      [[45, "Those were one-steps; each narrated hop banks a full ten."]]),
    predict: P("Halfway through a four-addend sum you pause. What must you still know?", [{ id: "total", label: "The running total so far" }, { id: "first", label: "Only the first addend" }], "total",
      "The total-so-far is the whole state of the sum — with it, any pause is safe.") },
  [
    reused("Stage2of4", "g2n6-k1", H.stage, ["Say the total after each join.", "Narration protects it."]),
    reused("Stage3of4", "g2n6-k2", H.stage, ["The last join lands the answer.", "Cargo delivered."]),
    reused("OrderFreeMcq", "g2n6-k3", H.stage, ["Any order — IF the total survives.", "Narration makes it survive."]),
    reused("Stage3of4", "g2n6-ch1", H.stage, ["Longer walks, same backpack.", "Speak each landing."]),
  ],
  ["The running total is the cargo.", "Narrate every join.", "A safe pause needs only the total."],
  "next: four-addend stories.");

def(7,
  "Stories hand you the addends in disguise — seed packets, trail miles, sticker sheets. Name them, then stage the sum exactly as before.",
  "The arithmetic never changes costume: find the numbers, pick a friendly order, and walk the running total home.",
  { rep: "number-line", widget: () => hop("Four packets staged: three banked 61; the last packet holds 10 seeds. Hop it.", 50, 90, 61, 10, 1,
      "71 seeds — the story's four packets, walked home one join at a time.",
      [[62, "A single seed's hop — the final packet holds a full ten."]]),
    predict: P("A story lists four amounts and asks for the total. What is the first move?", [{ id: "name", label: "Name the four addends" }, { id: "guess", label: "Guess near the biggest" }], "name",
      "Every staged sum starts by knowing exactly what is being joined.") },
  [
    reused("StoryFourNumeric", "g2n7-k1", H.stage, ["Pull the addends from the story.", "Then stage as usual."]),
    reused("StoryFourNumeric", "g2n7-k2", H.stage, ["Beware counting the containers.", "Add what is IN them."]),
    reused("FriendlyPairMcq", "g2n7-k3", H.tens, ["Stories allow friendly pairs too.", "Scan the ones as always."]),
    reused("StoryFourNumeric", "g2n7-ch1", H.stage, ["New story, same walk.", "Name, stage, narrate, land."]),
  ],
  ["Name the addends first.", "Stage the sum as always.", "Add contents, not containers."],
  "next: checking a long sum.");

def(8,
  "To check a long sum, re-add it in a DIFFERENT order — front-to-back the first time, back-to-front the second. Matching totals is powerful evidence.",
  "The check works because regrouping cannot change a sum: if two honest paths disagree, one of them miscounted, and you get to find out now.",
  { rep: "number-line", widget: () => hop("Backward check: starting from the back pair's 29, hop the remaining ten-addend.", 20, 60, 29, 10, 1,
      "39 — the backward path lands with the forward one, and the sum is confirmed.",
      [[30, "One step is a single one — the remaining addend is a whole ten."]]),
    predict: P("Forward gave 84; backward gives 84. What did you learn?", [{ id: "strong", label: "Strong evidence the sum is right" }, { id: "nothing", label: "Nothing — orders differ" }], "strong",
      "Two independent paths agreeing is exactly what a correct total looks like.") },
  [
    reused("CheckBackwardNumeric", "g2n8-k1", H.check, ["Start from the other end.", "Pair, bank, join again."]),
    reused("CheckBackwardNumeric", "g2n8-k2", H.check, ["A fresh order, a fresh path.", "The landing must match."]),
    reused("OrderFreeMcq", "g2n8-k3", H.check, ["Why checking works at all.", "Regrouping is total-proof."]),
    reused("StoryFourNumeric", "g2n8-ch1", H.stage, ["Solve, then re-walk backwards.", "Agreement seals it."]),
  ],
  ["Check by re-adding differently.", "Matching paths mean confidence.", "Disagreement means recount now."],
  "course complete: long sums staged, scanned, narrated, and checked.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 8, `8 lessons defined, got ${L.length}`);
const chapterTitles = ["Three, Then Four", "Strategies That Tame the Sum", "Stories and Checks"];
const perChapter = [3, 3, 2];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 3 ? 1 : n <= 6 ? 2 : 3);
const outDir = join(root, "content/courses/four-addends-g2");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g2n-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "diagram") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "four-addends-g2",
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
    if (w.type === "tapDiagram") {
      const nc = w.hotspots.filter((h) => h.correct).length;
      must(nc >= 1, `${id}/${s.id} tapDiagram needs a correct hotspot`);
      if (w.mode === "selectOne") must(nc === 1, `${id}/${s.id} selectOne exactly one`);
      const dfb = w.hotspots.filter((h) => !h.correct).map((h) => h.feedback);
      for (const f of dfb) must(f && f.length >= 25, `${id}/${s.id} distractor feedback`);
      must(new Set(dfb).size === dfb.length, `${id}/${s.id} distractor feedback not distinct`);
    }
    if (w.type === "numberLineHop") {
      const land = w.start + w.hop * w.hops;
      must(land >= w.min && land <= w.max, `${id}/${s.id} hop land outside range`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) {
      must(s.variant.gen === GEN, `${id}/${s.id} unexpected gen`);
      must(REGISTERED.has(s.variant.form), `${id}/${s.id} form ${s.variant.form} not registered`);
    }
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "four-addends-g2", slug: "four-addends-g2", title: spec.title,
  tagline: "Pair it, bank it, walk it home — long sums tamed by staging, scanning, and honest checks.",
  category: "Math", gradeLevel: 2, chapters,
}, null, 2) + "\n");
console.log(`built 8 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
