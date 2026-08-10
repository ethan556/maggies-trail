#!/usr/bin/env node
// S198 — Batch G course 2/6: compare-numbers-k (K.CC.C.6, K.CC.C.7). Zero new generator code.
//
// Families: g0-counting + k0-count-100. Same all-A recipe as how-many-k (measured from the
// shipped K courses): EVERY lesson carries a predict step on i1, two diagnostic traps per graded
// widget, and at least one numberLineHop — the only K engine rated adapt 3.
//
// New surfaces for this course (probed):
//   countOrderDrag / kSeqOrderDrag -> dragOrder {items[{id,label}], correctOrder (ids, ascending),
//     misorderFeedback[{first,second,feedback}], missFeedback}; the solver returns the labels
//     sorted ascending, so correctOrder must list ids in ascending-label order.
//   kSeqBeforeHop -> numberLineHop with direction "back": the landing is start − hops, and the
//     prompt shape is "What number comes right before N? Hop one back and tap where you land."
//
// readingProfile "early": concept bodies are capped at 25 words — written to the cap, not trimmed.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spec = JSON.parse(readFileSync(join(root, "k5-expansion.json"), "utf8"))
  .courses.find((c) => c.slug === "compare-numbers-k");
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
const FRAME_T = corpusTemplate("tenFrame", "add-subtract-10-k");
const HOP_T = corpusTemplate("numberLineHop", "counting-to-100-k");
const DRAG_T = corpusTemplate("dragOrder", "counting-to-100-k");

const REG_G0 = new Set(["countAddMcq","countAddLine","countCompareEqualMcq","countTensMcq","countTensLine",
  "countObjectsMcq","countObjectsFlash","countDecomposeMcq","countMakeTenMcq","countMoreFewerMcq",
  "countOrderDrag","countBetweenMcq","countReadMcq","countReadFlash","countZeroTap",
  "countSubtractMcq","countSubtractLine","countTeenFrame"]);
const REG_K100 = new Set(["kSeqNextHop","kSeqNextMcq","kSeqBeforeHop","kSeqMissingMcq","kDecadeCrossHop",
  "kDecadeNextMcq","kTensNextHop","kTensNextMcq","kTensBackHop","kTensOrderDrag","kChartRowMcq",
  "kChartMissingMcq","kCountFromHop","kCountBackHop","kSeqOrderDrag"]);
const REG = { "g0-counting": REG_G0, "k0-count-100": REG_K100 };

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

/* ---------------- solver-mcq mirrors ---------------- */
function mcqStep(prompt, correctLabel, wrongs, feedbackByLabel, gen, form) {
  const labels = [correctLabel, ...wrongs];
  must(new Set(labels).size === labels.length, `mcq duplicate labels: ${prompt.slice(0, 40)}`);
  must(labels.length >= 4, `mcq needs >=4 options: ${prompt.slice(0, 40)}`);
  const options = labels.map((label, i) => {
    const fb = feedbackByLabel[label];
    must(fb && fb.length >= 25, `mcq feedback missing/short for "${label}"`);
    return { id: `o${i}`, label, correct: i === 0, feedback: fb };
  });
  must(new Set(options.map((o) => o.feedback)).size === options.length, "mcq feedback not distinct");
  const step = { widget: { type: "mcq", prompt, options } };
  if (gen) { must(REG[gen]?.has(form), `${gen}/${form} NOT registered`); step.variant = { gen, form }; }
  return step;
}
function MoreFewer(r, mode = "any") {
  const a = pick(r, 3, 8);
  let b;
  if (mode === "equal") b = a;
  else if (mode === "starsMore") { b = a - pick(r, 1, 2); }
  else if (mode === "heartsMore") { b = a + pick(r, 1, 2); }
  else { b = pick(r, 2, 8); if (b === a) b = a - 1; }
  const correct = a === b ? "They are equal" : a > b ? "More stars" : "More hearts";
  const wrongs = ["They are equal", "More stars", "More hearts", "You cannot tell"].filter((l) => l !== correct).slice(0, 3);
  const fb = {
    "More stars": a > b
      ? `Correct — ${a} stars against ${b} hearts; pairing one to one leaves stars unmatched.`
      : `Pairing one to one uses every star with hearts to spare, so the stars are not the larger group.`,
    "More hearts": b > a
      ? `Correct — ${b} hearts against ${a} stars; pairing one to one leaves hearts unmatched.`
      : `Pairing one to one uses every heart with stars to spare, so the hearts are not the larger group.`,
    "They are equal": a === b
      ? `Correct — every star pairs with exactly one heart and neither side has anything left over.`
      : `Equal needs the pairing to come out even; here one side is left holding extras (${a} against ${b}).`,
    "You cannot tell": `You can always tell — pair the groups one to one and look at which side has leftovers.`,
  };
  return mcqStep(`There are ${a} stars and ${b} hearts. Which statement is true?`,
    correct, wrongs, fb, "g0-counting", "countMoreFewerMcq");
}
function CompareEqual(r) {
  const n = pick(r, 2, 9);
  return mcqStep(`Compare ${n} and ${n}. Which statement is true?`,
    "They are equal", ["The first number is greater", `${n} is less than ${n}`, "You cannot tell"],
    { "They are equal": `Correct — the same numeral names the same amount every single time it is used.`,
      "The first number is greater": `Both numbers are ${n}; being written first gives a number no extra size.`,
      [`${n} is less than ${n}`]: `A number cannot be less than itself; the two values match exactly.`,
      "You cannot tell": `You can tell at a glance — identical numerals always name identical amounts.` },
    "g0-counting", "countCompareEqualMcq");
}
function SeqNext(r) {
  const n = pick(r, 3, 17);
  return mcqStep(`What number comes right after ${n}?`,
    String(n + 1), [String(n), String(n + 2), String(n - 1)],
    { [String(n + 1)]: `Correct — the later a number comes in the counting song, the greater it is, by one each step.`,
      [String(n)]: `${n} is where we stood; the question asks for the next number along.`,
      [String(n + 2)]: `${n + 2} skips a number; the count moves one at a time.`,
      [String(n - 1)]: `${n - 1} comes BEFORE ${n} and is the smaller neighbour, not the next one.` },
    "k0-count-100", "kSeqNextMcq");
}
function Between(r) {
  const a = pick(r, 2, 8);
  return mcqStep(`Which number comes between ${a} and ${a + 2}?`,
    String(a + 1), [String(a), String(a + 2), String(a + 3)],
    { [String(a + 1)]: `Correct — ${a + 1} is greater than ${a} and less than ${a + 2}, sitting exactly between them.`,
      [String(a)]: `${a} is the smaller endpoint, not a number inside the pair.`,
      [String(a + 2)]: `${a + 2} is the larger endpoint; between means strictly inside.`,
      [String(a + 3)]: `${a + 3} lies beyond ${a + 2}, outside the endpoints altogether.` },
    "g0-counting", "countBetweenMcq");
}

/* ---------------- hops (numberLineHop, the adapt-3 engine) ---------------- */
function hopBase(prompt, min, max, start, hops, direction, land, success, landings, low, high, gen, form) {
  const w = structuredClone(HOP_T);
  w.prompt = prompt; w.min = min; w.max = max; w.start = start;
  w.hop = 1; w.hops = hops; w.direction = direction;
  must(land > min && land < max, `hop landing ${land} sits at the edge — one feedback direction would be dead`);
  w.successFeedback = success;
  w.missFeedback = `Count ${hops} ${direction === "back" ? "back" : "on"} from ${start}: you land on ${land}.`;
  w.lowFeedback = low; w.highFeedback = high;
  must(low.length >= 25 && high.length >= 25, "hop needs authored low/high feedback");
  w.commonLandings = landings.map(([value, feedback]) => {
    must(value !== land && value >= min && value <= max, `hop trap ${value} invalid`);
    must(feedback.length >= 25, "hop trap feedback short");
    return { value, feedback };
  });
  const step = { widget: w };
  if (gen) { must(REG[gen]?.has(form), `${gen}/${form} NOT registered`); step.variant = { gen, form }; }
  return step;
}
function SeqNextHop(r) {
  const n = pick(r, 5, 17);
  return hopBase(`What number comes right after ${n}? Hop one and tap where you land.`,
    n - 3, n + 4, n, 1, "forward", n + 1,
    `${n + 1} — one hop forward, and one hop later in the song always means greater.`,
    [[n, `${n} stops one complete hop too soon. Continue the final 1-unit hop to reach ${n + 1}.`],
     [n + 2, `${n + 2} goes one complete hop too far. One hop from ${n} lands on ${n + 1}.`]],
    `Short of the landing — a single hop forward reaches ${n + 1}.`,
    `Past the landing — right after ${n} means one hop, stopping on ${n + 1}.`,
    "k0-count-100", "kSeqNextHop");
}
function SeqBeforeHop(r) {
  const n = pick(r, 6, 18);
  return hopBase(`What number comes right before ${n}? Hop one back and tap where you land.`,
    n - 4, n + 3, n, 1, "back", n - 1,
    `${n - 1} — one hop back, and one hop earlier in the song always means less.`,
    [[n, `${n} stops one complete hop too soon. Continue the final 1-unit hop back to reach ${n - 1}.`],
     [n - 2, `${n - 2} goes one complete hop too far. Count exactly 1 hop back from ${n} to reach ${n - 1}.`]],
    `Short of the landing — one hop back from ${n} reaches ${n - 1}.`,
    `Past the landing — right before ${n} means a single hop back, stopping on ${n - 1}.`,
    "k0-count-100", "kSeqBeforeHop");
}
function CountFromHop(r) {
  const a = pick(r, 8, 14), h = pick(r, 2, 4);
  const land = a + h;
  return hopBase(`Start at ${a} and count on ${h}. Tap where you land.`,
    a - 2, land + 2, a, h, "forward", land,
    `${a} and ${h} more is ${land} — every step forward lands on a greater number.`,
    [[land - 1, `${land - 1} stops one complete hop too soon. Continue the final 1-unit hop to reach ${land}.`],
     [land + 1, `${land + 1} goes one complete hop too far. Count just ${h} hops from ${a} to land on ${land}.`]],
    `Short of the landing — all ${h} counts are needed to reach ${land}.`,
    `Past the landing — the count-on stops after ${h} numbers, on ${land}.`,
    "k0-count-100", "kCountFromHop");
}

/* ---------------- dragOrder (countOrderDrag): correctOrder ids ascending by label ---------------- */
function OrderDrag(r, size = 4, lo = 2, hi = 16) {
  const startV = pick(r, lo, hi - size);
  const vals = Array.from({ length: size }, (_, i) => startV + i);
  const w = structuredClone(DRAG_T);
  w.prompt = "Drag the numbers into counting order, smallest first.";
  // shuffle display order deterministically; ids follow ascending values
  const order = [...vals.keys()];
  for (let i = order.length - 1; i > 0; i--) { const j = pick(r, 0, i); [order[i], order[j]] = [order[j], order[i]]; }
  w.items = order.map((ascIdx) => ({ id: `n${ascIdx}`, label: String(vals[ascIdx]) }));
  w.correctOrder = vals.map((_, i) => `n${i}`);
  must(w.items.length === size && new Set(w.items.map((x) => x.id)).size === size, "drag items invalid");
  const big = vals[size - 1], small = vals[0];
  w.misorderFeedback = [
    { first: `n${size - 1}`, second: "n0",
      feedback: `${big} before ${small} starts with the greatest value. Counting order begins with the smallest value, ${small}.` },
    { first: "n1", second: "n0",
      feedback: `${vals[1]} cannot come before ${small} — the smaller number always stands earlier in counting order.` },
  ];
  w.missFeedback = `Find the smallest value first, then place each next-greater number after it.`;
  return { widget: w, variant: { gen: "g0-counting", form: "countOrderDrag" } };
}

/* ---------------- authored MCQs ---------------- */
const authored = (prompt, opts) => {
  must(opts.length >= 4 && opts[0][1], "authored mcq shape");
  return mcqStep(prompt, opts[0][0], opts.slice(1).map((o) => o[0]),
    Object.fromEntries(opts.map(([l, , f]) => [l, f])), null, null);
};
const PairUpMcq = () => authored("How does pairing one to one settle which group is bigger?", [
  ["The side left with unmatched things is the bigger group", true, "Correct — pairing uses the groups up together, so whatever remains unmatched is the surplus."],
  ["The side that finishes pairing first is bigger", false, "Finishing first means running OUT first — that is the smaller group, not the bigger."],
  ["Pairing only works for equal groups", false, "Pairing works on any two groups; unequal ones simply leave a remainder on one side."],
  ["The side with bigger things is bigger", false, "Pairing compares counts, not sizes — one large thing still pairs with one small one."]]);
const LeftoverMcq = () => authored("After pairing, two hearts stand unmatched. What does that show?", [
  ["There are two more hearts than stars", true, "Correct — every star found a heart, and the two spare hearts are exactly the difference."],
  ["Two hearts were counted wrong", false, "Nothing was miscounted; leftovers are what pairing is designed to reveal."],
  ["The stars are bigger", false, "Pairing says nothing about size — it measures which group has more members."],
  ["The groups are equal anyway", false, "Equal groups pair off with nothing spare; two leftovers mean the hearts outnumber."]]);
const EyeballMcq = () => authored("When can your eyes alone compare two groups safely?", [
  ["When one group is clearly much bigger than the other", true, "Correct — a big gap is visible at a glance; close contests need pairing or counting."],
  ["Always — eyes never fool us", false, "Spread-out groups look bigger than they are; close comparisons fool the eye easily."],
  ["Never — you must always count", false, "Seven against two needs no count; it is close contests that demand care."],
  ["Only when the groups are equal", false, "Equal groups are exactly the hardest case for eyes alone — the pairing settles it."]]);
const CountToCompareMcq = () => authored("The groups look close. What settles which has more?", [
  ["Count both and compare the two last numbers", true, "Correct — each count names its group's size, and the later counting word wins."],
  ["Stare at them longer", false, "Close groups stay close however long you look; counting gives the exact sizes."],
  ["Pick the messier-looking group", false, "Mess spreads things out without adding any; arrangement is not amount."],
  ["Ask someone taller", false, "Height does not help — the counts decide, whoever does the counting."]]);
const LaterIsGreaterMcq = () => authored("Why is 8 greater than 6, just from the counting song?", [
  ["8 comes later in the song, and later always means more", true, "Correct — every step of the count adds one, so a later number names a larger amount."],
  ["8 is drawn with more curves", false, "The shape of a numeral says nothing about its size as an amount."],
  ["8 rhymes with \u201cgreat\u201d", false, "Sound is not size; position in the counting song is what orders the numbers."],
  ["It is not — 6 is greater", false, "Counting reaches 6 before 8, and two more steps of one make 8 the larger."]]);
const SameAmountMcq = () => authored("5 pebbles and 5 feathers — which group has more things?", [
  ["Neither — 5 names the same amount for both", true, "Correct — a numeral counts members, so five of anything matches five of anything else."],
  ["The pebbles, because they are heavier", false, "Weight is a different question; the count of five is identical on both sides."],
  ["The feathers, because they spread out", false, "Spreading fills space without adding members; both groups pair off exactly."],
  ["It depends on the day", false, "Counts do not drift with the calendar; five and five pair evenly always."]]);
const GreatestPlanMcq = () => authored("Three numbers: 4, 9, 2. How do you find the greatest?", [
  ["The one latest in the counting song — here 9", true, "Correct — later in the song means more, so the greatest is the one the count reaches last."],
  ["The first one written — here 4", false, "Written order is arbitrary; the counting song's order is what compares them."],
  ["The one written biggest on the page", false, "Ink size is not amount; a tiny 9 still beats a giant 4."],
  ["Add them all together", false, "Adding builds a new number; comparing only asks which existing one is latest."]]);

/* ---------------- tenFrame builder for i1 ---------------- */
function frame(prompt, target, success, traps, miss) {
  const w = structuredClone(FRAME_T);
  w.prompt = prompt; w.target = target; w.preFilled = 0; w.addColor = "sky";
  must(target >= 1 && target <= 10, `tenFrame target ${target} outside the frame`);
  w.successFeedback = success; w.missFeedback = miss;
  w.commonCounts = traps.map(([count, feedback]) => {
    must(count !== target && count >= 0 && count <= 10, `tenFrame trap ${count} invalid`);
    must(feedback.length >= 25, "tenFrame trap feedback short");
    return { count, feedback };
  });
  must(w.commonCounts.length >= 2, "tenFrame needs 2 diagnosable wrong counts");
  return w;
}

const H = {
  pair: ["Pair one to one.", "Leftovers decide.", "No leftovers means equal."],
  song: ["Later means greater.", "Earlier means less.", "The song orders them."],
  count: ["Count both groups.", "Compare the last numbers.", "The later word wins."],
};

const cml = (tag, rep) => ({
  stage: "construct", flagship: false, kernel: "quantity-composition",
  actionGoal: `Pair the groups one to one, or place both numbers in the counting song, for ${tag.replace(/-/g, " ")}.`,
  invariants: [`Comparison rests on two facts that never move: pairing one to one leaves the bigger group with leftovers, and a number later in the counting song always names more — which is what ${tag.replace(/-/g, " ")} uses.`],
  misconceptions: [`Judging by how much space a group fills, by the size of the things in it, or by which number was written first.`],
  representations: [rep, "symbolic"], translationFrom: rep, translationTo: "symbolic",
  fadeLevel: 0, transferFamily: `compare-numbers-k:${tag}`, delayed: true,
  counterfactualPrompt: "If one more joined the smaller group, would the pairing come out even?",
});
const P = (prompt, options, outcomeId, reveal) => {
  must(options.some((o) => o.id === outcomeId), "predict outcome present");
  return { prompt, options, outcomeId, reveal };
};

const L = [];
const def = (n, c1, c2, i1, checks, recap, teaser) => L.push({ n, c1, c2, i1, checks, recap, teaser });
const S = (mk, seedStr, hints, ev, ...extra) => {
  const r = mulberry32(seedFromString(seedStr));
  const out = mk(r, ...extra);
  return { ...out, hints, ev };
};
const A = (mk, hints, ev) => ({ ...mk(), hints, ev });

def(1,
  "Two groups can hold MORE, FEWER, or the SAME. Those three words are all of comparing — the rest is finding out which is true.",
  "More means leftovers on that side after pairing. Fewer means running out first. Same means the pairing comes out even.",
  { rep: "concrete", widget: () => frame("There are 6 hearts. Build the stars so there are MORE stars.", 7,
      "Seven stars beat six hearts — pairing leaves one star standing alone.",
      [[6, "Six stars pair off exactly with six hearts; that is SAME, not more."],
       [5, "Five stars run out before the hearts do; that is FEWER, not more."]],
      "Build one star per heart, then add at least one extra."),
    predict: P("More stars than 6 hearts — what does pairing leave?", [{ id: "star", label: "A star with no heart" }, { id: "even", label: "Nothing left over" }], "star",
      "More means the pairing cannot use up the stars; at least one stands unmatched.") },
  [
    S(MoreFewer, "kcm1-k1", H.pair, ["Pair them up.", "Leftovers name the winner."], "starsMore"),
    A(PairUpMcq, H.pair, ["Unmatched means bigger.", "Running out means smaller."]),
    S(SeqNextHop, "kcm1-k3", H.song, ["One later, one greater.", "The song orders."]),
    S(MoreFewer, "kcm1-ch1", H.pair, ["Any groups, same pairing.", "Look for leftovers."], "heartsMore"),
  ],
  ["More, fewer, or the same.", "Pairing finds out which.", "Leftovers name the bigger group."],
  "next: the pairing trick itself.");

def(2,
  "Matching one to one is the oldest comparing tool: one star takes one heart, again and again, until a side runs dry.",
  "The side still holding things is the bigger group — and HOW MANY it still holds is exactly the difference.",
  { rep: "concrete", widget: () => frame("Pair 5 hearts with stars, one each — then show the stars used.", 5,
      "Five stars for five hearts — the pairing comes out perfectly even.",
      [[4, "Four stars leave one heart unmatched; the pairing is not finished."],
       [6, "Six stars is one more than the hearts need; one star would stand alone."]],
      "Give each heart exactly one star and stop when the hearts run out."),
    predict: P("Pairing 5 hearts with 5 stars, what remains at the end?", [{ id: "none", label: "Nothing on either side" }, { id: "one", label: "One extra star" }], "none",
      "Equal groups use each other up exactly — that is what equal means.") },
  [
    A(LeftoverMcq, H.pair, ["Leftovers ARE the difference.", "Count them."]),
    S(MoreFewer, "kcm2-k2", H.pair, ["Pair and look.", "Which side holds extras?"], "heartsMore"),
    S(CountFromHop, "kcm2-k3", H.song, ["Counting on adds the extras.", "Step past the match."]),
    S(MoreFewer, "kcm2-ch1", H.pair, ["Even pairing means equal.", "No side wins."], "equal"),
  ],
  ["One star takes one heart.", "The side with leftovers is bigger.", "The leftovers count the difference."],
  "next: naming the bigger group.");

def(3,
  "The BIGGER group is the one pairing cannot empty. Say it with MORE: more stars, more hearts, whichever side holds extras.",
  "Bigger is about members, not about space or size — three elephants are fewer than five mice.",
  { rep: "concrete", widget: () => frame("4 hearts sit ready. Build the SMALLEST star group that is still bigger.", 5,
      "Five — one more than four is the smallest way to be bigger.",
      [[4, "Four matches the hearts exactly; bigger needs at least one extra."],
       [7, "Seven is bigger, but not the SMALLEST bigger group — five already wins."]],
      "Match the four hearts first, then add exactly one more star."),
    predict: P("Three elephants or five mice — which group is bigger?", [{ id: "mice", label: "The mice — five members" }, { id: "eleph", label: "The elephants — they are huge" }], "mice",
      "Bigger counts members; the size of each member never enters the comparison.") },
  [
    S(MoreFewer, "kcm3-k1", H.pair, ["Members, not size.", "Pair to check."], "starsMore"),
    A(EyeballMcq, H.pair, ["Big gaps show.", "Close calls need pairing."]),
    S(SeqNextHop, "kcm3-k3", H.song, ["One more is next.", "Next is greater."]),
    S(MoreFewer, "kcm3-ch1", H.pair, ["The extras decide.", "Count the leftovers."], "heartsMore"),
  ],
  ["Bigger means more members.", "Size of the things never matters.", "One extra is enough to win."],
  "next: naming the smaller group.");

def(4,
  "The SMALLER group runs out first when pairing. Say it with FEWER: fewer stars means stars ran out while hearts remained.",
  "Fewer is not sad or wrong — it is simply the side of the pairing that finished first.",
  { rep: "concrete", widget: () => frame("There are 7 hearts. Build a star group with FEWER stars.", 5,
      "Five stars run out with two hearts still waiting — fewer, exactly as asked.",
      [[7, "Seven stars pair off evenly with seven hearts; that is SAME, not fewer."],
       [8, "Eight stars leave a star standing alone; that is MORE, not fewer."]],
      "Build fewer stars than seven — any count that runs out first."),
    predict: P("Fewer stars than hearts — which side runs out first while pairing?", [{ id: "stars", label: "The stars" }, { id: "hearts", label: "The hearts" }], "stars",
      "Fewer means the group that empties first, leaving the other side holding extras.") },
  [
    S(MoreFewer, "kcm4-k1", H.pair, ["Which empties first?", "That side is fewer."], "heartsMore"),
    S(SeqBeforeHop, "kcm4-k2", H.song, ["One back is one less.", "Earlier means fewer."]),
    A(PairUpMcq, H.pair, ["Running out means smaller.", "Extras mean bigger."]),
    S(MoreFewer, "kcm4-ch1", H.pair, ["Fewer and more are partners.", "One side each."], "starsMore"),
  ],
  ["Fewer means running out first.", "The other side holds the extras.", "One back in the song is one less."],
  "next: when the pairing comes out even.");

def(5,
  "Sometimes the pairing comes out even: every star finds a heart, and nothing stands alone. Those groups MATCH — they are EQUAL.",
  "Equal is a claim about the pairing, so it survives any shuffling — scatter the stars and they still pair off exactly.",
  { rep: "concrete", widget: () => frame("6 hearts wait. Build the star group that matches EXACTLY.", 6,
      "Six for six — every star paired, every heart paired, nothing left on either side.",
      [[5, "Five stars leave one heart alone; a single gap breaks the match."],
       [7, "Seven stars leave one star alone; one extra breaks the match just as surely."]],
      "One star per heart, no more, no fewer."),
    predict: P("Groups match exactly. Now the stars are scattered about. Still equal?", [{ id: "yes", label: "Yes — pairing does not care about position" }, { id: "no", label: "No — scattering changes it" }], "yes",
      "Equal is about the pairing, and every scattered star still finds its heart.") },
  [
    S(MoreFewer, "kcm5-k1", H.pair, ["No leftovers anywhere.", "That is equal."], "equal"),
    S(CompareEqual, "kcm5-k2", H.pair, ["Same numeral, same amount.", "Always."]),
    S(CountFromHop, "kcm5-k3", H.song, ["The line agrees.", "Same landings match."]),
    S(MoreFewer, "kcm5-ch1", H.pair, ["One extra ruins equal.", "Check both sides."], "equal"),
  ],
  ["Equal means the pairing comes out even.", "Nothing stands alone on either side.", "Shuffling cannot break a match."],
  "next: judging by eye.");

def(6,
  "Eyes can compare when the gap is huge — seven against two needs no counting. But close contests fool the eye, especially spread-out groups.",
  "The rule: trust a glance for big gaps, and reach for pairing or counting the moment the race looks close.",
  { rep: "concrete", widget: () => frame("Two groups look close. Build the count of the SPREAD-OUT group: it has 6.", 6,
      "Six — spread wide it looked like more, but the count ignores the spacing.",
      [[8, "The spreading fooled the eye upward; touching each one ends the count at six."],
       [5, "Undercounting the spread group misses one; every member gets a number."]],
      "Count the spread group member by member; space between them adds nothing."),
    predict: P("A spread-out 6 against a squeezed 7 — which LOOKS bigger?", [{ id: "six", label: "The spread-out 6" }, { id: "seven", label: "The squeezed 7" }], "six",
      "Spacing inflates the look of a group, which is exactly why close calls need counting.") },
  [
    A(EyeballMcq, H.count, ["Glance for big gaps.", "Count for close ones."]),
    S(MoreFewer, "kcm6-k2", H.count, ["The counts settle it.", "Not the spread."], "heartsMore"),
    S(CountFromHop, "kcm6-k3", H.count, ["Counting on checks quickly.", "Step by step."]),
    S(MoreFewer, "kcm6-ch1", H.count, ["Trust counts over looks.", "Every time."], "starsMore"),
  ],
  ["A glance works for big gaps.", "Spreading fools the eye.", "Close contests need counting."],
  "next: comparing by counting.");

def(7,
  "Counting both groups turns comparison into a number question: the group whose count comes LATER in the song has more.",
  "Count stars to six, hearts to eight — eight is later than six, so the hearts win, no pairing required.",
  { rep: "concrete", widget: () => frame("Stars count to 6. Build the hearts, which count to 8 — then compare.", 8,
      "Eight — and eight comes later in the song than six, so the hearts have more.",
      [[6, "Six matches the stars; the hearts were counted two further."],
       [7, "Seven is one short — the hearts' count reached eight."]],
      "Build all eight, then place both counts in the song: later wins."),
    predict: P("Stars count to 6, hearts to 8. Which group has more?", [{ id: "hearts", label: "Hearts — 8 comes later" }, { id: "stars", label: "Stars — 6 came first" }], "hearts",
      "Later in the counting song means more; being counted first is not an advantage.") },
  [
    A(CountToCompareMcq, H.count, ["Two counts, one song.", "Later wins."]),
    S(MoreFewer, "kcm7-k2", H.count, ["Count both sides.", "Compare the last words."], "heartsMore"),
    S(SeqNextHop, "kcm7-k3", H.song, ["Later on the line too.", "Right of means more."]),
    S(Between, "kcm7-ch1", H.song, ["Between orders three at once.", "Inside the endpoints."]),
  ],
  ["Count both groups.", "The later count names the bigger group.", "The song does the comparing."],
  "next: comparing bare numerals.");

def(8,
  "Two written numerals compare the same way: the one LATER in the counting song is GREATER. 8 beats 6 because counting reaches 6 first.",
  "No stars or hearts needed — the song's order is carried inside the numerals themselves.",
  { rep: "diagram", widget: () => S(SeqNextHop, "kcm8-i1", [], []).widget,
    predict: P("Which is greater, 8 or 6?", [{ id: "eight", label: "8 — it comes later in the song" }, { id: "six", label: "6 — it is rounder" }], "eight",
      "Position in the counting song is the whole meaning of greater; shape plays no part.") },
  [
    A(LaterIsGreaterMcq, H.song, ["Later means greater.", "The song decides."]),
    S(SeqNext, "kcm8-k2", H.song, ["The next number is greater.", "By exactly one."]),
    S(SeqNextHop, "kcm8-k3", H.song, ["Rightward is greater.", "Hop and see."]),
    S(Between, "kcm8-ch1", H.song, ["Between sits inside.", "Greater than one end, less than the other."]),
  ],
  ["Numerals carry the song's order.", "Later means greater.", "8 beats 6 without any objects."],
  "next: the word for the other side.");

def(9,
  "The number EARLIER in the song is LESS. 4 is less than 7 because the count says four first, three steps before seven.",
  "Less and greater are two views of one fact: if 4 is less than 7, then 7 is greater than 4 — both at once.",
  { rep: "diagram", widget: () => S(SeqBeforeHop, "kcm9-i1", [], []).widget,
    predict: P("Is 4 less than 7?", [{ id: "yes", label: "Yes — the song says 4 first" }, { id: "no", label: "No" }], "yes",
      "Earlier in the counting song means less, and 4 arrives three steps before 7.") },
  [
    S(SeqBeforeHop, "kcm9-k1", H.song, ["One back is one less.", "Earlier means less."]),
    S(SeqNext, "kcm9-k2", H.song, ["Both directions, one song.", "Less and greater pair up."]),
    A(LaterIsGreaterMcq, H.song, ["Flip it round.", "Greater's partner is less."]),
    S(Between, "kcm9-ch1", H.song, ["Between is both at once.", "Greater than one, less than the other."]),
  ],
  ["Earlier in the song means less.", "Less and greater state one fact.", "Both are true together."],
  "next: same numeral, different things.");

def(10,
  "5 pebbles and 5 feathers hold the SAME amount — the numeral 5 does not care what it counts. Same numeral, same group size.",
  "That is what makes numerals powerful: one symbol compares groups of anything at all.",
  { rep: "concrete", widget: () => frame("5 feathers float by. Build the pebble group with the SAME amount.", 5,
      "Five — feathers and pebbles pair off exactly, because 5 names one amount everywhere.",
      [[4, "Four pebbles leave a feather unmatched; the numeral asked for five."],
       [6, "Six pebbles leave a pebble alone; same means not one extra."]],
      "Match the numeral, not the material: build exactly five."),
    predict: P("5 pebbles versus 5 feathers — which group has more members?", [{ id: "same", label: "Neither — 5 is 5" }, { id: "peb", label: "The pebbles, being heavier" }], "same",
      "The numeral counts members; weight and fluff play no part in it.") },
  [
    A(SameAmountMcq, H.pair, ["The numeral is the amount.", "Material is irrelevant."]),
    S(CompareEqual, "kcm10-k2", H.pair, ["Same numeral, equal groups.", "Every time."]),
    S(CountFromHop, "kcm10-k3", H.song, ["Counting works on anything.", "Feathers included."]),
    S(MoreFewer, "kcm10-ch1", H.pair, ["Equal pairs off exactly.", "Nothing spare."], "equal"),
  ],
  ["A numeral names one amount.", "It does not care what it counts.", "Same numeral, same size of group."],
  "next: lining numbers up.");

def(11,
  "Several numbers line up by the song's order: smallest first, then each next greater, up to the biggest. That is counting order.",
  "Placing them is repeated comparing — each number goes after everything less and before everything greater.",
  { rep: "diagram", widget: () => S(SeqNextHop, "kcm11-i1", [], []).widget,
    predict: P("Ordering 4, 2, 5, 3 smallest first — which goes FIRST?", [{ id: "two", label: "2 — the earliest in the song" }, { id: "four", label: "4 — it was written first" }], "two",
      "Counting order follows the song, not the page; the earliest number leads the line.") },
  [
    S(OrderDrag, "kcm11-k1", H.song, ["Smallest leads.", "Each next is one greater."]),
    S(SeqNext, "kcm11-k2", H.song, ["Next in the song.", "Next in the line."]),
    S(OrderDrag, "kcm11-k3", H.song, ["The line rebuilds the song.", "Step by step."]),
    S(Between, "kcm11-ch1", H.song, ["Between finds the middle.", "Order shows it."]),
  ],
  ["Counting order follows the song.", "Smallest first, biggest last.", "Each number sits after all lesser ones."],
  "next: the two ends of the line.");

def(12,
  "In an ordered line, the GREATEST stands at one end and the LEAST at the other — the song's last word, and its first.",
  "Greatest and least are the line's two ends — everything else lives between them.",
  { rep: "diagram", widget: () => S(SeqBeforeHop, "kcm12-i1", [], []).widget,
    predict: P("Of 4, 9, 2 — which is the greatest?", [{ id: "nine", label: "9 — latest in the song" }, { id: "four", label: "4 — first written" }], "nine",
      "The greatest is whichever the counting song reaches last; written order is irrelevant.") },
  [
    A(GreatestPlanMcq, H.song, ["Latest is greatest.", "Earliest is least."]),
    S(OrderDrag, "kcm12-k2", H.song, ["Order first.", "Read the ends."]),
    S(SeqBeforeHop, "kcm12-k3", H.song, ["Step back toward least.", "Forward toward greatest."]),
    S(MoreFewer, "kcm12-ch1", H.pair, ["Groups compare the same way.", "Count, then order."], "starsMore"),
  ],
  ["The greatest ends the ordered line.", "The least begins it.", "Everything else lives between."],
  "course complete: paired, compared, and ordered.");

/* ------------------------------------------------------------------- assembly */
must(L.length === 12, `12 lessons defined, got ${L.length}`);
const chapterTitles = ["More, Fewer, Same", "Comparing Carefully", "Numerals and Order"];
const perChapter = [4, 4, 4];
const chapters = chapterTitles.map((t, i) => ({
  id: `ch${i + 1}-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  title: t, lessonIds: [],
}));
const chCount = [0, 0, 0];
const chapterOf = (n) => (n <= 4 ? 1 : n <= 8 ? 2 : 3);
const outDir = join(root, "content/courses/compare-numbers-k");
mkdirSync(join(outDir, "lessons"), { recursive: true });

for (const [idx, d] of L.entries()) {
  const row = spec.lessons[idx];
  const tag = row.conceptTag;
  must(typeof tag === "string" && tag.length > 0, `lesson ${d.n} conceptTag`);
  const ch = chapterOf(d.n);
  const seqN = chCount[ch - 1] + 1; chCount[ch - 1]++;
  const id = `kcm-0${ch}-${String(seqN).padStart(2, "0")}`;
  chapters[ch - 1].lessonIds.push(id);
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const stepFromCheck = (sid, c, kind = "check") => {
    const step = { id: sid, kind, body: kind === "check" ? "" : "One more, for the road.", conceptTag: tag,
      explanationVariants: c.ev.length >= 2 ? c.ev : [...c.ev, "Pair one to one, or place both numbers in the song — later means greater."],
      widget: c.widget, hints: c.hints, cml: cml(tag, "concrete") };
    if (c.variant) step.variant = c.variant;
    return step;
  };

  const i1w = typeof d.i1.widget === "function" ? d.i1.widget() : d.i1.widget;
  const i2w = typeof d.i1.widget === "function" ? d.i1.widget() : structuredClone(d.i1.widget);
  const lesson = {
    id, slug, title: row.title, courseId: "compare-numbers-k",
    chapterId: chapters[ch - 1].id, minutes: 6, readingProfile: "early",
    steps: [
      { id: "c1", kind: "concept", figure: "count-on-hops", body: d.c1, narration: d.c1 },
      { id: "i1", kind: "interactive", body: "Try it.", conceptTag: tag, widget: i1w, predict: d.i1.predict, cml: cml(tag, d.i1.rep) },
      stepFromCheck("k1", d.checks[0]),
      { id: "c2", kind: "concept", figure: "count-on-hops", body: d.c2, narration: d.c2 },
      { id: "i2", kind: "interactive", body: "Try it again.", conceptTag: tag, widget: i2w, cml: cml(tag, "concrete") },
      stepFromCheck("k2", d.checks[1]),
      stepFromCheck("k3", d.checks[2]),
      stepFromCheck("ch1", d.checks[3], "challenge"),
      { id: "r1", kind: "recap", body: "You did it!", takeaways: d.recap, teaser: d.teaser },
    ],
    remedials: [{
      conceptTag: tag,
      concept: { id: `rem-${tag}-c`, kind: "concept", body: d.c2, narration: d.c2 },
      check: { id: `rem-${tag}-k`, kind: "check", body: "", conceptTag: tag,
        explanationVariants: d.checks[0].ev.length >= 2 ? d.checks[0].ev : [...d.checks[0].ev, "Pair one to one — leftovers name the bigger group."],
        widget: d.checks[0].widget },
    }],
  };

  must(lesson.steps[1].predict, `${id}: i1 must carry a predict step`);
  must(lesson.steps.some((s) => s.widget?.type === "numberLineHop"),
    `${id}: needs a numberLineHop — the only K engine rated adapt 3`);
  const wc = (t) => t.split(/\s+/).filter(Boolean).length;
  for (const s of lesson.steps) {
    if (s.kind === "concept") must(wc(s.body) <= 25, `${id}/${s.id}: concept body ${wc(s.body)} words > early cap 25`);
    const w = s.widget;
    if (!w) continue;
    if (w.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${id}/${s.id} mcq correct count`);
      must(w.options.length >= 4 && w.options[0].correct === true, `${id}/${s.id} mcq shape`);
      for (const o of w.options) must(o.feedback.length >= 25, `${id}/${s.id} feedback short`);
    }
    if (w.type === "numberLineHop") {
      const land = w.direction === "back" ? w.start - w.hop * w.hops : w.start + w.hop * w.hops;
      must(land > w.min && land < w.max, `${id}/${s.id} hop landing at the edge`);
      must(w.commonLandings.length >= 2, `${id}/${s.id} hop needs 2 traps`);
    }
    if (w.type === "tenFrame") {
      must(w.target >= 1 && w.target <= 10, `${id}/${s.id} tenFrame target`);
      must(w.commonCounts.length >= 2, `${id}/${s.id} tenFrame traps`);
    }
    if (w.type === "dragOrder") {
      const byId = new Map(w.items.map((x) => [x.id, Number(x.label)]));
      const vals = w.correctOrder.map((idd) => byId.get(idd));
      for (let i = 1; i < vals.length; i++) must(vals[i] > vals[i - 1], `${id}/${s.id} correctOrder not ascending`);
      must(w.misorderFeedback.length >= 1, `${id}/${s.id} drag needs misorder feedback`);
    }
    if (s.predict) must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${id}/${s.id} predict`);
    if (s.variant) must(REG[s.variant.gen]?.has(s.variant.form), `${id}/${s.id} ${s.variant.gen}/${s.variant.form} not registered`);
  }
  writeFileSync(join(outDir, "lessons", `${id}.json`), JSON.stringify(lesson, null, 2) + "\n");
}
must(chCount.every((c, i) => c === perChapter[i]), `chapter sizes ${chCount}`);
writeFileSync(join(outDir, "course.json"), JSON.stringify({
  id: "compare-numbers-k", slug: "compare-numbers-k", title: spec.title,
  tagline: "Pair one to one — or let the counting song decide.",
  category: "Math", gradeLevel: 0, chapters,
}, null, 2) + "\n");
console.log(`built 12 lessons; ${asserts} internal assertions all passed`);
console.log("ids:", chapters.flatMap((c) => c.lessonIds).join(" "));
