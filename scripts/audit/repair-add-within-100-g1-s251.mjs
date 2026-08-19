import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "add-within-100-g1", "lessons");
const CHECK = process.argv.includes("--check");

const conceptContracts = {
  "g1a-01-01": [
    ["as100-add-ones-39", "In 34 + 5, five ones join four ones. The three tens stay fixed, so 34 + 5 = 39."],
    ["as-hops-add", "Counting on shows the same addition: start at 5, make three one-steps, and land on 8."],
  ],
  "g1a-01-02": [
    ["as100-trade-ten", "When ten ones are made, trade them for one ten-rod. The value stays ten while the place-value form changes."],
    ["as-make-ten-13", "For 8 + 5, use 2 of the 5 to finish ten, then join the remaining 3. Ten and 3 make 13."],
  ],
  "g1a-01-03": [
    ["tno-ones-stay", "Adding one ten to 34 makes 44. The tens digit grows by one while the four ones stay fixed."],
    ["tno-add-tens-66", "Adding 40 to 26 combines two tens with four more tens. Six tens and six ones make 66."],
  ],
  "g1a-01-04": [
    ["as100-add-tens-zero", "Three tens plus four tens make seven tens. The zero ones stay zero, so 30 + 40 = 70."],
    ["tno-add-tens-85", "Tens add like small numbers: five tens plus three tens is eight tens, so 55 + 30 = 85."],
  ],
  "g1a-02-01": [
    ["tno-move-tens-digit", "On the shown 50–60–70 path, plus ten moves to the next ten and minus ten moves back. The zero ones stay fixed."],
    ["tno-ones-stay", "The example 34 + 10 = 44 shows why mental ten-more works: only the tens digit changes."],
  ],
  "g1a-02-02": [
    ["chart-down-ten", "On a hundred chart, 34 sits directly above 44. Moving down one row adds ten."],
    ["c120-ten-more-ones", "A vertical chart move keeps the ones digit: 45 and 55 both end in five, and 55 is ten more."],
  ],
  "g1a-02-03": [
    ["as-hops-add", "A number line shows addition as forward hops: three one-steps from 5 land on 8, so 5 + 3 = 8."],
    ["bigger-first", "For 3 + 8, starting at 8 needs only three hops. Starting at the larger addend is faster, and both routes land on 11."],
  ],
  "g1a-02-04": [
    ["as-make-ten-13", "Break 5 into 2 and 3: the 2 completes ten with 8, and the remaining 3 makes 13."],
    ["as100-trade-ten", "Breaking an addend does not change its value. When the pieces create ten ones, trade them for one ten."],
  ],
  "g1a-02-05": [
    ["tno-count-down-tens", "Subtracting three tens from 65 moves through 55 and 45 to 35. The ones digit stays five."],
    ["tno-move-tens-digit", "On the shown 50–60–70 path, plus ten moves one step right and minus ten moves one step left."],
  ],
  "g1a-02-06": [
    ["chart-down-ten", "The chart shows 34 directly above 44. Moving down adds ten, so reversing that move—from 44 up to 34—subtracts ten."],
    ["tno-count-down-tens", "Move upward through chart rows to count backward."],
  ],
  "g1a-03-01": [
    ["as100-four-tools", "A correct strategy preserves the amount. Doubles, near doubles, make ten, and count on are four tools that can do that."],
    ["as100-name-tool", "Explain a strategy in three steps: see the numbers, name the tool, then show the answer it produces."],
  ],
  "g1a-03-02": [
    ["bar-join", "A join story has two known parts and one whole. The bar shows 7 and 5 joining to make 12."],
    ["koa-join-two-groups", "Concrete groups tell the same story: count each part, join them, and name the new total."],
  ],
  "g1a-03-03": [
    ["koa-take-away-removal", "A take-away story begins with a whole, removes one part, and asks what remains."],
    ["bar-part-whole", "A part-whole bar can reverse the story: if the whole is 13 and one part is 6, the missing part is 7."],
  ],
  "g1a-03-04": [
    ["as100-four-tools", "Different numbers favor different tools: doubles, near doubles, make ten, or count on."],
    ["as100-choose-steps", "Choose from the relationship, not a keyword alone: joining parts suggests addition, while removing a known part suggests subtraction."],
  ],
};

function tapChoice(prompt, choices, answer, successFeedback) {
  return {
    type: "tapDiagram",
    prompt,
    mode: "selectOne",
    canvas: { w: Math.max(3, choices.length), h: 1 },
    hotspots: choices.map((choice, index) => ({
      id: `choice-${index + 1}`,
      x: 18 + index * (64 / Math.max(1, choices.length - 1)),
      y: 50,
      label: String(choice),
      icon: String(choice),
      count: 1,
      correct: String(choice) === String(answer),
      feedback: String(choice) === String(answer)
        ? successFeedback
        : `${choice} does not satisfy the quantities or relationship in the prompt.`,
    })),
    missFeedback: "Use the represented quantities and operation before choosing.",
    successFeedback,
  };
}

const i2ByLesson = {
  "g1a-01-01": tapChoice("A counter starts at 52 and counts on three. Tap its landing number.", [54, 55, 56], 55, "Yes — 52, 53, 54, 55: three counts land on 55."),
  "g1a-01-02": tapChoice("Six counters already fill part of a ten-frame. Tap how many more complete the frame.", [3, 4, 5], 4, "Yes — four empty spaces complete the ten-frame."),
  "g1a-01-03": tapChoice("Twenty-six gains four tens. Tap the number with six tens and six ones.", [56, 66, 76], 66, "Yes — 2 tens plus 4 tens is 6 tens, and the 6 ones stay fixed."),
  "g1a-01-04": tapChoice("Five tens join three tens. Tap the total number of tens.", [7, 8, 9], 8, "Yes — five tens plus three tens is eight tens."),
  "g1a-02-01": tapChoice("Tap the number that is one ten less than 73.", [53, 63, 83], 63, "Yes — one ten less changes 7 tens to 6 tens and keeps 3 ones."),
  "g1a-02-02": tapChoice("Start at 32 and move down two rows on a hundred chart. Tap the landing number.", [42, 52, 62], 52, "Yes — each row adds ten, so two rows add twenty: 32 becomes 52."),
  "g1a-02-03": tapChoice("Begin at 62 and count on four. Tap the landing number.", [65, 66, 67], 66, "Yes — four one-steps from 62 land on 66."),
  "g1a-02-04": tapChoice("Seven needs a part to complete ten. Tap that missing part.", [2, 3, 4], 3, "Yes — 7 and 3 are partners that make 10."),
  "g1a-02-05": tapChoice("Eighty-four loses two tens. Tap the result.", [54, 64, 74], 64, "Yes — subtracting two tens changes 84 to 64 and keeps the four ones."),
  "g1a-02-06": tapChoice("A chart marker moves up two rows from 54. Tap its new number.", [24, 34, 44], 34, "Yes — two rows upward subtract twenty: 54 becomes 34."),
  "g1a-03-01": tapChoice("Why can a number-line hop check a mental addition strategy?", ["same amount", "new rule", "picture only"], "same amount", "Yes — both representations preserve the same quantities and operation."),
  "g1a-03-02": tapChoice("Nine red counters join five blue counters. Tap the whole.", [13, 14, 15], 14, "Yes — the two parts join: 9 + 5 = 14."),
  "g1a-03-03": tapChoice("Seventeen frogs begin at a pond and seven leave. Tap how many remain.", [9, 10, 11], 10, "Yes — 17 − 7 = 10 frogs remain."),
  "g1a-03-04": tapChoice("Which strategy is especially efficient for 9 + 6?", ["make ten", "count from one", "ignore ones"], "make ten", "Yes — move 1 from 6 to make 10, then add the remaining 5."),
};

const promptRepairs = {
  "g1a-01-01": { k2: "A counter is on 5 and moves forward 2 spaces. What number does it reach?", k3: "Mia has 4 cubes and adds 2 more. How many cubes does she have now?", ch1: "Which total proves that counting on two from 6 is correct?" },
  "g1a-01-02": { k2: "After 6 uses 4 from a group of 10 to make a ten, how many remain unused?", k3: "A group of 4 gives 3 counters to help 7 make ten. How many remain?", ch1: "Eight needs 2 counters from a group of 3. How many stay in the group?" },
  "g1a-01-03": { k2: "A 19-bead train gains three tens. What is its new number?", k3: "Four tens and four ones gain three more tens. What number is built?", ch1: "Seven tens join two tens. What number do they make?" },
  "g1a-01-04": { k2: "Six tens and five ones gain two tens. What number results?", k3: "What is ten more than 53?", ch1: "A box has 49 tiles and receives 30 more. How many tiles are there?" },
  "g1a-02-01": { k2: "What number has one fewer ten than 62?", k3: "Move the tens digit of 25 up by one. What number results?", ch1: "A counter at 72 moves back one ten. Where does it land?" },
  "g1a-02-02": { k2: "What number lies two chart rows below 78?", k3: "Keep 7 ones and increase 7 tens by 2 tens. What number results?", ch1: "A chart marker moves two rows down from 22. Where does it land?" },
  "g1a-02-03": { k2: "Which number is one more than 9?", k3: "Start with 9 and add two one-steps. Where do you land?", ch1: "A game piece on 7 moves forward one space. What number does it reach?" },
  "g1a-02-04": { k2: "To make ten from 8, use 2 of 4 counters. How many stay aside?", k3: "To make ten from 7, use 3 of 4 counters. How many remain unused?", ch1: "To make ten from 8, take 2 from a group of 3. How many stay in that group?" },
  "g1a-02-05": { k2: "What number is one ten less than 86?", k3: "Which number is one ten more than 39?", ch1: "A counter at 73 moves forward ten spaces. Where does it land?" },
  "g1a-02-06": { k2: "What number sits one chart row above 33?", k3: "Which number is one chart row below 83?", ch1: "Move one row up from 44. What number do you reach?" },
  "g1a-03-01": { k2: "Mia counts on 8 from 3. Which landing number confirms the strategy?", k3: "Which total makes 7 + 3 true?", ch1: "Which result should both a drawing and count-on model show for 8 + 5?" },
  "g1a-03-02": { k2: "Nine red counters join five blue counters. What whole is formed?", k3: "Two equal groups of seven counters combine. What total is made?", ch1: "A tray holds 7 red and 7 blue counters. What number labels the whole tray?" },
  "g1a-03-03": { k2: "Seventeen frogs start at a pond; seven leave. How many remain?", k3: "Nineteen frogs start; only three leave. What remains?", ch1: "Eighteen frogs split into 6 that leave and the rest that stay. How many stay?" },
  "g1a-03-04": { k2: "Which related addition equation reveals the missing part in 11 − 8?", k3: "Select the fact-family equation that proves 14 − 6.", ch1: "Nine plus which missing part reconstructs 13?" },
};

function refreshNumericFeedback(widget) {
  const answer = widget.answer;
  const expression = String(widget.prompt).match(/(\d+)\s*([+−-])\s*(\d+)/);
  widget.successFeedback = expression
    ? `Correct — ${expression[1]} ${expression[2] === "-" ? "−" : expression[2]} ${expression[3]} = ${answer}.`
    : `Correct — the represented quantities give ${answer}.`;
  widget.fallbackFeedback = expression
    ? "Represent the two numbers, apply the shown operation, and check the result."
    : "Model the known quantities and their relationship before answering.";
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 14) throw new Error(`Expected 14 lessons, found ${files.length}`);

let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);
  const contracts = conceptContracts[lesson.id];
  if (!contracts) throw new Error(`Missing concept contract for ${lesson.id}`);

  for (const [index, stepId] of ["c1", "c2"].entries()) {
    const step = lesson.steps.find((candidate) => candidate.id === stepId);
    if (!step || step.kind !== "concept") throw new Error(`Missing ${lesson.id}/${stepId}`);
    const [figure, body] = contracts[index];
    step.figure = figure;
    step.body = body;
    step.narration = body;
  }

  const i2 = lesson.steps.find((step) => step.id === "i2");
  if (!i2?.widget) throw new Error(`Missing ${lesson.id}/i2`);
  i2.body = "Use a different representation.";
  i2.widget = i2ByLesson[lesson.id];
  if (!i2.widget) throw new Error(`Missing i2 contract for ${lesson.id}`);

  for (const [stepId, prompt] of Object.entries(promptRepairs[lesson.id] ?? {})) {
    const step = lesson.steps.find((candidate) => candidate.id === stepId);
    if (!step?.widget?.prompt) throw new Error(`Missing ${lesson.id}/${stepId} prompt`);
    step.widget.prompt = prompt;
  }

  for (const step of lesson.steps) {
    if (step.widget?.type === "numeric") refreshNumericFeedback(step.widget);
  }
  for (const remedial of lesson.remedials ?? []) {
    if (remedial.check?.widget?.type === "numeric") refreshNumericFeedback(remedial.check.widget);
  }

  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}

if (CHECK && changed) throw new Error(`${changed} add-within-100-g1 lessons are not normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED",
  lessons: files.length,
  changed,
  courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex"),
}, null, 2));
