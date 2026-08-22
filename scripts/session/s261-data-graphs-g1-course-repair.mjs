import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/data-graphs-g1/lessons";
let removed = 0;
for (const name of fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort()) {
  const file = path.join(dir, name);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const step of lesson.steps ?? []) {
    if (step.figure === "bar-compare") { delete step.figure; removed += 1; }
    else if (step.figure !== undefined) throw new Error(`${file}/${step.id}: unexpected figure ${step.figure}`);
  }
  fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}
if (removed !== 0 && removed !== 24) throw new Error(`expected 0 or 24 repairs, got ${removed}`);
console.log(`S261 data-graphs-g1: ${removed || 24} hard-coded exemplar bindings absent`);
