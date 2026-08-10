// S186: the fluency pair — Grade 3 multiplication and division fact-recall generators.
//
// Unlike every prior course, these are not teaching a strategy or a concept; they are giving
// spaced, repeated exposure to a bounded set of atomic facts. Each drill form tags its returned
// Variant with `params.factFamily` — the canonical commutative key from factFluency.ts (e.g.
// "7x8" for the 7×8/8×7/56÷7/56÷8 relationship) — so the lesson-player's item-grain evidence
// layer (playerStore.ts finalize(), Profile.factItems, sync.ts mergeFactItems) can accumulate
// mastery of the FACT regardless of which lesson or which of its four surface forms exercised it.
//
// `params` is the existing, already-plumbed extensibility point on the canonical Variant
// interface (see variants.ts) built exactly for this: structured values the generator already
// computed, carried forward without touching `widget` or `answer` — so every existing seeded-
// output guarantee holds whether or not a generator supplies it.
//
// The authored lesson JSON does NOT get its concrete numbers by calling these generators (same
// convention as every prior course-factory: the factory computes its own concrete, asserted
// content directly). These generators exist for (a) the review/practice regeneration surface,
// and (b) the gate sweep that proves every declared form is well-formed, self-grading, and
// independently solvable across many seeds and bands — the same proof every other generator
// family in this file carries.

import type { Band } from "./difficulty";
import { factFamilyKey, factsForTable, fullFactUniverse, parseFactFamily } from "./factFluency";

type Variant = { tag: string; widget: any; answer: any; params?: Record<string, number | string> };
type VariantGen = { tag: string; label: string; forms?: readonly never[]; gen: (rand: () => number, band?: Band, form?: string) => Variant };
type Rand = () => number;
type Handler = (r: Rand, b: Band) => Variant;

const pick = (r: Rand, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const choose = <T,>(r: Rand, xs: readonly T[]) => xs[pick(r, 0, xs.length - 1)];
function shuffle<T>(r: Rand, xs: readonly T[]) { const a = [...xs]; for (let i = a.length - 1; i; i--) { const j = pick(r, 0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function safe(answer: number, vals: Array<[number, string]>) {
  const seen = new Set([answer]);
  const out: Array<[number, string]> = [];
  for (const x of vals) if (Number.isFinite(x[0]) && !seen.has(x[0])) { seen.add(x[0]); out.push(x); }
  for (let d = 1; out.length < 2; d++) if (!seen.has(answer + d)) { seen.add(answer + d); out.push([answer + d, `That is ${d} more than the correct value. Recompute one step at a time.`]); }
  return out.slice(0, 3);
}
const num = (
  tag: string, prompt: string, answer: number, errs: Array<[number, string]>,
  success?: string, params?: Record<string, number | string>
): Variant => ({
  tag, answer,
  widget: {
    type: "numeric", prompt, answer, tolerance: 0, unit: "",
    commonErrors: safe(answer, errs).map(([value, feedback]) => ({ value, feedback })),
    fallbackFeedback: "Recompute the fact one step at a time rather than guessing.",
    successFeedback: success ?? `Correct — the answer is ${answer}.`
  },
  ...(params ? { params } : {})
});
const mcq = (
  r: Rand, tag: string, prompt: string, correct: [string, string], wrong: Array<[string, string]>,
  params?: Record<string, number | string>
): Variant => {
  const seen = new Set([correct[0]]);
  const ws = wrong.filter((x) => !seen.has(x[0]) && seen.add(x[0]));
  const options = shuffle(r, [
    { label: correct[0], feedback: correct[1], correct: true },
    ...ws.slice(0, 3).map(([label, feedback]) => ({ label, feedback, correct: false }))
  ]).map((o, i) => ({ id: `o${i}`, ...o }));
  return { tag, answer: options.find((o) => o.correct)!.id, widget: { type: "mcq", prompt, options }, ...(params ? { params } : {}) };
};

/** The two factors read out of a canonical family key, always in the order a caller wants them
 * displayed (e.g. "the table factor first"). Both orders round-trip through the same family. */
function orient(key: string, first: number): [number, number] {
  const { lo, hi } = parseFactFamily(key);
  return lo === first ? [lo, hi] : [hi, lo];
}

/* ============================================================ g3-mult-fluency (18 forms) */

const M = "g3-mult-fluency";
const multHandlers: Record<string, Handler> = {};

// ×2 .. ×10: one handler per table, each drawing its OWN pool — nine distinct forms, one per
// "The ×N Facts" lesson, closures capturing the table number.
for (let t = 2; t <= 10; t++) {
  const pool = factsForTable(t, 0, 10);
  multHandlers[`MultTable${t}Numeric`] = (r) => {
    const key = choose(r, pool);
    const { product } = parseFactFamily(key);
    const [a, b] = orient(key, t);
    return num(
      M, `${a} × ${b} = ?`, product,
      [[product - a, `That is ${a} short of the product — you are missing one whole group of ${a}.`],
       [a + b, `That adds the two factors instead of multiplying them.`]],
      `Correct — ${a} groups of ${b} make ${product}.`,
      { factFamily: key, table: t }
    );
  };
}

multHandlers.MultSquaresNumeric = (r) => {
  const n = pick(r, 2, 10);
  const key = factFamilyKey(n, n);
  return num(
    M, `${n} × ${n} = ?`, n * n,
    [[n * (n - 1), `That is one group of ${n} short — a square needs exactly ${n} groups of ${n}.`],
     [n * 2, `That doubles ${n} instead of multiplying it by itself.`]],
    `Correct — ${n} squared is ${n * n}.`,
    { factFamily: key }
  );
};

// "The facts that stick": both factors in {6,7,8,9} — the classic no-easy-pattern block (past
// the ×0/×1/×2/×5/×10 shortcuts and past the ×3/×4 skip-count range).
const hardPool = fullFactUniverse(6, 9);
multHandlers.MultHardFactsNumeric = (r) => {
  const key = choose(r, hardPool);
  const { lo, hi: hiF, product } = parseFactFamily(key);
  return num(
    M, `${lo} × ${hiF} = ?`, product,
    [[product - lo, `That is one group of ${lo} short.`], [product + hiF, `That adds an extra group of ${hiF} instead of stopping at ${lo} groups.`]],
    `Correct — ${lo} × ${hiF} = ${product}. This is one of the facts worth memorizing directly rather than deriving each time.`,
    { factFamily: key }
  );
};

// "Using a fact you know": derive a harder fact from an easier neighbor by one more group.
// known = n×k (n small/easy), target = (n+1)×k, answer = known + k.
multHandlers.MultDeriveNumeric = (r) => {
  const k = pick(r, 6, 9);
  const n = pick(r, 4, 8);
  const known = n * k;
  const target = (n + 1) * k;
  const key = factFamilyKey(n + 1, k);
  return num(
    M, `You know ${n} × ${k} = ${known}. Use it to find ${n + 1} × ${k}.`, target,
    [[known, `That repeats the known fact instead of using it — add one more group of ${k}.`],
     [known + n, `That adds ${n}, but one more GROUP means adding ${k}, the size of each group.`]],
    `Correct — one more group of ${k} makes ${known} + ${k} = ${target}.`,
    { factFamily: key }
  );
};

const mixedSmallPool = fullFactUniverse(0, 5);
multHandlers.MultMixedSmallNumeric = (r) => {
  const key = choose(r, mixedSmallPool);
  const { lo, hi: hiF, product } = parseFactFamily(key);
  const [a, b] = r() < 0.5 ? [lo, hiF] : [hiF, lo];
  return num(M, `${a} × ${b} = ?`, product,
    [[product - a, `That is one group of ${a} short.`], [a + b, `That adds instead of multiplying.`]],
    `Correct — ${a} × ${b} = ${product}.`, { factFamily: key });
};

const mixedLargePool = fullFactUniverse(0, 9);
multHandlers.MultMixedLargeNumeric = (r) => {
  const key = choose(r, mixedLargePool);
  const { lo, hi: hiF, product } = parseFactFamily(key);
  const [a, b] = r() < 0.5 ? [lo, hiF] : [hiF, lo];
  return num(M, `${a} × ${b} = ?`, product,
    [[product - a, `That is one group of ${a} short.`], [product + b, `That adds an extra group of ${b}.`]],
    `Correct — ${a} × ${b} = ${product}.`, { factFamily: key });
};

// Same pool as mixed-large — "recall speed" is a framing distinction (the lesson's own concept
// steps carry the automaticity goal), not a different fact pool or a different grading rule:
// grading stays untimed and deterministic, exactly like every other check in this app.
multHandlers.MultRecallSpeedNumeric = (r) => {
  const key = choose(r, mixedLargePool);
  const { lo, hi: hiF, product } = parseFactFamily(key);
  const [a, b] = r() < 0.5 ? [lo, hiF] : [hiF, lo];
  return num(M, `Answer fast: ${a} × ${b} = ?`, product,
    [[product - a, `That is one group of ${a} short.`], [product + b, `That adds an extra group of ${b}.`]],
    `Correct — ${a} × ${b} = ${product}.`, { factFamily: key });
};

const missingFactorPool = fullFactUniverse(2, 10);
multHandlers.MultMissingFactorNumeric = (r) => {
  const key = choose(r, missingFactorPool);
  const { lo, hi: hiF, product } = parseFactFamily(key);
  const [known, other] = r() < 0.5 ? [lo, hiF] : [hiF, lo];
  return num(M, `${known} × ? = ${product}`, other,
    [[product, `That repeats the product instead of the missing factor.`],
     [product - known, `That subtracts instead of dividing — find how many groups of ${known} make ${product}.`]],
    `Correct — ${known} × ${other} = ${product}.`, { factFamily: key });
};

multHandlers.MultFactFamilyNumeric = (r) => {
  const key = choose(r, fullFactUniverse(2, 9));
  const { lo, hi: hiF, product } = parseFactFamily(key);
  const askDiv = r() < 0.5;
  if (askDiv) {
    const divisor = r() < 0.5 ? lo : hiF;
    const quotient = product / divisor;
    return num(M, `Fact family ${lo}, ${hiF}, ${product}: knowing ${lo} × ${hiF} = ${product}, what is ${product} ÷ ${divisor}?`, quotient,
      [[product, `That repeats the product instead of dividing it by ${divisor}.`], [divisor, `That repeats the divisor instead of the quotient.`]],
      `Correct — ${product} ÷ ${divisor} = ${quotient}, the same family as ${lo} × ${hiF}.`, { factFamily: key });
  }
  return num(M, `Fact family ${lo}, ${hiF}, ${product}: knowing ${lo} × ${hiF} = ${product}, what is ${hiF} × ${lo}?`, product,
    [[hiF + lo, `That adds the factors instead of multiplying — the product is the same either order.`]],
    `Correct — multiplication commutes: ${hiF} × ${lo} = ${lo} × ${hiF} = ${product}.`, { factFamily: key });
};

const wholeTablePool = fullFactUniverse(0, 10);
multHandlers.MultWholeTableNumeric = (r) => {
  const key = choose(r, wholeTablePool);
  const { lo, hi: hiF, product } = parseFactFamily(key);
  const [a, b] = r() < 0.5 ? [lo, hiF] : [hiF, lo];
  return num(M, `${a} × ${b} = ?`, product,
    [[product - a, `That is one group of ${a} short.`], [product + b, `That adds an extra group of ${b}.`]],
    `Correct — ${a} × ${b} = ${product}.`, { factFamily: key });
};

/* ============================================================= g3-div-fluency (12 forms) */

const Dv = "g3-div-fluency";
const divHandlers: Record<string, Handler> = {};

function divBy(divisor: number, r: Rand): { key: string; quotient: number; product: number } {
  const q = pick(r, 1, 10);
  const product = divisor * q;
  return { key: factFamilyKey(divisor, q), quotient: q, product };
}

divHandlers.DivBy2Numeric = (r) => {
  const { key, quotient, product } = divBy(2, r);
  return num(Dv, `${product} ÷ 2 = ?`, quotient,
    [[product, `That repeats the total instead of dividing it.`], [quotient + 1, `That quotient is one too many — ${quotient + 1} × 2 = ${(quotient + 1) * 2}, which overshoots ${product}.`]],
    `Correct — ${product} ÷ 2 = ${quotient}, since ${quotient} × 2 = ${product}.`, { factFamily: key });
};
divHandlers.DivBy3Numeric = (r) => {
  const { key, quotient, product } = divBy(3, r);
  return num(Dv, `${product} ÷ 3 = ?`, quotient,
    [[product, `That repeats the total instead of dividing it.`], [quotient + 1, `That quotient is one too many — ${quotient + 1} × 3 = ${(quotient + 1) * 3}, which overshoots ${product}.`]],
    `Correct — ${product} ÷ 3 = ${quotient}, since ${quotient} × 3 = ${product}.`, { factFamily: key });
};
divHandlers.DivBy45Numeric = (r) => {
  const d = choose(r, [4, 5] as const);
  const { key, quotient, product } = divBy(d, r);
  return num(Dv, `${product} ÷ ${d} = ?`, quotient,
    [[product, `That repeats the total instead of dividing it.`], [quotient + 1, `That quotient is one too many — ${quotient + 1} × ${d} = ${(quotient + 1) * d}, which overshoots ${product}.`]],
    `Correct — ${product} ÷ ${d} = ${quotient}, since ${quotient} × ${d} = ${product}.`, { factFamily: key });
};
divHandlers.DivBy67Numeric = (r) => {
  const d = choose(r, [6, 7] as const);
  const { key, quotient, product } = divBy(d, r);
  return num(Dv, `${product} ÷ ${d} = ?`, quotient,
    [[product, `That repeats the total instead of dividing it.`], [quotient + 1, `That quotient is one too many — ${quotient + 1} × ${d} = ${(quotient + 1) * d}, which overshoots ${product}.`]],
    `Correct — ${product} ÷ ${d} = ${quotient}, since ${quotient} × ${d} = ${product}.`, { factFamily: key });
};
divHandlers.DivBy89Numeric = (r) => {
  const d = choose(r, [8, 9] as const);
  const { key, quotient, product } = divBy(d, r);
  return num(Dv, `${product} ÷ ${d} = ?`, quotient,
    [[product, `That repeats the total instead of dividing it.`], [quotient + 1, `That quotient is one too many — ${quotient + 1} × ${d} = ${(quotient + 1) * d}, which overshoots ${product}.`]],
    `Correct — ${product} ÷ ${d} = ${quotient}, since ${quotient} × ${d} = ${product}.`, { factFamily: key });
};
divHandlers.DivBy10Numeric = (r) => {
  const { key, quotient, product } = divBy(10, r);
  return num(Dv, `${product} ÷ 10 = ?`, quotient,
    [[product, `That repeats the total instead of dividing it.`], [quotient + 1, `That quotient is one too many — ${quotient + 1} × 10 = ${(quotient + 1) * 10}, which overshoots ${product}.`]],
    `Correct — ${product} ÷ 10 = ${quotient}, since ${quotient} × 10 = ${product}.`, { factFamily: key });
};

divHandlers.DivThinkMultNumeric = (r) => {
  const key = choose(r, fullFactUniverse(2, 9));
  const { lo, hi: hiF, product } = parseFactFamily(key);
  const [divisor, quotient] = r() < 0.5 ? [lo, hiF] : [hiF, lo];
  return num(Dv, `${product} ÷ ${divisor} = ? Think: ${divisor} × ? = ${product}.`, quotient,
    [[product, `That repeats the total. Think the multiplication fact: ${divisor} × ? = ${product}.`],
     [product - divisor, `That subtracts one group instead of finding how many groups of ${divisor} make ${product}.`]],
    `Correct — since ${divisor} × ${quotient} = ${product}, ${product} ÷ ${divisor} = ${quotient}.`, { factFamily: key });
};

divHandlers.DivMissingNumeric = (r) => {
  const key = choose(r, fullFactUniverse(2, 9));
  const { lo, hi: hiF, product } = parseFactFamily(key);
  const [a, b] = r() < 0.5 ? [lo, hiF] : [hiF, lo];
  if (r() < 0.5) {
    return num(Dv, `${a} × ? = ${product}`, b,
      [[product, `That repeats the product instead of the missing factor.`], [product - a, `That subtracts instead of dividing by ${a}.`]],
      `Correct — ${a} × ${b} = ${product}.`, { factFamily: key });
  }
  return num(Dv, `${product} ÷ ${a} = ?`, b,
    [[product, `That repeats the total instead of dividing it.`], [a, `That repeats the divisor instead of the quotient.`]],
    `Correct — ${product} ÷ ${a} = ${b}.`, { factFamily: key });
};

divHandlers.DivSpecialNumeric = (r) => {
  const n = pick(r, 2, 12);
  if (r() < 0.5) {
    return num(Dv, `${n} ÷ 1 = ?`, n,
      [[1, `Dividing by 1 leaves the number unchanged — it does not become 1.`], [n - 1, `Dividing by 1 changes nothing; the answer is ${n} itself.`]],
      `Correct — any number divided by 1 is itself: ${n} ÷ 1 = ${n}.`, { factFamily: factFamilyKey(1, n) });
  }
  return num(Dv, `${n} ÷ ${n} = ?`, 1,
    [[n, `That repeats the number instead of dividing it by itself.`], [0, `A number divided by itself is never zero unless the number itself is zero.`]],
    `Correct — any nonzero number divided by itself is 1: ${n} ÷ ${n} = 1.`, { factFamily: factFamilyKey(n, n) });
};

divHandlers.DivZeroMcq = (r) => {
  const n = pick(r, 1, 12);
  // Conceptual: reasoning about undefined division, not a specific fact-family — no factFamily.
  return mcq(r, Dv, `What is ${n} ÷ 0?`,
    ["Undefined — division by zero has no answer", `Correct — there is no number that, multiplied by 0, gives ${n}, so ${n} ÷ 0 is undefined.`],
    [["0", `If ${n} ÷ 0 = 0, then 0 × 0 would have to equal ${n}, which is false unless ${n} is 0.`],
     [String(n), `If ${n} ÷ 0 = ${n}, then ${n} × 0 would have to equal ${n}, but ${n} × 0 = 0.`],
     ["1", `If ${n} ÷ 0 = 1, then 1 × 0 would have to equal ${n}, but 1 × 0 = 0.`]]);
};

const mixedDivPool = fullFactUniverse(2, 10);
divHandlers.DivMixedNumeric = (r) => {
  const key = choose(r, mixedDivPool);
  const { lo, hi: hiF, product } = parseFactFamily(key);
  const [divisor, quotient] = r() < 0.5 ? [lo, hiF] : [hiF, lo];
  return num(Dv, `${product} ÷ ${divisor} = ?`, quotient,
    [[product, `That repeats the total instead of dividing it.`], [quotient + 1, `That quotient is one too many — ${quotient + 1} × ${divisor} = ${(quotient + 1) * divisor}, which overshoots ${product}.`]],
    `Correct — ${product} ÷ ${divisor} = ${quotient}.`, { factFamily: key });
};

divHandlers.DivChooseMcq = (r) => {
  // Operation-selection reasoning, not a specific numeric fact — no factFamily.
  const groups = pick(r, 3, 9), perGroup = pick(r, 2, 9);
  const total = groups * perGroup;
  const wantMult = r() < 0.5;
  if (wantMult) {
    return mcq(r, Dv, `There are ${groups} bags with ${perGroup} apples in each bag. Which operation finds the total number of apples?`,
      ["Multiply", `Correct — equal groups combine by multiplying: ${groups} × ${perGroup} = ${total}.`],
      [["Divide", `Dividing would split a total into groups — here the groups and the amount in each are already known, and the TOTAL is missing.`],
       ["Add only the bag count", `That would count bags, not apples.`]]);
  }
  return mcq(r, Dv, `There are ${total} apples split evenly into ${groups} bags. Which operation finds how many apples are in each bag?`,
    ["Divide", `Correct — splitting a total evenly into groups is division: ${total} ÷ ${groups} = ${perGroup}.`],
    [["Multiply", `Multiplying would combine groups — here the total is already known and needs to be SPLIT.`],
     ["Subtract the bag count", `That would not distribute the apples evenly among the bags.`]]);
};

function fam(tag: string, label: string, handlers: Record<string, Handler>): VariantGen {
  const forms = Object.keys(handlers);
  return { tag, label, forms: forms as any, gen: (r, b = "core", f = "default") => { const key = f === "default" ? forms[0] : f; const h = handlers[key]; if (!h) throw new Error(`unknown ${tag} form ${key}`); return h(r, b); } } as VariantGen;
}

export const G3_FLUENCY_GENERATORS: readonly VariantGen[] = [
  fam(M, "Grade 3 multiplication fact fluency", multHandlers),
  fam(Dv, "Grade 3 division fact fluency", divHandlers),
];

export const G3_FLUENCY_FORM_SURFACES: Readonly<Record<string, string>> = Object.fromEntries(
  [...Object.keys(multHandlers), ...Object.keys(divHandlers)].map((f) => [f, f.endsWith("Mcq") ? "mcq" : f.endsWith("Numeric") ? "numeric" : "unknown"])
);
