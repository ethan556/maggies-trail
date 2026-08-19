import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const DIR = path.join(process.cwd(), "content", "courses", "add-subtract-20", "lessons");
const CHECK = process.argv.includes("--check");
const EXCLUDED = "as-04-01";

const PROMPTS = {
  "as-01-01": {
    k1: "First predict the sum 5 + 2. Then verify it on the line: begin at 5, take 2 forward hops, and tap your prediction.",
  },
  "as-01-02": {
    ch1: "Mia has 8 counters and gets 2 more. Enter her new total without counting from 1.",
  },
  "as-01-03": {
    k3: "A learner starts at 4 for 4 + 7 and takes 7 hops. Use the shorter route from 7 instead. What is the sum?",
  },
  "as-02-01": {
    i2: "The frame must total 10. It already shows 3 dots. Add the missing partner to complete it.",
    k2: "A ten-frame has 6 filled cells. How many cells are still empty?",
  },
  "as-02-03": {
    k2: "Move 2 from the 6 to complete a ten. You now have 10 and 4 left. What total do they make?",
  },
  "as-02-04": {
    k2: "After 9 takes 1 from 6, the parts are 10 and 5. Recombine the parts. What total do they make?",
  },
  "as-03-01": {
    i2: "Ten birds are on a wire. Model 3 flying away: begin at 10, make 3 backward hops, and tap the number left.",
    k2: "Eight counters are shown. Cover 5 of them. How many remain?",
    ch1: "Sam says 10 − 3 = 13 because he added. Enter the correct amount after taking 3 away.",
  },
  "as-03-02": {
    i2: "Use the number line to check 10 − 4. Begin at 10, move 4 spaces left, and tap the result.",
    k2: "Which number plus 5 rebuilds 7? Enter the missing addend.",
    ch1: "Nia says 12 − 4 = 9 after only 3 backward counts. Enter the result after all 4 counts.",
  },
  "as-03-03": {
    i2: "Compare 10 and 6 on the number line. Begin at 6, count the hops needed to reach 10, and tap the larger endpoint.",
    k2: "Six cubes are in one tower and 10 in another. How many cubes taller is the second tower?",
    ch1: "A shelf has 12 books and another has 8. How many extra books are on the first shelf?",
  },
  "as-03-04": {
    i2: "Verify 12 − 3 on the line: predict the result, then begin at 12 and make 3 backward hops. Tap your prediction.",
    k2: "Complete the related addition: ? + 6 = 15. Enter the missing number.",
    ch1: "A learner claims ? + 6 = 14 has ? = 7. Enter the value that makes the equation true.",
  },
  "as-04-02": {
    ch1: "The left side 8 + 2 has value 10. What number makes 7 + ? have the same value?",
  },
  "as-04-03": {
    k3: "There are 8 birds on a branch. Some arrive, making 13. How many birds arrived?",
  },
  "as-05-03": {
    i2: "Use a number-line gap to compare 14 and 6. Start at 6, make 8 forward hops, and tap the larger number.",
  },
};

function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found?.widget) throw new Error(`${lesson.id}: missing widget step ${id}`);
  return found;
}

function evaluatorSeal(lesson) {
  return JSON.stringify(lesson.steps.filter((candidate) => candidate.widget).map((candidate) => {
    const widget = structuredClone(candidate.widget);
    delete widget.prompt;
    return [candidate.id, widget];
  }));
}

function normalizedPrompt(prompt) {
  return String(prompt ?? "").trim().toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ");
}

function repairLesson(lesson) {
  const prompts = PROMPTS[lesson.id];
  if (!prompts) return;
  for (const [stepId, prompt] of Object.entries(prompts)) step(lesson, stepId).widget.prompt = prompt;
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 17) throw new Error(`expected 17 course lessons, found ${files.length}`);
if (PROMPTS[EXCLUDED]) throw new Error(`${EXCLUDED} must remain outside this packet`);

let changed = 0;
const packetHashes = [];
for (const file of files) {
  const full = path.join(DIR, file);
  const before = fs.readFileSync(full, "utf8");
  const lesson = JSON.parse(before);
  const stableIds = JSON.stringify(lesson.steps.map((candidate) => candidate.id));
  const semanticBefore = JSON.stringify(lesson);
  const evaluators = evaluatorSeal(lesson);
  repairLesson(lesson);
  const semanticChanged = JSON.stringify(lesson) !== semanticBefore;
  if (JSON.stringify(lesson.steps.map((candidate) => candidate.id)) !== stableIds) throw new Error(`${lesson.id}: stable step IDs changed`);
  if (evaluatorSeal(lesson) !== evaluators) throw new Error(`${lesson.id}: evaluator contract changed beyond prompt wording`);
  if (Object.hasOwn(PROMPTS, lesson.id)) {
    const templates = lesson.steps.filter((candidate) => candidate.widget).map((candidate) => normalizedPrompt(candidate.widget.prompt));
    if (new Set(templates).size !== templates.length) throw new Error(`${lesson.id}: normalized prompt duplication remains`);
  }
  const owned = Object.hasOwn(PROMPTS, lesson.id);
  const eol = before.includes("\r\n") ? "\r\n" : "\n";
  const serialized = `${JSON.stringify(lesson, null, 2)}\n`.replace(/\n/g, eol);
  const after = owned && semanticChanged ? serialized : before;
  if (lesson.id === EXCLUDED && after !== before) throw new Error(`${EXCLUDED}: excluded dirty file was altered`);
  if (owned) packetHashes.push(`${file}\0${serialized.replace(/\r\n/g, "\n")}`);
  if (after.replace(/\r\n/g, "\n") !== before.replace(/\r\n/g, "\n")) {
    changed += 1;
    if (!CHECK) fs.writeFileSync(full, after);
  }
}

if (CHECK && changed) throw new Error(`${changed} owned lesson files need repair`);
const packetSeal = createHash("sha256").update(packetHashes.join("\n")).digest("hex");
console.log(`${CHECK ? "CHECK" : "REPAIR"} add-subtract-20 P1 progression: ${changed ? `${changed} owned lessons need repair` : "CURRENT"}; 13 source closures; 1 excluded dirty row; packet seal ${packetSeal}`);
