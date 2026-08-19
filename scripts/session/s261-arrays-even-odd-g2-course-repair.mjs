import fs from "node:fs";
import path from "node:path";

const exact = new Map([
  ["g2a-02-03:c1", "mult3-flip"], ["g2a-02-03:c2", "mult3-flip"],
  ["g2a-03-02:c1", "mult3-flip"], ["g2a-03-02:c2", "mult3-flip"],
]);
const obsolete = new Set(["g2a-02-02:c1", "g2a-02-02:c2", "g2a-03-01:c1"]);
const dir = "content/courses/arrays-even-odd-g2/lessons";
let changed = 0;
for (const name of fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort()) {
  const file = path.join(dir, name), lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const step of lesson.steps ?? []) {
    const wanted = exact.get(`${lesson.id}:${step.id}`);
    if (step.figure === "count-on-hops") { wanted ? step.figure = wanted : delete step.figure; changed += 1; }
    else if (obsolete.has(`${lesson.id}:${step.id}`) && step.figure === "mult3-array") { delete step.figure; changed += 1; }
    else if (wanted && step.figure !== wanted) throw new Error(`${file}/${step.id}: unexpected ${step.figure}`);
  }
  fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}
if (changed !== 0 && changed !== 3 && changed !== 20) throw new Error(`expected 0 or 20 repairs, got ${changed}`);
console.log(`S261 arrays-even-odd-g2: 4 exact rebindings + 16 fail-closures sealed`);
