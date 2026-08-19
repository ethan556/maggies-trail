import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/sampling-and-probability/lessons";
const repairs = new Map([
  ["sp-03-02:ch1", {
    before: (widget) => widget?.type === "trialProbabilityLab" && widget.prompt?.startsWith("A spinner's theoretical probability of blue is 1/2"),
    widget: {
      type: "matchPairs",
      prompt: "Match the spinner evidence to the conclusion it supports.",
      left: [
        { id: "experimental", label: "24 blue spins out of 40" },
        { id: "theoretical", label: "a fair spinner has blue on half its area" },
        { id: "comparison", label: "experimental result compared with theoretical" },
      ],
      right: [
        { id: "threeFifths", label: "3/5" },
        { id: "oneHalf", label: "1/2" },
        { id: "oneTenthHigher", label: "1/10 higher" },
      ],
      pairs: { experimental: "threeFifths", theoretical: "oneHalf", comparison: "oneTenthHigher" },
      pairErrors: [
        { left: "experimental", right: "oneHalf", feedback: "1/2 is the theoretical chance. The observed 24/40 simplifies to 3/5." },
        { left: "theoretical", right: "threeFifths", feedback: "The fair spinner's blue area is half, so its theoretical probability is 1/2." },
        { left: "comparison", right: "oneHalf", feedback: "The two values are 3/5 and 1/2. Their difference is 1/10." },
      ],
      missFeedback: "Keep observed spins separate from the fair-spinner prediction, then compare the two fractions.",
      successFeedback: "Correct — the observed 3/5 is 1/10 higher than the theoretical 1/2.",
    },
  }],
  ["sp-04-01:i3", {
    before: (widget) => widget?.type === "numeric" && widget.prompt === "A store has 5 shirts and 4 pants. How many total outfits are possible?",
    widget: {
      type: "treeDiagram",
      prompt: "Build the branching diagram for 5 shirts and 4 pants.",
      stage1Label: "shirts",
      stage2Label: "pants",
      targetA: 5,
      targetB: 4,
      maxA: 6,
      maxB: 6,
      aStart: 1,
      bStart: 1,
      successFeedback: "20 endings — each of the 5 shirts branches to all 4 pants: 5 × 4 = 20.",
      lowFeedback: "Every shirt must branch to all 4 pants. Add the missing branches.",
      highFeedback: "The display has more branches than the 5 shirts and 4 pants describe.",
    },
  }],
  ["sp-04-01:k2", {
    before: (widget) => widget?.type === "numeric" && widget.prompt === "Flipping a coin and rolling a 6-sided die: how many total outcomes are there?",
    widget: {
      type: "mcq",
      prompt: "Which calculation counts every coin-and-die outcome exactly once?",
      options: [
        { id: "a", label: "2 × 6 = 12", correct: true, feedback: "Yes — each of 2 coin results can pair with each of 6 die results." },
        { id: "b", label: "2 + 6 = 8", feedback: "Adding counts the choices separately. Pairing every coin result with every die result multiplies." },
        { id: "c", label: "6 ÷ 2 = 3", feedback: "Division does not list the combined outcomes. There are 2 × 6 pairings." },
      ],
    },
  }],
  ["sp-04-01:k3", {
    before: (widget) => widget?.type === "numeric" && widget.prompt === "Flipping a coin 4 times: how many total outcomes are there?",
    widget: {
      type: "mcq",
      prompt: "Why do 4 coin flips make 16 possible sequences?",
      options: [
        { id: "a", label: "Each flip has 2 choices, so multiply 2 × 2 × 2 × 2.", correct: true, feedback: "Yes — every earlier sequence splits into 2 choices at the next flip, giving 16." },
        { id: "b", label: "Add the four flips: 2 + 2 + 2 + 2.", feedback: "Adding gives 8, but each new flip branches every existing sequence. Multiply the choices." },
        { id: "c", label: "There are 4 sequences because there are 4 flips.", feedback: "The number of flips is not the number of possible H/T sequences. Each flip has 2 choices." },
      ],
    },
  }],
  ["sp-04-01:ch1", {
    before: (widget) => widget?.type === "numeric" && widget.prompt === "A store has 6 shirts and 5 pants. How many total outfits are possible?",
    widget: {
      type: "matchPairs",
      prompt: "Match each independent-choice situation to its total number of outcomes.",
      left: [
        { id: "shirts", label: "6 shirts and 5 pants" },
        { id: "coinDie", label: "a coin and a 6-sided die" },
        { id: "flips", label: "3 coin flips" },
      ],
      right: [{ id: "thirty", label: "30 outcomes" }, { id: "twelve", label: "12 outcomes" }, { id: "eight", label: "8 outcomes" }],
      pairs: { shirts: "thirty", coinDie: "twelve", flips: "eight" },
      pairErrors: [
        { left: "shirts", right: "twelve", feedback: "The clothing choices multiply: 6 × 5 = 30, not 6 + 5." },
        { left: "coinDie", right: "eight", feedback: "A coin and die have 2 × 6 = 12 outcomes. Eight is for 3 coin flips." },
        { left: "flips", right: "twelve", feedback: "Three coin flips have 2 × 2 × 2 = 8 outcomes, not 12." },
      ],
      missFeedback: "Use multiplication for each independent choice: count the branches at every stage.",
      successFeedback: "Correct — multiplication counts every complete combination once.",
    },
  }],
  ["sp-04-02:i3", {
    before: (widget) => widget?.type === "mcq" && widget.prompt === "What is the probability of flipping heads and rolling an even number?",
    widget: {
      type: "matchPairs",
      prompt: "Match each independent compound event to its probability.",
      left: [
        { id: "headsEven", label: "heads and an even number" },
        { id: "tailsSix", label: "tails and a 6" },
        { id: "headsMultipleThree", label: "heads and a multiple of 3" },
      ],
      right: [{ id: "quarter", label: "1/4" }, { id: "twelfth", label: "1/12" }, { id: "sixth", label: "1/6" }],
      pairs: { headsEven: "quarter", tailsSix: "twelfth", headsMultipleThree: "sixth" },
      pairErrors: [
        { left: "headsEven", right: "sixth", feedback: "Heads is 1/2 and even is 1/2, so the product is 1/4." },
        { left: "tailsSix", right: "quarter", feedback: "Tails is 1/2 and one specific die face is 1/6, so the product is 1/12." },
        { left: "headsMultipleThree", right: "quarter", feedback: "Multiples of 3 are 2 of 6, or 1/3. With heads, 1/2 × 1/3 = 1/6." },
      ],
      missFeedback: "Find each single-event probability first, then multiply the independent probabilities.",
      successFeedback: "Correct — independent " + "and" + " events multiply.",
    },
  }],
  ["sp-04-02:k3", {
    before: (widget) => widget?.type === "fractionEntry" && widget.prompt === "What is the probability of rolling a number greater than 4 on both dice?",
    widget: {
      type: "fractionEntry",
      prompt: "Roll two fair dice. What is the probability that the first die is a 6 and the second is greater than 4?",
      answerWhole: 0,
      answerNum: 1,
      answerDen: 18,
      allowWhole: false,
      form: "any",
      unit: "",
      commonEntries: [
        { whole: 0, num: 1, den: 6, feedback: "1/6 is only the first die being a 6. Also multiply by 1/3 for the second die being greater than 4." },
        { whole: 0, num: 1, den: 3, feedback: "1/3 is only the second die being greater than 4. Also multiply by 1/6 for the first die being exactly 6." },
      ],
      fallbackFeedback: "The dice are independent: 1/6 × 1/3 = 1/18.",
      successFeedback: "Yes — 1/6 × 1/3 = 1/18.",
    },
  }],
  ["sp-04-02:ch1", {
    before: (widget) => widget?.type === "fractionEntry" && widget.prompt === "What is the probability of flipping heads and rolling an even number?",
    widget: {
      type: "mcq",
      prompt: "A coin is flipped and a fair die is rolled. What is P(heads and a multiple of 3)?",
      options: [
        { id: "a", label: "1/6", correct: true, feedback: "Yes — heads is 1/2 and multiples of 3 are 2 of 6, or 1/3. Multiply: 1/2 × 1/3 = 1/6." },
        { id: "b", label: "1/3", feedback: "1/3 is the die event only. The compound event also needs heads, so multiply by 1/2." },
        { id: "c", label: "1/12", feedback: "1/12 would use one die face. There are two multiples of 3: 3 and 6, so the die probability is 1/3." },
      ],
    },
  }],
]);

const groups = new Map();
for (const [key, repair] of repairs) {
  const [lessonId, stepId] = key.split(":");
  if (!groups.has(lessonId)) groups.set(lessonId, []);
  groups.get(lessonId).push({ key, stepId, repair });
}

let seen = 0;
let writes = 0;
for (const [lessonId, entries] of groups) {
  const file = path.join(dir, `${lessonId}.json`);
  const source = fs.readFileSync(file, "utf8");
  const lesson = JSON.parse(source);
  let changed = false;
  for (const { key, stepId, repair } of entries) {
    const step = lesson.steps?.find((candidate) => candidate.id === stepId);
    if (!step) throw new Error(`${key} is missing`);
    seen += 1;
    if (JSON.stringify(step.widget) === JSON.stringify(repair.widget)) continue;
    if (!repair.before(step.widget)) throw new Error(`${key} does not have its guarded legacy evaluator surface`);
    step.widget = repair.widget;
    changed = true;
    writes += 1;
  }
  if (changed) {
    const indent = source.match(/\n( +)"/)?.[1].length || 2;
    fs.writeFileSync(file, `${JSON.stringify(lesson, null, indent)}\n`);
  }
}

if (seen !== repairs.size) throw new Error(`expected ${repairs.size} repairs, saw ${seen}`);
if (![0, repairs.size].includes(writes)) throw new Error(`expected 0 or ${repairs.size} writes, got ${writes}`);
console.log(`S274 sampling-and-probability: ${repairs.size} guarded learner-job repairs (${writes} writes)`);
