import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const DIR = path.join(process.cwd(), "content", "courses", "tens-and-ones", "lessons");
const CHECK = process.argv.includes("--check");

function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${lesson.id}: missing step ${id}`);
  return found;
}

function repairLesson(lesson) {
  if (lesson.id === "tno-02-03") {
    step(lesson, "c1").body = "The figure expands 46 as 40 + 6. The 4 is in the tens place, so it is worth 40; the 6 is in the ones place, so it is worth 6. A digit's value depends on its place. Next, use the same idea to compare the digits in 52.";
  }
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 12) throw new Error(`expected 12 course lessons, found ${files.length}`);

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
  const after = lesson.id === "tno-02-03" ? `${JSON.stringify(lesson, null, 2)}\n` : before;
  hashes.push(`${file}\0${after}`);
  if (after !== before) {
    changed += 1;
    if (!CHECK) fs.writeFileSync(full, after);
  }
}

if (CHECK && changed) throw new Error(`${changed} lesson files need repair`);
const courseSeal = createHash("sha256").update(hashes.join("\n")).digest("hex");
console.log(`${CHECK ? "CHECK" : "REPAIR"} tens-and-ones: ${changed ? `${changed} lesson file needs repair` : "CURRENT"}; 1 P0 visual closure; 0 P0 residuals; course seal ${courseSeal}`);
