#!/usr/bin/env node
// S184: build the decimals-intro-g4 course (18 lessons) — the second K5-expansion course and the
// first over the hundredthsGrid engine.
//
// Same factory contract as build-counting-100-k.mjs (S183): house-format lessons GENERATED from
// per-lesson packs in the 9-step A-tier shape (c1 · i1+predict · k1 · c2 · i2 · k2 · k3 · ch1 · r1,
// plus a remedial per conceptTag). Every number is DERIVED from the pack — never typed twice — and
// the factory asserts internal consistency (grid targets within the mode's cell count, prefilled
// under target, mcq answers present, rationalCompare's answer slot ABSENT, drag orders sorted,
// predictions resolvable) BEFORE writing anything. Titles, conceptTags and standards come verbatim
// from the landed S113 spec (k5-expansion.json).
//
// i1 is the hundredthsGrid engine with a prediction; i2 is a second grid task in the linked mode
// for lessons 1–13 and a variant-backed decimal ordering drag for lessons 14–18 (ordering enters
// the curriculum at lesson 14 — earlier lessons must not grade a concept not yet taught).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "decimals-intro-g4");
if (!spec || spec.lessons.length !== 18) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };
const dec1 = (k) => (k / 10).toFixed(1);
const dec2 = (n) => (n / 100).toFixed(2);

// ——— widget builders (all derived, all asserted) ———
function grid(prompt, mode, target, opts = {}) {
  const total = mode === "tenths" ? 10 : 100;
  const prefilled = opts.prefilled ?? 0;
  must(Number.isInteger(target) && target >= 0 && target <= total, `grid target ${target}/${total}`);
  must(Number.isInteger(prefilled) && prefilled >= 0 && prefilled <= target, `grid prefilled ${prefilled} vs target ${target}`);
  const commonCounts = (opts.traps ?? []).map(([count, feedback]) => {
    must(Number.isInteger(count) && count >= 0 && count <= total && count !== target, `grid trap ${count}`);
    must(feedback.length >= 25, `grid trap feedback short`);
    return { count, feedback };
  });
  must(new Set(commonCounts.map((c) => c.count)).size === commonCounts.length, "grid trap counts distinct");
  return {
    type: "hundredthsGrid", prompt, mode, target, prefilled,
    showDecimal: opts.showDecimal ?? true, commonCounts,
    successFeedback: opts.success,
    lowFeedback: opts.low ?? `The shaded amount is still below the target. ${mode === "hundredths" ? "Fill whole columns for the tenths digit first, then single cells for the hundredths." : "Each column is one tenth — count the shaded columns against the decimal."}`,
    highFeedback: opts.high ?? `The shaded amount has gone past the target. ${mode === "hundredths" ? "Each full column is one tenth — check the tenths digit before adding single cells." : "Each column is one tenth — count the shaded columns against the decimal."}`,
  };
}
function numeric(prompt, answer, traps, fallback) {
  const commonErrors = traps.map(([value, feedback]) => {
    must(value !== answer, `numeric trap equals answer: ${value}`);
    must(feedback.length >= 25, `numeric trap feedback short: ${prompt}`);
    return { value, feedback };
  });
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `numeric traps distinct: ${prompt}`);
  must(fallback.length >= 25, `numeric fallback short`);
  return { type: "numeric", prompt, answer, tolerance: 0, unit: "", commonErrors, fallbackFeedback: fallback };
}
function mcq(prompt, correct, wrongs) {
  const opts = [{ label: String(correct[0]), feedback: correct[1], ok: true },
    ...wrongs.map(([l, f]) => ({ label: String(l), feedback: f, ok: false }))];
  must(new Set(opts.map((o) => o.label)).size === opts.length, `dup mcq labels: ${prompt}`);
  for (const o of opts) must(o.feedback.length >= 25, `mcq feedback short: ${prompt}`);
  const rot = (prompt.length % opts.length);
  const shown = [...opts.slice(rot), ...opts.slice(0, rot)].map((o, i) => ({ id: `o${i}`, label: o.label, feedback: o.feedback, correct: o.ok }));
  must(shown.filter((o) => o.correct).length === 1, "exactly one correct");
  return { type: "mcq", prompt, options: shown };
}
function compare(prompt, leftStr, rightStr) {
  const L = Number(leftStr), R = Number(rightStr);
  const answer = L < R ? "lt" : L > R ? "gt" : "eq";
  const w = {
    type: "rationalCompare", prompt, left: { value: leftStr }, right: { value: rightStr }, answer,
    successFeedback: `Correct — comparing digit by digit from the tenths place settles it: ${leftStr} ${answer === "lt" ? "<" : answer === "gt" ? ">" : "="} ${rightStr}.`,
  };
  if (answer !== "lt") w.ltFeedback = `Line up the places before deciding: compare the tenths digits of ${leftStr} and ${rightStr} first, and only look at hundredths when the tenths tie. Counting digits instead of comparing places points the wrong way here.`;
  if (answer !== "eq") w.eqFeedback = `These two decimals name different amounts. Compare place by place — the digits differ, so the two values cannot be equal.`;
  if (answer !== "gt") w.gtFeedback = `Line up the places before deciding: compare the tenths digits of ${leftStr} and ${rightStr} first, and only look at hundredths when the tenths tie. A longer decimal is often the smaller one.`;
  // The variants-gate discipline, applied to authored content too: the answer's own slot is absent.
  must(w[`${answer}Feedback`] === undefined, "compare answer slot must be absent");
  must(["lt", "eq", "gt"].filter((r) => r !== answer).every((r) => (w[`${r}Feedback`] ?? "").length >= 25), "compare diagnoses present");
  return w;
}
function drag(prompt, valueStrs) {
  const ordered = [...valueStrs].sort((a, b) => Number(a) - Number(b));
  must(new Set(ordered.map(Number)).size === ordered.length, `drag values distinct: ${valueStrs}`);
  const items = ordered.map((v, i) => ({ id: `d${i}`, label: v }));
  const shown = [items[2], items[0], items[3], items[1]];
  must(shown.length === items.length, "drag uses 4 values");
  return {
    type: "dragOrder", prompt, items: shown, correctOrder: items.map((x) => x.id),
    misorderFeedback: [
      { first: items[3].id, second: items[0].id, feedback: `${items[3].label} placed before ${items[0].label} starts with the greatest value. Compare tenths digits first — the count of digits after the point says nothing about size.` },
      { first: items[1].id, second: items[2].id, feedback: `${items[2].label} is the larger of that pair: its tenths digit wins before any hundredths are read. Compare place by place, left to right.` },
    ],
    missFeedback: `Compare the tenths digits first and only use the hundredths digits to break ties — then place the values from smallest to greatest.`,
    successFeedback: `Correct — ${ordered.join(", ")} runs from smallest to greatest when the decimals are compared place by place.`,
  };
}
const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`The manipulated model and the mathematical relationship for ${tag.replace(/-/g, " ")} must stay consistent.`],
  misconceptions: [`Changing a visible feature without preserving the relationship that defines ${tag.replace(/-/g, " ")}.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `decimals-intro-g4:${tag}`, delayed: true,
  counterfactualPrompt: "What change would make the model stop representing the same mathematical relationship?",
});
const V = (form) => ({ gen: "g4-decimals", form });

// ——— reusable check packs (each mirrors a g4-decimals form exactly) ———
const tenthsWrite = (k) => ({
  body: "Write the decimal.",
  ev: [`${k} shaded columns of 10 is ${k} tenths: ${dec1(k)}.`, `Each column is one tenth, so ${k} columns writes as ${dec1(k)}.`],
  widget: numeric(`A unit square is split into 10 equal columns, and ${k} of them are shaded. Write the shaded amount as a decimal.`, k / 10,
    [[k, `That is the count of shaded columns, and a count of parts is a whole number. Each column is one tenth of the square, so ${k} columns is ${k} tenths, written with the ${k} in the tenths place.`],
     [k / 100, `That puts the ${k} in the hundredths place, which would mean ${k} cells of a hundred-cell grid. This square has only 10 columns, so each shaded column is a tenth of the whole.`]],
    `Each column is one tenth of the square. Count the shaded columns and write that count in the tenths place, directly after the decimal point.`),
  hints: [`Each column is one tenth.`, `${k} columns means ${k} tenths.`, `Write ${dec1(k)}.`], variant: V("dTenthsWriteNumeric"),
});
const tenthsFraction = (k) => ({
  body: "Match the fraction.",
  ev: [`${dec1(k)} means ${k} of 10 equal parts: ${k}/10.`, `The ${k} sits in the tenths place, so the fraction is ${k}/10.`],
  widget: mcq(`Which fraction names the same amount as ${dec1(k)}?`,
    [`${k}/10`, `Correct — the digit ${k} sits in the tenths place, so ${dec1(k)} means ${k} of 10 equal parts.`],
    [[`${k}/100`, `A denominator of 100 would mean ${k} hundredths, written ${dec2(k)}. The digit ${k} in ${dec1(k)} sits one place higher — in the tenths place.`],
     [`10/${k}`, `That fraction has the part count and the number of equal pieces swapped. The decimal names ${k} pieces out of 10 equal pieces, so ${k} belongs on top.`],
     [`${k}/1`, `A denominator of 1 would make this ${k} whole units. The decimal point in ${dec1(k)} says the amount is less than one whole, cut into 10 equal parts.`]]),
  hints: [`Tenths means 10 equal parts.`, `How many of the 10 parts?`, `${k}/10.`], variant: V("dTenthsFractionMcq"),
});
const hundredthsWrite = (n) => ({
  body: "Write the decimal.",
  ev: [`${n} cells of 100 is ${n} hundredths: ${dec2(n)}.`, `Each cell is one hundredth, so ${n} cells writes as ${dec2(n)}.`],
  widget: numeric(`A unit square is split into 100 equal cells, and ${n} of them are shaded. Write the shaded amount as a decimal.`, n / 100,
    [[n, `That is the count of shaded cells, and a count of parts is a whole number. Each cell is one hundredth of the square, so the count belongs after the decimal point, ending in the hundredths place.`],
     [n / 10, `That reads the count as tenths, but each cell is one hundredth of the square — a tenth is a whole column of 10 cells. Write the count so it ends in the hundredths place.`]],
    `Each cell is one hundredth. Write the count of shaded cells so its last digit lands in the hundredths place — two places after the decimal point.`),
  hints: [`Each cell is one hundredth.`, `${n} cells means ${n} hundredths.`, `Write ${dec2(n)}.`], variant: V("dHundredthsWriteNumeric"),
});
const hundredthsCells = (n) => {
  const tens = Math.floor(n / 10), swap = (n % 10) * 10 + tens;
  const traps = [[tens, `That shades only the tenths digit's worth of single cells. In ${dec2(n)} the ${tens} sits in the tenths place, so it is worth ${tens} full columns — ${tens * 10} cells — before the hundredths digit adds any more.`]];
  if (swap !== n && swap !== tens) traps.push([swap, `That count swaps the two digits of ${dec2(n)}. Read the decimal place by place: the first digit after the point counts full columns of ten, and the second counts single cells.`]);
  if (traps.length < 2) {
    const off = n + 10 <= 100 ? n + 10 : n - 10;
    traps.push([off, `That count is one full column — ten cells — ${off > n ? "past" : "short of"} the amount. The tenths digit of ${dec2(n)} calls for exactly ${tens} full columns.`]);
  }
  return {
    body: "Count the cells.",
    ev: [`${dec2(n)} needs ${tens} full columns plus ${n % 10} cells: ${n} in all.`, `${dec2(n)} is ${n} hundredths, so ${n} cells must be shaded.`],
    widget: numeric(`A hundredths grid has 100 equal cells. How many cells must be shaded to show ${dec2(n)}?`, n, traps,
      `Each full column of the grid is one tenth — ten cells — and each single cell is one hundredth. Turn each digit of the decimal into cells and add the two counts.`),
    hints: [`A full column is ten cells.`, `Tenths digit ×10, plus the hundredths digit.`, `${tens}×10 + ${n % 10} = ${n}.`], variant: V("dHundredthsCellsNumeric"),
  };
};
const tenthToHundredth = (k) => ({
  body: "Rename the tenths.",
  ev: [`Each tenth is 10 hundredths, so ${dec1(k)} is ${k * 10}/100.`, `${k} tenths × 10 = ${k * 10} hundredths.`],
  widget: numeric(`${dec1(k)} = ?/100. What numerator makes the fraction name the same amount?`, k * 10,
    [[k, `That copies the tenths count without rescaling it. Each tenth is 10 hundredths, so ${k} tenths covers ${k} × 10 hundredths of the same whole.`],
     [k * 100, `That multiplies by 100 as if ${dec1(k)} were ${k} whole units. It is ${k} tenths, and each tenth contains 10 hundredths, so multiply the count by 10.`]],
    `Every tenth is worth 10 hundredths — one full column of a hundredths grid. Multiply the tenths count by 10 to rename the amount in hundredths.`),
  hints: [`One tenth is one full column.`, `A column holds 10 cells.`, `${k} × 10 = ${k * 10}.`], variant: V("dTenthToHundredthNumeric"),
});
const addTenthHundredth = (a, b) => {
  const ans = (a * 10 + b) / 100;
  const traps = [];
  if ((a + b) / 10 !== ans) traps.push([(a + b) / 10, `That adds the digits ${a} and ${b} as if both were tenths, but the ${b} in ${dec2(b)} sits in the hundredths place. Rename ${dec1(a)} as ${a * 10} hundredths first, then add.`]);
  if ((a + b) / 100 !== ans) traps.push([(a + b) / 100, `That adds the digits ${a} and ${b} as if both were hundredths, but the ${a} in ${dec1(a)} sits in the tenths place and is worth ${a * 10} hundredths. Rename before adding.`]);
  return {
    body: "Add the parts.",
    ev: [`${dec1(a)} is ${a * 10} hundredths; add ${b} more for ${a * 10 + b} hundredths: ${dec2(a * 10 + b)}.`, `Rename, then add: ${a * 10} + ${b} = ${a * 10 + b} hundredths.`],
    widget: numeric(`Add ${dec1(a)} + ${dec2(b)}. Write the sum as a decimal.`, ans, traps,
      `Rename the tenths as hundredths first: ${dec1(a)} is ${a * 10} hundredths. Then add the hundredths counts and write the total back as a decimal.`),
    hints: [`Rename the tenths as hundredths.`, `${dec1(a)} is ${a * 10} hundredths.`, `${a * 10} + ${b} = ${a * 10 + b}: write ${dec2(a * 10 + b)}.`], variant: V("dAddTenthHundredthNumeric"),
  };
};
const readDecimal = (n) => {
  const isOne = n < 10, tens = Math.floor(n / 10);
  const wrongs = isOne
    ? [[`${n} tenths`, `${n} tenths would be written ${dec1(n)}, with the ${n} directly after the point. In ${dec2(n)} a zero holds the tenths place, pushing the ${n} into the hundredths place.`],
       [`${n} ones`, `${n} ones would be the whole number ${n}, with no decimal point needed. The digits after the point name parts of one whole, not whole units.`],
       [`${n * 10} hundredths`, `${n * 10} hundredths is ${dec2(n * 10)} — a full ${n}-column amount. The zero in the tenths place of ${dec2(n)} means there are no full columns, only ${n} single hundredths.`]]
    : [[`${n} tenths`, `${n} tenths would be ${(n / 10).toFixed(1)} — more than one whole. The two digits of ${dec2(n)} end in the hundredths place, so the count names hundredths.`],
       [`${tens} hundredths`, `That reads only the first digit after the point. The name uses the full count: both decimal digits of ${dec2(n)} together name ${n} hundredths.`],
       [`${n} ones`, `${n} ones would be the whole number ${n}. Digits after the decimal point count parts of a single whole, not whole units.`]];
  return {
    body: "Say its name.",
    ev: [`${dec2(n)} is read "${n} hundredths" — the digits end in the hundredths place.`, `The name counts the hundredths: ${n} of them.`],
    widget: mcq(`How is the decimal ${dec2(n)} read as a number name?`,
      [`${n} hundredths`, `Correct — the ${isOne ? `${n} sits two places after the point, in the hundredths place, so ${dec2(n)} names ${n} hundredths` : `last digit of ${dec2(n)} lands in the hundredths place, so the whole two-digit count ${n} names hundredths`}.`], wrongs),
    hints: [`Where does the last digit land?`, `Two places after the point means hundredths.`, `${n} hundredths.`], variant: V("dReadDecimalMcq"),
  };
};
const placeName = (a, b, askTenths) => {
  const n = a * 10 + b, asked = askTenths ? a : b, place = askTenths ? "tenths" : "hundredths", other = askTenths ? "hundredths" : "tenths";
  must(a !== b, `placeName digits must differ: ${a}${b}`);
  return {
    body: "Name the place.",
    ev: [`In ${dec2(n)}, the ${a} is in the tenths place and the ${b} is in the hundredths place.`, `Reading outward from the point: tenths first, then hundredths — the ${asked} is in the ${place} place.`],
    widget: mcq(`In the decimal ${dec2(n)}, which place does the digit ${asked} occupy?`,
      [place, `Correct — reading left from the decimal point, ${dec2(n)} has ${a} in the tenths place and ${b} in the hundredths place, so the ${asked} is in the ${place} place.`],
      [[other, `The ${other} place of ${dec2(n)} holds the digit ${askTenths ? b : a}. Read outward from the decimal point: tenths first, then hundredths.`],
       ["ones", `The ones place sits to the LEFT of the decimal point, and in ${dec2(n)} it holds 0. The digit ${asked} sits after the point, among the decimal places.`],
       ["tens", `The tens place is two positions left of the decimal point — this number has no digit there at all. The digit ${asked} sits after the point, among the decimal places.`]]),
    hints: [`Start at the decimal point.`, `First place after the point is tenths.`, `The ${asked} is in the ${place} place.`], variant: V("dPlaceNameMcq"),
  };
};
const fractionToDecimal = (n, den) => ({
  body: "Write it as a decimal.",
  ev: [`${n}/${den} means ${n} ${den === 10 ? "tenths" : "hundredths"}: ${den === 10 ? dec1(n) : dec2(n)}.`, `A denominator of ${den} names ${den === 10 ? "tenths" : "hundredths"}, so the numerator fills that place.`],
  widget: den === 10
    ? numeric(`Write the fraction ${n}/10 as a decimal.`, n / 10,
        [[n, `That drops the denominator. The fraction names ${n} parts out of 10, so its decimal puts the ${n} in the tenths place — a value less than one whole.`],
         [n / 100, `That writes ${n} in the hundredths place, which names ${n}/100. Tenths sit one place higher: directly after the decimal point.`]],
        `A denominator of 10 means tenths. Write the numerator in the tenths place, directly after the decimal point.`)
    : numeric(`Write the fraction ${n}/100 as a decimal.`, n / 100,
        [[n, `That drops the denominator. The fraction names ${n} parts out of 100, so its decimal must end in the hundredths place — a value less than one whole.`],
         [n / 10, `That treats the count as tenths, naming ${n}/10 instead. A denominator of 100 means the count must end two places after the decimal point.`]],
        `A denominator of 100 means hundredths. Write the numerator so its last digit lands two places after the decimal point.`),
  hints: [`The denominator names the place.`, `${den === 10 ? "Tenths: one place" : "Hundredths: two places"} after the point.`, `${den === 10 ? dec1(n) : dec2(n)}.`], variant: V("dFractionToDecimalNumeric"),
});
const decimalToFraction = (n) => {
  const tens = Math.floor(n / 10), swap = (n % 10) * 10 + tens;
  const wrongs = [
    [`${n}/10`, `A denominator of 10 makes this ${n} tenths — more than one whole. The two digits of ${dec2(n)} end in the hundredths place, so the whole names hundredths.`],
    [`${tens}/10`, `That keeps only the tenths digit and drops the hundredths digit entirely. Both decimal digits of ${dec2(n)} count toward the amount: ${n} hundredths in all.`],
  ];
  if (swap !== n) wrongs.push([`${swap}/100`, `That fraction swaps the two digits of ${dec2(n)}. Read the decimal place by place — the digit order carries the value.`]);
  else wrongs.push([`${n % 10}/100`, `That fraction keeps only one digit of ${dec2(n)}. Both digits count toward the amount — ${n} hundredths in all, not ${n % 10}.`]);
  return {
    body: "Match the fraction.",
    ev: [`${dec2(n)} is ${n} hundredths: ${n}/100.`, `The digits end in the hundredths place, so the fraction is ${n}/100.`],
    widget: mcq(`Which fraction names the same amount as ${dec2(n)}?`,
      [`${n}/100`, `Correct — the digits of ${dec2(n)} end in the hundredths place, so the amount is ${n} out of 100 equal parts.`], wrongs),
    hints: [`Where does the last digit land?`, `Two places after the point: hundredths.`, `${n}/100.`], variant: V("dDecimalToFractionMcq"),
  };
};
const compareCheck = (leftStr, rightStr, body = "Choose the relation.") => {
  const L = Number(leftStr), R = Number(rightStr);
  const rel = L < R ? "<" : L > R ? ">" : "=";
  return {
    body,
    ev: [`Compare tenths first${L !== R ? `: the amounts differ, so ${leftStr} ${rel} ${rightStr}` : `, then hundredths — the amounts match, so ${leftStr} = ${rightStr}`}.`,
         `Place-by-place comparison gives ${leftStr} ${rel} ${rightStr}.`],
    widget: compare(`Compare the two decimals: ${leftStr} ? ${rightStr}. Choose the relation that holds.`, leftStr, rightStr),
    hints: [`Line up the decimal points.`, `Compare the tenths digits first.`, `${leftStr} ${rel} ${rightStr}.`],
    variant: V(L === R ? "dTrailingZeroRational" : "dCompareRational"),
  };
};
const orderCheck = (valueStrs) => ({
  body: "Put them in order.",
  ev: [`Compared place by place, the order is ${[...valueStrs].sort((a, b) => Number(a) - Number(b)).join(", ")}.`, `Tenths digits first, hundredths to break ties — smallest to greatest.`],
  widget: drag(`Drag the decimals into order from smallest to greatest.`, valueStrs),
  hints: [`Compare tenths digits first.`, `Digit count is not size.`, `Smallest first: ${[...valueStrs].sort((a, b) => Number(a) - Number(b))[0]}.`], variant: V("dOrderDrag"),
});
const money = (d, c) => {
  const ans = (d * 10 + c) / 100, swap = (c * 10 + d) / 100;
  const traps = [[d * 10 + c, `That is the total in cents, and the prompt asks for dollars. One cent is one hundredth of a dollar, so place the cents count after the decimal point.`]];
  if (swap !== ans) traps.push([swap, `That puts the pennies count in the dimes place and the dimes count in the pennies place. A dime is a tenth of a dollar and a penny is a hundredth — the order of the digits carries the value.`]);
  return {
    body: "Write the dollars.",
    ev: [`${d} dimes is ${d} tenths and ${c} pennies is ${c} hundredths: $${dec2(d * 10 + c)}.`, `Dimes fill the tenths place, pennies the hundredths: ${dec2(d * 10 + c)}.`],
    widget: numeric(`A pocket holds ${d} dimes and ${c} pennies. Write the total amount in dollars as a decimal.`, ans, traps,
      `A dime is one tenth of a dollar and a penny is one hundredth. Write the dimes count in the tenths place and the pennies count in the hundredths place.`),
    hints: [`A dime is a tenth of a dollar.`, `A penny is a hundredth.`, `${d} dimes and ${c} pennies: ${dec2(d * 10 + c)}.`], variant: V("dMoneyNumeric"),
  };
};
const measure = (n) => ({
  body: "Write the meters.",
  ev: [`Each centimeter is one hundredth of a meter, so ${n} cm is ${dec2(n)} m.`, `${n}/100 of a meter writes as ${dec2(n)}.`],
  widget: numeric(`A ribbon measures ${n} centimeters. One meter is 100 centimeters. Write the ribbon's length in meters as a decimal.`, n / 100,
    [[n, `That keeps the number in centimeters. Each centimeter is one hundredth of a meter, so the count must move behind the decimal point to name meters.`],
     [n / 10, `That treats each centimeter as a tenth of a meter, but a meter holds 100 centimeters — each one is a hundredth. The count must end two places after the decimal point.`]],
    `Each centimeter is one hundredth of a meter. Write the centimeter count so its last digit lands in the hundredths place.`),
  hints: [`One meter is 100 centimeters.`, `Each centimeter is one hundredth of a meter.`, `${n} cm = ${dec2(n)} m.`], variant: V("dMeasureNumeric"),
});

// ——— i1 grid tasks + predictions ———
const gT = (k, extra = {}) => grid(`Shade the strip to show ${dec1(k)}. Each column is one tenth.`, "tenths", k, {
  traps: [[k > 5 ? k - 5 : k + 3, `The count of shaded columns must match the tenths digit of ${dec1(k)} — that digit is ${k}, so ${k} columns.`]],
  success: `Exactly ${k} of the 10 columns — ${k} tenths, which the decimal writes as ${dec1(k)}.`, ...extra,
});
const gH = (n, extra = {}) => {
  const tens = Math.floor(n / 10), swap = (n % 10) * 10 + tens;
  const traps = [];
  if (n % 10 !== 0 && tens > 0) traps.push([n % 10, `That shades only ${n % 10} single cells. The tenths digit of ${dec2(n)} is worth whole columns: ${tens} full columns first, then ${n % 10} more cells.`]);
  if (swap !== n && swap <= 100 && swap !== (n % 10)) traps.push([swap, `That count swaps the digits of ${dec2(n)}. The first digit after the point counts full columns; the second counts single cells.`]);
  return grid(`Shade the grid to show ${dec2(n)}. Each full column is one tenth; each cell is one hundredth.`, "hundredths", n, {
    traps, success: `Exactly ${n} of the 100 cells — ${tens > 0 ? `${tens} full column${tens === 1 ? "" : "s"} and ${n % 10} more cell${n % 10 === 1 ? "" : "s"}: ` : ""}${n} hundredths, written ${dec2(n)}.`, ...extra,
  });
};
const P = (prompt, opts, outcomeId, reveal) => {
  must(opts.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options: opts, outcomeId, reveal };
};

// ——— the 18 lessons ———
const L = [];
const push = (d) => L.push(d);
const def = (n, ch, c1, c2, i1, k1, k2, k3, ch1, i2, recap, teaser) =>
  push({ n, ch, c1, c2, i1, k1, k2, k3, ch1, i2, recap, teaser });

def(1, 1,
  "One whole can be split into 10 equal parts. Each part is called one tenth of the whole.",
  "The count of shaded tenths becomes a decimal: write the count just after a dot called the decimal point. Three tenths is 0.3.",
  { body: "Split one into ten.", widget: () => gT(3), rep: "diagram",
    predict: P("The strip has 10 equal columns and you will shade 3 of them. How much of the whole strip is that?",
      [{ id: "tenths", label: "3 tenths of the strip" }, { id: "wholes", label: "3 whole strips" }, { id: "hund", label: "3 hundredths of the strip" }], "tenths",
      "Each column is one of 10 equal parts — one tenth. Shading 3 columns covers 3 tenths of the whole, which the decimal 0.3 names.") },
  tenthsWrite(3), tenthsWrite(7), tenthsFraction(4), tenthsWrite(6),
  { body: "Show a different amount.", widget: () => gT(8, { success: "Exactly 8 of the 10 columns — 8 tenths, written 0.8." }) },
  ["One whole splits into 10 equal tenths.", "The tenths count sits right after the decimal point.", "0.3 means 3 of 10 equal parts."],
  "next: writing any number of tenths.")
def(2, 1,
  "Every count of tenths has a decimal name. The digit after the decimal point counts the tenths.",
  "Zero point five, zero point nine — the pattern is always the same: the tenths digit counts the shaded columns.",
  { body: "Write a tenth.", widget: () => gT(5), rep: "diagram",
    predict: P("You will shade 5 of the 10 columns. Which decimal will name the shaded amount?",
      [{ id: "d5", label: "0.5" }, { id: "d05", label: "0.05" }, { id: "w5", label: "5" }], "d5",
      "Five columns is 5 tenths. The decimal puts that 5 directly after the point: 0.5.") },
  tenthsWrite(5), tenthsFraction(9), tenthsWrite(2), tenthsWrite(9),
  { body: "One more tenth count.", widget: () => gT(6, { success: "Exactly 6 of the 10 columns — 6 tenths, written 0.6." }) },
  ["The tenths digit counts shaded columns.", "0.5 and 0.9 follow one pattern.", "A count of tenths is less than one whole."],
  "next: tenths living on the number line.")
def(3, 1,
  "The strip is a piece of the number line: its left edge is 0 and its right edge is 1. The column edges mark the tenths.",
  "Each tenth is one step of the walk from 0 to 1. Shading 0.4 walks four of the ten steps.",
  { body: "Tenths on the line.", widget: () => gT(4), rep: "number-line",
    predict: P("The strip runs from 0 on the left to 1 on the right. Shading 0.4 fills the strip to a point — where?",
      [{ id: "before", label: "Less than halfway to 1" }, { id: "half", label: "Exactly halfway" }, { id: "past", label: "More than halfway" }], "before",
      "0.4 is 4 of the 10 steps from 0 to 1 — one step short of halfway. Halfway is 0.5, five steps.") },
  tenthsWrite(4), tenthsFraction(6), tenthsWrite(8), tenthsWrite(1),
  { body: "Walk further along.", widget: () => gT(7, { success: "Exactly 7 of the 10 columns — 0.7, seven steps of the walk from 0 to 1." }) },
  ["The strip runs from 0 to 1.", "Each tenth is one step of ten.", "0.4 stops one step short of halfway."],
  "next: tenths written as fractions.")
def(4, 1,
  "A tenths decimal and a tenths fraction name the same amount two ways: 0.7 and 7/10 are the same seven parts.",
  "The fraction shows the split (10 equal parts) and the count (7 of them). The decimal hides the 10 and keeps the 7.",
  { body: "Two names, one amount.", widget: () => gT(6), rep: "diagram",
    predict: P("You will shade 6 columns. Which fraction will name the same amount as the decimal 0.6?",
      [{ id: "f610", label: "6/10" }, { id: "f6100", label: "6/100" }, { id: "f106", label: "10/6" }], "f610",
      "Six of ten equal parts is 6/10 — the fraction spells out what 0.6 abbreviates.") },
  tenthsFraction(7), fractionToDecimal(3, 10), tenthsFraction(2), fractionToDecimal(9, 10),
  { body: "Build another match.", widget: () => gT(9, { success: "Exactly 9 of the 10 columns — 0.9, the decimal name for 9/10." }) },
  ["0.7 and 7/10 name the same amount.", "The fraction shows the split; the decimal hides it.", "Tenths always means 10 equal parts."],
  "next: splitting each tenth into ten again.")
def(5, 1,
  "Each tenth can be split into 10 smaller parts. That makes 100 equal cells — each one is a hundredth of the whole.",
  "One full column of the new grid is still one tenth. It just shows up as 10 little hundredth-cells stacked together.",
  { body: "Split a tenth into ten.", widget: () => gH(10, { traps: [[1, "That shades one single cell — one hundredth. One full COLUMN is ten cells, because a tenth splits into ten hundredths."]], success: "One full column — 10 hundredths, which is exactly one tenth: 0.10 and 0.1 name the same amount." }), rep: "diagram",
    predict: P("The square now has 100 cells, in 10 columns of 10. How many cells make one full column?",
      [{ id: "ten", label: "10 cells" }, { id: "one", label: "1 cell" }, { id: "hundred", label: "100 cells" }], "ten",
      "A column holds 10 of the 100 cells. One tenth of the square equals ten hundredths of it.") },
  hundredthsWrite(4), hundredthsCells(30), hundredthsWrite(8), hundredthsCells(20),
  { body: "Shade two columns.", widget: () => gH(20, { success: "Two full columns — 20 hundredths, which is two tenths: 0.20 and 0.2 name the same amount." }) },
  ["Splitting each tenth by ten makes 100 hundredths.", "A full column is a tenth — ten hundredths.", "The grid shows both sizes at once."],
  "next: writing hundredths as decimals.")
def(6, 1,
  "A count of hundredths gets a two-digit decimal: the count's last digit lands two places after the point.",
  "When the count is small, a zero holds the tenths place: nine hundredths is 0.09, not 0.9.",
  { body: "Write a hundredth.", widget: () => gH(9), rep: "diagram",
    predict: P("You will shade 9 single cells — no full columns. Which decimal names that amount?",
      [{ id: "d09", label: "0.09" }, { id: "d9", label: "0.9" }, { id: "w9", label: "9" }], "d09",
      "Nine cells is nine hundredths. With no full columns there are zero tenths, so a 0 holds the tenths place: 0.09.") },
  hundredthsWrite(9), hundredthsWrite(35), readDecimal(7), hundredthsWrite(62),
  { body: "A bigger count.", widget: () => gH(45, { success: "Four full columns and five cells — 45 hundredths, written 0.45." }) },
  ["Hundredths counts end two places after the point.", "A zero can hold the tenths place: 0.09.", "0.9 and 0.09 are very different amounts."],
  "next: reading any amount off the grid.")
def(7, 2,
  "The grid reads any hundredths decimal: full columns show the tenths digit, single cells show the hundredths digit.",
  "0.37 is three full columns and seven more cells — 37 cells in all. The decimal's digits ARE the grid recipe.",
  { body: "Read the grid recipe.", widget: () => gH(37), rep: "diagram",
    predict: P("To shade 0.37, how many of the 100 cells will you fill in all?",
      [{ id: "c37", label: "37 cells" }, { id: "c3", label: "3 cells" }, { id: "c73", label: "73 cells" }], "c37",
      "The 3 in the tenths place is worth 3 full columns — 30 cells — and the 7 adds seven more: 37 cells.") },
  hundredthsCells(52), hundredthsWrite(28), hundredthsCells(74), hundredthsCells(86),
  { body: "Another recipe.", widget: () => gH(63, { success: "Six full columns and three cells — 63 hundredths, written 0.63." }) },
  ["Full columns carry the tenths digit.", "Single cells carry the hundredths digit.", "The decimal's digits are the grid recipe."],
  "next: renaming tenths as hundredths.")
def(8, 2,
  "Any tenths amount can be renamed in hundredths: each tenth is worth 10 hundredths, so multiply the count by 10.",
  "0.4 = 40/100. Four full columns hold 40 cells — same shading, new name.",
  { body: "Rename the tenths.", widget: () => gH(40, { traps: [[4, "That shades 4 single cells — 4 hundredths. Each TENTH is a full column of 10 cells, so 0.4 needs 4 whole columns: 40 cells."]], success: "Four full columns — the same amount as 0.4, now counted as 40 hundredths." }), rep: "diagram",
    predict: P("0.4 shades four full columns. Counted cell by cell, how many hundredths is that?",
      [{ id: "h40", label: "40 hundredths" }, { id: "h4", label: "4 hundredths" }, { id: "h44", label: "44 hundredths" }], "h40",
      "Each column holds 10 cells, so four columns hold 4 × 10 = 40 cells — 40 hundredths.") },
  tenthToHundredth(4), tenthToHundredth(7), hundredthsCells(90), tenthToHundredth(3),
  { body: "Rename a different amount.", widget: () => gH(60, { traps: [[6, "That shades 6 single cells. Each tenth is a full column of 10, so 0.6 needs 6 whole columns: 60 cells."]], success: "Six full columns — 0.6 renamed as 60 hundredths." }) },
  ["Each tenth is worth 10 hundredths.", "0.4 = 40/100 — same shading, new name.", "Renaming lets tenths and hundredths meet."],
  "next: adding tenths to hundredths.")
def(9, 2,
  "To add tenths and hundredths, rename first: turn the tenths into hundredths, then add the counts.",
  "0.2 + 0.05: the 0.2 is 20 hundredths, so the sum is 20 + 5 = 25 hundredths — 0.25.",
  { body: "Add to the given start.", widget: () => gH(25, { prefilled: 20, traps: [[21, "That adds just one cell. The 0.05 being added is 5 hundredths — five cells on top of the 20 already shaded."]], success: "20 given cells plus 5 more — 25 hundredths in all: 0.2 + 0.05 = 0.25." }), rep: "diagram",
    predict: P("Two full columns (0.2) are already shaded. After adding 0.05 — five more cells — what will the total be?",
      [{ id: "s25", label: "0.25" }, { id: "s7", label: "0.7" }, { id: "s205", label: "0.205" }], "s25",
      "0.2 is 20 hundredths. Adding 5 hundredths makes 25 hundredths: 0.25. Adding the digits 2 + 5 as if they shared a place would wrongly give 0.7.") },
  addTenthHundredth(2, 5), addTenthHundredth(3, 4), addTenthHundredth(6, 2), addTenthHundredth(5, 9),
  { body: "Add a new pair.", widget: () => gH(48, { prefilled: 40, traps: [[44, "That adds 4 cells, but the amount being added is 8 hundredths — eight cells on top of the 40 given."]], success: "40 given cells plus 8 more — 48 hundredths: 0.4 + 0.08 = 0.48." }) },
  ["Rename tenths as hundredths before adding.", "0.2 + 0.05 is 20 + 5 hundredths: 0.25.", "Digits only add when they share a place."],
  "next: saying decimal names out loud.")
def(10, 2,
  "A decimal is read by its last place: 0.62 is read \u201Csixty-two hundredths,\u201D because its digits end in the hundredths place.",
  "0.07 is \u201Cseven hundredths\u201D \u2014 the zero after the point is silent in the name, but it holds the tenths place open.",
  { body: "Name what you shade.", widget: () => gH(62), rep: "diagram",
    predict: P("You will shade 0.62 of the grid. Read aloud, what is this amount called?",
      [{ id: "h62", label: "62 hundredths" }, { id: "t62", label: "62 tenths" }, { id: "o62", label: "62 ones" }], "h62",
      "The digits of 0.62 end two places after the point — in the hundredths place — so the amount is named 62 hundredths.") },
  readDecimal(62), readDecimal(9), readDecimal(45), readDecimal(3),
  { body: "Shade a named amount.", widget: () => gH(81, { success: "Eight full columns and one cell — eighty-one hundredths, written 0.81." }) },
  ["Read a decimal by its last place.", "0.62 is sixty-two hundredths.", "A leading zero holds a place, silently."],
  "next: naming each place on its own.")
def(11, 2,
  "Each digit after the point has its own place name: first the tenths place, then the hundredths place.",
  "In 0.58, the 5 is in the tenths place — worth five full columns — and the 8 is in the hundredths place — eight single cells.",
  { body: "Place by place.", widget: () => gH(58), rep: "diagram",
    predict: P("In the decimal 0.58, which place does the digit 5 occupy?",
      [{ id: "tenths", label: "The tenths place" }, { id: "hund", label: "The hundredths place" }, { id: "ones", label: "The ones place" }], "tenths",
      "Reading outward from the point, the first place is tenths: the 5 in 0.58 is 5 tenths — five full columns of the grid.") },
  placeName(5, 8, true), placeName(2, 7, false), placeName(9, 1, true), placeName(3, 6, false),
  { body: "Build from places.", widget: () => gH(74, { success: "Seven full columns for the 7 in the tenths place, four cells for the 4 in the hundredths place: 0.74." }) },
  ["First place after the point: tenths.", "Second place: hundredths.", "Each digit's place sets its worth."],
  "next: turning any fraction of 10 or 100 into a decimal.")
def(12, 2,
  "Fractions over 10 or over 100 convert straight to decimals: the denominator names the place, the numerator fills it.",
  "62/100 becomes 0.62; 3/10 becomes 0.3. No arithmetic — just place the count.",
  { body: "Convert a fraction.", widget: () => gH(53), rep: "diagram",
    predict: P("The fraction 53/100 will be shaded on the grid. Which decimal names it?",
      [{ id: "d53", label: "0.53" }, { id: "d5", label: "0.5" }, { id: "w53", label: "53" }], "d53",
      "53 of 100 equal parts is 53 hundredths — the decimal places that count two digits after the point: 0.53.") },
  fractionToDecimal(53, 100), fractionToDecimal(8, 10), fractionToDecimal(6, 100), fractionToDecimal(97, 100),
  { body: "Convert one more.", widget: () => gH(29, { success: "Two full columns and nine cells — 29/100 shaded, written 0.29." }) },
  ["The denominator names the place.", "The numerator fills that place.", "62/100 = 0.62 with no arithmetic."],
  "next: the reverse trip, decimal to fraction.")
def(13, 3,
  "Every hundredths decimal converts back to a fraction over 100: 0.43 is 43/100.",
  "Watch the digit order — 0.43 is 43/100, not 34/100. The places carry the value.",
  { body: "Back to fractions.", widget: () => gH(43), rep: "diagram",
    predict: P("You will shade 0.43. Which fraction names the same amount?",
      [{ id: "f43", label: "43/100" }, { id: "f34", label: "34/100" }, { id: "f4310", label: "43/10" }], "f43",
      "0.43 is 43 hundredths — 43 of 100 equal parts. Swapping the digits to 34/100 would name a different shading.") },
  decimalToFraction(43), decimalToFraction(76), decimalToFraction(19), decimalToFraction(88),
  { body: "One more round trip.", widget: () => gH(67, { success: "Six full columns and seven cells — 0.67, the decimal for 67/100." }) },
  ["Hundredths decimals are fractions over 100.", "0.43 = 43/100 — digit order matters.", "Decimal and fraction are two views of one shading."],
  "next: which decimal is bigger?")
def(14, 3,
  "To compare decimals, line up the places: compare tenths digits first, and only check hundredths when the tenths tie.",
  "More digits does not mean more value: 0.5 beats 0.35, because 5 tenths beats 3 tenths before hundredths are even read.",
  { body: "See the comparison.", widget: () => gH(35, { traps: [[50, "That shades 0.50 — the OTHER number in the comparison. Shade 0.35: three full columns and five cells."]], success: "Three columns and five cells — 0.35. Against 0.5's five full columns, the grid shows 0.5 covers more." }), rep: "diagram",
    predict: P("Which is greater: 0.5 or 0.35?",
      [{ id: "half", label: "0.5" }, { id: "l35", label: "0.35" }, { id: "eq", label: "They are equal" }], "half",
      "0.5 is 5 tenths — five full columns. 0.35 is only 3 full columns and 5 cells. The tenths digits decide it: 5 > 3, so 0.5 is greater even though 0.35 has more digits.") },
  compareCheck("0.5", "0.35"), compareCheck("0.42", "0.6"), compareCheck("0.71", "0.75"), compareCheck("0.8", "0.29"),
  { body: "Shade the smaller one.", widget: () => gH(29, { traps: [[80, "That shades 0.80 — the larger of the pair. The smaller amount is 0.29: two columns and nine cells."]], success: "Two columns and nine cells — 0.29, the smaller of 0.29 and 0.8." }) },
  ["Compare tenths digits first.", "Hundredths only break ties.", "Digit count is not size: 0.5 > 0.35."],
  "next: the zero that changes nothing.")
def(15, 3,
  "A zero added after the last decimal digit changes nothing: 0.60 and 0.6 shade exactly the same six columns.",
  "0.60 says \u201C60 hundredths\u201D and 0.6 says \u201C6 tenths\u201D \u2014 two names for one amount, because 60 hundredths IS 6 tenths.",
  { body: "Test the trailing zero.", widget: () => gH(60, { traps: [[6, "That shades 6 single cells — 0.06. Both 0.6 and 0.60 mean six full columns; the trailing zero adds no cells."]], success: "Six full columns — 60 cells. 0.60 and 0.6 shade exactly the same amount." }), rep: "diagram",
    predict: P("Is 0.60 more than, less than, or the same as 0.6?",
      [{ id: "same", label: "The same amount" }, { id: "more", label: "0.60 is more" }, { id: "less", label: "0.60 is less" }], "same",
      "0.60 is 60 hundredths and 0.6 is 6 tenths — six full columns either way. A zero after the last digit adds nothing.") },
  compareCheck("0.60", "0.6"), compareCheck("0.3", "0.30"), compareCheck("0.90", "0.9"), compareCheck("0.7", "0.07", "Not every zero is silent."),
  { body: "Same amount, new digits.", widget: () => gH(30, { traps: [[3, "That shades 3 single cells — 0.03. Both 0.3 and 0.30 mean three full columns: 30 cells."]], success: "Three full columns — 0.30 and 0.3, one amount with two names." }) },
  ["A trailing zero adds no value.", "0.60 = 0.6 — sixty hundredths is six tenths.", "A zero BEFORE a digit still matters: 0.07 \u2260 0.7."],
  "next: lining up several decimals at once.")
def(16, 3,
  "Ordering decimals is repeated comparison: place them by tenths digits first, using hundredths only for ties.",
  "In 0.09, 0.35, 0.4, 0.5 the digit counts vary, but the tenths digits 0, 3, 4, 5 already tell the whole story.",
  { body: "Find the smallest.", widget: () => gH(9, { traps: [[90, "That shades 0.90 — nine full columns, nearly the whole grid. The smallest of the set is 0.09: nine single cells with no full column."]], success: "Nine single cells — 0.09, the smallest of the set: its tenths digit is 0." }), rep: "diagram",
    predict: P("Of the decimals 0.5, 0.09, 0.4 and 0.35, which is the SMALLEST?",
      [{ id: "s09", label: "0.09" }, { id: "s35", label: "0.35" }, { id: "s5", label: "0.5" }], "s09",
      "Tenths digits first: 0.09 has 0 tenths — less than 0.35's three, 0.4's four, and 0.5's five. The longest name can be the smallest amount.") },
  compareCheck("0.09", "0.4"), orderCheck(["0.5", "0.09", "0.4", "0.35"]), orderCheck(["0.7", "0.65", "0.06", "0.6"]), orderCheck(["0.2", "0.85", "0.08", "0.8"]),
  { body: "Shade the largest.", widget: () => gH(85, { traps: [[8, "That shades 0.08 — the smallest of its set. The largest, 0.85, needs eight full columns and five cells."]], success: "Eight full columns and five cells — 0.85, the largest of its set." }) },
  ["Order by tenths digits first.", "Hundredths break the ties.", "Short names can beat long ones."],
  "next: decimals in your pocket.")
def(17, 3,
  "Money runs on hundredths: a dollar splits into 100 cents, so a dime is one tenth and a penny is one hundredth.",
  "3 dimes and 7 pennies is $0.37 — the dimes fill the tenths place and the pennies fill the hundredths place.",
  { body: "Coins on the grid.", widget: () => gH(37, { traps: [[10, "That shades one column — one dime's worth. The pocket holds 3 dimes and 7 pennies: three columns and seven cells."]], success: "Three columns for the dimes, seven cells for the pennies — $0.37 on the grid." }), rep: "diagram",
    predict: P("A pocket holds 3 dimes and 7 pennies. Written in dollars, what is the total?",
      [{ id: "m37", label: "$0.37" }, { id: "m73", label: "$0.73" }, { id: "m10", label: "$0.10" }], "m37",
      "Dimes are tenths of a dollar and pennies are hundredths: 3 dimes and 7 pennies is 0.37 dollars. Swapping the digits would price the coins wrong.") },
  money(3, 7), money(8, 2), money(5, 6), money(9, 4),
  { body: "A new pocketful.", widget: () => gH(52, { traps: [[25, "That shades $0.25 — the digits of the coin counts swapped. Five dimes is five full columns; two pennies is two cells: $0.52."]], success: "Five columns and two cells — 5 dimes and 2 pennies makes $0.52." }) },
  ["A dollar is 100 cents.", "Dimes fill the tenths place, pennies the hundredths.", "$0.37 is 37 hundredths of a dollar."],
  "next: decimals that measure length.")
def(18, 3,
  "Measurement uses hundredths too: one meter is 100 centimeters, so each centimeter is one hundredth of a meter.",
  "A 42-centimeter ribbon is 0.42 meters — the same renaming the grid has shown all along.",
  { body: "Centimeters to meters.", widget: () => gH(42, { traps: [[4, "That shades 4 cells — 0.04 m, just 4 centimeters. The ribbon is 42 centimeters: four full columns and two cells."]], success: "Four columns and two cells — 42 hundredths of a meter: 0.42 m." }), rep: "diagram",
    predict: P("A ribbon measures 42 centimeters. Written in meters, how long is it?",
      [{ id: "m042", label: "0.42 m" }, { id: "m42", label: "42 m" }, { id: "m420", label: "4.2 m" }], "m042",
      "Each centimeter is one hundredth of a meter, so 42 cm is 42 hundredths of a meter: 0.42 m.") },
  measure(42), measure(7), measure(65), measure(89),
  { body: "Measure once more.", widget: () => gH(78, { traps: [[7, "That shades 0.07 m — just 7 centimeters. The length is 78 centimeters: seven full columns and eight cells."]], success: "Seven columns and eight cells — 78 centimeters is 0.78 meters." }) },
  ["One meter is 100 centimeters.", "Each centimeter is a hundredth of a meter.", "42 cm = 0.42 m — the grid's renaming, measured."],
  "next course: adding and subtracting the decimals you can now read.")

// ——— assembly ———
must(L.length === 18, "18 lessons defined");
const chapters = [
  { id: "ch1-tenths-and-hundredths", title: "Tenths and Hundredths", lessonIds: [] },
  { id: "ch2-one-grid-two-names", title: "One Grid, Two Names", lessonIds: [] },
  { id: "ch3-comparing-and-using", title: "Comparing and Using Decimals", lessonIds: [] },
];
const chCount = [0, 0, 0];
const outDir = join(root, "content/courses/decimals-intro-g4");
mkdirSync(join(outDir, "lessons"), { recursive: true });
const lessonIds = [];

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  must(row.n === undefined || row.n === d.n, `spec row order`);
  must(spec.lessons[idx].title !== undefined, "spec row exists");
  const tag = row.conceptTag;
  const seq = chCount[d.ch - 1] + 1; chCount[d.ch - 1]++;
  const id = `dg4-0${d.ch}-0${seq}`;
  lessonIds.push(id);
  chapters[d.ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const check = (sid, pack, kind = "check") => ({
    id: sid, kind, body: pack.body, conceptTag: tag,
    explanationVariants: pack.ev, widget: pack.widget, hints: pack.hints,
    variant: pack.variant, cml: cml(tag, "diagram"),
  });
  const i1w = d.i1.widget();
  const i2w = d.i2.widget();
  const i2Step = d.n >= 14 && [16].includes(d.n)
    ? null // lesson 16's own checks carry the ordering drags; keep its i2 a grid like the rest
    : null;
  void i2Step;
  const lesson = {
    id, slug, title: row.title, courseId: "decimals-intro-g4",
    chapterId: chapters[d.ch - 1].id, minutes: 7,
    steps: [
      { id: "c1", kind: "concept", figure: "dpv-hundredths-grid", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: d.i1.body, conceptTag: tag, widget: i1w, predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      check("k1", d.k1),
      { id: "c2", kind: "concept", figure: "dpv-hundredths-grid", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: d.i2.body, conceptTag: tag, widget: i2w, cml: cml(tag, "diagram") },
      check("k2", d.k2),
      check("k3", d.k3),
      check("ch1", d.ch1, "challenge"),
      { id: "r1", kind: "recap", body: "Well done!", takeaways: d.recap, teaser: d.teaser },
    ],
    remedials: [{
      conceptTag: tag,
      concept: { id: `rem-${tag}-c`, kind: "concept", body: d.c2, narration: d.c2 },
      check: {
        id: `rem-${tag}-k`, kind: "check", body: "", conceptTag: tag,
        explanationVariants: d.k1.ev,
        widget: (() => {
          const w = d.k1.widget;
          if (w.type === "numeric") return { ...w, commonErrors: w.commonErrors.slice(0, 2) };
          if (w.type === "mcq") {
            const correct = w.options.find((o) => o.correct);
            const wrongs = w.options.filter((o) => !o.correct).slice(0, 2);
            const labelNum = (s) => { const m = String(s).match(/^(\d+)\/(\d+)$/); if (m) return Number(m[1]) / Number(m[2]); const x = Number(s); return Number.isFinite(x) ? x : null; };
            const cv = labelNum(correct.label);
            if (cv !== null) {
              return { type: "numeric", prompt: w.prompt + (String(correct.label).includes("/") ? " Answer with the decimal value." : ""),
                answer: cv, tolerance: 0, unit: "",
                commonErrors: wrongs.map((o) => ({ value: labelNum(o.label), feedback: o.feedback })).filter((e) => e.value !== null && e.value !== cv),
                fallbackFeedback: d.k1.ev[0] };
            }
            return w;
          }
          if (w.type === "rationalCompare") return w;
          return w;
        })(),
      },
    }],
  };
  // structural asserts (over every step, mirror-checking each widget type end to end)
  for (const s of lesson.steps) {
    const w = s.widget;
    if (!w) continue;
    if (w.type === "hundredthsGrid") {
      const total = w.mode === "tenths" ? 10 : 100;
      must(w.target >= 0 && w.target <= total && w.prefilled <= w.target, `${id}/${s.id} grid bounds`);
      for (const t of w.commonCounts) must(t.count !== w.target && t.count >= 0 && t.count <= total, `${id}/${s.id} grid trap`);
    }
    if (w.type === "numeric") {
      for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} numeric trap`);
    }
    if (w.type === "mcq") must(w.options.filter((o) => o.correct).length === 1 && w.options.length === 4, `${id}/${s.id} mcq`);
    if (w.type === "rationalCompare") {
      const val = (o) => Number(o.value);
      const rel = val(w.left) < val(w.right) ? "lt" : val(w.left) > val(w.right) ? "gt" : "eq";
      must(w.answer === rel, `${id}/${s.id} compare answer`);
      must(w[`${rel}Feedback`] === undefined, `${id}/${s.id} compare answer slot must be absent`);
    }
    if (w.type === "dragOrder") {
      const labels = w.correctOrder.map((oid) => Number(w.items.find((it) => it.id === oid).label));
      must(labels.every((v, i) => i === 0 || v > labels[i - 1]), `${id}/${s.id} order`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
  }
  const remW = lesson.remedials[0].check.widget;
  must(remW.type === "numeric" || remW.type === "mcq" || remW.type === "rationalCompare", `${id} remedial widget type ${remW.type}`);
  if (remW.type === "numeric") must(Number.isFinite(remW.answer) && remW.answer >= 0 && remW.answer <= 100, `${id} remedial answer`);
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c) => c === 6), "3 chapters x 6 lessons");
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "decimals-intro-g4", slug: "decimals-intro-g4", title: spec.title,
  tagline: "Split one whole into tenths and hundredths, read the grid, and put decimals to work.",
  category: "Math", gradeLevel: 4, chapters,
}, null, 2) + "\n");
console.log(`built 18 lessons + course.json; ${asserts} internal assertions all passed`);
console.log("ids:", lessonIds.join(" "));
