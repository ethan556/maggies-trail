#!/usr/bin/env node
// S197 — Batch F course 4/6: expressions-patterns-g5 (5.OA.A.1, 5.OA.A.2, 5.OA.B.3).
// Zero new generator code.
//
// Family: g4-multiply (computational solver g4Independent.cjs). The key fit is that
// mbMultiStepNumeric computes ns[0]*ns[1] − ns[2] — which IS order of operations: the product
// binds before the subtraction. Routes probed operand-first before authoring:
//   mbMultiStepNumeric   "Compute A × B − C, …"  -> ns[0]*ns[1] − ns[2]
//   mbMultiplyTensNumeric "Compute A × B — …"    -> ns[0]*ns[1]
//   mbDivideBigNumeric   "Compute A ÷ B — …"     -> ns[0]/ns[1]
//   mbTimesAsManyNumeric "Compute A × B — …"     -> ns[0]*ns[1]
//   mbPatternsNumeric    "A pattern runs a, b, c, d. What comes next?" -> ns[last]*(ns[1]/ns[0])
//   mbPatternsMcq        -> exact `Multiply by ${ns[1]/ns[0]}`
// EVERY route reads ns POSITIONALLY over the whole prompt, so each graded prompt LEADS with its
// operands and explains afterwards — a number in the prose ahead of the expression silently
// becomes ns[0]. Asserted per step.
//
// plotPoint rates manip 3 (the highest in the registry) and is the genuine engine for the
// coordinate lessons; connectTargets draws the line through the plotted pairs, which is what
// makes "the points line up" visible. Grid is capped at 8x8, so every pair must fit.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "expressions-patterns-g5");
if (!spec || spec.lessons.length !== 12) throw new Error("spec course missing or wrong size");

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
const BAR_T = corpusTemplate("barBuilder", "measurement-data");
const EST_T = corpusTemplate("estimateSlider", "multiplication-division");
const PLOT_T = corpusTemplate("plotPoint", "place-value");

const REG_MB = new Set(["mbTimesAsManyMcq","mbTimesAsManyNumeric","mbComparisonEquationsMcq",
  "mbComparisonEquationsNumeric","mbAdditiveVsMultiplicativeMcq","mbAdditiveVsMultiplicativeNumeric",
  "mbFactorsMcq","mbFactorsNumeric","mbMultiplesMcq","mbPrimeCompositeMcq","mbPrimeCompositeNumeric",
  "mbMultiplyTensMcq","mbMultiplyTensNumeric","mbAreaModel1DigitMcq","mbAreaModel1DigitNumeric",
  "mbAreaModel2DigitMcq","mbAreaModel2DigitNumeric","mbRemaindersMcq","mbRemaindersNumeric",
  "mbDivideBigNumeric","mbInterpretRemaindersMcq","mbInterpretRemaindersNumeric","mbPatternsMcq",
  "mbPatternsNumeric","mbMultiStepNumeric"]);
const REG = { "g4-multiply": REG_MB };

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
const choose = (r, xs) => xs[pick(r, 0, xs.length - 1)];

function traps2(answer, cands) {
  const out = [];
  for (const [v, fb] of cands) {
    if (v !== answer && v >= 0 && Number.isInteger(v) && !out.some((o) => o[0] === v)) out.push([v, fb]);
    if (out.length === 2) break;
  }
  for (let d = 3; out.length < 2; d++) {
    const v = answer + d;
    if (!out.some((o) => o[0] === v)) {
      out.push([v, "That value does not follow once the operations are done in the order the expression fixes."]);
    }
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

/* ---------------- graded mirrors — every prompt LEADS with its operands ---------------- */
function PrecedenceNumeric(r) {
  const a = pick(r, 4, 9), b = pick(r, 4, 9);
  const c = pick(r, 5, a * b - 5);
  const ans = a * b - c;
  must(ans > 0, "precedence result must stay positive");
  return { gen: "g4-multiply", form: "mbMultiStepNumeric",
    prompt: `Compute ${a} × ${b} − ${c}, multiplying before subtracting.`, answer: ans,
    traps: traps2(ans, [
      [a * (b - c), `That subtracted first, as if the expression read ${a} × (${b} − ${c}). Without brackets the product binds first.`],
      [a * b, `That stopped after the multiplication; the ${c} still has to come off.`]]) };
}
function GroupedNumeric(r) {
  const inner = pick(r, 5, 12), outer = pick(r, 3, 8);
  return { gen: "g4-multiply", form: "mbMultiplyTensNumeric",
    prompt: `Compute ${inner} × ${outer} — the bracketed total times the factor outside it.`,
    answer: inner * outer,
    traps: traps2(inner * outer, [
      [inner + outer, `Adding treats the bracket as another term; the factor outside MULTIPLIES what the bracket produced.`],
      [outer, `${outer} is the outside factor alone; the bracket's value is what it acts on.`]]) };
}
function RuleValueNumeric(r) {
  const x = pick(r, 2, 8), k = pick(r, 2, 8);
  return { gen: "g4-multiply", form: "mbTimesAsManyNumeric",
    prompt: `Compute ${x} × ${k} — the y-value when x is ${x} and the rule multiplies by ${k}.`,
    answer: x * k,
    traps: traps2(x * k, [
      [x + k, `Adding is a different rule; "multiplies by ${k}" scales the input rather than nudging it.`],
      [k, `${k} is the rule's factor, not the output it produces from x = ${x}.`]]) };
}
function RecoverRuleNumeric(r) {
  const k = pick(r, 2, 9), x = pick(r, 2, 8);
  const y = x * k;
  return { gen: "g4-multiply", form: "mbDivideBigNumeric",
    prompt: `Compute ${y} ÷ ${x} — recovering the rule's factor from the ordered pair (${x}, ${y}).`,
    answer: k,
    traps: traps2(k, [
      [y - x, `Subtracting finds a gap, not a factor; the rule here multiplies, so divide to undo it.`],
      [y, `${y} is the OUTPUT; the rule is what turns ${x} into it.`]]) };
}
function PatternNextNumeric(r) {
  const start = pick(r, 2, 5), ratio = choose(r, [2, 3]);
  const t2 = start * ratio, t3 = t2 * ratio, t4 = t3 * ratio;
  return { gen: "g4-multiply", form: "mbPatternsNumeric",
    prompt: `A pattern runs ${start}, ${t2}, ${t3}, ${t4}. What comes next?`, answer: t4 * ratio,
    traps: traps2(t4 * ratio, [
      [t4 + (t4 - t3), `That added the last gap. This rule multiplies by ${ratio}, so the gaps keep widening.`],
      [t4 + ratio, `That added ${ratio} instead of multiplying by it — the rule scales the term.`]]) };
}
function PatternRuleMcq(r) {
  const start = pick(r, 2, 5), ratio = choose(r, [2, 3, 4]);
  const t2 = start * ratio, t3 = t2 * ratio;
  const correct = `Multiply by ${ratio}`;
  const wrongs = [`Add ${t2 - start}`, `Multiply by ${ratio + 1}`, `Add ${t3 - t2}`];
  must(t3 - t2 !== t2 - start, "the two gaps must differ or the additive distractors collide");
  must(new Set([correct, ...wrongs]).size === 4, "PatternRuleMcq labels must be distinct");
  return { gen: "g4-multiply", form: "mbPatternsMcq", kind: "solverMcq",
    prompt: `The pattern ${start}, ${t2}, ${t3} grows. What is the rule?`,
    labels: [correct, ...wrongs], correct,
    feedback: {
      [correct]: `Correct — each term is ${ratio} times the one before, which is why the gaps widen as it runs.`,
      [`Add ${t2 - start}`]: `Adding ${t2 - start} fits the FIRST step only; the next gap is larger, so no constant addition works.`,
      [`Multiply by ${ratio + 1}`]: `Multiplying by ${ratio + 1} would overshoot ${t2} straight away — check the first step.`,
      [`Add ${t3 - t2}`]: `${t3 - t2} is the SECOND gap, not a constant step — the first gap was only ${t2 - start}.`,
    } };
}
/* ---------------- variant-less reasoning MCQs ---------------- */
function OrderMcq() {
  return { kind: "mcq",
    prompt: `Why does 3 + 4 × 5 equal 23 rather than 35?`,
    options: [
      { label: "Multiplication binds before addition, so 4 × 5 happens first", correct: true, feedback: `Correct — the convention groups 4 × 5 into a single quantity, and 3 is added to that.` },
      { label: "Because you always work left to right", correct: false, feedback: `Left to right would give 35. It applies only among operations of equal rank, not across ranks.` },
      { label: "Because 3 is the smallest number", correct: false, feedback: `Size never decides order; the operation's rank does.` },
      { label: "Both answers are acceptable", correct: false, feedback: `Only one is: the convention exists precisely so that an expression names a single value.` },
    ] };
}
function ParenthesesMcq() {
  return { kind: "mcq",
    prompt: `What do the brackets change in (3 + 4) × 5?`,
    options: [
      { label: "They force the addition first, so the product becomes 7 × 5", correct: true, feedback: `Correct — brackets override the usual ranking and make the enclosed sum a single quantity.` },
      { label: "Nothing — the answer is the same either way", correct: false, feedback: `Without brackets the value is 23; with them it is 35, so they change the meaning entirely.` },
      { label: "They make the expression larger by convention", correct: false, feedback: `They can make it larger OR smaller; here they raise it, but (10 − 2) ÷ 2 shows the opposite.` },
      { label: "They mean multiply twice", correct: false, feedback: `Brackets group; they never repeat an operation.` },
    ] };
}
function BracketsMcq() {
  return { kind: "mcq",
    prompt: `In 2 × [3 + (4 × 2)], which part is computed first?`,
    options: [
      { label: "(4 × 2), the innermost grouping", correct: true, feedback: `Correct — grouping symbols resolve from the inside out, so the parentheses go before the brackets.` },
      { label: "2 × 3, reading left to right", correct: false, feedback: `The grouping symbols outrank left-to-right reading; nothing outside them can start first.` },
      { label: "3 + 4, ignoring the inner brackets", correct: false, feedback: `That splits the inner grouping apart — 4 is bound to the 2 beside it, not to the 3.` },
      { label: "The outer 2 × [ … ] , since it is written first", correct: false, feedback: `Written order does not decide; the outer product needs the bracket's value before it can act.` },
    ] };
}
function WriteExpressionMcq() {
  return { kind: "mcq",
    prompt: `"Add 6 and 4, then multiply the result by 3." Which expression records it?`,
    options: [
      { label: "(6 + 4) × 3", correct: true, feedback: `Correct — "then multiply the result" makes the sum a single quantity, which brackets record.` },
      { label: "6 + 4 × 3", correct: false, feedback: `Without brackets the multiplication binds first, giving 18 rather than 30 — a different instruction.` },
      { label: "6 + (4 × 3)", correct: false, feedback: `That multiplies before adding, which reverses the order the words give.` },
      { label: "6 × 4 + 3", correct: false, feedback: `That multiplies the wrong pair entirely and adds the 3 at the end.` },
    ] };
}
function ReadAloudMcq() {
  return { kind: "mcq",
    prompt: `How should 3 × (12 + 5) be read aloud so a listener could rewrite it exactly?`,
    options: [
      { label: "Three times the sum of twelve and five", correct: true, feedback: `Correct — "the sum of" names the bracket as one quantity, so the grouping survives the retelling.` },
      { label: "Three times twelve plus five", correct: false, feedback: `A listener would write 3 × 12 + 5, which is 41 rather than 51 — the grouping was lost.` },
      { label: "Three, twelve, five, multiply and add", correct: false, feedback: `That lists the numbers without saying which operation binds first, so it cannot be rewritten reliably.` },
      { label: "The sum of three and twelve, times five", correct: false, feedback: `That regroups the numbers, giving (3 + 12) × 5 — a different expression.` },
    ] };
}
function CompareWithoutComputingMcq() {
  return { kind: "mcq",
    prompt: `Without computing, how does 4 × (37 + 15) compare with (37 + 15)?`,
    options: [
      { label: "It is 4 times as large, whatever the bracket equals", correct: true, feedback: `Correct — the bracket is one quantity, and multiplying it by 4 scales it four-fold regardless of its value.` },
      { label: "It is 4 more", correct: false, feedback: `That reads the 4 as an addition; here it multiplies the whole bracketed amount.` },
      { label: "You cannot tell without adding 37 and 15", correct: false, feedback: `You can: the relationship holds for any value the bracket takes, which is what makes it structural.` },
      { label: "It is 4 times smaller", correct: false, feedback: `Multiplying by a whole number above one enlarges; it cannot shrink the bracket.` },
    ] };
}
function TwoRulesMcq() {
  return { kind: "mcq",
    prompt: `Rule A adds 3 each step from 0; rule B adds 6 each step from 0. How do their terms relate?`,
    options: [
      { label: "Every B term is twice the matching A term", correct: true, feedback: `Correct — B steps twice as far each time from the same start, so the pairing is a doubling throughout.` },
      { label: "B is always 3 more than A", correct: false, feedback: `That holds at the first step only; by the third the gap has grown to 9.` },
      { label: "They are the same sequence", correct: false, feedback: `They share a starting point but separate immediately: 3 against 6, then 6 against 12.` },
      { label: "There is no relationship", correct: false, feedback: `There is a precise one — matching terms sit in a constant 1-to-2 ratio.` },
    ] };
}
function OrderedPairMcq() {
  return { kind: "mcq",
    prompt: `Rules A (add 2 from 0) and B (add 4 from 0) give ordered pairs. What is the third pair?`,
    options: [
      { label: "(6, 12), taking the third term of each", correct: true, feedback: `Correct — A reaches 6 and B reaches 12 at step three, and the pair records both at once.` },
      { label: "(2, 4), the first terms", correct: false, feedback: `Those are the first pair; the third step has been taken twice more.` },
      { label: "(3, 3), the step number twice", correct: false, feedback: `An ordered pair holds the two RULES' outputs, not the step number.` },
      { label: "(12, 6), B then A", correct: false, feedback: `The order matters: A's term goes first, so the pair is (6, 12).` },
    ] };
}
function ExplainPatternMcq() {
  return { kind: "mcq",
    prompt: `Why does "add 6" always give terms twice those of "add 3" from the same start?`,
    options: [
      { label: "Because each step of B covers two of A's steps, and both start at 0", correct: true, feedback: `Correct — the doubling is built into the step sizes, so it holds at every term rather than by coincidence.` },
      { label: "Because 6 is 3 more than 3", correct: false, feedback: `That is an additive comparison; the relationship between the sequences is multiplicative.` },
      { label: "Because both are even numbers", correct: false, feedback: `Parity is irrelevant — "add 5" and "add 10" would double too.` },
      { label: "It only looks that way for the first few terms", correct: false, feedback: `It holds forever, because the step sizes stand in a fixed 1-to-2 ratio.` },
    ] };
}

const REUSE = { PrecedenceNumeric, GroupedNumeric, RuleValueNumeric, RecoverRuleNumeric,
  PatternNextNumeric, PatternRuleMcq,
  OrderMcq: () => OrderMcq(), ParenthesesMcq: () => ParenthesesMcq(), BracketsMcq: () => BracketsMcq(),
  WriteExpressionMcq: () => WriteExpressionMcq(), ReadAloudMcq: () => ReadAloudMcq(),
  CompareWithoutComputingMcq: () => CompareWithoutComputingMcq(), TwoRulesMcq: () => TwoRulesMcq(),
  OrderedPairMcq: () => OrderedPairMcq(), ExplainPatternMcq: () => ExplainPatternMcq() };

function reused(mirror, seedStr, hints, ev,
                fallback = "Resolve the groupings first, then the higher-ranking operations, then work left to right.") {
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
    must(new Set(out.labels).size === out.labels.length, `${mirror} duplicate labels`);
    const ordered = [out.correct, ...out.labels.filter((l) => l !== out.correct)];
    const options = ordered.map((label, i) => ({
      id: `o${i}`, label, correct: label === out.correct, feedback: out.feedback[label],
    }));
    must(options[0].correct === true, `${mirror} correct must be index 0`);
    must(options.length >= 4, `${mirror} needs >=4 options`);
    for (const o of options) must(o.feedback && o.feedback.length >= 25, `${mirror} feedback missing/short for "${o.label}"`);
    must(new Set(options.map((o) => o.feedback)).size === options.length, `${mirror} feedback not distinct`);
    return { variant: { gen: out.gen, form: out.form },
      widget: { type: "mcq", prompt: out.prompt, options }, hints, ev };
  }

  must(REG[out.gen]?.has(out.form), `${mirror}: ${out.gen}/${out.form} NOT registered`);
  // POSITIONAL GUARD: a number in the prose ahead of the expression becomes ns[0]
  const nums = (out.prompt.match(/\d+/g) || []).map(Number);
  if (out.form === "mbMultiStepNumeric") must(nums[0] * nums[1] - nums[2] === out.answer, `${mirror}: ns0*ns1−ns2`);
  if (out.form === "mbMultiplyTensNumeric" || out.form === "mbTimesAsManyNumeric") {
    must(nums[0] * nums[1] === out.answer, `${mirror}: the first two numbers must be the operands`);
  }
  if (out.form === "mbDivideBigNumeric") must(nums[0] / nums[1] === out.answer, `${mirror}: ns0/ns1`);
  if (out.form === "mbPatternsNumeric") must(nums[nums.length - 1] * (nums[1] / nums[0]) === out.answer, `${mirror}: last*ratio`);
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

/* ---------------- manipulatives ---------------- */
function bars(prompt, categories, target, success, partial) {
  const w = structuredClone(BAR_T);
  w.prompt = prompt; w.categories = categories; w.target = target;
  w.display = "bar"; w.maxVal = Math.max(...target) + 3; w.step = 1; w.histogram = false;
  w.successFeedback = success; w.partialFeedback = partial;
  must(categories.length === target.length, "bars categories/target aligned");
  return w;
}
function estimate(prompt, min, max, target, unitLabel, low, high, success) {
  const w = structuredClone(EST_T);
  w.prompt = prompt; w.min = min; w.max = max; w.start = min; w.target = target;
  w.acceptFactor = 2; w.unitLabel = unitLabel;
  w.ticks = [min, Math.round((min + max) / 2), max];
  w.lowFeedback = low; w.highFeedback = high;
  if ("successFeedback" in w) w.successFeedback = success;
  if ("choices" in w) delete w.choices;
  must(min < target && target < max, "estimate target inside range");
  return w;
}
function plot(prompt, cols, rows, targets, success, errors, missFeedback, connect = true) {
  const w = structuredClone(PLOT_T);
  w.prompt = prompt; w.cols = cols; w.rows = rows;
  w.xLabels = Array.from({ length: cols }, (_, i) => String(i + 1));
  w.yLabels = Array.from({ length: rows }, (_, i) => String(i + 1));
  w.targets = targets;
  w.connectTargets = connect;
  w.missFeedback = missFeedback;
  // author both directions explicitly rather than inheriting the template's wording
  if ("successFeedback" in w) w.successFeedback = success;
  w.pointErrors = errors.map(([x, y, feedback]) => {
    must(!targets.some((t) => t.x === x && t.y === y), `plotPoint error (${x},${y}) is a TARGET`);
    must(x >= 1 && x <= cols && y >= 1 && y <= rows, `plotPoint error (${x},${y}) off the grid`);
    must(feedback.length >= 25, "plotPoint error feedback short");
    return { x, y, feedback };
  });
  must(cols >= 2 && cols <= 8 && rows >= 2 && rows <= 8, "plotPoint grid is capped at 8x8");
  for (const t of targets) must(t.x <= cols && t.y <= rows, `plotPoint target (${t.x},${t.y}) off the grid`);
  must(w.pointErrors.length >= 1, "plotPoint needs a diagnosable wrong cell");
  must(missFeedback.length >= 25, "plotPoint missFeedback too short");
  return w;
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Resolve the groupings, then the ranks, and watch the value the expression names settle for ${tag.replace(/-/g, " ")}.`,
  invariants: [`An expression names ONE value, and the order conventions plus any grouping symbols are what guarantee it: change the grouping and you change the quantity, which is why ${tag.replace(/-/g, " ")} is about structure rather than arithmetic.`],
  misconceptions: [`Working strictly left to right across different ranks, dropping a grouping when reading an expression aloud, or describing a multiplicative pattern with a constant difference.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `expressions-patterns-g5:${tag}`, delayed: true,
  counterfactualPrompt: "If the brackets moved one term to the left, what value would the expression name instead?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  order: ["Groupings first.", "Then the higher rank.", "Left to right within a rank."],
  group: ["Brackets make one quantity.", "Inside out.", "They change the meaning."],
  words: ["Name the grouping aloud.", "'The sum of' binds it.", "A listener must rebuild it."],
  rule: ["Check the first step.", "Confirm on the second.", "Growing gaps multiply."],
  pair: ["A's term first.", "B's term second.", "One step, one pair."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "An expression must name exactly one value, so the order of operations is a convention that settles ties: multiplication and division act before addition and subtraction.",
  "3 + 4 × 5 is 23, not 35. The 4 × 5 forms a single quantity first, and only then does the 3 join it.",
  { rep: "diagram", widget: () => bars("Build 6 × 7 as six equal bars of 7, before anything is subtracted.",
      ["G1", "G2", "G3", "G4", "G5", "G6"], [7, 7, 7, 7, 7, 7],
      "42 — the product forms first, and only then does a subtraction act on it.",
      "Every group holds the same 7; build each bar to 7."),
    predict: P("Is 3 + 4 × 5 equal to 35?", [{ id: "no", label: "No — 23" }, { id: "yes", label: "Yes" }], "no",
      "Working left to right would give 35, but multiplication binds first, so 4 × 5 = 20 and 3 joins it.") },
  [
    reused("OrderMcq", "g5e1-k1", H.order, ["Rank decides, not position.", "Products bind first."]),
    reused("PrecedenceNumeric", "g5e1-k2", H.order, ["Multiply, then subtract.", "That is the order."]),
    reused("OrderMcq", "g5e1-k3", H.order, ["Left to right is a tiebreak.", "Within one rank only."]),
    reused("PrecedenceNumeric", "g5e1-ch1", H.order, ["Bigger numbers, same order.", "Product first."]),
  ],
  ["An expression names one value.", "Multiplication binds before addition.", "Left to right settles equal ranks."],
  "next: overriding the ranking.");

def(2,
  "Brackets override the ranking. (3 + 4) × 5 forces the addition first, turning the sum into a single quantity worth 7.",
  "The same three numbers give 23 without brackets and 35 with them — the symbols are not decoration, they are the instruction.",
  { rep: "diagram", widget: () => bars("Build (3 + 4) × 5 as five equal bars of 7 — the bracket's value repeated.",
      ["G1", "G2", "G3", "G4", "G5"], [7, 7, 7, 7, 7],
      "35 — the bracket makes 7 a single quantity, and five of them build the total.",
      "Each bar holds the bracket's value, 3 + 4 = 7."),
    predict: P("Do 3 + 4 × 5 and (3 + 4) × 5 name the same value?", [{ id: "no", label: "No — 23 and 35" }, { id: "yes", label: "Yes" }], "no",
      "The brackets change which operation acts first, and that changes the quantity named.") },
  [
    reused("ParenthesesMcq", "g5e2-k1", H.group, ["Brackets group.", "They act first."]),
    reused("GroupedNumeric", "g5e2-k2", H.group, ["Bracket value times factor.", "Multiply."]),
    reused("ParenthesesMcq", "g5e2-k3", H.group, ["Same numbers, different value.", "Grouping decides."]),
    reused("PrecedenceNumeric", "g5e2-ch1", H.order, ["Without brackets, rank rules.", "Product first."]),
  ],
  ["Brackets override the ranking.", "They make the enclosed part one quantity.", "They change the value named."],
  "next: groupings inside groupings.");

def(3,
  "Brackets and braces nest, and they resolve from the INSIDE OUT: the innermost grouping is always the first thing computed.",
  "In 2 × [3 + (4 × 2)] the parentheses go first, then the bracket, then the outer product. Nothing outside can start until what is inside has a value.",
  { rep: "diagram", widget: () => bars("Build [3 + (4 × 2)] as one quantity: the inner product is 8, so the bracket holds 11.",
      ["Inner 4 × 2", "The 3", "Bracket total"], [8, 3, 11],
      "11 — the inner product resolves to 8, the 3 joins it, and the bracket becomes a single quantity.",
      "Build the inner product first at 8, the standalone 3, then their total at 11."),
    predict: P("In 2 × [3 + (4 × 2)], what resolves first?", [{ id: "inner", label: "(4 × 2)" }, { id: "outer", label: "2 × 3" }], "inner",
      "Groupings resolve inside out, so the innermost parentheses go before anything containing them.") },
  [
    reused("BracketsMcq", "g5e3-k1", H.group, ["Inside out.", "Innermost first."]),
    reused("GroupedNumeric", "g5e3-k2", H.group, ["Bracket value, then multiply.", "One quantity."]),
    reused("BracketsMcq", "g5e3-k3", H.group, ["Written order is not rank.", "Nesting decides."]),
    reused("PrecedenceNumeric", "g5e3-ch1", H.order, ["Then the usual ranks.", "Product before difference."]),
  ],
  ["Groupings nest.", "They resolve inside out.", "Nothing outside starts first."],
  "next: putting it all together.");

def(4,
  "A long expression is just these rules applied in turn: groupings inside out, then the higher rank, then left to right among equals.",
  "Doing them in a different order does not give a different opinion — it gives a different number, and only one of them is what the expression says.",
  { rep: "diagram", widget: () => estimate("Compute 9 × 4 − 20 — slide to the value it names.", 1, 100, 16, "units",
      "Too low — nine fours already build thirty-six before anything comes off.",
      "Too high — after removing twenty from thirty-six, the value drops well below fifty.",
      "16 — the product 36 forms first, then the 20 comes off it."),
    predict: P("Computing 9 × 4 − 20 left to right without ranks gives what?", [{ id: "same", label: "16 — the same here" }, { id: "diff", label: "A different value" }], "same",
      "Left to right happens to agree when the product is written first; when it is not, the two disagree sharply.") },
  [
    reused("PrecedenceNumeric", "g5e4-k1", H.order, ["Product first.", "Then subtract."]),
    reused("GroupedNumeric", "g5e4-k2", H.group, ["Brackets, if present.", "Then ranks."]),
    reused("PrecedenceNumeric", "g5e4-k3", H.order, ["One value only.", "The rules fix it."]),
    reused("PrecedenceNumeric", "g5e4-ch1", H.order, ["Longer chains, same rules.", "In order."]),
  ],
  ["Apply the rules in turn.", "Groupings, ranks, then left to right.", "The expression names one value."],
  "next: writing expressions from words.");

def(5,
  "Writing an expression from words means capturing the ORDER the words describe, and brackets are how that order gets recorded.",
  "'Add 6 and 4, then multiply by 3' is (6 + 4) × 3. Drop the brackets and the sentence has been changed, not merely abbreviated.",
  { rep: "diagram", widget: () => bars("Build (6 + 4) × 3 as three equal bars of 10 — the bracket's value repeated.",
      ["G1", "G2", "G3"], [10, 10, 10],
      "30 — the bracket forms 10, and three of them build the total the words describe.",
      "Each bar holds the bracket's value, 6 + 4 = 10."),
    predict: P("'Add 6 and 4, then multiply by 3' — with or without brackets?", [{ id: "with", label: "With — (6 + 4) × 3" }, { id: "without", label: "Without" }], "with",
      "'Then multiply the result' makes the sum one quantity, and only brackets record that.") },
  [
    reused("WriteExpressionMcq", "g5e5-k1", H.words, ["'Then' signals grouping.", "Brackets record it."]),
    reused("GroupedNumeric", "g5e5-k2", H.group, ["Bracket value times factor.", "Multiply once."]),
    reused("WriteExpressionMcq", "g5e5-k3", H.words, ["Dropping brackets changes it.", "Not an abbreviation."]),
    reused("PrecedenceNumeric", "g5e5-ch1", H.order, ["Some sentences need no brackets.", "Ranks already agree."]),
  ],
  ["Words carry an order.", "Brackets record that order.", "Dropping them changes the meaning."],
  "next: saying them out loud.");

def(6,
  "Reading an expression aloud has to preserve its grouping, or the listener rebuilds something else.",
  "'Three times the sum of twelve and five' survives retelling. 'Three times twelve plus five' does not — it loses the bracket and lands on a different number.",
  { rep: "diagram", widget: () => bars("Build 3 × (12 + 5) as three equal bars of 17.",
      ["G1", "G2", "G3"], [17, 17, 17],
      "51 — three copies of the bracket's 17, which is what 'the sum of twelve and five' names.",
      "Each bar holds the bracket's value, 12 + 5 = 17."),
    predict: P("'Three times twelve plus five' — what would a listener write?", [{ id: "wrong", label: "3 × 12 + 5 = 41" }, { id: "right", label: "3 × (12 + 5) = 51" }], "wrong",
      "Without a phrase naming the sum as one quantity, the grouping is lost in the retelling.") },
  [
    reused("ReadAloudMcq", "g5e6-k1", H.words, ["Name the grouping.", "'The sum of'."]),
    reused("GroupedNumeric", "g5e6-k2", H.group, ["Bracket first.", "Then multiply."]),
    reused("ReadAloudMcq", "g5e6-k3", H.words, ["A listener must rebuild it.", "Exactly."]),
    reused("WriteExpressionMcq", "g5e6-ch1", H.words, ["Words to symbols.", "And back again."]),
  ],
  ["Reading aloud must keep the grouping.", "Name the bracket as one quantity.", "Otherwise the listener rebuilds another expression."],
  "next: comparing without computing.");

def(7,
  "Some comparisons need no arithmetic at all: 4 × (37 + 15) is four times (37 + 15), whatever that bracket turns out to be.",
  "Seeing the bracket as a single object is what makes this possible, and it is the same habit that later carries all of algebra.",
  { rep: "diagram", widget: () => estimate("4 × (37 + 15) — slide to how many TIMES larger it is than the bracket alone.", 1, 20, 4, "times",
      "Too low — the 4 multiplies the whole bracket, so the result is four of them.",
      "Too high — the factor outside the bracket is 4, not more.",
      "4 — the bracket is one quantity and the expression takes four copies of it."),
    predict: P("Must you add 37 and 15 to compare?", [{ id: "no", label: "No — the factor decides" }, { id: "yes", label: "Yes" }], "no",
      "The relationship holds for whatever the bracket equals, which is exactly what makes it structural.") },
  [
    reused("CompareWithoutComputingMcq", "g5e7-k1", H.group, ["The bracket is one object.", "The factor scales it."]),
    reused("GroupedNumeric", "g5e7-k2", H.group, ["Compute if you must.", "Structure comes first."]),
    reused("CompareWithoutComputingMcq", "g5e7-k3", H.group, ["True for any value.", "That is structure."]),
    reused("PrecedenceNumeric", "g5e7-ch1", H.order, ["Then the arithmetic.", "In the fixed order."]),
  ],
  ["Some comparisons need no arithmetic.", "Treat the bracket as one object.", "Structural claims hold for any value."],
  "next: two rules running together.");

def(8,
  "Two rules can run side by side from the same start, and their terms then stand in a fixed relationship.",
  "Add 3 and add 6 both start at zero, and every B term is twice the matching A term — not three more, but twice as much.",
  { rep: "diagram", widget: () => bars("Build the first four terms of 'add 3' and then of 'add 6' — compare them.",
      ["A1", "A2", "A3", "A4"], [3, 6, 9, 12],
      "3, 6, 9, 12 — and the 'add 6' rule reaches 6, 12, 18, 24, exactly double at every step.",
      "Each term rises by 3: build 3, then 6, then 9, then 12."),
    predict: P("'Add 3' and 'add 6' from 0 — how do terms relate?", [{ id: "double", label: "B is twice A" }, { id: "plus3", label: "B is 3 more" }], "double",
      "The gap grows as the sequences run; the ratio is what stays fixed.") },
  [
    reused("TwoRulesMcq", "g5e8-k1", H.rule, ["Compare matching terms.", "Ratio, not difference."]),
    reused("PatternNextNumeric", "g5e8-k2", H.rule, ["Apply the rule again.", "From the last term."]),
    reused("TwoRulesMcq", "g5e8-k3", H.rule, ["The gap grows.", "The ratio holds."]),
    reused("RuleValueNumeric", "g5e8-ch1", H.rule, ["A rule turns input to output.", "Multiply."]),
  ],
  ["Two rules can run together.", "Matching terms have a fixed relationship.", "Here it is a ratio, not a difference."],
  "next: recording the pairs.");

def(9,
  "Pairing the two sequences term by term gives ORDERED PAIRS: A's term first, B's term second, one pair per step.",
  "The order inside the pair is not a convention to memorise — it names which rule produced which number.",
  { rep: "diagram", widget: () => plot("Rules A (add 2 from 0) and B (add 4 from 0). Plot the first three ordered pairs.",
      8, 8, [{ x: 2, y: 4 }, { x: 4, y: 8 }],
      "The pairs (2, 4) and (4, 8) both sit on the same straight path — B is always double A.",
      [[4, 2, "That plotted (4, 2), swapping the pair. A's term goes across, B's term goes up."],
       [2, 2, "That used A's term for both coordinates; B advances twice as fast."]],
      "Plot A's term along the bottom and B's term up the side, one point per step."),
    predict: P("A reaches 6 and B reaches 12 at step three. What is the pair?", [{ id: "612", label: "(6, 12)" }, { id: "126", label: "(12, 6)" }], "612",
      "A's term is written first, so the pair records A across and B up.") },
  [
    reused("OrderedPairMcq", "g5e9-k1", H.pair, ["A first, B second.", "One pair per step."]),
    reused("RuleValueNumeric", "g5e9-k2", H.pair, ["Each rule gives a term.", "Multiply the input."]),
    reused("OrderedPairMcq", "g5e9-k3", H.pair, ["Order names the source.", "Not arbitrary."]),
    reused("RecoverRuleNumeric", "g5e9-ch1", H.rule, ["Recover the factor.", "Divide output by input."]),
  ],
  ["Pair the terms step by step.", "A's term goes first.", "The order names which rule produced it."],
  "next: seeing the pairs on a grid.");

def(10,
  "Plotted on a grid, the pairs from two constant rules fall on a straight path — the fixed relationship becomes something you can SEE.",
  "That is the payoff of graphing: a claim about every term at once, visible in a single picture.",
  { rep: "diagram", widget: () => plot("Plot the pairs for A (add 1) and B (add 2): (1, 2), (2, 4), (3, 6).",
      8, 8, [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }],
      "All three points fall on one straight path, because B is exactly double A at every step.",
      [[2, 2, "That plotted B equal to A; B advances twice as fast, so its coordinate is double."],
       [1, 1, "That used the same value twice; at step one A is 1 but B is already 2."]],
      "For each step, go across to A's term and up to B's term, then mark the cell."),
    predict: P("Plotting pairs from two constant rules, what shape appears?", [{ id: "line", label: "A straight path" }, { id: "scatter", label: "Scattered points" }], "line",
      "A fixed ratio between the terms puts every pair on the same straight path.") },
  [
    reused("OrderedPairMcq", "g5e10-k1", H.pair, ["Across then up.", "One point per pair."]),
    reused("RuleValueNumeric", "g5e10-k2", H.rule, ["Compute each term.", "Then plot."]),
    reused("TwoRulesMcq", "g5e10-k3", H.rule, ["The ratio is fixed.", "The path is straight."]),
    reused("RuleValueNumeric", "g5e10-ch1", H.rule, ["More steps, same path.", "Multiply the input."]),
  ],
  ["Plot A across and B up.", "Constant rules give a straight path.", "The relationship becomes visible."],
  "next: reading the relationship off the pairs.");

def(11,
  "Given the pairs, the relationship can be recovered: divide the second coordinate by the first and the rule's factor appears.",
  "For (3, 12) the factor is 4, and it holds for every pair the rules produce — one division reveals a claim about all of them.",
  // (3, 9) would sit off the 8x8 grid, so the pairs use the same factor at smaller inputs.
  { rep: "diagram", widget: () => plot("These pairs come from one rule. Plot (1, 3) and (2, 6) and read the factor.",
      8, 8, [{ x: 1, y: 3 }, { x: 2, y: 6 }],
      "Both pairs sit on the same path, and 3 ÷ 1 = 6 ÷ 2 = 3 — the rule multiplies by 3.",
      [[1, 2, "(1, 2) would give a factor of 2; check what 3 ÷ 1 actually gives."],
       [2, 4, "(2, 4) gives a factor of 2, but the second pair here is (2, 6)."]],
      "Go across to the first coordinate and up to the second, then mark the cell."),
    predict: P("From the pair (3, 12), what is the rule's factor?", [{ id: "four", label: "4" }, { id: "nine", label: "9" }], "four",
      "12 ÷ 3 = 4; the difference of 9 would describe an adding rule, not a multiplying one.") },
  [
    reused("RecoverRuleNumeric", "g5e11-k1", H.rule, ["Divide output by input.", "The factor appears."]),
    reused("RuleValueNumeric", "g5e11-k2", H.rule, ["Check it forward.", "Input times factor."]),
    reused("PatternRuleMcq", "g5e11-k3", H.rule, ["Test the first step.", "Confirm on the second."]),
    reused("RecoverRuleNumeric", "g5e11-ch1", H.rule, ["Any pair, same factor.", "That is the claim."]),
  ],
  ["Divide the second coordinate by the first.", "That reveals the factor.", "It holds for every pair."],
  "next: saying why it must hold.");

def(12,
  "Explaining why a pattern holds means pointing at the structure, not the examples: 'add 6' doubles 'add 3' because each of its steps covers two of the other's.",
  "Checking three terms shows the pattern; naming the reason shows it must continue — and that is the difference between noticing and knowing.",
  { rep: "diagram", widget: () => bars("Build 'add 3' four times, then compare with 'add 6' reaching 6, 12, 18, 24.",
      ["A1", "A2", "A3", "A4"], [3, 6, 9, 12],
      "3, 6, 9, 12 against 6, 12, 18, 24 — doubled at every step, because each B step covers two A steps.",
      "Each term rises by 3: build 3, then 6, then 9, then 12."),
    predict: P("Does checking three terms PROVE the doubling continues?", [{ id: "no", label: "No — the reason does" }, { id: "yes", label: "Yes" }], "no",
      "Three agreements are evidence; the step sizes standing in a 1-to-2 ratio is the reason.") },
  [
    reused("ExplainPatternMcq", "g5e12-k1", H.rule, ["Point at the structure.", "Not the examples."]),
    reused("TwoRulesMcq", "g5e12-k2", H.rule, ["Ratio, not difference.", "It holds throughout."]),
    reused("PatternNextNumeric", "g5e12-k3", H.rule, ["Extend to check.", "The rule predicts."]),
    reused("ExplainPatternMcq", "g5e12-ch1", H.rule, ["Evidence versus reason.", "Knowing needs both."]),
  ],
  ["Examples show a pattern.", "Structure explains why it must hold.", "That is the difference between noticing and knowing."],
  "course complete: ordered, grouped, written, paired, graphed, and explained.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 12, `12 lessons defined, got ${L.length}`);
const chapterTitles = ["Order and Grouping", "Expressions in Words", "Patterns, Pairs, and Graphs"];
const perChapter = [4, 3, 5];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 7 ? 2 : 3);
const outDir = join(root, "content/courses/expressions-patterns-g5");
mkdirSync(join(outDir, "lessons"), { recursive: true });

const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);
const MANIP2 = new Set(["numberLineHop", "barBuilder", "estimateSlider", "numberLinePlace", "areaModel", "columnCalc", "fractionBar", "tapDiagram", "plotPoint"]);

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g5e-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "symbolic") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "expressions-patterns-g5",
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

  let manipSeen = false, entryAfterManip = false;
  for (const s of lesson.steps) {
    if (!s.widget) continue;
    if (MANIP2.has(s.widget.type)) manipSeen = true;
    else if (manipSeen && ENTRY.has(s.widget.type)) entryAfterManip = true;
  }
  must(entryAfterManip, `${id}: needs a numeric check after the manipulative or it caps at Tier B`);

  for (const s of lesson.steps) {
    const w = s.widget;
    if (!w) continue;
    if (w.type === "numeric") {
      for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} trap==answer`);
      const n = (w.prompt.match(/\d+/g) || []).map(Number);
      const f = s.variant?.form;
      if (f === "mbMultiStepNumeric") must(n[0] * n[1] - n[2] === w.answer, `${id}/${s.id} ns0*ns1−ns2`);
      if (f === "mbMultiplyTensNumeric" || f === "mbTimesAsManyNumeric") {
        must(n[0] * n[1] === w.answer, `${id}/${s.id}: first two numbers must be the operands`);
      }
      if (f === "mbDivideBigNumeric") must(n[0] / n[1] === w.answer, `${id}/${s.id} ns0/ns1`);
      if (f === "mbPatternsNumeric") must(n[n.length - 1] * (n[1] / n[0]) === w.answer, `${id}/${s.id} last*ratio`);
    }
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 4, `${id}/${s.id} mcq option count`);
      must(w.options[0].correct === true, `${id}/${s.id} correct must be index 0`);
    }
    if (w.type === "plotPoint") {
      for (const t of w.targets) must(t.x <= w.cols && t.y <= w.rows, `${id}/${s.id} plotPoint target off the grid`);
      for (const e of w.pointErrors) {
        must(!w.targets.some((t) => t.x === e.x && t.y === e.y), `${id}/${s.id} plotPoint error is a target`);
        must(e.x >= 1 && e.x <= w.cols && e.y >= 1 && e.y <= w.rows, `${id}/${s.id} plotPoint error off the grid`);
      }
      must(w.pointErrors.length >= 1, `${id}/${s.id} plotPoint needs a diagnosable wrong cell`);
    }
    if (w.type === "barBuilder") must(w.categories.length === w.target.length, `${id}/${s.id} barBuilder misaligned`);
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "expressions-patterns-g5", slug: "expressions-patterns-g5", title: spec.title,
  tagline: "An expression names one value — grouping and rank decide which.",
  category: "Math", gradeLevel: 5, chapters,
}, null, 2) + "\n");
console.log(`built 12 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
