import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const DIR = path.join(process.cwd(), "content", "courses", "add-subtract-100", "lessons");
const CHECK = process.argv.includes("--check");
const EXCLUDED = "as100-03-04";

const PROMPTS = {
  "as100-01-01": {
    k2: "Use a known double: what total is made by two groups of 7?",
  },
  "as100-01-02": {
    k2: "Double 8 is 16. What is one more for the near double 8 + 9?",
    ch1: "A domino has 5 dots on one side and 6 on the other. How many dots are there altogether?",
  },
  "as100-01-03": {
    k2: "Move 1 from the 5 to complete 10 with 9. Recombine 10 and the 4 left. What total do you get?",
    ch1: "A learner says 8 + 9 = 16 because they stopped at double 8. Enter the corrected near-double total.",
  },
  "as100-02-01": {
    k2: "Four tens are doubled. How many ones are in the resulting 8 tens?",
    k3: "A box holds 6 bundles of ten and another holds 3 bundles of ten. Which total combines both boxes?",
    ch1: "Six tens and 4 tens combine to make 10 tens. How many ones is that?",
  },
  "as100-02-02": {
    k2: "The number 23 has 3 ones. Add 4 single ones while keeping its 2 tens. What number results?",
    k3: "The number 62 gets 7 more single counters. Which total keeps the 6 tens unchanged?",
    ch1: "Write 71 as 7 tens and 1 one, then add 8 ones. What number do you build?",
  },
  "as100-02-03": {
    k2: "Split 35 and 42 by place, combine the tens, then combine the ones. What total do you build?",
    ch1: "A learner adds all four digits in 61 + 27 and writes 16. Enter the correct place-value total.",
  },
  "as100-02-04": {
    k2: "The ones in 48 + 36 make 14. Trade 10 ones for a ten, then enter the standard-form total.",
    ch1: "A learner writes 316 for 29 + 17 by placing 16 ones beside 3 tens. Trade the ones and enter the corrected total.",
  },
  "as100-03-01": {
    k2: "Start with 10 tens and remove 5 tens. How many ones remain?",
    k3: "Eight bundles of ten lose 2 bundles of ten. Which amount remains?",
    ch1: "Six tens minus 4 tens leaves 2 tens. How many ones is that?",
  },
  "as100-03-02": {
    k2: "The number 47 has 7 ones. Remove 3 single ones while keeping its 4 tens. What remains?",
    k3: "The number 96 loses 4 single ones. Which result keeps its 9 tens unchanged?",
    ch1: "A learner subtracts 4 tens from 65, but only 4 ones should leave. Enter the corrected result.",
  },
  "as100-03-03": {
    k2: "Decompose 69 − 25 by place: subtract tens from tens and ones from ones. What remains?",
    ch1: "Check 95 − 63 with related addition: 63 + ? = 95. Enter the missing addend.",
  },
  "as100-05-01": {
    k2: "Inspect only the ones digit of 57. Can all counters pair with none left over: odd or even?",
    k3: "Thirty counters form 15 complete pairs. Classify 30 as odd or even.",
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
if (files.length !== 16) throw new Error(`expected 16 course lessons, found ${files.length}`);
if (PROMPTS[EXCLUDED]) throw new Error(`${EXCLUDED} must remain outside this packet`);

let changed = 0;
const packetHashes = [];
for (const file of files) {
  const full = path.join(DIR, file);
  const before = fs.readFileSync(full, "utf8");
  const lesson = JSON.parse(before);
  const stableIds = JSON.stringify(lesson.steps.map((candidate) => candidate.id));
  const evaluators = evaluatorSeal(lesson);
  const semanticBefore = JSON.stringify(lesson);
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
console.log(`${CHECK ? "CHECK" : "REPAIR"} add-subtract-100 P1 progression: ${changed ? `${changed} owned lessons need repair` : "CURRENT"}; 11 source closures; 2 excluded dirty rows; packet seal ${packetSeal}`);
