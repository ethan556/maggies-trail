type Band = "support" | "core" | "stretch";
type Variant = { tag: string; widget: any; answer: any };
type VariantGen = {
  tag: string;
  label: string;
  forms?: readonly never[];
  gen: (rand: () => number, band?: Band, form?: string) => Variant;
};

type Rand = () => number;
type FormHandler = (rand: Rand, band: Band) => Variant;

const pick = (rand: Rand, lo: number, hi: number): number => lo + Math.floor(rand() * (hi - lo + 1));
const choose = <T>(rand: Rand, xs: readonly T[]): T => xs[pick(rand, 0, xs.length - 1)];
/** Fraction parts NAMED, not spelled with a digit — "4ths" is not English. */
const DENOM_NAME: Record<number, string> = { 2: "halves", 3: "thirds", 4: "fourths", 5: "fifths", 6: "sixths", 7: "sevenths", 8: "eighths", 9: "ninths", 10: "tenths", 11: "elevenths", 12: "twelfths" };
const denomName = (d: number): string => DENOM_NAME[d] ?? `parts of ${d}`;
const countN = (n: number, word: string): string => `${n} ${n === 1 ? word : `${word}s`}`;
const range = (band: Band, support: [number, number], core: [number, number], stretch: [number, number]) =>
  band === "support" ? support : band === "stretch" ? stretch : core;
const bandInt = (rand: Rand, band: Band, support: [number, number], core: [number, number], stretch: [number, number]) => {
  const [a, b] = range(band, support, core, stretch);
  return pick(rand, a, b);
};
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const factors = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const isPrime = (n: number): boolean => n >= 2 && factors(n).length === 2;
const fmt = (n: number): string => n.toLocaleString("en-US");

function shuffled<T>(rand: Rand, xs: readonly T[]): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = pick(rand, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function mixedRegroupReachable(spec: {
  mode: "convert" | "add" | "subtract";
  den: number;
  aWhole: number;
  aNum: number;
  bWhole?: number;
  bNum?: number;
  targetForm?: "mixed" | "improper";
}): Set<string> {
  const key = (whole: number, num: number) => `${whole}|${num}`;
  const out = new Set<string>();
  const p = spec.aWhole * spec.den + spec.aNum;
  if (spec.mode === "convert") {
    for (let k = 0; k * spec.den <= p; k++) out.add(key(k, p - k * spec.den));
    return out;
  }
  const bWhole = spec.bWhole ?? 0;
  const bNum = spec.bNum ?? 0;
  if (spec.mode === "subtract") {
    for (let breaks = 0; breaks <= spec.aWhole; breaks++) {
      const topNum = spec.aNum + breaks * spec.den;
      const wholes = spec.aWhole - breaks - bWhole;
      if (wholes < 0) break;
      out.add(key(wholes, topNum >= bNum ? topNum - bNum : bNum - topNum));
    }
    return out;
  }
  const sum = spec.aNum + bNum;
  for (let made = 0; made * spec.den <= sum; made++)
    out.add(key(spec.aWhole + bWhole + made, sum - made * spec.den));
  return out;
}

function columnCalcReachable(op: "add" | "subtract" | "multiply", a: number, b: number): Set<number> {
  const out = new Set<number>();
  const digits = (n: number): number[] => String(n).split("").map(Number).reverse();
  const join = (acc: number[]): number => Number([...acc].reverse().join(""));
  if (op === "add" || op === "multiply") {
    const aa = digits(a);
    const bb = op === "add" ? digits(b) : [];
    const n = op === "add" ? Math.max(aa.length, bb.length) : aa.length;
    const rec = (i: number, carryIn: number, acc: number[]): void => {
      if (i === n) {
        if (carryIn > 0) {
          out.add(join([...acc, ...digits(carryIn)]));
          out.add(join(acc));
        } else out.add(join(acc));
        return;
      }
      const base = op === "add" ? (aa[i] ?? 0) + (bb[i] ?? 0) : (aa[i] ?? 0) * b;
      const withCarry = base + carryIn;
      rec(i + 1, Math.floor(withCarry / 10), [...acc, withCarry % 10]);
      if (carryIn > 0) rec(i + 1, Math.floor(base / 10), [...acc, base % 10]);
    };
    rec(0, 0, []);
  } else {
    const aa = digits(a);
    const bb = digits(b);
    const rec = (i: number, top: number[], acc: number[]): void => {
      if (i === aa.length) { out.add(join(acc)); return; }
      const t = top[i] ?? 0;
      const bottom = bb[i] ?? 0;
      if (t >= bottom) { rec(i + 1, top, [...acc, t - bottom]); return; }
      rec(i + 1, top, [...acc, bottom - t]);
      let j = i + 1;
      while (j < aa.length && top[j] === 0) j++;
      if (j < aa.length) {
        const next = [...top];
        next[j] = (next[j] ?? 0) - 1;
        for (let k = j - 1; k > i; k--) next[k] = 9;
        next[i] = t + 10;
        rec(i + 1, next, [...acc, next[i] - bottom]);
      }
    };
    rec(0, aa, []);
  }
  return out;
}

function safeTraps(answer: number, candidates: Array<[number, string]>): Array<[number, string]> {
  const out: Array<[number, string]> = [];
  const seen = new Set<string>([Number(answer).toPrecision(14)]);
  for (const [value, feedback] of candidates) {
    if (!Number.isFinite(value)) continue;
    const key = Number(value).toPrecision(14);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([value, feedback]);
  }
  let jump = 1;
  while (out.length < 2) {
    const value = answer + jump;
    const key = Number(value).toPrecision(14);
    if (!seen.has(key)) {
      seen.add(key);
      out.push([value, `That result is ${jump} away from the correct value. Recompute the stated operation from the learner-visible numbers.`]);
    }
    jump += 1;
  }
  return out.slice(0, 3);
}

const num = (
  tag: string,
  prompt: string,
  answer: number,
  errors: Array<[number, string]>,
  fallback: string,
  tolerance = 0,
  successFeedback?: string,
): Variant => ({
  tag,
  answer,
  widget: {
    type: "numeric",
    prompt,
    answer,
    tolerance,
    unit: "",
    commonErrors: safeTraps(answer, errors).map(([value, feedback]) => ({ value, feedback })),
    fallbackFeedback: fallback,
    ...(successFeedback ? { successFeedback } : {}),
  },
});

const mcq = (
  rand: Rand,
  tag: string,
  prompt: string,
  correct: [string, string],
  wrong: Array<[string, string]>,
): Variant => {
  const seenLabels = new Set<string>([correct[0]]);
  const uniqueWrong = wrong.filter(([label]) => !seenLabels.has(label) && seenLabels.add(label));
  if (uniqueWrong.length < 2) {
    for (const fallback of [
      ["There is not enough information", `The learner-visible quantities and relationships are sufficient to determine the requested result.`],
      ["A different result", `This choice does not follow the operation, definition, or place-value relationship stated in the prompt.`],
    ] as Array<[string, string]>) {
      if (!seenLabels.has(fallback[0])) { seenLabels.add(fallback[0]); uniqueWrong.push(fallback); }
      if (uniqueWrong.length >= 2) break;
    }
  }
  const options = [
    { label: correct[0], feedback: correct[1], correct: true },
    ...uniqueWrong.map(([label, feedback]) => ({ label, feedback, correct: false })),
  ];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  const withIds = options.map((o, i) => ({ id: `o${i}`, ...o }));
  return {
    tag,
    answer: withIds.find((o) => o.correct)!.id,
    widget: { type: "mcq", prompt, options: withIds },
  };
};

const rationalCompare = (
  tag: string,
  prompt: string,
  left: { num: number; den: number },
  right: { num: number; den: number },
): Variant => {
  const d = left.num * right.den - right.num * left.den;
  const answer: "lt" | "eq" | "gt" = d < 0 ? "lt" : d > 0 ? "gt" : "eq";
  return {
    tag,
    answer,
    widget: {
      type: "rationalCompare",
      prompt,
      left,
      right,
      answer,
      ...(answer !== "lt" ? { ltFeedback: `Cross-products show the left fraction is not smaller. Compare ${left.num}×${right.den} with ${right.num}×${left.den}.` } : {}),
      ...(answer !== "eq" ? { eqFeedback: `The cross-products are different, so these fractions do not name the same amount.` } : {}),
      ...(answer !== "gt" ? { gtFeedback: `Cross-products show the left fraction is not larger. Compare the two products before choosing the relation.` } : {}),
      successFeedback: `Correct — cross-multiplication compares the two fractions without changing their values.`,
    },
  };
};

function mixed(
  tag: string,
  prompt: string,
  spec: {
    mode: "convert" | "add" | "subtract";
    den: number;
    aWhole: number;
    aNum: number;
    bWhole?: number;
    bNum?: number;
    targetForm?: "mixed" | "improper";
  },
): Variant {
  const P = spec.aWhole * spec.den + spec.aNum;
  const Q = (spec.bWhole ?? 0) * spec.den + (spec.bNum ?? 0);
  const T = spec.mode === "convert" ? P : spec.mode === "add" ? P + Q : P - Q;
  const truth = spec.mode === "convert" && spec.targetForm === "improper"
    ? { whole: 0, num: T }
    : { whole: Math.floor(T / spec.den), num: T % spec.den };
  const reachable = [...mixedRegroupReachable(spec)].map((k) => {
    const [whole, num] = k.split("|").map(Number);
    return { whole, num };
  }).filter((x) => x.whole !== truth.whole || x.num !== truth.num);
  const commonResults = reachable.slice(0, 3).map((x, i) => ({
    ...x,
    feedback: i === 0
      ? `This state leaves an exchange unfinished. Use 1 whole = ${spec.den}/${spec.den} and continue until the requested form is complete.`
      : `This landing comes from resolving a column before its exchanged whole or parts were committed. Rebuild the exchange carefully.`,
  }));
  return {
    tag,
    answer: { ...truth, complete: true },
    widget: {
      type: "mixedRegroup",
      prompt,
      ...spec,
      commonResults,
      fallbackFeedback: `Track the whole register and the ${denomName(spec.den)} register separately, exchanging exactly ${spec.den} parts for one whole when needed.`,
      successFeedback: `Correct — every exchange preserved the value and left the answer in the requested form.`,
    },
  };
}

function column(
  tag: string,
  prompt: string,
  op: "add" | "subtract" | "multiply",
  a: number,
  b: number,
): Variant {
  const answer = op === "add" ? a + b : op === "subtract" ? a - b : a * b;
  const wrongs = [...columnCalcReachable(op, a, b)].filter((v) => v !== answer).slice(0, 3);
  return {
    tag,
    answer,
    widget: {
      type: "columnCalc",
      prompt,
      op,
      a,
      b,
      commonResults: wrongs.map((value, i) => ({
        value,
        feedback: i === 0
          ? `That result is reachable when a carry or borrow is left uncommitted. Revisit the first column where a trade appears.`
          : `That landing reflects a skipped place-value trade. Work right to left and commit every carry or borrow before resolving the next column.`,
      })),
      fallbackFeedback: `Work one place-value column at a time from the right, and enact every required trade before moving left.`,
      successFeedback: `Correct — every place-value trade was carried through the full standard algorithm.`,
    },
  };
}

const FRACTION_FORMS = [
  "faEquivalenceRecapMcq", "faEquivalenceRecapNumeric", "faEquivalenceRuleNumeric", "faSimplifyNumeric",
  "faBenchmarkCompareMcq", "faBenchmarkOrderMcq", "faBenchmarkOrderNumeric", "faBenchmarkOrderRational",
  "faLikeDenomWordMcq", "faLikeDenomWordNumeric", "faImproperToMixedNumeric", "faMixedToImproperNumeric",
  "faMixedAddSubMixed", "faMixedAddSubNumeric", "faWholeTimesFractionMcq", "faWholeTimesFractionMixed",
  "faWholeTimesFractionNumeric", "faWholeTimesFractionWordNumeric",
] as const;

const fractionHandlers: Record<string, FormHandler> = {
  faEquivalenceRecapMcq: (rand, band) => {
    const d = bandInt(rand, band, [3, 7], [4, 10], [6, 12]);
    const n = pick(rand, 1, d - 1), k = pick(rand, 2, band === "stretch" ? 6 : 4);
    return mcq(rand, "g4-fractions", `Why are ${n}/${d} and ${n * k}/${d * k} equivalent?`,
      [`Both numerator and denominator were multiplied by ${k}.`, `Correct — multiplying both parts by the same nonzero number keeps the fraction's value unchanged.`],
      [[`Only the numerator was multiplied by ${k}.`, `Changing only the numerator changes the size of the fraction rather than renaming the same amount.`],
       [`${k} was added to both numbers.`, `Equivalent-fraction scaling uses multiplication, not equal additions to the numerator and denominator.`],
       [`Only the denominator was multiplied by ${k}.`, `Changing only the denominator changes the size of each part, so the value would not stay equal.`]]);
  },
  faEquivalenceRecapNumeric: (rand, band) => {
    const d = bandInt(rand, band, [3, 8], [5, 10], [7, 12]);
    const n = pick(rand, 1, d - 1), k = pick(rand, 2, band === "stretch" ? 7 : 5), ans = n * k;
    return num("g4-fractions", `${n}/${d} = ?/${d * k}. What numerator makes the fractions equivalent?`, ans,
      [[n + k, `Adding ${k} changes the fraction instead of scaling it. Multiply ${n} by the denominator's factor ${k}.`],
       [d * k, `That copies the new denominator. The numerator must be scaled from ${n} by the same factor ${k}.`]],
      `Divide the new denominator by ${d} to find the scale factor, then multiply ${n} by it.`);
  },
  faEquivalenceRuleNumeric: (rand, band) => {
    const d = bandInt(rand, band, [3, 7], [5, 10], [7, 12]);
    const n = pick(rand, 1, d - 1), k = pick(rand, 2, band === "stretch" ? 6 : 4);
    if (rand() < 0.5) {
      return num("g4-fractions", `Scale ${n}/${d} by ×${k}/×${k}. What is the new numerator?`, n * k,
        [[n + k, `The rule multiplies both numbers by ${k}; adding ${k} does not preserve the fraction's value.`],
         [d * k, `That is the scaled denominator. Apply the same factor to the original numerator ${n}.`]],
        `Multiply the numerator ${n} by the stated scale factor ${k}.`);
    }
    return num("g4-fractions", `${n * k}/${d * k} was made by scaling a fraction by ${k}. What was the original numerator?`, n,
      [[n * k, `That is the already-scaled numerator. Undo the scaling by dividing by ${k}.`],
       [d, `That is the original denominator, not the numerator recovered from ${n * k} ÷ ${k}.`]],
      `Reverse the scaling by dividing the shown numerator by ${k}.`);
  },
  faSimplifyNumeric: (rand, band) => {
    const den = bandInt(rand, band, [3, 7], [5, 10], [7, 12]);
    const top = pick(rand, 1, den - 1), k = pick(rand, 2, band === "stretch" ? 8 : 5);
    const g = gcd(top, den), a = top / g, b = den / g;
    const A = a * k, B = b * k;
    return num("g4-fractions", `Simplify ${A}/${B} to lowest terms. What is the simplified numerator?`, a,
      [[A, `That is the original numerator before simplifying. Divide both numbers by their greatest common factor ${k}.`],
       [b, `That is the simplified denominator. The simplified numerator is ${A} ÷ ${k}.`]],
      `Find the greatest common factor of ${A} and ${B}, then divide the numerator by it.`);
  },
  faBenchmarkCompareMcq: (rand, band) => {
    const d1 = bandInt(rand, band, [4, 8], [5, 10], [7, 12]);
    const d2 = bandInt(rand, band, [4, 8], [6, 11], [8, 13]);
    const below = { num: Math.max(1, Math.floor(d1 / 2) - 1), den: d1 };
    const above = { num: Math.min(d2 - 1, Math.floor(d2 / 2) + 1), den: d2 };
    return mcq(rand, "g4-fractions", `Which fraction is greater: ${below.num}/${below.den} or ${above.num}/${above.den}?`,
      [`${above.num}/${above.den}`, `Correct — it is above one-half, while ${below.num}/${below.den} is below one-half.`],
      [[`${below.num}/${below.den}`, `That fraction is below one-half, while the other fraction is above one-half.`],
       [`They are equal`, `The fractions lie on opposite sides of one-half, so they cannot be equal.`],
       [`The denominators alone decide`, `Denominator size by itself does not compare fractions with different numerators.`]]);
  },
  faBenchmarkOrderRational: (rand, band) => {
    const d1 = bandInt(rand, band, [4, 8], [5, 10], [7, 12]);
    const d2 = bandInt(rand, band, [4, 8], [6, 11], [8, 13]);
    const n1 = pick(rand, 1, d1 - 1), n2 = pick(rand, 1, d2 - 1);
    if (n1 * d2 === n2 * d1) return fractionHandlers.faBenchmarkOrderRational(rand, band);
    return rationalCompare("g4-fractions", `Compare ${n1}/${d1} and ${n2}/${d2}.`, { num: n1, den: d1 }, { num: n2, den: d2 });
  },
  faBenchmarkOrderMcq: (rand, band) => {
    const d = bandInt(rand, band, [8, 12], [10, 16], [12, 20]);
    const nums = [pick(rand, 1, Math.floor(d / 3)), pick(rand, Math.floor(d / 3) + 1, Math.floor(2 * d / 3)), pick(rand, Math.floor(2 * d / 3) + 1, d - 1)];
    const labels = nums.map((n) => `${n}/${d}`);
    return mcq(rand, "g4-fractions", `Order ${labels.join(", ")} from least to greatest. Which fraction is in the middle?`,
      [labels[1], `Correct — with a common denominator, the middle numerator gives the middle fraction.`],
      [[labels[0], `That is the least fraction because it has the smallest numerator with the same denominator.`],
       [labels[2], `That is the greatest fraction because it has the largest numerator with the same denominator.`],
       [`They are all equal`, `Equal denominators do not make the fractions equal when their numerators differ.`]]);
  },
  faBenchmarkOrderNumeric: (rand, band) => {
    const dens = band === "stretch" ? [8, 11, 13, 17] : [6, 8, 10, 12];
    const fracs = dens.map((d, i) => ({ num: i + 1, den: d }));
    fracs.sort((a, b) => a.num / a.den - b.num / b.den);
    const second = fracs[1];
    const list = shuffled(rand, fracs).map((f) => `${f.num}/${f.den}`).join(", ");
    return num("g4-fractions", `Order ${list} from least to greatest. What is the denominator of the second fraction?`, second.den,
      [[fracs[0].den, `That denominator belongs to the least fraction, not the second one after ordering by value.`],
       [fracs[2].den, `That denominator belongs to a larger fraction. Compare the fractions before selecting the second position.`]],
      `Compare the four fraction values, place them in order, and then read the denominator of the second.`);
  },
  faLikeDenomWordNumeric: (rand, band) => {
    const den = bandInt(rand, band, [6, 10], [8, 12], [10, 16]);
    const a = pick(rand, 1, Math.floor(den / 3)), b = pick(rand, 1, Math.floor(den / 3));
    const subtract = rand() < 0.35;
    const x = subtract ? a + b : a, y = b, ans = subtract ? x - y : x + y;
    const verb = subtract ? "used" : "added";
    return num("g4-fractions", `A ribbon story uses like-sized parts: ${x}/${den} ${subtract ? "metres were available and " : "metres of red ribbon and "}${y}/${den} ${subtract ? "metres were used" : "metres of blue ribbon"}. What is the result's numerator?`, ans,
      [[subtract ? x + y : Math.abs(x - y), `That applies the opposite operation to the numerators. The story says the amounts were ${verb}.`],
       [den, `The denominator names the unchanged part size. The question asks for the numerator after combining the counted parts.`]],
      `Keep denominator ${den} and ${subtract ? "subtract" : "add"} the numerators.`);
  },
  faLikeDenomWordMcq: (rand, band) => {
    const den = bandInt(rand, band, [5, 9], [8, 12], [10, 16]);
    return mcq(rand, "g4-fractions", `When adding ${pick(rand, 1, den - 2)}/${den} and ${pick(rand, 1, den - 2)}/${den}, what happens to the denominator?`,
      /* S242 / MCQ-01. `It stays 8 because the part size does not change.` was the only option with a
         reason attached, so it was identifiable without adding anything. The reason already appears in
         the feedback, which is where the learner reads it after committing; every label now has the
         same shape — a bare claim about the denominator. */
      [`It stays ${den}.`, `Correct — the denominator names the size of each equal part, and those parts stay the same size.`],
      [[`It becomes ${den * 2}.`, `Adding denominators would pretend the pieces became smaller even though the same whole and same partition are used.`],
       [`It becomes 1.`, `The denominator becomes 1 only when the total makes an exact whole, not as a general addition rule.`],
       [`It is replaced by the larger numerator.`, `The denominator records part size, so it is not chosen from either numerator.`]]);
  },
  faImproperToMixedNumeric: (rand, band) => {
    const den = bandInt(rand, band, [3, 6], [4, 9], [6, 12]);
    const whole = pick(rand, 1, band === "stretch" ? 7 : 4), rem = pick(rand, 1, den - 1), top = whole * den + rem;
    return num("g4-fractions", `Convert ${top}/${den} to a mixed number. What is the whole-number part?`, whole,
      [[Math.floor(top / den) + 1, `That rounds the quotient up. The whole-number part counts only complete groups of ${den}.`],
       [rem, `That is the leftover numerator, not the number of complete groups in ${top} ÷ ${den}.`]],
      `Divide ${top} by ${den}; the quotient is the whole-number part and the remainder stays over ${den}.`);
  },
  faMixedToImproperNumeric: (rand, band) => {
    const den = bandInt(rand, band, [3, 6], [4, 9], [6, 12]);
    const whole = pick(rand, 1, band === "stretch" ? 8 : 5), rem = pick(rand, 1, den - 1), top = whole * den + rem;
    return num("g4-fractions", `Convert ${whole} ${rem}/${den} to an improper fraction. What is the numerator?`, top,
      [[whole + rem, `Adding the whole number directly to the numerator ignores that each whole contains ${den} parts.`],
       [whole * den, `That counts the parts in the wholes but leaves out the extra ${countN(rem, "part")}.`]],
      `Multiply ${whole} by ${den}, then add the remaining numerator ${rem}.`);
  },
  faMixedAddSubMixed: (rand, band) => {
    const den = bandInt(rand, band, [4, 6], [5, 9], [7, 12]);
    if (rand() < 0.5) {
      const aW = pick(rand, 1, 4), bW = pick(rand, 1, 3), aN = pick(rand, Math.ceil(den / 2), den - 1), bN = pick(rand, den - aN, den - 1);
      return mixed("g4-fractions", `Add ${aW} ${aN}/${den} + ${bW} ${bN}/${den}. Exchange ${den}/${den} for a whole when needed.`, { mode: "add", den, aWhole: aW, aNum: aN, bWhole: bW, bNum: bN });
    }
    const aW = pick(rand, 2, 6), bW = pick(rand, 0, aW - 1), aN = pick(rand, 0, Math.floor(den / 3)), bN = pick(rand, aN + 1, den - 1);
    return mixed("g4-fractions", `Subtract ${aW} ${aN}/${den} − ${bW} ${bN}/${den}. Break one whole into ${den}/${den} before subtracting the parts.`, { mode: "subtract", den, aWhole: aW, aNum: aN, bWhole: bW, bNum: bN });
  },
  faMixedAddSubNumeric: (rand, band) => {
    const den = bandInt(rand, band, [4, 6], [5, 9], [7, 12]);
    const aW = pick(rand, 1, 5), bW = pick(rand, 1, 4), aN = pick(rand, 1, den - 1), bN = pick(rand, 1, den - 1);
    const total = (aW + bW) * den + aN + bN;
    const rem = total % den;
    return num("g4-fractions", `Add ${aW} ${aN}/${den} + ${bW} ${bN}/${den}. What is the numerator of the fractional part in the mixed-number answer?`, rem,
      [[aN + bN, `That is the raw parts-column sum before exchanging a full group of ${den} parts for one whole.`],
       [Math.floor(total / den), `That is the whole-number part, not the numerator left after all complete groups are exchanged.`]],
      `Add the parts, exchange each full group of ${den}, and report the leftover numerator.`);
  },
  faWholeTimesFractionMcq: (rand, band) => {
    const den = bandInt(rand, band, [3, 7], [5, 10], [7, 12]);
    const n = pick(rand, 1, den - 1), w = pick(rand, 2, band === "stretch" ? 9 : 6);
    return mcq(rand, "g4-fractions", `Which expression correctly finds ${w} × ${n}/${den}?`,
      [`(${w} × ${n})/${den}`, `Correct — repeated copies multiply the numerator while the size of each part stays ${denomName(den)}.`],
      [[`${w + n}/${den}`, `Adding the whole number to the numerator does not represent ${w} equal copies of the fraction.`],
       [`${w * n}/${w * den}`, `Multiplying both numerator and denominator by ${w} leaves the original fraction unchanged instead of making ${w} copies.`],
       [`${n}/${w * den}`, `Multiplying the denominator makes each part smaller and moves in the opposite direction.`]]);
  },
  faWholeTimesFractionMixed: (rand, band) => {
    const den = bandInt(rand, band, [3, 6], [4, 9], [6, 12]);
    const n = pick(rand, 1, den - 1);
    let w = pick(rand, 2, band === "stretch" ? 9 : 6);
    while (n * w < den) w += 1;
    return mixed("g4-fractions", `Build ${w} × ${n}/${den} as ${n * w}/${den}, then exchange complete wholes.`, { mode: "convert", den, aWhole: 0, aNum: n * w, targetForm: "mixed" });
  },
  faWholeTimesFractionNumeric: (rand, band) => {
    const den = bandInt(rand, band, [3, 7], [5, 10], [7, 12]);
    const n = pick(rand, 1, den - 1), w = pick(rand, 2, band === "stretch" ? 10 : 7), ans = n * w;
    return num("g4-fractions", `Compute ${w} × ${n}/${den}. Before converting to a mixed number, what is the numerator?`, ans,
      [[n + w, `That adds the number of copies instead of multiplying ${countN(n, "part")} by ${w} copies.`],
       [den * w, `That multiplies the denominator, but the part size remains ${denomName(den)} while the count of parts grows.`]],
      `Multiply the numerator ${n} by the whole number ${w}; keep denominator ${den}.`);
  },
  faWholeTimesFractionWordNumeric: (rand, band) => {
    const den = bandInt(rand, band, [4, 8], [6, 10], [8, 12]);
    const n = pick(rand, 1, den - 1), groups = pick(rand, 2, band === "stretch" ? 10 : 7), ans = n * groups;
    return num("g4-fractions", `${groups} identical recipes each use ${n}/${den} cup of oats. The total is ${ans}/${den} cups before regrouping. What is the total numerator?`, ans,
      [[n + groups, `Adding the recipe count to the numerator does not combine ${groups} equal copies of ${n}/${den}.`],
       [den * groups, `That changes the part size. The denominator stays ${den}; only the number of parts is multiplied.`]],
      `Multiply ${countN(n, "part")} per recipe by ${groups} recipes.`);
  },
};

const GEOMETRY_FORMS = [
  "laGeometricBasicsMcq", "laAngleFormationMcq", "laReadingFiguresMcq", "laReadingFiguresNumeric",
  "laParallelLinesMcq", "laPerpendicularLinesMcq", "laParallelPerpIdentifyMcq", "laParallelPerpIdentifyNumeric",
  "laTriangleClassificationMcq", "laQuadrilateralClassificationMcq", "laSymmetryConceptMcq", "laSymmetryFindingNumeric",
  "laSymmetryApplicationMcq", "laSymmetryApplicationNumeric",
] as const;

const geometryHandlers: Record<string, FormHandler> = {
  laGeometricBasicsMcq: (rand) => {
    const cases = [
      ["line", "extends forever in both directions", "has two separate endpoints", "starts at only one endpoint", "is a single fixed location"],
      ["line segment", "has exactly two endpoints", "extends forever in both directions", "starts at one endpoint and continues forever", "has no length"],
      ["ray", "starts at one endpoint and extends forever in one direction", "has two separate endpoints, one at each end", "extends forever in both directions at once, with no endpoint", "is only a single fixed point"],
      ["point", "marks one exact location and has no length", "extends forever", "has two endpoints", "forms a right angle by itself"],
    ] as const;
    const [name, right, ...wrong] = choose(rand, cases);
    return mcq(rand, "g4-lines-angles", `Which description defines a ${name}?`, [right, `Correct — that description gives the defining feature of a ${name}.`], wrong.map((x) => [x, `That description belongs to a different geometric object, not a ${name}.`]));
  },
  laAngleFormationMcq: (rand) => mcq(rand, "g4-lines-angles", `What must two rays share in order to form an angle?`,
    ["A common endpoint called the vertex", `Correct — the shared endpoint is the vertex and the rays are the sides of the angle.`],
    [["Exactly the same length", `Ray length is unbounded and does not determine whether the rays form an angle.`], ["Two completely different endpoints", `An angle forms where the rays share one endpoint, not where they stay separate.`], ["A parallel, non-crossing direction", `Parallel rays do not open from one common vertex to form the intended angle.`]]),
  laReadingFiguresMcq: (rand) => {
    const letters = choose(rand, [["A", "B", "C"], ["P", "Q", "R"], ["M", "N", "T"], ["D", "E", "F"]] as const);
    return mcq(rand, "g4-lines-angles", `The vertex is ${letters[1]}, with points ${letters[0]} and ${letters[2]} on the two rays. Which name is valid?`,
      [`∠${letters[0]}${letters[1]}${letters[2]}`, `Correct — the vertex letter belongs in the middle of a three-letter angle name.`],
      [[`∠${letters[1]}${letters[0]}${letters[2]}`, `That places a non-vertex letter in the middle. The shared endpoint must be the middle letter.`], [`∠${letters[0]}${letters[2]}${letters[1]}`, `That puts ${letters[2]} in the middle even though ${letters[1]} is the vertex.`], [`segment ${letters[0]}${letters[2]}`, `A segment between the outer points does not name the angle at ${letters[1]}.`]]);
  },
  laReadingFiguresNumeric: (rand, band) => {
    const a = bandInt(rand, band, [20, 60], [25, 75], [35, 85]), b = pick(rand, 10, 90 - a), ans = a + b;
    return num("g4-lines-angles", `A figure shows adjacent angles of ${a}° and ${b}° sharing one side. What is the measure of the whole angle?`, ans,
      [[Math.abs(a - b), `Subtracting measures the gap between the angles, not the whole angle formed by placing them adjacent.`], [180 - ans, `That finds a supplement rather than adding the two adjacent pieces shown in the figure.`]],
      `Use angle addition: combine the two adjacent measures ${a}° and ${b}°.`);
  },
  laParallelLinesMcq: (rand) => mcq(rand, "g4-lines-angles", `Which statement is always true about two parallel lines in a plane?`,
    ["They stay the same distance apart and never meet.", `Correct — equal direction keeps the lines equidistant throughout the plane.`],
    [["They always meet at one right angle.", `Lines that meet at a right angle are perpendicular, not parallel.`], ["They share exactly one single endpoint.", `Full lines do not have endpoints, and parallel lines do not intersect.`], ["They must always run horizontally.", `Parallel lines can tilt in any direction as long as both have the same direction.`]]),
  laPerpendicularLinesMcq: (rand) => mcq(rand, "g4-lines-angles", `What identifies two perpendicular lines?`,
    ["They intersect to form four right angles.", `Correct — one right angle at the intersection forces all four angles to be right angles.`],
    [["They never intersect.", `Lines that never intersect in a plane are parallel rather than perpendicular.`], ["They have the same length.", `Line length does not define perpendicularity; the right-angle intersection does.`], ["They point in the same direction.", `The same direction describes parallel lines, not a right-angle crossing.`]]),
  laParallelPerpIdentifyMcq: (rand) => {
    const perp = rand() < 0.5;
    return mcq(rand, "g4-lines-angles", `One line runs east–west and another runs ${perp ? "north–south" : "east–west"}. How are they related?`,
      [perp ? "Perpendicular" : "Parallel", perp ? `Correct — east–west and north–south directions meet at a right angle.` : `Correct — matching east–west directions stay parallel.`],
      [[perp ? "Parallel" : "Perpendicular", `The stated directions do not satisfy that relationship.`], ["Neither", `The two cardinal directions give a standard parallel or perpendicular relationship.`], ["Congruent", `Congruent describes equal size and shape, not how two lines are directed.`]]);
  },
  laParallelPerpIdentifyNumeric: (rand) => {
    const pairs = pick(rand, 3, 6), perpendicular = pick(rand, 1, pairs - 1);
    return num("g4-lines-angles", `A diagram lists ${pairs} line pairs. ${perpendicular} pairs meet at right angles; the rest run in the same direction. How many pairs are parallel?`, pairs - perpendicular,
      [[perpendicular, `That counts the right-angle pairs, which are perpendicular rather than parallel.`], [pairs, `That treats every listed pair as parallel and ignores the ${perpendicular} right-angle pair${perpendicular === 1 ? "" : "s"}.`]],
      `Subtract the perpendicular-pair count from the total number of pairs.`);
  },
  laTriangleClassificationMcq: (rand) => {
    const cases = [
      ["three equal sides", "Equilateral triangle", "Isosceles only", "Scalene triangle", "Right triangle"],
      ["exactly two equal sides", "Isosceles triangle", "Equilateral triangle", "Scalene triangle", "Obtuse triangle"],
      ["three different sides", "Scalene triangle", "Equilateral triangle", "Isosceles triangle", "Right triangle"],
      ["one 90° angle", "Right triangle", "Acute triangle", "Obtuse triangle", "Equilateral triangle"],
      ["one angle greater than 90°", "Obtuse triangle", "Right triangle", "Acute triangle", "Equilateral triangle"],
    ] as const;
    const [desc, right, ...wrong] = choose(rand, cases);
    return mcq(rand, "g4-lines-angles", `A triangle has ${desc}. Which classification is guaranteed?`, [right, `Correct — ${desc} is the defining condition for a ${right.toLowerCase()}.`], wrong.map((x) => [x, `That classification does not follow from the stated side or angle condition.`]));
  },
  laQuadrilateralClassificationMcq: (rand) => {
    const cases = [
      ["four right angles and four equal sides", "Square", "Rectangle but not square", "Rhombus but not square", "Trapezoid"],
      ["four right angles", "Rectangle", "Rhombus", "Kite", "Trapezoid only"],
      ["four equal sides", "Rhombus", "Rectangle", "Trapezoid only", "Kite only"],
      ["two pairs of parallel opposite sides", "Parallelogram", "Kite", "Triangle", "Pentagon"],
    ] as const;
    const [desc, right, ...wrong] = choose(rand, cases);
    return mcq(rand, "g4-lines-angles", `A quadrilateral has ${desc}. Which name is guaranteed?`, [right, `Correct — those defining attributes guarantee the inclusive category ${right}.`], wrong.map((x) => [x, `That name is not guaranteed by the stated attributes.`]));
  },
  laSymmetryConceptMcq: (rand) => mcq(rand, "g4-lines-angles", `What makes a line a line of symmetry for a figure?`,
    ["Folding on the line makes the two halves match exactly.", `Correct — corresponding points land on one another after the reflection fold.`],
    [["It passes through any corner.", `Passing through a corner alone does not make the two sides mirror images.`], ["It is always vertical.", `A symmetry line can be vertical, horizontal, or diagonal depending on the figure.`], ["It divides the perimeter into unequal lengths.", `A symmetry line creates matching halves rather than deliberately unequal ones.`]]),
  laSymmetryFindingNumeric: (rand) => {
    const cases = [["square", 4], ["non-square rectangle", 2], ["equilateral triangle", 3], ["isosceles triangle", 1], ["regular pentagon", 5]] as const;
    const [shape, ans] = choose(rand, cases);
    return num("g4-lines-angles", `How many lines of symmetry does a ${shape} have?`, ans,
      [[ans + 1, `That counts an extra fold that would not make the two halves of the ${shape} match.`], [Math.max(0, ans - 1), `That misses one of the distinct reflection folds of the ${shape}.`]],
      `Imagine every possible fold through the ${shape} and count only the folds whose halves coincide.`);
  },
  laSymmetryApplicationMcq: (rand) => mcq(rand, "g4-lines-angles", `A point is reflected across a vertical line of symmetry. What must be true of the image point?`,
    ["It is the same perpendicular distance from the line on the opposite side.", `Correct — a reflection preserves perpendicular distance while switching sides.`],
    [["It always stays on the same side of the line.", `A reflection across the line places the image on the opposite side unless the point lies on the line.`], ["It moves twice as far away from the line as before.", `Reflection preserves the distance from the mirror line rather than doubling it.`], ["It can land anywhere at all, as long as it keeps the same height.", `Matching height alone is insufficient; the perpendicular distance must also match.`]]),
  laSymmetryApplicationNumeric: (rand, band) => {
    const n = bandInt(rand, band, [2, 5], [4, 8], [6, 12]);
    return num("g4-lines-angles", `A half-design contains ${n} shapes, none on the symmetry line. After reflecting every shape, how many shapes are in the complete design?`, 2 * n,
      [[n, `That counts only the original half and leaves out the matching reflected shapes.`], [n + 1, `A reflection creates one matching image for every original shape, not only one extra shape overall.`]],
      `Double the number of off-line shapes because each original gets exactly one reflected partner.`);
  },
};

const MEASURE_FORMS = [
  "mcPerimeterFormulaMcq", "mcDegreeMeasurementMcq", "mcDegreeMeasurementNumeric", "mcProtractorReadingMcq",
  "mcProtractorReadingNumeric", "mcAngleClassificationMcq", "mcBenchmarkAnglesMcq", "mcBenchmarkAnglesNumeric",
  "mcFractionMeasurementMcq", "mcFractionMeasurementNumeric", "mcLinePlotBuildMcq", "mcLinePlotBuildNumeric",
  "mcLinePlotQuestionsNumeric",
] as const;

const measureHandlers: Record<string, FormHandler> = {
  mcPerimeterFormulaMcq: (rand, band) => {
    const l = bandInt(rand, band, [4, 9], [8, 18], [12, 30]), w = pick(rand, 2, l - 1);
    return mcq(rand, "g4-measure", `Which expression gives the perimeter of a rectangle with length ${l} and width ${w}?`,
      [`2 × (${l} + ${w})`, `Correct — perimeter includes two lengths and two widths around the boundary.`],
      [[`${l} × ${w}`, `That calculates area inside the rectangle rather than distance around its boundary.`], [`${l} + ${w}`, `That counts only one length and one width, which is half of the boundary.`], [`2 × ${l} × ${w}`, `Multiplying all three numbers does not represent adding the four side lengths.`]]);
  },
  mcDegreeMeasurementNumeric: (rand) => {
    const cases = [["quarter turn", 90], ["half turn", 180], ["three-quarter turn", 270], ["full turn", 360]] as const;
    const [name, ans] = choose(rand, cases);
    return num("g4-measure", `How many degrees are in a ${name}?`, ans,
      [[ans / 2, `That represents only half of the stated turn. Use 360° for one complete turn.`], [ans === 360 ? 180 : ans + 90, `That degree measure corresponds to a different benchmark turn.`]],
      `Relate the turn to a full 360° rotation.`);
  },
  mcDegreeMeasurementMcq: (rand) => mcq(rand, "g4-measure", `Which unit is used to measure the amount an angle turns?`,
    ["Degrees", `Correct — angle opening is measured in degrees, with 360° in a full turn.`],
    [["Centimetres", `Centimetres measure length rather than rotational opening.`], ["Square units", `Square units measure area, not angle size.`], ["Litres", `Litres measure capacity and do not describe a turn.`]]),
  mcProtractorReadingNumeric: (rand, band) => {
    const a = pick(rand, 0, 8) * 10, size = bandInt(rand, band, [20, 80], [30, 130], [40, 160]);
    const b = Math.min(180, a + size), ans = b - a;
    return num("g4-measure", `On a protractor, one ray points to ${a}° and the other to ${b}°. What is the angle between them?`, ans,
      [[b, `That reads the ending tick as the angle without subtracting the starting tick ${a}°.`], [180 - ans, `That gives the supplementary opening on the other side rather than the smaller angle between the rays.`]],
      `Subtract the starting reading ${a}° from the ending reading ${b}°.`);
  },
  mcProtractorReadingMcq: (rand) => mcq(rand, "g4-measure", `A ray starts at the protractor's 0° mark on the right. Which scale should you read?`,
    ["The scale that begins with 0° on the right.", `Correct — start from the zero aligned with the base ray and follow that scale to the second ray.`],
    [["Always read the outer scale instead.", `Inner versus outer is not fixed; the correct scale is the one whose zero matches the base ray.`], ["Always read the larger of the two numbers.", `The larger tick label can describe the supplementary angle instead of the intended opening.`], ["Add together both of the scale readings.", `The two scales are alternative readings of the same ray, not values to combine.`]]),
  mcAngleClassificationMcq: (rand) => {
    const degree = choose(rand, [25, 45, 70, 90, 110, 135, 170, 180]);
    const right = degree < 90 ? "Acute" : degree === 90 ? "Right" : degree < 180 ? "Obtuse" : "Straight";
    return mcq(rand, "g4-measure", `Classify an angle measuring ${degree}°.`, [right, `Correct — ${degree}° falls in the defining range for a ${right.toLowerCase()} angle.`],
      ([ ["Acute", `An acute angle must be greater than 0° and less than 90°.`], ["Right", `A right angle measures exactly 90°, not merely close to it.`], ["Obtuse", `An obtuse angle is greater than 90° but less than 180°.`], ["Straight", `A straight angle measures exactly 180°.`] ] as Array<[string, string]>).filter(([x]) => x !== right));
  },
  mcBenchmarkAnglesNumeric: (rand) => {
    const whole = rand() < 0.5 ? 90 : 180, part = pick(rand, 15, whole - 15), ans = whole - part;
    return num("g4-measure", `An angle of ${part}° must be completed to ${whole}°. How many more degrees are needed?`, ans,
      [[part, `That repeats the known angle instead of finding the missing part of the ${whole}° benchmark.`], [whole + part, `Adding makes an angle larger than the target benchmark rather than completing it.`]],
      `Subtract the known angle ${part}° from the benchmark ${whole}°.`);
  },
  mcBenchmarkAnglesMcq: (rand) => {
    const degree = choose(rand, [12, 38, 82, 96, 128, 174]);
    const benchmarks = [0, 90, 180];
    const closest = benchmarks.reduce((a, b) => Math.abs(degree - a) <= Math.abs(degree - b) ? a : b);
    return mcq(rand, "g4-measure", `Which benchmark angle is closest to ${degree}°?`, [`${closest}°`, `Correct — ${closest}° has the smallest numerical distance from ${degree}°.`],
      benchmarks.filter((x) => x !== closest).map((x): [string, string] => [`${x}°`, `That benchmark is farther from ${degree}° than ${closest}° is.`]).concat([["360°", `A full-turn benchmark is much farther from this angle than the nearest common benchmark.`]]));
  },
  mcFractionMeasurementNumeric: (rand, band) => {
    const quarters = bandInt(rand, band, [3, 10], [5, 16], [8, 24]);
    return num("g4-measure", `A line plot records a total of ${quarters} quarter-unit marks. What length do they represent in units?`, quarters / 4,
      [[quarters, `That counts quarter-units as if each were a full unit. Four quarter-units make one whole unit.`], [quarters / 2, `Dividing by 2 treats each mark as a half-unit instead of a quarter-unit.`]],
      `Divide the number of quarter-unit marks by 4.`, 0.001);
  },
  mcFractionMeasurementMcq: (rand) => {
    const a = choose(rand, ["1/4", "1/2", "3/4"]), b = choose(rand, ["1/4", "1/2", "3/4"]);
    const val = (x: string) => x === "1/4" ? 0.25 : x === "1/2" ? 0.5 : 0.75;
    const units = (x: number) => `${x} unit${x === 1 ? "" : "s"}`;
    const total = val(a) + val(b);
    return mcq(rand, "g4-measure", `Two measured pieces are ${a} unit and ${b} unit long. Which total is correct?`,
      [units(total), `Correct — the fractional lengths combine to ${total}.`],
      [[units(val(a) * val(b)), `Multiplying the lengths does not answer a total-length question.`], [units(Math.abs(val(a) - val(b))), `That finds the difference rather than the combined length.`], [units(val(a) + val(b) + 0.25), `That includes an extra quarter-unit that is not present in either measured piece.`]]);
  },
  mcLinePlotBuildNumeric: (rand, band) => {
    const a = bandInt(rand, band, [2, 5], [3, 7], [4, 9]), b = pick(rand, 1, 5), total = a + b + pick(rand, 1, 5), missing = total - a - b;
    const built = num("g4-measure", `A line plot must contain ${total} data marks. It already has ${countN(a, "mark")} at 1/2 and ${countN(b, "mark")} at 3/4. How many marks are still missing?`, missing,
      [[a + b, `That counts the marks already placed instead of subtracting them from the required total.`], [total, `That repeats the target total and ignores the marks already shown.`]],
      `Subtract both shown frequencies from the total number of data values.`);
    // DISPLAY ONLY (PlotDataSpec, S238 wave 9): the placed marks the prompt states, drawn —
    // 1/2 and 3/4 as quarters over den 4. The MISSING count is not on the plot; only the
    // stated total (in the prose) closes the subtraction, so nothing leaks. Same obligation
    // as every wired variant-bearing row: the re-ask takes the plot with it (mc-05-02/k2).
    return { ...built, widget: { ...built.widget, plotData: { values: [2, 3], counts: [a, b], denominator: 4 } } };
  },
  mcLinePlotBuildMcq: (rand) => mcq(rand, "g4-measure", `The dataset is 1/4, 1/4, 1/2, 3/4. Which line-plot description matches it?`,
    ["Two marks at 1/4, one at 1/2, and one at 3/4", `Correct — each data value contributes exactly one mark above its location.`],
    [["One mark at 1/4, two at 1/2, and one at 3/4", `That swaps the frequencies of 1/4 and 1/2.`], ["Four marks at 1/4", `The data are not all equal to 1/4; the marks must be distributed by value.`], ["One mark at each value", `The repeated 1/4 requires two marks at that location.`]]),
  mcLinePlotQuestionsNumeric: (rand) => {
    const counts = [pick(rand, 1, 5), pick(rand, 1, 5), pick(rand, 1, 5)];
    const mode = pick(rand, 0, 2);
    if (mode === 0) return num("g4-measure", `A line plot shows 1/4→${"X".repeat(counts[0])}, 1/2→${"X".repeat(counts[1])}, 3/4→${"X".repeat(counts[2])}. How many data values are shown?`, counts.reduce((a, b) => a + b, 0),
      [[Math.max(...counts), `That is the greatest single frequency, not the total across all three positions.`], [3, `That counts locations on the number line rather than individual data marks.`]], `Add the three frequencies represented by the X marks.`);
    if (mode === 1) return num("g4-measure", `A line plot shows 1/4→${"X".repeat(counts[0])}, 1/2→${"X".repeat(counts[1])}, 3/4→${"X".repeat(counts[2])}. How many values are at least 1/2?`, counts[1] + counts[2],
      [[counts[1], `That counts only the 1/2 marks and leaves out the values at 3/4, which are also at least 1/2.`], [counts.reduce((a, b) => a + b, 0), `That includes the 1/4 values, which are below the stated threshold.`]], `Add the frequencies at 1/2 and 3/4.`);
    return num("g4-measure", `A line plot has data at 1/4, 1/2, and 3/4. What is the range in units?`, 0.5,
      [[0.75, `That uses the greatest value alone instead of subtracting the least value 1/4.`], [0.25, `That measures one adjacent tick interval, but the data span two quarter-unit intervals.`]], `Subtract the least value 1/4 from the greatest value 3/4.`, 0.001);
  },
};

const MULTIPLY_FORMS = [
  "mbTimesAsManyMcq", "mbTimesAsManyNumeric", "mbComparisonEquationsMcq", "mbComparisonEquationsNumeric",
  "mbAdditiveVsMultiplicativeMcq", "mbAdditiveVsMultiplicativeNumeric", "mbFactorsMcq", "mbFactorsNumeric",
  "mbMultiplesMcq", "mbPrimeCompositeMcq", "mbPrimeCompositeNumeric", "mbMultiplyTensMcq", "mbMultiplyTensNumeric",
  "mbAreaModel1DigitMcq", "mbAreaModel1DigitNumeric", "mbAreaModel2DigitMcq", "mbAreaModel2DigitNumeric",
  "mbRemaindersMcq", "mbRemaindersNumeric", "mbDivideBigNumeric", "mbInterpretRemaindersMcq",
  "mbInterpretRemaindersNumeric", "mbPatternsMcq", "mbPatternsNumeric", "mbMultiStepNumeric",
] as const;

const multiplyHandlers: Record<string, FormHandler> = {
  mbTimesAsManyNumeric: (rand, band) => {
    const small = bandInt(rand, band, [3, 9], [6, 20], [12, 40]), times = pick(rand, 2, band === "stretch" ? 9 : 6), ans = small * times;
    return num("g4-multiply", `A large collection has ${times} times as many objects as a collection of ${small}. How many objects are in the large collection?`, ans,
      [[small + times, `That treats “${times} times as many” as adding ${times} instead of making ${times} equal groups of ${small}.`], [times, `That gives only the comparison factor and leaves out the original amount ${small}.`]],
      `Multiply the original amount ${small} by the comparison factor ${times}.`);
  },
  mbTimesAsManyMcq: (rand) => {
    const a = pick(rand, 3, 15), k = pick(rand, 2, 7);
    return mcq(rand, "g4-multiply", `Mia has ${k} times as many stickers as Leo, who has ${a}. Which equation finds Mia's stickers?`,
      [`${a} × ${k} = ?`, `Correct — “times as many” is a multiplicative comparison.`],
      [[`${a} + ${k} = ?`, `Adding the factor does not create ${k} equal copies of Leo's amount.`], [`${a} − ${k} = ?`, `Subtraction represents fewer, not a “times as many” comparison.`], [`${a} ÷ ${k} = ?`, `Division would split Leo's amount rather than scale it up by ${k}.`]]);
  },
  mbComparisonEquationsNumeric: (rand, band) => {
    const factor = pick(rand, 2, band === "stretch" ? 9 : 6), small = bandInt(rand, band, [3, 12], [8, 25], [15, 50]), large = factor * small;
    return num("g4-multiply", `${large} is ${factor} times as many as what number?`, small,
      [[large * factor, `That scales the larger number again instead of undoing the comparison.`], [large - factor, `Subtracting the factor does not reverse a multiplicative comparison.`]],
      `Divide ${large} by the comparison factor ${factor}.`);
  },
  mbComparisonEquationsMcq: (rand) => {
    const a = pick(rand, 4, 18), k = pick(rand, 2, 8), b = a * k;
    return mcq(rand, "g4-multiply", `Which equation correctly states “${b} is ${k} times as many as ${a}”?`,
      [`${b} = ${k} × ${a}`, `Correct — the larger amount equals the comparison factor times the smaller amount.`],
      [[`${b} = ${k} + ${a}`, `That is an additive comparison, not a multiplicative one.`], [`${a} = ${k} × ${b}`, `That reverses the roles of the larger and smaller amounts.`], [`${k} = ${b} × ${a}`, `The factor is not the product of the two compared amounts.`]]);
  },
  mbAdditiveVsMultiplicativeMcq: (rand) => {
    const k = pick(rand, 2, 8);
    return mcq(rand, "g4-multiply", `Which phrase describes a multiplicative comparison?`,
      [`“${k} times as many”`, `Correct — the phrase names a scale factor rather than a fixed difference.`],
      [[`“${k} more than”`, `“More than” describes addition of a fixed amount, not multiplication by a factor.`], [`“${k} fewer than”`, `“Fewer than” describes subtraction, not a multiplicative comparison.`], [`“The same number plus ${k}”`, `That explicitly describes an additive relationship.`]]);
  },
  mbAdditiveVsMultiplicativeNumeric: (rand, band) => {
    const base = bandInt(rand, band, [4, 10], [8, 20], [15, 40]), k = pick(rand, 2, 6), mult = base * k, add = base + k;
    return num("g4-multiply", `Starting from ${base}, how much larger is “${k} times as many” than “${k} more”?`, mult - add,
      [[mult, `That is the full multiplicative result, not the difference between the two comparison results.`], [add, `That is the additive result, not how far apart the two results are.`]],
      `Compute ${base}×${k} and ${base}+${k}, then subtract the smaller result from the larger.`);
  },
  mbFactorsMcq: (rand) => {
    const n = choose(rand, [12, 18, 20, 24, 30, 36]);
    const fs = factors(n), pair = choose(rand, fs.filter((x) => x <= Math.sqrt(n))).toString();
    const nonFactors: number[] = [];
    for (let x = 2; nonFactors.length < 3; x++) if (n % x !== 0) nonFactors.push(x);
    return mcq(rand, "g4-multiply", `Which number is a factor of ${n}?`, [pair, `Correct — ${n} ÷ ${pair} is a whole number.`],
      nonFactors.map((x) => [String(x), `Testing ${n} ÷ ${x} leaves a remainder, so ${x} is not a factor of ${n}.`]));
  },
  mbFactorsNumeric: (rand) => {
    const a = pick(rand, 2, 9), b = pick(rand, 2, 9), n = a * b;
    return num("g4-multiply", `${a} × ? = ${n}. What is the missing factor?`, b,
      [[n - a, `Subtracting the known factor does not undo multiplication.`], [n * a, `Multiplying again moves farther from the missing factor rather than isolating it.`]],
      `Divide the product ${n} by the known factor ${a}.`);
  },
  mbMultiplesMcq: (rand) => {
    const a = pick(rand, 3, 9), k = pick(rand, 3, 10), right = a * k;
    const nonMultiples: number[] = [];
    for (let x = Math.max(2, right - 4); nonMultiples.length < 3; x++) if (x !== right && x % a !== 0) nonMultiples.push(x);
    return mcq(rand, "g4-multiply", `Which number is a multiple of ${a}?`, [String(right), `Correct — ${right} equals ${a} multiplied by the whole number ${k}.`],
      nonMultiples.map((x) => [String(x), `${x} does not divide evenly into groups of ${a}, so it is not a multiple of ${a}.`]));
  },
  mbPrimeCompositeMcq: (rand) => {
    const n = choose(rand, [11, 13, 17, 19, 21, 25, 27, 35]);
    const right = isPrime(n) ? "Prime" : "Composite";
    return mcq(rand, "g4-multiply", `Classify ${n}.`, [right, `Correct — ${n} has ${isPrime(n) ? "exactly two positive factors" : "more than two positive factors"}.`],
      [[right === "Prime" ? "Composite" : "Prime", `Checking the full factor list gives the opposite classification.`], ["Neither", `Every whole number greater than 1 is either prime or composite.`], ["Even", `Even or odd is a different classification from prime or composite.`]]);
  },
  /* S242 / GRB-04. THIS FORM WAS DECLARED ON THREE STEPS AND REPRODUCED NONE OF THEM.
   *
   * It emitted `${n} is prime. How many positive factors does it have?` over six primes — answer 2,
   * on every seed. The three authored steps that declare it ask something else entirely:
   *
   *     mb-02-03/ch1    How many PRIME numbers are there from 2 to 10 (including 2 and 10)?   → 4
   *     g4p-02-01/k2    What is the smallest prime number?                                    → 2
   *     g4p-02-02/k2    What is the smallest prime number?                                    → 2
   *
   * It passed every gate because two of those answers are 2 and so was the generator's, forever.
   * The independent route said `return 2`; the suite asserted `toBe(2)`; `variantForStep` only
   * refuses a variant whose WIDGET TYPE differs. Three checks agreeing on a coincidence.
   *
   * CLAUDE.md's rhythm is that a generator must reproduce what the content actually does, including
   * its exact question shape, so this now generates the mb-02-03 shape: count the primes in a drawn
   * range. The two "smallest prime number" steps are single-fact items — rule 7 — and their
   * declarations are withdrawn rather than served by a question they do not ask. */
  mbPrimeCompositeNumeric: (rand) => {
    const isPrime = (v: number) => v > 1 && !Array.from({ length: Math.max(0, v - 2) }, (_, i) => i + 2).some((d) => v % d === 0);
    const primesIn = (a: number, b: number) => { let c = 0; for (let v = a; v <= b; v++) if (isPrime(v)) c++; return c; };
    // 2…10 first because it is the authored range in `mb-02-03/ch1`; the rest keep the pool clear
    // of the ten-draw anti-repeat window rather than merely level with it.
    const RANGES: Array<[number, number]> = [[2, 10], [2, 15], [3, 20], [5, 20], [10, 30], [11, 25],
      [2, 20], [6, 24], [12, 30], [20, 40], [2, 12], [4, 18], [8, 28], [14, 32], [15, 35], [24, 44]];
    const [lo, hi] = RANGES[pick(rand, 0, RANGES.length - 1)];
    const answer = primesIn(lo, hi);
    const span = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    const list = span.filter(isPrime).join(", ");
    /* THE TRAPS ARE CHOSEN PER RANGE, NOT FILTERED FOR. The first cut excluded any range where a
     * trap collided with the answer — and the range it excluded first was 2…10, which is the
     * authored item this form exists to reproduce (`mb-02-03/ch1`). CLAUDE.md names that exact
     * mistake: "a guard that rejects the content it is meant to reproduce is a bug". On 2…10 there
     * are four odds and four primes, so "every odd is prime" IS the answer there and cannot be a
     * trap — but "counted the composites instead" still can. So all three misconceptions are
     * offered and the first two that are live and distinct are used. */
    const odds = span.filter((v) => v % 2 === 1).length;
    const inner = primesIn(lo + 1, hi - 1);
    const composites = span.length - answer;
    const candidates: Array<[number, string]> = [
      [odds, `${odds} counts every ODD number from ${lo} to ${hi}. Odd is not the same as prime — 9, 15 and 21 are all odd and all composite. The primes here are ${list}.`],
      [inner, `${inner} leaves out ${lo} and ${hi} themselves, but the question says to include both endpoints. The primes are ${list}.`],
      [composites, `${composites} counts the numbers that are NOT prime. The question asks for the primes: ${list}.`],
    ];
    const traps: Array<[number, string]> = [];
    for (const c of candidates) if (c[0] !== answer && !traps.some((t) => t[0] === c[0])) traps.push(c);
    return num("g4-multiply", `How many PRIME numbers are there from ${lo} to ${hi} (including ${lo} and ${hi})?`, answer,
      traps.slice(0, 2),
      `Test each number from ${lo} to ${hi} for factors other than 1 and itself: ${list} — that is ${answer}.`);
  },
  mbMultiplyTensNumeric: (rand, band) => {
    const a = bandInt(rand, band, [2, 9], [4, 12], [7, 18]), tens = pick(rand, 2, 9) * 10, ans = a * tens;
    return num("g4-multiply", `Compute ${a} × ${tens}.`, ans,
      [[a * (tens / 10), `That multiplies by ${tens / 10} but leaves out the factor of ten.`], [a + tens, `Adding the factors does not make ${a} equal groups of ${tens}.`]],
      `Multiply ${a} by ${tens / 10}, then multiply the result by 10.`);
  },
  mbMultiplyTensMcq: (rand) => {
    const a = pick(rand, 3, 9), b = pick(rand, 2, 9);
    return mcq(rand, "g4-multiply", `Why does ${a} × ${b * 10} equal (${a} × ${b}) × 10?`,
      ["Because the factor is built from tens, so the basic fact is scaled by 10.", `Correct — ${b * 10} is ${b} tens, and each product unit is therefore ten times as large.`],
      [["Because a zero can always be copied to any answer.", `The zero pattern comes from place value and scaling, not from copying a symbol without reasoning.`], ["Because multiplication and addition are the same.", `Multiplication by tens is repeated grouping and place-value scaling, not addition as an identical operation.`], [`Because ${a} is even.`, `The relationship holds for odd and even factors; parity is not the reason.`]]);
  },
  mbAreaModel1DigitNumeric: (rand, band) => {
    const a = bandInt(rand, band, [12, 39], [24, 69], [45, 99]), b = pick(rand, 2, 9), ans = a * b;
    return num("g4-multiply", `Use an area model to compute ${a} × ${b}. What is the product?`, ans,
      [[Math.floor(a / 10) * 10 * b, `That includes only the tens rectangle and leaves out the ones rectangle.`], [(a % 10) * b, `That includes only the ones rectangle and leaves out the tens rectangle.`]],
      `Split ${a} into tens and ones, multiply each part by ${b}, then add the partial products.`);
  },
  mbAreaModel1DigitMcq: (rand) => {
    const a = pick(rand, 2, 8) * 10 + pick(rand, 1, 9), b = pick(rand, 2, 9), t = Math.floor(a / 10) * 10, o = a % 10;
    return mcq(rand, "g4-multiply", `Which partial products correctly decompose ${a} × ${b}?`,
      [`${t}×${b} and ${o}×${b}`, `Correct — the area model splits ${a} into ${t}+${o} and multiplies both parts by ${b}.`],
      [[`${t}×${b} only`, `That omits the ones rectangle ${o}×${b}.`], [`${o}×${b} only`, `That omits the tens rectangle ${t}×${b}.`], [`${t}+${b} and ${o}+${b}`, `The rectangles represent products, not sums of side lengths.`]]);
  },
  mbAreaModel2DigitNumeric: (rand, band) => {
    const a = bandInt(rand, band, [12, 39], [24, 69], [45, 99]), b = bandInt(rand, band, [11, 29], [18, 49], [25, 79]), ans = a * b;
    return num("g4-multiply", `Use a four-part area model to compute ${a} × ${b}. What is the product?`, ans,
      [[Math.floor(a / 10) * 10 * Math.floor(b / 10) * 10, `That uses only the tens-by-tens rectangle and omits the other three partial products.`], [a * (b % 10), `That uses only the ones part of the second factor and leaves out its tens part.`]],
      `Split both factors into tens and ones, find all four rectangle areas, and add them.`);
  },
  mbAreaModel2DigitMcq: (rand) => {
    const a = pick(rand, 2, 7) * 10 + pick(rand, 1, 9), b = pick(rand, 2, 7) * 10 + pick(rand, 1, 9);
    const ta = Math.floor(a / 10) * 10, oa = a % 10, tb = Math.floor(b / 10) * 10, ob = b % 10;
    return mcq(rand, "g4-multiply", `Which set contains all four partial products for ${a} × ${b}?`,
      [`${ta}×${tb}, ${ta}×${ob}, ${oa}×${tb}, ${oa}×${ob}`, `Correct — each part of one factor must pair with each part of the other factor.`],
      [[`${ta}×${tb} and ${oa}×${ob} only`, `That omits the two cross rectangles.`], [`${a}×${tb} only`, `That accounts for the tens part of ${b} but not its ones part.`], [`${ta}+${tb}+${oa}+${ob}`, `Adding decomposed side lengths does not calculate rectangle areas.`]]);
  },
  mbRemaindersNumeric: (rand, band) => {
    const d = pick(rand, 3, 9), q = bandInt(rand, band, [4, 12], [8, 25], [15, 45]), r = pick(rand, 1, d - 1), n = d * q + r;
    return num("g4-multiply", `${n} ÷ ${d} has quotient ${q}. What is the remainder?`, r,
      [[d, `A remainder must be smaller than the divisor ${d}; ${d} would make one more complete group.`], [q, `That is the quotient, which counts complete groups rather than leftover objects.`]],
      `Subtract the value of ${d}×${q} from ${n} to isolate the leftover amount.`);
  },
  mbRemaindersMcq: (rand) => {
    const d = pick(rand, 3, 9), r = pick(rand, 1, d - 1);
    return mcq(rand, "g4-multiply", `Which could be a remainder when dividing by ${d}?`, [String(r), `Correct — a valid remainder is nonnegative and smaller than the divisor ${d}.`],
      [[String(d), `A remainder equal to the divisor would make another full group.`], [String(d + 1), `A remainder larger than the divisor can be regrouped into at least one more full group.`], [String(-1), `Grade-4 whole-number division uses a nonnegative leftover count.`]]);
  },
  mbDivideBigNumeric: (rand, band) => {
    const d = pick(rand, 2, 9), q = bandInt(rand, band, [20, 80], [50, 300], [150, 900]), n = d * q;
    return num("g4-multiply", `Compute ${n} ÷ ${d}.`, q,
      [[n - d, `Subtracting the divisor once does not count how many equal groups fit in the dividend.`], [n * d, `Multiplying moves in the opposite direction from splitting ${n} into groups of ${d}.`]],
      `Use multiplication facts and place value to find the number that times ${d} equals ${n}.`);
  },
  mbInterpretRemaindersMcq: (rand) => {
    const d = pick(rand, 3, 8), q = pick(rand, 4, 12), r = pick(rand, 1, d - 1), n = d * q + r;
    const answer = String(q + 1);
    const candidates: Array<[string, string]> = [
      [String(q), `That leaves ${countN(r, "student")} without a van.`],
      [String(r), `The remainder is the number left over, not the total number of vans.`],
      [String(n), `One van per student ignores the stated capacity ${d}.`],
      [String(d), `That is the capacity of each van, not the number of vans required.`],
      [String(q + 2), `That adds two extra vans even though the single nonzero remainder needs only one more van.`],
    ];
    const seen = new Set([answer]);
    const wrong = candidates.filter(([label]) => !seen.has(label) && seen.add(label)).slice(0, 3);
    return mcq(rand, "g4-multiply", `${n} students ride in vans holding ${d} each. How many vans are needed?`,
      [answer, `Correct — ${q} full vans leave ${countN(r, "student")}, so one more van is required.`], wrong);
  },
  mbInterpretRemaindersNumeric: (rand, band) => {
    const d = pick(rand, 3, 9), q = bandInt(rand, band, [4, 12], [8, 25], [15, 45]), r = pick(rand, 1, d - 1), n = d * q + r;
    return num("g4-multiply", `${n} books are packed ${d} per box. Every book must be packed. How many boxes are needed?`, q + 1,
      [[q, `That counts only the full boxes and leaves ${countN(r, "book")} unpacked.`], [r, `That is the leftover-book count, not the number of boxes required.`]],
      `Find the quotient and then add one box because the nonzero remainder must also be packed.`);
  },
  mbPatternsNumeric: (rand, band) => {
    const start = bandInt(rand, band, [2, 6], [3, 10], [5, 15]), factor = pick(rand, 2, 5), terms = [start, start * factor, start * factor ** 2, start * factor ** 3];
    return num("g4-multiply", `What number comes next in the pattern ${terms.join(", ")}, …?`, terms[3] * factor,
      [[terms[3] + factor, `That adds the rule number instead of multiplying the previous term by ${factor}.`], [terms[3], `That repeats the previous term and does not apply the pattern rule.`]],
      `Multiply the last shown term ${terms[3]} by the repeated factor ${factor}.`);
  },
  mbPatternsMcq: (rand) => {
    const start = pick(rand, 2, 8), factor = pick(rand, 2, 5);
    return mcq(rand, "g4-multiply", `The pattern begins ${start}, ${start * factor}, ${start * factor ** 2}, ${start * factor ** 3}. Which rule generates it?`,
      [`Multiply by ${factor}`, `Correct — every term is ${factor} times the term before it.`],
      [[`Add ${factor}`, `Adding ${factor} would create a constant difference, not the shown multiplicative jumps.`], [`Multiply by ${factor + 1}`, `That factor would make the second term larger than the one shown.`], ["Add a changing amount", `A description that changes from step to step does not identify the single repeated rule generating the pattern.`]]);
  },
  mbMultiStepNumeric: (rand, band) => {
    const packs = bandInt(rand, band, [3, 7], [5, 12], [8, 18]), each = pick(rand, 4, 12), used = pick(rand, 2, Math.min(20, packs * each - 1)), ans = packs * each - used;
    return num("g4-multiply", `A class buys ${packs} packs of ${each} markers and uses ${used}. How many markers remain?`, ans,
      [[packs * each, `That is the starting total before the ${used} used markers are removed.`], [packs + each - used, `Adding packs and pack size does not find the total number of markers.`]],
      `First multiply ${packs}×${each}, then subtract ${used}.`);
  },
};

const PLACE_FORMS = [
  "pvPlaceLadderMcq", "pvPlaceLadderNumeric", "pvTenTimesNumeric", "pvPlaceNamesMcq", "pvPlaceNamesNumeric",
  "pvNumberFormsMcq", "pvNumberFormsNumeric", "pvReadingBigMcq", "pvReadingBigNumeric", "pvCommaPeriodsMcq",
  "pvCommaPeriodsNumeric", "pvRoundingMcq", "pvRoundingNumeric", "pvFrontEndNumeric", "pvAddColumn",
  "pvAddMcq", "pvAddNumeric", "pvSubtractColumn", "pvSubtractMcq", "pvSubtractNumeric", "pvAcrossZerosColumn",
  "pvAcrossZerosMcq", "pvAcrossZerosNumeric", "pvCompareBigMcq", "pvCompareBigNumeric", "pvOrderBigMcq",
  "pvOrderBigNumeric",
] as const;

const PLACE_NAMES = ["ones", "tens", "hundreds", "thousands", "ten-thousands", "hundred-thousands", "millions"] as const;
const POW10 = [1, 10, 100, 1000, 10000, 100000, 1000000];
function digitAt(n: number, p: number): number { return Math.floor(n / POW10[p]) % 10; }
function roundTo(n: number, place: number): number { return Math.round(n / place) * place; }
function noCarrySum(a: number, b: number): number {
  const A = String(a).padStart(Math.max(String(a).length, String(b).length), "0");
  const B = String(b).padStart(A.length, "0");
  return Number([...A].map((x, i) => (Number(x) + Number(B[i])) % 10).join(""));
}

const placeHandlers: Record<string, FormHandler> = {
  pvPlaceLadderNumeric: (rand, band) => {
    const p = bandInt(rand, band, [2, 4], [3, 5], [4, 6]), digit = pick(rand, 2, 9);
    let lower = pick(rand, 1, POW10[p] - 1);
    while (String(lower).padStart(p, "0").includes(String(digit))) lower = pick(rand, 1, POW10[p] - 1);
    const n = digit * POW10[p] + lower;
    return num("g4-place-million", `In ${fmt(n)}, what is the value of the digit ${digit}?`, digit * POW10[p],
      [[digit, `That gives the digit itself but not its place value in ${fmt(n)}.`], [POW10[p], `That gives the value of one unit in the place, but there are ${digit} of those units.`]],
      `Multiply the digit ${digit} by the value of its place.`);
  },
  pvPlaceLadderMcq: (rand, band) => {
    const p = bandInt(rand, band, [2, 4], [3, 5], [4, 6]), digit = pick(rand, 2, 9);
    let lower = pick(rand, 1, POW10[p] - 1);
    while (String(lower).padStart(p, "0").includes(String(digit))) lower = pick(rand, 1, POW10[p] - 1);
    const n = digit * POW10[p] + lower;
    return mcq(rand, "g4-place-million", `In ${fmt(n)}, which place contains the digit ${digit}?`,
      [PLACE_NAMES[p], `Correct — counting places from the ones digit places ${digit} in the ${PLACE_NAMES[p]} place.`],
      [[PLACE_NAMES[Math.max(0, p - 1)], `That place is one step to the right and is worth ten times less.`], [p === 6 ? "ten-millions" : PLACE_NAMES[p + 1], `That place is one step to the left and is worth ten times more.`], ["ones", `The digit is not at the far-right ones position in the shown number.`]]);
  },
  pvTenTimesNumeric: (rand, band) => {
    const n = bandInt(rand, band, [10, 99], [100, 9999], [10000, 99999]);
    return num("g4-place-million", `What number is 10 times ${fmt(n)}?`, n * 10,
      [[n + 10, `Adding 10 does not make the entire number ten times as large.`], [Math.floor(n / 10), `That shifts digits right and makes the number ten times smaller.`]],
      `Multiplying by 10 shifts every digit one place to the left.`);
  },
  pvPlaceNamesNumeric: (rand, band) => {
    const p = bandInt(rand, band, [3, 4], [4, 5], [5, 6]), digit = pick(rand, 1, 9), n = digit * POW10[p] + pick(rand, 0, POW10[p] - 1);
    return num("g4-place-million", `In ${fmt(n)}, what digit is in the ${PLACE_NAMES[p]} place?`, digit,
      [[digit * POW10[p], `That is the digit's value, but the question asks for the single digit occupying the place.`], [digit === 9 ? 8 : digit + 1, `That digit does not appear in the named place when the number is read from right to left.`]],
      `Locate the ${PLACE_NAMES[p]} place and report the digit written there.`);
  },
  pvPlaceNamesMcq: (rand) => {
    const p = pick(rand, 3, 6);
    return mcq(rand, "g4-place-million", `Which place is worth ${fmt(POW10[p])}?`, [PLACE_NAMES[p], `Correct — one ${PLACE_NAMES[p].replace(/s$/, "")} has value ${fmt(POW10[p])}.`],
      [[PLACE_NAMES[p - 1], `That place is worth ten times less.`], [PLACE_NAMES[Math.min(6, p + 1)], `That place is worth ten times more.`], ["decimal place", `The course is naming whole-number places to the left of the ones place.`]]);
  },
  pvNumberFormsNumeric: (rand, band) => {
    const a = bandInt(rand, band, [2, 8], [3, 9], [4, 9]), b = pick(rand, 1, 9), c = pick(rand, 1, 9), p1 = bandInt(rand, band, [3, 4], [4, 5], [5, 6]), p2 = p1 - 2;
    const n = a * POW10[p1] + b * POW10[p2] + c;
    return num("g4-place-million", `Write ${a}×${fmt(POW10[p1])} + ${b}×${fmt(POW10[p2])} + ${c} in standard form.`, n,
      [[a * POW10[p1] + b * POW10[p2 + 1] + c, `That places the ${b} one column too far left.`], [Number(`${a}${b}${c}`), `Writing only the nonzero digits removes the zero placeholders needed between their places.`]],
      `Place each digit in its stated place and fill every skipped place with zero.`);
  },
  pvNumberFormsMcq: (rand, band) => {
    const p = bandInt(rand, band, [3, 4], [4, 5], [5, 6]), a = pick(rand, 2, 9), b = pick(rand, 1, 9), n = a * POW10[p] + b * POW10[p - 2];
    return mcq(rand, "g4-place-million", `Which expanded form matches ${fmt(n)}?`,
      [`${a}×${fmt(POW10[p])} + ${b}×${fmt(POW10[p - 2])}`, `Correct — each nonzero digit is multiplied by the value of its place.`],
      [[`${a}×${fmt(POW10[p - 1])} + ${b}×${fmt(POW10[p - 2])}`, `That shifts the leading digit one place to the right.`], [`${a + b}×${fmt(POW10[p])}`, `Combining the digits into one coefficient changes the lower-place contribution.`], [`${a} + ${b}`, `Expanded form must preserve each digit's place value, not add the digits alone.`]]);
  },
  pvReadingBigNumeric: (rand, band) => {
    const p = bandInt(rand, band, [3, 4], [4, 5], [5, 6]), digit = pick(rand, 1, 9), n = digit * POW10[p] + pick(rand, 0, POW10[p] - 1);
    return num("g4-place-million", `Read ${fmt(n)} by place value. What digit begins the ${p >= 6 ? "millions" : "thousands"} period?`, digit,
      [[digit * POW10[p], `That reports the digit's full value rather than the leading digit of the named period.`], [digit === 1 ? 2 : digit - 1, `That is not the leading digit shown in the named period.`]],
      `Separate the number into three-digit periods and read the first digit of the requested period.`);
  },
  pvReadingBigMcq: (rand) => {
    const cases = [
      ["405,018", "four hundred five thousand eighteen", "four hundred fifty thousand eighteen", "four hundred five thousand one hundred eight"],
      ["720,304", "seven hundred twenty thousand three hundred four", "seventy-two thousand three hundred four", "seven hundred two thousand thirty-four"],
      ["1,006,090", "one million six thousand ninety", "one million sixty thousand nine", "one hundred six thousand ninety"],
    ] as const;
    const [n, right, w1, w2] = choose(rand, cases);
    return mcq(rand, "g4-place-million", `Which word form reads ${n}?`, [right, `Correct — the zero placeholders are respected while each three-digit period is read in order.`],
      [[w1, `That moves a nonzero digit into a different place and changes the number's value.`], [w2, `That omits or relocates a zero placeholder in one of the periods.`], [n.replace(/,/g, " "), `Spacing the digits does not produce a mathematical word form.`]]);
  },
  pvCommaPeriodsNumeric: (rand, band) => {
    const periods = bandInt(rand, band, [2, 4], [2, 5], [2, 5]);
    const prompt = pick(rand, 0, 1) === 0
      ? `A whole number is written with ${periods} three-digit periods. How many comma separators appear between the periods?`
      : `A number's digits are grouped into ${periods} three-digit periods. How many commas separate those periods?`;
    return num("g4-place-million", prompt, periods - 1,
      [[periods, `There is one fewer separator than periods because commas sit only between adjacent periods.`], [periods * 3, `That counts digits in the periods rather than comma separators.`]],
      `A chain of ${periods} periods has ${periods - 1} gaps between them.`);
  },
  pvCommaPeriodsMcq: (rand) => mcq(rand, "g4-place-million", `What do commas separate in a large whole number?`,
    ["Three-digit periods such as ones, thousands, and millions", `Correct — commas group digits into periods that are read from left to right.`],
    [["Every individual digit, no matter its place value", `Commas do not appear between each digit; each period contains up to three digits.`], ["Only the even-numbered and odd-numbered digits", `Parity does not determine comma placement.`], ["The numerator and denominator of a written fraction", `That describes fraction notation rather than whole-number periods.`]]),
  pvRoundingNumeric: (rand, band) => {
    const place = choose(rand, band === "support" ? [10, 100, 1000] : band === "stretch" ? [1000, 10000, 100000] : [100, 1000, 10000]);
    const n = bandInt(rand, band, [120, 9999], [1200, 99999], [12000, 999999]), ans = roundTo(n, place);
    return num("g4-place-million", `Round ${fmt(n)} to the nearest ${fmt(place)}.`, ans,
      [[Math.floor(n / place) * place, `That always rounds down and ignores whether the next digit is 5 or greater.`], [Math.ceil(n / place) * place, `That always rounds up and ignores whether the next digit is less than 5.`]],
      `Locate the ${fmt(place)} place and inspect the digit immediately to its right.`);
  },
  pvRoundingMcq: (rand) => {
    const base = pick(rand, 12, 89) * 1000, n = base + choose(rand, [240, 490, 510, 760]), ans = roundTo(n, 1000);
    return mcq(rand, "g4-place-million", `Which is ${fmt(n)} rounded to the nearest thousand?`, [fmt(ans), `Correct — the hundreds digit determines whether the thousands digit stays or increases.`],
      ([ [fmt(Math.floor(n / 1000) * 1000), `That result is only correct when the hundreds digit is below 5.`], [fmt(Math.ceil(n / 1000) * 1000), `That result is only correct when the hundreds digit is 5 or greater.`], [fmt(n), `That is the unrounded number rather than a nearest-thousand estimate.`] ] as Array<[string, string]>).filter(([x],i,a)=>a.findIndex(y=>y[0]===x)===i && x!==fmt(ans)));
  },
  pvFrontEndNumeric: (rand, band) => {
    const place = band === "stretch" ? 10000 : 1000, a = bandInt(rand, band, [12, 49], [25, 79], [40, 95]) * place + pick(rand, 0, place - 1), b = bandInt(rand, band, [11, 39], [20, 69], [30, 89]) * place + pick(rand, 0, place - 1);
    const ans = Math.floor(a / place) * place + Math.floor(b / place) * place;
    return num("g4-place-million", `Use front-end estimation at the ${fmt(place)} place for ${fmt(a)} + ${fmt(b)}. What estimate do the leading parts give?`, ans,
      [[a + b, `That is the exact sum, not the front-end estimate made from the leading place values.`], [roundTo(a, place) + roundTo(b, place), `That rounds both numbers rather than keeping only their front-end place values.`]],
      `Keep only the leading ${fmt(place)} parts of both numbers and add those parts.`);
  },
  pvAddColumn: (rand, band) => {
    const digits = band === "stretch" ? 6 : band === "support" ? 4 : 5;
    const lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
    let a = pick(rand, lo, hi), b = pick(rand, lo, hi);
    while (a + b > 999999 || columnCalcReachable("add", a, b).size < 2) { a = pick(rand, lo, hi); b = pick(rand, lo, hi); }
    return column("g4-place-million", `Add ${fmt(a)} + ${fmt(b)} using the column algorithm and commit every carry.`, "add", a, b);
  },
  pvAddNumeric: (rand, band) => {
    const a = bandInt(rand, band, [1200, 9999], [12000, 99999], [120000, 499999]), b = bandInt(rand, band, [1200, 9999], [12000, 99999], [120000, 499999]), ans = a + b;
    return num("g4-place-million", `Compute ${fmt(a)} + ${fmt(b)}.`, ans,
      [[noCarrySum(a, b), `That resolves each column without carrying tens into the next place.`], [ans - 1000, `That result is short by one place-value carry. Recheck the first column whose sum is at least 10.`]],
      `Add from the ones place leftward and carry every group of ten.`);
  },
  pvAddMcq: (rand) => mcq(rand, "g4-place-million", `A column sum is 16. What should be written and carried?`,
    ["Write 6 in the column and carry 1 to the next place left.", `Correct — 16 is 1 ten and 6 ones in the current place-value unit.`],
    [["Write the full 16 in the same single column.", `A single column holds one digit; the ten must be traded into the next place.`], ["Write 1 in the column and carry the 6 instead.", `The ones digit stays in the current column and the tens digit is carried.`], ["Write 6 in the column and discard the carried 1.", `Discarding the carried ten changes the total value of the sum.`]]),
  pvSubtractColumn: (rand, band) => {
    const digits = band === "stretch" ? 6 : band === "support" ? 4 : 5, lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
    let a = pick(rand, lo, hi), b = pick(rand, lo, a - 1);
    while (columnCalcReachable("subtract", a, b).size < 2) { a = pick(rand, lo, hi); b = pick(rand, lo, a - 1); }
    return column("g4-place-million", `Subtract ${fmt(a)} − ${fmt(b)} using the column algorithm and make every needed borrow.`, "subtract", a, b);
  },
  pvSubtractNumeric: (rand, band) => {
    const b = bandInt(rand, band, [1200, 7000], [12000, 70000], [120000, 400000]), ans = bandInt(rand, band, [1000, 8000], [10000, 90000], [100000, 400000]), a = b + ans;
    return num("g4-place-million", `Compute ${fmt(a)} − ${fmt(b)}.`, ans,
      [[Math.abs(Number(String(a).split("").map((x, i) => Math.abs(Number(x) - Number(String(b).padStart(String(a).length,"0")[i]))).join(""))), `That subtracts the smaller digit from the larger in each column and ignores which number is on top.`], [ans + 1000, `That result misses a borrow in one of the higher place-value columns.`]],
      `Subtract right to left, borrowing from the next nonzero place whenever the top digit is too small.`);
  },
  pvSubtractMcq: (rand) => mcq(rand, "g4-place-million", `When the top digit in a subtraction column is too small, what should happen?`,
    ["Break one unit from the next place left into ten units of the current place.", `Correct — a borrow is a place-value exchange that preserves the total number.`],
    [["Subtract the smaller digit from the larger digit regardless of row.", `That changes the meaning of subtraction and produces the classic small-from-large error.`], ["Add the two digits instead.", `Addition does not resolve a subtraction underflow.`], ["Ignore the column and move left.", `Every place contributes to the final difference and must be resolved.`]]),
  pvAcrossZerosColumn: (rand, band) => {
    const lead = band === "stretch" ? pick(rand, 4, 9) * 100000 : pick(rand, 4, 9) * 10000;
    const a = lead + pick(rand, 1, 9), b = pick(rand, Math.floor(lead / 5), lead - 1);
    return column("g4-place-million", `Subtract ${fmt(a)} − ${fmt(b)}. Borrow across the zero chain one place at a time.`, "subtract", a, b);
  },
  pvAcrossZerosNumeric: (rand, band) => {
    const lead = band === "stretch" ? pick(rand, 4, 9) * 100000 : pick(rand, 4, 9) * 10000, a = lead + pick(rand, 1, 9), b = pick(rand, Math.floor(lead / 5), lead - 1), ans = a - b;
    return num("g4-place-million", `Compute ${fmt(a)} − ${fmt(b)}.`, ans,
      [[ans + 1000, `That leaves one zero in the borrow chain unchanged. Every crossed zero must become 9 after the exchange passes through.`], [Math.abs(a - b) + 10000, `That result reflects an incomplete borrow from the leading nonzero digit.`]],
      `Reach left to the first nonzero digit, reduce it by 1, and turn every crossed zero into 9.`);
  },
  pvAcrossZerosMcq: (rand) => mcq(rand, "g4-place-million", `A borrow passes through two zeros. What happens to those crossed zeros?`,
    ["Each becomes 9 after passing one unit to the place on its right.", `Correct — the borrowed unit becomes ten in the first zero place, which passes one on and keeps nine.`],
    [["Each of the crossed zeros simply stays 0.", `A zero cannot pass value to the right without first receiving and retaining part of the borrowed unit.`], ["Each of the crossed zeros becomes 10 permanently.", `Each intermediate zero passes one unit onward, leaving 9 rather than 10.`], ["Each of the crossed zeros becomes 1 instead.", `The exchange creates ten units in a place, not one.`]]),
  pvCompareBigMcq: (rand) => {
    const a = pick(rand, 100000, 999999), delta = pick(rand, 100, 9000), b = a + delta;
    return mcq(rand, "g4-place-million", `Which number is greater: ${fmt(a)} or ${fmt(b)}?`, [fmt(b), `Correct — comparing from the greatest place, the first differing digit favors ${fmt(b)}.`],
      [[fmt(a), `At the first place where the digits differ, ${fmt(a)} has the smaller digit.`], ["They are equal", `The numbers differ by ${fmt(delta)}, so they cannot be equal.`], ["The one with fewer zeros", `Zero count is not a reliable comparison rule; place-by-place value is.`]]);
  },
  pvCompareBigNumeric: (rand, band) => {
    const small = bandInt(rand, band, [12000, 90000], [80000, 400000], [150000, 700000]), gap = choose(rand, [1000, 10000, 50000]), large = small + gap;
    return num("g4-place-million", `How much greater is ${fmt(large)} than ${fmt(small)}?`, gap,
      [[large, `That is the larger number itself, not the difference between the two numbers.`], [small, `That is the smaller number, not how far apart the numbers are.`]],
      `Subtract the smaller number from the larger number.`);
  },
  pvOrderBigMcq: (rand) => {
    const base = pick(rand, 120, 850) * 1000, xs = [base + 120, base + 210, base + 102, base + 201].sort((a,b)=>a-b);
    return mcq(rand, "g4-place-million", `Among ${shuffled(rand, xs).map(fmt).join(", ")}, which is second greatest?`, [fmt(xs[2]), `Correct — sorting place by place puts ${fmt(xs[3])} greatest and ${fmt(xs[2])} next.`],
      [[fmt(xs[3]), `That is the greatest number, not the second greatest.`], [fmt(xs[1]), `That number is below the two greatest values.`], [fmt(xs[0]), `That is the least number in the set.`]]);
  },
  pvOrderBigNumeric: (rand, band) => {
    const low = bandInt(rand, band, [12000, 60000], [80000, 300000], [150000, 600000]), gaps = [pick(rand, 100, 900), pick(rand, 1000, 9000), pick(rand, 10000, 50000)];
    const xs = [low, low + gaps[0], low + gaps[1], low + gaps[2]].sort((a,b)=>a-b);
    return num("g4-place-million", `Order ${shuffled(rand, xs).map(fmt).join(", ")} from least to greatest. What is the difference between the greatest and least?`, xs[3] - xs[0],
      [[xs[3], `That is the greatest number alone, not its distance above the least number.`], [xs[2] - xs[0], `That uses the second-greatest number instead of the greatest endpoint.`]],
      `Identify the least and greatest values, then subtract least from greatest.`);
  },
};

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
      [[k, `That is the count of shaded columns, and a count of parts is a whole number. Each column is one tenth of the square, so ${countN(k, "column")} is ${countN(k, "tenth")}, written with the ${k} in the tenths place.`],
       [k / 100, `That puts the ${k} in the hundredths place, which would mean ${countN(k, "cell")} of a hundred-cell grid. This square has only 10 columns, so each shaded column is a tenth of the whole.`]],
      `Each column is one tenth of the square. Count the shaded columns and write that count in the tenths place, directly after the decimal point.`);
  },
  dTenthsFractionMcq: (rand) => {
    const k = pick(rand, 1, 9);
    return mcq(rand, "g4-decimals", `Which fraction names the same amount as ${dec1(k)}?`,
      [`${k}/10`, `Correct — the digit ${k} sits in the tenths place, so ${dec1(k)} means ${k} of 10 equal parts.`],
      [[`${k}/100`, `A denominator of 100 would mean ${countN(k, "hundredth")}, written ${dec2(k)}. The digit ${k} in ${dec1(k)} sits one place higher — in the tenths place.`],
       [`10/${k}`, `That fraction has the part count and the number of equal pieces swapped. The decimal names ${countN(k, "piece")} out of 10 equal pieces, so ${k} belongs on top.`],
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
    const traps: Array<[number, string]> = [[tens, `That shades only the tenths digit's worth of single cells. In ${dec2(n)} the ${tens} sits in the tenths place, so it is worth ${countN(tens, "full column")} — ${countN(tens * 10, "cell")} — before the hundredths digit adds any more.`]];
    if (swap !== n) traps.push([swap, `That count swaps the two digits of ${dec2(n)}. Read the decimal place by place: the first digit after the point counts full columns of ten, and the second counts single cells.`]);
    return num("g4-decimals", `A hundredths grid has 100 equal cells. How many cells must be shaded to show ${dec2(n)}?`, n, traps,
      `Each full column of the grid is one tenth — ten cells — and each single cell is one hundredth. Turn each digit of the decimal into cells and add the two counts.`);
  },
  dTenthToHundredthNumeric: (rand) => {
    const k = pick(rand, 1, 9);
    return num("g4-decimals", `${dec1(k)} = ?/100. What numerator makes the fraction name the same amount?`, k * 10,
      [[k, `That copies the tenths count without rescaling it. Each tenth is 10 hundredths, so ${countN(k, "tenth")} covers ${k} × 10 hundredths of the same whole.`],
       [k * 100, `That multiplies by 100 as if ${dec1(k)} were ${countN(k, "whole unit")}. It is ${countN(k, "tenth")}, and each tenth contains 10 hundredths, so multiply the count by 10.`]],
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
        [`${countN(b, "hundredth")}`, `Correct — the ${b} sits two places after the point, in the hundredths place, so ${dec2(b)} names ${countN(b, "hundredth")}.`],
        [[`${countN(b, "tenth")}`, `${countN(b, "tenth")} would be written ${dec1(b)}, with the ${b} directly after the point. In ${dec2(b)} a zero holds the tenths place, pushing the ${b} into the hundredths place.`],
         [`${countN(b, "one")}`, `${countN(b, "one")} would be the whole number ${b}, with no decimal point needed. The digits after the point name parts of one whole, not whole units.`],
         [`${countN(b * 10, "hundredth")}`, `${countN(b * 10, "hundredth")} is ${dec2(b * 10)} — a full ${b}-column amount. The zero in the tenths place of ${dec2(b)} means there are no full columns, only ${countN(b, "single hundredth")}.`]]);
    }
    // Multiples of 10 are excluded: 0.70 is the trailing-zero lesson's object, not read-aloud's.
    let n = pick(rand, 11, 99);
    if (n % 10 === 0) n += 1;
    const tens = Math.floor(n / 10);
    return mcq(rand, "g4-decimals", `How is the decimal ${dec2(n)} read as a number name?`,
      [`${countN(n, "hundredth")}`, `Correct — the last digit of ${dec2(n)} lands in the hundredths place, so the whole two-digit count ${n} names hundredths.`],
      [[`${countN(n, "tenth")}`, `${countN(n, "tenth")} would be ${(n / 10).toFixed(1)} — more than one whole. The two digits of ${dec2(n)} end in the hundredths place, so the count names hundredths.`],
       [`${countN(tens, "hundredth")}`, `That reads only the first digit after the point. The name uses the full count: both decimal digits of ${dec2(n)} together name ${countN(n, "hundredth")}.`],
       [`${countN(n, "one")}`, `${countN(n, "one")} would be the whole number ${n}. Digits after the decimal point count parts of a single whole, not whole units.`]]);
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
        [[k, `That drops the denominator. The fraction names ${countN(k, "part")} out of 10, so its decimal puts the ${k} in the tenths place — a value less than one whole.`],
         [k / 100, `That writes ${k} in the hundredths place, which names ${k}/100. Tenths sit one place higher: directly after the decimal point.`]],
        `A denominator of 10 means tenths. Write the numerator in the tenths place, directly after the decimal point.`);
    }
    const n = band === "support" ? pick(rand, 2, 9) : pick(rand, 11, 99);
    return num("g4-decimals", `Write the fraction ${n}/100 as a decimal.`, n / 100,
      [[n, `That drops the denominator. The fraction names ${countN(n, "part")} out of 100, so its decimal must end in the hundredths place — a value less than one whole.`],
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
      const h1 = pick(rand, 1, 9);
      let h2 = pick(rand, 1, 9);
      if (h1 === h2) h2 = (h2 % 9) + 1;
      return decCompare(`Compare the two decimals: ${dec2(t * 10 + h1)} ? ${dec2(t * 10 + h2)}. Choose the relation that holds.`, dec2(t * 10 + h1), dec2(t * 10 + h2));
    }
    const a = pick(rand, 11, 99);
    let b = pick(rand, 11, 99);
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

function family(tag: string, label: string, forms: readonly string[], handlers: Record<string, FormHandler>): VariantGen {
  return {
    tag,
    label,
    forms: forms as unknown as readonly never[],
    gen: (rand, band = "core", form = "default") => {
      const key = String(form) === "default" ? forms[0] : String(form);
      const handler = handlers[key];
      if (!handler) throw new Error(`unknown ${tag} form ${key}`);
      return handler(rand, band);
    },
  } as VariantGen;
}

export const G4_GENERATORS: readonly VariantGen[] = [
  family("g4-fractions", "Grade 4 fraction equivalence, comparison, addition, mixed numbers, and scaling", FRACTION_FORMS, fractionHandlers),
  family("g4-decimals", "Grade 4 decimal tenths and hundredths: notation, renaming, comparison, ordering, money, and measure", DECIMAL_FORMS, decimalHandlers),
  family("g4-lines-angles", "Grade 4 geometric language, classification, line relationships, and symmetry", GEOMETRY_FORMS, geometryHandlers),
  family("g4-measure", "Grade 4 perimeter, angle measurement, fractional measurement, and line plots", MEASURE_FORMS, measureHandlers),
  family("g4-multiply", "Grade 4 multiplicative comparison, factors, products, division, remainders, and patterns", MULTIPLY_FORMS, multiplyHandlers),
  family("g4-place-million", "Grade 4 place value, number forms, rounding, algorithms, comparison, and ordering", PLACE_FORMS, placeHandlers),
];

export const G4_FORM_SURFACES: Readonly<Record<string, string>> = {
  ...Object.fromEntries(FRACTION_FORMS.map((f) => [f, f.endsWith("Mcq") ? "mcq" : f.endsWith("Rational") ? "rationalCompare" : f.endsWith("Mixed") ? "mixedRegroup" : "numeric"])),
  ...Object.fromEntries(DECIMAL_FORMS.map((f) => [f, f.endsWith("Mcq") ? "mcq" : f.endsWith("Rational") ? "rationalCompare" : f.endsWith("Drag") ? "dragOrder" : "numeric"])),
  ...Object.fromEntries(GEOMETRY_FORMS.map((f) => [f, f.endsWith("Mcq") ? "mcq" : "numeric"])),
  ...Object.fromEntries(MEASURE_FORMS.map((f) => [f, f.endsWith("Mcq") ? "mcq" : "numeric"])),
  ...Object.fromEntries(MULTIPLY_FORMS.map((f) => [f, f.endsWith("Mcq") ? "mcq" : "numeric"])),
  ...Object.fromEntries(PLACE_FORMS.map((f) => [f, f.endsWith("Mcq") ? "mcq" : f.endsWith("Column") ? "columnCalc" : "numeric"])),
};
