#!/usr/bin/env node
// S194 — Batch C course 2/6: arrays-even-odd-g2 (2.OA.C.3, 2.OA.C.4). Zero new generator code.
//
// VERIFIED g2Independent.cjs routes used (g2-add-subtract-100):
//   OddEvenOddEvenPairs -> n[0]%2 ? 'odd' : 'even'        (oddEvenPairs widget, string answer)
//   OddEvenMcq          -> the option whose label is even  ("Which of these numbers is even?")
//   ParitySumNumeric    -> arithmetic(prompt)              ("3 + 5 = ? (both odd)" — corpus shape)
//   ParitySumMcq        -> the option labeled exactly 'even'
//   DoublesNumeric      -> arithmetic(prompt)              ("7 + 7 = ?")
//   DoublesMcq          -> the option containing a+a with '+'  ("7 + 7" for 14 as a double)
//   Add2DigitNumeric    -> arithmetic(prompt)              (row-sum decompositions: "8 + 4 = ?")
// Arrays are totalled by DECOMPOSITION (the standard's own repeated-addition idea): arithmetic()
// parses only the first a+b, so "three rows of 4" is authored as staged pair sums — the same
// honest fit proven in add-three-numbers-g1. Manipulatives: oddEvenPairs (pairing model) and
// tapDiagram array grids (rows/columns structure).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "arrays-even-odd-g2");
if (!spec || spec.lessons.length !== 10) throw new Error("spec course missing or wrong size");

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
    out.push([v, "That count does not match the array — recount one row at a time and add again."]);
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

/* ---------------- numeric + string-answer mirrors ---------------- */
function PairsParity(r, wantEven) {
  const n = wantEven ? 2 * pick(r, 4, 9) : 2 * pick(r, 4, 9) + 1;
  const half = Math.floor(n / 2);
  const answer = n % 2 ? "odd" : "even";
  const wrongSlot = answer === "even"
    ? { oddFeedback: `${n} pairs up completely (${half} pairs, 0 left). No leftover means even.` }
    : { evenFeedback: `${n} makes ${half} pairs with 1 left over. A leftover means odd.` };
  return { kind: "pairs", form: "OddEvenOddEvenPairs",
    widget: { type: "oddEvenPairs", prompt: `Is ${n} odd or even?`, n, mode: "pair", answer,
      ...wrongSlot,
      successFeedback: answer === "even"
        ? `Yes — ${n} makes ${half} pairs with none left over.`
        : `Yes — ${n} makes ${half} pairs and 1 is left standing alone.` } };
}
function WhichEvenMcq(r) {
  const even = 2 * pick(r, 6, 14);
  const odds = new Set();
  while (odds.size < 3) { const o = 2 * pick(r, 5, 14) + 1; if (o !== even) odds.add(o); }
  const [o1, o2, o3] = [...odds];
  return { kind: "mcq", form: "OddEvenMcq",
    prompt: "Which of these numbers is even?",
    options: [
      { label: String(even), correct: true, feedback: `Correct — ${even} splits into ${even / 2} pairs with nothing left over.` },
      { label: String(o1), correct: false, feedback: `${o1} leaves one alone after pairing — a leftover makes a number odd.` },
      { label: String(o2), correct: false, feedback: `${o2} cannot pair up completely; the single leftover marks it odd.` },
      { label: String(o3), correct: false, feedback: `${o3} ends in an odd digit, so one is always left without a partner.` },
    ] };
}
function ParitySumNum(r, mode) {
  const [a, b] = mode === "oo" ? [2 * pick(r, 2, 6) + 1, 2 * pick(r, 2, 6) + 1]
    : mode === "ee" ? [2 * pick(r, 2, 7), 2 * pick(r, 2, 7)]
    : [2 * pick(r, 2, 7), 2 * pick(r, 2, 6) + 1];
  const tagTxt = mode === "oo" ? "both odd" : mode === "ee" ? "both even" : "one even, one odd";
  const ans = a + b;
  return { kind: "numeric", form: "ParitySumNumeric", prompt: `${a} + ${b} = ? (${tagTxt})`, answer: ans,
    traps: traps2(ans, [[ans + 1, `That total has the wrong parity — check the sum against what ${tagTxt} must produce.`],
                        [ans - 2, `Two got lost in the count; pair the numbers up and add once more.`]]) };
}
function ParitySumParityMcq(r, mode) {
  const even = mode !== "eo";
  const pair = mode === "oo" ? "an odd number plus an odd number" : mode === "ee" ? "an even number plus an even number" : "an even number plus an odd number";
  const opts = even
    ? [
      { label: "even", correct: true, feedback: `Correct — ${pair} pairs every leftover, so the sum always lands even.` },
      { label: "odd", correct: false, feedback: `Try 3 + 5 or 4 + 6: the leftovers pair with each other, leaving none — that is even, not odd.` },
      { label: "sometimes even, sometimes odd", correct: false, feedback: `Parity here never wavers — the leftover structure forces the same result every single time.` },
      { label: "impossible to know", correct: false, feedback: `You can know without computing: track the leftovers and the parity is decided.` },
    ]
    : [
      { label: "odd", correct: true, feedback: `Correct — the even part pairs fully and the odd part's leftover survives, so the sum is odd.` },
      { label: "even", correct: false, feedback: `The odd addend's leftover has no partner in an even number — one stays alone, making the sum odd.` },
      { label: "sometimes even, sometimes odd", correct: false, feedback: `The single leftover survives every time; parity here is fixed, not a coin flip.` },
      { label: "impossible to know", correct: false, feedback: `Leftover-tracking decides it without any arithmetic at all.` },
    ];
  return { kind: "mcq", form: even ? "ParitySumMcq" : null, prompt: `What kind of number is ${pair}?`, options: opts };
}
function DoublesNum(r) {
  const a = pick(r, 4, 12);
  const ans = 2 * a;
  return { kind: "numeric", form: "DoublesNumeric", prompt: `${a} + ${a} = ?`, answer: ans,
    traps: traps2(ans, [[ans + 1, `A double pairs perfectly, so it can never land on an odd number like that.`],
                        [2 * a - 2, `One of the ${a}s came up short — count both groups in full.`]]) };
}
function DoubleEquationMcq(r) {
  const a = pick(r, 5, 11); const total = 2 * a;
  return { kind: "mcq", form: "DoublesMcq",
    prompt: `Which addition shows ${total} as a double?`,
    options: [
      { label: `${a} + ${a}`, correct: true, feedback: `Correct — ${total} split into two equal groups of ${a} is exactly what "double" means.` },
      { label: `${a - 1} + ${a + 1}`, correct: false, feedback: `That reaches ${total}, but the parts differ — a double needs two EQUAL addends.` },
      { label: `${total} + ${total}`, correct: false, feedback: `That doubles ${total} itself, giving ${2 * total} — the question doubles a smaller number to REACH ${total}.` },
      { label: `${a} + ${a - 1}`, correct: false, feedback: `Unequal parts and one short of ${total} — equal groups of ${a} are needed.` },
    ] };
}
function RowSumStage1(r) {
  const per = pick(r, 3, 6);
  const ans = 2 * per;
  return { kind: "numeric", form: "DoublesNumeric",
    prompt: `Each row of the array holds ${per} dots. Two rows: ${per} + ${per} = ?`, answer: ans,
    traps: traps2(ans, [[per + 2, `That counted one row plus the number of rows — add the two full rows instead.`],
                        [ans + per, `That is three rows' worth; only two rows are being joined here.`]]) };
}
function RowSumStage2(r) {
  const per = pick(r, 3, 6); const sofar = 2 * per;
  const ans = sofar + per;
  return { kind: "numeric", form: "Add2DigitNumeric",
    prompt: `Two rows made ${sofar}. Add the third row: ${sofar} + ${per} = ?`, answer: ans,
    traps: traps2(ans, [[sofar + per + per, `That added a fourth row — the array stops at three.`],
                        [sofar - per, `That took a row away; the third row joins the total.`]]) };
}
function ColSumStage(r) {
  const per = pick(r, 2, 4); const cols = pick(r, 3, 4); const sofar = per * (cols - 1);
  const ans = sofar + per;
  return { kind: "numeric", form: "Add2DigitNumeric",
    prompt: `Counting by columns: ${cols - 1} columns made ${sofar}. Add the last column: ${sofar} + ${per} = ?`, answer: ans,
    traps: traps2(ans, [[sofar + cols, `That added the NUMBER of columns instead of the column's ${per} dots.`],
                        [sofar, `The last column never joined — every column must be counted.`]]) };
}
function RepeatedSumMcq(r) {
  const rows = pick(r, 3, 4);
  let per = pick(r, 3, 6);
  if (per === rows) per = per === 6 ? 5 : per + 1; // rows===per makes by-rows and by-columns identical strings
  const right = Array(rows).fill(per).join(" + ");
  const wrongA = Array(per).fill(rows).join(" + ");
  const wrongB = `${rows} + ${per}`;
  const wrongC = Array(rows).fill(per + 1).join(" + ");
  return { kind: "mcq", form: null,
    prompt: `An array has ${rows} rows with ${per} dots in each row. Which repeated sum counts it BY ROWS?`,
    options: [
      { label: right, correct: true, feedback: `Correct — one ${per} for each of the ${rows} rows, added again and again.` },
      { label: wrongA, correct: false, feedback: `That counts BY COLUMNS (${per} columns of ${rows}) — same total, different story than "by rows".` },
      { label: wrongB, correct: false, feedback: `Adding the row count to the row size mixes two different kinds of numbers.` },
      { label: wrongC, correct: false, feedback: `Each row holds ${per}, not ${per + 1} — the repeated number must match the row size.` },
    ] };
}
function SameTotalMcq(r) {
  const total = [12, 16, 18, 20][pick(r, 0, 3)];
  const pairs = { 12: [[2, 6], [3, 4]], 16: [[2, 8], [4, 4]], 18: [[2, 9], [3, 6]], 20: [[2, 10], [4, 5]] }[total];
  const [r1, c1] = pairs[0], [r2, c2] = pairs[1];
  return { kind: "mcq", form: null,
    prompt: `A ${r1}-by-${c1} array and a ${r2}-by-${c2} array both use ${total} dots. What does that show?`,
    options: [
      { label: "The same total can make differently shaped arrays", correct: true, feedback: `Correct — ${total} rearranges into ${r1} rows of ${c1} or ${r2} rows of ${c2}; shape changes, count does not.` },
      { label: `The ${r2}-by-${c2} array holds more dots`, correct: false, feedback: `Both arrays hold exactly ${total} — taller is not bigger when the dots are recounted.` },
      { label: "One of the arrays must be wrong", correct: false, feedback: `Both are honest pictures of ${total}; a number owns many array shapes at once.` },
      { label: "Arrays only work for even totals", correct: false, feedback: `Odd totals make arrays too (like 3 rows of 3) — this pair just happens to be even.` },
    ] };
}
function StoryArrayNumeric(r) {
  const rows = pick(r, 3, 4), per = pick(r, 4, 6);
  const sofar = per * (rows - 1);
  const ans = sofar + per;
  return { kind: "numeric", form: "Add2DigitNumeric",
    prompt: `Maggie plants ${rows} rows of ${per} seedlings. The first ${rows - 1} rows hold ${sofar}. So ${sofar} + ${per} = ?`, answer: ans,
    traps: traps2(ans, [[sofar + rows, `That added the number of rows, not the last row's ${per} seedlings.`],
                        [sofar, `The final row never got planted into the total — add its ${per}.`]]) };
}

const REUSE = { PairsParityEven: (r) => PairsParity(r, true), PairsParityOdd: (r) => PairsParity(r, false),
  WhichEvenMcq, ParitySumOO: (r) => ParitySumNum(r, "oo"), ParitySumEE: (r) => ParitySumNum(r, "ee"),
  ParitySumEO: (r) => ParitySumNum(r, "eo"),
  ParityRuleOO: (r) => ParitySumParityMcq(r, "oo"), ParityRuleEE: (r) => ParitySumParityMcq(r, "ee"),
  ParityRuleEO: (r) => ParitySumParityMcq(r, "eo"),
  DoublesNum, DoubleEquationMcq, RowSumStage1, RowSumStage2, ColSumStage, RepeatedSumMcq,
  SameTotalMcq, StoryArrayNumeric };

function reused(mirror, seedStr, hints, ev,
                fallback = "Pair things up or count row by row — the structure of the array does the arithmetic for you.") {
  const r = mulberry32(seedFromString(seedStr));
  const out = REUSE[mirror](r);
  if (out.kind === "pairs") {
    return { variant: { gen: GEN, form: out.form }, widget: out.widget, hints, ev };
  }
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
function pairsWidget(n) {
  const half = Math.floor(n / 2);
  const answer = n % 2 ? "odd" : "even";
  const wrongSlot = answer === "even"
    ? { oddFeedback: `${n} pairs up completely (${half} pairs, 0 left). No leftover means even.` }
    : { evenFeedback: `${n} makes ${half} pairs with 1 left over. A leftover means odd.` };
  return { type: "oddEvenPairs", prompt: `Pair up ${n} counters. Odd or even?`, n, mode: "pair", answer,
    ...wrongSlot,
    successFeedback: answer === "even"
      ? `Yes — ${n} makes ${half} pairs with none left over.`
      : `Yes — ${n} makes ${half} pairs and 1 stands alone.` };
}
function arrayTap(prompt, rows, cols, mode, correctPred, fbFor) {
  const hotspots = [];
  for (let ri = 0; ri < rows; ri++) for (let ci = 0; ci < cols; ci++) {
    const id = `r${ri + 1}c${ci + 1}`;
    const correct = correctPred(ri + 1, ci + 1);
    const h = { id, x: Math.round(((ci + 0.5) / cols) * 100), y: Math.round(((ri + 0.5) / rows) * 100),
      label: `row ${ri + 1}, column ${ci + 1}`, icon: "●", count: 1 };
    if (correct) h.correct = true; else h.feedback = fbFor(ri + 1, ci + 1);
    hotspots.push(h);
  }
  const nCorrect = hotspots.filter((h) => h.correct).length;
  must(nCorrect >= 1, "arrayTap needs a correct hotspot");
  if (mode === "selectOne") must(nCorrect === 1, "selectOne needs exactly one correct");
  return { type: "tapDiagram", prompt, mode, canvas: { w: cols, h: rows }, hotspots,
    missFeedback: "Rows run across and columns run up and down — find the crossing the prompt names.",
    successFeedback: "Exactly right — that is the spot where the named row and column meet." };
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`Rearranging counters into pairs, rows, or columns changes the VIEW of a quantity, never its count — the model and the total must agree for ${tag.replace(/-/g, " ")}.`],
  misconceptions: [`Believing a taller or wider arrangement holds more, or that a leftover counter can be ignored when judging parity.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `arrays-even-odd-g2:${tag}`, delayed: true,
  counterfactualPrompt: "What single change to the arrangement would change what the number IS, not just how it looks?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  pair: ["Line the counters into twos.", "Look for one left alone.", "A leftover means odd; none means even."],
  parity: ["Track the leftovers, not the totals.", "Two leftovers pair with each other.", "The rule holds for every example."],
  dbl: ["Two equal groups, one join.", "Doubles pair perfectly.", "So a double is always even."],
  rows: ["Count one row's dots first.", "Add that same number per row.", "Rows and columns tell one total."],
  story: ["Find the rows and the row size.", "Stage the sum row by row.", "The last row finishes the total."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Pair the counters into twos. If every counter finds a partner, the number is even; one left standing alone makes it odd.",
  "Pairing is a test you can SEE — the leftover, or its absence, is the whole answer.",
  { rep: "concrete", widget: () => pairsWidget(14),
    predict: P("Pair up 14 counters. Will one be left over?", [{ id: "no", label: "No — all pair up" }, { id: "yes", label: "Yes — one left" }], "no",
      "14 makes 7 full pairs; nothing is left standing, so 14 is even.") },
  [
    reused("PairsParityEven", "g2a1-k1", H.pair, ["Every counter finds a partner.", "No leftover: even."]),
    reused("PairsParityOdd", "g2a1-k2", H.pair, ["One counter stands alone.", "A leftover: odd."]),
    reused("WhichEvenMcq", "g2a1-k3", H.pair, ["Check each number's leftover.", "Even numbers pair fully."]),
    reused("PairsParityEven", "g2a1-ch1", H.pair, ["Bigger numbers pair the same way.", "The test never changes."]),
  ],
  ["Pair into twos.", "Leftover means odd.", "No leftover means even."],
  "next: reading parity straight from the number.");

def(2,
  "You do not need counters forever: the ONES digit carries the verdict. 0, 2, 4, 6, 8 end even numbers; 1, 3, 5, 7, 9 end odd ones.",
  "The tens pair up automatically — every ten is five pairs — so only the ones digit can leave a leftover.",
  { rep: "concrete", widget: () => pairsWidget(17),
    predict: P("17 ends in 7. Odd or even?", [{ id: "odd", label: "Odd" }, { id: "even", label: "Even" }], "odd",
      "The ten inside 17 pairs perfectly; the 7 ones leave one alone — odd.") },
  [
    reused("WhichEvenMcq", "g2a2-k1", H.pair, ["Read the ones digit only.", "It decides the parity."]),
    reused("PairsParityOdd", "g2a2-k2", H.pair, ["Confirm with pairs if unsure.", "The digit and the pairs agree."]),
    reused("WhichEvenMcq", "g2a2-k3", H.pair, ["Tens always pair fully.", "Only the ones can leave one out."]),
    reused("PairsParityEven", "g2a2-ch1", H.pair, ["Large numbers obey the digit too.", "Check the ones, know the answer."]),
  ],
  ["The ones digit decides.", "Tens pair automatically.", "0,2,4,6,8 end even numbers."],
  "next: why doubles are always even.");

def(3,
  "A double like 7 + 7 pairs every counter with its twin across the groups — so a double can never leave a leftover.",
  "Doubles are the even numbers wearing their construction on their sleeve: two equal groups, zero leftovers.",
  { rep: "concrete", widget: () => pairsWidget(16),
    predict: P("8 + 8: could the sum be odd?", [{ id: "no", label: "No — doubles are always even" }, { id: "maybe", label: "Sometimes" }], "no",
      "Each counter in one 8 pairs with a twin in the other 8 — no leftover is possible.") },
  [
    reused("DoublesNum", "g2a3-k1", H.dbl, ["Join the two equal groups.", "Twins pair across the middle."]),
    reused("ParityRuleEE", "g2a3-k2", H.parity, ["Even plus even keeps pairing.", "No leftovers appear."]),
    reused("DoublesNum", "g2a3-k3", H.dbl, ["The sum lands on an even number.", "Every double does."]),
    reused("DoublesNum", "g2a3-ch1", H.dbl, ["Bigger doubles, same twin-pairing.", "Still even, every time."]),
  ],
  ["A double is two equal groups.", "Twins pair across.", "Doubles are always even."],
  "next: writing an even number AS a double.");

def(4,
  "Every even number can be written as a double: split it into two equal groups and name the sum, like 14 = 7 + 7.",
  "Finding the double is un-doubling — asking which number, taken twice, rebuilds the total.",
  { rep: "concrete", widget: () => pairsWidget(18),
    predict: P("18 as a double: which sum?", [{ id: "nine", label: "9 + 9" }, { id: "unequal", label: "10 + 8" }], "nine",
      "10 + 8 reaches 18 but the groups differ — a double demands two equal nines.") },
  [
    reused("DoubleEquationMcq", "g2a4-k1", H.dbl, ["Split into two EQUAL groups.", "Equal is what makes it a double."]),
    reused("DoublesNum", "g2a4-k2", H.dbl, ["Check by re-joining the halves.", "The double rebuilds the total."]),
    reused("ParityRuleOO", "g2a4-k3", H.parity, ["Odd plus odd: leftovers pair.", "The rule explains the evens."]),
    reused("DoubleEquationMcq", "g2a4-ch1", H.dbl, ["Bigger evens still split equally.", "Name the half, write the double."]),
  ],
  ["Even numbers split equally.", "The double names the halves.", "Equal groups are the requirement."],
  "next: rows and columns.");

def(5,
  "An array lines counters into ROWS (across) and COLUMNS (up and down). Every counter sits in exactly one row and one column.",
  "The grid is not decoration — rows and columns are two honest ways to slice the same total.",
  { rep: "diagram", widget: () => arrayTap("Tap the counter in row 2, column 3.", 3, 4, "selectOne",
      (ri, ci) => ri === 2 && ci === 3,
      (ri, ci) => `That counter sits in row ${ri}, column ${ci} — rows run across, columns run up and down.`),
    predict: P("In a 3-by-4 array, how many counters share row 2?", [{ id: "four", label: "4 — one per column" }, { id: "three", label: "3 — one per row" }], "four",
      "A row stretches across every column, so row 2 holds one counter for each of the 4 columns.") },
  [
    reused("RowSumStage1", "g2a5-k1", H.rows, ["A row's size is its column count.", "Add row by row."]),
    reused("RepeatedSumMcq", "g2a5-k2", H.rows, ["'By rows' repeats the row size.", "One addend per row."]),
    reused("RowSumStage2", "g2a5-k3", H.rows, ["Keep the running total.", "Each row adds its share."]),
    reused("RowSumStage1", "g2a5-ch1", H.rows, ["Bigger arrays, same slicing.", "Rows across, columns up."]),
  ],
  ["Rows run across.", "Columns run up and down.", "Each counter lives in one of each."],
  "next: totalling an array by rows.");

def(6,
  "To count an array by rows, take one row's number and add it again for every row: 3 rows of 4 is 4, then 8, then 12.",
  "The running total climbs by the same step each time — that steady step IS the row size.",
  { rep: "diagram", widget: () => arrayTap("Tap every counter in the TOP row.", 3, 4, "selectAll",
      (ri) => ri === 1,
      (ri, ci) => `Row ${ri}, column ${ci} sits below the top — the top row is row 1, and this column\u2019s top counter is the one to tap.`),
    predict: P("3 rows of 4: what does the running total look like?", [{ id: "steps", label: "4, 8, 12 — equal steps" }, { id: "rand", label: "4, 7, 12 — uneven" }], "steps",
      "Every row adds the same 4, so the total climbs in equal steps of four.") },
  [
    reused("RowSumStage1", "g2a6-k1", H.rows, ["First two rows join as a double.", "Equal rows, equal step."]),
    reused("RowSumStage2", "g2a6-k2", H.rows, ["The third row joins the running total.", "Same step again."]),
    reused("RepeatedSumMcq", "g2a6-k3", H.rows, ["Write the sum that matches the rows.", "One addend per row."]),
    reused("RowSumStage2", "g2a6-ch1", H.rows, ["Stage the sum, keep the trail.", "The last step lands the total."]),
  ],
  ["Add one row at a time.", "The step is the row size.", "The last step is the total."],
  "next: the same array, counted by columns.");

def(7,
  "The SAME array counts by columns too: 3 rows of 4 is also 4 columns of 3 — the totals must agree because the counters never moved.",
  "Two counting paths, one answer. When they disagree, a counting mistake happened, not a mathematical one.",
  { rep: "diagram", widget: () => arrayTap("Tap every counter in the LEFT column.", 3, 4, "selectAll",
      (ri, ci) => ci === 1,
      (ri, ci) => `Row ${ri}, column ${ci} is to the right of the edge — the left column is column 1, and this row\u2019s leftmost counter is the target.`),
    predict: P("Rows say 12. What must the columns say?", [{ id: "same", label: "12 — the same total" }, { id: "diff", label: "Something different" }], "same",
      "No counter moved, so both counting paths must land on 12.") },
  [
    reused("ColSumStage", "g2a7-k1", H.rows, ["A column's size is its row count.", "Add column by column."]),
    reused("ColSumStage", "g2a7-k2", H.rows, ["The running total steps by the column size.", "Finish every column."]),
    reused("SameTotalMcq", "g2a7-k3", H.rows, ["Two slicings, one count.", "Agreement is the check."]),
    reused("ColSumStage", "g2a7-ch1", H.rows, ["Pick either path with confidence.", "The array guarantees the match."]),
  ],
  ["Columns count the array too.", "Both paths must agree.", "Disagreement means a miscount."],
  "next: writing the repeated sum.");

def(8,
  "The repeated sum is the array written as arithmetic: 3 rows of 4 becomes 4 + 4 + 4. The addend is the row size; the number of addends is the row count.",
  "Reading it back works too — see 5 + 5 + 5 and picture 3 rows of 5 before computing a thing.",
  { rep: "diagram", widget: () => arrayTap("This array shows 4 + 4 + 4. Tap the row that is the LAST addend.", 3, 4, "selectAll",
      (ri) => ri === 3,
      (ri, ci) => `Row ${ri}, column ${ci} belongs to an earlier addend — the last \u201c+ 4\u201d is the bottom row, row 3, all the way across.`),
    predict: P("4 rows of 6: how many addends in the repeated sum?", [{ id: "four", label: "4 addends of 6" }, { id: "six", label: "6 addends of 4" }], "four",
      "By rows, each of the 4 rows contributes one 6 — four sixes.") },
  [
    reused("RepeatedSumMcq", "g2a8-k1", H.rows, ["Addend = row size.", "Count of addends = row count."]),
    reused("RowSumStage2", "g2a8-k2", H.rows, ["Compute the sum in stages.", "The trail shows the rows."]),
    reused("RepeatedSumMcq", "g2a8-k3", H.rows, ["By columns swaps the roles.", "Same total either way."]),
    reused("StoryArrayNumeric", "g2a8-ch1", H.story, ["Stories hide arrays too.", "Write the sum, then stage it."]),
  ],
  ["Array to sum: addend is the row size.", "One addend per row.", "Reading back rebuilds the array."],
  "next: same total, different arrays.");

def(9,
  "Twelve counters make a 2-by-6 array, a 3-by-4, a 6-by-2 — the shape changes freely while the count stands still.",
  "That freedom is useful: choose the slicing that makes the adding easiest, since every honest slicing agrees.",
  { rep: "diagram", widget: () => arrayTap("This 2-by-6 array holds 12. Tap every counter in the BOTTOM row.", 2, 6, "selectAll",
      (ri) => ri === 2,
      (ri, ci) => `Row ${ri}, column ${ci} is up top — the bottom row of this 2-row array is row 2, and its column-${ci} counter is the one to tap.`),
    predict: P("Reshape 12 counters from 2-by-6 into 3-by-4. Does the count change?", [{ id: "no", label: "No — still 12" }, { id: "yes", label: "Yes" }], "no",
      "Rearranging moves counters; it never creates or destroys them. Both shapes hold 12.") },
  [
    reused("SameTotalMcq", "g2a9-k1", H.rows, ["Shapes vary, counts hold.", "Recount to confirm."]),
    reused("RowSumStage1", "g2a9-k2", H.rows, ["Pick the friendlier slicing.", "Doubles are easy rows."]),
    reused("SameTotalMcq", "g2a9-k3", H.rows, ["Every honest slicing agrees.", "Choice is yours; count is not."]),
    reused("ColSumStage", "g2a9-ch1", H.rows, ["Verify one shape by columns.", "The agreement is the proof."]),
  ],
  ["One total, many shapes.", "Rearranging never changes count.", "Choose the easy slicing."],
  "next: arrays out in the world.");

def(10,
  "Egg cartons, garden beds, window panes — the world stacks things in rows and columns, and your row-by-row sum totals every one of them.",
  "Spot the array, name the rows and row size, write the repeated sum, and stage the addition. Four moves, any array.",
  { rep: "diagram", widget: () => arrayTap("A seed tray: 3 rows of 5. Tap every counter in the MIDDLE row.", 3, 5, "selectAll",
      (ri) => ri === 2,
      (ri, ci) => `Row ${ri}, column ${ci} misses the middle — of three rows the middle is row 2; tap its counter in this column instead.`),
    predict: P("A muffin tin has 3 rows of 4. Which sum totals it by rows?", [{ id: "right", label: "4 + 4 + 4" }, { id: "wrong", label: "3 + 4" }], "right",
      "Three rows, each worth 4 muffins — three fours, added in stages.") },
  [
    reused("StoryArrayNumeric", "g2a10-k1", H.story, ["Name the rows and row size first.", "Then stage the sum."]),
    reused("RepeatedSumMcq", "g2a10-k2", H.rows, ["The world's arrays follow the rule.", "Addend equals row size."]),
    reused("StoryArrayNumeric", "g2a10-k3", H.story, ["Keep the running total honest.", "The last row lands it."]),
    reused("StoryArrayNumeric", "g2a10-ch1", H.story, ["Bigger trays, same four moves.", "Spot, name, write, stage."]),
  ],
  ["The world is full of arrays.", "Spot, name, write, stage.", "Row-by-row totals anything."],
  "course complete: parity and arrays, seen and summed.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 10, `10 lessons defined, got ${L.length}`);
const chapterTitles = ["Pairs, Odd, and Even", "Rows and Columns", "Arrays and Their Sums"];
const perChapter = [4, 3, 3];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 7 ? 2 : 3);
const outDir = join(root, "content/courses/arrays-even-odd-g2");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g2a-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "diagram") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "arrays-even-odd-g2",
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
    if (w.type === "oddEvenPairs") {
      must((w.n % 2 === 0 ? "even" : "odd") === w.answer, `${id}/${s.id} oddEvenPairs answer mismatch`);
      const wrong = w.answer === "even" ? w.oddFeedback : w.evenFeedback;
      must(typeof wrong === "string" && wrong.length >= 25, `${id}/${s.id} pairs wrong-parity diagnosis`);
      must(!(w.answer === "even" && w.evenFeedback) && !(w.answer === "odd" && w.oddFeedback),
        `${id}/${s.id} pairs: the answer's own slot can never fire`);
      must(w.successFeedback.length >= 25, `${id}/${s.id} pairs success feedback short`);
    }
    if (w.type === "tapDiagram") {
      const nc = w.hotspots.filter((h) => h.correct).length;
      must(nc >= 1, `${id}/${s.id} tapDiagram needs a correct hotspot`);
      if (w.mode === "selectOne") must(nc === 1, `${id}/${s.id} selectOne exactly one`);
      const dfb = w.hotspots.filter((h) => !h.correct).map((h) => h.feedback);
      for (const f of dfb) must(f && f.length >= 25, `${id}/${s.id} distractor feedback`);
      must(new Set(dfb).size === dfb.length, `${id}/${s.id} distractor feedback not distinct`);
      must(new Set(w.hotspots.map((h) => h.id)).size === w.hotspots.length, `${id}/${s.id} hotspot ids`);
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
  id: "arrays-even-odd-g2", slug: "arrays-even-odd-g2", title: spec.title,
  tagline: "Pair it, stack it, sum it — parity and arrays that show their own arithmetic.",
  category: "Math", gradeLevel: 2, chapters,
}, null, 2) + "\n");
console.log(`built 10 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
