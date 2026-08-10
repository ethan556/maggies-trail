#!/usr/bin/env node
// S194 — PROTOCOL v3/v4, Batch C course 1/6: add-subtract-1000-g2 (2.NBT.B.7/B.8/B.9).
//
// FIT-CHECK RESULT: zero new generator code. g2-place-value-1000 already registers the exact
// routes this standard needs (g2Independent.cjs):
//   Pv1000AddByPlaceNumeric / Pv1000AddTradeNumeric /
//   Pv1000SubtractByPlaceNumeric / Pv1000SubtractTradeNumeric -> arithmetic(prompt)
//     (matches the FIRST "a + b" or "a − b" in the prompt — so every graded numeric contains its
//      symbolic expression, including story lessons, which append "So a + b = ?")
//   Pv1000SkipTensNumeric      -> n[last] + 10   ("ten more than N")
//   Pv1000SkipHundredsNumeric  -> n[last] + 100  ("one hundred more than N")
//   Pv1000TradingNumeric       -> 100*n0 + 10*n1 + n2  ("H hundreds, T tens, O ones" — T may
//      exceed 9, which IS the why-trading insight: 2 hundreds 14 tens 3 ones = 343)
// "Ten less" / "hundred less" have no dedicated route; they are authored as the symbolic
// subtraction ("467 − 10 = ?") on the SubtractByPlace arithmetic route — same mathematics,
// registered parse. Manipulatives: baseTenCompose (requireStandard:false permits 14-tens builds)
// and numberLineHop. Reasoning MCQs carry no variant (family has only Pv1000OrderMixedMcq, which
// is order-specific; 217+ corpus checks already omit variant).
//
// S191-193 lessons baked in: declared forms asserted against the REGISTERED list; correct MCQ
// option stays at index 0 (render-time seeded shuffle is the randomizer); >=4 options; trap and
// label collision guards; feedback leads with the diagnosis (never a bare "No ...").
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "add-subtract-1000-g2");
if (!spec || spec.lessons.length !== 16) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

const REGISTERED = new Set([
  "Pv1000AddByPlaceNumeric","Pv1000AddTradeNumeric","Pv1000BuildNumberNumeric",
  "Pv1000CountForwardNumeric","Pv1000DigitWorthNumeric","Pv1000MixedNumeric",
  "Pv1000OrderMixedMcq","Pv1000OrderMixedNumeric","Pv1000ReadWordsNumeric",
  "Pv1000RealworldNumeric","Pv1000SkipFivesNumeric","Pv1000SkipHundredsNumeric",
  "Pv1000SkipTensNumeric","Pv1000SubtractByPlaceNumeric","Pv1000SubtractTradeNumeric",
  "Pv1000TradingNumeric","Pv1000WriteWordsBuildExpression",
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
const H100 = (x) => Math.floor(x / 100), T10 = (x) => Math.floor((x % 100) / 10), O1 = (x) => x % 10;

/* Collision-safe trap assembly: keep the first two candidates distinct from the answer and from
 * each other; fall back to answer+10 which can never equal the answer. */
function traps2(answer, cands) {
  const out = [];
  for (const [v, fb] of cands) {
    if (v !== answer && v >= 0 && !out.some((o) => o[0] === v)) out.push([v, fb]);
    if (out.length === 2) break;
  }
  while (out.length < 2) {
    const v = answer + 10 + out.length;
    out.push([v, "That total does not match a careful place-by-place recount of this problem."]);
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

/* ---------- numeric mirrors (every prompt parses under its declared registered route) ---------- */
function AddHundredsNumeric(r) {
  const a = pick(r, 2, 6) * 100, b = pick(r, 1, Math.min(3, 9 - a / 100)) * 100;
  const ans = a + b;
  return { form: "Pv1000AddByPlaceNumeric", prompt: `${a} + ${b} = ?`, answer: ans,
    traps: traps2(ans, [[a + b / 100, `That added ${b / 100} ones instead of ${b / 100} hundreds — the second addend is whole hundreds.`],
                        [a - b, `That subtracted the hundreds; joining two amounts calls for addition.`]]) };
}
function AddNoTradeNumeric(r) {
  const a = 100 * pick(r, 1, 5) + 10 * pick(r, 1, 4) + pick(r, 1, 4);
  const b = 100 * pick(r, 1, 3) + 10 * pick(r, 1, 4) + pick(r, 1, 4);
  const ans = a + b;
  return { form: "Pv1000AddByPlaceNumeric", prompt: `${a} + ${b} = ?`, answer: ans,
    traps: traps2(ans, [[ans - 100, `That dropped one of the hundreds while combining — re-add the hundreds place.`],
                        [ans - 10, `That lost a ten along the way — check the tens column again.`]]) };
}
function AddTradeOnesNumeric(r) {
  const oa = pick(r, 5, 8), ob = pick(r, 9 - oa + 1, 9);
  const a = 100 * pick(r, 1, 4) + 10 * pick(r, 1, 4) + oa;
  const b = 100 * pick(r, 1, 3) + 10 * pick(r, 1, 3) + ob;
  const ans = a + b;
  must(oa + ob >= 10 && T10(a) + T10(b) + 1 <= 9, "trade-ones setup must trade only ones");
  return { form: "Pv1000AddTradeNumeric", prompt: `${a} + ${b} = ?`, answer: ans,
    traps: traps2(ans, [[ans - 10, `The ten ones you traded never arrived in the tens place — carry the new ten across.`],
                        [ans + 10, `That counted the traded ten twice: once as ten ones and again as a ten.`]]) };
}
function AddTradeTensNumeric(r) {
  const ta = pick(r, 5, 8), tb = pick(r, 10 - ta, 9);
  const a = 100 * pick(r, 1, 4) + 10 * ta + pick(r, 1, 4);
  const b = 100 * pick(r, 1, 3) + 10 * tb + pick(r, 1, 4);
  const ans = a + b;
  must(ta + tb >= 10 && O1(a) + O1(b) <= 9, "trade-tens setup must trade only tens");
  return { form: "Pv1000AddTradeNumeric", prompt: `${a} + ${b} = ?`, answer: ans,
    traps: traps2(ans, [[ans - 100, `The ten tens you bundled never became a hundred — carry it into the hundreds place.`],
                        [ans + 100, `That counted the bundled hundred twice: once as ten tens and again as a hundred.`]]) };
}
function AddTwoTradesNumeric(r) {
  const oa = pick(r, 5, 8), ob = pick(r, 10 - oa, 9);
  const ta = pick(r, 5, 8), tb = pick(r, 9 - ta, 9 - 1);
  const a = 100 * pick(r, 1, 3) + 10 * ta + oa;
  const b = 100 * pick(r, 1, 3) + 10 * tb + ob;
  const ans = a + b;
  must(oa + ob >= 10 && ta + tb + 1 >= 10, "two-trades setup must trade twice");
  return { form: "Pv1000AddTradeNumeric", prompt: `${a} + ${b} = ?`, answer: ans,
    traps: traps2(ans, [[ans - 110, `Both trades went missing — the new ten AND the new hundred must be carried.`],
                        [ans - 100, `The ones trade landed but the tens trade did not — bundle those ten tens into a hundred.`]]) };
}
function SubNoTradeNumeric(r) {
  const b = 100 * pick(r, 1, 3) + 10 * pick(r, 1, 4) + pick(r, 1, 4);
  const a = b + 100 * pick(r, 1, 3) + 10 * pick(r, 1, 4) + pick(r, 1, 4);
  const ans = a - b;
  must(O1(a) >= O1(b) && T10(a) >= T10(b), "sub-no-trade must not require trading");
  return { form: "Pv1000SubtractByPlaceNumeric", prompt: `${a} − ${b} = ?`, answer: ans,
    traps: traps2(ans, [[a + b, `That joined the two amounts; taking away calls for subtraction.`],
                        [ans + 10, `A ten slipped back in — subtract each place carefully.`]]) };
}
function SubBreakTenNumeric(r) {
  const ob = pick(r, 5, 9); const oa = pick(r, 1, ob - 1);
  const ta = pick(r, 2, 8), tb = pick(r, 1, ta - 1);
  const ha = pick(r, 2, 6), hb = pick(r, 1, ha - 1);
  const a = 100 * ha + 10 * ta + oa, b = 100 * hb + 10 * tb + ob;
  const ans = a - b;
  must(oa < ob && ta - 1 >= tb, "break-ten setup: ones need a broken ten, tens must then suffice");
  return { form: "Pv1000SubtractTradeNumeric", prompt: `${a} − ${b} = ?`, answer: ans,
    traps: traps2(ans, [[ans + 10, `The broken ten was never removed from the tens place — after opening it, one fewer ten remains.`],
                        [a - (100 * hb + 10 * tb + oa) + (oa - ob) + 2 * (ob - oa), `That flipped the ones to "big minus small" (${ob} − ${oa}); the ten must be broken instead.`]]) };
}
function SubBreakHundredNumeric(r) {
  const tb = pick(r, 5, 9); const ta = pick(r, 1, tb - 1);
  const oa = pick(r, 5, 9), ob = pick(r, 1, oa - 1);
  const ha = pick(r, 3, 7), hb = pick(r, 1, ha - 1);
  const a = 100 * ha + 10 * ta + oa, b = 100 * hb + 10 * tb + ob;
  const ans = a - b;
  must(ta < tb && oa >= ob, "break-hundred setup: tens need a broken hundred, ones must not");
  return { form: "Pv1000SubtractTradeNumeric", prompt: `${a} − ${b} = ?`, answer: ans,
    traps: traps2(ans, [[ans + 100, `The opened hundred was never removed — after breaking it, one fewer hundred remains.`],
                        [ans - 10, `Ten tens arrived from the hundred, but one of them went missing before subtracting.`]]) };
}
function SubAcrossZeroNumeric(r) {
  const a = 100 * pick(r, 3, 7) + pick(r, 1, 5); // tens digit is 0
  const b = 100 * pick(r, 1, H100(a) - 1) + 10 * pick(r, 3, 8) + pick(r, O1(a) + 1, 9);
  const ans = a - b;
  must(T10(a) === 0 && O1(a) < O1(b), "across-zero setup: zero tens and ones needing a trade");
  return { form: "Pv1000SubtractTradeNumeric", prompt: `${a} − ${b} = ?`, answer: ans,
    traps: traps2(ans, [[ans + 100, `The hundred you opened to feed the zero tens was never taken out of the hundreds.`],
                        [ans + 10, `The ten you broke for the ones still sits whole in the tens place — remove it.`]]) };
}
function TenMoreNumeric(r) {
  const a = 100 * pick(r, 1, 8) + 10 * pick(r, 1, 8) + pick(r, 1, 9);
  return { form: "Pv1000SkipTensNumeric", prompt: `What is ten more than ${a}?`, answer: a + 10,
    traps: traps2(a + 10, [[a + 1, `That moved one ONE, not one TEN — ten more changes the tens digit.`],
                           [a + 100, `That jumped a whole hundred; ten more is the smaller move.`]]) };
}
function TenLessNumeric(r) {
  const a = 100 * pick(r, 1, 8) + 10 * pick(r, 1, 8) + pick(r, 1, 9);
  return { form: "Pv1000SubtractByPlaceNumeric", prompt: `${a} − 10 = ?`, answer: a - 10,
    traps: traps2(a - 10, [[a - 1, `That removed one ONE, not one TEN — the tens digit is the one that drops.`],
                           [a - 100, `That removed a whole hundred; ten less is the smaller step.`]]) };
}
function HundredMoreNumeric(r) {
  const a = 100 * pick(r, 1, 7) + 10 * pick(r, 1, 8) + pick(r, 1, 9);
  return { form: "Pv1000SkipHundredsNumeric", prompt: `What is one hundred more than ${a}?`, answer: a + 100,
    traps: traps2(a + 100, [[a + 10, `That moved one TEN; one hundred more changes the hundreds digit.`],
                            [a + 1, `That added a single one — a hundred is a much larger jump.`]]) };
}
function HundredLessNumeric(r) {
  const a = 100 * pick(r, 2, 8) + 10 * pick(r, 1, 8) + pick(r, 1, 9);
  return { form: "Pv1000SubtractByPlaceNumeric", prompt: `${a} − 100 = ?`, answer: a - 100,
    traps: traps2(a - 100, [[a - 10, `That dropped one TEN; one hundred less lowers the hundreds digit.`],
                            [a + 100, `That went UP a hundred — "less" moves down the number line.`]]) };
}
function OpenLineAddNumeric(r) {
  const a = 100 * pick(r, 2, 6) + 10 * pick(r, 1, 5) + pick(r, 1, 5);
  const jump = 10 * pick(r, 2, 5);
  return { form: "Pv1000AddByPlaceNumeric", prompt: `${a} + ${jump} = ?`, answer: a + jump,
    traps: traps2(a + jump, [[a + jump / 10, `That hopped by ONES; each jump here is a whole ten.`],
                             [a + jump + 10, `One hop too many — count the tens jumps exactly.`]]) };
}
function WhyTradeNumeric(r) {
  const h = pick(r, 1, 4), t = pick(r, 11, 17), o = pick(r, 1, 8);
  const ans = 100 * h + 10 * t + o;
  return { form: "Pv1000TradingNumeric",
    prompt: `${h} hundreds, ${t} tens, and ${o} ones make what number?`, answer: ans,
    traps: traps2(ans, [[100 * h + 10 * (t - 10) + o, `The ten tens you can bundle into a hundred vanished instead of trading up.`],
                        [100 * (h + t) + o, `That treated every ten as a hundred; only groups of TEN tens trade up.`]]) };
}
function StoryAddNumeric(r) {
  const a = 100 * pick(r, 1, 4) + 10 * pick(r, 2, 7) + pick(r, 3, 8);
  const b = 100 * pick(r, 1, 3) + 10 * pick(r, 2, 6) + pick(r, 2, 9 - O1(a) + 3);
  const ans = a + b;
  return { form: "Pv1000RealworldNumeric",
    prompt: `Maggie's trail log shows ${a} steps before lunch and ${b} steps after. So ${a} + ${b} = ?`, answer: ans,
    traps: traps2(ans, [[a - b > 0 ? a - b : a + b + 10, `That found how many MORE the morning had; the log wants the whole day joined.`],
                        [ans - 10, `A traded ten went missing — carry every trade into its place.`]]) };
}
function StorySubNumeric(r) {
  const b = 100 * pick(r, 1, 3) + 10 * pick(r, 2, 6) + pick(r, 4, 9);
  const a = b + 100 * pick(r, 1, 3) + 10 * pick(r, 1, 3) + pick(r, 1, 3);
  const ans = a - b;
  return { form: "Pv1000RealworldNumeric",
    prompt: `The summit sits ${a} meters up; Maggie has climbed ${b} meters. So ${a} − ${b} = ?`, answer: ans,
    traps: traps2(ans, [[a + b, `That stacked the two heights together; the question asks what REMAINS to climb.`],
                        [ans + 10, `A broken ten was not removed from the tens place during the trade.`]]) };
}

/* ---------- MCQ mirrors (reasoning; no registered fit -> no variant, per corpus precedent) ---------- */
function WhyTradeMcq(r) {
  const t = pick(r, 11, 16);
  const opts = [
    { label: `Trade ten of the tens for one hundred`, correct: true, feedback: `Correct — ten tens and one hundred are the same amount, so trading changes the form, never the value.` },
    { label: `Throw away the extra tens`, correct: false, feedback: `Discarding tens shrinks the number; a trade must keep the total exactly equal.` },
    { label: `Turn each ten into a hundred`, correct: false, feedback: `One ten is worth ten, not a hundred; only a GROUP of ten tens equals one hundred.` },
    { label: `Leave ${t} tens — numbers cannot hold that many`, correct: false, feedback: `A number can hold ${t} tens perfectly well; standard form just prefers the traded version.` },
  ];
  return { prompt: `A build shows ${t} tens. What does trading do with them?`, options: opts };
}
function MethodChoiceMcq(r) {
  const kind = pick(r, 0, 2);
  if (kind === 0) {
    const a = 100 * pick(r, 2, 5) + 99; const add = pick(r, 2, 4) * 100;
    const opts = [
      { label: `Mental math — just add the hundreds`, correct: true, feedback: `Correct — adding ${add} changes only the hundreds digit, so no written work is needed.` },
      { label: `Column addition with trades`, correct: false, feedback: `Columns work, but there is nothing to trade when only hundreds change — mental is faster.` },
      { label: `Draw every block`, correct: false, feedback: `Drawing ${a} in blocks takes minutes for a one-digit change; save drawings for tricky trades.` },
      { label: `Guess and check`, correct: false, feedback: `Guessing ignores the place-value structure that makes this instant.` },
    ];
    return { prompt: `Which method fits ${a} + ${add} best?`, options: opts };
  }
  if (kind === 1) {
    const a = 100 * pick(r, 3, 6) + 2; const b = 100 * pick(r, 1, 2) + 10 * pick(r, 4, 8) + 8;
    const opts = [
      { label: `Careful column work — trades are coming`, correct: true, feedback: `Correct — the ones (2 − 8) and likely the tens both need trades, so written columns keep them straight.` },
      { label: `Pure mental math`, correct: false, feedback: `Two trades held in the head at once is where mental slips happen; paper earns its keep here.` },
      { label: `Round both and call it done`, correct: false, feedback: `Rounding gives an estimate to CHECK with, not the exact answer the problem asks for.` },
      { label: `Skip-count by fives`, correct: false, feedback: `Skip-counting suits equal groups; this is a take-away with trades.` },
    ];
    return { prompt: `Which method fits ${a} − ${b} best?`, options: opts };
  }
  const opts = [
    { label: `An open number line with friendly jumps`, correct: true, feedback: `Correct — jumping +100s then +10s keeps a running total you can see, ideal for adding in your head.` },
    { label: `Trading blocks one cube at a time`, correct: false, feedback: `Cube-by-cube counting works but wastes the big friendly jumps this problem offers.` },
    { label: `Writing the word form first`, correct: false, feedback: `Word form renames the number; it does not move the calculation forward.` },
    { label: `Memorizing the answer`, correct: false, feedback: `There is no fact table for three-digit sums; strategies, not memory, carry these.` },
  ];
  return { prompt: `You want to add 199 + 350 in your head. Which tool fits?`, options: opts };
}
function ExplainMcq(r) {
  const a = 100 * pick(r, 2, 5) + 10 * pick(r, 3, 6) + pick(r, 5, 8);
  const opts = [
    { label: `Because ten ones and one ten are equal amounts`, correct: true, feedback: `Correct — the trade is legal exactly because both forms name the same quantity.` },
    { label: `Because the answer gets bigger`, correct: false, feedback: `A valid trade never changes the total at all — that is the whole point of it.` },
    { label: `Because tens look nicer than ones`, correct: false, feedback: `Looks are not the reason; equal VALUE is what licenses the swap.` },
    { label: `Because subtraction requires it every time`, correct: false, feedback: `Many subtractions need no trade; the trade appears only when a place runs short.` },
  ];
  return { prompt: `While solving with ${a}, a student trades ten ones for a ten. Why is that allowed?`, options: opts };
}
function EstimateCheckMcq(r) {
  const a = 100 * pick(r, 2, 4) + 10 * pick(r, 4, 8) + pick(r, 2, 7);
  const b = 100 * pick(r, 1, 2) + 10 * pick(r, 3, 7) + pick(r, 2, 7);
  const est = (Math.round(a / 100) + Math.round(b / 100)) * 100;
  const far = est + 300;
  const opts = [
    { label: `About ${est} — round each and add`, correct: true, feedback: `Correct — rounding to hundreds gives roughly ${est}, a quick sanity check on the exact sum.` },
    { label: `About ${far}`, correct: false, feedback: `That estimate sits hundreds too high; rounding each addend keeps the check honest.` },
    { label: `Exactly ${a + b} — estimates must be exact`, correct: false, feedback: `An estimate trades exactness for speed on purpose; the exact sum is the second step.` },
    { label: `No estimate is possible before solving`, correct: false, feedback: `Rounding first is precisely how you predict the size of an answer before working it.` },
  ];
  return { prompt: `Before computing ${a} + ${b}, about how big should the answer be?`, options: opts };
}

const REUSE = { AddHundredsNumeric, AddNoTradeNumeric, AddTradeOnesNumeric, AddTradeTensNumeric,
  AddTwoTradesNumeric, SubNoTradeNumeric, SubBreakTenNumeric, SubBreakHundredNumeric,
  SubAcrossZeroNumeric, TenMoreNumeric, TenLessNumeric, HundredMoreNumeric, HundredLessNumeric,
  OpenLineAddNumeric, WhyTradeNumeric, StoryAddNumeric, StorySubNumeric,
  WhyTradeMcq, MethodChoiceMcq, ExplainMcq, EstimateCheckMcq };

function reused(mirror, seedStr, hints, ev,
                fallback = "Line the places up — hundreds with hundreds, tens with tens, ones with ones — and work one column at a time.") {
  const r = mulberry32(seedFromString(seedStr));
  const out = REUSE[mirror](r);
  if (out.options) {
    must(out.options.length >= 4, `${mirror} needs >=4 options`);
    must(out.options.filter((o) => o.correct).length === 1, `${mirror} mcq correct count`);
    must(out.options[0].correct === true, `${mirror} correct option must stay at index 0`);
    must(new Set(out.options.map((o) => o.label)).size === out.options.length, `${mirror} duplicate labels`);
    const withIds = out.options.map((o, i) => ({ id: `o${i}`, ...o }));
    for (const o of withIds) must(o.feedback.length >= 25, `${mirror} feedback too short`);
    must(new Set(withIds.map((o) => o.feedback)).size === withIds.length, `${mirror} feedback not distinct`);
    return { widget: { type: "mcq", prompt: out.prompt, options: withIds }, hints, ev };
  }
  must(REGISTERED.has(out.form), `${mirror}: ${out.form} NOT a registered g2-place-value-1000 form`);
  const commonErrors = out.traps;
  must(commonErrors.length >= 2, `${mirror} needs 2 traps`);
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `${mirror} duplicate traps`);
  for (const e of commonErrors) {
    must(e.value !== out.answer, `${mirror} trap==answer`);
    must(e.feedback.length >= 25, `${mirror} trap feedback short`);
  }
  return { variant: { gen: "g2-place-value-1000", form: out.form },
    widget: { type: "numeric", prompt: out.prompt, answer: out.answer, tolerance: 0, unit: "",
      commonErrors, fallbackFeedback: fallback,
      successFeedback: `Correct — ${out.answer}.` },
    hints, ev };
}

/* ---------- manipulatives ---------- */
function compose(prompt, target, opts, success, builds = []) {
  const commonBuilds = builds.map(([hundreds, tens, ones, feedback]) => {
    must(100 * hundreds + 10 * tens + ones !== target || opts.requireStandard,
      `compose trap build equals target non-standardly while standard not required`);
    must(feedback.length >= 25, "compose trap feedback short");
    return { hundreds, tens, ones, feedback };
  });
  return { type: "baseTenCompose", prompt, target,
    requireStandard: opts.requireStandard ?? false,
    maxHundreds: opts.maxHundreds ?? 9,
    maxTens: Math.max(1, opts.maxTens ?? 19), maxOnes: Math.max(9, opts.maxOnes ?? 19),
    commonBuilds,
    missFeedback: `That build names a different number — total each unit's worth and match ${target} exactly.`,
    successFeedback: success };
}
function hop(prompt, min, max, start, hopSize, hops, direction, success, traps = []) {
  const sign = direction === "back" ? -1 : 1;
  const land = start + sign * hopSize * hops;
  must(land >= min && land <= max && start >= min && start <= max, `hop bounds ${start}->${land}`);
  const commonLandings = traps.map(([value, feedback]) => {
    must(value !== land && value >= min && value <= max, `hop trap ${value}`);
    must(feedback.length >= 25, "hop trap feedback short");
    return { value, feedback };
  });
  return { type: "numberLineHop", prompt, min, max, start, hop: hopSize, hops, direction,
    commonLandings, missFeedback: `Each hop is ${hopSize}. From ${start}, ${hops} hops land on ${land}.`,
    successFeedback: success };
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "equivalence-transformation",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`Trading between places changes the FORM of a quantity, never its value — the model and the number must stay equal for ${tag.replace(/-/g, " ")}.`],
  misconceptions: [`Treating a trade as adding or removing amount instead of renaming the same total.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `add-subtract-1000-g2:${tag}`, delayed: true,
  counterfactualPrompt: "What change would make the blocks stop matching the written number?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  place: ["Line up hundreds, tens, and ones.", "Work one place at a time.", "Carry every trade into its column."],
  tradeUp: ["Ten of a small unit equal one of the next.", "Bundle them and move them left.", "The total never changes."],
  tradeDown: ["Open one bigger unit into ten smaller.", "Remove it from its own place first.", "Then subtract normally."],
  mental: ["Only one digit moves.", "Find which place the jump touches.", "Leave the other digits alone."],
  line: ["Big jumps first, small jumps after.", "Track where each hop lands.", "The last landing is the answer."],
  sense: ["Round to friendly numbers first.", "Predict the size of the answer.", "Compare the exact result against it."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Hundreds add just like ones: 3 hundreds and 2 hundreds make 5 hundreds. The place holds, only the count grows.",
  "When both numbers are whole hundreds, the tens and ones stay zero — a one-column addition wearing a big number's clothes.",
  { rep: "diagram", widget: () => compose("Build 500 using flats only.", 500, { maxHundreds: 6, maxTens: 0, maxOnes: 0, requireStandard: true },
      "Five flats — 3 hundreds joined with 2 more make 5 hundreds, 500.",
      [[4, 0, 0, "Four flats build 400 — one hundred short of the join of 300 and 200."]]),
    predict: P("300 + 200: which digit changes?", [{ id: "h", label: "Only the hundreds digit" }, { id: "all", label: "All three digits" }], "h",
      "Whole hundreds touch only the hundreds place; tens and ones stay zero.") },
  [
    reused("AddHundredsNumeric", "g2b1-k1", H.place, ["Hundreds add like single digits.", "The place names the size."]),
    reused("AddHundredsNumeric", "g2b1-k2", H.place, ["Count the flats, then name the number.", "Zeros hold the empty places."]),
    reused("EstimateCheckMcq", "g2b1-k3", H.sense, ["Round first to see the size.", "Then the exact sum has a target."]),
    reused("AddHundredsNumeric", "g2b1-ch1", H.place, ["Bigger hundreds work identically.", "Only the hundreds digit moves."]),
  ],
  ["Hundreds add like ones.", "The place holds the size.", "Zeros keep the empty places."],
  "next: adding when no trade is needed.");

def(2,
  "When every column's digits fit under ten, add place by place: ones with ones, tens with tens, hundreds with hundreds.",
  "Three little additions side by side make one big one — that is all column addition is when nothing trades.",
  { rep: "diagram", widget: () => compose("Build 379 the standard way: 3 flats, 7 rods, 9 cubes.", 379, { maxHundreds: 4, maxTens: 9, maxOnes: 9, requireStandard: true },
      "3 hundreds, 7 tens, 9 ones — each place carries its own count.",
      [[3, 9, 7, "That builds 397 — the rods and cubes swapped places. Tens sit in the middle."]]),
    predict: P("234 + 145: will any column pass nine?", [{ id: "no", label: "No — each column fits" }, { id: "yes", label: "Yes — a trade is coming" }], "no",
      "4+5, 3+4, 2+1 all stay under ten, so the three columns add independently.") },
  [
    reused("AddNoTradeNumeric", "g2b2-k1", H.place, ["Add each column on its own.", "No column passes nine here."]),
    reused("AddNoTradeNumeric", "g2b2-k2", H.place, ["Ones first, then tens, then hundreds.", "Each column's sum stays in place."]),
    reused("EstimateCheckMcq", "g2b2-k3", H.sense, ["Estimate before the exact work.", "The estimate flags wild errors."]),
    reused("AddNoTradeNumeric", "g2b2-ch1", H.place, ["Larger digits, same routine.", "Three small sums, one answer."]),
  ],
  ["Add place by place.", "Ones, then tens, then hundreds.", "No trade when every column fits."],
  "next: when the ones overflow.");

def(3,
  "When the ones column passes nine, ten of those ones bundle into one new ten — the trade moves value left without changing it.",
  "Write the bundled ten above the tens column and add it there. The total is identical before and after the trade.",
  { rep: "diagram", widget: () => compose("Build 62 in standard form — if your cubes pass nine, trade ten of them for a rod.", 62, { maxHundreds: 0, maxTens: 7, maxOnes: 14, requireStandard: true },
      "6 rods and 2 cubes — the twelve loose ones traded ten of themselves into a rod.",
      [[0, 5, 12, "Twelve cubes overflow the ones place — ten of them must bundle into a rod."]]),
    predict: P("7 ones + 8 ones: where does the extra ten go?", [{ id: "tens", label: "Into the tens column" }, { id: "away", label: "It disappears" }], "tens",
      "Ten ones become one ten — the amount moves left, it never vanishes.") },
  [
    reused("AddTradeOnesNumeric", "g2b3-k1", H.tradeUp, ["Bundle ten ones into a ten.", "Carry it into the tens column."]),
    reused("AddTradeOnesNumeric", "g2b3-k2", H.tradeUp, ["The carry is real value, not decoration.", "Add it with the other tens."]),
    reused("ExplainMcq", "g2b3-k3", H.tradeUp, ["A trade is legal because values match.", "Ten ones equal one ten exactly."]),
    reused("AddTradeOnesNumeric", "g2b3-ch1", H.tradeUp, ["Bigger addends, same bundle.", "One trade, carried once."]),
  ],
  ["Ten ones bundle into a ten.", "Carry it left.", "The total never changes."],
  "next: when the tens overflow.");

def(4,
  "Tens overflow the same way: ten tens bundle into one hundred and move into the hundreds column.",
  "The rule repeats at every place — ten of a unit make one of the next size up.",
  { rep: "diagram", widget: () => compose("Build 340 in standard form — if your rods pass nine, trade ten of them for a flat.", 340, { maxHundreds: 4, maxTens: 15, maxOnes: 0, requireStandard: true },
      "3 flats and 4 rods — the fourteen tens traded ten of themselves into a flat.",
      [[2, 14, 0, "Fourteen rods overflow the tens place — ten of them must bundle into a flat."]]),
    predict: P("6 tens + 8 tens: what do ten of those tens become?", [{ id: "hund", label: "One hundred" }, { id: "one", label: "One extra ten" }], "hund",
      "Ten tens are exactly one hundred — the bundle moves into the hundreds place.") },
  [
    reused("AddTradeTensNumeric", "g2b4-k1", H.tradeUp, ["Ten tens make one hundred.", "Carry it into the hundreds."]),
    reused("AddTradeTensNumeric", "g2b4-k2", H.tradeUp, ["The tens column keeps the leftovers.", "The bundle moves left whole."]),
    reused("WhyTradeMcq", "g2b4-k3", H.tradeUp, ["Trading renames, never resizes.", "Equal value is the license."]),
    reused("AddTradeTensNumeric", "g2b4-ch1", H.tradeUp, ["Same bundle, larger numbers.", "One carry into the hundreds."]),
  ],
  ["Ten tens make a hundred.", "Carry moves left.", "Every place obeys the same rule."],
  "next: both trades in one problem.");

def(5,
  "Some sums trade twice: ones bundle into a ten, and then the tens — counting that new ten — bundle into a hundred.",
  "Work right to left and each carry arrives just in time for the next column's addition.",
  { rep: "diagram", widget: () => compose("Build 523 standard — imagine it arrived as 4 flats, 11 rods, 13 cubes.", 523, { maxHundreds: 6, maxTens: 13, maxOnes: 14, requireStandard: true },
      "5 flats, 2 rods, 3 cubes — both overflowing places traded up in turn.",
      [[4, 12, 3, "Twelve rods still overflow — the second trade (ten tens to a flat) is missing."]]),
    predict: P("Ones trade AND tens trade: which happens first working right to left?", [{ id: "ones", label: "The ones trade" }, { id: "tens", label: "The tens trade" }], "ones",
      "Right-to-left order means the ones bundle first — and that new ten joins the tens before THEY bundle.") },
  [
    reused("AddTwoTradesNumeric", "g2b5-k1", H.tradeUp, ["Ones first, then tens.", "Each carry feeds the next column."]),
    reused("AddTwoTradesNumeric", "g2b5-k2", H.tradeUp, ["Two bundles, two carries.", "Track each one into its place."]),
    reused("ExplainMcq", "g2b5-k3", H.tradeUp, ["Both trades keep the total equal.", "Renaming twice is still renaming."]),
    reused("AddTwoTradesNumeric", "g2b5-ch1", H.tradeUp, ["The routine scales without change.", "Right to left, carry by carry."]),
  ],
  ["Two trades, one problem.", "Ones bundle first.", "Each carry feeds the next column."],
  "next: subtracting when no trade is needed.");

def(6,
  "Subtraction also works place by place. When every top digit is big enough, each column subtracts on its own.",
  "Ones from ones, tens from tens, hundreds from hundreds — three small take-aways make the big one.",
  { rep: "diagram", widget: () => compose("Build what remains: 568 take away 234 leaves this number.", 334, { maxHundreds: 5, maxTens: 9, maxOnes: 9, requireStandard: true },
      "3 flats, 3 rods, 4 cubes — each place gave up its own share.",
      [[3, 3, 8, "That kept all 8 ones — but 4 of them were taken away, leaving 4."]]),
    predict: P("568 − 234: does any column need a trade?", [{ id: "no", label: "No — every top digit is bigger" }, { id: "yes", label: "Yes" }], "no",
      "8≥4, 6≥3, 5≥2 — each column can pay from its own supply.") },
  [
    reused("SubNoTradeNumeric", "g2b6-k1", H.place, ["Each column pays its own bill.", "No borrowing needed here."]),
    reused("SubNoTradeNumeric", "g2b6-k2", H.place, ["Ones from ones, tens from tens.", "Keep the columns separate."]),
    reused("EstimateCheckMcq", "g2b6-k3", H.sense, ["Estimate the difference first.", "It catches direction errors."]),
    reused("SubNoTradeNumeric", "g2b6-ch1", H.place, ["Bigger numbers, same columns.", "Three take-aways, one answer."]),
  ],
  ["Subtract place by place.", "Each column pays its own.", "No trade when the top digits suffice."],
  "next: when the ones run short.");

def(7,
  "When the ones run short, break one ten open: it becomes ten ones, and the tens column has one fewer ten.",
  "Breaking is trading downward — same value, smaller pieces, so the ones can pay their bill.",
  { rep: "diagram", widget: () => compose("Show 43 broken for subtraction: 3 rods and 13 cubes.", 43, { maxHundreds: 0, maxTens: 4, maxOnes: 19, requireStandard: false },
      "3 rods and 13 cubes still make 43 — the opened ten just wears a different form.",
      [[0, 4, 13, "4 rods and 13 cubes make 53 — the broken ten must LEAVE the tens place."]]),
    predict: P("You break a ten into ten ones. What happens to the total?", [{ id: "same", label: "It stays the same" }, { id: "less", label: "It gets smaller" }], "same",
      "Breaking renames a ten as ten ones; the value moves, it never shrinks.") },
  [
    reused("SubBreakTenNumeric", "g2b7-k1", H.tradeDown, ["Open a ten into ten ones.", "One fewer ten remains."]),
    reused("SubBreakTenNumeric", "g2b7-k2", H.tradeDown, ["Never flip to big-minus-small.", "Break the ten instead."]),
    reused("ExplainMcq", "g2b7-k3", H.tradeDown, ["Downward trades are equal too.", "Ten ones equal the opened ten."]),
    reused("SubBreakTenNumeric", "g2b7-ch1", H.tradeDown, ["Same break, larger numbers.", "Remove the opened ten first."]),
  ],
  ["Break a ten into ten ones.", "One fewer ten remains.", "Never flip the digits instead."],
  "next: when the tens run short.");

def(8,
  "When the tens run short, break a hundred: it becomes ten tens, and the hundreds column has one fewer.",
  "The downward trade repeats at every place, just like the upward one did.",
  { rep: "diagram", widget: () => compose("Show 320 broken for subtraction: 2 flats and 12 rods.", 320, { maxHundreds: 3, maxTens: 19, maxOnes: 0, requireStandard: false },
      "2 flats and 12 rods still make 320 — the opened hundred became ten fresh tens.",
      [[3, 12, 0, "3 flats and 12 rods make 420 — the broken hundred must LEAVE the hundreds place."]]),
    predict: P("A hundred breaks open. How many tens does it become?", [{ id: "ten", label: "Ten tens" }, { id: "hundred", label: "A hundred tens" }], "ten",
      "One hundred equals exactly ten tens — the same worth in smaller pieces.") },
  [
    reused("SubBreakHundredNumeric", "g2b8-k1", H.tradeDown, ["Open a hundred into ten tens.", "One fewer hundred remains."]),
    reused("SubBreakHundredNumeric", "g2b8-k2", H.tradeDown, ["The new tens join the old ones.", "Then subtract the tens normally."]),
    reused("WhyTradeMcq", "g2b8-k3", H.tradeDown, ["Up or down, trades preserve value.", "Only the form changes."]),
    reused("SubBreakHundredNumeric", "g2b8-ch1", H.tradeDown, ["Bigger numbers, same break.", "Remove the opened hundred first."]),
  ],
  ["Break a hundred into ten tens.", "One fewer hundred remains.", "Then subtract as usual."],
  "next: subtracting across a zero.");

def(9,
  "A zero in the tens means the ones cannot borrow next door — first break a hundred into tens, THEN break one of those tens into ones.",
  "Two downward trades in a row: the value flows hundreds → tens → ones until every column can pay.",
  { rep: "diagram", widget: () => compose("Show 402 double-broken: 3 flats, 9 rods, 12 cubes.", 402, { maxHundreds: 4, maxTens: 19, maxOnes: 19, requireStandard: false },
      "3 flats, 9 rods, 12 cubes still make 402 — the hundred fed the tens, and a ten fed the ones.",
      [[4, 9, 12, "That kept all 4 flats — the broken hundred must leave the hundreds place."],
       [3, 10, 12, "Ten rods plus 12 cubes counts the broken ten twice — one rod became those cubes."]]),
    predict: P("The tens digit is 0 and the ones need help. Where does the value come from?", [{ id: "hund", label: "A hundred breaks first" }, { id: "nowhere", label: "Nowhere — it is impossible" }], "hund",
      "The hundred opens into ten tens, and then one of those tens opens into ten ones.") },
  [
    reused("SubAcrossZeroNumeric", "g2b9-k1", H.tradeDown, ["Break the hundred first.", "Then break one new ten."]),
    reused("SubAcrossZeroNumeric", "g2b9-k2", H.tradeDown, ["Value flows two places right.", "Track both removals."]),
    reused("ExplainMcq", "g2b9-k3", H.tradeDown, ["Chained trades are still equal trades.", "Each link preserves the total."]),
    reused("SubAcrossZeroNumeric", "g2b9-ch1", H.tradeDown, ["The zero is a relay, not a wall.", "Two breaks, then subtract."]),
  ],
  ["A zero relays the trade.", "Hundred to tens, ten to ones.", "Two breaks, then subtract."],
  "next: moving by ten in your head.");

def(10,
  "Ten more or ten less touches only the tens digit. See the number, slide that one digit, and you are done — no columns needed.",
  "457 → 467 → 477: the ones and hundreds stand still while the tens count the journey.",
  { rep: "diagram", widget: () => hop("Hop by tens: three hops forward from 430.", 400, 500, 430, 10, 3, "forward",
      "Landed on 460 — each hop slid the tens digit by exactly one.",
      [[433, "Those hops moved by ONES. A tens hop slides the middle digit: 430 → 440 → 450 → 460."]]),
    predict: P("Ten more than 457: which digit moves?", [{ id: "tens", label: "The tens digit" }, { id: "ones", label: "The ones digit" }], "tens",
      "Adding ten changes 5 tens to 6 tens — 467, with the 4 and the 7 untouched.") },
  [
    reused("TenMoreNumeric", "g2b10-k1", H.mental, ["Only the tens digit slides.", "The rest stand still."]),
    reused("TenLessNumeric", "g2b10-k2", H.mental, ["Ten less slides it down.", "Same digit, other direction."]),
    reused("TenMoreNumeric", "g2b10-k3", H.mental, ["Say the answer, no columns.", "One digit tells the story."]),
    reused("TenLessNumeric", "g2b10-ch1", H.mental, ["Crossing a hundred still works.", "The tens digit wraps with a trade."]),
  ],
  ["Ten more, ten less: one digit.", "The tens digit slides.", "No written work needed."],
  "next: moving by a hundred.");

def(11,
  "A hundred more or less slides only the hundreds digit — an even bigger jump that is even easier to see.",
  "348 → 448 → 548: the tens and ones ride along unchanged.",
  { rep: "diagram", widget: () => hop("Hop by hundreds: two hops forward from 250.", 100, 600, 250, 100, 2, "forward",
      "Landed on 450 — each hop slid the hundreds digit by one.",
      [[270, "Those hops moved by TENS. A hundreds hop slides the front digit: 250 → 350 → 450."]]),
    predict: P("One hundred less than 448: which digit moves?", [{ id: "hund", label: "The hundreds digit" }, { id: "tens", label: "The tens digit" }], "hund",
      "448 drops to 348 — the 4 tens and 8 ones never move.") },
  [
    reused("HundredMoreNumeric", "g2b11-k1", H.mental, ["The hundreds digit slides.", "Everything else rides along."]),
    reused("HundredLessNumeric", "g2b11-k2", H.mental, ["Down works the same way.", "One digit, one step."]),
    reused("HundredMoreNumeric", "g2b11-k3", H.mental, ["Say it without writing.", "The front digit is the dial."]),
    reused("HundredLessNumeric", "g2b11-ch1", H.mental, ["Chain the slides confidently.", "Each step is one digit."]),
  ],
  ["Hundred more, hundred less: the front digit.", "Tens and ones ride along.", "Say it, don't write it."],
  "next: the open number line.");

def(12,
  "An open number line turns addition into jumps: big friendly jumps of hundreds and tens, landing where the answer lives.",
  "467 + 30 is three ten-jumps: 477, 487, 497. The line keeps your running total visible.",
  { rep: "diagram", widget: () => hop("Show 467 + 30: three ten-jumps forward from 467.", 450, 510, 467, 10, 3, "forward",
      "Landed on 497 — the line carried the running total through every hop.",
      [[470, "One hop is only +10 — the sum needs all three ten-jumps to reach 497."]]),
    predict: P("Jumping +10 three times from 467: where do you land?", [{ id: "l497", label: "On 497" }, { id: "l470", label: "On 470" }], "l497",
      "Each hop adds ten: 477, 487, 497 — thirty in all.") },
  [
    reused("OpenLineAddNumeric", "g2b12-k1", H.line, ["Each hop is a whole ten.", "Count hops, not ones."]),
    reused("OpenLineAddNumeric", "g2b12-k2", H.line, ["The last landing is the sum.", "The line remembers for you."]),
    reused("MethodChoiceMcq", "g2b12-k3", H.line, ["Friendly jumps suit mental adding.", "Pick the tool that fits."]),
    reused("OpenLineAddNumeric", "g2b12-ch1", H.line, ["Bigger jumps, same idea.", "Land where the answer lives."]),
  ],
  ["Jumps make adding visible.", "Big jumps first.", "The last landing is the answer."],
  "next: why trading works at all.");

def(13,
  "Trading works because ten of one unit and one of the next are the same amount: 14 tens IS 1 hundred and 4 tens.",
  "A number does not care what form its blocks take — 2 hundreds, 14 tens, 3 ones and 343 are one quantity in two outfits.",
  { rep: "diagram", widget: () => compose("Build 343 as 2 flats, 14 rods, 3 cubes — a legal non-standard form.", 343, { maxHundreds: 4, maxTens: 19, maxOnes: 9, requireStandard: false },
      "2 hundreds, 14 tens, 3 ones — exactly 343 wearing its traded-down outfit.",
      [[2, 4, 3, "2 flats, 4 rods, 3 cubes make only 243 — the ten extra rods are part of the number."]]),
    predict: P("2 hundreds, 14 tens, 3 ones: is that a real number?", [{ id: "yes", label: "Yes — it equals 343" }, { id: "no", label: "No — tens can't pass 9" }], "yes",
      "Fourteen tens are 140; with 200 and 3 that is 343. Standard form is a convention, not a law.") },
  [
    reused("WhyTradeNumeric", "g2b13-k1", H.tradeUp, ["Count each unit's worth.", "Add the three worths together."]),
    reused("WhyTradeNumeric", "g2b13-k2", H.tradeUp, ["Overfull places are still legal.", "Trading just tidies them."]),
    reused("WhyTradeMcq", "g2b13-k3", H.tradeUp, ["Equal value licenses every trade.", "Form changes, amount does not."]),
    reused("WhyTradeNumeric", "g2b13-ch1", H.tradeUp, ["Read any block pile as a number.", "Worth, not appearance, decides."]),
  ],
  ["Ten of one unit equal one of the next.", "Non-standard forms are legal.", "Trading tidies, never changes."],
  "next: explaining a strategy out loud.");

def(14,
  "A strategy is explained by naming its moves and WHY each is allowed: what traded, where the value went, why the total held.",
  "The words 'because they are equal' are the heart of every correct explanation of trading.",
  { rep: "diagram", widget: () => compose("Build 435 standard, ready to explain each place aloud.", 435, { maxHundreds: 5, maxTens: 9, maxOnes: 9, requireStandard: true },
      "4 hundreds, 3 tens, 5 ones — each place ready to be named in an explanation.",
      [[4, 5, 3, "That is 453 — an explanation must match the number exactly, place by place."]]),
    predict: P("The strongest explanation of a trade says…", [{ id: "equal", label: "…the two forms are equal" }, { id: "teacher", label: "…the teacher said so" }], "equal",
      "Equality is the mathematical reason; authority is not an argument.") },
  [
    reused("ExplainMcq", "g2b14-k1", H.tradeUp, ["Name the move, then the reason.", "Equality is the reason."]),
    reused("ExplainMcq", "g2b14-k2", H.tradeUp, ["Every trade needs its 'because'.", "Value moved, total held."]),
    reused("StoryAddNumeric", "g2b14-k3", H.place, ["Solve, then narrate your steps.", "Each carry gets a sentence."]),
    reused("ExplainMcq", "g2b14-ch1", H.tradeUp, ["Critique weak explanations.", "Point at the missing 'because'."]),
  ],
  ["Name the move and the reason.", "'Because they are equal.'", "Every trade earns a sentence."],
  "next: three-digit stories.");

def(15,
  "A story hands you the numbers and the action: joining means add, remaining means subtract. Write the equation, then solve it.",
  "The trail log, the summit, the seed jars — every story hides one equation waiting to be written.",
  { rep: "diagram", widget: () => hop("Maggie hikes 320, rests, then hikes 30 more: three ten-jumps from 320.", 300, 380, 320, 10, 3, "forward",
      "Landed on 350 — the story's two legs joined on the line.",
      [[323, "Those were one-steps; each leg of the second hike is a whole ten."]]),
    predict: P("A story says 'how many steps in ALL'. Which operation?", [{ id: "add", label: "Addition — the parts join" }, { id: "sub", label: "Subtraction" }], "add",
      "'In all' collects the parts into one total; joining is addition.") },
  [
    reused("StoryAddNumeric", "g2b15-k1", H.place, ["Find the numbers and the action.", "Joining stories add."]),
    reused("StorySubNumeric", "g2b15-k2", H.place, ["'Remaining' means take away.", "Write the subtraction first."]),
    reused("StoryAddNumeric", "g2b15-k3", H.place, ["The equation comes before the arithmetic.", "Then trades proceed as usual."]),
    reused("StorySubNumeric", "g2b15-ch1", H.place, ["Two-part stories still hide one equation.", "Name it, then solve it."]),
  ],
  ["Stories hide equations.", "Joining adds, remaining subtracts.", "Write it, then solve it."],
  "next: choosing the right method.");

def(16,
  "You now own several methods: mental slides, open-line jumps, and careful columns with trades. The numbers tell you which to reach for.",
  "Friendly numbers invite mental math; messy trades invite paper. Choosing well is itself a skill.",
  { rep: "diagram", widget: () => compose("One last build: 507, minding the zero in the tens.", 507, { maxHundreds: 6, maxTens: 9, maxOnes: 9, requireStandard: true },
      "5 hundreds, 0 tens, 7 ones — the zero holds the empty tens place open.",
      [[5, 7, 0, "That is 570 — the zero belongs in the TENS, holding that place empty."]]),
    predict: P("199 + 350: mental or columns?", [{ id: "mental", label: "Mental — 199 is one from 200" }, { id: "columns", label: "Columns always" }], "mental",
      "Sliding 199 to 200 makes the sum 549 in one breath — the numbers invited it.") },
  [
    reused("MethodChoiceMcq", "g2b16-k1", H.sense, ["Read the numbers first.", "They point at a method."]),
    reused("MethodChoiceMcq", "g2b16-k2", H.sense, ["Friendly numbers: think.", "Messy trades: write."]),
    reused("EstimateCheckMcq", "g2b16-k3", H.sense, ["Estimate whichever method you choose.", "It guards the answer."]),
    reused("MethodChoiceMcq", "g2b16-ch1", H.sense, ["Defend your choice out loud.", "Fit, not habit, decides."]),
  ],
  ["Numbers point at methods.", "Friendly: mental. Messy: columns.", "Estimate either way."],
  "course complete: adding and subtracting within 1000 with judgment.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 16, `16 lessons defined, got ${L.length}`);
const chapterTitles = ["Adding Within 1000", "Subtracting and Moving Mentally", "Lines, Meaning, and Method"];
const perChapter = [5, 6, 5];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 5 ? 1 : n <= 11 ? 2 : 3);
const outDir = join(root, "content/courses/add-subtract-1000-g2");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g2b-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "diagram") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "add-subtract-1000-g2",
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
    if (w.type === "baseTenCompose") {
      must(w.target > 0 && w.maxHundreds * 100 + w.maxTens * 10 + w.maxOnes >= w.target, `${id}/${s.id} compose reachable`);
      for (const b of w.commonBuilds) {
        const v = 100 * b.hundreds + 10 * b.tens + b.ones;
        must(!(w.requireStandard === false && v === w.target), `${id}/${s.id} compose trap equals target`);
        must(b.hundreds <= w.maxHundreds && b.tens <= w.maxTens && b.ones <= w.maxOnes, `${id}/${s.id} compose trap exceeds caps`);
      }
    }
    if (w.type === "numberLineHop") {
      const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
      must(land >= w.min && land <= w.max, `${id}/${s.id} hop land outside range`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) {
      must(s.variant.gen === "g2-place-value-1000", `${id}/${s.id} unexpected gen`);
      must(REGISTERED.has(s.variant.form), `${id}/${s.id} form ${s.variant.form} not registered`);
    }
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "add-subtract-1000-g2", slug: "add-subtract-1000-g2", title: spec.title,
  tagline: "Trade up, break down, and slide digits — three-digit adding and subtracting that explains itself.",
  category: "Math", gradeLevel: 2, chapters,
}, null, 2) + "\n");
console.log(`built 16 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
