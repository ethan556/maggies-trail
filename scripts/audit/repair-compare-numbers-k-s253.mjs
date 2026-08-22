import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "compare-numbers-k", "lessons");
const CHECK = process.argv.includes("--check");

const concepts = {
  "kcm-01-01": ["kc-fewer", "khm-paired-groups-leftover"],
  "kcm-01-02": ["khm-paired-groups-leftover", "kc-fewer"],
  "kcm-01-03": ["khm-one-more-compare", "kc-fewer"],
  "kcm-01-04": ["kc-fewer", "kc-greater"],
  "kcm-02-01": ["khm-any-order-same-total", "khm-paired-groups-leftover"],
  "kcm-02-02": ["khm-paired-groups-leftover", "kc-fewer"],
  "kcm-02-03": ["kc-greater", "kc-fewer"],
  "kcm-02-04": ["kc-greater", "kc-count-on"],
  "kcm-03-01": ["kc-fewer", "kc-greater"],
  "kcm-03-02": ["khm-any-order-same-total", "khm-any-order-same-total"],
  "kcm-03-03": ["kc-order", "kc-greater"],
  "kcm-03-04": ["kc-order", "kc-greater"],
};

const conceptText = {
  "kcm-01-01": [
    "Three mats are fewer than five cats. Pairing one mat with one cat leaves two cats unmatched, so five is more and three is fewer.",
    "Six grapes pair with six of Ben's seven grapes. One extra grape proves seven is one more than six.",
  ],
  "kcm-01-02": [
    "Pair six grapes with six of Ben's seven grapes. The one unmatched grape shows which group has more.",
    "Line up three mats with three of five cats. Two cats remain, so the rows do not match exactly.",
  ],
  "kcm-01-03": [
    "Every one of Ana's six grapes has a partner, and Ben has one grape left. Seven is the bigger group.",
    "The row of five has two more objects than the row of three, so five is bigger.",
  ],
  "kcm-01-04": [
    "The row of three runs out while two objects remain in the row of five. Three is the smaller group.",
    "On the counting line, six comes before nine. Six is less and nine is greater.",
  ],
  "kcm-02-01": [
    "The same five objects still make five when their order changes. A different arrangement does not change the number.",
    "Equal groups make one-to-one pairs with nothing left. A leftover would prove that the groups were not equal.",
  ],
  "kcm-02-02": [
    "Pair objects one to one instead of judging the space they fill. An unmatched object identifies the larger group.",
    "A spread-out row can look larger, but three objects are still fewer than five. Compare the objects, not the space.",
  ],
  "kcm-02-03": [
    "Count both groups. The number nine comes after six on the counting line, so nine names the larger group.",
    "Counting gives three in one row and five in the other. Five is more because two objects remain after pairing.",
  ],
  "kcm-02-04": [
    "A number reached later in the counting sequence is greater. Nine comes after six, so 9 is greater than 6.",
    "Counting on moves to greater numbers. Starting at four and counting two more lands on six.",
  ],
  "kcm-03-01": [
    "A number reached earlier in the count is less. Three is fewer than five, so 3 is less than 5.",
    "Six appears before nine on the number line. That makes 6 less than 9.",
  ],
  "kcm-03-02": [
    "Five toys are still five toys when they are rearranged. The kind, size, and order of the objects do not change the count.",
    "Count each group once. If both counts end at five, the groups have the same number even when they look different.",
  ],
  "kcm-03-03": [
    "Put numbers in counting order from smallest to greatest: 2, then 5, then 8.",
    "A number line confirms the order: six comes before nine, so 6 is the smaller number.",
  ],
  "kcm-03-04": [
    "In the ordered set 2, 5, 8, the first number is least and the last number is greatest.",
    "Use counting order to compare every candidate. A number later than all the others is greatest.",
  ],
};

const tenFrameRepairs = {
  "kcm-01-01": { prompt: "Four bears wait. Build a group with FEWER counters than bears.", target: 3, reference: 4, relation: "fewer" },
  "kcm-01-02": { prompt: "Four shells have partners. Build six pebbles, then notice the two unmatched pebbles.", target: 6, reference: 4, relation: "more" },
  "kcm-01-03": { prompt: "Six buttons wait. Build the smallest counter group that is still bigger.", target: 7, reference: 6, relation: "more" },
  "kcm-01-04": { prompt: "Eight blocks wait. Build a smaller group with six counters.", target: 6, reference: 8, relation: "fewer" },
  "kcm-02-01": { prompt: "Four cups wait. Build exactly four counters so every cup has one partner.", target: 4, reference: 4, relation: "same" },
  "kcm-02-02": { prompt: "A spread-out row has seven shells. Build its count before comparing its spacing.", target: 7, reference: 5, relation: "more" },
  "kcm-02-03": { prompt: "One group counts to five. Build the other group to seven, then compare the last numbers.", target: 7, reference: 5, relation: "more" },
  "kcm-03-02": { prompt: "Six feathers are scattered. Build six pebbles to prove the amount is the same.", target: 6, reference: 6, relation: "same" },
};

const hopRepairs = {
  "kcm-02-04": { start: 5, hop: 1, hops: 3, direction: "forward", prompt: "Start at 5 and make three one-steps. Tap the greater landing.", min: 3, max: 10 },
  "kcm-03-01": { start: 15, hop: 1, hops: 2, direction: "back", prompt: "Start at 15 and hop back twice. Tap the smaller landing.", min: 10, max: 18 },
  "kcm-03-03": { start: 5, hop: 1, hops: 4, direction: "forward", prompt: "Start at 5 and make four one-steps. Use the landing to extend the ordered list.", min: 3, max: 11 },
  "kcm-03-04": { start: 16, hop: 1, hops: 4, direction: "back", prompt: "Start at 16 and hop back four times. Tap the least landing reached.", min: 9, max: 19 },
};

const promptRepairs = {
  "kcm-01-01": { ch1: "Nia says 5 stars are more than 6 hearts. Which pairing check repairs her claim?" },
  "kcm-01-02": { ch1: "Eight stars make eight one-to-one pairs with eight hearts. What does that prove?" },
  "kcm-01-03": { ch1: "A spaced-out group of 8 looks bigger than a tight group of 10. Which method settles the comparison?" },
  "kcm-01-04": { ch1: "A learner calls 8 the smaller group when it is paired with 6. Which observation corrects the error?" },
  "kcm-02-01": { ch1: "Four drums pair exactly with four sticks. Which statement describes the result?" },
  "kcm-02-02": { ch1: "Two rows fill different amounts of space. What evidence should decide which row has more objects?" },
  "kcm-03-01": { k1: "Use one back-step from 18 to identify its smaller neighbour." },
  "kcm-03-03": { k3: "Repair the mixed number cards by dragging them from least to greatest." },
};

function setTenFrame(widget, repair) {
  widget.prompt = repair.prompt;
  widget.target = repair.target;
  widget.preFilled = 0;
  const relationText = repair.relation === "same"
    ? `${repair.target} counters pair exactly with ${repair.reference}; nothing is left.`
    : `${repair.target} is ${repair.relation} than ${repair.reference}.`;
  widget.commonCounts = [
    { count: repair.reference, feedback: repair.relation === "same" ? `That matches the target count, but rebuild it carefully to check every pair.` : `${repair.reference} matches the reference, so it is not ${repair.relation}.` },
    { count: Math.max(0, repair.target - 1), feedback: `That count is one short of the target ${repair.target}. Count each object once.` },
  ];
  widget.missFeedback = `Build exactly ${repair.target}, then compare it with ${repair.reference}.`;
  widget.successFeedback = `Correct — ${relationText}`;
}

function setHop(widget, repair) {
  Object.assign(widget, repair);
  const sign = repair.direction === "back" ? -1 : 1;
  const landing = repair.start + sign * repair.hop * repair.hops;
  widget.commonLandings = [
    { value: repair.start, feedback: `That is the starting number. Complete all ${repair.hops} hops.` },
    { value: landing + sign, feedback: `That is one hop beyond ${landing}. Stop after exactly ${repair.hops} hops.` },
  ];
  widget.missFeedback = `Move ${repair.direction === "back" ? "back" : "forward"} ${repair.hops} hops from ${repair.start}.`;
  widget.successFeedback = `${landing} — the complete hop path lands on the requested ${repair.direction === "back" ? "smaller" : "greater"} number.`;
  widget.lowFeedback = `Check the start, direction, and number of hops before choosing the landing.`;
  widget.highFeedback = `Check the start, direction, and number of hops before choosing the landing.`;
}

function replaceMcq(step, prompt, labels, feedback) {
  step.widget.prompt = prompt;
  for (let index = 0; index < step.widget.options.length; index += 1) {
    step.widget.options[index].label = labels[index];
    step.widget.options[index].feedback = feedback[index];
  }
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 12) throw new Error(`Expected 12 lessons, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);

  for (const [index, stepId] of ["c1", "c2"].entries()) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    if (!step) throw new Error(`Missing ${lesson.id}/${stepId}`);
    step.figure = concepts[lesson.id][index];
    step.body = conceptText[lesson.id][index];
    step.narration = conceptText[lesson.id][index];
  }

  const i2 = lesson.steps.find((entry) => entry.id === "i2");
  if (!i2?.widget) throw new Error(`Missing ${lesson.id}/i2`);
  i2.body = "Try a different comparison job.";
  if (tenFrameRepairs[lesson.id]) setTenFrame(i2.widget, tenFrameRepairs[lesson.id]);
  else if (hopRepairs[lesson.id]) setHop(i2.widget, hopRepairs[lesson.id]);
  else throw new Error(`No i2 repair for ${lesson.id}`);

  for (const [stepId, prompt] of Object.entries(promptRepairs[lesson.id] ?? {})) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    if (!step?.widget) throw new Error(`Missing ${lesson.id}/${stepId}`);
    step.widget.prompt = prompt;
  }

  if (lesson.id === "kcm-02-04") {
    const k3 = lesson.steps.find((entry) => entry.id === "k3");
    setHop(k3.widget, { start: 6, hop: 1, hops: 3, direction: "forward", prompt: "Begin at 6 and take three steps. Which greater number is the landing?", min: 4, max: 12 });
  }
  if (lesson.id === "kcm-03-01") {
    replaceMcq(lesson.steps.find((entry) => entry.id === "k3"), "Why is 8 greater than 6?", ["8 comes later than 6", "8 has more curved lines", "8 sounds like the word great", "6 actually comes after 8"], [
      "Correct — each later count adds one, so 8 names more than 6.",
      "A numeral's drawn shape does not decide the amount it names.",
      "A word sound does not decide which number is greater.",
      "Count aloud: 6 comes first, then 7, then 8.",
    ]);
  }
  if (lesson.id === "kcm-03-03") {
    const k3 = lesson.steps.find((entry) => entry.id === "k3");
    k3.widget.successFeedback = "7, 8, 9, 10 — the cards now run from least to greatest.";
  }
  if (lesson.id === "kcm-03-04") {
    const k3 = lesson.steps.find((entry) => entry.id === "k3");
    setHop(k3.widget, { start: 18, hop: 1, hops: 3, direction: "back", prompt: "Start at 18 and take three back-steps. Which lesser number is the landing?", min: 12, max: 21 });
  }

  if (lesson.id === "kcm-01-03" || lesson.id === "kcm-02-02") {
    const stepId = lesson.id === "kcm-01-03" ? "k2" : "k1";
    replaceMcq(lesson.steps.find((entry) => entry.id === stepId), "When is a quick visual estimate most reliable?", [
      "When one group is clearly larger",
      "When one group uses larger objects",
      "When one group is spread farther",
      "When the groups use different objects",
    ], [
      "Correct — an obvious gap can support a quick estimate, and pairing or counting can confirm it.",
      "Object size can mislead; comparison is about how many objects there are.",
      "Spacing can mislead; a spread-out group can contain fewer objects.",
      "Different kinds of objects can still be paired and counted fairly.",
    ]);
  }
  if (lesson.id === "kcm-02-04") {
    replaceMcq(lesson.steps.find((entry) => entry.id === "k1"), "Why is 8 greater than 6?", ["8 comes later than 6", "8 has more curved lines", "8 sounds like the word great", "6 actually comes after 8"], [
      "Correct — every later counting step adds one, so 8 names more than 6.",
      "A numeral's drawn shape does not decide the amount it names.",
      "A word sound does not decide which number is greater.",
      "Count aloud: 6 comes first, then 7, then 8.",
    ]);
  }

  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}

if (CHECK && changed) throw new Error(`${changed} compare-numbers-k lessons are not normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED",
  lessons: files.length,
  changed,
  illustrationSourceClosures: 24,
  progressionSourceClosures: 12,
  choiceSourceClosures: 4,
  courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex"),
}, null, 2));
