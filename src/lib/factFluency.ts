// S186: item-grain scheduling for arithmetic-fact fluency.
//
// Every existing mastery/review mechanism in this app operates at the granularity of a
// conceptTag (a SKILL — "start with the bigger number", "solve a two-step equation"). That grain
// is correct for strategy and concept lessons: one skill, one accumulating mastery estimate.
//
// Fluency is a different kind of learning target. "The ×7 Facts" and "The Whole Table" are not
// each teaching one skill — they are giving repeated, spaced exposure to ~55 DISCRETE atomic
// facts (7×8, 6×9, ...), and the whole pedagogical point of lessons like "The Facts That Stick"
// and "Fact Families in Multiplication" is knowing WHICH specific facts are still slow, across
// every lesson that has ever touched them — not just within one lesson's own steps.
//
// This module is that missing grain: a FACT FAMILY is the canonical unordered identity of a
// multiplication/division relationship (the triple {a, b, a*b}); every one of its four surface
// forms (a×b, b×a, a*b÷a, a*b÷b) is evidence about the SAME family. State here is a lightweight
// leech-box per family — deliberately not a full SkillState (mastery.ts): a fact is either fluent
// or it isn't, and the box index directly captures that; no forgetting curve is needed at this
// grain because dueFacts()/weakestFacts() already re-surface it before it can fade.
//
// Deterministic throughout: pool generation is a closed-form enumeration, and weakestFacts()'s
// tie-breaking is a total, stable order over (due-ness, box, lastSeen, key) — never Math.random.
// This module does not persist anything itself; src/lib/progress.ts (Profile.factItems) and
// src/lib/sync.ts (mergeFactItems) own storage and cross-device merge, exactly as review/mastery
// do for their own state shapes.

import { addDays } from "./engine";

/* --------------------------------------------------------- canonical fact-family identity */

/** Canonical key for the multiplication/division relationship between two factors: always
 * "min×max" order, so 7×8 and 8×7 — and 56÷7 and 56÷8 — all resolve to the SAME family. This
 * matches how fluency is actually assessed (Grade 3 does not distinguish "knows 7×8" from
 * "knows 8×7"; commutativity is the whole point of "Fact Families in Multiplication"). */
export function factFamilyKey(a: number, b: number): string {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  return `${lo}x${hi}`;
}

/** Parse a canonical key back into its two factors (low, high) and their product. Throws on a
 * malformed key — this is only ever called on keys this module itself produced. */
export function parseFactFamily(key: string): { lo: number; hi: number; product: number } {
  const m = /^(\d+)x(\d+)$/.exec(key);
  if (!m) throw new Error(`parseFactFamily: malformed key "${key}"`);
  const lo = Number(m[1]), hi = Number(m[2]);
  return { lo, hi, product: lo * hi };
}

/** Every unique fact family with one factor equal to `table` and the other in [lo, hi]
 * (inclusive), canonicalized and de-duplicated (so table=7, range 0..10 excludes the 7×7
 * duplicate with itself only once, and does not separately emit 7×7 twice). Order is ascending
 * by the OTHER factor — stable and human-legible, not an authoring concern since callers select
 * from it deterministically rather than relying on array order for meaning. */
export function factsForTable(table: number, lo = 0, hi = 10): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (let other = lo; other <= hi; other++) {
    const key = factFamilyKey(table, other);
    if (!seen.has(key)) { seen.add(key); out.push(key); }
  }
  return out;
}

/** The full standard fact universe used across the fluency pair: every family with both
 * factors in [lo, hi]. This is the pool "Mixed Facts", "The Whole Table", and "The Facts That
 * Stick" draw from — deliberately the union of every single-table pool already taught, not a
 * separately-authored list, so the review layer can never reference a family no per-table lesson
 * ever introduced. */
export function fullFactUniverse(lo = 0, hi = 10): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (let a = lo; a <= hi; a++) {
    for (let b = a; b <= hi; b++) {
      const key = factFamilyKey(a, b);
      if (!seen.has(key)) { seen.add(key); out.push(key); }
    }
  }
  return out;
}

/* ------------------------------------------------------------------------ leech-box state */

/** Same four-stage progression as engine.ts's review INTERVALS, reused rather than re-tuned —
 * one spaced-repetition cadence for the whole app, not two competing schedules. */
export const FACT_INTERVALS = [1, 3, 7, 21] as const;

export interface FactItemState {
  family: string;
  box: number; // index of the NEXT interval; graduates past FACT_INTERVALS.length - 1
  due: string; // local date string; "" once graduated (never due again until missed)
  misses: number;
  correctStreak: number;
  lastSeen: string;
}

export function emptyFact(family: string, today: string): FactItemState {
  return { family, box: 0, due: today, misses: 0, correctStreak: 0, lastSeen: today };
}

/** Fold one graded result for a specific fact family into the state map. Pure: returns a new
 * map. A miss always resets the box to the first interval — exactly onMiss/onReviewResult's
 * rule in engine.ts, so a learner cannot "bank" easy correct answers against a fact they still
 * get wrong. A correct answer advances one box and pushes the due date out; past the last
 * interval the family is graduated (due cleared) until the next miss re-arms it. */
export function applyFactResult(
  states: Record<string, FactItemState>,
  family: string,
  correct: boolean,
  today: string
): Record<string, FactItemState> {
  const prev = states[family] ?? emptyFact(family, today);
  if (!correct) {
    return { ...states, [family]: { ...prev, box: 0, due: addDays(today, FACT_INTERVALS[0]), misses: prev.misses + 1, correctStreak: 0, lastSeen: today } };
  }
  const box = prev.box + 1;
  const graduated = box >= FACT_INTERVALS.length;
  return {
    ...states,
    [family]: {
      ...prev,
      box: graduated ? FACT_INTERVALS.length : box,
      due: graduated ? "" : addDays(today, FACT_INTERVALS[box]),
      correctStreak: prev.correctStreak + 1,
      lastSeen: today
    }
  };
}

/** Families whose review is due today or earlier (never-graduated families with a real due
 * date only — a graduated family's due is "", which never compares <= any real date string). */
export function dueFacts(states: Record<string, FactItemState>, today: string): string[] {
  return Object.values(states)
    .filter((s) => s.due !== "" && s.due <= today)
    .map((s) => s.family)
    .sort();
}

/** Deterministic priority order for "which facts most need practice right now", restricted to
 * `pool` (so a single-table lesson only ever proposes its own table's facts, while a mixed/review
 * lesson can pass the wider universe). Priority, highest first:
 *   1. never seen at all (box effectively -1: first exposure always outranks a struggling-but-met fact)
 *   2. due today or overdue, lowest box first (the shakiest due facts before the nearly-graduated ones)
 *   3. not yet due, lowest box first, then fewest misses... no — MORE misses first (a fact that
 *      has failed more overall is weaker evidence of fluency even mid-interval)
 * Ties at every level break on lastSeen ascending (longer since practiced ranks first), then the
 * family key ascending — a total order, so two callers with the same states+pool always agree. */
export function weakestFacts(
  states: Record<string, FactItemState>,
  pool: string[],
  n: number,
  today: string
): string[] {
  type Ranked = { family: string; tier: number; box: number; misses: number; lastSeen: string };
  const ranked: Ranked[] = pool.map((family) => {
    const st = states[family];
    if (!st) return { family, tier: 0, box: -1, misses: 0, lastSeen: "" };
    const due = st.due !== "" && st.due <= today;
    return { family, tier: due ? 1 : 2, box: st.box, misses: st.misses, lastSeen: st.lastSeen };
  });
  ranked.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.box !== b.box) return a.box - b.box;
    if (a.tier === 2 && a.misses !== b.misses) return b.misses - a.misses;
    if (a.lastSeen !== b.lastSeen) return a.lastSeen < b.lastSeen ? -1 : 1;
    return a.family < b.family ? -1 : 1;
  });
  return ranked.slice(0, Math.max(0, n)).map((r) => r.family);
}

/** Coverage-focused deterministic pick for AUTHORED lesson content: generators are pure
 * (seed) → variant functions with no access to a learner's history (every existing generator in
 * this codebase follows that contract, and review-style adaptivity is layered on top via
 * dueFacts/weakestFacts + the review surface, never inside the authored generator itself). This
 * picks one family from `pool` by seed alone, cycling deterministically so repeated calls with
 * incrementing seeds sweep the whole pool before repeating — the coverage guarantee a static
 * lesson needs, independent of any learner's actual mastery. */
export function seededFactPick(pool: string[], seed: number): string {
  if (pool.length === 0) throw new Error("seededFactPick: empty pool");
  const idx = ((seed % pool.length) + pool.length) % pool.length;
  return pool[idx];
}

/* ------------------------------------------------------- targeted drill for the review surface */

/** A drill aimed at ONE named family, for the review queue.
 *
 * The authored generators (g3-mult-fluency etc.) sample a POOL at random — correct for a lesson,
 * useless for review, where the whole point is to re-test the specific fact the learner's
 * leech-box says is weak. This builds that item deterministically from (family, seed).
 *
 * The surface alternates between the multiplication and division faces of the same family,
 * because knowing 7×8 and knowing 56÷7 are not the same retrieval — and the family's box is
 * evidence about both. Division is only offered when it is well defined: a family containing 0
 * has no valid divisor on that side, so those stay multiplicative.
 */
export function factDrillFor(family: string, seed: number): {
  widget: {
    type: "numeric"; prompt: string; answer: number; tolerance: number; unit: string;
    commonErrors: Array<{ value: number; feedback: string }>;
    fallbackFeedback: string; successFeedback: string;
  };
  hints: string[];
  explanationVariants: [string, string];
} {
  // S188: the family may be ADDITIVE ("7+8") or MULTIPLICATIVE ("7x8"). Both key spaces share
  // one factItems map and one review surface (the S187 decision), so this drill builder must
  // serve both — before this branch, an additive family reached parseFactFamily and THREW,
  // which would have crashed the review page for any Grade-2 fluency learner.
  if (parseFamily(family).op === "+") return sumDrillFor(family, seed);
  const { lo, hi, product } = parseFactFamily(family);
  // Division needs a nonzero divisor; ÷1 and n÷n are well defined but their ordinary traps
  // collapse onto the answer, so they get the same special-case diagnoses the courses use.
  const divisible = lo > 0;
  const askDivision = divisible && seed % 2 === 1;
  const swap = Math.floor(seed / 2) % 2 === 1;

  if (!askDivision) {
    const [a, b] = swap ? [hi, lo] : [lo, hi];
    const traps: Array<{ value: number; feedback: string }> = [];
    if (product - a !== product && product - a >= 0)
      traps.push({ value: product - a, feedback: `That is one group of ${a} short — ${a} × ${b} means ${a} groups of ${b}, all of them counted.` });
    if (a + b !== product)
      traps.push({ value: a + b, feedback: `That adds the two factors instead of multiplying them. Multiplying means repeated equal groups, not one combined total.` });
    return {
      widget: {
        type: "numeric", prompt: `${a} × ${b} = ?`, answer: product, tolerance: 0, unit: "",
        commonErrors: traps,
        fallbackFeedback: `Skip-count by ${b}, ${a} times — or step from a nearby fact you already know.`,
        successFeedback: `Correct — ${a} × ${b} = ${product}.`
      },
      hints: [`Think in equal groups.`, `Skip-count by ${b}.`, `${a} × ${b} = ${product}.`],
      explanationVariants: [
        `${a} groups of ${b} is ${product}.`,
        `${a} × ${b} = ${product}, and multiplication commutes, so ${b} × ${a} gives the same product.`
      ]
    };
  }

  const divisor = swap && hi > 0 ? hi : lo;
  const quotient = product / divisor;
  const traps: Array<{ value: number; feedback: string }> = [];
  if (divisor === 1) {
    traps.push({ value: 1, feedback: `Dividing by 1 leaves the number unchanged — it does not become 1.` });
    if (product - 1 !== quotient) traps.push({ value: product - 1, feedback: `Dividing by 1 changes nothing; the answer is ${product} itself.` });
  } else if (product === divisor) {
    traps.push({ value: product, feedback: `That repeats the number instead of dividing it by itself.` });
    traps.push({ value: 0, feedback: `A nonzero number divided by itself is 1, never 0.` });
  } else {
    traps.push({ value: product, feedback: `That repeats the total instead of splitting it into groups of ${divisor}.` });
    traps.push({ value: quotient + 1, feedback: `That quotient is one too many — ${quotient + 1} × ${divisor} = ${(quotient + 1) * divisor}, which overshoots ${product}.` });
  }
  return {
    widget: {
      type: "numeric", prompt: `${product} ÷ ${divisor} = ?`, answer: quotient, tolerance: 0, unit: "",
      commonErrors: traps.filter((t) => t.value !== quotient),
      fallbackFeedback: `Think the multiplication fact: ${divisor} × ? = ${product}.`,
      successFeedback: `Correct — ${product} ÷ ${divisor} = ${quotient}, since ${divisor} × ${quotient} = ${product}.`
    },
    hints: [`Think multiplication.`, `${divisor} × ? = ${product}.`, `${product} ÷ ${divisor} = ${quotient}.`],
    explanationVariants: [
      `${divisor} × ${quotient} = ${product}, so ${product} ÷ ${divisor} = ${quotient}.`,
      `Dividing asks how many groups of ${divisor} fit in ${product}: ${quotient}.`
    ]
  };
}

/** Addition/subtraction drill for an ADDITIVE family, mirroring factDrillFor's multiplicative
 * shape: alternating surfaces by seed so the same family is met as both an addition and a
 * subtraction over time — the whole reason a family (not a single fact) is the unit. */
function sumDrillFor(family: string, seed: number): {
  widget: {
    type: "numeric"; prompt: string; answer: number; tolerance: number; unit: string;
    commonErrors: Array<{ value: number; feedback: string }>;
    fallbackFeedback: string; successFeedback: string;
  };
  hints: string[];
  explanationVariants: [string, string];
} {
  const { lo, hi, result } = parseFamily(family);
  const askSubtraction = seed % 2 === 1;
  const swap = Math.floor(seed / 2) % 2 === 1;

  if (!askSubtraction) {
    const [a, b] = swap ? [hi, lo] : [lo, hi];
    const traps: Array<{ value: number; feedback: string }> = [];
    if (result - 1 !== result) traps.push({ value: result - 1, feedback: `That stops one short. Counting on from ${a} means ${b} more, landing on ${result}.` });
    if (Math.abs(a - b) !== result) traps.push({ value: Math.abs(a - b), feedback: `That finds the difference between ${a} and ${b} instead of their total.` });
    return {
      widget: {
        type: "numeric", prompt: `${a} + ${b} = ?`, answer: result, tolerance: 0, unit: "",
        // A trap must be a number the learner could actually type: negatives are unreachable
        // (family "0+0" would otherwise emit -1), and a trap equal to the answer is not a trap.
        commonErrors: traps.filter((t) => t.value !== result && t.value >= 0),
        fallbackFeedback: `Start at the bigger number and count on — or make ten first, then add what is left.`,
        successFeedback: `Correct — ${a} + ${b} = ${result}.`
      },
      hints: [`Start from the bigger number.`, `Make ten, then add the rest.`, `${a} + ${b} = ${result}.`],
      explanationVariants: [
        `${a} and ${b} together make ${result}.`,
        `${a} + ${b} = ${result}, and addition commutes, so ${b} + ${a} gives the same total.`
      ]
    };
  }

  // Subtraction: the family's total minus one addend leaves the other — the "think addition"
  // relationship these Grade-2 lessons are built on.
  const subtrahend = swap ? hi : lo;
  const answer = result - subtrahend;
  const traps: Array<{ value: number; feedback: string }> = [];
  if (result !== answer) traps.push({ value: result, feedback: `That repeats the total instead of taking ${subtrahend} away from it.` });
  if (answer + 1 !== answer) traps.push({ value: answer + 1, feedback: `That is one too many — check by adding back: ${answer + 1} + ${subtrahend} = ${answer + 1 + subtrahend}, not ${result}.` });
  return {
    widget: {
      type: "numeric", prompt: `${result} − ${subtrahend} = ?`, answer, tolerance: 0, unit: "",
      commonErrors: traps.filter((t) => t.value !== answer && t.value >= 0),
      fallbackFeedback: `Think addition: ${subtrahend} + ? = ${result}.`,
      successFeedback: `Correct — ${result} − ${subtrahend} = ${answer}, since ${subtrahend} + ${answer} = ${result}.`
    },
    hints: [`Think addition.`, `${subtrahend} + ? = ${result}.`, `${result} − ${subtrahend} = ${answer}.`],
    explanationVariants: [
      `${subtrahend} + ${answer} = ${result}, so ${result} − ${subtrahend} = ${answer}.`,
      `Taking ${subtrahend} from ${result} leaves the other part of the family: ${answer}.`
    ]
  };
}

/** Review-queue key for a fact drill. Namespaced so it can never collide with the
 * `${lessonId}:${stepId}` keys the ReviewItem queue uses. */
export function factReviewKey(family: string): string {
  return `fact:${family}`;
}

/* ------------------------------------------------------------- additive families (S187 decision)
 *
 * `fluency-20-g2` needs the same item grain for ADDITION facts: {7, 8, 15} covers 7+8, 8+7,
 * 15−7 and 15−8 — structurally identical to a multiplicative family, but a different relation.
 *
 * DECISION: one key space, one `factItems` map, with the OPERATOR as the discriminator —
 * "7x8" (product 56) and "7+8" (sum 15) are different strings and can never collide, so the
 * leech box, `dueFacts`, `weakestFacts` and the review surface all work unchanged for both.
 * The rejected alternative was overloading "7x8" for both relations, which would have silently
 * merged two unrelated facts into one box; the other rejected option, a second parallel map,
 * would have duplicated every scheduling function for no gain.
 */

/** Canonical key for the addition/subtraction relationship between two addends. Always
 * "min+max", so 7+8 and 8+7 — and 15−7 and 15−8 — all resolve to the SAME family. */
export function sumFamilyKey(a: number, b: number): string {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  return `${lo}+${hi}`;
}

/** Operator-agnostic parse: works on either key space and reports which relation it is.
 * `result` is the product for "x" families and the sum for "+" families. */
export function parseFamily(key: string): { op: "x" | "+"; lo: number; hi: number; result: number } {
  const m = /^(\d+)([x+])(\d+)$/.exec(key);
  if (!m) throw new Error(`parseFamily: malformed key "${key}"`);
  const lo = Number(m[1]), hi = Number(m[3]);
  const op = m[2] as "x" | "+";
  return { op, lo, hi, result: op === "x" ? lo * hi : lo + hi };
}

/** Every addition family whose addends sum to at most `maxSum` (the Grade-2 within-20 range),
 * canonicalized and de-duplicated. */
export function sumFactUniverse(maxSum = 20, lo = 0): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (let a = lo; a <= maxSum; a++) {
    for (let b = a; a + b <= maxSum; b++) {
      const key = sumFamilyKey(a, b);
      if (!seen.has(key)) { seen.add(key); out.push(key); }
    }
  }
  return out;
}
