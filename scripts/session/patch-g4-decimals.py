#!/usr/bin/env python3
"""S184: insert the g4-decimals generator family into g4Variants.ts.
Newline-anchored keys; abort before any write on failed count assertions."""
from pathlib import Path
import sys

p = Path("src/lib/g4Variants.ts")
s = p.read_text()

BLOCK = r'''
/* ---------------------------------------------------------------- decimals */
// Grade 4 decimals (4.NF.C.5/6/7, 4.MD.A.2): tenths and hundredths notation, the
// tenths<->hundredths link, reading/naming, fraction<->decimal, comparison (the
// "longer decimal is bigger" trap), the trailing zero, ordering, money, and metric
// measure. Answers over numeric/mcq/dragOrder/rationalCompare only — the
// hundredthsGrid engine itself carries the ungraded interactive steps, not variants.

const DECIMAL_FORMS = [
  "dTenthsWriteNumeric", "dTenthsFractionMcq", "dHundredthsWriteNumeric", "dHundredthsCellsNumeric",
  "dTenthToHundredthNumeric", "dAddTenthHundredthNumeric", "dReadDecimalMcq", "dPlaceNameMcq",
  "dFractionToDecimalNumeric", "dDecimalToFractionMcq", "dCompareRational", "dTrailingZeroRational",
  "dOrderDrag", "dMoneyNumeric", "dMeasureNumeric",
] as const;

const dec1 = (k: number): string => (k / 10).toFixed(1);
const dec2 = (n: number): string => (n / 100).toFixed(2);

/** rationalCompare over two decimal-string operands with decimal-place diagnoses.
 * Emits ONLY the two non-answer feedback slots (the gate rejects a slot for the answer). */
const decCompare = (prompt: string, leftStr: string, rightStr: string): Variant => {
  const L = Number(leftStr), R = Number(rightStr);
  const answer: "lt" | "eq" | "gt" = L < R ? "lt" : L > R ? "gt" : "eq";
  return {
    tag: "g4-decimals",
    answer,
    widget: {
      type: "rationalCompare",
      prompt,
      left: { value: leftStr },
      right: { value: rightStr },
      answer,
      ...(answer !== "lt" ? { ltFeedback: `Line up the places before deciding: compare the tenths digits first (${leftStr} against ${rightStr}), and only look at hundredths when the tenths tie. Counting digits instead of comparing places points the wrong way here.` } : {}),
      ...(answer !== "eq" ? { eqFeedback: `These two decimals name different amounts. Compare place by place: the tenths digits ${answer === "gt" ? "already differ or the hundredths break the tie" : "or the hundredths digits differ"}, so the two values cannot be equal.` } : {}),
      ...(answer !== "gt" ? { gtFeedback: `Line up the places before deciding: compare the tenths digits first (${leftStr} against ${rightStr}), and only look at hundredths when the tenths tie. A longer decimal is often the smaller one.` } : {}),
      successFeedback: `Correct — comparing digit by digit from the tenths place settles it: ${leftStr} ${answer === "lt" ? "<" : answer === "gt" ? ">" : "="} ${rightStr}.`,
    },
  };
};

const decDragOrder = (rand: Rand, prompt: string, valueStrs: string[]): Variant => {
  const ordered = [...valueStrs].sort((a, b) => Number(a) - Number(b));
  const items = ordered.map((label, i) => ({ id: `d${i}`, label }));
  let shown = shuffled(rand, items);
  if (shown.every((x, i) => x.id === items[i].id)) shown = [...shown].reverse();
  return {
    tag: "g4-decimals",
    answer: items.map((x) => x.id),
    widget: {
      type: "dragOrder",
      prompt,
      items: shown,
      correctOrder: items.map((x) => x.id),
      misorderFeedback: [{
        first: items[items.length - 1].id,
        second: items[0].id,
        feedback: `${items[items.length - 1].label} placed before ${items[0].label} starts with the greatest value. Compare tenths digits first — the count of digits after the point says nothing about size.`,
      }],
      missFeedback: `Compare the tenths digits first and only use the hundredths digits to break ties — then place the values from smallest to greatest.`,
      successFeedback: `Correct — ${ordered.join(", ")} runs from smallest to greatest when the decimals are compared place by place.`,
    },
  };
};

const decimalHandlers: Record<string, FormHandler> = {
  dTenthsWriteNumeric: (rand) => {
    const k = pick(rand, 1, 9);
    return num("g4-decimals", `A unit square is split into 10 equal columns, and ${k} of them are shaded. Write the shaded amount as a decimal.`, k / 10,
      [[k, `That is the count of shaded columns, and a count of parts is a whole number. Each column is one tenth of the square, so ${k} columns is ${k} tenths, written with the ${k} in the tenths place.`],
       [k / 100, `That puts the ${k} in the hundredths place, which would mean ${k} cells of a hundred-cell grid. This square has only 10 columns, so each shaded column is a tenth of the whole.`]],
      `Each column is one tenth of the square. Count the shaded columns and write that count in the tenths place, directly after the decimal point.`);
  },
  dTenthsFractionMcq: (rand) => {
    const k = pick(rand, 1, 9);
    return mcq(rand, "g4-decimals", `Which fraction names the same amount as ${dec1(k)}?`,
      [`${k}/10`, `Correct — the digit ${k} sits in the tenths place, so ${dec1(k)} means ${k} of 10 equal parts.`],
      [[`${k}/100`, `A denominator of 100 would mean ${k} hundredths, written ${dec2(k)}. The digit ${k} in ${dec1(k)} sits one place higher — in the tenths place.`],
       [`10/${k}`, `That fraction has the part count and the number of equal pieces swapped. The decimal names ${k} pieces out of 10 equal pieces, so ${k} belongs on top.`],
       [`${k}/1`, `A denominator of 1 would make this ${k} whole units. The decimal point in ${dec1(k)} says the amount is less than one whole, cut into 10 equal parts.`]]);
  },
  dHundredthsWriteNumeric: (rand, band) => {
    const n = band === "support" ? pick(rand, 2, 9) : pick(rand, 11, 99);
    const traps: Array<[number, string]> = [
      [n, `That is the count of shaded cells, and a count of parts is a whole number. Each cell is one hundredth of the square, so the count belongs after the decimal point, ending in the hundredths place.`],
      [n / 10, `That reads the count as tenths, but each cell is one hundredth of the square — a tenth is a whole column of 10 cells. Write the count so it ends in the hundredths place.`],
    ];
    return num("g4-decimals", `A unit square is split into 100 equal cells, and ${n} of them are shaded. Write the shaded amount as a decimal.`, n / 100, traps,
      `Each cell is one hundredth. Write the count of shaded cells so its last digit lands in the hundredths place — two places after the decimal point.`);
  },
  dHundredthsCellsNumeric: (rand, band) => {
    const n = band === "support" ? pick(rand, 11, 40) : pick(rand, 11, 99);
    const tens = Math.floor(n / 10), swap = (n % 10) * 10 + tens;
    const traps: Array<[number, string]> = [[tens, `That shades only the tenths digit's worth of single cells. In ${dec2(n)} the ${tens} sits in the tenths place, so it is worth ${tens} full columns — ${tens * 10} cells — before the hundredths digit adds any more.`]];
    if (swap !== n) traps.push([swap, `That count swaps the two digits of ${dec2(n)}. Read the decimal place by place: the first digit after the point counts full columns of ten, and the second counts single cells.`]);
    return num("g4-decimals", `A hundredths grid has 100 equal cells. How many cells must be shaded to show ${dec2(n)}?`, n, traps,
      `Each full column of the grid is one tenth — ten cells — and each single cell is one hundredth. Turn each digit of the decimal into cells and add the two counts.`);
  },
  dTenthToHundredthNumeric: (rand) => {
    const k = pick(rand, 1, 9);
    return num("g4-decimals", `${dec1(k)} = ?/100. What numerator makes the fraction name the same amount?`, k * 10,
      [[k, `That copies the tenths count without rescaling it. Each tenth is 10 hundredths, so ${k} tenths covers ${k} × 10 hundredths of the same whole.`],
       [k * 100, `That multiplies by 100 as if ${dec1(k)} were ${k} whole units. It is ${k} tenths, and each tenth contains 10 hundredths, so multiply the count by 10.`]],
      `Every tenth is worth 10 hundredths — one full column of a hundredths grid. Multiply the tenths count by 10 to rename the amount in hundredths.`);
  },
  dAddTenthHundredthNumeric: (rand) => {
    const a = pick(rand, 1, 8), b = pick(rand, 1, 9);
    const ans = (a * 10 + b) / 100;
    const traps: Array<[number, string]> = [];
    if ((a + b) / 10 !== ans) traps.push([(a + b) / 10, `That adds the digits ${a} and ${b} as if both were tenths, but the ${b} in ${dec2(b)} sits in the hundredths place. Rename ${dec1(a)} as ${a * 10} hundredths first, then add.`]);
    if ((a + b) / 100 !== ans) traps.push([(a + b) / 100, `That adds the digits ${a} and ${b} as if both were hundredths, but the ${a} in ${dec1(a)} sits in the tenths place and is worth ${a * 10} hundredths. Rename before adding.`]);
    return num("g4-decimals", `Add ${dec1(a)} + ${dec2(b)}. Write the sum as a decimal.`, ans, traps,
      `Rename the tenths as hundredths first: ${dec1(a)} is ${a * 10} hundredths. Then add the hundredths counts and write the total back as a decimal.`);
  },
  dReadDecimalMcq: (rand) => {
    if (rand() < 0.5) {
      const b = pick(rand, 1, 9);
      return mcq(rand, "g4-decimals", `How is the decimal ${dec2(b)} read as a number name?`,
        [`${b} hundredths`, `Correct — the ${b} sits two places after the point, in the hundredths place, so ${dec2(b)} names ${b} hundredths.`],
        [[`${b} tenths`, `${b} tenths would be written ${dec1(b)}, with the ${b} directly after the point. In ${dec2(b)} a zero holds the tenths place, pushing the ${b} into the hundredths place.`],
         [`${b} ones`, `${b} ones would be the whole number ${b}, with no decimal point needed. The digits after the point name parts of one whole, not whole units.`],
         [`${b * 10} hundredths`, `${b * 10} hundredths is ${dec2(b * 10)} — a full ${b}-column amount. The zero in the tenths place of ${dec2(b)} means there are no full columns, only ${b} single hundredths.`]]);
    }
    const n = pick(rand, 11, 99), tens = Math.floor(n / 10);
    return mcq(rand, "g4-decimals", `How is the decimal ${dec2(n)} read as a number name?`,
      [`${n} hundredths`, `Correct — the last digit of ${dec2(n)} lands in the hundredths place, so the whole two-digit count ${n} names hundredths.`],
      [[`${n} tenths`, `${n} tenths would be ${(n / 10).toFixed(1)} — more than one whole. The two digits of ${dec2(n)} end in the hundredths place, so the count names hundredths.`],
       [`${tens} hundredths`, `That reads only the first digit after the point. The name uses the full count: both decimal digits of ${dec2(n)} together name ${n} hundredths.`],
       [`${n} ones`, `${n} ones would be the whole number ${n}. Digits after the decimal point count parts of a single whole, not whole units.`]]);
  },
  dPlaceNameMcq: (rand) => {
    const a = pick(rand, 1, 9);
    let b = pick(rand, 1, 9);
    if (b === a) b = (b % 9) + 1;
    const n = a * 10 + b, asked = rand() < 0.5 ? a : b;
    const place = asked === a ? "tenths" : "hundredths", other = asked === a ? "hundredths" : "tenths";
    return mcq(rand, "g4-decimals", `In the decimal ${dec2(n)}, which place does the digit ${asked} occupy?`,
      [place, `Correct — reading left from the decimal point, ${dec2(n)} has ${a} in the tenths place and ${b} in the hundredths place, so the ${asked} is in the ${place} place.`],
      [[other, `The ${other} place of ${dec2(n)} holds the digit ${asked === a ? b : a}. Read outward from the decimal point: tenths first, then hundredths.`],
       ["ones", `The ones place sits to the LEFT of the decimal point, and in ${dec2(n)} it holds 0. The digit ${asked} sits after the point, among the decimal places.`],
       ["tens", `The tens place is two positions left of the decimal point — this number has no digit there at all. The digit ${asked} sits after the point, among the decimal places.`]]);
  },
  dFractionToDecimalNumeric: (rand, band) => {
    if (rand() < 0.4) {
      const k = pick(rand, 1, 9);
      return num("g4-decimals", `Write the fraction ${k}/10 as a decimal.`, k / 10,
        [[k, `That drops the denominator. The fraction names ${k} parts out of 10, so its decimal puts the ${k} in the tenths place — a value less than one whole.`],
         [k / 100, `That writes ${k} in the hundredths place, which names ${k}/100. Tenths sit one place higher: directly after the decimal point.`]],
        `A denominator of 10 means tenths. Write the numerator in the tenths place, directly after the decimal point.`);
    }
    const n = band === "support" ? pick(rand, 2, 9) : pick(rand, 11, 99);
    return num("g4-decimals", `Write the fraction ${n}/100 as a decimal.`, n / 100,
      [[n, `That drops the denominator. The fraction names ${n} parts out of 100, so its decimal must end in the hundredths place — a value less than one whole.`],
       [n / 10, `That treats the count as tenths, naming ${n}/10 instead. A denominator of 100 means the count must end two places after the decimal point.`]],
      `A denominator of 100 means hundredths. Write the numerator so its last digit lands two places after the decimal point.`);
  },
  dDecimalToFractionMcq: (rand) => {
    const n = pick(rand, 11, 99), tens = Math.floor(n / 10), swap = (n % 10) * 10 + tens;
    const wrong: Array<[string, string]> = [
      [`${n}/10`, `A denominator of 10 makes this ${n} tenths — more than one whole. The two digits of ${dec2(n)} end in the hundredths place, so the whole names hundredths.`],
      [`${tens}/10`, `That keeps only the tenths digit and drops the hundredths digit entirely. Both decimal digits of ${dec2(n)} count toward the amount: ${n} hundredths in all.`],
    ];
    if (swap !== n) wrong.push([`${swap}/100`, `That fraction swaps the two digits of ${dec2(n)}. Read the decimal place by place — the digit order carries the value.`]);
    return mcq(rand, "g4-decimals", `Which fraction names the same amount as ${dec2(n)}?`,
      [`${n}/100`, `Correct — the digits of ${dec2(n)} end in the hundredths place, so the amount is ${n} out of 100 equal parts.`], wrong);
  },
  dCompareRational: (rand) => {
    const style = pick(rand, 0, 2);
    if (style === 0) {
      // The signature trap pair: fewer digits, greater value (0.5 vs 0.35).
      const t = pick(rand, 2, 9), hTens = pick(rand, 1, t - 1), hOnes = pick(rand, 1, 9);
      const short = dec1(t), long = dec2(hTens * 10 + hOnes);
      return rand() < 0.5
        ? decCompare(`Compare the two decimals: ${short} ? ${long}. Choose the relation that holds.`, short, long)
        : decCompare(`Compare the two decimals: ${long} ? ${short}. Choose the relation that holds.`, long, short);
    }
    if (style === 1) {
      // Same tenths digit; the hundredths digit decides.
      const t = pick(rand, 1, 9);
      let h1 = pick(rand, 1, 9), h2 = pick(rand, 1, 9);
      if (h1 === h2) h2 = (h2 % 9) + 1;
      return decCompare(`Compare the two decimals: ${dec2(t * 10 + h1)} ? ${dec2(t * 10 + h2)}. Choose the relation that holds.`, dec2(t * 10 + h1), dec2(t * 10 + h2));
    }
    let a = pick(rand, 11, 99), b = pick(rand, 11, 99);
    if (a === b) b = a === 99 ? 11 : a + 1;
    return decCompare(`Compare the two decimals: ${dec2(a)} ? ${dec2(b)}. Choose the relation that holds.`, dec2(a), dec2(b));
  },
  dTrailingZeroRational: (rand) => {
    const k = pick(rand, 1, 9);
    const withZero = `0.${k}0`, bare = dec1(k);
    return rand() < 0.5
      ? decCompare(`Compare the two decimals: ${withZero} ? ${bare}. Choose the relation that holds.`, withZero, bare)
      : decCompare(`Compare the two decimals: ${bare} ? ${withZero}. Choose the relation that holds.`, bare, withZero);
  },
  dOrderDrag: (rand, band) => {
    // Always includes the digit-count trap: a one-digit decimal that beats a two-digit one.
    const t = pick(rand, 3, 9);
    const vals = new Set<string>([dec1(t), dec2(pick(rand, 10, t * 10 - 1))]);
    while (vals.size < (band === "stretch" ? 4 : 3)) vals.add(rand() < 0.4 ? dec1(pick(rand, 1, 9)) : dec2(pick(rand, 2, 99)));
    const arr = [...vals];
    if (new Set(arr.map(Number)).size !== arr.length) return decimalHandlers.dOrderDrag(rand, band);
    return decDragOrder(rand, `Drag the decimals into order from smallest to greatest.`, arr);
  },
  dMoneyNumeric: (rand) => {
    const d = pick(rand, 1, 9), c = pick(rand, 1, 9);
    const ans = (d * 10 + c) / 100;
    const traps: Array<[number, string]> = [[d * 10 + c, `That is the total in cents, and the prompt asks for dollars. One cent is one hundredth of a dollar, so place the cents count after the decimal point.`]];
    const swap = (c * 10 + d) / 100;
    if (swap !== ans) traps.push([swap, `That puts the pennies count in the dimes place and the dimes count in the pennies place. A dime is a tenth of a dollar and a penny is a hundredth — the order of the digits carries the value.`]);
    return num("g4-decimals", `A pocket holds ${d} dimes and ${c} pennies. Write the total amount in dollars as a decimal.`, ans, traps,
      `A dime is one tenth of a dollar and a penny is one hundredth. Write the dimes count in the tenths place and the pennies count in the hundredths place.`);
  },
  dMeasureNumeric: (rand, band) => {
    const n = band === "support" ? pick(rand, 2, 9) : pick(rand, 11, 99);
    return num("g4-decimals", `A ribbon measures ${n} centimeters. One meter is 100 centimeters. Write the ribbon's length in meters as a decimal.`, n / 100,
      [[n, `That keeps the number in centimeters. Each centimeter is one hundredth of a meter, so the count must move behind the decimal point to name meters.`],
       [n / 10, `That treats each centimeter as a tenth of a meter, but a meter holds 100 centimeters — each one is a hundredth. The count must end two places after the decimal point.`]],
      `Each centimeter is one hundredth of a meter. Write the centimeter count so its last digit lands in the hundredths place.`);
  },
};
'''

# 1) Insert the block before `function family(`
anchor1 = "\nfunction family(tag: string, label: string, forms: readonly string[], handlers: Record<string, FormHandler>): VariantGen {"
assert s.count(anchor1) == 1, "family anchor"
s = s.replace(anchor1, "\n" + BLOCK.strip("\n") + "\n" + anchor1)

# 2) Register in G4_GENERATORS
anchor2 = '  family("g4-fractions", "Grade 4 fraction equivalence, comparison, addition, mixed numbers, and scaling", FRACTION_FORMS, fractionHandlers),\n'
assert s.count(anchor2) == 1, "generators anchor"
s = s.replace(anchor2, anchor2 + '  family("g4-decimals", "Grade 4 decimal tenths and hundredths: notation, renaming, comparison, ordering, money, and measure", DECIMAL_FORMS, decimalHandlers),\n')

# 3) Surfaces map
anchor3 = '  ...Object.fromEntries(FRACTION_FORMS.map((f) => [f, f.endsWith("Mcq") ? "mcq" : f.endsWith("Rational") ? "rationalCompare" : f.endsWith("Mixed") ? "mixedRegroup" : "numeric"])),\n'
assert s.count(anchor3) == 1, "surfaces anchor"
s = s.replace(anchor3, anchor3 + '  ...Object.fromEntries(DECIMAL_FORMS.map((f) => [f, f.endsWith("Mcq") ? "mcq" : f.endsWith("Rational") ? "rationalCompare" : f.endsWith("Drag") ? "dragOrder" : "numeric"])),\n')

p.write_text(s)
print("g4-decimals family inserted: 15 forms, generator registered, surfaces mapped")
