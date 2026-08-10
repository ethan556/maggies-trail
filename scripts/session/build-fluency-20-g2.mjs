#!/usr/bin/env node
// S188: build the fluency-20-g2 course (14 lessons, 2.OA.B.2 — add/subtract within 20 from
// memory). The sixth K5-expansion course and the FIRST content over the ADDITIVE half of the
// S186/S187 fact-grain architecture: every graded step carries an additive `factFamily` key
// ("7+8"), so a Grade-2 learner's leech box and review queue work exactly as a Grade-3
// multiplication learner's do — one key space, one map, one review surface.
//
// Manipulatives are additive by construction: tenFrame for make-ten composition, numberLineHop
// for counting on and back. areaModel (the g3 pair's engine) is multiplicative and would
// misrepresent the mathematics here.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "fluency-20-g2");
if (!spec || spec.lessons.length !== 14) throw new Error("spec course missing or wrong size");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };

/** Additive fact-family key — MUST match src/lib/factFluency.ts's sumFamilyKey exactly. */
const fam = (a, b) => `${Math.min(a, b)}+${Math.max(a, b)}`;

/* ----------------------------------------------------------------- widget builders */

/** Ten frame: `preFilled` dots are locked, the learner taps up to `target`. The make-ten model. */
function frame(prompt, target, preFilled, traps, opts = {}) {
  must(Number.isInteger(target) && target >= 1 && target <= 10, `frame target ${target}`);
  must(Number.isInteger(preFilled) && preFilled >= 0 && preFilled < target, `frame preFilled ${preFilled} vs ${target}`);
  const commonCounts = traps.map(([count, feedback]) => {
    must(count !== target && count >= 0 && count <= 10, `frame trap ${count} vs ${target}`);
    must(feedback.length >= 25, `frame trap feedback short: ${feedback}`);
    return { count, feedback };
  });
  must(new Set(commonCounts.map((c) => c.count)).size === commonCounts.length, "frame traps distinct");
  return {
    type: "tenFrame", prompt, target, preFilled, addColor: opts.addColor ?? "tangerine",
    commonCounts,
    missFeedback: opts.miss ?? `Count the dots already there, then add just enough to reach ${target}.`,
    successFeedback: opts.success ?? `${preFilled} and ${target - preFilled} more makes ${target}.`,
  };
}

/** Number line hop: counting on (forward) or back. Landing = start ± hop·hops. */
function hop(prompt, { min, max, start, hop: hopSize = 1, hops, direction }, traps, opts = {}) {
  const landing = direction === "back" ? start - hopSize * hops : start + hopSize * hops;
  must(Number.isInteger(hops) && hops >= 1, `hop hops ${hops}`);
  must(landing >= min && landing <= max, `hop landing ${landing} outside ${min}..${max}`);
  must(start >= min && start <= max, `hop start ${start} outside range`);
  const commonLandings = traps.map(([value, feedback]) => {
    must(value !== landing && value >= min && value <= max, `hop trap ${value} vs landing ${landing}`);
    must(feedback.length >= 25, `hop trap feedback short: ${feedback}`);
    return { value, feedback };
  });
  must(new Set(commonLandings.map((c) => c.value)).size === commonLandings.length, "hop traps distinct");
  return {
    type: "numberLineHop", prompt, min, max, start, hop: hopSize, hops, direction, commonLandings,
    missFeedback: opts.miss ?? `Start at ${start} and make ${hops} ${hops === 1 ? "hop" : "hops"} ${direction === "back" ? "left" : "right"}, one number at a time.`,
    successFeedback: opts.success ?? `${hops} ${hops === 1 ? "hop" : "hops"} ${direction === "back" ? "back from" : "on from"} ${start} lands on ${landing}.`,
  };
}

function numeric(prompt, answer, traps, fallback, success) {
  const commonErrors = traps.map(([value, feedback]) => {
    must(value !== answer, `numeric trap equals answer ${value}: ${prompt}`);
    must(value >= 0, `numeric trap negative ${value}: ${prompt}`);
    must(feedback.length >= 25, `numeric trap feedback short (${feedback.length}): ${feedback}`);
    return { value, feedback };
  });
  must(new Set(commonErrors.map((e) => e.value)).size === commonErrors.length, `numeric traps distinct: ${prompt}`);
  return { type: "numeric", prompt, answer, tolerance: 0, unit: "", commonErrors, fallbackFeedback: fallback, successFeedback: success };
}

function mcq(prompt, correct, wrongs) {
  const opts = [{ label: String(correct[0]), feedback: correct[1], ok: true },
    ...wrongs.map(([l, f]) => ({ label: String(l), feedback: f, ok: false }))];
  must(new Set(opts.map((o) => o.label)).size === opts.length, `dup mcq labels: ${prompt}`);
  for (const o of opts) must(o.feedback.length >= 25, `mcq feedback short: ${o.feedback}`);
  const rot = prompt.length % opts.length;
  const shown = [...opts.slice(rot), ...opts.slice(0, rot)].map((o, i) => ({ id: `o${i}`, label: o.label, feedback: o.feedback, correct: o.ok }));
  must(shown.filter((o) => o.correct).length === 1, "exactly one correct");
  return { type: "mcq", prompt, options: shown };
}

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`The manipulated model and the mathematical relationship for ${tag.replace(/-/g, " ")} must stay consistent.`],
  misconceptions: [`Changing a visible feature without preserving the relationship that defines ${tag.replace(/-/g, " ")}.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `fact-fluency:${tag}`, delayed: true,
  counterfactualPrompt: "What change would make the model stop representing the same mathematical relationship?",
});

const F = "g2-fluency";
const V = (form, factFamily) => (factFamily ? { gen: F, form, factFamily } : { gen: F, form });
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

/* --------------------------------------------------------------- reusable check packs */

/** A plain addition drill, additively fact-family tagged. */
const addFact = (a, b, form) => {
  const t = a + b;
  must(t <= 20, `addFact ${a}+${b} exceeds 20`);
  return {
    body: "Recall the fact.",
    ev: [`${a} and ${b} together make ${t}.`, `${a} + ${b} = ${t}, and addition commutes, so ${b} + ${a} is the same total.`],
    widget: numeric(`${a} + ${b} = ?`, t,
      [[t - 1, `That stops one count short. Count on ${b} from ${a} and land on ${t}.`],
       [Math.abs(a - b), `That finds the difference between ${a} and ${b} instead of their total.`]],
      `Start at the bigger number and count on — or make ten first, then add what is left.`,
      `Correct — ${a} + ${b} = ${t}.`),
    hints: [`Start from the bigger number.`, `Make ten, then add the rest.`, `${a} + ${b} = ${t}.`],
    variant: V(form, fam(a, b)),
  };
};

/** A subtraction drill within the same family: total minus one part leaves the other. */
const subFact = (total, part, form) => {
  const rest = total - part;
  must(rest >= 0 && total <= 20, `subFact ${total}-${part}`);
  return {
    body: "Take it away.",
    ev: [`${part} + ${rest} = ${total}, so ${total} − ${part} = ${rest}.`,
      `Taking ${part} from ${total} leaves the other part of the family: ${rest}.`],
    widget: numeric(`${total} − ${part} = ?`, rest,
      [[total, `That repeats the total instead of taking ${part} away from it.`],
       [rest + 1, `That leaves one too many — check by adding back: ${rest + 1} + ${part} = ${rest + 1 + part}, not ${total}.`]],
      `Think addition: ${part} + ? = ${total}.`,
      `Correct — ${total} − ${part} = ${rest}, since ${part} + ${rest} = ${total}.`),
    hints: [`Think addition.`, `${part} + ? = ${total}.`, `${total} − ${part} = ${rest}.`],
    variant: V(form, fam(part, rest)),
  };
};

/** Doubles: the anchor facts. */
const doubleFact = (a) => ({
  body: "Double it.",
  ev: [`Double ${a} is ${2 * a}.`, `${a} + ${a} = ${2 * a} — the same number twice.`],
  widget: numeric(`${a} + ${a} = ?`, 2 * a,
    [[a, `That names one addend instead of doubling it — a double adds ${a} to itself.`],
     [2 * a - 1, `That is one short of the double. Count on ${a} from ${a} to reach ${2 * a}.`]],
    `A double adds the same number to itself.`,
    `Correct — double ${a} is ${2 * a}.`),
  hints: [`Add the number to itself.`, `Think of two equal groups of ${a}.`, `${a} + ${a} = ${2 * a}.`],
  variant: V("FlDoublesNumeric", fam(a, a)),
});

/** Near double: one more than a double the learner already owns. */
const nearDouble = (a) => {
  const b = a + 1, t = a + b;
  return {
    body: "One more than a double.",
    ev: [`Double ${a} is ${2 * a}; one more makes ${t}.`, `${a} + ${b} = ${t}, because ${b} is one more than ${a}.`],
    widget: numeric(`${a} + ${b} = ?`, t,
      [[2 * a, `That doubles ${a}, but the second addend is ${b} — one MORE than ${a}, so the total is one more too.`],
       [2 * b, `That doubles ${b}, but the first addend is ${a} — one LESS than ${b}.`]],
      `Use the double you know, then adjust by one.`,
      `Correct — double ${a} is ${2 * a}, and one more makes ${t}.`),
    hints: [`Start from a double you know.`, `Double ${a} is ${2 * a}.`, `One more makes ${t}.`],
    variant: V("FlNearDoublesNumeric", fam(a, b)),
  };
};

/** Make-ten: use part of the second addend to complete a ten, then add the remainder. */
const makeTen = (a, b) => {
  const need = 10 - a, left = b - need, t = a + b;
  must(need > 0 && left > 0 && t <= 20, `makeTen ${a}+${b} does not cross ten`);
  return {
    body: "Make ten first.",
    ev: [`${a} + ${need} makes ten, then ${left} more gives ${t}.`, `Breaking ${b} into ${need} and ${left} turns a hard fact into a ten-plus fact.`],
    widget: numeric(`${a} + ${b} = ? (Make ten first.)`, t,
      [[10, `That stops at ten. After using ${need} to make ten, ${left} still remain to add.`],
       [t - 1, `That stops one short. ${a} + ${need} = 10, then ${left} more makes ${t}.`]],
      `Split ${b} into the part that completes ten and the part left over.`,
      `Correct — ${a} + ${need} makes ten, then ${left} more gives ${t}.`),
    hints: [`How many more to reach ten?`, `${a} needs ${need} to make ten.`, `10 + ${left} = ${t}.`],
    variant: V("FlMakeTenNumeric", fam(a, b)),
  };
};

const tenPlus = (c) => {
  const on = c === 1 ? "one" : "ones";
  return {
    body: "Ten and some more.",
    ev: [`Ten and ${c} more is ${10 + c}.`, `${10 + c} is written as a ten and ${c} ${on}.`],
    widget: numeric(`10 + ${c} = ?`, 10 + c,
      [[c, `That leaves out the ten. Ten plus ${c} keeps the ten and adds ${c} ${on}.`],
       [10, `That leaves out the ${c}. Ten plus ${c} is ${10 + c}.`]],
      `Keep the ten whole and add the ones onto it.`,
      `Correct — ten and ${c} more is ${10 + c}.`),
    hints: [`Keep the ten.`, `Add ${c} onto ten.`, `10 + ${c} = ${10 + c}.`],
    variant: V("FlTenPlusNumeric", fam(10, c)),
  };
};

const fromTen = (c) => ({
  body: "Take it from ten.",
  ev: [`10 − ${c} = ${10 - c}, since ${c} + ${10 - c} = 10.`, `The two parts of ten are ${c} and ${10 - c}.`],
  widget: numeric(`10 − ${c} = ?`, 10 - c,
    [[c, `That repeats the number taken away instead of what is left.`],
     [10, `That leaves the ten unchanged — ${c} must come off it.`]],
    `Think: ${c} and what makes ten?`,
    `Correct — 10 − ${c} = ${10 - c}.`),
  hints: [`Think of ten's two parts.`, `${c} + ? = 10.`, `10 − ${c} = ${10 - c}.`],
  variant: V("FlFromTenNumeric", fam(c, 10 - c)),
});

const acrossTen = (total, part) => {
  const toTen = total - 10, rest = part - toTen, ans = total - part;
  must(toTen > 0 && rest > 0 && ans >= 0, `acrossTen ${total}-${part} does not cross ten`);
  return {
    body: "Cross back over ten.",
    ev: [`Take ${toTen} to reach ten, then ${rest} more: ${total} − ${part} = ${ans}.`,
      `Subtracting in two steps keeps every step inside facts already known.`],
    widget: numeric(`${total} − ${part} = ?`, ans,
      [[total - 10, `That takes away ten instead of ${part}.`],
       [ans + 1, `That is one too many left — check by adding back: ${ans + 1} + ${part} = ${ans + 1 + part}, not ${total}.`]],
      `Step down to ten first, then take the rest.`,
      `Correct — ${total} − ${toTen} = 10, then 10 − ${rest} = ${ans}.`),
    hints: [`Stop at ten on the way down.`, `${total} − ${toTen} = 10.`, `10 − ${rest} = ${ans}.`],
    variant: V("FlAcrossTenNumeric", fam(part, ans)),
  };
};

const thinkAddition = (a, c) => {
  const t = a + c;
  return {
    body: "Think addition.",
    ev: [`${a} + ${c} = ${t}, so ${t} − ${a} = ${c}.`, `Every subtraction is an addition fact read backwards.`],
    widget: numeric(`${t} − ${a} = ? Think: ${a} + ? = ${t}.`, c,
      [[t, `That repeats the total. The question asks what is LEFT after ${a} comes off.`],
       [a, `That repeats the part taken away instead of the part remaining.`]],
      `Ask what joins ${a} to make ${t}.`,
      `Correct — ${a} + ${c} = ${t}, so ${t} − ${a} = ${c}.`),
    hints: [`Turn it into addition.`, `${a} + ? = ${t}.`, `The missing part is ${c}.`],
    variant: V("FlThinkAdditionNumeric", fam(a, c)),
  };
};

const factFamilyPack = (a, c) => {
  const t = a + c;
  return {
    body: "One family, four facts.",
    ev: [`The family ${a}, ${c}, ${t} holds ${a}+${c}, ${c}+${a}, ${t}−${a} and ${t}−${c}.`,
      `Knowing one fact of the family gives the other three.`],
    widget: numeric(`Fact family ${a}, ${c}, ${t}: knowing ${a} + ${c} = ${t}, what is ${t} − ${c}?`, a,
      [[t, `That repeats the total instead of removing ${c} from it.`],
       [c, `That repeats ${c} instead of the other part of the family.`]],
      `The family's two parts are ${a} and ${c}.`,
      `Correct — the parts are ${a} and ${c}, so ${t} − ${c} = ${a}.`),
    hints: [`The family has two parts and a total.`, `The parts are ${a} and ${c}.`, `${t} − ${c} = ${a}.`],
    variant: V("FlFactFamilyNumeric", fam(a, c)),
  };
};

const missingPack = (a, c) => {
  const t = a + c;
  return {
    body: "Fill the gap.",
    ev: [`${a} + ${c} = ${t}, so the missing part is ${c}.`, `A missing addend is found by subtracting: ${t} − ${a} = ${c}.`],
    widget: numeric(`${a} + ? = ${t}`, c,
      [[t, `That repeats the total instead of the missing part.`],
       [t + a, `That adds ${a} again instead of finding what fills the gap to ${t}.`]],
      `What joins ${a} to reach ${t}?`,
      `Correct — ${a} + ${c} = ${t}.`),
    hints: [`Count on from ${a}.`, `${a} + ? = ${t}.`, `The missing part is ${c}.`],
    variant: V("FlMissingNumeric", fam(a, c)),
  };
};

const speedAdd = (a, b) => {
  const t = a + b;
  return {
    body: "Fast recall.",
    ev: [`${a} + ${b} = ${t}.`, `Known facts come back without counting.`],
    widget: numeric(`Answer fast: ${a} + ${b} = ?`, t,
      [[t - 1, `That stops one count short of the total — count on again from ${a}.`],
       [Math.abs(a - b), `That finds the difference between ${a} and ${b} instead of their total.`]],
      `Reach for the fact rather than counting from one.`,
      `Correct — ${a} + ${b} = ${t}.`),
    hints: [`Reach for the known fact.`, `Use a double or a ten.`, `${a} + ${b} = ${t}.`],
    variant: V("FlSpeedAddNumeric", fam(a, b)),
  };
};

const speedSub = (total, part) => {
  const rest = total - part;
  return {
    body: "Fast recall.",
    ev: [`${total} − ${part} = ${rest}.`, `Subtraction facts come back through their addition partners.`],
    widget: numeric(`Answer fast: ${total} − ${part} = ?`, rest,
      [[total, `That repeats the total instead of taking ${part} away.`],
       [rest + 1, `That leaves one too many — check by adding back: ${rest + 1} + ${part} = ${rest + 1 + part}.`]],
      `Think the addition partner of this fact.`,
      `Correct — ${total} − ${part} = ${rest}.`),
    hints: [`Think addition.`, `${part} + ? = ${total}.`, `${total} − ${part} = ${rest}.`],
    variant: V("FlSpeedSubNumeric", fam(part, rest)),
  };
};

/* --------------------------------------------------------------------- the 14 lessons */

const L = [];
const def = (n, ch, c1, c2, i1, k1, k2, k3, ch1, i2, recap, teaser) =>
  L.push({ n, ch, c1, c2, i1, k1, k2, k3, ch1, i2, recap, teaser });

def(1, 1,
  "A double adds a number to itself. Doubles are the first facts worth knowing on sight, because so many other facts lean on them.",
  "Two equal groups: 6 and 6 make 12. No counting from one — the answer is remembered whole.",
  { body: "Fill both halves.", rep: "diagram",
    widget: () => frame("Fill the frame to show double 4.", 8, 4,
      [[4, "That leaves the frame with only the first group of 4. A double needs a second group the same size."],
       [7, "That is one short of double 4. The second group must match the first exactly."]],
      { success: "4 and 4 more makes 8 — double 4." }),
    predict: P("You will add a second group of 4 to a frame that already holds 4. What will the frame show?",
      [{ id: "a", label: "8 — two equal groups of 4" }, { id: "b", label: "5 — one more dot" }, { id: "c", label: "44" }], "a",
      "A double adds the whole group again, not one more dot: 4 and 4 make 8.") },
  doubleFact(6), doubleFact(8), doubleFact(7), doubleFact(9),
  { body: "A bigger double.", widget: () => frame("Fill the frame to show double 5.", 10, 5, [], { success: "5 and 5 makes 10 — a full frame." }) },
  ["A double adds a number to itself.", "Doubles are recalled, not counted.", "6 + 6 = 12."],
  "next: facts that sit right beside a double.")
def(2, 1,
  "A near double is one step from a double: 6 + 7 is double 6, plus one more.",
  "Knowing one fact well gives its neighbors cheaply — adjust the double by one instead of starting over.",
  { body: "Add the extra one.", rep: "diagram",
    widget: () => hop("Start at 12 (double 6) and hop forward 1 to find 6 + 7.", { min: 0, max: 20, start: 12, hops: 1, direction: "forward" },
      [[11, "That hops backward. 6 + 7 is one MORE than double 6, not one less."]],
      { success: "Double 6 is 12, and one more makes 13 — that is 6 + 7." }),
    predict: P("Double 6 is 12. What is 6 + 7?",
      [{ id: "a", label: "13 — one more than the double" }, { id: "b", label: "12 — the same" }, { id: "c", label: "14 — double 7" }], "a",
      "7 is one more than 6, so the total is one more than double 6: 13.") },
  nearDouble(6), nearDouble(4), nearDouble(7), nearDouble(8),
  { body: "Another near double.", widget: () => hop("Start at 16 (double 8) and hop forward 1 to find 8 + 9.", { min: 0, max: 20, start: 16, hops: 1, direction: "forward" }, [], { success: "Double 8 is 16, and one more makes 17." }) },
  ["A near double is a double plus one.", "Adjust a known fact instead of recounting.", "6 + 7 = 13."],
  "next: using ten as a stepping stone.")
def(3, 1,
  "Ten is the easiest number to add to. To add across ten, first use part of the second number to fill a ten.",
  "8 + 5: give 2 to the 8 to make ten, and 3 are left. Ten and 3 is 13.",
  { body: "Complete the ten.", rep: "diagram",
    widget: () => frame("The frame holds 8. Fill it to ten.", 10, 8,
      [[9, "That adds only one. A frame of 8 needs 2 more to reach ten."],
       [10 - 8, "That counts the dots you added rather than the full frame. The frame should show 10 in all."]],
      { success: "8 and 2 more makes ten — the frame is full." }),
    predict: P("The frame holds 8 and you have 5 more dots. How many will it take to fill the frame to ten?",
      [{ id: "a", label: "2 — then 3 are left over" }, { id: "b", label: "5 — all of them" }, { id: "c", label: "10" }], "a",
      "8 needs just 2 to reach ten. The other 3 stay outside, making 13 in all.") },
  makeTen(8, 5), makeTen(9, 4), makeTen(7, 6), makeTen(8, 7),
  { body: "Fill a different ten.", widget: () => frame("The frame holds 7. Fill it to ten.", 10, 7, [], { success: "7 and 3 more makes ten." }) },
  ["Make ten first, then add the rest.", "Split the second number into two parts.", "8 + 5 = 13."],
  "next: adding onto a ten.")
def(4, 1,
  "Once a ten is made, the rest is easy: ten and some ones keeps the ten whole and names the ones.",
  "10 + 6 is 16 — the ten stays a ten, and 6 ones sit beside it. That is how teen numbers are written.",
  { body: "Hop past ten.", rep: "diagram",
    widget: () => hop("Start at 10 and hop forward 6.", { min: 0, max: 20, start: 10, hops: 6, direction: "forward" },
      [[6, "That counts the hops instead of where they land. Starting at 10, six hops land on 16."],
       [15, "That is one hop short. Count each of the six hops onto 10."]],
      { success: "Six hops on from 10 lands on 16 — a ten and 6 ones." }),
    predict: P("You start at 10 and hop forward 6. Where will you land?",
      [{ id: "a", label: "16 — a ten and 6 ones" }, { id: "b", label: "6 — the hops" }, { id: "c", label: "60" }], "a",
      "The ten stays whole and 6 ones join it: 16.") },
  tenPlus(6), tenPlus(9), tenPlus(4), tenPlus(7),
  { body: "Hop a different amount.", widget: () => hop("Start at 10 and hop forward 3.", { min: 0, max: 20, start: 10, hops: 3, direction: "forward" }, [], { success: "Three hops on from 10 lands on 13." }) },
  ["Ten plus ones keeps the ten whole.", "Teen numbers are a ten and some ones.", "10 + 6 = 16."],
  "next: sums up to 12.")
def(5, 2,
  "With doubles, near doubles and make-ten in hand, every sum to 12 has a strategy behind it.",
  "The goal now is speed: reach for the fact rather than counting from one.",
  { body: "Build the sum.", rep: "diagram",
    widget: () => hop("Start at 7 and hop forward 4.", { min: 0, max: 20, start: 7, hops: 4, direction: "forward" },
      [[10, "That stops at ten. One more hop remains after reaching ten."],
       [4, "That counts the hops instead of the landing. Start the count at 7."]],
      { success: "Four hops on from 7 lands on 11." }),
    predict: P("7 + 4: which strategy is fastest?",
      [{ id: "a", label: "Make ten from 7, then add the 1 left" }, { id: "b", label: "Count all 11 from one" }, { id: "c", label: "Double 7" }], "a",
      "7 needs 3 to make ten, leaving 1: ten and 1 is 11. Counting from one works but is slow.") },
  addFact(7, 4, "FlSums12Numeric"), addFact(5, 6, "FlSums12Numeric"),
  addFact(8, 3, "FlSums12Numeric"), addFact(6, 6, "FlSums12Numeric"),
  { body: "One more sum.", widget: () => hop("Start at 9 and hop forward 3.", { min: 0, max: 20, start: 9, hops: 3, direction: "forward" }, [], { success: "Three hops on from 9 lands on 12." }) },
  ["Every sum has a strategy.", "Reach for the fact, not the count.", "7 + 4 = 11."],
  "next: sums up to 16.")
def(6, 2,
  "Sums into the teens lean hardest on make-ten, because both addends are large enough to cross it.",
  "9 + 6: give 1 to the 9, and 5 are left. Ten and 5 is 15.",
  { body: "Cross ten.", rep: "diagram",
    widget: () => hop("Start at 9 and hop forward 6.", { min: 0, max: 20, start: 9, hops: 6, direction: "forward" },
      [[10, "That stops at ten. Five hops remain after reaching it."],
       [14, "That is one hop short of the landing. Count all six."]],
      { success: "Six hops on from 9 lands on 15." }),
    predict: P("9 + 6: how much of the 6 is used to reach ten?",
      [{ id: "a", label: "1 — then 5 are left" }, { id: "b", label: "6 — all of it" }, { id: "c", label: "None" }], "a",
      "9 needs only 1 to reach ten, so 5 remain: 15.") },
  addFact(9, 6, "FlSums16Numeric"), addFact(8, 6, "FlSums16Numeric"),
  addFact(7, 7, "FlSums16Numeric"), addFact(9, 5, "FlSums16Numeric"),
  { body: "Another crossing.", widget: () => hop("Start at 8 and hop forward 6.", { min: 0, max: 20, start: 8, hops: 6, direction: "forward" }, [], { success: "Six hops on from 8 lands on 14." }) },
  ["Big addends still make ten first.", "The leftover part names the ones.", "9 + 6 = 15."],
  "next: all the way to 20.")
def(7, 2,
  "The largest facts within 20 come from the largest addends: 9 + 9, 8 + 9, 10 + 10.",
  "These are the last addition facts to become automatic, and doubles carry most of them.",
  { body: "The biggest double.", rep: "diagram",
    widget: () => hop("Start at 9 and hop forward 9.", { min: 0, max: 20, start: 9, hops: 9, direction: "forward" },
      [[19, "That is one hop past the landing — count the nine hops again."],
       [17, "That is one hop short. Nine hops on from 9 lands on 18."]],
      { success: "Nine hops on from 9 lands on 18 — double 9." }),
    predict: P("9 + 9: which known fact helps most?",
      [{ id: "a", label: "Double 9" }, { id: "b", label: "10 + 10" }, { id: "c", label: "Counting from one" }], "a",
      "9 + 9 IS a double, so it is recalled directly rather than built.") },
  addFact(9, 9, "FlSums20Numeric"), addFact(9, 8, "FlSums20Numeric"),
  addFact(10, 9, "FlSums20Numeric"), addFact(10, 8, "FlSums20Numeric"),
  { body: "A full twenty.", widget: () => hop("Start at 10 and hop forward 10.", { min: 0, max: 20, start: 10, hops: 10, direction: "forward" }, [], { success: "Ten hops on from 10 lands on 20." }) },
  ["The largest facts are mostly doubles.", "Doubles carry the top of the table.", "9 + 9 = 18."],
  "next: taking numbers back out of ten.")
def(8, 2,
  "Ten splits into two parts. Knowing every pair that makes ten makes every subtraction from ten instant.",
  "10 − 4 = 6, because 4 and 6 are ten's two parts.",
  { body: "Hop back to the part.", rep: "diagram",
    widget: () => hop("Start at 10 and hop back 4.", { min: 0, max: 20, start: 10, hops: 4, direction: "back" },
      [[4, "That names the number taken away, not what is left after taking it."],
       [7, "That is one hop short of the landing. Count all four hops back."]],
      { success: "Four hops back from 10 lands on 6 — ten's other part." }),
    predict: P("10 − 4: what does the answer tell you?",
      [{ id: "a", label: "Ten's other part" }, { id: "b", label: "The number taken away" }, { id: "c", label: "Ten again" }], "a",
      "Ten splits into 4 and 6, so removing 4 leaves the other part: 6.") },
  fromTen(4), fromTen(7), fromTen(3), fromTen(6),
  { body: "Another split.", widget: () => hop("Start at 10 and hop back 8.", { min: 0, max: 20, start: 10, hops: 8, direction: "back" }, [], { success: "Eight hops back from 10 lands on 2." }) },
  ["Ten has two parts.", "Knowing the pairs makes subtraction instant.", "10 − 4 = 6."],
  "next: subtracting down past ten.")
def(9, 3,
  "To subtract across ten, stop at ten on the way down. 15 − 7: take 5 to reach ten, then 2 more.",
  "Both steps stay inside facts already known, so nothing has to be counted one at a time.",
  { body: "Step down to ten.", rep: "diagram",
    widget: () => hop("Start at 15 and hop back 5 to reach ten.", { min: 0, max: 20, start: 15, hops: 5, direction: "back" },
      [[9, "That is one hop too far. Five hops back from 15 lands exactly on ten."],
       [11, "That is one hop short of ten. Count all five hops back."]],
      { success: "Five hops back from 15 lands on ten — the halfway stop." }),
    predict: P("15 − 7: after stepping down to ten, how much is still to take?",
      [{ id: "a", label: "2 — the rest of the 7" }, { id: "b", label: "7 — all of it again" }, { id: "c", label: "5" }], "a",
      "5 of the 7 gets you to ten; 2 remain, so the answer is 8.") },
  acrossTen(15, 7), acrossTen(13, 5), acrossTen(16, 8), acrossTen(14, 6),
  { body: "Finish the second step.", widget: () => hop("Start at 10 and hop back 2.", { min: 0, max: 20, start: 10, hops: 2, direction: "back" }, [], { success: "Two hops back from 10 lands on 8 — the answer to 15 − 7." }) },
  ["Stop at ten on the way down.", "Two easy steps beat one hard one.", "15 − 7 = 8."],
  "next: subtraction as addition in reverse.")
def(10, 3,
  "Every subtraction is an addition fact read backwards. 13 − 5 asks: 5 and what make 13?",
  "This turns unknown subtraction facts into addition facts already owned.",
  { body: "Find the missing part.", rep: "diagram",
    widget: () => hop("Start at 5 and hop forward until you reach 13.", { min: 0, max: 20, start: 5, hops: 8, direction: "forward" },
      [[13 - 5 - 1, "That lands short of 13. Keep hopping until you arrive exactly."],
       [5, "That stays at the starting point. Hop forward until 13 is reached."]],
      { success: "Eight hops on from 5 reaches 13, so 13 − 5 = 8." }),
    predict: P("13 − 5: which question finds it fastest?",
      [{ id: "a", label: "5 and what make 13?" }, { id: "b", label: "13 and what make 5?" }, { id: "c", label: "5 + 13?" }], "a",
      "Subtraction asks for the missing part: 5 + 8 = 13, so 13 − 5 = 8.") },
  thinkAddition(5, 8), thinkAddition(6, 7), thinkAddition(4, 9), thinkAddition(7, 6),
  { body: "One more reverse.", widget: () => hop("Start at 6 and hop forward until you reach 14.", { min: 0, max: 20, start: 6, hops: 8, direction: "forward" }, [], { success: "Eight hops on from 6 reaches 14, so 14 − 6 = 8." }) },
  ["Subtraction is addition backwards.", "Ask what joins the part to the total.", "13 − 5 = 8."],
  "next: the whole family at once.")
def(11, 3,
  "Two parts and a total make a fact family: 6, 8 and 14 give 6+8, 8+6, 14−6 and 14−8.",
  "One family is four facts. Learning the family is four times cheaper than learning each fact alone.",
  { body: "Build the family.", rep: "diagram",
    widget: () => hop("Start at 6 and hop forward 8 to find the family's total.", { min: 0, max: 20, start: 6, hops: 8, direction: "forward" },
      [[8, "That names the second part rather than the total the two parts make."]],
      { success: "6 and 8 make 14 — the family is 6, 8, 14." }),
    predict: P("The parts are 6 and 8. How many facts does this family hold?",
      [{ id: "a", label: "4 — two additions and two subtractions" }, { id: "b", label: "1" }, { id: "c", label: "2" }], "a",
      "6+8, 8+6, 14−6 and 14−8 all come from the same three numbers.") },
  factFamilyPack(6, 8), factFamilyPack(5, 9), factFamilyPack(7, 8), factFamilyPack(4, 8),
  { body: "A second family.", widget: () => hop("Start at 5 and hop forward 9 to find that family's total.", { min: 0, max: 20, start: 5, hops: 9, direction: "forward" }, [], { success: "5 and 9 make 14 — the family is 5, 9, 14." }) },
  ["Two parts and a total make a family.", "One family holds four facts.", "6, 8, 14."],
  "next: finding the part that is missing.")
def(12, 3,
  "When one part is hidden, the family still decides it: the total minus the known part gives the rest.",
  "7 + ? = 15 is the same question as 15 − 7.",
  { body: "Hop to close the gap.", rep: "diagram",
    widget: () => hop("Start at 7 and hop forward until you reach 15.", { min: 0, max: 20, start: 7, hops: 8, direction: "forward" },
      [[7, "That stays at the known part. Hop forward until 15 is reached."],
       [14, "That lands one short of 15. One more hop is needed."]],
      { success: "Eight hops on from 7 reaches 15, so the missing part is 8." }),
    predict: P("7 + ? = 15. What finds the missing part?",
      [{ id: "a", label: "15 − 7" }, { id: "b", label: "15 + 7" }, { id: "c", label: "7 + 7" }], "a",
      "The total minus the known part leaves the missing one: 15 − 7 = 8.") },
  missingPack(7, 8), missingPack(6, 9), missingPack(8, 5), missingPack(9, 7),
  { body: "Close another gap.", widget: () => hop("Start at 9 and hop forward until you reach 16.", { min: 0, max: 20, start: 9, hops: 7, direction: "forward" }, [], { success: "Seven hops on from 9 reaches 16, so the missing part is 7." }) },
  ["A missing part is a subtraction.", "The total decides what fits.", "7 + 8 = 15."],
  "next: addition without pausing to think.")
def(13, 3,
  "Fluency means the fact arrives without a strategy running first. The strategies were the scaffolding; recall is the goal.",
  "Mixed facts, out of order, with no pattern to lean on — just the facts themselves.",
  { body: "Warm up the recall.", rep: "diagram",
    widget: () => hop("Start at 8 and hop forward 7.", { min: 0, max: 20, start: 8, hops: 7, direction: "forward" },
      [[14, "That is one hop short. Count all seven hops from 8."]],
      { success: "Seven hops on from 8 lands on 15." }),
    predict: P("What does fluent mean for these facts?",
      [{ id: "a", label: "The answer arrives without working it out" }, { id: "b", label: "Counting very fast" }, { id: "c", label: "Guessing" }], "a",
      "Strategies build the facts; fluency is when the fact itself is remembered.") },
  speedAdd(8, 7), speedAdd(6, 5), speedAdd(9, 4), speedAdd(7, 9),
  { body: "One more warm-up.", widget: () => hop("Start at 6 and hop forward 9.", { min: 0, max: 20, start: 6, hops: 9, direction: "forward" }, [], { success: "Nine hops on from 6 lands on 15." }) },
  ["Fluency is recall, not fast counting.", "Strategies were the scaffolding.", "8 + 7 = 15."],
  "next: the same speed, subtracting.")
def(14, 3,
  "Subtraction facts become automatic the same way, through the addition partners that define them.",
  "Every one of these has been met as part of a family. Now they come back on their own.",
  { body: "Warm up backwards.", rep: "diagram",
    widget: () => hop("Start at 15 and hop back 8.", { min: 0, max: 20, start: 15, hops: 8, direction: "back" },
      [[8, "That names the number taken away rather than what remains."]],
      { success: "Eight hops back from 15 lands on 7." }),
    predict: P("15 − 8 comes back fastest through which partner fact?",
      [{ id: "a", label: "8 + 7 = 15" }, { id: "b", label: "15 + 8" }, { id: "c", label: "8 + 8" }], "a",
      "The addition partner names the answer directly: 8 + 7 = 15, so 15 − 8 = 7.") },
  speedSub(15, 8), speedSub(13, 6), speedSub(17, 9), speedSub(12, 5),
  { body: "A last warm-up.", widget: () => hop("Start at 13 and hop back 6.", { min: 0, max: 20, start: 13, hops: 6, direction: "back" }, [], { success: "Six hops back from 13 lands on 7." }) },
  ["Subtraction facts follow their partners.", "Families make both directions automatic.", "15 − 8 = 7."],
  "next course: place value through 1,000.")

/* ------------------------------------------------------------------------- assembly */

must(L.length === 14, "14 lessons defined");
const chapterTitles = ["Doubles and Ten", "Sums Within 20", "Subtraction and Fluency"];
const perChapter = [4, 4, 6];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = chapters.map(() => 0);
const outDir = join(root, "content/courses/fluency-20-g2");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  const seq = chCount[d.ch - 1] + 1; chCount[d.ch - 1]++;
  const id = `f20-0${d.ch}-0${seq}`;
  chapters[d.ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const check = (sid, pack, kind = "check") => ({
    id: sid, kind, body: pack.body, conceptTag: tag,
    explanationVariants: pack.ev, widget: pack.widget, hints: pack.hints,
    variant: pack.variant, cml: cml(tag, "diagram"),
  });
  const i1w = d.i1.widget();
  const i2w = d.i2.widget();
  const lesson = {
    id, slug, title: row.title, courseId: "fluency-20-g2",
    chapterId: chapters[d.ch - 1].id, minutes: 6, readingProfile: "early",
    steps: [
      { id: "c1", kind: "concept", figure: "number-track", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: d.i1.body, conceptTag: tag, widget: i1w, predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      check("k1", d.k1),
      { id: "c2", kind: "concept", figure: "number-track", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: d.i2.body, conceptTag: tag, widget: i2w, cml: cml(tag, "diagram") },
      check("k2", d.k2),
      check("k3", d.k3),
      check("ch1", d.ch1, "challenge"),
      { id: "r1", kind: "recap", body: "You did it!", takeaways: d.recap, teaser: d.teaser },
    ],
    remedials: [{
      conceptTag: tag,
      concept: { id: `rem-${tag}-c`, kind: "concept", body: d.c2, narration: d.c2 },
      check: {
        id: `rem-${tag}-k`, kind: "check", body: "", conceptTag: tag,
        explanationVariants: d.k1.ev,
        widget: d.k1.widget.type === "numeric"
          ? { ...d.k1.widget, commonErrors: d.k1.widget.commonErrors.slice(0, 2) }
          : d.k1.widget,
      },
    }],
  };

  let factTagged = 0;
  for (const s of lesson.steps) {
    const w = s.widget;
    if (w) {
      if (w.type === "numeric") for (const e of w.commonErrors) must(e.value !== w.answer, `${id}/${s.id} numeric trap`);
      if (w.type === "mcq") must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq`);
      if (w.type === "tenFrame") must(w.preFilled < w.target, `${id}/${s.id} tenFrame prefill`);
      if (w.type === "numberLineHop") {
        const landing = w.direction === "back" ? w.start - w.hop * w.hops : w.start + w.hop * w.hops;
        must(landing >= w.min && landing <= w.max, `${id}/${s.id} hop landing`);
      }
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) {
      must(s.variant.gen === F, `${id}/${s.id} variant gen ${s.variant.gen}`);
      if (s.variant.factFamily) {
        must(/^\d+\+\d+$/.test(s.variant.factFamily), `${id}/${s.id} factFamily not ADDITIVE: ${s.variant.factFamily}`);
        const [lo, hi] = s.variant.factFamily.split("+").map(Number);
        must(lo <= hi, `${id}/${s.id} factFamily not canonical ${s.variant.factFamily}`);
        must(lo + hi <= 20, `${id}/${s.id} factFamily sum past 20: ${s.variant.factFamily}`);
        factTagged++;
      }
    }
  }
  must(factTagged >= 1, `${id}: no step carries a factFamily — the additive architecture would be unexercised`);
  const rw = lesson.remedials[0].check.widget;
  must(rw.type === "numeric" || rw.type === "mcq", `${id} remedial widget ${rw.type}`);
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "fluency-20-g2", slug: "fluency-20-g2", title: spec.title,
  tagline: "Doubles, ten, and fact families — until every sum and difference within 20 comes back on its own.",
  category: "Math", gradeLevel: 2, chapters,
}, null, 2) + "\n");
console.log(`built 14 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
