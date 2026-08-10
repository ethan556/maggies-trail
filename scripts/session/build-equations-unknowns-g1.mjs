#!/usr/bin/env node
// S191 — PROTOCOL v2, Batch A course 3 of 3: equations-unknowns-g1 (1.OA.D.7/D.8), built
// entirely on TWO PRE-EXISTING generator families: g1-add-subtract (EqualSign*, Unknown*,
// FactFamily, SubFacts — g1Variants.ts, routed in g1Independent.cjs) and unknown-letter
// (solveAdd, solveSubtract, testAddSolution, checkAddSolution, equationVsExpression —
// variants.ts, routed per-form in variants.test.ts since G3-era). Zero edits to any generator,
// solver, tag-route, or resolver file. Numeric prompts parse under the ALREADY-SHIPPED routes
// for their declared forms; session191.batchA.test.ts re-derives every numeric answer with the
// REAL g1 solver or an independent brute-force search (never the inverse operation, never these
// mirrors). Deviation from HANDOVER's fit line, documented: unknown-letter@solveFor is
// multiplication-shaped (`b × 4 = 12`) and is a G1 misfit — replaced by the same family's
// solveAdd/solveSubtract, which are the addition/subtraction unknowns 1.OA.D.8 actually names.
// MCQs: 4 options minimum (protocol v2 point 4); authored reframes declare the nearest shipped
// form per S190's EqualSignMcq precedent.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "equations-unknowns-g1");
if (!spec || spec.lessons.length !== 12) throw new Error("spec course missing or wrong size");

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

/* ---- numeric mirrors: prompt shapes parse under shipped routes ---- */
// g1Independent.cjs UnknownNumeric route: '+' present → n1−n0 ; else → n0−n1.
function UnknownEndNumeric(r, b) { // "unknown at the end" = the result: tag default route (opVal)
  const a = pick(r, 3, hi(b, 8, 10, 12)), c = pick(r, 2, Math.min(7, 18 - a));
  return { gen: "g1-add-subtract", form: "PartWholeNumeric", prompt: `${a} + ${c} = ?`, answer: a + c,
    commonErrors: [[a, `That is only the first addend; the unknown at the end is the whole total.`], [Math.abs(a - c), `That finds a difference, but the equation joins the two parts.`]] };
}
function UnknownMiddleNumeric(r, b) {
  const total = pick(r, 8, hi(b, 14, 18, 18));
  let known = pick(r, 2, total - 2);
  if (2 * known === total) known = known > 2 ? known - 1 : known + 1; // trap-collision guard: known must not equal the answer
  return { gen: "g1-add-subtract", form: "UnknownNumeric", prompt: `${known} + ? = ${total}. What is the missing number?`, answer: total - known,
    commonErrors: [[total, `That is the whole, not the missing part.`], [known, `That repeats the known addend.`]] };
}
function UnknownStartNumeric(r, b) {
  const total = pick(r, 8, hi(b, 14, 18, 18));
  let known = pick(r, 2, total - 2);
  if (2 * known === total) known = known > 2 ? known - 1 : known + 1; // trap-collision guard
  return { gen: "g1-add-subtract", form: "UnknownNumeric", prompt: `? + ${known} = ${total}. What is the missing number?`, answer: total - known,
    commonErrors: [[total, `That is the whole, not the missing part.`], [known, `That repeats the known addend.`]] };
}
function UnknownSubNumeric(r, b) {
  const whole = pick(r, 9, hi(b, 15, 19, 19));
  let remain = pick(r, 2, whole - 2);
  if (2 * remain === whole) remain = remain > 2 ? remain - 1 : remain + 1; // trap-collision guard
  return { gen: "g1-add-subtract", form: "UnknownNumeric", prompt: `${whole} − ? = ${remain}. What was taken away?`, answer: whole - remain,
    commonErrors: [[remain, `That is what remains, not what was removed.`], [whole, `That is the starting whole.`]] };
}
function EqualSignNumeric(r) {
  const a = pick(r, 3, 8), b = pick(r, 2, 7);
  let c = pick(r, 2, a + b - 1);
  if (2 * c === a + b) c = c > 2 ? c - 1 : c + 1; // trap-collision guard: c must not equal the answer
  return { gen: "g1-add-subtract", form: "EqualSignNumeric", prompt: `Make both sides equal: ${a} + ${b} = ${c} + ?`, answer: a + b - c,
    commonErrors: [[a + b, `That is the whole value of the left side, not the missing addend after ${c}.`], [c, `Repeating ${c} does not necessarily balance both sides.`]] };
}
function FactFamilyNumeric(r) {
  const a = pick(r, 3, 9);
  let b = pick(r, 2, 9);
  if (b === a) b = b > 2 ? b - 1 : b + 1; // trap-collision guard: the "other part" trap must differ from the answer
  const t = a + b;
  return { gen: "g1-add-subtract", form: "FactFamilyNumeric", prompt: `Fact family ${a}, ${b}, ${t}: ${t} − ${a} = ?`, answer: b,
    commonErrors: [[a, `That subtracts the other part. The missing partner is ${b}.`], [t, `That repeats the whole instead of removing ${a}.`]] };
}
// unknown-letter routes: solveAdd expects "x + a = total"; solveSubtract expects "Solve x − a = result."
function SolveAddNumeric(r) {
  const x = pick(r, 3, 8), a = pick(r, 2, 6), total = x + a;
  return { gen: "unknown-letter", form: "solveAdd", prompt: `Which value of x makes x + ${a} = ${total} true?`, answer: x,
    commonErrors: [[total + a, `${total + a} adds ${a} again. The equation already added ${a}, so remove it from ${total}.`], [total, `${total} is the right side of the equation. Substituting it for x would make the left side too large.`]] };
}
function SolveSubtractNumeric(r) {
  const a = pick(r, 2, 6), result = pick(r, 2, 8), x = a + result;
  return { gen: "unknown-letter", form: "solveSubtract", prompt: `Solve x − ${a} = ${result}.`, answer: x,
    commonErrors: [[Math.abs(result - a), `That subtracts ${a} again. To undo subtracting ${a}, add ${a} back.`], [result, `That is the amount left after subtracting, not the starting value x.`]] };
}
/* ---- MCQ mirrors (structural gates; 4 options each) ---- */
function EqualValueMcq(r) { // S190's reframed EqualSignMcq: which value makes the equation true
  const a = pick(r, 3, 9), b = pick(r, 3, 9), sum = a + b;
  const opts = [
    { label: `${sum}`, correct: true, feedback: `Correct — ${a} + ${b} is ${sum}, so ${sum} is the value that makes the statement true.` },
    { label: `${sum + 1}`, correct: false, feedback: `Check by adding again: ${a} + ${b} is ${sum}, not this value.` },
    { label: `${sum + 2}`, correct: false, feedback: `That overshoots the actual sum of ${a} and ${b}, which is ${sum}.` },
    { label: `${Math.abs(a - b) !== sum ? Math.abs(a - b) : sum - 1}`, correct: false, feedback: `That is the DIFFERENCE between ${a} and ${b}, not their sum.` },
  ];
  return { gen: "g1-add-subtract", form: "EqualSignMcq", prompt: `${a} + ${b} = ? Which value makes this equation true?`, options: opts, answerLabel: opts[0].label };
}
function WhichTrueMcq(r) { // the true/false judgment with four full equations, one true
  const a = pick(r, 3, 8), b = pick(r, 2, 7), s = a + b;
  const opts = [
    { label: `${a} + ${b} = ${s}`, correct: true, feedback: `Correct — both sides name the same value, ${s}, so the equation is true.` },
    { label: `${a} + ${b} = ${s + 1}`, correct: false, feedback: `The left side is ${s}; naming ${s + 1} on the right makes the sides unequal, so it is false.` },
    { label: `${a} + ${b + 1} = ${s}`, correct: false, feedback: `The left side here is ${s + 1}, which does not match the ${s} on the right.` },
    { label: `${a} + ${a} = ${s}${2 * a === s ? " + 1" : ""}`, correct: false, feedback: `Check the left side by adding: it does not equal the value written on the right.` },
  ];
  return { gen: "g1-add-subtract", form: "EqualSignMcq", prompt: `Which of these equations is TRUE?`, options: opts, answerLabel: opts[0].label };
}
function RightSideMcq(r) { // total written first: "13 = 9 + __"
  const total = pick(r, 8, 15), known = pick(r, 2, total - 3), miss = total - known;
  const opts = [
    { label: `${miss}`, correct: true, feedback: `Correct — ${known} + ${miss} = ${total}, so the sides match even with the total written first.` },
    { label: `${total}`, correct: false, feedback: `The total is already written on the left; the blank needs the part that joins ${known} to reach it.` },
    { label: `${known}`, correct: false, feedback: `That repeats the known addend instead of completing the sum to ${total}.` },
    { label: `${total + known}`, correct: false, feedback: `That adds the total and the known part; the blank is the smaller missing part.` },
  ];
  return { gen: "g1-add-subtract", form: "EqualSignMcq", prompt: `${total} = ${known} + __. Which number completes the true equation?`, options: opts, answerLabel: opts[0].label };
}
function TestSolutionMcq(r) {
  const a = pick(r, 2, 6), solution = pick(r, 3, 8);
  const candidate = solution + (r() < 0.5 ? 0 : (r() < 0.5 ? -1 : 1));
  const total = solution + a;
  const works = candidate + a === total;
  const yes = `Yes — ${candidate} + ${a} = ${total}`;
  const no = `No — ${candidate} + ${a} = ${candidate + a}, not ${total}`;
  const opts = [
    { label: works ? yes : no, correct: true, feedback: works ? `Substituting ${candidate} makes both sides equal ${total}, so it is a solution.` : `Substituting ${candidate} gives ${candidate + a}, so the equation is not true.` },
    { label: works ? no : yes, correct: false, feedback: works ? `The substitution actually balances the equation at ${total}.` : `A value is a solution only when substitution makes the two sides equal.` },
    { label: `Every number is a solution`, correct: false, feedback: `An equation accepts only values that make its equality true; most values do not.` },
    { label: `x has no value because it is a letter`, correct: false, feedback: `The letter stands in for a hidden number; testing a value is exactly how it is uncovered.` },
  ];
  return { gen: "unknown-letter", form: "testAddSolution", prompt: `Is x = ${candidate} a solution of x + ${a} = ${total}?`, options: opts, answerLabel: opts[0].label };
}
function CheckAnswerMcq(r) {
  const a = pick(r, 2, 6), x = pick(r, 3, 8), total = x + a;
  const opts = [
    { label: `Substitute ${x}: verify ${x} + ${a} = ${total}`, correct: true, feedback: `Putting the proposed value into the original equation directly tests whether both sides match.` },
    { label: `Add the same number again without using the equation`, correct: false, feedback: `A check must test the proposed value in the original relationship, not perform an unrelated operation.` },
    { label: `Assume the answer is right because it is positive`, correct: false, feedback: `The sign or size alone cannot prove an equation is balanced.` },
    { label: `Change the equals sign to a plus sign`, correct: false, feedback: `That would create a different expression rather than checking the original equation.` },
  ];
  return { gen: "unknown-letter", form: "checkAddSolution", prompt: `You solved x + ${a} = ${total} and got x = ${x}. How do you check it?`, options: opts, answerLabel: opts[0].label };
}
function EquationVsExpressionMcq(r) {
  const a = pick(r, 2, 7), b = pick(r, 2, 7), s = a + b;
  const opts = [
    { label: `${a} + ${b} = ${s}`, correct: true, feedback: `An equation contains an equals sign that states two quantities have the same value.` },
    { label: `${a} + ${b}`, correct: false, feedback: `This is an expression: it names a quantity but makes no equality statement.` },
    { label: `${s} − ${b}`, correct: false, feedback: `This is also an expression because there is no equals sign.` },
    { label: `${a} and ${b}`, correct: false, feedback: `Two numbers side by side make neither an expression nor an equation without an operation and an equals sign.` },
  ];
  return { gen: "unknown-letter", form: "equationVsExpression", prompt: `Which choice is an equation rather than only an expression?`, options: opts, answerLabel: opts[0].label };
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
  return { gen: "g1-add-subtract", form: "SubFactsMcq", prompt: `Which addition fact helps solve ${total} − ${sub}?`, options: opts, answerLabel: opts[0].label };
}
function WriteOwnMcq(r) {
  const a = pick(r, 2, 7), b = pick(r, 2, 7), s = a + b;
  const opts = [
    { label: `${a} + ${b} = ${s}`, correct: true, feedback: `Correct — this statement is true because both sides have the value ${s}.` },
    { label: `${a} + ${b} = ${s + 2}`, correct: false, feedback: `A written equation must be TRUE; the left side is ${s}, not ${s + 2}.` },
    { label: `${a} + ${b}`, correct: false, feedback: `Without an equals sign this is an expression, not an equation.` },
    { label: `${s} = ${s + 1}`, correct: false, feedback: `An equals sign between two different values makes a false statement, not a usable equation.` },
  ];
  return { gen: "g1-add-subtract", form: "EqualSignMcq", prompt: `You want to write your own TRUE equation. Which one works?`, options: opts, answerLabel: opts[0].label };
}

const REUSE = {
  UnknownEndNumeric, UnknownMiddleNumeric, UnknownStartNumeric, UnknownSubNumeric,
  EqualSignNumeric, FactFamilyNumeric, SolveAddNumeric, SolveSubtractNumeric,
  EqualValueMcq, WhichTrueMcq, RightSideMcq, TestSolutionMcq, CheckAnswerMcq,
  EquationVsExpressionMcq, SubFactsMcq, WriteOwnMcq,
};
const OK_TAGS = new Set(["g1-add-subtract", "unknown-letter"]);

function reused(mirror, seedStr, band, hints, ev, fallback = "Recompute the quantities and relationship shown, one step at a time.") {
  const r = mulberry32(seedFromString(seedStr));
  const out = REUSE[mirror](r, band);
  must(!!out && OK_TAGS.has(out.gen) && typeof out.form === "string", `${mirror}: gen/form`);
  if (out.options) {
    must(out.options.length >= 4, `${mirror} needs >=4 options (protocol v2 point 4)`);
    must(new Set(out.options.map((o) => o.label)).size === out.options.length, `${mirror} mcq duplicate labels: ${out.options.map((o) => o.label).join(",")}`);
    must(out.options.filter((o) => o.correct).length === 1, `${mirror} mcq correct count`);
    // Authored order keeps the correct option at index 0, matching the corpus convention that
    // src/components/optionOrder.test.tsx pins (>0.95). Learner-facing order is randomized at
    // RENDER time by the seeded lessonId:stepId shuffle — authoring-time rotation adds nothing
    // for the learner and drags a documented corpus invariant below its threshold.
    const rotated = out.options.map((o, i) => ({ id: `o${i}`, ...o }));
    for (const o of rotated) must(o.feedback.length >= 25, `${mirror} mcq feedback short`);
    must(new Set(rotated.map((o) => o.feedback)).size === rotated.length, `${mirror} mcq feedback not distinct`);
    return {
      variant: { gen: out.gen, form: out.form },
      widget: { type: "mcq", prompt: out.prompt, options: rotated.map(({ answerLabel, ...o }) => o) },
      hints, ev, answerLabel: out.answerLabel,
    };
  }
  const commonErrors = out.commonErrors
    .filter(([v]) => v !== out.answer)
    .map(([value, feedback]) => { must(feedback.length >= 25, `${mirror} trap feedback short`); return { value, feedback }; });
  must(commonErrors.length >= 2, `${mirror} needs 2 live traps`);
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `${mirror} duplicate traps`);
  return {
    variant: { gen: out.gen, form: out.form },
    widget: { type: "numeric", prompt: out.prompt, answer: out.answer, tolerance: 0, unit: "", commonErrors,
      fallbackFeedback: fallback, successFeedback: `Correct — the value ${out.answer} makes the statement true.` },
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
  fadeLevel: 0, transferFamily: `equations-unknowns-g1:${tag}`, delayed: true,
  counterfactualPrompt: "What change would make the model stop representing the same mathematical relationship?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

/* -------------------------------------------------------------- lesson definitions (12) --- */
const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

const H = {
  equal: ["The equal sign says both sides have the same value.", "Find the value of the complete side first.", "Make the other side name that same value."],
  tf: ["Work out each side's value.", "Compare the two values.", "True means the values match exactly."],
  unknown: ["The unknown hides one number of the fact.", "Use the two known numbers to find it.", "Check by putting the answer back in."],
  sub: ["The whole and what remains are known.", "What was removed is the gap between them.", "Check: remaining plus removed rebuilds the whole."],
  family: ["The family's three numbers appear in every related fact.", "Whole minus one part is the other part.", "One known fact unlocks the family."],
  check: ["Put the answer back into the original equation.", "Work out both sides.", "Matching sides mean the answer is right."],
  write: ["A true equation needs an equals sign.", "Both sides must name the same value.", "Check the value of each side before writing."],
};

def(1,
  "The equal sign is not a command to answer — it is a claim: the two sides name the same value. 4 + 3 = 7 says both sides are worth seven.",
  "Reading an equation means checking the claim: value the left side, value the right side, and see that they match.",
  { rep: "diagram", widget: () => frame10("One side of an equation shows 10. Fill the frame so this side shows the same ten.", 10, 6, "Ten filled — both sides now name the same value, which is exactly what the equal sign claims."),
    predict: P("An equation's two sides are compared. What must be the same?", [{ id: "value", label: "Their value" }, { id: "look", label: "How they look" }], "value",
      "The sides may look different; the equal sign only claims their VALUES match.") },
  [
    reused("EqualValueMcq", "g1e1-k1", "core", H.equal, ["The equal sign claims both sides share one value.", "Valuing each side tests the claim."]),
    reused("EqualValueMcq", "g1e1-k2", "core", H.equal, ["An equation is a statement, not a command.", "The value that balances the claim completes it."]),
    reused("EqualSignNumeric", "g1e1-k3", "core", H.equal, ["Different-looking sides can share one value.", "Balancing the blank makes the claim true."]),
    reused("WhichTrueMcq", "g1e1-ch1", "stretch", H.tf, ["Only a matching-value claim is true.", "Value both sides before judging."]),
  ],
  ["The equal sign claims same value.", "Value each side to test the claim.", "Sides can look different and still match."],
  "next: judging equations true or false.");

def(2,
  "Some equations tell the truth and some do not. 5 + 2 = 7 is true; 5 + 2 = 8 is false, because the sides have different values.",
  "Judging an equation is a two-step check: value each side, then compare. No guessing needed.",
  { rep: "diagram", widget: () => hop("Test the claim 8 + 3 = 11: start at 8 and count on 3. Where do you land?", 8, 3, "forward", "Landed on 11 — the left side really is 11, so the claim is TRUE."),
    predict: P("An equation claims 8 + 3 = 11. Before checking, is a claim automatically true?", [{ id: "check", label: "No — it must be checked" }, { id: "auto", label: "Yes — equations are always true" }], "check",
      "Written claims can be wrong; valuing both sides is what settles it.") },
  [
    reused("WhichTrueMcq", "g1e2-k1", "core", H.tf, ["True means the two values match exactly.", "One value off by one makes the whole claim false."]),
    reused("WhichTrueMcq", "g1e2-k2", "core", H.tf, ["Every claim gets the same two-step check.", "Value each side, then compare."]),
    reused("EqualValueMcq", "g1e2-k3", "core", H.tf, ["The true claim is the one whose sides agree.", "Adding carefully settles it without guessing."]),
    reused("WhichTrueMcq", "g1e2-ch1", "stretch", H.tf, ["Harder numbers use the exact same check.", "Only matching values make TRUE."]),
  ],
  ["Equations can be true or false.", "Value each side, then compare.", "Matching values make it true."],
  "next: balancing both sides yourself.");

def(3,
  "A balanced equation can have work on both sides: 4 + 5 = 6 + 3. Both sides are worth nine, so the claim holds.",
  "To balance a side with a blank, first find the complete side's value — then fill the blank so the other side reaches the same value.",
  { rep: "diagram", widget: () => hop("Balance check for 4 + 5 = 6 + 3: value the right side. Start at 6 and count on 3. Where do you land?", 6, 3, "forward", "Landed on 9 — the right side is 9, matching the left side's 9. The equation balances."),
    predict: P("4 + 5 = 6 + __. What should the blank make the right side equal?", [{ id: "nine", label: "9 — the left side's value" }, { id: "six", label: "6 — the number already there" }], "nine",
      "The blank's job is to lift the right side to the left side's value, nine.") },
  [
    reused("EqualSignNumeric", "g1e3-k1", "core", H.equal, ["Value the complete side first.", "The blank takes whatever balances the other side."]),
    reused("EqualSignNumeric", "g1e3-k2", "core", H.equal, ["Both sides can hold work; only the values must match.", "Balancing is matching values, not copying numbers."]),
    reused("EqualSignNumeric", "g1e3-k3", "core", H.equal, ["Each new pair balances the same way.", "Find one side's value; make the other reach it."]),
    reused("EqualSignNumeric", "g1e3-ch1", "stretch", H.equal, ["Bigger numbers balance identically.", "Value, then match."]),
  ],
  ["Both sides can hold work.", "Value the complete side first.", "Fill the blank to match that value."],
  "next: totals written on the left.");

def(4,
  "The total can be written first: 12 = 8 + 4 is a true equation. The equal sign does not care which side holds the sum.",
  "Reading 12 = 8 + __ works the same way as always: the right side must be worth the twelve already named on the left.",
  { rep: "diagram", widget: () => hop("Check 12 = 8 + 4: value the right side. Start at 8 and count on 4. Where do you land?", 8, 4, "forward", "Landed on 12 — the right side reaches the 12 named first, so the equation is true even written this way."),
    predict: P("12 = 8 + 4 puts the total first. Is it still a true equation?", [{ id: "yes", label: "Yes — the sides still match" }, { id: "no", label: "No — totals must come last" }], "yes",
      "The equal sign only compares values; either side may hold the total.") },
  [
    reused("RightSideMcq", "g1e4-k1", "core", H.equal, ["The total may sit on either side.", "The blank completes the side that still needs value."]),
    reused("RightSideMcq", "g1e4-k2", "core", H.equal, ["Reading direction does not change the claim.", "Match the working side to the named total."]),
    reused("RightSideMcq", "g1e4-k3", "core", H.equal, ["Total-first equations follow the same rules.", "Find the part that completes the match."]),
    reused("EqualSignNumeric", "g1e4-ch1", "stretch", H.equal, ["Work can appear on both sides at once.", "Values matching is all that matters."]),
  ],
  ["The total can be written first.", "The equal sign compares values only.", "Complete the working side to match."],
  "next: sums on both sides at once.");

def(5,
  "Two different sums can stand on the two sides: 3 + 6 = 4 + 5. Both are worth nine, so the equation is true.",
  "This is the deepest reading of the equal sign — not an answer arrow, but a balance between any two ways of naming one value.",
  { rep: "diagram", widget: () => hop("Check 3 + 6 = 4 + 5: value the right side. Start at 4 and count on 5. Where do you land?", 4, 5, "forward", "Landed on 9 — the right sum is 9, the same nine the left sum makes. Two sums, one value."),
    predict: P("3 + 6 sits on the left and 4 + 5 on the right. Can the equation be true?", [{ id: "can", label: "Yes — if both sums share a value" }, { id: "cannot", label: "No — two sums can never be equal" }], "can",
      "Any two ways of naming the same value can face each other across the equal sign.") },
  [
    reused("EqualSignNumeric", "g1e5-k1", "core", H.equal, ["Two sums balance when their values agree.", "Value one side; make the other reach it."]),
    reused("EqualSignNumeric", "g1e5-k2", "core", H.equal, ["The equal sign is a balance, not an answer arrow.", "Either side may hold any work."]),
    reused("WhichTrueMcq", "g1e5-k3", "core", H.tf, ["Only value-matching sums make a true claim.", "Check both sides before judging."]),
    reused("EqualSignNumeric", "g1e5-ch1", "stretch", H.equal, ["Bigger sums balance the same way.", "One value, two names."]),
  ],
  ["Sums can stand on both sides.", "The equal sign is a balance.", "True means one shared value."],
  "next: a number goes missing at the end.");

def(6,
  "An unknown can hide at the end of a fact: 5 + 3 = __. The two parts are known; the unknown is the total they make.",
  "Finding an end-unknown is joining: put the two known parts together and the hidden total appears.",
  { rep: "diagram", widget: () => hop("Find the end-unknown of 9 + 3 = __: start at 9 and count on 3. Where do you land?", 9, 3, "forward", "Landed on 12 — joining the two known parts reveals the hidden total."),
    predict: P("In 9 + 3 = __, which number is hiding?", [{ id: "total", label: "The total" }, { id: "part", label: "One of the parts" }], "total",
      "Both parts are visible; the blank at the end hides the total they make.") },
  [
    reused("UnknownEndNumeric", "g1e6-k1", "core", H.unknown, ["An end-unknown is the total of the two parts.", "Joining the parts reveals it."]),
    reused("UnknownEndNumeric", "g1e6-k2", "core", H.unknown, ["The known numbers do the work.", "The blank simply names what they make."]),
    reused("UnknownEndNumeric", "g1e6-k3", "core", H.unknown, ["Every end-unknown is found the same way.", "Add the parts; read the total."]),
    reused("SolveAddNumeric", "g1e6-ch1", "stretch", H.unknown, ["A letter can hold the hiding place too.", "x is just a name for the hidden number."]),
  ],
  ["The end-unknown is the total.", "Join the known parts to find it.", "A letter can name the hiding place."],
  "next: the unknown moves to the middle.");

def(7,
  "The unknown can hide in the middle: 5 + __ = 12. One part and the total are known; the missing part is what joins 5 to reach 12.",
  "The total already contains both parts — removing the known part from it leaves exactly the hidden one.",
  { rep: "diagram", widget: () => hop("Find the middle-unknown of 5 + __ = 12: start at 12 and count back 5. Where do you land?", 12, 5, "back", "Landed on 7 — removing the known 5 from the total 12 leaves the hidden 7.",
      [[8, "That removes one too few; take away the whole known part of 5."]]),
    predict: P("In 5 + __ = 12, is the hidden number bigger or smaller than 12?", [{ id: "smaller", label: "Smaller — it is only a part" }, { id: "bigger", label: "Bigger — it beats the total" }], "smaller",
      "A part can never exceed its own total; the hidden number fits inside 12.") },
  [
    reused("UnknownMiddleNumeric", "g1e7-k1", "core", H.unknown, ["The total minus the known part is the hidden part.", "A part is always smaller than its total."]),
    reused("UnknownMiddleNumeric", "g1e7-k2", "core", H.unknown, ["The hidden number completes the journey to the total.", "Check by adding it back."]),
    reused("UnknownMiddleNumeric", "g1e7-k3", "core", H.unknown, ["Every middle-unknown works the same way.", "Remove the known; keep the hidden."]),
    reused("SolveAddNumeric", "g1e7-ch1", "stretch", H.unknown, ["With a letter it reads x + a = total.", "The same removal finds x."]),
  ],
  ["The middle-unknown is a missing part.", "Total minus known part finds it.", "Adding it back checks it."],
  "next: the unknown hides at the start.");

def(8,
  "The unknown can even hide at the start: __ + 4 = 11. The strategy does not change — the total still holds both parts.",
  "Position never matters for finding a missing part: remove the known part from the total, and the hidden starter appears.",
  { rep: "diagram", widget: () => hop("Find the start-unknown of __ + 4 = 11: start at 11 and count back 4. Where do you land?", 11, 4, "back", "Landed on 7 — the hidden starter is 7, because 7 + 4 rebuilds 11."),
    predict: P("__ + 4 = 11 hides the first number. Does the finding strategy change?", [{ id: "same", label: "No — total minus known part" }, { id: "new", label: "Yes — start-unknowns need a new rule" }], "same",
      "Whichever slot hides, the total still equals the two parts joined; remove the known one.") },
  [
    reused("UnknownStartNumeric", "g1e8-k1", "core", H.unknown, ["A start-unknown is still just a missing part.", "The total minus the known part reveals it."]),
    reused("UnknownStartNumeric", "g1e8-k2", "core", H.unknown, ["Position changes nothing about parts and totals.", "Check by rebuilding the total."]),
    reused("UnknownStartNumeric", "g1e8-k3", "core", H.unknown, ["The same removal works in every slot.", "Known part out, hidden part found."]),
    reused("SolveAddNumeric", "g1e8-ch1", "stretch", H.unknown, ["A letter at the start reads x + a = total.", "The same strategy solves it."]),
  ],
  ["Start-unknowns are missing parts too.", "Total minus known part — always.", "Rebuild the total to check."],
  "next: unknowns inside subtraction.");

def(9,
  "Subtraction hides unknowns too: 14 − __ = 9 asks what was taken away. The start and what remains are both visible.",
  "The amount removed is the gap between the start and what remains — and adding it back to the remainder must rebuild the start.",
  { rep: "diagram", widget: () => hop("Find the removed amount of 14 − __ = 9: start at 14 and count back to 9, counting the hops. How many hops?", 14, 5, "back", "Five hops — the gap between 14 and 9 is the 5 that was taken away.",
      [[10, "That is one hop short of reaching 9; keep hopping until you land on what remains."]]),
    predict: P("14 − __ = 9. Is the removed amount bigger or smaller than 14?", [{ id: "smaller", label: "Smaller — only part was removed" }, { id: "bigger", label: "Bigger — more than the start" }], "smaller",
      "Something remains, so only part of the 14 left; the removed amount fits inside it.") },
  [
    reused("UnknownSubNumeric", "g1e9-k1", "core", H.sub, ["The removed amount is the gap start-to-remainder.", "Remainder plus removed rebuilds the start."]),
    reused("UnknownSubNumeric", "g1e9-k2", "core", H.sub, ["The start and remainder are the two clues.", "Their gap is exactly what left."]),
    reused("UnknownSubNumeric", "g1e9-k3", "core", H.sub, ["Every removed-unknown is a gap question.", "Find the distance between start and remainder."]),
    reused("SolveSubtractNumeric", "g1e9-ch1", "stretch", H.sub, ["A letter start reads x − a = remainder.", "Adding a back to the remainder finds x."]),
  ],
  ["Subtraction hides unknowns too.", "The removed amount is a gap.", "Remainder plus removed rebuilds the start."],
  "next: one fact family solves them all.");

def(10,
  "Every unknown so far lives inside one fact family: two parts and a whole. Naming the family turns any unknown into a known fact.",
  "For 5 + __ = 12, the family is 5, 7, 12 — and the family member 12 − 5 = 7 hands over the answer directly.",
  { rep: "diagram", widget: () => hop("Use the family 5, 7, 12 on 5 + __ = 12: start at 12 and count back 5. Where do you land?", 12, 5, "back", "Landed on 7 — the family fact 12 − 5 = 7 solved the unknown in one step."),
    predict: P("5 + __ = 12 and 12 − 5 = __ come from the same family. Do they share an answer?", [{ id: "share", label: "Yes — the same hidden 7" }, { id: "differ", label: "No — different unknowns" }], "share",
      "Both facts rearrange the same three family numbers, so the hidden value is one and the same.") },
  [
    reused("FactFamilyNumeric", "g1e10-k1", "core", H.family, ["Name the family's three numbers first.", "The subtraction member reveals the missing part."]),
    reused("SubFactsMcq", "g1e10-k2", "core", H.family, ["A related addition fact can solve a subtraction.", "Ask which part rebuilds the whole."]),
    reused("FactFamilyNumeric", "g1e10-k3", "core", H.family, ["One known family fact unlocks the rest.", "Parts and whole trade places, never values."]),
    reused("FactFamilyNumeric", "g1e10-ch1", "stretch", H.family, ["Bigger families follow the same pattern.", "Whole minus one part is the other part."]),
  ],
  ["Unknowns live inside fact families.", "Name the family's three numbers.", "The right family member is the answer."],
  "next: proving an answer is right.");

def(11,
  "An answer to an unknown can be PROVEN: put it back into the original equation and value both sides. Matching sides mean the answer is right.",
  "Substitution is the universal check — it works on every unknown, in every position, without redoing the solving.",
  { rep: "diagram", widget: () => hop("Check the claim x = 7 for x + 4 = 11: start at 7 and count on 4. Where do you land?", 7, 4, "forward", "Landed on 11 — substituting 7 makes the left side reach 11 exactly, proving the answer."),
    predict: P("An answer is substituted back and the sides match. What does that prove?", [{ id: "right", label: "The answer is right" }, { id: "nothing", label: "Nothing — checks prove nothing" }], "right",
      "Matching sides after substitution is exactly what being a solution means.") },
  [
    reused("CheckAnswerMcq", "g1e11-k1", "core", H.check, ["Substitution tests the value in the original claim.", "Matching sides prove the answer."]),
    reused("TestSolutionMcq", "g1e11-k2", "core", H.check, ["A candidate either balances the sides or it does not.", "Valuing both sides settles it."]),
    reused("TestSolutionMcq", "g1e11-k3", "core", H.check, ["Most values fail an equation's test.", "Only the true solution balances it."]),
    reused("CheckAnswerMcq", "g1e11-ch1", "stretch", H.check, ["The same check works in every unknown position.", "Substitute, value, compare."]),
  ],
  ["Substitute the answer back in.", "Value both sides.", "Matching sides prove it right."],
  "next: writing a true equation of your own.");

def(12,
  "Writing an equation means making a TRUE claim: choose values, join them, and make sure both sides really name the same value.",
  "A finished equation earns its equals sign — an expression with no claim, or a claim whose sides disagree, is not yet an equation worth keeping.",
  { rep: "diagram", widget: () => hop("Write-and-check: your equation says 6 + 3 = 9. Verify it — start at 6 and count on 3. Where do you land?", 6, 3, "forward", "Landed on 9 — your written claim holds, so it is a true equation worth keeping."),
    predict: P("You write an equation of your own. What must you do before trusting it?", [{ id: "check", label: "Check both sides match" }, { id: "trust", label: "Nothing — writing makes it true" }], "check",
      "A written claim is only an equation once its sides are verified to match.") },
  [
    reused("WriteOwnMcq", "g1e12-k1", "core", H.write, ["A true equation's sides must really match.", "Check the values before keeping the claim."]),
    reused("EquationVsExpressionMcq", "g1e12-k2", "core", H.write, ["An equals sign is what makes it an equation.", "Expressions name values but claim nothing."]),
    reused("WriteOwnMcq", "g1e12-k3", "core", H.write, ["A false claim is not a keeper.", "Verify, then write it down."]),
    reused("EqualSignNumeric", "g1e12-ch1", "stretch", H.write, ["Balancing a blank is writing's final step.", "Both sides must name one value."]),
  ],
  ["Writing an equation is making a claim.", "The equals sign must be earned.", "Verify both sides before keeping it."],
  "course complete: true equations and unknowns.");

/* ------------------------------------------------------------------------- assembly */

must(L.length === 12, `12 lessons defined, got ${L.length}`);
const chapterTitles = ["The Meaning of Equals", "Where the Unknown Hides", "Solve and Check"];
const perChapter = [5, 4, 3];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 5 ? 1 : n <= 9 ? 2 : 3);
const outDir = join(root, "content/courses/equations-unknowns-g1");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g1e-0${ch}-${String(seq).padStart(2, "0")}`;
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
    id, slug, title: row.title, courseId: "equations-unknowns-g1",
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
    if (s.variant) must(OK_TAGS.has(s.variant.gen), `${id}/${s.id} variant tag ${s.variant.gen}`);
  }
  const rw = lesson.remedials[0].check.widget;
  must(rw.type === "numeric" || rw.type === "mcq", `${id} remedial widget ${rw.type}`);
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "equations-unknowns-g1", slug: "equations-unknowns-g1", title: spec.title,
  tagline: "Read the equal sign as a balance, judge equations true, and uncover hidden numbers.",
  category: "Math", gradeLevel: 1, chapters,
}, null, 2) + "\n");
console.log(`built 12 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
