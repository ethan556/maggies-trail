import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)), "..");
const lessonDir = join(root, "content", "courses", "fraction-division-g5", "lessons");
const files = readdirSync(lessonDir).filter((file) => file.endsWith(".json")).sort();
const errors = [];
let releasedBindings = 0;
const source = [];

for (const file of files) {
  const raw = readFileSync(join(lessonDir, file), "utf8");
  source.push(`${file}\0${raw}`);
  const lesson = JSON.parse(raw);
  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2) errors.push(`${lesson.id}: expected exactly two concept steps`);
  for (const step of concepts) {
    if (step.figure !== undefined) errors.push(`${lesson.id}/${step.id}: fixed visual must remain withheld until an exact fraction-division figure exists`);
    releasedBindings += 1;
  }
}

if (files.length !== 12) errors.push(`expected 12 lesson files, found ${files.length}`);
if (releasedBindings !== 24) errors.push(`expected 24 released count-on-hops bindings, found ${releasedBindings}`);
if (errors.length) throw new Error(errors.join("\n"));

const sourceSeal = createHash("sha256").update(source.join("\n"), "utf8").digest("hex");
console.log(`FRACTION_DIVISION_G5_VISUAL_REPAIR_${process.argv.includes("--check") ? "CURRENT" : "VALID"} lessons=${files.length} releasedBindings=${releasedBindings} sourceSeal=${sourceSeal}`);
