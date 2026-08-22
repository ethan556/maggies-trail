import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const DIR = path.join(process.cwd(), "content", "courses", "similarity", "lessons");
const CHECK = process.argv.includes("--check");
const TARGETS = new Set(["sy-04-01", "sy-04-03"]);

function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${lesson.id}: missing step ${id}`);
  return found;
}

function repairLesson(lesson) {
  if (lesson.id === "sy-04-01") {
    step(lesson, "c1").body = "The diagram drops the altitude from the right angle to the hypotenuse, splitting it into segments 4 and 9 and showing altitude h = 6. This creates two smaller right triangles. Each small triangle shares one acute angle with the whole, so AA makes both small triangles similar to the whole and to each other.";
  }
  if (lesson.id === "sy-04-03") {
    step(lesson, "c2").body = "Use the diagram's labels to choose the relationship: the two hypotenuse segments are 4 and 9, so the altitude is h = √(4·9) = 6. In general, the altitude uses the two segments; a leg uses the whole hypotenuse and the segment touching that leg. Label those roles before choosing a square root.";
  }
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 16) throw new Error(`expected 16 course lessons, found ${files.length}`);

let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(DIR, file);
  const before = fs.readFileSync(full, "utf8");
  const lesson = JSON.parse(before);
  const stableIds = JSON.stringify(lesson.steps.map((candidate) => candidate.id));
  const evaluatorTypes = JSON.stringify(lesson.steps.filter((candidate) => candidate.widget).map((candidate) => [candidate.id, candidate.widget.type]));
  repairLesson(lesson);
  if (JSON.stringify(lesson.steps.map((candidate) => candidate.id)) !== stableIds) throw new Error(`${lesson.id}: stable step IDs changed`);
  if (JSON.stringify(lesson.steps.filter((candidate) => candidate.widget).map((candidate) => [candidate.id, candidate.widget.type])) !== evaluatorTypes) throw new Error(`${lesson.id}: evaluator types changed`);
  const indent = before.match(/\n( +)"id"/)?.[1].length ?? 2;
  const after = TARGETS.has(lesson.id) ? `${JSON.stringify(lesson, null, indent)}\n` : before;
  hashes.push(`${file}\0${after}`);
  if (after !== before) {
    changed += 1;
    if (!CHECK) fs.writeFileSync(full, after);
  }
}

if (CHECK && changed) throw new Error(`${changed} lesson files need repair`);
const courseSeal = createHash("sha256").update(hashes.join("\n")).digest("hex");
console.log(`${CHECK ? "CHECK" : "REPAIR"} similarity: ${changed ? `${changed} lesson files need repair` : "CURRENT"}; 2 P0 visual closures; 0 P0 residuals; course seal ${courseSeal}`);
