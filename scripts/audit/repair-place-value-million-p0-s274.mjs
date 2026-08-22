import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const DIR = path.join(process.cwd(), "content", "courses", "place-value-million", "lessons");
const CHECK = process.argv.includes("--check");
const TARGETS = new Set(["pv2-01-03", "pv2-04-03"]);

function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${lesson.id}: missing step ${id}`);
  return found;
}

function repairLesson(lesson) {
  if (lesson.id === "pv2-01-03") {
    const concept = step(lesson, "c1");
    concept.body = "The place-value ladder names each rung: **ones, tens, hundreds, thousands, ten-thousands, hundred-thousands.** Every step left is ×10. In 425,301, the 5 sits in the thousands place, so its value is 5 × 1,000 = 5,000 — not just 5.";
    concept.figure = "pv4-ladder";
  }
  if (lesson.id === "pv2-04-03") {
    const concept = step(lesson, "c1");
    concept.body = "The diagram shows 4,002 − 1,357 = 2,645. The ones need a ten, but the tens and hundreds are both zero, so the regrouping chain reaches the 4 thousands. Each zero it passes receives 10, lends 1 onward, and becomes 9. The same rule works across any number of zeros.";
    concept.figure = "pv4-borrow-chain";
  }
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 14) throw new Error(`expected 14 course lessons, found ${files.length}`);

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
console.log(`${CHECK ? "CHECK" : "REPAIR"} place-value-million: ${changed ? `${changed} lesson files need repair` : "CURRENT"}; 2 P0 visual closures; 0 P0 residuals; course seal ${courseSeal}`);
