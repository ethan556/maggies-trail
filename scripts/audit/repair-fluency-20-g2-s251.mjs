import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "fluency-20-g2", "lessons");
const CHECK = process.argv.includes("--check");

const concepts = {
  "f20-01-01": [["doubles-mirror", "A double joins matching groups, so a known group determines its equal partner and the combined total."], ["as100-doubles", "The doubles pattern links neighboring facts and supports quick recall without recounting every item."]],
  "f20-01-02": [["near-double", "A near double starts from two equal groups and adjusts one group by one."], ["as100-near-doubles", "A known double can be adjusted by one to solve either neighboring near-double fact."]],
  "f20-01-03": [["ten-frame-make-ten", "A partly filled ten-frame shows exactly how many more are needed to complete a full ten."], ["make-ten-bridge", "Split one addend so the first part completes ten and the remaining part joins afterward."]],
  "f20-01-04": [["teen-ten-and-more", "A teen number is one full ten together with some extra ones."], ["nwk-ten-plus-extra", "Keeping the ten together makes the extra ones easy to read as a teen number."]],
  "f20-02-01": [["as100-four-tools", "Doubles, near doubles, make ten, and count on are four efficient tools for addition facts."], ["as100-name-tool", "Fluency grows by recognizing a fact's structure and choosing a short strategy before calculating."]],
  "f20-02-02": [["make-ten-bridge", "For a sum that crosses ten, split an addend to complete ten before joining what remains."], ["as-make-ten-any", "The same make-ten bridge works for different addends because the total amount is preserved."]],
  "f20-02-03": [["doubles-mirror", "Large addition facts often sit at a known double or directly beside it."], ["as100-doubles", "The doubles pattern supplies anchors for larger addition facts."]],
  "f20-02-04": [["tens-partners", "Every subtraction from ten is determined by a pair of parts that combine to make ten."], ["as-partners-ten", "Knowing both partners of ten turns subtraction from ten into immediate fact-family recall."]],
  "f20-03-01": [["as100-break-ten", "Subtract across the benchmark in stages: remove enough to reach it, then remove the rest."], ["count-back-hops", "Purposeful backward jumps can replace repeated counting by single steps."]],
  "f20-03-02": [["as-think-add", "A subtraction fact can be solved by asking which missing addend rebuilds the whole."], ["fact-family", "The related addition equation verifies the subtraction because both use the same parts and whole."]],
  "f20-03-03": [["fact-family", "Two parts and their whole generate two addition equations and two related subtraction equations."], ["as-fact-family", "A fact-family triangle keeps the same three quantities connected while the unknown changes position."]],
  "f20-03-04": [["bar-part-whole", "A part-whole bar makes the hidden part visible as the difference between the whole and known part."], ["as-part-whole", "The missing addend and the related subtraction answer name the same unknown part."]],
  "f20-03-05": [["as100-four-tools", "Mixed addition facts call for flexible recall across doubles, make-ten, and other known structures."], ["as100-name-tool", "A fluent answer is supported by a known relationship even when the facts arrive out of order."]],
  "f20-03-06": [["fact-family", "Automatic subtraction recall is grounded in the addition family that connects both parts to the whole."], ["as-think-add", "Thinking addition provides a fast, verifiable route to an unfamiliar subtraction fact."]],
};

function tapChoice(prompt, choices, answer, successFeedback) {
  return {
    type: "tapDiagram", prompt, mode: "selectOne", canvas: { w: Math.max(3, choices.length), h: 1 },
    hotspots: choices.map((choice, index) => ({
      id: `choice-${index + 1}`, x: 18 + index * (64 / Math.max(1, choices.length - 1)), y: 50,
      label: String(choice), icon: String(choice), count: 1, correct: String(choice) === String(answer),
      feedback: String(choice) === String(answer) ? successFeedback : `${choice} does not satisfy the relationship in the prompt.`,
    })),
    missFeedback: "Use the represented quantities and relationship before choosing.", successFeedback,
  };
}

const i2 = {
  "f20-01-01": tapChoice("Two equal rows hold seven counters each. Tap their combined total.", [12, 14, 16], 14, "Yes — two groups of seven make fourteen."),
  "f20-01-02": tapChoice("Use double eight, then add one more. Tap the value of eight plus nine.", [16, 17, 18], 17, "Yes — double eight is sixteen, then one more is seventeen."),
  "f20-01-03": tapChoice("A frame shows six counters. Tap the number needed to complete ten.", [3, 4, 5], 4, "Yes — six and four complete ten."),
  "f20-01-04": tapChoice("Tap the teen number made from one ten and three ones.", [12, 13, 14], 13, "Yes — one ten and three ones make thirteen."),
  "f20-02-01": tapChoice("Tap an efficient anchor for seven plus five.", ["near double", "count from one", "ignore five"], "near double", "Yes — double six can be adjusted to find seven plus five."),
  "f20-02-02": tapChoice("Nine needs one to complete ten. Tap what remains from a group of six.", [4, 5, 6], 5, "Yes — one completes ten and five remain."),
  "f20-02-03": tapChoice("Tap the total of the largest double within twenty.", [18, 19, 20], 20, "Yes — ten plus ten is twenty."),
  "f20-02-04": tapChoice("Ten splits into three and a missing partner. Tap that partner.", [6, 7, 8], 7, "Yes — three and seven make ten."),
  "f20-03-01": tapChoice("Break sixteen minus seven at ten. Tap the amount removed after reaching ten.", [2, 3, 4], 1 + 2, "Yes — remove six to reach ten, then three more."),
  "f20-03-02": tapChoice("Five plus a missing part makes fourteen. Tap the missing part.", [8, 9, 10], 9, "Yes — five plus nine rebuilds fourteen."),
  "f20-03-03": tapChoice("In the family six, nine, fifteen, tap fifteen minus six.", [8, 9, 10], 9, "Yes — six plus nine is fifteen, so fifteen minus six is nine."),
  "f20-03-04": tapChoice("A whole of seventeen has a known part of eight. Tap the hidden part.", [8, 9, 10], 9, "Yes — eight plus nine makes seventeen."),
  "f20-03-05": tapChoice("Tap the total of seven plus eight.", [14, 15, 16], 15, "Yes — seven plus eight is fifteen."),
  "f20-03-06": tapChoice("Tap the number that joins six to make fifteen.", [7, 8, 9], 9, "Yes — six plus nine makes fifteen."),
};

const prompts = {
  "f20-01-01": { k2: "Two equal teams have eight players each. How many players are there?", k3: "Which total belongs to a pair of sevens?", ch1: "Nine is mirrored by another nine. Find the combined amount." },
  "f20-01-02": { k2: "Double four is eight. Add one more to solve four plus five.", k3: "Which total is one beyond double seven?", ch1: "Use the neighboring double to evaluate eight plus nine." },
  "f20-01-03": { k2: "Nine takes one from four to complete ten. What total results?", k3: "Split six so seven first reaches ten. Find the final sum.", ch1: "Bridge through ten to combine eight and seven." },
  "f20-01-04": { k2: "One ten and nine ones name which number?", k3: "Write the value represented by one ten with four ones.", ch1: "A full ten joins seven extra ones. What is the total?" },
  "f20-02-01": { k2: "Use a near double to combine five and six.", k3: "Count on three from eight. Where do you land?", ch1: "A pair of sixes forms which sum?" },
  "f20-02-02": { k2: "Bridge through ten to add eight and six.", k3: "Recall the double made by two sevens.", ch1: "Nine gives one to make ten. Combine the five left over." },
  "f20-02-03": { k2: "Find the neighbor just below double nine.", k3: "A full ten joins nine more. Name the total.", ch1: "Remove two from double ten to evaluate ten plus eight." },
  "f20-02-04": { k2: "Seven is one part of ten. What is the other part?", k3: "Ten loses a group of three. How many remain?", ch1: "Which partner stays after six is removed from ten?" },
  "f20-03-01": { k2: "From thirteen, remove three to reach ten and two more afterward. What remains?", k3: "Half of sixteen is removed. Find the difference.", ch1: "Take four from fourteen to reach ten, then take two more." },
  "f20-03-02": { k2: "Six plus a hidden part rebuilds thirteen. Name the hidden part.", k3: "What must join four to make thirteen?", ch1: "Seven and which partner make a whole of thirteen?" },
  "f20-03-03": { k2: "The family uses five, nine, and fourteen. Remove nine from the whole.", k3: "For parts seven and eight with whole fifteen, subtract eight.", ch1: "A family has parts four and eight. Remove eight from their whole." },
  "f20-03-04": { k2: "A whole of fifteen contains a known part of six. Find the missing part.", k3: "Eight joins an unknown part to make thirteen. What is unknown?", ch1: "The whole is sixteen and one part is nine. Name the other part." },
  "f20-03-05": { k2: "Recall the sum of six and five.", k3: "Use a known strategy to combine nine and four.", ch1: "In a mixed set, what total belongs to seven plus nine?" },
  "f20-03-06": { k2: "Which difference remains when six is removed from thirteen?", k3: "Nine is taken from seventeen. Find what is left.", ch1: "A whole of twelve loses a part of five. What remains?" },
};

function refreshNumeric(widget) {
  widget.successFeedback = `Correct — the represented quantities give ${widget.answer}.`;
  widget.fallbackFeedback = "Model the known quantities and their relationship before answering.";
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 14) throw new Error(`Expected 14 lessons, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);
  for (const [index, stepId] of ["c1", "c2"].entries()) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    const contract = concepts[lesson.id]?.[index];
    if (!step || !contract) throw new Error(`Missing concept contract ${lesson.id}/${stepId}`);
    [step.figure, step.body] = contract;
    step.narration = step.body;
  }
  const second = lesson.steps.find((entry) => entry.id === "i2");
  if (!second || !i2[lesson.id]) throw new Error(`Missing i2 contract ${lesson.id}`);
  second.body = "Use a different representation.";
  second.widget = i2[lesson.id];
  for (const [stepId, prompt] of Object.entries(prompts[lesson.id] ?? {})) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    if (!step?.widget) throw new Error(`Missing prompt target ${lesson.id}/${stepId}`);
    step.widget.prompt = prompt;
  }
  for (const step of lesson.steps) if (step.widget?.type === "numeric") refreshNumeric(step.widget);
  for (const remedial of lesson.remedials ?? []) if (remedial.check?.widget?.type === "numeric") refreshNumeric(remedial.check.widget);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) { changed += 1; if (!CHECK) await writeFile(full, after, "utf8"); }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}
if (CHECK && changed) throw new Error(`${changed} fluency-20-g2 lessons are not normalized`);
console.log(JSON.stringify({ status: CHECK ? "CURRENT" : "UPDATED", lessons: files.length, changed, courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex") }, null, 2));
