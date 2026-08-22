import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "properties-strategies-g1", "lessons");
const CHECK = process.argv.includes("--check");

const concepts = {
  "g1p-01-01": [["as-commutative", "Four plus seven and seven plus four both make eleven. Swapping the addends keeps the same two groups."], ["bigger-first", "For three plus eight, starting at eight needs only three hops. Both orders still land on eleven."]],
  "g1p-01-02": [["koa-join-two-groups", "Joining the same two groups makes the same whole, whichever group is named first."], ["as-commutative", "The shown equation confirms the rule: four plus seven equals seven plus four."]],
  "g1p-01-03": [["bigger-first", "Starting at eight and counting on three reaches eleven with fewer hops than starting at three."], ["count-on-small", "A small add-on is easy to track: one, two, or three forward hops from four land on five, six, or seven."]],
  "g1p-01-04": [["count-on-small", "Counting on works especially well for add-ons of one, two, or three, as the three short number lines show."], ["as100-four-tools", "For larger add-ons, choose another tool: doubles, near doubles, or make ten can be easier than many hops."]],
  "g1p-01-05": [["count-back-hops", "Seven minus three means start at seven and make three backward hops to four."], ["as-count-back", "Count the backward hops, not the starting number: nine minus three lands on six."]],
  "g1p-02-01": [["doubles-mirror", "A double is the same number twice. Two matching groups of six make twelve."], ["as100-doubles", "Known doubles make a useful pattern: five plus five is ten, six plus six is twelve, and the even totals continue."]],
  "g1p-02-02": [["near-double", "Seven plus eight is double seven plus one, so fourteen becomes fifteen."], ["as100-near-doubles", "Near doubles sit one past a known double: five plus six is eleven and six plus seven is thirteen."]],
  "g1p-02-03": [["as100-near-doubles", "A near-double differs by one. Use the nearby even double, then adjust by one."], ["near-double", "The shown seven plus eight can use double seven plus one; using double eight minus one reaches the same fifteen."]],
  "g1p-02-04": [["ten-frame-make-ten", "Seven plus three fills the shown ten-frame. Completing ten creates an easy landmark."], ["make-ten-bridge", "For eight plus five, move two to fill ten and join the three left over: ten plus three is thirteen."]],
  "g1p-02-05": [["count-back-hops", "Subtract a small part by hopping backward from the whole. Seven minus three lands on four."], ["as-think-add", "Check subtraction with related addition: fifteen minus six is nine because nine plus six rebuilds fifteen."]],
  "g1p-03-01": [["fact-family", "The same three numbers make related addition and subtraction facts: eight plus five is thirteen, so thirteen minus five is eight."], ["as-fact-family", "A fact-family triangle keeps the parts and whole together: six, seven, and thirteen make four related equations."]],
  "g1p-03-02": [["add-balance-scale", "Equivalent expressions balance because they name the same amount. Six plus four and ten are equal."], ["as-equal-sign", "The equal sign means both sides have the same value, like five plus three and eight."]],
  "g1p-03-03": [["as100-four-tools", "Look at the numbers, then choose among doubles, near doubles, make ten, and count on."], ["as100-name-tool", "A strong strategy answer names the tool and shows the result it produces."]],
  "g1p-03-04": [["as100-name-tool", "Explain a strategy in order: see the fact, name the tool, then show the answer."], ["as100-choose-steps", "A complete explanation connects the situation to the operation and tells why the chosen steps preserve the amount."]],
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
  "g1p-01-01": tapChoice("Tap the equation that swaps two plus nine without changing its total.", ["2 + 9 = 9 + 2", "2 + 9 = 9 − 2", "2 + 9 = 2 + 2"], "2 + 9 = 9 + 2", "Yes — the same addends are joined in the opposite order."),
  "g1p-01-02": tapChoice("Five red counters join eight blue counters. Tap the reversed addition fact.", ["8 + 5", "8 − 5", "5 + 5"], "8 + 5", "Yes — eight plus five reverses the addends and preserves the whole."),
  "g1p-01-03": tapChoice("Start at thirteen and count on two. Tap the landing number.", [14, 15, 16], 15, "Yes — two forward counts from thirteen land on fifteen."),
  "g1p-01-04": tapChoice("Tap the add-on that is best suited to a short count-on strategy.", [2, 5, 8], 2, "Yes — adding two needs only two easy-to-track hops."),
  "g1p-01-05": tapChoice("Start at fifteen and count back two. Tap the landing number.", [12, 13, 14], 13, "Yes — two backward counts from fifteen land on thirteen."),
  "g1p-02-01": tapChoice("Seven counters are mirrored by seven more. Tap the double's total.", [12, 13, 14], 14, "Yes — seven plus seven is fourteen."),
  "g1p-02-02": tapChoice("Use double five plus one to solve five plus six. Tap the total.", [10, 11, 12], 11, "Yes — double five is ten, then one more is eleven."),
  "g1p-02-03": tapChoice("Use double nine minus one to solve nine plus eight. Tap the total.", [16, 17, 18], 17, "Yes — double nine is eighteen, then one less is seventeen."),
  "g1p-02-04": tapChoice("Seven counters are in a ten-frame. Tap how many more fill it.", [2, 3, 4], 3, "Yes — seven and three make ten."),
  "g1p-02-05": tapChoice("Fourteen loses six. Tap the part that rebuilds fourteen when six is added back.", [7, 8, 9], 8, "Yes — eight plus six rebuilds fourteen."),
  "g1p-03-01": tapChoice("In the fact family nine, six, fifteen, tap fifteen minus nine.", [5, 6, 7], 6, "Yes — nine plus six is fifteen, so fifteen minus nine is six."),
  "g1p-03-02": tapChoice("Nine plus four is rewritten as ten plus a missing part. Tap that part.", [2, 3, 4], 3, "Yes — both expressions equal thirteen."),
  "g1p-03-03": tapChoice("Tap an efficient strategy for eight plus seven.", ["near double", "count from one", "ignore seven"], "near double", "Yes — double seven plus one quickly gives fifteen."),
  "g1p-03-04": tapChoice("Tap the reason three plus nine equals nine plus three.", ["same two groups", "three disappears", "nine becomes ten"], "same two groups", "Yes — swapping preserves the two groups and their total."),
};

const prompts = {
  "g1p-01-01": { k2: "A counter starts at ten and moves four spaces forward. Where does it land?", k3: "Three plus five makes eight. Which option shows the swapped sum?", ch1: "Twelve shells join one more shell. What is the total?" },
  "g1p-01-02": { k2: "Which total matches the reversed fact nine plus four?", k3: "Start at eight and count on three. Where do you land?", ch1: "Six plus eight makes fourteen. What does eight plus six make?" },
  "g1p-01-03": { k2: "A game piece starts at five and moves four spaces forward. Where does it land?", k3: "Which method uses fewer hops for nine plus four?", ch1: "Start at fourteen and count on two. What total do you reach?" },
  "g1p-01-04": { k2: "Start at nine and make three forward hops. Where do you land?", k3: "A counter on nine moves forward once. What number is next?", ch1: "Use any efficient strategy to find six plus five." },
  "g1p-01-05": { k2: "When counting back from eleven, where does the first backward hop land?", k3: "Seven birds lose three birds. How many remain?", ch1: "A game piece moves back two spaces from seven. Where does it land?" },
  "g1p-02-01": { k2: "Two matching rows hold six counters each. How many counters are there?", k3: "A five-dot pattern is mirrored. What is the combined total?", ch1: "Two hands each show two fingers. How many fingers are shown?" },
  "g1p-02-02": { k2: "Which known double is the best anchor for four plus five?", k3: "Double three, then add one. What total do you get?", ch1: "Two rows of three counters gain one extra counter. How many are there?" },
  "g1p-02-03": { k2: "Double eight is sixteen. Take one away to solve eight plus seven. What is the total?", k3: "Double five is ten. Add one to solve six plus five. What is the total?", ch1: "Double seven is fourteen. Take one away to solve seven plus six." },
  "g1p-02-04": { k2: "Nine needs a missing part to complete ten. What is that part?", k3: "Which split of six lets six plus six complete ten first?", ch1: "Six uses four from a group of eleven to complete ten. How many remain?" },
  "g1p-02-05": { k2: "Fifteen loses nine counters. How many remain?", k3: "Which related addition fact checks sixteen minus five?", ch1: "Thirteen counters split into seven removed and a part left. How many are left?" },
  "g1p-03-01": { k2: "In the family seven, six, thirteen, what is thirteen minus seven?", k3: "Which addition fact checks eleven minus five?", ch1: "In the family seven, two, nine, what is nine minus seven?" },
  "g1p-03-02": { k2: "Three plus five balances three plus a missing number. What is missing?", k3: "Seven plus five equals five plus which number?", ch1: "Five plus five balances eight plus a missing part. What is missing?" },
  "g1p-03-03": { k2: "Which strategy is efficient for eleven plus three?", k3: "Which strategy fits seven plus five?", ch1: "Which strategy uses the fewest steps for twelve plus two?" },
  "g1p-03-04": { k2: "Which explanation names the benefit of making ten for eight plus six?", k3: "After regrouping seven plus four as ten plus one, why is the result easy to read?", ch1: "Which statement explains why moving two makes eight plus six easier?" },
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
if (CHECK && changed) throw new Error(`${changed} properties-strategies-g1 lessons are not normalized`);
console.log(JSON.stringify({ status: CHECK ? "CURRENT" : "UPDATED", lessons: files.length, changed, courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex") }, null, 2));
