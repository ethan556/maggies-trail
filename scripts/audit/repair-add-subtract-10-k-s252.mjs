import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "add-subtract-10-k", "lessons");
const CHECK = process.argv.includes("--check");

const concepts = {
  "koa-03-01": [["koa-act-out-a-join", "An add-to story begins with a group and shows more joining it."], ["koa-addition-sentence", "The starting group and added group combine, so the unknown is the new total."]],
  "koa-03-02": [["koa-take-away-removal", "A take-from story begins with a group and shows part of it leaving."], ["koa-subtraction-sentence", "The starting group and removed part are known, so the unknown is what remains."]],
  "koa-03-03": [["koa-join-two-groups", "A put-together story names separate parts that combine to form a whole."], ["bar-part-whole", "A part-whole model shows that nothing changes; the parts are simply counted together."]],
  "koa-03-04": [["koa-addition-sentence", "A growing group calls for addition because the change makes the amount larger."], ["koa-subtraction-sentence", "A shrinking group calls for subtraction because the change makes the amount smaller."]],
  "koa-03-05": [["koa-add-with-drawing", "A complete story drawing shows the starting objects and the change that happens."], ["koa-subtraction-cross-out", "Marks that join or cross out objects make the story's action visible."]],
  "koa-03-06": [["ten-frame-make-ten", "Small sums can be organized on a frame so their parts and total are visible at once."], ["tens-partners", "Repeated practice links each pair of parts to its total for quick recall."]],
  "koa-03-07": [["koa-count-back-left", "A subtraction fact shows a whole, a removed part, and the part left behind."], ["fact-family", "Related addition and subtraction facts use the same parts and whole."]],
  "koa-03-08": [["count-on-small", "Adding a single item moves forward to the next counting number."], ["count-back-hops", "Removing a single item moves backward to the counting number before."]],
  "koa-03-09": [["as-add-zero", "Adding zero leaves a group unchanged because no objects join it."], ["pra-subtract-zero", "Subtracting zero leaves a group unchanged because no objects are removed."]],
  "koa-03-10": [["as100-four-tools", "Mixed facts require recognizing whether the group joins, separates, or stays unchanged."], ["fact-family", "Fluent recall remains grounded in the relationships among parts and whole."]],
};

function tapChoice(prompt, choices, answer, successFeedback) {
  return {
    type: "tapDiagram", prompt, mode: "selectOne", canvas: { w: Math.max(3, choices.length), h: 1 },
    hotspots: choices.map((choice, index) => ({
      id: `choice-${index + 1}`, x: 18 + index * (64 / Math.max(1, choices.length - 1)), y: 50,
      label: String(choice), icon: String(choice), count: 1, correct: String(choice) === String(answer),
      feedback: String(choice) === String(answer) ? successFeedback : `${choice} does not match the story or relationship.`,
    })),
    missFeedback: "Model the starting amount and the change before choosing.", successFeedback,
  };
}

const i2 = {
  "koa-01-05": tapChoice("Tap the sentence that records four blocks joining three blocks.", ["4 + 3 = 7", "4 − 3 = 1", "4 + 3 = 6"], "4 + 3 = 7", "Yes — four plus three equals seven."),
  "koa-03-03": tapChoice("A bowl has five red grapes and two green grapes. Tap the whole.", [6, 7, 8], 7, "Yes — the two parts combine to make seven grapes."),
  "koa-03-06": tapChoice("Tap the partner that joins one to make five.", [3, 4, 5], 4, "Yes — one plus four makes five."),
  "koa-03-07": tapChoice("Five loses two. Tap the part that remains.", [2, 3, 4], 3, "Yes — five minus two leaves three."),
};

const prompts = {
  "koa-01-02": { k2: "Two hands each show three raised fingers. Find the total raised.", k3: "A full hand and one extra finger are raised. How many are up?", ch1: "One hand shows two fingers and the other shows four. Count them all." },
  "koa-01-03": { k2: "A drawing has five circles, then gains three more. Count the finished drawing.", k3: "Three circles are drawn before four more join them. What is the total?", ch1: "A sketch begins with six circles and adds a pair. How many circles appear?" },
  "koa-01-04": { k2: "Four children are playing and another group of four joins. Find the new group size.", k3: "A group of six gains three children. How many are playing now?", ch1: "Two children are joined by six others. Count the whole group." },
  "koa-01-05": { k2: "Five blocks join four blocks. How many blocks form the whole?", k3: "Birds are joined by six more. Which addition sentence records the event?", ch1: "Four apples combine with three apples. Find the total number of apples." },
  "koa-03-01": { k2: "Five blocks are in a basket before two more enter. Find the new total.", k3: "A basket begins with two bears and receives six more. How many bears are there?", ch1: "Six apples are joined by three apples. Count the basket now." },
  "koa-03-02": { k2: "Nine blocks are in a basket before four leave. Find the remainder.", k3: "Seven bears lose a pair. How many bears stay?", ch1: "Half of ten apples are removed. Count what remains." },
  "koa-03-03": { k2: "Five red grapes and two green grapes make one bowl. Count the whole.", k3: "A bowl combines four red grapes with five green grapes. Find the total.", ch1: "Six red grapes sit beside three green grapes. How many grapes are present?" },
  "koa-03-04": { k2: "Ducks leave a pond. Which operation finds how many stay?", k3: "More ducks swim into a pond. Which operation finds the new total?", ch1: "A pair of ducks flies away. Which operation models the change?" },
  "koa-03-05": { k2: "Cats begin on a wall and some jump down. Which drawing shows both actions?", k3: "A cat leaves a small group on a wall. Choose the matching drawing.", ch1: "Several cats sit before some jump down. Which picture preserves the story?" },
  "koa-03-06": { k2: "Recall the total made by one and four.", k3: "Which sum belongs to three and two?", ch1: "Combine one with a group of three. What total results?" },
  "koa-03-07": { k2: "Remove one from a group of four. What remains?", k3: "Five loses a pair. Find the difference.", ch1: "A group of three loses one item. Count the rest." },
  "koa-03-08": { k2: "Step backward once from nine. Where do you land?", k3: "Move forward once from three. Name the next number.", ch1: "Take one away from seven. Which number comes before it?" },
  "koa-03-09": { k2: "A group of four loses nothing. How many stay?", k3: "Nothing joins a group of nine. What is the unchanged total?", ch1: "Seven objects have none removed. How many remain?" },
  "koa-03-10": { k2: "Recall the difference when one leaves five.", k3: "Combine one and two without counting from the start.", ch1: "Remove three from four and name the remainder." },
};

function refreshNumeric(widget) {
  widget.successFeedback = `Correct — the represented quantities give ${widget.answer}.`;
  widget.fallbackFeedback = "Model the known groups and the change before answering.";
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 20) throw new Error(`Expected 20 lessons, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);
  if (concepts[lesson.id]) for (const [index, stepId] of ["c1", "c2"].entries()) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    const contract = concepts[lesson.id][index];
    if (!step) throw new Error(`Missing concept ${lesson.id}/${stepId}`);
    [step.figure, step.body] = contract;
    step.narration = step.body;
  }
  if (i2[lesson.id]) {
    const step = lesson.steps.find((entry) => entry.id === "i2");
    if (!step) throw new Error(`Missing i2 ${lesson.id}`);
    step.body = "Use a different representation.";
    step.widget = i2[lesson.id];
  }
  for (const [stepId, prompt] of Object.entries(prompts[lesson.id] ?? {})) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    if (!step?.widget) throw new Error(`Missing prompt target ${lesson.id}/${stepId}`);
    step.widget.prompt = prompt;
  }
  for (const step of lesson.steps) if (step.widget?.type === "numeric") refreshNumeric(step.widget);
  for (const route of lesson.remedials ?? []) if (route.check?.widget?.type === "numeric") refreshNumeric(route.check.widget);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) { changed += 1; if (!CHECK) await writeFile(full, after, "utf8"); }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}
if (CHECK && changed) throw new Error(`${changed} add-subtract-10-k lessons are not normalized`);
console.log(JSON.stringify({ status: CHECK ? "CURRENT" : "UPDATED", lessons: files.length, changed, courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex") }, null, 2));
