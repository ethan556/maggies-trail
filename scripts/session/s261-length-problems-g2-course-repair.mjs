import fs from "node:fs";
import path from "node:path";

const exact = new Map([
  ["g2p-01-01:c1", "mmt-how-much-longer"], ["g2p-01-01:c2", "mmt-how-much-longer"],
  ["g2p-01-03:c1", "mmt-any-start"], ["g2p-01-03:c2", "mmt-any-start"],
  ["g2p-03-02:c1", "number-line-jumps"], ["g2p-03-02:c2", "number-line-jumps"],
]);
const dir = "content/courses/length-problems-g2/lessons";
let changed = 0;
for (const name of fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort()) {
  const file = path.join(dir, name), lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const step of lesson.steps ?? []) {
    const wanted = exact.get(`${lesson.id}:${step.id}`);
    if (step.figure === "count-on-hops") { wanted ? step.figure = wanted : delete step.figure; changed += 1; }
    else if (wanted && step.figure !== wanted) throw new Error(`${file}/${step.id}: unexpected ${step.figure}`);
  }
  fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}
if (changed !== 0 && changed !== 20) throw new Error(`expected 0 or 20 repairs, got ${changed}`);
console.log("S261 length-problems-g2: 6 exact rebindings + 14 fail-closures sealed");
