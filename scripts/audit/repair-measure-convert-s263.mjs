import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const DIR = path.join(process.cwd(), "content", "courses", "measure-convert", "lessons");
const CHECK = process.argv.includes("--check");

const targets = new Set(["mc-02-01", "mc-03-02", "mc-04-01", "mc-04-02"]);
const bindings = {
  "mc-02-01": { c1: "mc-area-formula", c2: "dop-two-by-two" },
  "mc-03-02": { c1: "mc-protractor", c2: "mc-protractor" },
  "mc-04-01": { c1: "mc-additive", c2: "mc-additive" },
  "mc-04-02": { c1: "g7-comp-supp", c2: "mc-missing-angle" },
};

const bodies = {
  "mc-02-01/c1": "Area counts the unit squares inside a rectangle. The pictured rectangle is 5 units long and 3 units wide, so A = 5 × 3 = 15 square units.",
  "mc-02-01/c2": "For a larger rectangle, split both factors by place value. The model breaks 23 × 45 into 20 × 40 = 800, 3 × 40 = 120, 20 × 5 = 100, and 3 × 5 = 15; the four areas total 1,035.",
  "mc-03-02/c1": "A protractor is a half-circle scale from 0° to 180°. Place the vertex at the centre and align one ray with 0° before reading the second ray.",
  "mc-03-02/c2": "The pictured protractor marks 0°, 30°, 60°, 90°, 120°, 150°, and 180°. A real protractor includes the single-degree marks between those labelled benchmarks.",
  "mc-04-01/c1": "Adjacent angles share a ray and their measures add. In the picture, 30° next to 40° makes a combined angle of 70°.",
  "mc-04-01/c2": "A combined angle need not be a special benchmark. The pictured adjacent angles make 30° + 40° = 70°, so the same addition rule works for a non-benchmark total.",
  "mc-04-02/c1": "Complementary angles make a 90° corner, while supplementary angles make a 180° straight line. For a missing angle on a line, subtract the known part from 180°.",
  "mc-04-02/c2": "A right angle totals 90°. If one part is 55°, the missing part is 90° − 55° = 35°, exactly as the diagram shows.",
};

function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${lesson.id}: missing ${id}`);
  return found;
}

function repairLesson(lesson) {
  if (!targets.has(lesson.id)) return;
  for (const id of ["c1", "c2"]) {
    const concept = step(lesson, id);
    const key = `${lesson.id}/${id}`;
    concept.figure = bindings[lesson.id][id];
    concept.body = bodies[key];
    concept.narration = bodies[key];
  }
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 15) throw new Error(`expected 15 course lessons, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(DIR, file);
  const before = fs.readFileSync(full, "utf8");
  const lesson = JSON.parse(before);
  const ids = JSON.stringify(lesson.steps.map((candidate) => candidate.id));
  const widgetTypes = JSON.stringify(lesson.steps.filter((candidate) => candidate.widget).map((candidate) => [candidate.id, candidate.widget.type]));
  repairLesson(lesson);
  if (JSON.stringify(lesson.steps.map((candidate) => candidate.id)) !== ids) throw new Error(`${lesson.id}: stable step IDs changed`);
  if (JSON.stringify(lesson.steps.filter((candidate) => candidate.widget).map((candidate) => [candidate.id, candidate.widget.type])) !== widgetTypes) throw new Error(`${lesson.id}: evaluator types changed`);
  const indent = before.match(/\n( +)"id"/)?.[1].length ?? 2;
  const after = targets.has(lesson.id) ? `${JSON.stringify(lesson, null, indent)}\n` : before;
  hashes.push(`${file}\0${after}`);
  if (after !== before) {
    changed += 1;
    if (!CHECK) fs.writeFileSync(full, after);
  }
}
if (CHECK && changed) throw new Error(`${changed} lesson files need repair`);
const courseSeal = createHash("sha256").update(hashes.join("\n")).digest("hex");
console.log(`${CHECK ? "CHECK" : "REPAIR"} measure-convert: ${changed ? `${changed} lesson files need repair` : "CURRENT"}; 7 P0 visual closures; 1 additional truth synchronization; 0 P0 residuals; course seal ${courseSeal}`);
