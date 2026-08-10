#!/usr/bin/env node
// S195 — Batch D course 1/3: add-subtract-1000-g3 (3.NBT.A.2). Zero new generator code.
//
// CROSS-BAND REUSE (precedent: g6 expressions-equations declares g7-tse-inequality-build):
// 3.NBT.A.2 is "fluently add and subtract within 1000" — mathematically identical to the
// g2-place-value-1000 domain, which has a COMPUTATIONAL independent solver. The authored-template
// families used by the shipped g3 `place-value` course (regroup-sub, mental-add, round-hundred…)
// are backed by a LOOKUP-TABLE solver keyed to exact authored prompts, so they cannot carry new
// prompts; only computational families are reusable. Verified routes (src/lib/g2Independent.cjs):
//   Pv1000AddByPlaceNumeric / AddTradeNumeric / SubtractByPlaceNumeric / SubtractTradeNumeric /
//   RealworldNumeric      -> arithmetic(prompt): FIRST /(\d+)\s*\+\s*(\d+)/ else FIRST /(\d+)\s*[−-]\s*(\d+)/
//                            (so a SUBTRACT prompt must contain no "+" anywhere before the "−")
//   Pv1000SkipHundredsNumeric -> lastNumber + 100   ("one hundred" is words, contributes no digits)
//   Pv1000DigitWorthNumeric   -> digit x place from /in the (hundreds|tens|ones) place/
//   Pv1000OrderMixedMcq       -> exact option "<" | ">" | "="
//   TwoStepTradeNumeric (g2-add-subtract-100) -> n0 − n1 + n2  (had / used / bought)
// columnCalc is a LABORATORY with a hard contract: it refuses no-carry/no-borrow problems
// (reach.size >= 2) and every commonResults value must be reachable by a legal move sequence.
// columnCalcReachable is ported below so traps are PROVEN reachable before any file is written.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "add-subtract-1000-g3");
if (!spec || spec.lessons.length !== 10) throw new Error("spec course missing or wrong size");

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
const COL_T = corpusTemplate("columnCalc");
const HOP_T = corpusTemplate("numberLineHop", "add-subtract-1000-g2");
const B10_T = corpusTemplate("baseTenCompose", "add-subtract-1000-g2");
const EST_T = corpusTemplate("estimateSlider");

/* ---- ported from schema.ts columnCalcReachable: traps must be provably reachable ---- */
const ccDigits = (n) => String(n).split("").reverse().map(Number);
function columnCalcReachable(op, a, b) {
  const out = new Set();
  const join2 = (acc) => Number([...acc].reverse().join(""));
  if (op === "add") {
    const A = ccDigits(a), B = ccDigits(b), n = Math.max(A.length, B.length);
    const rec = (i, carryIn, acc) => {
      if (i === n) {
        if (carryIn > 0) { out.add(join2([...acc, ...ccDigits(carryIn)])); out.add(join2(acc)); }
        else out.add(join2(acc));
        return;
      }
      const base = (A[i] ?? 0) + (B[i] ?? 0), withCarry = base + carryIn;
      rec(i + 1, Math.floor(withCarry / 10), [...acc, withCarry % 10]);
      if (carryIn > 0) rec(i + 1, Math.floor(base / 10), [...acc, base % 10]);
    };
    rec(0, 0, []);
  } else {
    const A0 = ccDigits(a), B = ccDigits(b), n = A0.length;
    const rec = (i, top, acc) => {
      if (i === n) { out.add(join2(acc)); return; }
      const t = top[i] ?? 0, bo = B[i] ?? 0;
      if (t >= bo) { rec(i + 1, top, [...acc, t - bo]); return; }
      rec(i + 1, top, [...acc, bo - t]);
      let j = i + 1;
      while (j < n && top[j] === 0) j++;
      if (j < n) {
        const nt = [...top];
        nt[j] -= 1;
        for (let k = i + 1; k < j; k++) nt[k] = 9;
        nt[i] = t + 10;
        rec(i + 1, nt, [...acc, nt[i] - bo]);
      }
    };
    rec(0, A0, []);
  }
  return out;
}
const ccTruth = (op, a, b) => (op === "add" ? a + b : a - b);

const REG_PV = new Set(["Pv1000AddByPlaceNumeric","Pv1000AddTradeNumeric","Pv1000BuildNumberNumeric",
  "Pv1000CountForwardNumeric","Pv1000DigitWorthNumeric","Pv1000MixedNumeric","Pv1000OrderMixedMcq",
  "Pv1000OrderMixedNumeric","Pv1000ReadWordsNumeric","Pv1000RealworldNumeric","Pv1000SkipFivesNumeric",
  "Pv1000SkipHundredsNumeric","Pv1000SkipTensNumeric","Pv1000SubtractByPlaceNumeric",
  "Pv1000SubtractTradeNumeric","Pv1000TradingNumeric","Pv1000WriteWordsBuildExpression"]);
const REG100 = new Set(["Add2DigitNumeric","Add2DigitMcq","AddOnesNumeric","AddOnesMcq",
  "AddTensNumeric","AddTensMcq","ChooseStepsNumeric","ChooseStepsMcq","DoublesNumeric","DoublesMcq",
  "Fluency20Numeric","Fluency20Mcq","NearDoublesNumeric","NearDoublesMcq","OddEvenMcq",
  "OddEvenOddEvenPairs","ParitySumNumeric","ParitySumMcq","RegroupAddNumeric","Sub2DigitMcq",
  "SubOnesMcq","SubTensMcq","TwoStepTradeNumeric","TwoStepTradeMcq","UnbundleSubMcq"]);
const REG = { "g2-place-value-1000": REG_PV, "g2-add-subtract-100": REG100 };

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
const dig = (n, p) => Math.floor(n / p) % 10;

function traps2(answer, cands) {
  const out = [];
  for (const [v, fb] of cands) {
    if (v !== answer && v >= 0 && !out.some((o) => o[0] === v)) out.push([v, fb]);
    if (out.length === 2) break;
  }
  while (out.length < 2) {
    const v = answer + 7 + out.length;
    out.push([v, "That total does not come from these digits — rebuild the problem one place at a time."]);
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

/* ---------------- graded mirrors: every one re-derivable by the shipped solver ------------- */
// no-regroup addition: each column sum <= 9
function AddByPlaceNumeric(r) {
  const ah = pick(r, 1, 4), bh = pick(r, 1, 4);
  const at = pick(r, 0, 4), bt = pick(r, 0, 4);
  const ao = pick(r, 0, 4), bo = pick(r, 0, 4);
  const a = 100 * ah + 10 * at + ao, b = 100 * bh + 10 * bt + bo;
  must(ao + bo <= 9 && at + bt <= 9 && ah + bh <= 9, "AddByPlace must not regroup");
  const ans = a + b;
  return { gen: "g2-place-value-1000", form: "Pv1000AddByPlaceNumeric",
    prompt: `${a} + ${b} = ?`, answer: ans,
    traps: traps2(ans, [
      [ans + 10, `A ten appeared from nowhere — with no column over 9 there is nothing to carry here.`],
      [ans - ao - bo + (ao + bo) % 10,
        `The ones were reduced as if they had to carry, but ${ao} + ${bo} fits in one digit — nothing moves.`]]) };
}
// addition with regrouping (ones and/or tens overflow)
function AddTradeNumeric(r, both = false) {
  const ao = pick(r, 5, 9), bo = pick(r, 5, 9);           // ones always carry
  const at = both ? pick(r, 5, 9) : pick(r, 0, 3);
  const bt = both ? pick(r, 5, 9) : pick(r, 0, 3);
  const ah = pick(r, 1, 3), bh = pick(r, 1, 3);
  const a = 100 * ah + 10 * at + ao, b = 100 * bh + 10 * bt + bo;
  must(ao + bo >= 10, "AddTrade ones must carry");
  if (both) must(at + bt + 1 >= 10, "AddTrade(both) tens must carry too");
  const ans = a + b;
  return { gen: "g2-place-value-1000", form: "Pv1000AddTradeNumeric",
    prompt: `${a} + ${b} = ?`, answer: ans,
    traps: traps2(ans, [
      [ans - 10, `The ones made a ten but it never reached the tens column — a stranded carry loses exactly 10.`],
      [ans - 100, `The tens made a hundred that never crossed — a stranded carry at the tens costs 100.`]]) };
}
// no-regroup subtraction: every top digit >= bottom digit
function SubByPlaceNumeric(r) {
  const ah = pick(r, 4, 9), at = pick(r, 4, 9), ao = pick(r, 4, 9);
  const bh = pick(r, 1, ah - 1), bt = pick(r, 0, at), bo = pick(r, 0, ao);
  const a = 100 * ah + 10 * at + ao, b = 100 * bh + 10 * bt + bo;
  must(ao >= bo && at >= bt && ah >= bh, "SubByPlace must not borrow");
  const ans = a - b;
  return { gen: "g2-place-value-1000", form: "Pv1000SubtractByPlaceNumeric",
    prompt: `${a} − ${b} = ?`, answer: ans,
    traps: traps2(ans, [
      [ans + 10, `A ten was borrowed that was never needed — every top digit here is already big enough.`],
      [a + b, `That added the two numbers; the minus sign asks how much is LEFT after taking ${b} away.`]]) };
}
// subtraction with borrowing; twoZeros forces the long borrow chain across 0s
function SubTradeNumeric(r, twoZeros = false) {
  let a, b;
  if (twoZeros) {
    const ah = pick(r, 3, 8);
    a = 100 * ah;                                  // e.g. 500 — ones AND tens are zero
    const bh = pick(r, 1, ah - 1), bt = pick(r, 1, 9), bo = pick(r, 1, 9);
    b = 100 * bh + 10 * bt + bo;
    must(a % 100 === 0 && b % 10 !== 0, "twoZeros: top must end in 00 and bottom must reach the ones");
  } else {
    const ah = pick(r, 4, 9), at = pick(r, 2, 8), ao = pick(r, 0, 3);
    a = 100 * ah + 10 * at + ao;
    const bh = pick(r, 1, ah - 2), bt = pick(r, 0, at - 1), bo = pick(r, ao + 1, 9);
    b = 100 * bh + 10 * bt + bo;
    must(ao < bo, "SubTrade ones must borrow");
  }
  must(a > b, "SubTrade needs a > b");
  const ans = a - b;
  return { gen: "g2-place-value-1000", form: "Pv1000SubtractTradeNumeric",
    prompt: `${a} − ${b} = ?`, answer: ans,
    traps: traps2(ans, [
      [Math.abs(dig(a, 100) - dig(b, 100)) * 100 + Math.abs(dig(a, 10) - dig(b, 10)) * 10 + Math.abs(dig(a, 1) - dig(b, 1)),
        `That took the smaller digit from the larger in each column — the classic bug. When the top is short you must trade, not flip.`],
      [ans + 10, `One trade was taken but never paid back — the column you borrowed from must drop by one.`]]) };
}
function RealworldNumeric(r) {
  const a = pick(r, 120, 480), b = pick(r, 130, 460);
  const ans = a + b;
  return { gen: "g2-place-value-1000", form: "Pv1000RealworldNumeric",
    prompt: `Maggie's trail log shows ${a} steps before lunch and ${b} steps after. So ${a} + ${b} = ?`,
    answer: ans,
    traps: traps2(ans, [
      [Math.abs(a - b), `That found the DIFFERENCE between the two stretches; the log asks for the whole walk.`],
      [ans - 100, `A hundred went missing in the carry — check the tens column before you commit.`]]) };
}
function HundredMoreNumeric(r) {
  const n = pick(r, 140, 850);
  const ans = n + 100;
  return { gen: "g2-place-value-1000", form: "Pv1000SkipHundredsNumeric",
    prompt: `What is one hundred more than ${n}?`, answer: ans,
    traps: traps2(ans, [
      [n + 10, `That added one TEN. A hundred more moves the hundreds digit, not the tens.`],
      [n + 1, `That added one ONE — the smallest place, when the question named the largest.`]]) };
}
function DigitWorthNumeric(r) {
  const n = pick(r, 203, 987);
  const places = [["hundreds", 100], ["tens", 10]];
  const [name, mult] = places[pick(r, 0, 1)];
  const d = dig(n, mult);
  must(d > 0, "digit worth needs a nonzero digit");
  const ans = d * mult;
  return { gen: "g2-place-value-1000", form: "Pv1000DigitWorthNumeric",
    prompt: `In the number ${n}, what is the ${d} in the ${name} place worth?`, answer: ans,
    traps: traps2(ans, [
      [d, `That reported the digit's FACE, not its value — place multiplies what a digit is worth.`],
      [d * (mult === 100 ? 10 : 100), `Right digit, wrong place — reread which column the ${d} sits in.`]]) };
}
function CompareMcq(r) {
  const a = pick(r, 210, 880);
  const b = r() < 0.5 ? a + pick(r, 1, 60) : a - pick(r, 1, 60);
  must(a !== b, "compare needs distinct numbers");
  const sym = a < b ? "<" : ">";
  return { gen: "g2-place-value-1000", form: "Pv1000OrderMixedMcq", kind: "solverMcq",
    prompt: `Compare ${a} and ${b}: <, =, or >?`, labels: ["<", "=", ">"], correct: sym,
    feedback: {
      "<": a < b ? `Correct — ${a} is less than ${b}; the first place where they differ decides it.`
                 : `${a} is not less than ${b} — compare the hundreds first, then the tens.`,
      "=": `These are different numbers, so equality is off the table — find the first place where the digits differ.`,
      ">": a > b ? `Correct — ${a} is greater than ${b}; the leftmost differing place settles the comparison.`
                 : `${a} is not greater than ${b} — check the highest place where they differ.`,
    } };
}
function TwoStepTradeNumeric(r) {
  const n0 = pick(r, 320, 780), n1 = pick(r, 60, 190), n2 = pick(r, 40, 160);
  const ans = n0 - n1 + n2;
  return { gen: "g2-add-subtract-100", form: "TwoStepTradeNumeric",
    prompt: `The trail fund had ${n0} dollars. The club spent ${n1} dollars on signs, then raised ${n2} dollars at the bake sale. How many dollars now?`,
    answer: ans,
    traps: traps2(ans, [
      [n0 - n1 - n2, `The bake sale ADDED money; subtracting it twice sends the fund the wrong way.`],
      [n0 + n1 + n2, `Spending ${n1} takes money out — that step subtracts before the raise adds.`]]) };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function CompensationMcq() {
  return { kind: "mcq",
    prompt: `To add 298 + 145 mentally, Sam adds 300 + 145 = 445 first. What must Sam do next?`,
    options: [
      { label: "Subtract 2 — he added 2 too many", correct: true, feedback: `Correct — 298 was rounded UP by 2, so the total is 2 too big: 445 − 2 = 443.` },
      { label: "Add 2 — to make up the difference", correct: false, feedback: `Adding 2 doubles the error. He already gave 298 two extra; the total must give them back.` },
      { label: "Nothing — 445 is the answer", correct: false, feedback: `445 answers 300 + 145, not 298 + 145. The borrowed 2 is still sitting in the total.` },
      { label: "Subtract 200 — to undo the rounding", correct: false, feedback: `Only 2 was added, not 200 — compensation returns exactly what was borrowed.` },
    ] };
}
function CheckInverseMcq() {
  return { kind: "mcq",
    prompt: `You compute 632 − 178 = 454. Which check confirms it WITHOUT redoing the subtraction?`,
    options: [
      { label: "Add 454 + 178 and see if you get 632", correct: true, feedback: `Correct — addition undoes subtraction, so the answer plus what you took away must rebuild the start.` },
      { label: "Subtract 454 − 178 again", correct: false, feedback: `That starts a different problem; it never touches the 632 the answer is supposed to rebuild.` },
      { label: "Add 632 + 178", correct: false, feedback: `That grows past the number you began with — the check must return TO 632, not beyond it.` },
      { label: "Compare 454 to 178", correct: false, feedback: `Comparing tells you which is larger, not whether the difference was computed correctly.` },
    ] };
}
function StrategyMcq(r) {
  const kind = pick(r, 0, 1);
  if (kind === 0) {
    return { kind: "mcq",
      prompt: `Which is fastest for 400 − 199, and why?`,
      options: [
        { label: "Compensation: 400 − 200 = 200, then add 1 back", correct: true, feedback: `Correct — 199 is one under a friendly 200, so one easy subtraction plus a tiny fix beats a triple borrow.` },
        { label: "The column algorithm, borrowing across both zeros", correct: false, feedback: `It works, but two zeros force the longest borrow chain there is — the slowest road to the same place.` },
        { label: "Counting back by ones from 400", correct: false, feedback: `That is 199 separate steps; strategy exists precisely to avoid counting one at a time.` },
        { label: "Estimating and stopping there", correct: false, feedback: `An estimate is a guard, not an answer — this question asks for the exact difference.` },
      ] };
  }
  return { kind: "mcq",
    prompt: `Which is fastest for 245 + 398, and why?`,
    options: [
      { label: "Compensation: 245 + 400 = 645, then subtract 2", correct: true, feedback: `Correct — 398 sits 2 below 400, so one friendly addition and a 2-step fix finish it.` },
      { label: "The column algorithm with two carries", correct: false, feedback: `It reaches the answer, but both columns carry — more work than rounding a single addend.` },
      { label: "Breaking both numbers into hundreds, tens, and ones", correct: false, feedback: `Splitting both is thorough but doubles the bookkeeping when only one addend is near a friendly number.` },
      { label: "Counting on by ones from 245", correct: false, feedback: `398 single steps is the slowest possible route to a sum this size.` },
    ] };
}
function OpenLineMcq() {
  return { kind: "mcq",
    prompt: `On an open number line you start at 347 and want to add 200. Which jump set is most efficient?`,
    options: [
      { label: "Two jumps of 100", correct: true, feedback: `Correct — 200 is exactly two hundred-jumps: 347 → 447 → 547, and the line stays readable.` },
      { label: "Twenty jumps of 10", correct: false, feedback: `It lands correctly but draws twenty hops where two will do — the open line rewards big jumps first.` },
      { label: "Two hundred jumps of 1", correct: false, feedback: `That is counting by ones with extra steps; the open line exists to escape exactly that.` },
      { label: "One jump of 100", correct: false, feedback: `One hundred-jump adds only 100, stopping halfway to the 200 you were asked to add.` },
    ] };
}
function HiddenTradeMcq() {
  return { kind: "mcq",
    prompt: `In 503 − 267, why must the trade start at the HUNDREDS?`,
    options: [
      { label: "The tens are 0, so they have nothing to lend until they borrow first", correct: true, feedback: `Correct — the ones need a ten, but the tens column is empty; it must borrow a hundred before it can lend.` },
      { label: "Because subtraction always starts from the left", correct: false, feedback: `Column subtraction starts at the ONES; here the empty tens column is what forces the chain leftward.` },
      { label: "Because 5 is bigger than 2", correct: false, feedback: `That comparison is about the hundreds digits and says nothing about why the ones are stuck.` },
      { label: "It does not — you can take 3 from 7", correct: false, feedback: `Flipping to 7 − 3 is the small-from-large bug; the top digit is 3 and it genuinely needs a trade.` },
    ] };
}

const REUSE = { AddByPlaceNumeric, AddTradeNumeric, AddTradeBothNumeric: (r) => AddTradeNumeric(r, true),
  SubByPlaceNumeric, SubTradeNumeric, SubTwoZerosNumeric: (r) => SubTradeNumeric(r, true),
  RealworldNumeric, HundredMoreNumeric, DigitWorthNumeric, CompareMcq, TwoStepTradeNumeric,
  CompensationMcq: () => CompensationMcq(), CheckInverseMcq: () => CheckInverseMcq(),
  StrategyMcq, OpenLineMcq: () => OpenLineMcq(), HiddenTradeMcq: () => HiddenTradeMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Work one place at a time, and trade only when a column truly comes up short.") {
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

  if (out.kind === "solverMcq") {
    must(REG[out.gen]?.has(out.form), `${mirror}: ${out.gen}/${out.form} NOT registered`);
    must(out.labels.includes(out.correct), `${mirror} correct label must be an option`);
    const ordered = [out.correct, ...out.labels.filter((l) => l !== out.correct)];
    const options = ordered.map((label, i) => ({
      id: `o${i}`, label, correct: label === out.correct, feedback: out.feedback[label],
    }));
    must(options[0].correct === true, `${mirror} correct must be index 0`);
    must(options.length >= 3, `${mirror} needs the full <,=,> option set`);
    for (const o of options) must(o.feedback && o.feedback.length >= 25, `${mirror} feedback too short`);
    must(new Set(options.map((o) => o.feedback)).size === options.length, `${mirror} feedback not distinct`);
    return { variant: { gen: out.gen, form: out.form },
      widget: { type: "mcq", prompt: out.prompt, options }, hints, ev };
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

/* ---------------- manipulatives (corpus-templated, contracts proven) ---------------- */
function columnCalc(prompt, op, a, b, traps) {
  const w = structuredClone(COL_T);
  w.prompt = prompt; w.op = op; w.a = a; w.b = b;
  if (op === "subtract") must(a >= b, "columnCalc(subtract) needs a >= b");
  const reach = columnCalcReachable(op, a, b);
  const truth = ccTruth(op, a, b);
  must(reach.has(truth), `columnCalc truth ${truth} unreachable`);
  must(reach.size >= 2, `columnCalc ${a} ${op} ${b} has no regrouping decision — engine refuses it`);
  const kept = [];
  for (const [value, feedback] of traps) {
    if (value === truth || !reach.has(value)) continue;      // prove reachable or drop
    if (kept.some((k) => k.value === value)) continue;
    must(feedback.length >= 25, "columnCalc trap feedback short");
    kept.push({ value, feedback });
  }
  must(kept.length >= 1, `columnCalc ${a} ${op} ${b}: no reachable trap survived — refuse to author dead feedback`);
  w.commonResults = kept;
  if ("decimals" in w) w.decimals = 0;
  return w;
}
function hop(prompt, min, max, start, hopSize, hops, direction, success, landings) {
  const w = structuredClone(HOP_T);
  w.prompt = prompt; w.min = min; w.max = max; w.start = start;
  w.hop = hopSize; w.hops = hops; w.direction = direction;
  delete w.hopSizeTargets; delete w.hopSizeMin; delete w.hopSizeMax;
  const land = start + (direction === "back" ? -1 : 1) * hopSize * hops;
  must(land >= min && land <= max, `hop landing ${land} off the line`);
  must(start >= min && start <= max, "hop start off the line");
  w.successFeedback = success;
  w.commonLandings = landings.map(([value, feedback]) => {
    must(value !== land, `hop trap ${value} equals the landing`);
    must(value >= min && value <= max, `hop trap ${value} off the line`);
    must(feedback.length >= 25, "hop trap feedback short");
    return { value, feedback };
  });
  return w;
}
function baseTen(prompt, target, success, builds = []) {
  const w = structuredClone(B10_T);
  w.prompt = prompt; w.target = target; w.requireStandard = true;
  w.maxHundreds = Math.max(9, Math.floor(target / 100));
  w.maxTens = 9; w.maxOnes = 9;
  must(Math.floor(target / 100) <= w.maxHundreds, "baseTen standard form must fit the tray");
  w.successFeedback = success;
  w.commonBuilds = builds;
  return w;
}
function estimate(prompt, min, max, target, acceptFactor, unitLabel, low, high, success) {
  const w = structuredClone(EST_T);
  w.prompt = prompt; w.min = min; w.max = max; w.start = min; w.target = target;
  w.acceptFactor = acceptFactor; w.unitLabel = unitLabel;
  w.ticks = [min, Math.round((min + max) / 2), max];
  w.lowFeedback = low; w.highFeedback = high;
  if ("successFeedback" in w) w.successFeedback = success;
  if ("choices" in w) delete w.choices;
  must(min < target && target < max, "estimate target inside range");
  return w;
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Manipulate the model and watch what each trade does to ${tag.replace(/-/g, " ")}.`,
  invariants: [`A trade never changes how much there is — ten ones become one ten, one hundred becomes ten tens, and the total stands still while the packaging changes for ${tag.replace(/-/g, " ")}.`],
  misconceptions: [`Flipping a column to take the small digit from the large one, stranding a carry, or borrowing from a column that has nothing to lend.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `add-subtract-1000-g3:${tag}`, delayed: true,
  counterfactualPrompt: "If a column comes up short, what must change somewhere else so the total stays exactly the same?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  add: ["Line up the places.", "Ones first, then tens.", "Ten ones make one ten."],
  sub: ["Ones first.", "Short column? Trade.", "Never flip the digits."],
  zeros: ["Zero cannot lend.", "Borrow from further left.", "The chain passes through."],
  line: ["Big jumps first.", "Hundreds, then tens.", "Land, then check."],
  strat: ["Look for a friendly number.", "Round, then repay.", "Fewest steps wins."],
  check: ["Undo with the inverse.", "Rebuild the start.", "Agreement means correct."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Adding three-digit numbers is three small additions stacked in a column: ones with ones, tens with tens, hundreds with hundreds.",
  "When no column runs past nine, nothing has to move — each place settles on its own and the sum falls out.",
  { rep: "concrete", widget: () => baseTen("Build the sum 243 + 135 with blocks: 3 flats, 7 rods, 8 cubes.", 378,
      "378 — three hundreds, seven tens, eight ones, and not a single trade needed."),
    predict: P("Adding 243 + 135, will any column pass nine?", [{ id: "no", label: "No — every column stays small" }, { id: "yes", label: "Yes — the ones will overflow" }], "no",
      "3 + 5 is 8, 4 + 3 is 7, 2 + 1 is 3 — every column fits, so the blocks never need repackaging.") },
  [
    reused("AddByPlaceNumeric", "g3a1-k1", H.add, ["Ones with ones, tens with tens.", "No column overflowed."]),
    reused("AddByPlaceNumeric", "g3a1-k2", H.add, ["Each place settles alone.", "Alignment is everything."]),
    reused("DigitWorthNumeric", "g3a1-k3", H.add, ["Place gives a digit its value.", "Face is not worth."]),
    reused("AddByPlaceNumeric", "g3a1-ch1", H.add, ["Bigger numbers, same method.", "Column by column."]),
  ],
  ["Line the places up.", "Add each column on its own.", "No overflow means no trade."],
  "next: what happens when a column overflows.");

def(2,
  "When a column passes nine, it cannot hold the result: ten ones bundle into one ten and move left. That move is the carry.",
  "A carry is packaging, not magic — the amount never changes, only which column holds it. Strand the carry and the total drops by exactly that bundle.",
  { rep: "symbolic", widget: () => columnCalc("167 + 148 = ? Tap each column to work it out — watch what the ones column has to hand upward.", "add", 167, 148,
      [[305, "305 left the ones' carry behind. Ten of those ones became a ten and belong in the next column."],
       [205, "Both carries were stranded — the ones' ten and the tens' hundred never reached their columns."]]),
    predict: P("In 167 + 148, the ones give 7 + 8 = 15. What goes in the ones column?", [{ id: "five", label: "5, and 1 ten carries" }, { id: "fifteen", label: "15" }], "five",
      "A column has room for one digit. Fifteen is one ten and five ones — the five stays, the ten moves left.") },
  [
    reused("AddTradeNumeric", "g3a2-k1", H.add, ["Ones over nine bundle up.", "The carry moves left."]),
    reused("AddTradeBothNumeric", "g3a2-k2", H.add, ["Two columns can carry.", "Each hands up in turn."]),
    reused("AddTradeNumeric", "g3a2-k3", H.add, ["Stranding a carry loses ten.", "The bundle must land."]),
    reused("AddTradeBothNumeric", "g3a2-ch1", H.add, ["Carries can chain.", "Work rightward to leftward."]),
  ],
  ["Over nine? Bundle and carry.", "The carry lands in the next column.", "Trading repackages, never removes."],
  "next: taking numbers apart again.");

def(3,
  "Subtracting three-digit numbers runs the same columns backward: ones from ones, tens from tens, hundreds from hundreds.",
  "While every top digit is big enough, no trading is needed — each column simply gives what it owes.",
  { rep: "concrete", widget: () => baseTen("Show what is LEFT after 486 − 254: build the difference with blocks.", 232,
      "232 — two hundreds, three tens, two ones, every column paying its own way."),
    predict: P("In 486 − 254, does any column come up short?", [{ id: "no", label: "No — each top digit is big enough" }, { id: "yes", label: "Yes — the ones cannot pay" }], "no",
      "6 can give 4, 8 can give 5, 4 can give 2 — no column is short, so nothing has to be traded.") },
  [
    reused("SubByPlaceNumeric", "g3a3-k1", H.sub, ["Ones first, then left.", "Each column pays its own."]),
    reused("SubByPlaceNumeric", "g3a3-k2", H.sub, ["No shortage, no trade.", "Straight subtraction."]),
    reused("SubByPlaceNumeric", "g3a3-k3", H.sub, ["Order matters in subtraction.", "Top gives to bottom."]),
    reused("SubByPlaceNumeric", "g3a3-ch1", H.sub, ["Same method, larger numbers.", "Column discipline."]),
  ],
  ["Subtract column by column.", "Ones first, working left.", "Big enough on top means no trade."],
  "next: when the top digit is too small.");

def(4,
  "When a top digit cannot pay, do not flip the subtraction — trade. One ten from the left becomes ten ones, and the column can finally pay.",
  "Flipping to take the small digit from the large one is the most common subtraction bug there is. It gives an answer that no trading could ever produce.",
  { rep: "symbolic", widget: () => columnCalc("452 − 178 = ? Tap a top digit to break a ten when a column comes up short.", "subtract", 452, 178,
      [[326, "326 flipped the short columns: it computed 8 − 2 and 7 − 5 because the top looked too small. Trade instead of flipping."],
       [286, "A trade was taken but never paid for — the column you borrowed from has to drop by one."]]),
    predict: P("In 452 − 178, the ones are 2 − 8. What is the legal move?", [{ id: "trade", label: "Trade a ten, making it 12 − 8" }, { id: "flip", label: "Compute 8 − 2 instead" }], "trade",
      "Flipping answers a different question. Breaking one ten turns 2 into 12, and 12 − 8 = 4 is the real ones digit.") },
  [
    reused("SubTradeNumeric", "g3a4-k1", H.sub, ["Short column? Break a ten.", "Never flip the order."]),
    reused("SubTradeNumeric", "g3a4-k2", H.sub, ["The lender drops by one.", "Trades are paid for."]),
    reused("SubTradeNumeric", "g3a4-k3", H.sub, ["Two columns can trade.", "Work right to left."]),
    reused("SubTradeNumeric", "g3a4-ch1", H.sub, ["Bigger trades, same rule.", "Ten ones for one ten."]),
  ],
  ["Short column? Trade, never flip.", "Ten ones for one ten.", "The lending column drops by one."],
  "next: trading when there is nothing to lend.");

def(5,
  "Across two zeros the trade cannot happen in one step: the ones need a ten, but the tens column is empty and must borrow a hundred first.",
  "The borrow passes THROUGH the zero. One hundred becomes ten tens; one of those tens becomes ten ones; and the zero column ends up holding nine.",
  { rep: "symbolic", widget: () => columnCalc("503 − 267 = ? The tens are empty — tap to see where the trade must start.", "subtract", 503, 267,
      [[364, "364 flipped the short columns instead of trading — 7 − 3 and 6 − 0 are not legal moves here."],
       [244, "The borrow reached the ones but the empty tens column was never charged for passing it along."]]),
    predict: P("In 503 − 267, the ones need a ten but the tens show 0. What happens?", [{ id: "chain", label: "A hundred is broken first, then a ten" }, { id: "stuck", label: "The subtraction is impossible" }], "chain",
      "Zero has nothing to lend, so it borrows before it lends: one hundred becomes ten tens, leaving 9 after one ten moves on.") },
  [
    reused("SubTwoZerosNumeric", "g3a5-k1", H.zeros, ["Zero cannot lend.", "Borrow from further left."]),
    reused("HiddenTradeMcq", "g3a5-k2", H.zeros, ["The chain starts at the hundreds.", "It passes through the zero."]),
    reused("SubTwoZerosNumeric", "g3a5-k3", H.zeros, ["Nine is what a passed-through zero keeps.", "Ten tens, minus the one lent on."]),
    reused("SubTwoZerosNumeric", "g3a5-ch1", H.zeros, ["Round numbers hide long chains.", "Trace the trade all the way."]),
  ],
  ["Zero cannot lend until it borrows.", "The trade passes through.", "A passed-through zero keeps nine."],
  "next: adding without columns at all.");

def(6,
  "An open number line trades the column for a journey: start at one number and jump — hundreds first, then tens, then ones.",
  "The jumps can be any size, so choose big ones. Two hundred-jumps beat twenty ten-jumps, and both beat counting by ones.",
  { rep: "diagram", widget: () => hop("Add 200 to 347 on the open line: hop by hundreds.", 300, 600, 347, 100, 2, "forward",
      "547 — two hundred-jumps, and the hundreds digit is the only one that moved.",
      [[357, "Those hops moved by TENS. A hundred-jump slides the leftmost digit: 347 → 447 → 547."],
       [447, "That is one hundred-jump. Adding 200 takes two of them."]]),
    predict: P("Starting at 347 and adding 200, which digit changes?", [{ id: "h", label: "Only the hundreds digit" }, { id: "all", label: "All three digits" }], "h",
      "Adding whole hundreds leaves the tens and ones untouched — 347 becomes 547 with 4 and 7 standing still.") },
  [
    reused("HundredMoreNumeric", "g3a6-k1", H.line, ["Hundreds change the left digit.", "Tens and ones hold still."]),
    reused("OpenLineMcq", "g3a6-k2", H.line, ["Big jumps first.", "Fewer hops, fewer mistakes."]),
    reused("HundredMoreNumeric", "g3a6-k3", H.line, ["One hundred more, every time.", "The pattern is positional."]),
    reused("AddByPlaceNumeric", "g3a6-ch1", H.line, ["The line and the column agree.", "Same sum, different road."]),
  ],
  ["Jump hundreds, then tens, then ones.", "Big jumps first.", "The line and the column must agree."],
  "next: making a number friendly on purpose.");

def(7,
  "Compensation borrows from the future: round an awkward number to a friendly one, add the easy way, then give back exactly what you borrowed.",
  "298 + 145 becomes 300 + 145 = 445, and since 298 was handed 2 extra, the total returns them: 443. Borrow 2, repay 2.",
  { rep: "symbolic", widget: () => columnCalc("Check the compensation: 298 + 145 should equal 443. Work the columns and compare.", "add", 298, 145,
      [[433, "433 stranded the ones' carry — 8 + 5 = 13 hands a ten upward, and it never arrived."],
       [343, "The tens' carry went missing: 9 + 4 plus the incoming ten passes 100, which belongs in the hundreds."]]),
    predict: P("Sam computes 300 + 145 = 445 to find 298 + 145. What now?", [{ id: "sub2", label: "Subtract 2" }, { id: "add2", label: "Add 2" }], "sub2",
      "298 was rounded UP by 2, so the total carries 2 that were never really there — return them.") },
  [
    reused("CompensationMcq", "g3a7-k1", H.strat, ["Round, then repay.", "Up by 2 means back by 2."]),
    reused("AddTradeNumeric", "g3a7-k2", H.strat, ["The exact answer is the referee.", "Strategy must match it."]),
    reused("CompensationMcq", "g3a7-k3", H.strat, ["The debt is exact.", "Never round twice."]),
    reused("AddTradeBothNumeric", "g3a7-ch1", H.strat, ["Friendly numbers save carries.", "The total is unchanged."]),
  ],
  ["Round to a friendly number.", "Repay exactly what you borrowed.", "Compensation changes work, not answers."],
  "next: proving an answer is right.");

def(8,
  "Addition and subtraction undo each other, so every subtraction carries its own proof: add the answer back to what you took away.",
  "If 632 − 178 = 454, then 454 + 178 must rebuild 632. Agreement is evidence; disagreement points straight at the slip.",
  { rep: "symbolic", widget: () => columnCalc("Check by adding back: does 454 + 178 rebuild 632?", "add", 454, 178,
      [[622, "622 stranded the ones' carry — 4 + 8 = 12 sends a ten leftward, and it never landed."],
       [532, "The tens' carry was dropped: 5 + 7 plus the incoming ten passes 100 and belongs in the hundreds."]]),
    predict: P("You found 632 − 178 = 454. Which sum should return you to 632?", [{ id: "back", label: "454 + 178" }, { id: "fwd", label: "632 + 178" }], "back",
      "The answer plus what was removed rebuilds the original — that is exactly what subtraction took apart.") },
  [
    reused("CheckInverseMcq", "g3a8-k1", H.check, ["Add the answer to what you took.", "It must rebuild the start."]),
    reused("AddTradeNumeric", "g3a8-k2", H.check, ["Do the rebuilding sum carefully.", "A sloppy check proves nothing."]),
    reused("SubTradeNumeric", "g3a8-k3", H.check, ["Every difference can be checked.", "Inverse is always available."]),
    reused("CheckInverseMcq", "g3a8-ch1", H.check, ["Disagreement locates the slip.", "Checking is not optional."]),
  ],
  ["Addition undoes subtraction.", "Answer plus subtrahend rebuilds the start.", "Agreement is evidence."],
  "next: three-digit numbers inside stories.");

def(9,
  "Stories hide the operation inside words: spending takes away, raising adds, and a two-step story does both before it is finished.",
  "Read for the action, not the numbers. Once you know which way each step moves, the arithmetic is the part you already own.",
  { rep: "diagram", widget: () => estimate("The fund had 640 dollars, spent 180, then raised 120. Slide to estimate what is left.", 100, 1600, 580, 2, "dollars",
      "Too low — spending 180 from 640 still leaves well over 400, and the bake sale adds more.",
      "Too high — the fund cannot end above where it started after spending more than it raised.",
      "About 580 — down 180, then up 120, landing a little below the starting 640."),
    predict: P("The fund spends 180, then raises 120. Does it end above or below its start?", [{ id: "below", label: "Below — it spent more than it raised" }, { id: "above", label: "Above — money came in" }], "below",
      "Out 180 and in 120 is a net loss of 60, so the fund lands 60 short of where it began.") },
  [
    reused("TwoStepTradeNumeric", "g3a9-k1", H.check, ["Spending subtracts.", "Raising adds."]),
    reused("RealworldNumeric", "g3a9-k2", H.add, ["Put-together means add.", "The story names the action."]),
    reused("TwoStepTradeNumeric", "g3a9-k3", H.check, ["Two steps, in order.", "Each has its own direction."]),
    reused("RealworldNumeric", "g3a9-ch1", H.add, ["Bigger stories, same reading.", "Action first, arithmetic second."]),
  ],
  ["Read for the action.", "Spending down, raising up.", "Two-step stories need both moves."],
  "next: choosing the fastest road.");

def(10,
  "Every method here reaches the same answer, so the real question is which costs least: the column algorithm, the open line, or compensation.",
  "Numbers just under a friendly hundred beg for compensation. Long borrow chains across zeros are the algorithm at its slowest. Choosing well is part of fluency.",
  { rep: "symbolic", widget: () => columnCalc("Compare the roads: work 400 − 199 in columns and feel the borrow chain.", "subtract", 400, 199,
      [[399, "399 flipped every short column — 9 − 0 twice is not a legal move when the top is empty."],
       [219, "The borrow reached the ones but the pass-through tens column was never charged for it."]]),
    predict: P("For 400 − 199, which is fastest?", [{ id: "comp", label: "Compensation: 400 − 200, then add 1" }, { id: "col", label: "Columns, borrowing across both zeros" }], "comp",
      "199 sits one below a friendly 200, so one clean subtraction plus a one-step repayment beats a triple borrow.") },
  [
    reused("StrategyMcq", "g3a10-k1", H.strat, ["Friendly numbers signal compensation.", "Zeros signal long chains."]),
    reused("CompareMcq", "g3a10-k2", H.strat, ["Compare before computing.", "Size guides the choice."]),
    reused("StrategyMcq", "g3a10-k3", H.strat, ["Fewest steps wins.", "Every road ends the same."]),
    reused("SubTwoZerosNumeric", "g3a10-ch1", H.zeros, ["Sometimes the algorithm is right.", "Know when to use it."]),
  ],
  ["All roads reach one answer.", "Friendly numbers invite compensation.", "Choosing the road is fluency."],
  "course complete: added, subtracted, traded, checked, and chosen.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 10, `10 lessons defined, got ${L.length}`);
const chapterTitles = ["The Standard Algorithms", "Harder Cases and Smarter Roads", "Checking, Applying, Choosing"];
const perChapter = [4, 3, 3];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 7 ? 2 : 3);
const outDir = join(root, "content/courses/add-subtract-1000-g3");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g3a-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "symbolic") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "add-subtract-1000-g3",
    chapterId: chapters[ch - 1].id, minutes: 7, readingProfile: "standard",
    steps: [
      { id: "c1", kind: "concept", figure: "count-on-hops", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: "Try it.", conceptTag: tag, widget: d.i1.widget(), predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      stepFromCheck("k1", d.checks[0]),
      { id: "c2", kind: "concept", figure: "count-on-hops", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: "Try it again.", conceptTag: tag, widget: d.i1.widget(), cml: cml(tag, "symbolic") },
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
      const f = s.variant?.form;
      const plus = w.prompt.match(/(\d+)\s*\+\s*(\d+)/);
      const minus = w.prompt.match(/(\d+)\s*[−-]\s*(\d+)/);
      // mirror g2Independent.arithmetic exactly: "+" is tried FIRST across the whole prompt
      if (["Pv1000AddByPlaceNumeric","Pv1000AddTradeNumeric","Pv1000RealworldNumeric"].includes(f)) {
        must(plus && +plus[1] + +plus[2] === w.answer, `${id}/${s.id} ${f}: first + must give the answer`);
      }
      if (["Pv1000SubtractByPlaceNumeric","Pv1000SubtractTradeNumeric"].includes(f)) {
        must(!plus, `${id}/${s.id} ${f}: a "+" anywhere would hijack the solver's first branch`);
        must(minus && +minus[1] - +minus[2] === w.answer, `${id}/${s.id} ${f}: first − must give the answer`);
      }
      if (f === "TwoStepTradeNumeric") {
        const n = (w.prompt.match(/\d+/g) || []).map(Number);
        must(n[0] - n[1] + n[2] === w.answer, `${id}/${s.id} TwoStepTrade n0−n1+n2`);
      }
      if (f === "Pv1000SkipHundredsNumeric") {
        const n = (w.prompt.match(/\d+/g) || []).map(Number);
        must(n[n.length - 1] + 100 === w.answer, `${id}/${s.id} SkipHundreds last+100`);
      }
      if (f === "Pv1000DigitWorthNumeric") {
        must(/in the (hundreds|tens|ones) place/.test(w.prompt), `${id}/${s.id} DigitWorth needs the place phrase`);
      }
    }
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 3, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
    }
    if (w.type === "columnCalc") {
      const reach = columnCalcReachable(w.op, w.a, w.b);
      must(reach.size >= 2, `${id}/${s.id} columnCalc has no regrouping decision`);
      for (const t of w.commonResults) must(reach.has(t.value), `${id}/${s.id} columnCalc trap ${t.value} unreachable`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "add-subtract-1000-g3", slug: "add-subtract-1000-g3", title: spec.title,
  tagline: "Trade, carry, borrow, and choose — three-digit arithmetic you can defend.",
  category: "Math", gradeLevel: 3, chapters,
}, null, 2) + "\n");
console.log(`built 10 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
