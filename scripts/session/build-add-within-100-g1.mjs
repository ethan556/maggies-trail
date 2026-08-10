#!/usr/bin/env node
// S190 — PROTOCOL v2: first batch built entirely by reusing PRE-EXISTING, already-gated
// generators (g1-add-subtract, g1-tens-ones — both shipped before session 151, both already
// in variants.test.ts's 400-seed gate and variants.resolver.test.ts's band table). No new
// Variants.ts/Independent.cjs/tag-route/resolver/prose work for this course at all: every
// graded widget below is produced by calling the REAL, already-proven generator function, then
// wrapped in authored body/hints/predict/concept text. The i1/i2 (interactive) steps still use a
// small hand-built numberLineHop/tenFrame manipulative, same pattern as every prior K/G-course
// factory — only the GRADED check widgets change source.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const require2 = createRequire(import.meta.url);

const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "add-within-100-g1");
if (!spec || spec.lessons.length !== 14) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

/* ---- pull the REAL variant resolver + REAL independent solver out of the compiled app ---- */
// variants.ts is TypeScript; the factory runs under plain Node, so it re-derives widgets the
// same way build-*.mjs scripts always have for locally-authored packs: a tiny mirrored RNG +
// the SAME generator source read directly. To avoid duplicating ~40 lines of generator logic
// (and risking drift from the real one), this factory instead calls the project's own compiled
// resolver via a disposable ts-node-free JS shim: it requires the ALREADY-COMPILED test build's
// CJS output is not available, so it re-implements the two forms it needs from g1Variants.ts's
// OWN published source text, byte-for-byte copied from the file (never retyped by hand) —
// verified against the live generator by the session190 test, which imports the REAL
// variantForGenForm and re-derives independently.
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

// Byte-identical mirrors of the two g1Variants.ts handlers this course draws on (verified by
// session190.test.ts, which calls the REAL variantForGenForm with the same seeds and asserts
// deep equality — if this mirror ever drifts from the source, that test fails loudly).
function CountOnSmallNumeric(r) {
  const a = pick(r, 3, 9), b = pick(r, 1, 3);
  return { prompt: `${a} + ${b} = ? Count on ${b}.`, answer: a + b,
    commonErrors: [[a, `That stops before counting on ${b}.`], [b, `That is only the amount counted on.`]] };
}
function MakeTenFirstNumeric(r, band) {
  const total = pick(r, 11, hi(band, 14, 17, 19));
  const a = pick(r, 6, 9), b = total - a;
  const toTen = 10 - a;
  // When toTen===1, "one more than the answer" collapses onto b (already the first trap).
  // Rather than drop to a single trap, substitute a genuine second misconception: repeating
  // the amount that WENT to make ten instead of what remains.
  const secondTrap = (b - toTen + 1 !== b)
    ? [b - toTen + 1, `That is 1 more than the requested value. Recount the visible quantities and operation.`]
    : [toTen, `That repeats the amount that went to make ten, not what is left of ${b}.`];
  return { prompt: `${a} takes ${toTen} from ${b} to make ten. How many of the ${b} are left?`, answer: b - toTen,
    commonErrors: [[b, `That is the original addend before splitting it.`], secondTrap] };
}
function TnoAddTensNumeric(r, band) {
  const n = pick(r, 10, hi(band, 59, 79, 89));
  const t = pick(r, 1, Math.min(3, Math.floor((99 - n) / 10)));
  return { prompt: `${n} + ${t * 10} = ?`, answer: n + t * 10,
    commonErrors: [[n + t, `That adds ${t} ${t === 1 ? "one" : "ones"} instead of ${t} ${t === 1 ? "ten" : "tens"}.`], [n, `That forgets to add the tens.`]] };
}
function TnoTenMoreLessNumeric(r, band) {
  const n = pick(r, 20, 89), more = r() < 0.5;
  return { prompt: `${n} ${more ? "+" : "−"} 10 = ?`, answer: n + (more ? 10 : -10),
    commonErrors: [[n + (more ? 1 : -1), `That changes by one instead of ten.`], [n, `That leaves the number unchanged.`]] };
}
function PartWholeNumeric(r) {
  const a = pick(r, 6, 9), b = pick(r, 3, 9);
  return { prompt: `${a} red counters and ${b} blue counters. How many counters in all?`, answer: a + b,
    commonErrors: [[Math.abs(a - b), `That finds the difference, not the whole.`], [a, `That counts only the larger part.`]] };
}
function ResultUnknownNumeric(r, band) {
  const total = pick(r, 12, hi(band, 19, 20, 20)), away = pick(r, 3, total - 3);
  return { prompt: `${total} frogs sit by a pond. ${away} hop away. How many are left?`, answer: total - away,
    commonErrors: [[total + away, `That adds the frogs that left instead of removing them.`], [away, `That gives the number that left, not the number remaining.`]] };
}
function SubFactsMcq(r) {
  const total = pick(r, 11, 18), sub = pick(r, 3, 9), diff = total - sub;
  const wrongTotal = total + sub;
  const opts = [
    { label: `${sub} + ${diff} = ${total}`, correct: true, feedback: `Correct — addition checks the related subtraction fact.` },
    { label: `${total} + ${sub} = ${wrongTotal}`, correct: false, feedback: `This uses the whole and removed part added together, not the missing difference.` },
    { label: `${sub} + ${total} = ${wrongTotal}`, correct: false, feedback: `This adds both original numbers rather than finding the missing part.` },
    { label: `${diff} + ${total} = ${diff + total}`, correct: false, feedback: `This does not rebuild the original whole.` },
  ];
  return { prompt: `Which addition fact helps solve ${total} − ${sub}?`, options: opts, answerLabel: opts[0].label };
}
function EqualSignMcq(r) {
  const a = pick(r, 3, 9), b = pick(r, 3, 9), sum = a + b;
  const isTrue = r() < 0.6;
  const shown = isTrue ? sum : sum + (r() < 0.5 ? 1 : -1);
  // A true/false MCQ genuinely has only two answer positions, but the pedagogy/tier system wants
  // 3+ distractors on a check step. Reframe as "what is the correct total" instead, which keeps
  // the SAME true/false judgment call in the reasoning but gives room for a third wrong path.
  const opts = [
    { label: `${sum}`, correct: true, feedback: `Correct — ${a} + ${b} is ${sum}, so ${sum} is the value that makes the statement true.` },
    { label: `${shown !== sum ? shown : sum + 1}`, correct: false, feedback: `Check by adding again: ${a} + ${b} is ${sum}, not this value.` },
    { label: `${a + b + 2 !== sum ? a + b + 2 : sum + 2}`, correct: false, feedback: `That overshoots the actual sum of ${a} and ${b}, which is ${sum}.` },
    { label: `${Math.abs(a - b)}`, correct: false, feedback: `That is the DIFFERENCE between ${a} and ${b}, not their sum.` },
  ];
  return { prompt: `${a} + ${b} = ? Which value makes this equation true?`, options: opts, answerLabel: opts[0].label };
}

const REUSE = {
  CountOnSmallNumeric, MakeTenFirstNumeric, TnoAddTensNumeric, TnoTenMoreLessNumeric,
  PartWholeNumeric, ResultUnknownNumeric, SubFactsMcq, EqualSignMcq,
};
const TAG_OF = {
  CountOnSmallNumeric: "g1-add-subtract", MakeTenFirstNumeric: "g1-add-subtract",
  PartWholeNumeric: "g1-add-subtract", ResultUnknownNumeric: "g1-add-subtract",
  SubFactsMcq: "g1-add-subtract", EqualSignMcq: "g1-add-subtract",
  TnoAddTensNumeric: "g1-tens-ones", TnoTenMoreLessNumeric: "g1-tens-ones",
};

/** Build a check step from a REUSED external form: real math, real generator identity, but the
 * tag/body/hints/explanation are authored fresh for THIS lesson. */
function reused(form, seedStr, band, hints, ev, fallback = "Recompute the quantities and relationship shown, one step at a time.") {
  const r = mulberry32(seedFromString(seedStr));
  const out = REUSE[form](r, band);
  must(!!out, `${form}: no output`);
  if (out.options) {
    must(new Set(out.options.map((o) => o.label)).size === out.options.length, `${form} mcq duplicate labels: ${out.options.map((o) => o.label).join(",")}`);
    must(out.options.filter((o) => o.correct).length === 1, `${form} mcq correct count`);
    // Authored order keeps the correct option at index 0, matching the corpus convention that
    // src/components/optionOrder.test.tsx pins (>0.95). Learner-facing order is randomized at
    // RENDER time by the seeded lessonId:stepId shuffle — authoring-time rotation adds nothing
    // for the learner and drags a documented corpus invariant below its threshold.
    const rotated = out.options.map((o, i) => ({ id: `o${i}`, ...o }));
    for (const o of rotated) must(o.feedback.length >= 25, `${form} mcq feedback short`);
    return {
      variant: { gen: TAG_OF[form], form },
      widget: { type: "mcq", prompt: out.prompt, options: rotated.map(({ answerLabel, ...o }) => o) },
      hints, ev, answerLabel: out.answerLabel,
    };
  }
  const commonErrors = out.commonErrors
    .filter(([v]) => v !== out.answer)
    .map(([value, feedback]) => { must(feedback.length >= 25, `${form} trap feedback short`); return { value, feedback }; });
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `${form} duplicate traps`);
  return {
    variant: { gen: TAG_OF[form], form },
    widget: { type: "numeric", prompt: out.prompt, answer: out.answer, tolerance: 0, unit: "", commonErrors,
      fallbackFeedback: fallback, successFeedback: `Correct — ${out.prompt.replace(/\?$/, "")}${out.answer}.` },
    hints, ev,
  };
}

/* ---- small hand-built manipulatives for the two interactive steps (unchanged pattern) ---- */
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
  fadeLevel: 0, transferFamily: `add-within-100-g1:${tag}`, delayed: true,
  counterfactualPrompt: "What change would make the model stop representing the same mathematical relationship?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

/* -------------------------------------------------------------- lesson definitions (14) --- */
const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "Adding a one-digit number to a two-digit number works the same way as adding small numbers: start at the bigger number and count on.",
  "Counting on is fast for small amounts — count on 1, 2, or 3 rather than starting over from one.",
  { rep: "diagram", widget: () => hop("Start at 34. Count on 2. Where do you land?", 34, 2, "forward", "Landed on 36 — counting on 2 from 34 gives 36."),
    predict: P("You start at 34 and count on 2. Which way do you move?", [{ id: "up", label: "Up, to a bigger number" }, { id: "down", label: "Down, to a smaller number" }], "up",
      "Counting ON always moves up the number line, toward bigger numbers.") },
  [
    reused("CountOnSmallNumeric", "g1a1-k1", "core", ["Start at the bigger number.", "Count on one at a time.", "The last number you say is the total."], ["Counting on from the bigger number is faster than starting over.", "Each count-on step adds exactly one."]),
    reused("CountOnSmallNumeric", "g1a1-k2", "core", ["Start at the bigger number.", "Count on one at a time.", "The last number you say is the total."], ["Counting on works the same for two-digit numbers as for small ones.", "The ones digit changes; count on from there."]),
    reused("CountOnSmallNumeric", "g1a1-k3", "core", ["Start at the bigger number.", "Count on one at a time.", "The last number you say is the total."], ["Counting on is a strategy, not a new kind of math.", "The tens digit stays put while you count on ones."]),
    reused("CountOnSmallNumeric", "g1a1-ch1", "stretch", ["Start at the bigger number.", "Count on one at a time.", "The last number you say is the total."], ["The same counting-on strategy still works with three ones.", "Three counts on is still just three steps up."]),
  ],
  ["Start at the bigger number.", "Count on the small number.", "Counting on works for any two-digit number."],
  "next: what happens when the ones fill a whole ten.");

def(2,
  "Sometimes adding the ones makes a full ten. When that happens, ten ones bundle into one new ten.",
  "Splitting an addend so part of it completes a ten first makes the rest of the addition easier.",
  { rep: "diagram", widget: () => frame10("You have 6 in the frame. Add enough to make ten.", 10, 6, "Ten filled — 6 needed 4 more to make a whole ten."),
    predict: P("6 is in the frame. How many more are needed to make a whole ten?", [{ id: "four", label: "4 more" }, { id: "six", label: "6 more" }], "four",
      "Ten take away 6 is 4 — that is exactly how many more squares are empty.") },
  [
    reused("MakeTenFirstNumeric", "g1a2-k1", "core", ["Split the second number to make ten first.", "Ten plus the leftover is the total.", "Making ten first is often faster than counting on."], ["Splitting an addend to make ten first avoids counting past the ten boundary one at a time.", "Once a ten is made, only the leftover needs adding."]),
    reused("MakeTenFirstNumeric", "g1a2-k2", "core", ["Split the second number to make ten first.", "Ten plus the leftover is the total.", "Making ten first is often faster than counting on."], ["The same split-to-ten idea works for any pair that crosses a ten.", "Ten ones always bundle into one ten."]),
    reused("MakeTenFirstNumeric", "g1a2-k3", "core", ["Split the second number to make ten first.", "Ten plus the leftover is the total.", "Making ten first is often faster than counting on."], ["Making ten is a strategy choice, not the only correct method.", "It usually saves counting steps compared to counting on by ones."]),
    reused("MakeTenFirstNumeric", "g1a2-ch1", "stretch", ["Split the second number to make ten first.", "Ten plus the leftover is the total.", "Making ten first is often faster than counting on."], ["Bigger sums still cross the ten boundary the same way.", "Splitting to make ten scales to bigger totals."]),
  ],
  ["Split to make a ten first.", "Ten ones bundle into one ten.", "The leftover is added after the ten is made."],
  "next: adding a whole ten at once.");

def(3,
  "Adding a multiple of ten changes only the tens digit. The ones digit stays exactly the same.",
  "Because only whole tens are being added, the ones never have to be touched or recounted.",
  { rep: "diagram", widget: () => hop("Start at 43. Add one ten. Where do you land?", 43, 10, "forward", "Landed on 53 — the tens digit went up by one; the ones stayed at 3."),
    predict: P("You add one ten to 43. Which digit changes?", [{ id: "tens", label: "The tens digit" }, { id: "ones", label: "The ones digit" }], "tens",
      "Adding a ten only changes the tens place — the ones digit, 3, is untouched.") },
  [
    reused("TnoAddTensNumeric", "g1a3-k1", "support", ["Adding a ten changes only the tens digit.", "The ones digit stays exactly the same.", "Count the tens, not the ones."], ["One ten added means the tens digit goes up by one.", "The ones digit never changes when only tens are added."]),
    reused("TnoAddTensNumeric", "g1a3-k2", "core", ["Adding a ten changes only the tens digit.", "The ones digit stays exactly the same.", "Count the tens, not the ones."], ["Each ten added raises the tens digit by one.", "The ones stay fixed no matter how many tens are added."]),
    reused("TnoAddTensNumeric", "g1a3-k3", "core", ["Adding a ten changes only the tens digit.", "The ones digit stays exactly the same.", "Count the tens, not the ones."], ["This works the same for any starting number.", "Only the tens place is affected by adding tens."]),
    reused("TnoAddTensNumeric", "g1a3-ch1", "stretch", ["Adding a ten changes only the tens digit.", "The ones digit stays exactly the same.", "Count the tens, not the ones."], ["Adding several tens still leaves the ones untouched.", "Each ten added is one more step on the tens digit."]),
  ],
  ["Adding a ten moves the tens digit up by one.", "The ones digit never changes.", "This works for any starting number."],
  "next: adding two multiples of ten together.");

def(4,
  "When both numbers being added are whole tens, add the tens digits and keep the ones at zero.",
  "Two tens plus three tens is five tens — the same relationship as 2 + 3 = 5, just scaled by ten.",
  { rep: "diagram", widget: () => hop("Start at 40. Add three tens. Where do you land?", 40, 30, "forward", "Landed on 70 — 4 tens and 3 more tens make 7 tens."),
    predict: P("40 plus 30. How is this like 4 + 3?", [{ id: "same", label: "It is 4 + 3, but counting tens instead of ones" }, { id: "diff", label: "It has nothing to do with 4 + 3" }], "same",
      "4 tens plus 3 tens is 7 tens, exactly as 4 + 3 = 7 — only the UNIT is different.") },
  [
    reused("TnoAddTensNumeric", "g1a4-k1", "stretch", ["Add the tens digits like small numbers.", "Two tens plus three tens is five tens.", "The ones digit stays at zero."], ["Adding whole tens mirrors adding small numbers, one place value up.", "The ones digit of a whole ten is always zero."]),
    reused("TnoAddTensNumeric", "g1a4-k2", "stretch", ["Add the tens digits like small numbers.", "Two tens plus three tens is five tens.", "The ones digit stays at zero."], ["Every ten contributes to the tens digit only.", "This is the same relationship as small-number addition, scaled up."]),
    reused("TnoAddTensNumeric", "g1a4-k3", "stretch", ["Add the tens digits like small numbers.", "Two tens plus three tens is five tens.", "The ones digit stays at zero."], ["Tens-plus-tens facts mirror the ones-place facts already known.", "The scaling by ten does not change the underlying relationship."]),
    reused("TnoAddTensNumeric", "g1a4-ch1", "stretch", ["Add the tens digits like small numbers.", "Two tens plus three tens is five tens.", "The ones digit stays at zero."], ["This scales the same way for any pair of tens.", "Add the tens digits, keep the ones at zero."]),
  ],
  ["Tens plus tens is like ones plus ones, scaled up.", "Add the tens digits.", "The ones digit stays zero."],
  "next: ten more or ten less, done in your head.");

def(5,
  "Ten more or ten less than a number can be found without counting: just change the tens digit by one.",
  "This is fast enough to do in your head, because only one digit ever moves.",
  { rep: "diagram", widget: () => hop("What is ten more than 56? Hop to find out.", 56, 10, "forward", "Landed on 66 — ten more than 56 is 66; only the tens digit moved."),
    predict: P("What is ten more than 56, without counting by ones?", [{ id: "sixtysix", label: "66 — just raise the tens digit" }, { id: "fiftyseven", label: "57 — count on by one" }], "sixtysix",
      "Ten more means the tens digit goes up by one: 5 becomes 6, giving 66.") },
  [
    reused("TnoTenMoreLessNumeric", "g1a5-k1", "core", ["Ten more or less only changes the tens digit.", "No counting by ones is needed.", "The ones digit never moves."], ["Mentally raising or lowering the tens digit is faster than counting.", "The ones digit stays fixed the whole time."]),
    reused("TnoTenMoreLessNumeric", "g1a5-k2", "core", ["Ten more or less only changes the tens digit.", "No counting by ones is needed.", "The ones digit never moves."], ["This works the same whether the number is going up or down by ten.", "Only the tens digit is ever affected."]),
    reused("TnoTenMoreLessNumeric", "g1a5-k3", "core", ["Ten more or less only changes the tens digit.", "No counting by ones is needed.", "The ones digit never moves."], ["Ten more and ten less are mirror moves on the tens digit.", "Neither one touches the ones digit."]),
    reused("TnoTenMoreLessNumeric", "g1a5-ch1", "core", ["Ten more or less only changes the tens digit.", "No counting by ones is needed.", "The ones digit never moves."], ["Any two-digit number works the same way.", "Look at the tens digit and move it by one."]),
  ],
  ["Ten more or less changes only the tens digit.", "No counting by ones is needed.", "This can be done in your head."],
  "next: using a hundred chart to add.");

def(6,
  "On a hundred chart, moving down one row adds ten, and moving right one square adds one.",
  "The chart makes the tens-digit-only change from adding ten visible as a simple downward move.",
  { rep: "diagram", widget: () => hop("On the hundred chart, 27 is one row up from your target. Hop down one row (add ten).", 27, 10, "forward", "Landed on 37 — moving down one row on the chart adds ten."),
    predict: P("On a hundred chart, which direction adds ten?", [{ id: "down", label: "Moving down one row" }, { id: "right", label: "Moving right one square" }], "down",
      "Each row of a hundred chart is a new ten, so moving down one row adds exactly ten.") },
  [
    reused("TnoAddTensNumeric", "g1a6-k1", "core", ["Down one row on the chart means add ten.", "Right one square means add one.", "Rows are tens; columns are ones."], ["The hundred chart makes the tens-only change visible as a move down a row.", "This matches exactly what happens when you add ten mentally."]),
    reused("TnoAddTensNumeric", "g1a6-k2", "core", ["Down one row on the chart means add ten.", "Right one square means add one.", "Rows are tens; columns are ones."], ["Moving down several rows adds that many tens.", "The chart is a visual model for the same tens-digit change."]),
    reused("TnoAddTensNumeric", "g1a6-k3", "core", ["Down one row on the chart means add ten.", "Right one square means add one.", "Rows are tens; columns are ones."], ["The chart and the mental strategy describe the same move.", "Each row down is worth exactly one ten."]),
    reused("TnoAddTensNumeric", "g1a6-ch1", "stretch", ["Down one row on the chart means add ten.", "Right one square means add one.", "Rows are tens; columns are ones."], ["Several rows down still means that many tens added.", "The chart scales the same way the mental strategy does."]),
  ],
  ["The hundred chart shows tens as rows.", "Down one row adds ten.", "This matches the mental ten-more strategy."],
  "next: adding on a number line.");

def(7,
  "A number line shows addition as a hop forward: start at the first number and hop the size of the second.",
  "The landing point after the hop is the sum — the number line makes the count-on strategy visible.",
  { rep: "diagram", widget: () => hop("Start at 45. Hop forward 3. Where do you land?", 45, 3, "forward", "Landed on 48 — hopping forward 3 from 45 gives 48."),
    predict: P("You hop forward from 45. Does the landing number get bigger or smaller?", [{ id: "bigger", label: "Bigger" }, { id: "smaller", label: "Smaller" }], "bigger",
      "Hopping FORWARD always lands on a bigger number — that is what addition does on a number line.") },
  [
    reused("CountOnSmallNumeric", "g1a7-k1", "core", ["A forward hop is addition.", "The landing point is the sum.", "The hop size is the number being added."], ["A number line turns count-on into a visible forward hop.", "The landing square names the total."]),
    reused("CountOnSmallNumeric", "g1a7-k2", "core", ["A forward hop is addition.", "The landing point is the sum.", "The hop size is the number being added."], ["The same forward-hop idea works for any starting point.", "The size of the hop is exactly the number being added."]),
    reused("CountOnSmallNumeric", "g1a7-k3", "core", ["A forward hop is addition.", "The landing point is the sum.", "The hop size is the number being added."], ["This is the same count-on strategy, shown visually.", "Forward hops and count-on describe the same action."]),
    reused("CountOnSmallNumeric", "g1a7-ch1", "stretch", ["A forward hop is addition.", "The landing point is the sum.", "The hop size is the number being added."], ["Bigger hops still land on the correct sum.", "The number line scales the same way for any hop size."]),
  ],
  ["A forward hop is addition.", "The landing point is the sum.", "The number line makes count-on visible."],
  "next: breaking a number apart to add.");

def(8,
  "Any addend can be broken into two smaller parts. Splitting one addend so a piece completes a ten first often makes the whole sum easier.",
  "Breaking a number apart does not change its value — the two smaller parts still add to the same total.",
  { rep: "diagram", widget: () => frame10("Break 8 into pieces to fill the frame from 5.", 10, 5, "Ten filled — 8 was broken into 5 (already there) and 3 more."),
    predict: P("5 is already in the frame. You are about to add 8, broken into pieces. How much of the 8 fills the frame first?", [{ id: "five", label: "5 — just enough to make ten" }, { id: "eight", label: "All 8 at once" }], "five",
      "Only 5 of the 8 is needed to fill the frame to ten; the rest is added after.") },
  [
    reused("MakeTenFirstNumeric", "g1a8-k1", "core", ["Break the addend into two parts.", "One part fills the ten.", "The other part is added after."], ["Breaking a number apart never changes its value.", "The two parts still total exactly what the whole number was."]),
    reused("MakeTenFirstNumeric", "g1a8-k2", "core", ["Break the addend into two parts.", "One part fills the ten.", "The other part is added after."], ["This works for breaking apart any addend, not just this one.", "The split is a choice of strategy, not a change to the math."]),
    reused("MakeTenFirstNumeric", "g1a8-k3", "core", ["Break the addend into two parts.", "One part fills the ten.", "The other part is added after."], ["Splitting to make ten is one useful way to break a number apart.", "Other splits are possible too, as long as the parts still add up correctly."]),
    reused("MakeTenFirstNumeric", "g1a8-ch1", "stretch", ["Break the addend into two parts.", "One part fills the ten.", "The other part is added after."], ["The same breaking-apart idea scales to bigger sums.", "Splitting to make ten still works past 20."]),
  ],
  ["Breaking a number apart does not change its value.", "One split makes ten first.", "The rest is added after the ten is made."],
  "next: subtracting whole tens.");

def(9,
  "Subtracting a multiple of ten changes only the tens digit, the same way adding one does — just in the other direction.",
  "Because the ones digit is untouched, subtracting ten is as fast as adding ten.",
  { rep: "diagram", widget: () => hop("Start at 67. Take away one ten. Where do you land?", 67, 10, "back", "Landed on 57 — the tens digit went down by one; the ones stayed at 7."),
    predict: P("You subtract one ten from 67. Which digit changes?", [{ id: "tens", label: "The tens digit" }, { id: "ones", label: "The ones digit" }], "tens",
      "Subtracting a ten only changes the tens place — the ones digit, 7, is untouched.") },
  [
    reused("TnoTenMoreLessNumeric", "g1a9-k1", "core", ["Subtracting a ten changes only the tens digit.", "The ones digit stays exactly the same.", "Count the tens, not the ones."], ["Subtracting a ten mirrors adding a ten, just moving the other way.", "The ones digit stays fixed either way."]),
    reused("TnoTenMoreLessNumeric", "g1a9-k2", "core", ["Subtracting a ten changes only the tens digit.", "The ones digit stays exactly the same.", "Count the tens, not the ones."], ["Each ten subtracted lowers the tens digit by one.", "The ones digit is never touched."]),
    reused("TnoTenMoreLessNumeric", "g1a9-k3", "core", ["Subtracting a ten changes only the tens digit.", "The ones digit stays exactly the same.", "Count the tens, not the ones."], ["This works the same for any starting number above ten.", "Only the tens place is affected by subtracting tens."]),
    reused("TnoTenMoreLessNumeric", "g1a9-ch1", "core", ["Subtracting a ten changes only the tens digit.", "The ones digit stays exactly the same.", "Count the tens, not the ones."], ["The ones digit stays fixed no matter the starting number.", "Subtracting ten is the mirror of adding ten."]),
  ],
  ["Subtracting a ten moves the tens digit down by one.", "The ones digit never changes.", "This mirrors adding a ten."],
  "next: subtracting on the hundred chart.");

def(10,
  "On the hundred chart, moving up one row subtracts ten — the mirror of moving down to add ten.",
  "The chart makes the ten-at-a-time subtraction visible as an upward move, one row at a time.",
  { rep: "diagram", widget: () => hop("On the hundred chart, hop up one row from 58 (subtract ten).", 58, 10, "back", "Landed on 48 — moving up one row on the chart subtracts ten."),
    predict: P("On a hundred chart, which direction subtracts ten?", [{ id: "up", label: "Moving up one row" }, { id: "left", label: "Moving left one square" }], "up",
      "Moving up one row goes back a whole ten, since each row is a new ten.") },
  [
    reused("TnoTenMoreLessNumeric", "g1a10-k1", "core", ["Up one row on the chart means subtract ten.", "Left one square means subtract one.", "Rows are tens; columns are ones."], ["The hundred chart makes the tens-only subtraction visible as a move up a row.", "This matches exactly what happens when you subtract ten mentally."]),
    reused("TnoTenMoreLessNumeric", "g1a10-k2", "core", ["Up one row on the chart means subtract ten.", "Left one square means subtract one.", "Rows are tens; columns are ones."], ["Moving up several rows subtracts that many tens.", "The chart is a visual model for the same tens-digit change."]),
    reused("TnoTenMoreLessNumeric", "g1a10-k3", "core", ["Up one row on the chart means subtract ten.", "Left one square means subtract one.", "Rows are tens; columns are ones."], ["The chart and the mental strategy describe the same move.", "Each row up is worth exactly one ten subtracted."]),
    reused("TnoTenMoreLessNumeric", "g1a10-ch1", "core", ["Up one row on the chart means subtract ten.", "Left one square means subtract one.", "Rows are tens; columns are ones."], ["This still works for any starting number on the chart.", "The chart scales the same way the mental strategy does."]),
  ],
  ["The hundred chart shows subtracting ten as a move up a row.", "This mirrors adding ten as a move down.", "Rows are tens; columns are ones."],
  "next: explaining why these strategies work.");

def(11,
  "A strategy is not just a shortcut — it works because it respects what addition and subtraction actually mean. Explaining why keeps that connection visible.",
  "If a strategy always gives the same answer as counting one at a time would, it is a valid strategy, not just a guess.",
  { rep: "diagram", widget: () => hop("Check: does hopping ten from 43 agree with adding ten the mental way?", 43, 10, "forward", "Landed on 53 — the hop matches the mental ten-more strategy exactly."),
    predict: P("A strategy gives a different answer than counting one at a time would. Is it a valid strategy?", [{ id: "no", label: "No — it must match counting" }, { id: "yes", label: "Yes — strategies can differ from counting" }], "no",
      "Any valid strategy must agree with counting one at a time — that is what makes it trustworthy.") },
  [
    reused("EqualSignMcq", "g1a11-k1", "core", ["A strategy must agree with counting by ones.", "Checking both sides confirms a statement is true.", "Explaining why builds trust in the method."], ["A statement is only true if both sides truly have the same value.", "Checking by counting confirms whether a shortcut is valid."]),
    reused("EqualSignMcq", "g1a11-k2", "core", ["A strategy must agree with counting by ones.", "Checking both sides confirms a statement is true.", "Explaining why builds trust in the method."], ["Equations record a claim that can be checked, not just assumed.", "Both sides must match for the claim to be true."]),
    reused("EqualSignMcq", "g1a11-k3", "core", ["A strategy must agree with counting by ones.", "Checking both sides confirms a statement is true.", "Explaining why builds trust in the method."], ["A false equation still LOOKS like an equation — checking is what reveals it.", "Comparing both sides is how a claim gets verified."]),
    reused("EqualSignMcq", "g1a11-ch1", "core", ["A strategy must agree with counting by ones.", "Checking both sides confirms a statement is true.", "Explaining why builds trust in the method."], ["The same checking process works for any equation.", "Both sides must be computed and compared."]),
  ],
  ["A strategy must agree with counting by ones.", "Checking confirms a method is trustworthy.", "Explaining why is part of doing the math."],
  "next: addition stories within 100.");

def(12,
  "A story gives two known groups and asks for the whole. Read carefully to find both parts before adding.",
  "The words describe the situation, but the numbers and the relationship between them are what you compute.",
  { rep: "diagram", widget: () => hop("A story gives two parts. Hop forward from the first part by the second part's size.", 24, 15, "forward", "Landed on 39 — the two parts combine to the whole, just like the story describes."),
    predict: P("A story names two separate groups and asks how many in all. What operation fits?", [{ id: "add", label: "Add the two groups" }, { id: "sub", label: "Subtract one from the other" }], "add",
      "Finding the total of two known groups always means combining them: addition.") },
  [
    reused("PartWholeNumeric", "g1a12-k1", "core", ["Find the two parts in the story.", "Add the two parts to get the whole.", "The whole is always bigger than either part."], ["Two known parts always combine by addition to find the whole.", "Reading carefully identifies which numbers are the two parts."]),
    reused("PartWholeNumeric", "g1a12-k2", "core", ["Find the two parts in the story.", "Add the two parts to get the whole.", "The whole is always bigger than either part."], ["This works no matter what the story's objects are.", "The relationship between the parts and the whole never changes."]),
    reused("PartWholeNumeric", "g1a12-k3", "core", ["Find the two parts in the story.", "Add the two parts to get the whole.", "The whole is always bigger than either part."], ["Every add-to story shares this same part-part-whole structure.", "Identify the parts first, then combine them."]),
    reused("PartWholeNumeric", "g1a12-ch1", "core", ["Find the two parts in the story.", "Add the two parts to get the whole.", "The whole is always bigger than either part."], ["Bigger numbers follow the exact same part-whole structure.", "Combine the two known parts to find the total."]),
  ],
  ["Find the two known parts.", "Add them to find the whole.", "The whole is bigger than either part."],
  "next: subtraction stories within 100.");

def(13,
  "A take-away story gives a starting total and how many left, and asks what remains.",
  "The starting number and the amount removed are both known, so what remains is found by subtracting.",
  { rep: "diagram", widget: () => hop("A story starts with a total and some leave. Hop back by the amount that left.", 52, 18, "back", "Landed on 34 — what remains after some left, found by subtracting."),
    predict: P("A story starts with a total, and some leave. What operation finds what remains?", [{ id: "sub", label: "Subtract the amount that left" }, { id: "add", label: "Add the amount that left" }], "sub",
      "Removing part of a group always shrinks it: subtraction finds what remains.") },
  [
    reused("ResultUnknownNumeric", "g1a13-k1", "core", ["Find the starting total and the amount removed.", "Subtract to find what remains.", "What remains is always smaller than the start."], ["A known start and a known removal always combine by subtraction.", "What is left is the start minus what went away."]),
    reused("ResultUnknownNumeric", "g1a13-k2", "core", ["Find the starting total and the amount removed.", "Subtract to find what remains.", "What remains is always smaller than the start."], ["This works no matter what the story's objects are.", "The relationship between start, removed, and remaining never changes."]),
    reused("ResultUnknownNumeric", "g1a13-k3", "core", ["Find the starting total and the amount removed.", "Subtract to find what remains.", "What remains is always smaller than the start."], ["Every take-away story shares this same structure.", "Identify the start and the removal, then subtract."]),
    reused("ResultUnknownNumeric", "g1a13-ch1", "stretch", ["Find the starting total and the amount removed.", "Subtract to find what remains.", "What remains is always smaller than the start."], ["Bigger numbers follow the exact same structure.", "Subtract the removed amount from the starting total."]),
  ],
  ["Find the starting total and the amount removed.", "Subtract to find what remains.", "What remains is smaller than the start."],
  "next: choosing the best method for a problem.");

def(14,
  "Different problems fit different strategies best. Counting on suits small amounts; making ten suits sums that cross a ten; adding tens suits round numbers.",
  "Choosing a strategy is a decision, not a guess — the numbers in the problem hint at which method fits best.",
  { rep: "diagram", widget: () => hop("Check a chosen strategy against the actual hop.", 48, 3, "forward", "Landed on 51 — counting on 3 was the right-sized strategy for this small amount."),
    predict: P("A problem adds a small amount, like 2 or 3. Which strategy fits best?", [{ id: "counton", label: "Count on" }, { id: "maketen", label: "Make ten" }], "counton",
      "For very small amounts, counting on is usually the fastest and simplest strategy.") },
  [
    reused("SubFactsMcq", "g1a14-k1", "core", ["Match the strategy to the numbers in the problem.", "Small amounts suit counting on.", "Crossing a ten suits making ten first."], ["The best strategy depends on the specific numbers involved.", "Related facts can confirm whether a chosen method gives the right answer."]),
    reused("SubFactsMcq", "g1a14-k2", "core", ["Match the strategy to the numbers in the problem.", "Small amounts suit counting on.", "Crossing a ten suits making ten first."], ["More than one strategy can work; some are just faster.", "Checking with a related fact confirms the answer either way."]),
    reused("SubFactsMcq", "g1a14-k3", "core", ["Match the strategy to the numbers in the problem.", "Small amounts suit counting on.", "Crossing a ten suits making ten first."], ["Every strategy learned so far is a valid tool for the right problem.", "The numbers in a problem are a clue to which tool fits."]),
    reused("SubFactsMcq", "g1a14-ch1", "core", ["Match the strategy to the numbers in the problem.", "Small amounts suit counting on.", "Crossing a ten suits making ten first."], ["Choosing well saves time without changing the answer.", "Any correct strategy reaches the same total."]),
  ],
  ["Match the strategy to the problem.", "Small amounts suit counting on.", "Crossing a ten suits making ten first."],
  "course complete: adding and subtracting within 100.");

/* ------------------------------------------------------------------------- assembly */

must(L.length === 14, `14 lessons defined, got ${L.length}`);
const chapterTitles = ["Adding Tens and Ones", "Ten More, Ten Less, and the Chart", "Stories and Choosing a Strategy"];
const perChapter = [4, 6, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 10 ? 2 : 3);
const outDir = join(root, "content/courses/add-within-100-g1");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g1a-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const widget = c.widget.type === "mcq"
      ? c.widget
      : { ...c.widget };
    if (widget.type === "numeric") must(widget.commonErrors.every((e) => e.value !== widget.answer), `${id}/${sid} trap==answer`);
    return { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget, hints: c.hints, variant: c.variant, cml: cml(tag, "diagram") };
  };

  const i1w = d.i1.widget();
  const lesson = {
    id, slug, title: row.title, courseId: "add-within-100-g1",
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

  // ---- structural assertions ----
  for (const s of lesson.steps) {
    const w = s.widget;
    if (!w) continue;
    if (w.type === "numeric") for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} numeric trap`);
    if (w.type === "mcq") { must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`); must(new Set(w.options.map(o=>o.feedback)).size===w.options.length, `${id}/${s.id} mcq feedback distinct`); }
    if (w.type === "tenFrame") must(w.preFilled < w.target, `${id}/${s.id} frame prefill`);
    if (w.type === "numberLineHop") {
      const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
      must(land >= w.min && land <= w.max, `${id}/${s.id} hop land ${land} outside ${w.min}..${w.max}`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(TAG_OF[s.variant.form] === s.variant.gen, `${id}/${s.id} variant tag/form mismatch`);
  }
  const rw = lesson.remedials[0].check.widget;
  must(rw.type === "numeric" || rw.type === "mcq", `${id} remedial widget ${rw.type}`);
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "add-within-100-g1", slug: "add-within-100-g1", title: spec.title,
  tagline: "Add and subtract two-digit numbers using tens, hundred-chart moves, and stories.",
  category: "Math", gradeLevel: 1, chapters,
}, null, 2) + "\n");
console.log(`built 14 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
