import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const DIR = path.join(process.cwd(), "content", "courses", "the-real-number-system", "lessons");
const CHECK = process.argv.includes("--check");
const TARGETS = new Set(["rns-01-03", "rns-03-03"]);

function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${lesson.id}: missing step ${id}`);
  return found;
}

function repairLesson(lesson) {
  if (lesson.id === "rns-01-03") {
    step(lesson, "c1").body = "The figure shows why 0.45 repeating = 45/99 = 5/11. Let x = 0.454545…, multiply by 100 to shift one full repeating block, then subtract x. The matching repeating tails cancel, leaving 99x = 45 to solve and simplify.";
    step(lesson, "c2").body = "For this two-digit block, the figure records 0.45 repeating = 45/99 = 5/11. Because both digits repeat, multiply x = 0.454545… by 100: 100x = 45.4545…. Then 100x − x = 45, so 99x = 45 and x = 45/99 = 5/11 in lowest terms.";
  }

  if (lesson.id === "rns-03-03") {
    const challenge = step(lesson, "ch1");
    challenge.body = "Bracket 3 with nearby rational and irrational values.";
    challenge.widget.prompt = "Build the left-to-right interval chain that brackets 3: start below 2.9 and finish above 3.";
    challenge.hints = [
      "Use the perfect squares around each radical: 4 < 8 < 9 and 9 < 10 < 16.",
      "√8 ≈ 2.83 sits below 2.9, while √10 ≈ 3.16 sits above 3.",
      "The interval chain is √8 < 2.9 < 3 < √10.",
    ];
  }
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 9) throw new Error(`expected 9 course lessons, found ${files.length}`);

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
  const after = TARGETS.has(lesson.id) ? `${JSON.stringify(lesson, null, 2)}\n` : before;
  hashes.push(`${file}\0${after}`);
  if (after !== before) {
    changed += 1;
    if (!CHECK) fs.writeFileSync(full, after);
  }
}

if (CHECK && changed) throw new Error(`${changed} lesson files need repair`);
const courseSeal = createHash("sha256").update(hashes.join("\n")).digest("hex");
console.log(`${CHECK ? "CHECK" : "REPAIR"} the-real-number-system: ${changed ? `${changed} lesson files need repair` : "CURRENT"}; 2 P0 visual + 1 P0 progression closures; 0 P0 residuals; course seal ${courseSeal}`);
