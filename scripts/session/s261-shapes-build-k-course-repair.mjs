import fs from "node:fs";
import path from "node:path";

const lessonsDir = "content/courses/shapes-build-k/lessons";
let removed = 0;
for (const name of fs.readdirSync(lessonsDir).filter((file) => file.endsWith(".json")).sort()) {
  const file = path.join(lessonsDir, name);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const step of lesson.steps ?? []) {
    if (step.figure === "count-on-hops") {
      delete step.figure;
      removed += 1;
    } else if (step.figure !== undefined) {
      throw new Error(`${file}/${step.id}: unexpected figure ${step.figure}`);
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}
if (removed !== 0 && removed !== 28) throw new Error(`expected 0 or 28 repairs, got ${removed}`);
console.log(`S261 shapes-build-k: ${removed || 28} misleading arithmetic figure placements absent`);
