#!/usr/bin/env node
// S194 — Batch C course 4/6: number-line-g2 (2.MD.B.6). Zero new generator code.
//
// This is numberLineHop's home course — the manipulative appears in every lesson, forward AND
// back ("back" verified schema-valid with corpus precedent). Graded numerics ride TWO families
// (cross-family within a course has standing precedent: equations-unknowns-g1):
//   additions    -> g2-add-subtract-100  (Add2DigitNumeric / AddOnesNumeric / AddTensNumeric,
//                   all arithmetic(prompt): first "a + b")
//   subtractions -> g2-place-value-1000  (Pv1000SubtractByPlaceNumeric, arithmetic: "a − b")
//     ...because the add-subtract-100 family's subtraction forms are Mcq-only.
// Locate/spacing/between judgments with no honest numeric route are variant-less MCQs
// (217-precedent). Every prompt LEADS with its pair; context trails in a parenthetical.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "number-line-g2");
if (!spec || spec.lessons.length !== 10) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

const REG100 = new Set(["Add2DigitNumeric","Add2DigitMcq","AddOnesNumeric","AddOnesMcq",
  "AddTensNumeric","AddTensMcq","ChooseStepsNumeric","ChooseStepsMcq","DoublesNumeric","DoublesMcq",
  "Fluency20Numeric","Fluency20Mcq","NearDoublesNumeric","NearDoublesMcq","OddEvenMcq",
  "OddEvenOddEvenPairs","ParitySumNumeric","ParitySumMcq","RegroupAddNumeric","Sub2DigitMcq",
  "SubOnesMcq","SubTensMcq","TwoStepTradeNumeric","TwoStepTradeMcq","UnbundleSubMcq"]);
const REG1000 = new Set(["Pv1000AddByPlaceNumeric","Pv1000AddTradeNumeric","Pv1000BuildNumberNumeric",
  "Pv1000CountForwardNumeric","Pv1000DigitWorthNumeric","Pv1000MixedNumeric","Pv1000OrderMixedMcq",
  "Pv1000OrderMixedNumeric","Pv1000ReadWordsNumeric","Pv1000RealworldNumeric","Pv1000SkipFivesNumeric",
  "Pv1000SkipHundredsNumeric","Pv1000SkipTensNumeric","Pv1000SubtractByPlaceNumeric",
  "Pv1000SubtractTradeNumeric","Pv1000TradingNumeric","Pv1000WriteWordsBuildExpression"]);
const REG = { "g2-add-subtract-100": REG100, "g2-place-value-1000": REG1000 };

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
    out.push([v, "That landing does not match the jumps — re-walk the line hop by hop and read the mark you finish on."]);
  }
  return out.map(([value, feedback]) => ({ value, feedback }));
}

/* ---------------- graded mirrors ---------------- */
function JumpAddTensNumeric(r) {
  const a = 10 * pick(r, 2, 5) + pick(r, 1, 7);
  const j = 10 * pick(r, 2, 4);
  const ans = a + j;
  return { gen: "g2-add-subtract-100", form: "Add2DigitNumeric",
    prompt: `${a} + ${j} = ? (jumping forward by tens on the line)`, answer: ans,
    traps: traps2(ans, [[a + j / 10, `Those jumps were ones — each forward jump here is a whole ten.`],
                        [a + j + 10, `One jump too many; count the tens jumps the sum actually asks for.`]]) };
}
function JumpAddOnesNumeric(r) {
  const a = 10 * pick(r, 2, 6);
  const j = pick(r, 3, 8);
  const ans = a + j;
  return { gen: "g2-add-subtract-100", form: "AddOnesNumeric",
    prompt: `${a} + ${j} = ? (small forward jumps of one)`, answer: ans,
    traps: traps2(ans, [[a + 10 * j > 99 ? a + 10 : a + 10 * j, `Those were ten-jumps — the ${j} here calls for small jumps of one.`],
                        [a + j - 1, `The count came up one jump short; land every jump.`]]) };
}
function JumpSubNumeric(r) {
  const b = 10 * pick(r, 2, 4);
  const a = b + 10 * pick(r, 1, 3) + pick(r, 1, 6);
  const ans = a - b;
  return { gen: "g2-place-value-1000", form: "Pv1000SubtractByPlaceNumeric",
    prompt: `${a} − ${b} = ? (jumping backward by tens)`, answer: ans,
    traps: traps2(ans, [[a + b <= 99 ? a + b : ans + 10, `The jumps went FORWARD — subtracting walks the line toward zero.`],
                        [ans - 10, `One backward jump too many; stop when the jumps equal ${b}.`]]) };
}
function DiffAsGapNumeric(r) {
  const b = 10 * pick(r, 2, 4) + pick(r, 1, 4);
  const a = b + 10 * pick(r, 1, 3) + pick(r, 1, 4);
  const ans = a - b;
  return { gen: "g2-place-value-1000", form: "Pv1000SubtractByPlaceNumeric",
    prompt: `${a} − ${b} = ? (the gap between the two marks)`, answer: ans,
    traps: traps2(ans, [[a + b <= 99 ? a + b : ans + 11, `That measured PAST both marks — the gap lives between them, found by subtracting.`],
                        [ans + 1, `The gap count slipped by one; hop from ${b} up to ${a} and count the hops.`]]) };
}
function MissingJumpNumeric(r) {
  const startV = 10 * pick(r, 2, 4);
  const land = startV + 10 * pick(r, 2, 4) + pick(r, 0, 5);
  const ans = land - startV;
  return { gen: "g2-place-value-1000", form: "Pv1000SubtractByPlaceNumeric",
    prompt: `${land} − ${startV} = ? (the jump that carried ${startV} to ${land})`, answer: ans,
    traps: traps2(ans, [[land + startV <= 99 ? land + startV : ans + 10, `Adding the two marks measures nothing — the missing jump is their DIFFERENCE.`],
                        [ans - 10, `That jump falls short of ${land}; the full gap is the jump.`]]) };
}
function SpacingNumeric(r) {
  const startV = 10 * pick(r, 2, 5);
  const step = 5;
  const ans = startV + step;
  return { gen: "g2-add-subtract-100", form: "AddOnesNumeric",
    prompt: `${startV} + ${step} = ? (the next mark when marks sit every ${step})`, answer: ans,
    traps: traps2(ans, [[startV + 1, `That moved one — equally spaced marks here step by ${step} every time.`],
                        [startV + 10, `That is a ten-step; this line's marks sit ${step} apart.`]]) };
}
function StoryLineNumeric(r, forward) {
  if (forward) {
    const a = 10 * pick(r, 2, 4) + pick(r, 1, 5);
    const j = 10 * pick(r, 1, 3);
    const ans = a + j;
    return { gen: "g2-add-subtract-100", form: "Add2DigitNumeric",
      prompt: `Maggie stands at trail marker ${a} and hikes ${j} meters onward. So ${a} + ${j} = ?`, answer: ans,
      traps: traps2(ans, [[a - j > 0 ? a - j : ans + 5, `The hike moved FORWARD along the trail — the marker number grows.`],
                          [ans + 10, `One extra ten crept into the hike; measure just the ${j} meters.`]]) };
  }
  const b = 10 * pick(r, 1, 2) + pick(r, 0, 5);
  const a = b + 10 * pick(r, 2, 3) + pick(r, 1, 4);
  const ans = a - b;
  return { gen: "g2-place-value-1000", form: "Pv1000SubtractByPlaceNumeric",
    prompt: `Maggie is at marker ${a} and walks back to marker ${b}. So ${a} − ${b} = ?`, answer: ans,
    traps: traps2(ans, [[a + b <= 99 ? a + b : ans + 10, `Walking back is a backward move — the distance is the difference, not the sum.`],
                        [ans + 2, `The step count drifted; the walk covers exactly the gap between the markers.`]]) };
}

/* ---------------- variant-less MCQs (no honest numeric route) ---------------- */
function LocateMcq(r) {
  const startV = 10 * pick(r, 2, 5);
  const target = startV + 10 * pick(r, 1, 3);
  return { kind: "mcq",
    prompt: `A line shows marks at ${startV}, ${startV + 10}, ${startV + 20}, ${startV + 30}. Where does ${target} sit?`,
    options: [
      { label: `Exactly on the mark labeled ${target}`, correct: true, feedback: `Correct — ${target} is one of the labeled tens, so it sits right on its own mark.` },
      { label: `Between ${target} and ${target + 10}`, correct: false, feedback: `Between-the-marks is for numbers the labels skip; ${target} IS a label here.` },
      { label: `To the left of ${startV}`, correct: false, feedback: `${target} is larger than ${startV}, and larger numbers live to the RIGHT on a number line.` },
      { label: `Anywhere — position is a choice`, correct: false, feedback: `A number line fixes every number's home by its size; position is never up for grabs.` },
    ] };
}
function SpacingJudgeMcq() {
  return { kind: "mcq",
    prompt: `One line has marks at 20, 30, 40, 50. Another has marks at 20, 25, 40, 50. Which line is drawn correctly?`,
    options: [
      { label: "The first — its gaps are all equal", correct: true, feedback: `Correct — 20, 30, 40, 50 steps by ten every time; equal gaps are what make a number line honest.` },
      { label: "The second — more marks is better", correct: false, feedback: `Its gaps jump 5, then 15, then 10 — unequal gaps stretch and squash the numbers they hold.` },
      { label: "Both — marks can sit anywhere", correct: false, feedback: `Marks carry meaning through their spacing; unequal gaps make equal distances LOOK different.` },
      { label: "Neither — lines need to start at zero", correct: false, feedback: `A line may start anywhere it likes; what it owes you is equal spacing, not a zero.` },
    ] };
}
function BetweenMcq(r) {
  const startV = 10 * pick(r, 2, 6);
  const mid = startV + 5;
  return { kind: "mcq",
    prompt: `Two marks read ${startV} and ${startV + 10}. What number sits exactly halfway between them?`,
    options: [
      { label: String(mid), correct: true, feedback: `Correct — halfway across a gap of ten is five along: ${startV} + 5 = ${mid}.` },
      { label: String(startV + 1), correct: false, feedback: `${startV + 1} sits just past the first mark — halfway must split the whole gap evenly.` },
      { label: String(startV + 10 + 5), correct: false, feedback: `That lands beyond the second mark; between means inside the gap, not past it.` },
      { label: `No number fits between marks`, correct: false, feedback: `The line is packed with numbers between any two marks — the labels just skip them.` },
    ] };
}
function JumpSizeMcq(r) {
  const startV = 10 * pick(r, 2, 4);
  const target = startV + 32;
  return { kind: "mcq",
    prompt: `From ${startV} to ${target}: which jump plan is fastest to run?`,
    options: [
      { label: "Three ten-jumps, then two one-jumps", correct: true, feedback: `Correct — big jumps cover the tens (30) and small jumps finish the ones (2): five jumps total.` },
      { label: "Thirty-two one-jumps", correct: false, feedback: `Thirty-two tiny hops reach the same place at six times the effort — the line rewards big jumps first.` },
      { label: "Four ten-jumps", correct: false, feedback: `Four tens overshoot to ${startV + 40}; a plan must land exactly, not merely nearby.` },
      { label: "One giant jump of 100", correct: false, feedback: `A hundred-jump flies far past ${target}; jump sizes must fit the distance being covered.` },
    ] };
}
function ShowSumMcq(r) {
  const a = 10 * pick(r, 2, 4) + pick(r, 1, 5);
  const j = 10 * pick(r, 1, 2);
  return { kind: "mcq",
    prompt: `Which line drawing shows ${a} + ${j}?`,
    options: [
      { label: `Start at ${a}, jump forward ${j / 10} tens`, correct: true, feedback: `Correct — the first addend is the starting mark and the second is the forward journey.` },
      { label: `Start at ${j}, jump forward ${a}`, correct: false, feedback: `That drawing reaches the same total but tells the wrong story — ${a} is where this sum begins.` },
      { label: `Start at ${a}, jump backward ${j / 10} tens`, correct: false, feedback: `Backward jumps subtract; a plus sign sends every jump to the right.` },
      { label: `Two dots at ${a} and ${j}, no jumps`, correct: false, feedback: `Dots alone show positions; a SUM needs the jump that joins them into a journey.` },
    ] };
}
function ShowDiffMcq(r) {
  const b = 10 * pick(r, 2, 3) + pick(r, 1, 4);
  const a = b + 10 * pick(r, 1, 2);
  return { kind: "mcq",
    prompt: `Which line drawing shows ${a} − ${b} as a GAP?`,
    options: [
      { label: `Marks at ${b} and ${a}; count the space between`, correct: true, feedback: `Correct — the difference is the distance separating the two marks, hopped and counted.` },
      { label: `Start at ${a}, jump forward ${b}`, correct: false, feedback: `Forward jumps grow the number; a difference either walks BACK or measures the gap.` },
      { label: `One mark at ${a - b}, nothing else`, correct: false, feedback: `That mark is the ANSWER, but a drawing of the difference must show where it came from.` },
      { label: `Marks at ${b} and ${a}; add the two labels`, correct: false, feedback: `Adding the endpoints measures no distance at all — the gap between them is the difference.` },
    ] };
}

const REUSE = { JumpAddTensNumeric, JumpAddOnesNumeric, JumpSubNumeric, DiffAsGapNumeric,
  MissingJumpNumeric, SpacingNumeric,
  StoryFwd: (r) => StoryLineNumeric(r, true), StoryBack: (r) => StoryLineNumeric(r, false),
  LocateMcq, SpacingJudgeMcq: () => SpacingJudgeMcq(), BetweenMcq, JumpSizeMcq, ShowSumMcq, ShowDiffMcq };

function reused(mirror, seedStr, hints, ev,
                fallback = "Walk the line: find the start mark, take the jumps one at a time, and read the mark you land on.") {
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
  must(REG[out.gen]?.has(out.form), `${mirror}: ${out.gen}/${out.form} NOT registered`);
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

/* ---------------- manipulative ---------------- */
function hop(prompt, min, max, start, hopSize, hops, ...rest) {
  // Callers may omit direction (defaults forward). Detect: slot 7 is either the enum or success.
  const direction = rest[0] === "forward" || rest[0] === "back" ? rest.shift() : "forward";
  const [success, traps = []] = rest;
  must(typeof success === "string" && success.length >= 25, "hop success feedback");
  const sign = direction === "back" ? -1 : 1;
  const land = start + sign * hopSize * hops;
  must(land >= min && land <= max && start >= min && start <= max, `hop bounds ${start}->${land}`);
  const commonLandings = traps.map(([value, feedback]) => {
    must(value !== land && value >= min && value <= max, `hop trap ${value}`);
    must(feedback.length >= 25, "hop trap feedback short");
    return { value, feedback };
  });
  return { type: "numberLineHop", prompt, min, max, start, hop: hopSize, hops, direction,
    commonLandings, missFeedback: `Each hop is ${hopSize}, going ${direction === "back" ? "backward" : "forward"}. From ${start}, ${hops} hops land on ${land}.`,
    successFeedback: success };
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`Position on the line IS the number: equal jumps cover equal amounts, and a journey's landing depends only on start, jump size, and direction for ${tag.replace(/-/g, " ")}.`],
  misconceptions: [`Treating marks as decoration — unequal spacing, jumps of the wrong size, or reading a start mark as a landing.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `number-line-g2:${tag}`, delayed: true,
  counterfactualPrompt: "Which change — start, jump size, or direction — would move the landing, and which would leave it alone?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const H = {
  read: ["Find the labeled marks first.", "Equal gaps carry equal amounts.", "Position tells the number."],
  jump: ["Start at the first number.", "Jump the size the sum names.", "Read the landing mark."],
  back: ["Subtraction walks toward zero.", "Same jumps, other direction.", "The landing is the answer."],
  gap: ["Mark both numbers.", "The difference is the space between.", "Hop the gap and count."],
  story: ["Find the start and the move.", "Forward grows, backward shrinks.", "The trail is a number line."],
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });

def(1,
  "A number line gives every number a home: bigger numbers live to the right, and each mark's position IS its value.",
  "Reading the line means matching position to size — no counting from zero required once the labels anchor you.",
  { rep: "number-line", widget: () => hop("Start at the mark labeled 40 and take one ten-hop to visit 50.", 20, 80, 40, 10, 1,
      "Landed on 50 — one ten to the right of 40, exactly where its size puts it.",
      [[41, "That single step visits 41 — the neighbor one ONE away, not one TEN."]]),
    predict: P("Where does 67 live compared to 50?", [{ id: "right", label: "To the right — it is bigger" }, { id: "left", label: "To the left" }], "right",
      "Bigger numbers always sit farther right; 67 outranks 50, so it lives rightward.") },
  [
    reused("LocateMcq", "g2l1-k1", H.read, ["Labels anchor the line.", "Match position to size."]),
    reused("SpacingNumeric", "g2l1-k2", H.read, ["The next mark is one step on.", "Steps here are fives."]),
    reused("LocateMcq", "g2l1-k3", H.read, ["Right of a mark means bigger.", "Left means smaller."]),
    reused("JumpAddTensNumeric", "g2l1-ch1", H.jump, ["Visit a number by jumping to it.", "Tens cover ground fast."]),
  ],
  ["Every number has a home.", "Bigger lives to the right.", "Position is value."],
  "next: why the spacing must be equal.");

def(2,
  "The marks must be EQUALLY spaced — every gap of ten looks the same width, or the line starts telling lies about distance.",
  "Equal spacing is the line's one promise: equal amounts get equal room, so distance on paper matches difference in value.",
  { rep: "number-line", widget: () => hop("Trust the equal gaps: from 30, three equal ten-hops.", 20, 80, 30, 10, 3,
      "60 — three identical gaps, three identical tens, one honest line.",
      [[33, "Three one-steps — equal gaps of TEN are what this line promises."]]),
    predict: P("A line squeezes the gap between 40 and 50 smaller than the others. Trustworthy?", [{ id: "no", label: "No — gaps must match" }, { id: "yes", label: "Yes — looks don't matter" }], "no",
      "A squeezed gap makes ten units look like five — the picture would contradict the values.") },
  [
    reused("SpacingJudgeMcq", "g2l2-k1", H.read, ["Compare the gaps by eye.", "Equal gaps, honest line."]),
    reused("SpacingNumeric", "g2l2-k2", H.read, ["Each step adds the same amount.", "The spacing names the step."]),
    reused("SpacingJudgeMcq", "g2l2-k3", H.read, ["Unequal gaps distort distance.", "The promise is uniformity."]),
    reused("SpacingNumeric", "g2l2-ch1", H.read, ["Predict the next mark from the step.", "The pattern continues evenly."]),
  ],
  ["Marks keep equal gaps.", "Equal amounts, equal room.", "Spacing is the line's promise."],
  "next: the numbers hiding between marks.");

def(3,
  "Labels skip numbers, but the line never does: between 40 and 50 live 41 through 49, with 45 sitting exactly halfway.",
  "Halfway across a gap of ten is five along — the middle of any tens-gap ends in a 5.",
  { rep: "number-line", widget: () => hop("March into the gap: from 40, five one-hops toward the halfway point.", 35, 55, 40, 1, 5,
      "45 — five small steps deep, exactly halfway to 50.",
      [[50, "That leapt the WHOLE gap — halfway stops at five of the ten."]]),
    predict: P("Between marks 60 and 70, does 64 exist on the line?", [{ id: "yes", label: "Yes — labels just skip it" }, { id: "no", label: "No — only marks are real" }], "yes",
      "The line holds every number; labels are a courtesy, not a boundary.") },
  [
    reused("BetweenMcq", "g2l3-k1", H.read, ["Halfway splits the gap evenly.", "A tens-gap's middle ends in 5."]),
    reused("SpacingNumeric", "g2l3-k2", H.read, ["Small steps walk the gap.", "Count them from the left mark."]),
    reused("BetweenMcq", "g2l3-k3", H.read, ["Between means inside the gap.", "Past a mark is not between."]),
    reused("JumpAddOnesNumeric", "g2l3-ch1", H.jump, ["One-jumps reach the in-betweens.", "Land exactly, then read."]),
  ],
  ["Labels skip; the line doesn't.", "Every gap is full of numbers.", "Halfway in a tens-gap ends in 5."],
  "next: jumping forward to add.");

def(4,
  "Addition is a forward journey: start at the first number, jump the second number's worth to the right, land on the sum.",
  "The line turns 47 + 30 into a walk — three ten-jumps you can see, ending where the answer waits.",
  { rep: "number-line", widget: () => hop("Show 47 + 30: three ten-hops forward from 47.", 40, 90, 47, 10, 3,
      "77 — the sum, reached one visible ten at a time.",
      [[50, "That single hop banks one ten of the three — the journey continues to 77."]]),
    predict: P("Adding on the line moves which way?", [{ id: "right", label: "Right — sums grow" }, { id: "left", label: "Left" }], "right",
      "Adding makes numbers bigger, and bigger lives to the right.") },
  [
    reused("JumpAddTensNumeric", "g2l4-k1", H.jump, ["Start at the first addend.", "Jump the second's worth."]),
    reused("JumpAddOnesNumeric", "g2l4-k2", H.jump, ["Small addends take small jumps.", "Land, then read."]),
    reused("ShowSumMcq", "g2l4-k3", H.jump, ["The drawing tells the sum's story.", "Start, jump, land."]),
    reused("JumpAddTensNumeric", "g2l4-ch1", H.jump, ["Bigger sums, same walk.", "Forward, by tens."]),
  ],
  ["Addition walks right.", "Start, jump, land.", "The landing is the sum."],
  "next: jumping backward to subtract.");

def(5,
  "Subtraction is the same walk, reversed: start at the bigger number, jump backward, land on the difference.",
  "63 − 20 is two ten-jumps toward zero — the line makes taking away as visible as adding on.",
  { rep: "number-line", widget: () => hop("Show 63 − 20: two ten-hops BACKWARD from 63.", 30, 70, 63, 10, 2, "back",
      "43 — two tens walked back toward zero, landing on the difference.",
      [[53, "One backward ten so far — the subtraction asks for two."]]),
    predict: P("Subtracting on the line moves which way?", [{ id: "left", label: "Left — toward zero" }, { id: "right", label: "Right" }], "left",
      "Taking away shrinks the number, and smaller lives to the left.") },
  [
    reused("JumpSubNumeric", "g2l5-k1", H.back, ["Start at the larger number.", "Walk backward its due."]),
    reused("JumpSubNumeric", "g2l5-k2", H.back, ["Each backward ten shrinks by ten.", "Stop on the difference."]),
    reused("ShowDiffMcq", "g2l5-k3", H.gap, ["A difference can be a walk OR a gap.", "Both drawings agree."]),
    reused("JumpSubNumeric", "g2l5-ch1", H.back, ["Longer walks back, same idea.", "Direction carries the minus."]),
  ],
  ["Subtraction walks left.", "Start big, jump back.", "Land on the difference."],
  "next: choosing jump sizes wisely.");

def(6,
  "Jumps come in sizes: tens devour distance, ones finish the job. A good plan spends big jumps first and small jumps last.",
  "From 40 to 72: three tens then two ones — five jumps instead of thirty-two.",
  { rep: "number-line", widget: () => hop("Cover the tens of a 32-journey: three ten-hops from 40.", 30, 90, 40, 10, 3,
      "70 — the tens are spent; two little one-jumps would finish at 72.",
      [[43, "Three ones cover 3 of the 32 — the big jumps belong first."]]),
    predict: P("To travel 32 along the line, which plan wins?", [{ id: "mix", label: "Three tens, then two ones" }, { id: "ones", label: "Thirty-two ones" }], "mix",
      "Both arrive, but the mixed plan takes five jumps where ones-only takes thirty-two.") },
  [
    reused("JumpSizeMcq", "g2l6-k1", H.jump, ["Big jumps first.", "Small jumps finish exactly."]),
    reused("JumpAddTensNumeric", "g2l6-k2", H.jump, ["The tens leg of the journey.", "Count tens, not steps."]),
    reused("JumpAddOnesNumeric", "g2l6-k3", H.jump, ["The ones leg lands it.", "Precision at the end."]),
    reused("JumpSizeMcq", "g2l6-ch1", H.jump, ["Plans must land EXACTLY.", "Overshooting is not arriving."]),
  ],
  ["Jumps have sizes.", "Tens first, ones last.", "Plans must land exactly."],
  "next: drawing a sum so others can read it.");

def(7,
  "A sum drawn on the line tells its whole story: the start mark names the first addend, the jumps name the second, the landing names the answer.",
  "Anyone can read your drawing back into '38 + 20 = 58' — the picture and the equation say one thing.",
  { rep: "number-line", widget: () => hop("Draw 38 + 20 for a reader: two ten-hops from 38.", 30, 70, 38, 10, 2,
      "58 — a drawing any classmate could read straight back into the equation.",
      [[40, "A hop of two — the drawn jumps must each be a full ten."]]),
    predict: P("In a drawing of 38 + 20, what does the starting mark show?", [{ id: "first", label: "The first addend, 38" }, { id: "answer", label: "The answer" }], "first",
      "The journey begins at the first addend; the answer is where it ENDS.") },
  [
    reused("ShowSumMcq", "g2l7-k1", H.jump, ["Start = first addend.", "Jumps = second addend."]),
    reused("JumpAddTensNumeric", "g2l7-k2", H.jump, ["Compute what the drawing shows.", "Landing = sum."]),
    reused("ShowSumMcq", "g2l7-k3", H.jump, ["Wrong drawings tell wrong stories.", "Direction and start matter."]),
    reused("StoryFwd", "g2l7-ch1", H.story, ["Draw a story's sum the same way.", "The trail is the line."]),
  ],
  ["The drawing tells the sum's story.", "Start, jumps, landing.", "Picture and equation agree."],
  "next: drawing a difference.");

def(8,
  "A difference has two honest drawings: walk backward from the bigger number, or mark both numbers and measure the gap between them.",
  "Both pictures of 57 − 23 land on 34 — the walk and the gap are two views of one fact.",
  { rep: "number-line", widget: () => hop("Draw 57 − 23's tens as a walk: two backward ten-hops from 57.", 25, 65, 57, 10, 2, "back",
      "37 — the tens are walked; three more backward ones would rest at 34.",
      [[55, "A backward two — each drawn hop here is a full ten of the 23."]]),
    predict: P("Which ALSO shows 57 − 23?", [{ id: "gap", label: "Marks at 23 and 57; the gap between" }, { id: "sum", label: "Adding the marks" }], "gap",
      "The distance from 23 up to 57 is the same 34 the backward walk finds.") },
  [
    reused("ShowDiffMcq", "g2l8-k1", H.gap, ["Gap or walk — both are honest.", "They must agree."]),
    reused("DiffAsGapNumeric", "g2l8-k2", H.gap, ["Measure the space between marks.", "The gap is the difference."]),
    reused("JumpSubNumeric", "g2l8-k3", H.back, ["The walk view, computed.", "Backward by the tens."]),
    reused("DiffAsGapNumeric", "g2l8-ch1", H.gap, ["Pick whichever view is faster.", "The answer cannot differ."]),
  ],
  ["Two drawings of a difference.", "Walk back, or measure the gap.", "Both land together."],
  "next: finding a jump that went missing.");

def(9,
  "Sometimes the line shows the start and the landing but hides the jump: the missing jump is the gap between them — a subtraction in disguise.",
  "From 40 to 70 the hidden jump is 70 − 40 = 30; the line turns 'what was added?' into 'how far apart?'.",
  { rep: "number-line", widget: () => hop("The start was 40 and the landing 70. Rebuild the missing jump: three ten-hops.", 30, 80, 40, 10, 3,
      "70 — the rebuilt jump measures exactly 30, the gap the drawing hid.",
      [[50, "One ten rebuilt of three — keep hopping until the landing matches 70."]]),
    predict: P("Start 40, landing 70, jump unknown. How do you find it?", [{ id: "sub", label: "Subtract: 70 − 40" }, { id: "add", label: "Add: 70 + 40" }], "sub",
      "The jump is the distance between landing and start — a difference, never a sum.") },
  [
    reused("MissingJumpNumeric", "g2l9-k1", H.gap, ["Landing minus start.", "The gap is the jump."]),
    reused("MissingJumpNumeric", "g2l9-k2", H.gap, ["Check by re-jumping it.", "Start plus jump = landing."]),
    reused("ShowDiffMcq", "g2l9-k3", H.gap, ["The missing jump is a gap picture.", "Same drawing, new question."]),
    reused("MissingJumpNumeric", "g2l9-ch1", H.gap, ["Hidden jumps with messier landings.", "The rule holds firm."]),
  ],
  ["The missing jump is the gap.", "Landing minus start.", "Re-jump to check."],
  "next: stories that live on the line.");

def(10,
  "Trail markers, page numbers, temperatures — stories move along lines all day. Find the start and the move, and the line does the rest.",
  "Forward moves add, backward moves subtract, and 'how far apart' measures a gap: three story shapes, one number line.",
  { rep: "number-line", widget: () => hop("Maggie hikes from marker 35, thirty meters onward: three ten-hops.", 25, 75, 35, 10, 3,
      "Marker 65 — the story's hike, walked as jumps anyone could re-tell.",
      [[38, "A three-meter start — each leg of this hike is a full ten meters."]]),
    predict: P("A story says Maggie walks BACK toward the trailhead. Which way on the line?", [{ id: "left", label: "Left — the marker number shrinks" }, { id: "right", label: "Right" }], "left",
      "Back toward the start means smaller markers — a leftward, subtracting move.") },
  [
    reused("StoryFwd", "g2l10-k1", H.story, ["Start marker plus the move.", "Forward stories add."]),
    reused("StoryBack", "g2l10-k2", H.story, ["Backward stories subtract.", "The move's size is the jump."]),
    reused("MissingJumpNumeric", "g2l10-k3", H.gap, ["'How far apart' is a gap story.", "Subtract the markers."]),
    reused("StoryBack", "g2l10-ch1", H.story, ["Mixed stories, one line.", "Name the start, name the move."]),
  ],
  ["Stories move along lines.", "Forward adds, backward subtracts.", "'Apart' measures a gap."],
  "course complete: the number line read, jumped, drawn, and storied.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 10, `10 lessons defined, got ${L.length}`);
const chapterTitles = ["Reading the Line", "Jumps That Add and Subtract", "Sums, Differences, and Stories"];
const perChapter = [3, 3, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 3 ? 1 : n <= 6 ? 2 : 3);
const outDir = join(root, "content/courses/number-line-g2");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seq = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `g2l-0${ch}-${String(seq).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev, widget: c.widget, hints: c.hints, cml: cml(tag, "number-line") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const lesson = {
    id, slug, title: row.title, courseId: "number-line-g2",
    chapterId: chapters[ch - 1].id, minutes: 6, readingProfile: "standard",
    steps: [
      { id: "c1", kind: "concept", figure: "count-on-hops", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: "Try it.", conceptTag: tag, widget: d.i1.widget(), predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      stepFromCheck("k1", d.checks[0]),
      { id: "c2", kind: "concept", figure: "count-on-hops", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: "Try it again.", conceptTag: tag, widget: d.i1.widget(), cml: cml(tag, "number-line") },
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
    if (w.type === "numberLineHop") {
      const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
      must(land >= w.min && land <= w.max, `${id}/${s.id} hop land outside range`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "number-line-g2", slug: "number-line-g2", title: spec.title,
  tagline: "Read it, jump it, draw it — the number line as a place where sums and differences become journeys.",
  category: "Math", gradeLevel: 2, chapters,
}, null, 2) + "\n");
console.log(`built 10 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
