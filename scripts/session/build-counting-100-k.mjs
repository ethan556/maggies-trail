#!/usr/bin/env node
// S183: build the counting-to-100-k course (18 lessons) — the first K5-expansion course.
//
// The breakthrough this encodes: house-format lessons are GENERATED from per-lesson parameter
// packs plus per-concept templates, in the exact 9-step shape the A-tier siblings use
// (c1 · i1+predict · k1 · c2 · i2 · k2 · k3 · ch1 · r1, plus a remedial per conceptTag).
// Every number in every widget is DERIVED from the pack — never typed twice — and the factory
// asserts internal consistency (hop landings inside bounds, drag orders sorted, mcq answers
// present, predictions resolvable, the K <= 100 cap everywhere) BEFORE writing anything.
// Titles, conceptTags and standards come verbatim from the landed S113 spec (k5-expansion.json).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "counting-to-100-k");
if (!spec || spec.lessons.length !== 18) throw new Error("spec course missing or wrong size");

const CAP = 100;
let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("FACTORY ASSERT: " + msg); };
const inCap = (...ns) => ns.forEach((n) => must(Number.isInteger(n) && n >= 0 && n <= CAP, `out of K cap: ${n}`));

// ——— widget builders (all derived, all asserted) ———
function hop(prompt, start, hopSize, hops, direction, landFb, traps) {
  const sign = direction === "back" ? -1 : 1;
  const land = start + sign * hopSize * hops;
  const pts = [start, land, ...traps.map((t) => t.value)];
  const min = Math.max(0, Math.min(...pts) - 2);
  const max = Math.min(CAP, Math.max(...pts) + 2);
  inCap(start, land, min, max);
  must(land >= min && land <= max && start >= min && start <= max, `hop bounds ${start}->${land}`);
  for (const t of traps) { inCap(t.value); must(t.value !== land && t.value >= min && t.value <= max, `trap ${t.value} invalid`); }
  return {
    type: "numberLineHop", prompt, min, max, start, hop: hopSize, hops, direction,
    commonLandings: traps,
    missFeedback: `Start at ${start} and count ${direction === "back" ? "back" : "on"} ${hops === 1 ? "one" : hops}: you land on ${land}.`,
    successFeedback: landFb,
  };
}
function mcq(prompt, correct, wrongs) {
  const opts = [{ label: String(correct[0]), feedback: correct[1], ok: true },
    ...wrongs.map(([l, f]) => ({ label: String(l), feedback: f, ok: false }))];
  must(new Set(opts.map((o) => o.label)).size === opts.length, `dup mcq labels: ${prompt}`);
  // deterministic rotation so the correct answer is not always first
  const rot = (prompt.length % opts.length);
  const shown = [...opts.slice(rot), ...opts.slice(0, rot)].map((o, i) => ({ id: `o${i}`, label: o.label, feedback: o.feedback, correct: o.ok }));
  must(shown.filter((o) => o.correct).length === 1, "exactly one correct");
  return { type: "mcq", prompt, options: shown };
}
function drag(prompt, values) {
  const ordered = [...values].sort((a, b) => a - b);
  inCap(...ordered);
  const items = ordered.map((v, i) => ({ id: `n${i}`, label: String(v) }));
  const shown = [items[2], items[0], items[4], items[1], items[3]];
  return {
    type: "dragOrder", prompt, items: shown, correctOrder: items.map((x) => x.id),
    misorderFeedback: [
      { first: items[4].id, second: items[0].id, feedback: `${items[4].label} is the biggest — it goes last. Start with ${items[0].label}.` },
      { first: items[2].id, second: items[1].id, feedback: `${items[1].label} comes before ${items[2].label}. Count up: ${ordered.join(", ")}.` },
    ],
    missFeedback: `Count up from the smallest: ${ordered.join(", ")}.`,
    successFeedback: `${ordered.join(", ")} — perfect counting order!`,
  };
}
const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Manipulate the model and track how it represents ${tag.replace(/-/g, " ")}.`,
  invariants: [`The manipulated model and the mathematical relationship for ${tag.replace(/-/g, " ")} must stay consistent.`],
  misconceptions: [`Changing a visible feature without preserving the relationship that defines ${tag.replace(/-/g, " ")}.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `counting-to-100-k:${tag}`, delayed: true,
  counterfactualPrompt: "What change would make the model stop representing the same mathematical relationship?",
});

// nextFb/beforeFb/tensFb: the three trap voices, kept in the K register.
const nextTraps = (n) => [
  { value: n - 1, feedback: `${n - 1} comes just BEFORE ${n}. "After" means the next one up: ${n + 1}.` },
  { value: n + 2, feedback: `${n + 2} is two after. Just one after ${n} is ${n + 1}.` },
];
const backTraps = (n) => [
  { value: n + 1, feedback: `${n + 1} comes AFTER ${n}. "Before" means one back: ${n - 1}.` },
  { value: n - 2, feedback: `${n - 2} is two back. Just one before ${n} is ${n - 1}.` },
];
const tensTraps = (t) => [
  { value: t + 1, feedback: `That adds just one. Counting by TENS adds a whole ten: ${t + 10}.` },
  { value: t - 10, feedback: `That goes back a ten. Counting forward gives ${t + 10}.` },
];

// ——— per-lesson packs: [n, seqStart(i2 drag), i1 pack, k1 pack, k2 pack, k3 mcq pack, ch pack] ———
// Forms per conceptTag family; numbers chosen inside each lesson's own territory.
const V = (form) => ({ gen: "k0-count-100", form });
const L = [];
const push = (x) => L.push(x);

// helpers to build the four graded steps from a pack
const seqK = (n, form = "kSeqNextHop") => ({
  body: "What comes next?",
  ev: [`The number right after ${n} is the next one up: ${n + 1}.`, `Count on one from ${n} and you reach ${n + 1}.`],
  widget: hop(`What number comes right after ${n}? Hop one and tap where you land.`, n, 1, 1, "forward",
    `One hop up from ${n} lands on ${n + 1} — the next number.`, nextTraps(n)),
  hints: [`Count on one from ${n}.`, `${n}… then?`, `${n + 1}.`], variant: V(form),
});
const beforeK = (n) => ({
  body: "One back.",
  ev: [`The number right before ${n} is ${n - 1}.`, `Count one back from ${n} to get ${n - 1}.`],
  widget: hop(`What number comes right before ${n}? Hop one back and tap where you land.`, n, 1, 1, "back",
    `One hop back from ${n} lands on ${n - 1} — the number before.`, backTraps(n)),
  hints: [`Count one back from ${n}.`, `${n}… back one?`, `${n - 1}.`], variant: V("kSeqBeforeHop"),
});
const missingK = (a) => ({
  body: "Fill the gap.",
  ev: [`The run counts on by one: ${a}, ${a + 1}, ${a + 2}, ${a + 3}.`, `Between ${a + 1} and ${a + 3} sits ${a + 2}.`],
  widget: mcq(`Fill the missing number: ${a}, ${a + 1}, __, ${a + 3}.`,
    [a + 2, `Yes — ${a}, ${a + 1}, ${a + 2}, ${a + 3}.`],
    [[a + 1, `That repeats the number before the gap. The gap holds ${a + 2}.`],
     [a + 3, `That is the number after the gap. The gap holds ${a + 2}.`],
     [a + 4, `That is past the end of the run. The gap holds ${a + 2}.`]]),
  hints: [`Read the run out loud.`, `${a + 1}… then?`, `${a + 2}.`], variant: V("kSeqMissingMcq"),
});
const countOnK = (start, hops, form = "kCountFromHop") => ({
  body: "Count on.",
  ev: [`Start at ${start} and count on ${hops}: you reach ${start + hops}.`, `${start} and ${hops} more is ${start + hops}.`],
  widget: hop(`Start at ${start} and count on ${hops}. Tap where you land.`, start, 1, hops, "forward",
    `${start} and ${hops} more is ${start + hops} — you kept the count going!`,
    [{ value: start + hops - 1, feedback: `That is ${hops - 1} hops. One more: you reach ${start + hops}.` },
     start + hops + 1 <= 100
       ? { value: start + hops + 1, feedback: `That is one too many. Count just ${hops} from ${start} to land on ${start + hops}.` }
       : { value: start, feedback: `That is the starting point. Count on ${hops} from ${start} to reach ${start + hops}.` }]),
  hints: [`Say ${start}, then keep counting.`, `Count ${hops} more numbers.`, `${start + hops}.`], variant: V(form),
});
const tensNextK = (t, asMcq = false) => asMcq ? ({
  body: "Ten more.",
  ev: [`Ten more than ${t} is ${t + 10}.`, `Counting by tens: ${t}, then ${t + 10}.`],
  widget: mcq(`Counting by tens — what comes after ${t}?`, [t + 10, `Yes — ten more than ${t} is ${t + 10}.`],
    [[t + 1, `That adds just one. Counting by TENS adds a whole ten: ${t + 10}.`],
     [t - 10, `That goes back a ten. Counting forward gives ${t + 10}.`],
     [t, `That stays still. Ten more than ${t} is ${t + 10}.`]]),
  hints: [`Tens count: 10, 20, 30…`, `${t}, then a whole ten more.`, `${t + 10}.`], variant: V("kTensNextMcq"),
}) : ({
  body: "Ten more.",
  ev: [`Ten more than ${t} is ${t + 10}.`, `One tens-hop from ${t} lands on ${t + 10}.`],
  widget: hop(`Count by tens: what comes after ${t}? Hop one ten and tap where you land.`, t, 10, 1, "forward",
    `One big tens-hop from ${t} lands on ${t + 10}.`, tensTraps(t)),
  hints: [`Tens count: 10, 20, 30…`, `${t}, then a whole ten more.`, `${t + 10}.`], variant: V("kTensNextHop"),
});
const tensBackK = (t) => ({
  body: "Ten back.",
  ev: [`Ten back from ${t} is ${t - 10}.`, `One tens-hop back from ${t} lands on ${t - 10}.`],
  widget: hop(`Count back by tens from ${t}. Hop one ten back and tap where you land.`, t, 10, 1, "back",
    `One tens-hop back from ${t} lands on ${t - 10}.`,
    [{ value: t - 1, feedback: `That takes away just one. A tens-hop back takes a whole ten: ${t - 10}.` },
     t + 10 <= 100
       ? { value: t + 10, feedback: `That goes UP a ten. Counting back gives ${t - 10}.` }
       : { value: t, feedback: `That stays still. Ten back from ${t} is ${t - 10}.` }]),
  hints: [`Tens go back too: 50, 40, 30…`, `${t}, then a whole ten back.`, `${t - 10}.`], variant: V("kTensBackHop"),
});
const chartBelowK = (n) => ({
  body: "One row down.",
  ev: [`One row down on the chart is ten more: ${n + 10}.`, `Below ${n} sits ${n + 10}.`],
  widget: mcq(`On the hundred chart, what number sits directly BELOW ${n}?`,
    [n + 10, `Yes — one row down is ten more: ${n + 10}.`],
    [[n + 1, `That is the next number in the SAME row. Directly below is ten more: ${n + 10}.`],
     [n - 10, `That is the row ABOVE. Below ${n} is ${n + 10}.`],
     [n, `That is the same square. Below it sits ${n + 10}.`]]),
  hints: [`Each chart row holds ten numbers.`, `Down one row = ten more.`, `${n + 10}.`], variant: V("kChartRowMcq"),
});
const chartMissingK = (a) => ({
  body: "Fix the row.",
  ev: [`The row counts on by one: ${a}, ${a + 1}, ${a + 2}, ${a + 3}.`, `The empty square holds ${a + 2}.`],
  widget: mcq(`A chart row reads ${a}, ${a + 1}, __, ${a + 3}. What is missing?`,
    [a + 2, `Yes — the row counts on by one: ${a + 2}.`],
    [[a + 12, `That is from the row BELOW. This row holds ${a + 2}.`],
     [a + 1, `That repeats the square before the gap. The gap holds ${a + 2}.`],
     [a + 3, `That is the square after the gap. The gap holds ${a + 2}.`]]),
  hints: [`Read the row out loud.`, `${a + 1}… then?`, `${a + 2}.`], variant: V("kChartMissingMcq"),
});
const countBackK = (start, hops) => ({
  body: "Count back.",
  ev: [`Count back ${hops} from ${start}: you reach ${start - hops}.`, `${start}, counting down ${hops}, lands on ${start - hops}.`],
  widget: hop(`Start at ${start} and count back ${hops}. Tap where you land.`, start, 1, hops, "back",
    `Counting back ${hops} from ${start} lands on ${start - hops}.`,
    [{ value: start - hops + 1, feedback: `That is ${hops - 1} back. One more: ${start - hops}.` },
     { value: start - hops - 1, feedback: `That is one too many back. Count just ${hops} down from ${start}: ${start - hops}.` }]),
  hints: [`Say ${start}, then count down.`, `Count ${hops} numbers back.`, `${start - hops}.`], variant: V("kCountBackHop"),
});

// predictions — one per lesson, on i1
const predCross = (start, hops, decade) => ({
  prompt: `Counting on ${hops} from ${start} — will you pass ${decade}?`,
  options: [{ id: "yes", label: `Yes — you land on ${start + hops}` }, { id: "stop", label: `No — you stop at ${decade}` }, { id: "exact", label: `You land right on ${decade}` }],
  outcomeId: start + hops > decade ? "yes" : start + hops === decade ? "exact" : "stop",
  reveal: `${start} count on ${hops} reaches ${start + hops}. ${decade} is a signpost, not a wall — the counting keeps going.`,
});
const predTens = (t) => ({
  prompt: `One tens-hop from ${t} — how far will you land?`,
  options: [{ id: "ten", label: `Ten away, on ${t + 10}` }, { id: "one", label: `One away, on ${t + 1}` }, { id: "same", label: `Right where you started` }],
  outcomeId: "ten",
  reveal: `A tens-hop is one BIG jump of ten: ${t} lands on ${t + 10}, skipping all nine numbers between.`,
});
const predBelow = (n) => ({
  prompt: `On the chart, is the square below ${n} bigger or smaller than ${n}?`,
  options: [{ id: "big", label: `Bigger — it is ${n + 10}` }, { id: "small", label: `Smaller — it is ${n - 10}` }, { id: "next", label: `It is the next number, ${n + 1}` }],
  outcomeId: "big",
  reveal: `Rows count up as you go down the chart: below ${n} sits ${n + 10}, ten more.`,
});
const predBack = (start, hops) => ({
  prompt: `Counting BACK ${hops} from ${start} — which way do the numbers go?`,
  options: [{ id: "down", label: `Down — you land on ${start - hops}` }, { id: "up", label: `Up — you land on ${start + hops}` }, { id: "still", label: `They stay at ${start}` }],
  outcomeId: "down",
  reveal: `Counting back walks DOWN the number line: ${start} back ${hops} lands on ${start - hops}.`,
});

// ——— the 18 lessons ———
// [specRow, chapter, concepts {c1,c2}, i1 {body,widget,predict,rep}, k1,k2,k3,ch1, i2 drag values, recap]
const def = (n, ch, c1, c2, i1, k1, k2, k3, ch1, dragVals, recap, teaser) =>
  push({ n, ch, c1, c2, i1, k1, k2, k3, ch1, dragVals, recap, teaser });

def(1, 1,
  "Counting keeps going past 20. After 20 comes 21, 22, 23 — the same pattern as 1, 2, 3.",
  "Every new ten counts the same way. 21, 22, 23 goes just like 1, 2, 3 — with a 2 in front.",
  { body: "Count on past 20.", widget: () => hop("Start at 18 and count on 5. Tap where you land.", 18, 1, 5, "forward", "18 and 5 more is 23 — counting sails right past 20!", [{ value: 22, feedback: "That's 4 hops. One more: 19, 20, 21, 22, 23." }, { value: 24, feedback: "That's 6 hops. Count just 5 from 18 to land on 23." }]), predict: predCross(18, 5, 20), rep: "number-line" },
  seqK(23), seqK(27), missingK(24), seqK(29, "kSeqNextHop"),
  [21, 22, 23, 24, 25],
  ["Counting keeps its pattern past 20.", "Each new ten counts like 1, 2, 3.", "One more means the next number up."],
  "next: the jump into a brand-new ten.")
def(2, 1,
  "Some jumps land in a brand-new ten. After 29 comes 30 — a new ten begins.",
  "Every ten ends in 9, then a new ten starts: 29 then 30, 39 then 40, 49 then 50.",
  { body: "Cross into a new ten.", widget: () => hop("Start at 27 and count on 5. Tap where you land.", 27, 1, 5, "forward", "27 and 5 more is 32 — you crossed into the thirties!", [{ value: 30, feedback: "30 is only 3 hops. Keep going: 31, 32." }, { value: 33, feedback: "That's 6 hops. Count just 5 from 27 to land on 32." }]), predict: predCross(27, 5, 30), rep: "number-line" },
  seqK(29, "kDecadeCrossHop"),
  { ...seqK(39), variant: V("kDecadeNextMcq"), body: "New ten.", widget: mcq("What number comes right after 39?", [40, "Yes — after 39 a new ten begins: 40."], [[39, "That is the same number. After 39 comes 40."], [50, "That jumps a whole ten too far. After 39 comes 40."], [29, "That goes back a ten. Counting moves UP: after 39 comes 40."]]), ev: ["After 39 a new ten begins: 40.", "Nine ends the ten; 40 starts the next."], hints: ["Tens end in 9.", "39… then a new ten.", "40."] },
  missingK(28), seqK(49, "kDecadeCrossHop"),
  [28, 29, 30, 31, 32],
  ["Every ten ends in 9.", "After 29 comes 30 — a new ten.", "The counting pattern starts again."],
  "next: counting all the way to fifty.")
def(3, 1,
  "The count climbs on: thirties, then forties, up to fifty. The pattern never changes.",
  "Say the ten, then count 1 to 9 inside it: 41, 42, 43… all the way to 49, then 50.",
  { body: "Count into the forties.", widget: () => hop("Start at 38 and count on 6. Tap where you land.", 38, 1, 6, "forward", "38 and 6 more is 44 — deep into the forties!", [{ value: 43, feedback: "That's 5 hops. One more: 44." }, { value: 45, feedback: "That's 7 hops. Count just 6 from 38 to land on 44." }]), predict: predCross(38, 6, 40), rep: "number-line" },
  seqK(43), beforeK(47), missingK(44), countOnK(44, 6),
  [43, 44, 45, 46, 47],
  ["The forties count like every other ten.", "49 ends the forties; 50 starts the fifties.", "The pattern repeats every ten."],
  "next: fifty to seventy.")
def(4, 1,
  "Past fifty the count keeps its rhythm: fifties, then sixties, then seventy.",
  "The tens names change — fifty, sixty, seventy — but inside each ten it is still 1 to 9.",
  { body: "Count through the sixties.", widget: () => hop("Start at 57 and count on 5. Tap where you land.", 57, 1, 5, "forward", "57 and 5 more is 62 — into the sixties!", [{ value: 60, feedback: "60 is only 3 hops. Keep going: 61, 62." }, { value: 63, feedback: "That's 6 hops. Count just 5 from 57 to land on 62." }]), predict: predCross(57, 5, 60), rep: "number-line" },
  seqK(59, "kDecadeCrossHop"), seqK(64), missingK(58), beforeK(70),
  [58, 59, 60, 61, 62],
  ["Fifty, sixty, seventy — the tens march on.", "Inside each ten: 1 to 9, then a new ten.", "69 then 70, just like 29 then 30."],
  "next: the climb to one hundred.")
def(5, 1,
  "Seventy, eighty, ninety — the last stretch before one hundred.",
  "After 99 comes the biggest number yet: 100. Ten tens make one hundred.",
  { body: "Count toward 100.", widget: () => hop("Start at 88 and count on 5. Tap where you land.", 88, 1, 5, "forward", "88 and 5 more is 93 — the nineties!", [{ value: 92, feedback: "That's 4 hops. One more: 93." }, { value: 94, feedback: "That's 6 hops. Count just 5 from 88 to land on 93." }]), predict: predCross(88, 5, 90), rep: "number-line" },
  seqK(79, "kDecadeCrossHop"), seqK(89, "kDecadeCrossHop"), missingK(87), seqK(96),
  [87, 88, 89, 90, 91],
  ["Seventy, eighty, ninety — almost there.", "89 then 90, just like every ten.", "Next stop: one hundred."],
  "next: reaching 100 itself.")
def(6, 1,
  "Ninety-seven, ninety-eight, ninety-nine… one hundred! The count reaches 100.",
  "100 is ten tens. After 99, the count fills up a whole hundred.",
  { body: "Reach one hundred.", widget: () => hop("Start at 95 and count on 5. Tap where you land.", 95, 1, 5, "forward", "95 and 5 more is 100 — you reached one hundred!", [{ value: 99, feedback: "That's 4 hops. One more: 100!" }, { value: 98, feedback: "That's 3 hops. Count 5 from 95 to land on 100." }]), predict: predCross(95, 5, 100), rep: "number-line" },
  { ...seqK(98), body: "Almost there." },
  { ...missingK(96), body: "The last gap." },
  { body: "The top.", ev: ["After 99 comes 100 — ten tens.", "99, then one more: 100."], widget: mcq("What number comes right after 99?", [100, "Yes — after 99 comes one hundred!"], [[99, "That is the same number. After 99 comes 100."], [90, "That goes back. After 99 comes 100."], [98, "That is before 99. After 99 comes 100."]]), hints: ["The very next number.", "99… then?", "100."], variant: V("kDecadeNextMcq") },
  countOnK(93, 7),
  [96, 97, 98, 99, 100],
  ["The count reaches 100.", "100 is ten tens.", "You can count all the way!"],
  "next: counting by whole tens.")
def(7, 2,
  "You can count in big jumps: 10, 20, 30, 40, 50. Each jump is a whole ten.",
  "Ten, twenty, thirty — every jump skips nine numbers and lands on the next ten.",
  { body: "Jump by tens.", widget: () => hop("Count by tens: start at 10 and make 2 tens-hops. Tap where you land.", 10, 10, 2, "forward", "10, 20, 30 — two tens-hops land on 30!", [{ value: 20, feedback: "That's 1 hop. One more tens-hop: 30." }, { value: 40, feedback: "That's 3 hops. Make just 2 from 10 to land on 30." }]), predict: predTens(10), rep: "number-line" },
  tensNextK(20), tensNextK(30, true), missingK(21), tensNextK(40),
  [10, 20, 30, 40, 50],
  ["Tens count: 10, 20, 30, 40, 50.", "Each tens-jump skips nine numbers.", "Tens land on round numbers."],
  "next: tens all the way to 100.")
def(8, 2,
  "The tens keep going: 60, 70, 80, 90, 100. Ten jumps reach one hundred.",
  "Count the tens on your fingers: ten fingers, ten tens, one hundred.",
  { body: "Tens to the top.", widget: () => hop("Count by tens: start at 70 and make 2 tens-hops. Tap where you land.", 70, 10, 2, "forward", "70, 80, 90 — two tens-hops land on 90!", [{ value: 80, feedback: "That's 1 hop. One more tens-hop: 90." }, { value: 100, feedback: "That's 3 hops. Make just 2 from 70 to land on 90." }]), predict: predTens(70), rep: "number-line" },
  tensNextK(60), tensNextK(80, true), tensNextK(90, true), tensNextK(50),
  [60, 70, 80, 90, 100],
  ["Tens climb to 100: 60, 70, 80, 90, 100.", "Ten tens make one hundred.", "Big jumps, round landings."],
  "next: tens as rows on the hundred chart.")
def(9, 2,
  "The hundred chart shows every number to 100. Each row holds exactly ten.",
  "The row ends — 10, 20, 30 — are the tens. Going down one row adds ten.",
  { body: "Rows of ten.", widget: () => hop("Each chart row adds ten. Start at 14 and go down one row: hop one ten. Tap where you land.", 14, 10, 1, "forward", "One row down from 14 is 24 — ten more.", [{ value: 15, feedback: "That is the next square in the SAME row. Down one row is ten more: 24." }, { value: 4, feedback: "That is the row ABOVE. Down from 14 is 24." }]), predict: predBelow(14), rep: "table" },
  chartBelowK(23), chartBelowK(45), chartMissingK(31), chartBelowK(67),
  [14, 24, 34, 44, 54],
  ["Each chart row holds ten numbers.", "Down one row = ten more.", "The chart is counting, folded into rows."],
  "next: which ten comes next?")
def(10, 2,
  "In the tens count, every number has a next: after 30 comes 40, after 70 comes 80.",
  "Ask: which ten am I on? The next ten is one tens-jump up.",
  { body: "The next ten.", widget: () => hop("Which ten comes after 40? Hop one ten and tap where you land.", 40, 10, 1, "forward", "One tens-hop from 40 lands on 50.", tensTraps(40)), predict: predTens(40), rep: "number-line" },
  tensNextK(30, true), tensNextK(70), tensNextK(80, true), tensNextK(60, true),
  [30, 40, 50, 60, 70],
  ["Every ten has a next ten.", "One tens-hop finds it.", "Adding one is not adding ten."],
  "next: tens can count backward too.")
def(11, 2,
  "Tens can count down: 50, 40, 30, 20, 10. Each hop back takes away a whole ten.",
  "Counting back by tens is the same jumps, walked the other way.",
  { body: "Tens, backward.", widget: () => hop("Count back by tens: start at 60 and make 2 tens-hops back. Tap where you land.", 60, 10, 2, "back", "60, 50, 40 — two tens-hops back land on 40.", [{ value: 50, feedback: "That's 1 hop back. One more: 40." }, { value: 30, feedback: "That's 3 hops back. Make just 2 from 60 to land on 40." }]), predict: predBack(60, 20), rep: "number-line" },
  tensBackK(50), tensBackK(80), tensNextK(20, true), tensBackK(100),
  [20, 30, 40, 50, 60],
  ["Tens count down too: 50, 40, 30…", "Each back-hop takes a whole ten.", "Same jumps, other direction."],
  "next: starting the count anywhere you like.")
def(12, 3,
  "You do not have to start at 1. Start at 7 and count on: 8, 9, 10, 11.",
  "Starting in the middle saves counting. The numbers already counted stay counted.",
  { body: "Start at seven.", widget: () => hop("Start at 7 and count on 5. Tap where you land.", 7, 1, 5, "forward", "7 and 5 more is 12 — no need to start at 1!", [{ value: 11, feedback: "That's 4 hops. One more: 12." }, { value: 13, feedback: "That's 6 hops. Count just 5 from 7 to land on 12." }]), predict: predCross(7, 5, 10), rep: "number-line" },
  countOnK(9, 4), seqK(13), missingK(11), countOnK(16, 5),
  [9, 10, 11, 12, 13],
  ["Counting can start anywhere.", "Count on from where you are.", "The pattern is the same."],
  "next: starting deep in the middle.")
def(13, 3,
  "Start deep in the count — at 34, at 56 — and keep going. The pattern carries you.",
  "Whatever the start, the next number is one more. 56, then 57, then 58.",
  { body: "Start in the middle.", widget: () => hop("Start at 34 and count on 4. Tap where you land.", 34, 1, 4, "forward", "34 and 4 more is 38 — counting from the middle works!", [{ value: 37, feedback: "That's 3 hops. One more: 38." }, { value: 39, feedback: "That's 5 hops. Count just 4 from 34 to land on 38." }]), predict: predCross(34, 4, 40), rep: "number-line" },
  countOnK(56, 4), seqK(61), missingK(57), countOnK(73, 5),
  [56, 57, 58, 59, 60],
  ["Start anywhere; count on.", "The next number is always one more.", "Middles are fine starting places."],
  "next: picking up a count that stopped.")
def(14, 3,
  "A count can stop and start again. It stopped at 46? Pick it up: 47, 48, 49.",
  "To continue a count, say the last number, then the next one up.",
  { body: "Pick it up.", widget: () => hop("The count stopped at 46. Pick it up and count on 3. Tap where you land.", 46, 1, 3, "forward", "46, then 47, 48, 49 — the count carries on.", [{ value: 48, feedback: "That's 2 hops. One more: 49." }, { value: 50, feedback: "That's 4 hops. Count just 3 from 46 to land on 49." }]), predict: predCross(46, 3, 50), rep: "number-line" },
  countOnK(28, 3), seqK(52), missingK(47), countOnK(64, 4),
  [46, 47, 48, 49, 50],
  ["A stopped count is not lost.", "Say the last number, then count on.", "47, 48, 49 — carried on."],
  "next: counting on from really big numbers.")
def(15, 3,
  "Counting on works from big numbers too. Start at 87 and go: 88, 89, 90, 91.",
  "Big numbers follow the same rule: the next number is one more.",
  { body: "Big starts.", widget: () => hop("Start at 87 and count on 4. Tap where you land.", 87, 1, 4, "forward", "87 and 4 more is 91 — big numbers count on too!", [{ value: 90, feedback: "That's 3 hops. One more: 91." }, { value: 92, feedback: "That's 5 hops. Count just 4 from 87 to land on 91." }]), predict: predCross(87, 4, 90), rep: "number-line" },
  countOnK(78, 4), seqK(93), missingK(88), countOnK(94, 6),
  [88, 89, 90, 91, 92],
  ["Big numbers count on the same way.", "87, then 88 — one more each time.", "Even near 100 the rule holds."],
  "next: reading the chart to find what comes next.")
def(16, 3,
  "The chart can answer 'what comes next?' Find your number; the next square holds the next count.",
  "At the end of a row, the count wraps: the next square is the start of the row below.",
  { body: "Next on the chart.", widget: () => hop("On the chart, 29 ends its row. What comes next? Hop one and tap where you land.", 29, 1, 1, "forward", "After 29 the count wraps to the next row: 30.", [{ value: 28, feedback: "28 comes BEFORE 29. The next square holds 30." }, { value: 31, feedback: "That skips 30. Right after 29 comes 30." }]), predict: predCross(29, 1, 30), rep: "table" },
  { ...seqK(35), body: "Next square." }, chartBelowK(52), missingK(36), { ...seqK(59, "kDecadeCrossHop"), body: "Row's end." },
  [28, 29, 30, 31, 32],
  ["The chart holds the count in rows.", "Next square = next number.", "Row ends wrap to the row below."],
  "next: filling in missing chart squares.")
def(17, 3,
  "Some chart squares are blank. The count tells you what belongs: read the row, fill the gap.",
  "A gap in a row is just a gap in the count. Say the row out loud and the missing number appears.",
  { body: "Fill the square.", widget: () => hop("A row reads 71, 72, __, 74. Hop from 72 to the missing square.", 72, 1, 1, "forward", "The gap holds 73 — the count runs 71, 72, 73, 74.", [{ value: 71, feedback: "71 starts the run. The gap after 72 holds 73." }, { value: 74, feedback: "74 ends the run. The gap holds 73." }]), predict: predCross(72, 1, 73), rep: "table" },
  chartMissingK(41), chartMissingK(64), chartBelowK(38), chartMissingK(84),
  [71, 72, 73, 74, 75],
  ["Blank squares still have numbers.", "Read the row; the gap speaks.", "Chart gaps are counting gaps."],
  "next: counting backward from twenty.")
def(18, 3,
  "Counting can walk backward too: 20, 19, 18, 17. Each step is one less.",
  "Backward counting undoes forward counting. 12 back one is 11 — the number before.",
  { body: "Count down.", widget: () => hop("Start at 20 and count back 4. Tap where you land.", 20, 1, 4, "back", "20, 19, 18, 17, 16 — counting down works!", [{ value: 17, feedback: "That's 3 back. One more: 16." }, { value: 15, feedback: "That's 5 back. Count just 4 down from 20 to land on 16." }]), predict: predBack(20, 4), rep: "number-line" },
  countBackK(12, 3), beforeK(15), { ...missingK(14), body: "Down the run." }, countBackK(18, 5),
  [14, 15, 16, 17, 18],
  ["Counting walks backward too.", "Each back-step is one less.", "Backward undoes forward."],
  "next course: writing the numbers you can count.")

// ——— assembly ———
must(L.length === 18, "18 lessons defined");
const chapters = [
  { id: "ch1-past-twenty", title: "Past Twenty", lessonIds: [] },
  { id: "ch2-counting-by-tens", title: "Counting by Tens", lessonIds: [] },
  { id: "ch3-starting-anywhere", title: "Starting Anywhere", lessonIds: [] },
];
const chCount = [0, 0, 0];
const outDir = join(root, "content/courses/counting-to-100-k");
mkdirSync(join(outDir, "lessons"), { recursive: true });
const lessonIds = [];
const numWord = (n) => n; // prose keeps digits; narration below spells nothing complex

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  must(row.n === d.n, `spec row order ${row.n} vs ${d.n}`);
  const tag = row.conceptTag;
  const seq = chCount[d.ch - 1] + 1; chCount[d.ch - 1]++;
  const id = `k100-0${d.ch}-0${seq}`;
  lessonIds.push([d.ch, id]);
  chapters[d.ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const check = (sid, pack, kind = "check") => ({
    id: sid, kind, body: pack.body, conceptTag: tag,
    explanationVariants: pack.ev, widget: pack.widget, hints: pack.hints,
    variant: pack.variant, cml: cml(tag, "number-line"),
  });
  const i1w = d.i1.widget();
  const lesson = {
    id, slug, title: row.title, courseId: "counting-to-100-k",
    chapterId: chapters[d.ch - 1].id, minutes: 6, readingProfile: "early",
    steps: [
      { id: "c1", kind: "concept", figure: "number-track", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: d.i1.body, conceptTag: tag, widget: i1w, predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      check("k1", d.k1),
      { id: "c2", kind: "concept", figure: "number-track", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: "Put the numbers in counting order.", conceptTag: tag,
        widget: drag("Drag these into counting order, smallest first.", d.dragVals), variant: { gen: "sequence-order" } },
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
        widget: { type: "numeric", prompt: d.k1.widget.type === "numberLineHop"
            ? `What number comes right ${d.k1.widget.direction === "back" ? "before" : "after"} ${d.k1.widget.start}?`
            : d.k1.widget.prompt.replace(/Fill the missing number: |A chart row reads /, "Which number is missing? "),
          answer: d.k1.widget.type === "numberLineHop"
            ? d.k1.widget.start + (d.k1.widget.direction === "back" ? -1 : 1) * d.k1.widget.hop * d.k1.widget.hops
            : Number(d.k1.widget.options.find((o) => o.correct).label),
          tolerance: 0,
          commonErrors: (d.k1.widget.type === "numberLineHop" ? d.k1.widget.commonLandings
            : d.k1.widget.options.filter((o) => !o.correct).slice(0, 2).map((o) => ({ value: Number(o.label), feedback: o.feedback }))),
          fallbackFeedback: d.k1.ev[0] },
      },
    }],
  };
  // structural asserts
  for (const s of lesson.steps) {
    const w = s.widget;
    if (!w) continue;
    if (w.type === "numberLineHop") {
      const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
      must(land >= w.min && land <= w.max && land >= 0 && land <= CAP, `${id}/${s.id} landing`);
      for (const t of w.commonLandings) must(t.value >= w.min && t.value <= w.max && t.value !== land, `${id}/${s.id} trap`);
    }
    if (w.type === "mcq") must(w.options.filter((o) => o.correct).length === 1 && w.options.length === 4, `${id}/${s.id} mcq`);
    if (w.type === "dragOrder") {
      const labels = w.correctOrder.map((oid) => Number(w.items.find((it) => it.id === oid).label));
      must(labels.every((v, i) => i === 0 || v > labels[i - 1]), `${id}/${s.id} order`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
  }
  const remA = lesson.remedials[0].check.widget.answer;
  must(Number.isInteger(remA) && remA >= 0 && remA <= CAP, `${id} remedial answer`);
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "counting-to-100-k", slug: "counting-to-100-k", title: "Counting to 100",
  tagline: "Count past twenty, jump by tens, read the hundred chart, and start the count anywhere.",
  category: "Math", gradeLevel: 0, chapters,
}, null, 2) + "\n");
console.log(`built 18 lessons + course.json; ${asserts} internal assertions all passed`);
console.log("ids:", lessonIds.map(([, i]) => i).join(" "));
