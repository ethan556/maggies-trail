#!/usr/bin/env node
// S191 — PROTOCOL v2, Batch A course 2 of 3: properties-strategies-g1 (1.OA.B.3/C.5/C.6),
// built entirely on the PRE-EXISTING g1-add-subtract generator family (shipped before this
// session lineage; already in variants.test.ts's gate via the g1 solver and in the resolver
// band table). Zero edits to Variants.ts / g1Variants.ts / g1Independent.cjs / tag routes /
// resolver bands. Every graded numeric widget's prompt parses under an ALREADY-SHIPPED
// g1Independent.cjs route for its declared form (verified by session191.batchA.test.ts, which
// calls the REAL solver — not these mirrors — on every authored widget). The doubles /
// counting-back numerics declare PartWholeNumeric / ResultUnknownNumeric (REGISTERED forms),
// exactly the shape the 400-seed gate has always exercised for this tag's default form.
// MCQ mirrors follow S190's licensed pattern: same reasoning target, 4 options minimum
// (protocol v2 point 4), structural gates rather than solver parsing.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "properties-strategies-g1");
if (!spec || spec.lessons.length !== 14) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

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
const hi = (b, s, c, st) => (b === "support" ? s : b === "stretch" ? st : c);

/* ---- mirrors of PRE-EXISTING g1-add-subtract forms (prompt shapes parse under the REAL
   g1Independent.cjs routes; session191.batchA.test.ts proves this against the shipped solver,
   never against these mirrors). Range extensions per band are licensed — routes parse shape,
   not range (S190 precedent: CountOnSmall extended to two digits). ---- */
function BiggerFirstNumeric(r, b) {
  const big = pick(r, 6, hi(b, 10, 13, 16)), small = pick(r, 1, Math.min(5, 20 - big));
  return { prompt: `${small} + ${big} = ? Start at ${big} and count on ${small}.`, answer: big + small,
    commonErrors: [[big, `That is the starting number; count on ${small} more.`], [small, `That is only the smaller addend, not the total.`]] };
}
function CountingOnNumeric(r, b) {
  const a = pick(r, 4, hi(b, 8, 11, 14)), d = pick(r, 2, Math.min(5, 20 - a));
  return { prompt: `${a} + ${d} = ? Start at ${a} and count on ${d}.`, answer: a + d,
    commonErrors: [[a, `That is the start; count ${d} more before stopping.`], [a + d - 1, `That stops one count too soon; say ${d} counts in all.`]] };
}
function CountOnSmallNumeric(r) {
  const a = pick(r, 3, 9), b = pick(r, 1, 3);
  return { prompt: `${a} + ${b} = ? Count on ${b}.`, answer: a + b,
    commonErrors: [[a, `That stops before counting on ${b}.`], [b, `That is only the amount counted on.`]] };
}
function DoublesNumeric(r, b) {
  const n = pick(r, 2, hi(b, 6, 9, 10));
  return { form: "PartWholeNumeric", prompt: `${n} + ${n} = ?`, answer: 2 * n,
    commonErrors: [[n, `That is only one of the two equal groups; a double joins both.`], [2 * n + 1, `That is one too many — a double of ${n} is exactly ${n} counted twice.`]] };
}
function DoublesPlusNumeric(r, b) {
  const n = pick(r, 2, hi(b, 6, 8, 9));
  return { form: "PartWholeNumeric", prompt: `${n} + ${n + 1} = ?`, answer: 2 * n + 1,
    commonErrors: [[2 * n, `That is the double ${n} + ${n} without adding the one extra.`], [2 * n + 2, `That doubles the bigger number instead of the smaller one.`]] };
}
function DoublesMinusNumeric(r, b) {
  const n = pick(r, 3, hi(b, 6, 8, 10));
  return { form: "PartWholeNumeric", prompt: `${n} + ${n - 1} = ?`, answer: 2 * n - 1,
    commonErrors: [[2 * n, `That is the full double ${n} + ${n} without taking the one away.`], [2 * n - 2, `That doubles the smaller number instead of starting from the bigger double.`]] };
}
function CountBackNumeric(r, b) {
  const a = pick(r, 7, hi(b, 12, 15, 18)), d = pick(r, 2, 3);
  return { form: "ResultUnknownNumeric", prompt: `${a} − ${d} = ? Count back ${d}.`, answer: a - d,
    commonErrors: [[a - d + 1, `That stops one count too soon; make all ${d} backward hops.`], [a + d, `That counts forward instead of back.`]] };
}
function SubThroughTenNumeric(r, b) {
  const a = pick(r, 11, hi(b, 14, 16, 18)), d = pick(r, a - 9, 9);
  return { form: "ResultUnknownNumeric", prompt: `${a} − ${d} = ?`, answer: a - d,
    commonErrors: [[a - d + 1, `That is one too many; check the last step past ten.`], [a + d, `That adds instead of subtracting.`]] };
}
function MakeTenFirstNumeric(r, band) {
  const total = pick(r, 11, hi(band, 14, 17, 19));
  const a = pick(r, 6, 9), b = total - a;
  const toTen = 10 - a;
  const secondTrap = (b - toTen + 1 !== b)
    ? [b - toTen + 1, `That is 1 more than the requested value. Recount the visible quantities and operation.`]
    : [toTen, `That repeats the amount that went to make ten, not what is left of ${b}.`];
  return { prompt: `${a} takes ${toTen} from ${b} to make ten. How many of the ${b} are left?`, answer: b - toTen,
    commonErrors: [[b, `That is the original addend before splitting it.`], secondTrap] };
}
function TensPartnersNumeric(r) {
  const a = pick(r, 1, 9);
  return { prompt: `${a} + ? = 10. What makes ten with ${a}?`, answer: 10 - a,
    commonErrors: [[a, `That repeats the known part; the two parts must total ten.`], [10, `Ten is the whole, not the missing partner.`]] };
}
function FactFamilyNumeric(r) {
  const a = pick(r, 3, 9);
  let b = pick(r, 2, 9);
  if (b === a) b = b > 2 ? b - 1 : b + 1; // trap-collision guard: the "other part" trap must differ from the answer
  const t = a + b;
  return { prompt: `Fact family ${a}, ${b}, ${t}: ${t} − ${a} = ?`, answer: b,
    commonErrors: [[a, `That subtracts the other part. The missing partner is ${b}.`], [t, `That repeats the whole instead of removing ${a}.`]] };
}
function EqualSignNumeric(r) {
  const a = pick(r, 3, 8), b = pick(r, 2, 7);
  let c = pick(r, 2, a + b - 1);
  // Collision guard (the recurring trap-collision class): when c is exactly half the sum, the
  // "repeats c" trap equals the answer. Shift off the midpoint rather than dropping a trap.
  if (2 * c === a + b) c = c > 2 ? c - 1 : c + 1;
  return { prompt: `Make both sides equal: ${a} + ${b} = ${c} + ?`, answer: a + b - c,
    commonErrors: [[a + b, `That is the whole value of the left side, not the missing addend after ${c}.`], [c, `Repeating ${c} does not necessarily balance both sides.`]] };
}
/* ---- MCQ mirrors (4 options each; structural gates, per S190) ---- */
function BiggerFirstMcq(r) {
  const a = pick(r, 2, 6), b = pick(r, a + 1, 10);
  const opts = [
    { label: `${b}`, correct: true, feedback: `Correct — start at the larger addend, ${b}, and count on only ${a}.` },
    { label: `${a}`, correct: false, feedback: `Starting at ${a} requires ${b} hops, which is not the fewest.` },
    { label: `${a + b}`, correct: false, feedback: `That is the total, not the number where the counting starts.` },
    { label: `0`, correct: false, feedback: `Starting at zero would mean counting the entire total from the beginning.` },
  ];
  return { prompt: `To add ${a} + ${b} with the fewest hops, where should you start?`, options: opts, answerLabel: opts[0].label };
}
function SwapSameMcq(r) {
  const a = pick(r, 2, 7), b = pick(r, a + 1, 9), s = a + b;
  const opts = [
    { label: `${s} — the same total`, correct: true, feedback: `Correct — swapping the order of the addends never changes the total; both give ${s}.` },
    { label: `${s + 1} — one more`, correct: false, feedback: `Nothing was added when the order swapped, so the total cannot grow to ${s + 1}.` },
    { label: `${s - 1} — one less`, correct: false, feedback: `Nothing was removed when the order swapped, so the total cannot shrink to ${s - 1}.` },
    { label: `${b - a} — the difference`, correct: false, feedback: `The difference compares the addends; swapping them is still addition and keeps the total ${s}.` },
  ];
  return { prompt: `${a} + ${b} = ${s}. What is ${b} + ${a}?`, options: opts, answerLabel: opts[0].label };
}
function CountingOnMcq(r) {
  const a = pick(r, 6, 10), d = pick(r, 1, 4);
  const opts = [
    { label: `Start at ${a} and count on ${d}`, correct: true, feedback: `Correct — start with the larger amount and count only the smaller addend.` },
    { label: `Start at 0 and count to ${a + d}`, correct: false, feedback: `That works, but it is not the fast counting-on strategy for this sum.` },
    { label: `Start at ${d} and count on ${a}`, correct: false, feedback: `This uses more hops because it starts at the smaller addend instead of the bigger one.` },
    { label: `Count backward from ${a}`, correct: false, feedback: `Counting backward represents subtraction, not adding ${d} more.` },
  ];
  return { prompt: `What is the fast way to add ${a} + ${d}?`, options: opts, answerLabel: opts[0].label };
}
function CountBackMcq(r) {
  const start = pick(r, 6, 14), h = pick(r, 2, 4);
  const opts = [
    { label: `${start - 1}`, correct: true, feedback: `Correct — the first backward hop moves one less, to ${start - 1}.` },
    { label: `${start - h}`, correct: false, feedback: `That is the final landing after all ${h} hops, not the first single hop.` },
    { label: `${start + 1}`, correct: false, feedback: `That moves forward instead of back, which would be adding rather than subtracting.` },
    { label: `${start}`, correct: false, feedback: `That stays at the starting point without making a hop at all.` },
  ];
  return { prompt: `To count back ${h} from ${start}, where does the first hop land?`, options: opts, answerLabel: opts[0].label };
}
function DoubleFactMcq(r) {
  const n = pick(r, 3, 8), s = 2 * n + 1;
  const opts = [
    { label: `${n} + ${n} = ${2 * n}, then add 1`, correct: true, feedback: `Correct — ${n} + ${n + 1} is the double of ${n} plus one more, so ${2 * n} + 1 = ${s}.` },
    { label: `${n + 1} + ${n + 1} = ${2 * n + 2}, then add 1`, correct: false, feedback: `Doubling the bigger addend and adding one lands past ${s}; anchor on the smaller double instead.` },
    { label: `${n} + ${n} = ${2 * n}, and stop there`, correct: false, feedback: `The double alone misses the extra one; ${n} + ${n + 1} is one more than ${n} + ${n}.` },
    { label: `Count all ${s} from zero`, correct: false, feedback: `Counting everything from zero works but ignores the known double that makes this fast.` },
  ];
  return { prompt: `Which known double helps solve ${n} + ${n + 1}?`, options: opts, answerLabel: opts[0].label };
}
function MakeTenFirstMcq(r) {
  const a = pick(r, 6, 9), b = pick(r, 11 - a, 8), need = 10 - a, left = b - need;
  const opts = [
    { label: `${need} and ${left}`, correct: true, feedback: `Correct — ${need} completes ten and ${left} remains to add on.` },
    { label: `${left} and ${need + 1}`, correct: false, feedback: `Those parts do not total ${b}, so the split loses or invents counters.` },
    { label: `${a} and ${b - a >= 0 ? b - a : 0}`, correct: false, feedback: `This split is based on the first addend rather than on what ten still needs.` },
    { label: `${need + 1} and ${Math.max(0, left - 1)}`, correct: false, feedback: `Taking ${need + 1} would pass ten instead of completing it exactly. Use only ${need}.` },
  ];
  return { prompt: `To add ${a} + ${b} by making ten, how should you split ${b}?`, options: opts, answerLabel: opts[0].label };
}
function SubFactsMcq(r) {
  const total = pick(r, 11, 18), sub = pick(r, 3, 9), diff = total - sub;
  const wrongTotal = total + sub;
  const opts = [
    { label: `${sub} + ${diff} = ${total}`, correct: true, feedback: `Correct — addition checks the related subtraction fact.` },
    { label: `${total} + ${sub} = ${wrongTotal}`, correct: false, feedback: `This uses the whole and removed part added together, not the missing difference.` },
    { label: `${sub} + ${total} = ${wrongTotal}`, correct: false, feedback: `This adds both original numbers rather than finding the missing part.` },
    { label: `${diff} + ${total} = ${diff + total}`, correct: false, feedback: `This does not rebuild the original whole from its two parts.` },
  ];
  return { prompt: `Which addition fact helps solve ${total} − ${sub}?`, options: opts, answerLabel: opts[0].label };
}
function StrategyPickMcq(r) {
  const kind = pick(r, 0, 2);
  if (kind === 0) {
    const a = pick(r, 11, 15), d = pick(r, 2, 3);
    const opts = [
      { label: `Count on ${d} from ${a}`, correct: true, feedback: `Correct — adding a very small amount suits counting on from the bigger number.` },
      { label: `Make ten first`, correct: false, feedback: `Making ten helps when the sum crosses a ten; adding ${d} here is faster by counting on.` },
      { label: `Use a double`, correct: false, feedback: `The addends are not equal or nearly equal, so no double anchors this sum.` },
      { label: `Count everything from zero`, correct: false, feedback: `Starting over from zero throws away the ${a} already known.` },
    ];
    return { prompt: `Which strategy fits ${a} + ${d} best?`, options: opts, answerLabel: opts[0].label };
  }
  if (kind === 1) {
    const a = pick(r, 7, 9), b = 10 - a + pick(r, 2, 5);
    const opts = [
      { label: `Make ten first`, correct: true, feedback: `Correct — ${a} + ${b} crosses ten, so completing ten first makes the rest easy.` },
      { label: `Count on ${b} one at a time`, correct: false, feedback: `Counting on ${b} single hops works but is slow across the ten boundary.` },
      { label: `Count back from ${a}`, correct: false, feedback: `Counting back is a subtraction move; this problem joins two amounts.` },
      { label: `Swap and stop`, correct: false, feedback: `Swapping the addends keeps the same sum but is not by itself a way to finish it.` },
    ];
    return { prompt: `Which strategy fits ${a} + ${b} best?`, options: opts, answerLabel: opts[0].label };
  }
  const n = pick(r, 4, 8);
  const opts = [
    { label: `Use the double ${n} + ${n}`, correct: true, feedback: `Correct — ${n} + ${n + 1} sits right next to a known double, so anchor there and add one.` },
    { label: `Make ten first`, correct: false, feedback: `A near-double is faster to anchor on the double than to rebuild around ten.` },
    { label: `Count on ${n + 1} one at a time`, correct: false, feedback: `That many single hops is slower than using the double you already know.` },
    { label: `Count back ${n}`, correct: false, feedback: `Counting back subtracts; this problem adds two nearly equal amounts.` },
  ];
  return { prompt: `Which strategy fits ${n} + ${n + 1} best?`, options: opts, answerLabel: opts[0].label };
}
function ExplainStrategyMcq(r) {
  const kind = pick(r, 0, 2);
  if (kind === 0) {
    const a = pick(r, 2, 5), b = pick(r, 6, 9), s = a + b;
    const opts = [
      { label: `Both orders join the same two groups`, correct: true, feedback: `Correct — ${a} + ${b} and ${b} + ${a} combine the same counters, so the total ${s} cannot change.` },
      { label: `The bigger number always wins`, correct: false, feedback: `Addition has no winner; both addends contribute fully to the total.` },
      { label: `Swapping adds one extra`, correct: false, feedback: `Swapping moves no counter in or out of the pile, so nothing extra can appear in the total.` },
      { label: `It only works for small numbers`, correct: false, feedback: `The two groups are the same two groups at any size, so the rule holds for all numbers.` },
    ];
    return { prompt: `Why does ${a} + ${b} equal ${b} + ${a}?`, options: opts, answerLabel: opts[0].label };
  }
  if (kind === 1) {
    const a = pick(r, 6, 9), b = 10 - a + pick(r, 1, 4);
    const opts = [
      { label: `Ten and some more is easy to name`, correct: true, feedback: `Correct — moving part of ${b} to complete ten turns the sum into ten-and-leftovers, which is easy to read.` },
      { label: `It changes the total to a rounder number`, correct: false, feedback: `Making ten regroups the counters without changing the total at all.` },
      { label: `Ten is bigger than both addends`, correct: false, feedback: `The size of ten is not the point; its usefulness is that ten-and-more is easy to name.` },
      { label: `It skips adding the leftover`, correct: false, feedback: `The leftover must still be added; the strategy only reorders the work.` },
    ];
    return { prompt: `Why does making ten help with ${a} + ${b}?`, options: opts, answerLabel: opts[0].label };
  }
  const n = pick(r, 3, 8);
  const opts = [
    { label: `It starts from a fact already known`, correct: true, feedback: `Correct — anchoring on the known double ${n} + ${n} leaves only one small adjustment.` },
    { label: `Doubles are always the answer`, correct: false, feedback: `The double is a stepping stone here, not the final total; one more must be added.` },
    { label: `It avoids adding entirely`, correct: false, feedback: `One more is still added after the double; the strategy shortens the work, it does not remove it.` },
    { label: `Near-doubles cannot be counted on`, correct: false, feedback: `Counting on would also work; the double is simply faster, not the only path.` },
  ];
  return { prompt: `Why is doubles-plus-one a good strategy for ${n} + ${n + 1}?`, options: opts, answerLabel: opts[0].label };
}

const REUSE = {
  BiggerFirstNumeric, CountingOnNumeric, CountOnSmallNumeric, DoublesNumeric, DoublesPlusNumeric,
  DoublesMinusNumeric, CountBackNumeric, SubThroughTenNumeric, MakeTenFirstNumeric,
  TensPartnersNumeric, FactFamilyNumeric, EqualSignNumeric,
  BiggerFirstMcq, SwapSameMcq, CountingOnMcq, CountBackMcq, DoubleFactMcq, MakeTenFirstMcq,
  SubFactsMcq, StrategyPickMcq, ExplainStrategyMcq,
};
// Every graded widget in this course belongs to the pre-existing g1-add-subtract family. The
// doubles/count-back numerics declare registered PartWholeNumeric / ResultUnknownNumeric forms
// (set inside their mirror output); authored MCQ reframes declare the nearest shipped MCQ form,
// per S190's EqualSignMcq precedent.
const FORM_OF = {
  SwapSameMcq: "EqualSignMcq", DoubleFactMcq: "MakeTenFirstMcq", StrategyPickMcq: "CountingOnMcq",
  ExplainStrategyMcq: "SubFactsMcq",
};

function reused(form, seedStr, band, hints, ev, fallback = "Recompute the quantities and relationship shown, one step at a time.") {
  const r = mulberry32(seedFromString(seedStr));
  const out = REUSE[form](r, band);
  must(!!out, `${form}: no output`);
  const declaredForm = out.form ?? FORM_OF[form] ?? form;
  if (out.options) {
    must(out.options.length >= 4, `${form} needs >=4 options (protocol v2 point 4)`);
    must(new Set(out.options.map((o) => o.label)).size === out.options.length, `${form} mcq duplicate labels: ${out.options.map((o) => o.label).join(",")}`);
    must(out.options.filter((o) => o.correct).length === 1, `${form} mcq correct count`);
    // Authored order keeps the correct option at index 0, matching the corpus convention that
    // src/components/optionOrder.test.tsx pins (>0.95). Learner-facing order is randomized at
    // RENDER time by the seeded lessonId:stepId shuffle — authoring-time rotation adds nothing
    // for the learner and drags a documented corpus invariant below its threshold.
    const rotated = out.options.map((o, i) => ({ id: `o${i}`, ...o }));
    for (const o of rotated) must(o.feedback.length >= 25, `${form} mcq feedback short`);
    must(new Set(rotated.map((o) => o.feedback)).size === rotated.length, `${form} mcq feedback not distinct`);
    return {
      variant: { gen: "g1-add-subtract", form: declaredForm },
      widget: { type: "mcq", prompt: out.prompt, options: rotated.map(({ answerLabel, ...o }) => o) },
      hints, ev, answerLabel: out.answerLabel,
    };
  }
  const commonErrors = out.commonErrors
    .filter(([v]) => v !== out.answer)
    .map(([value, feedback]) => { must(feedback.length >= 25, `${form} trap feedback short`); return { value, feedback }; });
  must(commonErrors.length >= 2, `${form} needs 2 live traps`);
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `${form} duplicate traps`);
  return {
    variant: { gen: "g1-add-subtract", form: declaredForm },
    widget: { type: "numeric", prompt: out.prompt, answer: out.answer, tolerance: 0, unit: "", commonErrors,
      fallbackFeedback: fallback, successFeedback: `Correct — ${out.prompt.replace(/\?$/, "").replace(/\?\s/, "").trim()} ${out.answer}.` },
    hints, ev,
  };
}

/* ---- interactive manipulatives (same hand-built pattern as every K/G1 factory) ---- */
function hop(prompt, start, hops, direction, success, traps = []) {
  const sign = direction === "back" ? -1 : 1;
  const land = start + sign * hops;
  const pts = [start, land, ...traps.map((t) => t[0])];
  const min = Math.max(0, Math.min(...pts) - 2);
  const max = Math.min(99, Math.max(...pts) + 2);
  must(land >= min && land <= max, `hop bounds ${start}->${land}`);
  const commonLandings = traps.map(([value, feedback]) => {
    must(value !== land && value >= min && value <= max, `hop trap ${value}`);
    must(feedback.length >= 25, "hop trap feedback short");
    return { value, feedback };
  });
  return { type: "numberLineHop", prompt, min, max, start, hop: 1, hops, direction, commonLandings,
    missFeedback: `Start at ${start} and count ${direction === "back" ? "back" : "on"} ${hops}: you land on ${land}.`,
    successFeedback: success };
}
function frame10(prompt, target, preFilled, success, traps = []) {
  must(preFilled < target, `frame preFilled ${preFilled} must be < ${target}`);
  must(target <= 10, `frame target ${target} > 10`);
  const commonCounts = traps.map(([count, feedback]) => {
    must(count !== target, `frame trap ${count}`); must(feedback.length >= 25, "frame trap feedback short");
    return { count, feedback };
  });
  return { type: "tenFrame", prompt, target, preFilled, addColor: "tangerine", commonCounts,
    missFeedback: "Fill one square at a time, counting as you go.", successFeedback: success };
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`The manipulated model and the mathematical relationship for ${tag.replace(/-/g, " ")} must stay consistent.`],
  misconceptions: [`Changing a visible feature without preserving the relationship that defines ${tag.replace(/-/g, " ")}.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `properties-strategies-g1:${tag}`, delayed: true,
  counterfactualPrompt: "What change would make the model stop representing the same mathematical relationship?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

/* -------------------------------------------------------------- lesson definitions (14) --- */
const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

const H = {
  swap: ["The order of the addends can change.", "The two groups being joined stay the same.", "The total stays the same either way."],
  countOn: ["Start at the bigger number.", "Count on the smaller number, one at a time.", "The last number you say is the total."],
  countBack: ["Start at the bigger number.", "Hop back one at a time.", "Count the hops out loud so none is skipped."],
  doubles: ["Find the two equal groups.", "A double is a number counted twice.", "Say the doubles fact you already know."],
  nearDouble: ["Find the double hiding next to this sum.", "Say the double first.", "Then adjust by exactly one."],
  makeTen: ["Split the second number to make ten first.", "Ten plus the leftover is the total.", "Making ten first is often faster than counting on."],
  subTen: ["Take away enough to reach ten first.", "Then take away the rest from ten.", "Two easy steps replace one hard one."],
  known: ["Start from a fact you already know.", "The related facts share the same three numbers.", "Use the known fact to reach the new one."],
  equal: ["Find the value of the complete side first.", "Both sides must name the same total.", "Fill the blank so the sides match."],
  strat: ["Look at the numbers before choosing.", "Small add-ons suit counting on.", "Crossing a ten suits making ten first."],
};

def(1,
  "Two groups can be joined in either order. Three joined with eight makes the same total as eight joined with three, because the same counters are in the pile either way.",
  "Starting from the bigger addend saves work: swap first so the small number is the one you count on.",
  { rep: "diagram", widget: () => hop("Add 3 + 8 the fast way: start at 8 and count on 3. Where do you land?", 8, 3, "forward", "Landed on 11 — swapping to start at 8 gave the same total with fewer hops."),
    predict: P("3 + 8 is swapped to 8 + 3. Does the total change?", [{ id: "same", label: "No — same total" }, { id: "diff", label: "Yes — a different total" }], "same",
      "The same two groups are joined either way, so the total cannot change.") },
  [
    reused("BiggerFirstNumeric", "g1p1-k1", "core", H.swap, ["Swapping the addends never changes the total.", "Starting at the bigger number leaves less to count."]),
    reused("BiggerFirstNumeric", "g1p1-k2", "core", H.swap, ["The same counters are joined in either order.", "Order changes the work, not the answer."]),
    reused("SwapSameMcq", "g1p1-k3", "core", H.swap, ["Both orders join the same two groups.", "Nothing is added or removed by swapping."]),
    reused("BiggerFirstNumeric", "g1p1-ch1", "stretch", H.swap, ["Swapping works for bigger numbers exactly the same way.", "Start big, count on small."]),
  ],
  ["Addends can swap.", "The total stays the same.", "Start at the bigger number to count less."],
  "next: why swapping is always safe.");

def(2,
  "Swapping is safe because addition only joins groups. The pile of counters does not know which group was named first.",
  "This is a rule that always works — for every pair of numbers, not just the ones tried so far.",
  { rep: "diagram", widget: () => hop("Check the swap: start at 9 and count on 4 for 4 + 9. Where do you land?", 9, 4, "forward", "Landed on 13 — the same 13 that 4 + 9 makes, because the same groups joined."),
    predict: P("If 4 + 9 = 13, what is 9 + 4?", [{ id: "same13", label: "13 — the same" }, { id: "more", label: "More than 13" }], "same13",
      "The same two groups are in the pile, so the total is the same 13.") },
  [
    reused("SwapSameMcq", "g1p2-k1", "core", H.swap, ["Swapping never changes which counters are in the pile.", "A rule that always works can be trusted on new numbers."]),
    reused("SwapSameMcq", "g1p2-k2", "core", H.swap, ["The order names the groups; it does not change them.", "Every pair of addends obeys the same rule."]),
    reused("BiggerFirstNumeric", "g1p2-k3", "core", H.swap, ["Use the rule: swap so the bigger number comes first.", "Then count on the small amount."]),
    reused("SwapSameMcq", "g1p2-ch1", "stretch", H.swap, ["The rule holds for numbers of any size.", "Same groups, same total — always."]),
  ],
  ["Addition joins groups.", "Order does not change the pile.", "The swap rule works for every pair of numbers."],
  "next: counting on from the bigger number.");

def(3,
  "To add, start at the bigger number and count on the smaller one. Each count-on step adds exactly one.",
  "Say the starting number silently, then count only the hops out loud — the last number said is the total.",
  { rep: "diagram", widget: () => hop("Start at 11 and count on 3. Where do you land?", 11, 3, "forward", "Landed on 14 — three counts past 11 reach 14.",
      [[13, "That stops one count too soon; make all 3 hops before stopping."]]),
    predict: P("You start at 11 and count on 3. About where do you land?", [{ id: "near", label: "A little past 11" }, { id: "far", label: "Far past 20" }], "near",
      "Counting on 3 moves just three steps up, landing a little past 11.") },
  [
    reused("CountingOnNumeric", "g1p3-k1", "core", H.countOn, ["Counting on from the bigger number is faster than starting over.", "Each count-on step adds exactly one."]),
    reused("CountingOnNumeric", "g1p3-k2", "core", H.countOn, ["The start number is not said out loud; the hops are.", "The last hop names the total."]),
    reused("CountingOnMcq", "g1p3-k3", "core", H.countOn, ["The fast way starts at the bigger addend.", "Only the smaller amount needs counting."]),
    reused("CountingOnNumeric", "g1p3-ch1", "stretch", H.countOn, ["The strategy is the same for larger starts.", "Count the hops, not the whole pile."]),
  ],
  ["Start at the bigger number.", "Count on the smaller number.", "The last count is the total."],
  "next: when counting on is at its best.");

def(4,
  "Counting on shines when the amount added is three or less. One, two, or three hops are quick and hard to lose track of.",
  "For bigger add-ons, counting on gets slow and easy to miscount — other strategies will take over there.",
  { rep: "diagram", widget: () => hop("Start at 15 and count on 2. Where do you land?", 15, 2, "forward", "Landed on 17 — two quick hops from 15.",
      [[16, "That is only one hop; count on 2 means two hops."]]),
    predict: P("Adding 2 to 15: is counting on a good fit?", [{ id: "yes", label: "Yes — it is only 2 hops" }, { id: "no", label: "No — too many hops" }], "yes",
      "Two hops are quick to make and easy to track, so counting on fits well.") },
  [
    reused("CountOnSmallNumeric", "g1p4-k1", "core", H.countOn, ["Counting on suits add-ons of three or less.", "Few hops means few chances to miscount."]),
    reused("CountOnSmallNumeric", "g1p4-k2", "core", H.countOn, ["One, two, or three hops finish fast.", "The strategy fits the size of the add-on."]),
    reused("CountOnSmallNumeric", "g1p4-k3", "core", H.countOn, ["Small add-ons are counting-on territory.", "Start big, hop small."]),
    reused("CountingOnNumeric", "g1p4-ch1", "stretch", H.countOn, ["Slightly bigger add-ons still work, just more carefully.", "Track every hop out loud."]),
  ],
  ["Counting on fits add-ons of 3 or less.", "Few hops, few mistakes.", "Bigger add-ons will want other strategies."],
  "next: counting back to subtract.");

def(5,
  "Subtracting a small amount works by counting back: start at the whole and hop backward once for each one taken away.",
  "Counting back mirrors counting on — same hops, opposite direction. It suits taking away 1, 2, or 3.",
  { rep: "diagram", widget: () => hop("Start at 12 and count back 3. Where do you land?", 12, 3, "back", "Landed on 9 — three backward hops from 12.",
      [[10, "That stops one hop early; count all 3 backward hops."]]),
    predict: P("You start at 12 and count back 3. Which way do you move?", [{ id: "down", label: "Down, to a smaller number" }, { id: "up", label: "Up, to a bigger number" }], "down",
      "Counting BACK always moves down the number line, toward smaller numbers.") },
  [
    reused("CountBackNumeric", "g1p5-k1", "core", H.countBack, ["Counting back removes one per hop.", "The landing number is what remains."]),
    reused("CountBackMcq", "g1p5-k2", "core", H.countBack, ["The first backward hop lands one less than the start.", "Each hop after that removes one more."]),
    reused("CountBackNumeric", "g1p5-k3", "core", H.countBack, ["Counting back suits taking away small amounts.", "Say each hop so none is skipped."]),
    reused("CountBackNumeric", "g1p5-ch1", "stretch", H.countBack, ["Bigger starts count back exactly the same way.", "Hops down, one per counter removed."]),
  ],
  ["Count back to subtract small amounts.", "One hop per counter removed.", "The landing is what remains."],
  "next: doubles you already know.");

def(6,
  "A double joins two equal groups: 4 + 4, 6 + 6, 8 + 8. Doubles are worth knowing by heart because so many other sums sit next to them.",
  "Picture the double as two matching rows — every counter in one row has a partner in the other.",
  { rep: "diagram", widget: () => hop("Show the double 6 + 6: start at 6 and count on 6. Where do you land?", 6, 6, "forward", "Landed on 12 — six and six make twelve, a double worth remembering."),
    predict: P("6 + 6 joins two equal groups. Will the total be even or odd?", [{ id: "even", label: "Even — everything pairs up" }, { id: "odd", label: "Odd — one is left over" }], "even",
      "Two equal groups pair up perfectly, so a double is always even.") },
  [
    reused("DoublesNumeric", "g1p6-k1", "core", H.doubles, ["A double is one number counted twice.", "Doubles pair up with no counter left over."]),
    reused("DoublesNumeric", "g1p6-k2", "core", H.doubles, ["Knowing doubles by heart makes nearby sums fast.", "Two equal rows show the double clearly."]),
    reused("DoublesNumeric", "g1p6-k3", "core", H.doubles, ["Say the doubles fact, then check it by counting.", "Each double is its own small fact to keep."]),
    reused("DoublesNumeric", "g1p6-ch1", "stretch", H.doubles, ["Bigger doubles follow the same two-equal-groups pattern.", "The total is the number counted twice."]),
  ],
  ["A double joins two equal groups.", "Doubles are always even.", "Knowing doubles makes nearby sums fast."],
  "next: doubles plus one.");

def(7,
  "When two addends differ by one, a known double is hiding inside: 6 + 7 is the double 6 + 6, plus one more.",
  "Anchor on the smaller double, then add one. The double does most of the work.",
  { rep: "diagram", widget: () => hop("Use the double: 6 + 6 lands on 12, so for 6 + 7 count on 1 more from 12. Where do you land?", 12, 1, "forward", "Landed on 13 — the double 12 plus one more gives 6 + 7."),
    predict: P("6 + 7 compared with the double 6 + 6: how do the totals compare?", [{ id: "one", label: "6 + 7 is one more" }, { id: "same", label: "They are the same" }], "one",
      "One addend grew by exactly one, so the total is exactly one more than the double.") },
  [
    reused("DoublesPlusNumeric", "g1p7-k1", "core", H.nearDouble, ["A near-double hides a known double inside.", "Double the smaller addend, then add one."]),
    reused("DoubleFactMcq", "g1p7-k2", "core", H.nearDouble, ["Anchor on the smaller double, not the bigger one.", "The double plus one finishes the sum."]),
    reused("DoublesPlusNumeric", "g1p7-k3", "core", H.nearDouble, ["Say the double first, then the one more.", "Two quick steps replace many hops."]),
    reused("DoublesPlusNumeric", "g1p7-ch1", "stretch", H.nearDouble, ["Bigger near-doubles anchor the same way.", "Double, then plus one."]),
  ],
  ["Near-doubles hide a known double.", "Double the smaller addend.", "Then add exactly one."],
  "next: doubles minus one.");

def(8,
  "A near-double can also lean on the bigger double: 6 + 5 is the double 6 + 6, minus one.",
  "Both doors work — double the smaller and add one, or double the bigger and take one away. Use whichever double you know best.",
  { rep: "diagram", widget: () => hop("Use the double: 6 + 6 lands on 12, so for 6 + 5 count back 1 from 12. Where do you land?", 12, 1, "back", "Landed on 11 — the double 12 minus one gives 6 + 5."),
    predict: P("6 + 5 compared with the double 6 + 6: how do the totals compare?", [{ id: "less", label: "6 + 5 is one less" }, { id: "more", label: "6 + 5 is one more" }], "less",
      "One addend shrank by exactly one, so the total is exactly one less than the double.") },
  [
    reused("DoublesMinusNumeric", "g1p8-k1", "core", H.nearDouble, ["Doubling the bigger addend overshoots by one.", "Take one away to land on the true total."]),
    reused("DoublesMinusNumeric", "g1p8-k2", "core", H.nearDouble, ["The bigger double is one too many.", "Double, then minus one."]),
    reused("DoublesMinusNumeric", "g1p8-k3", "core", H.nearDouble, ["Either neighboring double can anchor the sum.", "Pick the double you know fastest."]),
    reused("DoublesMinusNumeric", "g1p8-ch1", "stretch", H.nearDouble, ["Bigger near-doubles work the same way.", "Anchor high, adjust down by one."]),
  ],
  ["The bigger double overshoots by one.", "Double, then subtract one.", "Either neighboring double can anchor a near-double."],
  "next: making ten to add.");

def(9,
  "When a sum crosses ten, complete the ten first. Part of the second addend fills the frame to ten; the leftover rides on top.",
  "Ten-and-some is easy to name — that is the whole point of the make-ten move.",
  { rep: "diagram", widget: () => frame10("You have 8 in the frame. Add enough to make ten.", 10, 8, "Ten filled — 8 needed 2 more to make a whole ten.",
      [[1, "One more square is not enough; keep filling until every square is full."]]),
    predict: P("8 is in the frame. How many more are needed to make a whole ten?", [{ id: "two", label: "2 more" }, { id: "eight", label: "8 more" }], "two",
      "Ten take away 8 is 2 — exactly how many squares are still empty.") },
  [
    reused("MakeTenFirstNumeric", "g1p9-k1", "core", H.makeTen, ["Splitting an addend to make ten first avoids counting past the boundary one at a time.", "Once ten is made, only the leftover needs adding."]),
    reused("TensPartnersNumeric", "g1p9-k2", "core", H.makeTen, ["Every number has a partner that makes ten.", "The partner is what the empty squares show."]),
    reused("MakeTenFirstMcq", "g1p9-k3", "core", H.makeTen, ["Split the second addend so one part completes ten.", "The other part is the leftover to add."]),
    reused("MakeTenFirstNumeric", "g1p9-ch1", "stretch", H.makeTen, ["Bigger totals split the same way.", "Complete ten, then add what is left."]),
  ],
  ["Complete the ten first.", "Add the leftover to ten.", "Ten-and-some is easy to name."],
  "next: making ten to subtract.");

def(10,
  "Subtracting through ten works in two easy steps: first take away enough to land on ten, then take away the rest.",
  "A related addition fact can check the answer: the part taken away plus the answer rebuilds the start.",
  { rep: "diagram", widget: () => hop("Subtract through ten: start at 13 and count back 3 to reach ten. Where do you land?", 13, 3, "back", "Landed on 10 — the first step of subtracting through ten stops exactly at ten.",
      [[9, "That passes ten; the first step stops exactly at ten."]]),
    predict: P("13 − 5 in two steps: what is the best first stop?", [{ id: "ten", label: "Stop at 10" }, { id: "eleven", label: "Stop at 11" }], "ten",
      "Ten is the friendly landing spot — the rest of the subtraction is easy from there.") },
  [
    reused("SubThroughTenNumeric", "g1p10-k1", "core", H.subTen, ["Land on ten first, then take away the rest.", "Two easy steps replace one hard one."]),
    reused("SubThroughTenNumeric", "g1p10-k2", "core", H.subTen, ["Ten is the friendly stopping point.", "Split the amount taken away around it."]),
    reused("SubFactsMcq", "g1p10-k3", "core", H.known, ["A related addition fact checks the subtraction.", "The parts rebuild the whole."]),
    reused("SubThroughTenNumeric", "g1p10-ch1", "stretch", H.subTen, ["Bigger starts subtract through ten the same way.", "Stop at ten, then finish."]),
  ],
  ["Stop at ten first.", "Then take away the rest.", "A related addition fact checks the answer."],
  "next: using one fact to reach another.");

def(11,
  "Three numbers that add up make a family: the two parts and the whole. Knowing one fact in the family unlocks the others.",
  "If 9 + 4 = 13 is known, then 13 − 9 and 13 − 4 come free — the same three numbers, rearranged.",
  { rep: "diagram", widget: () => hop("Use the family 9, 4, 13: start at 13 and count back 9. Where do you land?", 13, 9, "back", "Landed on 4 — removing one part of the family leaves the other part."),
    predict: P("9 + 4 = 13 is known. What is 13 − 9?", [{ id: "four", label: "4 — the other part" }, { id: "thirteen", label: "13 — the whole" }], "four",
      "Removing one part from the whole leaves exactly the other part of the family.") },
  [
    reused("FactFamilyNumeric", "g1p11-k1", "core", H.known, ["The family's three numbers appear in every related fact.", "Removing one part leaves the other."]),
    reused("FactFamilyNumeric", "g1p11-k2", "core", H.known, ["One known fact unlocks its whole family.", "The whole minus one part is the other part."]),
    reused("SubFactsMcq", "g1p11-k3", "core", H.known, ["An addition fact can solve a subtraction.", "Ask which part is missing from the whole."]),
    reused("FactFamilyNumeric", "g1p11-ch1", "stretch", H.known, ["Bigger families follow the same three-number pattern.", "Parts and whole trade places, never values."]),
  ],
  ["Three numbers make a fact family.", "One known fact unlocks the others.", "Whole minus one part is the other part."],
  "next: different sums with the same value.");

def(12,
  "Different-looking sums can name the same total: 8 + 5 and 10 + 3 both make 13. Moving counters between the addends keeps the total steady.",
  "This is why make-ten works — it slides the sum to an equivalent one that is easier to read.",
  { rep: "diagram", widget: () => hop("8 + 5 slides to 10 + 3. Check the easy form: start at 10 and count on 3. Where do you land?", 10, 3, "forward", "Landed on 13 — the slid sum names the same total as 8 + 5."),
    predict: P("Two counters move from the 5 to the 8, making 10 + 3. Does the total change?", [{ id: "no", label: "No — counters only moved" }, { id: "yes", label: "Yes — it grew" }], "no",
      "Moving counters between the groups changes neither pile's combined size.") },
  [
    reused("EqualSignNumeric", "g1p12-k1", "core", H.equal, ["Both sides must name the same total.", "Find the full side's value, then fill the blank to match."]),
    reused("EqualSignNumeric", "g1p12-k2", "core", H.equal, ["Sliding counters between addends keeps the total.", "The blank takes whatever balances the sides."]),
    reused("EqualSignNumeric", "g1p12-k3", "core", H.equal, ["Equivalent sums look different and mean the same.", "Check by valuing each side."]),
    reused("EqualSignNumeric", "g1p12-ch1", "stretch", H.equal, ["Any pair of equivalent sums balances the same way.", "Value one side; match the other."]),
  ],
  ["Different sums can share one total.", "Moving counters keeps the total steady.", "Balance the sides to match."],
  "next: choosing the strategy that fits.");

def(13,
  "Each strategy has a home: counting on for tiny add-ons, make-ten for sums that cross ten, doubles for near-equal addends.",
  "Look at the numbers before starting — they point to the fastest tool.",
  { rep: "diagram", widget: () => hop("A tiny add-on: 14 + 2. Use counting on — start at 14 and count on 2. Where do you land?", 14, 2, "forward", "Landed on 16 — a two-hop job, exactly what counting on is for."),
    predict: P("A problem adds a small amount, like 2 or 3. Which strategy fits best?", [{ id: "counton", label: "Count on" }, { id: "maketen", label: "Make ten" }], "counton",
      "For very small add-ons, counting on is the fastest and simplest strategy.") },
  [
    reused("StrategyPickMcq", "g1p13-k1", "core", H.strat, ["The numbers in the problem point to a strategy.", "Small add-ons suit counting on; crossing ten suits make-ten."]),
    reused("StrategyPickMcq", "g1p13-k2", "core", H.strat, ["Near-equal addends suit a doubles anchor.", "More than one strategy can work; some are just faster."]),
    reused("StrategyPickMcq", "g1p13-k3", "core", H.strat, ["Choosing well saves hops without changing the answer.", "Match the tool to the numbers."]),
    reused("StrategyPickMcq", "g1p13-ch1", "stretch", H.strat, ["Every strategy learned so far is a tool with a home.", "Read the numbers, then pick."]),
  ],
  ["Read the numbers first.", "Small add-ons: count on. Crossing ten: make ten.", "Near-equal addends: use a double."],
  "next: explaining why a strategy works.");

def(14,
  "Knowing WHY a strategy works matters as much as using it. Each strategy works because it protects the total while making the counting easier.",
  "Swapping keeps the same groups; make-ten regroups without adding or removing; near-doubles adjust a known fact by exactly one.",
  { rep: "diagram", widget: () => hop("Explain-by-checking: the claim is that 3 + 9 equals 9 + 3. Start at 9 and count on 3. Where do you land?", 9, 3, "forward", "Landed on 12 — the swapped order reaches the same total, which is the whole reason swapping is safe."),
    predict: P("A strategy changes HOW you count. What must it never change?", [{ id: "total", label: "The total" }, { id: "order", label: "The order of the numbers" }], "total",
      "A strategy is only valid if the total survives it — the counting path may change freely.") },
  [
    reused("ExplainStrategyMcq", "g1p14-k1", "core", H.strat, ["A valid strategy protects the total.", "The explanation names what stays the same."]),
    reused("ExplainStrategyMcq", "g1p14-k2", "core", H.strat, ["Make-ten regroups counters without changing the pile.", "Explaining the move shows why it is safe."]),
    reused("ExplainStrategyMcq", "g1p14-k3", "core", H.strat, ["Near-doubles lean on a known fact and adjust by one.", "The known part does most of the work."]),
    reused("ExplainStrategyMcq", "g1p14-ch1", "stretch", H.strat, ["Every strategy's why is about protecting the total.", "Say what changed and what stayed."]),
  ],
  ["A strategy protects the total.", "Explaining it names what stays the same.", "The why makes the strategy trustworthy."],
  "course complete: strategies that always work.");

/* ------------------------------------------------------------------------- assembly */

must(L.length === 14, `14 lessons defined, got ${L.length}`);
const chapterTitles = ["Order and Counting Strategies", "Doubles and Making Ten", "Using What You Know"];
const perChapter = [5, 5, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 5 ? 1 : n <= 10 ? 2 : 3);
const outDir = join(root, "content/courses/properties-strategies-g1");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g1p-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const widget = c.widget.type === "mcq" ? c.widget : { ...c.widget };
    if (widget.type === "numeric") must(widget.commonErrors.every((e) => e.value !== widget.answer), `${id}/${sid} trap==answer`);
    return { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget, hints: c.hints, variant: c.variant, cml: cml(tag, "diagram") };
  };

  const i1w = d.i1.widget();
  const lesson = {
    id, slug, title: row.title, courseId: "properties-strategies-g1",
    chapterId: chapters[ch - 1].id, minutes: 6, readingProfile: "standard",
    steps: [
      { id: "c1", kind: "concept", figure: "count-on-hops", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: "Try it.", conceptTag: tag, widget: i1w, predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
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
    if (w.type === "numeric") for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} numeric trap`);
    if (w.type === "mcq") { must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`); must(new Set(w.options.map(o => o.feedback)).size === w.options.length, `${id}/${s.id} mcq feedback distinct`); must(w.options.length >= 4, `${id}/${s.id} mcq option count`); }
    if (w.type === "tenFrame") must(w.preFilled < w.target, `${id}/${s.id} frame prefill`);
    if (w.type === "numberLineHop") {
      const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
      must(land >= w.min && land <= w.max, `${id}/${s.id} hop land ${land} outside ${w.min}..${w.max}`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(s.variant.gen === "g1-add-subtract", `${id}/${s.id} variant tag`);
  }
  const rw = lesson.remedials[0].check.widget;
  must(rw.type === "numeric" || rw.type === "mcq", `${id} remedial widget ${rw.type}`);
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "properties-strategies-g1", slug: "properties-strategies-g1", title: spec.title,
  tagline: "Swap, count on, use doubles, and make ten — strategies that work for every sum.",
  category: "Math", gradeLevel: 1, chapters,
}, null, 2) + "\n");
console.log(`built 14 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
